/**
 * Coverage Warning Panel — server component that surfaces modules with
 * thin coverage so the practitioner knows who to chase. Built in
 * Phase 1C Day 9.
 *
 * "Thin coverage" rule for an active module:
 *   - Fewer than 2 stakeholders gave a non-N/A answer, OR
 *   - Below 50% of eligible stakeholders responded (where eligible =
 *     stakeholder.relevant_modules includes this module)
 *
 * N/A respondents are listed by name so the practitioner can decide
 * whether to chase them or treat the abstention as a signal that the
 * module isn't relevant for that role.
 */

import { MODULE_NAMES } from "@/types";

interface StakeholderForCoverage {
  id: string;
  name: string;
  role: string;
  relevant_modules: number[];
}

interface ScoreForCoverage {
  stakeholder_id: string;
  module_number: number;
  maturity_score: number | null;
  module_skipped: boolean;
}

interface Props {
  activeModules: number[];
  stakeholders: StakeholderForCoverage[];
  scores: ScoreForCoverage[];
}

interface Gap {
  moduleNumber: number;
  moduleName: string;
  eligibleCount: number;
  answeredCount: number;
  abstainedNames: string[];
  notRespondedNames: string[];
  reason: "fewer_than_two" | "below_fifty_percent" | "both";
}

function computeGaps(
  activeModules: number[],
  stakeholders: StakeholderForCoverage[],
  scores: ScoreForCoverage[]
): Gap[] {
  const gaps: Gap[] = [];

  for (const mn of activeModules) {
    const eligible = stakeholders.filter((s) => (s.relevant_modules ?? []).includes(mn));
    if (eligible.length === 0) continue;

    const moduleScores = scores.filter((sc) => sc.module_number === mn);
    const answered = moduleScores.filter((sc) => sc.maturity_score != null && !sc.module_skipped);
    const abstained = moduleScores.filter((sc) => sc.module_skipped || sc.maturity_score == null);

    const answeredIds = new Set(answered.map((sc) => sc.stakeholder_id));
    const abstainedIds = new Set(abstained.map((sc) => sc.stakeholder_id));
    const notResponded = eligible.filter(
      (s) => !answeredIds.has(s.id) && !abstainedIds.has(s.id)
    );

    const fewerThanTwo = answered.length < 2;
    const belowFifty = answered.length < eligible.length * 0.5;

    if (!fewerThanTwo && !belowFifty) continue;

    const reason: Gap["reason"] =
      fewerThanTwo && belowFifty
        ? "both"
        : fewerThanTwo
          ? "fewer_than_two"
          : "below_fifty_percent";

    gaps.push({
      moduleNumber: mn,
      moduleName: MODULE_NAMES[mn] ?? `Module ${mn}`,
      eligibleCount: eligible.length,
      answeredCount: answered.length,
      abstainedNames: abstained
        .map((sc) => stakeholders.find((s) => s.id === sc.stakeholder_id)?.name)
        .filter((n): n is string => !!n),
      notRespondedNames: notResponded.map((s) => s.name),
      reason,
    });
  }

  return gaps;
}

export function CoverageWarningPanel(props: Props) {
  const gaps = computeGaps(props.activeModules, props.stakeholders, props.scores);
  if (gaps.length === 0) return null;

  return (
    <div className="rounded-xl border border-yellow-300 bg-yellow-50 mb-6">
      <div className="px-6 py-4 border-b border-yellow-200">
        <h3 className="text-base font-semibold text-yellow-900">
          ⚠ Thin coverage on {gaps.length} {gaps.length === 1 ? "module" : "modules"}
        </h3>
        <p className="text-xs text-yellow-800 mt-0.5">
          The synthesis below is sensitive to who actually answered. Modules with fewer than 2 respondents,
          or below 50% of eligible stakeholders, are flagged here so you can chase the gap before the consensus is final.
        </p>
      </div>
      <div className="divide-y divide-yellow-200">
        {gaps.map((g) => (
          <div key={g.moduleNumber} className="px-6 py-3">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-xs font-mono text-yellow-700">M{g.moduleNumber}</span>
              <span className="text-sm font-semibold text-yellow-900">{g.moduleName}</span>
              <span className="text-xs text-yellow-800">
                · {g.answeredCount} of {g.eligibleCount} eligible answered
              </span>
            </div>
            <div className="mt-1.5 space-y-0.5 text-xs text-yellow-800">
              {g.notRespondedNames.length > 0 && (
                <p>
                  <span className="font-medium">Hasn&apos;t started:</span>{" "}
                  {g.notRespondedNames.join(", ")}
                </p>
              )}
              {g.abstainedNames.length > 0 && (
                <p>
                  <span className="font-medium">Marked N/A:</span>{" "}
                  {g.abstainedNames.join(", ")}
                  <span className="ml-1 text-yellow-600">
                    — consider whether this module belongs in the engagement scope
                  </span>
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
