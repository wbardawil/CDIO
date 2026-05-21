"use client";

import { useState, useEffect, useCallback } from "react";
import { AssessmentForm } from "@/components/forms/assessment-form";
import { SandboxBanner } from "@/components/sandbox-banner";
import { MODULE_NAMES } from "@/types";
import type { Industry } from "@/types";

interface StakeholderInfo {
  id: string;
  name: string;
  role: string;
  org_name: string;
  org_id: string;
  org_is_sandbox: boolean;
  org_industry: Industry | null;
  org_size_category: "small" | "medium" | "large" | null;
  assessment_id: string;
  relevant_modules: number[];
  completed_modules: number[];
}

export default function AssessPage({ params }: { params: Promise<{ token: string }> }) {
  const [token, setToken] = useState<string>("");
  const [stakeholder, setStakeholder] = useState<StakeholderInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    params.then((p) => setToken(p.token));
  }, [params]);

  useEffect(() => {
    if (!token) return;
    fetch(`/api/stakeholders/by-token/${token}`)
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

  // Pending = modules not yet completed. Always work the FIRST pending module —
  // a separate index would walk against this filter as completions arrive
  // and produce undefined → blank page after Next.
  const pendingModules = stakeholder
    ? stakeholder.relevant_modules.filter(
        (m) => !stakeholder.completed_modules.includes(m)
      )
    : [];

  const currentModule = pendingModules[0];

  // If everything's complete on first load (e.g. resumed assessment), surface "done".
  useEffect(() => {
    if (stakeholder && pendingModules.length === 0) {
      setDone(true);
    }
  }, [stakeholder, pendingModules.length]);

  const handleSubmit = useCallback(
    async (
      responses: {
        question_id: string;
        question_text: string;
        answer: "yes" | "no" | "partial" | "na";
        evidence?: string;
      }[],
      businessImpact: number,
      moduleSkipped: boolean
    ) => {
      if (!stakeholder || !currentModule) return;
      setSubmitting(true);

      try {
        // codex-audit-2026-05-21 finding #11 — the API now derives org_id /
        // assessment_id / stakeholder_id from the token on the server. The
        // client only passes the token (the URL-bearer) and the response
        // data. Body-supplied IDs are ignored even if sent.
        const res = await fetch("/api/assessments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token,
            module_number: currentModule,
            responses,
            business_impact_rating: businessImpact,
            module_skipped: moduleSkipped,
          }),
        });

        if (!res.ok) {
          let detail = `HTTP ${res.status}`;
          try {
            const body = await res.json();
            if (body?.error) detail = body.error;
            if (body?.details) detail += ` — ${typeof body.details === "string" ? body.details : JSON.stringify(body.details)}`;
          } catch { /* not JSON */ }
          throw new Error(detail);
        }

        const newCompleted = [...stakeholder.completed_modules, currentModule];
        const isDone = newCompleted.length >= stakeholder.relevant_modules.length;

        setStakeholder((prev) =>
          prev ? { ...prev, completed_modules: newCompleted } : prev
        );
        if (isDone) setDone(true);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to submit";
        setError(`Failed to submit: ${message}`);
      } finally {
        setSubmitting(false);
      }
    },
    [stakeholder, currentModule]
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <SandboxBanner isSandbox={stakeholder?.org_is_sandbox ?? false} variant="assess" />
        <div className="flex items-center justify-center px-6 py-16">
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
          <p className="text-sm text-gray-500 mb-8">
            Once all stakeholders submit, run synthesis to compute consensus
            scores, surface divergences, and generate the roadmap.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={stakeholder?.org_id ? `/clients/${stakeholder.org_id}` : "/clients"}
              className="inline-flex items-center justify-center px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
            >
              Return to client workspace →
            </a>
            <a
              href={stakeholder?.org_id ? `/dashboard?org=${stakeholder.org_id}` : "/clients"}
              className="inline-flex items-center justify-center px-5 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50"
            >
              Open full dashboard
            </a>
          </div>
          <p className="text-xs text-gray-400 mt-6">
            If you&apos;re a stakeholder (not the practitioner), you can close this tab — the practitioner will be notified.
          </p>
          </div>
        </div>
      </div>
    );
  }

  if (!stakeholder || !currentModule) return null;

  const totalModules = stakeholder.relevant_modules.length;
  const completedCount = stakeholder.completed_modules.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <SandboxBanner isSandbox={stakeholder.org_is_sandbox} variant="assess" />
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
            stakeholderRole={stakeholder.role}
            industry={stakeholder.org_industry ?? undefined}
            onSubmit={(responses, businessImpact, moduleSkipped) =>
              handleSubmit(responses, businessImpact, moduleSkipped)
            }
          />
        )}
      </main>
    </div>
  );
}
