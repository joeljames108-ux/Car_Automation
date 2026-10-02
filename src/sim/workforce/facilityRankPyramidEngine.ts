/**
 * FACILITY RANK PYRAMID & SPAN OF CONTROL ENGINE
 * 
 * Features:
 * 1. 9-Tier Rank Structure (Trainees -> Specialists -> Principals -> Executives)
 * 2. Span of Control Health Evaluation (Subordinates per Manager)
 * 3. Facility Physical Desk Capacity Checking (Overcrowding drag)
 */

import { EmployeeRank } from "./workforceTypes";

export interface RankPyramidSummary {
  headcountByRank: Record<EmployeeRank, number>;
  totalHeadcount: number;
  totalSubordinatesCount: number; // R1 to R5
  totalManagementCount: number;   // R6 to R8
  spanOfControlRatio: number;
  spanHealthStatus: "optimal" | "overwhelmed_managers" | "top_heavy_bureaucracy";
  effectiveProductivityIndex: number;
  isOvercrowded: boolean;
  overcrowdingPenaltyPct: number;
}

export class FacilityRankPyramidEngine {
  /**
   * Evaluates the organizational health of a facility's rank distribution
   */
  public static evaluateFacilityPyramid(
    headcountByRank: Record<EmployeeRank, number>,
    facilityMaxDeskCapacity: number
  ): RankPyramidSummary {
    const totalHeadcount = Object.values(headcountByRank).reduce((a, b) => a + b, 0);

    const totalSubordinatesCount =
      (headcountByRank[1] || 0) +
      (headcountByRank[2] || 0) +
      (headcountByRank[3] || 0) +
      (headcountByRank[4] || 0) +
      (headcountByRank[5] || 0);

    const totalManagementCount =
      (headcountByRank[6] || 0) +
      (headcountByRank[7] || 0) +
      (headcountByRank[8] || 0);

    let spanOfControlRatio = totalManagementCount > 0
      ? Math.round((totalSubordinatesCount / totalManagementCount) * 10) / 10
      : totalSubordinatesCount;

    let spanHealthStatus: "optimal" | "overwhelmed_managers" | "top_heavy_bureaucracy" = "optimal";
    if (totalManagementCount === 0 && totalSubordinatesCount > 5) {
      spanHealthStatus = "overwhelmed_managers";
    } else if (spanOfControlRatio > 8.5) {
      spanHealthStatus = "overwhelmed_managers";
    } else if (spanOfControlRatio < 3.0 && totalHeadcount > 6) {
      spanHealthStatus = "top_heavy_bureaucracy";
    } else {
      spanHealthStatus = "optimal";
    }

    // Overcrowding evaluation
    const isOvercrowded = totalHeadcount > facilityMaxDeskCapacity;
    let overcrowdingPenaltyPct = 0;
    if (isOvercrowded) {
      const overage = totalHeadcount - facilityMaxDeskCapacity;
      overcrowdingPenaltyPct = Math.min(30, Math.round((overage / facilityMaxDeskCapacity) * 40));
    }

    // Productivity weights
    const rankProductivities: Record<EmployeeRank, number> = {
      1: 0.35,
      2: 0.60,
      3: 1.00,
      4: 1.30,
      5: 1.60,
      6: 0.50, // Management coordinates rather than drafting directly
      7: 0.25,
      8: 0.10,
      9: 0.05,
    };

    let weightedProductivity = 0;
    for (let r = 1; r <= 9; r++) {
      const count = headcountByRank[r as EmployeeRank] || 0;
      weightedProductivity += count * rankProductivities[r as EmployeeRank];
    }

    let spanMultiplier = 1.0;
    if (spanHealthStatus === "overwhelmed_managers") spanMultiplier = 0.88;
    if (spanHealthStatus === "top_heavy_bureaucracy") spanMultiplier = 0.92;

    const deskMultiplier = 1.0 - (overcrowdingPenaltyPct / 100);
    const effectiveProductivityIndex = Math.round(weightedProductivity * spanMultiplier * deskMultiplier * 10) / 10;

    return {
      headcountByRank,
      totalHeadcount,
      totalSubordinatesCount,
      totalManagementCount,
      spanOfControlRatio,
      spanHealthStatus,
      effectiveProductivityIndex,
      isOvercrowded,
      overcrowdingPenaltyPct,
    };
  }
}
