import type {
  BriefField,
  CDIOBrief,
  Constraint,
  Severity,
} from "@/types/cockpit";
import {
  GATE_LABELS,
  READINESS_LABEL,
  briefCompleteness,
  readiness,
} from "@/types/cockpit";
import { checkConstraints } from "@/lib/cockpit/checks";
import { btnGhost, eyebrow } from "./styles";

const GATE_STYLE: Record<string, string> = {
  continue: "bg-evergreen-soft text-evergreen-deep",
  clarify: "bg-amber-soft text-amber-deep",
  intervene: "bg-brick/10 text-brick",
};

const READINESS_STYLE = {
  ready: "bg-evergreen-soft text-evergreen-deep",
  partial: "bg-amber-soft text-amber-deep",
  thin: "border border-hair-strong bg-surface text-faint",
} as const;

const SEVERITY_DOT: Record<Severity, string> = {
  high: "bg-amber",
  medium: "bg-hair-strong",
  low: "bg-hair",
};

function Field({ value }: { value: BriefField }) {
  if (value.filled) {
    return <p className="leading-relaxed text-ink">{value.text}</p>;
  }
  return (
    <p className="rounded-md border border-dashed border-hair-strong bg-surface px-3 py-2 text-sm italic text-faint">
      Couldn&rsquo;t fill this yet &mdash; {value.missing}
    </p>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg text-ink">{children}</h2>;
}

export function BriefView({
  brief,
  initiativeId,
  constraints,
}: {
  brief: CDIOBrief;
  initiativeId: string;
  constraints: Constraint[];
}) {
  const gaps = briefCompleteness(brief).filter((c) => !c.filled).length;
  const flags = checkConstraints(brief, constraints);
  const read = readiness(brief);
  const next = brief.whatToDoNext;

  return (
    <article className="space-y-6">
      {/* ── THE CALL — everything an executive needs, in one card ── */}
      <section className="space-y-5 rounded-lg border border-hair bg-raised p-6">
        <div>
          <p className={eyebrow}>The call &mdash; if you read nothing else</p>
          <p className="mt-2 font-serif text-2xl leading-snug text-ink">
            {brief.coldOpen}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
              GATE_STYLE[brief.gate]
            }`}
          >
            Next gate: {GATE_LABELS[brief.gate]}
          </span>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${READINESS_STYLE[read]}`}
          >
            {READINESS_LABEL[read]}
            {gaps > 0 ? ` · ${gaps} gap${gaps === 1 ? "" : "s"}` : ""}
          </span>
          {brief.gateReason && (
            <span className="text-sm text-muted">{brief.gateReason}</span>
          )}
        </div>

        {flags.length > 0 && (
          <div className="space-y-1 rounded-md border-l-2 border-brick bg-surface px-4 py-3">
            <p className={eyebrow}>Against your non-negotiables</p>
            {flags.map((f, i) => (
              <p key={i} className="text-sm text-ink">
                {f.note}
              </p>
            ))}
          </div>
        )}

        <div className="space-y-4 border-t border-hair pt-5">
          <div>
            <p className={eyebrow}>Do next</p>
            <div className="mt-1.5">
              <Field value={next.recommendedMove} />
            </div>
          </div>
          {next.decisionRisks.filled && (
            <div>
              <p className={eyebrow}>Watch &mdash; decision risk</p>
              <p className="mt-1.5 leading-relaxed text-ink">
                {next.decisionRisks.text}
              </p>
            </div>
          )}
          {next.questionsForNextRoom.length > 0 && (
            <div>
              <p className={eyebrow}>Ask in the next room</p>
              <ul className="mt-1.5 space-y-1.5">
                {next.questionsForNextRoom.map((q, i) => (
                  <li key={i} className="text-ink">
                    &mdash; {q}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* ── The full brief — the context, one click away ── */}
      <details className="group rounded-lg border border-hair bg-raised">
        <summary className="cursor-pointer list-none px-5 py-3.5 text-sm font-medium text-ink transition-colors hover:bg-surface">
          <span className="inline-block transition-transform group-open:rotate-90">
            ▸
          </span>{" "}
          Show the full brief &mdash; where it stands, what we found, what is
          unknown
        </summary>

        <div className="space-y-9 border-t border-hair px-6 py-6">
          {/* Where it stands */}
          <section className="space-y-4">
            <SectionTitle>Where it stands</SectionTitle>
            {(
              [
                ["Business outcome", brief.whereItStands.businessOutcome],
                ["Current state", brief.whereItStands.currentStateFacts],
                ["Constraints", brief.whereItStands.constraints],
                ["Requirements", brief.whereItStands.requirements],
              ] as const
            ).map(([label, field]) => (
              <div key={label}>
                <p className={eyebrow}>{label}</p>
                <div className="mt-1.5">
                  <Field value={field} />
                </div>
              </div>
            ))}
          </section>

          {/* What we found */}
          <section className="space-y-4">
            <SectionTitle>What we found</SectionTitle>
            {brief.whatWeFound.options.length === 0 &&
            brief.whatWeFound.risks.length === 0 ? (
              <p className="text-sm italic text-faint">
                Nothing found yet &mdash; add vendor proposals and notes, then
                run the brief again.
              </p>
            ) : (
              <>
                {brief.whatWeFound.options.length > 0 && (
                  <div className="space-y-3">
                    <p className={eyebrow}>Options</p>
                    {brief.whatWeFound.options.map((o, i) => (
                      <div
                        key={i}
                        className="rounded-md border border-hair bg-surface p-4"
                      >
                        <div className="flex items-baseline justify-between gap-3">
                          <h3 className="text-base font-semibold text-ink">
                            {o.label}
                          </h3>
                          {o.cost && (
                            <span className="shrink-0 text-sm text-muted">
                              {o.cost}
                            </span>
                          )}
                        </div>
                        {o.summary && (
                          <p className="mt-1 text-sm text-muted">{o.summary}</p>
                        )}
                        {o.risks.length > 0 && (
                          <ul className="mt-2 space-y-1">
                            {o.risks.map((r, j) => (
                              <li key={j} className="text-sm text-muted">
                                &middot; {r}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {brief.whatWeFound.risks.length > 0 && (
                  <div className="space-y-2">
                    <p className={eyebrow}>Risks</p>
                    {brief.whatWeFound.risks.map((r, i) => (
                      <div key={i} className="flex gap-2.5">
                        <span
                          className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                            SEVERITY_DOT[r.severity]
                          }`}
                          title={`${r.severity} severity`}
                        />
                        <p className="text-sm text-ink">
                          <span className="font-medium">{r.risk}.</span>{" "}
                          <span className="text-muted">{r.why}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </section>

          {/* What is still unknown */}
          <section className="space-y-4">
            <SectionTitle>What is still unknown</SectionTitle>
            {brief.stillUnknown.openQuestions.length === 0 ? (
              <p className="text-sm italic text-faint">
                No open questions surfaced.
              </p>
            ) : (
              <ul className="space-y-3">
                {brief.stillUnknown.openQuestions.map((q, i) => (
                  <li key={i}>
                    <p className="font-medium text-ink">{q.question}</p>
                    {q.whyItMatters && (
                      <p className="mt-0.5 text-sm text-muted">
                        {q.whyItMatters}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </details>

      <div className="pt-1">
        <a
          href={`/api/cockpit/initiatives/${initiativeId}/export`}
          className={btnGhost}
        >
          Export the brief
        </a>
      </div>
    </article>
  );
}
