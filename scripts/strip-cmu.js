// One-shot cleanup: strip CMU / Carnegie Mellon attributions from playbook + docs.
// Run with: node scripts/strip-cmu.js
// Backup tarball at: ../playbook-pre-cmu-strip-*.tar.gz

const fs = require("fs");
const path = require("path");

const PLAYBOOK_DIR = path.resolve(__dirname, "../../CSIO - Playbook");
const RISKS_DOC = path.resolve(__dirname, "../docs/RISKS.md");

// Order matters: most-specific patterns FIRST, catch-alls LAST.
const transforms = [
  // ---- Carnegie Mellon (full) variants ----
  [/Carnegie Mellon University's Chief Information and Digital Officer Certificate Program/g, "the Chief Information and Digital Officer Certificate Program"],
  [/Carnegie Mellon University's CIDO Certificate Program/g, "the CIDO Certificate Program"],
  [/Carnegie Mellon University CIDO Certificate Program/g, "the CIDO Certificate Program"],
  [/Carnegie Mellon CIDO Certificate Program/g, "the CIDO Certificate Program"],
  [/Carnegie Mellon CIDO Certificate/g, "the CIDO Certificate"],
  [/Carnegie Mellon CIDO Curriculum/g, "the CIDO Curriculum"],
  [/Part of the Carnegie Mellon CIDO Curriculum/g, "Part of the CIDO Curriculum"],
  [/Carnegie Mellon University's/g, "the"],
  [/Carnegie Mellon University/g, "the source institution"],
  [/Carnegie Mellon/g, ""],

  // ---- CMU variants ----
  [/CMU Heinz College CIDO Certificate Program/g, "the CIDO Certificate Program"],
  [/CMU Heinz College/g, ""],
  [/CMU CIDO Certificate Program Curriculum/g, "the CIDO Certificate Program Curriculum"],
  [/CMU CIDO Certificate Program/g, "the CIDO Certificate Program"],
  [/CMU CIDO Curriculum Module/g, "CIDO Curriculum Module"],
  [/CMU CIDO Curriculum/g, "the CIDO Curriculum"],
  [/CMU CIDO Module/g, "CIDO Module"],
  [/CMU CIDO competency/g, "CIDO competency"],
  [/CMU CIDO/g, "the CIDO"],
  [/CMU Curriculum Foundation/g, "Curriculum Foundation"],
  [/CMU Curriculum/g, "the curriculum"],
  [/CMU's comprehensive CIDO curriculum/g, "the comprehensive CIDO curriculum"],
  [/CMU's Module/g, "Module"],
  [/CMU's curriculum/g, "the curriculum"],
  [/CMU's/g, "the source"],
  [/CMU curriculum/g, "the curriculum"],
  [/CMU base/g, "source curriculum"],
  [/, CMU\)/g, ")"],
  [/ \(CMU\)/g, ""],
  [/\(CMU\)/g, ""],
  [/\bCMU\b/g, ""],

  // ---- Narrow post-replacement cleanup (line-bounded, never touches markdown indentation) ----
  [/the the\b/g, "the"],          // "the the CIDO" → "the CIDO" (left over when "Carnegie Mellon University's" removed before "the")
  [/\(\)/g, ""],                  // empty parens like "(CMU)" → "()" → ""
  [/ ,/g, ","],                   // " ," → "," (only after CMU stripped before comma)
];

function processFile(filePath) {
  const original = fs.readFileSync(filePath, "utf-8");
  let updated = original;
  let changeCount = 0;

  for (const [pattern, replacement] of transforms) {
    const before = updated;
    updated = updated.replace(pattern, replacement);
    if (before !== updated) {
      const matches = before.match(pattern) || [];
      changeCount += matches.length;
    }
  }

  // Sanity check: should be zero CMU/Carnegie residue
  const residue = updated.match(/CMU|Carnegie\s*Mellon/gi) || [];

  if (updated !== original) {
    fs.writeFileSync(filePath, updated, "utf-8");
  }

  return { changeCount, residue: residue.length, residueMatches: residue.slice(0, 3) };
}

function main() {
  const targets = [];

  // Playbook
  if (fs.existsSync(PLAYBOOK_DIR)) {
    for (const f of fs.readdirSync(PLAYBOOK_DIR)) {
      if (f.endsWith(".md")) targets.push(path.join(PLAYBOOK_DIR, f));
    }
  } else {
    console.error("Playbook dir not found:", PLAYBOOK_DIR);
    process.exit(1);
  }

  // App doc
  if (fs.existsSync(RISKS_DOC)) targets.push(RISKS_DOC);

  console.log(`Scanning ${targets.length} files\n`);

  let totalChanges = 0;
  let totalResidue = 0;
  const filesChanged = [];

  for (const f of targets) {
    const { changeCount, residue, residueMatches } = processFile(f);
    if (changeCount > 0 || residue > 0) {
      const rel = path.relative(path.resolve(__dirname, "../.."), f);
      console.log(`  ${rel}: ${changeCount} replacements${residue > 0 ? `, ⚠️ ${residue} RESIDUE: ${residueMatches.join(", ")}` : ""}`);
      if (changeCount > 0) filesChanged.push(rel);
      totalChanges += changeCount;
      totalResidue += residue;
    }
  }

  console.log(`\nTotal: ${totalChanges} replacements across ${filesChanged.length} files`);
  if (totalResidue > 0) {
    console.error(`\n❌ ${totalResidue} CMU/Carnegie Mellon mentions remain — manual edit required`);
    process.exit(1);
  } else {
    console.log(`✓ Zero residue — all CMU/Carnegie Mellon mentions removed from disk`);
  }
}

main();
