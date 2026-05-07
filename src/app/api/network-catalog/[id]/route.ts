import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ensurePractitioner } from "@/lib/auth/ensure-practitioner";
import { createServiceClient } from "@/lib/db/supabase";
import type { NetworkCatalogEntry } from "@/types/network-catalog";

const updateSchema = z.object({
  entry_type: z.enum(["vendor", "partner", "individual"]).optional(),
  name: z.string().min(1).max(200).optional(),
  category: z.string().max(100).nullable().optional(),
  website: z.string().url().nullable().optional().or(z.literal("")),
  contact_name: z.string().max(200).nullable().optional(),
  contact_email: z.string().email().nullable().optional().or(z.literal("")),
  private_notes: z.string().max(8000).nullable().optional(),
  pricing_notes: z.string().max(2000).nullable().optional(),
  rating: z.number().int().min(1).max(5).nullable().optional(),
  engagements_used: z.number().int().min(0).max(1000).optional(),
  tags: z.array(z.string().min(1).max(40)).max(20).optional(),
  last_engaged_at: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .optional(),
});

async function ensureOwnership(
  id: string,
  practitionerId: string
): Promise<boolean> {
  const db = createServiceClient();
  const { data } = await db
    .from("network_catalog_entries")
    .select("id")
    .eq("id", id)
    .eq("practitioner_id", practitionerId)
    .maybeSingle();
  return !!data;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const practitioner = await ensurePractitioner();
  if (!practitioner) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  if (!(await ensureOwnership(id, practitioner.id))) {
    // Returning 404 not 403 - never confirm a row exists for a
    // different practitioner. Defense-in-depth privacy.
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const db = createServiceClient();
  const { data, error } = await db
    .from("network_catalog_entries")
    .update(parsed.data)
    .eq("id", id)
    .eq("practitioner_id", practitioner.id) // belt + suspenders
    .select("*")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Failed to update entry", details: error?.message },
      { status: 500 }
    );
  }
  return NextResponse.json({ entry: data as NetworkCatalogEntry });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const practitioner = await ensurePractitioner();
  if (!practitioner) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  if (!(await ensureOwnership(id, practitioner.id))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const db = createServiceClient();
  const { error } = await db
    .from("network_catalog_entries")
    .delete()
    .eq("id", id)
    .eq("practitioner_id", practitioner.id); // belt + suspenders

  if (error) {
    return NextResponse.json(
      { error: "Failed to delete entry", details: error.message },
      { status: 500 }
    );
  }
  return NextResponse.json({ deleted: true });
}
