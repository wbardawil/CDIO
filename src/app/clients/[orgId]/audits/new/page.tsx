import { notFound, redirect } from "next/navigation";
import { ensurePractitioner } from "@/lib/auth/ensure-practitioner";
import { createServiceClient } from "@/lib/db/supabase";
import { WorkspaceShell } from "@/components/workspace-shell";
import { NewAuditForm } from "./form-client";
import { AuditProgress } from "../audit-progress";

export default async function NewAuditPage({
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
    .select("id, name, size_category, industry, is_sandbox, status")
    .eq("id", orgId)
    .single();
  if (!org) notFound();

  const o = org as {
    id: string;
    name: string;
    size_category: string;
    industry: string;
    is_sandbox: boolean;
    status: string;
  };
  const SIZE_LABELS: Record<string, string> = {
    small: "Small",
    medium: "Medium",
    large: "Large",
  };
  const clientLine = [
    SIZE_LABELS[o.size_category] ?? o.size_category,
    o.industry,
    "Next: frame the decision",
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <WorkspaceShell
      orgId={o.id}
      orgName={o.name}
      where="New audit"
      clientLine={clientLine}
      trail={[{ label: "Audits", href: `/clients/${o.id}/audits` }]}
      activeSection="audits"
      isSandbox={o.is_sandbox}
      isArchived={o.status === "archived"}
      width="narrow"
    >
      <div className="mb-6">
        <AuditProgress step={1} />
      </div>
      <h1 className="text-2xl font-bold text-ink mb-1">
        New pre-purchase audit
      </h1>
      <p className="text-sm text-muted mb-6">
        Give what you have. A blank field is not a blocker — it becomes the
        first finding. &quot;About to sign a major deal and can&apos;t
        articulate the strategy it serves&quot; is itself the audit&apos;s
        opening line. You can run with partial intake; missing inputs push the
        verdict to <strong>HOLD</strong> until resolved.
      </p>
      <NewAuditForm orgId={o.id} />
    </WorkspaceShell>
  );
}
