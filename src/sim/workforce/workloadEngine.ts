/**
 * ═══════════════════════════════════════════════════════════════════════
 * WORKLOAD & CAPACITY PHYSICS ENGINE
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Implements Section 11: "Employee count should be linked to workload"
 *
 * Calculates:
 * 1. Required Workload Units (WU/month) driven by active projects & factories.
 * 2. Effective Department Capacity (WU/month) combining rank productivities,
 *    specialization match, Principal Engineer force multipliers, HQ coordination,
 *    morale, and span-of-control penalties.
 * 3. Deficit / Surplus detection and actionable diagnostic recommendations.
 */

import { DepartmentAggregation, EmployeeRank, RANK_NAMES } from "./workforceTypes";

export interface ActiveProjectWorkloadInput {
  projectId: string;
  projectName: string;
  requiredMonthlyWU: number;
  targetSpecializationId: string;
}

export interface DepartmentCapacityResult {
  departmentId: string;
  baseHeadcountWU: number;
  effectiveCapacityWU: number;
  requiredDemandWU: number;
  utilizationPercentage: number;
  netDeficitOrSurplusWU: number; // positive = surplus, negative = deficit
  status: "CRITICAL_DEFICIT" | "UNDERSTAFFED" | "OPTIMAL" | "UNDERUTILIZED";
  forceMultiplierPrincipal: number; // e.g. 1.15x
  hqCoordinationMultiplier: number; // e.g. 1.05x
  spanPenaltyDampener: number;      // e.g. 0.05 (5% loss)
  recommendations: string[];
}

/**
 * Calculate the effective capacity of a department
 */
export function calculateDepartmentEffectiveCapacity(
  dept: DepartmentAggregation,
  hqCoordinationScore: number,
  specializationMatchAvg = 1.0
): DepartmentCapacityResult {
  // 1. Calculate raw headcount WU from rank distribution
  let rawWU = 0;
  for (const [rStr, count] of Object.entries(dept.headcountByRank)) {
    const rank = Number(rStr) as EmployeeRank;
    const prod = RANK_NAMES[rank].baseProductivity;
    rawWU += count * 180 * prod * (dept.averageOverallSkill / 100);
  }

  // 2. Principal Engineer Force Multiplier (Rank 5)
  // Each Principal engineer provides +8% force multiplier up to max +25%
  const principalCount = dept.headcountByRank[5] || 0;
  const forceMultiplierPrincipal = Number((1.0 + Math.min(0.25, principalCount * 0.08)).toFixed(2));

  // 3. HQ Coordination Multiplier (0.75x to 1.20x)
  const hqCoordinationMultiplier = Number((0.75 + (hqCoordinationScore / 100) * 0.40).toFixed(2));

  // 4. Morale Multiplier (0.70x to 1.15x)
  const moraleMultiplier = Number((0.70 + (dept.averageMorale / 100) * 0.45).toFixed(2));

  // 5. Span of Control Penalty
  const spanPenaltyDampener = dept.spanPenalty;

  // 6. Effective Output Formula
  const effectiveCapacityWU = Math.round(
    rawWU *
      specializationMatchAvg *
      forceMultiplierPrincipal *
      hqCoordinationMultiplier *
      moraleMultiplier *
      (1 - spanPenaltyDampener)
  );

  const demandWU = dept.monthlyWorkUnitsDemand;
  const util = effectiveCapacityWU > 0 ? Math.round((demandWU / effectiveCapacityWU) * 100) : 100;
  const netDeficitOrSurplus = effectiveCapacityWU - demandWU;

  let status: DepartmentCapacityResult["status"] = "OPTIMAL";
  const recommendations: string[] = [];

  if (util > 130) {
    status = "CRITICAL_DEFICIT";
    const neededWU = demandWU - effectiveCapacityWU;
    const approxEngineersNeeded = Math.ceil(neededWU / 180);
    recommendations.push(`Severe capacity deficit of ${neededWU.toLocaleString()} WU/month.`);
    recommendations.push(`Hire approximately ${approxEngineersNeeded} engineers or reduce active project scope.`);
    recommendations.push("High risk of chronic fatigue and catastrophic quality defects.");
  } else if (util > 100) {
    status = "UNDERSTAFFED";
    recommendations.push(`Department is over capacity (${util}% utilization). Projects may experience minor delays.`);
    recommendations.push("Consider promoting internal juniors or hiring specialist contractors.");
  } else if (util < 65) {
    status = "UNDERUTILIZED";
    recommendations.push(`Capacity surplus of ${netDeficitOrSurplus.toLocaleString()} WU/month (${util}% utilization).`);
    recommendations.push("Department can absorb additional vehicle or R&D development projects.");
  } else {
    status = "OPTIMAL";
    recommendations.push(`Operating at healthy ${util}% capacity utilization with minimal error risk.`);
  }

  if (spanPenaltyDampener > 0.08) {
    recommendations.push(`Management span exceeded (ratio ${dept.spanRatio}:1). Hire managers to restore coordination.`);
  }

  return {
    departmentId: dept.departmentId,
    baseHeadcountWU: Math.round(rawWU),
    effectiveCapacityWU,
    requiredDemandWU: demandWU,
    utilizationPercentage: util,
    netDeficitOrSurplusWU: netDeficitOrSurplus,
    status,
    forceMultiplierPrincipal,
    hqCoordinationMultiplier,
    spanPenaltyDampener,
    recommendations,
  };
}
