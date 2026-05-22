import type { Stage } from "@/types/cockpit";
import { STAGES, STAGE_LABELS } from "@/types/cockpit";
import { eyebrow } from "./styles";

/** The lifecycle as a filled progress bar — where the initiative is,
 *  at a glance. Each segment is still clickable to move stages. */
export function StageProgress({
  stage,
  onPick,
}: {
  stage: Stage;
  onPick: (s: Stage) => void;
}) {
  const index = STAGES.indexOf(stage);

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <p className={eyebrow}>
          Stage {index + 1} of {STAGES.length}
        </p>
        <p className="font-serif text-lg font-semibold text-ink">
          {STAGE_LABELS[stage]}
        </p>
      </div>

      <nav aria-label="Initiative stages" className="mt-2 flex gap-1.5">
        {STAGES.map((s, i) => {
          const reached = i <= index;
          const current = i === index;
          return (
            <button
              key={s}
              type="button"
              onClick={() => onPick(s)}
              aria-current={current ? "step" : undefined}
              className="group flex-1 text-left"
            >
              <span
                className={`block h-2 rounded-full transition-colors ${
                  reached ? "bg-evergreen" : "bg-hair"
                } ${current ? "ring-2 ring-evergreen/30" : ""}`}
              />
              <span
                className={`mt-1.5 block text-xs transition-colors ${
                  current
                    ? "font-medium text-ink"
                    : "text-faint group-hover:text-muted"
                }`}
              >
                {STAGE_LABELS[s]}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
