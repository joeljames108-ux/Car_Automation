// ============================================================================
// MODULE 3: COMPUTATIONAL AERODYNAMICS & GROUND EFFECT PORPOISING ENGINE
// ============================================================================
// Aerodynamics simulation engine incorporating:
// 1. Non-linear aero polars dependent on front/rear ride heights, pitch & roll
// 2. Ground effect venturi tunnels with diffuser area ratio & suction gradient
// 3. Diffuser boundary layer stall & hysteretic flow reattachment
// 4. Aeroelastic porpoising limit-cycle oscillation solver (heave/pitch coupled)
// 5. Drag Reduction System (DRS) transient flow detachment & actuator dynamics
// 6. Crosswind yaw aerodynamics (side force Cs, yawing moment Cn, CoP migration)
// 7. Internal radiator, intercooler & brake cooling duct momentum drag
// ============================================================================

export interface AeroMapDefinition {
  baseClFront: number;         // e.g. 1.25
  baseClRear: number;          // e.g. 1.85
  baseCd: number;              // e.g. 0.38
  frontalAreaM2: number;       // e.g. 1.95 m2
  groundEffectSuctionFactor: number; // e.g. 2.2
  diffuserStallRideHeightM: number;  // Critical clearance below which stall occurs (e.g. 0.018 m)
  diffuserReattachRideHeightM: number; // Hysteresis reattachment clearance (e.g. 0.026 m)
  pitchSensitivityClPerDeg: number;  // dCl/dPitch (e.g. 0.15)
  rollSensitivityClPerDeg: number;   // dCl/dRoll (e.g. -0.06)
  drsDragReductionPct: number;       // e.g. 24.0%
  drsDownforceLossPct: number;       // e.g. 32.0%
  coolingRadiatorAreaM2: number;     // e.g. 0.42 m2
  coolingBrakeDuctAreaM2: number;    // e.g. 0.08 m2
}

export interface AeroOperatingConditions {
  vehicleSpeedMs: number;
  frontRideHeightM: number;
  rearRideHeightM: number;
  pitchAngleDeg: number;
  rollAngleDeg: number;
  yawAngleBetaDeg: number;     // Side-slip / crosswind angle
  isDrsActive: boolean;
  drsActuationProgress: number; // 0 to 1.0 (transient actuator state)
  ambientAirDensityKgM3: number;// e.g. 1.225 kg/m3
  dtSeconds: number;
}

export interface AeroForceOutput {
  downforceFrontN: number;
  downforceRearN: number;
  totalDownforceN: number;
  totalDragForceN: number;
  sideForceN: number;
  yawingMomentNm: number;
  centerOfPressureFrontPct: number; // % of total downforce acting on front axle
  liftToDragRatio: number;          // -L/D efficiency
  isDiffuserStalled: boolean;
  porpoisingOscillationDetected: boolean;
  porpoisingFrequencyHz: number;
  porpoisingAmplitudeMm: number;
  coolingDuctDragN: number;
  drsEffectiveDragReductionPct: number;
}

export class ComputationalAeroDynamics {
  private static isCurrentlyStalled: boolean = false;
  private static oscillationHistory: number[] = [];

  /**
   * Resets aerodynamic state history.
   */
  public static resetAeroState(): void {
    ComputationalAeroDynamics.isCurrentlyStalled = false;
    ComputationalAeroDynamics.oscillationHistory = [];
  }

  /**
   * Computes complete aerodynamic forces, ground effect downforce, diffuser stall,
   * porpoising dynamics, and DRS actuator transients.
   */
  public static evaluateAerodynamics(
    aeroMap: AeroMapDefinition,
    cond: AeroOperatingConditions
  ): AeroForceOutput {
    const v = Math.max(0.1, cond.vehicleSpeedMs);
    const rho = cond.ambientAirDensityKgM3;
    const dynamicPressure = 0.5 * rho * Math.pow(v, 2);
    const A = aeroMap.frontalAreaM2;

    // ------------------------------------------------------------------------
    // 1. GROUND EFFECT VENTURI TUNNEL SCALING & DIFFUSER STALL HYSTERESIS
    // ------------------------------------------------------------------------
    // Ground effect suction increases exponentially as clearance decreases:
    // Cl_underbody = Cl_base * (1 + k / h^0.65)
    const effectiveRideHeightFront = Math.max(0.005, cond.frontRideHeightM);
    const effectiveRideHeightRear = Math.max(0.008, cond.rearRideHeightM);
    const meanFloorClearance = (effectiveRideHeightFront + effectiveRideHeightRear) / 2.0;

    // Diffuser stall hysteresis detection:
    // If clearance drops below stall height, flow detaches.
    // Flow only reattaches when clearance rises above reattach height.
    if (!ComputationalAeroDynamics.isCurrentlyStalled && meanFloorClearance <= aeroMap.diffuserStallRideHeightM) {
      ComputationalAeroDynamics.isCurrentlyStalled = true;
    } else if (ComputationalAeroDynamics.isCurrentlyStalled && meanFloorClearance >= aeroMap.diffuserReattachRideHeightM) {
      ComputationalAeroDynamics.isCurrentlyStalled = false;
    }

    const isStalled = ComputationalAeroDynamics.isCurrentlyStalled;

    // Underbody ground effect multiplier
    let groundEffectMult = 1.0 + (aeroMap.groundEffectSuctionFactor * 0.025) / Math.pow(meanFloorClearance, 0.65);
    if (isStalled) {
      // Severe flow breakdown: lose 50% underbody suction and induce turbulent wake
      groundEffectMult *= 0.48;
    }

    // ------------------------------------------------------------------------
    // 2. NON-LINEAR CL AND CD COEFFICIENTS
    // ------------------------------------------------------------------------
    // Front and rear downforce coefficients with pitch and roll sensitivity
    const rakeAngleDeg = ((effectiveRideHeightRear - effectiveRideHeightFront) / 2.7) * (180.0 / Math.PI);
    const rakeBonusCl = Math.max(-0.2, Math.min(0.6, rakeAngleDeg * 0.18));

    let clFront = (aeroMap.baseClFront * groundEffectMult) + rakeBonusCl;
    let clRear = (aeroMap.baseClRear * groundEffectMult) - rakeBonusCl * 0.4;

    // Pitch sensitivity (nose down increases front Cl, decreases rear)
    clFront += cond.pitchAngleDeg * aeroMap.pitchSensitivityClPerDeg;
    clRear -= cond.pitchAngleDeg * (aeroMap.pitchSensitivityClPerDeg * 0.6);

    // Roll sensitivity (chassis roll sheds aerodynamic efficiency)
    const rollPenalty = Math.abs(cond.rollAngleDeg) * Math.abs(aeroMap.rollSensitivityClPerDeg);
    clFront = Math.max(0.1, clFront - rollPenalty);
    clRear = Math.max(0.1, clRear - rollPenalty);

    // Drag coefficient with induced drag from lift: Cd = Cd0 + k * Cl^2
    const inducedDragFactor = 0.042;
    const totalClNominal = clFront + clRear;
    let cdTotal = aeroMap.baseCd + inducedDragFactor * Math.pow(totalClNominal, 2);

    if (isStalled) {
      // Diffuser boundary layer separation adds massive form drag
      cdTotal += 0.14;
    }

    // ------------------------------------------------------------------------
    // 3. DRAG REDUCTION SYSTEM (DRS) FLAP TRANSIENTS
    // ------------------------------------------------------------------------
    let effectiveDrsReductionPct = 0;
    if (cond.isDrsActive && cond.drsActuationProgress > 0.05) {
      const flapOpenRatio = Math.max(0, Math.min(1.0, cond.drsActuationProgress));
      effectiveDrsReductionPct = aeroMap.drsDragReductionPct * flapOpenRatio;
      const downforceReductionPct = aeroMap.drsDownforceLossPct * flapOpenRatio;

      cdTotal *= (1.0 - effectiveDrsReductionPct / 100.0);
      clRear *= (1.0 - downforceReductionPct / 100.0);
    }

    // ------------------------------------------------------------------------
    // 4. CROSSWIND YAW AERODYNAMICS (Side force & Yaw moment)
    // ------------------------------------------------------------------------
    const betaRad = (cond.yawAngleBetaDeg * Math.PI) / 180.0;
    // Side force coefficient Cs = 2.1 * sin(beta)
    const cs = 2.15 * Math.sin(betaRad);
    const sideForceN = dynamicPressure * A * cs;

    // Yawing moment coefficient Cn = 0.45 * sin(2 * beta) (destabilizing yaw moment)
    const cn = 0.42 * Math.sin(2.0 * betaRad);
    const yawingMomentNm = dynamicPressure * A * 2.7 * cn;

    // Yaw angle reduces effective downforce and increases total drag
    const yawAeroLoss = Math.cos(betaRad);
    clFront *= yawAeroLoss;
    clRear *= yawAeroLoss;
    cdTotal += 0.05 * Math.abs(Math.sin(betaRad));

    // ------------------------------------------------------------------------
    // 5. INTERNAL COOLING DUCT MOMENTUM DRAG
    // ------------------------------------------------------------------------
    // Ram air enters cooling ducts and slows down, producing momentum drag:
    // F_cooling = rho * A_duct * v^2 * K_loss
    const totalCoolingArea = aeroMap.coolingRadiatorAreaM2 + aeroMap.coolingBrakeDuctAreaM2;
    const ductLossCoeff = 0.72;
    const coolingDuctDragN = dynamicPressure * totalCoolingArea * ductLossCoeff;

    // ------------------------------------------------------------------------
    // 6. TOTAL FORCES AND CENTER OF PRESSURE
    // ------------------------------------------------------------------------
    const dfFrontN = dynamicPressure * A * clFront;
    const dfRearN = dynamicPressure * A * clRear;
    const totalDownforceN = dfFrontN + dfRearN;
    const totalDragForceN = (dynamicPressure * A * cdTotal) + coolingDuctDragN;

    const copFrontPct = totalDownforceN > 10.0
      ? (dfFrontN / totalDownforceN) * 100.0
      : 50.0;

    const liftToDragRatio = totalDragForceN > 1.0
      ? totalDownforceN / totalDragForceN
      : 0;

    // ------------------------------------------------------------------------
    // 7. PORPOISING & AEROELASTIC COUPLING DETECTION
    // ------------------------------------------------------------------------
    // Track floor clearance oscillations at high speeds (>240 km/h)
    let porpoisingDetected = false;
    let porpFrequencyHz = 0;
    let porpAmplitudeMm = 0;

    if (v > 65.0) { // >234 km/h
      ComputationalAeroDynamics.oscillationHistory.push(meanFloorClearance);
      if (ComputationalAeroDynamics.oscillationHistory.length > 50) {
        ComputationalAeroDynamics.oscillationHistory.shift();
      }

      // Detect periodic limit cycles (peaks and troughs)
      if (ComputationalAeroDynamics.oscillationHistory.length >= 30) {
        let reversals = 0;
        let minH = 1.0;
        let maxH = 0.0;

        for (let i = 1; i < ComputationalAeroDynamics.oscillationHistory.length - 1; i++) {
          const prev = ComputationalAeroDynamics.oscillationHistory[i - 1];
          const curr = ComputationalAeroDynamics.oscillationHistory[i];
          const next = ComputationalAeroDynamics.oscillationHistory[i + 1];

          if (curr < minH) minH = curr;
          if (curr > maxH) maxH = curr;

          if ((curr > prev && curr > next) || (curr < prev && curr < next)) {
            reversals++;
          }
        }

        porpAmplitudeMm = (maxH - minH) * 1000.0;
        if (reversals >= 5 && porpAmplitudeMm >= 8.0) {
          porpoisingDetected = true;
          porpFrequencyHz = (reversals / 2.0) / (ComputationalAeroDynamics.oscillationHistory.length * Math.max(0.01, cond.dtSeconds));
        }
      }
    } else {
      ComputationalAeroDynamics.oscillationHistory = [];
    }

    return {
      downforceFrontN: Number(dfFrontN.toFixed(1)),
      downforceRearN: Number(dfRearN.toFixed(1)),
      totalDownforceN: Number(totalDownforceN.toFixed(1)),
      totalDragForceN: Number(totalDragForceN.toFixed(1)),
      sideForceN: Number(sideForceN.toFixed(1)),
      yawingMomentNm: Number(yawingMomentNm.toFixed(1)),
      centerOfPressureFrontPct: Number(copFrontPct.toFixed(2)),
      liftToDragRatio: Number(liftToDragRatio.toFixed(3)),
      isDiffuserStalled: isStalled,
      porpoisingOscillationDetected: porpoisingDetected,
      porpoisingFrequencyHz: Number(porpFrequencyHz.toFixed(1)),
      porpoisingAmplitudeMm: Number(porpAmplitudeMm.toFixed(1)),
      coolingDuctDragN: Number(coolingDuctDragN.toFixed(1)),
      drsEffectiveDragReductionPct: Number(effectiveDrsReductionPct.toFixed(1)),
    };
  }
}
