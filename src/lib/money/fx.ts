// ============================================================
// AI-CDIO — Currency / FX utility (Tier 1 wedge, 2026-05-20)
//
// Hardcoded FX table for the wedge so the portfolio USD rollup works
// without an FX-rate API in the request path. Rates approximate
// May 2026 spot quotes — close enough for a portfolio-overview view
// but NOT load-bearing for financial reporting.
//
// Tier 2: replace this with an fx_rates table (per-day rates + daily
// refresh from a free FX API like exchangerate.host or frankfurter.app)
// and store the rate captured at initiative creation/edit time so
// historical rollups stay stable.
// ============================================================

export type CurrencyCode = "USD" | "MXN" | "EUR" | "GBP" | "CAD" | "BRL";

export const SUPPORTED_CURRENCIES: CurrencyCode[] = [
  "USD",
  "MXN",
  "EUR",
  "GBP",
  "CAD",
  "BRL",
];

interface CurrencyMeta {
  code: CurrencyCode;
  label: string;
  symbol: string;
  /** USD per 1 unit of this currency. USD = 1.0. */
  rateToUsd: number;
  /** Number of minor units in one major unit (cents in a dollar). */
  minorUnitsPerMajor: number;
}

// Rates are USD per 1 unit of the foreign currency.
// Approximate May 2026 spot — verify before any financial decision.
const CURRENCY_META: Record<CurrencyCode, CurrencyMeta> = {
  USD: { code: "USD", label: "US Dollar",        symbol: "$",   rateToUsd: 1.0,    minorUnitsPerMajor: 100 },
  MXN: { code: "MXN", label: "Mexican Peso",     symbol: "MX$", rateToUsd: 0.055,  minorUnitsPerMajor: 100 },
  EUR: { code: "EUR", label: "Euro",             symbol: "€",   rateToUsd: 1.08,   minorUnitsPerMajor: 100 },
  GBP: { code: "GBP", label: "Pound Sterling",   symbol: "£",   rateToUsd: 1.28,   minorUnitsPerMajor: 100 },
  CAD: { code: "CAD", label: "Canadian Dollar",  symbol: "C$",  rateToUsd: 0.74,   minorUnitsPerMajor: 100 },
  BRL: { code: "BRL", label: "Brazilian Real",   symbol: "R$",  rateToUsd: 0.20,   minorUnitsPerMajor: 100 },
};

export function currencyMeta(code: string): CurrencyMeta {
  const meta = CURRENCY_META[code as CurrencyCode];
  if (meta) return meta;
  // Defensive fallback — render anything we don't recognize as USD-shaped.
  return CURRENCY_META.USD;
}

/**
 * Convert an amount in MINOR units of the source currency to USD cents.
 * Null/undefined input returns 0.
 */
export function toUsdCents(
  minorUnits: number | null | undefined,
  fromCurrency: string
): number {
  if (minorUnits == null || !Number.isFinite(minorUnits)) return 0;
  const meta = currencyMeta(fromCurrency);
  // minor units -> major units in source currency, * USD/source rate, * 100 USD cents.
  const usdMajor = (minorUnits / meta.minorUnitsPerMajor) * meta.rateToUsd;
  return Math.round(usdMajor * 100);
}

/**
 * Format an amount in MINOR units of a given currency, in that currency.
 * Examples:
 *   formatMinorUnits(125000, "USD") -> "$1,250.00"
 *   formatMinorUnits(28000000, "MXN") -> "MX$280,000.00"
 */
export function formatMinorUnits(
  minorUnits: number | null | undefined,
  currency: string,
  opts: { compact?: boolean } = {}
): string {
  if (minorUnits == null) return "—";
  const meta = currencyMeta(currency);
  const major = minorUnits / meta.minorUnitsPerMajor;
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: meta.code,
      currencyDisplay: "narrowSymbol",
      notation: opts.compact ? "compact" : "standard",
      maximumFractionDigits: opts.compact ? 1 : 0,
    }).format(major);
  } catch {
    // Older runtimes may not support `narrowSymbol`; fall back to symbol.
    return `${meta.symbol}${major.toLocaleString("en-US", {
      maximumFractionDigits: opts.compact ? 1 : 0,
    })}`;
  }
}

/**
 * Format an amount in USD cents as a compact USD string.
 *   formatUsdCents(125000000)        -> "$1,250,000"
 *   formatUsdCents(125000000, true)  -> "$1.3M"
 */
export function formatUsdCents(
  usdCents: number | null | undefined,
  compact = false
): string {
  if (usdCents == null) return "—";
  const major = usdCents / 100;
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      currencyDisplay: "narrowSymbol",
      notation: compact ? "compact" : "standard",
      maximumFractionDigits: compact ? 1 : 0,
    }).format(major);
  } catch {
    return `$${major.toLocaleString("en-US", {
      maximumFractionDigits: compact ? 1 : 0,
    })}`;
  }
}

/**
 * Take an array of initiative-shaped objects and return the per-currency
 * subtotals plus the USD rollup. Null values are treated as 0.
 */
export function rollupValueAndCost(
  initiatives: Array<{
    currency?: string | null;
    expected_value_minor_units?: number | null;
    expected_cost_minor_units?: number | null;
  }>
): {
  perCurrency: Array<{
    currency: CurrencyCode;
    value_minor: number;
    cost_minor: number;
  }>;
  usd_value_cents: number;
  usd_cost_cents: number;
  usd_net_cents: number;
} {
  const buckets = new Map<
    CurrencyCode,
    { value_minor: number; cost_minor: number }
  >();

  let usd_value_cents = 0;
  let usd_cost_cents = 0;

  for (const i of initiatives) {
    const cur = (i.currency ?? "USD") as CurrencyCode;
    const v = i.expected_value_minor_units ?? 0;
    const c = i.expected_cost_minor_units ?? 0;
    const bucket = buckets.get(cur) ?? { value_minor: 0, cost_minor: 0 };
    bucket.value_minor += v;
    bucket.cost_minor += c;
    buckets.set(cur, bucket);
    usd_value_cents += toUsdCents(v, cur);
    usd_cost_cents += toUsdCents(c, cur);
  }

  return {
    perCurrency: Array.from(buckets.entries()).map(([currency, b]) => ({
      currency,
      ...b,
    })),
    usd_value_cents,
    usd_cost_cents,
    usd_net_cents: usd_value_cents - usd_cost_cents,
  };
}
