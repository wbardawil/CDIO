import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/db/supabase";
import { verifyOrgAccess } from "@/lib/auth/verify-org";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;

    const { authorized } = await verifyOrgAccess(orgId);
    if (!authorized) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const db = createServiceClient();

    // Get organization
    const { data: org, error: orgError } = await db
      .from("organizations")
      .select("*")
      .eq("id", orgId)
      .single();

    if (orgError || !org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    // Get latest assessment
    const { data: assessment } = await db
      .from("assessments")
      .select("*")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

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

    // Get stakeholders
    const { data: stakeholders } = await db
      .from("stakeholders")
      .select("id, name, role, email, relevant_modules, assessment_token")
      .eq("org_id", orgId);

    // Get module scores
    const { data: scores } = await db
      .from("module_scores")
      .select("*")
      .eq("assessment_id", assessment.id);

    // Get synthesis (if it exists)
    const { data: syntheses } = await db
      .from("assessment_synthesis")
      .select("*")
      .eq("assessment_id", assessment.id)
      .order("priority_rank");

    // Get divergences
    const { data: divergences } = await db
      .from("divergence_points")
      .select("*")
      .eq("assessment_id", assessment.id);

    // Get roadmap (if it exists)
    const { data: roadmap } = await db
      .from("roadmaps")
      .select("*")
      .eq("assessment_id", assessment.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

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
    console.error("Dashboard data error:", error);
    return NextResponse.json(
      { error: "Failed to load dashboard data" },
      { status: 500 }
    );
  }
}
