import { NextRequest, NextResponse } from "next/server";
import { assertCanWrite } from "@/lib/auth/role-gates";
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
    .select("id, org_id, title, intake, status, approval_status")
    .eq("id", id)
    .maybeSingle();
  if (!existing) {
    return NextResponse.json({ error: "Audit not found" }, { status: 404 });
  }

  // codex-audit-2026-05-21 + S2-impl codex review: must be assertCanWrite,
  // not assertPractitionerOwnsOrg — viewers cannot trigger AI mutations.
  const ownership = await assertCanWrite(existing.org_id);
  if (!ownership.ok) return ownership.response;

  // S2 mutation guard (codex X8): an audit cannot be (re-)run once it
  // enters the approval workflow. Re-running on draft/returned is fine.
  if (existing.approval_status !== "draft" && existing.approval_status !== "returned") {
    return NextResponse.json(
      {
        error: "Cannot run audit in this state",
        details: `Audit is '${existing.approval_status}'; run allowed only on draft or returned.`,
        approval_status: existing.approval_status,
      },
      { status: 409 },
    );
  }

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

  // Mark running so a slow agent call doesn't look like a hang. CAS-guarded
  // (S2-impl codex review #1): if approval_status flipped between the
  // pre-check and now, this UPDATE no-ops and we surface 409.
  const { data: marked } = await db
    .from("audits")
    .update({ status: "running" })
    .eq("id", id)
    .in("approval_status", ["draft", "returned"])
    .select("id")
    .maybeSingle();
  if (!marked) {
    return NextResponse.json(
      {
        error: "Concurrent state change",
        details: "Audit state changed between check and run start. Refresh and retry.",
      },
      { status: 409 },
    );
  }

  try {
    const { output, method_capture } = await runAudit({
      id: existing.id,
      org_id: existing.org_id,
      title: existing.title,
      intake,
    });

    // CAS-guarded post-run UPDATE. If state flipped during the AI run
    // (e.g. someone submitted the audit), the output is discarded — the
    // immutability invariant takes priority over preserving compute.
    const { data, error } = await db
      .from("audits")
      .update({
        status: "complete",
        output,
        method_capture,
        ran_at: new Date().toISOString(),
      })
      .eq("id", id)
      .in("approval_status", ["draft", "returned"])
      .select("*")
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: "Failed to persist audit result", details: error.message },
        { status: 500 }
      );
    }
    if (!data) {
      return NextResponse.json(
        {
          error: "Concurrent state change",
          details: "Audit approval state changed during run. Output discarded; rerun on a draft/returned audit.",
        },
        { status: 409 },
      );
    }
    return NextResponse.json({ audit: data as Audit });
  } catch (err) {
    // Roll back to ready so the practitioner can retry — also CAS-guarded
    // so we don't reset status on a now-pending audit.
    await db
      .from("audits")
      .update({ status: "ready" })
      .eq("id", id)
      .in("approval_status", ["draft", "returned"]);
    return NextResponse.json(
      {
        error: "Audit run failed",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
