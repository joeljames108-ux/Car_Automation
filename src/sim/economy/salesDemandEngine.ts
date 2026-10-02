/**
 * ═══════════════════════════════════════════════════════════════════════
 * SALES DEMAND ENGINE — MULTI-SEGMENT DEMAND & MACRO CYCLES
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Implements Sections 25 & 26:
 *
 * Multi-variable customer purchase intent across segments:
 * - Economy, Family Sedan, Executive Coupe, Luxury Saloon,
 *   High-Performance Sports, Hypercar, SUV, Commercial Fleet.
 *
 * Combines:
 * - Macroeconomic business cycle (Boom, Stability, Recession, Oil Crisis)
 * - Seasonality (Q2 convertible surge, Q4 commercial fleet delivery)
 * - Brand awareness & specialized domain reputation
 * - Price elasticity vs segment rivals
 */

export type VehicleMarketSegment =
  | "ECONOMY"
  | "SEDAN"
  | "COUPE"
  | "LUXURY"
  | "SPORTS"
  | "SUPERCAR"
  | "SUV"
  | "COMMERCIAL";

export type MacroEconomicPhase =
  | "ECONOMIC_BOOM"
  | "STEADY_GROWTH"
  | "MILD_RECESSION"
  | "STAGFLATION_CRISIS"
  | "OIL_SHOCK";

export interface SegmentMarketState {
  segment: VehicleMarketSegment;
  baseAnnualMarketSize: number;    // Total industry units sold across all makers
  averageSegmentPrice: number;     // ₹
  primaryReputationDriver: "performance" | "reliability" | "luxury" | "safety" | "engineering";
  seasonalMultiplier: number;      // 0.85 to 1.25 for current month
}

export interface VehicleProductProfile {
  id: string;
  name: string;
  segment: VehicleMarketSegment;
  listPrice: number;
  qualityScore: number;     // 0-100
  stylingScore: number;     // 0-100
  performanceScore: number; // 0-100
  reliabilityScore: number; // 0-100
  safetyScore: number;      // 0-100
  luxuryScore: number;      // 0-100
}

export interface MarketDemandOutput {
  segment: VehicleMarketSegment;
  totalIndustryMonthlyDemand: number;
  companyVehicleDemandUnits: number;
  projectedMarketSharePct: number;
  elasticityIndex: number;
  macroMultiplierApplied: number;
  demandRationale: string;
}

/** Baseline industry annual market volumes in 1970 */
export const SEGMENT_ANNUAL_VOLUMES_1970: Record<VehicleMarketSegment, number> = {
  ECONOMY: 2500000,
  SEDAN: 3800000,
  COUPE: 650000,
  LUXURY: 350000,
  SPORTS: 180000,
  SUPERCAR: 12000,
  SUV: 220000,
  COMMERCIAL: 1400000,
};

/** Macroeconomic modifiers by segment */
export const MACRO_IMPACTS: Record<MacroEconomicPhase, Record<VehicleMarketSegment, number>> = {
  ECONOMIC_BOOM: {
    ECONOMY: 1.05, SEDAN: 1.15, COUPE: 1.25, LUXURY: 1.40,
    SPORTS: 1.35, SUPERCAR: 1.60, SUV: 1.20, COMMERCIAL: 1.25,
  },
  STEADY_GROWTH: {
    ECONOMY: 1.00, SEDAN: 1.00, COUPE: 1.00, LUXURY: 1.00,
    SPORTS: 1.00, SUPERCAR: 1.00, SUV: 1.00, COMMERCIAL: 1.00,
  },
  MILD_RECESSION: {
    ECONOMY: 1.08, SEDAN: 0.88, COUPE: 0.78, LUXURY: 0.75,
    SPORTS: 0.70, SUPERCAR: 0.65, SUV: 0.85, COMMERCIAL: 0.80,
  },
  STAGFLATION_CRISIS: {
    ECONOMY: 0.95, SEDAN: 0.75, COUPE: 0.65, LUXURY: 0.60,
    SPORTS: 0.55, SUPERCAR: 0.50, SUV: 0.70, COMMERCIAL: 0.75,
  },
  OIL_SHOCK: {
    ECONOMY: 1.35, SEDAN: 0.70, COUPE: 0.55, LUXURY: 0.45,
    SPORTS: 0.40, SUPERCAR: 0.35, SUV: 0.60, COMMERCIAL: 0.85,
  },
};

/**
 * Calculate market demand for a specific vehicle line in the current macro climate
 */
export function calculateSegmentDemand(
  vehicle: VehicleProductProfile,
  overallReputation: number,
  specialistReputation: number,
  macroPhase: MacroEconomicPhase = "STEADY_GROWTH",
  month: number = 1
): MarketDemandOutput {
  const baseAnnual = SEGMENT_ANNUAL_VOLUMES_1970[vehicle.segment] || 1000000;
  const baseMonthly = Math.round(baseAnnual / 12);

  // Macro multiplier
  const macroMult = MACRO_IMPACTS[macroPhase][vehicle.segment] || 1.0;

  // Seasonality (e.g. Sports & Coupes peak in Spring/Summer months 4-7)
  let seasonalMult = 1.0;
  if (vehicle.segment === "SPORTS" || vehicle.segment === "COUPE" || vehicle.segment === "SUPERCAR") {
    seasonalMult = [1.0, 0.9, 0.95, 1.15, 1.25, 1.30, 1.25, 1.10, 1.0, 0.95, 0.85, 0.80][month - 1];
  } else if (vehicle.segment === "SUV" || vehicle.segment === "COMMERCIAL") {
    seasonalMult = [1.10, 1.05, 1.0, 0.95, 0.95, 0.95, 0.95, 1.0, 1.05, 1.15, 1.20, 1.15][month - 1];
  }

  const industryMonthlyDemand = Math.round(baseMonthly * macroMult * seasonalMult);

  // Target customer resonance score (weighted for the segment)
  let productScore = 50;
  switch (vehicle.segment) {
    case "SPORTS":
    case "SUPERCAR":
      productScore = vehicle.performanceScore * 0.45 + vehicle.stylingScore * 0.35 + vehicle.qualityScore * 0.20;
      break;
    case "LUXURY":
      productScore = vehicle.luxuryScore * 0.45 + vehicle.qualityScore * 0.30 + vehicle.stylingScore * 0.25;
      break;
    case "ECONOMY":
      productScore = vehicle.reliabilityScore * 0.40 + vehicle.safetyScore * 0.35 + vehicle.qualityScore * 0.25;
      break;
    default:
      productScore = vehicle.qualityScore * 0.30 + vehicle.reliabilityScore * 0.30 + vehicle.stylingScore * 0.20 + vehicle.safetyScore * 0.20;
      break;
  }

  // Market share capture:
  // Base small share (~0.05% for new maker up to 6.5% for established major player)
  const repPower = (overallReputation * 0.5 + specialistReputation * 0.5) / 100;
  const productPower = productScore / 100;

  const marketSharePct = Number(
    (0.02 + Math.pow(repPower, 1.4) * 2.5 * Math.pow(productPower, 1.2)).toFixed(2)
  );

  const demandedUnits = Math.round(industryMonthlyDemand * (marketSharePct / 100));

  let rationale = `Strong customer interest in ${vehicle.name} with ${marketSharePct}% segment capture.`;
  if (macroPhase === "OIL_SHOCK" && (vehicle.segment === "SPORTS" || vehicle.segment === "SUPERCAR")) {
    rationale = `Demand severely dampened by oil crisis market contraction.`;
  } else if (macroPhase === "ECONOMIC_BOOM") {
    rationale = `Economic expansion creating aggressive order backlogs for ${vehicle.name}.`;
  }

  return {
    segment: vehicle.segment,
    totalIndustryMonthlyDemand: industryMonthlyDemand,
    companyVehicleDemandUnits: demandedUnits,
    projectedMarketSharePct: marketSharePct,
    elasticityIndex: Number((productPower / repPower).toFixed(2)),
    macroMultiplierApplied: macroMult,
    demandRationale: rationale,
  };
}
