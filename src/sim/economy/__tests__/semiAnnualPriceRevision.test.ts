import { describe, it, expect, beforeEach } from "vitest";
import {
  isSemiAnnualRevisionDate,
  getRevisionPeriodForMonth,
  executeSemiAnnualPriceRevision,
  recordExecutedRevision,
  getLatestExecutedRevision,
  getRevisionHistory,
  resetRevisionHistory,
  BASE_1970_PROCESSED_MATERIALS_USD,
  BASE_1970_SALARIES_MONTHLY_USD,
  BASE_1970_VEHICLE_BENCHMARKS_USD,
} from "../semiAnnualPriceRevisionEngine";

describe("Biannual Semi-Annual Price Revision Engine", () => {
  beforeEach(() => {
    resetRevisionHistory();
  });

  it("triggers revision exactly on 1st January and 1st July only", () => {
    expect(isSemiAnnualRevisionDate(1, 1)).toBe(true);  // 1 Jan
    expect(isSemiAnnualRevisionDate(7, 1)).toBe(true);  // 1 Jul
    expect(isSemiAnnualRevisionDate(1, 2)).toBe(false); // 2 Jan
    expect(isSemiAnnualRevisionDate(6, 30)).toBe(false); // 30 Jun
    expect(isSemiAnnualRevisionDate(12, 1)).toBe(false); // 1 Dec
  });

  it("determines correct period from calendar month", () => {
    expect(getRevisionPeriodForMonth(1)).toBe("H1_JAN");
    expect(getRevisionPeriodForMonth(6)).toBe("H1_JAN");
    expect(getRevisionPeriodForMonth(7)).toBe("H2_JUL");
    expect(getRevisionPeriodForMonth(12)).toBe("H2_JUL");
  });

  it("calculates 1970 H1_JAN baseline without price inflation", () => {
    const rev1970 = executeSemiAnnualPriceRevision(1970, "H1_JAN");

    expect(rev1970.year).toBe(1970);
    expect(rev1970.period).toBe("H1_JAN");
    expect(rev1970.dateStr).toBe("1 Jan 1970");
    expect(rev1970.processedMaterials.BASIC_CARBON_STEEL.priceUSD).toBe(BASE_1970_PROCESSED_MATERIALS_USD.BASIC_CARBON_STEEL);
    expect(rev1970.salaries.ENGINEERING.monthlySalaryUSD).toBe(BASE_1970_SALARIES_MONTHLY_USD.ENGINEERING);
    expect(rev1970.vehicleBenchmarks.ECONOMY.benchmarkMSRPUSD).toBe(BASE_1970_VEHICLE_BENCHMARKS_USD.ECONOMY);
    expect(rev1970.macroIndices.cpi).toBe(1.000);
  });

  it("escalates energy-intensive materials during the 1973/1974 oil crisis", () => {
    const rev1973 = executeSemiAnnualPriceRevision(1973, "H2_JUL");
    const rev1974 = executeSemiAnnualPriceRevision(1974, "H1_JAN", rev1973);

    // Rubber and polymers spike
    expect(rev1974.processedMaterials.VULCANIZED_RUBBER.priceUSD).toBeGreaterThan(rev1973.processedMaterials.VULCANIZED_RUBBER.priceUSD);
    expect(rev1974.inflationRiskLevel).toBe("SEVERE");
    expect(rev1974.topIncreases.length).toBeGreaterThan(0);

    // Trucking freight rate rises due to diesel prices
    expect(rev1974.freightRates.truckUSD).toBeGreaterThan(rev1973.freightRates.truckUSD);
  });

  it("identifies warehouse hedging opportunities ahead of high-inflation periods", () => {
    // In 1973 H2_JUL, the next revision (1974 H1) will experience an oil shock surge
    const rev1973 = executeSemiAnnualPriceRevision(1973, "H2_JUL");
    const hedge = rev1973.warehouseHedgingOpportunity;

    expect(hedge.recommendedStockpileMaterials.length).toBeGreaterThan(0);
    expect(hedge.recommendedStockpileMaterials).toContain("VULCANIZED_RUBBER");
    expect(hedge.potentialCostSavingsPct).toBeGreaterThan(10.0);
    expect(hedge.rationale).toContain("Filling warehouse space");
  });

  it("maintains an audit history ledger of executed revisions", () => {
    expect(getLatestExecutedRevision()).toBeNull();

    const rev1 = executeSemiAnnualPriceRevision(1970, "H1_JAN");
    recordExecutedRevision(rev1);

    expect(getLatestExecutedRevision()).not.toBeNull();
    expect(getLatestExecutedRevision()?.revisionId).toBe("REV_1970_H1_JAN");

    const rev2 = executeSemiAnnualPriceRevision(1970, "H2_JUL", rev1);
    recordExecutedRevision(rev2);

    const history = getRevisionHistory();
    expect(history.length).toBe(2);
    expect(history[0].revisionId).toBe("REV_1970_H1_JAN");
    expect(history[1].revisionId).toBe("REV_1970_H2_JUL");
  });
});
