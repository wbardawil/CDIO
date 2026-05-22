import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { z } from "zod";
import { guardInitiative } from "@/lib/cockpit/guard";
import { addDocument } from "@/lib/cockpit/db";

// Pasted text — a plan, meeting notes, an email thread. Stored
// exactly like an uploaded document: it IS the extracted text, so
// no parsing is needed.
const NoteSchema = z.object({
  title: z.string().trim().max(200).optional(),
  text: z
    .string()
    .trim()
    .min(1, "Paste some text first.")
    .max(100_000, "That note is very long — split it into a few."),
});

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Ctx) {
  const { id } = await params;
  const g = await guardInitiative(id);
  if (!g.ok) return g.response;

  const parsed = NoteSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid note." },
      { status: 400 }
    );
  }

  const { text } = parsed.data;
  const document = await addDocument(g.userId, id, {
    filename: parsed.data.title?.trim() || "Pasted note",
    sha256: createHash("sha256").update(text).digest("hex"),
    extractedText: text,
    parseOk: true,
    parseNote: null,
  });
  return NextResponse.json({ document }, { status: 201 });
}
