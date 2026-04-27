# AI-CDIO: Build Roadmap

## Current State (April 2026)

### Built
- Assessment Engine (16 modules, 5-level maturity, AI scoring)
- Roadmap Engine (25% of playbook vision)
- Conversation Agent (chat-first entry, RAG-grounded)
- Quick Scan UI (live spider chart + action cards)
- Dashboard (priority matrix, divergence detection, Decision Packages)
- RAG layer (1,154 playbook chunks indexed)
- Supabase backend (10 tables, multi-tenant by org_id)
- 5-level maturity scale standardized

### NOT Built (Critical for Real Use)
- Authentication (Clerk in deps but not wired)
- Practitioner workspace (multi-client portfolio)
- Rate limiting (any kind)
- Background jobs (synthesis runs synchronously, will time out at scale)
- Status Report Generator
- QBR Deck Generator
- Templates Library
- Stripe billing
- Vercel deployment

---

## Phase 1: FOUNDER TOOL (Weeks 1-6)

### Week 1 — Foundation (P0 ship-blockers)

**Goal:** Make it safe to put real client data in the platform.

| Day | Task | Outcome |
|-----|------|---------|
| 1 | Add Clerk auth + middleware on every API route | No more anonymous IDOR |
| 2 | Add `practitioners` + `practitioner_clients` tables | Multi-client data model |
| 3 | Practitioner workspace UI: list of all clients | Portfolio view |
| 4 | Strip `assessment_token` from dashboard response, derive IDs server-side | Token security |
| 5 | Upstash Redis rate limiting on `/api/chat` and `/api/assessments` | Cost protection |
| 6 | Wrap synthesis delete-then-insert in transaction | Data integrity |
| 7 | Migrate founder's 1-3 real clients into platform | First real use |

**Done = Founder logs in, sees portfolio, drills into Client A, runs existing engines.**

### Week 2 — First Real Engine: Status Report Generator

**Goal:** The first deliverable beyond assessment + roadmap. Highest-frequency, highest-time-saved.

| Day | Task | Outcome |
|-----|------|---------|
| 8-9 | `status_reports` table + API routes | Persistence |
| 10-11 | Status Report Generator engine (pulls assessment + roadmap + decisions + value) | Core logic |
| 12 | AI narrative draft (Claude Sonnet, structured prompt) | Generated text |
| 13 | Markdown editor + PDF export | Practitioner edits |
| 14 | Send-to-client email button (Resend) | Delivery |

**Done = Founder generates one client's monthly status report in <10 minutes (was 1-2 hours).**

### Week 3-4 — Roadmap Engine to 100% + Trust Infra

| Week | Task |
|------|------|
| 3 | Roadmap Engine upgrades: 30/60/90 templated, financial models, dependencies, governance section |
| 3 | Move synthesis + roadmap to Inngest background jobs |
| 3 | Add Anthropic prompt caching (system prompt + RAG context) |
| 4 | Sentry error monitoring + Langfuse LLM observability |
| 4 | Action cards invalidate on resynthesis (assessment_id + score_at_creation) |
| 4 | Bridge chat `implicit_scores` → `module_scores` |

**Done = Roadmap matches playbook vision. Cost-controlled. Observable.**

### Week 5-6 — Polish + Validation Prep

| Week | Task |
|------|------|
| 5 | Use platform for THIS WEEK's actual deliverables across all founder's clients |
| 5 | Document patterns: which engines used most, which features missing |
| 5 | Terms of Service + Privacy Policy + AI disclaimer (legal review) |
| 6 | Founder LinkedIn post: "I'm building this. Want early access?" |
| 6 | First 30 LinkedIn DMs (15 fractional + 15 director) |
| 6 | Discovery calls scheduled |

**Done = Founder uses platform daily. Outreach starts. Validation Phase 2 begins.**

---

## Phase 2: VALIDATED PRODUCT (Weeks 7-12)

### Week 7-8 — First External Pilots

| Task |
|------|
| Onboard 5 design partners (3 fractional + 2 director) for free |
| Watch them use it. Bug fixes + UX iterations from observation. |
| Build QBR Deck Generator (Engine #2) |
| Add credit/usage tracking + per-tier limits (Stripe metadata) |

### Week 9-10 — First Paying Customers

| Task |
|------|
| Stripe billing integration |
| Convert pilots to paid ($199-599 based on segment) |
| First case studies (with permission) |
| Community Slack for paying users |

### Week 11-12 — Engine #3 + Scale Prep

| Task |
|------|
| Build Value/ROI Tracker (commit → deliver → prove) |
| Module-level improvement chat (Starter+ feature) |
| First 20-30 paying customers |
| Founder content: 3-5 LinkedIn posts/week |

**Phase 2 done = $8-12K MRR, two engines beyond assessment + roadmap, validated PMF.**

---

## Phase 3: BUSINESS ON ITS OWN (Months 4-12)

### Month 4 — Engine #4 + #5

- Templates Library (Charter, M&A DD, Vendor Playbook, Risk Register)
- Engagement Lifecycle (Phase 1→2→3 progression UI)

### Month 5 — Document Upload + AI Analysis (Growth tier)

- Image upload (security dashboard screenshots, etc.)
- Document upload (vendor contracts, policies)
- Claude Vision + document parsing
- AI evidence analysis feeds into module scoring

### Month 6 — First MSP Partner

- White-label client portal (co-branded)
- MSP onboarding kit (deck, training video, first-deal playbook)
- Pilot with one MSP (50+ end clients)

### Month 7-9 — Resource Planner + Lifecycle

- Resource & Capacity Planner (per-practitioner hours allocation)
- Engagement Lifecycle automation (auto-progression P1→P2 with conversion gates)
- Annual pricing option (20% discount)

### Month 10-12 — Content + Community

- Content marketing kicks in (SEO, podcast, original research)
- "State of the Fractional CDIO 2026" report (data-driven)
- Referral program (Cello.so or built-in)
- Hire first part-time CSM
- 100 paying customers, $30K+ MRR

---

## Phase 4: PLATFORM (Year 2+)

| Quarter | Focus |
|---------|-------|
| Q5 | AI-Strategist (parallel agent for business strategy) |
| Q6 | AI-OME (operational excellence, 82-point operating model) |
| Q7 | Cross-agent intelligence (shared client context across CDIO+Strategist+OME) |
| Q8 | Multi-language (Spanish first — Latin American SMBs) |
| Q9+ | Custom playbook support (white-label methodologies) |
| Q10+ | Mobile app |

---

## Build Order Decision Criteria

When choosing what to build next, apply this in order:

1. **Does it save the founder time on a real client engagement THIS WEEK?** → Highest priority
2. **Does it unblock a paying customer who's complained?** → High priority
3. **Does it close a sale that's stalled at "yes if you build X"?** → High priority
4. **Does it reduce cost (LLM, infra, support)?** → Medium priority
5. **Does it open a new segment/channel?** → Medium priority
6. **Is it nice-to-have or competitive feature parity?** → Low priority

If a feature is none of the above, defer it.

---

## The Kill Switch

**Day 90 review criteria:**
- 5+ paying customers at $199+ → continue, accelerate
- 1-4 paying customers → continue, slow burn, validate more
- 0 paying customers + 0 commitments → STOP. Reframe or shelve.
- Founder using platform daily and saving 5+ hrs/client/mo → continue regardless

The kill switch protects against sunk-cost spiral.
