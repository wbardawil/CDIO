"use client";

import { useState, useEffect, useCallback } from "react";
import { AssessmentForm } from "@/components/forms/assessment-form";
import { MODULE_NAMES } from "@/types";

interface StakeholderInfo {
  id: string;
  name: string;
  role: string;
  org_name: string;
  org_id: string;
  assessment_id: string;
  relevant_modules: number[];
  completed_modules: number[];
}

export default function AssessPage({ params }: { params: Promise<{ token: string }> }) {
  const [token, setToken] = useState<string>("");
  const [stakeholder, setStakeholder] = useState<StakeholderInfo | null>(null);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    params.then((p) => setToken(p.token));
  }, [params]);

  useEffect(() => {
    if (!token) return;
    fetch(`/api/stakeholders/${token}`)
      .then((r) => {
        if (!r.ok) throw new Error("Invalid or expired assessment link");
        return r.json();
      })
      .then((data) => {
        setStakeholder(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [token]);

  const pendingModules = stakeholder
    ? stakeholder.relevant_modules.filter(
        (m) => !stakeholder.completed_modules.includes(m)
      )
    : [];

  const currentModule = pendingModules[currentModuleIndex];

  const handleSubmit = useCallback(
    async (
      responses: {
        question_text: string;
        answer: "yes" | "no" | "partial";
        evidence?: string;
      }[],
      businessImpact: number
    ) => {
      if (!stakeholder || !currentModule) return;
      setSubmitting(true);

      try {
        const res = await fetch("/api/assessments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            org_id: stakeholder.org_id,
            assessment_id: stakeholder.assessment_id,
            stakeholder_id: stakeholder.id,
            module_number: currentModule,
            responses,
            business_impact_rating: businessImpact,
          }),
        });

        if (!res.ok) throw new Error("Failed to submit assessment");

        // Mark module as completed locally
        setStakeholder((prev) =>
          prev
            ? {
                ...prev,
                completed_modules: [...prev.completed_modules, currentModule],
              }
            : prev
        );

        // Move to next module or finish
        if (currentModuleIndex + 1 < pendingModules.length) {
          setCurrentModuleIndex((i) => i + 1);
        } else {
          setDone(true);
        }
      } catch (err) {
        setError("Failed to submit. Please try again.");
      } finally {
        setSubmitting(false);
      }
    },
    [stakeholder, currentModule, currentModuleIndex, pendingModules.length]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-500 mt-4">Loading your assessment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl border border-red-200 p-8 max-w-md text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Unable to Load</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-gray-200 p-12 max-w-lg text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-green-600 text-3xl">&#10003;</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Assessment Complete
          </h2>
          <p className="text-gray-600 mb-4">
            Thank you, {stakeholder?.name}. Your responses have been recorded.
          </p>
          <p className="text-sm text-gray-400">
            The AI-CDIO system will synthesize all stakeholder inputs and generate
            an objective assessment report with prioritized recommendations.
          </p>
        </div>
      </div>
    );
  }

  if (!stakeholder || !currentModule) return null;

  const totalModules = stakeholder.relevant_modules.length;
  const completedCount = stakeholder.completed_modules.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-gray-900">AI-CDIO</h1>
              <p className="text-sm text-gray-500">
                Assessment for {stakeholder.org_name}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-700">
                {stakeholder.name}
              </p>
              <p className="text-xs text-gray-400">{stakeholder.role}</p>
            </div>
          </div>
          {/* Progress */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>
                Module {completedCount + 1} of {totalModules}
              </span>
              <span>{Math.round(((completedCount) / totalModules) * 100)}% complete</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                style={{
                  width: `${(completedCount / totalModules) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Assessment Form */}
      <main className="max-w-3xl mx-auto px-6 py-8">
        {submitting ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-gray-500 mt-4">
              AI-CDIO is scoring your responses...
            </p>
          </div>
        ) : (
          <AssessmentForm
            key={currentModule}
            moduleNumber={currentModule}
            onSubmit={(responses, businessImpact) =>
              handleSubmit(responses, businessImpact)
            }
          />
        )}
      </main>
    </div>
  );
}
