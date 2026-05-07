-- ============================================================
-- AI-CDIO — Schema v8: N/A escape hatch + Level 5 enforcement
--
-- Two changes in support of Phase 1C methodology depth:
--
-- 1. module_scores.maturity_score becomes NULLABLE so a stakeholder
--    can answer "N/A — I can't speak to this module" without
--    polluting the synthesis with a false low score. The synthesis
--    layer skips NULL rows when computing consensus.
--
-- 2. The 1-5 maturity range constraint is reasserted in case any
--    earlier migration loosened it. (Schema v3 removed the 1-4
--    upper bound; v8 reaffirms 1-5.)
--
-- Idempotent — safe to re-run.
-- ============================================================

-- ---------- Allow NULL maturity_score for N/A responses ----------
alter table module_scores
  alter column maturity_score drop not null;

-- ---------- Reassert 1-5 range constraint (allowing NULL) ----------
alter table module_scores drop constraint if exists module_scores_maturity_score_check;
alter table module_scores add constraint module_scores_maturity_score_check
  check (maturity_score is null or maturity_score between 1 and 5);

-- ---------- Add module_skipped flag for explicit "N/A whole module" ----------
-- Distinguishes "stakeholder hit module-gate N/A and skipped the whole module"
-- from "stakeholder answered every question N/A". Both surface as missing data
-- to synthesis but mean different things to a practitioner reviewing coverage.
alter table module_scores
  add column if not exists module_skipped boolean not null default false;

comment on column module_scores.maturity_score is
  'Computed maturity 1-5. NULL when the stakeholder answered N/A on every question or hit the module-gate skip. Synthesis skips NULL rows when computing consensus.';

comment on column module_scores.module_skipped is
  'True when the stakeholder hit the module-gate "Can you speak to this area?" and answered N/A. Differentiates explicit module skip from per-question abstention.';
