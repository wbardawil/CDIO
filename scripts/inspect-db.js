// Inspect what tables / columns / row counts already exist in the configured
// Supabase project. Read-only. Tells us whether v4 needs to run.
//
// Run with: node scripts/inspect-db.js

const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, "..", ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf-8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) { console.error("Missing Supabase env vars"); process.exit(1); }

const db = createClient(url, key, { auth: { persistSession: false } });

const TABLES = [
  "organizations", "stakeholders", "assessments", "module_scores",
  "assessment_synthesis", "divergence_points", "roadmaps", "initiatives",
  "decisions", "agent_logs", "playbook_chunks",
  "conversations", "action_cards",
  // v4 (the migration we want to apply):
  "practitioners", "practitioner_clients",
];

async function tableInfo(name) {
  // Use a real SELECT (not head:true count) — supabase-js's head count
  // returns 0/no-error for missing tables, giving false positives.
  const { error } = await db.from(name).select("*").limit(1);
  if (error) {
    if (
      error.code === "42P01" ||
      /does not exist/i.test(error.message) ||
      /Could not find the table/i.test(error.message) ||
      /schema cache/i.test(error.message)
    ) {
      return { exists: false, count: 0 };
    }
    return { exists: null, error: error.message };
  }
  // Table exists — get accurate count
  const { count } = await db.from(name).select("*", { count: "exact", head: true });
  return { exists: true, count: count ?? 0 };
}

async function checkActiveModules() {
  // Try to select active_modules from organizations; if it errors with
  // "column does not exist" we know v4 hasn't run yet.
  const { error } = await db.from("organizations").select("active_modules").limit(1);
  if (!error) return { exists: true };
  if (/active_modules/i.test(error.message)) return { exists: false, message: error.message };
  return { exists: null, message: error.message };
}

async function main() {
  console.log(`Project: ${url}\n`);
  console.log("Tables:");
  for (const t of TABLES) {
    const info = await tableInfo(t);
    if (info.exists === true) {
      console.log(`  ✓ ${t.padEnd(24)} ${String(info.count).padStart(6)} rows`);
    } else if (info.exists === false) {
      console.log(`  ✗ ${t.padEnd(24)} (does not exist)`);
    } else {
      console.log(`  ? ${t.padEnd(24)} ${info.error}`);
    }
  }

  console.log("\nColumns:");
  const am = await checkActiveModules();
  if (am.exists === true) console.log("  ✓ organizations.active_modules");
  else if (am.exists === false) console.log("  ✗ organizations.active_modules (needs v4 migration)");
  else console.log(`  ? organizations.active_modules — ${am.message}`);

  // Existing clerk_org_id (which v4 drops)
  const { error: cerr } = await db.from("organizations").select("clerk_org_id").limit(1);
  if (!cerr) console.log("  ⚠ organizations.clerk_org_id still present (v4 drops it)");
  else if (/clerk_org_id/i.test(cerr.message)) console.log("  ✓ organizations.clerk_org_id already absent");
}

main().catch((e) => { console.error(e); process.exit(2); });
