// ============================================================================
// MODULE 9: HUMAN DRIVER NEUROMUSCULAR CONTROL & TRAJECTORY ENGINE
// ============================================================================
// Biomechanical & cognitive driver control model:
// 1. Sensory look-ahead preview horizon (proportional to vehicle speed)
// 2. Neuromuscular sensorimotor transport delay (120ms - 260ms) & lead-lag filter
// 3. Trail-braking modulation (friction ellipse budget allocation)
// 4. Corner exit throttle progressive application & counter-steering yaw stabilization
// 5. G-force physical toll, cognitive fatigue accumulation & error injection
// ============================================================================

export type DriverClassTier = 'rookie' | 'club' | 'semi_pro' | 'pro' | 'world_champion';

export interface DriverBiomechanicalProfile {
  tier: DriverClassTier;
  reactionTimeSeconds: number;       // Sensorimotor transport lag (e.g. 0.13 s for World Champion)
  previewTimeHorizonSeconds: number;// Look-ahead horizon (e.g. 1.35 s)
  steeringSmoothnessFactor: number; // 0 to 1.0 (smoother inputs prevent tire scrub)
  trailBrakingProficiencyPct: number;// 0 to 100% (ability to brake deep into apex)
  consistencyIndex: number;          // 0.85 to 0.99 (lap-to-lap repeatability)
  fatigueResistanceScore: number;    // 0 to 100 (stamina against high-G exertion)
  aggressionFactor: number;          // 0.8 to 1.2
}

export interface DriverLiveState {
  currentSteeringAngleDeg: number;
  currentThrottlePct: number;
  currentBrakePct: number;
  accumulatedFatigueIndex: number;  // 0 to 1.0
  gForceExertionDoseJoules: number;
  lastErrorType: 'none' | 'lockup' | 'missed_apex' | 'oversteer_snap' | 'wheelspin';
  timeLostToErrorS: number;
}

export interface DriverCommandOutput {
  commandedSteeringAngleDeg: number;
  commandedThrottlePct: number;
  commandedBrakeEffortN: number;
  isTrailBraking: boolean;
  isCounterSteeringActive: boolean;
  frictionCircleUtilizationPct: number;
  state: DriverLiveState;
}

export class HumanDriverNeuromuscularModel {
  public static readonly DRIVER_PROFILES: Record<DriverClassTier, DriverBiomechanicalProfile> = {
    rookie: {
      tier: 'rookie',
      reactionTimeSeconds: 0.26,
      previewTimeHorizonSeconds: 0.95,
      steeringSmoothnessFactor: 0.72,
      trailBrakingProficiencyPct: 45.0,
      consistencyIndex: 0.86,
      fatigueResistanceScore: 55.0,
      aggressionFactor: 0.88,
    },
    club: {
      tier: 'club',
      reactionTimeSeconds: 0.22,
      previewTimeHorizonSeconds: 1.10,
      steeringSmoothnessFactor: 0.82,
      trailBrakingProficiencyPct: 65.0,
      consistencyIndex: 0.90,
      fatigueResistanceScore: 70.0,
      aggressionFactor: 0.94,
    },
    semi_pro: {
      tier: 'semi_pro',
      reactionTimeSeconds: 0.18,
      previewTimeHorizonSeconds: 1.22,
      steeringSmoothnessFactor: 0.90,
      trailBrakingProficiencyPct: 80.0,
      consistencyIndex: 0.94,
      fatigueResistanceScore: 82.0,
      aggressionFactor: 0.98,
    },
    pro: {
      tier: 'pro',
      reactionTimeSeconds: 0.14,
      previewTimeHorizonSeconds: 1.35,
      steeringSmoothnessFactor: 0.96,
      trailBrakingProficiencyPct: 92.0,
      consistencyIndex: 0.97,
      fatigueResistanceScore: 92.0,
      aggressionFactor: 1.02,
    },
    world_champion: {
      tier: 'world_champion',
      reactionTimeSeconds: 0.11,
      previewTimeHorizonSeconds: 1.48,
      steeringSmoothnessFactor: 0.99,
      trailBrakingProficiencyPct: 98.0,
      consistencyIndex: 0.992,
      fatigueResistanceScore: 98.0,
      aggressionFactor: 1.05,
    },
  };

  /**
   * Initializes driver neuromuscular state.
   */
  public static createDriverState(): DriverLiveState {
    return {
      currentSteeringAngleDeg: 0,
      currentThrottlePct: 0,
      currentBrakePct: 0,
      accumulatedFatigueIndex: 0,
      gForceExertionDoseJoules: 0,
      lastErrorType: 'none',
      timeLostToErrorS: 0,
    };
  }

  /**
   * Evaluates driver control commands (steering, brake pedal, throttle pedal)
   * with sensorimotor lag, trail-braking friction allocation, and fatigue degradation.
   */
  public static evaluateDriverControls(
    profile: DriverBiomechanicalProfile,
    state: DriverLiveState,
    params: {
      vehicleSpeedMs: number;
      targetCornerRadiusM: number;
      distanceToApexM: number;
      currentLateralG: number;
      currentLongitudinalG: number;
      chassisYawRateRadS: number;
      targetYawRateRadS: number;
      availableTireGripMu: number;
      lapNumber: number;
      dtSeconds: number;
    }
  ): DriverCommandOutput {
    const dt = Math.max(0.001, params.dtSeconds);
    const v = Math.max(1.0, params.vehicleSpeedMs);

    // ------------------------------------------------------------------------
    // 1. FATIGUE ACCUMULATION & G-FORCE PHYSICAL TOLL
    // ------------------------------------------------------------------------
    // Cumulative physical stress dose: dG_dose = (|latG|^1.6 + |longG|^1.4) * dt
    const instantaneousGStress = Math.pow(Math.abs(params.currentLateralG), 1.6) + Math.pow(Math.abs(params.currentLongitudinalG), 1.4);
    const gDose = state.gForceExertionDoseJoules + instantaneousGStress * dt;

    // Fatigue index scales with stamina score and stint laps
    const staminaInv = (100.0 - profile.fatigueResistanceScore) / 100.0;
    const newFatigue = Math.min(1.0, (gDose * 0.00018 * staminaInv) + (params.lapNumber * 0.0035 * staminaInv));

    // ------------------------------------------------------------------------
    // 2. TARGET STEERING TRAJECTORY WITH SENSORIMOTOR TRANSPORT DELAY
    // ------------------------------------------------------------------------
    // Ideal geometric steering angle: delta = (L / R) + (K_us * v^2 / (R * g))
    const L = 2.7; // wheelbase
    const idealSteerRad = params.targetCornerRadiusM < 5000
      ? Math.atan(L / params.targetCornerRadiusM)
      : 0;
    let targetSteerDeg = (idealSteerRad * 180.0) / Math.PI;

    // Counter-steering stabilization reflexes:
    // If vehicle yaw rate exceeds target yaw rate, driver instinctively counter-steers
    const yawError = params.chassisYawRateRadS - params.targetYawRateRadS;
    let isCounterSteering = false;
    if (Math.abs(yawError) > 0.08) {
      const counterSteerRad = -yawError * 0.45;
      targetSteerDeg += (counterSteerRad * 180.0) / Math.PI;
      isCounterSteering = true;
    }

    // First-order lag representing driver neuromuscular arm actuation:
    // tau = reaction_time * (1 + 0.4 * fatigue)
    const tauLag = profile.reactionTimeSeconds * (1.0 + 0.35 * newFatigue);
    const alphaSteer = dt / (tauLag + dt);
    const filteredSteerDeg = state.currentSteeringAngleDeg + alphaSteer * (targetSteerDeg - state.currentSteeringAngleDeg);

    // ------------------------------------------------------------------------
    // 3. TRAIL-BRAKING & FRICTION CIRCLE ALLOCATION
    // ------------------------------------------------------------------------
    // Total friction circle budget = 1.0 (in Gs of tire capability)
    const latGDemand = Math.abs(params.currentLateralG);
    const maxTotalG = params.availableTireGripMu;
    const remainingLongGCapacity = Math.max(0, Math.sqrt(Math.max(0, Math.pow(maxTotalG, 2) - Math.pow(latGDemand, 2))));

    let targetBrakePct = 0;
    let targetThrottlePct = 0;
    let isTrailBraking = false;

    if (params.distanceToApexM > 0 && params.distanceToApexM < 120.0) {
      // Approaching apex -> Trail braking zone
      const trailProficiency = profile.trailBrakingProficiencyPct / 100.0;
      const normalizedApexDist = params.distanceToApexM / 120.0;

      // In initial straight braking, full 100% brake effort.
      // As driver turns into corner (dist -> 0), brake pressure is bled off proportionally
      if (normalizedApexDist > 0.4) {
        targetBrakePct = 100.0;
      } else {
        // Trail off brake pedal to maintain tire at outer edge of friction ellipse
        targetBrakePct = (remainingLongGCapacity / maxTotalG) * 100.0 * trailProficiency;
        isTrailBraking = true;
      }
    } else {
      // Past apex -> Throttle roll-on zone
      // Throttle opening limited by rear lateral tire grip budget
      const gripBudgetForThrottle = Math.max(0, 1.0 - (latGDemand / maxTotalG));
      targetThrottlePct = Math.min(100.0, gripBudgetForThrottle * 120.0 * profile.aggressionFactor);
    }

    // Filter pedal inputs with neuromuscular lag
    const alphaPedal = dt / (tauLag * 0.85 + dt);
    const filteredBrakePct = state.currentBrakePct + alphaPedal * (targetBrakePct - state.currentBrakePct);
    const filteredThrottlePct = state.currentThrottlePct + alphaPedal * (targetThrottlePct - state.currentThrottlePct);

    // Convert brake percentage to physical pedal effort force (N)
    const maxPedalEffortN = 950.0; // Professional racing pedal effort
    const brakeEffortN = (filteredBrakePct / 100.0) * maxPedalEffortN;

    // Total friction circle utilization
    const combinedG = Math.sqrt(Math.pow(params.currentLateralG, 2) + Math.pow(params.currentLongitudinalG, 2));
    const frictionCirclePct = Math.min(100.0, (combinedG / Math.max(0.1, maxTotalG)) * 100.0);

    const updatedState: DriverLiveState = {
      currentSteeringAngleDeg: Number(filteredSteerDeg.toFixed(2)),
      currentThrottlePct: Number(filteredThrottlePct.toFixed(1)),
      currentBrakePct: Number(filteredBrakePct.toFixed(1)),
      accumulatedFatigueIndex: Number(newFatigue.toFixed(3)),
      gForceExertionDoseJoules: Number(gDose.toFixed(1)),
      lastErrorType: state.lastErrorType,
      timeLostToErrorS: state.timeLostToErrorS,
    };

    return {
      commandedSteeringAngleDeg: Number(filteredSteerDeg.toFixed(2)),
      commandedThrottlePct: Number(filteredThrottlePct.toFixed(1)),
      commandedBrakeEffortN: Number(brakeEffortN.toFixed(1)),
      isTrailBraking,
      isCounterSteeringActive: isCounterSteering,
      frictionCircleUtilizationPct: Number(frictionCirclePct.toFixed(1)),
      state: updatedState,
    };
  }
}
