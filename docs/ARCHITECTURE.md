# AI-CDIO: Architecture

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

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 + TypeScript + Tailwind |
| Auth | Clerk (multi-tenant: practitioners with N clients) |
| AI | Claude Sonnet (reasoning) + Haiku (execution + chat) |
| Database | Supabase Postgres + Row Level Security |
| Vector Store | pgvector (in Supabase) |
| Email | Resend |
| Charts | Recharts |
| Hosting | Vercel |
| Background Jobs | Inngest or QStash (for synthesis + roadmap generation) |
| Observability | Sentry + Langfuse |
| Rate Limiting | Upstash Redis |

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

## Key Files (Current State)

| File | Purpose | Status |
|------|---------|--------|
| `src/lib/agents/conversation.ts` | Conversation Agent | Built, needs auth |
| `src/lib/agents/assessment.ts` | Assessment Agent | Built |
| `src/lib/agents/strategy.ts` | Strategy Agent (roadmap) | Built (25% of playbook vision) |
| `src/lib/agents/orchestrator.ts` | State machine | Built, needs practitioner layer |
| `src/lib/scoring/maturity.ts` | Scoring engine | Built (5-level) |
| `src/lib/playbook/retrieve.ts` | RAG retrieval | Built (1,154 chunks) |
| `src/lib/playbook/quick-scan-questions.ts` | 48 quick scan questions | Built |
| `src/lib/db/schema.sql` | Core schema | Built, needs practitioner tables |
| `src/lib/db/schema-v3-maturity5.sql` | 5-level migration | Applied |
| Status Report Generator | NEW — Week 2 priority | NOT BUILT |
| QBR Deck Generator | NEW — Week 3 priority | NOT BUILT |
| Practitioner Workspace UI | NEW — Week 1 priority | NOT BUILT |

## MCP / Integration Roadmap (Future)

| Phase | Integrations |
|-------|-------------|
| Phase 1 (Now) | Self-contained, no external integrations |
| Phase 2 (Month 2-3) | Google Workspace / M365 admin (auto-detect tools, MFA status, license waste) |
| Phase 3 (Month 4-6) | Cloud billing APIs, security scanners, SaaS management |
| Phase 4 (Month 7+) | Slack/Teams, Jira/Linear, accounting (QuickBooks/Xero) |

**Principle:** Integrations enrich the engines (auto-populate scores, fetch data). They never make us a tool vendor.
