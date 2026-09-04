// ============================================================================
// MODULE 4: THERMODYNAMIC POWERTRAIN & HYBRID ENERGY MANAGEMENT DYNAMICS
// ============================================================================
// Engine & hybrid powertrain dynamics solver:
// 1. 4-Stroke thermodynamic combustion indicator analysis (IMEP, BMEP, Chen-Flynn FMEP)
// 2. Turbocharger compressor/turbine matching & rotational inertia spool lag
// 3. PMSM Electric traction motor with MTPA & flux-weakening high-speed regime
// 4. Hybrid Energy Management Strategy (EMS) with lap-level SOC deployment
// 5. Gear shift torque-fill elimination of acceleration interruptions
// 6. Reflected drivetrain rotational inertia & dual-clutch transmission phases
// ============================================================================

export interface CombustionEngineSpecs {
  displacementLiters: number;
  cylinderCount: number;
  boreMm: number;
  strokeMm: number;
  compressionRatio: number;
  idleRpm: number;
  redlineRpm: number;
  peakPowerKw: number;
  peakPowerRpm: number;
  peakTorqueNm: number;
  peakTorqueRpm: number;
  isTurbocharged: boolean;
  maxBoostPressureBar: number;
  turboRotationalInertiaKgm2: number;
  crankshaftInertiaKgm2: number;
}

export interface ElectricHybridSpecs {
  hasHybridSystem: boolean;
  mguKPeakPowerKw: number;     // e.g. 120 kW (F1 / Le Mans LMH MGU-K)
  mguKPeakTorqueNm: number;    // e.g. 350 Nm
  motorBaseSpeedRpm: number;   // Base speed before field-weakening (e.g. 6000 RPM)
  motorMaxSpeedRpm: number;    // Maximum motor speed (e.g. 18,000 RPM)
  batteryCapacityKwh: number;  // e.g. 4.0 kWh
  maxRegenPowerKw: number;     // e.g. 150 kW
  inverterEfficiency: number;  // e.g. 0.96
}

export interface TransmissionSpecs {
  gearRatios: number[];        // 1st to Nth gear
  finalDriveRatio: number;
  mechanicalEfficiency: number; // e.g. 0.94
  shiftTimeSeconds: number;    // e.g. 0.045 s (DCT/Sequential)
  wheelRadiusM: number;        // e.g. 0.33 m
  flywheelInertiaKgm2: number;
}

export interface PowertrainOperatingState {
  engineRpm: number;
  turboRpm: number;
  boostPressureBar: number;
  wastegateOpenPct: number;
  batterySocPct: number;       // 0 to 100%
  selectedGear: number;        // 1 to N
  isShifting: boolean;
  shiftPhaseTimerS: number;
  clutchSlipSpeedRadS: number;
  engineTemperatureC: number;
}

export interface PowertrainControlDemand {
  throttlePedalPct: number;    // 0 to 100%
  requestedGear: number;
  hybridDeployMode: 'balanced' | 'hotlap' | 'harvest' | 'conserve';
  isBrakingRegenActive: boolean;
  brakingDemandKw: number;
  vehicleSpeedMs: number;
  dtSeconds: number;
}

export interface PowertrainOutput {
  crankTorqueNm: number;
  wheelDriveForceN: number;
  wheelSpeedMs: number;
  icePowerKw: number;
  mguKPowerKw: number;
  combinedPowerKw: number;
  indicatedMeanEffectivePressureBar: number; // IMEP
  brakeMeanEffectivePressureBar: number;     // BMEP
  frictionMeanEffectivePressureBar: number;    // FMEP
  turboLagFraction: number;                  // 0 (spooled) to 1 (pure lag)
  fuelMassFlowRateGramsPerSec: number;
  electricalEnergyUsedKwh: number;
  regeneratedEnergyHarvestedKwh: number;
  drivetrainReflectedInertiaKg: number;
  accelerationInterruptFactor: number;       // 1.0 = full drive, 0 = open clutch
  state: PowertrainOperatingState;
}

export class ThermodynamicPowertrainDynamics {
  /**
   * Initializes baseline steady-state powertrain operating state.
   */
  public static createPowertrainState(
    engine: CombustionEngineSpecs,
    hybrid: ElectricHybridSpecs
  ): PowertrainOperatingState {
    return {
      engineRpm: engine.idleRpm,
      turboRpm: engine.isTurbocharged ? 18000 : 0,
      boostPressureBar: 0,
      wastegateOpenPct: 0,
      batterySocPct: hybrid.hasHybridSystem ? 85.0 : 0,
      selectedGear: 1,
      isShifting: false,
      shiftPhaseTimerS: 0,
      clutchSlipSpeedRadS: 0,
      engineTemperatureC: 90.0,
    };
  }

  /**
   * Computes engine thermodynamic cycle, turbo transient spooling, electric motor MTPA,
   * hybrid SOC balance, reflected inertia, and total driving force.
   */
  public static evaluatePowertrain(
    engine: CombustionEngineSpecs,
    hybrid: ElectricHybridSpecs,
    trans: TransmissionSpecs,
    state: PowertrainOperatingState,
    demand: PowertrainControlDemand
  ): PowertrainOutput {
    const dt = Math.max(0.001, demand.dtSeconds);
    const throttle = Math.max(0, Math.min(1.0, demand.throttlePedalPct / 100.0));
    const gear = Math.max(1, Math.min(trans.gearRatios.length, state.selectedGear));
    const gearRatio = trans.gearRatios[gear - 1];
    const overallRatio = gearRatio * trans.finalDriveRatio;

    // ------------------------------------------------------------------------
    // 1. GEAR SHIFT INERTIA & TORQUE-FILL PHASES
    // ------------------------------------------------------------------------
    let shifting = state.isShifting;
    let shiftTimer = state.shiftPhaseTimerS;
    let accelInterrupt = 1.0;

    if (demand.requestedGear !== state.selectedGear && !shifting) {
      shifting = true;
      shiftTimer = trans.shiftTimeSeconds;
    }

    if (shifting) {
      shiftTimer -= dt;
      if (shiftTimer <= 0) {
        shifting = false;
        shiftTimer = 0;
        state.selectedGear = demand.requestedGear;
      } else {
        // Torque-phase / inertia-phase dip
        const phaseRatio = shiftTimer / trans.shiftTimeSeconds;
        // In conventional transmission, power cuts to 0 during shift.
        // In dual-clutch, brief torque handover dip to ~25%.
        accelInterrupt = 0.25 + 0.75 * Math.sin(phaseRatio * Math.PI);
      }
    }

    // Engine speed derived from vehicle speed (or idle)
    const wheelRpm = (demand.vehicleSpeedMs / (2.0 * Math.PI * trans.wheelRadiusM)) * 60.0;
    let targetEngineRpm = wheelRpm * overallRatio;
    targetEngineRpm = Math.max(engine.idleRpm, Math.min(engine.redlineRpm, targetEngineRpm));

    // ------------------------------------------------------------------------
    // 2. TURBOCHARGER TRANSIENT SPOOLING & COMPRESSOR MAP
    // ------------------------------------------------------------------------
    let targetBoost = 0;
    let turboLag = 0;
    let currentTurboRpm = state.turboRpm;
    let currentBoost = state.boostPressureBar;

    if (engine.isTurbocharged) {
      // Steady-state target boost as function of engine RPM and throttle
      const boostCurveRpm = Math.max(0, Math.min(1.0, (targetEngineRpm - 2000.0) / 2500.0));
      targetBoost = engine.maxBoostPressureBar * boostCurveRpm * throttle;

      // Turbo spool acceleration: dOmega_tc/dt = (P_turb - P_comp) / (I_tc * omega_tc)
      const maxTurboRpm = 180000.0;
      const targetTurboSpeed = 25000.0 + (maxTurboRpm - 25000.0) * (targetBoost / engine.maxBoostPressureBar);
      const turboSpeedError = targetTurboSpeed - currentTurboRpm;
      const spoolRate = turboSpeedError * 4.5 * dt; // 1st-order spool dynamics

      currentTurboRpm = Math.max(15000, currentTurboRpm + spoolRate);
      currentBoost = Math.max(0, (currentTurboRpm - 25000.0) / (maxTurboRpm - 25000.0)) * engine.maxBoostPressureBar;
      turboLag = targetBoost > 0.05 ? Math.max(0, 1.0 - (currentBoost / targetBoost)) : 0;
    }

    // ------------------------------------------------------------------------
    // 3. THERMODYNAMIC 4-STROKE COMBUSTION CYCLE & CHEN-FLYNN FMEP
    // ------------------------------------------------------------------------
    // Mean piston speed Sp = 2 * stroke * RPM / 60
    const meanPistonSpeedMs = (2.0 * (engine.strokeMm / 1000.0) * targetEngineRpm) / 60.0;

    // Chen-Flynn Mechanical Friction Mean Effective Pressure:
    // FMEP = A + B * P_max + C * Sp + D * Sp^2
    const A_fmep = 0.35; // bar
    const B_fmep = 0.005;
    const C_fmep = 0.085;
    const D_fmep = 0.0018;

    // Naturally aspirated base torque shape
    const rpmFraction = (targetEngineRpm - engine.idleRpm) / (engine.redlineRpm - engine.idleRpm);
    const peakTorqueRpmFraction = (engine.peakTorqueRpm - engine.idleRpm) / (engine.redlineRpm - engine.idleRpm);
    const baseTorqueCurve = Math.sin(Math.max(0, Math.min(Math.PI, (rpmFraction / peakTorqueRpmFraction) * (Math.PI / 2.0))));

    // Boost density multiplier
    const manifoldPressureBar = 1.0 + currentBoost;
    const indicatedTorque = engine.peakTorqueNm * baseTorqueCurve * manifoldPressureBar * throttle;

    // Convert to Indicated Mean Effective Pressure: IMEP = (4 * pi * T_ind) / V_displacement
    const vDispM3 = engine.displacementLiters * 1e-3;
    const imepBar = ((4.0 * Math.PI * indicatedTorque) / vDispM3) * 1e-5;

    // Peak in-cylinder pressure estimation
    const pMaxBar = manifoldPressureBar * Math.pow(engine.compressionRatio, 1.32);
    const fmepBar = A_fmep + B_fmep * pMaxBar + C_fmep * meanPistonSpeedMs + D_fmep * Math.pow(meanPistonSpeedMs, 2);

    // Brake Mean Effective Pressure: BMEP = IMEP - FMEP
    const bmepBar = Math.max(0, imepBar - fmepBar);
    const iceBrakeTorqueNm = ((bmepBar * 1e5 * vDispM3) / (4.0 * Math.PI)) * (targetEngineRpm > engine.idleRpm + 50 ? 1.0 : throttle);
    const icePowerKw = (iceBrakeTorqueNm * targetEngineRpm * (2.0 * Math.PI / 60.0)) / 1000.0;

    // Fuel consumption: BSFC based on BMEP and mean piston speed
    // Optimal BSFC ~ 215 g/kWh for turbo racing engine
    const bsfcGPerKwh = 215.0 + 35.0 * Math.pow(1.0 - (bmepBar / 24.0), 2) + 2.5 * meanPistonSpeedMs;
    const fuelMassFlowRateGramsPerSec = (icePowerKw * bsfcGPerKwh) / 3600.0;

    // ------------------------------------------------------------------------
    // 4. ELECTRIC TRACTION MOTOR (PMSM) & MTPA / FLUX WEAKENING
    // ------------------------------------------------------------------------
    let mguKTorqueNm = 0;
    let mguKPowerKw = 0;
    let energyUsedKwh = 0;
    let energyHarvestedKwh = 0;
    let currentBatterySoc = state.batterySocPct;

    if (hybrid.hasHybridSystem) {
      // Motor speed geared to drivetrain
      const motorRpm = targetEngineRpm * 1.85;

      if (demand.isBrakingRegenActive && demand.brakingDemandKw > 0 && currentBatterySoc < 98.0) {
        // Regenerative Braking Mode (MGU-K generator)
        const regenKw = Math.min(hybrid.maxRegenPowerKw, demand.brakingDemandKw);
        mguKPowerKw = -regenKw;
        energyHarvestedKwh = (regenKw * dt) / 3600.0;
        currentBatterySoc += (energyHarvestedKwh / hybrid.batteryCapacityKwh) * 100.0 * hybrid.inverterEfficiency;
      } else if (throttle > 0.05 && currentBatterySoc > 5.0) {
        // Traction Assist / Boost Mode
        let socMultiplier = 1.0;
        if (demand.hybridDeployMode === 'conserve') socMultiplier = 0.5;
        if (demand.hybridDeployMode === 'hotlap') socMultiplier = 1.25;

        // MTPA (Maximum Torque Per Ampere) below base speed, Flux-Weakening above
        let motorTorqueAvailable = hybrid.mguKPeakTorqueNm;
        if (motorRpm > hybrid.motorBaseSpeedRpm) {
          // Constant power regime: T = P_max / omega
          motorTorqueAvailable *= (hybrid.motorBaseSpeedRpm / motorRpm);
        }

        // Torque fill during gear shifts: MGU-K applies 100% boost to eliminate shift hole
        if (shifting) {
          mguKTorqueNm = motorTorqueAvailable;
        } else {
          mguKTorqueNm = motorTorqueAvailable * throttle * socMultiplier;
        }

        mguKPowerKw = (mguKTorqueNm * motorRpm * (2.0 * Math.PI / 60.0)) / 1000.0;
        mguKPowerKw = Math.min(hybrid.mguKPeakPowerKw, mguKPowerKw);

        energyUsedKwh = (mguKPowerKw * dt) / (3600.0 * hybrid.inverterEfficiency);
        currentBatterySoc = Math.max(0, currentBatterySoc - (energyUsedKwh / hybrid.batteryCapacityKwh) * 100.0);
      }
    }

    // ------------------------------------------------------------------------
    // 5. TOTAL DRIVETRAIN TORQUE, REFLECTED INERTIA & WHEEL DRIVE FORCE
    // ------------------------------------------------------------------------
    const totalCrankTorque = (iceBrakeTorqueNm * accelInterrupt) + (mguKTorqueNm * 0.54);
    const combinedPowerKw = (icePowerKw * accelInterrupt) + mguKPowerKw;

    // Reflected rotational inertia of entire drivetrain at the wheels:
    // J_eff = J_wheels + (J_crank + J_flywheel) * overallRatio^2
    const totalEngineInertia = engine.crankshaftInertiaKgm2 + trans.flywheelInertiaKgm2;
    const reflectedInertiaKg = (totalEngineInertia * Math.pow(overallRatio, 2)) / Math.pow(trans.wheelRadiusM, 2);

    // Wheel drive force: F_drive = (T_crank * overallRatio * eta) / r_wheel
    const wheelDriveForceN = (totalCrankTorque * overallRatio * trans.mechanicalEfficiency) / trans.wheelRadiusM;

    const updatedState: PowertrainOperatingState = {
      engineRpm: Math.round(targetEngineRpm),
      turboRpm: Math.round(currentTurboRpm),
      boostPressureBar: Number(currentBoost.toFixed(3)),
      wastegateOpenPct: Math.round((currentBoost / Math.max(0.01, engine.maxBoostPressureBar)) * 100),
      batterySocPct: Number(currentBatterySoc.toFixed(2)),
      selectedGear: state.selectedGear,
      isShifting: shifting,
      shiftPhaseTimerS: Number(shiftTimer.toFixed(4)),
      clutchSlipSpeedRadS: shifting ? 15.0 : 0,
      engineTemperatureC: state.engineTemperatureC,
    };

    return {
      crankTorqueNm: Number(totalCrankTorque.toFixed(1)),
      wheelDriveForceN: Number(wheelDriveForceN.toFixed(1)),
      wheelSpeedMs: demand.vehicleSpeedMs,
      icePowerKw: Number(icePowerKw.toFixed(1)),
      mguKPowerKw: Number(mguKPowerKw.toFixed(1)),
      combinedPowerKw: Number(combinedPowerKw.toFixed(1)),
      indicatedMeanEffectivePressureBar: Number(imepBar.toFixed(2)),
      brakeMeanEffectivePressureBar: Number(bmepBar.toFixed(2)),
      frictionMeanEffectivePressureBar: Number(fmepBar.toFixed(2)),
      turboLagFraction: Number(turboLag.toFixed(3)),
      fuelMassFlowRateGramsPerSec: Number(fuelMassFlowRateGramsPerSec.toFixed(2)),
      electricalEnergyUsedKwh: Number(energyUsedKwh.toFixed(5)),
      regeneratedEnergyHarvestedKwh: Number(energyHarvestedKwh.toFixed(5)),
      drivetrainReflectedInertiaKg: Number(reflectedInertiaKg.toFixed(1)),
      accelerationInterruptFactor: Number(accelInterrupt.toFixed(3)),
      state: updatedState,
    };
  }
}
