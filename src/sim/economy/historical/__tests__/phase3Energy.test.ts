/**
 * ═══════════════════════════════════════════════════════════════════════════
 * UNIT TESTS — PHASE 3: ENERGY PRICES BACKBONE (EIA & WORLD BANK)
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { describe, it, expect } from "vitest";
import {
  ENERGY_SPECS,
  ENERGY_RECORDS,
  ENERGY_HISTORY,
  getEnergyRecord,
  getEnergyPrice,
  getEnergyHistory,
  calculateEnergyReturn,
  EnergyCommodityType,
} from "../energyPrices";

describe("Phase 3: EIA Energy Prices Dataset (1970–2026)", () => {
  const energyList: EnergyCommodityType[] = [
    "CRUDE_OIL_WTI",
    "NATURAL_GAS",
    "COAL_STEAM",
    "INDUSTRIAL_ELECTRICITY",
  ];

  it("should contain all 114 semi-annual periods with valid energy data", () => {
    expect(Object.keys(ENERGY_RECORDS).length).toBe(114);
    expect(ENERGY_HISTORY.length).toBe(114);

    for (const record of ENERGY_HISTORY) {
      for (const en of energyList) {
        const item = record.energyPrices[en];
        expect(item).toBeDefined();
        expect(item.priceUSD.value).toBeGreaterThan(0);
        expect(item.priceUSD.provenance.dataType).toBe("TYPE_A_DIRECT");
        expect(item.priceUSD.provenance.source).toContain("Energy Information Administration");
        expect(item.priceUSD.provenance.dateObserved).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    }
  });

  it("should match 1970 founding era energy baselines", () => {
    const rec1970 = getEnergyRecord(1970, 1);
    expect(rec1970.energyPrices.CRUDE_OIL_WTI.priceUSD.value).toBe(3.39); // $/bbl
    expect(rec1970.energyPrices.NATURAL_GAS.priceUSD.value).toBe(0.27);    // $/MMBtu
    expect(rec1970.energyPrices.COAL_STEAM.priceUSD.value).toBe(7.10);     // $/ton
    expect(rec1970.energyPrices.INDUSTRIAL_ELECTRICITY.priceUSD.value).toBe(1.02); // cents/kWh
    expect(rec1970.energyPrices.INDUSTRIAL_ELECTRICITY.priceUSDPerMWh).toBe(10.20); // $/MWh
  });

  it("should capture the First OPEC Oil Embargo shock (1973-1974)", () => {
    const preCrisis = getEnergyPrice("CRUDE_OIL_WTI", 1973, 7);
    const postCrisis = getEnergyPrice("CRUDE_OIL_WTI", 1974, 1);

    expect(preCrisis.priceUSD.value).toBe(4.31);
    expect(postCrisis.priceUSD.value).toBe(11.16); // More than 2.5x in 6 months!
    expect(postCrisis.halfOnHalfGrowthPct).toBeGreaterThan(150);
    expect(postCrisis.cpiRelativeMovement).toBe("OUTPERFORMING_CPI");
  });

  it("should capture historical extremes: 1980 peak, 1986 collapse, and 2008 peak", () => {
    // 1980 Second Oil Shock
    const rec1980 = getEnergyPrice("CRUDE_OIL_WTI", 1980, 1);
    expect(rec1980.priceUSD.value).toBe(37.42);

    // 1986 Crude Collapse
    const rec1986 = getEnergyPrice("CRUDE_OIL_WTI", 1986, 7);
    expect(rec1986.priceUSD.value).toBe(12.50);

    // 2008 All-time Peak ($138/bbl)
    const rec2008 = getEnergyPrice("CRUDE_OIL_WTI", 2008, 7);
    expect(rec2008.priceUSD.value).toBe(138.00);

    // 2009 Crash ($39.50/bbl)
    const rec2009 = getEnergyPrice("CRUDE_OIL_WTI", 2009, 1);
    expect(rec2009.priceUSD.value).toBe(39.50);
  });

  it("should reflect 2026 modern frontier energy rates", () => {
    const rec2026 = getEnergyRecord(2026, 7);
    expect(rec2026.energyPrices.CRUDE_OIL_WTI.priceUSD.value).toBe(73.80);
    expect(rec2026.energyPrices.NATURAL_GAS.priceUSD.value).toBe(2.65);
    expect(rec2026.energyPrices.COAL_STEAM.priceUSD.value).toBe(68.00);
    expect(rec2026.energyPrices.INDUSTRIAL_ELECTRICITY.priceUSD.value).toBe(8.98); // 8.98 c/kWh
    expect(rec2026.energyPrices.INDUSTRIAL_ELECTRICITY.priceUSDPerMWh).toBe(89.80); // $89.80/MWh
  });

  it("should compute energy returns and CAGR accurately", () => {
    // WTI from 1970 ($3.39) to 2026 ($73.80)
    const ret = calculateEnergyReturn("CRUDE_OIL_WTI", 1970, 1, 2026, 7);
    expect(ret.startPriceUSD).toBe(3.39);
    expect(ret.endPriceUSD).toBe(73.80);
    expect(ret.returnPct).toBeGreaterThan(2000);
    expect(ret.compoundAnnualGrowthRatePct).toBeCloseTo(5.6, 0.5);
  });
});
