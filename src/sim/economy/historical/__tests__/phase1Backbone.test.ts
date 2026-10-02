/**
 * ═══════════════════════════════════════════════════════════════════════════
 * UNIT TESTS — PHASE 1: ECONOMIC CALENDAR, CPI & WAGE BACKBONE
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { describe, it, expect } from "vitest";
import {
  START_YEAR,
  END_YEAR,
  TOTAL_YEARS,
  TOTAL_PERIODS,
  ECONOMIC_PERIODS,
  PERIOD_MAP,
  getPeriod,
  getPeriodById,
  getPeriodByIndex,
  getNextPeriod,
  getPreviousPeriod,
  isRevisionDate,
  getRevisionCountdown,
} from "../economicCalendar";
import {
  CPI_RECORDS,
  CPI_HISTORY,
  getCPI,
  getCPIByPeriod,
  getCPIHistory,
  calculateCumulativeInflation,
} from "../cpiBackbone";
import {
  WAGE_RECORDS,
  WAGE_HISTORY,
  getWage,
  getWageByPeriod,
  getWageHistory,
  getCalculatedSalaryUSD,
  OCCUPATIONAL_MULTIPLIERS,
  DEPARTMENT_WAGE_MULTIPLIERS,
} from "../wageBackbone";

describe("Phase 1: Economic Calendar (1970-2026)", () => {
  it("should generate exactly 114 periods spanning 57 years", () => {
    expect(TOTAL_YEARS).toBe(57);
    expect(TOTAL_PERIODS).toBe(114);
    expect(ECONOMIC_PERIODS.length).toBe(114);
    expect(Object.keys(PERIOD_MAP).length).toBe(114);
  });

  it("should anchor the first period at 1970-H1 and terminal period at 2026-H2", () => {
    const first = ECONOMIC_PERIODS[0];
    expect(first.periodId).toBe("1970-H1");
    expect(first.year).toBe(1970);
    expect(first.revision).toBe("H1_JAN");
    expect(first.cycleIndex).toBe(0);
    expect(first.displayDate).toBe("1 Jan 1970");
    expect(first.startDate).toBe("1970-01-01");
    expect(first.endDate).toBe("1970-06-30");

    const last = ECONOMIC_PERIODS[113];
    expect(last.periodId).toBe("2026-H2");
    expect(last.year).toBe(2026);
    expect(last.revision).toBe("H2_JUL");
    expect(last.cycleIndex).toBe(113);
    expect(last.displayDate).toBe("1 Jul 2026");
    expect(last.startDate).toBe("2026-07-01");
    expect(last.endDate).toBe("2026-12-31");
  });

  it("should correctly resolve calendar months to H1 or H2 periods", () => {
    expect(getPeriod(1970, 1).periodId).toBe("1970-H1");
    expect(getPeriod(1970, 6).periodId).toBe("1970-H1");
    expect(getPeriod(1970, 7).periodId).toBe("1970-H2");
    expect(getPeriod(1970, 12).periodId).toBe("1970-H2");
    expect(getPeriod(1995, 3).periodId).toBe("1995-H1");
    expect(getPeriod(2026, 11).periodId).toBe("2026-H2");
  });

  it("should navigate consecutive periods forwards and backwards", () => {
    const p1974H1 = getPeriodById("1974-H1");
    expect(p1974H1).toBeDefined();
    if (!p1974H1) return;

    const next = getNextPeriod(p1974H1);
    expect(next?.periodId).toBe("1974-H2");

    const prev = getPreviousPeriod(p1974H1);
    expect(prev?.periodId).toBe("1973-H2");

    expect(getPreviousPeriod(ECONOMIC_PERIODS[0])).toBeNull();
    expect(getNextPeriod(ECONOMIC_PERIODS[113])).toBeNull();
  });

  it("should accurately detect semi-annual revision days (1 Jan and 1 Jul)", () => {
    expect(isRevisionDate(1970, 1, 1).isRevision).toBe(true);
    expect(isRevisionDate(1970, 1, 1).revision).toBe("H1_JAN");
    expect(isRevisionDate(1970, 7, 1).isRevision).toBe(true);
    expect(isRevisionDate(1970, 7, 1).revision).toBe("H2_JUL");

    expect(isRevisionDate(1970, 1, 2).isRevision).toBe(false);
    expect(isRevisionDate(1970, 6, 30).isRevision).toBe(false);
    expect(isRevisionDate(1970, 8, 1).isRevision).toBe(false);
  });

  it("should calculate revision countdowns and warning states correctly", () => {
    // 1 May (T-61: CALM)
    const countdownMay1 = getRevisionCountdown(1975, 5, 1);
    expect(countdownMay1.nextRevision).toBe("H2_JUL");
    expect(countdownMay1.daysRemaining).toBe(61);
    expect(countdownMay1.warningStatus).toBe("CALM");

    // 2 May (T-60: APPROACHING_T60)
    const countdownMay2 = getRevisionCountdown(1975, 5, 2);
    expect(countdownMay2.nextRevision).toBe("H2_JUL");
    expect(countdownMay2.daysRemaining).toBe(60);
    expect(countdownMay2.warningStatus).toBe("APPROACHING_T60");

    // 15 June (T-16 approx)
    const countdownJune = getRevisionCountdown(1975, 6, 15);
    expect(countdownJune.nextRevision).toBe("H2_JUL");
    expect(countdownJune.warningStatus).toBe("CRITICAL_T30");

    // 1 July (Revision day!)
    const countdownRevDay = getRevisionCountdown(1975, 7, 1);
    expect(countdownRevDay.warningStatus).toBe("REVISION_TODAY");
  });
});

describe("Phase 1: CPI Inflation Backbone (BLS Series CUUR0000SA0)", () => {
  it("should contain all 114 semi-annual CPI records", () => {
    expect(Object.keys(CPI_RECORDS).length).toBe(114);
    expect(CPI_HISTORY.length).toBe(114);
  });

  it("should have authentic historical CPI observations matching BLS records", () => {
    const cpi1970H1 = getCPI(1970, 1);
    expect(cpi1970H1.cpiU.value).toBe(37.8);
    expect(cpi1970H1.cpiNormalized1970.value).toBe(1.0);
    expect(cpi1970H1.cpiU.provenance.dataType).toBe("TYPE_A_DIRECT");
    expect(cpi1970H1.cpiU.provenance.source).toContain("Bureau of Labor Statistics");

    const cpi1974H1 = getCPI(1974, 1); // Oil crisis stagflation
    expect(cpi1974H1.cpiU.value).toBe(46.6);

    const cpi1980H1 = getCPI(1980, 1); // Peak inflation
    expect(cpi1980H1.cpiU.value).toBe(77.8);

    const cpi2022H2 = getCPI(2022, 7); // 40-year post-pandemic inflation peak
    expect(cpi2022H2.cpiU.value).toBe(296.3);

    const cpi2026H2 = getCPI(2026, 7);
    expect(cpi2026H2.cpiU.value).toBe(333.5);
  });

  it("should enforce mandatory provenance fields on all CPI records", () => {
    for (const record of CPI_HISTORY) {
      expect(record.cpiU.provenance.source).toBeTruthy();
      expect(record.cpiU.provenance.sourceSeriesId).toBeTruthy();
      expect(record.cpiU.provenance.dataType).toBe("TYPE_A_DIRECT");
      expect(record.cpiU.provenance.unit).toBe("Index (1982-84=100)");
      expect(record.cpiU.provenance.dateObserved).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(record.cpiU.provenance.methodology).toBeTruthy();

      expect(record.cpiNormalized1970.provenance.dataType).toBe("TYPE_B_INDEX");
    }
  });

  it("should accurately compute cumulative inflation between any two periods", () => {
    // 1970-H1 to 2026-H1
    const res = calculateCumulativeInflation(1970, 1, 2026, 1);
    expect(res.startCPI).toBe(37.8);
    expect(res.endCPI).toBe(328.6);
    expect(res.multiplier).toBeCloseTo(8.6931, 2);
    expect(res.totalInflationPct).toBeGreaterThan(700);
    expect(res.compoundAnnualRatePct).toBeCloseTo(3.9, 1);
  });
});

describe("Phase 1: Wage Backbone (FRED AHEMAN Series)", () => {
  it("should contain all 114 semi-annual wage records", () => {
    expect(Object.keys(WAGE_RECORDS).length).toBe(114);
    expect(WAGE_HISTORY.length).toBe(114);
  });

  it("should match exact FRED manufacturing wage observations cited in prompt", () => {
    const w1970H1 = getWage(1970, 1);
    expect(w1970H1.productionWorkerHourlyUSD.value).toBe(3.17);
    expect(w1970H1.productionWorkerHourlyUSD.provenance.dataType).toBe("TYPE_A_DIRECT");

    const w1970H2 = getWage(1970, 7);
    expect(w1970H2.productionWorkerHourlyUSD.value).toBe(3.25);

    const w1975H1 = getWage(1975, 1);
    expect(w1975H1.productionWorkerHourlyUSD.value).toBe(4.56);

    const w1975H2 = getWage(1975, 7);
    expect(w1975H2.productionWorkerHourlyUSD.value).toBe(4.70);

    const w2026H2 = getWage(2026, 7);
    expect(w2026H2.productionWorkerHourlyUSD.value).toBe(30.75);
  });

  it("should correctly calculate monthly and annual earnings based on standard hours", () => {
    const w1970H1 = getWage(1970, 1);
    // $3.17 * 173.3333 = $549.46
    expect(w1970H1.productionWorkerMonthlyUSD.value).toBeCloseTo(549.46, 1);
    // $3.17 * 2080 = $6,593.60
    expect(w1970H1.productionWorkerAnnualUSD.value).toBeCloseTo(6593.60, 1);
  });

  it("should enforce the 9 occupational hierarchy levels with appropriate multipliers", () => {
    const w1970H1 = getWage(1970, 1);
    const hourly = w1970H1.occupationalWagesHourlyUSD;

    expect(hourly.PRODUCTION_WORKER.value).toBe(3.17);
    expect(hourly.MACHINE_OPERATOR.value).toBe(3.74);   // 3.17 * 1.18
    expect(hourly.SKILLED_TECHNICIAN.value).toBe(4.50); // 3.17 * 1.42
    expect(hourly.SENIOR_TECHNICIAN.value).toBe(5.39);  // 3.17 * 1.70
    expect(hourly.JUNIOR_ENGINEER.value).toBe(6.50);    // 3.17 * 2.05
    expect(hourly.ENGINEER.value).toBe(7.93);           // 3.17 * 2.50
    expect(hourly.SENIOR_ENGINEER.value).toBe(10.14);   // 3.17 * 3.20
    expect(hourly.PRINCIPAL_ENGINEER.value).toBe(13.00); // 3.17 * 4.10
    expect(hourly.CHIEF_ENGINEER.value).toBe(17.12);    // 3.17 * 5.40

    // Check provenances
    expect(hourly.PRODUCTION_WORKER.provenance.dataType).toBe("TYPE_A_DIRECT");
    expect(hourly.CHIEF_ENGINEER.provenance.dataType).toBe("TYPE_C_DERIVED");
  });

  it("should calculate exact departmental salaries with multipliers", () => {
    // Senior Engineer in Powertrain R&D in 1970
    const resRD = getCalculatedSalaryUSD("SENIOR_ENGINEER", "RD", 1970, 1);
    expect(resRD.rankTitle).toBe("Lead Systems & Aerodynamics Engineer");
    expect(resRD.baseRoleSalaryUSD).toBeCloseTo(1757.60, 1);
    expect(resRD.deptMultiplier).toBe(1.40);
    expect(resRD.monthlySalaryUSD).toBeCloseTo(2460.64, 1);
    expect(resRD.provenance.dataType).toBe("TYPE_C_DERIVED");

    // Assembly Line Production Worker in Manufacturing in 2026
    const resMfg2026 = getCalculatedSalaryUSD("PRODUCTION_WORKER", "MANUFACTURING", 2026, 7);
    expect(resMfg2026.hourlyWageUSD).toBe(30.75);
    expect(resMfg2026.monthlySalaryUSD).toBeCloseTo(5330.00, 1);
  });
});
