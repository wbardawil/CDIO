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

// Severity reads sand → ink, never alarm. Only "critical" earns brick
// (the one stop signal). Amber is reserved for the single action,
// never spent on informational chips (DESIGN.md: one amber per screen).
const SEVERITY_STYLE: Record<string, string> = {
  critical: "bg-raised text-brick border-brick",
  high: "bg-surface text-ink border-hair-strong",
  moderate: "bg-surface text-muted border-hair",
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
  buy: "bg-evergreen text-white",
  dont_buy: "bg-brick text-white",
  renegotiate: "bg-ink text-white",
  hold: "bg-ink text-white",
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
  KILL: "bg-raised text-brick border-brick",
  GO: "bg-evergreen-soft text-evergreen-deep border-evergreen",
  RENEGOTIATE: "bg-surface text-ink border-hair-strong",
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
  const card = "bg-raised rounded-xl border border-hair p-6";
  // The eyebrow: uppercase, letter-spaced, evergreen, sans (overrides the
  // global serif-heading rule). The small label above a block.
  const eyebrow =
    "font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-evergreen";

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
      <div className="rounded-xl border border-hair bg-raised px-5 py-4 print:hidden">
        <AuditProgress step={focusStep} done={doneSteps} />
      </div>

      {/* Slim, plain trust line — the whole differentiation in one
          sentence. Full independence + advisory text lives in the
          analysis disclosure, not as front-of-house decoration. */}
      <p className="text-xs text-muted">
        Independent review · loyal only to the accountable principal ·
        principal-paid, zero vendor fees · advisory (the decision stays
        yours).
      </p>

      {out ? (
        <>
          {/* The pain, first — what this is all for. */}
          {(out.business_pain || audit.intake.business_pain) && (
            <div className="bg-raised rounded-xl border border-hair p-6">
              <p className={`${eyebrow} mb-2`}>The pain this has to solve</p>
              <p className="text-base text-ink leading-relaxed">
                {out.business_pain || audit.intake.business_pain}
              </p>
            </div>
          )}

          {/* ===== Law 5: the 15-second read. Leads with the finding
              in Fraunces — the line a principal reads before anything
              else. Verdict + money are the supporting second row. ===== */}
          <div className="bg-raised rounded-xl border border-hair p-6 sm:p-8">
            <p className={`${eyebrow} mb-3`}>The finding</p>
            <p className="font-serif text-2xl sm:text-3xl font-semibold text-ink leading-[1.15] mb-5">
              {VERDICT_RECO[out.overall_call] ??
                "Read the recommendation below."}
            </p>
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <span
                className={`px-4 py-1.5 rounded-md text-sm font-bold ${
                  VERDICT_STYLE[out.overall_call] ?? "bg-ink text-white"
                }`}
              >
                {AUDIT_VERDICT_LABEL[out.overall_call]}
              </span>
              {out.headline_money && (
                <span className="font-sans text-lg font-semibold text-ink tabular-nums">
                  {out.headline_money}
                </span>
              )}
            </div>
            <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap">
              {out.board_summary}
            </p>
          </div>

          {/* What's off vs best practice — the methodology, surfaced
              plainly. Only the few that change the outcome. */}
          {out.gaps && out.gaps.length > 0 && (
            <div className="bg-raised rounded-xl border border-hair p-6">
              <h3 className={`${eyebrow} mb-1`}>
                What&apos;s off vs best practice
              </h3>
              <p className="text-xs text-muted mb-4">
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
                      className="border-l-2 border-hair pl-4"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-ink">
                          {g.gap}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold border uppercase ${
                            SEVERITY_STYLE[g.severity] ??
                            "bg-surface text-ink"
                          }`}
                        >
                          {g.severity}
                        </span>
                      </div>
                      {g.why_it_matters && (
                        <p className="text-sm text-ink mb-1">
                          {g.why_it_matters}
                        </p>
                      )}
                      {g.best_practice && (
                        <p className="text-xs text-muted mb-0.5">
                          <span className="font-semibold">Best practice:</span>{" "}
                          {g.best_practice}
                        </p>
                      )}
                      {g.evidence && (
                        <p className="text-xs text-muted">
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
            {/* The single amber on this screen: the one thing to do
                next. Everything else is evergreen / ink (DESIGN.md). */}
            <div className="rounded-xl border border-amber bg-amber-soft p-6">
              <div className="flex items-start justify-between gap-3 mb-1">
                <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-deep">
                  Do this next
                </p>
                {createdInitiativeId ? (
                  <span className="text-xs font-semibold text-evergreen print:hidden">
                    ✓ Created
                  </span>
                ) : (
                  <button
                    onClick={createInitiative}
                    disabled={creatingInitiative}
                    className="shrink-0 px-4 py-2 bg-amber text-white text-xs font-semibold rounded-lg hover:bg-amber-deep disabled:opacity-50 print:hidden"
                  >
                    {creatingInitiative
                      ? "Creating…"
                      : "Create this initiative →"}
                  </button>
                )}
              </div>
              <p className="font-serif text-xl font-semibold text-ink mt-1">
                {out.recommended_initiative.title}
              </p>
              {out.recommended_initiative.goal && (
                <p className="text-sm text-ink mt-1 mb-3">
                  {out.recommended_initiative.goal}
                </p>
              )}
              <ol className="space-y-2">
                {out.recommended_initiative.steps.map((s, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <span className="shrink-0 font-serif text-sm font-semibold text-amber-deep tabular-nums w-5">
                      {i + 1}.
                    </span>
                    <span>
                      <span className="font-medium text-ink">
                        {s.title}
                      </span>
                      {s.description && (
                        <span className="text-muted">
                          {" "}
                          — {s.description}
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ol>
              <p className="mt-3 text-[11px] text-faint">
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
              className="w-full flex items-center justify-between gap-3 px-5 py-3 bg-raised rounded-xl border border-hair text-sm font-semibold text-ink hover:bg-paper print:hidden"
              aria-expanded={showAnalysis}
            >
              <span>
                {showAnalysis ? "Hide the full analysis" : "Show the full analysis"}
              </span>
              <span className="text-faint font-normal">
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
                  <h3 className={`${eyebrow} mb-3`}>
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
                    <div className="mt-4 px-3 py-2 bg-amber-soft border border-amber rounded text-xs text-amber-deep">
                      <strong>
                        Intake gap (this is itself the first finding):
                      </strong>{" "}
                      {gaps.finding}
                    </div>
                  )}
                  {audit.intake.extraction?.files?.length ? (
                    <p className="mt-3 text-[11px] text-faint">
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
                  <h3 className={`${eyebrow} mb-2`}>
                    Does it fit the strategy?
                  </h3>
                  <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap">
                    {out.strategy_verdict}
                  </p>
                </div>

                {/* Requirements brief */}
                <div className={card}>
                  <h3 className={`${eyebrow} mb-2`}>
                    What it actually has to do
                  </h3>
                  <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap">
                    {out.requirements_brief}
                  </p>
                </div>

                {/* Per-lens findings */}
                <div className={card}>
                  <h3 className={`${eyebrow} mb-1`}>
                    The five-lens analysis
                  </h3>
                  <p className="text-xs text-muted mb-4">
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
                          className="border-l-2 border-hair pl-4"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-ink">
                              {meta.label}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                                FLAG_STYLE[f.flag] ??
                                "bg-surface text-ink"
                              }`}
                            >
                              {f.flag}
                            </span>
                          </div>
                          <p className="text-sm text-ink mb-1">
                            {f.finding}
                          </p>
                          <p className="text-xs text-muted">
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
                      <h3 className={`${eyebrow} mb-1`}>
                        The reusable question checklist
                      </h3>
                      <p className="text-xs text-muted mb-4">
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
                              <p className="text-xs font-semibold text-ink mb-1">
                                {AUDIT_LENS_META[lensKey].label}
                              </p>
                              <ul className="space-y-1">
                                {mc.questions.map((q, i) => (
                                  <li
                                    key={i}
                                    className="text-xs text-muted flex gap-2"
                                  >
                                    <span className="text-amber">
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
                    <h3 className={`${eyebrow} mb-1`}>
                      The questions taken into the room
                    </h3>
                    <p className="text-xs text-muted italic mb-3">
                      {audit.companion.meeting_context}
                    </p>
                    {audit.companion.do_not_leave_without_asking && (
                      <div className="px-4 py-3 bg-amber-soft border border-amber rounded-lg mb-3">
                        <p className="text-[10px] uppercase tracking-wide font-bold text-amber-deep mb-1">
                          Do not leave the room without asking
                        </p>
                        <p className="text-sm text-amber-deep font-medium">
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
                            className="border-l-2 border-evergreen pl-4"
                          >
                            <p className="text-xs font-semibold text-ink mb-1.5">
                              {AUDIT_LENS_META[lensKey].label}
                            </p>
                            <ul className="space-y-1">
                              {l.questions.map((q, i) => (
                                <li
                                  key={i}
                                  className="text-sm text-ink flex gap-2"
                                >
                                  <span className="text-evergreen">›</span>
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
                <div className="border-t border-hair pt-4 text-[11px] leading-relaxed text-muted">
                  <p className="font-semibold text-muted mb-1">
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
              className="px-4 py-2 border border-hair text-ink text-sm font-medium rounded-lg hover:bg-paper"
            >
              Print / Save as PDF
            </button>
          </div>
        </>
      ) : (
        <>
          {/* ===== Not yet run — the one primary action is Run ===== */}
          <div className={card}>
            <h2 className="text-lg font-semibold text-ink mb-1">
              {audit.title}
            </h2>
            <p className="text-sm text-muted mb-4">
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
              <div className="mt-4 px-3 py-2 bg-amber-soft border border-amber rounded text-xs text-amber-deep">
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
                className="px-5 py-2.5 bg-amber text-white text-sm font-semibold rounded-lg hover:bg-amber-deep disabled:opacity-50"
              >
                {running || audit.status === "running"
                  ? "Running the analysis…"
                  : "Run the audit"}
              </button>
              <span className="text-xs text-muted">
                Returns the verdict + the money + the recommendation. ~30-60s.
              </span>
            </div>
            {error && (
              <div className="mt-3 px-3 py-2 bg-raised border border-brick rounded text-xs text-brick">
                {error}
              </div>
            )}
          </div>

          {/* Prep the room — secondary, before the meeting. */}
          <div className={card}>
            <div className="flex items-start justify-between gap-3 mb-1">
              <div>
                <h3 className={eyebrow}>Prep the room</h3>
                <p className="text-xs text-muted mt-1">
                  The exact structural questions to ask while the vendor is
                  performing. Generate before the meeting; take it in.
                </p>
              </div>
              <button
                onClick={prep}
                disabled={prepping}
                className="shrink-0 px-3 py-1.5 border border-hair text-ink text-xs font-semibold rounded-lg hover:bg-paper disabled:opacity-50"
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
                <p className="text-xs text-muted italic">
                  {audit.companion.meeting_context}
                </p>
                {audit.companion.do_not_leave_without_asking && (
                  <div className="px-4 py-3 bg-amber-soft border border-amber rounded-lg">
                    <p className="text-[10px] uppercase tracking-wide font-bold text-amber-deep mb-1">
                      Do not leave the room without asking
                    </p>
                    <p className="text-sm text-amber-deep font-medium">
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
                        className="border-l-2 border-evergreen pl-4"
                      >
                        <p className="text-xs font-semibold text-ink mb-1.5">
                          {AUDIT_LENS_META[lensKey].label}
                        </p>
                        <ul className="space-y-1 mb-2">
                          {l.questions.map((q, i) => (
                            <li
                              key={i}
                              className="text-sm text-ink flex gap-2"
                            >
                              <span className="text-evergreen">›</span>
                              <span>{q}</span>
                            </li>
                          ))}
                        </ul>
                        {l.watch_for && (
                          <p className="text-xs text-muted">
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
      <dt className="text-muted shrink-0">{label}:</dt>
      <dd className="text-ink font-medium">{value || "—"}</dd>
    </div>
  );
}
