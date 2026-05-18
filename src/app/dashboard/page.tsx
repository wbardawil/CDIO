"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { SpiderChart } from "@/components/charts/spider-chart";
import { PriorityMatrix } from "@/components/charts/priority-matrix";
import { DivergenceReport } from "@/components/charts/divergence-report";
import { WorkspaceShell } from "@/components/workspace-shell";
import { MODULE_NAMES, ECONOMIC_OUTCOME_META } from "@/types";
import type { AssessmentSynthesis, DivergencePoint, PriorityClass, EconomicOutcome, Initiative } from "@/types";

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

const SIZE_LABELS: Record<string, string> = {
  small: "Small",
  medium: "Medium",
  large: "Large",
};

interface DashboardData {
  org: { id: string; name: string; size_category: string; industry: string; employee_count: number; is_sandbox?: boolean };
  assessment: { id: string; status: string } | null;
  stakeholders: StakeholderStatus[];
  syntheses: AssessmentSynthesis[];
  divergences: any[];
  roadmap: any;
  completion: { total: number; completed: number; percentage: number };
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-paper flex items-center justify-center"><div className="w-8 h-8 border-4 border-evergreen border-t-transparent rounded-full animate-spin" /></div>}>
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
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-evergreen border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!orgId) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="bg-raised rounded-xl border border-hair p-8 max-w-md text-center">
          <h2 className="text-xl font-semibold mb-2">No client selected</h2>
          <p className="text-muted mb-4">
            Open this from a client to see its dashboard.
          </p>
          <div className="flex items-center justify-center gap-4 text-sm font-medium">
            <Link href="/clients" className="text-evergreen hover:text-evergreen-deep">
              ‹ Your clients
            </Link>
            <Link href="/onboarding" className="text-muted hover:text-ink">
              Onboard a client
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="bg-raised rounded-xl border border-brick p-8 max-w-md text-center">
          <h2 className="text-xl font-semibold text-brick mb-2">
            Couldn&apos;t load this dashboard
          </h2>
          <p className="text-muted mb-4">{error || "Failed to load data"}</p>
          <Link
            href={orgId ? `/clients/${orgId}` : "/clients"}
            className="text-sm font-medium text-evergreen hover:text-evergreen-deep"
          >
            ‹ Back to the client
          </Link>
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

  // The one next thing for this client — plain, in the shell line.
  const nextThing = !hasSynthesis
    ? allStakeholdersDone
      ? "Next: run synthesis"
      : `Next: collect responses (${data.completion.percentage}%)`
    : !data.roadmap
      ? "Next: generate the 90-day roadmap"
      : "Synthesis & roadmap ready";

  const clientLine = [
    SIZE_LABELS[data.org.size_category] ?? data.org.size_category,
    data.org.industry,
    nextThing,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <WorkspaceShell
      orgId={data.org.id}
      orgName={data.org.name}
      where="Dashboard"
      clientLine={clientLine}
      activeSection="dashboard"
      isSandbox={data.org.is_sandbox}
    >
      {/* Dashboard sub-views + assessment status. The shell owns the
          client-level nav; this strip switches views within it. */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-hair">
        <nav className="flex gap-6 overflow-x-auto">
          {([
            { key: "stakeholders" as Tab, label: "Team progress" },
            { key: "overview" as Tab, label: "Maturity" },
            { key: "divergences" as Tab, label: `Alignment (${divergencePoints.length})` },
            { key: "roadmap" as Tab, label: "90-day roadmap" },
          ]).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? "border-evergreen text-evergreen"
                  : "border-transparent text-muted hover:text-ink"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-3 pb-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            assessmentStatus === "completed"
              ? "bg-evergreen-soft text-evergreen"
              : assessmentStatus === "in_progress"
                ? "bg-amber-soft text-amber-deep"
                : "bg-surface text-muted"
          }`}>
            {assessmentStatus === "completed" ? "Assessment complete" :
             assessmentStatus === "in_progress" ? "Assessment in progress" :
             "Assessment draft"}
          </span>
          {data.completion.total > 0 && (
            <span className="text-xs text-faint">
              {data.completion.percentage}% responses collected
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div>

        {/* Stakeholders Tab */}
        {activeTab === "stakeholders" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Stakeholder Assessment Progress</h2>
              {allStakeholdersDone && !hasSynthesis && (
                <button
                  onClick={handleSynthesize}
                  disabled={synthesizing}
                  className="px-6 py-2 bg-evergreen text-white font-medium rounded-lg hover:bg-evergreen-deep disabled:bg-hair transition-colors"
                >
                  {synthesizing ? "Synthesizing..." : "Run Synthesis"}
                </button>
              )}
              {data.completion.completed > 0 && !allStakeholdersDone && (
                <button
                  onClick={handleSynthesize}
                  disabled={synthesizing}
                  className="px-6 py-2 bg-amber text-white font-medium rounded-lg hover:bg-amber disabled:bg-hair transition-colors text-sm"
                >
                  {synthesizing ? "Synthesizing..." : "Synthesize (partial data)"}
                </button>
              )}
            </div>

            {data.stakeholders.map((s) => {
              const progress = s.total_modules > 0 ? (s.completed_modules.length / s.total_modules) * 100 : 0;
              const assessLink = `${typeof window !== "undefined" ? window.location.origin : ""}/assess/${s.assessment_token}`;

              return (
                <div key={s.id} className="bg-raised rounded-xl border border-hair p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium text-ink">{s.name}</p>
                      <p className="text-sm text-muted">{s.role} — {s.email}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      progress === 100
                        ? "bg-evergreen-soft text-evergreen"
                        : progress > 0
                          ? "bg-amber-soft text-amber-deep"
                          : "bg-surface text-muted"
                    }`}>
                      {progress === 100 ? "Complete" : progress > 0 ? `${Math.round(progress)}%` : "Not started"}
                    </span>
                  </div>
                  <div className="h-2 bg-surface rounded-full overflow-hidden mb-3">
                    <div
                      className="h-full bg-evergreen rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-faint">
                      {s.completed_modules.length} of {s.total_modules} modules completed
                    </p>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(assessLink);
                        alert("Assessment link copied!");
                      }}
                      className="text-xs text-evergreen hover:text-evergreen-deep font-medium"
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
              <div className="bg-raised rounded-xl border border-hair p-12 text-center">
                <h3 className="text-lg font-semibold text-ink mb-2">Nothing to show yet</h3>
                <p className="text-muted mb-4">
                  Collect the team&apos;s responses, then run synthesis to see where this organization stands.
                </p>
                <button onClick={() => setActiveTab("stakeholders")} className="text-evergreen hover:text-evergreen-deep font-medium">
                  See team progress
                </button>
              </div>
            ) : (
              <>
                {/* Law 3 + Law 5 — lead with the plain answer, not a
                    radar/matrix. The chart rigor is real but earned,
                    behind an explicit disclosure. */}
                {(() => {
                  const n = data.syntheses.length;
                  const topCount = data.syntheses.filter(
                    (s: any) => s.priority_class === "top_priority"
                  ).length;
                  const qwCount = data.syntheses.filter(
                    (s: any) => s.priority_class === "quick_win"
                  ).length;
                  const avg = Number(avgMaturity);
                  const tier = Number.isNaN(avg)
                    ? "not yet scored"
                    : avg < 1.5
                      ? "Initial"
                      : avg < 2.5
                        ? "Developing"
                        : avg < 3.5
                          ? "Defined"
                          : avg < 4.5
                            ? "Managed"
                            : "Optimizing";
                  return (
                    <div className="bg-raised rounded-xl border border-hair p-6">
                      <p className="text-lg text-ink leading-relaxed">
                        Across the {n} {n === 1 ? "area" : "areas"} assessed,
                        this organization is{" "}
                        <span className="font-bold">{tier}</span>
                        {!Number.isNaN(avg) && (
                          <span className="text-muted">
                            {" "}
                            ({avgMaturity} of 5)
                          </span>
                        )}
                        .{" "}
                        {topCount > 0 ? (
                          <>
                            <span className="font-semibold text-brick">
                              {topCount}
                            </span>{" "}
                            {topCount === 1 ? "area needs" : "areas need"}{" "}
                            attention now
                          </>
                        ) : (
                          <>No area is in the danger zone</>
                        )}
                        {qwCount > 0 && (
                          <>
                            , and{" "}
                            <span className="font-semibold text-evergreen">
                              {qwCount}
                            </span>{" "}
                            {qwCount === 1 ? "is a" : "are"} quick{" "}
                            {qwCount === 1 ? "win" : "wins"}
                          </>
                        )}
                        .
                        {divergencePoints.length > 0 && (
                          <>
                            {" "}
                            The team disagrees on{" "}
                            <button
                              onClick={() => setActiveTab("divergences")}
                              className="font-semibold text-amber-deep hover:text-amber-deep underline"
                            >
                              {divergencePoints.length}{" "}
                              {divergencePoints.length === 1
                                ? "point"
                                : "points"}
                            </button>{" "}
                            worth resolving.
                          </>
                        )}
                      </p>
                    </div>
                  );
                })()}

                {/* Summary cards — plain counts, still above the fold. */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-raised rounded-xl border border-hair p-5">
                    <p className="text-sm text-muted">Average maturity</p>
                    <p className="text-3xl font-bold text-ink mt-1">
                      {avgMaturity}<span className="text-lg text-faint"> of 5</span>
                    </p>
                  </div>
                  <div className="bg-raised rounded-xl border border-hair p-5">
                    <p className="text-sm text-muted">Need attention now</p>
                    <p className="text-3xl font-bold text-brick mt-1">
                      {data.syntheses.filter((s: any) => s.priority_class === "top_priority").length}
                    </p>
                  </div>
                  <div className="bg-raised rounded-xl border border-hair p-5">
                    <p className="text-sm text-muted">Team disagreements</p>
                    <p className="text-3xl font-bold text-amber-deep mt-1">
                      {divergencePoints.length}
                    </p>
                  </div>
                  <div className="bg-raised rounded-xl border border-hair p-5">
                    <p className="text-sm text-muted">Quick wins</p>
                    <p className="text-3xl font-bold text-evergreen mt-1">
                      {data.syntheses.filter((s: any) => s.priority_class === "quick_win").length}
                    </p>
                  </div>
                </div>

                {/* The radar + priority matrix — real rigor, behind an
                    explicit disclosure (Law 3: never the first thing). */}
                <details className="group bg-raised rounded-xl border border-hair">
                  <summary className="flex items-center justify-between gap-3 px-6 py-4 cursor-pointer text-sm font-semibold text-ink list-none">
                    <span>Show the full analysis</span>
                    <span className="text-faint font-normal">
                      maturity radar · priority matrix
                    </span>
                  </summary>
                  <div className="px-6 pb-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="border border-hair rounded-lg p-6">
                      <SpiderChart scores={spiderScores} title="Maturity radar" />
                    </div>
                    <div className="border border-hair rounded-lg p-6">
                      <PriorityMatrix modules={matrixModules} />
                    </div>
                  </div>
                </details>
              </>
            )}
          </div>
        )}

        {/* Divergences Tab */}
        {activeTab === "divergences" && (
          hasSynthesis ? (
            <DivergenceReport divergences={divergencePoints} />
          ) : (
            <div className="bg-raised rounded-xl border border-hair p-12 text-center">
              <p className="text-muted">Run synthesis first to see alignment analysis.</p>
            </div>
          )
        )}

        {/* Roadmap Tab */}
        {activeTab === "roadmap" && (
          <div className="bg-raised rounded-xl border border-hair p-8">
            <h2 className="text-xl font-semibold mb-4">90-Day Roadmap</h2>
            {data.roadmap ? (
              <div className="space-y-4">
                {data.roadmap.content?.executive_summary && (
                  <div className="bg-evergreen-soft border border-evergreen rounded-lg p-4 mb-6">
                    <p className="text-sm text-evergreen-deep whitespace-pre-wrap">
                      {data.roadmap.content.executive_summary}
                    </p>
                  </div>
                )}
                <RoadmapByOutcome
                  quickWins={data.roadmap.content?.quick_wins ?? []}
                  strategic={data.roadmap.content?.strategic_initiatives ?? []}
                />
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted mb-4">
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
                    className="px-6 py-2 bg-evergreen text-white font-medium rounded-lg hover:bg-evergreen-deep"
                  >
                    Generate 90-Day Roadmap
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </WorkspaceShell>
  );
}

// ============================================================
// Roadmap rendering — grouped by economic outcome
//
// CEOs buy outcomes, not modules. The five buckets — make money,
// save money, save time, preserve money, preserve time — are how
// the result lands. Quick-win-vs-strategic is internal scoring.
//
// Falls back to a legacy flat view when the persisted roadmap
// pre-dates the outcome reframe (no `outcome` tag on initiatives).
// ============================================================

const OUTCOME_ORDER: EconomicOutcome[] = ["make_money", "save_money", "save_time", "preserve_money", "preserve_time"];

const OUTCOME_PALETTE: Record<EconomicOutcome, { chip: string; ring: string }> = {
  make_money:     { chip: "bg-evergreen-soft text-evergreen-deep", ring: "border-evergreen" },
  save_money:     { chip: "bg-evergreen-soft text-evergreen-deep",       ring: "border-evergreen" },
  save_time:      { chip: "bg-evergreen-soft text-evergreen-deep",   ring: "border-evergreen" },
  preserve_money: { chip: "bg-amber-soft text-amber-deep",     ring: "border-amber" },
  preserve_time:  { chip: "bg-raised text-brick",       ring: "border-brick" },
};

type InitiativeWithBucket = Initiative & { _bucket: "quick_win" | "strategic" };

function RoadmapByOutcome({
  quickWins,
  strategic,
}: {
  quickWins: Initiative[];
  strategic: Initiative[];
}) {
  const all: InitiativeWithBucket[] = [
    ...quickWins.map((i) => ({ ...i, _bucket: "quick_win" as const })),
    ...strategic.map((i) => ({ ...i, _bucket: "strategic" as const })),
  ];

  // Backward compatibility: if NO initiatives have `outcome`, fall back to
  // the legacy flat view so old persisted roadmaps still render.
  const anyTagged = all.some((i) => i.outcome);
  if (!anyTagged) {
    return <LegacyFlatRoadmap quickWins={quickWins} strategic={strategic} />;
  }

  const grouped: Record<EconomicOutcome, InitiativeWithBucket[]> = {
    make_money: [],
    save_money: [],
    save_time: [],
    preserve_money: [],
    preserve_time: [],
  };
  const untagged: InitiativeWithBucket[] = [];
  for (const i of all) {
    if (i.outcome) grouped[i.outcome].push(i);
    else untagged.push(i);
  }

  return (
    <div className="space-y-8">
      {OUTCOME_ORDER.map((outcome) => {
        const items = grouped[outcome];
        if (items.length === 0) return null;
        const meta = ECONOMIC_OUTCOME_META[outcome];
        const palette = OUTCOME_PALETTE[outcome];
        return (
          <section key={outcome}>
            <header className="mb-3">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wide ${palette.chip}`}>
                  {meta.label}
                </span>
                <span className="text-xs text-muted">{items.length} {items.length === 1 ? "play" : "plays"}</span>
              </div>
            </header>
            <div className="space-y-3">
              {items.map((i, idx) => (
                <InitiativeCard key={i.id ?? `${outcome}-${idx}`} initiative={i} palette={palette} />
              ))}
            </div>
          </section>
        );
      })}
      {untagged.length > 0 && (
        <section>
          <header className="mb-3">
            <span className="px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wide bg-surface text-ink">Other</span>
          </header>
          <div className="space-y-3">
            {untagged.map((i, idx) => (
              <InitiativeCard key={i.id ?? `untagged-${idx}`} initiative={i} palette={{ chip: "bg-surface text-ink", ring: "border-hair" }} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function InitiativeCard({
  initiative,
  palette,
}: {
  initiative: InitiativeWithBucket;
  palette: { chip: string; ring: string };
}) {
  return (
    <div className={`border rounded-lg p-4 ${palette.ring}`}>
      <div className="flex items-start justify-between gap-3 mb-1">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${initiative._bucket === "quick_win" ? "bg-evergreen-soft text-evergreen" : "bg-amber-soft text-amber-deep"}`}>
            {initiative._bucket === "quick_win" ? "Quick Win" : "Strategic"}
          </span>
          <h3 className="font-medium text-sm">{initiative.title}</h3>
        </div>
        {initiative.dollar_anchor && (
          <span className="shrink-0 px-2 py-0.5 rounded text-xs font-semibold bg-evergreen-soft text-evergreen">
            {initiative.dollar_anchor}
          </span>
        )}
      </div>
      <p className="text-sm text-muted mb-2">{initiative.description}</p>
      {initiative.expected_roi && !initiative.dollar_anchor && (
        <p className="text-xs text-evergreen">Expected ROI: {initiative.expected_roi}</p>
      )}
      {initiative.proof && (
        <div className="mt-3 pt-3 border-t border-hair grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          <ProofCell label="Better"  value={initiative.proof.better} />
          <ProofCell label="Cheaper" value={initiative.proof.cheaper} />
          <ProofCell label="Faster"  value={initiative.proof.faster} />
        </div>
      )}
    </div>
  );
}

function ProofCell({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-muted font-semibold">{label}</div>
      <div className="text-ink">{value}</div>
    </div>
  );
}

function LegacyFlatRoadmap({ quickWins, strategic }: { quickWins: Initiative[]; strategic: Initiative[] }) {
  return (
    <>
      {quickWins.map((qw, i) => (
        <div key={`qw-${i}`} className="border border-hair rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 bg-evergreen-soft text-evergreen rounded text-xs font-medium">Quick Win</span>
            <h3 className="font-medium text-sm">{qw.title}</h3>
          </div>
          <p className="text-sm text-muted">{qw.description}</p>
          {qw.expected_roi && <p className="text-xs text-evergreen mt-1">Expected ROI: {qw.expected_roi}</p>}
        </div>
      ))}
      {strategic.map((si, i) => (
        <div key={`si-${i}`} className="border border-hair rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 bg-amber-soft text-amber-deep rounded text-xs font-medium">Strategic</span>
            <h3 className="font-medium text-sm">{si.title}</h3>
          </div>
          <p className="text-sm text-muted">{si.description}</p>
          {si.expected_roi && <p className="text-xs text-evergreen mt-1">Expected ROI: {si.expected_roi}</p>}
        </div>
      ))}
    </>
  );
}
