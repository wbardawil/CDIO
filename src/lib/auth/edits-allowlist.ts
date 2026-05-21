import { z } from "zod";
import type { ApprovableArtifactType } from "./role-gates";

// ============================================================
// Editable-columns allow-list for approve-with-edits.
//
// Per /plan-eng-review A3 lock + codex review X6 (the original plan
// invented column names; these are re-derived from the real schemas):
//
//   initiatives    → schema-v11 / v19   (title, goal, domain, ...)
//   status_reports → schema-v14         (title, headline, payload)
//   selections     → schema-v12         (title, question, ...)
//   audits         → schema-v16         (title, intake)
//
// S2 does NOT consume these schemas yet — the approve handler in S2
// always passes p_edits := NULL to apply_artifact_approve. The schemas
// land here ready for S3, when the approve-with-edits UX ships
// alongside the first-class Decision Package wizard. At that point,
// approval-actions.ts/handleApprove will:
//
//   1. Parse req.body via EDITS_SCHEMAS[artifactType].safeParse(...)
//   2. If non-empty + valid, pass the validated jsonb as p_edits
//   3. The RPC applies columns atomically with the status flip;
//      event_type becomes 'approved_with_edits'.
//
// SQL trust boundary: apply_artifact_approve is SECURITY DEFINER +
// service_role-only. It accepts the validated p_edits as authoritative.
// Adding a column to an artifact table → add it here AND extend the
// RPC's dynamic UPDATE clause for that column. Both steps are required.
// ============================================================

const initiativeEditsSchema = z
  .object({
    title: z.string().min(1).max(200).optional(),
    goal: z.string().min(1).max(4000).optional(),
    domain: z.enum(["tech", "ai", "security", "process", "data", "other"]).optional(),
    module_number: z.number().int().min(1).max(16).nullable().optional(),
    owner_name: z.string().max(200).nullable().optional(),
    owner_email: z.string().email().nullable().optional(),
    target_completion_date: z.string().date().nullable().optional(),
  })
  .strict();

const statusReportEditsSchema = z
  .object({
    title: z.string().min(1).max(200).optional(),
    headline: z.string().max(4000).optional(),
    // payload is the structured Status Report body (commitment_milestones,
    // initiative_summary, wins, blockers, etc.). Per-key validation lands
    // when the wizard ships in S3; S2 accepts arbitrary jsonb shape.
    payload: z.record(z.string(), z.unknown()).optional(),
  })
  .strict();

const selectionEditsSchema = z
  .object({
    title: z.string().min(1).max(200).optional(),
    question: z.string().min(1).max(4000).optional(),
    domain: z.enum(["tech", "ai", "partner"]).optional(),
    module_number: z.number().int().min(1).max(16).nullable().optional(),
    // criteria + candidates are ordered jsonb arrays; S2 accepts the
    // whole array as-is, S3 may tighten per-element validation.
    criteria: z.array(z.record(z.string(), z.unknown())).optional(),
    candidates: z.array(z.record(z.string(), z.unknown())).optional(),
    recommendation: z.string().max(4000).nullable().optional(),
  })
  .strict();

const auditEditsSchema = z
  .object({
    title: z.string().min(1).max(200).optional(),
    // intake shape = AuditIntake in src/types/audit.ts; jsonb here.
    // output / method_capture are AI-generated, never user-edited.
    intake: z.record(z.string(), z.unknown()).optional(),
  })
  .strict();

export const EDITS_SCHEMAS: Record<ApprovableArtifactType, z.ZodSchema> = {
  initiative: initiativeEditsSchema,
  status_report: statusReportEditsSchema,
  selection: selectionEditsSchema,
  audit: auditEditsSchema,
};

export type InitiativeEdits = z.infer<typeof initiativeEditsSchema>;
export type StatusReportEdits = z.infer<typeof statusReportEditsSchema>;
export type SelectionEdits = z.infer<typeof selectionEditsSchema>;
export type AuditEdits = z.infer<typeof auditEditsSchema>;
