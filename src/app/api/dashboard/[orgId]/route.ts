import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/db/supabase";
import { assertPractitionerOwnsOrg } from "@/lib/auth/assert-owns-org";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const { orgId } = await params;
  const ownership = await assertPractitionerOwnsOrg(orgId);
  if (ownership.response) return ownership.response;

  // Track the current step so any thrown error reports WHERE it failed.
  // The user-facing dashboard otherwise collapses any 4xx/5xx to a
  // generic "Failed to load dashboard data" card; without context we
  // can't tell whether the org is missing, the join broke, or a join
  // table is malformed.
  let step = "init";
  try {
    const db = createServiceClient();

    step = "fetch_organization";
    const { data: org, error: orgError } = await db
      .from("organizations")
      .select("*")
      .eq("id", orgId)
      .single();

    if (orgError || !org) {
      return NextResponse.json(
        { error: "Organization not found", step, details: orgError?.message ?? null },
        { status: 404 },
      );
    }

    step = "fetch_latest_assessment";
    // Use maybeSingle so a missing assessment doesn't return a Supabase
    // error object (PGRST116) — the "no assessment yet" path is normal.
    const { data: assessment } = await db
      .from("assessments")
      .select("*")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!assessment) {
      return NextResponse.json({
        org,
        assessment: null,
        syntheses: [],
        divergences: [],
        stakeholders: [],
        roadmap: null,
      });
    }

    step = "fetch_stakeholders";
    // NOTE: assessment_token is intentionally NOT selected — it's a permanent
    // unrevocable backdoor (P0-3). Practitioners use explicit "Email link" /
    // "Copy link" actions instead.
    const { data: stakeholders, error: stakeholdersErr } = await db
      .from("stakeholders")
      .select("id, name, role, email, relevant_modules")
      .eq("org_id", orgId);
    if (stakeholdersErr) throw new Error(`stakeholders: ${stakeholdersErr.message}`);

    step = "fetch_module_scores";
    const { data: scores, error: scoresErr } = await db
      .from("module_scores")
      .select("*")
      .eq("assessment_id", assessment.id);
    if (scoresErr) throw new Error(`module_scores: ${scoresErr.message}`);

    step = "fetch_synthesis";
    const { data: syntheses, error: synthesesErr } = await db
      .from("assessment_synthesis")
      .select("*")
      .eq("assessment_id", assessment.id)
      .order("priority_rank");
    if (synthesesErr) throw new Error(`assessment_synthesis: ${synthesesErr.message}`);

    step = "fetch_divergences";
    const { data: divergences, error: divergencesErr } = await db
      .from("divergence_points")
      .select("*")
      .eq("assessment_id", assessment.id);
    if (divergencesErr) throw new Error(`divergence_points: ${divergencesErr.message}`);

    step = "fetch_roadmap";
    // maybeSingle so 0-roadmap rows isn't reported as an error.
    const { data: roadmap, error: roadmapErr } = await db
      .from("roadmaps")
      .select("*")
      .eq("assessment_id", assessment.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (roadmapErr) throw new Error(`roadmaps: ${roadmapErr.message}`);

    // Calculate completion stats
    const totalExpectedScores = (stakeholders ?? []).reduce(
      (sum, s) => sum + (s.relevant_modules?.length ?? 0),
      0
    );
    const completedScores = scores?.length ?? 0;

    return NextResponse.json({
      org,
      assessment,
      stakeholders: (stakeholders ?? []).map((s) => {
        const stakeholderScores = (scores ?? []).filter(
          (sc) => sc.stakeholder_id === s.id
        );
        return {
          ...s,
          completed_modules: stakeholderScores.map((sc) => sc.module_number),
          total_modules: s.relevant_modules?.length ?? 0,
        };
      }),
      scores: scores ?? [],
      syntheses: syntheses ?? [],
      divergences: divergences ?? [],
      roadmap,
      completion: {
        total: totalExpectedScores,
        completed: completedScores,
        percentage: totalExpectedScores > 0
          ? Math.round((completedScores / totalExpectedScores) * 100)
          : 0,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Dashboard data error at step '${step}':`, message, error);
    return NextResponse.json(
      { error: "Failed to load dashboard data", step, details: message },
      { status: 500 },
    );
  }
}
