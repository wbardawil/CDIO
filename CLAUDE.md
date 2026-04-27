@AGENTS.md

# CLAUDE.md — AI-CDIO Project Context

## Read First

Before doing ANY work in this repo, read these in order:

1. `docs/SESSION_HANDOFF.md` — Where we are, what's next
2. `docs/PRODUCT.md` — What the product is (and isn't)
3. `docs/ROADMAP.md` — Build order and current sprint
4. `docs/GAPS.md` — P0 ship-blockers, P1 high, P2 medium

The strategic plan (deeper context) lives at: `C:/Users/Dell/.claude/plans/curious-wibbling-raccoon.md`

## What This Project Is

AI-CDIO — the **Fractional Executive Operating System**. Built first as a tool the founder uses on his own fractional CDIO practice, validated in parallel with other practitioners and IT directors. The 30-file CDIO playbook (in sibling directory `../CSIO - Playbook/`) becomes interactive engines that produce real deliverables.

**Customer #0 = the founder.** Every feature is validated against his real fractional engagements before being shown to anyone else.

## Project Structure

```
C:/Users/Dell/projects/CDIO/
├── CSIO - Playbook/         # 30-file source playbook (READ-ONLY methodology)
└── app/                      # The Next.js app
    ├── docs/                 # Product/strategy/architecture docs (single source of truth)
    ├── src/
    │   ├── app/              # Next.js pages + API routes
    │   ├── components/       # React components
    │   ├── lib/
    │   │   ├── agents/       # AI agents (assessment, strategy, conversation, orchestrator)
    │   │   ├── playbook/     # RAG, retrieval, quick-scan questions
    │   │   ├── scoring/      # Maturity engine, rule-based fallback
    │   │   └── db/           # Schema files, Supabase client
    │   └── types/            # TypeScript type definitions
    ├── scripts/              # Utility scripts (e.g., playbook ingestion)
    ├── .claude/              # Claude Code config (launch.json)
    └── package.json
```

## Working Rules

### Always
- Read the relevant `docs/*.md` files before suggesting changes
- Cite specific file paths when discussing code
- Verify changes by running the dev server (port 3010) before claiming done
- Run `npx next build` to verify TypeScript and build before committing
- Commit with descriptive messages (multi-line, "why" not just "what")
- Push to `main` after committing (no PR workflow yet — solo project)

### Never
- Ask the user to manually paste SQL into Supabase — use the Supabase CLI or pg client programmatically
- Add documentation files (.md) unless explicitly requested
- Skip pre-commit hooks or signing
- Use `git reset --hard`, `git push --force`, or `git commit --amend` without explicit permission
- Commit secrets or `.env.local` (it's in .gitignore — keep it that way)
- Add tests, lint configs, or CI without being asked

### Strategic Decisions Already Made
- **Path B confirmed:** Fractional Executive OS for practitioners + internal IT directors
- **Customer #0 = founder.** Tool first, product second, business third (sequential phases run in parallel from Day 1)
- **5-level maturity scale** (Initial → Optimizing) — applied to module_scores, pending propagation to all prompts
- **Multi-tenancy via practitioner → clients hierarchy** (P0 priority, not yet built)
- **Auth via Clerk** (in deps, not wired)
- **Background jobs via Inngest or QStash** (for synthesis + roadmap, not yet implemented)
- **Rate limiting via Upstash Redis** (P0, not yet implemented)

## Current Sprint (Week 1 — Foundation)

Per `docs/ROADMAP.md`:

1. Add Clerk auth + middleware on every API route
2. Add `practitioners` + `practitioner_clients` tables to schema
3. Practitioner workspace UI: list of all clients
4. Strip `assessment_token` from dashboard response, derive IDs server-side
5. Upstash Redis rate limiting on `/api/chat` and `/api/assessments`
6. Wrap synthesis delete-then-insert in transaction
7. Migrate founder's 1-3 real clients into platform

**Done = Founder logs in, sees portfolio, drills into Client A, runs existing engines safely.**

## gstack Skills (When Installed)

If `~/.claude/skills/gstack` is present, use these skills proactively:

- **Before any feature:** `/plan-ceo-review` (rethink scope) → `/plan-eng-review` (architecture) → `/autoplan` (combined)
- **After implementation:** `/review` (find production bugs) → `/qa <url>` (test in real browser)
- **Before commit:** `/cso` (security audit on touched code)
- **Before deploy:** `/ship` (sync, test, push, PR) → `/land-and-deploy`
- **Weekly:** `/retro` (per-client patterns, time wins, blockers)
- **Never use:** `mcp__claude-in-chrome__*` — use `/browse` from gstack instead

If gstack is NOT installed, proceed without it. Don't request installation unless asked.

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 15 + TypeScript + Tailwind |
| Auth | Clerk (in deps, not wired) |
| AI | Claude Sonnet (reasoning) + Haiku (chat/execution) |
| Database | Supabase Postgres + pgvector |
| Email | Resend (key not set yet) |
| Hosting | Vercel (not deployed yet) |
| Background Jobs | Inngest or QStash (not chosen yet) |
| Rate Limiting | Upstash Redis (not implemented yet) |
| Observability | Sentry + Langfuse (not implemented yet) |

## Founder's Working Style

- Direct, challenge-friendly. Push back when assumptions look wrong.
- Wants to see things working in browser, not just in commits.
- Prefers automated workflows over manual steps (e.g., never paste SQL into a dashboard).
- Is the customer #0 — every feature decision should consider: "would this make my fractional practice better?"
- Will eat own dog food once auth lands and real client data goes in.

## Important Files Reference

| File | Purpose |
|------|---------|
| `src/lib/db/schema.sql` | Core database schema |
| `src/lib/db/schema-v2.sql` | Conversations + action_cards |
| `src/lib/db/schema-v3-maturity5.sql` | 5-level maturity migration (applied to module_scores) |
| `src/lib/agents/conversation.ts` | Chat-first entry agent |
| `src/lib/agents/assessment.ts` | AI module scoring |
| `src/lib/agents/strategy.ts` | Roadmap generation (25% of playbook vision) |
| `src/lib/agents/orchestrator.ts` | State machine for engagement |
| `src/lib/scoring/maturity.ts` | Scoring + prioritization engine |
| `src/lib/playbook/retrieve.ts` | RAG over 1,154 chunks |
| `src/lib/playbook/quick-scan-questions.ts` | 48 quick scan questions (3 per module) |
| `src/lib/playbook/diagnostic-questions.ts` | 70+ full assessment questions |
| `src/types/index.ts` | TypeScript types + module constants |
| `.claude/launch.json` | Dev server config (port 3010) |
| `.devcontainer/devcontainer.json` | Codespaces config (for cloud dev) |

## Remember

- The user (Wadi Bardawil, `wadi.bardawil@arkiva.mx`) is a fractional CDIO building a tool for himself first
- The product needs to make HIS practice better before serving anyone else
- Speed matters — competitors (ScalePad LMX) are in adjacent space
- The 90-day kill switch is real: if no paid customers + no daily founder use by Day 90, stop building
