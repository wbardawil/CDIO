import { auth } from "@clerk/nextjs/server";
import { createServiceClient } from "@/lib/db/supabase";
import { NextResponse } from "next/server";

export interface OwnershipOk {
  practitionerId: string;
  response: null;
}
export interface OwnershipDenied {
  practitionerId: null;
  response: NextResponse;
}

/**
 * Verifies the currently signed-in practitioner owns (or has access to) the given org.
 * Returns { practitionerId, response: null } on success.
 * Returns { practitionerId: null, response: 401|403 } on failure — caller returns it directly.
 *
 * Until Day 8 (RLS + per-user JWTs) this is the ONLY enforcement of ownership at the API layer.
 */
export async function assertPractitionerOwnsOrg(
  orgId: string
): Promise<OwnershipOk | OwnershipDenied> {
  const { userId } = await auth();
  if (!userId) {
    return {
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
      practitionerId: null,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { practitionerId: data.id, response: null };
}
