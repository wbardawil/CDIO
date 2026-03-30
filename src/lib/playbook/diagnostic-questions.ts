// ============================================================
// AI-CDIO — Diagnostic Questions
// Structured from the Playbook Assessment Framework
// Each module has 2-3 subcategories with 3-4 questions each
// ============================================================

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
  };
}

export const DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  // MODULE 1: Role of the CIDO
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

  // MODULE 2: IT/Digital Transformation Strategy
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

  // MODULE 3: Enterprise Architecture & IT Modernization
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

  // MODULE 4: Cloud Computing & Infrastructure Strategy
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

  // MODULE 5: Cybersecurity, Risk Management & Compliance
  {
    id: "m5_q1", module_number: 5, subcategory: "Security Posture",
    question: "Is there a documented cybersecurity policy?",
    level_indicators: { level_1: "No policy", level_2: "Basic policy exists", level_3: "Comprehensive policy aligned to framework (NIST/ISO)", level_4: "Mature program with continuous assessment" },
  },
  {
    id: "m5_q2", module_number: 5, subcategory: "Security Posture",
    question: "Is multi-factor authentication (MFA) implemented across all systems?",
    level_indicators: { level_1: "No MFA", level_2: "MFA on some critical systems", level_3: "MFA on all external access", level_4: "Zero-trust architecture with adaptive authentication" },
  },
  {
    id: "m5_q3", module_number: 5, subcategory: "Security Posture",
    question: "Are regular vulnerability assessments conducted?",
    level_indicators: { level_1: "No assessments", level_2: "Annual scan", level_3: "Quarterly assessments with remediation tracking", level_4: "Continuous scanning with automated remediation" },
  },
  {
    id: "m5_q4", module_number: 5, subcategory: "Risk & Compliance",
    question: "Is there a risk management framework in place?",
    level_indicators: { level_1: "No framework", level_2: "Informal risk awareness", level_3: "Documented risk register with mitigation plans", level_4: "Enterprise risk management integrated with business decisions" },
  },
  {
    id: "m5_q5", module_number: 5, subcategory: "Risk & Compliance",
    question: "Are compliance requirements identified and tracked?",
    level_indicators: { level_1: "No compliance tracking", level_2: "Aware of requirements", level_3: "Compliance program with regular audits", level_4: "Automated compliance monitoring and reporting" },
  },
  {
    id: "m5_q6", module_number: 5, subcategory: "Risk & Compliance",
    question: "Is there an incident response plan?",
    level_indicators: { level_1: "No plan", level_2: "Documented but untested", level_3: "Tested plan with assigned roles", level_4: "Practiced response with tabletop exercises and post-incident reviews" },
  },

  // MODULE 6: Data & AI Engineering
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

  // MODULE 7: Digital Ecosystems: Platforms & Products
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

  // MODULE 8: Data Analytics, BI & Decision Science
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

  // MODULE 9: Human Centered Design & Customer Journey
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

  // MODULE 10: Leadership, Business Strategy & Communications
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

  // MODULE 11: CIDO Organization Structure & Operations
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

  // MODULE 12: Financial Acumen
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

  // MODULE 13: Portfolio & Vendor Management
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

  // MODULE 14: Agile, DevOps & Innovation Management
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

  // MODULE 15: Business Process Transformation & Automation
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

  // MODULE 16: Future of Work & Workforce Development
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
