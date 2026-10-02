/**
 * ═══════════════════════════════════════════════════════════════════════
 * FACTORY BILL OF MATERIALS (BOM) & SUPPLY CHAIN ENGINE
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Computes raw materials & component requirements for scheduled production runs.
 * Validates against warehouse inventory (Steel, Aluminium, Plastics, Glass, Tyres, Electronics).
 */

import { WarehouseInventoryRecord } from "../trade/tradeTypes";
import { ProductionSlot } from "./factoryTypes";

export interface MaterialRequirementItem {
  id: string;
  name: string;
  category: "raw_metals" | "polymers" | "components" | "powertrain";
  unit: string;
  requiredPerVehicle: number;
  totalRequired: number;
  unitsInStock: number;
  isShortage: boolean;
  shortageUnits: number;
  unitPriceUSD: number;
  totalCostUSD: number;
}

export interface BatchBOMSummary {
  slotId: string;
  vehicleModelName: string;
  targetUnits: number;
  isReady: boolean;
  shortageCount: number;
  totalBOMCostUSD: number;
  items: MaterialRequirementItem[];
}

export const BASE_VEHICLE_MATERIAL_NORMS = {
  steelKg: 1100,
  aluminiumKg: 180,
  plasticsRubberKg: 95,
  glassKg: 42,
  tyresCount: 4,
  electronicsUnits: 1,
};

export const BASE_COMMODITY_PRICES_1970 = {
  steelPerKg: 1.25,
  aluminiumPerKg: 3.40,
  plasticsRubberPerKg: 2.75,
  glassPerKg: 2.15,
  tyreUnit: 68.0,
  electronicsUnit: 360.0,
};

/**
 * Computes detailed material requirements for a production slot.
 */
export function computeSlotBOM(
  slot: ProductionSlot,
  warehouseInventory: WarehouseInventoryRecord[] = []
): BatchBOMSummary {
  const getStock = (materialKey: string): number => {
    const item = warehouseInventory.find(
      (w) => w.id.toLowerCase().includes(materialKey) || w.name.toLowerCase().includes(materialKey)
    );
    return item ? item.unitsOnHand : 10000; // Default healthy stock if uninitialized
  };

  const units = slot.targetUnits;

  const items: MaterialRequirementItem[] = [
    {
      id: "mat_steel",
      name: "Deep-Draw Stamping Steel",
      category: "raw_metals",
      unit: "kg",
      requiredPerVehicle: BASE_VEHICLE_MATERIAL_NORMS.steelKg,
      totalRequired: BASE_VEHICLE_MATERIAL_NORMS.steelKg * units,
      unitsInStock: getStock("steel"),
      isShortage: false,
      shortageUnits: 0,
      unitPriceUSD: BASE_COMMODITY_PRICES_1970.steelPerKg,
      totalCostUSD: BASE_VEHICLE_MATERIAL_NORMS.steelKg * units * BASE_COMMODITY_PRICES_1970.steelPerKg,
    },
    {
      id: "mat_aluminium",
      name: "Structural Aluminium Alloy",
      category: "raw_metals",
      unit: "kg",
      requiredPerVehicle: BASE_VEHICLE_MATERIAL_NORMS.aluminiumKg,
      totalRequired: BASE_VEHICLE_MATERIAL_NORMS.aluminiumKg * units,
      unitsInStock: getStock("aluminium"),
      isShortage: false,
      shortageUnits: 0,
      unitPriceUSD: BASE_COMMODITY_PRICES_1970.aluminiumPerKg,
      totalCostUSD: BASE_VEHICLE_MATERIAL_NORMS.aluminiumKg * units * BASE_COMMODITY_PRICES_1970.aluminiumPerKg,
    },
    {
      id: "mat_polymers",
      name: "Molded Polymers & Elastomers",
      category: "polymers",
      unit: "kg",
      requiredPerVehicle: BASE_VEHICLE_MATERIAL_NORMS.plasticsRubberKg,
      totalRequired: BASE_VEHICLE_MATERIAL_NORMS.plasticsRubberKg * units,
      unitsInStock: getStock("plastic"),
      isShortage: false,
      shortageUnits: 0,
      unitPriceUSD: BASE_COMMODITY_PRICES_1970.plasticsRubberPerKg,
      totalCostUSD: BASE_VEHICLE_MATERIAL_NORMS.plasticsRubberKg * units * BASE_COMMODITY_PRICES_1970.plasticsRubberPerKg,
    },
    {
      id: "mat_glass",
      name: "Laminated Safety Glass",
      category: "components",
      unit: "kg",
      requiredPerVehicle: BASE_VEHICLE_MATERIAL_NORMS.glassKg,
      totalRequired: BASE_VEHICLE_MATERIAL_NORMS.glassKg * units,
      unitsInStock: getStock("glass"),
      isShortage: false,
      shortageUnits: 0,
      unitPriceUSD: BASE_COMMODITY_PRICES_1970.glassPerKg,
      totalCostUSD: BASE_VEHICLE_MATERIAL_NORMS.glassKg * units * BASE_COMMODITY_PRICES_1970.glassPerKg,
    },
    {
      id: "mat_tyres",
      name: "Radial Performance Tyres",
      category: "components",
      unit: "sets",
      requiredPerVehicle: BASE_VEHICLE_MATERIAL_NORMS.tyresCount,
      totalRequired: BASE_VEHICLE_MATERIAL_NORMS.tyresCount * units,
      unitsInStock: getStock("tyre"),
      isShortage: false,
      shortageUnits: 0,
      unitPriceUSD: BASE_COMMODITY_PRICES_1970.tyreUnit,
      totalCostUSD: BASE_VEHICLE_MATERIAL_NORMS.tyresCount * units * BASE_COMMODITY_PRICES_1970.tyreUnit,
    },
    {
      id: "mat_electronics",
      name: "Wiring Harness & Solid-State Relays",
      category: "components",
      unit: "units",
      requiredPerVehicle: BASE_VEHICLE_MATERIAL_NORMS.electronicsUnits,
      totalRequired: BASE_VEHICLE_MATERIAL_NORMS.electronicsUnits * units,
      unitsInStock: getStock("electronic"),
      isShortage: false,
      shortageUnits: 0,
      unitPriceUSD: BASE_COMMODITY_PRICES_1970.electronicsUnit,
      totalCostUSD: BASE_VEHICLE_MATERIAL_NORMS.electronicsUnits * units * BASE_COMMODITY_PRICES_1970.electronicsUnit,
    },
  ];

  let shortageCount = 0;
  let totalBOMCostUSD = 0;

  for (const item of items) {
    if (item.unitsInStock < item.totalRequired) {
      item.isShortage = true;
      item.shortageUnits = item.totalRequired - item.unitsInStock;
      shortageCount++;
    }
    totalBOMCostUSD += item.totalCostUSD;
  }

  return {
    slotId: slot.id,
    vehicleModelName: slot.vehicleModelName,
    targetUnits: units,
    isReady: shortageCount === 0,
    shortageCount,
    totalBOMCostUSD,
    items,
  };
}
