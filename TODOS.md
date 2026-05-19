# TODOS

Deferred work, captured with enough context to act cold. Created 2026-05-19 by
the `/plan-eng-review` bank-wide methodology-validation workstream.

---

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

---

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

---

## 3. EXPERIENCE-SPINE step-1 — deferred items (from /plan-eng-review v2, 2026-05-19)

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
