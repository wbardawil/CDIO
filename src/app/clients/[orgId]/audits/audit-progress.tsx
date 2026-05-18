// Persistent Frame · Prep · Verdict strip — the audit's visible
// spine (docs/EXPERIENCE-SPINE.md Law 4). Same strip on the intake
// screen and the detail screen so the user always feels the system
// carrying the engagement forward, not driving every step alone.
//
// Presentational + prop-driven (no "use client", no server-only
// imports) so the server intake page and the client detail view
// render the identical element.

const STEPS = [
  { n: 1, label: "Frame the decision" },
  { n: 2, label: "Prep the room" },
  { n: 3, label: "The verdict" },
] as const;

export function AuditProgress({
  step,
  done = [],
}: {
  /** The step currently in focus (1 Frame, 2 Prep, 3 Verdict). */
  step: 1 | 2 | 3;
  /** Steps already completed (rendered with a check). */
  done?: number[];
}) {
  return (
    <ol className="flex items-center gap-2 text-sm" aria-label="Audit progress">
      {STEPS.map((s, i) => {
        const isDone = done.includes(s.n);
        const isCurrent = s.n === step;
        const circle = isDone
          ? "bg-evergreen text-white"
          : isCurrent
            ? "bg-evergreen text-white"
            : "bg-hair text-muted";
        const text = isCurrent
          ? "text-ink font-semibold"
          : isDone
            ? "text-ink"
            : "text-faint";
        return (
          <li key={s.n} className="flex items-center gap-2">
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${circle}`}
              aria-current={isCurrent ? "step" : undefined}
            >
              {isDone ? "✓" : s.n}
            </span>
            <span className={`whitespace-nowrap ${text}`}>{s.label}</span>
            {i < STEPS.length - 1 && (
              <span className="mx-1 h-px w-6 bg-hair sm:w-10" aria-hidden />
            )}
          </li>
        );
      })}
    </ol>
  );
}
