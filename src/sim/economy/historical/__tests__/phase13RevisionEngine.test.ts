/**
 * ═══════════════════════════════════════════════════════════════════════════
 * UNIT TESTS — PHASE 13: MARKET REVISION ENGINE & STOCKPILE SPECULATION
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { describe, it, expect } from "vitest";
import {
  getMarketRevisionNotice,
  createStockpilePortfolio,
  buyStockpileAsset,
  consumeStockpileAsset,
  evaluateStockpilePortfolio,
} from "../revisionEngine";

describe("Phase 13: Market Revision Engine & Stockpile Speculation (1970–2026)", () => {
  it("should generate accurate market revision notices and countdown warnings", () => {
    // 1 January: Revision Day
    const revDay = getMarketRevisionNotice(1975, 1, 1);
    expect(revDay.warningStatus).toBe("REVISION_TODAY");
    expect(revDay.daysRemaining).toBe(0);
    expect(revDay.currentPeriodId).toBe("1975-H1");

    // 10 December: T-30 Critical warning before 1 Jan
    const t30 = getMarketRevisionNotice(1974, 12, 10);
    expect(t30.warningStatus).toBe("CRITICAL_T30");
    expect(t30.daysRemaining).toBeLessThanOrEqual(30);
    expect(t30.projectedShifts.length).toBeGreaterThan(0);

    // 2 November: T-60 Approaching warning
    const t60 = getMarketRevisionNotice(1974, 11, 2);
    expect(t60.warningStatus).toBe("APPROACHING_T60");
    expect(t60.daysRemaining).toBeLessThanOrEqual(60);

    // 1 August: Calm period
    const calm = getMarketRevisionNotice(1974, 8, 1);
    expect(calm.warningStatus).toBe("CALM");
    expect(calm.daysRemaining).toBeGreaterThan(60);
  });

  it("should provide tactical stockpile recommendations when large price increases are projected", () => {
    // In late 1973 (prior to 1974 crude oil embargo price surge)
    const notice1973 = getMarketRevisionNotice(1973, 12, 1);
    const oilShift = notice1973.projectedShifts.find(s => s.itemId === "CRUDE_OIL_WTI");

    expect(oilShift).toBeDefined();
    if (oilShift) {
      expect(oilShift.pctChange).toBeGreaterThan(0);
      expect(oilShift.direction).toBe("UP");
      expect(oilShift.tacticalRecommendation).toBe("STOCKPILE_RECOMMENDED");
    }
  });

  it("should simulate profitable stockpile speculation ahead of inflationary price spikes", () => {
    let portfolio = createStockpilePortfolio();
    expect(portfolio.totalCostBasisUSD).toBe(0);

    // Player buys 50 tonnes of Hot-Rolled Sheet Steel in January 1972
    const purchase = buyStockpileAsset(portfolio, {
      category: "INDUSTRIAL_MATERIAL",
      assetId: "BASIC_HOT_ROLLED_SHEET",
      quantity: 50, // 50 tonnes
      year: 1972,
      month: 1,
    });

    portfolio = purchase.portfolio;
    const initialUnitCost = purchase.entry.unitCostBasisUSD;
    expect(purchase.entry.quantity).toBe(50);
    expect(portfolio.totalCostBasisUSD).toBe(purchase.transactionCostUSD);
    expect(purchase.entry.monthlyStorageCostUSD).toBeGreaterThan(0);

    // Advance to July 1975 after stagflation inflation has surged steel prices
    const revalued = evaluateStockpilePortfolio(portfolio, 1975, 7);
    expect(revalued.totalMarketValueUSD).toBeGreaterThan(portfolio.totalCostBasisUSD);
    expect(revalued.totalUnrealizedGainUSD).toBeGreaterThan(0);
    expect(revalued.portfolioReturnPct).toBeGreaterThan(25); // Substantial appreciation

    // Player consumes 20 tonnes in vehicle assembly in July 1975
    const consumption = consumeStockpileAsset(revalued, {
      assetId: "BASIC_HOT_ROLLED_SHEET",
      quantity: 20,
      year: 1975,
      month: 7,
    });

    // Consumed cost basis is tied to 1972 acquisition cost
    expect(consumption.consumedCostBasisUSD).toBe(Math.round(20 * initialUnitCost * 100) / 100);
    // Replacement market cost is at 1975 inflated price
    expect(consumption.replacementMarketCostUSD).toBeGreaterThan(consumption.consumedCostBasisUSD);
    // Cost savings is positive!
    expect(consumption.costSavingsUSD).toBeGreaterThan(0);
    expect(consumption.remainingQuantity).toBe(30);
  });

  it("should accurately manage multiple stockpiled assets and holding costs", () => {
    let portfolio = createStockpilePortfolio();

    // Buy Aluminium and Crude Oil in 2000
    portfolio = buyStockpileAsset(portfolio, {
      category: "RAW_COMMODITY",
      assetId: "ALUMINIUM",
      quantity: 10,
      year: 2000,
      month: 1,
    }).portfolio;

    portfolio = buyStockpileAsset(portfolio, {
      category: "ENERGY_RESERVE",
      assetId: "CRUDE_OIL_WTI",
      quantity: 100, // 100 barrels
      year: 2000,
      month: 1,
    }).portfolio;

    expect(Object.keys(portfolio.items).length).toBe(2);
    expect(portfolio.totalMonthlyHoldingCostUSD).toBeGreaterThan(0);

    // Add more aluminium in same year to test weighted average cost basis
    const addAl = buyStockpileAsset(portfolio, {
      category: "RAW_COMMODITY",
      assetId: "ALUMINIUM",
      quantity: 10,
      year: 2000,
      month: 1,
    });

    expect(addAl.entry.quantity).toBe(20);
    expect(addAl.portfolio.items.ALUMINIUM.quantity).toBe(20);
  });
});
