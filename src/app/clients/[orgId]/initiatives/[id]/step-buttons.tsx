"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  type InitiativeStepStatus,
  INITIATIVE_STEP_STATUS_LABEL,
} from "@/types/initiative";

interface Props {
  initiativeId: string;
  stepId: string;
  currentStatus: InitiativeStepStatus;
}

const ORDER: InitiativeStepStatus[] = [
  "todo",
  "in_progress",
  "done",
  "blocked",
];

const STATUS_CLASS: Record<InitiativeStepStatus, string> = {
  todo: "bg-paper text-muted border-hair hover:bg-surface",
  in_progress:
    "bg-amber-soft text-amber-deep border-amber hover:bg-amber-soft",
  done: "bg-evergreen-soft text-evergreen border-evergreen hover:bg-evergreen-soft",
  blocked: "bg-raised text-brick border-brick hover:bg-raised",
};

export function StepStatusButtons({
  initiativeId,
  stepId,
  currentStatus,
}: Props) {
  const router = useRouter();
  const [pending, setPending] = useState<InitiativeStepStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async (status: InitiativeStepStatus) => {
    if (pending || status === currentStatus) return;
    setPending(status);
    setError(null);
    try {
      const res = await fetch(
        `/api/initiatives/${initiativeId}/step-status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ step_id: stepId, status }),
        }
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        // Surface the API's `details` field so the user sees the real cause
        // (Supabase / validation message) instead of a friendly-but-useless
        // one-liner. Pattern shared with initiative form (commit 63e81c1).
        // eslint-disable-next-line no-console
        console.error("[api error]", { status: res.status, body });
        const detail = body?.details
          ? typeof body.details === "string"
            ? body.details
            : JSON.stringify(body.details)
          : null;
        throw new Error(
          body?.error
            ? detail
              ? `${body.error}: ${detail}`
              : body.error
            : `HTTP ${res.status}`
        );
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setPending(null);
    }
  };

  return (
    <div className="ml-10">
      <div className="flex flex-wrap gap-2">
        {ORDER.map((s) => {
          const selected = s === currentStatus;
          return (
            <button
              key={s}
              type="button"
              onClick={() => handleClick(s)}
              disabled={pending !== null}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-lg border transition ${
                selected
                  ? `${STATUS_CLASS[s]} ring-2 ring-offset-1 ring-evergreen`
                  : "bg-raised border-hair text-muted hover:bg-paper"
              } ${pending !== null ? "opacity-60 cursor-wait" : ""}`}
            >
              {pending === s ? "..." : INITIATIVE_STEP_STATUS_LABEL[s]}
            </button>
          );
        })}
      </div>
      {error && (
        <p className="text-[11px] text-brick mt-1.5">{error}</p>
      )}
    </div>
  );
}
