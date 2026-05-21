// One-shot backfill: populate approval_events.actor_role on rows that
// existed before schema-v24 added the column.
//
// Strategy: for each event with actor_role IS NULL, look up the actor's
// CURRENT role on the event's org (via practitioner_clients), and stamp
// that role. Limitation: if the user has changed role since the event
// (rare for the small founder-test set), we record the current role, not
// the historical one. Acceptable per S1.5 §6 / eng finding E3.
//
// Idempotent: only touches NULL rows. Re-running is a no-op once clean.
//
// Run: node scripts/backfill-approval-events-actor-role.js

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

async function main() {
  loadEnv();
  const cfg = buildClientConfig();
  if (!cfg) { console.error("missing DB creds"); process.exit(1); }
  const client = new Client(cfg);
  await client.connect();

  // Backfill: actor_role := the actor's CURRENT role on the event's org.
  // If the actor no longer has a practitioner_clients row for that org
  // (rare — e.g. their membership was revoked since), we set 'strategic_approver'
  // as the most conservative default (the event was from a privileged actor
  // either way). Documented assumption.
  const sql = `
    WITH lookups AS (
      SELECT e.id AS event_id,
             COALESCE(
               (SELECT pc.role
                  FROM public.practitioner_clients pc
                 WHERE pc.practitioner_id = e.actor_practitioner_id
                   AND pc.org_id = e.org_id
                 LIMIT 1),
               'strategic_approver'
             ) AS resolved_role
        FROM public.approval_events e
       WHERE e.actor_role IS NULL
    )
    UPDATE public.approval_events e
       SET actor_role = l.resolved_role
      FROM lookups l
     WHERE e.id = l.event_id
    RETURNING e.id, e.actor_role
  `;
  const r = await client.query(sql);
  console.log(`Backfilled actor_role on ${r.rowCount} approval_events row(s).`);

  // Sanity check: no remaining NULLs.
  const check = await client.query(`SELECT count(*)::int AS n FROM public.approval_events WHERE actor_role IS NULL`);
  console.log(`Remaining NULL actor_role rows: ${check.rows[0].n}`);

  await client.end();
}

main().catch((e) => { console.error(e); process.exit(2); });
