"use client";

import { useMemo, useState } from "react";
import {
  type Selection,
  type SelectionCandidate,
  scoreSelection,
  DIMENSION_LABEL,
} from "@/types/selection";

interface SelectionEditorProps {
  initialSelection: Selection;
}

function emptyCandidate(criterionIds: string[]): SelectionCandidate {
  const scores: Record<string, number> = {};
  for (const id of criterionIds) scores[id] = 3;
  return {
    id: crypto.randomUUID(),
    name: "",
    summary: null,
    scores,
    notes: null,
    is_recommended: false,
  };
}

export function SelectionEditor({ initialSelection }: SelectionEditorProps) {
  const [selection, setSelection] = useState<Selection>(initialSelection);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendation, setRecommendation] = useState<string>(
    initialSelection.recommendation ?? ""
  );

  const summaries = useMemo(() => scoreSelection(selection), [selection]);

  const update = (patch: Partial<Selection>) => {
    setSelection((prev) => ({ ...prev, ...patch }));
  };

  const addCandidate = () => {
    const c = emptyCandidate(selection.criteria.map((cr) => cr.id));
    update({ candidates: [...selection.candidates, c] });
  };

  const removeCandidate = (id: string) => {
    update({ candidates: selection.candidates.filter((c) => c.id !== id) });
  };

  const updateCandidate = (id: string, patch: Partial<SelectionCandidate>) => {
    update({
      candidates: selection.candidates.map((c) =>
        c.id === id ? { ...c, ...patch } : c
      ),
    });
  };

  const updateScore = (
    candidateId: string,
    criterionId: string,
    score: number
  ) => {
    update({
      candidates: selection.candidates.map((c) =>
        c.id === candidateId
          ? { ...c, scores: { ...c.scores, [criterionId]: score } }
          : c
      ),
    });
  };

  const setCriterionWeight = (criterionId: string, weight: number) => {
    update({
      criteria: selection.criteria.map((cr) =>
        cr.id === criterionId ? { ...cr, weight } : cr
      ),
    });
  };

  const persist = async (extra?: Partial<Selection>) => {
    setSaving(true);
    setError(null);
    try {
      const body = {
        criteria: selection.criteria,
        candidates: selection.candidates,
        recommendation: recommendation.trim() || null,
        ...extra,
      };
      const res = await fetch(`/api/selections/${selection.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error ?? `HTTP ${res.status}`);
      }
      const j = await res.json();
      setSelection(j.selection as Selection);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const recommendCandidate = (id: string) => {
    update({
      candidates: selection.candidates.map((c) => ({
        ...c,
        is_recommended: c.id === id,
      })),
    });
  };

  const decide = async () => {
    const recId =
      selection.candidates.find((c) => c.is_recommended)?.id ?? null;
    await persist({
      status: "decided",
      decided_candidate_id: recId,
    });
  };

  const recommendAndSave = async () => {
    await persist({ status: "recommended" });
  };

  return (
    <div className="space-y-6">
      {/* Criteria weights */}
      <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">
            Criteria ({selection.criteria.length})
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Adjust weights (0-5). 0 disables a criterion. Defaults are seeded
            from the domain template.
          </p>
        </div>
        <ul className="divide-y divide-gray-100">
          {selection.criteria.map((c) => (
            <li
              key={c.id}
              className="px-5 py-3 flex items-center gap-4"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">{c.name}</p>
                <p className="text-[10px] uppercase tracking-wide text-gray-400 mt-0.5">
                  {DIMENSION_LABEL[c.dimension]}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] text-gray-500">Weight</span>
                <select
                  value={c.weight}
                  onChange={(e) =>
                    setCriterionWeight(c.id, Number(e.target.value))
                  }
                  className="px-2 py-1 border border-gray-300 rounded text-sm bg-white"
                >
                  {[0, 1, 2, 3, 4, 5].map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Candidates */}
      <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">
              Candidates ({selection.candidates.length})
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Up to 10. Score each criterion 1-5 per candidate. Mark one as
              recommended before recording the decision.
            </p>
          </div>
          <button
            type="button"
            onClick={addCandidate}
            disabled={selection.candidates.length >= 10}
            className="px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            + Add candidate
          </button>
        </div>

        {selection.candidates.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-gray-500 italic">
            No candidates yet. Add at least 2 to score against each other.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {selection.candidates.map((c) => {
              const summary = summaries.find((s) => s.candidateId === c.id);
              return (
                <li key={c.id} className="px-5 py-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <input
                        value={c.name}
                        onChange={(e) =>
                          updateCandidate(c.id, { name: e.target.value })
                        }
                        placeholder="Candidate name (vendor, build option, etc.)"
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                      />
                      <textarea
                        value={c.summary ?? ""}
                        onChange={(e) =>
                          updateCandidate(c.id, {
                            summary: e.target.value || null,
                          })
                        }
                        placeholder="Summary / what they bring (optional)"
                        rows={2}
                        className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    {summary && (
                      <div className="shrink-0 text-right">
                        <p className="text-2xl font-bold text-blue-700">
                          {summary.percent}%
                        </p>
                        <p className="text-[10px] text-gray-500">
                          {summary.weightedTotal} / {summary.maxPossible}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                    {selection.criteria.map((cr) => (
                      <label
                        key={cr.id}
                        className="flex items-center gap-2 text-xs"
                      >
                        <span
                          className="flex-1 truncate text-gray-700"
                          title={cr.name}
                        >
                          {cr.name}
                          <span className="text-gray-400">
                            {" "}
                            (w{cr.weight})
                          </span>
                        </span>
                        <select
                          value={c.scores[cr.id] ?? 3}
                          onChange={(e) =>
                            updateScore(c.id, cr.id, Number(e.target.value))
                          }
                          className="px-1.5 py-0.5 border border-gray-300 rounded text-xs bg-white"
                        >
                          {[1, 2, 3, 4, 5].map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </label>
                    ))}
                  </div>

                  <textarea
                    value={c.notes ?? ""}
                    onChange={(e) =>
                      updateCandidate(c.id, {
                        notes: e.target.value || null,
                      })
                    }
                    placeholder="Notes (optional)"
                    rows={2}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                  />

                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <label className="flex items-center gap-2 text-xs text-gray-700">
                      <input
                        type="checkbox"
                        checked={c.is_recommended}
                        onChange={() => recommendCandidate(c.id)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      Mark as recommended
                    </label>
                    <button
                      type="button"
                      onClick={() => removeCandidate(c.id)}
                      className="text-[11px] text-gray-400 hover:text-red-600"
                    >
                      Remove candidate
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Recommendation narrative */}
      <section className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-2">
          Recommendation narrative
        </h2>
        <p className="text-xs text-gray-500 mb-3">
          The text the practitioner gives the client to defend the decision.
          Hard-dollar / risk / framework citations encouraged. This becomes
          the body of the Decision Package.
        </p>
        <textarea
          value={recommendation}
          onChange={(e) => setRecommendation(e.target.value)}
          rows={6}
          placeholder="e.g., Recommend Vendor X over Vendor Y. Vendor X scores 80% on weighted criteria vs Vendor Y at 65%. The decisive factors are integration with the existing stack (5/5 vs 2/5) and switching cost (4/5 vs 2/5). The TCO delta over 3 years is ~$80K in Vendor X's favor (sources: vendor-published list pricing + 2 peer references). Risk: Vendor X is a smaller company; mitigated by quarterly executive review + contractual SLA."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </section>

      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => persist()}
          disabled={saving}
          className={`px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg ${
            saving ? "opacity-50 cursor-wait" : "hover:bg-gray-50"
          }`}
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
        <button
          type="button"
          onClick={recommendAndSave}
          disabled={
            saving ||
            !selection.candidates.some((c) => c.is_recommended) ||
            !recommendation.trim()
          }
          className="px-4 py-2 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          Lock as Recommendation
        </button>
        <button
          type="button"
          onClick={decide}
          disabled={
            saving ||
            !selection.candidates.some((c) => c.is_recommended) ||
            !recommendation.trim()
          }
          className="px-4 py-2 text-sm font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          Record Decision
        </button>
      </div>
      <p className="text-[11px] text-gray-400">
        Lock as Recommendation = the practitioner&apos;s formal recommendation
        to the client; Record Decision = the client has chosen, the selection
        is closed.
      </p>
    </div>
  );
}
