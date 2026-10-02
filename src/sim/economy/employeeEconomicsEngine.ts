/**
 * ═══════════════════════════════════════════════════════════════════════
 * EMPLOYEE ECONOMICS ENGINE — HEADCOUNT, PAYROLL & TALENT PREMIUMS
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Implements Sections 13 & 14:
 *
 * Employees are one of the company's largest and most persistent monthly expenses.
 *
 * Employer Reputation Mechanic (Section 14):
 * - Famous prestigious company (Employer Rep 85+):
 *   Top engineers actively apply. Company can hire at 10-24% below market rate
 *   because working here elevates an engineer's resume!
 *
 * - Unknown startup (Employer Rep < 30):
 *   Must pay +10% to +15% "obscurity risk premium" to convince skilled engineers
 *   to leave stable jobs at established competitors.
 */

export type EmployeeDepartment =
  | "ENGINEERING"
  | "MANUFACTURING"
  | "RD"
  | "MOTORSPORT"
  | "DESIGN"
  | "MANAGEMENT"
  | "SALES"
  | "SERVICE";

export interface DepartmentWorkforce {
  department: EmployeeDepartment;
  headcount: number;
  averageSkillScore: number;       // 0-100
  baseMarketSalaryMonthly: number; // Benchmark monthly salary in ₹
  actualSalaryMonthly: number;     // Adjusted for employer reputation
  monthlyPayroll: number;          // headcount * actualSalaryMonthly
  productivityMultiplier: number;  // 0.6 to 1.5
}

export interface WorkforceEconomicsState {
  totalHeadcount: number;
  totalMonthlyPayroll: number;
  departments: Record<EmployeeDepartment, DepartmentWorkforce>;

  // Reputation-driven recruitment dynamics (Section 14)
  employerReputationScore: number;
  hiringDifficulty: "LOW" | "MODERATE" | "HIGH" | "SEVERE";
  talentAvailabilityTier: "ELITE" | "EXPERIENCED" | "COMPETENT" | "LOCAL_GRADUATES";
  hiringPremiumPct: number;        // Negative = discount (e.g. -12%), Positive = surcharge (+15%)
  averageSkillAcrossCompany: number;
  overallProductivityMultiplier: number;
}

/** Founding Era 1970 Skeleton Workforce: 25 employees total */
export const INITIAL_1970_WORKFORCE: Record<EmployeeDepartment, { count: number; skill: number; baseSalary: number }> = {
  ENGINEERING: { count: 6, skill: 65, baseSalary: 14000 },   // Master mechanics & draftspeople
  MANUFACTURING: { count: 8, skill: 55, baseSalary: 8500 },   // Panel beaters, machinists
  RD: { count: 3, skill: 72, baseSalary: 18000 },             // Powertrain designers
  MOTORSPORT: { count: 0, skill: 0, baseSalary: 16000 },
  DESIGN: { count: 2, skill: 68, baseSalary: 15000 },         // Clay modelers & stylists
  MANAGEMENT: { count: 2, skill: 60, baseSalary: 22000 },     // Founder & accountant
  SALES: { count: 2, skill: 50, baseSalary: 9500 },           // Commercial liaison
  SERVICE: { count: 2, skill: 58, baseSalary: 8000 },         // Prototype workshop tech
};

import { getHistoricalBaseSalary } from "./historicalWageEngine";

/**
 * Calculate full employee economics, payroll and reputation-adjusted recruitment rates
 */
export function calculateWorkforceEconomics(
  headcountByDept: Record<EmployeeDepartment, { count: number; skill: number; baseSalary?: number }>,
  employerReputation: number,
  engineeringReputation: number,
  year?: number,
  month?: number
): WorkforceEconomicsState {
  // 1. Employer Reputation Hiring Premium / Discount (Section 14)
  // Low rep (<30): pays up to +15% obscurity premium
  // High rep (>=85): receives up to 24% prestige discount
  let hiringPremiumPct = 0;
  if (employerReputation < 28) {
    hiringPremiumPct = Number((((28 - employerReputation) / 28) * 15).toFixed(1)); // +0% to +15%
  } else {
    const discount = ((employerReputation - 28) / 72) * 20 + (engineeringReputation > 75 ? 4 : 0);
    hiringPremiumPct = -Number(Math.min(24, discount).toFixed(1)); // -0% to -24%
  }

  const salaryMultiplier = 1 + hiringPremiumPct / 100;

  let totalHeadcount = 0;
  let totalMonthlyPayroll = 0;
  let totalSkillWeighted = 0;

  const departments = {} as Record<EmployeeDepartment, DepartmentWorkforce>;

  for (const deptKey of Object.keys(headcountByDept) as EmployeeDepartment[]) {
    const info = headcountByDept[deptKey];
    const count = Math.max(0, info.count);
    const defaultSalary = year !== undefined
      ? getHistoricalBaseSalary(deptKey, year, month ?? 1)
      : INITIAL_1970_WORKFORCE[deptKey].baseSalary;
    // If year is specified and baseSalary matches the founding 1970 constant, scale to the target year
    const isCustomOverride =
      info.baseSalary !== undefined &&
      (year === undefined || year === 1970 || info.baseSalary !== INITIAL_1970_WORKFORCE[deptKey].baseSalary);
    const baseSal = isCustomOverride ? info.baseSalary! : defaultSalary;
    const actualSal = Math.round(baseSal * salaryMultiplier);
    const deptPayroll = count * actualSal;

    // Productivity scales with skill score and department size synergy
    const prod = Number((0.6 + (info.skill / 100) * 0.7).toFixed(2));

    departments[deptKey] = {
      department: deptKey,
      headcount: count,
      averageSkillScore: info.skill,
      baseMarketSalaryMonthly: baseSal,
      actualSalaryMonthly: actualSal,
      monthlyPayroll: deptPayroll,
      productivityMultiplier: prod,
    };

    totalHeadcount += count;
    totalMonthlyPayroll += deptPayroll;
    totalSkillWeighted += count * info.skill;
  }

  const averageSkillAcrossCompany = totalHeadcount > 0
    ? Math.round(totalSkillWeighted / totalHeadcount)
    : 50;

  // Determine hiring difficulty & talent pool tier
  let hiringDifficulty: WorkforceEconomicsState["hiringDifficulty"] = "MODERATE";
  if (employerReputation >= 75) hiringDifficulty = "LOW";
  else if (employerReputation < 30) hiringDifficulty = "SEVERE";
  else if (employerReputation < 50) hiringDifficulty = "HIGH";

  let talentAvailabilityTier: WorkforceEconomicsState["talentAvailabilityTier"] = "COMPETENT";
  if (employerReputation >= 85) talentAvailabilityTier = "ELITE";
  else if (employerReputation >= 65) talentAvailabilityTier = "EXPERIENCED";
  else if (employerReputation < 35) talentAvailabilityTier = "LOCAL_GRADUATES";

  const overallProductivityMultiplier = Number((0.7 + (averageSkillAcrossCompany / 100) * 0.6).toFixed(2));

  return {
    totalHeadcount,
    totalMonthlyPayroll,
    departments,
    employerReputationScore: employerReputation,
    hiringDifficulty,
    talentAvailabilityTier,
    hiringPremiumPct,
    averageSkillAcrossCompany,
    overallProductivityMultiplier,
  };
}

/** Calculate one-time hiring fee to recruit workers */
export function calculateRecruitmentFee(
  count: number,
  department: EmployeeDepartment,
  hiringPremiumPct: number,
  year?: number
): number {
  const baseSalary = year !== undefined
    ? getHistoricalBaseSalary(department, year)
    : INITIAL_1970_WORKFORCE[department].baseSalary;
  const baseRecruiterFee = baseSalary * 1.8; // 1.8 months salary
  const effectiveFee = baseRecruiterFee * (1 + hiringPremiumPct / 100);
  return Math.round(count * effectiveFee);
}

/** Calculate severance costs for laying off employees */
export function calculateSeveranceCost(
  count: number,
  department: EmployeeDepartment,
  year?: number
): number {
  const monthlySalary = year !== undefined
    ? getHistoricalBaseSalary(department, year)
    : INITIAL_1970_WORKFORCE[department].baseSalary;
  return Math.round(count * monthlySalary * 2.5); // 2.5 months statutory severance
}
