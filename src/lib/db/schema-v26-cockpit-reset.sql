-- ============================================================
-- AI-CDIO — schema-v26 (2026-05-21) — CDIO Review Cockpit reset
--
-- The project pivoted to the CDIO Review Cockpit (v1). The old
-- 16-module assessment product is shelved; git history keeps it.
-- This migration drops every legacy product table and creates the
-- four cockpit tables.
--
-- Confidentiality + access model (locked in build-order step 1):
--   * The cockpit holds real client data. All DB access runs
--     server-side with the service_role key (createServiceClient).
--   * The app authenticates with Clerk, NOT Supabase Auth — so
--     anon / authenticated roles are unused. Both are revoked
--     (along with PUBLIC); RLS policies are scoped TO service_role.
--   * Every cockpit row carries owner_user_id (the Clerk user id);
--     the server layer filters on it on every query, and a
--     composite FK forces a child's owner to match its parent's.
--
-- Idempotent — re-applying is safe (the cockpit tables are in the
-- drop list below, so a re-run cleanly recreates them).
-- ============================================================

-- ------------------------------------------------------------
-- 1. Drop the legacy product AND the cockpit tables. CASCADE
--    removes dependent policies, indexes, and foreign keys.
--    Including the four cockpit tables here makes the migration
--    genuinely idempotent — DROP IF EXISTS is a no-op on first run.
-- ------------------------------------------------------------
DROP TABLE IF EXISTS public.constraints            CASCADE;
DROP TABLE IF EXISTS public.documents              CASCADE;
DROP TABLE IF EXISTS public.briefs                 CASCADE;

DROP TABLE IF EXISTS public.approval_events        CASCADE;
DROP TABLE IF EXISTS public.pending_invitations    CASCADE;
DROP TABLE IF EXISTS public.mcp_tokens             CASCADE;
DROP TABLE IF EXISTS public.audit_companion        CASCADE;
DROP TABLE IF EXISTS public.audits                 CASCADE;
DROP TABLE IF EXISTS public.network_catalog_entries CASCADE;
DROP TABLE IF EXISTS public.status_reports         CASCADE;
DROP TABLE IF EXISTS public.cadence_tokens         CASCADE;
DROP TABLE IF EXISTS public.selections             CASCADE;
DROP TABLE IF EXISTS public.initiative_tokens      CASCADE;
DROP TABLE IF EXISTS public.initiatives            CASCADE;
DROP TABLE IF EXISTS public.agent_logs             CASCADE;
DROP TABLE IF EXISTS public.decisions              CASCADE;
DROP TABLE IF EXISTS public.roadmaps               CASCADE;
DROP TABLE IF EXISTS public.divergence_points      CASCADE;
DROP TABLE IF EXISTS public.assessment_synthesis   CASCADE;
DROP TABLE IF EXISTS public.module_scores          CASCADE;
DROP TABLE IF EXISTS public.assessments            CASCADE;
DROP TABLE IF EXISTS public.stakeholders           CASCADE;
DROP TABLE IF EXISTS public.playbook_chunks        CASCADE;
DROP TABLE IF EXISTS public.action_cards           CASCADE;
DROP TABLE IF EXISTS public.conversations          CASCADE;
DROP TABLE IF EXISTS public.practitioner_clients   CASCADE;
DROP TABLE IF EXISTS public.practitioners          CASCADE;
DROP TABLE IF EXISTS public.organizations          CASCADE;

-- ------------------------------------------------------------
-- 2. The cockpit tables. One initiative has many briefs (versioned),
--    documents, and constraints.
--
--   initiatives ──┬──< briefs       (append-only; version per initiative)
--                 ├──< documents    (ingested sources; text only)
--                 └──< constraints  (the PM's non-negotiables)
--
--   Child tables reference (id, owner_user_id) via a composite FK,
--   so a child can never be owned by a different user than its
--   parent initiative — owner isolation enforced at the DB.
-- ------------------------------------------------------------

CREATE TABLE public.initiatives (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id   text NOT NULL,                       -- Clerk user id
  name            text NOT NULL,
  initiative_type text,                                -- crm|erp|data|security|infra|other
  stage           text NOT NULL DEFAULT 'frame',       -- frame|discover|decide|source|plan
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (id, owner_user_id)                           -- FK target for owner-consistency
);

-- Append-only, versioned. Each extraction inserts a new row; prior
-- versions are kept and power "what changed since last review".
CREATE TABLE public.briefs (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  initiative_id  uuid NOT NULL,
  owner_user_id  text NOT NULL,
  version        integer NOT NULL,
  body           jsonb NOT NULL,                       -- the full CDIOBrief JSON
  cold_open      text NOT NULL DEFAULT '',             -- the one-line surprise
  gate           text NOT NULL DEFAULT 'clarify',      -- continue|clarify|intervene
  status         text NOT NULL DEFAULT 'complete',     -- complete|partial
  created_at     timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (initiative_id, owner_user_id)
    REFERENCES public.initiatives (id, owner_user_id) ON DELETE CASCADE,
  UNIQUE (initiative_id, version)
);

-- Parsed on upload; we store the extracted text, not the raw bytes.
CREATE TABLE public.documents (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  initiative_id  uuid NOT NULL,
  owner_user_id  text NOT NULL,
  filename       text NOT NULL,
  sha256         text NOT NULL,
  extracted_text text NOT NULL DEFAULT '',
  parse_ok       boolean NOT NULL DEFAULT true,
  parse_note     text,                                 -- why a parse failed / what was skipped
  created_at     timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (initiative_id, owner_user_id)
    REFERENCES public.initiatives (id, owner_user_id) ON DELETE CASCADE
);

CREATE TABLE public.constraints (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  initiative_id  uuid NOT NULL,
  owner_user_id  text NOT NULL,
  kind           text NOT NULL,                        -- budget|deadline|must_integrate|cannot_touch|other
  label          text NOT NULL,
  value          text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (initiative_id, owner_user_id)
    REFERENCES public.initiatives (id, owner_user_id) ON DELETE CASCADE
);

CREATE INDEX initiatives_owner_idx     ON public.initiatives (owner_user_id);
CREATE INDEX briefs_initiative_idx     ON public.briefs (initiative_id, version DESC);
CREATE INDEX documents_initiative_idx  ON public.documents (initiative_id);
CREATE INDEX constraints_initiative_idx ON public.constraints (initiative_id);

-- ------------------------------------------------------------
-- 3. Lock down access. anon, authenticated, and PUBLIC get
--    nothing; the server's service_role is the only DB role.
--    RLS is on as defense-in-depth (service_role has BYPASSRLS,
--    so app behaviour is unchanged — this only closes the
--    anon / public path).
-- ------------------------------------------------------------
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['initiatives','briefs','documents','constraints'] LOOP
    EXECUTE format('REVOKE ALL PRIVILEGES ON public.%I FROM PUBLIC', t);
    EXECUTE format('REVOKE ALL PRIVILEGES ON public.%I FROM anon', t);
    EXECUTE format('REVOKE ALL PRIVILEGES ON public.%I FROM authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_service_only', t);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR ALL TO service_role USING (true) WITH CHECK (true)',
      t || '_service_only', t);
  END LOOP;
END $$;
