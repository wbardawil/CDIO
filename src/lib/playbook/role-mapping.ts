// ============================================================
// Role → Module mapping + Influence level inference
//
// Pure functions, no side effects, importable from any layer.
// Extracted from EngagementOrchestrator so the same logic
// drives onboarding AND post-onboarding stakeholder edits.
// ============================================================

export type InfluenceLevel = "decision_maker" | "influencer" | "contributor";

/**
 * Infer practitioner influence level from a free-text role string.
 * Keyword-matched. Order matters: most-specific first.
 */
export function inferInfluenceLevel(role: string): InfluenceLevel {
  const r = role.toLowerCase();
  if (r.includes("ceo") || r.includes("owner") || r.includes("president") || r.includes("coo") || r.includes("founder")) {
    return "decision_maker";
  }
  if (
    r.includes("cto") ||
    r.includes("cfo") ||
    r.includes("cio") ||
    r.includes("ciso") ||
    r.includes("cdio") ||
    r.includes("cdo") ||
    r.includes("vp") ||
    r.includes("director") ||
    r.includes("head of")
  ) {
    return "influencer";
  }
  return "contributor";
}

/**
 * Map a role string to the relevant module numbers (1-16).
 *
 * Order matters: CISO/CDIO/CDO must be checked before CTO/CIO/IT
 * because the substring overlaps would otherwise catch them in the wrong branch.
 */
export function assignModulesByRole(role: string): number[] {
  const r = role.toLowerCase();

  // CISO — security-first executive
  if (r.includes("ciso") || r.includes("chief information security")) {
    return [5, 4, 11, 13]; // Cyber, Cloud (security), Org structure, Vendor mgmt
  }

  // CDIO — Chief Digital & Information Officer (covers digital and IT)
  if (r.includes("cdio") || r.includes("chief digital and information")) {
    return [2, 3, 4, 5, 6, 7, 8, 10, 11, 14, 16];
  }

  // CDO — Chief Data / Chief Digital Officer
  if (
    r.includes("chief data") ||
    r.includes("chief digital officer") ||
    r === "cdo" ||
    r.includes(" cdo") ||
    r.includes("head of data")
  ) {
    return [6, 7, 8, 5, 9]; // Data/AI, Platforms, Analytics, Cyber, HCD
  }

  // CEO / President / Owner
  if (r.includes("ceo") || r.includes("owner") || r.includes("president") || r.includes("founder")) {
    return [1, 2, 10, 12, 16];
  }

  // CTO / CIO / Head of IT / IT Director
  if (
    r.includes("cto") ||
    r.includes("cio") ||
    r.includes("head of it") ||
    r.includes("head of technology") ||
    r.includes("it director") ||
    r.includes("it manager") ||
    r.includes("vp engineering") ||
    r.includes("vp it")
  ) {
    return [2, 3, 4, 5, 6, 14];
  }

  if (r.includes("cfo") || r.includes("finance")) {
    return [12, 13, 2];
  }
  if (r.includes("coo") || r.includes("operations")) {
    return [11, 15, 13];
  }
  if (r.includes("marketing") || r.includes("product") || r.includes("sales")) {
    return [7, 8, 9];
  }
  if (r.includes("hr") || r.includes("people")) {
    return [16, 11];
  }

  // Default: all 16 — conservative, lets unrecognized roles answer everything.
  return Array.from({ length: 16 }, (_, i) => i + 1);
}
