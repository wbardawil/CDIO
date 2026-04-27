import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { ensurePractitioner } from "@/lib/auth/ensure-practitioner";
import { createServiceClient } from "@/lib/db/supabase";
import { MODULE_NAMES } from "@/types";

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

  // Pull a few engagement signals so the header is informative without a full dashboard fetch
  const [{ count: stakeholderCount }, { data: latestAssessment }] = await Promise.all([
    db.from("stakeholders").select("id", { count: "exact", head: true }).eq("org_id", orgId),
    db.from("assessments")
      .select("id, status, created_at")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const activeModules = org.active_modules ?? [];
  const moduleNames = activeModules
    .slice(0, 4)
    .map((n) => MODULE_NAMES[n])
    .filter(Boolean);

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
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
            <span>
              <span className="font-medium text-gray-700">{stakeholderCount ?? 0}</span> stakeholders
            </span>
            <span className="text-gray-300">·</span>
            <span>
              Active modules: <span className="font-medium text-gray-700">{activeModules.length}</span> of 16
              {moduleNames.length > 0 && (
                <span className="text-gray-400 ml-1">
                  ({moduleNames.join(", ")}{activeModules.length > 4 ? ", …" : ""})
                </span>
              )}
            </span>
            {latestAssessment && (
              <>
                <span className="text-gray-300">·</span>
                <span>
                  Latest assessment: <span className="font-medium text-gray-700">{latestAssessment.status}</span>
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
        {/* Overview content */}
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
      </main>
    </div>
  );
}
