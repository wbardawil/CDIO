import { NextRequest, NextResponse } from "next/server";
import { EngagementOrchestrator } from "@/lib/agents/orchestrator";
import { assertPractitionerOwnsOrg } from "@/lib/auth/assert-owns-org";
import { z } from "zod";

const RoadmapSchema = z.object({
  org_id: z.string().uuid(),
  assessment_id: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = RoadmapSchema.parse(body);

    const ownership = await assertPractitionerOwnsOrg(input.org_id);
    if (ownership.response) return ownership.response;

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
