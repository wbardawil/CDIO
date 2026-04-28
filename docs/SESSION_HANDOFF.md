# AI-CDIO: Session Handoff

This is the entry point for a fresh Claude Code session. It tells you **where we are**, **what's next**, and the **context required to continue**.

---

## TL;DR (read this first)

AI-CDIO is the **methodology operating system for fractional CDIOs**. Built first as a tool the founder (Wadi Bardawil) uses on his own fractional practice. **Customer #0 = the founder.**

**Current state (2026-04-27, end of Day 3):**
- ✅ **Phase 1A — Foundation** complete (auth, practitioner schema, IDOR fix, Portfolio + Workspace shell)
- ▶ **Phase 1B — Practitioner Operations + Safety** (Days 4-7) starts now
- The founder has dogfooded the platform on a real client (Ambar Capital), surfaced multiple UX/depth bugs, and approved a strategic refresh recorded in `docs/STRATEGY-2026.md`

**Key strategic shift since the last handoff:** practitioner-first principle is now explicit. Methodology depth (Phase 1C) outranks horizontal expansion. MCP server is an architectural choice, not a Year-1 headline.

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

## What's Built (end of Day 3)

| Surface | State |
|---|---|
| `/` Marketing landing | ✅ With auth-aware nav (Sign in / Open Portfolio) |
| `/scan` Quick Scan | ✅ Public; live spider chart + action cards |
| `/onboarding` Practitioner onboards a client | ✅ Auth-required; CIO/CDIO/CDO/CISO + 14 other roles in dropdown; explicit error display |
| `/assess/[token]` Stakeholder assessment | ✅ Token-based public; intersection of role-relevant ∩ org-active modules; Return-to-workspace CTAs on completion |
| `/clients` Portfolio | ✅ Server-rendered table from practitioner_clients ↔ organizations |
| `/clients/[orgId]` Client Workspace | ✅ Shell + Overview tab with Next-step banner + stakeholder list with Open/Copy assessment buttons. 5 other tabs are "Coming Week N" stubs. |
| `/dashboard?org=...` Legacy dashboard | ✅ Existing engines (synthesis, divergence, roadmap) still reachable |
| `/sign-in` / `/sign-up` | ✅ Clerk-hosted catch-all |
| `/chat` Anonymous funnel | ✅ Public, RAG-grounded |

**Backend:** Supabase Postgres + pgvector, 15 tables, schema v1-v4 applied. Clerk for auth. Service-role client used today; RLS policies pre-wired for Day 30 activation. 1,152 RAG chunks of CMU-stripped playbook content.

---

## What's NOT Built (Phase 1B-1D scope)

| Phase | Capability | Notes |
|---|---|---|
| 1B | Stakeholder edit UI + email send via Resend | Replaces SQL-edit-by-hand workaround |
| 1B | Upstash rate limit on /api/chat + /api/assessments | Cost protection |
| 1B | Strip assessment_token from dashboard response | P0-3 |
| 1B | Synthesis transaction wrapping | P0-6 |
| 1B | Sentry + Langfuse | Observability |
| 1C | Module 5 deep (questions, framework citations, narrative scoring, level-5 indicators) | Quick Win Stack starts here |
| 1C | Decision Package surfacing as standalone artifact | Hero output |
| 1C | Module 12 + 15 deep | Quick Win Stack complete |
| 1C | Quick Scan output upgrade (board-memo quality) | Sales-conversion engine |
| 1C | Framework citations layer | Cited authority everywhere |
| 1D | Status Report Generator | Engine #2 |
| 1D | Engagement Cadence (shareable read-only) | Practitioner-as-trusted-partner differentiator |
| 1D | MCP Server foundation | Day 25 |

---

## What to Build Next (Day 4 — Phase 1B starts)

Per `docs/ROADMAP.md`:

1. **Stakeholder edit UI** — edit role/relevant_modules/influence_level for any stakeholder, from `/clients/[orgId]`
2. **Email send via Resend** — assessment links + reminders. Requires `RESEND_API_KEY` in `.env.local` (founder fetches from resend.com)
3. **Day 5:** rate limiting + assessment_token strip
4. **Day 6:** synthesis transaction + Sentry/Langfuse
5. **Day 7:** confirm Ambar real-vs-sandbox + any backfill needed

Open the next session by reading `docs/STRATEGY-2026.md` first, then `docs/ROADMAP.md`, then ask the founder these:
- Is `RESEND_API_KEY` ready?
- Is Ambar real or sandbox? (affects how aggressively we polish for it)
- Any new dogfood surprises since Day 3?

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

Pending (Phase 1B):
- `RESEND_API_KEY`

Future (Phase 1B+):
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
- `SENTRY_DSN`, `LANGFUSE_PUBLIC_KEY`, `LANGFUSE_SECRET_KEY`
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` (Phase 3)

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
