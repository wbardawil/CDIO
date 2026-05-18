import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { assertPractitionerOwnsOrg } from "@/lib/auth/assert-owns-org";
import { createServiceClient } from "@/lib/db/supabase";
import type {
  Initiative,
  InitiativeStep,
  InitiativeStepStatus,
} from "@/types/initiative";

const stepInputSchema = z.object({
  title: z.string().min(1).max(300),
  description: z.string().max(2000).nullable().optional(),
  assignee_name: z.string().max(200).nullable().optional(),
  assignee_email: z.string().email().nullable().optional().or(z.literal("")),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  status: z
    .enum(["todo", "in_progress", "done", "blocked"])
    .default("todo"),
});

const createInitiativeSchema = z.object({
  org_id: z.string().uuid(),
  title: z.string().min(1).max(300),
  goal: z.string().min(1).max(2000),
  domain: z
    .enum(["tech", "ai", "security", "process", "data", "other"])
    .default("tech"),
  module_number: z.number().int().min(1).max(16).nullable().optional(),
  owner_name: z.string().max(200).nullable().optional(),
  owner_email: z.string().email().nullable().optional().or(z.literal("")),
  target_completion_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .optional(),
  steps: z.array(stepInputSchema).max(20).default([]),
  practitioner_notes: z.string().max(4000).nullable().optional(),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createInitiativeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const input = parsed.data;

  const ownership = await assertPractitionerOwnsOrg(input.org_id);
  if (!ownership.ok) return ownership.response;

  const db = createServiceClient();

  const steps: InitiativeStep[] = input.steps.map((s, i) => ({
    id: crypto.randomUUID(),
    position: i,
    title: s.title,
    description: s.description ?? null,
    status: (s.status ?? "todo") as InitiativeStepStatus,
    assignee_name: s.assignee_name ?? null,
    assignee_email: s.assignee_email ? s.assignee_email : null,
    due_date: s.due_date ?? null,
    completed_at: null,
    notes: null,
  }));

  const { data, error } = await db
    .from("initiatives")
    .insert({
      org_id: input.org_id,
      practitioner_id: ownership.practitionerId,
      title: input.title,
      goal: input.goal,
      domain: input.domain,
      module_number: input.module_number ?? null,
      owner_name: input.owner_name ?? null,
      owner_email: input.owner_email ? input.owner_email : null,
      target_completion_date: input.target_completion_date ?? null,
      steps,
      practitioner_notes: input.practitioner_notes ?? null,
    })
    .select("*")
    .single();

  if (error || !data) {
    console.error(
      "[initiatives POST] insert failed:",
      error?.code,
      error?.message,
      error?.details,
      error?.hint
    );
    return NextResponse.json(
      { error: "Failed to create initiative", details: error?.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ initiative: data as Initiative }, { status: 201 });
}
