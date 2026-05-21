import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { assertPractitionerOwnsOrg } from "@/lib/auth/assert-owns-org";
import { assertCanWrite } from "@/lib/auth/role-gates";
import { initialApprovalStateForRole } from "@/lib/auth/initial-approval-state";
import { createServiceClient } from "@/lib/db/supabase";
import type { Audit, AuditIntake } from "@/types/audit";

const EMPTY_INTAKE: AuditIntake = {
  decision: "",
  business_pain: "",
  project_summary: "",
  principal_role: "",
  accountability: "",
  total_cost: "",
  options: [],
  strategy_context: "",
  operating_context: "",
  extra_context: "",
  stage: null,
  selection_id: null,
  extraction: null,
  evidence: [],
};

const optionSchema = z.object({
  id: z.string().min(1).max(64),
  label: z.string().max(300),
  material: z.string().max(60000),
});

const createSchema = z.object({
  org_id: z.string().uuid(),
  title: z.string().min(1).max(300),
  intake: z
    .object({
      decision: z.string().max(2000).optional(),
      business_pain: z.string().max(8000).optional(),
      project_summary: z.string().max(8000).optional(),
      principal_role: z.string().max(300).optional(),
      accountability: z.string().max(2000).optional(),
      total_cost: z.string().max(300).optional(),
      options: z.array(optionSchema).max(8).optional(),
      strategy_context: z.string().max(60000).optional(),
      operating_context: z.string().max(60000).optional(),
      extra_context: z.string().max(60000).optional(),
      stage: z
        .enum([
          "exploring",
          "shortlisted",
          "contract_on_table",
          "signed",
          "in_implementation",
        ])
        .nullable()
        .optional(),
      selection_id: z.string().uuid().nullable().optional(),
      extraction: z
        .object({
          at: z.string(),
          files: z
            .array(
              z.object({
                name: z.string(),
                chars: z.number(),
                ok: z.boolean(),
                note: z.string().optional(),
                storage_path: z.string().optional(),
              })
            )
            .max(20),
          field_sources: z.record(
            z.string(),
            z.object({
              file: z.string(),
              quote: z.string().max(400),
              confidence: z.enum(["high", "low", "not_found"]),
            })
          ),
        })
        .nullable()
        .optional(),
      evidence: z
        .array(
          z.object({
            name: z.string().max(300),
            storage_path: z.string().max(500),
            from: z.string().max(300),
          })
        )
        .max(30)
        .optional(),
    })
    .optional(),
});

export async function GET(request: NextRequest) {
  const orgId = request.nextUrl.searchParams.get("org_id");
  if (!orgId) {
    return NextResponse.json({ error: "org_id required" }, { status: 400 });
  }
  const ownership = await assertPractitionerOwnsOrg(orgId);
  if (!ownership.ok) return ownership.response;

  const db = createServiceClient();
  const { data, error } = await db
    .from("audits")
    .select("*")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: "Failed to list audits", details: error.message },
      { status: 500 }
    );
  }
  return NextResponse.json({ audits: (data ?? []) as Audit[] });
}

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

  // codex-audit-2026-05-21 finding #9 — viewers cannot create audits.
  const ownership = await assertCanWrite(input.org_id);
  if (!ownership.ok) return ownership.response;

  const intake: AuditIntake = {
    ...EMPTY_INTAKE,
    ...(input.intake ?? {}),
    selection_id: input.intake?.selection_id ?? null,
  };

  const db = createServiceClient();
  const approval = initialApprovalStateForRole(ownership.role, ownership.practitionerId);
  const { data, error } = await db
    .from("audits")
    .insert({
      org_id: input.org_id,
      practitioner_id: ownership.practitionerId,
      title: input.title,
      status: "intake",
      intake,
      ...approval,
    })
    .select("*")
    .single();

  if (error || !data) {
    console.error(
      "[audits POST] insert failed:",
      error?.code,
      error?.message,
      error?.details,
      error?.hint
    );
    return NextResponse.json(
      { error: "Failed to create audit", details: error?.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ audit: data as Audit }, { status: 201 });
}
