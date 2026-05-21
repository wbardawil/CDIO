import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { assertCanWrite } from "@/lib/auth/role-gates";
import { createServiceClient } from "@/lib/db/supabase";
import type {
  Selection,
  SelectionCandidate,
  SelectionCriterion,
} from "@/types/selection";

const candidateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200),
  summary: z.string().max(2000).nullable().optional(),
  scores: z.record(z.string(), z.number().int().min(1).max(5)),
  notes: z.string().max(2000).nullable().optional(),
  is_recommended: z.boolean().default(false),
});

const criterionSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200),
  weight: z.number().int().min(0).max(5),
  dimension: z.enum(["feasibility", "value", "risk", "fit"]),
});

const updateSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  question: z.string().min(1).max(2000).optional(),
  status: z
    .enum(["open", "recommended", "decided", "cancelled"])
    .optional(),
  criteria: z.array(criterionSchema).max(20).optional(),
  candidates: z.array(candidateSchema).max(10).optional(),
  recommendation: z.string().max(4000).nullable().optional(),
  decided_candidate_id: z.string().uuid().nullable().optional(),
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
    .from("selections")
    .select("id, org_id, approval_status")
    .eq("id", id)
    .maybeSingle();
  if (!existing) {
    return NextResponse.json({ error: "Selection not found" }, { status: 404 });
  }
  // codex-audit-2026-05-21 finding #9 — viewers cannot mutate selections.
  const ownership = await assertCanWrite(existing.org_id);
  if (!ownership.ok) return ownership.response;

  // S2 mutation guard (codex X8): PATCH only when approval_status ∈
  // {draft, returned}. Approved + rejected are write-terminal; pending
  // is owned by the approval workflow (use withdraw → edit → resubmit).
  if (existing.approval_status !== "draft" && existing.approval_status !== "returned") {
    return NextResponse.json(
      {
        error: "Cannot mutate artifact in this state",
        details: `Selection is '${existing.approval_status}'; PATCH allowed only on draft or returned.`,
        approval_status: existing.approval_status,
      },
      { status: 409 },
    );
  }

  const update: Record<string, unknown> = { ...parsed.data };

  // If status flips to "decided", stamp decided_at.
  if (parsed.data.status === "decided") {
    update.decided_at = new Date().toISOString();
  }
  if (parsed.data.status && parsed.data.status !== "decided") {
    update.decided_at = null;
  }

  // Default candidates / criteria objects through unchanged.
  if (parsed.data.candidates) {
    update.candidates = parsed.data.candidates as SelectionCandidate[];
  }
  if (parsed.data.criteria) {
    update.criteria = parsed.data.criteria as SelectionCriterion[];
  }

  // Race-safe CAS: if approval_status flipped between the pre-check
  // and this UPDATE (e.g. the artifact was submitted in another tab),
  // the .in() predicate makes the UPDATE no-op and we surface 409.
  const { data, error } = await db
    .from("selections")
    .update(update)
    .eq("id", id)
    .in("approval_status", ["draft", "returned"])
    .select("*")
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: "Failed to update selection", details: error.message },
      { status: 500 }
    );
  }
  if (!data) {
    return NextResponse.json(
      {
        error: "Concurrent state change",
        details: "Selection state changed since you read it. Refresh and retry.",
      },
      { status: 409 },
    );
  }

  return NextResponse.json({ selection: data as Selection });
}
