import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ensurePractitioner } from "@/lib/auth/ensure-practitioner";
import { createServiceClient } from "@/lib/db/supabase";
import { MODULE_NAMES } from "@/types";
import {
  computeInitiativeProgress,
  type Initiative,
  INITIATIVE_DOMAIN_LABEL,
  INITIATIVE_STATUS_LABEL,
} from "@/types/initiative";
import { StepStatusButtons } from "./step-buttons";

export default async function InitiativeDetailPage({
  params,
}: {
  params: Promise<{ orgId: string; id: string }>;
}) {
  const practitioner = await ensurePractitioner();
  if (!practitioner) redirect("/sign-in");

  const { orgId, id } = await params;
  const db = createServiceClient();

  const { data: mapping } = await db
    .from("practitioner_clients")
    .select("role")
    .eq("practitioner_id", practitioner.id)
    .eq("org_id", orgId)
    .maybeSingle();
  if (!mapping) notFound();

  const { data: org } = await db
    .from("organizations")
    .select("id, name")
    .eq("id", orgId)
    .single();
  if (!org) notFound();

  const { data: initiative } = await db
    .from("initiatives")
    .select("*")
    .eq("id", id)
    .eq("org_id", orgId)
    .single();
  if (!initiative) notFound();

  const it = initiative as Initiative;
  const progress = computeInitiativeProgress(it.steps);

  const statusColor =
    it.status === "done"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : it.status === "blocked"
        ? "bg-red-50 text-red-700 border-red-200"
        : it.status === "cancelled"
          ? "bg-gray-100 text-gray-600 border-gray-200"
          : "bg-blue-50 text-blue-700 border-blue-200";

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm min-w-0">
            <Link href="/clients" className="text-gray-500 hover:text-gray-900">
              Portfolio
            </Link>
            <span className="text-gray-300">/</span>
            <Link
              href={`/clients/${org.id}`}
              className="text-gray-500 hover:text-gray-900"
            >
              {org.name}
            </Link>
            <span className="text-gray-300">/</span>
            <Link
              href={`/clients/${org.id}/initiatives`}
              className="text-gray-500 hover:text-gray-900"
            >
              Initiatives
            </Link>
            <span className="text-gray-300">/</span>
            <span className="font-semibold text-gray-900 truncate">
              {it.title}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-gray-900">{it.title}</h1>
              <p className="text-xs text-gray-500 mt-1">
                {INITIATIVE_DOMAIN_LABEL[it.domain]}
                {it.module_number
                  ? ` · M${it.module_number} · ${MODULE_NAMES[it.module_number] ?? ""}`
                  : ""}
                {it.owner_name ? ` · Owner: ${it.owner_name}` : ""}
                {it.target_completion_date
                  ? ` · Target ${it.target_completion_date}`
                  : ""}
              </p>
            </div>
            <span
              className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${statusColor}`}
            >
              {INITIATIVE_STATUS_LABEL[it.status]}
            </span>
          </div>

          <p className="text-sm text-gray-700 leading-relaxed">{it.goal}</p>

          {progress.total > 0 && (
            <div className="mt-5">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>
                  {progress.done} of {progress.total} milestones complete
                </span>
                <span>{progress.percent}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Milestones</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Click a status to update. Marking the last one Done flips the
              initiative to Done automatically.
            </p>
          </div>
          {it.steps.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-gray-500 italic">
              No milestones captured for this initiative.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {it.steps.map((s, idx) => (
                <li key={s.id} className="px-5 py-4">
                  <div className="flex items-start gap-3 mb-2">
                    <span className="shrink-0 inline-flex items-center justify-center w-7 h-7 bg-gray-100 text-gray-600 rounded text-xs font-bold mt-0.5">
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">
                        {s.title}
                      </p>
                      {s.description && (
                        <p className="text-xs text-gray-600 mt-1">
                          {s.description}
                        </p>
                      )}
                      <p className="text-[11px] text-gray-500 mt-1">
                        {s.assignee_name
                          ? `Assignee: ${s.assignee_name}`
                          : "No assignee"}
                        {s.due_date ? ` · Due ${s.due_date}` : ""}
                        {s.completed_at
                          ? ` · Completed ${s.completed_at.slice(0, 10)}`
                          : ""}
                      </p>
                    </div>
                  </div>
                  <StepStatusButtons
                    initiativeId={it.id}
                    stepId={s.id}
                    currentStatus={s.status}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>

        {it.practitioner_notes && (
          <section className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-800 mb-2">
              Practitioner notes (private)
            </p>
            <p className="text-sm text-amber-900 leading-relaxed whitespace-pre-wrap">
              {it.practitioner_notes}
            </p>
          </section>
        )}

        <p className="text-[11px] text-gray-400 mt-6 leading-relaxed">
          Created {it.created_at.slice(0, 10)}{" "}
          {it.updated_at !== it.created_at
            ? `· Last updated ${it.updated_at.slice(0, 10)}`
            : ""}
        </p>
      </main>
    </div>
  );
}
