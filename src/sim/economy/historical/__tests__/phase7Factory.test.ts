/**
 * ═══════════════════════════════════════════════════════════════════════════
 * UNIT TESTS — PHASE 7: FACTORIES, MACHINERY & CAPITAL EXPENDITURE
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { describe, it, expect } from "vitest";
import {
  INDUSTRIAL_ASSET_SPECS,
  FACTORY_MACHINERY_RECORDS,
  FACTORY_MACHINERY_HISTORY,
  getFactoryMachineryRecord,
  getIndustrialAssetCost,
  IndustrialAssetId,
} from "../factoryAndMachinery";

describe("Phase 7: Factories & Machinery CapEx Engine (1970–2026)", () => {
  const assetList: IndustrialAssetId[] = [
    "ASSEMBLY_PLANT_TIER1_PILOT",
    "ASSEMBLY_PLANT_TIER2_REGIONAL",
    "MEGA_GIGA_FACTORY",
    "PARTS_LOGISTICS_WAREHOUSE",
    "STAMPING_PRESS_LINE_TANDEM",
    "GIGA_PRESS_CASTING_MACHINE",
    "FIVE_AXIS_CNC_MILLING_CELL",
    "ROBOTIC_BODY_WELDING_CELL",
    "CLEANROOM_PAINT_BOOTH_LINE",
    "CHASSIS_DYNAMOMETER_TEST_CELL",
    "AERODYNAMIC_WIND_TUNNEL",
  ];

  it("should contain all 114 periods for each of the 11 industrial assets", () => {
    expect(Object.keys(FACTORY_MACHINERY_RECORDS).length).toBe(114);
    expect(FACTORY_MACHINERY_HISTORY.length).toBe(114);

    for (const record of FACTORY_MACHINERY_HISTORY) {
      for (const asset of assetList) {
        const item = record.assets[asset];
        expect(item).toBeDefined();
        expect(item.capexUSD.value).toBeGreaterThan(0);
        expect(item.monthlyMaintenanceUSD.value).toBeGreaterThan(0);
        expect(item.capexUSD.provenance.dataType).toBe("TYPE_B_INDEX");
        expect(item.capexUSD.provenance.dateObserved).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    }
  });

  it("should verify accurate unlock eras for advanced manufacturing machinery", () => {
    // 1970
    const rec1970 = getFactoryMachineryRecord(1970, 1);
    expect(rec1970.assets.ASSEMBLY_PLANT_TIER1_PILOT.isUnlocked).toBe(true);
    expect(rec1970.assets.ROBOTIC_BODY_WELDING_CELL.isUnlocked).toBe(false); // Unlocks 1980
    expect(rec1970.assets.MEGA_GIGA_FACTORY.isUnlocked).toBe(false);         // Unlocks 1990
    expect(rec1970.assets.GIGA_PRESS_CASTING_MACHINE.isUnlocked).toBe(false); // Unlocks 2019

    // 1985
    const rec1985 = getFactoryMachineryRecord(1985, 1);
    expect(rec1985.assets.ROBOTIC_BODY_WELDING_CELL.isUnlocked).toBe(true);
    expect(rec1985.assets.MEGA_GIGA_FACTORY.isUnlocked).toBe(false);

    // 2020
    const rec2020 = getFactoryMachineryRecord(2020, 1);
    expect(rec2020.assets.MEGA_GIGA_FACTORY.isUnlocked).toBe(true);
    expect(rec2020.assets.GIGA_PRESS_CASTING_MACHINE.isUnlocked).toBe(true);
  });

  it("should reflect realistic nominal CapEx escalation between 1970 and 2026", () => {
    const plant1970 = getIndustrialAssetCost("ASSEMBLY_PLANT_TIER1_PILOT", 1970, 1);
    const plant2026 = getIndustrialAssetCost("ASSEMBLY_PLANT_TIER1_PILOT", 2026, 7);

    // 1970: $1.85M
    expect(plant1970.capexUSD.value).toBe(1850000);
    // 2026: ~8x to 10x escalation (around $15M - $20M)
    expect(plant2026.capexUSD.value).toBeGreaterThan(14000000);
    expect(plant2026.capexUSD.value).toBeLessThan(22000000);
  });

  it("should calculate annual depreciation correctly", () => {
    const plant = getIndustrialAssetCost("ASSEMBLY_PLANT_TIER1_PILOT", 1970, 1);
    // $1,850,000 / 30 years = $61,667
    expect(plant.annualDepreciationUSD).toBeCloseTo(61667, -1);
  });
});
