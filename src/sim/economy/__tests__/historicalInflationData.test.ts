import { describe, it, expect } from "vitest";
import {
  getSemiAnnualRecord,
  getInflationRecordForDate,
  getNextSemiAnnualPeriod,
  getNextSemiAnnualRecord,
  getDaysUntilNextRevision,
  calculateProjectedRevisionDelta,
  getAllHistoricalRecords,
  HISTORICAL_SEMI_ANNUAL_RECORDS,
} from "../historicalInflationData";

describe("Historical Inflation & Price Index Dataset (1970 - 2025+)", () => {
  it("anchors 1970 H1_JAN at exact 1.000 baseline across all indices", () => {
    const record1970 = getSemiAnnualRecord(1970, "H1_JAN");
    expect(record1970.year).toBe(1970);
    expect(record1970.period).toBe("H1_JAN");
    expect(record1970.generalCPI).toBe(1.000);
    expect(record1970.automotivePPI).toBe(1.000);
    expect(record1970.metalsIndex).toBe(1.000);
    expect(record1970.energyPetrochemIndex).toBe(1.000);
    expect(record1970.laborWageIndex).toBe(1.000);
    expect(record1970.crudeOilPerBarrelUSD).toBe(3.39);
    expect(record1970.averageNewCarMSRPUSD).toBe(3550);
  });

  it("accurately models the 1973/1974 First OPEC Oil Shock surge", () => {
    const record1973H2 = getSemiAnnualRecord(1973, "H2_JUL");
    const record1974H1 = getSemiAnnualRecord(1974, "H1_JAN");

    expect(record1974H1.crudeOilPerBarrelUSD).toBeGreaterThan(10.0);
    expect(record1974H1.energyPetrochemIndex).toBeGreaterThan(2.5);
    expect(record1974H1.inflationRiskLevel).toBe("SEVERE");
    expect(record1974H1.energyPetrochemIndex).toBeGreaterThan(record1973H2.energyPetrochemIndex);
  });

  it("reflects 1980 peak stagflation in CPI and labor wage index", () => {
    const record1980 = getSemiAnnualRecord(1980, "H1_JAN");
    expect(record1980.generalCPI).toBeGreaterThan(2.0);
    expect(record1980.laborWageIndex).toBeGreaterThan(2.0);
    expect(record1980.autoAssemblerHourlyWageUSD).toBe(11.50);
  });

  it("demonstrates technological learning curve deflation in microelectronics", () => {
    const record1970 = getSemiAnnualRecord(1970, "H1_JAN");
    const record2000 = getSemiAnnualRecord(2000, "H1_JAN");
    const record2020 = getSemiAnnualRecord(2020, "H1_JAN");

    // Electronics index drops while general CPI increases
    expect(record2000.electronicsIndex).toBeLessThan(record1970.electronicsIndex);
    expect(record2020.electronicsIndex).toBeLessThan(record2000.electronicsIndex);
    expect(record2020.generalCPI).toBeGreaterThan(record1970.generalCPI);
  });

  it("demonstrates composite and battery cost reductions in later decades", () => {
    const record1995 = getSemiAnnualRecord(1995, "H1_JAN");
    const record2025 = getSemiAnnualRecord(2025, "H1_JAN");

    expect(record2025.compositesIndex).toBeLessThan(record1995.compositesIndex);
    expect(record2025.batteryMaterialsIndex).toBeLessThan(record1995.batteryMaterialsIndex);
  });

  it("accurately handles date-based period queries (Jan-Jun = H1, Jul-Dec = H2)", () => {
    const janRecord = getInflationRecordForDate(1975, 1, 15);
    const mayRecord = getInflationRecordForDate(1975, 5, 20);
    const julRecord = getInflationRecordForDate(1975, 7, 1);
    const novRecord = getInflationRecordForDate(1975, 11, 28);

    expect(janRecord.period).toBe("H1_JAN");
    expect(mayRecord.period).toBe("H1_JAN");
    expect(julRecord.period).toBe("H2_JUL");
    expect(novRecord.period).toBe("H2_JUL");
  });

  it("calculates next period progression across calendar year boundaries", () => {
    const nextH2 = getNextSemiAnnualPeriod(1972, "H1_JAN");
    expect(nextH2.nextYear).toBe(1972);
    expect(nextH2.nextPeriod).toBe("H2_JUL");

    const nextH1 = getNextSemiAnnualPeriod(1972, "H2_JUL");
    expect(nextH1.nextYear).toBe(1973);
    expect(nextH1.nextPeriod).toBe("H1_JAN");
  });

  it("calculates days remaining until the next semi-annual revision correctly", () => {
    // 15 May 1970 -> Next is 1 July 1970 (~47 days)
    const countdownMay = getDaysUntilNextRevision(1970, 5, 15);
    expect(countdownMay.nextPeriod).toBe("H2_JUL");
    expect(countdownMay.nextYear).toBe(1970);
    expect(countdownMay.daysRemaining).toBeGreaterThanOrEqual(46);
    expect(countdownMay.daysRemaining).toBeLessThanOrEqual(48);

    // 15 October 1970 -> Next is 1 January 1971 (~78 days)
    const countdownOct = getDaysUntilNextRevision(1970, 10, 15);
    expect(countdownOct.nextPeriod).toBe("H1_JAN");
    expect(countdownOct.nextYear).toBe(1971);
    expect(countdownOct.daysRemaining).toBeGreaterThanOrEqual(76);
    expect(countdownOct.daysRemaining).toBeLessThanOrEqual(79);
  });

  it("accurately detects upcoming commodity price spikes to inform warehouse stockpiling", () => {
    // 1973 H2 to 1974 H1: Energy index spikes massively
    const energyDelta = calculateProjectedRevisionDelta(1973, "H2_JUL", "ENERGY_PETROCHEM_INDEX");
    expect(energyDelta.direction).toBe("INCREASE");
    expect(energyDelta.deltaPct).toBeGreaterThan(25.0);
    expect(energyDelta.isSpikeWarning).toBe(true);
  });

  it("generates a complete unbroken 122-cycle timeline from 1970 through 2030", () => {
    const allRecords = getAllHistoricalRecords();
    expect(allRecords.length).toBe(122); // 61 years * 2 periods = 122

    // First is 1970 H1_JAN, last is 2030 H2_JUL
    expect(allRecords[0].year).toBe(1970);
    expect(allRecords[0].period).toBe("H1_JAN");
    expect(allRecords[allRecords.length - 1].year).toBe(2030);
    expect(allRecords[allRecords.length - 1].period).toBe("H2_JUL");

    // Every record is keyed and valid
    for (let yr = 1970; yr <= 2030; yr++) {
      expect(HISTORICAL_SEMI_ANNUAL_RECORDS[`${yr}_H1_JAN`]).toBeDefined();
      expect(HISTORICAL_SEMI_ANNUAL_RECORDS[`${yr}_H2_JUL`]).toBeDefined();
    }
  });
});
