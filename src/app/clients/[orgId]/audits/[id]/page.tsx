import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ensurePractitioner } from "@/lib/auth/ensure-practitioner";
import { createServiceClient } from "@/lib/db/supabase";
import type { Audit } from "@/types/audit";
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
    .select("id, name")
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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 print:hidden">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-3 text-sm">
          <Link href="/clients" className="text-gray-500 hover:text-gray-900">
            Portfolio
          </Link>
          <span className="text-gray-300">/</span>
          <Link
            href={`/clients/${org.id}`}
            className="text-gray-500 hover:text-gray-900"
          >
            {org.name}
          </Link>
          <span className="text-gray-300">/</span>
          <Link
            href={`/clients/${org.id}/audits`}
            className="text-gray-500 hover:text-gray-900"
          >
            Audits
          </Link>
          <span className="text-gray-300">/</span>
          <span className="font-semibold text-gray-900 truncate">
            {(audit as Audit).title}
          </span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <AuditDetailClient orgId={org.id} initialAudit={audit as Audit} />
      </main>
    </div>
  );
}
