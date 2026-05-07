import Link from "next/link";
import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { ensurePractitioner } from "@/lib/auth/ensure-practitioner";
import { createServiceClient } from "@/lib/db/supabase";
import {
  type NetworkCatalogEntry,
  ENTRY_TYPE_LABEL,
} from "@/types/network-catalog";
import { NetworkCatalogClient } from "./catalog-client";

// Network Catalog list page. Practitioner-only; never visible to
// clients. Cross-practitioner data leakage is a P0 architectural
// concern (see docs/STRATEGY-2026.md Network Catalog Privacy
// Spec).

export default async function NetworkCatalogPage() {
  const practitioner = await ensurePractitioner();
  if (!practitioner) redirect("/sign-in");

  const db = createServiceClient();

  // CRITICAL: filter on practitioner_id. Never read someone
  // else's catalog. App-layer enforcement today; RLS template
  // documented in schema-v13 for P0-8 closure.
  const { data: entries } = await db
    .from("network_catalog_entries")
    .select("*")
    .eq("practitioner_id", practitioner.id)
    .order("rating", { ascending: false, nullsFirst: false })
    .order("name", { ascending: true });

  const items = (entries ?? []) as NetworkCatalogEntry[];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">
              AI-CDIO &middot; Network Catalog
            </h1>
            <p className="text-xs text-gray-500">
              Your private vendor / partner / individual library &middot; never
              shared with clients or other practitioners
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/clients"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              &larr; Workspace
            </Link>
            <UserButton />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-6 px-4 py-3 bg-purple-50 border border-purple-200 rounded-lg text-sm text-purple-900">
          <strong>P0 privacy.</strong> Entries here are visible only to you.
          Pricing, ratings, and notes are never shown to clients or pooled
          across practitioners. Per the Network Catalog Privacy Spec — no
          cross-practitioner aggregates in Year 1. Export and full-wipe are
          GDPR-clean (data deletion via DELETE on each entry).
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <Stat
            label="Total entries"
            value={items.length.toString()}
          />
          <Stat
            label="Vendors / Partners / Individuals"
            value={
              items.length > 0
                ? `${items.filter((e) => e.entry_type === "vendor").length} · ${items.filter((e) => e.entry_type === "partner").length} · ${items.filter((e) => e.entry_type === "individual").length}`
                : "—"
            }
          />
          <Stat
            label="Rated 4+"
            value={items.filter((e) => (e.rating ?? 0) >= 4).length.toString()}
          />
        </div>

        <NetworkCatalogClient initialEntries={items} />
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  );
}

// Re-export the label map so the client component can stay
// self-contained without re-importing from types.
export { ENTRY_TYPE_LABEL };
