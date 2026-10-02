/**
 * ═══════════════════════════════════════════════════════════════════════
 * PHYSICAL WAREHOUSING & INVENTORY CONTROL ENGINE
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Implements Section 13:
 * - Stockpiles per factory / warehouse facility
 * - Three inventory policies:
 *   1. JUST_IN_TIME (JIT): 3-5 days buffer, lowest holding cost, vulnerable to delays
 *   2. SAFETY_STOCK: 30-45 days buffer, balanced resilience
 *   3. STRATEGIC_RESERVE: 90-180 days buffer, stockpiling cheap commodities
 * - Monthly inventory holding costs (1.5-2.5% of asset value for insurance, climate & warehouse staff)
 * - Automated reorder point evaluation
 */

import {
  InventoryPolicyType,
  MaterialQualityVector,
  ProcessedMaterialType,
  ComponentCategory,
  WarehouseInventoryRecord,
} from "./tradeTypes";
import { DEFAULT_MATERIAL_QUALITIES, computeMaterialQualityComposite } from "./materialQualityEngine";
import { BASELINE_MARKET_PRICES } from "./tradeContractEngine";

export const INITIAL_1970_WAREHOUSE_INVENTORY: WarehouseInventoryRecord[] = [
  {
    id: "inv_steel_coils",
    itemType: "BASIC_CARBON_STEEL",
    name: "Cold-Rolled Automotive Steel Coil",
    level: "LEVEL_2_PROCESSED",
    unitsOnHand: 480, // tonnes
    unitOfMeasure: "tonnes",
    averageUnitCost: 52000,
    qualityVector: { ...DEFAULT_MATERIAL_QUALITIES.BASIC_CARBON_STEEL },
    overallQualityScore: computeMaterialQualityComposite(DEFAULT_MATERIAL_QUALITIES.BASIC_CARBON_STEEL),
    warehouseFacilityId: "fac_central_warehouse_01",
    holdingCostMonthlyRate: 0.018, // 1.8%/mo
    reorderPoint: 150,
    safetyStockTarget: 300,
    storageMaxCapacity: 2500,
  },
  {
    id: "inv_aluminum_billets",
    itemType: "ALUMINUM_SHEET_6000",
    name: "Alloy 6061 Stamping Sheet",
    level: "LEVEL_2_PROCESSED",
    unitsOnHand: 95, // tonnes
    unitOfMeasure: "tonnes",
    averageUnitCost: 185000,
    qualityVector: { ...DEFAULT_MATERIAL_QUALITIES.ALUMINUM_SHEET_6000 },
    overallQualityScore: computeMaterialQualityComposite(DEFAULT_MATERIAL_QUALITIES.ALUMINUM_SHEET_6000),
    warehouseFacilityId: "fac_central_warehouse_01",
    holdingCostMonthlyRate: 0.02,
    reorderPoint: 40,
    safetyStockTarget: 80,
    storageMaxCapacity: 800,
  },
  {
    id: "inv_cast_iron_blocks",
    itemType: "DUCTILE_CAST_IRON",
    name: "Ductile Iron Engine & Rotor Castings",
    level: "LEVEL_3_FORMED",
    unitsOnHand: 140, // tonnes
    unitOfMeasure: "tonnes",
    averageUnitCost: 62000,
    qualityVector: { ...DEFAULT_MATERIAL_QUALITIES.DUCTILE_CAST_IRON },
    overallQualityScore: computeMaterialQualityComposite(DEFAULT_MATERIAL_QUALITIES.DUCTILE_CAST_IRON),
    warehouseFacilityId: "fac_central_warehouse_01",
    holdingCostMonthlyRate: 0.015,
    reorderPoint: 50,
    safetyStockTarget: 100,
    storageMaxCapacity: 1200,
  },
  {
    id: "inv_rubber_tyre_sets",
    itemType: "TYRES_WHEELS",
    name: "High-Grip Tyre & Wheel Sets",
    level: "LEVEL_4_COMPONENT",
    unitsOnHand: 180, // car sets
    unitOfMeasure: "units",
    averageUnitCost: 32000,
    qualityVector: { ...DEFAULT_MATERIAL_QUALITIES.VULCANIZED_RUBBER },
    overallQualityScore: computeMaterialQualityComposite(DEFAULT_MATERIAL_QUALITIES.VULCANIZED_RUBBER),
    warehouseFacilityId: "fac_central_warehouse_01",
    holdingCostMonthlyRate: 0.022,
    reorderPoint: 60,
    safetyStockTarget: 120,
    storageMaxCapacity: 1000,
  },
  {
    id: "inv_windshields_glass",
    itemType: "AUTOMOTIVE_GLASS",
    name: "Laminated Windshield & Glazing Packs",
    level: "LEVEL_4_COMPONENT",
    unitsOnHand: 160, // car sets
    unitOfMeasure: "units",
    averageUnitCost: 18000,
    qualityVector: { ...DEFAULT_MATERIAL_QUALITIES.AUTOMOTIVE_FLOAT_GLASS },
    overallQualityScore: computeMaterialQualityComposite(DEFAULT_MATERIAL_QUALITIES.AUTOMOTIVE_FLOAT_GLASS),
    warehouseFacilityId: "fac_central_warehouse_01",
    holdingCostMonthlyRate: 0.025, // glass storage breakage risk
    reorderPoint: 50,
    safetyStockTarget: 100,
    storageMaxCapacity: 800,
  },
  {
    id: "inv_wiring_harness_kits",
    itemType: "WIRING_HARNESS_ECU",
    name: "Multiplex Harness & ECU Kits",
    level: "LEVEL_4_COMPONENT",
    unitsOnHand: 150, // car sets
    unitOfMeasure: "units",
    averageUnitCost: 45000,
    qualityVector: { ...DEFAULT_MATERIAL_QUALITIES.ELECTROLYTIC_COPPER },
    overallQualityScore: computeMaterialQualityComposite(DEFAULT_MATERIAL_QUALITIES.ELECTROLYTIC_COPPER),
    warehouseFacilityId: "fac_central_warehouse_01",
    holdingCostMonthlyRate: 0.015,
    reorderPoint: 40,
    safetyStockTarget: 90,
    storageMaxCapacity: 600,
  },
];

export interface InventoryValuationResult {
  totalAssetValueINR: number;
  totalMonthlyHoldingCostINR: number;
  utilizationRatePct: number;
  stockoutRisks: string[];
}

/** Calculate balance sheet inventory valuation and carrying holding costs */
export function calculateInventoryValuation(
  inventory: WarehouseInventoryRecord[]
): InventoryValuationResult {
  let totalValue = 0;
  let totalHolding = 0;
  let totalCapacity = 0;
  let totalUsed = 0;
  const stockoutRisks: string[] = [];

  for (const item of inventory) {
    const itemValue = item.unitsOnHand * item.averageUnitCost;
    totalValue += itemValue;
    totalHolding += itemValue * item.holdingCostMonthlyRate;
    totalCapacity += item.storageMaxCapacity;
    totalUsed += item.unitsOnHand;

    if (item.unitsOnHand <= item.reorderPoint) {
      stockoutRisks.push(`Low stock alert: ${item.name} (${item.unitsOnHand} left, reorder at ${item.reorderPoint})`);
    }
  }

  const utilization = totalCapacity > 0 ? Math.min(100, Math.round((totalUsed / totalCapacity) * 100)) : 0;

  return {
    totalAssetValueINR: Math.round(totalValue),
    totalMonthlyHoldingCostINR: Math.round(totalHolding),
    utilizationRatePct: utilization,
    stockoutRisks,
  };
}

/** Adjust targets when player shifts inventory policy */
export function applyInventoryPolicy(
  record: WarehouseInventoryRecord,
  policy: InventoryPolicyType,
  monthlyConsumptionUnits: number
): WarehouseInventoryRecord {
  let safetyMultiplier = 1.0;
  switch (policy) {
    case "JUST_IN_TIME":
      safetyMultiplier = 0.25; // ~7 days
      break;
    case "SAFETY_STOCK":
      safetyMultiplier = 1.2;  // ~36 days
      break;
    case "STRATEGIC_RESERVE":
      safetyMultiplier = 3.5;  // ~100 days
      break;
  }

  const newSafetyTarget = Math.round(monthlyConsumptionUnits * safetyMultiplier);
  const newReorderPoint = Math.round(newSafetyTarget * 0.5);

  return {
    ...record,
    safetyStockTarget: newSafetyTarget,
    reorderPoint: newReorderPoint,
  };
}
