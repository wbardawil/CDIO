// Read-only methodology-integrity validator. Plain node, no deps, no build step
// (same pattern as scripts/check-grants.js). Run: node scripts/validate-citations.js
//
// What it asserts (and BLOCKS commit on, via exit code 1):
//   STEP A  [REGRESSION] citation-aware provenance fidelity. Questions are no
//           longer verbatim-from-playbook by design (defensibility-bar rebuild,
//           locked 2026-05-19). So verbatim fidelity is enforced ONLY for
//           modules NOT yet founder-ratified (scripts/ratified-modules.json):
//           for those, every question + subcategory + level_1..4 must stay
//           byte-faithful (normalized) to the source playbook — the regression
//           guard still applies exactly where the rebuild has not reached.
//           Ratified modules are exempt (their questions are intentionally
//           rewritten); their drift is reported informationally, not blocked,
//           and STEP C instead requires every question to carry a
//           non-indefensible named-construct citation.
//   STEP C  defensibility-bar citation integrity — ONLY when
//           src/lib/playbook/question-citations.ts exists. Until then those
//           checks are reported as SKIPPED (Step A can run standalone).
//
// Exit: 0 = clean, 1 = un-ratified drift or invariant violation.

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const PLAYBOOK = path.join(ROOT, "source-playbook", "01_ASSESSMENT_FRAMEWORK.md");
const QUESTIONS = path.join(ROOT, "src", "lib", "playbook", "diagnostic-questions.ts");
const CITATIONS = path.join(ROOT, "src", "lib", "playbook", "question-citations.ts");
const RATIFIED = path.join(ROOT, "scripts", "ratified-modules.json");

// founder-ratification ledger — a module is exempt from verbatim only after
// the founder ratifies it at the per-module gate. Empty / missing ⇒ none.
let ratifiedModules = [];
try {
  const led = JSON.parse(fs.readFileSync(RATIFIED, "utf-8"));
  ratifiedModules = Array.isArray(led.ratifiedModules) ? led.ratifiedModules : [];
} catch { /* no ledger yet — every module must stay verbatim */ }
const isRatified = (n) => ratifiedModules.includes(n);

// ---- normalization: compare meaning, not punctuation/case/quote-style -------
// The playbook is canonical; the code legitimately (a) appends a trailing period
// to LEVEL_RUBRIC lines, (b) drops the "N.x " numeric prefix from subcategory
// headers. Those are NOT drift. Substantive wording changes ARE.
function norm(s) {
  return String(s)
    .replace(/[‘’‛]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[.\s]+$/g, "")
    .toLowerCase();
}

// ---- parse the source playbook ---------------------------------------------
function parsePlaybook() {
  const md = fs.readFileSync(PLAYBOOK, "utf-8");
  const lines = md.split(/\r?\n/);
  const modules = {}; // n -> { title, subcats:{name->[q]}, questions:Set, levels:{1..4} }
  let cur = null;
  let curSub = null;
  let inScoring = false;
  for (const line of lines) {
    const mod = line.match(/^###\s+MODULE\s+(\d+):\s*(.+?)\s*$/);
    if (mod) {
      const n = parseInt(mod[1], 10);
      cur = modules[n] = { title: mod[2], subcats: {}, questions: new Set(), levels: {} };
      curSub = null;
      inScoring = false;
      continue;
    }
    if (!cur) continue;
    if (/^\*\*Maturity Scoring:\*\*/.test(line)) { inScoring = true; curSub = null; continue; }
    const sub = line.match(/^\*\*\d+\.\d+\s+(.+?)\*\*\s*$/);
    if (sub && !inScoring) {
      curSub = sub[1].trim();
      cur.subcats[norm(curSub)] = { raw: curSub, qs: [] };
      continue;
    }
    const q = line.match(/^□\s*(.+?)\s*$/); // "□ ..."
    if (q && curSub) {
      cur.questions.add(norm(q[1]));
      cur.subcats[norm(curSub)].qs.push(q[1]);
      continue;
    }
    const lvl = line.match(/^-\s*\*\*Level\s+(\d)\*\*:\s*(.+?)\s*$/);
    if (lvl && inScoring) cur.levels[lvl[1]] = lvl[2];
  }
  return modules;
}

// ---- parse diagnostic-questions.ts (text parse, no transpile) --------------
function parseQuestions() {
  const ts = fs.readFileSync(QUESTIONS, "utf-8");
  const STR = '((?:[^"\\\\]|\\\\.)*)';
  const out = [];
  const re = new RegExp(
    'id:\\s*"' + STR + '"\\s*,\\s*module_number:\\s*(\\d+)\\s*,\\s*subcategory:\\s*"' +
      STR + '"\\s*,\\s*question:\\s*"' + STR + '"',
    "g"
  );
  let m;
  while ((m = re.exec(ts))) {
    out.push({
      id: JSON.parse('"' + m[1] + '"'),
      module_number: parseInt(m[2], 10),
      subcategory: JSON.parse('"' + m[3] + '"'),
      question: JSON.parse('"' + m[4] + '"'),
    });
  }
  // LEVEL_RUBRIC: n: { l1: "...", ... l5: "..." }
  const rubric = {};
  const rb = ts.match(/const LEVEL_RUBRIC[^=]*=\s*\{([\s\S]*?)\n\};/);
  if (rb) {
    const body = rb[1];
    const blockRe = /(\d+):\s*\{([\s\S]*?)\},/g;
    let b;
    while ((b = blockRe.exec(body))) {
      const n = b[1];
      const lv = {};
      const lr = new RegExp('l([1-5]):\\s*"' + STR + '"', "g");
      let l;
      while ((l = lr.exec(b[2]))) lv["l" + l[1]] = JSON.parse('"' + l[2] + '"');
      rubric[n] = lv;
    }
  }
  return { questions: out, rubric };
}

// ---- run --------------------------------------------------------------------
const pb = parsePlaybook();
const { questions, rubric } = parseQuestions();
const drift = [];       // BLOCKING — un-ratified modules must stay verbatim
const rewritten = [];   // informational — ratified modules intentionally diverge
let qCount = 0;

for (const q of questions) {
  qCount++;
  const m = pb[q.module_number];
  if (!m) { drift.push(`[Q] ${q.id}: module ${q.module_number} not in playbook`); continue; }
  const ratified = isRatified(q.module_number);
  if (!m.questions.has(norm(q.question))) {
    const msg = `[Q] ${q.id} (M${q.module_number}): question text not verbatim in playbook\n      code: ${q.question}`;
    (ratified ? rewritten : drift).push(msg);
  }
  // subcategory may legitimately be re-anchored in a ratified module
  if (!m.subcats[norm(q.subcategory)] && !ratified)
    drift.push(`[SUB] ${q.id} (M${q.module_number}): subcategory "${q.subcategory}" not a playbook section`);
}

for (let n = 1; n <= 16; n++) {
  const rb = rubric[n];
  const m = pb[n];
  if (!rb || !m) { drift.push(`[RUBRIC] module ${n}: rubric or playbook section missing`); continue; }
  const sink = isRatified(n) ? rewritten : drift;
  for (const lv of ["1", "2", "3", "4"]) {
    if (norm(rb["l" + lv]) !== norm(m.levels[lv]))
      sink.push(
        `[RUBRIC] M${n} level_${lv} drift\n      code: ${rb["l" + lv]}\n      book: ${m.levels[lv]}`
      );
  }
  if (!rb.l5) drift.push(`[RUBRIC] M${n}: level_5 (AI-CDIO extension) missing`); // always required
}

console.log(
  `STEP A — provenance fidelity: ${qCount} questions, 16 rubrics; ` +
  `ratified (verbatim-exempt): ${ratifiedModules.length ? ratifiedModules.join(",") : "none"}`
);
if (drift.length === 0) console.log("  ✓ all un-ratified modules verbatim-faithful to the playbook");
else { console.log(`  ✗ ${drift.length} blocking drift(s):`); for (const d of drift) console.log("   - " + d); }
if (rewritten.length)
  console.log(`  · ${rewritten.length} intentional rewrite(s) in ratified modules (informational, not blocked)`);

// ---- STEP C invariants (only if the citation map exists) -------------------
let stepC = "SKIPPED (question-citations.ts not yet created — run after Step C-1)";
let cFail = 0;
if (fs.existsSync(CITATIONS)) {
  const cs = fs.readFileSync(CITATIONS, "utf-8");
  const STR = '((?:[^"\\\\]|\\\\.)*)';
  const entryRe = new RegExp('"(m\\d+_q\\d+)"\\s*:\\s*\\{([\\s\\S]*?)\\n\\s{2}\\}', "g");
  const mapIds = new Set();
  let e;
  const SENTINEL = /^\(no .*identified\)$/i;
  const isNamed = (v) => typeof v === "string" && v.trim() !== "" && !SENTINEL.test(v.trim());
  const str = (re) => (body) => (body.match(re) || [])[1];
  const getFramework = str(new RegExp('framework:\\s*"' + STR + '"'));
  const getReference = str(new RegExp('reference:\\s*"' + STR + '"'));
  const getLocator = str(new RegExp('locator:\\s*"' + STR + '"'));
  const moduleOf = (id) => parseInt(id.match(/^m(\d+)_/)[1], 10);
  while ((e = entryRe.exec(cs))) {
    const id = e[1];
    const body = e[2];
    mapIds.add(id);
    const grade = (body.match(/grade:\s*"(\w+)"/) || [])[1];
    const verified = /verifiedViaFetch:\s*true/.test(body);
    const semantic = /semanticPass:\s*true/.test(body);
    const locator = getLocator(body);
    const framework = getFramework(body);
    const reference = getReference(body);
    const clientVisible = /clientVisible:\s*true/.test(body);
    const paywalled = /accessStatus:\s*"paywalled"/.test(body) || /sourceType:\s*"paywalled"/.test(body);
    const urlLocator = !!locator && /^https?:\/\//.test(locator);
    const mod = moduleOf(id);

    // DEFENSIBILITY BAR — strong needs a named construct + semanticPass + a
    // precise locator (URL+fetch when public; a non-empty named-clause string
    // when the canonical source is paywalled). Paywalled no longer auto-fails.
    if (grade === "strong") {
      if (!isNamed(framework) || !isNamed(reference)) { cFail++; console.log(`  ✗ ${id}: strong without a named construct`); }
      if (!semantic) { cFail++; console.log(`  ✗ ${id}: strong but semanticPass!=true`); }
      if (paywalled) {
        if (!locator || locator.trim() === "") { cFail++; console.log(`  ✗ ${id}: strong+paywalled without a precise named-clause locator`); }
      } else {
        if (!verified) { cFail++; console.log(`  ✗ ${id}: strong public source but verifiedViaFetch!=true`); }
        if (!urlLocator) { cFail++; console.log(`  ✗ ${id}: strong public source without resolvable locator`); }
      }
    }

    // An undefendable question must NEVER be client-visible, and clientVisible
    // is legitimate ONLY for a founder-ratified module (the ledger gate).
    if (clientVisible && grade === "indefensible") { cFail++; console.log(`  ✗ ${id}: clientVisible=true but grade=indefensible (must be re-derived before ratification)`); }
    if (clientVisible && !isRatified(mod)) { cFail++; console.log(`  ✗ ${id}: clientVisible=true but M${mod} is not in the founder-ratification ledger`); }
  }
  const qIds = new Set(questions.map((q) => q.id));
  for (const id of qIds) if (!mapIds.has(id)) { cFail++; console.log(`  ✗ question ${id} has no citation entry`); }
  for (const id of mapIds) if (!qIds.has(id)) { cFail++; console.log(`  ✗ orphan citation key ${id} (no such question)`); }
  // Provenance guarantee for ratified modules: every question carries a
  // non-indefensible named-construct citation (this replaces verbatim).
  for (const q of questions) {
    if (!isRatified(q.module_number)) continue;
    const m2 = cs.match(new RegExp('"' + q.id + '"\\s*:\\s*\\{([\\s\\S]*?)\\n\\s{2}\\}'));
    const g = m2 && (m2[1].match(/grade:\s*"(\w+)"/) || [])[1];
    if (g === "indefensible") { cFail++; console.log(`  ✗ ${q.id}: M${q.module_number} ratified but question still indefensible`); }
  }
  stepC = cFail === 0
    ? `✓ ${mapIds.size} citation entries, invariants hold`
    : `✗ ${cFail} invariant violation(s)`;
}
console.log(`STEP C — defensibility-bar citation integrity: ${stepC}`);

const failed = drift.length > 0 || cFail > 0;
console.log(failed ? "\nRESULT: FAIL (blocks commit)" : "\nRESULT: PASS");
process.exit(failed ? 1 : 0);
