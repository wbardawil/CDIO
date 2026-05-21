import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { clerkClient } from "@clerk/nextjs/server";
import { assertCanApprove } from "@/lib/auth/role-gates";
import { createServiceClient } from "@/lib/db/supabase";

// cso C3 — invitable roles exclude 'owner'. DB CHECK enforces this too.
const inviteSchema = z.object({
  email: z.string().email().max(254),
  role: z.enum(["collaborator", "viewer", "operator"]),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string }> },
) {
  const { orgId } = await params;
  const auth = await assertCanApprove(orgId);
  if (!auth.ok) return auth.response;

  const parsed = inviteSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  // cso C2 — lowercase end-to-end.
  const email = parsed.data.email.trim().toLowerCase();
  const { role } = parsed.data;

  const db = createServiceClient();

  // Verify the org exists (forbidden-leakage already gated by assertCanApprove).
  // No additional check needed.

  // Upsert pending invitation. If a non-accepted, non-revoked invitation exists
  // for (org, email, role), refresh its expires_at and reuse the clerk
  // invitation if possible.
  const { data: existing } = await db
    .from("pending_invitations")
    .select("id, clerk_invitation_id, accepted_at, revoked_at")
    .eq("org_id", orgId)
    .eq("email", email)
    .eq("role", role)
    .maybeSingle();

  // cso C8 — uniform 200 response shape; do not differentiate
  // "newly created" vs "re-sent" in the response body either.
  let invitationId: string;
  let clerkInvitationId: string | null = null;

  // Build the Clerk invitation. We try this BEFORE the local insert so we
  // can decide whether to store clerk_invitation_id. If Clerk says the user
  // already exists, we fall back to local-only (pickup runs on next sign-in).
  try {
    const client = await clerkClient();
    const inv = await client.invitations.createInvitation({
      emailAddress: email,
      publicMetadata: { invited_to_org_id: orgId, invited_as_role: role },
      // Default redirect to the inbox so first sign-in lands them where the
      // operator workflow starts. Same path for all roles in S1.
      redirectUrl: `${getOrigin(req)}/clients/${orgId}/inbox`,
      // Surface a meaningful error if a Clerk invite already exists; we
      // catch and fall back below.
      ignoreExisting: false,
    });
    clerkInvitationId = inv.id;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    // If the user already exists in Clerk OR a Clerk invitation already exists,
    // we still write/refresh the local row — they pick it up on next sign-in.
    // We do not fail the request just because Clerk's email layer can't deliver.
    const isExpected =
      /already.*exist/i.test(message) || /duplicate/i.test(message);
    if (!isExpected) {
      return NextResponse.json(
        { error: "Failed to send invitation email", details: message },
        { status: 502 },
      );
    }
  }

  if (existing) {
    // Refresh: extend expiry by 30 days, clear revoked, keep accepted_at
    // (re-inviting an already-accepted email is a no-op for the invitation).
    const { error: updateErr } = await db
      .from("pending_invitations")
      .update({
        clerk_invitation_id: clerkInvitationId ?? existing.clerk_invitation_id,
        revoked_at: null,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .eq("id", existing.id);
    if (updateErr) {
      return NextResponse.json(
        { error: "Failed to refresh invitation", details: updateErr.message },
        { status: 500 },
      );
    }
    invitationId = existing.id;
  } else {
    const { data: created, error: insertErr } = await db
      .from("pending_invitations")
      .insert({
        org_id: orgId,
        invited_by_practitioner_id: auth.practitionerId,
        email,
        role,
        clerk_invitation_id: clerkInvitationId,
      })
      .select("id")
      .single();
    if (insertErr || !created) {
      // If Clerk succeeded but local insert failed, attempt to revoke the
      // Clerk invitation so we don't leave a working email link without
      // a backing local row.
      if (clerkInvitationId) {
        try {
          const client = await clerkClient();
          await client.invitations.revokeInvitation(clerkInvitationId);
        } catch {
          // best-effort cleanup
        }
      }
      return NextResponse.json(
        { error: "Failed to record invitation", details: insertErr?.message },
        { status: 500 },
      );
    }
    invitationId = created.id;
  }

  return NextResponse.json({
    ok: true,
    invitation_id: invitationId,
    delivered_by_email: clerkInvitationId !== null,
  });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ orgId: string }> },
) {
  const { orgId } = await params;
  const auth = await assertCanApprove(orgId);
  if (!auth.ok) return auth.response;

  const db = createServiceClient();
  const { data, error } = await db
    .from("pending_invitations")
    .select("id, email, role, created_at, expires_at, accepted_at, revoked_at, clerk_invitation_id")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Failed to load invitations" }, { status: 500 });
  }

  return NextResponse.json({ invitations: data ?? [] });
}

function getOrigin(req: NextRequest): string {
  // Prefer the configured app URL; fall back to the request origin.
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  const proto = req.headers.get("x-forwarded-proto") ?? "https";
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "localhost:3010";
  return `${proto}://${host}`;
}
