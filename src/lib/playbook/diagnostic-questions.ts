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
  // Cut from 12 questions to 5 signal questions on 2026-05-08.
  // Each retained question maps to a specific named knowledge
  // area in DAMA-DMBOK or a specific function of the NIST AI RMF.
  // ============================================================
  {
    id: "m6_q1", module_number: 6, subcategory: "Data Foundations",
    question: "Do you maintain a data catalog covering core domains — system of record, owner, sensitivity classification — for the data your business depends on?",
    level_indicators: {
      level_1: "No data inventory; nobody can name where customer / financial / operational data lives.",
      level_2: "Partial inventory in scattered docs; sensitive data locations are uncertain.",
      level_3: "Maintained data catalog covering core domains with named owners and sensitivity tagging.",
      level_4: "Catalog automated where possible; lineage between systems captured.",
      level_5: "Catalog is the operating-model backbone; new data flows are catalogued at landing.",
    },
    tags: { function: ["technical", "operational", "risk"], area: ["IT"] },
    framework_citation: {
      framework: "DAMA-DMBOK 2 (DAMA International Data Management Body of Knowledge)",
      reference: "Data Architecture + Metadata Management knowledge areas",
      rationale: "DAMA-DMBOK's published Knowledge Area Wheel identifies Data Architecture and Metadata Management as foundational; a maintained data catalog is the operational artifact both areas require.",
    },
    provenance: "DAMA-DMBOK 2 — DAMA International published reference (book + Wheel diagram). Question wording adapted by AI-CDIO from the published Knowledge Areas.",
  },
  {
    id: "m6_q2", module_number: 6, subcategory: "Data Foundations",
    question: "Is data quality actively measured — completeness, accuracy, freshness — for the data your business decisions depend on?",
    level_indicators: {
      level_1: "Data quality is a feeling; bad data surfaces in customer complaints and silent decision errors.",
      level_2: "Some quality checks; mostly downstream and reactive.",
      level_3: "Documented quality metrics for top data domains, reviewed monthly with named owners.",
      level_4: "Automated quality pipelines with SLAs; regressions trigger alerts and corrections.",
      level_5: "Data quality SLOs committed to internal consumers and met as a discipline.",
    },
    tags: { function: ["technical", "operational"], area: ["IT", "cross_functional"] },
    framework_citation: {
      framework: "DAMA-DMBOK 2",
      reference: "Data Quality knowledge area (one of the 11 DAMA-DMBOK 2 Knowledge Areas)",
      rationale: "DAMA-DMBOK 2 names Data Quality as a foundational knowledge area with explicit dimensions (completeness, accuracy, consistency, timeliness, validity, uniqueness); each dimension is a measurable signal.",
    },
    provenance: "DAMA-DMBOK 2 — DAMA International published reference. Question wording adapted by AI-CDIO from the Data Quality dimensions enumerated in the published framework.",
  },
  {
    id: "m6_q3", module_number: 6, subcategory: "AI Governance",
    question: "Is there a documented AI policy covering employee use of AI tools, vendor AI integration, data classification for AI prompts, and required reviews?",
    level_indicators: {
      level_1: "No AI policy; employees use consumer AI tools with confidential data; vendor AI exposure unknown.",
      level_2: "Informal guidance; not documented or enforced.",
      level_3: "Documented AI policy covering employee use, vendor AI integration, data classification, required reviews; communicated.",
      level_4: "Policy enforced with training, technical controls (DLP), and audit; violations addressed.",
      level_5: "AI governance is institutional; policy adapts as capabilities and threats evolve.",
    },
    tags: { function: ["strategic", "operational", "risk"], area: ["IT", "cross_functional"] },
    framework_citation: {
      framework: "NIST AI Risk Management Framework (NIST AI 100-1)",
      reference: "GOVERN function — published as one of four AI RMF functions (Govern, Map, Measure, Manage)",
      rationale: "NIST AI RMF's GOVERN function defines AI policy and accountability structure as the precondition for risk-managed AI use; the function is published as a named element of the official framework.",
    },
    provenance: "NIST AI Risk Management Framework v1.0 (NIST AI 100-1, January 2023) — public US federal publication, named GOVERN function. Question wording adapted by AI-CDIO from the published GOVERN function.",
  },
  {
    id: "m6_q4", module_number: 6, subcategory: "AI Production Use",
    question: "Is the company using AI in any production business processes with measured outcomes — not just experimenting?",
    level_indicators: {
      level_1: "No production AI use; conversations are aspirational.",
      level_2: "Pilots in flight; no production deployments yet.",
      level_3: "1-2 AI use cases in production with measured outcomes.",
      level_4: "AI embedded across multiple business processes; ROI tracked per use case.",
      level_5: "Multiple production use cases compounding into measurable competitive advantage.",
    },
    tags: { function: ["strategic", "technical"], area: ["IT", "cross_functional"] },
    framework_citation: {
      framework: "NIST AI Risk Management Framework (NIST AI 100-1)",
      reference: "MANAGE function — published as one of four AI RMF functions covering AI risks and benefits in deployment",
      rationale: "NIST AI RMF's MANAGE function defines the deployment-and-monitoring stage where AI moves from aspiration to production-tracked use; the function is a named, published framework element.",
    },
    provenance: "NIST AI Risk Management Framework v1.0 — public US federal publication. Question wording adapted by AI-CDIO from the MANAGE function.",
  },
  {
    id: "m6_q5", module_number: 6, subcategory: "AI Underwriting Discipline",
    question: "Are AI initiatives underwritten with the AMP Standardized Impact Formula (Volume × Time saved × Fully-loaded cost × Realizable %), validated post-deployment at 90/180 days?",
    level_indicators: {
      level_1: "AI initiatives evaluated on whether they shipped; no business-outcome measurement.",
      level_2: "Some outcome claims; numbers projected and unverified.",
      level_3: "Documented financial model per AI initiative using the formula; validated post-deployment at 90/180 days.",
      level_4: "Realization tracked institutionally; over-claims rare and detected.",
      level_5: "AI's contribution to enterprise outcomes is a known number defended to the board with capex-grade rigor.",
    },
    tags: { function: ["strategic", "financial"], area: ["IT", "finance"] },
    framework_citation: {
      framework: "AMP AI Diagnostic Playbook (PE-grade ex-Google consulting methodology)",
      reference: "Standardized Impact Formula: Volume × Minutes saved per unit × Fully-loaded cost/min × % realizable",
      rationale: "AMP's published formula is a verbatim construct from the playbook the user provided in this session, used to underwrite AI initiatives that survive 18-month retrospective scrutiny.",
    },
    provenance: "AMP AI Diagnostic Playbook — user-provided to AI-CDIO 2026-05-08 in this session. Formula is a verbatim construct from the playbook; question wording adapted by AI-CDIO to assessment format.",
  },

  // ============================================================
  // MODULE 7: Platforms, APIs & Digital Products
  // Cut from 12 questions to 2 signal questions on 2026-05-08.
  // Each retained question maps to a public security or API
  // standard with explicit named elements.
  // ============================================================
  {
    id: "m7_q1", module_number: 7, subcategory: "API Documentation",
    question: "Are your APIs documented in a machine-readable specification (OpenAPI / Swagger), versioned, and discoverable via a catalog or developer portal?",
    level_indicators: {
      level_1: "APIs exist; documentation scattered, outdated, or absent.",
      level_2: "Major APIs documented; coverage uneven; consumers find APIs by asking.",
      level_3: "OpenAPI specification for every public and major internal API; versioning policy in place.",
      level_4: "Developer portal with discovery, examples, and SDKs; consumer self-service.",
      level_5: "APIs are products with their own roadmap, SLA, and consumer relationships.",
    },
    tags: { function: ["technical"], area: ["IT"] },
    framework_citation: {
      framework: "OpenAPI Specification (Linux Foundation) + Postman API Maturity Model",
      reference: "OpenAPI 3.x — public specification (formerly Swagger); Postman API Maturity Model documentation tier",
      rationale: "OpenAPI is a published Linux Foundation specification used industry-wide; absence is a routine deficiency in any API-using organization.",
    },
    provenance: "OpenAPI Specification — public Linux Foundation standard, versioned (3.0, 3.1). Postman API Maturity Model — public Postman framework. Question wording adapted by AI-CDIO.",
  },
  {
    id: "m7_q2", module_number: 7, subcategory: "API Security",
    question: "Are your APIs assessed against the OWASP API Security Top 10 — broken object-level authorization, broken authentication, excessive data exposure, etc. — with documented findings and remediation?",
    level_indicators: {
      level_1: "API security is per-endpoint and undocumented; OWASP API Top 10 categories not assessed.",
      level_2: "Some security review; coverage is partial; OWASP categories not systematically checked.",
      level_3: "Documented OWASP API Top 10 assessment for production APIs; high-severity findings remediated.",
      level_4: "Continuous monitoring + automated checks for the published OWASP categories.",
      level_5: "API security is institutional; new APIs inherit baseline controls; vulnerability surface is managed against the OWASP list as a discipline.",
    },
    tags: { function: ["technical", "risk"], area: ["IT"] },
    framework_citation: {
      framework: "OWASP API Security Top 10 (2023)",
      reference: "Ten named categories: API1 Broken Object Level Authorization, API2 Broken Authentication, API3 Broken Object Property Level Authorization, API4 Unrestricted Resource Consumption, API5 Broken Function Level Authorization, API6 Unrestricted Access to Sensitive Business Flows, API7 Server Side Request Forgery, API8 Security Misconfiguration, API9 Improper Inventory Management, API10 Unsafe Consumption of APIs",
      rationale: "OWASP API Top 10 is the canonical published taxonomy of API vulnerability classes; the 2023 edition is freely available and is the lower bound for any API security review.",
    },
    provenance: "OWASP API Security Top 10 (2023) — public OWASP Foundation publication, ten named vulnerability classes verbatim. Question wording adapted by AI-CDIO from the published list.",
  },

  // ============================================================
  // MODULE 8: Analytics & BI
  // Cut from 12 questions to 2 signal questions on 2026-05-08.
  // Each retained question maps to a specific construct in DAMA-
  // DMBOK or the dbt published semantic-layer pattern.
  // ============================================================
  {
    id: "m8_q1", module_number: 8, subcategory: "Metric Trust",
    question: "Is there a single source of truth for the metrics that matter (revenue, active customer, churn, etc.) — defined in a semantic layer or governed catalog, not five different SQL queries?",
    level_indicators: {
      level_1: "Multiple definitions; every meeting starts by reconciling numbers.",
      level_2: "Awareness of inconsistency; not yet resolved.",
      level_3: "Documented metric definitions in a semantic layer / catalog; reviewed quarterly.",
      level_4: "Definitions enforced at query time; rogue definitions are detected and corrected.",
      level_5: "Metric trust is institutional; executives agree on numbers as a baseline, not as a debate.",
    },
    tags: { function: ["strategic", "operational"], area: ["finance", "cross_functional"] },
    framework_citation: {
      framework: "DAMA-DMBOK 2 Metadata Management + dbt Semantic Layer (published pattern)",
      reference: "DAMA-DMBOK 2 Metadata Management knowledge area; dbt Labs published Semantic Layer pattern",
      rationale: "DAMA-DMBOK 2 names Metadata Management as a foundational knowledge area; the dbt Semantic Layer is the most widely-adopted modern technical implementation of single-source-of-truth metric definitions.",
    },
    provenance: "DAMA-DMBOK 2 — DAMA International published reference; dbt Labs Semantic Layer — public dbt documentation. Question wording adapted by AI-CDIO.",
  },
  {
    id: "m8_q2", module_number: 8, subcategory: "Self-Service Access",
    question: "Do non-technical staff have direct access to the data they need through governed self-service BI tools — without filing a ticket and waiting for IT?",
    level_indicators: {
      level_1: "All data access goes through IT; turnaround in days or weeks.",
      level_2: "Some teams have direct access; others wait.",
      level_3: "Self-service BI tools available with guardrails; non-technical users build their own reports.",
      level_4: "Data literacy program in place; self-service is the norm.",
      level_5: "Data democratization is institutional; data is consumed across functions as a habit.",
    },
    tags: { function: ["operational"], area: ["IT", "cross_functional"] },
    framework_citation: {
      framework: "Gartner Magic Quadrant for Analytics & BI Platforms",
      reference: "Self-service capability — a published Gartner evaluation criterion across all major BI platforms (Power BI, Tableau, Looker, Qlik)",
      rationale: "Gartner's published Magic Quadrant evaluates BI platforms on self-service as a defined criterion; the criterion is widely adopted across the BI vendor market.",
    },
    provenance: "Gartner Magic Quadrant for Analytics & BI Platforms — Gartner's published annual evaluation. Question wording adapted by AI-CDIO from the self-service criterion.",
  },

  // ============================================================
  // MODULE 9: Customer / Patient Experience
  // Cut from 12 questions to 3 signal questions on 2026-05-08.
  // Each retained question maps to a published standard or
  // industry-canonical metric.
  // ============================================================
  {
    id: "m9_q1", module_number: 9, subcategory: "Voice of Customer",
    question: "Is customer feedback collected systematically through canonical metrics — NPS (Net Promoter Score), CSAT (Customer Satisfaction Score), or CES (Customer Effort Score) — at a documented cadence and acted upon?",
    level_indicators: {
      level_1: "Feedback is anecdotal; only the loudest customers are heard.",
      level_2: "Some surveys run; rarely acted upon.",
      level_3: "Documented VoC program with NPS / CSAT / CES at regular cadence; reviewed monthly with named owners.",
      level_4: "VoC drives product / process changes; closure rate measured.",
      level_5: "VoC is institutional muscle; the company adjusts at the speed of feedback.",
    },
    tags: { function: ["operational", "strategic"], area: ["sales", "operations"] },
    framework_citation: {
      framework: "NPS (Reichheld 2003 HBR) + CSAT + CES (CEB 2010 Effortless Experience)",
      reference: "Three canonical published CX metrics: Net Promoter Score (Reichheld 'One Number You Need to Grow', HBR 2003), Customer Satisfaction Score, Customer Effort Score (CEB / Gartner)",
      rationale: "NPS, CSAT, and CES are each canonical published metrics with explicit calculation methods; together they represent the standard VoC measurement set.",
    },
    provenance: "NPS — Reichheld HBR 2003, public peer-reviewed publication. CSAT — long-standing survey-research metric. CES — Dixon/Toman/DeLisi (CEB / Gartner) 2010 HBR + 'The Effortless Experience' book. Question wording adapted by AI-CDIO from the published metrics.",
  },
  {
    id: "m9_q2", module_number: 9, subcategory: "Digital Accessibility",
    question: "Is your digital experience tested and validated against the WCAG 2.2 Level AA standard — covering visual, motor, hearing, and cognitive accessibility — and is accessibility checked at CI before regressions ship?",
    level_indicators: {
      level_1: "Accessibility not considered; the digital experience excludes users with disabilities.",
      level_2: "Some accessibility awareness; not enforced.",
      level_3: "Documented WCAG 2.2 AA target; audited before major releases.",
      level_4: "Continuous accessibility validation; CI checks block regressions.",
      level_5: "Accessibility is a competitive advantage and legal-risk floor; the company is recognized for it.",
    },
    tags: { function: ["operational", "risk"], area: ["sales", "marketing", "IT"] },
    framework_citation: {
      framework: "W3C Web Content Accessibility Guidelines (WCAG) 2.2 + US Section 508 + ADA",
      reference: "WCAG 2.2 published 5 October 2023; Level AA is the standard most US/EU regulations reference (Section 508 in US federal context)",
      rationale: "WCAG 2.2 AA is the canonical published international accessibility standard with verbatim success criteria; legal frameworks (ADA, Section 508, EU EAA) reference it directly.",
    },
    provenance: "WCAG 2.2 — W3C published international standard, dated 5 October 2023. Question wording adapted by AI-CDIO from the published Level AA conformance criteria.",
  },
  {
    id: "m9_q3", module_number: 9, subcategory: "Complaint Management",
    question: "Are customer complaints triaged within an SLA, root-caused (not just closed), and themes fed back into product / process change — using the DMAIC discipline?",
    level_indicators: {
      level_1: "Complaints handled per ticket; no aggregation; no root cause.",
      level_2: "Some triage; root cause inconsistent.",
      level_3: "Documented complaint workflow with single owner, SLA, root-cause classification, and remediation.",
      level_4: "Complaint themes drive product / process changes; recurrence is measured.",
      level_5: "Complaints are early-warning signals; preventing them is funded as a discipline.",
    },
    tags: { function: ["operational", "risk"], area: ["sales", "operations"] },
    framework_citation: {
      framework: "Lean Six Sigma DMAIC + ISO 10002 Complaints Handling",
      reference: "DMAIC (Define-Measure-Analyze-Improve-Control) — canonical Six Sigma project framework; ISO 10002:2018 — international standard for complaints handling",
      rationale: "DMAIC is published Six Sigma canon; ISO 10002 is a published international standard for complaints handling with explicit lifecycle stages.",
    },
    provenance: "Lean Six Sigma DMAIC — published Six Sigma canon (Motorola origin, ASQ Body of Knowledge). ISO 10002:2018 — international standard. Question wording adapted by AI-CDIO.",
  },

  // ============================================================
  // MODULE 10: Executive Communication & Influence
  // Cut from 12 questions to 1 signal question on 2026-05-08.
  // Most M10 content is leadership advice that does not map to
  // a specific named element of a published framework. Only one
  // question has a defensible structural anchor.
  // ============================================================
  {
    id: "m10_q1", module_number: 10, subcategory: "Stakeholder Management",
    question: "Is there a documented stakeholder map with named engagement cadence per stakeholder type — proactively maintained, not assembled in crisis?",
    level_indicators: {
      level_1: "No stakeholder map; engagement is reactive only.",
      level_2: "Some proactive engagement; coverage uneven.",
      level_3: "Documented stakeholder map with engagement cadence per stakeholder type.",
      level_4: "Relationships are warm and trust-tested; tech leader has earned the benefit of the doubt.",
      level_5: "Stakeholder trust is a competitive asset; transformations move faster because relationships are pre-built.",
    },
    tags: { function: ["strategic", "operational"], area: ["IT", "cross_functional"] },
    framework_citation: {
      framework: "PMI PMBOK Stakeholder Management Knowledge Area + Mitchell-Agle-Wood Stakeholder Salience Model",
      reference: "PMBOK Stakeholder Management — Identify, Plan, Manage, Monitor processes; Mitchell-Agle-Wood (1997) salience attributes (power, legitimacy, urgency)",
      rationale: "PMBOK Stakeholder Management is a published Knowledge Area with named processes; Mitchell-Agle-Wood is a peer-reviewed academic framework cited for stakeholder mapping.",
    },
    provenance: "PMI PMBOK Guide — public PMI standard. Mitchell-Agle-Wood — Academy of Management Review 1997, peer-reviewed publication. Question wording adapted by AI-CDIO.",
  },

  // ============================================================
  // MODULE 11: IT Team Structure & Operations
  // Cut from 12 questions to 4 signal questions on 2026-05-08.
  // Each retained question maps to a specific named ITIL 4
  // practice or Google SRE published construct.
  // ============================================================
  {
    id: "m11_q1", module_number: 11, subcategory: "Service Levels",
    question: "Are explicit SLOs (Service Level Objectives) defined per critical service with SLIs (Service Level Indicators) measured and an error budget tracked — not 'high availability' as an aspirational adjective?",
    level_indicators: {
      level_1: "No SLOs; service quality is opinion.",
      level_2: "Informal expectations; not measured.",
      level_3: "Documented SLOs / SLIs per critical service; reviewed monthly.",
      level_4: "Error budgets in use; investment decisions tied to SLO gaps.",
      level_5: "Service-level discipline is a competitive asset; consumers can rely on the math.",
    },
    tags: { function: ["operational"], area: ["IT"] },
    framework_citation: {
      framework: "Google Site Reliability Engineering (Google SRE Book)",
      reference: "SLI / SLO / Error Budget — published Google SRE constructs (Chapters 4-5 of the SRE Book)",
      rationale: "Google's published SRE Book defines SLI (indicator), SLO (objective), and error budget as named constructs; the framework is freely published and widely adopted.",
    },
    provenance: "Google SRE Book — Beyer/Jones/Petoff/Murphy 2016, free online via Google. Question wording adapted by AI-CDIO from the published SLI/SLO/error-budget triad.",
  },
  {
    id: "m11_q2", module_number: 11, subcategory: "Incident Management",
    question: "Is incident management run as a documented ITIL 4 / SRE practice — declared incidents, named incident commander, communications template, blameless post-incident review?",
    level_indicators: {
      level_1: "Incidents handled chaotically; no commander; no post-mortem.",
      level_2: "Some incident discipline; coverage uneven.",
      level_3: "Documented incident process: declare, assemble, command, communicate, resolve, blameless post-mortem.",
      level_4: "Post-mortems learnings tracked; incident frequency falls year-over-year.",
      level_5: "Incident response is competitive; the company recovers faster than peers and learns more from each event.",
    },
    tags: { function: ["operational", "risk"], area: ["IT"] },
    framework_citation: {
      framework: "ITIL 4 Incident Management Practice + Google SRE Incident Response",
      reference: "ITIL 4 Incident Management — one of 34 named ITIL 4 management practices; Google SRE Book chapters on Emergency Response and Postmortem Culture",
      rationale: "ITIL 4 Incident Management is a named practice in the published ITIL 4 framework; Google SRE's Postmortem Culture chapter is published guidance widely adopted in modern operations.",
    },
    provenance: "ITIL 4 Foundation — public published framework (Axelos / PeopleCert). Google SRE Book — public Google publication. Question wording adapted by AI-CDIO from both sources.",
  },
  {
    id: "m11_q3", module_number: 11, subcategory: "Change Enablement",
    question: "Are changes managed under ITIL 4 Change Enablement — standard / normal / emergency change types with documented review, scheduling, and rollback paths?",
    level_indicators: {
      level_1: "Changes pushed without process; outages from changes are common.",
      level_2: "Some change discipline; many bypasses.",
      level_3: "Documented change process: standard / normal / emergency; reviewed and scheduled appropriately.",
      level_4: "High deploy frequency with low change-fail rate; rollback routine.",
      level_5: "Change management enables velocity (DORA elite tier); changes flow as routine.",
    },
    tags: { function: ["operational", "technical", "risk"], area: ["IT"] },
    framework_citation: {
      framework: "ITIL 4 Change Enablement Practice",
      reference: "ITIL 4 Change Enablement — one of 34 named management practices; defines standard, normal, and emergency change types",
      rationale: "ITIL 4 Change Enablement is a named practice in the published ITIL 4 framework with explicit change-type taxonomy and a published process model.",
    },
    provenance: "ITIL 4 Foundation — public published framework. Question wording adapted by AI-CDIO from the published Change Enablement practice.",
  },
  {
    id: "m11_q4", module_number: 11, subcategory: "Problem Management",
    question: "Is there an ITIL 4 Problem Management practice — recurring incidents trended, root causes investigated, preventive actions tracked — not just symptom patching?",
    level_indicators: {
      level_1: "Each incident treated in isolation; recurring issues persist.",
      level_2: "Some root-causing; inconsistent.",
      level_3: "Documented problem-management process: trend analysis, root cause, preventive action.",
      level_4: "Recurrence rate of known issues falls; problem backlog actively reduced.",
      level_5: "Institutional learning is a competitive moat; the company doesn't make the same mistake twice.",
    },
    tags: { function: ["operational"], area: ["IT"] },
    framework_citation: {
      framework: "ITIL 4 Problem Management Practice",
      reference: "ITIL 4 Problem Management — one of 34 named management practices; defines reactive and proactive problem management with the Known Error Database (KEDB) construct",
      rationale: "ITIL 4 Problem Management is a named practice in the published ITIL 4 framework; the KEDB and root-cause discipline are explicit published constructs.",
    },
    provenance: "ITIL 4 Foundation — public published framework. Question wording adapted by AI-CDIO from the published Problem Management practice.",
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
  // Cut from 12 questions to 4 signal questions on 2026-05-08.
  // Each retained question maps to a specific TBM Council
  // discipline or Gartner published evaluation criterion.
  // ============================================================
  {
    id: "m13_q1", module_number: 13, subcategory: "Vendor Inventory",
    question: "Do you maintain a complete vendor inventory with cost, owner, renewal date, and contract terms — including SaaS subscriptions and contractors — reviewed quarterly?",
    level_indicators: {
      level_1: "No vendor inventory; renewals surprise the company.",
      level_2: "Major vendors tracked; long tail invisible.",
      level_3: "Maintained inventory with cost, owner, renewal date, contract terms, business function; reviewed quarterly.",
      level_4: "Renewal calendar tracked 90 days ahead; auto-renewals captured before they fire.",
      level_5: "Vendor inventory is the operational backbone of vendor management; new vendors catalogued at signing.",
    },
    tags: { function: ["financial", "operational"], area: ["IT", "finance"] },
    framework_citation: {
      framework: "TBM Council Taxonomy + Gartner Vendor Management",
      reference: "TBM Council published taxonomy includes Vendor Management as a named cost-pool dimension; Gartner Vendor Management research treats inventory as foundation",
      rationale: "TBM Council's published taxonomy explicitly includes vendor / SaaS inventory as a cost-management discipline; without an inventory the whole spend-discipline stack is opinion-driven.",
    },
    provenance: "TBM Council taxonomy — public TBM framework. Gartner Vendor Management — Gartner published research. Question wording adapted by AI-CDIO.",
  },
  {
    id: "m13_q2", module_number: 13, subcategory: "License Optimization",
    question: "Are unused or underused SaaS licenses reclaimed and reassigned at least quarterly — with usage data driving renew / cancel / right-size decisions?",
    level_indicators: {
      level_1: "Licenses bought and forgotten; idle seats accumulate.",
      level_2: "Periodic ad hoc reclaim; coverage uneven.",
      level_3: "Quarterly license-utilization review; idle seats reclaimed before next true-up.",
      level_4: "Automated license management; harvest-and-reassign workflow continuous.",
      level_5: "License waste rate is below industry benchmark.",
    },
    tags: { function: ["financial", "operational"], area: ["IT", "finance"] },
    framework_citation: {
      framework: "TBM Council Taxonomy",
      reference: "License Optimization — published TBM cost-pool sub-discipline within Software / SaaS Vendor Management",
      rationale: "TBM Council's published taxonomy explicitly names License Optimization as a discipline; SaaS/license waste research consistently shows 20-30% reclaim opportunity.",
    },
    provenance: "TBM Council Taxonomy — public TBM framework. Question wording adapted by AI-CDIO from the published License Optimization discipline.",
  },
  {
    id: "m13_q3", module_number: 13, subcategory: "Spend Allocation",
    question: "Is technology spend allocated to Run / Grow / Transform categories and reviewed quarterly against an explicit target mix (e.g., 60/25/15) — not just spent against last year's distribution?",
    level_indicators: {
      level_1: "No Run/Grow/Transform allocation; spend is per-account historical.",
      level_2: "Informal estimate; not reported or reviewed.",
      level_3: "Tech spend formally allocated to Run / Grow / Transform quarterly; reviewed against target mix.",
      level_4: "Mix shifts are decisions, not accidents.",
      level_5: "Run/Grow/Transform is the lens for every funding conversation.",
    },
    tags: { function: ["strategic", "financial"], area: ["IT", "finance"] },
    framework_citation: {
      framework: "TBM Council Run/Grow/Transform Lens",
      reference: "Run/Grow/Transform — published TBM Council framework; one of the most-cited TBM constructs in board-level tech-finance reporting",
      rationale: "Run/Grow/Transform is published TBM Council canon and the most-cited boardroom metric in tech finance; without it, investment decisions stay tactical.",
    },
    provenance: "TBM Council Run/Grow/Transform — public TBM Council framework. Question wording adapted by AI-CDIO from the published RGT lens.",
  },
  {
    id: "m13_q4", module_number: 13, subcategory: "Benchmarking",
    question: "Do you benchmark IT spend (per employee, per revenue, per category) annually against industry peers using Gartner IT Key Metrics or equivalent published benchmarks?",
    level_indicators: {
      level_1: "No benchmarking; budget is whatever last year's was.",
      level_2: "Internal year-over-year comparison; external benchmarking absent.",
      level_3: "Annual benchmarking against industry peers using Gartner IT Key Metrics or equivalent.",
      level_4: "Quarterly benchmarking; outliers trigger investigation.",
      level_5: "Benchmarking is integrated into investment governance.",
    },
    tags: { function: ["strategic", "financial"], area: ["IT", "finance"] },
    framework_citation: {
      framework: "Gartner IT Key Metrics Data + TBM Council Benchmarking",
      reference: "Gartner IT Key Metrics — Gartner's published annual benchmarking dataset across IT categories and industries",
      rationale: "Gartner IT Key Metrics is a published annual benchmarking dataset; absence of external benchmarking is a routine audit finding in CFO-led IT-cost reviews.",
    },
    provenance: "Gartner IT Key Metrics Data — Gartner subscriber publication, widely cited. TBM Council Benchmarking — TBM published practice. Question wording adapted by AI-CDIO.",
  },

  // ============================================================
  // MODULE 14: Delivery, DevOps & Innovation
  // Cut from 12 questions to 5 signal questions on 2026-05-08.
  // The four DORA metrics (deployment frequency, lead time,
  // change-fail rate, MTTR) plus test automation. Each maps
  // verbatim to DORA's published research or to Humble/Farley's
  // Continuous Delivery canon.
  // ============================================================
  {
    id: "m14_q1", module_number: 14, subcategory: "DORA: Deployment Frequency",
    question: "What is your deployment frequency to production — DORA Elite (multiple per day), High (between once per day and once per week), Medium (between once per week and once per month), or Low (less than once per month)?",
    level_indicators: {
      level_1: "Deploy less than monthly; DORA Low; releases are events.",
      level_2: "Deploy weekly to monthly; DORA Low/Medium boundary.",
      level_3: "Deploy weekly to several times per week; DORA Medium.",
      level_4: "Deploy daily; DORA High.",
      level_5: "Deploy on demand multiple times per day; DORA Elite.",
    },
    tags: { function: ["technical", "operational"], area: ["IT"] },
    framework_citation: {
      framework: "DORA / Accelerate State of DevOps Report",
      reference: "Deployment Frequency — one of four published DORA performance metrics; performance tiers (Elite / High / Medium / Low) defined annually in the State of DevOps Report",
      rationale: "DORA's published research (Accelerate book + State of DevOps Reports) defines Deployment Frequency as one of four key delivery metrics with explicit performance tiers; the metric is verbatim DORA canon.",
    },
    provenance: "DORA / Accelerate (Forsgren / Humble / Kim 2018) + annual Google Cloud / DORA State of DevOps Reports — public peer-reviewed research and freely available reports. Question wording adapted by AI-CDIO from the published DORA metric; performance tier thresholds drawn directly from the State of DevOps Reports.",
  },
  {
    id: "m14_q2", module_number: 14, subcategory: "DORA: Lead Time for Changes",
    question: "What is your Lead Time for Changes — time from code commit to running in production — DORA Elite (less than one hour), High (less than one day), Medium (between one day and one week), Low (between one week and six months)?",
    level_indicators: {
      level_1: "Lead time > 6 months; DORA Low (deeply Low).",
      level_2: "Lead time 1-6 months; DORA Low.",
      level_3: "Lead time 1 day to 1 week; DORA Medium.",
      level_4: "Lead time hours to 1 day; DORA High.",
      level_5: "Lead time < 1 hour; DORA Elite.",
    },
    tags: { function: ["technical", "operational"], area: ["IT"] },
    framework_citation: {
      framework: "DORA / Accelerate State of DevOps Report",
      reference: "Lead Time for Changes — one of four published DORA performance metrics with explicit Elite/High/Medium/Low tier definitions",
      rationale: "Lead Time for Changes is verbatim DORA canon; it measures pipeline friction and is one of two delivery-velocity metrics in the published research.",
    },
    provenance: "DORA / Accelerate + State of DevOps Reports — public peer-reviewed research. Question wording and tier thresholds adapted by AI-CDIO from the published DORA metric definitions.",
  },
  {
    id: "m14_q3", module_number: 14, subcategory: "DORA: Change Failure Rate",
    question: "What is your Change Failure Rate — what percent of deploys cause a production incident requiring hotfix, rollback, or service degradation? DORA Elite/High (0-15%), Medium (16-30%), Low (>30%).",
    level_indicators: {
      level_1: "Change-fail rate > 60%; deploys are events; bypass is common.",
      level_2: "Change-fail rate 30-60%; deploys produce regular incidents.",
      level_3: "Change-fail rate 15-30%; DORA Medium.",
      level_4: "Change-fail rate 0-15%; DORA High / Elite.",
      level_5: "Change-fail rate consistently below 10%; deploys routine.",
    },
    tags: { function: ["technical", "operational", "risk"], area: ["IT"] },
    framework_citation: {
      framework: "DORA / Accelerate State of DevOps Report",
      reference: "Change Failure Rate — one of four published DORA performance metrics; Elite/High/Medium/Low tier thresholds in the published reports",
      rationale: "Change Failure Rate is verbatim DORA canon; it measures pipeline + testing quality and is one of two stability metrics in the published research.",
    },
    provenance: "DORA / Accelerate + State of DevOps Reports — public research. Question wording adapted by AI-CDIO from the published metric.",
  },
  {
    id: "m14_q4", module_number: 14, subcategory: "DORA: MTTR",
    question: "What is your Mean Time to Recovery (MTTR) — time to restore service when a production incident occurs? DORA Elite (less than one hour), High (less than one day), Medium (one day to one week), Low (more than six months).",
    level_indicators: {
      level_1: "MTTR > 1 week; DORA Low.",
      level_2: "MTTR 1 day to 1 week; DORA Low/Medium boundary.",
      level_3: "MTTR < 1 day; DORA Medium.",
      level_4: "MTTR < 1 hour; DORA High.",
      level_5: "MTTR < 30 minutes consistently; DORA Elite.",
    },
    tags: { function: ["technical", "operational"], area: ["IT"] },
    framework_citation: {
      framework: "DORA / Accelerate State of DevOps Report",
      reference: "MTTR (Mean Time to Recovery / Restore) — one of four published DORA performance metrics with tier thresholds",
      rationale: "MTTR is verbatim DORA canon; it measures recovery capability after incidents and is the second of two stability metrics in the published research.",
    },
    provenance: "DORA / Accelerate + State of DevOps Reports — public research. Question wording adapted by AI-CDIO from the published metric.",
  },
  {
    id: "m14_q5", module_number: 14, subcategory: "Test Automation",
    question: "Is your test suite automated and run on every commit (CI), structured per the test pyramid (mostly unit tests, fewer integration, focused end-to-end) — not manual QA before release?",
    level_indicators: {
      level_1: "Manual testing dominates; automated coverage minimal.",
      level_2: "Some automated tests; coverage gaps exposed regularly.",
      level_3: "Comprehensive automated test suite running on every commit; coverage measured.",
      level_4: "Test pyramid balanced; flaky tests rare and treated as defects.",
      level_5: "Tests are a respected engineering asset; refactoring is safe; new code without tests is unusual.",
    },
    tags: { function: ["technical", "operational"], area: ["IT"] },
    framework_citation: {
      framework: "Continuous Delivery (Humble & Farley 2010) + Mike Cohn Test Pyramid",
      reference: "Continuous Delivery published canon (test automation as precondition for CD); Test Pyramid model (Cohn / Fowler) with explicit unit/integration/E2E proportions",
      rationale: "Continuous Delivery (Humble & Farley) is published canon for the test-automation-as-precondition position; the Test Pyramid (Cohn 2009) is the canonical published model for test-suite shape.",
    },
    provenance: "Continuous Delivery — Humble & Farley 2010 (Addison-Wesley) — public published book. Test Pyramid — Mike Cohn 'Succeeding with Agile' 2009; popularized by Martin Fowler. Question wording adapted by AI-CDIO.",
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
  // Cut from 12 questions to 5 signal questions on 2026-05-08.
  // The five questions map verbatim to Prosci's published ADKAR
  // model letters (Awareness / Desire / Knowledge / Ability /
  // Reinforcement) — the canonical individual-change-management
  // framework.
  // ============================================================
  {
    id: "m16_q1", module_number: 16, subcategory: "ADKAR: Awareness",
    question: "When technology change launches, do affected employees understand WHY — the business reason, the customer outcome — communicated through executive sponsor + manager + peer channels before deployment?",
    level_indicators: {
      level_1: "Changes announced as faits accomplis; employees learn at deployment.",
      level_2: "Some communication; rationale thin.",
      level_3: "Documented communication plan per change: rationale, business outcome, what changes; layered communication (sponsor / manager / peer).",
      level_4: "Awareness measured before launch; gaps remediated.",
      level_5: "Awareness work is institutional; communicating change is a craft.",
    },
    tags: { function: ["operational", "strategic"], area: ["cross_functional"] },
    framework_citation: {
      framework: "Prosci ADKAR Model",
      reference: "A — Awareness — first letter of the published Prosci ADKAR five-stage individual-change-management model",
      rationale: "Awareness is the first published stage of Prosci's ADKAR; Prosci's longitudinal change-management research identifies it as the most-under-invested and most-predictive stage.",
    },
    provenance: "Prosci ADKAR Model — Hiatt 2006 'ADKAR: A Model for Change in Business, Government and our Community' — public published model. Question wording adapted by AI-CDIO from the published Awareness stage.",
  },
  {
    id: "m16_q2", module_number: 16, subcategory: "ADKAR: Desire",
    question: "Is the case for change framed with What's In It For Me (WIIFM) per stakeholder group — time saved, friction removed, capability gained — not only company-benefit framing?",
    level_indicators: {
      level_1: "Change benefits framed in company-only terms; 'what's in it for me?' goes unanswered.",
      level_2: "Some personal-benefit framing; thin and not credible.",
      level_3: "Documented WIIFM per stakeholder group; communicated alongside Awareness.",
      level_4: "Manager-led conversations connect change to personal context.",
      level_5: "Desire is built — employees pull change rather than being pushed; resistance is exception.",
    },
    tags: { function: ["operational"], area: ["cross_functional"] },
    framework_citation: {
      framework: "Prosci ADKAR Model",
      reference: "D — Desire — second stage of the published Prosci ADKAR model; Prosci research treats Desire as the stage where transformation programs most commonly fail",
      rationale: "Desire is the second published ADKAR stage; Prosci's published research identifies it as the most-difficult-to-engineer stage and the gating factor on every later stage.",
    },
    provenance: "Prosci ADKAR Model — Hiatt 2006 — public published model. Question wording adapted by AI-CDIO from the published Desire stage.",
  },
  {
    id: "m16_q3", module_number: 16, subcategory: "ADKAR: Knowledge",
    question: "Are employees structurally upskilled for the digital capabilities the company is investing in — documented learning paths per role, training budget, participation tracked?",
    level_indicators: {
      level_1: "No training program; employees expected to absorb new tools on their own.",
      level_2: "Basic tool training; underutilized.",
      level_3: "Documented digital-literacy program with learning paths per role; participation tracked.",
      level_4: "Continuous learning culture with personalized development; capability uplift measured.",
      level_5: "Skills development is a competitive moat; the company is recognized as a place where people grow.",
    },
    tags: { function: ["operational", "strategic"], area: ["cross_functional"] },
    framework_citation: {
      framework: "Prosci ADKAR Model",
      reference: "K — Knowledge — third stage of the published Prosci ADKAR model; covers training, skill-building, and information transfer",
      rationale: "Knowledge is the third published ADKAR stage; absent structured training, individuals cannot move from desiring change to doing the new behavior.",
    },
    provenance: "Prosci ADKAR Model — Hiatt 2006 — public published model. Question wording adapted by AI-CDIO from the published Knowledge stage.",
  },
  {
    id: "m16_q4", module_number: 16, subcategory: "ADKAR: Ability",
    question: "Are employees given protected time and practice opportunities to develop the new capability — so knowledge becomes ability — not just access to the tool?",
    level_indicators: {
      level_1: "No protected time; learning is supposed to happen on personal time or between fires.",
      level_2: "Some allowance; consumed by operational pressure.",
      level_3: "Documented learning time per role; practice opportunities embedded in the work.",
      level_4: "Capability development tracked at individual level; manager coaching reinforces growth.",
      level_5: "Capability acquisition is a respected discipline; growth is institutional.",
    },
    tags: { function: ["operational", "strategic"], area: ["cross_functional"] },
    framework_citation: {
      framework: "Prosci ADKAR Model",
      reference: "A — Ability — fourth stage of the published Prosci ADKAR model; the published distinction between Knowledge (knowing how) and Ability (being able to do)",
      rationale: "Ability is the fourth published ADKAR stage; Prosci's published distinction between Knowledge and Ability is what makes the framework operationally distinct from training-only approaches.",
    },
    provenance: "Prosci ADKAR Model — Hiatt 2006 — public published model. Question wording adapted by AI-CDIO from the published Ability stage.",
  },
  {
    id: "m16_q5", module_number: 16, subcategory: "ADKAR: Reinforcement",
    question: "Are new behaviors reinforced after launch with documented 30 / 60 / 90 / 180-day check-ins, manager coaching, recognition, and performance-review integration — measured for adoption persistence?",
    level_indicators: {
      level_1: "No reinforcement; old behaviors return within months.",
      level_2: "Some reinforcement reactive; coverage uneven.",
      level_3: "Documented reinforcement plan: 30/60/90/180-day check-ins, manager coaching, recognition, performance integration.",
      level_4: "Reinforcement is a tracked discipline; adoption persistence is measured.",
      level_5: "Reinforcement is cultural; new behaviors stick because the system supports them.",
    },
    tags: { function: ["operational", "strategic"], area: ["cross_functional"] },
    framework_citation: {
      framework: "Prosci ADKAR Model",
      reference: "R — Reinforcement — fifth and final stage of the published Prosci ADKAR model; the stage where most change programs fail without explicit attention",
      rationale: "Reinforcement is the fifth published ADKAR stage; Prosci's published research identifies it as the most-under-invested stage and the most common point of program failure.",
    },
    provenance: "Prosci ADKAR Model — Hiatt 2006 — public published model. Question wording adapted by AI-CDIO from the published Reinforcement stage.",
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
