// ============================================================
// AI-CDIO — Pain Point Definitions (client-safe, no server imports)
// ============================================================

export const PAIN_POINT_MODULES: Record<string, number[]> = {
  // Known problems
  "systems_breaking": [3, 4, 11],
  "spending_too_much": [12, 13, 4],
  "not_secure": [5],
  "cant_find_talent": [11, 16, 14],
  "competitors_digital": [2, 7, 15],
  "data_mess": [6, 8],
  "customer_experience": [9, 7],
  // Aspirational / unknown unknowns
  "want_to_use_ai": [6, 8, 15],
  "no_it_team": [1, 11, 13],
  "projects_keep_failing": [14, 13, 2],
  "dont_know_where_to_start": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
  "full_assessment": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
};

export const PAIN_POINT_LABELS: Record<string, string> = {
  // Known problems
  "systems_breaking": "Systems keep breaking",
  "spending_too_much": "Spending too much on software",
  "not_secure": "Not sure if we're secure",
  "cant_find_talent": "Can't find good tech people",
  "competitors_digital": "Competitors seem more digital",
  "data_mess": "Our data is a mess",
  "customer_experience": "Customers deserve better",
  // Aspirational / unknown unknowns
  "want_to_use_ai": "I want to use AI but don't know how",
  "no_it_team": "We have no IT team",
  "projects_keep_failing": "Our tech projects keep failing",
  "dont_know_where_to_start": "I don't know what I don't know",
  "full_assessment": "Give me a full technology health check",
};

// Group labels for UI rendering
export const PAIN_POINT_GROUPS = {
  problems: ["systems_breaking", "spending_too_much", "not_secure", "cant_find_talent", "competitors_digital", "data_mess", "customer_experience"],
  aspirational: ["want_to_use_ai", "no_it_team", "projects_keep_failing"],
  discovery: ["dont_know_where_to_start", "full_assessment"],
};
