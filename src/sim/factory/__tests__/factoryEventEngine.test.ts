/**
 * ═══════════════════════════════════════════════════════════════════════
 * FACTORY EVENT ENGINE — UNIT TESTS
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Tests for Phase 1 mechanics:
 * 1. Random breakdown probability rolls
 * 2. Changeover detection and penalty enforcement
 * 3. Changeover progress ticking
 */

import { describe, it, expect } from "vitest";
import {
  evaluateBreakdownRisk,
  checkChangeoverRequired,
  tickChangeoverProgress,
  applyChangeoverToLine,
} from "../factoryEventEngine";
import { AssemblyLine } from "../factoryTypes";

// ─────────────────────────────────────────────────────────────
//  Helper: Create a minimal test assembly line
// ─────────────────────────────────────────────────────────────
function createTestLine(overrides: Partial<AssemblyLine> = {}): AssemblyLine {
  return {
    id: "line_test_01",
    name: "Test Assembly Line 1",
    type: "FINAL_ASSEMBLY",
    level: 2,
    status: "PRODUCING",
    operatingHoursPerDay: 8,
    shiftsPerDay: 2,
    operatingDaysPerWeek: 5,
    efficiencyPct: 85,
    cycleTimeMinutes: 20,
    dailyCapacityUnits: 40,
    monthlyCapacityUnits: 866,
    reservedSlots: [],
    monthlyOperatingHoursAvailable: 294,
    monthlyOperatingHoursReserved: 0,
    monthlyOperatingHoursFree: 294,
    utilizationPct: 0,
    maxVehicleWeightKg: 2800,
    supportedPlatforms: ["monocoque_sedan", "tubular_gt"],
    changeoverTimeDays: 2,
    lastMaintenanceDate: "1970-01-01",
    nextScheduledMaintenance: "1970-04-01",
    maintenanceIntervalDays: 90,
    breakdownRiskPct: 5,
    assignedWorkersCount: 50,
    minWorkersRequired: 40,
    monthlyOperatingCostUSD: 60000,
    upgradeCostUSD: 350000,
    ...overrides,
  };
}

// ─────────────────────────────────────────────────────────────
//  1. BREAKDOWN TESTS
// ─────────────────────────────────────────────────────────────
describe("evaluateBreakdownRisk", () => {
  it("returns no breakdown when line is not PRODUCING", () => {
    const idleLine = createTestLine({ status: "IDLE", breakdownRiskPct: 50 });
    const result = evaluateBreakdownRisk(idleLine, 0); // Roll of 0 would otherwise always trigger
    expect(result.didBreakdown).toBe(false);
  });

  it("returns no breakdown when roll is above risk threshold", () => {
    const line = createTestLine({ breakdownRiskPct: 10 });
    // Roll of 50 is well above the 10% risk
    const result = evaluateBreakdownRisk(line, 50);
    expect(result.didBreakdown).toBe(false);
    expect(result.repairCostUSD).toBe(0);
  });

  it("triggers breakdown when roll is below risk threshold", () => {
    const line = createTestLine({ breakdownRiskPct: 15 });
    // Roll of 5 is below the 15% risk
    const result = evaluateBreakdownRisk(line, 5);
    expect(result.didBreakdown).toBe(true);
    expect(result.repairCostUSD).toBeGreaterThan(0);
    expect(result.emergencyDowntimeDays).toBeGreaterThanOrEqual(3);
    expect(result.emergencyDowntimeDays).toBeLessThanOrEqual(5);
  });

  it("calculates emergency repair cost at 2.5× preventive cost", () => {
    const line = createTestLine({ monthlyOperatingCostUSD: 100000, breakdownRiskPct: 20 });
    const result = evaluateBreakdownRisk(line, 1);
    // Preventive = 100000 * 0.15 = 15000; Emergency = 15000 * 2.5 = 37500
    expect(result.repairCostUSD).toBe(37500);
  });

  it("assigns 3-day downtime for low risk breakdowns", () => {
    const line = createTestLine({ breakdownRiskPct: 8 });
    const result = evaluateBreakdownRisk(line, 1);
    expect(result.emergencyDowntimeDays).toBe(3);
  });

  it("assigns 4-day downtime for moderate risk breakdowns", () => {
    const line = createTestLine({ breakdownRiskPct: 15 });
    const result = evaluateBreakdownRisk(line, 1);
    expect(result.emergencyDowntimeDays).toBe(4);
  });

  it("assigns 5-day downtime for high risk breakdowns", () => {
    const line = createTestLine({ breakdownRiskPct: 30 });
    const result = evaluateBreakdownRisk(line, 1);
    expect(result.emergencyDowntimeDays).toBe(5);
  });

  it("identifies the paused slot when a breakdown occurs", () => {
    const line = createTestLine({
      breakdownRiskPct: 50,
      reservedSlots: [
        {
          id: "slot_test_001",
          lineId: "line_test_01",
          vehicleModelId: "sedan_v1",
          vehicleModelName: "Touring Sedan Mark I",
          startDate: "1970-01-05",
          endDate: "1970-02-15",
          totalProductionDays: 30,
          elapsedDays: 10,
          targetUnits: 100,
          producedUnits: 33,
          dailyRate: 3,
          unitCycleTimeMinutes: 20,
          unitBOMCostUSD: 1200,
          unitLaborCostUSD: 400,
          totalCostUSD: 160000,
          status: "IN_PROGRESS",
          priority: 2,
        },
      ],
    });
    const result = evaluateBreakdownRisk(line, 1);
    expect(result.didBreakdown).toBe(true);
    expect(result.pausedSlotId).toBe("slot_test_001");
    expect(result.pausedSlotVehicleName).toBe("Touring Sedan Mark I");
  });

  it("never triggers at 0% breakdown risk", () => {
    const line = createTestLine({ breakdownRiskPct: 0 });
    // Even with roll of 0, 0 >= 0 is true, so no breakdown
    const result = evaluateBreakdownRisk(line, 0);
    expect(result.didBreakdown).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────
//  2. CHANGEOVER DETECTION TESTS
// ─────────────────────────────────────────────────────────────
describe("checkChangeoverRequired", () => {
  it("requires no changeover for first-ever job (no currentVehicleModelId)", () => {
    const line = createTestLine({ currentVehicleModelId: undefined });
    const result = checkChangeoverRequired(line, "sedan_v1");
    expect(result.requiresChangeover).toBe(false);
    expect(result.changeoverDays).toBe(0);
  });

  it("requires no changeover when scheduling same model", () => {
    const line = createTestLine({ currentVehicleModelId: "sedan_v1" });
    const result = checkChangeoverRequired(line, "sedan_v1");
    expect(result.requiresChangeover).toBe(false);
  });

  it("requires changeover when switching to a different model", () => {
    const line = createTestLine({
      currentVehicleModelId: "sedan_v1",
      changeoverTimeDays: 2,
    });
    const result = checkChangeoverRequired(line, "gt_coupe_v2");
    expect(result.requiresChangeover).toBe(true);
    expect(result.changeoverDays).toBe(2);
    expect(result.changeoverCostUSD).toBeGreaterThan(0);
  });

  it("calculates changeover cost scaled by line level", () => {
    const lineL1 = createTestLine({ currentVehicleModelId: "a", changeoverTimeDays: 2, level: 1 });
    const lineL3 = createTestLine({ currentVehicleModelId: "a", changeoverTimeDays: 2, level: 3 });

    const costL1 = checkChangeoverRequired(lineL1, "b").changeoverCostUSD;
    const costL3 = checkChangeoverRequired(lineL3, "b").changeoverCostUSD;

    // Level 3 should be more expensive due to more complex tooling
    expect(costL3).toBeGreaterThan(costL1);
  });

  it("applies 50% changeover time reduction for FLEXIBLE lines", () => {
    const flexLine = createTestLine({
      type: "FLEXIBLE",
      currentVehicleModelId: "sedan_v1",
      changeoverTimeDays: 4,
    });
    const result = checkChangeoverRequired(flexLine, "gt_coupe_v2");
    expect(result.requiresChangeover).toBe(true);
    expect(result.changeoverDays).toBe(2); // 4 * 0.5 = 2
  });

  it("ensures minimum 1-day changeover for FLEXIBLE lines", () => {
    const flexLine = createTestLine({
      type: "FLEXIBLE",
      currentVehicleModelId: "sedan_v1",
      changeoverTimeDays: 1,
    });
    const result = checkChangeoverRequired(flexLine, "gt_coupe_v2");
    expect(result.requiresChangeover).toBe(true);
    expect(result.changeoverDays).toBe(1); // ceil(1 * 0.5) = 1
  });

  it("requires no changeover when changeoverTimeDays is 0", () => {
    const line = createTestLine({
      currentVehicleModelId: "sedan_v1",
      changeoverTimeDays: 0,
    });
    const result = checkChangeoverRequired(line, "gt_coupe_v2");
    expect(result.requiresChangeover).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────
//  3. CHANGEOVER PROGRESS TESTS
// ─────────────────────────────────────────────────────────────
describe("tickChangeoverProgress", () => {
  it("does nothing for non-CHANGEOVER lines", () => {
    const line = createTestLine({ status: "PRODUCING" });
    const { updatedLine, completed } = tickChangeoverProgress(line, 1);
    expect(completed).toBe(false);
    expect(updatedLine.status).toBe("PRODUCING");
  });

  it("decrements changeover days remaining", () => {
    const line = createTestLine({
      status: "CHANGEOVER",
      changeoverDaysRemaining: 3,
      changeoverTargetModelId: "gt_coupe_v2",
    });
    const { updatedLine, completed } = tickChangeoverProgress(line, 1);
    expect(completed).toBe(false);
    expect(updatedLine.changeoverDaysRemaining).toBe(2);
    expect(updatedLine.status).toBe("CHANGEOVER");
  });

  it("completes changeover and transitions to IDLE", () => {
    const line = createTestLine({
      status: "CHANGEOVER",
      changeoverDaysRemaining: 1,
      changeoverTargetModelId: "gt_coupe_v2",
      currentVehicleModelId: "sedan_v1",
    });
    const { updatedLine, completed } = tickChangeoverProgress(line, 1);
    expect(completed).toBe(true);
    expect(updatedLine.status).toBe("IDLE");
    expect(updatedLine.currentVehicleModelId).toBe("gt_coupe_v2");
    expect(updatedLine.changeoverDaysRemaining).toBeUndefined();
    expect(updatedLine.changeoverTargetModelId).toBeUndefined();
  });

  it("handles multi-day elapsed completing changeover", () => {
    const line = createTestLine({
      status: "CHANGEOVER",
      changeoverDaysRemaining: 2,
      changeoverTargetModelId: "suv_v1",
    });
    const { updatedLine, completed } = tickChangeoverProgress(line, 5);
    expect(completed).toBe(true);
    expect(updatedLine.status).toBe("IDLE");
    expect(updatedLine.currentVehicleModelId).toBe("suv_v1");
  });
});

// ─────────────────────────────────────────────────────────────
//  4. APPLY CHANGEOVER TESTS
// ─────────────────────────────────────────────────────────────
describe("applyChangeoverToLine", () => {
  it("sets CHANGEOVER status with correct fields", () => {
    const line = createTestLine({ status: "IDLE" });
    const result = applyChangeoverToLine(line, 3, "roadster_v1");
    expect(result.status).toBe("CHANGEOVER");
    expect(result.changeoverDaysRemaining).toBe(3);
    expect(result.changeoverTargetModelId).toBe("roadster_v1");
  });
});
