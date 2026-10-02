/**
 * ═══════════════════════════════════════════════════════════════════════════
 * UNIT TESTS — PHASE 12: NPC SUPPLIER & COMPETITOR ECONOMICS
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { describe, it, expect } from "vitest";
import {
  VOLUME_TIER_SPECS,
  NPC_SUPPLIER_RECORDS,
  NPC_SUPPLIER_HISTORY,
  getNPCSupplierRecord,
  getVolumeMultiplier,
  calculateComponentContractPrice,
  SupplierCategory,
} from "../npcSupplierEconomics";

describe("Phase 12: NPC Supplier & Competitor Economics (1970–2026)", () => {
  const categories: SupplierCategory[] = [
    "TIER1_ELECTRONICS",
    "TIER1_POWERTRAIN",
    "TIER1_CHASSIS_BRAKES",
    "TIER1_BODY_INTERIOR",
    "TIER2_SUBCOMPONENTS",
  ];

  it("should contain all 114 periods for each supplier category and competitor intel", () => {
    expect(Object.keys(NPC_SUPPLIER_RECORDS).length).toBe(114);
    expect(NPC_SUPPLIER_HISTORY.length).toBe(114);

    for (const record of NPC_SUPPLIER_HISTORY) {
      expect(record.competitorIntelligence).toBeDefined();
      expect(record.competitorIntelligence.marketCommentary.length).toBeGreaterThan(10);

      for (const cat of categories) {
        const s = record.suppliers[cat];
        expect(s).toBeDefined();
        expect(s.leadTimeWeeks).toBeGreaterThanOrEqual(4);
        expect(s.capacityUtilizationPct).toBeGreaterThan(60);
        expect(s.capacityUtilizationPct).toBeLessThanOrEqual(100);
        expect(s.disruptionIndex).toBeGreaterThanOrEqual(1.0);
      }
    }
  });

  it("should calculate volume discounts properly across order tiers", () => {
    // 500 units -> Prototype tier (+45% premium)
    const proto = getVolumeMultiplier(500);
    expect(proto.tier).toBe("PROTOTYPE_LOW");
    expect(proto.multiplier).toBe(1.45);

    // 5,000 units -> Pilot tier (+18% premium)
    const pilot = getVolumeMultiplier(5000);
    expect(pilot.tier).toBe("PILOT_BATCH");
    expect(pilot.multiplier).toBe(1.18);

    // 25,000 units -> Standard volume (1.00x base)
    const std = getVolumeMultiplier(25000);
    expect(std.tier).toBe("STANDARD_VOLUME");
    expect(std.multiplier).toBe(1.00);

    // 100,000 units -> High volume (-15% discount)
    const high = getVolumeMultiplier(100000);
    expect(high.tier).toBe("HIGH_VOLUME");
    expect(high.multiplier).toBe(0.85);

    // 500,000 units -> Mega scale (-26% discount)
    const mega = getVolumeMultiplier(500000);
    expect(mega.tier).toBe("MEGA_SCALE");
    expect(mega.multiplier).toBe(0.74);
  });

  it("should capture the 2021 global semiconductor shortage disruption", () => {
    const record2019 = getNPCSupplierRecord(2019, 1);
    const record2021 = getNPCSupplierRecord(2021, 7);

    // Lead times for electronics blew out from ~10 weeks to >30 weeks
    const elec2019 = record2019.suppliers.TIER1_ELECTRONICS;
    const elec2021 = record2021.suppliers.TIER1_ELECTRONICS;

    expect(elec2021.leadTimeWeeks).toBeGreaterThanOrEqual(35);
    expect(elec2021.leadTimeWeeks).toBeGreaterThan(elec2019.leadTimeWeeks * 2.5);
    expect(elec2021.disruptionIndex).toBeGreaterThanOrEqual(2.5);

    // Competitor behavior inverted: negative discount = markups over MSRP!
    expect(record2021.competitorIntelligence.competitorPriceAggressiveness).toBe("PREMIUM_MARKUP");
    expect(record2021.competitorIntelligence.averageDiscountOffMSRPPct).toBeLessThan(0);
  });

  it("should capture 2008 Great Financial Crisis aggressive discounting and distress", () => {
    const record2008 = getNPCSupplierRecord(2008, 7);
    expect(record2008.competitorIntelligence.competitorPriceAggressiveness).toBe("AGGRESSIVE_DISCOUNTING");
    expect(record2008.competitorIntelligence.averageDiscountOffMSRPPct).toBeGreaterThan(10);
    expect(record2008.suppliers.TIER1_POWERTRAIN.disruptionIndex).toBeGreaterThan(1.5);
  });

  it("should compute contract pricing including volume discount and disruption surcharges", () => {
    const baseCatalogCost = 500; // $500 component

    // High volume order in normal times (2018)
    const orderNormal = calculateComponentContractPrice(baseCatalogCost, "TIER1_POWERTRAIN", 60000, 2018, 1);
    expect(orderNormal.volumeTier).toBe("HIGH_VOLUME");
    expect(orderNormal.unitPriceUSD).toBe(425); // $500 * 0.85
    expect(orderNormal.totalOrderCostUSD).toBe(425 * 60000);

    // Small prototype order in 2021 crunch
    const orderCrisis = calculateComponentContractPrice(baseCatalogCost, "TIER1_ELECTRONICS", 500, 2021, 7);
    expect(orderCrisis.volumeTier).toBe("PROTOTYPE_LOW");
    // With shortage surcharge, price is elevated well above base
    expect(orderCrisis.unitPriceUSD).toBeGreaterThan(500 * 1.45);
    expect(orderCrisis.leadTimeWeeks).toBeGreaterThan(35);
  });
});
