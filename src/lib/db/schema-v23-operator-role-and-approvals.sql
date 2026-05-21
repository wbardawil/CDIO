-- ============================================================
-- AI-CDIO — schema-v23 (2026-05-20) — Operator role + invitations + approval workflow
--
-- Sprint S1 of the journey-map workstream. Foundation layer that turns
-- AI-CDIO from a single-CDIO tool into a CDIO + operator team:
--   - Adds 'operator' to the practitioner_clients role enum
--   - Adds invitation provenance + an email-keyed pending_invitations table
--   - Adds approval workflow columns to 4 operator-submittable artifacts
--     (initiatives, status_reports, selections, audits)
--   - Adds an append-only approval_events audit stream
--
-- The companion sprint-S1-foundation.md doc captures the eng + cso
-- review findings that shaped this migration (15 + 13 findings).
--
-- Backwards compatibility:
--   - approval_status defaults to 'approved' so every existing row
--     (all CDIO-authored to date) becomes 'approved' with no backfill.
--   - The role check constraint widens from 3 values to 4; no existing
--     row violates the new constraint.
--   - All other adds are nullable.
--
-- Security posture (from /cso findings):
--   C1 — pickup MUST require Clerk verified email (enforced in app layer)
--   C2 — email lowercased end-to-end; DB CHECK enforces it
--   C3 — invitable roles exclude 'owner' (DB CHECK enforces it)
--   C10 — approval_events GRANT is select+insert only (append-only by privilege)
--
-- Mirrors v18 lockdown: service_role full, anon/authenticated none.
--
-- Idempotent — safe to re-run.
-- ============================================================

-- ---------- 1. WIDEN ROLE ENUM ----------
-- Existing rows are all in ('owner','collaborator','viewer'); widening
-- the constraint cannot violate any of them.
ALTER TABLE public.practitioner_clients
  DROP CONSTRAINT IF EXISTS practitioner_clients_role_check;
ALTER TABLE public.practitioner_clients
  ADD CONSTRAINT practitioner_clients_role_check
  CHECK (role IN ('owner', 'collaborator', 'viewer', 'operator'));

-- ---------- 2. INVITATION PROVENANCE ON MEMBERSHIP ----------
ALTER TABLE public.practitioner_clients
  ADD COLUMN IF NOT EXISTS invited_by_practitioner_id uuid
    REFERENCES public.practitioners(id) ON DELETE SET NULL;
ALTER TABLE public.practitioner_clients
  ADD COLUMN IF NOT EXISTS invited_at timestamptz;
ALTER TABLE public.practitioner_clients
  ADD COLUMN IF NOT EXISTS accepted_at timestamptz;

-- ---------- 3. PENDING INVITATIONS ----------
-- Email-keyed, single-use, expires in 30 days. Clerk delivers the email;
-- this table is the durable record + the pickup lookup at first sign-in.
CREATE TABLE IF NOT EXISTS public.pending_invitations (
  id                            uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at                    timestamptz   NOT NULL DEFAULT now(),

  org_id                        uuid          NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  invited_by_practitioner_id    uuid          NOT NULL REFERENCES public.practitioners(id) ON DELETE RESTRICT,

  -- Always lowercased. Pickup matches with lower() too; defense in depth.
  email                         text          NOT NULL,

  -- Owner is NOT an invitable role (a CDIO does not invite another owner).
  -- Enforced at the API layer too; this is defense in depth.
  role                          text          NOT NULL
                                CHECK (role IN ('collaborator', 'viewer', 'operator')),

  -- Clerk's invitation id, for revoke + dedup. Null if Clerk invite
  -- creation failed (e.g. user already exists in Clerk) and we fell
  -- back to local-only invitation (the user picks it up on next sign-in).
  clerk_invitation_id           text,

  accepted_at                   timestamptz,
  revoked_at                    timestamptz,
  expires_at                    timestamptz   NOT NULL DEFAULT (now() + interval '30 days'),

  -- Email canonicalization (C2). Hard-fail any direct insert that
  -- skips the app-layer lowercase.
  CONSTRAINT pending_invitations_email_lowercase
    CHECK (email = lower(email)),

  -- One pending invite per (org, email, role). Re-inviting the same triple
  -- means the app explicitly overwrites or extends.
  UNIQUE (org_id, email, role)
);

-- Hot path: pickup query at first sign-in matches by email.
CREATE INDEX IF NOT EXISTS pending_invitations_email_open_idx
  ON public.pending_invitations(email)
  WHERE accepted_at IS NULL AND revoked_at IS NULL;

CREATE INDEX IF NOT EXISTS pending_invitations_org_idx
  ON public.pending_invitations(org_id, created_at DESC);

-- ---------- 4. APPROVAL COLUMNS ON ARTIFACT TABLES ----------
-- Same columns added to 4 tables: initiatives, status_reports, selections,
-- audits. Each becomes approval-aware. Default 'approved' so existing rows
-- (all CDIO-authored) are unchanged.
--
-- DO-block iterates so we don't repeat the same 5 ADD COLUMN statements
-- four times. Idempotent: ADD COLUMN IF NOT EXISTS, CREATE INDEX IF NOT EXISTS.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['initiatives', 'status_reports', 'selections', 'audits'] LOOP
    EXECUTE format(
      'ALTER TABLE public.%I
         ADD COLUMN IF NOT EXISTS approval_status text NOT NULL DEFAULT %L
           CHECK (approval_status IN (%L, %L, %L, %L))',
      t, 'approved', 'draft', 'pending', 'approved', 'returned');

    EXECUTE format(
      'ALTER TABLE public.%I
         ADD COLUMN IF NOT EXISTS submitted_by_practitioner_id uuid
           REFERENCES public.practitioners(id) ON DELETE SET NULL',
      t);

    EXECUTE format(
      'ALTER TABLE public.%I
         ADD COLUMN IF NOT EXISTS submitted_at timestamptz',
      t);

    EXECUTE format(
      'ALTER TABLE public.%I
         ADD COLUMN IF NOT EXISTS approved_by_practitioner_id uuid
           REFERENCES public.practitioners(id) ON DELETE SET NULL',
      t);

    EXECUTE format(
      'ALTER TABLE public.%I
         ADD COLUMN IF NOT EXISTS approved_at timestamptz',
      t);

    -- Partial index for inbox queries: only non-approved rows are
    -- interesting for the operator + owner inboxes.
    EXECUTE format(
      'CREATE INDEX IF NOT EXISTS %I
         ON public.%I (org_id, approval_status, submitted_by_practitioner_id)
         WHERE approval_status IN (%L, %L, %L)',
      t || '_approval_status_idx', t, 'draft', 'pending', 'returned');
  END LOOP;
END $$;

-- ---------- 5. APPROVAL EVENTS (append-only audit) ----------
-- Polymorphic artifact reference by (artifact_type, artifact_id). No FK
-- on artifact_id by design — events are immutable history; an artifact
-- delete should not retroactively rewrite history. Org cascade handles
-- the common cleanup path.
CREATE TABLE IF NOT EXISTS public.approval_events (
  id                       uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at               timestamptz   NOT NULL DEFAULT now(),

  org_id                   uuid          NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  artifact_type            text          NOT NULL
                                         CHECK (artifact_type IN ('initiative', 'status_report', 'selection', 'audit')),
  artifact_id              uuid          NOT NULL,

  event_type               text          NOT NULL
                                         CHECK (event_type IN ('submitted', 'approved', 'approved_with_edits', 'returned', 'withdrawn')),

  actor_practitioner_id    uuid          NOT NULL REFERENCES public.practitioners(id) ON DELETE RESTRICT,

  -- Free-form payload. For 'returned': { comment }. For
  -- 'approved_with_edits': { diff }. For others: {}.
  payload                  jsonb         NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS approval_events_artifact_idx
  ON public.approval_events(artifact_type, artifact_id, created_at DESC);

CREATE INDEX IF NOT EXISTS approval_events_org_idx
  ON public.approval_events(org_id, created_at DESC);

-- ---------- 6. RLS + GRANTS (mirror v18 lockdown) ----------
ALTER TABLE public.pending_invitations  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_events      ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS pending_invitations_service_full_access ON public.pending_invitations;
CREATE POLICY pending_invitations_service_full_access
  ON public.pending_invitations FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- approval_events: append-only by privilege (C10). service_role only.
-- No update / delete grants — the app layer also never updates/deletes.
DROP POLICY IF EXISTS approval_events_service_read_insert ON public.approval_events;
CREATE POLICY approval_events_service_read_insert
  ON public.approval_events FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Table-level GRANTs. v18 default privileges already revoke anon +
-- authenticated, but we GRANT explicitly to service_role for clarity.
GRANT ALL ON public.pending_invitations TO service_role;

-- C10: approval_events is select + insert only at the privilege layer.
-- service_role has BYPASSRLS so update/delete on this table would still
-- succeed if granted; revoke them explicitly + grant only select/insert.
REVOKE ALL ON public.approval_events FROM service_role;
GRANT SELECT, INSERT ON public.approval_events TO service_role;

-- ---------- 7. COMMENTS ----------
COMMENT ON TABLE public.pending_invitations IS
  'Email-keyed, single-use invitations for adding a person (operator / collaborator / viewer) to a client org. Clerk delivers the email; this table is the durable record + pickup lookup at first sign-in. owner role is intentionally not invitable here.';

COMMENT ON COLUMN public.pending_invitations.email IS
  'Lowercased invitee email. CHECK constraint enforces lowercase to prevent case-folded mismatch at pickup (cso C2).';

COMMENT ON COLUMN public.pending_invitations.clerk_invitation_id IS
  'Clerk invitation id, used for revoke + dedup. Null when Clerk invite creation failed (e.g. user already exists in Clerk) and we fell back to local-only invitation; the user picks it up on next sign-in.';

COMMENT ON TABLE public.approval_events IS
  'Append-only audit stream for the operator → CDIO approval round-trip. Polymorphic by (artifact_type, artifact_id). Privilege-locked to SELECT + INSERT only (cso C10) — the app never updates or deletes.';

COMMENT ON COLUMN public.practitioner_clients.invited_by_practitioner_id IS
  'The owner-role practitioner who sent the invitation. Null for owner rows (self-bootstrapped via ensurePractitioner) and pre-S1 rows.';
