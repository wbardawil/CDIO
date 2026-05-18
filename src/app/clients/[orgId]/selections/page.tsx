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
    <div className="min-h-screen bg-paper">
      <header className="bg-raised border-b border-hair">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm">
            <Link href="/clients" className="text-muted hover:text-ink">
              Portfolio
            </Link>
            <span className="text-faint">/</span>
            <Link
              href={`/clients/${org.id}`}
              className="text-muted hover:text-ink"
            >
              {org.name}
            </Link>
            <span className="text-faint">/</span>
            <span className="font-semibold text-ink">Selections</span>
          </div>
          <Link
            href={`/clients/${org.id}/selections/new`}
            className="inline-flex items-center px-3 py-1.5 bg-evergreen text-white text-xs font-semibold rounded-lg hover:bg-evergreen-deep"
          >
            + New selection
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-6 px-4 py-3 bg-evergreen-soft border border-evergreen rounded-lg text-sm text-evergreen-deep">
          <strong>One engine, three domains.</strong> Tech vendor selection,
          AI build-vs-buy + vendor evaluation, and Partner / contractor
          selection all run through the same scoring engine — different
          default criteria sets, same artifact surface. AI uses the AMP 5x5
          Feasibility &times; Value template by default.
        </div>

        {items.length === 0 ? (
          <div className="bg-raised rounded-xl border border-hair p-10 text-center">
            <h2 className="text-lg font-semibold text-ink mb-1">
              No selections yet
            </h2>
            <p className="text-sm text-muted mb-5">
              Capture a tech / AI / partner decision the client is weighing.
              Score named alternatives. Produce a Decision Package they can
              defend at the board.
            </p>
            <Link
              href={`/clients/${org.id}/selections/new`}
              className="inline-flex items-center px-4 py-2 bg-evergreen text-white text-sm font-medium rounded-lg hover:bg-evergreen-deep"
            >
              + Start your first selection
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {items.map((s) => {
              const statusColor =
                s.status === "decided"
                  ? "bg-evergreen-soft text-evergreen border-evergreen"
                  : s.status === "recommended"
                    ? "bg-evergreen-soft text-evergreen border-evergreen"
                    : s.status === "cancelled"
                      ? "bg-surface text-muted border-hair"
                      : "bg-amber-soft text-amber-deep border-amber";
              return (
                <li key={s.id}>
                  <Link
                    href={`/clients/${org.id}/selections/${s.id}`}
                    className="block bg-raised rounded-xl border border-hair p-5 hover:border-hair"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="min-w-0">
                        <p className="text-base font-semibold text-ink">
                          {s.title}
                        </p>
                        <p className="text-xs text-muted mt-1">
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
                    <p className="text-sm text-muted leading-relaxed line-clamp-2">
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
