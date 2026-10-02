/**
 * ═══════════════════════════════════════════════════════════════════════
 * COMPANY VALUATION ENGINE — ENTERPRISE VALUATION & CREDIT RATING
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Implements Section 49:
 *
 * Multi-dimensional valuation of the automotive manufacturer:
 *
 * Enterprise Value =
 *     Physical Capital Assets (depreciated book value)
 *   + Liquid Cash Reserves
 *   + Intellectual Property & Proprietary Patents (R&D breakthroughs)
 *   + Brand Capital & Heritage Goodwill (from reputation engine)
 *   + Capitalized Future Earnings (3-5x operating profit multiple)
 *   - Total Debt Liabilities
 *   - Corporate Risk Discount
 *
 * Generates official Investment-Grade Credit Ratings (AAA down to D).
 */

import { BalanceSheet } from "./balanceSheet";

export type CreditRating =
  | "AAA"
  | "AA+"
  | "AA"
  | "A+"
  | "A"
  | "BBB"
  | "BB"
  | "B"
  | "CCC"
  | "D";

export interface ValuationBreakdown {
  physicalAssetsValue: number;
  liquidCash: number;
  intellectualPropertyValuation: number;
  brandGoodwillValuation: number;
  capitalizedEarningsValue: number;
  grossAssetBase: number;
  totalDebtDeduction: number;
  riskDiscountAmount: number;
  totalEnterpriseValue: number;

  // Equity & Capital Market Metrics
  sharesOutstanding: number;
  impliedSharePrice: number;
  priceToBookRatio: number;
  creditRating: CreditRating;
  borrowingCapacityMax: number;
  valuationRationale: string;
}

/**
 * Calculate multi-factor enterprise valuation and credit rating
 */
export function calculateCompanyValuation(
  balanceSheet: BalanceSheet,
  annualOperatingProfit: number,
  overallReputation: number,
  commercialTrustScore: number,
  unlockedTechnologiesCount: number,
  sharesCount: number = 10000000 // 10 million shares
): ValuationBreakdown {
  const { cash, totalPhysicalAssets, totalLiabilities } = balanceSheet;

  // 1. IP Valuation:
  // ₹1.2M per tech unlocked in 1970 era, amplified by engineering reputation
  const ipValuation = Math.round(
    unlockedTechnologiesCount * 1200000 * (1.0 + (overallReputation / 100) * 0.8)
  );

  // 2. Brand Goodwill Valuation (Section 49):
  // Reputation 85+ creates massive brand equity; reputation 30 is modest
  const brandEquityMultiplier = Math.pow(Math.max(10, overallReputation) / 45, 1.8);
  const brandGoodwillValuation = Math.round(8500000 * brandEquityMultiplier);

  // 3. Capitalized Future Operating Earnings (EV/EBIT multiple):
  // Healthy automotive companies trade at 4x to 8x annual operating profit
  let earningsMultiple = 4.5;
  if (overallReputation >= 80) earningsMultiple = 7.5;
  else if (overallReputation >= 60) earningsMultiple = 5.8;
  else if (overallReputation < 35) earningsMultiple = 3.0;

  const capitalizedEarningsValue = Math.max(0, Math.round(annualOperatingProfit * earningsMultiple));

  const grossAssetBase =
    totalPhysicalAssets +
    cash +
    ipValuation +
    brandGoodwillValuation +
    capitalizedEarningsValue;

  // 4. Risk Discount:
  // If commercial trust is low or debt-to-equity is > 2.0
  const debtToAssetsRatio = grossAssetBase > 0 ? totalLiabilities / grossAssetBase : 1.0;
  let riskDiscountPct = 0;
  if (commercialTrustScore < 40) riskDiscountPct += 0.12;
  if (debtToAssetsRatio > 0.60) riskDiscountPct += 0.18;
  if (annualOperatingProfit < 0) riskDiscountPct += 0.10;

  const riskDiscountAmount = Math.round(grossAssetBase * riskDiscountPct);
  const totalEnterpriseValue = Math.max(
    1000000,
    grossAssetBase - totalLiabilities - riskDiscountAmount
  );

  // 5. Implied Share Price
  const impliedSharePrice = Number((totalEnterpriseValue / sharesCount).toFixed(2));
  const bookValue = totalPhysicalAssets + cash - totalLiabilities;
  const priceToBookRatio = bookValue > 0
    ? Number((totalEnterpriseValue / bookValue).toFixed(2))
    : 99.0;

  // 6. Credit Rating Determination
  let creditRating: CreditRating = "BBB";
  const solvencyScore =
    (commercialTrustScore * 0.35) +
    (overallReputation * 0.25) +
    (Math.max(0, 1.0 - debtToAssetsRatio) * 40);

  if (solvencyScore >= 88 && cash > totalLiabilities * 2) creditRating = "AAA";
  else if (solvencyScore >= 80) creditRating = "AA+";
  else if (solvencyScore >= 74) creditRating = "AA";
  else if (solvencyScore >= 66) creditRating = "A+";
  else if (solvencyScore >= 58) creditRating = "A";
  else if (solvencyScore >= 48) creditRating = "BBB";
  else if (solvencyScore >= 38) creditRating = "BB";
  else if (solvencyScore >= 28) creditRating = "B";
  else if (totalEnterpriseValue > 5000000) creditRating = "CCC";
  else creditRating = "D";

  // Maximum conservative borrowing capacity = 40% of tangible assets + 2x annual profit
  const borrowingCapacityMax = Math.max(
    5000000,
    Math.round(totalPhysicalAssets * 0.40 + Math.max(0, annualOperatingProfit) * 2.5)
  );

  let rationale = `Valuation driven by solid physical asset base and growing brand prestige.`;
  if (capitalizedEarningsValue > totalPhysicalAssets * 1.5) {
    rationale = `Valuation dominated by strong commercial profitability and high market capitalization multiples.`;
  } else if (brandGoodwillValuation > totalPhysicalAssets) {
    rationale = `Valuation heavily supported by premium brand goodwill and market perception.`;
  }

  return {
    physicalAssetsValue: totalPhysicalAssets,
    liquidCash: cash,
    intellectualPropertyValuation: ipValuation,
    brandGoodwillValuation,
    capitalizedEarningsValue,
    grossAssetBase,
    totalDebtDeduction: totalLiabilities,
    riskDiscountAmount,
    totalEnterpriseValue,
    sharesOutstanding: sharesCount,
    impliedSharePrice,
    priceToBookRatio,
    creditRating,
    borrowingCapacityMax,
    valuationRationale: rationale,
  };
}
