-- ============================================================
-- AI-CDIO — Schema v5: Sandbox flag for safe testing
-- Adds organizations.is_sandbox so the practitioner can mix real
-- engagement data and dummy test clients without confusion.
-- Idempotent — safe to re-run.
-- ============================================================

alter table organizations
  add column if not exists is_sandbox boolean not null default false;

-- Helper index for the future "List sandbox clients" filter
create index if not exists idx_organizations_is_sandbox
  on organizations(is_sandbox)
  where is_sandbox = true;

-- Comment so a future reader understands intent
comment on column organizations.is_sandbox is
  'Marks a client as sandbox/test data. Sandbox-flagged clients can have their assessment data wiped via /api/clients/[orgId]/reset-assessment. Real clients cannot. UI shows a Sandbox badge.';
