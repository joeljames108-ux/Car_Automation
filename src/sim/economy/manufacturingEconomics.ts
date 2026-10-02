/**
 * ═══════════════════════════════════════════════════════════════════════
 * MANUFACTURING ECONOMICS — SCALE, UTILIZATION & OVERLOAD PENALTIES
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Implements Sections 16 & 17:
 *
 * Section 16: Economies of Scale
 * - Unit cost = FixedCost / ProductionVolume + VariableCostPerUnit
 * - At 100 units/year: Fixed overhead dominates (high unit cost)
 * - At 50,000 units/year: Fixed overhead is negligible per car
 *
 * Section 17: Factory Overload Mechanics (> 95% utilization)
 * - Mandatory 1.5x - 2.0x overtime worker shift premiums
 * - Preventive maintenance deferred → machine breakdowns
 * - Assembly defect rate (PPM) increases → reliability reputation damage
 * - Supply bottleneck risk and delivery delays to dealerships
 */

export interface FactoryEconomicsParams {
  factoryId: string;
  factoryName: string;
  annualRatedCapacity: number;     // Total vehicle capacity per year
  currentMonthlyOutput: number;    // Cars scheduled this month
  fixedMonthlyOverhead: number;    // Plant upkeep, security, lease
  baseVariableCostPerUnit: number; // Raw materials + direct labor
  manufacturingReputationScore: number; // 0-100 (high score improves OEE)
}

export interface FactoryEconomicsResult {
  factoryId: string;
  factoryName: string;
  annualRatedCapacity: number;
  monthlyOptimalCapacity: number;
  currentMonthlyOutput: number;
  utilizationPct: number;          // 0 - 120%

  // Cost metrics
  fixedOverheadPerUnit: number;
  baseVariableCostPerUnit: number;
  overloadPenaltyPerUnit: number;
  totalCostPerVehicle: number;
  totalMonthlyFactoryCost: number;

  // Status flags
  status: "CRITICALLY_IDLE" | "UNDERUTILIZED" | "OPTIMAL" | "OVERLOADED" | "DANGEROUSLY_MAXED";
  isOverloaded: boolean;
  isUnderutilized: boolean;

  // Overload penalty metrics (Section 17)
  overtimeSurchargeTotal: number;
  qualityDefectPpmMultiplier: number;
  maintenanceWearFactor: number;
  supplierShortageRiskPct: number;
  expectedDeliveryDelayDays: number;
}

/**
 * Calculate factory economies of scale, capacity utilization and overload penalties
 */
export function calculateFactoryEconomics(
  params: FactoryEconomicsParams
): FactoryEconomicsResult {
  const {
    factoryId,
    factoryName,
    annualRatedCapacity,
    currentMonthlyOutput,
    fixedMonthlyOverhead,
    baseVariableCostPerUnit,
    manufacturingReputationScore,
  } = params;

  const monthlyOptimalCapacity = Math.max(1, Math.round(annualRatedCapacity / 12));
  const utilizationPct = Number(((currentMonthlyOutput / monthlyOptimalCapacity) * 100).toFixed(1));

  // Determine operational status
  let status: FactoryEconomicsResult["status"] = "OPTIMAL";
  let isOverloaded = false;
  let isUnderutilized = false;

  if (utilizationPct < 30) {
    status = "CRITICALLY_IDLE";
    isUnderutilized = true;
  } else if (utilizationPct < 65) {
    status = "UNDERUTILIZED";
    isUnderutilized = true;
  } else if (utilizationPct <= 92) {
    status = "OPTIMAL";
  } else if (utilizationPct <= 105) {
    status = "OVERLOADED";
    isOverloaded = true;
  } else {
    status = "DANGEROUSLY_MAXED";
    isOverloaded = true;
  }

  // 1. Economies of Scale: Fixed overhead allocation
  const outputSafe = Math.max(1, currentMonthlyOutput);
  const fixedOverheadPerUnit = Math.round(fixedMonthlyOverhead / outputSafe);

  // 2. Overload Penalties (Section 17)
  let overloadPenaltyPerUnit = 0;
  let overtimeSurchargeTotal = 0;
  let qualityDefectPpmMultiplier = 1.0;
  let maintenanceWearFactor = 1.0;
  let supplierShortageRiskPct = 5;
  let expectedDeliveryDelayDays = 0;

  if (utilizationPct > 92) {
    // Overtime shifts cost 1.5x labor
    const excessUnits = Math.max(0, currentMonthlyOutput - Math.round(monthlyOptimalCapacity * 0.92));
    const overtimeLaborRate = 3500; // Extra labor surcharge per rush unit
    overtimeSurchargeTotal = excessUnits * overtimeLaborRate;
    overloadPenaltyPerUnit = Math.round(overtimeSurchargeTotal / outputSafe);

    // Defect rates spike when assembly line is running breathless
    // Manufacturing reputation mitigates this slightly
    const repBuffer = manufacturingReputationScore / 100;
    const overloadSeverity = (utilizationPct - 92) / 20; // 0.0 to 1.0+
    qualityDefectPpmMultiplier = Number((1.0 + overloadSeverity * (1.8 - repBuffer * 0.6)).toFixed(2));
    maintenanceWearFactor = Number((1.0 + overloadSeverity * 1.5).toFixed(2));
    supplierShortageRiskPct = Math.min(65, Math.round(10 + overloadSeverity * 45));
    expectedDeliveryDelayDays = Math.round(overloadSeverity * 14);
  }

  const totalCostPerVehicle = fixedOverheadPerUnit + baseVariableCostPerUnit + overloadPenaltyPerUnit;
  const totalMonthlyFactoryCost = outputSafe * totalCostPerVehicle;

  return {
    factoryId,
    factoryName,
    annualRatedCapacity,
    monthlyOptimalCapacity,
    currentMonthlyOutput,
    utilizationPct,
    fixedOverheadPerUnit,
    baseVariableCostPerUnit,
    overloadPenaltyPerUnit,
    totalCostPerVehicle,
    totalMonthlyFactoryCost,
    status,
    isOverloaded,
    isUnderutilized,
    overtimeSurchargeTotal,
    qualityDefectPpmMultiplier,
    maintenanceWearFactor,
    supplierShortageRiskPct,
    expectedDeliveryDelayDays,
  };
}
