/**
 * ═══════════════════════════════════════════════════════════════════════
 * VEHICLE SALES ENGINE — DEMAND MODELING & PRICE REALIZATION
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Implements Section 2 (Demand Modeling) and Section 3 (Vehicle Sales Revenue):
 *
 * Demand = BaseMarketDemand
 *        × VehicleCompetitiveness
 *        × PriceAttractiveness
 *        × BrandReputationMultiplier
 *        × SpecialistReputationMultiplier
 *        × DealerCoverage
 *        × Availability
 *        × CustomerLoyalty
 *
 * Realized Price = ListPrice - DealerDiscount - PromotionalDiscount - FleetDiscount
 */

import {
  calculateHistoricalPriceAttractiveness,
  VehicleSegmentType,
} from "./historicalVehiclePricing";

export interface VehicleSalesInput {
  vehicleId: string;
  modelName: string;
  segment: "ECONOMY" | "SEDAN" | "COUPE" | "LUXURY" | "SPORTS" | "SUPERCAR" | "SUV" | "COMMERCIAL";
  listPrice: number;
  monthlyProductionCapacity: number;
  currentInventory: number;
  baseMarketMonthlyDemand: number;
  competitivenessScore: number;     // 0-100 (from engineering, aero, dynamics, crash tests)
  overallReputation: number;        // 0-100
  segmentSpecialistReputation: number; // 0-100 (e.g. performance for sports, luxury for executive)
  dealerCoveragePct: number;        // 0-100% of target territory reached
  customerLoyaltyScore: number;     // 0-100%
  macroEconomicMultiplier?: number; // 0.8 to 1.2
  year?: number;                    // Historical year for authentic segment pricing (1970 - 2025+)
  month?: number;                   // 1 - 12
}

export interface VehicleSalesResult {
  vehicleId: string;
  modelName: string;
  unitsDemanded: number;
  unitsSold: number;
  remainingInventory: number;
  listPrice: number;
  averageDiscountPct: number;
  realizedPricePerUnit: number;
  dealerCommissionPerUnit: number;
  grossRevenue: number;
  dealerCommissionsTotal: number;
  netRevenueToCompany: number;
  unmetDemandUnits: number;
  benchmarkMSRP?: number;
  factors: {
    competitivenessFactor: number;
    priceAttractivenessFactor: number;
    brandReputationFactor: number;
    specialistReputationFactor: number;
    dealerCoverageFactor: number;
    availabilityFactor: number;
    loyaltyFactor: number;
  };
}

/**
 * Calculate multi-factor market demand and realized pricing for a vehicle line
 */
export function calculateVehicleSales(input: VehicleSalesInput): VehicleSalesResult {
  const {
    vehicleId,
    modelName,
    listPrice,
    monthlyProductionCapacity,
    currentInventory,
    baseMarketMonthlyDemand,
    competitivenessScore,
    overallReputation,
    segmentSpecialistReputation,
    dealerCoveragePct,
    customerLoyaltyScore,
    macroEconomicMultiplier = 1.0,
    year,
    month = 1,
  } = input;

  // 1. Competitiveness Factor (0.4 to 1.8)
  const competitivenessFactor = Math.max(0.4, Number((competitivenessScore / 55).toFixed(2)));

  // 2. Price Attractiveness Factor:
  let priceAttractivenessFactor = 1.0;
  let benchmarkMSRP = 1000000;

  if (year !== undefined) {
    // Dynamic historical MSRP benchmark for the specific year and semi-annual period
    const histEval = calculateHistoricalPriceAttractiveness(
      listPrice,
      input.segment as VehicleSegmentType,
      year,
      month,
      overallReputation
    );
    priceAttractivenessFactor = histEval.priceAttractivenessFactor;
    benchmarkMSRP = histEval.benchmarkMSRP;
  } else {
    // Legacy fallback for tests/simulations without explicit year specified
    const segmentBenchmarks: Record<string, number> = {
      ECONOMY: 450000,
      SEDAN: 950000,
      COUPE: 1600000,
      LUXURY: 3800000,
      SPORTS: 2800000,
      SUPERCAR: 9500000,
      SUV: 1800000,
      COMMERCIAL: 850000,
    };
    benchmarkMSRP = segmentBenchmarks[input.segment] || 1000000;
    const priceRatio = listPrice / benchmarkMSRP;
    if (priceRatio <= 1.0) {
      priceAttractivenessFactor = 1.0 + (1.0 - priceRatio) * 0.8;
    } else {
      const prestigeBuffer = overallReputation / 100;
      priceAttractivenessFactor = Math.max(0.2, 1.0 - (priceRatio - 1.0) * (1.2 - prestigeBuffer * 0.5));
    }
  }

  // 3. Brand Reputation Factor (non-linear curve)
  // Rep 20 = 0.50x, Rep 50 = 1.00x, Rep 85 = 1.65x, Rep 95 = 2.10x
  const brandReputationFactor = Number(
    (0.4 + Math.pow(Math.max(10, overallReputation) / 50, 1.35) * 0.6).toFixed(2)
  );

  // 4. Specialist Segment Reputation Factor
  const specialistReputationFactor = Number(
    (0.6 + (Math.max(10, segmentSpecialistReputation) / 100) * 0.8).toFixed(2)
  );

  // 5. Dealer Coverage Factor (0.15 to 1.0)
  const dealerCoverageFactor = Math.max(0.15, Number((dealerCoveragePct / 100).toFixed(2)));

  // 6. Total available stock
  const totalAvailableStock = monthlyProductionCapacity + currentInventory;
  const availabilityFactor = totalAvailableStock > 0 ? 1.0 : 0.0;

  // 7. Customer Loyalty Factor (0.8 to 1.4)
  const loyaltyFactor = Number((0.8 + (customerLoyaltyScore / 100) * 0.6).toFixed(2));

  // Compound Demand Calculation
  const rawDemand =
    baseMarketMonthlyDemand *
    competitivenessFactor *
    priceAttractivenessFactor *
    brandReputationFactor *
    specialistReputationFactor *
    dealerCoverageFactor *
    availabilityFactor *
    loyaltyFactor *
    macroEconomicMultiplier;

  const unitsDemanded = Math.max(0, Math.round(rawDemand));
  const unitsSold = Math.min(unitsDemanded, totalAvailableStock);
  const remainingInventory = Math.max(0, totalAvailableStock - unitsSold);
  const unmetDemandUnits = Math.max(0, unitsDemanded - unitsSold);

  // 8. Realized Price & Discount Calculation (Section 3)
  // Strong brand (overallRep >= 80) discounts almost nothing (2-4% dealer margin).
  // Weak brand (overallRep < 35) must discount 12-18% to sell.
  const baselineDealerMarginPct = 0.08; // 8% dealer take
  let promotionalDiscountPct = 0;
  if (overallReputation < 40) {
    promotionalDiscountPct = ((40 - overallReputation) / 40) * 0.12; // Up to 12% discount
  }

  // Fleet discount if high volume sales
  const fleetDiscountPct = unitsSold > 500 ? 0.04 : unitsSold > 150 ? 0.02 : 0;

  const totalDiscountPct = Math.min(0.22, promotionalDiscountPct + fleetDiscountPct);
  const realizedPricePerUnit = Math.round(listPrice * (1 - totalDiscountPct));
  const dealerCommissionPerUnit = Math.round(realizedPricePerUnit * baselineDealerMarginPct);
  const netRevenuePerUnit = realizedPricePerUnit - dealerCommissionPerUnit;

  const grossRevenue = unitsSold * realizedPricePerUnit;
  const dealerCommissionsTotal = unitsSold * dealerCommissionPerUnit;
  const netRevenueToCompany = unitsSold * netRevenuePerUnit;

  return {
    vehicleId,
    modelName,
    unitsDemanded,
    unitsSold,
    remainingInventory,
    listPrice,
    averageDiscountPct: Number((totalDiscountPct * 100).toFixed(1)),
    realizedPricePerUnit,
    dealerCommissionPerUnit,
    grossRevenue,
    dealerCommissionsTotal,
    netRevenueToCompany,
    unmetDemandUnits,
    benchmarkMSRP,
    factors: {
      competitivenessFactor,
      priceAttractivenessFactor,
      brandReputationFactor,
      specialistReputationFactor,
      dealerCoverageFactor,
      availabilityFactor,
      loyaltyFactor,
    },
  };
}
