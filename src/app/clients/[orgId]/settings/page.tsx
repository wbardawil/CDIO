import { redirect, notFound } from "next/navigation";
import { ensurePractitioner } from "@/lib/auth/ensure-practitioner";
import { createServiceClient } from "@/lib/db/supabase";
import { WorkspaceShell } from "@/components/workspace-shell";
import { DeleteSandboxOrgButton } from "@/components/delete-sandbox-org-button";
import { SettingsForm, type OrgForSettings } from "./settings-form";
import { InvitationsPanel } from "./invitations-panel";

interface PageProps {
  params: Promise<{ orgId: string }>;
}

export default async function ClientSettingsPage({ params }: PageProps) {
  const { orgId } = await params;
  const practitioner = await ensurePractitioner();
  if (!practitioner) redirect("/sign-in");

  const db = createServiceClient();

  const { data: mapping } = await db
    .from("practitioner_clients")
    .select(
      `
      role,
      organizations:org_id (
        id, name, size_category, industry, employee_count,
        engagement_model, monthly_hours, is_sandbox, status
      )
    `
    )
    .eq("practitioner_id", practitioner.id)
    .eq("org_id", orgId)
    .maybeSingle();

  if (!mapping || !mapping.organizations) notFound();
  const org = mapping.organizations as unknown as OrgForSettings;
  const rawRole = (mapping.role as string) ?? "viewer";
  const role =
    rawRole === "owner"
      ? "strategic_approver"
      : (rawRole as
          | "strategic_approver"
          | "technical_reviewer"
          | "financial_approver"
          | "operator"
          | "collaborator"
          | "viewer");
  const isApprover = role === "strategic_approver";

  // Load invitations only for strategic approvers. Other roles don't even
  // see the list. Invitable roles widen with v24 (handoff §4 5-role model).
  let invitations: Array<{
    id: string;
    email: string;
    role:
      | "technical_reviewer"
      | "financial_approver"
      | "operator"
      | "collaborator"
      | "viewer";
    created_at: string;
    expires_at: string;
    accepted_at: string | null;
    revoked_at: string | null;
    clerk_invitation_id: string | null;
  }> = [];
  if (isApprover) {
    const { data } = await db
      .from("pending_invitations")
      .select("id, email, role, created_at, expires_at, accepted_at, revoked_at, clerk_invitation_id")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false });
    invitations = (data ?? []) as typeof invitations;
  }

  return (
    <WorkspaceShell
      orgId={orgId}
      orgName={org.name}
      where="Settings"
      clientLine="Edit profile, manage team access, archive, or hard-delete this client."
      activeSection="settings"
      isSandbox={org.is_sandbox}
      isArchived={org.status === "archived"}
      practitionerName={practitioner.name ?? practitioner.email ?? undefined}
      width="narrow"
    >
      {/* PROFILE + STATUS — interactive form in a client component */}
      <SettingsForm org={org} />

      {/* TEAM ACCESS — invite operators / reviewers / approvers (strategic_approver only) */}
      {isApprover && <InvitationsPanel orgId={orgId} invitations={invitations} />}

      {/* DANGER ZONE — destructive, brick-toned */}
      <section className="mt-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-brick mb-3">
          Danger zone
        </p>
        <div className="bg-raised border border-brick rounded-lg p-5">
          <h2 className="text-base font-semibold text-ink mb-1">
            Hard-delete client
          </h2>
          {org.is_sandbox ? (
            <>
              <p className="text-sm text-muted mb-4">
                Permanently wipe {org.name} and every dependent row in a
                single transaction. Cannot be undone. Sandbox-only — real
                engagements cannot be deleted via the UI.
              </p>
              <DeleteSandboxOrgButton orgId={org.id} orgName={org.name} />
            </>
          ) : (
            <p className="text-sm text-muted">
              Delete is disabled for real engagements. Use{" "}
              <span className="text-ink font-medium">Archive</span> above to
              hide this client without destroying the engagement history.
              {" "}
              Real-client cleanup is a manual operator action by design.
            </p>
          )}
        </div>
      </section>
    </WorkspaceShell>
  );
}
