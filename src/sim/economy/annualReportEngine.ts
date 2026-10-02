/**
 * ═══════════════════════════════════════════════════════════════════════
 * ANNUAL REPORT ENGINE — YEAR-END COMPILATION & SHAREHOLDER AUDIT
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Implements Section 46:
 *
 * At the end of every December (Month 12), the simulation compiles
 * an exhaustive corporate Annual Report presented to the executive board.
 *
 * Documents:
 * - Full P&L statement (Revenue, COGS, Opex, Operating Profit)
 * - Industrial KPIs (Total Vehicles Built & Sold, Market Share)
 * - R&D breakthroughs, patents & CapEx expansions
 * - Multi-dimensional reputation changes year-over-year
 * - Notable achievements, crises mitigated & CEO Letter to Shareholders
 */

import { MonthlyFinancialSnapshot } from "./companyLedgerEngine";
import { DimensionScores, ReputationDimensionKey } from "../../state/reputationEngine";
import { ValuationBreakdown } from "./companyValuation";

export interface AnnualReport {
  year: number;
  totalAnnualRevenue: number;
  totalAnnualOperatingExpenses: number;
  totalAnnualOperatingProfit: number;
  netProfitMarginPct: number;
  yearEndCashBalance: number;
  netCashGeneratedDuringYear: number;

  // Manufacturing & Commercial Metrics
  totalVehiclesManufactured: number;
  totalVehiclesSold: number;
  averageSellingPriceRealized: number;
  marketShareOverallPct: number;
  exportMarketsCount: number;

  // Capital & Workforce
  rdCapitalInvestedTotal: number;
  technologiesUnlockedCount: number;
  factoryCapExInvestedTotal: number;
  motorsportInvestmentTotal: number;
  yearEndHeadcount: number;
  yearEndTotalAssetsCount: number;

  // Enterprise Valuation & Rating
  enterpriseValuation: ValuationBreakdown;

  // Reputation Trajectory
  yearStartOverallReputation: number;
  yearEndOverallReputation: number;
  reputationDeltas: Partial<Record<ReputationDimensionKey, number>>;

  // Narrative Summary
  majorAchievements: string[];
  majorSetbacks: string[];
  ceoLetterToShareholders: string;
}

/**
 * Compile the full Annual Report from 12 months of financial snapshots and corporate KPIs
 */
export function compileAnnualReport(
  year: number,
  monthlySnapshots: MonthlyFinancialSnapshot[],
  valuation: ValuationBreakdown,
  currentScores: DimensionScores,
  initialYearScores: DimensionScores,
  kpiData: {
    totalVehiclesBuilt: number;
    totalVehiclesSold: number;
    rdCapEx: number;
    factoryCapEx: number;
    motorsportCapEx: number;
    headcount: number;
    assetsCount: number;
    exportCountries: number;
    unlockedTechsCount: number;
    achievements?: string[];
    setbacks?: string[];
  }
): AnnualReport {
  // Filter snapshots for this year
  const yearSnapshots = monthlySnapshots.filter((s) => s.year === year);

  let totalRev = 0;
  let totalOpex = 0;
  let totalOperatingProfit = 0;
  let totalCashFlow = 0;

  for (const s of yearSnapshots) {
    totalRev += s.revenue;
    totalOpex += s.operatingExpenses;
    totalOperatingProfit += s.operatingProfit;
    totalCashFlow += s.cashFlow;
  }

  const netMargin = totalRev > 0
    ? Number(((totalOperatingProfit / totalRev) * 100).toFixed(1))
    : 0;

  const yearEndCash = yearSnapshots.length > 0
    ? yearSnapshots[yearSnapshots.length - 1].closingCash
    : valuation.liquidCash;

  const avgPrice = kpiData.totalVehiclesSold > 0
    ? Math.round(totalRev / kpiData.totalVehiclesSold)
    : 0;

  // Calculate reputation trajectory
  const repDeltas: Partial<Record<ReputationDimensionKey, number>> = {};
  for (const key of Object.keys(currentScores) as ReputationDimensionKey[]) {
    const cur = currentScores[key]?.score ?? 30;
    const start = initialYearScores[key]?.score ?? 30;
    const delta = Number((cur - start).toFixed(1));
    if (delta !== 0) repDeltas[key] = delta;
  }

  const yearStartRep = 30; // baseline or initial
  const yearEndRep = Math.round(
    Object.values(currentScores).reduce((sum, s) => sum + s.score, 0) /
      Math.max(1, Object.keys(currentScores).length)
  );

  const achievements = kpiData.achievements && kpiData.achievements.length > 0
    ? kpiData.achievements
    : [
        `Generated ₹${Math.round(totalRev / 1000000)}M in corporate revenue across vehicle and component lines.`,
        `Advanced ${kpiData.unlockedTechsCount} technology programs into active engineering deployment.`,
        `Maintained credit rating of ${valuation.creditRating} with ₹${Math.round(valuation.totalEnterpriseValue / 1000000)}M enterprise valuation.`,
      ];

  const setbacks = kpiData.setbacks && kpiData.setbacks.length > 0
    ? kpiData.setbacks
    : totalOperatingProfit < 0
    ? [`Operating burn of ₹${Math.round(Math.abs(totalOperatingProfit) / 1000000)}M absorbed by seed venture reserves.`]
    : [`Navigated competitive component price pressure in regional supplier markets.`];

  const ceoLetter = `Fiscal Year ${year} marked a transformative era of industrial foundation. With ${kpiData.headcount} dedicated employees, we have focused our balance sheet on engineering excellence and high-integrity manufacturing. As we enter the next fiscal year, our priority remains compounding our specialized reputation into sustained commercial leadership.`;

  return {
    year,
    totalAnnualRevenue: totalRev,
    totalAnnualOperatingExpenses: totalOpex,
    totalAnnualOperatingProfit: totalOperatingProfit,
    netProfitMarginPct: netMargin,
    yearEndCashBalance: yearEndCash,
    netCashGeneratedDuringYear: totalCashFlow,
    totalVehiclesManufactured: kpiData.totalVehiclesBuilt,
    totalVehiclesSold: kpiData.totalVehiclesSold,
    averageSellingPriceRealized: avgPrice,
    marketShareOverallPct: Number((Math.min(8.5, (kpiData.totalVehiclesSold / 120000) * 100)).toFixed(2)),
    exportMarketsCount: Math.max(1, kpiData.exportCountries),
    rdCapitalInvestedTotal: kpiData.rdCapEx,
    technologiesUnlockedCount: kpiData.unlockedTechsCount,
    factoryCapExInvestedTotal: kpiData.factoryCapEx,
    motorsportInvestmentTotal: kpiData.motorsportCapEx,
    yearEndHeadcount: kpiData.headcount,
    yearEndTotalAssetsCount: kpiData.assetsCount,
    enterpriseValuation: valuation,
    yearStartOverallReputation: yearStartRep,
    yearEndOverallReputation: yearEndRep,
    reputationDeltas: repDeltas,
    majorAchievements: achievements,
    majorSetbacks: setbacks,
    ceoLetterToShareholders: ceoLetter,
  };
}
