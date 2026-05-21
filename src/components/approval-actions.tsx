"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export type ApprovableType = "initiatives" | "status-reports" | "selections" | "audits";

interface Props {
  artifactType: ApprovableType;
  artifactId: string;
  approvalStatus: "draft" | "pending" | "approved" | "returned";
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
};

const STATUS_LABEL: Record<Props["approvalStatus"], string> = {
  draft: "Draft",
  pending: "Pending CDIO approval",
  approved: "Approved",
  returned: "Returned with edits",
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
  const [pending, startTransition] = useTransition();

  const doAction = (action: "submit" | "withdraw" | "approve" | "return", body?: object) => {
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
      router.refresh();
    });
  };

  const canSubmit =
    isAuthor && (approvalStatus === "draft" || approvalStatus === "returned");
  const canWithdraw = isAuthor && approvalStatus === "pending";
  const canApprove = isOwner && approvalStatus === "pending";
  const canReturn = isOwner && approvalStatus === "pending";

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
            <>
              <button
                onClick={() => doAction("approve")}
                disabled={pending}
                className="rounded bg-evergreen px-3 py-1.5 text-sm font-medium text-white hover:bg-evergreen-deep disabled:opacity-50"
              >
                Approve
              </button>
              <button
                onClick={() => doAction("approve", { edits_made: true })}
                disabled={pending}
                className="rounded border border-evergreen bg-evergreen-soft px-3 py-1.5 text-sm font-medium text-evergreen-deep hover:bg-evergreen hover:text-white disabled:opacity-50"
              >
                Approve with edits
              </button>
            </>
          )}
          {canReturn && (
            <button
              onClick={() => setShowReturnForm((s) => !s)}
              disabled={pending}
              className="rounded border border-hair bg-paper px-3 py-1.5 text-sm text-muted hover:text-ink disabled:opacity-50"
            >
              {showReturnForm ? "Cancel" : "Return with comment"}
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

      {error && (
        <p className="mt-3 rounded border border-brick/30 bg-brick/5 px-3 py-2 text-sm text-brick">
          {error}
        </p>
      )}
    </div>
  );
}
