"use client";

import { useId, useRef, useState } from "react";
import type { DocumentMeta } from "@/types/cockpit";
import { btnGhost, eyebrow, input } from "./styles";

const ACCEPT = ".pdf,.docx,.xlsx,.txt,.md,.csv,.tsv,.vtt,.srt";

export function FileDrop({
  initiativeId,
  documents,
  onDocuments,
}: {
  initiativeId: string;
  documents: DocumentMeta[];
  onDocuments: (docs: DocumentMeta[]) => void;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // Paste-text state.
  const [showPaste, setShowPaste] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteText, setNoteText] = useState("");
  const [pasteBusy, setPasteBusy] = useState(false);

  async function upload(files: File[]) {
    if (files.length === 0 || busy) return;
    setBusy(true);
    setError(null);
    const fd = new FormData();
    for (const f of files) fd.append("files", f);
    try {
      const res = await fetch(
        `/api/cockpit/initiatives/${initiativeId}/documents`,
        { method: "POST", body: fd }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Upload failed.");
      } else {
        onDocuments([...documents, ...(data.documents as DocumentMeta[])]);
      }
    } catch {
      setError("Upload failed — check your connection and try again.");
    }
    setBusy(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function addNote() {
    if (!noteText.trim() || pasteBusy) return;
    setPasteBusy(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/cockpit/initiatives/${initiativeId}/notes`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: noteTitle.trim() || undefined,
            text: noteText.trim(),
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not save the note.");
      } else {
        onDocuments([...documents, data.document as DocumentMeta]);
        setNoteTitle("");
        setNoteText("");
        setShowPaste(false);
      }
    } catch {
      setError("Could not save the note — try again.");
    }
    setPasteBusy(false);
  }

  return (
    <div>
      <p className={eyebrow}>Documents</p>

      <label
        htmlFor={inputId}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          upload(Array.from(e.dataTransfer.files));
        }}
        className={`mt-2 flex cursor-pointer flex-col items-center justify-center rounded-md border border-dashed px-4 py-6 text-center transition-colors ${
          dragOver
            ? "border-evergreen bg-evergreen-soft"
            : "border-hair-strong bg-surface hover:border-evergreen"
        }`}
      >
        <span className="text-sm font-medium text-ink">
          {busy ? "Reading your files…" : "Drop documents here, or click to choose"}
        </span>
        <span className="mt-1 text-xs text-faint">
          PDF, Word, Excel, text, or meeting transcripts
        </span>
        <input
          id={inputId}
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPT}
          disabled={busy}
          className="sr-only"
          onChange={(e) => upload(Array.from(e.target.files ?? []))}
        />
      </label>

      {/* Paste text — a plan, notes, an email — no file needed. */}
      {!showPaste ? (
        <button
          type="button"
          onClick={() => setShowPaste(true)}
          className="mt-2 text-sm font-medium text-evergreen hover:text-evergreen-deep"
        >
          or paste text instead
        </button>
      ) : (
        <div className="mt-3 space-y-2 rounded-md border border-hair bg-surface p-3">
          <input
            aria-label="Note title (optional)"
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
            placeholder="Title (optional) — e.g. Kickoff meeting notes"
            maxLength={200}
            className={input}
          />
          <textarea
            aria-label="Paste your text"
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Paste a plan, meeting notes, an email thread…"
            rows={6}
            className={`${input} resize-y`}
          />
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={addNote}
              disabled={pasteBusy || !noteText.trim()}
              className={btnGhost}
            >
              {pasteBusy ? "Adding…" : "Add as note"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowPaste(false);
                setNoteTitle("");
                setNoteText("");
              }}
              className="text-sm text-faint hover:text-muted"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {error && <p className="mt-2 text-sm text-brick">{error}</p>}

      {documents.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {documents.map((d) => (
            <li key={d.id} className="text-sm">
              <div className="flex items-baseline justify-between gap-2">
                <span className="truncate text-ink">{d.filename}</span>
                <span
                  className={`shrink-0 text-xs ${
                    d.parseOk ? "text-faint" : "text-brick"
                  }`}
                >
                  {d.parseOk ? "read" : "couldn’t read"}
                </span>
              </div>
              {!d.parseOk && d.parseNote && (
                <p className="text-xs text-muted">{d.parseNote}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
