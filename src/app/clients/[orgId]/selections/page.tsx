import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ensurePractitioner } from "@/lib/auth/ensure-practitioner";
import { createServiceClient } from "@/lib/db/supabase";
import {
  type Selection,
  SELECTION_DOMAIN_LABEL,
  SELECTION_STATUS_LABEL,
} from "@/types/selection";

export default async function SelectionsListPage({
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

  const { data: selections } = await db
    .from("selections")
    .select("*")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });

  const items = (selections ?? []) as Selection[];

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
            <span className="font-semibold text-gray-900">Selections</span>
          </div>
          <Link
            href={`/clients/${org.id}/selections/new`}
            className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700"
          >
            + New selection
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-6 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-900">
          <strong>One engine, three domains.</strong> Tech vendor selection,
          AI build-vs-buy + vendor evaluation, and Partner / contractor
          selection all run through the same scoring engine — different
          default criteria sets, same artifact surface. AI uses the AMP 5x5
          Feasibility &times; Value template by default.
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              No selections yet
            </h2>
            <p className="text-sm text-gray-500 mb-5">
              Capture a tech / AI / partner decision the client is weighing.
              Score named alternatives. Produce a Decision Package they can
              defend at the board.
            </p>
            <Link
              href={`/clients/${org.id}/selections/new`}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
            >
              + Start your first selection
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {items.map((s) => {
              const statusColor =
                s.status === "decided"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : s.status === "recommended"
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : s.status === "cancelled"
                      ? "bg-gray-100 text-gray-600 border-gray-200"
                      : "bg-amber-50 text-amber-700 border-amber-200";
              return (
                <li key={s.id}>
                  <Link
                    href={`/clients/${org.id}/selections/${s.id}`}
                    className="block bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="min-w-0">
                        <p className="text-base font-semibold text-gray-900">
                          {s.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {SELECTION_DOMAIN_LABEL[s.domain]} ·{" "}
                          {s.candidates.length} candidates ·{" "}
                          {s.criteria.length} criteria
                        </p>
                      </div>
                      <span
                        className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${statusColor}`}
                      >
                        {SELECTION_STATUS_LABEL[s.status]}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                      {s.question}
                    </p>
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
