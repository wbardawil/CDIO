import { NextRequest, NextResponse } from "next/server";
import { assertPractitionerOwnsOrg } from "@/lib/auth/assert-owns-org";
import { createServiceClient } from "@/lib/db/supabase";

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
        hint: "Real engagements cannot be deleted via the UI. Contact the operator.",
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
