-- ============================================================
-- AI-CDIO — schema-v25 (2026-05-21) — substrate correctness
--
-- Closes codex P1 findings #4-#7 (audit at docs/CODEX-AUDIT-2026-05-21.md)
-- after the /plan-eng-review + /codex review pass on the plan
-- (docs/sprint-S2-substrate-fix.md). Both reviews are referenced inline.
--
--   1. Widen approval_events.event_type CHECK to include 'rejected'.
--      schema-v23:161 missed this when v24 added 'rejected' to artifact
--      approval_status enums; v24 only widened the artifact CHECK.
--   2. Add five typed RPCs that atomically combine the state UPDATE +
--      audit-event INSERT in one Postgres transaction (codex #6).
--      Each RPC takes p_expected_status and refuses with code='stale_state'
--      if the row moved since the handler read it (codex #5).
--      Each RPC snapshots the artifact BEFORE the UPDATE (codex #4).
--      apply_artifact_reject wires the terminal-no state end-to-end
--      (codex #7).
--   3. Lock down the RPCs: SECURITY DEFINER + SET search_path +
--      REVOKE EXECUTE FROM PUBLIC + GRANT EXECUTE TO service_role
--      (codex review X2).
--   4. Each RPC's UPDATE + INSERT pair runs inside an explicit
--      BEGIN/EXCEPTION subtransaction so an event-insert failure
--      rolls back the state UPDATE atomically and surfaces as
--      code='internal' (codex review X3).
--   5. Each RPC has a per-verb legal-transition guard so a buggy
--      caller passing the wrong p_expected_status returns
--      code='internal' instead of escaping the CAS check
--      (codex review X4).
--   6. The 'internal' code never returns raw Postgres error text —
--      the SQLERRM is written to server logs via RAISE LOG, the
--      client gets message=NULL (codex review X13).
--
-- Idempotent — safe to re-run. CREATE OR REPLACE FUNCTION + the CHECK
-- drop-then-recreate pattern below both no-op on a second pass.
-- ============================================================

-- ---------- 1. approval_events.event_type CHECK widened ----------
-- v23 line 161 set this to ('submitted','approved','approved_with_edits',
-- 'returned','withdrawn'). v24 added 'rejected' to the four ARTIFACT
-- approval_status enums but left the EVENT enum unwidened — so a code
-- path that tried to log a 'rejected' event would CHECK-violate. This
-- migration closes that loop.
ALTER TABLE public.approval_events
  DROP CONSTRAINT IF EXISTS approval_events_event_type_check;

ALTER TABLE public.approval_events
  ADD CONSTRAINT approval_events_event_type_check
  CHECK (event_type IN (
    'submitted',
    'approved',
    'approved_with_edits',
    'returned',
    'withdrawn',
    'rejected'
  ));

-- ---------- 2. Helper: dynamic snapshot + UPDATE per artifact_type ----------
-- Encapsulates the four-way switch on p_artifact_type so each verb
-- function below stays focused on its own state-transition logic.
-- Returns the locked row's current approval_status + org_id + JSON
-- snapshot, all in one round-trip per function call.
CREATE OR REPLACE FUNCTION public._lock_and_snapshot_artifact(
  p_artifact_type text,
  p_artifact_id   uuid,
  OUT v_current_status text,
  OUT v_org_id         uuid,
  OUT v_snapshot       jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF p_artifact_type = 'initiative' THEN
    SELECT t.approval_status, t.org_id, row_to_json(t.*)::jsonb
      INTO v_current_status, v_org_id, v_snapshot
      FROM public.initiatives t WHERE t.id = p_artifact_id FOR UPDATE;
  ELSIF p_artifact_type = 'status_report' THEN
    SELECT t.approval_status, t.org_id, row_to_json(t.*)::jsonb
      INTO v_current_status, v_org_id, v_snapshot
      FROM public.status_reports t WHERE t.id = p_artifact_id FOR UPDATE;
  ELSIF p_artifact_type = 'selection' THEN
    SELECT t.approval_status, t.org_id, row_to_json(t.*)::jsonb
      INTO v_current_status, v_org_id, v_snapshot
      FROM public.selections t WHERE t.id = p_artifact_id FOR UPDATE;
  ELSIF p_artifact_type = 'audit' THEN
    SELECT t.approval_status, t.org_id, row_to_json(t.*)::jsonb
      INTO v_current_status, v_org_id, v_snapshot
      FROM public.audits t WHERE t.id = p_artifact_id FOR UPDATE;
  ELSE
    v_current_status := NULL;
    v_org_id := NULL;
    v_snapshot := NULL;
  END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION public._lock_and_snapshot_artifact(text, uuid) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public._lock_and_snapshot_artifact(text, uuid) TO service_role;

-- ---------- 3. Per-artifact-type UPDATE helpers (5 verbs × 4 tables = 5 functions) ----------
-- Each verb has a single helper that switches on artifact_type. Keeping
-- the verb-specific column writes inline rather than in a generic
-- dynamic-SQL helper preserves auditability — every UPDATE statement is
-- readable as plain SQL, no format()/EXECUTE indirection.

CREATE OR REPLACE FUNCTION public._update_artifact_submit(
  p_artifact_type text,
  p_artifact_id   uuid,
  p_actor_practitioner_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF p_artifact_type = 'initiative' THEN
    UPDATE public.initiatives
       SET approval_status = 'pending',
           submitted_by_practitioner_id = COALESCE(submitted_by_practitioner_id, p_actor_practitioner_id),
           submitted_at = now()
     WHERE id = p_artifact_id;
  ELSIF p_artifact_type = 'status_report' THEN
    UPDATE public.status_reports
       SET approval_status = 'pending',
           submitted_by_practitioner_id = COALESCE(submitted_by_practitioner_id, p_actor_practitioner_id),
           submitted_at = now()
     WHERE id = p_artifact_id;
  ELSIF p_artifact_type = 'selection' THEN
    UPDATE public.selections
       SET approval_status = 'pending',
           submitted_by_practitioner_id = COALESCE(submitted_by_practitioner_id, p_actor_practitioner_id),
           submitted_at = now()
     WHERE id = p_artifact_id;
  ELSIF p_artifact_type = 'audit' THEN
    UPDATE public.audits
       SET approval_status = 'pending',
           submitted_by_practitioner_id = COALESCE(submitted_by_practitioner_id, p_actor_practitioner_id),
           submitted_at = now()
     WHERE id = p_artifact_id;
  END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION public._update_artifact_submit(text, uuid, uuid) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public._update_artifact_submit(text, uuid, uuid) TO service_role;

CREATE OR REPLACE FUNCTION public._update_artifact_withdraw(
  p_artifact_type text,
  p_artifact_id   uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF p_artifact_type = 'initiative' THEN
    UPDATE public.initiatives  SET approval_status = 'draft', submitted_at = NULL WHERE id = p_artifact_id;
  ELSIF p_artifact_type = 'status_report' THEN
    UPDATE public.status_reports SET approval_status = 'draft', submitted_at = NULL WHERE id = p_artifact_id;
  ELSIF p_artifact_type = 'selection' THEN
    UPDATE public.selections SET approval_status = 'draft', submitted_at = NULL WHERE id = p_artifact_id;
  ELSIF p_artifact_type = 'audit' THEN
    UPDATE public.audits SET approval_status = 'draft', submitted_at = NULL WHERE id = p_artifact_id;
  END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION public._update_artifact_withdraw(text, uuid) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public._update_artifact_withdraw(text, uuid) TO service_role;

CREATE OR REPLACE FUNCTION public._update_artifact_approve(
  p_artifact_type text,
  p_artifact_id   uuid,
  p_actor_practitioner_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- S2 does not yet apply p_edits inline; that lands in S3 when the
  -- approve-with-edits UX ships. For now the handler always passes
  -- p_edits := NULL and we just flip the status.
  IF p_artifact_type = 'initiative' THEN
    UPDATE public.initiatives
       SET approval_status = 'approved',
           approved_by_practitioner_id = p_actor_practitioner_id,
           approved_at = now()
     WHERE id = p_artifact_id;
  ELSIF p_artifact_type = 'status_report' THEN
    UPDATE public.status_reports
       SET approval_status = 'approved',
           approved_by_practitioner_id = p_actor_practitioner_id,
           approved_at = now()
     WHERE id = p_artifact_id;
  ELSIF p_artifact_type = 'selection' THEN
    UPDATE public.selections
       SET approval_status = 'approved',
           approved_by_practitioner_id = p_actor_practitioner_id,
           approved_at = now()
     WHERE id = p_artifact_id;
  ELSIF p_artifact_type = 'audit' THEN
    UPDATE public.audits
       SET approval_status = 'approved',
           approved_by_practitioner_id = p_actor_practitioner_id,
           approved_at = now()
     WHERE id = p_artifact_id;
  END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION public._update_artifact_approve(text, uuid, uuid) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public._update_artifact_approve(text, uuid, uuid) TO service_role;

CREATE OR REPLACE FUNCTION public._update_artifact_return(
  p_artifact_type text,
  p_artifact_id   uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF p_artifact_type = 'initiative' THEN
    UPDATE public.initiatives  SET approval_status = 'returned' WHERE id = p_artifact_id;
  ELSIF p_artifact_type = 'status_report' THEN
    UPDATE public.status_reports SET approval_status = 'returned' WHERE id = p_artifact_id;
  ELSIF p_artifact_type = 'selection' THEN
    UPDATE public.selections SET approval_status = 'returned' WHERE id = p_artifact_id;
  ELSIF p_artifact_type = 'audit' THEN
    UPDATE public.audits SET approval_status = 'returned' WHERE id = p_artifact_id;
  END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION public._update_artifact_return(text, uuid) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public._update_artifact_return(text, uuid) TO service_role;

CREATE OR REPLACE FUNCTION public._update_artifact_reject(
  p_artifact_type text,
  p_artifact_id   uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF p_artifact_type = 'initiative' THEN
    UPDATE public.initiatives  SET approval_status = 'rejected' WHERE id = p_artifact_id;
  ELSIF p_artifact_type = 'status_report' THEN
    UPDATE public.status_reports SET approval_status = 'rejected' WHERE id = p_artifact_id;
  ELSIF p_artifact_type = 'selection' THEN
    UPDATE public.selections SET approval_status = 'rejected' WHERE id = p_artifact_id;
  ELSIF p_artifact_type = 'audit' THEN
    UPDATE public.audits SET approval_status = 'rejected' WHERE id = p_artifact_id;
  END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION public._update_artifact_reject(text, uuid) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public._update_artifact_reject(text, uuid) TO service_role;

-- ============================================================
-- 4. The 5 public RPCs. Each follows the same shape:
--    (a) legal-transition guard (codex X4)
--    (b) lock + snapshot + status check (codex #4 + #5)
--    (c) atomic state UPDATE + event INSERT subtransaction (codex #6 + X3)
--    (d) typed return (eng-review A1 + codex X5 fold-in)
-- ============================================================

CREATE OR REPLACE FUNCTION public.apply_artifact_submit(
  p_artifact_type         text,
  p_artifact_id           uuid,
  p_expected_status       text,
  p_actor_practitioner_id uuid,
  p_actor_role            text,
  p_payload               jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_current_status text;
  v_org_id         uuid;
  v_snapshot       jsonb;
  v_event_id       uuid;
BEGIN
  -- Legal transition: submit accepts only draft|returned → pending.
  IF p_expected_status NOT IN ('draft', 'returned') THEN
    RETURN jsonb_build_object('ok', false, 'code', 'internal',
                              'current_status', NULL, 'message', NULL);
  END IF;

  SELECT s.v_current_status, s.v_org_id, s.v_snapshot
    INTO v_current_status, v_org_id, v_snapshot
    FROM public._lock_and_snapshot_artifact(p_artifact_type, p_artifact_id) s;

  IF v_current_status IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'code', 'not_found',
                              'current_status', NULL, 'message', NULL);
  END IF;
  IF v_current_status IS DISTINCT FROM p_expected_status THEN
    RETURN jsonb_build_object('ok', false, 'code', 'stale_state',
                              'current_status', v_current_status,
                              'message', NULL);
  END IF;

  BEGIN
    PERFORM public._update_artifact_submit(p_artifact_type, p_artifact_id, p_actor_practitioner_id);
    INSERT INTO public.approval_events
      (org_id, artifact_type, artifact_id, event_type,
       actor_practitioner_id, actor_role, prior_version, payload)
    VALUES
      (v_org_id, p_artifact_type, p_artifact_id, 'submitted',
       p_actor_practitioner_id, p_actor_role, v_snapshot, p_payload)
    RETURNING id INTO v_event_id;
  EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'apply_artifact_submit rolled back for %/%: %',
      p_artifact_type, p_artifact_id, SQLERRM;
    RETURN jsonb_build_object('ok', false, 'code', 'internal',
                              'current_status', v_current_status,
                              'message', NULL);
  END;

  RETURN jsonb_build_object('ok', true, 'code', NULL,
                            'new_status', 'pending',
                            'event_id', v_event_id);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.apply_artifact_submit(text, uuid, text, uuid, text, jsonb) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.apply_artifact_submit(text, uuid, text, uuid, text, jsonb) TO service_role;


CREATE OR REPLACE FUNCTION public.apply_artifact_withdraw(
  p_artifact_type         text,
  p_artifact_id           uuid,
  p_expected_status       text,
  p_actor_practitioner_id uuid,
  p_actor_role            text,
  p_payload               jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_current_status text;
  v_org_id         uuid;
  v_snapshot       jsonb;
  v_event_id       uuid;
BEGIN
  IF p_expected_status <> 'pending' THEN
    RETURN jsonb_build_object('ok', false, 'code', 'internal',
                              'current_status', NULL, 'message', NULL);
  END IF;

  SELECT s.v_current_status, s.v_org_id, s.v_snapshot
    INTO v_current_status, v_org_id, v_snapshot
    FROM public._lock_and_snapshot_artifact(p_artifact_type, p_artifact_id) s;

  IF v_current_status IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'code', 'not_found',
                              'current_status', NULL, 'message', NULL);
  END IF;
  IF v_current_status IS DISTINCT FROM p_expected_status THEN
    RETURN jsonb_build_object('ok', false, 'code', 'stale_state',
                              'current_status', v_current_status,
                              'message', NULL);
  END IF;

  BEGIN
    PERFORM public._update_artifact_withdraw(p_artifact_type, p_artifact_id);
    INSERT INTO public.approval_events
      (org_id, artifact_type, artifact_id, event_type,
       actor_practitioner_id, actor_role, prior_version, payload)
    VALUES
      (v_org_id, p_artifact_type, p_artifact_id, 'withdrawn',
       p_actor_practitioner_id, p_actor_role, v_snapshot, p_payload)
    RETURNING id INTO v_event_id;
  EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'apply_artifact_withdraw rolled back for %/%: %',
      p_artifact_type, p_artifact_id, SQLERRM;
    RETURN jsonb_build_object('ok', false, 'code', 'internal',
                              'current_status', v_current_status,
                              'message', NULL);
  END;

  RETURN jsonb_build_object('ok', true, 'code', NULL,
                            'new_status', 'draft',
                            'event_id', v_event_id);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.apply_artifact_withdraw(text, uuid, text, uuid, text, jsonb) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.apply_artifact_withdraw(text, uuid, text, uuid, text, jsonb) TO service_role;


CREATE OR REPLACE FUNCTION public.apply_artifact_approve(
  p_artifact_type         text,
  p_artifact_id           uuid,
  p_expected_status       text,
  p_actor_practitioner_id uuid,
  p_actor_role            text,
  p_payload               jsonb DEFAULT '{}'::jsonb,
  p_edits                 jsonb DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_current_status text;
  v_org_id         uuid;
  v_snapshot       jsonb;
  v_event_id       uuid;
  v_event_type     text;
BEGIN
  IF p_expected_status <> 'pending' THEN
    RETURN jsonb_build_object('ok', false, 'code', 'internal',
                              'current_status', NULL, 'message', NULL);
  END IF;

  SELECT s.v_current_status, s.v_org_id, s.v_snapshot
    INTO v_current_status, v_org_id, v_snapshot
    FROM public._lock_and_snapshot_artifact(p_artifact_type, p_artifact_id) s;

  IF v_current_status IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'code', 'not_found',
                              'current_status', NULL, 'message', NULL);
  END IF;
  IF v_current_status IS DISTINCT FROM p_expected_status THEN
    RETURN jsonb_build_object('ok', false, 'code', 'stale_state',
                              'current_status', v_current_status,
                              'message', NULL);
  END IF;

  -- p_edits is reserved for the S3 approve-with-edits UX. In S2 the
  -- handler always passes p_edits := NULL; the column writes happen
  -- only via _update_artifact_approve (status + approver columns).
  --
  -- Codex review on the implementation (2026-05-21) caught that a
  -- conditional event_type here would log 'approved_with_edits' for any
  -- service-role caller passing non-NULL p_edits — but the function
  -- DOESN'T actually apply those edits in S2, recreating the "lying
  -- event" pattern codex P1 #4 was about. S2 always logs 'approved'.
  -- The conditional + real column UPDATE both land in S3 together.
  IF p_edits IS NOT NULL AND p_edits <> '{}'::jsonb THEN
    -- Defensive: an S2 caller passed edits the RPC can't honor. Fail
    -- loud rather than log a misleading event.
    RAISE LOG 'apply_artifact_approve refused p_edits in S2 for %/%; edits-aware path lands in S3',
      p_artifact_type, p_artifact_id;
    RETURN jsonb_build_object('ok', false, 'code', 'internal',
                              'current_status', v_current_status,
                              'message', NULL);
  END IF;
  v_event_type := 'approved';

  BEGIN
    PERFORM public._update_artifact_approve(p_artifact_type, p_artifact_id, p_actor_practitioner_id);
    INSERT INTO public.approval_events
      (org_id, artifact_type, artifact_id, event_type,
       actor_practitioner_id, actor_role, prior_version, payload)
    VALUES
      (v_org_id, p_artifact_type, p_artifact_id, v_event_type,
       p_actor_practitioner_id, p_actor_role, v_snapshot, p_payload)
    RETURNING id INTO v_event_id;
  EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'apply_artifact_approve rolled back for %/%: %',
      p_artifact_type, p_artifact_id, SQLERRM;
    RETURN jsonb_build_object('ok', false, 'code', 'internal',
                              'current_status', v_current_status,
                              'message', NULL);
  END;

  RETURN jsonb_build_object('ok', true, 'code', NULL,
                            'new_status', 'approved',
                            'event_id', v_event_id);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.apply_artifact_approve(text, uuid, text, uuid, text, jsonb, jsonb) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.apply_artifact_approve(text, uuid, text, uuid, text, jsonb, jsonb) TO service_role;


CREATE OR REPLACE FUNCTION public.apply_artifact_return(
  p_artifact_type         text,
  p_artifact_id           uuid,
  p_expected_status       text,
  p_actor_practitioner_id uuid,
  p_actor_role            text,
  p_payload               jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_current_status text;
  v_org_id         uuid;
  v_snapshot       jsonb;
  v_event_id       uuid;
BEGIN
  IF p_expected_status <> 'pending' THEN
    RETURN jsonb_build_object('ok', false, 'code', 'internal',
                              'current_status', NULL, 'message', NULL);
  END IF;

  SELECT s.v_current_status, s.v_org_id, s.v_snapshot
    INTO v_current_status, v_org_id, v_snapshot
    FROM public._lock_and_snapshot_artifact(p_artifact_type, p_artifact_id) s;

  IF v_current_status IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'code', 'not_found',
                              'current_status', NULL, 'message', NULL);
  END IF;
  IF v_current_status IS DISTINCT FROM p_expected_status THEN
    RETURN jsonb_build_object('ok', false, 'code', 'stale_state',
                              'current_status', v_current_status,
                              'message', NULL);
  END IF;

  BEGIN
    PERFORM public._update_artifact_return(p_artifact_type, p_artifact_id);
    INSERT INTO public.approval_events
      (org_id, artifact_type, artifact_id, event_type,
       actor_practitioner_id, actor_role, prior_version, payload)
    VALUES
      (v_org_id, p_artifact_type, p_artifact_id, 'returned',
       p_actor_practitioner_id, p_actor_role, v_snapshot, p_payload)
    RETURNING id INTO v_event_id;
  EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'apply_artifact_return rolled back for %/%: %',
      p_artifact_type, p_artifact_id, SQLERRM;
    RETURN jsonb_build_object('ok', false, 'code', 'internal',
                              'current_status', v_current_status,
                              'message', NULL);
  END;

  RETURN jsonb_build_object('ok', true, 'code', NULL,
                            'new_status', 'returned',
                            'event_id', v_event_id);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.apply_artifact_return(text, uuid, text, uuid, text, jsonb) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.apply_artifact_return(text, uuid, text, uuid, text, jsonb) TO service_role;


CREATE OR REPLACE FUNCTION public.apply_artifact_reject(
  p_artifact_type         text,
  p_artifact_id           uuid,
  p_expected_status       text,
  p_actor_practitioner_id uuid,
  p_actor_role            text,
  p_payload               jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_current_status text;
  v_org_id         uuid;
  v_snapshot       jsonb;
  v_event_id       uuid;
BEGIN
  IF p_expected_status <> 'pending' THEN
    RETURN jsonb_build_object('ok', false, 'code', 'internal',
                              'current_status', NULL, 'message', NULL);
  END IF;

  SELECT s.v_current_status, s.v_org_id, s.v_snapshot
    INTO v_current_status, v_org_id, v_snapshot
    FROM public._lock_and_snapshot_artifact(p_artifact_type, p_artifact_id) s;

  IF v_current_status IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'code', 'not_found',
                              'current_status', NULL, 'message', NULL);
  END IF;
  IF v_current_status IS DISTINCT FROM p_expected_status THEN
    RETURN jsonb_build_object('ok', false, 'code', 'stale_state',
                              'current_status', v_current_status,
                              'message', NULL);
  END IF;

  BEGIN
    PERFORM public._update_artifact_reject(p_artifact_type, p_artifact_id);
    INSERT INTO public.approval_events
      (org_id, artifact_type, artifact_id, event_type,
       actor_practitioner_id, actor_role, prior_version, payload)
    VALUES
      (v_org_id, p_artifact_type, p_artifact_id, 'rejected',
       p_actor_practitioner_id, p_actor_role, v_snapshot, p_payload)
    RETURNING id INTO v_event_id;
  EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'apply_artifact_reject rolled back for %/%: %',
      p_artifact_type, p_artifact_id, SQLERRM;
    RETURN jsonb_build_object('ok', false, 'code', 'internal',
                              'current_status', v_current_status,
                              'message', NULL);
  END;

  RETURN jsonb_build_object('ok', true, 'code', NULL,
                            'new_status', 'rejected',
                            'event_id', v_event_id);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.apply_artifact_reject(text, uuid, text, uuid, text, jsonb) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.apply_artifact_reject(text, uuid, text, uuid, text, jsonb) TO service_role;
