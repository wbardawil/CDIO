-- ============================================================
-- AI-CDIO — schema-v24 (2026-05-21) — 5-role model + Coach Mode substrate
--
-- Amendment to schema-v23 (S1 foundation #8 ec42353) honoring the
-- session handoff's §4 5-role model + §5 approval_events shape that
-- S1 shipped without:
--
--   1. Rename role 'owner' → 'strategic_approver' on practitioner_clients;
--      add 'technical_reviewer' + 'financial_approver' as new values.
--   2. Add 'technical_reviewer' + 'financial_approver' to pending_invitations.
--      (owner was already not invitable per cso C3; strategic_approver
--      stays not-invitable for the same reason — strategic_approver is the
--      org's primary CDIO, established via createOrg bootstrap.)
--   3. Add actor_role text + prior_version jsonb to approval_events.
--      These are the columns Phase D Coach Mode needs to diff CDIO edits
--      against operator submissions. Coach Mode without prior_version
--      means another schema migration mid-Phase D + zero historic data
--      for engagements that ran on S1.
--   4. Add 'rejected' to approval_status check on all 4 artifact tables.
--      Hard reject is a state the S1 vocabulary was missing.
--
-- The submitter role (handoff §4) is NOT in this enum — submitters don't
-- have practitioners rows. Submitter is token-based, mirrors the Cadence
-- token pattern, lands in Phase E with the Demand Catalog.
--
-- collaborator + viewer are RETAINED as advisory values for legacy + a
-- read-only-sharing case. They predate the 5-role design (schema-v4)
-- and removing them would force a forward-incompatible migration before
-- any rolling deploy.
--
-- Backwards compatibility: the only data change is the UPDATE that
-- migrates 'owner' → 'strategic_approver'. Idempotent — UPDATE no-ops on
-- re-run because no rows match 'owner' the second time.
--
-- Coach Mode data limitations:
--   - actor_role is added nullable so the existing v23-shipped rows
--     don't violate. Task #19 backfills them from the actor's CURRENT
--     role on the org (good enough for the small founder-test set; not
--     historically accurate if a user has switched role since the event).
--   - prior_version is nullable forever; old events have no artifact
--     snapshot to recover. Phase D Coach Mode must handle NULL gracefully.
--
-- Idempotent — safe to re-run.
-- ============================================================

-- ---------- 1. practitioner_clients role enum widened + 'owner' migrated ----------
-- Drop the constraint, migrate data, recreate with widened enum.
ALTER TABLE public.practitioner_clients
  DROP CONSTRAINT IF EXISTS practitioner_clients_role_check;

-- Data migration: rename role 'owner' → 'strategic_approver'.
-- Idempotent — second run sees no rows where role = 'owner'.
UPDATE public.practitioner_clients
   SET role = 'strategic_approver'
 WHERE role = 'owner';

ALTER TABLE public.practitioner_clients
  ADD CONSTRAINT practitioner_clients_role_check
  CHECK (role IN (
    'strategic_approver',
    'technical_reviewer',
    'financial_approver',
    'operator',
    'collaborator',
    'viewer'
  ));

-- Also update the default. New rows that don't specify a role default to
-- strategic_approver (the most common case — primary CDIO on a new org).
ALTER TABLE public.practitioner_clients
  ALTER COLUMN role SET DEFAULT 'strategic_approver';

-- ---------- 2. pending_invitations role enum widened ----------
-- strategic_approver intentionally absent: a CDIO does not invite another
-- CDIO; the bootstrap path is createOrg, not invitation. (cso C3 / §4.)
ALTER TABLE public.pending_invitations
  DROP CONSTRAINT IF EXISTS pending_invitations_role_check;

ALTER TABLE public.pending_invitations
  ADD CONSTRAINT pending_invitations_role_check
  CHECK (role IN (
    'technical_reviewer',
    'financial_approver',
    'operator',
    'collaborator',
    'viewer'
  ));

-- ---------- 3. approval_events gets actor_role + prior_version ----------
ALTER TABLE public.approval_events
  ADD COLUMN IF NOT EXISTS actor_role text;

ALTER TABLE public.approval_events
  ADD COLUMN IF NOT EXISTS prior_version jsonb;

-- actor_role check: must be one of the values from practitioner_clients
-- role enum. Nullable until backfill (Task #19) populates the historic
-- rows; the NOT NULL is left for a future migration once we trust the
-- backfill is complete and steady-state inserts always populate it.
ALTER TABLE public.approval_events
  DROP CONSTRAINT IF EXISTS approval_events_actor_role_check;
ALTER TABLE public.approval_events
  ADD CONSTRAINT approval_events_actor_role_check
  CHECK (
    actor_role IS NULL
    OR actor_role IN (
      'strategic_approver',
      'technical_reviewer',
      'financial_approver',
      'operator',
      'collaborator',
      'viewer'
    )
  );

COMMENT ON COLUMN public.approval_events.actor_role IS
  'The role the actor was acting under when the event fired. With the 5-role model (handoff §4), one user may hold multiple roles in Year 1+ — recording the role explicitly is the audit-trail invariant. Phase D Coach Mode uses this to differentiate "CDIO approved" from "operator self-edited".';

COMMENT ON COLUMN public.approval_events.prior_version IS
  'Full JSON snapshot of the artifact at the moment of the decision. Phase D Coach Mode diffs current artifact state against prior_version to surface "what the CDIO changed". NULL for events written before schema-v24.';

-- ---------- 4. Add 'rejected' to approval_status on 4 artifact tables ----------
-- 'rejected' is the terminal-no state from handoff §5. S1 shipped only
-- (draft, pending, approved, returned); 'rejected' was missing.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['initiatives', 'status_reports', 'selections', 'audits'] LOOP
    -- The constraint name was auto-generated by S1's DO-block. Discover
    -- it by querying pg_constraint to avoid hardcoding a potentially-
    -- different generated name.
    EXECUTE format(
      'ALTER TABLE public.%I
         DROP CONSTRAINT IF EXISTS %I_approval_status_check',
      t, t);

    -- Some auto-gen names look like <table>_approval_status_check1 if
    -- the original DDL got re-run with a different name. Cast a slightly
    -- wider net.
    PERFORM 1 FROM pg_constraint c
     JOIN pg_class cl ON cl.oid = c.conrelid
     WHERE cl.relname = t AND c.conname LIKE '%approval_status%';

    EXECUTE format(
      'ALTER TABLE public.%I
         ADD CONSTRAINT %I_approval_status_check
         CHECK (approval_status IN (%L, %L, %L, %L, %L))',
      t, t, 'draft', 'pending', 'approved', 'returned', 'rejected');
  END LOOP;
END $$;
