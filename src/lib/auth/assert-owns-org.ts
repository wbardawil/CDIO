import { auth } from "@clerk/nextjs/server";
import { createServiceClient } from "@/lib/db/supabase";
import { NextResponse } from "next/server";

export type OwnershipResult =
  | { ok: true; practitionerId: string; response: null }
  | { ok: false; practitionerId: null; response: NextResponse };

/**
 * Verifies the currently signed-in practitioner owns (or has access to) the given org.
 * Returns { ok: true } on success.
 * Returns { ok: false, response: 401|403 } on failure — caller returns it directly.
 *
 * Until Day 8 (RLS + per-user JWTs) this is the ONLY enforcement of ownership at the API layer.
 */
export async function assertPractitionerOwnsOrg(orgId: string): Promise<OwnershipResult> {
  const { userId } = await auth();
  if (!userId) {
    return {
      ok: false,
      practitionerId: null,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const db = createServiceClient();
  const { data, error } = await db
    .from("practitioners")
    .select("id, practitioner_clients!inner(org_id)")
    .eq("clerk_user_id", userId)
    .eq("practitioner_clients.org_id", orgId)
    .maybeSingle();

  if (error || !data) {
    return {
      ok: false,
      practitionerId: null,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { ok: true, practitionerId: data.id, response: null };
}
