import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { assertPractitionerOwnsOrg } from "@/lib/auth/assert-owns-org";
import { createServiceClient } from "@/lib/db/supabase";
import { isRunnable, type Audit, type AuditIntake } from "@/types/audit";

const intakeSchema = z.object({
  system_name: z.string().max(300).optional(),
  vendor_name: z.string().max(300).optional(),
  total_cost: z.string().max(300).optional(),
  principal_role: z.string().max(300).optional(),
  accountability: z.string().max(2000).optional(),
  vendor_proposal: z.string().max(20000).optional(),
  current_operating_model: z.string().max(20000).optional(),
  strategy_served: z.string().max(20000).optional(),
  selection_id: z.string().uuid().nullable().optional(),
});

const updateSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  status: z.enum(["intake", "ready", "cancelled"]).optional(),
  intake: intakeSchema.optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = createServiceClient();
  const { data, error } = await db
    .from("audits")
    .select("*")
    .eq("id", id)
    .single();
  if (error || !data) {
    return NextResponse.json({ error: "Audit not found" }, { status: 404 });
  }
  const ownership = await assertPractitionerOwnsOrg(data.org_id);
  if (!ownership.ok) return ownership.response;
  return NextResponse.json({ audit: data as Audit });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

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
  const { data: existing } = await db
    .from("audits")
    .select("id, org_id, intake, status")
    .eq("id", id)
    .single();
  if (!existing) {
    return NextResponse.json({ error: "Audit not found" }, { status: 404 });
  }
  const ownership = await assertPractitionerOwnsOrg(existing.org_id);
  if (!ownership.ok) return ownership.response;

  const update: Record<string, unknown> = {};
  if (parsed.data.title) update.title = parsed.data.title;

  let mergedIntake = existing.intake as AuditIntake;
  if (parsed.data.intake) {
    mergedIntake = {
      ...(existing.intake as AuditIntake),
      ...parsed.data.intake,
      selection_id:
        parsed.data.intake.selection_id ??
        (existing.intake as AuditIntake).selection_id ??
        null,
    };
    update.intake = mergedIntake;
  }

  // Status: explicit set wins; otherwise derive from intake
  // runnability so the UI can show ready vs intake without a
  // separate call.
  if (parsed.data.status) {
    update.status = parsed.data.status;
  } else if (parsed.data.intake && existing.status === "intake") {
    update.status = isRunnable(mergedIntake) ? "ready" : "intake";
  }

  const { data, error } = await db
    .from("audits")
    .update(update)
    .eq("id", id)
    .select("*")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Failed to update audit", details: error?.message },
      { status: 500 }
    );
  }
  return NextResponse.json({ audit: data as Audit });
}
