/**
 * ═══════════════════════════════════════════════════════════════════════════
 * UNIT TESTS — PHASE 8: LOGISTICS, FREIGHT TARIFFS & WAREHOUSING
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { describe, it, expect } from "vitest";
import {
  LOGISTICS_MODE_SPECS,
  LOGISTICS_RECORDS,
  LOGISTICS_HISTORY,
  getLogisticsRecord,
  getLogisticsTariff,
  LogisticsModeId,
} from "../logistics";

describe("Phase 8: Logistics & Freight Tariffs Engine (1970–2026)", () => {
  const modeList: LogisticsModeId[] = [
    "CLASS8_SEMI_TRUCK",
    "INTERMODAL_RAIL_FREIGHT",
    "OCEAN_MARITIME_RORO",
    "OCEAN_CONTAINER_FEU",
    "AIR_FREIGHT_EXPEDITE",
    "WAREHOUSE_DRY_STORAGE",
    "WAREHOUSE_COLD_STORAGE",
  ];

  it("should contain all 114 periods for each of the 7 logistics modes", () => {
    expect(Object.keys(LOGISTICS_RECORDS).length).toBe(114);
    expect(LOGISTICS_HISTORY.length).toBe(114);

    for (const record of LOGISTICS_HISTORY) {
      for (const mode of modeList) {
        const item = record.tariffs[mode];
        expect(item).toBeDefined();
        expect(item.tariffUSD.value).toBeGreaterThan(0);
        expect(item.tariffUSD.provenance.dataType).toBe("TYPE_B_INDEX");
        expect(item.tariffUSD.provenance.source).toContain("BLS Transportation PPI");
        expect(item.tariffUSD.provenance.dateObserved).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    }
  });

  it("should verify 1970 founding era freight tariffs", () => {
    const rec1970 = getLogisticsRecord(1970, 1);
    expect(rec1970.tariffs.CLASS8_SEMI_TRUCK.tariffUSD.value).toBe(0.48); // $0.48/mile
    expect(rec1970.tariffs.OCEAN_MARITIME_RORO.tariffUSD.value).toBe(185); // $185/car
    expect(rec1970.tariffs.WAREHOUSE_DRY_STORAGE.tariffUSD.value).toBe(3.50); // $3.50/t/mo
  });

  it("should capture the historic 2021 pandemic container shipping crisis", () => {
    const preCrisis = getLogisticsTariff("OCEAN_CONTAINER_FEU", 2019, 1);
    const peakCrisis = getLogisticsTariff("OCEAN_CONTAINER_FEU", 2021, 7);

    // In 2019: Container FEU was ~$3,500
    expect(preCrisis.tariffUSD.value).toBeLessThan(5000);
    // In H2 2021: Exploded over $12,000/FEU
    expect(peakCrisis.tariffUSD.value).toBeGreaterThan(12000);
  });

  it("should reflect energy-intensive freight tariffs during 2008 oil spike", () => {
    const truck2008 = getLogisticsTariff("CLASS8_SEMI_TRUCK", 2008, 7);
    const air2008 = getLogisticsTariff("AIR_FREIGHT_EXPEDITE", 2008, 7);

    // Trucking reached near $3.00/mile when diesel was high
    expect(truck2008.tariffUSD.value).toBeGreaterThan(2.70);
    // Air cargo jumped to over $7.00/kg
    expect(air2008.tariffUSD.value).toBeGreaterThan(7.00);
  });

  it("should verify cryogenic cold storage carries premium over dry storage", () => {
    const dry = getLogisticsTariff("WAREHOUSE_DRY_STORAGE", 2026, 7);
    const cold = getLogisticsTariff("WAREHOUSE_COLD_STORAGE", 2026, 7);

    // Sub-zero storage for prepreg carbon fiber is ~5x to 6x more expensive due to industrial cooling power
    expect(cold.tariffUSD.value).toBeGreaterThan(dry.tariffUSD.value * 4);
  });
});
