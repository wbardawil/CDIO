import { NextRequest, NextResponse } from "next/server";
import { assertPractitionerOwnsOrg } from "@/lib/auth/assert-owns-org";
import { createServiceClient } from "@/lib/db/supabase";
import { runAudit } from "@/lib/agents/audit";
import { isRunnable, type Audit, type AuditIntake } from "@/types/audit";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const db = createServiceClient();
  const { data: existing } = await db
    .from("audits")
    .select("id, org_id, title, intake, status")
    .eq("id", id)
    .single();
  if (!existing) {
    return NextResponse.json({ error: "Audit not found" }, { status: 404 });
  }

  const ownership = await assertPractitionerOwnsOrg(existing.org_id);
  if (!ownership.ok) return ownership.response;

  const intake = existing.intake as AuditIntake;
  if (!isRunnable(intake)) {
    return NextResponse.json(
      {
        error:
          "Audit needs at minimum the system being bought and the vendor before it can run.",
      },
      { status: 400 }
    );
  }

  // Mark running so a slow agent call doesn't look like a hang.
  await db.from("audits").update({ status: "running" }).eq("id", id);

  try {
    const { output, method_capture } = await runAudit({
      id: existing.id,
      org_id: existing.org_id,
      title: existing.title,
      intake,
    });

    const { data, error } = await db
      .from("audits")
      .update({
        status: "complete",
        output,
        method_capture,
        ran_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("*")
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Failed to persist audit result", details: error?.message },
        { status: 500 }
      );
    }
    return NextResponse.json({ audit: data as Audit });
  } catch (err) {
    // Roll back to ready so the practitioner can retry.
    await db.from("audits").update({ status: "ready" }).eq("id", id);
    return NextResponse.json(
      {
        error: "Audit run failed",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
