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
  todo: "bg-gray-50 text-gray-600 border-gray-300 hover:bg-gray-100",
  in_progress:
    "bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100",
  done: "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100",
  blocked: "bg-red-50 text-red-700 border-red-300 hover:bg-red-100",
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
        throw new Error(body?.error ?? `HTTP ${res.status}`);
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
                  ? `${STATUS_CLASS[s]} ring-2 ring-offset-1 ring-blue-500`
                  : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"
              } ${pending !== null ? "opacity-60 cursor-wait" : ""}`}
            >
              {pending === s ? "..." : INITIATIVE_STEP_STATUS_LABEL[s]}
            </button>
          );
        })}
      </div>
      {error && (
        <p className="text-[11px] text-red-600 mt-1.5">{error}</p>
      )}
    </div>
  );
}
