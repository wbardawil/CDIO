// ============================================================
// CDIO Review Cockpit — the methodology slice
//
// The 16-module / 124-question methodology is a HIDDEN check-
// library, not a survey. Each lifecycle stage runs the relevant
// slice of modules as the brief extractor's grading rubric —
// that is what produces the brief's risks, gaps, and questions.
//
// No new per-question tagging: the question bank has module/role/
// area tags but no stage tags. The stage→module map below is the
// plan's own mapping, encoded as a static constant. getRubric()
// is a real query over the existing getModuleQuestions().
// ============================================================

import {
  getModuleQuestions,
  type DiagnosticQuestion,
} from "@/lib/playbook/diagnostic-questions";
import type { Stage, InitiativeType } from "@/types/cockpit";

// Stage → modules (from the cockpit plan, "How the methodology applies"):
//   Frame    → leadership, strategy alignment, exec comms, finance/value
//   Discover → foundation, data, IT operations
//   Decide   → modernization, cloud/infra, finance, strategy fit
//   Source   → vendors/SaaS, platforms/APIs, security, finance
//   Plan     → delivery/DevOps, workforce/change, security, IT operations
export const STAGE_MODULES: Record<Stage, number[]> = {
  frame: [1, 2, 10, 12],
  discover: [3, 6, 8, 11], // +8 Analytics — Discover was thin at 3 modules
  decide: [3, 4, 12, 2],
  source: [13, 7, 5, 12],
  plan: [14, 16, 5, 11],
};

// Initiative type pulls extra modules in on top of the stage slice
// (a CRM pulls customer experience; a data initiative pulls analytics).
export const INITIATIVE_TYPE_MODULES: Record<InitiativeType, number[]> = {
  crm: [9],
  erp: [11, 15],
  data: [6, 8],
  security: [5],
  infra: [4],
  other: [],
};

export interface RubricCheck {
  module: number;
  subcategory: string;
  question: string;
  weakSignal: string; // what an immature / unaddressed answer looks like
  strongSignal: string; // what a sound answer looks like
}

/** The modules in scope for a stage + initiative type. Also used
 *  by the founder's backend coverage view. */
export function modulesForStage(
  stage: Stage,
  type: InitiativeType | null
): number[] {
  const modules = new Set<number>(STAGE_MODULES[stage]);
  if (type) {
    for (const m of INITIATIVE_TYPE_MODULES[type]) modules.add(m);
  }
  return [...modules].sort((a, b) => a - b);
}

/** The grading rubric for a stage: the questions a sound decision
 *  at this stage must address, with weak/strong signals so the
 *  extractor can judge what the documents do and do not cover. */
export function getRubric(
  stage: Stage,
  type: InitiativeType | null
): RubricCheck[] {
  const checks: RubricCheck[] = [];
  for (const m of modulesForStage(stage, type)) {
    for (const q of getModuleQuestions(m)) {
      checks.push(toCheck(m, q));
    }
  }
  return checks;
}

function toCheck(module: number, q: DiagnosticQuestion): RubricCheck {
  return {
    module,
    subcategory: q.subcategory,
    question: q.question,
    weakSignal: q.level_indicators.level_1,
    strongSignal: q.level_indicators.level_5 || q.level_indicators.level_4,
  };
}

/** Render the rubric as a compact text block for the extraction
 *  prompt. The module numbers stay in — they are hidden from the
 *  PM but help the model group its reasoning. */
export function formatRubric(checks: RubricCheck[]): string {
  return checks
    .map(
      (c, i) =>
        `${i + 1}. [${c.subcategory}] ${c.question}\n` +
        `   weak: ${c.weakSignal}\n` +
        `   strong: ${c.strongSignal}`
    )
    .join("\n");
}
