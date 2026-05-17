# AI-CDIO: Session Handoff

This is the entry point for a fresh Claude Code session. It tells you **where we are**, **what's next**, and the **context required to continue**.

---

## ⛔ CLIENT CONFIDENTIALITY — ABSOLUTE RULE (read first, every session)

Real client / customer / engagement details the founder shares to inform
design or validate the tool are **in-session reasoning ONLY**. NEVER persist
them into code, comments, placeholder/UI copy, prompts, seed/fixture data,
docs, commit messages, or anything that lands in git. Every example must be
invented and obviously fictional. Never name or make identifiable a real
client, vendor, tool, person, deal, price, or situation. Permanent; every
session and agent; a breach is the most serious failure in this project.
Full rule + rationale: `CLAUDE.md` (top).

---

## ▶ START HERE — 2026-05-17 evidence-in handoff (read this FIRST)

Work is on branch **`claude/review-cdio-handoff-4bR8R`**, mirrored to
`main` (Vercel auto-deploys `main`). Spine shipped (prior section) and
the Audit was extended into the product the founder described:
**evidence in → grade → audit-ready initiative.**

### What shipped (this session)
1. **Bulk evidence upload** on the new-audit screen. Drop PDF / Word
   (.docx) / Excel (.xlsx) / text / `.vtt`/`.srt` transcripts; server
   parses them and a Sonnet pass returns a structured intake DRAFT.
   Every field carries provenance (file + verbatim quote + confidence);
   "not found" is shown, never invented. New: `src/lib/audit/
   extract.ts`, `POST /api/audits/extract`.
2. **Per-option file attach** — files dropped on an option are parsed
   (no AI) and appended raw to that option's material. Parse-only
   `mode=parse` on the same route.
3. **Methodology = invisible grader.** The audit run surfaces the few
   best-practice gaps that change the outcome (plain, severity,
   evidence) instead of charts; output now leads with the business
   pain, then verdict + money, then gaps.
4. **Audit-ready initiative.** The audit emits a structured,
   best-practice-shaped plan; one click creates a real Initiative via
   `/api/initiatives`. Audit → Initiative is now a closed loop.
5. **Originals archived** to a private Supabase Storage bucket
   (`audit-evidence`, best-effort) so the verdict is reconstructable
   later. `intake.evidence[]` records the paths.
6. Hardened: honest ~4 MB upload cap (Vercel body limit), audit run
   `max_tokens` 4096 → 8192 (output got bigger), `.vtt/.srt`
   transcripts supported; `.doc/.xls/.ppt` get an actionable
   convert-and-re-upload message (no risky legacy parser shipped).

`intake`/`output` are jsonb → **no DB migration** for any of the above.

### State additions (truthful — must validate)
- **`audit-evidence` Storage bucket dependency.** Created lazily via
  service role on first upload; if the service role can't create
  buckets in the founder's Supabase, originals silently aren't
  archived (extraction still works, files flagged "not archived").
  Go-live item — see DEPLOY.md.
- **Vercel ~4.5 MB request-body limit is real.** Bulk upload capped at
  ~4 MB total; the proper fix (browser → storage presigned upload) is
  deferred. Big files go via per-option attach.
- **`.doc/.xls/.ppt` are not auto-read** (legacy binary; maintained
  pure-JS readers are unmaintained or carry advisories). User must
  Save-As to PDF/.docx/.xlsx.
- **Extraction + grading quality is UNPROVEN.** Not run against a real
  document yet. This is the core risk; founder validation on one real
  decision is the next gate, not more features.
- v10–v15 still NOT applied → "Create this initiative" errors until
  the founder runs them (DEPLOY.md). Audit/extraction work without it.
- **ARCHITECTURE.md was out of date / I skipped it (process miss).**
  Now reconciled: Tech Stack table gains an explicit File/Evidence
  Storage row; AI row corrected to Sonnet 4 `claude-sonnet-4-20250514`
  (doc previously said "4.5+" — founder call: doc matches code, no
  model change). Storage security is **documented + scheduled**, not
  hardened: GAPS **P1-30** (at-rest encryption of archived client
  docs — close before real-client dogfood) and **P1-31** (bucket RLS
  + service-role-off-route, folded into the Day-30 migration).
- **`docs/LEVERS-FRAMEWORK.md` added** (founder request). It is a
  reference lens, NOT an operating override and NOT in the Read-First
  chain. Fit review in-file: adopt pillars 3 (test-before-heavy-code,
  applied first to the UNPROVEN extraction/grading) + 4 (a *leading*
  indicator for `OUTCOMES.md`); park pillars 2 + 5 (revenue formula /
  financial model) to Phase 2 Day 37-38 — they tension the locked
  "Year-1 metric is outcomes, not customer count" decision.

### Next
1. Founder runs ONE real decision end-to-end (evidence → verdict →
   initiative). Fix what actually breaks, not what might.
2. Apply v10–v15 + confirm the `audit-evidence` bucket exists/private.
3. Only then consider: presigned direct-upload, `.pptx`, per-finding
   citations on the verdict, signed-URL download of archived originals.

---

## ▶ START HERE — 2026-05-13 spine handoff (prior session)

### Repos in play
- **`wbardawil/CDIO`** — THE product (this repo). Next.js app. Local:
  `C:\Users\Dell\projects\CDIO\app`. Remote: github.com/wbardawil/CDIO.
  Deployed: `cdio-rho.vercel.app` (Vercel auto-deploys `main`).
  **All work is on `main`** — the feature branch was merged in; there is
  no separate working branch anymore. Commit + push to `main`.
- **`wbardawil/gstack`** — build-process discipline ONLY (not product
  code). Has the design discipline we must use: `design-review`,
  `plan-design-review`, `design-consultation`, `plan-ceo-review`,
  `autoplan`. Local: `~/.claude/skills/gstack/`.
- **`wbardawil/gsd-2`** — architectural reference ONLY (progress/state
  model). Not product code. Local: `C:/Users/Dell/projects/gsd-2/`.
- GitHub MCP is restricted to exactly these three repos.

### State (truthful)
- DB migrations applied to Supabase: through ~v9, **plus v16 + v17**
  (audits). **v10–v15 NOT applied** → Initiatives/Selections/Network
  Catalog/Cadence still error on create until the founder runs them
  (see DEPLOY.md GO-LIVE CHECKLIST). The Audit works.
- Audit Engine V1 shipped (multi-option, paste-raw, premium intake).
- Confidentiality breach remediated; absolute rule at top of CLAUDE.md,
  AGENTS.md, this doc, STRATEGY-2026.md.
- **Customer #0 reported being lost / overwhelmed using the product.**
  Root cause: engines built, experience spine never built; gstack
  design-review gate never run this session. This is the priority.

### The next build — execute, don't re-debate (chosen by founder: "A")
Governing spec: **`docs/EXPERIENCE-SPINE.md`** (read it — the five spine
laws + the shell + the Audit-as-proof). Build, against that spec:

1. **`src/components/workspace-shell.tsx`** — one shared chrome
   component (prop-driven, no server-only imports so it works in the
   client dashboard too): `Your clients ‹ {Client} ‹ {Where}` crumb
   (each a link — kills the dead-end), client one-line state, the
   single consistent section nav. Used on EVERY client-scoped screen.
2. Wire it into: `src/app/clients/[orgId]/page.tsx` (replace bespoke
   header), the three `audits/*` pages, AND `src/app/dashboard/page.tsx`
   (the concrete dead-end the founder hit — add the shell + back path).
   One shell everywhere = "feels like one thing."
3. Audit detail (`audits/[id]/audit-client.tsx`): persistent 1-2-3
   progress strip (Frame · Prep · Verdict); lead with the plain-English
   verdict + money + recommendation; move the 5-lens analysis, evidence,
   method capture behind a single **"Show the full analysis"**
   disclosure (Law 5).
4. Plain-language pass: kill surface jargon ("M2", "Strategic Bet",
   "consensus 2.2/4", radar/matrix as first thing) per Law 3.
5. Verify (tsc + next build), commit + push `main`, then run the
   five-law review gate in `EXPERIENCE-SPINE.md` before claiming done.

Do NOT add new engines/features. The spine, then stop. Then the founder
runs a real Audit and the v10–v15 migrations.

---

## TL;DR (read this first)

AI-CDIO is the **methodology operating system for fractional CDIOs**. Built first as a tool the founder (Wadi Bardawil) uses on his own fractional practice. **Customer #0 = the founder.**

**Current state (2026-05-13, post-Phase-1C — outcome reframe shipped, Vendor Lifecycle scope under review):**

Phase 1A ✅, Phase 1B ✅, Phase 1C Days 8-17 ✅ (Quick Win Stack 3/3 + Decision Packages + role/area tagging + lean SMB defenses + Quick Scan board memo + adaptive questioning + framework citations + AMP integration), Phase 1D Days 21-28 ✅ (Charter, Initiative Pilot, Selection Engine v1 with Tech/AI/Partner via `domain` param, Network Catalog with P0 privacy, Cadence, Status Reports, MCP foundation). **Latest session (2026-05-13) shipped the 5-economic-outcome reframe + standards validation audit + flagged Vendor Lifecycle Management as a candidate Year-1 named service line pending founder decision.** See "2026-05-13 session" section immediately below for full state + pending decisions.

**For historical Day 11 lock (referenced repeatedly across the codebase as `9f3a2a6`), see Day 11 evening section further below. As of this commit, Day 11 architectural decisions A-G remain committed to docs:**
- `STRATEGY-2026.md` — new "Architectural Laws" section (Laws 1-7)
- `ROADMAP.md` — Phase 1D rewritten 4 → 8 days; Module 17 flagged Year-2 candidate; Phase 2.5 Build-vs-Buy folded into generic Selection Engine
- `ARCHITECTURE.md` — multi-corpus RAG model, per-practitioner tenant isolation, selective multi-agent boundaries, Network Catalog privacy model
- `CONTRACT-TEMPLATES.md` — new stub for PM-covenant clause library (Phase 2 Days 29-31 deliverable)

**Phase 1A — Foundation** ✅ complete (Days 1-3)
**Phase 1B — Practitioner Operations + Safety** ✅ code complete, env-var spillover only (Days 4-7)
**Phase 1C — Methodology Depth** ▶ in progress (Days 8-17)
- ✅ Day 8: Module 5 deep + role/area tagging + universal N/A escape
- ✅ Day 9: AI narrative + path-to-next-level + thin-coverage warning
- ✅ Day 10: Decision Packages surfaced as hero artifact
- ✅ Day 11: Outcomes-led strategy rewrite + 16 module renames + AI leverage roadmap
- ✅ **Day 11 doc-lock: architectural decisions A-G committed (Architectural Laws 1-7, Phase 1D revised 4→8 days, multi-corpus RAG + tenant isolation + selective multi-agent in ARCHITECTURE.md, CONTRACT-TEMPLATES.md stub)**
- ✅ **Day 12: Module 12 deep — Tech Finance & Value Realization (TBM Council + KPMG ROO). 13 questions across 4 subcategories (Cost Transparency, Cloud & SaaS Discipline, Vendor Economics, Value Realization). 8 TBM-anchored + 5 KPMG ROO-anchored. All role/area-tagged, level-5-indicators, framework-cited.**
- ✅ **Day 13: Module 15 deep — Process Automation & Transformation (APQC PCF + Lean Six Sigma + AMP AI-readiness precondition). 14 questions across 5 subcategories (Process Inventory & Mapping, Process Performance & Metrics, Automation Strategy, Waste & Lean Discipline, Continuous Improvement & Change Adoption). 8 APQC PCF + 5 Lean Six Sigma + 1 AMP/AI-readiness anchored. All role/area-tagged, level-5-indicators, framework-cited. Quick Win Stack 3/3 complete (Module 5 ✅, Module 12 ✅, Module 15 ✅).**
- ✅ **Day 13: Lean SMB defenses shipped.** `MODULE_TARGET_LEVEL_BY_SIZE` size-band ceiling in `src/lib/scoring/maturity.ts` (defaults: small=L3, medium=L4, large=L5; Modules 5+16 get +1 ceiling at small/medium). `getTargetLevelCeiling(moduleNumber, orgSize)` helper consumed by the narrative agent — recommendations no longer push past the band's ceiling.
- ✅ **Day 13: Lean-form-first rule + PE-underwriting discipline** wired into the assessment agent system prompt. Recommendations propose manual/spreadsheet/shared-doc forms before tool-buy escalation. Conservative estimates, hard-dollar savings, defensible 18 months later — language pulled from the AMP AI Diagnostic Playbook.
- ✅ **Day 14-15: Quick Scan board-memo upgrade.** Public `/scan` post-completion view replaced with full board-memo artifact: tier headline (Initial/Developing/Defined/Managed/Optimizing) at Level X.X, executive summary paragraph, maturity radar + by-dimension list, three named quick wins (lean-form-first actions with framework citation + projected impact + hard-savings-candidate badge for AMP "counts toward margin" modules 4/12/13/15), strategic risks (low scores on high-stakes modules with module-specific board language), areas of strength, print/save-PDF button (window.print with print-friendly Tailwind variants), CTA. Deterministic — no LLM call, no API key required. Replaces "we'll send you a report later" pattern with a same-screen artifact a CEO can read or print.
- ✅ **Day 16: Adaptive questioning (Tier 1 AI leverage).** `selectAdaptiveSubset(questions, 8)` helper added to `role-tag-mapping.ts`; subcategory-breadth-first selection caps stakeholder load at 8 questions per module. AssessmentForm wired in. Disclosure: "X questions for your role · narrowed from N for focus." Saves ~50 minutes of stakeholder time across a 16-module assessment. Module 2 deep deferred to Phase 2 dogfood (Days 29-38) where Ambar engagement signal will direct depth design.
- ✅ **Day 17: Framework citations layer surfaced in module-insights-panel.** Every module group on the practitioner dashboard now displays the framework anchor (TBM Council, NIST CSF, APQC PCF, etc.) and the plain-English one-liner under the module title. AssessmentForm and `/preview` already had inline citations — this completes the layer across the practitioner workspace.
- ✅ **Module 12 polish: m12_q14 added.** Hard-dollar underwriting question explicitly anchored to KPMG ROO + AMP's Standardized Impact Formula (Volume × Minutes × Cost × Realizable %). Module 12 now has 14 questions.
- ✅ **AMP Playbook integration locked in STRATEGY-2026.md** — separate AMP Playbook Integration section above Architectural Lineage. Phase 2.5 reduced 12 → 8 days by reusing AMP's 5 governance components (AI Maturity Model dims), 4 opportunity categories (AI Use-Case Library taxonomy), 100→17→7 funnel (AI Roadmap Generator), and 5×5 scoring (Selection Engine `domain: "ai"`). AI Operator Bootcamp logged as Year 2+ commercial product candidate.
- ✅ **Day 13: Practitioner /preview surface + try-it interactive mode** shipped earlier in this session — read-only methodology preview at `/preview` with depth-status badges, plus `/preview/module/[n]/try` for role-filtered + scoring-math testing without DB writes.
- ⏳ Day 13 (next session): Module 15 deep — Process Automation & Transformation (APQC PCF + Lean Six Sigma)

---

## 2026-05-13 session — Outcome reframe shipped + Standards Validation audit + Vendor Lifecycle scope review pending

This session shipped two upgrades downstream of the assessment surface and surfaced one scope-expansion question the founder must decide before more code lands.

### What shipped (commit `d9b0a3c` on `claude/continue-ai-cdio-vBHyN`)

**1. The 5 Economic Outcomes reframe — roadmap output restructured around CEO consumption layer**

The 16 modules are how the platform MEASURES. The five economic outcomes are how the CEO CONSUMES the output:

| # | Outcome | Modules that produce it | Time-to-value |
|---|---|---|---|
| 1 | `make_money` (top-line) | M1, M2, M6, M7, M8, M9, M10 | 6-12 mo |
| 2 | `save_money` (cost takeout) | M4, M12, M13 | 30-90 days |
| 3 | `save_time` (productivity) | M14, M15 | 60-180 days |
| 4 | `preserve_money` (risk to cash) | M3, M5 | continuous |
| 5 | `preserve_time` (avoid firefighting) | M11, M16 | continuous |

Concrete changes:
- New `EconomicOutcome` type + `ECONOMIC_OUTCOME_META` table in `src/types/index.ts` (each outcome carries a CEO-facing pain question for the planned pain-anchored entry)
- Every `MODULE_META[1..16]` declares its primary `outcome`
- `Initiative` type extended with optional `outcome`, `proof: { better, cheaper, faster }`, and `dollar_anchor` (legacy fields preserved for backward compat)
- Strategy agent system prompt rewritten — cash-positive quick wins must carry hard-dollar anchors; process-only quick wins ("improve security posture") rejected; better/cheaper/faster proof required per initiative
- Dashboard roadmap tab renders grouped by the 5 outcomes in CEO priority order; dollar-anchor pill prominent; proof grid under each card; legacy fallback for old persisted roadmaps

**2. Standards Validation audit (`docs/STANDARDS-VALIDATION.md`)**

One-time cross-walk of all 128 verbatim playbook diagnostic questions to recognized public standards (NIST CSF v2.0, NIST AI RMF, TOGAF, ITIL 4, AWS Well-Architected, FinOps, DORA, APQC PCF, Lean Six Sigma DMAIC, Prosci ADKAR, Gartner Analytics Maturity, KPMG ROO, TBM Council, Forrester CX).

- **Mapping density: 128/128 (100%)** — every question maps to a recognized standard category or methodology stage
- **Average standard top-level category coverage: 75-80%**
- Five highest-leverage gaps flagged for Phase 2 question bank: M14 direct DORA metrics, M5 Recover function (RTO/RPO), M13 SaaS renewal management, M6 master/reference data, M2 strategy refresh cadence
- Static doc — regenerate only when a standard updates or questions change

This gives the founder defensible "we cover 78% of NIST CSF Protect" claims for CEO conversations without committing to live control-by-control product surface.

### DECIDED 2026-05-13 — Pre-Purchase Technology Audit ships first

After the four-way deliberation below, the founder surfaced a sharper concept: an **independent Pre-Purchase Technology Audit** — a discrete fixed-fee engagement that sits between a principal and a major tech/system purchase, before the check is signed, loyal only to the accountable principal. Verdict: BUY / DON'T BUY / RENEGOTIATE / HOLD, with evidence and the money quantified.

**Decision: build the Audit Engine FIRST, ahead of the full Vendor Lifecycle, pain-entry, and verbal-scale.** Rationale + full spec in `docs/STRATEGY-2026.md` "Named Service Lines (added 2026-05-13)". Sequence in `docs/ROADMAP.md` "2026-05-13 sprint re-baseline".

- It is the sharpest expression of Pillar 2 + the Differentiated Promise's "bad tech bets die before they cost you money"
- Wedge product: a CEO who'd never sign a retainer pays to stress-test a $400K ERP decision; the audit earns the engagement
- Customer #0 evidence is live today (founder's ERP + CRM purchase decisions)
- ~3-4 day build; the full Lean Vendor Lifecycle becomes the deferred upsell

Doc-pass committed as part of this session. Audit Engine build starts immediately after.

### Audit Engine extension — Live Companion + 3 intake hardenings (2026-05-13)

Not a new service line — a **second output mode of the already-governed Audit Engine** (proportionate discipline: extension of a blessed service line gets a handoff note, not a separate doc-pass). Justified by recurring decision-failure patterns surfaced during design review (model/data-layer lock-in; organizational-absorption gap from prior failed rollouts; demo-polish vs. demonstrated-capability; over-scoped pricing vs. cheaper path).

- **3 intake hardenings:** explicit `prior_attempts` field (prior tech attempts in this area + how they went — the strongest absorption-failure predictor); conditional `ai_model_ownership` probe (who owns the model/data layer, can we BYO-model, can it run on infra we control); `demo_observations` field (what each option demonstrated live vs scripted).
- **Live Audit Companion:** the engine generates a pre-meeting, lens-by-lens question sheet tailored to *this* purchase — the exact probes to ask in the room while the vendor is performing. Closes the loop with Method Capture so the highest-leverage questions feed the next meeting. Rationale: the practitioner is IN these presentations live; the post-hoc deliverable alone doesn't serve the actual workflow. Structural findings are most often surfaced live, mid-demo — the tool must put the structural question in the practitioner's mouth in real time, not just document it afterward.

### Logged for the evidence-driven tightening batch (do NOT build speculatively — R6)

These are captured from recurring decision-failure patterns but deliberately deferred until ONE real audit run shows where output is actually weak (Threat 6 / R6 from the 2026-05-13 MECE assessment — the patterns prove the *thesis*, not yet the *output quality*):

1. **4th intake hardening — vendor delivery structure / prime-vs-subcontract.** Pattern: buyers pick a big-name firm as a capability proxy, but the work is delivered by a subcontracted individual the buyer never evaluated, on a 2-3x managerial/brand markup; the direct-to-expert path is never stated. Maps to Lens 4 (bullseye — vendor optimizes for the subcontract spread; conspicuously not showing who delivers), Lens 3 (the 10x-cheaper direct path), Lens 5 (the unnamed question: "who by name delivers, employee or subcontractor, can we contractually lock the named team?"). Drop-in: new intake field `vendor_delivery_structure` + a mandatory companion probe + the verdict shape (usually RENEGOTIATE → named-team contractual lock + price to real delivery cost; or cheaper-path direct). Same gap class as the AI-model-ownership and prior-attempts hardenings — high-signal structural question that should be forced at intake, not left to agent inference.
2. **Whatever the first real run exposes** — the actual tightening priority comes from running it on a live decision, not from anticipated patterns.

**Validation signal:** the recurring patterns reduce to ONE constant — the room evaluates the *surface* (brand, demo polish, feature list, industry vocabulary, firm size) and misses the *structure* (model ownership, org absorption, delivery capability, cost path, who actually does the work). That is the entire thesis of the Audit Engine. The design is right; the discipline now is to prove output quality on one real run before adding the next anticipated probe.

### (Historical) The four-way deliberation that preceded the decision

The session surfaced four legitimate next moves. None has been committed:

1. **Pain-anchored entry** — 5 outcome-flavored questions before the 128-question diagnostic; closes the loop from CEO mental model to assessment. ~2-3h.
2. **Verbal scale** (Solid / Spotty / Nothing yet / Don't know + optional evidence box) replacing yes/no/partial/na. Independent UX upgrade, ~3-4h.
3. **Browser-test the outcome reframe first** — generate a roadmap on a real synthesized assessment, verify the 5-outcome grouping + dollar-anchors + proof grid render as intended before adding upstream changes.
4. **Vendor Lifecycle Management as a named service line** — **scope expansion under founder review.** Founder's two current client projects are ERP and CRM RFPs; vendor sourcing is the highest-leverage place to keep the "bad tech bets die" promise. See Vendor Lifecycle section below for the case.

### Vendor Lifecycle Management — scope-expansion review (PENDING DECISION)

Founder raised the question: should AI-CDIO ship a promotable **Lean Vendor Lifecycle Management** service line? Customer demand exists today (ERP + CRM RFPs in flight).

**The case for:**
- Direct alignment with the Differentiated Promise's "bad tech bets die before they cost you money"
- Serves Pillar 1 (project success) and Pillar 2 (tech ROI) directly
- Maps to Customer #0 and #1's actual current revenue work (ERP and CRM RFPs)
- Phase 2 dogfooding loop is literally vendor sourcing engagements
- Better/cheaper/faster claim writes itself: 5x faster than Fortune 500 procurement, 1/5th the cost of Big-4 vendor selection, evidence-based decision memo

**The case against / friction:**
- Quick Win Stack (M5/M12/M15) is locked at 90-day delivery; ERP/CRM selection alone is 8-10 weeks — Vendor Lifecycle is strategic-initiative work, not quick-win work
- Adds a 4th named service line that isn't in STRATEGY-2026, GTM, or PRICING — strategic decision worth documenting before code
- Re-prioritizes the current Phase 1C sprint plan (which already drifted in practice — see ROADMAP entry below)

**Lean SMB version of the lifecycle (8 stages, NOT Fortune 500 procurement):**

| # | Stage | Always or Conditional |
|---|---|---|
| 1 | Need Statement (1-page versioned) | Always |
| 2 | Short-List Curation (3-5 vendors, verification check) | Always |
| 3 | RFP (lean — 8-15p, 30-50 weighted reqs, 5-8 vendors invited, 2-3 wk window) | Conditional — core platform / $50K+/yr / multi-year |
| 4 | Demo & Evaluation (structured rubric, uncited-score cap) | Always |
| 5 | Reference & Risk Check (1-2 refs per finalist + risk red-flag list) | Always |
| 6 | Recommendation Memo (CEO markdown, Independence Statement, Pause path, sensitivity analysis) | Always |
| 7 | Contract & Pilot Setup (flag-only contract review, pilot success criteria + go/no-go) | Always |
| 8 | Handoff & Renewal Calendar (90-day post-impl check, 90-day-advance renewal alert) | Always |

**Build cuts under discussion (NOT committed):**
- **Cut A — Selection Engine v2 Tier 1 only** (1-2 days): Independence Statement + Uncited-score cap + Pause Recommendation + CEO markdown output. Promotable as "Independent Vendor Selection." Many engagements never need formal RFP.
- **Sprint 1 — RFP-capable Selection v2** (3-4 days): Cut A + RFP builder + requirements builder + vendor invitation tracking + response capture + RFP doc generator. Matches founder's current ERP/CRM work.
- **Sprint 2 — Lifecycle completion** (2-3 days): versioned Need Statement + reference call template + risk red-flag checklist + renewal calendar + pilot success criteria + go/no-go on Initiative Pilot.
- **Total Sprint 1 + 2 — Full Lean Vendor Lifecycle (5-7 days).**

**Founder decision required (before any of this code lands):**
- If Vendor Lifecycle becomes a Year-1 named service line: update STRATEGY-2026.md (add as 4th service line), GTM.md (positioning), PRICING.md (bundle position), ROADMAP.md (Sprint 1 + 2 slotted before or after Phase 2 dogfood). ~30 min of doc work.
- If Vendor Lifecycle stays a Phase 1D Day 24 capability extension (no separate service line): only ROADMAP.md needs a small update (Day 24 deepening) and no GTM/PRICING change.
- If Vendor Lifecycle deferred: keep existing roadmap; ship pain-entry + verbal-scale next as planned.

---

## Day 11 evening — final scope lock (the new session reads this BEFORE the Day 11 morning section below)

The Day 11 evening session locked three corrections that changed the strategic identity of Year 1:

### Correction 1 — AI+Data first re-sequence proposed, then REVERSED 2026-05-07 final lock

The Day 11 evening rough draft proposed re-sequencing Phase 1C around AI + Data + Security (Module 6 deep at Days 12-13, AI Accelerator MVP at Days 14-16, Modules 12/15/2 deferred to Phase 2 dogfood). **That re-sequencing was reversed in the final 2026-05-07 lock.** Per the user's directive: commit `9f3a2a6` (Day 11 doc-lock) leads on logic and scope.

**Final Phase 1C Days 12-17 sequence (locked):**
- ✅ Day 12: Module 12 deep — Tech Finance & Value Realization (TBM Council + KPMG ROO) — shipped commit `f595bfc`
- Day 13: Module 15 deep — Process Automation & Transformation (APQC PCF + Lean Six Sigma)
- Days 14-15: Quick Scan output upgrade (board-memo quality, no AI lens — that lands Phase 2.5)
- Day 16: Module 2 deep — Tech Strategy & Business Alignment (KPMG 4-practice + MIT) + adaptive questioning
- Day 17: Framework citations layer + jargon → CEO-language translation

**Quick Win Stack = Modules 5 (✅ Day 8) + 12 (✅ Day 12) + 15 (Day 13).** AI Accelerator stays in Phase 2.5 (Days 39-50, full 12-day plan). Module 6 (Data & AI Capabilities) gets its depth pass in Phase 4 alongside the rest of Modules 1-4, 6-11, 13-14, 16.

### Correction 2 — Year 1 customer is the CEO via the founder, not other fractionals

The strategy doc was implicitly written to sell to other fractional CDIOs. **It's wrong for Year 1.** Founder isn't selling AI-CDIO to peers yet. He's using AI-CDIO with his current CEO clients. Year 2+ commercialization happens when the founder's fractional practice maxes out (capacity-constrained → release platform as new income stream).

**Year 1 audience:** the founder's CEO clients (Ambar + 1-2 more). They never log in. They see Decision Packages, Status Reports, Cadence links, framework-cited maturity charts — that's it.
**Year 2+ audience:** other fractional CDIOs. Phase 3 commercial release.

**Phase 2 reframed:** NO design partner pilots in Year 1. Founder uses platform on REAL clients of his own fractional practice. Modules 12, 15, 2 depth passes happen here. CEO-facing asset library built (one-pager, demo video, case study, LinkedIn templates) — all leading with what CEOs experience, not what fractionals can buy.

**Phase 3 reframed:** this is when other fractionals come in. Commercial release. Stripe + first paying fractional customers + design partner pilots.

**Day 90 kill switch criterion revised:** evaluation criteria are CEO outcomes delivered by the founder, NOT paying-customer count. Paying-customer count moves to Year 2 metric. Year 1 metric is `docs/OUTCOMES.md` weekly entries.

### Correction 3 — Differentiated Promise rewritten as 3-promise structure with 90-Day Commitment Matrix

Replaces the abstract "command center" elevator pitch. The new pitch is what the founder says to a CEO he's pitching as their fractional CDIO:

> *"Three things change when I'm your fractional CDIO. Your board stops asking the same tech questions twice — you walk in with framework-cited proof. Bad tech bets die before they cost you money — every decision over $25K runs through a review with named alternatives. AI moves from board talk to real rollout — you ship something in 90 days, not strategy theater. I deliver this in one quarter at a fifth the cost of a full-time CDIO. The platform I built makes me 5x faster than peers."*

The 3 promises map to mechanisms (NIST CSF / KPMG citations + Selection Engine + AI Accelerator MVP) and to a 90-Day Commitment Matrix that becomes the engagement contract backbone:

| Day | Deliverable | Outcome |
|---|---|---|
| 14 | Maturity assessment across 5-7 modules | Baseline + same scoreboard |
| 21 | First 3-5 Decision Packages resolved | Misalignments caught early |
| 30 | AI Readiness + AI Quick Win Roadmap | Board AI plan in hand |
| 45 | First initiative launched (outcome-driven, not category-limited — could be cyber, AI, data viz, automation) | Visible execution starts |
| 60 | Second initiative + first Status Report + Cadence link live | Ongoing visibility for CEO |
| 90 | Maturity score lift + ROI documented + AI initiative shipped | Re-engagement secured |

This matrix is now the contractual backbone. See `docs/CONTRACT-TEMPLATES.md` Section 3 for the sample contract clause language.

### Better / Cheaper / Faster table (locked)

The fractional CDIO using AI-CDIO competes against:
- **Full-time CDIO** ($250-400K/year, 6+ months ramp)
- **Big 4 / boutique consulting** ($150-300K/project, 3-4 months, slide-deck-heavy)
- **Generic ChatGPT advice** ($20/mo, zero methodology)
- **Fractional WITHOUT AI-CDIO** ($5-15K/mo, 6 months to first outcome)
- **Fractional WITH AI-CDIO** ($5-15K/mo, **90 days** to first outcome, framework-cited and auditable)

Differentiator: **5x faster + 1/5th the cost of full-time + better proof than any consultant slide deck.**

### Doc updates committed Day 11 evening

- `docs/STRATEGY-2026.md` — Differentiated Promise rewritten + 90-Day Commitment Matrix added + audience shift Year 1/Year 2+ + Day 90 kill switch criterion revised + marketing principle refined
- `docs/ROADMAP.md` — Phase 2 reframed as founder dogfood (no design partner pilots Year 1); Phase 3 reframed as commercial release to other fractionals. **Phase 1C scope and Phase 2.5 12-day plan match commit `9f3a2a6` (final lock 2026-05-07).**
- `docs/CONTRACT-TEMPLATES.md` — Section 3 added: "The 90-Day Commitment Matrix" sample contract clause language
- `docs/OUTCOMES.md` — Day 90 evidence base re-emphasized; format example updated to require CEO outcome + 90-Day Commitment Matrix milestone tracking + better/cheaper/faster comparison
- `CLAUDE.md` — Strategic Decisions + Current Sprint updated (Day 12 = Module 12, ✅ shipped; Day 13 = Module 15)

### What's next — Day 13 (next code session)

1. Run `/plan-eng-review` on Module 15 deep scope (mandatory gate per Process Discipline)
2. Build Module 15 deep — anchored to APQC PCF + Lean Six Sigma, 12-15 questions, role-tagged, level-5, framework-cited (replicate Module 5 / Module 12 pattern)
3. Days 14-15 — Quick Scan output upgrade (board-memo quality)

---

## Day 11 morning — what shifted strategically (the new session reads this carefully — earlier in the day)

The founder challenged the platform's positioning: *"We described features... but I can only sell outcomes, better yet feelings. Are we optimizing for outcomes and feelings?"*

The honest answer was no, we were feature-led. This session rebuilt the strategy from the customer outcome backwards.

### 1. Strategy doc rewritten outcomes-first (`docs/STRATEGY-2026.md`)

Four outcome pillars, each anchored in 2025-2026 research from McKinsey, BCG, KPMG, WEF:
- **Pillar 1 — Higher Project Success Rate** (alignment forced earlier; 48% of digital initiatives miss without alignment per Gartner)
- **Pillar 2 — Higher ROI from Tech Investments** (avoidance + focus; 60% of companies generate no AI value per BCG)
- **Pillar 3 — Tech Aligned to Strategy** (the platform's structural strength; KPMG 4-practice framework operationalized)
- **Pillar 4 — Helping CEOs Build Moats** (weakest pillar today; Phase 2.5 unlocks it)

### 2. Pillar 4 now carries the AI claim boundary

> *"AI-CDIO does not build your AI. It catches the seven decision-phase failures that account for ~70% of why AI initiatives die before they deliver value: wrong use case, weak sponsorship, no success criteria, CEO-CTO misalignment, build-vs-buy errors, governance gaps, organizational silos. The remaining ~30% (data engineering, MLOps execution, end-user adoption) is the execution partner's responsibility."*

This is what the founder can defensibly claim in sales without overselling.

### 3. Practitioner Feeling Map locked

Four feelings drive demo-to-paid conversion:
- *"I look like the CEO I want to be in front of my board."*
- *"My methodology travels with me."*
- *"I'm not the bottleneck."*
- *"I'm getting better as a practitioner faster than I would alone."*

### 4. Weekly outcome log discipline (`docs/OUTCOMES.md`)

Founder writes one entry per Friday answering: *"What did the platform help me deliver this week that I couldn't have done as well without it?"* Day 90 kill switch reads this log. Outcome categorization by pillar served. **Founder commitment: starts Day 18 (production deploy) for real entries.**

### 5. All 16 modules renamed + framework-anchored (`src/types/index.ts`)

New `MODULE_META` typed export carries name + oneLiner + framework anchor for each module. `MODULE_NAMES` kept as backwards-compatible alias derived from MODULE_META. Highlights:

| # | Old | New | Framework anchor |
|---|---|---|---|
| 1 | Role of the CIDO | Technology Leadership at the Top | Gartner CIO Leadership Model |
| 2 | IT/Digital Transformation Strategy | Tech Strategy & Business Alignment | KPMG 4-Practice + MIT Strategic Alignment Model |
| 5 ⭐ | Cybersecurity, Risk Management & Compliance | Security, Risk & Compliance | NIST CSF v2.0 + CMMI ✅ shipped |
| 12 ⭐ | Financial Acumen | Tech Finance & Value Realization | TBM Council + KPMG ROO |
| 15 ⭐ | Business Process Transformation & Automation | Process Automation & Transformation | APQC PCF + Lean Six Sigma |
| 16 | Future of Work & Workforce Development | Workforce, Skills & Change | Prosci ADKAR + Kotter 8-Step |

Each carries a CEO-language one-liner. Quick Win Stack = Modules 5, 12, 15 (⭐).

### 6. Module 2 deep promoted from Phase 4 to Phase 1C Day 16

Reason: Module 2 (Tech Strategy & Business Alignment) is the structural expression of Pillar 3 — alignment is the platform's strongest pillar. Methodology depth on this module directly supports demo-to-paid conversion. Anchored to KPMG 4-practice + MIT Strategic Alignment Model.

### 7. Tier 1 AI leverage added to Phase 1C/1.5 to mitigate complexity tax

15-question framework-anchored modules add complexity. Three AI leverage points commit to keeping it light:
- **Day 16 — Adaptive questioning** (each stakeholder gets 6-8 contextually-selected questions instead of 15; uses existing `generateFollowUpQuestions` infrastructure)
- **Day 17 — Framework jargon → CEO-language translation** (practitioner sees "PR.AA-05"; CEO sees "*Does your team enforce password rules everyone follows?*")
- **Day 18 — Industry overlay generator** (16 modules × 6 industries handled by one runtime function instead of 96 hand-written variants)

---

## Day 11 — the architectural decisions reached this session (for new-session pickup)

**Doc-lock status (2026-05-07 end of day, cross-environment continuation session):** ✅ DONE.
- `STRATEGY-2026.md` Architectural Laws 1-7 committed
- `ROADMAP.md` Phase 1D revised to 8 days; Module 17 Year-2 flag added; Phase 2.5 Build-vs-Buy generalized into Selection Engine
- `ARCHITECTURE.md` multi-corpus RAG + tenant isolation + selective multi-agent + Network Catalog privacy model committed
- `CONTRACT-TEMPLATES.md` stub created (Phase 2 Days 29-31 deliverable)
- Decisions A-G are now law. The summaries below remain as the rationale record.

### Decision A: Phase 1D scope expanded — Initiative Pilot + Selection Engine + Network Catalog

The founder confirmed execution oversight is in scope (he's required to oversee initiatives with vendors/contractors). Original Phase 1D was 4 days of recurring deliverables; revised is 8 days covering execution coordination.

**Revised Phase 1D plan (Days 21-28):**
| Day | Deliverable |
|---|---|
| 21 | Charter Generator (lean one-page from Decision Package or Roadmap initiative) |
| 22-23 | Initiative Pilot core (initiative model, step generation from playbook RAG, multi-party invites with token-based contextual visibility, step ownership routing) |
| 24 | Selection Engine — Tech mode (matrix builder, criteria templates per category, AI leaning recommendation with caveats, paste-G2-link workflow) |
| 25 | Selection Engine — Partner mode + Network Catalog (per-practitioner tagged network of vetted people, AI suggests from network FIRST then external sourcing prompts) |
| 26 | Engagement Cadence (read-only client view, token-based) |
| 27 | Status Report Generator (auto-aggregated from Initiative Pilot data) |
| 28 | MCP Server foundation + Jira/Asana read-sync |

**Auto-pulse / vendor-chasing automation = stretch goal, not Day-21 commitment.** Founder ranked it 4th on simplicity priority.

### Decision B: Founder simplicity priority ranking (drives Phase 1D sequencing)

Founder ranked his 5 admin pains: **C, D, A, B, E**
- C — simpler than rebuilding charters/status/decisions from scratch each engagement (top pain — drives Days 21-23)
- D — simpler than answering CEO's "where are we?" (drives Day 26 Cadence)
- A — simpler than juggling 5 tools (drives Day 28 integration)
- B — simpler than chasing vendors/contractors (stretch — auto-pulse later)
- E — simpler than client-switching context (Phase 4)

### Decision C: Tech Selection Engine architecture

- **Mode C (matrix + leaning recommendation with caveats)** — platform produces defensible artifact, suggests a lean, founder makes the call. Founder's judgment is the value-add.
- **Charter format: Lean one-page** (PMI PMBOK is enterprise theater for SMBs)
- **Jira/Asana integration: B (read-sync)** — pull ticket status in. Don't push out. No bidirectional traps.
- **Vendor visibility: Contextual** — vendors see their steps + initiative goal + relevant Decision Packages. Never see other clients, vendors, maturity scores, or strategic narrative.
- **Vendor catalog seed: Hybrid (C)** — agent generates initial seed from public data; founder curates the 10-15 categories he most often works in.

### Decision D: Network Catalog — per-practitioner moat

Founder uses Upwork, Clutch, peer networks for partner sourcing. Many vendors he evaluates aren't on G2. The Network Catalog becomes the practitioner's permanent address book of vetted people:
- Name, role, domain tags, last engagement, rating, source, notes
- AI suggests from YOUR network FIRST, then external sourcing
- Per-practitioner only — **never cross-practitioner visible** (privacy boundary locked)
- Encrypted at rest beyond Supabase defaults; full export + wipe controls

**This is the practitioner's moat. Compounds engagement-over-engagement.**

### Decision E: PM guardrail + contract covenant

Founder accepted the guardrail: *the platform makes execution oversight light enough that you can do it as part of strategic engagement WITHOUT it becoming the engagement.* Don't take PM-for-hire work just because the platform makes it possible — that's a different price point.

**New commitment from founder:** the practitioner's contract should require the client to nominate or hire a PM (internal or external) the practitioner oversees. Platform supports this; doesn't replace it.

**Phase 2 Day 29-31 deliverable:** ship contract template language as a soft feature in the Asset Library so practitioners can paste covenant clauses into their own engagement contracts.

### Decision F: Architecture commitments — single-agent default, multi-corpus RAG, memory primitives Phase 4

Single-agent is right for the ~20 operations in Phase 1A through Phase 2 inclusive. Multi-agent reserved for ~10 operations in Phase 2.5+:
- Tech Selection deep evaluation (research agent + evaluator + recommender)
- Partner Selection sourcing (Phase 2.5 find capability)
- AI Use-Case Library / AI Roadmap / Build-vs-Buy / Governance
- Knowledge Reuse / Stakeholder pattern detector / Outcome prediction
- Document/image AI Vision evidence analysis
- QBR deck generation

**Multi-agent becomes a tier differentiator:**
- Starter ($199): single-agent only
- Growth ($399): selective multi-agent (Tech Selection deep, AI Accelerator)
- Scale ($599): full multi-agent + Knowledge Reuse + Outcome prediction + Document AI Vision

Cost telemetry from Day 19 (Phase 1.5) makes this actionable.

**Multi-corpus RAG architectural commitment:**
- Today: 1 corpus (playbook chunks, 1,154 entries)
- Future: 7 corpora — Playbook + Frameworks + Vendor data + Use case catalog + Per-practitioner historical engagements + Per-practitioner Network Catalog + Industry-specific overlays
- Strict tenant isolation: per-practitioner corpora must NEVER leak across (P0 architectural concern)
- Hybrid retrieval: embeddings for unstructured (playbook, frameworks, vendor docs), structured query for Network Catalog
- Re-ranking layer when multiple corpora return hits

**Memory primitives:** Phase 4 commitment. Per-client conversational memory across sessions. Adopts Anthropic's native memory primitives when available.

### Decision G: Module 17 (Sales/Marketing/Revenue Tech) flagged as Year-2 addition

Current 16 modules over-index on infrastructure / governance and under-index on revenue-side tech. Modern SMB CDIOs spend 30-50% of time on sales tech, marketing tech, customer success tech. Add Module 17 in Year 2 if customer demand confirms. Other potential future modules already flagged:
- Vision & North Star
- Governance & Decision Rights
- AI as its own module (split from Module 6 once Phase 2.5 lands)
- Sustainability / ESG Tech

**Key product decision locked 2026-04-29 (Phase 1C scope expansion):**

Phase 1C now includes **role/area question-level segmentation + universal N/A escape**, baked in alongside the Module 5/12/15 depth rewrite (no extra days). Today CEO and CTO answer identical questions inside a module — wrong methodologically. Going forward:

- **Two-layer question tags:** Layer 1 = executive function (`strategic`, `financial`, `technical`, `operational`, `risk`); Layer 2 = business area (`operations`, `sales`, `IT`, `finance`, `marketing`, `other`)
- **Role → tag mapping** (full table in `docs/ROADMAP.md` Phase 1C section): CEO → strategic only; CFO → strategic + financial; CTO → strategic + technical + operational; CISO → strategic + technical + risk; Director/Manager → their area + operational
- **Per-module N/A** (gate: "Can you speak to this area?") + **per-question N/A** (text-link style)
- **N/A treated as missing data**, never as score 1 — protects synthesis math
- **Thin-coverage warning** to practitioner when fewer than 2 stakeholders answered a module or below 50% of expected responses arrived

**Other strategic context:** practitioner-first principle is explicit. Methodology depth (Phase 1C) outranks horizontal expansion. MCP server is an architectural choice, not a Year-1 headline. See `docs/STRATEGY-2026.md`.

**Strategic decisions locked 2026-04-29 (full day, after MECE rewrite):**

1. **Production deploy + legal + cost telemetry = NEW Phase 1.5 (Days 18-20)** — L3 level: Vercel + custom domain + verified email + Terms/Privacy/AI Disclaimer + cost-per-engagement telemetry instrumented. Methodology depth (just shipped Phase 1C) lands INTO production with legal scaffolding and unit-economics visibility from Day 1 of public exposure. Custom domain decision pending founder.

2. **AI Accelerator Engine = NEW Phase 2.5 (Days 39-50, 12 days)** — the "AI-as-buy-trigger" thesis. AI Maturity Model + AI Use-Case Library + AI Roadmap Generator + Build-vs-Buy Advisor + Governance Scaffolding + public `/ai-readiness` Quick Scan + AI deliverable surfacing across workspace + quarterly re-assessment cadence. **Practitioner-first preserved** — CEOs never get a paid AI-CDIO account; `/ai-readiness` routes leads to practitioners. **All AI deliverables plug into Phase 1D engines via documented extension points** (`deliverable_types[]` array on Status Reports, `domain` field on Cadence milestones, generic Decision Package called with `domain: "ai"`, MCP tool registry forward-looking) — no double-build.

3. **AI lens removed from Phase 1C** — don't tease a feature that doesn't exist for 23 days. The Quick Scan AI teaser was deferred to Phase 2.5 Day 49, alongside the destination it funnels to (`/ai-readiness`).

4. **Pricing & Packaging design = Phase 2 Days 35-38** — Starter $199 (Quick Scan + Assessment + Decision Package + Status Reports), Growth $399 (+ Cadence + MCP + AI Accelerator), Scale $599 (+ unlimited clients + Value Tracker). Three tiers locked on paper before Phase 3 Stripe build.

5. **Account & Billing Settings UI = Phase 3 Days 51-53 (BEFORE Stripe)** — practitioners need a place to manage their subscription before subscriptions go live.

6. **Onboarding email sequence + Help/Docs = Phase 2 Days 31-33** — design partners onboarded Days 35-38 must self-serve; founder cannot be bottleneck.

7. **Day 90 metrics dashboard = Phase 3 Day 59** — auto-track paying customers, MRR, founder daily-use streak, hours saved per client. Day 90 review uses real metrics, not manual count.

8. **Elevator pitch reconciled to ONE sentence** that names both audiences: practitioners as the buyer + CEO AI implementation pull as the buy-trigger. See `docs/STRATEGY-2026.md` Differentiated Promise section.

**Day 90 math:** Day 90 hits Day 15 of Phase 4. Monetization runway (Phase 3 Day 51) gives 39 days before Day 90. Realistic outcome: 1-4 paying customers (slow-burn) + founder daily use. See `docs/STRATEGY-2026.md` Day 90 Kill Switch section for re-examined criteria.

---

## Required Reading (in order)

1. **`docs/STRATEGY-2026.md`** — active strategic source of truth (refreshed today)
2. **`docs/PRODUCT.md`** — what the product is and isn't
3. **`docs/ROADMAP.md`** — phase-by-phase plan (Phases 1A-1D + 2 + 3 + 4 + 5)
4. **`docs/GAPS.md`** — open P0/P1/P2 gaps (8 originally, several closed)
5. **`docs/ARCHITECTURE.md`** — four-layer model, data model, tech stack
6. **`docs/LOCAL_DEV.md`** — how to run locally without crashing (the orphan-lockfile gotcha)
7. **`docs/RISKS.md`** — Johari analysis, MECE risk categories, kill switch
8. **`docs/PRICING.md`** — economics + segment model
9. **`docs/GTM.md`** — three-phase strategy (now reconciled with STRATEGY-2026)

---

## What's Built (end of Day 4)

| Surface | State |
|---|---|
| `/` Marketing landing | ✅ Auth-aware nav (Sign in / Open Portfolio) |
| `/scan` Quick Scan | ✅ Public; live spider chart + action cards |
| `/onboarding` Practitioner onboards a client | ✅ Auth-required; CIO/CDIO/CDO/CISO + 14 other roles; explicit error display; **Sandbox checkbox** |
| `/assess/[token]` Stakeholder assessment | ✅ Token-based public; intersection of role-relevant ∩ org-active modules; Return-to-workspace CTAs on completion |
| `/clients` Portfolio | ✅ Server-rendered table; **Sandbox badge** on flagged clients |
| `/clients/[orgId]` Client Workspace | ✅ Shell + Overview with Next-step banner + stakeholder list with Edit/Email link/Copy/Open buttons + **Sandbox-only Reset Assessment**. Tabs: Overview ✅; Assessment / Roadmap reach the legacy dashboard; Deliverables / Decisions / Value are coming-Week-N stubs. |
| `/dashboard?org=...` Legacy dashboard | ✅ Existing engines (synthesis, divergence, roadmap) still reachable |
| `/sign-in` / `/sign-up` | ✅ Clerk-hosted catch-all |
| `/chat` Anonymous funnel | ✅ Public, RAG-grounded |

**Backend:** Supabase Postgres + pgvector, 15 tables, schema v1-v5 applied. Clerk for auth. Service-role client used today; RLS policies pre-wired for Day 30 activation. 1,152 RAG chunks of CMU-stripped playbook content. Resend live for assessment emails (testing sender; verified-domain swap pending). Atomic synthesis stored procedure planned Day 5.

---

## What's NOT Built (remaining Phase 1 scope)

| Phase | Capability | Notes |
|---|---|---|
| 1B (Day 7 — next) | **Test/Real architectural primitive** | `is_sandbox` load-bearing across all surfaces (banner, email safety, delete, AI tone); orphan orgs auto-default to Test |
| 1B | Upstash rate limit on /api/chat + /api/assessments | Cost protection — needs `UPSTASH_*` env vars |
| 1B | Sentry + Langfuse | Observability — needs `SENTRY_DSN` + `LANGFUSE_*` |
| 1B | Add/remove stakeholder UI + bulk reminder | Day 4 spillover; user only had pencil-edit must-have |
| 1C | **Data migration plan for existing assessment responses** (Day 8 decision before Module 5 rewrite) | Don't silently invalidate Ambar/TestCo data |
| 1C | Module 5 deep (questions, framework citations, narrative scoring, level-5 indicators) | Quick Win Stack starts here |
| 1C | **Role/area question-level segmentation + N/A escape + thin-coverage warning** | Built Days 8-13 alongside Module 5/12/15 depth rewrite |
| 1C | Decision Package surfacing as standalone artifact | Hero output (designed generic w/ `domain` parameter for Phase 2.5 reuse) |
| 1C | Module 12 + 15 deep | Quick Win Stack complete |
| 1C | Quick Scan output upgrade (board-memo quality) | Sales-conversion engine. **No AI lens** — moved to Phase 2.5 |
| 1C | Framework citations layer | Cited authority everywhere; deliberately generic so Phase 2.5 extends with NIST AI RMF + EU AI Act |
| **1.5** | **Production deploy L3 + Legal Foundation + Cost Telemetry** (Days 18-20) | App goes online with ToS/Privacy/AI Disclaimer + custom domain + verified email + per-engagement LLM cost tracking |
| 1D | Status Report Generator (Engine #2) — designed with `deliverable_types[]` extension array | Days 21-24 |
| 1D | Engagement Cadence — milestones carry `domain` field for Phase 2.5 AI extension | Days 25-27 |
| 1D | MCP Server foundation — tool registry forward-looking (3 generic now, +5 AI in Phase 2.5) | Day 28 |
| 2 | Asset library (L4) + design-partner pilots | Days 29-38 |
| 2 | **Onboarding email sequence + Help/Docs** | Days 31-33 |
| 2 | **Pricing & Packaging design — three tiers locked on paper** | Days 35-38 |
| **2.5** | **AI Accelerator Engine** (12 days, expanded from 10) — Maturity Model + Use-Case Library + Roadmap Generator + Build-vs-Buy + Governance + AI deliverable surfacing + `/ai-readiness` Quick Scan + Quarterly re-assessment | Days 39-50. The buy-trigger flagship engine. Plugs into Phase 1D extension points — no rebuild. |
| 3 | **Account & Billing Settings UI** (BEFORE Stripe) | Days 51-53 |
| 3 | Stripe billing | Days 54-58 |
| 3 | **Day 90 metrics dashboard** (auto-tracked kill-switch metrics) | Day 59 |

---

## What to Build Next (Day 12+ — Phase 1C continues)

Per `docs/ROADMAP.md` and the Day 11 architectural decisions above:

### First moves of next session (BEFORE any code) — ✅ ALL DONE 2026-05-07 end of day

1. ✅ `docs/STRATEGY-2026.md` — Architectural Laws 1-7 committed
2. ✅ `docs/ROADMAP.md` — Phase 1D revised; Phase 2.5 Build-vs-Buy generalized into Selection Engine; Module 17 Year-2 flag added
3. ✅ `docs/ARCHITECTURE.md` — multi-corpus RAG, tenant isolation, selective multi-agent boundaries, Network Catalog privacy model
4. ✅ `docs/CONTRACT-TEMPLATES.md` — stub created
5. ✅ Module 17 flagged in `ROADMAP.md` Phase 5 as Year-2 candidate

### Then resume code per the existing Phase 1C plan

| Day | Task |
|---|---|
| ✅ **12** | **Module 12 deep — Tech Finance & Value Realization (TBM Council + KPMG ROO).** 13 questions across 4 subcategories: Cost Transparency (Q1-3), Cloud & SaaS Discipline (Q4-6), Vendor Economics (Q7-8), Value Realization (Q9-13). 8 TBM + 5 ROO. All level-5, role-tagged, framework-cited. Type-check clean. Smoke test confirms role filtering: CEO 8/13 strategic-only, CFO 13/13, CIO 13/13, Director-Finance 13/13, Director-IT 9/13, Director-Sales/Marketing 0/13 (will N/A out the module). |
| 13 | Module 15 deep — Process Automation & Transformation (APQC PCF + Lean Six Sigma) |
| 14-15 | Quick Scan output upgrade (board-memo-quality artifact) |
| **16** | **Module 2 deep — Tech Strategy & Business Alignment** (KPMG 4-practice + MIT) + **adaptive questioning wired in** |
| **17** | Framework citations layer + jargon → CEO-language translation |
| **18-20** | Phase 1.5 — Vercel deploy + custom domain + verified email + industry overlay generator + cost telemetry + legal foundation |
| **21-28** | **Phase 1D revised** — Charter / Initiative Pilot / Selection Engine + Network Catalog / Cadence / Status Reports / MCP + integrations |

### Founder's pending decisions (next session asks for these)

1. **Custom domain choice** for Phase 1.5 (`ai-cdio.com` or other). Needed before Day 18.
2. **Vendor catalog seed approach** ✅ confirmed C (hybrid: agent generates, founder curates 10-15 categories).
3. **Pre-Day 12 actions:**
   - Run `/plan-eng-review` on Phase 1D scope (Initiative Pilot + Selection Engine + Network Catalog) — gstack skill, locally available
   - Run `/codex` on the Network Catalog privacy model — independent second opinion
   - Run `/cso` on the planned Network Catalog encryption / cross-tenant isolation
4. **Optional env vars (Phase 1B spillover):**
   - `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` (rate limiting)
   - `SENTRY_DSN` (error monitoring)
   - `LANGFUSE_PUBLIC_KEY` + `LANGFUSE_SECRET_KEY` (LLM observability)

### gsd-2 (resolved 2026-05-07)

`gsd-2` is GSD 2 — the evolution of the "Get Shit Done" prompt framework, now a standalone CLI coding agent built on the Pi SDK (`npm i -g gsd-pi`). Direct TypeScript access to the agent harness: context-window control, session management, git branching, cost/token tracking, stuck-loop detection, crash recovery, auto-advance through milestones. v1 was a prompt framework asking the LLM to behave; v2 actually controls execution.

**Relevance to AI-CDIO:** not a Phase-1 dependency. Possible later integration: drive end-to-end methodology engagements via an autonomous agent ("run the assessment + draft the Decision Package + email the stakeholders, walk away"). Tracked as a Phase-4+ exploration; nothing committed.

### gstack skills — next session uses these proactively

Available skills at `~/.claude/skills/gstack/`:
- `/plan-eng-review` — gate before Phase 1D code
- `/plan-ceo-review` — strategic scope reviews (would have caught Day 11 reframe earlier)
- `/codex` — second opinion on architectural calls
- `/cso` — security audit before any privacy-sensitive feature (Network Catalog!)
- `/health` — code quality dashboard, weekly
- `/learn` — capture engagement patterns post-commit
- `/qa` — visual QA (Windows-compatibility uncertain; try once)

This session under-used these. Next session uses them as gates, not optional polish.

### Key data state

- Practitioners: 1 (Wadi Bardawil, `wadi.bardawil@arkiva.mx`, plan: `starter`)
- Real orgs: **Ambar Capital** — `is_sandbox=false`, mapped to founder as `owner`, `active_modules = [5, 15, 4]`
- Sandbox orgs: **TestCo Industries** — auto-flipped Day 7 migration
- Founder's role at Ambar: fractional CIO
- Module 5 = first deep-pass module (NIST CSF v2.0, 15 questions, role-tagged, level-5, narrative + path)
- Existing Module 5 scores on Ambar/TestCo are **legacy schema** — re-running an assessment populates the new narrative + path fields per stakeholder

Open the next session by reading in order:
1. `docs/STRATEGY-2026.md` (the outcomes-led rewrite)
2. `docs/OUTCOMES.md` (founder's verification surface)
3. `docs/SESSION_HANDOFF.md` (this doc, starting at top)
4. `docs/ROADMAP.md` (Phase 1C-1D-2.5)
5. `docs/PRODUCT.md`
6. `docs/GAPS.md`

---

## Project Files Map

| Where | What |
|-------|------|
| `C:/Users/Dell/projects/CDIO/CSIO - Playbook/` | The 30-file source playbook (CMU/Carnegie attribution stripped — see scripts/strip-cmu.js) |
| `C:/Users/Dell/projects/CDIO/app/` | The Next.js application |
| `C:/Users/Dell/projects/CDIO/app/docs/` | All product/strategy/architecture docs (this folder is the contract) |
| `C:/Users/Dell/projects/CDIO/app/src/lib/agents/` | AI agents (assessment, strategy, conversation, orchestrator) |
| `C:/Users/Dell/projects/CDIO/app/src/lib/playbook/` | RAG, retrieval, quick-scan questions |
| `C:/Users/Dell/projects/CDIO/app/src/lib/scoring/` | Maturity engine, rule-based fallback |
| `C:/Users/Dell/projects/CDIO/app/src/lib/auth/` | Clerk helpers (require-auth, ensure-practitioner, assert-owns-org) |
| `C:/Users/Dell/projects/CDIO/app/src/lib/db/` | Schema files (v1, v2, v3-maturity5, v4-practitioners) |
| `C:/Users/Dell/projects/CDIO/app/src/app/` | Next.js pages + API routes |
| `C:/Users/Dell/projects/CDIO/app/scripts/` | Operational scripts: migrate, ingest-playbook, inspect-db, check-db-url, strip-cmu, verify-cmu-purge |

---

## Environment

### Local (Windows 11)
- **Node:** 22+
- **npm:** 11+
- **Dev server port:** 3010 (configured in `.claude/launch.json`)
- **Run command:** `npm run dev:warm` first run of the day, `npm run dev` thereafter
- **Git remote:** `github.com/wbardawil/CDIO`
- **Branch strategy:** main only (small project, no PR workflow)

### Secrets (in `.env.local`, never commit)

Set:
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_DB_HOST`, `SUPABASE_DB_PORT=6543`, `SUPABASE_DB_USER`, `SUPABASE_DB_PASSWORD`, `SUPABASE_DB_NAME` (Transaction Pooler with IPv4 ON — see `docs/LOCAL_DEV.md`)
- `ANTHROPIC_API_KEY`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`, `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up`, `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/`, `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/`
- `RESEND_API_KEY` ✅ Set Day 4

Pending (Phase 1B Days 5-6):
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` (rate limiting)
- `SENTRY_DSN` (error monitoring)
- `LANGFUSE_PUBLIC_KEY`, `LANGFUSE_SECRET_KEY` (LLM observability)

Future (Phase 3):
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`

---

## Founder's Working Style

- **Direct and challenge-friendly.** Push back when assumptions look wrong.
- **Wants to see things working in browser, not just in commits.**
- **Prefers automated workflows over manual SQL pasting** (use scripts/migrate.js, never paste in Supabase dashboard).
- **Customer #0** — every feature decision: "would this make my fractional practice better THIS WEEK?"
- **Practitioner-first.** Defer platform abstractions until paying-customer demand justifies them.
- **Eats own dog food.** Real client data goes in once depth lands.
- **Wants quality over scope.** Caught white-on-white text + assessment-blank-page bugs himself; expects pre-push QA discipline going forward.

---

## Quality Discipline (committed Day 3)

After every UI-touching commit, the agent runs Preview-based QA:
1. Start preview server
2. Walk the affected user flow
3. Take screenshot, confirm visual integrity
4. Only then claim "done"

The agent does NOT rely on the user to find UI/UX bugs. The agent does NOT use the gstack `/qa` skill end-to-end (Windows preamble fails); the agent uses Preview MCP tools directly which DO work on Windows.

---

## Quick Start Prompt (paste into a fresh session)

```
I'm continuing work on AI-CDIO, a methodology operating system for fractional CDIOs.

Project root: C:\Users\Dell\projects\CDIO\app
GitHub: github.com/wbardawil/CDIO

Read these in order:
1. docs/STRATEGY-2026.md (active strategy, refreshed 2026-04-27)
2. docs/SESSION_HANDOFF.md
3. docs/ROADMAP.md
4. docs/PRODUCT.md
5. docs/GAPS.md
6. docs/ARCHITECTURE.md
7. docs/LOCAL_DEV.md

Current state: Phase 1A done. Phase 1B (Days 4-7) starts now.

Today's task: Phase 1B Day 4 — stakeholder edit UI + email send via Resend.

Confirm the founder has RESEND_API_KEY in .env.local before starting.
After reading the docs, propose the first concrete change (file paths + diffs)
before writing code. Run preview-based QA on every UI change before commit.
```

---

## Success Criteria for the Next Session

By the end of the next session, the founder should be able to:
1. Edit a stakeholder's role/modules from the workspace UI (no SQL)
2. Email an assessment link to a stakeholder with one click
3. See rate-limit headers on /api/chat and /api/assessments responses
4. Look at Sentry and Langfuse and see real telemetry from the platform

If those four are true, Phase 1B Days 4-6 are done. Day 7 confirms Ambar reality + backfills.
