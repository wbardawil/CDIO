# AI-CDIO: Session Handoff

This is the entry point for a fresh Claude Code session. It tells you **where we are**, **what's next**, and the **context required to continue**.

---

## TL;DR (read this first)

AI-CDIO is the **methodology operating system for fractional CDIOs**. Built first as a tool the founder (Wadi Bardawil) uses on his own fractional practice. **Customer #0 = the founder.**

**Current state (2026-04-29, end of Day 6):**
- ✅ **Phase 1A — Foundation** complete (auth, practitioner schema, IDOR fix, Portfolio + Workspace shell)
- ▶ **Phase 1B — Practitioner Operations + Safety** (Days 4-7) underway
  - ✅ Day 3.5 bonus: Sandbox flag for safe testing alongside real engagements
  - ✅ Day 4: stakeholder edit UI + email send via Resend (closes manual SQL + copy-paste workarounds)
  - ✅ Day 5: P0-3 (token strip) + P0-6 (atomic synthesis stored proc)
  - ⏸ Day 5/6: Upstash rate limiting + Sentry + Langfuse — waiting on env vars
  - ⏳ Day 7: **Test/Real architectural primitive** — `is_sandbox` becomes load-bearing across all surfaces (workspace banner, assessment-page banner, email-routing safety, sandbox-only delete, AI tone). Orphan orgs auto-defaulted to Test. **Design locked 2026-04-29, ready to build.**

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

## What to Build Next (Day 7+ — Phase 1B continues)

Per `docs/ROADMAP.md`:

1. **Day 7 (next session):** Build the Test/Real architectural primitive. Scope locked:
   - One migration: any org with no `practitioner_clients` mapping → flip `is_sandbox = true` + assign to the lone practitioner. (TestCo cleaned automatically; Ambar untouched.)
   - Sandbox banner component on workspace header + `/assess/[token]` page.
   - Email gating in `send-assessment-email.ts`: if Test, route to practitioner only with `[TEST]` subject prefix.
   - Sandbox-only delete-org endpoint (no UI on Real orgs).
2. **Day 5/6 (pending creds):** Upstash rate limiting + Sentry + Langfuse — ask founder if these env vars are set:
   - `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` (free tier at upstash.com)
   - `SENTRY_DSN` (free tier at sentry.io)
   - `LANGFUSE_PUBLIC_KEY` + `LANGFUSE_SECRET_KEY` (cloud.langfuse.com)
3. **Phase 1C starts Day 8** — Module 5 deep is the proof-of-pattern for methodology depth + role/area question-level segmentation + N/A. **Day 8 also requires a data migration decision** for Ambar/TestCo existing assessment responses before the Module 5 question-bank rewrite begins. AI lens NOT in Phase 1C (deferred to Phase 2.5).
4. **Phase 1.5 lands Days 18-20** — production deploy + legal foundation + cost telemetry. Custom domain decision pending founder before Day 18.
5. **Phase 1D Days 21-28** — Status Report Generator, Engagement Cadence, MCP. **Each engine designed with explicit extension points for Phase 2.5** to avoid double-build.
6. **Phase 2 Days 29-38** — design partner pilots, asset library (L4), pricing & packaging design (Days 35-38), onboarding emails + help docs.
7. **Phase 2.5 Days 39-50** — AI Accelerator Engine (12 days). See `docs/STRATEGY-2026.md` AI-as-buy-trigger thesis + `docs/ROADMAP.md` Phase 2.5 section.
8. **Phase 3 Days 51-75** — account/billing settings UI FIRST, then Stripe, then Day 90 metrics dashboard, then Value Tracker.

**Day 7 audit findings (locked 2026-04-29):**
- Practitioners: 1 (Wadi Bardawil, `wadi.bardawil@arkiva.mx`, plan: `starter`)
- Real orgs: **Ambar Capital** — `is_sandbox=false`, properly mapped to founder as `owner`, `active_modules = [5, 15, 4]` (Cybersecurity + Process Automation + Cloud — founder's call as fractional CIO; intentional variant from the canonical Quick Win Stack `[5, 15, 12]`)
- Test orgs (post-migration): **TestCo Industries** — pre-Phase-1A legacy, will be auto-flipped to Test via Day 7 migration rule
- Founder's role at Ambar: **fractional CIO**

Open the next session by reading `docs/STRATEGY-2026.md` first, then `docs/ROADMAP.md`, then ask the founder these:
- Are the Upstash + Sentry + Langfuse env vars set? (If yes, those close in <1hr each.)
- Run preview-based QA on every UI commit (the discipline committed Day 3) — banner work is UI, screenshots required before claiming done.

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
