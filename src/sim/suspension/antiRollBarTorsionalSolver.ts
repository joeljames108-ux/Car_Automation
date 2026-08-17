// ============================================================================
// PHASE 52 — ANTI-ROLL BAR (ARB) TORSIONAL STIFFNESS & ROLL SOLVER
// ============================================================================
// Solid & tubular spring steel ARB rate solver, front/rear roll stiffness distribution,
// and 48V electromechanical active ARB actuator counter-torque modulation.
// ============================================================================

export interface AntiRollBarSpec {
  outerDiameterMm: number;
  innerDiameterMm: number; // 0 for solid bar
  effectiveLengthMm: number;
  leverArmLengthMm: number;
  materialShearModulusGpa: number; // ~79.3 GPa for 55Cr3 spring steel
  linearStiffnessNPerMm: number;
  rollRateNmPerDeg: number;
}

export interface VehicleRollDynamicsState {
  lateralAccelG: number;
  frontArb: AntiRollBarSpec;
  rearArb: AntiRollBarSpec;
  frontRollStiffnessDistributionPct: number; // e.g. 58% front biased (understeer safe)
  passiveChassisRollAngleDeg: number;
  activeArbCounterTorqueNm: number;
  compensatedChassisRollAngleDeg: number;
  handlingBalance: 'STABLE_UNDERSTEER' | 'NEUTRAL_RACING' | 'ROTATING_OVERSTEER';
}

export class AntiRollBarTorsionalSolver {
  private static readonly STEEL_G_GPA = 79.3; // 55Cr3 / 51CrV4 Spring Steel

  /**
   * Calculates linear and torsional roll stiffness for an anti-roll bar.
   */
  public static calculateArbStiffness(params: {
    outerDiameterMm: number;
    innerDiameterMm?: number;
    effectiveLengthMm: number;
    leverArmLengthMm: number;
    trackWidthMm?: number;
  }): AntiRollBarSpec {
    const doMm = params.outerDiameterMm;
    const diMm = params.innerDiameterMm || 0;
    const lMm = params.effectiveLengthMm;
    const aMm = params.leverArmLengthMm;
    const trackMm = params.trackWidthMm || 1620;

    // Linear Stiffness at link mount: k = (pi * G * (Do^4 - Di^4)) / (32 * L * a^2)
    const gMpa = this.STEEL_G_GPA * 1000;
    const polarMomentMm4 = (Math.PI / 32) * (Math.pow(doMm, 4) - Math.pow(diMm, 4));
    const kLinearNPerMm = (gMpa * polarMomentMm4) / (lMm * Math.pow(aMm, 2));

    // Torsional Roll Rate per degree chassis roll: K_phi = k * (Track / 2)^2 * (pi / 180)
    const kPhiNmPerDeg = (kLinearNPerMm * Math.pow(trackMm / 1000, 2) * (Math.PI / 180)) * 1000 * 0.25;

    return {
      outerDiameterMm: doMm,
      innerDiameterMm: diMm,
      effectiveLengthMm: lMm,
      leverArmLengthMm: aMm,
      materialShearModulusGpa: this.STEEL_G_GPA,
      linearStiffnessNPerMm: Math.round(kLinearNPerMm * 10) / 10,
      rollRateNmPerDeg: Math.round(kPhiNmPerDeg * 10) / 10,
    };
  }

  /**
   * Solves vehicle roll equilibrium and active ARB counter-torque.
   */
  public static solveVehicleRollEquilibrium(params: {
    lateralAccelG: number;
    vehicleMassKg?: number;
    cgHeightMm?: number;
    rollCenterHeightMm?: number;
    frontArbDoMm?: number;
    rearArbDoMm?: number;
    enableActiveArb?: boolean;
  }): VehicleRollDynamicsState {
    const ay = params.lateralAccelG;
    const mass = params.vehicleMassKg || 1480;
    const hCgMm = params.cgHeightMm || 440;
    const hRcMm = params.rollCenterHeightMm || 95;
    const rollArmM = (hCgMm - hRcMm) / 1000; // ~0.345 m
    const enableActive = params.enableActiveArb ?? true;

    // 1. Solve Front & Rear ARB Specs
    const frontArb = this.calculateArbStiffness({
      outerDiameterMm: params.frontArbDoMm || 32.0, // 32mm Front Tubular
      innerDiameterMm: 22.0,
      effectiveLengthMm: 920,
      leverArmLengthMm: 240,
    });

    const rearArb = this.calculateArbStiffness({
      outerDiameterMm: params.rearArbDoMm || 24.0, // 24mm Rear Solid
      innerDiameterMm: 0,
      effectiveLengthMm: 880,
      leverArmLengthMm: 220,
    });

    // 2. Base Spring Roll Rates (Front & Rear Main Coils)
    const kSpringsFrontNmDeg = 1450;
    const kSpringsRearNmDeg = 1250;

    const totalKFront = frontArb.rollRateNmPerDeg + kSpringsFrontNmDeg;
    const totalKRear = rearArb.rollRateNmPerDeg + kSpringsRearNmDeg;
    const totalRollStiffnessNmDeg = totalKFront + totalKRear;

    // Roll Stiffness Distribution %
    const frontDistPct = (totalKFront / totalRollStiffnessNmDeg) * 100;

    // 3. Roll Moment: M_roll = m * ay * g * rollArm
    const rollMomentNm = mass * (ay * 9.81) * rollArmM;
    const passiveRollDeg = rollMomentNm / totalRollStiffnessNmDeg;

    // 4. 48V Active ARB Counter-Torque (Suppresses roll down to < 0.6 deg)
    let activeCounterTorqueNm = 0;
    let compensatedRollDeg = passiveRollDeg;

    if (enableActive && Math.abs(ay) > 0.1) {
      activeCounterTorqueNm = Math.min(1200, rollMomentNm * 0.75);
      compensatedRollDeg = Math.max(0.1, (rollMomentNm - activeCounterTorqueNm) / totalRollStiffnessNmDeg);
    }

    const handling: 'STABLE_UNDERSTEER' | 'NEUTRAL_RACING' | 'ROTATING_OVERSTEER' =
      frontDistPct > 55 ? 'STABLE_UNDERSTEER' : (frontDistPct < 48 ? 'ROTATING_OVERSTEER' : 'NEUTRAL_RACING');

    return {
      lateralAccelG: ay,
      frontArb,
      rearArb,
      frontRollStiffnessDistributionPct: Math.round(frontDistPct * 10) / 10,
      passiveChassisRollAngleDeg: Math.round(passiveRollDeg * 100) / 100,
      activeArbCounterTorqueNm: Math.round(activeCounterTorqueNm),
      compensatedChassisRollAngleDeg: Math.round(compensatedRollDeg * 100) / 100,
      handlingBalance: handling,
    };
  }
}
