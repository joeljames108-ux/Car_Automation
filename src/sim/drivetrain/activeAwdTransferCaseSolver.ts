// ============================================================================
// PHASE 70 — ACTIVE AWD TRANSFER CASE & MULTI-PLATE CLUTCH SOLVER
// ============================================================================
// Electro-hydraulic hang-on / central differential multi-plate wet clutch pack.
// Dynamic torque transfer kinetics T_clutch = mu(v_slip, T_oil, P) * N_plates * F_clamp * r_mean,
// slip velocity power dissipation, wet clutch oil thermal capacity, and multi-mode AWD distribution.
// ============================================================================

export type AwdTerrainMode =
  | 'DYNAMIC_REAR_BIASED'
  | 'SNOW_ICE_MAX_TRACTION'
  | 'GRAVEL_DIRT_OPTIMIZED'
  | 'TRACK_CORNER_EXIT_VECTOR'
  | 'ECO_FWD_DISCONNECTED';

export interface AwdClutchThermalStep {
  timeSec: number;
  clutchSlipSpeedRpm: number;
  frictionalHeatWatts: number;
  clutchPackTempC: number;
  oilTempC: number;
  availableTorqueCapacityNm: number;
}

export interface ActiveAwdTransferCaseState {
  terrainMode: AwdTerrainMode;
  totalEngineTorqueDemandNm: number;
  frontAxleTorqueNm: number;
  rearAxleTorqueNm: number;
  frontTorqueSplitPct: number; // Backward compatibility alias
  rearTorqueSplitPct: number;  // Backward compatibility alias
  frontRearTorqueSplitRatio: string;
  clutchClampingForceN: number;
  clutchHydraulicPressureBar: number;
  clutchSlipVelocityRpm: number;
  clutchFrictionCoefficientMu: number;
  clutchPackTempC: number;
  oilTempC: number;
  clutchOilTempC: number; // Backward compatibility alias
  instantaneousSlipPowerLossWatts: number;
  isClutchThermallyDerated: boolean;
  isCenterDifferentialLocked: boolean;
  awdLockResponseTimeMs: number;
  thermalHistory: AwdClutchThermalStep[];
}

export class ActiveAwdTransferCaseSolver {
  private static readonly CLUTCH_PLATES_COUNT = 8;
  private static readonly MEAN_CLUTCH_RADIUS_M = 0.068;
  private static readonly MAX_CLAMP_FORCE_N = 8500.0;
  private static readonly MAX_CLUTCH_TORQUE_NM = 1200.0;

  /**
   * Evaluates Stribeck friction coefficient for carbon-paper wet clutch: mu(v_slip, T_oil, P).
   */
  public static calculateWetClutchMu(slipRpm: number, oilTempC: number, pressureMpa: number): number {
    const vSlipMs = (slipRpm * 2 * Math.PI * this.MEAN_CLUTCH_RADIUS_M) / 60;
    const muBoundary = 0.135 * (1 - 0.0008 * Math.max(0, oilTempC - 40));
    const muHydro = 0.088;
    const vStribeck = 0.45;

    const mu = muHydro + (muBoundary - muHydro) * Math.exp(-Math.pow(vSlipMs / vStribeck, 1.25));
    return Math.max(0.06, Math.min(0.16, mu));
  }

  /**
   * Solves multi-mode torque split, electro-hydraulic clutch clamping force, and thermal capacity.
   */
  public static evaluateAwdDistribution(params: {
    terrainMode: AwdTerrainMode;
    demandedEngineTorqueNm: number;
    rearWheelSlipRatio: number;
    lateralAccelerationG: number;
    steeringWheelAngleDeg?: number;
    initialOilTempC?: number;
  }): ActiveAwdTransferCaseState {
    const mode = params.terrainMode;
    const tDem = Math.max(0, params.demandedEngineTorqueNm);
    const slipRear = Math.max(0, Math.min(0.6, params.rearWheelSlipRatio));
    const ay = Math.abs(params.lateralAccelerationG);
    const oilTempC = params.initialOilTempC ?? 72.0;

    let targetFrontSharePct = 0.0;
    let lockupAggressiveness = 1.0;

    switch (mode) {
      case 'DYNAMIC_REAR_BIASED':
        targetFrontSharePct = 20.0 + slipRear * 120.0 - (ay > 0.8 ? 5.0 : 0.0);
        lockupAggressiveness = 1.0;
        break;
      case 'SNOW_ICE_MAX_TRACTION':
        targetFrontSharePct = 50.0;
        lockupAggressiveness = 1.45;
        break;
      case 'GRAVEL_DIRT_OPTIMIZED':
        targetFrontSharePct = 40.0 + slipRear * 80.0;
        lockupAggressiveness = 1.2;
        break;
      case 'TRACK_CORNER_EXIT_VECTOR':
        targetFrontSharePct = 15.0 + (tDem > 400 ? 25.0 : 0.0) + slipRear * 90.0;
        lockupAggressiveness = 1.15;
        break;
      case 'ECO_FWD_DISCONNECTED':
        targetFrontSharePct = 0.0;
        lockupAggressiveness = 0.0;
        break;
    }

    targetFrontSharePct = Math.max(0.0, Math.min(50.0, targetFrontSharePct));
    const targetFrontTorqueNm = tDem * (targetFrontSharePct / 100.0);

    const slipSpeedRpm = slipRear * 450.0;
    const pistonAreaM2 = 0.0052;
    const pressureMpaEst = 1.2;
    const muClutch = this.calculateWetClutchMu(slipSpeedRpm, oilTempC, pressureMpaEst);

    const torquePerNewtonClamp = 2.0 * this.CLUTCH_PLATES_COUNT * muClutch * this.MEAN_CLUTCH_RADIUS_M;
    const requiredClampForceN = Math.min(this.MAX_CLAMP_FORCE_N, (targetFrontTorqueNm / Math.max(0.001, torquePerNewtonClamp)) * lockupAggressiveness);
    const actualFrontTorqueNm = Math.min(targetFrontTorqueNm, requiredClampForceN * torquePerNewtonClamp);
    const actualRearTorqueNm = tDem - actualFrontTorqueNm;

    const hydraulicPressurePa = requiredClampForceN / pistonAreaM2;
    const hydraulicPressureBar = hydraulicPressurePa / 1e5;

    const omegaSlipRadSec = (slipSpeedRpm * 2 * Math.PI) / 60;
    const slipPowerWatts = actualFrontTorqueNm * omegaSlipRadSec;

    const clutchMassKg = 3.8;
    const cpSteel = 490;
    const deltaTClutch = (slipPowerWatts * 0.45) / (clutchMassKg * cpSteel);
    const clutchPackTempC = oilTempC + 18.0 + deltaTClutch;
    const isDerated = clutchPackTempC > 145.0;

    const thermalHistory: AwdClutchThermalStep[] = [];
    for (let t = 0; t <= 10; t += 2) {
      const pW = slipPowerWatts * Math.exp(-t / 4.0);
      thermalHistory.push({
        timeSec: t,
        clutchSlipSpeedRpm: Math.round(slipSpeedRpm * Math.exp(-t / 3.0)),
        frictionalHeatWatts: Math.round(pW),
        clutchPackTempC: Math.round((clutchPackTempC - (10 - t) * 0.8) * 10) / 10,
        oilTempC: Math.round(oilTempC * 10) / 10,
        availableTorqueCapacityNm: Math.round(actualFrontTorqueNm),
      });
    }

    const frontPct = Math.round((actualFrontTorqueNm / Math.max(1, tDem)) * 100);
    const rearPct = 100 - frontPct;

    return {
      terrainMode: mode,
      totalEngineTorqueDemandNm: Math.round(tDem),
      frontAxleTorqueNm: Math.round(actualFrontTorqueNm),
      rearAxleTorqueNm: Math.round(actualRearTorqueNm),
      frontTorqueSplitPct: frontPct,
      rearTorqueSplitPct: rearPct,
      frontRearTorqueSplitRatio: `${frontPct}:${rearPct}`,
      clutchClampingForceN: Math.round(requiredClampForceN),
      clutchHydraulicPressureBar: Math.round(hydraulicPressureBar * 10) / 10,
      clutchSlipVelocityRpm: Math.round(slipSpeedRpm * 10) / 10,
      clutchFrictionCoefficientMu: Math.round(muClutch * 1000) / 1000,
      clutchPackTempC: Math.round(clutchPackTempC * 10) / 10,
      oilTempC: Math.round(oilTempC * 10) / 10,
      clutchOilTempC: Math.round(oilTempC * 10) / 10,
      instantaneousSlipPowerLossWatts: Math.round(slipPowerWatts),
      isClutchThermallyDerated: isDerated,
      isCenterDifferentialLocked: requiredClampForceN >= this.MAX_CLAMP_FORCE_N * 0.95,
      awdLockResponseTimeMs: 14.5,
      thermalHistory,
    };
  }
}
