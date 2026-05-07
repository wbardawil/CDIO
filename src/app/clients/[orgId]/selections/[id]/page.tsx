import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ensurePractitioner } from "@/lib/auth/ensure-practitioner";
import { createServiceClient } from "@/lib/db/supabase";
import {
  type Selection,
  SELECTION_DOMAIN_LABEL,
  SELECTION_STATUS_LABEL,
  DIMENSION_LABEL,
} from "@/types/selection";
import { SelectionEditor } from "./editor-client";

export default async function SelectionDetailPage({
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

  const { data: selection } = await db
    .from("selections")
    .select("*")
    .eq("id", id)
    .eq("org_id", orgId)
    .single();
  if (!selection) notFound();

  const s = selection as Selection;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
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
              href={`/clients/${org.id}/selections`}
              className="text-gray-500 hover:text-gray-900"
            >
              Selections
            </Link>
            <span className="text-gray-300">/</span>
            <span className="font-semibold text-gray-900 truncate">
              {s.title}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-gray-900">{s.title}</h1>
              <p className="text-xs text-gray-500 mt-1">
                {SELECTION_DOMAIN_LABEL[s.domain]} ·{" "}
                {SELECTION_STATUS_LABEL[s.status]}
                {s.decided_at ? ` · Decided ${s.decided_at.slice(0, 10)}` : ""}
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">{s.question}</p>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {(Object.keys(DIMENSION_LABEL) as Array<keyof typeof DIMENSION_LABEL>).map((d) => {
              const count = s.criteria.filter((c) => c.dimension === d).length;
              if (count === 0) return null;
              return (
                <div
                  key={d}
                  className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2"
                >
                  <p className="text-[10px] uppercase tracking-wide text-gray-500">
                    {DIMENSION_LABEL[d]}
                  </p>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">
                    {count} criteria
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <SelectionEditor initialSelection={s} />
      </main>
    </div>
  );
}
