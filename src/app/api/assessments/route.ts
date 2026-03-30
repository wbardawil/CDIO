import { NextRequest, NextResponse } from "next/server";
import { EngagementOrchestrator } from "@/lib/agents/orchestrator";
import { z } from "zod";

// Submit assessment responses for a single module
const SubmitSchema = z.object({
  org_id: z.string().uuid(),
  assessment_id: z.string().uuid(),
  stakeholder_id: z.string().uuid(),
  module_number: z.number().int().min(1).max(16),
  responses: z.array(
    z.object({
      question_text: z.string(),
      answer: z.enum(["yes", "no", "partial"]),
      evidence: z.string().optional(),
    })
  ),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = SubmitSchema.parse(body);

    const orchestrator = new EngagementOrchestrator(input.org_id);
    const result = await orchestrator.processAssessmentResponse(
      input.assessment_id,
      input.stakeholder_id,
      input.module_number,
      input.responses
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Assessment submission error:", error);
    return NextResponse.json(
      { error: "Failed to process assessment" },
      { status: 500 }
    );
  }
}
