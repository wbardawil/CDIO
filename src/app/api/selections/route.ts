import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { assertCanWrite } from "@/lib/auth/role-gates";
import { initialApprovalStateForRole } from "@/lib/auth/initial-approval-state";
import { createServiceClient } from "@/lib/db/supabase";
import {
  defaultCriteriaFor,
  type Selection,
  type SelectionCriterion,
  type SelectionDomain,
} from "@/types/selection";

const createSchema = z.object({
  org_id: z.string().uuid(),
  domain: z.enum(["tech", "ai", "partner"]).default("tech"),
  initiative_id: z.string().uuid().nullable().optional(),
  module_number: z.number().int().min(1).max(16).nullable().optional(),
  title: z.string().min(1).max(300),
  question: z.string().min(1).max(2000),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const input = parsed.data;

  // codex-audit-2026-05-21 finding #9 — viewers cannot create selections.
  const ownership = await assertCanWrite(input.org_id);
  if (!ownership.ok) return ownership.response;

  const db = createServiceClient();

  // Seed default criteria from the domain.
  const domain = input.domain as SelectionDomain;
  const criteria: SelectionCriterion[] = defaultCriteriaFor(domain).map((c) => ({
    id: crypto.randomUUID(),
    ...c,
  }));

  const approval = initialApprovalStateForRole(ownership.role, ownership.practitionerId);
  const { data, error } = await db
    .from("selections")
    .insert({
      org_id: input.org_id,
      practitioner_id: ownership.practitionerId,
      domain,
      initiative_id: input.initiative_id ?? null,
      module_number: input.module_number ?? null,
      title: input.title,
      question: input.question,
      criteria,
      candidates: [],
      ...approval,
    })
    .select("*")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Failed to create selection", details: error?.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ selection: data as Selection }, { status: 201 });
}
