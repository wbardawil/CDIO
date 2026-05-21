import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/db/supabase";
import {
  calculateConsensusScore,
  calculateDivergenceScore,
  detectDivergencePoints,
  prioritizeModules,
} from "@/lib/scoring/maturity";
import { generateDecisionPackage } from "@/lib/agents/assessment";
import { MODULE_NAMES } from "@/types";
import type { AssessmentSynthesis, PriorityClass, OrgSize, Industry } from "@/types";
import { assertCanWrite } from "@/lib/auth/role-gates";
import { z } from "zod";

const SynthesizeSchema = z.object({
  org_id: z.string().uuid(),
  assessment_id: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = SynthesizeSchema.parse(body);

    // codex-audit-2026-05-21 finding #9 — synthesis is a mutation; viewers
    // cannot trigger it.
    const ownership = await assertCanWrite(input.org_id);
    if (ownership.response) return ownership.response;

    const db = createServiceClient();

    // cso codex-audit-2026-05-21 finding #10 — verify the assessment_id
    // actually belongs to org_id BEFORE doing anything with it. Without this,
    // a practitioner authorized on Org A could synthesize/overwrite data
    // belonging to Org B by passing Org A's id + Org B's assessment_id.
    // 404 (not 403) to avoid existence-leak.
    const { data: assessmentRow } = await db
      .from("assessments")
      .select("id, org_id")
      .eq("id", input.assessment_id)
      .maybeSingle();
    if (!assessmentRow || assessmentRow.org_id !== input.org_id) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
    }

    // Get all scores for this assessment
    const { data: scores, error: scoresError } = await db
      .from("module_scores")
      .select("*")
      .eq("assessment_id", input.assessment_id);

    if (scoresError || !scores || scores.length === 0) {
      return NextResponse.json(
        { error: "No scores found. Stakeholders must complete their assessments first." },
        { status: 400 }
      );
    }

    // Get stakeholders for weights and names
    const { data: stakeholders } = await db
      .from("stakeholders")
      .select("id, name, role, influence_level")
      .eq("org_id", input.org_id);

    const stakeholderMap = new Map(
      (stakeholders ?? []).map((s) => [s.id, s])
    );

    const stakeholderWeights = (stakeholders ?? []).map((s) => ({
      stakeholder_id: s.id,
      influence_level: s.influence_level as "decision_maker" | "influencer" | "contributor",
    }));

    // Group scores by module
    const moduleGroups = new Map<number, typeof scores>();
    for (const score of scores) {
      const group = moduleGroups.get(score.module_number) ?? [];
      group.push(score);
      moduleGroups.set(score.module_number, group);
    }

    // Calculate synthesis for each module
    const syntheses: Omit<AssessmentSynthesis, "id">[] = [];
    const allDivergences: any[] = [];

    for (const [moduleNumber, moduleScores] of moduleGroups) {
      const consensus = calculateConsensusScore(moduleScores, stakeholderWeights);
      const divergence = calculateDivergenceScore(moduleScores);

      const impactRatings = moduleScores
        .map((s) => s.business_impact_rating)
        .filter((r): r is number => r != null);
      const businessImpact = impactRatings.length > 0
        ? impactRatings.reduce((a, b) => a + b, 0) / impactRatings.length
        : 5;

      syntheses.push({
        assessment_id: input.assessment_id,
        module_number: moduleNumber,
        consensus_score: consensus,
        divergence_score: divergence,
        business_impact: Math.round(businessImpact * 100) / 100,
        priority_rank: 0,
        priority_class: "maintain" as PriorityClass,
        recommended_actions: [],
      });

      // Detect divergence points
      const scoreData = moduleScores.map((s) => ({
        stakeholder_id: s.stakeholder_id,
        maturity_score: s.maturity_score,
        evidence: s.evidence,
        stakeholder_name: stakeholderMap.get(s.stakeholder_id)?.name ?? "Unknown",
      }));

      const divergences = detectDivergencePoints(moduleNumber, scoreData);
      for (const div of divergences) {
        const stakeA = stakeholderMap.get(div.stakeholder_a.id);
        const stakeB = stakeholderMap.get(div.stakeholder_b.id);

        // Generate AI-powered Decision Package if Anthropic key available
        let frameworkRec = `Divergence detected on ${MODULE_NAMES[moduleNumber]}: ${div.stakeholder_a.name} scored Level ${div.stakeholder_a.score}, ${div.stakeholder_b.name} scored Level ${div.stakeholder_b.score}. The evidence-based assessment suggests reviewing the diagnostic criteria together to align on the actual state.`;
        let projectedRoi = "To be calculated";

        if (process.env.ANTHROPIC_API_KEY) {
          try {
            const { data: org } = await db
              .from("organizations")
              .select("size_category, industry, employee_count")
              .eq("id", input.org_id)
              .single();

            const aiPackage = await generateDecisionPackage(
              moduleNumber,
              MODULE_NAMES[moduleNumber] ?? `Module ${moduleNumber}`,
              { name: div.stakeholder_a.name, role: stakeA?.role ?? "Unknown", score: div.stakeholder_a.score, evidence: div.stakeholder_a.evidence },
              { name: div.stakeholder_b.name, role: stakeB?.role ?? "Unknown", score: div.stakeholder_b.score, evidence: div.stakeholder_b.evidence },
              { size: (org?.size_category ?? "medium") as OrgSize, industry: (org?.industry ?? "other") as Industry, employee_count: org?.employee_count ?? 100 }
            );
            frameworkRec = aiPackage.framework_recommendation;
            projectedRoi = aiPackage.projected_roi;
          } catch (aiErr) {
            console.warn("AI decision package failed, using fallback:", aiErr);
          }
        }

        allDivergences.push({
          assessment_id: input.assessment_id,
          module_number: div.module_number,
          stakeholder_a_id: div.stakeholder_a.id,
          stakeholder_b_id: div.stakeholder_b.id,
          score_gap: div.score_gap,
          framework_recommendation: frameworkRec,
          decision_package: {
            stakeholder_a: { ...div.stakeholder_a, role: stakeA?.role },
            stakeholder_b: { ...div.stakeholder_b, role: stakeB?.role },
            projected_roi: projectedRoi,
          },
        });
      }
    }

    // Prioritize
    const priorities = prioritizeModules(syntheses);
    for (const p of priorities) {
      const synth = syntheses.find((s) => s.module_number === p.module_number);
      if (synth) {
        synth.priority_rank = p.priority_rank;
        synth.priority_class = p.priority_class;
      }
    }

    // Atomic replace via stored procedure (closes P0-6).
    // The function deletes prior synthesis + divergences and inserts the new
    // ones inside a single Postgres transaction. If anything fails, all prior
    // data is preserved — no more delete-succeeds-then-insert-fails data loss.
    const { error: rpcError } = await db.rpc("replace_assessment_synthesis", {
      p_assessment_id: input.assessment_id,
      p_syntheses: syntheses,
      p_divergences: allDivergences,
    });
    if (rpcError) throw rpcError;

    // Update assessment status
    await db
      .from("assessments")
      .update({ status: "completed", completed_at: new Date().toISOString() })
      .eq("id", input.assessment_id);

    return NextResponse.json({ syntheses, divergences: allDivergences });
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
