// Apply a SQL migration to the project database.
// Usage:
//   node scripts/migrate.js                                   # default: schema-v4-practitioners.sql
//   node scripts/migrate.js src/lib/db/schema-v2.sql           # any SQL file
//
// Requires DATABASE_URL in .env.local (Supabase Connection String → URI).
// Use the POOLER connection (port 6543, transaction mode) for compatibility
// with serverless and short-lived migrations.

const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

function loadEnv() {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, "utf-8");
  for (const line of content.split(/\r?\n/)) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].trim();
    }
  }
}

function buildClientConfig() {
  // Path A: individual fields (avoids any URL-encoding pain with special chars in password).
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
  // Path B: DATABASE_URL. Try strict URL first; if the password has un-encoded
  // special chars (very common with auto-generated Supabase passwords), fall
  // back to a permissive parser anchored on Supabase pooler host pattern.
  const raw = process.env.DATABASE_URL;
  if (!raw) return null;
  try {
    new URL(raw);
    return { connectionString: raw, ssl: { rejectUnauthorized: false } };
  } catch {
    // Permissive parse: postgres://USER:PASSWORD@HOST:PORT/DATABASE
    // Anchor on @ followed by a Supabase host signature (aws- or db.<ref>.).
    const m = raw.match(/^(?:postgres(?:ql)?:\/\/)([^:]+):(.*)@((?:aws-[^\/]+|db\.[^\/]+|[a-z0-9.-]+\.supabase\.[a-z]+))(?::(\d+))?\/([a-zA-Z0-9_-]+)\s*$/);
    if (!m) {
      console.error("DATABASE_URL is malformed and the permissive parser couldn't recover it.");
      console.error("Switch to individual SUPABASE_DB_* env vars instead. See: scripts/migrate.js header.");
      return null;
    }
    const [, user, password, h, port, database] = m;
    return {
      host: h,
      port: parseInt(port || "6543", 10),
      user,
      password,
      database,
      ssl: { rejectUnauthorized: false },
    };
  }
}

async function main() {
  loadEnv();
  const cfg = buildClientConfig();
  if (!cfg) {
    console.error("Need DATABASE_URL OR (SUPABASE_DB_HOST + SUPABASE_DB_PASSWORD) in .env.local");
    console.error("");
    console.error("Easiest path — paste these (no URL-encoding needed):");
    console.error("  SUPABASE_DB_HOST=aws-0-<region>.pooler.supabase.com");
    console.error("  SUPABASE_DB_PORT=6543");
    console.error("  SUPABASE_DB_USER=postgres.jowfdcontbpetgldrzix");
    console.error("  SUPABASE_DB_PASSWORD=<your raw password, NO encoding>");
    console.error("  SUPABASE_DB_NAME=postgres");
    console.error("");
    console.error("Find these at: Supabase → Settings → Database → Connection pooling (Transaction mode)");
    process.exit(1);
  }

  const sqlFile = process.argv[2] || path.join("src", "lib", "db", "schema-v4-practitioners.sql");
  const fullPath = path.resolve(__dirname, "..", sqlFile);
  if (!fs.existsSync(fullPath)) {
    console.error(`SQL file not found: ${fullPath}`);
    process.exit(1);
  }

  const sql = fs.readFileSync(fullPath, "utf-8");
  console.log(`Applying ${sqlFile} (${sql.length} bytes) ...\n`);

  const client = new Client(cfg);
  await client.connect();

  try {
    await client.query("begin");
    await client.query(sql);
    await client.query("commit");
    console.log(`✓ Applied ${path.basename(sqlFile)} cleanly.`);
  } catch (err) {
    await client.query("rollback");
    console.error("\n❌ Migration failed (rolled back):");
    console.error(err.message);
    process.exit(2);
  } finally {
    await client.end();
  }
}

main().catch((e) => { console.error(e); process.exit(2); });
