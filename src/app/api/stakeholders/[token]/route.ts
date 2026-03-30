import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/db/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const db = createServiceClient();

    // Look up stakeholder by assessment token
    const { data: stakeholder, error: stakeError } = await db
      .from("stakeholders")
      .select("id, name, email, role, org_id, relevant_modules, assessment_token")
      .eq("assessment_token", token)
      .single();

    if (stakeError || !stakeholder) {
      return NextResponse.json(
        { error: "Invalid or expired assessment link" },
        { status: 404 }
      );
    }

    // Get organization name
    const { data: org } = await db
      .from("organizations")
      .select("name")
      .eq("id", stakeholder.org_id)
      .single();

    // Get the active assessment for this org
    const { data: assessment } = await db
      .from("assessments")
      .select("id")
      .eq("org_id", stakeholder.org_id)
      .in("status", ["draft", "in_progress"])
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!assessment) {
      return NextResponse.json(
        { error: "No active assessment found" },
        { status: 404 }
      );
    }

    // Get already completed modules for this stakeholder
    const { data: completedScores } = await db
      .from("module_scores")
      .select("module_number")
      .eq("assessment_id", assessment.id)
      .eq("stakeholder_id", stakeholder.id);

    const completed_modules = (completedScores ?? []).map(
      (s) => s.module_number
    );

    return NextResponse.json({
      id: stakeholder.id,
      name: stakeholder.name,
      role: stakeholder.role,
      org_name: org?.name ?? "Unknown Organization",
      org_id: stakeholder.org_id,
      assessment_id: assessment.id,
      relevant_modules: stakeholder.relevant_modules,
      completed_modules,
    });
  } catch (error) {
    console.error("Stakeholder lookup error:", error);
    return NextResponse.json(
      { error: "Failed to load assessment" },
      { status: 500 }
    );
  }
}
