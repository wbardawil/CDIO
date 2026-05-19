-- ============================================================
-- AI-CDIO — schema-v10 (Phase 1.5 Day 19)
--
-- Cost-per-engagement telemetry. Wired into every Anthropic call
-- so unit economics (cost per client per month) is empirical from
-- Day 1 of public exposure rather than guessed at Phase 3 pricing.
--
-- Per-LLM-call row. Aggregates roll up by org_id, day, model.
--
-- Required for:
--   - Phase 2 Day 35-38 pricing decision (P1-19)
--   - Phase 3 Day 59 metrics dashboard (P1-22)
--   - Operating-cost truth before any tier price change
--
-- Idempotent — uses IF NOT EXISTS so the file can be re-applied
-- to an already-migrated database safely.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.agent_logs (
  id            uuid              PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    timestamptz       NOT NULL DEFAULT now(),

  -- Tenant scope. Optional because some calls (e.g. public Quick
  -- Scan) don't yet have an org context. Keep both lookups indexed
  -- so per-org rollups are cheap.
  org_id        uuid              REFERENCES public.organizations(id) ON DELETE SET NULL,
  practitioner_id uuid            REFERENCES public.practitioners(id) ON DELETE SET NULL,

  -- The agent / surface this call came from. String not enum so
  -- new agents can be added without a schema migration.
  -- Examples: "assessment.scoreModule", "assessment.generateNarrativeAndPath",
  -- "strategy.generateRoadmap", "conversation.reply", "decision.facilitate",
  -- "scan.adaptiveSelect"
  agent_name    text              NOT NULL,

  -- The Claude model the call hit. e.g.
  -- "claude-sonnet-4-20250514", "claude-haiku-4-5-20251001".
  model         text              NOT NULL,

  -- Token economics. Uncached + cached input tracked separately so
  -- prompt-caching savings are measurable.
  input_tokens          int       NOT NULL DEFAULT 0,
  output_tokens         int       NOT NULL DEFAULT 0,
  cache_create_tokens   int       NOT NULL DEFAULT 0,
  cache_read_tokens     int       NOT NULL DEFAULT 0,

  -- Computed cost in USD cents (integer to avoid float math). NULL
  -- when the model has no published price the writer recognized;
  -- the rollup query treats NULL as "unknown, exclude from cost
  -- aggregates" rather than zero.
  cost_cents    int               NULL,

  -- Latency in milliseconds — used to spot cost-vs-time tradeoffs.
  latency_ms    int               NULL,

  -- The status of the call. "ok" | "error" | "rate_limited" | "timeout"
  status        text              NOT NULL DEFAULT 'ok',
  error_code    text              NULL,

  -- Optional free-form metadata for cohort analysis later — module
  -- number, stakeholder role, etc. Kept JSON to avoid forcing a
  -- migration each time a new dimension is added.
  metadata      jsonb             NOT NULL DEFAULT '{}'::jsonb
);

-- Reconcile a pre-existing agent_logs table (from an earlier or
-- partial migration) to the target shape. ADD COLUMN IF NOT EXISTS
-- is idempotent: a no-op when the table was just created above, and
-- the fix when an older table is missing columns the indexes and
-- rollup view below depend on. This is what makes the file safe to
-- apply against a database in any prior state.
ALTER TABLE public.agent_logs ADD COLUMN IF NOT EXISTS org_id uuid;
ALTER TABLE public.agent_logs ADD COLUMN IF NOT EXISTS practitioner_id uuid;
ALTER TABLE public.agent_logs ADD COLUMN IF NOT EXISTS agent_name text;
ALTER TABLE public.agent_logs ADD COLUMN IF NOT EXISTS model text;
ALTER TABLE public.agent_logs ADD COLUMN IF NOT EXISTS input_tokens int NOT NULL DEFAULT 0;
ALTER TABLE public.agent_logs ADD COLUMN IF NOT EXISTS output_tokens int NOT NULL DEFAULT 0;
ALTER TABLE public.agent_logs ADD COLUMN IF NOT EXISTS cache_create_tokens int NOT NULL DEFAULT 0;
ALTER TABLE public.agent_logs ADD COLUMN IF NOT EXISTS cache_read_tokens int NOT NULL DEFAULT 0;
ALTER TABLE public.agent_logs ADD COLUMN IF NOT EXISTS cost_cents int;
ALTER TABLE public.agent_logs ADD COLUMN IF NOT EXISTS latency_ms int;
ALTER TABLE public.agent_logs ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'ok';
ALTER TABLE public.agent_logs ADD COLUMN IF NOT EXISTS error_code text;
ALTER TABLE public.agent_logs ADD COLUMN IF NOT EXISTS metadata jsonb NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS agent_logs_org_id_idx
  ON public.agent_logs(org_id, created_at DESC)
  WHERE org_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS agent_logs_practitioner_id_idx
  ON public.agent_logs(practitioner_id, created_at DESC)
  WHERE practitioner_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS agent_logs_agent_name_idx
  ON public.agent_logs(agent_name, created_at DESC);

CREATE INDEX IF NOT EXISTS agent_logs_model_idx
  ON public.agent_logs(model, created_at DESC);

-- Read-only rollup view. Per-org per-day cost. Phase 3 dashboard
-- (P1-22) reads from this rather than running aggregates on the
-- raw table.
-- DROP first: CREATE OR REPLACE VIEW fails if an older view exists
-- with a different column set (the pre-existing-table case above).
DROP VIEW IF EXISTS public.agent_logs_daily;
CREATE VIEW public.agent_logs_daily AS
SELECT
  date_trunc('day', created_at)        AS day,
  org_id,
  practitioner_id,
  model,
  COUNT(*)                             AS calls,
  SUM(input_tokens)                    AS input_tokens,
  SUM(output_tokens)                   AS output_tokens,
  SUM(cache_create_tokens)             AS cache_create_tokens,
  SUM(cache_read_tokens)               AS cache_read_tokens,
  SUM(COALESCE(cost_cents, 0))         AS cost_cents,
  AVG(latency_ms)::int                 AS avg_latency_ms,
  COUNT(*) FILTER (WHERE status <> 'ok') AS failed_calls
FROM public.agent_logs
GROUP BY 1, 2, 3, 4;

-- Optional row-level security. Tenant separation lives in the
-- application layer today (assertPractitionerOwnsOrg), and the
-- agent_logs writer uses the service role. Enable RLS but keep
-- a permissive policy until we move per-user JWTs (P0-8 mitigated
-- per docs/GAPS.md).
ALTER TABLE public.agent_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS agent_logs_service_full_access ON public.agent_logs;
CREATE POLICY agent_logs_service_full_access
  ON public.agent_logs
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Table-privilege grant (added 2026-05-18). RLS/BYPASSRLS do NOT
-- substitute for table GRANTs: without this, API-role writes fail
-- with SQLSTATE 42501. Idempotent; mirrors the schema-v16 precedent.
GRANT ALL ON public.agent_logs TO service_role;  -- anon/authenticated revoked: see schema-v18 (cso Finding 1)
