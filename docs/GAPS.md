# AI-CDIO: Gap Analysis

Status: Updated for Fractional Executive OS framing.

## Priority Tiers

- **P0 (Tier 0)** — Existential. Blocks any usage with real client data.
- **P1 (High)** — Required for paying customers.
- **P2 (Medium)** — Required to scale beyond founder + first 5 customers.
- **P3 (Low)** — Quality of life.

---

## P0 — Foundation (Week 1, Must Ship Before Real Use)

| # | Gap | Why Existential | Effort |
|---|-----|-----------------|--------|
| P0-1 | No authentication (Clerk) | Cannot put real client data into unauthenticated app | 8h |
| P0-2 | API routes accept arbitrary `org_id` (IDOR) | Anyone with a UUID reads any org's data | 4h |
| P0-3 | `assessment_token` returned in dashboard response | Permanent unrevokable backdoor | 1h |
| P0-4 | No rate limiting on `/api/chat`, `/api/assessments` | Cost burn risk; DoS surface | 4h |
| P0-5 | No practitioner workspace (multi-client) | Architecture assumes 1 org per user; founder has 3-8 clients | 12h |
| P0-6 | Synthesis uses `delete-then-insert` without transaction | Real data loss risk on retry | 2h |
| P0-7 | `conversations` table not in `schema.sql` (only schema-v2) | Chat fails on fresh deploy | 1h |
| P0-8 | Service-role client used in every API route | Bypasses RLS; multi-tenancy enforced only in TS code | 6h (combined w/ P0-1) |

**Tier 0 total: ~38h / ~1 week of focused work**

---

## P1 — First Real Engine + Trust (Week 2-4)

| # | Gap | Why High | Effort |
|---|-----|----------|--------|
| P1-1 | Status Report Generator (the first deliverable engine beyond assessment + roadmap) | Highest-frequency deliverable per client; founder uses immediately | 16h |
| P1-2 | Chat implicit_scores never feed into module_scores | "Chat-first" promise broken until bridged | 6h |
| P1-3 | Action cards become stale on resynthesis | Stale advice forever | 4h |
| P1-4 | Roadmap engine at 25% of playbook vision | Templated 30/60/90, financial models, dependencies, governance still missing | 16h |
| P1-5 | Synthesis can fire 96 LLM calls per HTTP request | Times out on Vercel; runaway cost | 12h (move to background job) |
| P1-6 | No prompt caching | -70% input tokens; required for unit economics | 4h |
| P1-7 | Terms of Service / Privacy Policy / AI disclaimer (formal legal) | Required before any non-founder user | $2-5K legal review |
| P1-8 | Sentry + Langfuse (error monitoring + LLM observability) | Cannot see when AI gives bad advice | 2h |

**Tier 1 total: ~60h + legal**

---

## P2 — Second Engine + Scale (Week 5-12)

| # | Gap | Why Medium | Effort |
|---|-----|-----------|--------|
| P2-1 | QBR Deck Generator | Quarterly deliverable, highest time-saved per use | 24h |
| P2-2 | Value/ROI tracker (commit → deliver → prove) | Differentiator vs every consulting tool | 16h |
| P2-3 | Engagement Lifecycle (Phase 1 → 2 → 3) | Drives upgrades and renewals | 12h |
| P2-4 | Templates Library (charter, M&A DD, vendor playbook) | Long tail of repeatable artifacts | Ongoing |
| P2-5 | Document/image evidence upload + AI analysis | Growth tier feature | 24h |
| P2-6 | Module-level improvement chat | Starter+ tier feature | 16h |
| P2-7 | Stripe billing + subscription management | Cannot charge without it | 12h |
| P2-8 | Credit/usage tracking + per-tier limits | Cost control at scale | 8h |
| P2-9 | Response caching (24h hash on user message + context) | -30-50% LLM calls | 6h |
| P2-10 | Output guardrail for security-domain AI advice | Liability mitigation | 6h |
| P2-11 | Strip diagnostic questions out of system prompt | Prevent IP extraction | 8h |
| P2-12 | Bridge `session_id` → `clerk_user_id` (claim flow) | Conversation memory across sessions | 6h |

---

## P3 — Polish (Month 4+)

- Mobile-optimized chat + assessment forms
- Dark mode
- Multi-language support
- GDPR data residency options
- Annual pricing option
- Referral program mechanics
- MSP partner onboarding kit
- Co-branded client portal
- White-label for MSPs
- API for partners

---

## Summary by Category

| Category | P0 | P1 | P2 | P3 |
|----------|---|---|---|---|
| Security & Auth | 4 | 1 | 1 | 0 |
| Product/Engines | 1 | 4 | 6 | 5 |
| Scale/Infrastructure | 0 | 2 | 4 | 4 |
| Legal/Compliance | 0 | 1 | 1 | 1 |
| **Total** | **8** | **8** | **12** | **10** |

**38 total gaps. 8 are existential blockers for Week 1.**

## What This Means for Build Order

1. **Week 1:** All 8 P0 items — foundation for safe real-data use
2. **Week 2-4:** P1 items in order — first real value engine (Status Report) + trust infra
3. **Week 5-12:** P2 items — scale beyond founder + first 5 customers
4. **Month 4+:** P3 items — quality of life
