@AGENTS.md

# AI-CDIO Project

AI-powered virtual Chief Digital & Innovation Officer for mid-market companies.
Next.js 16 + Supabase + Clerk auth + Anthropic Claude API.

## Toolkits Available

Use GSD and gstack skills proactively throughout development:

- **GSD (Get Shit Done)**: Project planning, phased execution, code review, debugging, autonomous workflows. Key commands: `/gsd-progress`, `/gsd-plan-phase`, `/gsd-execute-phase`, `/gsd-code-review`, `/gsd-debug`, `/gsd-help`
- **gstack**: QA testing, headless browser, design review, deployment. Key commands: `/gstack` (browser QA), `/review` (code review), `/qa` (full QA pass), `/health` (project health)

Run `/gsd-help` or `/gstack` to see all available commands.

## Architecture

- `src/app/` — Next.js 16 App Router pages and API routes
- `src/lib/agents/` — AI agents (conversation, assessment, strategy, orchestrator)
- `src/lib/scoring/` — Maturity scoring engine (consensus, divergence, prioritization)
- `src/lib/playbook/` — RAG layer (1,154 playbook chunks via pgvector)
- `src/lib/auth/` — Clerk auth helpers (verifyOrgAccess, requireAuth)
- `src/lib/rate-limit/` — In-memory rate limiter with IP detection
- `src/components/` — Charts (spider, priority matrix, divergence) and forms
- `src/types/` — TypeScript types and 16-module framework definitions

## Key Conventions

- All API routes use Zod validation; never leak validation details to client
- All protected routes verify org ownership via `verifyOrgAccess()`
- All AI endpoints have rate limiting via `rateLimit()` + `getClientIp()`
- Anthropic client uses 30s timeout
- Clerk auth: middleware protects all routes except `/`, `/sign-in`, `/sign-up`, `/assess/*`, `/api/stakeholders/*`, `/api/assessments`
- Service role Supabase client for server-side; anon key for client-side
- Rule-based fallback scoring works without Anthropic API key
