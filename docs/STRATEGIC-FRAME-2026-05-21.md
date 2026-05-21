# Strategic frame · Executive OS — locked 2026-05-21

This doc captures the strategic locks from a `/plan-ceo-review` session that ran end-of-day 2026-05-21 after the founder articulated the dual-scope insight that the previous session's journey-map handoff had implied but never structured.

The session was a back-and-forth challenge between three iterations of the hub design before landing here. Each correction was the founder pushing back. The locks below survived three rounds of challenge.

## Lock 1 · Product positioning

AI-CDIO is an **organizational IT operating system**, not a CDIO's personal toolkit.

It has **two equal-weight surfaces** with a shared methodology backbone:

```
┌────────────────────────────────────────────────────────────────────────┐
│                AI-CDIO · Executive Operating System for IT             │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   CDIO WORKBENCH                       IT PROJECT PORTFOLIO            │
│   (what the CDIO does daily)           (what the org has in flight)    │
│   ─────────────────────────────         ─────────────────────────       │
│    · Decisions pending                   · Parking lot (ideas)         │
│    · Architecture map (lite)             · Deciding                    │
│    · Security posture                    · Executing                   │
│    · Vendor portfolio                    · Communicating               │
│    · Talent capability                   · Graduating                  │
│    · AI readiness                                                      │
│    · Compliance calendar                 5–10 active initiatives /     │
│    · Financial / TBM                     client. Run by PMs / sponsors │
│    · Strategy alignment                  / business owners. CDIO       │
│                                          governs but doesn't own.      │
│                                                                        │
└─────────────────────────────┬──────────────────────────────────────────┘
                              │
                              ▼
        ┌──────────────────────────────────────────────────┐
        │  METHODOLOGY BACKBONE (invisible, always-on)     │
        │                                                  │
        │  LAYER 1 — 16 IT modules · 128 questions         │
        │  Sources: CMMI, COBIT 2019, NIST CSF, ITIL 4,    │
        │           TBM, ISO 27001, etc.                   │
        │                                                  │
        │  LAYER 2 — 6 PM cross-cutters                    │
        │  Sources: PMI / PMBOK 7, Agile, Lean             │
        │                                                  │
        │  Serves WORKBENCH as: maturity standards         │
        │  Serves PORTFOLIO as: guardrails, best practices │
        │  Never the primary navigation; surfaces          │
        │  contextually inside artifacts.                  │
        └──────────────────────────────────────────────────┘
```

Role-based default landing inside one app:
- `strategic_approver` (CDIO) → workbench as primary, portfolio in peripheral vision
- `operator` (PM / assistant) → portfolio as primary (showing initiatives they own), workbench context as governing frame
- `technical_reviewer`, `financial_approver` → scoped to initiatives they review
- `viewer` → read-only across both surfaces
- `submitter` (Phase E, token-based) → parking lot submit only

## Lock 2 · Two-layer methodology

| Layer | Source | Count | Status today | Serves |
|---|---|---|---|---|
| Layer 1 — IT modules | CMMI, COBIT 2019, NIST CSF, ITIL 4, TBM, ISO 27001 | 16 modules × 8 questions = 128 | Built. 124 strong / 4 weak / 0 indefensible (2026-05-19 rebuild) | Workbench maturity + initiative guardrails |
| Layer 2 — PM cross-cutters | PMI / PMBOK 7, Agile, Lean | 6 cross-cutters | NOT built | Every initiative regardless of which IT modules it touches |

The 6 PM cross-cutters:

1. **RAID log** — Risks · Assumptions · Issues · Decisions. Living document, updated weekly.
2. **Stakeholder map** — power × interest grid, position, communication plan.
3. **Scope baseline** — what's in, what's out, explicit deferrals, signed off at Decision Package approval.
4. **Change log** — every approved scope change with rationale + approver. Audit trail.
5. **Value tracking** — projected (at Decision Package) → realized (post-launch, quarterly until graduation). Drives the ROI loop.
6. **Retro** — post-launch retrospective. 5-question rubric. Scored 1–5.

## Lock 3 · 5-dimension success rubric

Every initiative is measured at graduation against five dimensions:

| # | Dimension | Measured by | Guardrails from |
|---|---|---|---|
| 1 | On-time | `actual_completed_at` vs `target_completion_date` | M14 Process · PM Scope baseline · PM Change log |
| 2 | On-budget | `realized_cost_minor_units` vs `expected_cost_minor_units` (±10% acceptable) | M11 TBM · PM Scope baseline · PM Change log |
| 3 | Value-realized | `realized_value_minor_units` vs `expected_value_minor_units` (±25% acceptable) | M11 TBM · M2 Strategy · PM Value tracking |
| 4 | No security incident | Manual yes/no by CDIO at 90 days post-launch | M7 Security · PM RAID log |
| 5 | Retro score ≥ 4/5 | Post-launch retrospective scored on a 5-question rubric | M14 Process · PM Retro · M9 Talent |

Aggregate score: 5/5 = full success; 4/5 = strong; 3/5 = mixed; ≤2 = failure. Every initiative ends with a success scorecard, persisted to the project's history. Cross-engagement aggregate becomes a CDIO renewal-justification artifact ("4.2/5 average across the engagement's initiatives").

## CDIO Workbench is the Company IT Architecture Map (one artifact, many lenses)

**Correction (added end-of-session 2026-05-21):** the CDIO Workbench is not a collection of parallel tiles. It is a single layered, strategically aligned architecture map of the company's technology estate, with multiple lenses (saved filter views) over the same dataset.

### The layered map structure

```
Strategic Pillars        → 3–7 per company (engagement-specific, seeded from Charter)
  ↓ supports
Business Capabilities    → ~30–50 per company (standard library, editable per engagement)
  ↓ enabled by
IT Capabilities          → ~20–40 per company (standard library, editable per engagement)
  ↓ delivered through
Applications             → 50–500 per mid-market company (the operative layer)
  ↓ runs on
Infrastructure + Data Domains
```

Each Application carries: strategic-pillar tags, business + IT capability tags, TIME classification (Tolerate/Invest/Migrate/Eliminate), RTB/GTB/TTB classification, annual cost, vendor, contract renewal date, owner role, touched_modules (which of the 16 IT modules apply), linked initiatives, health status.

### Three visual toggles on one data model

| Visual | Best for | Risk |
|---|---|---|
| Layered alignment view | Strategic narrative (board-room slide) | None |
| Matrix heatmap (pillars × IT capabilities) | Coverage-gap analysis | None |
| Force-directed graph | Exploratory clusters | Approaches LeanIX visual; scoped to mid-market keeps it differentiated |

User picks the view. Same data underneath.

### Seven lenses (saved filter views)

| Lens | What it shows | Filter |
|---|---|---|
| Security posture | M7 maturity per security app + gaps | `touched_modules ∋ M7` |
| Vendor portfolio | All vendors, spend, renewal cycle, consolidation | Pivot by `vendor` |
| AI readiness | Where AI is today + opportunity | `touched_modules ∋ M16` |
| Cost / TBM | Heatmap by cost, pivot by RTB/GTB/TTB | Pivot by `time_classification` |
| Strategic alignment | Pillars with weak tech support, apps supporting nothing | Coverage matrix |
| Compliance | Apps touching regulated data, evidence chain | `touched_modules ∋ M13` |
| Talent capability | Skills required per stack, gaps | `touched_modules ∋ M9` |

### Three scope limits to keep AI-CDIO out of LeanIX territory

1. **Mid-market only.** 50–500 apps per company. If a customer has more, integrate LeanIX/Ardoq/Bizzdesign via API in Phase E; don't be the source of truth for a 50,000-app estate.
2. **Strategic alignment, not architecture management.** No app-to-app dependency at API level, no data lineage at field level, no deployment topology, no API contracts. We stop at decision-context depth.
3. **Read-mostly, not lifecycle-managed.** Document the estate here, use it as decision context. Lifecycle workflows live in customer's ITSM (ServiceNow, Jira Service Management). We display lifecycle status; we don't operate it.

If we violate any of these three, we become a worse LeanIX. Holding them, we're a sharper strategic-alignment tool than LeanIX (whose center of gravity is inventory).

## Build sequence (5–7 weeks, sprint-scoped)

```
DONE this week           S1 (operator + approvals), S1.5 (5-role + Coach
                         substrate), hotfixes (#8 #9 #10 #11 #12 #13)

PR #15 PENDING MERGE     Security hotfix — codex findings #9, #10, #11
                         (cross-org IDOR, public ID tampering, viewer
                         mutation across 15 endpoints)

SPRINT S2                Substrate fix — codex P1 substrate bugs:
                         prior_version capture before mutation, CAS-safe
                         state transitions, transaction integrity around
                         state+event writes, wire 'rejected' end-to-end.
                         ~3–4 hours.

SPRINT S2.5              Schema-v25 — touched_modules:int[] on artifacts
                         (initiatives, selections, audits, status_reports);
                         success_scorecard table (5 dimensions, computed
                         at graduation); realized_cost_minor_units +
                         realized_value_minor_units + actual_completed_at
                         on initiatives; 6 PM cross-cutter tables (raid,
                         stakeholder, scope_baseline, change_log,
                         value_tracking, retros); plus the architecture
                         map tables — applications, business_capabilities,
                         it_capabilities, strategic_pillars, link tables,
                         infrastructure_items, integrations, data_domains.
                         Standard library seeds for business/IT capabilities.
                         Reverse index for "show me everything touching M7."
                         ~2 days.

SPRINT S3                First-class Decision Package — replaces the
                         current divergence-blob model (codex finding
                         #13). Wizard-driven 6–8 plain-language questions,
                         auto-generates methodology-cited frame from the
                         initiative's touched_modules + the 6 PM cross-
                         cutters. ~5–7 days.

SPRINT S4                CDIO Workbench = Company IT Architecture Map.
                         Phased:
                         S4a (~3 days): Applications list + tagging UI
                                        (create app, edit tags, link to
                                        pillar/capability/initiative).
                                        Table view + edit forms.
                         S4b (~5 days): Visual alignment map with 3
                                        toggles — layered alignment view,
                                        matrix heatmap, force-directed
                                        graph. Same data, three lenses.
                         S4c (~3 days): 7 saved lenses (security, vendor,
                                        AI, cost/TBM, strategic alignment,
                                        compliance, talent).
                         Total: ~11 days.

SPRINT S5                IT Project Portfolio surface — the org-wide
                         initiative canvas with 5 stages (parking lot,
                         deciding, executing, communicating, graduating),
                         owner views, RAG, drift detection. ~5 days.

SPRINT S6                Phase E — Parking lot / Demand Catalog (token-
                         based submitter; handoff §14). ~3–4 days.

SPRINT S7                Phase D — Coach Mode (learns from
                         approval_events prior_version diffs over time;
                         the substrate exists from S1.5). ~5 days.

TOTAL                    Roughly 5–7 weeks of focused build.
```

## Five challenges raised in this session and their resolution

| # | Challenge | Resolution |
|---|---|---|
| 1 | "IT Architecture map" risks the LeanIX trap (research stream A3) | Build LITE app + integration inventory inside the CDIO Workbench. Read-only document, not a managed-in-here EAM. If user wants LeanIX-depth, integrate LeanIX via API later (Phase E+). |
| 2 | "UX/UI could vary" — meaning? | One product, role-based default landing. UX varies by who's logged in, not by mode flip. |
| 3 | CDIO scope isn't "continuous" — it has its own rhythm | Workbench exposes CDIO-lane lifecycle items (annual plan due, quarterly board memo, monthly risk review, vendor renewals). Not a static metrics wall. |
| 4 | 128 Q as maturity ≠ 128 Q as guardrails — they need a derivation layer | Phase B's Decision Package wizard IS the derivation layer. The wizard's plain-language operator prompts ARE the guardrails surfaced. Maturity questions stay as-is; guardrails are derived from them at decision time. |
| 5 | ROI is bigger than casual mention — requires realized tracking, not just projected | Sprint S2.5 adds realized_value + realized_cost columns + quarterly post-launch review cadence (lives in PM cross-cutter #5 Value Tracking). Graduation triggers final ROI computation. |

## 6 open items — LOCKED 2026-05-21

All six previously parked items are now decided.

### Lock 5.1 · Scale — no architectural cap

No cap on initiatives per CDIO/client. Build the portfolio surface for scale. Cost vectors tracked but none are blockers at current team size:

- Supabase rows: unbounded at this shape; Pro tier ($25/mo) at ~500MB
- Vercel function invocations: Hobby = 100K/mo (current usage ≈ 3-5K/mo per active client)
- LLM tokens: ~$2-5 per initiative lifecycle; logged to `agent_logs`; surface as informational "MTD LLM cost" in CDIO Workbench
- Vercel build minutes: Hobby = 6000/mo (current usage trivial)

Implication for S5 portfolio surface: server-side pagination, indexed columns (`org_id`, `status`, `owner_id`, `target_completion_date`, `touched_modules` via GIN index), default view = "needs my attention this week", bulk select for tagging.

### Lock 5.2 · Roles — 8 roles total

Adding `project_owner` and `business_sponsor` to the role enum:

```
practitioner_clients.role IN (
  'strategic_approver',     -- CDIO at engagement scope (bootstrap-only)
  'business_sponsor',       -- exec sponsor; approves graduation value-realized
  'project_owner',          -- accountable for delivery; approves scope baseline changes
  'technical_reviewer',     -- Tech Lead; reviews technical RAG
  'financial_approver',     -- CFO; reviews spend
  'operator',               -- PM / assistant; drafts artifacts
  'collaborator',           -- advisory; legacy
  'viewer'                  -- read-only
)
```

Invitable subset (excludes bootstrap-only `strategic_approver`): 7 roles.

Per-initiative attribution via two new FK columns on initiatives:

```sql
ALTER TABLE initiatives
  ADD COLUMN project_owner_practitioner_id uuid REFERENCES practitioners(id),
  ADD COLUMN business_sponsor_practitioner_id uuid REFERENCES practitioners(id);
```

Permission rule: `assertCanApprove(orgId, optional initiativeId)` returns ok if caller is `strategic_approver` OR `business_sponsor_practitioner_id = self` on that specific initiative. At graduation, the `business_sponsor` must co-sign dimension 3 (value-realized).

Year 2 can refactor to a dedicated `initiative_assignments` junction if multi-person sponsors become common.

### Lock 5.3 · Success rubric weights — equal weights with hard-fail flags

```
Aggregate score: N/5 (equal weights, 1 point per dimension passed)

HARD-FAIL FLAGS (overlay the score):
  Dimension 3 fail (value-realized below ±25% threshold)  → RED flag
  Dimension 4 fail (any critical/high security incident
                    in first 90 days post-launch)         → RED flag

Even a 4/5 score is marked RED if either hard-fail trips.
```

Display: two badges per initiative — "4/5" plus (when applicable) "RED — value-realized" or "RED — security incident".

Visual status mapping: 5/5 = green; 3-4/5 = amber; 0-2/5 OR any RED flag = red.

Rationale: weighted scores are harder to explain to a CEO. Equal weights with hard-fail flags captures the "but these two matter more" reality without arithmetic gymnastics. Dimensions 3 and 4 are hard-fails because (3) value-realized is the renewal-justification metric and (4) a security incident is binary catastrophic risk.

### Lock 5.4 · Security incidents — proper table in schema-v25

```sql
CREATE TABLE security_incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  initiative_id uuid REFERENCES initiatives(id),  -- nullable; not all incidents tie to an initiative

  title text NOT NULL,
  description text,
  category text NOT NULL CHECK (category IN (
    'data_breach', 'unauthorized_access', 'malware', 'phishing',
    'service_outage', 'vendor_compromise', 'misconfiguration',
    'insider_threat', 'other'
  )),
  severity text NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),

  detected_at timestamptz NOT NULL,
  contained_at timestamptz,
  resolved_at timestamptz,

  affected_systems text[],                          -- app IDs from architecture map
  data_classification_touched text[] CHECK (data_classification_touched <@ ARRAY[
    'public', 'internal', 'confidential', 'pii', 'phi', 'financial'
  ]::text[]),
  estimated_records_affected int,

  reported_by_practitioner_id uuid REFERENCES practitioners(id),
  assigned_to_practitioner_id uuid REFERENCES practitioners(id),
  resolution_notes text,
  lessons_learned text,

  regulatory_notification_required boolean DEFAULT false,
  regulatory_notification_sent_at timestamptz,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

Wired to scorecard dimension 4: zero `critical|high` incidents in the 90-day window post-launch where `initiative_id` matches = dimension passes.

Linkable to M7 lens in the Architecture Map. Becomes a sub-surface in S4c (CDIO Workbench lenses).

### Lock 5.5 · Retro rubric — 5 questions, 1-5 scale

Dimension 5 passes if average score across all raters >= 4.

| Q | Theme | Question | 1 | 3 | 5 |
|---|---|---|---|---|---|
| 1 | Outcome | Did we deliver the value we projected? | Far less | Roughly what we promised | More than projected |
| 2 | Process | Did the project follow a defensible decision path? | Chaotic / untraceable | Tracked but rationale sometimes unclear | Every major decision had clear rationale + alternatives considered |
| 3 | People | Did the team grow from this engagement? | More burned out than before | Learned but didn't grow capability | Gained specific new capability we can deploy elsewhere |
| 4 | Methodology | Were the methodology guardrails helpful? | Got in the way | Neutral | Saved us from at least one major mistake |
| 5 | Future | Would we recommend this approach to another client? | No, we'd do it very differently | Yes, with caveats | Yes, this is now our reference pattern |

Raters (mandatory): project_owner, business_sponsor, strategic_approver. Optional: technical_reviewer, financial_approver.

Aggregate retro score = unweighted average across all who scored.

### Lock 5.6 · Standard library — 25 business capabilities + 20 IT capabilities

The Architecture Map has 3 taxonomies. Strategic pillars stay engagement-specific (3-7 items seeded from the Charter). The other two ship as standard libraries that the engagement can adopt, rename, or replace.

**Why we need this:** blank-page paralysis. If the CDIO has to type 30 business capability names from scratch on day 1 of every engagement, they won't. They'll skip it. The map collapses.

**Standard business capabilities (25 items, sourced from BIZBOK v9 + TBM 5.0.1):**

| Customer-facing (5) | Operations (6) | Finance & Risk (5) | People & Org (4) | Enabling (5) |
|---|---|---|---|---|
| Sales | Service Delivery | Financial Management | Human Resources | Information Technology |
| Marketing | Manufacturing / Production (toggle) | Accounting | Talent Acquisition | Legal |
| Customer Service | Supply Chain | Budgeting & Planning | Learning & Development | Real Estate & Facilities |
| Account Management | Procurement | Compliance & Audit | Performance Management | Communications & PR |
| Product Development | Quality Management | Risk Management | | Strategy & Innovation |
| | Logistics & Distribution | | | |

(5 + 6 + 5 + 4 + 5 = 25. "Manufacturing / Production" is toggleable off for services-only orgs.)

**Standard IT capabilities (20 items, sourced from TBM 5.0.1 + Gartner IT Capability Reference Model):**

| Application (8) | Data (3) | Infrastructure (4) | Security (2) | Cross-cutting (3) |
|---|---|---|---|---|
| CRM | Data Platform & Analytics | Cloud Infrastructure | Cybersecurity & Risk | Integration & APIs |
| ERP | Business Intelligence | Network & Connectivity | Identity & Access Mgmt | Collaboration & Productivity |
| HRIS | Document & Content Mgmt | Endpoint Management | | AI & Machine Learning |
| E-commerce / Digital Customer | | Application Development | | |
| Marketing Technology | | | | |
| Field Service Mgmt | | | | |
| Service Desk / ITSM | | | | |
| Communication (Voice/Video/Chat) | | | | |

(8 + 3 + 4 + 2 + 3 = 20.)

**Seeding mechanism:** on `organizations` row creation, an `init_engagement_taxonomy()` post-create RPC copies the standard 25 + 20 items into the engagement's own `business_capabilities` and `it_capabilities` tables. Each engagement owns its copy; customizations stay local.

**Schema impact (S2.5):**

```sql
-- Per-engagement taxonomies (each engagement owns its copy)
CREATE TABLE business_capabilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text,                  -- e.g., 'customer_facing', 'operations', etc.
  description text,
  source text DEFAULT 'standard_library',  -- 'standard_library' | 'custom'
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE it_capabilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text,                  -- e.g., 'application', 'data', 'infrastructure'
  description text,
  source text DEFAULT 'standard_library',
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE strategic_pillars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  -- No standard library; seeded from Charter on engagement bootstrap
  created_at timestamptz DEFAULT now()
);
```

Plus an `init_engagement_taxonomy(org_id uuid)` SQL function that inserts the 25 + 20 standard items.

## Net effect on schema-v25 (S2.5)

Adds three things to the previously scoped schema-v25:

1. `project_owner_practitioner_id` + `business_sponsor_practitioner_id` columns on `initiatives` (Lock 5.2)
2. `security_incidents` table (Lock 5.4)
3. `business_capabilities`, `it_capabilities`, `strategic_pillars` tables + `init_engagement_taxonomy()` seeding function (Lock 5.6)

Plus 2 new values in the `practitioner_clients.role` CHECK constraint (Lock 5.2).

## Anti-temptation rules carried forward (handoff §6)

1. **AI-CDIO never tracks tasks.** Tasks live in Jira / Asana / Monday. AI-CDIO read-syncs % complete, never writes back.
2. **No status statuses inside statuses.** Initiative has one status. Board commitments have a binary `satisfied`. Anything finer-grained lives in the linked PM tool.
3. **No per-sub-thing assignees.** Executive owner per initiative. Below-that-level lives in the PM tool.
4. **No in-tool comment / discussion threads.** Practitioner-notes exists for fractional's private notes; client-facing discussion lives in Cadence link or PM tool.
5. **Read-sync only at the L2/L3 boundary.** AI-CDIO pulls % complete, last activity, blocked count from Jira to display on the executive dashboard. Never writes into the PM tool.

These rules are tested by every sprint above. The S5 portfolio surface is the biggest risk area for accidental task-tracking creep — call out the boundary in its scoping.

## Process discipline carried forward

Per CLAUDE.md Process Discipline (locked 2026-05-21):

- **`/codex` mandatory on every schema change + every auth change.** S2.5 + S3 + S6 all touch schema. S5 may touch auth (portfolio view scoping). All require `/codex` review before merge.
- **`/plan-eng-review` mandatory on every architecture commit.**
- **`/cso` mandatory on every privacy-sensitive feature.** S6 (Demand Catalog with token-based submitter) is privacy-sensitive.
- **`/review` mandatory before any merge to main.**

## Reviewer concerns (none unresolved at lock time)

All five challenges raised during the review were resolved by the founder via explicit AskUserQuestion responses. No silent decisions remain.

## Next session — what to start with

1. Verify PR #15 deployed correctly (the security hotfix). Test dashboard, step-status, selection-create, audit actions on production.
2. Start S2 substrate fix scoping. `/plan-eng-review` + `/codex` before any code per the discipline.
3. Lock the five open items (scale, roles, weights, security incident def, retro rubric) before S2.5 schema design.
4. Reference this doc + `docs/CODEX-AUDIT-2026-05-21.md` as the operating context.

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 1 | CLEAR | mode: SCOPE_EXPANSION, 3 strategic locks agreed, 5 open items parked, 0 critical gaps |
| Codex Review | `/codex` | Independent 2nd opinion | 2 | CLEAR | 14 audit findings (10 P1) addressed across PR #15 + S2/S2.5/S3 sprint plan |
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 0 | — | per-sprint reviews TBD at scoping time |
| Design Review | `/plan-design-review` | UI/UX gaps | 0 | — | flagged for S4 (Workbench) + S5 (Portfolio) scoping |
| DX Review | `/plan-devex-review` | Developer experience gaps | 0 | — | n/a for end-user product |

- **CODEX:** S1+S1.5 audit caught 4 substrate bugs + 3 real auth/IDOR holes that single-voice review missed. PR #15 closes the 3 auth holes; S2 closes the 4 substrate bugs.
- **CROSS-MODEL:** No outside voice run on this strategic frame (codex already ran twice this session on the implementation layer; a strategic-frame outside-voice would have low marginal value relative to its $1–3 cost).
- **UNRESOLVED:** 0 at lock time. 5 open items parked explicitly with documented defaults.
- **VERDICT:** CEO CLEARED — ready to schedule S2 (substrate fix) once PR #15 merges. Eng review required at S2 scoping per the new `/codex` mandatory-gate discipline.
