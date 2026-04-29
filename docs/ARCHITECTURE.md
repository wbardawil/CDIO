# AI-CDIO: Architecture

> **Last refreshed:** 2026-04-28 (Day 4 ending). Aligned with `docs/STRATEGY-2026.md` practitioner-first principle.

## The Four-Layer Model

```
┌───────────────────────────────────────────────────────────┐
│  LAYER 1 — PRACTITIONER WORKSPACE                          │
│  - Practitioner account (Clerk)                            │
│  - Portfolio: list of all clients (fractional has N,       │
│                 internal director has 1)                    │
│  - Time tracking, billable hours, capacity (toggle on/off) │
│  - Knowledge reuse layer (cross-client patterns)           │
└────────────┬──────────────────────────────────────────────┘
             │
             ▼
┌───────────────────────────────────────────────────────────┐
│  LAYER 2 — CLIENT WORKSPACE (one per organization)         │
│  - Org profile: size, industry, employee count, hours/mo   │
│  - Stakeholders + roles + assessment tokens                │
│  - Engagement state: Phase 1/2/3, current deliverables     │
│  - Decisions log, meeting cadence, risk register           │
└────────────┬──────────────────────────────────────────────┘
             │
             ▼
┌───────────────────────────────────────────────────────────┐
│  LAYER 3 — PLAYBOOK ENGINES (the toolbox)                  │
│  ┌─Assessment─┐ ┌─Roadmap────┐ ┌─Engagement Mgr─┐          │
│  │ 16 modules │ │ 30/60/90,  │ │ Status reports,│          │
│  │ 5-level    │ │ 6mo, 12mo  │ │ QBR decks,     │          │
│  │ multi-stk  │ │ governance │ │ board memos    │          │
│  └────────────┘ └────────────┘ └────────────────┘          │
│  ┌─Value Track┐ ┌─Adaptation─┐ ┌─Lifecycle──────┐          │
│  │ Commit→    │ │ Size/indus │ │ Phase 1→2→3    │          │
│  │ Deliver    │ │ /hours     │ │ Renewal logic  │          │
│  └────────────┘ └────────────┘ └────────────────┘          │
│  ┌─Templates──┐ ┌─Vendor Mgmt┐ ┌─Decision Hist─┐           │
│  │ Charter,   │ │ Renew cal, │ │ Why we chose, │           │
│  │ M&A DD     │ │ negotiation│ │ outcome track │           │
│  └────────────┘ └────────────┘ └───────────────┘           │
└────────────┬──────────────────────────────────────────────┘
             │
             ▼
┌───────────────────────────────────────────────────────────┐
│  LAYER 4 — PLAYBOOK BRAIN (shared by all engines)          │
│  - 1,154 RAG chunks from 30 playbook files                 │
│  - Decision rules: Value/Effort, Quick Win, Module Stacks  │
│  - Industry overrides, size adaptation, hours scaling      │
│  - Cross-client patterns (anonymous, opt-in)               │
└───────────────────────────────────────────────────────────┘
```

## Data Model (High-Level)

```
practitioners (id, clerk_user_id, name, email, plan, created_at)
   ├── practitioner_clients (practitioner_id, org_id, role)
   │
   └── organizations (id, name, size, industry, employee_count, monthly_hours)
          ├── stakeholders
          ├── assessments → module_scores → assessment_synthesis → divergence_points
          ├── roadmaps → initiatives
          ├── deliverables (status_reports, qbr_decks, board_memos, charters)
          ├── action_cards
          ├── decisions
          ├── conversations
          ├── value_tracking (committed_kpis, delivered_kpis, roi_proof)
          └── engagement_state (phase, hours_used, current_deliverables)

playbook_chunks (RAG, shared globally)
agent_logs (per practitioner + per client, cost tracking)
```

## Tech Stack

| Layer | Technology | Status |
|-------|-----------|--------|
| Frontend | Next.js 16 (Turbopack) + TypeScript + Tailwind 4 | ✅ |
| Auth | Clerk 7 (multi-tenant: practitioners with N clients) | ✅ Wired |
| AI | Claude Sonnet 4.5+ (single model for everything until cost demands otherwise) | ✅ Wired |
| Database | Supabase Postgres + pgvector + RLS (RLS policies pre-wired, full per-user JWT activation Day 30+) | ✅ Wired |
| Email | Resend (`onboarding@resend.dev` for testing; verified domain Phase 2) | ✅ Wired Day 4 |
| Charts | Recharts | ✅ |
| Hosting | Vercel | ❌ Phase 2 |
| Background Jobs | Inngest or QStash | ❌ Phase 2 |
| Observability | Sentry + Langfuse | ❌ Day 6 |
| Rate Limiting | Upstash Redis | ❌ Day 5 |
| MCP Server | Custom MCP wrapper exposing engines as tools | ❌ Day 25 |

## Multi-Tenancy Model

Three levels of tenancy:

1. **Practitioner level** — Each practitioner is isolated. Cannot see other practitioners' clients.
2. **Client level** — Each client org is isolated within a practitioner's portfolio. Stakeholders see only their own org.
3. **Domain level** — Future: `domain` field (`cdio` | `strategist` | `ome`) separates AI-CDIO from sister products.

Enforcement:
- Clerk `practitioner_id` set in JWT claims
- Every API route validates `practitioner_id` matches the requested resource's owner
- Supabase RLS policies tied to `auth.uid()` and `practitioner_id`
- Service role used ONLY in background jobs, never in API routes

## Engine Pattern

Every Playbook Engine follows the same shape:

```typescript
interface PlaybookEngine<TInput, TOutput> {
  // What client data does this engine need?
  loadContext(orgId: string): Promise<EngineContext>;

  // What playbook chunks/templates does this engine use?
  loadPlaybookContext(): Promise<PlaybookChunks>;

  // Generate the deliverable
  generate(input: TInput, context: EngineContext): Promise<TOutput>;

  // Save to deliverables table
  persist(output: TOutput, orgId: string): Promise<DeliverableId>;
}
```

This makes adding new engines (Status Report, QBR Deck, Board Memo) consistent and fast.

## Key Files (Current State, end of Day 4)

| File | Purpose | Status |
|------|---------|--------|
| `src/middleware.ts` → `src/proxy.ts` | Clerk + Next 16 proxy | ✅ Day 1 |
| `src/lib/auth/require-auth.ts` | Defense-in-depth handler-level 401 | ✅ Day 1 |
| `src/lib/auth/ensure-practitioner.ts` | Lazy-create practitioners row on first sign-in | ✅ Day 2 |
| `src/lib/auth/assert-owns-org.ts` | Per-org ownership check | ✅ Day 2 |
| `src/lib/playbook/role-mapping.ts` | Role → modules + influence (extracted from orchestrator Day 4) | ✅ Day 4 |
| `src/lib/email/send-assessment-email.ts` | Resend wrapper with templated HTML | ✅ Day 4 |
| `src/lib/agents/conversation.ts` | Conversation Agent | ✅ Built |
| `src/lib/agents/assessment.ts` | Assessment Agent | ✅ Built |
| `src/lib/agents/strategy.ts` | Strategy Agent (roadmap) | ⚠ ~25% of playbook vision |
| `src/lib/agents/orchestrator.ts` | State machine for engagement | ✅ Built |
| `src/lib/scoring/maturity.ts` | Scoring engine (5-level) | ✅ Built |
| `src/lib/playbook/retrieve.ts` | RAG retrieval (1,152 chunks, CMU-stripped) | ✅ Built |
| `src/lib/playbook/quick-scan-questions.ts` | 48 quick scan questions | ✅ Built |
| `src/lib/playbook/diagnostic-questions.ts` | ~70 diagnostic questions | ⚠ Phase 1C: rewrite for depth + Level 5 indicators |
| `src/lib/db/schema.sql` | Core schema | ✅ |
| `src/lib/db/schema-v2.sql` | Conversations + action_cards | ✅ |
| `src/lib/db/schema-v3-maturity5.sql` | 5-level migration | ✅ Applied |
| `src/lib/db/schema-v4-practitioners.sql` | Multi-tenant + practitioner_clients | ✅ Applied Day 2 |
| `src/lib/db/schema-v5-sandbox.sql` | is_sandbox flag | ✅ Applied Day 3 |
| `src/components/edit-stakeholder-modal.tsx` | Stakeholder editor | ✅ Day 4 |
| `src/components/stakeholder-row-actions.tsx` | Per-row actions cluster | ✅ Day 4 |
| `src/components/reset-assessment-button.tsx` | Sandbox-only data wipe | ✅ Day 3 |
| `src/components/copy-link-button.tsx` | Clipboard-with-fallback | ✅ |
| `src/app/clients/page.tsx` | Portfolio (server-rendered) | ✅ Day 3 |
| `src/app/clients/[orgId]/page.tsx` | Client Workspace shell + Overview | ✅ Day 3 |
| Status Report Generator | Engine #2 — pulls assessment + roadmap + decisions | ❌ Day 18-21 |
| Engagement Cadence (shareable read-only) | Practitioner-as-trusted-partner differentiator | ❌ Day 22-24 |
| MCP Server foundation | Distribution channel | ❌ Day 25 |
| Methodology depth (Modules 5/12/15 deep) | Quick Win Stack | ❌ Phase 1C Days 8-17 |

## MCP / Integration Roadmap (Future)

| Phase | Integrations |
|-------|-------------|
| Phase 1 (Now) | Self-contained, no external integrations |
| Phase 2 (Month 2-3) | Google Workspace / M365 admin (auto-detect tools, MFA status, license waste) |
| Phase 3 (Month 4-6) | Cloud billing APIs, security scanners, SaaS management |
| Phase 4 (Month 7+) | Slack/Teams, Jira/Linear, accounting (QuickBooks/Xero) |

**Principle:** Integrations enrich the engines (auto-populate scores, fetch data). They never make us a tool vendor.
