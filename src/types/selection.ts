// ============================================================
// AI-CDIO — Selection types (Phase 1D Day 24)
// ============================================================

export type SelectionDomain = "tech" | "ai" | "partner";

export type SelectionStatus =
  | "open"
  | "recommended"
  | "decided"
  | "cancelled";

export type CriterionDimension =
  | "feasibility"
  | "value"
  | "risk"
  | "fit";

export interface SelectionCriterion {
  id: string;
  name: string;
  weight: number; // 0-5
  dimension: CriterionDimension;
}

export interface SelectionCandidate {
  id: string;
  name: string;
  summary: string | null;
  scores: Record<string, number>; // criterion_id -> 1-5
  notes: string | null;
  is_recommended: boolean;
}

export interface Selection {
  id: string;
  created_at: string;
  updated_at: string;
  org_id: string;
  practitioner_id: string;
  domain: SelectionDomain;
  initiative_id: string | null;
  module_number: number | null;
  title: string;
  question: string;
  status: SelectionStatus;
  criteria: SelectionCriterion[];
  candidates: SelectionCandidate[];
  recommendation: string | null;
  decided_at: string | null;
  decided_candidate_id: string | null;
}

export const SELECTION_DOMAIN_LABEL: Record<SelectionDomain, string> = {
  tech: "Technology",
  ai: "AI",
  partner: "Partner",
};

export const SELECTION_STATUS_LABEL: Record<SelectionStatus, string> = {
  open: "Open",
  recommended: "Recommended",
  decided: "Decided",
  cancelled: "Cancelled",
};

export const DIMENSION_LABEL: Record<CriterionDimension, string> = {
  feasibility: "Feasibility",
  value: "Value",
  risk: "Risk",
  fit: "Fit",
};

// AMP AI Diagnostic Playbook - 5 Feasibility + 5 Value default
// criteria for domain='ai'. Practitioner can override per
// engagement.
export const AMP_AI_CRITERIA: Omit<SelectionCriterion, "id">[] = [
  { name: "Data readiness", weight: 4, dimension: "feasibility" },
  { name: "System & integration fit", weight: 3, dimension: "feasibility" },
  { name: "Process structure & standardization", weight: 5, dimension: "feasibility" },
  { name: "Change readiness", weight: 3, dimension: "feasibility" },
  { name: "Time-to-impact", weight: 3, dimension: "feasibility" },
  { name: "OpEx reduction potential", weight: 5, dimension: "value" },
  { name: "Productivity uplift", weight: 4, dimension: "value" },
  { name: "Quality & accuracy improvement", weight: 3, dimension: "value" },
  { name: "Revenue impact potential", weight: 3, dimension: "value" },
  { name: "Strategic alignment", weight: 4, dimension: "value" },
];

// Generic Tech selection default criteria (CMMI / TBM / Gartner-flavored).
export const TECH_DEFAULT_CRITERIA: Omit<SelectionCriterion, "id">[] = [
  { name: "Functional fit to use case", weight: 5, dimension: "fit" },
  { name: "Integration with existing stack", weight: 4, dimension: "feasibility" },
  { name: "Total cost of ownership (3-year)", weight: 5, dimension: "value" },
  { name: "Vendor stability & roadmap", weight: 3, dimension: "risk" },
  { name: "Security & compliance posture", weight: 4, dimension: "risk" },
  { name: "Time-to-value", weight: 4, dimension: "feasibility" },
  { name: "Switching cost / lock-in risk", weight: 3, dimension: "risk" },
  { name: "Support quality & SLAs", weight: 3, dimension: "fit" },
];

// Partner selection default criteria.
export const PARTNER_DEFAULT_CRITERIA: Omit<SelectionCriterion, "id">[] = [
  { name: "Domain expertise depth", weight: 5, dimension: "fit" },
  { name: "Industry experience", weight: 4, dimension: "fit" },
  { name: "Pricing structure (fixed vs T&M)", weight: 4, dimension: "value" },
  { name: "Capacity to start in 30 days", weight: 4, dimension: "feasibility" },
  { name: "References from peer-size clients", weight: 4, dimension: "risk" },
  { name: "Cultural / working-style fit", weight: 3, dimension: "fit" },
  { name: "Knowledge transfer commitment", weight: 3, dimension: "value" },
];

export function defaultCriteriaFor(domain: SelectionDomain): Omit<SelectionCriterion, "id">[] {
  switch (domain) {
    case "ai":
      return AMP_AI_CRITERIA;
    case "partner":
      return PARTNER_DEFAULT_CRITERIA;
    default:
      return TECH_DEFAULT_CRITERIA;
  }
}

export interface CandidateScoreSummary {
  candidateId: string;
  weightedTotal: number;
  maxPossible: number;
  percent: number;
  byDimension: Record<CriterionDimension, { weighted: number; max: number }>;
}

/**
 * Compute the weighted score per candidate. Each criterion has a
 * weight 0-5 and a per-candidate score 1-5; the candidate's
 * weighted total is sum(weight * score). Max possible is sum(weight * 5).
 *
 * Dimension breakdown lets the UI show "this candidate is strong on
 * Feasibility but weak on Value" without re-aggregating.
 */
export function scoreSelection(
  selection: Pick<Selection, "criteria" | "candidates">
): CandidateScoreSummary[] {
  const criteria = selection.criteria;
  return selection.candidates.map((c) => {
    let weightedTotal = 0;
    let maxPossible = 0;
    const byDimension: Record<CriterionDimension, { weighted: number; max: number }> = {
      feasibility: { weighted: 0, max: 0 },
      value: { weighted: 0, max: 0 },
      risk: { weighted: 0, max: 0 },
      fit: { weighted: 0, max: 0 },
    };
    for (const crit of criteria) {
      const score = c.scores[crit.id];
      const w = crit.weight;
      const max = w * 5;
      maxPossible += max;
      byDimension[crit.dimension].max += max;
      if (typeof score === "number" && score >= 1 && score <= 5) {
        const weighted = w * score;
        weightedTotal += weighted;
        byDimension[crit.dimension].weighted += weighted;
      }
    }
    return {
      candidateId: c.id,
      weightedTotal,
      maxPossible,
      percent:
        maxPossible > 0
          ? Math.round((weightedTotal / maxPossible) * 100)
          : 0,
      byDimension,
    };
  });
}
