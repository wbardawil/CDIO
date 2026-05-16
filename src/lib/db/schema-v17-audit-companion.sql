-- ============================================================
-- AI-CDIO — schema-v17 (2026-05-13)
--
-- Live Audit Companion: a second output mode of the Audit Engine
-- (schema-v16). Generated BEFORE the vendor meeting — a lens-by-
-- lens question sheet tailored to this purchase that the
-- practitioner takes into the room. Extension of the already-
-- governed Pre-Purchase Technology Audit service line, not a new
-- line (see docs/SESSION_HANDOFF.md 2026-05-13).
--
-- Additive + idempotent. Safe whether or not schema-v16 has been
-- applied yet (run v16 then v17).
--
-- The 3 intake hardenings (prior_attempts, ai_model_ownership,
-- demo_observations) need NO migration — intake is jsonb; new
-- keys flow through without DDL.
-- ============================================================

ALTER TABLE public.audits
  ADD COLUMN IF NOT EXISTS companion jsonb NULL;

-- Shape = AuditCompanion in src/types/audit.ts:
--   { generated_at, meeting_context, lenses: [{ lens, questions[],
--     watch_for }], do_not_leave_without_asking }
-- Null until the practitioner generates it. Independent of output:
-- the companion is the pre-meeting artifact, output is the
-- post-meeting verdict; an audit can have one, both, or neither.
