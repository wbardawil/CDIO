// ============================================================
// AI-CDIO — Diagnostic Questions
//
// Phase 1C question schema (locked 2026-04-29, Module 5 first proof
// shipped 2026-05-06). Old questions (Modules 1-4, 6-16) coexist with
// the new schema via OPTIONAL extension fields. Modules 12 + 15 get
// the full v2 treatment Days 12-13. Other modules ride the legacy
// shape until later phases.
//
// New fields on top of the legacy shape:
//   - level_indicators.level_5  — the "optimizing/innovating" tier
//   - tags.function[]           — one or more executive-function tags
//   - tags.area[]               — one or more business-area tags
//   - framework_citation        — named source (NIST CSF, CMMI, etc.)
//   - na_eligible (default true) — N/A is offered on every new-schema
//     question. Set false only for questions where N/A makes no sense
//     (none today; reserved for future use).
// ============================================================

import type {
  QuestionFunctionTag,
  QuestionAreaTag,
} from "@/types";

export interface QuestionTags {
  function: QuestionFunctionTag[];
  area: QuestionAreaTag[];
}

export interface FrameworkCitation {
  /** Human-readable source name shown to the respondent, e.g. "NIST CSF v2.0". */
  framework: string;
  /** The specific subcategory / process area / control reference. */
  reference: string;
  /** Plain-English one-liner explaining why the framework cares about this. */
  rationale: string;
}

export interface DiagnosticQuestion {
  id: string;
  module_number: number;
  subcategory: string;
  question: string;
  level_indicators: {
    level_1: string;
    level_2: string;
    level_3: string;
    level_4: string;
    /** Phase 1C addition. Optional on legacy questions. */
    level_5?: string;
  };
  /** Phase 1C addition. Absent = question is shown to all roles. */
  tags?: QuestionTags;
  /** Phase 1C addition. Absent = no inline citation surfaced. */
  framework_citation?: FrameworkCitation;
  /** Phase 1C addition. Default true. False would hide the N/A escape. */
  na_eligible?: boolean;
  /**
   * Provenance — where this question's content originated. Required on
   * any question shipped after the 2026-05-08 hallucination-cut commit
   * so the chain of custody is auditable. Values are strings like:
   *   "NIST CSF v2.0 — public framework"
   *   "DORA / Accelerate State of DevOps 2024 — published"
   *   "AMP AI Diagnostic Playbook — user-provided 2026-05-08"
   *   "TBM Council published taxonomy"
   *   "Phase 1C Day 8 prior-session work — anchored to NIST CSF + CMMI"
   * Optional today only because Modules 5 / 12 / 15 predate the field
   * and will be backfilled in a follow-up source-grounding pass.
   */
  provenance?: string;
}

export const DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  // ============================================================
  // MODULE 1: Technology Leadership at the Top
  // Cut from 12 questions to 3 signal questions on 2026-05-08.
  // Removed questions were AI-CDIO interpolation that could not
  // map to a specific named element of a published framework.
  // The three retained questions each map to a defensible
  // structural construct from public CIO research.
  // ============================================================
  {
    id: "m1_q1", module_number: 1, subcategory: "Reporting Structure",
    question: "Does the senior technology leader (CIO / CTO / CDIO) report directly to the CEO — not through the COO or CFO?",
    level_indicators: {
      level_1: "Technology reports to Finance or Operations; technology priorities are filtered through another function's lens before reaching the CEO.",
      level_2: "Technology reports to the COO; technology is treated as an operational support function.",
      level_3: "Technology reports directly to the CEO; the relationship is regular and substantive.",
      level_4: "Direct CEO reporting line plus a standing tech item on the board agenda.",
      level_5: "Technology leader is an officer of the company with fiduciary responsibility commensurate with the CFO or COO.",
    },
    tags: { function: ["strategic"], area: ["IT", "cross_functional"] },
    framework_citation: {
      framework: "Gartner CIO Survey + Forrester CIO Effectiveness research",
      reference: "Reporting structure and CIO effectiveness — Gartner's annual CIO Survey reports correlation between CIO reporting line and digital-strategy outcomes",
      rationale: "Gartner's longitudinal CIO research finds CIOs reporting to the CEO are materially more likely to lead enterprise digital strategy than CIOs reporting to the CFO; reporting line is the single most cited structural variable in CIO effectiveness research.",
    },
    provenance: "Gartner CIO Survey — public Gartner research; reporting-line correlation with effectiveness is a long-running, well-attested Gartner finding. Question wording adapted by AI-CDIO from the public construct; not a verbatim extract.",
  },
  {
    id: "m1_q2", module_number: 1, subcategory: "Strategic Participation",
    question: "Is technology leadership at the strategic-planning table from kickoff — co-creating strategy — rather than receiving a finished business strategy and executing against it?",
    level_indicators: {
      level_1: "Technology is not consulted in strategic planning; tech leadership receives the strategy as a fait accompli.",
      level_2: "Technology is consulted only on technical feasibility once the strategy is drafted.",
      level_3: "Technology is at the planning table from the start, contributing on what's possible, what's emerging, what competitors are doing.",
      level_4: "Technology co-drives strategic moves — M&A, market entry, productization decisions hinge on technology counsel.",
      level_5: "Strategy and technology strategy are co-created; the company's competitive position is technology-shaped at every cycle.",
    },
    tags: { function: ["strategic"], area: ["IT", "cross_functional"] },
    framework_citation: {
      framework: "MIT Strategic Alignment Model (Henderson & Venkatraman, 1993)",
      reference: "Strategy Execution + Technology Transformation alignment perspectives",
      rationale: "Henderson & Venkatraman's published MIT framework defines the four alignment perspectives, of which two require technology participation in strategy formulation; absence of that participation places the company in the lower-performing alignment quadrants documented in the model.",
    },
    provenance: "MIT Strategic Alignment Model — Henderson & Venkatraman 1993, IBM Systems Journal — public peer-reviewed research. Question wording adapted by AI-CDIO from the published alignment perspectives; not a verbatim extract from the paper.",
  },
  {
    id: "m1_q3", module_number: 1, subcategory: "Strategic Positioning",
    question: "Does the rest of the executive team treat IT as a strategic enabler rather than a cost center to be minimized?",
    level_indicators: {
      level_1: "IT is treated as overhead; the executive conversation is dominated by cost reduction.",
      level_2: "Some executives see IT as strategic; others still treat it as a cost line.",
      level_3: "IT is broadly recognized as a strategic capability; investment conversations focus on outcomes, not ticket count.",
      level_4: "IT investment is competed for, not avoided; functional leaders pull tech leadership into their planning.",
      level_5: "Technology is the company's competitive moat — how the company wins, not how it operates.",
    },
    tags: { function: ["strategic"], area: ["IT", "cross_functional"] },
    framework_citation: {
      framework: "MIT CISR + Harvard Business Review research on IT positioning",
      reference: "Cost-center vs strategic-enabler dichotomy — long-running thesis in MIT CISR and HBR research on technology executive positioning",
      rationale: "MIT CISR's digital-maturity research and HBR's CIO-effectiveness research both find that companies treating IT as a strategic enabler outperform companies treating IT as cost overhead on multiple multi-year outcome metrics.",
    },
    provenance: "MIT CISR + HBR — published academic and trade research on IT positioning. Concept is well-attested in management literature; question wording adapted by AI-CDIO, not a verbatim extract.",
  },

  // ============================================================
  // MODULE 2: Tech Strategy & Business Alignment
  // Cut from 12 questions to 3 signal questions on 2026-05-08.
  // Each retained question maps to a specific construct in MIT's
  // published Strategic Alignment Model or to the Henderson &
  // Venkatraman alignment perspectives.
  // ============================================================
  {
    id: "m2_q1", module_number: 2, subcategory: "Strategy Linkage",
    question: "Is the technology strategy explicitly linked to business strategy on a single document — every tech investment maps to a named business goal?",
    level_indicators: {
      level_1: "Tech strategy and business strategy are independent documents that don't reference each other.",
      level_2: "Some references exist but the linkage is shallow; tech strategy could survive a different business strategy unchanged.",
      level_3: "A one-page artifact maps every tech investment to a named business goal; reviewed alongside business-plan reviews.",
      level_4: "Business strategy explicitly relies on technology capabilities to be delivered; tech delivery affects business commitments.",
      level_5: "Business and technology strategy are co-developed; the company plans, allocates, and reviews them together.",
    },
    tags: { function: ["strategic"], area: ["IT", "cross_functional"] },
    framework_citation: {
      framework: "MIT Strategic Alignment Model (Henderson & Venkatraman)",
      reference: "Strategic Fit construct — alignment between business strategy and IT strategy domains",
      rationale: "Henderson & Venkatraman's published model identifies Strategic Fit (vertical alignment between strategy and infrastructure) as one of two pillars of effective alignment; absent linkage signals the misaligned quadrants the model flags as underperformers.",
    },
    provenance: "MIT Strategic Alignment Model — Henderson & Venkatraman 1993, IBM Systems Journal — public peer-reviewed source. Question wording adapted by AI-CDIO from the published Strategic Fit construct.",
  },
  {
    id: "m2_q2", module_number: 2, subcategory: "Execution Discipline",
    question: "Does the strategy have a phased roadmap with quarterly milestones, named owners, and dependency tracking — not a multi-year monolith?",
    level_indicators: {
      level_1: "No roadmap; strategy is aspiration without a path.",
      level_2: "A high-level timeline exists but lacks milestones, dependencies, or owners.",
      level_3: "Detailed roadmap with quarterly milestones, owners, and dependencies; reviewed monthly.",
      level_4: "Roadmap is dynamic — outcomes from completed milestones reshape the upcoming ones; the plan adapts while the strategy holds.",
      level_5: "Roadmap is a managed portfolio with risk-adjusted forecasting; strategic outcomes tracked at the same rigor as financial outcomes.",
    },
    tags: { function: ["strategic", "operational"], area: ["IT", "cross_functional"] },
    framework_citation: {
      framework: "PMI Strategic Roadmap practice + Gartner Strategic Planning research",
      reference: "Phased roadmap discipline as a precondition for strategy execution",
      rationale: "Strategy without a sequenced roadmap is intent without commitment; PMI's project-portfolio practice and Gartner's strategic-planning research both treat phased roadmaps as the operational artifact that translates strategy into execution.",
    },
    provenance: "PMI Standard for Portfolio Management + Gartner published planning practice — public framework material. Question wording adapted by AI-CDIO; not a verbatim extract.",
  },
  {
    id: "m2_q3", module_number: 2, subcategory: "Refresh Cadence",
    question: "Is the technology strategy revisited at least quarterly — keep / adjust / kill decisions made against measured outcomes — not left to drift between annual planning cycles?",
    level_indicators: {
      level_1: "Strategy was written once and has not been revisited; reality has moved on.",
      level_2: "Annual review only; the world moves faster than the cadence.",
      level_3: "Quarterly review with explicit decisions to keep, adjust, or kill initiatives based on outcomes.",
      level_4: "Continuous adaptation — leading indicators trigger mid-cycle re-plans without ceremony.",
      level_5: "Strategy is a managed portfolio; the company is comfortable actively reshaping it while holding the underlying ambition stable.",
    },
    tags: { function: ["strategic"], area: ["IT", "cross_functional"] },
    framework_citation: {
      framework: "MIT CISR Digital Strategy research",
      reference: "Strategic Agility — quarterly strategy refresh as a predictor of digital outcomes in mid-market firms",
      rationale: "MIT CISR's published digital-maturity research finds that companies refreshing strategy quarterly outperform annual-only reviewers on multi-year revenue and earnings outcomes; the cadence itself is a tested variable.",
    },
    provenance: "MIT CISR — public Sloan-affiliated research center — published research on digital strategic agility. Question wording adapted by AI-CDIO from the cadence finding.",
  },

  // ============================================================
  // MODULE 3: Tech Foundation & Modernization
  // Cut from 12 questions to 3 signal questions on 2026-05-08.
  // Each retained question maps to a specific construct in
  // TOGAF or Gartner's published Application Modernization model.
  // ============================================================
  {
    id: "m3_q1", module_number: 3, subcategory: "Architecture Visibility",
    question: "Do you have a maintained inventory of every production system, application, and data store the business depends on — owner, business function, criticality?",
    level_indicators: {
      level_1: "No system inventory; surprises happen when a forgotten system breaks or an invoice arrives.",
      level_2: "Partial inventory in scattered docs; coverage uneven and out of date.",
      level_3: "Maintained inventory of all production systems with owner, business function, criticality; reviewed quarterly.",
      level_4: "Inventory is automated where possible (CMDB / asset discovery); drift monitored.",
      level_5: "Inventory is the architectural backbone — every change conversation references it; new systems catalogued at deploy.",
    },
    tags: { function: ["technical", "operational"], area: ["IT"] },
    framework_citation: {
      framework: "TOGAF (The Open Group Architecture Framework)",
      reference: "Architecture Repository — TOGAF ADM Phase H (Architecture Change Management) requires a maintained Architecture Repository as the source of truth for systems and capabilities",
      rationale: "TOGAF's published Architecture Development Method requires the Architecture Repository as a precondition for any modernization or change-management work; absence is the first audit finding in any TOGAF-aligned review.",
    },
    provenance: "TOGAF — The Open Group Architecture Framework, public standard. Question wording adapted by AI-CDIO from the published Architecture Repository concept.",
  },
  {
    id: "m3_q2", module_number: 3, subcategory: "Modernization Strategy",
    question: "Has every load-bearing system been classified using the 5R taxonomy (Retire, Retain, Replatform, Refactor, Replace) with sequencing over the next 24 months?",
    level_indicators: {
      level_1: "No modernization strategy; whatever is on fire gets the budget.",
      level_2: "Some modernization on the radar; not sequenced or budgeted.",
      level_3: "Documented 5R classification for top systems; sequenced over 24 months.",
      level_4: "Strategy reviewed quarterly with progress against plan.",
      level_5: "Modernization is continuous — retiring debt is a discipline, not a program.",
    },
    tags: { function: ["strategic", "technical"], area: ["IT", "cross_functional"] },
    framework_citation: {
      framework: "Gartner Application Modernization",
      reference: "5R Framework — Retire / Retain / Replatform / Refactor / Replace classification",
      rationale: "Gartner's 5R taxonomy is the most widely recognized application-modernization framework; the 5 categories force an explicit per-system disposition decision rather than passive accumulation.",
    },
    provenance: "Gartner Application Modernization 5R framework — Gartner published research, widely cited in modernization trade press. Question wording adapted by AI-CDIO; not a verbatim Gartner extract.",
  },
  {
    id: "m3_q3", module_number: 3, subcategory: "Lifecycle Tracking",
    question: "Do you maintain a technology lifecycle register tracking which systems are approaching vendor end-of-life, unsupported versions, or security-debt thresholds — reviewed quarterly?",
    level_indicators: {
      level_1: "End-of-life tracking is ad hoc; the company is surprised by unsupported software.",
      level_2: "Major systems tracked; long tail unmonitored.",
      level_3: "Documented lifecycle register; quarterly review of upcoming end-of-life events.",
      level_4: "Lifecycle is a budget input — sunset and modernization investments come from this register, not crisis.",
      level_5: "Modernization is a managed program; legacy debt is reduced systematically each year.",
    },
    tags: { function: ["technical", "operational", "risk"], area: ["IT"] },
    framework_citation: {
      framework: "Gartner IT Lifecycle Management + ISO/IEC 19770 IT Asset Management",
      reference: "Software lifecycle stages and end-of-support tracking",
      rationale: "ISO/IEC 19770 ITAM and Gartner lifecycle research both treat end-of-support tracking as a foundational asset-management discipline; absence is a routine audit finding and a top vector for security incidents.",
    },
    provenance: "ISO/IEC 19770 ITAM — published international standard; Gartner ITAM research. Question wording adapted by AI-CDIO from the lifecycle-tracking construct.",
  },

  // ============================================================
  // MODULE 4: Cloud & Infrastructure
  // Cut from 12 questions to 6 signal questions on 2026-05-08.
  // Each retained question maps to a specific AWS Well-Architected
  // pillar or FinOps Foundation phase.
  // ============================================================
  {
    id: "m4_q1", module_number: 4, subcategory: "Architecture Posture",
    question: "Have your business-critical cloud workloads been reviewed against the AWS Well-Architected Framework's six pillars (Operational Excellence, Security, Reliability, Performance Efficiency, Cost Optimization, Sustainability)?",
    level_indicators: {
      level_1: "Workloads in cloud but architecture choices are undocumented and unreviewed.",
      level_2: "Some informal review; gaps unidentified; no documented findings.",
      level_3: "Documented Well-Architected review for critical workloads; high-risk findings remediated.",
      level_4: "Reviews happen at major change; deviations are explicit and time-bounded.",
      level_5: "Architecture is continuously assessed against the framework; recognizable as well-architected at audit.",
    },
    tags: { function: ["technical", "operational", "risk"], area: ["IT"] },
    framework_citation: {
      framework: "AWS Well-Architected Framework",
      reference: "Six Pillars: Operational Excellence, Security, Reliability, Performance Efficiency, Cost Optimization, Sustainability",
      rationale: "AWS's Well-Architected Framework defines six explicit pillars and a published review tool; the framework applies cross-cloud (Azure and GCP have published equivalents).",
    },
    provenance: "AWS Well-Architected Framework — public AWS documentation, six named pillars. Question wording adapted by AI-CDIO from the published pillar set.",
  },
  {
    id: "m4_q2", module_number: 4, subcategory: "DR Discipline",
    question: "Has your disaster-recovery plan been tested at least annually with documented RTO / RPO targets — not just backups assumed to work?",
    level_indicators: {
      level_1: "Backups exist but have never been tested; recovery is hopeful.",
      level_2: "DR plan documented but not tested; theoretical confidence only.",
      level_3: "DR plan tested at least annually; documented RTO / RPO targets met or gaps identified.",
      level_4: "Quarterly DR drills; failover capabilities exercised on real data.",
      level_5: "DR is operational muscle; the company has recovered from real incidents and trained against them.",
    },
    tags: { function: ["technical", "operational", "risk"], area: ["IT"] },
    framework_citation: {
      framework: "AWS Well-Architected Reliability Pillar + ISO 22301 Business Continuity",
      reference: "Reliability Pillar — DR testing requirement; ISO 22301 BCMS testing clause",
      rationale: "AWS Reliability Pillar and ISO 22301 both treat untested DR as effectively absent DR; documented testing is the floor of resilience claims.",
    },
    provenance: "AWS Well-Architected Reliability Pillar + ISO 22301 — public framework / international standard. Question wording adapted by AI-CDIO.",
  },
  {
    id: "m4_q3", module_number: 4, subcategory: "Deployment Automation",
    question: "Are deployments automated through infrastructure-as-code and CI/CD pipelines — not manual SSH into production?",
    level_indicators: {
      level_1: "Manual deploys; infrastructure changes by hand; production drift is constant.",
      level_2: "Some automation; coverage partial; emergency changes still by hand.",
      level_3: "Infrastructure-as-code for production; CI/CD pipelines for app deploys; rollback paths defined.",
      level_4: "Deploy frequency and lead time are measured; deployments are routine, not events.",
      level_5: "DORA elite metrics — deploy on demand, lead time hours not days, change-fail rate <15%, MTTR minutes not hours.",
    },
    tags: { function: ["technical", "operational"], area: ["IT"] },
    framework_citation: {
      framework: "DORA / Accelerate State of DevOps + AWS Well-Architected Operational Excellence",
      reference: "Four DORA metrics (deployment frequency, lead time for changes, change-fail rate, MTTR); AWS OpEx automation guidance",
      rationale: "DORA's published research (Accelerate book + annual State of DevOps reports) measures deploy automation as the single strongest correlate of operational performance and reliability.",
    },
    provenance: "DORA / Accelerate State of DevOps Reports — Forsgren / Humble / Kim, public peer-reviewed research; AWS Well-Architected Op Excellence. Question wording adapted by AI-CDIO.",
  },
  {
    id: "m4_q4", module_number: 4, subcategory: "FinOps Cost Visibility",
    question: "Is your cloud spend tagged and broken down by team / application / environment, with monthly review — or do bills arrive as opaque surprises?",
    level_indicators: {
      level_1: "Cloud bills arrive monthly and surprise everyone; nobody owns the trend.",
      level_2: "Total cloud spend known; per-workload / per-team breakdown is opaque.",
      level_3: "Cloud spend tagged and broken down; reviewed monthly with named owner.",
      level_4: "Engineers see cost impact in dashboards in real time; right-sizing continuous.",
      level_5: "FinOps is a managed practice — cost is a first-class engineering metric, not a finance problem.",
    },
    tags: { function: ["financial", "technical", "operational"], area: ["IT", "finance"] },
    framework_citation: {
      framework: "FinOps Foundation Framework",
      reference: "Inform Phase — published as one of three FinOps lifecycle phases (Inform → Optimize → Operate)",
      rationale: "FinOps Foundation's published framework defines the Inform phase as the precondition for every cost-discipline practice; without it, optimization is guesswork.",
    },
    provenance: "FinOps Foundation Framework — public open framework, three-phase lifecycle named in the official documentation. Question wording adapted by AI-CDIO from the Inform phase definition.",
  },
  {
    id: "m4_q5", module_number: 4, subcategory: "FinOps Cost Optimization",
    question: "Have reserved instances, committed-use discounts, or savings plans been applied to predictable workloads — capturing the cheapest cloud savings available?",
    level_indicators: {
      level_1: "All on-demand pricing; no commitments.",
      level_2: "Some reservations purchased opportunistically; coverage uneven.",
      level_3: "Reservation strategy by workload class; coverage rate measured and reviewed monthly.",
      level_4: "Reservation portfolio actively managed — purchases, modifications, retirements aligned to changing usage.",
      level_5: "Reservation discipline approaches theoretical maximum savings without over-commitment risk.",
    },
    tags: { function: ["financial", "technical"], area: ["IT", "finance"] },
    framework_citation: {
      framework: "FinOps Foundation Framework",
      reference: "Optimize Phase — Commitment-based Discounts (RIs, CUDs, Savings Plans)",
      rationale: "FinOps Optimize phase calls out commitment-based discounts as one of the highest-ROI cost-optimization motions; AWS, Azure, and GCP all publish reservation programs the framework references.",
    },
    provenance: "FinOps Foundation Framework — public open framework. Reservation / commitment-discount construct is defined by AWS RI / Azure RI / GCP CUD documentation. Question wording adapted by AI-CDIO.",
  },
  {
    id: "m4_q6", module_number: 4, subcategory: "FinOps Waste Management",
    question: "Are idle resources (orphaned VMs, oversized instances, unattached storage) actively identified and removed — not accumulated as silent waste?",
    level_indicators: {
      level_1: "No idle-resource discipline; waste accumulates indefinitely.",
      level_2: "Periodic cleanups when bills get scary; not systematic.",
      level_3: "Monthly idle-resource sweep with named owner; orphans tagged for retirement.",
      level_4: "Automated detection + recommendations; right-sizing in continuous-improvement loop.",
      level_5: "Idle waste rate is a tracked KPI below industry benchmark.",
    },
    tags: { function: ["financial", "technical", "operational"], area: ["IT", "finance"] },
    framework_citation: {
      framework: "FinOps Foundation Framework",
      reference: "Operate Phase — Waste Management capabilities",
      rationale: "FinOps Foundation's Operate phase defines waste management as a core continuous practice; cloud-cost research consistently finds 30%+ waste on unmanaged accounts.",
    },
    provenance: "FinOps Foundation Framework — public open framework, Operate phase capabilities. Question wording adapted by AI-CDIO.",
  },

  // ============================================================
  // MODULE 5: Cybersecurity, Risk Management & Compliance
  //
  // Phase 1C deep rewrite (2026-05-06). Question bank realigned to
  // NIST Cybersecurity Framework v2.0 (six functions: GOVERN, IDENTIFY,
  // PROTECT, DETECT, RESPOND, RECOVER) with maturity rubrics drawn
  // from CMMI-DEV v2.0 (Initial → Optimizing). Every question carries:
  //   - Layer-1 function tag (so role mapping can filter to qualified
  //     respondents)
  //   - Layer-2 area tag (so Director/Manager respondents land on
  //     questions in their lane)
  //   - Level-5 indicator describing the "industry-leading" state
  //   - Framework citation surfaced inline in the assessment UI
  //   - na_eligible default true (universal N/A escape)
  // ============================================================

  // ----- GOVERN function (NIST CSF GV) -----
  {
    id: "m5_q1", module_number: 5, subcategory: "Governance & Strategy",
    question: "Is there a documented cybersecurity policy approved by executive leadership?",
    level_indicators: {
      level_1: "No documented policy; security is the IT team's informal responsibility.",
      level_2: "Basic policy exists but is outdated, unsigned, or unread by most of the organization.",
      level_3: "Comprehensive policy aligned to a recognized framework (NIST CSF / ISO 27001), reviewed annually, signed by leadership.",
      level_4: "Policy is metric-driven — exceptions tracked, control effectiveness measured quarterly, drift reported to risk committee.",
      level_5: "Policy is a living document refined continuously from threat intel, post-incident learnings, and peer benchmarking; cited as industry exemplar.",
    },
    tags: { function: ["strategic", "risk"], area: ["cross_functional"] },
    framework_citation: {
      framework: "NIST CSF v2.0",
      reference: "GV.PO — Policy",
      rationale: "Documented, leadership-endorsed policy is the foundation of every NIST CSF GOVERN subcategory.",
    },
  },
  {
    id: "m5_q2", module_number: 5, subcategory: "Governance & Strategy",
    question: "Does the executive team review cybersecurity risk at least quarterly?",
    level_indicators: {
      level_1: "Cyber risk never reaches the executive agenda.",
      level_2: "Discussed only after an incident or audit finding.",
      level_3: "Quarterly review with documented decisions and risk register updates.",
      level_4: "Risk reviewed monthly with measured exposure trends and tolerance thresholds.",
      level_5: "Cyber risk integrated into enterprise risk management; executive decisions explicitly weigh cyber posture alongside financial and operational risk.",
    },
    tags: { function: ["strategic", "risk"], area: ["cross_functional"] },
    framework_citation: {
      framework: "NIST CSF v2.0",
      reference: "GV.RM — Risk Management Strategy",
      rationale: "Risk decisions must be visible at the executive level, not delegated to IT, for the organization to claim mature governance.",
    },
  },
  {
    id: "m5_q3", module_number: 5, subcategory: "Governance & Strategy",
    question: "Is there a named accountable owner for cybersecurity (CISO, vCISO, or equivalent)?",
    level_indicators: {
      level_1: "No named owner; responsibility is implicit on whoever runs IT.",
      level_2: "IT manager carries the title informally; not in their job description.",
      level_3: "Named CISO / vCISO with documented charter and direct line to executive leadership.",
      level_4: "Owner has staff, budget authority, and KPIs reviewed by executives.",
      level_5: "Security leadership is a peer to other C-suite functions, drives strategic decisions, and shapes product/M&A roadmap.",
    },
    tags: { function: ["strategic"], area: ["cross_functional"] },
    framework_citation: {
      framework: "NIST CSF v2.0",
      reference: "GV.RR — Roles, Responsibilities & Authorities",
      rationale: "Clear ownership is the prerequisite for any sustained security program.",
    },
  },

  // ----- IDENTIFY function (NIST CSF ID) -----
  {
    id: "m5_q4", module_number: 5, subcategory: "Asset & Risk Identification",
    question: "Does the organization maintain a current inventory of critical IT assets and data?",
    level_indicators: {
      level_1: "No inventory; teams discover assets when something breaks.",
      level_2: "Spreadsheet inventory updated annually or after audits.",
      level_3: "Asset management system with quarterly reconciliation; covers endpoints, servers, SaaS, and crown-jewel data.",
      level_4: "Continuous discovery via automated tools; assets tagged with criticality and data sensitivity; orphaned assets flagged.",
      level_5: "Real-time asset graph linked to identity, network, and data flows; supports automated risk scoring and lifecycle decisions.",
    },
    tags: { function: ["technical", "operational"], area: ["IT"] },
    framework_citation: {
      framework: "NIST CSF v2.0",
      reference: "ID.AM — Asset Management",
      rationale: "You cannot protect what you do not know you have. Asset inventory is the first hard problem in every framework.",
    },
  },
  {
    id: "m5_q5", module_number: 5, subcategory: "Asset & Risk Identification",
    question: "Are cybersecurity risks formally identified, prioritized, and tracked in a risk register?",
    level_indicators: {
      level_1: "No risk register; risks live in people's heads.",
      level_2: "Risks captured during annual audits or after incidents; not maintained.",
      level_3: "Documented risk register with owners, mitigation plans, and quarterly review.",
      level_4: "Risk register quantifies likelihood × impact in dollars; mitigation effectiveness measured against KPIs.",
      level_5: "Risk register integrates threat intelligence, peer-incident data, and predictive modeling; drives investment decisions.",
    },
    tags: { function: ["risk", "strategic"], area: ["cross_functional"] },
    framework_citation: {
      framework: "NIST CSF v2.0",
      reference: "ID.RA — Risk Assessment",
      rationale: "A risk register is the artifact regulators and insurers require to demonstrate due care.",
    },
  },
  {
    id: "m5_q6", module_number: 5, subcategory: "Asset & Risk Identification",
    question: "Are third-party / vendor cybersecurity risks assessed before onboarding?",
    level_indicators: {
      level_1: "Vendors onboarded with no security review.",
      level_2: "Ad hoc questionnaire on request; no formal process.",
      level_3: "Documented vendor risk assessment process; SOC2 / ISO required for critical vendors.",
      level_4: "Tiered review with continuous monitoring of high-risk vendors; contractual security SLAs enforced.",
      level_5: "Vendor risk feeds enterprise risk register; supply-chain attack surface continuously mapped and reduced.",
    },
    tags: { function: ["risk", "operational"], area: ["IT", "finance"] },
    framework_citation: {
      framework: "NIST CSF v2.0",
      reference: "GV.SC — Cybersecurity Supply Chain Risk Management",
      rationale: "Most modern breaches enter through the supply chain. Vendor review is no longer optional.",
    },
  },

  // ----- PROTECT function (NIST CSF PR) -----
  {
    id: "m5_q7", module_number: 5, subcategory: "Identity & Access",
    question: "Is multi-factor authentication (MFA) enforced for all users on all systems?",
    level_indicators: {
      level_1: "No MFA anywhere.",
      level_2: "MFA only on email or admin accounts.",
      level_3: "MFA on all external access and privileged accounts.",
      level_4: "MFA on every system, including internal — phishing-resistant methods (FIDO2 / hardware keys) for privileged users.",
      level_5: "Zero-trust architecture: continuous adaptive authentication, contextual risk scoring, passwordless by default.",
    },
    tags: { function: ["technical", "operational"], area: ["IT"] },
    framework_citation: {
      framework: "NIST CSF v2.0",
      reference: "PR.AA — Identity Management, Authentication & Access Control",
      rationale: "MFA blocks ~99% of credential-based attacks (Microsoft / CISA data). The single highest-leverage control.",
    },
  },
  {
    id: "m5_q8", module_number: 5, subcategory: "Identity & Access",
    question: "Is the principle of least privilege enforced for user and service accounts?",
    level_indicators: {
      level_1: "Most users / accounts have admin or broad access.",
      level_2: "Some role-based separation; admin accounts overused.",
      level_3: "Documented role definitions; quarterly access reviews; just-in-time elevation for privileged tasks.",
      level_4: "Automated provisioning / deprovisioning tied to HR system; access certifications signed off by managers.",
      level_5: "Zero standing privilege; all elevation is ephemeral, recorded, and risk-scored.",
    },
    tags: { function: ["technical", "operational"], area: ["IT"] },
    framework_citation: {
      framework: "NIST CSF v2.0",
      reference: "PR.AA-05 — Access Permissions",
      rationale: "Privilege creep is the most common audit finding. Least privilege is the structural defense.",
    },
  },
  {
    id: "m5_q9", module_number: 5, subcategory: "Data Protection",
    question: "Is sensitive data encrypted at rest and in transit?",
    level_indicators: {
      level_1: "No encryption strategy; plaintext storage common.",
      level_2: "Some encryption (e.g., disk-level) but no consistent policy.",
      level_3: "Documented data classification with encryption requirements per tier; TLS everywhere; KMS-managed keys.",
      level_4: "Field-level encryption for sensitive data; key rotation automated; HSM-backed.",
      level_5: "Confidential computing for high-sensitivity workloads; envelope encryption with customer-managed keys; cryptographic agility planned for post-quantum migration.",
    },
    tags: { function: ["technical"], area: ["IT"] },
    framework_citation: {
      framework: "NIST CSF v2.0",
      reference: "PR.DS — Data Security",
      rationale: "Data encryption is table stakes for every regulator (HIPAA, PCI-DSS, GDPR, SOC2).",
    },
  },
  {
    id: "m5_q10", module_number: 5, subcategory: "Workforce Awareness",
    question: "Is there a security awareness training program with regular phishing simulations?",
    level_indicators: {
      level_1: "No training.",
      level_2: "Onboarding-only training; no refreshers.",
      level_3: "Annual training plus quarterly phishing simulations; click-rates tracked.",
      level_4: "Role-tailored training (engineers / finance / execs); simulation difficulty escalates; measurable click-rate reduction.",
      level_5: "Continuous, behavior-based learning platform; security culture surveyed and acted upon; users actively report and earn recognition.",
    },
    tags: { function: ["operational", "risk"], area: ["cross_functional"] },
    framework_citation: {
      framework: "NIST CSF v2.0",
      reference: "PR.AT — Awareness & Training",
      rationale: "Humans are the path of least resistance. Trained users are a control as real as any technical one.",
    },
  },

  // ----- DETECT function (NIST CSF DE) -----
  {
    id: "m5_q11", module_number: 5, subcategory: "Detection & Monitoring",
    question: "Is there continuous security monitoring with alerting on suspicious activity?",
    level_indicators: {
      level_1: "No monitoring; incidents discovered through user complaints or breaches.",
      level_2: "Antivirus / firewall logs reviewed reactively.",
      level_3: "SIEM in place; log retention policy met; on-call analyst triages alerts.",
      level_4: "24/7 SOC (in-house or MDR partner); alert fidelity tuned; mean-time-to-detect tracked.",
      level_5: "Threat-intel-informed detection; behavioral analytics and ML-driven hunting; mean-time-to-detect under 1 hour.",
    },
    tags: { function: ["technical", "operational"], area: ["IT"] },
    framework_citation: {
      framework: "NIST CSF v2.0",
      reference: "DE.CM — Continuous Monitoring",
      rationale: "Most breaches dwell undetected for months (industry median ~200+ days). Detection capability defines blast radius.",
    },
  },
  {
    id: "m5_q12", module_number: 5, subcategory: "Detection & Monitoring",
    question: "Are vulnerability assessments and penetration tests performed on a regular cadence?",
    level_indicators: {
      level_1: "No assessments.",
      level_2: "Annual external scan only.",
      level_3: "Quarterly vulnerability scans; annual penetration test by external firm; remediation tracked to SLA.",
      level_4: "Continuous scanning of code, containers, infra; pen-test programs include red team scenarios; metrics drive prioritization.",
      level_5: "Bug bounty + continuous adversarial testing; remediation built into CI/CD; vulnerability lifecycle measured in days, not months.",
    },
    tags: { function: ["technical", "risk"], area: ["IT"] },
    framework_citation: {
      framework: "NIST CSF v2.0",
      reference: "ID.RA-01 / DE.CM — Vulnerability Identification",
      rationale: "Regular testing surfaces the unknown unknowns. Insurers and most enterprise customers require it contractually.",
    },
  },

  // ----- RESPOND + RECOVER functions (NIST CSF RS, RC) -----
  {
    id: "m5_q13", module_number: 5, subcategory: "Incident Response & Recovery",
    question: "Is there a documented incident response plan that has been tested with the leadership team?",
    level_indicators: {
      level_1: "No plan.",
      level_2: "Plan exists on paper; never exercised.",
      level_3: "Plan tested annually via tabletop exercise; named roles for IT, legal, comms, executive.",
      level_4: "Plan tested semi-annually with a mix of tabletop and technical drills; lessons captured and merged back.",
      level_5: "Continuous chaos / red-team exercises; playbooks live in runbooks executed under real conditions; measured response times beat industry benchmarks.",
    },
    tags: { function: ["operational", "risk", "strategic"], area: ["cross_functional"] },
    framework_citation: {
      framework: "NIST CSF v2.0",
      reference: "RS.MA — Incident Response Management",
      rationale: "An untested plan fails at first contact with reality. Practice is what makes the plan real.",
    },
  },
  {
    id: "m5_q14", module_number: 5, subcategory: "Incident Response & Recovery",
    question: "Are backups tested for restore success on a regular schedule?",
    level_indicators: {
      level_1: "No backups, or backups exist but have never been restored.",
      level_2: "Backups exist; restore tested only when something breaks.",
      level_3: "Quarterly restore tests of critical systems; results documented.",
      level_4: "Monthly automated restore tests; immutable / offline copies for ransomware resilience; recovery-time objectives measured.",
      level_5: "Self-healing infrastructure with continuous restore validation; RTO and RPO contractually committed and met.",
    },
    tags: { function: ["operational", "technical"], area: ["IT"] },
    framework_citation: {
      framework: "NIST CSF v2.0",
      reference: "RC.RP — Recovery Planning",
      rationale: "Ransomware playbook depends on tested backups. Untested = no backup at all.",
    },
  },
  {
    id: "m5_q15", module_number: 5, subcategory: "Compliance & Audit",
    question: "Are applicable compliance and regulatory requirements (e.g., HIPAA, PCI-DSS, GDPR, SOC2) identified and actively managed?",
    level_indicators: {
      level_1: "Requirements unknown or ignored.",
      level_2: "Aware of requirements; no formal compliance program.",
      level_3: "Documented compliance program with controls mapped; annual audit cycle.",
      level_4: "Continuous control monitoring with automated evidence collection; audit findings remediated within SLA.",
      level_5: "Compliance posture is an asset — used as a market differentiator; controls feed product trust portal accessible to customers.",
    },
    tags: { function: ["risk", "strategic", "financial"], area: ["cross_functional"] },
    framework_citation: {
      framework: "NIST CSF v2.0",
      reference: "GV.OC — Organizational Context (Legal & Regulatory)",
      rationale: "Compliance is the floor, not the ceiling. Knowing what applies is the first step.",
    },
  },

  // ============================================================
  // MODULE 6: Data & AI Capabilities
  // Phase 4 deep — NIST AI RMF + DAMA-DMBOK. 12 questions, 4 subcategories.
  // ============================================================

  // ----- DAMA-DMBOK: Data Foundations -----
  {
    id: "m6_q1", module_number: 6, subcategory: "Data Foundations",
    question: "Do you have a documented inventory of where your most important data lives — systems, owners, sensitivity tier?",
    level_indicators: {
      level_1: "No data inventory; nobody can name where customer data, financial data, or operational data is stored.",
      level_2: "Partial inventory in scattered docs; sensitive data locations are uncertain.",
      level_3: "Maintained data catalog covering core domains with named owners and sensitivity tagging.",
      level_4: "Catalog is automated where possible (discovery tools); lineage between systems is captured.",
      level_5: "Data catalog is the operating-model backbone — every change conversation references it; new data flows are catalogued at landing.",
    },
    tags: { function: ["technical", "operational", "risk"], area: ["IT"] },
    framework_citation: { framework: "DAMA-DMBOK", reference: "Data Catalog & Inventory", rationale: "DAMA's first-principle is that you cannot manage data you cannot find; the catalog is the precondition for governance, AI readiness, and compliance." },
  },
  {
    id: "m6_q2", module_number: 6, subcategory: "Data Foundations",
    question: "Is data quality actively measured — completeness, accuracy, freshness — for the data your business decisions depend on?",
    level_indicators: {
      level_1: "Data quality is a feeling; bad data surfaces in customer complaints and silent decision errors.",
      level_2: "Some quality checks; mostly downstream and reactive.",
      level_3: "Documented quality metrics for top data domains, reviewed monthly with named owners.",
      level_4: "Automated quality pipelines with SLAs; quality regressions trigger alerts and corrections.",
      level_5: "Data quality is a managed practice — quality SLOs are committed to internal customers and met as a discipline.",
    },
    tags: { function: ["technical", "operational"], area: ["IT", "cross_functional"] },
    framework_citation: { framework: "DAMA-DMBOK", reference: "Data Quality Practice", rationale: "Bad data scales bad decisions; DAMA's quality discipline is the cheapest insurance against silent failure." },
  },
  {
    id: "m6_q3", module_number: 6, subcategory: "Data Foundations",
    question: "Is there a data governance framework — named stewards, documented policies, decision rights — not just a wiki page nobody reads?",
    level_indicators: {
      level_1: "No governance; ownership of data domains is ambiguous; conflicts unresolved.",
      level_2: "Informal stewardship; no enforced policies.",
      level_3: "Formal governance: named stewards per domain, documented policies for access / retention / classification, periodic review.",
      level_4: "Governance is operational; policy violations are detected and resolved in normal work.",
      level_5: "Governance is institutional muscle — new joiners absorb it; vendor and partner integrations inherit it.",
    },
    tags: { function: ["strategic", "operational", "risk"], area: ["IT", "cross_functional"] },
    framework_citation: { framework: "DAMA-DMBOK", reference: "Data Governance Framework", rationale: "Governance separates organizations that survive a data audit from those that don't; it is also the precondition for AI deployment." },
  },

  // ----- NIST AI RMF: AI Readiness -----
  {
    id: "m6_q4", module_number: 6, subcategory: "AI Readiness",
    question: "Is the company using AI in any production business processes — not just experimenting?",
    level_indicators: {
      level_1: "No AI use; conversations are aspirational.",
      level_2: "Pilots in flight; no production deployments yet.",
      level_3: "1-2 AI use cases in production with measured outcomes.",
      level_4: "AI embedded across multiple business processes; ROI tracked per use case.",
      level_5: "AI is a competitive capability — multiple production use cases compounding into measurable advantage.",
    },
    tags: { function: ["strategic", "technical"], area: ["IT", "cross_functional"] },
    framework_citation: { framework: "NIST AI RMF", reference: "Manage Function (Production AI)", rationale: "NIST AI RMF separates organizations using AI from those talking about it; production deployment is the inflection point." },
  },
  {
    id: "m6_q5", module_number: 6, subcategory: "AI Readiness",
    question: "Is data ready to power AI — clean, accessible, sufficient volume — or is AI exposing a data foundation gap?",
    level_indicators: {
      level_1: "Data is too scattered, dirty, or low-volume to support AI; AI investments would amplify the problem.",
      level_2: "Some data is AI-ready; most is not; readiness is patchy and undocumented.",
      level_3: "Data readiness assessed per use case; gaps identified and remediated before AI investment.",
      level_4: "Data foundation is structurally AI-ready — clean, integrated, accessible to authorized models / users.",
      level_5: "Data is a competitive asset — the company's AI capability is gated by imagination, not by data.",
    },
    tags: { function: ["strategic", "technical"], area: ["IT"] },
    framework_citation: { framework: "NIST AI RMF + AMP AI Diagnostic Playbook", reference: "Data Readiness (Feasibility Dimension 1)", rationale: "AMP's Feasibility framework (and NIST's Map function) consistently identify data readiness as the most decisive factor in AI initiative success." },
  },
  {
    id: "m6_q6", module_number: 6, subcategory: "AI Readiness",
    question: "Is there an AI use-case backlog — named opportunities by industry × function × value — or do you start every AI conversation from scratch?",
    level_indicators: {
      level_1: "No backlog; AI ideas surface from vendor pitches.",
      level_2: "Some ideas listed informally; not prioritized or evaluated.",
      level_3: "Documented backlog of 10-20 use cases with industry × function tagging, ROI estimates, and feasibility scoring.",
      level_4: "Backlog is reviewed quarterly; in-flight pilots are sequenced from it.",
      level_5: "Backlog is a managed portfolio; the company is rarely surprised by an AI opportunity it had not already considered.",
    },
    tags: { function: ["strategic"], area: ["IT", "cross_functional"] },
    framework_citation: { framework: "AMP AI Diagnostic Playbook", reference: "Use-Case Library (4 Opportunity Categories)", rationale: "AMP's catalog approach (resource & process efficiency / vendor & tool spend / quality, risk & reliability / scalability enablement) prevents AI from chasing the latest pitch." },
  },

  // ----- NIST AI RMF: AI Governance -----
  {
    id: "m6_q7", module_number: 6, subcategory: "AI Governance",
    question: "Is there a documented AI policy — what AI use is allowed, what's restricted, what requires review — covering employees and vendors?",
    level_indicators: {
      level_1: "No AI policy; employees use ChatGPT with confidential data, vendors unknown.",
      level_2: "Informal guidance; not documented or enforced.",
      level_3: "Documented AI policy covering employee use, vendor AI integration, data classification for AI prompts; communicated.",
      level_4: "Policy is enforced with training, technical controls (DLP), and audit; violations are addressed.",
      level_5: "AI governance is institutional; policy adapts as capabilities and threats evolve.",
    },
    tags: { function: ["strategic", "operational", "risk"], area: ["IT", "cross_functional"] },
    framework_citation: { framework: "NIST AI RMF + EU AI Act", reference: "AI Policy & Governance", rationale: "Without an AI policy, the company is one ChatGPT prompt away from a data leak or regulatory exposure; the policy is the cheapest control." },
  },
  {
    id: "m6_q8", module_number: 6, subcategory: "AI Governance",
    question: "Is bias and fairness checked on AI use cases that touch customers, employees, or financial decisions?",
    level_indicators: {
      level_1: "No bias review; AI deployed without checking impact on protected groups.",
      level_2: "Awareness of bias risk; no documented review process.",
      level_3: "Bias review at design / deployment for high-impact use cases; mitigations documented.",
      level_4: "Continuous monitoring for bias drift; periodic external review.",
      level_5: "Fairness is a tracked KPI; the company can defend AI decisions before regulators or customers.",
    },
    tags: { function: ["strategic", "risk"], area: ["IT", "cross_functional"] },
    framework_citation: { framework: "NIST AI RMF", reference: "Govern + Measure Functions (Fairness)", rationale: "Bias in AI is a regulatory and reputational risk; review at design time is far cheaper than remediation after a public incident." },
  },
  {
    id: "m6_q9", module_number: 6, subcategory: "AI Governance",
    question: "Are AI vendor contracts reviewed for data ownership, model training rights, and incident notification — not just signed as-is?",
    level_indicators: {
      level_1: "Contracts signed without AI-specific review; vendors may train on your data.",
      level_2: "Some contracts reviewed for AI clauses; coverage is uneven.",
      level_3: "Documented AI clause review for every vendor: data ownership, no-training rights, incident notification, audit rights.",
      level_4: "Standard AI addendum used; vendors that won't sign it are filtered out at procurement.",
      level_5: "AI contractual posture is a known competitive position — the company knows where its AI data goes and what's done with it.",
    },
    tags: { function: ["strategic", "financial", "risk"], area: ["IT", "finance"] },
    framework_citation: { framework: "NIST AI RMF + EU AI Act", reference: "Vendor AI Risk Management", rationale: "AI vendor contracts are where data leakage happens silently; review at signing is the cheapest mitigation." },
  },

  // ----- AI Capability & ROI -----
  {
    id: "m6_q10", module_number: 6, subcategory: "AI Capability & ROI",
    question: "Is there an AI Roadmap with 90 / 180 / 360-day milestones — quick wins, foundation, scale — that survives board scrutiny?",
    level_indicators: {
      level_1: "No AI roadmap; investments are reactive.",
      level_2: "High-level roadmap exists; thin on milestones and accountability.",
      level_3: "Documented 90 / 180 / 360-day roadmap with named use cases, ROI estimates, build-vs-buy decisions per milestone.",
      level_4: "Roadmap is reviewed quarterly with realized-vs-projected outcomes; sequencing adapts.",
      level_5: "AI roadmap is the central planning artifact for AI investment; the board references it; the company funds with confidence.",
    },
    tags: { function: ["strategic", "financial"], area: ["IT", "cross_functional"] },
    framework_citation: { framework: "AMP AI Diagnostic Playbook", reference: "AI Roadmap (100 → 17 → 7 Funnel)", rationale: "AMP's 3-stage funnel produces roadmaps that survive 18-month retrospective scrutiny — the bar SMB CEOs need to defend AI spend." },
  },
  {
    id: "m6_q11", module_number: 6, subcategory: "AI Capability & ROI",
    question: "Are AI initiatives measured on hard-dollar outcomes (Volume × Time × Cost × Realizable %) — not just on shipped vs not shipped?",
    level_indicators: {
      level_1: "AI initiatives evaluated on whether they shipped; no business outcome measurement.",
      level_2: "Some outcome claims; numbers are projected and unverified.",
      level_3: "Documented financial model per AI initiative (volume, time saved, cost, realizable %); validated post-deployment at 90/180 days.",
      level_4: "Realization tracked institutionally; over-claims rare and detected; AI investment funded based on track record.",
      level_5: "AI's contribution to enterprise outcomes is a known number; the company defends AI ROI to the board with the same rigor as any capex.",
    },
    tags: { function: ["strategic", "financial"], area: ["IT", "finance"] },
    framework_citation: { framework: "AMP Standardized Impact Formula + KPMG ROO", reference: "Volume × Time × Cost × Realizable %", rationale: "AMP's PE-grade underwriting formula is the discipline that separates real AI ROI from slide-deck AI ROI." },
  },
  {
    id: "m6_q12", module_number: 6, subcategory: "AI Capability & ROI",
    question: "Is AI talent (data engineering, ML / model ops, AI product management) sourced and retained — internal, fractional, or partner — with a credible plan?",
    level_indicators: {
      level_1: "No AI talent strategy; ad-hoc hires or no hires.",
      level_2: "Some AI talent in place; gaps unfilled; vendors fill the void unintentionally.",
      level_3: "Documented AI talent strategy: which roles internal, which fractional, which partner; named candidates or hires.",
      level_4: "AI talent is a managed capability; bench depth covers core skills; partners are formally integrated.",
      level_5: "AI talent is a competitive asset — the company is known in its market for AI capability and attracts talent.",
    },
    tags: { function: ["strategic", "operational"], area: ["IT", "cross_functional"] },
    framework_citation: { framework: "NIST AI RMF", reference: "AI Workforce Practice", rationale: "AI without the right talent is vendor theater; talent strategy is the precondition for any AI capability claim." },
  },

  // ============================================================
  // MODULE 7: Platforms, APIs & Digital Products
  // Phase 4 deep — TOGAF Integration + Postman API Maturity. 12 questions.
  // ============================================================

  // ----- Platform Strategy -----
  {
    id: "m7_q1", module_number: 7, subcategory: "Platform Strategy",
    question: "Does the company think in terms of platforms and ecosystems — reusable capabilities consumed by multiple business units / partners — or only in terms of standalone applications?",
    level_indicators: {
      level_1: "Every business need spawns a new application; no shared platform thinking.",
      level_2: "Some shared services exist; not strategically managed as platforms.",
      level_3: "Documented platform strategy; core capabilities (identity, payments, customer data, notifications) treated as shared platforms.",
      level_4: "Platform team operates as internal product; consumers measured; SLAs honored.",
      level_5: "Platform-as-product is institutional; partners and customers consume it as easily as internal teams.",
    },
    tags: { function: ["strategic", "technical"], area: ["IT", "cross_functional"] },
    framework_citation: { framework: "TOGAF Integration", reference: "Platform Architecture Discipline", rationale: "Without platform thinking, capability is rebuilt every initiative; TOGAF's discipline is the cheapest path to scale." },
  },
  {
    id: "m7_q2", module_number: 7, subcategory: "Platform Strategy",
    question: "Are digital products / services part of the business model — not just internal tools — generating identifiable revenue?",
    level_indicators: {
      level_1: "No digital products; revenue is from non-digital channels only.",
      level_2: "Basic digital presence (marketing site, simple e-commerce); revenue contribution unclear.",
      level_3: "Digital products generating tracked revenue; product-market fit understood for at least one offering.",
      level_4: "Digital revenue is a meaningful share of total; products are managed as a portfolio.",
      level_5: "Digital-first business model — the company's competitive position is digital-product-shaped.",
    },
    tags: { function: ["strategic"], area: ["IT", "sales", "marketing"] },
    framework_citation: { framework: "MIT CISR Digital Maturity", reference: "Digital Product Portfolio", rationale: "MIT CISR research shows digital revenue mix is the strongest predictor of growth in mature SMBs over 5 years." },
  },
  {
    id: "m7_q3", module_number: 7, subcategory: "Platform Strategy",
    question: "Are partner and customer integrations enabled programmatically (APIs / webhooks) — not via manual file exchange or one-off custom builds?",
    level_indicators: {
      level_1: "All partner / customer integration is manual file exchange or per-deal custom code.",
      level_2: "Some API-based integration; mostly bilateral and fragile.",
      level_3: "Documented partner / customer integration patterns; standard APIs and webhooks for the most common cases.",
      level_4: "Self-service partner integration; partners onboard without dev-team involvement.",
      level_5: "Integration is a competitive asset; partners and customers prefer working with the company because it's easy to integrate with.",
    },
    tags: { function: ["strategic", "technical"], area: ["IT", "sales"] },
    framework_citation: { framework: "TOGAF Integration", reference: "Partner Integration Architecture", rationale: "Manual integration is the highest-friction sales motion; programmatic integration is a multiplier on partner-led revenue." },
  },

  // ----- API Maturity -----
  {
    id: "m7_q4", module_number: 7, subcategory: "API Maturity",
    question: "Are APIs documented, versioned, and discoverable — not buried in code or internal wikis?",
    level_indicators: {
      level_1: "APIs exist; documentation is scattered, outdated, or absent.",
      level_2: "Major APIs documented; coverage is uneven; consumers find APIs by asking.",
      level_3: "Standard documentation (OpenAPI / Postman) for every public and major internal API; versioning policy in place.",
      level_4: "API portal / catalog with discovery, examples, and SDKs; consumer-self-service.",
      level_5: "APIs are products with their own roadmap, SLA, and consumer relationships; treated as first-class assets.",
    },
    tags: { function: ["technical"], area: ["IT"] },
    framework_citation: { framework: "Postman API Maturity Model", reference: "Documentation & Discoverability", rationale: "Undocumented APIs are unused APIs; documentation maturity is the strongest predictor of API consumption." },
  },
  {
    id: "m7_q5", module_number: 7, subcategory: "API Maturity",
    question: "Are API contracts stable — breaking changes versioned and announced — not pushed silently?",
    level_indicators: {
      level_1: "Breaking changes ship without notice; consumers break unpredictably.",
      level_2: "Some change-management awareness; consumers still surprised regularly.",
      level_3: "Documented versioning + deprecation policy; breaking changes versioned, deprecated APIs sunset on schedule.",
      level_4: "Consumer impact assessed before breaking changes; coordinated migration paths offered.",
      level_5: "API contract stability is a stated commitment; consumers build with confidence.",
    },
    tags: { function: ["technical", "operational"], area: ["IT"] },
    framework_citation: { framework: "Postman API Maturity Model", reference: "Versioning & Lifecycle", rationale: "API instability is the most expensive form of platform decay; lifecycle discipline is the cheapest brake." },
  },
  {
    id: "m7_q6", module_number: 7, subcategory: "API Maturity",
    question: "Are APIs secured with consistent auth, rate limiting, and audit logging — not bespoke per endpoint?",
    level_indicators: {
      level_1: "API security is per-endpoint; auth varies; rate limits absent or inconsistent.",
      level_2: "Some standardization; gaps remain.",
      level_3: "Standard API security pattern: auth via gateway, rate limits enforced, requests logged with correlation IDs.",
      level_4: "Security posture audited continuously; misconfigurations detected automatically.",
      level_5: "API security is institutional; new APIs inherit it by default; vulnerability surface is managed.",
    },
    tags: { function: ["technical", "risk"], area: ["IT"] },
    framework_citation: { framework: "OWASP API Security Top 10", reference: "API Security Standards", rationale: "API security gaps are the most common breach vector for platform-shaped companies; OWASP API Top 10 is the lower bound." },
  },

  // ----- Product / Platform Discipline -----
  {
    id: "m7_q7", module_number: 7, subcategory: "Product & Platform Discipline",
    question: "Are platforms and digital products owned by named product managers — not just engineering leads moonlighting?",
    level_indicators: {
      level_1: "No product management; engineering decides what gets built.",
      level_2: "Part-time product management; coverage is partial.",
      level_3: "Dedicated product managers for major platforms / products; standard PM rituals (roadmap, backlog, customer interviews).",
      level_4: "Product management is a discipline; PMs measured on outcomes, not output.",
      level_5: "Product culture is institutional; non-PM functions reason in product terms.",
    },
    tags: { function: ["strategic", "operational"], area: ["IT", "cross_functional"] },
    framework_citation: { framework: "Marty Cagan SVPG / Lenny Rachitsky PM Standard", reference: "Product Management Discipline", rationale: "Engineering-led product is engineering-shaped product; dedicated PM is the lever for outcome-led product." },
  },
  {
    id: "m7_q8", module_number: 7, subcategory: "Product & Platform Discipline",
    question: "Are platform consumers (internal teams, partners, customers) actively measured — usage, satisfaction, time-to-integrate — and treated as customers?",
    level_indicators: {
      level_1: "No consumer measurement; platforms operate without feedback.",
      level_2: "Some metrics; not acted upon.",
      level_3: "Documented metrics (usage, NPS, time-to-integrate); reviewed quarterly; investments adjusted.",
      level_4: "Consumer satisfaction is a tracked KPI; platform team measured against it.",
      level_5: "Platform team operates as a startup serving internal / external customers; competition for usage is real.",
    },
    tags: { function: ["operational"], area: ["IT", "cross_functional"] },
    framework_citation: { framework: "Team Topologies (Skelton & Pais)", reference: "Platform Team Pattern", rationale: "Team Topologies' platform pattern requires consumer-pull, not provider-push; consumer measurement enforces the pattern." },
  },
  {
    id: "m7_q9", module_number: 7, subcategory: "Product & Platform Discipline",
    question: "Is technical debt within platforms tracked and managed — not allowed to compound silently?",
    level_indicators: {
      level_1: "Platform debt accumulates; nobody tracks it.",
      level_2: "Awareness of debt; no register or remediation budget.",
      level_3: "Documented debt register per platform; remediation budget allocated annually.",
      level_4: "Debt reduction year-over-year measured; platform agility correlated with debt level.",
      level_5: "Debt is a managed balance-sheet item; the company knows its platform debt cost and trajectory.",
    },
    tags: { function: ["technical", "operational", "financial"], area: ["IT"] },
    framework_citation: { framework: "Gartner Technical Debt Practice", reference: "Platform Debt Management", rationale: "Platform debt compounds faster than application debt because the blast radius is shared; explicit management is the only durable defense." },
  },
  {
    id: "m7_q10", module_number: 7, subcategory: "Product & Platform Discipline",
    question: "Is there a documented digital-product / platform roadmap — quarterly sequencing tied to business outcomes — visible to the executive team?",
    level_indicators: {
      level_1: "No roadmap; investments per fire of the week.",
      level_2: "Internal roadmap exists; executive visibility partial.",
      level_3: "Documented quarterly roadmap mapped to business outcomes; executive review monthly.",
      level_4: "Roadmap drives investment decisions; deviations are documented exceptions.",
      level_5: "Roadmap is a strategic artifact; M&A and partnership decisions reference it.",
    },
    tags: { function: ["strategic"], area: ["IT", "cross_functional"] },
    framework_citation: { framework: "Lean Product Playbook (Olsen) + KPMG Strategy Execution", reference: "Outcome-led Roadmap", rationale: "Roadmaps mapped to outputs become wishlists; outcome-mapped roadmaps stay strategically relevant." },
  },
  {
    id: "m7_q11", module_number: 7, subcategory: "Product & Platform Discipline",
    question: "Are external integrations (Stripe, Salesforce, Slack, etc.) treated as first-class capabilities — health monitored, vendor risk assessed — not just plugged in and forgotten?",
    level_indicators: {
      level_1: "External integrations are install-and-forget; outages cascade silently.",
      level_2: "Some monitoring on top integrations; reactive coverage.",
      level_3: "Health monitoring + vendor risk assessment for every load-bearing integration; quarterly review.",
      level_4: "Integration health is a tracked SLA; degradations escalate; vendor performance shapes contract decisions.",
      level_5: "Integration portfolio is managed as a strategic dependency map; over-reliance is identified and mitigated.",
    },
    tags: { function: ["technical", "operational", "risk"], area: ["IT"] },
    framework_citation: { framework: "Gartner Vendor Risk Management", reference: "Integration Lifecycle", rationale: "External integrations are silent third-party risk; explicit lifecycle management is the cheapest mitigation." },
  },
  {
    id: "m7_q12", module_number: 7, subcategory: "Product & Platform Discipline",
    question: "Is platform / product success measured at the business outcome level (revenue, retention, NPS) — not just at usage / latency?",
    level_indicators: {
      level_1: "Only operational metrics; no business outcome tied to platform.",
      level_2: "Some outcome metrics; thin and uncontested.",
      level_3: "Documented business outcome KPIs per platform / product; reviewed at executive cadence.",
      level_4: "Platform investment competes for funding on business outcome; the link is causally established.",
      level_5: "Platforms and products are economic units; the company knows ROI per platform.",
    },
    tags: { function: ["strategic", "financial"], area: ["IT", "cross_functional"] },
    framework_citation: { framework: "MIT CISR + KPMG ROO", reference: "Outcome-led Platform Measurement", rationale: "Operational metrics measure efficiency; outcome metrics measure value; both matter, but outcome metrics drive investment decisions." },
  },

  // ============================================================
  // MODULE 8: Analytics & BI
  // Phase 4 deep — Gartner BI Maturity + TDWI + DataOps. 12 questions.
  // ============================================================

  // ----- Analytics Foundation -----
  {
    id: "m8_q1", module_number: 8, subcategory: "Analytics Foundation",
    question: "Can you pull up key business metrics (revenue, cost, performance) in real time — or are you waiting for last month's report?",
    level_indicators: {
      level_1: "Decisions made on stale data; reports take days to compile.",
      level_2: "Some metrics available daily; many still in spreadsheets refreshed manually.",
      level_3: "Real-time / near-real-time dashboards for top business metrics; refreshed automatically.",
      level_4: "Real-time alerting on threshold breaches; metrics integrated into operational workflows.",
      level_5: "Real-time data is institutional; the company moves at the speed of its observations.",
    },
    tags: { function: ["operational", "strategic"], area: ["finance", "operations", "IT", "cross_functional"] },
    framework_citation: { framework: "Gartner BI & Analytics Maturity", reference: "Real-time Decision Support", rationale: "Decision latency is the cost of stale data; real-time data is the lever for faster business cycles." },
  },
  {
    id: "m8_q2", module_number: 8, subcategory: "Analytics Foundation",
    question: "Is there a single source of truth for the metrics that matter — not five different definitions of 'revenue' or 'active customer'?",
    level_indicators: {
      level_1: "Multiple definitions; every meeting starts with reconciling numbers.",
      level_2: "Awareness of inconsistency; not yet resolved.",
      level_3: "Documented metric definitions in a semantic layer / catalog; reviewed quarterly.",
      level_4: "Definitions enforced at query time; rogue definitions are detected and corrected.",
      level_5: "Metric trust is institutional; the executive team agrees on numbers as a baseline, not as a debate.",
    },
    tags: { function: ["strategic", "operational"], area: ["finance", "cross_functional"] },
    framework_citation: { framework: "TDWI Data Quality + dbt Semantic Layer Pattern", reference: "Single Source of Truth", rationale: "Inconsistent metrics are organizational gas-lighting; a managed semantic layer is the technical solution." },
  },
  {
    id: "m8_q3", module_number: 8, subcategory: "Analytics Foundation",
    question: "Do non-technical staff have access to the data they need — without filing a ticket and waiting for IT?",
    level_indicators: {
      level_1: "All data access goes through IT; turnaround in days or weeks.",
      level_2: "Some teams have direct access; others wait.",
      level_3: "Self-service BI tools available with guardrails; non-technical users build their own reports.",
      level_4: "Data literacy program in place; self-service is the norm.",
      level_5: "Data democratization is institutional; data is consumed across functions as a habit.",
    },
    tags: { function: ["operational"], area: ["IT", "cross_functional"] },
    framework_citation: { framework: "Gartner BI Maturity Model", reference: "Self-Service Analytics", rationale: "IT-bottlenecked analytics is rate-limited analytics; self-service unlocks the long tail of decision-making." },
  },

  // ----- Decision Discipline -----
  {
    id: "m8_q4", module_number: 8, subcategory: "Decision Discipline",
    question: "Are major business decisions backed by data analysis — or by the loudest voice in the room?",
    level_indicators: {
      level_1: "Gut-feel decisions dominate; data is rarely consulted.",
      level_2: "Data sometimes consulted; mostly to support pre-formed positions.",
      level_3: "Major decisions require documented data analysis; alternatives evaluated against evidence.",
      level_4: "Decision quality reviewed post-hoc; lessons feed forward.",
      level_5: "Data-driven decision-making is cultural; teams are uncomfortable making major calls without analytical grounding.",
    },
    tags: { function: ["strategic", "operational"], area: ["cross_functional"] },
    framework_citation: { framework: "Gartner BI Maturity + Roger Martin Strategic Choice", reference: "Evidence-led Decision-making", rationale: "MIT and McKinsey research consistently shows data-driven companies outperform peers by 5-6% on operating metrics; the discipline is the lever." },
  },
  {
    id: "m8_q5", module_number: 8, subcategory: "Decision Discipline",
    question: "Are KPIs cascaded across the organization — every team knows the 3-5 numbers it owns and how those roll up?",
    level_indicators: {
      level_1: "No cascaded KPIs; teams operate without measurable goals.",
      level_2: "Some KPIs at top level; cascade is uneven.",
      level_3: "Documented KPI tree from enterprise to team; reviewed at cadence.",
      level_4: "Real-time dashboards visible at every level; teams self-monitor.",
      level_5: "KPI alignment is institutional; the company moves coherently because every team knows what 'winning' looks like.",
    },
    tags: { function: ["strategic", "operational"], area: ["cross_functional"] },
    framework_citation: { framework: "OKR (Doerr) + Gartner Performance Management", reference: "KPI Cascade", rationale: "Cascaded KPIs align effort; without them, local optimization undermines enterprise outcomes." },
  },
  {
    id: "m8_q6", module_number: 8, subcategory: "Decision Discipline",
    question: "Are predictive analytics or forecasting in use for any significant business decisions — pricing, demand planning, churn — not just hindsight reporting?",
    level_indicators: {
      level_1: "No predictive analytics; all reporting is hindsight.",
      level_2: "Some forecasting; thin and underused.",
      level_3: "Predictive analytics in production for at least one significant decision; outcomes tracked.",
      level_4: "Multiple predictive models in production with managed lifecycle; uplift documented.",
      level_5: "Predictive capability is differentiating; competitors operate with worse foresight.",
    },
    tags: { function: ["strategic", "technical"], area: ["IT", "finance", "operations"] },
    framework_citation: { framework: "Gartner BI Maturity (Predictive Tier)", reference: "Predictive Analytics", rationale: "Predictive maturity separates the top quartile of analytics-driven companies; the gap is widening with AI." },
  },

  // ----- Data Engineering -----
  {
    id: "m8_q7", module_number: 8, subcategory: "Data Engineering",
    question: "Is there a managed data pipeline from source systems to analytical destinations — not Excel exports and hoped-for refreshes?",
    level_indicators: {
      level_1: "Manual exports from operational systems; pipelines are spreadsheet glue.",
      level_2: "Some automated pipelines; coverage is uneven; failures are silent.",
      level_3: "Managed ETL/ELT pipelines for top data domains; failures alerted; SLAs defined.",
      level_4: "DataOps practice (CI/CD for data, observability, lineage) in place; pipelines treated as production code.",
      level_5: "Data engineering is a managed discipline; pipelines are reliable infrastructure, not artisanal craft.",
    },
    tags: { function: ["technical", "operational"], area: ["IT"] },
    framework_citation: { framework: "DataOps Manifesto + dbt Best Practices", reference: "Pipeline Management", rationale: "Manual data movement is the most common single-point-of-failure in analytics; DataOps eliminates it." },
  },
  {
    id: "m8_q8", module_number: 8, subcategory: "Data Engineering",
    question: "Is data lineage — where each data element comes from, how it's transformed — visible, not buried in undocumented SQL?",
    level_indicators: {
      level_1: "Lineage unknown; debugging takes archaeology.",
      level_2: "Lineage in heads of senior analysts; tribal.",
      level_3: "Documented lineage for top data domains; visible in catalog or BI tool.",
      level_4: "Automated lineage capture; impact analysis on schema changes is fast.",
      level_5: "Lineage is institutional; analysts and stakeholders reason about provenance routinely.",
    },
    tags: { function: ["technical", "operational"], area: ["IT"] },
    framework_citation: { framework: "DAMA-DMBOK Data Lineage + DataOps", reference: "Lineage Tracking", rationale: "Without lineage, every data question becomes detective work; lineage is the cheapest documentation that pays back daily." },
  },
  {
    id: "m8_q9", module_number: 8, subcategory: "Data Engineering",
    question: "Are analytical environments separated from operational ones — analysts can't accidentally degrade production?",
    level_indicators: {
      level_1: "Analysts query production systems directly; performance impact is visible.",
      level_2: "Some separation; long tail of direct production queries remains.",
      level_3: "Dedicated analytical environment (data warehouse / lakehouse) populated from production; analysts query separately.",
      level_4: "Multiple analytical tiers (real-time, near-real-time, batch); workloads isolated.",
      level_5: "Analytics infrastructure scales independently of operations; one cannot impair the other.",
    },
    tags: { function: ["technical"], area: ["IT"] },
    framework_citation: { framework: "Modern Data Stack Pattern (Fivetran/dbt/Snowflake)", reference: "Operational/Analytical Separation", rationale: "Production-targeting analytics is a self-inflicted reliability problem; separation is the architectural floor." },
  },

  // ----- Insight to Action -----
  {
    id: "m8_q10", module_number: 8, subcategory: "Insight to Action",
    question: "Are insights produced by analytics actually acted on — with documented decisions and outcomes — or do they decay in dashboards nobody opens?",
    level_indicators: {
      level_1: "Dashboards proliferate; decisions don't change; insights decay unread.",
      level_2: "Some insights drive decisions; most are reference material.",
      level_3: "Documented insight-to-action loop: insights generate hypotheses, decisions, and tracked outcomes.",
      level_4: "Insight effectiveness is measured; analyses producing no action are sunset.",
      level_5: "Analytics is consequential — the company demonstrably moves on what it learns.",
    },
    tags: { function: ["operational", "strategic"], area: ["cross_functional"] },
    framework_citation: { framework: "Gartner Decision Intelligence", reference: "Insight-to-Action Loop", rationale: "Most analytics fails at conversion to action; explicit loops are what separate decorative analytics from operational analytics." },
  },
  {
    id: "m8_q11", module_number: 8, subcategory: "Insight to Action",
    question: "Are dashboards curated — old / unused ones retired — or do they pile up and dilute trust?",
    level_indicators: {
      level_1: "Dashboards proliferate without retirement; trust in 'the right number' erodes.",
      level_2: "Some retirement happens reactively; bulk persists.",
      level_3: "Documented dashboard catalog with usage metrics; quarterly retirement cycle.",
      level_4: "Dashboard count is bounded; new dashboards displace old ones.",
      level_5: "Dashboard discipline is institutional; consumers know which dashboards are canonical.",
    },
    tags: { function: ["operational"], area: ["IT", "cross_functional"] },
    framework_citation: { framework: "TDWI BI Best Practices", reference: "Dashboard Lifecycle", rationale: "Dashboard sprawl is the most common failure mode of self-service BI; lifecycle discipline is the cheapest control." },
  },
  {
    id: "m8_q12", module_number: 8, subcategory: "Insight to Action",
    question: "Is data literacy invested in — training, common vocabulary, examples — so that analytics is consumable beyond the analyst team?",
    level_indicators: {
      level_1: "No data literacy investment; non-analysts misread reports.",
      level_2: "Ad hoc training; coverage is uneven.",
      level_3: "Documented data literacy program; new hires trained; reference materials maintained.",
      level_4: "Literacy is measured; managers expected to be data-fluent.",
      level_5: "Data literacy is cultural; the company speaks data as a native language.",
    },
    tags: { function: ["operational", "strategic"], area: ["cross_functional"] },
    framework_citation: { framework: "Gartner Data Literacy + Qlik Data Literacy Framework", reference: "Literacy Program", rationale: "Analytics that consumers can't interpret is wasted analytics; literacy is the multiplier on every analytics dollar." },
  },

  // ============================================================
  // MODULE 9: Customer / Patient Experience
  // Phase 4 deep — Forrester CX Index + KPMG Connected Enterprise. 12 questions.
  // ============================================================

  // ----- CX Strategy -----
  {
    id: "m9_q1", module_number: 9, subcategory: "CX Strategy",
    question: "Is there a documented customer experience strategy — what 'good' looks like, what the company will and won't do for customers — owned at the executive level?",
    level_indicators: {
      level_1: "No CX strategy; customer experience is whatever happens.",
      level_2: "Some CX awareness; not documented or owned.",
      level_3: "Documented CX strategy with executive owner; reviewed quarterly.",
      level_4: "CX strategy drives investment decisions; deviations require exception.",
      level_5: "CX is a competitive identity; the company is known for it externally.",
    },
    tags: { function: ["strategic"], area: ["sales", "operations", "cross_functional"] },
    framework_citation: { framework: "Forrester CX Index", reference: "CX Strategy Discipline", rationale: "Forrester research shows companies with documented, executive-owned CX strategies outperform on revenue growth + retention by ~2x over 3 years." },
  },
  {
    id: "m9_q2", module_number: 9, subcategory: "CX Strategy",
    question: "Is the customer journey mapped — from awareness to retention — with friction points identified and remediation tracked?",
    level_indicators: {
      level_1: "No journey mapping; assumptions stand in for understanding.",
      level_2: "Informal understanding; not documented or used in planning.",
      level_3: "Documented journey maps for primary segments; friction points named with owners.",
      level_4: "Journey analytics live; friction reduction tracked over time.",
      level_5: "Journey is continuously optimized; the company anticipates customer pain before customers articulate it.",
    },
    tags: { function: ["strategic", "operational"], area: ["sales", "operations"] },
    framework_citation: { framework: "Forrester CX Index + KPMG Connected Enterprise", reference: "Journey Mapping Discipline", rationale: "Journey maps surface the hidden friction that NPS surveys miss; KPMG Connected Enterprise treats journey discipline as a 4-of-8 connected capability." },
  },
  {
    id: "m9_q3", module_number: 9, subcategory: "CX Strategy",
    question: "Are customer-facing decisions (pricing, support, returns, communications) made with documented customer impact analysis — not just internal cost-saving?",
    level_indicators: {
      level_1: "Customer-impact analysis absent; customer-facing decisions made on internal-cost lens.",
      level_2: "Some impact considered informally; rarely documented.",
      level_3: "Documented customer impact analysis required for major customer-facing changes.",
      level_4: "Customer panel / advisory consulted; outcomes tracked post-decision.",
      level_5: "Customer voice is institutional; major decisions are co-designed with customer representatives.",
    },
    tags: { function: ["strategic"], area: ["sales", "operations"] },
    framework_citation: { framework: "Forrester CX Operating Model", reference: "Customer-impact Discipline", rationale: "Decisions made without customer-impact analysis erode CX silently; the discipline is the cheapest defense." },
  },

  // ----- Voice of Customer -----
  {
    id: "m9_q4", module_number: 9, subcategory: "Voice of Customer",
    question: "Is customer feedback collected systematically — surveys (NPS / CSAT / CES), interviews, complaints, support tickets — and triaged?",
    level_indicators: {
      level_1: "Feedback is anecdotal; only the loudest customers are heard.",
      level_2: "Some surveys run; rarely acted upon.",
      level_3: "Documented VoC program: NPS / CSAT regular cadence, support ticket trends, complaint triage; reviewed monthly.",
      level_4: "VoC drives product / process changes; closure rate measured.",
      level_5: "VoC is institutional muscle; the company hears its customers and adjusts at the speed of feedback.",
    },
    tags: { function: ["operational", "strategic"], area: ["sales", "operations"] },
    framework_citation: { framework: "Forrester VoC Practice", reference: "Multi-source VoC", rationale: "Single-source VoC is biased VoC; multi-source aggregation is the only path to reliable customer understanding." },
  },
  {
    id: "m9_q5", module_number: 9, subcategory: "Voice of Customer",
    question: "Are customer-experience metrics (NPS, CSAT, retention, churn, time-to-resolve) tied to operating decisions — pricing, staffing, product investment?",
    level_indicators: {
      level_1: "CX metrics tracked but not operationally consequential.",
      level_2: "Some operational tie-ins; mostly retrospective.",
      level_3: "Documented CX-to-decision links: NPS dip triggers root-cause investigation; churn signals trigger retention programs.",
      level_4: "CX metrics are leading indicators in the executive scorecard.",
      level_5: "CX metrics are board-tracked; the company manages CX with the same rigor as financial metrics.",
    },
    tags: { function: ["strategic", "operational", "financial"], area: ["sales", "finance"] },
    framework_citation: { framework: "Forrester CX Index", reference: "CX-to-Outcome Linkage", rationale: "CX measured but not acted on is performative; the link to operational decisions is what makes CX investment pay back." },
  },
  {
    id: "m9_q6", module_number: 9, subcategory: "Voice of Customer",
    question: "Are customer complaints routed to a single owner, triaged within SLA, and root-caused — not just closed and forgotten?",
    level_indicators: {
      level_1: "Complaints handled per ticket; no aggregation; no root cause.",
      level_2: "Some triage; root cause inconsistent.",
      level_3: "Documented complaint workflow: single owner, SLA, root-cause classification, remediation.",
      level_4: "Complaint themes drive product / process changes; recurrence is measured.",
      level_5: "Complaints are early-warning signals; the company invests in preventing them as a discipline.",
    },
    tags: { function: ["operational", "risk"], area: ["sales", "operations"] },
    framework_citation: { framework: "Lean Six Sigma + Forrester Complaint Management", reference: "Root-cause Discipline", rationale: "Complaints unaddressed at root accumulate as churn; root-cause discipline turns complaints into improvement input." },
  },

  // ----- Digital Experience -----
  {
    id: "m9_q7", module_number: 9, subcategory: "Digital Experience",
    question: "Can customers complete their most common tasks (purchase, schedule, support, account changes) digitally without calling — or is the phone the fallback?",
    level_indicators: {
      level_1: "Most common tasks require human contact; phone is the default.",
      level_2: "Some self-service; deflection rate is low.",
      level_3: "Documented self-service catalog covering the top customer tasks; deflection rate measured.",
      level_4: "Continuous improvement on self-service; deflection rises year-over-year.",
      level_5: "Digital-first is the default; humans handle exception, not routine.",
    },
    tags: { function: ["strategic", "operational"], area: ["sales", "operations", "IT"] },
    framework_citation: { framework: "Forrester CX Index Digital Pillar", reference: "Self-service Maturity", rationale: "Phone-as-default is a CX cost ceiling; digital self-service is the lever for both CX and economics." },
  },
  {
    id: "m9_q8", module_number: 9, subcategory: "Digital Experience",
    question: "Is the digital experience (web, app, portal) designed against actual user research — not what the team thinks customers want?",
    level_indicators: {
      level_1: "No user research; design driven by internal opinion.",
      level_2: "Occasional research; not embedded in design cycles.",
      level_3: "Structured user research program; designs validated with users before shipping.",
      level_4: "Continuous discovery; user research is part of every product cycle.",
      level_5: "User research is a competitive advantage; the company knows its customers better than competitors do.",
    },
    tags: { function: ["operational", "strategic"], area: ["sales", "marketing"] },
    framework_citation: { framework: "Nielsen Norman Group + IDEO Design Thinking", reference: "Research-led Design", rationale: "Design without research is opinion-led design; research-led design produces measurably better customer outcomes." },
  },
  {
    id: "m9_q9", module_number: 9, subcategory: "Digital Experience",
    question: "Is the digital experience accessible (WCAG / Section 508) — covering disabilities, screen readers, keyboard navigation — not just sighted-mouse default?",
    level_indicators: {
      level_1: "Accessibility not considered; the digital experience excludes a meaningful percentage of users.",
      level_2: "Some accessibility awareness; not enforced.",
      level_3: "Documented accessibility standards (WCAG AA target); audited before major releases.",
      level_4: "Continuous accessibility validation; CI checks block regressions.",
      level_5: "Accessibility is a competitive advantage and a legal-risk floor; the company is recognized for it.",
    },
    tags: { function: ["operational", "risk"], area: ["sales", "marketing", "IT"] },
    framework_citation: { framework: "WCAG 2.2 + ADA / Section 508", reference: "Accessibility Standards", rationale: "Inaccessible digital experiences exclude users and create legal liability; WCAG AA is the current floor." },
  },

  // ----- Personalization & Loyalty -----
  {
    id: "m9_q10", module_number: 9, subcategory: "Personalization & Loyalty",
    question: "Are customer interactions tailored — based on segment, history, preferences — or do all customers see the same generic experience?",
    level_indicators: {
      level_1: "All customers see the same experience; no segmentation, no personalization.",
      level_2: "Basic segmentation (e.g. by purchase history); thin personalization.",
      level_3: "Documented personalization strategy with measured uplift; key segments served differently.",
      level_4: "Real-time personalization across digital touchpoints; orchestration via customer data platform.",
      level_5: "Personalization is a competitive moat; customers feel known.",
    },
    tags: { function: ["strategic", "operational"], area: ["sales", "marketing"] },
    framework_citation: { framework: "Forrester Personalization Maturity + KPMG Connected Enterprise", reference: "Personalized Experiences", rationale: "Generic experiences in a personalization-mature market are competitive disadvantage; the gap widens with AI." },
  },
  {
    id: "m9_q11", module_number: 9, subcategory: "Personalization & Loyalty",
    question: "Is retention investment (loyalty, account management, proactive outreach) measured against churn risk — or is retention an afterthought?",
    level_indicators: {
      level_1: "No retention strategy; churn is what it is.",
      level_2: "Some retention activity; not tied to risk segmentation.",
      level_3: "Documented retention program with risk-segmented outreach; measured against churn rate.",
      level_4: "Predictive churn modeling drives retention; intervention ROI is measured.",
      level_5: "Retention is a competitive capability; LTV / CAC ratio leads category.",
    },
    tags: { function: ["strategic", "operational", "financial"], area: ["sales", "finance"] },
    framework_citation: { framework: "Forrester Customer Loyalty + Reichheld Loyalty Effect", reference: "Predictive Retention", rationale: "Retention investments without risk segmentation are scattershot; segmentation is the lever for ROI." },
  },
  {
    id: "m9_q12", module_number: 9, subcategory: "Personalization & Loyalty",
    question: "Are customer-data systems (CRM, support, marketing automation, e-commerce) integrated — single customer view — or is each system a silo?",
    level_indicators: {
      level_1: "No integration; the same customer is fragmented across multiple systems.",
      level_2: "Some integration; identity matching is unreliable.",
      level_3: "Single customer view via CDP / integrated CRM; key systems share identity.",
      level_4: "Real-time customer data flows across all touchpoints; consistency is enforced.",
      level_5: "Customer data is treated as a product; consumers (sales, support, marketing) build on a reliable single source.",
    },
    tags: { function: ["technical", "operational"], area: ["sales", "marketing", "IT"] },
    framework_citation: { framework: "KPMG Connected Enterprise", reference: "Single Customer View", rationale: "Fragmented customer data prevents personalization, retention modeling, and unified support; integration is the lever." },
  },

  // ============================================================
  // MODULE 10: Executive Communication & Influence
  // Phase 4 deep — HBR Leadership + IT-CMF Executive Communication. 12 questions.
  // ============================================================

  // ----- Executive Voice -----
  {
    id: "m10_q1", module_number: 10, subcategory: "Executive Voice",
    question: "Does the technology leader have a regular forum (briefing, council, board readout) to communicate technology direction and threats to the executive team?",
    level_indicators: {
      level_1: "No regular tech forum; tech communication is reactive.",
      level_2: "Forum exists but is irregular and often skipped.",
      level_3: "Standing monthly tech briefing on the executive calendar; well-attended.",
      level_4: "Tech briefings drive cross-functional decisions; execs walk in with questions and walk out with assignments.",
      level_5: "Tech communication is institutional; the executive team is conversant with technology direction without needing translation.",
    },
    tags: { function: ["strategic"], area: ["IT", "cross_functional"] },
    framework_citation: { framework: "IT-CMF Executive Communication", reference: "Standing Forums", rationale: "Without a regular forum, tech leadership communication is ad hoc and forgettable; standing forums turn presence into influence." },
  },
  {
    id: "m10_q2", module_number: 10, subcategory: "Executive Voice",
    question: "Are tech updates translated to business language — outcomes, dollars, risks — not stack diagrams and jargon?",
    level_indicators: {
      level_1: "Tech communication is jargon-heavy; non-tech executives tune out.",
      level_2: "Some translation; inconsistent across communicators.",
      level_3: "Standard translation discipline: every tech communication leads with business outcome, framework citation, and decision asked for.",
      level_4: "Translation is institutional; technology leaders practice it as a craft.",
      level_5: "Tech communication is studied across the company; the language is shared across functions.",
    },
    tags: { function: ["strategic", "operational"], area: ["IT", "cross_functional"] },
    framework_citation: { framework: "HBR Leadership + IT-CMF", reference: "Business-Translation Discipline", rationale: "Tech leaders unable to translate to business outcomes get treated as cost centers; translation is the lever for influence." },
  },
  {
    id: "m10_q3", module_number: 10, subcategory: "Executive Voice",
    question: "Is the technology leader prepared for board interaction — not just functional reviews, but actual board agendas, materials, executive Q&A?",
    level_indicators: {
      level_1: "Tech leader rarely sees the board; board agenda decided without tech input.",
      level_2: "Periodic board appearances; preparation is light.",
      level_3: "Documented board prep discipline: materials reviewed, questions anticipated, framing rehearsed.",
      level_4: "Tech leader is a comfortable, valued board contributor; board defers to them on tech-strategic questions.",
      level_5: "Tech leader is a fiduciary contributor; their position shapes board decisions on M&A, budget, and risk.",
    },
    tags: { function: ["strategic"], area: ["IT", "cross_functional"] },
    framework_citation: { framework: "HBR CIO Effectiveness Research", reference: "Board Preparation", rationale: "Board credibility is the difference between tech-leader-as-officer and tech-leader-as-staff; preparation is the lever." },
  },

  // ----- Stakeholder Influence -----
  {
    id: "m10_q4", module_number: 10, subcategory: "Stakeholder Influence",
    question: "Does the executive team share a vision for technology's role — not just nominal alignment, but the same elevator pitch?",
    level_indicators: {
      level_1: "Each executive describes tech's role differently; no shared narrative.",
      level_2: "Some alignment exists at the top; muddled below.",
      level_3: "Documented shared vision; every C-level can give the 5-minute version consistently.",
      level_4: "Vision travels downward; managers can describe it; new joiners absorb it.",
      level_5: "Vision is durable culture; new acquisitions and partnerships inherit it.",
    },
    tags: { function: ["strategic"], area: ["IT", "cross_functional"] },
    framework_citation: { framework: "HBR Leadership + Roger Martin Integrative Thinking", reference: "Shared Vision Discipline", rationale: "Vision drift among executives produces misaligned investment; shared narrative is the cheapest alignment mechanism." },
  },
  {
    id: "m10_q5", module_number: 10, subcategory: "Stakeholder Influence",
    question: "Is stakeholder management proactive — relationships built before they're needed — or reactive (hello when there's a crisis)?",
    level_indicators: {
      level_1: "Reactive only; tech leader appears only when something breaks.",
      level_2: "Some proactive engagement; coverage is uneven.",
      level_3: "Documented stakeholder map with engagement cadence per stakeholder type.",
      level_4: "Stakeholder relationships are warm and trust-tested; tech leader has earned the benefit of the doubt.",
      level_5: "Stakeholder trust is a competitive asset; transformations move faster because relationships are pre-built.",
    },
    tags: { function: ["strategic", "operational"], area: ["IT", "cross_functional"] },
    framework_citation: { framework: "IT-CMF Stakeholder Management", reference: "Proactive Engagement", rationale: "Stakeholder relationships built only in crisis are stakeholder relationships at their weakest; proactive engagement is the cheapest insurance." },
  },
  {
    id: "m10_q6", module_number: 10, subcategory: "Stakeholder Influence",
    question: "When tech leadership pushes back on a request — feasibility, cost, risk — does the rest of the executive team respect the pushback as informed counsel?",
    level_indicators: {
      level_1: "Pushback is dismissed; tech is a 'no' department to be worked around.",
      level_2: "Pushback is heard but not weighed; political capital required to win.",
      level_3: "Pushback is treated as informed counsel; debate happens on merit.",
      level_4: "Pushback often shapes decisions; the executive team seeks tech's view actively.",
      level_5: "Tech-leader counsel is fiduciary; refusing to take it would feel like ignoring the CFO on a financial decision.",
    },
    tags: { function: ["strategic"], area: ["IT", "cross_functional"] },
    framework_citation: { framework: "HBR Persuasion Research + IT-CMF", reference: "Counsel Credibility", rationale: "Tech leaders whose pushback is dismissed have failed at influence; building credibility is the longest-running tech leadership project." },
  },

  // ----- Internal Communication -----
  {
    id: "m10_q7", module_number: 10, subcategory: "Internal Communication",
    question: "Are technology successes — wins, ROI, customer impact — communicated to the broader organization, not just hidden in IT?",
    level_indicators: {
      level_1: "Tech wins invisible; the organization sees IT as overhead.",
      level_2: "Some communication; uneven coverage.",
      level_3: "Documented communication program: monthly tech-impact updates, success stories shared internally.",
      level_4: "Tech contribution is visible across the company; managers reference tech wins in their own narratives.",
      level_5: "Technology is a brand inside the company; people want to work with the tech team.",
    },
    tags: { function: ["strategic", "operational"], area: ["IT", "cross_functional"] },
    framework_citation: { framework: "IT-CMF Internal Communications", reference: "Tech Brand", rationale: "Invisible wins don't build investment confidence; visible wins compound into hiring, partnerships, and budget." },
  },
  {
    id: "m10_q8", module_number: 10, subcategory: "Internal Communication",
    question: "Are technology constraints (capacity, dependencies, technical debt) communicated honestly — not minimized to avoid uncomfortable conversations?",
    level_indicators: {
      level_1: "Constraints minimized; commitments made that can't be kept; trust erodes.",
      level_2: "Constraints sometimes shared; inconsistently.",
      level_3: "Documented capacity / debt / dependency communication; trade-offs visible to stakeholders.",
      level_4: "Honesty is institutional; stakeholders trust the math.",
      level_5: "Constraint transparency is a competitive advantage internally; leaders make better decisions because they have accurate inputs.",
    },
    tags: { function: ["strategic", "operational"], area: ["IT", "cross_functional"] },
    framework_citation: { framework: "Patrick Lencioni Vulnerability-Based Trust + HBR", reference: "Honest Constraint Communication", rationale: "Constraint minimization is short-term political win and long-term trust loss; transparency builds durable credibility." },
  },
  {
    id: "m10_q9", module_number: 10, subcategory: "Internal Communication",
    question: "Are major technology decisions communicated to the broader organization — what was decided, why, and what changes — not just announced as fait accompli?",
    level_indicators: {
      level_1: "Decisions land as surprises; rationale unknown; resistance follows.",
      level_2: "Some decisions explained; many not.",
      level_3: "Documented decision-communication template: decision, rationale, alternatives considered, what changes.",
      level_4: "Communication precedes major changes; questions answered before objections form.",
      level_5: "Decision communication is institutional; the organization understands the why before it experiences the what.",
    },
    tags: { function: ["operational"], area: ["IT", "cross_functional"] },
    framework_citation: { framework: "Kotter 8-Step + HBR Change Communication", reference: "Decision Transparency", rationale: "Surprised stakeholders resist; informed stakeholders adapt; communication is the cheapest change-management investment." },
  },

  // ----- Stakeholder Inclusion -----
  {
    id: "m10_q10", module_number: 10, subcategory: "Stakeholder Inclusion",
    question: "Are diverse stakeholders (functional leaders, end users, frontline staff) included in technology decisions — not just IT and a sponsor?",
    level_indicators: {
      level_1: "IT decides; users find out at rollout.",
      level_2: "Some inclusion; mostly token consultation.",
      level_3: "Documented inclusion patterns: user research, functional steering committees, frontline panels.",
      level_4: "Inclusion is institutional; decisions feel co-owned across functions.",
      level_5: "Inclusion is cultural; the company is known for participative tech decisions and benefits from the resulting adoption.",
    },
    tags: { function: ["strategic", "operational"], area: ["IT", "cross_functional"] },
    framework_citation: { framework: "Prosci ADKAR + Kotter 8-Step", reference: "Participative Decision-making", rationale: "Decisions made narrowly are decisions adopted narrowly; inclusion is the cheapest predictor of successful change." },
  },
  {
    id: "m10_q11", module_number: 10, subcategory: "Stakeholder Inclusion",
    question: "Do stakeholders feel heard — that their input changed something visible — or that 'consultation' is theater?",
    level_indicators: {
      level_1: "Consultation is theater; stakeholders feel that their input doesn't matter.",
      level_2: "Some stakeholders feel heard; many do not.",
      level_3: "Documented closure loops: consultation outcomes communicated back; stakeholders see what changed.",
      level_4: "Trust in consultation is high; stakeholders engage substantively.",
      level_5: "The company is recognized externally for inclusive decision-making; talent and partners are attracted by it.",
    },
    tags: { function: ["operational"], area: ["IT", "cross_functional"] },
    framework_citation: { framework: "Prosci ADKAR (Awareness + Desire) + Patrick Lencioni Trust Pyramid", reference: "Trust in Process", rationale: "Hollow consultation erodes trust faster than no consultation; closure loops are the cheapest fix." },
  },
  {
    id: "m10_q12", module_number: 10, subcategory: "Stakeholder Inclusion",
    question: "Is technology leadership measured on stakeholder satisfaction (internal NPS / leadership pulse) — not just on operational metrics?",
    level_indicators: {
      level_1: "Tech leadership measured purely on uptime / project delivery; stakeholder satisfaction not measured.",
      level_2: "Some informal pulse-checking; not part of scorecard.",
      level_3: "Internal NPS / leadership pulse measured biannually; tech leadership scorecard includes it.",
      level_4: "Stakeholder satisfaction is a leading indicator on the executive scorecard; trends drive coaching.",
      level_5: "Tech leadership is recognized for stakeholder partnership as a category strength.",
    },
    tags: { function: ["strategic", "operational"], area: ["IT", "cross_functional"] },
    framework_citation: { framework: "HBR Leadership + Forrester Internal CX", reference: "Stakeholder Pulse", rationale: "What you measure shapes what you optimize; stakeholder satisfaction measurement makes relationship a tracked discipline." },
  },

  // ============================================================
  // MODULE 11: IT Team Structure & Operations
  // Phase 4 deep — ITIL 4 + IT-CMF. 12 questions.
  // ============================================================

  // ----- Organization Design -----
  {
    id: "m11_q1", module_number: 11, subcategory: "Organization Design",
    question: "Is the IT / digital team structure clearly defined — roles, reporting lines, scope of accountability — not just an org chart that no longer matches reality?",
    level_indicators: {
      level_1: "No formal structure; ad hoc reporting; accountability ambiguous.",
      level_2: "Basic org chart; mismatched with actual reporting in practice.",
      level_3: "Documented roles + responsibilities + career paths; org chart matches operations.",
      level_4: "Adaptive structure aligned to business capabilities; reorganized purposefully when capability shifts demand.",
      level_5: "Team topology is a strategic asset; the company evolves structure deliberately to enable strategy.",
    },
    tags: { function: ["operational", "strategic"], area: ["IT"] },
    framework_citation: { framework: "Team Topologies (Skelton & Pais) + IT-CMF", reference: "Team Topology", rationale: "Team Topologies' research shows team structure shapes architecture; deliberate topology design is the cheapest scaling lever." },
  },
  {
    id: "m11_q2", module_number: 11, subcategory: "Organization Design",
    question: "Are RACI / decision rights documented for technology work — who's responsible, accountable, consulted, informed — for every meaningful decision?",
    level_indicators: {
      level_1: "No RACI; every decision starts with 'who decides this?'",
      level_2: "RACI exists for some processes; coverage uneven.",
      level_3: "Documented RACI for major tech processes (incident, change, capacity, vendor); reviewed annually.",
      level_4: "RACI is enforced at process; decisions move quickly.",
      level_5: "Decision rights are institutional muscle; new joiners absorb them; the company scales without bottlenecks.",
    },
    tags: { function: ["operational"], area: ["IT", "cross_functional"] },
    framework_citation: { framework: "ITIL 4 + IT-CMF Decision Rights", reference: "RACI Discipline", rationale: "Without documented decision rights, every escalation costs leadership time; RACI is the cheapest path to throughput." },
  },
  {
    id: "m11_q3", module_number: 11, subcategory: "Organization Design",
    question: "Are team capacities — engineering, ops, product, security — known, planned, and capacity-balanced rather than overcommitted?",
    level_indicators: {
      level_1: "Capacity unknown; overcommit is constant; firefighting is normal.",
      level_2: "Some capacity awareness; planning is approximate.",
      level_3: "Documented capacity per team; quarterly planning balances demand and capacity.",
      level_4: "Capacity-vs-demand visible; protected slack reserved; surge capacity sourced when needed.",
      level_5: "Capacity is institutional; commitments are honored; firefighting is rare and analyzed when it occurs.",
    },
    tags: { function: ["operational", "strategic"], area: ["IT"] },
    framework_citation: { framework: "ITIL 4 Capacity Management + Lean", reference: "Capacity Discipline", rationale: "Overcommit is the slowest-acting morale and quality killer; capacity discipline prevents it." },
  },

  // ----- Service Operations -----
  {
    id: "m11_q4", module_number: 11, subcategory: "Service Operations",
    question: "Is there a service desk — defined SLAs, ticket routing, escalation paths — or is IT support 'send Slack messages and hope'?",
    level_indicators: {
      level_1: "No formal support; ad hoc Slack messages and emails.",
      level_2: "Some ticketing; bypass is common.",
      level_3: "Ticketed service desk with SLAs, routing, escalation; consumers know how to engage.",
      level_4: "Self-service portal handles common requests; AI-assisted resolution where appropriate.",
      level_5: "Service experience is a positive — internal teams prefer the IT process to working around it.",
    },
    tags: { function: ["operational"], area: ["IT", "cross_functional"] },
    framework_citation: { framework: "ITIL 4 Service Desk", reference: "Service Desk Discipline", rationale: "Bypass-driven IT support is unmeasurable IT support; service-desk discipline is the precondition for improvement." },
  },
  {
    id: "m11_q5", module_number: 11, subcategory: "Service Operations",
    question: "Are service levels (uptime, response time, resolution time) defined as numbers — and met as a discipline?",
    level_indicators: {
      level_1: "No SLAs; service quality is an opinion.",
      level_2: "Informal expectations; not measured.",
      level_3: "Documented SLAs with monitoring; reported monthly; gaps addressed.",
      level_4: "SLOs / SLIs with error budgets and continuous improvement; investments funded by SLO gaps.",
      level_5: "Service-level discipline is a competitive asset; consumers can rely on the math.",
    },
    tags: { function: ["operational"], area: ["IT"] },
    framework_citation: { framework: "ITIL 4 SLM + Google SRE", reference: "SLO Discipline", rationale: "Aspirational service levels don't drive investment; explicit SLOs do." },
  },
  {
    id: "m11_q6", module_number: 11, subcategory: "Service Operations",
    question: "Is incident management documented — declared incidents, named commanders, post-incident reviews — not improvised per outage?",
    level_indicators: {
      level_1: "Incidents handled chaotically; no commander; no post-mortem.",
      level_2: "Some incident discipline; coverage uneven.",
      level_3: "Documented incident process: declare, assemble, command, communicate, resolve, post-mortem.",
      level_4: "Post-mortems blameless and learnings tracked; incident frequency falls year-over-year.",
      level_5: "Incident response is a competitive asset; the company recovers faster than peers and learns more from each event.",
    },
    tags: { function: ["operational", "risk"], area: ["IT"] },
    framework_citation: { framework: "ITIL 4 Incident Management + Google SRE", reference: "Incident Discipline", rationale: "Improvised incident response is variable in outcome; disciplined incident response compounds learning." },
  },

  // ----- Change & Release -----
  {
    id: "m11_q7", module_number: 11, subcategory: "Change & Release",
    question: "Are changes (deployments, infrastructure changes, configuration changes) controlled — reviewed, scheduled, and reversible — not pushed under pressure?",
    level_indicators: {
      level_1: "Changes pushed without process; outages from changes are common.",
      level_2: "Some change discipline; many bypasses.",
      level_3: "Documented change process: standard / normal / emergency; reviewed and scheduled appropriately.",
      level_4: "High deploy frequency with low change-fail rate; rollback is routine.",
      level_5: "Change management enables velocity (DORA elite tier); changes flow as low-friction routine.",
    },
    tags: { function: ["operational", "technical", "risk"], area: ["IT"] },
    framework_citation: { framework: "ITIL 4 Change Enablement + DORA", reference: "Change Discipline", rationale: "Uncontrolled change is the leading cause of avoidable outages; controlled change enables velocity." },
  },
  {
    id: "m11_q8", module_number: 11, subcategory: "Change & Release",
    question: "Is release management coordinated — releases planned, dependencies tracked, rollback paths defined — for changes that span multiple systems or teams?",
    level_indicators: {
      level_1: "Releases coordinated by yelling; dependencies discovered at impact.",
      level_2: "Some coordination; gaps remain.",
      level_3: "Documented release process for cross-team changes; rollback paths required.",
      level_4: "Release calendar visible across teams; orchestration mature.",
      level_5: "Release is institutional muscle; the company ships large changes with confidence.",
    },
    tags: { function: ["operational", "technical"], area: ["IT"] },
    framework_citation: { framework: "ITIL 4 Release Management + DORA", reference: "Release Discipline", rationale: "Cross-team release without coordination is failure-prone; managed release is the lever for safe scale." },
  },
  {
    id: "m11_q9", module_number: 11, subcategory: "Change & Release",
    question: "Are problem-management routines in place — recurring issues identified, root-caused, and prevented — not just symptoms patched?",
    level_indicators: {
      level_1: "Each incident treated in isolation; recurring issues persist.",
      level_2: "Some root-causing; inconsistent.",
      level_3: "Documented problem-management process: trend analysis, root cause, preventive action.",
      level_4: "Recurrence rate of known issues falls; problem backlog actively reduced.",
      level_5: "The company is known for not making the same mistake twice; institutional learning is a competitive moat.",
    },
    tags: { function: ["operational"], area: ["IT"] },
    framework_citation: { framework: "ITIL 4 Problem Management", reference: "Problem Discipline", rationale: "Problem management is what separates incident response from incident prevention; its absence is the most common cause of operational degradation over time." },
  },

  // ----- Workforce & Culture -----
  {
    id: "m11_q10", module_number: 11, subcategory: "Workforce & Culture",
    question: "Are IT roles + skills mapped — known gaps, hiring plan, training plan — not 'we'll hire when something breaks'?",
    level_indicators: {
      level_1: "No skills map; hiring is reactive; gaps cause outages and burnout.",
      level_2: "Some skills awareness; hiring plan is informal.",
      level_3: "Documented skills inventory + gap analysis + hiring + training plan; reviewed annually.",
      level_4: "Skills development is continuous; bench depth covers core skills.",
      level_5: "The IT team is a magnet for talent; people want to work there.",
    },
    tags: { function: ["operational", "strategic"], area: ["IT"] },
    framework_citation: { framework: "IT-CMF Workforce Practice + SFIA Skills Framework", reference: "Skills Inventory", rationale: "Reactive hiring is expensive hiring; documented skills + gap planning is the cheapest workforce continuity investment." },
  },
  {
    id: "m11_q11", module_number: 11, subcategory: "Workforce & Culture",
    question: "Is on-call / out-of-hours load distributed sustainably — no single person carries the company on weekends — and is it compensated fairly?",
    level_indicators: {
      level_1: "On-call falls on a few; burnout is constant; turnover follows.",
      level_2: "Rotation exists; uneven distribution; compensation is informal.",
      level_3: "Documented on-call rotation + compensation policy; load measured and balanced.",
      level_4: "On-call burden is a tracked metric; investments to reduce it are funded.",
      level_5: "On-call is sustainable; the company can run 24/7 services without consuming its team.",
    },
    tags: { function: ["operational", "risk"], area: ["IT"] },
    framework_citation: { framework: "Google SRE + ITIL 4", reference: "Sustainable On-Call", rationale: "Unsustainable on-call is the most common cause of senior-engineer churn; explicit policy + compensation is the cheapest retention investment." },
  },
  {
    id: "m11_q12", module_number: 11, subcategory: "Workforce & Culture",
    question: "Is the IT team measured on outcomes — business impact, reliability, customer satisfaction — or on activity (ticket count, hours worked)?",
    level_indicators: {
      level_1: "Activity-only metrics; tickets closed, hours logged; outcomes invisible.",
      level_2: "Some outcome tracking; activity dominates.",
      level_3: "Documented outcome metrics: SLO attainment, change-fail rate, internal NPS, business KPIs supported.",
      level_4: "Outcomes are the core scorecard; activity is hygiene.",
      level_5: "IT-team contribution is measurable in business terms; the team is funded against demonstrated value.",
    },
    tags: { function: ["strategic", "operational"], area: ["IT"] },
    framework_citation: { framework: "DORA + IT-CMF Outcome Measurement", reference: "Outcome-led IT Performance", rationale: "Activity metrics measure busyness; outcome metrics measure value; the latter is what the rest of the business funds." },
  },

  // ============================================================
  // MODULE 12: Tech Finance & Value Realization
  //
  // Phase 1C Day 12 deep rewrite (2026-05-07). Question bank realigned
  // to TBM Council taxonomy (Cost Transparency, Run/Grow/Transform,
  // Cost for Performance, Cloud FinOps, Vendor & Subscription Management,
  // License Optimization, Vendor & Contract Management, Benchmarking)
  // and KPMG Return on Objectives (Strategic Alignment, Outcome
  // Definition, Value Realization, Portfolio Outcome Visibility,
  // Stakeholder Communication). Maturity rubrics drawn from TBM Council
  // maturity model + KPMG ROO practice progression. Every question
  // carries:
  //   - Layer-1 function tag (CFO/CIO see most; CEO sees strategic-only;
  //     Director-Finance sees the cost-discipline subset; Director-IT
  //     sees the cloud/SaaS/vendor subset by area=IT match)
  //   - Layer-2 area tag (finance / IT / cross_functional combinations)
  //   - Level-5 indicator describing the "industry-leading" state
  //     (board-grade transparency, FinOps integration, ROO-driven
  //     portfolio governance)
  //   - Framework citation surfaced inline in the assessment UI (TBM
  //     Council reference for spend-discipline questions; KPMG ROO
  //     reference for value-realization questions)
  //   - na_eligible default true (universal N/A escape)
  // ============================================================

  // ----- TBM Council: Cost Transparency -----
  {
    id: "m12_q1", module_number: 12, subcategory: "Cost Transparency",
    question: "Can you account for the full cost of technology — CapEx, OpEx, cloud, SaaS subscriptions, and IT labor — in one consolidated view?",
    level_indicators: {
      level_1: "Tech spend is scattered across budgets and cost centers; no consolidated view exists; questions about total cost get an estimate, not a number.",
      level_2: "Major buckets are tracked (hardware, software licenses) but cloud, SaaS sprawl, and embedded IT labor are not consolidated.",
      level_3: "Total tech spend is visible monthly across CapEx, OpEx, cloud, SaaS, and labor — categorized to a TBM-style taxonomy and reconciled to general ledger.",
      level_4: "Spend is dashboarded with month-over-month trend, variance against forecast, and drill-down by application, service, or business unit; anomalies trigger review.",
      level_5: "Total tech spend is a continuously updated, board-grade narrative — every variance has a documented business reason, and the spend story is part of every executive review.",
    },
    tags: { function: ["strategic", "financial"], area: ["finance", "IT"] },
    framework_citation: {
      framework: "TBM Council",
      reference: "Cost Transparency",
      rationale: "TBM's first principle is that you cannot manage what you cannot see — total tech spend visibility is the foundation of every other discipline.",
    },
  },
  {
    id: "m12_q2", module_number: 12, subcategory: "Cost Transparency",
    question: "Do you know what percentage of your tech spend goes to keeping current operations running versus growing the business versus transforming it?",
    level_indicators: {
      level_1: "Spend is bucketed by general ledger account; nobody can say what percentage goes to run vs grow vs transform.",
      level_2: "An informal estimate of run-vs-grow-vs-transform exists in someone's head or a one-time slide; it is not maintained or reported.",
      level_3: "Tech spend is formally allocated to Run / Grow / Transform every quarter and reviewed with executive leadership against a target mix.",
      level_4: "Run / Grow / Transform mix is dashboarded monthly with explicit targets (e.g., 60/25/15); shifts are decisions, not accidents.",
      level_5: "Run / Grow / Transform allocation is the lens for every funding conversation — the business actively rebalances toward growth and transformation as constraints relax.",
    },
    tags: { function: ["strategic", "financial"], area: ["finance", "IT"] },
    framework_citation: {
      framework: "TBM Council",
      reference: "Run / Grow / Transform Lens",
      rationale: "Run/Grow/Transform allocation is the most cited boardroom metric in tech finance — it answers 'are we maintaining or are we moving?'",
    },
  },
  {
    id: "m12_q3", module_number: 12, subcategory: "Cost Transparency",
    question: "Can you tell a business unit, application owner, or service line what they consumed in tech spend last quarter — by user, transaction, or service?",
    level_indicators: {
      level_1: "There is no concept of unit cost or chargeback; tech is a fixed overhead line on the P&L.",
      level_2: "Some major systems are charged back at a high level (e.g., per headcount), but most consumption is invisible to business owners.",
      level_3: "Showback (consumption visible, not billed) is in place for major services — applications, infrastructure, end-user computing — at the business-unit level.",
      level_4: "Unit costs (per user / per transaction / per GB) are tracked monthly; outliers are investigated; chargeback is in place for at least one major service.",
      level_5: "Unit-cost discipline drives behavior — business units actively right-size their consumption; tech finance partners with business on cost-vs-value tradeoffs.",
    },
    tags: { function: ["financial", "operational"], area: ["finance", "IT"] },
    framework_citation: {
      framework: "TBM Council",
      reference: "Cost for Performance / Showback & Chargeback",
      rationale: "Without showback or chargeback, tech is treated as a sunk cost; TBM's discipline makes consumption visible so business owners can make informed tradeoffs.",
    },
  },

  // ----- TBM Council: Cloud & SaaS Discipline -----
  {
    id: "m12_q4", module_number: 12, subcategory: "Cloud & SaaS Discipline",
    question: "Are cloud costs forecasted, monitored against budget, and right-sized monthly?",
    level_indicators: {
      level_1: "Cloud bills are paid as they arrive; nobody owns cloud spend or knows what is driving the trend.",
      level_2: "Cloud spend is reviewed quarterly; over-provisioned instances and orphaned resources accumulate between reviews.",
      level_3: "Monthly cloud-cost review with a named owner; reserved instances or committed-use discounts applied for predictable workloads; tags enforced on resources.",
      level_4: "FinOps practice in place — engineers see cost impact in dashboards; right-sizing, autoscaling, and savings plans are actively managed; chargeback to teams.",
      level_5: "Cloud cost is a first-class engineering metric — every architecture review includes a cost dimension; monthly waste is below industry benchmark.",
    },
    tags: { function: ["financial", "technical", "operational"], area: ["IT", "finance"] },
    framework_citation: {
      framework: "TBM Council + FinOps Foundation",
      reference: "Cloud FinOps Practice",
      rationale: "Cloud has the highest waste rate in tech spend (typically 30%+); FinOps integrates engineering and finance to capture it.",
    },
  },
  {
    id: "m12_q5", module_number: 12, subcategory: "Cloud & SaaS Discipline",
    question: "Do you maintain a current inventory of every SaaS subscription with cost, owner, renewal date, and active-user count?",
    level_indicators: {
      level_1: "There is no SaaS inventory; subscriptions are discovered when their renewal invoice arrives.",
      level_2: "A list exists in a spreadsheet but is incomplete and not updated regularly; renewal surprises are common.",
      level_3: "Maintained inventory of all SaaS subscriptions with cost, owner, renewal date, contract terms, and seat / usage data; reviewed quarterly.",
      level_4: "Renewals tracked 90 days ahead; usage data drives renewal-or-cancel decisions; new SaaS purchases gated through a procurement workflow.",
      level_5: "SaaS portfolio is actively pruned — every renewal is a decision, not an automatic; redundant or low-usage tools are consolidated quarterly.",
    },
    tags: { function: ["financial", "operational"], area: ["IT", "finance"] },
    framework_citation: {
      framework: "TBM Council",
      reference: "Vendor & Subscription Management",
      rationale: "SaaS sprawl is one of the largest hidden costs in modern tech budgets; an enforced inventory is the precondition for every other vendor-economics discipline.",
    },
  },
  {
    id: "m12_q6", module_number: 12, subcategory: "Cloud & SaaS Discipline",
    question: "Have you reviewed license utilization across major platforms in the last six months and reclaimed or downgraded unused seats?",
    level_indicators: {
      level_1: "Licenses are bought and forgotten; nobody knows what fraction of paid seats are actually in use.",
      level_2: "Periodic ad-hoc reviews when a renewal forces the conversation; waste is identified but rarely acted upon.",
      level_3: "Quarterly license-utilization review across major platforms; idle seats are reclaimed before next true-up.",
      level_4: "License management is automated — usage data feeds a dashboard, harvest-and-reassign workflow runs continuously, and waste rate is tracked as a KPI.",
      level_5: "License utilization is a continuous discipline — purchases are right-sized at order, idle seats are harvested in days not quarters; waste rate is in line with the best-in-class benchmark.",
    },
    tags: { function: ["financial", "operational"], area: ["IT", "finance"] },
    framework_citation: {
      framework: "TBM Council",
      reference: "License Optimization",
      rationale: "License waste typically runs 20-30% across major platforms; reclaiming it is the cheapest tech savings available — no business disruption, immediate margin.",
    },
  },

  // ----- TBM Council: Vendor Economics -----
  {
    id: "m12_q7", module_number: 12, subcategory: "Vendor Economics",
    question: "Do you track tech vendor spend by category and consolidate vendors where overlap exists?",
    level_indicators: {
      level_1: "Vendor relationships are inherited and undocumented; significant overlap exists across categories (e.g., multiple monitoring tools, multiple project-management tools).",
      level_2: "A vendor list exists with annual spend; overlap is acknowledged informally but not addressed.",
      level_3: "Vendor spend is categorized; overlap is reviewed annually; consolidation initiatives are identified and tracked.",
      level_4: "Vendor consolidation is a managed program — strategic vendor partnerships are formed, redundant tools are sunset on schedule, and the renewal calendar drives consolidation conversations.",
      level_5: "Vendor portfolio is actively shaped — concentration risk is balanced against negotiation leverage; vendor-business reviews are held with strategic partners.",
    },
    tags: { function: ["financial", "operational"], area: ["finance", "IT"] },
    framework_citation: {
      framework: "TBM Council",
      reference: "Vendor & Contract Management",
      rationale: "Consolidation captures both direct savings (volume discounts) and indirect savings (lower integration cost, fewer renewal events to manage).",
    },
  },
  {
    id: "m12_q8", module_number: 12, subcategory: "Vendor Economics",
    question: "Do you benchmark your tech spend (per employee, per revenue, or against industry peers) at least annually?",
    level_indicators: {
      level_1: "No benchmarking is done; the budget is whatever last year's was, plus or minus.",
      level_2: "Internal year-over-year comparison is done; external benchmarking is anecdotal or absent.",
      level_3: "Annual benchmarking against industry peers (e.g., Gartner IT Key Metrics, peer surveys); results inform budget conversations.",
      level_4: "Quarterly benchmarking against a peer set; outliers (categories where spend is materially above or below peer median) trigger investigation.",
      level_5: "Benchmarking is integrated into investment governance — every major initiative is sized against external reference points; the company knows where it intends to be a peer leader vs a fast follower.",
    },
    tags: { function: ["strategic", "financial"], area: ["finance"] },
    framework_citation: {
      framework: "TBM Council",
      reference: "Benchmarking & External Reference",
      rationale: "Without external benchmarks, internal budgets drift; benchmarking gives the board a reference point that internal arguments cannot.",
    },
  },

  // ----- KPMG Return on Objectives: Value Realization -----
  {
    id: "m12_q9", module_number: 12, subcategory: "Value Realization",
    question: "Does every funded tech initiative have a named business objective and an owner outside of IT?",
    level_indicators: {
      level_1: "Initiatives are funded based on technical merit or vendor pressure; no explicit link to a business objective is documented.",
      level_2: "Some initiatives have documented objectives, but ownership stays inside IT and the objective is rarely revisited after kickoff.",
      level_3: "Every funded initiative has a documented business objective and a named business owner outside IT; the objective is referenced in steering committee reviews.",
      level_4: "Investment governance enforces the linkage — initiatives without a business owner cannot pass the funding gate; objectives are quantified before funding.",
      level_5: "Business owners are accountable for outcomes, not deliverables — every quarterly review revisits the objective and either reaffirms, revises, or kills the initiative.",
    },
    tags: { function: ["strategic", "financial"], area: ["cross_functional", "finance"] },
    framework_citation: {
      framework: "KPMG Return on Objectives",
      reference: "Strategic Alignment Practice",
      rationale: "Tech initiatives without a named business owner outside IT are the most common pattern of failed investment — KPMG ROO makes the linkage non-negotiable.",
    },
  },
  {
    id: "m12_q10", module_number: 12, subcategory: "Value Realization",
    question: "Are success metrics for tech initiatives defined and signed off by the business owner before the initiative is funded?",
    level_indicators: {
      level_1: "Initiatives are funded on the basis of effort or scope (build X, deploy Y); success is whether it shipped.",
      level_2: "Metrics are sometimes defined late in the initiative (during pilot); they are technical metrics (uptime, performance), not business metrics.",
      level_3: "Business outcome metrics are defined and signed off by the business owner before funding; metrics are quantitative (revenue, cost, time, NPS, etc.).",
      level_4: "Metrics are tracked from kickoff through 90/180-day post-implementation; deviations trigger course-correction conversations.",
      level_5: "Outcome definition is a craft — metrics are SMART, downstream-correlated to financial outcomes, and used in real time to manage the initiative.",
    },
    tags: { function: ["strategic", "financial", "operational"], area: ["cross_functional", "finance"] },
    framework_citation: {
      framework: "KPMG Return on Objectives",
      reference: "Outcome Definition Practice",
      rationale: "Without pre-defined outcome metrics, every initiative claims success post-hoc; ROO requires the metric to be defined and owned before any money is committed.",
    },
  },
  {
    id: "m12_q11", module_number: 12, subcategory: "Value Realization",
    question: "Do you compare projected vs actual outcomes 90 to 180 days after a tech initiative goes live?",
    level_indicators: {
      level_1: "Initiatives are declared done at go-live; nobody comes back to check if the projected outcome materialized.",
      level_2: "Some initiatives are reviewed informally, but there is no consistent post-implementation review process.",
      level_3: "Formal post-implementation review at 90 and 180 days for every funded initiative; projected vs actual is documented; lessons learned are captured.",
      level_4: "Findings feed forward — patterns from past initiatives inform funding decisions on new ones; chronic over-promisers are flagged.",
      level_5: "Value realization tracking is a live discipline — outcomes are dashboarded across the portfolio; the company knows its actual realization rate and is improving it.",
    },
    tags: { function: ["strategic", "financial", "operational"], area: ["cross_functional", "finance"] },
    framework_citation: {
      framework: "KPMG Return on Objectives",
      reference: "Value Realization Practice",
      rationale: "Most organizations measure delivery (was it shipped?) but not realization (did it deliver the outcome?); ROO closes that gap.",
    },
  },
  {
    id: "m12_q12", module_number: 12, subcategory: "Value Realization",
    question: "Do you have a multi-quarter view that shows the cumulative outcomes the tech portfolio is on track to deliver?",
    level_indicators: {
      level_1: "There is no portfolio-level outcome view; outcomes are tracked, if at all, initiative-by-initiative in isolation.",
      level_2: "A roadmap of initiatives exists (timing, scope) but does not aggregate to expected outcomes at the portfolio level.",
      level_3: "Multi-quarter roadmap shows expected cumulative outcomes (revenue uplift, cost reduction, risk reduction) tied to initiative milestones.",
      level_4: "Roadmap is dynamic — updated quarterly with realized outcomes; gap-to-plan is visible; investment is rebalanced based on actual realization.",
      level_5: "Portfolio outcome roadmap is the central planning artifact for executive leadership — every funding conversation references it; the board sees it; it shapes M&A and divestiture conversations.",
    },
    tags: { function: ["strategic", "financial"], area: ["cross_functional", "finance"] },
    framework_citation: {
      framework: "KPMG Return on Objectives",
      reference: "Portfolio Outcome Visibility",
      rationale: "Without a portfolio view, individual initiatives can succeed while the portfolio underdelivers; ROO requires the cumulative lens.",
    },
  },
  {
    id: "m12_q13", module_number: 12, subcategory: "Value Realization",
    question: "Can you give the board a one-page view showing where tech investment is producing measured value versus where it is not?",
    level_indicators: {
      level_1: "Board updates on tech are status-of-projects (timeline, budget, risk) — not value-realized.",
      level_2: "Some value claims are reported anecdotally; numbers are typically projected, not realized; the board is left to take it on faith.",
      level_3: "Quarterly one-page board view shows realized vs projected outcomes by major investment area; backed by an underlying metric trail.",
      level_4: "Board view is part of a documented narrative — wins are celebrated, underperformers are explicitly flagged with corrective action plans, and the conversation moves to forward bets.",
      level_5: "Tech is a peer line of business in board reporting — outcome reporting is on par with revenue or operations reporting; the board treats tech finance with the same rigor as commercial finance.",
    },
    tags: { function: ["strategic", "financial"], area: ["finance", "cross_functional"] },
    framework_citation: {
      framework: "KPMG Return on Objectives",
      reference: "Stakeholder Communication & Board Reporting",
      rationale: "Tech investment is increasingly a board-level conversation; ROO's reporting discipline is what gives boards the confidence to fund the next bet.",
    },
  },

  // ----- AMP / PE-Underwriting Discipline: Hard-Dollar Defendability -----
  {
    id: "m12_q14", module_number: 12, subcategory: "Value Realization",
    question: "Are projected initiative benefits underwritten with a documented financial model — volume × time saved × fully-loaded cost × realizable percent — that survives 18-month retrospective scrutiny?",
    level_indicators: {
      level_1: "Benefit claims are narrative (we'll save time, we'll improve experience); no financial model underwrites the projection.",
      level_2: "Some initiatives have a benefit number, but the math is opaque or built on heroic adoption assumptions; nobody pressure-tests it.",
      level_3: "Documented financial model per major initiative — volume, minutes saved per unit, fully-loaded cost per minute, realizable percent — validated with workflow owners before funding.",
      level_4: "Conservative-estimate discipline; risk haircut applied; over-claims rarely survive funding gate; quarterly variance review against the underlying assumptions, not just the headline number.",
      level_5: "Every initiative would survive an 18-month CFO / LP / board retrospective without hedging — hard-dollar, recurring, defensible. Soft-benefit narratives are tracked separately and never co-mingled with margin claims.",
    },
    tags: { function: ["strategic", "financial"], area: ["finance"] },
    framework_citation: {
      framework: "KPMG Return on Objectives + AMP AI Diagnostic Playbook",
      reference: "Underwriting Discipline (Standardized Impact Formula)",
      rationale: "Benefit claims without an underwriting model produce theater; AMP's PE-grade discipline (volume × minutes × cost × realizable percent) and KPMG ROO's value-realization track produce numbers that survive 18-month scrutiny — which is the bar SMB CEOs need to defend tech spend to their boards or PE owners.",
    },
  },

  // ============================================================
  // MODULE 13: Portfolio, Vendors & SaaS Spend
  // Phase 4 deep — Gartner ITPPM + SaaS Optimization. 12 questions.
  // ============================================================

  // ----- Portfolio Discipline -----
  {
    id: "m13_q1", module_number: 13, subcategory: "Portfolio Discipline",
    question: "Is there a portfolio view of all in-flight technology projects — what's running, who owns each, what stage — visible to leadership?",
    level_indicators: {
      level_1: "No portfolio view; projects discovered when they fail or invoice arrives.",
      level_2: "Spreadsheet list of major projects; minor ones invisible.",
      level_3: "Documented portfolio with owner, stage, status, dependency map; reviewed monthly.",
      level_4: "Dynamic portfolio with real-time health metrics; anomalies detected early.",
      level_5: "Portfolio is a managed asset; the company knows what it's investing in and why at any moment.",
    },
    tags: { function: ["strategic", "operational"], area: ["IT", "cross_functional"] },
    framework_citation: { framework: "Gartner ITPPM", reference: "Portfolio Visibility", rationale: "Without a portfolio view, every project competes invisibly for capacity; visibility is the first lever of throughput." },
  },
  {
    id: "m13_q2", module_number: 13, subcategory: "Portfolio Discipline",
    question: "Are projects prioritized against each other on consistent criteria — value, effort, strategic fit — not by whoever lobbies hardest?",
    level_indicators: {
      level_1: "Loudest voice wins prioritization; criteria are ad hoc.",
      level_2: "Some criteria applied; inconsistently.",
      level_3: "Documented prioritization framework (value × effort, strategic alignment scoring); applied to every funding decision.",
      level_4: "Portfolio rebalanced quarterly based on outcomes; underperformers are sunset.",
      level_5: "Prioritization is institutional discipline; politics rarely overrides the framework.",
    },
    tags: { function: ["strategic"], area: ["IT", "cross_functional", "finance"] },
    framework_citation: { framework: "Gartner ITPPM", reference: "Prioritization Framework", rationale: "Without consistent criteria, prioritization is politics; criteria-based prioritization is the cheapest path to portfolio coherence." },
  },
  {
    id: "m13_q3", module_number: 13, subcategory: "Portfolio Discipline",
    question: "Are projects regularly reviewed against business case — kept, adjusted, or killed — not just allowed to run to completion regardless of changing context?",
    level_indicators: {
      level_1: "Projects approved at start, completed regardless of changing relevance.",
      level_2: "Some review at gates; rarely results in cancellation.",
      level_3: "Documented stage-gate review: every project must defend its case at quarterly checkpoints; cancellation is a normal outcome.",
      level_4: "Portfolio attrition (kill rate) is a tracked metric; dead projects are killed quickly.",
      level_5: "Project killing is a respected discipline; the company stops sunk-cost spending and reallocates.",
    },
    tags: { function: ["strategic", "operational"], area: ["IT", "cross_functional"] },
    framework_citation: { framework: "Gartner ITPPM", reference: "Stage-Gate Discipline", rationale: "Stage-gates prevent sunk-cost spending; without them, the portfolio gradually fills with projects nobody believes in." },
  },

  // ----- Vendor Lifecycle -----
  {
    id: "m13_q4", module_number: 13, subcategory: "Vendor Lifecycle",
    question: "Do you maintain a vendor inventory — every IT / SaaS / contractor relationship, with cost, owner, renewal date, and contract terms?",
    level_indicators: {
      level_1: "No vendor inventory; renewals surprise the company; shadow IT proliferates.",
      level_2: "Major vendors tracked; long tail invisible.",
      level_3: "Maintained inventory of all IT vendors with cost, owner, renewal date, contract terms, business function; reviewed quarterly.",
      level_4: "Renewal calendar tracked 90 days ahead; auto-renewals captured before they fire.",
      level_5: "Vendor inventory is the operational backbone of vendor management; new vendors are catalogued at signing.",
    },
    tags: { function: ["financial", "operational"], area: ["IT", "finance"] },
    framework_citation: { framework: "Gartner Vendor Management + TBM Council", reference: "Vendor Inventory", rationale: "Without an inventory, vendor management is a series of surprises; inventory is the precondition for every other discipline." },
  },
  {
    id: "m13_q5", module_number: 13, subcategory: "Vendor Lifecycle",
    question: "Are vendor performance + value reviewed regularly — scorecards, reference checks, alternative comparisons — not just at renewal?",
    level_indicators: {
      level_1: "Vendor performance unreviewed; renewals signed because they were last year's signature.",
      level_2: "Some review at renewal; thin and reactive.",
      level_3: "Documented scorecard per vendor (delivery, quality, value, alignment); reviewed at least annually.",
      level_4: "Performance feedback is shared with vendors; underperformers are coached or replaced.",
      level_5: "Strategic vendor partnerships have innovation roadmaps; tactical vendors are interchangeable and managed competitively.",
    },
    tags: { function: ["financial", "operational"], area: ["IT", "finance"] },
    framework_citation: { framework: "Gartner Vendor Management", reference: "Vendor Scorecard", rationale: "Vendors optimize for their revenue, not your outcomes, unless you hold them accountable; scorecards are the lever." },
  },
  {
    id: "m13_q6", module_number: 13, subcategory: "Vendor Lifecycle",
    question: "Are vendor contracts renegotiated or competed at renewal — not auto-renewed at the vendor's preferred uplift?",
    level_indicators: {
      level_1: "Auto-renewal is the default; uplifts pass without challenge.",
      level_2: "Some negotiation on big contracts; long tail auto-renews.",
      level_3: "Documented renewal-prep process: usage analysis, market benchmarking, alternatives evaluated, negotiation strategy.",
      level_4: "Renewals reliably negotiate price, terms, or service improvements.",
      level_5: "Procurement / vendor-management discipline is institutional; the company captures vendor savings as a habit.",
    },
    tags: { function: ["financial"], area: ["IT", "finance"] },
    framework_citation: { framework: "Gartner Procurement Discipline + TBM Council", reference: "Renewal Negotiation", rationale: "Auto-renewals cost 15-20% more than negotiated renewals; renewal discipline is the highest-ROI vendor work." },
  },

  // ----- SaaS Optimization -----
  {
    id: "m13_q7", module_number: 13, subcategory: "SaaS Optimization",
    question: "Do you maintain a SaaS subscription inventory with active-user counts and usage data — not just a list of names?",
    level_indicators: {
      level_1: "No SaaS inventory; subscriptions discovered at renewal invoice.",
      level_2: "Spreadsheet list; usage data unknown.",
      level_3: "Maintained inventory with cost, owner, renewal, contract terms, seat / usage data; reviewed quarterly.",
      level_4: "Usage data drives renew / cancel / right-size decisions; new SaaS purchases gated through procurement.",
      level_5: "SaaS portfolio actively pruned; redundant / low-usage tools consolidated quarterly.",
    },
    tags: { function: ["financial", "operational"], area: ["IT", "finance"] },
    framework_citation: { framework: "TBM Council + SaaS Optimization Practice", reference: "SaaS Inventory + Usage", rationale: "SaaS sprawl is among the largest hidden costs in modern tech budgets; inventory + usage data is the precondition for control." },
  },
  {
    id: "m13_q8", module_number: 13, subcategory: "SaaS Optimization",
    question: "Are unused / underused licenses reclaimed and reassigned regularly — not left to expire as silent waste?",
    level_indicators: {
      level_1: "Licenses bought and forgotten; idle seats accumulate.",
      level_2: "Periodic ad hoc reclaim; coverage uneven.",
      level_3: "Quarterly license-utilization review; idle seats reclaimed before next true-up.",
      level_4: "Automated license management; harvest-and-reassign workflow continuous.",
      level_5: "License waste rate is below industry benchmark; license discipline is institutional.",
    },
    tags: { function: ["financial", "operational"], area: ["IT", "finance"] },
    framework_citation: { framework: "TBM Council", reference: "License Optimization", rationale: "License waste runs 20-30% across major platforms; reclaim is the cheapest tech savings available." },
  },
  {
    id: "m13_q9", module_number: 13, subcategory: "SaaS Optimization",
    question: "Are vendors consolidated where overlap exists — multiple monitoring tools, multiple project-management tools, multiple chat platforms?",
    level_indicators: {
      level_1: "Vendor overlap is rampant; multiple tools doing the same job.",
      level_2: "Overlap acknowledged; not addressed.",
      level_3: "Vendor consolidation is a managed program; redundant tools are sunset on schedule.",
      level_4: "Consolidation roadmap drives renewal cycles; integration cost reduction tracked.",
      level_5: "Vendor portfolio is intentionally shaped — strategic concentration where it pays, deliberate diversification where lock-in risk demands.",
    },
    tags: { function: ["financial", "operational", "strategic"], area: ["IT", "finance"] },
    framework_citation: { framework: "TBM Council Vendor Consolidation", reference: "Consolidation Discipline", rationale: "Consolidation captures both direct savings (volume discounts) and indirect savings (lower integration cost, fewer renewals to manage)." },
  },

  // ----- Spend Discipline -----
  {
    id: "m13_q10", module_number: 13, subcategory: "Spend Discipline",
    question: "Do you benchmark IT spend (per employee, per revenue, per category) against industry peers at least annually?",
    level_indicators: {
      level_1: "No benchmarking; budget is whatever last year's was.",
      level_2: "Internal year-over-year comparison; external benchmarking absent.",
      level_3: "Annual benchmarking against industry peers (Gartner IT Key Metrics or equivalent).",
      level_4: "Quarterly benchmarking; outliers trigger investigation.",
      level_5: "Benchmarking is integrated into investment governance; the company knows where it intends to lead vs. follow.",
    },
    tags: { function: ["strategic", "financial"], area: ["IT", "finance"] },
    framework_citation: { framework: "Gartner IT Key Metrics + TBM Council", reference: "Benchmarking Discipline", rationale: "Without external benchmarks, internal arguments about IT spend have no anchor; benchmarking gives boards a reference point." },
  },
  {
    id: "m13_q11", module_number: 13, subcategory: "Spend Discipline",
    question: "Are shadow-IT purchases (cards, expensed SaaS, departmental contracts) discovered, catalogued, and folded into the central inventory?",
    level_indicators: {
      level_1: "Shadow IT invisible; surfaces only at audit or breach.",
      level_2: "Some shadow IT discovered reactively.",
      level_3: "Documented shadow-IT discovery process: expense audits, SSO logs, network traffic; catalogued quarterly.",
      level_4: "Shadow IT is reduced through governance + better central offerings; new shadow purchases rare.",
      level_5: "The company has a single, accurate view of all IT spend; shadow IT is structurally minimized.",
    },
    tags: { function: ["financial", "operational", "risk"], area: ["IT", "finance"] },
    framework_citation: { framework: "Gartner Shadow IT Management + TBM Council", reference: "Shadow-IT Discovery", rationale: "Shadow IT is the largest unmeasured tech spend; discovery is the precondition for management." },
  },
  {
    id: "m13_q12", module_number: 13, subcategory: "Spend Discipline",
    question: "Is spend allocated to value (Run / Grow / Transform) and reviewed against a target mix — not just spent against last year's distribution?",
    level_indicators: {
      level_1: "No Run/Grow/Transform allocation; spend is per-account historical.",
      level_2: "Informal estimate exists; not reported or reviewed.",
      level_3: "Tech spend formally allocated to Run / Grow / Transform quarterly; reviewed against target mix (e.g. 60/25/15).",
      level_4: "Mix shifts are decisions, not accidents; investments rebalanced toward growth and transformation.",
      level_5: "Run/Grow/Transform allocation is the lens for every funding conversation; the business actively reshapes the portfolio.",
    },
    tags: { function: ["strategic", "financial"], area: ["IT", "finance"] },
    framework_citation: { framework: "TBM Council Run/Grow/Transform", reference: "Spend Allocation Lens", rationale: "Run/Grow/Transform is the most cited boardroom metric in tech finance; without it, investment decisions stay tactical." },
  },

  // ============================================================
  // MODULE 14: Delivery, DevOps & Innovation
  // Phase 4 deep — DORA Metrics + SAFe / Spotify Health Check. 12 questions.
  // ============================================================

  // ----- DORA Metrics -----
  {
    id: "m14_q1", module_number: 14, subcategory: "Delivery Velocity",
    question: "What is your deployment frequency — and how do you compare to DORA elite (multiple per day) vs low (less than monthly)?",
    level_indicators: {
      level_1: "Deploy less than monthly; DORA Low; releases are events.",
      level_2: "Deploy weekly to monthly; DORA Medium-Low.",
      level_3: "Deploy weekly or several times per week; DORA Medium-High.",
      level_4: "Deploy daily; DORA High.",
      level_5: "Deploy on demand, multiple times per day; DORA Elite.",
    },
    tags: { function: ["technical", "operational"], area: ["IT"] },
    framework_citation: { framework: "DORA / Accelerate State of DevOps", reference: "Deployment Frequency", rationale: "DORA's research consistently shows deployment frequency is the strongest correlate of organizational performance — speed correlates with quality." },
  },
  {
    id: "m14_q2", module_number: 14, subcategory: "Delivery Velocity",
    question: "What is your lead time for changes — from commit to production — and how does it compare to DORA elite (less than one hour)?",
    level_indicators: {
      level_1: "Lead time > 6 months; DORA Low.",
      level_2: "Lead time 1-6 months; DORA Medium.",
      level_3: "Lead time 1 day to 1 week; DORA Medium-High.",
      level_4: "Lead time hours to 1 day; DORA High.",
      level_5: "Lead time < 1 hour; DORA Elite.",
    },
    tags: { function: ["technical", "operational"], area: ["IT"] },
    framework_citation: { framework: "DORA / Accelerate", reference: "Lead Time", rationale: "Lead time measures the friction of the change pipeline; reducing it forces every quality and reliability investment." },
  },
  {
    id: "m14_q3", module_number: 14, subcategory: "Delivery Velocity",
    question: "What is your change-fail rate — what percent of deploys cause a production incident, hotfix, or rollback?",
    level_indicators: {
      level_1: "Change-fail rate > 60%; deploys are scary; bypass is common.",
      level_2: "Change-fail rate 30-60%; deploys produce regular incidents.",
      level_3: "Change-fail rate 15-30%; DORA Medium.",
      level_4: "Change-fail rate 0-15%; DORA High to Elite.",
      level_5: "Change-fail rate consistently below 10%; deploys are routine and confidence is earned.",
    },
    tags: { function: ["technical", "operational", "risk"], area: ["IT"] },
    framework_citation: { framework: "DORA / Accelerate", reference: "Change-Fail Rate", rationale: "Change-fail rate measures pipeline + testing + culture quality; it is the leading indicator of operational risk in delivery." },
  },
  {
    id: "m14_q4", module_number: 14, subcategory: "Delivery Velocity",
    question: "What is your mean time to recovery (MTTR) when a production incident hits — minutes, hours, or days?",
    level_indicators: {
      level_1: "MTTR > 1 week; DORA Low; incidents drag.",
      level_2: "MTTR 1 day to 1 week; DORA Medium-Low.",
      level_3: "MTTR < 1 day; DORA Medium.",
      level_4: "MTTR < 1 hour; DORA High.",
      level_5: "MTTR < 30 min consistently; DORA Elite — recovery is muscle memory.",
    },
    tags: { function: ["technical", "operational"], area: ["IT"] },
    framework_citation: { framework: "DORA / Accelerate + Google SRE", reference: "MTTR Discipline", rationale: "MTTR is the floor on customer trust during incidents; investments in observability, runbooks, and on-call quality compound here." },
  },

  // ----- DevOps Practice -----
  {
    id: "m14_q5", module_number: 14, subcategory: "DevOps Practice",
    question: "Is testing automated — unit, integration, end-to-end — and run on every commit, not just before release?",
    level_indicators: {
      level_1: "Manual testing dominates; automated coverage minimal.",
      level_2: "Some automated tests; coverage gaps exposed regularly.",
      level_3: "Comprehensive automated test suite running on every commit; coverage measured.",
      level_4: "Test pyramid balanced (unit-heavy, fewer integration, focused E2E); flaky tests rare and treated as defects.",
      level_5: "Tests are a respected engineering asset; new code without tests is unusual; refactoring is safe.",
    },
    tags: { function: ["technical", "operational"], area: ["IT"] },
    framework_citation: { framework: "DORA + Google Testing Pyramid", reference: "Test Automation Practice", rationale: "Manual testing is rate-limited testing; automated testing is the precondition for high-frequency deploys." },
  },
  {
    id: "m14_q6", module_number: 14, subcategory: "DevOps Practice",
    question: "Are deployments automated end-to-end — including config, infrastructure, and monitoring — not partial pipelines that need manual steps?",
    level_indicators: {
      level_1: "Deploys involve manual steps; production drift between code and infrastructure.",
      level_2: "Some automation; manual interventions remain.",
      level_3: "Fully automated deploys for major services; rollback is a one-button operation.",
      level_4: "Infrastructure-as-code covers everything; deploys are reproducible.",
      level_5: "Deploy automation is institutional; unautomated deploys are exceptions, not norm.",
    },
    tags: { function: ["technical", "operational"], area: ["IT"] },
    framework_citation: { framework: "DORA + Continuous Delivery (Humble & Farley)", reference: "Deployment Automation", rationale: "Manual deploys are the floor of operational risk; automation is the enabler for everything else." },
  },
  {
    id: "m14_q7", module_number: 14, subcategory: "DevOps Practice",
    question: "Is security testing part of the pipeline (DevSecOps) — SAST, dependency scanning, secrets detection — not bolted on at audit?",
    level_indicators: {
      level_1: "No automated security testing; vulnerabilities surface at audit or incident.",
      level_2: "Some security scans; ignored when noisy.",
      level_3: "DevSecOps in pipeline: SAST, dependency scanning, secrets detection; findings actively managed.",
      level_4: "Security findings have SLAs by severity; backlog actively reduced.",
      level_5: "Security is shifted left; engineers consider security in design without prompting.",
    },
    tags: { function: ["technical", "risk"], area: ["IT"] },
    framework_citation: { framework: "OWASP DevSecOps + DORA", reference: "Shift-Left Security", rationale: "Security found late costs ~50x more than security found at design; shift-left is the cheapest security investment available." },
  },

  // ----- Agile + Innovation -----
  {
    id: "m14_q8", module_number: 14, subcategory: "Agile Practice",
    question: "Do delivery teams have working agile / scrum / kanban practices — sprints / cadences, retros that produce changes, working backlogs — or is it agile theater?",
    level_indicators: {
      level_1: "Waterfall delivery; long-cycle commitments; late surprises.",
      level_2: "Some agile rituals; theater dominates; outcomes don't change.",
      level_3: "Established agile teams: working cadence, retros producing changes, refined backlogs, velocity tracking.",
      level_4: "Scaled agile across teams (LeSS / SAFe / Spotify-flavored); coordination is mature.",
      level_5: "Agility is cultural; the company adapts plans without ceremony.",
    },
    tags: { function: ["operational"], area: ["IT", "cross_functional"] },
    framework_citation: { framework: "Scrum Guide + SAFe + Spotify Health Check", reference: "Agile Practice Maturity", rationale: "Agile theater is more expensive than waterfall because it adds rituals without delivering adaptability; healthy agile is rare and valuable." },
  },
  {
    id: "m14_q9", module_number: 14, subcategory: "Agile Practice",
    question: "Are teams empowered to make implementation decisions — with strategic guardrails — or do they wait for permission on every choice?",
    level_indicators: {
      level_1: "Every decision escalated; teams operate as ticket-takers.",
      level_2: "Some autonomy on small decisions; major decisions bottlenecked.",
      level_3: "Documented decision rights for delivery teams; escalation paths defined for the rare cases.",
      level_4: "Teams own outcomes; leadership sets direction and removes blockers.",
      level_5: "Empowerment is institutional; the company moves faster because permission is rarely the bottleneck.",
    },
    tags: { function: ["operational", "strategic"], area: ["IT", "cross_functional"] },
    framework_citation: { framework: "Team Topologies + Spotify Squad Model", reference: "Team Empowerment", rationale: "Bottlenecked teams are slow teams; empowerment is the cheapest velocity investment with the highest cultural return." },
  },

  // ----- Innovation -----
  {
    id: "m14_q10", module_number: 14, subcategory: "Innovation",
    question: "Is there a documented process for evaluating and adopting new technologies — radar, experiments, graduation — not just whatever a senior engineer wants?",
    level_indicators: {
      level_1: "No process; new tech adopted on individual preference.",
      level_2: "Some informal evaluation; gates are weak.",
      level_3: "Documented technology radar (assess / trial / adopt / hold); experiments produce decisions.",
      level_4: "Innovation pipeline funded; experiment-to-adoption rate is healthy.",
      level_5: "Innovation is institutional muscle; the company is recognized as an informed early adopter.",
    },
    tags: { function: ["strategic", "technical"], area: ["IT"] },
    framework_citation: { framework: "Thoughtworks Tech Radar + Gartner Hype Cycle", reference: "Innovation Discipline", rationale: "Without an innovation process, new tech adoption swings between FOMO and resistance; deliberate evaluation produces durable choices." },
  },
  {
    id: "m14_q11", module_number: 14, subcategory: "Innovation",
    question: "Are engineers given protected time for innovation / improvement work — not just feature work — to invest in capability?",
    level_indicators: {
      level_1: "100% feature work; technical debt and innovation suffer.",
      level_2: "Innovation time exists nominally; consumed by features in practice.",
      level_3: "Documented innovation / improvement allocation (e.g., 10-20% of capacity); protected against feature pressure.",
      level_4: "Innovation outputs are tracked: experiments shipped, debt retired, processes improved.",
      level_5: "The company's innovation cadence is a competitive advantage; engineers are attracted by it.",
    },
    tags: { function: ["strategic", "operational"], area: ["IT"] },
    framework_citation: { framework: "Google 20% Time + Atlassian ShipIt", reference: "Innovation Time", rationale: "Innovation without protected time is hopeful; explicit allocation is the lever for sustainable capability investment." },
  },
  {
    id: "m14_q12", module_number: 14, subcategory: "Innovation",
    question: "Are innovation outcomes (experiments, prototypes, learnings) shared institutionally — not just lost in individual notebooks?",
    level_indicators: {
      level_1: "Innovation outcomes are personal; no institutional learning.",
      level_2: "Some sharing happens informally.",
      level_3: "Documented innovation review / showcase cadence; outcomes catalogued.",
      level_4: "Patterns from past experiments shape new ones; institutional learning compounds.",
      level_5: "The company has a documented record of past bets — what worked, what didn't, why — and uses it routinely.",
    },
    tags: { function: ["operational", "strategic"], area: ["IT", "cross_functional"] },
    framework_citation: { framework: "Senge Learning Organization + Atlassian", reference: "Institutional Learning", rationale: "Lost institutional learning is the most expensive form of waste in innovation; sharing is the cheapest defense." },
  },

  // ============================================================
  // MODULE 15: Process Automation & Transformation
  // Phase 1C Day 13 deep pass — anchored to APQC PCF + Lean Six Sigma.
  // 13 questions across 5 subcategories. 8 APQC PCF + 5 Lean Six Sigma.
  // ============================================================

  // ----- APQC PCF: Process Inventory & Mapping -----
  {
    id: "m15_q1", module_number: 15, subcategory: "Process Inventory & Mapping",
    question: "Do you have a documented inventory of your core business processes — what they are, what they do, and where they live?",
    level_indicators: {
      level_1: "There is no process inventory; processes exist in people's heads and shared drives; nobody could list the top 20 processes if asked.",
      level_2: "A partial inventory exists in scattered docs (one team's runbook, another team's wiki); coverage is uneven and out of date.",
      level_3: "A maintained inventory of core processes exists, with each process named, scoped, and assigned to a category (operate, manage, support).",
      level_4: "Inventory is reviewed quarterly; new processes are catalogued at launch; redundant or dead processes are flagged for retirement.",
      level_5: "Process inventory is the operating-model backbone — every change conversation references it; inventory drives org design, automation roadmap, and audit scope.",
    },
    tags: { function: ["operational"], area: ["operations", "cross_functional"] },
    framework_citation: {
      framework: "APQC PCF",
      reference: "Process Classification Framework — Process Inventory",
      rationale: "APQC's first principle is that you cannot improve what you cannot name; a maintained process inventory is the precondition for every other discipline in this module.",
    },
  },
  {
    id: "m15_q2", module_number: 15, subcategory: "Process Inventory & Mapping",
    question: "Are your processes categorized using a recognized taxonomy (APQC PCF, eTOM, SCOR, or equivalent)?",
    level_indicators: {
      level_1: "There is no process taxonomy; processes are listed by team or owner, not by category.",
      level_2: "An informal taxonomy exists (one team's view) but is not used consistently across the company.",
      level_3: "Processes are classified using a recognized taxonomy at the level-1/level-2 (operate/manage/support, with major subcategories) tier.",
      level_4: "Taxonomy is granular (drilled to level-3 process IDs); cross-functional processes are catalogued under shared categories so handoffs are visible.",
      level_5: "Taxonomy is integrated with systems of record (ERP modules map to PCF process IDs, ITSM tickets reference process IDs) — analysis at the process level is fast and reliable.",
    },
    tags: { function: ["operational"], area: ["operations", "cross_functional"] },
    framework_citation: {
      framework: "APQC PCF",
      reference: "Cross-Industry Process Classification Framework",
      rationale: "A shared taxonomy makes benchmarking, automation prioritization, and cross-functional improvement possible; without it every comparison is an apples-and-oranges argument.",
    },
  },
  {
    id: "m15_q3", module_number: 15, subcategory: "Process Inventory & Mapping",
    question: "Does every core process have a named owner accountable for its performance and improvement?",
    level_indicators: {
      level_1: "Process ownership is implicit or shared; if a process breaks, nobody is on the hook by name.",
      level_2: "Some processes have owners assigned, but ownership is title-based (the manager) rather than capability-based; owners are not actively improving the process.",
      level_3: "Every core process has a named owner with documented responsibility for performance, improvement, and exceptions.",
      level_4: "Process owners are evaluated on process outcomes (cycle time, error rate, customer satisfaction); ownership is a discipline, not a label.",
      level_5: "Process owners are senior leaders for cross-cutting flows (order-to-cash, hire-to-retire); process performance is part of their executive scorecard.",
    },
    tags: { function: ["strategic", "operational"], area: ["operations", "cross_functional"] },
    framework_citation: {
      framework: "APQC PCF",
      reference: "Process Ownership & Governance",
      rationale: "Without named, accountable owners, processes drift; APQC's process-owner discipline is the lightest-weight governance that consistently produces process improvement.",
    },
  },

  // ----- APQC PCF: Process Performance & Metrics -----
  {
    id: "m15_q4", module_number: 15, subcategory: "Process Performance & Metrics",
    question: "Are your most critical processes measured — cycle time, error rate, cost per transaction, or equivalent — and reviewed regularly?",
    level_indicators: {
      level_1: "Process performance is anecdotal; nobody can tell you cycle time or error rate for a key process in numbers.",
      level_2: "Some processes have ad hoc measurements (a spreadsheet kept by one team) but metrics are not reported, reviewed, or trended.",
      level_3: "Critical processes are measured monthly with documented metrics (cycle time, error rate, throughput, cost-per-transaction); results are reviewed by process owners.",
      level_4: "Metrics are dashboarded in real time; trend lines are visible; owners investigate variance against target as a discipline.",
      level_5: "Process metrics flow into operational KPIs and the executive scorecard; the company manages by process performance, not by activity reports.",
    },
    tags: { function: ["operational", "financial"], area: ["operations", "cross_functional"] },
    framework_citation: {
      framework: "APQC PCF",
      reference: "Process Performance Measurement",
      rationale: "Process metrics are the feedback loop without which improvement is opinion-driven; APQC research consistently shows that measured processes outperform unmeasured ones by 30-50%.",
    },
  },
  {
    id: "m15_q5", module_number: 15, subcategory: "Process Performance & Metrics",
    question: "Are there documented service levels or quality targets for your customer-facing processes (order fulfillment, support response, onboarding)?",
    level_indicators: {
      level_1: "There are no service-level targets; customer-facing performance is whatever happens.",
      level_2: "Internal expectations exist informally (we try to respond in a day) but are not documented or measured.",
      level_3: "Documented SLAs / quality targets for major customer-facing processes; performance against target is reported.",
      level_4: "Targets are tied to customer impact (NPS / CSAT / churn correlation); misses trigger formal corrective action; SLAs are written into contracts where relevant.",
      level_5: "Service-level discipline is a competitive differentiator — performance is publicly committed, exceeded as a habit, and instrumented end-to-end.",
    },
    tags: { function: ["strategic", "operational"], area: ["operations", "sales"] },
    framework_citation: {
      framework: "APQC PCF",
      reference: "Service Level Management",
      rationale: "Customer-facing processes without service levels become inconsistent; APQC's SLA discipline closes the gap between intent and customer experience.",
    },
  },
  {
    id: "m15_q6", module_number: 15, subcategory: "Process Performance & Metrics",
    question: "Do you compare your process performance against industry benchmarks at least annually?",
    level_indicators: {
      level_1: "No benchmarking is done; the company has no idea whether its order-to-cash cycle, support resolution time, or hire-to-fill time is competitive.",
      level_2: "Benchmarking is anecdotal (we hear that companies our size do X) but not formal.",
      level_3: "Annual benchmarking against published peer data (APQC Open Standards, industry reports) for at least the top 5 processes.",
      level_4: "Quarterly benchmarking; outliers (top quartile or bottom quartile) trigger investigation and either share-or-fix conversations.",
      level_5: "Benchmarking is a planning input — investment decisions explicitly state where the company intends to be a peer leader vs. a fast follower vs. acceptable median.",
    },
    tags: { function: ["strategic", "operational"], area: ["operations", "cross_functional"] },
    framework_citation: {
      framework: "APQC PCF",
      reference: "Process Benchmarking & Open Standards",
      rationale: "Without external benchmarks, internal arguments about whether a process is good enough have no anchor; APQC's Open Standards database makes peer comparison a one-day exercise rather than a one-year project.",
    },
  },

  // ----- APQC PCF: Automation Strategy -----
  {
    id: "m15_q7", module_number: 15, subcategory: "Automation Strategy",
    question: "Have you identified the top 3-5 automation candidates by ROI, with the lean (manual / spreadsheet / shared-doc) form considered first?",
    level_indicators: {
      level_1: "Automation is opportunistic; whoever has the loudest pain or the favorite vendor gets the next automation budget.",
      level_2: "Some candidates are listed but ROI is hand-wavy; cheaper non-tool alternatives (a checklist, a template, a Friday review) are rarely evaluated.",
      level_3: "Top 3-5 automation candidates documented with effort-vs-payoff scoring; for each candidate, the lean alternative is named and explicitly compared before tool selection.",
      level_4: "Automation pipeline is reviewed quarterly with realized-vs-projected ROI; lean alternatives are deployed first and only escalated to tool-based automation when the lean form proves insufficient.",
      level_5: "Automation discipline is mature — the company rarely buys tools to solve problems that a clearer process or a shared template would solve cheaper.",
    },
    tags: { function: ["strategic", "financial", "operational"], area: ["operations", "IT"] },
    framework_citation: {
      framework: "APQC PCF + Lean Six Sigma",
      reference: "Automation Prioritization & Build-vs-Buy-vs-Lean",
      rationale: "The most expensive automation is the one that automates a bad process; APQC + Lean disciplines require lean alternatives to be considered first because automation amplifies whatever process you point it at.",
    },
  },
  {
    id: "m15_q8", module_number: 15, subcategory: "Automation Strategy",
    question: "Is there a governance model for citizen automation (low-code / Power Automate / Zapier / Notion automations) — who can build what without IT review?",
    level_indicators: {
      level_1: "Citizen automation is either banned (so people build shadow automations anyway) or completely ungoverned (so risky automations proliferate).",
      level_2: "Informal rules exist (run anything risky by IT) but are inconsistently applied; nobody has a list of citizen-built automations in production.",
      level_3: "Documented governance: list of approved citizen tools, scope of what citizens can build (process aids, internal helpers), what requires IT review (customer data, financial transactions, integrations), inventory of citizen automations maintained.",
      level_4: "Center of Excellence supports citizens — templates, code reviews, training; risky patterns are caught at design time rather than discovery time.",
      level_5: "Citizen automation is a strategic capability — non-technical staff routinely solve their own bottlenecks within governance guardrails; IT focuses on the heavy lifts.",
    },
    tags: { function: ["operational", "technical", "risk"], area: ["IT", "operations"] },
    framework_citation: {
      framework: "APQC PCF",
      reference: "Citizen Automation Governance",
      rationale: "Citizen automation is a force multiplier when governed and a risk vector when ungoverned; APQC's CoE pattern is the lightest-weight governance that scales without bottlenecking IT.",
    },
  },

  // ----- Lean Six Sigma: Waste & Lean Discipline -----
  {
    id: "m15_q9", module_number: 15, subcategory: "Waste & Lean Discipline",
    question: "Have you systematically identified the top sources of waste in your operations — rework, waiting, handoffs, overproduction, motion, inventory, defects, underused talent?",
    level_indicators: {
      level_1: "Waste is not a vocabulary the team uses; inefficiencies are accepted as how things work.",
      level_2: "Some waste is recognized informally (we know there's too much rework on X) but it's not systematically catalogued.",
      level_3: "Top waste sources documented for the most critical processes using a recognized framework (Lean's 8 wastes / DOWNTIME / TIM WOODS); waste hotspots are reviewed quarterly.",
      level_4: "Waste reduction is a managed program — each top waste has a named owner, a target, and a tracked improvement curve.",
      level_5: "Lean thinking is operating discipline — front-line staff identify and call out waste in standups; waste reduction is part of how the company gets better, not a separate project.",
    },
    tags: { function: ["operational"], area: ["operations", "cross_functional"] },
    framework_citation: {
      framework: "Lean Six Sigma",
      reference: "8 Wastes (DOWNTIME / TIM WOODS)",
      rationale: "Lean's 8-wastes model is the most widely recognized lens for identifying value-vs-waste in any operation; making waste visible is the first step to eliminating it cheaply.",
    },
  },
  {
    id: "m15_q10", module_number: 15, subcategory: "Waste & Lean Discipline",
    question: "Do teams run regular improvement cycles (Kaizen events, retrospectives, 5S, A3 problem-solving) at a documented cadence?",
    level_indicators: {
      level_1: "Improvement happens only when something breaks badly; there is no scheduled improvement cadence.",
      level_2: "Some teams run retrospectives or post-mortems sporadically; cadence is uneven and outputs are rarely tracked.",
      level_3: "Documented improvement cadence (weekly / monthly / quarterly retrospectives or Kaizen events) for major teams; outputs are captured and assigned.",
      level_4: "Improvements are tracked from idea to implementation; closure rate is measured; the cadence rarely slips.",
      level_5: "Improvement cadence is sacred — the company protects the time, celebrates the wins, and uses the rhythm as the engine of operational excellence.",
    },
    tags: { function: ["operational"], area: ["operations", "cross_functional"] },
    framework_citation: {
      framework: "Lean Six Sigma",
      reference: "Kaizen / Continuous Improvement Cadence",
      rationale: "Continuous improvement requires rhythm, not heroics; Lean's structured improvement cycles are what convert waste-spotting into actual change.",
    },
  },
  {
    id: "m15_q11", module_number: 15, subcategory: "Waste & Lean Discipline",
    question: "Is there a documented method for capturing process improvement ideas from front-line staff — and a measured response cycle?",
    level_indicators: {
      level_1: "Front-line ideas die in the gap between staff and management; nobody collects them.",
      level_2: "An idea box / suggestion form exists but most submissions are ignored or take months to evaluate.",
      level_3: "Documented intake (form / channel), triage (named reviewer, target response time), and feedback loop (the submitter learns what happened to their idea).",
      level_4: "Response time is measured and reported; implemented suggestions are tracked back to their source; staff see their improvements adopted as a regular event.",
      level_5: "Front-line idea flow is a primary improvement engine — the volume, response rate, and implementation rate are KPIs; the company would notice immediately if the channel went silent.",
    },
    tags: { function: ["operational"], area: ["operations", "cross_functional"] },
    framework_citation: {
      framework: "Lean Six Sigma",
      reference: "Gemba / Voice of the Worker",
      rationale: "The people closest to the work see waste first; Lean's gemba discipline turns that line-of-sight into a continuous improvement input rather than wasted institutional knowledge.",
    },
  },

  // ----- Lean Six Sigma: Continuous Improvement & Change Adoption -----
  {
    id: "m15_q12", module_number: 15, subcategory: "Continuous Improvement & Change Adoption",
    question: "When a process is improved, does the new way stick — or do teams quietly drift back within 6 months?",
    level_indicators: {
      level_1: "Improvements are mostly cosmetic; six months after a project ends, nobody is following the new process.",
      level_2: "Some improvements stick (when the loud sponsor is watching) but most decay; nobody measures stickiness.",
      level_3: "Process changes are accompanied by training, updated documentation, and a 60/90-day adherence check; sustained adherence is the explicit success criterion.",
      level_4: "Adherence is measured at 90/180/365 days; root causes of decay are investigated and addressed (was the new process actually better? did the training cover the right things?).",
      level_5: "Sustainability is the discipline — improvements are designed to be self-reinforcing (visible metrics, simpler than the old way, embedded in tools), not policed.",
    },
    tags: { function: ["operational"], area: ["operations", "cross_functional"] },
    framework_citation: {
      framework: "Lean Six Sigma",
      reference: "Sustain (the S in DMAIC's Control / 5S's Sustain)",
      rationale: "Most improvement programs fail at sustain; Lean's explicit Sustain phase is what separates real change from project theater.",
    },
  },
  {
    id: "m15_q13", module_number: 15, subcategory: "Continuous Improvement & Change Adoption",
    question: "Do you measure the cumulative business impact of process improvements — hours freed, errors avoided, dollars saved, customer experience improved?",
    level_indicators: {
      level_1: "Improvement impact is not measured; the company cannot say what last year's improvement work returned.",
      level_2: "Some improvements claim impact (a slide here, a memo there) but numbers are not aggregated or audited.",
      level_3: "Documented benefits register tracks each improvement: target benefit, realized benefit, status; reviewed quarterly with the executive team.",
      level_4: "Benefits are validated against pre-baseline measurements; over-claims and under-realized projects are flagged; the realization rate is a known number.",
      level_5: "Process improvement is funded based on its track record — the discipline produces measurable returns reliably enough that the company invests in it as it would in any other capital activity.",
    },
    tags: { function: ["strategic", "financial", "operational"], area: ["operations", "finance"] },
    framework_citation: {
      framework: "Lean Six Sigma",
      reference: "Benefits Realization (DMAIC Control / Hard-Soft Savings)",
      rationale: "Improvement work without realized-benefits tracking quickly becomes performative; Lean's hard-soft savings discipline keeps the program grounded in actual outcomes.",
    },
  },

  // ----- AMP / AI Operator Playbook: AI-Readiness Precondition -----
  {
    id: "m15_q14", module_number: 15, subcategory: "Continuous Improvement & Change Adoption",
    question: "Is your process structure standardized enough to be AI-automatable — or would AI amplify exception handling, rework, and the existing variability?",
    level_indicators: {
      level_1: "Most processes are high-variability and exception-heavy; pointing AI at them today would scale the chaos rather than the work.",
      level_2: "Some processes are structured enough; the company can name 1-2 candidates but has not screened the rest for AI-readiness.",
      level_3: "Top processes are screened for AI-readiness using a standardization / repeatability / exception-rate lens; AI-unready processes are flagged for cleanup before any AI investment.",
      level_4: "AI-readiness is a precondition gate — no process gets an AI investment until standardization, data readiness, and exception rate clear documented thresholds.",
      level_5: "AI investment and process redesign run together — process owners know that fixing structure unlocks AI value, and AI-readiness is part of every process owner's scorecard.",
    },
    tags: { function: ["strategic", "operational", "technical"], area: ["operations", "IT"] },
    framework_citation: {
      framework: "APQC PCF + AMP AI Diagnostic Playbook",
      reference: "Feasibility — Process Structure & Standardization",
      rationale: "AI amplifies whatever process you point it at; high-variability or exception-heavy processes scale the chaos rather than the work. AMP's PE-underwriting discipline treats process structure as a decisive feasibility criterion — often the criterion that kills otherwise-attractive AI initiatives.",
    },
  },

  // ============================================================
  // MODULE 16: Workforce, Skills & Change
  // Phase 4 deep — Prosci ADKAR + Kotter 8-Step. 12 questions.
  // ============================================================

  // ----- ADKAR: Awareness + Desire -----
  {
    id: "m16_q1", module_number: 16, subcategory: "Change Awareness & Desire",
    question: "When a technology change is launched, do affected employees understand WHY — the business reason, the customer outcome — not just WHAT is changing?",
    level_indicators: {
      level_1: "Changes announced as faits accomplis; affected employees learn at deployment.",
      level_2: "Some communication; employees know what; rationale is thin.",
      level_3: "Documented communication plan per change: rationale, customer / business outcome, what changes, what doesn't.",
      level_4: "Communication is layered (executive sponsor, manager, peer); awareness is measured before launch.",
      level_5: "Awareness work is institutional; the company communicates change as a craft.",
    },
    tags: { function: ["operational", "strategic"], area: ["cross_functional"] },
    framework_citation: { framework: "Prosci ADKAR", reference: "A — Awareness", rationale: "Prosci's research consistently shows the Awareness step is the most under-invested and the most predictive of adoption; without it, every later step compounds the initial gap." },
  },
  {
    id: "m16_q2", module_number: 16, subcategory: "Change Awareness & Desire",
    question: "Is the case for change made compelling — what's in it for the affected person, not just for the company?",
    level_indicators: {
      level_1: "Change benefits framed in company-only terms; employees ask 'what's in it for me?' and don't get an answer.",
      level_2: "Some personal-benefit framing; thin and not credible.",
      level_3: "Documented WIIFM (What's In It For Me) per stakeholder group: time saved, friction removed, capability gained.",
      level_4: "Manager-led conversations help individuals connect change to their personal context.",
      level_5: "Desire to change is built — employees pull the change rather than being pushed; resistance is exception.",
    },
    tags: { function: ["operational"], area: ["cross_functional"] },
    framework_citation: { framework: "Prosci ADKAR", reference: "D — Desire", rationale: "Desire cannot be ordered; it is built. WIIFM-driven communication is the cheapest desire-building investment." },
  },
  {
    id: "m16_q3", module_number: 16, subcategory: "Change Awareness & Desire",
    question: "Is there an executive sponsor for major changes — visibly active throughout, not just at the kickoff and the celebration?",
    level_indicators: {
      level_1: "Sponsor in name only; visible at launch and silent thereafter.",
      level_2: "Sponsor episodically engaged; pattern-of-presence inconsistent.",
      level_3: "Documented sponsor commitment: regular check-ins, blocker removal, public reinforcement.",
      level_4: "Sponsor is a known accountable owner; program success or failure attaches to them.",
      level_5: "Sponsorship is institutional discipline; sponsors are coached on change leadership before assignment.",
    },
    tags: { function: ["strategic", "operational"], area: ["cross_functional"] },
    framework_citation: { framework: "Prosci ADKAR + Kotter Step 1 (Sense of Urgency) + Step 2 (Guiding Coalition)", reference: "Active Sponsorship", rationale: "Prosci research identifies sponsor presence as the single strongest predictor of change success; sponsor absence is the most common cause of change failure." },
  },

  // ----- ADKAR: Knowledge + Ability -----
  {
    id: "m16_q4", module_number: 16, subcategory: "Knowledge & Ability",
    question: "Are employees actively upskilled for the digital capabilities the company is investing in — not just told to figure it out?",
    level_indicators: {
      level_1: "No training program; employees expected to absorb new tools on their own.",
      level_2: "Basic tool training; underutilized.",
      level_3: "Documented digital-literacy program with learning paths per role; participation tracked.",
      level_4: "Continuous learning culture with personalized development; capability uplift measured.",
      level_5: "Skills development is a competitive moat; the company is recognized as a place where people grow.",
    },
    tags: { function: ["operational", "strategic"], area: ["cross_functional"] },
    framework_citation: { framework: "Prosci ADKAR", reference: "K — Knowledge", rationale: "Knowledge is the most common adoption gap; structured upskilling is the cheapest investment with the highest individual return." },
  },
  {
    id: "m16_q5", module_number: 16, subcategory: "Knowledge & Ability",
    question: "Is there a training budget for digital skills — not zero, not symbolic — proportionate to the investment in tools and platforms?",
    level_indicators: {
      level_1: "No training budget; tools deployed; capability assumed.",
      level_2: "Symbolic training budget; rarely used.",
      level_3: "Documented training budget per employee per year; planned learning paths.",
      level_4: "Training spend is tracked against tool spend; ratio benchmarked.",
      level_5: "Training is funded as capital investment; the company defends the spend like any other capability investment.",
    },
    tags: { function: ["financial", "strategic"], area: ["cross_functional"] },
    framework_citation: { framework: "Prosci ADKAR + IT-CMF Workforce Practice", reference: "Training Investment", rationale: "Tools without training are paid software people don't use; the training budget is the multiplier on every tool investment." },
  },
  {
    id: "m16_q6", module_number: 16, subcategory: "Knowledge & Ability",
    question: "Are employees given protected time + practice opportunities to build new capabilities — not just access to the tool — so the skill actually develops?",
    level_indicators: {
      level_1: "No protected time; learning is supposed to happen on personal time or between fires.",
      level_2: "Some allowance; consumed by operational pressure.",
      level_3: "Documented learning time per role; practice opportunities embedded in the work.",
      level_4: "Capability development tracked at individual level; manager check-ins reinforce growth.",
      level_5: "Capability acquisition is a respected discipline; growth is institutional.",
    },
    tags: { function: ["operational", "strategic"], area: ["cross_functional"] },
    framework_citation: { framework: "Prosci ADKAR", reference: "A — Ability", rationale: "Knowledge without practice does not become ability; protected time is the lever that turns one into the other." },
  },

  // ----- ADKAR: Reinforcement -----
  {
    id: "m16_q7", module_number: 16, subcategory: "Reinforcement",
    question: "Are new behaviors reinforced after launch — through rituals, recognition, performance reviews, manager coaching — not just announced and abandoned?",
    level_indicators: {
      level_1: "No reinforcement; old behaviors return within months.",
      level_2: "Some reinforcement happens reactively; coverage uneven.",
      level_3: "Documented reinforcement plan: 30/60/90/180-day check-ins, manager coaching, recognition, performance integration.",
      level_4: "Reinforcement is a tracked discipline; behavior persistence is measured.",
      level_5: "Reinforcement is cultural; new behaviors stick because the system supports them.",
    },
    tags: { function: ["operational", "strategic"], area: ["cross_functional"] },
    framework_citation: { framework: "Prosci ADKAR + Lean Six Sigma Sustain", reference: "R — Reinforcement / Sustain", rationale: "Reinforcement is the most common point of failure in change programs; without it, regression is inevitable." },
  },
  {
    id: "m16_q8", module_number: 16, subcategory: "Reinforcement",
    question: "Is adoption of new tools / processes measured at 30 / 60 / 90 / 180 days — not just declared 'done' at rollout?",
    level_indicators: {
      level_1: "Adoption not measured; declared done at launch.",
      level_2: "Some adoption tracking; thin and infrequent.",
      level_3: "Documented adoption metrics tracked at 30 / 60 / 90 / 180 days; gaps drive intervention.",
      level_4: "Adoption is a tracked KPI per change program; root-cause investigation on shortfalls.",
      level_5: "Adoption discipline is institutional; the company knows its realization rate on change programs.",
    },
    tags: { function: ["operational"], area: ["cross_functional"] },
    framework_citation: { framework: "Prosci ADKAR + KPMG ROO Realization Tracking", reference: "Adoption Measurement", rationale: "Unmeasured adoption is unverified adoption; the discipline is the lower bound on credibility." },
  },
  {
    id: "m16_q9", module_number: 16, subcategory: "Reinforcement",
    question: "Are change champions — peer advocates inside affected teams — identified, trained, and active during the rollout?",
    level_indicators: {
      level_1: "No champions; change is a top-down mandate.",
      level_2: "Some informal champions; not coordinated.",
      level_3: "Documented champion network: identified, trained, equipped with talking points; visible during rollout.",
      level_4: "Champions are a respected role; supported with time and recognition; provide feedback loop.",
      level_5: "Champion network is a competitive capability; new changes ride existing networks.",
    },
    tags: { function: ["operational"], area: ["cross_functional"] },
    framework_citation: { framework: "Kotter Step 2 (Guiding Coalition) + Prosci Change Network", reference: "Change Champions", rationale: "Peer-to-peer advocacy moves the middle of the adoption curve; without champions, change is a top-down monologue." },
  },

  // ----- Workforce + Hybrid -----
  {
    id: "m16_q10", module_number: 16, subcategory: "Workforce & Hybrid",
    question: "Is remote / hybrid work supported with the right technology — collaboration platforms, async tooling, secure access — not just VPN and hope?",
    level_indicators: {
      level_1: "No remote capability; office-dependence is structural.",
      level_2: "Basic remote access (VPN); collaboration is reactive video calls.",
      level_3: "Full collaboration platform: documents, async chat, video, knowledge base; remote-friendly by default.",
      level_4: "Digital workplace with async-first culture; productivity unaffected by location.",
      level_5: "Workforce flexibility is a competitive advantage in hiring and retention; the company is location-independent.",
    },
    tags: { function: ["strategic", "operational"], area: ["IT", "cross_functional"] },
    framework_citation: { framework: "Atlassian Distributed Work + Microsoft Hybrid Work Index", reference: "Hybrid Work Capability", rationale: "Remote-readiness is a hiring and resilience advantage; the technology investment is small relative to the talent-pool expansion." },
  },
  {
    id: "m16_q11", module_number: 16, subcategory: "Workforce & Hybrid",
    question: "Are AI tools (assistants, copilots, summarizers) deliberately rolled out — with policy, training, and use cases — rather than employees adopting consumer ChatGPT in shadow?",
    level_indicators: {
      level_1: "No AI tooling strategy; employees use consumer ChatGPT with company data; risk is hidden.",
      level_2: "Some AI access provided; without training or policy.",
      level_3: "Documented AI rollout: approved tools, policy, training; productive use cases identified per function.",
      level_4: "AI uplift measured per function; productivity gains documented.",
      level_5: "AI-enabled workforce is a competitive capability; people work differently than peers' employees do.",
    },
    tags: { function: ["strategic", "operational", "risk"], area: ["IT", "cross_functional"] },
    framework_citation: { framework: "NIST AI RMF + Microsoft Workforce AI Practices", reference: "Workforce AI Adoption", rationale: "Shadow AI use is data leakage and missed productivity at the same time; deliberate rollout captures the upside while controlling the downside." },
  },
  {
    id: "m16_q12", module_number: 16, subcategory: "Workforce & Hybrid",
    question: "Is the technology workforce (IT, data, security, product) sized and skilled for what the strategy demands — not just for what's already running?",
    level_indicators: {
      level_1: "Workforce sized for run; growth and transformation under-resourced.",
      level_2: "Some forward sizing; reactive hiring dominates.",
      level_3: "Documented workforce plan tied to strategy: which roles internal vs. fractional vs. partner, hiring targets, skill development paths.",
      level_4: "Workforce plan is reviewed quarterly; capability gaps closed proactively.",
      level_5: "Workforce planning is a strategic discipline; the company has the people it needs for the strategy it set.",
    },
    tags: { function: ["strategic", "operational"], area: ["IT", "cross_functional"] },
    framework_citation: { framework: "IT-CMF Workforce Practice + SFIA Skills Framework", reference: "Workforce Strategy Alignment", rationale: "Workforce sized only for current operations cannot deliver future strategy; explicit alignment of workforce to strategy is the precondition for strategic delivery." },
  },
];

// --- Helper: Get questions for a specific module ---

export function getModuleQuestions(moduleNumber: number): DiagnosticQuestion[] {
  return DIAGNOSTIC_QUESTIONS.filter((q) => q.module_number === moduleNumber);
}

// --- Helper: Get all module numbers ---

export function getModuleNumbers(): number[] {
  return [...new Set(DIAGNOSTIC_QUESTIONS.map((q) => q.module_number))].sort(
    (a, b) => a - b
  );
}

// --- Helper: Whether a module has the new (Phase 1C v2) schema ---
// Used by the assessment UI to decide whether to render the role-filtered
// view + per-question N/A + framework citations + the level-5 indicator,
// or fall back to the legacy 4-level layout.
export function moduleHasV2Schema(moduleNumber: number): boolean {
  const qs = getModuleQuestions(moduleNumber);
  return qs.length > 0 && qs.every((q) => q.tags !== undefined && q.level_indicators.level_5 !== undefined);
}
