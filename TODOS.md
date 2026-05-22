# TODOS

> **⚡ 2026-05-21 pivot:** the project pivoted to the **CDIO Review Cockpit** (see the `CLAUDE.md` CURRENT DIRECTION banner). Most items below are *destination-product* TODOs, not current scope. Current TODOs = the cockpit plan's build order (`C:/Users/Dell/.claude/plans/i-ve-done-it-wrong-serene-minsky.md`). Do not action an item below as live work without checking it against the cockpit plan first.

Deferred work, captured with enough context to act cold. Created 2026-05-19 by
the `/plan-eng-review` bank-wide methodology-validation workstream.

---

## ✅ 1. Founder-adjudicated second pass — DONE (2026-05-19, branch `claude/loving-tesla-b61c25`)

**Shipped** as the defensibility-bar rebuild. All 16 modules ratified at the
per-module founder gate (M12, M13, M2, M8, M10 human-ratified at AskUserQuestion
gates; M7, M11, M14, M15, M1, M3, M4, M5, M6, M9, M16 ratified autonomously
under explicit founder "allow all for this job" authorization, recorded as
async-review-pending in `scripts/ratified-modules.json`).

**Result:** bank moved from 38 strong / 81 weak / 9 indefensible → **124 strong
/ 4 weak / 0 indefensible**. The 4 remaining weak (`m14_q3`, `m15_q5`,
`m15_q7`, `m16_q8`) are deliberate honest exceptions — anti-hallucination
over-rode all-strong; each is flagged with a one-line founder reword that
lifts it to strong. The M5 RECOVER-function gap (no RC.* probe) was flagged
NOT auto-fabricated; founder decides whether to add a 9th M5 question.
M10's `level_5` overreach was rewritten within the FRL anchor.

**See:** `docs/QUESTION-REVIEW.md` (one-page digest), `scripts/ratified-modules.json`
(per-module ledger with reasoning + alternatives considered).

**Original content for history:**

<details><summary>(archived) original deferred-work description</summary>

## 1. Founder-adjudicated second pass — content fixes to weak/indefensible questions

**What:** Run the adjudication + content-fix pass over the items the strict
validation flagged. Source of truth: `docs/STANDARDS-VALIDATION.md` v2.0
Section 1 (ranked triage) and the machine map
`src/lib/playbook/question-citations.ts`.

**Why:** This validation deliberately stopped at "report + you decide" (locked
decision). The report is only half the value; without the fix pass the weak
content stays and the credibility outcome never ships. 9 questions are
**indefensible** (`m8_q4, m8_q7, m10_q4, m10_q8, m13_q6, m14_q3, m15_q5,
m15_q7, m16_q8`); 81 are **weak**; M10's `level_5` is **overreach**; M5 has a
confirmed **RECOVER-function gap** (no RTO/RPO question).

**Pros:** Turns a 30%-strong bank into a defensible one; closes v1's
long-known gaps (DORA metrics, M5 Recover, M15 APQC) with intent, not drift.

**Cons:** Scopes a follow-on effort; per-item founder judgement is required
(cannot be fully automated); rewriting question wording **partially overrides
the `96dd36a` verbatim-from-playbook constraint** — that override is legitimate
only per item the founder explicitly approves.

**Context / where to start:** Work the triage table top-down (M8, M10, M15,
M14 first — highest risk). For each flagged item: keep / rewrite to match the
verified construct / cut. Re-anchorable modules (M1→Weill&Ross+COBIT,
M3→COBIT APO03, M6 data half→public data-governance, M8→public analytics
model, M11→public ITIL dimension defs) can lift to Strong with citation-only
changes (no wording change). M7's old "Postman API Maturity Model" anchor was
fabricated in v1 — never reinstate it.

**Depends on / blocked by:** This validation pass (done). Feeds **Step C-2**
of the approved plan: after the founder triage gate, the single writer rewires
`diagnostic-questions.ts` via `cite(id)` and flips `clientVisible=true` only
for founder-approved survivors. Re-run `scripts/validate-citations.js` after.

</details>

---

## ✅ 2. Dead-helper cleanup + Step C-2 product-wiring — DONE (2026-05-19)

**Shipped** in commit `c4334a8`. `diagnostic-questions.ts` is now wired through
`cite(id)` (added) which resolves to the authoritative named-construct citation
from `question-citations.ts` when the question's module is founder-ratified
(`clientVisible:true`) and `grade !== "indefensible"`; falls back to a generic
playbook citation otherwise. The old generic `citation()` helper is removed
(zero remaining callers). All 128 callsites rewired by the one-shot
`scripts/wire-cite.js`. Result: the product UI now surfaces e.g. "COBIT 2019
(ISACA) — EDM01 'Ensured Governance Framework Setting and Maintenance'" in
place of the prior generic "AI-CDIO Source Playbook" label.

`validate-citations.js` PASS, no new tsc errors. Next build must be verified
locally on a workspace with `node_modules` installed (this worktree has none).

**Original for history:**

<details><summary>(archived) original deferred-work description</summary>

## 2. Dead-helper cleanup (fast-follow)

**What:** Once `src/lib/playbook/question-citations.ts` is verified to cover
all 128 ids and `diagnostic-questions.ts` is rewired through `cite(id)`
(Step C-2), remove the now-legacy generic `citation()` and `prov()` helpers
and the generic-citation fallback path in `diagnostic-questions.ts`.

**Why:** DRY — two citation mechanisms (generic helper + authoritative map) is
exactly the duplication to avoid; the stale generic `"AI-CDIO Source Playbook"`
string should not linger and silently mask a missing map entry.

**Pros:** One citation path; no dead code; a missing entry fails loudly instead
of falling back to a generic string.

**Cons:** Minor; must confirm zero remaining `citation()` / `prov()` callers
first (grep `src/`).

**Context / where to start:** `scripts/validate-citations.js` already asserts
128/128 coverage and no orphan keys — gate the removal on that passing. Trivial
once Step C-2 lands.

**Depends on / blocked by:** Step C-2 (founder-gated) must complete and
`scripts/validate-citations.js` must report 128/128 with zero orphans.

</details>

---

## 3. Founder-judgment fast-follows from the autonomous rebuild (NEW, 2026-05-19)

Flagged in the autonomous batch-2/3 pass, deliberately NOT done because they
need founder judgment (anti-hallucination > all-strong).

- **(3a) 4 honest WEAK rewordings** — each lifts to strong on a single
  one-line edit, suggested in `docs/QUESTION-REVIEW.md` top section:
  - `m14_q3` "Are Agile metrics tracked (velocity, burndown, etc.)?" →
    reword to reference DORA Four Keys → DORA strong.
  - `m15_q5` "Is RPA or automation technology in use?" → reword toward
    automation-as-solution-within-process-improvement → DMAIC Improve strong.
  - `m15_q7` "Is AI used for process automation?" → reword toward
    GOVERNANCE of AI in automation → NIST AI RMF strong.
  - `m16_q8` "Are emerging skills (AI, cloud, etc.) being developed?" →
    reword toward concrete ongoing tech-skill development → COBIT APO07
    strong.
- **(3b) M5 RECOVER-function gap.** No RC.* probe (RTO/RPO/recovery
  exercised); `level_5` lightly overclaims security maturity. Per the
  standing rule against auto-inventing question content, the autonomous
  pass did NOT add a 9th M5 question. Founder action: decide whether to
  add e.g. "Are recovery-time/recovery-point objectives defined, exercised
  and met?" anchored to NIST CSF 2.0 RC.RP-* / RC.CO-* subcategories.
- **(3c) Async founder review of the autonomous module ratifications.**
  Modules 7, 11, 14, 15, 1, 3, 4, 5, 6, 9, 16 were ratified under
  founder "allow all" authorization (founder asleep) and recorded as
  `async review pending` in `scripts/ratified-modules.json`. Reverting any
  single module = remove it from `ratifiedModules`; the builder un-locks
  and falls back to the audit grade. Non-destructive.

---

## 4. EXPERIENCE-SPINE step-1 — deferred items (from /plan-eng-review v2, 2026-05-19)

Step 1 = ship-to-learn on the live vendor-selection engagement. These were
deferred OUT of step 1 deliberately; capture so they are not lost.

- **(3a) Unused `@react-pdf/renderer` dependency.** In package.json, zero
  `src/` imports. Decide: remove, or wire when render is automated. Blocked
  by 3b.
- **(3b) Render automation.** Once the distilled selection-content recipe is
  "distilled gold" (proven on ≥1 real engagement), automate doc generation
  (the external doc-skill path → a built renderer). Founder-gated on content
  being proven first. This is the deferred half of EXPERIENCE-SPINE Law 6.
- **(3c) `/plan-eng-review` the `EngagementState` primitive.** When step-1's
  passive shadow log (see step-1 plan item, Tension B) has real captured
  data, run the architecture review of the primitive grounded in that data,
  not in the spec. Blocked by: step-1 dogfood complete.
- **(3d) Tier-1 hardening.** EXPERIENCE-SPINE Tier-1 is currently an honest
  self-certified "decision gate passed" process fact, NOT a quality measure
  (Codex 2026-05-19 catch). Promotion to a real measure needs a hard rubric
  + evidence thresholds + an independent/second check. Deferred to the
  EngagementState primitive review (3c).
- **(3e) `/plan-ceo-review` the 4 carried strategic risks** before any Year-1
  GTM commitment: audit buyer segment is narrower than stated; leverage
  optimizes the cheap part (judgment/presence is the real bottleneck);
  pitch-vs-validated-reality gap (30% strong, see `docs/STANDARDS-VALIDATION.md`
  v2.0); the anonymized-aggregate flywheel is re-identifiable at low N
  (Year-2+ mechanism, not Year-1).

**Context:** all five fall out of the EXPERIENCE-SPINE v2 eng-review. None
block step 1. Source of truth for step-1 scope is the locked plan in the
review (P0 expanded data-surface gate → npm ci → Selection Engine distilled
content → external doc-gen → content-layer safety + passive shadow log).
