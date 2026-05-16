import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ensurePractitioner } from "@/lib/auth/ensure-practitioner";
import { createServiceClient } from "@/lib/db/supabase";
import { NewAuditForm } from "./form-client";

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
    .select("id, name")
    .eq("id", orgId)
    .single();
  if (!org) notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-3 text-sm">
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
          <span className="font-semibold text-gray-900">New</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          New pre-purchase audit
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Give what you have. A blank field is not a blocker — it becomes the
          first finding. &quot;About to sign a major deal and can&apos;t
          articulate the strategy it serves&quot; is itself the audit&apos;s
          opening line. You can run with partial intake; missing inputs push
          the verdict to <strong>HOLD</strong> until resolved.
        </p>
        <NewAuditForm orgId={org.id} />
      </main>
    </div>
  );
}
