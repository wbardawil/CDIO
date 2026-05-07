import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ensurePractitioner } from "@/lib/auth/ensure-practitioner";
import { createServiceClient } from "@/lib/db/supabase";
import {
  generateCharter,
  type CharterStakeholder,
  type CharterOrg,
} from "@/lib/charter/generate";
import { CharterPrintButton } from "./print-button";

const SIZE_LABEL: Record<string, string> = {
  small: "Small SMB",
  medium: "Mid-market",
  large: "Enterprise",
};

const INDUSTRY_LABEL: Record<string, string> = {
  healthcare: "Healthcare",
  financial_services: "Financial Services",
  manufacturing: "Manufacturing",
  professional_services: "Professional Services",
  retail_ecommerce: "Retail / E-commerce",
  technology: "Technology",
  education: "Education",
  other: "Cross-Industry",
};

const ENGAGEMENT_LABEL: Record<string, string> = {
  advisory: "Advisory",
  strategic: "Strategic",
  hybrid: "Hybrid",
  executive: "Executive",
};

export default async function CharterPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const practitioner = await ensurePractitioner();
  if (!practitioner) redirect("/sign-in");

  const { orgId } = await params;
  const db = createServiceClient();

  // Verify the practitioner owns this org.
  const { data: mapping } = await db
    .from("practitioner_clients")
    .select("role")
    .eq("practitioner_id", practitioner.id)
    .eq("org_id", orgId)
    .maybeSingle();
  if (!mapping) notFound();

  const { data: org } = await db
    .from("organizations")
    .select(
      "id, name, industry, size_category, employee_count, engagement_model, monthly_hours, active_modules"
    )
    .eq("id", orgId)
    .single();
  if (!org) notFound();

  const { data: stakeholders } = await db
    .from("stakeholders")
    .select("id, name, email, role, influence_level")
    .eq("org_id", orgId)
    .order("influence_level", { ascending: false })
    .order("name", { ascending: true });

  const charter = generateCharter(
    org as CharterOrg,
    (stakeholders ?? []) as CharterStakeholder[],
    { name: practitioner.name, email: practitioner.email }
  );

  const generatedDate = new Date(charter.generatedAt).toLocaleDateString(
    "en-US",
    { year: "numeric", month: "long", day: "numeric" }
  );

  return (
    <div className="min-h-screen bg-white print:bg-white">
      <main className="max-w-4xl mx-auto px-6 sm:px-10 py-10 print:py-6">
        {/* Top nav (hidden in print) */}
        <nav className="mb-6 print:hidden flex items-center justify-between">
          <Link
            href={`/clients/${orgId}`}
            className="text-sm text-gray-500 hover:text-gray-900"
          >
            &larr; {charter.client.name}
          </Link>
          <CharterPrintButton />
        </nav>

        {/* Header */}
        <header className="border-b border-gray-200 pb-6 mb-8 print:pb-4 print:mb-6">
          <p className="text-xs uppercase tracking-wide text-gray-500">
            Engagement Charter
          </p>
          <h1 className="text-3xl font-bold text-gray-900 mt-1">
            {charter.client.name}
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            {charter.practitioner.name} &middot;{" "}
            {ENGAGEMENT_LABEL[charter.engagement.model] ?? charter.engagement.model}{" "}
            tier &middot; {charter.engagement.monthlyHours} hours / month
            &middot; 90-day cycle &middot; Drafted {generatedDate}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
              {INDUSTRY_LABEL[charter.client.industry] ?? charter.client.industry}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
              {SIZE_LABEL[charter.client.sizeCategory] ?? charter.client.sizeCategory}{" "}
              &middot; {charter.client.employeeCount} employees
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
              {charter.modules.length} active modules
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              {charter.stakeholders.length} stakeholders
            </span>
          </div>
        </header>

        {/* Engagement Goal */}
        <section className="mb-10 print:mb-6">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
            Engagement Goal
          </h2>
          <p className="text-base text-gray-800 leading-relaxed">
            {charter.engagement.goal}
          </p>
        </section>

        {/* Active Modules */}
        <section className="mb-10 print:mb-6">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
            Active Modules
          </h2>
          <ul className="space-y-2">
            {charter.modules.map((m) => (
              <li
                key={m.number}
                className="border border-gray-200 rounded-lg px-4 py-2.5 flex items-start gap-3"
              >
                <span className="shrink-0 inline-flex items-center justify-center w-7 h-7 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold">
                  M{m.number}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900">
                    {m.name}
                  </p>
                  <p className="text-xs text-gray-500 italic mt-0.5">
                    &ldquo;{m.oneLiner}&rdquo;
                  </p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Anchor: <span className="font-medium">{m.framework}</span>
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Stakeholders */}
        <section className="mb-10 print:mb-6">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
            Stakeholders
          </h2>
          {charter.stakeholders.length === 0 ? (
            <p className="text-sm text-gray-500 italic">
              No stakeholders enrolled yet. Add stakeholders to{" "}
              <Link
                href={`/dashboard?org=${orgId}`}
                className="text-blue-700 underline"
              >
                {charter.client.name}&apos;s dashboard
              </Link>{" "}
              to populate this section.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100 border border-gray-200 rounded-lg">
              {charter.stakeholders.map((s) => (
                <li
                  key={s.id}
                  className="px-4 py-2.5 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900">
                      {s.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {s.role} &middot; {s.email}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      s.influence_level === "decision_maker"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : s.influence_level === "influencer"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "bg-gray-100 text-gray-600 border border-gray-200"
                    }`}
                  >
                    {s.influence_level === "decision_maker"
                      ? "Decision-maker"
                      : s.influence_level === "influencer"
                        ? "Influencer"
                        : "Contributor"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* 90-Day Commitment Matrix */}
        <section className="mb-10 print:mb-6">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
            90-Day Commitment Matrix
          </h2>
          <p className="text-xs text-gray-500 mb-4">
            Contractual milestones. Failure to deliver any milestone by its
            target date triggers a written exception report to Client within
            5 business days, with revised target date and root cause.
          </p>
          <ol className="space-y-3">
            {charter.commitmentMatrix.map((m) => (
              <li
                key={m.day}
                className="border border-gray-200 rounded-lg px-4 py-3 flex items-start gap-4"
              >
                <span className="shrink-0 inline-flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-lg text-sm font-bold">
                  D{m.day}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900">
                    {m.deliverable}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">{m.outcome}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Cadence */}
        <section className="mb-10 print:mb-6">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
            Cadence
          </h2>
          <ul className="space-y-2">
            {charter.cadence.map((c) => (
              <li
                key={c.rhythm}
                className="border border-gray-200 rounded-lg px-4 py-3"
              >
                <div className="flex items-center justify-between gap-3 mb-1">
                  <p className="text-sm font-semibold text-gray-900">
                    {c.forum}
                  </p>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200 uppercase">
                    {c.rhythm}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-1">{c.participants}</p>
                <p className="text-xs text-gray-700">{c.agenda}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Decision Rights */}
        <section className="mb-10 print:mb-6">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
            Decision Rights
          </h2>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Area
                  </th>
                  <th className="text-left px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Practitioner
                  </th>
                  <th className="text-left px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Client
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {charter.decisionRights.map((r) => (
                  <tr key={r.area}>
                    <td className="px-4 py-2 text-gray-900 font-medium align-top">
                      {r.area}
                    </td>
                    <td className="px-4 py-2 text-gray-700 align-top">
                      {r.practitioner}
                    </td>
                    <td className="px-4 py-2 text-gray-700 align-top">
                      {r.client}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* PM Covenant */}
        <section className="mb-10 print:mb-6">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
            Project Management Covenant
          </h2>
          <p className="text-sm text-gray-800 leading-relaxed">
            {charter.pmCovenant}
          </p>
        </section>

        {/* Confidentiality */}
        <section className="mb-10 print:mb-6">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
            Confidentiality &amp; Data Handling
          </h2>
          <p className="text-sm text-gray-800 leading-relaxed">
            {charter.confidentiality}
          </p>
        </section>

        {/* Signatures placeholder */}
        <section className="mb-10 print:mb-6 grid grid-cols-1 sm:grid-cols-2 gap-6 print:grid-cols-2">
          <div className="border-b border-gray-400 pb-12 sm:pb-16">
            <p className="text-[11px] uppercase tracking-wide text-gray-500">
              Client signature
            </p>
            <p className="text-sm text-gray-900 mt-1 font-semibold">
              {charter.client.name}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">Date:</p>
          </div>
          <div className="border-b border-gray-400 pb-12 sm:pb-16">
            <p className="text-[11px] uppercase tracking-wide text-gray-500">
              Practitioner signature
            </p>
            <p className="text-sm text-gray-900 mt-1 font-semibold">
              {charter.practitioner.name}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">Date:</p>
          </div>
        </section>

        <p className="text-[11px] text-gray-400 mt-10 print:mt-6 leading-relaxed">
          This charter is generated from live engagement data and the
          practitioner&apos;s configured PM Covenant + 90-Day Commitment
          Matrix. Pre-attorney-review template; final language passes review
          at Phase 2 Day 30. Refer to <Link href="/terms" className="underline">Terms</Link>,{" "}
          <Link href="/privacy" className="underline">Privacy Policy</Link>,
          and <Link href="/ai-disclaimer" className="underline">AI Disclaimer</Link>.
        </p>
      </main>
    </div>
  );
}
