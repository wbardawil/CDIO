// Maturity ramp — the DESIGN.md "data surface, kept calm" pattern.
// Five sequential sand → evergreen steps, the current level outlined
// in ink. It replaces the radar as the *first* maturity read (Spine
// Law 3): a CEO feels informed, never scolded. Radar/matrix stay
// available behind "Show the full analysis", never as the first thing.
//
// Presentational + prop-driven (no "use client", no server-only
// imports) so server and client screens render the identical element.

const STEPS = [
  { n: 1, label: "Initial", bar: "bg-m1", h: "h-[38%]" },
  { n: 2, label: "Reactive", bar: "bg-m2", h: "h-[55%]" },
  { n: 3, label: "Defined", bar: "bg-m3", h: "h-[72%]" },
  { n: 4, label: "Managed", bar: "bg-m4", h: "h-[88%]" },
  { n: 5, label: "Optimizing", bar: "bg-m5", h: "h-full" },
] as const;

export interface MaturityRampProps {
  /** Current maturity, 1-5 (fractional allowed; the nearest step is "here"). */
  level: number;
  /** Optional 90-day target level (1-5). */
  target?: number;
  /** Optional plain-English caption under the ramp. */
  caption?: string;
}

export function MaturityRamp({ level, target, caption }: MaturityRampProps) {
  const here = Math.min(5, Math.max(1, Math.round(level)));
  const hereLabel = STEPS[here - 1]?.label ?? "";
  const targetLabel =
    target != null ? STEPS[Math.min(5, Math.max(1, Math.round(target))) - 1]?.label : null;

  return (
    <div>
      <div className="flex items-end gap-1.5 h-14">
        {STEPS.map((s) => {
          const isHere = s.n === here;
          const reached = s.n <= here;
          return (
            <div
              key={s.n}
              className={`flex-1 rounded-sm ${s.bar} ${s.h} ${
                reached ? "" : "opacity-40"
              } ${isHere ? "outline outline-2 outline-ink outline-offset-2" : ""}`}
              aria-current={isHere ? "step" : undefined}
            />
          );
        })}
      </div>
      <div className="mt-3 flex justify-between text-[11px] text-faint tabular-nums">
        {STEPS.map((s) => (
          <span key={s.n} className={s.n === here ? "font-semibold text-ink" : ""}>
            {s.n} · {s.label}
          </span>
        ))}
      </div>
      <p className="mt-4 text-sm text-muted">
        You are at{" "}
        <span className="font-semibold text-ink">
          Level {here} — {hereLabel}
        </span>
        {targetLabel ? (
          <>
            . The 90-day target is{" "}
            <span className="font-semibold text-ink">
              Level {Math.round(target as number)} — {targetLabel}
            </span>
            .
          </>
        ) : (
          "."
        )}
      </p>
      {caption && <p className="mt-2 text-sm text-muted">{caption}</p>}
    </div>
  );
}
