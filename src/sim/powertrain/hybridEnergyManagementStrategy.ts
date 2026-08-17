// ============================================================================
// PHASE 41 — P2/P4 PARALLEL HYBRID ENERGY MANAGEMENT STRATEGY (EMS)
// ============================================================================
// Equivalent Consumption Minimization Strategy (ECMS) Hamiltonian solver,
// P2 motor torque fill during turbo lag, P4 rear e-axle, and SOC balancing.
// ============================================================================

export type HybridOperatingMode =
  | 'PURE_ELECTRIC_EV'
  | 'SERIES_PARALLEL_BOOST'
  | 'ENGINE_DRIVE_RECHARGE'
  | 'REGENERATIVE_BRAKING'
  | 'SAILING_COAST_ECO';

export interface HybridPowerSplitState {
  mode: HybridOperatingMode;
  driverDemandedPowerKw: number;
  enginePowerKw: number;
  engineTorqueNm: number;
  engineRpm: number;
  p2MotorPowerKw: number; // Positive = Motoring, Negative = Generating
  p2MotorTorqueNm: number;
  p4RearAxlePowerKw: number;
  p4RearAxleTorqueNm: number;
  batteryNetPowerKw: number; // Positive = Discharging, Negative = Charging
  batterySocPct: number;
  instantaneousFuelRateGPerSec: number;
  equivalentFuelRateGPerSec: number;
  electricTorqueFillActive: boolean;
}

export class HybridEnergyManagementStrategy {
  private static readonly ICE_MAX_POWER_KW = 450; // 600 BHP Twin-Turbo V8
  private static readonly P2_MOTOR_MAX_POWER_KW = 120; // 160 BHP P2 Motor
  private static readonly P4_EAXLE_MAX_POWER_KW = 160; // 215 BHP Rear e-Axle
  private static readonly LHV_GASOLINE_KJ_PER_G = 44.0; // Lower heating value

  /**
   * Evaluates ECMS power split optimization across ICE, P2, and P4 e-Axle.
   */
  public static evaluateHybridPowerSplit(params: {
    driverThrottlePct: number;
    driverBrakePressureBar: number;
    vehicleSpeedKmh: number;
    batterySocPct: number;
    currentRpm: number;
    turboSpoolPct: number; // 0.0 to 1.0 (Low = turbo lag)
  }): HybridPowerSplitState {
    const isBraking = params.driverBrakePressureBar > 0;
    const soc = Math.max(10, Math.min(100, params.batterySocPct));

    // Equivalence Factor s(t) for ECMS Hamiltonian based on SOC deviation from 55% target
    const socTarget = 55.0;
    const sEquiv = 2.45 + (socTarget - soc) * 0.045; // Penalizes electric use when SOC is low

    // 1. Regenerative Braking Mode
    if (isBraking) {
      const regenDemandKw = Math.min(140, params.driverBrakePressureBar * 2.8);
      const p4RegenKw = -regenDemandKw * 0.60;
      const p2RegenKw = -regenDemandKw * 0.40;

      return {
        mode: 'REGENERATIVE_BRAKING',
        driverDemandedPowerKw: 0,
        enginePowerKw: 0,
        engineTorqueNm: 0,
        engineRpm: Math.max(0, params.currentRpm - 200),
        p2MotorPowerKw: Math.round(p2RegenKw),
        p2MotorTorqueNm: Math.round((p2RegenKw * 9550) / Math.max(800, params.currentRpm)),
        p4RearAxlePowerKw: Math.round(p4RegenKw),
        p4RearAxleTorqueNm: Math.round((p4RegenKw * 9550) / Math.max(800, params.currentRpm)),
        batteryNetPowerKw: Math.round(p2RegenKw + p4RegenKw),
        batterySocPct: Math.min(100, soc + 0.02),
        instantaneousFuelRateGPerSec: 0.0,
        equivalentFuelRateGPerSec: 0.0,
        electricTorqueFillActive: false,
      };
    }

    // 2. Drive Power Demand
    const totalPowerDemandKw = (params.driverThrottlePct / 100) * (this.ICE_MAX_POWER_KW + this.P2_MOTOR_MAX_POWER_KW + this.P4_EAXLE_MAX_POWER_KW);

    // 3. Pure EV Low-Speed / Low-Load Mode
    if (totalPowerDemandKw < 45 && soc > 30 && params.vehicleSpeedKmh < 65) {
      const p4Kw = totalPowerDemandKw * 0.70;
      const p2Kw = totalPowerDemandKw * 0.30;

      return {
        mode: 'PURE_ELECTRIC_EV',
        driverDemandedPowerKw: Math.round(totalPowerDemandKw),
        enginePowerKw: 0,
        engineTorqueNm: 0,
        engineRpm: 0,
        p2MotorPowerKw: Math.round(p2Kw),
        p2MotorTorqueNm: Math.round((p2Kw * 9550) / 2500),
        p4RearAxlePowerKw: Math.round(p4Kw),
        p4RearAxleTorqueNm: Math.round((p4Kw * 9550) / 2500),
        batteryNetPowerKw: Math.round(totalPowerDemandKw / 0.92),
        batterySocPct: Math.max(10, soc - 0.015),
        instantaneousFuelRateGPerSec: 0.0,
        equivalentFuelRateGPerSec: Math.round((totalPowerDemandKw / (0.92 * this.LHV_GASOLINE_KJ_PER_G)) * 100) / 100,
        electricTorqueFillActive: false,
      };
    }

    // 4. Boost / Torque Fill / Hybrid Assist
    const turboLag = params.turboSpoolPct < 0.85;
    let p2MotorKw = 0;
    let p4RearKw = 0;
    let iceKw = 0;
    let isTorqueFill = false;

    if (turboLag && params.driverThrottlePct > 60) {
      // Electric instant torque filling during turbo lag spool
      p2MotorKw = Math.min(this.P2_MOTOR_MAX_POWER_KW, 95);
      p4RearKw = Math.min(this.P4_EAXLE_MAX_POWER_KW, 120);
      iceKw = Math.max(0, totalPowerDemandKw - (p2MotorKw + p4RearKw));
      isTorqueFill = true;
    } else {
      // Normal ECMS load balancing
      iceKw = Math.min(this.ICE_MAX_POWER_KW, totalPowerDemandKw * 0.75);
      const remainingKw = Math.max(0, totalPowerDemandKw - iceKw);
      p2MotorKw = remainingKw * 0.40;
      p4RearKw = remainingKw * 0.60;
    }

    // BSFC Fuel calculation (approx 220 g/kWh)
    const fuelRateGPerSec = (iceKw * 220) / 3600;
    const battNetKw = (p2MotorKw + p4RearKw) / 0.92;
    const equivFuelRate = fuelRateGPerSec + (battNetKw * sEquiv) / this.LHV_GASOLINE_KJ_PER_G;

    return {
      mode: 'SERIES_PARALLEL_BOOST',
      driverDemandedPowerKw: Math.round(totalPowerDemandKw),
      enginePowerKw: Math.round(iceKw),
      engineTorqueNm: Math.round((iceKw * 9550) / Math.max(1000, params.currentRpm)),
      engineRpm: params.currentRpm,
      p2MotorPowerKw: Math.round(p2MotorKw),
      p2MotorTorqueNm: Math.round((p2MotorKw * 9550) / Math.max(1000, params.currentRpm)),
      p4RearAxlePowerKw: Math.round(p4RearKw),
      p4RearAxleTorqueNm: Math.round((p4RearKw * 9550) / Math.max(1000, params.currentRpm)),
      batteryNetPowerKw: Math.round(battNetKw),
      batterySocPct: Math.max(10, soc - (battNetKw > 0 ? 0.025 : -0.015)),
      instantaneousFuelRateGPerSec: Math.round(fuelRateGPerSec * 100) / 100,
      equivalentFuelRateGPerSec: Math.round(equivFuelRate * 100) / 100,
      electricTorqueFillActive: isTorqueFill,
    };
  }
}
