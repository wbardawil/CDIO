import { notFound, redirect } from "next/navigation";
import { ensurePractitioner } from "@/lib/auth/ensure-practitioner";
import { createServiceClient } from "@/lib/db/supabase";
import type { Audit } from "@/types/audit";
import { WorkspaceShell } from "@/components/workspace-shell";
import { ApprovalActions } from "@/components/approval-actions";
import { AuditDetailClient } from "./audit-client";

export default async function AuditDetailPage({
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
    .select("id, name, size_category, industry, is_sandbox, status")
    .eq("id", orgId)
    .single();
  if (!org) notFound();

  const { data: audit } = await db
    .from("audits")
    .select("*")
    .eq("id", id)
    .eq("org_id", orgId)
    .single();
  if (!audit) notFound();

  const o = org as {
    id: string;
    name: string;
    size_category: string;
    industry: string;
    is_sandbox: boolean;
    status: string;
  };
  const a = audit as Audit & {
    approval_status: "draft" | "pending" | "approved" | "returned" | "rejected";
    submitted_by_practitioner_id: string | null;
  };

  const rawRole = (mapping.role as string) ?? "viewer";
  const role = rawRole === "owner" ? "strategic_approver" : rawRole;
  const isApprover = role === "strategic_approver";
  const isAuthor = a.submitted_by_practitioner_id === practitioner.id;

  let latestReturnComment: string | null = null;
  if (a.approval_status === "returned") {
    const { data: lastReturn } = await db
      .from("approval_events")
      .select("payload")
      .eq("artifact_type", "audit")
      .eq("artifact_id", a.id)
      .eq("event_type", "returned")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    const payload = (lastReturn?.payload as { comment?: string } | null) ?? null;
    latestReturnComment = payload?.comment ?? null;
  }
  const SIZE_LABELS: Record<string, string> = {
    small: "Small",
    medium: "Medium",
    large: "Large",
  };
  // Premise-7 verdict gate. Extraction + grading quality is UNPROVEN on
  // real documents; until the practitioner validates it, a non-sandbox
  // (real client) org must never be shown an AI verdict. Server-side,
  // default-deny: the gate is CLOSED unless AUDIT_GATE_OPEN === "true".
  // Sandbox orgs always see the full verdict. Independent of the re-skin.
  const gateOpen = process.env.AUDIT_GATE_OPEN === "true";
  const hasVerdict = !!a.output;
  const verdictWithheld = hasVerdict && !o.is_sandbox && !gateOpen;

  const nextThing = verdictWithheld
    ? "Verdict pending validation"
    : a.status === "complete"
      ? "Verdict ready"
      : a.companion
        ? "Next: run the verdict"
        : "Next: prep the room";
  const clientLine = [
    SIZE_LABELS[o.size_category] ?? o.size_category,
    o.industry,
    nextThing,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <WorkspaceShell
      orgId={o.id}
      orgName={o.name}
      where={a.title}
      clientLine={clientLine}
      trail={[{ label: "Audits", href: `/clients/${o.id}/audits` }]}
      activeSection="audits"
      isSandbox={o.is_sandbox}
      isArchived={o.status === "archived"}
      width="narrow"
    >
      <div className="mb-6">
        <ApprovalActions
          artifactType="audits"
          artifactId={a.id}
          approvalStatus={a.approval_status}
          isOwner={isApprover}
          isAuthor={isAuthor}
          latestReturnComment={latestReturnComment}
        />
      </div>
      {verdictWithheld ? (
        <div className="bg-raised rounded-xl border border-hair p-6 sm:p-8">
          <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-evergreen mb-3">
            Verdict pending validation
          </p>
          <p className="font-serif text-2xl font-semibold text-ink leading-[1.15] mb-4">
            This audit has run, but the verdict is held until the
            methodology is validated for this client.
          </p>
          <div className="rounded-lg border border-evergreen bg-evergreen-soft p-4 text-sm text-evergreen-deep">
            Evidence extraction and grading quality have not yet been
            confirmed on real documents. To protect the decision, an
            AI-generated verdict is not shown for a live client until your
            practitioner has reviewed it. This is a deliberate safeguard,
            not an error — the audit and its inputs are saved and intact.
          </div>
          <p className="mt-4 text-xs text-muted">
            Sandbox clients show the full verdict for validation. Once the
            methodology is signed off, the verdict is released here.
          </p>
        </div>
      ) : (
        <AuditDetailClient orgId={o.id} initialAudit={a} />
      )}
    </WorkspaceShell>
  );
}
