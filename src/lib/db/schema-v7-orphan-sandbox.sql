-- ============================================================
-- AI-CDIO — Schema v7: Orphan-org auto-sandbox + sandbox-only
-- hard-delete RPC. The Test/Real architectural primitive.
--
-- 1. Any organization that has no practitioner_clients mapping
--    (an "orphan") is treated as test data. We flip is_sandbox=true
--    AND assign it to the sole practitioner so it appears in their
--    portfolio. This is the auto-categorization rule from the Day 7
--    plan: orphans are sandbox by definition.
--
--    The auto-mapping step is ONLY safe when exactly one practitioner
--    exists (early-Phase-1 reality). If the table has 0 or >1
--    practitioners we skip the mapping and just flip the flag, so
--    the founder can manually triage.
--
-- 2. delete_sandbox_org(uuid) — hard-deletes a sandbox-flagged org
--    and every dependent row in a single transaction. Refuses
--    (raises exception) when is_sandbox=false. Caller is the
--    DELETE /api/clients/[orgId] endpoint, which also enforces
--    practitioner ownership.
--
-- Idempotent — safe to re-run.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Auto-flip orphan orgs to sandbox + map to sole practitioner
-- ------------------------------------------------------------

-- Step 1a: flip is_sandbox=true on every org that has no mapping.
-- This is unconditional — if you don't own it, it's not real.
update organizations
set is_sandbox = true
where id not in (
  select org_id from practitioner_clients
)
and is_sandbox = false;

-- Step 1b: if exactly one practitioner exists, assign the orphans to them.
-- We use a DO block so the count check is dynamic.
do $$
declare
  practitioner_count int;
  sole_practitioner_id uuid;
begin
  select count(*) into practitioner_count from practitioners;
  if practitioner_count = 1 then
    select id into sole_practitioner_id from practitioners limit 1;
    insert into practitioner_clients (practitioner_id, org_id, role)
    select sole_practitioner_id, o.id, 'owner'
    from organizations o
    where o.id not in (select org_id from practitioner_clients)
    on conflict do nothing;
    raise notice 'Mapped orphan orgs to sole practitioner %', sole_practitioner_id;
  else
    raise notice 'Skipped orphan-org auto-mapping: practitioner count = %', practitioner_count;
  end if;
end
$$;

-- ------------------------------------------------------------
-- 2. Sandbox-only hard-delete RPC
-- ------------------------------------------------------------

create or replace function delete_sandbox_org(p_org_id uuid)
returns table (table_name text, rows_deleted bigint)
language plpgsql
as $$
declare
  v_is_sandbox boolean;
  v_org_name text;
  v_count bigint;
begin
  -- Lock the row + verify sandbox flag
  select is_sandbox, name into v_is_sandbox, v_org_name
  from organizations
  where id = p_org_id
  for update;

  if v_org_name is null then
    raise exception 'Organization % not found', p_org_id
      using errcode = 'P0002';
  end if;

  if not v_is_sandbox then
    raise exception 'delete_sandbox_org refused: org % is not sandbox-flagged', v_org_name
      using errcode = 'P0001';
  end if;

  -- Delete in dependency order. Each delete returns its own count.
  -- All dependent FKs reference org_id directly OR via assessment_id.

  delete from module_scores
  where assessment_id in (select id from assessments where org_id = p_org_id);
  get diagnostics v_count = row_count;
  table_name := 'module_scores'; rows_deleted := v_count; return next;

  delete from assessment_synthesis
  where assessment_id in (select id from assessments where org_id = p_org_id);
  get diagnostics v_count = row_count;
  table_name := 'assessment_synthesis'; rows_deleted := v_count; return next;

  delete from divergence_points
  where assessment_id in (select id from assessments where org_id = p_org_id);
  get diagnostics v_count = row_count;
  table_name := 'divergence_points'; rows_deleted := v_count; return next;

  delete from roadmaps where org_id = p_org_id;
  get diagnostics v_count = row_count;
  table_name := 'roadmaps'; rows_deleted := v_count; return next;

  delete from assessments where org_id = p_org_id;
  get diagnostics v_count = row_count;
  table_name := 'assessments'; rows_deleted := v_count; return next;

  delete from stakeholders where org_id = p_org_id;
  get diagnostics v_count = row_count;
  table_name := 'stakeholders'; rows_deleted := v_count; return next;

  -- Optional tables (may not exist on every install — wrap in checks)
  begin
    delete from action_cards where org_id = p_org_id;
    get diagnostics v_count = row_count;
    table_name := 'action_cards'; rows_deleted := v_count; return next;
  exception when undefined_table then null;
  end;

  begin
    delete from conversations where org_id = p_org_id;
    get diagnostics v_count = row_count;
    table_name := 'conversations'; rows_deleted := v_count; return next;
  exception when undefined_table then null;
  end;

  begin
    delete from agent_logs where org_id = p_org_id;
    get diagnostics v_count = row_count;
    table_name := 'agent_logs'; rows_deleted := v_count; return next;
  exception when undefined_table then null;
  end;

  delete from practitioner_clients where org_id = p_org_id;
  get diagnostics v_count = row_count;
  table_name := 'practitioner_clients'; rows_deleted := v_count; return next;

  delete from organizations where id = p_org_id;
  get diagnostics v_count = row_count;
  table_name := 'organizations'; rows_deleted := v_count; return next;

  return;
end;
$$;

comment on function delete_sandbox_org(uuid) is
  'Hard-deletes a sandbox-flagged organization and all dependent rows in a single transaction. Refuses when is_sandbox=false. Called by DELETE /api/clients/[orgId]. The route also enforces practitioner ownership before invoking.';
