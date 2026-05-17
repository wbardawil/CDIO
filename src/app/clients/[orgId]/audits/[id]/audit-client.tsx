"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  type Audit,
  type AuditLensKey,
  AUDIT_VERDICT_LABEL,
  AUDIT_LENS_META,
  evaluateIntakeGaps,
} from "@/types/audit";
import { AuditProgress } from "../audit-progress";

const SEVERITY_STYLE: Record<string, string> = {
  critical: "bg-rose-100 text-rose-800 border-rose-200",
  high: "bg-amber-100 text-amber-800 border-amber-200",
  moderate: "bg-slate-100 text-slate-700 border-slate-200",
};
const SEVERITY_RANK: Record<string, number> = {
  critical: 0,
  high: 1,
  moderate: 2,
};

const LENS_ORDER: AuditLensKey[] = (
  Object.keys(AUDIT_LENS_META) as AuditLensKey[]
).sort((a, b) => AUDIT_LENS_META[a].order - AUDIT_LENS_META[b].order);

const VERDICT_STYLE: Record<string, string> = {
  buy: "bg-emerald-600 text-white",
  dont_buy: "bg-rose-600 text-white",
  renegotiate: "bg-amber-500 text-white",
  hold: "bg-slate-700 text-white",
};

// Plain-English, one-line "what to do" per verdict — the spine's
// Law 5: the principal reads the decision in 15 seconds, before
// any analysis.
const VERDICT_RECO: Record<string, string> = {
  buy: "Proceed with this purchase.",
  dont_buy: "Do not sign this. Walk away from this option.",
  renegotiate: "Do not sign as-is. Renegotiate the terms below first.",
  hold: "Pause. Do not sign until the open items below are resolved.",
};

const FLAG_STYLE: Record<string, string> = {
  KILL: "bg-rose-100 text-rose-800 border-rose-200",
  GO: "bg-emerald-100 text-emerald-800 border-emerald-200",
  RENEGOTIATE: "bg-amber-100 text-amber-800 border-amber-200",
};

export function AuditDetailClient({
  orgId,
  initialAudit,
}: {
  orgId: string;
  initialAudit: Audit;
}) {
  const router = useRouter();

  const [audit, setAudit] = useState<Audit>(initialAudit);
  const [running, setRunning] = useState(false);
  const [prepping, setPrepping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [creatingInitiative, setCreatingInitiative] = useState(false);
  const [createdInitiativeId, setCreatedInitiativeId] = useState<string | null>(
    null
  );

  const gaps = evaluateIntakeGaps(audit.intake);

  async function createInitiative() {
    const ri = audit.output?.recommended_initiative;
    if (!ri) return;
    setError(null);
    setCreatingInitiative(true);
    try {
      const res = await fetch("/api/initiatives", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          org_id: orgId,
          title: ri.title,
          goal: ri.goal || ri.title,
          domain: ri.domain,
          module_number: ri.module_number ?? null,
          steps: ri.steps.map((s) => ({
            title: s.title,
            description: s.description || null,
          })),
          practitioner_notes: `Generated from the pre-purchase audit "${audit.title}".`,
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(
          j.error || j.details || "Could not create the initiative"
        );
      const id = j.initiative?.id as string | undefined;
      if (id) {
        setCreatedInitiativeId(id);
        router.push(`/clients/${orgId}/initiatives/${id}`);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not create the initiative"
      );
    } finally {
      setCreatingInitiative(false);
    }
  }

  async function run() {
    setError(null);
    setRunning(true);
    try {
      const res = await fetch(`/api/audits/${audit.id}/run`, {
        method: "POST",
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error || j.details || "Audit run failed");
      setAudit(j.audit as Audit);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Audit run failed");
    } finally {
      setRunning(false);
    }
  }

  async function prep() {
    setError(null);
    setPrepping(true);
    try {
      const res = await fetch(`/api/audits/${audit.id}/companion`, {
        method: "POST",
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(j.error || j.details || "Companion generation failed");
      setAudit(j.audit as Audit);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Companion generation failed"
      );
    } finally {
      setPrepping(false);
    }
  }

  const out = audit.output;
  const card = "bg-white rounded-xl border border-gray-200 p-6";

  // Law 4 — the visible spine. Frame is done the moment the audit
  // row exists (we are on its detail screen). Prep completes when
  // the companion is generated; the verdict completes when output
  // is rendered. Focus follows the next actionable step.
  const doneSteps = [
    1,
    ...(audit.companion ? [2] : []),
    ...(out ? [3] : []),
  ];
  const focusStep: 1 | 2 | 3 = out ? 3 : audit.companion ? 3 : 2;

  function printFull() {
    setShowAnalysis(true);
    // Let the disclosure paint before the print dialog captures it.
    setTimeout(() => window.print(), 50);
  }

  return (
    <div className="space-y-6">
      {/* Persistent progress strip — always visible (Law 4). */}
      <div className="rounded-xl border border-gray-200 bg-white px-5 py-4 print:hidden">
        <AuditProgress step={focusStep} done={doneSteps} />
      </div>

      {/* Slim, plain trust line — the whole differentiation in one
          sentence. Full independence + advisory text lives in the
          analysis disclosure, not as front-of-house decoration. */}
      <p className="text-xs text-gray-500">
        Independent review · loyal only to the accountable principal ·
        principal-paid, zero vendor fees · advisory (the decision stays
        yours).
      </p>

      {out ? (
        <>
          {/* The pain, first — what this is all for. */}
          {(out.business_pain || audit.intake.business_pain) && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-1">
                The pain this has to solve
              </p>
              <p className="text-base text-gray-900 leading-relaxed">
                {out.business_pain || audit.intake.business_pain}
              </p>
            </div>
          )}

          {/* ===== Law 5: the 15-second read ===== */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span
                className={`px-4 py-1.5 rounded-md text-lg font-bold ${
                  VERDICT_STYLE[out.overall_call] ?? "bg-gray-700 text-white"
                }`}
              >
                {AUDIT_VERDICT_LABEL[out.overall_call]}
              </span>
              {out.headline_money && (
                <span className="text-lg font-semibold text-gray-900">
                  {out.headline_money}
                </span>
              )}
            </div>
            <p className="text-base font-semibold text-gray-900 mb-4">
              {VERDICT_RECO[out.overall_call] ?? "Read the recommendation below."}
            </p>
            <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
              {out.board_summary}
            </p>
          </div>

          {/* What's off vs best practice — the methodology, surfaced
              plainly. Only the few that change the outcome. */}
          {out.gaps && out.gaps.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                What&apos;s off vs best practice
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                The few gaps that actually change the outcome — not a checklist.
              </p>
              <ul className="space-y-4">
                {[...out.gaps]
                  .sort(
                    (a, b) =>
                      (SEVERITY_RANK[a.severity] ?? 9) -
                      (SEVERITY_RANK[b.severity] ?? 9)
                  )
                  .map((g, i) => (
                    <li
                      key={i}
                      className="border-l-2 border-gray-200 pl-4"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-gray-900">
                          {g.gap}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold border uppercase ${
                            SEVERITY_STYLE[g.severity] ??
                            "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {g.severity}
                        </span>
                      </div>
                      {g.why_it_matters && (
                        <p className="text-sm text-gray-800 mb-1">
                          {g.why_it_matters}
                        </p>
                      )}
                      {g.best_practice && (
                        <p className="text-xs text-gray-600 mb-0.5">
                          <span className="font-semibold">Best practice:</span>{" "}
                          {g.best_practice}
                        </p>
                      )}
                      {g.evidence && (
                        <p className="text-xs text-gray-500">
                          <span className="font-semibold">Because:</span>{" "}
                          {g.evidence}
                        </p>
                      )}
                    </li>
                  ))}
              </ul>
            </div>
          )}

          {/* It actually helps — the audit-ready initiative, one
              click to a structured, best-practice-shaped plan. */}
          {out.recommended_initiative && (
            <div className="bg-white rounded-xl border border-blue-200 p-6">
              <div className="flex items-start justify-between gap-3 mb-1">
                <h3 className="text-sm font-semibold text-gray-900">
                  Your audit-ready initiative
                </h3>
                {createdInitiativeId ? (
                  <span className="text-xs font-semibold text-emerald-700 print:hidden">
                    ✓ Created
                  </span>
                ) : (
                  <button
                    onClick={createInitiative}
                    disabled={creatingInitiative}
                    className="shrink-0 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 print:hidden"
                  >
                    {creatingInitiative
                      ? "Creating…"
                      : "Create this initiative →"}
                  </button>
                )}
              </div>
              <p className="text-base font-semibold text-gray-900 mt-1">
                {out.recommended_initiative.title}
              </p>
              {out.recommended_initiative.goal && (
                <p className="text-sm text-gray-700 mt-1 mb-3">
                  {out.recommended_initiative.goal}
                </p>
              )}
              <ol className="space-y-2">
                {out.recommended_initiative.steps.map((s, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white text-[11px] font-bold">
                      {i + 1}
                    </span>
                    <span>
                      <span className="font-medium text-gray-900">
                        {s.title}
                      </span>
                      {s.description && (
                        <span className="text-gray-600">
                          {" "}
                          — {s.description}
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ol>
              <p className="mt-3 text-[11px] text-gray-400">
                Shaped to comply with best practice by construction. Creating
                it opens the initiative with these steps ready to assign.
              </p>
            </div>
          )}

          {/* The full rigor — real, cited, lens-by-lens — but earned
              trust behind one explicit disclosure (Law 3 + Law 5). */}
          <div className="print:block">
            <button
              onClick={() => setShowAnalysis((v) => !v)}
              className="w-full flex items-center justify-between gap-3 px-5 py-3 bg-white rounded-xl border border-gray-200 text-sm font-semibold text-gray-800 hover:bg-gray-50 print:hidden"
              aria-expanded={showAnalysis}
            >
              <span>
                {showAnalysis ? "Hide the full analysis" : "Show the full analysis"}
              </span>
              <span className="text-gray-400 font-normal">
                strategy fit · requirements · five lenses · evidence · method
              </span>
            </button>

            {/* Always in the DOM (so print captures it) but hidden on
                screen until the disclosure is opened. */}
            <div
              className={`${showAnalysis ? "block" : "hidden"} print:block space-y-6 mt-6`}
            >
                {/* What was on the table */}
                <div className={card}>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">
                    The decision on the table
                  </h3>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    <Row label="Decision" value={audit.intake.decision} />
                    <Row
                      label="Options"
                      value={(audit.intake.options ?? [])
                        .map((opt) => opt.label)
                        .filter(Boolean)
                        .join(" vs ")}
                    />
                    <Row label="Total cost" value={audit.intake.total_cost} />
                    <Row
                      label="Accountable"
                      value={audit.intake.principal_role}
                    />
                  </dl>
                  {gaps.finding && (
                    <div className="mt-4 px-3 py-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900">
                      <strong>
                        Intake gap (this is itself the first finding):
                      </strong>{" "}
                      {gaps.finding}
                    </div>
                  )}
                  {audit.intake.extraction?.files?.length ? (
                    <p className="mt-3 text-[11px] text-gray-400">
                      Intake built from:{" "}
                      {audit.intake.extraction.files
                        .filter((f) => f.ok)
                        .map((f) => f.name)
                        .join(", ") || "uploaded evidence"}
                      . Each field was reviewed before this audit ran.
                    </p>
                  ) : null}
                </div>

                {/* Strategy fit */}
                <div className={card}>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">
                    Does it fit the strategy?
                  </h3>
                  <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {out.strategy_verdict}
                  </p>
                </div>

                {/* Requirements brief */}
                <div className={card}>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">
                    What it actually has to do
                  </h3>
                  <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {out.requirements_brief}
                  </p>
                </div>

                {/* Per-lens findings */}
                <div className={card}>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">
                    The five-lens analysis
                  </h3>
                  <p className="text-xs text-gray-500 mb-4">
                    Each lens is one structural thing the room is usually not
                    looking at, with the evidence behind it.
                  </p>
                  <ul className="space-y-4">
                    {LENS_ORDER.map((lensKey) => {
                      const f = out.lens_findings.find(
                        (x) => x.lens === lensKey
                      );
                      const meta = AUDIT_LENS_META[lensKey];
                      if (!f) return null;
                      return (
                        <li
                          key={lensKey}
                          className="border-l-2 border-gray-200 pl-4"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-gray-900">
                              {meta.label}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                                FLAG_STYLE[f.flag] ??
                                "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {f.flag}
                            </span>
                          </div>
                          <p className="text-sm text-gray-800 mb-1">
                            {f.finding}
                          </p>
                          <p className="text-xs text-gray-500">
                            <span className="font-semibold">Because:</span>{" "}
                            {f.evidence}
                          </p>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* Method Capture */}
                {audit.method_capture &&
                  audit.method_capture.length > 0 && (
                    <div className={card}>
                      <h3 className="text-sm font-semibold text-gray-900 mb-1">
                        The reusable question checklist
                      </h3>
                      <p className="text-xs text-gray-500 mb-4">
                        Every question this audit actually asked, grouped by
                        lens. The ★ marks the question that did the most work
                        on this case. This list compounds — the next audit
                        starts here.
                      </p>
                      <div className="space-y-4">
                        {LENS_ORDER.map((lensKey) => {
                          const mc = audit.method_capture!.find(
                            (m) => m.lens === lensKey
                          );
                          if (!mc || mc.questions.length === 0) return null;
                          return (
                            <div key={lensKey}>
                              <p className="text-xs font-semibold text-gray-700 mb-1">
                                {AUDIT_LENS_META[lensKey].label}
                              </p>
                              <ul className="space-y-1">
                                {mc.questions.map((q, i) => (
                                  <li
                                    key={i}
                                    className="text-xs text-gray-600 flex gap-2"
                                  >
                                    <span className="text-amber-500">
                                      {i === mc.highest_leverage_index
                                        ? "★"
                                        : "·"}
                                    </span>
                                    <span>{q}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                {/* The companion stays available as the prep record. */}
                {audit.companion && (
                  <div className={card}>
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">
                      The questions taken into the room
                    </h3>
                    <p className="text-xs text-gray-600 italic mb-3">
                      {audit.companion.meeting_context}
                    </p>
                    {audit.companion.do_not_leave_without_asking && (
                      <div className="px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg mb-3">
                        <p className="text-[10px] uppercase tracking-wide font-bold text-amber-700 mb-1">
                          Do not leave the room without asking
                        </p>
                        <p className="text-sm text-amber-900 font-medium">
                          {audit.companion.do_not_leave_without_asking}
                        </p>
                      </div>
                    )}
                    <div className="space-y-3">
                      {LENS_ORDER.map((lensKey) => {
                        const l = audit.companion!.lenses.find(
                          (x) => x.lens === lensKey
                        );
                        if (!l || l.questions.length === 0) return null;
                        return (
                          <div
                            key={lensKey}
                            className="border-l-2 border-blue-200 pl-4"
                          >
                            <p className="text-xs font-semibold text-gray-900 mb-1.5">
                              {AUDIT_LENS_META[lensKey].label}
                            </p>
                            <ul className="space-y-1">
                              {l.questions.map((q, i) => (
                                <li
                                  key={i}
                                  className="text-sm text-gray-800 flex gap-2"
                                >
                                  <span className="text-blue-400">›</span>
                                  <span>{q}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Independence & advisory boundary — the rigor that
                    earns trust, kept off the front of house. */}
                <div className="border-t border-gray-200 pt-4 text-[11px] leading-relaxed text-gray-500">
                  <p className="font-semibold text-gray-600 mb-1">
                    Independence &amp; advisory boundary
                  </p>
                  <p>
                    This audit is the practitioner&apos;s independent
                    professional opinion (BUY / DON&apos;T BUY / RENEGOTIATE /
                    HOLD), rendered on the evidence made available during the
                    engagement. The verdict is <strong>advisory</strong>: final
                    purchasing authority and accountability rest solely with
                    the principal. Where a required input could not be
                    supplied, that limitation is itself a documented finding
                    and may default the verdict to HOLD. The practitioner
                    receives no fee, referral, commission, or consideration of
                    any kind from any vendor evaluated — this engagement is
                    principal-paid only. The audit covers one decision and ends
                    at the verdict; it does not include implementation design,
                    contract negotiation, or organizational rollout.
                  </p>
                </div>
            </div>
          </div>

          <div className="print:hidden">
            <button
              onClick={printFull}
              className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50"
            >
              Print / Save as PDF
            </button>
          </div>
        </>
      ) : (
        <>
          {/* ===== Not yet run — the one primary action is Run ===== */}
          <div className={card}>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              {audit.title}
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              The decision is framed. Run the audit to get the plain verdict,
              the money, and the recommendation.
            </p>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <Row label="Decision" value={audit.intake.decision} />
              <Row
                label="Options"
                value={(audit.intake.options ?? [])
                  .map((opt) => opt.label)
                  .filter(Boolean)
                  .join(" vs ")}
              />
              <Row label="Total cost" value={audit.intake.total_cost} />
              <Row label="Accountable" value={audit.intake.principal_role} />
            </dl>

            {gaps.finding && (
              <div className="mt-4 px-3 py-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900">
                <strong>
                  Intake gap (this is itself the first finding):
                </strong>{" "}
                {gaps.finding}
              </div>
            )}

            <div className="mt-5 flex items-center gap-3">
              <button
                onClick={run}
                disabled={running || audit.status === "running"}
                className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {running || audit.status === "running"
                  ? "Running the analysis…"
                  : "Run the audit"}
              </button>
              <span className="text-xs text-gray-500">
                Returns the verdict + the money + the recommendation. ~30-60s.
              </span>
            </div>
            {error && (
              <div className="mt-3 px-3 py-2 bg-rose-50 border border-rose-200 rounded text-xs text-rose-800">
                {error}
              </div>
            )}
          </div>

          {/* Prep the room — secondary, before the meeting. */}
          <div className={card}>
            <div className="flex items-start justify-between gap-3 mb-1">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  Prep the room
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  The exact structural questions to ask while the vendor is
                  performing. Generate before the meeting; take it in.
                </p>
              </div>
              <button
                onClick={prep}
                disabled={prepping}
                className="shrink-0 px-3 py-1.5 border border-gray-300 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                {prepping
                  ? "Preparing…"
                  : audit.companion
                    ? "Regenerate the questions"
                    : "Generate the questions to ask"}
              </button>
            </div>

            {audit.companion && (
              <div className="mt-4 space-y-4">
                <p className="text-xs text-gray-600 italic">
                  {audit.companion.meeting_context}
                </p>
                {audit.companion.do_not_leave_without_asking && (
                  <div className="px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-[10px] uppercase tracking-wide font-bold text-amber-700 mb-1">
                      Do not leave the room without asking
                    </p>
                    <p className="text-sm text-amber-900 font-medium">
                      {audit.companion.do_not_leave_without_asking}
                    </p>
                  </div>
                )}
                <div className="space-y-4">
                  {LENS_ORDER.map((lensKey) => {
                    const l = audit.companion!.lenses.find(
                      (x) => x.lens === lensKey
                    );
                    if (!l || l.questions.length === 0) return null;
                    return (
                      <div
                        key={lensKey}
                        className="border-l-2 border-blue-200 pl-4"
                      >
                        <p className="text-xs font-semibold text-gray-900 mb-1.5">
                          {AUDIT_LENS_META[lensKey].label}
                        </p>
                        <ul className="space-y-1 mb-2">
                          {l.questions.map((q, i) => (
                            <li
                              key={i}
                              className="text-sm text-gray-800 flex gap-2"
                            >
                              <span className="text-blue-400">›</span>
                              <span>{q}</span>
                            </li>
                          ))}
                        </ul>
                        {l.watch_for && (
                          <p className="text-xs text-gray-500">
                            <span className="font-semibold">Watch for:</span>{" "}
                            {l.watch_for}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <dt className="text-gray-500 shrink-0">{label}:</dt>
      <dd className="text-gray-900 font-medium">{value || "—"}</dd>
    </div>
  );
}
