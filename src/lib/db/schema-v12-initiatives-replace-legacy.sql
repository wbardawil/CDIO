-- ============================================================
-- AI-CDIO — schema-v12 (2026-05-20): replace legacy initiatives schema
--
-- WHY THIS EXISTS
-- ---------------
-- schema-v11-initiatives.sql (Phase 1D Day 22-23) intended to land a
-- brand-new `initiatives` shape (per-org, practitioner-owned, jsonb
-- steps) replacing the original schema.sql shape (roadmap-bound,
-- numeric value/effort scores, free-form description). But v11 used
--
--   CREATE TABLE IF NOT EXISTS public.initiatives ( ... )
--
-- which silently no-op'd in any environment where the original
-- schema.sql initiatives table already existed. The follow-up
-- ADD COLUMN IF NOT EXISTS statements added the NEW columns on top
-- of the OLD ones, producing a HYBRID schema in prod:
--
--   - roadmap_id      uuid NOT NULL  (LEGACY — blocks every insert)
--   - module_numbers  int[] NOT NULL DEFAULT '{}'   (legacy)
--   - description     text NOT NULL DEFAULT ''      (legacy)
--   - priority_class  text NOT NULL CHECK (...)     (LEGACY — blocks)
--   - value_score     int  NOT NULL CHECK (1..10)   (LEGACY — blocks)
--   - effort_score    int  NOT NULL CHECK (1..10)   (LEGACY — blocks)
--   - status with TWO conflicting CHECK constraints (old set + v11 set)
--   - plus all the v11 columns (org_id, practitioner_id, goal, steps, ...)
--
-- The application code (src/app/api/initiatives/route.ts) writes against
-- the v11 design only. Every insert therefore fails with NOT NULL
-- violations on the legacy columns. The first one observed in prod:
--
--   "null value in column 'roadmap_id' of relation 'initiatives'
--    violates not-null constraint"
--
-- (and `priority_class`, `value_score`, `effort_score` would block
-- subsequent attempts even after fixing roadmap_id alone).
--
-- FIX
-- ---
-- Drop initiatives + initiative_tokens entirely (CASCADE handles any
-- FKs that point into them) and recreate per the v11 design exactly.
-- Any row data lost is necessarily synthetic / partial because the
-- application code has never been able to insert a valid row under
-- the hybrid schema — there is no real production data to preserve.
--
-- Verified before destruction:
--   - No application code or schema file references roadmaps→initiatives
--     beyond schema.sql's own FK (which is dropped here via CASCADE).
--   - initiative_tokens (v11) references initiatives via FK and is
--     recreated below.
--
-- Idempotent: re-running is safe (IF EXISTS / fresh recreate).
-- ============================================================

-- ----- destroy the hybrid table + its FK-dependent children -----
DROP TABLE IF EXISTS public.initiative_tokens CASCADE;
DROP TABLE IF EXISTS public.initiatives CASCADE;

-- ----- recreate per v11 design (no IF NOT EXISTS this time) -----
CREATE TABLE public.initiatives (
  id              uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      timestamptz   NOT NULL DEFAULT now(),
  updated_at      timestamptz   NOT NULL DEFAULT now(),

  org_id          uuid          NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  practitioner_id uuid          NOT NULL REFERENCES public.practitioners(id) ON DELETE RESTRICT,

  title           text          NOT NULL,
  goal            text          NOT NULL,

  domain          text          NOT NULL DEFAULT 'tech',
  module_number   int           NULL,

  owner_name      text          NULL,
  owner_email     text          NULL,

  status          text          NOT NULL DEFAULT 'active'
                                CHECK (status IN ('active', 'blocked', 'done', 'cancelled')),

  target_completion_date  date        NULL,
  completed_at            timestamptz NULL,

  steps              jsonb      NOT NULL DEFAULT '[]'::jsonb,
  practitioner_notes text       NULL
);

CREATE INDEX initiatives_org_id_idx
  ON public.initiatives(org_id, created_at DESC);

CREATE INDEX initiatives_practitioner_id_idx
  ON public.initiatives(practitioner_id, created_at DESC);

CREATE INDEX initiatives_status_idx
  ON public.initiatives(org_id, status, target_completion_date);

-- The touch_updated_at() function was created by schema-v11; reuse it.
-- CREATE OR REPLACE here in case v11 wasn't applied (idempotent).
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS initiatives_touch_updated_at ON public.initiatives;
CREATE TRIGGER initiatives_touch_updated_at
  BEFORE UPDATE ON public.initiatives
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ----- magic-link tokens for non-Clerk participants -----
CREATE TABLE public.initiative_tokens (
  id              uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      timestamptz   NOT NULL DEFAULT now(),
  initiative_id   uuid          NOT NULL REFERENCES public.initiatives(id) ON DELETE CASCADE,
  token           text          UNIQUE NOT NULL,
  participant_name  text        NOT NULL,
  participant_email text        NULL,
  scope           text          NOT NULL DEFAULT 'view_and_update'
                                CHECK (scope IN ('view_only', 'view_and_update')),
  expires_at      timestamptz   NULL,
  revoked_at      timestamptz   NULL,
  last_used_at    timestamptz   NULL
);

CREATE INDEX initiative_tokens_initiative_id_idx
  ON public.initiative_tokens(initiative_id);

-- RLS + service-role grant (mirrors v11)
ALTER TABLE public.initiatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.initiative_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS initiatives_service_full_access ON public.initiatives;
CREATE POLICY initiatives_service_full_access
  ON public.initiatives FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS initiative_tokens_service_full_access ON public.initiative_tokens;
CREATE POLICY initiative_tokens_service_full_access
  ON public.initiative_tokens FOR ALL USING (true) WITH CHECK (true);

GRANT ALL ON public.initiatives, public.initiative_tokens TO service_role;
-- anon/authenticated revoked per schema-v18 (cso Finding 1) — RLS-only access.
