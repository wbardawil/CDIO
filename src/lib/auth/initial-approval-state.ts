import type { PractitionerClientRole } from "./assert-owns-org";

export interface InitialApprovalState {
  approval_status: "draft";
  submitted_by_practitioner_id: string;
  submitted_at: string | null;
  approved_by_practitioner_id: string | null;
  approved_at: string | null;
}

/**
 * Computes the approval-state fields that a newly created artifact should
 * carry, based on the creator's role.
 *
 * Every newly created artifact starts in 'draft', regardless of creator role.
 * The creator advances it to 'pending' via submit and (if they're a
 * strategic_approver) self-approves with an explicit approve call.
 *
 * S2 substrate-fix change (2026-05-21): previously strategic_approver
 * creations skipped straight to 'approved' here. Codex review X9 caught
 * that the "approved = an explicit approve event happened" invariant the
 * S2 substrate relies on can't hold if some approved artifacts have no
 * approval_events row. With the change below, every approved artifact has
 * a submitted event AND an approved event in the audit trail. The
 * strategic_approver pays a two-click cost (Submit → Approve) instead of
 * zero clicks for a clean Coach Mode diff input. Legacy auto-approved rows
 * are forward-only — they stay as-is; only new creations follow the new rule.
 */
export function initialApprovalStateForRole(
  _role: PractitionerClientRole,
  practitionerId: string,
): InitialApprovalState {
  return {
    approval_status: "draft",
    submitted_by_practitioner_id: practitionerId,
    submitted_at: null,
    approved_by_practitioner_id: null,
    approved_at: null,
  };
}
