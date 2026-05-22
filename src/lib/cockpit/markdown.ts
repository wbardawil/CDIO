// ============================================================
// CDIO Review Cockpit — brief → Markdown
//
// Renders a CDIOBrief as a clean Markdown document for export.
// Markdown reflows, reads on a phone, and pastes anywhere — the
// PM reads it before walking into a room.
// ============================================================

import type { BriefField, CDIOBrief, Initiative } from "@/types/cockpit";
import { GATE_LABELS, INITIATIVE_TYPE_LABELS, STAGE_LABELS } from "@/types/cockpit";

function field(label: string, f: BriefField): string {
  if (f.filled) return `**${label}.** ${f.text}`;
  return `**${label}.** _Couldn't fill yet — ${f.missing ?? "more input needed"}._`;
}

export function briefToMarkdown(
  brief: CDIOBrief,
  initiative: Initiative,
  version: number
): string {
  const lines: string[] = [];

  lines.push(`# CDIO Brief — ${initiative.name}`);
  lines.push("");
  const typeLabel = initiative.initiativeType
    ? INITIATIVE_TYPE_LABELS[initiative.initiativeType]
    : "Initiative";
  lines.push(
    `_${typeLabel} · Stage: ${STAGE_LABELS[initiative.stage]} · Brief v${version}_`
  );
  lines.push("");

  lines.push(`> **${brief.coldOpen}**`);
  lines.push("");
  lines.push(
    `**Recommended next gate: ${GATE_LABELS[brief.gate]}.** ${brief.gateReason}`
  );
  lines.push("");

  lines.push("## Where it stands");
  lines.push("");
  lines.push(field("Business outcome", brief.whereItStands.businessOutcome));
  lines.push("");
  lines.push(field("Current state", brief.whereItStands.currentStateFacts));
  lines.push("");
  lines.push(field("Constraints", brief.whereItStands.constraints));
  lines.push("");
  lines.push(field("Requirements", brief.whereItStands.requirements));
  lines.push("");

  lines.push("## What we found");
  lines.push("");
  if (brief.whatWeFound.options.length > 0) {
    lines.push("### Options");
    lines.push("");
    for (const o of brief.whatWeFound.options) {
      lines.push(`- **${o.label}**${o.cost ? ` — ${o.cost}` : ""}`);
      if (o.summary) lines.push(`  ${o.summary}`);
      for (const r of o.risks) lines.push(`  - Risk: ${r}`);
    }
    lines.push("");
  }
  if (brief.whatWeFound.risks.length > 0) {
    lines.push("### Risks");
    lines.push("");
    for (const r of brief.whatWeFound.risks) {
      lines.push(`- **[${r.severity.toUpperCase()}] ${r.risk}** — ${r.why}`);
    }
    lines.push("");
  }
  if (
    brief.whatWeFound.options.length === 0 &&
    brief.whatWeFound.risks.length === 0
  ) {
    lines.push("_Nothing found yet — add vendor proposals and notes._");
    lines.push("");
  }

  lines.push("## What is still unknown");
  lines.push("");
  if (brief.stillUnknown.openQuestions.length > 0) {
    for (const q of brief.stillUnknown.openQuestions) {
      lines.push(`- **${q.question}**`);
      if (q.whyItMatters) lines.push(`  Why it matters: ${q.whyItMatters}`);
    }
  } else {
    lines.push("_No open questions surfaced._");
  }
  lines.push("");

  lines.push("## What to do next");
  lines.push("");
  lines.push(field("Recommended move", brief.whatToDoNext.recommendedMove));
  lines.push("");
  if (brief.whatToDoNext.decisionRisks.filled) {
    lines.push(field("Decision risk", brief.whatToDoNext.decisionRisks));
    lines.push("");
  }
  if (brief.whatToDoNext.questionsForNextRoom.length > 0) {
    lines.push("**Questions to ask in the next room:**");
    lines.push("");
    for (const q of brief.whatToDoNext.questionsForNextRoom) {
      lines.push(`- ${q}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}
