/**
 * FACTORY GREENFIELD CONSTRUCTION & SHOP COMMISSIONING LIFECYCLE (UNIT_10)
 * 
 * Simulates:
 * 1. Industrial Land Acquisition across Outsource Boundary ($18.5M)
 * 2. 24-Month Groundbreaking & Construction Schedule ($42M total CapEx)
 * 3. 5-Shop Sequential Commissioning (Body, Paint, Assembly, Quality, Utilities)
 * 4. Production Transition: 100% Outsourced -> 100% In-House Owned
 */

import { FactoryProgressionState } from "./campusTypes";

export type CommissionableShopKey = "bodyShop" | "paintShop" | "assemblyLines" | "qualityInspection" | "utilitiesEnergy";

export interface ShopCommissioningSpec {
  key: CommissionableShopKey;
  name: string;
  installationCostEur: number;
  monthsToInstall: number;
  capacityUnlockedAnnual: number;
  qualityDefectReductionPct: number;
  operatingCostSavingPct: number;
  description: string;
}

export const SHOP_COMMISSIONING_SPECS: Record<CommissionableShopKey, ShopCommissioningSpec> = {
  bodyShop: {
    key: "bodyShop",
    name: "Body-in-White Stamping & Framing",
    installationCostEur: 9500000,
    monthsToInstall: 6,
    capacityUnlockedAnnual: 25000,
    qualityDefectReductionPct: 15,
    operatingCostSavingPct: 20,
    description: "3200-Ton hydraulic transfer press line and laser-guided framing jigs.",
  },
  paintShop: {
    key: "paintShop",
    name: "Cathodic Electro-Deposition & Topcoat",
    installationCostEur: 11000000,
    monthsToInstall: 8,
    capacityUnlockedAnnual: 25000,
    qualityDefectReductionPct: 25,
    operatingCostSavingPct: 25,
    description: "Multi-stage dip-tank phosphating and cleanroom robotic bell applicators.",
  },
  assemblyLines: {
    key: "assemblyLines",
    name: "Trim, Chassis Marrying & Final Assembly",
    installationCostEur: 12500000,
    monthsToInstall: 6,
    capacityUnlockedAnnual: 25000,
    qualityDefectReductionPct: 20,
    operatingCostSavingPct: 30,
    description: "Continuous ergonomic skillet conveyor and automated torque fastening stations.",
  },
  qualityInspection: {
    key: "qualityInspection",
    name: "End-of-Line Audit & Monsoon Chamber",
    installationCostEur: 4200000,
    monthsToInstall: 3,
    capacityUnlockedAnnual: 0,
    qualityDefectReductionPct: 35,
    operatingCostSavingPct: 10,
    description: "Monsoon water deluge booth, optical 3D gap scanner, and 4-wheel laser alignment.",
  },
  utilitiesEnergy: {
    key: "utilitiesEnergy",
    name: "Central Utilities & Cogeneration Power",
    installationCostEur: 4800000,
    monthsToInstall: 4,
    capacityUnlockedAnnual: 0,
    qualityDefectReductionPct: 0,
    operatingCostSavingPct: 25,
    description: "Oil-free screw compressor bank, industrial chillers, and 1.8MW rooftop solar microgrid.",
  },
};

export interface ConstructionMonthlyTickResult {
  nextState: FactoryProgressionState;
  monthlyCapExDrawdownEur: number;
  constructionCompletedThisMonth: boolean;
  statusMessage: string;
}

export class FactoryConstructionLifecycle {
  /**
   * Step 1: Purchase the demarcated land parcel ($18.5M)
   */
  public static purchaseLand(state: FactoryProgressionState): {
    nextState: FactoryProgressionState;
    cashRequiredEur: number;
    success: boolean;
    message: string;
  } {
    if (state.landPurchased) {
      return {
        nextState: state,
        cashRequiredEur: 0,
        success: false,
        message: "Industrial land plot is already acquired.",
      };
    }

    const nextState: FactoryProgressionState = {
      ...state,
      landPurchased: true,
      ownershipStatus: "land_acquired",
      constructionMonthsRemaining: 24,
      constructionProgressPct: 0,
    };

    return {
      nextState,
      cashRequiredEur: state.landPurchasePrice,
      success: true,
      message: `Successfully purchased ${state.landLocationName} (450,000 m²) for €${Math.round(state.landPurchasePrice / 1000000)}M. Site ready for groundbreaking.`,
    };
  }

  /**
   * Step 2: Break ground on factory shell construction ($42M CapEx over 24 months)
   */
  public static startGroundbreaking(state: FactoryProgressionState): {
    nextState: FactoryProgressionState;
    success: boolean;
    message: string;
  } {
    if (!state.landPurchased) {
      return {
        nextState: state,
        success: false,
        message: "Cannot break ground: Land parcel must be purchased first.",
      };
    }

    const nextState: FactoryProgressionState = {
      ...state,
      ownershipStatus: "under_construction",
      constructionMonthsRemaining: 24,
      constructionProgressPct: 0,
      constructionBudgetSpent: 0,
    };

    return {
      nextState,
      success: true,
      message: "Groundbreaking ceremony complete! Foundation piling and steel structural erection underway (24-month timeline).",
    };
  }

  /**
   * Monthly Construction Tick (Executes CapEx drawdown and progress advance)
   */
  public static processMonthlyConstructionTick(
    state: FactoryProgressionState
  ): ConstructionMonthlyTickResult {
    if (state.ownershipStatus !== "under_construction") {
      return {
        nextState: state,
        monthlyCapExDrawdownEur: 0,
        constructionCompletedThisMonth: false,
        statusMessage: "Factory is not currently under shell construction.",
      };
    }

    const monthlyCapEx = Math.round(state.constructionTotalBudget / 24); // ~€1.75M/month
    const nextMonthsRemaining = Math.max(0, state.constructionMonthsRemaining - 1);
    const monthsElapsed = 24 - nextMonthsRemaining;
    const nextProgressPct = Math.min(100, Math.round((monthsElapsed / 24) * 100));
    const nextBudgetSpent = Math.min(state.constructionTotalBudget, state.constructionBudgetSpent + monthlyCapEx);

    const isComplete = nextMonthsRemaining === 0;
    const nextOwnership = isComplete ? "operational_owned" : "under_construction";

    const nextState: FactoryProgressionState = {
      ...state,
      constructionMonthsRemaining: nextMonthsRemaining,
      constructionProgressPct: nextProgressPct,
      constructionBudgetSpent: nextBudgetSpent,
      ownershipStatus: nextOwnership,
      factoryLevel: isComplete ? 1 : 0,
      annualCapacity: isComplete ? 25000 : 0,
    };

    // Auto-commission standard shops upon shell completion
    if (isComplete) {
      nextState.shops = {
        ...nextState.shops,
        bodyShop: { ...nextState.shops.bodyShop, level: 1, status: "active", efficiencyPct: 75 },
        paintShop: { ...nextState.shops.paintShop, level: 1, status: "active", efficiencyPct: 75 },
        assemblyLines: { ...nextState.shops.assemblyLines, level: 1, status: "active", efficiencyPct: 75 },
        qualityInspection: { ...nextState.shops.qualityInspection, level: 1, status: "active", efficiencyPct: 80 },
        utilitiesEnergy: { ...nextState.shops.utilitiesEnergy, level: 1, status: "active", efficiencyPct: 80 },
      };
    }

    return {
      nextState,
      monthlyCapExDrawdownEur: monthlyCapEx,
      constructionCompletedThisMonth: isComplete,
      statusMessage: isComplete
        ? "FACTORY COMMISSIONING COMPLETE! Apex Plant 1 is fully operational. 100% in-house manufacturing unlocked!"
        : `Construction progress: ${nextProgressPct}% (${nextMonthsRemaining} months remaining). Monthly CapEx: €${Math.round(monthlyCapEx / 1000)}k.`,
    };
  }
}
