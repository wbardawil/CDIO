"use client";

import { useState } from "react";
import { SpiderChart } from "@/components/charts/spider-chart";
import { PriorityMatrix } from "@/components/charts/priority-matrix";
import { DivergenceReport } from "@/components/charts/divergence-report";
import { MODULE_NAMES } from "@/types";
import type { AssessmentSynthesis, DivergencePoint, PriorityClass, RoadmapContent } from "@/types";

// Demo data for initial development — will be replaced with Supabase queries
const DEMO_SYNTHESES: AssessmentSynthesis[] = [
  { id: "1", assessment_id: "demo", module_number: 1, consensus_score: 2.0, divergence_score: 0.5, business_impact: 6, priority_rank: 8, priority_class: "maintain", recommended_actions: [] },
  { id: "2", assessment_id: "demo", module_number: 2, consensus_score: 1.5, divergence_score: 1.2, business_impact: 9, priority_rank: 1, priority_class: "top_priority", recommended_actions: [] },
  { id: "3", assessment_id: "demo", module_number: 3, consensus_score: 1.0, divergence_score: 0.8, business_impact: 7, priority_rank: 3, priority_class: "top_priority", recommended_actions: [] },
  { id: "4", assessment_id: "demo", module_number: 4, consensus_score: 2.5, divergence_score: 0.3, business_impact: 7, priority_rank: 5, priority_class: "strategic_bet", recommended_actions: [] },
  { id: "5", assessment_id: "demo", module_number: 5, consensus_score: 1.5, divergence_score: 1.5, business_impact: 9, priority_rank: 2, priority_class: "top_priority", recommended_actions: [] },
  { id: "6", assessment_id: "demo", module_number: 6, consensus_score: 1.0, divergence_score: 0.0, business_impact: 5, priority_rank: 10, priority_class: "strategic_bet", recommended_actions: [] },
  { id: "7", assessment_id: "demo", module_number: 7, consensus_score: 2.0, divergence_score: 0.0, business_impact: 4, priority_rank: 12, priority_class: "defer", recommended_actions: [] },
  { id: "8", assessment_id: "demo", module_number: 8, consensus_score: 1.5, divergence_score: 0.5, business_impact: 8, priority_rank: 4, priority_class: "top_priority", recommended_actions: [] },
  { id: "9", assessment_id: "demo", module_number: 9, consensus_score: 3.0, divergence_score: 0.0, business_impact: 6, priority_rank: 9, priority_class: "quick_win", recommended_actions: [] },
  { id: "10", assessment_id: "demo", module_number: 10, consensus_score: 2.5, divergence_score: 0.8, business_impact: 5, priority_rank: 11, priority_class: "maintain", recommended_actions: [] },
  { id: "11", assessment_id: "demo", module_number: 11, consensus_score: 2.0, divergence_score: 0.3, business_impact: 6, priority_rank: 7, priority_class: "maintain", recommended_actions: [] },
  { id: "12", assessment_id: "demo", module_number: 12, consensus_score: 1.0, divergence_score: 0.5, business_impact: 8, priority_rank: 6, priority_class: "top_priority", recommended_actions: [] },
  { id: "13", assessment_id: "demo", module_number: 13, consensus_score: 2.0, divergence_score: 0.0, business_impact: 5, priority_rank: 13, priority_class: "maintain", recommended_actions: [] },
  { id: "14", assessment_id: "demo", module_number: 14, consensus_score: 1.5, divergence_score: 0.0, business_impact: 6, priority_rank: 14, priority_class: "strategic_bet", recommended_actions: [] },
  { id: "15", assessment_id: "demo", module_number: 15, consensus_score: 1.0, divergence_score: 0.0, business_impact: 7, priority_rank: 15, priority_class: "strategic_bet", recommended_actions: [] },
  { id: "16", assessment_id: "demo", module_number: 16, consensus_score: 2.0, divergence_score: 0.0, business_impact: 4, priority_rank: 16, priority_class: "defer", recommended_actions: [] },
];

const DEMO_DIVERGENCES: DivergencePoint[] = [
  {
    module_number: 2,
    module_name: "IT/Digital Transformation Strategy",
    stakeholder_a: { id: "a", name: "Sarah Chen", score: 3, evidence: "We have a documented strategy from 2024 that aligns with our 3-year business plan. Regular quarterly reviews happen." },
    stakeholder_b: { id: "b", name: "Mike Torres", score: 1, evidence: "The strategy document exists but nobody follows it. Technology decisions are made reactively based on immediate needs." },
    score_gap: 2,
    framework_recommendation: "The diagnostic evidence points to Level 1-2 maturity. While a strategy document exists (supporting Level 2), the lack of consistent execution and reactive decision-making suggests the organization has not yet achieved reliable strategy execution. For a medium-sized technology company, this module should be a top priority.",
    projected_roi: "Implementing a living digital strategy with quarterly review cadence typically yields 150-300% ROI within 12 months through reduced redundant technology investments and better resource allocation.",
  },
  {
    module_number: 5,
    module_name: "Cybersecurity, Risk Management & Compliance",
    stakeholder_a: { id: "a", name: "Sarah Chen", score: 1, evidence: "We have basic antivirus and passwords but no formal security program or policies." },
    stakeholder_b: { id: "c", name: "James Park", score: 3, evidence: "We implemented MFA last year, have a firewall, run quarterly vulnerability scans, and our compliance consultant reviews us annually." },
    score_gap: 2,
    framework_recommendation: "The evidence suggests maturity between Level 2-3. MFA implementation and vulnerability scanning are Level 3 indicators, but the lack of a documented security policy and formal risk framework suggests the program is not yet comprehensive. For this organization's size and industry, establishing a security baseline should be prioritized within the first 90 days.",
    projected_roi: "A structured security program reduces breach risk by 60-80%. The average SMB data breach costs $120K-200K. Investment in security foundations typically yields 300-500% risk-adjusted ROI.",
  },
];

type Tab = "overview" | "divergences" | "roadmap";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const spiderScores = DEMO_SYNTHESES.map((s) => ({
    module_number: s.module_number,
    score: s.consensus_score,
  }));

  const matrixModules = DEMO_SYNTHESES.map((s) => ({
    module_number: s.module_number,
    consensus_score: s.consensus_score,
    business_impact: s.business_impact,
    priority_class: s.priority_class,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Virtual CDIO</h1>
            <p className="text-sm text-gray-500">Demo Organization Assessment</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
              Assessment Complete
            </span>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex gap-8">
            {([
              { key: "overview", label: "Maturity Overview" },
              { key: "divergences", label: `Alignment (${DEMO_DIVERGENCES.length})` },
              { key: "roadmap", label: "90-Day Roadmap" },
            ] as { key: Tab; label: string }[]).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <p className="text-sm text-gray-500">Average Maturity</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {(DEMO_SYNTHESES.reduce((a, b) => a + b.consensus_score, 0) / DEMO_SYNTHESES.length).toFixed(1)}
                  <span className="text-lg text-gray-400">/4</span>
                </p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <p className="text-sm text-gray-500">Top Priorities</p>
                <p className="text-3xl font-bold text-red-600 mt-1">
                  {DEMO_SYNTHESES.filter((s) => s.priority_class === "top_priority").length}
                </p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <p className="text-sm text-gray-500">Divergences</p>
                <p className="text-3xl font-bold text-amber-600 mt-1">
                  {DEMO_DIVERGENCES.length}
                </p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <p className="text-sm text-gray-500">Quick Wins</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {DEMO_SYNTHESES.filter((s) => s.priority_class === "quick_win").length}
                </p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <SpiderChart
                  scores={spiderScores}
                  title="Digital Maturity Radar"
                />
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <PriorityMatrix modules={matrixModules} />
              </div>
            </div>
          </div>
        )}

        {activeTab === "divergences" && (
          <DivergenceReport divergences={DEMO_DIVERGENCES} />
        )}

        {activeTab === "roadmap" && (
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <h2 className="text-xl font-semibold mb-4">90-Day Roadmap</h2>
            <p className="text-gray-500">
              Roadmap generation will be connected once the assessment pipeline is
              live with real Supabase data. The Strategy Agent will produce a
              customized plan based on your assessment results.
            </p>
            <div className="mt-6 space-y-4">
              {[
                { phase: "Weeks 1-4", title: "Foundation & Quick Wins", items: ["Complete stakeholder assessment", "Establish governance cadence", "Identify top 3 quick wins"] },
                { phase: "Weeks 5-8", title: "Strategic Initiatives", items: ["Launch top 2-3 strategic initiatives", "Begin addressing top priority modules", "First value check-in"] },
                { phase: "Weeks 9-12", title: "Scale & Measure", items: ["Progress initiatives to 50%+", "Measure ROI on quick wins", "Plan next quarter priorities"] },
              ].map((phase) => (
                <div key={phase.phase} className="border border-gray-100 rounded-lg p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      {phase.phase}
                    </span>
                    <h3 className="font-medium">{phase.title}</h3>
                  </div>
                  <ul className="ml-4 space-y-1">
                    {phase.items.map((item, i) => (
                      <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
