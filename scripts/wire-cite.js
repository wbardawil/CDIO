// One-shot migration for Step C-2 of the defensibility-bar rebuild
// (locked 2026-05-19). Walks src/lib/playbook/diagnostic-questions.ts,
// tracks the current question id, and rewrites every
//   framework_citation: citation(N, "X"),
// to
//   framework_citation: cite("mN_qX"),
// so the product UI surfaces the authoritative named-construct citations.
// Idempotent (only matches `citation(` — re-running is a no-op).
// Run: node scripts/wire-cite.js
const fs = require("fs");
const path = require("path");
const FILE = path.join(__dirname, "..", "src", "lib", "playbook", "diagnostic-questions.ts");
const src = fs.readFileSync(FILE, "utf-8");
const eol = src.includes("\r\n") ? "\r\n" : "\n";
const lines = src.split(/\r?\n/);
let currentId = null;
let replaced = 0;
for (let i = 0; i < lines.length; i++) {
  const m = lines[i].match(/id:\s*"(m\d+_q\d+)"/);
  if (m) currentId = m[1];
  if (currentId && /framework_citation:\s*citation\(/.test(lines[i])) {
    lines[i] = lines[i].replace(
      /framework_citation:\s*citation\([^)]*\)/,
      `framework_citation: cite("${currentId}")`
    );
    replaced++;
  }
}
fs.writeFileSync(FILE, lines.join(eol));
console.log(`Rewired ${replaced} framework_citation callsites to cite("id")`);
