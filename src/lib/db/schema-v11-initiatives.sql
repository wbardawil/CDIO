-- ============================================================
-- AI-CDIO — schema-v11 (Phase 1D Day 22-23)
--
-- Initiative Pilot. Captures the practitioner's in-flight work
-- per client - title, goal, domain, owner, milestones (steps),
-- status. Foundation for the 90-Day Commitment Matrix Day 45/60
-- deliverables (Initiative #1 launched, Initiative #2 launched).
--
-- Steps are stored as a jsonb array on initiatives (denormalized)
-- because they are always read together with the parent and a
-- separate steps table would force two queries per page render
-- without buying anything at the SMB-engagement scale we target.
--
-- Magic-link tokens for non-Clerk participants (vendors,
-- contractors, internal team members who shouldn't get a paid
-- seat) are recorded in initiative_tokens. UI for the vendor-side
-- /init/[token] view lands in a follow-up; the token plumbing is
-- here today so the schema is stable.
--
-- Idempotent - re-applying is safe.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.initiatives (
  id              uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      timestamptz   NOT NULL DEFAULT now(),
  updated_at      timestamptz   NOT NULL DEFAULT now(),

  org_id          uuid          NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  practitioner_id uuid          NOT NULL REFERENCES public.practitioners(id) ON DELETE RESTRICT,

  title           text          NOT NULL,
  goal            text          NOT NULL,

  -- Domain stays a free text rather than enum so a new initiative
  -- type (data, change-mgmt, etc.) can land without a migration.
  -- The UI surfaces a curated set: tech | ai | security |
  -- process | data | other.
  domain          text          NOT NULL DEFAULT 'tech',

  -- Optional link to a maturity-assessment module the initiative
  -- is intended to advance.
  module_number   int           NULL,

  -- Owner inside the client org. Free text so the client doesn't
  -- have to model the team in our database; the practitioner
  -- writes the name/email as it appears in the client's org chart.
  owner_name      text          NULL,
  owner_email     text          NULL,

  status          text          NOT NULL DEFAULT 'active'
                                CHECK (status IN ('active', 'blocked', 'done', 'cancelled')),

  target_completion_date  date  NULL,
  completed_at            timestamptz NULL,

  -- Steps as ordered jsonb array. Each entry:
  --   { id: uuid, position: int, title: text, description: text|null,
  --     status: 'todo'|'in_progress'|'done'|'blocked',
  --     assignee_name: text|null, assignee_email: text|null,
  --     due_date: date|null, completed_at: timestamptz|null,
  --     notes: text|null }
  steps           jsonb         NOT NULL DEFAULT '[]'::jsonb,

  -- Free-form notes the practitioner keeps about the initiative.
  -- Not surfaced to magic-link participants.
  practitioner_notes text       NULL
);

-- Reconcile a pre-existing initiatives table (older/partial
-- migration) to the target shape before the indexes/trigger below
-- reference these columns. ADD COLUMN IF NOT EXISTS is idempotent:
-- no-op on the freshly created table above, the fix on an older one.
ALTER TABLE public.initiatives ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.initiatives ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.initiatives ADD COLUMN IF NOT EXISTS org_id uuid;
ALTER TABLE public.initiatives ADD COLUMN IF NOT EXISTS practitioner_id uuid;
ALTER TABLE public.initiatives ADD COLUMN IF NOT EXISTS title text;
ALTER TABLE public.initiatives ADD COLUMN IF NOT EXISTS goal text;
ALTER TABLE public.initiatives ADD COLUMN IF NOT EXISTS domain text NOT NULL DEFAULT 'tech';
ALTER TABLE public.initiatives ADD COLUMN IF NOT EXISTS module_number int;
ALTER TABLE public.initiatives ADD COLUMN IF NOT EXISTS owner_name text;
ALTER TABLE public.initiatives ADD COLUMN IF NOT EXISTS owner_email text;
ALTER TABLE public.initiatives ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active';
ALTER TABLE public.initiatives ADD COLUMN IF NOT EXISTS target_completion_date date;
ALTER TABLE public.initiatives ADD COLUMN IF NOT EXISTS completed_at timestamptz;
ALTER TABLE public.initiatives ADD COLUMN IF NOT EXISTS steps jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.initiatives ADD COLUMN IF NOT EXISTS practitioner_notes text;

CREATE INDEX IF NOT EXISTS initiatives_org_id_idx
  ON public.initiatives(org_id, created_at DESC);

CREATE INDEX IF NOT EXISTS initiatives_practitioner_id_idx
  ON public.initiatives(practitioner_id, created_at DESC);

CREATE INDEX IF NOT EXISTS initiatives_status_idx
  ON public.initiatives(org_id, status, target_completion_date);

-- updated_at trigger
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

-- Magic-link tokens for non-Clerk participants.
CREATE TABLE IF NOT EXISTS public.initiative_tokens (
  id              uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      timestamptz   NOT NULL DEFAULT now(),

  initiative_id   uuid          NOT NULL REFERENCES public.initiatives(id) ON DELETE CASCADE,

  token           text          UNIQUE NOT NULL,

  participant_name  text        NOT NULL,
  participant_email text        NULL,

  -- view_only: vendor sees the steps assigned to them and the
  --   initiative goal; cannot mutate
  -- view_and_update: vendor can mark their assigned steps as
  --   in_progress / done and add a note
  scope           text          NOT NULL DEFAULT 'view_and_update'
                                CHECK (scope IN ('view_only', 'view_and_update')),

  expires_at      timestamptz   NULL,
  revoked_at      timestamptz   NULL,
  last_used_at    timestamptz   NULL
);

-- Same reconciliation for a pre-existing initiative_tokens table.
ALTER TABLE public.initiative_tokens ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.initiative_tokens ADD COLUMN IF NOT EXISTS initiative_id uuid;
ALTER TABLE public.initiative_tokens ADD COLUMN IF NOT EXISTS token text;
ALTER TABLE public.initiative_tokens ADD COLUMN IF NOT EXISTS participant_name text;
ALTER TABLE public.initiative_tokens ADD COLUMN IF NOT EXISTS participant_email text;
ALTER TABLE public.initiative_tokens ADD COLUMN IF NOT EXISTS scope text NOT NULL DEFAULT 'view_and_update';
ALTER TABLE public.initiative_tokens ADD COLUMN IF NOT EXISTS expires_at timestamptz;
ALTER TABLE public.initiative_tokens ADD COLUMN IF NOT EXISTS revoked_at timestamptz;
ALTER TABLE public.initiative_tokens ADD COLUMN IF NOT EXISTS last_used_at timestamptz;

CREATE INDEX IF NOT EXISTS initiative_tokens_initiative_id_idx
  ON public.initiative_tokens(initiative_id);

ALTER TABLE public.initiatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.initiative_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS initiatives_service_full_access ON public.initiatives;
CREATE POLICY initiatives_service_full_access
  ON public.initiatives FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS initiative_tokens_service_full_access ON public.initiative_tokens;
CREATE POLICY initiative_tokens_service_full_access
  ON public.initiative_tokens FOR ALL USING (true) WITH CHECK (true);
