-- ============================================================
-- AI-CDIO — schema-v22 (2026-05-20): initiative start_date + multi-currency money fields
--
-- Tier 1 wedge for the anchor-client meeting Thursday: the PM and the
-- fractional CDIO will sit down and build 11 initiatives with start /
-- target dates AND expected value (inflow) + expected cost (outflow)
-- per initiative, then see them as Gantt + portfolio cash flow.
--
-- All fields are NULLABLE so existing initiative rows (from prior
-- testing) remain valid without backfill. The Gantt renders gracefully
-- when start_date is missing (target_date marker only); the cash flow
-- view treats null expected_value/cost as 0 for portfolio rollup.
--
-- Multi-currency posture:
-- - Each initiative carries its OWN currency code (ISO 4217-ish).
-- - Money fields store the value in the MINOR UNIT of that currency
--   (cents for USD, centavos for MXN, pence for GBP, etc.). bigint
--   chosen over int to safely hold large project budgets (USD int
--   tops out at ~$21M; bigint goes to quintillions).
-- - The CHECK constraint pins the currency list to the six the wedge
--   supports — USD as base, plus the common Western Hemisphere /
--   European currencies. Adding more later is a constraint update.
-- - Portfolio USD rollup is computed in code (src/lib/money/fx.ts)
--   using a hardcoded FX table for the wedge. A proper fx_rates
--   table + FX API integration is Tier 2.
--
-- Idempotent: ADD COLUMN IF NOT EXISTS for each new column; CHECK
-- constraint drop+re-add (matches the schema-v21 pattern).
-- ============================================================

ALTER TABLE public.initiatives
  ADD COLUMN IF NOT EXISTS start_date date NULL;

ALTER TABLE public.initiatives
  ADD COLUMN IF NOT EXISTS expected_value_minor_units bigint NULL;

ALTER TABLE public.initiatives
  ADD COLUMN IF NOT EXISTS expected_cost_minor_units bigint NULL;

ALTER TABLE public.initiatives
  ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'USD';

ALTER TABLE public.initiatives
  DROP CONSTRAINT IF EXISTS initiatives_currency_check;

ALTER TABLE public.initiatives
  ADD CONSTRAINT initiatives_currency_check
  CHECK (currency IN ('USD', 'MXN', 'EUR', 'GBP', 'CAD', 'BRL'));

-- Comments for future readers
COMMENT ON COLUMN public.initiatives.start_date IS
  'Planned start date for the strategic milestone arc. Renders the left edge of the Gantt bar. Null = render as a target_date marker only.';

COMMENT ON COLUMN public.initiatives.expected_value_minor_units IS
  'Expected value / inflow / benefit thesis for this initiative, in the MINOR unit of the initiative''s currency (cents for USD, centavos for MXN, etc.). Stored as integer to avoid float math. Null treated as 0 in portfolio rollups.';

COMMENT ON COLUMN public.initiatives.expected_cost_minor_units IS
  'Expected cost / outflow / spend for this initiative, in the MINOR unit of the initiative''s currency. Stored as integer to avoid float math. Null treated as 0 in portfolio rollups.';

COMMENT ON COLUMN public.initiatives.currency IS
  'ISO 4217-ish currency code for expected_value_minor_units and expected_cost_minor_units. Wedge supports USD (base), MXN, EUR, GBP, CAD, BRL. Portfolio USD rollup uses a hardcoded FX table; proper fx_rates table is Tier 2.';
