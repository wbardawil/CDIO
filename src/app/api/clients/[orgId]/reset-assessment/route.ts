import { NextRequest, NextResponse } from "next/server";
import { assertPractitionerOwnsOrg } from "@/lib/auth/assert-owns-org";
import { createServiceClient } from "@/lib/db/supabase";

/**
 * POST /api/clients/[orgId]/reset-assessment
 *
 * Wipes assessment-derived data (module_scores, synthesis, divergences,
 * roadmaps) for the given org and resets the latest assessment to 'draft'.
 *
 * Org metadata, stakeholders, decisions, and the assessment shell are
 * preserved — re-running the assessment will populate them again.
 *
 * Allowed ONLY for organizations.is_sandbox = true.
 * Real engagements are explicitly rejected with 403.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const { orgId } = await params;
  const ownership = await assertPractitionerOwnsOrg(orgId);
  if (ownership.response) return ownership.response;

  const db = createServiceClient();

  // Verify the org is sandbox-flagged. Service role bypasses RLS so we
  // explicitly fetch and check.
  const { data: org, error: orgError } = await db
    .from("organizations")
    .select("id, is_sandbox, name")
    .eq("id", orgId)
    .single();

  if (orgError || !org) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  }
  if (!org.is_sandbox) {
    return NextResponse.json(
      { error: "Reset is only allowed on sandbox-flagged clients" },
      { status: 403 }
    );
  }

  // Find the latest assessment for this org
  const { data: latestAssessment } = await db
    .from("assessments")
    .select("id")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!latestAssessment) {
    return NextResponse.json({
      ok: true,
      message: "No assessment to reset",
      cleared: { module_scores: 0, syntheses: 0, divergences: 0, roadmaps: 0 },
    });
  }

  const assessmentId = latestAssessment.id;

  // Wipe in dependency order. Errors are surfaced but we proceed best-effort.
  const errors: string[] = [];

  const { error: scoresErr, count: scoresCount } = await db
    .from("module_scores")
    .delete({ count: "exact" })
    .eq("assessment_id", assessmentId);
  if (scoresErr) errors.push(`module_scores: ${scoresErr.message}`);

  const { error: synthErr, count: synthCount } = await db
    .from("assessment_synthesis")
    .delete({ count: "exact" })
    .eq("assessment_id", assessmentId);
  if (synthErr) errors.push(`assessment_synthesis: ${synthErr.message}`);

  const { error: divErr, count: divCount } = await db
    .from("divergence_points")
    .delete({ count: "exact" })
    .eq("assessment_id", assessmentId);
  if (divErr) errors.push(`divergence_points: ${divErr.message}`);

  const { error: roadmapErr, count: roadmapCount } = await db
    .from("roadmaps")
    .delete({ count: "exact" })
    .eq("assessment_id", assessmentId);
  if (roadmapErr) errors.push(`roadmaps: ${roadmapErr.message}`);

  // Reset assessment to draft
  const { error: assessErr } = await db
    .from("assessments")
    .update({ status: "draft", completed_at: null })
    .eq("id", assessmentId);
  if (assessErr) errors.push(`assessments: ${assessErr.message}`);

  if (errors.length > 0) {
    return NextResponse.json(
      {
        error: "Reset partially failed",
        details: errors,
        cleared: {
          module_scores: scoresCount ?? 0,
          syntheses: synthCount ?? 0,
          divergences: divCount ?? 0,
          roadmaps: roadmapCount ?? 0,
        },
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    message: `Sandbox assessment data wiped for ${org.name}`,
    cleared: {
      module_scores: scoresCount ?? 0,
      syntheses: synthCount ?? 0,
      divergences: divCount ?? 0,
      roadmaps: roadmapCount ?? 0,
    },
  });
}
