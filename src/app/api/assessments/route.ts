import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/db/supabase";
import { scoreModuleFromResponses } from "@/lib/scoring/rule-based";
import { scoreModule } from "@/lib/agents/assessment";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { z } from "zod";
import type { OrgSize, Industry } from "@/types";

const SubmitSchema = z.object({
  org_id: z.string().uuid(),
  assessment_id: z.string().uuid(),
  stakeholder_id: z.string().uuid(),
  module_number: z.number().int().min(1).max(16),
  business_impact_rating: z.number().int().min(1).max(10).optional(),
  responses: z.array(
    z.object({
      question_text: z.string(),
      answer: z.enum(["yes", "no", "partial"]),
      evidence: z.string().optional(),
    })
  ),
});

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const { ok } = rateLimit(`assess:${ip}`, 20);
  if (!ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const body = await request.json();
    const input = SubmitSchema.parse(body);
    const db = createServiceClient();

    // Score using AI agent if key available, otherwise rule-based fallback
    let result;
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const { data: org } = await db
          .from("organizations")
          .select("size_category, industry, employee_count")
          .eq("id", input.org_id)
          .single();

        result = await scoreModule(
          input.module_number,
          input.responses.map((r, i) => ({
            question_id: `m${input.module_number}_q${i + 1}`,
            ...r,
          })),
          {
            size: (org?.size_category ?? "medium") as OrgSize,
            industry: (org?.industry ?? "other") as Industry,
            employee_count: org?.employee_count ?? 100,
          }
        );
      } catch (aiError) {
        console.warn("AI scoring failed, falling back to rule-based:", aiError);
        result = scoreModuleFromResponses(input.responses);
      }
    } else {
      result = scoreModuleFromResponses(input.responses);
    }

    // Save score to database
    const { data: score, error: saveError } = await db
      .from("module_scores")
      .upsert(
        {
          assessment_id: input.assessment_id,
          stakeholder_id: input.stakeholder_id,
          module_number: input.module_number,
          maturity_score: result.maturity_score,
          evidence: result.evidence,
          diagnostic_responses: input.responses,
          business_impact_rating: input.business_impact_rating ?? 5,
        },
        { onConflict: "assessment_id,stakeholder_id,module_number" }
      )
      .select()
      .single();

    if (saveError) throw saveError;

    // Update assessment status to in_progress if it was draft
    await db
      .from("assessments")
      .update({ status: "in_progress" })
      .eq("id", input.assessment_id)
      .eq("status", "draft");

    return NextResponse.json(
      { score, assessment_result: result },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed" },
        { status: 400 }
      );
    }
    console.error("Assessment submission error:", error instanceof Error ? error.message : "Unknown");
    return NextResponse.json(
      { error: "Failed to process assessment" },
      { status: 500 }
    );
  }
}
