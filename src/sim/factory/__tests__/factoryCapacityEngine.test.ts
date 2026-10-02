import { describe, it, expect, beforeEach } from "vitest";
import {
  computeLineCapacity,
  computeLineUtilization,
  computeFactoryFloorSummary,
  checkSlotFeasibility,
  createInitialAssemblyLines,
} from "../factoryCapacityEngine";
import { AssemblyLine, ProductionSlot } from "../factoryTypes";

describe("Factory Capacity & Line Solvers", () => {
  const samplePilotLine: AssemblyLine = {
    id: "test_line_01",
    name: "Test Pilot Line",
    type: "FLEXIBLE",
    level: 1,
    status: "IDLE",
    operatingHoursPerDay: 8,
    shiftsPerDay: 1,
    operatingDaysPerWeek: 5,
    efficiencyPct: 75,
    cycleTimeMinutes: 45,
    dailyCapacityUnits: 0,
    monthlyCapacityUnits: 0,
    reservedSlots: [],
    monthlyOperatingHoursAvailable: 0,
    monthlyOperatingHoursReserved: 0,
    monthlyOperatingHoursFree: 0,
    utilizationPct: 0,
    maxVehicleWeightKg: 2500,
    supportedPlatforms: ["monocoque_sedan", "tubular_gt"],
    changeoverTimeDays: 1,
    lastMaintenanceDate: "1970-01-01",
    nextScheduledMaintenance: "1970-04-01",
    maintenanceIntervalDays: 90,
    breakdownRiskPct: 5,
    assignedWorkersCount: 25,
    minWorkersRequired: 20,
    monthlyOperatingCostUSD: 25000,
    upgradeCostUSD: 100000,
  };

  it("calculates realistic time-based capacity for a single-shift line", () => {
    // 8 hours * 1 shift * 75% efficiency = 6 effective hours = 360 mins
    // 360 mins / 45 min cycle time = 8 cars/day
    // 8 * (5 * 4.333) = ~173 cars/month
    const capacity = computeLineCapacity(samplePilotLine);
    expect(capacity.dailyCapacity).toBe(8);
    expect(capacity.monthlyCapacity).toBeGreaterThan(160);
    expect(capacity.monthlyCapacity).toBeLessThan(180);
    expect(capacity.effectiveWorkingHoursPerDay).toBe(6);
    expect(capacity.cycleTimeMinutes).toBe(45);
  });

  it("scales capacity accurately with 3 continuous shifts and higher robotics", () => {
    const highVolumeLine: AssemblyLine = {
      ...samplePilotLine,
      shiftsPerDay: 3,
      operatingDaysPerWeek: 6,
      efficiencyPct: 90,
      cycleTimeMinutes: 10,
    };

    // 24 gross hours * 90% = 21.6 effective hours/day = 1296 mins
    // 1296 / 10 = 129 units/day
    // 129 * (6 * 4.333) = ~3353 units/month
    const capacity = computeLineCapacity(highVolumeLine);
    expect(capacity.dailyCapacity).toBe(129);
    expect(capacity.weeklyCapacity).toBe(129 * 6);
    expect(capacity.monthlyCapacity).toBeGreaterThan(3300);
  });

  it("computes accurate line utilization based on reserved slots", () => {
    const slot1: ProductionSlot = {
      id: "slot_01",
      lineId: samplePilotLine.id,
      vehicleModelId: "sedan_v1",
      vehicleModelName: "Sedan Standard",
      startDate: "1970-01-01",
      endDate: "1970-01-20",
      totalProductionDays: 20,
      elapsedDays: 0,
      targetUnits: 40,
      producedUnits: 0,
      dailyRate: 8,
      unitCycleTimeMinutes: 45,
      unitBOMCostUSD: 1200,
      unitLaborCostUSD: 400,
      totalCostUSD: 64000,
      status: "IN_PROGRESS",
      priority: 1,
    };

    // 40 units * 45 mins = 1800 mins = 30 hours
    // Effective monthly hours = 6 hours * (5 * 4.333) = 130 hours
    const utilization = computeLineUtilization(
      { ...samplePilotLine, reservedSlots: [slot1] },
      130
    );

    expect(utilization.reservedHours).toBe(30);
    expect(utilization.freeHours).toBe(100);
    expect(utilization.utilizationPct).toBe(23); // 30 / 130 = 23%
  });

  it("identifies feasibility bottlenecks correctly", () => {
    // 1. Working capital shortfall
    const capitalCheck = checkSlotFeasibility(
      {
        vehicleModelId: "gt_sports",
        vehicleWeightKg: 1400,
        targetUnits: 100,
        targetDays: 25,
        dailyRateRequired: 4,
        unitBOMCostUSD: 3000,
        unitLaborCostUSD: 1000,
        availableCashUSD: 50000, // Needs 400k
        availableWorkers: 30,
      },
      [samplePilotLine]
    );

    expect(capitalCheck.isFeasible).toBe(false);
    expect(capitalCheck.bottlenecks.cashShortage).toBeDefined();

    // 2. Weight limit incompatibility
    const weightCheck = checkSlotFeasibility(
      {
        vehicleModelId: "heavy_armored_limo",
        vehicleWeightKg: 3800, // Max on line is 2500
        targetUnits: 10,
        targetDays: 10,
        dailyRateRequired: 1,
        unitBOMCostUSD: 2000,
        unitLaborCostUSD: 1000,
        availableCashUSD: 500000,
        availableWorkers: 30,
      },
      [samplePilotLine]
    );

    expect(weightCheck.isFeasible).toBe(false);
    expect(weightCheck.bottlenecks.platformIncompatible).toBeDefined();

    // 3. Fully feasible order
    const validCheck = checkSlotFeasibility(
      {
        vehicleModelId: "standard_sedan",
        vehicleWeightKg: 1350,
        targetUnits: 30,
        targetDays: 10,
        dailyRateRequired: 3,
        unitBOMCostUSD: 1500,
        unitLaborCostUSD: 500,
        availableCashUSD: 200000,
        availableWorkers: 30,
      },
      [samplePilotLine]
    );

    expect(validCheck.isFeasible).toBe(true);
    expect(validCheck.recommendedLineId).toBe(samplePilotLine.id);
  });

  it("aggregates the factory floor summary accurately across multiple lines", () => {
    const lines = createInitialAssemblyLines(2);
    expect(lines.length).toBe(2);

    const summary = computeFactoryFloorSummary(lines, 2, "operational_owned", "Oakville Assembly");
    expect(summary.totalLinesCount).toBe(2);
    expect(summary.totalMonthlyCapacityUnits).toBeGreaterThan(1500);
    expect(summary.totalFactoryWorkersAssigned).toBe(105);
    expect(summary.totalMonthlyCostUSD).toBeGreaterThan(100000);
  });
});
