"use client";

import { useState, useCallback, useMemo } from "react";
import { SpiderChart } from "@/components/charts/spider-chart";
import { MODULE_NAMES, MODULE_META } from "@/types";
import { getQuickScanForModule } from "@/lib/playbook/quick-scan-questions";
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

// Modules carrying disproportionate risk if neglected — used to pick
// strategic risks for the board memo.
const HIGH_STAKES_MODULES = new Set([5, 12, 6, 4, 16]);

// Modules whose Quick Wins are most likely to be hard-savings recurring
// (AMP-style "counts toward margin") rather than soft-benefit narratives.
const HARD_SAVINGS_MODULES = new Set([12, 4, 13, 15]);

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
        // Public Quick Scan never lets users mark questions N/A, so the
        // null branch is unreachable here. Default to 1 if it ever happens.
        const score = result.maturity_score ?? 1;
        const actionCard = generateQuickAction(currentModule, score);

        setResults((prev) => [
          ...prev,
          {
            module: currentModule,
            score,
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
  const avgScoreNum = results.length > 0
    ? results.reduce((s, r) => s + r.score, 0) / results.length
    : 0;
  const avgScore = results.length > 0 ? avgScoreNum.toFixed(1) : "—";

  const memo = useMemo(() => buildBoardMemo(results, avgScoreNum), [
    results,
    avgScoreNum,
  ]);

  const handlePrint = useCallback(() => {
    if (typeof window !== "undefined") window.print();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header (hidden in print) */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 print:hidden">
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

      {/* Board memo (only when complete) — full width, print-friendly */}
      {isComplete && (
        <BoardMemo
          memo={memo}
          spiderScores={spiderScores}
          results={results}
          onPrint={handlePrint}
        />
      )}

      {/* Main content — split layout (hidden when complete) */}
      {!isComplete && (
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
      )}

      {/* Footer (hidden in print) */}
      <div className="text-center py-4 text-xs text-gray-400 print:hidden">
        AI-powered advice — verify recommendations with qualified professionals before implementation.
      </div>
    </div>
  );
}

// ============================================================
// Board Memo — board-quality output of the Quick Scan
// (Phase 1C Day 14-15 upgrade)
// ============================================================

interface QuickWin {
  module: number;
  moduleName: string;
  score: number;
  title: string;
  why: string;
  impact: string;
  framework: string;
  hardSavings: boolean;
}

interface StrategicRisk {
  module: number;
  moduleName: string;
  score: number;
  framework: string;
  reason: string;
}

interface Strength {
  module: number;
  moduleName: string;
  score: number;
  framework: string;
}

interface BoardMemoData {
  avg: number;
  tierLabel: string;
  tierBlurb: string;
  narrative: string;
  quickWins: QuickWin[];
  risks: StrategicRisk[];
  strengths: Strength[];
  scannedCount: number;
  date: string;
}

function buildBoardMemo(results: ModuleResult[], avg: number): BoardMemoData {
  const tierLabel =
    avg >= 4
      ? "Managed"
      : avg >= 3
        ? "Defined"
        : avg >= 2
          ? "Developing"
          : "Initial";

  const tierBlurb =
    avg >= 4
      ? "broadly mature with selective optimization opportunities"
      : avg >= 3
        ? "fundamentals in place, with several high-leverage gaps to close"
        : avg >= 2
          ? "early-stage maturity with material exposure in critical areas"
          : "foundational posture — the next 90 days establish basic disciplines";

  const sorted = [...results].sort((a, b) => a.score - b.score);

  const lowest = sorted[0];
  const highest = sorted[sorted.length - 1];

  // Quick wins: low-score modules with action cards, prefer high-stakes
  // and hard-savings modules first.
  const quickWinsRaw = results
    .filter((r) => r.actionCard !== null && r.score <= 3)
    .sort((a, b) => {
      const aHigh = HIGH_STAKES_MODULES.has(a.module) ? 1 : 0;
      const bHigh = HIGH_STAKES_MODULES.has(b.module) ? 1 : 0;
      if (aHigh !== bHigh) return bHigh - aHigh;
      return a.score - b.score;
    })
    .slice(0, 3);

  const quickWins: QuickWin[] = quickWinsRaw.map((r) => ({
    module: r.module,
    moduleName: MODULE_NAMES[r.module] ?? `Module ${r.module}`,
    score: r.score,
    title: r.actionCard!.title,
    why: r.actionCard!.why,
    impact: r.actionCard!.impact,
    framework: MODULE_META[r.module]?.framework ?? "—",
    hardSavings: HARD_SAVINGS_MODULES.has(r.module),
  }));

  // Strategic risks: low score on high-stakes modules.
  const risks: StrategicRisk[] = results
    .filter((r) => r.score <= 2 && HIGH_STAKES_MODULES.has(r.module))
    .sort((a, b) => a.score - b.score)
    .slice(0, 3)
    .map((r) => ({
      module: r.module,
      moduleName: MODULE_NAMES[r.module] ?? `Module ${r.module}`,
      score: r.score,
      framework: MODULE_META[r.module]?.framework ?? "—",
      reason:
        r.module === 5
          ? "Cyber gap on this scale is a board-reportable event the day a breach occurs."
          : r.module === 12
            ? "Tech-finance opacity at this level usually masks 20-30% recoverable spend and erodes board trust."
            : r.module === 6
              ? "Without a data foundation, AI investment becomes vendor theater — see Module 6."
              : r.module === 4
                ? "Cloud spend left ungoverned at this maturity grows ~30% per year."
                : r.module === 16
                  ? "Workforce-readiness this thin caps the ROI of every other tech investment."
                  : "High-stakes capability area performing below the safety threshold for the company's size.",
    }));

  // Strengths: highest-score modules.
  const strengths: Strength[] = [...results]
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .filter((r) => r.score >= 3)
    .map((r) => ({
      module: r.module,
      moduleName: MODULE_NAMES[r.module] ?? `Module ${r.module}`,
      score: r.score,
      framework: MODULE_META[r.module]?.framework ?? "—",
    }));

  // Narrative: 3-4 sentence executive summary.
  const strongestName =
    highest && highest.score >= 3
      ? MODULE_NAMES[highest.module] ?? `Module ${highest.module}`
      : null;
  const weakestName = lowest
    ? MODULE_NAMES[lowest.module] ?? `Module ${lowest.module}`
    : null;

  const narrative = [
    `Across ${results.length} dimensions of technology maturity, this organization sits at ${tierLabel} (Level ${avg.toFixed(1)} of 5) — ${tierBlurb}.`,
    strongestName
      ? `The strongest area is ${strongestName} (Level ${highest.score}); a credible baseline to leverage.`
      : "",
    weakestName
      ? `The most urgent gap is ${weakestName} (Level ${lowest.score}) — a high-leverage point for the next 90 days.`
      : "",
    quickWins.length > 0
      ? `Three named quick wins below carry projected hard-dollar or time-savings impact and can ship before the next board meeting.`
      : `No urgent gaps surface from this scan; the work is selective optimization rather than foundational repair.`,
  ]
    .filter(Boolean)
    .join(" ");

  return {
    avg,
    tierLabel,
    tierBlurb,
    narrative,
    quickWins,
    risks,
    strengths,
    scannedCount: results.length,
    date: new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  };
}

interface BoardMemoProps {
  memo: BoardMemoData;
  spiderScores: { module_number: number; score: number }[];
  results: ModuleResult[];
  onPrint: () => void;
}

function BoardMemo({ memo, spiderScores, results, onPrint }: BoardMemoProps) {
  return (
    <div className="bg-white print:bg-white">
      <main className="max-w-4xl mx-auto px-6 sm:px-10 py-10 print:py-6">
        {/* Memo header */}
        <header className="border-b border-gray-200 pb-6 mb-8 print:pb-4 print:mb-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Technology Maturity — Board Memo
              </p>
              <h1 className="text-3xl font-bold text-gray-900 mt-1">
                {memo.tierLabel} ·{" "}
                <span className="text-blue-700">
                  Level {memo.avg.toFixed(1)} / 5
                </span>
              </h1>
              <p className="text-sm text-gray-500 mt-2">
                AI-CDIO Quick Scan · {memo.scannedCount} of 16 dimensions ·{" "}
                {memo.date}
              </p>
            </div>
            <div className="flex gap-2 print:hidden">
              <button
                type="button"
                onClick={onPrint}
                className="px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Print / Save PDF
              </button>
              <a
                href="/onboarding"
                className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Book full assessment →
              </a>
            </div>
          </div>
        </header>

        {/* Executive summary */}
        <section className="mb-10 print:mb-8">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
            Executive Summary
          </h2>
          <p className="text-base text-gray-800 leading-relaxed">
            {memo.narrative}
          </p>
        </section>

        {/* Spider chart + score breakdown */}
        <section className="mb-10 print:mb-8 grid grid-cols-1 sm:grid-cols-5 gap-6 print:grid-cols-5">
          <div className="sm:col-span-3 print:col-span-3 bg-gray-50 border border-gray-200 rounded-xl p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
              Maturity Radar
            </h3>
            {spiderScores.length > 0 ? (
              <SpiderChart scores={spiderScores} title="" />
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-300 text-sm">
                No data
              </div>
            )}
          </div>
          <div className="sm:col-span-2 print:col-span-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
              By Dimension
            </h3>
            <ul className="space-y-1.5 text-sm">
              {[...results]
                .sort((a, b) => a.score - b.score)
                .map((r) => (
                  <li
                    key={r.module}
                    className="flex items-center gap-2 border-b border-gray-100 pb-1.5 last:border-0"
                  >
                    <span
                      className={`shrink-0 inline-flex items-center justify-center w-5 h-5 rounded text-white text-[10px] font-bold ${
                        r.score <= 1
                          ? "bg-red-500"
                          : r.score === 2
                            ? "bg-amber-500"
                            : r.score === 3
                              ? "bg-blue-500"
                              : "bg-emerald-500"
                      }`}
                    >
                      {r.score}
                    </span>
                    <span className="text-gray-700 flex-1 text-xs">
                      {MODULE_NAMES[r.module]}
                    </span>
                  </li>
                ))}
            </ul>
          </div>
        </section>

        {/* Quick wins */}
        {memo.quickWins.length > 0 && (
          <section className="mb-10 print:mb-8">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
              Three Named Quick Wins
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              Specific, lean-form-first actions to ship before the next board
              meeting. Each anchored to a recognized framework. Hard-savings
              candidates marked.
            </p>
            <ol className="space-y-4">
              {memo.quickWins.map((qw, i) => (
                <li
                  key={qw.module}
                  className="border border-gray-200 rounded-xl p-5 bg-white"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center justify-center w-7 h-7 bg-blue-600 text-white rounded-lg text-sm font-bold">
                        {i + 1}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {qw.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Module {qw.module} · {qw.moduleName} · current Level{" "}
                          {qw.score}
                        </p>
                      </div>
                    </div>
                    {qw.hardSavings && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                        Hard-savings candidate
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 mt-2">
                    <span className="font-semibold text-gray-900">Why: </span>
                    {qw.why}
                  </p>
                  <p className="text-sm text-emerald-700 mt-1">
                    <span className="font-semibold">Projected impact: </span>
                    {qw.impact}
                  </p>
                  <p className="text-xs text-gray-500 mt-3 italic">
                    Anchor: {qw.framework}
                  </p>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* Strategic risks */}
        {memo.risks.length > 0 && (
          <section className="mb-10 print:mb-8">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
              Strategic Risks
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              High-stakes capability areas performing below threshold for the
              company&apos;s size band. These warrant board attention regardless
              of competing priorities.
            </p>
            <ul className="space-y-3">
              {memo.risks.map((r) => (
                <li
                  key={r.module}
                  className="border-l-4 border-red-400 bg-red-50 rounded-r-lg p-4"
                >
                  <p className="text-sm font-semibold text-red-900">
                    {r.moduleName}{" "}
                    <span className="text-xs font-normal text-red-700">
                      Level {r.score}
                    </span>
                  </p>
                  <p className="text-sm text-red-800 mt-1">{r.reason}</p>
                  <p className="text-xs text-red-600 mt-1.5 italic">
                    Anchor: {r.framework}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Strengths */}
        {memo.strengths.length > 0 && (
          <section className="mb-10 print:mb-8">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
              Areas of Strength
            </h2>
            <ul className="space-y-2">
              {memo.strengths.map((s) => (
                <li
                  key={s.module}
                  className="flex items-center justify-between border border-emerald-200 bg-emerald-50 rounded-lg px-4 py-2.5"
                >
                  <div>
                    <p className="text-sm font-semibold text-emerald-900">
                      {s.moduleName}
                    </p>
                    <p className="text-xs text-emerald-700 italic">
                      Anchor: {s.framework}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-emerald-700">
                    Level {s.score}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* CTA */}
        <section className="mt-12 mb-6 border-t border-gray-200 pt-8 print:hidden">
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
            <h3 className="text-base font-semibold text-gray-900 mb-2">
              Ready to underwrite the next 90 days?
            </h3>
            <p className="text-sm text-gray-600 mb-4 max-w-2xl mx-auto">
              The full AI-CDIO assessment runs role-aware deep diagnostics
              across the same 16 dimensions, with framework-cited scoring,
              multi-stakeholder alignment, and a 90-day commitment matrix the
              board can hold the practitioner to.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <a
                href="/onboarding"
                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-700"
              >
                Book the full assessment
              </a>
              <a
                href="/chat"
                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-50"
              >
                Ask a question first
              </a>
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <p className="text-[11px] text-gray-400 text-center mt-8 leading-relaxed">
          Quick Scan output. Rule-based scoring on stakeholder responses; the
          full assessment runs AI-powered narrative + path-to-next-level
          recommendations across multiple stakeholders. Verify recommendations
          with qualified professionals before implementation.
        </p>
      </main>
    </div>
  );
}
