import { notFound, redirect } from "next/navigation";
import { ensurePractitioner } from "@/lib/auth/ensure-practitioner";
import { createServiceClient } from "@/lib/db/supabase";
import type { Audit } from "@/types/audit";
import { WorkspaceShell } from "@/components/workspace-shell";
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
    .select("id, name, size_category, industry, is_sandbox")
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
  };
  const a = audit as Audit;
  const SIZE_LABELS: Record<string, string> = {
    small: "Small",
    medium: "Medium",
    large: "Large",
  };
  const nextThing =
    a.status === "complete"
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
      width="narrow"
    >
      <AuditDetailClient orgId={o.id} initialAudit={a} />
    </WorkspaceShell>
  );
}
