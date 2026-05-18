-- ============================================================
-- AI-CDIO — schema-v13 (Phase 1D Day 25)
--
-- NETWORK CATALOG. Per-practitioner private vendor / partner /
-- contractor library. P0 privacy concern (see
-- docs/STRATEGY-2026.md Network Catalog Privacy Spec).
--
-- Hard requirements:
--   1. Per-practitioner only - never cross-practitioner visible
--   2. Vendor pricing, performance ratings, and notes are
--      practitioner's private records; not shared with clients
--      unless practitioner explicitly chooses to (Year 1: never)
--   3. No cross-practitioner aggregates Year 1
--   4. Practitioner can export AND wipe their entire catalog
--      at will (GDPR-clean)
--
-- Soft commitments (Phase 4+):
--   - Audit log of every catalog read attempt
--   - Column-level encryption for sensitive fields beyond
--     Supabase defaults (Phase 4)
--
-- Defense-in-depth model:
--   Layer 1 - app-layer filter on practitioner_id (today)
--   Layer 2 - RLS policies (this file enforces; today permissive
--             for service role; per-user JWT closes P0-8)
--   Layer 3 - corpus partitioning at table level (this is one
--             table; partitioning becomes relevant when Network
--             Catalog grows multi-practitioner aggregates)
--
-- Idempotent.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.network_catalog_entries (
  id              uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      timestamptz   NOT NULL DEFAULT now(),
  updated_at      timestamptz   NOT NULL DEFAULT now(),

  -- THE OWNER. Every read MUST filter on this column. Every UI
  -- and API path enforces this through assertPractitionerOwnsRow.
  practitioner_id uuid          NOT NULL REFERENCES public.practitioners(id) ON DELETE CASCADE,

  -- Type of entry. vendor = product / SaaS company. partner =
  -- consulting / agency / contractor firm or individual.
  entry_type      text          NOT NULL DEFAULT 'vendor'
                                CHECK (entry_type IN ('vendor', 'partner', 'individual')),

  -- Display name + optional categorization.
  name            text          NOT NULL,
  category        text          NULL,  -- e.g. "ITSM", "FinOps tooling", "Data engineering contractor"

  -- Public profile bits the practitioner doesn't mind seeing on
  -- a Decision Package they share with the client.
  website         text          NULL,
  contact_name    text          NULL,
  contact_email   text          NULL,

  -- Practitioner's private notes. NEVER shared with clients
  -- unless the practitioner explicitly copies / exports.
  -- Treated as sensitive (Phase 4 column-encryption candidate).
  private_notes   text          NULL,

  -- Pricing context. Free text because pricing varies by deal
  -- size, term, and renegotiation. Practitioner's private.
  -- e.g. "Starter $99/mo, Growth $399/mo, contracts negotiable"
  pricing_notes   text          NULL,

  -- Performance rating 1-5 (5 = "I'd recommend without
  -- hesitation"). Practitioner's private.
  rating          int           NULL CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5)),

  -- Number of times the practitioner has personally used /
  -- recommended this entry on a real engagement. Manual count;
  -- the platform doesn't auto-increment because
  -- engagement-vs-mention distinction is the practitioner's call.
  engagements_used int          NOT NULL DEFAULT 0 CHECK (engagements_used >= 0),

  -- Free-form tags for filtering. Lowercase, no spaces.
  tags            text[]        NOT NULL DEFAULT '{}'::text[],

  -- Optional last-engagement context: when did the practitioner
  -- last work with this entry?
  last_engaged_at date          NULL
);

CREATE INDEX IF NOT EXISTS network_catalog_practitioner_id_idx
  ON public.network_catalog_entries(practitioner_id, name);

CREATE INDEX IF NOT EXISTS network_catalog_practitioner_type_idx
  ON public.network_catalog_entries(practitioner_id, entry_type, rating DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS network_catalog_tags_idx
  ON public.network_catalog_entries USING gin(tags);

DROP TRIGGER IF EXISTS network_catalog_touch_updated_at ON public.network_catalog_entries;
CREATE TRIGGER network_catalog_touch_updated_at
  BEFORE UPDATE ON public.network_catalog_entries
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- RLS enabled. Service-role policy permissive (consistent with
-- the rest of the app pre-P0-8 closure - app-layer enforcement
-- is the load-bearing tenant isolation today).
ALTER TABLE public.network_catalog_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS network_catalog_service_full_access ON public.network_catalog_entries;
CREATE POLICY network_catalog_service_full_access
  ON public.network_catalog_entries FOR ALL USING (true) WITH CHECK (true);

-- Future-ready policy template (NOT activated). When per-user JWT
-- ships (P0-8 closure, Phase 4) this becomes the load-bearing
-- isolation. Documented here so the migration is obvious:
--
--   CREATE POLICY network_catalog_practitioner_isolation
--     ON public.network_catalog_entries
--     FOR ALL
--     USING (practitioner_id = (
--       SELECT id FROM practitioners
--       WHERE clerk_user_id = auth.jwt() ->> 'sub'
--     ));

-- Table-privilege grant (added 2026-05-18). RLS/BYPASSRLS do NOT
-- substitute for table GRANTs: without this, API-role writes fail
-- with SQLSTATE 42501. Idempotent; mirrors the schema-v16 precedent.
GRANT ALL ON public.network_catalog_entries TO anon, authenticated, service_role;
