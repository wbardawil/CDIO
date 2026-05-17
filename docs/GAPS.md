# AI-CDIO: Gap Analysis

> **Refreshed:** 2026-04-29 (Day 6 of Phase 1, end of Phase 1B Day 6). **MECE rewrite applied:** legal foundation moved into Phase 1.5 (no public deploy without ToS/Privacy/AI Disclaimer); cost telemetry added Day 19; AI lens removed from Phase 1C and absorbed into Phase 2.5; pricing & packaging design slotted into Phase 2 Days 35-38; account & billing settings UI added before Phase 3 Stripe; data migration plan for question banks called out in Phase 1C; Day 90 metrics dashboard added Phase 3; onboarding email sequence + help docs added Phase 2.

## Priority Tiers

- **P0 (Tier 0)** — Existential. Blocks any usage with real client data.
- **P1 (High)** — Required for paying customers + methodology depth.
- **P2 (Medium)** — Required to scale beyond founder + first 10 customers.
- **P3 (Low)** — Quality of life.

---

## P0 — Foundation (status as of Day 3)

| # | Gap | Status | Closed by |
|---|-----|--------|-----------|
| P0-1 | No authentication (Clerk) | ✅ **CLOSED** | Day 1, commit `a304e01` |
| P0-2 | API routes accept arbitrary `org_id` (IDOR) | ✅ **CLOSED** | Day 2, commit `0a2e922` (assertPractitionerOwnsOrg) |
| P0-3 | `assessment_token` returned in dashboard response | ✅ **CLOSED** | Already-stripped from `/api/dashboard/[orgId]` SELECT (verified Day 5) |
| P0-4 | No rate limiting on `/api/chat`, `/api/assessments` | ⏸ Pending Upstash creds | Phase 1B Day 5/6 |
| P0-5 | No practitioner workspace (multi-client) | ✅ **CLOSED** | Day 2 schema + Day 3 UI |
| P0-6 | Synthesis uses `delete-then-insert` without transaction | ✅ **CLOSED** | Day 5, schema-v6 stored procedure `replace_assessment_synthesis` (atomic) |
| P0-7 | `conversations` table missing on fresh deploys | ✅ **CLOSED** | Schema-v2 already applied; documented |
| P0-8 | Service-role client bypasses RLS in API routes | ⚠ Mitigated — Phase 4 to fully close | TS-layer enforcement via assertPractitionerOwnsOrg works today; RLS policies pre-wired for Day 30+ |

**Phase 1A closed 4 of 8 P0 items. Phase 1B Day 5 closes P0-3 + P0-6 (this commit). P0-4 closes when Upstash creds land. P0-8 stays mitigated until per-user JWT.**

**As of this commit: 6 of 8 P0 items fully closed, 1 mitigated, 1 pending creds.**

---

## P1 — First Real Engines + Methodology Depth (Phase 1C-1D)

| # | Gap | Why High | Effort | Phase |
|---|-----|----------|--------|-------|
| P1-1 | **Methodology depth (level-5 indicators, framework citations, narrative scoring)** for Module 5 + 12 + 15 | The app underseels the playbook today; this is the perceived-value gap | 7 days | **1C — Days 8-14** |
| P1-1b | **Role/area question-level segmentation + universal N/A escape (per-module + per-question) + thin-coverage warning** | Today CEO and CTO answer the same questions inside a module — methodologically wrong. N/A as missing-data (not score 1) is required to keep synthesis honest. Thin-coverage warning surfaces engagement gaps to the practitioner. | included in P1-1 (no extra days) | **1C — Days 8-13** (built alongside Module 5/12/15 depth rewrite) |
| P1-15 | **Production deploy: Vercel + custom domain + verified email domain (L3) + legal foundation + cost telemetry** | Methodology depth must ship INTO production, not into a localhost shell. Real Ambar exec emails need a verified-domain sender. App cannot be public without ToS/Privacy/AI Disclaimer (closes 12-day exposure window the previous plan had). Cost-per-engagement telemetry from Day 1 of public exposure (required for Phase 3 pricing decisions). | 3 days | **Phase 1.5 — Days 18-20** |
| P1-16 | **AI Accelerator Engine** (12 days, expanded from 10) — AI Maturity Model, AI Use-Case Library, AI Roadmap Generator, Build-vs-Buy Advisor, Governance Scaffolding (extends Phase 1C citations layer), AI deliverable surfacing (uses Phase 1D extension points — no rebuild), Public `/ai-readiness` Quick Scan with real destination, Quarterly re-assessment cadence wiring | The buy-trigger for practitioners. See `docs/STRATEGY-2026.md` AI-as-buy-trigger thesis. Expanded to 12 days because the original 10-day estimate for 12 deliverables was aggressive. | 12 days | **Phase 2.5 — Days 39-50** |
| ~~P1-17~~ | ~~AI lens on Quick Scan in Phase 1C~~ — **REMOVED in MECE rewrite.** Don't tease a feature that won't exist for 23 days. Absorbed into Phase 2.5 Day 49 alongside `/ai-readiness` (the destination it funnels to). | — | — | — |
| P1-18 | **Legal foundation** — Terms of Service + Privacy Policy + AI Disclaimer pages live, signup gated on acceptance, cookie consent banner. Use Termly/Iubenda templates initially; full attorney review in Phase 2 Day 30. | App cannot be public without basic legal docs. Closes 12-day exposure window from previous plan. | 1 day | **Phase 1.5 — Day 20** |
| P1-19 | **Pricing & Packaging design** — three-tier feature matrix locked on paper before Phase 3 Stripe build. Starter $199 (Quick Scan + Assessment + Decision Package + Status Reports); Growth $399 (+ Cadence + MCP + AI Accelerator); Scale $599 (+ unlimited clients + Value Tracker + capacity planner). | Stripe integration in Phase 3 cannot ship without the design existing. The previous plan assumed prices but never specified what's IN each tier. | 3 days | **Phase 2 — Days 35-38** |
| P1-20 | **Data migration plan for question-bank rewrite** — when Module 5/12/15 banks are rewritten Days 8-13, existing assessment responses (Ambar in-progress, TestCo completed) need a documented migration path: preserve as legacy, discard and re-prompt, or machine-map old→new. Decision required Day 8 before rewriting starts. | Without a plan, existing real assessment data may be silently invalidated or duplicated. | 0.5 day (decision + execution) | **Phase 1C — Day 8** |
| P1-21 | **Cost-per-engagement telemetry** — wire `agent_logs` table to track token counts × model × org_id for every LLM call. Required for Phase 3 pricing decisions to be evidence-based. | Pricing $199/$399/$599 without knowing actual cost-per-client = guessing unit economics. | 0.5 day | **Phase 1.5 — Day 19** |
| P1-22 | **Day 90 metrics dashboard** — internal-only `/admin/metrics` showing: paying customer count + MRR + founder daily-use streak + average hours saved per client per month. Auto-tracked, not manually counted. | Day 90 kill-switch review is required by strategy; metrics that drive it must exist on the platform. | 1 day | **Phase 3 — Day 59** |
| P1-23 | **Onboarding email sequence + Help/Docs** — 5-email welcome series triggered on signup; help center at `/help` with getting-started guide + Quick Win Stack walkthrough + per-engine videos + FAQ. | Design partners onboarded Days 35-38 must self-serve. Founder cannot be the bottleneck for 5 simultaneous pilots. | 2 days | **Phase 2 — Days 31-33** |
| P1-24 | **Account & Billing Settings UI** — `/settings` with tabs: Profile, Plan, Billing (payment method, invoices), Notifications. Built BEFORE Stripe so the destination exists when subscriptions go live. | Cannot ship Stripe without an account-settings surface for practitioners to manage their subscription. | 2 days | **Phase 3 — Days 51-53** (BEFORE Stripe in 54-58) |
| P1-2 | **Decision Package surfacing** as standalone artifact in workspace | The "what should I do" output that wins prospects | 1 day | 1C — Day 11 |
| P1-3 | Quick Scan output upgrade — board-memo quality (cited, narrative, 3 named quick wins, projected ROI) | Sales-conversion engine | 2 days | 1C — Days 14-15 |
| P1-4 | Framework citations layer — every score links to NIST/CMMI/TOGAF/etc. | Methodology authority visible everywhere | 2 days | 1C — Days 16-17 |
| P1-5 | Status Report Generator (Engine #2) | 90 min → 12 min savings per client per month | 4 days | **1D — Days 18-21** |
| P1-6 | Engagement Cadence (shareable read-only) | Practitioner-as-trusted-partner differentiator | 3 days | 1D — Days 22-24 |
| P1-7 | MCP Server foundation (auth + tool registry + first 3 tools) | Distribution: practitioners use AI surfaces they already trust | 1 day | 1D — Day 25 |
| P1-8 | Stakeholder edit UI + email send (Resend) | Closes manual-SQL-edit workaround the founder hit during dogfood | 2 days | ✅ **CLOSED Day 4** (`a95c829`) |
| P1-9 | Sentry + Langfuse | Cannot see when AI gives bad advice | 1 day | 1B — Day 6 (pending creds) |
| P1-10 | Roadmap engine to 100% (financial models, dependencies, governance section) | Closes the 25% gap | 4 days | Phase 4 — Days 91-120 |
| P1-11 | Anthropic prompt caching (system prompt + RAG context) | -70% input tokens; required for unit economics | 1 day | Phase 2 — Day 28 |
| P1-12 | Terms of Service + Privacy Policy + AI disclaimer (legal review) | Required before any non-founder user | $2-5K legal | Phase 2 — Day 30 |
| P1-13 | Bridge chat `implicit_scores` → `module_scores` | "Chat-first" promise broken until bridged | 1 day | Phase 2 — Day 28 |
| P1-14 | Action cards invalidate on resynthesis | Stale advice forever | 0.5 day | Phase 2 — Day 29 |

---

## P1 — Audit evidence ingestion (added 2026-05-17, branch `claude/review-cdio-handoff-4bR8R`)

The Audit now ingests evidence in bulk, grades against the methodology,
and emits an audit-ready initiative. Open gaps from that slice:

| # | Gap | Why it matters | Effort | When |
|---|-----|----------------|--------|------|
| P1-25 | **Extraction + grading quality unproven** — never run against a real proposal/transcript. Faithful option separation, verbatim money, "not_found" honesty, and real (not generic) best-practice gaps are asserted, not validated. | This is the core thesis. If extraction hallucinates, the verdict a CEO acts on is poisoned. | Founder runs 1 real decision | **NEXT GATE** |
| P1-26 | **`audit-evidence` Storage bucket dependency** — created lazily by the service role; if it can't (perms/policy), originals silently aren't archived. Bucket must exist + be private + service-role-writable. | "Store the originals" (founder decision) is best-effort until verified. Go-live item alongside v10–v15. | 0.25 day (verify) | Go-live |
| P1-27 | **Vercel ~4.5 MB request-body limit** — bulk upload honestly capped at ~4 MB; large real proposals must use per-option attach. Proper fix = browser → storage presigned upload (bypasses the function body). | A 6 MB PDF "just fails" without the presigned path; per-option is the workaround, not the fix. | 1.5 days | Post-validation |
| P1-28 | **Legacy `.doc/.xls/.ppt` not auto-read** — actionable convert message only (maintained pure-JS readers are unmaintained or carry advisories). | Some client evidence is legacy Office; user must Save-As. Acceptable v1, revisit if real files demand it. | 1 day (if needed) | If demanded |
| P1-29 | **No signed-URL download** of archived originals from the audit screen — paths are stored, not yet retrievable in-UI. | Audit trail is captured but not browsable; reconstructing means going to Supabase directly. | 0.5 day | Post-validation |
| P1-30 | **At-rest encryption of archived client documents** — `audit-evidence` holds proposals, quotes, SOWs, contracts and transcripts at only Supabase's default at-rest encryption. The architecture mandates column-level encryption beyond default for the comparably-sensitive Network Catalog; archived client docs were not held to that bar. | These are among the most confidential artifacts in the product. Founder decision 2026-05-17: **document + schedule** (keep best-effort archival, harden before real-client use). Must be closed before evidence-in is used on a live client engagement. | 1-2 days | Before real-client dogfood |
| P1-31 | **`audit-evidence` Storage RLS + service-role-off-route** — bucket has no RLS policy (path-namespaced only) and is written by the service role from an API route. Extends P0-8 to Storage. | Path-namespacing is not tenant enforcement; a bug in path construction = cross-tenant document exposure. Folded into the Day-30 service-role→RLS migration scope (ARCHITECTURE Multi-Tenancy). | 0.5 day (with Day-30 work) | Phase 2 Day 30 |

---

## P2 — Scale + Polish (Phase 3 + early 4)

| # | Gap | Why Medium | Effort |
|---|-----|-----------|--------|
| P2-1 | Stripe billing + subscription management | Cannot charge without it | 12h |
| P2-2 | Vercel production deploy + custom domain | First public URL | 4h |
| P2-3 | Synthesis to background jobs (Inngest or QStash) | Times out on Vercel; runaway cost | 12h |
| P2-4 | QBR Deck Generator (Engine #4) | Quarterly deliverable, highest time-saved per use | 24h |
| P2-5 | Value/ROI Tracker (Engine #3) — commit→deliver→prove | Differentiator vs every consulting tool | 16h |
| P2-6 | Templates Library (charters, vendor playbook, M&A DD, risk register) | Long-tail repeatable artifacts | Ongoing |
| P2-7 | Document/image evidence upload + AI Vision analysis | Growth tier feature | 24h |
| P2-8 | Module-level improvement chat | Starter+ tier feature | 16h |
| P2-9 | Engagement Lifecycle (Phase 1→2→3 progression UI) | Drives upgrades and renewals | 12h |
| P2-10 | Customize stakeholder modules per-engagement (override role default) | Promised in dogfood feedback | 4h |
| P2-1a | **Test/Real architectural primitive — `is_sandbox` load-bearing across all surfaces** (workspace banner, assessment-page banner, email-routing safety, sandbox-only delete-org, AI output tone) + auto-default any orphan org (no `practitioner_clients` mapping) to Test | Today only the portfolio badge differs — easy to accidentally email a real person from a half-built test flow. Architecture promotes the Test/Real binary to a first-class concept. | 0.5 day | **1B — Day 7** |
| P2-11 | Output guardrail for security-domain AI advice | Liability mitigation | 6h |
| P2-12 | Strip diagnostic questions out of system prompt | Prevent IP extraction | 8h |
| P2-13 | Bridge `session_id` → `clerk_user_id` (claim flow) | Conversation memory across sessions | 6h |
| P2-14 | Response caching (24h hash on user message + context) | -30-50% LLM calls | 6h |
| P2-15 | Audit log surfaced in `agent_logs` table | SOC2 / compliance prep | 4h |

---

## P3 — Polish (Phase 4-5)

- Mobile-optimized chat + assessment forms
- Dark mode (system-aware, properly designed)
- Multi-language support (Spanish first if Latin American demand)
- GDPR data residency options
- Annual pricing option (20% discount)
- Referral program mechanics (Cello.so or built-in)
- MSP partner onboarding kit
- Co-branded client portal (replaces Cadence Share for some uses)
- White-label for MSPs
- Public API for partners
- Mobile app

---

## Summary by Status

| Status | Count |
|---|---|
| ✅ Closed | 8 (P0-1, P0-2, P0-3, P0-5, P0-6, P0-7, P1-8, plus the Sandbox bonus) |
| ⚠ Mitigated | 1 (P0-8) |
| ⏸ Pending creds | 2 (P0-4 Upstash, P1-9 Sentry+Langfuse) |
| ⏳ Open in Phase 1C (Days 8-17) | 4 (P1-1 through P1-4) |
| ⏳ Open in Phase 1D (Days 18-25) | 3 (P1-5, P1-6, P1-7) |
| ⏳ Open in Phase 2 (Days 26-35) | 4 (P1-11, P1-12, P1-13, P1-14) |
| ⏳ Open in Phase 3 (Days 36-60) | 7 (P2-1, P2-2, P2-3, P2-5, P2-10, P2-15, etc.) |
| ⏳ Open in Phase 4+ (Days 61-180) | 12+ (P1-10, P2-4, P2-6 through P2-14, all P3) |

---

## What This Means for Build Order (post-MECE rewrite)

1. **Phase 1B (Days 4-7):** P0-3, P0-4, P0-6, P1-8, P1-9, **P2-1a (Test/Real primitive — Day 7)** — close remaining safety + practitioner-ops friction
2. **Phase 1C (Days 8-17):** P1-1, **P1-1b (role/area segmentation + N/A)**, **P1-20 (data migration plan, Day 8)**, P1-2, P1-3, P1-4 — methodology depth (no AI lens — that landed in 2.5 alongside its destination)
3. **Phase 1.5 (Days 18-20):** **P1-15 (deploy L3) + P1-18 (legal foundation) + P1-21 (cost telemetry)** — methodology depth ships INTO production, with legal scaffolding and unit-economics telemetry
4. **Phase 1D (Days 21-28):** P1-5, P1-6, P1-7 — recurring deliverables + MCP, **all designed with extension points for Phase 2.5**
5. **Phase 2 (Days 29-38):** P1-11 (caching), P1-12 (legal review), P1-13, P1-14, P2-2, **P1-19 (pricing design Days 35-38), P1-23 (onboarding emails + help docs)** — validation prep + first pilots
6. **Phase 2.5 (Days 39-50):** **P1-16 (AI Accelerator Engine, 12 days)** — the buy-trigger flagship engine, plugs into Phase 1D extension points
7. **Phase 3 (Days 51-75):** **P1-24 (account & billing UI Days 51-53 — BEFORE Stripe), P2-1 (Stripe Days 54-58), P1-22 (Day 90 metrics dashboard)**, P2-3, P2-5 — monetization
8. **Phase 4+ (Days 76-180):** everything else, demand-driven; Day 90 review hits Day 15 of Phase 4
