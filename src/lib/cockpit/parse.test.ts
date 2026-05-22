import { describe, it, expect } from "vitest";
import ExcelJS from "exceljs";
import { parseUpload } from "./parse";

const buf = (s: string) => Buffer.from(s, "utf-8");

describe("parseUpload", () => {
  it("reads plain text", async () => {
    const r = await parseUpload("notes.txt", buf("the CRM is slow"));
    expect(r.ok).toBe(true);
    expect(r.text).toContain("CRM is slow");
  });

  it("reads markdown and csv as text", async () => {
    expect((await parseUpload("a.md", buf("# heading"))).ok).toBe(true);
    expect((await parseUpload("a.csv", buf("col1,col2"))).ok).toBe(true);
  });

  it("strips timecodes from a .vtt transcript", async () => {
    const vtt = "WEBVTT\n\n1\n00:00:01.000 --> 00:00:04.000\nWe need a new system";
    const r = await parseUpload("call.vtt", buf(vtt));
    expect(r.ok).toBe(true);
    expect(r.text).toContain("We need a new system");
    expect(r.text).not.toContain("WEBVTT");
    expect(r.text).not.toContain("-->");
  });

  it("reads a real .xlsx workbook", async () => {
    const wb = new ExcelJS.Workbook();
    const sheet = wb.addWorksheet("Costs");
    sheet.addRow(["Vendor", "Price"]);
    sheet.addRow(["Acme", 50000]);
    const out = await wb.xlsx.writeBuffer();
    const r = await parseUpload("costs.xlsx", Buffer.from(out));
    expect(r.ok).toBe(true);
    expect(r.text).toContain("Acme");
    expect(r.text).toContain("50000");
  });

  it("rejects an unsupported file type with guidance", async () => {
    const r = await parseUpload("photo.heic", buf("xx"));
    expect(r.ok).toBe(false);
    expect(r.note).toMatch(/unsupported/i);
  });

  it("rejects legacy Office formats with an actionable message", async () => {
    const r = await parseUpload("old.doc", buf("xx"));
    expect(r.ok).toBe(false);
    expect(r.note).toMatch(/save it as/i);
  });

  it("flags an empty file as unreadable, never throws", async () => {
    const r = await parseUpload("empty.txt", buf("   "));
    expect(r.ok).toBe(false);
    expect(r.note).toMatch(/no readable text/i);
  });

  it("records a corrupt PDF as a failed parse instead of throwing", async () => {
    const r = await parseUpload("broken.pdf", buf("this is not a pdf"));
    expect(r.ok).toBe(false);
    expect(r.note).toBeTruthy();
  });
});
