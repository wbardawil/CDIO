"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { INITIATIVE_TYPE_LABELS, type InitiativeType } from "@/types/cockpit";
import { btnPrimary, input, label } from "./styles";

const TYPES = Object.keys(INITIATIVE_TYPE_LABELS) as InitiativeType[];

export function NewInitiativeForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [type, setType] = useState<InitiativeType>("other");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/cockpit/initiatives", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), initiativeType: type }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not create the initiative.");
        setBusy(false);
        return;
      }
      router.push(`/cockpit/${data.initiative.id}`);
    } catch {
      setError("Something went wrong. Try again.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label htmlFor="ni-name" className={label}>
          Initiative name
        </label>
        <input
          id="ni-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="The new CRM"
          maxLength={200}
          className={`mt-1 ${input}`}
        />
      </div>
      <div>
        <label htmlFor="ni-type" className={label}>
          Kind of initiative
        </label>
        <select
          id="ni-type"
          value={type}
          onChange={(e) => setType(e.target.value as InitiativeType)}
          className={`mt-1 ${input}`}
        >
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {INITIATIVE_TYPE_LABELS[t]}
            </option>
          ))}
        </select>
      </div>
      {error && <p className="text-sm text-brick">{error}</p>}
      <button type="submit" disabled={busy || !name.trim()} className={btnPrimary}>
        {busy ? "Creating…" : "Create initiative"}
      </button>
    </form>
  );
}
