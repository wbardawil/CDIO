-- ============================================================
-- AI-CDIO — schema-v14 (Phase 1D Day 26 + Day 27)
--
-- CADENCE + STATUS REPORTS.
--
-- Cadence is the read-only client-facing view of the engagement.
-- Token-based magic link (no Clerk account, no paying seat for
-- the client) per Architectural Law 6 (Token-based contextual
-- access for non-paying participants). The Cadence link is the
-- engagement renewal-lock-in mechanism per Architectural Law 5
-- (Cadence-as-primitive).
--
-- Status Reports are practitioner-authored / auto-generated
-- monthly digests of the engagement state. The Cadence view
-- pulls the latest Status Report + active Initiatives + open
-- Selections + recent Decision Packages.
--
-- Idempotent.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.cadence_tokens (
  id              uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      timestamptz   NOT NULL DEFAULT now(),

  org_id          uuid          NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  practitioner_id uuid          NOT NULL REFERENCES public.practitioners(id) ON DELETE RESTRICT,

  token           text          UNIQUE NOT NULL,

  -- Optional label so the practitioner can have multiple tokens
  -- (one for the CEO, one for the board, etc.). Different tokens
  -- can have different expiry / scope without re-issuing.
  label           text          NULL,

  expires_at      timestamptz   NULL,
  revoked_at      timestamptz   NULL,
  last_used_at    timestamptz   NULL
);

CREATE INDEX IF NOT EXISTS cadence_tokens_org_id_idx
  ON public.cadence_tokens(org_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.status_reports (
  id              uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      timestamptz   NOT NULL DEFAULT now(),
  updated_at      timestamptz   NOT NULL DEFAULT now(),

  org_id          uuid          NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  practitioner_id uuid          NOT NULL REFERENCES public.practitioners(id) ON DELETE RESTRICT,

  -- The reporting period.
  period_start    date          NOT NULL,
  period_end      date          NOT NULL,

  -- Title / shipping notes. Practitioner-edited; defaults
  -- generated when auto-generating (e.g. "April 2026 Status
  -- Report").
  title           text          NOT NULL,

  -- Headline narrative the CEO reads first. 3-5 sentences.
  headline        text          NOT NULL DEFAULT '',

  -- Structured payload: progress against the 90-Day Commitment
  -- Matrix milestones, initiative summary, decision summary,
  -- next-period focus. Stored as jsonb so the shape can evolve
  -- without migrations.
  --
  -- Shape:
  --   {
  --     commitment_milestones_hit: number,
  --     commitment_milestones_total: 6,
  --     initiative_summary: { active, blocked, done, total },
  --     decision_summary: { open, recommended, decided, total },
  --     wins: text[],
  --     blockers: text[],
  --     next_period_focus: text[],
  --     module_score_changes: { module_number, before, after, narrative }[]
  --   }
  payload         jsonb         NOT NULL DEFAULT '{}'::jsonb,

  -- Visibility flag. "draft" = practitioner only, "published" =
  -- visible on the Cadence link.
  status          text          NOT NULL DEFAULT 'draft'
                                CHECK (status IN ('draft', 'published')),

  published_at    timestamptz   NULL
);

CREATE INDEX IF NOT EXISTS status_reports_org_id_idx
  ON public.status_reports(org_id, period_end DESC);

CREATE INDEX IF NOT EXISTS status_reports_published_idx
  ON public.status_reports(org_id, status, period_end DESC);

DROP TRIGGER IF EXISTS status_reports_touch_updated_at ON public.status_reports;
CREATE TRIGGER status_reports_touch_updated_at
  BEFORE UPDATE ON public.status_reports
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

ALTER TABLE public.cadence_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.status_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS cadence_tokens_service_full_access ON public.cadence_tokens;
CREATE POLICY cadence_tokens_service_full_access
  ON public.cadence_tokens FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS status_reports_service_full_access ON public.status_reports;
CREATE POLICY status_reports_service_full_access
  ON public.status_reports FOR ALL USING (true) WITH CHECK (true);
