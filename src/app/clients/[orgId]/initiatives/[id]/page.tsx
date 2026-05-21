import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ensurePractitioner } from "@/lib/auth/ensure-practitioner";
import { createServiceClient } from "@/lib/db/supabase";
import { ArchivedBanner } from "@/components/archived-banner";
import { MODULE_NAMES } from "@/types";
import {
  computeInitiativeProgress,
  type Initiative,
  INITIATIVE_DOMAIN_LABEL,
  INITIATIVE_STATUS_LABEL,
} from "@/types/initiative";
import { StepStatusButtons } from "./step-buttons";
import { ApprovalActions } from "@/components/approval-actions";

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
    .select("id, name, status")
    .eq("id", orgId)
    .single();
  if (!org) notFound();
  const isArchived = (org as { status?: string }).status === "archived";

  const { data: initiative } = await db
    .from("initiatives")
    .select("*")
    .eq("id", id)
    .eq("org_id", orgId)
    .single();
  if (!initiative) notFound();

  const it = initiative as Initiative & {
    approval_status: "draft" | "pending" | "approved" | "returned";
    submitted_by_practitioner_id: string | null;
  };
  const progress = computeInitiativeProgress(it.steps);

  const rawRole = (mapping.role as string) ?? "viewer";
  const role: "strategic_approver" | "technical_reviewer" | "financial_approver" | "operator" | "collaborator" | "viewer" =
    rawRole === "owner" ? "strategic_approver" : (rawRole as typeof role);
  const isApprover = role === "strategic_approver";
  const isAuthor = it.submitted_by_practitioner_id === practitioner.id;

  // Pull the latest 'returned' event so the operator sees the CDIO comment
  // inline. Only needed when the artifact is currently in 'returned' state.
  let latestReturnComment: string | null = null;
  if (it.approval_status === "returned") {
    const { data: lastReturn } = await db
      .from("approval_events")
      .select("payload")
      .eq("artifact_type", "initiative")
      .eq("artifact_id", it.id)
      .eq("event_type", "returned")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    const payload = (lastReturn?.payload as { comment?: string } | null) ?? null;
    latestReturnComment = payload?.comment ?? null;
  }

  const statusColor =
    it.status === "done"
      ? "bg-evergreen-soft text-evergreen border-evergreen"
      : it.status === "blocked"
        ? "bg-raised text-brick border-brick"
        : it.status === "cancelled"
          ? "bg-surface text-muted border-hair"
          : "bg-evergreen-soft text-evergreen border-evergreen";

  return (
    <div className="min-h-screen bg-paper">
      <header className="bg-raised border-b border-hair">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
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
              href={`/clients/${org.id}/initiatives`}
              className="text-muted hover:text-ink"
            >
              Initiatives
            </Link>
            <span className="text-faint">/</span>
            <span className="font-semibold text-ink truncate">
              {it.title}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {isArchived && <ArchivedBanner orgId={org.id} orgName={org.name} />}
        <div className="mb-6">
          <ApprovalActions
            artifactType="initiatives"
            artifactId={it.id}
            approvalStatus={it.approval_status}
            isOwner={isApprover}
            isAuthor={isAuthor}
            latestReturnComment={latestReturnComment}
          />
        </div>
        <div className="bg-raised rounded-xl border border-hair p-6 mb-6">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-ink">{it.title}</h1>
              <p className="text-xs text-muted mt-1">
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

          <p className="text-sm text-ink leading-relaxed">{it.goal}</p>

          {progress.total > 0 && (
            <div className="mt-5">
              <div className="flex items-center justify-between text-xs text-muted mb-1">
                <span>
                  {progress.done} of {progress.total} milestones complete
                </span>
                <span>{progress.percent}%</span>
              </div>
              <div className="h-2 bg-surface rounded-full overflow-hidden">
                <div
                  className="h-full bg-evergreen rounded-full"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <section className="bg-raised rounded-xl border border-hair overflow-hidden">
          <div className="px-5 py-4 border-b border-hair">
            <h2 className="text-sm font-semibold text-ink">Milestones</h2>
            <p className="text-xs text-muted mt-0.5">
              Click a status to update. Marking the last one Done flips the
              initiative to Done automatically.
            </p>
          </div>
          {it.steps.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-muted italic">
              No milestones captured for this initiative.
            </p>
          ) : (
            <ul className="divide-y divide-hair">
              {it.steps.map((s, idx) => (
                <li key={s.id} className="px-5 py-4">
                  <div className="flex items-start gap-3 mb-2">
                    <span className="shrink-0 inline-flex items-center justify-center w-7 h-7 bg-surface text-muted rounded text-xs font-bold mt-0.5">
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-ink">
                        {s.title}
                      </p>
                      {s.description && (
                        <p className="text-xs text-muted mt-1">
                          {s.description}
                        </p>
                      )}
                      <p className="text-[11px] text-muted mt-1">
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
          <section className="mt-6 bg-amber-soft border border-amber rounded-xl p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-deep mb-2">
              Practitioner notes (private)
            </p>
            <p className="text-sm text-amber-deep leading-relaxed whitespace-pre-wrap">
              {it.practitioner_notes}
            </p>
          </section>
        )}

        <p className="text-[11px] text-faint mt-6 leading-relaxed">
          Created {it.created_at.slice(0, 10)}{" "}
          {it.updated_at !== it.created_at
            ? `· Last updated ${it.updated_at.slice(0, 10)}`
            : ""}
        </p>
      </main>
    </div>
  );
}
