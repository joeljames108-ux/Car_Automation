/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MARKET-REVISION ENGINE & INVENTORY STOCKPILE SPECULATION SYSTEM
 * (1970 – 2026)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Implements Phase 13 of the Historical Economic Database:
 *
 * 1. Semi-Annual Price Revision Engine:
 *    - Executes market transitions every 1st January (H1) and 1st July (H2).
 *    - Updates raw commodities, industrial materials, energy rates, wages,
 *      supplier contracts, and retail vehicle MSRPs across the entire simulator.
 *    - Issues proactive warnings:
 *      - T-60 Days: Advisory bulletin on projected futures / inflationary shifts.
 *      - T-30 Days: Critical alert to lock in supplier quotes and acquire inventory.
 *      - Day 0: Price revision effective; all new catalog orders pay revised rates.
 *
 * 2. Inventory Warehouse Stockpile & Speculation Mechanic:
 *    - Player can acquire raw materials (Al, Cu, Steel, Rubber) and components
 *      ahead of projected price increases (e.g. 1973/1979 oil shocks, 2008 bubble).
 *    - Stored inventory retains its acquisition cost basis (Weighted Average).
 *    - Consuming stockpiled parts in vehicle manufacturing saves money relative
 *      to post-revision spot market prices.
 *    - Authentic monthly carrying costs (warehouse dry/cold storage per tonne).
 */

import {
  EconomicPeriodId,
  SemiAnnualRevision,
  DataProvenance,
} from "./types";
import {
  ECONOMIC_PERIODS,
  PERIOD_MAP,
  getPeriod,
  getRevisionCountdown,
} from "./economicCalendar";
import { getCPI } from "./cpiBackbone";
import { getWage } from "./wageBackbone";
import { getCommodityPrice, RawCommodityType } from "./rawCommodities";
import { getEnergyPrice, EnergyCommodityType } from "./energyPrices";
import { getIndustrialMaterialPrice, IndustrialMaterialId } from "./industrialMaterials";
import { getComponentCost, AutomotiveComponentId } from "./automotiveComponents";
import { getLogisticsTariff } from "./logistics";

export type StockpileAssetCategory =
  | "RAW_COMMODITY"
  | "INDUSTRIAL_MATERIAL"
  | "AUTOMOTIVE_COMPONENT"
  | "ENERGY_RESERVE";

export interface ProjectedPriceShift {
  category: string;
  itemId: string;
  name: string;
  unit: string;
  currentPriceUSD: number;
  projectedNextPriceUSD: number;
  dollarChangeUSD: number;
  pctChange: number;
  direction: "UP" | "DOWN" | "FLAT";
  tacticalRecommendation: "STOCKPILE_RECOMMENDED" | "DELAY_PURCHASES" | "NEUTRAL";
}

export interface MarketRevisionNotice {
  currentPeriodId: EconomicPeriodId;
  nextPeriodId: EconomicPeriodId | null;
  currentDateStr: string;
  nextRevisionDateStr: string;
  daysRemaining: number;
  warningStatus: "CALM" | "APPROACHING_T60" | "CRITICAL_T30" | "REVISION_TODAY";
  headline: string;
  bulletinSummary: string;
  projectedShifts: ProjectedPriceShift[];
}

export interface StockpileEntry {
  assetId: string;
  assetCategory: StockpileAssetCategory;
  name: string;
  unit: string;
  quantity: number;
  weightTonnes: number;
  unitCostBasisUSD: number;
  totalCostBasisUSD: number;
  acquiredDate: string;
  periodAcquired: EconomicPeriodId;
  currentMarketUnitPriceUSD: number;
  currentMarketValueUSD: number;
  unrealizedGainUSD: number;
  unrealizedGainPct: number;
  monthlyStorageCostUSD: number;
}

export interface StockpilePortfolio {
  items: Record<string, StockpileEntry>;
  totalCostBasisUSD: number;
  totalMarketValueUSD: number;
  totalUnrealizedGainUSD: number;
  portfolioReturnPct: number;
  totalMonthlyHoldingCostUSD: number;
}

/**
 * Returns current spot price and unit for any asset identifier
 */
export function getAssetCurrentMarketPrice(
  category: StockpileAssetCategory,
  assetId: string,
  year: number,
  month: number
): { unitPriceUSD: number; unit: string; name: string; weightTonnesPerUnit: number } {
  switch (category) {
    case "RAW_COMMODITY": {
      const comm = getCommodityPrice(assetId as RawCommodityType, year, month);
      return {
        unitPriceUSD: comm.priceUSD.value,
        unit: comm.unit,
        name: comm.name,
        weightTonnesPerUnit: comm.unit.includes("mt") || comm.unit.includes("tonne") ? 1.0 : comm.unit.includes("kg") ? 0.001 : 1.0,
      };
    }
    case "ENERGY_RESERVE": {
      const energy = getEnergyPrice(assetId as EnergyCommodityType, year, month);
      return {
        unitPriceUSD: energy.priceUSD.value,
        unit: energy.unit,
        name: energy.name,
        weightTonnesPerUnit: 0.136, // ~7.33 barrels per tonne of crude oil
      };
    }
    case "INDUSTRIAL_MATERIAL": {
      const mat = getIndustrialMaterialPrice(assetId as IndustrialMaterialId, year, month);
      return {
        unitPriceUSD: mat.priceUSD.value,
        unit: mat.spec.unit,
        name: mat.spec.name,
        weightTonnesPerUnit: mat.spec.unit.includes("kg") ? 0.001 : 1.0,
      };
    }
    case "AUTOMOTIVE_COMPONENT": {
      const comp = getComponentCost(assetId as AutomotiveComponentId, year, month);
      return {
        unitPriceUSD: comp.totalCostUSD.value,
        unit: "USD / unit",
        name: comp.name,
        weightTonnesPerUnit: 0.05,
      };
    }
  }
}

/**
 * Generates an executive market revision notice for any date
 */
export function getMarketRevisionNotice(
  year: number,
  month: number,
  day: number
): MarketRevisionNotice {
  const currentPeriod = getPeriod(year, month);
  const countdown = getRevisionCountdown(year, month, day);

  const nextPeriod = countdown.nextPeriod;
  const projectedShifts: ProjectedPriceShift[] = [];

  // If there is an upcoming period within simulation range, compute projected price changes
  if (nextPeriod) {
    const nextYr = nextPeriod.year;
    const nextMo = nextPeriod.revision === "H1_JAN" ? 1 : 7;

    // Track a diversified basket of key automotive assets:
    const keyAssets: Array<{ category: StockpileAssetCategory; id: string }> = [
      { category: "RAW_COMMODITY", id: "ALUMINIUM" },
      { category: "RAW_COMMODITY", id: "COPPER" },
      { category: "RAW_COMMODITY", id: "RUBBER_RSS3" },
      { category: "ENERGY_RESERVE", id: "CRUDE_OIL_WTI" },
      { category: "INDUSTRIAL_MATERIAL", id: "BASIC_HOT_ROLLED_SHEET" },
      { category: "AUTOMOTIVE_COMPONENT", id: "MANUAL_5SPEED_GEARBOX" },
    ];

    for (const asset of keyAssets) {
      const current = getAssetCurrentMarketPrice(asset.category, asset.id, year, month);
      const future = getAssetCurrentMarketPrice(asset.category, asset.id, nextYr, nextMo);

      const diff = future.unitPriceUSD - current.unitPriceUSD;
      const pct = Number((((diff) / Math.max(0.01, current.unitPriceUSD)) * 100).toFixed(2));
      const direction: "UP" | "DOWN" | "FLAT" = pct > 0.5 ? "UP" : pct < -0.5 ? "DOWN" : "FLAT";

      let recommendation: "STOCKPILE_RECOMMENDED" | "DELAY_PURCHASES" | "NEUTRAL" = "NEUTRAL";
      if (pct >= 5.0) {
        recommendation = "STOCKPILE_RECOMMENDED";
      } else if (pct <= -5.0) {
        recommendation = "DELAY_PURCHASES";
      }

      projectedShifts.push({
        category: asset.category,
        itemId: asset.id,
        name: current.name,
        unit: current.unit,
        currentPriceUSD: current.unitPriceUSD,
        projectedNextPriceUSD: future.unitPriceUSD,
        dollarChangeUSD: Number(diff.toFixed(2)),
        pctChange: pct,
        direction,
        tacticalRecommendation: recommendation,
      });
    }
  }

  // Historical headline summary for the period
  const cpiInfo = getCPI(year, month);
  let headline = cpiInfo.headlineContext;
  let bulletinSummary = `Economic period ${currentPeriod.periodId} in effect. Next revision scheduled for ${countdown.nextRevisionDateStr}.`;

  if (countdown.warningStatus === "REVISION_TODAY") {
    headline = `SEMI-ANNUAL ECONOMIC REVISION IN EFFECT (${currentPeriod.periodId})`;
    bulletinSummary = `Market prices across all materials, wages, energy tariffs, and supplier catalogs have reset to new benchmark rates. Existing warehouse inventory maintains its prior cost basis.`;
  } else if (countdown.warningStatus === "CRITICAL_T30") {
    headline = `CRITICAL NOTICE: T-${countdown.daysRemaining} DAYS UNTIL MARKET REVISION`;
    bulletinSummary = `Semi-annual economic revision arrives in ${countdown.daysRemaining} days. Purchasing officers advise locking in component contract orders and raw material stockpiles before price reset.`;
  } else if (countdown.warningStatus === "APPROACHING_T60") {
    headline = `MARKET ADVISORY: T-${countdown.daysRemaining} DAYS UNTIL MARKET REVISION`;
    bulletinSummary = `Industrial futures indicate price adjustments ahead. Reviewing warehouse holding capacity and placing advance orders is recommended.`;
  }

  return {
    currentPeriodId: currentPeriod.periodId,
    nextPeriodId: nextPeriod ? nextPeriod.periodId : null,
    currentDateStr: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
    nextRevisionDateStr: countdown.nextRevisionDateStr,
    daysRemaining: countdown.daysRemaining,
    warningStatus: countdown.warningStatus,
    headline,
    bulletinSummary,
    projectedShifts,
  };
}

/**
 * Creates an empty stockpile portfolio
 */
export function createStockpilePortfolio(): StockpilePortfolio {
  return {
    items: {},
    totalCostBasisUSD: 0,
    totalMarketValueUSD: 0,
    totalUnrealizedGainUSD: 0,
    portfolioReturnPct: 0,
    totalMonthlyHoldingCostUSD: 0,
  };
}

/**
 * Buys an asset into the warehouse stockpile, updating the weighted average cost basis
 */
export function buyStockpileAsset(
  portfolio: StockpilePortfolio,
  params: {
    category: StockpileAssetCategory;
    assetId: string;
    quantity: number;
    year: number;
    month: number;
  }
): {
  portfolio: StockpilePortfolio;
  transactionCostUSD: number;
  entry: StockpileEntry;
} {
  const { category, assetId, quantity, year, month } = params;
  const currentPeriod = getPeriod(year, month);
  const marketInfo = getAssetCurrentMarketPrice(category, assetId, year, month);

  const transactionCostUSD = Math.round(marketInfo.unitPriceUSD * quantity * 100) / 100;
  const addedWeightTonnes = marketInfo.weightTonnesPerUnit * quantity;

  // Monthly storage rate from Phase 8 logistics
  const dryStorageRateUSDPerTonne = getLogisticsTariff("WAREHOUSE_DRY_STORAGE", year, month).tariffUSD.value;

  const existing = portfolio.items[assetId];
  let updatedEntry: StockpileEntry;

  if (existing) {
    const newQty = existing.quantity + quantity;
    const newCostBasis = existing.totalCostBasisUSD + transactionCostUSD;
    const unitBasis = Math.round((newCostBasis / newQty) * 100) / 100;
    const totalWeight = existing.weightTonnes + addedWeightTonnes;
    const monthlyStorage = Math.round(totalWeight * dryStorageRateUSDPerTonne * 100) / 100;

    const marketVal = Math.round(marketInfo.unitPriceUSD * newQty * 100) / 100;
    const gainUSD = Math.round((marketVal - newCostBasis) * 100) / 100;
    const gainPct = Number((((marketVal - newCostBasis) / newCostBasis) * 100).toFixed(2));

    updatedEntry = {
      ...existing,
      quantity: newQty,
      weightTonnes: totalWeight,
      unitCostBasisUSD: unitBasis,
      totalCostBasisUSD: newCostBasis,
      currentMarketUnitPriceUSD: marketInfo.unitPriceUSD,
      currentMarketValueUSD: marketVal,
      unrealizedGainUSD: gainUSD,
      unrealizedGainPct: gainPct,
      monthlyStorageCostUSD: monthlyStorage,
    };
  } else {
    const monthlyStorage = Math.round(addedWeightTonnes * dryStorageRateUSDPerTonne * 100) / 100;

    updatedEntry = {
      assetId,
      assetCategory: category,
      name: marketInfo.name,
      unit: marketInfo.unit,
      quantity,
      weightTonnes: addedWeightTonnes,
      unitCostBasisUSD: marketInfo.unitPriceUSD,
      totalCostBasisUSD: transactionCostUSD,
      acquiredDate: `${year}-${String(month).padStart(2, "0")}-01`,
      periodAcquired: currentPeriod.periodId,
      currentMarketUnitPriceUSD: marketInfo.unitPriceUSD,
      currentMarketValueUSD: transactionCostUSD,
      unrealizedGainUSD: 0,
      unrealizedGainPct: 0,
      monthlyStorageCostUSD: monthlyStorage,
    };
  }

  const updatedItems = {
    ...portfolio.items,
    [assetId]: updatedEntry,
  };

  const evaluatedPortfolio = evaluateStockpilePortfolio(
    { ...portfolio, items: updatedItems },
    year,
    month
  );

  return {
    portfolio: evaluatedPortfolio,
    transactionCostUSD,
    entry: updatedEntry,
  };
}

/**
 * Consumes a specified quantity of a stockpiled asset in manufacturing
 */
export function consumeStockpileAsset(
  portfolio: StockpilePortfolio,
  params: {
    assetId: string;
    quantity: number;
    year: number;
    month: number;
  }
): {
  portfolio: StockpilePortfolio;
  consumedCostBasisUSD: number;
  replacementMarketCostUSD: number;
  costSavingsUSD: number;
  remainingQuantity: number;
} {
  const { assetId, quantity, year, month } = params;
  const existing = portfolio.items[assetId];

  if (!existing || existing.quantity <= 0) {
    throw new Error(`Asset ${assetId} not found in inventory stockpile.`);
  }

  const consumedQty = Math.min(quantity, existing.quantity);
  const consumedCostBasisUSD = Math.round(consumedQty * existing.unitCostBasisUSD * 100) / 100;

  // What would it have cost to buy on spot market right now?
  const currentMarket = getAssetCurrentMarketPrice(existing.assetCategory, assetId, year, month);
  const replacementMarketCostUSD = Math.round(consumedQty * currentMarket.unitPriceUSD * 100) / 100;
  const costSavingsUSD = Math.round((replacementMarketCostUSD - consumedCostBasisUSD) * 100) / 100;

  const remainingQty = existing.quantity - consumedQty;
  const updatedItems = { ...portfolio.items };

  if (remainingQty <= 0) {
    delete updatedItems[assetId];
  } else {
    const newTotalCostBasis = Math.round((existing.totalCostBasisUSD - consumedCostBasisUSD) * 100) / 100;
    const newWeightTonnes = (existing.weightTonnes / existing.quantity) * remainingQty;
    const dryStorageRateUSDPerTonne = getLogisticsTariff("WAREHOUSE_DRY_STORAGE", year, month).tariffUSD.value;
    const monthlyStorage = Math.round(newWeightTonnes * dryStorageRateUSDPerTonne * 100) / 100;

    const marketVal = Math.round(currentMarket.unitPriceUSD * remainingQty * 100) / 100;
    const gainUSD = Math.round((marketVal - newTotalCostBasis) * 100) / 100;
    const gainPct = Number((((marketVal - newTotalCostBasis) / newTotalCostBasis) * 100).toFixed(2));

    updatedItems[assetId] = {
      ...existing,
      quantity: remainingQty,
      weightTonnes: newWeightTonnes,
      totalCostBasisUSD: newTotalCostBasis,
      currentMarketUnitPriceUSD: currentMarket.unitPriceUSD,
      currentMarketValueUSD: marketVal,
      unrealizedGainUSD: gainUSD,
      unrealizedGainPct: gainPct,
      monthlyStorageCostUSD: monthlyStorage,
    };
  }

  const evaluatedPortfolio = evaluateStockpilePortfolio(
    { ...portfolio, items: updatedItems },
    year,
    month
  );

  return {
    portfolio: evaluatedPortfolio,
    consumedCostBasisUSD,
    replacementMarketCostUSD,
    costSavingsUSD,
    remainingQuantity: remainingQty,
  };
}

/**
 * Re-evaluates entire stockpile portfolio against current market prices and holding costs
 */
export function evaluateStockpilePortfolio(
  portfolio: StockpilePortfolio,
  year: number,
  month: number
): StockpilePortfolio {
  let totalCostBasis = 0;
  let totalMarketValue = 0;
  let totalHoldingCost = 0;

  const dryStorageRateUSDPerTonne = getLogisticsTariff("WAREHOUSE_DRY_STORAGE", year, month).tariffUSD.value;
  const evaluatedItems: Record<string, StockpileEntry> = {};

  for (const [id, entry] of Object.entries(portfolio.items)) {
    const market = getAssetCurrentMarketPrice(entry.assetCategory, id, year, month);
    const marketVal = Math.round(market.unitPriceUSD * entry.quantity * 100) / 100;
    const gainUSD = Math.round((marketVal - entry.totalCostBasisUSD) * 100) / 100;
    const gainPct = entry.totalCostBasisUSD > 0
      ? Number((((marketVal - entry.totalCostBasisUSD) / entry.totalCostBasisUSD) * 100).toFixed(2))
      : 0;

    const holdingCost = Math.round(entry.weightTonnes * dryStorageRateUSDPerTonne * 100) / 100;

    evaluatedItems[id] = {
      ...entry,
      currentMarketUnitPriceUSD: market.unitPriceUSD,
      currentMarketValueUSD: marketVal,
      unrealizedGainUSD: gainUSD,
      unrealizedGainPct: gainPct,
      monthlyStorageCostUSD: holdingCost,
    };

    totalCostBasis += entry.totalCostBasisUSD;
    totalMarketValue += marketVal;
    totalHoldingCost += holdingCost;
  }

  totalCostBasis = Math.round(totalCostBasis * 100) / 100;
  totalMarketValue = Math.round(totalMarketValue * 100) / 100;
  totalHoldingCost = Math.round(totalHoldingCost * 100) / 100;

  const totalGainUSD = Math.round((totalMarketValue - totalCostBasis) * 100) / 100;
  const portfolioReturnPct = totalCostBasis > 0
    ? Number((((totalMarketValue - totalCostBasis) / totalCostBasis) * 100).toFixed(2))
    : 0;

  return {
    items: evaluatedItems,
    totalCostBasisUSD: totalCostBasis,
    totalMarketValueUSD: totalMarketValue,
    totalUnrealizedGainUSD: totalGainUSD,
    portfolioReturnPct,
    totalMonthlyHoldingCostUSD: totalHoldingCost,
  };
}
