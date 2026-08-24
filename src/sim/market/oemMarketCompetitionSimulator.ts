// ===================================================================
// AI RIVAL OEM MARKET COMPETITION SIMULATOR
// ===================================================================
// Simulates global automotive OEM competition across 9 Price Tiers and
// 25 Utility Classes using Multinomial Logit Market Share choice models.
// ===================================================================

import { PriceTierId, MASTER_PRICE_TIERS } from "../taxonomies/priceTierTaxonomy";
import { UtilityClassId, MASTER_UTILITY_CLASSES } from "../taxonomies/utilityClassTaxonomy";

export interface RivalOemProfile {
  oemId: string;
  name: string;
  country: string;
  brandPrestigeScore: number; // 0 - 100
  activePriceTiers: PriceTierId[];
  activeUtilityClasses: UtilityClassId[];
  annualRnDBudgetUSD: number;
  globalMarketSharePct: number;
}

export interface MarketShareEntry {
  oemId: string;
  oemName: string;
  priceTier: PriceTierId;
  utilityClass: UtilityClassId;
  monthlyUnitSales: number;
  grossRevenueUSD: number;
  marketSharePct: number; // % share of this specific segment
  customerSatisfactionScore: number; // 0 - 100
}

export const MASTER_RIVAL_OEMS: RivalOemProfile[] = [
  {
    oemId: "titan_motors_usa",
    name: "Titan Motor Corporation",
    country: "USA",
    brandPrestigeScore: 88,
    activePriceTiers: ["LOWER_MIDRANGE", "UPPER_MIDRANGE", "PREMIUM_EXECUTIVE"],
    activeUtilityClasses: ["PICKUP_TRUCK", "SUV", "CROSSOVER_CUV", "SEDAN"],
    annualRnDBudgetUSD: 4500000000,
    globalMarketSharePct: 18.5,
  },
  {
    oemId: "veloce_hypercars_italy",
    name: "Veloce Automobili S.p.A.",
    country: "Italy",
    brandPrestigeScore: 99,
    activePriceTiers: ["EXOTIC_SPORTS", "SUPERCAR_TRACK", "HYPERCAR_MEGAWATT"],
    activeUtilityClasses: ["COUPE", "SPORTS_CAR", "GT3_RACE_CAR", "ELECTRIC_VEHICLE_BEV"],
    annualRnDBudgetUSD: 1800000000,
    globalMarketSharePct: 2.1,
  },
  {
    oemId: "nova_ev_dynamics",
    name: "Nova EV Mobility Group",
    country: "China",
    brandPrestigeScore: 85,
    activePriceTiers: ["BUDGET_ECONOMY", "LOWER_MIDRANGE", "UPPER_MIDRANGE", "PREMIUM_EXECUTIVE"],
    activeUtilityClasses: ["CITY_CAR", "HATCHBACK", "SEDAN", "ELECTRIC_VEHICLE_BEV", "COMMERCIAL_VAN"],
    annualRnDBudgetUSD: 6200000000,
    globalMarketSharePct: 24.0,
  },
  {
    oemId: "aegis_commercial_de",
    name: "Aegis Commercial Heavy AG",
    country: "Germany",
    brandPrestigeScore: 92,
    activePriceTiers: ["PREMIUM_EXECUTIVE", "LUXURY_GRAND", "ULTRA_LUXURY_COACHBUILT"],
    activeUtilityClasses: ["SEDAN", "WAGON", "LIMOUSINE", "COMMERCIAL_VAN", "AMBULANCE_EMERGENCY"],
    annualRnDBudgetUSD: 3800000000,
    globalMarketSharePct: 15.2,
  },
];

export class OemMarketCompetitionSimulator {
  /**
   * Simulates monthly segment unit sales and market share splits using Multinomial Logit choice.
   */
  public static simulateSegmentMarket(params: {
    priceTier: PriceTierId;
    utilityClass: UtilityClassId;
    userDesignPriceUSD: number;
    userDesignHp: number;
    userDesignPrestige: number;
    totalSegmentMonthlyDemandUnits: number;
  }): MarketShareEntry[] {
    const {
      priceTier,
      utilityClass,
      userDesignPriceUSD,
      userDesignHp,
      userDesignPrestige,
      totalSegmentMonthlyDemandUnits,
    } = params;

    const competitorList = MASTER_RIVAL_OEMS.filter(
      (oem) => oem.activePriceTiers.includes(priceTier) || oem.activeUtilityClasses.includes(utilityClass)
    );

    // Compute Multinomial Logit Utility scores: U_i = w_p * Prestige + w_power * HP - w_cost * Price
    const utilities: { oemId: string; name: string; utilityValue: number }[] = [];

    // User's OEM entry
    const userUtility = Math.exp(userDesignPrestige * 0.05 + (userDesignHp / 100) * 0.4 - (userDesignPriceUSD / 50000) * 0.3);
    utilities.push({ oemId: "user_oem", name: "Player OEM Entry", utilityValue: userUtility });

    // Rival OEM entries
    competitorList.forEach((oem) => {
      const tierSpec = MASTER_PRICE_TIERS[priceTier];
      const approxPrice = (tierSpec.minMsrpUSD + tierSpec.maxMsrpUSD) / 2;
      const approxHp = tierSpec.maxPowerHp * 0.85;
      const oemUtility = Math.exp(oem.brandPrestigeScore * 0.05 + (approxHp / 100) * 0.4 - (approxPrice / 50000) * 0.3);

      utilities.push({ oemId: oem.oemId, name: oem.name, utilityValue: oemUtility });
    });

    const sumUtility = utilities.reduce((acc, u) => acc + u.utilityValue, 0);

    const tierSpec = MASTER_PRICE_TIERS[priceTier];
    const segmentPrice = Math.round((tierSpec.minMsrpUSD + tierSpec.maxMsrpUSD) / 2);

    return utilities.map((entry) => {
      const shareFrac = entry.utilityValue / sumUtility;
      const monthlyUnitSales = Math.round(totalSegmentMonthlyDemandUnits * shareFrac);
      const grossRevenueUSD = monthlyUnitSales * (entry.oemId === "user_oem" ? userDesignPriceUSD : segmentPrice);
      const marketSharePct = Number((shareFrac * 100).toFixed(1));

      return {
        oemId: entry.oemId,
        oemName: entry.name,
        priceTier,
        utilityClass,
        monthlyUnitSales,
        grossRevenueUSD,
        marketSharePct,
        customerSatisfactionScore: Number(Math.min(99, Math.max(60, 80 + (shareFrac - 0.2) * 40)).toFixed(1)),
      };
    });
  }
}
