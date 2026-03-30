# AI-CDIO: Pricing & Unit Economics

## Pricing Tiers

| Tier | Price | What's Included | Target |
|------|-------|----------------|--------|
| **Free Chat** | $0 | 50 credits/mo (chat only), 3 module deep-dives, basic actions | Lead gen, try-before-buy |
| **Starter** | $99/mo | 1,000 credits, full assessment, action queue, weekly digest, unlimited users | 10-50 employees |
| **Growth** | $299/mo | 5,000 credits, multi-user, divergence detection, reports, benchmarks, unlimited users | 50-250 employees |
| **Portfolio** | $199/mo + $29/company | Cross-company dashboard, benchmarks, roll-up reporting | Holdings, family offices (5-10 cos) |
| **Fund** | $499/mo + $24/company | Due diligence tools, post-acquisition playbooks | PE/VC (10-50 cos) |
| **MSP Partner** | $299/mo + $19-49/client | White-label portal, API, unlimited users per client | MSPs serving 10-100+ clients |

### MSP Volume Discounts
- 25+ clients: $24/mo per client
- 50+ clients: $19/mo per client
- 100+ clients: $15/mo per client (minimum floor)

### All tiers: unlimited users per organization.

## Credit System

| Activity | Credits |
|----------|---------|
| Chat message | 1 |
| Module scoring (AI) | 5 |
| Synthesis run | 10 |
| Roadmap generation | 20 |
| Decision Package | 10 |

**Overage:** Free tier stops hard. Paid tiers warn at 80%, option to buy $10/500 credits.

## Unit Economics

### LLM Cost Per User Per Month

| Activity | Model | Tokens | Cost |
|----------|-------|--------|------|
| Chat (30 msgs/mo) | Haiku | ~90K | ~$0.60 |
| Module scoring (1) | Sonnet | ~3K | ~$0.03 |
| Synthesis (1 run) | Haiku | ~4K | ~$0.01 |
| Decision Package (1) | Sonnet | ~4K | ~$0.04 |
| Roadmap generation (1) | Sonnet | ~8K | ~$0.10 |
| **Light user** | | | **~$0.78/mo** |
| **Heavy user** | | | **~$3.50/mo** |
| **Power user** | | | **~$8.00/mo** |

### Margin Analysis

| Tier | Revenue | Avg LLM Cost | Gross Margin |
|------|---------|-------------|-------------|
| Free | $0 | $0.50-2.00 | -100% (loss leader) |
| Starter ($99) | $99 | $2-5 | **94-97%** |
| Growth ($299) | $299 | $5-15 | **94-97%** |
| MSP/client ($19-49) | $19-49 | $2-8 | **72-95%** |
| MSP/client ($15 min) | $15 | $8 (heavy) | **47%** (risk) |

### Where We Lose Money
1. **Free tier power users** — 50 msgs/day = ~$5/mo. Fix: 10 msg/day cap.
2. **MSP $15/client floor** — Heavy user = 47% margin. Fix: $19 minimum or feature caps.
3. **Roadmap regeneration abuse** — Cache roadmaps, cap regenerations.
4. **Anthropic price hikes** — Abstract LLM layer, use Haiku aggressively.

### Where We Make Most Money
1. Starter tier ($99) — 94-97% margin, cash cow
2. Growth tier ($299) — Same margins, higher absolute $
3. MSP platform fee ($299) — Near-zero marginal cost
4. Cross-sell AI-Strategist & AI-OME — Same infrastructure, additive revenue

## Break-Even Analysis

| Scenario | Monthly Fixed | Users to Break Even |
|----------|--------------|---------------------|
| Solo founder | ~$200 | 3 Starter users |
| Small team (2 people) | ~$8,000 | 80 Starter or 27 Growth |
| Scaled (5 people) | ~$30,000 | 300 Starter or 100 Growth |

## Hidden Costs

- Stripe processing: 2.9% + $0.30/transaction (~$3.17 per $99 charge)
- Churn replacement: 5% monthly churn = 5% new users needed just to stay flat
- Support: even 1 ticket/user/month at $10/ticket = $10/user
- Legal: ToS, privacy policy, AI disclaimer review = $2K-5K one-time
- LLM observability tooling: ~$50-200/mo

## Revenue Projections

| Scenario | Free | Paid | Monthly LLM | Monthly Revenue | Net |
|----------|------|------|------------|----------------|-----|
| Early | 100 | 10 | ~$150 | ~$1,500 | +$1,350 |
| Growing | 1K | 100 | ~$1,200 | ~$15,000 | +$13,800 |
| Scale | 10K | 1K | ~$10,000 | ~$150,000 | +$140,000 |
| Target | 100K | 10K | ~$80,000 | ~$1,500,000 | +$1,420,000 |

## Compared to Alternatives

| | AI-CDIO | Human Fractional CIO | MSP vCIO |
|-|---------|---------------------|----------|
| Monthly cost | $99-299 | $3,000-10,000 | $1,000-5,000 |
| Margin | 94-97% | 50-65% | 30-50% |
| Scale limit | Unlimited | 3-8 clients | 10-20 clients |
| Bias | Vendor-agnostic | Varies | Sells own services |
| Availability | 24/7 | Business hours | Business hours |
