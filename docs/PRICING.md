# AI-CDIO: Pricing & Unit Economics

> **⚠ STATUS — PROVISIONAL (locked 2026-05-07).** All numbers and tier structures below are *provisional sketches predating the Day 11 architectural rewrite*. Do not treat as locked pricing.
>
> **Architectural law that supersedes everything below** (`docs/STRATEGY-2026.md` Architectural Law 2): methodology is FULL on every tier; compute is the variable-cost lever; tiers differentiate by scale (clients, practitioners) and compute mechanism only — never by methodology depth.
>
> **Final pricing locked at Phase 2 Day 35-38** based on Day 19+ cost-per-engagement telemetry from `agent_logs`. Founder's stated inputs to that review:
> - **Starter** uses Mechanism 1 (tier-included compute allowance + transparent metered overage). AI Accelerator included IF margin math works under Mechanism 1; otherwise excluded and Growth+ becomes minimum AI tier.
> - **Growth** uses Mechanism 2 (BYOK — practitioner connects own Anthropic / OpenAI / OpenRouter / Copilot key). Full AI Accelerator unconditionally.
> - **Scale** uses Mechanism 2 (BYOK). Full AI Accelerator + Knowledge Reuse + Custom playbook ingestion (Year 2+) + cross-engagement analytics + priority support.
> - No methodology gating at any tier.
> - Tier names and dollar amounts below ($199/$399/$1,499) are placeholders; final dollar amounts and tier names locked Day 35-38.
>
> Below content is preserved as historical context + ROI math reference. Treat as reading material for the Day 35-38 review, not as the current pricing structure.

---


## Pre-Purchase Technology Audit — discrete fixed-fee shape (added 2026-05-13)

The named Pre-Purchase Technology Audit service line does **not** fit the recurring-tier model below. It is a **discrete, fixed-fee engagement** — one decision, one verdict, days to deliver. Pricing shape (numbers provisional, locked at the Phase 2 Day 35-38 review alongside everything else here):

- **Fixed fee per audit**, scaled to the size of the decision being audited — anchored to a fraction of the money at stake, not to hours. Provisional sketch: a tiered fixed fee indexed to total contract value of the purchase under audit (e.g. bands for sub-$100K / $100K-$500K / $500K+ decisions). Final numbers from real engagements + Day 19+ cost telemetry.
- **ROI math that sells it:** the audit fee is justified the moment it catches a single overpayment, mis-fit, or lock-in trap. A $260K overpayment caught on an ERP decision pays for the audit many times over — the deliverable quantifies its own ROI in the board summary by design.
- **Not bundled into the retainer tiers** — it is a standalone engagement that frequently *precedes* and *sells* a retainer. Treat as a separate SKU at Day 35-38 pricing review.
- **Independence is a pricing constraint, not just a stance:** zero vendor fees / referral / commission, ever. Revenue is principal-paid only. This is contractually warranted (see `docs/CONTRACT-TEMPLATES.md` clause 5).

## Two Customer Segments, Five Tiers

### Fractional CDIO/CTO (Practitioner Segment)

| Tier | Price | Clients | Target |
|------|-------|---------|--------|
| **Free / Founder** | $0 (founder + first 5 design partners) | Unlimited during pilot | You + 5 hand-picked beta users |
| **Solo** | $199/mo | Up to 3 clients | Brand new fractionals (year 1) |
| **Pro** | $399/mo | Up to 8 clients | Established practitioners |
| **Practice** | $1,499/mo | Up to 30 clients, 5 practitioners | Multi-practitioner firms |

### Internal IT Director (Director Segment)

| Tier | Price | Scope | Target |
|------|-------|-------|--------|
| **Personal** | $99/mo | 1 org, individual user | IT Director self-expensed (below approval threshold) |
| **Team** | $499/mo | 1 org, up to 5 users | IT Director + their team, CFO-approved |
| **Enterprise** | $1,500/mo | 1 org, unlimited users + custom playbook | Mid-market VP IT, procurement-driven |

### MSP / Channel (Phase 2)

| Tier | Price | Scope |
|------|-------|-------|
| **MSP Partner** | $299/mo platform + $30/end-client/mo | White-label client portal, unlimited users per client |
| Volume discounts: 25+ clients $25/mo, 50+ $20/mo, 100+ $18/mo (floor) | | |

---

## Anchors (Validated by Market Research)

| Anchor | What It Means For Pricing |
|--------|---------------------------|
| ScalePad Lifecycle Manager X: $15/client/mo (MSP) | Floor for vCIO workflow tools at volume |
| Generic PSA tools (Productive, Kantata, BigTime): $50-150/user/mo | Comparable for professional services platforms |
| Fractional CDIO billable rate: $200-500/hour | Tool payback = 1-2 hrs saved/client/mo justifies $200-1,000 |
| IT Director US median salary: $191-203K | Personal expense threshold ~$100/mo without approval |
| SMB security tools spend: $43K/year (50-250 emp) | Existing willingness to pay for IT tools |

## The ROI Math (How to Sell)

**For a Pro fractional ($399/mo) with 5 clients at $300/hr billable rate:**
- Time saved: 5 clients × 5 hrs/mo = 25 hrs/mo
- Recovered billable value: 25 × $300 = **$7,500/mo**
- Tool cost: $399/mo
- **ROI: 18.8x. Pays for itself in ~1.6 hours.**

**For an IT Director on Personal ($99/mo):**
- Career growth + better board presentations + automated strategic planning
- Time saved on board prep alone: 8-12 hrs/quarter
- At their loaded cost ($150/hr): $1,200-1,800/quarter recovered
- Tool cost: $300/quarter
- **ROI: 4-6x.**

---

## Unit Economics

### LLM Cost Per Customer Per Month

| Persona | Activity Profile | LLM Cost |
|---------|-----------------|----------|
| Fractional Solo (3 clients) | 3 assessments × 1, 3 monthly status × 1, 1 QBR/quarter, ~20 chats/week | ~$45/mo |
| Fractional Pro (8 clients) | 8 status reports/mo, 8 QBRs/quarter, heavy chat | ~$120/mo |
| Fractional Practice (30 clients × 5 practitioners) | Heavy parallel use | ~$400-600/mo |
| Director Personal (1 org) | Light: occasional roadmap, board prep | ~$8/mo |
| Director Team (1 org, 5 users) | Moderate use across team | ~$25/mo |
| Director Enterprise (1 org) | Heavy: integrations, multiple stakeholders | ~$80/mo |

### Margin Analysis

| Tier | Revenue | LLM Cost | Infra Share | Gross Margin |
|------|---------|----------|-------------|--------------|
| Solo ($199) | $199 | $45 | $5 | **75%** |
| Pro ($399) | $399 | $120 | $8 | **68%** |
| Practice ($1,499) | $1,499 | $500 | $25 | **65%** |
| Personal ($99) | $99 | $8 | $2 | **90%** |
| Team ($499) | $499 | $25 | $5 | **94%** |
| Enterprise ($1,500) | $1,500 | $80 | $10 | **94%** |

**Healthy margins across all tiers.** The practitioner tiers run thinner because of higher LLM intensity per customer (3-30 clients per practitioner each generating LLM calls).

### Where We Lose Money

1. **Free founder tier** — $0 revenue, ~$120/mo LLM cost (you using all 8 clients heavily). This is a marketing investment in dogfooding.
2. **Free design partners (5 customers, first 90 days)** — ~$500/mo LLM cost for $0. Investment in feedback + case studies.
3. **Practice tier with 30 active clients** — if 5 practitioners hit max, $500-700/mo LLM cost vs $1,499 revenue. Still 53-67% margin. OK.

### Where We Make the Most Money

1. **Director Team & Enterprise tiers** — 94% margin, low LLM intensity (1 org, fewer integrations).
2. **Practitioner Pro at $399** — 68% margin × volume = the cash cow.
3. **MSP platform fee** — pure margin (the $299 base, separate from per-client LLM costs).

## Revenue Projections

### Year 1 (Conservative)

| Source | # Customers | Avg ARPU | Monthly Rev | Annual |
|--------|------------|----------|-------------|--------|
| Practitioners | 50 | $339 | $17K | $204K |
| Directors | 30 | $139 | $4K | $50K |
| **Total Y1** | **80** | | **$21K/mo** | **$254K ARR** |

LLM + infra: ~$2.5K/mo. **Net: +$18K/mo from Month 3.**

### Year 2 (Realistic with founder-led sales)

| Source | # Customers | Avg ARPU | Monthly Rev | Annual |
|--------|------------|----------|-------------|--------|
| Practitioners | 200 | $709 (mix-shift to Practice tier) | $142K | $1.7M |
| Directors | 300 | $269 | $81K | $968K |
| **Total Y2** | **500** | | **$223K/mo** | **$2.7M ARR** |

LLM + infra: ~$29K/mo. **Net: +$194K/mo.**

### Year 3 (Both segments scaling)

| Source | # Customers | Avg ARPU | Monthly Rev | Annual |
|--------|------------|----------|-------------|--------|
| Practitioners | 1,000 | $689 | $689K | $8.3M |
| Directors | 2,000 | $359 | $718K | $8.6M |
| **Total Y3** | **3,000** | | **$1.4M/mo** | **$17M ARR** |

LLM + infra + team: ~$300K/mo. **Net: +$1.1M/mo.**

## Break-Even Analysis

| Scenario | Monthly Fixed | Customers to Break Even |
|----------|--------------|-------------------------|
| Solo founder, minimal infra | ~$200 | 1-2 customers |
| Founder + 1 part-time CSM | ~$5K | 15 Pro practitioners or 50 Personal directors |
| Founder + small team (3 people) | ~$30K | 80 Pro practitioners or 300 Personal directors |

**Year 1 break-even: ~3-5 paying customers. Reachable in Month 2.**

## Pricing Experiments to Run (Validation Phase)

In the first 30 LinkedIn discovery calls:

1. **Practitioner price elasticity** — Test $299, $399, $599 for Pro tier. Where does enthusiasm drop?
2. **Director procurement threshold** — Test $99 (self-expense), $199 (still self-expense), $299 (needs approval). Conversion rate by tier.
3. **Annual discount** — 20% off if paid annually. How many take it?
4. **MSP volume math** — Test $30/client for 25 clients ($750/mo) vs $20/client for 50 clients ($1K/mo). Which model wins?

The data from these conversations sets your final pricing. Don't lock in until you have signal.

## Hidden Costs Often Missed

- Stripe processing: 2.9% + $0.30 per transaction (~$3.17 on $99 charge = 3.2%)
- Churn replacement: 5% monthly churn = need 5% new MRR each month to stay flat
- Support: 1 ticket/customer/month at $10/ticket = $10/customer/mo
- Legal: ToS, Privacy Policy, AI disclaimer review = $2-5K one-time
- LLM observability tooling (Langfuse, Sentry): $50-200/mo
- Background job hosting (Inngest/QStash): $30-100/mo

Build into projections from Month 3.
