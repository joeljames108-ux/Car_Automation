import { describe, it, expect } from "vitest";
import {
  FacilityWorkloadAndFatigueEngine,
  FacilityWorkloadIntensity,
} from "../facilityWorkloadAndFatigue";
import { getStarting1970CampusHeadcount } from "../workforceCampusMapping";

describe("FacilityWorkloadAndFatigueEngine (Phase 6)", () => {
  it("evaluates standard 40h workweek with stable morale and zero CAD error penalty", () => {
    const report = FacilityWorkloadAndFatigueEngine.evaluateFacilityWorkload(
      "UNIT_02", // Powertrain & EV HQ
      "standard_40h",
      0,
      20,
      3600, // capacity
      3000, // demand
      4800  // avg salary
    );

    expect(report.facilityId).toBe("UNIT_02");
    expect(report.intensity).toBe("standard_40h");
    expect(report.speedMultiplier).toBe(1.0);
    expect(report.cadErrorRatePenaltyPct).toBe(0.0);
    expect(report.toleranceStackupRisk).toBe("NONE");
    expect(report.monthlyMoraleDelta).toBeGreaterThanOrEqual(1.0);
    expect(report.overtimeSurchargeMultiplier).toBe(1.0);
    expect(report.estimatedOvertimePayrollEur).toBe(0);
    expect(report.turnoverRiskPct).toBeLessThan(2.0);
  });

  it("applies 1.25x speed and CAD error penalty under 52h crunch mode", () => {
    const report = FacilityWorkloadAndFatigueEngine.evaluateFacilityWorkload(
      "UNIT_04", // Vehicle Design HQ
      "crunch_52h",
      2, // 2 consecutive months of crunch
      15,
      2700,
      3200, // over capacity
      5000
    );

    expect(report.intensity).toBe("crunch_52h");
    expect(report.speedMultiplier).toBe(1.25);
    expect(report.cadErrorRatePenaltyPct).toBeGreaterThanOrEqual(8.5);
    expect(report.toleranceStackupRisk).toBe("ELEVATED");
    expect(report.monthlyMoraleDelta).toBeLessThan(0); // morale drops
    expect(report.overtimeSurchargeMultiplier).toBe(1.30);
    expect(report.estimatedOvertimePayrollEur).toBe(Math.round(15 * 5000 * 0.30));
  });

  it("escalates to critical tolerance stackup and resignations under 65h death-march mode", () => {
    const report = FacilityWorkloadAndFatigueEngine.evaluateFacilityWorkload(
      "UNIT_05", // Chassis & Dynamics HQ
      "extreme_crunch_65h",
      3, // 3 months consecutive extreme crunch
      12,
      2160,
      3000,
      4500
    );

    expect(report.intensity).toBe("extreme_crunch_65h");
    expect(report.speedMultiplier).toBe(1.50);
    expect(report.cadErrorRatePenaltyPct).toBeGreaterThanOrEqual(24.0);
    expect(report.toleranceStackupRisk).toBe("CRITICAL");
    expect(report.fatigueIndex).toBeGreaterThan(80);
    expect(report.monthlyMoraleDelta).toBeLessThan(-15);
    expect(report.overtimeSurchargeMultiplier).toBe(1.70);
    expect(report.diagnostics.length).toBeGreaterThan(0);
  });

  it("rolls up campus-wide workload and overtime across all 14 units with 108 starter headcount", () => {
    const startingHeadcounts = getStarting1970CampusHeadcount();
    
    // Set UNIT_02 and UNIT_04 into crunch
    const policies = {
      UNIT_02: { facilityId: "UNIT_02", intensity: "crunch_52h" as FacilityWorkloadIntensity, consecutiveCrunchMonths: 1 },
      UNIT_04: { facilityId: "UNIT_04", intensity: "crunch_52h" as FacilityWorkloadIntensity, consecutiveCrunchMonths: 1 },
    };

    const capacities: Record<string, number> = {};
    const demands: Record<string, number> = {};
    for (const [unitId, count] of Object.entries(startingHeadcounts)) {
      capacities[unitId] = count * 180;
      demands[unitId] = count * 150;
    }

    const rollup = FacilityWorkloadAndFatigueEngine.evaluateCampusWorkloadRollup(
      policies,
      startingHeadcounts,
      capacities,
      demands
    );

    expect(rollup.totalHeadcount).toBe(108);
    expect(rollup.facilitiesInCrunch).toEqual(["UNIT_02", "UNIT_04"]);
    expect(rollup.totalOvertimePayrollEur).toBeGreaterThan(0);
    expect(Object.keys(rollup.facilityReports).length).toBe(14);
  });
});
