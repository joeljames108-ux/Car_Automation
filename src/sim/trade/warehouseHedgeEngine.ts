/**
 * ═══════════════════════════════════════════════════════════════════════
 * WAREHOUSE STOCKPILE ECONOMICS & HEDGING ENGINE
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Implements Phase 6: Warehouse Stockpile Economics & Hedging Mechanic.
 *
 * Connects the semi-annual price revisions to physical warehouse storage:
 * - FIFO / Weighted-Average Inventory Cost Accounting:
 *   Materials procured before 1 July / 1 January retain their lower purchase cost basis.
 *   As vehicles are stamped and assembled post-revision, production consumes the low-cost
 *   inventory first, directly preserving profit margins!
 *
 * - Warehouse ROI & Hedging Advisor:
 *   Evaluates remaining warehouse capacity (tonnes) and SKU slots, balances monthly holding
 *   costs (1.8% to 2.2%/mo) against projected inflation spikes, and provides optimal
 *   bulk procurement recommendations.
 */

import { ProcessedMaterialType } from "./tradeTypes";
import {
  getSemiAnnualRecord,
  getNextSemiAnnualRecord,
  calculateProjectedRevisionDelta,
  SemiAnnualPeriod,
} from "../economy/historicalInflationData";
import { BASE_1970_PROCESSED_MATERIALS_USD } from "../economy/semiAnnualPriceRevisionEngine";

export interface MaterialHedgeItem {
  materialKey: ProcessedMaterialType;
  name: string;
  currentSpotPriceUSD: number;
  projectedNextPriceUSD: number;
  projectedHikePct: number;
  recommendedStockpileTonnes: number;
  estimatedAcquisitionCostUSD: number;
  estimatedGrossSavingsUSD: number;
  holdingCostOver3MonthsUSD: number;
  netProjectedSavingsUSD: number;
  roiPct: number;
}

export interface OptimalHedgePlan {
  currentDateStr: string;
  nextRevisionDateStr: string;
  daysUntilRevision: number;
  totalAvailableCapacityTonnes: number;
  recommendedTotalTonnage: number;
  totalCapitalRequiredUSD: number;
  netProjectedSavingsUSD: number;
  averageRoiPct: number;
  recommendedMaterials: MaterialHedgeItem[];
  strategicVerdict: "AGGRESSIVE_STOCKPILE" | "SELECTIVE_STOCKPILE" | "MAINTAIN_BUFFER" | "HOLD_CASH";
  advisoryNote: string;
}

export interface RealizedHedgeSavingsSummary {
  month: number;
  year: number;
  totalRealizedSavingsUSD: number;
  materialDetails: Array<{
    materialKey: ProcessedMaterialType;
    name: string;
    tonnesConsumed: number;
    inventoryCostBasisUSD: number;
    currentMarketSpotUSD: number;
    savingsPerTonneUSD: number;
    totalSavingsUSD: number;
    marginPreservationPct: number;
  }>;
}

/**
 * Calculates realized financial savings achieved by consuming pre-revision warehouse stock
 * vs. buying at current spot market prices.
 */
export function calculateRealizedHedgeSavings(
  consumedItems: Array<{
    materialKey: ProcessedMaterialType;
    tonnesConsumed: number;
    inventoryCostBasisUSD: number;
    currentSpotPriceUSD: number;
  }>,
  year: number,
  month: number
): RealizedHedgeSavingsSummary {
  let totalRealizedSavingsUSD = 0;
  const materialDetails: RealizedHedgeSavingsSummary["materialDetails"] = [];

  for (const item of consumedItems) {
    const savingsPerTonne = Math.max(0, item.currentSpotPriceUSD - item.inventoryCostBasisUSD);
    const totalSavings = Math.round(item.tonnesConsumed * savingsPerTonne);
    totalRealizedSavingsUSD += totalSavings;

    const marginPreservationPct = item.currentSpotPriceUSD > 0
      ? Number(((savingsPerTonne / item.currentSpotPriceUSD) * 100).toFixed(1))
      : 0;

    materialDetails.push({
      materialKey: item.materialKey,
      name: item.materialKey.replace(/_/g, " "),
      tonnesConsumed: item.tonnesConsumed,
      inventoryCostBasisUSD: item.inventoryCostBasisUSD,
      currentMarketSpotUSD: item.currentSpotPriceUSD,
      savingsPerTonneUSD: savingsPerTonne,
      totalSavingsUSD: totalSavings,
      marginPreservationPct,
    });
  }

  return {
    month,
    year,
    totalRealizedSavingsUSD,
    materialDetails,
  };
}

/**
 * Formulates the optimal warehouse stockpiling hedge strategy given available storage capacity
 */
export function calculateOptimalStockpileHedge(
  availableCapacityTonnes: number,
  year: number,
  month: number,
  monthlyHoldingCostRate: number = 0.02 // 2.0% per month
): OptimalHedgePlan {
  const currentPeriod: SemiAnnualPeriod = month < 7 ? "H1_JAN" : "H2_JUL";
  const nextPeriod: SemiAnnualPeriod = currentPeriod === "H1_JAN" ? "H2_JUL" : "H1_JAN";
  const targetYear = currentPeriod === "H2_JUL" ? year + 1 : year;
  const nextRevisionDateStr = nextPeriod === "H2_JUL" ? `1 Jul ${targetYear}` : `1 Jan ${targetYear}`;
  const currentDateStr = `${month}/1/${year}`;

  const currentRecord = getSemiAnnualRecord(year, currentPeriod);
  const nextRecord = getNextSemiAnnualRecord(year, currentPeriod);

  // Focus candidates with projected price surges
  const candidates: Array<{
    key: ProcessedMaterialType;
    name: string;
    base: number;
    currentIdx: number;
    nextIdx: number;
    allocationWeight: number;
  }> = [
    {
      key: "BASIC_CARBON_STEEL",
      name: "Carbon Sheet Steel",
      base: BASE_1970_PROCESSED_MATERIALS_USD.BASIC_CARBON_STEEL,
      currentIdx: currentRecord.metalsIndex,
      nextIdx: nextRecord.metalsIndex,
      allocationWeight: 0.45, // Heavy vehicle consumption
    },
    {
      key: "VULCANIZED_RUBBER",
      name: "Vulcanized Rubber",
      base: BASE_1970_PROCESSED_MATERIALS_USD.VULCANIZED_RUBBER,
      currentIdx: currentRecord.energyPetrochemIndex,
      nextIdx: nextRecord.energyPetrochemIndex,
      allocationWeight: 0.25,
    },
    {
      key: "ALUMINUM_SHEET_6000",
      name: "6000 Aluminum Sheet",
      base: BASE_1970_PROCESSED_MATERIALS_USD.ALUMINUM_SHEET_6000,
      currentIdx: currentRecord.metalsIndex,
      nextIdx: nextRecord.metalsIndex,
      allocationWeight: 0.15,
    },
    {
      key: "ENGINEERING_POLYMERS",
      name: "Engineering Polymers",
      base: BASE_1970_PROCESSED_MATERIALS_USD.ENGINEERING_POLYMERS,
      currentIdx: currentRecord.energyPetrochemIndex,
      nextIdx: nextRecord.energyPetrochemIndex,
      allocationWeight: 0.15,
    },
  ];

  const recommendedMaterials: MaterialHedgeItem[] = [];
  let totalTonnage = 0;
  let totalCapitalRequired = 0;
  let totalNetSavings = 0;

  for (const c of candidates) {
    const currentSpot = Math.round(c.base * c.currentIdx);
    const nextSpot = Math.round(c.base * c.nextIdx);
    const hikePct = Number((((nextSpot - currentSpot) / currentSpot) * 100).toFixed(1));

    // Only recommend stockpiling if projected hike exceeds 3 months of warehouse holding cost (~6.0%)
    if (hikePct >= 6.0) {
      const allocatedTonnes = Math.round(availableCapacityTonnes * c.allocationWeight);
      if (allocatedTonnes <= 0) continue;

      const acquisitionCost = allocatedTonnes * currentSpot;
      const grossSavings = allocatedTonnes * (nextSpot - currentSpot);
      const holdingCost = Math.round(acquisitionCost * monthlyHoldingCostRate * 3); // 3 months hold
      const netSavings = Math.max(0, grossSavings - holdingCost);
      const roi = acquisitionCost > 0 ? Number(((netSavings / acquisitionCost) * 100).toFixed(1)) : 0;

      recommendedMaterials.push({
        materialKey: c.key,
        name: c.name,
        currentSpotPriceUSD: currentSpot,
        projectedNextPriceUSD: nextSpot,
        projectedHikePct: hikePct,
        recommendedStockpileTonnes: allocatedTonnes,
        estimatedAcquisitionCostUSD: acquisitionCost,
        estimatedGrossSavingsUSD: grossSavings,
        holdingCostOver3MonthsUSD: holdingCost,
        netProjectedSavingsUSD: netSavings,
        roiPct: roi,
      });

      totalTonnage += allocatedTonnes;
      totalCapitalRequired += acquisitionCost;
      totalNetSavings += netSavings;
    }
  }

  const averageRoiPct = totalCapitalRequired > 0
    ? Number(((totalNetSavings / totalCapitalRequired) * 100).toFixed(1))
    : 0;

  let strategicVerdict: OptimalHedgePlan["strategicVerdict"] = "MAINTAIN_BUFFER";
  let advisoryNote = "Commodity markets projected stable. Normal buffer stock is sufficient.";

  if (averageRoiPct >= 12.0 && availableCapacityTonnes >= 50) {
    strategicVerdict = "AGGRESSIVE_STOCKPILE";
    advisoryNote = `High inflation projected (+${recommendedMaterials[0]?.projectedHikePct ?? 15}%). Maximize available warehouse capacity before ${nextRevisionDateStr}.`;
  } else if (recommendedMaterials.length > 0) {
    strategicVerdict = "SELECTIVE_STOCKPILE";
    advisoryNote = `Targeted price hikes detected in ${recommendedMaterials.map((m) => m.name).join(", ")}. Selective pre-purchases recommended.`;
  }

  return {
    currentDateStr,
    nextRevisionDateStr,
    daysUntilRevision: month < 7 ? (7 - month) * 30 : (13 - month) * 30,
    totalAvailableCapacityTonnes: availableCapacityTonnes,
    recommendedTotalTonnage: totalTonnage,
    totalCapitalRequiredUSD: totalCapitalRequired,
    netProjectedSavingsUSD: totalNetSavings,
    averageRoiPct,
    recommendedMaterials,
    strategicVerdict,
    advisoryNote,
  };
}
