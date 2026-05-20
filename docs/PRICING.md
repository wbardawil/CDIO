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

---

## 2026-05-19 — Pricing-strategy reframe for the IT Manager persona

**Trigger:** founder added IT Manager as the 5th persona (CLAUDE.md), opening a third buyer motion (individual / bottom-up). This section captures the proposed five-tier structure that respects all existing locked constraints (methodology FULL on every tier; scale-only differentiation; Mechanism 1/2 split; final numbers locked Phase 2 Day 37-38 from real cost telemetry).

**Status:** PROPOSAL for the Phase 2 Day 37-38 pricing-lock review. Not committed pricing. Tier 5 (CEO Engagement) is the only tier sold today.

### Core pricing principle

> Price the OUTCOME a persona can credibly claim, anchored to what their alternative costs — not the seats or the modules.

Same product, wildly different prices justified by wildly different outcomes per persona. That is why scale-based tiering works and does not violate the "methodology FULL on every tier" law.

### Proposed five-tier structure + one services overlay

| # | Tier | Persona | Scale | Price range | Anchor / comparable |
|---|---|---|---|---|---|
| **0** | **Free Quick Scan** | Anyone — lead capture | 1 user, 1 module, watermarked output | $0 | Free trials of Vanta, Notion, etc. |
| **1** | **Professional** | IT Manager, IT pro, junior IT Director | 1 user, 1 "my org" workspace, Coach Mode emphasized, exports watermarked "Personal Assessment" | **$49-79/mo** ($490-790/yr annual) | Pluralsight $45/mo · LinkedIn Learning $40/mo · Notion Pro $20/mo |
| **2** | **Team / Department** | IT Director running a team; small IT shop | 1 org, 3-15 seats, multi-stakeholder assessments, full deliverables (no watermark), Jira/Asana read-sync | **$299-499/mo flat OR $50-75/seat/mo** ($3-6K/yr) | Asana Business $25/user · Smartsheet Business $25/user × 10 ≈ $250/mo · Hyperproof low-end ≈ $500/mo |
| **3** | **Executive / Full IT Function** | Full-time CIO, IT Director at no-CIO company, operational CTO | 1 org, unlimited internal seats, board cadence, full integrations, white-label outputs, quarterly reassessment | **$1.5-2.5K/mo or $18-30K/yr** | Vanta mid-tier ≈ $15-25K/yr · Drata Growth ≈ $20-40K/yr · Hyperproof ≈ $25K+ |
| **4** | **Fractional Practice** | Independent fractional CDIO/CIO/CTO | N client orgs (3 / 6 / unlimited), BYOK for AI, multi-client switcher, white-label, practitioner workspace, Network Catalog | **$500-1,500/mo per practitioner + per-client fee** ($6-50K/yr per practitioner depending on client count) | Sub-tier of an enterprise CRM seat (Salesforce $1.5K/user/mo) · Better than hiring an associate ($120-200K/yr) |
| **5** | **CEO Engagement** *(services overlay, sold by founder/fractionals)* | Mid-market CEO buying a 90-day fractional engagement that uses the platform | High-touch, one-time, includes 90-day platform access + post-engagement subscription | **$15-30K per 90-day engagement** + Tier 3 subscription after | 1/5th cost of full-time CIO ($400K / 5 = $80K/yr → $20K per 90-day) · Big 4 advisory ≈ $50-200K |

### Three buyer motions, one product surface

```
                       FREE QUICK SCAN  (lead capture)
                              │ self-serve signup
                              ▼
PRODUCT-LED MOTION    Professional $49-79/mo
                              │ + boss approval
                              ▼
                      Team $299-499/mo
                              │ + IT becomes a strategic function
                              ▼
                      Executive $18-30K/yr
                              │ + ROI proven; CIO/CFO conversation
                              ▼
                      (Renewal / Multi-year / Expansion)


SERVICES-LED MOTION   CEO Engagement $15-30K  (90 days)
                              │ Day-90 outcomes delivered
                              ▼
                      Auto-converts to Executive $18-30K/yr  (same Tier 3)


PRACTITIONER MOTION   Fractional Practice $500-1500/mo + per-client
                              │ Year 2+ commercial release
                              ▼
                      (Network Catalog tier later)
```

**Critical insight:** Tier 3 (Executive) is where both buyer motions converge. That is by design — one product, one renewal motion, one customer-success playbook regardless of how the buyer arrived.

### Per-tier rationale (the "why these numbers" briefs)

**Tier 1 / IT Manager — the new addition.**
- $49-79/mo is the self-expensable band — buyable on personal credit card, no boss approval. Above $100/mo → budget conversation needed.
- Not free for the individual: paid signals commitment; free Quick Scan handles lead-gen separately.
- **Watermarked output** is the upsell mechanism: full methodology + Coach Mode, but exports say "Personal Assessment — not an official organizational deliverable." Protects Tier 2 upsell + handles the ethics question of an IT Manager generating a "board memo" without org sign-off.
- Coach Mode is the retention hook: even if the current role does not need it, they are learning toward the next role. Value is in the user, not the role → churn-resistant.

**Tier 2 / Team — the bottom-up wedge.**
- IT Director discretionary budget: typically $5-20K/yr. $3-6K/yr fits without C-level approval.
- The most important tier for the product motion — converts Tier 1 individuals: an IT Manager using it personally for 3 months, then telling their IT Director boss "I want our whole team on this." Notion/Linear/Figma playbook.
- Pricing: flat ($299-499/mo) for ≤8 seats; per-seat ($50-75/user) above. Offer both, default to flat for small teams.

**Tier 3 / Executive — the in-house CIO motion.**
- $18-30K/yr matches mid-market GRC pricing (Vanta/Drata/Hyperproof comp-set).
- CIO discretionary threshold typically $25-50K — buyable without board approval.
- Buyer math: "$25K to avoid one $200K consulting engagement on AI strategy."
- White-label outputs are critical here (board memo on their company letterhead).

**Tier 4 / Fractional Practice — home turf.**
- A fractional billing $200-300/hour can justify $1K/mo platform spend that lets them serve 2-3 more clients.
- **Per-client fee** is honest but capped (≤$200-400/mo per active client) so the math always works for the practitioner. No perverse incentive to avoid onboarding.
- BYOK essential at this tier — AI compute scales with client count.

**Tier 5 / CEO Engagement — the high-ticket services anchor.**
- The 90-day commitment matrix monetized.
- $15-30K positioned at **1/5th of a full-time CIO annual cost** — directly steals budget from the "we should hire a CIO" conversation.
- Post-engagement Tier 3 subscription handles recurring revenue.
- Only exists in the funnel because the founder is a practicing fractional. If founder stops selling engagements, this becomes a referral product for certified fractionals (Tier 4 revenue).

### Legitimate add-ons (do not violate "methodology FULL on every tier")

| Add-on | Price | Tier eligible |
|---|---|---|
| White-label / custom branding | +20-30% of base | Tier 3+ |
| Founder-led onboarding workshop (one-time) | $3-7.5K | Any |
| Coaching hours (1:1 certified practitioner) | $300-500/hour | Any |
| Custom integrations (beyond standard set) | Project basis | Tier 3+ |
| AI compute overage (Tier 1-2 above allowance) | Marked-up passthrough | Tier 1, 2 |
| Annual cross-mapping certification update (Phase 2.5+) | $500-2,000 | Tier 1-3 |
| Practitioner certification credential (Phase 3) | $500-2,000 per practitioner | Tier 4 |
| Extra retention / historic data export | +$50-200/mo | Tier 2+ |

NOT methodology gating — scale, branding, services, infrastructure.

### Risks + what to validate before Day 37-38 lock

| Risk | Mitigation |
|---|---|
| Tier 1 cannibalises Tier 2 (10 individuals at $49 vs Team at $499) | Watermarked exports + single-user-only Coach Mode + no multi-stakeholder assessments on Tier 1 |
| Tier 4 fractional pricing hard to land — practitioners price-sensitive | Validate with 3-5 friendly fractionals in Year 2+. Alternative: "first 3 clients free" runway, or % of practitioner revenue (high-trust) |
| CEO Engagement at $15-30K feels "consulting" not "platform" | Frame as: "$X for the 90-day engagement; the platform comes with it. Continued access from $1.5K/mo." Separates services from subscription cleanly. |
| AI cost on Tier 1-2 unpredictable | Tight allowance modeling from Day 19+ telemetry. Start conservative; relax as data accumulates. |
| Free Quick Scan = cost center? | Limit to 1 per email/quarter; require email + work info to access. Lead value funds the cost. |
| Priced higher than Vanta/Drata low-tiers (different product, but compared) | Explicit positioning: "We are the strategy + governance + AI layer ABOVE compliance tools." |

**Three things to validate before locking final numbers:**

1. Real cost telemetry (existing locked decision) — per-engagement AI compute cost
2. Tier 5 → Tier 3 conversion rate — does the CEO who buys a 90-day engagement actually subscribe after? If <50%, model breaks
3. Tier 1 → Tier 2 upgrade rate — does the individual IT Manager actually pull their team onto Team tier?

### Phased rollout recommendation

- **Now (Year 1):** Tier 5 only — sell fractional engagements at $15-30K per 90-day engagement. The only pricing decision needed this month.
- **~30-60 days (when freemium Quick Scan + Professional ships):** Add Tier 0 + Tier 1. Goal: 100 paying Professionals in 6 months = $5-6K MRR + telemetry + IT Manager testimonials.
- **Phase 1.5 / Phase 1D (Team tier built):** Add Tier 2 at $299/mo flat / $50/seat above.
- **Phase 2.5 / commercial release:** Add Tier 3 + Tier 4 simultaneously. Tier 3 introductory $1,500/mo rising to $2,500/mo standard after 6 months.
- **Phase 3:** Lock final numbers from telemetry. Add certification credential. Open Network Catalog tier.

### Single-sentence summary

Start with one number you charge today (Tier 5 at $15-30K per 90-day CEO engagement); add a low-friction self-serve Tier 1 ($49-79/mo) as soon as Quick Scan + watermarked individual access exists; let the other tiers harden against telemetry. Do not publish all five tiers Day 1.
