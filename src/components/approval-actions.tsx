"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export type ApprovableType = "initiatives" | "status-reports" | "selections" | "audits";

interface Props {
  artifactType: ApprovableType;
  artifactId: string;
  approvalStatus: "draft" | "pending" | "approved" | "returned" | "rejected";
  isOwner: boolean;
  isAuthor: boolean;
  // For S1, we surface the last return comment inline so the operator
  // sees what the CDIO wrote. The server-side caller fetches the most
  // recent approval_events row of type 'returned'.
  latestReturnComment?: string | null;
}

const STATUS_BADGE: Record<Props["approvalStatus"], string> = {
  draft: "bg-gray-100 text-gray-700 border-gray-200",
  pending: "bg-amber-50 text-amber-900 border-amber-200",
  approved: "bg-evergreen-soft text-evergreen border-evergreen",
  returned: "bg-blue-50 text-blue-900 border-blue-200",
  rejected: "bg-brick/10 text-brick border-brick/30",
};

const STATUS_LABEL: Record<Props["approvalStatus"], string> = {
  draft: "Draft",
  pending: "Pending CDIO approval",
  approved: "Approved",
  returned: "Returned with edits",
  rejected: "Rejected",
};

export function ApprovalActions({
  artifactType,
  artifactId,
  approvalStatus,
  isOwner,
  isAuthor,
  latestReturnComment,
}: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [returnComment, setReturnComment] = useState("");
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [rejectComment, setRejectComment] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectConfirmed, setRejectConfirmed] = useState(false);
  const [pending, startTransition] = useTransition();

  const doAction = (action: "submit" | "withdraw" | "approve" | "return" | "reject", body?: object) => {
    setError(null);
    startTransition(async () => {
      const res = await fetch(`/api/${artifactType}/${artifactId}/${action}`, {
        method: "POST",
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? data?.details ?? `HTTP ${res.status}`);
        return;
      }
      setReturnComment("");
      setShowReturnForm(false);
      setRejectComment("");
      setShowRejectForm(false);
      setRejectConfirmed(false);
      router.refresh();
    });
  };

  const canSubmit =
    isAuthor && (approvalStatus === "draft" || approvalStatus === "returned");
  const canWithdraw = isAuthor && approvalStatus === "pending";
  const canApprove = isOwner && approvalStatus === "pending";
  const canReturn = isOwner && approvalStatus === "pending";
  const canReject = isOwner && approvalStatus === "pending";

  return (
    <div className="rounded-lg border border-hair bg-raised p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-muted">
            Approval
          </span>
          <span
            className={`rounded-full border px-2 py-0.5 text-xs ${STATUS_BADGE[approvalStatus]}`}
          >
            {STATUS_LABEL[approvalStatus]}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {canSubmit && (
            <button
              onClick={() => doAction("submit")}
              disabled={pending}
              className="rounded bg-evergreen px-3 py-1.5 text-sm font-medium text-white hover:bg-evergreen-deep disabled:opacity-50"
            >
              {approvalStatus === "returned" ? "Resubmit" : "Submit for approval"}
            </button>
          )}
          {canWithdraw && (
            <button
              onClick={() => doAction("withdraw")}
              disabled={pending}
              className="rounded border border-hair bg-paper px-3 py-1.5 text-sm text-muted hover:text-ink disabled:opacity-50"
            >
              Withdraw
            </button>
          )}
          {canApprove && (
            <button
              onClick={() => doAction("approve")}
              disabled={pending}
              className="rounded bg-evergreen px-3 py-1.5 text-sm font-medium text-white hover:bg-evergreen-deep disabled:opacity-50"
            >
              Approve
            </button>
          )}
          {/* "Approve with edits" was removed in S2 (codex X14). The prior
             button POSTed { edits_made: true } with no actual edits payload,
             so the prior_version snapshot in approval_events was misleading.
             A real approve-with-edits UX ships with the S3 Decision Package
             wizard; the RPC's p_edits parameter is already wired in
             schema-v25 to support that. */}
          {canReturn && (
            <button
              onClick={() => setShowReturnForm((s) => !s)}
              disabled={pending}
              className="rounded border border-hair bg-paper px-3 py-1.5 text-sm text-muted hover:text-ink disabled:opacity-50"
            >
              {showReturnForm ? "Cancel" : "Return with comment"}
            </button>
          )}
          {canReject && (
            <button
              onClick={() => {
                setShowRejectForm((s) => !s);
                if (showRejectForm) {
                  setRejectComment("");
                  setRejectConfirmed(false);
                }
              }}
              disabled={pending}
              className="rounded border border-brick/30 bg-brick/5 px-3 py-1.5 text-sm text-brick hover:bg-brick/10 disabled:opacity-50"
              aria-expanded={showRejectForm}
            >
              {showRejectForm ? "Cancel reject" : "Reject"}
            </button>
          )}
        </div>
      </div>

      {approvalStatus === "returned" && latestReturnComment && (
        <div className="mt-3 rounded border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-900">
          <p className="text-xs font-medium uppercase tracking-wide text-blue-900/70">
            CDIO comment
          </p>
          <p className="mt-1 whitespace-pre-wrap">{latestReturnComment}</p>
        </div>
      )}

      {showReturnForm && (
        <div className="mt-3">
          <label htmlFor="return-comment" className="block text-xs font-medium text-muted mb-1">
            Comment to the author
          </label>
          <textarea
            id="return-comment"
            value={returnComment}
            onChange={(e) => setReturnComment(e.target.value)}
            rows={3}
            className="w-full rounded border border-hair bg-paper px-3 py-2 text-sm text-ink focus:border-evergreen focus:outline-none"
            placeholder="What needs to change before this can be approved?"
            disabled={pending}
          />
          <div className="mt-2 flex justify-end gap-2">
            <button
              onClick={() => doAction("return", { comment: returnComment.trim() })}
              disabled={pending || !returnComment.trim()}
              className="rounded bg-evergreen px-3 py-1.5 text-sm font-medium text-white hover:bg-evergreen-deep disabled:opacity-50"
            >
              {pending ? "Returning…" : "Send back"}
            </button>
          </div>
        </div>
      )}

      {showRejectForm && (
        <div className="mt-3 rounded border border-brick/30 bg-brick/5 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-brick mb-2">
            Reject is terminal
          </p>
          <p className="text-xs text-brick/80 mb-3">
            A rejected artifact cannot be reopened. The author must create a new
            one to rework the idea. If the artifact just needs revisions,
            <strong> Return with comment</strong> instead.
          </p>
          <label htmlFor="reject-comment" className="block text-xs font-medium text-muted mb-1">
            Reason for rejection
          </label>
          <textarea
            id="reject-comment"
            value={rejectComment}
            onChange={(e) => setRejectComment(e.target.value)}
            rows={3}
            className="w-full rounded border border-hair bg-paper px-3 py-2 text-sm text-ink focus:border-brick focus:outline-none"
            placeholder="Why is this being rejected outright?"
            disabled={pending}
          />
          <label className="mt-2 flex items-center gap-2 text-xs text-ink">
            <input
              type="checkbox"
              checked={rejectConfirmed}
              onChange={(e) => setRejectConfirmed(e.target.checked)}
              disabled={pending}
              className="rounded border-hair"
            />
            <span>I understand this is permanent.</span>
          </label>
          <div className="mt-2 flex justify-end gap-2">
            <button
              onClick={() => doAction("reject", { comment: rejectComment.trim() })}
              disabled={pending || !rejectComment.trim() || !rejectConfirmed}
              className="rounded bg-brick px-3 py-1.5 text-sm font-medium text-white hover:bg-brick/90 disabled:opacity-50"
            >
              {pending ? "Rejecting…" : "Reject permanently"}
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-3 rounded border border-brick/30 bg-brick/5 px-3 py-2 text-sm text-brick">
          {error}
        </p>
      )}
    </div>
  );
}
