-- ============================================================
-- AI-CDIO — Database Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable pgvector for RAG
create extension if not exists vector;

-- Enable Row Level Security on all tables
-- (RLS policies added at the bottom)

-- ============================================================
-- ORGANIZATIONS
-- ============================================================
create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  size_category text not null check (size_category in ('small', 'medium', 'large')),
  employee_count integer not null,
  industry text not null check (industry in (
    'healthcare', 'financial_services', 'manufacturing',
    'professional_services', 'retail_ecommerce', 'technology',
    'education', 'other'
  )),
  engagement_model text not null default 'strategic' check (engagement_model in (
    'advisory', 'strategic', 'hybrid', 'executive'
  )),
  monthly_hours integer not null default 10,
  clerk_org_id text unique,  -- links to Clerk organization
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- STAKEHOLDERS
-- ============================================================
create table stakeholders (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  email text not null,
  role text not null,  -- e.g. "CEO", "CTO", "CFO", "IT Director"
  influence_level text not null default 'contributor' check (influence_level in (
    'decision_maker', 'influencer', 'contributor'
  )),
  relevant_modules integer[] not null default '{}',
  assessment_token text unique,  -- unique token for assessment link
  created_at timestamptz not null default now(),
  unique(org_id, email)
);

-- ============================================================
-- ASSESSMENTS
-- ============================================================
create table assessments (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  type text not null default 'initial' check (type in ('initial', 'quarterly', 'annual')),
  status text not null default 'draft' check (status in ('draft', 'in_progress', 'completed', 'archived')),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

-- ============================================================
-- MODULE SCORES (one per module per stakeholder per assessment)
-- ============================================================
create table module_scores (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references assessments(id) on delete cascade,
  stakeholder_id uuid not null references stakeholders(id) on delete cascade,
  module_number integer not null check (module_number between 1 and 16),
  maturity_score integer not null check (maturity_score between 1 and 4),
  evidence text not null default '',
  diagnostic_responses jsonb not null default '[]',
  business_impact_rating integer check (business_impact_rating between 1 and 10),
  created_at timestamptz not null default now(),
  unique(assessment_id, stakeholder_id, module_number)
);

-- ============================================================
-- ASSESSMENT SYNTHESIS (computed aggregate per module)
-- ============================================================
create table assessment_synthesis (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references assessments(id) on delete cascade,
  module_number integer not null check (module_number between 1 and 16),
  consensus_score numeric(3,2) not null,       -- weighted avg (1.00-4.00)
  divergence_score numeric(3,2) not null,      -- std deviation
  business_impact numeric(4,2) not null,       -- 1-10 weighted
  priority_rank integer not null,              -- 1-16
  priority_class text not null check (priority_class in (
    'top_priority', 'strategic_bet', 'quick_win', 'maintain', 'defer'
  )),
  recommended_actions text[] not null default '{}',
  created_at timestamptz not null default now(),
  unique(assessment_id, module_number)
);

-- ============================================================
-- DIVERGENCE POINTS (where stakeholders disagree)
-- ============================================================
create table divergence_points (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references assessments(id) on delete cascade,
  module_number integer not null,
  stakeholder_a_id uuid not null references stakeholders(id),
  stakeholder_b_id uuid not null references stakeholders(id),
  score_gap integer not null,
  framework_recommendation text not null,
  decision_package jsonb not null default '{}',
  resolution text,        -- what was decided
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

-- ============================================================
-- ROADMAPS
-- ============================================================
create table roadmaps (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  assessment_id uuid not null references assessments(id),
  type text not null check (type in ('90_day', '6_month', '12_month')),
  status text not null default 'draft' check (status in ('draft', 'approved', 'active', 'completed')),
  content jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- INITIATIVES (individual work items in a roadmap)
-- ============================================================
create table initiatives (
  id uuid primary key default gen_random_uuid(),
  roadmap_id uuid not null references roadmaps(id) on delete cascade,
  module_numbers integer[] not null default '{}',
  title text not null,
  description text not null default '',
  priority_class text not null check (priority_class in (
    'top_priority', 'strategic_bet', 'quick_win', 'maintain', 'defer'
  )),
  value_score integer not null check (value_score between 1 and 10),
  effort_score integer not null check (effort_score between 1 and 10),
  status text not null default 'planned' check (status in (
    'planned', 'in_progress', 'completed', 'deferred'
  )),
  start_date date,
  end_date date,
  expected_roi text,
  owner text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- DECISIONS (tracks leadership team decisions + outcomes)
-- ============================================================
create table decisions (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  assessment_id uuid references assessments(id),
  topic text not null,
  stakeholder_positions jsonb not null default '[]',
  framework_recommendation text not null,
  actual_decision text,
  projected_outcome text,
  actual_outcome text,
  outcome_accuracy numeric(3,2),  -- 0.00-1.00
  decided_at timestamptz,
  outcome_measured_at timestamptz,
  created_at timestamptz not null default now()
);

-- ============================================================
-- PLAYBOOK EMBEDDINGS (RAG vector store)
-- ============================================================
create table playbook_chunks (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  embedding vector(1536),
  metadata jsonb not null default '{}',
  -- metadata includes: module_numbers, domain_cluster, content_type,
  -- org_size_relevance, industry_relevance, source_file
  created_at timestamptz not null default now()
);

-- Index for vector similarity search
create index on playbook_chunks using ivfflat (embedding vector_cosine_ops) with (lists = 20);

-- ============================================================
-- AGENT AUDIT LOG
-- ============================================================
create table agent_logs (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id),
  agent_type text not null,
  model_used text not null,
  action text not null,
  input_summary text,
  output_summary text,
  token_count integer,
  cost_usd numeric(8,4),
  duration_ms integer,
  created_at timestamptz not null default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table organizations enable row level security;
alter table stakeholders enable row level security;
alter table assessments enable row level security;
alter table module_scores enable row level security;
alter table assessment_synthesis enable row level security;
alter table divergence_points enable row level security;
alter table roadmaps enable row level security;
alter table initiatives enable row level security;
alter table decisions enable row level security;
alter table agent_logs enable row level security;

-- Playbook chunks are global (read-only for all)
alter table playbook_chunks enable row level security;
create policy "Playbook chunks are readable by all" on playbook_chunks
  for select using (true);

-- ============================================================
-- HELPER INDEXES
-- ============================================================
create index idx_stakeholders_org on stakeholders(org_id);
create index idx_stakeholders_token on stakeholders(assessment_token);
create index idx_assessments_org on assessments(org_id);
create index idx_module_scores_assessment on module_scores(assessment_id);
create index idx_module_scores_stakeholder on module_scores(stakeholder_id);
create index idx_synthesis_assessment on assessment_synthesis(assessment_id);
create index idx_divergence_assessment on divergence_points(assessment_id);
create index idx_roadmaps_org on roadmaps(org_id);
create index idx_initiatives_roadmap on initiatives(roadmap_id);
create index idx_decisions_org on decisions(org_id);
create index idx_agent_logs_org on agent_logs(org_id);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger organizations_updated_at
  before update on organizations
  for each row execute function update_updated_at();

create trigger roadmaps_updated_at
  before update on roadmaps
  for each row execute function update_updated_at();
