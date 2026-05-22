-- ============================================================
-- AI-CDIO — schema-v27 (2026-05-22) — cockpit chat messages
--
-- Per-initiative chat history for the cockpit assistant. Same
-- access model as the v26 cockpit tables:
--   * server-only via the service_role key;
--   * anon / authenticated / PUBLIC revoked;
--   * RLS on as defense-in-depth;
--   * a composite FK forces a message's owner to match its
--     parent initiative's owner — a message cannot belong to a
--     different user than the initiative it is on.
--
-- Idempotent — re-applying is safe (the table is dropped first).
-- ============================================================

DROP TABLE IF EXISTS public.messages CASCADE;

CREATE TABLE public.messages (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  initiative_id  uuid NOT NULL,
  owner_user_id  text NOT NULL,
  role           text NOT NULL,                -- 'user' | 'assistant'
  content        text NOT NULL,
  created_at     timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (initiative_id, owner_user_id)
    REFERENCES public.initiatives (id, owner_user_id) ON DELETE CASCADE
);

CREATE INDEX messages_initiative_idx
  ON public.messages (initiative_id, created_at);

-- Lock down access — service_role only, same as the v26 tables.
REVOKE ALL PRIVILEGES ON public.messages FROM PUBLIC;
REVOKE ALL PRIVILEGES ON public.messages FROM anon;
REVOKE ALL PRIVILEGES ON public.messages FROM authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS messages_service_only ON public.messages;
CREATE POLICY messages_service_only ON public.messages
  FOR ALL TO service_role USING (true) WITH CHECK (true);
