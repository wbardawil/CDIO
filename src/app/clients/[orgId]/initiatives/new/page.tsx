import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ensurePractitioner } from "@/lib/auth/ensure-practitioner";
import { createServiceClient } from "@/lib/db/supabase";
import { ArchivedBanner } from "@/components/archived-banner";
import { NewInitiativeForm } from "./form-client";

export default async function NewInitiativePage({
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
    .select("id, name, active_modules, status")
    .eq("id", orgId)
    .single();
  if (!org) notFound();

  return (
    <div className="min-h-screen bg-paper">
      <header className="bg-raised border-b border-hair">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-3 text-sm">
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
          <span className="font-semibold text-ink">New</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        {(org as { status?: string }).status === "archived" && (
          <ArchivedBanner orgId={org.id} orgName={org.name} />
        )}
        <h1 className="text-2xl font-bold text-ink mb-1">
          New initiative
        </h1>
        <p className="text-sm text-muted mb-6">
          Capture an outcome-driven piece of work for {org.name}. Start with the
          goal; add milestones as you sequence the work. Lean form first — a
          checklist beats a Gantt chart.
        </p>
        <NewInitiativeForm orgId={org.id} activeModules={org.active_modules ?? []} />
      </main>
    </div>
  );
}
