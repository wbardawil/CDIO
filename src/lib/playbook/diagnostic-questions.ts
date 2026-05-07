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
}

export const DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  // ============================================================
  // MODULE 1: Role of the CIDO
  // ============================================================
  {
    id: "m1_q1", module_number: 1, subcategory: "Leadership & Governance",
    question: "Is there a clearly defined technology leadership role at the executive level?",
    level_indicators: { level_1: "No formal role", level_2: "IT manager with limited scope", level_3: "Defined CIO/CTO role with executive access", level_4: "Strategic CIDO as core executive team member" },
  },
  {
    id: "m1_q2", module_number: 1, subcategory: "Leadership & Governance",
    question: "Does the technology leader report directly to CEO or Board?",
    level_indicators: { level_1: "Reports to operations/finance", level_2: "Reports to COO", level_3: "Reports to CEO", level_4: "Board-level reporting with strategic influence" },
  },
  {
    id: "m1_q3", module_number: 1, subcategory: "Leadership & Governance",
    question: "Are technology initiatives aligned with business strategy?",
    level_indicators: { level_1: "Ad hoc, no alignment", level_2: "Some awareness but reactive", level_3: "Formal alignment process exists", level_4: "Technology drives business strategy" },
  },
  {
    id: "m1_q4", module_number: 1, subcategory: "Leadership & Governance",
    question: "Is there a formal IT governance structure?",
    level_indicators: { level_1: "No governance", level_2: "Informal decision-making", level_3: "Defined governance with regular reviews", level_4: "Mature governance with KPIs and continuous improvement" },
  },
  {
    id: "m1_q5", module_number: 1, subcategory: "Strategic Influence",
    question: "Does technology leadership participate in strategic business planning?",
    level_indicators: { level_1: "Not involved", level_2: "Consulted occasionally", level_3: "Regular participant in planning", level_4: "Co-drives business planning" },
  },
  {
    id: "m1_q6", module_number: 1, subcategory: "Strategic Influence",
    question: "Is IT viewed as a strategic enabler vs. cost center?",
    level_indicators: { level_1: "Viewed purely as cost", level_2: "Some see strategic value", level_3: "Broadly recognized as enabler", level_4: "Core competitive advantage" },
  },
  {
    id: "m1_q7", module_number: 1, subcategory: "Strategic Influence",
    question: "Are there regular executive briefings on technology initiatives?",
    level_indicators: { level_1: "None", level_2: "Ad hoc updates", level_3: "Monthly structured briefings", level_4: "Real-time dashboards with regular strategic reviews" },
  },
  {
    id: "m1_q8", module_number: 1, subcategory: "Strategic Influence",
    question: "Does technology leadership influence product/service strategy?",
    level_indicators: { level_1: "No influence", level_2: "Consulted on feasibility only", level_3: "Active contributor to product decisions", level_4: "Drives product innovation through technology" },
  },

  // ============================================================
  // MODULE 2: IT/Digital Transformation Strategy
  // ============================================================
  {
    id: "m2_q1", module_number: 2, subcategory: "Strategy Development",
    question: "Is there a documented digital transformation strategy?",
    level_indicators: { level_1: "No strategy exists", level_2: "Informal or outdated strategy", level_3: "Documented and communicated strategy", level_4: "Living strategy with continuous refinement" },
  },
  {
    id: "m2_q2", module_number: 2, subcategory: "Strategy Development",
    question: "Does the strategy align with business objectives?",
    level_indicators: { level_1: "No alignment", level_2: "Loosely connected", level_3: "Clear mapping to business goals", level_4: "Strategy and business goals co-created" },
  },
  {
    id: "m2_q3", module_number: 2, subcategory: "Strategy Development",
    question: "Are transformation goals measurable and time-bound?",
    level_indicators: { level_1: "Vague aspirations", level_2: "Some metrics defined", level_3: "SMART goals with tracking", level_4: "Real-time KPI dashboards with predictive indicators" },
  },
  {
    id: "m2_q4", module_number: 2, subcategory: "Strategy Development",
    question: "Is there executive sponsorship for transformation initiatives?",
    level_indicators: { level_1: "No sponsorship", level_2: "Passive support", level_3: "Active champion at C-level", level_4: "CEO/Board-driven transformation mandate" },
  },
  {
    id: "m2_q5", module_number: 2, subcategory: "Strategy Execution",
    question: "Is there a roadmap for digital transformation implementation?",
    level_indicators: { level_1: "No roadmap", level_2: "High-level timeline only", level_3: "Detailed roadmap with milestones", level_4: "Adaptive roadmap with regular review cycles" },
  },
  {
    id: "m2_q6", module_number: 2, subcategory: "Strategy Execution",
    question: "Are resources allocated to support transformation goals?",
    level_indicators: { level_1: "No dedicated resources", level_2: "Part-time shared resources", level_3: "Dedicated budget and team", level_4: "Optimized resource allocation with ROI tracking" },
  },
  {
    id: "m2_q7", module_number: 2, subcategory: "Strategy Execution",
    question: "Are transformation initiatives tracked and measured?",
    level_indicators: { level_1: "No tracking", level_2: "Occasional status updates", level_3: "Regular progress reviews with metrics", level_4: "Automated tracking with predictive analytics" },
  },
  {
    id: "m2_q8", module_number: 2, subcategory: "Strategy Execution",
    question: "Is the strategy communicated across the organization?",
    level_indicators: { level_1: "Unknown outside IT", level_2: "Leadership aware only", level_3: "Organization-wide communication", level_4: "Embedded in culture with employee advocacy" },
  },

  // ============================================================
  // MODULE 3: Enterprise Architecture & IT Modernization
  // ============================================================
  {
    id: "m3_q1", module_number: 3, subcategory: "Architecture Planning",
    question: "Is there a documented enterprise architecture framework?",
    level_indicators: { level_1: "No documentation", level_2: "Partial documentation", level_3: "Comprehensive EA framework", level_4: "Living architecture with automated discovery" },
  },
  {
    id: "m3_q2", module_number: 3, subcategory: "Architecture Planning",
    question: "Are current and future state architectures defined?",
    level_indicators: { level_1: "Neither defined", level_2: "Current state partially documented", level_3: "Both states defined with gap analysis", level_4: "Evolutionary architecture with continuous alignment" },
  },
  {
    id: "m3_q3", module_number: 3, subcategory: "Architecture Planning",
    question: "Is there a technology standards governance process?",
    level_indicators: { level_1: "No standards", level_2: "Informal preferences", level_3: "Documented standards with review process", level_4: "Standards embedded in CI/CD with automated enforcement" },
  },
  {
    id: "m3_q4", module_number: 3, subcategory: "Modernization Approach",
    question: "Is there a plan to address technical debt?",
    level_indicators: { level_1: "Technical debt not tracked", level_2: "Awareness but no plan", level_3: "Prioritized remediation plan", level_4: "Systematic reduction with prevention measures" },
  },
  {
    id: "m3_q5", module_number: 3, subcategory: "Modernization Approach",
    question: "Are legacy systems being systematically modernized?",
    level_indicators: { level_1: "No modernization effort", level_2: "Ad hoc replacements", level_3: "Planned migration roadmap", level_4: "Continuous modernization with cloud-native targets" },
  },

  // ============================================================
  // MODULE 4: Cloud Computing & Infrastructure Strategy
  // ============================================================
  {
    id: "m4_q1", module_number: 4, subcategory: "Cloud Strategy",
    question: "Is there a documented cloud strategy?",
    level_indicators: { level_1: "No cloud strategy", level_2: "Ad hoc cloud adoption", level_3: "Documented cloud-first policy", level_4: "Cloud-native strategy with multi-cloud optimization" },
  },
  {
    id: "m4_q2", module_number: 4, subcategory: "Cloud Strategy",
    question: "Have workloads been assessed for cloud readiness?",
    level_indicators: { level_1: "No assessment done", level_2: "Some workloads evaluated", level_3: "Comprehensive assessment complete", level_4: "Continuous workload optimization and right-sizing" },
  },
  {
    id: "m4_q3", module_number: 4, subcategory: "Cloud Strategy",
    question: "Is cloud spending tracked and optimized?",
    level_indicators: { level_1: "No visibility into cloud costs", level_2: "Basic billing review", level_3: "FinOps practices with regular optimization", level_4: "Automated cost optimization with predictive budgeting" },
  },
  {
    id: "m4_q4", module_number: 4, subcategory: "Infrastructure",
    question: "Is infrastructure provisioning automated?",
    level_indicators: { level_1: "Manual provisioning", level_2: "Some scripted automation", level_3: "Infrastructure as Code (IaC)", level_4: "Self-service platform with policy guardrails" },
  },
  {
    id: "m4_q5", module_number: 4, subcategory: "Infrastructure",
    question: "Is there a disaster recovery plan tested regularly?",
    level_indicators: { level_1: "No DR plan", level_2: "Documented but untested", level_3: "Annual testing with documented procedures", level_4: "Automated failover with regular chaos engineering" },
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
  // MODULE 6: Data & AI Engineering
  // ============================================================
  {
    id: "m6_q1", module_number: 6, subcategory: "Data Architecture",
    question: "Is there a documented data architecture or data strategy?",
    level_indicators: { level_1: "No data strategy", level_2: "Ad hoc data management", level_3: "Documented data architecture with governance", level_4: "Data mesh/fabric with self-service access" },
  },
  {
    id: "m6_q2", module_number: 6, subcategory: "Data Architecture",
    question: "Is data quality actively measured and managed?",
    level_indicators: { level_1: "No quality management", level_2: "Known quality issues", level_3: "Data quality metrics with improvement plans", level_4: "Automated data quality pipelines with SLAs" },
  },
  {
    id: "m6_q3", module_number: 6, subcategory: "AI/ML Capability",
    question: "Is the organization using AI/ML in any business processes?",
    level_indicators: { level_1: "No AI/ML usage", level_2: "Exploring/pilot stage", level_3: "AI in production for 1-2 use cases", level_4: "AI embedded across operations with MLOps" },
  },
  {
    id: "m6_q4", module_number: 6, subcategory: "AI/ML Capability",
    question: "Is there a data governance framework?",
    level_indicators: { level_1: "No governance", level_2: "Informal data ownership", level_3: "Formal governance with stewards and policies", level_4: "Automated governance with lineage tracking" },
  },

  // ============================================================
  // MODULE 7: Digital Ecosystems: Platforms & Products
  // ============================================================
  {
    id: "m7_q1", module_number: 7, subcategory: "Platform Strategy",
    question: "Does the organization think in terms of platforms and ecosystems?",
    level_indicators: { level_1: "Siloed applications", level_2: "Some integration awareness", level_3: "Platform strategy with API architecture", level_4: "Ecosystem orchestrator with partner network" },
  },
  {
    id: "m7_q2", module_number: 7, subcategory: "Platform Strategy",
    question: "Are APIs used to connect systems and enable integration?",
    level_indicators: { level_1: "No APIs", level_2: "Point-to-point integrations", level_3: "API-first approach with documentation", level_4: "API marketplace with developer portal" },
  },
  {
    id: "m7_q3", module_number: 7, subcategory: "Digital Products",
    question: "Are digital products/services part of the business model?",
    level_indicators: { level_1: "No digital products", level_2: "Basic digital presence", level_3: "Digital products generating revenue", level_4: "Digital-first business model" },
  },

  // ============================================================
  // MODULE 8: Data Analytics, BI & Decision Science
  // ============================================================
  {
    id: "m8_q1", module_number: 8, subcategory: "Analytics Capability",
    question: "Are business decisions supported by data analytics?",
    level_indicators: { level_1: "Gut-feel decisions", level_2: "Basic reporting (spreadsheets)", level_3: "BI platform with dashboards", level_4: "Predictive analytics driving decisions" },
  },
  {
    id: "m8_q2", module_number: 8, subcategory: "Analytics Capability",
    question: "Is there a self-service analytics capability for business users?",
    level_indicators: { level_1: "All reports from IT", level_2: "Some shared reports", level_3: "Self-service BI tools available", level_4: "Data democratization with literacy programs" },
  },
  {
    id: "m8_q3", module_number: 8, subcategory: "Analytics Capability",
    question: "Are KPIs defined and tracked across the organization?",
    level_indicators: { level_1: "No formal KPIs", level_2: "Some departmental metrics", level_3: "Organization-wide KPI framework", level_4: "Real-time KPI dashboards with predictive alerts" },
  },

  // ============================================================
  // MODULE 9: Human Centered Design & Customer Journey
  // ============================================================
  {
    id: "m9_q1", module_number: 9, subcategory: "Design Thinking",
    question: "Is user research conducted before building solutions?",
    level_indicators: { level_1: "No user research", level_2: "Occasional feedback collection", level_3: "Structured user research program", level_4: "Continuous discovery with design sprints" },
  },
  {
    id: "m9_q2", module_number: 9, subcategory: "Design Thinking",
    question: "Is the customer journey mapped and optimized?",
    level_indicators: { level_1: "No journey mapping", level_2: "Informal understanding", level_3: "Documented journey maps with improvement plans", level_4: "Real-time journey analytics with personalization" },
  },
  {
    id: "m9_q3", module_number: 9, subcategory: "Customer Experience",
    question: "Is customer satisfaction measured systematically?",
    level_indicators: { level_1: "No measurement", level_2: "Occasional surveys", level_3: "NPS/CSAT tracking with action plans", level_4: "Omnichannel CX measurement with AI-driven insights" },
  },

  // ============================================================
  // MODULE 10: Leadership, Business Strategy & Communications
  // ============================================================
  {
    id: "m10_q1", module_number: 10, subcategory: "Executive Leadership",
    question: "Does the leadership team have a shared vision for technology's role?",
    level_indicators: { level_1: "No shared vision", level_2: "Fragmented views", level_3: "Aligned vision with some gaps", level_4: "Unified vision driving organizational culture" },
  },
  {
    id: "m10_q2", module_number: 10, subcategory: "Executive Leadership",
    question: "Is there effective stakeholder management for technology initiatives?",
    level_indicators: { level_1: "No stakeholder management", level_2: "Reactive communication", level_3: "Proactive stakeholder engagement plan", level_4: "Embedded change management with champions" },
  },
  {
    id: "m10_q3", module_number: 10, subcategory: "Communications",
    question: "Are technology successes and value communicated to the organization?",
    level_indicators: { level_1: "No communication", level_2: "Occasional updates", level_3: "Regular value communication program", level_4: "Technology brand within the organization" },
  },

  // ============================================================
  // MODULE 11: CIDO Organization Structure & Operations
  // ============================================================
  {
    id: "m11_q1", module_number: 11, subcategory: "Organization Design",
    question: "Is the IT/Digital team structure clearly defined?",
    level_indicators: { level_1: "No formal structure", level_2: "Basic org chart", level_3: "Defined roles, responsibilities, and career paths", level_4: "Adaptive team structure aligned to business capabilities" },
  },
  {
    id: "m11_q2", module_number: 11, subcategory: "Organization Design",
    question: "Are IT service levels defined and measured?",
    level_indicators: { level_1: "No SLAs", level_2: "Informal expectations", level_3: "Documented SLAs with monitoring", level_4: "SLOs/SLIs with error budgets and continuous improvement" },
  },
  {
    id: "m11_q3", module_number: 11, subcategory: "Operations",
    question: "Is there a service desk or helpdesk function?",
    level_indicators: { level_1: "No formal support", level_2: "Ad hoc support", level_3: "Ticketed helpdesk with SLAs", level_4: "Self-service portal with AI-assisted resolution" },
  },

  // ============================================================
  // MODULE 12: Financial Acumen
  // ============================================================
  {
    id: "m12_q1", module_number: 12, subcategory: "IT Budgeting",
    question: "Is there a defined IT budget aligned with business priorities?",
    level_indicators: { level_1: "No defined IT budget", level_2: "Basic budget allocation", level_3: "Strategic IT budget with business case requirements", level_4: "Value-based budgeting with ROI tracking" },
  },
  {
    id: "m12_q2", module_number: 12, subcategory: "IT Budgeting",
    question: "Is IT spending tracked and reported regularly?",
    level_indicators: { level_1: "No tracking", level_2: "Annual budget review", level_3: "Monthly reporting with variance analysis", level_4: "Real-time financial dashboards with forecasting" },
  },
  {
    id: "m12_q3", module_number: 12, subcategory: "ROI & Value",
    question: "Are ROI calculations performed for technology investments?",
    level_indicators: { level_1: "No ROI analysis", level_2: "Occasional cost-benefit", level_3: "Standardized ROI framework for all projects", level_4: "Value realization tracking with post-implementation reviews" },
  },

  // ============================================================
  // MODULE 13: Portfolio & Vendor Management
  // ============================================================
  {
    id: "m13_q1", module_number: 13, subcategory: "Portfolio Management",
    question: "Is there a formal IT project portfolio management process?",
    level_indicators: { level_1: "No portfolio view", level_2: "Project list exists", level_3: "Prioritized portfolio with governance", level_4: "Dynamic portfolio optimization with real-time health metrics" },
  },
  {
    id: "m13_q2", module_number: 13, subcategory: "Vendor Management",
    question: "Are vendor relationships actively managed?",
    level_indicators: { level_1: "Ad hoc vendor dealings", level_2: "Contract tracking", level_3: "Vendor scorecards with regular reviews", level_4: "Strategic vendor partnerships with innovation collaboration" },
  },
  {
    id: "m13_q3", module_number: 13, subcategory: "Vendor Management",
    question: "Is there a software/SaaS inventory?",
    level_indicators: { level_1: "No inventory", level_2: "Partial tracking", level_3: "Complete inventory with license management", level_4: "Automated SaaS management with usage optimization" },
  },

  // ============================================================
  // MODULE 14: Agile, DevOps & Innovation Management
  // ============================================================
  {
    id: "m14_q1", module_number: 14, subcategory: "Agile Practices",
    question: "Are agile methodologies used for project delivery?",
    level_indicators: { level_1: "Waterfall only", level_2: "Agile experimentation", level_3: "Established agile practices with trained teams", level_4: "Scaled agile with business agility" },
  },
  {
    id: "m14_q2", module_number: 14, subcategory: "DevOps",
    question: "Is there a CI/CD pipeline for software delivery?",
    level_indicators: { level_1: "Manual deployments", level_2: "Some automation", level_3: "CI/CD with automated testing", level_4: "Full DevSecOps with continuous deployment" },
  },
  {
    id: "m14_q3", module_number: 14, subcategory: "Innovation",
    question: "Is there a process for evaluating and adopting new technologies?",
    level_indicators: { level_1: "No process", level_2: "Ad hoc evaluation", level_3: "Technology radar with evaluation framework", level_4: "Innovation lab with structured experimentation" },
  },

  // ============================================================
  // MODULE 15: Business Process Transformation & Automation
  // ============================================================
  {
    id: "m15_q1", module_number: 15, subcategory: "Process Management",
    question: "Are key business processes documented?",
    level_indicators: { level_1: "No documentation", level_2: "Some processes documented", level_3: "Core processes mapped with owners", level_4: "Process mining with continuous optimization" },
  },
  {
    id: "m15_q2", module_number: 15, subcategory: "Automation",
    question: "Are repetitive tasks being automated?",
    level_indicators: { level_1: "All manual", level_2: "Basic macros/scripts", level_3: "RPA or workflow automation in place", level_4: "Intelligent automation with AI-assisted processes" },
  },
  {
    id: "m15_q3", module_number: 15, subcategory: "Automation",
    question: "Is there a pipeline of automation opportunities identified?",
    level_indicators: { level_1: "No pipeline", level_2: "Ad hoc opportunities", level_3: "Prioritized automation roadmap", level_4: "Citizen automation with CoE governance" },
  },

  // ============================================================
  // MODULE 16: Future of Work & Workforce Development
  // ============================================================
  {
    id: "m16_q1", module_number: 16, subcategory: "Change Management",
    question: "Is there a change management approach for technology initiatives?",
    level_indicators: { level_1: "No change management", level_2: "Ad hoc communication", level_3: "Structured change management framework", level_4: "Embedded change capability with trained champions" },
  },
  {
    id: "m16_q2", module_number: 16, subcategory: "Workforce Development",
    question: "Are employees being upskilled for digital capabilities?",
    level_indicators: { level_1: "No training program", level_2: "Basic technical training", level_3: "Digital literacy program with learning paths", level_4: "Continuous learning culture with personalized development" },
  },
  {
    id: "m16_q3", module_number: 16, subcategory: "Workforce Development",
    question: "Is remote/hybrid work supported with appropriate technology?",
    level_indicators: { level_1: "No remote capability", level_2: "Basic remote access", level_3: "Full collaboration platform", level_4: "Digital workplace with async-first culture" },
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
