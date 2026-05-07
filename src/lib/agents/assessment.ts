// ============================================================
// AI-CDIO — Assessment Agent
// Runs the 16-module maturity diagnostic, scores responses,
// and detects divergence between stakeholders
// ============================================================

import Anthropic from "@anthropic-ai/sdk";
import { getModuleContext, searchPlaybook } from "@/lib/playbook/retrieve";
import type {
  MaturityLevel,
  DiagnosticResponse,
  ModuleScore,
  OrgSize,
  Industry,
} from "@/types";
import { MODULE_NAMES } from "@/types";

/**
 * Phase 1C: a narrative + path-to-next-level pair generated post-scoring.
 * Persisted on module_scores.narrative + module_scores.path_to_next_level
 * (schema v9). Surfaced in the workspace dashboard as the human-readable
 * "this is why you scored where you did and this is how to climb" view.
 */
export interface NarrativeAndPath {
  narrative: string;
  path_to_next_level: Array<{
    action: string;
    source: string;
  }>;
}

const anthropic = new Anthropic();

// --- System prompt encoding the playbook's assessment logic ---

const ASSESSMENT_SYSTEM_PROMPT = `You are the Assessment Agent of the AI-CDIO system. Your role is to objectively evaluate an organization's digital maturity across 16 competency modules.

## Your Assessment Framework

You use a 5-level maturity scale (CMMI-aligned):
- Level 1 (Initial): Ad hoc, reactive, minimal capability. No formal processes.
- Level 2 (Developing): Some processes exist but inconsistent execution. Partial documentation.
- Level 3 (Defined): Documented processes with reliable execution. Good documentation and governance.
- Level 4 (Managed): Measured, controlled, consistent outcomes. Data-driven decisions with established metrics.
- Level 5 (Optimizing): Continuous improvement, innovative, industry-leading. Proactive optimization culture.

## Scoring Rules

1. Score based on EVIDENCE, not claims. "We have a strategy" without documentation = Level 2, not Level 3.
2. A "partial" answer to a diagnostic question counts as 0.5 (between yes=1 and no=0).
3. An "na" answer means the respondent could not speak to that question — EXCLUDE it from the denominator entirely. Do not treat N/A as a low score.
4. If every answer is "na", you cannot score the module. Return maturity_score=null and explain that the respondent abstained.
5. The maturity score for a module = the level that best matches the majority of NON-N/A diagnostic responses.
6. If diagnostic responses are split (e.g., 4 yes, 4 no), score at the LOWER level and note the gap.
7. Always provide specific evidence citations for your scoring rationale.

## The 16 Modules

${Object.entries(MODULE_NAMES)
  .map(([num, name]) => `Module ${num}: ${name}`)
  .join("\n")}

## Output Format

For each module assessed, provide:
1. maturity_score: integer 1-5
2. evidence: specific observations supporting the score
3. key_gaps: what would move them to the next level
4. recommended_actions: 2-3 concrete next steps

Be OBJECTIVE. Do not soften scores to avoid conflict. The value of this system is honest, data-driven assessment. Frame gaps as opportunities, not failures.`;

// --- Score a single module based on diagnostic responses ---

export async function scoreModule(
  moduleNumber: number,
  diagnosticResponses: DiagnosticResponse[],
  orgContext: {
    size: OrgSize;
    industry: Industry;
    employee_count: number;
  }
): Promise<{
  maturity_score: MaturityLevel | null;
  evidence: string;
  key_gaps: string[];
  recommended_actions: string[];
  module_skipped: boolean;
}> {
  // Phase 1C: short-circuit when every response is N/A. The respondent
  // explicitly couldn't speak to this module — calling the LLM would
  // burn tokens and risk it inventing a score from thin air.
  const nonNa = diagnosticResponses.filter((r) => r.answer !== "na");
  if (nonNa.length === 0) {
    return {
      maturity_score: null,
      evidence: diagnosticResponses.length === 0
        ? "No responses provided."
        : `Stakeholder abstained on all ${diagnosticResponses.length} questions in this module.`,
      key_gaps: [],
      recommended_actions: [],
      module_skipped: true,
    };
  }
  const moduleName = MODULE_NAMES[moduleNumber] ?? `Module ${moduleNumber}`;

  // Retrieve playbook context for this module via RAG
  let playbookContext = "";
  try {
    playbookContext = await getModuleContext(moduleNumber);
  } catch {
    // RAG retrieval is optional — continue without it
  }

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: ASSESSMENT_SYSTEM_PROMPT + (playbookContext ? `\n\n## Playbook Reference for This Module\n${playbookContext.substring(0, 3000)}` : ""),
    messages: [
      {
        role: "user",
        content: `Score Module ${moduleNumber}: ${moduleName}

Organization Context:
- Size: ${orgContext.size} (${orgContext.employee_count} employees)
- Industry: ${orgContext.industry}

Diagnostic Responses:
${diagnosticResponses
  .map(
    (r) =>
      `- ${r.question_text}: ${r.answer}${r.evidence ? ` (Evidence: ${r.evidence})` : ""}`
  )
  .join("\n")}

Provide your assessment as JSON:
{
  "maturity_score": <1-5>,
  "evidence": "<specific observations>",
  "key_gaps": ["<gap1>", "<gap2>"],
  "recommended_actions": ["<action1>", "<action2>", "<action3>"]
}`,
      },
    ],
  });

  const responseText =
    message.content[0].type === "text" ? message.content[0].text : "";

  // Extract JSON from response
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error(`Failed to parse assessment response for module ${moduleNumber}`);
  }

  const parsed = JSON.parse(jsonMatch[0]);

  // The model may legitimately return null when every answer was N/A
  // (we already short-circuited above, but defensive in case the v2
  // schema sneaks N/A through downstream).
  const score = parsed.maturity_score == null
    ? null
    : (Math.min(5, Math.max(1, parsed.maturity_score)) as MaturityLevel);

  return {
    maturity_score: score,
    evidence: parsed.evidence ?? "",
    key_gaps: parsed.key_gaps ?? [],
    recommended_actions: parsed.recommended_actions ?? [],
    module_skipped: score === null,
  };
}

// --- Generate per-stakeholder narrative + path-to-next-level ---
//
// Called after scoreModule() lands a maturity_score. Two outputs in one
// LLM call (cheaper + more coherent than two roundtrips):
//
//   1. narrative — 3-4 sentences in CDIO voice explaining WHY this
//      respondent landed at this level. References specific responses,
//      not generic boilerplate. Reads like an executive summary, not
//      a spreadsheet.
//
//   2. path_to_next_level — exactly 3 concrete actions that move the
//      respondent's view of the org from current_level → current_level + 1.
//      Each action is paired with a "source" — the framework reference
//      from the question, or a short playbook citation. Action is
//      "Monday-morning actionable", not aspirational.
//
// Skipped (returns empty defaults) when:
//   - maturity_score is null (N/A or skipped module)
//   - maturity_score is 5 (no next level to climb to)
export async function generateNarrativeAndPath(
  moduleNumber: number,
  maturityScore: MaturityLevel | null,
  diagnosticResponses: DiagnosticResponse[],
  evidence: string,
  keyGaps: string[],
  orgContext: { size: OrgSize; industry: Industry; employee_count: number }
): Promise<NarrativeAndPath> {
  // Edge cases — no narrative / no path
  if (maturityScore == null) {
    return { narrative: "", path_to_next_level: [] };
  }

  const moduleName = MODULE_NAMES[moduleNumber] ?? `Module ${moduleNumber}`;

  // For Level 5 we still write the narrative ("you're industry-leading")
  // but the path is empty — there's no next level by definition.
  const isAtCeiling = maturityScore === 5;

  // RAG: pull playbook chunks specifically relevant to "moving from L<n>
  // to L<n+1> in <module>". The query string nudges retrieval toward
  // remediation/recommendation chunks rather than overview chunks.
  let pathContext = "";
  if (!isAtCeiling) {
    try {
      const targetLevel = maturityScore + 1;
      const chunks = await searchPlaybook(
        `${moduleName} level ${targetLevel} recommendation action quick win`,
        {
          moduleNumbers: [moduleNumber],
          limit: 4,
        }
      );
      pathContext = chunks
        .slice(0, 4)
        .map((c) => `[${c.metadata.section_title}]\n${c.content.substring(0, 600)}`)
        .join("\n\n---\n\n");
    } catch {
      // RAG retrieval is optional — proceed without it
    }
  }

  // Compose responses + key-gap summary so the model has structured data
  // to anchor on. Limit to a sane size to keep token cost predictable.
  const responseSummary = diagnosticResponses
    .slice(0, 20)
    .map((r) => `- ${r.question_text} → ${r.answer}${r.evidence ? ` (note: ${r.evidence})` : ""}`)
    .join("\n");

  const prompt = `Generate a narrative summary and path-to-next-level for a stakeholder's assessment of:

Module ${moduleNumber}: ${moduleName}
Stakeholder scored: Level ${maturityScore}${isAtCeiling ? " (already at ceiling — no path required)" : ` (target: Level ${maturityScore + 1})`}

Organization: ${orgContext.size} (${orgContext.employee_count} employees), ${orgContext.industry}

Their responses:
${responseSummary}

Computed evidence summary: ${evidence}
Key gaps identified: ${keyGaps.length > 0 ? keyGaps.join("; ") : "none"}

${pathContext ? `## Playbook reference\n${pathContext.substring(0, 2400)}` : ""}

Produce JSON:
{
  "narrative": "<3-4 sentences in the voice of a fractional CDIO. Explain WHY they're at Level ${maturityScore} citing specific evidence from their responses. Avoid generic statements. Be direct but not harsh.>",
  "path_to_next_level": ${isAtCeiling
      ? "[]"
      : `[
    { "action": "<concrete action Monday-morning actionable, 1 sentence>", "source": "<framework reference like 'NIST CSF v2.0 PR.AA' or a short playbook citation>" },
    { "action": "...", "source": "..." },
    { "action": "...", "source": "..." }
  ]`}
}

CRITICAL: Each action must be specific and outcome-oriented. Bad: "Improve security posture." Good: "Roll out phishing-resistant MFA (FIDO2 keys) for all admin accounts within 30 days."`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system:
      "You are a fractional CDIO writing for a small/mid-size business CEO. Direct, evidence-anchored, never generic. Cite frameworks and the playbook when you can.",
    messages: [{ role: "user", content: prompt }],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return { narrative: "", path_to_next_level: [] };
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]);
    const narrative = typeof parsed.narrative === "string" ? parsed.narrative.trim() : "";
    const pathRaw = Array.isArray(parsed.path_to_next_level) ? parsed.path_to_next_level : [];
    const path = pathRaw
      .filter((p: unknown): p is { action: string; source: string } =>
        typeof p === "object" && p !== null &&
        typeof (p as { action: unknown }).action === "string" &&
        typeof (p as { source: unknown }).source === "string"
      )
      .slice(0, 3);
    return { narrative, path_to_next_level: path };
  } catch {
    return { narrative: "", path_to_next_level: [] };
  }
}

// --- Generate adaptive follow-up questions based on initial responses ---

export async function generateFollowUpQuestions(
  moduleNumber: number,
  initialResponses: DiagnosticResponse[],
  currentScore: MaturityLevel
): Promise<string[]> {
  const moduleName = MODULE_NAMES[moduleNumber] ?? `Module ${moduleNumber}`;

  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 512,
    system:
      "You are the Assessment Agent. Generate 2-3 focused follow-up questions to clarify a module's maturity score. Questions should probe for specific evidence.",
    messages: [
      {
        role: "user",
        content: `Module: ${moduleName}
Current score: Level ${currentScore}
Initial responses: ${JSON.stringify(initialResponses)}

Generate 2-3 follow-up questions that would help determine if the score should be higher or lower. Return as a JSON array of strings.`,
      },
    ],
  });

  const responseText =
    message.content[0].type === "text" ? message.content[0].text : "[]";

  const jsonMatch = responseText.match(/\[[\s\S]*\]/);
  return jsonMatch ? JSON.parse(jsonMatch[0]) : [];
}

// --- Generate a Decision Package for a divergence point ---

export async function generateDecisionPackage(
  moduleNumber: number,
  moduleName: string,
  stakeholderA: { name: string; role: string; score: MaturityLevel; evidence: string },
  stakeholderB: { name: string; role: string; score: MaturityLevel; evidence: string },
  orgContext: { size: OrgSize; industry: Industry; employee_count: number }
): Promise<{
  framework_recommendation: string;
  projected_roi: string;
  alignment_suggestion: string;
}> {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: `You are the Decision Facilitation Agent. Your job is to help leadership teams align on technology decisions OBJECTIVELY.

CRITICAL RULES:
- NEVER say one stakeholder is "right" or "wrong"
- Present data and framework logic, not opinions
- Frame as "the evidence suggests..." not "you should..."
- Show projected consequences of each path
- Propose a synthesis that addresses both perspectives`,
    messages: [
      {
        role: "user",
        content: `Divergence detected on Module ${moduleNumber}: ${moduleName}

${stakeholderA.name} (${stakeholderA.role}): Scored Level ${stakeholderA.score}
Evidence: ${stakeholderA.evidence}

${stakeholderB.name} (${stakeholderB.role}): Scored Level ${stakeholderB.score}
Evidence: ${stakeholderB.evidence}

Organization: ${orgContext.size} (${orgContext.employee_count} employees), ${orgContext.industry}

Produce a Decision Package as JSON:
{
  "framework_recommendation": "<what the playbook framework recommends for this org profile>",
  "projected_roi": "<estimated ROI impact of addressing vs deferring this module>",
  "alignment_suggestion": "<a synthesis path that addresses both stakeholders' perspectives>"
}`,
      },
    ],
  });

  const responseText =
    message.content[0].type === "text" ? message.content[0].text : "";

  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to parse decision package response");
  }

  return JSON.parse(jsonMatch[0]);
}
