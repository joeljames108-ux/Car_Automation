/**
 * ═══════════════════════════════════════════════════════════════════════════
 * UNIT TESTS — PHASE 4: INDUSTRIAL MATERIALS (METALS, POLYMERS, COMPOSITES)
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { describe, it, expect } from "vitest";
import {
  INDUSTRIAL_MATERIAL_SPECS,
  INDUSTRIAL_MATERIAL_RECORDS,
  INDUSTRIAL_MATERIAL_HISTORY,
  getIndustrialMaterialRecord,
  getIndustrialMaterialPrice,
  getIndustrialMaterialHistory,
  IndustrialMaterialId,
} from "../industrialMaterials";

describe("Phase 4: Industrial Materials Engine (1970–2026)", () => {
  const materialsList: IndustrialMaterialId[] = [
    "BASIC_HOT_ROLLED_SHEET",
    "HIGH_STRENGTH_STEEL_HSLA",
    "ADVANCED_UHSS_BORON",
    "DUCTILE_CAST_IRON",
    "ALUMINUM_SHEET_6000",
    "ALUMINUM_FORGING_7000",
    "MAGNESIUM_ALLOY_CAST",
    "TITANIUM_GRADE_5",
    "CARBON_FIBER_PREPREG",
    "AUTOMOTIVE_POLYMERS",
    "SYNTHETIC_RUBBER_EPDM",
    "AUTOMOTIVE_FLOAT_GLASS",
    "AUTOMOTIVE_COATINGS_PAINT",
    "STRUCTURAL_ADHESIVES",
  ];

  it("should contain all 114 periods for each of the 14 industrial materials", () => {
    expect(Object.keys(INDUSTRIAL_MATERIAL_RECORDS).length).toBe(114);
    expect(INDUSTRIAL_MATERIAL_HISTORY.length).toBe(114);

    for (const record of INDUSTRIAL_MATERIAL_HISTORY) {
      for (const mat of materialsList) {
        const item = record.materials[mat];
        expect(item).toBeDefined();
        expect(item.priceUSD.value).toBeGreaterThan(0);
        expect(item.priceUSD.provenance.dataType).toBe("TYPE_B_INDEX");
        expect(item.priceUSD.provenance.source).toContain("BLS Producer Price Index");
        expect(item.priceUSD.provenance.dateObserved).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    }
  });

  it("should accurately reflect unlock eras for advanced materials", () => {
    // 1970
    const rec1970 = getIndustrialMaterialRecord(1970, 1);
    expect(rec1970.materials.BASIC_HOT_ROLLED_SHEET.isUnlocked).toBe(true);
    expect(rec1970.materials.HIGH_STRENGTH_STEEL_HSLA.isUnlocked).toBe(false); // Unlocks 1980
    expect(rec1970.materials.ADVANCED_UHSS_BORON.isUnlocked).toBe(false);      // Unlocks 1995
    expect(rec1970.materials.CARBON_FIBER_PREPREG.isUnlocked).toBe(false);     // Unlocks 1980

    // 1985
    const rec1985 = getIndustrialMaterialRecord(1985, 1);
    expect(rec1985.materials.HIGH_STRENGTH_STEEL_HSLA.isUnlocked).toBe(true);
    expect(rec1985.materials.CARBON_FIBER_PREPREG.isUnlocked).toBe(true);
    expect(rec1985.materials.ADVANCED_UHSS_BORON.isUnlocked).toBe(false);

    // 2000
    const rec2000 = getIndustrialMaterialRecord(2000, 1);
    expect(rec2000.materials.ADVANCED_UHSS_BORON.isUnlocked).toBe(true);
  });

  it("should demonstrate carbon fiber technological learning deflation", () => {
    const cf1980 = getIndustrialMaterialPrice("CARBON_FIBER_PREPREG", 1980, 1);
    const cf2000 = getIndustrialMaterialPrice("CARBON_FIBER_PREPREG", 2000, 1);
    const cf2026 = getIndustrialMaterialPrice("CARBON_FIBER_PREPREG", 2026, 7);

    // Early autoclave carbon fiber was over $140/kg
    expect(cf1980.priceUSD.value).toBeGreaterThan(140);
    // Scaled down to ~$55-60/kg in 2000
    expect(cf2000.priceUSD.value).toBeLessThan(75);
    // Modern scaled production below $30/kg
    expect(cf2026.priceUSD.value).toBeLessThan(35);
  });

  it("should reflect hot-rolled steel price dynamics tied to iron ore and energy", () => {
    const steel1970 = getIndustrialMaterialPrice("BASIC_HOT_ROLLED_SHEET", 1970, 1);
    const steel2008 = getIndustrialMaterialPrice("BASIC_HOT_ROLLED_SHEET", 2008, 7); // Commodity peak
    const steel2026 = getIndustrialMaterialPrice("BASIC_HOT_ROLLED_SHEET", 2026, 7);

    expect(steel1970.priceUSD.value).toBeCloseTo(185, -2); // Around $180-220/t in 1970
    expect(steel2008.priceUSD.value).toBeGreaterThan(1100); // Exceeded $1,100/t in mid-2008
    expect(steel2026.priceUSD.value).toBeGreaterThan(700);  // Around $800/t in 2026
  });

  it("should retrieve historical timeline for a material", () => {
    const history = getIndustrialMaterialHistory("ALUMINUM_SHEET_6000");
    expect(history.length).toBe(114);
    expect(history[0].periodId).toBe("1970-H1");
    expect(history[113].periodId).toBe("2026-H2");
  });
});
