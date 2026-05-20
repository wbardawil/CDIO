"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MODULE_NAMES } from "@/types";
import type { InitiativeDomain } from "@/types/initiative";
import {
  SUPPORTED_CURRENCIES,
  currencyMeta,
  type CurrencyCode,
} from "@/lib/money/fx";

interface DraftStep {
  id: string;
  title: string;
  description: string;
  assignee_name: string;
  due_date: string;
}

interface NewInitiativeFormProps {
  orgId: string;
  activeModules: number[];
}

const DOMAIN_OPTIONS: { key: InitiativeDomain; label: string }[] = [
  { key: "tech", label: "Technology" },
  { key: "ai", label: "AI" },
  { key: "security", label: "Security" },
  { key: "process", label: "Process" },
  { key: "data", label: "Data" },
  { key: "other", label: "Other" },
];

function emptyStep(): DraftStep {
  return {
    id: crypto.randomUUID(),
    title: "",
    description: "",
    assignee_name: "",
    due_date: "",
  };
}

export function NewInitiativeForm({
  orgId,
  activeModules,
}: NewInitiativeFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [goal, setGoal] = useState("");
  const [domain, setDomain] = useState<InitiativeDomain>("tech");
  const [moduleNumber, setModuleNumber] = useState<string>("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [startDate, setStartDate] = useState("");
  const [targetDate, setTargetDate] = useState("");
  // Schema-v22: money fields. Stored in the form as plain "major unit" decimal
  // strings (e.g. "150000" or "150000.50"); converted to minor units on submit.
  const [currency, setCurrency] = useState<CurrencyCode>("USD");
  const [expectedValueMajor, setExpectedValueMajor] = useState<string>("");
  const [expectedCostMajor, setExpectedCostMajor] = useState<string>("");
  const [steps, setSteps] = useState<DraftStep[]>([emptyStep()]);
  // Quick-add UX: when the user clicks "Save and add another" we set this so
  // the submit handler stays on /new and resets the form instead of pushing
  // into the detail page. Needed for the live-meeting flow of entering many
  // initiatives in a row.
  const [savedToast, setSavedToast] = useState<string | null>(null);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const moduleOptions = (activeModules.length > 0
    ? activeModules
    : Array.from({ length: 16 }, (_, i) => i + 1)
  ).sort((a, b) => a - b);

  const updateStep = (id: string, patch: Partial<DraftStep>) => {
    setSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...patch } : s))
    );
  };

  const removeStep = (id: string) => {
    setSteps((prev) => prev.filter((s) => s.id !== id));
  };

  const addStep = () => {
    setSteps((prev) => [...prev, emptyStep()]);
  };

  // Parse a "major unit" decimal string ("150000" or "150000.50") into
  // an integer count of MINOR units. Returns null on empty / invalid input.
  const parseToMinorUnits = (raw: string, code: CurrencyCode): number | null => {
    const cleaned = raw.trim().replace(/[,\s]/g, "");
    if (!cleaned) return null;
    const n = Number(cleaned);
    if (!Number.isFinite(n) || n < 0) return null;
    const meta = currencyMeta(code);
    return Math.round(n * meta.minorUnitsPerMajor);
  };

  const resetForm = () => {
    setTitle("");
    setGoal("");
    setDomain("tech");
    setModuleNumber("");
    setOwnerName("");
    setOwnerEmail("");
    setStartDate("");
    setTargetDate("");
    // Keep `currency` sticky — most users will enter several initiatives
    // in the same currency before switching.
    setExpectedValueMajor("");
    setExpectedCostMajor("");
    setSteps([emptyStep()]);
    setAdvancedOpen(false);
    setError(null);
  };

  // Shared submit core. `mode` controls what happens after a successful save:
  //   "detail"       -> router.push to the new initiative's detail page (default)
  //   "add-another"  -> stay on /new, reset the form, show a saved toast
  const submitForm = async (mode: "detail" | "add-another") => {
    if (submitting) return;
    setError(null);
    setSubmitting(true);

    const cleanedSteps = steps
      .filter((s) => s.title.trim().length > 0)
      .map((s) => ({
        title: s.title.trim(),
        description: s.description.trim() || null,
        assignee_name: s.assignee_name.trim() || null,
        due_date: s.due_date || null,
        status: "todo" as const,
      }));

    const valueMinor = parseToMinorUnits(expectedValueMajor, currency);
    const costMinor = parseToMinorUnits(expectedCostMajor, currency);

    try {
      const res = await fetch("/api/initiatives", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          org_id: orgId,
          title: title.trim(),
          goal: goal.trim(),
          domain,
          module_number: moduleNumber ? Number(moduleNumber) : null,
          owner_name: ownerName.trim() || null,
          owner_email: ownerEmail.trim() || null,
          start_date: startDate || null,
          target_completion_date: targetDate || null,
          currency,
          expected_value_minor_units: valueMinor,
          expected_cost_minor_units: costMinor,
          steps: cleanedSteps,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        // eslint-disable-next-line no-console
        console.error("[initiative create] failed", { status: res.status, body });
        const detail = body?.details
          ? typeof body.details === "string"
            ? body.details
            : JSON.stringify(body.details)
          : null;
        const errMsg = body?.error
          ? detail
            ? `${body.error}: ${detail}`
            : body.error
          : `HTTP ${res.status}`;
        throw new Error(errMsg);
      }

      const body = await res.json();
      if (mode === "detail") {
        router.push(`/clients/${orgId}/initiatives/${body.initiative.id}`);
      } else {
        const savedTitle = title.trim();
        resetForm();
        setSavedToast(`Saved "${savedTitle}" — add the next one`);
        setSubmitting(false);
        // Auto-focus the title field for fast next-entry.
        requestAnimationFrame(() => {
          const el = document.getElementById("initiative-title-input");
          if (el instanceof HTMLInputElement) el.focus();
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create");
      setSubmitting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void submitForm("detail");
  };

  const handleSaveAndAddAnother = () => {
    void submitForm("add-another");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="bg-raised rounded-xl border border-hair p-5 space-y-4">
        <div>
          <label
            htmlFor="initiative-title-input"
            className="block text-xs font-semibold uppercase tracking-wide text-muted mb-1"
          >
            Title
          </label>
          <input
            id="initiative-title-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={300}
            autoFocus
            placeholder="e.g., Roll out phishing-resistant MFA across admin accounts"
            className="w-full px-3 py-2 border border-hair rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-evergreen"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-muted mb-1">
            Goal
          </label>
          <textarea
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            required
            maxLength={2000}
            rows={3}
            placeholder="What measurable outcome ships at the end? (1-2 sentences, hard-dollar or specific evidence preferred.)"
            className="w-full px-3 py-2 border border-hair rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-evergreen"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-muted mb-1">
              Domain
            </label>
            <select
              value={domain}
              onChange={(e) => setDomain(e.target.value as InitiativeDomain)}
              className="w-full px-3 py-2 border border-hair rounded-lg text-sm bg-raised focus:outline-none focus:ring-2 focus:ring-evergreen"
            >
              {DOMAIN_OPTIONS.map((d) => (
                <option key={d.key} value={d.key}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-muted mb-1">
              Linked module (optional)
            </label>
            <select
              value={moduleNumber}
              onChange={(e) => setModuleNumber(e.target.value)}
              className="w-full px-3 py-2 border border-hair rounded-lg text-sm bg-raised focus:outline-none focus:ring-2 focus:ring-evergreen"
            >
              <option value="">— None —</option>
              {moduleOptions.map((n) => (
                <option key={n} value={n}>
                  M{n} · {MODULE_NAMES[n]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-muted mb-1">
              Client-side owner (optional)
            </label>
            <input
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              maxLength={200}
              placeholder="e.g., Maria López, COO"
              className="w-full px-3 py-2 border border-hair rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-evergreen"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-muted mb-1">
              Owner email (optional)
            </label>
            <input
              value={ownerEmail}
              onChange={(e) => setOwnerEmail(e.target.value)}
              type="email"
              placeholder="maria@client.example"
              className="w-full px-3 py-2 border border-hair rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-evergreen"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-muted mb-1">
              Start date (optional)
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-hair rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-evergreen"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-muted mb-1">
              Target completion date (optional)
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full px-3 py-2 border border-hair rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-evergreen"
            />
          </div>
        </div>

        {/* Money — Schema-v22 fields. Inflow / outflow per initiative for the
            portfolio cash-flow rollup. Both optional so quick-add still works. */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-evergreen mb-2">
            Expected money — inflow & outflow (optional)
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted mb-1">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                className="w-full px-3 py-2 border border-hair rounded-lg text-sm bg-raised focus:outline-none focus:ring-2 focus:ring-evergreen"
              >
                {SUPPORTED_CURRENCIES.map((c) => {
                  const meta = currencyMeta(c);
                  return (
                    <option key={c} value={c}>
                      {meta.code} · {meta.label}
                    </option>
                  );
                })}
              </select>
              <p className="text-[11px] text-faint mt-1">
                Portfolio rollup converts to USD.
              </p>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1">
                Expected value / inflow
              </label>
              <div className="flex items-stretch">
                <span className="inline-flex items-center px-2 border border-r-0 border-hair rounded-l-lg text-xs text-muted bg-paper">
                  {currencyMeta(currency).symbol}
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={expectedValueMajor}
                  onChange={(e) => setExpectedValueMajor(e.target.value)}
                  placeholder="e.g., 150000"
                  className="flex-1 px-3 py-2 border border-hair rounded-r-lg text-sm focus:outline-none focus:ring-2 focus:ring-evergreen"
                />
              </div>
              <p className="text-[11px] text-faint mt-1">
                Benefit / revenue / savings thesis.
              </p>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1">
                Expected cost / outflow
              </label>
              <div className="flex items-stretch">
                <span className="inline-flex items-center px-2 border border-r-0 border-hair rounded-l-lg text-xs text-muted bg-paper">
                  {currencyMeta(currency).symbol}
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={expectedCostMajor}
                  onChange={(e) => setExpectedCostMajor(e.target.value)}
                  placeholder="e.g., 60000"
                  className="flex-1 px-3 py-2 border border-hair rounded-r-lg text-sm focus:outline-none focus:ring-2 focus:ring-evergreen"
                />
              </div>
              <p className="text-[11px] text-faint mt-1">
                Spend / investment / license.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-raised rounded-xl border border-hair p-5">
        <button
          type="button"
          onClick={() => setAdvancedOpen((v) => !v)}
          className="w-full flex items-center justify-between text-left"
          aria-expanded={advancedOpen}
        >
          <div>
            <h2 className="text-sm font-semibold text-ink">
              Milestones <span className="text-muted font-normal">(optional)</span>
            </h2>
            <p className="text-xs text-muted mt-0.5">
              Sequence the work. Up to 20 steps. Skip for quick entry — you
              can add milestones later from the initiative detail page.
            </p>
          </div>
          <span className="text-xs text-evergreen ml-3 shrink-0">
            {advancedOpen ? "Hide" : "Show"}
          </span>
        </button>
        {advancedOpen && (
        <div className="mt-4">
        <div className="flex items-center justify-end mb-3">
          <button
            type="button"
            onClick={addStep}
            className="px-3 py-1.5 text-xs font-medium border border-hair rounded-lg hover:bg-paper"
          >
            + Add step
          </button>
        </div>
        <ul className="space-y-3">
          {steps.map((s, idx) => (
            <li
              key={s.id}
              className="border border-hair rounded-lg p-3 space-y-2"
            >
              <div className="flex items-center gap-2">
                <span className="shrink-0 inline-flex items-center justify-center w-6 h-6 bg-surface text-muted rounded text-xs font-bold">
                  {idx + 1}
                </span>
                <input
                  value={s.title}
                  onChange={(e) =>
                    updateStep(s.id, { title: e.target.value })
                  }
                  placeholder="Milestone title"
                  className="flex-1 px-3 py-1.5 border border-hair rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-evergreen"
                />
                {steps.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeStep(s.id)}
                    className="text-xs text-faint hover:text-brick"
                  >
                    Remove
                  </button>
                )}
              </div>
              <textarea
                value={s.description}
                onChange={(e) =>
                  updateStep(s.id, { description: e.target.value })
                }
                rows={2}
                placeholder="Description (optional)"
                className="w-full px-3 py-1.5 border border-hair rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-evergreen"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  value={s.assignee_name}
                  onChange={(e) =>
                    updateStep(s.id, { assignee_name: e.target.value })
                  }
                  placeholder="Assignee (optional)"
                  className="px-3 py-1.5 border border-hair rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-evergreen"
                />
                <input
                  type="date"
                  value={s.due_date}
                  onChange={(e) =>
                    updateStep(s.id, { due_date: e.target.value })
                  }
                  className="px-3 py-1.5 border border-hair rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-evergreen"
                />
              </div>
            </li>
          ))}
        </ul>
        </div>
        )}
      </section>

      {error && (
        <div className="px-4 py-3 bg-raised border border-brick rounded-lg text-sm text-brick">
          {error}
        </div>
      )}

      {savedToast && !error && (
        <div className="px-4 py-3 bg-evergreen-soft border border-evergreen rounded-lg text-sm text-evergreen">
          {savedToast}
        </div>
      )}

      <div className="flex items-center gap-3 flex-wrap">
        <button
          type="submit"
          disabled={submitting || !title.trim() || !goal.trim()}
          className={`px-5 py-2.5 text-sm font-semibold rounded-lg ${
            submitting || !title.trim() || !goal.trim()
              ? "bg-hair text-faint cursor-not-allowed"
              : "bg-evergreen text-white hover:bg-evergreen-deep"
          }`}
        >
          {submitting ? "Saving…" : "Save and open"}
        </button>
        <button
          type="button"
          onClick={handleSaveAndAddAnother}
          disabled={submitting || !title.trim() || !goal.trim()}
          className={`px-5 py-2.5 text-sm font-semibold rounded-lg border ${
            submitting || !title.trim() || !goal.trim()
              ? "border-hair text-faint cursor-not-allowed"
              : "border-evergreen text-evergreen hover:bg-evergreen-soft"
          }`}
        >
          {submitting ? "Saving…" : "Save and add another"}
        </button>
        <p className="text-xs text-faint">
          Tip: use “Save and add another” to rip through a portfolio quickly.
          Title + goal are required; everything else is optional and editable later.
        </p>
      </div>
    </form>
  );
}
