"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  orgId: string;
  orgName: string;
}

/**
 * Sandbox-only hard-delete. Two confirmation steps:
 *   1. Click the button → reveal a confirm strip
 *   2. Type the org name exactly to enable the destructive button
 *
 * Server-side rejects when is_sandbox=false; this UI is the soft layer
 * that stops accidental clicks.
 */
export function DeleteSandboxOrgButton({ orgId, orgName }: Props) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [typed, setTyped] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const matches = typed.trim() === orgName;

  const onDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/clients/${orgId}`, { method: "DELETE" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body?.error ?? `HTTP ${res.status}`);
      }
      // Bounce to the portfolio. The org no longer exists.
      router.replace("/clients");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
      setLoading(false);
    }
  };

  if (confirming) {
    return (
      <div className="rounded-lg border border-red-300 bg-red-50 p-4">
        <p className="text-sm text-red-900 font-medium mb-1">
          Hard-delete {orgName}?
        </p>
        <p className="text-xs text-red-700 mb-3">
          This wipes the org, all assessments, all stakeholders, and every
          dependent row in a single transaction. Cannot be undone. Sandbox-only.
        </p>
        <label className="block text-xs font-medium text-red-900 mb-1">
          Type the org name to confirm
        </label>
        <input
          type="text"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          placeholder={orgName}
          className="w-full px-2 py-1.5 border border-red-300 rounded text-sm bg-white mb-3 focus:outline-none focus:ring-2 focus:ring-red-400"
          disabled={loading}
        />
        {error && <p className="text-xs text-red-700 mb-2">Error: {error}</p>}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onDelete}
            disabled={loading || !matches}
            className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {loading ? "Deleting…" : "Yes, hard-delete client"}
          </button>
          <button
            type="button"
            onClick={() => {
              setConfirming(false);
              setTyped("");
              setError(null);
            }}
            disabled={loading}
            className="px-3 py-1.5 border border-gray-300 text-gray-700 text-xs font-medium rounded hover:bg-gray-50"
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
      className="inline-flex items-center px-3 py-1.5 border border-red-300 bg-red-50 text-red-800 text-xs font-medium rounded-md hover:bg-red-100"
    >
      Hard-delete client
    </button>
  );
}
