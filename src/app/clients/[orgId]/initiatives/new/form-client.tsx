"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MODULE_NAMES } from "@/types";
import type { InitiativeDomain } from "@/types/initiative";

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
  const [targetDate, setTargetDate] = useState("");
  const [steps, setSteps] = useState<DraftStep[]>([emptyStep()]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
          target_completion_date: targetDate || null,
          steps: cleanedSteps,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? `HTTP ${res.status}`);
      }

      const body = await res.json();
      router.push(`/clients/${orgId}/initiatives/${body.initiative.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="bg-raised rounded-xl border border-hair p-5 space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-muted mb-1">
            Title
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={300}
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

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-muted mb-1">
            Target completion date (optional)
          </label>
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="w-full sm:w-1/2 px-3 py-2 border border-hair rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-evergreen"
          />
        </div>
      </section>

      <section className="bg-raised rounded-xl border border-hair p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-semibold text-ink">Milestones</h2>
            <p className="text-xs text-muted mt-0.5">
              Sequence the work. Up to 20 steps. Each step gets a status
              (to do / in progress / done / blocked) you can update later.
            </p>
          </div>
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
      </section>

      {error && (
        <div className="px-4 py-3 bg-raised border border-brick rounded-lg text-sm text-brick">
          {error}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={submitting || !title.trim() || !goal.trim()}
          className={`px-5 py-2.5 text-sm font-semibold rounded-lg ${
            submitting || !title.trim() || !goal.trim()
              ? "bg-hair text-faint cursor-not-allowed"
              : "bg-evergreen text-white hover:bg-evergreen-deep"
          }`}
        >
          {submitting ? "Creating..." : "Create initiative"}
        </button>
      </div>
    </form>
  );
}
