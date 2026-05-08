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
  /**
   * Legacy buckets kept for backward compatibility with persisted roadmaps.
   * New roadmaps still populate these AND tag each initiative with an
   * economic outcome so the UI can re-group by outcome on display.
   */
  quick_wins: Initiative[];
  strategic_initiatives: Initiative[];
  milestones: Milestone[];
}

/**
 * Better/cheaper/faster proof claim, attached to every initiative produced
 * after the outcome reframe. Forces the strategy agent to declare WHY
 * each recommendation beats the CEO's alternatives (DIY, big consultancy,
 * full-time hire). Optional on persisted older roadmaps.
 */
export interface InitiativeProof {
  /** Why this approach is better than the alternative. One sentence. */
  better: string;
  /** Why this approach is cheaper. Concrete cost delta where possible. */
  cheaper: string;
  /** Why this approach is faster. Concrete time delta where possible. */
  faster: string;
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
  /**
   * Primary economic outcome this initiative produces. Used by the UI to
   * group the roadmap into the five CEO-facing buckets. Optional for
   * backward compatibility with roadmaps generated before the reframe.
   */
  outcome?: EconomicOutcome;
  /**
   * Better/cheaper/faster proof. Populated by the strategy agent. Optional
   * for backward compatibility with roadmaps generated before the reframe.
   */
  proof?: InitiativeProof;
  /**
   * Hard-dollar quick-win anchor when one exists. Free-form so the agent
   * can say "$30K-$60K annual SaaS savings" or "10 hrs/week reclaimed at
   * $50/hr blended = $26K/yr." When present, the UI shows this prominently
   * instead of the abstract priority class.
   */
  dollar_anchor?: string;
}

export interface Milestone {
  title: string;
  target_date: string;
  deliverables: string[];
  success_metrics: string[];
}

// --- Module Definitions ---
//
// Phase 1C Day 11 (2026-05-07) outcome-led rename. Each module is a
// dimension of fractional-CDIO methodology, anchored to a recognized
// framework so the assessment is auditable and credible. The one-liner
// names what the module asks of the organization in plain English the
// CEO would use at dinner — not the framework jargon.

/**
 * The five economic outcomes a CEO buys at the SMB stage. The 16 modules
 * are HOW we measure; these five are HOW the CEO consumes the result.
 *
 * Every module declares ONE primary outcome it produces (modules can
 * touch others, but every module owns one). The roadmap output and
 * pain-point entry are grouped by these outcomes, not by module.
 */
export type EconomicOutcome =
  | "make_money"      // top-line: revenue, margin, retention
  | "save_money"      // cost takeout: SaaS, vendor, cloud, FinOps
  | "save_time"       // productivity: automation, delivery velocity
  | "preserve_money"  // risk to cash already earned: security, compliance
  | "preserve_time";  // avoid wasted hours: incidents, rework, firefighting

export const ECONOMIC_OUTCOME_META: Record<EconomicOutcome, { label: string; ceoQuestion: string; orderRank: number }> = {
  make_money:     { label: "Make money",     ceoQuestion: "Where is technology blocking revenue you could be earning right now?", orderRank: 1 },
  save_money:     { label: "Save money",     ceoQuestion: "What is the biggest tech bill you would happily kill if you could prove it does not matter?", orderRank: 2 },
  save_time:      { label: "Save time",      ceoQuestion: "Where are people doing work a machine could do reliably?", orderRank: 3 },
  preserve_money: { label: "Preserve money", ceoQuestion: "What single tech failure would wipe out a quarter of cash if it happened tomorrow?", orderRank: 4 },
  preserve_time:  { label: "Preserve time",  ceoQuestion: "Where is your team firefighting the same thing month after month?", orderRank: 5 },
};

export interface ModuleMeta {
  /** Outcome-led name shown across the UI. */
  name: string;
  /** Plain-English one-liner — what this module asks of the organization. */
  oneLiner: string;
  /** Anchor framework(s) — surfaced as authority in the workspace tooltip. */
  framework: string;
  /** Primary economic outcome this module produces. Used to group roadmap output for CEO consumption. */
  outcome: EconomicOutcome;
}

export const MODULE_META: Record<number, ModuleMeta> = {
  1: {
    name: "Technology Leadership at the Top",
    oneLiner: "Is there a real seat at the executive table for technology?",
    framework: "Gartner CIO Leadership Model",
    outcome: "make_money",
  },
  2: {
    name: "Tech Strategy & Business Alignment",
    oneLiner: "Is your technology strategy actually aligned with where the business is going?",
    framework: "KPMG 4-Practice Alignment + MIT Strategic Alignment Model",
    outcome: "make_money",
  },
  3: {
    name: "Tech Foundation & Modernization",
    oneLiner: "Is your tech foundation working with you or against you?",
    framework: "TOGAF (lite) + Gartner Application Modernization",
    outcome: "preserve_money",
  },
  4: {
    name: "Cloud & Infrastructure",
    oneLiner: "Is your cloud spend disciplined and your infrastructure resilient?",
    framework: "AWS Well-Architected + FinOps Foundation",
    outcome: "save_money",
  },
  5: {
    name: "Security, Risk & Compliance",
    oneLiner: "Are you protecting the business, or hoping nothing happens?",
    framework: "NIST CSF v2.0 + CMMI",
    outcome: "preserve_money",
  },
  6: {
    name: "Data & AI Capabilities",
    oneLiner: "Is your data ready to power AI, or is AI exposing a data problem?",
    framework: "NIST AI RMF + DAMA-DMBOK",
    outcome: "make_money",
  },
  7: {
    name: "Platforms, APIs & Digital Products",
    oneLiner: "Are your systems connected enough to create digital revenue?",
    framework: "TOGAF Integration + Postman API Maturity",
    outcome: "make_money",
  },
  8: {
    name: "Analytics & Data-Driven Decisions",
    oneLiner: "Are you making decisions on data, or on gut feel dressed up as data?",
    framework: "Gartner Analytics Maturity Model",
    outcome: "make_money",
  },
  9: {
    name: "Customer Experience & Journey",
    oneLiner: "Do you know what your customer feels at every touchpoint, and is it improving?",
    framework: "Forrester CX Index + Service Design Network",
    outcome: "make_money",
  },
  10: {
    name: "Executive Communication & Influence",
    oneLiner: "Does technology have a voice the rest of the executive team listens to?",
    framework: "HBR Leadership + IT-CMF",
    outcome: "make_money",
  },
  11: {
    name: "IT Team Structure & Operations",
    oneLiner: "Is your IT team set up to deliver, or set up to firefight?",
    framework: "ITIL 4",
    outcome: "preserve_time",
  },
  12: {
    name: "Tech Finance & Value Realization",
    oneLiner: "Do you know what your technology costs and what it returns?",
    framework: "TBM Council + KPMG Return on Objectives",
    outcome: "save_money",
  },
  13: {
    name: "Portfolio, Vendors & SaaS Spend",
    oneLiner: "Are you running your vendor portfolio, or is it running you?",
    framework: "Gartner ITPPM + SaaS Optimization",
    outcome: "save_money",
  },
  14: {
    name: "Delivery, DevOps & Innovation",
    oneLiner: "How fast can you ship a working change to your customer?",
    framework: "DORA Metrics + SAFe",
    outcome: "save_time",
  },
  15: {
    name: "Process Automation & Transformation",
    oneLiner: "Where is human time being wasted on work a machine could do reliably?",
    framework: "APQC PCF + Lean Six Sigma",
    outcome: "save_time",
  },
  16: {
    name: "Workforce, Skills & Change",
    oneLiner: "Is your team ready for the technology you're rolling out?",
    framework: "Prosci ADKAR + Kotter 8-Step",
    outcome: "preserve_time",
  },
};

// --- Helpers ---

/** Get all modules grouped by their primary economic outcome. */
export function modulesByOutcome(): Record<EconomicOutcome, number[]> {
  const grouped: Record<EconomicOutcome, number[]> = {
    make_money: [],
    save_money: [],
    save_time: [],
    preserve_money: [],
    preserve_time: [],
  };
  for (const [num, meta] of Object.entries(MODULE_META)) {
    grouped[meta.outcome].push(Number(num));
  }
  return grouped;
}

/**
 * Backwards-compatible export. Many call sites still import MODULE_NAMES;
 * they keep working because the surface is unchanged.
 */
export const MODULE_NAMES: Record<number, string> = Object.fromEntries(
  Object.entries(MODULE_META).map(([k, v]) => [Number(k), v.name])
) as Record<number, string>;

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
