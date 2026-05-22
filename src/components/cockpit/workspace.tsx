"use client";

import { useState } from "react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import {
  INITIATIVE_TYPE_LABELS,
  STAGES,
  STAGE_LABELS,
  type Brief,
  type CDIOBrief,
  type Constraint,
  type DocumentMeta,
  type Initiative,
  type Stage,
} from "@/types/cockpit";
import { FileDrop } from "./file-drop";
import { ConstraintsPanel } from "./constraints-panel";
import { BriefView } from "./brief-view";
import { StageLens } from "./stage-lens";
import { ExtractionProgress } from "./extraction-progress";
import { btnAmber, btnGhost, card, eyebrow } from "./styles";

function StageSpine({
  stage,
  onPick,
}: {
  stage: Stage;
  onPick: (s: Stage) => void;
}) {
  const currentIndex = STAGES.indexOf(stage);
  return (
    <nav aria-label="Initiative stages" className="flex flex-wrap gap-2">
      {STAGES.map((s, i) => {
        const state =
          i < currentIndex ? "done" : i === currentIndex ? "current" : "ahead";
        return (
          <button
            key={s}
            type="button"
            onClick={() => onPick(s)}
            aria-current={state === "current" ? "step" : undefined}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              state === "current"
                ? "bg-evergreen text-white"
                : state === "done"
                  ? "bg-evergreen-soft text-evergreen-deep hover:bg-evergreen-soft/70"
                  : "border border-hair text-faint hover:text-muted"
            }`}
          >
            {STAGE_LABELS[s]}
          </button>
        );
      })}
    </nav>
  );
}

export function Workspace({
  initiative,
  documents: initialDocuments,
  constraints: initialConstraints,
  brief: initialBrief,
}: {
  initiative: Initiative;
  documents: DocumentMeta[];
  constraints: Constraint[];
  brief: Brief | null;
}) {
  const [stage, setStage] = useState<Stage>(initiative.stage);
  const [documents, setDocuments] = useState<DocumentMeta[]>(initialDocuments);
  const [constraints, setConstraints] =
    useState<Constraint[]>(initialConstraints);
  const [brief, setBrief] = useState<CDIOBrief | null>(
    initialBrief?.body ?? null
  );
  const [version, setVersion] = useState<number>(initialBrief?.version ?? 0);
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);

  const readable = documents.filter((d) => d.parseOk).length;

  async function changeStage(s: Stage) {
    if (s === stage) return;
    const prev = stage;
    setStage(s); // optimistic
    const res = await fetch(`/api/cockpit/initiatives/${initiative.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage: s }),
    });
    if (!res.ok) setStage(prev); // roll back on failure
  }

  async function runBrief() {
    setExtracting(true);
    setExtractError(null);
    try {
      const res = await fetch(
        `/api/cockpit/initiatives/${initiative.id}/extract`,
        { method: "POST" }
      );
      const data = await res.json();
      if (!res.ok) {
        setExtractError(data.error ?? "Extraction didn’t finish. Try again.");
      } else {
        setBrief((data.brief as Brief).body);
        setVersion((data.brief as Brief).version);
      }
    } catch {
      setExtractError(
        "The connection dropped before the brief finished. Your documents are saved — try again."
      );
    }
    setExtracting(false);
  }

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-hair bg-raised">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="min-w-0">
            <Link
              href="/cockpit"
              className="text-xs font-medium text-muted hover:text-ink"
            >
              ← All initiatives
            </Link>
            <h1 className="truncate text-lg font-semibold text-ink">
              {initiative.name}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden text-xs text-faint sm:inline">
              {initiative.initiativeType
                ? INITIATIVE_TYPE_LABELS[initiative.initiativeType]
                : "Initiative"}
            </span>
            <UserButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <StageSpine stage={stage} onPick={changeStage} />
        <div className="mt-3">
          <StageLens stage={stage} />
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          {/* Left rail — context in, brief out */}
          <aside className="space-y-6 lg:col-span-1">
            <div className={`${card} p-5`}>
              <FileDrop
                initiativeId={initiative.id}
                documents={documents}
                onDocuments={setDocuments}
              />
            </div>
            <div className={`${card} p-5`}>
              <ConstraintsPanel
                initiativeId={initiative.id}
                constraints={constraints}
                onConstraints={setConstraints}
              />
            </div>
            <div>
              <button
                type="button"
                onClick={runBrief}
                disabled={extracting || readable === 0}
                className={`${btnAmber} w-full`}
              >
                {extracting
                  ? "Building the brief…"
                  : brief
                    ? "Update the brief"
                    : "Generate the brief"}
              </button>
              {readable === 0 && (
                <p className="mt-2 text-center text-xs text-faint">
                  Add at least one readable document first.
                </p>
              )}
            </div>
          </aside>

          {/* Right — the brief */}
          <section className="lg:col-span-2">
            {extracting ? (
              <ExtractionProgress stage={stage} />
            ) : extractError ? (
              <div className={`${card} p-8`}>
                <p className={eyebrow}>Extraction failed</p>
                <h2 className="mt-2 text-xl text-ink">
                  The brief didn&rsquo;t come back
                </h2>
                <p className="mt-2 text-muted">{extractError}</p>
                <button
                  type="button"
                  onClick={runBrief}
                  className={`${btnGhost} mt-4`}
                >
                  Retry
                </button>
              </div>
            ) : brief ? (
              <div>
                <p className="mb-4 text-xs text-faint">Brief v{version}</p>
                {brief.generatedAtStage &&
                  brief.generatedAtStage !== stage && (
                    <div className="mb-4 rounded-md border border-hair-strong bg-surface px-4 py-2.5 text-sm text-muted">
                      This brief was built at the{" "}
                      <span className="text-ink">
                        {STAGE_LABELS[brief.generatedAtStage]}
                      </span>{" "}
                      stage. Re-generate it to see this initiative through the{" "}
                      <span className="text-ink">{STAGE_LABELS[stage]}</span>{" "}
                      lens.
                    </div>
                  )}
                <BriefView
                  brief={brief}
                  initiativeId={initiative.id}
                  constraints={constraints}
                />
              </div>
            ) : (
              <div className={`${card} p-8`}>
                <h2 className="text-xl text-ink">
                  {readable === 0
                    ? "Start with this initiative’s documents"
                    : "Ready when you are"}
                </h2>
                <p className="mt-2 text-muted">
                  {readable === 0
                    ? "Drop in the meeting notes, a vendor proposal, anything you have — on the left. The cockpit takes it from there."
                    : "Your documents are in. Generate the brief and the cockpit will read them against the methodology."}
                </p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
