-- ============================================================
-- AI-CDIO — schema-v21 (2026-05-20): organizations.status
--
-- Adds a workflow-state column so the practitioner can archive a
-- client (and restore it later) without losing the engagement
-- history. Orthogonal to is_sandbox (test-data flag); a single org
-- can be archived + sandbox or archived + real.
--
-- Default is 'active' so every pre-existing org rows in as active.
-- Real-client hard-delete remains blocked at the API + RPC layers
-- (see src/app/api/clients/[orgId]/route.ts DELETE and
-- delete_sandbox_org()). Archive is the safe alternative for
-- "get this off my portfolio list" without destroying data.
--
-- No index added — Year 1 portfolios are <50 clients per
-- practitioner; a status filter at this size has negligible cost
-- without an index. Revisit if portfolios cross ~500 clients.
--
-- Idempotent: ADD COLUMN IF NOT EXISTS mirrors schema-v5's
-- is_sandbox pattern; the CHECK constraint is drop+re-add so a
-- re-run never trips on prior state.
-- ============================================================

ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active';

ALTER TABLE public.organizations
  DROP CONSTRAINT IF EXISTS organizations_status_check;

ALTER TABLE public.organizations
  ADD CONSTRAINT organizations_status_check
  CHECK (status IN ('active', 'archived'));

COMMENT ON COLUMN public.organizations.status IS
  'Workflow state. Default ''active''. ''archived'' = hidden from default portfolio view but assessments/decisions/initiatives stay accessible read-only. Restore by setting back to ''active''. Real-client hard-delete is still sandbox-only; archive is the non-destructive alternative.';
