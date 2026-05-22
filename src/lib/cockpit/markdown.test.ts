import { describe, it, expect } from "vitest";
import { briefToMarkdown } from "./markdown";
import type { Initiative } from "@/types/cockpit";
import { makeBrief, unfilledField } from "../../../tests/fixtures";

const initiative: Initiative = {
  id: "i1",
  ownerUserId: "u1",
  name: "The new CRM",
  initiativeType: "crm",
  stage: "source",
  createdAt: "2026-05-21T00:00:00Z",
  updatedAt: "2026-05-21T00:00:00Z",
};

describe("briefToMarkdown", () => {
  it("leads with the title and the cold open", () => {
    const md = briefToMarkdown(makeBrief(), initiative, 3);
    expect(md).toContain("# CDIO Brief — The new CRM");
    expect(md).toContain("Brief v3");
    expect(md).toMatch(/> \*\*.*integration is proven/);
  });

  it("renders the four parts and the options", () => {
    const md = briefToMarkdown(makeBrief(), initiative, 1);
    expect(md).toContain("## Where it stands");
    expect(md).toContain("## What we found");
    expect(md).toContain("## What is still unknown");
    expect(md).toContain("## What to do next");
    expect(md).toContain("Acme Suite");
  });

  it("shows an honest 'couldn't fill' line for an unfilled section", () => {
    const brief = makeBrief();
    brief.whereItStands.requirements = unfilledField("Add a requirements list.");
    const md = briefToMarkdown(brief, initiative, 1);
    expect(md).toMatch(/Couldn't fill yet — Add a requirements list/);
  });
});
