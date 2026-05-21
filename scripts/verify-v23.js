// One-shot verification script for schema-v23.
// Confirms: new tables exist, new columns exist with correct defaults,
// constraints are in place, indexes created, GRANTs restricted as planned.
// Run: node scripts/verify-v23.js
//
// Read-only; no mutations.

const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

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

const checks = [
  {
    label: "practitioner_clients role check includes 'operator'",
    sql: `select pg_get_constraintdef(c.oid) as def
            from pg_constraint c
            join pg_class t on t.oid = c.conrelid
           where t.relname = 'practitioner_clients'
             and c.conname = 'practitioner_clients_role_check'`,
    expect: (rows) => rows.length === 1 && /'operator'/.test(rows[0].def),
  },
  {
    label: "practitioner_clients has invited_by/invited_at/accepted_at",
    sql: `select column_name from information_schema.columns
           where table_schema='public' and table_name='practitioner_clients'
             and column_name in ('invited_by_practitioner_id','invited_at','accepted_at')`,
    expect: (rows) => rows.length === 3,
  },
  {
    label: "pending_invitations table exists with expected columns",
    sql: `select column_name, data_type, is_nullable, column_default
            from information_schema.columns
           where table_schema='public' and table_name='pending_invitations'
           order by ordinal_position`,
    expect: (rows) => {
      const names = rows.map((r) => r.column_name);
      return ["id","created_at","org_id","invited_by_practitioner_id","email","role","clerk_invitation_id","accepted_at","revoked_at","expires_at"].every((c) => names.includes(c));
    },
  },
  {
    label: "pending_invitations role check excludes 'owner'",
    sql: `select pg_get_constraintdef(c.oid) as def
            from pg_constraint c
            join pg_class t on t.oid = c.conrelid
           where t.relname='pending_invitations' and c.contype='c'
             and pg_get_constraintdef(c.oid) like '%role%'`,
    expect: (rows) => rows.some((r) => /'operator'/.test(r.def) && !/'owner'/.test(r.def)),
  },
  {
    label: "pending_invitations email-lowercase check exists",
    sql: `select pg_get_constraintdef(c.oid) as def
            from pg_constraint c
            join pg_class t on t.oid = c.conrelid
           where t.relname='pending_invitations'
             and c.conname='pending_invitations_email_lowercase'`,
    expect: (rows) => rows.length === 1 && /lower/.test(rows[0].def),
  },
  {
    label: "approval_status column added to all 4 artifact tables",
    sql: `select table_name from information_schema.columns
           where table_schema='public'
             and column_name='approval_status'
             and table_name in ('initiatives','status_reports','selections','audits')`,
    expect: (rows) => rows.length === 4,
  },
  {
    label: "approval_status default is 'approved' on all 4 tables",
    sql: `select table_name, column_default from information_schema.columns
           where table_schema='public'
             and column_name='approval_status'
             and table_name in ('initiatives','status_reports','selections','audits')`,
    expect: (rows) => rows.length === 4 && rows.every((r) => /approved/.test(r.column_default || "")),
  },
  {
    label: "submitted_by/submitted_at/approved_by/approved_at on all 4 tables",
    sql: `select table_name, count(*)::int as n from information_schema.columns
           where table_schema='public'
             and table_name in ('initiatives','status_reports','selections','audits')
             and column_name in ('submitted_by_practitioner_id','submitted_at','approved_by_practitioner_id','approved_at')
           group by table_name`,
    expect: (rows) => rows.length === 4 && rows.every((r) => r.n === 4),
  },
  {
    label: "approval_status partial indexes exist on all 4 tables",
    sql: `select indexname from pg_indexes where schemaname='public'
             and indexname in ('initiatives_approval_status_idx','status_reports_approval_status_idx','selections_approval_status_idx','audits_approval_status_idx')`,
    expect: (rows) => rows.length === 4,
  },
  {
    label: "approval_events table exists",
    sql: `select 1 from information_schema.tables
           where table_schema='public' and table_name='approval_events'`,
    expect: (rows) => rows.length === 1,
  },
  {
    label: "approval_events GRANT is SELECT + INSERT only for service_role",
    sql: `select privilege_type from information_schema.role_table_grants
           where table_schema='public' and table_name='approval_events' and grantee='service_role'
           order by privilege_type`,
    expect: (rows) => {
      const privs = rows.map((r) => r.privilege_type).sort();
      return privs.length === 2 && privs[0] === "INSERT" && privs[1] === "SELECT";
    },
  },
  {
    label: "pending_invitations + approval_events have RLS enabled",
    sql: `select relname from pg_class
           where relname in ('pending_invitations','approval_events') and relrowsecurity = true`,
    expect: (rows) => rows.length === 2,
  },
  {
    label: "existing artifact rows are approval_status='approved' (sanity check)",
    sql: `select 'initiatives' as t, count(*)::int as n, coalesce(sum(case when approval_status='approved' then 1 else 0 end), 0)::int as ok from public.initiatives
          union all
          select 'status_reports', count(*)::int, coalesce(sum(case when approval_status='approved' then 1 else 0 end), 0)::int from public.status_reports
          union all
          select 'selections', count(*)::int, coalesce(sum(case when approval_status='approved' then 1 else 0 end), 0)::int from public.selections
          union all
          select 'audits', count(*)::int, coalesce(sum(case when approval_status='approved' then 1 else 0 end), 0)::int from public.audits`,
    expect: (rows) => rows.every((r) => r.n === r.ok),
  },
];

async function main() {
  loadEnv();
  const cfg = buildClientConfig();
  if (!cfg) { console.error("missing DB creds"); process.exit(1); }
  const client = new Client(cfg);
  await client.connect();
  let pass = 0, fail = 0;
  for (const c of checks) {
    try {
      const r = await client.query(c.sql);
      const ok = c.expect(r.rows);
      console.log(`${ok ? "✓" : "✗"} ${c.label}`);
      if (!ok) {
        console.log("    rows:", JSON.stringify(r.rows));
        fail++;
      } else { pass++; }
    } catch (e) {
      console.log(`✗ ${c.label}\n    error: ${e.message}`);
      fail++;
    }
  }
  await client.end();
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail === 0 ? 0 : 2);
}

main().catch((e) => { console.error(e); process.exit(2); });
