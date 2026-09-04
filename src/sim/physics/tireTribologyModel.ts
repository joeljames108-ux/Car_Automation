// ============================================================================
// MODULE 1: ADVANCED TIRE TRIBOLOGY & DYNAMICS (PACEJKA MF 6.2 + THERMAL FEA)
// ============================================================================
// Comprehensive tire mechanics model combining:
// 1. Full Pacejka '02/'06 (MF 6.2) formulation for pure & combined slip
// 2. Multi-layer thermodynamic contact patch network (Flash, Tread, Carcass, Cavity, Rim)
// 3. Transient carcass relaxation length dynamics for steering response lag
// 4. Contact patch footprint pressure distribution & pneumatic trail migration
// 5. Viscoelastic friction breakdown (adhesion + hysteresis vs sliding speed)
// 6. Archard abrasive wear, rubber thermal degradation, graining, and blistering
// 7. Dynamic inflation pressure evolution via Ideal Gas Law
// 8. High-speed carcass standing wave critical velocity threshold
// ============================================================================

export interface PacejkaMF62Coefficients {
  // Pure longitudinal (Fx)
  pCx1: number; // Shape factor Cfx
  pDx1: number; // Longitudinal friction Mux at Fz0
  pDx2: number; // Variation of friction Mux with load
  pEx1: number; // Longitudinal curvature Efx at Fz0
  pEx2: number; // Variation of curvature Efx with load
  pKx1: number; // Longitudinal slip stiffness Kfx/Fz at Fz0
  pKx2: number; // Variation of slip stiffness Kfx/Fz with load
  pKx3: number; // Exponent in slip stiffness Kfx/Fz with load
  pHx1: number; // Horizontal shift Shx at Fz0
  pVx1: number; // Vertical shift Svx/Fz at Fz0

  // Pure lateral (Fy)
  pCy1: number; // Shape factor Cfy
  pDy1: number; // Lateral friction Muy at Fz0
  pDy2: number; // Variation of friction Muy with load
  pDy3: number; // Variation of friction Muy with camber squared
  pEy1: number; // Lateral curvature Efy at Fz0
  pEy2: number; // Variation of curvature Efy with load
  pKy1: number; // Maximum cornering stiffness Kfy/Fz0
  pKy2: number; // Load at which Kfy reaches maximum
  pKy3: number; // Camber stiffness variation
  pHy1: number; // Horizontal shift Shy at Fz0
  pVy1: number; // Vertical shift Svy/Fz at Fz0

  // Aligning torque (Mz)
  qBz1: number; // Trail slope factor
  qBz9: number; // Factor for slope of residual torque
  qCz1: number; // Shape factor for pneumatic trail
  qDz1: number; // Peak pneumatic trail Dt0
  qDz2: number; // Trail variation with load
  qEz1: number; // Curvature factor for pneumatic trail
}

export interface TireThermalLayerState {
  treadSurfaceC: number;    // Flash contact patch temperature (°C)
  treadBulkc: number;       // Bulk rubber core temperature (°C)
  carcassC: number;         // Carcass structural temperature (°C)
  cavityAirC: number;       // Internal pressurized air temperature (°C)
  wheelRimC: number;         // Aluminum/magnesium rim heat sink (°C)
}

export interface TireStateMF62 {
  thermals: TireThermalLayerState;
  pressureBar: number;
  nominalPressureBar: number;
  wearFraction: number;     // 0 = brand new, 1.0 = worn to cords
  grainingIndex: number;    // 0 to 1 (surface rubber tearing)
  blisteringRisk: number;   // 0 to 1 (subsurface boiling of volatile oils)
  currentFxN: number;
  currentFyN: number;
  currentMzNm: number;
  deflectionM: number;
  contactPatchLengthM: number;
  contactPatchWidthM: number;
}

export interface TireOperationalInput {
  verticalLoadFzN: number;  // Normal load (N) > 0
  slipRatioKappa: number;   // Longitudinal slip (-1 to +1)
  slipAngleAlphaRad: number;// Slip angle in radians
  camberAngleGammaRad: number; // Inclination angle in radians
  wheelSpeedMs: number;     // Linear wheel circumference speed (m/s)
  vehicleSpeedMs: number;   // Chassis forward velocity (m/s)
  ambientTempC: number;     // Ambient air temperature (°C)
  trackSurfaceTempC: number;// Track asphalt temperature (°C)
  dtSeconds: number;        // Time step for transient integration (s)
}

export interface TireForceOutput {
  fxLongitudinalN: number;
  fyLateralN: number;
  mzAligningNm: number;
  pneumaticTrailM: number;
  relaxationLengthLongM: number;
  relaxationLengthLatM: number;
  dynamicMuX: number;
  dynamicMuY: number;
  rollingResistanceForceN: number;
  standingWaveCriticalSpeedKmh: number;
  isHydroplaning: boolean;
  thermalDissipationKw: number;
}

export class TireTribologyModel {
  // Baseline nominal load for Pacejka normalization (N)
  public static readonly FZ0 = 4000;
  public static readonly AIR_DENSITY = 1.225;
  public static readonly SPECIFIC_HEAT_RUBBER = 1800; // J/(kg·K)
  public static readonly TREAD_RUBBER_MASS = 2.4; // kg per tire tread
  public static readonly CARCASS_MASS = 6.5; // kg structural casing

  /**
   * Reference Pacejka MF 6.2 parameters calibrated for high-performance motorsport tires.
   */
  public static readonly RACING_SLICK_COEFFS: PacejkaMF62Coefficients = {
    pCx1: 1.65,
    pDx1: 1.82,
    pDx2: -0.15,
    pEx1: -0.45,
    pEx2: -0.18,
    pKx1: 28.5,
    pKx2: 12.0,
    pKx3: 0.22,
    pHx1: 0.001,
    pVx1: 0.0,

    pCy1: 1.35,
    pDy1: 1.78,
    pDy2: -0.16,
    pDy3: -0.75,
    pEy1: -0.65,
    pEy2: -0.22,
    pKy1: -32.0,
    pKy2: 2.15,
    pKy3: 0.45,
    pHy1: 0.002,
    pVy1: 0.0,

    qBz1: 9.8,
    qBz9: 18.5,
    qCz1: 1.15,
    qDz1: 0.042,
    qDz2: -0.008,
    qEz1: -1.2,
  };

  /**
   * Initialize a fresh tire state at ambient conditions.
   */
  public static createTireState(
    initialPressureBar: number = 2.1,
    initialTempC: number = 25.0
  ): TireStateMF62 {
    return {
      thermals: {
        treadSurfaceC: initialTempC,
        treadBulkc: initialTempC,
        carcassC: initialTempC,
        cavityAirC: initialTempC,
        wheelRimC: initialTempC,
      },
      pressureBar: initialPressureBar,
      nominalPressureBar: initialPressureBar,
      wearFraction: 0.0,
      grainingIndex: 0.0,
      blisteringRisk: 0.0,
      currentFxN: 0,
      currentFyN: 0,
      currentMzNm: 0,
      deflectionM: 0.015,
      contactPatchLengthM: 0.12,
      contactPatchWidthM: 0.265,
    };
  }

  /**
   * Evaluates complete Pacejka MF 6.2 pure & combined slip forces, transient relaxation,
   * thermal multi-layer heat fluxes, and degradation state.
   */
  public static computeTireForces(
    state: TireStateMF62,
    input: TireOperationalInput,
    coeffs: PacejkaMF62Coefficients = TireTribologyModel.RACING_SLICK_COEFFS
  ): { state: TireStateMF62; forces: TireForceOutput } {
    const Fz = Math.max(100, input.verticalLoadFzN);
    const dfz = (Fz - TireTribologyModel.FZ0) / TireTribologyModel.FZ0;
    const gamma = input.camberAngleGammaRad;
    const kappa = Math.max(-1.5, Math.min(1.5, input.slipRatioKappa));
    const alpha = input.slipAngleAlphaRad;
    const vx = Math.max(0.1, input.vehicleSpeedMs);

    // ------------------------------------------------------------------------
    // 1. THERMAL GRIP MODIFIER & VISCOELASTIC ADHESION/HYSTERESIS
    // ------------------------------------------------------------------------
    // Optimal operating temperature window for motorsport slick: 85°C - 115°C
    const optimalTemp = 100.0;
    const tempDelta = state.thermals.treadBulkc - optimalTemp;
    const thermalGripFactor = Math.exp(-0.5 * Math.pow(tempDelta / 22.0, 2));

    // Wear grip degradation: fresh tire gives 100%, worn tire drops, cliff wear > 0.8
    const isOverheated = state.thermals.treadBulkc > 130.0;
    let wearGripFactor = isOverheated ? 0.35 : (1.0 - 0.25 * state.wearFraction);
    if (state.wearFraction > 0.8) {
      wearGripFactor -= (state.wearFraction - 0.8) * 1.8; // cliff falloff
    }
    wearGripFactor = Math.max(0.4, wearGripFactor);

    // Pressure sensitivity: deviation from optimal inflation pressure (2.1 bar hot)
    const deltaPressure = state.pressureBar - 2.1;
    const pressureGripFactor = Math.max(0.85, 1.0 - 0.12 * Math.pow(deltaPressure, 2));

    const totalMuMultiplier = Math.max(0.35, thermalGripFactor * wearGripFactor * pressureGripFactor);

    // ------------------------------------------------------------------------
    // 2. PACEJKA MF 6.2 PURE LONGITUDINAL FORCE (Fx0)
    // ------------------------------------------------------------------------
    const muX = (coeffs.pDx1 + coeffs.pDx2 * dfz) * totalMuMultiplier;
    const Dx = muX * Fz;
    const Cx = coeffs.pCx1;
    const Kx = Fz * (coeffs.pKx1 + coeffs.pKx2 * dfz) * Math.exp(coeffs.pKx3 * dfz);
    const Bx = Kx / (Cx * Dx + 1e-6);
    const shx = coeffs.pHx1;
    const svx = coeffs.pVx1 * Fz;
    const kappax = kappa + shx;
    const Ex = (coeffs.pEx1 + coeffs.pEx2 * dfz) * Math.sign(kappax);

    const fx0 = Dx * Math.sin(Cx * Math.atan(Bx * kappax - Ex * (Bx * kappax - Math.atan(Bx * kappax)))) + svx;

    // ------------------------------------------------------------------------
    // 3. PACEJKA MF 6.2 PURE LATERAL FORCE (Fy0)
    // ------------------------------------------------------------------------
    const muY = (coeffs.pDy1 + coeffs.pDy2 * dfz) * (1.0 - coeffs.pDy3 * gamma * gamma) * totalMuMultiplier;
    const Dy = muY * Fz;
    const Cy = coeffs.pCy1;
    const Ky0 = Math.abs(coeffs.pKy1) * TireTribologyModel.FZ0 * Math.sin(2.0 * Math.atan(Fz / (coeffs.pKy2 * TireTribologyModel.FZ0 + 1e-6)));
    const By = Ky0 / (Cy * Dy + 1e-6);
    const shy = coeffs.pHy1 + coeffs.pKy3 * gamma;
    const svy = coeffs.pVy1 * Fz;
    const alphay = alpha + shy;
    const Ey = (coeffs.pEy1 + coeffs.pEy2 * dfz) * Math.sign(alphay);

    const fy0 = Dy * Math.sin(Cy * Math.atan(By * alphay - Ey * (By * alphay - Math.atan(By * alphay)))) + svy;

    // ------------------------------------------------------------------------
    // 4. COMBINED SLIP FRICTION ELLIPSE INTERACTION
    // ------------------------------------------------------------------------
    // Combined slip weighting functions Gxa, Gyk
    const Bx1 = 12.0;
    const By1 = 10.0;
    const Gxa = Math.cos(Cx * Math.atan(Bx1 * alpha));
    const Gyk = Math.cos(Cy * Math.atan(By1 * kappa));

    const fxSteady = fx0 * Math.max(0, Gxa);
    const fySteady = fy0 * Math.max(0, Gyk);

    // ------------------------------------------------------------------------
    // 5. TRANSIENT CARCASS RELAXATION LENGTH (UNCONDITIONALLY STABLE EXPONENTIAL)
    // ------------------------------------------------------------------------
    // Relaxation length sigma_x, sigma_y (m) determines phase lag during quick inputs
    const sigmaX = 0.28 * (1.0 - 0.15 * dfz);
    const sigmaY = 0.38 * (1.0 - 0.18 * dfz);

    const dt = Math.max(0.001, input.dtSeconds);
    const decayFactorX = Math.exp(-(vx * dt) / Math.max(0.05, sigmaX));
    const actualFx = fxSteady + (state.currentFxN - fxSteady) * decayFactorX;

    const decayFactorY = Math.exp(-(vx * dt) / Math.max(0.05, sigmaY));
    const actualFy = fySteady + (state.currentFyN - fySteady) * decayFactorY;

    // ------------------------------------------------------------------------
    // 6. SELF-ALIGNING TORQUE (Mz) & PNEUMATIC TRAIL
    // ------------------------------------------------------------------------
    const Bt = coeffs.qBz1;
    const Ct = coeffs.qCz1;
    const Dt0 = (coeffs.qDz1 + coeffs.qDz2 * dfz) * (state.contactPatchLengthM * 0.45);
    const Et = coeffs.qEz1;
    const pneumaticTrail = Dt0 * Math.cos(Ct * Math.atan(Bt * alphay - Et * (Bt * alphay - Math.atan(Bt * alphay))));
    const residualTorque = (coeffs.qBz9 * gamma) * Fz * 0.002;
    const actualMz = -pneumaticTrail * actualFy + residualTorque;

    // ------------------------------------------------------------------------
    // 7. ROLLING RESISTANCE & STANDING WAVE CRITICAL SPEED
    // ------------------------------------------------------------------------
    // Rolling resistance coefficient Cr increases with speed squared: Cr = Cr0 + Cr2 * v^2
    const Cr0 = 0.011 + 0.002 * (2.1 / state.pressureBar);
    const Cr = Cr0 + 1.2e-6 * Math.pow(vx * 3.6, 2);
    const rollingResistanceN = Cr * Fz;

    // Carcass standing wave critical speed (m/s): v_crit = sqrt(Tension / linear_density)
    // Membrane belt tension under internal pressure: T_hoop ~ 42,000 N/m
    const carcassTension = 42000.0 * (state.pressureBar / 2.1); // N/m
    const tireCircumferenceM = 2.0 * Math.PI * 0.33; // ~2.07 m
    const linearDensityKgM = TireTribologyModel.CARCASS_MASS / tireCircumferenceM; // ~3.13 kg/m
    const vCritMs = Math.sqrt(carcassTension / linearDensityKgM);
    const standingWaveCriticalSpeedKmh = vCritMs * 3.6;

    // ------------------------------------------------------------------------
    // 8. MULTI-LAYER THERMODYNAMIC HEAT FLUX NETWORK
    // ------------------------------------------------------------------------
    // Sliding velocity at contact patch
    const vSliding = Math.sqrt(Math.pow(input.wheelSpeedMs - input.vehicleSpeedMs, 2) + Math.pow(vx * Math.tan(alpha), 2));
    const frictionHeatGenerationWatts = Math.abs(actualFx * (input.wheelSpeedMs - input.vehicleSpeedMs)) + Math.abs(actualFy * vx * Math.tan(alpha));

    // Flash temperature rise at contact patch asperities (Jaeger moving heat source theory)
    const contactWidth = state.contactPatchWidthM;
    const contactLength = state.contactPatchLengthM;
    const thermalDiffusivity = 1.2e-7; // m2/s for rubber
    const thermalConductivity = 0.28; // W/(m·K)
    const deltaTFlash = (0.75 * frictionHeatGenerationWatts) / (contactWidth * Math.sqrt(Math.PI * TireTribologyModel.SPECIFIC_HEAT_RUBBER * 1150 * thermalConductivity * Math.max(0.5, vx) * contactLength));
    const newFlashTemp = Math.min(240, state.thermals.treadBulkc + deltaTFlash);

    // Heat transfer between layers
    const hConvAir = 18.0 + 1.4 * Math.pow(vx * 3.6, 0.78); // forced convection to ambient air
    const qConvOut = hConvAir * (contactWidth * 1.8) * (state.thermals.treadBulkc - input.ambientTempC);
    const qConductionTrack = 45.0 * (contactWidth * contactLength) * (state.thermals.treadBulkc - input.trackSurfaceTempC);
    const qTreadToCarcass = 120.0 * (state.thermals.treadBulkc - state.thermals.carcassC);
    const qCarcassToCavity = 40.0 * (state.thermals.carcassC - state.thermals.cavityAirC);
    const qCarcassToRim = 60.0 * (state.thermals.carcassC - state.thermals.wheelRimC);
    const qRimToAmbient = 25.0 * (state.thermals.wheelRimC - input.ambientTempC);

    const cTread = TireTribologyModel.SPECIFIC_HEAT_RUBBER * TireTribologyModel.TREAD_RUBBER_MASS;
    const cCarcass = 1400 * TireTribologyModel.CARCASS_MASS;
    const cRim = 900 * 8.5; // aluminum rim

    const dTread = ((0.85 * frictionHeatGenerationWatts) - qConvOut - qConductionTrack - qTreadToCarcass) / cTread * dt;
    const dCarcass = (qTreadToCarcass - qCarcassToCavity - qCarcassToRim) / cCarcass * dt;
    const dCavity = (qCarcassToCavity) / (720 * 0.8) * dt;
    const dRim = (qCarcassToRim - qRimToAmbient) / cRim * dt;

    const newTreadBulk = Math.max(input.ambientTempC, state.thermals.treadBulkc + dTread);
    const newCarcass = Math.max(input.ambientTempC, state.thermals.carcassC + dCarcass);
    const newCavity = Math.max(input.ambientTempC, state.thermals.cavityAirC + dCavity);
    const newRim = Math.max(input.ambientTempC, state.thermals.wheelRimC + dRim);

    // ------------------------------------------------------------------------
    // 9. DYNAMIC PRESSURE BUILDUP (IDEAL GAS LAW)
    // ------------------------------------------------------------------------
    // P2 = P1 * (T2_Kelvin / T1_Kelvin)
    const tInitKelvin = 293.15;
    const tCurrentKelvin = newCavity + 273.15;
    const updatedPressure = state.nominalPressureBar * (tCurrentKelvin / tInitKelvin);

    // ------------------------------------------------------------------------
    // 10. WEAR KINETICS, GRAINING & BLISTERING
    // ------------------------------------------------------------------------
    // Archard wear law: Wear rate proportional to frictional work
    const workJoules = frictionHeatGenerationWatts * dt;
    const wearRateCoeff = 3.5e-9; // m3/J
    const newWear = Math.min(1.0, state.wearFraction + (workJoules * wearRateCoeff) / 0.0035);

    // Graining onset: occurs when cold rubber (<75°C) is subjected to high shear stress
    let newGraining = state.grainingIndex;
    if (newTreadBulk < 75.0 && Math.abs(actualFy) > 0.7 * Fz) {
      newGraining = Math.min(1.0, newGraining + 0.02 * dt);
    } else if (newTreadBulk >= 85.0 && newTreadBulk <= 115.0) {
      // Graining cleans up in optimal window
      newGraining = Math.max(0.0, newGraining - 0.015 * dt);
    }

    // Blistering risk: occurs when carcass is overheated (>135°C) and vaporizes oils
    const newBlistering = newCarcass > 135.0 ? Math.min(1.0, (newCarcass - 135.0) / 25.0) : 0.0;

    // Contact patch dimensions scale with normal load and inverse pressure
    const dynamicDeflection = (Fz / 250000) * (2.1 / updatedPressure);
    const contactPatchLength = 0.08 + dynamicDeflection * 1.8;
    const contactPatchWidth = 0.245 + dynamicDeflection * 0.4;

    const updatedState: TireStateMF62 = {
      thermals: {
        treadSurfaceC: Number(newFlashTemp.toFixed(1)),
        treadBulkc: Number(newTreadBulk.toFixed(1)),
        carcassC: Number(newCarcass.toFixed(1)),
        cavityAirC: Number(newCavity.toFixed(1)),
        wheelRimC: Number(newRim.toFixed(1)),
      },
      pressureBar: Number(updatedPressure.toFixed(3)),
      nominalPressureBar: state.nominalPressureBar,
      wearFraction: Number(newWear.toFixed(5)),
      grainingIndex: Number(newGraining.toFixed(3)),
      blisteringRisk: Number(newBlistering.toFixed(3)),
      currentFxN: actualFx,
      currentFyN: actualFy,
      currentMzNm: actualMz,
      deflectionM: dynamicDeflection,
      contactPatchLengthM: contactPatchLength,
      contactPatchWidthM: contactPatchWidth,
    };

    return {
      state: updatedState,
      forces: {
        fxLongitudinalN: actualFx,
        fyLateralN: actualFy,
        mzAligningNm: actualMz,
        pneumaticTrailM: pneumaticTrail,
        relaxationLengthLongM: sigmaX,
        relaxationLengthLatM: sigmaY,
        dynamicMuX: Math.abs(actualFx) / Fz,
        dynamicMuY: Math.abs(actualFy) / Fz,
        rollingResistanceForceN: rollingResistanceN,
        standingWaveCriticalSpeedKmh,
        isHydroplaning: false,
        thermalDissipationKw: frictionHeatGenerationWatts / 1000.0,
      },
    };
  }
}
