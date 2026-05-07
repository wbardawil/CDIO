import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ensurePractitioner } from "@/lib/auth/ensure-practitioner";
import { createServiceClient } from "@/lib/db/supabase";
import { NewSelectionForm } from "./form-client";

export default async function NewSelectionPage({
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
            href={`/clients/${org.id}/selections`}
            className="text-gray-500 hover:text-gray-900"
          >
            Selections
          </Link>
          <span className="text-gray-300">/</span>
          <span className="font-semibold text-gray-900">New</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">New selection</h1>
        <p className="text-sm text-gray-500 mb-6">
          Pick the domain — Tech, AI, or Partner. Default criteria load
          automatically (AMP 5x5 for AI, generic CMMI / TBM for Tech, and a
          partner-evaluation set for Partner). You can refine criteria and
          add candidates on the next screen.
        </p>
        <NewSelectionForm orgId={org.id} />
      </main>
    </div>
  );
}
