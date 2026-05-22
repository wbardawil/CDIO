import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the Anthropic SDK before importing the module under test.
const { create } = vi.hoisted(() => ({ create: vi.fn() }));
vi.mock("@anthropic-ai/sdk", () => ({
  default: class {
    messages = { create };
  },
}));

import { chatReply, buildSystem, type ChatInput } from "./chat";
import type { DocumentMeta, Initiative } from "@/types/cockpit";
import { makeBrief } from "../../../tests/fixtures";

const initiative: Initiative = {
  id: "i1",
  ownerUserId: "u1",
  name: "The new CRM",
  initiativeType: "crm",
  stage: "discover",
  createdAt: "2026-05-22T00:00:00Z",
  updatedAt: "2026-05-22T00:00:00Z",
};

function makeInput(over: Partial<ChatInput> = {}): ChatInput {
  return {
    initiative,
    documents: [],
    constraints: [],
    latestBrief: null,
    history: [],
    userMessage: "what should I do next?",
    ...over,
  };
}

beforeEach(() => create.mockReset());

describe("buildSystem", () => {
  it("grounds the prompt in this initiative's context", () => {
    const sys = buildSystem(makeInput());
    expect(sys).toContain("The new CRM");
    expect(sys).toContain("Discover"); // stage label
    expect(sys).toContain("(none yet)"); // no documents
    expect(sys).toContain("No brief has been generated yet");
  });

  it("lists documents and the brief state when present", () => {
    const doc: DocumentMeta = {
      id: "d1",
      initiativeId: "i1",
      filename: "kickoff-notes.txt",
      sha256: "x",
      parseOk: true,
      parseNote: null,
      createdAt: "2026-05-22T00:00:00Z",
    };
    const sys = buildSystem(
      makeInput({ documents: [doc], latestBrief: makeBrief() })
    );
    expect(sys).toContain("kickoff-notes.txt");
    expect(sys).toContain("A brief exists");
  });

  it("instructs the assistant to interview, not just answer", () => {
    const sys = buildSystem(makeInput());
    expect(sys.toLowerCase()).toContain("interview");
  });
});

describe("chatReply", () => {
  it("returns the assistant's reply, trimmed", async () => {
    create.mockResolvedValue({
      content: [{ type: "text", text: "  What is the integration picture?  " }],
    });
    const reply = await chatReply(makeInput({ userMessage: "where do I start?" }));
    expect(reply).toBe("What is the integration picture?");
    expect(create).toHaveBeenCalledOnce();
  });

  it("sends the prior history plus the new message to the model", async () => {
    create.mockResolvedValue({ content: [{ type: "text", text: "ok" }] });
    await chatReply(
      makeInput({
        history: [
          { role: "user", content: "hi" },
          { role: "assistant", content: "hello" },
        ],
        userMessage: "and now?",
      })
    );
    const sent = create.mock.calls[0][0].messages;
    expect(sent).toHaveLength(3);
    expect(sent[2]).toEqual({ role: "user", content: "and now?" });
  });
});
