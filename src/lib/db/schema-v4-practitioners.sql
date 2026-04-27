-- ============================================================
-- AI-CDIO — Schema v4: Practitioner Workspace
-- Adds multi-tenant ownership: practitioners → orgs (N:N)
-- Idempotent — safe to re-run.
-- ============================================================

-- ---------- DROP STALE COLUMN ----------
-- clerk_org_id was reserved for "client also has Clerk account" — abandoned.
-- Clients use stakeholder token links, not Clerk accounts.
alter table organizations
  drop column if exists clerk_org_id;

-- ---------- PRACTITIONERS ----------
create table if not exists practitioners (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text unique not null,
  name text,
  email text,
  plan text not null default 'starter'
    check (plan in ('starter', 'growth', 'scale')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_practitioners_clerk
  on practitioners(clerk_user_id);

-- ---------- PRACTITIONER ↔ CLIENT MAPPING (N:N) ----------
create table if not exists practitioner_clients (
  practitioner_id uuid not null references practitioners(id) on delete cascade,
  org_id uuid not null references organizations(id) on delete cascade,
  role text not null default 'owner'
    check (role in ('owner', 'collaborator', 'viewer')),
  created_at timestamptz not null default now(),
  primary key (practitioner_id, org_id)
);

create index if not exists idx_practitioner_clients_practitioner
  on practitioner_clients(practitioner_id);
create index if not exists idx_practitioner_clients_org
  on practitioner_clients(org_id);

-- ---------- ACTIVE MODULES PER CLIENT ----------
-- Subset of the 16 modules in scope for THIS engagement.
-- Empty default = practitioner picks during kickoff (UI nudges from industry+size defaults).
alter table organizations
  add column if not exists active_modules integer[] not null default '{}';

-- ---------- TABLE GRANTS ----------
-- Tables created via raw `pg` connection don't get Supabase's automatic
-- role grants. Service role needs full access; authenticated reads only
-- (enforced further by RLS once Day 8 lands).
grant all on practitioners to service_role;
grant all on practitioner_clients to service_role;
grant select on practitioners to authenticated;
grant select on practitioner_clients to authenticated;
grant usage on schema public to service_role, authenticated;

-- ---------- ENABLE RLS ----------
alter table practitioners enable row level security;
alter table practitioner_clients enable row level security;

-- ---------- RLS POLICIES ----------
-- ⚠ DOCUMENTATION OF INTENT, NOT ACTIVE PROTECTION ⚠
-- These policies reference auth.jwt() ->> 'sub', which only resolves
-- when the request carries a Clerk JWT issued via Supabase's JWT template.
-- Today we use the service-role client in every API route, which BYPASSES
-- RLS entirely. Ownership is enforced exclusively by
-- src/lib/auth/assert-owns-org.ts at the application layer.
-- These policies activate on Day 8 (P0-8 in docs/GAPS.md) when we move
-- to a per-request Supabase client. Do not rely on them as a security
-- boundary until then.

-- Drop+recreate so the file is idempotent
drop policy if exists "Practitioners read own row" on practitioners;
create policy "Practitioners read own row" on practitioners
  for select using (clerk_user_id = (auth.jwt() ->> 'sub'));

drop policy if exists "Practitioners update own row" on practitioners;
create policy "Practitioners update own row" on practitioners
  for update using (clerk_user_id = (auth.jwt() ->> 'sub'));

drop policy if exists "Practitioners read own client mappings" on practitioner_clients;
create policy "Practitioners read own client mappings" on practitioner_clients
  for select using (
    practitioner_id in (
      select id from practitioners where clerk_user_id = (auth.jwt() ->> 'sub')
    )
  );

drop policy if exists "Practitioners read their orgs" on organizations;
create policy "Practitioners read their orgs" on organizations
  for select using (
    id in (
      select pc.org_id from practitioner_clients pc
      join practitioners p on p.id = pc.practitioner_id
      where p.clerk_user_id = (auth.jwt() ->> 'sub')
    )
  );

-- ---------- TRIGGER ----------
drop trigger if exists practitioners_updated_at on practitioners;
create trigger practitioners_updated_at
  before update on practitioners
  for each row execute function update_updated_at();
