import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ensurePractitioner } from "@/lib/auth/ensure-practitioner";
import { createServiceClient } from "@/lib/db/supabase";
import { ArchivedBanner } from "@/components/archived-banner";
import { ApprovalActions } from "@/components/approval-actions";
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
    .select("id, name, status")
    .eq("id", orgId)
    .single();
  if (!org) notFound();
  const isArchived = (org as { status?: string }).status === "archived";

  const { data: selection } = await db
    .from("selections")
    .select("*")
    .eq("id", id)
    .eq("org_id", orgId)
    .single();
  if (!selection) notFound();

  const s = selection as Selection & {
    approval_status: "draft" | "pending" | "approved" | "returned" | "rejected";
    submitted_by_practitioner_id: string | null;
  };

  const rawRole = (mapping.role as string) ?? "viewer";
  const role = rawRole === "owner" ? "strategic_approver" : rawRole;
  const isApprover = role === "strategic_approver";
  const isAuthor = s.submitted_by_practitioner_id === practitioner.id;

  // Latest 'returned' comment for inline display, mirroring the
  // initiative detail page pattern.
  let latestReturnComment: string | null = null;
  if (s.approval_status === "returned") {
    const { data: lastReturn } = await db
      .from("approval_events")
      .select("payload")
      .eq("artifact_type", "selection")
      .eq("artifact_id", s.id)
      .eq("event_type", "returned")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    const payload = (lastReturn?.payload as { comment?: string } | null) ?? null;
    latestReturnComment = payload?.comment ?? null;
  }

  return (
    <div className="min-h-screen bg-paper">
      <header className="bg-raised border-b border-hair">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm min-w-0">
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
            <Link
              href={`/clients/${org.id}/selections`}
              className="text-muted hover:text-ink"
            >
              Selections
            </Link>
            <span className="text-faint">/</span>
            <span className="font-semibold text-ink truncate">
              {s.title}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {isArchived && <ArchivedBanner orgId={org.id} orgName={org.name} />}
        <div className="mb-6">
          <ApprovalActions
            artifactType="selections"
            artifactId={s.id}
            approvalStatus={s.approval_status}
            isOwner={isApprover}
            isAuthor={isAuthor}
            latestReturnComment={latestReturnComment}
          />
        </div>
        <div className="bg-raised rounded-xl border border-hair p-5 mb-6">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-ink">{s.title}</h1>
              <p className="text-xs text-muted mt-1">
                {SELECTION_DOMAIN_LABEL[s.domain]} ·{" "}
                {SELECTION_STATUS_LABEL[s.status]}
                {s.decided_at ? ` · Decided ${s.decided_at.slice(0, 10)}` : ""}
              </p>
            </div>
          </div>
          <p className="text-sm text-ink leading-relaxed">{s.question}</p>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {(Object.keys(DIMENSION_LABEL) as Array<keyof typeof DIMENSION_LABEL>).map((d) => {
              const count = s.criteria.filter((c) => c.dimension === d).length;
              if (count === 0) return null;
              return (
                <div
                  key={d}
                  className="bg-paper border border-hair rounded-lg px-3 py-2"
                >
                  <p className="text-[10px] uppercase tracking-wide text-muted">
                    {DIMENSION_LABEL[d]}
                  </p>
                  <p className="text-sm font-semibold text-ink mt-0.5">
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
