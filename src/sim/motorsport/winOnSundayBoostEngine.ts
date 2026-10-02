/**
 * MOTORSPORT HOMOLOGATION & "WIN-ON-SUNDAY, SELL-ON-MONDAY" ENGINE (UNIT_08)
 * 
 * Simulates:
 * 1. Historical Motorsport Homologation Production Rules (Group 4, Group B, GT3, LMH)
 * 2. Race Result Calculation (P1 Win, Podium P2-P3, Top 5, DNF)
 * 3. "Win-on-Sunday" Commercial Foot-Traffic & Showroom Conversion Multiplier
 * 4. Technology Transfer (Brakes, Aero, Cooling) from Motorsport to Road Lineup
 */

export type RacingCategory = "group_4_gt" | "group_b_rally" | "fia_gt3" | "le_mans_hypercar";

export interface HomologationCategoryRule {
  category: RacingCategory;
  name: string;
  eraStartYear: number;
  eraEndYear: number;
  minProductionUnitsRequired: number;
  maxDisplacementCc: number;
  minWeightKg: number;
  requiresRoadLegalTwin: boolean;
  description: string;
}

export const MOTORSPORT_HOMOLOGATION_RULES: Record<RacingCategory, HomologationCategoryRule> = {
  group_4_gt: {
    category: "group_4_gt",
    name: "FIA Group 4 Special Grand Touring",
    eraStartYear: 1970,
    eraEndYear: 1981,
    minProductionUnitsRequired: 500,
    maxDisplacementCc: 5000,
    minWeightKg: 950,
    requiresRoadLegalTwin: true,
    description: "Requires at least 500 identical road-legal coupes manufactured in a consecutive 12-month period.",
  },
  group_b_rally: {
    category: "group_b_rally",
    name: "FIA Group B Grand Touring / Rally",
    eraStartYear: 1982,
    eraEndYear: 1986,
    minProductionUnitsRequired: 200,
    maxDisplacementCc: 4000, // Equivalence factor applied for turbo
    minWeightKg: 890,
    requiresRoadLegalTwin: true,
    description: "Legendary silhouette homologation requiring 200 road cars plus 20 evo competition specials.",
  },
  fia_gt3: {
    category: "fia_gt3",
    name: "FIA GT3 Customer Racing",
    eraStartYear: 2006,
    eraEndYear: 2030,
    minProductionUnitsRequired: 2500,
    maxDisplacementCc: 6500,
    minWeightKg: 1220,
    requiresRoadLegalTwin: true,
    description: "Based on series-production sports cars with BoP power-to-weight alignment.",
  },
  le_mans_hypercar: {
    category: "le_mans_hypercar",
    name: "FIA WEC Le Mans Hypercar (LMH)",
    eraStartYear: 2021,
    eraEndYear: 2030,
    minProductionUnitsRequired: 25,
    maxDisplacementCc: 7000,
    minWeightKg: 1030,
    requiresRoadLegalTwin: true,
    description: "Bespoke prototype or road-car derived hypercar with 500 kW internal combustion and 200 kW hybrid front axle.",
  },
};

export interface RaceWeekendEntry {
  category: RacingCategory;
  raceName: string;
  chassisName: string;
  driverSkillScore: number;  // 0-100
  carPowerHp: number;
  carWeightKg: number;
  downforceKg: number;
  reliabilityScore: number;  // 0-100
}

export interface RaceWeekendResult {
  raceName: string;
  category: RacingCategory;
  finishPosition: number; // 1 = Win, 2-3 = Podium, etc., 99 = DNF
  isWin: boolean;
  isPodium: boolean;
  isTop5: boolean;
  isDNF: boolean;
  prizeMoneyEur: number;
  trophyName?: string;
  dnfReason?: string;
  showroomFootTrafficMultiplier: number;
  salesConversionBoostPct: number;
  summary: string;
}

export class WinOnSundayBoostEngine {
  /**
   * Verifies if a road car meets the production volume threshold for racing homologation
   */
  public static verifyHomologationEligibility(
    category: RacingCategory,
    unitsBuiltTotal: number,
    weightKg: number,
    displacementCc: number
  ): { eligible: boolean; reasons: string[] } {
    const rule = MOTORSPORT_HOMOLOGATION_RULES[category];
    const reasons: string[] = [];

    if (unitsBuiltTotal < rule.minProductionUnitsRequired) {
      reasons.push(`Production deficit: Built ${unitsBuiltTotal} of ${rule.minProductionUnitsRequired} required road units.`);
    }

    if (weightKg < rule.minWeightKg) {
      reasons.push(`Under minimum weight: ${weightKg} kg (minimum allowed is ${rule.minWeightKg} kg).`);
    }

    if (displacementCc > rule.maxDisplacementCc) {
      reasons.push(`Displacement exceeds cap: ${displacementCc} cc (maximum allowed is ${rule.maxDisplacementCc} cc).`);
    }

    return {
      eligible: reasons.length === 0,
      reasons,
    };
  }

  /**
   * Simulates race weekend outcome and computes commercial showroom boost
   */
  public static simulateRaceWeekend(
    entry: RaceWeekendEntry,
    randomSeed: number = Math.random()
  ): RaceWeekendResult {
    // 1. Reliability DNF check
    const dnfThreshold = Math.max(0.04, (100 - entry.reliabilityScore) / 100 * 0.35);
    if (randomSeed < dnfThreshold) {
      return {
        raceName: entry.raceName,
        category: entry.category,
        finishPosition: 99,
        isWin: false,
        isPodium: false,
        isTop5: false,
        isDNF: true,
        prizeMoneyEur: 0,
        dnfReason: "Mechanical retirement: Powertrain thermal failure under sustained full-throttle stress.",
        showroomFootTrafficMultiplier: 0.96, // Slight consumer disappointment
        salesConversionBoostPct: -4,
        summary: `DNF at ${entry.raceName}. Mechanical failure retired the car from the race.`,
      };
    }

    // 2. Pace Performance Index
    const powerToWeight = entry.carPowerHp / (entry.carWeightKg / 1000); // HP per tonne
    const aeroContribution = entry.downforceKg * 0.15;
    const paceIndex = powerToWeight * 0.45 + entry.driverSkillScore * 1.5 + aeroContribution;

    // Determine finish position
    let finishPosition = 12;
    if (paceIndex > 320) {
      finishPosition = 1;
    } else if (paceIndex > 280) {
      finishPosition = 2;
    } else if (paceIndex > 250) {
      finishPosition = 3;
    } else if (paceIndex > 210) {
      finishPosition = 5;
    } else if (paceIndex > 170) {
      finishPosition = 8;
    }

    const isWin = finishPosition === 1;
    const isPodium = finishPosition >= 1 && finishPosition <= 3;
    const isTop5 = finishPosition >= 1 && finishPosition <= 5;

    let prizeMoneyEur = 0;
    let showroomFootTrafficMultiplier = 1.0;
    let salesConversionBoostPct = 0;
    let trophyName: string | undefined = undefined;

    if (isWin) {
      prizeMoneyEur = 350000;
      showroomFootTrafficMultiplier = 1.25; // +25% foot traffic
      salesConversionBoostPct = 18;         // +18% conversion rate
      trophyName = `${entry.raceName} 1st Place Trophy`;
    } else if (isPodium) {
      prizeMoneyEur = 150000;
      showroomFootTrafficMultiplier = 1.14; // +14% foot traffic
      salesConversionBoostPct = 10;
      trophyName = `${entry.raceName} Podium Finisher`;
    } else if (isTop5) {
      prizeMoneyEur = 60000;
      showroomFootTrafficMultiplier = 1.06;
      salesConversionBoostPct = 4;
    }

    return {
      raceName: entry.raceName,
      category: entry.category,
      finishPosition,
      isWin,
      isPodium,
      isTop5,
      isDNF: false,
      prizeMoneyEur,
      trophyName,
      showroomFootTrafficMultiplier,
      salesConversionBoostPct,
      summary: isWin
        ? `VICTORY! 1st Place in ${entry.raceName}. 'Win on Sunday, Sell on Monday' boost applies +25% foot traffic to dealerships!`
        : isPodium
        ? `Podium finish (P${finishPosition}) in ${entry.raceName}. Commercial sales boost applied (+10% conversion).`
        : `Finished P${finishPosition} in ${entry.raceName}.`,
    };
  }
}
