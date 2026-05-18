import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ensurePractitioner } from "@/lib/auth/ensure-practitioner";
import { createServiceClient } from "@/lib/db/supabase";
import type { StatusReport, CadenceToken } from "@/types/cadence";
import { CadenceClient } from "./cadence-client";

export default async function CadenceManagerPage({
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
    .select("id, name")
    .eq("id", orgId)
    .single();
  if (!org) notFound();

  const { data: reports } = await db
    .from("status_reports")
    .select("*")
    .eq("org_id", orgId)
    .order("period_end", { ascending: false });

  const { data: tokens } = await db
    .from("cadence_tokens")
    .select("*")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-paper">
      <header className="bg-raised border-b border-hair">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm">
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
            <span className="font-semibold text-ink">Cadence</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-6 px-4 py-3 bg-evergreen-soft border border-evergreen rounded-lg text-sm text-evergreen-deep">
          <strong>Cadence-as-primitive.</strong> The Cadence link is the
          read-only client-facing view of the engagement (Architectural Law 5).
          Token-based — your client never logs in, never gets a paid seat. They
          see the latest published Status Report + active Initiatives + open
          Selections + the Charter. Once they bookmark the Cadence link, the
          relationship is locked-in around it.
        </div>

        <CadenceClient
          orgId={org.id}
          orgName={org.name}
          initialReports={(reports ?? []) as StatusReport[]}
          initialTokens={(tokens ?? []) as CadenceToken[]}
        />
      </main>
    </div>
  );
}
