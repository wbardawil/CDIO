import { auth } from "@clerk/nextjs/server";
import { createServiceClient } from "@/lib/db/supabase";
import { NextResponse } from "next/server";

export type PractitionerClientRole = "owner" | "collaborator" | "viewer" | "operator";

export type OwnershipResult =
  | { ok: true; practitionerId: string; role: PractitionerClientRole; response: null }
  | { ok: false; practitionerId: null; role: null; response: NextResponse };

/**
 * Verifies the currently signed-in user has access to the given client org.
 * Returns the user's role on success so callers can apply role-specific rules
 * (owner approves, operator submits, viewer reads only, etc.).
 *
 * Existing callers that ignored `role` are still type-compatible — `role` was
 * added to the success branch in v23.
 */
export async function assertPractitionerOwnsOrg(orgId: string): Promise<OwnershipResult> {
  const { userId } = await auth();
  if (!userId) {
    return {
      ok: false,
      practitionerId: null,
      role: null,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const db = createServiceClient();
  const { data, error } = await db
    .from("practitioners")
    .select("id, practitioner_clients!inner(org_id, role)")
    .eq("clerk_user_id", userId)
    .eq("practitioner_clients.org_id", orgId)
    .maybeSingle();

  if (error || !data) {
    return {
      ok: false,
      practitionerId: null,
      role: null,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  const membership = (data.practitioner_clients as unknown) as Array<{ role: PractitionerClientRole; org_id: string }>;
  const role = membership[0]?.role ?? "viewer";

  return { ok: true, practitionerId: data.id, role, response: null };
}
