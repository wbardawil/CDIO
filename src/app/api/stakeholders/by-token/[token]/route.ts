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

    // Get organization name + the engagement's active module scope
    const { data: org } = await db
      .from("organizations")
      .select("name, active_modules")
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

    // Effective modules = role-relevant ∩ engagement-in-scope.
    // - If the engagement defines active_modules, restrict to that scope.
    // - Otherwise (rare; legacy data), fall back to role-relevant.
    // - Stakeholders whose role intersects nothing in scope get an empty list,
    //   which surfaces as "0 modules to answer" — clearer than asking out-of-scope questions.
    const roleRelevant: number[] = stakeholder.relevant_modules ?? [];
    const orgActive: number[] = org?.active_modules ?? [];
    const effectiveModules =
      orgActive.length > 0
        ? roleRelevant.filter((m) => orgActive.includes(m))
        : roleRelevant;

    return NextResponse.json({
      id: stakeholder.id,
      name: stakeholder.name,
      role: stakeholder.role,
      org_name: org?.name ?? "Unknown Organization",
      org_id: stakeholder.org_id,
      assessment_id: assessment.id,
      // Effective scope for the assessment UI
      relevant_modules: effectiveModules,
      // Surface the originals so the UI can explain "5 of your 6 role modules
      // are not in this engagement's scope" if needed
      role_relevant_modules: roleRelevant,
      org_active_modules: orgActive,
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
