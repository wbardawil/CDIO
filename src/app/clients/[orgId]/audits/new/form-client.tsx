"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type OptionDraft = { id: string; label: string; material: string };

function newOption(): OptionDraft {
  return {
    id:
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `opt_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    label: "",
    material: "",
  };
}

export function NewAuditForm({ orgId }: { orgId: string }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [decision, setDecision] = useState("");
  const [principalRole, setPrincipalRole] = useState("");
  const [accountability, setAccountability] = useState("");
  const [totalCost, setTotalCost] = useState("");
  const [strategyContext, setStrategyContext] = useState("");
  const [operatingContext, setOperatingContext] = useState("");
  const [extraContext, setExtraContext] = useState("");
  const [options, setOptions] = useState<OptionDraft[]>([newOption()]);

  function patchOption(id: string, patch: Partial<OptionDraft>) {
    setOptions((prev) =>
      prev.map((o) => (o.id === id ? { ...o, ...patch } : o))
    );
  }
  function addOption() {
    setOptions((prev) => [...prev, newOption()]);
  }
  function removeOption(id: string) {
    setOptions((prev) =>
      prev.length <= 1 ? prev : prev.filter((o) => o.id !== id)
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!decision.trim()) {
      setError(
        "Name the decision in one line (e.g. “Which CRM for the university”). Everything else can be partial — gaps become findings."
      );
      return;
    }
    const cleanOptions = options
      .map((o) => ({
        id: o.id,
        label: o.label.trim(),
        material: o.material.trim(),
      }))
      .filter((o) => o.label || o.material);
    if (cleanOptions.length === 0) {
      setError(
        "Add at least one option with its real material pasted in. With nothing concrete on the table there is nothing to stress-test."
      );
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/audits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          org_id: orgId,
          title: decision.trim().slice(0, 280),
          intake: {
            decision: decision.trim(),
            principal_role: principalRole.trim(),
            accountability: accountability.trim(),
            total_cost: totalCost.trim(),
            options: cleanOptions,
            strategy_context: strategyContext.trim(),
            operating_context: operatingContext.trim(),
            extra_context: extraContext.trim(),
          },
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || j.details || "Failed to create audit");
      }
      const { audit } = await res.json();
      router.push(`/clients/${orgId}/audits/${audit.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  const input =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800";
  const area = input + " font-mono text-[13px] leading-relaxed";
  const label = "block text-sm font-semibold text-gray-900 mb-1";
  const hint = "text-xs text-gray-500 mb-2";
  const sectionNo =
    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white text-xs font-bold";

  return (
    <form onSubmit={submit} className="space-y-10 pb-16">
      {/* Philosophy banner */}
      <div className="rounded-xl bg-slate-900 text-slate-100 p-5">
        <p className="text-sm font-semibold mb-1">
          Don&apos;t fill a form. Dump what you have.
        </p>
        <p className="text-[13px] leading-relaxed text-slate-300">
          Paste the actual proposals, quotes, SOWs, meeting notes and
          transcripts &mdash; <strong>raw and unedited</strong>, across every
          option on the table. The audit reads it and structures it; you do
          not summarize. Blank fields are not errors &mdash; a decision this
          size that can&apos;t articulate its strategy or operating reality is
          itself the first finding. Loyalty is to you and the person
          accountable &mdash; never the vendor.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-800">
          {error}
        </div>
      )}

      {/* 1 — The decision */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <span className={sectionNo}>1</span>
          <h2 className="text-lg font-bold text-gray-900">The decision</h2>
        </div>
        <div>
          <label className={label}>
            What decision is actually being made? (one line)
          </label>
          <p className={hint}>
            One decision per audit. Not the vendor &mdash; the decision.
          </p>
          <input
            className={input}
            value={decision}
            onChange={(e) => setDecision(e.target.value)}
            placeholder="Which CRM for the university — new platform vs extend the incumbent"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={label}>Accountable principal (role)</label>
            <input
              className={input}
              value={principalRole}
              onChange={(e) => setPrincipalRole(e.target.value)}
              placeholder="CRO"
            />
          </div>
          <div>
            <label className={label}>
              What gets them fired if this is wrong?
            </label>
            <input
              className={input}
              value={accountability}
              onChange={(e) => setAccountability(e.target.value)}
              placeholder="Sales quota miss; automation never materializes"
            />
          </div>
        </div>
        <div>
          <label className={label}>All-in cost (if known)</label>
          <input
            className={input}
            value={totalCost}
            onChange={(e) => setTotalCost(e.target.value)}
            placeholder="$341K incl. implementation, 3-year term"
          />
        </div>
      </section>

      {/* 2 — Options */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <span className={sectionNo}>2</span>
          <h2 className="text-lg font-bold text-gray-900">
            Options on the table
          </h2>
          <span className="text-xs text-gray-500">
            {options.length} {options.length === 1 ? "option" : "options"} —
            the audit compares them
          </span>
        </div>
        <p className={hint}>
          Real decisions have 2&ndash;3 finalists. For each, paste the actual
          proposal / quote / SOW / email / notes &mdash; verbatim. Don&apos;t
          tidy it. The engine extracts structure across all options and names
          the recommended one.
        </p>

        <div className="space-y-4">
          {options.map((o, i) => (
            <div
              key={o.id}
              className="rounded-xl border border-gray-200 bg-white p-4"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-bold text-gray-400">
                  OPTION {i + 1}
                </span>
                <input
                  className={input + " flex-1"}
                  value={o.label}
                  onChange={(e) =>
                    patchOption(o.id, { label: e.target.value })
                  }
                  placeholder="Option name — e.g. HubSpot / Salesforce / Stay on incumbent + manual"
                />
                {options.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeOption(o.id)}
                    className="shrink-0 text-xs text-gray-400 hover:text-rose-600"
                  >
                    Remove
                  </button>
                )}
              </div>
              <textarea
                className={area}
                rows={6}
                value={o.material}
                onChange={(e) =>
                  patchOption(o.id, { material: e.target.value })
                }
                placeholder="Paste this option's proposal / quote / SOW / pricing / your notes — raw, unedited. The engine structures it."
              />
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addOption}
          className="text-sm font-semibold text-slate-800 hover:text-slate-950"
        >
          + Add another option
        </button>
      </section>

      {/* 3 — Context */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <span className={sectionNo}>3</span>
          <h2 className="text-lg font-bold text-gray-900">
            Context (paste raw — don&apos;t summarize)
          </h2>
        </div>

        <div>
          <label className={label}>The strategy this is supposed to serve</label>
          <p className={hint}>
            Where the business is trying to play and how it intends to win.
            Blank here is itself a finding.
          </p>
          <textarea
            className={area}
            rows={4}
            value={strategyContext}
            onChange={(e) => setStrategyContext(e.target.value)}
            placeholder="Paste the strategy doc excerpt / board narrative / your notes on where the business is going…"
          />
        </div>

        <div>
          <label className={label}>
            How the org runs today + prior attempts + transcripts
          </label>
          <p className={hint}>
            Current process, who does what, tools in place, and especially{" "}
            <strong>what was tried before in this area and why it
            didn&apos;t stick</strong> &mdash; the strongest predictor of
            whether this one fails for the same reason. Paste meeting
            transcripts here too.
          </p>
          <textarea
            className={area}
            rows={6}
            value={operatingContext}
            onChange={(e) => setOperatingContext(e.target.value)}
            placeholder="Paste raw: current process + tools, prior tool the team never finished configuring, call transcripts, who owns the process…"
          />
        </div>

        <div>
          <label className={label}>
            Anything else relevant{" "}
            <span className="font-normal text-gray-400">(optional)</span>
          </label>
          <p className={hint}>
            Emails, a described process diagram, side notes. The engine mines
            it.
          </p>
          <textarea
            className={area}
            rows={3}
            value={extraContext}
            onChange={(e) => setExtraContext(e.target.value)}
            placeholder="Paste anything else — the engine will use it…"
          />
        </div>
      </section>

      <div className="flex items-center gap-4 border-t border-gray-200 pt-6">
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-3 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-950 disabled:opacity-50"
        >
          {submitting ? "Creating…" : "Create audit →"}
        </button>
        <span className="text-xs text-gray-500">
          Next screen: generate the in-room companion, then run the
          five-lens verdict.
        </span>
      </div>
    </form>
  );
}
