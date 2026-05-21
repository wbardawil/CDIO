// One-shot diagnostic for the failing dashboard.
// Args: node scripts/diag-org.js <orgId> [<clerk_user_id_optional>]
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
  return null;
}

async function main() {
  loadEnv();
  const orgId = process.argv[2];
  if (!orgId) { console.error("usage: node scripts/diag-org.js <orgId>"); process.exit(1); }
  const cfg = buildClientConfig();
  const client = new Client(cfg);
  await client.connect();

  const org = await client.query(
    `select id, name, status, is_sandbox, created_at from public.organizations where id = $1`, [orgId]);
  console.log("\nORGANIZATION:", org.rows.length === 0 ? "NOT FOUND" : JSON.stringify(org.rows[0], null, 2));

  if (org.rows.length > 0) {
    const memberships = await client.query(
      `select pc.practitioner_id, pc.role, pc.accepted_at, p.email, p.clerk_user_id
         from public.practitioner_clients pc
         join public.practitioners p on p.id = pc.practitioner_id
        where pc.org_id = $1`, [orgId]);
    console.log("\nMEMBERSHIPS on this org:");
    memberships.rows.forEach((r) => console.log("  -", JSON.stringify(r)));

    const assessments = await client.query(
      `select id, status, created_at from public.assessments where org_id = $1 order by created_at desc`, [orgId]);
    console.log("\nASSESSMENTS:", assessments.rows.length, "rows");
    assessments.rows.slice(0, 3).forEach((r) => console.log("  -", JSON.stringify(r)));
  }

  // Sanity: how does the practitioner table look post-v24?
  const roleCounts = await client.query(
    `select role, count(*)::int as n from public.practitioner_clients group by role order by role`);
  console.log("\npractitioner_clients role distribution:");
  roleCounts.rows.forEach((r) => console.log("  -", r.role, "→", r.n));

  await client.end();
}
main().catch((e) => { console.error(e); process.exit(2); });
