// ============================================================================
// PHASE 65 — MULTI-PHYSICS TIRE THERMAL DEGRADATION & WEAR SOLVER
// ============================================================================
// 3-layer thermal network (Tread/Carcass/Gas), temperature-grip bell curve,
// Archard abrasive tread wear, and thermal blistering/graining hazard index.
// ============================================================================

export type TireCompoundType = 'ULTRA_SOFT_QUALIFYING' | 'MEDIUM_CIRCUIT_SLICK' | 'HARD_ENDURANCE_SLICK' | 'ALL_SEASON_ROAD';

export interface TireThermalCornerState {
  corner: 'FL' | 'FR' | 'RL' | 'RR';
  treadBulkTempC: number;
  carcassTempC: number;
  innerGasTempC: number;
  effectiveFrictionMu: number;
  instantaneousWearRateMicronsPerLap: number;
  remainingTreadLifePct: number;
  thermalGripEfficiencyPct: number;
  isOverheatingBlisterRisk: boolean;
  isColdGrainingRisk: boolean;
}

export interface VehicleTireSetThermalState {
  compound: TireCompoundType;
  optimalThermalWindowC: { min: number; max: number };
  fl: TireThermalCornerState;
  fr: TireThermalCornerState;
  rl: TireThermalCornerState;
  rr: TireThermalCornerState;
}

export class TireThermalWearDegradationSolver {
  /**
   * Solves 4-wheel dynamic tire surface/carcass thermals and Archard wear rates.
   */
  public static evaluateTireThermalsAndWear(params: {
    compound?: TireCompoundType;
    wheelSlipRatios: { fl: number; fr: number; rl: number; rr: number };
    wheelSlipAnglesDeg: { fl: number; fr: number; rl: number; rr: number };
    wheelNormalLoadsN: { fl: number; fr: number; rl: number; rr: number };
    vehicleSpeedKmh: number;
    ambientAirTempC?: number;
    previousTreadTempsC?: { fl: number; fr: number; rl: number; rr: number };
    lapsCompleted?: number;
  }): VehicleTireSetThermalState {
    const compound = params.compound || 'MEDIUM_CIRCUIT_SLICK';
    const vSpeedMs = (params.vehicleSpeedKmh * 1000) / 3600;
    const tAmb = params.ambientAirTempC ?? 26.0;
    const laps = params.lapsCompleted || 5;

    // Compound Characteristics
    const compProps = {
      ULTRA_SOFT_QUALIFYING: { peakMu: 1.78, optMin: 85, optMax: 100, wearRate: 48.0 },
      MEDIUM_CIRCUIT_SLICK: { peakMu: 1.62, optMin: 90, optMax: 110, wearRate: 24.0 },
      HARD_ENDURANCE_SLICK: { peakMu: 1.48, optMin: 95, optMax: 118, wearRate: 12.0 },
      ALL_SEASON_ROAD: { peakMu: 1.15, optMin: 45, optMax: 80, wearRate: 4.5 },
    }[compound];

    const evaluateCorner = (
      cornerName: 'FL' | 'FR' | 'RL' | 'RR',
      slipK: number,
      alphaDeg: number,
      fzN: number,
      prevTreadC = 85.0
    ): TireThermalCornerState => {
      // 1. Sliding Velocity: v_slip = sqrt((v_x * kappa)^2 + (v_x * tan(alpha))^2)
      const slipLateral = Math.tan((alphaDeg * Math.PI) / 180);
      const vSlipMs = vSpeedMs * Math.sqrt(Math.pow(slipK, 2) + Math.pow(slipLateral, 2));

      // 2. Frictional Heat Generation: Q_gen = mu * Fz * v_slip
      const qGenWatts = compProps.peakMu * fzN * vSlipMs * 0.45; // 45% partition into rubber

      // 3. Convective Air Cooling: Q_conv = h_air * A * (T_tread - T_amb)
      const hConv = 15.0 + 4.2 * Math.pow(vSpeedMs, 0.78);
      const contactAreaM2 = 0.045; // 450 cm^2
      const qConvWatts = hConv * contactAreaM2 * (prevTreadC - tAmb);

      // 4. Tread Temperature Dynamics: dT/dt = (Q_gen - Q_conv) / (m_rubber * c_p)
      const mRubberKg = 1.8; // Outer tread cap mass
      const cpRubber = 1800; // J/(kg*K)
      const deltaTC = ((qGenWatts - qConvWatts) * 0.1) / (mRubberKg * cpRubber);
      const treadTemp = Math.max(tAmb, Math.min(160, prevTreadC + deltaTC));

      // Carcass and Inner Gas Cavity conduction lags
      const carcassTemp = tAmb + (treadTemp - tAmb) * 0.72;
      const gasTemp = tAmb + (treadTemp - tAmb) * 0.55;

      // 5. Temperature-Grip Bell Curve (Parabolic degradation outside window)
      const midOpt = (compProps.optMin + compProps.optMax) / 2;
      const halfWidth = (compProps.optMax - compProps.optMin) / 2;
      const deltaTFromOpt = Math.abs(treadTemp - midOpt);

      let gripEff = 1.0;
      if (deltaTFromOpt > halfWidth) {
        const excess = deltaTFromOpt - halfWidth;
        gripEff = Math.max(0.65, 1.0 - Math.pow(excess / 35, 1.8));
      }
      const actualMu = compProps.peakMu * gripEff;

      // 6. Archard Abrasive Wear Rate (Microns per lap)
      const wearPerLap = compProps.wearRate * (fzN / 4000) * (1 + Math.pow(vSlipMs, 1.2));
      const totalWearMm = (wearPerLap * laps) / 1000;
      const initialTreadDepthMm = 4.5;
      const remainingLifePct = Math.max(0, ((initialTreadDepthMm - totalWearMm) / initialTreadDepthMm) * 100);

      return {
        corner: cornerName,
        treadBulkTempC: Math.round(treadTemp * 10) / 10,
        carcassTempC: Math.round(carcassTemp * 10) / 10,
        innerGasTempC: Math.round(gasTemp * 10) / 10,
        effectiveFrictionMu: Math.round(actualMu * 1000) / 1000,
        instantaneousWearRateMicronsPerLap: Math.round(wearPerLap * 10) / 10,
        remainingTreadLifePct: Math.round(remainingLifePct * 10) / 10,
        thermalGripEfficiencyPct: Math.round(gripEff * 1000) / 10,
        isOverheatingBlisterRisk: treadTemp > compProps.optMax + 20,
        isColdGrainingRisk: treadTemp < compProps.optMin - 25,
      };
    };

    const prev = params.previousTreadTempsC || { fl: 88, fr: 92, rl: 86, rr: 90 };

    return {
      compound,
      optimalThermalWindowC: { min: compProps.optMin, max: compProps.optMax },
      fl: evaluateCorner('FL', params.wheelSlipRatios.fl, params.wheelSlipAnglesDeg.fl, params.wheelNormalLoadsN.fl, prev.fl),
      fr: evaluateCorner('FR', params.wheelSlipRatios.fr, params.wheelSlipAnglesDeg.fr, params.wheelNormalLoadsN.fr, prev.fr),
      rl: evaluateCorner('RL', params.wheelSlipRatios.rl, params.wheelSlipAnglesDeg.rl, params.wheelNormalLoadsN.rl, prev.rl),
      rr: evaluateCorner('RR', params.wheelSlipRatios.rr, params.wheelSlipAnglesDeg.rr, params.wheelNormalLoadsN.rr, prev.rr),
    };
  }
}
