// Single-writer Step C-1 builder. Reads the 16 read-only validation artifacts
// + the question ids from diagnostic-questions.ts, emits the typed citation map
// src/lib/playbook/question-citations.ts, and prints aggregate stats. No deps.
// FAILS LOUDLY if any of the 128 question ids is missing an artifact entry.
// Run: node scripts/build-question-citations.js
//
// ENFORCEMENT = the DEFENSIBILITY BAR (locked 2026-05-19, supersedes the old
// fetch-only cap). A "strong" entry survives iff it carries a SPECIFIC NAMED
// construct + a PRECISE locator (a resolvable URL when the source is public,
// OR — when the canonical source is paywalled — a non-empty named-clause
// locator string) + semanticPass. Paywalled no longer auto-caps: a precise
// named clause is solid. Only "no named construct" fails. Automation enforces
// METADATA presence only (Codex #15); semantic truth is the per-module founder
// ratification gate. clientVisible is driven by scripts/ratified-modules.json
// (the recorded, portable founder-ratification ledger) — empty ⇒ all false.
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const QUESTIONS = path.join(ROOT, "src", "lib", "playbook", "diagnostic-questions.ts");
const OUT_TS = path.join(ROOT, "src", "lib", "playbook", "question-citations.ts");
const RATIFIED = path.join(ROOT, "scripts", "ratified-modules.json");
const ART = path.join(process.env.USERPROFILE || process.env.HOME, ".gstack",
  "projects", "wbardawil-CDIO", "citation-audit", "out");

function batchOf(n) {
  if (n <= 4) return "M1-4"; if (n <= 8) return "M5-8";
  if (n <= 12) return "M9-12"; return "M13-16";
}

// ordered question ids from the source of truth
const ts = fs.readFileSync(QUESTIONS, "utf-8");
const ids = [];
const idRe = /id:\s*"(m(\d+)_q\d+)"/g;
let m;
while ((m = idRe.exec(ts))) ids.push({ id: m[1], module: +m[2] });

// load artifacts
const byId = {};
const modules = [];
for (let n = 1; n <= 16; n++) {
  const f = path.join(ART, `module${String(n).padStart(2, "0")}.json`);
  const j = JSON.parse(fs.readFileSync(f, "utf-8"));
  modules.push(j);
  for (const q of j.questions) byId[q.id] = { ...q, module: n, reviewer: `citation-audit 2026-05-19 (${batchOf(n)})` };
}

// coverage assertion — no partial emit
const missing = ids.filter((x) => !byId[x.id]).map((x) => x.id);
if (missing.length) {
  console.error("FATAL: missing artifact entries for: " + missing.join(", "));
  process.exit(1);
}

// ---- founder-ratification ledger (recorded, portable, per module) ----------
// scripts/ratified-modules.json: { "ratifiedModules": [12, 13, 2], ... }.
// A module appears here ONLY after the founder explicitly ratifies its mapping
// at the per-module gate. Empty / missing ⇒ nothing ratified ⇒ every entry
// clientVisible:false (identical to pre-rebuild behavior — certifies nothing).
let ratifiedModules = [];
try {
  const led = JSON.parse(fs.readFileSync(RATIFIED, "utf-8"));
  ratifiedModules = Array.isArray(led.ratifiedModules) ? led.ratifiedModules : [];
} catch { /* no ledger yet — all clientVisible:false */ }
const isRatified = (n) => ratifiedModules.includes(n);

// ---- preserve founder-curated entries for RATIFIED modules -----------------
// For a ratified module the committed question-citations.ts is the portable,
// reproducible source of record (the ~/.gstack artifacts are frozen v2 audit
// detail and may not exist on another machine). The builder PRESERVES the
// existing committed entry for every question in a ratified module instead of
// regenerating it from the artifact; un-ratified modules still come from the
// artifacts. This is why ratified entries may be hand-authored at the founder
// gate without violating "do not hand-edit" — the builder locks them in.
function parseCommitted(file) {
  if (!fs.existsSync(file)) return {};
  const cs = fs.readFileSync(file, "utf-8");
  const out = {};
  const entryRe = /"(m\d+_q\d+)"\s*:\s*\{([\s\S]*?)\n\s{2}\},/g;
  const S = '((?:[^"\\\\]|\\\\.)*)';
  const sv = (b, k) => { const m2 = b.match(new RegExp(k + ':\\s*"' + S + '"')); return m2 ? JSON.parse('"' + m2[1] + '"') : undefined; };
  const bv = (b, k) => new RegExp(k + ':\\s*true').test(b);
  let e;
  while ((e = entryRe.exec(cs))) {
    const b = e[2];
    out[e[1]] = {
      id: e[1],
      framework: sv(b, "framework"), reference: sv(b, "reference"),
      rationale: sv(b, "rationale"), grade: (b.match(/grade:\s*"(\w+)"/) || [])[1],
      locator: sv(b, "locator"), quoted: sv(b, "quoted"),
      verifiedViaFetch: bv(b, "verifiedViaFetch"), sourceType: sv(b, "sourceType"),
      accessStatus: sv(b, "accessStatus"), fetchDate: sv(b, "fetchDate"),
      reviewer: sv(b, "reviewer"), semanticPass: bv(b, "semanticPass"),
      confidenceNote: sv(b, "confidenceNote"),
    };
  }
  return out;
}
const committed = parseCommitted(OUT_TS);
const preserved = [];
for (const { id, module } of ids) {
  if (isRatified(module) && committed[id]) {
    byId[id] = { ...committed[id], module, reviewer: committed[id].reviewer || `founder-ratified M${module}` };
    preserved.push(id);
  }
}

// DEFENSIBILITY-BAR ENFORCEMENT (deterministic — do NOT trust the agent's
// grade). Codex #15: automation enforces METADATA presence only; the founder
// gate owns semantic truth. A "strong" entry survives iff:
//   1. it names a SPECIFIC construct  (framework + reference non-empty,
//      non-sentinel — "no named construct" is the only thing that fails),
//   2. semanticPass === true,
//   3. it carries a PRECISE locator:
//        • public source  → verifiedViaFetch && resolvable http(s) URL
//          (anti-hallucination defense retained for publicly checkable claims),
//        • paywalled source → a non-empty named-clause locator string
//          (precision of the clause is the founder gate's call, not automation).
// Any violation auto-downgrades strong→weak with a transparent note. The
// builder NEVER promotes — lifting weak→strong is founder-ratified re-anchoring.
const SENTINEL = /^\(no .*identified\)$/i;
const named = (v) => typeof v === "string" && v.trim() !== "" && !SENTINEL.test(v.trim());
let autoCapped = 0;
const capLog = [];
for (const id of Object.keys(byId)) {
  const c = byId[id];
  if (c.grade !== "strong") continue;
  const reasons = [];
  if (!named(c.framework) || !named(c.reference)) reasons.push("no named construct");
  if (c.semanticPass !== true) reasons.push("semanticPass=false");
  const url = c.locator && /^https?:\/\//.test(c.locator);
  if (c.accessStatus === "paywalled" || c.sourceType === "paywalled") {
    if (!c.locator || String(c.locator).trim() === "")
      reasons.push("paywalled without a precise named-clause locator");
  } else {
    if (c.verifiedViaFetch !== true) reasons.push("public source not WebFetch-verified");
    if (!url) reasons.push("public source without resolvable locator");
  }
  if (reasons.length) {
    // A founder-ratified entry that fails the bar is a curation error — surface
    // it loudly, never silently downgrade a ratified strong.
    if (preserved.includes(id)) {
      console.error(
        `FATAL: ratified entry ${id} does not meet the defensibility bar: ` +
        reasons.join("; ") + " — fix the committed citation, do not regenerate."
      );
      process.exit(1);
    }
    c.grade = "weak";
    c.confidenceNote =
      `[auto-capped to weak per defensibility bar: ${reasons.join("; ")}] ` +
      (c.confidenceNote || "");
    autoCapped++;
    capLog.push(`  ${id}: ${reasons.join("; ")}`);
  }
}

// Optional fields may be `undefined` (typed `string | undefined`).
const opt = (v) => (v === null || v === undefined ? "undefined" : JSON.stringify(v));
// Required string fields must never be undefined — coerce with a clear sentinel.
const req = (v, fallback) =>
  JSON.stringify(v === null || v === undefined || v === "" ? fallback : String(v));

let body = "";
for (const { id, module } of ids) {
  const c = byId[id];
  body +=
`  "${id}": {
    framework: ${req(c.framework, "(no framework identified)")},
    reference: ${req(c.reference, "(no specific named construct identified)")},
    rationale: ${req(c.rationale, "(no rationale recorded)")},
    grade: ${req(c.grade, "indefensible")},
    locator: ${opt(c.locator)},
    quoted: ${opt(c.quoted)},
    verifiedViaFetch: ${c.verifiedViaFetch === true},
    sourceType: ${req(c.sourceType, "other")},
    accessStatus: ${req(c.accessStatus, "public-summary")},
    fetchDate: ${req(c.fetchDate, "2026-05-19")},
    reviewer: ${req(c.reviewer, "citation-audit 2026-05-19")},
    semanticPass: ${c.semanticPass === true},
    confidenceNote: ${opt(c.confidenceNote || undefined)},
    clientVisible: ${isRatified(module) === true},
  },
`;
}

const file = `// AUTO-GENERATED by scripts/build-question-citations.js — do not hand-edit.
// Source of truth: the read-only methodology-validation artifacts produced by
// /plan-eng-review (2026-05-19). Regenerate when the audit re-runs.
//
// Grades are enforced to the DEFENSIBILITY BAR (named construct + precise
// locator/clause + semanticPass). clientVisible is true ONLY for modules in
// scripts/ratified-modules.json — the recorded, portable per-module founder-
// ratification ledger. A module is added there ONLY after the founder ratifies
// its mapping at the per-module gate; until then its questions keep the generic
// playbook citation and nothing here is shown to a client.
//
// Entries for RATIFIED modules are founder-curated and PRESERVED across regen
// (they are the portable source of record). Entries for un-ratified modules
// are auto-generated from the read-only audit artifacts — do not hand-edit
// those; they will be overwritten.

export type CitationGrade = "strong" | "weak" | "indefensible";

export interface AuthoritativeCitation {
  framework: string;
  reference: string;
  rationale: string;
  grade: CitationGrade;
  locator?: string;
  quoted?: string;
  verifiedViaFetch: boolean;
  sourceType:
    | "standard-body"
    | "peer-reviewed"
    | "consortium"
    | "analyst-tier2"
    | "paywalled"
    | "other";
  accessStatus: "public-full" | "public-summary" | "paywalled";
  fetchDate: string;
  reviewer: string;
  semanticPass: boolean;
  confidenceNote?: string;
  /** true ONLY for modules the founder ratified (scripts/ratified-modules.json). */
  clientVisible: boolean;
}

export const QUESTION_CITATIONS: Record<string, AuthoritativeCitation> = {
${body}};

/**
 * Resolve an authoritative citation by question id. Returns undefined if the
 * id is not yet audited (callers must fall back to the legacy generic
 * citation()). Step C-2 wires diagnostic-questions.ts through this.
 */
export function getAuthoritativeCitation(
  questionId: string
): AuthoritativeCitation | undefined {
  return QUESTION_CITATIONS[questionId];
}
`;

fs.writeFileSync(OUT_TS, file);

// ---- stats for the v2.0 report ---------------------------------------------
// same deterministic strict-bar enforcement applied to module rubric grades
function enforceRubric(r) {
  if (!r) return "?";
  if (r.grade !== "strong") return r.grade;
  const url = r.locator && /^https?:\/\//.test(r.locator);
  const paywalled = r.accessStatus === "paywalled" || r.sourceType === "paywalled";
  const bad =
    !named(r.framework) || !named(r.reference) ||
    r.semanticPass !== true ||
    (paywalled
      ? !r.locator || String(r.locator).trim() === ""
      : r.verifiedViaFetch !== true || !url);
  return bad ? "weak*" : "strong"; // weak* = auto-capped (defensibility bar)
}

let tS = 0, tW = 0, tI = 0;
const rows = [];
for (const j of modules) {
  let s = 0, w = 0, i = 0;
  for (const q of j.questions) {
    const g = byId[q.id].grade; // post-enforcement grade
    if (g === "strong") s++;
    else if (g === "weak") w++;
    else i++;
  }
  tS += s; tW += w; tI += i;
  rows.push({
    n: j.module, s, w, i,
    rubric: enforceRubric(j.rubric_level_1_to_4),
    l5: j.level_5_extension ? j.level_5_extension.verdict : "?",
    triage: j.triage, reason: j.triage_reason, anchor: j.anchor_used,
  });
}
const riskRank = (r) =>
  (r.triage === "cut" ? 0 : r.triage === "rewrite" ? 1 : 2) * 100 - (r.i * 10 + r.w);
rows.sort((a, b) => riskRank(a) - riskRank(b));

const visibleCount = ids.filter((x) => isRatified(x.module)).length;
console.log(`\nWrote ${OUT_TS} — ${ids.length} entries, ${visibleCount} clientVisible:true\n`);
console.log(`DEFENSIBILITY-BAR ENFORCEMENT: ${autoCapped} entries auto-capped strong→weak`);
console.log(`RATIFIED MODULES (clientVisible:true): ${ratifiedModules.length ? ratifiedModules.join(", ") : "none yet"}`);
console.log(`PRESERVED founder-curated entries: ${preserved.length}${preserved.length ? " (" + preserved.join(", ") + ")" : ""}`);
if (autoCapped) for (const l of capLog) console.log(l);
console.log(`TOTALS: strong ${tS} / weak ${tW} / indefensible ${tI}  (of ${ids.length})`);
console.log("\nRANKED TRIAGE (highest risk first):");
for (const r of rows) {
  console.log(
    `  M${String(r.n).padStart(2)} [${r.triage.toUpperCase()}] ${r.s}S/${r.w}W/${r.i}I ` +
    `rubric=${r.rubric} L5=${r.l5}\n      anchor: ${r.anchor}\n      ${r.reason}`
  );
}
const cut = rows.filter((r) => r.triage === "cut").map((r) => "M" + r.n);
const rew = rows.filter((r) => r.triage === "rewrite").map((r) => "M" + r.n);
const keep = rows.filter((r) => r.triage === "keep").map((r) => "M" + r.n);
console.log(`\nCUT: ${cut.join(", ") || "none"}`);
console.log(`REWRITE: ${rew.join(", ") || "none"}`);
console.log(`KEEP: ${keep.join(", ") || "none"}`);
