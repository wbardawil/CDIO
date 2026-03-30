// ============================================================
// AI-CDIO — Engagement Orchestrator
// Manages the state machine per client engagement:
// ONBOARDING → ASSESSMENT → ANALYSIS → STRATEGY → REVIEW
// ============================================================

import { createServiceClient } from "@/lib/db/supabase";
import { scoreModule, generateDecisionPackage } from "./assessment";
import { generate90DayRoadmap, generateExecutiveSummary } from "./strategy";
import {
  calculateConsensusScore,
  calculateDivergenceScore,
  detectDivergencePoints,
  prioritizeModules,
  recommendModuleStack,
  recommendEngagementModel,
} from "@/lib/scoring/maturity";
import type {
  Organization,
  Stakeholder,
  AssessmentSynthesis,
  DivergencePoint,
  EngagementState,
  OrgSize,
  Industry,
  MaturityLevel,
} from "@/types";
import { MODULE_NAMES } from "@/types";

// --- State Machine ---

const STATE_TRANSITIONS: Record<EngagementState, EngagementState[]> = {
  onboarding: ["assessment"],
  assessment: ["analysis"],
  analysis: ["strategy"],
  strategy: ["execution"],
  execution: ["review"],
  review: ["assessment", "strategy", "execution"], // can loop back
};

export class EngagementOrchestrator {
  private db = createServiceClient();
  private orgId: string;

  constructor(orgId: string) {
    this.orgId = orgId;
  }

  // --- PHASE 1: Onboarding ---

  async onboard(input: {
    name: string;
    employee_count: number;
    industry: Industry;
    stakeholders: { name: string; email: string; role: string }[];
  }) {
    // Determine org size
    let size_category: OrgSize;
    if (input.employee_count <= 50) size_category = "small";
    else if (input.employee_count <= 250) size_category = "medium";
    else size_category = "large";

    // Get engagement recommendation
    const engagement = recommendEngagementModel(
      input.employee_count,
      false,
      false
    );

    // Get module stack recommendation
    const stack = recommendModuleStack(
      size_category,
      input.industry,
      engagement.hours
    );

    // Create or update organization
    const { data: org, error: orgError } = await this.db
      .from("organizations")
      .upsert({
        id: this.orgId,
        name: input.name,
        size_category,
        employee_count: input.employee_count,
        industry: input.industry,
        engagement_model: engagement.model,
        monthly_hours: engagement.hours,
      })
      .select()
      .single();

    if (orgError) throw orgError;

    // Assign relevant modules to stakeholders based on role
    const stakeholderRecords = input.stakeholders.map((s) => ({
      org_id: this.orgId,
      name: s.name,
      email: s.email,
      role: s.role,
      influence_level: this.inferInfluenceLevel(s.role),
      relevant_modules: this.assignModulesByRole(s.role),
      assessment_token: crypto.randomUUID(),
    }));

    const { data: stakeholders, error: stakeError } = await this.db
      .from("stakeholders")
      .upsert(stakeholderRecords, { onConflict: "org_id,email" })
      .select();

    if (stakeError) throw stakeError;

    // Create initial assessment
    const { data: assessment, error: assessError } = await this.db
      .from("assessments")
      .insert({
        org_id: this.orgId,
        type: "initial",
        status: "draft",
      })
      .select()
      .single();

    if (assessError) throw assessError;

    return {
      organization: org,
      stakeholders,
      assessment,
      recommended_engagement: engagement,
      recommended_modules: stack,
    };
  }

  // --- PHASE 2: Process Assessment Responses ---

  async processAssessmentResponse(
    assessmentId: string,
    stakeholderId: string,
    moduleNumber: number,
    diagnosticResponses: { question_text: string; answer: "yes" | "no" | "partial"; evidence?: string }[]
  ) {
    // Get org context
    const { data: org } = await this.db
      .from("organizations")
      .select("*")
      .eq("id", this.orgId)
      .single();

    if (!org) throw new Error("Organization not found");

    // Score using Assessment Agent
    const result = await scoreModule(
      moduleNumber,
      diagnosticResponses.map((r, i) => ({
        question_id: `m${moduleNumber}_q${i + 1}`,
        ...r,
      })),
      {
        size: org.size_category as OrgSize,
        industry: org.industry as Industry,
        employee_count: org.employee_count,
      }
    );

    // Save score
    const { data: score, error } = await this.db
      .from("module_scores")
      .upsert({
        assessment_id: assessmentId,
        stakeholder_id: stakeholderId,
        module_number: moduleNumber,
        maturity_score: result.maturity_score,
        evidence: result.evidence,
        diagnostic_responses: diagnosticResponses,
      }, { onConflict: "assessment_id,stakeholder_id,module_number" })
      .select()
      .single();

    if (error) throw error;

    return { score, assessment_result: result };
  }

  // --- PHASE 3: Synthesize Assessment ---

  async synthesizeAssessment(assessmentId: string) {
    // Get all scores for this assessment
    const { data: scores } = await this.db
      .from("module_scores")
      .select("*, stakeholders(name, influence_level)")
      .eq("assessment_id", assessmentId);

    if (!scores || scores.length === 0) {
      throw new Error("No scores found for this assessment");
    }

    // Get stakeholder weights
    const { data: stakeholders } = await this.db
      .from("stakeholders")
      .select("id, name, influence_level")
      .eq("org_id", this.orgId);

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
    const syntheses: AssessmentSynthesis[] = [];
    const allDivergences: DivergencePoint[] = [];

    for (const [moduleNumber, moduleScores] of moduleGroups) {
      const consensus = calculateConsensusScore(moduleScores, stakeholderWeights);
      const divergence = calculateDivergenceScore(moduleScores);

      // Average business impact rating
      const impactRatings = moduleScores
        .map((s) => s.business_impact_rating)
        .filter((r): r is number => r !== null);
      const businessImpact =
        impactRatings.length > 0
          ? impactRatings.reduce((a, b) => a + b, 0) / impactRatings.length
          : 5; // default mid

      syntheses.push({
        id: crypto.randomUUID(),
        assessment_id: assessmentId,
        module_number: moduleNumber,
        consensus_score: consensus,
        divergence_score: divergence,
        business_impact: Math.round(businessImpact * 100) / 100,
        priority_rank: 0, // will be set after prioritization
        priority_class: "maintain", // will be recalculated
        recommended_actions: [],
      });

      // Detect divergences
      const scoreData = moduleScores.map((s) => ({
        stakeholder_id: s.stakeholder_id,
        maturity_score: s.maturity_score,
        evidence: s.evidence,
        stakeholder_name: (s as any).stakeholders?.name ?? "Unknown",
      }));

      const divergences = detectDivergencePoints(moduleNumber, scoreData);

      // Generate decision packages for divergences
      for (const div of divergences) {
        const { data: org } = await this.db
          .from("organizations")
          .select("*")
          .eq("id", this.orgId)
          .single();

        const { data: stakeA } = await this.db
          .from("stakeholders")
          .select("role")
          .eq("id", div.stakeholder_a.id)
          .single();
        const { data: stakeB } = await this.db
          .from("stakeholders")
          .select("role")
          .eq("id", div.stakeholder_b.id)
          .single();

        const decisionPackage = await generateDecisionPackage(
          moduleNumber,
          div.module_name,
          {
            name: div.stakeholder_a.name,
            role: stakeA?.role ?? "Unknown",
            score: div.stakeholder_a.score,
            evidence: div.stakeholder_a.evidence,
          },
          {
            name: div.stakeholder_b.name,
            role: stakeB?.role ?? "Unknown",
            score: div.stakeholder_b.score,
            evidence: div.stakeholder_b.evidence,
          },
          {
            size: org?.size_category as OrgSize ?? "medium",
            industry: org?.industry as Industry ?? "other",
            employee_count: org?.employee_count ?? 100,
          }
        );

        allDivergences.push({
          ...div,
          framework_recommendation: decisionPackage.framework_recommendation,
          projected_roi: decisionPackage.projected_roi,
        });
      }
    }

    // Prioritize modules
    const priorities = prioritizeModules(syntheses);
    for (const p of priorities) {
      const synth = syntheses.find((s) => s.module_number === p.module_number);
      if (synth) {
        synth.priority_rank = p.priority_rank;
        synth.priority_class = p.priority_class;
      }
    }

    // Save syntheses to database
    for (const synth of syntheses) {
      await this.db
        .from("assessment_synthesis")
        .upsert(synth, { onConflict: "assessment_id,module_number" });
    }

    // Save divergences
    for (const div of allDivergences) {
      await this.db.from("divergence_points").insert({
        assessment_id: assessmentId,
        module_number: div.module_number,
        stakeholder_a_id: div.stakeholder_a.id,
        stakeholder_b_id: div.stakeholder_b.id,
        score_gap: div.score_gap,
        framework_recommendation: div.framework_recommendation,
        decision_package: {
          stakeholder_a: div.stakeholder_a,
          stakeholder_b: div.stakeholder_b,
          projected_roi: div.projected_roi,
        },
      });
    }

    // Update assessment status
    await this.db
      .from("assessments")
      .update({ status: "completed", completed_at: new Date().toISOString() })
      .eq("id", assessmentId);

    return { syntheses, divergences: allDivergences };
  }

  // --- PHASE 4: Generate Roadmap ---

  async generateRoadmap(assessmentId: string) {
    const { data: org } = await this.db
      .from("organizations")
      .select("*")
      .eq("id", this.orgId)
      .single();

    if (!org) throw new Error("Organization not found");

    const { data: syntheses } = await this.db
      .from("assessment_synthesis")
      .select("*")
      .eq("assessment_id", assessmentId)
      .order("priority_rank");

    const { data: divergences } = await this.db
      .from("divergence_points")
      .select("*, stakeholders_a:stakeholder_a_id(name), stakeholders_b:stakeholder_b_id(name)")
      .eq("assessment_id", assessmentId);

    if (!syntheses || syntheses.length === 0) {
      throw new Error("No synthesis data found. Run synthesizeAssessment first.");
    }

    // Map divergences to the expected format
    const divPoints: DivergencePoint[] = (divergences ?? []).map((d) => ({
      module_number: d.module_number,
      module_name: MODULE_NAMES[d.module_number] ?? `Module ${d.module_number}`,
      stakeholder_a: {
        id: d.stakeholder_a_id,
        name: (d as any).stakeholders_a?.name ?? "Stakeholder A",
        score: d.decision_package?.stakeholder_a?.score ?? 1,
        evidence: d.decision_package?.stakeholder_a?.evidence ?? "",
      },
      stakeholder_b: {
        id: d.stakeholder_b_id,
        name: (d as any).stakeholders_b?.name ?? "Stakeholder B",
        score: d.decision_package?.stakeholder_b?.score ?? 1,
        evidence: d.decision_package?.stakeholder_b?.evidence ?? "",
      },
      score_gap: d.score_gap,
      framework_recommendation: d.framework_recommendation,
      projected_roi: d.decision_package?.projected_roi ?? "TBD",
    }));

    const roadmapContent = await generate90DayRoadmap(
      syntheses as AssessmentSynthesis[],
      divPoints,
      {
        name: org.name,
        size: org.size_category as OrgSize,
        industry: org.industry as Industry,
        employee_count: org.employee_count,
        monthly_hours: org.monthly_hours,
      }
    );

    // Generate executive summary
    const executiveSummary = await generateExecutiveSummary(
      syntheses as AssessmentSynthesis[],
      roadmapContent,
      divPoints,
      {
        name: org.name,
        size: org.size_category as OrgSize,
        industry: org.industry as Industry,
        employee_count: org.employee_count,
      }
    );

    // Save roadmap
    const { data: roadmap, error } = await this.db
      .from("roadmaps")
      .insert({
        org_id: this.orgId,
        assessment_id: assessmentId,
        type: "90_day",
        status: "draft",
        content: { ...roadmapContent, executive_summary: executiveSummary },
      })
      .select()
      .single();

    if (error) throw error;

    return { roadmap, executive_summary: executiveSummary };
  }

  // --- Helper: Infer influence level from role ---

  private inferInfluenceLevel(role: string): string {
    const r = role.toLowerCase();
    if (r.includes("ceo") || r.includes("owner") || r.includes("president") || r.includes("coo")) {
      return "decision_maker";
    }
    if (r.includes("cto") || r.includes("cfo") || r.includes("cio") || r.includes("vp") || r.includes("director")) {
      return "influencer";
    }
    return "contributor";
  }

  // --- Helper: Assign relevant modules by role ---

  private assignModulesByRole(role: string): number[] {
    const r = role.toLowerCase();

    if (r.includes("ceo") || r.includes("owner") || r.includes("president")) {
      return [1, 2, 10, 12, 16]; // Role, Strategy, Leadership, Financial, Change
    }
    if (r.includes("cto") || r.includes("cio") || r.includes("it")) {
      return [2, 3, 4, 5, 6, 14]; // Strategy, Architecture, Cloud, Security, Data, DevOps
    }
    if (r.includes("cfo") || r.includes("finance")) {
      return [12, 13, 2]; // Financial, Portfolio, Strategy
    }
    if (r.includes("coo") || r.includes("operations")) {
      return [11, 15, 13]; // Organization, Process, Portfolio
    }
    if (r.includes("marketing") || r.includes("product") || r.includes("sales")) {
      return [7, 8, 9]; // Platforms, Analytics, Design
    }
    if (r.includes("hr") || r.includes("people")) {
      return [16, 11]; // Future of Work, Organization
    }

    // Default: all modules
    return Array.from({ length: 16 }, (_, i) => i + 1);
  }
}
