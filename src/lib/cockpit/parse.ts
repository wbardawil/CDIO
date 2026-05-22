// ============================================================
// CDIO Review Cockpit — file intake parsing
//
// Salvaged from the shelved audit product (src/lib/audit/extract.ts).
// Drops the documents the PM already has — proposals, quotes, SOWs,
// meeting transcripts, notes, spreadsheets — into plain text the
// brief extractor can read. The PM never hand-pastes fields.
//
// Scope (narrow-and-trustworthy): PDF, Word (.docx), Excel (.xlsx),
// plain text (.txt/.md/.csv/...), and .vtt/.srt transcripts.
// Legacy binary Office (.doc/.xls/.ppt) is rejected with an
// actionable message rather than parsed by a risky reader.
//
// parseUpload never throws — a failed parse is recorded on the
// result so a batch upload continues and the failure is visible.
// ============================================================

import mammoth from "mammoth";
import ExcelJS from "exceljs";
import { extractText, getDocumentProxy } from "unpdf";

export const MAX_UPLOAD_FILES = 10;
// Vercel serverless functions reject request bodies past ~4.5 MB at
// the platform edge, before our code runs — so a higher cap would
// just produce confusing 413s. This is the honest ceiling until a
// presigned browser→storage upload (which bypasses the function
// body) is built.
export const MAX_FILE_BYTES = 4 * 1024 * 1024; // 4 MB / file
export const MAX_TOTAL_UPLOAD_BYTES = 4 * 1024 * 1024; // ~Vercel body limit
const MAX_TEXT_PER_FILE = 80_000; // chars — bounds token cost
export const MAX_TOTAL_TEXT = 180_000; // chars across all files

export interface ParsedFile {
  name: string;
  ok: boolean;
  text: string;
  chars: number;
  truncated: boolean;
  note?: string; // why it failed / what was skipped
}

type Ext = "pdf" | "docx" | "xlsx" | "text" | "transcript" | "legacy" | "unsupported";

function classify(name: string): Ext {
  const n = name.toLowerCase();
  if (n.endsWith(".pdf")) return "pdf";
  if (n.endsWith(".docx")) return "docx";
  if (n.endsWith(".xlsx")) return "xlsx";
  // Caption/transcript exports (Otter, Fireflies, Zoom, Teams) —
  // plain text under the hood; cleaned below.
  if (n.endsWith(".vtt") || n.endsWith(".srt")) return "transcript";
  if (
    n.endsWith(".txt") ||
    n.endsWith(".md") ||
    n.endsWith(".markdown") ||
    n.endsWith(".csv") ||
    n.endsWith(".tsv") ||
    n.endsWith(".json") ||
    n.endsWith(".log")
  )
    return "text";
  // Legacy binary Office: the maintained pure-JS readers for these
  // are either unmaintained (.doc) or carry a published advisory
  // (.xls via SheetJS-on-npm). Reject with an actionable message
  // rather than silently ship a risky parser.
  if (n.endsWith(".doc") || n.endsWith(".xls") || n.endsWith(".ppt"))
    return "legacy";
  return "unsupported";
}

// Strip WEBVTT/SRT scaffolding so the model sees dialogue, not
// timecodes and cue indices.
function cleanTranscript(raw: string): string {
  return raw
    .split(/\r?\n/)
    .filter((line) => {
      const t = line.trim();
      if (!t) return false;
      if (/^WEBVTT/i.test(t)) return false;
      if (/^\d+$/.test(t)) return false; // SRT cue index
      if (/^\d{1,2}:\d{2}/.test(t) && /-->/.test(t)) return false; // timecode
      return true;
    })
    .join("\n");
}

function clamp(text: string): { text: string; truncated: boolean } {
  if (text.length <= MAX_TEXT_PER_FILE) return { text, truncated: false };
  return { text: text.slice(0, MAX_TEXT_PER_FILE), truncated: true };
}

async function parseXlsx(buf: Buffer): Promise<string> {
  const wb = new ExcelJS.Workbook();
  // @types/node 22 made Buffer generic; exceljs's bundled Buffer
  // type lags. Runtime accepts the Node Buffer fine.
  await wb.xlsx.load(buf as unknown as Parameters<typeof wb.xlsx.load>[0]);
  const out: string[] = [];
  wb.eachSheet((sheet) => {
    out.push(`# Sheet: ${sheet.name}`);
    sheet.eachRow({ includeEmpty: false }, (row) => {
      const cells: string[] = [];
      row.eachCell({ includeEmpty: true }, (cell) => {
        const v = cell.value;
        if (v == null) cells.push("");
        else if (typeof v === "object" && "result" in (v as object))
          cells.push(String((v as { result: unknown }).result ?? ""));
        else if (typeof v === "object" && "text" in (v as object))
          cells.push(String((v as { text: unknown }).text ?? ""));
        else cells.push(String(v));
      });
      out.push(cells.join("\t"));
    });
  });
  return out.join("\n");
}

async function parsePdf(buf: Buffer): Promise<string> {
  const pdf = await getDocumentProxy(new Uint8Array(buf));
  const { text } = await extractText(pdf, { mergePages: true });
  return Array.isArray(text) ? text.join("\n") : text;
}

/** Parse one uploaded file to plain text. Never throws — a failed
 *  parse is recorded on the result so the batch continues and the
 *  failure becomes visible. */
export async function parseUpload(
  name: string,
  buf: Buffer
): Promise<ParsedFile> {
  const kind = classify(name);
  if (kind === "unsupported") {
    return {
      name,
      ok: false,
      text: "",
      chars: 0,
      truncated: false,
      note: "Unsupported file type. Use PDF, Word (.docx), Excel (.xlsx), plain text, or a .vtt/.srt transcript.",
    };
  }
  if (kind === "legacy") {
    return {
      name,
      ok: false,
      text: "",
      chars: 0,
      truncated: false,
      note: "Legacy Office format. Save it as PDF or .docx/.xlsx and re-upload (a one-click 'Save As' in Word/Excel) — we don't auto-read .doc/.xls/.ppt.",
    };
  }
  try {
    let raw = "";
    if (kind === "pdf") raw = await parsePdf(buf);
    else if (kind === "docx")
      raw = (await mammoth.extractRawText({ buffer: buf })).value;
    else if (kind === "xlsx") raw = await parseXlsx(buf);
    else if (kind === "transcript")
      raw = cleanTranscript(buf.toString("utf-8"));
    else raw = buf.toString("utf-8");

    raw = raw.replace(/ /g, " ").trim();
    if (!raw) {
      return {
        name,
        ok: false,
        text: "",
        chars: 0,
        truncated: false,
        note:
          kind === "pdf"
            ? "No selectable text found — this looks like a scanned/image PDF. Export a text PDF or paste the content."
            : "File parsed but contained no readable text.",
      };
    }
    const { text, truncated } = clamp(raw);
    return {
      name,
      ok: true,
      text,
      chars: text.length,
      truncated,
      note: truncated ? "Long file — only the first part was read." : undefined,
    };
  } catch (err) {
    return {
      name,
      ok: false,
      text: "",
      chars: 0,
      truncated: false,
      note: `Could not read this file (${
        err instanceof Error ? err.message : "parse error"
      }).`,
    };
  }
}
