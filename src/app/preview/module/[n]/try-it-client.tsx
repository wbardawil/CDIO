"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { filterQuestionsForRole } from "@/lib/playbook/role-tag-mapping";
import { scoreModuleFromResponses } from "@/lib/scoring/rule-based";
import type { DiagnosticQuestion } from "@/lib/playbook/diagnostic-questions";
import type { DiagnosticAnswer, MaturityLevel } from "@/types";

interface RoleOption {
  key: string;
  label: string;
}

const ROLE_OPTIONS: RoleOption[] = [
  { key: "ceo", label: "CEO / Founder / Owner / President" },
  { key: "cfo", label: "CFO" },
  { key: "coo", label: "COO" },
  { key: "cio", label: "CIO / CDIO" },
  { key: "cto", label: "CTO" },
  { key: "ciso", label: "CISO" },
  { key: "director-it", label: "Director / Manager — IT" },
  { key: "director-operations", label: "Director / Manager — Operations" },
  { key: "director-finance", label: "Director / Manager — Finance" },
  { key: "director-sales", label: "Director / Manager — Sales" },
  { key: "director-marketing", label: "Director / Manager — Marketing" },
  { key: "director-other", label: "Director / Manager — Other" },
];

const ANSWER_OPTIONS: { key: DiagnosticAnswer; label: string; color: string }[] = [
  { key: "yes", label: "Yes", color: "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100" },
  { key: "partial", label: "Partial", color: "bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100" },
  { key: "no", label: "No", color: "bg-red-50 text-red-700 border-red-300 hover:bg-red-100" },
  { key: "na", label: "N/A", color: "bg-gray-50 text-gray-600 border-gray-300 hover:bg-gray-100" },
];

interface TryItClientProps {
  moduleNumber: number;
  moduleName: string;
  oneLiner: string;
  framework: string;
  questions: DiagnosticQuestion[];
}

export function TryItClient({
  moduleNumber,
  moduleName,
  oneLiner,
  framework,
  questions,
}: TryItClientProps) {
  const [role, setRole] = useState<string>("ceo");
  const [answers, setAnswers] = useState<Record<string, DiagnosticAnswer>>({});
  const [submitted, setSubmitted] = useState(false);

  const filteredQuestions = useMemo(
    () => filterQuestionsForRole(questions, role),
    [questions, role]
  );

  const filteredIds = useMemo(
    () => new Set(filteredQuestions.map((q) => q.id)),
    [filteredQuestions]
  );

  const allAnswered = filteredQuestions.every((q) => answers[q.id] !== undefined);
  const answeredCount = filteredQuestions.filter(
    (q) => answers[q.id] !== undefined
  ).length;

  const handleAnswer = (questionId: string, answer: DiagnosticAnswer) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleRoleChange = (newRole: string) => {
    setRole(newRole);
    setSubmitted(false);
  };

  const handleReset = () => {
    setAnswers({});
    setSubmitted(false);
  };

  const handleCompute = () => {
    setSubmitted(true);
  };

  const result = useMemo(() => {
    if (!submitted) return null;
    const responsesForScoring = filteredQuestions.map((q) => ({
      question_text: q.question,
      answer: answers[q.id] ?? ("na" as DiagnosticAnswer),
    }));
    const r = scoreModuleFromResponses(responsesForScoring, false);

    const subcategoryBreakdown = bucketBySubcategory(filteredQuestions, answers);

    return { ...r, subcategoryBreakdown };
  }, [submitted, filteredQuestions, answers]);

  const subcategoryGroups = useMemo(
    () => groupBySubcategory(filteredQuestions),
    [filteredQuestions]
  );

  return (
    <main className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-6 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-900">
        <strong>Try-it mode.</strong> Pick a role, answer the questions you can
        speak to, click Compute. No persistence, no DB write. Pure exercise of
        the role filter + scoring logic.
      </div>

      <section className="mb-6 bg-white border border-gray-200 rounded-xl p-5">
        <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
          Stakeholder role
        </label>
        <select
          value={role}
          onChange={(e) => handleRoleChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {ROLE_OPTIONS.map((r) => (
            <option key={r.key} value={r.key}>
              {r.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-2">
          {filteredQuestions.length} of {questions.length} questions in Module{" "}
          {moduleNumber} are visible for this role.
        </p>
      </section>

      {filteredQuestions.length === 0 ? (
        <div className="px-5 py-8 bg-amber-50 border border-amber-200 rounded-xl text-center text-sm text-amber-900">
          This role has no qualifying questions in Module {moduleNumber}. The
          assessment UI would short-circuit into the module-gate &ldquo;you&apos;re
          not the right person for this section&rdquo; view and skip the module
          for this stakeholder.
        </div>
      ) : (
        <>
          {subcategoryGroups.map((group) => (
            <section key={group.subcategory} className="mb-6">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
                {group.subcategory}{" "}
                <span className="text-gray-400 font-normal">
                  ({group.questions.length})
                </span>
              </h2>
              <ul className="space-y-3">
                {group.questions.map((q) => {
                  if (!filteredIds.has(q.id)) return null;
                  return (
                    <li
                      key={q.id}
                      className="bg-white border border-gray-200 rounded-xl px-5 py-4"
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <p className="text-sm font-medium text-gray-900 flex-1">
                          {q.question}
                        </p>
                        <span className="text-xs font-mono text-gray-400 shrink-0">
                          {q.id}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {ANSWER_OPTIONS.map((opt) => {
                          const selected = answers[q.id] === opt.key;
                          return (
                            <button
                              key={opt.key}
                              type="button"
                              onClick={() => handleAnswer(q.id, opt.key)}
                              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition ${
                                selected
                                  ? `${opt.color} ring-2 ring-offset-1 ring-blue-500`
                                  : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"
                              }`}
                            >
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}

          <div className="flex flex-wrap items-center gap-3 mt-8 pb-2">
            <button
              type="button"
              onClick={handleCompute}
              disabled={!allAnswered}
              className={`px-5 py-2.5 text-sm font-semibold rounded-lg ${
                allAnswered
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              Compute score
            </button>
            <span className="text-xs text-gray-500">
              {answeredCount} of {filteredQuestions.length} answered
            </span>
            {answeredCount > 0 && (
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-gray-500 hover:text-gray-900 ml-auto"
              >
                Reset answers
              </button>
            )}
          </div>
        </>
      )}

      {result && (
        <section className="mt-10 bg-white border-2 border-blue-300 rounded-xl p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-blue-700 mb-1">
            Computed maturity
          </h2>
          <p className="text-xs text-gray-500 mb-4">
            Module {moduleNumber} &middot; {moduleName} &middot; framed by{" "}
            <span className="italic">&ldquo;{oneLiner}&rdquo;</span> &middot;
            anchored to {framework}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Maturity score (rule-based)
              </p>
              {result.maturity_score === null ? (
                <p className="text-2xl font-bold text-gray-500 mt-1">
                  N/A — module skipped
                </p>
              ) : (
                <p className="text-4xl font-bold text-blue-700 mt-1">
                  {result.maturity_score}{" "}
                  <span className="text-base font-normal text-gray-500">
                    / 5 ({maturityLabel(result.maturity_score)})
                  </span>
                </p>
              )}
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Evidence
              </p>
              <p className="text-sm text-gray-700 mt-1">{result.evidence}</p>
            </div>
          </div>

          {result.subcategoryBreakdown.length > 1 && (
            <div className="mb-6">
              <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">
                By subcategory
              </p>
              <ul className="space-y-2">
                {result.subcategoryBreakdown.map((b) => (
                  <li
                    key={b.subcategory}
                    className="flex items-center justify-between text-sm border border-gray-100 rounded-lg px-3 py-2"
                  >
                    <span className="text-gray-700">{b.subcategory}</span>
                    <span className="text-xs text-gray-500">
                      {b.yes} yes &middot; {b.partial} partial &middot;{" "}
                      {b.no} no &middot; {b.na} N/A
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.key_gaps.length > 0 && (
            <div className="mb-2">
              <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">
                Top gaps (questions answered &ldquo;no&rdquo;)
              </p>
              <ul className="space-y-1.5 list-disc pl-5 text-sm text-gray-700">
                {result.key_gaps.slice(0, 5).map((g, i) => (
                  <li key={i}>{g}</li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-xs text-gray-400 mt-4">
            This is the rule-based fallback score — production assessments
            also run an AI agent that produces a narrative + path-to-next-level
            recommendations. Try-it mode skips the AI step.
          </p>

          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Try again with different answers
            </button>
            <Link
              href={`/preview/module/${moduleNumber}`}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Back to module detail
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}

function maturityLabel(level: MaturityLevel): string {
  switch (level) {
    case 1:
      return "Initial";
    case 2:
      return "Developing";
    case 3:
      return "Defined";
    case 4:
      return "Managed";
    case 5:
      return "Optimizing";
    default:
      return "";
  }
}

interface SubcategoryBucket {
  subcategory: string;
  yes: number;
  partial: number;
  no: number;
  na: number;
}

function bucketBySubcategory(
  questions: DiagnosticQuestion[],
  answers: Record<string, DiagnosticAnswer>
): SubcategoryBucket[] {
  const order: string[] = [];
  const buckets: Record<string, SubcategoryBucket> = {};
  for (const q of questions) {
    const key = q.subcategory || "Uncategorized";
    if (!(key in buckets)) {
      buckets[key] = { subcategory: key, yes: 0, partial: 0, no: 0, na: 0 };
      order.push(key);
    }
    const a = answers[q.id];
    if (a === "yes") buckets[key].yes += 1;
    else if (a === "partial") buckets[key].partial += 1;
    else if (a === "no") buckets[key].no += 1;
    else if (a === "na") buckets[key].na += 1;
  }
  return order.map((k) => buckets[k]);
}

function groupBySubcategory(
  questions: DiagnosticQuestion[]
): { subcategory: string; questions: DiagnosticQuestion[] }[] {
  const order: string[] = [];
  const buckets: Record<string, DiagnosticQuestion[]> = {};
  for (const q of questions) {
    const key = q.subcategory || "Uncategorized";
    if (!(key in buckets)) {
      buckets[key] = [];
      order.push(key);
    }
    buckets[key].push(q);
  }
  return order.map((k) => ({ subcategory: k, questions: buckets[k] }));
}
