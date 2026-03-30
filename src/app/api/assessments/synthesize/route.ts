import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/db/supabase";
import {
  calculateConsensusScore,
  calculateDivergenceScore,
  detectDivergencePoints,
  prioritizeModules,
} from "@/lib/scoring/maturity";
import { MODULE_NAMES } from "@/types";
import type { AssessmentSynthesis, PriorityClass } from "@/types";
import { z } from "zod";

const SynthesizeSchema = z.object({
  org_id: z.string().uuid(),
  assessment_id: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = SynthesizeSchema.parse(body);
    const db = createServiceClient();

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

        allDivergences.push({
          assessment_id: input.assessment_id,
          module_number: div.module_number,
          stakeholder_a_id: div.stakeholder_a.id,
          stakeholder_b_id: div.stakeholder_b.id,
          score_gap: div.score_gap,
          framework_recommendation: `Divergence detected on ${MODULE_NAMES[moduleNumber]}: ${div.stakeholder_a.name} scored Level ${div.stakeholder_a.score}, ${div.stakeholder_b.name} scored Level ${div.stakeholder_b.score}. The evidence-based assessment suggests reviewing the diagnostic criteria together to align on the actual state.`,
          decision_package: {
            stakeholder_a: { ...div.stakeholder_a, role: stakeA?.role },
            stakeholder_b: { ...div.stakeholder_b, role: stakeB?.role },
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

    // Clear old synthesis and divergences
    await db.from("assessment_synthesis").delete().eq("assessment_id", input.assessment_id);
    await db.from("divergence_points").delete().eq("assessment_id", input.assessment_id);

    // Save syntheses
    if (syntheses.length > 0) {
      const { error: synthError } = await db
        .from("assessment_synthesis")
        .insert(syntheses);
      if (synthError) throw synthError;
    }

    // Save divergences
    if (allDivergences.length > 0) {
      const { error: divError } = await db
        .from("divergence_points")
        .insert(allDivergences);
      if (divError) throw divError;
    }

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
