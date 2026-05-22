import { describe, it, expect } from "vitest";
import {
  STAGE_MODULES,
  formatRubric,
  getRubric,
  modulesForStage,
} from "./methodology";

describe("modulesForStage", () => {
  it("returns the stage's modules with no initiative type", () => {
    expect(modulesForStage("frame", null)).toEqual([1, 2, 10, 12]);
  });

  it("unions in the initiative type's extra modules, sorted and deduped", () => {
    // source = [13,7,5,12]; crm adds [9]
    expect(modulesForStage("source", "crm")).toEqual([5, 7, 9, 12, 13]);
  });

  it("does not duplicate a module already in the stage slice", () => {
    // source already has 5; security adds [5]
    expect(modulesForStage("source", "security")).toEqual([5, 7, 12, 13]);
  });

  it("covers every stage", () => {
    for (const stage of Object.keys(STAGE_MODULES) as (keyof typeof STAGE_MODULES)[]) {
      expect(modulesForStage(stage, null).length).toBeGreaterThan(0);
    }
  });
});

describe("getRubric", () => {
  it("returns checks drawn from the stage's modules", () => {
    const rubric = getRubric("frame", null);
    expect(rubric.length).toBeGreaterThan(0);
    const modules = new Set(rubric.map((c) => c.module));
    for (const m of modules) expect([1, 2, 10, 12]).toContain(m);
    for (const c of rubric) {
      expect(c.question).toBeTruthy();
      expect(c.weakSignal).toBeTruthy();
      expect(c.strongSignal).toBeTruthy();
    }
  });
});

describe("formatRubric", () => {
  it("renders a numbered text block", () => {
    const text = formatRubric(getRubric("decide", "data"));
    expect(text).toMatch(/^1\. /);
    expect(text).toContain("weak:");
    expect(text).toContain("strong:");
  });
});
