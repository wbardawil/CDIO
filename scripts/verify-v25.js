// Verification script for schema-v25 (substrate correctness).
// Runs the §7 verification matrix scenarios from
// docs/sprint-S2-substrate-fix.md that are scripted (1, 2, 3, 4, 5, 7)
// plus structural checks on the 5 RPC functions + event_type CHECK.
//
// Creates a throwaway test org + practitioner + artifacts at script
// start; cleans up at end via ON DELETE CASCADE from organizations.
// Re-runnable: cleanup tagged by a SCRIPT_ID prefix on the org name.
//
// Run: node scripts/verify-v25.js

const { Client } = require("pg");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const SCRIPT_ID = "verify-v25-" + Date.now();

function loadEnv() {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, "utf-8");
  for (const line of content.split(/\r?\n/)) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
}

function buildClientConfig() {
  const host = process.env.SUPABASE_DB_HOST;
  const password = process.env.SUPABASE_DB_PASSWORD;
  if (host && password) {
    return {
      host,
      port: parseInt(process.env.SUPABASE_DB_PORT || "6543", 10),
      user: process.env.SUPABASE_DB_USER || "postgres",
      password,
      database: process.env.SUPABASE_DB_NAME || "postgres",
      ssl: { rejectUnauthorized: false },
    };
  }
  const raw = process.env.DATABASE_URL;
  if (!raw) return null;
  try {
    new URL(raw);
    return { connectionString: raw, ssl: { rejectUnauthorized: false } };
  } catch {
    const m = raw.match(/^(?:postgres(?:ql)?:\/\/)([^:]+):(.*)@((?:aws-[^\/]+|db\.[^\/]+|[a-z0-9.-]+\.supabase\.[a-z]+))(?::(\d+))?\/([a-zA-Z0-9_-]+)\s*$/);
    if (!m) return null;
    const [, user, pw, h, port, database] = m;
    return { host: h, port: parseInt(port || "6543", 10), user, password: pw, database, ssl: { rejectUnauthorized: false } };
  }
}

// ============================================================
// Structural checks (no test data needed)
// ============================================================
const structuralChecks = [
  {
    label: "approval_events.event_type CHECK includes 'rejected'",
    sql: `select pg_get_constraintdef(c.oid) as def
            from pg_constraint c join pg_class t on t.oid = c.conrelid
           where t.relname='approval_events'
             and c.conname='approval_events_event_type_check'`,
    expect: (rows) =>
      rows.length === 1 &&
      /'rejected'/.test(rows[0].def) &&
      /'submitted'/.test(rows[0].def) &&
      /'approved'/.test(rows[0].def) &&
      /'approved_with_edits'/.test(rows[0].def) &&
      /'returned'/.test(rows[0].def) &&
      /'withdrawn'/.test(rows[0].def),
  },
  {
    label: "5 RPC functions exist with correct names",
    sql: `select proname from pg_proc
           where pronamespace = 'public'::regnamespace
             and proname in (
               'apply_artifact_submit',
               'apply_artifact_withdraw',
               'apply_artifact_approve',
               'apply_artifact_return',
               'apply_artifact_reject'
             )
           order by proname`,
    expect: (rows) => rows.length === 5,
  },
  {
    label: "All 5 RPCs are SECURITY DEFINER (codex X2)",
    sql: `select proname, prosecdef from pg_proc
           where pronamespace = 'public'::regnamespace
             and proname like 'apply_artifact_%'`,
    expect: (rows) => rows.length >= 5 && rows.every((r) => r.prosecdef === true),
  },
  {
    label: "All 5 RPCs have search_path = public, pg_temp set (codex X2)",
    sql: `select proname, proconfig from pg_proc
           where pronamespace = 'public'::regnamespace
             and proname like 'apply_artifact_%'`,
    expect: (rows) =>
      rows.length >= 5 &&
      rows.every((r) =>
        Array.isArray(r.proconfig) &&
        r.proconfig.some((c) => /^search_path=/.test(c) && /public/.test(c) && /pg_temp/.test(c))
      ),
  },
  {
    label: "PUBLIC has no EXECUTE on any apply_artifact_* (codex X2)",
    // pg_proc.proacl is an aclitem[] of explicit grants. grantee=0 means
    // PUBLIC. We REVOKEd EXECUTE FROM PUBLIC + GRANTed TO service_role in
    // schema-v25, so proacl is non-null and excludes any PUBLIC EXECUTE.
    // (has_function_privilege('PUBLIC', ...) doesn't work — 'PUBLIC' there
    // is parsed as a literal role name, not the PUBLIC keyword.)
    sql: `select p.proname,
                 p.proacl is null as proacl_is_default,
                 exists (
                   select 1 from aclexplode(p.proacl) acl
                    where acl.grantee = 0 and acl.privilege_type = 'EXECUTE'
                 ) as public_has_execute
            from pg_proc p
           where pronamespace = 'public'::regnamespace
             and proname like 'apply_artifact_%'`,
    expect: (rows) =>
      rows.length >= 5 &&
      rows.every((r) => r.proacl_is_default === false && r.public_has_execute === false),
  },
  {
    label: "service_role HAS EXECUTE on all apply_artifact_* (codex X2)",
    sql: `select p.proname, has_function_privilege('service_role', p.oid, 'EXECUTE') as svc_can
            from pg_proc p
           where pronamespace='public'::regnamespace
             and proname like 'apply_artifact_%'`,
    expect: (rows) => rows.length >= 5 && rows.every((r) => r.svc_can === true),
  },
];

// ============================================================
// Scenario tests (require throwaway test data)
// ============================================================
async function setupTestFixtures(client) {
  // 1. Create test org tagged with SCRIPT_ID.
  //    organizations required columns per schema.sql: name, size_category
  //    (CHECK), employee_count, industry (CHECK). clerk_org_id is defined
  //    in source but may not be migrated on live DBs that pre-date Clerk
  //    Orgs adoption — don't depend on it for test fixtures.
  const orgRes = await client.query(
    `INSERT INTO public.organizations
       (name, size_category, employee_count, industry)
     VALUES ($1, 'small', 10, 'technology')
     RETURNING id`,
    [`${SCRIPT_ID}-org`],
  );
  const orgId = orgRes.rows[0].id;

  // 2. Create test practitioner.
  //    practitioners columns per schema-v4: clerk_user_id, name, email, plan.
  const pracRes = await client.query(
    `INSERT INTO public.practitioners (clerk_user_id, email)
     VALUES ($1, $2)
     RETURNING id`,
    [`${SCRIPT_ID}-clerk`, `${SCRIPT_ID}@test.invalid`],
  );
  const practitionerId = pracRes.rows[0].id;

  // 3. Assign strategic_approver role on the test org.
  await client.query(
    `INSERT INTO public.practitioner_clients (practitioner_id, org_id, role)
     VALUES ($1, $2, 'strategic_approver')`,
    [practitionerId, orgId],
  );

  return { orgId, practitionerId };
}

async function createTestInitiative(client, orgId, practitionerId, status = "draft") {
  const r = await client.query(
    `INSERT INTO public.initiatives
       (org_id, practitioner_id, title, goal, domain, approval_status)
     VALUES ($1, $2, $3, $4, 'tech', $5)
     RETURNING id`,
    [orgId, practitionerId, `${SCRIPT_ID}-initiative-${crypto.randomUUID().slice(0, 8)}`, "verify-v25 test", status],
  );
  return r.rows[0].id;
}

async function cleanupFixtures(client, orgId) {
  if (!orgId) return;
  // ON DELETE CASCADE on practitioner_clients + initiatives + approval_events (via org).
  // approval_events has no FK on artifact_id (polymorphic) so deletes the org row, the
  // events stay (append-only audit). Clean those up explicitly tagged by org.
  await client.query(`DELETE FROM public.approval_events WHERE org_id = $1`, [orgId]);
  await client.query(`DELETE FROM public.organizations WHERE id = $1`, [orgId]);
  // Practitioner has no org FK, clean by clerk_user_id tag.
  await client.query(
    `DELETE FROM public.practitioners WHERE clerk_user_id = $1`,
    [`${SCRIPT_ID}-clerk`],
  );
}

// ----- Scenario 1: prior_version PRE-mutation -----
async function scenario1_priorVersionPreMutation(client, fixtures) {
  const initId = await createTestInitiative(client, fixtures.orgId, fixtures.practitionerId, "draft");

  // The artifact starts as draft. Submit it.
  const submitRes = await client.query(
    `SELECT public.apply_artifact_submit(
       'initiative', $1::uuid, 'draft', $2::uuid, 'strategic_approver', '{}'::jsonb
     ) AS result`,
    [initId, fixtures.practitionerId],
  );
  const result = submitRes.rows[0].result;
  if (!result.ok) return { ok: false, why: `submit failed: ${JSON.stringify(result)}` };

  // Read the most-recent submitted event for this artifact.
  const evRes = await client.query(
    `SELECT prior_version, event_type FROM public.approval_events
      WHERE artifact_id = $1 AND event_type = 'submitted'
      ORDER BY created_at DESC LIMIT 1`,
    [initId],
  );
  if (evRes.rows.length !== 1) return { ok: false, why: "no submitted event found" };

  const prior = evRes.rows[0].prior_version;
  // prior_version was captured BEFORE the UPDATE → approval_status in the
  // snapshot should be 'draft', NOT 'pending'.
  if (prior.approval_status !== "draft") {
    return { ok: false, why: `prior_version.approval_status was '${prior.approval_status}', expected 'draft'` };
  }
  return { ok: true };
}

// ----- Scenarios 2/3/4: race conditions -----
async function raceTwoCalls(client1, client2, opA, opB) {
  const [r1, r2] = await Promise.all([
    client1.query(`SELECT $1::jsonb AS r`, [JSON.stringify({})]).then(() => client1.query(opA.sql, opA.params)),
    client2.query(`SELECT $1::jsonb AS r`, [JSON.stringify({})]).then(() => client2.query(opB.sql, opB.params)),
  ]);
  return [r1.rows[0].result, r2.rows[0].result];
}

async function scenario2_raceApproveApprove(adminClient, c1, c2, fixtures) {
  const initId = await createTestInitiative(adminClient, fixtures.orgId, fixtures.practitionerId, "draft");
  // Get to pending first.
  await adminClient.query(
    `SELECT public.apply_artifact_submit('initiative', $1::uuid, 'draft', $2::uuid, 'strategic_approver', '{}'::jsonb) AS result`,
    [initId, fixtures.practitionerId],
  );

  const op = {
    sql: `SELECT public.apply_artifact_approve('initiative', $1::uuid, 'pending', $2::uuid, 'strategic_approver', '{}'::jsonb, NULL) AS result`,
    params: [initId, fixtures.practitionerId],
  };
  const [r1, r2] = await raceTwoCalls(c1, c2, op, op);

  const oks = [r1, r2].filter((r) => r.ok === true);
  const stales = [r1, r2].filter((r) => r.ok === false && r.code === "stale_state");
  if (oks.length !== 1 || stales.length !== 1) {
    return { ok: false, why: `approve-vs-approve race expected 1 ok + 1 stale; got: ${JSON.stringify([r1, r2])}` };
  }
  // Verify final state matches the winner + event count is exactly 2
  // (submitted + approved). Loser must not have logged an event.
  const stateRes = await adminClient.query(
    `SELECT approval_status FROM public.initiatives WHERE id = $1`,
    [initId],
  );
  if (stateRes.rows[0].approval_status !== "approved") {
    return { ok: false, why: `final state expected 'approved'; got '${stateRes.rows[0].approval_status}'` };
  }
  const evRes = await adminClient.query(
    `SELECT event_type FROM public.approval_events WHERE artifact_id = $1 ORDER BY created_at`,
    [initId],
  );
  if (evRes.rows.length !== 2 || evRes.rows[0].event_type !== "submitted" || evRes.rows[1].event_type !== "approved") {
    return { ok: false, why: `expected exactly [submitted, approved] events; got: ${JSON.stringify(evRes.rows)}` };
  }
  // Stale call's reported current_status should equal 'approved' (the winner moved it).
  const staleCurrent = stales[0].current_status;
  if (staleCurrent !== "approved") {
    return { ok: false, why: `stale call's current_status expected 'approved'; got '${staleCurrent}'` };
  }
  return { ok: true };
}

async function scenario3_raceApproveReturn(adminClient, c1, c2, fixtures) {
  const initId = await createTestInitiative(adminClient, fixtures.orgId, fixtures.practitionerId, "draft");
  await adminClient.query(
    `SELECT public.apply_artifact_submit('initiative', $1::uuid, 'draft', $2::uuid, 'strategic_approver', '{}'::jsonb) AS result`,
    [initId, fixtures.practitionerId],
  );

  const approveOp = {
    sql: `SELECT public.apply_artifact_approve('initiative', $1::uuid, 'pending', $2::uuid, 'strategic_approver', '{}'::jsonb, NULL) AS result`,
    params: [initId, fixtures.practitionerId],
  };
  const returnOp = {
    sql: `SELECT public.apply_artifact_return('initiative', $1::uuid, 'pending', $2::uuid, 'strategic_approver', '{"comment":"race-test"}'::jsonb) AS result`,
    params: [initId, fixtures.practitionerId],
  };
  const [r1, r2] = await raceTwoCalls(c1, c2, approveOp, returnOp);

  const oks = [r1, r2].filter((r) => r.ok === true);
  const stales = [r1, r2].filter((r) => r.ok === false && r.code === "stale_state");
  if (oks.length !== 1 || stales.length !== 1) {
    return { ok: false, why: `approve-vs-return race expected 1 ok + 1 stale; got: ${JSON.stringify([r1, r2])}` };
  }
  // Final artifact state must match the winner's new_status.
  const winnerStatus = oks[0].new_status;
  const stateRes = await adminClient.query(
    `SELECT approval_status FROM public.initiatives WHERE id = $1`,
    [initId],
  );
  if (stateRes.rows[0].approval_status !== winnerStatus) {
    return { ok: false, why: `final state '${stateRes.rows[0].approval_status}' != winner.new_status '${winnerStatus}'` };
  }
  // Events: submitted + winner's terminal event. Loser logs nothing.
  const evRes = await adminClient.query(
    `SELECT event_type FROM public.approval_events WHERE artifact_id = $1 ORDER BY created_at`,
    [initId],
  );
  const expectedSecond = winnerStatus === "approved" ? "approved" : "returned";
  if (evRes.rows.length !== 2 || evRes.rows[1].event_type !== expectedSecond) {
    return { ok: false, why: `expected events [submitted, ${expectedSecond}]; got: ${JSON.stringify(evRes.rows)}` };
  }
  return { ok: true };
}

async function scenario4_raceApproveWithdraw(adminClient, c1, c2, fixtures) {
  const initId = await createTestInitiative(adminClient, fixtures.orgId, fixtures.practitionerId, "draft");
  await adminClient.query(
    `SELECT public.apply_artifact_submit('initiative', $1::uuid, 'draft', $2::uuid, 'strategic_approver', '{}'::jsonb) AS result`,
    [initId, fixtures.practitionerId],
  );

  const approveOp = {
    sql: `SELECT public.apply_artifact_approve('initiative', $1::uuid, 'pending', $2::uuid, 'strategic_approver', '{}'::jsonb, NULL) AS result`,
    params: [initId, fixtures.practitionerId],
  };
  const withdrawOp = {
    sql: `SELECT public.apply_artifact_withdraw('initiative', $1::uuid, 'pending', $2::uuid, 'strategic_approver', '{}'::jsonb) AS result`,
    params: [initId, fixtures.practitionerId],
  };
  const [r1, r2] = await raceTwoCalls(c1, c2, approveOp, withdrawOp);

  const oks = [r1, r2].filter((r) => r.ok === true);
  const stales = [r1, r2].filter((r) => r.ok === false && r.code === "stale_state");
  if (oks.length !== 1 || stales.length !== 1) {
    return { ok: false, why: `approve-vs-withdraw race expected 1 ok + 1 stale; got: ${JSON.stringify([r1, r2])}` };
  }
  const winnerStatus = oks[0].new_status;
  const stateRes = await adminClient.query(
    `SELECT approval_status FROM public.initiatives WHERE id = $1`,
    [initId],
  );
  if (stateRes.rows[0].approval_status !== winnerStatus) {
    return { ok: false, why: `final state '${stateRes.rows[0].approval_status}' != winner.new_status '${winnerStatus}'` };
  }
  const evRes = await adminClient.query(
    `SELECT event_type FROM public.approval_events WHERE artifact_id = $1 ORDER BY created_at`,
    [initId],
  );
  const expectedSecond = winnerStatus === "approved" ? "approved" : "withdrawn";
  if (evRes.rows.length !== 2 || evRes.rows[1].event_type !== expectedSecond) {
    return { ok: false, why: `expected events [submitted, ${expectedSecond}]; got: ${JSON.stringify(evRes.rows)}` };
  }
  return { ok: true };
}

// ----- Scenario 5: event-insert rollback via temporary CHECK constraint -----
async function scenario5_eventRollback(client, fixtures) {
  const initId = await createTestInitiative(client, fixtures.orgId, fixtures.practitionerId, "draft");
  await client.query(
    `SELECT public.apply_artifact_submit('initiative', $1::uuid, 'draft', $2::uuid, 'strategic_approver', '{}'::jsonb) AS result`,
    [initId, fixtures.practitionerId],
  );

  // Temporarily replace the event_type CHECK so 'approved' is no longer
  // allowed. The next approve call's INSERT into approval_events will
  // violate the CHECK → the subtransaction rolls back → the artifact's
  // approval_status stays 'pending'.
  //
  // NOT VALID is essential: the live approval_events table already has
  // real 'approved' rows from prior runs. A non-NOT-VALID narrowed CHECK
  // would fail at ADD-time because it validates existing rows. NOT VALID
  // applies the new constraint to inserts going forward (which is exactly
  // what we want for this test) and skips the existing-rows scan.
  //
  // The entire constraint-swap lives inside try/finally so any failure
  // (the narrow ADD, the test query, anything) still restores the full
  // constraint and leaves the DB in a healthy state.
  let resultRow;
  let swappedIn = false;
  try {
    await client.query(`ALTER TABLE public.approval_events DROP CONSTRAINT approval_events_event_type_check`);
    await client.query(
      `ALTER TABLE public.approval_events
         ADD CONSTRAINT approval_events_event_type_check
         CHECK (event_type IN ('submitted', 'returned', 'withdrawn', 'rejected'))
         NOT VALID`,
    );
    swappedIn = true;

    const r = await client.query(
      `SELECT public.apply_artifact_approve('initiative', $1::uuid, 'pending', $2::uuid, 'strategic_approver', '{}'::jsonb, NULL) AS result`,
      [initId, fixtures.practitionerId],
    );
    resultRow = r.rows[0].result;
  } finally {
    // Restore the original constraint regardless of pass/fail. If we
    // already swapped in the narrowed one, drop it first; otherwise
    // we hit the failure before the swap and only need to ensure the
    // full constraint exists.
    if (swappedIn) {
      await client.query(`ALTER TABLE public.approval_events DROP CONSTRAINT IF EXISTS approval_events_event_type_check`);
    } else {
      // The DROP succeeded but the narrow ADD failed — no constraint exists right now.
      await client.query(`ALTER TABLE public.approval_events DROP CONSTRAINT IF EXISTS approval_events_event_type_check`);
    }
    await client.query(
      `ALTER TABLE public.approval_events
         ADD CONSTRAINT approval_events_event_type_check
         CHECK (event_type IN ('submitted', 'approved', 'approved_with_edits', 'returned', 'withdrawn', 'rejected'))`,
    );
  }

  if (resultRow.ok !== false || resultRow.code !== "internal") {
    return { ok: false, why: `expected {ok:false, code:"internal"}, got: ${JSON.stringify(resultRow)}` };
  }
  // current_status must reflect what was in the DB at lock time (= 'pending').
  // Per the matrix: client must see the failure scoped to the row's pre-call state.
  if (resultRow.current_status !== "pending") {
    return { ok: false, why: `expected current_status='pending', got '${resultRow.current_status}'` };
  }
  // message must be NULL (codex X13 — no raw PG error to client).
  if (resultRow.message !== null) {
    return { ok: false, why: `expected message=null (info-leak fix), got: ${JSON.stringify(resultRow.message)}` };
  }
  // Verify the artifact's state is STILL 'pending' (rollback worked).
  const stateRes = await client.query(
    `SELECT approval_status FROM public.initiatives WHERE id = $1`,
    [initId],
  );
  if (stateRes.rows[0].approval_status !== "pending") {
    return { ok: false, why: `expected approval_status='pending' after rollback, got '${stateRes.rows[0].approval_status}'` };
  }
  // Verify no 'approved' event was logged for this artifact.
  const evCheck = await client.query(
    `SELECT count(*)::int AS n FROM public.approval_events
      WHERE artifact_id = $1 AND event_type = 'approved'`,
    [initId],
  );
  if (evCheck.rows[0].n !== 0) {
    return { ok: false, why: `event row leaked despite rollback (n=${evCheck.rows[0].n})` };
  }
  return { ok: true };
}

// ----- Scenario 6: reject end-to-end (codex P1 #7) -----
async function scenario6_rejectEndToEnd(client, fixtures) {
  const initId = await createTestInitiative(client, fixtures.orgId, fixtures.practitionerId, "draft");
  await client.query(
    `SELECT public.apply_artifact_submit('initiative', $1::uuid, 'draft', $2::uuid, 'strategic_approver', '{}'::jsonb) AS result`,
    [initId, fixtures.practitionerId],
  );
  const r = await client.query(
    `SELECT public.apply_artifact_reject('initiative', $1::uuid, 'pending', $2::uuid, 'strategic_approver', '{"comment":"no go"}'::jsonb) AS result`,
    [initId, fixtures.practitionerId],
  );
  const result = r.rows[0].result;
  if (!result.ok || result.new_status !== "rejected") {
    return { ok: false, why: `expected ok:true new_status:rejected; got: ${JSON.stringify(result)}` };
  }
  // Verify state + event_type 'rejected' (proves the CHECK constraint was widened).
  const stateRes = await client.query(
    `SELECT approval_status FROM public.initiatives WHERE id = $1`,
    [initId],
  );
  if (stateRes.rows[0].approval_status !== "rejected") {
    return { ok: false, why: `expected state='rejected'; got '${stateRes.rows[0].approval_status}'` };
  }
  const evRes = await client.query(
    `SELECT event_type, payload FROM public.approval_events
      WHERE artifact_id = $1 ORDER BY created_at`,
    [initId],
  );
  if (evRes.rows.length !== 2 || evRes.rows[1].event_type !== "rejected") {
    return { ok: false, why: `expected events [submitted, rejected]; got: ${JSON.stringify(evRes.rows)}` };
  }
  if (evRes.rows[1].payload?.comment !== "no go") {
    return { ok: false, why: `reject event payload missing/wrong comment; got: ${JSON.stringify(evRes.rows[1].payload)}` };
  }
  // Attempt to submit again — should fail with stale_state (rejected is terminal).
  const r2 = await client.query(
    `SELECT public.apply_artifact_submit('initiative', $1::uuid, 'rejected', $2::uuid, 'strategic_approver', '{}'::jsonb) AS result`,
    [initId, fixtures.practitionerId],
  );
  const r2result = r2.rows[0].result;
  // submit's legal-transition guard refuses 'rejected' as p_expected_status → internal.
  if (r2result.ok !== false || r2result.code !== "internal") {
    return { ok: false, why: `expected re-submit-from-rejected to fail with code:internal; got: ${JSON.stringify(r2result)}` };
  }
  return { ok: true };
}

// ----- Scenario 7: legal-transition guard -----
async function scenario7_legalTransitionGuard(client, fixtures) {
  const initId = await createTestInitiative(client, fixtures.orgId, fixtures.practitionerId, "draft");

  // Call apply_artifact_approve with expected_status='draft' — illegal
  // (approve only accepts pending → approved). The guard should refuse
  // with code='internal' before reading the row.
  const r = await client.query(
    `SELECT public.apply_artifact_approve('initiative', $1::uuid, 'draft', $2::uuid, 'strategic_approver', '{}'::jsonb, NULL) AS result`,
    [initId, fixtures.practitionerId],
  );
  const result = r.rows[0].result;
  if (result.ok !== false || result.code !== "internal") {
    return { ok: false, why: `expected guard refusal {ok:false, code:"internal"}, got: ${JSON.stringify(result)}` };
  }
  // Verify artifact state still 'draft'.
  const stateRes = await client.query(
    `SELECT approval_status FROM public.initiatives WHERE id = $1`,
    [initId],
  );
  if (stateRes.rows[0].approval_status !== "draft") {
    return { ok: false, why: `guard let the UPDATE through; state is '${stateRes.rows[0].approval_status}'` };
  }
  return { ok: true };
}

// ============================================================
// Main
// ============================================================
async function main() {
  loadEnv();
  const cfg = buildClientConfig();
  if (!cfg) {
    console.error("missing DB creds (DATABASE_URL or SUPABASE_DB_*)");
    process.exit(1);
  }

  const admin = new Client(cfg);
  await admin.connect();

  let pass = 0, fail = 0;
  let fixtures = null;
  const failures = [];

  try {
    // -------- structural checks --------
    for (const c of structuralChecks) {
      try {
        const r = await admin.query(c.sql);
        const ok = c.expect(r.rows);
        console.log(`${ok ? "✓" : "✗"} ${c.label}`);
        if (!ok) {
          failures.push({ label: c.label, rows: r.rows });
          fail++;
        } else {
          pass++;
        }
      } catch (e) {
        console.log(`✗ ${c.label}\n    error: ${e.message}`);
        failures.push({ label: c.label, error: e.message });
        fail++;
      }
    }

    // -------- scenario tests --------
    fixtures = await setupTestFixtures(admin);

    const sceneClients = [new Client(cfg), new Client(cfg)];
    await Promise.all(sceneClients.map((c) => c.connect()));

    const scenarios = [
      { label: "scenario 1: prior_version PRE-mutation (codex #4)", run: () => scenario1_priorVersionPreMutation(admin, fixtures) },
      { label: "scenario 2: race approve-vs-approve (codex #5)", run: () => scenario2_raceApproveApprove(admin, sceneClients[0], sceneClients[1], fixtures) },
      { label: "scenario 3: race approve-vs-return (codex X10)", run: () => scenario3_raceApproveReturn(admin, sceneClients[0], sceneClients[1], fixtures) },
      { label: "scenario 4: race approve-vs-withdraw (codex X10)", run: () => scenario4_raceApproveWithdraw(admin, sceneClients[0], sceneClients[1], fixtures) },
      { label: "scenario 5: event-insert rollback (codex #6 + X11)", run: () => scenario5_eventRollback(admin, fixtures) },
      { label: "scenario 6: reject end-to-end (codex #7)", run: () => scenario6_rejectEndToEnd(admin, fixtures) },
      { label: "scenario 7: legal-transition guard (codex X4)", run: () => scenario7_legalTransitionGuard(admin, fixtures) },
    ];

    for (const s of scenarios) {
      try {
        const res = await s.run();
        if (res.ok) {
          console.log(`✓ ${s.label}`);
          pass++;
        } else {
          console.log(`✗ ${s.label}\n    ${res.why}`);
          failures.push({ label: s.label, why: res.why });
          fail++;
        }
      } catch (e) {
        console.log(`✗ ${s.label}\n    threw: ${e.message}`);
        failures.push({ label: s.label, error: e.message });
        fail++;
      }
    }

    await Promise.all(sceneClients.map((c) => c.end()));
  } finally {
    // Always clean up.
    try { await cleanupFixtures(admin, fixtures?.orgId); } catch (e) { console.warn("cleanup warning:", e.message); }
    await admin.end();
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  if (fail > 0) {
    console.log("\nFailure detail:");
    for (const f of failures) console.log("  -", JSON.stringify(f));
  }
  process.exit(fail === 0 ? 0 : 2);
}

main().catch((e) => { console.error(e); process.exit(2); });
