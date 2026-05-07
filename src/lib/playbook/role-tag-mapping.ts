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

/**
 * Adaptive question subset (Phase 1C Day 16 — Tier 1 AI leverage).
 *
 * Caps a role-filtered question list at `targetCount` (default 8) by
 * picking one question per subcategory first (breadth), then filling
 * with remaining questions in original order (which is the order the
 * curator placed them — typically broadest-first).
 *
 * Why: a CIO sees almost every question in a deep module (~12-15);
 * answering all of them per stakeholder per module per assessment is
 * 50+ minutes of stakeholder time across 16 modules and is the #1
 * cause of incomplete assessments. 6-8 questions is the empirically
 * defensible floor for a 5-level maturity score (binary answers in
 * aggregate produce reliable resolution at n>=6).
 *
 * If the input list is already <=targetCount, returns it unchanged.
 *
 * Deterministic, no AI call, no API key required. The "AI leverage"
 * label refers to the contextual selection happening at all — not to
 * an LLM in the loop. A future Phase 2.5 enhancement can swap in an
 * AI selector that weights by industry overlay + prior responses;
 * the UI consumer doesn't need to change.
 */
export function selectAdaptiveSubset(
  questions: DiagnosticQuestion[],
  targetCount: number = 8
): DiagnosticQuestion[] {
  if (questions.length <= targetCount) return questions;

  // Bucket by subcategory in input order.
  const order: string[] = [];
  const buckets: Record<string, DiagnosticQuestion[]> = {};
  for (const q of questions) {
    const key = q.subcategory || "Uncategorized";
    if (!(key in buckets)) {
      buckets[key] = [];
      order.push(key);
    }
    buckets[key].push(q);
  }

  // First pass: one question per subcategory, in subcategory order.
  const selected: DiagnosticQuestion[] = [];
  const consumedIds = new Set<string>();
  for (const sub of order) {
    if (selected.length >= targetCount) break;
    const head = buckets[sub][0];
    selected.push(head);
    consumedIds.add(head.id);
  }

  // Second pass: fill the rest in original order, skipping already-picked.
  if (selected.length < targetCount) {
    for (const q of questions) {
      if (selected.length >= targetCount) break;
      if (!consumedIds.has(q.id)) {
        selected.push(q);
        consumedIds.add(q.id);
      }
    }
  }

  return selected;
}
