/**
 * ═══════════════════════════════════════════════════════════════════════════
 * UNIT TESTS — MASTER UNIFIED HISTORICAL ECONOMIC UNIVERSE API
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { describe, it, expect } from "vitest";
import {
  getHistoricalUniverse,
  getHistoricalUniverseByPeriod,
  compareEconomicEras,
} from "../masterLookup";

describe("Master Historical Economic Universe API (1970–2026)", () => {
  it("should return a fully populated, coherent economic universe for founding era (1970-H1)", () => {
    const u1970 = getHistoricalUniverse(1970, 1, 1);

    expect(u1970.period.periodId).toBe("1970-H1");
    expect(u1970.year).toBe(1970);
    expect(u1970.revision).toBe("H1_JAN");

    // Phase 1: Macro & Wage
    expect(u1970.cpi.cpiU.value).toBe(37.8);
    expect(u1970.wages.productionWorkerHourlyUSD.value).toBe(3.17);

    // Phase 2: World Bank Commodities
    expect(u1970.commodities.commodities.COPPER.priceUSD.value).toBeGreaterThan(1000);
    expect(u1970.commodities.commodities.ALUMINIUM.priceUSD.value).toBeGreaterThan(500);

    // Phase 3: Energy
    expect(u1970.energy.energyPrices.CRUDE_OIL_WTI.priceUSD.value).toBe(3.39);

    // Phase 4: Materials
    expect(u1970.materials.materials.BASIC_HOT_ROLLED_SHEET.priceUSD.value).toBeGreaterThan(100);

    // Phase 5: Components (Authentic 1970 nominal USD cost: ~$304)
    expect(u1970.components.components.COMPLETE_V8_NATURALLY_ASPIRATED_ENGINE.totalCostUSD.value).toBeGreaterThan(250);

    // Phase 6: Salaries
    expect(u1970.salaries.roles["RD_CHIEF_ENGINEER"].monthlySalaryUSD).toBeGreaterThan(u1970.salaries.roles["MANUFACTURING_PRODUCTION_WORKER"].monthlySalaryUSD);

    // Phase 7: Factories
    expect(u1970.factories.assets.ASSEMBLY_PLANT_TIER2_REGIONAL.capexUSD.value).toBeGreaterThan(10000000);

    // Phase 8: Logistics
    expect(u1970.logistics.tariffs.CLASS8_SEMI_TRUCK.tariffUSD.value).toBeCloseTo(0.48, 2);

    // Phase 9: Corporate
    expect(u1970.corporate.costs.FED_FUNDS_INTEREST_RATE.rateValue.value).toBeCloseTo(8.98, 1);

    // Phase 10: Vehicles
    expect(u1970.vehicles.vehicles.ECONOMY_SUBCOMPACT.msrpUSD.value).toBe(2195);
    expect(u1970.vehicles.vehicles.FAMILY_SEDAN.msrpUSD.value).toBe(3550);

    // Phase 11: Motorsport
    expect(u1970.motorsport.series.FORMULA_ONE.SEASON_ENTRY_FEE.costUSD.value).toBe(5000);

    // Phase 12: NPC Suppliers
    expect(u1970.suppliers.suppliers.TIER1_POWERTRAIN.leadTimeWeeks).toBeGreaterThanOrEqual(10);

    // Phase 13: Market Notice
    expect(u1970.marketNotice.warningStatus).toBe("REVISION_TODAY");
  });

  it("should return the frontier 2026-H2 universe matching all calibrated target values", () => {
    const u2026 = getHistoricalUniverse(2026, 7, 1);

    expect(u2026.period.periodId).toBe("2026-H2");
    expect(u2026.cpi.cpiU.value).toBe(333.5);
    expect(u2026.wages.productionWorkerHourlyUSD.value).toBe(30.75);

    // Prompt specified exact 2026 target commodity values:
    expect(u2026.commodities.commodities.ALUMINIUM.priceUSD.value).toBe(3251);
    expect(u2026.commodities.commodities.COPPER.priceUSD.value).toBe(14326);
    expect(u2026.commodities.commodities.IRON_ORE.priceUSD.value).toBe(96.3);
    expect(u2026.commodities.commodities.NICKEL.priceUSD.value).toBe(16751);
    expect(u2026.commodities.commodities.ZINC.priceUSD.value).toBe(3875);
    expect(u2026.commodities.commodities.RUBBER_RSS3.priceUSD.value).toBe(2.73);

    // Modern technology components unlocked:
    expect(u2026.components.components.LITHIUM_ION_BATTERY_PACK_60KWH.isUnlocked).toBe(true);
    expect(u2026.components.components.ADAS_LEVEL2_RADAR_CAMERA_SUITE.isUnlocked).toBe(true);

    // Modern vehicles MSRP:
    expect(u2026.vehicles.vehicles.FAMILY_SEDAN.msrpUSD.value).toBeGreaterThanOrEqual(32000);
    expect(u2026.vehicles.vehicles.HALO_HYPERCAR.msrpUSD.value).toBeGreaterThanOrEqual(2500000);
  });

  it("should query universe by period ID correctly", () => {
    const u1985 = getHistoricalUniverseByPeriod("1985-H2");
    expect(u1985.period.periodId).toBe("1985-H2");
    expect(u1985.year).toBe(1985);
    expect(u1985.revision).toBe("H2_JUL");
  });

  it("should produce insightful era comparisons and purchasing power calculations", () => {
    const comparison = compareEconomicEras(1970, 1, 2026, 7);

    expect(comparison.yearsSpan).toBe(56.5);
    expect(comparison.cpiInflationFactor).toBeCloseTo(8.82, 1);
    expect(comparison.wageGrowthFactor).toBeCloseTo(9.70, 1);
    expect(comparison.purchasingPowerLossPct).toBeGreaterThan(85);
    expect(comparison.summary.length).toBeGreaterThan(50);
  });
});
