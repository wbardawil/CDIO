import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ensurePractitioner } from "@/lib/auth/ensure-practitioner";
import { createServiceClient } from "@/lib/db/supabase";
import {
  computeInitiativeProgress,
  type Initiative,
  INITIATIVE_DOMAIN_LABEL,
  INITIATIVE_STATUS_LABEL,
} from "@/types/initiative";

export default async function InitiativesListPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const practitioner = await ensurePractitioner();
  if (!practitioner) redirect("/sign-in");

  const { orgId } = await params;
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

  const { data: initiatives } = await db
    .from("initiatives")
    .select("*")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });

  const items = (initiatives ?? []) as Initiative[];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm">
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
            <span className="font-semibold text-gray-900">Initiatives</span>
          </div>
          <Link
            href={`/clients/${org.id}/initiatives/new`}
            className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700"
          >
            + New initiative
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {items.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              No initiatives yet
            </h2>
            <p className="text-sm text-gray-500 mb-5">
              Capture the engagement work that needs tracking — Day 45 + Day 60
              of the 90-Day Commitment Matrix expect at least two initiatives
              launched.
            </p>
            <Link
              href={`/clients/${org.id}/initiatives/new`}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
            >
              + Capture your first initiative
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {items.map((it) => {
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
                <li key={it.id}>
                  <Link
                    href={`/clients/${org.id}/initiatives/${it.id}`}
                    className="block bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="min-w-0">
                        <p className="text-base font-semibold text-gray-900">
                          {it.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {INITIATIVE_DOMAIN_LABEL[it.domain]}
                          {it.module_number ? ` · M${it.module_number}` : ""}
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
                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-2 mb-3">
                      {it.goal}
                    </p>
                    {progress.total > 0 ? (
                      <div>
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                          <span>
                            {progress.done} of {progress.total} steps
                          </span>
                          <span>{progress.percent}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${progress.percent}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic">
                        No milestones captured yet
                      </p>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
