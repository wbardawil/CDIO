import { NextRequest, NextResponse } from "next/server";
import { EngagementOrchestrator } from "@/lib/agents/orchestrator";
import { requireAuth, AuthError } from "@/lib/auth/verify-org";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
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
  const ip = getClientIp(request);
  const { ok } = rateLimit(`org:${ip}`, 5);
  if (!ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const userId = await requireAuth();
    const body = await request.json();
    const input = OnboardSchema.parse(body);

    const orgId = crypto.randomUUID();
    const orchestrator = new EngagementOrchestrator(orgId);
    const result = await orchestrator.onboard(input, userId);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed" },
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
