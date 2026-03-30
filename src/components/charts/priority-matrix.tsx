"use client";

import { MODULE_NAMES } from "@/types";
import type { PriorityClass } from "@/types";

interface PriorityMatrixProps {
  modules: {
    module_number: number;
    consensus_score: number;
    business_impact: number;
    priority_class: PriorityClass;
  }[];
}

const PRIORITY_COLORS: Record<PriorityClass, string> = {
  top_priority: "bg-red-500 text-white",
  strategic_bet: "bg-amber-500 text-white",
  quick_win: "bg-green-500 text-white",
  maintain: "bg-blue-400 text-white",
  defer: "bg-gray-300 text-gray-700",
};

const PRIORITY_LABELS: Record<PriorityClass, string> = {
  top_priority: "Top Priority",
  strategic_bet: "Strategic Bet",
  quick_win: "Quick Win",
  maintain: "Maintain",
  defer: "Defer",
};

export function PriorityMatrix({ modules }: PriorityMatrixProps) {
  // Scale scores to pixel positions in a 400x400 grid
  const maxImpact = 10;
  const maxMaturity = 4;

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-center mb-4">
        Priority Matrix: Business Impact vs Maturity
      </h3>

      {/* Matrix visualization */}
      <div className="relative mx-auto" style={{ width: 480, height: 480 }}>
        {/* Quadrant labels */}
        <div className="absolute top-2 left-2 text-xs font-medium text-red-600 opacity-60">
          TOP PRIORITY
        </div>
        <div className="absolute top-2 right-2 text-xs font-medium text-blue-600 opacity-60">
          MAINTAIN
        </div>
        <div className="absolute bottom-8 left-2 text-xs font-medium text-gray-400 opacity-60">
          DEFER
        </div>
        <div className="absolute bottom-8 right-2 text-xs font-medium text-green-600 opacity-60">
          QUICK WIN
        </div>

        {/* Grid lines */}
        <svg width={480} height={440} className="absolute top-0 left-0">
          {/* Background */}
          <rect width={400} height={400} x={40} y={0} fill="#fafafa" stroke="#e5e7eb" />
          {/* Quadrant dividers */}
          <line x1={240} y1={0} x2={240} y2={400} stroke="#d1d5db" strokeDasharray="4 4" />
          <line x1={40} y1={200} x2={440} y2={200} stroke="#d1d5db" strokeDasharray="4 4" />

          {/* Axis labels */}
          <text x={240} y={430} textAnchor="middle" fontSize={12} fill="#6b7280">
            Maturity Score →
          </text>
          <text x={15} y={200} textAnchor="middle" fontSize={12} fill="#6b7280" transform="rotate(-90, 15, 200)">
            Business Impact →
          </text>

          {/* Module dots */}
          {modules.map((m) => {
            const x = 40 + (m.consensus_score / maxMaturity) * 400;
            const y = 400 - (m.business_impact / maxImpact) * 400;
            const shortName = `M${m.module_number}`;

            return (
              <g key={m.module_number}>
                <circle
                  cx={x}
                  cy={y}
                  r={16}
                  className={
                    m.priority_class === "top_priority"
                      ? "fill-red-500"
                      : m.priority_class === "strategic_bet"
                        ? "fill-amber-500"
                        : m.priority_class === "quick_win"
                          ? "fill-green-500"
                          : m.priority_class === "maintain"
                            ? "fill-blue-400"
                            : "fill-gray-300"
                  }
                  opacity={0.8}
                />
                <text x={x} y={y + 4} textAnchor="middle" fontSize={10} fill="white" fontWeight="bold">
                  {shortName}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 justify-center mt-4">
        {Object.entries(PRIORITY_LABELS).map(([key, label]) => (
          <span
            key={key}
            className={`px-3 py-1 rounded-full text-xs font-medium ${PRIORITY_COLORS[key as PriorityClass]}`}
          >
            {label}
          </span>
        ))}
      </div>

      {/* Module list */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-2">
        {modules
          .sort((a, b) => {
            const order: PriorityClass[] = ["top_priority", "strategic_bet", "quick_win", "maintain", "defer"];
            return order.indexOf(a.priority_class) - order.indexOf(b.priority_class);
          })
          .map((m) => (
            <div
              key={m.module_number}
              className="flex items-center gap-2 p-2 rounded-lg bg-gray-50"
            >
              <span
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${PRIORITY_COLORS[m.priority_class]}`}
              >
                {m.module_number}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {MODULE_NAMES[m.module_number]}
                </p>
                <p className="text-xs text-gray-500">
                  Maturity: {m.consensus_score}/4 | Impact: {m.business_impact}/10
                </p>
              </div>
              <span className="text-xs text-gray-400">
                {PRIORITY_LABELS[m.priority_class]}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}
