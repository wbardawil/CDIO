import { NextResponse } from "next/server";
import { guardInitiative } from "@/lib/cockpit/guard";
import {
  getDocumentTexts,
  getLatestBrief,
  insertBriefVersion,
  listConstraints,
  listMessages,
} from "@/lib/cockpit/db";
import { extractBrief, friendlyExtractError } from "@/lib/cockpit/extract-brief";

// The Claude extraction runs 20-40s. Vercel's default function
// timeout sits below that; this lifts the ceiling so the request
// is not cut off mid-extraction. (Clamped down to the plan's max
// on Hobby; that still covers a 40s run.)
export const maxDuration = 300;

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const g = await guardInitiative(id);
  if (!g.ok) return g.response;

  try {
    const [documents, constraints, latest, messages] = await Promise.all([
      getDocumentTexts(g.userId, id),
      listConstraints(g.userId, id),
      getLatestBrief(g.userId, id),
      listMessages(g.userId, id),
    ]);

    // What the user told the assistant is initiative material too —
    // feed the conversation in as one more source.
    const conversation = messages
      .filter((m) => m.role === "user")
      .map((m) => m.content)
      .join("\n\n");
    const sources = conversation.trim()
      ? [
          ...documents,
          {
            filename: "Notes from the conversation with the cockpit",
            text: conversation,
          },
        ]
      : documents;

    const brief = await extractBrief({
      documents: sources,
      priorBrief: latest?.body ?? null,
      constraints,
      stage: g.initiative.stage,
      initiativeType: g.initiative.initiativeType,
    });

    const saved = await insertBriefVersion(g.userId, id, brief);
    return NextResponse.json({ brief: saved });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Extraction failed.";
    // Log the raw cause server-side — the PM sees a plain message,
    // but a failed extraction must be diagnosable from the logs.
    console.error(`[cockpit/extract] initiative=${id} failed:`, message);
    return NextResponse.json(
      { error: friendlyExtractError(message) },
      { status: 502 }
    );
  }
}
