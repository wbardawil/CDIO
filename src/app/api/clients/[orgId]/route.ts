import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { assertPractitionerOwnsOrg } from "@/lib/auth/assert-owns-org";
import { createServiceClient } from "@/lib/db/supabase";

// ============================================================
// PATCH /api/clients/[orgId]
//
// Edits an organization the caller owns. All fields optional —
// pass only what you want to change. Re-derives size_category
// from employee_count if employee_count is provided, so the
// (small/medium/large) bucket can't drift away from headcount.
//
// Status transitions: 'active' <-> 'archived'. Archive is the
// non-destructive alternative to delete; hard-delete remains
// sandbox-only (see DELETE below).
// ============================================================

const PatchSchema = z
  .object({
    name: z.string().min(1).max(200).optional(),
    industry: z
      .enum([
        "healthcare",
        "financial_services",
        "manufacturing",
        "professional_services",
        "retail_ecommerce",
        "technology",
        "education",
        "other",
      ])
      .optional(),
    employee_count: z.number().int().positive().optional(),
    engagement_model: z
      .enum(["advisory", "strategic", "hybrid", "executive"])
      .optional(),
    monthly_hours: z.number().int().nonnegative().optional(),
    status: z.enum(["active", "archived"]).optional(),
  })
  .refine((v) => Object.keys(v).length > 0, {
    message: "At least one field is required",
  });

function deriveSize(employees: number): "small" | "medium" | "large" {
  if (employees <= 50) return "small";
  if (employees <= 250) return "medium";
  return "large";
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const { orgId } = await params;

  const ownership = await assertPractitionerOwnsOrg(orgId);
  if (ownership.response) return ownership.response;

  let input: z.infer<typeof PatchSchema>;
  try {
    input = PatchSchema.parse(await request.json().catch(() => ({})));
  } catch (e) {
    return NextResponse.json(
      {
        error: "Validation failed",
        details: e instanceof z.ZodError ? e.issues : String(e),
      },
      { status: 400 }
    );
  }

  const db = createServiceClient();

  // Build the update payload. Re-derive size_category whenever
  // employee_count changes — keeps the bucket honest without
  // requiring the UI to compute it.
  const update: Record<string, unknown> = { ...input };
  if (typeof input.employee_count === "number") {
    update.size_category = deriveSize(input.employee_count);
  }
  update.updated_at = new Date().toISOString();

  const { data, error } = await db
    .from("organizations")
    .update(update)
    .eq("id", orgId)
    .select(
      "id, name, size_category, industry, employee_count, engagement_model, monthly_hours, status, is_sandbox"
    )
    .single();

  if (error) {
    console.error("organization PATCH failed:", error);
    return NextResponse.json(
      { error: "Update failed", details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, organization: data });
}

/**
 * DELETE /api/clients/[orgId]
 *
 * Hard-deletes a sandbox-flagged organization and every dependent row
 * (assessments, scores, synthesis, divergences, roadmaps, stakeholders,
 * conversations, action_cards, agent_logs, practitioner_clients, org).
 *
 * Two layers of protection:
 *   1. assertPractitionerOwnsOrg — caller must own the org
 *   2. delete_sandbox_org() RPC — refuses when is_sandbox=false
 *
 * No real engagement can be deleted via this endpoint, even with valid
 * ownership. Real cleanup must be done manually by the founder.
 *
 * For real engagements use PATCH { status: 'archived' } instead.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const { orgId } = await params;

  const ownership = await assertPractitionerOwnsOrg(orgId);
  if (ownership.response) return ownership.response;

  const db = createServiceClient();

  // Defense-in-depth: also check is_sandbox here so we return a clean 403
  // before invoking the RPC. The RPC itself enforces the same rule.
  const { data: org, error: orgError } = await db
    .from("organizations")
    .select("id, name, is_sandbox")
    .eq("id", orgId)
    .single();

  if (orgError || !org) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  }
  if (!org.is_sandbox) {
    return NextResponse.json(
      {
        error: "Hard-delete is only allowed on sandbox-flagged clients",
        hint: "Use Archive (PATCH { status: 'archived' }) for real engagements.",
      },
      { status: 403 }
    );
  }

  const { data: deletionRows, error: rpcError } = await db.rpc("delete_sandbox_org", {
    p_org_id: orgId,
  });

  if (rpcError) {
    console.error("delete_sandbox_org RPC failed:", rpcError);
    return NextResponse.json(
      { error: "Delete failed", details: rpcError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    message: `Sandbox client ${org.name} deleted`,
    deleted: deletionRows ?? [],
  });
}
