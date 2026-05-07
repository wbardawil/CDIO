import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { assertPractitionerOwnsOrg } from "@/lib/auth/assert-owns-org";
import { createServiceClient } from "@/lib/db/supabase";
import { generateStatusReportPayload } from "@/lib/status-reports/generate";
import type { StatusReport } from "@/types/cadence";

const createSchema = z.object({
  org_id: z.string().uuid(),
  period_start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  period_end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  title: z.string().max(300).optional(),
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

  const ownership = await assertPractitionerOwnsOrg(input.org_id);
  if (!ownership.ok) return ownership.response;

  const start = new Date(input.period_start);
  const end = new Date(input.period_end);
  const { payload, defaultHeadline } = await generateStatusReportPayload({
    orgId: input.org_id,
    periodStart: start,
    periodEnd: end,
  });

  const monthLabel = end.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });
  const title = input.title ?? `${monthLabel} Status Report`;

  const db = createServiceClient();
  const { data, error } = await db
    .from("status_reports")
    .insert({
      org_id: input.org_id,
      practitioner_id: ownership.practitionerId,
      period_start: input.period_start,
      period_end: input.period_end,
      title,
      headline: defaultHeadline,
      payload,
    })
    .select("*")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Failed to create status report", details: error?.message },
      { status: 500 }
    );
  }
  return NextResponse.json({ report: data as StatusReport }, { status: 201 });
}
