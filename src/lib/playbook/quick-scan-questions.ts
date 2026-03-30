// ============================================================
// AI-CDIO — Quick Scan Questions (3 per module)
// High-signal diagnostic questions for rapid assessment
// Full assessment (8 per module) available in diagnostic-questions.ts
// ============================================================

export interface QuickScanQuestion {
  id: string;
  module: number;
  question: string;
  why: string; // brief explanation of why this matters
}

export const QUICK_SCAN_QUESTIONS: QuickScanQuestion[] = [
  // Module 1: Role of the CIDO
  { id: "qs1_1", module: 1, question: "Does your organization have someone responsible for technology strategy (CIO, CTO, IT Director)?", why: "Without clear technology leadership, decisions are reactive and uncoordinated." },
  { id: "qs1_2", module: 1, question: "Does technology leadership participate in business strategy discussions?", why: "Technology that isn't aligned with business goals wastes money." },
  { id: "qs1_3", module: 1, question: "Is IT viewed as a strategic asset rather than a cost center?", why: "How leadership views IT determines how much value technology delivers." },

  // Module 2: IT/Digital Transformation Strategy
  { id: "qs2_1", module: 2, question: "Do you have a written technology strategy or roadmap?", why: "Without a plan, technology investments are ad hoc and often redundant." },
  { id: "qs2_2", module: 2, question: "Are your technology goals measurable and tracked?", why: "If you can't measure it, you can't improve it." },
  { id: "qs2_3", module: 2, question: "Is there dedicated budget for technology improvements (not just keeping the lights on)?", why: "Growth requires investment. Maintenance-only budgets lead to stagnation." },

  // Module 3: Enterprise Architecture & Modernization
  { id: "qs3_1", module: 3, question: "Do you have a clear picture of all the systems and software your organization uses?", why: "You can't optimize what you don't know you have." },
  { id: "qs3_2", module: 3, question: "Are your key business systems less than 5 years old?", why: "Legacy systems accumulate technical debt and security vulnerabilities." },
  { id: "qs3_3", module: 3, question: "Can your different systems share data with each other easily?", why: "Data silos cause duplicate work, errors, and slow decision-making." },

  // Module 4: Cloud & Infrastructure
  { id: "qs4_1", module: 4, question: "Are your key business applications running in the cloud?", why: "Cloud enables flexibility, scalability, and disaster recovery." },
  { id: "qs4_2", module: 4, question: "Do you know what you spend on cloud/hosting each month?", why: "Unmonitored cloud costs are one of the biggest sources of IT waste." },
  { id: "qs4_3", module: 4, question: "Could your team work for a week if your office was inaccessible?", why: "Business continuity depends on infrastructure resilience." },

  // Module 5: Cybersecurity & Risk
  { id: "qs5_1", module: 5, question: "Do all employees use multi-factor authentication (MFA) for email and key systems?", why: "MFA blocks 99% of automated attacks. It's the single highest-impact security measure." },
  { id: "qs5_2", module: 5, question: "When was your last security assessment or vulnerability scan?", why: "Unknown vulnerabilities are the #1 way hackers get in." },
  { id: "qs5_3", module: 5, question: "Do you have a tested backup and recovery plan?", why: "Ransomware can destroy your business in hours without reliable backups." },

  // Module 6: Data & AI
  { id: "qs6_1", module: 6, question: "Is your important business data organized and easily accessible?", why: "Messy data prevents good decisions and blocks AI adoption." },
  { id: "qs6_2", module: 6, question: "Are you using AI tools in any part of your business today?", why: "AI adoption is accelerating. Early adopters gain competitive advantage." },
  { id: "qs6_3", module: 6, question: "Do you know where your most sensitive data is stored and who has access?", why: "Data governance prevents breaches, fines, and reputational damage." },

  // Module 7: Digital Ecosystems & Platforms
  { id: "qs7_1", module: 7, question: "Can your customers interact with your business digitally (online ordering, portals, apps)?", why: "Digital channels are now expected, not optional." },
  { id: "qs7_2", module: 7, question: "Do your business systems connect to partners or suppliers electronically?", why: "Manual handoffs between companies waste time and cause errors." },
  { id: "qs7_3", module: 7, question: "Do you have APIs or integrations connecting your key tools?", why: "Disconnected tools mean manual data re-entry and missed opportunities." },

  // Module 8: Analytics & BI
  { id: "qs8_1", module: 8, question: "Can you pull up key business metrics (revenue, costs, performance) in real-time?", why: "Decisions based on last month's data are decisions based on stale information." },
  { id: "qs8_2", module: 8, question: "Do your managers use dashboards or reports to make decisions?", why: "Gut-feel decisions scale poorly. Data-driven organizations outperform by 5-6%." },
  { id: "qs8_3", module: 8, question: "Can non-technical staff access the data they need without asking IT?", why: "Self-service analytics multiplies the value of your data investment." },

  // Module 9: Human-Centered Design & CX
  { id: "qs9_1", module: 9, question: "Do you regularly collect and act on customer feedback?", why: "The companies that listen to customers outperform those that don't." },
  { id: "qs9_2", module: 9, question: "Is your website/app designed based on actual user research?", why: "Assumptions about what users want are wrong more often than right." },
  { id: "qs9_3", module: 9, question: "Can customers complete their most common tasks without calling you?", why: "Every phone call is a failure of your digital experience." },

  // Module 10: Leadership & Communications
  { id: "qs10_1", module: 10, question: "Does your leadership team have a shared vision for technology's role in the business?", why: "Misaligned leadership wastes budget on conflicting priorities." },
  { id: "qs10_2", module: 10, question: "Are technology successes and ROI communicated to the whole organization?", why: "Invisible wins don't build support for future investment." },
  { id: "qs10_3", module: 10, question: "Do stakeholders feel heard when technology decisions are made?", why: "Buy-in determines whether initiatives succeed or get sabotaged." },

  // Module 11: Organization & Operations
  { id: "qs11_1", module: 11, question: "Are IT roles and responsibilities clearly defined?", why: "Unclear ownership means things fall through the cracks." },
  { id: "qs11_2", module: 11, question: "Do you have documented processes for handling IT issues?", why: "Ad hoc problem-solving doesn't scale and depends on specific people." },
  { id: "qs11_3", module: 11, question: "Do you track IT team performance with metrics?", why: "You can't improve what you don't measure." },

  // Module 12: Financial Acumen
  { id: "qs12_1", module: 12, question: "Do you have a clear picture of total IT spending (including shadow IT)?", why: "Hidden costs are often 30-40% of total IT spend." },
  { id: "qs12_2", module: 12, question: "Do you calculate ROI before making technology investments?", why: "Without ROI analysis, you're gambling with every purchase." },
  { id: "qs12_3", module: 12, question: "Have you reviewed and renegotiated software contracts in the last year?", why: "Auto-renewals and unused licenses are the easiest costs to cut." },

  // Module 13: Portfolio & Vendor Management
  { id: "qs13_1", module: 13, question: "Do you have a list of all your technology vendors and contracts?", why: "You can't manage what you can't see." },
  { id: "qs13_2", module: 13, question: "Are technology projects prioritized against each other using consistent criteria?", why: "Without prioritization, the loudest voice wins — not the best business case." },
  { id: "qs13_3", module: 13, question: "Do you evaluate vendor performance regularly?", why: "Vendors optimize for their revenue, not your outcomes, unless you hold them accountable." },

  // Module 14: Agile, DevOps & Innovation
  { id: "qs14_1", module: 14, question: "Does your team deliver technology changes in small, frequent releases?", why: "Big-bang releases fail more often and take longer to fix." },
  { id: "qs14_2", module: 14, question: "Is there a process for employees to suggest and test new ideas?", why: "Innovation doesn't happen by accident. It needs a system." },
  { id: "qs14_3", module: 14, question: "Can you deploy software updates without downtime?", why: "Downtime for updates signals fragile infrastructure." },

  // Module 15: Process Transformation & Automation
  { id: "qs15_1", module: 15, question: "Have you mapped your core business processes?", why: "You can't automate what you haven't documented." },
  { id: "qs15_2", module: 15, question: "Are you using automation for any repetitive tasks (data entry, reporting, approvals)?", why: "Manual repetitive work is the lowest-hanging automation fruit." },
  { id: "qs15_3", module: 15, question: "Do employees spend significant time on tasks that software could handle?", why: "Every hour spent on automatable work is an hour not spent on growth." },

  // Module 16: Change Management & Workforce
  { id: "qs16_1", module: 16, question: "Do you have a plan for how employees will adapt to new technologies?", why: "70% of digital transformations fail because of people, not technology." },
  { id: "qs16_2", module: 16, question: "Is there a training budget for digital skills?", why: "Untrained employees resist change and underuse the tools you've paid for." },
  { id: "qs16_3", module: 16, question: "Does your organization support remote or hybrid work with proper technology?", why: "Workforce flexibility is now a competitive advantage for hiring and retention." },
];

export function getQuickScanForModule(moduleNumber: number): QuickScanQuestion[] {
  return QUICK_SCAN_QUESTIONS.filter((q) => q.module === moduleNumber);
}

export function getModuleProgress(answeredModules: number[]): { completed: number; total: number; percentage: number } {
  return {
    completed: answeredModules.length,
    total: 16,
    percentage: Math.round((answeredModules.length / 16) * 100),
  };
}
