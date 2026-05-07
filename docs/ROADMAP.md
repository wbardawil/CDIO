# AI-CDIO: Build Roadmap

> **Companion strategy doc:** `docs/STRATEGY-2026.md` is the active strategic source of truth.
> **Last refreshed:** 2026-05-07 evening (Phase 1C Day 11 — final scope lock for the day. THREE BIG CORRECTIONS from earlier today: **(1)** Phase 1C re-sequenced with **AI + Data first**: Module 6 (Data & AI Capabilities) deep + AI Accelerator MVP land BEFORE Modules 12, 15, 2 — because AI is the buy-trigger CEOs are hot for now, and 50 days is too long to wait. **(2)** Audience locked: Year 1 customer is the founder's CEO clients (via him), not other fractionals. Phase 2 reframed accordingly — no design partner pilots in Year 1; founder uses platform on Ambar + 1-2 more REAL clients. Other fractionals come Phase 3+. **(3)** Phase 2.5 AI Accelerator reduced from 12 days to 6-7 days because the MVP shipped early in Phase 1C — Phase 2.5 only handles heavyweight pieces.).
>
> **Earlier today (Phase 1C Day 11):** outcomes-led strategy rewrite; 16 modules renamed + framework-anchored + one-liners added; Module 2 deep promoted to Phase 1C; Tier 1 AI leverage added.
>
> **Previous refresh:** 2026-04-29 (Phase 1B Day 6 MECE rewrite — AI lens removed from Phase 1C, legal foundation moved into Phase 1.5, pricing slotted into Phase 2, Phase 2.5 expanded to 12 days — note: Phase 2.5 has now been REDUCED back to 6-7 days as of 2026-05-07 evening because the AI Accelerator MVP moved to Phase 1C).

## Current State (April 2026)

### Built (Phase 1A — Days 1-3, ✅ done)
- Quick Scan UI (`/scan`) with live spider chart + action cards
- Full Assessment Pipeline (`/onboarding` + `/assess/[token]`) with multi-stakeholder
- Chat-first conversational entry (`/chat`)
- Legacy Dashboard with priority matrix + divergence detection + AI Decision Packages
- Assessment Engine (16 modules, 5-level maturity, AI scoring) — though level-5 indicator content is incomplete (see Phase 1C)
- Roadmap Engine (~25% of playbook vision)
- RAG layer (1,152 playbook chunks, CMU/Carnegie attribution stripped)
- Supabase backend (15 tables, schema-v4 practitioners applied)
- **Clerk auth + Next 16 proxy** — practitioner-only API routes gated
- **Practitioner workspace data model** — `practitioners` + `practitioner_clients` (N:N) + `organizations.active_modules`
- **IDOR fix** — `assertPractitionerOwnsOrg` enforces ownership at handler layer (RLS policies pre-wired for Day 30)
- **Portfolio + Client Workspace shell** — `/clients` (table) + `/clients/[orgId]` (6-tab shell, Overview wired)
- **Onboarding hardening** — auth-gated, error display, role dropdown extended to CIO/CDIO/CDO/CISO
- **Assessment scope intersection** — stakeholder relevant_modules ∩ org active_modules
- Migration tooling (`scripts/migrate.js`, `inspect-db.js`, `verify-cmu-purge.js`)
- Local dev hardening (`docs/LOCAL_DEV.md`, orphan lockfile removed)

### NOT Built (the remaining Phase 1 work)
- Methodology depth (level-5 indicators, framework citations, narrative scoring) — Phase 1C
- Decision Package surfacing as standalone artifact — Phase 1C
- Stakeholder edit/email/reminders UI — Phase 1B
- Status Report Generator — Phase 1D
- Engagement Cadence (shareable read-only) — Phase 1D
- Value Tracker — Phase 1D
- MCP Server foundation — Phase 1D
- Rate limiting, synthesis transaction wrapping — Phase 1B safety
- Background jobs framework — Phase 2 if needed
- Stripe billing — Phase 3
- Vercel deployment — Phase 2

---

## Phase 1: PRACTITIONER TOOL (Days 1-25)

The single goal: by Day 25 the founder runs the **full Quick Win Stack engagement** end-to-end on Ambar Capital + 1-2 more real clients, and the platform is demo-quality for design-partner pilots.

### Phase 1A — Foundation ✅ Days 1-3 (done)

Closed P0-1 (auth), P0-2 (IDOR), P0-5 (practitioner workspace), P0-7 (conversations table). 8 commits. See `git log`.

### Phase 1B — Practitioner Operations + Safety (Days 4-7)

**Goal:** close the manual-workaround friction the founder hit during dogfood + finish remaining safety items.

| Day | Task | Outcome | Status |
|-----|------|---------|--------|
| 4 | Stakeholder edit UI (role + relevant_modules + influence_level) | No more SQL-edit-by-hand | ✅ commit `a95c829` |
| 4 | Email send via Resend (assessment links + reminders) | No more copy-paste | ✅ commit `a95c829` |
| 4 | Sandbox flag (deferred to Day 3 evening) | Real-vs-test boundary | ✅ commit `3e61c40` |
| 5 | Strip `assessment_token` from dashboard response | Closes P0-3 | ✅ commit `46339e5` |
| 5 | Wrap synthesis delete-then-insert in atomic stored proc | Closes P0-6 | ✅ commit `46339e5` |
| 5 | Upstash Redis rate limiting on `/api/chat` + `/api/assessments` | Closes P0-4 — needs `UPSTASH_*` env vars | ⏸ pending creds |
| 6 | Sentry error monitoring + Langfuse LLM observability | Visibility before depth work | ⏸ pending creds (`SENTRY_DSN`, `LANGFUSE_*`) |
| 7 | **Test/Real architectural primitive — `is_sandbox` becomes load-bearing across all surfaces** (workspace banner, assessment-page banner, email-routing safety, delete-org one-click, AI output tone). Orphan orgs (no `practitioner_clients` mapping) auto-defaulted to Test. Ambar confirmed real (`is_sandbox=false`, properly mapped). | Closes the Test-vs-Real triage problem permanently. No more per-org cleanup. | ⏳ design locked, ready to build |

**Day 7 architectural call (locked 2026-04-29):**
- TestCo (legacy, no mapping) → auto-flipped to Test + assigned to founder
- Ambar Capital → confirmed real-engagement; `active_modules = [5, 15, 4]` left as-is (founder's call as fractional CIO)
- Founder's role at Ambar: **fractional CIO** (drives the role-default mapping)

**Done = Founder onboards / edits / emails / monitors clients without manual workarounds. Test and Real clients are visually + behaviorally distinct everywhere.**

### Phase 1C — Methodology Depth: Quick Win Stack + Module 2 + AI-Leveraged Frameworks (Days 8-17)

**Goal:** The methodology becomes visible. Module 5 + 12 + 15 (the playbook's named "Quick Win Stack", 200-400% ROI in 90 days) get full depth so an assessment produces real diagnostic output, not just scores. AND the assessment becomes role-aware at the **question** level — a CEO no longer sees the same questions as a CTO inside a given module.

**New product principle baked into Phase 1C: question-level role/area segmentation + N/A escape (locked 2026-04-29).**

#### The two-layer question tagging system (added Day 8 alongside Module 5 rewrite)

Every diagnostic question gets tagged on two axes:

**Layer 1 — Executive function tags** (who's qualified to answer):
- `strategic` (governance, vision, business alignment)
- `financial` (budget, ROI, vendor cost)
- `technical` (architecture, implementation, controls)
- `operational` (processes, day-to-day execution)
- `risk` (compliance, threat, mitigation)

**Layer 2 — Business area tags** (which part of the company the question applies to):
- `operations`, `sales`, `IT`, `finance`, `marketing`, `other`

**Role → tag combinations:**

| Role | Sees questions tagged |
|---|---|
| CEO / Founder / Owner / President | strategic |
| CFO | strategic + financial |
| COO | strategic + operational |
| CIO / CDIO | strategic + financial + technical + operational |
| CTO | strategic + technical + operational |
| CISO | strategic + technical + risk |
| Director / Manager — Operations | `operations` area + operational |
| Director / Manager — Sales | `sales` area |
| Director / Manager — IT | `IT` area + technical + operational |
| Director / Manager — Finance | `finance` area + financial |
| Director / Manager — Marketing | `marketing` area |
| Director / Manager — Other | curated minimum (Module 1 leadership/governance) + lean on N/A |

#### N/A escape hatch (universal — every respondent, every question)

- **Per-module N/A** — gate at start of each module: *"Can you speak to this area?"* — N/A skips entire module
- **Per-question N/A** — text-link style ("I can't answer this") on each question — nudges effort but no shame for honest answers
- **Synthesis treats N/A as missing data, never as score 1** — average is computed only from given responses
- **New practitioner-side warning** in workspace Overview: *"Module X has thin coverage — fewer than 2 stakeholders answered, or below 50% of expected responses. Assign someone with visibility."*

#### Build order

| Day | Task | Outcome |
|-----|------|---------|
| 8-10 | **Module 5 deep + role/area tagging + N/A** — rewrite question bank against NIST CSF + CMMI; add level-5 indicators per question; AI-generated scoring narrative; "path to next level" recommendations from playbook RAG; cited authority (NIST CSF tier, CMMI process area). **Tag every question with executive function + business area.** **Wire N/A button (text-link) on each question + module-gate.** **Wire thin-coverage warning to practitioner.** | Proof of pattern. Dogfood on Ambar (Wadi as fractional CIO) before scaling. **Stop and review.** |
| 11 | **Decision Package surface** — standalone artifact, not buried in synthesis. Hero-level UI in workspace. | The "what should I do" output that wins prospects |
| **12** ✅ | **Module 12 deep — Tech Finance & Value Realization** (TBM Council + KPMG Return on Objectives). 13 questions across 4 subcategories (Cost Transparency, Cloud & SaaS Discipline, Vendor Economics, Value Realization). 8 TBM-anchored + 5 KPMG ROO-anchored. All role/area-tagged, level-5-indicators, framework-cited. | Quick Win Stack 2/3 done. CEO sees the cost-discipline + value-realization conversation framework-cited. |
| **13** | **Module 15 deep — Process Automation & Transformation** (APQC PCF + Lean Six Sigma). Replicate Module 5/12 pattern: 12-15 questions, role/area-tagged, level-5, framework-cited. | Quick Win Stack 3/3 — full demo-quality assessment. |
| **14-15** | **Quick Scan output upgrade** — public `/scan` becomes board-memo-quality artifact (cited, narrative, 3 named quick wins, projected ROI). **No AI lens here** — that lands in Phase 2.5 alongside its destination `/ai-readiness`. | Sales-conversion engine for the existing CDIO methodology. |
| **16** | **Module 2 deep — Tech Strategy & Business Alignment** anchored to **KPMG 4-practice + MIT Strategic Alignment Model**. 12-15 questions tagged + level 5 + framework-cited. Plus: **Tier 1 AI leverage — adaptive questioning** wired in (every stakeholder gets 6-8 contextually-selected questions instead of 15). Uses existing `generateFollowUpQuestions` infrastructure. | Pillar 3 (alignment) gets its strongest expression. Complexity tax of 15-question modules removed by adaptive selection. |
| **17** | **Framework citations layer + jargon → CEO-language translation** — every score, every recommendation links to the named framework + playbook excerpt. **Tier 1 AI leverage — runtime translation:** practitioner sees "PR.AA-05"; CEO sees "*Does your team enforce password rules everyone follows?*" Architecture deliberately generic — extends to NIST AI RMF + EU AI Act in Phase 2.5 without rebuild. | Methodology authority visible everywhere; AI-frameworks-ready by design; CEO never sees framework jargon. |

**Phase 1C also includes — explicit data migration plan (added 2026-04-29 MECE):** when Module 5/12/15 question banks are rewritten Days 8-13, existing assessment responses (Ambar's in-progress assessment, TestCo's completed assessment) need a migration plan. Options to evaluate Day 8: (a) preserve old responses by ID, present old questions in a read-only "legacy" tab; (b) discard old responses and re-prompt stakeholders; (c) machine-map old → new questions where possible, flag mismatches. **Decision required Day 8 before rewriting.**

**Done = Founder runs an assessment on a fresh client and the output makes the playbook's depth visible. CEOs answer 5x fewer questions than CTOs inside the same modules. N/A is a first-class option. Thin-coverage gaps surface automatically. Demo-quality.**

**Note:** Modules 1-4, 6-11, 13-14, 16 stay on today's module-level segmentation until they get a depth pass in later phases. Quick Win Stack is the demonstrable proof unit.

### Phase 1.5 — Production Deploy + Legal Foundation + Cost Telemetry (Days 18-20)

**Goal:** the platform goes online with a real domain, verified email, **and the legal/observability scaffolding required to operate publicly**. Methodology depth (just shipped in Phase 1C) ships INTO production. Real Ambar exec emails work. Demo URL exists for design-partner conversations.

**Locked level: L3 — Vercel + custom domain + verified email + legal + cost telemetry.**

| Day | Task | Outcome |
|-----|------|---------|
| 18 | **Vercel production deploy** — environment vars, build pipeline, smoke-test all critical flows in production. **Custom domain** (e.g., `ai-cdio.com` — domain decision pending founder) + DNS + SSL. **Tier 1 AI leverage — industry overlay generator:** AI rewrites base questions to feel native to the client's industry at runtime (manufacturing gets supply-chain phrasing; healthcare gets HIPAA phrasing). Massive content multiplier — 16 modules × 6 industries handled by one runtime function instead of 96 hand-written variants. | Public URL anyone can visit. Every assessment feels native to the client's industry. |
| 19 | **Verified email domain in Resend** — DNS records (SPF/DKIM/DMARC) for the custom domain. Update `send-assessment-email.ts` sender from `onboarding@resend.dev` to `you@<custom-domain>`. End-to-end test: send a real assessment email from prod, deliverability passes spam-folder check. **Cost telemetry instrumentation** — wire per-engagement LLM-cost tracking to `agent_logs` table (token counts × model × org_id). Required for Phase 3 pricing decisions to be evidence-based, not guessed. | Real Ambar exec emails work. Professional sender. Phase 1C dogfood unblocked at production-grade. Cost-per-client visibility exists from Day 1 of public exposure. |
| 20 | **Legal foundation** — Terms of Service + Privacy Policy + AI Disclaimer pages live at `/terms`, `/privacy`, `/ai-disclaimer`. Use Termly or Iubenda templates as starting point + light tailoring (no $5K legal review yet — that lands in Phase 2 Day 30 once we have real customer use). Cookie consent banner if EU traffic anticipated. Sign-up flow gated on accepting ToS + Privacy. **No public traffic before this lands.** | App is legally operable for public use. Closes a 12-day exposure window the previous plan had. |

**Done = `https://<custom-domain>` serves the platform with legal docs in place; assessment emails arrive in inboxes (not spam) from a verified custom domain; cost-per-engagement is tracked from the first production query.**

**Note:** L4 (asset library — demo video, one-pager, case study, LinkedIn templates) lands at the start of Phase 2 (Days 29-31) as the public-launch milestone. Full legal review by attorney lands Phase 2 Day 30 (P1-12) before scaling beyond design partners.

### Phase 1D — Initiative Pilot + Selection Engine + Network Catalog + Recurring Deliverables + MCP (Days 21-28, REVISED 2026-05-07)

**Goal:** The platform becomes the fractional CDIO's command center. The practitioner can run an initiative end-to-end with vendors and contractors, evaluate technology and partners with defensible artifacts, and produce the recurring deliverables (charters, status reports, cadence) the engagement requires — all in one place. Tactical task management stays in Jira/Asana via read-sync.

**Founder simplicity ranking drives sequencing (locked 2026-05-07):** C, D, A, B, E (template factory > Cadence > tool consolidation > vendor chasing > client switching). Days 21-23 directly serve C; Day 26 serves D; Day 28 serves A.

**Pre-Phase 1D mandatory gates (per Process Discipline in `STRATEGY-2026.md`):**
- `/plan-eng-review` on the entire Phase 1D scope before Day 21 starts
- `/cso` on the Network Catalog privacy + tenant-isolation model before Day 25 starts
- `/codex` for second opinion on the Selection Engine architecture before Day 24 starts

**Architectural pattern locked 2026-04-29, extended 2026-05-07:**
- **Charter** is generated from a Decision Package or Roadmap initiative; lean one-page format (PMI PMBOK is enterprise theater).
- **Initiative Pilot** is the multi-party coordination surface. Token-based contextual visibility for vendors / contractors / internal stakeholders — no Clerk accounts.
- **Selection Engine** (NEW) handles both Tech selection and Partner selection in a single matrix-based engine. Mode-switched. Practitioner sees the matrix and a leaning recommendation; practitioner makes the call.
- **Network Catalog** (NEW) is the per-practitioner private moat. Per-practitioner only — never cross-practitioner visible. P0 privacy boundaries locked in `STRATEGY-2026.md` Network Catalog Privacy Spec.
- **Decision Package** stays as ONE engine called with `domain: "cdio" | "ai"`. Domain-specific generators plug in.
- **Status Report Generator** auto-aggregates from Initiative Pilot data; carries `deliverable_types: []` array so Phase 2.5 AI sections plug in without refactor.
- **Engagement Cadence** milestones carry a `domain` field; AI milestones use `domain: "ai"`.
- **MCP Server** ships in 1D with 6 generic tools; Phase 2.5 registers 5 more AI-specific tools against the same registry.
- **Build-vs-Buy Advisor** folds into the Selection Engine on Day 24 — no longer a standalone Phase 2.5 deliverable. Phase 2.5 inherits an *AI-specific extension* of Selection Engine (with NIST AI RMF + EU AI Act overlays).

| Day | Task | Outcome |
|-----|------|---------|
| **21** | **Charter Generator** — lean one-page charter auto-populated from a Decision Package or Roadmap initiative. KPMG ROO (Return on Objectives) baked in as success criteria field. PDF export + Markdown editor + Resend send from verified domain. | Top-ranked admin pain (C) addressed first. Practitioner gets the charter as a deliverable in 5 minutes instead of starting blank. |
| **22-23** | **Initiative Pilot core** — initiative model + step generation from playbook RAG + multi-party invites (token-based contextual visibility, no Clerk accounts) + step ownership routing per participant role + AI co-pilot mode showing each participant *"here's what's next, here's what to send, here's what to decide"*. | Multi-party coordination on one surface. Vendors and contractors join via magic-link in 30 seconds. AI guides the next action. |
| **24** | **Selection Engine — Tech mode** — evaluation matrix builder per technology category (SIEM, MFA, IAM, CRM, ERP, BI, IaaS, RPA, etc.), AI leaning recommendation with caveats, paste-G2-link workflow (AI structures the review snippets into criteria scoring), defensible recommendation memo output. **Replaces** the standalone Phase 2.5 Build-vs-Buy Advisor. | The "best buy" artifact CEOs and boards actually trust — not a Gartner ranking, a client-specific scored matrix. |
| **25** | **Selection Engine — Partner mode + Network Catalog** — same matrix engine with partner-specific criteria templates (domain expertise, portfolio depth, cultural fit, pricing model, timezone, references, track record). **Network Catalog** is the per-practitioner tagged record of every partner the practitioner has worked with. AI suggests from the practitioner's network FIRST, then drafts external sourcing prompts (Upwork posting drafts, Clutch category nav, LinkedIn search drafts). Network Catalog updates automatically with post-engagement rating after every initiative closes. | Practitioner moat. Compounds engagement-over-engagement. Year-3 practitioner has 50-200 vetted contacts indexed by domain. **Privacy P0** — see `STRATEGY-2026.md` Network Catalog Privacy Spec. |
| **26** | **Engagement Cadence** — milestones (commitments, target dates, deliverable types), auto-populated from roadmap + initiative pilot + status + decisions, shareable read-only link (token-based, no portal). Milestones carry a `domain` field for Phase 2.5 AI integration. | Second admin pain (D — answering CEO's "where are we?") addressed. CEO sees the picture without the practitioner present. |
| **27** | **Status Report Generator** — auto-aggregated from Initiative Pilot data + Decision resolutions + Module score progression. Markdown editor + PDF export + Resend send. `deliverable_types[]` extension array for Phase 2.5 AI sections. | C continues — now trivial to build because data is already structured. 90 min → 12 min savings. |
| **28** | **MCP Server foundation + Jira/Asana read-sync** — auth, tool registry, 6 generic tools (`generate_status_report`, `query_client_data`, `propose_decision_package`, `create_initiative`, `update_initiative_step`, `query_initiative_status`). Jira/Asana read-sync (Mechanism B from STRATEGY-2026.md): pull tactical ticket status into the strategic Initiative Pilot view. | Third admin pain (A — tool consolidation via integration) addressed. Practitioner calls AI-CDIO from inside Claude.ai / Cursor / Codex while tactical work continues to live in Jira/Asana. |

**Auto-pulse / vendor-chasing automation = stretch goal**, not Day-21 commitment. Founder ranked vendor-chasing 4th in simplicity priority. Auto-pulse may land Phase 1D as a stretch if the team has time after Day 28; otherwise Phase 4.

**Done = Founder runs a full Quick Win engagement on Ambar end-to-end (charter → assessment → decisions → tech selection → partner selection from Network Catalog → initiative pilot with vendors and contractors → cadence visible to CEO → status reports auto-aggregated → all callable via MCP from Claude.ai). Every engine is built once and extended in Phase 2.5 — no rebuild work scheduled.**

---

## Phase 2: VALIDATION via Founder's Own CEO Clients (Days 29-38, REFRAMED 2026-05-07 evening)

**Goal (revised):** prove the platform delivers the 90-Day Commitment Matrix outcomes to the founder's REAL CEO clients (Ambar + 1-2 more). The Year 1 customer is the CEO, via the founder. Other fractionals are NOT the audience yet.

**No design partner pilots in Year 1.** Design partner / commercial release activity moves to Phase 3.

**What this phase actually does:**
1. Founder uses AI-CDIO daily on Ambar (his fractional CIO engagement)
2. Founder onboards 1-2 more REAL clients of his fractional practice
3. Each client engagement runs against the 90-Day Commitment Matrix locked in `docs/STRATEGY-2026.md`
4. Outcomes logged weekly in `docs/OUTCOMES.md` — specific dollar amounts saved, specific decisions caught, specific board moments won
5. Modules 12, 15, 2 get their depth pass DURING this phase based on what the real engagements need (deferred from Phase 1C)
6. Founder writes case studies / LinkedIn posts FROM real CEO outcomes — Year 1 marketing is "what my CEO clients experience," not "what fractionals can buy"

Note: production deploy (Phase 1.5, Days 18-20) was promoted out of Phase 2 because methodology depth needed to ship into a real environment.

| Day | Task |
|-----|------|
| 29-30 | **Founder onboards Ambar + 1-2 more REAL clients onto the platform.** Run the 90-Day Commitment Matrix on each (Day 14 baseline → Day 21 first decisions → Day 30 AI roadmap → etc.). Outcomes logged weekly in `docs/OUTCOMES.md`. |
| 30 | **Full legal review by attorney** (P1-12 — closes the templates-only state from Phase 1.5 Day 20). Targeted at AI disclaimer wording + EU AI Act / GDPR exposure + the 90-Day Commitment language in `docs/CONTRACT-TEMPLATES.md`. |
| 31-33 | **Modules 12, 15, 2 depth passes (deferred from Phase 1C)** — Module 12 (Tech Finance & Value Realization, TBM Council + KPMG ROO), Module 15 (Process Automation & Transformation, APQC + Lean Six Sigma), Module 2 (Tech Strategy & Business Alignment, KPMG 4-practice + MIT). Driven by what the real Ambar engagement actually needs. |
| 31-32 | **Quick Scan output upgrade** (deferred from Phase 1C Days 14-15) — public `/scan` becomes board-memo-quality artifact (cited, narrative, 3 named quick wins, projected ROI). Top-of-funnel asset for CEO conversations. |
| 33-34 | **CEO-facing asset library built — outcome-led, not feature-led.** One-pager + 3-5 min demo video + anonymized Ambar case study (real outcomes from the platform's first 30 days) + LinkedIn post templates. **All artifacts lead with what the CEO experiences**, not what fractionals can buy. |
| 35-36 | **LinkedIn cadence ramps — to other fractional CDIOs' CEO clients (the founder's prospects), not to other fractionals.** 3 posts/week sharing real Ambar wins (anonymized). Founder is positioning himself as THE fractional CDIO who delivers the 90-Day Commitment Matrix. |
| 37-38 | **Pricing & Packaging design (DEFERRED from Phase 1 — pricing for Phase 3 commercial release)** — three tiers sketched on paper before Phase 3 Stripe build, anchored to `docs/STRATEGY-2026.md` Architectural Law 2: methodology is FULL on every tier; compute is the variable-cost lever. Provisional sketch (final numbers from Day 19 cost telemetry): <br>• **Starter $199/mo** — 1-3 clients, Mechanism 1 (allowance + metered overage). AI Accelerator included IF margin math works. <br>• **Growth $399/mo** — 4-15 clients, Mechanism 2 (BYOK). Full AI Accelerator unconditionally. <br>• **Scale $599/mo** — unlimited clients, Mechanism 2 (BYOK). Full AI Accelerator + Knowledge Reuse + Custom playbook + priority support. <br>**Pricing is for Year 2+ when other fractionals come in. Year 1 the only "customer" is the founder using the tool on his own engagements.** Stripe products + prices configured in test mode at end of this phase, NOT yet exposed to public. |

**Done = Founder has delivered the 90-Day Commitment Matrix to at least one real CEO client (Ambar) end-to-end. Outcome log has 5+ specific entries. Modules 12, 15, 2 are deep. Asset library leads with CEO outcomes. Pricing sketched for Year 2+ release. Legal reviewed. Quick Scan public artifact is board-memo-quality.**

---

## Phase 2.5: AI ACCELERATOR ENGINE (Days 39-50)

**Goal:** Equip the practitioner to be the credible AI advisor for their CEO clients. Triggered by the AI-as-buy-trigger thesis (see `docs/STRATEGY-2026.md`). Practitioner-first preserved — CEOs never get a paid AI-CDIO account.

**Architecture:** AI Accelerator follows the same Engine pattern (load context, load playbook, generate, persist). It's a flagship engine inside the practitioner workspace, not a separate product. **All Phase 1D engines were designed with extension points (`deliverable_types[]`, `domain` field, forward-looking MCP registry) so this phase plugs in without rebuild.**

**Pre-Phase 2.5 mandatory gates (per `STRATEGY-2026.md` Process Discipline):**
- `/autoplan` on the full Phase 2.5 scope before Day 39 starts (CEO + Design + Eng review chained)
- `/codex` for second opinion on the multi-agent architecture decision (Tech Selection deep eval, AI Roadmap multi-step generation)
- `/cso` on the AI governance scaffolding model

**gsd-2 runtime integration decision gate — Day 38 (end of Phase 2, before Phase 2.5 starts):** evaluate whether to use gsd-2's Pi SDK subagent infrastructure for Phase 2.5 multi-agent flows, or build custom. Three options on the table:
- **(A)** Custom multi-agent build using Anthropic SDK directly. Most control, most work (~5-7 days of infrastructure on top of feature work).
- **(B)** Pattern adoption only — borrow gsd-2's patterns (single-writer state, fresh-context-per-task, crash recovery, cost tracking, stuck detection) but no runtime dependency. Already partially adopted; see `STRATEGY-2026.md` Architectural Lineage.
- **(C)** Build AI Accelerator multi-agent flows on gsd-2's Pi SDK runtime. Skips ~5-7 days of infrastructure work; introduces a runtime dependency on a CLI-oriented system that isn't designed for SaaS deployment. Requires server-side gsd-2 invocation pattern that doesn't exist today.

**Decision driven by:** Day 19+ cost-per-engagement telemetry showing whether multi-agent compute is the bottleneck; Phase 2 design partner feedback on Phase 1D Selection Engine deep-evaluation flows; gsd-2 release stability between now and Day 38 (currently v2.80, fast-moving).

| Day | Task | Outcome |
|-----|------|---------|
| 39-40 | **AI Maturity Model + Assessment Engine** — 6-8 dimensions (data foundations, use-case identification, talent, governance, infrastructure, change mgmt, ROI tracking, vendor strategy). 5-level maturity per dimension. Plain-English questions tagged with the role/area system from Phase 1C (CEO-tagged questions strip out "MLOps" jargon). | The named "AI Readiness Assessment" CEOs are searching for |
| 41-42 | **AI Use-Case Library** — pre-built catalog by industry × function (sales, ops, finance, customer service, HR). Each use-case: ROI estimate, time-to-value, complexity, vendor options, build-vs-buy hint. Filterable by client size + industry + maturity. Initial catalog: 30-50 named use cases. | The "what could I do?" answer — CEOs need a menu, not a blank canvas |
| 43-44 | **AI Roadmap Generator** — 90 / 180 / 360 day plan tailored to client. Quick wins (90), foundation (180), scale (360). Pulls from playbook RAG + AI Use-Case Library. | The "how do I implement faster?" question answered visually |
| 45 | **AI-flavored Selection Engine pass** — extends the Tech Selection Engine (shipped Phase 1D Day 24) with AI-specific evaluation criteria: model-vendor lock-in, training data ownership, build-vs-buy heuristics for AI specifically (Copilot vs Salesforce Einstein vs custom), AI-vendor cost-range library, AI-specific risk scoring, EU AI Act / NIST AI RMF compliance flags. **No standalone Build-vs-Buy Advisor** — the generic Selection Engine handles both tech and AI domains via a `domain: "tech" \| "ai"` parameter. | The AI build-vs-buy decision answered by the same engine that handles every other tech selection. No double-build. |
| 46 | **Governance Scaffolding** — AI policy template, EU AI Act checklist, NIST AI RMF mapping, bias-review workflow, AI use-case approval form. **Reuses the framework citations layer from Phase 1C Days 16-17** — extends it with NIST AI RMF + EU AI Act, no rebuild. | Regulatory pressure makes this Day-1 needed |
| 47-48 | **AI deliverable surfacing** — AI Readiness Report, AI Roadmap, AI Decision Package added as standalone artifacts in client workspace. **AI milestones flow into Engagement Cadence** via `domain: "ai"` field (extension point from Phase 1D). **AI KPIs flow into Status Reports** via `deliverable_types[]` array (extension point from Phase 1D). **5 AI-specific MCP tools registered** against existing tool registry. AI Decision Package generated by the same Decision Package engine called with `domain: "ai"`. | AI is not a sidecar — it's woven into every existing surface, using extension points already built |
| 49 | **Public AI Quick Scan at `/ai-readiness`** — anonymous 5-minute teaser assessment. Output is a teaser report + CTA: *"Want a real AI roadmap? Connect with a fractional CDIO using AI-CDIO."* Lead capture goes to **practitioners**, not direct subscriptions. | Top-of-funnel lead magnet for practitioner sign-ups — now with a real destination |
| 50 | **Quarterly re-assessment cadence wiring** — AI Readiness has a `last_reassessed_at` field; workspace surfaces a prompt at 90-day intervals; tracking shows AI maturity progression over time. | The AI field moves monthly. Quarterly re-assessment is the renewal-lock-in mechanism. |

**Done = A practitioner can walk into a CEO conversation and say: "Let me run a 30-min AI Readiness assessment with your team, and I'll come back with a 90-day AI roadmap, build-vs-buy advice, and a governance starter kit." The platform produces all of it. The 90-Day Commitment Matrix Day-30 deliverable (AI Quick Win Roadmap) gets full deep follow-through here.**

---

## Phase 3: COMMERCIAL RELEASE — Open to Other Fractionals (Days 51-75, REFRAMED 2026-05-07 evening)

**Goal:** open the platform to other fractional CDIOs as a new income stream. **This is when the audience shifts from CEO (Year 1) to other fractionals (Year 2+).**

**Trigger to enter Phase 3 (locked 2026-05-07 evening):** the founder must have delivered the 90-Day Commitment Matrix end-to-end on at least Ambar (and ideally 1-2 more clients), with `docs/OUTCOMES.md` showing 5+ specific CEO outcomes. Without that, Phase 3 launches into a positioning vacuum.

**Account & billing settings UI is the Day-1 deliverable** — fractionals need a place to view their current plan, change plans, update payment, see usage, manage notifications. Cannot ship Stripe without this surface.

| Days | Task |
|---|---|
| 51-53 | **Account & Billing Settings UI** — `/settings` with tabs: Profile (name, email, password reset via Clerk), Plan (current tier, usage vs limits, upgrade/downgrade), Billing (payment method, invoices), Notifications (email preferences for status reports, reminders, system alerts). Built BEFORE Stripe so the destination exists when subscriptions go live. |
| 54-58 | **Stripe billing integration**. Tiers configured per Phase 2 Day 37-38 design + Day 19+ cost telemetry. Mechanism 1 (allowance + metered overage) for Starter; Mechanism 2 (BYOK) for Growth + Scale per `docs/STRATEGY-2026.md` Architectural Law 2. **No methodology gating** — AI Accelerator availability driven by margin math from cost telemetry, not by tier. Webhook handlers for subscription events. Test mode → live mode cutover. |
| 59-63 | **First fractional design partners onboarded.** Each gets free pilot using the founder's case studies + outcome log + 90-Day Commitment Matrix as the productized methodology. The founder personally onboards the first 3-5 — they're peers, not strangers. **Day 90 metrics dashboard built** — internal-only `/admin/metrics` showing: paying customers count + MRR + founder daily-use streak + outcome log entry count + 90-Day Commitment Matrix completion rate per CEO client. |
| 64-68 | **First case studies published with permission** — written from the Year 1 CEO outcomes (anonymized Ambar wins), positioned for OTHER FRACTIONALS now reading them. LinkedIn cadence ramps to other fractionals (Year 2+ audience). |
| 69-72 | **Value/ROI Tracker (Engine #3)** — commit→deliver→prove cycle. Same engine that lets the founder prove ROI to his CEO clients now lets fractional customers prove ROI to theirs. |
| 73-75 | First original research draft: *"State of the Fractional CDIO 2026: What I Learned Productizing My Methodology"* — first-person, founder voice, real Ambar data anonymized. Quarterly publication target. |

**Done = 3-5 fractional design partners running engagements on the platform, founder positioned in fractional-CDIO community, Stripe in test mode with first paying customers, Day 90 metrics dashboard live.**

**Day 90 review (per `docs/STRATEGY-2026.md` Day 90 Kill Switch section, REVISED 2026-05-07 evening):** evaluation criteria are **CEO outcomes delivered by the founder via the platform**, NOT paying-customer count from fractionals. Paying-customer count is a Year 2 metric. Year 1 metric is the outcome log.

---

## Phase 4: SCALE & DEEPEN (Days 76-180)

Note: Phase 4 shifted +15 days from original because Phase 2.5 (AI Accelerator) + Phase 1.5 expansion (legal day) were inserted.

| Days | Task |
|---|---|
| 76-90 | QBR Deck Generator (Engine #4) · Templates Library (charters, vendor playbook, M&A DD, risk register) · Knowledge Reuse panel ("I solved this at Client X") · Module-level improvement chat. **Day 90 kill-switch review** at end of this stretch. |
| 91-120 | Document/image upload + AI Vision evidence analysis · Engagement Lifecycle (Phase 1→2→3 progression UI) · Annual pricing option (20% discount) · **AI Use-Case Library expanded** with patterns from real customer engagements · Anonymous chat conversations cleanup (low-priority backlog item from MECE audit) |
| 121-150 | First MSP partner pilot (one MSP, 50+ end clients) · Co-branded client portal (lightweight, opt-in, replacing some Cadence Share use cases) |
| 151-180 | Resource & capacity planner · Referral program · Hire first part-time CSM · 100+ paying customers, $30K+ MRR |

---

## Phase 5: PLATFORM (Year 2+)

Only if Phase 1-4 has delivered clear PMF. None of these are commitments.

| Quarter | Focus |
|---------|-------|
| Q5 | AI-Strategist sibling (parallel methodology toolkit on shared MCP infrastructure) |
| Q5 | **Module 17 — Sales / Marketing / Revenue Tech** (CANDIDATE, not commitment). The current 16 modules over-index on infrastructure and governance and under-index on revenue-side tech. Modern SMB CDIOs spend 30-50% of time on sales tech, marketing tech, customer success tech. Ship Module 17 ONLY IF customer demand confirms the gap. See `STRATEGY-2026.md` Law 7 for other future-module candidates (Vision & North Star, Governance & Decision Rights split, AI as its own module, Sustainability / ESG Tech). |
| Q6 | AI-OME sibling |
| Q7 | Cross-agent intelligence (shared client context across CDIO+Strategist+OME) |
| Q8 | Multi-language (Spanish first if Latin American demand emerges) |
| Q9+ | Custom playbook support (white-label methodologies for partner consultancies) |
| Q10+ | Mobile app |

---

## Year-2 Module Candidates (flagged 2026-05-07, NOT committed)

The current 16 modules (`STRATEGY-2026.md` + `src/types/index.ts` `MODULE_META`) over-index on infrastructure / governance / cost discipline and under-index on revenue-side technology. The customer journey audit on Day 11 surfaced gaps. **None of these modules ship in Year 1.** They get added only if 5+ paying practitioners specifically request them, OR if a Phase 4 customer-feedback round shows clear pull.

| Candidate | Description | Trigger to add |
|---|---|---|
| **Module 17 — Sales, Marketing & Revenue Technology** | CRM, sales enablement, marketing automation, RevOps, attribution. Modern SMB CDIOs spend 30-50% of their time on revenue-side tech; current 16 modules barely touch it (Module 9 covers CX, Module 7 covers platforms; neither owns revenue stack). | 5+ practitioners ask explicitly |
| **Module 18 — AI as its own dimension** | Splits from Module 6 (Data & AI Capabilities) once Phase 2.5 lands. Anchored on NIST AI RMF + EU AI Act + ISO/IEC 42001. AI gets its own maturity model + role-tagged questions + framework citations. | Phase 2.5 customer feedback shows AI deserves its own assessment surface, not just a Module 6 sub-section |
| **Module 19 — Governance & Decision Rights** | RACI, decision boards, escalation paths, technology governance committees. Currently a thin slice of Module 1; deserves its own depth. | Customer pull from larger SMBs (250+ employees) where governance complexity matters |
| **Module 20 — Customer Success & Support Technology** | Help desk, knowledge base, customer health scoring, success ops. Different from CX (Module 9) — operational, not journey-focused. | SaaS-heavy SMB customer pull |
| **Module 21 — Sustainability / ESG Technology** | Carbon accounting, supply chain transparency, ESG reporting. Increasingly board-level. | Regulatory pressure (CSRD in EU, SEC climate disclosures in US) creates board-level demand for SMB CDIOs |

---

## Build Order Decision Criteria

When choosing what to build next, apply this in order:

1. **Does it save the founder time on a real client engagement THIS WEEK?** → Highest priority
2. **Does it close a sale that's stalled at "yes if you build X"?** → High priority
3. **Does it unblock a paying customer who's complained?** → High priority
4. **Does it expose methodology depth that's currently hidden?** → High priority (NEW — practitioner-first)
5. **Does it reduce cost (LLM, infra, support)?** → Medium priority
6. **Does it open a new segment/channel?** → Medium priority
7. **Is it nice-to-have or competitive feature parity?** → Low priority

If a feature is none of the above, defer it.

---

## The Kill Switch

**Day 90 review criteria:**
- 5+ paying customers at $199+ → continue, accelerate
- 1-4 paying customers + founder using daily → continue, slow burn
- 0 paying + 0 commitments + founder NOT using daily → STOP. Reframe or shelve.
- Founder using daily and saving 5+ hrs/client/mo, even at 0 paid → continue. The tool is the product.

The kill switch protects against sunk-cost spiral. It does not punish slow paying-customer ramp if the dogfood loop is healthy.
