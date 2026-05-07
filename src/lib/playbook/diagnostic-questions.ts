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
