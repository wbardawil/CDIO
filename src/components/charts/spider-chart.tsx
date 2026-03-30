"use client";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { MODULE_NAMES } from "@/types";

interface SpiderChartProps {
  scores: { module_number: number; score: number }[];
  targetScores?: { module_number: number; score: number }[];
  title?: string;
}

export function SpiderChart({ scores, targetScores, title }: SpiderChartProps) {
  const data = scores.map((s) => {
    const target = targetScores?.find((t) => t.module_number === s.module_number);
    // Shorten module names for readability
    const fullName = MODULE_NAMES[s.module_number] ?? `M${s.module_number}`;
    const shortName = fullName.length > 20 ? fullName.slice(0, 18) + "..." : fullName;

    return {
      module: shortName,
      fullName,
      current: s.score,
      target: target?.score ?? 4,
    };
  });

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold text-center mb-4">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={500}>
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis
            dataKey="module"
            tick={{ fontSize: 10, fill: "#6b7280" }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 4]}
            tick={{ fontSize: 10, fill: "#9ca3af" }}
            tickCount={5}
          />
          {targetScores && (
            <Radar
              name="Target"
              dataKey="target"
              stroke="#d1d5db"
              fill="#f3f4f6"
              fillOpacity={0.3}
              strokeDasharray="5 5"
            />
          )}
          <Radar
            name="Current Maturity"
            dataKey="current"
            stroke="#2563eb"
            fill="#3b82f6"
            fillOpacity={0.4}
          />
          <Tooltip
            content={({ payload }) => {
              if (!payload || payload.length === 0) return null;
              const data = payload[0]?.payload;
              return (
                <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
                  <p className="font-medium text-sm">{data?.fullName}</p>
                  <p className="text-blue-600 text-sm">
                    Current: {data?.current}/4
                  </p>
                  {targetScores && (
                    <p className="text-gray-400 text-sm">
                      Target: {data?.target}/4
                    </p>
                  )}
                </div>
              );
            }}
          />
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
