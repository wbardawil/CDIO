"use client";

import { useState } from "react";
import {
  CONSTRAINT_KIND_LABELS,
  type Constraint,
  type ConstraintKind,
} from "@/types/cockpit";
import { btnGhost, eyebrow, input } from "./styles";

const KINDS = Object.keys(CONSTRAINT_KIND_LABELS) as ConstraintKind[];

interface Draft {
  kind: ConstraintKind;
  label: string;
  value: string;
}

function toDraft(c: Constraint): Draft {
  return { kind: c.kind, label: c.label, value: c.value ?? "" };
}

export function ConstraintsPanel({
  initiativeId,
  constraints,
  onConstraints,
}: {
  initiativeId: string;
  constraints: Constraint[];
  onConstraints: (c: Constraint[]) => void;
}) {
  const [rows, setRows] = useState<Draft[]>(constraints.map(toDraft));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function update(i: number, patch: Partial<Draft>) {
    setRows((rs) => rs.map((r, j) => (j === i ? { ...r, ...patch } : r)));
    setSaved(false);
  }

  function addRow() {
    setRows((rs) => [...rs, { kind: "budget", label: "", value: "" }]);
    setSaved(false);
  }

  function removeRow(i: number) {
    setRows((rs) => rs.filter((_, j) => j !== i));
    setSaved(false);
  }

  async function save() {
    const clean = rows.filter((r) => r.label.trim());
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/cockpit/initiatives/${initiativeId}/constraints`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            constraints: clean.map((r) => ({
              kind: r.kind,
              label: r.label.trim(),
              value: r.value.trim() || null,
            })),
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not save.");
      } else {
        onConstraints(data.constraints as Constraint[]);
        setRows((data.constraints as Constraint[]).map(toDraft));
        setSaved(true);
      }
    } catch {
      setError("Could not save — try again.");
    }
    setBusy(false);
  }

  return (
    <div>
      <p className={eyebrow}>Non-negotiables</p>
      <p className="mt-1 text-xs text-faint">
        The hard lines the cockpit holds every option against.
      </p>

      <ul className="mt-3 space-y-2">
        {rows.map((r, i) => (
          <li key={i} className="rounded-md border border-hair bg-surface p-2.5">
            <div className="flex items-center gap-2">
              <select
                aria-label="Kind of non-negotiable"
                value={r.kind}
                onChange={(e) =>
                  update(i, { kind: e.target.value as ConstraintKind })
                }
                className={`${input} flex-1`}
              >
                {KINDS.map((k) => (
                  <option key={k} value={k}>
                    {CONSTRAINT_KIND_LABELS[k]}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => removeRow(i)}
                aria-label="Remove this non-negotiable"
                className="rounded px-2 py-1 text-sm text-faint hover:text-brick"
              >
                Remove
              </button>
            </div>
            <input
              aria-label="What it is"
              value={r.label}
              onChange={(e) => update(i, { label: e.target.value })}
              placeholder="What it is — e.g. must work with the current ERP"
              maxLength={200}
              className={`mt-2 ${input}`}
            />
            <input
              aria-label="Detail (optional)"
              value={r.value}
              onChange={(e) => update(i, { value: e.target.value })}
              placeholder="Detail (optional) — e.g. budget cap $80k"
              maxLength={500}
              className={`mt-2 ${input}`}
            />
          </li>
        ))}
      </ul>

      {error && <p className="mt-2 text-sm text-brick">{error}</p>}

      <div className="mt-3 flex items-center gap-3">
        <button type="button" onClick={addRow} className={btnGhost}>
          Add a non-negotiable
        </button>
        <button
          type="button"
          onClick={save}
          disabled={busy}
          className="text-sm font-medium text-evergreen hover:text-evergreen-deep disabled:opacity-50"
        >
          {busy ? "Saving…" : "Save"}
        </button>
        {saved && <span className="text-xs text-faint">Saved</span>}
      </div>
    </div>
  );
}
