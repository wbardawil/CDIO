# AI-CDIO: Session Handoff

This is the entry point for a fresh Claude Code session. It tells you **where we are**, **what's next**, and the **context required to continue**.

---

## TL;DR (read this first)

AI-CDIO is the **methodology operating system for fractional CDIOs**. Built first as a tool the founder (Wadi Bardawil) uses on his own fractional practice. **Customer #0 = the founder.**

**Current state (2026-05-07, end of Day 11 — doc-lock complete in cross-environment continuation session):**

This session was the inflection point. We shifted the platform from feature-led to outcomes-led, expanded scope to include execution oversight, and committed to a multi-corpus RAG / selective multi-agent architecture. **Code state unchanged from end of Day 10.** Strategy + roadmap heavily updated. **As of this commit, Day 11 architectural decisions A-G are committed to docs:**
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
- ✅ **Day 11: Outcomes-led strategy rewrite + 16 module renames + AI leverage roadmap**
- ⏳ Day 12 (next session): Module 12 deep — Tech Finance & Value Realization (TBM Council + KPMG ROO)

---

## Day 11 — what shifted strategically (the new session reads this carefully)

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
| **12** | Module 12 deep — Tech Finance & Value Realization (TBM Council + KPMG ROO). 12-15 questions tagged + level 5 + framework-cited. The new outcome-led framing baked in from question-bank up. |
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
