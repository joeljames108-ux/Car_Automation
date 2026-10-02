/**
 * ═══════════════════════════════════════════════════════════════════════
 * TRADE CONTRACT & SUPPLIER NEGOTIATION ENGINE
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Implements Section 10 & 11 & 27:
 * - Competitive supplier bidding (Atlas vs Nippon vs Midlands)
 * - Duration tiers: Spot vs Annual vs Multi-Year vs Exclusive
 * - Payment terms: Cash Upfront (-5% discount), Net-30, Net-90 (+4% interest)
 * - Buyer reputation leverage: Unlocks credit terms & priority allocations
 */

import {
  ActiveSupplierContract,
  ComponentCategory,
  PaymentTermsType,
  ProcessedMaterialType,
  SupplierContractType,
  SupplierProfile,
} from "./tradeTypes";
import { NPC_SUPPLIERS } from "./supplierRegistry";

export interface SupplierBidComparison {
  supplier: SupplierProfile;
  basePricePerUnit: number;
  offeredPricePerUnit: number;
  effectiveDiscountPct: number;
  offeredTerms: PaymentTermsType;
  priorityDeliveryGuaranteed: boolean;
  qualityCompositeScore: number;
  leadTimeDays: number;
  suitabilityScore: number; // 0 - 100 recommendation
  strategicVerdict: string;
}

export const PAYMENT_TERM_MODIFIERS: Record<PaymentTermsType, { costModifierPct: number; description: string }> = {
  CASH_UPFRONT: { costModifierPct: -5, description: "5% early settlement discount" },
  NET_30: { costModifierPct: 0, description: "Standard commercial 30-day terms" },
  NET_90: { costModifierPct: 4, description: "Extended 90-day vendor financing with 4% surcharge" },
};

export function calculateVolumeDiscountPct(monthlyVolume: number): number {
  if (monthlyVolume >= 5000) return 15;
  if (monthlyVolume >= 2000) return 10;
  if (monthlyVolume >= 500) return 5;
  return 0;
}

export function calculateDurationDiscountPct(durationYears: number): number {
  if (durationYears >= 5) return 15;
  if (durationYears >= 3) return 10;
  if (durationYears >= 1) return 5;
  return 0;
}

/** Baseline reference unit prices in INR (₹) per tonne or per component set */
export const BASELINE_MARKET_PRICES: Record<ProcessedMaterialType | ComponentCategory, number> = {
  // Metals (per tonne)
  BASIC_CARBON_STEEL: 52000,
  HIGH_STRENGTH_STEEL: 78000,
  ADVANCED_UHSS_STEEL: 135000,
  DUCTILE_CAST_IRON: 62000,
  ALUMINUM_SHEET_6000: 185000,
  ALUMINUM_FORGING_7000: 245000,
  MAGNESIUM_ALLOY_CAST: 320000,
  TITANIUM_GRADE_5: 1850000,
  // Polymers & Glass (per tonne)
  ENGINEERING_POLYMERS: 120000,
  VULCANIZED_RUBBER: 95000,
  AUTOMOTIVE_FLOAT_GLASS: 68000,
  CARBON_FIBER_PREPREG: 2800000,
  // Electronics & Electrification (per tonne / unit lot)
  ELECTROLYTIC_COPPER: 650000,
  SEMICONDUCTOR_SILICON: 4500000,
  BATTERY_CATHODE_NMC: 1400000,
  BATTERY_ANODE_GRAPHITE: 850000,
  // Components (per car set in ₹)
  CHASSIS_BODY_PANELS: 85000,
  SUSPENSION_ARMS_SPRINGS: 42000,
  BRAKE_DISCS_CALIPERS: 38000,
  ENGINE_BLOCK_INTERNALS: 110000,
  TRANSMISSION_GEARS_SHAFTS: 78000,
  WIRING_HARNESS_ECU: 45000,
  TYRES_WHEELS: 32000,
  AUTOMOTIVE_GLASS: 18000,
  INTERIOR_DASH_TRIM: 28000,
  BATTERY_CELL_MODULES: 320000,
};

/**
 * Generates competitive supplier quotes for a given material or component.
 * Suppliers compete based on price, quality, volume discounts, and payment terms.
 */
export function getCompetitiveBids(
  itemKey: ProcessedMaterialType | ComponentCategory,
  monthlyVolume: number,
  contractType: SupplierContractType = "ANNUAL",
  buyerReputationScore: number = 70 // Commercial trust score 0-100
): SupplierBidComparison[] {
  const matchingSuppliers = NPC_SUPPLIERS.filter((s) => s.specializations.includes(itemKey));
  const basePrice = BASELINE_MARKET_PRICES[itemKey] ?? 75000;

  return matchingSuppliers.map((supplier) => {
    // Quality adjustment: higher purity / consistency costs more
    const qualityComposite = Math.round(
      (supplier.baseQualityVector.strength +
        supplier.baseQualityVector.consistency +
        supplier.baseQualityVector.purity) / 3
    );
    const qualityPremiumPct = ((qualityComposite - 75) / 100) * 0.45; // Up to +15% for top-tier quality

    // Volume discount curve: larger orders get volume breaks
    let volumeDiscountPct = 0;
    if (monthlyVolume >= supplier.minimumOrderVolume * 3) {
      volumeDiscountPct = 0.07;
    }
    if (monthlyVolume >= supplier.minimumOrderVolume * 6) {
      volumeDiscountPct = 0.12;
    }

    // Contract type modifier
    let contractTypeDiscountPct = 0;
    let priorityGuaranteed = false;
    switch (contractType) {
      case "SPOT":
        contractTypeDiscountPct = -0.08; // 8% spot surcharge
        break;
      case "ANNUAL":
        contractTypeDiscountPct = 0.04;
        break;
      case "MULTI_YEAR":
        contractTypeDiscountPct = 0.11; // 11% long-term commitment discount
        break;
      case "EXCLUSIVE":
        contractTypeDiscountPct = 0.18; // 18% partnership discount
        priorityGuaranteed = true;
        break;
    }

    // Buyer reputation discount: high commercial trust earns respect
    const repDiscountPct = Math.max(0, (buyerReputationScore - 60) * 0.0025); // e.g. 80 rep = 5% extra discount

    // Relationship bonus
    const relBonusPct = (supplier.relationshipScore / 100) * 0.04;

    // Net discount
    const totalDiscountPct = volumeDiscountPct + contractTypeDiscountPct + repDiscountPct + relBonusPct - qualityPremiumPct;
    const finalPrice = Math.round(basePrice * (1 - totalDiscountPct));

    // Determine terms offered to buyer
    let terms: PaymentTermsType = "CASH_UPFRONT";
    if (buyerReputationScore >= 65 && supplier.offeredPaymentTerms.includes("NET_30")) {
      terms = "NET_30";
    }
    if (buyerReputationScore >= 82 && supplier.offeredPaymentTerms.includes("NET_90")) {
      terms = "NET_90";
    }

    // Suitability calculation
    const priceScore = Math.max(0, 100 - (finalPrice / basePrice) * 50);
    const reliabilityScore = supplier.reliabilityRating;
    const suitabilityScore = Math.round(priceScore * 0.4 + qualityComposite * 0.35 + reliabilityScore * 0.25);

    let verdict = "Standard commercial grade";
    if (qualityComposite >= 90) verdict = "Benchmark Class-A racing/luxury quality";
    else if (finalPrice < basePrice * 0.9) verdict = "Aggressive cost leader for mass production";
    else if (supplier.reliabilityRating >= 95) verdict = "Ultra-reliable supply guarantee with zero stockout risk";

    return {
      supplier,
      basePricePerUnit: basePrice,
      offeredPricePerUnit: finalPrice,
      effectiveDiscountPct: parseFloat((totalDiscountPct * 100).toFixed(1)),
      offeredTerms: terms,
      priorityDeliveryGuaranteed: priorityGuaranteed,
      qualityCompositeScore: qualityComposite,
      leadTimeDays: supplier.baseLeadTimeDays,
      suitabilityScore,
      strategicVerdict: verdict,
    };
  });
}

/** Formulate an active supplier contract */
export function createActiveSupplierContract(
  bid: SupplierBidComparison,
  itemCategory: ProcessedMaterialType | ComponentCategory,
  monthlyVolume: number,
  contractType: SupplierContractType,
  currentMonth: number,
  currentYear: number
): ActiveSupplierContract {
  const durationMonths =
    contractType === "SPOT" ? 1 : contractType === "ANNUAL" ? 12 : contractType === "MULTI_YEAR" ? 36 : 48;

  return {
    contractId: `sc_${bid.supplier.id}_${itemCategory.toLowerCase()}_${Date.now()}`,
    supplierId: bid.supplier.id,
    supplierName: bid.supplier.name,
    itemCategory,
    itemName: itemCategory.replace(/_/g, " "),
    contractType,
    monthlyCommittedVolume: monthlyVolume,
    agreedPricePerUnit: bid.offeredPricePerUnit,
    paymentTerms: bid.offeredTerms,
    qualityVector: { ...bid.supplier.baseQualityVector },
    startMonth: currentMonth,
    startYear: currentYear,
    totalDurationMonths: durationMonths,
    monthsRemaining: durationMonths,
    discountPercentage: bid.effectiveDiscountPct,
    priorityDelivery: bid.priorityDeliveryGuaranteed,
    penaltyClauseActive: contractType === "MULTI_YEAR" || contractType === "EXCLUSIVE",
    fulfilledThisMonth: 0,
  };
}
