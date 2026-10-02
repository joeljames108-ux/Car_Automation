import { describe, it, expect, beforeEach } from "vitest";
import {
  isAdvanceWarningDate,
  generateAdvanceForecastAlert,
  getForecastHistory,
  resetForecastHistory,
} from "../economicForecastEngine";
import {
  calculateRealizedHedgeSavings,
  calculateOptimalStockpileHedge,
} from "../../trade/warehouseHedgeEngine";

describe("Advance Economic Forecast & Warehouse Hedging Engine", () => {
  beforeEach(() => {
    resetForecastHistory();
  });

  it("identifies advance warning trigger dates correctly (T-60 and T-30)", () => {
    expect(isAdvanceWarningDate(5, 1)).toBe(true);  // 1 May (T-60 for July 1)
    expect(isAdvanceWarningDate(6, 1)).toBe(true);  // 1 Jun (T-30 for July 1)
    expect(isAdvanceWarningDate(11, 1)).toBe(true); // 1 Nov (T-60 for Jan 1)
    expect(isAdvanceWarningDate(12, 1)).toBe(true); // 1 Dec (T-30 for Jan 1)

    // Non-warning dates
    expect(isAdvanceWarningDate(5, 15)).toBe(false);
    expect(isAdvanceWarningDate(7, 1)).toBe(false);  // Revision day, not warning day
    expect(isAdvanceWarningDate(3, 1)).toBe(false);
  });

  it("generates an early T-60 economic forecast bulletin on 1 May", () => {
    const alert = generateAdvanceForecastAlert(1973, 5, 1);
    expect(alert).not.toBeNull();
    expect(alert?.type).toBe("T_60_EARLY_OUTLOOK");
    expect(alert?.targetRevisionDate).toBe("1 Jul 1973");
    expect(alert?.title).toContain("Economic Intelligence Memo");
  });

  it("generates an urgent T-30 notice on 1 June recommending stockpiles", () => {
    const alert = generateAdvanceForecastAlert(1973, 6, 1);
    expect(alert).not.toBeNull();
    expect(alert?.type).toBe("T_30_URGENT_NOTICE");
    expect(alert?.targetRevisionDate).toBe("1 Jul 1973");
    expect(alert?.title).toContain("URGENT NOTICE");
    expect(alert?.summaryMessage).toContain("protect vehicle profit margins");
  });

  it("stores forecast bulletins in chronological history ledger", () => {
    generateAdvanceForecastAlert(1970, 5, 1);
    generateAdvanceForecastAlert(1970, 6, 1);

    const history = getForecastHistory();
    expect(history.length).toBe(2);
    expect(history[0].type).toBe("T_30_URGENT_NOTICE"); // newest first
    expect(history[1].type).toBe("T_60_EARLY_OUTLOOK");
  });

  it("accurately calculates realized warehouse inventory hedge savings", () => {
    // Player consumed 50 tonnes of rubber and 120 tonnes of steel
    const realized = calculateRealizedHedgeSavings(
      [
        {
          materialKey: "BASIC_CARBON_STEEL",
          tonnesConsumed: 120,
          inventoryCostBasisUSD: 200,
          currentSpotPriceUSD: 285,
        },
        {
          materialKey: "VULCANIZED_RUBBER",
          tonnesConsumed: 50,
          inventoryCostBasisUSD: 500,
          currentSpotPriceUSD: 850,
        },
      ],
      1974,
      7
    );

    // Steel savings: 120 * (285 - 200) = 120 * 85 = 10,200
    // Rubber savings: 50 * (850 - 500) = 50 * 350 = 17,500
    // Total: 27,700
    expect(realized.totalRealizedSavingsUSD).toBe(27700);
    expect(realized.materialDetails.length).toBe(2);
    expect(realized.materialDetails[0].savingsPerTonneUSD).toBe(85);
    expect(realized.materialDetails[1].savingsPerTonneUSD).toBe(350);
  });

  it("generates optimal warehouse stockpile hedge recommendations given capacity", () => {
    // In June 1973 ahead of the oil crisis with 200 tonnes available capacity
    const plan = calculateOptimalStockpileHedge(200, 1973, 6);

    expect(plan.totalAvailableCapacityTonnes).toBe(200);
    expect(plan.nextRevisionDateStr).toBe("1 Jul 1973");
    expect(plan.recommendedMaterials.length).toBeGreaterThan(0);
    expect(plan.recommendedTotalTonnage).toBeGreaterThan(0);
    expect(plan.totalCapitalRequiredUSD).toBeGreaterThan(0);
    expect(plan.netProjectedSavingsUSD).toBeGreaterThan(0);
  });
});
