"use client";

import { useState } from "react";

interface McpTokenRow {
  id: string;
  created_at: string;
  token: string;
  label: string | null;
  expires_at: string | null;
  revoked_at: string | null;
  last_used_at: string | null;
  use_count: number;
}

interface McpTokenManagerProps {
  initialTokens: McpTokenRow[];
}

export function McpTokenManager({ initialTokens }: McpTokenManagerProps) {
  const [tokens, setTokens] = useState<McpTokenRow[]>(initialTokens);
  const [label, setLabel] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [revealedId, setRevealedId] = useState<string | null>(null);

  const issue = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/mcp-tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: label.trim() || null,
          expires_in_days: 180,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error ?? `HTTP ${res.status}`);
      }
      const j = await res.json();
      setTokens((prev) => [j.mcp_token, ...prev]);
      setRevealedId(j.mcp_token.id);
      setLabel("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Issue failed");
    } finally {
      setBusy(false);
    }
  };

  const revoke = async (id: string) => {
    if (!confirm("Revoke this token? Apps using it will stop working.")) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/mcp-tokens?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error ?? `HTTP ${res.status}`);
      }
      setTokens((prev) =>
        prev.map((t) =>
          t.id === id
            ? { ...t, revoked_at: new Date().toISOString() }
            : t
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Revoke failed");
    } finally {
      setBusy(false);
    }
  };

  const copy = async (token: string) => {
    try {
      await navigator.clipboard.writeText(token);
    } catch {
      /* user can copy manually */
    }
  };

  return (
    <section className="bg-white rounded-xl border border-gray-200 p-5">
      <h2 className="text-sm font-semibold text-gray-900 mb-3">
        Your tokens ({tokens.filter((t) => !t.revoked_at).length} active)
      </h2>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Label (e.g. Claude.ai, Cursor)"
          maxLength={200}
          className="flex-1 min-w-[180px] px-3 py-2 border border-gray-300 rounded-lg text-sm"
        />
        <button
          type="button"
          onClick={issue}
          disabled={busy}
          className="px-3 py-2 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {busy ? "Issuing..." : "+ Issue token (180-day)"}
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-600 mb-3">{error}</p>
      )}

      {tokens.length === 0 ? (
        <p className="text-sm text-gray-500 italic">
          No tokens yet. Issue one above to start calling AI-CDIO from your AI
          surface of choice.
        </p>
      ) : (
        <ul className="space-y-2">
          {tokens.map((t) => {
            const isRevoked = !!t.revoked_at;
            const isExpired =
              !!t.expires_at && new Date(t.expires_at).getTime() < Date.now();
            const reveal = revealedId === t.id;
            return (
              <li
                key={t.id}
                className={`border rounded-lg p-3 ${
                  isRevoked || isExpired
                    ? "border-gray-200 bg-gray-50 opacity-60"
                    : "border-gray-200 bg-white"
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-1">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900">
                      {t.label ?? "MCP token"}
                    </p>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Issued {t.created_at.slice(0, 10)}
                      {t.expires_at
                        ? ` · ${isExpired ? "Expired" : "Expires"} ${t.expires_at.slice(0, 10)}`
                        : ""}
                      {t.last_used_at
                        ? ` · Last used ${t.last_used_at.slice(0, 10)}`
                        : " · Never used"}
                      {" · "}
                      {t.use_count} call{t.use_count === 1 ? "" : "s"}
                    </p>
                  </div>
                  {!isRevoked && !isExpired && (
                    <button
                      type="button"
                      onClick={() => revoke(t.id)}
                      className="text-[11px] text-gray-400 hover:text-red-600"
                    >
                      Revoke
                    </button>
                  )}
                  {isRevoked && (
                    <span className="text-[11px] text-red-600 font-medium">
                      Revoked
                    </span>
                  )}
                  {isExpired && !isRevoked && (
                    <span className="text-[11px] text-amber-700 font-medium">
                      Expired
                    </span>
                  )}
                </div>

                {!isRevoked && !isExpired && (
                  <div className="mt-1 flex items-center gap-2 flex-wrap">
                    {reveal ? (
                      <code className="flex-1 min-w-0 bg-gray-50 border border-gray-200 rounded px-2 py-1 text-[10px] break-all">
                        {t.token}
                      </code>
                    ) : (
                      <code className="flex-1 min-w-0 bg-gray-50 border border-gray-200 rounded px-2 py-1 text-[10px]">
                        ••••••••••••••••••••••••••••••••
                      </code>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        setRevealedId((id) => (id === t.id ? null : t.id))
                      }
                      className="text-[11px] text-gray-600 hover:text-gray-900"
                    >
                      {reveal ? "Hide" : "Reveal"}
                    </button>
                    {reveal && (
                      <button
                        type="button"
                        onClick={() => copy(t.token)}
                        className="text-[11px] text-blue-700 hover:underline"
                      >
                        Copy
                      </button>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
