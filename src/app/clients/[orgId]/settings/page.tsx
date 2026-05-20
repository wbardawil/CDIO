import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ensurePractitioner } from "@/lib/auth/ensure-practitioner";
import { createServiceClient } from "@/lib/db/supabase";
import { DeleteSandboxOrgButton } from "@/components/delete-sandbox-org-button";
import { SettingsForm, type OrgForSettings } from "./settings-form";

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

  return (
    <div className="min-h-screen bg-paper">
      <main className="max-w-3xl mx-auto px-6 py-8">
        {/* Breadcrumb + header */}
        <div className="mb-6">
          <Link
            href={`/clients/${org.id}`}
            className="text-sm text-evergreen hover:text-evergreen-deep"
          >
            ← Back to {org.name}
          </Link>
          <h1 className="text-2xl font-bold text-ink mt-2">Settings</h1>
          <p className="text-sm text-muted mt-1">
            Edit profile, archive, or hard-delete this client.
          </p>
        </div>

        {/* PROFILE + STATUS — interactive form in a client component */}
        <SettingsForm org={org} />

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
      </main>
    </div>
  );
}
