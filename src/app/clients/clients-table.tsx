"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export interface ClientRow {
  id: string;
  name: string;
  size_category: string;
  industry: string;
  employee_count: number;
  engagement_model: string;
  monthly_hours: number;
  active_modules: number[];
  is_sandbox: boolean;
  status: string;
  role: string;
  created_at: string;
}

interface Props {
  clients: ClientRow[];
  industryLabels: Record<string, string>;
  sizeLabels: Record<string, string>;
  currentFilter: "active" | "archived" | "all";
}

/**
 * Portfolio table with per-row kebab actions and a bulk action bar.
 *
 * Selection is in-memory (Set<orgId>). Archive/Restore call PATCH
 * /api/clients/[orgId]; mutations refresh the route so the server
 * re-fetches and re-filters. Delete is intentionally not surfaced
 * here — it lives behind the per-client Settings → Danger Zone
 * gate (sandbox-only, typed-name confirm).
 */
export function ClientsTable({
  clients,
  industryLabels,
  sizeLabels,
  currentFilter,
}: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const allSelectedOnPage =
    clients.length > 0 && clients.every((c) => selected.has(c.id));
  const someSelected = selected.size > 0;

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (allSelectedOnPage) {
      setSelected(new Set());
    } else {
      setSelected(new Set(clients.map((c) => c.id)));
    }
  }

  function clearSelection() {
    setSelected(new Set());
  }

  async function patchStatus(orgId: string, status: "active" | "archived") {
    const res = await fetch(`/api/clients/${orgId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      // Surface details so the user sees the real cause (mirrors the
      // wire-error-details pattern from PR #3).
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
  }

  function runSingle(orgId: string, status: "active" | "archived") {
    setError(null);
    startTransition(async () => {
      try {
        await patchStatus(orgId, status);
        setSelected((prev) => {
          const next = new Set(prev);
          next.delete(orgId);
          return next;
        });
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Update failed");
      }
    });
  }

  function runBulk(status: "active" | "archived") {
    setError(null);
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    startTransition(async () => {
      try {
        // Parallel — portfolios are <50 clients in Year 1; no bulk endpoint
        // needed. If any fail we surface the first error and refresh so
        // the user can see partial-success state on the page.
        const results = await Promise.allSettled(
          ids.map((id) => patchStatus(id, status))
        );
        const firstFailure = results.find(
          (r) => r.status === "rejected"
        ) as PromiseRejectedResult | undefined;
        clearSelection();
        router.refresh();
        if (firstFailure) {
          throw firstFailure.reason;
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Bulk update failed");
      }
    });
  }

  return (
    <>
      {/* Bulk action bar. Only renders when at least one row is selected. */}
      {someSelected && (
        <div className="bg-raised border border-hair rounded-lg px-4 py-3 mb-3 flex items-center justify-between">
          <div className="text-sm text-ink">
            <span className="font-medium">{selected.size}</span>{" "}
            {selected.size === 1 ? "client" : "clients"} selected
          </div>
          <div className="flex items-center gap-2">
            {currentFilter !== "archived" && (
              <button
                type="button"
                onClick={() => runBulk("archived")}
                disabled={pending}
                className="px-3 py-1.5 border border-hair-strong text-ink text-xs font-medium rounded hover:bg-paper disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {pending ? "Archiving…" : "Archive selected"}
              </button>
            )}
            {currentFilter !== "active" && (
              <button
                type="button"
                onClick={() => runBulk("active")}
                disabled={pending}
                className="px-3 py-1.5 border border-hair-strong text-ink text-xs font-medium rounded hover:bg-paper disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {pending ? "Restoring…" : "Restore selected"}
              </button>
            )}
            <button
              type="button"
              onClick={clearSelection}
              disabled={pending}
              className="px-3 py-1.5 text-muted hover:text-ink text-xs"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-raised border border-brick rounded-lg px-4 py-2 mb-3">
          <p className="text-xs text-brick">Error: {error}</p>
        </div>
      )}

      {/* Client table */}
      <div className="bg-raised rounded-xl border border-hair overflow-hidden">
        <table className="w-full">
          <thead className="bg-paper border-b border-hair">
            <tr>
              <th className="px-4 py-3 w-10">
                <input
                  type="checkbox"
                  checked={allSelectedOnPage}
                  onChange={toggleAll}
                  aria-label="Select all rows on this page"
                  className="accent-evergreen"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                Client
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                Industry
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                Size
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                Modules
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                Hrs / mo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                Role
              </th>
              <th className="px-4 py-3 w-10" aria-label="Row actions"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hair">
            {clients.map((c) => {
              const isArchived = c.status === "archived";
              const isSelected = selected.has(c.id);
              return (
                <tr
                  key={c.id}
                  className={
                    "transition-colors " +
                    (isSelected ? "bg-paper" : "hover:bg-paper") +
                    (isArchived ? " text-muted" : "")
                  }
                >
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleOne(c.id)}
                      aria-label={`Select ${c.name}`}
                      className="accent-evergreen"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/clients/${c.id}`}
                      className={
                        "text-sm font-medium hover:text-evergreen-deep " +
                        (isArchived ? "text-muted" : "text-evergreen")
                      }
                    >
                      {c.name}
                    </Link>
                    {c.is_sandbox && (
                      <span className="ml-2 px-1.5 py-0.5 bg-amber-soft text-amber-deep rounded text-[10px] font-semibold uppercase tracking-wider">
                        Sandbox
                      </span>
                    )}
                    {isArchived && (
                      <span className="ml-2 px-1.5 py-0.5 border border-hair-strong text-muted rounded text-[10px] font-semibold uppercase tracking-wider">
                        Archived
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted">
                    {industryLabels[c.industry] ?? c.industry}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted">
                    {sizeLabels[c.size_category] ?? c.size_category}
                    <span className="text-faint ml-1">({c.employee_count})</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted">
                    {c.active_modules?.length ?? 0} of 16
                  </td>
                  <td className="px-6 py-4 text-sm text-muted">
                    {c.monthly_hours}
                  </td>
                  <td className="px-6 py-4 text-xs">
                    <span className="px-2 py-1 bg-surface text-ink rounded font-medium uppercase tracking-wider">
                      {c.role}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <RowKebab
                      client={c}
                      onArchive={() => runSingle(c.id, "archived")}
                      onRestore={() => runSingle(c.id, "active")}
                      pending={pending}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

/**
 * Per-row dropdown. Uses <details> / <summary> for a no-dep,
 * accessible-by-default disclosure. Doesn't auto-close on outside
 * click, but every menu action either navigates or refreshes the
 * page, so the lifecycle is self-resolving.
 */
function RowKebab({
  client,
  onArchive,
  onRestore,
  pending,
}: {
  client: ClientRow;
  onArchive: () => void;
  onRestore: () => void;
  pending: boolean;
}) {
  const isArchived = client.status === "archived";
  return (
    <details className="relative inline-block">
      <summary
        aria-label={`Actions for ${client.name}`}
        className="list-none cursor-pointer px-2 py-1 text-muted hover:text-ink rounded select-none"
      >
        {/* Three-dot glyph; not an icon font, just text. */}
        <span aria-hidden>···</span>
      </summary>
      <div
        role="menu"
        className="absolute right-0 top-full mt-1 z-10 w-44 bg-raised border border-hair rounded-md shadow-lg py-1"
      >
        <Link
          href={`/clients/${client.id}`}
          role="menuitem"
          className="block px-3 py-2 text-sm text-ink hover:bg-paper"
        >
          Open
        </Link>
        <Link
          href={`/clients/${client.id}/settings`}
          role="menuitem"
          className="block px-3 py-2 text-sm text-ink hover:bg-paper"
        >
          Settings
        </Link>
        <div className="border-t border-hair my-1" />
        {isArchived ? (
          <button
            type="button"
            role="menuitem"
            onClick={onRestore}
            disabled={pending}
            className="block w-full text-left px-3 py-2 text-sm text-ink hover:bg-paper disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Restore
          </button>
        ) : (
          <button
            type="button"
            role="menuitem"
            onClick={onArchive}
            disabled={pending}
            className="block w-full text-left px-3 py-2 text-sm text-ink hover:bg-paper disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Archive
          </button>
        )}
      </div>
    </details>
  );
}
