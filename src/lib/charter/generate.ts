// ============================================================
// AI-CDIO — Charter Generator (Phase 1D Day 21)
//
// Lean one-page engagement charter. Templated from live engagement
// data (org context + stakeholders + active modules), no LLM call.
// PMBOK-style 50-page charters are explicitly out — those produce
// shelfware. This produces an artifact a CEO can read in 5 minutes
// and sign.
//
// Future enhancement: an AI polish pass (Phase 2 dogfood) that
// rewrites the Engagement Goal paragraph from the org's actual
// pain language. Today the goal is data-driven templating.
// ============================================================

import type {
  Industry,
  OrgSize,
  EngagementModel,
} from "@/types";
import { MODULE_META } from "@/types";

export interface CharterStakeholder {
  id: string;
  name: string;
  role: string;
  email: string;
  influence_level: "decision_maker" | "influencer" | "contributor";
}

export interface CharterOrg {
  id: string;
  name: string;
  industry: Industry;
  size_category: OrgSize;
  employee_count: number;
  engagement_model: EngagementModel;
  monthly_hours: number;
  active_modules: number[];
}

export interface CharterPractitioner {
  name: string | null;
  email: string | null;
}

export interface CharterMilestone {
  day: number;
  deliverable: string;
  outcome: string;
}

export interface CharterCadenceItem {
  rhythm: "weekly" | "biweekly" | "monthly" | "quarterly";
  forum: string;
  participants: string;
  agenda: string;
}

export interface CharterModule {
  number: number;
  name: string;
  framework: string;
  oneLiner: string;
}

export interface Charter {
  generatedAt: string;
  client: {
    name: string;
    industry: string;
    sizeCategory: OrgSize;
    employeeCount: number;
  };
  practitioner: {
    name: string;
    email: string;
  };
  engagement: {
    model: EngagementModel;
    monthlyHours: number;
    durationDays: 90;
    goal: string;
  };
  modules: CharterModule[];
  stakeholders: CharterStakeholder[];
  commitmentMatrix: CharterMilestone[];
  cadence: CharterCadenceItem[];
  pmCovenant: string;
  decisionRights: { area: string; practitioner: string; client: string }[];
  confidentiality: string;
}

// Standard 90-Day Commitment Matrix (per docs/STRATEGY-2026.md +
// docs/CONTRACT-TEMPLATES.md Section 3). Same milestones across
// every engagement; the practitioner can override on the live
// charter when a specific client needs different sequencing.
const COMMITMENT_MATRIX: CharterMilestone[] = [
  {
    day: 14,
    deliverable: "Maturity assessment delivered across active modules.",
    outcome: "Baseline + same scoreboard, framework-cited.",
  },
  {
    day: 21,
    deliverable: "First 3-5 Decision Packages produced and reviewed.",
    outcome: "Misalignments caught early.",
  },
  {
    day: 30,
    deliverable: "AI Readiness assessed; AI Quick Win Roadmap delivered.",
    outcome: "Board-grade AI plan in hand.",
  },
  {
    day: 45,
    deliverable:
      "First Initiative launched (outcome-driven; could be cyber, AI, data, automation, or any framework-anchored outcome).",
    outcome: "Visible execution starts.",
  },
  {
    day: 60,
    deliverable:
      "Second Initiative launched. First Status Report delivered. Engagement Cadence link live for client leadership.",
    outcome: "Ongoing visibility for the CEO.",
  },
  {
    day: 90,
    deliverable:
      "Maturity score lift documented. ROI calculation with measurable evidence. At least one initiative shipped to production.",
    outcome:
      "Re-engagement conversation grounded in hard-dollar, defensible outcomes.",
  },
];

// PM Covenant clause (per docs/CONTRACT-TEMPLATES.md Section 1).
const PM_COVENANT = `Practitioner provides strategic oversight, methodology direction, and decision facilitation. Practitioner does not act as Project Manager for delivery work. For any Initiative scoped above $25K or longer than four weeks, Client agrees to nominate a Project Manager (internal employee, contractor, or agency) who works alongside Practitioner under Practitioner's strategic oversight. Project Manager will use the AI-CDIO platform to track Initiative status, milestones, and decisions.`;

// Confidentiality clause (links into /privacy at runtime).
const CONFIDENTIALITY = `Engagement records (assessment responses, decisions, status reports, narratives) are jointly owned by Client and Practitioner; either party may export the full record at any time. Vendor / contractor / partner notes that Practitioner records in the private Network Catalog remain Practitioner's private records and are not shared with Client unless Practitioner explicitly chooses to. Data handling follows the Privacy Policy (/privacy) and AI Disclaimer (/ai-disclaimer).`;

const DECISION_RIGHTS: {
  area: string;
  practitioner: string;
  client: string;
}[] = [
  {
    area: "Strategic direction (3-year tech vision)",
    practitioner: "Recommends, anchored to framework + assessment evidence.",
    client: "Decides.",
  },
  {
    area: "Tech / vendor selection (>$25K)",
    practitioner:
      "Runs Selection Engine evaluation; surfaces alternatives + risk; produces Decision Package.",
    client: "Decides between named alternatives.",
  },
  {
    area: "Initiative sequencing + funding",
    practitioner: "Recommends; produces 90-Day Commitment Matrix updates.",
    client: "Decides which Initiatives launch + funds them.",
  },
  {
    area: "Hiring / firing IT staff",
    practitioner: "Advises; participates in interviews where invited.",
    client: "Decides.",
  },
  {
    area: "Methodology + assessment cadence",
    practitioner: "Decides (it's the practitioner's craft).",
    client: "Schedules.",
  },
];

function pickCadence(model: EngagementModel): CharterCadenceItem[] {
  // Weekly tactical + monthly strategic + quarterly re-assessment.
  // Weekly cadence is omitted on advisory tier (hours don't justify it).
  const items: CharterCadenceItem[] = [];
  if (model !== "advisory") {
    items.push({
      rhythm: "weekly",
      forum: "Tactical sync (30 min)",
      participants: "Practitioner + client primary contact + initiative owners",
      agenda:
        "Status of in-flight initiatives; blockers; decision packages awaiting response.",
    });
  }
  items.push({
    rhythm: "monthly",
    forum: "Executive review (60 min)",
    participants: "Practitioner + client executive sponsor",
    agenda:
      "Status Report walkthrough; strategic alignment check; upcoming Decision Packages; portfolio outcomes.",
  });
  items.push({
    rhythm: "quarterly",
    forum: "Re-assessment + roadmap refresh (90 min)",
    participants:
      "Practitioner + executive sponsor + named stakeholders for each active module",
    agenda:
      "Maturity re-score on active modules; evidence of value realized vs projected; next-quarter Initiative slate.",
  });
  return items;
}

function buildEngagementGoal(
  org: CharterOrg,
  industry: Industry
): string {
  const sizeNarrative =
    org.size_category === "small"
      ? "lean SMB scale"
      : org.size_category === "medium"
        ? "mid-market scale"
        : "enterprise scale";

  const industryNarrative = industryGoalLine(industry);

  return `Over the next 90 days, deliver a measurable lift in technology maturity across the active modules below — calibrated to ${org.name}'s ${sizeNarrative} (${org.employee_count} employees). The work is outcome-led, not category-led: the highest-leverage initiative for ${org.name} this quarter wins, anchored to a recognized framework so every recommendation can be defended at the board. ${industryNarrative}`;
}

function industryGoalLine(industry: Industry): string {
  switch (industry) {
    case "healthcare":
      return "HIPAA discipline, EHR integration, and patient-data privacy set the floor for governance and security work in this engagement.";
    case "financial_services":
      return "FFIEC + NIST CSF mapping, SOX IT general controls, and audit-evidence retention set the bar for every governance and security answer.";
    case "manufacturing":
      return "IT/OT split, plant-floor system lifecycle, and supply-chain dependencies are first-class context for every recommendation.";
    case "retail_ecommerce":
      return "PCI-DSS scope, peak-traffic resilience, and customer experience are first-class context across security, platforms, and CX work.";
    case "technology":
      return "SOC 2 readiness, customer-data isolation, and DORA delivery metrics are the language this engagement will speak in.";
    case "education":
      return "FERPA / COPPA, accessibility (WCAG / Section 508), and academic-calendar change windows shape execution sequencing.";
    case "professional_services":
      return "Client confidentiality, time-and-billing integrity, and knowledge management discipline anchor this engagement.";
    default:
      return "Recommendations are anchored to recognized frameworks (NIST CSF, CMMI, TBM Council, KPMG ROO, APQC PCF, Lean Six Sigma) so the work is auditable.";
  }
}

export function generateCharter(
  org: CharterOrg,
  stakeholders: CharterStakeholder[],
  practitioner: CharterPractitioner
): Charter {
  const modules: CharterModule[] = (org.active_modules.length > 0
    ? org.active_modules
    : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
  )
    .map((n) => {
      const meta = MODULE_META[n];
      if (!meta) return null;
      return {
        number: n,
        name: meta.name,
        framework: meta.framework,
        oneLiner: meta.oneLiner,
      };
    })
    .filter((m): m is CharterModule => m !== null);

  return {
    generatedAt: new Date().toISOString(),
    client: {
      name: org.name,
      industry: org.industry,
      sizeCategory: org.size_category,
      employeeCount: org.employee_count,
    },
    practitioner: {
      name: practitioner.name ?? "Fractional CDIO",
      email: practitioner.email ?? "—",
    },
    engagement: {
      model: org.engagement_model,
      monthlyHours: org.monthly_hours,
      durationDays: 90,
      goal: buildEngagementGoal(org, org.industry),
    },
    modules,
    stakeholders,
    commitmentMatrix: COMMITMENT_MATRIX,
    cadence: pickCadence(org.engagement_model),
    pmCovenant: PM_COVENANT,
    decisionRights: DECISION_RIGHTS,
    confidentiality: CONFIDENTIALITY,
  };
}
