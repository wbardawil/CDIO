import { auth, currentUser } from "@clerk/nextjs/server";
import { createServiceClient } from "@/lib/db/supabase";

export interface Practitioner {
  id: string;
  clerk_user_id: string;
  name: string | null;
  email: string | null;
  plan: "starter" | "growth" | "scale";
}

/**
 * Lazy-creates the practitioners row for the currently authenticated Clerk user
 * on first call. Idempotent — subsequent calls return the existing row.
 *
 * After ensuring the practitioner row exists, runs invitation pickup: any
 * `pending_invitations` rows matching this user's VERIFIED primary email
 * convert into `practitioner_clients` rows. cso C1: pickup requires
 * Clerk-verified email; otherwise we silently skip (no error — the user
 * can verify their email later and pickup will run on the next sign-in).
 *
 * Returns null if no Clerk user is signed in.
 */
export async function ensurePractitioner(): Promise<Practitioner | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const db = createServiceClient();

  const { data: existing } = await db
    .from("practitioners")
    .select("id, clerk_user_id, name, email, plan")
    .eq("clerk_user_id", userId)
    .maybeSingle();

  let practitioner: Practitioner;
  if (existing) {
    practitioner = existing as Practitioner;
  } else {
    const user = await currentUser();
    const { data, error } = await db
      .from("practitioners")
      .insert({
        clerk_user_id: userId,
        name: user?.fullName ?? null,
        email: user?.primaryEmailAddress?.emailAddress ?? null,
      })
      .select("id, clerk_user_id, name, email, plan")
      .single();

    if (error) {
      // 23505 = unique_violation. Another concurrent request raced us; re-read.
      if ((error as { code?: string }).code === "23505") {
        const { data: retry } = await db
          .from("practitioners")
          .select("id, clerk_user_id, name, email, plan")
          .eq("clerk_user_id", userId)
          .single();
        if (retry) practitioner = retry as Practitioner;
        else throw error;
      } else {
        throw error;
      }
    } else {
      practitioner = data as Practitioner;
    }
  }

  // Pickup. Runs on every sign-in, not just on first creation, so an
  // already-existing user (e.g. a CDIO invited as an operator on a NEW
  // client) also picks up new invitations. Silently no-ops in the
  // common case.
  await pickupPendingInvitations(practitioner);

  return practitioner;
}

async function pickupPendingInvitations(practitioner: Practitioner): Promise<void> {
  // cso C1 — only act on verified primary email. Fetch fresh from Clerk
  // each call so a user who just verified picks up immediately.
  const user = await currentUser();
  const primaryEmail = user?.primaryEmailAddress;
  if (!primaryEmail || primaryEmail.verification?.status !== "verified") return;

  // cso C2 — lowercase end-to-end.
  const email = primaryEmail.emailAddress.toLowerCase();

  const db = createServiceClient();
  const { data: pending } = await db
    .from("pending_invitations")
    .select("id, org_id, role, invited_by_practitioner_id")
    .eq("email", email)
    .is("accepted_at", null)
    .is("revoked_at", null)
    .gt("expires_at", new Date().toISOString());

  if (!pending || pending.length === 0) return;

  // Process serially — each invitation is independent; failures shouldn't
  // block others, and we want clean error attribution if any fails.
  for (const inv of pending) {
    // eng E6 — INSERT ... ON CONFLICT DO NOTHING. If the user already has
    // a practitioner_clients row for this org (rare — they were invited
    // twice, possibly to different roles), we do not silently up/downgrade.
    // We mark the invitation accepted regardless so the pending row clears.
    const nowIso = new Date().toISOString();
    const { error: insertErr } = await db
      .from("practitioner_clients")
      .upsert(
        {
          practitioner_id: practitioner.id,
          org_id: inv.org_id,
          role: inv.role,
          invited_by_practitioner_id: inv.invited_by_practitioner_id,
          invited_at: nowIso,
          accepted_at: nowIso,
        },
        { onConflict: "practitioner_id,org_id", ignoreDuplicates: true },
      );

    if (insertErr) {
      // Don't throw — pickup is best-effort. Log via console for now;
      // a structured logger lands in S2.
      console.warn(
        `[invitation-pickup] failed to insert practitioner_clients for practitioner=${practitioner.id} org=${inv.org_id}: ${insertErr.message}`,
      );
      continue;
    }

    // Mark the invitation accepted.
    await db
      .from("pending_invitations")
      .update({ accepted_at: nowIso })
      .eq("id", inv.id);
  }
}
