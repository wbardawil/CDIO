// ============================================================
// AI-CDIO — Cadence + Status Report types (Phase 1D Day 26-27)
// ============================================================

export interface CadenceToken {
  id: string;
  created_at: string;
  org_id: string;
  practitioner_id: string;
  token: string;
  label: string | null;
  expires_at: string | null;
  revoked_at: string | null;
  last_used_at: string | null;
}

export type StatusReportStatus = "draft" | "published";

export interface ModuleScoreChange {
  module_number: number;
  before: number | null;
  after: number | null;
  narrative: string;
}

export interface StatusReportPayload {
  commitment_milestones_hit?: number;
  commitment_milestones_total?: number;
  initiative_summary?: {
    active: number;
    blocked: number;
    done: number;
    total: number;
  };
  decision_summary?: {
    open: number;
    recommended: number;
    decided: number;
    total: number;
  };
  wins?: string[];
  blockers?: string[];
  next_period_focus?: string[];
  module_score_changes?: ModuleScoreChange[];
}

export interface StatusReport {
  id: string;
  created_at: string;
  updated_at: string;
  org_id: string;
  practitioner_id: string;
  period_start: string;
  period_end: string;
  title: string;
  headline: string;
  payload: StatusReportPayload;
  status: StatusReportStatus;
  published_at: string | null;
}
