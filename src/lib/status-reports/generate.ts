// ============================================================
// AI-CDIO — Status Report auto-generator (Phase 1D Day 27)
//
// Pulls live engagement state and produces a default Status
// Report payload. Practitioner can override headline + wins +
// blockers + next_period_focus before publishing. The structured
// payload (counts, module score changes) is computed mechanically
// from the data; the narrative parts are practitioner-editable.
//
// No LLM call - deterministic. Phase 2.5 polish: optional AI
// rewrite of the headline using the assessment narrative agent.
// ============================================================

import { createServiceClient } from "@/lib/db/supabase";
import type {
  StatusReportPayload,
  ModuleScoreChange,
} from "@/types/cadence";
import type { Initiative } from "@/types/initiative";
import type { Selection } from "@/types/selection";

interface GenerateInput {
  orgId: string;
  periodStart: Date;
  periodEnd: Date;
}

export async function generateStatusReportPayload(
  input: GenerateInput
): Promise<{ payload: StatusReportPayload; defaultHeadline: string }> {
  const db = createServiceClient();

  const { data: initiatives } = await db
    .from("initiatives")
    .select("status, completed_at")
    .eq("org_id", input.orgId);

  const { data: selections } = await db
    .from("selections")
    .select("status, decided_at")
    .eq("org_id", input.orgId);

  const { data: synthesis } = await db
    .from("assessment_synthesis")
    .select("module_number, consensus_score, updated_at")
    .eq("org_id", input.orgId)
    .order("updated_at", { ascending: false });

  const inits = (initiatives ?? []) as Pick<
    Initiative,
    "status" | "completed_at"
  >[];
  const initSummary = {
    active: inits.filter((i) => i.status === "active").length,
    blocked: inits.filter((i) => i.status === "blocked").length,
    done: inits.filter((i) => i.status === "done").length,
    total: inits.length,
  };

  const sels = (selections ?? []) as Pick<
    Selection,
    "status" | "decided_at"
  >[];
  const decSummary = {
    open: sels.filter((s) => s.status === "open").length,
    recommended: sels.filter((s) => s.status === "recommended").length,
    decided: sels.filter((s) => s.status === "decided").length,
    total: sels.length,
  };

  const moduleChanges: ModuleScoreChange[] = [];
  const seen = new Set<number>();
  for (const row of synthesis ?? []) {
    const r = row as { module_number: number; consensus_score: number | null };
    if (typeof r.module_number !== "number") continue;
    if (seen.has(r.module_number)) continue;
    seen.add(r.module_number);
    moduleChanges.push({
      module_number: r.module_number,
      before: null,
      after: r.consensus_score ?? null,
      narrative: "",
    });
    if (moduleChanges.length >= 8) break;
  }

  const payload: StatusReportPayload = {
    commitment_milestones_hit: 0,
    commitment_milestones_total: 6,
    initiative_summary: initSummary,
    decision_summary: decSummary,
    wins: [],
    blockers: [],
    next_period_focus: [],
    module_score_changes: moduleChanges,
  };

  const defaultHeadline = buildDefaultHeadline(initSummary, decSummary);

  return { payload, defaultHeadline };
}

function buildDefaultHeadline(
  init: { active: number; blocked: number; done: number; total: number },
  dec: { open: number; recommended: number; decided: number; total: number }
): string {
  const initLine =
    init.total === 0
      ? "No initiatives in flight yet."
      : `${init.active} initiatives active, ${init.done} shipped, ${init.blocked} blocked${init.total > 0 ? "" : ""}.`;
  const decLine =
    dec.total === 0
      ? ""
      : ` ${dec.decided} decisions locked, ${dec.recommended} pending client sign-off, ${dec.open} still in evaluation.`;
  return `${initLine}${decLine} Next period: keep the active work moving and close any open decisions blocking the highest-leverage initiative.`;
}
