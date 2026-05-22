"use client";

import { useEffect, useRef, useState } from "react";
import type { ChatMessage } from "@/types/cockpit";
import { btnGhost, eyebrow, input } from "./styles";

/** The per-initiative assistant. It knows the initiative and the
 *  methodology; it answers and, more usefully, interviews the user
 *  to close gaps. Conversation persists per initiative. */
export function ChatPanel({
  initiativeId,
  initialMessages,
}: {
  initiativeId: string;
  initialMessages: ChatMessage[];
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, busy]);

  async function send() {
    const message = text.trim();
    if (!message || busy) return;
    setBusy(true);
    setError(null);
    setText("");
    try {
      const res = await fetch(
        `/api/cockpit/initiatives/${initiativeId}/chat`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not send your message.");
        setText(message);
      } else {
        setMessages((m) => [
          ...m,
          data.userMessage as ChatMessage,
          data.assistantMessage as ChatMessage,
        ]);
      }
    } catch {
      setError("Could not reach the assistant — check your connection.");
      setText(message);
    }
    setBusy(false);
  }

  return (
    <div>
      <p className={eyebrow}>Assistant</p>
      <p className="mt-1 text-xs text-faint">
        It knows this initiative — your documents, your non-negotiables, and
        what this stage needs.
      </p>

      <div
        ref={scrollRef}
        className="mt-3 max-h-80 space-y-3 overflow-y-auto"
      >
        {messages.length === 0 && !busy && (
          <p className="text-sm text-muted">
            Ask anything — or let it ask you. Try &ldquo;what should I focus on
            next?&rdquo;
          </p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={m.role === "user" ? "text-right" : "text-left"}
          >
            <p className={eyebrow}>
              {m.role === "user" ? "You" : "Assistant"}
            </p>
            <div
              className={`mt-1 inline-block whitespace-pre-wrap rounded-md px-3 py-2 text-left text-sm ${
                m.role === "user"
                  ? "bg-evergreen-soft text-evergreen-deep"
                  : "bg-surface text-ink"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {busy && <p className="text-sm italic text-faint">Thinking…</p>}
      </div>

      {error && <p className="mt-2 text-sm text-brick">{error}</p>}

      <div className="mt-3">
        <textarea
          aria-label="Message to the assistant"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="Ask the assistant…"
          rows={2}
          className={`${input} resize-none`}
        />
        <button
          type="button"
          onClick={send}
          disabled={busy || !text.trim()}
          className={`${btnGhost} mt-2`}
        >
          {busy ? "Sending…" : "Send"}
        </button>
      </div>
    </div>
  );
}
