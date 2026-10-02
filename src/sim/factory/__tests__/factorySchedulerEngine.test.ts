import { describe, it, expect } from "vitest";
import {
  calculateCompletionDate,
  doSlotsOverlap,
  validateAndCreateSlot,
  generateMonthlyGanttView,
} from "../factorySchedulerEngine";
import { AssemblyLine } from "../factoryTypes";

describe("Factory Production Scheduler Engine", () => {
  const mockLine: AssemblyLine = {
    id: "test_line_alpha",
    name: "Alpha Conveyor",
    type: "FINAL_ASSEMBLY",
    level: 2,
    status: "IDLE",
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
    maxVehicleWeightKg: 3000,
    supportedPlatforms: ["monocoque_sedan"],
    changeoverTimeDays: 1,
    lastMaintenanceDate: "1970-01-01",
    nextScheduledMaintenance: "1970-04-01",
    maintenanceIntervalDays: 90,
    breakdownRiskPct: 3,
    assignedWorkersCount: 50,
    minWorkersRequired: 40,
    monthlyOperatingCostUSD: 50000,
    upgradeCostUSD: 200000,
  };

  it("calculates completion date accurately skipping weekends for 5-day lines", () => {
    // 1970-01-02 was Friday. 3 operational days required.
    // Day 1: Mon Jan 5
    // Day 2: Tue Jan 6
    // Day 3: Wed Jan 7
    const endDate = calculateCompletionDate("1970-01-02", 3, 5);
    expect(endDate).toBe("1970-01-07");
  });

  it("detects date range overlaps correctly", () => {
    // Overlapping
    expect(doSlotsOverlap("1970-01-05", "1970-01-15", "1970-01-10", "1970-01-20")).toBe(true);
    expect(doSlotsOverlap("1970-01-05", "1970-01-15", "1970-01-15", "1970-01-25")).toBe(true);

    // Non-overlapping
    expect(doSlotsOverlap("1970-01-05", "1970-01-09", "1970-01-10", "1970-01-20")).toBe(false);
  });

  it("validates and creates slot without conflict", () => {
    const res = validateAndCreateSlot(mockLine, {
      lineId: mockLine.id,
      vehicleModelId: "sedan_gt",
      vehicleModelName: "Grand Touring Sedan",
      startDateStr: "1970-01-05",
      targetUnits: 120, // 120 units / 40 per day = 3 operational days
      unitBOMCostUSD: 1800,
      unitLaborCostUSD: 600,
    });

    expect(res.success).toBe(true);
    expect(res.slot).toBeDefined();
    expect(res.slot?.targetUnits).toBe(120);
    expect(res.slot?.totalProductionDays).toBe(3);
  });

  it("detects schedule conflict when another slot occupies the same date window", () => {
    const lineWithSlot: AssemblyLine = {
      ...mockLine,
      reservedSlots: [
        {
          id: "existing_slot",
          lineId: mockLine.id,
          vehicleModelId: "sedan_base",
          vehicleModelName: "Base Coupe",
          startDate: "1970-01-05",
          endDate: "1970-01-12",
          totalProductionDays: 5,
          elapsedDays: 0,
          targetUnits: 200,
          producedUnits: 0,
          dailyRate: 40,
          unitCycleTimeMinutes: 20,
          unitBOMCostUSD: 1500,
          unitLaborCostUSD: 500,
          totalCostUSD: 400000,
          status: "SCHEDULED",
          priority: 2,
        },
      ],
    };

    const conflictRes = validateAndCreateSlot(lineWithSlot, {
      lineId: mockLine.id,
      vehicleModelId: "new_order",
      vehicleModelName: "New Order",
      startDateStr: "1970-01-07",
      targetUnits: 80,
      unitBOMCostUSD: 1500,
      unitLaborCostUSD: 500,
    });

    expect(conflictRes.success).toBe(false);
    expect(conflictRes.conflictReason).toBeDefined();
    expect(conflictRes.suggestedStartDate).toBe("1970-01-12");
  });

  it("generates a monthly Gantt view with proper day cells and row mapping", () => {
    const gantt = generateMonthlyGanttView([mockLine], 1970, 1);
    expect(gantt.daysInMonth).toBe(31);
    expect(gantt.monthName).toBe("January");
    expect(gantt.rows.length).toBe(1);
    expect(gantt.rows[0].days.length).toBe(31);
  });
});
