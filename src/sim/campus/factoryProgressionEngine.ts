/**
 * FACTORY PROGRESSION & OUTSOURCED MANUFACTURING ENGINE
 * 
 * Implements the early-game reality:
 * 1. Player starts with ZERO OWNED FACTORY in 1970.
 * 2. Production is 100% outsourced to NPC or Rival factories.
 * 3. Outsourced production consumes:
 *    Raw Materials (Steel, Aluminium, Rubber, Glass, Tyres, Electronics)
 *    + Machine Conversion Cost
 *    + Factory Profit Margin (15% to 30%)
 *    + Competitor Surcharge (if rival owned)
 *    + Transport / Logistics fees.
 * 4. Competitor factories may delay orders and limit allocated capacity.
 * 5. Player eventually purchases land and constructs an owned plant.
 * 6. Factory upgrades independently across 5 distinct tiers (5k -> 15k -> 40k -> 100k -> 200k+).
 */

import {
  FactoryProgressionState,
  ContractManufacturerPartner,
  VehicleMaterialBill,
  FactoryLevelTier
} from "./campusTypes";
import { NPC_CONTRACT_MANUFACTURERS } from "./campusRegistry";

export interface DetailedUnitCostBreakdown {
  materialsCost: {
    steelCost: number;
    aluminiumCost: number;
    plasticsRubberCost: number;
    glassCost: number;
    tyresCost: number;
    electronicsCost: number;
    totalMaterialsCost: number;
  };
  conversionCost: number;
  factoryProfitMargin: number;
  competitorSurcharge: number;
  logisticsFee: number;
  totalOutsourcedUnitCost: number;
  inHouseUnitCostEquivalent: number;
  unitSavingsWithOwnedPlant: number;
}

export interface FactoryEconomicsSummary {
  status: string;
  isOutsourced: boolean;
  activePartner: ContractManufacturerPartner | null;
  annualCapacity: number;
  factoryLevel: number;
  factoryTier: FactoryLevelTier;
  costBreakdown: DetailedUnitCostBreakdown;
  breakEvenVehiclesCount: number;
  monthlyOperatingCost: number;
  rivalDelaysActive: boolean;
}

export const DEFAULT_VEHICLE_BOM: VehicleMaterialBill = {
  steelKg: 1200,
  aluminiumKg: 150,
  plasticsRubberKg: 90,
  glassKg: 45,
  tyresCount: 4,
  engineSupplied: true,
  electronicsUnits: 1,
};

export class FactoryProgressionEngine {
  /**
   * Calculates detailed bill of materials and factory conversion costs
   */
  public static calculateUnitCostBreakdown(
    state: FactoryProgressionState,
    bom: VehicleMaterialBill = DEFAULT_VEHICLE_BOM
  ): DetailedUnitCostBreakdown {
    // 1970s Base Commodity Prices
    const STEEL_PRICE_PER_KG = 1.20;
    const ALUM_PRICE_PER_KG = 3.50;
    const PLASTIC_RUBBER_PRICE_PER_KG = 2.80;
    const GLASS_PRICE_PER_KG = 2.10;
    const TYRE_UNIT_PRICE = 65.0;
    const ELECTRONICS_BASE_COST = 380.0;

    const steelCost = bom.steelKg * STEEL_PRICE_PER_KG;
    const aluminiumCost = bom.aluminiumKg * ALUM_PRICE_PER_KG;
    const plasticsRubberCost = bom.plasticsRubberKg * PLASTIC_RUBBER_PRICE_PER_KG;
    const glassCost = bom.glassKg * GLASS_PRICE_PER_KG;
    const tyresCost = bom.tyresCount * TYRE_UNIT_PRICE;
    const electronicsCost = bom.electronicsUnits * ELECTRONICS_BASE_COST;
    const totalMaterialsCost = steelCost + aluminiumCost + plasticsRubberCost + glassCost + tyresCost + electronicsCost;

    const partner = NPC_CONTRACT_MANUFACTURERS.find(p => p.id === state.activeContractPartnerId) || NPC_CONTRACT_MANUFACTURERS[0];
    const isOutsourced = state.ownershipStatus !== "operational_owned";

    let conversionCost = 0;
    let factoryProfitMargin = 0;
    let competitorSurcharge = 0;
    let logisticsFee = 0;

    if (isOutsourced) {
      conversionCost = partner.conversionCostPerUnit;
      factoryProfitMargin = Math.round(conversionCost * (partner.factoryProfitMarginPct / 100));
      
      // Competitor surcharge if rival-owned and relations are low
      if (partner.isCompetitorOwned) {
        competitorSurcharge = Math.round(conversionCost * (partner.competitorSurchargePct / 100));
      }

      logisticsFee = partner.logisticsFeePerUnit;
    } else {
      // In-House Owned Factory: No profit margin, no competitor penalty!
      // Conversion cost drops based on automation level
      const automationDiscount = 1 - (state.automationLevelPct / 200); // up to 45% discount at high automation
      conversionCost = Math.round(1400 * automationDiscount);
      factoryProfitMargin = 0;
      competitorSurcharge = 0;
      logisticsFee = 150; // localized yard staging
    }

    const totalOutsourcedUnitCost = totalMaterialsCost + conversionCost + factoryProfitMargin + competitorSurcharge + logisticsFee;
    
    // In-house equivalent for comparison
    const inHouseConversion = Math.round(1400 * 0.75); // ~1050
    const inHouseUnitCostEquivalent = totalMaterialsCost + inHouseConversion + 150;
    const unitSavingsWithOwnedPlant = isOutsourced ? (totalOutsourcedUnitCost - inHouseUnitCostEquivalent) : 0;

    return {
      materialsCost: {
        steelCost,
        aluminiumCost,
        plasticsRubberCost,
        glassCost,
        tyresCost,
        electronicsCost,
        totalMaterialsCost,
      },
      conversionCost,
      factoryProfitMargin,
      competitorSurcharge,
      logisticsFee,
      totalOutsourcedUnitCost,
      inHouseUnitCostEquivalent,
      unitSavingsWithOwnedPlant,
    };
  }

  /**
   * Acquire industrial land plot for future manufacturing facility
   */
  public static purchaseLandPlot(
    state: FactoryProgressionState,
    currentCash: number
  ): { success: boolean; state: FactoryProgressionState; cost: number; message: string } {
    if (state.ownershipStatus !== "no_factory_outsourced" && state.landPurchased) {
      return { success: false, state, cost: 0, message: "Land plot already purchased." };
    }

    if (currentCash < state.landPurchasePrice) {
      return {
        success: false,
        state,
        cost: 0,
        message: `Insufficient funds. Land acquisition requires $${(state.landPurchasePrice / 1e6).toFixed(1)}M.`,
      };
    }

    const nextState: FactoryProgressionState = {
      ...state,
      landPurchased: true,
      ownershipStatus: "land_acquired",
      constructionMonthsRemaining: 24,
      constructionProgressPct: 0,
      constructionBudgetSpent: 0,
    };

    return {
      success: true,
      state: nextState,
      cost: state.landPurchasePrice,
      message: `Industrial land secured: ${state.landLocationName} (${(state.landAreaSqMeters / 10000).toFixed(0)} hectares). Ready to break ground.`,
    };
  }

  /**
   * Start factory civil construction project
   */
  public static beginConstruction(
    state: FactoryProgressionState
  ): { success: boolean; state: FactoryProgressionState; message: string } {
    if (!state.landPurchased) {
      return { success: false, state, message: "Must purchase an industrial land plot before beginning construction." };
    }
    if (state.ownershipStatus !== "land_acquired") {
      return { success: false, state, message: `Cannot break ground in current state: ${state.ownershipStatus}` };
    }

    const nextState: FactoryProgressionState = {
      ...state,
      ownershipStatus: "under_construction",
      constructionProgressPct: 5,
    };

    return {
      success: true,
      state: nextState,
      message: "Civil construction mobilized. Foundation grading and structural steel framing underway.",
    };
  }

  /**
   * Advances monthly construction tick
   */
  public static advanceConstructionMonth(
    state: FactoryProgressionState,
    monthlyCapitalInvestment: number = 1750000
  ): { state: FactoryProgressionState; monthCost: number; commissioned: boolean } {
    if (state.ownershipStatus !== "under_construction") {
      return { state, monthCost: 0, commissioned: false };
    }

    const newMonthsRemaining = Math.max(0, state.constructionMonthsRemaining - 1);
    const newProgressPct = Math.min(100, Math.round(100 - (newMonthsRemaining / 24) * 95));
    const newBudgetSpent = state.constructionBudgetSpent + monthlyCapitalInvestment;

    if (newMonthsRemaining <= 0 || newProgressPct >= 100) {
      // Factory is completed and ready for commissioning at Level 1 (Workshop Plant: 5,000 cars/year)
      const commissionedState: FactoryProgressionState = {
        ...state,
        ownershipStatus: "operational_owned",
        factoryLevel: 1,
        factoryTier: "workshop_plant",
        constructionMonthsRemaining: 0,
        constructionProgressPct: 100,
        constructionBudgetSpent: newBudgetSpent,
        annualCapacity: 5000, // Level 1 initial capacity
        currentOutputRate: 415, // units/month
        automationLevelPct: 25,
        toolingFlexibilityScore: 50,
        shops: {
          bodyShop: {
            ...state.shops.bodyShop,
            level: 1,
            status: "active",
            efficiencyPct: 70,
          },
          paintShop: {
            ...state.shops.paintShop,
            level: 1,
            status: "active",
            efficiencyPct: 65,
          },
          assemblyLines: {
            ...state.shops.assemblyLines,
            level: 1,
            status: "active",
            efficiencyPct: 75,
          },
          qualityInspection: {
            ...state.shops.qualityInspection,
            level: 1,
            status: "active",
            efficiencyPct: 80,
          },
          warehousingLogistics: {
            ...state.shops.warehousingLogistics,
            level: 1,
            status: "active",
            efficiencyPct: 75,
          },
          utilitiesEnergy: {
            ...state.shops.utilitiesEnergy,
            level: 1,
            status: "active",
            efficiencyPct: 85,
          },
        },
      };

      return { state: commissionedState, monthCost: monthlyCapitalInvestment, commissioned: true };
    }

    const updatingState: FactoryProgressionState = {
      ...state,
      constructionMonthsRemaining: newMonthsRemaining,
      constructionProgressPct: newProgressPct,
      constructionBudgetSpent: newBudgetSpent,
    };

    return { state: updatingState, monthCost: monthlyCapitalInvestment, commissioned: false };
  }

  /**
   * Upgrade overall factory level (Level 1 Workshop -> Level 2 Small -> Level 3 Modern -> Level 4 Large -> Level 5 Gigafactory)
   */
  public static upgradeFactoryTier(
    state: FactoryProgressionState,
    currentCash: number
  ): { success: boolean; state: FactoryProgressionState; cost: number; message: string } {
    if (state.ownershipStatus !== "operational_owned") {
      return { success: false, state, cost: 0, message: "Must commission an owned factory before upgrading tiers." };
    }

    if (state.factoryLevel >= 5) {
      return { success: false, state, cost: 0, message: "Factory is already at maximum Tier 5 (Advanced Manufacturing Campus)." };
    }

    const nextLevel = state.factoryLevel + 1;
    const upgradeCosts = [0, 0, 7500000, 18000000, 42000000, 95000000];
    const cost = upgradeCosts[nextLevel];

    if (currentCash < cost) {
      return {
        success: false,
        state,
        cost: 0,
        message: `Insufficient capital. Tier ${nextLevel} expansion requires $${(cost / 1e6).toFixed(1)}M.`,
      };
    }

    const capacities = [0, 5000, 15000, 40000, 100000, 220000];
    const tiers: FactoryLevelTier[] = [
      "workshop_plant",
      "workshop_plant",
      "small_assembly_plant",
      "modern_assembly_plant",
      "large_automotive_plant",
      "advanced_manufacturing_campus",
    ];

    const nextState: FactoryProgressionState = {
      ...state,
      factoryLevel: nextLevel,
      factoryTier: tiers[nextLevel],
      annualCapacity: capacities[nextLevel],
      currentOutputRate: Math.round(capacities[nextLevel] / 12),
      automationLevelPct: Math.min(95, state.automationLevelPct + 15),
    };

    return {
      success: true,
      state: nextState,
      cost,
      message: `🎉 Factory upgraded to ${tiers[nextLevel].replace(/_/g, " ").toUpperCase()}! Annual capacity expanded to ${capacities[nextLevel].toLocaleString()} units/year.`,
    };
  }

  /**
   * Switch outsourced contract manufacturing partner
   */
  public static selectContractPartner(
    state: FactoryProgressionState,
    partnerId: string
  ): { success: boolean; state: FactoryProgressionState; message: string } {
    const partner = NPC_CONTRACT_MANUFACTURERS.find(p => p.id === partnerId);
    if (!partner) {
      return { success: false, state, message: `Contract partner '${partnerId}' not recognized.` };
    }

    const nextState: FactoryProgressionState = {
      ...state,
      activeContractPartnerId: partnerId,
    };

    const competitorWarning = partner.isCompetitorOwned 
      ? ` ⚠️ CAUTION: ${partner.name} is owned by rival '${partner.competitorBrandName}'. Competitor surcharge (+${partner.competitorSurchargePct}%) and potential delivery delays apply.`
      : "";

    return {
      success: true,
      state: nextState,
      message: `Production contract signed with ${partner.name} (${partner.country}). Base conversion cost: $${partner.conversionCostPerUnit.toLocaleString()} / unit.${competitorWarning}`,
    };
  }

  /**
   * Upgrade specific shop inside owned factory
   */
  public static upgradeFactoryShop(
    state: FactoryProgressionState,
    shopKey: keyof FactoryProgressionState["shops"],
    currentCash: number
  ): { success: boolean; state: FactoryProgressionState; cost: number; message: string } {
    if (state.ownershipStatus !== "operational_owned") {
      return { success: false, state, cost: 0, message: "Cannot upgrade shops: factory is not yet operational." };
    }

    const shop = state.shops[shopKey];
    if (!shop || shop.level >= shop.maxLevel) {
      return { success: false, state, cost: 0, message: "Shop is already at maximum automation level." };
    }

    const upgradeCost = (shop.level + 1) * 2800000;
    if (currentCash < upgradeCost) {
      return {
        success: false,
        state,
        cost: 0,
        message: `Insufficient capital. Shop upgrade requires $${(upgradeCost / 1e6).toFixed(1)}M.`,
      };
    }

    const upgradedShop = {
      ...shop,
      level: shop.level + 1,
      efficiencyPct: Math.min(98, shop.efficiencyPct + 10),
    };

    const nextState: FactoryProgressionState = {
      ...state,
      annualCapacity: Math.round(state.annualCapacity * 1.2),
      automationLevelPct: Math.min(95, state.automationLevelPct + 6),
      shops: {
        ...state.shops,
        [shopKey]: upgradedShop,
      },
    };

    return {
      success: true,
      state: nextState,
      cost: upgradeCost,
      message: `${shop.name} upgraded to Level ${upgradedShop.level}! Efficiency increased to ${upgradedShop.efficiencyPct}%.`,
    };
  }

  /**
   * Calculate factory economic summary
   */
  public static getEconomicsSummary(state: FactoryProgressionState): FactoryEconomicsSummary {
    const isOutsourced = state.ownershipStatus !== "operational_owned";
    const partner = NPC_CONTRACT_MANUFACTURERS.find(p => p.id === state.activeContractPartnerId) || NPC_CONTRACT_MANUFACTURERS[0];
    const costBreakdown = this.calculateUnitCostBreakdown(state);

    const annualCapacity = isOutsourced ? partner.productionCapacityAnnual : state.annualCapacity;
    const totalPlantInvestment = state.landPurchasePrice + state.constructionTotalBudget;
    const breakEvenVehiclesCount = costBreakdown.unitSavingsWithOwnedPlant > 0 
      ? Math.ceil(totalPlantInvestment / costBreakdown.unitSavingsWithOwnedPlant)
      : 0;

    let monthlyOperatingCost = 0;
    if (isOutsourced) {
      monthlyOperatingCost = 4500; // Contract administration fee
    } else {
      // Sum up shop maintenance
      monthlyOperatingCost = Object.values(state.shops).reduce((acc, s) => {
        return acc + (s.status === "active" ? s.level * 18000 : 0);
      }, 35000);
    }

    return {
      status: state.ownershipStatus,
      isOutsourced,
      activePartner: isOutsourced ? partner : null,
      annualCapacity,
      factoryLevel: state.factoryLevel,
      factoryTier: state.factoryTier,
      costBreakdown,
      breakEvenVehiclesCount,
      monthlyOperatingCost,
      rivalDelaysActive: isOutsourced && partner.isCompetitorOwned && partner.relationsScore < 50,
    };
  }
}
