"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { AuditExtractionMeta, AuditFieldSource } from "@/types/audit";

type OptionFileNote = {
  name: string;
  ok: boolean;
  note?: string;
  storagePath?: string;
};
type OptionDraft = {
  id: string;
  label: string;
  material: string;
  fileNotes?: OptionFileNote[];
};

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

const ACCEPT =
  ".pdf,.docx,.xlsx,.txt,.md,.markdown,.csv,.tsv,.json,.log,.vtt,.srt,.doc,.xls,.ppt";
// Matches optionSchema.material max in /api/audits.
const MAX_OPTION_MATERIAL = 60000;

/** Per-option file attach. The practitioner is telling us which
 *  option these files belong to, so no AI is used — the files are
 *  parsed to raw text and appended to this option's material,
 *  verbatim (the audit mines raw reality itself). */
function OptionFiles({
  orgId,
  option,
  patch,
}: {
  orgId: string;
  option: OptionDraft;
  patch: (patch: Partial<OptionDraft>) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function take(files: FileList | File[]) {
    const list = Array.from(files);
    if (list.length === 0) return;
    setErr(null);
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("org_id", orgId);
      fd.append("mode", "parse");
      for (const f of list) fd.append("files", f);
      const res = await fetch("/api/audits/extract", {
        method: "POST",
        body: fd,
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(j.error || j.details || "Could not read those files");

      const parsed: Array<{
        name: string;
        ok: boolean;
        note?: string;
        text: string;
        storage_path?: string;
      }> = j.parsed ?? [];

      let material = option.material;
      for (const p of parsed) {
        if (!p.ok || !p.text.trim()) continue;
        const block = `===== FILE: ${p.name} =====\n${p.text.trim()}`;
        material = material.trim()
          ? `${material.trim()}\n\n${block}`
          : block;
      }
      const notes: OptionFileNote[] = parsed.map((p) => ({
        name: p.name,
        ok: p.ok,
        note: p.note,
        storagePath: p.storage_path,
      }));
      let capped = false;
      if (material.length > MAX_OPTION_MATERIAL) {
        material = material.slice(0, MAX_OPTION_MATERIAL);
        capped = true;
      }
      if (capped) {
        notes.push({
          name: "(combined)",
          ok: false,
          note: "Trimmed to fit this option — split very long material across options or trim it.",
        });
      }
      patch({ material, fileNotes: notes });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not read those files");
    } finally {
      setBusy(false);
      if (ref.current) ref.current.value = "";
    }
  }

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        if (e.dataTransfer.files?.length) take(e.dataTransfer.files);
      }}
    >
      <input
        ref={ref}
        type="file"
        multiple
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => e.target.files && take(e.target.files)}
      />
      <div className="mt-2 flex items-center gap-3">
        <button
          type="button"
          onClick={() => ref.current?.click()}
          disabled={busy}
          className="text-xs font-semibold text-slate-700 hover:text-slate-950 disabled:opacity-50"
        >
          {busy
            ? "Reading…"
            : "+ Attach files to this option (or drop here)"}
        </button>
        <span className="text-[11px] text-gray-400">
          appended raw to the material above
        </span>
      </div>
      {err && (
        <p className="mt-1 text-[11px] text-rose-700">{err}</p>
      )}
      {option.fileNotes && option.fileNotes.length > 0 && (
        <ul className="mt-1.5 space-y-0.5">
          {option.fileNotes.map((f, i) => (
            <li key={i} className="text-[11px] flex items-start gap-1.5">
              <span className={f.ok ? "text-emerald-600" : "text-rose-600"}>
                {f.ok ? "✓" : "✕"}
              </span>
              <span className="text-gray-600">
                <span className="font-medium">{f.name}</span>
                {f.note && <span className="text-gray-500"> — {f.note}</span>}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function NewAuditForm({ orgId }: { orgId: string }) {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [extracting, setExtracting] = useState(false);
  const [extractMeta, setExtractMeta] = useState<AuditExtractionMeta | null>(
    null
  );
  const [dragging, setDragging] = useState(false);

  const [decision, setDecision] = useState("");
  const [businessPain, setBusinessPain] = useState("");
  const [projectSummary, setProjectSummary] = useState("");
  const [principalRole, setPrincipalRole] = useState("");
  const [accountability, setAccountability] = useState("");
  const [totalCost, setTotalCost] = useState("");
  const [strategyContext, setStrategyContext] = useState("");
  const [operatingContext, setOperatingContext] = useState("");
  const [extraContext, setExtraContext] = useState("");
  const [options, setOptions] = useState<OptionDraft[]>([newOption()]);
  const [showMore, setShowMore] = useState(false);

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

  async function handleFiles(files: FileList | File[]) {
    const list = Array.from(files);
    if (list.length === 0) return;
    setError(null);
    setExtracting(true);
    try {
      const fd = new FormData();
      fd.append("org_id", orgId);
      for (const f of list) fd.append("files", f);
      const res = await fetch("/api/audits/extract", {
        method: "POST",
        body: fd,
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        setExtractMeta((j.meta as AuditExtractionMeta) ?? null);
        throw new Error(j.error || j.details || "Could not read those files");
      }
      const d = j.draft ?? {};
      // Pre-fill — but only overwrite a field if extraction found
      // something, so a second upload augments rather than wipes.
      if (d.decision) setDecision(d.decision);
      if (d.business_pain) setBusinessPain(d.business_pain);
      if (d.project_summary) setProjectSummary(d.project_summary);
      if (d.principal_role) setPrincipalRole(d.principal_role);
      if (d.accountability) setAccountability(d.accountability);
      if (d.total_cost) setTotalCost(d.total_cost);
      if (d.strategy_context) setStrategyContext(d.strategy_context);
      if (d.operating_context) setOperatingContext(d.operating_context);
      if (d.extra_context) setExtraContext(d.extra_context);
      if (Array.isArray(d.options) && d.options.length > 0) {
        setOptions(
          d.options.map(
            (o: { label?: string; material?: string }) => ({
              ...newOption(),
              label: o.label ?? "",
              material: o.material ?? "",
            })
          )
        );
      }
      setExtractMeta((j.meta as AuditExtractionMeta) ?? null);
      setShowMore(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not read those files"
      );
    } finally {
      setExtracting(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!decision.trim()) {
      setError(
        "Name the decision in one line (e.g. “Which CRM for the university”). Upload your docs above and it fills itself — or type it. Gaps become findings."
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
        "Add at least one option with its real material. With nothing concrete on the table there is nothing to stress-test."
      );
      return;
    }

    // Archived originals (bulk + per-option) so the verdict is
    // reconstructable later.
    const evidence: { name: string; storage_path: string; from: string }[] =
      [];
    for (const f of extractMeta?.files ?? []) {
      if (f.storage_path)
        evidence.push({
          name: f.name,
          storage_path: f.storage_path,
          from: "upload",
        });
    }
    options.forEach((o, idx) => {
      for (const fn of o.fileNotes ?? []) {
        if (fn.storagePath)
          evidence.push({
            name: fn.name,
            storage_path: fn.storagePath,
            from: o.label.trim() || `Option ${idx + 1}`,
          });
      }
    });

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
            business_pain: businessPain.trim(),
            project_summary: projectSummary.trim(),
            principal_role: principalRole.trim(),
            accountability: accountability.trim(),
            total_cost: totalCost.trim(),
            options: cleanOptions,
            strategy_context: strategyContext.trim(),
            operating_context: operatingContext.trim(),
            extra_context: extraContext.trim(),
            extraction: extractMeta,
            evidence: evidence.slice(0, 30),
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

  function Provenance({ field }: { field: string }) {
    const s: AuditFieldSource | undefined =
      extractMeta?.field_sources?.[field];
    if (!s) return null;
    if (s.confidence === "not_found") {
      return (
        <p className="mt-1 text-[11px] text-amber-700">
          Not found in your files — fill this in, or it becomes the audit&apos;s
          first finding.
        </p>
      );
    }
    return (
      <p
        className="mt-1 text-[11px] text-gray-500"
        title={s.quote ? `“${s.quote}”` : undefined}
      >
        <span
          className={`inline-block w-1.5 h-1.5 rounded-full mr-1 align-middle ${
            s.confidence === "high" ? "bg-emerald-500" : "bg-amber-500"
          }`}
        />
        from <span className="font-medium text-gray-700">{s.file}</span>
        {s.confidence === "low" && " · double-check this one"}
      </p>
    );
  }

  const parsedFiles = extractMeta?.files ?? [];

  return (
    <form onSubmit={submit} className="space-y-10 pb-16">
      {/* The friction killer — evidence in, draft out. */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
        }}
        className={`rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
          dragging
            ? "border-slate-800 bg-slate-50"
            : "border-gray-300 bg-white"
        }`}
      >
        <p className="text-sm font-semibold text-gray-900 mb-1">
          Drop what you already have — the audit reads it for you.
        </p>
        <p className="text-[13px] text-gray-500 mb-4 max-w-xl mx-auto">
          Interviews, transcripts (incl. .vtt/.srt), proposals, quotes, SOWs,
          spreadsheets, notes. PDF · Word · Excel · text. It extracts the pain,
          the project and the options and fills this in — you just check it.
          Originals are archived privately so the verdict stays defensible.
          Keep a single upload under ~4&nbsp;MB (host limit) — attach big
          per-option files lower down.
        </p>
        <input
          ref={fileInput}
          type="file"
          multiple
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          disabled={extracting}
          className="px-5 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-950 disabled:opacity-50"
        >
          {extracting ? "Reading your files…" : "Choose files / drop here"}
        </button>

        {parsedFiles.length > 0 && (
          <ul className="mt-4 text-left max-w-xl mx-auto space-y-1">
            {parsedFiles.map((f) => (
              <li
                key={f.name}
                className="text-xs flex items-start gap-2"
              >
                <span className={f.ok ? "text-emerald-600" : "text-rose-600"}>
                  {f.ok ? "✓" : "✕"}
                </span>
                <span className="text-gray-700">
                  <span className="font-medium">{f.name}</span>
                  {f.note && (
                    <span className="text-gray-500"> — {f.note}</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && (
        <div className="rounded-lg bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-800">
          {error}
        </div>
      )}

      {/* 1 — The pain & the project (led, plain). */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <span className={sectionNo}>1</span>
          <h2 className="text-lg font-bold text-gray-900">
            The pain &amp; the project
          </h2>
        </div>

        <div>
          <label className={label}>What is the business pain?</label>
          <p className={hint}>
            What actually hurts today, and what it costs. Plain language.
          </p>
          <textarea
            className={area}
            rows={3}
            value={businessPain}
            onChange={(e) => setBusinessPain(e.target.value)}
            placeholder="e.g. Sales can't see pipeline across regions; deals slip; the team rebuilds the same report by hand every week."
          />
          <Provenance field="business_pain" />
        </div>

        <div>
          <label className={label}>What is the project?</label>
          <p className={hint}>What is actually being done, in plain terms.</p>
          <textarea
            className={area}
            rows={3}
            value={projectSummary}
            onChange={(e) => setProjectSummary(e.target.value)}
            placeholder="e.g. Replace the regional CRMs with one platform and migrate 3 years of pipeline data."
          />
          <Provenance field="project_summary" />
        </div>

        <div>
          <label className={label}>
            The decision being made (one line)
          </label>
          <p className={hint}>One decision per audit. Not the vendor — the decision.</p>
          <input
            className={input}
            value={decision}
            onChange={(e) => setDecision(e.target.value)}
            placeholder="New CRM platform vs extend the incumbent"
          />
          <Provenance field="decision" />
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
          Filled from your files when found. Each option keeps its raw
          material (proposal / quote / SOW / notes) — verbatim, not tidied.
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
                  placeholder="Option name — e.g. HubSpot / Salesforce / Stay on incumbent"
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
                placeholder="This option's proposal / quote / SOW / pricing / notes — raw."
              />
              <Provenance field={`option:${i}`} />
              <OptionFiles
                orgId={orgId}
                option={o}
                patch={(p) => patchOption(o.id, p)}
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

      {/* 3 — More context the audit also uses (collapsed for speed). */}
      <section className="space-y-4">
        <button
          type="button"
          onClick={() => setShowMore((v) => !v)}
          className="flex items-center gap-3 text-left"
        >
          <span className={sectionNo}>3</span>
          <h2 className="text-lg font-bold text-gray-900">
            More context the audit also uses
          </h2>
          <span className="text-xs text-gray-500">
            {showMore ? "hide" : "show"} — optional, gaps become findings
          </span>
        </button>

        {showMore && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={label}>Accountable principal (role)</label>
                <input
                  className={input}
                  value={principalRole}
                  onChange={(e) => setPrincipalRole(e.target.value)}
                  placeholder="CRO"
                />
                <Provenance field="principal_role" />
              </div>
              <div>
                <label className={label}>
                  What gets them fired if this is wrong?
                </label>
                <input
                  className={input}
                  value={accountability}
                  onChange={(e) => setAccountability(e.target.value)}
                  placeholder="Quota miss; automation never materializes"
                />
                <Provenance field="accountability" />
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
              <Provenance field="total_cost" />
            </div>
            <div>
              <label className={label}>
                The strategy this is supposed to serve
              </label>
              <textarea
                className={area}
                rows={3}
                value={strategyContext}
                onChange={(e) => setStrategyContext(e.target.value)}
                placeholder="Where the business is trying to play and how it intends to win…"
              />
              <Provenance field="strategy_context" />
            </div>
            <div>
              <label className={label}>
                How the org runs today + prior attempts + transcripts
              </label>
              <textarea
                className={area}
                rows={5}
                value={operatingContext}
                onChange={(e) => setOperatingContext(e.target.value)}
                placeholder="Current process + tools, what was tried before and why it didn't stick, call transcripts…"
              />
              <Provenance field="operating_context" />
            </div>
            <div>
              <label className={label}>
                Anything else relevant{" "}
                <span className="font-normal text-gray-400">(optional)</span>
              </label>
              <textarea
                className={area}
                rows={3}
                value={extraContext}
                onChange={(e) => setExtraContext(e.target.value)}
                placeholder="Emails, a described diagram, side notes…"
              />
              <Provenance field="extra_context" />
            </div>
          </div>
        )}
      </section>

      <div className="flex items-center gap-4 border-t border-gray-200 pt-6">
        <button
          type="submit"
          disabled={submitting || extracting}
          className="px-6 py-3 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-950 disabled:opacity-50"
        >
          {submitting ? "Creating…" : "Create audit →"}
        </button>
        <span className="text-xs text-gray-500">
          Next: the verdict, the gaps vs best practice, and an
          audit-ready initiative.
        </span>
      </div>
    </form>
  );
}
