import { NextRequest, NextResponse } from "next/server";
import { EngagementOrchestrator } from "@/lib/agents/orchestrator";
import { assertCanWrite } from "@/lib/auth/role-gates";
import { createServiceClient } from "@/lib/db/supabase";
import { z } from "zod";

const RoadmapSchema = z.object({
  org_id: z.string().uuid(),
  assessment_id: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = RoadmapSchema.parse(body);

    // codex-audit-2026-05-21 finding #9 — roadmap generation is a
    // mutation; viewers cannot trigger it.
    const ownership = await assertCanWrite(input.org_id);
    if (ownership.response) return ownership.response;

    // cso codex-audit-2026-05-21 finding #10 — verify assessment_id belongs
    // to org_id BEFORE generating a roadmap against it. Without this, a
    // practitioner authorized on Org A could generate / overwrite a roadmap
    // tied to Org B's assessment by passing the cross-org assessment_id.
    const db = createServiceClient();
    const { data: assessmentRow } = await db
      .from("assessments")
      .select("id, org_id")
      .eq("id", input.assessment_id)
      .maybeSingle();
    if (!assessmentRow || assessmentRow.org_id !== input.org_id) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
    }

    const orchestrator = new EngagementOrchestrator(input.org_id);
    const result = await orchestrator.generateRoadmap(input.assessment_id);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Roadmap generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate roadmap" },
      { status: 500 }
    );
  }
}
