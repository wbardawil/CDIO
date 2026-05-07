import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ensurePractitioner } from "@/lib/auth/ensure-practitioner";
import { createServiceClient } from "@/lib/db/supabase";
import type { NetworkCatalogEntry } from "@/types/network-catalog";

const createSchema = z.object({
  entry_type: z.enum(["vendor", "partner", "individual"]).default("vendor"),
  name: z.string().min(1).max(200),
  category: z.string().max(100).nullable().optional(),
  website: z.string().url().nullable().optional().or(z.literal("")),
  contact_name: z.string().max(200).nullable().optional(),
  contact_email: z.string().email().nullable().optional().or(z.literal("")),
  private_notes: z.string().max(8000).nullable().optional(),
  pricing_notes: z.string().max(2000).nullable().optional(),
  rating: z.number().int().min(1).max(5).nullable().optional(),
  engagements_used: z.number().int().min(0).max(1000).default(0),
  tags: z.array(z.string().min(1).max(40)).max(20).default([]),
  last_engaged_at: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .optional(),
});

// CRITICAL: every read filters on practitioner_id; every write
// stamps practitioner_id from the authenticated session. Cross-
// practitioner data leakage is treated as a P0 architectural
// concern (see docs/STRATEGY-2026.md Network Catalog Privacy
// Spec).

export async function POST(request: NextRequest) {
  const practitioner = await ensurePractitioner();
  if (!practitioner) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const input = parsed.data;

  const db = createServiceClient();

  const { data, error } = await db
    .from("network_catalog_entries")
    .insert({
      practitioner_id: practitioner.id,
      entry_type: input.entry_type,
      name: input.name,
      category: input.category ?? null,
      website: input.website ? input.website : null,
      contact_name: input.contact_name ?? null,
      contact_email: input.contact_email ? input.contact_email : null,
      private_notes: input.private_notes ?? null,
      pricing_notes: input.pricing_notes ?? null,
      rating: input.rating ?? null,
      engagements_used: input.engagements_used,
      tags: input.tags,
      last_engaged_at: input.last_engaged_at ?? null,
    })
    .select("*")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Failed to create entry", details: error?.message },
      { status: 500 }
    );
  }
  return NextResponse.json(
    { entry: data as NetworkCatalogEntry },
    { status: 201 }
  );
}
