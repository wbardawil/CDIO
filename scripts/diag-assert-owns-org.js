// Reproduces the exact PostgREST query assertPractitionerOwnsOrg runs.
// Args: node scripts/diag-assert-owns-org.js <clerk_user_id> <orgId>
const { createClient } = require("@supabase/supabase-js");
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

async function main() {
  loadEnv();
  const userId = process.argv[2];
  const orgId = process.argv[3];
  if (!userId || !orgId) {
    console.error("usage: node scripts/diag-assert-owns-org.js <clerk_user_id> <orgId>");
    process.exit(1);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Need NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exit(1);
  }
  const db = createClient(url, key, { auth: { persistSession: false } });

  console.log(`\nQuery: practitioners JOIN practitioner_clients ON FK, eq(clerk_user_id,${userId}), eq(practitioner_clients.org_id,${orgId})\n`);

  const { data, error } = await db
    .from("practitioners")
    .select(
      "id, practitioner_clients!practitioner_clients_practitioner_id_fkey!inner(org_id, role)",
    )
    .eq("clerk_user_id", userId)
    .eq("practitioner_clients.org_id", orgId)
    .maybeSingle();

  console.log("error:", error);
  console.log("data:", JSON.stringify(data, null, 2));

  if (error || !data) {
    console.log("\n→ assertPractitionerOwnsOrg would return 403");
  } else {
    const membership = data.practitioner_clients;
    const role = Array.isArray(membership) ? membership[0]?.role : membership?.role;
    console.log("\n→ assertPractitionerOwnsOrg would return ok, role =", role);
  }
}

main().catch((e) => { console.error(e); process.exit(2); });
