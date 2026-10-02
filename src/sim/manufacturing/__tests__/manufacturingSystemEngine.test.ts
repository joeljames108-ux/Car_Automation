import { describe, it, expect } from "vitest";
import {
  solveInHouseProductionConstraints,
  calculateContractManufacturerQuote,
  CONTRACT_MANUFACTURERS_CATALOG,
  computeVehicleMaterialUsage,
  InHouseSolverInput,
} from "../manufacturingSystemEngine";
import { WarehouseInventoryRecord } from "../../trade/tradeTypes";

describe("manufacturingSystemEngine", () => {
  const dummyQuality = {
    strength: 80,
    weightIndex: 65,
    consistency: 85,
    purity: 90,
    corrosionResistance: 75,
    heatResistance: 80,
    manufacturability: 85,
  };

  const mockInventorySufficient: WarehouseInventoryRecord[] = [
    {
      id: "inv_steel",
      itemType: "BASIC_CARBON_STEEL",
      name: "Automotive Steel",
      level: "LEVEL_2_PROCESSED",
      unitsOnHand: 5000,
      unitOfMeasure: "tonnes",
      averageUnitCost: 52000,
      qualityVector: dummyQuality,
      overallQualityScore: 80,
      warehouseFacilityId: "fac_1",
      holdingCostMonthlyRate: 0.02,
      reorderPoint: 200,
      safetyStockTarget: 2000,
      storageMaxCapacity: 10000,
    },
    {
      id: "inv_alum",
      itemType: "ALUMINUM_SHEET_6000",
      name: "Aluminum Sheet",
      level: "LEVEL_2_PROCESSED",
      unitsOnHand: 2000,
      unitOfMeasure: "tonnes",
      averageUnitCost: 180000,
      qualityVector: dummyQuality,
      overallQualityScore: 82,
      warehouseFacilityId: "fac_1",
      holdingCostMonthlyRate: 0.02,
      reorderPoint: 100,
      safetyStockTarget: 800,
      storageMaxCapacity: 5000,
    },
    {
      id: "inv_iron",
      itemType: "DUCTILE_CAST_IRON",
      name: "Cast Iron",
      level: "LEVEL_2_PROCESSED",
      unitsOnHand: 1500,
      unitOfMeasure: "tonnes",
      averageUnitCost: 42000,
      qualityVector: dummyQuality,
      overallQualityScore: 78,
      warehouseFacilityId: "fac_1",
      holdingCostMonthlyRate: 0.02,
      reorderPoint: 80,
      safetyStockTarget: 500,
      storageMaxCapacity: 5000,
    },
    {
      id: "inv_tyres",
      itemType: "TYRES_WHEELS",
      name: "Tyres & Wheels",
      level: "LEVEL_4_COMPONENT",
      unitsOnHand: 10000,
      unitOfMeasure: "units",
      averageUnitCost: 18000,
      qualityVector: dummyQuality,
      overallQualityScore: 85,
      warehouseFacilityId: "fac_1",
      holdingCostMonthlyRate: 0.015,
      reorderPoint: 400,
      safetyStockTarget: 3000,
      storageMaxCapacity: 20000,
    },
    {
      id: "inv_glass",
      itemType: "AUTOMOTIVE_GLASS",
      name: "Automotive Glass",
      level: "LEVEL_4_COMPONENT",
      unitsOnHand: 8000,
      unitOfMeasure: "units",
      averageUnitCost: 12000,
      qualityVector: dummyQuality,
      overallQualityScore: 84,
      warehouseFacilityId: "fac_1",
      holdingCostMonthlyRate: 0.015,
      reorderPoint: 300,
      safetyStockTarget: 2500,
      storageMaxCapacity: 15000,
    },
    {
      id: "inv_ecu",
      itemType: "WIRING_HARNESS_ECU",
      name: "Wiring Harness ECU",
      level: "LEVEL_4_COMPONENT",
      unitsOnHand: 7500,
      unitOfMeasure: "units",
      averageUnitCost: 28000,
      qualityVector: dummyQuality,
      overallQualityScore: 88,
      warehouseFacilityId: "fac_1",
      holdingCostMonthlyRate: 0.015,
      reorderPoint: 250,
      safetyStockTarget: 2000,
      storageMaxCapacity: 15000,
    },
  ];

  it("calculates material usage correctly across chassis variants", () => {
    const unibody = computeVehicleMaterialUsage("steel", 1500);
    expect(unibody.steelTonnes).toBeGreaterThan(0.9);
    expect(unibody.tyresSets).toBe(1.0);

    const alum = computeVehicleMaterialUsage("aluminum", 1400);
    expect(alum.aluminumTonnes).toBeGreaterThan(alum.steelTonnes);
  });

  it("identifies RAW_MATERIALS bottleneck when steel inventory is severely depleted", () => {
    const depletedInventory: WarehouseInventoryRecord[] = mockInventorySufficient.map((item) =>
      item.itemType === "BASIC_CARBON_STEEL" ? { ...item, unitsOnHand: 5 } : item
    );

    const input: InHouseSolverInput = {
      requestedUnits: 100,
      factoryTier: "mid_volume",
      shiftCount: 2,
      frameMaterial: "steel",
      process: "semi_automated",
      vehicleWeightKg: 1450,
      unitBOMCostUSD: 12000,
      targetMSRP: 28000,
      warehouseInventory: depletedInventory,
      assemblyWorkersAvailable: 150,
      playerCashUSD: 5_000_000,
    };

    const res = solveInHouseProductionConstraints(input);
    expect(res.primaryBottleneck).toBe("RAW_MATERIALS");
    expect(res.limitingMaterial?.itemType).toBe("BASIC_CARBON_STEEL");
    expect(res.maxFeasibleUnits).toBeLessThan(10);
  });

  it("identifies WORKFORCE bottleneck when assembly workers are minimal", () => {
    const input: InHouseSolverInput = {
      requestedUnits: 500,
      factoryTier: "high_volume",
      shiftCount: 1,
      frameMaterial: "steel",
      process: "hand_built", // 36 hours per car!
      vehicleWeightKg: 1450,
      unitBOMCostUSD: 10000,
      targetMSRP: 35000,
      warehouseInventory: mockInventorySufficient,
      assemblyWorkersAvailable: 5, // only 5 workers!
      playerCashUSD: 10_000_000,
    };

    const res = solveInHouseProductionConstraints(input);
    expect(res.primaryBottleneck).toBe("WORKFORCE");
    expect(res.maxFeasibleUnits).toBeLessThan(res.requestedUnits);
  });

  it("identifies CAPACITY bottleneck when requested units exceed plant capacity", () => {
    const input: InHouseSolverInput = {
      requestedUnits: 2500, // Monthly request
      factoryTier: "boutique", // only 500/year = ~18/mo
      shiftCount: 1,
      frameMaterial: "steel",
      process: "automated",
      vehicleWeightKg: 1450,
      unitBOMCostUSD: 10000,
      targetMSRP: 25000,
      warehouseInventory: mockInventorySufficient,
      assemblyWorkersAvailable: 300,
      playerCashUSD: 50_000_000,
    };

    const res = solveInHouseProductionConstraints(input);
    expect(res.primaryBottleneck).toBe("CAPACITY");
    expect(res.maxFeasibleUnits).toBe(res.maxByCapacity);
  });

  it("identifies FINANCES bottleneck when player cash is insufficient", () => {
    const input: InHouseSolverInput = {
      requestedUnits: 100,
      factoryTier: "mid_volume",
      shiftCount: 2,
      frameMaterial: "steel",
      process: "semi_automated",
      vehicleWeightKg: 1450,
      unitBOMCostUSD: 15000,
      targetMSRP: 30000,
      warehouseInventory: mockInventorySufficient,
      assemblyWorkersAvailable: 200,
      playerCashUSD: 50000, // only $50k!
    };

    const res = solveInHouseProductionConstraints(input);
    expect(res.primaryBottleneck).toBe("FINANCES");
    expect(res.maxFeasibleUnits).toBeLessThan(10);
  });

  it("accurately quotes contract manufacturing orders with rival surcharges", () => {
    const rivalPartner = CONTRACT_MANUFACTURERS_CATALOG.find((p) => p.isRival)!;
    expect(rivalPartner).toBeDefined();

    const quote = calculateContractManufacturerQuote(rivalPartner, 200, 12000, 10_000_000);
    expect(quote.meetsMOQ).toBe(true);
    expect(quote.canAfford).toBe(true);
    expect(quote.unitRivalMarkupUSD).toBeGreaterThan(0);
    expect(quote.totalQuotedUnitCostUSD).toBeGreaterThan(quote.unitBaseMaterialsUSD + quote.unitConversionCostUSD);
    expect(quote.guaranteedPassUnits).toBeGreaterThan(180);
  });

  it("enforces minimum order quantity (MOQ) on contract manufacturing", () => {
    const magna = CONTRACT_MANUFACTURERS_CATALOG.find((p) => p.id === "magna_steyr")!;
    const lowUnits = 10; // Below MOQ of 75
    const quote = calculateContractManufacturerQuote(magna, lowUnits, 15000, 5_000_000);
    expect(quote.meetsMOQ).toBe(false);
    expect(quote.validationError).toContain("Minimum order quantity");
  });
});
