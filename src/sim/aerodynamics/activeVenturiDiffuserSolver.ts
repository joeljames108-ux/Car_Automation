// ============================================================================
// PHASE 64 — ACTIVE UNDERBODY VENTURI DIFFUSER & GROUND EFFECT SOLVER
// ============================================================================
// Bernoulli ground-effect suction pressure Cp(x), dynamic ride height sensitivity,
// diffuser ramp stall prevention, and multi-channel vortex sealing strakes.
// ============================================================================

export interface UnderbodyVenturiState {
  groundClearanceFrontMm: number;
  groundClearanceRearMm: number;
  diffuserRampAngleDeg: number;
  isDiffuserStalled: boolean;
  throatSuctionCpMin: number;
  totalUnderbodyDownforceN: number;
  centerOfPressurePctFront: number;
  groundEffectEfficiencyLOverD: number;
  vortexSealIntensityPct: number;
}

export class ActiveVenturiDiffuserSolver {
  private static readonly AIR_DENSITY_KG_M3 = 1.225;
  private static readonly UNDERBODY_AREA_M2 = 2.45;
  private static readonly THROAT_CHORD_RATIO = 0.38; // 38% chord location for throat

  /**
   * Solves non-linear ground effect suction and active diffuser aerodynamics.
   */
  public static solveGroundEffectAerodynamics(params: {
    vehicleSpeedKmh: number;
    frontRideHeightMm?: number;
    rearRideHeightMm?: number;
    diffuserRampAngleDeg?: number;
    activeStrakesDeployed?: boolean;
  }): UnderbodyVenturiState {
    const vKmh = params.vehicleSpeedKmh;
    const vMs = (vKmh * 1000) / 3600;
    const hF = params.frontRideHeightMm ?? 35; // 35mm racing ride height
    const hR = params.rearRideHeightMm ?? 55;
    const rampDeg = params.diffuserRampAngleDeg ?? 11.5;
    const strakes = params.activeStrakesDeployed ?? true;

    // Dynamic Pressure: q = 0.5 * rho * v^2
    const qInf = 0.5 * this.AIR_DENSITY_KG_M3 * Math.pow(vMs, 2);

    // 1. Throat Ground Proximity Acceleration (Bernoulli 1D Channel Flow)
    // Suction increases as throat clearance h_throat decreases down to critical height h_crit ~ 18mm
    const hThroatMm = Math.max(12, hF * 0.92);
    const groundProximityGain = Math.min(3.8, Math.pow(65 / hThroatMm, 0.72));

    // 2. Diffuser Ramp Expansion Angle Stall Modeling
    // Ideal diffuser expansion angle 9-13 deg; stall occurs above 14.5 deg without suction
    const isStalled = rampDeg > 14.5 && !strakes;
    const rampExpansionFactor = isStalled
      ? 0.45 // Severe flow separation and loss of downforce
      : Math.sin((rampDeg * Math.PI) / 180) * 3.85;

    // 3. Peak Throat Suction Coefficient: Cp_min = 1 - (A_inf / A_throat)^2
    const cpMin = -1.25 * groundProximityGain * (isStalled ? 0.4 : 1.0);

    // 4. Vortex Sealing Intensity (Active Strakes prevent lateral pressure leakage)
    const sealIntensity = strakes ? 94.5 : 62.0;
    const sealFactor = sealIntensity / 100;

    // 5. Total Underbody Downforce
    // Cl_underbody = |Cp_avg| * Area
    const clUnderbody = Math.abs(cpMin) * 0.68 * rampExpansionFactor * sealFactor;
    const downforceN = qInf * clUnderbody * this.UNDERBODY_AREA_M2;

    // Induced Drag from ground effect is extremely low (high L/D ratio)
    const cdUnderbody = 0.045 + Math.pow(clUnderbody, 2) / (Math.PI * 4.5 * 0.95);
    const lOverD = clUnderbody / Math.max(0.01, cdUnderbody);

    // 6. Center of Pressure (CP_x) Location (% from front axle)
    // Pitch sensitivity shifts CP rearward as diffuser angle increases
    const cpFrontPct = Math.max(38, Math.min(58, 48.5 - (rampDeg - 10) * 0.85 + (hR - hF) * 0.15));

    return {
      groundClearanceFrontMm: hF,
      groundClearanceRearMm: hR,
      diffuserRampAngleDeg: rampDeg,
      isDiffuserStalled: isStalled,
      throatSuctionCpMin: Math.round(cpMin * 100) / 100,
      totalUnderbodyDownforceN: Math.round(downforceN),
      centerOfPressurePctFront: Math.round(cpFrontPct * 10) / 10,
      groundEffectEfficiencyLOverD: Math.round(lOverD * 10) / 10,
      vortexSealIntensityPct: sealIntensity,
    };
  }
}
