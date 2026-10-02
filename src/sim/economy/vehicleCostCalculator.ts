/**
 * ═══════════════════════════════════════════════════════════════════════
 * VEHICLE COST CALCULATOR — PER-VEHICLE BOM BREAKDOWN & UNIT MARGINS
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Implements Section 37: The most valuable screen in the automotive game.
 *
 * Shows the exhaustive per-car cost breakdown:
 * - Direct raw materials (steel, aluminum, composites)
 * - Powertrain components (engine, transmission, e-axle)
 * - Chassis & running gear (suspension, brakes, steering)
 * - Electrical architecture (wiring, ECUs, infotainment)
 * - Cockpit & cabin trim (seats, dashboard, sound deadening)
 * - Direct factory assembly labor
 * - Allocated plant fixed overhead (depreciation, lighting, climate)
 * - Inbound & outbound logistics
 * - Warranty claim actuarial reserve
 *
 * Yields Gross Contribution (₹) and Gross Margin (%) per model.
 */

export interface VehicleCostParams {
  vehicleId: string;
  modelName: string;
  sellingPrice: number;
  monthlyProductionVolume: number;
  factoryAllocatedFixedMonthlyCost: number;

  // Direct BOM lines
  steelCost: number;
  aluminumCost: number;
  carbonFiberCost: number;
  engineCost: number;
  transmissionCost: number;
  suspensionCost: number;
  brakesCost: number;
  electronicsCost: number;
  interiorCost: number;
  assemblyLaborCost: number;
  logisticsCost: number;

  // Reliability actuarial factor (0.01 to 0.05 of retail price)
  warrantyReserveFactor?: number;
}

export interface VehicleCostBreakdown {
  vehicleId: string;
  modelName: string;
  sellingPrice: number;
  monthlyProductionVolume: number;

  // Individual cost items
  steel: number;
  aluminum: number;
  carbonFiber: number;
  engine: number;
  transmission: number;
  suspension: number;
  brakes: number;
  electronics: number;
  interior: number;
  assemblyLabor: number;
  allocatedFactoryOverhead: number;
  logistics: number;
  warrantyReserve: number;

  // Summary totals
  directMaterialsCost: number;
  directLaborCost: number;
  totalVariableCost: number;
  totalCostPerVehicle: number;
  grossContribution: number;        // sellingPrice - totalCostPerVehicle
  grossMarginPct: number;           // (grossContribution / sellingPrice) * 100
  breakevenUnitsMonthly: number;    // units needed to cover fixed overhead
  totalMonthlyRevenue: number;
  totalMonthlyCost: number;
  totalMonthlyContribution: number;
}

/**
 * Calculate the complete per-vehicle financial breakdown
 */
export function calculateVehicleCostBreakdown(
  params: VehicleCostParams
): VehicleCostBreakdown {
  const {
    vehicleId,
    modelName,
    sellingPrice,
    monthlyProductionVolume,
    factoryAllocatedFixedMonthlyCost,
    steelCost,
    aluminumCost,
    carbonFiberCost,
    engineCost,
    transmissionCost,
    suspensionCost,
    brakesCost,
    electronicsCost,
    interiorCost,
    assemblyLaborCost,
    logisticsCost,
    warrantyReserveFactor = 0.02,
  } = params;

  // Fixed overhead allocated per unit:
  // If volume is high (e.g. 5,000 units), overhead per car is small.
  // If volume is tiny (e.g. 20 units), overhead per car is enormous!
  const safeVolume = Math.max(1, monthlyProductionVolume);
  const allocatedFactoryOverhead = Math.round(factoryAllocatedFixedMonthlyCost / safeVolume);

  const warrantyReserve = Math.round(sellingPrice * warrantyReserveFactor);

  const directMaterialsCost =
    steelCost +
    aluminumCost +
    carbonFiberCost +
    engineCost +
    transmissionCost +
    suspensionCost +
    brakesCost +
    electronicsCost +
    interiorCost;

  const directLaborCost = assemblyLaborCost;

  const totalVariableCost = directMaterialsCost + directLaborCost + logisticsCost + warrantyReserve;
  const totalCostPerVehicle = totalVariableCost + allocatedFactoryOverhead;

  const grossContribution = sellingPrice - totalCostPerVehicle;
  const grossMarginPct = sellingPrice > 0
    ? Number(((grossContribution / sellingPrice) * 100).toFixed(1))
    : 0;

  // Breakeven monthly units = FactoryFixedOverhead / (SellingPrice - TotalVariableCost)
  const unitContributionOverVariable = sellingPrice - totalVariableCost;
  const breakevenUnitsMonthly =
    unitContributionOverVariable > 0
      ? Math.ceil(factoryAllocatedFixedMonthlyCost / unitContributionOverVariable)
      : 999999;

  const totalMonthlyRevenue = safeVolume * sellingPrice;
  const totalMonthlyCost = safeVolume * totalCostPerVehicle;
  const totalMonthlyContribution = safeVolume * grossContribution;

  return {
    vehicleId,
    modelName,
    sellingPrice,
    monthlyProductionVolume,
    steel: steelCost,
    aluminum: aluminumCost,
    carbonFiber: carbonFiberCost,
    engine: engineCost,
    transmission: transmissionCost,
    suspension: suspensionCost,
    brakes: brakesCost,
    electronics: electronicsCost,
    interior: interiorCost,
    assemblyLabor: assemblyLaborCost,
    allocatedFactoryOverhead,
    logistics: logisticsCost,
    warrantyReserve,
    directMaterialsCost,
    directLaborCost,
    totalVariableCost,
    totalCostPerVehicle,
    grossContribution,
    grossMarginPct,
    breakevenUnitsMonthly,
    totalMonthlyRevenue,
    totalMonthlyCost,
    totalMonthlyContribution,
  };
}
