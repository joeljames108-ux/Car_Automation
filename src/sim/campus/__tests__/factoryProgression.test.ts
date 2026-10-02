import { describe, it, expect } from "vitest";
import { FactoryProgressionEngine, DEFAULT_VEHICLE_BOM } from "../factoryProgressionEngine";
import { INITIAL_FACTORY_STATE, NPC_CONTRACT_MANUFACTURERS } from "../campusRegistry";

describe("Factory Progression & Deep Outsourced Manufacturing", () => {
  it("starts in outsourced state with 0 owned plant and active contract assembler", () => {
    expect(INITIAL_FACTORY_STATE.ownershipStatus).toBe("no_factory_outsourced");
    expect(INITIAL_FACTORY_STATE.landPurchased).toBe(false);
    expect(INITIAL_FACTORY_STATE.annualCapacity).toBe(0);

    const econ = FactoryProgressionEngine.getEconomicsSummary(INITIAL_FACTORY_STATE);
    expect(econ.isOutsourced).toBe(true);
    expect(econ.activePartner).toBeDefined();
    expect(econ.costBreakdown.totalOutsourcedUnitCost).toBeGreaterThan(4000);
  });

  it("calculates deep bill of materials (BOM) including raw materials, conversion, margin, and logistics", () => {
    const costBreakdown = FactoryProgressionEngine.calculateUnitCostBreakdown(INITIAL_FACTORY_STATE, DEFAULT_VEHICLE_BOM);

    // Raw Materials: 1200kg steel ($1440) + 150kg alum ($525) + 90kg plastic/rubber ($252) + 45kg glass ($94.5) + 4 tyres ($260) + elec ($380) = ~$2951.5
    expect(costBreakdown.materialsCost.totalMaterialsCost).toBeGreaterThan(2500);
    expect(costBreakdown.conversionCost).toBeGreaterThan(1500);
    expect(costBreakdown.factoryProfitMargin).toBeGreaterThan(200);
    expect(costBreakdown.logisticsFee).toBeGreaterThan(300);
    expect(costBreakdown.totalOutsourcedUnitCost).toBeGreaterThan(costBreakdown.materialsCost.totalMaterialsCost);
  });

  it("applies competitor surcharge when contracting with rival-owned plant (Nordic Auto Plant)", () => {
    const rivalState = FactoryProgressionEngine.selectContractPartner(INITIAL_FACTORY_STATE, "nordic_rival_plant").state;
    const costBreakdown = FactoryProgressionEngine.calculateUnitCostBreakdown(rivalState, DEFAULT_VEHICLE_BOM);

    expect(costBreakdown.competitorSurcharge).toBeGreaterThan(0);
    const econ = FactoryProgressionEngine.getEconomicsSummary(rivalState);
    expect(econ.activePartner?.isCompetitorOwned).toBe(true);
    expect(econ.rivalDelaysActive).toBe(true); // Relations < 50
  });

  it("handles land acquisition validation", () => {
    // Insufficient funds
    const failRes = FactoryProgressionEngine.purchaseLandPlot(INITIAL_FACTORY_STATE, 500000);
    expect(failRes.success).toBe(false);
    expect(failRes.message).toContain("Insufficient funds");

    // Sufficient funds
    const successRes = FactoryProgressionEngine.purchaseLandPlot(INITIAL_FACTORY_STATE, 25000000);
    expect(successRes.success).toBe(true);
    expect(successRes.state.landPurchased).toBe(true);
    expect(successRes.state.ownershipStatus).toBe("land_acquired");
  });

  it("progresses construction to commissioning Level 1 Workshop Plant (5,000 units/yr) and tier upgrades", () => {
    // 1. Buy land & break ground
    const landState = FactoryProgressionEngine.purchaseLandPlot(INITIAL_FACTORY_STATE, 30000000).state;
    const groundRes = FactoryProgressionEngine.beginConstruction(landState);
    expect(groundRes.success).toBe(true);

    // 2. Fast-forward construction 24 months
    let curState = groundRes.state;
    for (let m = 0; m < 24; m++) {
      const step = FactoryProgressionEngine.advanceConstructionMonth(curState, 1750000);
      curState = step.state;
      if (step.commissioned) break;
    }

    expect(curState.ownershipStatus).toBe("operational_owned");
    expect(curState.factoryLevel).toBe(1);
    expect(curState.factoryTier).toBe("workshop_plant");
    expect(curState.annualCapacity).toBe(5000); // Level 1 workshop plant

    // 3. Upgrade to Tier 2 (Small Assembly Plant: 15,000 units/yr)
    const tier2Res = FactoryProgressionEngine.upgradeFactoryTier(curState, 10000000);
    expect(tier2Res.success).toBe(true);
    expect(tier2Res.state.factoryLevel).toBe(2);
    expect(tier2Res.state.factoryTier).toBe("small_assembly_plant");
    expect(tier2Res.state.annualCapacity).toBe(15000);

    // 4. In-house assembly eliminates factory profit margin and saves substantial money
    const ownedCost = FactoryProgressionEngine.calculateUnitCostBreakdown(tier2Res.state, DEFAULT_VEHICLE_BOM);
    expect(ownedCost.factoryProfitMargin).toBe(0);
    expect(ownedCost.competitorSurcharge).toBe(0);
    expect(ownedCost.totalOutsourcedUnitCost).toBeLessThan(ownedCost.inHouseUnitCostEquivalent + 200);
  });
});
