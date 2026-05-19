-- ============================================================
-- AI-CDIO — schema-v18 (2026-05-18) — CRITICAL RLS/grant lockdown
--
-- /cso Finding 1 (CRITICAL, VERIFIED): the public anon key
-- (NEXT_PUBLIC_SUPABASE_ANON_KEY, shipped in the browser bundle)
-- had FULL read/write/delete on every client table. Root cause:
-- every *_service_full_access policy is `FOR ALL USING(true)
-- WITH CHECK(true)` with NO `TO` clause (applies to anon), AND
-- anon was GRANTed table access (pre-existing on v16; widened to
-- v10-v15 by the 4a156b1 grant sweep).
--
-- The app uses `service_role` exclusively (server routes via
-- createServiceClient). `createBrowserClient`/anon is never used
-- for DB anywhere in src. User auth is Clerk, not Supabase Auth,
-- so the Supabase `authenticated` role is also unused. Revoking
-- both anon and authenticated is therefore non-breaking and is
-- the complete fix (boil the lake — all public tables, not just
-- the 9 with the permissive policy).
--
-- This SUPERSEDES the dangerous guidance in the earlier
-- "hand-applied-migrations-missing-grants" learning: new table
-- migrations must grant ONLY service_role.
--
-- Idempotent — re-applying is safe.
-- ============================================================

-- 1. Strip anon + authenticated from the entire public schema.
REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM authenticated;
REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public FROM anon;
REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public FROM authenticated;

-- 2. Prevent recurrence: future tables/sequences do not auto-grant
--    anon/authenticated. (Covers the "next migration re-exposes it"
--    footgun the old learning would have caused.)
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM authenticated;

-- 3. service_role keeps full access — it is the app's only DB role.
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;

-- 4. Defense in depth: re-scope the permissive policies to
--    service_role so an accidental future grant cannot reopen
--    anon access. service_role has BYPASSRLS so behavior is
--    unchanged for the app; this only removes anon's policy path.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'agent_logs','initiatives','initiative_tokens','selections',
    'network_catalog_entries','cadence_tokens','status_reports',
    'mcp_tokens','audits'
  ] LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON public.%I',
      t || '_service_full_access', t);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR ALL TO service_role USING (true) WITH CHECK (true)',
      t || '_service_full_access', t);
  END LOOP;
END $$;

-- network_catalog's policy is named network_catalog_service_full_access
-- (not network_catalog_entries_*). Reconcile explicitly.
DROP POLICY IF EXISTS network_catalog_entries_service_full_access ON public.network_catalog_entries;
DROP POLICY IF EXISTS network_catalog_service_full_access ON public.network_catalog_entries;
CREATE POLICY network_catalog_service_full_access
  ON public.network_catalog_entries FOR ALL TO service_role
  USING (true) WITH CHECK (true);
