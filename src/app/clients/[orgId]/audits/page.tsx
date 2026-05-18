import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ensurePractitioner } from "@/lib/auth/ensure-practitioner";
import { createServiceClient } from "@/lib/db/supabase";
import { WorkspaceShell } from "@/components/workspace-shell";
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
    .select("id, name, size_category, industry, is_sandbox")
    .eq("id", orgId)
    .single();
  if (!org) notFound();

  const { data: audits } = await db
    .from("audits")
    .select("*")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });

  const items = (audits ?? []) as Audit[];

  const SIZE_LABELS: Record<string, string> = {
    small: "Small",
    medium: "Medium",
    large: "Large",
  };
  const o = org as {
    id: string;
    name: string;
    size_category: string;
    industry: string;
    is_sandbox: boolean;
  };
  const clientLine = [
    SIZE_LABELS[o.size_category] ?? o.size_category,
    o.industry,
    items.length === 0
      ? "Next: run your first pre-purchase audit"
      : `${items.length} ${items.length === 1 ? "audit" : "audits"}`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <WorkspaceShell
      orgId={o.id}
      orgName={o.name}
      where="Audits"
      clientLine={clientLine}
      activeSection="audits"
      isSandbox={o.is_sandbox}
    >
      <div>
        {/* The one primary action on this screen. */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <h2 className="text-lg font-semibold text-ink">
            Pre-purchase audits
          </h2>
          <Link
            href={`/clients/${o.id}/audits/new`}
            className="inline-flex items-center px-4 py-2 bg-evergreen text-white text-sm font-semibold rounded-lg hover:bg-evergreen-deep"
          >
            + New audit
          </Link>
        </div>

        <div className="mb-6 px-4 py-3 bg-ink text-faint rounded-lg text-sm">
          <strong>Independent. Loyal only to you.</strong> This audit sits
          between you and a major technology purchase, before the check is
          signed. Not the vendor. Not the team that already wants it. Verdict:
          buy, don&apos;t buy, renegotiate, or hold — with the evidence and the
          money quantified. Zero vendor fees, ever.
        </div>

        {items.length === 0 ? (
          <div className="bg-raised rounded-xl border border-hair p-10 text-center">
            <h2 className="text-lg font-semibold text-ink mb-1">
              No audits yet
            </h2>
            <p className="text-sm text-muted mb-5">
              About to sign for an ERP, CRM, or any major system? Run it
              through an independent audit first. One decision, one verdict,
              board-ready.
            </p>
            <Link
              href={`/clients/${o.id}/audits/new`}
              className="inline-flex items-center px-4 py-2 bg-evergreen text-white text-sm font-medium rounded-lg hover:bg-evergreen-deep"
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
                    ? "bg-evergreen-soft text-evergreen border-evergreen"
                    : verdict === "dont_buy"
                      ? "bg-raised text-brick border-brick"
                      : verdict === "renegotiate"
                        ? "bg-amber-soft text-amber-deep border-amber"
                        : "bg-surface text-ink border-hair"
                  : a.status === "running"
                    ? "bg-evergreen-soft text-evergreen border-evergreen"
                    : a.status === "cancelled"
                      ? "bg-surface text-muted border-hair"
                      : "bg-amber-soft text-amber-deep border-amber";
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
                    href={`/clients/${o.id}/audits/${a.id}`}
                    className="block bg-raised rounded-xl border border-hair p-5 hover:border-hair"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="min-w-0">
                        <p className="text-base font-semibold text-ink">
                          {a.title}
                        </p>
                        <p className="text-xs text-muted mt-1">
                          {(a.intake.options?.length ?? 0)}{" "}
                          {(a.intake.options?.length ?? 0) === 1
                            ? "option"
                            : "options"}
                          {a.intake.options && a.intake.options.length > 0
                            ? ` · ${a.intake.options
                                .map((opt) => opt.label)
                                .filter(Boolean)
                                .join(" vs ")}`
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
                      <p className="text-sm font-semibold text-ink">
                        {a.output.headline_money}
                      </p>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </WorkspaceShell>
  );
}
