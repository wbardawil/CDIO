import { NextRequest, NextResponse } from "next/server";
import { EngagementOrchestrator } from "@/lib/agents/orchestrator";
import { verifyOrgAccess } from "@/lib/auth/verify-org";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { z } from "zod";

const RoadmapSchema = z.object({
  org_id: z.string().uuid(),
  assessment_id: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const { ok } = rateLimit(`roadmap:${ip}`, 5);
  if (!ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const body = await request.json();
    const input = RoadmapSchema.parse(body);

    const { authorized } = await verifyOrgAccess(input.org_id);
    if (!authorized) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const orchestrator = new EngagementOrchestrator(input.org_id);
    const result = await orchestrator.generateRoadmap(input.assessment_id);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed" },
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
