// ============================================================
// CDIO Review Cockpit — the non-negotiables check
//
// A deterministic pass over the brief's options against the PM's
// constraints. It only flags what it can verify honestly from
// text:
//   * cannot_touch  — a constraint keyword appearing in an option
//                     is a possible conflict.
//   * must_integrate — a constraint keyword absent from every
//                     option means the integration may be
//                     unaddressed.
// Budget and deadline cannot be judged reliably from prose, so
// they are left to the extractor's own risk reasoning rather
// than faked here (never present a thin check as a complete one).
// ============================================================

import type { CDIOBrief, Constraint } from "@/types/cockpit";

export interface ConstraintFlag {
  constraintLabel: string;
  kind: "conflict" | "unaddressed";
  note: string;
}

function keywords(c: Constraint): string[] {
  return `${c.label} ${c.value ?? ""}`
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 3);
}

export function checkConstraints(
  brief: CDIOBrief,
  constraints: Constraint[]
): ConstraintFlag[] {
  const optionText = brief.whatWeFound.options
    .map((o) => `${o.label} ${o.summary} ${o.risks.join(" ")}`)
    .join(" ")
    .toLowerCase();
  if (!optionText.trim()) return []; // no options to check against

  const flags: ConstraintFlag[] = [];
  for (const c of constraints) {
    const kw = keywords(c);
    if (kw.length === 0) continue;
    const hit = kw.some((w) => optionText.includes(w));

    if (c.kind === "cannot_touch" && hit) {
      flags.push({
        constraintLabel: c.label,
        kind: "conflict",
        note: `An option appears to involve “${c.label}”, which you marked do-not-touch. Check this before deciding.`,
      });
    }
    if (c.kind === "must_integrate" && !hit) {
      flags.push({
        constraintLabel: c.label,
        kind: "unaddressed",
        note: `No option clearly addresses integrating with “${c.label}”. The required integration may be unproven.`,
      });
    }
  }
  return flags;
}
