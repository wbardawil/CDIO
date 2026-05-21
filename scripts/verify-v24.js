// Verification script for schema-v24.
// Confirms: 5-role model widened, owner rows migrated, approval_events
// has actor_role + prior_version, rejected added to approval_status enum.
// Run: node scripts/verify-v24.js

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
    label: "practitioner_clients role check includes all 6 new + legacy values",
    sql: `select pg_get_constraintdef(c.oid) as def
            from pg_constraint c join pg_class t on t.oid = c.conrelid
           where t.relname = 'practitioner_clients'
             and c.conname = 'practitioner_clients_role_check'`,
    expect: (rows) =>
      rows.length === 1 &&
      ["strategic_approver","technical_reviewer","financial_approver","operator","collaborator","viewer"]
        .every((v) => new RegExp(`'${v}'`).test(rows[0].def)),
  },
  {
    label: "no practitioner_clients rows still carry 'owner'",
    sql: `select count(*)::int as n from public.practitioner_clients where role = 'owner'`,
    expect: (rows) => rows[0].n === 0,
  },
  {
    label: "practitioner_clients role default is 'strategic_approver'",
    sql: `select column_default from information_schema.columns
           where table_schema='public' and table_name='practitioner_clients' and column_name='role'`,
    expect: (rows) => rows.length === 1 && /strategic_approver/.test(rows[0].column_default || ""),
  },
  {
    label: "pending_invitations role check excludes 'owner' AND 'strategic_approver' (neither invitable)",
    sql: `select pg_get_constraintdef(c.oid) as def
            from pg_constraint c join pg_class t on t.oid = c.conrelid
           where t.relname = 'pending_invitations'
             and c.conname = 'pending_invitations_role_check'`,
    expect: (rows) =>
      rows.length === 1 &&
      !/'owner'/.test(rows[0].def) &&
      !/'strategic_approver'/.test(rows[0].def) &&
      /'technical_reviewer'/.test(rows[0].def) &&
      /'financial_approver'/.test(rows[0].def) &&
      /'operator'/.test(rows[0].def),
  },
  {
    label: "approval_events has actor_role column (nullable)",
    sql: `select is_nullable from information_schema.columns
           where table_schema='public' and table_name='approval_events' and column_name='actor_role'`,
    expect: (rows) => rows.length === 1 && rows[0].is_nullable === "YES",
  },
  {
    label: "approval_events has prior_version column (jsonb)",
    sql: `select data_type from information_schema.columns
           where table_schema='public' and table_name='approval_events' and column_name='prior_version'`,
    expect: (rows) => rows.length === 1 && rows[0].data_type === "jsonb",
  },
  {
    label: "approval_events actor_role check allows null + 6 values",
    sql: `select pg_get_constraintdef(c.oid) as def
            from pg_constraint c join pg_class t on t.oid = c.conrelid
           where t.relname='approval_events' and c.conname='approval_events_actor_role_check'`,
    expect: (rows) =>
      rows.length === 1 &&
      /IS NULL/i.test(rows[0].def) &&
      ["strategic_approver","technical_reviewer","financial_approver","operator","collaborator","viewer"]
        .every((v) => new RegExp(`'${v}'`).test(rows[0].def)),
  },
  {
    label: "approval_status enum includes 'rejected' on all 4 artifact tables",
    sql: `select cl.relname as t, pg_get_constraintdef(c.oid) as def
            from pg_constraint c join pg_class cl on cl.oid = c.conrelid
           where cl.relname in ('initiatives','status_reports','selections','audits')
             and c.conname like '%approval_status%'`,
    expect: (rows) => rows.length === 4 && rows.every((r) => /'rejected'/.test(r.def)),
  },
  {
    label: "approval_events GRANT is still SELECT + INSERT only (cso C10 preserved)",
    sql: `select privilege_type from information_schema.role_table_grants
           where table_schema='public' and table_name='approval_events' and grantee='service_role'
           order by privilege_type`,
    expect: (rows) => {
      const privs = rows.map((r) => r.privilege_type).sort();
      return privs.length === 2 && privs[0] === "INSERT" && privs[1] === "SELECT";
    },
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
      if (!ok) { console.log("    rows:", JSON.stringify(r.rows)); fail++; }
      else { pass++; }
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
