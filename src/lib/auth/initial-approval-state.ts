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
 * - strategic_approver: auto-approved (the final decision authority's own
 *   work doesn't need self-approval). approved_by + approved_at stamped
 *   so the audit trail is complete. Handoff §4 records self-approval as
 *   a normal fact ("Wadi approved as strategic_approver after submitting
 *   as operator") — not blocked.
 * - all other roles: starts as a draft owned by the creator. The creator
 *   advances it to `pending` later via the submit endpoint.
 *
 * In S1.5 (handoff §4 Year-1 simplification) only strategic_approver
 * auto-approves. technical_reviewer + financial_approver are advisory
 * until per-artifact routing lands in S2 / Phase B, at which point their
 * own drafts will still default to needing strategic_approver sign-off
 * (matches "single-approver-sufficient" Year-1 default).
 */
export function initialApprovalStateForRole(
  role: PractitionerClientRole,
  practitionerId: string,
): InitialApprovalState {
  const now = new Date().toISOString();
  if (role === "strategic_approver") {
    return {
      approval_status: "approved",
      submitted_by_practitioner_id: practitionerId,
      submitted_at: now,
      approved_by_practitioner_id: practitionerId,
      approved_at: now,
    };
  }
  return {
    approval_status: "draft",
    submitted_by_practitioner_id: practitionerId,
    submitted_at: null,
    approved_by_practitioner_id: null,
    approved_at: null,
  };
}
