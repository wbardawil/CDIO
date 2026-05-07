"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  decisionId: string;
  initialResolution?: string | null;
  initialResolvedAt?: string | null;
}

/**
 * Resolve form for a Decision Package. Two states:
 *   - Resolved: shows the captured resolution + timestamp + "Edit" link
 *   - Unresolved: shows a textarea + "Record decision" button
 *
 * Re-resolving is permitted — leadership teams revisit decisions, and the
 * practitioner needs to capture what changed.
 */
export function ResolveDecisionForm({
  decisionId,
  initialResolution,
  initialResolvedAt,
}: Props) {
  const router = useRouter();
  const hasInitial = Boolean(initialResolution && initialResolvedAt);
  const [editing, setEditing] = useState(!hasInitial);
  const [text, setText] = useState(initialResolution ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSave = async () => {
    if (!text.trim()) {
      setError("Resolution can't be empty.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/decisions/${decisionId}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolution: text.trim() }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error ?? `HTTP ${res.status}`);
      setEditing(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (!editing && hasInitial) {
    const when = initialResolvedAt
      ? new Date(initialResolvedAt).toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : null;
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
        <div className="flex items-baseline justify-between gap-3 mb-1.5 flex-wrap">
          <p className="text-[10px] uppercase tracking-wider text-green-800 font-semibold">
            ✓ Decided{when ? ` · ${when}` : ""}
          </p>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-xs text-green-700 hover:text-green-900 font-medium underline-offset-2 hover:underline"
          >
            Update
          </button>
        </div>
        <p className="text-sm text-green-900 whitespace-pre-wrap">{initialResolution}</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
      <label className="block text-[10px] uppercase tracking-wider text-blue-800 font-semibold mb-1.5">
        What did the team decide?
      </label>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="e.g. We're prioritizing the encryption-at-rest project this quarter; CTO owns the rollout, $40K budget approved by CFO, target completion 2026-08-15."
        rows={3}
        className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 mb-2"
        disabled={saving}
      />
      {error && <p className="text-xs text-red-700 mb-2">{error}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 disabled:bg-gray-300"
        >
          {saving ? "Saving…" : "Record decision"}
        </button>
        {hasInitial && (
          <button
            type="button"
            onClick={() => {
              setText(initialResolution ?? "");
              setEditing(false);
              setError(null);
            }}
            disabled={saving}
            className="px-3 py-1.5 border border-gray-300 text-gray-700 text-xs font-medium rounded hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
