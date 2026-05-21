import type { PractitionerClientRole } from "./assert-owns-org";

export interface InitialApprovalState {
  approval_status: "draft" | "approved";
  submitted_by_practitioner_id: string;
  submitted_at: string | null;
  approved_by_practitioner_id: string | null;
  approved_at: string | null;
}

/**
 * Computes the approval-state fields that a newly created artifact should
 * carry, based on the creator's role.
 *
 * - owner: auto-approved (the CDIO is the approval authority; their own
 *   work doesn't need self-approval). approved_by + approved_at stamped
 *   so the audit trail is complete.
 * - collaborator / operator: starts as a draft owned by the creator. The
 *   creator advances it to `pending` later via the submit endpoint.
 */
export function initialApprovalStateForRole(
  role: PractitionerClientRole,
  practitionerId: string,
): InitialApprovalState {
  const now = new Date().toISOString();
  if (role === "owner") {
    return {
      approval_status: "approved",
      submitted_by_practitioner_id: practitionerId,
      submitted_at: now,
      approved_by_practitioner_id: practitionerId,
      approved_at: now,
    };
  }
  // collaborator + operator both start as drafts owned by the creator.
  return {
    approval_status: "draft",
    submitted_by_practitioner_id: practitionerId,
    submitted_at: null,
    approved_by_practitioner_id: null,
    approved_at: null,
  };
}
