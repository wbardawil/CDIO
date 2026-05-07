"use client";

import { useState } from "react";
import { MODULE_NAMES } from "@/types";
import type { DiagnosticAnswer } from "@/types";
import {
  getModuleQuestions,
  type DiagnosticQuestion,
} from "@/lib/playbook/diagnostic-questions";
import {
  filterQuestionsForRole,
  selectAdaptiveSubset,
} from "@/lib/playbook/role-tag-mapping";

/**
 * Phase 1C assessment form (2026-05-06):
 *
 *   - Module gate: if the role's filter leaves the module empty, the
 *     respondent sees a "Can you speak to this area?" panel and can
 *     skip the whole module with a single click. Skip submits a
 *     module_skipped=true row so the practitioner knows who abstained.
 *
 *   - Per-question N/A: every v2-schema question carries a text-link
 *     "I can't answer this" that selects "na" as the answer. N/A is
 *     visually neutral — not red, not green — to remove pressure.
 *
 *   - Inline framework citations: v2-schema questions display the
 *     NIST CSF (or other) reference inline, which surfaces authority
 *     in the assessment itself.
 *
 *   - 5-level maturity indicators: v2-schema questions show 5
 *     indicators (L1-L5). Legacy questions still show 4.
 *
 *   - Role filtering: if the question carries tags that don't match
 *     the respondent's role, the question is hidden. CEOs no longer
 *     answer the CTO's encryption-strategy question.
 */

interface AssessmentFormProps {
  moduleNumber: number;
  /** Free-text role from stakeholder.role; used for question-level filtering. */
  stakeholderRole: string;
  onSubmit: (
    responses: {
      question_id: string;
      question_text: string;
      answer: DiagnosticAnswer;
      evidence?: string;
    }[],
    businessImpact: number,
    moduleSkipped: boolean
  ) => void;
  onBusinessImpact?: (rating: number) => void;
}

export function AssessmentForm({
  moduleNumber,
  stakeholderRole,
  onSubmit,
  onBusinessImpact,
}: AssessmentFormProps) {
  const allModuleQuestions = getModuleQuestions(moduleNumber);
  const roleFiltered = filterQuestionsForRole(allModuleQuestions, stakeholderRole);
  // Phase 1C Day 16 — Tier 1 AI leverage. Cap at 8 questions per
  // stakeholder per module so the assessment finishes inside one
  // sitting; subcategory breadth preserved by the selector.
  const questions = selectAdaptiveSubset(roleFiltered, 8);
  const wasAdaptivelyTrimmed = roleFiltered.length > questions.length;
  const moduleName = MODULE_NAMES[moduleNumber] ?? `Module ${moduleNumber}`;

  // The role filter dropped every question for this module. Show the
  // module-gate panel — the respondent isn't qualified for this section.
  const isModuleEmpty = questions.length === 0 && allModuleQuestions.length > 0;

  // module-gate state for v2 questions: explicit "Can you speak to this?"
  const [gateAnswer, setGateAnswer] = useState<"yes" | "no" | null>(
    isModuleEmpty ? "no" : null
  );

  const [responses, setResponses] = useState<
    Record<string, { answer: DiagnosticAnswer; evidence: string }>
  >({});
  const [impactRating, setImpactRating] = useState<number>(5);
  const [showEvidence, setShowEvidence] = useState<Record<string, boolean>>({});

  const updateResponse = (qId: string, answer: DiagnosticAnswer) => {
    setResponses((prev) => ({
      ...prev,
      [qId]: { answer, evidence: prev[qId]?.evidence ?? "" },
    }));
  };

  const updateEvidence = (qId: string, evidence: string) => {
    setResponses((prev) => ({
      ...prev,
      [qId]: { answer: prev[qId]?.answer ?? "no", evidence },
    }));
  };

  const handleSubmit = () => {
    const formattedResponses = questions.map((q) => ({
      question_id: q.id,
      question_text: q.question,
      answer: responses[q.id]?.answer ?? "no",
      evidence: responses[q.id]?.evidence || undefined,
    }));
    onBusinessImpact?.(impactRating);
    onSubmit(formattedResponses, impactRating, false);
  };

  const handleGateSkip = () => {
    // Module-skipped: submit with no responses + module_skipped flag.
    onSubmit([], impactRating, true);
  };

  const answeredCount = Object.keys(responses).length;
  const progress = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  // ---------- Render: Module gate (role mismatch OR explicit user choice) ----------

  if (isModuleEmpty || gateAnswer === "no") {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Module {moduleNumber}: {moduleName}
          </h2>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
          <h3 className="text-base font-semibold text-amber-900 mb-2">
            {isModuleEmpty
              ? "This module isn't tailored to your role"
              : "Skip this module?"}
          </h3>
          <p className="text-sm text-amber-800 mb-4">
            {isModuleEmpty ? (
              <>
                Based on your role (<strong>{stakeholderRole}</strong>), there
                are no questions in this module that match your area of
                responsibility. We&apos;d rather have you skip than guess —
                marking this module N/A keeps the team&apos;s consensus score
                accurate.
              </>
            ) : (
              <>
                You can mark this entire module as N/A. Your responses won&apos;t
                affect the team&apos;s consensus score, and the practitioner
                will see that you abstained.
              </>
            )}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleGateSkip}
              className="inline-flex justify-center px-5 py-2.5 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700"
            >
              Mark module N/A and continue →
            </button>
            {!isModuleEmpty && (
              <button
                type="button"
                onClick={() => setGateAnswer("yes")}
                className="inline-flex justify-center px-5 py-2.5 border border-amber-300 text-amber-900 text-sm font-medium rounded-lg hover:bg-amber-100 bg-white"
              >
                Actually, let me try
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ---------- Render: Module gate prompt (v2 questions, before answering) ----------

  // For v2-schema modules with at least one tagged question, ask up front
  // whether the respondent can speak to this area at all. This is the
  // per-module N/A primary escape — preferred over per-question abstention.
  const moduleHasTags = questions.some((q) => q.tags !== undefined);
  if (moduleHasTags && gateAnswer === null) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Module {moduleNumber}: {moduleName}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {questions.length} questions tailored to your role ({stakeholderRole})
          </p>
        </div>

        <div className="rounded-xl border border-blue-200 bg-blue-50 p-6">
          <h3 className="text-base font-semibold text-blue-900 mb-2">
            Before you start: can you speak to this area?
          </h3>
          <p className="text-sm text-blue-800 mb-4">
            Honest abstention is more useful than a guess. If this section sits
            outside what you have visibility into, mark it N/A and we&apos;ll
            move on — the practitioner will know to ask someone else.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => setGateAnswer("yes")}
              className="inline-flex justify-center px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
            >
              Yes, I can speak to this →
            </button>
            <button
              type="button"
              onClick={() => setGateAnswer("no")}
              className="inline-flex justify-center px-5 py-2.5 border border-blue-300 text-blue-900 text-sm font-medium rounded-lg hover:bg-blue-100 bg-white"
            >
              No, mark this section N/A
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---------- Render: Question form ----------

  // Group questions by subcategory for visual hierarchy
  const grouped = questions.reduce<Record<string, DiagnosticQuestion[]>>(
    (acc, q) => {
      (acc[q.subcategory] ??= []).push(q);
      return acc;
    },
    {}
  );

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">
          Module {moduleNumber}: {moduleName}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {questions.length} questions for your role ({stakeholderRole})
          {wasAdaptivelyTrimmed && (
            <span className="text-xs text-gray-400 ml-1.5">
              · narrowed from {roleFiltered.length} for focus
            </span>
          )}
        </p>
        <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-gray-500 mt-1">
          {answeredCount} of {questions.length} questions answered
        </p>
      </div>

      {/* Questions by subcategory */}
      {Object.entries(grouped).map(([subcategory, subQuestions]) => (
        <div key={subcategory} className="mb-8">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
            {subcategory}
          </h3>

          <div className="space-y-4">
            {subQuestions.map((q) => {
              const currentAnswer = responses[q.id]?.answer;
              return (
                <div
                  key={q.id}
                  className="border border-gray-200 rounded-lg p-5 hover:border-blue-200 transition-colors"
                >
                  {/* Question + framework citation */}
                  <p className="font-medium text-gray-900 mb-1">{q.question}</p>
                  {q.framework_citation && (
                    <p className="text-[11px] text-gray-500 mb-3">
                      <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded font-medium mr-1.5">
                        {q.framework_citation.framework}
                      </span>
                      <span className="font-medium text-gray-600">
                        {q.framework_citation.reference}
                      </span>
                      <span className="ml-1.5">— {q.framework_citation.rationale}</span>
                    </p>
                  )}

                  {/* Answer buttons */}
                  <div className="flex gap-2 mb-3 flex-wrap">
                    {(["yes", "partial", "no"] as const).map((answer) => (
                      <button
                        key={answer}
                        type="button"
                        onClick={() => updateResponse(q.id, answer)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          currentAnswer === answer
                            ? answer === "yes"
                              ? "bg-green-500 text-white"
                              : answer === "partial"
                                ? "bg-amber-500 text-white"
                                : "bg-red-400 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {answer === "yes" ? "Yes" : answer === "partial" ? "Partial" : "No"}
                      </button>
                    ))}
                    {/* N/A — muted text-link, never colored — pressure-free abstention. */}
                    {(q.na_eligible ?? true) && (
                      <button
                        type="button"
                        onClick={() => updateResponse(q.id, "na")}
                        className={`px-3 py-2 text-sm font-medium transition-colors underline-offset-2 ${
                          currentAnswer === "na"
                            ? "text-amber-700 underline"
                            : "text-gray-500 hover:text-gray-700 hover:underline"
                        }`}
                      >
                        {currentAnswer === "na" ? "✓ N/A — I can't answer this" : "I can't answer this"}
                      </button>
                    )}
                  </div>

                  {/* Level indicators (collapsed). Show 5 if available, else 4. */}
                  <details className="text-xs text-gray-500 mb-2">
                    <summary className="cursor-pointer hover:text-gray-700">
                      View maturity level indicators
                    </summary>
                    <div
                      className={`mt-2 grid gap-2 ${
                        q.level_indicators.level_5 ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-5" : "grid-cols-2"
                      }`}
                    >
                      <div className="p-2 bg-red-50 rounded">
                        <span className="font-medium">L1 Initial:</span>{" "}
                        {q.level_indicators.level_1}
                      </div>
                      <div className="p-2 bg-amber-50 rounded">
                        <span className="font-medium">L2 Developing:</span>{" "}
                        {q.level_indicators.level_2}
                      </div>
                      <div className="p-2 bg-blue-50 rounded">
                        <span className="font-medium">L3 Defined:</span>{" "}
                        {q.level_indicators.level_3}
                      </div>
                      <div className="p-2 bg-green-50 rounded">
                        <span className="font-medium">L4 Managed:</span>{" "}
                        {q.level_indicators.level_4}
                      </div>
                      {q.level_indicators.level_5 && (
                        <div className="p-2 bg-emerald-100 rounded border border-emerald-300">
                          <span className="font-medium">L5 Optimizing:</span>{" "}
                          {q.level_indicators.level_5}
                        </div>
                      )}
                    </div>
                  </details>

                  {/* Evidence (only for non-N/A answers) */}
                  {currentAnswer && currentAnswer !== "na" && (
                    <div>
                      <button
                        type="button"
                        onClick={() =>
                          setShowEvidence((prev) => ({
                            ...prev,
                            [q.id]: !prev[q.id],
                          }))
                        }
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        {showEvidence[q.id] ? "Hide" : "Add"} evidence/notes
                      </button>
                      {showEvidence[q.id] && (
                        <textarea
                          value={responses[q.id]?.evidence ?? ""}
                          onChange={(e) => updateEvidence(q.id, e.target.value)}
                          placeholder="Optional: describe your evidence or context..."
                          className="mt-2 w-full border border-gray-200 rounded-lg p-3 text-sm resize-none focus:outline-none focus:border-blue-400"
                          rows={2}
                        />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Business Impact Rating */}
      <div className="mb-8 border border-gray-200 rounded-lg p-5">
        <h3 className="font-medium text-gray-900 mb-3">
          How critical is this area to your business success?
        </h3>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min={1}
            max={10}
            value={impactRating}
            onChange={(e) => setImpactRating(Number(e.target.value))}
            className="flex-1"
          />
          <span className="text-2xl font-bold text-blue-600 w-8 text-center">
            {impactRating}
          </span>
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>Low Impact</span>
          <span>Critical</span>
        </div>
      </div>

      {/* Submit */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={answeredCount < questions.length}
        className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        {answeredCount < questions.length
          ? `Answer all questions to continue (${
              questions.length - answeredCount
            } remaining)`
          : "Submit Assessment"}
      </button>
    </div>
  );
}
