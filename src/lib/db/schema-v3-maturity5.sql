-- ============================================================
-- AI-CDIO v3 — Change maturity scale from 4 to 5 levels
-- Standardized across AI-CDIO, AI-Strategist, AI-OME
-- ============================================================

-- Update module_scores constraint
alter table module_scores drop constraint if exists module_scores_maturity_score_check;
alter table module_scores add constraint module_scores_maturity_score_check check (maturity_score between 1 and 5);

-- Update consensus_score to allow up to 5.00
alter table assessment_synthesis drop constraint if exists assessment_synthesis_consensus_score_check;
