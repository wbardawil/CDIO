import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { guardInitiative } from "@/lib/cockpit/guard";
import { addDocument } from "@/lib/cockpit/db";
import {
  parseUpload,
  MAX_UPLOAD_FILES,
  MAX_FILE_BYTES,
} from "@/lib/cockpit/parse";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Ctx) {
  const { id } = await params;
  const g = await guardInitiative(id);
  if (!g.ok) return g.response;

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "Upload could not be read. Try again." },
      { status: 400 }
    );
  }

  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  if (files.length === 0) {
    return NextResponse.json({ error: "No files in the upload." }, { status: 400 });
  }
  if (files.length > MAX_UPLOAD_FILES) {
    return NextResponse.json(
      { error: `Too many files at once — ${MAX_UPLOAD_FILES} max.` },
      { status: 400 }
    );
  }

  const documents = [];
  for (const file of files) {
    // Reject oversized files BEFORE reading them into memory —
    // a recorded failure, not a batch abort, so the PM sees which
    // file was skipped and why.
    if (file.size > MAX_FILE_BYTES) {
      documents.push(
        await addDocument(g.userId, id, {
          filename: file.name,
          sha256: "",
          extractedText: "",
          parseOk: false,
          parseNote: `File is too large (over ${
            MAX_FILE_BYTES / (1024 * 1024)
          } MB). Split it or upload a smaller export.`,
        })
      );
      continue;
    }

    const buf = Buffer.from(await file.arrayBuffer());
    const sha256 = createHash("sha256").update(buf).digest("hex");
    const parsed = await parseUpload(file.name, buf);
    documents.push(
      await addDocument(g.userId, id, {
        filename: file.name,
        sha256,
        extractedText: parsed.text,
        parseOk: parsed.ok,
        parseNote: parsed.note ?? null,
      })
    );
  }

  return NextResponse.json({ documents }, { status: 201 });
}
