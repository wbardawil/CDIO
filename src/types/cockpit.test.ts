import { describe, it, expect } from "vitest";
import { briefCompleteness, briefStatus } from "./cockpit";
import { makeBrief, unfilledField } from "../../tests/fixtures";

describe("briefCompleteness", () => {
  it("reports every section filled for a complete brief", () => {
    const entries = briefCompleteness(makeBrief());
    expect(entries.every((e) => e.filled)).toBe(true);
  });

  it("flags an unfilled narrative section with its missing reason", () => {
    const brief = makeBrief();
    brief.whereItStands.businessOutcome = unfilledField("Add a goal statement.");
    const entries = briefCompleteness(brief);
    const outcome = entries.find((e) => e.section === "Business outcome");
    expect(outcome?.filled).toBe(false);
    expect(outcome?.missing).toBe("Add a goal statement.");
  });

  it("treats an empty options list as an unfilled section", () => {
    const brief = makeBrief();
    brief.whatWeFound.options = [];
    const opts = briefCompleteness(brief).find((e) => e.section === "Options");
    expect(opts?.filled).toBe(false);
  });
});

describe("briefStatus", () => {
  it("is complete when every required section is filled", () => {
    expect(briefStatus(makeBrief())).toBe("complete");
  });

  it("is partial when any section is unfilled", () => {
    const brief = makeBrief();
    brief.whatToDoNext.recommendedMove = unfilledField("Need source material.");
    expect(briefStatus(brief)).toBe("partial");
  });
});
