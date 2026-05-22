"use client";

import { useEffect, useState } from "react";
import type { Stage } from "@/types/cockpit";
import { eyebrow } from "./styles";

// The narration is the methodology's real gate checks for the
// stage, in plain words. It is timed, not live-streamed — the
// checks shown ARE what runs, just not second-by-second synced.
const NARRATION: Record<Stage, string[]> = {
  frame: [
    "Reading the documents…",
    "Checking the business outcome is defined and measurable…",
    "Checking the budget ceiling and the deadline are pinned…",
    "Looking at how this decision reaches the board…",
    "Drafting the brief…",
  ],
  discover: [
    "Reading the documents…",
    "Mapping how things work today…",
    "Checking the data and the integration picture…",
    "Checking IT operations can carry this…",
    "Drafting the brief…",
  ],
  decide: [
    "Reading the documents…",
    "Weighing the approach against the strategy…",
    "Checking the cost case holds up…",
    "Testing whether the decision is being made a step too early…",
    "Drafting the brief…",
  ],
  source: [
    "Reading the documents…",
    "Comparing the vendor and system options…",
    "Checking integration, security, and the cost terms…",
    "Looking for any option that breaks a non-negotiable…",
    "Drafting the brief…",
  ],
  plan: [
    "Reading the documents…",
    "Checking the delivery and rollout plan…",
    "Checking the team and the change picture…",
    "Checking security and operations are covered…",
    "Drafting the brief…",
  ],
};

const STEP_MS = 5000;

export function ExtractionProgress({ stage }: { stage: Stage }) {
  const lines = NARRATION[stage];
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActive((i) => (i < lines.length - 1 ? i + 1 : i));
    }, STEP_MS);
    return () => clearInterval(id);
  }, [lines.length]);

  return (
    <div className="rounded-lg border border-hair bg-raised p-8">
      <p className={eyebrow}>Working</p>
      <h2 className="mt-2 text-xl text-ink">Building the brief</h2>
      <p className="mt-1 text-sm text-muted">
        This takes up to a minute &mdash; the cockpit is reading your material
        against the methodology.
      </p>
      <ul className="mt-6 space-y-3">
        {lines.map((line, i) => {
          const done = i < active;
          const current = i === active;
          return (
            <li key={i} className="flex items-center gap-3">
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs ${
                  done
                    ? "bg-evergreen text-white"
                    : current
                      ? "border-2 border-evergreen"
                      : "border border-hair"
                }`}
                aria-hidden
              >
                {done ? "✓" : ""}
                {current && (
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-evergreen" />
                )}
              </span>
              <span
                className={
                  done
                    ? "text-sm text-muted"
                    : current
                      ? "text-sm font-medium text-ink"
                      : "text-sm text-faint"
                }
              >
                {line}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
