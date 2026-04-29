"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MODULE_NAMES } from "@/types";

interface Stakeholder {
  id: string;
  name: string;
  email: string;
  role: string;
  influence_level?: string | null;
  relevant_modules: number[];
}

interface Props {
  stakeholder: Stakeholder;
  onClose: () => void;
}

const COMMON_ROLES = [
  "CEO", "President", "Owner / Founder", "COO", "CFO",
  "CIO", "CTO", "CDIO", "CDO", "CISO",
  "IT Director", "Head of IT",
  "VP Engineering", "VP Operations", "VP Product", "Product Director",
  "Head of Data", "Head of People",
];

const INFLUENCE_LEVELS = [
  { value: "decision_maker", label: "Decision-maker" },
  { value: "influencer", label: "Influencer" },
  { value: "contributor", label: "Contributor" },
];

export function EditStakeholderModal({ stakeholder, onClose }: Props) {
  const router = useRouter();
  const [name, setName] = useState(stakeholder.name);
  const [email, setEmail] = useState(stakeholder.email);
  const [role, setRole] = useState(stakeholder.role);
  const [influence, setInfluence] = useState<string>(stakeholder.influence_level ?? "contributor");
  const [recomputeModules, setRecomputeModules] = useState(true);
  const [overrideModules, setOverrideModules] = useState(false);
  const [modules, setModules] = useState<number[]>(stakeholder.relevant_modules);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleModule = (n: number) => {
    setModules((prev) => (prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n].sort((a, b) => a - b)));
  };

  const onSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const body: Record<string, unknown> = {};
      if (name !== stakeholder.name) body.name = name;
      if (email !== stakeholder.email) body.email = email;
      if (role !== stakeholder.role) body.role = role;
      if (influence !== (stakeholder.influence_level ?? "contributor")) body.influence_level = influence;
      if (overrideModules) {
        body.relevant_modules = modules;
      } else if (role !== stakeholder.role) {
        body.recompute_modules_from_role = recomputeModules;
      }

      if (Object.keys(body).length === 0) {
        onClose();
        return;
      }

      const res = await fetch(`/api/stakeholders/by-id/${stakeholder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? `HTTP ${res.status}`);
      onClose();
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Edit stakeholder</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={COMMON_ROLES.includes(role) ? role : "Other"}
              onChange={(e) => {
                const val = e.target.value;
                if (val !== "Other") setRole(val);
              }}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
            >
              {COMMON_ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
              <option value="Other">Other (type below)</option>
            </select>
            {!COMMON_ROLES.includes(role) && (
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Custom role title"
                className="mt-2 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
              />
            )}
            {role !== stakeholder.role && !overrideModules && (
              <p className="text-xs text-blue-600 mt-1">
                Role changed — relevant modules will auto-recompute on save.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Influence level</label>
            <select
              value={influence}
              onChange={(e) => setInfluence(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
            >
              {INFLUENCE_LEVELS.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Decision-makers carry more weight in synthesis. Influencers next, then contributors.
            </p>
          </div>

          <div>
            <label className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                checked={overrideModules}
                onChange={(e) => setOverrideModules(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <span className="text-sm font-medium text-gray-700">Customize modules manually</span>
            </label>
            {overrideModules && (
              <div className="grid grid-cols-2 gap-1 max-h-48 overflow-y-auto border border-gray-100 rounded p-2">
                {Array.from({ length: 16 }, (_, i) => i + 1).map((n) => (
                  <label key={n} className="flex items-center gap-2 text-xs py-1">
                    <input
                      type="checkbox"
                      checked={modules.includes(n)}
                      onChange={() => toggleModule(n)}
                      className="h-3.5 w-3.5"
                    />
                    <span className="truncate">{n}. {MODULE_NAMES[n]}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
