// ============================================================
// CDIO Review Cockpit — the assistant
//
// A per-initiative chat assistant. It knows the initiative (its
// documents, constraints, stage, brief), the methodology lens for
// the current stage, and how the app works. Its job is to help the
// user move faster: answer plainly, and — more importantly —
// interview the user with the sharp questions that close the gaps.
//
// Runs server-side only. Non-streaming, fast model. It guides; it
// does not click buttons for the user.
// ============================================================

import Anthropic from "@anthropic-ai/sdk";
import type {
  CDIOBrief,
  Constraint,
  DocumentMeta,
  Initiative,
} from "@/types/cockpit";
import { STAGE_LABELS, STAGE_LENS, briefCompleteness } from "@/types/cockpit";

const CHAT_MODEL = "claude-haiku-4-5-20251001";
const MAX_TOKENS = 1024;
const MAX_HISTORY = 20; // turns fed back into the model

// Lazy client — see extract-brief.ts: constructing at import time
// captures a stale environment.
let _client: Anthropic | null = null;
function client(): Anthropic {
  if (!_client) _client = new Anthropic();
  return _client;
}

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export interface ChatInput {
  initiative: Initiative;
  documents: DocumentMeta[];
  constraints: Constraint[];
  latestBrief: CDIOBrief | null;
  history: ChatTurn[];
  userMessage: string;
}

const APP_KNOWLEDGE = `How the cockpit works, so you can guide the user:
- An initiative moves through five stages — Frame, Discover, Decide the approach, Source & select, Plan — shown as buttons across the top.
- The user adds material on the left: drop files, or "paste text instead".
- The user sets non-negotiables (hard limits) on the left.
- The amber "Generate the brief" button reads everything against the methodology and produces the CDIO Brief.
- The brief leads with "the call" — the one thing that matters — and tucks the detail behind "Show the full brief".`;

function buildSystem(input: ChatInput): string {
  const { initiative, documents, constraints, latestBrief } = input;

  const docList = documents.length
    ? documents
        .map((d) => `- ${d.filename}${d.parseOk ? "" : " (couldn't be read)"}`)
        .join("\n")
    : "(none yet)";

  const consList = constraints.length
    ? constraints
        .map((c) => `- ${c.label}${c.value ? `: ${c.value}` : ""}`)
        .join("\n")
    : "(none set yet)";

  let briefState: string;
  if (!latestBrief) {
    briefState = "No brief has been generated yet.";
  } else {
    const gaps = briefCompleteness(latestBrief)
      .filter((e) => !e.filled)
      .map((e) => e.section);
    briefState =
      `A brief exists — recommended gate: ${latestBrief.gate}. ` +
      (gaps.length
        ? `It is partial; the gaps are: ${gaps.join(", ")}.`
        : "It is complete.");
  }

  return `You are the assistant inside the CDIO Review Cockpit — a tool that helps a non-technical project manager run a technology initiative well, with a fractional CDIO overseeing.

Your job is to help the user move faster. You do two things: answer their questions plainly, and — more importantly — interview THEM. Ask the sharp questions that close the gaps in this initiative, one or two at a time. Be brief and concrete. Plain language only — no jargon, no framework names, no module codes. You guide the user; you never claim to have changed anything in the app — when something needs doing, tell them which button to use.

THIS INITIATIVE
- Name: ${initiative.name}
- Type: ${initiative.initiativeType ?? "unspecified"}
- Current stage: ${STAGE_LABELS[initiative.stage]}
- What this stage checks: ${STAGE_LENS[initiative.stage]}
- Documents on file:
${docList}
- Non-negotiables set:
${consList}
- Brief: ${briefState}

${APP_KNOWLEDGE}

Keep replies short — a few sentences. If this initiative is thin (no documents, no brief), your first move is to ask plainly what the project is trying to achieve and prompt the user to add their first material.`;
}

/** One assistant turn. Throws on an API failure; the caller maps
 *  it to a plain message. */
export async function chatReply(input: ChatInput): Promise<string> {
  const history = input.history.slice(-MAX_HISTORY);
  const message = await client().messages.create({
    model: CHAT_MODEL,
    max_tokens: MAX_TOKENS,
    system: buildSystem(input),
    messages: [
      ...history.map((t) => ({ role: t.role, content: t.content })),
      { role: "user" as const, content: input.userMessage },
    ],
  });
  const text =
    message.content[0]?.type === "text" ? message.content[0].text : "";
  return text.trim();
}

// Exported for tests.
export { buildSystem };
