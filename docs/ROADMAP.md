# AI-CDIO: Product Roadmap

## Current State (What's Built)

### Core Engine (Complete)
- [x] 16-module diagnostic framework (70+ questions)
- [x] AI-powered maturity scoring (Claude Sonnet)
- [x] Rule-based scoring fallback
- [x] Prioritization engine (Value vs Effort, Module Stack Recommender)
- [x] Divergence detection (multi-stakeholder)
- [x] AI Decision Packages with projected ROI
- [x] RAG layer (1,154 playbook chunks from 30 files)

### Assessment Pipeline (Complete)
- [x] Onboarding flow (org + stakeholders)
- [x] Stakeholder assessment forms (unique token links)
- [x] Multi-stakeholder synthesis
- [x] 90-day roadmap generation (AI Strategy Agent)

### Chat Layer (Complete)
- [x] Conversation Agent with pain-point routing
- [x] Chat API endpoint
- [x] Chat UI with grouped pain-point chips
- [x] Problem, Aspirational, and Discovery entry paths
- [x] AI disclosure in chat footer

### Dashboard (Complete)
- [x] Spider chart (maturity radar)
- [x] Priority matrix (business impact vs maturity)
- [x] Divergence report with Decision Packages
- [x] Team progress tracking
- [x] Live Supabase data (no demo data)

### Infrastructure (Complete)
- [x] Next.js 15 + TypeScript + Tailwind
- [x] Supabase (PostgreSQL + RLS)
- [x] pgvector for RAG
- [x] GitHub repo (wbardawil/CDIO)
- [x] Anthropic API integration

---

## Phase 1: Alpha Launch (Weeks 1-2)

### Must-Have for Alpha
- [ ] Deploy to Vercel (live URL)
- [ ] Waitlist landing page
- [ ] Invite code system (simple: codes in DB, validate on entry)
- [ ] Action Card UI component (Done/Help/Skip)
- [ ] Basic error handling for AI failures

### Nice-to-Have for Alpha
- [ ] Streaming chat responses
- [ ] Mobile-responsive chat

---

## Phase 2: Beta Launch (Weeks 3-6)

### Must-Have for Beta
- [ ] User authentication (Clerk)
- [ ] Conversation persistence across sessions
- [ ] Rate limiting on all API routes
- [ ] Terms of Service
- [ ] Privacy Policy
- [ ] AI disclaimer (formal legal)
- [ ] Error monitoring (Sentry)
- [ ] LLM observability (Langfuse)
- [ ] Basic customer support (email)
- [ ] Onboarding sequence for new users
- [ ] Analytics dashboard (for admin)

### Nice-to-Have for Beta
- [ ] Response caching
- [ ] Automated tests (scoring engine)
- [ ] Cookie consent
- [ ] Feedback collection mechanism

---

## Phase 3: Early Access (Weeks 7-12)

### Must-Have
- [ ] Billing system (Stripe)
- [ ] Credit/usage tracking + limits
- [ ] MSP partner portal (basic white-label)
- [ ] Initiative tracking UI
- [ ] Issue reporting through chat
- [ ] Progress visualization for users
- [ ] Quality monitoring for AI responses
- [ ] "Need Help" escalation path
- [ ] Case studies from Beta users

### Nice-to-Have
- [ ] Annual pricing option
- [ ] Referral program
- [ ] Industry benchmarks (static)
- [ ] PDF report export
- [ ] Email digest (weekly action + insight)

---

## Phase 4: Open Launch (Month 4+)

### Must-Have
- [ ] Proven unit economics from Early Access
- [ ] CI/CD pipeline
- [ ] SEO + content strategy
- [ ] MSP partner onboarding kit
- [ ] Competitive positioning page
- [ ] Anti-abuse measures
- [ ] IP protection for playbook content
- [ ] LLM abstraction layer (multi-provider)

### Nice-to-Have
- [ ] Multi-language support
- [ ] GDPR compliance + data residency
- [ ] Multi-region deployment
- [ ] Community features
- [ ] Marketplace listing (AWS/Azure)

---

## Phase 5: Platform (Month 6+)

- [ ] AI-Strategist agent (business strategy)
- [ ] AI-OME agent (operational excellence)
- [ ] Cross-agent intelligence (shared context)
- [ ] Meta-orchestrator for AI C-Suite
- [ ] Multi-company portfolio dashboard
- [ ] Cross-client anonymized benchmarking
- [ ] Custom playbook support
- [ ] Partner API
- [ ] White-label mobile app

---

## Initiative, Issue & Problem Lifecycle

```
ISSUES (reactive)          INITIATIVES (proactive)
  ↓                              ↓
  AI triages                 AI breaks into phases
  ↓                              ↓
  └───────→ ACTION CARDS ←───────┘
            Done / Help / Skip
                  ↓
            Score updates → Next action → ROI tracked
```

### Implementation Order
1. Action Cards (Phase 1)
2. Initiative tracking (Phase 3)
3. Issue reporting + triage (Phase 3)
4. Full lifecycle automation (Phase 4)
