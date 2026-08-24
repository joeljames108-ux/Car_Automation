// ===================================================================
// GLOBAL AUTOMOTIVE OEM TYCOON & MACROECONOMIC FINANCIAL ENGINE
// ===================================================================
// Simulates global OEM corporate finance (Income Statement, EBITDA, P&L),
// multi-region dealership distribution networks, CapEx factory tooling
// depreciation, brand equity prestige, and macroeconomic market cycles.
// ===================================================================

export type GeographicRegion =
  | "NORTH_AMERICA"
  | "EUROPE_EU"
  | "ASIA_PACIFIC_CHINA_JAPAN"
  | "LATIN_AMERICA"
  | "MIDDLE_EAST_GCC";

export type DistributionChannelType =
  | "FRANCHISED_DEALERSHIP_NETWORK"
  | "DIRECT_TO_CONSUMER_D2C_AGENCY"
  | "HYBRID_OMNICHANNEL";

export interface RegionalMarketPerformance {
  region: GeographicRegion;
  totalMarketDemandUnits: number;
  oemMarketSharePct: number;
  monthlyUnitSales: number;
  averageSellingPriceUSD: number;
  regionalGrossRevenueUSD: number;
  dealershipShowroomCount: number;
  importTariffRatePct: number;
  logisticsFreightCostPerUnitUSD: number;
}

export interface FactoryCapExProfile {
  factoryId: string;
  factoryName: string;
  locationRegion: GeographicRegion;
  annualCapacityUnits: number;
  initialCapExToolingUSD: number;
  accumulatedDepreciationUSD: number;
  toolingUsefulLifeYears: number;
  overallEquipmentEffectivenessOeePct: number; // 0 - 100%
  automationLevelPct: number;
  unitLaborCostUSD: number;
  unitEnergyCostUSD: number;
}

export interface OemCorporateIncomeStatement {
  quarterIndex: number;
  fiscalYear: number;
  totalGrossRevenueUSD: number;
  costOfGoodsSoldCogsUSD: number;
  grossProfitUSD: number;
  grossMarginPct: number;
  researchAndDevelopmentExpensesUSD: number;
  salesMarketingAndDealerMarginUSD: number;
  generalAndAdministrativeEarningUSD: number;
  operatingExpensesOpExUSD: number;
  ebitdaUSD: number;
  ebitdaMarginPct: number;
  depreciationAndAmortizationUSD: number;
  operatingIncomeEbitUSD: number;
  incomeTaxExpenseUSD: number;
  netIncomeUSD: number;
  netMarginPct: number;
  freeCashFlowUSD: number;
  brandEquityPrestigeScore: number; // 0 - 100
  corporateCreditRating: "AAA" | "AA" | "A" | "BBB" | "BB" | "B" | "CCC";
}

export class GlobalMacroeconomicTycoonEngine {
  /**
   * Calculates quarterly factory tooling depreciation using Straight-Line or MACRS method.
   */
  public static calculateQuarterlyDepreciation(factory: FactoryCapExProfile): number {
    const annualDepreciation = factory.initialCapExToolingUSD / Math.max(1, factory.toolingUsefulLifeYears);
    return Number((annualDepreciation / 4).toFixed(2));
  }

  /**
   * Evaluates OEM Brand Equity & Prestige Score based on Motorsport Victories, Safety, and Quality.
   */
  public static calculateBrandPrestige(params: {
    historicalPrestige: number;
    motorsportWinsCount: number;
    averageSafetyNcapStars: number;
    pressReviewScoreAvg: number; // 0 - 10
    customerPpmDefectRate: number;
  }): number {
    const { historicalPrestige, motorsportWinsCount, averageSafetyNcapStars, pressReviewScoreAvg, customerPpmDefectRate } = params;

    const motorsportBonus = Math.min(15, motorsportWinsCount * 2.5);
    const safetyBonus = (averageSafetyNcapStars / 5) * 10;
    const pressBonus = (pressReviewScoreAvg / 10) * 15;
    const qualityPenalty = (customerPpmDefectRate / 100) * 8;

    const rawPrestige = historicalPrestige * 0.70 + motorsportBonus + safetyBonus + pressBonus - qualityPenalty;
    return Number(Math.min(99, Math.max(20, rawPrestige)).toFixed(1));
  }

  /**
   * Computes complete OEM Corporate Income Statement & P&L for a fiscal quarter.
   */
  public static solveQuarterlyIncomeStatement(params: {
    quarterIndex: number;
    fiscalYear: number;
    regionalMarkets: RegionalMarketPerformance[];
    factories: FactoryCapExProfile[];
    distributionChannel: DistributionChannelType;
    annualRnDBudgetUSD: number;
    brandPrestigeScore: number;
    corporateTaxRatePct: number;
  }): OemCorporateIncomeStatement {
    const {
      quarterIndex,
      fiscalYear,
      regionalMarkets,
      factories,
      distributionChannel,
      annualRnDBudgetUSD,
      brandPrestigeScore,
      corporateTaxRatePct,
    } = params;

    // 1. Total Revenue across 5 global regions
    let totalGrossRevenueUSD = 0;
    let totalUnitsSold = 0;

    regionalMarkets.forEach((m) => {
      const regionRevenue = m.monthlyUnitSales * 3 * m.averageSellingPriceUSD; // 3 months/quarter
      totalGrossRevenueUSD += regionRevenue;
      totalUnitsSold += m.monthlyUnitSales * 3;
    });

    // 2. Cost of Goods Sold (COGS): Materials, Factory Labor, Energy, Logistics, Tariffs
    let cogsMaterialsUSD = 0;
    let cogsLaborEnergyUSD = 0;
    let cogsLogisticsTariffUSD = 0;

    const avgUnitMaterial = totalGrossRevenueUSD > 0 ? (totalGrossRevenueUSD / Math.max(1, totalUnitsSold)) * 0.42 : 12000;

    factories.forEach((f) => {
      cogsLaborEnergyUSD += (f.unitLaborCostUSD + f.unitEnergyCostUSD) * (totalUnitsSold / factories.length);
    });

    regionalMarkets.forEach((m) => {
      const tariffCost = (m.monthlyUnitSales * 3 * m.averageSellingPriceUSD) * (m.importTariffRatePct / 100);
      const freightCost = (m.monthlyUnitSales * 3) * m.logisticsFreightCostPerUnitUSD;
      cogsLogisticsTariffUSD += tariffCost + freightCost;
    });

    cogsMaterialsUSD = totalUnitsSold * avgUnitMaterial;
    const costOfGoodsSoldCogsUSD = cogsMaterialsUSD + cogsLaborEnergyUSD + cogsLogisticsTariffUSD;

    const grossProfitUSD = totalGrossRevenueUSD - costOfGoodsSoldCogsUSD;
    const grossMarginPct = Number(((grossProfitUSD / Math.max(1, totalGrossRevenueUSD)) * 100).toFixed(1));

    // 3. Operating Expenses (OpEx): R&D, Sales & Marketing, Dealer Margin, G&A
    const quarterlyRnDUSD = annualRnDBudgetUSD / 4;

    // Dealer margin is ~12% for franchised network vs ~3% for D2C agency
    const dealerMarginRate = distributionChannel === "FRANCHISED_DEALERSHIP_NETWORK" ? 0.12 : distributionChannel === "DIRECT_TO_CONSUMER_D2C_AGENCY" ? 0.03 : 0.07;
    const salesMarketingAndDealerMarginUSD = totalGrossRevenueUSD * dealerMarginRate + 15000000; // $15M marketing campaign
    const generalAndAdministrativeEarningUSD = totalGrossRevenueUSD * 0.04 + 8000000; // G&A overhead

    const operatingExpensesOpExUSD = quarterlyRnDUSD + salesMarketingAndDealerMarginUSD + generalAndAdministrativeEarningUSD;

    // 4. EBITDA & Operating Income (EBIT)
    const ebitdaUSD = grossProfitUSD - operatingExpensesOpExUSD;
    const ebitdaMarginPct = Number(((ebitdaUSD / Math.max(1, totalGrossRevenueUSD)) * 100).toFixed(1));

    let depreciationAndAmortizationUSD = 0;
    factories.forEach((f) => {
      depreciationAndAmortizationUSD += this.calculateQuarterlyDepreciation(f);
    });

    const operatingIncomeEbitUSD = ebitdaUSD - depreciationAndAmortizationUSD;

    // 5. Taxes & Net Income
    const incomeTaxExpenseUSD = Math.max(0, operatingIncomeEbitUSD * (corporateTaxRatePct / 100));
    const netIncomeUSD = operatingIncomeEbitUSD - incomeTaxExpenseUSD;
    const netMarginPct = Number(((netIncomeUSD / Math.max(1, totalGrossRevenueUSD)) * 100).toFixed(1));

    const freeCashFlowUSD = Number((ebitdaUSD - depreciationAndAmortizationUSD * 0.5).toFixed(2));

    // Credit Rating Assignment
    let corporateCreditRating: "AAA" | "AA" | "A" | "BBB" | "BB" | "B" | "CCC" = "A";
    if (ebitdaMarginPct > 22 && netMarginPct > 12) corporateCreditRating = "AAA";
    else if (ebitdaMarginPct > 16) corporateCreditRating = "AA";
    else if (ebitdaMarginPct > 10) corporateCreditRating = "BBB";
    else if (ebitdaMarginPct < 0) corporateCreditRating = "CCC";

    return {
      quarterIndex,
      fiscalYear,
      totalGrossRevenueUSD: Number(totalGrossRevenueUSD.toFixed(2)),
      costOfGoodsSoldCogsUSD: Number(costOfGoodsSoldCogsUSD.toFixed(2)),
      grossProfitUSD: Number(grossProfitUSD.toFixed(2)),
      grossMarginPct,
      researchAndDevelopmentExpensesUSD: Number(quarterlyRnDUSD.toFixed(2)),
      salesMarketingAndDealerMarginUSD: Number(salesMarketingAndDealerMarginUSD.toFixed(2)),
      generalAndAdministrativeEarningUSD: Number(generalAndAdministrativeEarningUSD.toFixed(2)),
      operatingExpensesOpExUSD: Number(operatingExpensesOpExUSD.toFixed(2)),
      ebitdaUSD: Number(ebitdaUSD.toFixed(2)),
      ebitdaMarginPct,
      depreciationAndAmortizationUSD: Number(depreciationAndAmortizationUSD.toFixed(2)),
      operatingIncomeEbitUSD: Number(operatingIncomeEbitUSD.toFixed(2)),
      incomeTaxExpenseUSD: Number(incomeTaxExpenseUSD.toFixed(2)),
      netIncomeUSD: Number(netIncomeUSD.toFixed(2)),
      netMarginPct,
      freeCashFlowUSD,
      brandEquityPrestigeScore: brandPrestigeScore,
      corporateCreditRating,
    };
  }
}
