// ============================================================================
// PHASE 76 — ACTIVE FRONT SPLITTER & HOOD S-DUCT AERODYNAMIC SOLVER
// ============================================================================
// Active extending front splitter (+60mm / -4 deg), internal radiator hood S-Duct,
// stagnation pressure bleeding, and high-speed aero pitch balance control.
// ============================================================================

export type ActiveSplitterMode = 'TRACK_EXTENDED_DOWNFORCE' | 'STREET_RETRACTED_CLEARANCE' | 'DRS_HIGH_SPEED_TRIM';

export interface ActiveAeroFrontState {
  splitterMode: ActiveSplitterMode;
  splitterExtensionMm: number;
  splitterPitchAngleDeg: number;
  sDuctAirflowMassFlowKgS: number;
  frontSplitterDownforceN: number;
  hoodSDuctDownforceN: number;
  totalFrontAeroLoadN: number;
  aerodynamicPitchBalanceFrontPct: number; // Target 42-48% front
  aerodynamicDragN: number;
  isFrontAxleLiftNeutralized: boolean;
}

export class ActiveFrontSplitterSDuctSolver {
  private static readonly AIR_DENSITY_KG_M3 = 1.225;
  private static readonly FRONT_REFERENCE_AREA_M2 = 1.15;
  private static readonly S_DUCT_CROSS_SECTION_M2 = 0.28;

  /**
   * Solves active splitter kinematics, S-Duct flow throughput, and front aero load.
   */
  public static evaluateFrontAerodynamics(params: {
    vehicleSpeedKmh: number;
    mode?: ActiveSplitterMode;
    rearWingDownforceN?: number;
  }): ActiveAeroFrontState {
    const vSpeedKmh = params.vehicleSpeedKmh;
    const vMs = (vSpeedKmh * 1000) / 3600;
    const mode = params.mode || 'TRACK_EXTENDED_DOWNFORCE';
    const rearDownforceN = params.rearWingDownforceN || 2800.0;

    // Dynamic Pressure: q = 0.5 * rho * v^2
    const qInf = 0.5 * this.AIR_DENSITY_KG_M3 * Math.pow(vMs, 2);

    // 1. Splitter Actuator Position Kinematics
    const extensionMm = mode === 'TRACK_EXTENDED_DOWNFORCE' ? 60.0 : (mode === 'DRS_HIGH_SPEED_TRIM' ? 20.0 : 0.0);
    const pitchDeg = mode === 'TRACK_EXTENDED_DOWNFORCE' ? -3.5 : 0.0;

    // 2. Hood S-Duct Mass Flow (Pumps air from high-pressure grille to low-pressure hood)
    // DeltaP_grille_hood ~ 0.65 * qInf
    const deltaPPa = 0.65 * qInf;
    const sDuctVelocityMs = Math.sqrt((2 * deltaPPa) / this.AIR_DENSITY_KG_M3);
    const sDuctMassFlow = this.AIR_DENSITY_KG_M3 * this.S_DUCT_CROSS_SECTION_M2 * sDuctVelocityMs * 0.82;

    // 3. Front Splitter Downforce: Cl_splitter scales with extension & pitch
    const clSplitterBase = 0.42;
    const clSplitterExt = (extensionMm / 60.0) * 0.35 + Math.abs(pitchDeg / 4.0) * 0.22;
    const clSplitterTotal = clSplitterBase + clSplitterExt;
    const splitterDownforceN = qInf * clSplitterTotal * this.FRONT_REFERENCE_AREA_M2;

    // 4. S-Duct Downforce (Momentum deflection over hood exit ramp: F_z = m_dot * v * sin(theta))
    const rampAngleRad = 28 * (Math.PI / 180);
    const sDuctDownforceN = sDuctMassFlow * sDuctVelocityMs * Math.sin(rampAngleRad);

    const totalFrontLoadN = splitterDownforceN + sDuctDownforceN;

    // 5. Total Aero Pitch Balance Front %
    const totalCarDownforceN = totalFrontLoadN + rearDownforceN;
    const frontPct = (totalFrontLoadN / Math.max(1, totalCarDownforceN)) * 100;

    // Front drag contribution
    const cdFront = 0.065 + clSplitterTotal * 0.12;
    const dragN = qInf * cdFront * this.FRONT_REFERENCE_AREA_M2;

    return {
      splitterMode: mode,
      splitterExtensionMm: extensionMm,
      splitterPitchAngleDeg: pitchDeg,
      sDuctAirflowMassFlowKgS: Math.round(sDuctMassFlow * 10) / 10,
      frontSplitterDownforceN: Math.round(splitterDownforceN),
      hoodSDuctDownforceN: Math.round(sDuctDownforceN),
      totalFrontAeroLoadN: Math.round(totalFrontLoadN),
      aerodynamicPitchBalanceFrontPct: Math.round(frontPct * 10) / 10,
      aerodynamicDragN: Math.round(dragN),
      isFrontAxleLiftNeutralized: totalFrontLoadN > 0,
    };
  }
}
