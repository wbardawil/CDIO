// ============================================================
// AI-CDIO — Initiative types (Phase 1D Day 22-23)
// ============================================================

export type InitiativeDomain =
  | "tech"
  | "ai"
  | "security"
  | "process"
  | "data"
  | "other";

export type InitiativeStatus = "active" | "blocked" | "done" | "cancelled";

export type InitiativeStepStatus = "todo" | "in_progress" | "done" | "blocked";

export interface InitiativeStep {
  id: string;
  position: number;
  title: string;
  description: string | null;
  status: InitiativeStepStatus;
  assignee_name: string | null;
  assignee_email: string | null;
  due_date: string | null;
  completed_at: string | null;
  notes: string | null;
}

export interface Initiative {
  id: string;
  created_at: string;
  updated_at: string;
  org_id: string;
  practitioner_id: string;
  title: string;
  goal: string;
  domain: InitiativeDomain;
  module_number: number | null;
  owner_name: string | null;
  owner_email: string | null;
  status: InitiativeStatus;
  target_completion_date: string | null;
  completed_at: string | null;
  steps: InitiativeStep[];
  practitioner_notes: string | null;
}

export const INITIATIVE_DOMAIN_LABEL: Record<InitiativeDomain, string> = {
  tech: "Technology",
  ai: "AI",
  security: "Security",
  process: "Process",
  data: "Data",
  other: "Other",
};

export const INITIATIVE_STATUS_LABEL: Record<InitiativeStatus, string> = {
  active: "Active",
  blocked: "Blocked",
  done: "Done",
  cancelled: "Cancelled",
};

export const INITIATIVE_STEP_STATUS_LABEL: Record<
  InitiativeStepStatus,
  string
> = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
  blocked: "Blocked",
};

export function computeInitiativeProgress(steps: InitiativeStep[]): {
  done: number;
  total: number;
  percent: number;
} {
  const total = steps.length;
  if (total === 0) return { done: 0, total: 0, percent: 0 };
  const done = steps.filter((s) => s.status === "done").length;
  return { done, total, percent: Math.round((done / total) * 100) };
}
