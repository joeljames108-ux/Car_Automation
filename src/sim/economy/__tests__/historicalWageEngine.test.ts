import { describe, it, expect } from "vitest";
import {
  getHistoricalBaseSalary,
  getHistoricalWorkforceMarketSalaries,
  getDepartmentHistoricalWageTrajectory,
  calculateWageInflationGrowth,
} from "../historicalWageEngine";
import { calculateWorkforceEconomics, INITIAL_1970_WORKFORCE } from "../employeeEconomicsEngine";

describe("Historical Wage & Salary Scaling Engine", () => {
  it("anchors 1970 baseline salaries accurately to founding workforce", () => {
    const eng1970 = getHistoricalBaseSalary("ENGINEERING", 1970, 1);
    const mfg1970 = getHistoricalBaseSalary("MANUFACTURING", 1970, 1);
    const rd1970 = getHistoricalBaseSalary("RD", 1970, 1);

    expect(eng1970).toBe(INITIAL_1970_WORKFORCE.ENGINEERING.baseSalary);
    expect(mfg1970).toBe(INITIAL_1970_WORKFORCE.MANUFACTURING.baseSalary);
    expect(rd1970).toBe(INITIAL_1970_WORKFORCE.RD.baseSalary);
  });

  it("reflects 1980 union wage surge from stagflation cost-of-living adjustments", () => {
    const mfg1970 = getHistoricalBaseSalary("MANUFACTURING", 1970, 1);
    const mfg1980 = getHistoricalBaseSalary("MANUFACTURING", 1980, 1);

    // 1980 labor wage index was 2.18x 1970 baseline
    expect(mfg1980).toBeGreaterThanOrEqual(mfg1970 * 2.1);
  });

  it("scales high-tech R&D and engineering complexity into 2024+", () => {
    const rd1970 = getHistoricalBaseSalary("RD", 1970, 1);
    const rd2024 = getHistoricalBaseSalary("RD", 2024, 1);

    expect(rd2024).toBeGreaterThan(rd1970 * 8.0);
  });

  it("returns complete market salary map across all 8 departments", () => {
    const market1985 = getHistoricalWorkforceMarketSalaries(1985, 1);
    expect(market1985.ENGINEERING).toBeGreaterThan(14000);
    expect(market1985.MANUFACTURING).toBeGreaterThan(8500);
    expect(market1985.MANAGEMENT).toBeGreaterThan(22000);
    expect(market1985.MOTORSPORT).toBeGreaterThan(16000);
  });

  it("calculates realistic CAGR across 50 years of automotive industrial wages", () => {
    const growth = calculateWageInflationGrowth("MANUFACTURING", 1970, 2020);
    expect(growth.growthRatio).toBeGreaterThan(6.0);
    expect(growth.compoundAnnualGrowthRatePct).toBeGreaterThan(3.5);
    expect(growth.compoundAnnualGrowthRatePct).toBeLessThan(5.5);
  });

  it("integrates seamlessly into calculateWorkforceEconomics with year parameter", () => {
    const workforce1980 = calculateWorkforceEconomics(
      INITIAL_1970_WORKFORCE,
      50, // neutral employer reputation
      50,
      1980,
      1
    );

    const workforce1970 = calculateWorkforceEconomics(
      INITIAL_1970_WORKFORCE,
      50,
      50,
      1970,
      1
    );

    expect(workforce1980.totalMonthlyPayroll).toBeGreaterThan(workforce1970.totalMonthlyPayroll * 2.0);
    expect(workforce1980.departments.MANUFACTURING.baseMarketSalaryMonthly).toBeGreaterThan(
      workforce1970.departments.MANUFACTURING.baseMarketSalaryMonthly * 2.0
    );
  });

  it("generates continuous 122-cycle semi-annual trajectory", () => {
    const traj = getDepartmentHistoricalWageTrajectory("ENGINEERING");
    expect(traj.length).toBe(122);
    expect(traj[0].year).toBe(1970);
    expect(traj[traj.length - 1].year).toBe(2030);
  });
});
