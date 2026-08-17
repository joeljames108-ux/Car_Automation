// ============================================================================
// PHASE 20 — DUAL-CLUTCH & SEQUENTIAL TRANSMISSION SHIFT DYNAMICS SIMULATOR
// ============================================================================
// Multi-speed gearbox shift transient model solving dual-clutch handover,
// ignition-cut sequential dog engagement, clutch slip thermal work, and ratios.
// ============================================================================

export type TransmissionType = 'DUAL_CLUTCH_DCT' | 'SEQUENTIAL_DOG_BOX' | 'MANUAL_H_PATTERN' | 'SINGLE_SPEED_EV';

export interface GearboxSpecification {
  type: TransmissionType;
  gearRatios: number[]; // e.g. [3.82, 2.36, 1.68, 1.31, 1.00, 0.79, 0.62]
  finalDriveRatio: number; // e.g. 3.44
  shiftDurationMs: number; // e.g. 45ms for DCT, 35ms for dog-box
  clutchMaxTorqueNm: number; // e.g. 950 Nm
  differentialTbr: number; // Torque Bias Ratio (e.g. 3.5:1 Torsen / LSD)
}

export interface ShiftTransientState {
  currentGear: number;
  targetGear: number;
  shiftProgressPct: number; // 0 to 100%
  engineRpm: number;
  inputShaftRpm: number;
  outputShaftRpm: number;
  clutch1TorqueNm: number;
  clutch2TorqueNm: number;
  drivelineTorqueNm: number;
  clutchSlipEnergyJoules: number;
  isShifting: boolean;
}

export class TransmissionShiftDynamicsSimulator {
  /**
   * Calculates vehicle speed in km/h for a given engine RPM and gear.
   */
  public static calculateVehicleSpeedKmh(
    engineRpm: number,
    gear: number,
    spec: GearboxSpecification,
    tireRollingRadiusM: number = 0.33
  ): number {
    if (gear < 1 || gear > spec.gearRatios.length) return 0.0;
    const gearRatio = spec.gearRatios[gear - 1];
    const totalRatio = gearRatio * spec.finalDriveRatio;
    const wheelRpm = engineRpm / totalRatio;
    const wheelRps = wheelRpm / 60.0;
    const speedMs = wheelRps * 2 * Math.PI * tireRollingRadiusM;
    return (speedMs * 3600) / 1000;
  }

  /**
   * Simulates a single time step of gear shifting transient dynamics.
   */
  public static simulateShiftStep(
    spec: GearboxSpecification,
    currentGear: number,
    targetGear: number,
    shiftProgressNormalized: number, // 0.0 to 1.0
    engineTorqueNm: number,
    vehicleSpeedKmh: number,
    tireRollingRadiusM: number = 0.33
  ): ShiftTransientState {
    const isShifting = currentGear !== targetGear;
    const progress = Math.max(0.0, Math.min(1.0, shiftProgressNormalized));

    const currentRatio = spec.gearRatios[currentGear - 1] || 1.0;
    const targetRatio = spec.gearRatios[targetGear - 1] || 1.0;

    // Output shaft RPM is locked to vehicle road speed
    const speedMs = (vehicleSpeedKmh * 1000) / 3600;
    const wheelRps = speedMs / (2 * Math.PI * tireRollingRadiusM);
    const outputShaftRpm = wheelRps * 60 * spec.finalDriveRatio;

    let clutch1Torque = 0.0;
    let clutch2Torque = 0.0;
    let engineRpm = 0.0;

    if (!isShifting || progress >= 1.0) {
      // In Steady-State Gear
      clutch1Torque = engineTorqueNm;
      clutch2Torque = 0.0;
      engineRpm = outputShaftRpm * currentRatio;
    } else {
      // DCT Cross-Fading Torque Handover
      if (spec.type === 'DUAL_CLUTCH_DCT') {
        clutch1Torque = engineTorqueNm * (1.0 - progress);
        clutch2Torque = engineTorqueNm * progress;
        // Engine RPM smoothly synchronizes between ratios
        const initialRpm = outputShaftRpm * currentRatio;
        const finalRpm = outputShaftRpm * targetRatio;
        engineRpm = initialRpm + (finalRpm - initialRpm) * Math.sin((progress * Math.PI) / 2);
      } else if (spec.type === 'SEQUENTIAL_DOG_BOX') {
        // Flat shift ignition cut for 35ms
        clutch1Torque = 0.0;
        clutch2Torque = progress > 0.7 ? engineTorqueNm : 0.0;
        engineRpm = outputShaftRpm * targetRatio;
      }
    }

    const effectiveRatio = isShifting
      ? currentRatio * (1 - progress) + targetRatio * progress
      : currentRatio;

    const drivelineTorque = (clutch1Torque + clutch2Torque) * effectiveRatio * spec.finalDriveRatio;

    // Clutch slip energy: E = Torque * DeltaOmega * dt
    const deltaOmega = Math.abs(engineRpm - outputShaftRpm * effectiveRatio) * ((2 * Math.PI) / 60);
    const slipEnergyJoules = Math.abs(engineTorqueNm) * deltaOmega * (spec.shiftDurationMs / 1000);

    return {
      currentGear,
      targetGear,
      shiftProgressPct: Math.round(progress * 100),
      engineRpm: Math.round(Math.max(750, engineRpm)),
      inputShaftRpm: Math.round(outputShaftRpm * effectiveRatio),
      outputShaftRpm: Math.round(outputShaftRpm),
      clutch1TorqueNm: Math.round(clutch1Torque * 10) / 10,
      clutch2TorqueNm: Math.round(clutch2Torque * 10) / 10,
      drivelineTorqueNm: Math.round(drivelineTorque * 10) / 10,
      clutchSlipEnergyJoules: Math.round(slipEnergyJoules),
      isShifting,
    };
  }
}
