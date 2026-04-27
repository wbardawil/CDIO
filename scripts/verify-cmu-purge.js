// Verify zero CMU / Carnegie Mellon residue in playbook_chunks DB.
// Run with: node scripts/verify-cmu-purge.js

const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
let SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!SUPABASE_KEY) {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    const url = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/);
    const key = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/);
    if (url && !process.env.NEXT_PUBLIC_SUPABASE_URL) process.env.NEXT_PUBLIC_SUPABASE_URL = url[1].trim();
    if (key) SUPABASE_KEY = key[1].trim();
  }
}

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, SUPABASE_KEY);

async function main() {
  // Page through all chunks; ILIKE filter on each pattern.
  const patterns = ["%CMU%", "%Carnegie Mellon%", "%carnegie%"];
  let totalHits = 0;
  const offenders = [];

  for (const pat of patterns) {
    const { data, error, count } = await db
      .from("playbook_chunks")
      .select("id, content, metadata", { count: "exact" })
      .ilike("content", pat)
      .limit(20);

    if (error) {
      console.error(`Query failed for ${pat}:`, error.message);
      process.exit(2);
    }

    console.log(`Pattern ${pat}: ${count ?? 0} chunks match`);
    totalHits += count ?? 0;

    if (data && data.length) {
      for (const row of data) {
        offenders.push({
          id: row.id,
          source: row.metadata?.source_file,
          snippet: row.content.slice(0, 200),
        });
      }
    }
  }

  // Total chunk count for sanity
  const { count: total } = await db
    .from("playbook_chunks")
    .select("*", { count: "exact", head: true });
  console.log(`\nTotal chunks in DB: ${total}`);

  if (totalHits === 0) {
    console.log("\n✓ Zero CMU / Carnegie Mellon mentions in DB. Chat retrieval is clean.");
    process.exit(0);
  } else {
    console.error(`\n❌ ${totalHits} matching chunks found:`);
    for (const o of offenders.slice(0, 5)) {
      console.error(`  [${o.source}] ${o.snippet}`);
    }
    process.exit(1);
  }
}

main().catch((e) => { console.error(e); process.exit(2); });
