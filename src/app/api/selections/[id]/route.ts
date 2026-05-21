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
    .select("id, org_id")
    .eq("id", id)
    .single();
  if (!existing) {
    return NextResponse.json({ error: "Selection not found" }, { status: 404 });
  }
  // codex-audit-2026-05-21 finding #9 — viewers cannot mutate selections.
  const ownership = await assertCanWrite(existing.org_id);
  if (!ownership.ok) return ownership.response;

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

  const { data, error } = await db
    .from("selections")
    .update(update)
    .eq("id", id)
    .select("*")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Failed to update selection", details: error?.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ selection: data as Selection });
}
