/**
 * ═══════════════════════════════════════════════════════════════════════
 * REPUTATION ↔ ECONOMY BRIDGE — REPUTATION SCORES TO REAL ₹ MODIFIERS
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Implements Sections 15, 38, 40, 41 & 42:
 *
 * The vital translator converting multi-dimensional perception into
 * concrete financial advantages across the entire corporate empire.
 *
 * Compounding Principle (Section 41):
 * - Supplier reputation:      -4% to -16% component costs
 * - Manufacturing reputation: -3% to -8% production defect costs
 * - Logistics reputation:     -3% to -10% freight rates
 * - Employer reputation:      -6% to -24% salary premium (prestige discount)
 * - Industrial reputation:    -4% to -20% factory construction CapEx
 * - Customer/Brand rep:       +7% to +35% market demand elasticity
 * - Commercial Trust:         -1.5% to -4.0% interest on debt financing
 *
 * Expectation Pressure (Section 42):
 * - High reputation carries high stakes. If a world-famous marque (Rep 90)
 *   releases a substandard vehicle, the fallout multiplier is 2.5x harsher
 *   than if an unknown startup (Rep 25) does the same.
 */

import { DimensionScores, ReputationDimensionKey } from "../../state/reputationEngine";

export interface ReputationFinancialModifiers {
  // Direct % financial impacts
  employerSalaryDiscountPct: number;      // e.g. 14 for 14% salary savings
  supplierNegotiationAdvantagePct: number; // e.g. 10 for 10% BOM discount
  constructionCostDiscountPct: number;    // e.g. 15 for 15% CapEx savings
  brandSalesDemandMultiplier: number;     // e.g. 1.25 for +25% sales demand
  pricingPrestigeTolerancePct: number;    // e.g. 18 for +18% list price tolerance
  warrantyDefectReductionPct: number;     // e.g. 45 for 45% fewer warranty claims
  financingInterestRateDiscount: number;  // e.g. 0.025 for 2.5% lower APR on loans
  contractAccessTier: number;             // Tier 1 to 6 unlocked

  // Section 42: Expectation pressure & risk
  reputationFallMultiplier: number;       // 1.0x at Rep 30 -> 2.6x at Rep 90
  customerExpectationLevel: "TOLERANT" | "MODERATE" | "DEMANDING" | "UNCOMPROMISING";
  mediaScrutinyLevel: "LOCAL_PRESS" | "TRADE_JOURNALS" | "NATIONAL_MEDIA" | "GLOBAL_HEADLINES";

  // Section 38: Realized annual economic values (in ₹)
  estimatedAnnualHiringSavings: number;
  estimatedAnnualSupplySavings: number;
  estimatedAnnualConstructionSavings: number;
  estimatedAnnualBrandRevenueBoost: number;
  totalAnnualEconomicAdvantage: number;
}

/**
 * Compute the comprehensive financial modifiers derived from multi-dimensional reputation
 */
export function calculateReputationFinancialModifiers(
  scores: DimensionScores,
  context?: {
    annualPayrollEstimate?: number;
    annualBOMSpendEstimate?: number;
    activeConstructionBudget?: number;
    annualVehicleSalesRevenue?: number;
  }
): ReputationFinancialModifiers {
  const get = (key: ReputationDimensionKey): number => scores[key]?.score ?? 30;

  const employerScore = get("employer");
  const supplierScore = get("supplier");
  const contractsScore = get("contracts");
  const industrialScore = get("industrial");
  const reliabilityScore = get("reliability");
  const mfgScore = get("manufacturingQuality");
  const luxuryScore = get("luxury");
  const designScore = get("design");
  const commercialTrust = get("commercialTrust");
  const customerService = get("customerService");

  // Master overall reputation
  const overallReputation =
    get("engineering") * 0.12 +
    get("performance") * 0.08 +
    reliabilityScore * 0.12 +
    mfgScore * 0.08 +
    designScore * 0.08 +
    get("safety") * 0.08 +
    luxuryScore * 0.06 +
    contractsScore * 0.08 +
    commercialTrust * 0.08 +
    employerScore * 0.06 +
    industrialScore * 0.04 +
    supplierScore * 0.04 +
    customerService * 0.06 +
    get("innovation") * 0.04;

  // 1. Employer Salary Discount / Premium:
  // Rep < 28: negative discount (premium paid)
  // Rep >= 28: up to 24% discount on hiring / payroll
  let employerSalaryDiscountPct = 0;
  if (employerScore < 28) {
    employerSalaryDiscountPct = -Number((((28 - employerScore) / 28) * 12).toFixed(1));
  } else {
    employerSalaryDiscountPct = Number((((employerScore - 28) / 72) * 22).toFixed(1));
  }

  // 2. Supplier Negotiation Advantage:
  // High supplier + contract score brings 0% to 16% discount on parts
  const supplierComposite = supplierScore * 0.65 + contractsScore * 0.35;
  const supplierNegotiationAdvantagePct =
    supplierComposite >= 30
      ? Number((Math.min(16, ((supplierComposite - 30) / 70) * 16)).toFixed(1))
      : 0;

  // 3. Construction Cost Discount:
  // Industrial + contracts + overall brings 0% to 20% discount on factory CapEx
  const industrialComposite = industrialScore * 0.55 + contractsScore * 0.30 + overallReputation * 0.15;
  const constructionCostDiscountPct =
    industrialComposite >= 25
      ? Number((Math.min(20, ((industrialComposite - 25) / 75) * 20)).toFixed(1))
      : 0;

  // 4. Brand Sales Demand Multiplier:
  // Non-linear boost: 0.50x (weak) to 2.1x (superbrand)
  const brandSalesDemandMultiplier = Number(
    (0.45 + Math.pow(Math.max(10, overallReputation) / 50, 1.35) * 0.55).toFixed(2)
  );

  // 5. Pricing Prestige Tolerance:
  // How much premium over segment average the carmaker can charge without losing sales
  const prestigeScore = luxuryScore * 0.45 + designScore * 0.30 + overallReputation * 0.25;
  const pricingPrestigeTolerancePct = Number((Math.max(0, (prestigeScore - 30) / 70) * 35).toFixed(1));

  // 6. Warranty Defect Reduction:
  // Reliability + Manufacturing quality reduces warranty claims by up to 65%
  const qualityComposite = reliabilityScore * 0.60 + mfgScore * 0.40;
  const warrantyDefectReductionPct = Number((Math.max(0, (qualityComposite - 20) / 80) * 65).toFixed(1));

  // 7. Financing Interest Rate Discount:
  // Commercial trust lowers bank borrowing rates by up to 3.5% (0.035)
  const financingInterestRateDiscount = Number(
    (Math.max(0, (commercialTrust - 30) / 70) * 0.035).toFixed(3)
  );

  // 8. Contract Access Tier:
  // 1 (Local Parts) to 6 (Global Strategic Alliance)
  let contractAccessTier = 1;
  if (contractsScore >= 85 && overallReputation >= 80) contractAccessTier = 6;
  else if (contractsScore >= 70 && overallReputation >= 65) contractAccessTier = 5;
  else if (contractsScore >= 55) contractAccessTier = 4;
  else if (contractsScore >= 40) contractAccessTier = 3;
  else if (contractsScore >= 25) contractAccessTier = 2;

  // 9. Section 42: Expectation Pressure & Fall Multiplier
  let reputationFallMultiplier = 1.0;
  let customerExpectationLevel: ReputationFinancialModifiers["customerExpectationLevel"] = "TOLERANT";
  let mediaScrutinyLevel: ReputationFinancialModifiers["mediaScrutinyLevel"] = "LOCAL_PRESS";

  if (overallReputation >= 85) {
    reputationFallMultiplier = 2.6; // Harsh fall for elite marcas
    customerExpectationLevel = "UNCOMPROMISING";
    mediaScrutinyLevel = "GLOBAL_HEADLINES";
  } else if (overallReputation >= 65) {
    reputationFallMultiplier = 1.8;
    customerExpectationLevel = "DEMANDING";
    mediaScrutinyLevel = "NATIONAL_MEDIA";
  } else if (overallReputation >= 45) {
    reputationFallMultiplier = 1.3;
    customerExpectationLevel = "MODERATE";
    mediaScrutinyLevel = "TRADE_JOURNALS";
  }

  // 10. Estimated Realized Annual ₹ Advantages (Section 38 Cross-Reference)
  const payrollEst = context?.annualPayrollEstimate ?? 2500000;
  const bomEst = context?.annualBOMSpendEstimate ?? 12000000;
  const capexEst = context?.activeConstructionBudget ?? 20000000;
  const salesRevEst = context?.annualVehicleSalesRevenue ?? 35000000;

  const estimatedAnnualHiringSavings = Math.round(payrollEst * (employerSalaryDiscountPct / 100));
  const estimatedAnnualSupplySavings = Math.round(bomEst * (supplierNegotiationAdvantagePct / 100));
  const estimatedAnnualConstructionSavings = Math.round(capexEst * (constructionCostDiscountPct / 100));
  const estimatedAnnualBrandRevenueBoost = Math.round(
    salesRevEst * Math.max(0, brandSalesDemandMultiplier - 1.0)
  );

  const totalAnnualEconomicAdvantage =
    estimatedAnnualHiringSavings +
    estimatedAnnualSupplySavings +
    estimatedAnnualConstructionSavings +
    estimatedAnnualBrandRevenueBoost;

  return {
    employerSalaryDiscountPct,
    supplierNegotiationAdvantagePct,
    constructionCostDiscountPct,
    brandSalesDemandMultiplier,
    pricingPrestigeTolerancePct,
    warrantyDefectReductionPct,
    financingInterestRateDiscount,
    contractAccessTier,
    reputationFallMultiplier,
    customerExpectationLevel,
    mediaScrutinyLevel,
    estimatedAnnualHiringSavings,
    estimatedAnnualSupplySavings,
    estimatedAnnualConstructionSavings,
    estimatedAnnualBrandRevenueBoost,
    totalAnnualEconomicAdvantage,
  };
}
