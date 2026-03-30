-- ============================================================
-- AI-CDIO v2 — Schema Additions for Chat-First Architecture
-- Run this in Supabase SQL Editor (additive, does not modify existing tables)
-- ============================================================

-- ============================================================
-- CONVERSATIONS (chat history + implicit scoring state)
-- ============================================================
create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete cascade,
  session_id text not null,  -- anonymous sessions before auth
  messages jsonb not null default '[]',
  implicit_scores jsonb not null default '{}',  -- { module_number: { score, confidence, evidence } }
  pain_points text[] not null default '{}',
  modules_explored integer[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- ACTION CARDS (prioritized "do this now" items)
-- ============================================================
create table if not exists action_cards (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete cascade,
  conversation_id uuid references conversations(id),
  module_number integer not null check (module_number between 1 and 16),
  title text not null,
  why text not null,
  how_steps jsonb not null default '[]',  -- ["Step 1...", "Step 2..."]
  time_estimate text,       -- "~2 hours"
  cost_estimate text,       -- "Free" or "$500-1000"
  impact text not null,     -- "Blocks 99% of credential attacks"
  priority_score integer not null default 5,
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'completed', 'skipped')),
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

-- ============================================================
-- RLS + GRANTS
-- ============================================================
alter table conversations enable row level security;
alter table action_cards enable row level security;

grant all on conversations to service_role, anon, authenticated;
grant all on action_cards to service_role, anon, authenticated;

-- ============================================================
-- INDEXES
-- ============================================================
create index if not exists idx_conversations_session on conversations(session_id);
create index if not exists idx_conversations_org on conversations(org_id);
create index if not exists idx_action_cards_org on action_cards(org_id);
create index if not exists idx_action_cards_status on action_cards(status);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
create trigger conversations_updated_at
  before update on conversations
  for each row execute function update_updated_at();
