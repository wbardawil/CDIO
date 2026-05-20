# Cross-Mapping Engine — Build Plan

**Status:** scoped 2026-05-19; **NEXT STEP: run `/plan-eng-review` on this document** (mandatory gate per `CLAUDE.md` before any architecture commit).
**Owner:** founder (Wadi).
**Author:** Claude (scoping pass per founder direction "go as scoped + IT Manager persona committed + /plan-eng-review first").
**Why this build:** highest-leverage next build identified in the 2026-05-19 product feedback analysis — converts data we already have (the 124 ratified named-construct citations from the defensibility-bar rebuild) into a feature no fractional or mid-market governance tool currently offers at this granularity. Anchors the IT Manager persona (added 2026-05-19) via Coach Mode.

---

## What it is — one paragraph

Every one of the 128 ratified questions already maps to one named construct in a recognized framework. The cross-mapping engine stores the **machine-readable equivalences between those constructs across frameworks** — so a single assessment of (say) Module 5 at Level 3 simultaneously reads as *"NIST CSF 2.0 Identify+Protect mostly covered"*, *"COBIT 2019 EDM03 + APO13 partly covered"*, *"ISO 27001 Annex A.5/A.6 substantially covered"*, *"SOC 2 CC1+CC6 covered"*, *"HIPAA Security Rule §164.308(a)(1) covered"*. One assessment, six audit-ready views. Plus the inverse: **gap analysis** ("the four NIST CSF subcategories your maturity does NOT currently cover, and the questions to close them").

Then **Coach Mode** layers on top: per-question, surfaces the level-up move + the executive-language translation + the framework vocabulary in plain English. This is the IT Manager unlock — same data, different lens.

---

## Why this is the right next build — five tests

| Test | Cross-mapping engine |
|---|---|
| **Data exists?** | Yes — the 128 ratified citations are exactly the source for one side of the mapping. No new methodology research needed for ~80% of it. |
| **Differentiator no one else has?** | At this granularity (per-question crosswalks anchored to verified citations), yes. GRC tools (Vanta/Drata) crosswalk *compliance frameworks*; nobody crosswalks *maturity-assessment outputs* to multiple frameworks at the question level. |
| **Every persona benefits?** | CEO: "audit ready in 6 frameworks". CIO: "regulatory coverage view". IT Director: "what to tell the auditor". IT Manager: "what frameworks am I learning". Fractional: "I can sell one engagement that produces 6 deliverables". |
| **Marketing artifact-able?** | "Your one assessment satisfies 6 frameworks" is a sharper outbound hook than "we're anchored to 25+ standards". |
| **Reversible if wrong?** | Yes — additive feature, no breaking changes to existing assessment flow. Crosswalks live in a separate table; can be turned off per-customer or per-framework. |

All five pass. None of the other queued items (Quick Scan upgrade, white-label, mobile, runtime monitoring) pass all five.

---

## Architecture sketch — three new data tables, one new surface per existing screen

```sql
-- The framework registry (≈30 entries seed from existing citations)
CREATE TABLE frameworks (
  id          text PRIMARY KEY,         -- e.g. "nist-csf-2.0"
  name        text NOT NULL,            -- "NIST Cybersecurity Framework 2.0"
  version     text NOT NULL,
  type        text NOT NULL,            -- standard-body | consortium | peer-reviewed | analyst-tier2
  access      text NOT NULL,            -- public-full | public-summary | paywalled
  primary_url text,
  notes       text
);

-- Atomic named constructs within a framework (≈500-800 seed)
CREATE TABLE framework_constructs (
  id           text PRIMARY KEY,        -- e.g. "nist-csf-2.0/ID.AM-1"
  framework_id text NOT NULL REFERENCES frameworks(id),
  code         text NOT NULL,           -- "ID.AM-1" or "EDM02" or "APO05.04"
  title        text NOT NULL,           -- verbatim from source
  description  text,
  locator      text,                    -- URL or precise clause string
  paywalled    boolean DEFAULT false,
  UNIQUE (framework_id, code)
);

-- The crosswalks (the actual IP — ≈300-1000 mappings to start)
CREATE TABLE construct_crosswalks (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id       text NOT NULL REFERENCES framework_constructs(id),
  target_id       text NOT NULL REFERENCES framework_constructs(id),
  mapping_type    text NOT NULL,        -- equivalent | partial | subset | adjacent
  confidence      text NOT NULL,        -- high | medium | low
  rationale       text NOT NULL,
  evidence_url    text,                 -- official crosswalk if one exists
  client_visible  boolean DEFAULT false,
  reviewer        text NOT NULL,
  ratified_on     date
);
```

Each existing question in `question-citations.ts` already points at a `framework_construct` (informally today — formalising it is a small migration into the new schema). The **crosswalk table is the new IP**.

### Four UI surfaces (each shippable independently)

1. **Per-question "Also satisfies" panel** in the assessment form — small inline expander showing 0-5 related constructs in other frameworks. *Lowest cost, biggest perceived-value lift for the IT Manager (this is the vocabulary bridge).*
2. **Per-assessment Coverage Heatmap** — one assessment → coverage % across 6-12 selected frameworks. *The "six audit-ready views from one assessment" marketing payoff.*
3. **Gap Analysis Report per framework** — for a chosen framework, list the constructs your current maturity does NOT cover + the questions/actions to close them. *Drives the next-engagement upsell.*
4. **Coach Mode overlay** (the IT Manager surface) — per-question: "you answered Level 2; here's what Level 3 looks like; here's how to say this to the CEO; here's the named-construct vocabulary you just used." *Turns the assessment into a learning loop.*

---

## Build phases — sized realistically

| Phase | Scope | Effort | Founder-judgment load |
|---|---|---|---|
| **0. /plan-eng-review** the engine before code | Per CLAUDE.md mandatory gate | 0.5 day | 1 review session |
| **1. Data foundation** | Schemas, migrations, seed `frameworks` + `framework_constructs` from the 128 citations (mostly automatable from `question-citations.ts`) | 3-4 days | Spot-check |
| **2. Crosswalk authoring (P0 set)** | Seed the first ~150 high-confidence mappings: NIST CSF↔COBIT↔ISO 27001↔SOC 2 (published official crosswalks — lift, don't author). Then NIST AI RMF↔ISO/IEC 42001↔EU AI Act. Then COBIT EDM/APO↔ITIL 4. **Each ratified per pattern of the question rebuild.** | 5-7 days | Per-batch ratification gate (same as rebuild — 3-5 gates) |
| **3. Per-question "Also satisfies" UI** | Inline panel in `assessment-form.tsx` | 2-3 days | None |
| **4. Coverage heatmap** | New page; coverage calc; visualization | 4-5 days | None |
| **5. Gap analysis report** | Per-framework gap detection + remediation copy | 3-4 days | Light |
| **6. Coach Mode v1** | Per-question level-up + exec translation; growth-path summary. Mostly LLM-generated grounded in citation data + framework metadata. **This is the IT Manager unlock.** | 5-7 days | Per-module ratification of coaching copy (lighter than rebuild — coaching is suggestive, not authoritative) |

**Total: ≈3.5 weeks** of focused work. Founder-ratification gates only for crosswalks (~5 sessions) and Coach Mode content (~16 sessions, can batch). Each phase ships independently — could stop after Phase 3 and still have a meaningful product upgrade.

---

## Honest risks

| Risk | Mitigation |
|---|---|
| **Bad crosswalk = trust collapse** (same risk as the rebuild — but bigger because crosswalks compound) | Same defensibility-bar discipline: per-mapping `confidence + rationale + evidence_url`; `client_visible=false` until ratified; validator script gates the commit. Where official published crosswalks exist (NIST→ISO, NIST→COBIT, NIST CSF→HIPAA), lift them rather than authoring. |
| **Crosswalk authoring is real work** — 150-300 mappings means hours, not seconds | Phase 2 sequencing puts the highest-leverage published crosswalks first; only bespoke ones need founder ratification one-by-one. |
| **"Six frameworks satisfied" claim invites audit scrutiny** | Treat the coverage % as **operational pre-audit**, not certification. Marketing copy must say "indicative coverage" not "certified compliant." Audit-firm partnership later for actual letters. |
| **Coach Mode content is partly LLM-generated** | Grounded in the citation data (anti-hallucination already enforced). Founder-ratified per module. Tone-locked via prompt + few-shot examples. **Coach Mode marked separately from the authoritative citation — it's suggestive, not normative.** |
| **Premature in the kill-switch window?** | The 3 weeks of build is real; Phase 0+1+3 (≈1 week) gets you the per-question "Also satisfies" panel — the IT Manager vocabulary bridge AND a marketing demo — before the rest. If even that doesn't fit the kill-switch arithmetic, do **only** Phase 0+1+3 first. |

---

## Anti-hallucination guardrails (carry forward from the rebuild)

- Each crosswalk row carries: `source_construct`, `target_construct`, `mapping_type`, `confidence`, `rationale`, `evidence_url`.
- Cross-mappings to PAYWALLED frameworks (HIPAA detail, ISO 27001 normative) are allowed only if cited to a specific named clause (same bar as the rebuild).
- Founder-ratification per crosswalk batch.
- A `client_visible` flag per crosswalk.
- A validation script (analogue to `scripts/validate-citations.js`) that gates on crosswalk integrity at commit time.

---

## What success looks like

- **Founder-side proof:** take a real M5 (security) assessment from the live engagement, run it through the engine, generate a 1-pager that simultaneously reads as NIST CSF 2.0 maturity, SOC 2 Common Criteria readiness, and ISO 27001 Annex A coverage. **If that one-pager is genuinely useful to the live engagement, the engine is right.**
- **IT Manager-side proof:** walk an IT Manager through one module in Coach Mode. They should finish able to say a single sentence to their CEO in framework language they couldn't have said before.
- **Marketing-side proof:** the outbound hook "one assessment, six audit-ready views" converts measurably better than "anchored to 25+ frameworks".

---

## Founder-approved decisions taken into this plan (2026-05-19)

1. **IT Manager persona is committed** to `CLAUDE.md` as the 5th persona (user + coachee). The cross-mapping engine + Coach Mode are designed with this persona in mind.
2. **Build sequence approved as scoped** — Phase 0 → 1 → 2 → 3 → 4 → 5 → 6.
3. **Coach Mode is in v1** (Phase 6) — not deferred. This is the IT Manager unlock.
4. **`/plan-eng-review` runs FIRST** — before any code is written. This document is the input to that review.

---

## Open questions for `/plan-eng-review` to surface

(Pre-populated suspicions the eng review should pressure-test. The skill should add its own.)

1. **Data model:** is the construct-id format (`framework-id/code`) the right grain? Should `code` be normalized vs verbatim? How do we handle constructs that change codes between framework versions (ITIL 3 → ITIL 4)?
2. **Existing citations migration:** `question-citations.ts` is an in-memory module today. Migrating to the new tables means moving 128 entries from TS to the database. Build a sync script vs make TS the source of truth and generate the DB at build time?
3. **Crosswalk authoring workflow:** how does a founder ratify 150 mappings without it becoming the rebuild gate experience all over again? Batch-by-source-framework? Auto-import for high-confidence published ones and only manually-ratify the bespoke ones?
4. **Validator design:** what's the analogue of `STEP A verbatim fidelity` for crosswalks? Probably: "no client-visible crosswalk that lacks evidence_url for cross-framework claims OR is marked confidence:low without a manual ratification override".
5. **Coverage % math:** is it weighted by question count? By construct count in the target framework? How do we honestly report partial mappings (50% of an ISO Annex A control is covered)?
6. **Coach Mode generation cost:** if Coach Mode content is LLM-generated, are we caching the output per question, or generating on every render? Cost telemetry implication for Tier 1/2 pricing.
7. **Reuse the `ratified-modules.json` ledger pattern** for `ratified-crosswalks.json`? Or new mechanism per scale (1000+ crosswalks doesn't fit a single JSON)?
8. **Test strategy:** what fixtures prove the engine works end-to-end? Likely: a "golden" assessment response running through the engine producing known coverage % outputs.

---

## How to resume in another session

Read order:
1. This file.
2. `CLAUDE.md` Strategic Decisions Already Made (IT Manager line).
3. `src/lib/playbook/question-citations.ts` — the data source.
4. `scripts/ratified-modules.json` — the ratification ledger pattern to mirror.
5. `docs/QUESTION-REVIEW.md` — the existing per-module review pattern.

Then: `Skill(skill="plan-eng-review", args="Review docs/PLAN-cross-mapping-engine.md")` to fire the mandatory gate.
