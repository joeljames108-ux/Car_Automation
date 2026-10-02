/**
 * ═══════════════════════════════════════════════════════════════════════
 * FACTORY CAPACITY & PRODUCTION SOLVER ENGINE
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Provides pure mathematical functions for:
 * 1. Time-based capacity calculation (hours -> cycle time -> units)
 * 2. Utilization and scheduling load metrics
 * 3. Multi-constraint feasibility analysis for production slots
 * 4. Automated line recommendations
 * 5. Initial factory floor seeding across progression tiers
 */

import {
  AssemblyLine,
  FactoryFloorSummary,
  FeasibilityCheckInput,
  FeasibilityCheckResult,
  LineCapacityBreakdown,
  LineType,
  ProductionSlot,
} from "./factoryTypes";

/**
 * Calculates accurate time-based capacity metrics for an individual assembly line.
 * Formula:
 *   Gross Daily Hours = Operating Hours × Shifts
 *   Net Daily Hours   = Gross Daily Hours × Efficiency
 *   Daily Units       = Net Minutes ÷ Cycle Time Minutes
 *   Monthly Units     = Daily Units × (Days/Week × 4.333)
 */
export function computeLineCapacity(line: AssemblyLine): LineCapacityBreakdown {
  const grossHoursPerDay = line.operatingHoursPerDay * line.shiftsPerDay;
  const efficiencyMultiplier = Math.max(0.1, Math.min(1.0, line.efficiencyPct / 100));
  const effectiveWorkingHoursPerDay = grossHoursPerDay * efficiencyMultiplier;
  const effectiveMinutesPerDay = effectiveWorkingHoursPerDay * 60;

  const skillMultiplier = line.workforceSkill?.effectiveCycleMultiplier ?? 1.0;
  const cycleTime = Math.max(1, Math.round(line.cycleTimeMinutes * skillMultiplier * 10) / 10);
  const dailyCapacity = Math.floor(effectiveMinutesPerDay / cycleTime);
  const weeklyCapacity = dailyCapacity * line.operatingDaysPerWeek;
  const daysPerMonth = line.operatingDaysPerWeek * 4.333;
  const monthlyCapacity = Math.floor(dailyCapacity * daysPerMonth);
  const effectiveMonthlyHours = effectiveWorkingHoursPerDay * daysPerMonth;

  return {
    dailyCapacity,
    weeklyCapacity,
    monthlyCapacity,
    effectiveWorkingHoursPerDay: Math.round(effectiveWorkingHoursPerDay * 10) / 10,
    effectiveMonthlyHours: Math.round(effectiveMonthlyHours * 10) / 10,
    cycleTimeMinutes: cycleTime,
  };
}

/**
 * Calculates current month's reserved hours vs available hours for a line.
 */
export function computeLineUtilization(
  line: AssemblyLine,
  effectiveMonthlyHours: number
): {
  reservedHours: number;
  freeHours: number;
  utilizationPct: number;
} {
  // Sum hours allocated to active or scheduled slots
  const activeOrScheduledSlots = (line.reservedSlots || []).filter(
    (s) => s.status === "IN_PROGRESS" || s.status === "SCHEDULED"
  );

  let reservedHours = 0;
  for (const slot of activeOrScheduledSlots) {
    // Total production hours required = (targetUnits * unitCycleTimeMinutes) / 60
    const totalJobHours = (slot.targetUnits * Math.max(1, slot.unitCycleTimeMinutes)) / 60;
    // Monthly proportion: if job spans across multiple months, take remaining
    const remainingUnits = Math.max(0, slot.targetUnits - slot.producedUnits);
    const remainingHours = (remainingUnits * Math.max(1, slot.unitCycleTimeMinutes)) / 60;
    reservedHours += remainingHours;
  }

  const freeHours = Math.max(0, effectiveMonthlyHours - reservedHours);
  const utilizationPct =
    effectiveMonthlyHours > 0
      ? Math.min(100, Math.round((reservedHours / effectiveMonthlyHours) * 100))
      : 0;

  return {
    reservedHours: Math.round(reservedHours * 10) / 10,
    freeHours: Math.round(freeHours * 10) / 10,
    utilizationPct,
  };
}

/**
 * Aggregates all lines on the factory floor into an overarching management summary.
 */
export function computeFactoryFloorSummary(
  lines: AssemblyLine[],
  factoryLevel: number,
  ownershipStatus: "no_factory_outsourced" | "land_acquired" | "under_construction" | "operational_owned",
  factoryName = "Main Automotive Manufacturing Plant"
): FactoryFloorSummary {
  let totalMonthlyCapacityUnits = 0;
  let usedMonthlyCapacityUnits = 0;
  let totalMonthlyOperatingHours = 0;
  let reservedMonthlyOperatingHours = 0;

  let activeLinesCount = 0;
  let idleLinesCount = 0;
  let maintenanceLinesCount = 0;

  let totalWorkersAssigned = 0;
  let totalWorkersRequired = 0;
  let monthlyLineOperatingCostUSD = 0;

  let activeJobsCount = 0;
  let totalUnitsInProduction = 0;
  let completedUnitsThisMonth = 0;

  for (const line of lines) {
    const capacity = computeLineCapacity(line);
    const utilization = computeLineUtilization(line, capacity.effectiveMonthlyHours);

    totalMonthlyCapacityUnits += capacity.monthlyCapacity;
    const lineUsedUnits = Math.round(capacity.monthlyCapacity * (utilization.utilizationPct / 100));
    usedMonthlyCapacityUnits += lineUsedUnits;

    totalMonthlyOperatingHours += capacity.effectiveMonthlyHours;
    reservedMonthlyOperatingHours += utilization.reservedHours;

    if (line.status === "PRODUCING") activeLinesCount++;
    else if (line.status === "IDLE") idleLinesCount++;
    else if (line.status === "MAINTENANCE" || line.status === "UPGRADING") maintenanceLinesCount++;

    totalWorkersAssigned += line.assignedWorkersCount;
    totalWorkersRequired += line.minWorkersRequired;
    monthlyLineOperatingCostUSD += line.monthlyOperatingCostUSD;

    for (const slot of line.reservedSlots || []) {
      if (slot.status === "IN_PROGRESS") {
        activeJobsCount++;
        totalUnitsInProduction += Math.max(0, slot.targetUnits - slot.producedUnits);
      } else if (slot.status === "COMPLETED") {
        completedUnitsThisMonth += slot.producedUnits;
      }
    }
  }

  const availableMonthlyCapacityUnits = Math.max(0, totalMonthlyCapacityUnits - usedMonthlyCapacityUnits);
  const overallUtilizationPct =
    totalMonthlyCapacityUnits > 0
      ? Math.min(100, Math.round((usedMonthlyCapacityUnits / totalMonthlyCapacityUnits) * 100))
      : 0;

  const availableMonthlyOperatingHours = Math.max(
    0,
    totalMonthlyOperatingHours - reservedMonthlyOperatingHours
  );

  const staffingHealthPct =
    totalWorkersRequired > 0
      ? Math.min(100, Math.round((totalWorkersAssigned / totalWorkersRequired) * 100))
      : 100;

  const monthlyFixedOverheadUSD = factoryLevel * 45000;
  const totalMonthlyCostUSD = monthlyFixedOverheadUSD + monthlyLineOperatingCostUSD;

  return {
    factoryId: "factory_main_floor",
    factoryName,
    factoryLevel,
    ownershipStatus,
    totalLinesCount: lines.length,
    activeLinesCount,
    idleLinesCount,
    maintenanceLinesCount,
    totalMonthlyCapacityUnits,
    usedMonthlyCapacityUnits,
    availableMonthlyCapacityUnits,
    overallUtilizationPct,
    totalMonthlyOperatingHours: Math.round(totalMonthlyOperatingHours),
    reservedMonthlyOperatingHours: Math.round(reservedMonthlyOperatingHours),
    availableMonthlyOperatingHours: Math.round(availableMonthlyOperatingHours),
    totalFactoryWorkersAssigned: totalWorkersAssigned,
    totalFactoryWorkersRequired: totalWorkersRequired,
    staffingHealthPct,
    monthlyFixedOverheadUSD,
    monthlyLineOperatingCostUSD,
    totalMonthlyCostUSD,
    activeJobsCount,
    totalUnitsInProduction,
    completedUnitsThisMonth,
  };
}

/**
 * Validates whether a proposed production run fits within factory constraints.
 */
export function checkSlotFeasibility(
  input: FeasibilityCheckInput,
  lines: AssemblyLine[]
): FeasibilityCheckResult {
  const bottlenecks: FeasibilityCheckResult["bottlenecks"] = {};
  const totalEstimatedCost = (input.unitBOMCostUSD + input.unitLaborCostUSD) * input.targetUnits;

  // 1. Financial Capital Check
  if (input.availableCashUSD < totalEstimatedCost) {
    const deficit = totalEstimatedCost - input.availableCashUSD;
    bottlenecks.cashShortage = `Working capital shortfall: Requires $${totalEstimatedCost.toLocaleString()} (Deficit: -$${deficit.toLocaleString()})`;
  }

  // 2. Compatible Lines Check
  const compatibleLines = lines.filter((l) => {
    if (l.status === "OFFLINE" || l.status === "UPGRADING") return false;
    if (input.vehicleWeightKg > l.maxVehicleWeightKg) return false;
    return true;
  });

  if (compatibleLines.length === 0) {
    bottlenecks.platformIncompatible = `No active assembly lines can support vehicle weight (${input.vehicleWeightKg} kg). Upgrade line chassis carriers.`;
    return {
      isFeasible: false,
      availableLinesCount: 0,
      estimatedDaysToProduce: 0,
      achievableUnitsInTargetTime: 0,
      bottlenecks,
    };
  }

  // Pick target line (either requested or best fit)
  let chosenLine = input.lineId
    ? compatibleLines.find((l) => l.id === input.lineId)
    : compatibleLines.reduce((best, cur) => (cur.utilizationPct < best.utilizationPct ? cur : best), compatibleLines[0]);

  if (!chosenLine) {
    chosenLine = compatibleLines[0];
  }

  // 3. Workforce Requirement Check
  if (input.availableWorkers < chosenLine.minWorkersRequired) {
    bottlenecks.workforceDeficit = `Insufficient manufacturing workers assigned (${input.availableWorkers} / ${chosenLine.minWorkersRequired} required on ${chosenLine.name}).`;
  }

  // 4. Time & Capacity Calculation
  const cap = computeLineCapacity(chosenLine);
  const dailyRate = Math.max(1, cap.dailyCapacity);
  const estimatedDaysToProduce = Math.ceil(input.targetUnits / dailyRate);
  const achievableUnitsInTargetTime = Math.floor(input.targetDays * dailyRate);

  if (input.targetDays > 0 && estimatedDaysToProduce > input.targetDays) {
    bottlenecks.capacityIssue = `Line throughput constraint: Requires ${estimatedDaysToProduce} operational days to complete ${input.targetUnits} units (Target: ${input.targetDays} days).`;
  }

  const isFeasible = Object.keys(bottlenecks).length === 0;

  return {
    isFeasible,
    recommendedLineId: chosenLine.id,
    recommendedLineName: chosenLine.name,
    availableLinesCount: compatibleLines.length,
    estimatedDaysToProduce,
    achievableUnitsInTargetTime,
    bottlenecks,
  };
}

/**
 * Creates authentic initial assembly lines based on factory progression level.
 */
export function createInitialAssemblyLines(factoryLevel: number): AssemblyLine[] {
  const baseLines: AssemblyLine[] = [];

  if (factoryLevel <= 1) {
    // Level 1: Workshop / Pilot Plant (Low volume, flexible cell)
    baseLines.push({
      id: "line_pilot_cell_01",
      name: "Pilot Assembly Cell A",
      type: "FLEXIBLE",
      level: 1,
      status: "IDLE",
      operatingHoursPerDay: 8,
      shiftsPerDay: 1,
      operatingDaysPerWeek: 5,
      efficiencyPct: 75,
      cycleTimeMinutes: 45, // 45 min per car
      dailyCapacityUnits: 8,
      monthlyCapacityUnits: 173,
      reservedSlots: [],
      monthlyOperatingHoursAvailable: 130,
      monthlyOperatingHoursReserved: 0,
      monthlyOperatingHoursFree: 130,
      utilizationPct: 0,
      maxVehicleWeightKg: 2400,
      supportedPlatforms: ["monocoque_sedan", "tubular_gt", "f1_chassis", "prototype_ev"],
      changeoverTimeDays: 1,
      lastMaintenanceDate: "1970-01-01",
      nextScheduledMaintenance: "1970-04-01",
      maintenanceIntervalDays: 90,
      breakdownRiskPct: 5,
      assignedWorkersCount: 25,
      minWorkersRequired: 20,
      monthlyOperatingCostUSD: 28000,
      upgradeCostUSD: 150000,
    });
  } else if (factoryLevel === 2) {
    // Level 2: Small Assembly Plant (Two specialized lines)
    baseLines.push(
      {
        id: "line_stamping_body_01",
        name: "Body Framing Line 1",
        type: "BODY_WELDING",
        level: 2,
        status: "IDLE",
        operatingHoursPerDay: 8,
        shiftsPerDay: 2,
        operatingDaysPerWeek: 5,
        efficiencyPct: 82,
        cycleTimeMinutes: 20,
        dailyCapacityUnits: 39,
        monthlyCapacityUnits: 845,
        reservedSlots: [],
        monthlyOperatingHoursAvailable: 284,
        monthlyOperatingHoursReserved: 0,
        monthlyOperatingHoursFree: 284,
        utilizationPct: 0,
        maxVehicleWeightKg: 2800,
        supportedPlatforms: ["monocoque_sedan", "tubular_gt", "unibody_suv"],
        changeoverTimeDays: 2,
        lastMaintenanceDate: "1970-01-01",
        nextScheduledMaintenance: "1970-04-01",
        maintenanceIntervalDays: 90,
        breakdownRiskPct: 6,
        assignedWorkersCount: 45,
        minWorkersRequired: 35,
        monthlyOperatingCostUSD: 52000,
        upgradeCostUSD: 350000,
      },
      {
        id: "line_final_assembly_01",
        name: "Final Assembly Line 1",
        type: "FINAL_ASSEMBLY",
        level: 2,
        status: "IDLE",
        operatingHoursPerDay: 8,
        shiftsPerDay: 2,
        operatingDaysPerWeek: 5,
        efficiencyPct: 85,
        cycleTimeMinutes: 22,
        dailyCapacityUnits: 37,
        monthlyCapacityUnits: 801,
        reservedSlots: [],
        monthlyOperatingHoursAvailable: 294,
        monthlyOperatingHoursReserved: 0,
        monthlyOperatingHoursFree: 294,
        utilizationPct: 0,
        maxVehicleWeightKg: 2800,
        supportedPlatforms: ["monocoque_sedan", "tubular_gt", "unibody_suv"],
        changeoverTimeDays: 2,
        lastMaintenanceDate: "1970-01-01",
        nextScheduledMaintenance: "1970-04-01",
        maintenanceIntervalDays: 90,
        breakdownRiskPct: 4,
        assignedWorkersCount: 60,
        minWorkersRequired: 45,
        monthlyOperatingCostUSD: 68000,
        upgradeCostUSD: 420000,
      }
    );
  } else {
    // Level 3+: Modern Multi-Shop Plant
    baseLines.push(
      {
        id: "line_body_framing_alpha",
        name: "Robotic Body Framing Alpha",
        type: "BODY_WELDING",
        level: factoryLevel,
        status: "IDLE",
        operatingHoursPerDay: 8,
        shiftsPerDay: 3,
        operatingDaysPerWeek: 6,
        efficiencyPct: 90,
        cycleTimeMinutes: 8,
        dailyCapacityUnits: 162,
        monthlyCapacityUnits: 4212,
        reservedSlots: [],
        monthlyOperatingHoursAvailable: 561,
        monthlyOperatingHoursReserved: 0,
        monthlyOperatingHoursFree: 561,
        utilizationPct: 0,
        maxVehicleWeightKg: 3200,
        supportedPlatforms: ["monocoque_sedan", "tubular_gt", "unibody_suv", "hypercar_carbon"],
        changeoverTimeDays: 1,
        lastMaintenanceDate: "1970-01-01",
        nextScheduledMaintenance: "1970-03-01",
        maintenanceIntervalDays: 60,
        breakdownRiskPct: 3,
        assignedWorkersCount: 75,
        minWorkersRequired: 60,
        monthlyOperatingCostUSD: 115000,
        upgradeCostUSD: 850000,
      },
      {
        id: "line_paint_booth_alpha",
        name: "Cleanroom Primer & Clearcoat Alpha",
        type: "PAINT",
        level: factoryLevel,
        status: "IDLE",
        operatingHoursPerDay: 8,
        shiftsPerDay: 3,
        operatingDaysPerWeek: 6,
        efficiencyPct: 92,
        cycleTimeMinutes: 10,
        dailyCapacityUnits: 132,
        monthlyCapacityUnits: 3432,
        reservedSlots: [],
        monthlyOperatingHoursAvailable: 574,
        monthlyOperatingHoursReserved: 0,
        monthlyOperatingHoursFree: 574,
        utilizationPct: 0,
        maxVehicleWeightKg: 3500,
        supportedPlatforms: ["monocoque_sedan", "tubular_gt", "unibody_suv", "hypercar_carbon"],
        changeoverTimeDays: 1,
        lastMaintenanceDate: "1970-01-01",
        nextScheduledMaintenance: "1970-03-01",
        maintenanceIntervalDays: 60,
        breakdownRiskPct: 2,
        assignedWorkersCount: 40,
        minWorkersRequired: 30,
        monthlyOperatingCostUSD: 95000,
        upgradeCostUSD: 720000,
      },
      {
        id: "line_final_assembly_alpha",
        name: "Continuous Conveyor Final Assembly",
        type: "FINAL_ASSEMBLY",
        level: factoryLevel,
        status: "IDLE",
        operatingHoursPerDay: 8,
        shiftsPerDay: 3,
        operatingDaysPerWeek: 6,
        efficiencyPct: 91,
        cycleTimeMinutes: 9,
        dailyCapacityUnits: 145,
        monthlyCapacityUnits: 3770,
        reservedSlots: [],
        monthlyOperatingHoursAvailable: 567,
        monthlyOperatingHoursReserved: 0,
        monthlyOperatingHoursFree: 567,
        utilizationPct: 0,
        maxVehicleWeightKg: 3500,
        supportedPlatforms: ["monocoque_sedan", "tubular_gt", "unibody_suv", "hypercar_carbon"],
        changeoverTimeDays: 1,
        lastMaintenanceDate: "1970-01-01",
        nextScheduledMaintenance: "1970-03-01",
        maintenanceIntervalDays: 60,
        breakdownRiskPct: 3,
        assignedWorkersCount: 110,
        minWorkersRequired: 90,
        monthlyOperatingCostUSD: 165000,
        upgradeCostUSD: 1100000,
      },
      {
        id: "line_quality_gate_alpha",
        name: "End-of-Line Dyno & Water Testing",
        type: "QUALITY_INSPECTION",
        level: factoryLevel,
        status: "IDLE",
        operatingHoursPerDay: 8,
        shiftsPerDay: 3,
        operatingDaysPerWeek: 6,
        efficiencyPct: 95,
        cycleTimeMinutes: 7,
        dailyCapacityUnits: 195,
        monthlyCapacityUnits: 5070,
        reservedSlots: [],
        monthlyOperatingHoursAvailable: 592,
        monthlyOperatingHoursReserved: 0,
        monthlyOperatingHoursFree: 592,
        utilizationPct: 0,
        maxVehicleWeightKg: 4000,
        supportedPlatforms: ["monocoque_sedan", "tubular_gt", "unibody_suv", "hypercar_carbon"],
        changeoverTimeDays: 0,
        lastMaintenanceDate: "1970-01-01",
        nextScheduledMaintenance: "1970-03-01",
        maintenanceIntervalDays: 60,
        breakdownRiskPct: 1,
        assignedWorkersCount: 35,
        minWorkersRequired: 25,
        monthlyOperatingCostUSD: 55000,
        upgradeCostUSD: 450000,
      }
    );
  }

  // Recalculate metrics for each initialized line
  return baseLines.map((line) => {
    const cap = computeLineCapacity(line);
    const util = computeLineUtilization(line, cap.effectiveMonthlyHours);
    return {
      ...line,
      dailyCapacityUnits: cap.dailyCapacity,
      monthlyCapacityUnits: cap.monthlyCapacity,
      monthlyOperatingHoursAvailable: cap.effectiveMonthlyHours,
      monthlyOperatingHoursReserved: util.reservedHours,
      monthlyOperatingHoursFree: util.freeHours,
      utilizationPct: util.utilizationPct,
    };
  });
}
