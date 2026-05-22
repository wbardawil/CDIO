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
