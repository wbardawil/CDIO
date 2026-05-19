-- ============================================================
-- AI-CDIO — schema-v15 (Phase 1D Day 28)
--
-- MCP (Model Context Protocol) server foundation. Per
-- Architectural Law 7: MCP-first as a distribution channel,
-- not a headline.
--
-- Practitioners issue an MCP token for themselves and configure
-- their Claude / Cursor / Codex / ChatGPT to call AI-CDIO from
-- inside whichever AI surface they already trust. Tokens
-- authenticate the practitioner; the MCP server filters every
-- query to the practitioner's owned orgs.
--
-- Idempotent.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.mcp_tokens (
  id              uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      timestamptz   NOT NULL DEFAULT now(),

  practitioner_id uuid          NOT NULL REFERENCES public.practitioners(id) ON DELETE CASCADE,

  token           text          UNIQUE NOT NULL,

  label           text          NULL,  -- e.g. "Claude.ai", "Cursor"

  expires_at      timestamptz   NULL,
  revoked_at      timestamptz   NULL,
  last_used_at    timestamptz   NULL,
  use_count       int           NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS mcp_tokens_practitioner_id_idx
  ON public.mcp_tokens(practitioner_id, created_at DESC);

ALTER TABLE public.mcp_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS mcp_tokens_service_full_access ON public.mcp_tokens;
CREATE POLICY mcp_tokens_service_full_access
  ON public.mcp_tokens FOR ALL USING (true) WITH CHECK (true);

-- Table-privilege grant (added 2026-05-18). RLS/BYPASSRLS do NOT
-- substitute for table GRANTs: without this, API-role writes fail
-- with SQLSTATE 42501. Idempotent; mirrors the schema-v16 precedent.
GRANT ALL ON public.mcp_tokens TO service_role;  -- anon/authenticated revoked: see schema-v18 (cso Finding 1)
