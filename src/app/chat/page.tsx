"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { PAIN_POINT_LABELS, PAIN_POINT_GROUPS } from "@/lib/agents/pain-points";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID());
  const [painPoint, setPainPoint] = useState<string | undefined>();
  const [showChips, setShowChips] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(
    async (text: string, selectedPainPoint?: string) => {
      if (!text.trim() || loading) return;

      const userMessage: Message = { role: "user", content: text };
      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setShowChips(false);
      setLoading(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: sessionId,
            message: text,
            pain_point: selectedPainPoint ?? painPoint,
            history: messages,
          }),
        });

        if (!res.ok) throw new Error("Failed to get response");

        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.reply },
        ]);

        if (selectedPainPoint) setPainPoint(selectedPainPoint);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Sorry, I had trouble processing that. Could you try again?",
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [loading, messages, painPoint, sessionId]
  );

  const handleChipClick = (key: string, label: string) => {
    sendMessage(label, key);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-lg font-bold text-gray-900">AI-CDIO</h1>
          <p className="text-xs text-gray-500">
            Your AI-powered technology advisor
          </p>
        </div>
        <a
          href="/dashboard"
          className="text-xs text-gray-400 hover:text-gray-600"
        >
          Dashboard
        </a>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Welcome state */}
          {messages.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-blue-600">AI</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Hi, I'm your AI-CDIO
              </h2>
              <p className="text-gray-500 max-w-md mx-auto mb-8">
                I help business owners make smart technology decisions — without
                the jargon, politics, or vendor bias. What's on your mind?
              </p>

              {/* Pain point chips — grouped */}
              {showChips && (
                <div className="max-w-lg mx-auto space-y-4">
                  <p className="text-xs text-gray-400 uppercase tracking-wide">I have a specific problem</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {PAIN_POINT_GROUPS.problems.map((key) => (
                      <button
                        key={key}
                        onClick={() => handleChipClick(key, PAIN_POINT_LABELS[key])}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                      >
                        {PAIN_POINT_LABELS[key]}
                      </button>
                    ))}
                  </div>

                  <p className="text-xs text-gray-400 uppercase tracking-wide pt-2">I want to grow but...</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {PAIN_POINT_GROUPS.aspirational.map((key) => (
                      <button
                        key={key}
                        onClick={() => handleChipClick(key, PAIN_POINT_LABELS[key])}
                        className="px-4 py-2 bg-white border border-amber-200 rounded-full text-sm text-amber-700 hover:border-amber-400 hover:bg-amber-50 transition-all"
                      >
                        {PAIN_POINT_LABELS[key]}
                      </button>
                    ))}
                  </div>

                  <p className="text-xs text-gray-400 uppercase tracking-wide pt-2">I need to discover</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {PAIN_POINT_GROUPS.discovery.map((key) => (
                      <button
                        key={key}
                        onClick={() => handleChipClick(key, PAIN_POINT_LABELS[key])}
                        className="px-4 py-2 bg-white border border-green-200 rounded-full text-sm text-green-700 hover:border-green-400 hover:bg-green-50 transition-all"
                      >
                        {PAIN_POINT_LABELS[key]}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Message list */}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-gray-200 text-gray-800"
                }`}
              >
                {msg.role === "assistant" ? (
                  <div className="prose prose-sm max-w-none">
                    {msg.content.split("\n").map((line, j) => {
                      if (line.startsWith("**Your #1 Action:") || line.startsWith("**Your #1 Action This Week:")) {
                        return (
                          <div key={j} className="bg-green-50 border border-green-200 rounded-lg p-3 my-2">
                            <p className="font-semibold text-green-800 text-sm">{line.replace(/\*\*/g, "")}</p>
                          </div>
                        );
                      }
                      if (line.startsWith("**Why:**") || line.startsWith("**How:**") || line.startsWith("**Time:**") || line.startsWith("**Cost:**") || line.startsWith("**Impact:**")) {
                        return (
                          <p key={j} className="text-sm my-1">
                            <span className="font-semibold">{line.split(":**")[0].replace(/\*\*/g, "")}:</span>
                            {line.split(":**")[1]?.replace(/\*\*/g, "")}
                          </p>
                        );
                      }
                      if (line.startsWith("**") && line.endsWith("**")) {
                        return <p key={j} className="font-semibold text-sm my-1">{line.replace(/\*\*/g, "")}</p>;
                      }
                      if (line.trim() === "") return <br key={j} />;
                      return <p key={j} className="text-sm my-1">{line}</p>;
                    })}
                  </div>
                ) : (
                  <p className="text-sm">{msg.content}</p>
                )}
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 bg-white px-4 py-3 shrink-0">
        <form
          onSubmit={handleSubmit}
          className="max-w-2xl mx-auto flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything about your technology..."
            className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
          >
            Send
          </button>
        </form>
        <div className="flex items-center justify-center gap-4 mt-2">
          <p className="text-xs text-gray-400">
            AI-powered advice — verify recommendations with qualified professionals before implementation.
          </p>
          {messages.length > 0 && (
            <a
              href="/onboarding"
              className="text-xs text-blue-500 hover:text-blue-700 font-medium whitespace-nowrap"
            >
              Full assessment →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
