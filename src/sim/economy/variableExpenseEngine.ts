/**
 * ═══════════════════════════════════════════════════════════════════════
 * VARIABLE EXPENSE ENGINE — DIRECT PRODUCTION & ASSEMBLY COSTS
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Implements Section 9 (Variable Expenses):
 *
 * Variable expenses scale strictly with production volume:
 * - Raw materials: steel, aluminum, polymers, rubber, glass
 * - Purchased components: batteries, sensors, wiring harnesses, ECUs
 * - Assembly line labor (direct takt-time workers)
 * - Industrial electricity & process heat
 * - Packaging, shipping prep & transport logistics
 *
 * Connects directly to supplier reputation:
 * High supplier reputation yields up to 16% volume discounts on raw materials & parts!
 */

export interface VehicleBillOfMaterials {
  steelKg: number;
  aluminumKg: number;
  carbonFiberKg: number;
  plasticsRubberKg: number;
  purchasedPowertrainUnitCost: number; // 0 if built in-house
  electronicsAndWiringCost: number;
  interiorAndSeatingCost: number;
  brakesAndSuspensionHardwareCost: number;
  assemblyLaborHours: number;          // takt time in hours
  assemblyLaborHourlyRate: number;     // e.g. ₹450/hr
  electricityKwhPerVehicle: number;    // e.g. 1,400 kWh
  electricityCostPerKwh: number;       // e.g. ₹8.5/kWh
  logisticsPerUnitCost: number;
}

export interface UnitCostBreakdown {
  steelCost: number;
  aluminumCost: number;
  carbonFiberCost: number;
  plasticsRubberCost: number;
  rawMaterialsTotal: number;
  purchasedPowertrainCost: number;
  electronicsCost: number;
  interiorCost: number;
  hardwareCost: number;
  purchasedComponentsTotal: number;
  assemblyLaborCost: number;
  electricityCost: number;
  logisticsCost: number;
  totalVariableCostPerUnit: number;
}

export interface MonthlyProductionExpenseSummary {
  unitsProduced: number;
  costPerUnit: UnitCostBreakdown;
  supplierDiscountPctApplied: number;
  totalRawMaterialsExpense: number;
  totalPurchasedComponentsExpense: number;
  totalAssemblyLaborExpense: number;
  totalElectricityExpense: number;
  totalLogisticsExpense: number;
  totalMonthlyVariableExpenses: number;
}

/** Default commodity price benchmarks (in ₹ / kg) */
export const COMMODITY_SPOT_PRICES = {
  STEEL_PER_KG: 85,
  ALUMINUM_PER_KG: 240,
  CARBON_FIBER_PER_KG: 1850,
  PLASTICS_RUBBER_PER_KG: 140,
};

/**
 * Calculate per-unit BOM variable cost with supplier reputation discount applied
 */
export function calculateUnitVariableCost(
  bom: VehicleBillOfMaterials,
  supplierDiscountPct: number = 0 // e.g. 8 for 8% discount from supplier reputation
): UnitCostBreakdown {
  const discountMultiplier = Math.max(0.70, 1.0 - supplierDiscountPct / 100);

  // Raw Materials
  const rawSteel = bom.steelKg * COMMODITY_SPOT_PRICES.STEEL_PER_KG * discountMultiplier;
  const rawAlum = bom.aluminumKg * COMMODITY_SPOT_PRICES.ALUMINUM_PER_KG * discountMultiplier;
  const rawCF = bom.carbonFiberKg * COMMODITY_SPOT_PRICES.CARBON_FIBER_PER_KG * discountMultiplier;
  const rawPlastics = bom.plasticsRubberKg * COMMODITY_SPOT_PRICES.PLASTICS_RUBBER_PER_KG * discountMultiplier;
  const rawMaterialsTotal = Math.round(rawSteel + rawAlum + rawCF + rawPlastics);

  // Components
  const purchasedPowertrain = Math.round(bom.purchasedPowertrainUnitCost * discountMultiplier);
  const electronics = Math.round(bom.electronicsAndWiringCost * discountMultiplier);
  const interior = Math.round(bom.interiorAndSeatingCost * discountMultiplier);
  const hardware = Math.round(bom.brakesAndSuspensionHardwareCost * discountMultiplier);
  const purchasedComponentsTotal = purchasedPowertrain + electronics + interior + hardware;

  // Direct Operations
  const assemblyLabor = Math.round(bom.assemblyLaborHours * bom.assemblyLaborHourlyRate);
  const electricity = Math.round(bom.electricityKwhPerVehicle * bom.electricityCostPerKwh);
  const logistics = Math.round(bom.logisticsPerUnitCost);

  const totalVariableCostPerUnit =
    rawMaterialsTotal +
    purchasedComponentsTotal +
    assemblyLabor +
    electricity +
    logistics;

  return {
    steelCost: Math.round(rawSteel),
    aluminumCost: Math.round(rawAlum),
    carbonFiberCost: Math.round(rawCF),
    plasticsRubberCost: Math.round(rawPlastics),
    rawMaterialsTotal,
    purchasedPowertrainCost: purchasedPowertrain,
    electronicsCost: electronics,
    interiorCost: interior,
    hardwareCost: hardware,
    purchasedComponentsTotal,
    assemblyLaborCost: assemblyLabor,
    electricityCost: electricity,
    logisticsCost: logistics,
    totalVariableCostPerUnit,
  };
}

/**
 * Calculate total monthly variable production expenses for a given output volume
 */
export function calculateMonthlyVariableExpenses(
  unitsProduced: number,
  bom: VehicleBillOfMaterials,
  supplierDiscountPct: number = 0
): MonthlyProductionExpenseSummary {
  const costPerUnit = calculateUnitVariableCost(bom, supplierDiscountPct);

  if (unitsProduced <= 0) {
    return {
      unitsProduced: 0,
      costPerUnit,
      supplierDiscountPctApplied: supplierDiscountPct,
      totalRawMaterialsExpense: 0,
      totalPurchasedComponentsExpense: 0,
      totalAssemblyLaborExpense: 0,
      totalElectricityExpense: 0,
      totalLogisticsExpense: 0,
      totalMonthlyVariableExpenses: 0,
    };
  }

  return {
    unitsProduced,
    costPerUnit,
    supplierDiscountPctApplied: supplierDiscountPct,
    totalRawMaterialsExpense: unitsProduced * costPerUnit.rawMaterialsTotal,
    totalPurchasedComponentsExpense: unitsProduced * costPerUnit.purchasedComponentsTotal,
    totalAssemblyLaborExpense: unitsProduced * costPerUnit.assemblyLaborCost,
    totalElectricityExpense: unitsProduced * costPerUnit.electricityCost,
    totalLogisticsExpense: unitsProduced * costPerUnit.logisticsCost,
    totalMonthlyVariableExpenses: unitsProduced * costPerUnit.totalVariableCostPerUnit,
  };
}
