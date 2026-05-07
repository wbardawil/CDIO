import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/db/supabase";
import { scoreModuleFromResponses } from "@/lib/scoring/rule-based";
import { scoreModule } from "@/lib/agents/assessment";
import { z } from "zod";
import type { OrgSize, Industry } from "@/types";

/**
 * Phase 1C update (2026-05-06):
 *   - "na" is now a valid answer alongside yes/no/partial. The synthesis
 *     and scoring layers treat N/A as missing data — it never pulls the
 *     consensus number down.
 *   - Top-level `module_skipped` flag indicates the stakeholder hit the
 *     module-gate "Can you speak to this area?" question with N/A.
 *     We persist a row anyway so the practitioner can see who abstained
 *     vs who hasn't started.
 */
const SubmitSchema = z.object({
  org_id: z.string().uuid(),
  assessment_id: z.string().uuid(),
  stakeholder_id: z.string().uuid(),
  module_number: z.number().int().min(1).max(16),
  business_impact_rating: z.number().int().min(1).max(10).optional(),
  module_skipped: z.boolean().optional().default(false),
  responses: z.array(
    z.object({
      question_id: z.string().optional(),
      question_text: z.string(),
      answer: z.enum(["yes", "no", "partial", "na"]),
      evidence: z.string().optional(),
    })
  ),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = SubmitSchema.parse(body);
    const db = createServiceClient();

    // If the stakeholder hit the module-gate "I can't speak to this", we
    // skip scoring entirely. Rule-based handles this branch deterministically
    // — no need to call the LLM.
    let result;
    if (input.module_skipped || input.responses.every((r) => r.answer === "na")) {
      result = scoreModuleFromResponses(input.responses, true);
    } else if (process.env.ANTHROPIC_API_KEY) {
      try {
        const { data: org } = await db
          .from("organizations")
          .select("size_category, industry, employee_count")
          .eq("id", input.org_id)
          .single();

        result = await scoreModule(
          input.module_number,
          input.responses.map((r, i) => ({
            question_id: r.question_id ?? `m${input.module_number}_q${i + 1}`,
            question_text: r.question_text,
            answer: r.answer,
            evidence: r.evidence,
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

    // Save score to database. maturity_score may be null if module_skipped
    // or every answer was N/A; the column is nullable as of schema v8.
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
          module_skipped: result.module_skipped,
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
