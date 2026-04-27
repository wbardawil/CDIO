import { NextRequest, NextResponse } from "next/server";
import { EngagementOrchestrator } from "@/lib/agents/orchestrator";
import { requireAuth } from "@/lib/auth/require-auth";
import { z } from "zod";

const OnboardSchema = z.object({
  name: z.string().min(1),
  employee_count: z.number().int().positive(),
  industry: z.enum([
    "healthcare", "financial_services", "manufacturing",
    "professional_services", "retail_ecommerce", "technology",
    "education", "other",
  ]),
  stakeholders: z.array(
    z.object({
      name: z.string().min(1),
      email: z.string().email(),
      role: z.string().min(1),
    })
  ).min(1),
});

export async function POST(request: NextRequest) {
  const { response: authResponse } = await requireAuth();
  if (authResponse) return authResponse;

  try {
    const body = await request.json();
    const input = OnboardSchema.parse(body);

    const orgId = crypto.randomUUID();
    const orchestrator = new EngagementOrchestrator(orgId);
    const result = await orchestrator.onboard(input);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { error: "Failed to onboard organization" },
      { status: 500 }
    );
  }
}
