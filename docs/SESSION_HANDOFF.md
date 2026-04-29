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

**Two new strategic decisions locked 2026-04-29 (afternoon):**

1. **Production deploy promoted to NEW Phase 1.5 (Days 18-19)** — `L3` level: Vercel + custom domain + verified email domain. Reasoning: methodology depth (just shipped Phase 1C) must land INTO production, not into a localhost shell. Real Ambar exec emails need a verified-domain sender for the Phase 1C dogfood loop. Custom domain decision pending founder.

2. **AI Accelerator Engine added as NEW Phase 2.5 (Days 38-47)** — the "AI-as-buy-trigger" thesis. Practitioners who can credibly deliver "AI implementation as a service" to CEO clients buy AI-CDIO. Engine includes: AI Maturity Model, AI Use-Case Library (industry × function catalog), AI Roadmap Generator (90/180/360-day), Build-vs-Buy Advisor, Governance Scaffolding (EU AI Act, NIST AI RMF), public `/ai-readiness` Quick Scan as top-of-funnel lead magnet for practitioners. Practitioner-first preserved — CEOs never get a paid AI-CDIO account. Phases 3+4 shifted +12 days; Day 90 review still hits at Day 90 (now Day 72 + 18). See `docs/ROADMAP.md` Phase 2.5 + `docs/STRATEGY-2026.md` AI-as-buy-trigger thesis.

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
| 1C | Module 5 deep (questions, framework citations, narrative scoring, level-5 indicators) | Quick Win Stack starts here |
| 1C | **Role/area question-level segmentation + N/A escape (per-module + per-question) + thin-coverage warning** | Built Day 8-13 alongside Module 5/12/15 depth rewrite — same effort, two outcomes |
| 1C | Decision Package surfacing as standalone artifact | Hero output |
| 1C | Module 12 + 15 deep | Quick Win Stack complete |
| 1C | Quick Scan output upgrade (board-memo quality) **+ AI lens** | Sales-conversion engine + AI Accelerator top-of-funnel |
| 1C | Framework citations layer | Cited authority everywhere |
| **1.5 (NEW)** | **Production deploy L3** — Vercel + custom domain + verified email | App goes online Day 18-19; methodology depth ships INTO production |
| 1D | Status Report Generator | Engine #2 (Days 20-23) |
| 1D | Engagement Cadence (shareable read-only) | Practitioner-as-trusted-partner differentiator (Days 24-26) |
| 1D | MCP Server foundation | Day 27 |
| **2.5 (NEW)** | **AI Accelerator Engine** — AI Maturity Model, AI Use-Case Library, AI Roadmap Generator, Build-vs-Buy Advisor, Governance Scaffolding, public `/ai-readiness` Quick Scan, AI deliverable surfacing across workspace | The buy-trigger flagship engine (Days 38-47) |

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
3. **Phase 1C starts Day 8** — Module 5 deep is the proof-of-pattern for methodology depth, **and now also the proof-of-pattern for role/area question-level segmentation + N/A**. See `docs/ROADMAP.md` Phase 1C section for the full role → tag mapping table and N/A behavior. **Days 14-15 also add the AI lens to the Quick Scan** as top-of-funnel for the future AI Accelerator.
4. **Phase 1.5 lands Day 18-19** — production deploy with custom domain + verified email. Custom domain decision (e.g., `ai-cdio.com`) pending founder before Day 18.
5. **Phase 1D Days 20-27** — Status Report Generator, Engagement Cadence, MCP. Now ships INTO a live production environment.
6. **Phase 2.5 Days 38-47** — AI Accelerator Engine (the buy-trigger). See `docs/STRATEGY-2026.md` AI-as-buy-trigger thesis + `docs/ROADMAP.md` Phase 2.5 section.

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
