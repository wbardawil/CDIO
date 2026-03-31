"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SpiderChart } from "@/components/charts/spider-chart";
import { PriorityMatrix } from "@/components/charts/priority-matrix";
import { DivergenceReport } from "@/components/charts/divergence-report";
import { MODULE_NAMES } from "@/types";
import type { AssessmentSynthesis, DivergencePoint, PriorityClass } from "@/types";

type Tab = "overview" | "stakeholders" | "divergences" | "roadmap";

interface StakeholderStatus {
  id: string;
  name: string;
  role: string;
  email: string;
  assessment_token: string;
  completed_modules: number[];
  total_modules: number;
}

interface DashboardData {
  org: { id: string; name: string; size_category: string; industry: string; employee_count: number };
  assessment: { id: string; status: string } | null;
  stakeholders: StakeholderStatus[];
  syntheses: AssessmentSynthesis[];
  divergences: any[];
  roadmap: any;
  completion: { total: number; completed: number; percentage: number };
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>}>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const orgId = searchParams.get("org");
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [synthesizing, setSynthesizing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!orgId) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`/api/dashboard/${orgId}`);
      if (!res.ok) throw new Error("Failed to load dashboard");
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSynthesize = async () => {
    if (!data?.assessment) return;
    setSynthesizing(true);
    try {
      const res = await fetch("/api/assessments/synthesize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          org_id: data.org.id,
          assessment_id: data.assessment.id,
        }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Synthesis failed");
      }
      await fetchData(); // Refresh
    } catch (err: any) {
      alert(err.message || "Synthesis failed");
    } finally {
      setSynthesizing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!orgId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl border border-gray-200 p-8 max-w-md text-center">
          <h2 className="text-xl font-semibold mb-2">No Organization Selected</h2>
          <p className="text-gray-500 mb-4">
            Start by onboarding your organization.
          </p>
          <a href="/onboarding" className="text-blue-600 hover:text-blue-800 font-medium">
            Go to Onboarding
          </a>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl border border-red-200 p-8 max-w-md text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600">{error || "Failed to load data"}</p>
        </div>
      </div>
    );
  }

  const hasSynthesis = data.syntheses.length > 0;
  const assessmentStatus = data.assessment?.status ?? "none";
  const allStakeholdersDone = data.stakeholders.every(
    (s) => s.completed_modules.length >= s.total_modules
  );

  // Map divergences to DivergencePoint format for the component
  const divergencePoints: DivergencePoint[] = (data.divergences ?? []).map((d: any) => ({
    module_number: d.module_number,
    module_name: MODULE_NAMES[d.module_number] ?? `Module ${d.module_number}`,
    stakeholder_a: d.decision_package?.stakeholder_a ?? { id: d.stakeholder_a_id, name: "Stakeholder A", score: 1, evidence: "" },
    stakeholder_b: d.decision_package?.stakeholder_b ?? { id: d.stakeholder_b_id, name: "Stakeholder B", score: 1, evidence: "" },
    score_gap: d.score_gap,
    framework_recommendation: d.framework_recommendation,
    projected_roi: d.decision_package?.projected_roi ?? "To be calculated",
  }));

  const spiderScores = data.syntheses.map((s: any) => ({
    module_number: s.module_number,
    score: Number(s.consensus_score),
  }));

  const matrixModules = data.syntheses.map((s: any) => ({
    module_number: s.module_number,
    consensus_score: Number(s.consensus_score),
    business_impact: Number(s.business_impact),
    priority_class: s.priority_class as PriorityClass,
  }));

  const avgMaturity = spiderScores.length > 0
    ? (spiderScores.reduce((a, b) => a + b.score, 0) / spiderScores.length).toFixed(1)
    : "—";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">AI-CDIO</h1>
            <p className="text-sm text-gray-500">{data.org.name} — {data.org.size_category} / {data.org.industry}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              assessmentStatus === "completed"
                ? "bg-green-100 text-green-700"
                : assessmentStatus === "in_progress"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-gray-100 text-gray-600"
            }`}>
              {assessmentStatus === "completed" ? "Assessment Complete" :
               assessmentStatus === "in_progress" ? "Assessment In Progress" :
               "Assessment Draft"}
            </span>
            {data.completion.total > 0 && (
              <span className="text-xs text-gray-400">
                {data.completion.percentage}% responses collected
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex gap-8">
            {([
              { key: "stakeholders" as Tab, label: "Team Progress" },
              { key: "overview" as Tab, label: "Maturity Overview" },
              { key: "divergences" as Tab, label: `Alignment (${divergencePoints.length})` },
              { key: "roadmap" as Tab, label: "90-Day Roadmap" },
            ]).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* Stakeholders Tab */}
        {activeTab === "stakeholders" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Stakeholder Assessment Progress</h2>
              {allStakeholdersDone && !hasSynthesis && (
                <button
                  onClick={handleSynthesize}
                  disabled={synthesizing}
                  className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
                >
                  {synthesizing ? "Synthesizing..." : "Run Synthesis"}
                </button>
              )}
              {data.completion.completed > 0 && !allStakeholdersDone && (
                <button
                  onClick={handleSynthesize}
                  disabled={synthesizing}
                  className="px-6 py-2 bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-600 disabled:bg-gray-300 transition-colors text-sm"
                >
                  {synthesizing ? "Synthesizing..." : "Synthesize (partial data)"}
                </button>
              )}
            </div>

            {data.stakeholders.map((s) => {
              const progress = s.total_modules > 0 ? (s.completed_modules.length / s.total_modules) * 100 : 0;
              const assessLink = `${typeof window !== "undefined" ? window.location.origin : ""}/assess/${s.assessment_token}`;

              return (
                <div key={s.id} className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium text-gray-900">{s.name}</p>
                      <p className="text-sm text-gray-500">{s.role} — {s.email}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      progress === 100
                        ? "bg-green-100 text-green-700"
                        : progress > 0
                          ? "bg-amber-100 text-amber-700"
                          : "bg-gray-100 text-gray-500"
                    }`}>
                      {progress === 100 ? "Complete" : progress > 0 ? `${Math.round(progress)}%` : "Not started"}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-400">
                      {s.completed_modules.length} of {s.total_modules} modules completed
                    </p>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(assessLink);
                        alert("Assessment link copied!");
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Copy assessment link
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {!hasSynthesis ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No Synthesis Yet</h3>
                <p className="text-gray-500 mb-4">
                  Collect stakeholder assessments, then run synthesis to see the maturity overview.
                </p>
                <button onClick={() => setActiveTab("stakeholders")} className="text-blue-600 hover:text-blue-800 font-medium">
                  View stakeholder progress
                </button>
              </div>
            ) : (
              <>
                {/* Summary cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <p className="text-sm text-gray-500">Average Maturity</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                      {avgMaturity}<span className="text-lg text-gray-400">/5</span>
                    </p>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <p className="text-sm text-gray-500">Top Priorities</p>
                    <p className="text-3xl font-bold text-red-600 mt-1">
                      {data.syntheses.filter((s: any) => s.priority_class === "top_priority").length}
                    </p>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <p className="text-sm text-gray-500">Divergences</p>
                    <p className="text-3xl font-bold text-amber-600 mt-1">
                      {divergencePoints.length}
                    </p>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <p className="text-sm text-gray-500">Quick Wins</p>
                    <p className="text-3xl font-bold text-green-600 mt-1">
                      {data.syntheses.filter((s: any) => s.priority_class === "quick_win").length}
                    </p>
                  </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <SpiderChart scores={spiderScores} title="Digital Maturity Radar" />
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <PriorityMatrix modules={matrixModules} />
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Divergences Tab */}
        {activeTab === "divergences" && (
          hasSynthesis ? (
            <DivergenceReport divergences={divergencePoints} />
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <p className="text-gray-500">Run synthesis first to see alignment analysis.</p>
            </div>
          )
        )}

        {/* Roadmap Tab */}
        {activeTab === "roadmap" && (
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <h2 className="text-xl font-semibold mb-4">90-Day Roadmap</h2>
            {data.roadmap ? (
              <div className="space-y-4">
                {data.roadmap.content?.executive_summary && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-blue-900 whitespace-pre-wrap">
                      {data.roadmap.content.executive_summary}
                    </p>
                  </div>
                )}
                {data.roadmap.content?.quick_wins?.map((qw: any, i: number) => (
                  <div key={i} className="border border-gray-100 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">Quick Win</span>
                      <h3 className="font-medium text-sm">{qw.title}</h3>
                    </div>
                    <p className="text-sm text-gray-600">{qw.description}</p>
                    {qw.expected_roi && <p className="text-xs text-green-600 mt-1">Expected ROI: {qw.expected_roi}</p>}
                  </div>
                ))}
                {data.roadmap.content?.strategic_initiatives?.map((si: any, i: number) => (
                  <div key={i} className="border border-gray-100 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-medium">Strategic</span>
                      <h3 className="font-medium text-sm">{si.title}</h3>
                    </div>
                    <p className="text-sm text-gray-600">{si.description}</p>
                    {si.expected_roi && <p className="text-xs text-green-600 mt-1">Expected ROI: {si.expected_roi}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">
                  {hasSynthesis
                    ? "Synthesis complete. Generate a roadmap based on the assessment results."
                    : "Complete the assessment and run synthesis first."}
                </p>
                {hasSynthesis && (
                  <button
                    onClick={async () => {
                      try {
                        const res = await fetch("/api/roadmaps", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            org_id: data.org.id,
                            assessment_id: data.assessment!.id,
                          }),
                        });
                        if (!res.ok) throw new Error("Failed to generate roadmap");
                        await fetchData();
                      } catch (err) {
                        alert("Roadmap generation failed. Check your Anthropic API key.");
                      }
                    }}
                    className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
                  >
                    Generate 90-Day Roadmap
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
