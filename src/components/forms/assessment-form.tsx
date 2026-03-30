"use client";

import { useState } from "react";
import { MODULE_NAMES } from "@/types";
import { getModuleQuestions, type DiagnosticQuestion } from "@/lib/playbook/diagnostic-questions";

interface AssessmentFormProps {
  moduleNumber: number;
  onSubmit: (
    responses: {
      question_text: string;
      answer: "yes" | "no" | "partial";
      evidence?: string;
    }[],
    businessImpact: number
  ) => void;
  onBusinessImpact?: (rating: number) => void;
}

export function AssessmentForm({ moduleNumber, onSubmit, onBusinessImpact }: AssessmentFormProps) {
  const questions = getModuleQuestions(moduleNumber);
  const moduleName = MODULE_NAMES[moduleNumber] ?? `Module ${moduleNumber}`;

  const [responses, setResponses] = useState<
    Record<string, { answer: "yes" | "no" | "partial"; evidence: string }>
  >({});
  const [impactRating, setImpactRating] = useState<number>(5);
  const [showEvidence, setShowEvidence] = useState<Record<string, boolean>>({});

  const updateResponse = (qId: string, answer: "yes" | "no" | "partial") => {
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
      question_text: q.question,
      answer: responses[q.id]?.answer ?? "no",
      evidence: responses[q.id]?.evidence || undefined,
    }));
    onBusinessImpact?.(impactRating);
    onSubmit(formattedResponses, impactRating);
  };

  const answeredCount = Object.keys(responses).length;
  const progress = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  // Group questions by subcategory
  const grouped = questions.reduce<Record<string, DiagnosticQuestion[]>>((acc, q) => {
    (acc[q.subcategory] ??= []).push(q);
    return acc;
  }, {});

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">
          Module {moduleNumber}: {moduleName}
        </h2>
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
            {subQuestions.map((q) => (
              <div
                key={q.id}
                className="border border-gray-200 rounded-lg p-5 hover:border-blue-200 transition-colors"
              >
                <p className="font-medium text-gray-900 mb-3">{q.question}</p>

                {/* Answer buttons */}
                <div className="flex gap-2 mb-3">
                  {(["yes", "partial", "no"] as const).map((answer) => (
                    <button
                      key={answer}
                      onClick={() => updateResponse(q.id, answer)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        responses[q.id]?.answer === answer
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
                </div>

                {/* Level indicators (collapsed) */}
                <details className="text-xs text-gray-500 mb-2">
                  <summary className="cursor-pointer hover:text-gray-700">
                    View maturity level indicators
                  </summary>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div className="p-2 bg-red-50 rounded">
                      <span className="font-medium">L1:</span> {q.level_indicators.level_1}
                    </div>
                    <div className="p-2 bg-amber-50 rounded">
                      <span className="font-medium">L2:</span> {q.level_indicators.level_2}
                    </div>
                    <div className="p-2 bg-blue-50 rounded">
                      <span className="font-medium">L3:</span> {q.level_indicators.level_3}
                    </div>
                    <div className="p-2 bg-green-50 rounded">
                      <span className="font-medium">L4:</span> {q.level_indicators.level_4}
                    </div>
                  </div>
                </details>

                {/* Evidence (optional) */}
                {responses[q.id] && (
                  <div>
                    <button
                      onClick={() =>
                        setShowEvidence((prev) => ({ ...prev, [q.id]: !prev[q.id] }))
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
            ))}
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
        onClick={handleSubmit}
        disabled={answeredCount < questions.length}
        className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        {answeredCount < questions.length
          ? `Answer all questions to continue (${questions.length - answeredCount} remaining)`
          : "Submit Assessment"}
      </button>
    </div>
  );
}
