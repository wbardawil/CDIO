import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/db/supabase";
import { assertPractitionerOwnsOrg } from "@/lib/auth/assert-owns-org";

/**
 * POST /api/decisions/[id]/resolve
 *
 * Captures what the leadership team actually decided about a divergence
 * point. The divergence_points row gets:
 *   - resolution: text  — free-form note the practitioner enters
 *   - resolved_at: now() — server-set so we can sort and report
 *
 * Ownership: practitioner must own the org that owns the assessment
 * that owns the divergence point. We chain the lookup server-side.
 *
 * Re-resolving a previously resolved row is allowed (overwrites the
 * note + bumps the timestamp). This matches the practitioner's mental
 * model: "we revisited this and decided differently".
 */

const Schema = z.object({
  resolution: z.string().min(1, "resolution required").max(2000),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let input: z.infer<typeof Schema>;
  try {
    input = Schema.parse(await request.json().catch(() => ({})));
  } catch (e) {
    return NextResponse.json({ error: "Bad request", details: String(e) }, { status: 400 });
  }

  const db = createServiceClient();

  // Fetch the divergence + chain to org for ownership check.
  const { data: divergence, error: divErr } = await db
    .from("divergence_points")
    .select("id, assessment_id, assessments(org_id)")
    .eq("id", id)
    .single();

  if (divErr || !divergence) {
    return NextResponse.json({ error: "Decision package not found" }, { status: 404 });
  }

  const orgId = (divergence.assessments as unknown as { org_id: string } | null)?.org_id;
  if (!orgId) {
    return NextResponse.json({ error: "Decision package missing org context" }, { status: 500 });
  }

  const ownership = await assertPractitionerOwnsOrg(orgId);
  if (ownership.response) return ownership.response;

  const { error: updateErr } = await db
    .from("divergence_points")
    .update({
      resolution: input.resolution,
      resolved_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (updateErr) {
    return NextResponse.json(
      { error: "Failed to record resolution", details: updateErr.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
