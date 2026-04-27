# AI-CDIO: New Session Handoff

This is the starter prompt + context for a fresh Claude Code session. Paste the **Quick Start Prompt** at the bottom of this file into a new session and Claude will pick up where this one left off.

---

## What This Project Is (TL;DR)

AI-CDIO is the **Fractional Executive Operating System** — built first as a tool the founder uses on his own fractional CDIO practice, validated in parallel with other practitioners and IT directors. The 30-file CDIO playbook becomes interactive engines that produce real deliverables: assessments, roadmaps, status reports, QBR decks, board memos.

**Customer #0 = the founder.** Every feature is validated against his real fractional engagements before being shown to anyone else.

**Strategy:** Tool → Validated Product → Business (parallel-tracked from Day 1).

---

## Where We Are Right Now

### Built
- Quick Scan UI (`/scan`) with live spider chart + action cards
- Full Assessment Pipeline (`/onboarding` + `/assess/[token]`) with multi-stakeholder
- Chat-first conversational entry (`/chat`)
- Dashboard with priority matrix + divergence detection + AI Decision Packages
- Assessment Engine (16 modules, 5-level maturity, AI scoring)
- Roadmap Engine (25% of playbook vision)
- RAG layer (1,154 playbook chunks indexed)
- Supabase backend (10 tables, schema-v3 maturity-5 applied)
- Clerk auth + Next 16 proxy on practitioner-only API routes (Week 1 Day 1 — P0-1 closed)

### Critical Gaps (Block Real Use)
- No multi-client practitioner workspace (`practitioners` + `practitioner_clients` tables — Day 2)
- API routes accept arbitrary `org_id` (IDOR — Day 2-3, after practitioner schema lands)
- `assessment_token` returned in dashboard response (Day 4)
- No rate limiting (Day 5)
- Synthesis `delete-then-insert` not in a transaction (Day 6)
- Service-role Supabase client bypasses RLS in every API route (Day 8, after practitioner schema + RLS)
- 7 P0 ship-blockers remaining (down from 8) — see `docs/GAPS.md`

### Not Yet Built
- Status Report Generator (the FIRST engine to build next)
- QBR Deck Generator
- Templates Library
- Stripe billing
- Vercel deployment

---

## Project Files Map

| Where | What |
|-------|------|
| `C:/Users/Dell/projects/CDIO/CSIO - Playbook/` | The 30-file source playbook (READ-ONLY methodology) |
| `C:/Users/Dell/projects/CDIO/app/` | The Next.js application |
| `C:/Users/Dell/projects/CDIO/app/docs/` | All product/strategy/architecture docs |
| `C:/Users/Dell/projects/CDIO/app/src/lib/agents/` | AI agents (assessment, strategy, conversation, orchestrator) |
| `C:/Users/Dell/projects/CDIO/app/src/lib/playbook/` | RAG, retrieval, quick-scan questions |
| `C:/Users/Dell/projects/CDIO/app/src/lib/scoring/` | Maturity engine, rule-based fallback |
| `C:/Users/Dell/projects/CDIO/app/src/lib/db/` | Schema files |
| `C:/Users/Dell/projects/CDIO/app/src/app/` | Next.js pages + API routes |

## Required Reading (Before You Touch Code)

In this exact order:
1. **`docs/PRODUCT.md`** — what the product is and isn't
2. **`docs/ROADMAP.md`** — what to build next, in what order
3. **`docs/GAPS.md`** — P0 ship-blockers, P1 high, P2 medium
4. **`docs/ARCHITECTURE.md`** — four-layer model, data model, tech stack
5. **`docs/PRICING.md`** — economics + segment model
6. **`docs/GTM.md`** — three-phase strategy
7. **`docs/RISKS.md`** — Johari analysis, MECE risk categories, kill switch

After reading these, you have full context.

---

## The Plan File (Authoritative Vision)

`C:/Users/Dell/.claude/plans/curious-wibbling-raccoon.md`

This is the canonical strategic document. It contains the full MECE analysis, market research, competitive positioning, Johari window, and pricing rationale. The `docs/` files are operational summaries; the plan file is the deep reasoning.

---

## Environment

### Local
- **OS:** Windows 11
- **Node:** Latest LTS
- **Package manager:** npm
- **Dev server port:** 3010 (configured in `.claude/launch.json`)
- **Git remote:** `github.com/wbardawil/CDIO`
- **Branch strategy:** main only (small project, no PR workflow needed yet)

### Secrets (in `.env.local`, never commit)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ANTHROPIC_API_KEY` (already set)
- `RESEND_API_KEY` (not set yet — needed for Phase 1 Week 2)
- (Future) `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY`
- (Future) `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
- (Future) `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`

### Cloud Setup (Pending)
The user wants to build from a phone. See **Cloud Setup** section below.

---

## What to Build Next (Week 1)

Per `docs/ROADMAP.md`, the immediate priority is **Phase 1 Week 1 — Foundation**:

| Day | Task |
|-----|------|
| 1 | Add Clerk auth + middleware on every API route |
| 2 | Add `practitioners` + `practitioner_clients` tables to schema |
| 3 | Practitioner workspace UI: list of all clients |
| 4 | Strip `assessment_token` from dashboard response, derive IDs server-side |
| 5 | Upstash Redis rate limiting on `/api/chat` and `/api/assessments` |
| 6 | Wrap synthesis delete-then-insert in transaction |
| 7 | Migrate founder's 1-3 real clients into platform |

**Goal:** Founder logs in, sees portfolio, drills into a client, runs existing engines safely.

After Week 1, **Week 2 = Status Report Generator** (the first new engine — see `docs/ROADMAP.md`).

---

## Cloud Setup (Mobile-Friendly Dev)

To build from your phone, set up GitHub Codespaces with Claude Code pre-installed.

### One-Time Setup (do once on local machine)

1. **Install gstack locally:**
   ```bash
   git clone --single-branch --depth 1 https://github.com/wbardawil/gstack.git ~/.claude/skills/gstack
   cd ~/.claude/skills/gstack && ./setup
   ```

2. **Install gsd-2 locally** (if it's installable as a skill — check the gsd-2 README for installation method):
   ```bash
   # Check the gsd-2 repo's install instructions
   # If npm-based:
   npm install -g gsd-pi
   ```

3. **Add `.devcontainer/devcontainer.json`** to the project so Codespaces auto-installs everything:
   - Node.js LTS
   - Claude Code CLI
   - gstack + gsd
   - All `npm install` dependencies pre-cached

4. **Enable GitHub Codespaces on `wbardawil/CDIO`:**
   - Go to repo → Code → Codespaces tab → Create codespace
   - First time takes 5-10 minutes (devcontainer build)
   - Subsequent launches: 30 seconds

### Mobile Workflow

| What | How |
|------|-----|
| **Edit code** | GitHub Codespaces in mobile browser (works on iOS/Android) |
| **Run Claude Code** | Install Claude Code in Codespace; access via terminal in browser |
| **Preview app** | Codespace forwards port 3010 → public URL accessible from phone |
| **Commit/push** | GitHub mobile app or Codespace terminal |
| **Voice input** | Use phone's voice-to-text into Claude Code prompts |

### Cost
- Codespaces: 60 hours/month free, $0.18/hr after
- Anthropic API: usage-based (already paid via your key)

---

## Tooling Recommendations for Next Session

Once gstack is installed, these skills become available:

| When | Skill |
|------|-------|
| Before any feature | `/plan-ceo-review` (rethink scope) → `/plan-eng-review` (architecture) |
| After implementation | `/review` (find production bugs) → `/qa <url>` (test in real browser) |
| Before commit | `/cso` (security audit) on touched code |
| Before deploy | `/ship` (sync, test, push, PR) → `/land-and-deploy` |
| Weekly | `/retro` (per-client patterns, time wins, blockers) |

These are not yet installed — install them as part of the cloud setup above.

---

## Quick Start Prompt (Paste Into New Session)

```
I'm continuing work on AI-CDIO, a Fractional Executive Operating System.

Project root: C:\Users\Dell\projects\CDIO\app
GitHub: github.com/wbardawil/CDIO

Read these in order before doing anything else:
1. docs/SESSION_HANDOFF.md (this is the entry point)
2. docs/PRODUCT.md
3. docs/ROADMAP.md
4. docs/GAPS.md
5. docs/ARCHITECTURE.md

The strategic plan lives at:
C:\Users\Dell\.claude\plans\curious-wibbling-raccoon.md

Current state: Phase 1 Week 1 not started. The 8 P0 ship-blockers must be fixed before real client data can be used.

Today's task: Start Phase 1 Week 1 Day 1 — Add Clerk auth + middleware on every API route.

After reading the docs, propose the first concrete change (file paths + diffs) before writing any code.
```

---

## Founder's Working Style (For New Session Context)

- Direct and challenge-friendly. Push back when assumptions look wrong.
- Wants to see things working in browser, not just in commits.
- Prefers automated workflows over manual SQL pasting (use Supabase CLI, migrations, etc.).
- Is the customer #0 — every feature decision should consider: "would this make my fractional practice better?"
- Eats own dog food. Real client data goes in once auth lands.
- Vision is large (1M SMBs eventually) but execution is one engine at a time.

---

## Success Criteria for Next Session

By end of next session, founder should be able to:
1. Log into the platform with a Clerk account
2. See a portfolio view of his 3+ real clients
3. Drill into one client and use the existing engines (assessment, roadmap, dashboard)
4. Trust that another practitioner couldn't read his client data via crafted URLs

If those four are true, Week 1 is done.
