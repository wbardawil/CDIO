"use client";

import { useState } from "react";
import {
  type Audit,
  type AuditLensKey,
  AUDIT_VERDICT_LABEL,
  AUDIT_LENS_META,
  evaluateIntakeGaps,
} from "@/types/audit";

const LENS_ORDER: AuditLensKey[] = (
  Object.keys(AUDIT_LENS_META) as AuditLensKey[]
).sort((a, b) => AUDIT_LENS_META[a].order - AUDIT_LENS_META[b].order);

const VERDICT_STYLE: Record<string, string> = {
  buy: "bg-emerald-600 text-white",
  dont_buy: "bg-rose-600 text-white",
  renegotiate: "bg-amber-500 text-white",
  hold: "bg-slate-700 text-white",
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
  const [audit, setAudit] = useState<Audit>(initialAudit);
  const [running, setRunning] = useState(false);
  const [prepping, setPrepping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const gaps = evaluateIntakeGaps(audit.intake);

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

  return (
    <div className="space-y-6">
      {/* Independence statement — the spine, always shown */}
      <div className="px-4 py-3 bg-slate-900 text-slate-100 rounded-lg text-xs leading-relaxed print:border print:border-slate-300">
        <strong>Independence Statement.</strong> This audit&apos;s loyalty is to
        the principal who is personally accountable if this purchase goes wrong
        — never the vendor, never the internal champion. No fee, referral, or
        consideration of any kind is received from any vendor evaluated. This
        engagement is principal-paid only. The verdict is advisory; the
        decision and accountability remain the principal&apos;s.
      </div>

      {/* Intake summary */}
      <div className={card}>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          {audit.title}
        </h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <Row label="Decision" value={audit.intake.decision} />
          <Row
            label="Options"
            value={(audit.intake.options ?? [])
              .map((o) => o.label)
              .filter(Boolean)
              .join(" vs ")}
          />
          <Row label="Total cost" value={audit.intake.total_cost} />
          <Row label="Accountable" value={audit.intake.principal_role} />
        </dl>

        {gaps.finding && (
          <div className="mt-4 px-3 py-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900">
            <strong>Intake gap (this is itself the first finding):</strong>{" "}
            {gaps.finding}
          </div>
        )}

        {audit.status !== "complete" && (
          <div className="mt-5 flex items-center gap-3">
            <button
              onClick={run}
              disabled={running || audit.status === "running"}
              className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {running || audit.status === "running"
                ? "Running the five lenses…"
                : "Run the audit"}
            </button>
            <span className="text-xs text-gray-500">
              Sonnet runs all five lenses + Method Capture. ~30-60s.
            </span>
          </div>
        )}
        {error && (
          <div className="mt-3 px-3 py-2 bg-rose-50 border border-rose-200 rounded text-xs text-rose-800">
            {error}
          </div>
        )}
      </div>

      {/* Live Audit Companion — the pre-meeting question sheet */}
      <div className={card}>
        <div className="flex items-start justify-between gap-3 mb-1">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              Prep for the room — Live Audit Companion
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              The exact structural questions to ask while the vendor is
              performing. Generate before the meeting; take it in.
            </p>
          </div>
          <button
            onClick={prep}
            disabled={prepping}
            className="shrink-0 px-3 py-1.5 border border-gray-300 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-50 disabled:opacity-50 print:hidden"
          >
            {prepping
              ? "Preparing…"
              : audit.companion
                ? "Regenerate"
                : "Generate companion"}
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
                      Lens {AUDIT_LENS_META[lensKey].order} ·{" "}
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

      {out && (
        <>
          {/* Verdict + headline money */}
          <div className={card}>
            <div className="flex items-center gap-3 mb-3">
              <span
                className={`px-3 py-1 rounded-md text-sm font-bold ${
                  VERDICT_STYLE[out.overall_call] ?? "bg-gray-700 text-white"
                }`}
              >
                {AUDIT_VERDICT_LABEL[out.overall_call]}
              </span>
              {out.headline_money && (
                <span className="text-base font-semibold text-gray-900">
                  {out.headline_money}
                </span>
              )}
            </div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
              A · Strategy-fit verdict
            </h3>
            <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
              {out.strategy_verdict}
            </p>
          </div>

          {/* Board summary — the 60-second read */}
          <div className="bg-slate-900 text-slate-100 rounded-xl p-6">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">
              D · One-page board summary
            </h3>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {out.board_summary}
            </p>
          </div>

          {/* Requirements brief */}
          <div className={card}>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
              B · Operating-model-aligned requirements brief
            </h3>
            <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
              {out.requirements_brief}
            </p>
          </div>

          {/* Per-lens findings */}
          <div className={card}>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-4">
              C · Per-lens findings
            </h3>
            <ul className="space-y-4">
              {LENS_ORDER.map((lensKey) => {
                const f = out.lens_findings.find((x) => x.lens === lensKey);
                const meta = AUDIT_LENS_META[lensKey];
                if (!f) return null;
                return (
                  <li
                    key={lensKey}
                    className="border-l-2 border-gray-200 pl-4"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-gray-900">
                        Lens {meta.order} · {meta.label}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                          FLAG_STYLE[f.flag] ?? "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {f.flag}
                      </span>
                    </div>
                    <p className="text-sm text-gray-800 mb-1">{f.finding}</p>
                    <p className="text-xs text-gray-500">
                      <span className="font-semibold">Because:</span>{" "}
                      {f.evidence}
                    </p>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Method Capture — the reusable checklist */}
          {audit.method_capture && audit.method_capture.length > 0 && (
            <div className={card}>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
                Method Capture — the reusable checklist
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                Every question this audit actually asked, grouped by lens. The
                ★ marks the question that did the most work on this case. This
                list compounds — the next audit starts here.
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
                              {i === mc.highest_leverage_index ? "★" : "·"}
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

          {/* Advisory-not-liable footer — prints with the deliverable.
              Surfaces the liability boundary ON the artifact itself,
              not only in the contract stub, for the window before
              Phase 2 Day 30 attorney review. */}
          <div className="border-t border-gray-200 pt-4 text-[11px] leading-relaxed text-gray-500">
            <p className="font-semibold text-gray-600 mb-1">
              Independence &amp; advisory boundary
            </p>
            <p>
              This audit is the practitioner&apos;s independent professional
              opinion (BUY / DON&apos;T BUY / RENEGOTIATE / HOLD), rendered on
              the evidence made available during the engagement. The verdict
              is <strong>advisory</strong>: final purchasing authority and
              accountability rest solely with the principal. Where a required
              input could not be supplied, that limitation is itself a
              documented finding and may default the verdict to HOLD. The
              practitioner receives no fee, referral, commission, or
              consideration of any kind from any vendor evaluated — this
              engagement is principal-paid only. The audit covers one decision
              and ends at the verdict; it does not include implementation
              design, contract negotiation, or organizational rollout.
            </p>
          </div>

          <div className="print:hidden">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50"
            >
              Print / Save as PDF
            </button>
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
