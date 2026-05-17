// ============================================================
// AI-CDIO — Pre-Purchase Technology Audit types
//
// A discrete, fixed-fee engagement that sits between a principal
// and a major technology/system purchase BEFORE the check is
// signed. Loyalty is to the accountable principal — never the
// vendor, never the internal champion. One decision per audit.
// The engine ends at the verdict.
//
// Parallel to the Selection Engine, NOT a mode of it:
//   Selection = build a matrix to PICK among options (forward).
//   Audit     = adversarially stress-test a choice already
//               mostly made and return a verdict (backward).
//
// See docs/STRATEGY-2026.md "Named Service Lines" for the spec.
// ============================================================

export type AuditStatus =
  | "intake"       // intake form being filled; not yet runnable
  | "ready"        // intake complete enough to run
  | "running"      // agent in flight
  | "complete"     // verdict rendered
  | "cancelled";

export type AuditVerdict = "buy" | "dont_buy" | "renegotiate" | "hold";

export const AUDIT_VERDICT_LABEL: Record<AuditVerdict, string> = {
  buy: "BUY",
  dont_buy: "DON'T BUY",
  renegotiate: "RENEGOTIATE",
  hold: "HOLD — insufficient evidence",
};

export type AuditLensKey =
  | "strategy_fit"
  | "operating_model_fit"
  | "total_cost_lockin"
  | "vendor_incentive"
  | "reversibility_risk";

export const AUDIT_LENS_META: Record<
  AuditLensKey,
  { label: string; order: number; modules: number[] }
> = {
  strategy_fit: {
    label: "Strategy Fit",
    order: 1,
    modules: [2, 1],
  },
  operating_model_fit: {
    label: "Operating-Model Fit",
    order: 2,
    modules: [11, 15, 16],
  },
  total_cost_lockin: {
    label: "Total Cost & Lock-in",
    order: 3,
    modules: [12, 13, 3],
  },
  vendor_incentive: {
    label: "Vendor Incentive & Capability",
    order: 4,
    modules: [13],
  },
  reversibility_risk: {
    label: "Reversibility & Risk",
    order: 5,
    modules: [5, 3],
  },
};

export type LensFlag = "KILL" | "GO" | "RENEGOTIATE";

/** One lens's finding in the C-section of the deliverable. */
export interface AuditLensFinding {
  lens: AuditLensKey;
  finding: string;        // the structural thing the room is not looking at
  evidence: string;       // the "because" — no claim without it
  flag: LensFlag;
}

/** The four deliverable artifacts. */
export interface AuditOutput {
  // A — strategy-fit verdict, decisive, one paragraph
  strategy_verdict: string;
  // B — operating-model-aligned requirements brief (what it must
  //     do mapped to how the org actually runs, not vendor features)
  requirements_brief: string;
  // C — per-lens finding + evidence + flag, then overall call
  lens_findings: AuditLensFinding[];
  overall_call: AuditVerdict;
  // D — one-page board summary, 60-second read
  board_summary: string;
  // The single headline number for the board 1-pager.
  // e.g. "$260,000 overpayment over 3 years" or
  // "$1.2M cheaper path available" — free text so it can carry units.
  headline_money: string;
}

/** Method Capture — the reusable checklist. Always produced. */
export interface AuditMethodCapture {
  lens: AuditLensKey;
  questions: string[];           // verbatim questions actually asked
  highest_leverage_index: number; // index into questions[] that did the most work
}

/**
 * One candidate under the decision. A real pre-purchase decision
 * almost always has 2-3 finalists, not one. `material` is RAW —
 * the practitioner pastes the actual proposal / quote / SOW /
 * email / notes for this option, unedited. The engine extracts
 * structure; the practitioner does not summarize.
 */
export interface AuditOption {
  id: string;
  label: string;     // "HubSpot" / "Salesforce" / "Stay on incumbent + manual"
  material: string;  // raw pasted proposal / quote / SOW / notes for this option
}

/**
 * V1 intake (2026-05-13 rebuild). Built around how engagements
 * actually arrive: ONE decision, MULTIPLE options, inputs are raw
 * pasted documents and transcripts — not tidy authored prose.
 * Every context field is "paste, do not summarize." The engine
 * does the structuring. Blank structural fields are not errors —
 * they become the first finding (evaluateIntakeGaps).
 */
export interface AuditIntake {
  // The ONE decision, in plain language. "Which CRM for the
  // university", "Replace the ERP or extend the incumbent".
  decision: string;

  // Who is personally accountable, and what gets them fired if
  // this is wrong. The audit's loyalty anchor.
  principal_role: string;
  accountability: string;

  // All-in cost if known, free text so it carries currency + term.
  total_cost: string;

  // The candidates under the decision. 1..N. Each carries its own
  // raw material (proposal / quote / SOW / notes), unedited.
  options: AuditOption[];

  // Raw paste — the strategy this is supposed to serve. Where the
  // business is trying to play and how it intends to win. Blank
  // here is itself a Lens 1 finding.
  strategy_context: string;

  // Raw paste — how the org runs today in this area, prior tech
  // attempts and how they went, meeting transcripts, process
  // notes. The strongest absorption-failure signal lives here.
  // Lens 2 / Lens 5 reason over this.
  operating_context: string;

  // Raw paste — anything else relevant: emails, described
  // diagrams, side notes. The engine mines it.
  extra_context: string;

  // Optional link to a Selection the audit reviews (if the org
  // ran one).
  selection_id: string | null;
}

// --- Live Audit Companion ---
//
// The pre-meeting output mode of the same engine. Generated BEFORE
// the vendor meeting: a lens-by-lens question sheet tailored to
// THIS purchase — the exact structural probes to ask in the room
// while the vendor is performing. The post-hoc verdict documents
// judgment after the fact; the companion puts the question in the
// practitioner's mouth in real time. Closes the loop with Method
// Capture so the highest-leverage questions compound meeting over
// meeting.

export interface AuditCompanionLens {
  lens: AuditLensKey;
  questions: string[];   // exact probes to ask in the room
  watch_for: string;     // what evasion / a bad answer looks like
}

export interface AuditCompanion {
  generated_at: string;
  meeting_context: string;  // one line: what this meeting is for
  lenses: AuditCompanionLens[];
  // The single question the practitioner must not leave the room
  // without asking — the one most likely to surface the structural
  // finding nobody else in the room is looking at.
  do_not_leave_without_asking: string;
}

/** Which intake fields are blank — a blank field is itself a finding. */
export interface AuditIntakeGaps {
  missing: (keyof AuditIntake)[];
  // The first finding when the principal cannot supply an input.
  finding: string | null;
}

export interface Audit {
  id: string;
  created_at: string;
  updated_at: string;
  org_id: string;
  practitioner_id: string;
  title: string;
  status: AuditStatus;
  intake: AuditIntake;
  output: AuditOutput | null;
  method_capture: AuditMethodCapture[] | null;
  companion: AuditCompanion | null;
  ran_at: string | null;
}

// Structural inputs whose absence is itself a finding. Total cost
// and extra_context are not here — their absence is noted by the
// agent, not treated as a board-stopping gap.
const REQUIRED_INTAKE_FIELDS: (keyof AuditIntake)[] = [
  "decision",
  "principal_role",
  "accountability",
  "strategy_context",
  "operating_context",
];

const INTAKE_FIELD_LABEL: Record<string, string> = {
  decision: "the decision actually being made",
  principal_role: "who is personally accountable",
  accountability: "what gets the accountable principal fired if this is wrong",
  strategy_context: "the strategy this is supposed to serve",
  operating_context: "how the organization actually runs today in this area",
};

function optionsWithMaterial(intake: AuditIntake): AuditOption[] {
  return (intake.options ?? []).filter(
    (o) => String(o?.label ?? "").trim() && String(o?.material ?? "").trim()
  );
}

/**
 * A blank structural field is not an error — it is the first
 * finding. "About to sign and cannot articulate <X>" is a
 * board-stopping sentence the audit surfaces deliberately.
 */
export function evaluateIntakeGaps(intake: AuditIntake): AuditIntakeGaps {
  const missing = REQUIRED_INTAKE_FIELDS.filter(
    (f) => !String(intake[f] ?? "").trim()
  );

  const noOptions = optionsWithMaterial(intake).length === 0;

  // Conditional AI probe: fires independently of field gaps. If the
  // decision smells AI/ML and nothing anywhere addresses model/data
  // ownership, that omission is itself a lock-in red flag.
  const haystack = [
    intake.decision,
    intake.strategy_context,
    intake.operating_context,
    intake.extra_context,
    ...(intake.options ?? []).map((o) => `${o.label} ${o.material}`),
  ]
    .join(" ")
    .toLowerCase();
  const looksAI =
    /\b(ai|ml|llm|model|agent|gpt|genai|copilot|voice ai|chatbot)\b/.test(
      haystack
    );
  const ownershipMentioned =
    /\b(own (the )?(model|data)|byo|bring your own|on-?prem|our infrastructure|infrastructure we control|model ownership|data ownership|self-?host)\b/.test(
      haystack
    );
  const aiOwnershipUnstated = looksAI && !ownershipMentioned;

  if (missing.length === 0 && !noOptions && !aiOwnershipUnstated) {
    return { missing: [], finding: null };
  }

  const parts: string[] = [];
  if (missing.length > 0) {
    const phrases = missing.map((f) => INTAKE_FIELD_LABEL[f] ?? f);
    parts.push(
      `The room is moving toward ${
        intake.decision?.trim() || "a major purchase"
      } but cannot articulate: ${phrases.join(
        "; "
      )}. This gap is itself the first finding — a decision this size should not proceed until each of these is on the table. Verdict defaults to HOLD until resolved.`
    );
  }
  if (noOptions) {
    parts.push(
      `No option has been entered with its actual material (proposal / quote / notes). An audit needs at least one concrete option on the table; with none, there is nothing to stress-test and the verdict is HOLD.`
    );
  }
  if (aiOwnershipUnstated) {
    parts.push(
      `This decision involves AI/ML and model/data ownership is unstated anywhere — surface before signing: can we bring our own model, who owns the data layer, can it run on infrastructure we control? Unstated model ownership is a lock-in red flag.`
    );
  }
  return { missing, finding: parts.join(" ") };
}

export function isRunnable(intake: AuditIntake): boolean {
  // Runnable even with gaps — gaps produce a HOLD verdict + the
  // gap-as-finding. Hard minimum: a named decision and at least one
  // option that actually has material to stress-test.
  return Boolean(
    String(intake.decision ?? "").trim() &&
      optionsWithMaterial(intake).length > 0
  );
}
