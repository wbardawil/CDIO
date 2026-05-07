# AI-CDIO: Architecture

> **Last refreshed:** 2026-05-07 (Day 11 — major refresh from Day 4 baseline. Multi-corpus RAG, tenant isolation P0, single-agent default + multi-agent tier matrix, memory primitives Phase 4, Phase 1D engine schemas, Architectural Lineage from gsd-2 + gstack.). Aligned with `docs/STRATEGY-2026.md`.

## The Four-Layer Model

```
┌───────────────────────────────────────────────────────────┐
│  LAYER 1 — PRACTITIONER WORKSPACE (the command center)     │
│  - Practitioner account (Clerk)                            │
│  - Portfolio: list of all clients                          │
│  - Network Catalog (per-practitioner private moat)         │
│  - Time tracking, billable hours, capacity (toggle on/off) │
│  - Knowledge Reuse layer (Phase 4 — cross-client patterns) │
│  - Outcome log (weekly verification surface)               │
└────────────┬──────────────────────────────────────────────┘
             │
             ▼
┌───────────────────────────────────────────────────────────┐
│  LAYER 2 — CLIENT WORKSPACE (one per organization)         │
│  - Org profile + sandbox flag (Real vs Test)               │
│  - Stakeholders + roles + assessment tokens                │
│  - Engagement state (phase, current deliverables)          │
│  - Decisions log + Decision Packages (hero artifact)       │
│  - Initiative Pilot (multi-party coordination, Phase 1D)   │
│  - Cadence (read-only client view, Phase 1D)               │
│  - Risk register, meeting notes                            │
└────────────┬──────────────────────────────────────────────┘
             │
             ▼
┌───────────────────────────────────────────────────────────┐
│  LAYER 3 — PLAYBOOK ENGINES (the toolbox)                  │
│  ┌─Assessment──┐ ┌─Roadmap──────┐ ┌─Decision Package─┐     │
│  │ 16 modules  │ │ 90/180/360   │ │ Divergence-driven│     │
│  │ 5-level     │ │ Quick wins   │ │ Framework rec    │     │
│  │ Role-tagged │ │ Stack rec    │ │ Resolve flow     │     │
│  └─────────────┘ └──────────────┘ └──────────────────┘     │
│  ┌─Charter──────┐ ┌─Initiative──┐ ┌─Selection──────┐       │
│  │ Lean 1-page  │ │ Pilot Phase │ │ Engine (Tech + │       │
│  │ KPMG ROO     │ │ 1D multi-   │ │ Partner modes) │       │
│  │ baked in     │ │ party coord │ │ Phase 1D       │       │
│  └──────────────┘ └─────────────┘ └────────────────┘       │
│  ┌─Status Report┐ ┌─Cadence─────┐ ┌─Network Catalog┐       │
│  │ Auto-aggreg  │ │ Read-only   │ │ Per-practition │       │
│  │ from Init    │ │ shareable   │ │ private moat   │       │
│  │ Pilot data   │ │ token       │ │ Phase 1D       │       │
│  └──────────────┘ └─────────────┘ └────────────────┘       │
│  ┌─AI Accelerator (Phase 2.5)──────────────────────────┐   │
│  │ AI Maturity / Use-Case Library / AI Roadmap /        │   │
│  │ Selection Engine AI extension / Governance Scaffold  │   │
│  │ Quarterly re-assessment cadence                      │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌─MCP Server (Phase 1D Day 28)────────────────────────┐    │
│  │ 6 generic tools + 5 AI-specific tools (Phase 2.5)   │    │
│  │ Distribution into Claude.ai / Cursor / Codex        │    │
│  └─────────────────────────────────────────────────────┘    │
└────────────┬──────────────────────────────────────────────┘
             │
             ▼
┌───────────────────────────────────────────────────────────┐
│  LAYER 4 — PLAYBOOK BRAIN (Multi-Corpus RAG)               │
│  - Playbook chunks (1,154 — global, read-only)             │
│  - Frameworks (NIST CSF/AI RMF/EU AI Act/ITIL/TBM/...)     │
│  - Vendor data (G2 snippets, vendor docs) — global         │
│  - Industry overlays (HIPAA/PCI-DSS/FDA/...) — global      │
│  - Use-case catalog (AI use cases × industry × function)   │
│  - Per-practitioner historical engagements (PRIVATE, P0)   │
│  - Per-practitioner Network Catalog (PRIVATE, P0)          │
│  - Decision rules: Value/Effort, Quick Win, Module Stacks  │
│  - Industry overrides, size adaptation, hours scaling      │
└───────────────────────────────────────────────────────────┘
```

---

## Multi-Corpus RAG Architecture (locked 2026-05-07)

Today's RAG is a single corpus (`playbook_chunks`, 1,154 entries). The full scope requires **seven corpora**, each with its own retrieval strategy and tenant-isolation rules.

### The seven corpora

| Corpus | Contents | Isolation | Retrieval |
|---|---|---|---|
| **Playbook** | 30-file CDIO methodology, action recommendations | Global (read-only across all practitioners) | Embedding + keyword |
| **Frameworks** | NIST CSF v2.0, NIST AI RMF, EU AI Act, ITIL 4, TBM Council, KPMG, MIT Strategic Alignment, APQC PCF, Lean Six Sigma, Prosci ADKAR, Kotter 8-Step, ISO/IEC 42001 | Global (read-only) | Embedding + structured (framework + reference) |
| **Vendor data** | G2 review snippets (paste-only, no API), vendor docs, security reports, compliance certifications | Global (curated, periodically refreshed) | Hybrid — embedding for unstructured, structured query for vendor metadata |
| **Industry overlays** | HIPAA, PCI-DSS, FDA, GDPR, CSRD, SOC2 | Global (read-only) | Industry-keyed structured query |
| **Use-case catalog** | AI use cases × industry × function (Phase 2.5) | Global (curated) | Faceted search + embedding |
| **Per-practitioner historical engagements** | Phase 4 Knowledge Reuse — past clients' anonymized engagement patterns | **Per-practitioner private. P0. Never cross-practitioner visible.** | Practitioner-scoped embedding |
| **Per-practitioner Network Catalog** | Tagged record of every partner the practitioner has worked with (people-data) | **Per-practitioner private. P0. Never cross-practitioner visible.** | Structured query (NOT embedding — people-data is structured) |

### Tenant isolation requirements (P0)

**Defense-in-depth, three layers:**
1. **Application layer** — every retrieval call carries `practitioner_id`; per-corpus filter applied before query construction
2. **Database layer** — Supabase RLS policies on `engagement_history`, `network_catalog`, and any other private corpus, keyed to `auth.uid()` (Day 30+ migration to per-user JWT) or `practitioner_id` (today)
3. **Schema layer** — separate tables per corpus type (no shared `playbook_chunks` table mixing tenant-private + global content)

**Audit:**
- Every cross-tenant retrieval attempt logged to `agent_logs` with `event_type = 'cross_tenant_attempt'`. **Must be zero in production.**
- Weekly review of `agent_logs` for unauthorized retrieval patterns
- Network Catalog notes encrypted at rest beyond Supabase defaults (column-level encryption for sensitive fields)

**Practitioner controls:**
- Full export of private corpora to CSV/JSON at will
- One-click wipe of entire Network Catalog or engagement history (GDPR-clean)
- Notes never surfaced to clients, vendors, contractors, or other practitioners under any circumstance

**Hard prohibitions:**
- No "anonymized aggregate insights" across practitioners in Year 1 (different product, different consent flow — Year 2+ decision)
- No "tap into a network of 1,000 vetted partners" marketing — that's a marketplace, not what we're building
- Vendor / contractor magic-link sessions can never see Network Catalog exists (not in API responses, not in metadata, not in audit logs visible to them)

### Hybrid retrieval

When multiple corpora return hits, a re-ranker prioritizes by query type:
- Compliance question → Frameworks corpus beats Playbook
- "How do I structure this initiative?" → Playbook beats Frameworks
- Vendor evaluation → Vendor data beats Use-case catalog
- "Have I worked with someone for this before?" → Network Catalog ONLY (no global retrieval; privacy P0)

---

## Single-Agent Default + Multi-Agent Tier Matrix (locked 2026-05-07)

### Single-agent operations (~20 of ~30 LLM operations)

These are bounded, structured, single-call. Single-agent is the right tool. Examples:
- Module scoring narrative
- Path-to-next-level recommendations
- Decision Package framework recommendation
- Industry overlay rephrasing
- Adaptive questioning
- Charter generation
- Status report aggregation
- Selection Engine basic matrix
- AI Maturity scoring
- Engagement Cadence content generation

### Multi-agent operations (~10 of ~30, all Phase 2.5+)

These are research-intensive, multi-step, high per-engagement value. Multi-agent earns its keep:

| Operation | Agent breakdown | Phase |
|---|---|---|
| Tech Selection deep evaluation | Research agent (vendor docs, security reports) → Evaluator (criteria scoring) → Recommender (memo) | 1D Day 24 (mostly single-agent) / 2.5 Day 45 (deep extension) |
| Partner Selection sourcing (find capability) | Research (Upwork drafts, LinkedIn search) → Evaluator (against criteria) → Network-cross-reference | 2.5+ |
| AI Use-Case Library deep dive | Use-case discovery → fit analysis → ROI estimation per case | 2.5 Day 41-42 |
| AI Roadmap multi-step generation | Discovery → 90-day planning → 180-day → 360-day → governance gap → sequencing | 2.5 Day 43-44 |
| Selection Engine — AI extension | Vendor capability mapping → governance overlay (NIST AI RMF / EU AI Act) → recommendation memo | 2.5 Day 45 |
| Governance gap detection | Policy parser → control coverage analysis → gap synthesis | 2.5 Day 46 |
| QBR Deck generation | Section-by-section: progress narrative → decisions log → ROI calc → next-quarter recommendation | Phase 4 |
| Knowledge Reuse pattern surfacing | Pattern matcher across engagements → relevance ranker → recommendation generator | Phase 4 |
| Stakeholder-pattern detector | Behavioral analysis across responses → calibration suggestion | Phase 4 |
| Document/image AI Vision evidence | Vision agent (image parsing) → context agent (relevance) → integration with score | Phase 4 |
| Outcome prediction across engagements | Pattern matcher + statistical model + confidence scorer | Phase 4 |

### Tier matrix (provisional — final tiers locked Phase 2 Day 35-38)

Architectural law per `STRATEGY-2026.md`: methodology is FULL on every tier. Tiers differentiate by scale (clients, practitioners) and compute mechanism only — never by methodology depth.

| Tier | Clients | Practitioners | Compute mechanism | Multi-agent flows available |
|---|---|---|---|---|
| **Starter ($199 provisional)** | 1-3 | 1 | Mechanism 1 (allowance + metered overage) | All — but constrained by allowance. Practitioner sees marginal cost, self-regulates. AI Accelerator included IF margin math works. |
| **Growth ($399 provisional)** | 4-15 | 1 | Mechanism 2 (BYOK — practitioner's API key) | All. Compute hits practitioner's provider account. |
| **Scale ($599 provisional)** | Unlimited | Up to 5 | Mechanism 2 (BYOK) | All + Phase 4 features (Knowledge Reuse, Custom playbook ingestion, cross-engagement analytics). |

Cost telemetry from Day 19 (`agent_logs` per-engagement instrumentation) is the empirical input to the Phase 2 Day 35-38 final pricing review.

---

## Memory Primitives Phase 4 Commitment

Today: every LLM call is stateless, context fed per-request. Works for single-shot operations.

Phase 4: per-client conversational memory across sessions. The agent knows Ambar's history without re-retrieving. Adopts Anthropic's native memory primitives when generally available — does not roll its own custom memory system.

This is what makes the Practitioner Feeling Map's *"My methodology travels with me"* feeling work for real. The eighth client benefits from clients 1-7 because the agent remembers patterns, decisions, and outcomes across the engagement timeline.

**Commitment:** no custom memory infrastructure built before Anthropic ships memory primitives natively. If Phase 4 arrives and primitives still aren't generally available, evaluate gsd-2's `KNOWLEDGE.md` / `DECISIONS.md` / `RUNTIME.md` pattern as the alternative (file-based, durable, simple). Don't roll our own.

---

## Phase 1D Engine Data Models

### Initiative Pilot

```sql
create table initiatives (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  charter_id uuid references charters(id),               -- if generated from a charter
  decision_package_id uuid references divergence_points(id),  -- if generated from a Decision Package
  roadmap_initiative_id uuid references initiatives(id), -- if from existing roadmap (legacy table reuse)
  title text not null,
  owner_practitioner_id uuid not null references practitioners(id),
  target_completion_date date,
  success_criteria_kpmg_roo jsonb not null default '{}',  -- { metric, baseline, target, measurement_method }
  status text not null check (status in ('proposed','active','blocked','complete','cancelled')),
  domain text not null default 'cdio' check (domain in ('cdio','ai')),  -- Phase 2.5 extension point
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table initiative_steps (
  id uuid primary key default gen_random_uuid(),
  initiative_id uuid not null references initiatives(id) on delete cascade,
  ordinal integer not null,                              -- step order within initiative
  title text not null,
  description text not null,
  owner_type text not null check (owner_type in ('practitioner','internal','vendor','contractor')),
  owner_participant_id uuid references initiative_participants(id),
  due_date date,
  status text not null check (status in ('not_started','in_progress','blocked','complete','skipped')),
  jira_ticket_url text,                                  -- read-sync hyperlink
  framework_citation jsonb,                              -- if step is anchored to a framework recommendation
  created_at timestamptz not null default now()
);

create table initiative_participants (
  id uuid primary key default gen_random_uuid(),
  initiative_id uuid not null references initiatives(id) on delete cascade,
  participant_type text not null check (participant_type in ('internal','vendor','contractor')),
  display_name text not null,
  email text,
  role_label text,                                       -- "Okta SE", "Security contractor", "CTO"
  magic_link_token text unique,                          -- token-based contextual access
  visibility text not null default 'contextual' check (visibility in ('contextual','minimal')),
  invited_at timestamptz not null default now(),
  last_active_at timestamptz
);
```

### Selection Engine

```sql
create table selection_matrices (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  initiative_id uuid references initiatives(id),
  mode text not null check (mode in ('tech','partner','ai_tech')),  -- ai_tech is Phase 2.5 extension
  category text not null,                                -- "MFA/IAM", "CRM", "AI Use-Case Implementer"
  criteria jsonb not null default '[]',                  -- [{ name, weight, description }]
  candidates jsonb not null default '[]',                -- [{ name, source, scores: {criterion: score}, notes }]
  ai_leaning_recommendation text,
  ai_leaning_caveats text,
  practitioner_decision text,
  decided_at timestamptz,
  created_at timestamptz not null default now()
);
```

### Network Catalog (per-practitioner private)

```sql
create table network_catalog_entries (
  id uuid primary key default gen_random_uuid(),
  practitioner_id uuid not null references practitioners(id) on delete cascade,
  display_name text not null,                            -- ENCRYPTED at rest
  role_or_title text,                                    -- ENCRYPTED at rest
  company text,
  domain_tags text[] not null default '{}',              -- ["Okta rollouts","Salesforce admin","FinOps"]
  source text,                                           -- "Upwork","Clutch","peer referral","LinkedIn"
  last_engagement_date date,
  rating integer check (rating between 1 and 5),
  notes text,                                            -- ENCRYPTED at rest
  pricing_quoted text,                                   -- ENCRYPTED at rest (commercially sensitive)
  contact_info jsonb,                                    -- { email, phone, linkedin } — ENCRYPTED at rest
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Strict tenant isolation policy (P0)
alter table network_catalog_entries enable row level security;
create policy "Practitioners read own network only"
  on network_catalog_entries
  for select
  using (practitioner_id = (select id from practitioners where clerk_user_id = auth.uid()));
create policy "Practitioners write own network only"
  on network_catalog_entries
  for all
  using (practitioner_id = (select id from practitioners where clerk_user_id = auth.uid()));
```

---

## Architectural Lineage (locked 2026-05-07)

AI-CDIO's architecture is not invented from scratch. It borrows deliberately from two reference systems we've studied. See `docs/STRATEGY-2026.md` Architectural Lineage section for the strategic framing; this section captures the technical detail.

### gsd-2 patterns adopted (already shipped)

| gsd-2 pattern | AI-CDIO equivalent | Where it lives |
|---|---|---|
| Single-writer state engine (atomic transitions) | Atomic synthesis stored proc | `src/lib/db/schema-v6-synthesis-rpc.sql` (Day 5) |
| Fresh context per task | Per-stakeholder LLM call (no cross-stakeholder context bleed) | `src/lib/agents/assessment.ts` |
| Durable state (not in-memory) | Engagement state in Supabase, not server memory | Schema design from Day 1 |
| Worktree isolation per milestone | Per-org workspace + sandbox flag for tenant isolation | `src/lib/db/schema-v7-orphan-sandbox.sql` (Day 7) |
| File-based state visibility (`STATE.md`) | Coverage warnings + Decision Packages surfaced in workspace | Day 9-10 |
| Cost tracking per unit | `agent_logs` per-engagement instrumentation | Phase 1.5 Day 19 |

### gsd-2 patterns to consider (not yet shipped)

- Crash-recovery lock files for long-running synthesis or AI Roadmap generation (Phase 2.5+)
- Sliding-window stuck-loop detection on multi-agent flows (Phase 2.5+)
- Soft / idle / hard timeout supervision on autonomous engagements (Phase 2.5+)
- `KNOWLEDGE.md` / `DECISIONS.md` / `RUNTIME.md` file-based memory pattern as Phase 4 fallback if Anthropic memory primitives aren't generally available

### gsd-2 runtime integration decision — Phase 2.5 Day 38 gate

Three options (see `docs/ROADMAP.md` Phase 2.5 introduction for full criteria):
- **(A)** Custom multi-agent build using Anthropic SDK directly
- **(B)** Pattern adoption only — borrow gsd-2's patterns, no runtime dependency
- **(C)** Build AI Accelerator multi-agent flows on gsd-2's Pi SDK runtime

Decision driven by Day 19+ cost telemetry, Phase 2 design partner feedback on Phase 1D Selection Engine, and gsd-2 release stability between now and Day 38.

### gstack patterns (build-process discipline)

gstack is not embedded in the AI-CDIO product; it's used as the build-process discipline. See `docs/STRATEGY-2026.md` Process Discipline section for the mandatory gates.

**Patterns AI-CDIO will adopt as Phase 4 Knowledge Reuse panel lands:**
- `/learn` skill's pattern of cross-session memory compounding — practitioner's eighth client benefits from clients 1-7
- `/retro` skill's pattern of per-person, per-week breakdown — could inform practitioner self-service analytics in Phase 4

---

## Data Model (High-Level, end of Day 11)

```
practitioners (id, clerk_user_id, name, email, plan, created_at)
   ├── practitioner_clients (practitioner_id, org_id, role)   -- N:N as of Phase 1A
   │
   ├── network_catalog_entries (practitioner_id, ...)         -- per-practitioner PRIVATE (Phase 1D Day 25)
   │
   └── organizations (id, name, size, industry, employee_count, monthly_hours, is_sandbox, active_modules)
          ├── stakeholders
          ├── assessments → module_scores → assessment_synthesis → divergence_points
          │   └── module_scores (Phase 1C: maturity_score nullable, narrative, path_to_next_level, module_skipped)
          ├── roadmaps → initiatives (legacy, Phase 1A)
          ├── charters (Phase 1D Day 21)
          ├── initiatives → initiative_steps + initiative_participants (Phase 1D Days 22-23)
          ├── selection_matrices (Phase 1D Days 24-25)
          ├── deliverables (status_reports, qbr_decks, board_memos, charters)
          ├── action_cards
          ├── decisions
          ├── conversations
          ├── value_tracking (committed_kpis, delivered_kpis, roi_proof)  -- Phase 4
          └── engagement_state (phase, hours_used, current_deliverables)

playbook_chunks (RAG, global, shared)                       -- Day 1
framework_chunks (RAG, global, NIST/ITIL/TBM/...)           -- Phase 1C Day 17
vendor_chunks (RAG, global, G2 snippets/vendor docs)        -- Phase 1D Day 24
industry_overlay_chunks (RAG, global, HIPAA/PCI-DSS/...)    -- Phase 1.5 Day 18
use_case_catalog (Phase 2.5)
engagement_history (RAG, per-practitioner PRIVATE, Phase 4)

agent_logs (per-practitioner + per-client cost tracking, Phase 1.5)
```

---

## Tech Stack

| Layer | Technology | Status |
|-------|-----------|--------|
| Frontend | Next.js 16 (Turbopack) + TypeScript + Tailwind 4 | ✅ |
| Auth | Clerk 7 (multi-tenant: practitioners with N clients) | ✅ Wired |
| AI | Claude Sonnet 4.5+ (single-agent default; multi-agent for Phase 2.5+ flows) | ✅ Wired |
| Database | Supabase Postgres + pgvector + RLS (RLS policies pre-wired, full per-user JWT activation Day 30+) | ✅ Wired |
| Email | Resend (`onboarding@resend.dev` for testing; verified domain Phase 1.5 Day 19) | ✅ Wired Day 4 |
| Charts | Recharts | ✅ |
| Hosting | Vercel | ❌ Phase 1.5 Day 18 |
| Background Jobs | Inngest or QStash | ❌ Phase 2 if needed |
| Observability | Sentry + Langfuse | ❌ Day 6 (env vars pending) |
| Rate Limiting | Upstash Redis | ❌ Day 5 (env vars pending) |
| MCP Server | Custom MCP wrapper exposing engines as tools | ❌ Day 28 |
| PM Tool Integration | Jira / Asana / Monday read-sync | ❌ Day 28 |
| Cost Telemetry | `agent_logs` per-engagement instrumentation | ❌ Day 19 |
| Column-level encryption | Network Catalog sensitive fields | ❌ Day 25 |

---

## Multi-Tenancy Model

Three levels of tenancy:

1. **Practitioner level** — Each practitioner is isolated. Cannot see other practitioners' clients, Network Catalog, or engagement history.
2. **Client level** — Each client org is isolated within a practitioner's portfolio. Stakeholders see only their own org. Vendors / contractors see only their assigned initiative steps via contextual token-based access.
3. **Domain level** — Future: `domain` field (`cdio` | `strategist` | `ome`) separates AI-CDIO from sister products.

**N:N practitioner-to-client (locked 2026-05-07):** schema supports multiple practitioners on a single client (Scale tier — partner consultancies, mentor-mentee pairs, fractional + permanent CIO co-engagements). UI defaults to single-owner display for solo practitioners (1:N visual). No schema change required — the existing `practitioner_clients` table is already N:N.

**Enforcement:**
- Clerk `practitioner_id` set in JWT claims
- Every API route validates `practitioner_id` matches the requested resource's owner
- Supabase RLS policies tied to `auth.uid()` and `practitioner_id`
- Service role used ONLY in background jobs, never in API routes (after Day 30 migration)

---

## Engine Pattern

Every Playbook Engine follows the same shape:

```typescript
interface PlaybookEngine<TInput, TOutput> {
  // What client data does this engine need?
  loadContext(orgId: string): Promise<EngineContext>;

  // What corpora does this engine retrieve from?
  loadCorpusContext(): Promise<{
    playbook?: PlaybookChunks;
    frameworks?: FrameworkChunks;
    vendors?: VendorChunks;        // Phase 1D
    industry?: IndustryChunks;      // Phase 1.5
    useCases?: UseCaseChunks;       // Phase 2.5
    networkCatalog?: NetworkEntries; // Phase 1D, per-practitioner only
  }>;

  // Generate the deliverable (single-agent default; multi-agent only when justified)
  generate(input: TInput, context: EngineContext, mode: 'single-agent' | 'multi-agent'): Promise<TOutput>;

  // Save to deliverables table
  persist(output: TOutput, orgId: string): Promise<DeliverableId>;
}
```

This makes adding new engines (Charter, Initiative Pilot, Selection Engine, Status Report, Cadence) consistent and fast.

---

## Process Discipline

See `docs/STRATEGY-2026.md` Process Discipline section. Mandatory gstack gates summary:

- `/plan-eng-review` before any architecture commit
- `/cso` before any privacy-sensitive feature (Network Catalog Day 25 is non-negotiable)
- `/codex` for second opinions on architectural calls
- `/autoplan` at start of any new phase
- `/review` before any merge to main
- `/qa` before any deploy
- `/learn` after major commits

---

## MCP / Integration Roadmap

| Phase | Integrations |
|-------|-------------|
| Phase 1A-1C (Now) | Self-contained, no external integrations |
| Phase 1D Day 28 | MCP Server foundation + Jira / Asana read-sync (Mechanism B from STRATEGY-2026.md) |
| Phase 1.5 (Days 18-20) | Resend verified domain |
| Phase 2 (Days 29-38) | Cost telemetry consumers, design partner onboarding flows |
| Phase 2.5 (Days 39-50) | AI-specific MCP tools registered against existing tool registry |
| Phase 3 (Days 51-75) | Stripe billing, account/billing settings UI |
| Phase 4 (Days 76+) | Google Workspace / M365 admin, cloud billing APIs, security scanners, SaaS management, Slack/Teams, accounting (QuickBooks/Xero) |

**Principle:** integrations enrich the engines (auto-populate scores, fetch data). They never make us a tool vendor. We are the strategic heartbeat; tactical execution lives in the client's existing tools.
