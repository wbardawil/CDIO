// Read-only audit tooling. Emits per-module input packets for the methodology
// validation research agents. No deps. Run: node scripts/gen-validation-input.js
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const PLAYBOOK = path.join(ROOT, "source-playbook", "01_ASSESSMENT_FRAMEWORK.md");
const QUESTIONS = path.join(ROOT, "src", "lib", "playbook", "diagnostic-questions.ts");
const OUT_DIR = process.argv[2] ||
  path.join(process.env.USERPROFILE || process.env.HOME, ".gstack", "projects",
            "wbardawil-CDIO", "citation-audit", "input");

// v1 anchor seed (from docs/STANDARDS-VALIDATION.md — the cross-walk to harden)
const V1_ANCHOR = {
  1: "Gartner CIO Leadership Model",
  2: "KPMG 4-Practice Alignment + MIT Strategic Alignment Model (Henderson & Venkatraman 1993)",
  3: "TOGAF (ADM phases) + Gartner Application Modernization (5 Rs)",
  4: "AWS Well-Architected Framework (6 pillars) + FinOps Foundation Framework",
  5: "NIST CSF v2.0 (6 functions GV/ID/PR/DE/RS/RC) + CMMI",
  6: "NIST AI RMF (GOVERN/MAP/MEASURE/MANAGE) + DAMA-DMBOK 2 (11 knowledge areas)",
  7: "TOGAF integration patterns + Postman API Maturity Model (5 stages)",
  8: "Gartner Analytics Maturity Model (Descriptive/Diagnostic/Predictive/Prescriptive)",
  9: "Forrester CX Index (Effectiveness/Ease/Emotion) + Service Design / HCD principles",
  10: "HBR leadership literature + IT-CMF (Innovation Value Institute)",
  11: "ITIL 4 (4 dimensions of service management)",
  12: "TBM Council Taxonomy (4 layers) + KPMG Return on Objectives",
  13: "Gartner IT Portfolio & Project Mgmt (ITPPM) + SaaS optimization practices",
  14: "DORA 4 key metrics + SAFe core competencies",
  15: "APQC Process Classification Framework (PCF) + Lean Six Sigma DMAIC",
  16: "Prosci ADKAR (5 outcomes) + Kotter 8-Step",
};

function parsePlaybook() {
  const lines = fs.readFileSync(PLAYBOOK, "utf-8").split(/\r?\n/);
  const mods = {};
  let cur = null, curSub = null, inScoring = false;
  for (const line of lines) {
    const mod = line.match(/^###\s+MODULE\s+(\d+):\s*(.+?)\s*$/);
    if (mod) { cur = mods[+mod[1]] = { n: +mod[1], playbook_title: mod[2], subcategories: [], levels_1_to_4: {} }; curSub = null; inScoring = false; continue; }
    if (!cur) continue;
    if (/^\*\*Maturity Scoring:\*\*/.test(line)) { inScoring = true; curSub = null; continue; }
    const sub = line.match(/^\*\*\d+\.\d+\s+(.+?)\*\*\s*$/);
    if (sub && !inScoring) { curSub = { name: sub[1].trim(), questions: [] }; cur.subcategories.push(curSub); continue; }
    const q = line.match(/^□\s*(.+?)\s*$/);
    if (q && curSub) { curSub.questions.push(q[1]); continue; }
    const lvl = line.match(/^-\s*\*\*Level\s+(\d)\*\*:\s*(.+?)\s*$/);
    if (lvl && inScoring) cur.levels_1_to_4["level_" + lvl[1]] = lvl[2];
  }
  return mods;
}

function parseRubricL5() {
  const ts = fs.readFileSync(QUESTIONS, "utf-8");
  const out = {};
  const rb = ts.match(/const LEVEL_RUBRIC[^=]*=\s*\{([\s\S]*?)\n\};/);
  if (rb) {
    const blockRe = /(\d+):\s*\{([\s\S]*?)\},/g;
    let b;
    while ((b = blockRe.exec(rb[1]))) {
      const l5 = b[2].match(/l5:\s*"((?:[^"\\]|\\.)*)"/);
      if (l5) out[b[1]] = JSON.parse('"' + l5[1] + '"');
    }
  }
  return out;
}

function parseIds() {
  const ts = fs.readFileSync(QUESTIONS, "utf-8");
  const map = {};
  const re = /id:\s*"(m(\d+)_q\d+)"\s*,\s*module_number:\s*(\d+)\s*,\s*subcategory:\s*"((?:[^"\\]|\\.)*)"\s*,\s*question:\s*"((?:[^"\\]|\\.)*)"/g;
  let m;
  while ((m = re.exec(ts))) {
    const n = +m[3];
    (map[n] = map[n] || []).push({ id: m[1], subcategory: JSON.parse('"' + m[4] + '"'), question: JSON.parse('"' + m[5] + '"') });
  }
  return map;
}

const pb = parsePlaybook();
const l5 = parseRubricL5();
const ids = parseIds();
fs.mkdirSync(OUT_DIR, { recursive: true });
for (let n = 1; n <= 16; n++) {
  const packet = {
    module: n,
    playbook_title: pb[n].playbook_title,
    v1_anchor_seed: V1_ANCHOR[n],
    subcategories: pb[n].subcategories,
    questions: ids[n], // [{id, subcategory, question}] — verbatim, fidelity-verified
    level_1_to_4_verbatim: pb[n].levels_1_to_4, // playbook canonical
    level_5_ai_cdio_extension: l5[String(n)], // graded extension-by-design
  };
  fs.writeFileSync(path.join(OUT_DIR, `module${String(n).padStart(2, "0")}.json`),
    JSON.stringify(packet, null, 2));
}
console.log("wrote 16 input packets to " + OUT_DIR);
