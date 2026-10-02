/**
 * ═══════════════════════════════════════════════════════════════════════
 * SUPPLY CHAIN COST ENGINE — MAKE VS. BUY DECISION MODEL
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Implements Sections 18 & 19:
 *
 * The strategic decision every automotive executive faces:
 * Should we build engines, transmissions, seats, and electronics in-house,
 * or outsource them to Tier-1 suppliers (e.g. Brembo, Getrag, Bosch)?
 *
 * - IN-HOUSE (MAKE): Requires heavy CapEx (tooling, factory lines),
 *   high fixed overhead, but low unit cost at scale and 100% IP control.
 *
 * - OUTSOURCED (BUY): Zero tooling CapEx, flexible volume contracts,
 *   but pays supplier profit margin and incurs supplier delivery risk.
 */

export interface SupplierBidQuote {
  supplierId: string;
  supplierName: string;
  componentName: string;
  unitPrice: number;
  minMonthlyVolume: number;
  maxMonthlyVolume: number;
  leadTimeWeeks: number;
  defectTolerancePpm: number;
  paymentTerms: "UPFRONT" | "NET_30" | "NET_60" | "NET_90";
  supplierReliabilityScore: number; // 0-100
  supplierReputationScore: number;  // 0-100
}

export interface InHouseProductionSpec {
  componentName: string;
  toolingAndCapExRequired: number;     // e.g. ₹40,000,000 for stamping dies
  toolingLifecycleUnits: number;       // e.g. 100,000 units
  fixedMonthlyPlantOverhead: number;   // e.g. ₹350,000 / month
  directUnitMaterialsAndLabor: number; // e.g. ₹32,000 per engine
  internalQualityDefectPpm: number;
  engineeringScoreRequired: number;
}

export interface MakeOrBuyEvaluation {
  componentName: string;
  annualVolume: number;
  monthlyVolume: number;

  // In-House Cost at volume
  inHouseUnitCostAtVolume: number;
  inHouseAnnualTotalCost: number;
  inHouseInitialCapEx: number;

  // Supplier Cost at volume
  bestSupplierQuote: SupplierBidQuote;
  supplierUnitCostAtVolume: number;
  supplierAnnualTotalCost: number;

  // Decision & Breakeven
  recommendation: "MAKE_IN_HOUSE" | "BUY_FROM_SUPPLIER" | "MARGINAL";
  breakevenMonthlyVolume: number; // Volume above which making becomes cheaper than buying
  annualSavingsWithRecommendation: number;
  strategicRationale: string;
}

/**
 * Evaluate Make vs Buy financial tradeoffs for a major vehicle subsystem
 */
export function evaluateMakeOrBuyDecision(
  spec: InHouseProductionSpec,
  supplierQuotes: SupplierBidQuote[],
  monthlyVolume: number,
  supplierReputationScore: number = 30 // Player's supplier reputation
): MakeOrBuyEvaluation {
  const safeVolume = Math.max(1, monthlyVolume);
  const annualVolume = safeVolume * 12;

  // 1. Calculate in-house amortized cost per unit
  // Tooling amortized per unit + fixed plant overhead per unit + direct BOM/labor
  const toolingAmortizationPerUnit = Math.round(spec.toolingAndCapExRequired / Math.max(1, spec.toolingLifecycleUnits));
  const fixedOverheadPerUnit = Math.round(spec.fixedMonthlyPlantOverhead / safeVolume);
  const inHouseUnitCostAtVolume =
    spec.directUnitMaterialsAndLabor +
    fixedOverheadPerUnit +
    toolingAmortizationPerUnit;
  const inHouseAnnualTotalCost = annualVolume * inHouseUnitCostAtVolume;

  // 2. Select best supplier quote (adjusted by player's supplier reputation discount)
  // Higher supplier reputation gives up to 15% discount on supplier quotes
  const supplierDiscount = Math.min(0.15, Math.max(0, (supplierReputationScore - 25) / 75) * 0.15);

  let bestQuote: SupplierBidQuote = supplierQuotes[0] || {
    supplierId: "sup_default",
    supplierName: "Generic Tier-1 Consortium",
    componentName: spec.componentName,
    unitPrice: spec.directUnitMaterialsAndLabor * 1.45,
    minMonthlyVolume: 10,
    maxMonthlyVolume: 20000,
    leadTimeWeeks: 6,
    defectTolerancePpm: 150,
    paymentTerms: "NET_30",
    supplierReliabilityScore: 75,
    supplierReputationScore: 70,
  };

  let bestEffectivePrice = bestQuote.unitPrice * (1 - supplierDiscount);
  for (const quote of supplierQuotes) {
    const discountedPrice = quote.unitPrice * (1 - supplierDiscount);
    if (discountedPrice < bestEffectivePrice) {
      bestEffectivePrice = discountedPrice;
      bestQuote = quote;
    }
  }

  const supplierUnitCostAtVolume = Math.round(bestEffectivePrice);
  const supplierAnnualTotalCost = annualVolume * supplierUnitCostAtVolume;

  // 3. Breakeven volume:
  // spec.fixedMonthlyPlantOverhead / (SupplierPrice - (spec.directUnitMaterialsAndLabor + toolingAmortizationPerUnit))
  const unitContributionToOverhead = supplierUnitCostAtVolume - (spec.directUnitMaterialsAndLabor + toolingAmortizationPerUnit);
  let breakevenMonthlyVolume = 999999;
  if (unitContributionToOverhead > 0) {
    breakevenMonthlyVolume = Math.ceil(spec.fixedMonthlyPlantOverhead / unitContributionToOverhead);
  }

  // 4. Recommendation
  let recommendation: MakeOrBuyEvaluation["recommendation"] = "MARGINAL";
  let annualSavings = 0;
  let strategicRationale = "";

  if (safeVolume >= breakevenMonthlyVolume * 1.15) {
    recommendation = "MAKE_IN_HOUSE";
    annualSavings = supplierAnnualTotalCost - inHouseAnnualTotalCost;
    strategicRationale = `High production volume (${safeVolume} units/mo) amortizes plant tooling overhead effectively. In-house manufacturing delivers ₹${Math.round(annualSavings / 1000000)}M annual savings and locks in proprietary IP.`;
  } else if (safeVolume < breakevenMonthlyVolume * 0.85) {
    recommendation = "BUY_FROM_SUPPLIER";
    annualSavings = inHouseAnnualTotalCost - supplierAnnualTotalCost;
    strategicRationale = `Production volume (${safeVolume} units/mo) is below breakeven (${breakevenMonthlyVolume} units/mo). Sourcing from ${bestQuote.supplierName} avoids ₹${Math.round(spec.toolingAndCapExRequired / 1000000)}M tooling CapEx and saves ₹${Math.round(annualSavings / 1000000)}M annually.`;
  } else {
    recommendation = "MARGINAL";
    annualSavings = Math.abs(supplierAnnualTotalCost - inHouseAnnualTotalCost);
    strategicRationale = `Volume is hovering near breakeven (${breakevenMonthlyVolume} units/mo). Decision hinges on whether internal R&D capacity is needed elsewhere.`;
  }

  return {
    componentName: spec.componentName,
    annualVolume,
    monthlyVolume: safeVolume,
    inHouseUnitCostAtVolume,
    inHouseAnnualTotalCost,
    inHouseInitialCapEx: spec.toolingAndCapExRequired,
    bestSupplierQuote: bestQuote,
    supplierUnitCostAtVolume,
    supplierAnnualTotalCost,
    recommendation,
    breakevenMonthlyVolume,
    annualSavingsWithRecommendation: Math.max(0, annualSavings),
    strategicRationale,
  };
}
