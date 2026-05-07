/**
 * Decision Packages Panel — server component that surfaces the
 * divergence-driven Decision Packages as hero artifacts in the
 * workspace. Built in Phase 1C Day 10.
 *
 * A Decision Package is generated automatically by the synthesis route
 * whenever two stakeholders' maturity scores diverge by 2+ levels in
 * a single module. Today they live in divergence_points.decision_package
 * and are only visible buried inside the legacy dashboard. This panel
 * pulls them to the surface where the practitioner reviews engagement
 * state.
 *
 * Each card shows:
 *   - The module + the score gap
 *   - Both stakeholders side-by-side with their level, role, and evidence
 *   - The framework recommendation (the playbook's view)
 *   - The projected ROI of acting vs deferring
 *   - A resolve form (capture what was actually decided)
 *
 * Resolved packages collapse to a green confirmation row; unresolved
 * ones stay open and prominent.
 */

import { MODULE_NAMES } from "@/types";
import { ResolveDecisionForm } from "@/components/resolve-decision-form";

export interface DecisionPackage {
  id: string;
  module_number: number;
  score_gap: number;
  framework_recommendation: string;
  decision_package: {
    projected_roi?: string;
    stakeholder_a?: {
      id: string;
      name: string;
      role?: string;
      score: number;
      evidence: string;
    };
    stakeholder_b?: {
      id: string;
      name: string;
      role?: string;
      score: number;
      evidence: string;
    };
  };
  resolution: string | null;
  resolved_at: string | null;
}

interface Props {
  decisionPackages: DecisionPackage[];
}

const LEVEL_COLOR: Record<number, string> = {
  1: "bg-red-100 text-red-800",
  2: "bg-orange-100 text-orange-800",
  3: "bg-blue-100 text-blue-800",
  4: "bg-green-100 text-green-800",
  5: "bg-emerald-200 text-emerald-900",
};

export function DecisionPackagesPanel({ decisionPackages }: Props) {
  if (decisionPackages.length === 0) return null;

  // Sort: unresolved first, then most recently resolved.
  const sorted = [...decisionPackages].sort((a, b) => {
    if (!a.resolved_at && b.resolved_at) return -1;
    if (a.resolved_at && !b.resolved_at) return 1;
    return (b.resolved_at ?? "").localeCompare(a.resolved_at ?? "");
  });

  const unresolvedCount = sorted.filter((d) => !d.resolved_at).length;

  return (
    <div className="bg-white rounded-xl border-2 border-purple-200 mb-6 shadow-sm">
      <div className="px-6 py-4 border-b border-purple-100 bg-purple-50 rounded-t-xl">
        <div className="flex items-baseline gap-3 flex-wrap">
          <h3 className="text-base font-semibold text-purple-900">
            Decision Packages
          </h3>
          <span className="text-xs text-purple-700">
            {unresolvedCount > 0
              ? `${unresolvedCount} pending · ${sorted.length - unresolvedCount} resolved`
              : `All ${sorted.length} resolved`}
          </span>
        </div>
        <p className="text-xs text-purple-800 mt-1">
          When stakeholders see the same area differently, the playbook proposes a path. Capture what the team decides — these become your engagement&apos;s permanent record of what changed and why.
        </p>
      </div>

      <div className="divide-y divide-gray-100">
        {sorted.map((d) => {
          const a = d.decision_package.stakeholder_a;
          const b = d.decision_package.stakeholder_b;
          const moduleName = MODULE_NAMES[d.module_number] ?? `Module ${d.module_number}`;
          const isResolved = Boolean(d.resolved_at);
          const aColor = a ? LEVEL_COLOR[a.score] ?? "bg-gray-100 text-gray-800" : "bg-gray-100 text-gray-800";
          const bColor = b ? LEVEL_COLOR[b.score] ?? "bg-gray-100 text-gray-800" : "bg-gray-100 text-gray-800";

          return (
            <div
              key={d.id}
              className={`px-6 py-5 ${isResolved ? "bg-gray-50/50" : ""}`}
            >
              {/* Header */}
              <div className="flex items-baseline gap-2 flex-wrap mb-3">
                <span className="text-xs font-mono text-gray-400">M{d.module_number}</span>
                <h4 className={`text-sm font-semibold ${isResolved ? "text-gray-600" : "text-gray-900"}`}>
                  {moduleName}
                </h4>
                <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded font-medium">
                  Gap: {d.score_gap} {d.score_gap === 1 ? "level" : "levels"}
                </span>
              </div>

              {/* Two stakeholders side-by-side */}
              {a && b && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  {[a, b].map((sh, idx) => {
                    const color = idx === 0 ? aColor : bColor;
                    return (
                      <div key={sh.id} className="rounded-lg border border-gray-200 p-3">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${color}`}>
                            L{sh.score}
                          </span>
                          <span className="text-sm font-medium text-gray-900">{sh.name}</span>
                          {sh.role && <span className="text-xs text-gray-500">— {sh.role}</span>}
                        </div>
                        <p className="text-xs text-gray-700 leading-relaxed line-clamp-4">
                          {sh.evidence}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Framework recommendation */}
              <div className="mb-3">
                <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1">
                  What the playbook recommends
                </p>
                <p className="text-sm text-gray-800 leading-relaxed">
                  {d.framework_recommendation}
                </p>
              </div>

              {/* Projected ROI */}
              {d.decision_package.projected_roi && d.decision_package.projected_roi !== "To be calculated" && (
                <div className="mb-4">
                  <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1">
                    Projected impact
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {d.decision_package.projected_roi}
                  </p>
                </div>
              )}

              {/* Resolve / show resolution */}
              <ResolveDecisionForm
                decisionId={d.id}
                initialResolution={d.resolution}
                initialResolvedAt={d.resolved_at}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
