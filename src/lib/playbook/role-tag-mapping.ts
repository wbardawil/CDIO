// ============================================================
// AI-CDIO — Role → Tag Mapping (Phase 1C, locked 2026-04-29)
//
// A respondent sees a question only if their role intersects the
// question's tags. CEOs answer strategic. CTOs answer technical +
// operational. CISOs answer technical + risk. Directors / managers
// see questions in their lane (their `area`) plus broad operational.
//
// Questions WITHOUT tags (legacy modules 1-4, 6-16) are shown to
// every respondent — that's the safe migration default until those
// modules get their own depth pass in later phases.
// ============================================================

import type {
  QuestionFunctionTag,
  QuestionAreaTag,
} from "@/types";
import type { DiagnosticQuestion } from "@/lib/playbook/diagnostic-questions";

export interface RolePermission {
  /** Function tags this role can speak to. Empty array = sees nothing function-tagged. */
  function: QuestionFunctionTag[];
  /** Area tags this role owns. Empty array = role is not area-scoped. */
  area: QuestionAreaTag[];
}

/**
 * Canonical role → tag mapping. Keys are lowercase + dash-form so the
 * stakeholder.role text field can be normalized through `roleKey()`.
 */
const ROLE_PERMISSIONS: Record<string, RolePermission> = {
  // ---------- C-Suite ----------
  "ceo":     { function: ["strategic"],                                                area: [] },
  "founder": { function: ["strategic"],                                                area: [] },
  "owner":   { function: ["strategic"],                                                area: [] },
  "president": { function: ["strategic"],                                              area: [] },
  "cfo":     { function: ["strategic", "financial"],                                   area: ["finance"] },
  "coo":     { function: ["strategic", "operational"],                                 area: ["operations"] },
  "cio":     { function: ["strategic", "financial", "technical", "operational"],       area: ["IT"] },
  "cdio":    { function: ["strategic", "financial", "technical", "operational"],       area: ["IT"] },
  "cdo":     { function: ["strategic", "operational"],                                 area: ["IT"] },
  "cto":     { function: ["strategic", "technical", "operational"],                    area: ["IT"] },
  "ciso":    { function: ["strategic", "technical", "risk"],                           area: ["IT"] },

  // ---------- Director / Manager — by area ----------
  "director-operations":  { function: ["operational"],                                  area: ["operations"] },
  "manager-operations":   { function: ["operational"],                                  area: ["operations"] },
  "director-sales":       { function: [],                                               area: ["sales"] },
  "manager-sales":        { function: [],                                               area: ["sales"] },
  "director-it":          { function: ["technical", "operational"],                     area: ["IT"] },
  "manager-it":           { function: ["technical", "operational"],                     area: ["IT"] },
  "it-director":          { function: ["technical", "operational"],                     area: ["IT"] },
  "it-manager":           { function: ["technical", "operational"],                     area: ["IT"] },
  "director-finance":     { function: ["financial"],                                    area: ["finance"] },
  "manager-finance":      { function: ["financial"],                                    area: ["finance"] },
  "director-marketing":   { function: [],                                               area: ["marketing"] },
  "manager-marketing":    { function: [],                                               area: ["marketing"] },

  // ---------- Catch-all ----------
  // Director/Manager-Other lands here. We give them a curated minimum
  // (operational + cross-functional broad) and lean on N/A for the rest.
  "director-other":       { function: ["operational"],                                  area: ["cross_functional"] },
  "manager-other":        { function: ["operational"],                                  area: ["cross_functional"] },
};

/**
 * Default for any role string we don't recognize. Conservative —
 * shows untagged (legacy) questions but no role-filtered ones.
 * Stakeholder + practitioner can use N/A to skip what they can't
 * speak to.
 */
const DEFAULT_PERMISSION: RolePermission = {
  function: [],
  area: [],
};

/** Normalize a free-text role into a lookup key. Tolerates spaces, slashes, ampersands. */
function roleKey(role: string): string {
  const cleaned = role.trim().toLowerCase()
    .replace(/[\s/&]+/g, "-")
    .replace(/--+/g, "-")
    .replace(/^-|-$/g, "");
  // Try the cleaned key, then a few common aliases.
  if (cleaned in ROLE_PERMISSIONS) return cleaned;
  // "director of operations" / "vp of operations" → director-operations
  for (const stem of ["director", "manager", "vp", "head"]) {
    const m = cleaned.match(new RegExp(`^${stem}-(?:of-)?(operations|sales|it|finance|marketing|other)$`));
    if (m) return `${stem === "vp" || stem === "head" ? "director" : stem}-${m[1]}`;
  }
  // "operations director" / "sales manager" → director-operations / manager-sales
  for (const stem of ["director", "manager"]) {
    const m = cleaned.match(new RegExp(`^(operations|sales|it|finance|marketing|other)-${stem}$`));
    if (m) return `${stem}-${m[1]}`;
  }
  return cleaned;
}

export function getRolePermission(role: string): RolePermission {
  return ROLE_PERMISSIONS[roleKey(role)] ?? DEFAULT_PERMISSION;
}

/**
 * Filter a module's question list to the subset a given role should see.
 *
 * Decision rules:
 *   1. If the question has NO tags (legacy schema), show it. This keeps
 *      Modules 1-4, 6-16 working unchanged until their depth pass.
 *   2. If the question has tags, show it when EITHER:
 *      a) any of its function tags is in the role's function list, OR
 *      b) any of its area tags is in the role's area list.
 *   3. Otherwise hide it.
 *
 * The OR-rule is deliberate: a CFO (function: financial) sees Module 5's
 * compliance question (tagged financial) even though their area isn't
 * cross_functional; the IT Director (area: IT) sees the encryption
 * question (tagged area: IT) even though they don't carry strategic
 * function tags. This matches the role-mapping table in
 * docs/ROADMAP.md Phase 1C.
 */
export function filterQuestionsForRole(
  questions: DiagnosticQuestion[],
  role: string
): DiagnosticQuestion[] {
  const perm = getRolePermission(role);
  return questions.filter((q) => {
    if (!q.tags) return true; // legacy untagged → everyone sees
    const fnHit = q.tags.function.some((t) => perm.function.includes(t));
    const areaHit = q.tags.area.some((t) => perm.area.includes(t));
    return fnHit || areaHit;
  });
}

/**
 * Whether a role has zero qualifying questions in a module — used by the
 * UI to short-circuit into the module-gate "you're not the right person
 * for this section" view rather than showing an empty form.
 */
export function moduleEmptyForRole(
  moduleQuestions: DiagnosticQuestion[],
  role: string
): boolean {
  return filterQuestionsForRole(moduleQuestions, role).length === 0;
}
