import { NextRequest, NextResponse } from "next/server";
import { EngagementOrchestrator } from "@/lib/agents/orchestrator";
import { z } from "zod";

const SynthesizeSchema = z.object({
  org_id: z.string().uuid(),
  assessment_id: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = SynthesizeSchema.parse(body);

    const orchestrator = new EngagementOrchestrator(input.org_id);
    const result = await orchestrator.synthesizeAssessment(input.assessment_id);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Synthesis error:", error);
    return NextResponse.json(
      { error: "Failed to synthesize assessment" },
      { status: 500 }
    );
  }
}
