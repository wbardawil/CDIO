import { NextResponse } from "next/server";
import { z } from "zod";
import { guardInitiative } from "@/lib/cockpit/guard";
import {
  addMessage,
  getLatestBrief,
  listConstraints,
  listDocuments,
  listMessages,
} from "@/lib/cockpit/db";
import { chatReply } from "@/lib/cockpit/chat";

// The assistant runs a fast model — a few seconds — but lift the
// ceiling so a slow response is never cut off.
export const maxDuration = 60;

const ChatSchema = z.object({
  message: z.string().trim().min(1, "Type a message first.").max(4000),
});

type Ctx = { params: Promise<{ id: string }> };

function friendly(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("credit") || m.includes("billing") || m.includes("balance")) {
    return "The AI service is unavailable — the account needs credit.";
  }
  if (m.includes("timeout") || m.includes("timed out") || m.includes("etimedout")) {
    return "The assistant timed out. Try again.";
  }
  if (m.includes("overloaded") || m.includes("rate")) {
    return "The assistant is busy right now. Try again in a moment.";
  }
  return "The assistant could not reply. Try again.";
}

export async function POST(req: Request, { params }: Ctx) {
  const { id } = await params;
  const g = await guardInitiative(id);
  if (!g.ok) return g.response;

  const parsed = ChatSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid message." },
      { status: 400 }
    );
  }
  const message = parsed.data.message;

  try {
    const [history, documents, constraints, latest] = await Promise.all([
      listMessages(g.userId, id),
      listDocuments(g.userId, id),
      listConstraints(g.userId, id),
      getLatestBrief(g.userId, id),
    ]);

    // Get the reply first — only persist both turns once it succeeds,
    // so a failure leaves a clean slate to retry from.
    const replyText = await chatReply({
      initiative: g.initiative,
      documents,
      constraints,
      latestBrief: latest?.body ?? null,
      history: history.map((m) => ({ role: m.role, content: m.content })),
      userMessage: message,
    });

    const userMessage = await addMessage(g.userId, id, "user", message);
    const assistantMessage = await addMessage(
      g.userId,
      id,
      "assistant",
      replyText || "I didn't catch that — could you rephrase?"
    );
    return NextResponse.json({ userMessage, assistantMessage });
  } catch (err) {
    const raw = err instanceof Error ? err.message : "Chat failed.";
    console.error(`[cockpit/chat] initiative=${id} failed:`, raw);
    return NextResponse.json({ error: friendly(raw) }, { status: 502 });
  }
}
