-- ============================================================
-- AI-CDIO — schema-v16 (2026-05-13)
--
-- Pre-Purchase Technology Audit. A discrete, fixed-fee engagement
-- that sits between a principal and a major technology/system
-- purchase BEFORE the check is signed. Loyalty is to the
-- accountable principal — never the vendor, never the internal
-- champion. One decision per audit; the engine ends at the verdict.
--
-- Parallel to public.selections (schema-v12), NOT an extension of
-- it. Selection = forward-looking matrix to PICK. Audit =
-- backward-challenging adversarial review that returns a verdict.
-- An audit MAY reference a selection it reviews (intake.selection_id
-- inside the jsonb), but it is its own table and its own engine.
--
-- See docs/STRATEGY-2026.md "Named Service Lines" for the spec.
--
-- Idempotent.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.audits (
  id              uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      timestamptz   NOT NULL DEFAULT now(),
  updated_at      timestamptz   NOT NULL DEFAULT now(),

  org_id          uuid          NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  practitioner_id uuid          NOT NULL REFERENCES public.practitioners(id) ON DELETE RESTRICT,

  title           text          NOT NULL,

  status          text          NOT NULL DEFAULT 'intake'
                                CHECK (status IN ('intake', 'ready', 'running', 'complete', 'cancelled')),

  -- Intake as jsonb. Shape = AuditIntake in src/types/audit.ts:
  --   { system_name, vendor_name, total_cost, principal_role,
  --     accountability, vendor_proposal, current_operating_model,
  --     strategy_served, selection_id }
  -- A blank required field is NOT invalid — it becomes the first
  -- finding (evaluateIntakeGaps in src/types/audit.ts).
  intake          jsonb         NOT NULL DEFAULT '{}'::jsonb,

  -- The 4-part deliverable. Shape = AuditOutput:
  --   { strategy_verdict, requirements_brief, lens_findings[],
  --     overall_call, board_summary, headline_money }
  -- Null until the engine runs.
  output          jsonb         NULL,

  -- Method Capture — the reusable checklist. Shape =
  -- AuditMethodCapture[]: per-lens verbatim questions asked +
  -- which did the most work. Feeds the Phase 4 Knowledge Reuse
  -- panel. Null until the engine runs.
  method_capture  jsonb         NULL,

  ran_at          timestamptz   NULL
);

CREATE INDEX IF NOT EXISTS audits_org_id_idx
  ON public.audits(org_id, created_at DESC);

CREATE INDEX IF NOT EXISTS audits_practitioner_id_idx
  ON public.audits(practitioner_id, created_at DESC);

CREATE INDEX IF NOT EXISTS audits_status_idx
  ON public.audits(org_id, status);

DROP TRIGGER IF EXISTS audits_touch_updated_at ON public.audits;
CREATE TRIGGER audits_touch_updated_at
  BEFORE UPDATE ON public.audits
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

ALTER TABLE public.audits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS audits_service_full_access ON public.audits;
CREATE POLICY audits_service_full_access
  ON public.audits FOR ALL USING (true) WITH CHECK (true);
