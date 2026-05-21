import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ensurePractitioner } from "@/lib/auth/ensure-practitioner";
import { createServiceClient } from "@/lib/db/supabase";
import { WorkspaceShell } from "@/components/workspace-shell";

// ============================================================
// /clients/[orgId]/inbox — operator + owner daily-entry surface (S1).
//
// Role-aware sections:
//   ALL ROLES:
//     - Pending your action: your draft + returned artifacts
//     - Awaiting approval: your pending submissions
//   OWNER (additional):
//     - Awaiting your approval: everyone's pending submissions
//     - Recently returned: your recent return-with-comments
//
// Utility-grade UI: server-rendered, no client-side state, links to the
// existing edit screens. Design polish comes in S2.
// ============================================================

const ARTIFACT_LABELS: Record<string, string> = {
  initiative: "Initiative",
  status_report: "Status Report",
  selection: "Selection",
  audit: "Audit",
};

const ARTIFACT_HREF: Record<string, (orgId: string, id: string) => string> = {
  initiative: (o, id) => `/clients/${o}/initiatives/${id}`,
  // status_reports currently live under /cadence (the status-reports panel)
  status_report: (o) => `/clients/${o}/cadence`,
  selection: (o, id) => `/clients/${o}/selections/${id}`,
  audit: (o, id) => `/clients/${o}/audits/${id}`,
};

interface ArtifactRow {
  id: string;
  org_id: string;
  title: string;
  approval_status: "draft" | "pending" | "approved" | "returned";
  submitted_by_practitioner_id: string | null;
  submitted_at: string | null;
  approved_at: string | null;
  updated_at: string | null;
  artifact_type: keyof typeof ARTIFACT_LABELS;
}

interface PageProps {
  params: Promise<{ orgId: string }>;
}

export default async function InboxPage({ params }: PageProps) {
  const { orgId } = await params;
  const practitioner = await ensurePractitioner();
  if (!practitioner) redirect("/sign-in");

  const db = createServiceClient();

  const { data: mapping } = await db
    .from("practitioner_clients")
    .select(`
      role,
      organizations:org_id (
        id, name, size_category, industry, is_sandbox, status
      )
    `)
    .eq("practitioner_id", practitioner.id)
    .eq("org_id", orgId)
    .maybeSingle();

  if (!mapping || !mapping.organizations) notFound();
  const org = (mapping.organizations as unknown) as {
    id: string;
    name: string;
    size_category: string;
    industry: string;
    is_sandbox: boolean;
    status: string;
  };
  const role = (mapping.role as "owner" | "collaborator" | "viewer" | "operator") ?? "viewer";
  const isOwner = role === "owner";

  // Fetch the 4 artifact tables in parallel. Title column differs across
  // tables (status_reports.title, selections.title, audits.title,
  // initiatives.title — all 'title' fortunately).
  const select = "id, org_id, title, approval_status, submitted_by_practitioner_id, submitted_at, approved_at, updated_at";

  const [initiativesRes, statusReportsRes, selectionsRes, auditsRes] =
    await Promise.all([
      db.from("initiatives").select(select).eq("org_id", orgId).neq("approval_status", "approved"),
      db.from("status_reports").select(select).eq("org_id", orgId).neq("approval_status", "approved"),
      db.from("selections").select(select).eq("org_id", orgId).neq("approval_status", "approved"),
      db.from("audits").select(select).eq("org_id", orgId).neq("approval_status", "approved"),
    ]);

  const merge = (
    rows: ArtifactRow[] | null | undefined,
    type: ArtifactRow["artifact_type"],
  ): ArtifactRow[] => (rows ?? []).map((r) => ({ ...r, artifact_type: type }));

  const all: ArtifactRow[] = [
    ...merge(initiativesRes.data as ArtifactRow[] | null, "initiative"),
    ...merge(statusReportsRes.data as ArtifactRow[] | null, "status_report"),
    ...merge(selectionsRes.data as ArtifactRow[] | null, "selection"),
    ...merge(auditsRes.data as ArtifactRow[] | null, "audit"),
  ];

  const mine = all.filter((a) => a.submitted_by_practitioner_id === practitioner.id);
  const pendingYourAction = mine.filter(
    (a) => a.approval_status === "draft" || a.approval_status === "returned",
  );
  const awaitingApproval = mine.filter((a) => a.approval_status === "pending");

  const othersPending = isOwner
    ? all.filter(
        (a) =>
          a.approval_status === "pending" &&
          a.submitted_by_practitioner_id !== practitioner.id,
      )
    : [];

  const roleLabel =
    role === "owner"
      ? "CDIO / owner"
      : role === "operator"
        ? "operator"
        : role === "collaborator"
          ? "collaborator"
          : "viewer";

  return (
    <WorkspaceShell
      orgId={orgId}
      orgName={org.name}
      where="Inbox"
      clientLine={`Your role: ${roleLabel}`}
      activeSection="inbox"
      isSandbox={org.is_sandbox}
      isArchived={org.status === "archived"}
      practitionerName={practitioner.name ?? practitioner.email ?? undefined}
      width="wide"
    >
      <div className="space-y-8">
        <Section
          title="Pending your action"
          empty="Nothing in your queue. You're caught up."
          help="Drafts you've started, plus any items returned to you with feedback."
          rows={pendingYourAction}
          orgId={orgId}
          variant="action"
        />

        <Section
          title="Awaiting approval"
          empty="No submissions waiting on the CDIO."
          help="Things you've submitted that the CDIO hasn't reviewed yet."
          rows={awaitingApproval}
          orgId={orgId}
          variant="waiting"
        />

        {isOwner && (
          <Section
            title="Awaiting your approval"
            empty="No submissions waiting on you."
            help="Submissions from the team that need your sign-off, edits, or feedback."
            rows={othersPending}
            orgId={orgId}
            variant="approval"
          />
        )}

        {pendingYourAction.length === 0 &&
          awaitingApproval.length === 0 &&
          othersPending.length === 0 && (
            <div className="rounded-lg border border-hair bg-raised p-6 text-sm text-muted">
              <p className="mb-2 font-medium text-ink">Welcome to your inbox.</p>
              <p>
                This is your daily-entry surface for{" "}
                <span className="font-medium text-ink">{org.name}</span>. As you
                draft initiatives, status reports, selections, and audits, they
                appear here grouped by whether the next action belongs to you or
                to the CDIO.
              </p>
              {!isOwner && (
                <p className="mt-2">
                  When you submit a draft, the CDIO reviews it, approves or
                  returns it with comments, and you continue from where they
                  left off. Their edits become your training material.
                </p>
              )}
            </div>
          )}
      </div>
    </WorkspaceShell>
  );
}

function Section({
  title,
  empty,
  help,
  rows,
  orgId,
  variant,
}: {
  title: string;
  empty: string;
  help: string;
  rows: ArtifactRow[];
  orgId: string;
  variant: "action" | "waiting" | "approval";
}) {
  const badge =
    variant === "action"
      ? "bg-amber-50 text-amber-900 border-amber-200"
      : variant === "approval"
        ? "bg-blue-50 text-blue-900 border-blue-200"
        : "bg-gray-50 text-gray-700 border-gray-200";

  return (
    <section>
      <div className="mb-2 flex items-baseline gap-3">
        <h2 className="font-serif text-xl font-semibold text-ink">{title}</h2>
        <span
          className={`rounded-full border px-2 py-0.5 text-xs ${badge}`}
        >
          {rows.length}
        </span>
      </div>
      <p className="mb-3 text-sm text-muted">{help}</p>

      {rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-hair bg-raised/40 px-4 py-3 text-sm text-muted">
          {empty}
        </p>
      ) : (
        <ul className="divide-y divide-hair rounded-lg border border-hair bg-raised">
          {rows.map((row) => {
            const href = ARTIFACT_HREF[row.artifact_type](orgId, row.id);
            const ts = row.submitted_at ?? row.updated_at;
            return (
              <li key={`${row.artifact_type}-${row.id}`}>
                <Link
                  href={href}
                  className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-paper/60"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs uppercase tracking-wide text-muted">
                        {ARTIFACT_LABELS[row.artifact_type]}
                      </span>
                      <span
                        className="rounded border border-hair bg-paper px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted"
                      >
                        {row.approval_status}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-sm font-medium text-ink">
                      {row.title}
                    </p>
                  </div>
                  {ts && (
                    <span className="shrink-0 text-xs text-muted">
                      {new Date(ts).toLocaleString()}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
