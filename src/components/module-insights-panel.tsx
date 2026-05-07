/**
 * Module Insights Panel — server component that renders the scored
 * modules for a client workspace with expandable per-stakeholder
 * narrative + path-to-next-level. Built in Phase 1C Day 9.
 *
 * Each module group shows the stakeholders who scored it, their
 * maturity level, and (collapsed by default) the AI-generated
 * narrative + 3 actions to climb to the next level.
 *
 * Designed as a server component so it doesn't ship client JS for
 * a read-mostly view; the expandable behavior uses native <details>.
 */

import { MODULE_NAMES, MODULE_META } from "@/types";

interface PathStep {
  action: string;
  source: string;
}

export interface ScoredEntry {
  stakeholder_id: string;
  stakeholder_name: string;
  stakeholder_role: string;
  module_number: number;
  maturity_score: number | null;
  module_skipped: boolean;
  evidence: string;
  narrative: string | null;
  path_to_next_level: PathStep[];
}

interface Props {
  scores: ScoredEntry[];
}

const LEVEL_LABEL: Record<number, string> = {
  1: "Initial",
  2: "Developing",
  3: "Defined",
  4: "Managed",
  5: "Optimizing",
};

const LEVEL_COLOR: Record<number, string> = {
  1: "bg-red-100 text-red-800",
  2: "bg-orange-100 text-orange-800",
  3: "bg-blue-100 text-blue-800",
  4: "bg-green-100 text-green-800",
  5: "bg-emerald-200 text-emerald-900",
};

export function ModuleInsightsPanel({ scores }: Props) {
  // Filter to scored entries (skip N/A respondents from this view — they're
  // visible in the coverage warning panel instead).
  const scored = scores.filter((s) => s.maturity_score != null && !s.module_skipped);
  if (scored.length === 0) return null;

  // Group by module
  const byModule = new Map<number, ScoredEntry[]>();
  for (const s of scored) {
    const arr = byModule.get(s.module_number) ?? [];
    arr.push(s);
    byModule.set(s.module_number, arr);
  }
  const moduleNumbers = [...byModule.keys()].sort((a, b) => a - b);

  return (
    <div className="bg-white rounded-xl border border-gray-200 mb-6">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="text-base font-semibold text-gray-900">Module insights</h3>
        <p className="text-xs text-gray-500 mt-0.5">
          Per-stakeholder scores with AI-generated narrative and path to the next level. Expand any row for the full breakdown.
        </p>
      </div>
      <div className="divide-y divide-gray-100">
        {moduleNumbers.map((mn) => {
          const entries = byModule.get(mn) ?? [];
          const moduleName = MODULE_NAMES[mn] ?? `Module ${mn}`;
          // Sort entries by stakeholder name for stable rendering
          entries.sort((a, b) => a.stakeholder_name.localeCompare(b.stakeholder_name));

          const meta = MODULE_META[mn];
          return (
            <div key={mn} className="px-6 py-4">
              <div className="flex items-baseline gap-2 mb-1 flex-wrap">
                <span className="text-xs font-mono text-gray-400">M{mn}</span>
                <h4 className="text-sm font-semibold text-gray-900">{moduleName}</h4>
                <span className="text-xs text-gray-500">
                  · {entries.length} {entries.length === 1 ? "respondent" : "respondents"}
                </span>
              </div>
              {meta && (
                <p className="text-[11px] text-gray-500 mb-3 italic">
                  Anchor: <span className="font-medium not-italic">{meta.framework}</span>
                  <span className="text-gray-400"> · &ldquo;{meta.oneLiner}&rdquo;</span>
                </p>
              )}

              <div className="space-y-2">
                {entries.map((e) => {
                  const score = e.maturity_score ?? 0;
                  const levelLabel = LEVEL_LABEL[score] ?? `L${score}`;
                  const colorClass = LEVEL_COLOR[score] ?? "bg-gray-100 text-gray-800";
                  return (
                    <details
                      key={`${e.stakeholder_id}-${mn}`}
                      className="rounded-lg border border-gray-200 bg-gray-50 hover:border-gray-300 transition-colors"
                    >
                      <summary className="cursor-pointer px-4 py-2.5 flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${colorClass}`}>
                            L{score} · {levelLabel}
                          </span>
                          <span className="text-sm text-gray-900 truncate">
                            {e.stakeholder_name}
                            <span className="text-xs text-gray-500 ml-1.5">— {e.stakeholder_role}</span>
                          </span>
                        </div>
                        <span className="text-[11px] text-gray-400">Click to read narrative →</span>
                      </summary>

                      <div className="px-4 pb-4 pt-1">
                        {e.narrative && (
                          <div className="mb-3">
                            <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Why this score</p>
                            <p className="text-sm text-gray-800 leading-relaxed">{e.narrative}</p>
                          </div>
                        )}

                        {!e.narrative && e.evidence && (
                          <div className="mb-3">
                            <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Evidence</p>
                            <p className="text-xs text-gray-700">{e.evidence}</p>
                          </div>
                        )}

                        {e.path_to_next_level.length > 0 && (
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1.5">
                              Path to L{score + 1} · {LEVEL_LABEL[score + 1] ?? ""}
                            </p>
                            <ol className="space-y-2">
                              {e.path_to_next_level.map((step, i) => (
                                <li key={i} className="flex gap-3 text-sm">
                                  <span className="flex-none w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[11px] font-bold flex items-center justify-center mt-0.5">
                                    {i + 1}
                                  </span>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-gray-800 leading-snug">{step.action}</p>
                                    <p className="text-[11px] text-gray-500 mt-0.5">
                                      Source: <span className="font-medium">{step.source}</span>
                                    </p>
                                  </div>
                                </li>
                              ))}
                            </ol>
                          </div>
                        )}

                        {score === 5 && (
                          <p className="text-xs text-emerald-700 italic mt-2">
                            ✓ At the maturity ceiling for this module — focus on holding the position and surfacing what made it work.
                          </p>
                        )}
                      </div>
                    </details>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
