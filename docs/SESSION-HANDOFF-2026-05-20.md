# Session Handoff — 2026-05-20

Audit pass + dogfooding cycle + Vercel deploy stabilization. Captures the
state at the end of session for the next agent / session to pick up cold.

---

## What shipped this session

| Commit | Surface | Result |
|---|---|---|
| `08abb3c` (already on main) | `.gitignore` merge-conflict fix | clean |
| `e218a76` (already on main) | **`schema-v19`** drop+recreate of legacy `initiatives` hybrid | initiative-create flow unblocked end-to-end |
| `1d471c9` (already on main) | Design System directive + `.gstack/` ignore | governs all future UI work |
| this commit | **wire-error-details across 6 forms** + audit doc | API errors no longer silently generic |

## Critical unresolved (highest-leverage next move)

### 🔴 `agent_logs` has the same schema-drift bug `initiatives` had

- Old `schema.sql` defines `agent_logs` with `agent_type / model_used / action` NOT NULL
- `schema-v10-agent-logs.sql` `CREATE TABLE IF NOT EXISTS` silently no-ops in prod; its 13 `ALTER ADD COLUMN IF NOT EXISTS` statements layer new columns on top (`agent_name`, `model`, `input_tokens`, …)
- Code writes to the new column names → old NOT NULLs reject every insert
- **`src/lib/observability/agent-logs.ts:94` silently swallows the failure** → user never sees it, telemetry just disappears

**Why this is critical:** Phase 2 Day 37-38 pricing decisions are locked to *"final numbers from Day 19+ cost-per-engagement telemetry"* (`CLAUDE.md` Strategic Decisions). That telemetry has been a black hole since v10 shipped. Until fixed:
- No real cost-per-AI-call data
- No latency or cache-savings data
- Phase 2 pricing decision is blocked

**Fix shape (NOT auto-applied — destructive):** write `schema-v20-agent-logs-replace-legacy.sql` mirroring the `v19` pattern (drop + recreate), then `node scripts/migrate.js src/lib/db/schema-v20-...sql`. Safe because failures were silenced → no real data exists to preserve. **One founder go-ahead + ~5 min of agent time + ~3 sec of migration.**

## UX / IA findings (validating dogfooding intuitions)

| | What | Severity | Maps to queue item |
|---|---|---|---|
| Clients page is real-DB-backed but has **zero management UI** (no archive, status, delete, edit). User's "hardcoded" was a misperception; the actual issue is no actions. | Medium | Customer-mgmt sprint (next priority) |
| **7 opaque section names** in workspace shell (Overview / Dashboard / Charter / Initiatives / Selections / Audits / Cadence) + **3 horizontal nav bars** on every client-scoped page | Medium | Conversational guide + IA rename pass |
| **Dashboard is 721 lines** (`src/app/dashboard/page.tsx`) — multi-chart, multi-tab, kitchen-sink page | Medium | The Today / Inbox screen rework (highest leverage build per last conversation) |
| **In-app milestones competes with PM tools** instead of integrating with them | Medium | Initiative-surface redesign (kill milestones UI, keep initiative strategy view) |
| Charter page is a generated static deliverable (~`src/app/clients/[orgId]/charter/page.tsx`) — internal-name "Charter" stays even on the page title ("Engagement Charter") | Low | Naming pass + jargon-to-CEO translation layer |

## Schema-drift systematic sweep — verdict

Swept every `src/lib/db/schema-v*.sql` against the old `src/lib/db/schema.sql` table list:

| Migration | Creates | Conflict? |
|---|---|---|
| v10-agent-logs | `agent_logs` | 🔴 **conflicts with schema.sql `agent_logs`** — needs v20 |
| v11-initiatives | `initiatives` + `initiative_tokens` | ✅ resolved by v19 |
| v12-selections | `selections` | ✅ clean (no old conflict) |
| v13-network-catalog | `network_catalog_entries` | ✅ clean |
| v14-cadence-and-status | `cadence_tokens`, `status_reports` | ✅ clean |
| v15-mcp-tokens | `mcp_tokens` | ✅ clean |
| v16-audits | `audits` | ✅ clean |
| v17, v18 | no CREATE TABLE | ✅ clean |
| v19-initiatives-replace-legacy | `initiatives` clean recreate | ✅ applied to prod |

Only one more migration needed (v20 for agent_logs).

## Recommended next-session sequence

In order of leverage:

1. **Write + apply schema-v20-agent-logs-replace-legacy.sql** (founder approval needed; ~5 min agent + 3 sec migration). Unblocks telemetry → unblocks Phase 2 pricing decisions.
2. **Customer-management sprint** (1-2 days): add `status` field to organizations, list-view filter + bulk actions, per-client settings page (rename / archive / delete-with-double-confirm).
3. **Today / Inbox screen + Conversational guide v0** (per last conversation's strategic-cadence framing). The single highest-leverage product surface remaining — what makes AI-CDIO a daily-use tool rather than a quarterly-assessment tool. Scoped at `docs/PLAN-cross-mapping-engine.md` is one part of this; a separate `docs/PLAN-today-screen.md` should be scoped before building.
4. **Initiative surface redesign** (1-2 days): kill the in-app milestones block, replace with the strategic-status view (Goal / Anchor / Decision Package / Board commitment / Linked execution tool URL).
5. **Cross-mapping engine** (3.5 weeks; mandatory `/plan-eng-review` first per task #10): the cited-construct equivalence engine. Earlier scope at `docs/PLAN-cross-mapping-engine.md`.

## What's auto-fixed in this commit

- 6 client components now surface real API error details:
  - `src/app/clients/[orgId]/initiatives/[id]/step-buttons.tsx`
  - `src/app/clients/[orgId]/selections/new/form-client.tsx`
  - `src/components/delete-sandbox-org-button.tsx`
  - `src/components/reset-assessment-button.tsx`
  - `src/components/resolve-decision-form.tsx`
  - `src/components/stakeholder-row-actions.tsx`
- Migration script: `scripts/wire-error-details.js` (idempotent, one-shot)

## Bootstrap for the next session

```bash
# from C:\Users\Dell\projects\CDIO\app on main
git pull
cat docs/SESSION-HANDOFF-2026-05-20.md     # this file
# pick from the "Recommended next-session sequence" above
```

The cross-mapping engine plan + IT Manager persona + pricing proposal + design directive are all already in main from prior commits. Strategic decisions are intact in `CLAUDE.md` + `docs/STRATEGY-2026.md`.

## Open task list

| # | Status | What |
|---|---|---|
| #10 | pending | Run `/plan-eng-review` on `docs/PLAN-cross-mapping-engine.md` before any cross-mapping engine code |
| (new) | pending | Write + apply `schema-v20-agent-logs-replace-legacy.sql` (founder approval needed; unblocks telemetry) |
| (new) | pending | Customer-management sprint |
| (new) | pending | Scope `docs/PLAN-today-screen.md` |
| (new) | pending | Initiative-surface redesign (kill in-app milestones; add strategic-status view + linked PM tool URL) |
