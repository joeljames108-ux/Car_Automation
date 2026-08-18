// ===================================================================
// MOTORSPORT HOMOLOGATION & BALANCE OF PERFORMANCE (BOP) ENGINE (Vision 13)
// ===================================================================
// Verifies vehicle eligibility against FIA regulations (GT3, GT4, LMH, WRC, Formula),
// applies air restrictors, boost pressure caps, and success ballast.
// ===================================================================

export type FiaRacingSeries =
  | "FIA_GT3"            // Production-based grand tourer, 500-580 hp, 1250-1300 kg
  | "FIA_GT4"            // Entry-level GT, near-stock chassis, 400-470 hp, 1400 kg
  | "FIA_HYPERCAR_LMH"   // 680 hp total powertrain, 1030 kg minimum, active hybrid front axle
  | "FIA_WRC_RALLY"      // 1.6L turbo + 100 kW hybrid boost, spaceframe cell, 1260 kg
  | "FORMULA_SPEC";      // Open-wheel single-seater, 1000 hp hybrid PU, 798 kg minimum

export interface SeriesRegulationSpec {
  series: FiaRacingSeries;
  name: string;
  minWeightKg: number;
  maxPowerHp: number;
  minProductionRoadCarQuota: number;
  maxDisplacementLiters: number;
  forcedInductionAllowed: boolean;
  hybridAwdAllowed: boolean;
  absAllowed: boolean;
  tractionControlAllowed: boolean;
  minGroundClearanceMm: number;
  maxDownforceLiftToDragTarget: number;
}

export const FIA_REGULATIONS: Record<FiaRacingSeries, SeriesRegulationSpec> = {
  FIA_GT3: {
    series: "FIA_GT3",
    name: "FIA GT3 Championship",
    minWeightKg: 1250,
    maxPowerHp: 580,
    minProductionRoadCarQuota: 300,
    maxDisplacementLiters: 6.2,
    forcedInductionAllowed: true,
    hybridAwdAllowed: false,
    absAllowed: true,
    tractionControlAllowed: true,
    minGroundClearanceMm: 50,
    maxDownforceLiftToDragTarget: 3.5,
  },
  FIA_GT4: {
    series: "FIA_GT4",
    name: "FIA GT4 European Series",
    minWeightKg: 1400,
    maxPowerHp: 470,
    minProductionRoadCarQuota: 1000,
    maxDisplacementLiters: 5.0,
    forcedInductionAllowed: true,
    hybridAwdAllowed: false,
    absAllowed: true,
    tractionControlAllowed: true,
    minGroundClearanceMm: 70,
    maxDownforceLiftToDragTarget: 2.2,
  },
  FIA_HYPERCAR_LMH: {
    series: "FIA_HYPERCAR_LMH",
    name: "FIA World Endurance Championship Hypercar (LMH/LMDh)",
    minWeightKg: 1030,
    maxPowerHp: 680,
    minProductionRoadCarQuota: 0, // Dedicated prototype chassis allowed
    maxDisplacementLiters: 5.5,
    forcedInductionAllowed: true,
    hybridAwdAllowed: true,
    absAllowed: false,
    tractionControlAllowed: true,
    minGroundClearanceMm: 30,
    maxDownforceLiftToDragTarget: 4.2,
  },
  FIA_WRC_RALLY: {
    series: "FIA_WRC_RALLY",
    name: "FIA World Rally Championship (Rally1)",
    minWeightKg: 1260,
    maxPowerHp: 500, // 380 hp ICE + 100 kW MGU
    minProductionRoadCarQuota: 2500,
    maxDisplacementLiters: 1.6,
    forcedInductionAllowed: true,
    hybridAwdAllowed: true,
    absAllowed: false,
    tractionControlAllowed: false,
    minGroundClearanceMm: 120,
    maxDownforceLiftToDragTarget: 2.8,
  },
  FORMULA_SPEC: {
    series: "FORMULA_SPEC",
    name: "FIA Formula Single-Seater Championship",
    minWeightKg: 798,
    maxPowerHp: 1050,
    minProductionRoadCarQuota: 0,
    maxDisplacementLiters: 1.6,
    forcedInductionAllowed: true,
    hybridAwdAllowed: false,
    absAllowed: false,
    tractionControlAllowed: false,
    minGroundClearanceMm: 20,
    maxDownforceLiftToDragTarget: 5.0,
  },
};

export interface HomologationCheckItem {
  ruleName: string;
  requiredValue: string | number | boolean;
  actualValue: string | number | boolean;
  passed: boolean;
  deviationNote?: string;
}

export interface HomologationResult {
  series: FiaRacingSeries;
  isCompliant: boolean;
  overallStatus: "APPROVED" | "REJECTED_WITH_REMEDIES" | "NON_COMPLIANT";
  checks: HomologationCheckItem[];
  remedyCostEstimateUsd: number;
}

export interface BalanceOfPerformanceAdjustment {
  series: FiaRacingSeries;
  vehicleName: string;
  rawPtoWRatioHpPerKg: number;
  targetPtoWRatioHpPerKg: number;
  intakeAirRestrictorMm: number; // e.g. 36mm - 48mm restrictor
  turboBoostCapBar?: number;
  successBallastWeightKg: number; // ballast added to meet BoP window
  calibratedPowerHp: number;
  calibratedWeightKg: number;
  estimatedLapTimeDeltaSec: number; // delta to baseline grid pace
}

export class HomologationAndBopEngine {
  /**
   * Evaluates if a vehicle meets the strict homologation technical regulations for a given FIA series.
   */
  public static checkHomologation(params: {
    series: FiaRacingSeries;
    curbWeightKg: number;
    peakPowerHp: number;
    displacementLiters: number;
    annualProductionUnits: number;
    hasTurbo: boolean;
    isAwd: boolean;
    hasAbs: boolean;
    hasTractionControl: boolean;
    rideHeightMm: number;
  }): HomologationResult {
    const reg = FIA_REGULATIONS[params.series];
    const checks: HomologationCheckItem[] = [];
    let remedyCost = 0;

    // Weight check
    const weightPassed = params.curbWeightKg >= reg.minWeightKg;
    checks.push({
      ruleName: "Minimum Dry Weight Limit",
      requiredValue: `>= ${reg.minWeightKg} kg`,
      actualValue: `${params.curbWeightKg} kg`,
      passed: weightPassed,
      deviationNote: weightPassed ? undefined : `Underweight by ${reg.minWeightKg - params.curbWeightKg} kg. Add chassis ballast.`,
    });
    if (!weightPassed) remedyCost += 4000;

    // Power check
    const powerPassed = params.peakPowerHp <= reg.maxPowerHp * 1.05; // 5% tolerance window prior to BoP
    checks.push({
      ruleName: "Maximum Engine Power Cap",
      requiredValue: `<= ${reg.maxPowerHp} hp`,
      actualValue: `${params.peakPowerHp} hp`,
      passed: powerPassed,
      deviationNote: powerPassed ? undefined : `Exceeds series power ceiling. Requires restrictor plate.`,
    });
    if (!powerPassed) remedyCost += 3500;

    // Displacement check
    const dispPassed = params.displacementLiters <= reg.maxDisplacementLiters;
    checks.push({
      ruleName: "Maximum Engine Displacement",
      requiredValue: `<= ${reg.maxDisplacementLiters} L`,
      actualValue: `${params.displacementLiters.toFixed(1)} L`,
      passed: dispPassed,
      deviationNote: dispPassed ? undefined : `Engine displacement exceeds maximum FIA homologated engine envelope.`,
    });
    if (!dispPassed) remedyCost += 25000;

    // Production volume quota check
    const quotaPassed = params.annualProductionUnits >= reg.minProductionRoadCarQuota;
    checks.push({
      ruleName: "Road Car Production Quota",
      requiredValue: `>= ${reg.minProductionRoadCarQuota} units/year`,
      actualValue: `${params.annualProductionUnits} units/year`,
      passed: quotaPassed,
      deviationNote: quotaPassed ? undefined : `Insufficient road-car volume to satisfy group homologation rules.`,
    });
    if (!quotaPassed) remedyCost += 50000;

    // Electronics checks
    if (!reg.absAllowed && params.hasAbs) {
      checks.push({
        ruleName: "Anti-Lock Braking System (ABS) Ban",
        requiredValue: false,
        actualValue: true,
        passed: false,
        deviationNote: "ABS is forbidden under FIA technical regulations. Must install non-assisted pedal box.",
      });
      remedyCost += 8000;
    }

    const allPassed = checks.every((c) => c.passed);
    const overallStatus = allPassed
      ? "APPROVED"
      : remedyCost <= 15000
      ? "REJECTED_WITH_REMEDIES"
      : "NON_COMPLIANT";

    return {
      series: params.series,
      isCompliant: allPassed,
      overallStatus,
      checks,
      remedyCostEstimateUsd: remedyCost,
    };
  }

  /**
   * Applies dynamic Balance of Performance (BoP) to equalize grid performance within $\pm 0.35$s per lap.
   */
  public static calculateBoPAdjustment(params: {
    series: FiaRacingSeries;
    vehicleName: string;
    curbWeightKg: number;
    peakPowerHp: number;
    hasTurbo: boolean;
    championshipStandingPosition?: number; // 1st gets success ballast penalty
  }): BalanceOfPerformanceAdjustment {
    const reg = FIA_REGULATIONS[params.series];
    const targetPtoW = reg.maxPowerHp / reg.minWeightKg; // Target HP/kg ratio for class
    const rawPtoW = params.peakPowerHp / params.curbWeightKg;

    let intakeAirRestrictorMm = 42.0; // Base 42mm restrictor
    let turboBoostCapBar: number | undefined = params.hasTurbo ? 2.1 : undefined;
    let successBallastWeightKg = Math.max(0, reg.minWeightKg - params.curbWeightKg);

    // Power restrictor scaling
    if (params.peakPowerHp > reg.maxPowerHp) {
      const powerExcessRatio = params.peakPowerHp / reg.maxPowerHp;
      intakeAirRestrictorMm = Number((42.0 / Math.sqrt(powerExcessRatio)).toFixed(1));
      if (turboBoostCapBar) {
        turboBoostCapBar = Number((2.1 / Math.sqrt(powerExcessRatio)).toFixed(2));
      }
    }

    // Success ballast for championship leaders
    if (params.championshipStandingPosition) {
      if (params.championshipStandingPosition === 1) successBallastWeightKg += 35; // 35kg success ballast
      else if (params.championshipStandingPosition === 2) successBallastWeightKg += 20;
      else if (params.championshipStandingPosition === 3) successBallastWeightKg += 10;
    }

    const calibratedWeight = params.curbWeightKg + successBallastWeightKg;
    const calibratedPower = Math.min(reg.maxPowerHp, params.peakPowerHp * Math.pow(intakeAirRestrictorMm / 42.0, 1.8));
    const calibratedPtoW = calibratedPower / calibratedWeight;
    const estimatedLapTimeDeltaSec = Number(((targetPtoW - calibratedPtoW) * 4.5).toFixed(2));

    return {
      series: params.series,
      vehicleName: params.vehicleName,
      rawPtoWRatioHpPerKg: Number(rawPtoW.toFixed(3)),
      targetPtoWRatioHpPerKg: Number(targetPtoW.toFixed(3)),
      intakeAirRestrictorMm,
      turboBoostCapBar,
      successBallastWeightKg,
      calibratedPowerHp: Number(calibratedPower.toFixed(0)),
      calibratedWeightKg: Number(calibratedWeight.toFixed(0)),
      estimatedLapTimeDeltaSec,
    };
  }
}
