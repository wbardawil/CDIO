// ============================================================
// AI-CDIO — Conversation Agent
// Chat-first entry point: maps natural language to diagnostic
// questions, tracks implicit module scores, delivers instant value
// ============================================================

import Anthropic from "@anthropic-ai/sdk";
import { searchPlaybook } from "@/lib/playbook/retrieve";
import { getModuleQuestions } from "@/lib/playbook/diagnostic-questions";
import { PAIN_POINT_MODULES } from "@/lib/agents/pain-points";
import { MODULE_NAMES } from "@/types";

const anthropic = new Anthropic();

const CONVERSATION_SYSTEM_PROMPT = `You are the AI-CDIO — an AI-powered Chief Digital and Information Officer for small and medium businesses.

## Your Role
You are a friendly, knowledgeable technology advisor. You help business owners and leaders make smart technology decisions without the jargon, politics, or bias of traditional consultants.

## How You Work
1. You ask simple, clear questions about their business and technology
2. You listen carefully and assess their situation against a proven 16-module digital maturity framework
3. You give specific, actionable advice — not vague recommendations
4. You are vendor-agnostic — you recommend what's best for THEM, not what earns you a commission

## Important Disclosure
You are an AI advisor. While your recommendations are grounded in proven frameworks and best practices, they should be verified by qualified professionals before critical implementation decisions. Always remind users of this when giving security, compliance, or high-stakes advice.

## Conversation Rules
- Use plain language. No jargon. If you must use a technical term, explain it.
- Keep responses SHORT — 2-3 sentences per point maximum
- Ask ONE question at a time, not a list
- After 3-5 questions on a topic, deliver a mini-assessment with ONE concrete action
- Be warm but direct. Respect that business owners are busy.
- Never say "it depends" without following up with "here's what I'd do in your situation"
- After delivering 2-3 action cards, offer: "Want me to keep going one topic at a time, or would you prefer a full technology health check across all 16 areas? The full assessment takes about 20 minutes and gives you a complete map with a day-by-day plan."
- When you have enough info to score a module, include a JSON block at the end of your message (hidden from user, used by the system):

<!--SCORE:{"module":5,"score":2,"confidence":0.7,"evidence":"Has basic antivirus but no MFA, no formal policy, no vulnerability scanning"}-->

## Your Knowledge
You have deep expertise across 16 technology domains:
${Object.entries(MODULE_NAMES).map(([n, name]) => `${n}. ${name}`).join("\n")}

## Action Card Format
When you're ready to recommend an action, format it clearly:

**Your #1 Action: [Title]**
**Why:** [1 sentence on why this matters for their business]
**How:** [3-5 concrete steps]
**Time:** [estimate]
**Cost:** [estimate or "Free"]
**Impact:** [what changes when they do this]`;

// --- Main chat function ---

export async function chat(
  messages: { role: "user" | "assistant"; content: string }[],
  context?: {
    painPoint?: string;
    industry?: string;
    employeeCount?: number;
    modulesExplored?: number[];
  }
): Promise<{
  reply: string;
  implicitScores: { module: number; score: number; confidence: number; evidence: string }[];
}> {
  // Build context enrichment
  let contextBlock = "";

  if (context?.painPoint) {
    const modules = PAIN_POINT_MODULES[context.painPoint] ?? [];
    if (modules.length > 0) {
      // Get relevant diagnostic questions to guide the conversation
      const relevantQuestions = modules.flatMap((m) =>
        getModuleQuestions(m).map((q) => `[M${m}] ${q.question}`)
      );
      contextBlock += `\n\nThe user's pain point maps to modules: ${modules.map((m) => `${m} (${MODULE_NAMES[m]})`).join(", ")}.\n`;
      contextBlock += `Use these diagnostic questions to guide your conversation (ask them naturally, not as a checklist):\n${relevantQuestions.slice(0, 8).join("\n")}`;
    }
  }

  if (context?.industry) {
    contextBlock += `\nIndustry: ${context.industry}`;
  }
  if (context?.employeeCount) {
    contextBlock += `\nCompany size: ~${context.employeeCount} employees`;
  }

  // RAG: search playbook for relevant context
  let ragContext = "";
  const lastUserMsg = messages.filter((m) => m.role === "user").pop()?.content ?? "";
  if (lastUserMsg.length > 10) {
    try {
      const chunks = await searchPlaybook(lastUserMsg, { limit: 3 });
      if (chunks.length > 0) {
        ragContext = "\n\n## Playbook Reference\n" +
          chunks.map((c) => c.content.substring(0, 500)).join("\n---\n");
      }
    } catch {
      // RAG is optional
    }
  }

  const systemPrompt = CONVERSATION_SYSTEM_PROMPT + contextBlock + ragContext;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: systemPrompt,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  });

  const reply = response.content[0].type === "text" ? response.content[0].text : "";

  // Extract implicit scores from hidden tags
  const implicitScores: { module: number; score: number; confidence: number; evidence: string }[] = [];
  const scoreMatches = reply.matchAll(/<!--SCORE:({.*?})-->/g);
  for (const match of scoreMatches) {
    try {
      const parsed = JSON.parse(match[1]);
      implicitScores.push({
        module: parsed.module,
        score: parsed.score,
        confidence: parsed.confidence ?? 0.5,
        evidence: parsed.evidence ?? "",
      });
    } catch {
      // Skip malformed scores
    }
  }

  // Strip hidden score tags from the visible reply
  const cleanReply = reply.replace(/<!--SCORE:{.*?}-->/g, "").trim();

  return { reply: cleanReply, implicitScores };
}
