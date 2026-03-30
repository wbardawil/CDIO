# AI-CDIO: Technical Architecture

## System Overview

```
PRESENTATION LAYER
├── Chat Interface (PRIMARY — free, no auth)
├── Action Cards ("do this now" + Done/Help/Skip)
├── Health Dashboard (spider chart, priority matrix)
├── Assessment Forms (structured 16-module path)
├── Weekly Digest (email: 1 action + 1 insight)
└── Partner Portal (white-label for MSPs)

CONVERSATION LAYER
└── Conversation Agent
    ├── Maps natural language → diagnostic questions
    ├── Tracks implicit module scores from chat
    ├── Asks 3-5 targeted questions per pain point
    ├── Delivers immediate value (answer + 1 action)
    └── Decides: quick answer vs deep-dive offer

INTELLIGENCE LAYER
├── Assessment Agent (AI scoring with evidence)
├── Strategy Agent (roadmap + action card generation)
├── Action Generator (step-by-step action cards)
├── Decision Facilitation Agent (divergence resolution)
└── Benchmark Engine (vs similar companies)

KNOWLEDGE LAYER
├── RAG: 1,154 playbook chunks (30 files indexed)
├── Diagnostic Questions: 70+ across 16 modules
├── Maturity Scoring + Prioritization Engine
└── Module Stacks + Industry Adaptations

DATA LAYER (Supabase + PostgreSQL)
├── organizations, stakeholders, assessments
├── module_scores, assessment_synthesis
├── divergence_points, roadmaps, initiatives
├── conversations, action_cards
├── playbook_chunks (pgvector)
├── agent_logs, decisions
└── [planned] benchmarks, partners, issues
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 + TypeScript + Tailwind CSS |
| Auth | Clerk (planned) |
| AI | Claude Sonnet 4 (reasoning) + Haiku 4.5 (execution) |
| Database | Supabase (PostgreSQL + Row Level Security) |
| Vector Store | pgvector (inside Supabase) |
| Email | Resend (planned) |
| Charts | Recharts |
| Hosting | Vercel (planned) |

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/agents/conversation.ts` | Conversation Agent — chat-first entry |
| `src/lib/agents/assessment.ts` | Assessment Agent — AI module scoring |
| `src/lib/agents/strategy.ts` | Strategy Agent — roadmap generation |
| `src/lib/agents/orchestrator.ts` | Engagement Orchestrator — state machine |
| `src/lib/scoring/maturity.ts` | Scoring engine — consensus, divergence, prioritization |
| `src/lib/scoring/rule-based.ts` | Fallback scoring without AI |
| `src/lib/playbook/diagnostic-questions.ts` | 70+ diagnostic questions, 16 modules |
| `src/lib/playbook/retrieve.ts` | RAG retrieval from playbook chunks |
| `src/lib/playbook/ingest.ts` | Playbook ingestion pipeline |
| `src/lib/db/supabase.ts` | Supabase client |
| `src/lib/db/schema.sql` | Core database schema |
| `src/lib/db/schema-v2.sql` | Chat + action cards schema |
| `src/types/index.ts` | Type definitions + module constants |

## Data Model

Core entities: organizations → stakeholders → assessments → module_scores → assessment_synthesis → divergence_points → roadmaps → initiatives → decisions

Chat entities: conversations → action_cards

All tables include `domain` field (`cdio` | `strategist` | `ome`) for future multi-agent support.

## MCP Integration Roadmap

| Phase | Integrations |
|-------|-------------|
| Phase 1 (Current) | Self-contained, no external integrations |
| Phase 2 | Google Workspace / M365, Cloud Provider APIs, Calendar |
| Phase 3 | Security scanning, Uptime monitoring, SaaS management |
| Phase 4 | Slack/Teams, Jira/Linear, Accounting (QuickBooks/Xero) |

Principle: Integrations enrich the AI's understanding. They never make us a tool vendor.
