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
      target: target?.score ?? 5,
    };
  });

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold text-center mb-4">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={500}>
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid stroke="#E7E2D5" />
          <PolarAngleAxis
            dataKey="module"
            tick={{ fontSize: 10, fill: "#6B6960" }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 5]}
            tick={{ fontSize: 10, fill: "#9A968B" }}
            tickCount={6}
          />
          {targetScores && (
            <Radar
              name="Target"
              dataKey="target"
              stroke="#D8D2C2"
              fill="#FCFBF7"
              fillOpacity={0.3}
              strokeDasharray="5 5"
            />
          )}
          <Radar
            name="Current Maturity"
            dataKey="current"
            stroke="#0F4C44"
            fill="#0F4C44"
            fillOpacity={0.4}
          />
          <Tooltip
            content={({ payload }) => {
              if (!payload || payload.length === 0) return null;
              const data = payload[0]?.payload;
              return (
                <div className="bg-raised border border-hair rounded-lg p-3 shadow-lg">
                  <p className="font-medium text-sm">{data?.fullName}</p>
                  <p className="text-evergreen text-sm">
                    Current: {data?.current}/4
                  </p>
                  {targetScores && (
                    <p className="text-faint text-sm">
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
