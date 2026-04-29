// Day 7 audit: surface real-vs-sandbox state for every org, every stakeholder,
// every practitioner_clients mapping. Read-only.
//
// Goal: confirm Ambar Capital is_sandbox=false, identify orphan orgs (no
// practitioner_clients mapping), and decide what backfill is needed before
// Phase 1C kicks off.
//
// Run with: node scripts/audit-day7.js

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

async function main() {
  console.log(`Project: ${url}\n`);

  console.log("=== practitioners ===");
  const { data: practitioners, error: pErr } = await db
    .from("practitioners")
    .select("id, clerk_user_id, name, email, plan, created_at")
    .order("created_at", { ascending: true });
  if (pErr) { console.error(pErr); process.exit(2); }
  for (const p of practitioners ?? []) {
    console.log(`  ${p.id}`);
    console.log(`    clerk: ${p.clerk_user_id}`);
    console.log(`    name:  ${p.name ?? "(null)"}`);
    console.log(`    email: ${p.email ?? "(null)"}`);
    console.log(`    plan:  ${p.plan ?? "(null)"}`);
    console.log(`    created: ${p.created_at}`);
  }

  console.log("\n=== organizations ===");
  const { data: orgs, error: oErr } = await db
    .from("organizations")
    .select("*")
    .order("created_at", { ascending: true });
  if (oErr) { console.error(oErr); process.exit(2); }
  if (orgs && orgs.length > 0) {
    console.log(`  (columns: ${Object.keys(orgs[0]).join(", ")})\n`);
  }
  for (const o of orgs ?? []) {
    const sandboxBadge = o.is_sandbox ? "SANDBOX" : "REAL   ";
    console.log(`  [${sandboxBadge}]  ${o.name}`);
    console.log(`    id: ${o.id}`);
    console.log(`    full row: ${JSON.stringify(o)}`);
  }

  console.log("\n=== practitioner_clients mappings ===");
  const { data: pc, error: pcErr } = await db
    .from("practitioner_clients")
    .select("practitioner_id, org_id, role, created_at");
  if (pcErr) { console.error(pcErr); process.exit(2); }
  for (const m of pc ?? []) {
    const orgName = orgs?.find(o => o.id === m.org_id)?.name ?? "(unknown)";
    const pName = practitioners?.find(p => p.id === m.practitioner_id)?.email ?? "(unknown)";
    console.log(`  ${pName}  →  ${orgName}  [${m.role ?? "no role"}]`);
    console.log(`    practitioner_id: ${m.practitioner_id}`);
    console.log(`    org_id:          ${m.org_id}`);
  }

  console.log("\n=== orphan orgs (no practitioner_clients mapping) ===");
  const mappedOrgIds = new Set((pc ?? []).map(m => m.org_id));
  const orphans = (orgs ?? []).filter(o => !mappedOrgIds.has(o.id));
  if (orphans.length === 0) {
    console.log("  none");
  } else {
    for (const o of orphans) {
      console.log(`  ${o.is_sandbox ? "🧪" : "✅"} ${o.name} (${o.id})`);
    }
  }

  console.log("\n=== stakeholders ===");
  const { data: sh, error: sErr } = await db
    .from("stakeholders")
    .select("id, org_id, name, email, role, influence_level, relevant_modules, assessment_token, created_at")
    .order("created_at", { ascending: true });
  if (sErr) { console.error(sErr); process.exit(2); }
  for (const s of sh ?? []) {
    const orgName = orgs?.find(o => o.id === s.org_id)?.name ?? "(unknown)";
    console.log(`  ${s.name ?? "(no name)"}  <${s.email ?? "(no email)"}>`);
    console.log(`    org:    ${orgName} (${s.org_id})`);
    console.log(`    role:   ${s.role}`);
    console.log(`    infl:   ${s.influence_level}`);
    console.log(`    modules: ${Array.isArray(s.relevant_modules) ? `[${s.relevant_modules.join(", ")}]` : s.relevant_modules ?? "(null)"}`);
    console.log(`    token:  ${s.assessment_token ? s.assessment_token.slice(0, 8) + "..." : "(null)"}`);
  }

  console.log("\n=== assessments ===");
  const { data: assessments, error: aErr } = await db
    .from("assessments")
    .select("*")
    .order("created_at", { ascending: true });
  if (aErr) { console.error(aErr); process.exit(2); }
  if (assessments && assessments.length > 0) {
    console.log(`  (columns: ${Object.keys(assessments[0]).join(", ")})\n`);
  }
  for (const a of assessments ?? []) {
    const orgName = orgs?.find(o => o.id === a.org_id)?.name ?? "(unknown)";
    console.log(`  ${orgName}`);
    console.log(`    id: ${a.id}`);
    console.log(`    full row: ${JSON.stringify(a)}`);
  }

  console.log("\n=== assessment_synthesis ===");
  const { data: synth, error: synErr } = await db
    .from("assessment_synthesis")
    .select("id, org_id, module_id, created_at")
    .order("created_at", { ascending: true });
  if (synErr) { console.error(synErr); }
  else {
    const byOrg = {};
    for (const s of synth ?? []) {
      const orgName = orgs?.find(o => o.id === s.org_id)?.name ?? s.org_id;
      if (!byOrg[orgName]) byOrg[orgName] = [];
      byOrg[orgName].push(s.module_id);
    }
    for (const [orgName, modules] of Object.entries(byOrg)) {
      console.log(`  ${orgName}: synthesis for modules [${modules.join(", ")}]`);
    }
  }

  console.log("\n=== roadmaps ===");
  const { data: rm, error: rmErr } = await db
    .from("roadmaps")
    .select("id, org_id, created_at");
  if (rmErr) { console.error(rmErr); }
  else {
    for (const r of rm ?? []) {
      const orgName = orgs?.find(o => o.id === r.org_id)?.name ?? r.org_id;
      console.log(`  ${orgName} (roadmap ${r.id})`);
    }
  }

  console.log("\n=== conversations ===");
  const { data: conv, error: cErr } = await db
    .from("conversations")
    .select("id, org_id, session_id, message_count, created_at, updated_at")
    .order("updated_at", { ascending: false });
  if (cErr) {
    // Try without message_count
    const { data: conv2 } = await db
      .from("conversations")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);
    if (conv2 && conv2.length > 0) {
      console.log(`  (columns: ${Object.keys(conv2[0]).join(", ")})`);
      for (const c of conv2) {
        const orgName = orgs?.find(o => o.id === c.org_id)?.name ?? c.org_id ?? "(no org)";
        console.log(`  ${orgName}  ${c.id}  created=${c.created_at}`);
      }
    }
  } else {
    for (const c of conv ?? []) {
      const orgName = orgs?.find(o => o.id === c.org_id)?.name ?? c.org_id ?? "(no org)";
      console.log(`  ${orgName}  ${c.session_id ?? c.id}  msgs=${c.message_count ?? "?"}`);
    }
  }

  console.log("\n=== module_scores by org ===");
  const { data: scores, error: msErr } = await db
    .from("module_scores")
    .select("assessment_id, module_id, current_level, target_level");
  if (msErr) { console.error(msErr); process.exit(2); }
  const byAssessment = {};
  for (const s of scores ?? []) {
    if (!byAssessment[s.assessment_id]) byAssessment[s.assessment_id] = [];
    byAssessment[s.assessment_id].push(s);
  }
  for (const [aid, list] of Object.entries(byAssessment)) {
    const a = assessments?.find(x => x.id === aid);
    const orgName = a ? orgs?.find(o => o.id === a.org_id)?.name : "(unknown)";
    console.log(`  ${orgName} (${list.length} scored modules):`);
    for (const s of list) {
      console.log(`    M${s.module_id}: ${s.current_level} → ${s.target_level}`);
    }
  }
}

main().catch((e) => { console.error(e); process.exit(2); });
