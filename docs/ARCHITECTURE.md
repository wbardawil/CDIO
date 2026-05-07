# AI-CDIO: Architecture

> **Last refreshed:** 2026-05-07 (Phase 1C Day 11 doc-lock — multi-corpus RAG model, per-practitioner tenant isolation, selective multi-agent boundaries, and Network Catalog privacy model added per `STRATEGY-2026.md` Architectural Laws 1-5).
>
> **Previous refresh:** 2026-04-28 (Day 4 ending). Aligned with `docs/STRATEGY-2026.md` practitioner-first principle.

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
| Phase 1D (Day 28) | Jira/Asana **read-sync only** — pull ticket status into Initiative Pilot steps; never push out (no bidirectional traps) |
| Phase 2 (Month 2-3) | Google Workspace / M365 admin (auto-detect tools, MFA status, license waste) |
| Phase 3 (Month 4-6) | Cloud billing APIs, security scanners, SaaS management |
| Phase 4 (Month 7+) | Slack/Teams, accounting (QuickBooks/Xero) |

**Principle:** Integrations enrich the engines (auto-populate scores, fetch data). They never make us a tool vendor.

---

## Multi-Corpus RAG Model (locked Day 11)

Strategic context lives in `STRATEGY-2026.md` Architectural Law 2. This section is the technical detail.

### Today (end of Day 11)

A single shared corpus: **playbook chunks**. 1,154 entries from the 30-file CDIO playbook, CMU/Carnegie attribution stripped. Embedding model: OpenAI `text-embedding-3-small` via Supabase pgvector. Retrieval is semantic top-k with no re-ranking layer. Every practitioner queries the same corpus.

### Future (post-Phase-2.5)

Seven distinct corpora, three of which are **per-practitioner** and isolated:

| Corpus | Scope | Source | Retrieval mode | Tenant boundary |
|---|---|---|---|---|
| **1. Playbook** | Global | 30-file CDIO playbook (already shipped) | Semantic embeddings | Shared, read-only |
| **2. Frameworks** | Global | NIST CSF, NIST AI RMF, EU AI Act, KPMG 4-practice, MIT SAM, ITIL, CMMI, TBM Council, APQC PCF, ADKAR, Kotter — chunked + cited | Semantic embeddings | Shared, read-only |
| **3. Vendor data** | Global | Public G2 / Capterra / vendor-website extracts populated by Phase 1D agent + curated entries | Semantic embeddings + structured filters (category, price tier) | Shared, read-only |
| **4. AI Use-Case Library** | Global | Phase 2.5 deliverable: 30-50 named AI use cases tagged by industry × function × maturity | Semantic embeddings + faceted query | Shared, read-only |
| **5. Per-practitioner Historical Engagements** | **Per-practitioner** | Decisions, narratives, Decision Packages, status reports, charters from prior engagements | Semantic embeddings, **tenant-scoped at the query layer** | **STRICT: never cross-practitioner visible** |
| **6. Per-practitioner Network Catalog** | **Per-practitioner** | Vetted partners/vendors the practitioner has engaged: name, role, domain tags, last engagement, rating, source, notes | **Structured query** (not embeddings — too small, too sparse, structured fields more useful) | **STRICT: never cross-practitioner visible. Encrypted at rest beyond Supabase defaults.** |
| **7. Industry overlays** | Global, applied at runtime | Phase 1.5 deliverable: AI-rewrites base questions to feel native to client industry (manufacturing → supply-chain phrasing; healthcare → HIPAA phrasing) | Generated, not retrieved — runtime function transforms base content | Shared (the *function* is shared; the output is per-engagement) |

**Hybrid retrieval pattern:** Corpora 1-4 (global) and Corpus 5 (per-practitioner) use embeddings. Corpus 6 (Network Catalog) uses structured query because it's small, sparse, and structured fields (rating, last_engagement, domain_tags) are more useful than semantic similarity. Corpus 7 is generative, not retrieval.

**Re-ranking layer (Phase 2.5+):** when multiple corpora return hits for a single query, a re-ranker (cross-encoder or LLM-as-reranker) orders by relevance to the practitioner's task. Without re-ranking, the practitioner gets a noisy concatenation. Until volume justifies the cost, we use simple priority: per-practitioner historical engagements > playbook > frameworks > vendor data > AI use-case library.

### Per-practitioner tenant isolation (P0 architectural concern)

The two per-practitioner corpora (5 and 6) are **the practitioner's moat**. Cross-practitioner leakage would destroy the value proposition and create legal exposure. Enforcement is layered:

**Layer 1 — Schema:** every per-practitioner corpus row carries `practitioner_id NOT NULL`. There is no row in either corpus without a `practitioner_id`. No "global" rows.

**Layer 2 — Query:** every retrieval call is wrapped by a function that injects `WHERE practitioner_id = $auth_practitioner_id` into the SQL. The retrieval helper takes `practitioner_id` as a required argument; no overload accepts a "skip filter" path.

**Layer 3 — RLS (post-Day-30 activation):** Supabase Row-Level Security policies on the per-practitioner corpus tables tied to `auth.uid() → practitioners.clerk_user_id`. Until per-user JWTs are wired (post-Day-30), Layer 2 is the enforcement boundary; service-role used in API routes is gated by `assertPractitionerOwnsOrg`.

**Layer 4 — Encryption at rest (Network Catalog only):** beyond Supabase defaults, the Network Catalog table uses application-layer envelope encryption on sensitive columns (notes, rating, last_engagement). Key per practitioner, derived from the practitioner's account. Founder can export everything in plaintext via an account-settings flow; can wipe everything via a destructive confirmation flow. Required by `STRATEGY-2026.md` Law 5.

**Layer 5 — Telemetry:** every retrieval call against per-practitioner corpora logs `practitioner_id_requested` vs `practitioner_id_resolved`. Any mismatch alerts. Sentry rule wired before Network Catalog ships (Phase 1D Day 25).

**Pre-ship gates (locked Day 11):**
- `/codex` independent second opinion on the privacy model BEFORE Day 25 build.
- `/cso` security audit on the encryption + isolation boundary BEFORE Day 25 ship.

---

## Selective Multi-Agent Boundaries (locked Day 11)

Strategic context lives in `STRATEGY-2026.md` Architectural Laws 1 and 4. This section is the implementation detail.

### Single-agent default (today through Phase 2)

A single Sonnet 4.5+ agent handles every operation in Phases 1A-2:
- Quick Scan / full assessment scoring
- Decision Package generation
- Roadmap generation
- Status Report drafting
- Charter Generator (Phase 1D Day 21)
- Initiative Pilot step generation (Phase 1D Days 22-23)
- Cadence narrative
- Conversation agent

The shared context window holds the playbook RAG hits + client data + role-tagged stakeholder responses. One model, one trace, one cost line per operation.

### Multi-agent flows (Phase 2.5+ — gated to Growth and Scale tiers)

Multi-agent is reserved for ~10 operations where the work genuinely benefits from specialization. The pattern is **orchestrator + workers**, not free-form agent swarms:

| Operation | Agent topology | Why multi-agent |
|---|---|---|
| **Tech Selection deep evaluation** (Phase 1D Day 24 lite version → Phase 2.5 full) | Research agent (parallel: scrapes G2 / Capterra / vendor sites) → Evaluator agent (scores against criteria matrix) → Recommender agent (synthesizes the lean with caveats) | Parallelism on research; specialization on evaluation criteria; auditability of the lean recommendation |
| **Partner Selection sourcing** (Phase 2.5) | Network-Catalog-first agent (queries practitioner's own corpus) → External-sourcing agent (Upwork / Clutch / peer network templates) → Synthesizer | Practitioner moat preservation — own network FIRST, external SECOND |
| **AI Use-Case Library generators** (Phase 2.5) | Industry-context agent → Function-context agent → Use-case generator → ROI estimator | Each context dimension is a specialization |
| **AI Roadmap Generator** (Phase 2.5) | 90-day-plan agent (parallel) + 180-day-plan agent + 360-day-plan agent → Synthesizer | Parallelism + horizon-specific specialization |
| **AI Build-vs-Buy** (Phase 2.5) | Build-feasibility agent + Buy-vendor agent + Risk-scoring agent → Decision-tree synthesizer | Independent evaluation paths reduce framing bias |
| **Governance Scaffolding** (Phase 2.5) | NIST AI RMF agent + EU AI Act agent + Bias-review agent → Policy synthesizer | Each regulatory regime has distinct chunking |
| **Knowledge Reuse pattern detector** (Phase 4) | Per-practitioner historical-engagements agent → Pattern matcher → Suggestion agent | Cross-engagement pattern detection benefits from a dedicated retrieval pass |
| **Stakeholder pattern detector** (Phase 4) | Divergence agent + Behavior agent → Synthesizer | Behavioral patterns are specialized |
| **Outcome prediction** (Phase 4) | Historical-cohort agent + Current-engagement agent → Predictor | Comparative reasoning benefits from separate context loads |
| **Document/image AI Vision evidence** (Phase 4) | Vision agent (extract) → Evaluator (score against module rubric) → Narrator | Vision and reasoning are different cost profiles |
| **QBR deck generation** (Phase 4) | Section-per-module agents (parallel) → Layout synthesizer | Parallelism across module narratives |

### Tier gating (drives the price defensibility)

```
┌─ Starter ($199/mo) ──────────────────────────────┐
│  Single-agent only.                              │
│  Quick Scan + Assessment + Decision Package      │
│  + Status Reports + Charter + Initiative Pilot   │
│  + Cadence + Tech Selection (lite, Day 24).      │
└──────────────────────────────────────────────────┘
            │  upgrades unlock multi-agent
            ▼
┌─ Growth ($399/mo) ───────────────────────────────┐
│  + Selective multi-agent.                        │
│  Tech Selection (deep) + AI Accelerator (full)   │
│  + Partner Selection sourcing.                   │
└──────────────────────────────────────────────────┘
            │  upgrades unlock full multi-agent + memory
            ▼
┌─ Scale ($599/mo) ────────────────────────────────┐
│  + Full multi-agent.                             │
│  Knowledge Reuse + Outcome prediction +          │
│  Document AI Vision + cross-engagement patterns. │
└──────────────────────────────────────────────────┘
```

Cost telemetry from Phase 1.5 Day 19 (`agent_logs.token_count × model × org_id`) feeds the gross-margin math. Before Phase 3 Stripe goes live, we know what each tier costs to serve. Tier gates enforced via `lib/billing/feature-gates.ts` (Phase 3 Day 54).

### Memory primitives (Phase 4 commitment)

Per-client conversational memory across sessions ("remember what we decided last quarter for Ambar") is real value but not Phase 1 value. We do NOT build a homegrown memory layer. We adopt Anthropic's native memory primitives when they ship. Phase 4 commitment.

---

## Network Catalog: Privacy Model (locked Day 11)

Strategic context: `STRATEGY-2026.md` Law 5. Phase 1D Day 25 deliverable.

**Schema sketch (subject to `/plan-eng-review`):**

```sql
CREATE TABLE practitioner_network_entries (
  id              uuid PRIMARY KEY,
  practitioner_id uuid NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,
  name            text NOT NULL,
  role            text,
  domain_tags     text[] DEFAULT '{}',
  last_engagement date,
  rating          smallint, -- 1-5, application-layer encrypted
  source          text,     -- 'upwork' | 'clutch' | 'peer' | 'direct' | other
  notes           text,     -- application-layer encrypted
  contact_meta    jsonb,    -- email/phone, application-layer encrypted
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

CREATE INDEX ON practitioner_network_entries (practitioner_id);
ALTER TABLE practitioner_network_entries ENABLE ROW LEVEL SECURITY;
-- Policy: SELECT/INSERT/UPDATE/DELETE only where practitioner_id = current practitioner
```

**Encryption boundary:** `notes`, `rating`, `contact_meta` are application-layer envelope-encrypted before Supabase ever sees them. Per-practitioner data key derived from the practitioner's account. Supabase only stores ciphertext + nonce. Key rotation is a documented Phase 4 operation.

**Export + wipe:** practitioner can export the full Network Catalog as CSV (decrypted in-app) or wipe the entire catalog with a destructive confirmation flow. Both flows are logged to `agent_logs` for auditability.

**Cross-tenant invariant:** there is no application path that returns a Network Catalog entry where `practitioner_id` differs from the authenticated practitioner. Tested by:
- Schema constraint (`NOT NULL` on `practitioner_id`)
- Query wrapper (no overload accepts a "skip filter" path)
- RLS policy (post-Day-30)
- Telemetry alert on any mismatch
- Penetration test before Phase 1D Day 25 ship (`/cso` skill)

**No cross-practitioner suggestions ever.** When the Selection Engine in Partner mode asks "who do I know that fits this profile?", the query is bounded to the calling practitioner's catalog. External sourcing is the next step ONLY after the practitioner's own catalog is searched.
