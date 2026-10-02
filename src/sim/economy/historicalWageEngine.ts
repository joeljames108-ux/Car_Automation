/**
 * ═══════════════════════════════════════════════════════════════════════
 * HISTORICAL WAGE & SALARY SCALING ENGINE (1970 – 2025+)
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Implements Phase 4: Historical Wage & Salary Scaling System.
 *
 * Grounded in authentic automotive wage history:
 * - UAW-GM / Ford / Chrysler Master Agreements (1970-2024)
 * - BLS Series CEU3133610008 (Average Hourly Earnings of Motor Vehicle Production Workers)
 * - SAE International Engineering Salary Benchmarks
 *
 * Scales 8 distinct automotive departments:
 * - ENGINEERING: Master draftspeople, mechanical engineers, structural stress analysts
 * - MANUFACTURING: Assembly line machinists, press operators, robotic technicians
 * - RD: Powertrain researchers, aerodynamicists, thermal/battery physicists
 * - MOTORSPORT: Trackside telemetry engineers, master race mechanics, tire technicians
 * - DESIGN: Clay modelers, surface stylists, digital CAD concept modelers
 * - MANAGEMENT: Plant directors, controllers, chief legal officers, executive suite
 * - SALES: Dealership network directors, fleet sales managers, brand liaisons
 * - SERVICE: Field service engineers, master warranty diagnosticians
 */

import { getInflationRecordForDate, SemiAnnualPeriod } from "./historicalInflationData";

export type EmployeeDepartment =
  | "ENGINEERING"
  | "MANUFACTURING"
  | "RD"
  | "MOTORSPORT"
  | "DESIGN"
  | "MANAGEMENT"
  | "SALES"
  | "SERVICE";

export const BASE_1970_MONTHLY_SALARIES: Record<EmployeeDepartment, number> = {
  ENGINEERING: 14000,
  MANUFACTURING: 8500,
  RD: 18000,
  MOTORSPORT: 16000,
  DESIGN: 15000,
  MANAGEMENT: 22000,
  SALES: 9500,
  SERVICE: 8000,
};

/** Department-specific labor specialization multipliers across the decades */
function getDepartmentWageScalingFactor(dept: EmployeeDepartment, year: number): number {
  const yearsPassed = Math.max(0, year - 1970);

  switch (dept) {
    case "RD":
      // High-tech silicon, battery electrochemistry, and AI software premiums in later eras
      return 1.0 + Math.pow(yearsPassed / 50, 1.35) * 0.35;

    case "ENGINEERING":
      // FEA, CAD simulation, and electrical engineering complexity scaling
      return 1.0 + Math.pow(yearsPassed / 50, 1.25) * 0.25;

    case "MANAGEMENT":
      // Executive compensation growth across multinational eras
      return 1.0 + Math.pow(yearsPassed / 50, 1.3) * 0.40;

    case "MOTORSPORT":
      // Specialized aerodynamics and composite mechanics
      return 1.0 + Math.pow(yearsPassed / 50, 1.2) * 0.20;

    case "DESIGN":
      // Digital class-A surfacing and ergonomics modeling
      return 1.0 + (yearsPassed / 50) * 0.15;

    case "MANUFACTURING":
    case "SERVICE":
    case "SALES":
    default:
      // Union hourly wages and standard commercial salaries follow labor wage index
      return 1.0;
  }
}

/**
 * Returns the era-appropriate base monthly salary for any department in a given year/month
 */
export function getHistoricalBaseSalary(
  department: EmployeeDepartment,
  year: number,
  month: number = 1
): number {
  const base1970 = BASE_1970_MONTHLY_SALARIES[department] ?? 10000;
  const record = getInflationRecordForDate(year, month);
  const specMult = getDepartmentWageScalingFactor(department, year);

  return Math.round(base1970 * record.laborWageIndex * specMult);
}

/**
 * Returns the full dictionary of base market salaries for all departments in a given year/month
 */
export function getHistoricalWorkforceMarketSalaries(
  year: number,
  month: number = 1
): Record<EmployeeDepartment, number> {
  const depts: EmployeeDepartment[] = [
    "ENGINEERING",
    "MANUFACTURING",
    "RD",
    "MOTORSPORT",
    "DESIGN",
    "MANAGEMENT",
    "SALES",
    "SERVICE",
  ];

  const salaries = {} as Record<EmployeeDepartment, number>;
  for (const d of depts) {
    salaries[d] = getHistoricalBaseSalary(d, year, month);
  }
  return salaries;
}

/**
 * Returns complete semi-annual historical wage trajectory (1970–2030) for a department
 */
export function getDepartmentHistoricalWageTrajectory(
  department: EmployeeDepartment
): Array<{ year: number; period: SemiAnnualPeriod; baseMonthlySalary: number }> {
  const trajectory: Array<{ year: number; period: SemiAnnualPeriod; baseMonthlySalary: number }> = [];

  for (let yr = 1970; yr <= 2030; yr++) {
    trajectory.push({
      year: yr,
      period: "H1_JAN",
      baseMonthlySalary: getHistoricalBaseSalary(department, yr, 1),
    });
    trajectory.push({
      year: yr,
      period: "H2_JUL",
      baseMonthlySalary: getHistoricalBaseSalary(department, yr, 7),
    });
  }

  return trajectory;
}

/**
 * Calculates historical wage growth and compound annual growth rate (CAGR) between two years
 */
export function calculateWageInflationGrowth(
  department: EmployeeDepartment,
  startYear: number,
  endYear: number
): {
  startSalary: number;
  endSalary: number;
  growthRatio: number;
  totalGrowthPct: number;
  compoundAnnualGrowthRatePct: number;
} {
  const startSalary = getHistoricalBaseSalary(department, startYear, 1);
  const endSalary = getHistoricalBaseSalary(department, endYear, 1);
  const growthRatio = endSalary / Math.max(1, startSalary);
  const totalGrowthPct = Number(((growthRatio - 1) * 100).toFixed(1));

  const years = Math.max(1, endYear - startYear);
  const cagr = Number(((Math.pow(growthRatio, 1 / years) - 1) * 100).toFixed(2));

  return {
    startSalary,
    endSalary,
    growthRatio: Number(growthRatio.toFixed(2)),
    totalGrowthPct,
    compoundAnnualGrowthRatePct: cagr,
  };
}
