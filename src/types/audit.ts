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

export interface AuditIntake {
  // 1. What is being bought, from whom, at what total cost?
  system_name: string;
  vendor_name: string;
  total_cost: string;            // free text so it carries currency + term
  // 2. Who is the accountable principal? What gets them fired?
  principal_role: string;
  accountability: string;        // "what gets them fired if this is wrong"
  // 3. The vendor proposal / quote / SOW / feature list
  vendor_proposal: string;
  // 4. How the org actually runs today in the area this touches
  current_operating_model: string;
  // 5. The strategy this is supposed to serve
  strategy_served: string;

  // --- Intake hardenings (2026-05-13, justified by real engagements) ---

  // Prior technology attempts in THIS area and how they went. The
  // single strongest predictor of absorption failure — a failed
  // prior rollout in the same function (e.g. a WhatsApp bot the
  // commercial team never configured) means the next purchase
  // likely fails for the same org-behavior reason, not the tool.
  // Blank here is itself probed by Lens 2 / Lens 5.
  prior_attempts: string;

  // When the purchase involves AI/ML: who owns the model + data
  // layer? Can we bring our own model? Can it run on infra we
  // control? Vendors are deliberately vague here; this forces the
  // question at intake instead of leaving it to mid-demo discovery.
  ai_model_ownership: string;

  // What each option actually DEMONSTRATED — live/on-the-fly vs
  // scripted/canned. Separates demo polish + perceived industry
  // familiarity (cheap to remediate) from technical capability
  // (structural). Lens 4 reasons over this directly.
  demo_observations: string;

  // Optional link to a Selection the audit reviews (if the org ran one).
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

const REQUIRED_INTAKE_FIELDS: (keyof AuditIntake)[] = [
  "system_name",
  "vendor_name",
  "total_cost",
  "principal_role",
  "accountability",
  "vendor_proposal",
  "current_operating_model",
  "strategy_served",
];

const INTAKE_FIELD_LABEL: Record<string, string> = {
  system_name: "the system/technology being bought",
  vendor_name: "the vendor",
  total_cost: "the total cost",
  principal_role: "who is personally accountable",
  accountability: "what gets the accountable principal fired if this is wrong",
  vendor_proposal: "the vendor proposal / quote / SOW",
  current_operating_model: "how the organization actually runs today",
  strategy_served: "the strategy this purchase is supposed to serve",
};

/**
 * A blank intake field is not an error — it is the first finding.
 * "You are about to sign for <system> and cannot articulate <X>"
 * is a board-stopping sentence the audit surfaces deliberately.
 */
export function evaluateIntakeGaps(intake: AuditIntake): AuditIntakeGaps {
  const missing = REQUIRED_INTAKE_FIELDS.filter(
    (f) => !String(intake[f] ?? "").trim()
  );

  // Conditional AI probe: fires independently of required-field
  // gaps. If the purchase smells AI/ML and model ownership is
  // blank, that omission is itself a lock-in red flag worth a
  // finding even when every required field is filled.
  const haystack =
    `${intake.system_name} ${intake.vendor_name} ${intake.vendor_proposal}`.toLowerCase();
  const looksAI = /\b(ai|ml|llm|model|agent|gpt|genai|copilot|voice ai)\b/.test(
    haystack
  );
  const aiOwnershipUnstated =
    looksAI && !String(intake.ai_model_ownership ?? "").trim();

  if (missing.length === 0 && !aiOwnershipUnstated) {
    return { missing: [], finding: null };
  }

  let finding = "";
  if (missing.length > 0) {
    const phrases = missing.map((f) => INTAKE_FIELD_LABEL[f] ?? f);
    finding =
      `The principal is moving toward a purchase of ${
        intake.system_name?.trim() || "an unspecified system"
      } but cannot articulate: ${phrases.join("; ")}. ` +
      `This gap is itself the first finding — a decision this size should not proceed ` +
      `until each of these is on the table. Verdict defaults to HOLD until resolved.`;
  }
  if (aiOwnershipUnstated) {
    finding +=
      (finding ? " " : "") +
      `This purchase involves AI/ML and model/data ownership is unstated — ` +
      `surface before signing: can we bring our own model, who owns the data layer, ` +
      `can it run on infrastructure we control? Unstated model ownership is a lock-in red flag.`;
  }
  return { missing, finding };
}

export function isRunnable(intake: AuditIntake): boolean {
  // Runnable even with gaps — gaps produce a HOLD verdict + the
  // gap-as-finding. The only hard requirement is enough to name
  // the decision: system + vendor.
  return Boolean(
    String(intake.system_name ?? "").trim() &&
      String(intake.vendor_name ?? "").trim()
  );
}
