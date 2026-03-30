// ============================================================
// Virtual CDIO — Maturity Scoring & Prioritization Engine
// Implements the playbook's assessment and prioritization logic
// ============================================================

import type {
  MaturityLevel,
  ModuleScore,
  AssessmentSynthesis,
  PriorityClass,
  DivergencePoint,
  OrgSize,
  Industry,
  Initiative,
} from "@/types";
import { MODULE_NAMES, SIZE_PRIORITY_SEQUENCES } from "@/types";

// --- Consensus Score (weighted average across stakeholders) ---

interface StakeholderWeight {
  stakeholder_id: string;
  influence_level: "decision_maker" | "influencer" | "contributor";
}

const INFLUENCE_WEIGHTS: Record<string, number> = {
  decision_maker: 3,
  influencer: 2,
  contributor: 1,
};

export function calculateConsensusScore(
  scores: Pick<ModuleScore, "stakeholder_id" | "maturity_score">[],
  stakeholderWeights: StakeholderWeight[]
): number {
  if (scores.length === 0) return 0;

  const weightMap = new Map(
    stakeholderWeights.map((sw) => [
      sw.stakeholder_id,
      INFLUENCE_WEIGHTS[sw.influence_level] ?? 1,
    ])
  );

  let weightedSum = 0;
  let totalWeight = 0;

  for (const score of scores) {
    const weight = weightMap.get(score.stakeholder_id) ?? 1;
    weightedSum += score.maturity_score * weight;
    totalWeight += weight;
  }

  return totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 100) / 100 : 0;
}

// --- Divergence Score (standard deviation — high = disagreement) ---

export function calculateDivergenceScore(
  scores: Pick<ModuleScore, "maturity_score">[]
): number {
  if (scores.length <= 1) return 0;

  const values = scores.map((s) => s.maturity_score);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance =
    values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;

  return Math.round(Math.sqrt(variance) * 100) / 100;
}

// --- Detect Divergence Points (where stakeholders disagree by 2+ levels) ---

export function detectDivergencePoints(
  moduleNumber: number,
  scores: (Pick<ModuleScore, "stakeholder_id" | "maturity_score" | "evidence"> & {
    stakeholder_name: string;
  })[]
): Omit<DivergencePoint, "framework_recommendation" | "projected_roi">[] {
  const divergences: Omit<DivergencePoint, "framework_recommendation" | "projected_roi">[] = [];

  for (let i = 0; i < scores.length; i++) {
    for (let j = i + 1; j < scores.length; j++) {
      const gap = Math.abs(scores[i].maturity_score - scores[j].maturity_score);
      if (gap >= 2) {
        divergences.push({
          module_number: moduleNumber,
          module_name: MODULE_NAMES[moduleNumber] ?? `Module ${moduleNumber}`,
          stakeholder_a: {
            id: scores[i].stakeholder_id,
            name: scores[i].stakeholder_name,
            score: scores[i].maturity_score as MaturityLevel,
            evidence: scores[i].evidence,
          },
          stakeholder_b: {
            id: scores[j].stakeholder_id,
            name: scores[j].stakeholder_name,
            score: scores[j].maturity_score as MaturityLevel,
            evidence: scores[j].evidence,
          },
          score_gap: gap,
        });
      }
    }
  }

  return divergences;
}

// --- Value vs Effort Prioritization (from Roadmap Generator) ---

export interface ValueEffortInput {
  business_impact: number;       // 1-4
  strategic_alignment: number;   // 1-3
  stakeholder_priority: number;  // 1-3
  time_duration: number;         // 1-3
  resource_requirements: number; // 1-3
  technical_complexity: number;  // 1-2
  org_change_required: number;   // 1-2
}

export function calculateValueEffortScore(input: ValueEffortInput): {
  value_score: number;
  effort_score: number;
  priority_class: PriorityClass;
} {
  const value_score =
    input.business_impact + input.strategic_alignment + input.stakeholder_priority;
  const effort_score =
    input.time_duration +
    input.resource_requirements +
    input.technical_complexity +
    input.org_change_required;

  let priority_class: PriorityClass;

  if (value_score >= 7 && effort_score <= 4) {
    priority_class = "top_priority";
  } else if (value_score >= 7 && effort_score >= 7) {
    priority_class = "strategic_bet";
  } else if (value_score >= 4 && value_score <= 6 && effort_score <= 4) {
    priority_class = "quick_win";
  } else if (value_score <= 3) {
    priority_class = "defer";
  } else {
    priority_class = "maintain";
  }

  return { value_score, effort_score, priority_class };
}

// --- Quick Win Selector (7 criteria from Roadmap Generator) ---

export interface QuickWinCriteria {
  deliverable_in_90_days: boolean;
  minimal_budget: boolean;
  visible_business_impact: boolean;
  builds_credibility: boolean;
  addresses_known_pain: boolean;
  low_org_risk: boolean;
  provides_learning: boolean;
}

export function evaluateQuickWin(criteria: QuickWinCriteria): {
  qualifies: boolean;
  score: number;
  max_score: number;
} {
  const values = Object.values(criteria);
  const score = values.filter(Boolean).length;
  return {
    qualifies: score >= 5,
    score,
    max_score: 7,
  };
}

// --- Module Prioritization (combines maturity + business impact) ---

export function prioritizeModules(
  syntheses: Pick<AssessmentSynthesis, "module_number" | "consensus_score" | "business_impact">[]
): Pick<AssessmentSynthesis, "module_number" | "priority_rank" | "priority_class">[] {
  // Priority = high business impact + low maturity (biggest gap = biggest opportunity)
  const scored = syntheses.map((s) => ({
    module_number: s.module_number,
    // Invert maturity: lower maturity = higher priority
    priority_score: s.business_impact * (5 - s.consensus_score),
    consensus_score: s.consensus_score,
    business_impact: s.business_impact,
  }));

  // Sort by priority score descending
  scored.sort((a, b) => b.priority_score - a.priority_score);

  return scored.map((s, index) => {
    let priority_class: PriorityClass;

    if (s.business_impact >= 7 && s.consensus_score <= 2) {
      priority_class = "top_priority";
    } else if (s.business_impact >= 7 && s.consensus_score > 2) {
      priority_class = "maintain";
    } else if (s.business_impact < 4) {
      priority_class = "defer";
    } else if (s.consensus_score >= 3) {
      priority_class = "quick_win";
    } else {
      priority_class = "strategic_bet";
    }

    return {
      module_number: s.module_number,
      priority_rank: index + 1,
      priority_class,
    };
  });
}

// --- Module Stack Recommender (from Adaptation Guide) ---

export function recommendModuleStack(
  orgSize: OrgSize,
  industry: Industry,
  monthlyHours: number,
  primaryNeed?: string
): {
  recommended_stack: string;
  modules: number[];
  rationale: string;
} {
  // Step 1: Get base priority sequence by org size
  const basePriority = SIZE_PRIORITY_SEQUENCES[orgSize];

  // Step 2: Constrain by available hours
  let maxModules: number;
  if (monthlyHours <= 5) maxModules = 2;
  else if (monthlyHours <= 10) maxModules = 3;
  else if (monthlyHours <= 20) maxModules = 5;
  else maxModules = 8;

  const recommendedModules = basePriority.slice(0, maxModules);

  // Step 3: Industry adjustments
  const industryOverrides: Partial<Record<Industry, number[]>> = {
    healthcare: [5, 3, 8, 15, 9],       // HIPAA → EHR Architecture → Analytics → Automation → Patient CX
    financial_services: [5, 12, 8, 3, 15], // Security/Compliance → Financial → Analytics → Architecture → Automation
    manufacturing: [15, 4, 8, 5, 6],     // Automation → Cloud/IoT → Analytics → Security → Data/AI
    retail_ecommerce: [9, 7, 8, 4, 15],  // Customer CX → Platforms → Analytics → Cloud → Automation
  };

  const industryPriority = industryOverrides[industry];
  let finalModules = recommendedModules;
  let stackName = `${orgSize}_default`;
  let rationale = `Based on organization size (${orgSize}) with ${monthlyHours} hours/month.`;

  if (industryPriority) {
    // Merge: keep size-based priorities but boost industry-critical modules
    const merged = [...new Set([...industryPriority.slice(0, 2), ...recommendedModules])];
    finalModules = merged.slice(0, maxModules);
    stackName = `${industry}_${orgSize}`;
    rationale += ` Industry-specific priorities for ${industry} applied.`;
  }

  return {
    recommended_stack: stackName,
    modules: finalModules,
    rationale,
  };
}

// --- Engagement Model Selector (decision tree from Adaptation Guide) ---

export function recommendEngagementModel(
  employeeCount: number,
  hasExistingCIO: boolean,
  activeMajorTransformation: boolean
): {
  model: "advisory" | "strategic" | "hybrid" | "executive";
  hours: number;
  rationale: string;
} {
  if (employeeCount > 250 || activeMajorTransformation) {
    if (!hasExistingCIO) {
      return {
        model: "executive",
        hours: 40,
        rationale:
          "Large organization without technology leadership needs executive-level engagement to drive transformation.",
      };
    }
    return {
      model: "hybrid",
      hours: 20,
      rationale:
        "Large organization with existing CIO benefits from strategic + tactical support.",
    };
  }

  if (employeeCount > 50) {
    return {
      model: "strategic",
      hours: 10,
      rationale:
        "Mid-size organization needs strategic guidance with light execution support.",
    };
  }

  if (hasExistingCIO) {
    return {
      model: "advisory",
      hours: 5,
      rationale:
        "Small organization with existing technology leadership needs advisory direction only.",
    };
  }

  return {
    model: "strategic",
    hours: 10,
    rationale:
      "Small organization without technology leadership needs strategic guidance to establish foundations.",
  };
}
