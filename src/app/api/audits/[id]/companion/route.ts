import { NextRequest, NextResponse } from "next/server";
import { assertCanWrite } from "@/lib/auth/role-gates";
import { createServiceClient } from "@/lib/db/supabase";
import { generateCompanion } from "@/lib/agents/audit";
import { isRunnable, type Audit, type AuditIntake } from "@/types/audit";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const db = createServiceClient();
  const { data: existing } = await db
    .from("audits")
    .select("id, org_id, title, intake, approval_status")
    .eq("id", id)
    .maybeSingle();
  if (!existing) {
    return NextResponse.json({ error: "Audit not found" }, { status: 404 });
  }

  // codex-audit-2026-05-21 + S2-impl codex review: must be assertCanWrite,
  // not assertPractitionerOwnsOrg — viewers cannot trigger AI mutations.
  const ownership = await assertCanWrite(existing.org_id);
  if (!ownership.ok) return ownership.response;

  // S2 mutation guard (codex X8): companion generation mutates the audit row.
  if (existing.approval_status !== "draft" && existing.approval_status !== "returned") {
    return NextResponse.json(
      {
        error: "Cannot generate companion in this state",
        details: `Audit is '${existing.approval_status}'; companion allowed only on draft or returned.`,
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
          "Companion needs at minimum the system being bought and the vendor.",
      },
      { status: 400 }
    );
  }

  try {
    const companion = await generateCompanion({
      id: existing.id,
      org_id: existing.org_id,
      title: existing.title,
      intake,
    });

    // CAS-guarded UPDATE (S2-impl codex review #1).
    const { data, error } = await db
      .from("audits")
      .update({ companion })
      .eq("id", id)
      .in("approval_status", ["draft", "returned"])
      .select("*")
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: "Failed to persist companion", details: error.message },
        { status: 500 }
      );
    }
    if (!data) {
      return NextResponse.json(
        {
          error: "Concurrent state change",
          details: "Audit state changed during companion generation. Output discarded.",
        },
        { status: 409 },
      );
    }
    return NextResponse.json({ audit: data as Audit });
  } catch (err) {
    return NextResponse.json(
      {
        error: "Companion generation failed",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
