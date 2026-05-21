import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { assertCanWrite } from "@/lib/auth/role-gates";
import { createServiceClient } from "@/lib/db/supabase";
import type { StatusReport } from "@/types/cadence";

const updateSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  headline: z.string().max(4000).optional(),
  payload: z
    .object({
      commitment_milestones_hit: z.number().int().min(0).max(6).optional(),
      commitment_milestones_total: z.number().int().min(0).max(6).optional(),
      wins: z.array(z.string().max(500)).max(10).optional(),
      blockers: z.array(z.string().max(500)).max(10).optional(),
      next_period_focus: z.array(z.string().max(500)).max(10).optional(),
      initiative_summary: z
        .object({
          active: z.number().int().min(0),
          blocked: z.number().int().min(0),
          done: z.number().int().min(0),
          total: z.number().int().min(0),
        })
        .optional(),
      decision_summary: z
        .object({
          open: z.number().int().min(0),
          recommended: z.number().int().min(0),
          decided: z.number().int().min(0),
          total: z.number().int().min(0),
        })
        .optional(),
      module_score_changes: z
        .array(
          z.object({
            module_number: z.number().int().min(1).max(16),
            before: z.number().nullable(),
            after: z.number().nullable(),
            narrative: z.string().max(500),
          })
        )
        .max(16)
        .optional(),
    })
    .optional(),
  status: z.enum(["draft", "published"]).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const db = createServiceClient();
  const { data: existing } = await db
    .from("status_reports")
    .select("id, org_id, approval_status")
    .eq("id", id)
    .maybeSingle();
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // codex-audit-2026-05-21 finding #9 — viewers cannot mutate status reports.
  const ownership = await assertCanWrite(existing.org_id);
  if (!ownership.ok) return ownership.response;

  // S2 mutation guard (codex X8).
  if (existing.approval_status !== "draft" && existing.approval_status !== "returned") {
    return NextResponse.json(
      {
        error: "Cannot mutate artifact in this state",
        details: `Status report is '${existing.approval_status}'; PATCH allowed only on draft or returned.`,
        approval_status: existing.approval_status,
      },
      { status: 409 },
    );
  }

  const update: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.status === "published") {
    update.published_at = new Date().toISOString();
  } else if (parsed.data.status === "draft") {
    update.published_at = null;
  }

  const { data, error } = await db
    .from("status_reports")
    .update(update)
    .eq("id", id)
    .in("approval_status", ["draft", "returned"])
    .select("*")
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: "Failed to update status report", details: error.message },
      { status: 500 }
    );
  }
  if (!data) {
    return NextResponse.json(
      {
        error: "Concurrent state change",
        details: "Status report state changed since you read it. Refresh and retry.",
      },
      { status: 409 },
    );
  }
  return NextResponse.json({ report: data as StatusReport });
}
