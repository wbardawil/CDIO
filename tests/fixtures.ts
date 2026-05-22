// Shared test fixtures for the cockpit suite.
import type { BriefField, CDIOBrief } from "@/types/cockpit";

const filled = (text: string): BriefField => ({ filled: true, text });
const unfilled = (missing: string): BriefField => ({
  filled: false,
  text: "",
  missing,
});

/** A complete, plausible brief. Pass overrides to make sections
 *  empty, change options, etc. */
export function makeBrief(overrides: Partial<CDIOBrief> = {}): CDIOBrief {
  return {
    coldOpen: "The budget is being signed before the integration is proven.",
    gate: "clarify",
    gateReason: "The integration risk is not yet de-risked.",
    whereItStands: {
      businessOutcome: filled("Cut order-processing time in half."),
      currentStateFacts: filled("Orders are keyed by hand into two systems."),
      constraints: filled("Budget cap of 80k; must go live before Q4."),
      requirements: filled("Must sync with the existing accounting system."),
    },
    whatWeFound: {
      options: [
        {
          label: "Acme Suite",
          summary: "A cloud CRM with a built-in connector.",
          cost: "$60k/yr",
          risks: ["Connector is new and unproven."],
        },
      ],
      risks: [
        {
          risk: "Integration scope is unestimated",
          severity: "high",
          why: "It could double the project cost.",
        },
      ],
    },
    stillUnknown: {
      openQuestions: [
        {
          question: "Has anyone tested the accounting connector?",
          whyItMatters: "It is the load-bearing assumption.",
        },
      ],
    },
    whatToDoNext: {
      recommendedMove: filled("Run a connector proof-of-concept first."),
      decisionRisks: filled("The vendor is being chosen before discovery."),
      questionsForNextRoom: ["Can the vendor demo the live accounting sync?"],
    },
    ...overrides,
  };
}

export { filled as filledField, unfilled as unfilledField };
