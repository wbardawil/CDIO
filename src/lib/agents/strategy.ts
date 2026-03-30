// ============================================================
// AI-CDIO — Strategy Agent
// Generates roadmaps, applies prioritization algorithms,
// and recommends module stacks based on org profile
// ============================================================

import Anthropic from "@anthropic-ai/sdk";
import type {
  AssessmentSynthesis,
  OrgSize,
  Industry,
  RoadmapContent,
  Initiative,
  Milestone,
  DivergencePoint,
} from "@/types";
import { MODULE_NAMES, MODULE_STACKS } from "@/types";
import {
  recommendModuleStack,
  recommendEngagementModel,
} from "@/lib/scoring/maturity";

const anthropic = new Anthropic();

const STRATEGY_SYSTEM_PROMPT = `You are the Strategy Agent of the AI-CDIO system. Your role is to generate actionable roadmaps and strategic recommendations based on assessment data.

## Your Decision Frameworks

### Value vs Effort Prioritization
- Value Score (1-10): Business Impact (1-4) + Strategic Alignment (1-3) + Stakeholder Priority (1-3)
- Effort Score (1-10): Time/Duration (1-3) + Resources (1-3) + Technical Complexity (1-2) + Org Change (1-2)
- HIGH PRIORITY: Value >= 7, Effort <= 4
- STRATEGIC BET: Value >= 7, Effort >= 7
- QUICK WIN: Value 4-6, Effort <= 4
- DEFER: Value <= 3

### Quick Win Criteria (must meet 5 of 7)
1. Deliverable in 90 days
2. Minimal budget required
3. Visible business impact
4. Builds credibility and trust
5. Addresses a known pain point
6. Low organizational risk
7. Provides learning opportunity

### Roadmap Structure
- 90-day: Foundation + Quick Wins (Weeks 1-4: Immersion & Assessment, Weeks 5-8: Quick Wins, Weeks 9-12: Strategic Planning)
- 6-month: Foundation → Strategic Initiatives → Momentum
- 12-month: Q1 Foundation → Q2 Launch → Q3 Scale → Q4 Optimize

## Output Rules
1. Every recommendation must cite the assessment data that supports it
2. Quick wins must pass the 7-criteria test
3. Roadmap phases must have clear entry/exit criteria
4. All initiatives must have projected ROI ranges
5. Be specific — "Implement MFA across all systems" not "Improve security"`;

// --- Generate a 90-day roadmap from assessment synthesis ---

export async function generate90DayRoadmap(
  syntheses: AssessmentSynthesis[],
  divergences: DivergencePoint[],
  orgContext: {
    name: string;
    size: OrgSize;
    industry: Industry;
    employee_count: number;
    monthly_hours: number;
  }
): Promise<RoadmapContent> {
  // Get module stack recommendation
  const stackRec = recommendModuleStack(
    orgContext.size,
    orgContext.industry,
    orgContext.monthly_hours
  );

  // Get engagement model
  const engagement = recommendEngagementModel(
    orgContext.employee_count,
    false, // conservative assumption
    false
  );

  // Sort syntheses by priority rank
  const prioritized = [...syntheses].sort(
    (a, b) => a.priority_rank - b.priority_rank
  );
  const topPriorities = prioritized.slice(0, 5);

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system: STRATEGY_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Generate a 90-day roadmap for ${orgContext.name}.

## Organization Profile
- Size: ${orgContext.size} (${orgContext.employee_count} employees)
- Industry: ${orgContext.industry}
- Monthly hours available: ${orgContext.monthly_hours}
- Recommended engagement: ${engagement.model} (${engagement.hours} hrs/month)
- Recommended module stack: ${stackRec.modules.map((m) => `M${m}: ${MODULE_NAMES[m]}`).join(", ")}

## Assessment Results (Top 5 Priority Modules)
${topPriorities
  .map(
    (s) =>
      `Module ${s.module_number} (${MODULE_NAMES[s.module_number]}): ` +
      `Consensus ${s.consensus_score}/4, Impact ${s.business_impact}/10, ` +
      `Priority: ${s.priority_class}, Divergence: ${s.divergence_score}`
  )
  .join("\n")}

## Divergence Points (Leadership Disagreements)
${
  divergences.length > 0
    ? divergences
        .map(
          (d) =>
            `Module ${d.module_number}: ${d.stakeholder_a.name} scored ${d.stakeholder_a.score}, ` +
            `${d.stakeholder_b.name} scored ${d.stakeholder_b.score} (gap: ${d.score_gap})`
        )
        .join("\n")
    : "No significant divergences detected."
}

## All Module Scores
${syntheses
  .map(
    (s) =>
      `M${s.module_number}: ${MODULE_NAMES[s.module_number]} — Score ${s.consensus_score}/4, Impact ${s.business_impact}/10`
  )
  .join("\n")}

Generate the roadmap as JSON:
{
  "summary": "<2-3 sentence executive summary>",
  "quick_wins": [
    {
      "id": "<unique-id>",
      "module_numbers": [<numbers>],
      "title": "<specific action>",
      "description": "<what and why>",
      "priority_class": "quick_win",
      "value_score": <1-10>,
      "effort_score": <1-10>,
      "status": "planned",
      "expected_roi": "<projected return>"
    }
  ],
  "strategic_initiatives": [
    {
      "id": "<unique-id>",
      "module_numbers": [<numbers>],
      "title": "<initiative name>",
      "description": "<scope and approach>",
      "priority_class": "<class>",
      "value_score": <1-10>,
      "effort_score": <1-10>,
      "status": "planned",
      "expected_roi": "<projected return>"
    }
  ],
  "milestones": [
    {
      "title": "<milestone>",
      "target_date": "<YYYY-MM-DD>",
      "deliverables": ["<deliverable>"],
      "success_metrics": ["<metric>"]
    }
  ]
}

Include 2-3 quick wins and 2-3 strategic initiatives. Milestones at 30, 60, and 90 days.`,
      },
    ],
  });

  const responseText =
    message.content[0].type === "text" ? message.content[0].text : "";

  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to parse roadmap response");
  }

  return JSON.parse(jsonMatch[0]) as RoadmapContent;
}

// --- Generate executive summary of assessment + roadmap ---

export async function generateExecutiveSummary(
  syntheses: AssessmentSynthesis[],
  roadmap: RoadmapContent,
  divergences: DivergencePoint[],
  orgContext: {
    name: string;
    size: OrgSize;
    industry: Industry;
    employee_count: number;
  }
): Promise<string> {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2048,
    system: `You are the Strategy Agent. Write a concise executive summary for the leadership team.
Be direct, objective, and focus on business impact. No jargon. No filler.
Address divergence points diplomatically — present the data, not the people.`,
    messages: [
      {
        role: "user",
        content: `Write an executive summary for ${orgContext.name} (${orgContext.size}, ${orgContext.employee_count} employees, ${orgContext.industry}).

Assessment Highlights:
- Strongest modules: ${syntheses
          .filter((s) => s.consensus_score >= 3)
          .map((s) => `${MODULE_NAMES[s.module_number]} (${s.consensus_score}/4)`)
          .join(", ") || "None above Level 3"}
- Weakest modules: ${syntheses
          .filter((s) => s.consensus_score < 2)
          .map((s) => `${MODULE_NAMES[s.module_number]} (${s.consensus_score}/4)`)
          .join(", ") || "None below Level 2"}
- Top priorities: ${syntheses
          .filter((s) => s.priority_class === "top_priority")
          .map((s) => MODULE_NAMES[s.module_number])
          .join(", ")}
- Divergence count: ${divergences.length}

Roadmap Summary: ${roadmap.summary}
Quick Wins: ${roadmap.quick_wins.map((q) => q.title).join("; ")}
Strategic Initiatives: ${roadmap.strategic_initiatives.map((i) => i.title).join("; ")}

Write 3-4 paragraphs. Start with the key finding, then priorities, then recommended path forward.`,
      },
    ],
  });

  return message.content[0].type === "text" ? message.content[0].text : "";
}
