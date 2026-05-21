// ============================================================
// Portfolio view — Tier 1 wedge for the Thursday meeting.
//
// Three stacked panels:
//   1. Totals strip — USD rollup + per-currency breakdown
//   2. Gantt — SVG horizontal timeline, one row per initiative
//   3. Cash flow — per-initiative expected-value vs expected-cost bars
//
// Deliberately server-rendered. No interactivity in v1 — the Gantt is
// deterministic from `start_date` and `target_completion_date`. Tooltips
// and click-to-zoom are Tier 2.
//
// DESIGN.md compliance: evergreen for active / on track, amber for cost
// (the outflow color), brick for blocked, hair for cancelled, m1-m5 ramp
// reserved for maturity. No blue. Fraunces for headlines if we add them.
// ============================================================

import Link from "next/link";
import type { Initiative } from "@/types/initiative";
import {
  currencyMeta,
  formatMinorUnits,
  formatUsdCents,
  rollupValueAndCost,
  toUsdCents,
} from "@/lib/money/fx";

interface PortfolioViewProps {
  orgId: string;
  initiatives: Initiative[];
}

const ONE_DAY_MS = 1000 * 60 * 60 * 24;

function parseDate(s: string | null): Date | null {
  if (!s) return null;
  // YYYY-MM-DD — parse at UTC midnight for stable comparisons.
  const d = new Date(`${s}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function statusColor(status: string): { bar: string; chip: string } {
  switch (status) {
    case "blocked":
      return { bar: "fill-brick", chip: "border-brick text-brick" };
    case "done":
      return {
        bar: "fill-evergreen",
        chip: "border-evergreen text-evergreen bg-evergreen-soft",
      };
    case "cancelled":
      return { bar: "fill-hair-strong", chip: "border-hair text-muted" };
    case "active":
    default:
      return {
        bar: "fill-evergreen",
        chip: "border-evergreen text-evergreen",
      };
  }
}

export function PortfolioView({ orgId, initiatives }: PortfolioViewProps) {
  // ─────────────────────────────────────────────────────────────
  // 1. Roll up totals (per currency + USD)
  // ─────────────────────────────────────────────────────────────
  const totals = rollupValueAndCost(initiatives);

  // ─────────────────────────────────────────────────────────────
  // 2. Gantt time-window math
  //
  // Window = min(start_dates) … max(target_dates), with 10% padding either
  // side so bars don't kiss the chart edges. Initiatives missing both
  // dates are rendered in a separate "dates not set" block below the
  // Gantt (still listed for the meeting flow — the user is going to fill
  // them in during the live session).
  // ─────────────────────────────────────────────────────────────
  type Dated = {
    init: Initiative;
    start: Date | null;
    target: Date | null;
  };
  const dated: Dated[] = initiatives.map((i) => ({
    init: i,
    start: parseDate(i.start_date),
    target: parseDate(i.target_completion_date),
  }));

  const withDates = dated.filter((d) => d.start || d.target);
  const undated = dated.filter((d) => !d.start && !d.target);

  // Compute the window from whatever dates we have. For an initiative with
  // only one date, treat the missing endpoint as that same date so the bar
  // shows as a single-day marker.
  const dateBounds = withDates.flatMap((d) => {
    const s = d.start ?? d.target!;
    const t = d.target ?? d.start!;
    return [s.getTime(), t.getTime()];
  });
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const windowMin = dateBounds.length
    ? Math.min(...dateBounds, today.getTime())
    : today.getTime();
  const windowMax = dateBounds.length
    ? Math.max(...dateBounds, today.getTime())
    : today.getTime() + 90 * ONE_DAY_MS;

  // Pad 5% either side (or a minimum of 14 days)
  const rawSpan = Math.max(windowMax - windowMin, ONE_DAY_MS);
  const pad = Math.max(rawSpan * 0.05, 14 * ONE_DAY_MS);
  const t0 = windowMin - pad;
  const t1 = windowMax + pad;
  const span = t1 - t0;

  // SVG layout: viewBox-based so it scales responsively.
  // We pick a virtual canvas of 1000 wide, height = rows × ROW_HEIGHT.
  const CANVAS_W = 1000;
  const ROW_HEIGHT = 28;
  const TOP_MARGIN = 36; // axis labels live here
  const BOT_MARGIN = 8;
  const LEFT_LABEL_W = 280; // text column on the left
  const RIGHT_PAD = 16;
  const TRACK_X0 = LEFT_LABEL_W;
  const TRACK_X1 = CANVAS_W - RIGHT_PAD;
  const TRACK_W = TRACK_X1 - TRACK_X0;

  const xForDate = (d: Date): number => {
    const t = d.getTime();
    return TRACK_X0 + ((t - t0) / span) * TRACK_W;
  };

  // Month tick generation: emit a label at the 1st of each month inside the
  // window, plus a short grid line behind it.
  type Tick = { x: number; label: string };
  const ticks: Tick[] = [];
  {
    const first = new Date(t0);
    first.setUTCDate(1);
    first.setUTCHours(0, 0, 0, 0);
    if (first.getTime() < t0) {
      first.setUTCMonth(first.getUTCMonth() + 1);
    }
    const cursor = new Date(first);
    while (cursor.getTime() <= t1) {
      ticks.push({
        x: xForDate(cursor),
        label: cursor.toLocaleDateString("en-US", {
          month: "short",
          year: "2-digit",
          timeZone: "UTC",
        }),
      });
      cursor.setUTCMonth(cursor.getUTCMonth() + 1);
    }
  }

  const todayX = xForDate(today);
  const showTodayLine = today.getTime() >= t0 && today.getTime() <= t1;

  const rows = [...withDates, ...undated]; // dated first, undated below
  const canvasH = TOP_MARGIN + rows.length * ROW_HEIGHT + BOT_MARGIN;

  // ─────────────────────────────────────────────────────────────
  // 3. Cash flow bar scale
  //
  // Convert each initiative's value & cost to USD cents for a shared scale,
  // so a USD initiative and an MXN initiative are visually comparable.
  // ─────────────────────────────────────────────────────────────
  const usdRows = initiatives.map((i) => {
    const v = toUsdCents(i.expected_value_minor_units, i.currency);
    const c = toUsdCents(i.expected_cost_minor_units, i.currency);
    return { init: i, usd_value_cents: v, usd_cost_cents: c };
  });
  const maxBarUsdCents = usdRows.reduce(
    (max, r) => Math.max(max, r.usd_value_cents, r.usd_cost_cents),
    0
  );
  const barPct = (usdCents: number): number =>
    maxBarUsdCents > 0
      ? Math.max((usdCents / maxBarUsdCents) * 100, usdCents > 0 ? 1 : 0)
      : 0;

  return (
    <div className="space-y-6">
      {/* ────────────────  1. Totals strip  ──────────────── */}
      <section className="bg-raised rounded-xl border border-hair p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-evergreen mb-3">
          Portfolio totals
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Stat
            label="Expected value (USD)"
            value={formatUsdCents(totals.usd_value_cents, true)}
            sub={`${initiatives.length} initiative${initiatives.length === 1 ? "" : "s"}`}
            tone="evergreen"
          />
          <Stat
            label="Expected cost (USD)"
            value={formatUsdCents(totals.usd_cost_cents, true)}
            sub="Sum of outflows"
            tone="amber"
          />
          <Stat
            label="Net (USD)"
            value={formatUsdCents(totals.usd_net_cents, true)}
            sub={totals.usd_net_cents >= 0 ? "Value > cost" : "Cost > value"}
            tone={totals.usd_net_cents >= 0 ? "evergreen" : "brick"}
          />
        </div>
        {totals.perCurrency.length > 1 && (
          <div className="mt-4 pt-4 border-t border-hair">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-2">
              Per currency (raw, not converted)
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted">
              {totals.perCurrency.map((c) => (
                <div key={c.currency}>
                  <span className="font-semibold text-ink">{c.currency}:</span>{" "}
                  {formatMinorUnits(c.value_minor, c.currency, { compact: true })}{" "}
                  value ·{" "}
                  {formatMinorUnits(c.cost_minor, c.currency, { compact: true })}{" "}
                  cost
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ────────────────  2. Gantt  ──────────────── */}
      <section className="bg-raised rounded-xl border border-hair p-5">
        <div className="flex items-baseline justify-between mb-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-evergreen">
            Timeline
          </p>
          <p className="text-[11px] text-faint">
            {rows.length} initiative{rows.length === 1 ? "" : "s"} ·{" "}
            {showTodayLine ? "Today line shown" : "Today outside window"}
          </p>
        </div>
        {rows.length === 0 ? (
          <p className="text-sm text-muted italic">No initiatives yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <svg
              viewBox={`0 0 ${CANVAS_W} ${canvasH}`}
              className="w-full"
              style={{ minHeight: canvasH }}
              role="img"
              aria-label="Portfolio Gantt chart"
            >
              {/* Month gridlines + axis labels */}
              {ticks.map((t, i) => (
                <g key={i}>
                  <line
                    x1={t.x}
                    x2={t.x}
                    y1={TOP_MARGIN - 6}
                    y2={canvasH - BOT_MARGIN}
                    className="stroke-hair"
                    strokeWidth={1}
                  />
                  <text
                    x={t.x}
                    y={TOP_MARGIN - 12}
                    className="fill-muted"
                    fontSize={10}
                    textAnchor="middle"
                  >
                    {t.label}
                  </text>
                </g>
              ))}

              {/* Today line */}
              {showTodayLine && (
                <g>
                  <line
                    x1={todayX}
                    x2={todayX}
                    y1={TOP_MARGIN - 4}
                    y2={canvasH - BOT_MARGIN}
                    className="stroke-amber-deep"
                    strokeWidth={1.5}
                    strokeDasharray="4 3"
                  />
                  <text
                    x={todayX + 4}
                    y={TOP_MARGIN - 24}
                    className="fill-amber-deep"
                    fontSize={9}
                    fontWeight={600}
                  >
                    Today
                  </text>
                </g>
              )}

              {/* Per-initiative rows */}
              {rows.map((row, idx) => {
                const y = TOP_MARGIN + idx * ROW_HEIGHT;
                const center = y + ROW_HEIGHT / 2;
                const sc = statusColor(row.init.status);
                const start = row.start ?? row.target;
                const target = row.target ?? row.start;
                const hasDates = !!(start && target);
                let x = TRACK_X0;
                let w = 0;
                if (hasDates) {
                  const x1 = xForDate(start!);
                  const x2 = xForDate(target!);
                  x = Math.min(x1, x2);
                  w = Math.max(Math.abs(x2 - x1), 6); // floor at 6px so 1-day bars are visible
                }
                const title =
                  row.init.title.length > 38
                    ? row.init.title.slice(0, 37) + "…"
                    : row.init.title;
                return (
                  <g key={row.init.id}>
                    {/* Row separator */}
                    <line
                      x1={0}
                      x2={CANVAS_W}
                      y1={y}
                      y2={y}
                      className="stroke-hair"
                      strokeWidth={0.5}
                    />
                    {/* Label */}
                    <text
                      x={8}
                      y={center + 3}
                      className="fill-ink"
                      fontSize={11}
                      fontWeight={500}
                    >
                      {title}
                    </text>
                    {row.init.owner_name && (
                      <text
                        x={8}
                        y={center + 13}
                        className="fill-faint"
                        fontSize={9}
                      >
                        {row.init.owner_name.slice(0, 30)}
                      </text>
                    )}
                    {/* Bar or "dates not set" marker */}
                    {hasDates ? (
                      <rect
                        x={x}
                        y={center - 7}
                        width={w}
                        height={14}
                        rx={3}
                        className={sc.bar}
                        opacity={row.init.status === "cancelled" ? 0.5 : 0.9}
                      />
                    ) : (
                      <text
                        x={TRACK_X0 + 4}
                        y={center + 3}
                        className="fill-faint italic"
                        fontSize={10}
                      >
                        Dates not set — add a start &amp; target to render on the timeline
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        )}
      </section>

      {/* ────────────────  3. Cash flow per initiative  ──────────────── */}
      <section className="bg-raised rounded-xl border border-hair p-5">
        <div className="flex items-baseline justify-between mb-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-evergreen">
            Cash flow per initiative
          </p>
          <p className="text-[11px] text-faint">
            Bar widths scale to the largest USD-converted value in the portfolio.
          </p>
        </div>
        {maxBarUsdCents === 0 ? (
          <p className="text-sm text-muted italic">
            No expected value or cost captured yet. Add inflows / outflows when
            creating or editing an initiative.
          </p>
        ) : (
          <ul className="space-y-3">
            {usdRows.map((r) => {
              const meta = currencyMeta(r.init.currency);
              const valuePct = barPct(r.usd_value_cents);
              const costPct = barPct(r.usd_cost_cents);
              const netUsdCents = r.usd_value_cents - r.usd_cost_cents;
              return (
                <li key={r.init.id}>
                  <Link
                    href={`/clients/${orgId}/initiatives/${r.init.id}`}
                    className="block group"
                  >
                    <div className="flex items-baseline justify-between mb-1">
                      <p className="text-sm font-medium text-ink group-hover:text-evergreen truncate">
                        {r.init.title}
                      </p>
                      <p className="text-[11px] text-muted shrink-0 ml-3">
                        Net{" "}
                        <span
                          className={
                            netUsdCents >= 0 ? "text-evergreen" : "text-brick"
                          }
                        >
                          {formatUsdCents(netUsdCents, true)}
                        </span>
                      </p>
                    </div>
                    {/* Value bar */}
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] uppercase tracking-wider text-muted w-12 shrink-0">
                        Value
                      </span>
                      <div className="flex-1 h-3 bg-surface rounded-sm overflow-hidden">
                        <div
                          className="h-full bg-evergreen"
                          style={{ width: `${valuePct}%` }}
                        />
                      </div>
                      <span className="text-[11px] text-muted w-32 shrink-0 text-right tabular-nums">
                        {formatMinorUnits(
                          r.init.expected_value_minor_units,
                          r.init.currency,
                          { compact: true }
                        )}{" "}
                        {meta.code !== "USD" && r.init.expected_value_minor_units
                          ? ` · ${formatUsdCents(r.usd_value_cents, true)}`
                          : ""}
                      </span>
                    </div>
                    {/* Cost bar */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase tracking-wider text-muted w-12 shrink-0">
                        Cost
                      </span>
                      <div className="flex-1 h-3 bg-surface rounded-sm overflow-hidden">
                        <div
                          className="h-full bg-amber"
                          style={{ width: `${costPct}%` }}
                        />
                      </div>
                      <span className="text-[11px] text-muted w-32 shrink-0 text-right tabular-nums">
                        {formatMinorUnits(
                          r.init.expected_cost_minor_units,
                          r.init.currency,
                          { compact: true }
                        )}{" "}
                        {meta.code !== "USD" && r.init.expected_cost_minor_units
                          ? ` · ${formatUsdCents(r.usd_cost_cents, true)}`
                          : ""}
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Stat — a small labeled-figure card used in the Totals strip.
// Tone selects the label color (evergreen for inflow, amber for outflow,
// brick when net is negative). DESIGN.md tokens only.
// ──────────────────────────────────────────────────────────────────
function Stat({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub: string;
  tone: "evergreen" | "amber" | "brick";
}) {
  const labelClass =
    tone === "amber"
      ? "text-amber-deep"
      : tone === "brick"
        ? "text-brick"
        : "text-evergreen";
  return (
    <div>
      <p
        className={`text-[10px] font-semibold uppercase tracking-wider ${labelClass}`}
      >
        {label}
      </p>
      <p className="text-2xl font-semibold text-ink tabular-nums mt-1">
        {value}
      </p>
      <p className="text-[11px] text-muted mt-0.5">{sub}</p>
    </div>
  );
}
