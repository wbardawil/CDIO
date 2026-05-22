import { describe, it, expect } from "vitest";
import { checkConstraints } from "./checks";
import type { Constraint } from "@/types/cockpit";
import { makeBrief } from "../../../tests/fixtures";

function constraint(over: Partial<Constraint>): Constraint {
  return {
    id: "c1",
    initiativeId: "i1",
    kind: "other",
    label: "x",
    value: null,
    createdAt: "2026-05-21T00:00:00Z",
    ...over,
  };
}

describe("checkConstraints", () => {
  it("flags a cannot_touch constraint whose keyword appears in an option", () => {
    // makeBrief's option summary/risks mention "connector"
    const brief = makeBrief();
    const flags = checkConstraints(brief, [
      constraint({ kind: "cannot_touch", label: "the legacy connector" }),
    ]);
    expect(flags).toHaveLength(1);
    expect(flags[0].kind).toBe("conflict");
  });

  it("flags a must_integrate constraint whose keyword is absent from all options", () => {
    const brief = makeBrief();
    const flags = checkConstraints(brief, [
      constraint({ kind: "must_integrate", label: "the warehouse scanner" }),
    ]);
    expect(flags).toHaveLength(1);
    expect(flags[0].kind).toBe("unaddressed");
  });

  it("does not flag a must_integrate constraint that an option does address", () => {
    const brief = makeBrief();
    const flags = checkConstraints(brief, [
      constraint({ kind: "must_integrate", label: "the accounting connector" }),
    ]);
    expect(flags).toHaveLength(0);
  });

  it("returns nothing when the brief has no options to check against", () => {
    const brief = makeBrief();
    brief.whatWeFound.options = [];
    const flags = checkConstraints(brief, [
      constraint({ kind: "cannot_touch", label: "anything" }),
    ]);
    expect(flags).toEqual([]);
  });

  it("does not fake a deterministic check for budget constraints", () => {
    const brief = makeBrief();
    const flags = checkConstraints(brief, [
      constraint({ kind: "budget", label: "budget cap", value: "80000" }),
    ]);
    expect(flags).toEqual([]);
  });
});
