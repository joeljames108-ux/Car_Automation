/**
 * ═══════════════════════════════════════════════════════════════════════
 * SUPPLY CHAIN DISRUPTION & PRODUCTION BOTTLENECK SIMULATOR
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Implements Section 14:
 * - Direct physical connection between parts availability and assembly line throughput
 * - Evaluates missing parts before vehicle assembly
 * - Enforces Liebig's Law of the Minimum: vehicle production is capped by whichever
 *   critical component experiences a shortage (e.g. tyres, microchips, windshields)
 * - Simulates emergency spot procurement options to recover stalled production lines
 */

import { WarehouseInventoryRecord, ComponentCategory, ProcessedMaterialType } from "./tradeTypes";
import { BASELINE_MARKET_PRICES } from "./tradeContractEngine";

export interface VehicleBOMRequirement {
  steelTonnesPerVehicle: number;
  aluminumTonnesPerVehicle: number;
  ironTonnesPerVehicle: number;
  tyreSetsPerVehicle: number;
  glassSetsPerVehicle: number;
  wiringHarnessKitsPerVehicle: number;
}

export const STANDARD_VEHICLE_BOM_REQUIREMENTS: VehicleBOMRequirement = {
  steelTonnesPerVehicle: 0.95,       // 950 kg automotive sheet
  aluminumTonnesPerVehicle: 0.15,    // 150 kg lightweight stampings/extrusions
  ironTonnesPerVehicle: 0.22,        // 220 kg block/rotors
  tyreSetsPerVehicle: 1.0,           // 1 set (4 wheels/tyres + spare)
  glassSetsPerVehicle: 1.0,          // 1 full glazing pack
  wiringHarnessKitsPerVehicle: 1.0,  // 1 ECU + main harness
};

export interface ProductionFeasibilityResult {
  requestedUnits: number;
  feasibleUnits: number;
  isBottlenecked: boolean;
  bottleneckItem: string | null;
  bottleneckItemType: ProcessedMaterialType | ComponentCategory | null;
  shortageAmount: number;
  shortagePercentage: number;
  consumedInventory: Record<string, number>;
  emergencyRecoveryCostINR: number; // Cost to air-freight emergency spot parts
}

/**
 * Checks warehouse inventory against planned monthly assembly demand.
 * If any critical component or raw material is insufficient, caps output.
 */
export function evaluateProductionFeasibility(
  requestedUnits: number,
  inventory: WarehouseInventoryRecord[],
  bom: VehicleBOMRequirement = STANDARD_VEHICLE_BOM_REQUIREMENTS
): ProductionFeasibilityResult {
  const stockMap = new Map<string, number>();
  for (const item of inventory) {
    stockMap.set(item.itemType, item.unitsOnHand);
  }

  // Calculate maximum achievable units for each requirement
  const limits: Array<{
    itemType: ProcessedMaterialType | ComponentCategory;
    name: string;
    maxUnits: number;
    requiredPerUnit: number;
  }> = [
    {
      itemType: "BASIC_CARBON_STEEL",
      name: "Automotive Steel Coil",
      maxUnits: Math.floor((stockMap.get("BASIC_CARBON_STEEL") ?? 0) / bom.steelTonnesPerVehicle),
      requiredPerUnit: bom.steelTonnesPerVehicle,
    },
    {
      itemType: "ALUMINUM_SHEET_6000",
      name: "Alloy 6061 Aluminum",
      maxUnits: Math.floor((stockMap.get("ALUMINUM_SHEET_6000") ?? 0) / bom.aluminumTonnesPerVehicle),
      requiredPerUnit: bom.aluminumTonnesPerVehicle,
    },
    {
      itemType: "DUCTILE_CAST_IRON",
      name: "Cast Iron Castings",
      maxUnits: Math.floor((stockMap.get("DUCTILE_CAST_IRON") ?? 0) / bom.ironTonnesPerVehicle),
      requiredPerUnit: bom.ironTonnesPerVehicle,
    },
    {
      itemType: "TYRES_WHEELS",
      name: "Tyre & Wheel Assemblies",
      maxUnits: Math.floor((stockMap.get("TYRES_WHEELS") ?? 0) / bom.tyreSetsPerVehicle),
      requiredPerUnit: bom.tyreSetsPerVehicle,
    },
    {
      itemType: "AUTOMOTIVE_GLASS",
      name: "Windshields & Glazing Packs",
      maxUnits: Math.floor((stockMap.get("AUTOMOTIVE_GLASS") ?? 0) / bom.glassSetsPerVehicle),
      requiredPerUnit: bom.glassSetsPerVehicle,
    },
    {
      itemType: "WIRING_HARNESS_ECU",
      name: "Wiring Harness & ECUs",
      maxUnits: Math.floor((stockMap.get("WIRING_HARNESS_ECU") ?? 0) / bom.wiringHarnessKitsPerVehicle),
      requiredPerUnit: bom.wiringHarnessKitsPerVehicle,
    },
  ];

  // Find the most restrictive bottleneck
  let minFeasible = requestedUnits;
  let bottleneckItem: string | null = null;
  let bottleneckType: ProcessedMaterialType | ComponentCategory | null = null;
  let shortageAmount = 0;

  for (const lim of limits) {
    if (lim.maxUnits < minFeasible) {
      minFeasible = Math.max(0, lim.maxUnits);
      bottleneckItem = lim.name;
      bottleneckType = lim.itemType;
      const deficitUnits = (requestedUnits - minFeasible) * lim.requiredPerUnit;
      shortageAmount = Math.round(deficitUnits);
    }
  }

  const isBottlenecked = minFeasible < requestedUnits;
  const shortagePercentage = isBottlenecked
    ? Math.round(((requestedUnits - minFeasible) / requestedUnits) * 100)
    : 0;

  // Calculate emergency expedited recovery cost (air freight + spot premium: +35% over baseline)
  let recoveryCost = 0;
  if (isBottlenecked && bottleneckType) {
    const baseCost = BASELINE_MARKET_PRICES[bottleneckType] ?? 50000;
    recoveryCost = Math.round(shortageAmount * baseCost * 1.35);
  }

  // Calculate actual consumed quantities for the feasible units
  const consumed: Record<string, number> = {};
  for (const lim of limits) {
    consumed[lim.itemType] = parseFloat((minFeasible * lim.requiredPerUnit).toFixed(2));
  }

  return {
    requestedUnits,
    feasibleUnits: minFeasible,
    isBottlenecked,
    bottleneckItem,
    bottleneckItemType: bottleneckType,
    shortageAmount,
    shortagePercentage,
    consumedInventory: consumed,
    emergencyRecoveryCostINR: recoveryCost,
  };
}
