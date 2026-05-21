import { NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { assertCanApprove } from "@/lib/auth/role-gates";
import { createServiceClient } from "@/lib/db/supabase";

// DELETE /api/clients/[orgId]/invitations/[invitationId]
//
// cso C9 — Clerk revoke BEFORE local revoke. If Clerk fails, fail the
// whole operation so the stale email link cannot create an unintended
// account. Idempotent retry safe.
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ orgId: string; invitationId: string }> },
) {
  const { orgId, invitationId } = await params;
  const auth = await assertCanApprove(orgId);
  if (!auth.ok) return auth.response;

  const db = createServiceClient();
  const { data: row, error: fetchErr } = await db
    .from("pending_invitations")
    .select("id, org_id, clerk_invitation_id, accepted_at, revoked_at")
    .eq("id", invitationId)
    .maybeSingle();

  // cso C4 — 404 not 403 for cross-org or missing.
  if (fetchErr || !row || row.org_id !== orgId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (row.accepted_at) {
    return NextResponse.json(
      { error: "Invitation already accepted — revoke the membership instead." },
      { status: 409 },
    );
  }

  // Already revoked: idempotent success.
  if (row.revoked_at) {
    return NextResponse.json({ ok: true, already_revoked: true });
  }

  if (row.clerk_invitation_id) {
    try {
      const client = await clerkClient();
      await client.invitations.revokeInvitation(row.clerk_invitation_id);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      // If Clerk says it's already revoked / not found, proceed to mark
      // local revoke. Otherwise hard-fail so the link can't outlive us.
      const isExpected = /already.*revoked/i.test(message) || /not.*found/i.test(message);
      if (!isExpected) {
        return NextResponse.json(
          { error: "Failed to revoke at Clerk; not revoking locally to avoid stale link.", details: message },
          { status: 502 },
        );
      }
    }
  }

  const { error: updateErr } = await db
    .from("pending_invitations")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", invitationId);
  if (updateErr) {
    return NextResponse.json({ error: "Failed to record revocation" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
