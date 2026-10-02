/**
 * ═══════════════════════════════════════════════════════════════════════════
 * UNIT TESTS — PHASE 5: AUTOMOTIVE COMPONENTS COST ENGINE
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { describe, it, expect } from "vitest";
import {
  COMPONENT_RECIPES,
  COMPONENT_RECORDS,
  COMPONENT_HISTORY,
  getComponentRecord,
  getComponentCost,
  getComponentHistory,
  AutomotiveComponentId,
} from "../automotiveComponents";

describe("Phase 5: Automotive Components Cost Engine (1970–2026)", () => {
  const componentList: AutomotiveComponentId[] = [
    "VENTILATED_DISC_BRAKES_CAST_IRON",
    "CARBON_CERAMIC_BRAKE_SYSTEM",
    "MACPHERSON_STRUT_STEEL",
    "DOUBLE_WISHBONE_FORGED_ALUMINUM",
    "ACTIVE_MAGNETIC_DAMPER_SYSTEM",
    "MANUAL_5SPEED_GEARBOX",
    "AUTOMATIC_8SPEED_TORQUE_CONVERTER",
    "DUAL_CLUTCH_TRANSMISSION_DCT",
    "COMPLETE_V8_NATURALLY_ASPIRATED_ENGINE",
    "COMPLETE_TURBO_INLINE4_DIRECT_INJECTION",
    "ANALOG_CARBURETION_DISTRIBUTOR",
    "ELECTRONIC_ENGINE_CONTROL_UNIT_ECU",
    "ADAS_LEVEL2_RADAR_CAMERA_SUITE",
    "LITHIUM_ION_BATTERY_PACK_60KWH",
    "PERMANENT_MAGNET_TRACTION_MOTOR_150KW",
  ];

  it("should contain all 114 periods for each of the 15 automotive components", () => {
    expect(Object.keys(COMPONENT_RECORDS).length).toBe(114);
    expect(COMPONENT_HISTORY.length).toBe(114);

    for (const record of COMPONENT_HISTORY) {
      for (const comp of componentList) {
        const item = record.components[comp];
        expect(item).toBeDefined();
        expect(item.totalCostUSD.value).toBeGreaterThan(0);
        expect(item.totalCostUSD.provenance.dataType).toBe("TYPE_C_DERIVED");
        expect(item.totalCostUSD.provenance.source).toContain("Tier-1 Automotive Component");
        expect(item.totalCostUSD.provenance.dateObserved).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    }
  });

  it("should verify accurate unlock eras for advanced automotive components", () => {
    // 1970
    const rec1970 = getComponentRecord(1970, 1);
    expect(rec1970.components.VENTILATED_DISC_BRAKES_CAST_IRON.isUnlocked).toBe(true);
    expect(rec1970.components.COMPLETE_V8_NATURALLY_ASPIRATED_ENGINE.isUnlocked).toBe(true);
    expect(rec1970.components.CARBON_CERAMIC_BRAKE_SYSTEM.isUnlocked).toBe(false);     // Unlocks 2001
    expect(rec1970.components.LITHIUM_ION_BATTERY_PACK_60KWH.isUnlocked).toBe(false);   // Unlocks 2010
    expect(rec1970.components.ADAS_LEVEL2_RADAR_CAMERA_SUITE.isUnlocked).toBe(false);   // Unlocks 2014

    // 2005
    const rec2005 = getComponentRecord(2005, 1);
    expect(rec2005.components.CARBON_CERAMIC_BRAKE_SYSTEM.isUnlocked).toBe(true);
    expect(rec2005.components.DUAL_CLUTCH_TRANSMISSION_DCT.isUnlocked).toBe(true);
    expect(rec2005.components.LITHIUM_ION_BATTERY_PACK_60KWH.isUnlocked).toBe(false);

    // 2015
    const rec2015 = getComponentRecord(2015, 1);
    expect(rec2015.components.LITHIUM_ION_BATTERY_PACK_60KWH.isUnlocked).toBe(true);
    expect(rec2015.components.ADAS_LEVEL2_RADAR_CAMERA_SUITE.isUnlocked).toBe(true);
  });

  it("should demonstrate authentic EV battery pack cost deflation (2010 to 2026)", () => {
    const batt2010 = getComponentCost("LITHIUM_ION_BATTERY_PACK_60KWH", 2010, 1);
    const batt2018 = getComponentCost("LITHIUM_ION_BATTERY_PACK_60KWH", 2018, 1);
    const batt2026 = getComponentCost("LITHIUM_ION_BATTERY_PACK_60KWH", 2026, 7);

    // In 2010, early automotive packs cost > $60,000 (~$1,000/kWh)
    expect(batt2010.totalCostUSD.value).toBeGreaterThan(60000);
    // In 2018, cost dropped to ~$20,000 (~$350/kWh)
    expect(batt2018.totalCostUSD.value).toBeLessThan(35000);
    // In 2026, scaled volume production drops below $10,000 (<$150/kWh)
    expect(batt2026.totalCostUSD.value).toBeLessThan(10000);
  });

  it("should verify complete V8 engine cost progression from 1970 to 2026", () => {
    const v81970 = getComponentCost("COMPLETE_V8_NATURALLY_ASPIRATED_ENGINE", 1970, 1);
    const v82026 = getComponentCost("COMPLETE_V8_NATURALLY_ASPIRATED_ENGINE", 2026, 7);

    // 1970 V8: Material + labor + tooling around $300 - $400 in 1970 dollars
    expect(v81970.totalCostUSD.value).toBeGreaterThan(250);
    expect(v81970.totalCostUSD.value).toBeLessThan(500);

    // 2026 V8: Around $2,800 - $4,200 in 2026 dollars
    expect(v82026.totalCostUSD.value).toBeGreaterThan(2500);
    expect(v82026.totalCostUSD.value).toBeLessThan(4500);
  });

  it("should retrieve historical timeline for a component", () => {
    const history = getComponentHistory("MANUAL_5SPEED_GEARBOX");
    expect(history.length).toBe(114);
    expect(history[0].periodId).toBe("1970-H1");
    expect(history[113].periodId).toBe("2026-H2");
  });
});
