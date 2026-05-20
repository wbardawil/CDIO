"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export interface OrgForSettings {
  id: string;
  name: string;
  size_category: "small" | "medium" | "large" | string;
  industry: string;
  employee_count: number;
  engagement_model: "advisory" | "strategic" | "hybrid" | "executive" | string;
  monthly_hours: number;
  is_sandbox: boolean;
  status: "active" | "archived" | string;
}

const INDUSTRY_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "healthcare", label: "Healthcare" },
  { value: "financial_services", label: "Financial Services" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "professional_services", label: "Professional Services" },
  { value: "retail_ecommerce", label: "Retail / E-commerce" },
  { value: "technology", label: "Technology" },
  { value: "education", label: "Education" },
  { value: "other", label: "Other" },
];

const ENGAGEMENT_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "advisory", label: "Advisory" },
  { value: "strategic", label: "Strategic" },
  { value: "hybrid", label: "Hybrid" },
  { value: "executive", label: "Executive" },
];

/**
 * Two interactive sections: PROFILE (free-form edit, single Save
 * button) and STATUS (Active <-> Archived toggle as its own action).
 *
 * Both call PATCH /api/clients/[orgId]. Server re-derives
 * size_category from employee_count, so the form doesn't expose it.
 */
export function SettingsForm({ org }: { org: OrgForSettings }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSaved, setProfileSaved] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  // Local form state. Initialized from the server-rendered org.
  const [name, setName] = useState(org.name);
  const [industry, setIndustry] = useState(org.industry);
  const [employeeCount, setEmployeeCount] = useState(String(org.employee_count));
  const [engagementModel, setEngagementModel] = useState(org.engagement_model);
  const [monthlyHours, setMonthlyHours] = useState(String(org.monthly_hours));

  async function patch(body: Record<string, unknown>) {
    const res = await fetch(`/api/clients/${org.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      // eslint-disable-next-line no-console
      console.error("[api error]", { status: res.status, body: json });
      const detail = json?.details
        ? typeof json.details === "string"
          ? json.details
          : JSON.stringify(json.details)
        : null;
      throw new Error(
        json?.error
          ? detail
            ? `${json.error}: ${detail}`
            : json.error
          : `HTTP ${res.status}`
      );
    }
    return json;
  }

  function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileError(null);
    setProfileSaved(false);

    const parsedEmployees = Number.parseInt(employeeCount, 10);
    const parsedHours = Number.parseInt(monthlyHours, 10);
    if (!name.trim()) {
      setProfileError("Name is required.");
      return;
    }
    if (!Number.isFinite(parsedEmployees) || parsedEmployees <= 0) {
      setProfileError("Employee count must be a positive integer.");
      return;
    }
    if (!Number.isFinite(parsedHours) || parsedHours < 0) {
      setProfileError("Monthly hours must be 0 or higher.");
      return;
    }

    startTransition(async () => {
      try {
        await patch({
          name: name.trim(),
          industry,
          employee_count: parsedEmployees,
          engagement_model: engagementModel,
          monthly_hours: parsedHours,
        });
        setProfileSaved(true);
        router.refresh();
      } catch (err) {
        setProfileError(err instanceof Error ? err.message : "Save failed");
      }
    });
  }

  function toggleStatus() {
    setStatusError(null);
    const next = org.status === "archived" ? "active" : "archived";
    startTransition(async () => {
      try {
        await patch({ status: next });
        router.refresh();
      } catch (err) {
        setStatusError(err instanceof Error ? err.message : "Status update failed");
      }
    });
  }

  const isArchived = org.status === "archived";

  return (
    <>
      {/* PROFILE */}
      <section className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-evergreen mb-3">
          Profile
        </p>
        <form
          onSubmit={saveProfile}
          className="bg-raised border border-hair rounded-lg p-5 space-y-4"
        >
          <div>
            <label htmlFor="name" className="block text-xs font-medium text-muted mb-1">
              Client name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={200}
              required
              className="w-full px-3 py-2 bg-raised border border-hair-strong rounded text-sm text-ink focus:outline-none focus:border-evergreen"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="industry" className="block text-xs font-medium text-muted mb-1">
                Industry
              </label>
              <select
                id="industry"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-3 py-2 bg-raised border border-hair-strong rounded text-sm text-ink focus:outline-none focus:border-evergreen"
              >
                {INDUSTRY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="employee_count"
                className="block text-xs font-medium text-muted mb-1"
              >
                Employees
              </label>
              <input
                id="employee_count"
                type="number"
                min={1}
                value={employeeCount}
                onChange={(e) => setEmployeeCount(e.target.value)}
                required
                className="w-full px-3 py-2 bg-raised border border-hair-strong rounded text-sm text-ink focus:outline-none focus:border-evergreen"
              />
              <p className="text-xs text-faint mt-1">
                Size category recomputes from headcount on save.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="engagement_model"
                className="block text-xs font-medium text-muted mb-1"
              >
                Engagement model
              </label>
              <select
                id="engagement_model"
                value={engagementModel}
                onChange={(e) => setEngagementModel(e.target.value)}
                className="w-full px-3 py-2 bg-raised border border-hair-strong rounded text-sm text-ink focus:outline-none focus:border-evergreen"
              >
                {ENGAGEMENT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="monthly_hours"
                className="block text-xs font-medium text-muted mb-1"
              >
                Committed hours / month
              </label>
              <input
                id="monthly_hours"
                type="number"
                min={0}
                value={monthlyHours}
                onChange={(e) => setMonthlyHours(e.target.value)}
                required
                className="w-full px-3 py-2 bg-raised border border-hair-strong rounded text-sm text-ink focus:outline-none focus:border-evergreen"
              />
            </div>
          </div>
          {profileError && (
            <p className="text-xs text-brick">Error: {profileError}</p>
          )}
          {profileSaved && (
            <p className="text-xs text-evergreen">Profile saved.</p>
          )}
          <div className="flex items-center justify-end gap-2">
            <button
              type="submit"
              disabled={pending}
              className="px-4 py-2 bg-evergreen text-white text-sm font-medium rounded hover:bg-evergreen-deep disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {pending ? "Saving…" : "Save profile"}
            </button>
          </div>
        </form>
      </section>

      {/* STATUS */}
      <section className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-evergreen mb-3">
          Status
        </p>
        <div className="bg-raised border border-hair rounded-lg p-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-ink font-medium">
              Currently {isArchived ? "archived" : "active"}
            </p>
            <p className="text-xs text-muted mt-1 max-w-md">
              {isArchived
                ? "Archived clients are hidden from the default portfolio view. The engagement history (assessments, decisions, initiatives) remains intact and read-only."
                : "Archive to hide this client from the default portfolio view without destroying any data. Restore at any time from the Archived filter."}
            </p>
          </div>
          <button
            type="button"
            onClick={toggleStatus}
            disabled={pending}
            className="px-3 py-2 border border-hair-strong text-ink text-sm font-medium rounded hover:bg-paper disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {pending
              ? isArchived
                ? "Restoring…"
                : "Archiving…"
              : isArchived
              ? "Restore client"
              : "Archive client"}
          </button>
        </div>
        {statusError && (
          <p className="text-xs text-brick mt-2">Error: {statusError}</p>
        )}
      </section>
    </>
  );
}
