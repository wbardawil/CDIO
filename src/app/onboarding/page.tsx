"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Industry } from "@/types";

interface StakeholderInput {
  name: string;
  email: string;
  role: string;
}

const INDUSTRIES: { value: Industry; label: string }[] = [
  { value: "healthcare", label: "Healthcare" },
  { value: "financial_services", label: "Financial Services" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "professional_services", label: "Professional Services" },
  { value: "retail_ecommerce", label: "Retail / E-commerce" },
  { value: "technology", label: "Technology" },
  { value: "education", label: "Education" },
  { value: "other", label: "Other" },
];

const COMMON_ROLES = ["CEO", "CTO", "CFO", "COO", "IT Director", "VP Engineering", "VP Operations", "Product Director"];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1: Organization info
  const [orgName, setOrgName] = useState("");
  const [employeeCount, setEmployeeCount] = useState<number>(50);
  const [industry, setIndustry] = useState<Industry>("technology");

  // Step 2: Stakeholders
  const [stakeholders, setStakeholders] = useState<StakeholderInput[]>([
    { name: "", email: "", role: "" },
  ]);

  const addStakeholder = () => {
    setStakeholders([...stakeholders, { name: "", email: "", role: "" }]);
  };

  const updateStakeholder = (index: number, field: keyof StakeholderInput, value: string) => {
    setStakeholders((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    );
  };

  const removeStakeholder = (index: number) => {
    if (stakeholders.length > 1) {
      setStakeholders((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const response = await fetch("/api/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: orgName,
          employee_count: employeeCount,
          industry,
          stakeholders: stakeholders.filter((s) => s.name && s.email && s.role),
        }),
      });

      if (!response.ok) {
        // Surface the real reason instead of a generic message
        let detail = `HTTP ${response.status}`;
        try {
          const body = await response.json();
          if (body?.error) detail = body.error;
          if (body?.details) detail += ` — ${typeof body.details === "string" ? body.details : JSON.stringify(body.details)}`;
        } catch {
          /* response wasn't JSON — keep the HTTP code */
        }
        if (response.status === 401) {
          setErrorMsg("You need to sign in before onboarding a client. Redirecting…");
          setTimeout(() => router.push(`/sign-in?redirect_url=${encodeURIComponent("/onboarding")}`), 1200);
          return;
        }
        throw new Error(detail);
      }

      const data = await response.json();
      router.push(`/clients/${data.organization.id}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong";
      console.error("Onboarding error:", error);
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  const canProceedStep1 = orgName.trim() && employeeCount > 0;
  const canSubmit = stakeholders.some((s) => s.name && s.email && s.role);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-2xl mx-auto px-6 py-16">
        {/* Logo / Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900">AI-CDIO</h1>
          <p className="text-gray-500 mt-2">
            Objective, data-driven digital strategy for your organization
          </p>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <div className={`flex items-center gap-2 ${step >= 1 ? "text-blue-600" : "text-gray-400"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 1 ? "bg-blue-600 text-white" : "bg-gray-200"}`}>
              1
            </div>
            <span className="text-sm font-medium">Organization</span>
          </div>
          <div className="w-12 h-px bg-gray-300" />
          <div className={`flex items-center gap-2 ${step >= 2 ? "text-blue-600" : "text-gray-400"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 2 ? "bg-blue-600 text-white" : "bg-gray-200"}`}>
              2
            </div>
            <span className="text-sm font-medium">Leadership Team</span>
          </div>
        </div>

        {/* Step 1: Organization */}
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-xl font-semibold mb-6">Tell us about your organization</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organization Name
                </label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="Acme Corp"
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Employees
                </label>
                <input
                  type="number"
                  value={employeeCount}
                  onChange={(e) => setEmployeeCount(Number(e.target.value))}
                  min={1}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-400"
                />
                <p className="text-xs text-gray-400 mt-1">
                  {employeeCount <= 50
                    ? "Small organization — we'll focus on quick wins and foundations"
                    : employeeCount <= 250
                      ? "Medium organization — strategic planning with execution support"
                      : "Large organization — enterprise transformation approach"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Industry
                </label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value as Industry)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-400"
                >
                  {INDUSTRIES.map((ind) => (
                    <option key={ind.value} value={ind.value}>
                      {ind.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!canProceedStep1}
              className="mt-8 w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
            >
              Next: Add Leadership Team
            </button>
          </div>
        )}

        {/* Step 2: Stakeholders */}
        {step === 2 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-xl font-semibold mb-2">Add your leadership team</h2>
            <p className="text-sm text-gray-500 mb-6">
              Each team member will receive an independent assessment. This ensures
              objective data collection without groupthink.
            </p>

            <div className="space-y-4">
              {stakeholders.map((s, i) => (
                <div key={i} className="border border-gray-100 rounded-lg p-4 relative">
                  {stakeholders.length > 1 && (
                    <button
                      onClick={() => removeStakeholder(i)}
                      className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-lg"
                    >
                      x
                    </button>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={s.name}
                      onChange={(e) => updateStakeholder(i, "name", e.target.value)}
                      placeholder="Full Name"
                      className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                    />
                    <input
                      type="email"
                      value={s.email}
                      onChange={(e) => updateStakeholder(i, "email", e.target.value)}
                      placeholder="email@company.com"
                      className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                    />
                    <select
                      value={s.role}
                      onChange={(e) => updateStakeholder(i, "role", e.target.value)}
                      className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                    >
                      <option value="">Select Role</option>
                      {COMMON_ROLES.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={addStakeholder}
              className="mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              + Add another team member
            </button>

            {errorMsg && (
              <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <p className="font-medium">Onboarding failed</p>
                <p className="text-red-600 mt-1">{errorMsg}</p>
              </div>
            )}

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={!canSubmit || loading}
                className="flex-1 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
              >
                {loading ? "Setting up..." : "Start Assessment"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
