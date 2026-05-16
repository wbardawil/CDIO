import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ensurePractitioner } from "@/lib/auth/ensure-practitioner";
import { createServiceClient } from "@/lib/db/supabase";
import {
  type Audit,
  AUDIT_VERDICT_LABEL,
} from "@/types/audit";

export default async function AuditsListPage({
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

  const { data: audits } = await db
    .from("audits")
    .select("*")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });

  const items = (audits ?? []) as Audit[];

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
            <span className="font-semibold text-gray-900">
              Pre-Purchase Audits
            </span>
          </div>
          <Link
            href={`/clients/${org.id}/audits/new`}
            className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700"
          >
            + New audit
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-6 px-4 py-3 bg-slate-900 text-slate-100 rounded-lg text-sm">
          <strong>Independent. Loyal only to you.</strong> This audit sits
          between you and a major technology purchase, before the check is
          signed. Not the vendor. Not the team that already wants it. Verdict:
          buy, don&apos;t buy, renegotiate, or hold — with the evidence and the
          money quantified. Zero vendor fees, ever.
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              No audits yet
            </h2>
            <p className="text-sm text-gray-500 mb-5">
              About to sign for an ERP, CRM, or any major system? Run it
              through an independent audit first. One decision, one verdict,
              board-ready.
            </p>
            <Link
              href={`/clients/${org.id}/audits/new`}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
            >
              + Start your first audit
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {items.map((a) => {
              const verdict = a.output?.overall_call;
              const statusColor =
                a.status === "complete"
                  ? verdict === "buy"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : verdict === "dont_buy"
                      ? "bg-rose-50 text-rose-700 border-rose-200"
                      : verdict === "renegotiate"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-slate-100 text-slate-700 border-slate-200"
                  : a.status === "running"
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : a.status === "cancelled"
                      ? "bg-gray-100 text-gray-600 border-gray-200"
                      : "bg-amber-50 text-amber-700 border-amber-200";
              const statusLabel =
                a.status === "complete" && verdict
                  ? AUDIT_VERDICT_LABEL[verdict]
                  : a.status === "running"
                    ? "Running…"
                    : a.status === "ready"
                      ? "Ready to run"
                      : a.status === "cancelled"
                        ? "Cancelled"
                        : "Intake";
              return (
                <li key={a.id}>
                  <Link
                    href={`/clients/${org.id}/audits/${a.id}`}
                    className="block bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="min-w-0">
                        <p className="text-base font-semibold text-gray-900">
                          {a.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {a.intake.system_name || "—"}
                          {a.intake.vendor_name
                            ? ` · ${a.intake.vendor_name}`
                            : ""}
                          {a.intake.total_cost
                            ? ` · ${a.intake.total_cost}`
                            : ""}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${statusColor}`}
                      >
                        {statusLabel}
                      </span>
                    </div>
                    {a.output?.headline_money && (
                      <p className="text-sm font-semibold text-gray-900">
                        {a.output.headline_money}
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
