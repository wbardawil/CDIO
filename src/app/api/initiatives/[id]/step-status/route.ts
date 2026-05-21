import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { assertCanWrite } from "@/lib/auth/role-gates";
import { createServiceClient } from "@/lib/db/supabase";
import type { Initiative, InitiativeStep } from "@/types/initiative";

const updateSchema = z.object({
  step_id: z.string().uuid(),
  status: z.enum(["todo", "in_progress", "done", "blocked"]),
  notes: z.string().max(2000).nullable().optional(),
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
  const input = parsed.data;

  const db = createServiceClient();

  const { data: existing } = await db
    .from("initiatives")
    .select("id, org_id, steps, status, approval_status")
    .eq("id", id)
    .maybeSingle();

  if (!existing) {
    return NextResponse.json({ error: "Initiative not found" }, { status: 404 });
  }

  // codex-audit-2026-05-21 finding #9 — viewers cannot mutate initiative
  // step status. Other roles can update steps on initiatives they have
  // org-membership for.
  const ownership = await assertCanWrite(existing.org_id);
  if (!ownership.ok) return ownership.response;

  // S2 mutation guard (codex X8): step-status mutates the artifact,
  // so the immutability rule applies same as for general PATCH.
  if (existing.approval_status !== "draft" && existing.approval_status !== "returned") {
    return NextResponse.json(
      {
        error: "Cannot mutate artifact in this state",
        details: `Initiative is '${existing.approval_status}'; step-status changes allowed only on draft or returned.`,
        approval_status: existing.approval_status,
      },
      { status: 409 },
    );
  }

  const steps = (existing.steps as InitiativeStep[]) ?? [];
  const stepIndex = steps.findIndex((s) => s.id === input.step_id);
  if (stepIndex === -1) {
    return NextResponse.json({ error: "Step not found" }, { status: 404 });
  }

  const next: InitiativeStep[] = steps.map((s, i) =>
    i === stepIndex
      ? {
          ...s,
          status: input.status,
          notes: input.notes ?? s.notes ?? null,
          completed_at:
            input.status === "done"
              ? s.completed_at ?? new Date().toISOString()
              : input.status === "todo" || input.status === "in_progress"
                ? null
                : s.completed_at,
        }
      : s
  );

  // If every step is done, mark initiative done. If marking a step
  // back to todo / in_progress flips initiative back to active. We
  // do not auto-block the initiative on a single blocked step;
  // that's a practitioner judgment.
  const allDone = next.length > 0 && next.every((s) => s.status === "done");

  const update: Record<string, unknown> = { steps: next };
  if (allDone && existing.status !== "done") {
    update.status = "done";
    update.completed_at = new Date().toISOString();
  } else if (!allDone && existing.status === "done") {
    update.status = "active";
    update.completed_at = null;
  }

  const { data: updated, error } = await db
    .from("initiatives")
    .update(update)
    .eq("id", id)
    .in("approval_status", ["draft", "returned"])
    .select("*")
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: "Failed to update step", details: error.message },
      { status: 500 }
    );
  }
  if (!updated) {
    return NextResponse.json(
      {
        error: "Concurrent state change",
        details: "Initiative state changed since you read it. Refresh and retry.",
      },
      { status: 409 },
    );
  }

  return NextResponse.json({ initiative: updated as Initiative });
}
