import { describe, it, expect } from "vitest";
import {
  FacilityRankPyramidEngine,
} from "../facilityRankPyramidEngine";
import { EmployeeRank } from "../workforceTypes";

describe("Facility Rank Pyramid & Span of Control Engine", () => {
  it("should evaluate a balanced department with healthy span of control", () => {
    // 20 staff: 1 R1, 5 R2, 6 R3, 4 R4, 2 R5 (18 subordinates) + 2 R6 Managers
    const balancedHeadcount: Record<EmployeeRank, number> = {
      1: 1, 2: 5, 3: 6, 4: 4, 5: 2, 6: 2, 7: 0, 8: 0, 9: 0,
    };

    const result = FacilityRankPyramidEngine.evaluateFacilityPyramid(balancedHeadcount, 30);
    expect(result.totalHeadcount).toBe(20);
    expect(result.totalSubordinatesCount).toBe(18);
    expect(result.totalManagementCount).toBe(2);
    expect(result.spanOfControlRatio).toBe(9.0); // 18 / 2
    expect(result.isOvercrowded).toBe(false);
    expect(result.effectiveProductivityIndex).toBeGreaterThan(15);
  });

  it("should flag overwhelmed managers when 25 subordinates report to zero or one manager", () => {
    const overwhelmed: Record<EmployeeRank, number> = {
      1: 5, 2: 8, 3: 8, 4: 3, 5: 1, 6: 1, 7: 0, 8: 0, 9: 0,
    };

    const result = FacilityRankPyramidEngine.evaluateFacilityPyramid(overwhelmed, 30);
    expect(result.spanHealthStatus).toBe("overwhelmed_managers");
    expect(result.spanOfControlRatio).toBe(25);
  });

  it("should flag top-heavy bureaucracy when managers exceed healthy ratio", () => {
    const topHeavy: Record<EmployeeRank, number> = {
      1: 0, 2: 1, 3: 2, 4: 1, 5: 0, 6: 3, 7: 2, 8: 1, 9: 0,
    };

    const result = FacilityRankPyramidEngine.evaluateFacilityPyramid(topHeavy, 20);
    expect(result.spanHealthStatus).toBe("top_heavy_bureaucracy");
    expect(result.spanOfControlRatio).toBeLessThan(1.5);
  });

  it("should penalize productivity when facility staff exceeds physical desk capacity", () => {
    const overcrowded: Record<EmployeeRank, number> = {
      1: 2, 2: 6, 3: 10, 4: 5, 5: 2, 6: 3, 7: 0, 8: 0, 9: 0,
    }; // 28 staff in a 20-desk building

    const result = FacilityRankPyramidEngine.evaluateFacilityPyramid(overcrowded, 20);
    expect(result.isOvercrowded).toBe(true);
    expect(result.overcrowdingPenaltyPct).toBeGreaterThan(10);
  });
});
