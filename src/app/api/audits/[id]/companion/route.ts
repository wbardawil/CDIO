import { NextRequest, NextResponse } from "next/server";
import { assertPractitionerOwnsOrg } from "@/lib/auth/assert-owns-org";
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
    .select("id, org_id, title, intake")
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

    const { data, error } = await db
      .from("audits")
      .update({ companion })
      .eq("id", id)
      .select("*")
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Failed to persist companion", details: error?.message },
        { status: 500 }
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
