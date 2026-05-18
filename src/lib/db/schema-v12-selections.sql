-- ============================================================
-- AI-CDIO — schema-v12 (Phase 1D Day 24)
--
-- Selection Engine. One engine handles tech AND AI selections
-- (per Architectural Lineage commit 9f3a2a6 - "Selection Engine
-- generalized over `domain: tech | ai` parameter; no standalone
-- Build-vs-Buy advisor"). The Phase 2.5 AI extension (Day 43 of
-- the reduced Phase 2.5) plugs into this same table by setting
-- domain = 'ai' and using the AMP 5x5 Feasibility x Value
-- scoring template.
--
-- Decision Package output is generated from the selection state
-- and surfaces in the existing Decision Packages panel.
--
-- Idempotent.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.selections (
  id              uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      timestamptz   NOT NULL DEFAULT now(),
  updated_at      timestamptz   NOT NULL DEFAULT now(),

  org_id          uuid          NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  practitioner_id uuid          NOT NULL REFERENCES public.practitioners(id) ON DELETE RESTRICT,

  -- The category of selection. tech = vendor / platform / tool.
  -- ai = AI vendor / model / build-vs-buy. partner = consulting /
  -- agency / contractor partner. Generalized from the start so a
  -- Phase 2.5 'ai' extension or a future 'partner' selection
  -- doesn't need a schema migration - just a different scoring
  -- template + criteria set.
  domain          text          NOT NULL DEFAULT 'tech'
                                CHECK (domain IN ('tech', 'ai', 'partner')),

  -- Optional link to an initiative the selection serves.
  initiative_id   uuid          NULL REFERENCES public.initiatives(id) ON DELETE SET NULL,

  -- Optional link to a maturity-assessment module.
  module_number   int           NULL,

  title           text          NOT NULL,
  question        text          NOT NULL,  -- the decision being made

  status          text          NOT NULL DEFAULT 'open'
                                CHECK (status IN ('open', 'recommended', 'decided', 'cancelled')),

  -- Criteria as ordered jsonb array. Each entry:
  --   { id: uuid, name: text, weight: number (0-5),
  --     dimension: 'feasibility' | 'value' | 'risk' | 'fit' }
  -- For domain='ai' the AMP 5x5 default is loaded:
  --   feasibility: data readiness, system fit, process structure,
  --   change readiness, time-to-impact
  --   value: opex reduction, productivity uplift, quality, revenue,
  --   strategic alignment
  criteria        jsonb         NOT NULL DEFAULT '[]'::jsonb,

  -- Candidates as ordered jsonb array. Each entry:
  --   { id: uuid, name: text, summary: text|null,
  --     scores: { [criterion_id]: int (1-5) },
  --     notes: text|null,
  --     is_recommended: bool }
  candidates      jsonb         NOT NULL DEFAULT '[]'::jsonb,

  -- The recommendation narrative once the practitioner records
  -- a decision. Free text; reused into Decision Package output.
  recommendation  text          NULL,
  decided_at      timestamptz   NULL,
  decided_candidate_id uuid     NULL
);

CREATE INDEX IF NOT EXISTS selections_org_id_idx
  ON public.selections(org_id, created_at DESC);

CREATE INDEX IF NOT EXISTS selections_practitioner_id_idx
  ON public.selections(practitioner_id, created_at DESC);

CREATE INDEX IF NOT EXISTS selections_domain_idx
  ON public.selections(org_id, domain, status);

DROP TRIGGER IF EXISTS selections_touch_updated_at ON public.selections;
CREATE TRIGGER selections_touch_updated_at
  BEFORE UPDATE ON public.selections
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

ALTER TABLE public.selections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS selections_service_full_access ON public.selections;
CREATE POLICY selections_service_full_access
  ON public.selections FOR ALL USING (true) WITH CHECK (true);

-- Table-privilege grant (added 2026-05-18). RLS/BYPASSRLS do NOT
-- substitute for table GRANTs: without this, API-role writes fail
-- with SQLSTATE 42501. Idempotent; mirrors the schema-v16 precedent.
GRANT ALL ON public.selections TO anon, authenticated, service_role;
