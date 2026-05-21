import { auth } from "@clerk/nextjs/server";
import { createServiceClient } from "@/lib/db/supabase";
import { NextResponse } from "next/server";

export type PractitionerClientRole =
  | "strategic_approver"
  | "technical_reviewer"
  | "financial_approver"
  | "operator"
  | "collaborator"
  | "viewer";

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
  // Disambiguate the FK: schema-v23 added invited_by_practitioner_id, so
  // there are now TWO foreign keys from practitioner_clients back to
  // practitioners. Without the explicit !practitioner_clients_practitioner_id_fkey
  // hint, PostgREST errors with PGRST201 "Could not embed because more than
  // one relationship was found" and the helper returns 403 — breaking every
  // endpoint that auth-gates with it.
  const { data, error } = await db
    .from("practitioners")
    .select(
      "id, practitioner_clients!practitioner_clients_practitioner_id_fkey!inner(org_id, role)",
    )
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

  const membership = (data.practitioner_clients as unknown) as Array<{ role: string; org_id: string }>;
  // Defensive: if a legacy 'owner' value somehow survives (shouldn't after v24
  // migration), map it forward to the new name. Belt + suspenders.
  const rawRole = membership[0]?.role ?? "viewer";
  const role: PractitionerClientRole =
    rawRole === "owner" ? "strategic_approver" : (rawRole as PractitionerClientRole);

  return { ok: true, practitionerId: data.id, role, response: null };
}
