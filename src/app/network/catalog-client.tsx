"use client";

import { useMemo, useState } from "react";
import {
  type CatalogEntryType,
  type NetworkCatalogEntry,
  ENTRY_TYPE_LABEL,
} from "@/types/network-catalog";

interface NetworkCatalogClientProps {
  initialEntries: NetworkCatalogEntry[];
}

interface DraftEntry {
  entry_type: CatalogEntryType;
  name: string;
  category: string;
  website: string;
  contact_name: string;
  contact_email: string;
  pricing_notes: string;
  private_notes: string;
  rating: string;
  engagements_used: string;
  tags: string;
  last_engaged_at: string;
}

function emptyDraft(): DraftEntry {
  return {
    entry_type: "vendor",
    name: "",
    category: "",
    website: "",
    contact_name: "",
    contact_email: "",
    pricing_notes: "",
    private_notes: "",
    rating: "",
    engagements_used: "0",
    tags: "",
    last_engaged_at: "",
  };
}

export function NetworkCatalogClient({
  initialEntries,
}: NetworkCatalogClientProps) {
  const [entries, setEntries] = useState<NetworkCatalogEntry[]>(initialEntries);
  const [filter, setFilter] = useState<CatalogEntryType | "all">("all");
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [draft, setDraft] = useState<DraftEntry>(emptyDraft());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      if (filter !== "all" && e.entry_type !== filter) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const blob =
          `${e.name} ${e.category ?? ""} ${e.tags.join(" ")} ${e.contact_name ?? ""}`.toLowerCase();
        if (!blob.includes(q)) return false;
      }
      return true;
    });
  }, [entries, filter, search]);

  const create = async () => {
    if (!draft.name.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/network-catalog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entry_type: draft.entry_type,
          name: draft.name.trim(),
          category: draft.category.trim() || null,
          website: draft.website.trim() || null,
          contact_name: draft.contact_name.trim() || null,
          contact_email: draft.contact_email.trim() || null,
          pricing_notes: draft.pricing_notes.trim() || null,
          private_notes: draft.private_notes.trim() || null,
          rating: draft.rating ? Number(draft.rating) : null,
          engagements_used: draft.engagements_used
            ? Number(draft.engagements_used)
            : 0,
          tags: draft.tags
            .split(",")
            .map((t) => t.trim().toLowerCase())
            .filter((t) => t.length > 0),
          last_engaged_at: draft.last_engaged_at || null,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error ?? `HTTP ${res.status}`);
      }
      const j = await res.json();
      setEntries((prev) => [j.entry, ...prev]);
      setDraft(emptyDraft());
      setShowCreate(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    if (
      !confirm(
        "Delete this entry from your private catalog? This cannot be undone."
      )
    ) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/network-catalog/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error ?? `HTTP ${res.status}`);
      }
      setEntries((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name / category / tag / contact"
          className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={filter}
          onChange={(e) =>
            setFilter(e.target.value as CatalogEntryType | "all")
          }
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All types</option>
          <option value="vendor">Vendors</option>
          <option value="partner">Partners</option>
          <option value="individual">Individuals</option>
        </select>
        <button
          type="button"
          onClick={() => setShowCreate((v) => !v)}
          className="px-3 py-2 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {showCreate ? "Cancel" : "+ New entry"}
        </button>
      </div>

      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
          {error}
        </div>
      )}

      {showCreate && (
        <section className="bg-white rounded-xl border border-blue-300 p-5 space-y-3">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">
            Add a new entry to your private catalog
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-1">
                Type
              </label>
              <select
                value={draft.entry_type}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    entry_type: e.target.value as CatalogEntryType,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
              >
                <option value="vendor">Vendor</option>
                <option value="partner">Partner</option>
                <option value="individual">Individual</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-1">
                Name
              </label>
              <input
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="e.g., Vanta, Datadog, Acme Consulting"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-1">
                Category
              </label>
              <input
                value={draft.category}
                onChange={(e) =>
                  setDraft({ ...draft, category: e.target.value })
                }
                placeholder="e.g., SOC 2 automation, observability"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-1">
                Website
              </label>
              <input
                value={draft.website}
                onChange={(e) =>
                  setDraft({ ...draft, website: e.target.value })
                }
                placeholder="https://..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-1">
                Contact name
              </label>
              <input
                value={draft.contact_name}
                onChange={(e) =>
                  setDraft({ ...draft, contact_name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-1">
                Contact email
              </label>
              <input
                value={draft.contact_email}
                onChange={(e) =>
                  setDraft({ ...draft, contact_email: e.target.value })
                }
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-1">
                Rating (1-5)
              </label>
              <select
                value={draft.rating}
                onChange={(e) =>
                  setDraft({ ...draft, rating: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
              >
                <option value="">— Unrated —</option>
                <option value="1">1 · Avoid</option>
                <option value="2">2 · Below bar</option>
                <option value="3">3 · OK</option>
                <option value="4">4 · Recommend</option>
                <option value="5">5 · Recommend without hesitation</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-1">
                Engagements used
              </label>
              <input
                value={draft.engagements_used}
                onChange={(e) =>
                  setDraft({ ...draft, engagements_used: e.target.value })
                }
                type="number"
                min={0}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-1">
                Tags (comma-separated)
              </label>
              <input
                value={draft.tags}
                onChange={(e) => setDraft({ ...draft, tags: e.target.value })}
                placeholder="e.g., security, compliance, smb-friendly"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-1">
                Pricing notes (private)
              </label>
              <textarea
                value={draft.pricing_notes}
                onChange={(e) =>
                  setDraft({ ...draft, pricing_notes: e.target.value })
                }
                rows={2}
                placeholder="Pricing tiers / negotiated discounts / contract notes"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-1">
                Private notes
              </label>
              <textarea
                value={draft.private_notes}
                onChange={(e) =>
                  setDraft({ ...draft, private_notes: e.target.value })
                }
                rows={3}
                placeholder="What you'd want to remember the next time you evaluate this — strengths, weaknesses, deal-killers, who to call when things go wrong."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={create}
              disabled={busy || !draft.name.trim()}
              className="px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400"
            >
              {busy ? "Saving..." : "Save entry"}
            </button>
          </div>
        </section>
      )}

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
          <p className="text-sm text-gray-500">
            {entries.length === 0
              ? "Your catalog is empty. Add your first entry above."
              : "No entries match this filter."}
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((e) => (
            <li
              key={e.id}
              className="bg-white rounded-xl border border-gray-200 p-5"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0">
                  <p className="text-base font-semibold text-gray-900">
                    {e.name}
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600 border border-gray-200 uppercase">
                      {ENTRY_TYPE_LABEL[e.entry_type]}
                    </span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {e.category ?? "Uncategorized"}
                    {e.engagements_used > 0
                      ? ` · ${e.engagements_used} engagement${e.engagements_used === 1 ? "" : "s"}`
                      : ""}
                    {e.last_engaged_at
                      ? ` · Last engaged ${e.last_engaged_at}`
                      : ""}
                  </p>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  {e.rating !== null && (
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                        e.rating >= 4
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : e.rating === 3
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {e.rating} / 5
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => remove(e.id)}
                    disabled={busy}
                    className="text-[11px] text-gray-400 hover:text-red-600 disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {(e.contact_name || e.contact_email || e.website) && (
                <p className="text-xs text-gray-600 mb-2">
                  {e.contact_name ?? ""}
                  {e.contact_name && e.contact_email ? " · " : ""}
                  {e.contact_email ? (
                    <a
                      className="text-blue-700 hover:underline"
                      href={`mailto:${e.contact_email}`}
                    >
                      {e.contact_email}
                    </a>
                  ) : (
                    ""
                  )}
                  {(e.contact_name || e.contact_email) && e.website
                    ? " · "
                    : ""}
                  {e.website ? (
                    <a
                      className="text-blue-700 hover:underline"
                      href={e.website}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {e.website.replace(/^https?:\/\//, "")}
                    </a>
                  ) : (
                    ""
                  )}
                </p>
              )}

              {e.pricing_notes && (
                <p className="text-xs text-gray-700 bg-gray-50 border border-gray-100 rounded p-2 mb-2">
                  <span className="font-semibold">Pricing: </span>
                  {e.pricing_notes}
                </p>
              )}

              {e.private_notes && (
                <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap mb-2">
                  {e.private_notes}
                </p>
              )}

              {e.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {e.tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-50 text-purple-700 border border-purple-200"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Reserve editingId for an inline-edit pass; today only delete + create are surfaced. */}
      {editingId && null}
    </div>
  );
}
