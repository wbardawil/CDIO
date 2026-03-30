// ============================================================
// AI-CDIO — Assessment Agent
// Runs the 16-module maturity diagnostic, scores responses,
// and detects divergence between stakeholders
// ============================================================

import Anthropic from "@anthropic-ai/sdk";
import { getModuleContext } from "@/lib/playbook/retrieve";
import type {
  MaturityLevel,
  DiagnosticResponse,
  ModuleScore,
  OrgSize,
  Industry,
} from "@/types";
import { MODULE_NAMES } from "@/types";

const anthropic = new Anthropic();

// --- System prompt encoding the playbook's assessment logic ---

const ASSESSMENT_SYSTEM_PROMPT = `You are the Assessment Agent of the AI-CDIO system. Your role is to objectively evaluate an organization's digital maturity across 16 competency modules.

## Your Assessment Framework

You use a 4-level maturity scale:
- Level 1 (Beginner): Ad hoc, reactive, minimal capability. No formal processes.
- Level 2 (Developing): Some processes exist but inconsistent execution. Partial documentation.
- Level 3 (Proficient): Defined processes with reliable execution. Good documentation and governance.
- Level 4 (Advanced): Optimized, innovative, industry-leading. Continuous improvement culture.

## Scoring Rules

1. Score based on EVIDENCE, not claims. "We have a strategy" without documentation = Level 2, not Level 3.
2. A "partial" answer to a diagnostic question counts as 0.5 (between yes=1 and no=0).
3. The maturity score for a module = the level that best matches the majority of diagnostic responses.
4. If diagnostic responses are split (e.g., 4 yes, 4 no), score at the LOWER level and note the gap.
5. Always provide specific evidence citations for your scoring rationale.

## The 16 Modules

${Object.entries(MODULE_NAMES)
  .map(([num, name]) => `Module ${num}: ${name}`)
  .join("\n")}

## Output Format

For each module assessed, provide:
1. maturity_score: integer 1-4
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
  maturity_score: MaturityLevel;
  evidence: string;
  key_gaps: string[];
  recommended_actions: string[];
}> {
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
  "maturity_score": <1-4>,
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

  return {
    maturity_score: Math.min(4, Math.max(1, parsed.maturity_score)) as MaturityLevel,
    evidence: parsed.evidence,
    key_gaps: parsed.key_gaps ?? [],
    recommended_actions: parsed.recommended_actions ?? [],
  };
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
