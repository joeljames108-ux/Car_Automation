import { describe, it, expect } from "vitest";
import {
  solveInHouseProductionConstraints,
  calculateContractManufacturerQuote,
  CONTRACT_MANUFACTURERS_CATALOG,
} from "../../sim/manufacturing/manufacturingSystemEngine";

describe("Manufacturing Operations & Dual-Route Assembly System", () => {
  it("verifies all 7 contract manufacturers and rivals exist in catalog", () => {
    expect(CONTRACT_MANUFACTURERS_CATALOG.length).toBe(7);

    const partnerIds = CONTRACT_MANUFACTURERS_CATALOG.map((p) => p.id);
    expect(partnerIds).toContain("valmet_automotive");
    expect(partnerIds).toContain("karmann_osnabruck");
    expect(partnerIds).toContain("magna_steyr");
    expect(partnerIds).toContain("detroit_stamping");
    expect(partnerIds).toContain("nordic_rival_plant");
    expect(partnerIds).toContain("apex_rival_line");
    expect(partnerIds).toContain("volta_rival_plant");
  });

  it("verifies rival factories apply competitor markups correctly", () => {
    const rivals = CONTRACT_MANUFACTURERS_CATALOG.filter((p) => p.isRival);
    expect(rivals.length).toBe(3);

    rivals.forEach((rival) => {
      expect(rival.rivalMarkupPct).toBeGreaterThan(0);
      expect(rival.rivalBrandName).toBeDefined();

      const quote = calculateContractManufacturerQuote(rival, 150, 12000, 50_000_000);
      expect(quote.unitRivalMarkupUSD).toBeGreaterThan(0);
      expect(quote.totalQuotedUnitCostUSD).toBeGreaterThan(
        quote.unitBaseMaterialsUSD + quote.unitConversionCostUSD + quote.unitPartnerMarginUSD
      );
    });
  });

  it("verifies independent foundries have 0% rival markup", () => {
    const independents = CONTRACT_MANUFACTURERS_CATALOG.filter((p) => !p.isRival);
    expect(independents.length).toBe(4);

    independents.forEach((partner) => {
      expect(partner.rivalMarkupPct).toBe(0);
      const quote = calculateContractManufacturerQuote(partner, partner.moqUnits, 14000, 20_000_000);
      expect(quote.unitRivalMarkupUSD).toBe(0);
    });
  });

  it("computes in-house multi-constraint limits across all 4 pillars", () => {
    const result = solveInHouseProductionConstraints({
      requestedUnits: 1500,
      factoryTier: "mid_volume",
      shiftCount: 2,
      frameMaterial: "steel",
      process: "semi_automated",
      vehicleWeightKg: 1450,
      unitBOMCostUSD: 13500,
      targetMSRP: 32000,
      warehouseInventory: [
        {
          id: "inv_steel",
          itemType: "BASIC_CARBON_STEEL",
          name: "Steel",
          level: "LEVEL_2_PROCESSED",
          unitsOnHand: 800,
          unitOfMeasure: "tonnes",
          averageUnitCost: 52000,
          qualityVector: {
            strength: 80,
            weightIndex: 65,
            consistency: 85,
            purity: 90,
            corrosionResistance: 75,
            heatResistance: 80,
            manufacturability: 85,
          },
          overallQualityScore: 80,
          warehouseFacilityId: "fac_1",
          holdingCostMonthlyRate: 0.02,
          reorderPoint: 200,
          safetyStockTarget: 2000,
          storageMaxCapacity: 10000,
        },
      ],
      assemblyWorkersAvailable: 60,
      playerCashUSD: 5_000_000,
    });

    expect(result.maxByCapacity).toBeGreaterThan(0);
    expect(result.maxByMaterials).toBeDefined();
    expect(result.maxByWorkforce).toBeGreaterThan(0);
    expect(result.maxByCapital).toBeGreaterThan(0);
    expect(result.maxFeasibleUnits).toBeLessThanOrEqual(result.maxByCapacity);
    expect(result.maxFeasibleUnits).toBeLessThanOrEqual(result.maxByWorkforce);
  });
});
