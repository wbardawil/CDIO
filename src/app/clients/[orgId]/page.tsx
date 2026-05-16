import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { ensurePractitioner } from "@/lib/auth/ensure-practitioner";
import { createServiceClient } from "@/lib/db/supabase";
import { MODULE_NAMES } from "@/types";
import { ResetAssessmentButton } from "@/components/reset-assessment-button";
import { DeleteSandboxOrgButton } from "@/components/delete-sandbox-org-button";
import { SandboxBanner } from "@/components/sandbox-banner";
import { StakeholderRowActions } from "@/components/stakeholder-row-actions";
import {
  ModuleInsightsPanel,
  type ScoredEntry,
} from "@/components/module-insights-panel";
import { CoverageWarningPanel } from "@/components/coverage-warning-panel";
import {
  DecisionPackagesPanel,
  type DecisionPackage,
} from "@/components/decision-packages-panel";
import { headers } from "next/headers";

interface PageProps {
  params: Promise<{ orgId: string }>;
}

const INDUSTRY_LABELS: Record<string, string> = {
  healthcare: "Healthcare",
  financial_services: "Financial Services",
  manufacturing: "Manufacturing",
  professional_services: "Professional Services",
  retail_ecommerce: "Retail / E-commerce",
  technology: "Technology",
  education: "Education",
  other: "Other",
};

type Tab = {
  key: string;
  label: string;
  status: "active" | "coming";
  comingWhen?: string;
};

const TABS: Tab[] = [
  { key: "overview", label: "Overview", status: "active" },
  { key: "assessment", label: "Assessment", status: "active" },
  { key: "roadmap", label: "Roadmap", status: "active" },
  { key: "deliverables", label: "Deliverables", status: "coming", comingWhen: "Week 2" },
  { key: "decisions", label: "Decisions", status: "coming", comingWhen: "Week 4" },
  { key: "value", label: "Value", status: "coming", comingWhen: "Week 6+" },
];

interface Stakeholder {
  id: string;
  name: string;
  email: string;
  role: string;
  influence_level: string | null;
  assessment_token: string | null;
  relevant_modules: number[] | null;
  completed_modules: number[];
}

export default async function ClientWorkspacePage({ params }: PageProps) {
  const { orgId } = await params;
  const practitioner = await ensurePractitioner();
  if (!practitioner) redirect("/sign-in");

  const db = createServiceClient();

  // Verify ownership and load org metadata in one query
  const { data: mapping } = await db
    .from("practitioner_clients")
    .select(`
      role,
      organizations:org_id (
        id, name, size_category, industry, employee_count,
        engagement_model, monthly_hours, active_modules, is_sandbox
      )
    `)
    .eq("practitioner_id", practitioner.id)
    .eq("org_id", orgId)
    .maybeSingle();

  if (!mapping || !mapping.organizations) notFound();
  const org = (mapping.organizations as unknown) as {
    id: string;
    name: string;
    size_category: string;
    industry: string;
    employee_count: number;
    engagement_model: string;
    monthly_hours: number;
    active_modules: number[];
    is_sandbox: boolean;
  };

  // Stakeholders + assessment + scores in parallel
  const [stakeholdersRes, latestAssessmentRes] = await Promise.all([
    db
      .from("stakeholders")
      .select("id, name, email, role, influence_level, assessment_token, relevant_modules")
      .eq("org_id", orgId)
      .order("created_at", { ascending: true }),
    db
      .from("assessments")
      .select("id, status, created_at")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const latestAssessment = latestAssessmentRes.data;

  // Per-stakeholder completion (only relevant if there's an assessment)
  let stakeholderRows: Stakeholder[] = (stakeholdersRes.data ?? []).map((s) => ({
    ...s,
    completed_modules: [] as number[],
  }));

  // Phase 1C Day 9: pull the full scores (including narrative + path) so
  // the workspace can render the Module Insights panel + the thin-coverage
  // warning. The legacy "completed_modules" array is derived from the same
  // fetch.
  let allScores: Array<{
    stakeholder_id: string;
    module_number: number;
    maturity_score: number | null;
    module_skipped: boolean;
    evidence: string;
    narrative: string | null;
    path_to_next_level: Array<{ action: string; source: string }>;
  }> = [];

  if (latestAssessment?.id && stakeholderRows.length > 0) {
    const { data: scores } = await db
      .from("module_scores")
      .select("stakeholder_id, module_number, maturity_score, module_skipped, evidence, narrative, path_to_next_level")
      .eq("assessment_id", latestAssessment.id);
    allScores = (scores ?? []).map((s) => ({
      stakeholder_id: s.stakeholder_id as string,
      module_number: s.module_number as number,
      maturity_score: (s.maturity_score as number | null) ?? null,
      module_skipped: Boolean(s.module_skipped),
      evidence: (s.evidence as string) ?? "",
      narrative: (s.narrative as string | null) ?? null,
      path_to_next_level: (s.path_to_next_level as Array<{ action: string; source: string }>) ?? [],
    }));

    const scoreMap = new Map<string, number[]>();
    for (const s of allScores) {
      const arr = scoreMap.get(s.stakeholder_id) ?? [];
      arr.push(s.module_number);
      scoreMap.set(s.stakeholder_id, arr);
    }
    stakeholderRows = stakeholderRows.map((s) => ({
      ...s,
      completed_modules: scoreMap.get(s.id) ?? [],
    }));
  }

  // Build the props for ModuleInsightsPanel — denormalize stakeholder
  // name/role onto each score entry so the component stays presentational.
  const stakeholderById = new Map(stakeholderRows.map((s) => [s.id, s]));
  const scoredEntries: ScoredEntry[] = allScores.map((s) => {
    const sh = stakeholderById.get(s.stakeholder_id);
    return {
      ...s,
      stakeholder_name: sh?.name ?? "Unknown",
      stakeholder_role: sh?.role ?? "",
    };
  });

  // Phase 1C Day 10: pull the Decision Packages from divergence_points so
  // the workspace surfaces them as hero artifacts. They're generated by
  // the synthesis route whenever stakeholder scores diverge by 2+ levels.
  let decisionPackages: DecisionPackage[] = [];
  if (latestAssessment?.id) {
    const { data: divs } = await db
      .from("divergence_points")
      .select(
        "id, module_number, score_gap, framework_recommendation, decision_package, resolution, resolved_at"
      )
      .eq("assessment_id", latestAssessment.id);
    decisionPackages = (divs ?? []).map((d) => ({
      id: d.id as string,
      module_number: d.module_number as number,
      score_gap: d.score_gap as number,
      framework_recommendation: (d.framework_recommendation as string) ?? "",
      decision_package: (d.decision_package as DecisionPackage["decision_package"]) ?? {},
      resolution: (d.resolution as string | null) ?? null,
      resolved_at: (d.resolved_at as string | null) ?? null,
    }));
  }

  // Build absolute origin so assessment links work when copied
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("host") ?? "localhost:3010";
  const origin = `${proto}://${host}`;

  const totalExpected = stakeholderRows.reduce(
    (sum, s) => sum + (s.relevant_modules?.length ?? 0),
    0
  );
  const totalCompleted = stakeholderRows.reduce(
    (sum, s) => sum + s.completed_modules.length,
    0
  );
  const completionPct = totalExpected > 0 ? Math.round((totalCompleted / totalExpected) * 100) : 0;
  const allDone = totalExpected > 0 && totalCompleted === totalExpected;

  // Engagement stage — drives the "Next step" panel
  type Stage = "no-stakeholders" | "awaiting-responses" | "ready-to-synthesize" | "synthesized" | "no-assessment";
  let stage: Stage = "no-assessment";
  if (!latestAssessment) stage = "no-assessment";
  else if (stakeholderRows.length === 0) stage = "no-stakeholders";
  else if (allDone) stage = "ready-to-synthesize";
  else stage = "awaiting-responses";

  const activeModules = org.active_modules ?? [];

  return (
    <div className="min-h-screen bg-gray-50">
      <SandboxBanner isSandbox={org.is_sandbox} variant="workspace" />
      {/* Top nav */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/clients" className="text-sm text-gray-500 hover:text-gray-700">
              ← Portfolio
            </Link>
            <span className="text-gray-300">/</span>
            <h1 className="text-base font-semibold text-gray-900">{org.name}</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href={`/clients/${org.id}/charter`}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Charter
            </Link>
            <Link
              href={`/clients/${org.id}/initiatives`}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Initiatives
            </Link>
            <Link
              href={`/clients/${org.id}/selections`}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Selections
            </Link>
            <Link
              href={`/clients/${org.id}/audits`}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Audits
            </Link>
            <Link
              href={`/clients/${org.id}/cadence`}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Cadence
            </Link>
            <span className="text-sm text-gray-600 hidden sm:inline">
              {practitioner.name ?? practitioner.email ?? "Practitioner"}
            </span>
            <UserButton />
          </div>
        </div>
      </header>

      {/* Org meta */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-baseline gap-3 flex-wrap">
            <h2 className="text-2xl font-bold text-gray-900">{org.name}</h2>
            <span className="text-sm text-gray-500">
              {INDUSTRY_LABELS[org.industry] ?? org.industry} · {org.employee_count} employees · {org.monthly_hours} hrs/mo
            </span>
          </div>
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 flex-wrap">
            <span>
              <span className="font-medium text-gray-700">{stakeholderRows.length}</span> stakeholders
            </span>
            <span className="text-gray-300">·</span>
            <span>
              Active modules: <span className="font-medium text-gray-700">{activeModules.length}</span> of 16
            </span>
            {latestAssessment && (
              <>
                <span className="text-gray-300">·</span>
                <span>
                  Assessment: <span className="font-medium text-gray-700">{latestAssessment.status}</span>
                  {totalExpected > 0 && (
                    <span className="ml-1">({totalCompleted}/{totalExpected} responses, {completionPct}%)</span>
                  )}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex gap-6 overflow-x-auto">
            {TABS.map((tab) => (
              <div
                key={tab.key}
                className={`py-4 text-sm font-medium border-b-2 whitespace-nowrap ${
                  tab.key === "overview"
                    ? "border-blue-600 text-blue-600"
                    : tab.status === "active"
                      ? "border-transparent text-gray-500 cursor-not-allowed"
                      : "border-transparent text-gray-300"
                }`}
              >
                {tab.label}
                {tab.status === "coming" && tab.comingWhen && (
                  <span className="ml-1.5 px-1.5 py-0.5 bg-gray-100 text-gray-400 rounded text-[10px] uppercase tracking-wider">
                    {tab.comingWhen}
                  </span>
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Next-step banner — state aware */}
        <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-5">
          {stage === "awaiting-responses" && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-semibold text-blue-900">Next step: collect stakeholder responses</h3>
                <span className="text-xs text-blue-600 font-medium">{completionPct}% complete</span>
              </div>
              <p className="text-sm text-blue-800 mb-3">
                Each stakeholder has a unique assessment link below. Send it to them and they will submit their responses on their own. When everyone&apos;s done, you&apos;ll synthesize them into a single picture.
              </p>
              <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${completionPct}%` }} />
              </div>
            </div>
          )}
          {stage === "ready-to-synthesize" && (
            <div>
              <h3 className="text-base font-semibold text-green-900 mb-2">All responses in — ready to synthesize</h3>
              <p className="text-sm text-green-800 mb-3">
                Every stakeholder has submitted. Run synthesis to compute consensus scores, detect divergences, and unlock the roadmap.
              </p>
              <Link
                href={`/dashboard?org=${org.id}`}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
              >
                Open dashboard to synthesize →
              </Link>
            </div>
          )}
          {stage === "no-stakeholders" && (
            <div>
              <h3 className="text-base font-semibold text-amber-900 mb-2">Add stakeholders to begin</h3>
              <p className="text-sm text-amber-800">
                The assessment exists but no one has been added yet. Re-run onboarding or add stakeholders directly in the database.
              </p>
            </div>
          )}
          {stage === "no-assessment" && (
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">No active assessment</h3>
              <p className="text-sm text-gray-600">
                Click &quot;Open full dashboard&quot; below to start one.
              </p>
            </div>
          )}
        </div>

        {/* Stakeholders panel — most useful action when assessment is in flight */}
        {stakeholderRows.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 mb-6">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">Stakeholders</h3>
              <Link
                href={`/dashboard?org=${org.id}`}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                Manage in full dashboard →
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {stakeholderRows.map((s) => {
                const total = s.relevant_modules?.length ?? 0;
                const done = s.completed_modules.length;
                const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                const status: "done" | "partial" | "not_started" =
                  total === 0 ? "not_started" : done === total ? "done" : done > 0 ? "partial" : "not_started";
                const link = s.assessment_token ? `${origin}/assess/${s.assessment_token}` : null;

                return (
                  <div key={s.id} className="px-6 py-4 flex items-start justify-between gap-4 flex-wrap">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{s.name}</p>
                      <p className="text-xs text-gray-500 truncate">
                        {s.role}
                        {s.influence_level && (
                          <span className="ml-1 text-gray-400">· {s.influence_level.replace("_", " ")}</span>
                        )}
                        <span className="ml-1">· {s.email}</span>
                      </p>
                    </div>
                    <StakeholderRowActions
                      stakeholder={{
                        id: s.id,
                        name: s.name,
                        email: s.email,
                        role: s.role,
                        influence_level: s.influence_level,
                        relevant_modules: s.relevant_modules ?? [],
                        assessment_token: s.assessment_token,
                        completed_modules: s.completed_modules,
                      }}
                      status={status}
                      pct={pct}
                      done={done}
                      total={total}
                      link={link}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Phase 1C Day 10 — Decision Packages (hero artifact) */}
        {decisionPackages.length > 0 && (
          <DecisionPackagesPanel decisionPackages={decisionPackages} />
        )}

        {/* Phase 1C Day 9 — coverage warning + module insights */}
        {scoredEntries.length > 0 && (
          <CoverageWarningPanel
            activeModules={activeModules}
            stakeholders={stakeholderRows.map((s) => ({
              id: s.id,
              name: s.name,
              role: s.role,
              relevant_modules: s.relevant_modules ?? [],
            }))}
            scores={allScores.map((s) => ({
              stakeholder_id: s.stakeholder_id,
              module_number: s.module_number,
              maturity_score: s.maturity_score,
              module_skipped: s.module_skipped,
            }))}
          />
        )}

        {scoredEntries.length > 0 && <ModuleInsightsPanel scores={scoredEntries} />}

        {/* Quiet secondary action — always available, never the hero */}
        <div className="flex items-center justify-between mt-2">
          <Link
            href={`/dashboard?org=${org.id}`}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Open full dashboard →
          </Link>
          {activeModules.length > 0 && (
            <p className="text-xs text-gray-400 text-right max-w-2xl">
              In scope: {activeModules.map((n) => MODULE_NAMES[n]).filter(Boolean).join(" · ")}
            </p>
          )}
        </div>

        {/* Sandbox-only tools — visible only on sandbox-flagged clients */}
        {org.is_sandbox && (
          <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 bg-amber-200 text-amber-900 rounded text-[10px] font-semibold uppercase tracking-wider">
                Sandbox
              </span>
              <h3 className="text-sm font-semibold text-amber-900">Sandbox tools</h3>
            </div>
            <p className="text-xs text-amber-800 mb-4">
              This client is flagged for testing. You can wipe assessment data, hard-delete the client, and
              re-run flows freely. These actions are blocked on real engagements at the API and database level.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-3">
              <ResetAssessmentButton orgId={org.id} orgName={org.name} />
              <DeleteSandboxOrgButton orgId={org.id} orgName={org.name} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
