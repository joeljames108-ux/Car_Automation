// ============================================================================
// PHASE 81 — ACTIVE TORQUE FILL & DRIVETRAIN TORSIONAL VIBRATION DAMPER
// ============================================================================
// Models dual-mass flywheel (DMF) torsional dynamics with centrifugal pendulum
// absorber (CPA), drivetrain shuffle frequency identification, active torque
// shaping during driver tip-in / tip-out transients, and hybrid e-motor
// instantaneous torque fill to eliminate driveline clunk and shuffle.
//
// Reference physics:
//   - DMF torsional stiffness:  k_θ = Σ(k_spring_i) * R_spring²
//   - CPA pendulum frequency:   f_CPA = (1/2π) * sqrt(g_eff / L_pendulum)
//   - Shuffle frequency:        f_shuffle = (1/2π) * sqrt(k_total / J_reduced)
//   - Torque fill:              T_fill(t) = T_demand - T_ice(t) [filled by e-motor]
//   - Anti-jerk filter:         T_filtered = T_raw * (1 / (1 + s*τ))
// ============================================================================

// ─── Dual-Mass Flywheel (DMF) State ─────────────────────────────────────────
export interface DualMassFlywheelState {
  primaryMassInertiaKgm2: number;
  secondaryMassInertiaKgm2: number;
  arcSpringStiffnessNmPerDeg: number;
  arcSpringDampingNmsPerDeg: number;
  maxWindupAngleDeg: number;
  currentWindupAngleDeg: number;
  transmittedTorqueNm: number;
  isolationStartFrequencyHz: number;
  dampingRatioPct: number;
  isSpringOverloaded: boolean;
}

// ─── Centrifugal Pendulum Absorber (CPA) State ──────────────────────────────
export interface CentrifugalPendulumState {
  pendulumCount: number;
  pendulumMassG: number;
  pendulumArmLengthMm: number;
  effectivePendulumRadiusMm: number;
  targetOrderCancellation: number; // Engine firing order (e.g. 2.0 for 4-cyl, 3.0 for 6-cyl)
  tuningFrequencyHz: number;
  pendulumAmplitudeDeg: number;
  absorptionEfficiencyPct: number;
  centrifugalForceN: number;
  isOrderMatched: boolean;
}

// ─── Drivetrain Shuffle Dynamics ────────────────────────────────────────────
export interface DrivetrainShuffleState {
  totalDrivetrainInertiaKgm2: number;
  totalTorsionalStiffnessNmPerRad: number;
  reducedInertiaKgm2: number;
  shuffleFrequencyHz: number;
  shufflePeriodMs: number;
  dampingRatioZeta: number;
  peakOscillationAmplitudeNm: number;
  settlingTime90PctMs: number;
  numberOfOscillationsToSettle: number;
  isDrivelineClunkRisk: boolean;
}

// ─── Active Torque Fill State ───────────────────────────────────────────────
export interface ActiveTorqueFillState {
  driverTorqueDemandNm: number;
  iceTorqueCurrentNm: number;
  iceTorqueRateNmPerS: number;
  torqueDeficitNm: number;
  eMotorFillTorqueNm: number;
  eMotorFillResponseTimeMs: number;
  combinedOutputTorqueNm: number;
  torqueRipplePctOfDemand: number;
  isAntiJerkFilterActive: boolean;
  antiJerkFilterTimeConstantMs: number;
  tipInOvershootPct: number;
  tipOutUndershootPct: number;
  jerkRateMPerS3: number;
  isJerkAcceptable: boolean;
}

// ─── Gearshift Torque Intervention State ────────────────────────────────────
export interface GearshiftTorqueInterventionState {
  shiftPhase: 'TORQUE_REDUCTION' | 'INERTIA_PHASE' | 'TORQUE_RESTORATION' | 'IDLE';
  clutchSlipRpm: number;
  targetSyncSpeedRpm: number;
  torqueReductionNm: number;
  eMotorSpeedMatchingTorqueNm: number;
  shiftDurationMs: number;
  comfortRatingScale10: number;
  isClutchOpen: boolean;
}

// ─── Master Torque Fill & Vibration System State ────────────────────────────
export interface TorqueFillVibrationSystemState {
  engineRpm: number;
  vehicleSpeedKmh: number;
  currentGear: number;
  dmf: DualMassFlywheelState;
  cpa: CentrifugalPendulumState;
  shuffle: DrivetrainShuffleState;
  torqueFill: ActiveTorqueFillState;
  gearshift: GearshiftTorqueInterventionState;
  overallDriveabilityScore: number; // 0-100 scale
}

// ─── Input Parameters ───────────────────────────────────────────────────────
export interface TorqueFillSolverParams {
  engineRpm: number;
  vehicleSpeedKmh?: number;
  currentGear?: number;
  driverTorqueDemandNm?: number;
  throttleRatePerSec?: number; // Throttle position change rate for tip-in detection
  cylinderCount?: number;
  isShifting?: boolean;
}

// ============================================================================
// SOLVER CLASS
// ============================================================================
export class ActiveTorqueFillDamperSolver {

  // ── Engine & Drivetrain Constants ───────────────────────────────────────
  private static readonly ENGINE_INERTIA_KGM2 = 0.18; // Crankshaft + flywheel primary
  private static readonly TRANSMISSION_INERTIA_KGM2 = 0.035;
  private static readonly PROPSHAFT_INERTIA_KGM2 = 0.012;
  private static readonly WHEEL_INERTIA_KGM2 = 1.2; // Per wheel (× 4)
  private static readonly VEHICLE_EQUIVALENT_INERTIA_KGM2 = 85; // Translational → rotational

  // ── DMF Arc Spring Properties ──────────────────────────────────────────
  private static readonly DMF_PRIMARY_INERTIA = 0.12; // kg·m²
  private static readonly DMF_SECONDARY_INERTIA = 0.06; // kg·m²
  private static readonly ARC_SPRING_STIFFNESS = 18.5; // Nm/°
  private static readonly ARC_SPRING_DAMPING = 0.35; // Nm·s/°
  private static readonly MAX_WINDUP_ANGLE = 65; // degrees

  // ── CPA Properties ─────────────────────────────────────────────────────
  private static readonly CPA_PENDULUM_COUNT = 4;
  private static readonly CPA_PENDULUM_MASS_G = 280;
  private static readonly CPA_ARM_LENGTH_MM = 42;
  private static readonly CPA_EFFECTIVE_RADIUS_MM = 125;

  // ── E-Motor Fill Specifications ────────────────────────────────────────
  private static readonly E_MOTOR_MAX_TORQUE_NM = 150;
  private static readonly E_MOTOR_RESPONSE_TIME_MS = 5; // Near-instant torque
  private static readonly ANTI_JERK_FILTER_TAU_MS = 80; // First-order filter
  private static readonly MAX_ACCEPTABLE_JERK_M_S3 = 8.0; // Comfort limit

  /**
   * Solves the complete drivetrain torsional vibration and torque fill system.
   */
  public static solveTorqueFillSystem(params: TorqueFillSolverParams): TorqueFillVibrationSystemState {
    const rpm = Math.max(700, Math.min(7000, params.engineRpm));
    const speedKmh = params.vehicleSpeedKmh ?? (rpm * 0.02); // Rough estimate
    const gear = params.currentGear ?? 3;
    const demandTorque = params.driverTorqueDemandNm ?? 300;
    const throttleRate = params.throttleRatePerSec ?? 1.5; // %/s throttle opening rate
    const cylCount = params.cylinderCount ?? 6;
    const isShifting = params.isShifting ?? false;

    // ──────────────────────────────────────────────────────────────────
    // 1. DUAL-MASS FLYWHEEL (DMF) ANALYSIS
    // ──────────────────────────────────────────────────────────────────
    const dmf = this.solveDmfDynamics(rpm, demandTorque, cylCount);

    // ──────────────────────────────────────────────────────────────────
    // 2. CENTRIFUGAL PENDULUM ABSORBER (CPA) TUNING
    // ──────────────────────────────────────────────────────────────────
    const cpa = this.solveCpaDynamics(rpm, cylCount);

    // ──────────────────────────────────────────────────────────────────
    // 3. DRIVETRAIN SHUFFLE FREQUENCY ANALYSIS
    // ──────────────────────────────────────────────────────────────────
    const shuffle = this.solveShuffleDynamics(rpm, gear, demandTorque, throttleRate);

    // ──────────────────────────────────────────────────────────────────
    // 4. ACTIVE TORQUE FILL (E-MOTOR COMPENSATION)
    // ──────────────────────────────────────────────────────────────────
    const torqueFill = this.solveTorqueFill(rpm, demandTorque, throttleRate);

    // ──────────────────────────────────────────────────────────────────
    // 5. GEARSHIFT TORQUE INTERVENTION
    // ──────────────────────────────────────────────────────────────────
    const gearshift = this.solveGearshiftIntervention(rpm, gear, demandTorque, isShifting);

    // ──────────────────────────────────────────────────────────────────
    // 6. OVERALL DRIVEABILITY SCORE
    // ──────────────────────────────────────────────────────────────────
    let driveabilityScore = 100;
    // Penalize for shuffle oscillations
    driveabilityScore -= Math.min(30, shuffle.numberOfOscillationsToSettle * 5);
    // Penalize for torque ripple
    driveabilityScore -= Math.min(20, torqueFill.torqueRipplePctOfDemand * 2);
    // Penalize for jerk
    if (!torqueFill.isJerkAcceptable) driveabilityScore -= 15;
    // Reward CPA order matching
    if (cpa.isOrderMatched) driveabilityScore += 5;
    // Penalize clunk risk
    if (shuffle.isDrivelineClunkRisk) driveabilityScore -= 20;

    driveabilityScore = Math.max(0, Math.min(100, driveabilityScore));

    return {
      engineRpm: rpm,
      vehicleSpeedKmh: Math.round(speedKmh * 10) / 10,
      currentGear: gear,
      dmf,
      cpa,
      shuffle,
      torqueFill,
      gearshift,
      overallDriveabilityScore: Math.round(driveabilityScore),
    };
  }

  // ────────────────────────────────────────────────────────────────────────
  // PRIVATE: Solve DMF torsional dynamics
  // ────────────────────────────────────────────────────────────────────────
  private static solveDmfDynamics(rpm: number, torque: number, cylCount: number): DualMassFlywheelState {
    const J1 = this.DMF_PRIMARY_INERTIA;
    const J2 = this.DMF_SECONDARY_INERTIA;
    const kTheta = this.ARC_SPRING_STIFFNESS; // Nm/°
    const cTheta = this.ARC_SPRING_DAMPING;

    // Current windup angle from torque: θ = T / k
    const windupAngle = Math.min(this.MAX_WINDUP_ANGLE, torque / kTheta);

    // Transmitted torque through DMF (spring force + damping)
    const omegaHz = rpm / 60;
    const transmittedTorque = kTheta * windupAngle + cTheta * omegaHz * 0.1;

    // Isolation start frequency: f_iso = (1/2π) * sqrt(k / J_reduced)
    const kRad = kTheta * (180 / Math.PI); // Convert to Nm/rad
    const J_reduced = (J1 * J2) / (J1 + J2);
    const f_iso = (1 / (2 * Math.PI)) * Math.sqrt(kRad / J_reduced);

    // Damping ratio
    const cRad = cTheta * (180 / Math.PI);
    const criticalDamping = 2 * Math.sqrt(kRad * J_reduced);
    const dampingRatio = (cRad / criticalDamping) * 100;

    return {
      primaryMassInertiaKgm2: J1,
      secondaryMassInertiaKgm2: J2,
      arcSpringStiffnessNmPerDeg: kTheta,
      arcSpringDampingNmsPerDeg: cTheta,
      maxWindupAngleDeg: this.MAX_WINDUP_ANGLE,
      currentWindupAngleDeg: Math.round(windupAngle * 10) / 10,
      transmittedTorqueNm: Math.round(transmittedTorque * 10) / 10,
      isolationStartFrequencyHz: Math.round(f_iso * 10) / 10,
      dampingRatioPct: Math.round(dampingRatio * 10) / 10,
      isSpringOverloaded: windupAngle >= this.MAX_WINDUP_ANGLE * 0.9,
    };
  }

  // ────────────────────────────────────────────────────────────────────────
  // PRIVATE: Solve CPA pendulum dynamics
  // ────────────────────────────────────────────────────────────────────────
  private static solveCpaDynamics(rpm: number, cylCount: number): CentrifugalPendulumState {
    const nPendulums = this.CPA_PENDULUM_COUNT;
    const mPend = this.CPA_PENDULUM_MASS_G;
    const armLength = this.CPA_ARM_LENGTH_MM;
    const effRadius = this.CPA_EFFECTIVE_RADIUS_MM;

    // Target firing order: 4-cyl = 2.0, 6-cyl = 3.0, 8-cyl = 4.0
    const firingOrder = cylCount / 2;

    // CPA tuning frequency: must match engine firing order × RPM
    // f_CPA = firingOrder × (RPM / 60)
    const targetFreqHz = firingOrder * (rpm / 60);

    // Centrifugal effective gravity: g_eff = ω² * R_effective
    const omegaRadS = (rpm * 2 * Math.PI) / 60;
    const gEff = omegaRadS * omegaRadS * (effRadius / 1000); // m/s²

    // Pendulum natural frequency: f_pend = (1/2π) * sqrt(g_eff / L_arm)
    const fPend = (1 / (2 * Math.PI)) * Math.sqrt(gEff / (armLength / 1000));

    // Order matching check
    const isMatched = Math.abs(fPend - targetFreqHz) / targetFreqHz < 0.15;

    // Pendulum amplitude (limited by mechanical stops)
    const amplitude = Math.min(25, 5 + (rpm / 7000) * 20);

    // Absorption efficiency
    const freqError = Math.abs(fPend - targetFreqHz) / targetFreqHz;
    const absEfficiency = Math.max(0, 95 - freqError * 200);

    // Centrifugal force on each pendulum
    const centForce = (mPend / 1000) * omegaRadS * omegaRadS * (effRadius / 1000);

    return {
      pendulumCount: nPendulums,
      pendulumMassG: mPend,
      pendulumArmLengthMm: armLength,
      effectivePendulumRadiusMm: effRadius,
      targetOrderCancellation: firingOrder,
      tuningFrequencyHz: Math.round(fPend * 10) / 10,
      pendulumAmplitudeDeg: Math.round(amplitude * 10) / 10,
      absorptionEfficiencyPct: Math.round(absEfficiency * 10) / 10,
      centrifugalForceN: Math.round(centForce * 10) / 10,
      isOrderMatched: isMatched,
    };
  }

  // ────────────────────────────────────────────────────────────────────────
  // PRIVATE: Solve drivetrain shuffle dynamics
  // ────────────────────────────────────────────────────────────────────────
  private static solveShuffleDynamics(
    rpm: number,
    gear: number,
    demandTorque: number,
    throttleRate: number
  ): DrivetrainShuffleState {
    // Gear ratios (typical 8-speed DCT)
    const gearRatios = [0, 3.42, 2.14, 1.45, 1.08, 0.87, 0.72, 0.61, 0.52];
    const finalDrive = 3.21;
    const iTotal = (gearRatios[gear] ?? 1.45) * finalDrive;

    // Total drivetrain inertia reflected to engine
    const J_engine = this.ENGINE_INERTIA_KGM2;
    const J_trans = this.TRANSMISSION_INERTIA_KGM2;
    const J_wheels = 4 * this.WHEEL_INERTIA_KGM2 / (iTotal * iTotal);
    const J_vehicle = this.VEHICLE_EQUIVALENT_INERTIA_KGM2 / (iTotal * iTotal);
    const J_total = J_engine + J_trans + J_wheels + J_vehicle;

    // Reduced inertia (engine vs. load)
    const J_load = J_wheels + J_vehicle;
    const J_reduced = (J_engine * J_load) / (J_engine + J_load);

    // Halfshaft torsional stiffness (typical CFRP)
    const halfshaftStiffness = 5500; // Nm/rad per halfshaft
    const totalStiffness = 2 * halfshaftStiffness / (iTotal * iTotal); // Reflected to engine

    // Shuffle frequency: f_shuffle = (1/2π) * sqrt(k / J_reduced)
    const shuffleFreq = (1 / (2 * Math.PI)) * Math.sqrt(totalStiffness / J_reduced);
    const shufflePeriod = 1000 / shuffleFreq; // ms

    // Damping ratio (structural + lubricant damping)
    const structuralDamping = 12; // Nm·s/rad
    const criticalDamping = 2 * Math.sqrt(totalStiffness * J_reduced);
    const zeta = structuralDamping / criticalDamping;

    // Peak oscillation amplitude from step torque input
    const peakAmplitude = demandTorque * (1 + Math.exp(-zeta * Math.PI / Math.sqrt(1 - zeta * zeta)));

    // Settling time (to 10% of initial amplitude)
    const settlingTime = -Math.log(0.1) / (zeta * 2 * Math.PI * shuffleFreq) * 1000;

    // Number of oscillation cycles to settle
    const nOscillations = Math.ceil(settlingTime / shufflePeriod);

    // Clunk risk: high throttle rate + low damping + low gear
    const clunkRisk = throttleRate > 3.0 && zeta < 0.15 && gear <= 2;

    return {
      totalDrivetrainInertiaKgm2: Math.round(J_total * 1000) / 1000,
      totalTorsionalStiffnessNmPerRad: Math.round(totalStiffness),
      reducedInertiaKgm2: Math.round(J_reduced * 1000) / 1000,
      shuffleFrequencyHz: Math.round(shuffleFreq * 100) / 100,
      shufflePeriodMs: Math.round(shufflePeriod * 10) / 10,
      dampingRatioZeta: Math.round(zeta * 1000) / 1000,
      peakOscillationAmplitudeNm: Math.round(peakAmplitude * 10) / 10,
      settlingTime90PctMs: Math.round(settlingTime * 10) / 10,
      numberOfOscillationsToSettle: nOscillations,
      isDrivelineClunkRisk: clunkRisk,
    };
  }

  // ────────────────────────────────────────────────────────────────────────
  // PRIVATE: Solve active torque fill
  // ────────────────────────────────────────────────────────────────────────
  private static solveTorqueFill(
    rpm: number,
    demandTorque: number,
    throttleRate: number
  ): ActiveTorqueFillState {
    // ICE torque response: first-order lag with ~200ms time constant
    const iceTimeConstant = 200; // ms — combustion + intake manifold filling
    const isTipIn = throttleRate > 1.0;
    const isTipOut = throttleRate < -1.0;

    // ICE current torque (lagging behind demand)
    const lagFactor = Math.exp(-this.E_MOTOR_RESPONSE_TIME_MS / iceTimeConstant);
    const iceTorqueCurrent = demandTorque * (isTipIn ? 0.6 : 0.95); // During tip-in, ICE is slow

    // ICE torque rate
    const iceRate = (demandTorque - iceTorqueCurrent) / (iceTimeConstant / 1000); // Nm/s

    // Torque deficit that e-motor must fill
    const deficit = Math.max(0, demandTorque - iceTorqueCurrent);

    // E-motor fill: clamp to max torque capability
    const eMotorFill = Math.min(this.E_MOTOR_MAX_TORQUE_NM, deficit);

    // Combined output torque
    const combinedTorque = iceTorqueCurrent + eMotorFill;

    // Torque ripple: ratio of remaining unfilled deficit to demand
    const unfilled = Math.max(0, deficit - eMotorFill);
    const ripplePct = demandTorque > 0 ? (unfilled / demandTorque) * 100 : 0;

    // Anti-jerk filter state
    const isAntiJerk = isTipIn || isTipOut;
    const filterTau = isAntiJerk ? this.ANTI_JERK_FILTER_TAU_MS : 0;

    // Tip-in overshoot (without filter)
    const overshootPct = isTipIn ? Math.max(0, 15 - filterTau * 0.12) : 0;
    const undershootPct = isTipOut ? Math.max(0, 12 - filterTau * 0.1) : 0;

    // Longitudinal jerk: J = dF/dt / m ≈ (dT/dt * i_total) / (r_wheel * m_vehicle)
    const iTotal = 4.65; // Overall gear ratio
    const rWheel = 0.34; // m
    const mVehicle = 1850; // kg
    const jerk = (iceRate * iTotal) / (rWheel * mVehicle);

    return {
      driverTorqueDemandNm: demandTorque,
      iceTorqueCurrentNm: Math.round(iceTorqueCurrent * 10) / 10,
      iceTorqueRateNmPerS: Math.round(iceRate * 10) / 10,
      torqueDeficitNm: Math.round(deficit * 10) / 10,
      eMotorFillTorqueNm: Math.round(eMotorFill * 10) / 10,
      eMotorFillResponseTimeMs: this.E_MOTOR_RESPONSE_TIME_MS,
      combinedOutputTorqueNm: Math.round(combinedTorque * 10) / 10,
      torqueRipplePctOfDemand: Math.round(ripplePct * 10) / 10,
      isAntiJerkFilterActive: isAntiJerk,
      antiJerkFilterTimeConstantMs: filterTau,
      tipInOvershootPct: Math.round(overshootPct * 10) / 10,
      tipOutUndershootPct: Math.round(undershootPct * 10) / 10,
      jerkRateMPerS3: Math.round(jerk * 100) / 100,
      isJerkAcceptable: Math.abs(jerk) <= this.MAX_ACCEPTABLE_JERK_M_S3,
    };
  }

  // ────────────────────────────────────────────────────────────────────────
  // PRIVATE: Solve gearshift torque intervention
  // ────────────────────────────────────────────────────────────────────────
  private static solveGearshiftIntervention(
    rpm: number,
    gear: number,
    demandTorque: number,
    isShifting: boolean
  ): GearshiftTorqueInterventionState {
    if (!isShifting) {
      return {
        shiftPhase: 'IDLE',
        clutchSlipRpm: 0,
        targetSyncSpeedRpm: rpm,
        torqueReductionNm: 0,
        eMotorSpeedMatchingTorqueNm: 0,
        shiftDurationMs: 0,
        comfortRatingScale10: 10,
        isClutchOpen: false,
      };
    }

    // During upshift: torque reduction → inertia phase → restoration
    const gearRatios = [0, 3.42, 2.14, 1.45, 1.08, 0.87, 0.72, 0.61, 0.52];
    const nextGear = Math.min(8, gear + 1);
    const ratio = (gearRatios[gear] ?? 1.45) / (gearRatios[nextGear] ?? 1.08);
    const targetSync = rpm * ratio;
    const clutchSlip = rpm - targetSync;

    // Torque reduction: ICE torque cut during clutch opening
    const torqueReduction = demandTorque * 0.85; // 85% reduction

    // E-motor speed matching: spin down or up to target sync speed
    const deltaRpm = rpm - targetSync;
    const eMotorMatchTorque = Math.min(this.E_MOTOR_MAX_TORQUE_NM, Math.abs(deltaRpm) * 0.3);

    // Shift duration: DCT wet clutch overlap = 150-250ms
    const shiftDuration = 180 + Math.abs(deltaRpm) * 0.05;

    // Comfort rating: higher is better (10 = imperceptible)
    const comfortRating = Math.max(3, 10 - (shiftDuration - 150) * 0.02 - clutchSlip * 0.002);

    return {
      shiftPhase: 'INERTIA_PHASE',
      clutchSlipRpm: Math.round(clutchSlip),
      targetSyncSpeedRpm: Math.round(targetSync),
      torqueReductionNm: Math.round(torqueReduction * 10) / 10,
      eMotorSpeedMatchingTorqueNm: Math.round(eMotorMatchTorque * 10) / 10,
      shiftDurationMs: Math.round(shiftDuration),
      comfortRatingScale10: Math.round(comfortRating * 10) / 10,
      isClutchOpen: true,
    };
  }
}
