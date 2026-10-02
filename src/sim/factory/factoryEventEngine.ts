/**
 * ═══════════════════════════════════════════════════════════════════════
 * FACTORY EVENT ENGINE — BREAKDOWNS & CHANGEOVER MECHANICS
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Phase 1 mechanics that activate existing but unused fields:
 *
 * 1. RANDOM BREAKDOWNS: Rolls against breakdownRiskPct each production
 *    day. On failure → line enters emergency MAINTENANCE, active slot
 *    paused, emergency repair cost deducted, notification pushed.
 *
 * 2. CHANGEOVER PENALTY: When a new slot's vehicleModelId differs from
 *    the line's currentVehicleModelId, the line enters CHANGEOVER status
 *    for changeoverTimeDays before production can begin. Flexible lines
 *    get 50% reduced changeover time.
 */

import { AssemblyLine, LineStatus } from "./factoryTypes";

// ─────────────────────────────────────────────────────────────
//  1. BREAKDOWN ENGINE
// ─────────────────────────────────────────────────────────────

export interface BreakdownResult {
  didBreakdown: boolean;
  lineName: string;
  lineId: string;
  repairCostUSD: number;
  emergencyDowntimeDays: number;
  previousBreakdownRisk: number;
  pausedSlotId?: string;
  pausedSlotVehicleName?: string;
}

/**
 * Deterministic breakdown check for a producing assembly line.
 * Should be called ONCE per production-day tick for each line in PRODUCING status.
 *
 * Design rationale:
 * - breakdownRiskPct 0–5%  → Very unlikely, well-maintained equipment
 * - breakdownRiskPct 5–15% → Overdue maintenance, moderate risk
 * - breakdownRiskPct 15%+  → Critical, player is gambling
 *
 * Emergency repairs cost 2.5× more than preventive maintenance and
 * take 3–5 days (vs. 2 days for preventive).
 */
export function evaluateBreakdownRisk(
  line: AssemblyLine,
  randomRoll: number = Math.random() * 100
): BreakdownResult {
  const noBreakdown: BreakdownResult = {
    didBreakdown: false,
    lineName: line.name,
    lineId: line.id,
    repairCostUSD: 0,
    emergencyDowntimeDays: 0,
    previousBreakdownRisk: line.breakdownRiskPct,
  };

  // Only producing lines can break down
  if (line.status !== "PRODUCING") return noBreakdown;

  // Roll check: random [0–100) vs. accumulated breakdownRiskPct
  if (randomRoll >= line.breakdownRiskPct) return noBreakdown;

  // ─── BREAKDOWN TRIGGERED ───
  // Emergency repair is 2.5× the normal preventive maintenance cost
  const preventiveMaintenanceCost = Math.round(line.monthlyOperatingCostUSD * 0.15);
  const emergencyRepairCostUSD = Math.round(preventiveMaintenanceCost * 2.5);

  // Emergency downtime: 3–5 days based on severity (higher risk % = longer)
  const emergencyDowntimeDays = line.breakdownRiskPct < 10 ? 3
    : line.breakdownRiskPct < 25 ? 4
    : 5;

  // Identify active slot that will be paused
  const activeSlot = (line.reservedSlots || []).find(
    (s) => s.status === "IN_PROGRESS"
  );

  return {
    didBreakdown: true,
    lineName: line.name,
    lineId: line.id,
    repairCostUSD: emergencyRepairCostUSD,
    emergencyDowntimeDays,
    previousBreakdownRisk: line.breakdownRiskPct,
    pausedSlotId: activeSlot?.id,
    pausedSlotVehicleName: activeSlot?.vehicleModelName,
  };
}

// ─────────────────────────────────────────────────────────────
//  2. CHANGEOVER ENGINE
// ─────────────────────────────────────────────────────────────

export interface ChangeoverCheck {
  requiresChangeover: boolean;
  changeoverDays: number;
  changeoverCostUSD: number;
  fromModelId?: string;
  toModelId: string;
  lineId: string;
  lineName: string;
}

/**
 * Base re-jigging cost per changeover day.
 * Scales with line level (higher automation = more complex tooling swap).
 */
function computeChangeoverCostPerDay(line: AssemblyLine): number {
  const baseCost = 8000; // $8,000 per day for tooling/fixture swap
  const levelMultiplier = 1.0 + (line.level - 1) * 0.25; // L1: 1×, L2: 1.25×, L5: 2×
  return Math.round(baseCost * levelMultiplier);
}

/**
 * Checks whether switching to a new vehicle model on a line requires
 * a changeover downtime period.
 *
 * Rules:
 * - If line has no currentVehicleModelId, no changeover needed (first job)
 * - If same model as current, no changeover needed
 * - FLEXIBLE lines get 50% reduced changeover time (minimum 1 day)
 * - Changeover cost = per-day cost × changeover days
 */
export function checkChangeoverRequired(
  line: AssemblyLine,
  newVehicleModelId: string
): ChangeoverCheck {
  const noChangeover: ChangeoverCheck = {
    requiresChangeover: false,
    changeoverDays: 0,
    changeoverCostUSD: 0,
    toModelId: newVehicleModelId,
    lineId: line.id,
    lineName: line.name,
  };

  // No changeover needed for first-ever job or same model
  if (!line.currentVehicleModelId || line.currentVehicleModelId === newVehicleModelId) {
    return noChangeover;
  }

  // Calculate changeover duration
  let changeoverDays = line.changeoverTimeDays;

  // FLEXIBLE lines get 50% reduced changeover time
  if (line.type === "FLEXIBLE") {
    changeoverDays = Math.max(1, Math.ceil(changeoverDays * 0.5));
  }

  // No changeover if the line spec says 0 days
  if (changeoverDays <= 0) {
    return noChangeover;
  }

  const costPerDay = computeChangeoverCostPerDay(line);
  const totalCost = costPerDay * changeoverDays;

  return {
    requiresChangeover: true,
    changeoverDays,
    changeoverCostUSD: totalCost,
    fromModelId: line.currentVehicleModelId,
    toModelId: newVehicleModelId,
    lineId: line.id,
    lineName: line.name,
  };
}

/**
 * Apply changeover fields to an assembly line, putting it into CHANGEOVER status.
 * Returns the mutated line state (immutable copy).
 */
export function applyChangeoverToLine(
  line: AssemblyLine,
  changeoverDays: number,
  newVehicleModelId: string
): AssemblyLine {
  return {
    ...line,
    status: "CHANGEOVER" as LineStatus,
    changeoverDaysRemaining: changeoverDays,
    changeoverTargetModelId: newVehicleModelId,
  };
}

/**
 * Tick changeover progress by elapsed days. Returns updated line.
 * When changeover completes, line transitions to IDLE with the new currentVehicleModelId.
 */
export function tickChangeoverProgress(
  line: AssemblyLine,
  elapsedDays: number
): { updatedLine: AssemblyLine; completed: boolean } {
  if (line.status !== "CHANGEOVER") {
    return { updatedLine: line, completed: false };
  }

  const remaining = (line.changeoverDaysRemaining ?? 0) - elapsedDays;

  if (remaining <= 0) {
    // Changeover complete — line is now set up for the new model
    return {
      updatedLine: {
        ...line,
        status: "IDLE" as LineStatus,
        currentVehicleModelId: line.changeoverTargetModelId,
        changeoverDaysRemaining: undefined,
        changeoverTargetModelId: undefined,
      },
      completed: true,
    };
  }

  return {
    updatedLine: {
      ...line,
      changeoverDaysRemaining: remaining,
    },
    completed: false,
  };
}
