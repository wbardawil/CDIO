"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CopyLinkButton } from "@/components/copy-link-button";
import { EditStakeholderModal } from "@/components/edit-stakeholder-modal";

interface Stakeholder {
  id: string;
  name: string;
  email: string;
  role: string;
  influence_level?: string | null;
  relevant_modules: number[];
  assessment_token: string | null;
  completed_modules: number[];
}

interface Props {
  stakeholder: Stakeholder;
  status: "done" | "partial" | "not_started";
  pct: number;
  done: number;
  total: number;
  link: string | null;
}

export function StakeholderRowActions({ stakeholder, status, pct, done, total, link }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);

  const sendEmail = async (isReminder: boolean) => {
    setSending(true);
    setSendError(null);
    setSendResult(null);
    try {
      const res = await fetch(`/api/stakeholders/by-id/${stakeholder.id}/send-assessment-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_reminder: isReminder }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error ?? `HTTP ${res.status}`);
      // Sandbox: server reroutes to practitioner. Surface that fact instead
      // of pretending it went to the stakeholder.
      if (body.sandbox && body.routed_to) {
        setSendResult(`[TEST] rerouted to ${body.routed_to} (intended: ${stakeholder.email})`);
      } else {
        setSendResult(`Sent to ${stakeholder.email}`);
      }
      setTimeout(() => setSendResult(null), 5000);
    } catch (e) {
      setSendError(e instanceof Error ? e.message : "Send failed");
      setTimeout(() => setSendError(null), 5000);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-3 flex-shrink-0 flex-wrap justify-end">
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
            status === "done"
              ? "bg-evergreen-soft text-evergreen"
              : status === "partial"
                ? "bg-amber-soft text-amber-deep"
                : "bg-surface text-muted"
          }`}
        >
          {status === "done"
            ? "Submitted"
            : status === "partial"
              ? `${pct}% — ${done}/${total}`
              : "Not started"}
        </span>

        {link && status !== "done" && (
          <>
            <button
              type="button"
              onClick={() => sendEmail(status === "partial")}
              disabled={sending}
              className="inline-flex items-center px-3 py-1.5 bg-evergreen text-white text-xs font-medium rounded-md hover:bg-evergreen-deep disabled:bg-hair"
            >
              {sending ? "Sending…" : status === "partial" ? "Email reminder" : "Email link"}
            </button>
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-1.5 border border-hair text-ink text-xs font-medium rounded-md hover:bg-paper"
            >
              Open ↗
            </a>
            <CopyLinkButton link={link} label="Copy" />
          </>
        )}

        <button
          type="button"
          onClick={() => setEditing(true)}
          className="text-xs text-muted hover:text-ink font-medium px-2 py-1"
          aria-label="Edit stakeholder"
        >
          Edit
        </button>
      </div>

      {(sendResult || sendError) && (
        <div className="basis-full mt-1 text-right">
          {sendResult && <span className="text-xs text-evergreen">✓ {sendResult}</span>}
          {sendError && <span className="text-xs text-brick">✗ {sendError}</span>}
        </div>
      )}

      {editing && (
        <EditStakeholderModal
          stakeholder={{
            id: stakeholder.id,
            name: stakeholder.name,
            email: stakeholder.email,
            role: stakeholder.role,
            influence_level: stakeholder.influence_level,
            relevant_modules: stakeholder.relevant_modules,
          }}
          onClose={() => {
            setEditing(false);
            router.refresh();
          }}
        />
      )}
    </>
  );
}
