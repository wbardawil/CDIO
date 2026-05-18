"use client";

import type { DivergencePoint } from "@/types";

interface DivergenceReportProps {
  divergences: DivergencePoint[];
}

export function DivergenceReport({ divergences }: DivergenceReportProps) {
  if (divergences.length === 0) {
    return (
      <div className="p-6 bg-evergreen-soft border border-evergreen rounded-xl">
        <h3 className="text-lg font-semibold text-evergreen-deep">
          Leadership Alignment: Strong
        </h3>
        <p className="text-sm text-evergreen mt-1">
          No significant divergences detected. Your leadership team has a consistent
          view of the organization's digital maturity.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="p-4 bg-amber-soft border border-amber rounded-xl">
        <h3 className="text-lg font-semibold text-amber-deep">
          Alignment Opportunities: {divergences.length} Divergence{divergences.length > 1 ? "s" : ""} Detected
        </h3>
        <p className="text-sm text-amber-deep mt-1">
          Your leadership team has differing views on these areas. The Decision
          Packages below present objective data to facilitate alignment — focusing
          on what the evidence says, not who is right.
        </p>
      </div>

      {divergences.map((d, i) => (
        <div
          key={i}
          className="border border-hair rounded-xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-paper px-6 py-4 border-b border-hair">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-ink">
                Module {d.module_number}: {d.module_name}
              </h4>
              <span className="px-3 py-1 bg-amber-soft text-amber-deep rounded-full text-xs font-medium">
                Gap: {d.score_gap} levels
              </span>
            </div>
          </div>

          {/* Stakeholder positions */}
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-hair">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-full bg-evergreen-soft flex items-center justify-center">
                  <span className="text-evergreen font-bold text-lg">
                    {d.stakeholder_a.score}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-sm">{d.stakeholder_a.name}</p>
                  <p className="text-xs text-muted">Level {d.stakeholder_a.score}/5</p>
                </div>
              </div>
              <p className="text-sm text-muted">{d.stakeholder_a.evidence}</p>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-full bg-evergreen-soft flex items-center justify-center">
                  <span className="text-evergreen font-bold text-lg">
                    {d.stakeholder_b.score}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-sm">{d.stakeholder_b.name}</p>
                  <p className="text-xs text-muted">Level {d.stakeholder_b.score}/5</p>
                </div>
              </div>
              <p className="text-sm text-muted">{d.stakeholder_b.evidence}</p>
            </div>
          </div>

          {/* Framework recommendation */}
          <div className="bg-evergreen-soft px-6 py-4 border-t border-hair">
            <p className="text-xs font-medium text-evergreen-deep uppercase tracking-wide mb-1">
              Framework Recommendation
            </p>
            <p className="text-sm text-evergreen-deep">{d.framework_recommendation}</p>
          </div>

          {/* Projected ROI */}
          <div className="bg-evergreen-soft px-6 py-4 border-t border-hair">
            <p className="text-xs font-medium text-evergreen-deep uppercase tracking-wide mb-1">
              Projected ROI
            </p>
            <p className="text-sm text-evergreen-deep">{d.projected_roi}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
