import type { Stage } from "@/types/cockpit";
import { STAGE_LENS, STAGE_LABELS } from "@/types/cockpit";
import { eyebrow } from "./styles";

/** Shows, in plain language, what the cockpit checks the initiative
 *  against at the selected stage — so the stage buttons visibly mean
 *  something. */
export function StageLens({ stage }: { stage: Stage }) {
  return (
    <div className="rounded-md border border-hair bg-surface px-4 py-3">
      <p className={eyebrow}>{STAGE_LABELS[stage]} — what this stage checks</p>
      <p className="mt-1 text-sm leading-relaxed text-muted">
        {STAGE_LENS[stage]}
      </p>
    </div>
  );
}
