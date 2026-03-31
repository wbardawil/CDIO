"use client";

import { useState, useCallback, useMemo } from "react";
import { SpiderChart } from "@/components/charts/spider-chart";
import { MODULE_NAMES } from "@/types";
import { getQuickScanForModule, type QuickScanQuestion } from "@/lib/playbook/quick-scan-questions";
import { scoreModuleFromResponses } from "@/lib/scoring/rule-based";

interface ModuleResult {
  module: number;
  score: number;
  evidence: string;
  actionCard: {
    title: string;
    why: string;
    impact: string;
  } | null;
}

// Module order: start with high-impact, tangible modules
const MODULE_ORDER = [5, 4, 12, 15, 2, 3, 8, 6, 9, 7, 14, 11, 13, 10, 1, 16];

const PRIORITY_COLORS: Record<string, string> = {
  top_priority: "bg-red-500",
  strategic_bet: "bg-amber-500",
  quick_win: "bg-green-500",
  maintain: "bg-blue-400",
  defer: "bg-gray-400",
};

// Simple action card suggestions based on module + score
function generateQuickAction(module: number, score: number): { title: string; why: string; impact: string } | null {
  if (score >= 4) return null; // No urgent action needed (Level 4-5 are managed/optimizing)

  const actions: Record<number, { title: string; why: string; impact: string }> = {
    1: { title: "Define a technology leadership role", why: "Without clear ownership, tech decisions are reactive", impact: "Faster, more aligned technology decisions" },
    2: { title: "Write a 1-page technology strategy", why: "Even a simple plan beats no plan", impact: "20-30% less wasted tech spending" },
    3: { title: "Create an inventory of all your systems", why: "You can't optimize what you don't know about", impact: "Find redundancies and hidden costs" },
    4: { title: "Review your cloud costs this week", why: "Unmonitored cloud spending grows 30% per year", impact: "Typical savings: 15-25% of cloud bill" },
    5: { title: "Enable MFA on all email accounts", why: "Blocks 99% of automated credential attacks", impact: "2 hours to set up, massive risk reduction" },
    6: { title: "Audit where your sensitive data lives", why: "Unknown data locations are your biggest risk", impact: "Foundation for AI readiness and compliance" },
    7: { title: "Map your customer's digital journey", why: "Gaps in digital experience lose customers", impact: "Identify quick wins for customer satisfaction" },
    8: { title: "Set up a basic executive dashboard", why: "Real-time metrics enable faster decisions", impact: "Managers spend 30% less time gathering data" },
    9: { title: "Run a 5-question customer feedback survey", why: "Assumptions about customer needs are often wrong", impact: "Discover what actually matters to customers" },
    10: { title: "Hold a technology alignment meeting", why: "Misaligned leadership wastes budget on conflicts", impact: "Shared vision = faster execution" },
    11: { title: "Document your IT team's responsibilities", why: "Unclear roles mean things fall through cracks", impact: "Less firefighting, more proactive improvement" },
    12: { title: "Calculate total IT spend (including shadow IT)", why: "Hidden costs are often 30-40% of total", impact: "Find $10K-50K in savings" },
    13: { title: "List all vendors and contract renewal dates", why: "Auto-renewals cost 15-20% more than negotiated", impact: "Immediate savings on next renewal" },
    14: { title: "Start delivering changes in smaller batches", why: "Big releases fail more and take longer to fix", impact: "Faster delivery, fewer production issues" },
    15: { title: "Identify your top 3 most manual processes", why: "Each manual process is an automation opportunity", impact: "Typical: 5-10 hours/week saved per process" },
    16: { title: "Create a digital skills training plan", why: "70% of transformations fail because of people", impact: "Higher adoption of tools you've already paid for" },
  };

  return actions[module] ?? null;
}

export default function ScanPage() {
  const [currentModuleIdx, setCurrentModuleIdx] = useState(0);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, "yes" | "no" | "partial">>({});
  const [results, setResults] = useState<ModuleResult[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  const currentModule = MODULE_ORDER[currentModuleIdx];
  const questions = useMemo(() => getQuickScanForModule(currentModule), [currentModule]);
  const currentQuestion = questions[currentQuestionIdx];

  const spiderScores = useMemo(
    () => results.map((r) => ({ module_number: r.module, score: r.score })),
    [results]
  );

  const handleAnswer = useCallback(
    (answer: "yes" | "no" | "partial") => {
      if (!currentQuestion) return;

      const newAnswers = { ...answers, [currentQuestion.id]: answer };
      setAnswers(newAnswers);

      if (currentQuestionIdx < questions.length - 1) {
        // Next question in same module
        setCurrentQuestionIdx((i) => i + 1);
      } else {
        // Module complete — score it
        const moduleAnswers = questions.map((q) => ({
          question_text: q.question,
          answer: newAnswers[q.id] ?? "no" as "yes" | "no" | "partial",
        }));

        const result = scoreModuleFromResponses(moduleAnswers);
        const actionCard = generateQuickAction(currentModule, result.maturity_score);

        setResults((prev) => [
          ...prev,
          {
            module: currentModule,
            score: result.maturity_score,
            evidence: result.evidence,
            actionCard,
          },
        ]);

        if (currentModuleIdx < MODULE_ORDER.length - 1) {
          // Next module
          setCurrentModuleIdx((i) => i + 1);
          setCurrentQuestionIdx(0);
        } else {
          setIsComplete(true);
        }
      }
    },
    [answers, currentQuestion, currentQuestionIdx, questions, currentModule, currentModuleIdx]
  );

  const completedCount = results.length;
  const progressPct = Math.round((completedCount / 16) * 100);
  const avgScore = results.length > 0
    ? (results.reduce((s, r) => s + r.score, 0) / results.length).toFixed(1)
    : "—";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">AI-CDIO</h1>
            <p className="text-xs text-gray-500">Technology Health Check</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              {completedCount} of 16 modules
            </span>
            <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="text-sm font-medium text-blue-600">{progressPct}%</span>
          </div>
        </div>
      </header>

      {/* Main content — split layout */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT: Questions */}
          <div>
            {!isComplete && currentQuestion ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-8">
                {/* Module header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-sm">M{currentModule}</span>
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">
                      {MODULE_NAMES[currentModule]}
                    </h2>
                    <p className="text-xs text-gray-400">
                      Question {currentQuestionIdx + 1} of {questions.length}
                    </p>
                  </div>
                </div>

                {/* Question */}
                <p className="text-lg text-gray-800 mb-3 leading-relaxed">
                  {currentQuestion.question}
                </p>
                <p className="text-sm text-gray-500 mb-8 italic">
                  {currentQuestion.why}
                </p>

                {/* Answer buttons */}
                <div className="flex gap-3">
                  {(["yes", "partial", "no"] as const).map((answer) => (
                    <button
                      key={answer}
                      onClick={() => handleAnswer(answer)}
                      className={`flex-1 py-4 rounded-xl font-medium text-sm transition-all border-2 ${
                        answer === "yes"
                          ? "border-green-200 text-green-700 hover:bg-green-50 hover:border-green-400"
                          : answer === "partial"
                            ? "border-amber-200 text-amber-700 hover:bg-amber-50 hover:border-amber-400"
                            : "border-red-200 text-red-700 hover:bg-red-50 hover:border-red-400"
                      }`}
                    >
                      {answer === "yes" ? "Yes" : answer === "partial" ? "Partially" : "No"}
                    </button>
                  ))}
                </div>

                {/* Skip module option */}
                <div className="mt-6 text-center">
                  <button
                    onClick={() => {
                      if (currentModuleIdx < MODULE_ORDER.length - 1) {
                        setCurrentModuleIdx((i) => i + 1);
                        setCurrentQuestionIdx(0);
                      } else {
                        setIsComplete(true);
                      }
                    }}
                    className="text-xs text-gray-400 hover:text-gray-600"
                  >
                    Skip this module
                  </button>
                </div>
              </div>
            ) : isComplete ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-green-600 text-3xl">&#10003;</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Health Check Complete
                </h2>
                <p className="text-gray-500 mb-4">
                  Average maturity: {avgScore}/5 across {completedCount} modules
                </p>
                <div className="flex gap-3 justify-center">
                  <a
                    href="/onboarding"
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-700"
                  >
                    Get the Full Assessment
                  </a>
                  <a
                    href="/chat"
                    className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-50"
                  >
                    Ask AI-CDIO a Question
                  </a>
                </div>
                <p className="text-xs text-gray-400 mt-4">
                  The full assessment includes AI-powered scoring, multi-stakeholder alignment, and a detailed 90-day roadmap.
                </p>
              </div>
            ) : null}

            {/* Recent action cards (below questions) */}
            {results.length > 0 && (
              <div className="mt-6 space-y-3">
                <h3 className="text-sm font-semibold text-gray-700">
                  Your Action Cards ({results.filter((r) => r.actionCard).length})
                </h3>
                {[...results].reverse().filter((r) => r.actionCard).slice(0, 3).map((r) => (
                  <div
                    key={r.module}
                    className="bg-white rounded-xl border border-gray-200 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0 ${
                        r.score <= 1 ? "bg-red-500" : r.score === 2 ? "bg-amber-500" : "bg-green-500"
                      }`}>
                        {r.score}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-gray-900">
                          {r.actionCard!.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {r.actionCard!.why}
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          {r.actionCard!.impact}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Live Dashboard */}
          <div className="space-y-6">
            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                <p className="text-xs text-gray-500">Avg Maturity</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {avgScore}<span className="text-sm text-gray-400">/5</span>
                </p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                <p className="text-xs text-gray-500">Actions Found</p>
                <p className="text-2xl font-bold text-amber-600 mt-1">
                  {results.filter((r) => r.actionCard).length}
                </p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                <p className="text-xs text-gray-500">Modules Scanned</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  {completedCount}<span className="text-sm text-gray-400">/16</span>
                </p>
              </div>
            </div>

            {/* Spider Chart — fills in live */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">
                Technology Maturity Radar
              </h3>
              {spiderScores.length > 0 ? (
                <SpiderChart
                  scores={spiderScores}
                  title=""
                />
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-300 text-sm">
                  Answer questions to see your radar build...
                </div>
              )}
            </div>

            {/* Module score list */}
            {results.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Scores by Module
                </h3>
                <div className="space-y-2">
                  {results.map((r) => (
                    <div key={r.module} className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold ${
                        r.score <= 1 ? "bg-red-500" : r.score === 2 ? "bg-amber-500" : r.score === 3 ? "bg-blue-500" : "bg-green-500"
                      }`}>
                        {r.score}
                      </div>
                      <span className="text-sm text-gray-700 flex-1">
                        {MODULE_NAMES[r.module]}
                      </span>
                      <span className="text-xs text-gray-400">
                        Level {r.score}/5
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-4 text-xs text-gray-400">
        AI-powered advice — verify recommendations with qualified professionals before implementation.
      </div>
    </div>
  );
}
