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

const SEVERITY_STYLE: Record<Severity, string> = {
  high: "bg-amber-soft text-amber-deep",
  medium: "bg-surface text-muted",
  low: "bg-surface text-faint",
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
  return <h2 className="text-xl text-ink">{children}</h2>;
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

  return (
    <article className="space-y-10">
      {/* The cold open — the one line, read first. */}
      <div className="rounded-lg bg-evergreen-soft px-6 py-5">
        <p className={eyebrow}>If you read nothing else</p>
        <p className="mt-2 font-serif text-xl leading-snug text-evergreen-deep">
          {brief.coldOpen}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
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

      {gaps > 0 && (
        <p className="text-sm text-faint">
          This brief is partial &mdash; {gaps}{" "}
          {gaps === 1 ? "section needs" : "sections need"} more input. The gaps
          are marked below.
        </p>
      )}

      {/* 1 — Where it stands */}
      <section className="space-y-4">
        <SectionTitle>Where it stands</SectionTitle>
        <div className="space-y-4">
          <div>
            <p className={eyebrow}>Business outcome</p>
            <div className="mt-1.5">
              <Field value={brief.whereItStands.businessOutcome} />
            </div>
          </div>
          <div>
            <p className={eyebrow}>Current state</p>
            <div className="mt-1.5">
              <Field value={brief.whereItStands.currentStateFacts} />
            </div>
          </div>
          <div>
            <p className={eyebrow}>Constraints</p>
            <div className="mt-1.5">
              <Field value={brief.whereItStands.constraints} />
            </div>
          </div>
          <div>
            <p className={eyebrow}>Requirements</p>
            <div className="mt-1.5">
              <Field value={brief.whereItStands.requirements} />
            </div>
          </div>
        </div>
      </section>

      {/* 2 — What we found */}
      <section className="space-y-4">
        <SectionTitle>What we found</SectionTitle>

        {flags.length > 0 && (
          <div className="space-y-2 rounded-md border-l-2 border-brick bg-surface px-4 py-3">
            <p className={eyebrow}>Against your non-negotiables</p>
            {flags.map((f, i) => (
              <p key={i} className="text-sm text-ink">
                {f.note}
              </p>
            ))}
          </div>
        )}

        {brief.whatWeFound.options.length === 0 &&
        brief.whatWeFound.risks.length === 0 ? (
          <p className="text-sm italic text-faint">
            Nothing found yet &mdash; add vendor proposals and notes, then run
            the brief again.
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
                  <div key={i} className="flex gap-3">
                    <span
                      className={`mt-0.5 h-fit shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                        SEVERITY_STYLE[r.severity]
                      }`}
                    >
                      {r.severity}
                    </span>
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

      {/* 3 — What is still unknown */}
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
                  <p className="mt-0.5 text-sm text-muted">{q.whyItMatters}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 4 — What to do next */}
      <section className="space-y-4">
        <SectionTitle>What to do next</SectionTitle>
        <div>
          <p className={eyebrow}>Recommended move</p>
          <div className="mt-1.5">
            <Field value={brief.whatToDoNext.recommendedMove} />
          </div>
        </div>
        {brief.whatToDoNext.decisionRisks.filled && (
          <div>
            <p className={eyebrow}>Decision risk</p>
            <div className="mt-1.5">
              <Field value={brief.whatToDoNext.decisionRisks} />
            </div>
          </div>
        )}
        {brief.whatToDoNext.questionsForNextRoom.length > 0 && (
          <div>
            <p className={eyebrow}>Questions to ask in the next room</p>
            <ul className="mt-1.5 space-y-1.5">
              {brief.whatToDoNext.questionsForNextRoom.map((q, i) => (
                <li key={i} className="text-ink">
                  &mdash; {q}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <div className="border-t border-hair pt-6">
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
