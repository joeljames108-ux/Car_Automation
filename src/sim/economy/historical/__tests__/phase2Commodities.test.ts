/**
 * ═══════════════════════════════════════════════════════════════════════════
 * UNIT TESTS — PHASE 2: RAW COMMODITIES BACKBONE (WORLD BANK PINK SHEET)
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { describe, it, expect } from "vitest";
import {
  RAW_COMMODITY_SPECS,
  RAW_COMMODITY_RECORDS,
  RAW_COMMODITY_HISTORY,
  getCommodityRecord,
  getCommodityPrice,
  getCommodityHistory,
  calculateCommodityReturn,
  RawCommodityType,
} from "../rawCommodities";

describe("Phase 2: World Bank Raw Commodities Dataset (1970–2026)", () => {
  const commoditiesList: RawCommodityType[] = [
    "ALUMINIUM",
    "COPPER",
    "IRON_ORE",
    "LEAD",
    "NICKEL",
    "TIN",
    "ZINC",
    "RUBBER_RSS3",
  ];

  it("should contain all 114 periods for each of the 8 primary commodities", () => {
    expect(Object.keys(RAW_COMMODITY_RECORDS).length).toBe(114);
    expect(RAW_COMMODITY_HISTORY.length).toBe(114);

    for (const record of RAW_COMMODITY_HISTORY) {
      for (const comm of commoditiesList) {
        const item = record.commodities[comm];
        expect(item).toBeDefined();
        expect(item.priceUSD.value).toBeGreaterThan(0);
        expect(item.priceUSD.provenance.dataType).toBe("TYPE_A_DIRECT");
        expect(item.priceUSD.provenance.source).toContain("World Bank");
        expect(item.priceUSD.provenance.dateObserved).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    }
  });

  it("should match authentic historical quotations at 1970 founding era", () => {
    const rec1970 = getCommodityRecord(1970, 1);
    expect(rec1970.commodities.ALUMINIUM.priceUSD.value).toBe(605); // $/t
    expect(rec1970.commodities.COPPER.priceUSD.value).toBe(1410);   // $/t
    expect(rec1970.commodities.IRON_ORE.priceUSD.value).toBe(11.2); // $/dmt
    expect(rec1970.commodities.RUBBER_RSS3.priceUSD.value).toBe(0.44); // $/kg
  });

  it("should reflect 2026 World Bank Pink Sheet observations specified in requirements", () => {
    const rec2026 = getCommodityRecord(2026, 7);

    // Aluminium: $3,251/t in August 2026
    expect(rec2026.commodities.ALUMINIUM.priceUSD.value).toBe(3251);
    // Copper: $14,326/t
    expect(rec2026.commodities.COPPER.priceUSD.value).toBe(14326);
    // Iron ore: $96.3/dmt
    expect(rec2026.commodities.IRON_ORE.priceUSD.value).toBe(96.3);
    // Nickel: $16,751/t
    expect(rec2026.commodities.NICKEL.priceUSD.value).toBe(16751);
    // Zinc: $3,875/t
    expect(rec2026.commodities.ZINC.priceUSD.value).toBe(3875);
    // Rubber RSS3: $2.73/kg
    expect(rec2026.commodities.RUBBER_RSS3.priceUSD.value).toBe(2.73);
  });

  it("should exhibit non-uniform historical movements across different commodities", () => {
    // 2008 commodity bubble: copper soared to $8,450/t while iron ore was $155/dmt
    const rec2008H2 = getCommodityRecord(2008, 7);
    expect(rec2008H2.commodities.COPPER.priceUSD.value).toBe(8450);

    // 2009 GFC collapse: copper plunged while gold/other dynamics diverged
    const rec2009H1 = getCommodityRecord(2009, 1);
    expect(rec2009H1.commodities.COPPER.priceUSD.value).toBe(3450);
    expect(rec2009H1.commodities.COPPER.halfOnHalfGrowthPct).toBeLessThan(-50); // Dropped more than 50%!

    // 2011 Peak: Rubber reached all-time high of $5.45/kg
    const rec2011H1 = getCommodityRecord(2011, 1);
    expect(rec2011H1.commodities.RUBBER_RSS3.priceUSD.value).toBe(5.45);
  });

  it("should compute commodity return and compound growth correctly", () => {
    // Copper from 1970-H1 ($1,410) to 2026-H2 ($14,326)
    const ret = calculateCommodityReturn("COPPER", 1970, 1, 2026, 7);
    expect(ret.startPriceUSD).toBe(1410);
    expect(ret.endPriceUSD).toBe(14326);
    expect(ret.returnPct).toBeGreaterThan(900);
    expect(ret.compoundAnnualGrowthRatePct).toBeCloseTo(4.2, 0.5);
  });

  it("should retrieve chronological history for single commodity", () => {
    const copperHistory = getCommodityHistory("COPPER");
    expect(copperHistory.length).toBe(114);
    expect(copperHistory[0].periodId).toBe("1970-H1");
    expect(copperHistory[0].priceUSD).toBe(1410);
    expect(copperHistory[113].periodId).toBe("2026-H2");
    expect(copperHistory[113].priceUSD).toBe(14326);
  });
});
