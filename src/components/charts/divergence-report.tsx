"use client";

import type { DivergencePoint } from "@/types";

interface DivergenceReportProps {
  divergences: DivergencePoint[];
}

export function DivergenceReport({ divergences }: DivergenceReportProps) {
  if (divergences.length === 0) {
    return (
      <div className="p-6 bg-green-50 border border-green-200 rounded-xl">
        <h3 className="text-lg font-semibold text-green-800">
          Leadership Alignment: Strong
        </h3>
        <p className="text-sm text-green-600 mt-1">
          No significant divergences detected. Your leadership team has a consistent
          view of the organization's digital maturity.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <h3 className="text-lg font-semibold text-amber-800">
          Alignment Opportunities: {divergences.length} Divergence{divergences.length > 1 ? "s" : ""} Detected
        </h3>
        <p className="text-sm text-amber-600 mt-1">
          Your leadership team has differing views on these areas. The Decision
          Packages below present objective data to facilitate alignment — focusing
          on what the evidence says, not who is right.
        </p>
      </div>

      {divergences.map((d, i) => (
        <div
          key={i}
          className="border border-gray-200 rounded-xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-900">
                Module {d.module_number}: {d.module_name}
              </h4>
              <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">
                Gap: {d.score_gap} levels
              </span>
            </div>
          </div>

          {/* Stakeholder positions */}
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-700 font-bold text-lg">
                    {d.stakeholder_a.score}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-sm">{d.stakeholder_a.name}</p>
                  <p className="text-xs text-gray-500">Level {d.stakeholder_a.score}/5</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">{d.stakeholder_a.evidence}</p>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <span className="text-purple-700 font-bold text-lg">
                    {d.stakeholder_b.score}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-sm">{d.stakeholder_b.name}</p>
                  <p className="text-xs text-gray-500">Level {d.stakeholder_b.score}/5</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">{d.stakeholder_b.evidence}</p>
            </div>
          </div>

          {/* Framework recommendation */}
          <div className="bg-blue-50 px-6 py-4 border-t border-gray-200">
            <p className="text-xs font-medium text-blue-800 uppercase tracking-wide mb-1">
              Framework Recommendation
            </p>
            <p className="text-sm text-blue-900">{d.framework_recommendation}</p>
          </div>

          {/* Projected ROI */}
          <div className="bg-green-50 px-6 py-4 border-t border-gray-100">
            <p className="text-xs font-medium text-green-800 uppercase tracking-wide mb-1">
              Projected ROI
            </p>
            <p className="text-sm text-green-900">{d.projected_roi}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
