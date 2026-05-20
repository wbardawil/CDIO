-- ============================================================
-- AI-CDIO — schema-v20 (2026-05-20): replace legacy agent_logs schema
--
-- WHY THIS EXISTS
-- ---------------
-- Same drift pattern initiatives had pre-v19. The original schema.sql
-- created an `agent_logs` table with these NOT NULL columns:
--
--   agent_type   text NOT NULL
--   model_used   text NOT NULL
--   action       text NOT NULL
--   input_summary  text
--   output_summary text
--   token_count    integer
--   cost_usd       decimal(8,4)
--   duration_ms    integer
--
-- schema-v10-agent-logs.sql (Phase 1.5 Day 19) intended to land a
-- brand-new cost-telemetry shape (agent_name, model, input_tokens,
-- output_tokens, cache_create_tokens, cache_read_tokens, cost_cents,
-- latency_ms, status, error_code, metadata jsonb). But v10 used
--
--   CREATE TABLE IF NOT EXISTS public.agent_logs ( ... )
--
-- which silently no-op'd in any environment where the original
-- schema.sql agent_logs already existed. The follow-up
-- ADD COLUMN IF NOT EXISTS statements added the NEW columns on top
-- of the OLD ones, producing a HYBRID schema in prod:
--
--   - agent_type / model_used / action: still NOT NULL  (LEGACY — blocks)
--   - agent_name / model: nullable text                 (ALTER ADD COLUMN
--                                                        cannot add NOT NULL
--                                                        without a DEFAULT
--                                                        when rows exist)
--   - all the new token/cost/status columns, nullable
--
-- The Anthropic-call wrapper (src/lib/observability/agent-logs.ts) writes
-- only the NEW columns. Every insert therefore fails with NOT NULL
-- violations on agent_type / model_used / action — and the wrapper's
-- writeRow() catches+swallows the error so the user never sees it
-- (telemetry must never throw into a user-facing request path).
--
-- Net effect: cost / latency / cache-savings telemetry has been a
-- complete black hole since v10 shipped. The Phase 2 Day 37-38
-- pricing decision is locked to "final numbers from Day 19+
-- cost-per-engagement telemetry" (CLAUDE.md Strategic Decisions),
-- so this drift is on the pricing critical path.
--
-- A SECOND writer exists at
--   src/app/api/stakeholders/[id]/send-assessment-email/route.ts
-- which logged email-send audit rows using the LEGACY column names
-- (agent_type / model_used / action / input_summary / output_summary /
-- token_count / cost_usd / duration_ms). Under the hybrid schema those
-- inserts succeeded (legacy columns were still NOT NULL with values,
-- new columns were nullable). The drop+recreate below loses those
-- rows. Decision: lose them (email-send audit is not load-bearing
-- compliance data; the resend_id and routed_to dimensions live in
-- Resend's own dashboard). That writer is being updated in the same
-- commit to write the new column shape, with the legacy fields
-- captured under metadata jsonb so query-by-action and intended-email
-- traces are preserved going forward.
--
-- FIX
-- ---
-- Drop agent_logs entirely (CASCADE handles the agent_logs_daily view
-- and the schema.sql index idx_agent_logs_org that point into it) and
-- recreate per the v10 design exactly. Verified before destruction:
--   - All current readers (scripts/inspect-db.js, scripts/check-grants.js,
--     src/app/settings/mcp/page.tsx, src/app/privacy/page.tsx,
--     src/app/api/clients/[orgId]/route.ts) reference the table by name
--     only and do not read the legacy column names.
--   - The two writers are accounted for: Anthropic-call wrapper writes
--     the new shape (already correct), and the email-send route is
--     being patched in the same commit.
--   - schema-v7-orphan-sandbox.sql's purge_org_data() function deletes
--     by org_id only; column rename does not affect it.
--
-- Idempotent: re-running is safe (IF EXISTS / fresh recreate).
-- ============================================================

-- ----- destroy the hybrid table + its view + legacy index ------
DROP VIEW  IF EXISTS public.agent_logs_daily;
DROP TABLE IF EXISTS public.agent_logs CASCADE;

-- ----- recreate per v10 design (no IF NOT EXISTS this time) ----
CREATE TABLE public.agent_logs (
  id            uuid              PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    timestamptz       NOT NULL DEFAULT now(),

  -- Tenant scope. Optional because some calls (e.g. public Quick
  -- Scan) don't yet have an org context. Keep both lookups indexed
  -- so per-org rollups are cheap.
  org_id          uuid            REFERENCES public.organizations(id) ON DELETE SET NULL,
  practitioner_id uuid            REFERENCES public.practitioners(id) ON DELETE SET NULL,

  -- The agent / surface this call came from. String not enum so
  -- new agents can be added without a schema migration.
  -- Examples: "assessment.scoreModule", "assessment.generateNarrativeAndPath",
  -- "strategy.generateRoadmap", "conversation.reply", "decision.facilitate",
  -- "scan.adaptiveSelect", "email.sendAssessment"
  agent_name    text              NOT NULL,

  -- The model / provider identifier this call hit. e.g.
  -- "claude-sonnet-4-20250514", "claude-haiku-4-5-20251001", "resend".
  model         text              NOT NULL,

  -- Token economics. Uncached + cached input tracked separately so
  -- prompt-caching savings are measurable. Zero for non-LLM calls
  -- (email, future webhook telemetry, etc.).
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
  -- migration each time a new dimension is added. Also captures the
  -- legacy email-audit fields (action, intended_email, resend_id,
  -- routed_to, is_sandbox) so historical query patterns still work
  -- against the new shape.
  metadata      jsonb             NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX agent_logs_org_id_idx
  ON public.agent_logs(org_id, created_at DESC)
  WHERE org_id IS NOT NULL;

CREATE INDEX agent_logs_practitioner_id_idx
  ON public.agent_logs(practitioner_id, created_at DESC)
  WHERE practitioner_id IS NOT NULL;

CREATE INDEX agent_logs_agent_name_idx
  ON public.agent_logs(agent_name, created_at DESC);

CREATE INDEX agent_logs_model_idx
  ON public.agent_logs(model, created_at DESC);

-- Read-only rollup view. Per-org per-day cost. Phase 3 dashboard
-- (P1-22) reads from this rather than running aggregates on the
-- raw table.
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

-- RLS + service_role-scoped policy. Final v18 posture: FOR ALL TO
-- service_role so an accidental future grant cannot reopen anon
-- access via the policy path. service_role has BYPASSRLS so app
-- behavior is unchanged.
ALTER TABLE public.agent_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS agent_logs_service_full_access ON public.agent_logs;
CREATE POLICY agent_logs_service_full_access
  ON public.agent_logs
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

GRANT ALL ON public.agent_logs TO service_role;
-- anon/authenticated revoked per schema-v18 (cso Finding 1) — RLS-only access.
