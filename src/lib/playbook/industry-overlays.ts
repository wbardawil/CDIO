// ============================================================
// AI-CDIO — Industry Overlay (Phase 1.5 Day 18, Tier 1 AI leverage)
//
// Same 16-module diagnostic; industry-specific framing surfaced to
// the respondent so the questions feel native rather than generic.
// Single per-industry context banner displayed at the top of each
// module in the assessment + the practitioner preview surface.
//
// Per-(industry × module) overrides can be added below when a
// specific module deserves industry-specific phrasing beyond the
// generic banner. Today only Module 5 (Security) gets explicit
// healthcare / financial-services overrides because those
// regulatory regimes meaningfully shift the questions; everything
// else uses the per-industry banner.
//
// Keeping this data-driven (not LLM-generated at runtime) for two
// reasons: (1) latency budget — every assessment page render
// would stall on a 1-2 second LLM call otherwise, and (2) cost
// economics — multiplies LLM bill by N stakeholders × 16 modules
// per engagement, roughly 80x the assessment cost. The Phase 2.5
// AI Accelerator can swap in an LLM-rewrite enhancement on top of
// this layer without changing the consumer surface.
// ============================================================

import type { Industry } from "@/types";

export interface IndustryOverlay {
  /** Short label for the industry chip in the UI. */
  label: string;
  /** 1-2 sentence framing the respondent sees as a banner. Plain English; no jargon. */
  banner: string;
  /** Optional per-module override; falls back to banner when absent. */
  perModule?: Record<number, string>;
}

const HEALTHCARE: IndustryOverlay = {
  label: "Healthcare",
  banner:
    "You're in healthcare. As you answer, think HIPAA, patient data flows, EHR integrations, and PHI risk — these set a higher floor on every governance and security answer.",
  perModule: {
    5:
      "Module 5 (Security) carries extra weight in healthcare. Ground every answer against HIPAA Security Rule + Privacy Rule, breach notification timelines, and PHI access controls. Level-3 here is what HIPAA effectively requires.",
    6:
      "Module 6 (Data & AI) in healthcare touches PHI and protected research data. AI use cases must respect de-identification and minimum-necessary rules; FDA software-as-medical-device rules apply if outputs influence clinical decisions.",
    9:
      "Module 9 (Customer / Patient Experience) means patient experience here — portal access, scheduling, telehealth, accessibility, language support — and patient consent and identity discipline.",
  },
};

const FINANCIAL_SERVICES: IndustryOverlay = {
  label: "Financial Services",
  banner:
    "You're in financial services. As you answer, think SOX, FFIEC / NIST CSF mapping for financial regulators, GLBA, fraud / AML controls, and audit trails. Regulatory scrutiny raises the bar on every governance answer.",
  perModule: {
    5:
      "Module 5 (Security) in financial services is examined against FFIEC + NIST CSF + SOX IT general controls. Level-3 here is what your examiner already expects to see — anything below is an audit finding.",
    12:
      "Module 12 (Tech Finance) ties directly to SOX IT general controls and audit-evidence retention. Cost transparency, vendor management, and license discipline are not just FinOps hygiene; they are evidence in your audit binder.",
  },
};

const MANUFACTURING: IndustryOverlay = {
  label: "Manufacturing",
  banner:
    "You're in manufacturing. As you answer, think IT/OT split, plant-floor systems (SCADA, MES), supply-chain dependencies, and physical-cyber convergence. OT systems have different lifecycles and patching constraints than IT.",
  perModule: {
    4:
      "Module 4 (Cloud & Infrastructure) in manufacturing splits between IT (cloud-acceptable) and OT (often air-gapped, vendor-controlled, slow to update). Treat them as two different infrastructures with different rules.",
    5:
      "Module 5 (Security) in manufacturing covers IEC 62443 for OT environments alongside NIST CSF for IT. Ransomware impact here can stop production lines — a different blast radius than IT-only environments.",
    15:
      "Module 15 (Process Automation) in manufacturing intersects with shop-floor automation (PLCs, robotics) on top of business-process automation. Lean Six Sigma is the native language here; APQC PCF maps cleanly to plant operations.",
  },
};

const PROFESSIONAL_SERVICES: IndustryOverlay = {
  label: "Professional Services",
  banner:
    "You're in professional services. As you answer, think client confidentiality, time-and-billing systems, knowledge management, and the practitioner-as-product economics where utilization and realization rates drive everything.",
};

const RETAIL_ECOMMERCE: IndustryOverlay = {
  label: "Retail / E-commerce",
  banner:
    "You're in retail or e-commerce. As you answer, think PCI-DSS for payment data, customer identity and consent, peak-traffic resilience, and inventory / order systems that must stay live during sales events.",
  perModule: {
    5:
      "Module 5 (Security) in retail covers PCI-DSS for cardholder data alongside NIST CSF. PCI scope expansion (e.g., self-serve portals collecting cards) is the most common audit gap.",
    7:
      "Module 7 (Platforms & APIs) in retail is the customer-experience surface. Outages here are revenue events; integrations with payment, fulfillment, and tax engines are the biggest dependency cluster.",
    9:
      "Module 9 (Customer Experience) in retail is the conversion engine. Personalization, recommendations, checkout flow, and support response time map directly to revenue.",
  },
};

const TECHNOLOGY: IndustryOverlay = {
  label: "Technology",
  banner:
    "You're in technology / SaaS. As you answer, think SOC 2, customer data isolation, secure SDLC, multi-tenant architecture, and product-led-growth analytics. Your customers are evaluating you on the same maturity scale you'd apply to your vendors.",
  perModule: {
    5:
      "Module 5 (Security) in tech / SaaS is SOC 2 + customer-data-isolation territory. Your customers will ask for your SOC 2 report — Level 3+ here is sales-enabling.",
    14:
      "Module 14 (Delivery, DevOps & Innovation) in tech / SaaS is the heart of competitive velocity. DORA metrics (lead time, deployment frequency, MTTR, change-fail rate) are the industry's lingua franca.",
  },
};

const EDUCATION: IndustryOverlay = {
  label: "Education",
  banner:
    "You're in education. As you answer, think FERPA / COPPA, student-data privacy, accessibility (WCAG / Section 508), and the academic-calendar rhythm where many windows for change are shut for long stretches.",
};

const OTHER: IndustryOverlay = {
  label: "Cross-Industry",
  banner:
    "Cross-industry context. As you answer, anchor to the framework cited under each question; no industry-specific overlay applies.",
};

const OVERLAYS: Record<Industry, IndustryOverlay> = {
  healthcare: HEALTHCARE,
  financial_services: FINANCIAL_SERVICES,
  manufacturing: MANUFACTURING,
  professional_services: PROFESSIONAL_SERVICES,
  retail_ecommerce: RETAIL_ECOMMERCE,
  technology: TECHNOLOGY,
  education: EDUCATION,
  other: OTHER,
};

/**
 * Resolve the industry-specific banner for a given module. Falls
 * back to the per-industry general banner if no module-specific
 * override is defined.
 */
export function getIndustryOverlay(
  industry: Industry,
  moduleNumber: number
): { label: string; banner: string } {
  const overlay = OVERLAYS[industry];
  const banner = overlay.perModule?.[moduleNumber] ?? overlay.banner;
  return { label: overlay.label, banner };
}

export function getIndustryLabel(industry: Industry): string {
  return OVERLAYS[industry].label;
}
