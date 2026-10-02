/**
 * NAMED CHIEF ENGINEERS & WORKFORCE BURNOUT ENGINE (UNIT_01)
 * 
 * Simulates:
 * 1. 5 Signature Chief Engineer Disciplines (Powertrain, Aero, Chassis, Styling, Manufacturing)
 * 2. Signature Perks & Bonus Multipliers
 * 3. Crunch Mode Overtime (100% Normal vs 130% Crunch vs 160% Death-March)
 * 4. Fatigue, Error Rate Penalties, Employee Turnover & Rival Poaching
 */

export type ChiefRole = "powertrain" | "aerodynamics" | "chassis" | "styling" | "manufacturing";
export type WorkloadIntensity = "standard_40h" | "crunch_52h" | "extreme_crunch_65h";

export interface ChiefEngineerProfile {
  id: string;
  name: string;
  role: ChiefRole;
  nationality: string;
  reputationStars: number; // 1-5 stars
  monthlySalaryEur: number;
  traitName: string;
  description: string;
  perks: {
    thermalEfficiencyBonusPct?: number;
    aeroEfficiencyBonusPct?: number;
    chassisGripBonusPct?: number;
    stylingAppealBonusPts?: number;
    plantDefectReductionPct?: number;
    developmentSpeedBonusPct?: number;
  };
  moralePct: number; // 0-100
  burnoutRiskPct: number; // 0-100
  isHired: boolean;
}

export const CANONICAL_CHIEF_ENGINEERS: ChiefEngineerProfile[] = [
  {
    id: "eng_hans_weber",
    name: "Dr. Hans Weber",
    role: "powertrain",
    nationality: "Germany",
    reputationStars: 5,
    monthlySalaryEur: 14500,
    traitName: "Combustion Virtuoso",
    description: "Former aircraft engine thermo-dynamicist specializing in forced-induction hot-V architectures and swirl chamber combustion.",
    perks: {
      thermalEfficiencyBonusPct: 15,
      developmentSpeedBonusPct: 10,
    },
    moralePct: 92,
    burnoutRiskPct: 5,
    isHired: false,
  },
  {
    id: "eng_adrian_sterling",
    name: "Adrian Sterling",
    role: "aerodynamics",
    nationality: "United Kingdom",
    reputationStars: 5,
    monthlySalaryEur: 16000,
    traitName: "Ground-Effect Pioneer",
    description: "Grand Prix aero master who sculpts underbody Venturi expansion tunnels and active DRS airfoils by hand.",
    perks: {
      aeroEfficiencyBonusPct: 18,
      developmentSpeedBonusPct: 8,
    },
    moralePct: 88,
    burnoutRiskPct: 8,
    isHired: false,
  },
  {
    id: "eng_paolo_rossi",
    name: "Paolo Rossi",
    role: "chassis",
    nationality: "Italy",
    reputationStars: 4,
    monthlySalaryEur: 13000,
    traitName: "Kinematic Whisperer",
    description: "Bologna-trained vehicle dynamics specialist renowned for compliance steering elimination and anti-squat geometry.",
    perks: {
      chassisGripBonusPct: 12,
      developmentSpeedBonusPct: 6,
    },
    moralePct: 90,
    burnoutRiskPct: 4,
    isHired: false,
  },
  {
    id: "eng_marcello_vane",
    name: "Marcello Vane",
    role: "styling",
    nationality: "France",
    reputationStars: 5,
    monthlySalaryEur: 15500,
    traitName: "Sculptural Provocateur",
    description: "Iconic automotive couturier whose radical greenhouse silhouettes and quad-lens headlamps command magazine covers worldwide.",
    perks: {
      stylingAppealBonusPts: 22,
      developmentSpeedBonusPct: 5,
    },
    moralePct: 85,
    burnoutRiskPct: 12,
    isHired: false,
  },
  {
    id: "eng_tetsuo_sato",
    name: "Tetsuo Sato",
    role: "manufacturing",
    nationality: "Japan",
    reputationStars: 5,
    monthlySalaryEur: 14000,
    traitName: "Kaizen Shogun",
    description: "Toyota Production System veteran who eliminates unibody stamping scrap, tightens shutline tolerances, and optimizes takt time.",
    perks: {
      plantDefectReductionPct: 25,
      developmentSpeedBonusPct: 12,
    },
    moralePct: 95,
    burnoutRiskPct: 3,
    isHired: false,
  },
];

export interface WorkforceMonthlyFatigueReport {
  intensity: WorkloadIntensity;
  speedMultiplier: number;
  cadErrorRatePenaltyPct: number;
  monthlyMoraleDelta: number;
  turnoverRiskPct: number;
  resignedEngineersCount: number;
  summary: string;
}

export class ChiefEngineersAndBurnoutEngine {
  /**
   * Calculates collective perks from all currently hired Chief Engineers
   */
  public static calculateRosterBonuses(roster: ChiefEngineerProfile[]): {
    thermalBonus: number;
    aeroBonus: number;
    gripBonus: number;
    stylingBonus: number;
    defectReduction: number;
    totalSalaries: number;
  } {
    let thermalBonus = 0;
    let aeroBonus = 0;
    let gripBonus = 0;
    let stylingBonus = 0;
    let defectReduction = 0;
    let totalSalaries = 0;

    roster.filter(e => e.isHired).forEach(e => {
      totalSalaries += e.monthlySalaryEur;
      if (e.perks.thermalEfficiencyBonusPct) thermalBonus += e.perks.thermalEfficiencyBonusPct;
      if (e.perks.aeroEfficiencyBonusPct) aeroBonus += e.perks.aeroEfficiencyBonusPct;
      if (e.perks.chassisGripBonusPct) gripBonus += e.perks.chassisGripBonusPct;
      if (e.perks.stylingAppealBonusPts) stylingBonus += e.perks.stylingAppealBonusPts;
      if (e.perks.plantDefectReductionPct) defectReduction += e.perks.plantDefectReductionPct;
    });

    return {
      thermalBonus,
      aeroBonus,
      gripBonus,
      stylingBonus,
      defectReduction,
      totalSalaries,
    };
  }

  /**
   * Simulates monthly workforce fatigue, CAD errors, and burnout risk based on overtime intensity
   */
  public static evaluateWorkloadFatigue(
    intensity: WorkloadIntensity,
    consecutiveCrunchMonths: number = 0,
    totalEngineeringHeadcount: number = 108
  ): WorkforceMonthlyFatigueReport {
    let speedMultiplier = 1.0;
    let cadErrorRatePenaltyPct = 0;
    let monthlyMoraleDelta = 0;
    let turnoverRiskPct = 1.0;

    if (intensity === "standard_40h") {
      speedMultiplier = 1.0;
      cadErrorRatePenaltyPct = 0;
      monthlyMoraleDelta = +2; // Well-rested workforce recovers morale
      turnoverRiskPct = 0.5;
    } else if (intensity === "crunch_52h") {
      speedMultiplier = 1.25;
      cadErrorRatePenaltyPct = 8.5; // Fatigue leads to missed dimension clearances
      monthlyMoraleDelta = -5 - consecutiveCrunchMonths * 2;
      turnoverRiskPct = 5.0 + consecutiveCrunchMonths * 3;
    } else {
      // extreme_crunch_65h: Death-march mode
      speedMultiplier = 1.48;
      cadErrorRatePenaltyPct = 24.0; // Severe packaging clashes & tolerance stackups
      monthlyMoraleDelta = -14 - consecutiveCrunchMonths * 4;
      turnoverRiskPct = 18.0 + consecutiveCrunchMonths * 6;
    }

    const resignedEngineersCount = Math.round(totalEngineeringHeadcount * (turnoverRiskPct / 100) * 0.4);

    let summary = "Workforce operating under healthy 40-hour schedule with stable morale.";
    if (intensity === "crunch_52h") {
      summary = `Moderate crunch mode active (+25% speed). Fatigue induced +8.5% CAD packaging errors.`;
    } else if (intensity === "extreme_crunch_65h") {
      summary = `CRITICAL CRUNCH: 65h death march (+48% speed). Heavy packaging errors (+24%) and ${resignedEngineersCount} engineers resigned from burnout!`;
    }

    return {
      intensity,
      speedMultiplier,
      cadErrorRatePenaltyPct,
      monthlyMoraleDelta,
      turnoverRiskPct,
      resignedEngineersCount,
      summary,
    };
  }
}
