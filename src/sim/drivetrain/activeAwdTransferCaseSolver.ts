// ============================================================================
// PHASE 70 — ACTIVE AWD TRANSFER CASE & MULTI-PLATE CLUTCH SOLVER
// ============================================================================
// Multi-plate wet clutch electro-mechanical transfer case, dynamic front/rear
// torque splitting (0:100 to 50:50 to 70:30), and clutch thermal derating.
// ============================================================================

export type AwdTerrainMode = 'DYNAMIC_REAR_BIASED' | 'SNOW_MUD_LOCKED_50_50' | 'ECO_FRONT_DISCONNECT' | 'SPORT_DRIFT_MODE';

export interface AwdTransferCaseState {
  terrainMode: AwdTerrainMode;
  totalEngineTorqueDemandNm: number;
  frontAxleTorqueNm: number;
  rearAxleTorqueNm: number;
  frontTorqueSplitPct: number;
  rearTorqueSplitPct: number;
  clutchClampingForceN: number;
  clutchOilTempC: number;
  clutchSlipSpeedRpm: number;
  isThermalDerated: boolean;
  clutchEngagementResponseTimeMs: number;
}

export class ActiveAwdTransferCaseSolver {
  private static readonly MAX_CLUTCH_TORQUE_NM = 1800.0;
  private static readonly FRICTION_COEFF_MU = 0.12; // Wet carbon friction plate
  private static readonly NUM_FRICTION_FACES = 14;
  private static readonly MEAN_CLUTCH_RADIUS_M = 0.065;

  /**
   * Evaluates active AWD clutch lockup and front/rear axle torque distribution.
   */
  public static evaluateAwdDistribution(params: {
    terrainMode?: AwdTerrainMode;
    demandedEngineTorqueNm: number;
    rearWheelSlipRatio: number;
    lateralAccelerationG: number;
    clutchOilTempC?: number;
  }): AwdTransferCaseState {
    const mode = params.terrainMode || 'DYNAMIC_REAR_BIASED';
    const tEngine = params.demandedEngineTorqueNm;
    const slipR = params.rearWheelSlipRatio;
    const ay = params.lateralAccelerationG;
    const tempC = params.clutchOilTempC || 82.0;

    const isOverheated = tempC > 155.0;

    let frontSplit = 0.0; // 0.0 = 100% Rear, 0.5 = 50:50

    if (isOverheated) {
      // Thermal safety fallback: open clutch to cool oil
      frontSplit = 0.0;
    } else if (mode === 'SPORT_DRIFT_MODE') {
      frontSplit = 0.0; // 100% Rear drive
    } else if (mode === 'SNOW_MUD_LOCKED_50_50') {
      frontSplit = 0.5; // 50:50 Full lock
    } else if (mode === 'ECO_FRONT_DISCONNECT') {
      frontSplit = 0.0; // Disconnect front for highway mpg
    } else {
      // DYNAMIC_REAR_BIASED: Base 15% front, scales up with rear wheel slip and high-G cornering
      const slipTransfer = Math.min(0.35, slipR * 2.5);
      const cornerTransfer = Math.min(0.20, Math.abs(ay) * 0.18);
      frontSplit = Math.max(0.15, Math.min(0.50, 0.15 + slipTransfer + cornerTransfer));
    }

    const tFront = tEngine * frontSplit;
    const tRear = tEngine - tFront;

    // Clutch Normal Clamping Force: T_clutch = mu * N_faces * r_mean * F_normal
    const fClampingN = tFront / (this.FRICTION_COEFF_MU * this.NUM_FRICTION_FACES * this.MEAN_CLUTCH_RADIUS_M);

    return {
      terrainMode: mode,
      totalEngineTorqueDemandNm: Math.round(tEngine),
      frontAxleTorqueNm: Math.round(tFront),
      rearAxleTorqueNm: Math.round(tRear),
      frontTorqueSplitPct: Math.round(frontSplit * 100),
      rearTorqueSplitPct: Math.round((1 - frontSplit) * 100),
      clutchClampingForceN: Math.round(fClampingN),
      clutchOilTempC: Math.round(tempC * 10) / 10,
      clutchSlipSpeedRpm: Math.round(slipR * 450),
      isThermalDerated: isOverheated,
      clutchEngagementResponseTimeMs: 16.0,
    };
  }
}
