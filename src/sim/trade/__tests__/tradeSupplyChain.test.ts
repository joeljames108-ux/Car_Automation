/**
 * ═══════════════════════════════════════════════════════════════════════
 * RAW MATERIALS, TRADE & SUPPLY CHAIN UNIT TEST SUITE
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Verifies:
 * 1. HQ Warehouse Leveling (Levels 1-5, capacities, upgrades, spoilage, holding modifiers)
 * 2. Regional & Geographic Pricing (Landed cost, multi-modal freight, macro shocks)
 * 3. Economic Era Progression (Material unlocks by year, technological learning curves)
 */

import { describe, it, expect } from "vitest";
import {
  WAREHOUSE_LEVEL_SPECS,
  INITIAL_HQ_WAREHOUSE_STATE,
  checkWarehouseUpgradeEligibility,
  startWarehouseUpgrade,
  processMonthlyWarehouseTick,
  checkDeliveryCapacity,
  getWarehouseSummary,
  HQWarehouseState,
} from "../hqWarehouseEngine";
import {
  REGIONAL_COST_PROFILES,
  calculateMaterialLandedCost,
  compareSuppliersLandedCost,
  MACRO_REGIONAL_SHOCKS,
} from "../regionalPricingEngine";
import {
  MATERIAL_ERA_TIMELINE,
  COMPONENT_ERA_GATES,
  isMaterialUnlockedInYear,
  getUnlockedMaterialsForYear,
  getEraAdjustedMaterialPrice,
} from "../economicEraProgression";
import { NPC_SUPPLIERS } from "../supplierRegistry";
import { WarehouseInventoryRecord } from "../tradeTypes";
import { DEFAULT_MATERIAL_QUALITIES } from "../materialQualityEngine";

describe("HQ Warehouse Leveling System", () => {
  it("defines all 5 escalating warehouse tiers with proper capacities and features", () => {
    expect(WAREHOUSE_LEVEL_SPECS[1].totalCapacityTonnes).toBe(500);
    expect(WAREHOUSE_LEVEL_SPECS[2].totalCapacityTonnes).toBe(2000);
    expect(WAREHOUSE_LEVEL_SPECS[3].totalCapacityTonnes).toBe(8000);
    expect(WAREHOUSE_LEVEL_SPECS[4].totalCapacityTonnes).toBe(25000);
    expect(WAREHOUSE_LEVEL_SPECS[5].totalCapacityTonnes).toBe(80000);

    // Holding cost modifiers decrease with better infrastructure
    expect(WAREHOUSE_LEVEL_SPECS[1].holdingCostModifier).toBeGreaterThan(1.0);
    expect(WAREHOUSE_LEVEL_SPECS[3].holdingCostModifier).toBeLessThan(1.0);
    expect(WAREHOUSE_LEVEL_SPECS[5].holdingCostModifier).toBe(0.55);

    // Spoilage risk drops with climate control
    expect(WAREHOUSE_LEVEL_SPECS[1].spoilageRiskPctAnnual).toBe(5.0);
    expect(WAREHOUSE_LEVEL_SPECS[5].spoilageRiskPctAnnual).toBe(0.1);
  });

  it("evaluates upgrade eligibility correctly against year, reputation, and cash gates", () => {
    const state: HQWarehouseState = { ...INITIAL_HQ_WAREHOUSE_STATE };

    // In 1970 with low cash, Level 2 upgrade should be blocked by cash and year (unlockYear is 1974)
    const check1970 = checkWarehouseUpgradeEligibility(state, 1970, 5, 1_000_000);
    expect(check1970.canUpgrade).toBe(false);
    expect(check1970.blockedReasons.length).toBeGreaterThan(0);

    // In 1975 with sufficient cash and reputation, Level 2 upgrade should be permitted
    const check1975 = checkWarehouseUpgradeEligibility(state, 1975, 20, 50_000_000);
    expect(check1975.canUpgrade).toBe(true);
    expect(check1975.nextLevel).toBe(2);
    expect(check1975.blockedReasons.length).toBe(0);
  });

  it("handles starting an upgrade and monthly construction advancement", () => {
    const state: HQWarehouseState = { ...INITIAL_HQ_WAREHOUSE_STATE };
    const start = startWarehouseUpgrade(state, 1, 1975);
    expect(start.success).toBe(true);
    expect(start.newState.isUpgrading).toBe(true);
    expect(start.newState.upgradeTargetLevel).toBe(2);
    expect(start.newState.monthsRemainingOnUpgrade).toBe(WAREHOUSE_LEVEL_SPECS[1].constructionMonths);
    expect(start.capexDebitINR).toBe(WAREHOUSE_LEVEL_SPECS[1].upgradeCostINR);

    // Advance 1 month
    const mockInventory: WarehouseInventoryRecord[] = [
      {
        id: "steel_1",
        itemType: "BASIC_CARBON_STEEL",
        name: "Sheet Steel",
        level: "LEVEL_3_FORMED",
        unitsOnHand: 300,
        unitOfMeasure: "tonnes",
        averageUnitCost: 52000,
        qualityVector: DEFAULT_MATERIAL_QUALITIES.BASIC_CARBON_STEEL,
        overallQualityScore: 80,
        warehouseFacilityId: "WH_MAIN",
        holdingCostMonthlyRate: 0.01,
        reorderPoint: 50,
        safetyStockTarget: 100,
        storageMaxCapacity: 500,
      },
    ];

    let upgradingState = start.newState;
    const initialMonths = upgradingState.monthsRemainingOnUpgrade;

    const tick1 = processMonthlyWarehouseTick(upgradingState, mockInventory);
    expect(tick1.updatedState.monthsRemainingOnUpgrade).toBe(initialMonths - 1);
    expect(tick1.upgradeCompleted).toBe(false);

    // Simulate completion
    upgradingState = {
      ...upgradingState,
      monthsRemainingOnUpgrade: 1,
    };
    const finalTick = processMonthlyWarehouseTick(upgradingState, mockInventory);
    expect(finalTick.upgradeCompleted).toBe(true);
    expect(finalTick.updatedState.currentLevel).toBe(2);
    expect(finalTick.updatedState.isUpgrading).toBe(false);
  });

  it("checks delivery capacity and prevents overflow", () => {
    const state: HQWarehouseState = {
      ...INITIAL_HQ_WAREHOUSE_STATE,
      totalMaterialStoredTonnes: 450, // Capacity is 500
    };

    const delivery40t = checkDeliveryCapacity(state, 40);
    expect(delivery40t.canAccept).toBe(true);
    expect(delivery40t.remainingAfterDelivery).toBe(10);
    expect(delivery40t.overflowTonnes).toBe(0);

    const delivery100t = checkDeliveryCapacity(state, 100);
    expect(delivery100t.canAccept).toBe(false);
    expect(delivery100t.overflowTonnes).toBe(50);
  });

  it("produces comprehensive UI summary", () => {
    const state: HQWarehouseState = { ...INITIAL_HQ_WAREHOUSE_STATE };
    const summary = getWarehouseSummary(state, 1970, 10, 5_000_000);
    expect(summary.level).toBe(1);
    expect(summary.levelName).toBe("Workshop Yard");
    expect(summary.capacityTonnes).toBe(500);
    expect(summary.skuSlots).toBe(6);
    expect(summary.features.length).toBeGreaterThan(0);
  });
});

describe("Regional & Geographic Pricing Engine", () => {
  it("calculates landed cost with multi-modal freight distance", () => {
    // 50 tonnes of Steel from Rhine Valley (180 km) by Road Truck
    const landedRoad = calculateMaterialLandedCost(
      "BASIC_CARBON_STEEL",
      50,
      "Rhine Industrial Valley",
      "ROAD_TRUCK",
      false
    );

    expect(landedRoad.fobPricePerTonne).toBeGreaterThan(0);
    expect(landedRoad.freightCostTotal).toBeGreaterThan(0);
    expect(landedRoad.landedCostTotal).toBe(
      landedRoad.totalFOBPurchaseCost +
      landedRoad.freightCostTotal +
      landedRoad.portAndCustomsTariffTotal
    );

    // With factory rail spur, Heavy Rail should drastically cut freight
    const landedRail = calculateMaterialLandedCost(
      "BASIC_CARBON_STEEL",
      50,
      "Rhine Industrial Valley",
      "HEAVY_RAIL",
      true
    );

    expect(landedRail.freightCostTotal).toBeLessThan(landedRoad.freightCostTotal);
  });

  it("applies regional production advantages (e.g. Nordic aluminum discount)", () => {
    const nordicAluminum = calculateMaterialLandedCost(
      "ALUMINUM_SHEET_6000",
      20,
      "Nordic Hydropower Cluster",
      "ROAD_TRUCK",
      false
    );

    const rhineAluminum = calculateMaterialLandedCost(
      "ALUMINUM_SHEET_6000",
      20,
      "Rhine Industrial Valley",
      "ROAD_TRUCK",
      false
    );

    // Nordic FOB price for aluminum should be significantly cheaper than Rhine
    expect(nordicAluminum.fobPricePerTonne).toBeLessThan(rhineAluminum.fobPricePerTonne);
  });

  it("simulates macroeconomic shocks on FOB and freight", () => {
    const shock = MACRO_REGIONAL_SHOCKS.RUHR_COAL_MINERS_STRIKE;

    const normalCost = calculateMaterialLandedCost(
      "BASIC_CARBON_STEEL",
      100,
      "Rhine Industrial Valley",
      "ROAD_TRUCK",
      false,
      []
    );

    const shockedCost = calculateMaterialLandedCost(
      "BASIC_CARBON_STEEL",
      100,
      "Rhine Industrial Valley",
      "ROAD_TRUCK",
      false,
      [shock]
    );

    expect(shockedCost.fobPricePerTonne).toBeGreaterThan(normalCost.fobPricePerTonne);
    expect(shockedCost.activeShockNotice).toBeDefined();
  });

  it("compares and ranks suppliers by delivered landed cost", () => {
    const comparisons = compareSuppliersLandedCost(
      "BASIC_CARBON_STEEL",
      100,
      NPC_SUPPLIERS,
      true
    );

    expect(comparisons.length).toBeGreaterThan(0);
    // Rank 1 should be the cheapest total landed cost
    expect(comparisons[0].rank).toBe(1);
    for (let i = 1; i < comparisons.length; i++) {
      expect(comparisons[i].landedCost.landedCostTotal).toBeGreaterThanOrEqual(
        comparisons[i - 1].landedCost.landedCostTotal
      );
    }
  });
});

describe("Economic Era Progression Engine", () => {
  it("enforces historical material unlocks across decades", () => {
    // 1970 Baseline
    expect(isMaterialUnlockedInYear("BASIC_CARBON_STEEL", 1970)).toBe(true);
    expect(isMaterialUnlockedInYear("DUCTILE_CAST_IRON", 1970)).toBe(true);
    expect(isMaterialUnlockedInYear("ALUMINUM_SHEET_6000", 1970)).toBe(false);
    expect(isMaterialUnlockedInYear("CARBON_FIBER_PREPREG", 1970)).toBe(false);

    // 1985
    expect(isMaterialUnlockedInYear("ALUMINUM_SHEET_6000", 1985)).toBe(true);
    expect(isMaterialUnlockedInYear("CARBON_FIBER_PREPREG", 1985)).toBe(false);

    // 1990
    expect(isMaterialUnlockedInYear("CARBON_FIBER_PREPREG", 1990)).toBe(true);
    expect(isMaterialUnlockedInYear("TITANIUM_GRADE_5", 1990)).toBe(false);

    // 2000
    expect(isMaterialUnlockedInYear("TITANIUM_GRADE_5", 2000)).toBe(true);
  });

  it("computes learning curve cost reductions as technology matures", () => {
    // Carbon fiber unlocks in 1990 at high initial cost and matures by 2012
    const cf1990 = getEraAdjustedMaterialPrice("CARBON_FIBER_PREPREG", 1990);
    const cf2012 = getEraAdjustedMaterialPrice("CARBON_FIBER_PREPREG", 2012);

    expect(cf1990.isUnlocked).toBe(true);
    expect(cf1990.learningCurveSavingsPct).toBe(0);
    expect(cf2012.learningCurveSavingsPct).toBeGreaterThan(40);
  });

  it("lists all unlocked materials for a given historical year", () => {
    const mats1970 = getUnlockedMaterialsForYear(1970);
    const mats2000 = getUnlockedMaterialsForYear(2000);

    expect(mats1970.length).toBeLessThan(mats2000.length);
    expect(mats1970).toContain("BASIC_CARBON_STEEL");
    expect(mats2000).toContain("TITANIUM_GRADE_5");
  });
});
