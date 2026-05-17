// POST /api/audits/extract — bulk evidence in, structured draft out.
//
// The friction killer: the practitioner drops the interviews,
// transcripts and documents he already has; the system reads them
// and returns a pre-filled, source-cited intake draft to review.
// Stateless — nothing is persisted here (no raw client documents
// stored); the draft is saved only when the audit itself is created.

import { NextRequest, NextResponse } from "next/server";
import { assertPractitionerOwnsOrg } from "@/lib/auth/assert-owns-org";
import {
  parseUpload,
  extractIntake,
  MAX_UPLOAD_FILES,
  MAX_FILE_BYTES,
  type ParsedFile,
} from "@/lib/audit/extract";

export const runtime = "nodejs"; // pdf/docx/xlsx parsing needs Node
export const maxDuration = 60; // extraction is a Sonnet call

export async function POST(request: NextRequest) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Expected a multipart upload" },
      { status: 400 }
    );
  }

  const orgId = String(form.get("org_id") ?? "");
  if (!orgId) {
    return NextResponse.json({ error: "org_id required" }, { status: 400 });
  }
  const ownership = await assertPractitionerOwnsOrg(orgId);
  if (!ownership.ok) return ownership.response;

  const files = form
    .getAll("files")
    .filter((f): f is File => f instanceof File);
  if (files.length === 0) {
    return NextResponse.json(
      { error: "Attach at least one file (PDF, Word, Excel, or text)." },
      { status: 400 }
    );
  }
  if (files.length > MAX_UPLOAD_FILES) {
    return NextResponse.json(
      { error: `Too many files — ${MAX_UPLOAD_FILES} max per upload.` },
      { status: 400 }
    );
  }

  const parsed: ParsedFile[] = [];
  for (const f of files) {
    if (f.size > MAX_FILE_BYTES) {
      parsed.push({
        name: f.name,
        ok: false,
        text: "",
        chars: 0,
        truncated: false,
        note: `Too large (${Math.round(
          f.size / 1024 / 1024
        )} MB). ${Math.round(MAX_FILE_BYTES / 1024 / 1024)} MB max per file.`,
      });
      continue;
    }
    const buf = Buffer.from(await f.arrayBuffer());
    parsed.push(await parseUpload(f.name, buf));
  }

  // Parse-only: the practitioner is attaching files to ONE option
  // and is telling us which option they belong to — no AI guessing
  // needed, just the raw text back to drop into that option.
  if (String(form.get("mode") ?? "") === "parse") {
    return NextResponse.json({
      parsed: parsed.map((p) => ({
        name: p.name,
        ok: p.ok,
        note: p.note,
        truncated: p.truncated,
        text: p.text,
      })),
    });
  }

  const anyUsable = parsed.some((p) => p.ok && p.text.trim());
  if (!anyUsable) {
    return NextResponse.json(
      {
        error:
          "None of the files could be read. Use a text PDF (not a scan), Word (.docx), Excel (.xlsx), or plain text.",
        meta: {
          at: new Date().toISOString(),
          files: parsed.map((p) => ({
            name: p.name,
            chars: p.chars,
            ok: p.ok,
            note: p.note,
          })),
          field_sources: {},
        },
      },
      { status: 422 }
    );
  }

  try {
    const { draft, meta } = await extractIntake(parsed, {
      orgId,
      practitionerId: ownership.practitionerId,
    });
    return NextResponse.json({ draft, meta });
  } catch (err) {
    return NextResponse.json(
      {
        error: "Could not extract the intake from these files.",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
