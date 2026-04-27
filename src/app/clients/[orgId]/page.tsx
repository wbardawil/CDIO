import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { ensurePractitioner } from "@/lib/auth/ensure-practitioner";
import { createServiceClient } from "@/lib/db/supabase";
import { MODULE_NAMES } from "@/types";
import { CopyLinkButton } from "@/components/copy-link-button";
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
        engagement_model, monthly_hours, active_modules
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
  };

  // Stakeholders + assessment + scores in parallel
  const [stakeholdersRes, latestAssessmentRes] = await Promise.all([
    db
      .from("stakeholders")
      .select("id, name, email, role, assessment_token, relevant_modules")
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

  if (latestAssessment?.id && stakeholderRows.length > 0) {
    const { data: scores } = await db
      .from("module_scores")
      .select("stakeholder_id, module_number")
      .eq("assessment_id", latestAssessment.id);
    const scoreMap = new Map<string, number[]>();
    for (const s of scores ?? []) {
      const arr = scoreMap.get(s.stakeholder_id) ?? [];
      arr.push(s.module_number);
      scoreMap.set(s.stakeholder_id, arr);
    }
    stakeholderRows = stakeholderRows.map((s) => ({
      ...s,
      completed_modules: scoreMap.get(s.id) ?? [],
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
                  <div key={s.id} className="px-6 py-4 flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{s.name}</p>
                      <p className="text-xs text-gray-500 truncate">{s.role} · {s.email}</p>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          status === "done"
                            ? "bg-green-100 text-green-700"
                            : status === "partial"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {status === "done"
                          ? "Submitted"
                          : status === "partial"
                            ? `${pct}% — ${done}/${total}`
                            : "Not started"}
                      </span>
                      {link && (
                        <CopyLinkButton link={link} label="Copy assessment link" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Bottom row: full dashboard + roadmap of features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-2">Engagement engines</h3>
            <p className="text-sm text-gray-500 mb-4">
              The full assessment, synthesis, and roadmap workflows live in the legacy dashboard. The new tabbed workspace ports them in over Weeks 2–6.
            </p>
            <Link
              href={`/dashboard?org=${org.id}`}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
            >
              Open full dashboard →
            </Link>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-3">Coming soon to this workspace</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 bg-gray-100 text-gray-400 rounded text-[10px] uppercase tracking-wider">Week 2</span>
                Status Report Generator (Engine #2)
              </li>
              <li className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 bg-gray-100 text-gray-400 rounded text-[10px] uppercase tracking-wider">Week 4</span>
                Decisions log + Decision Packages
              </li>
              <li className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 bg-gray-100 text-gray-400 rounded text-[10px] uppercase tracking-wider">Week 5</span>
                QBR Deck Generator
              </li>
              <li className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 bg-gray-100 text-gray-400 rounded text-[10px] uppercase tracking-wider">Week 6+</span>
                Value / ROI tracker
              </li>
              <li className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 bg-gray-100 text-gray-400 rounded text-[10px] uppercase tracking-wider">Week 8</span>
                MCP server — call engines from Claude.ai
              </li>
            </ul>
          </div>
        </div>

        {/* Module-in-scope footer */}
        {activeModules.length > 0 && (
          <p className="text-xs text-gray-500 mt-6">
            Modules in scope: {activeModules.map((n) => MODULE_NAMES[n]).filter(Boolean).join(" · ")}
          </p>
        )}
      </main>
    </div>
  );
}
