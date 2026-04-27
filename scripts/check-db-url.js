// Diagnose DATABASE_URL without leaking the password.
// Run with: node scripts/check-db-url.js

const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, "..", ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf-8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
}

const url = process.env.DATABASE_URL;
if (!url) { console.error("DATABASE_URL is missing from .env.local"); process.exit(1); }

console.log(`Length: ${url.length} chars`);
console.log(`Starts with: ${url.slice(0, 12)}...`);
console.log(`Has placeholder bracket?  ${/\[/.test(url) ? "YES — replace [YOUR-PASSWORD]" : "no"}`);
console.log(`Has whitespace inside?    ${/\s/.test(url) ? "YES — strip newlines/quotes" : "no"}`);
console.log(`Has surrounding quotes?   ${url.startsWith('"') || url.startsWith("'") ? "YES — remove" : "no"}`);

// Try to parse, but mask password.
try {
  const u = new URL(url);
  console.log(`\nParsed:`);
  console.log(`  protocol: ${u.protocol}`);
  console.log(`  username: ${u.username || "(missing)"}`);
  console.log(`  password length: ${u.password ? u.password.length : 0}`);
  console.log(`  host: ${u.hostname || "(missing)"}`);
  console.log(`  port: ${u.port || "(missing)"}`);
  console.log(`  database: ${u.pathname?.replace(/^\//, "") || "(missing)"}`);

  if (u.password) {
    const pw = u.password;
    const decoded = decodeURIComponent(pw);
    const hasSpecials = /[@#$&\/?:%+=, ]/.test(decoded);
    console.log(`\nPassword check:`);
    console.log(`  raw length: ${pw.length}`);
    console.log(`  decoded length: ${decoded.length}`);
    console.log(`  is URL-encoded? ${pw !== decoded ? "yes" : "no"}`);
    console.log(`  contains chars needing encoding when raw? ${hasSpecials ? "YES — must URL-encode" : "no"}`);
  }
} catch (e) {
  console.log(`\nURL parsing FAILED: ${e.message}`);
  console.log(`\nMost likely fixes:`);
  console.log(`  1. You still have [YOUR-PASSWORD] literally — replace with the actual password`);
  console.log(`  2. Password contains special chars — URL-encode them:`);
  console.log(`       @ → %40    # → %23    $ → %24    & → %26    / → %2F    : → %3A`);
  console.log(`     example: 'p@ss#w0rd' → 'p%40ss%23w0rd'`);
}
