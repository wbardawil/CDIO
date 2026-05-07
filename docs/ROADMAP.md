# AI-CDIO: Build Roadmap

> **Companion strategy doc:** `docs/STRATEGY-2026.md` is the active strategic source of truth.
> **Last refreshed:** 2026-05-07 (Phase 1C Day 11 — outcomes-led strategy rewrite; 16 modules renamed + framework-anchored + one-liners added; **Module 2 deep promoted from Phase 4 to Phase 1C Day 16** because it's the structural expression of Pillar 3 — strategy-tech alignment is the platform's strongest pillar; **Tier 1 AI leverage** added to Phase 1C/1.5: adaptive questioning (Day 16), framework-jargon-to-CEO-language translation (Day 17), industry overlay generator (Day 18). These mitigate the complexity tax of 15-question framework-anchored modules.).
>
> **Previous refresh:** 2026-04-29 (Phase 1B Day 6 MECE rewrite — AI lens removed from Phase 1C, legal foundation moved into Phase 1.5, pricing slotted into Phase 2, Phase 2.5 expanded to 12 days).

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
| 12-13 | **Module 12 deep (Financial Acumen)** + **Module 15 deep (Process Automation)** — replicate Module 5 pattern, **including role/area tagging + N/A** | Quick Win Stack assessment is demo-quality, role-aware, N/A-safe |
| 14-15 | **Quick Scan output upgrade** — public `/scan` becomes board-memo-quality artifact (cited, narrative, 3 named quick wins, projected ROI). **NO AI lens here** — the AI Quick Scan teaser was deferred to Phase 2.5 to avoid teasing a feature that doesn't exist yet. | Sales-conversion engine for the existing CDIO methodology |
| 16 | **Module 2 deep — Tech Strategy & Business Alignment** (PROMOTED from Phase 4 on 2026-05-07) anchored to **KPMG 4-practice + MIT Strategic Alignment Model**. 12 questions tagged + level 5 + framework-cited. Plus: **Tier 1 AI leverage — adaptive questioning** wired in (every stakeholder gets 6-8 contextually-selected questions instead of 15). Uses existing `generateFollowUpQuestions` infrastructure. | Pillar 3 (alignment) gets its strongest expression. Complexity tax of 15-question modules removed by adaptive selection. |
| 17 | **Framework citations layer + jargon → CEO-language translation** — every score, every recommendation links to the named framework + playbook excerpt. **Tier 1 AI leverage — runtime translation:** practitioner sees "PR.AA-05"; CEO sees "*Does your team enforce password rules everyone follows?*" Architecture deliberately generic — extends to NIST AI RMF + EU AI Act in Phase 2.5 without rebuild. | Methodology authority visible everywhere; AI-frameworks-ready by design; CEO never sees framework jargon. |

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

### Phase 1D — Recurring Deliverables + MCP (Days 21-28)

**Goal:** The platform produces the practitioner's recurring artifacts and is callable from Claude.ai. **Engines explicitly designed with extension points for Phase 2.5 AI Accelerator** so we don't double-build.

**Architectural pattern locked 2026-04-29 (MECE coordination fixes 4-6):**
- **Decision Package** is ONE engine called with a `domain: "cdio" | "ai"` parameter. Domain-specific generators plug in. One UI surface, one persistence layer.
- **Status Report Generator** has a `deliverable_types: []` array on each report; AI status sections are a deliverable type added in Phase 2.5 (no rebuild).
- **Engagement Cadence** milestones carry a `domain` field; AI milestones use `domain: "ai"`. Same Cadence UI handles both.
- **MCP Server** ships in 1D with 3 generic tools; Phase 2.5 registers 5 more AI-specific tools against the same tool registry. Auth + transport stays the same.

| Day | Task | Outcome |
|-----|------|---------|
| 21-24 | **Status Report Generator (Engine #2)** — table + API + AI narrative + Markdown editor + PDF export + Resend send (now from verified domain). **Designed with `deliverable_types[]` extension array** so Phase 2.5 AI sections plug in without refactor. | Month-2 retention proof. 90 min → 12 min savings. AI-extension-ready. |
| 25-27 | **Engagement Cadence** — milestones (commitments, target dates, deliverable types), auto-populated from roadmap + status + decisions, **shareable read-only link** (token-based, no portal). **Milestones carry a `domain` field** so AI Accelerator milestones (Phase 2.5) integrate cleanly. | Practitioner-as-trusted-partner differentiator. Client-facing without portal complexity. AI-extension-ready. |
| 28 | **MCP Server foundation** — auth, tool registry, first 3 tools (`generate_status_report`, `query_client_data`, `propose_decision_package`). **Tool registry is forward-looking** — Phase 2.5 will add 5 AI-specific tools against the same architecture: `run_ai_readiness_assessment`, `generate_ai_roadmap`, `propose_ai_use_cases`, `evaluate_build_vs_buy`, `generate_ai_governance_kit`. | Practitioner can call AI-CDIO from Claude.ai / Cursor / Codex. AI-extension-ready. |

**Done = Founder runs full Quick Win engagement on Ambar end-to-end (assessment → cadence → status reports → decision packages) using the platform, including from Claude.ai via MCP. Every engine is built once and extended in Phase 2.5 — no rebuild work scheduled.**

---

## Phase 2: VALIDATION (Days 29-38)

**Goal:** Prove the practitioner-first promise on real engagements. Onboard 5 design partners. Design pricing & packaging before Phase 3 Stripe. Build onboarding email sequence + help docs so design partners can self-serve.

Note: production deploy (Phase 1.5, Days 18-20) was promoted out of Phase 2 because methodology depth needed to ship into a real environment.

| Day | Task |
|-----|------|
| 29-31 | **L4 launch readiness — asset library built**: differentiator one-pager, 3-5 min demo video, anonymized Ambar case study, three LinkedIn post templates |
| 29-31 | Founder uses platform daily on Ambar + 1-2 more real clients. Document time savings explicitly ("this report took 12 min, used to take 90"). |
| 30 | **Full legal review by attorney** (P1-12 — closes the templates-only state from Phase 1.5 Day 20). Targeted at AI disclaimer wording + EU AI Act / GDPR exposure if non-US traffic. |
| 31-33 | **Onboarding email sequence + Help/Docs (NEW — MECE fix)** — practitioner sign-up triggers a 5-email welcome series (Day 0 confirm, Day 1 first-client setup, Day 3 your-first-Quick-Scan, Day 7 status-report walkthrough, Day 14 pilot check-in). Help center built at `/help` with: getting-started guide, Quick Win Stack engagement walkthrough, video walkthrough of each engine, FAQ. Design partners can self-serve, founder isn't bottleneck. |
| 32-34 | LinkedIn post: "I'm building this. Want early access?" Cadence ramps to 3 posts/week. First 30 DMs (15 fractional + 15 director). |
| 35-38 | **Pricing & Packaging design (NEW — MECE fix)** — three tiers locked on paper before Phase 3 Stripe build: <br>• **Starter $199/mo** — 1-3 clients, Quick Scan + Assessment + Decision Package + Status Reports (Engine #2). No AI Accelerator. <br>• **Growth $399/mo** — 4-15 clients, all of Starter + Engagement Cadence (shareable client view) + MCP server access + **AI Accelerator engine (full)**. The marketed differentiator. <br>• **Scale $599/mo** — unlimited clients, all of Growth + Value Tracker + priority support + early access to new engines + capacity planner (when shipped). <br>Annual pricing 20% discount option deferred to Phase 4. Stripe products + prices configured in test mode at end of this phase. |
| 35-38 | 5 design-partner pilots onboarded free using the new email sequence + help docs. 14-day pilot structure. Discovery → demo → pilot funnel weekly slots. |

**Done = Founder uses platform daily. 5 design partners actively running engagements on it. LinkedIn cadence active. Pricing locked on paper. Onboarding is self-serve. Legal reviewed.**

---

## Phase 2.5: AI ACCELERATOR ENGINE (Days 39-50)

**Goal:** Equip the practitioner to be the credible AI advisor for their CEO clients. Triggered by the AI-as-buy-trigger thesis (see `docs/STRATEGY-2026.md`). Practitioner-first preserved — CEOs never get a paid AI-CDIO account.

**Architecture:** AI Accelerator follows the same Engine pattern (load context, load playbook, generate, persist). It's a flagship engine inside the practitioner workspace, not a separate product. **All Phase 1D engines were designed with extension points (`deliverable_types[]`, `domain` field, forward-looking MCP registry) so this phase plugs in without rebuild.**

**Phase expanded from 10 to 12 days (MECE fix 8) — original 10-day estimate for 12 deliverables was aggressive. Realistic budget below.**

| Day | Task | Outcome |
|-----|------|---------|
| 39-40 | **AI Maturity Model + Assessment Engine** — 6-8 dimensions (data foundations, use-case identification, talent, governance, infrastructure, change mgmt, ROI tracking, vendor strategy). 5-level maturity per dimension. Plain-English questions tagged with the role/area system from Phase 1C (CEO-tagged questions strip out "MLOps" jargon). | The named "AI Readiness Assessment" CEOs are searching for |
| 41-42 | **AI Use-Case Library** — pre-built catalog by industry × function (sales, ops, finance, customer service, HR). Each use-case: ROI estimate, time-to-value, complexity, vendor options, build-vs-buy hint. Filterable by client size + industry + maturity. Initial catalog: 30-50 named use cases. | The "what could I do?" answer — CEOs need a menu, not a blank canvas |
| 43-44 | **AI Roadmap Generator** — 90 / 180 / 360 day plan tailored to client. Quick wins (90), foundation (180), scale (360). Pulls from playbook RAG + AI Use-Case Library. | The "how do I implement faster?" question answered visually |
| 45 | **Build-vs-Buy Advisor** — Copilot vs Salesforce Einstein vs custom. Cost ranges. Risk scoring. Decision tree based on client profile. | The decision CEOs actually agonize over |
| 46 | **Governance Scaffolding** — AI policy template, EU AI Act checklist, NIST AI RMF mapping, bias-review workflow, AI use-case approval form. **Reuses the framework citations layer from Phase 1C Days 16-17** — extends it with NIST AI RMF + EU AI Act, no rebuild. | Regulatory pressure makes this Day-1 needed |
| 47-48 | **AI deliverable surfacing** — AI Readiness Report, AI Roadmap, AI Decision Package added as standalone artifacts in client workspace. **AI milestones flow into Engagement Cadence** via `domain: "ai"` field (extension point from Phase 1D). **AI KPIs flow into Status Reports** via `deliverable_types[]` array (extension point from Phase 1D). **5 AI-specific MCP tools registered** against existing tool registry. AI Decision Package generated by the same Decision Package engine called with `domain: "ai"`. | AI is not a sidecar — it's woven into every existing surface, using extension points already built |
| 49 | **Public AI Quick Scan at `/ai-readiness`** — anonymous 5-minute teaser assessment (the AI lens deferred from Phase 1C lands here, alongside the destination it funnels to). Output is a teaser report + CTA: *"Want a real AI roadmap? Connect with a fractional CDIO using AI-CDIO."* Lead capture goes to **practitioners**, not direct subscriptions. | Top-of-funnel lead magnet for practitioner sign-ups — now with a real destination |
| 50 | **Quarterly re-assessment cadence wiring** — AI Readiness has a `last_reassessed_at` field; workspace surfaces a prompt at 90-day intervals; tracking shows AI maturity progression over time. | The AI field moves monthly. Quarterly re-assessment is the renewal-lock-in mechanism. |

**Done = A practitioner can walk into a CEO conversation and say: "Let me run a 30-min AI Readiness assessment with your team, and I'll come back with a 90-day AI roadmap, build-vs-buy advice, and a governance starter kit." The platform produces all of it. The Growth tier ($399/mo, locked Phase 2 Day 35-38) is now defensible.**

---

## Phase 3: MONETIZATION (Days 51-75)

**Goal:** Convert pilots to paid. Hit Day 90 kill-switch criteria with margin. Note: Phase 3 shifted +15 days from original (Phase 2.5 + Phase 1.5 expansions).

**Account & billing settings UI (NEW — MECE fix G) is the Day-1 deliverable** — practitioners need a place to view their current plan, change plans, update payment, see usage, manage notifications. Cannot ship Stripe without this surface.

| Days | Task |
|---|---|
| 51-53 | **Account & Billing Settings UI** — `/settings` with tabs: Profile (name, email, password reset via Clerk), Plan (current tier, usage vs limits, upgrade/downgrade), Billing (payment method, invoices), Notifications (email preferences for status reports, reminders, system alerts). Built BEFORE Stripe so the destination exists when subscriptions go live. |
| 54-58 | **Stripe billing integration**. Tiers configured per Phase 2 Day 35-38 design: Starter $199, Growth $399, Scale $599. **AI Accelerator gated to Growth+ tier** via a feature flag check (single source of truth: `lib/billing/feature-gates.ts`). Webhook handlers for subscription events. Test mode → live mode cutover. |
| 59-63 | Convert pilots to paid at Day 14/30/60 of their engagement. First 3-5 paying customers. **Day 90 metrics dashboard built (NEW — MECE fix E)** — internal-only `/admin/metrics` showing: paying customers count + MRR + founder daily-use streak + average hours saved per client per month (founder-reported). The kill-switch math is no longer manual. |
| 64-68 | First case studies published (with permission), **including at least one AI-implementation case**. LinkedIn cadence to 5 posts/week. DM cadence to 30/week. |
| 69-72 | Value/ROI Tracker (Engine #3) — commit→deliver→prove cycle. Renewal engine for first paying cohort. |
| 73-75 | First original research draft: "State of the Fractional CDIO 2026: How Practitioners Are Helping SMBs Implement AI" — aggregate anonymized data. Quarterly publication target. |

**Done = 5-8 paying customers, $1.5-4K MRR, retained pilots, public case studies, LinkedIn momentum, Day 90 metrics tracked automatically.**

**Day 90 review hits at Day 75 + 15 = Day 90.** Kill switch criteria evaluated using auto-tracked metrics from Day 59 onward. Slow-burn outcome (1-4 paying + founder daily) is the planning baseline; see `docs/STRATEGY-2026.md` Day 90 Kill Switch section.

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
| Q6 | AI-OME sibling |
| Q7 | Cross-agent intelligence (shared client context across CDIO+Strategist+OME) |
| Q8 | Multi-language (Spanish first if Latin American demand emerges) |
| Q9+ | Custom playbook support (white-label methodologies for partner consultancies) |
| Q10+ | Mobile app |

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
