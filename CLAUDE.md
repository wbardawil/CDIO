@AGENTS.md

# CLAUDE.md — AI-CDIO Project Context

## ⛔ CLIENT CONFIDENTIALITY — ABSOLUTE, NON-NEGOTIABLE RULE (read before anything else)

Real client / customer / engagement information that the founder shares to
inform design, validate the tool, or stress-test a feature is **in-session
reasoning context ONLY**. It MUST NEVER be persisted into any artifact:

- NOT in code, comments, type definitions, or example/placeholder/UI copy
- NOT in agent prompts, seed / demo / fixture / test data
- NOT in documentation (any `.md` file), commit messages, or branch names
- NOT in logs, screenshots committed to the repo, or anything that lands in git

Every example in code or docs MUST be **invented and obviously fictional**.
Never name, paraphrase, or make identifiable a real client, vendor, tool,
person, deal, price, or situation the founder described. When in doubt, treat
it as confidential and write a generic placeholder instead.

This rule is permanent. It applies to every session, every agent, forever.
A confidentiality breach is the single most serious failure in this project —
it is worse than shipping no feature at all. If a prior session violated this,
scrub the contamination immediately (code + docs + flag commit history) before
doing anything else.

(2026-05-13: this rule was added after client-engagement details shared
verbally for design input were wrongly written into UI placeholders, docs, and
commit messages. They were scrubbed from the working tree; the standing rule
exists so it never recurs.)

## Read First

Before doing ANY work in this repo, read these in order:

1. `docs/STRATEGY-2026.md` — The contract: 4 outcome pillars, architectural laws, scope, process discipline. Refreshed 2026-05-07.
2. `docs/SESSION_HANDOFF.md` — Where we are, what's next, Day 11 architectural decisions.
3. `docs/ROADMAP.md` — Build order and current sprint (Phase 1C-1.5-1D-2-2.5).
4. `docs/ARCHITECTURE.md` — Multi-corpus RAG, tenant isolation P0, single-agent default + multi-agent tier matrix, Phase 1D engine schemas.
5. `docs/OUTCOMES.md` — Founder's weekly outcome log (verification surface for Day 90 kill switch).
6. `docs/PRODUCT.md` — What the product is (and isn't).
7. `docs/GAPS.md` — P0 ship-blockers, P1 high, P2 medium.
8. `docs/CONTRACT-TEMPLATES.md` — PM covenant + vendor/contractor access language (Phase 2 Day 30 attorney review).

The strategic plan (deeper context) lives at: `C:/Users/Dell/.claude/plans/curious-wibbling-raccoon.md`

## Sibling Frameworks (locked 2026-05-07)

The founder maintains two sibling frameworks at the OS level. Both are MIT-licensed and locally available:

- **gstack** at `~/.claude/skills/gstack/` (also cloned at `C:/Users/Dell/projects/gstack/`) — Garry Tan's Claude Code skill collection. 23 specialist roles + 8 power tools as slash commands. **Used as build-process discipline** (mandatory gates — see Process Discipline section below). NOT embedded in the AI-CDIO product. Source: github.com/garrytan/gstack (founder's fork: github.com/wbardawil/gstack).
- **gsd-2** at `C:/Users/Dell/projects/gsd-2/` — Standalone CLI for autonomous AI coding agents built on the Pi SDK. **Used as architectural reference and pattern source.** Patterns already adopted in AI-CDIO: single-writer state engine, fresh-context-per-task, durable state, worktree isolation. Runtime integration decision deferred to Phase 2.5 Day 38 gate. Source: github.com/gsd-build/gsd-2 (founder's fork: github.com/wbardawil/gsd-2).

See `docs/STRATEGY-2026.md` Architectural Lineage section for the strategic framing; `docs/ARCHITECTURE.md` Architectural Lineage section for the technical details.

## What This Project Is

AI-CDIO — the **Executive Operating System for technology leadership**. The 30-file CDIO playbook (in sibling directory `../CSIO - Playbook/`) becomes interactive engines that produce board-defensible deliverables.

**Who it is for (locked 2026-05-19 — expanded from "fractional only"):** the same methodology + platform serves anyone running the technology-leadership function for a mid-market organisation:

- **Fractional CDIOs / CIOs / CTOs** — scale their practice to 4–6 clients without methodology collapse
- **Full-time CIOs** at mid-market companies — systematize the function, run a defensible board cadence, prove tech ROI to CEO/CFO/board
- **IT Directors** at mid-market companies (with or without a CIO above them) — operate to executive-level methodology, punch above weight in board conversations
- **Operational CTOs** (mid-market CTO ≈ head-of-IT, not head-of-engineering at a product company) — same use case as the CIO above

The product produces the same artifacts (maturity baseline, Decision Packages, AI roadmap, status reports) regardless of which persona is the seat holder. What differs is the **buyer motion** (see Strategic Decisions below): services-led for fractionals selling engagements to CEOs; product-led for in-house executives buying the platform as their own toolkit.

**Customer #0 = the founder** (fractional CDIO practice). Every feature is validated against his real fractional engagements first. In-house-executive personas are validated in parallel as the platform matures.

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

### Strategic Decisions Already Made (refreshed 2026-05-07 evening)
- **Path B confirmed (expanded 2026-05-19):** Executive OS for technology leadership — used by fractional CDIOs/CIOs/CTOs (founder's primary persona), full-time CIOs at mid-market companies, IT Directors, and operational CTOs. Customer #0 = founder (fractional). Same methodology + artifacts across all personas; the **buyer motion differs**: services-led (fractional sells a 90-day engagement to a CEO) vs product-led (in-house exec buys the platform as their own toolkit). Both motions launch in parallel from Phase 3 commercial release.
- **Year 1 audience = the founder's CEO clients via him; Year 2+ audience = other fractionals (locked 2026-05-07 evening).** Founder uses platform on <anchor client> + 1-2 more REAL clients of his own fractional practice. Other fractionals come Phase 3 commercial release once his practice maxes out.
- **The Differentiated Promise is CEO-facing:** "Three things change when I'm your fractional CDIO. Your board stops asking the same tech questions twice. Bad tech bets die before they cost you money. AI moves from board talk to real rollout in 90 days." See `docs/STRATEGY-2026.md`.
- **The 90-Day Commitment Matrix locks the contract backbone:** Day 14 maturity baseline → Day 21 Decision Packages resolved → Day 30 AI roadmap → Day 45 first initiative launched (outcome-driven, not category-limited) → Day 60 second initiative + Status Report + Cadence → Day 90 maturity lift + ROI + AI initiative shipped.
- **Better / cheaper / faster:** 5x faster + 1/5th the cost of full-time CDIO + better proof than any consultant slide deck.
- **Quick Win Stack = Modules 5 + 12 + 15 (final lock 2026-05-07 — `9f3a2a6` leads).** The Day 11 evening rough draft proposed re-sequencing around AI + Data + Security; that re-sequencing was reversed in the final lock per the user's directive that commit `9f3a2a6` leads on logic and scope. Module 5 ✅ Day 8; Module 12 ✅ Day 12 (`f595bfc`); Module 15 next at Day 13. AI Accelerator stays in Phase 2.5 (Days 39-50, full 12-day plan); the AI-as-buy-trigger thesis still holds — just lands at Day 50, not Day 16.
- **Outcomes-led strategy (Day 11 rewrite):** four pillars — higher project success, higher tech ROI, monthly strategy alignment, helping CEOs build moats. Each anchored in 2025-2026 research from McKinsey/BCG/KPMG/WEF/Gartner.
- **Pillar 4 AI claim boundary:** AI-CDIO does not build AI; it catches the seven decision-phase failures that cause ~70% of AI initiatives to die before they deliver value.
- **Command-center reframe:** the platform is the strategic heartbeat (charter, decisions, oversight, value tracking, re-assessment); tactical task management lives in the client's existing tools (Jira, Asana, Monday) via read-sync.
- **Methodology FULL on every tier:** no feature-gating of AI Accelerator. Tiers differentiate by scale (clients, practitioners) and compute mechanism only. Mechanism 1 (allowance + metered overage) for Starter; Mechanism 2 (BYOK) for Growth + Scale. Final pricing locked at Phase 2 Day 37-38 based on Day 19 cost telemetry.
- **Day 90 kill switch criterion revised (locked 2026-05-07 evening):** Year 1 metric is CEO outcomes delivered (`docs/OUTCOMES.md`), not paying-customer count from fractionals. Paying-customer count is a Year 2 metric.
- **Phase 1D scope (Days 21-28):** Charter → Initiative Pilot → Selection Engine (Tech + Partner) + Network Catalog → Cadence → Status Reports → MCP + integrations.
- **Phase 2 reframed (locked 2026-05-07 evening):** founder dogfoods on <anchor client> + 1-2 more real clients; Modules 12, 15, 2 deep passes happen here; Quick Scan upgrade lands here; CEO-facing asset library built. **No design partner pilots in Year 1.**
- **Phase 2.5 stays full 12 days (Days 39-50, per `9f3a2a6` final lock):** AI Maturity Model + Use-Case Library + Roadmap Generator + AI-flavored Selection Engine pass (extends Phase 1D Day 24 generic Selection Engine via `domain: "tech" | "ai"` parameter — no standalone Build-vs-Buy Advisor) + Governance Scaffolding + AI deliverable surfacing + Public `/ai-readiness` Quick Scan + Quarterly re-assessment cadence wiring.
- **Phase 3 reframed (locked 2026-05-07 evening):** opens to other fractionals (commercial release). Stripe + first paying fractional customers + design partner pilots.
- **Architectural laws (8) locked:** see `docs/STRATEGY-2026.md` Architectural Laws section.
- **Network Catalog privacy P0:** per-practitioner only, encrypted, no cross-practitioner aggregates Year 1.
- **gsd-2 runtime integration deferred** to Phase 2.5 Day 38 decision gate.
- **gstack skills are mandatory gates** going forward (see Process Discipline section above).
- **5-level maturity scale** (Initial → Optimizing) — Module 5 deep-pass shipped Day 8.
- **Multi-tenancy via practitioner → clients hierarchy:** N:N schema (already in place); UI defaults to single-owner display.
- **Auth via Clerk:** wired Day 1.
- **Rate limiting via Upstash Redis:** Day 5 (env vars pending).
- **Methodology = defensibility bar, NOT verbatim (locked 2026-05-19):** the 128 diagnostic questions are being rebuilt so each maps to a specific named construct in a recognized authoritative source. This supersedes the `96dd36a`/`1127291` verbatim-from-playbook directive (sanctioned, reason: verbatim is only 30% defensible). Founder ratifies per module — never self-certify. Full decision in Current Sprint § "LOCKED DECISION (2026-05-19)".

## Current Sprint (2026-05-19 — methodology bank REBUILT and SHIPPED on branch `claude/loving-tesla-b61c25`)

Per `docs/ROADMAP.md`. Phase 1A-1B complete. Phase 1C Days 8-12 complete (Module 5 deep + narrative + decision packages + outcomes-led strategy rewrite + module renames + AI leverage roadmap + Day 11 doc-lock + Day 12 Module 12 deep shipped at `f595bfc`).

**Defensibility-bar rebuild SHIPPED (2026-05-19, branch above; PR/merge pending founder go-ahead).** All 16 modules ratified to the defensibility bar (locked decision below). Bank: **124 strong / 4 weak / 0 indefensible** (was 38/81/9). Step C-2 product-wiring done (`diagnostic-questions.ts` now surfaces authoritative named-construct citations through `cite(id)` instead of the generic "AI-CDIO Source Playbook" label). 5 modules (M2, M5, M8, M10, M12, M13 — the live-engagement triad + the worst two) human-ratified at AskUserQuestion gates; the remaining 11 ratified autonomously under explicit founder "allow all for this job" authorization, recorded as async-review-pending in `scripts/ratified-modules.json`. Honest scorecard: `docs/QUESTION-REVIEW.md` (one-page, GitHub-readable). Remaining founder-judgment items captured in `TODOS.md` §3 (4 one-line rewordings + M5 RECOVER decision + async review of autonomous ratifications).

**Day 13 note — RESOLVED (2026-05-19).** The old "Module 15 deep — bespoke
framework questions" task is closed. History: Module 15 deep was built
(`b6cf3a0`), then ALL 16 modules were reverted to verbatim-from-source-playbook
(`1127291`→`aa8e42a`→`96dd36a`: "no hallucination, only signal questions").
That verbatim revert is **now itself superseded** — see the locked decision
below. Stale instruction, retained for history only, do NOT action:
> ~~1. Run /plan-eng-review on Module 15 deep scope~~
> ~~2. Module 15 deep — 12-15 bespoke APQC/Lean questions, replicate M5/M12~~

### 🔒 LOCKED DECISION (2026-05-19) — Rebuild 128 questions to the DEFENSIBILITY BAR

This **deliberately supersedes the `96dd36a`/`1127291` "verbatim-from-source-
playbook" directive.** It is a sanctioned founder decision, **not** a
reversal-mistake. The reason changed, not the discipline: strict external-
source validation (`docs/STANDARDS-VALIDATION.md` v2.0) proved the verbatim
playbook is only **30% defensible** (38 strong / 81 weak / 9 indefensible).
Technical solidity now beats verbatim fidelity.

**The bar:** every one of the 128 questions must map to a SPECIFIC NAMED
construct in a recognized authoritative source. Public + fetch-verified where
the source is public; a PRECISE standard-clause citation where the canonical
source is paywalled (ITIL/CMMI/ISO/SAFe allowed **only** if cited to the named
clause, not just a framework name). Only "no named construct" fails the gate.

**Method (fix-mode, not from zero — the diagnosis already exists):** 38 strong
→ keep + formalize citation; ~81 weak → re-anchor to the named construct in
`src/lib/playbook/question-citations.ts` (or better), tighten wording only
where needed; 9 indefensible → re-derive from the authoritative source. Keep
16 modules, ≥8 questions/module.

**Founder-gated, per module — NEVER self-certify.** Self-certification is the
exact failure this effort exists to kill. The founder ratifies each module's
mapping before the next; automation enforces metadata integrity only
(`scripts/build-question-citations.js` + `scripts/validate-citations.js`, now
on the defensibility bar — verbatim-fidelity is citation-aware, no longer a
hard verbatim block, because questions are intentionally no longer verbatim).
Sequence: (1) M12, M13, M2 — the live vendor-selection engagement runs through
these; (2) M8, M10, M7, M11, M14, M15 — worst-first; (3) the rest. Reference:
this directive + the gstack learning
`questions-rebuild-to-defensibility-bar-SUPERSEDES-verbatim` (confidence 10).

**SHIPPED (2026-05-19, on branch `claude/loving-tesla-b61c25`) — what the rebuild already covers from the old Day-14-17 plan:**
- ✅ **Module 2 deep** — fully ratified at all-strong on COBIT 2019 APO02/APO05.01/APO02.06 + Henderson&Venkatraman SAM + Balanced Scorecard + COBIT EDM01 + MEA01. Replaces the old "KPMG 4-Practice + MIT" plan (KPMG 4-Practice was marketing, not tier-1 research; demoted).
- ✅ **Framework citations layer** — all 16 modules cited to specific named constructs (`docs/QUESTION-REVIEW.md`), and the product UI now displays them through `cite(id)` (Step C-2 shipped). Bank: 124 strong / 4 weak / 0 indefensible.

**Still to do (separate workstreams, NOT done in this rebuild):**
- **Quick Scan output upgrade** — board-memo-quality output (no AI lens — that lands Phase 2.5). Not part of the rebuild.
- **Adaptive questioning** for the assessment flow (skip-pattern logic, role-aware filtering refinements). Not part of the rebuild.
- **Jargon → CEO-language translation** layer — render the technical named-construct text into CEO-friendly phrasing in the UI. Not part of the rebuild; could be a thin presentation-layer pass.
- **Founder-judgment fast-follows** from the rebuild — see `TODOS.md` §3 (4 one-line weak rewordings + M5 RECOVER decision + async review of the 11 autonomous module ratifications).
- **Merge the branch to main** when the founder gives the go-ahead.

**Done with Phase 1C = Quick Win Stack (Modules 5 + 12 + 15) is fully demo-quality, role-aware, N/A-safe, framework-cited. Module 2 deep ships Pillar 3 (alignment). Founder can run a full 5+12+15 Quick Win engagement on <anchor client> end-to-end. AI Accelerator + buy-trigger remain in Phase 2.5 (Days 39-50, full 12-day plan).**

## Process Discipline — gstack as MANDATORY GATES (locked 2026-05-07)

gstack is installed at `~/.claude/skills/gstack/`. **Going forward, gstack skills are mandatory gates, not optional polish.** Days 1-11 under-used these skills; the Day 11 outcomes-led strategic pivot was done manually when `/plan-ceo-review` would have surfaced the same conclusions in one command. We don't repeat that mistake.

### Mandatory gates by scenario

- **Before any architecture commit:** `/plan-eng-review` — surface hidden assumptions, lock data flow + state machines + edge cases
- **Before any scope change:** `/plan-ceo-review` — outcome-led / scope-expansion challenge in one command
- **Before any privacy-sensitive feature:** `/cso` — OWASP + STRIDE security audit (Network Catalog Day 25 is non-negotiable)
- **For independent second opinions on architectural calls:** `/codex` — OpenAI Codex CLI reviews same code/plan
- **At start of any new phase:** `/autoplan` — runs CEO + Design + Eng reviews chained automatically
- **Before any merge to main:** `/review` — catches production bugs that pass CI
- **Before any deploy:** `/qa` — real browser, real clicks, regression tests auto-generated
- **After major commits:** `/learn` — captures patterns for Phase 4 Knowledge Reuse panel
- **Weekly:** `/retro` — engineering retrospective with per-person breakdown

### Non-negotiable phase gates

- **Before Phase 1D Day 21 (Charter Generator):** run `/plan-eng-review` on the entire Phase 1D scope (Initiative Pilot + Selection Engine + Network Catalog)
- **Before Phase 1D Day 25 (Network Catalog):** run `/cso` on the privacy + tenant-isolation model
- **Before Phase 1.5 Day 18 (production deploy):** run `/cso` on the production attack surface
- **Before Phase 2.5 Day 39 (AI Accelerator):** run `/autoplan` on the full Phase 2.5 scope and `/codex` on the multi-agent architecture decision

**Browser automation:** never use `mcp__claude-in-chrome__*` tools — use `/browse` from gstack instead.

**Cost of skipping:** skipping gates is a false economy. Each gate adds 5-15 minutes of agent runtime; the cost of NOT skipping is measured in re-work. The Day 11 strategic pivot would have cost zero re-work if `/plan-ceo-review` had run on Day 6.

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
