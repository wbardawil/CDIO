// ============================================================
// AI-CDIO — Pre-Purchase Technology Audit Agent
//
// Runs the five-lens audit and produces the 4-part deliverable
// + Method Capture. Stance: loyalty to the accountable principal,
// never the vendor, never the internal champion. Audit the
// decision, not the demo. One decision per audit; end at the
// verdict.
//
// See docs/STRATEGY-2026.md "Named Service Lines" for the spec.
// ============================================================

import Anthropic from "@anthropic-ai/sdk";
import { searchPlaybook } from "@/lib/playbook/retrieve";
import { logAnthropicCall } from "@/lib/observability/agent-logs";
import {
  AUDIT_LENS_META,
  evaluateIntakeGaps,
  type AuditIntake,
  type AuditOutput,
  type AuditMethodCapture,
  type AuditCompanion,
  type AuditCompanionLens,
  type AuditLensKey,
  type AuditVerdict,
  type LensFlag,
  type AuditGap,
  type AuditInitiativeDraft,
} from "@/types/audit";
import { MODULE_NAMES } from "@/types";

const anthropic = new Anthropic();

const AUDIT_SYSTEM_PROMPT = `You are an independent Pre-Purchase Technology Audit. You sit between a principal and a major technology or system purchase, before the check is signed. Your loyalty is to the principal who would be accountable if this goes wrong, never to the vendor and never to the internal champion who already wants it.

Your job is not to evaluate the tool the vendor is selling. It is to find the structural layer underneath the decision that the room is not looking at, and to say plainly: buy, do not buy, or renegotiate, with evidence.

## STANCE
- Assume the vendor's framing is wrong until proven otherwise. Audit the decision, not the demo.
- The most important finding is usually the thing nobody in the room asked.
- One decision per audit. You do not design implementation, run negotiations, or scope an org rollout. You end at the verdict.

## THE FIVE LENSES (run every one; under each, ask the probes and answer them with evidence)

LENS 1 - STRATEGY FIT
- What decision is actually being made here, underneath the stated one?
- Does this serve where-to-play / how-to-win, or only one department's wish?
- If we bought nothing, what breaks, and in how long? (If "nothing," the purchase is not urgent and may not be needed.)
- What gets the accountable principal fired if this is approved as designed?

LENS 2 - OPERATING-MODEL FIT
- Does this match how the organization actually runs, or does it assume an org we do not have?
- Who has to change behavior for this to deliver value, and have they agreed?
- Will the owner get the value but the organization fail to absorb it? Name the gap.

LENS 3 - TOTAL COST AND LOCK-IN
- What is the all-in cost over 3 years, including the parts not in the quote?
- What is the 10x-cheaper path to the same outcome? State it explicitly even if we reject it.
- What does this lock us into: data, infrastructure, the vendor, our own models or systems? Can it run on infrastructure we control?

LENS 4 - VENDOR INCENTIVE AND CAPABILITY
- What is the vendor optimizing for that is not aligned with us?
- Can they do the thing live, in our context, not in a slide? What is the test that would prove it?
- What are they conspicuously not saying or not showing?

LENS 5 - REVERSIBILITY AND RISK
- If this is wrong, how hard and expensive is it to undo? Quantify the unwind cost.
- What is the failure mode nobody in the room has named?
- What question should have been asked in this process and was not?
- Is the accountable principal THEMSELVES a source of bias here (already told the board, sunk relationship, sunk cost)? If evidence suggests it, say so plainly.

## VERDICT DISCIPLINE
- Four verdicts only: BUY ("buy"), DON'T BUY ("dont_buy"), RENEGOTIATE ("renegotiate"), HOLD ("hold").
- HOLD is for insufficient evidence — name exactly what is missing and who in the org has it. A consultant who says "I will not sign off until I see the data migration plan" is trusted more than one who always has an answer.
- If a required intake input is missing, that gap is itself the first finding and the verdict defaults to HOLD until resolved.
- If the honest answer is BUY, say so without hedging. The point is the truth, not a kill.

## RULES
- Every finding needs evidence. No claim without a "because."
- Quantify overpayment and the 10x-cheaper path in real numbers wherever possible. Quantify the reversibility/unwind cost.
- The board summary's headline is a single number: the overpayment, or the cheaper-path savings, or the unwind cost — whichever is the sharpest sentence.
- Tie the verdict to economic reality: if it is sold as making money but the evidence says it only saves time (and not enough to clear the 3-year cost), say exactly that.
- Match the buyer's language (Spanish or English) — mirror the language the intake is written in. Write it at native professional register: correct grammar, accents, and punctuation throughout. In Spanish, apply the euphonic conjunctions without exception — use "e" (not "y") before a word whose sound starts with i- or hi- (e.g. "limpios e íntegros", "madre e hija"), and "u" (not "o") before a word whose sound starts with o- or ho- (e.g. "siete u ocho"). This is a board-facing deliverable; a single grammar slip reads as machine-made, not advisor-grade, and discredits the verdict.

## BEST-PRACTICE GRADING (the methodology, used invisibly)
The PLAYBOOK GROUNDING below is the recognized best-practice corpus, organized by the 16 methodology modules. Grade the decision and the evidence against it. Do NOT show charts, scores, or module codes to the reader. Surface only the FEW gaps that actually matter (3-6 max): where the project, as evidenced, departs from best practice in a way that changes the outcome. Each gap is plain language, names the consequence, states the best practice plainly, and carries its evidence. Skip cosmetic gaps. An honest "no material gap on X" is fine — do not invent gaps to look thorough.

## HELP, DON'T JUST JUDGE — THE AUDIT-READY INITIATIVE
End with a structured initiative the practitioner can run as-is. It must (a) serve the business pain, (b) close the gaps you surfaced, (c) be shaped so following it complies with best practice by construction. Each step says what to do and the best practice it satisfies. This is the "it actually helped" payload — concrete, sequenced, not a wall of text.

## METHOD CAPTURE
List, verbatim, every question you actually asked to reach the verdict, grouped by lens, and mark which question did the most work for this case. This list is the reusable checklist.`;

interface RunAuditResult {
  output: AuditOutput;
  method_capture: AuditMethodCapture[];
}

const LENS_ORDER: AuditLensKey[] = (
  Object.keys(AUDIT_LENS_META) as AuditLensKey[]
).sort((a, b) => AUDIT_LENS_META[a].order - AUDIT_LENS_META[b].order);

/**
 * Pull a compact playbook grounding per lens. Each lens maps to a
 * small set of modules; we retrieve a couple of chunks per lens so
 * the audit's reasoning is anchored to the methodology corpus, not
 * the model's priors. Bounded to keep token cost predictable.
 */
async function buildPlaybookContext(intake: AuditIntake): Promise<string> {
  const blocks: string[] = [];
  for (const lens of LENS_ORDER) {
    const meta = AUDIT_LENS_META[lens];
    try {
      const optionLabels = (intake.options ?? [])
        .map((o) => o.label)
        .filter(Boolean)
        .join(" ");
      const query =
        `${meta.label}: ${intake.decision} ${optionLabels} ` +
        `total cost lock-in operating model strategy fit risk reversibility`;
      const chunks = await searchPlaybook(query, {
        moduleNumbers: meta.modules,
        limit: 2,
      });
      if (chunks.length > 0) {
        const text = chunks
          .slice(0, 2)
          .map(
            (c) =>
              `[${c.metadata.section_title}] ${c.content.substring(0, 500)}`
          )
          .join("\n");
        blocks.push(`### ${meta.label} (Modules ${meta.modules
          .map((m) => `${m}:${MODULE_NAMES[m]}`)
          .join(", ")})\n${text}`);
      }
    } catch {
      // RAG is optional — proceed without it for this lens.
    }
  }
  return blocks.join("\n\n");
}

export async function runAudit(
  audit: { id: string; org_id: string; title: string; intake: AuditIntake }
): Promise<RunAuditResult> {
  const intake = audit.intake;
  const gaps = evaluateIntakeGaps(intake);

  const playbookContext = await buildPlaybookContext(intake);

  const options = intake.options ?? [];
  const optionsText =
    options.length > 0
      ? options
          .map(
            (o, i) =>
              `### Option ${i + 1}: ${o.label || "(unlabeled)"}\n${
                o.material?.trim() ||
                "(no material pasted for this option — that absence is itself a finding)"
              }`
          )
          .join("\n\n")
      : "(no options entered — there is nothing concrete to stress-test; verdict HOLD)";

  const intakeBlock = `## INTAKE — RAW. Inputs below are pasted documents, quotes, transcripts and notes across MULTIPLE options. They are NOT tidy authored prose. Extract the structure yourself. Do not penalize the practitioner for messy input — mining messy reality is your job.

## THE DECISION
${intake.decision || "(not provided — the room cannot name the decision; that is itself the first finding)"}

## BUSINESS PAIN (what actually hurts and what it costs)
${intake.business_pain || "(not provided — if the evidence cannot articulate the pain, that is itself a Lens 1 finding)"}

## THE PROJECT (what is actually being done)
${intake.project_summary || "(not provided)"}

## ACCOUNTABLE PRINCIPAL
Role: ${intake.principal_role || "(not provided)"}
Fired if this is wrong: ${intake.accountability || "(not provided)"}
All-in cost: ${intake.total_cost || "(not provided)"}

## OPTIONS UNDER CONSIDERATION (${options.length})
Compare them. Name the recommended option explicitly in the verdict, or recommend none / renegotiate / hold.

${optionsText}

## STRATEGY CONTEXT (raw paste — extract what matters; blank is a Lens 1 finding)
${intake.strategy_context || "(not provided)"}

## OPERATING CONTEXT (raw paste — how the org runs today, prior attempts and how they went, transcripts. The strongest absorption-failure signal lives here. Lens 2 / Lens 5.)
${intake.operating_context || "(not provided)"}

## ADDITIONAL CONTEXT (raw paste — emails, described diagrams, side notes)
${intake.extra_context || "(none provided)"}`;

  const gapBlock = gaps.finding
    ? `\n\n## INTAKE GAPS (a blank required input is itself the first finding)\nMissing: ${gaps.missing.join(
        ", "
      )}\nFirst finding: ${gaps.finding}\nUnless the provided evidence is overwhelming, the overall verdict defaults to "hold" and the board summary leads with this gap.`
    : "";

  const message = await logAnthropicCall({
    agentName: "audit.runAudit",
    metadata: { auditId: audit.id, orgId: audit.org_id, hasGaps: !!gaps.finding },
    call: () =>
      anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        // Output now carries the pain, 3-6 gaps, an initiative,
        // five lenses, requirements + method capture — 4096 risks
        // a truncated, unparseable JSON object.
        max_tokens: 8192,
        system:
          AUDIT_SYSTEM_PROMPT +
          (playbookContext
            ? `\n\n## PLAYBOOK GROUNDING (use to anchor findings in recognized methodology, not vendor framing)\n${playbookContext.substring(
                0,
                3500
              )}`
            : ""),
        messages: [
          {
            role: "user",
            content: `Audit this pre-purchase decision for "${audit.title}".

${intakeBlock}${gapBlock}

Run all five lenses. Produce the deliverable as JSON ONLY (no prose outside the JSON):

{
  "business_pain": "<the business pain this decision must solve, restated plainly in one or two sentences — the first thing the reader sees>",
  "gaps": [
    { "gap": "<plain: where the project departs from best practice in a way that changes the outcome>", "why_it_matters": "<the consequence, plain>", "best_practice": "<the best practice, stated plainly>", "module_number": <1-16, the methodology area this maps to>, "evidence": "<the because, grounded in the provided evidence>", "severity": "critical|high|moderate" }
  ],
  "recommended_initiative": {
    "title": "<short, action-oriented>",
    "goal": "<what done looks like — serves the pain, closes the gaps>",
    "domain": "tech|ai|security|process|data|other",
    "module_number": <1-16 primary best-practice anchor, or null>,
    "steps": [
      { "title": "<do this>", "description": "<how + the best practice it satisfies>", "module_number": <1-16 or null> }
    ]
  },
  "strategy_verdict": "<A — one decisive paragraph: should this be bought at all, in this category, given the strategy and operating model>",
  "requirements_brief": "<B — what the system must actually do, mapped to how the org runs today, NOT the vendor's feature list. Plain prose or markdown bullets.>",
  "lens_findings": [
    { "lens": "strategy_fit", "finding": "<the structural thing the room is not looking at>", "evidence": "<the because — no claim without it>", "flag": "KILL|GO|RENEGOTIATE" },
    { "lens": "operating_model_fit", "finding": "...", "evidence": "...", "flag": "KILL|GO|RENEGOTIATE" },
    { "lens": "total_cost_lockin", "finding": "...", "evidence": "...", "flag": "KILL|GO|RENEGOTIATE" },
    { "lens": "vendor_incentive", "finding": "...", "evidence": "...", "flag": "KILL|GO|RENEGOTIATE" },
    { "lens": "reversibility_risk", "finding": "...", "evidence": "...", "flag": "KILL|GO|RENEGOTIATE" }
  ],
  "overall_call": "buy|dont_buy|renegotiate|hold",
  "board_summary": "<D — one page a board reads in 60 seconds: the decision, the recommendation, the single biggest risk, the money at stake. Lead with the headline number.>",
  "headline_money": "<the single sharpest number with units, e.g. '$260,000 overpayment over 3 years' or '$1.2M cheaper path available' or 'unwind cost ≈ $400K in 18 months'>",
  "method_capture": [
    { "lens": "strategy_fit", "questions": ["<verbatim question asked>", "..."], "highest_leverage_index": 0 },
    { "lens": "operating_model_fit", "questions": ["..."], "highest_leverage_index": 0 },
    { "lens": "total_cost_lockin", "questions": ["..."], "highest_leverage_index": 0 },
    { "lens": "vendor_incentive", "questions": ["..."], "highest_leverage_index": 0 },
    { "lens": "reversibility_risk", "questions": ["..."], "highest_leverage_index": 0 }
  ]
}

Rules: every finding and every gap carries a "because" in evidence. Quantify money in real numbers. Surface 3-6 gaps that actually matter — no cosmetic gaps, no padding. The recommended_initiative must serve the business pain and close those gaps, with each step naming the best practice it satisfies. If intake gaps exist and evidence is not overwhelming, overall_call is "hold" and board_summary leads with the gap. If the honest answer is "buy", say so without hedging. Plain language on every reader-facing string — no module codes, no chart-speak.`,
          },
        ],
      }),
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Audit agent returned no parseable JSON");
  }

  const parsed = JSON.parse(jsonMatch[0]) as {
    business_pain?: string;
    gaps?: Array<{
      gap?: string;
      why_it_matters?: string;
      best_practice?: string;
      module_number?: unknown;
      evidence?: string;
      severity?: string;
    }>;
    recommended_initiative?: {
      title?: string;
      goal?: string;
      domain?: string;
      module_number?: unknown;
      steps?: Array<{
        title?: string;
        description?: string;
        module_number?: unknown;
      }>;
    };
    strategy_verdict?: string;
    requirements_brief?: string;
    lens_findings?: Array<{
      lens?: string;
      finding?: string;
      evidence?: string;
      flag?: string;
    }>;
    overall_call?: string;
    board_summary?: string;
    headline_money?: string;
    method_capture?: Array<{
      lens?: string;
      questions?: unknown;
      highest_leverage_index?: unknown;
    }>;
  };

  const validVerdicts: AuditVerdict[] = [
    "buy",
    "dont_buy",
    "renegotiate",
    "hold",
  ];
  const validFlags: LensFlag[] = ["KILL", "GO", "RENEGOTIATE"];
  const validLenses = new Set<string>(LENS_ORDER);

  // Intake gaps force HOLD unless the model already said so.
  let overall: AuditVerdict =
    parsed.overall_call &&
    validVerdicts.includes(parsed.overall_call as AuditVerdict)
      ? (parsed.overall_call as AuditVerdict)
      : "hold";
  if (gaps.finding && overall !== "dont_buy") {
    overall = "hold";
  }

  const lens_findings = (parsed.lens_findings ?? [])
    .filter(
      (f): f is { lens: string; finding: string; evidence: string; flag: string } =>
        typeof f?.lens === "string" &&
        validLenses.has(f.lens) &&
        typeof f?.finding === "string" &&
        typeof f?.evidence === "string"
    )
    .map((f) => ({
      lens: f.lens as AuditLensKey,
      finding: f.finding,
      evidence: f.evidence,
      flag: validFlags.includes(f.flag as LensFlag)
        ? (f.flag as LensFlag)
        : ("RENEGOTIATE" as LensFlag),
    }));

  const method_capture: AuditMethodCapture[] = (parsed.method_capture ?? [])
    .filter(
      (m): m is { lens: string; questions: string[]; highest_leverage_index: number } =>
        typeof m?.lens === "string" &&
        validLenses.has(m.lens) &&
        Array.isArray(m?.questions)
    )
    .map((m) => ({
      lens: m.lens as AuditLensKey,
      questions: (m.questions as unknown[])
        .filter((q): q is string => typeof q === "string")
        .slice(0, 12),
      highest_leverage_index:
        typeof m.highest_leverage_index === "number" &&
        m.highest_leverage_index >= 0
          ? m.highest_leverage_index
          : 0,
    }));

  const validSeverity = new Set(["critical", "high", "moderate"]);
  const clampModule = (v: unknown): number | null => {
    const n = typeof v === "number" ? v : Number(v);
    return Number.isInteger(n) && n >= 1 && n <= 16 ? n : null;
  };

  const bestPracticeGaps: AuditGap[] = (parsed.gaps ?? [])
    .filter(
      (g): g is { gap: string } & Record<string, unknown> =>
        typeof g?.gap === "string" && g.gap.trim().length > 0
    )
    .slice(0, 6)
    .map((g) => ({
      gap: String(g.gap).trim(),
      why_it_matters:
        typeof g.why_it_matters === "string" ? g.why_it_matters.trim() : "",
      best_practice:
        typeof g.best_practice === "string" ? g.best_practice.trim() : "",
      module_number: clampModule(g.module_number) ?? 0,
      evidence: typeof g.evidence === "string" ? g.evidence.trim() : "",
      severity: validSeverity.has(String(g.severity))
        ? (String(g.severity) as AuditGap["severity"])
        : "moderate",
    }));

  const validDomains = new Set([
    "tech",
    "ai",
    "security",
    "process",
    "data",
    "other",
  ]);
  const ri = parsed.recommended_initiative;
  let recommended_initiative: AuditInitiativeDraft | undefined;
  if (ri && typeof ri.title === "string" && ri.title.trim()) {
    recommended_initiative = {
      title: ri.title.trim().slice(0, 300),
      goal: typeof ri.goal === "string" ? ri.goal.trim() : "",
      domain: validDomains.has(String(ri.domain))
        ? (ri.domain as AuditInitiativeDraft["domain"])
        : "tech",
      module_number: clampModule(ri.module_number),
      steps: (Array.isArray(ri.steps) ? ri.steps : [])
        .filter(
          (s): s is { title: string } & Record<string, unknown> =>
            typeof s?.title === "string" && s.title.trim().length > 0
        )
        .slice(0, 12)
        .map((s) => ({
          title: String(s.title).trim().slice(0, 300),
          description:
            typeof s.description === "string" ? s.description.trim() : "",
          module_number: clampModule(s.module_number),
        })),
    };
  }

  const output: AuditOutput = {
    business_pain:
      typeof parsed.business_pain === "string"
        ? parsed.business_pain.trim()
        : intake.business_pain || "",
    gaps: bestPracticeGaps,
    recommended_initiative,
    strategy_verdict:
      typeof parsed.strategy_verdict === "string"
        ? parsed.strategy_verdict.trim()
        : "",
    requirements_brief:
      typeof parsed.requirements_brief === "string"
        ? parsed.requirements_brief.trim()
        : "",
    lens_findings,
    overall_call: overall,
    board_summary:
      typeof parsed.board_summary === "string"
        ? parsed.board_summary.trim()
        : "",
    headline_money:
      typeof parsed.headline_money === "string"
        ? parsed.headline_money.trim()
        : "",
  };

  return { output, method_capture };
}

// ============================================================
// Live Audit Companion — the pre-meeting output mode.
//
// Same stance, same five lenses. But the output is not a verdict;
// it is the exact structural questions to ask IN THE ROOM while
// the vendor is performing — tailored to this specific purchase.
// The post-hoc verdict documents judgment after the fact; the
// companion puts the question in the practitioner's mouth in real
// time. Cases caught live (model lock-in surfaced only when asked;
// on-the-fly demo capability the room missed) are exactly what
// this front-loads.
// ============================================================

export async function generateCompanion(
  audit: { id: string; org_id: string; title: string; intake: AuditIntake }
): Promise<AuditCompanion> {
  const intake = audit.intake;
  const playbookContext = await buildPlaybookContext(intake);

  const options = intake.options ?? [];
  const optionsLine =
    options.length > 0
      ? options.map((o) => o.label || "(unlabeled)").join(" vs ")
      : "(no options entered yet)";

  const intakeBlock = `## WHAT WE KNOW GOING IN (raw context — extract what matters)

Decision: ${intake.decision || "(unspecified — itself a question to ask)"}
Options on the table: ${optionsLine}
Accountable principal: ${intake.principal_role || "(unspecified)"} — fired if wrong: ${
    intake.accountability || "(unspecified)"
  }
All-in cost: ${intake.total_cost || "(unspecified)"}
Strategy it should serve: ${intake.strategy_context || "(unstated — itself a question to ask)"}
How the org runs today / prior attempts / transcripts: ${intake.operating_context || "(unstated — ask what was tried before in this area and why it didn't stick)"}
Additional context: ${intake.extra_context || "(none)"}`;

  const message = await logAnthropicCall({
    agentName: "audit.generateCompanion",
    metadata: { auditId: audit.id, orgId: audit.org_id },
    call: () =>
      anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2048,
        system:
          AUDIT_SYSTEM_PROMPT +
          `\n\n## MODE: PRE-MEETING COMPANION\nYou are NOT rendering a verdict. You are arming the practitioner who is about to walk into the room with the vendor. Produce the exact structural questions to ask live — the ones that surface what nobody else in the room is looking at. For each, name what evasion or a weak answer looks like, so the practitioner recognizes it in real time. Keep questions blunt and askable out loud.` +
          (playbookContext
            ? `\n\n## PLAYBOOK GROUNDING\n${playbookContext.substring(0, 3000)}`
            : ""),
        messages: [
          {
            role: "user",
            content: `Prepare the practitioner for the meeting on "${audit.title}".

${intakeBlock}

Produce JSON ONLY:

{
  "meeting_context": "<one line: what this meeting is and what it must surface>",
  "lenses": [
    { "lens": "strategy_fit", "questions": ["<blunt question to ask out loud>", "..."], "watch_for": "<what evasion / a weak answer sounds like>" },
    { "lens": "operating_model_fit", "questions": ["..."], "watch_for": "..." },
    { "lens": "total_cost_lockin", "questions": ["..."], "watch_for": "..." },
    { "lens": "vendor_incentive", "questions": ["..."], "watch_for": "..." },
    { "lens": "reversibility_risk", "questions": ["..."], "watch_for": "..." }
  ],
  "do_not_leave_without_asking": "<the single question most likely to surface the structural finding nobody else in the room is looking at>"
}

3-5 questions per lens, blunt and askable. If AI/model ownership is unstated and the purchase involves AI, the lock-in question is mandatory under total_cost_lockin. If prior attempts are unknown, "what did you try before in this area and why did it not stick?" is mandatory under operating_model_fit. If no live demo has happened, "configure that against our actual requirement, right now, in front of us" belongs under vendor_incentive.`,
          },
        ],
      }),
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Companion agent returned no parseable JSON");
  }

  const parsed = JSON.parse(jsonMatch[0]) as {
    meeting_context?: string;
    lenses?: Array<{ lens?: string; questions?: unknown; watch_for?: string }>;
    do_not_leave_without_asking?: string;
  };

  const validLenses = new Set<string>(LENS_ORDER);
  const lenses: AuditCompanionLens[] = (parsed.lenses ?? [])
    .filter(
      (l): l is { lens: string; questions: unknown; watch_for?: string } =>
        typeof l?.lens === "string" && validLenses.has(l.lens)
    )
    .map((l) => ({
      lens: l.lens as AuditLensKey,
      questions: Array.isArray(l.questions)
        ? (l.questions as unknown[])
            .filter((q): q is string => typeof q === "string")
            .slice(0, 6)
        : [],
      watch_for: typeof l.watch_for === "string" ? l.watch_for : "",
    }));

  return {
    generated_at: new Date().toISOString(),
    meeting_context:
      typeof parsed.meeting_context === "string"
        ? parsed.meeting_context.trim()
        : audit.title,
    lenses,
    do_not_leave_without_asking:
      typeof parsed.do_not_leave_without_asking === "string"
        ? parsed.do_not_leave_without_asking.trim()
        : "",
  };
}
