// ============================================================
// AI-CDIO — Rule-Based Scoring (fallback when no Anthropic key)
// Scores maturity based on diagnostic question responses
// using simple yes/no/partial counting.
//
// Phase 1C update (2026-05-06): "na" answers are excluded from the
// denominator entirely — they're abstentions, not failures. If every
// answer is N/A (or the module was gate-skipped), the function returns
// maturity_score=null + module_skipped=true so the synthesis layer
// can route around it.
// ============================================================

import type { MaturityLevel, DiagnosticAnswer } from "@/types";

interface DiagnosticInput {
  question_text: string;
  answer: DiagnosticAnswer;
  evidence?: string;
}

export interface RuleBasedResult {
  maturity_score: MaturityLevel | null;
  evidence: string;
  key_gaps: string[];
  recommended_actions: string[];
  module_skipped: boolean;
}

export function scoreModuleFromResponses(
  responses: DiagnosticInput[],
  moduleSkipped: boolean = false
): RuleBasedResult {
  // Module-gate skip: stakeholder said "I can't speak to this area".
  if (moduleSkipped) {
    return {
      maturity_score: null,
      evidence: "Stakeholder marked this module N/A at the module gate.",
      key_gaps: [],
      recommended_actions: [],
      module_skipped: true,
    };
  }

  if (responses.length === 0) {
    return {
      maturity_score: null,
      evidence: "No responses provided.",
      key_gaps: [],
      recommended_actions: [],
      module_skipped: true,
    };
  }

  // Drop N/A answers from the denominator. They're absences, not zeros.
  const answered = responses.filter((r) => r.answer !== "na");
  const naCount = responses.length - answered.length;

  // If everything was N/A, treat as effectively skipped.
  if (answered.length === 0) {
    return {
      maturity_score: null,
      evidence: `Stakeholder abstained on all ${responses.length} questions in this module.`,
      key_gaps: [],
      recommended_actions: [],
      module_skipped: true,
    };
  }

  // Count answered responses (na is excluded by construction above).
  const yes = answered.filter((r) => r.answer === "yes").length;
  const partial = answered.filter((r) => r.answer === "partial").length;
  const no = answered.filter((r) => r.answer === "no").length;
  const total = answered.length;

  // Calculate weighted score (yes=1, partial=0.5, no=0)
  const weightedScore = (yes + partial * 0.5) / total;

  // Map to 5-level maturity scale
  let maturity_score: MaturityLevel;
  if (weightedScore >= 0.9) maturity_score = 5;
  else if (weightedScore >= 0.7) maturity_score = 4;
  else if (weightedScore >= 0.5) maturity_score = 3;
  else if (weightedScore >= 0.3) maturity_score = 2;
  else maturity_score = 1;

  // Build evidence summary
  const naSuffix = naCount > 0 ? `, ${naCount} N/A` : "";
  const evidence = `${yes}/${total} capabilities confirmed, ${partial} partial, ${no} gaps identified${naSuffix}.`;

  // Identify gaps (questions answered "no")
  const key_gaps = answered
    .filter((r) => r.answer === "no")
    .map((r) => r.question_text);

  // Basic recommended actions from gaps
  const recommended_actions = key_gaps.slice(0, 3).map((gap) => `Address: ${gap}`);

  return {
    maturity_score,
    evidence,
    key_gaps,
    recommended_actions,
    module_skipped: false,
  };
}
