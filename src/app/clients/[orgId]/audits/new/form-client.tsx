"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function NewAuditForm({ orgId }: { orgId: string }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    system_name: "",
    vendor_name: "",
    total_cost: "",
    principal_role: "",
    accountability: "",
    vendor_proposal: "",
    current_operating_model: "",
    strategy_served: "",
    prior_attempts: "",
    ai_model_ownership: "",
    demo_observations: "",
  });

  const set = (k: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.title.trim()) {
      setError("Give the audit a title (e.g. “Ambar ERP — Acme vs incumbent”).");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/audits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          org_id: orgId,
          title: form.title.trim(),
          intake: {
            system_name: form.system_name.trim(),
            vendor_name: form.vendor_name.trim(),
            total_cost: form.total_cost.trim(),
            principal_role: form.principal_role.trim(),
            accountability: form.accountability.trim(),
            vendor_proposal: form.vendor_proposal.trim(),
            current_operating_model: form.current_operating_model.trim(),
            strategy_served: form.strategy_served.trim(),
            prior_attempts: form.prior_attempts.trim(),
            ai_model_ownership: form.ai_model_ownership.trim(),
            demo_observations: form.demo_observations.trim(),
          },
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Failed to create audit");
      }
      const { audit } = await res.json();
      router.push(`/clients/${orgId}/audits/${audit.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  const field =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";
  const labelCls = "block text-sm font-medium text-gray-900 mb-1";
  const hintCls = "text-xs text-gray-500 mb-1.5";

  return (
    <form onSubmit={submit} className="space-y-6">
      {error && (
        <div className="px-4 py-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-800">
          {error}
        </div>
      )}

      <div>
        <label className={labelCls}>Audit title</label>
        <p className={hintCls}>One decision per audit. Name the decision.</p>
        <input
          className={field}
          value={form.title}
          onChange={set("title")}
          placeholder="Ambar ERP — Acme Cloud vs stay on incumbent"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>System / technology being bought</label>
          <input
            className={field}
            value={form.system_name}
            onChange={set("system_name")}
            placeholder="Cloud ERP platform"
          />
        </div>
        <div>
          <label className={labelCls}>Vendor</label>
          <input
            className={field}
            value={form.vendor_name}
            onChange={set("vendor_name")}
            placeholder="Acme Cloud"
          />
        </div>
      </div>

      <div>
        <label className={labelCls}>Total cost</label>
        <p className={hintCls}>
          All-in if you know it. Include term (e.g. &quot;$420K over 3 years
          incl. implementation&quot;).
        </p>
        <input
          className={field}
          value={form.total_cost}
          onChange={set("total_cost")}
          placeholder="$420,000 over 3 years"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Accountable principal (role)</label>
          <input
            className={field}
            value={form.principal_role}
            onChange={set("principal_role")}
            placeholder="COO"
          />
        </div>
        <div>
          <label className={labelCls}>
            What gets them fired if this is wrong?
          </label>
          <input
            className={field}
            value={form.accountability}
            onChange={set("accountability")}
            placeholder="Quarter-close breaks; board loses confidence"
          />
        </div>
      </div>

      <div>
        <label className={labelCls}>Vendor proposal / quote / SOW</label>
        <p className={hintCls}>
          Paste it. Feature list, pricing, SOW — whatever you have.
        </p>
        <textarea
          className={field}
          rows={6}
          value={form.vendor_proposal}
          onChange={set("vendor_proposal")}
          placeholder="Paste the proposal text…"
        />
      </div>

      <div>
        <label className={labelCls}>
          How the organization runs today (in this area)
        </label>
        <p className={hintCls}>
          Current process, tools, who does what. The audit checks fit against
          the org you have, not the one the vendor assumes.
        </p>
        <textarea
          className={field}
          rows={4}
          value={form.current_operating_model}
          onChange={set("current_operating_model")}
          placeholder="Today finance closes on spreadsheets + the incumbent ERP; 2 people own it…"
        />
      </div>

      <div>
        <label className={labelCls}>The strategy this is supposed to serve</label>
        <p className={hintCls}>
          Where the business is trying to play and how it intends to win.
          Blank here is itself a finding.
        </p>
        <textarea
          className={field}
          rows={4}
          value={form.strategy_served}
          onChange={set("strategy_served")}
          placeholder="Doubling headcount in 18 months; current ERP can't scale past X…"
        />
      </div>

      <div>
        <label className={labelCls}>
          Prior attempts in this area &mdash; and how they went
        </label>
        <p className={hintCls}>
          The single strongest predictor of failure. A previous tool the
          team never configured or followed means the next purchase likely
          fails for the same org-behavior reason &mdash; not the tool.
        </p>
        <textarea
          className={field}
          rows={3}
          value={form.prior_attempts}
          onChange={set("prior_attempts")}
          placeholder="e.g. similar tool bought two years ago — the owning team never completed configuration and abandoned it within months…"
        />
      </div>

      <div>
        <label className={labelCls}>
          AI / model ownership <span className="text-gray-400">(if AI/ML involved)</span>
        </label>
        <p className={hintCls}>
          Who owns the model + data layer? Can we bring our own model? Can
          it run on infrastructure we control? Vendors stay vague here on
          purpose &mdash; unstated model ownership is a lock-in red flag.
        </p>
        <textarea
          className={field}
          rows={3}
          value={form.ai_model_ownership}
          onChange={set("ai_model_ownership")}
          placeholder="e.g. vendor requires their own model; no bring-your-own-model option; data layer runs only on their infrastructure…"
        />
      </div>

      <div>
        <label className={labelCls}>
          Demo observations <span className="text-gray-400">(live vs scripted, per option)</span>
        </label>
        <p className={hintCls}>
          What did each option actually demonstrate? Separate demo polish
          and perceived industry familiarity (cheap to remediate) from
          technical capability shown live, on the fly (structural).
        </p>
        <textarea
          className={field}
          rows={3}
          value={form.demo_observations}
          onChange={set("demo_observations")}
          placeholder="e.g. Option A: polished scripted demo, fluent in our industry terms. Option B: configured against our actual requirement live, on the fly…"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? "Creating…" : "Create audit"}
        </button>
        <span className="text-xs text-gray-500">
          You can run with partial intake — gaps become findings.
        </span>
      </div>
    </form>
  );
}
