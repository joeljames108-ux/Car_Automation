/**
 * ═══════════════════════════════════════════════════════════════════════
 * FACTORY MANAGEMENT & TIME-BASED ASSEMBLY LINE SYSTEM — TYPES
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Core architectural principle:
 * Factory capacity = assembly lines + line capability + production hours
 *                  + available time slots + materials + workforce.
 */

import type { LineWorkforceSkill } from "./factorySkillEngine";
import type { PurchaseOrder } from "./factorySupplyChainEngine";

export type { LineWorkforceSkill, PurchaseOrder };

export type LineType =
  | "BODY_WELDING"       // Stamping + structural framing + body-in-white
  | "PAINT"              // Automated e-coat, primer, base & clearcoat booths
  | "FINAL_ASSEMBLY"     // Powertrain marriage, chassis integration, interior
  | "QUALITY_INSPECTION" // Dynamometer, alignment, monsoon water-leak chamber
  | "FLEXIBLE";          // Multi-stage agile cell (lower volume, high versatility)

export type LineStatus =
  | "IDLE"               // Ready for production allocation
  | "PRODUCING"          // Currently executing a reserved slot
  | "CHANGEOVER"         // Tooling/re-jigging between vehicle platforms
  | "MAINTENANCE"        // Preventive overhaul or emergency downtime
  | "UPGRADING"          // Capital automation and robotics upgrade in progress
  | "OFFLINE";           // Decommissioned or unpowered

export type SlotStatus =
  | "SCHEDULED"          // Reserved for future date
  | "IN_PROGRESS"        // Currently undergoing manufacturing
  | "COMPLETED"          // Quota fulfilled and dispatched
  | "PAUSED"             // Blocked by materials, workforce, or user hold
  | "CANCELLED";         // Terminated before completion

export interface ProductionSlot {
  id: string;
  lineId: string;
  contractId?: string;           // Optional link to PRODUCTION_MFG contract
  vehicleModelId: string;
  vehicleModelName: string;

  // Time Window (ISO string YYYY-MM-DD)
  startDate: string;
  endDate: string;
  totalProductionDays: number;
  elapsedDays: number;

  // Quantities & Progress
  targetUnits: number;
  producedUnits: number;
  dailyRate: number;             // Units scheduled per operational day
  unitCycleTimeMinutes: number;  // Takt time for this specific vehicle model

  // Economics & Logistics
  unitBOMCostUSD: number;
  unitLaborCostUSD: number;
  totalCostUSD: number;
  status: SlotStatus;
  priority: 1 | 2 | 3;          // 1 = High/Contract SLA, 2 = Standard, 3 = Low
  pauseReason?: string;
}

export interface AssemblyLine {
  id: string;
  name: string;                  // e.g. "Line Alpha (Unibody)", "Main Assembly Line 1"
  type: LineType;
  level: number;                 // Tier 1 to 5 (governs robotics, speed, precision)
  status: LineStatus;

  // Time & Shift Configuration
  operatingHoursPerDay: number;  // Base hours per shift (typically 8)
  shiftsPerDay: 1 | 2 | 3;       // 1 = 8h, 2 = 16h, 3 = 24h continuous
  operatingDaysPerWeek: 5 | 6 | 7;
  efficiencyPct: number;         // 60% - 98% based on line age, tooling, maintenance

  // Cycle & Output Metrics
  cycleTimeMinutes: number;      // Nominal line cycle / takt time (e.g. 12 min per car)
  dailyCapacityUnits: number;    // Calculated: (hours * shifts * 60 / cycleTime) * efficiency
  monthlyCapacityUnits: number;  // Calculated: dailyCapacity * (daysPerWeek * 4.33)

  // Scheduling & Utilization
  reservedSlots: ProductionSlot[];
  activeSlotId?: string;
  monthlyOperatingHoursAvailable: number;
  monthlyOperatingHoursReserved: number;
  monthlyOperatingHoursFree: number;
  utilizationPct: number;        // (Reserved / Available) * 100

  // Engineering & Model Compatibility
  maxVehicleWeightKg: number;
  supportedPlatforms: string[];  // e.g. ["monocoque_sedan", "tubular_gt", "f1_chassis"]
  changeoverTimeDays: number;    // Downtime required when switching platforms (1 - 4 days)
  currentVehicleModelId?: string;

  // Maintenance & Reliability
  lastMaintenanceDate: string;
  nextScheduledMaintenance: string;
  maintenanceIntervalDays: number;
  breakdownRiskPct: number;      // Scales with days past due date (0% - 65%)
  maintenanceDaysRemaining?: number;

  // Workforce & Capital
  assignedWorkersCount: number;
  minWorkersRequired: number;
  monthlyOperatingCostUSD: number;
  upgradeCostUSD: number;
  upgradeDaysRemaining?: number;

  // Changeover State (Platform Switching)
  changeoverDaysRemaining?: number;   // Countdown of re-jigging days remaining
  changeoverTargetModelId?: string;   // Vehicle model being set up during changeover

  // Workforce Experience & Skills (Phase 2)
  workforceSkill?: LineWorkforceSkill;
}

export interface FactoryFloorSummary {
  factoryId: string;
  factoryName: string;
  factoryLevel: number;
  ownershipStatus: "no_factory_outsourced" | "land_acquired" | "under_construction" | "operational_owned";
  
  // Aggregate Line Capacities
  totalLinesCount: number;
  activeLinesCount: number;
  idleLinesCount: number;
  maintenanceLinesCount: number;

  // Capacity in Units / Month
  totalMonthlyCapacityUnits: number;
  usedMonthlyCapacityUnits: number;
  availableMonthlyCapacityUnits: number;
  overallUtilizationPct: number;

  // Hours per Month
  totalMonthlyOperatingHours: number;
  reservedMonthlyOperatingHours: number;
  availableMonthlyOperatingHours: number;

  // Workforce on Floor
  totalFactoryWorkersAssigned: number;
  totalFactoryWorkersRequired: number;
  staffingHealthPct: number;

  // Financials
  monthlyFixedOverheadUSD: number;
  monthlyLineOperatingCostUSD: number;
  totalMonthlyCostUSD: number;

  // Production Statistics
  activeJobsCount: number;
  totalUnitsInProduction: number;
  completedUnitsThisMonth: number;
}

export interface FeasibilityCheckInput {
  lineId?: string;
  vehicleModelId: string;
  vehicleWeightKg: number;
  targetUnits: number;
  targetDays: number;
  dailyRateRequired: number;
  unitBOMCostUSD: number;
  unitLaborCostUSD: number;
  availableCashUSD: number;
  availableWorkers: number;
}

export interface FeasibilityCheckResult {
  isFeasible: boolean;
  recommendedLineId?: string;
  recommendedLineName?: string;
  availableLinesCount: number;
  estimatedDaysToProduce: number;
  achievableUnitsInTargetTime: number;
  bottlenecks: {
    capacityIssue?: string;
    scheduleConflict?: string;
    workforceDeficit?: string;
    cashShortage?: string;
    platformIncompatible?: string;
  };
}

export interface LineCapacityBreakdown {
  dailyCapacity: number;
  weeklyCapacity: number;
  monthlyCapacity: number;
  effectiveWorkingHoursPerDay: number;
  effectiveMonthlyHours: number;
  cycleTimeMinutes: number;
}
