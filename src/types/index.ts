// ============================================================
// AI-CDIO — Core Type Definitions
// ============================================================

// --- Organization ---

export type OrgSize = "small" | "medium" | "large";

export type Industry =
  | "healthcare"
  | "financial_services"
  | "manufacturing"
  | "professional_services"
  | "retail_ecommerce"
  | "technology"
  | "education"
  | "other";

export type EngagementModel =
  | "advisory"      // 5 hrs/month
  | "strategic"     // 10 hrs/month
  | "hybrid"        // 20 hrs/month
  | "executive";    // 40+ hrs/month

export interface Organization {
  id: string;
  name: string;
  size_category: OrgSize;
  employee_count: number;
  industry: Industry;
  engagement_model: EngagementModel;
  monthly_hours: number;
  /** Subset of the 16 modules in scope for this engagement. Empty = full scope. */
  active_modules: number[];
  /** True for test/dummy clients. Sandbox-flagged orgs allow assessment-data reset; real orgs do not. */
  is_sandbox: boolean;
  created_at: string;
  updated_at: string;
}

// --- Stakeholder ---

export type InfluenceLevel = "decision_maker" | "influencer" | "contributor";

export interface Stakeholder {
  id: string;
  org_id: string;
  name: string;
  email: string;
  role: string;
  influence_level: InfluenceLevel;
  relevant_modules: number[];
  created_at: string;
}

// --- Assessment ---

export type AssessmentStatus = "draft" | "in_progress" | "completed" | "archived";
export type AssessmentType = "initial" | "quarterly" | "annual";

export interface Assessment {
  id: string;
  org_id: string;
  type: AssessmentType;
  status: AssessmentStatus;
  created_at: string;
  completed_at: string | null;
}

// --- Module Scores ---

export type MaturityLevel = 1 | 2 | 3 | 4 | 5;

// Maturity Level Definitions (standardized across AI-CDIO, AI-Strategist, AI-OME)
// Level 1: Initial — Ad hoc, reactive, minimal capability
// Level 2: Developing — Some processes, inconsistent execution
// Level 3: Defined — Documented processes, reliable execution
// Level 4: Managed — Measured, controlled, consistent outcomes
// Level 5: Optimizing — Continuous improvement, innovative, industry-leading

/**
 * "na" is the universal escape hatch — added Phase 1C 2026-05-06.
 * Synthesis treats N/A as missing data, never as a low score. Stakeholders
 * who genuinely can't speak to a question must have a way to say so honestly.
 */
export type DiagnosticAnswer = "yes" | "no" | "partial" | "na";

export interface DiagnosticResponse {
  question_id: string;
  question_text: string;
  answer: DiagnosticAnswer;
  evidence?: string;
}

export interface ModuleScore {
  id: string;
  assessment_id: string;
  stakeholder_id: string;
  module_number: number;
  /**
   * NULL when the stakeholder answered N/A on every question or hit the
   * module-gate. Synthesis layer skips NULL rows when computing consensus.
   */
  maturity_score: MaturityLevel | null;
  evidence: string;
  diagnostic_responses: DiagnosticResponse[];
  /**
   * True when the stakeholder hit the module-gate "Can you speak to this
   * area?" and answered N/A. Differentiates explicit module skip from
   * per-question abstention.
   */
  module_skipped: boolean;
  created_at: string;
}

// --- Question-Level Tagging (Phase 1C, locked 2026-04-29) ---
// Two-layer tagging system so a CEO and a CTO get different question subsets
// inside the same module. CEO sees strategic only; CTO sees technical +
// operational; CISO sees technical + risk; etc.

/**
 * Layer 1 — what kind of executive thinking the question requires.
 * A respondent must hold at least one matching tag to see the question.
 */
export type QuestionFunctionTag =
  | "strategic"     // governance, vision, business alignment
  | "financial"     // budget, ROI, vendor cost
  | "technical"     // architecture, implementation, controls
  | "operational"   // processes, day-to-day execution
  | "risk";         // compliance, threat, mitigation

/**
 * Layer 2 — which part of the company the question applies to.
 * Used primarily to route Director/Manager-level respondents (who own a
 * narrower slice of the org) to questions that fall in their lane.
 */
export type QuestionAreaTag =
  | "operations"
  | "sales"
  | "IT"
  | "finance"
  | "marketing"
  | "cross_functional";   // applies organization-wide

// --- Assessment Synthesis (computed from all stakeholder scores) ---

export type PriorityClass = "top_priority" | "strategic_bet" | "quick_win" | "maintain" | "defer";

export interface AssessmentSynthesis {
  id: string;
  assessment_id: string;
  module_number: number;
  consensus_score: number;          // weighted avg across stakeholders (1.0-5.0)
  divergence_score: number;         // std deviation — high = disagreement
  business_impact: number;          // 1-10 from stakeholder ratings
  priority_rank: number;            // 1-16 ordering
  priority_class: PriorityClass;
  recommended_actions: string[];
}

// --- Divergence (the "politics detector") ---

export interface DivergencePoint {
  module_number: number;
  module_name: string;
  stakeholder_a: { id: string; name: string; score: MaturityLevel; evidence: string };
  stakeholder_b: { id: string; name: string; score: MaturityLevel; evidence: string };
  score_gap: number;
  framework_recommendation: string;
  projected_roi: string;
}

// --- Roadmap ---

export type RoadmapType = "90_day" | "6_month" | "12_month";
export type RoadmapStatus = "draft" | "approved" | "active" | "completed";

export interface Roadmap {
  id: string;
  org_id: string;
  assessment_id: string;
  type: RoadmapType;
  status: RoadmapStatus;
  content: RoadmapContent;
  created_at: string;
}

export interface RoadmapContent {
  summary: string;
  quick_wins: Initiative[];
  strategic_initiatives: Initiative[];
  milestones: Milestone[];
}

export interface Initiative {
  id: string;
  roadmap_id: string;
  module_numbers: number[];
  title: string;
  description: string;
  priority_class: PriorityClass;
  value_score: number;    // 1-10
  effort_score: number;   // 1-10
  status: "planned" | "in_progress" | "completed" | "deferred";
  start_date?: string;
  end_date?: string;
  expected_roi?: string;
  owner?: string;
}

export interface Milestone {
  title: string;
  target_date: string;
  deliverables: string[];
  success_metrics: string[];
}

// --- Module Definitions ---

export const MODULE_NAMES: Record<number, string> = {
  1: "Role of the CIDO",
  2: "IT/Digital Transformation Strategy",
  3: "Enterprise Architecture & IT Modernization",
  4: "Cloud Computing & Infrastructure Strategy",
  5: "Cybersecurity, Risk Management & Compliance",
  6: "Data & AI Engineering",
  7: "Digital Ecosystems: Platforms & Products",
  8: "Data Analytics, BI & Decision Science",
  9: "Human Centered Design & Customer Journey",
  10: "Leadership, Business Strategy & Communications",
  11: "CIDO Organization Structure & Operations",
  12: "Financial Acumen",
  13: "Portfolio & Vendor Management",
  14: "Agile, DevOps & Innovation Management",
  15: "Business Process Transformation & Automation",
  16: "Future of Work & Workforce Development",
};

// --- Module Stacks (pre-built combinations from adaptation guide) ---

export const MODULE_STACKS = {
  quick_win: { name: "Quick Win Stack", modules: [15, 12, 5], timeline: "90 days", roi: "200-400%" },
  foundation: { name: "Foundation Builder", modules: [2, 11, 5], timeline: "120 days", roi: "150-300%" },
  data_intelligence: { name: "Data Intelligence", modules: [8, 6, 12], timeline: "180 days", roi: "200-500%" },
  cloud_transformation: { name: "Cloud Transformation", modules: [4, 3, 13], timeline: "180-270 days", roi: "150-350%" },
  digital_experience: { name: "Digital Experience", modules: [9, 7, 14], timeline: "180 days", roi: "200-400%" },
  enterprise_transformation: { name: "Enterprise Transformation", modules: [17, 10, 16], timeline: "12-18 months", roi: "300-800%" },
} as const;

// --- Org Size Priority Sequences (from adaptation guide) ---

export const SIZE_PRIORITY_SEQUENCES: Record<OrgSize, number[]> = {
  small: [5, 15, 4, 12, 2],        // Security → Automation → Cloud → Finance → Strategy
  medium: [2, 11, 8, 15, 14, 5],   // Strategy → Org → Analytics → Automation → Agile → Security
  large: [3, 10, 13, 6, 16, 7],    // Architecture → Leadership → Portfolio → Data/AI → Change → Ecosystems
};

// --- Agent Types ---

export type AgentType =
  | "orchestrator"
  | "assessment"
  | "strategy"
  | "decision_facilitation"
  | "roi_value"
  | "report"
  | "domain_specialist";

export type EngagementState =
  | "onboarding"
  | "assessment"
  | "analysis"
  | "strategy"
  | "execution"
  | "review";
