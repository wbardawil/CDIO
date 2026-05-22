// ============================================================
// CDIO Review Cockpit — core types
//
// The CDIOBrief is the single source of truth for the brief's
// shape. The extraction prompt, the UI sections, and the
// completeness check all derive from it.
//
// The brief has four parts (where it stands · what we found ·
// what is still unknown · what to do next), a one-line "cold
// open" at the top, and a recommended next gate. Every narrative
// section is a BriefField that can be honestly empty — a thin
// input produces a flagged "couldn't fill" section, never a
// confident-but-empty brief.
// ============================================================

// ---- Initiative-level ----

export type Stage = "frame" | "discover" | "decide" | "source" | "plan";

export const STAGES: Stage[] = [
  "frame",
  "discover",
  "decide",
  "source",
  "plan",
];

export const STAGE_LABELS: Record<Stage, string> = {
  frame: "Frame",
  discover: "Discover",
  decide: "Decide the approach",
  source: "Source & select",
  plan: "Plan",
};

/** One plain-English line per stage: what the cockpit checks the
 *  initiative against here. Shown so the stage buttons mean
 *  something — no module codes, no jargon. */
export const STAGE_LENS: Record<Stage, string> = {
  frame:
    "At Frame, the cockpit checks the business outcome, the budget and timeline, and whether the goal is defined sharply enough to decide against.",
  discover:
    "At Discover, the cockpit checks the current-state facts, the data and systems picture, and what is still unknown about the real situation.",
  decide:
    "At Decide, the cockpit checks the approach against the strategy, the cost case, and whether the decision is being made a step too early.",
  source:
    "At Source & select, the cockpit checks the vendor options on integration, security, and contract terms against your non-negotiables.",
  plan:
    "At Plan, the cockpit checks the delivery roadmap, the team and change picture, and whether security and operations are covered.",
};

export type InitiativeType =
  | "crm"
  | "erp"
  | "data"
  | "security"
  | "infra"
  | "other";

export const INITIATIVE_TYPE_LABELS: Record<InitiativeType, string> = {
  crm: "Customer system (CRM)",
  erp: "Core operations system (ERP)",
  data: "Data / analytics initiative",
  security: "Security initiative",
  infra: "Infrastructure / cloud",
  other: "Other",
};

export interface Initiative {
  id: string;
  ownerUserId: string;
  name: string;
  initiativeType: InitiativeType | null;
  stage: Stage;
  createdAt: string;
  updatedAt: string;
}

// ---- Constraints (the PM's non-negotiables, set at Frame) ----

export type ConstraintKind =
  | "budget"
  | "deadline"
  | "must_integrate"
  | "cannot_touch"
  | "other";

export const CONSTRAINT_KIND_LABELS: Record<ConstraintKind, string> = {
  budget: "Budget ceiling",
  deadline: "Deadline",
  must_integrate: "Must integrate with",
  cannot_touch: "Cannot touch",
  other: "Other hard line",
};

export interface Constraint {
  id: string;
  initiativeId: string;
  kind: ConstraintKind;
  label: string;
  value: string | null;
  createdAt: string;
}

// ---- Documents (ingested sources) ----

export interface DocumentMeta {
  id: string;
  initiativeId: string;
  filename: string;
  sha256: string;
  parseOk: boolean;
  parseNote: string | null;
  createdAt: string;
}

// ---- Chat messages (the per-initiative assistant) ----

export interface ChatMessage {
  id: string;
  initiativeId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

// ---- The CDIO Brief ----

export type Gate = "continue" | "clarify" | "intervene";

export const GATE_LABELS: Record<Gate, string> = {
  continue: "Continue",
  clarify: "Clarify first",
  intervene: "Intervene",
};

/** A narrative section that can be honestly unfillable. When
 *  `filled` is false, `text` is "" and `missing` says what input
 *  is needed to fill it. */
export interface BriefField {
  filled: boolean;
  text: string;
  missing?: string;
}

export interface BriefOption {
  label: string;
  summary: string;
  cost?: string;
  risks: string[];
}

export type Severity = "low" | "medium" | "high";

export interface BriefRisk {
  risk: string;
  severity: Severity;
  why: string; // why it matters / what it costs
}

export interface OpenQuestion {
  question: string;
  whyItMatters: string;
}

export interface CDIOBrief {
  /** The one line — generated last, from the finished brief.
   *  The decision being made too early, the risk nobody named,
   *  or the sharpest question for tomorrow. */
  coldOpen: string;

  gate: Gate;
  gateReason: string;

  whereItStands: {
    businessOutcome: BriefField;
    currentStateFacts: BriefField;
    constraints: BriefField;
    requirements: BriefField;
  };

  whatWeFound: {
    options: BriefOption[];
    risks: BriefRisk[];
  };

  stillUnknown: {
    openQuestions: OpenQuestion[];
  };

  whatToDoNext: {
    recommendedMove: BriefField;
    /** The decision being made a step too early, if any. */
    decisionRisks: BriefField;
    questionsForNextRoom: string[];
  };

  /** The lifecycle stage this brief was generated at. Set by the
   *  extractor from its input — not by the model. Lets the UI nudge
   *  "re-generate to see this through the <current stage> lens"
   *  when the user has moved stages since. Optional: briefs created
   *  before this field existed simply have no stage recorded. */
  generatedAtStage?: Stage;
}

export interface Brief {
  id: string;
  initiativeId: string;
  version: number;
  body: CDIOBrief;
  status: "complete" | "partial";
  createdAt: string;
}

// ---- Completeness (derived, not stored — single source of truth
//      is the BriefField flags + the array contents) ----

export interface CompletenessEntry {
  section: string;
  filled: boolean;
  missing?: string;
}

/** Derive the completeness read from a brief. A section is
 *  "filled" if its BriefField is filled, or (for list sections)
 *  if the list is non-empty. */
export function briefCompleteness(brief: CDIOBrief): CompletenessEntry[] {
  const fromField = (section: string, f: BriefField): CompletenessEntry => ({
    section,
    filled: f.filled,
    missing: f.filled ? undefined : f.missing,
  });
  return [
    fromField("Business outcome", brief.whereItStands.businessOutcome),
    fromField("Current-state facts", brief.whereItStands.currentStateFacts),
    fromField("Constraints", brief.whereItStands.constraints),
    fromField("Requirements", brief.whereItStands.requirements),
    {
      section: "Options",
      filled: brief.whatWeFound.options.length > 0,
      missing:
        brief.whatWeFound.options.length > 0
          ? undefined
          : "No vendor or system options found in the documents yet.",
    },
    {
      section: "Risks",
      filled: brief.whatWeFound.risks.length > 0,
      missing:
        brief.whatWeFound.risks.length > 0
          ? undefined
          : "No risks could be identified from the current material.",
    },
    fromField("Recommended next move", brief.whatToDoNext.recommendedMove),
  ];
}

/** A brief is "partial" if any required section is unfilled. */
export function briefStatus(brief: CDIOBrief): "complete" | "partial" {
  return briefCompleteness(brief).every((e) => e.filled)
    ? "complete"
    : "partial";
}

// ---- Readiness — a plain three-level read of how complete the
//      brief at the current stage is. Drives the stage indicator. ----

export type Readiness = "ready" | "partial" | "thin";

export const READINESS_LABEL: Record<Readiness, string> = {
  ready: "Ready",
  partial: "Partial",
  thin: "Thin",
};

/** Ready = every section filled. Thin = most sections empty (the
 *  input did not give the cockpit enough to work with). Partial =
 *  in between. */
export function readiness(brief: CDIOBrief): Readiness {
  const entries = briefCompleteness(brief);
  const filled = entries.filter((e) => e.filled).length;
  if (filled === entries.length) return "ready";
  if (filled <= entries.length / 2) return "thin";
  return "partial";
}
