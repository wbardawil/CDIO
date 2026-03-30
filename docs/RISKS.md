# AI-CDIO: Risk Matrix & Mitigation

## Risk Matrix

| # | Risk | Likelihood | Impact | Mitigation |
|---|------|-----------|--------|------------|
| R1 | LLM costs exceed revenue at scale | Medium | High | Haiku for free tier, caching, rate limits, credit system |
| R2 | Low freemium conversion (<1%) | Medium | High | Strong activation triggers, value-before-signup, invitation-only launch |
| R3 | Competitor with more resources enters | High | Medium | Speed to market + data moat + niche technology focus |
| R4 | AI gives dangerous advice (liability) | Low | Very High | Disclaimer, human review sampling, professional liability insurance |
| R5 | MSP partners don't adopt | Medium | Medium | Start with 3, prove ROI, then scale. Invitation-only creates leverage. |
| R6 | User data breach | Low | Very High | Supabase RLS, encryption at rest, SOC 2 path |
| R7 | Anthropic API changes or price hikes | Medium | High | Abstract LLM layer, multi-provider readiness, use Haiku aggressively |
| R8 | Playbook IP extraction via chat | Medium | Medium | System prompt obfuscation, output monitoring, ToS restrictions |
| R9 | Competitor scrapes free tier | Low | Medium | Rate limiting, session validation, anti-bot measures |
| R10 | Single founder risk | High | High | Document everything, automated systems, eventual team |
| R11 | Regulatory changes (AI governance) | Medium | Medium | Monitor legislation, build compliance hooks early |
| R12 | Free tier bleeding cash | High | Medium | 10 msg/day cap, Haiku only, 3 deep-dive limit |

## Cost Control Measures (Priority Order)

| # | Measure | Status | Impact |
|---|---------|--------|--------|
| 1 | Model routing: Haiku for chat, Sonnet for scoring only | Partially built | 80-90% cost reduction |
| 2 | Per-tier message caps | Not built | Prevents free tier abuse |
| 3 | Response caching (24h for similar questions) | Not built | 30-50% fewer API calls |
| 4 | Per-org token budget in agent_logs | Schema exists, not enforced | Hard spending cap |
| 5 | Daily spend monitoring + circuit breaker | Not built | Emergency stop for runaway costs |
| 6 | Anthropic API dashboard alerts | Not configured | Early warning |
| 7 | Invitation-only launch | Planned | Controls user volume directly |

## Monthly Spend Ceiling Scenarios

| Users (Free/Paid) | LLM Cost | Revenue | Net |
|-------------------|----------|---------|-----|
| 100 / 10 | ~$150 | ~$1,500 | +$1,350 |
| 1K / 100 | ~$1,200 | ~$15,000 | +$13,800 |
| 10K / 1K | ~$10,000 | ~$150,000 | +$140,000 |
| 100K / 10K | ~$80,000 | ~$1,500,000 | +$1,420,000 |

## Open Questions

| # | Question | Impact | Status |
|---|----------|--------|--------|
| 1 | Who handles billing? (Stripe integration) | Must-have before charging | Not built |
| 2 | Mid-cycle upgrade handling? Prorated? | Operational complexity | Not designed |
| 3 | How do MSPs onboard clients? Self-service or guided? | MSP adoption speed | Not designed |
| 4 | Multi-currency for global market? | International growth | Not considered |
| 5 | MSP territory/exclusivity if two compete for same client? | Channel conflict | Not addressed |
| 6 | Data residency for EU clients? | GDPR compliance | Supabase US-based |
| 7 | First MSP partner onboarding experience? | Template for all partners | Not designed |
| 8 | How to measure + communicate ROI to users? | Retention driver | Partially designed |
| 9 | What if Anthropic deprecates current models? | Migration required | No abstraction layer |
| 10 | Seasonal usage patterns? | Revenue predictability | Not modeled |
| 11 | Support model? Self-service, email, chat? | Cost structure impact | Not decided |
| 12 | How to prevent playbook extraction via chat? | IP protection | Not implemented |
| 13 | Anti-scraping measures for free tier? | Data protection | Not built |
| 14 | Multi-language timeline? | 1M worldwide target | Not planned |
| 15 | What defines "impacted" in the 1M goal? | Metric clarity | Not defined |
