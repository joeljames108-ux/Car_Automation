/**
 * ═══════════════════════════════════════════════════════════════════════
 * INVESTMENT EXPENSE ENGINE — CAPEX PROJECTS & FACILITY CONSTRUCTION
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Implements Section 9 (Investment Expenses):
 *
 * Capital expenditures (CapEx) build future industrial and R&D capacity:
 * - Mega-factories & automated robotic press lines
 * - Railway spurs & intermodal logistics sidings
 * - Full-scale rolling-road aerodynamic wind tunnels
 * - Proving ground high-speed banked ovals & handling tracks
 * - Heavy model tooling dies (stamping tools for new vehicle chassis)
 *
 * Directly connects to Industrial Reputation:
 * High industrial reputation lowers contractor construction bids by up to 20%
 * and speeds up completion timelines!
 */

import { CompanyAsset, CompanyAssetType, DEFAULT_DEPRECIATION_RATES } from "./balanceSheet";

export interface InvestmentProject {
  id: string;
  name: string;
  assetType: CompanyAssetType;
  baseQuoteCost: number;
  reputationDiscountPct: number;    // From industrial reputation
  finalTotalCost: number;           // baseQuoteCost * (1 - discount)
  spentToDate: number;
  monthlyBurnRate: number;
  constructionMonthsTotal: number;
  constructionMonthsElapsed: number;
  capacityUnits?: number;           // Vehicles / year once complete
  monthlyMaintenanceOnceBuilt: number;
  status: "PLANNING" | "UNDER_CONSTRUCTION" | "COMPLETED";
}

export interface InvestmentMonthlyReport {
  monthlyCapExBurn: number;
  activeProjectsCount: number;
  completedAssetsThisMonth: CompanyAsset[];
  updatedProjects: InvestmentProject[];
}

/**
 * Start a new CapEx construction or tooling project
 */
export function createInvestmentProject(
  name: string,
  assetType: CompanyAssetType,
  baseQuoteCost: number,
  constructionMonths: number,
  industrialReputationScore: number,
  options?: {
    capacityUnits?: number;
    monthlyMaintenanceOnceBuilt?: number;
  }
): InvestmentProject {
  // Industrial reputation discount: up to 20% savings when score is high
  const discountPct =
    industrialReputationScore >= 25
      ? Math.min(0.20, ((industrialReputationScore - 25) / 75) * 0.20)
      : 0;

  const finalCost = Math.round(baseQuoteCost * (1 - discountPct));
  const monthlyBurn = Math.round(finalCost / Math.max(1, constructionMonths));
  const maintenance = options?.monthlyMaintenanceOnceBuilt ?? Math.round(finalCost * 0.0006); // ~0.72% annual

  return {
    id: `capex_${assetType.toLowerCase()}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name,
    assetType,
    baseQuoteCost,
    reputationDiscountPct: Number((discountPct * 100).toFixed(1)),
    finalTotalCost: finalCost,
    spentToDate: 0,
    monthlyBurnRate: monthlyBurn,
    constructionMonthsTotal: constructionMonths,
    constructionMonthsElapsed: 0,
    capacityUnits: options?.capacityUnits,
    monthlyMaintenanceOnceBuilt: maintenance,
    status: "UNDER_CONSTRUCTION",
  };
}

/**
 * Process active capital construction projects by 1 month
 */
export function processMonthlyInvestmentProjects(
  projects: InvestmentProject[],
  currentYear: number,
  currentMonth: number
): InvestmentMonthlyReport {
  let monthlyCapExBurn = 0;
  const completedAssets: CompanyAsset[] = [];
  const updatedProjects: InvestmentProject[] = [];

  for (const proj of projects) {
    if (proj.status !== "UNDER_CONSTRUCTION") {
      updatedProjects.push(proj);
      continue;
    }

    const burn = Math.min(proj.monthlyBurnRate, proj.finalTotalCost - proj.spentToDate);
    monthlyCapExBurn += burn;
    const newSpent = proj.spentToDate + burn;
    const newElapsed = proj.constructionMonthsElapsed + 1;
    const isFinished = newElapsed >= proj.constructionMonthsTotal || newSpent >= proj.finalTotalCost;

    if (isFinished) {
      updatedProjects.push({
        ...proj,
        spentToDate: proj.finalTotalCost,
        constructionMonthsElapsed: proj.constructionMonthsTotal,
        status: "COMPLETED",
      });

      // Spawn real capital asset on company balance sheet
      const newAsset: CompanyAsset = {
        id: `asset_${proj.id}`,
        name: proj.name,
        type: proj.assetType,
        originalCost: proj.finalTotalCost,
        currentValue: proj.finalTotalCost,
        monthlyMaintenanceCost: proj.monthlyMaintenanceOnceBuilt,
        annualDepreciationRate: DEFAULT_DEPRECIATION_RATES[proj.assetType] || 0.05,
        capacityUnits: proj.capacityUnits,
        utilizationPct: proj.capacityUnits ? 20 : undefined,
        acquisitionYear: currentYear,
        acquisitionMonth: currentMonth,
        constructionCompleteMonth: currentMonth,
        conditionPct: 100, // Brand new factory / lab
      };
      completedAssets.push(newAsset);
    } else {
      updatedProjects.push({
        ...proj,
        spentToDate: newSpent,
        constructionMonthsElapsed: newElapsed,
      });
    }
  }

  return {
    monthlyCapExBurn,
    activeProjectsCount: updatedProjects.filter((p) => p.status === "UNDER_CONSTRUCTION").length,
    completedAssetsThisMonth: completedAssets,
    updatedProjects,
  };
}
