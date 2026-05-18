"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  orgId: string;
  orgName: string;
}

export function ResetAssessmentButton({ orgId, orgName }: Props) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const onReset = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`/api/clients/${orgId}/reset-assessment`, { method: "POST" });
      const body = await res.json();
      if (!res.ok) {
        throw new Error(body?.error ?? `HTTP ${res.status}`);
      }
      const c = body.cleared ?? {};
      setResult(
        `Wiped: ${c.module_scores ?? 0} responses, ${c.syntheses ?? 0} syntheses, ${c.divergences ?? 0} divergences, ${c.roadmaps ?? 0} roadmaps. Assessment reset to draft.`
      );
      setConfirming(false);
      // Refresh the page so workspace shows the empty state
      setTimeout(() => router.refresh(), 1200);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <div className="rounded-lg border border-evergreen bg-evergreen-soft p-4 text-sm text-evergreen-deep">
        ✓ {result}
      </div>
    );
  }

  if (confirming) {
    return (
      <div className="rounded-lg border border-brick bg-raised p-4">
        <p className="text-sm text-brick font-medium mb-1">
          Wipe all assessment data for {orgName}?
        </p>
        <p className="text-xs text-brick mb-3">
          This deletes module responses, synthesis, divergences, and roadmaps.
          The org, stakeholders, and assessment shell remain. Sandbox-only.
        </p>
        {error && <p className="text-xs text-brick mb-2">Error: {error}</p>}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onReset}
            disabled={loading}
            className="px-3 py-1.5 bg-brick text-white text-xs font-medium rounded hover:bg-brick disabled:bg-hair"
          >
            {loading ? "Wiping…" : "Yes, wipe data"}
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            disabled={loading}
            className="px-3 py-1.5 border border-hair text-ink text-xs font-medium rounded hover:bg-paper"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="inline-flex items-center px-3 py-1.5 border border-amber bg-amber-soft text-amber-deep text-xs font-medium rounded-md hover:bg-amber-soft"
    >
      Reset assessment data
    </button>
  );
}
