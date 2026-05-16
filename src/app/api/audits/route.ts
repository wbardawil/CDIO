import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { assertPractitionerOwnsOrg } from "@/lib/auth/assert-owns-org";
import { createServiceClient } from "@/lib/db/supabase";
import type { Audit, AuditIntake } from "@/types/audit";

const EMPTY_INTAKE: AuditIntake = {
  system_name: "",
  vendor_name: "",
  total_cost: "",
  principal_role: "",
  accountability: "",
  vendor_proposal: "",
  current_operating_model: "",
  strategy_served: "",
  selection_id: null,
};

const createSchema = z.object({
  org_id: z.string().uuid(),
  title: z.string().min(1).max(300),
  intake: z
    .object({
      system_name: z.string().max(300).optional(),
      vendor_name: z.string().max(300).optional(),
      total_cost: z.string().max(300).optional(),
      principal_role: z.string().max(300).optional(),
      accountability: z.string().max(2000).optional(),
      vendor_proposal: z.string().max(20000).optional(),
      current_operating_model: z.string().max(20000).optional(),
      strategy_served: z.string().max(20000).optional(),
      selection_id: z.string().uuid().nullable().optional(),
    })
    .optional(),
});

export async function GET(request: NextRequest) {
  const orgId = request.nextUrl.searchParams.get("org_id");
  if (!orgId) {
    return NextResponse.json({ error: "org_id required" }, { status: 400 });
  }
  const ownership = await assertPractitionerOwnsOrg(orgId);
  if (!ownership.ok) return ownership.response;

  const db = createServiceClient();
  const { data, error } = await db
    .from("audits")
    .select("*")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: "Failed to list audits", details: error.message },
      { status: 500 }
    );
  }
  return NextResponse.json({ audits: (data ?? []) as Audit[] });
}

export async function POST(request: NextRequest) {
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

  const ownership = await assertPractitionerOwnsOrg(input.org_id);
  if (!ownership.ok) return ownership.response;

  const intake: AuditIntake = {
    ...EMPTY_INTAKE,
    ...(input.intake ?? {}),
    selection_id: input.intake?.selection_id ?? null,
  };

  const db = createServiceClient();
  const { data, error } = await db
    .from("audits")
    .insert({
      org_id: input.org_id,
      practitioner_id: ownership.practitionerId,
      title: input.title,
      status: "intake",
      intake,
    })
    .select("*")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Failed to create audit", details: error?.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ audit: data as Audit }, { status: 201 });
}
