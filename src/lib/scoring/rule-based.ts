// ============================================================
// AI-CDIO — Rule-Based Scoring (fallback when no Anthropic key)
// Scores maturity based on diagnostic question responses
// using simple yes/no/partial counting
// ============================================================

import type { MaturityLevel } from "@/types";

interface DiagnosticInput {
  question_text: string;
  answer: "yes" | "no" | "partial";
  evidence?: string;
}

export function scoreModuleFromResponses(
  responses: DiagnosticInput[]
): {
  maturity_score: MaturityLevel;
  evidence: string;
  key_gaps: string[];
  recommended_actions: string[];
} {
  if (responses.length === 0) {
    return { maturity_score: 1, evidence: "No responses provided.", key_gaps: [], recommended_actions: [] };
  }

  // Count responses
  const yes = responses.filter((r) => r.answer === "yes").length;
  const partial = responses.filter((r) => r.answer === "partial").length;
  const no = responses.filter((r) => r.answer === "no").length;
  const total = responses.length;

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
  const evidence = `${yes}/${total} capabilities confirmed, ${partial} partial, ${no} gaps identified.`;

  // Identify gaps (questions answered "no")
  const key_gaps = responses
    .filter((r) => r.answer === "no")
    .map((r) => r.question_text);

  // Basic recommended actions from gaps
  const recommended_actions = key_gaps.slice(0, 3).map((gap) => `Address: ${gap}`);

  return { maturity_score, evidence, key_gaps, recommended_actions };
}
