import { NextResponse } from "next/server";
import { ensurePractitioner } from "@/lib/auth/ensure-practitioner";
import { createServiceClient } from "@/lib/db/supabase";

export async function GET() {
  const practitioner = await ensurePractitioner();
  if (!practitioner) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = createServiceClient();
  const { data: mappings, error } = await db
    .from("practitioner_clients")
    .select(`
      role,
      created_at,
      organizations:org_id (
        id,
        name,
        size_category,
        industry,
        employee_count,
        engagement_model,
        monthly_hours,
        active_modules,
        created_at,
        updated_at
      )
    `)
    .eq("practitioner_id", practitioner.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("practitioner_clients fetch failed:", error);
    return NextResponse.json(
      { error: "Failed to load clients", details: error.message },
      { status: 500 }
    );
  }

  // Flatten the nested join shape into a clean clients array.
  type ClientRow = Record<string, unknown> & { role: string };
  const clients: ClientRow[] = (mappings ?? [])
    .map((m): ClientRow | null => {
      const org = (m.organizations as unknown) as Record<string, unknown> | null;
      if (!org) return null;
      return { ...org, role: m.role };
    })
    .filter((x): x is ClientRow => x !== null);

  return NextResponse.json({ practitioner, clients });
}
