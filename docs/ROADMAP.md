# AI-CDIO: Build Roadmap

> **Companion strategy doc:** `docs/STRATEGY-2026.md` is the active strategic source of truth.
> **Last refreshed:** 2026-04-29 (Day 6 of Phase 1, end of Phase 1B Day 6 — Test/Real architectural primitive scoped + role/area question-level segmentation locked into Phase 1C).

## Current State (April 2026)

### Built (Phase 1A — Days 1-3, ✅ done)
- Quick Scan UI (`/scan`) with live spider chart + action cards
- Full Assessment Pipeline (`/onboarding` + `/assess/[token]`) with multi-stakeholder
- Chat-first conversational entry (`/chat`)
- Legacy Dashboard with priority matrix + divergence detection + AI Decision Packages
- Assessment Engine (16 modules, 5-level maturity, AI scoring) — though level-5 indicator content is incomplete (see Phase 1C)
- Roadmap Engine (~25% of playbook vision)
- RAG layer (1,152 playbook chunks, CMU/Carnegie attribution stripped)
- Supabase backend (15 tables, schema-v4 practitioners applied)
- **Clerk auth + Next 16 proxy** — practitioner-only API routes gated
- **Practitioner workspace data model** — `practitioners` + `practitioner_clients` (N:N) + `organizations.active_modules`
- **IDOR fix** — `assertPractitionerOwnsOrg` enforces ownership at handler layer (RLS policies pre-wired for Day 30)
- **Portfolio + Client Workspace shell** — `/clients` (table) + `/clients/[orgId]` (6-tab shell, Overview wired)
- **Onboarding hardening** — auth-gated, error display, role dropdown extended to CIO/CDIO/CDO/CISO
- **Assessment scope intersection** — stakeholder relevant_modules ∩ org active_modules
- Migration tooling (`scripts/migrate.js`, `inspect-db.js`, `verify-cmu-purge.js`)
- Local dev hardening (`docs/LOCAL_DEV.md`, orphan lockfile removed)

### NOT Built (the remaining Phase 1 work)
- Methodology depth (level-5 indicators, framework citations, narrative scoring) — Phase 1C
- Decision Package surfacing as standalone artifact — Phase 1C
- Stakeholder edit/email/reminders UI — Phase 1B
- Status Report Generator — Phase 1D
- Engagement Cadence (shareable read-only) — Phase 1D
- Value Tracker — Phase 1D
- MCP Server foundation — Phase 1D
- Rate limiting, synthesis transaction wrapping — Phase 1B safety
- Background jobs framework — Phase 2 if needed
- Stripe billing — Phase 3
- Vercel deployment — Phase 2

---

## Phase 1: PRACTITIONER TOOL (Days 1-25)

The single goal: by Day 25 the founder runs the **full Quick Win Stack engagement** end-to-end on Ambar Capital + 1-2 more real clients, and the platform is demo-quality for design-partner pilots.

### Phase 1A — Foundation ✅ Days 1-3 (done)

Closed P0-1 (auth), P0-2 (IDOR), P0-5 (practitioner workspace), P0-7 (conversations table). 8 commits. See `git log`.

### Phase 1B — Practitioner Operations + Safety (Days 4-7)

**Goal:** close the manual-workaround friction the founder hit during dogfood + finish remaining safety items.

| Day | Task | Outcome | Status |
|-----|------|---------|--------|
| 4 | Stakeholder edit UI (role + relevant_modules + influence_level) | No more SQL-edit-by-hand | ✅ commit `a95c829` |
| 4 | Email send via Resend (assessment links + reminders) | No more copy-paste | ✅ commit `a95c829` |
| 4 | Sandbox flag (deferred to Day 3 evening) | Real-vs-test boundary | ✅ commit `3e61c40` |
| 5 | Strip `assessment_token` from dashboard response | Closes P0-3 | ✅ commit `46339e5` |
| 5 | Wrap synthesis delete-then-insert in atomic stored proc | Closes P0-6 | ✅ commit `46339e5` |
| 5 | Upstash Redis rate limiting on `/api/chat` + `/api/assessments` | Closes P0-4 — needs `UPSTASH_*` env vars | ⏸ pending creds |
| 6 | Sentry error monitoring + Langfuse LLM observability | Visibility before depth work | ⏸ pending creds (`SENTRY_DSN`, `LANGFUSE_*`) |
| 7 | **Test/Real architectural primitive — `is_sandbox` becomes load-bearing across all surfaces** (workspace banner, assessment-page banner, email-routing safety, delete-org one-click, AI output tone). Orphan orgs (no `practitioner_clients` mapping) auto-defaulted to Test. Ambar confirmed real (`is_sandbox=false`, properly mapped). | Closes the Test-vs-Real triage problem permanently. No more per-org cleanup. | ⏳ design locked, ready to build |

**Day 7 architectural call (locked 2026-04-29):**
- TestCo (legacy, no mapping) → auto-flipped to Test + assigned to founder
- Ambar Capital → confirmed real-engagement; `active_modules = [5, 15, 4]` left as-is (founder's call as fractional CIO)
- Founder's role at Ambar: **fractional CIO** (drives the role-default mapping)

**Done = Founder onboards / edits / emails / monitors clients without manual workarounds. Test and Real clients are visually + behaviorally distinct everywhere.**

### Phase 1C — Methodology Depth: Quick Win Stack (Days 8-17)

**Goal:** The methodology becomes visible. Module 5 + 12 + 15 (the playbook's named "Quick Win Stack", 200-400% ROI in 90 days) get full depth so an assessment produces real diagnostic output, not just scores. AND the assessment becomes role-aware at the **question** level — a CEO no longer sees the same questions as a CTO inside a given module.

**New product principle baked into Phase 1C: question-level role/area segmentation + N/A escape (locked 2026-04-29).**

#### The two-layer question tagging system (added Day 8 alongside Module 5 rewrite)

Every diagnostic question gets tagged on two axes:

**Layer 1 — Executive function tags** (who's qualified to answer):
- `strategic` (governance, vision, business alignment)
- `financial` (budget, ROI, vendor cost)
- `technical` (architecture, implementation, controls)
- `operational` (processes, day-to-day execution)
- `risk` (compliance, threat, mitigation)

**Layer 2 — Business area tags** (which part of the company the question applies to):
- `operations`, `sales`, `IT`, `finance`, `marketing`, `other`

**Role → tag combinations:**

| Role | Sees questions tagged |
|---|---|
| CEO / Founder / Owner / President | strategic |
| CFO | strategic + financial |
| COO | strategic + operational |
| CIO / CDIO | strategic + financial + technical + operational |
| CTO | strategic + technical + operational |
| CISO | strategic + technical + risk |
| Director / Manager — Operations | `operations` area + operational |
| Director / Manager — Sales | `sales` area |
| Director / Manager — IT | `IT` area + technical + operational |
| Director / Manager — Finance | `finance` area + financial |
| Director / Manager — Marketing | `marketing` area |
| Director / Manager — Other | curated minimum (Module 1 leadership/governance) + lean on N/A |

#### N/A escape hatch (universal — every respondent, every question)

- **Per-module N/A** — gate at start of each module: *"Can you speak to this area?"* — N/A skips entire module
- **Per-question N/A** — text-link style ("I can't answer this") on each question — nudges effort but no shame for honest answers
- **Synthesis treats N/A as missing data, never as score 1** — average is computed only from given responses
- **New practitioner-side warning** in workspace Overview: *"Module X has thin coverage — fewer than 2 stakeholders answered, or below 50% of expected responses. Assign someone with visibility."*

#### Build order

| Day | Task | Outcome |
|-----|------|---------|
| 8-10 | **Module 5 deep + role/area tagging + N/A** — rewrite question bank against NIST CSF + CMMI; add level-5 indicators per question; AI-generated scoring narrative; "path to next level" recommendations from playbook RAG; cited authority (NIST CSF tier, CMMI process area). **Tag every question with executive function + business area.** **Wire N/A button (text-link) on each question + module-gate.** **Wire thin-coverage warning to practitioner.** | Proof of pattern. Dogfood on Ambar (Wadi as fractional CIO) before scaling. **Stop and review.** |
| 11 | **Decision Package surface** — standalone artifact, not buried in synthesis. Hero-level UI in workspace. | The "what should I do" output that wins prospects |
| 12-13 | **Module 12 deep (Financial Acumen)** + **Module 15 deep (Process Automation)** — replicate Module 5 pattern, **including role/area tagging + N/A** | Quick Win Stack assessment is demo-quality, role-aware, N/A-safe |
| 14-15 | **Quick Scan output upgrade** — public `/scan` becomes board-memo-quality artifact (cited, narrative, 3 named quick wins, projected ROI) | The sales-conversion engine |
| 16-17 | **Framework citations layer** — every score, every recommendation links to the named framework + playbook excerpt | Methodology authority visible everywhere |

**Done = Founder runs an assessment on a fresh client and the output makes the playbook's depth visible. CEOs answer 5x fewer questions than CTOs inside the same modules. N/A is a first-class option. Thin-coverage gaps surface automatically. Demo-quality.**

**Note:** Modules 1-4, 6-11, 13-14, 16 stay on today's module-level segmentation until they get a depth pass in later phases. Quick Win Stack is the demonstrable proof unit.

### Phase 1D — Recurring Deliverables + MCP (Days 18-25)

**Goal:** The platform produces the practitioner's recurring artifacts and is callable from Claude.ai.

| Day | Task | Outcome |
|-----|------|---------|
| 18-21 | **Status Report Generator (Engine #2)** — table + API + AI narrative + Markdown editor + PDF export + Resend send | Month-2 retention proof. 90 min → 12 min savings. |
| 22-24 | **Engagement Cadence** — milestones (commitments, target dates, deliverable types), auto-populated from roadmap + status + decisions, **shareable read-only link** (token-based, no portal) | Practitioner-as-trusted-partner differentiator. Client-facing without portal complexity. |
| 25 | **MCP Server foundation** — auth, tool registry, first 3 tools (`generate_status_report`, `query_client_data`, `propose_decision_package`). Expand per-engine as we build going forward. | Practitioner can call AI-CDIO from Claude.ai / Cursor / Codex. |

**Done = Founder runs full Quick Win engagement on Ambar end-to-end (assessment → cadence → status reports → decision packages) using the platform, including from Claude.ai via MCP.**

---

## Phase 2: VALIDATION (Days 26-35)

**Goal:** Prove the practitioner-first promise on real engagements. Onboard 5 design partners.

| Day | Task |
|-----|------|
| 26-28 | Founder uses platform daily on Ambar + 1-2 more real clients. Document time savings explicitly ("this report took 12 min, used to take 90"). |
| 26-28 | Asset library built: differentiator one-pager, 3-5 min demo video, anonymized Ambar case study, three LinkedIn post templates |
| 29-30 | Vercel deploy (production environment). DNS. Custom domain. |
| 30-32 | LinkedIn post: "I'm building this. Want early access?" Cadence ramps to 3 posts/week. First 30 DMs (15 fractional + 15 director). |
| 33-35 | 5 design-partner pilots onboarded free. 14-day pilot structure. Discovery → demo → pilot funnel weekly slots. |

**Done = Founder uses platform daily. 5 design partners actively running engagements on it. LinkedIn cadence active.**

---

## Phase 3: MONETIZATION (Days 36-60)

**Goal:** Convert pilots to paid. Hit Day 90 kill-switch criteria with margin.

| Days | Task |
|---|---|
| 36-40 | Stripe billing integration. Tiers: Starter $199, Growth $399, Scale $599. |
| 41-45 | Convert pilots to paid at Day 14/30/60 of their engagement. First 3-5 paying customers. |
| 46-50 | First case studies published (with permission). LinkedIn cadence to 5 posts/week. DM cadence to 30/week. |
| 51-55 | Value/ROI Tracker (Engine #3) — commit→deliver→prove cycle | Renewal engine for first paying cohort |
| 56-60 | First original research draft: "State of the Fractional CDIO 2026" — aggregate anonymized data. Quarterly publication target. |

**Done = 5-8 paying customers, $1.5-4K MRR, retained pilots, public case studies, LinkedIn momentum.**

**Day 90 review hits at Day 60 + 30 = Day 90. Kill switch criteria evaluated.**

---

## Phase 4: SCALE & DEEPEN (Days 61-180)

| Days | Task |
|---|---|
| 61-90 | QBR Deck Generator (Engine #4) · Templates Library (charters, vendor playbook, M&A DD, risk register) · Knowledge Reuse panel ("I solved this at Client X") · Module-level improvement chat |
| 91-120 | Document/image upload + AI Vision evidence analysis · Engagement Lifecycle (Phase 1→2→3 progression UI) · Annual pricing option |
| 121-150 | First MSP partner pilot (one MSP, 50+ end clients) · Co-branded client portal (lightweight, opt-in, replacing some Cadence Share use cases) |
| 151-180 | Resource & capacity planner · Referral program · Hire first part-time CSM · 100+ paying customers, $30K+ MRR |

---

## Phase 5: PLATFORM (Year 2+)

Only if Phase 1-4 has delivered clear PMF. None of these are commitments.

| Quarter | Focus |
|---------|-------|
| Q5 | AI-Strategist sibling (parallel methodology toolkit on shared MCP infrastructure) |
| Q6 | AI-OME sibling |
| Q7 | Cross-agent intelligence (shared client context across CDIO+Strategist+OME) |
| Q8 | Multi-language (Spanish first if Latin American demand emerges) |
| Q9+ | Custom playbook support (white-label methodologies for partner consultancies) |
| Q10+ | Mobile app |

---

## Build Order Decision Criteria

When choosing what to build next, apply this in order:

1. **Does it save the founder time on a real client engagement THIS WEEK?** → Highest priority
2. **Does it close a sale that's stalled at "yes if you build X"?** → High priority
3. **Does it unblock a paying customer who's complained?** → High priority
4. **Does it expose methodology depth that's currently hidden?** → High priority (NEW — practitioner-first)
5. **Does it reduce cost (LLM, infra, support)?** → Medium priority
6. **Does it open a new segment/channel?** → Medium priority
7. **Is it nice-to-have or competitive feature parity?** → Low priority

If a feature is none of the above, defer it.

---

## The Kill Switch

**Day 90 review criteria:**
- 5+ paying customers at $199+ → continue, accelerate
- 1-4 paying customers + founder using daily → continue, slow burn
- 0 paying + 0 commitments + founder NOT using daily → STOP. Reframe or shelve.
- Founder using daily and saving 5+ hrs/client/mo, even at 0 paid → continue. The tool is the product.

The kill switch protects against sunk-cost spiral. It does not punish slow paying-customer ramp if the dogfood loop is healthy.
