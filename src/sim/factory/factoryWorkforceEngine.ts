/**
 * ═══════════════════════════════════════════════════════════════════════
 * FACTORY WORKFORCE & SHIFT DYNAMICS ENGINE
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Implements shop floor human resource allocation:
 * 1. Line staffing requirements by shift tier
 * 2. Overtime mechanics, labor cost premiums, and worker fatigue
 * 3. Assembly worker skill multipliers on throughput and quality
 */

import { AssemblyLine } from "./factoryTypes";

export interface LineLaborReport {
  totalRequired: number;
  totalAssigned: number;
  deficit: number;
  monthlyPayrollUSD: number;
  staffingHealthPct: number;
}

const BASE_MANUFACTURING_WAGE_PER_HOUR_1970 = 4.25; // USD/hr
const OVERTIME_RATE_MULTIPLIER = 1.5;

/**
 * Computes aggregate labor demand across all lines on the floor.
 */
export function computeFloorLaborDemand(lines: AssemblyLine[]): LineLaborReport {
  let totalRequired = 0;
  let totalAssigned = 0;
  let monthlyPayrollUSD = 0;

  for (const line of lines) {
    const minRequired = line.minWorkersRequired * line.shiftsPerDay;
    totalRequired += minRequired;
    totalAssigned += line.assignedWorkersCount;

    // Monthly payroll = assigned * hoursPerDay * shifts * daysPerWeek * 4.33 * hourlyWage
    const monthlyHoursPerWorker = line.operatingHoursPerDay * line.operatingDaysPerWeek * 4.333;
    const lineLaborCost = line.assignedWorkersCount * monthlyHoursPerWorker * BASE_MANUFACTURING_WAGE_PER_HOUR_1970;
    monthlyPayrollUSD += lineLaborCost;
  }

  const deficit = Math.max(0, totalRequired - totalAssigned);
  const staffingHealthPct =
    totalRequired > 0 ? Math.min(100, Math.round((totalAssigned / totalRequired) * 100)) : 100;

  return {
    totalRequired,
    totalAssigned,
    deficit,
    monthlyPayrollUSD: Math.round(monthlyPayrollUSD),
    staffingHealthPct,
  };
}

/**
 * Computes overtime cost and fatigue impact for extended operations.
 */
export function computeOvertimeImpact(
  line: AssemblyLine,
  overtimeHoursPerDay: number
): {
  dailyOvertimeCostUSD: number;
  fatigueRiskPct: number;
} {
  if (overtimeHoursPerDay <= 0) {
    return { dailyOvertimeCostUSD: 0, fatigueRiskPct: 0 };
  }

  const overtimeHourlyRate = BASE_MANUFACTURING_WAGE_PER_HOUR_1970 * OVERTIME_RATE_MULTIPLIER;
  const dailyOvertimeCostUSD = line.assignedWorkersCount * overtimeHoursPerDay * overtimeHourlyRate;
  const fatigueRiskPct = Math.min(45, Math.round(overtimeHoursPerDay * 8.5));

  return {
    dailyOvertimeCostUSD: Math.round(dailyOvertimeCostUSD),
    fatigueRiskPct,
  };
}
