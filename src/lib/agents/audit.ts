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
  type AuditLensKey,
  type AuditVerdict,
  type LensFlag,
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
- Match the buyer's language (Spanish or English) — mirror the language the intake is written in.

## METHOD CAPTURE
Always end by listing, verbatim, every question you actually asked to reach the verdict, grouped by lens, and marking which question did the most work for this case. This list is the reusable checklist.`;

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
      const query =
        `${meta.label}: ${intake.system_name} ${intake.vendor_name} ` +
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

  const intakeBlock = `## INTAKE

1. System/technology being bought: ${intake.system_name || "(not provided)"}
   Vendor: ${intake.vendor_name || "(not provided)"}
   Total cost: ${intake.total_cost || "(not provided)"}

2. Accountable principal role: ${intake.principal_role || "(not provided)"}
   What gets them fired if this is wrong: ${intake.accountability || "(not provided)"}

3. Vendor proposal / quote / SOW / feature list:
${intake.vendor_proposal || "(not provided)"}

4. How the organization actually runs today in the area this touches:
${intake.current_operating_model || "(not provided)"}

5. The strategy this is supposed to serve:
${intake.strategy_served || "(not provided)"}`;

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
        max_tokens: 4096,
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

Rules: every finding carries a "because" in evidence. Quantify money in real numbers. If intake gaps exist and evidence is not overwhelming, overall_call is "hold" and board_summary leads with the gap. If the honest answer is "buy", say so without hedging.`,
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

  const output: AuditOutput = {
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
