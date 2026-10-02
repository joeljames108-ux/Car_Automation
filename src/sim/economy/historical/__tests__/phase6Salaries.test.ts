/**
 * ═══════════════════════════════════════════════════════════════════════════
 * UNIT TESTS — PHASE 6: WORKFORCE SALARY HIERARCHY & COMPENSATION
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { describe, it, expect } from "vitest";
import {
  AUTOMOTIVE_DEPARTMENTS,
  SALARY_GRID_RECORDS,
  getSalaryGridRecord,
  getRoleCompensation,
  getAdjustedWorkforceSalary,
  DepartmentId,
} from "../salaryHierarchy";
import { OccupationalRank } from "../types";

describe("Phase 6: Salary Hierarchy & Compensation Engine (1970–2026)", () => {
  const depts: DepartmentId[] = [
    "ENGINEERING",
    "MANUFACTURING",
    "RD",
    "MOTORSPORT",
    "DESIGN",
    "MANAGEMENT",
    "SALES",
    "SERVICE",
  ];

  it("should contain all 114 periods with 72 distinct roles in each period", () => {
    expect(Object.keys(SALARY_GRID_RECORDS).length).toBe(114);

    const rec1970 = getSalaryGridRecord(1970, 1);
    expect(Object.keys(rec1970.roles).length).toBe(72); // 9 ranks * 8 departments = 72 roles
    expect(rec1970.baseProductionHourlyUSD).toBe(3.17);

    for (const d of depts) {
      const comp = getRoleCompensation(d, "ENGINEER", 1970, 1);
      expect(comp).toBeDefined();
      expect(comp.monthlySalaryUSD).toBeGreaterThan(0);
      expect(comp.provenance.dataType).toBe("TYPE_C_DERIVED");
    }
  });

  it("should accurately reflect departmental multipliers in 1970 and 2026", () => {
    // 1970: Base Engineer role
    const mfgEngineer = getRoleCompensation("MANUFACTURING", "ENGINEER", 1970, 1);
    const rdEngineer = getRoleCompensation("RD", "ENGINEER", 1970, 1);
    const mgmtChief = getRoleCompensation("MANAGEMENT", "CHIEF_ENGINEER", 1970, 1);

    expect(mfgEngineer.monthlySalaryUSD).toBeCloseTo(1374.53, 0);
    expect(rdEngineer.monthlySalaryUSD).toBeCloseTo(1374.53 * 1.40, 0); // 1.40x RD multiplier
    expect(mgmtChief.monthlySalaryUSD).toBeGreaterThan(4000); // 1.65x Management * 5.40x Chief Engineer
  });

  it("should apply obscurity risk premiums for low-reputation startups", () => {
    // Unknown startup with reputation = 10
    const resStartup = getAdjustedWorkforceSalary(
      "SENIOR_ENGINEER",
      "ENGINEERING",
      1975,
      1,
      10, // low rep
      "STARTUP_BOUTIQUE"
    );

    expect(resStartup.reputationModifierPct).toBeGreaterThan(5); // Surcharge applied
    expect(resStartup.adjustedMonthlyUSD).toBeGreaterThan(resStartup.baseMonthlyUSD);
    expect(resStartup.provenance.methodology).toContain("obscurity");
  });

  it("should apply prestige attraction discounts for prestigious automakers", () => {
    // Famous brand with reputation = 90
    const resPrestige = getAdjustedWorkforceSalary(
      "SENIOR_ENGINEER",
      "ENGINEERING",
      1975,
      1,
      90, // high rep
      "MAJOR_AUTOMAKER"
    );

    expect(resPrestige.reputationModifierPct).toBeLessThan(0); // Discount applied
    expect(resPrestige.adjustedMonthlyUSD).toBeLessThan(resPrestige.baseMonthlyUSD);
  });

  it("should reflect 2026 compensation levels accurately", () => {
    const chiefRD2026 = getRoleCompensation("RD", "CHIEF_ENGINEER", 2026, 7);
    expect(chiefRD2026.hourlyWageUSD).toBeGreaterThan(250); // High-level executive R&D Chief in 2026
    expect(chiefRD2026.annualSalaryUSD).toBeGreaterThan(500000);
  });
});
