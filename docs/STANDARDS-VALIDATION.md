# Standards Validation v2.0 — 128 Questions vs. Authoritative Sources (strict bar)

> ### 📣 v2.1 ADDENDUM (2026-05-19, after the rebuild)
>
> The "30% strong / 81 weak / 9 indefensible" headline below is the **pre-rebuild snapshot.** The defensibility-bar rebuild has since shipped on branch `claude/loving-tesla-b61c25`:
>
> - **Current bank state: 124 strong / 4 weak / 0 indefensible** (was 38 / 81 / 9).
> - All 16 modules founder-ratified at the per-module gate (5 human, 11 autonomous under explicit "allow all for this job" authorization — recorded as async-review-pending in `scripts/ratified-modules.json`).
> - Product UI wired through `cite(id)` (Step C-2 — commit `c4334a8`) so the authoritative named-construct citation now displays in `assessment-form.tsx` in place of the generic "AI-CDIO Source Playbook" label.
> - The 4 remaining weak (`m14_q3`, `m15_q5`, `m15_q7`, `m16_q8`) are **deliberate honest exceptions** — anti-hallucination over-rode the all-strong preference (each carries a one-line founder reword that lifts it to strong; see `TODOS.md` §3a).
> - **Human-scannable scorecard:** [`docs/QUESTION-REVIEW.md`](QUESTION-REVIEW.md) — one page, 16 modules.
> - **"CEO-facing what you can say" claims in Section 3 below are pre-rebuild.** Post-rebuild the honest claim is *"every question maps to a specific named construct in a recognized authoritative source — public + fetch-verified where the source is public, precise standard-clause citation where paywalled (ITIL/COBIT/ISO/SAFe/TOGAF). 124 of 128 questions clear this defensibility bar; the 4 that don't are honestly flagged."*
>
> The v2.0 body below is preserved unchanged as the **historical "before" snapshot** that motivated and grounded the rebuild.

---

**Version:** 2.0
**Date:** 2026-05-19
**Supersedes:** v1.0 (now `docs/STANDARDS-VALIDATION-v1-ARCHIVED.md`, immutable)
**Superseded by:** v2.1 ADDENDUM above (rebuild shipped)
**Produced by:** `/plan-eng-review` bank-wide methodology-validation workstream
**Scope:** All 128 verbatim playbook questions + 16 maturity rubrics + 16 level_5 extensions in `src/lib/playbook/diagnostic-questions.ts`

> **Bottom line.** Under a strict, publicly-verifiable, WebFetch-verified bar:
> **38 strong / 81 weak / 9 indefensible (30% strong)** — not v1's implied
> 128/128 (100%) mapping density. The questions are an honest verbatim
> extraction of the source playbook (fidelity check: 128/128 pass, zero
> drift). The gap is **defensibility**, not fidelity: most "weak" is because
> the anchor framework is paywalled / auth-gated (Gartner, TOGAF/Open Group
> OAuth, ITIL/AXELOS, ISO, DMBOK2 book) and therefore cannot be publicly
> verified at the named-construct level, not because the question is bad.
> **No question wording or rubric text was changed.** This document grades and
> cites; content fixes are the separate founder-adjudicated pass (`TODOS.md`).

## What changed from v1 (and why the numbers dropped)

| | v1.0 (archived) | v2.0 (this doc) |
|---|---|---|
| Method | bucket cross-walk: map each Q to a framework *category* | strict grade: map to a **specific named construct**, WebFetch-verified |
| Evidence | "from public documentation" (general) | a **resolvable URL + exact quoted text** per Strong; recorded |
| Paywalled | mapped at category level, counted | **cannot be Strong** → capped Weak (deterministic, in the builder) |
| Verifier trust | trusted | **not trusted** — 12 over-graded entries auto-capped Strong→Weak by `scripts/build-question-citations.js`; `scripts/validate-citations.js` blocks commit on any violation |
| Headline | "mapping density 100%, coverage 75-80%" | **38 strong / 81 weak / 9 indefensible** |

The bar is the founder's own `1127291` directive ("each question maps to a
specific named construct in a publicly verifiable framework — not just a
framework name"). Tier-1 (ISO/IEEE/NIST, peer-reviewed, recognised consortia)
+ tier-2 (Gartner/Forrester/McKinsey published *research*) are Strong-eligible;
analyst blogs / trend pieces / vendor marketing are not.

---

## SECTION 1 — RANKED TRIAGE (the founder decision)

Ranked highest-risk first. **Triage verdict is a recommendation; you decide
per item.** "Keep" = anchor is sound and publicly verifiable, questions are
salvageable as-is; "Rewrite" = several weak/indefensible or the anchor is
inaccessible, needs re-anchoring or new questions. **0 modules graded "cut".**
Nothing here is client-visible — every `question-citations.ts` entry is
`clientVisible:false` until you approve it.

| Rank | Module | Verdict | S/W/I | Rubric | L5 | The call to make |
|---|---|---|---|---|---|---|
| 1 | **M8** Analytics & BI | REWRITE | 0/6/2 | weak | ok | Anchor (Gartner Analytic Ascendancy) is paywalled — nothing verifiable. Re-anchor to a tier-1/peer-reviewed analytics-maturity construct, or accept "weak". m8_q4, m8_q7 indefensible (org-structure, no construct). |
| 2 | **M10** Leadership & Comms | REWRITE | 0/6/2 | weak | **overreach** | Only 2 Qs tied to a real construct (Bass&Avolio Four I's), both paywall-capped. m10_q4 ("relationships strong?") + m10_q8 ("stories to inspire") indefensible. **level_5 overclaims** beyond the leadership anchor — the only non-coherent L5. |
| 3 | **M15** Process Automation | REWRITE | 2/4/2 | weak | ok | v1's own warning confirmed: APQC PCF is a *classification taxonomy*, not a maturity probe. m15_q5 (RPA), m15_q7 (AI-for-automation, mis-anchored to NIST AI RMF which governs AI *risk*) indefensible. DMAIC half (q2,q3) holds. |
| 4 | **M14** Delivery/DevOps | REWRITE | 1/6/1 | weak | ok | v1's "0/4 direct DORA metrics" confirmed. Questions probe DORA *capabilities* (defensible) but **measure no DORA metric**. m14_q3 indefensible — pins to "velocity/burndown"; the Scrum Guide explicitly does not define velocity. |
| 5 | **M13** Portfolio & Vendor | REWRITE | 0/7/1 | weak* | ok | Portfolio Qs map to Gartner ITScore PPM but Gartner is paywalled→capped. Vendor Qs only reach paywalled ISO 37500. m13_q6 indefensible. Rubric was Strong but auto-capped (paywalled source). |
| 6 | **M7** Platforms/APIs | REWRITE | 0/8/0 | weak | ok | **v1's "Postman API Maturity Model" anchor is unverifiable / likely fabricated — must never be cited.** Re-anchored to peer-reviewed API-m-FAMM (public-summary→capped). Product-Thinking half rests on practitioner books only. |
| 7 | **M11** Org Structure | REWRITE | 0/8/0 | weak | ok | ITIL 4 maps the questions well at dimension level but the ITIL 4 body is AXELOS-paywalled → nothing clears Strong. Salvageable by re-anchoring to the public ITIL 4 dimension definitions. |
| 8 | **M1** Tech Leadership | REWRITE | 3/5/0 | weak | ok | v1 anchor (Gartner CIO Leadership Model) is Gartner-paywalled (HTTP 403). Re-anchored 3 Qs to Weill&Ross + COBIT EDM01 + SAM (public). 5 Qs are org-design good-practice with no single named construct. |
| 9 | **M3** EA & Modernization | REWRITE | 3/5/0 | weak | ok | v1 anchors TOGAF ADM + Gartner 5R are **auth-gated** (Open Group now OAuth-redirects). Re-anchored 3 Qs to COBIT APO03 (public). Modernization Qs are generic good-practice. |
| 10 | **M6** Data & AI | REWRITE | 4/4/0 | weak | ok | AI half (q5-q8) strong on public NIST AI RMF. Data half weak only because DMBOK2 book is paywalled — re-anchor those 4 to a public tier-1/2 data-governance source to lift them. |
| 11 | **M16** Workforce & Change | KEEP | 4/3/1 | weak | ok | Change-mgmt Qs (q1-q4) map cleanly to public Prosci/Kotter constructs. Talent Qs weaker (ADKAR is individual-change, not workforce L&D). m16_q8 indefensible (forward-looking, no construct). |
| 12 | **M2** Tech Strategy | KEEP | 3/5/0 | weak | ok | 3 strong on public COBIT APO02 + Henderson&Venkatraman SAM. v1's "KPMG 4-Practice" is marketing, not research — demoted to orienting taxonomy only. |
| 13 | **M9** CX & Journey | KEEP | 3/5/0 | weak | ok | Journey/HCD Qs map to Service Design + ISO 9241-210. CX-metric Q anchored to Forrester public CX Index. Solid anchor, several Qs just framework-level. |
| 14 | **M12** Tech Finance | KEEP | 1/7/0 | weak | ok | Anchor (TBM Council + FinOps Foundation) is public and sound; only m12_q8 (FinOps Optimize, names FinOps explicitly) clears Strong. KPMG ROO is methodology-only. Salvageable. |
| 15 | **M4** Cloud & Infra | KEEP | 6/2/0 | **strong** | ok | Second-best. Public AWS Well-Architected pillars + FinOps phases; 6/8 map to named pillar constructs; rubric strong. |
| 16 | **M5** Security/Risk | KEEP | **8/0/0** | **strong** | ok | **Gold standard.** Every Q maps near-verbatim to a named NIST CSF 2.0 subcategory (public-full). Rubric matches CSF Tiers. *Caveat (v1-flagged, confirmed): no RECOVER-function question — `level_5` "security-mature" is overclaimed without an RC probe; add one in the second pass.* |

**Indefensible questions (9), for the second-pass rewrite/cut list:**
`m8_q4`, `m8_q7`, `m10_q4`, `m10_q8`, `m13_q6`, `m14_q3`, `m15_q5`, `m15_q7`, `m16_q8`.

**Auto-capped Strong→Weak by deterministic enforcement (12)** — the agent
graded these Strong; the builder rejected them because the source was
paywalled/summary-only or not fetch-verified (the validator-self-hallucination
defense, working):
`m7_q2/q3/q4`, `m9_q1/q7`, `m10_q1/q2`, `m12_q1/q2`, `m13_q1/q3/q4`.

---

## SECTION 2 — Per-module detail

Each module's authoritative citation (framework, named construct, locator,
quoted text, grade, semanticPass) is machine-readable in
`src/lib/playbook/question-citations.ts` (all `clientVisible:false`).

- **M1 Tech Leadership** — anchor: Weill & Ross IT Governance (MIT CISR) + COBIT 2019 EDM01 + Henderson&Venkatraman SAM (Gartner CIO model paywalled, rejected). Strong: m1_q3,q4,q5. Rubric weak. L5 coherent.
- **M2 Tech Strategy** — COBIT 2019 APO02 (public-full) + H&V SAM. Strong: m2_q1,q2,q5. KEEP.
- **M3 EA & Modernization** — COBIT 2019 APO03 (public). TOGAF/Gartner 5R auth-gated→capped. Strong: m3_q1,q2,q3.
- **M4 Cloud & Infra** — AWS Well-Architected + FinOps Foundation (public-full). Strong: m4_q3,q4,q5,q6,q7,q8. Rubric strong. KEEP.
- **M5 Security/Risk** — NIST CSF 2.0 (NIST CSWP 29, public-full, verbatim). Strong: all 8. Rubric strong (CSF Tiers). Gap: no RECOVER question.
- **M6 Data & AI** — NIST AI RMF (public-full) AI half; DAMA-DMBOK2 (book paywalled→cap) data half. Strong: m6_q5,q6,q7,q8.
- **M7 Platforms/APIs** — API-m-FAMM peer-reviewed (public-summary→cap). **v1 "Postman 5-stage model" discarded as unverifiable.** Strong: none.
- **M8 Analytics/BI** — Gartner Analytic Ascendancy (paywalled→cap). Strong: none. Indefensible: m8_q4, m8_q7.
- **M9 CX & Journey** — Service Design 5 principles + ISO 9241-210 + Forrester CX Index. Strong: m9_q2,q3,q5. KEEP.
- **M10 Leadership/Comms** — Bass&Avolio Four I's (paywall-capped). Strong: none. Indefensible: m10_q4, m10_q8. **L5 overreach.**
- **M11 Org Structure** — ITIL 4 Four Dimensions (AXELOS-paywalled→cap). Strong: none.
- **M12 Tech Finance** — TBM Council Taxonomy + FinOps Foundation (public). Strong: m12_q8. KEEP.
- **M13 Portfolio/Vendor** — Gartner ITScore PPM (paywalled→cap) + ISO 37500 (paywalled). Strong: none. Indefensible: m13_q6. Rubric auto-capped.
- **M14 Delivery/DevOps** — DORA dora.dev (public) + Agile Manifesto + Scrum Guide. Strong: m14_q7. Indefensible: m14_q3. **Confirmed: 0 questions measure a DORA metric.**
- **M15 Process Automation** — Lean Six Sigma DMAIC + APQC PCF (taxonomy, not maturity probe). Strong: m15_q2,q3. Indefensible: m15_q5, m15_q7.
- **M16 Workforce/Change** — Prosci ADKAR + Prosci 3-Phase + Kotter 8-Step (public). Strong: m16_q1,q2,q3,q4. Indefensible: m16_q8. KEEP.

All 16 `level_5` extensions are `coherent-extension` **except M10 (overreach)**.
`level_5` is an explicit AI-CDIO extrapolation beyond the playbook — graded on
coherence, not source-fidelity (by design).

---

## SECTION 3 — What you can and cannot say (CEO-facing, corrected)

This **replaces** v1's "What This Audit Lets You Say" section. The v1 wording
("mapping density 100%, 75-80% coverage") is **not defensible** and must not be
used.

**You CAN say:**
- "Every assessment question is a verbatim extraction of our published source
  methodology — fidelity is independently checked (128/128, zero drift)."
- "We ran a strict external-source validation. Where a question maps to a
  publicly verifiable named construct in a recognised standard, we cite it
  explicitly (e.g., Module 5 → NIST CSF 2.0 subcategories verbatim; Module 4 →
  AWS Well-Architected pillars)."
- "Security (M5) and Cloud (M4) are anchored to public tier-1 standards at the
  named-construct level."

**You CANNOT say (yet):**
- "100% of questions map to a standard." (True figure: **30% clear the strict
  public-construct bar**; 63% are framework-level/paywalled-anchor; 7% have no
  authoritative anchor.)
- "We measure NIST CSF subcategories / DORA metrics." (We measure maturity
  *proxies*; M14 measures **no** DORA metric.)
- Any module-level standards claim for M7, M8, M10, M11, M13 — their anchors are
  unverifiable, paywalled, or (M7) were fabricated in v1.

The honest framing for product/board use: *"questions authored verbatim from
the AI-CDIO playbook; independently validated as mapping to <named construct>
in <framework> where that mapping is publicly verifiable."* Never "Source: NIST."

---

## Methodology, provenance, regeneration

- **Fidelity:** `scripts/validate-citations.js` (REGRESSION/IRON gate) — 128
  questions + subcategories + level_1..4 are byte-faithful (normalised) to
  `source-playbook/01_ASSESSMENT_FRAMEWORK.md`. Result: PASS, 0 drift.
- **Research:** 4 read-only agents, one per 4-module batch, WebSearch +
  WebFetch, seeded from v1 anchors but independently verifying every construct.
- **Enforcement:** `scripts/build-question-citations.js` deterministically caps
  any Strong lacking a fetched public-full source / locator / semanticPass
  (12 capped). `scripts/validate-citations.js` Step C blocks commit on any
  residual invariant violation. Automation enforces *metadata integrity only* —
  semantic mapping truth is the founder triage gate's job (Codex #15).
- **Machine artifact:** `src/lib/playbook/question-citations.ts`
  (`Record<questionId, AuthoritativeCitation>`, 128 entries, all
  `clientVisible:false`). Not yet wired into the product — Step C-2 (founder-
  gated) flips approved survivors and rewires `diagnostic-questions.ts`.
- **Regenerate when:** a standard releases a major version; a question/rubric
  changes; or the founder adjudication pass re-grades items.

## Confidentiality

This audit used only public external sources and the founder's own playbook.
No client/customer/vendor/person/deal appears here or in any artifact, per the
project's absolute confidentiality rule.
