// Read-only. Reports which public tables the Supabase API roles can
// INSERT into. A `false` for service_role is the 42501 root cause.
// Run: node scripts/check-grants.js
const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, "..", ".env.local");
for (const line of fs.readFileSync(envPath, "utf-8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
}

const cfg = {
  host: process.env.SUPABASE_DB_HOST,
  port: parseInt(process.env.SUPABASE_DB_PORT || "6543", 10),
  user: process.env.SUPABASE_DB_USER || "postgres",
  password: process.env.SUPABASE_DB_PASSWORD,
  database: process.env.SUPABASE_DB_NAME || "postgres",
  ssl: { rejectUnauthorized: false },
};

const TABLES = [
  "initiatives",
  "initiative_tokens",
  "audits",
  "selections",
  "organizations",
  "cadence_tokens",
  "status_reports",
  "network_catalog_entries",
  "mcp_tokens",
  "agent_logs",
];

(async () => {
  const c = new Client(cfg);
  await c.connect();
  for (const t of TABLES) {
    const ex = await c.query(
      `select to_regclass('public.${t}') is not null as exists`
    );
    if (!ex.rows[0].exists) {
      console.log(t.padEnd(26), "DOES NOT EXIST");
      continue;
    }
    const p = await c.query(
      `select has_table_privilege('service_role','public.${t}','INSERT') as svc,
              has_table_privilege('anon','public.${t}','INSERT') as anon`
    );
    console.log(
      t.padEnd(26),
      "exists | service_role INSERT:",
      p.rows[0].svc,
      "| anon INSERT:",
      p.rows[0].anon
    );
  }
  await c.end();
})().catch((e) => {
  console.error("ERR", e.message);
  process.exit(1);
});
