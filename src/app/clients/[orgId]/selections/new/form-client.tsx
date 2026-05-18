"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SelectionDomain } from "@/types/selection";

const DOMAINS: { key: SelectionDomain; label: string; blurb: string }[] = [
  {
    key: "tech",
    label: "Technology",
    blurb:
      "Vendor / platform / tool selection. Default criteria: functional fit, integration, TCO, vendor stability, security, time-to-value, lock-in, support.",
  },
  {
    key: "ai",
    label: "AI",
    blurb:
      "AI vendor or build-vs-buy. Default criteria: AMP 5x5 — Feasibility (data readiness, system fit, process structure, change readiness, time-to-impact) × Value (OpEx reduction, productivity, quality, revenue, strategic alignment).",
  },
  {
    key: "partner",
    label: "Partner",
    blurb:
      "Consulting / agency / contractor selection. Default criteria: domain expertise, industry experience, pricing, capacity, references, fit, knowledge transfer.",
  },
];

interface NewSelectionFormProps {
  orgId: string;
}

export function NewSelectionForm({ orgId }: NewSelectionFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [domain, setDomain] = useState<SelectionDomain>("tech");
  const [title, setTitle] = useState("");
  const [question, setQuestion] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/selections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          org_id: orgId,
          domain,
          title: title.trim(),
          question: question.trim(),
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? `HTTP ${res.status}`);
      }

      const body = await res.json();
      router.push(`/clients/${orgId}/selections/${body.selection.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted mb-2">
          Domain
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {DOMAINS.map((d) => (
            <label
              key={d.key}
              className={`block p-4 border rounded-xl cursor-pointer ${
                domain === d.key
                  ? "border-evergreen ring-2 ring-evergreen bg-evergreen-soft"
                  : "border-hair bg-raised hover:border-hair"
              }`}
            >
              <input
                type="radio"
                name="domain"
                value={d.key}
                checked={domain === d.key}
                onChange={() => setDomain(d.key)}
                className="sr-only"
              />
              <p className="text-sm font-semibold text-ink">{d.label}</p>
              <p className="text-xs text-muted mt-1.5 leading-snug">
                {d.blurb}
              </p>
            </label>
          ))}
        </div>
      </section>

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
            placeholder="e.g., Customer support ticketing platform"
            className="w-full px-3 py-2 border border-hair rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-evergreen"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-muted mb-1">
            The decision being made
          </label>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
            maxLength={2000}
            rows={3}
            placeholder="What's the question the client is trying to answer? (e.g., Which support platform replaces our current one — Zendesk vs Intercom vs HubSpot vs build internal?)"
            className="w-full px-3 py-2 border border-hair rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-evergreen"
          />
        </div>
      </section>

      {error && (
        <div className="px-4 py-3 bg-raised border border-brick rounded-lg text-sm text-brick">
          {error}
        </div>
      )}

      <div>
        <button
          type="submit"
          disabled={submitting || !title.trim() || !question.trim()}
          className={`px-5 py-2.5 text-sm font-semibold rounded-lg ${
            submitting || !title.trim() || !question.trim()
              ? "bg-hair text-faint cursor-not-allowed"
              : "bg-evergreen text-white hover:bg-evergreen-deep"
          }`}
        >
          {submitting
            ? "Creating..."
            : "Create selection (default criteria seeded)"}
        </button>
      </div>
    </form>
  );
}
