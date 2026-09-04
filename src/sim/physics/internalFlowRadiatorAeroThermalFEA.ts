// ============================================================================
// MODULE 19: RADIATOR & DUCT INTERNAL FLOW AEROTHERMAL FEA
// ============================================================================
// Solves coupled aerothermal equations for race car internal cooling:
// sidepod duct inlet diffusion, porous medium radiator core pressure drop
// via Darcy-Forchheimer law, epsilon-NTU crossflow heat transfer, and
// momentum deficit internal cooling drag penalty (CD_cooling).
// ============================================================================

export interface RadiatorCoreGeometry {
  coreAreaM2: number;               // Frontal face area of core (m^2)
  coreThicknessM: number;           // Matrix thickness (m)
  inletAreaM2: number;              // Sidepod scoop inlet aperture (m^2)
  exitAreaM2: number;               // Louver/chimney exit aperture (m^2)
  darcyPermeabilityM2: number;      // alpha (m^2), e.g. 2.5e-8
  inertialLossFactorMInv: number;   // C_2 (1/m), e.g. 185.0
  heatTransferCoeffUA: number;      // Overall U*A rating (W/K), e.g. 3500 W/K
  coolantMassFlowKgS: number;       // Water/glycol pump rate (kg/s)
  coolantSpecificHeatJPkgK: number; // e.g. 3850 J/(kg*K)
}

export interface InternalFlowInletConditions {
  vehicleSpeedMs: number;
  ambientAirTempC: number;
  airDensityKgM3: number;
  airDynamicViscosityPaS: number;  // ~1.81e-5 Pa*s
  coolantInletTempC: number;       // Engine water temp entering radiator (e.g. 105 C)
  carFrontalAreaM2: number;        // Reference area for Cd calculation
}

export interface InternalFlowCoolingResult {
  airMassFlowRateKgS: number;       // Air flow rate through sidepod
  coreFaceVelocityMs: number;       // Air velocity directly hitting fin matrix
  corePressureDropPa: number;       // Darcy-Forchheimer Delta_P across core
  heatRejectionRateKw: number;      // Total thermal energy dissipated (kW)
  coolantOutletTempC: number;       // Water temp exiting radiator back to engine
  airOutletTempC: number;           // Hot air temperature exiting louvers
  internalCoolingDragN: number;     // Aerodynamic drag force from momentum loss
  internalCoolingCd: number;        // Increment to vehicle overall drag coefficient
  heatExchangerEffectiveness: number; // epsilon (0.0 to 1.0)
}

export class InternalFlowRadiatorAeroThermalFEA {
  /**
   * Evaluates aerothermal internal duct flow, core pressure drop, and cooling drag.
   */
  public static evaluate(
    geom: RadiatorCoreGeometry,
    inlet: InternalFlowInletConditions
  ): InternalFlowCoolingResult {
    const vInf = Math.max(1.0, inlet.vehicleSpeedMs);
    const rho = inlet.airDensityKgM3;
    const cpAir = 1005.0; // J/(kg*K)

    // ------------------------------------------------------------------------
    // 1. INLET DUCT DIFFUSION & MASS FLOW ESTIMATION
    // ------------------------------------------------------------------------
    // Ram air capture efficiency through sidepod inlet:
    const ramPressureRatio = 0.78; // Duct recovery factor
    const capturedVelocity = vInf * ramPressureRatio;
    // Core face area is larger than inlet, flow expands and slows down:
    const areaRatio = Math.min(1.0, geom.inletAreaM2 / geom.coreAreaM2);
    const vCoreEstimate = capturedVelocity * areaRatio;

    // ------------------------------------------------------------------------
    // 2. DARCY-FORCHHEIMER POROUS MEDIUM PRESSURE DROP ACROSS CORE MATRIX
    // ------------------------------------------------------------------------
    // Delta_P = (mu / alpha) * L * v + (1/2) * C2 * rho * L * v^2
    const L = geom.coreThicknessM;
    const viscousTerm = (inlet.airDynamicViscosityPaS / geom.darcyPermeabilityM2) * L * vCoreEstimate;
    const inertialTerm = 0.5 * geom.inertialLossFactorMInv * rho * L * Math.pow(vCoreEstimate, 2);
    const deltaPCore = viscousTerm + inertialTerm;

    // Effective actual face velocity factoring backpressure:
    const qInf = 0.5 * rho * vInf * vInf;
    const flowResistanceFactor = 1.0 / (1.0 + deltaPCore / Math.max(50.0, qInf * 0.8));
    const effectiveFaceVelocity = vCoreEstimate * flowResistanceFactor;

    // Actual mass flow rate of air:
    const mDotAir = rho * geom.coreAreaM2 * effectiveFaceVelocity;

    // ------------------------------------------------------------------------
    // 3. EPSILON-NTU CROSSFLOW HEAT EXCHANGER DYNAMICS
    // ------------------------------------------------------------------------
    const cAir = mDotAir * cpAir; // Air heat capacity rate (W/K)
    const cCoolant = geom.coolantMassFlowKgS * geom.coolantSpecificHeatJPkgK; // Coolant heat capacity rate (W/K)

    const cMin = Math.min(cAir, cCoolant);
    const cMax = Math.max(cAir, cCoolant);
    const cRatio = cMin / Math.max(1.0, cMax);

    // Number of Transfer Units:
    const ntu = geom.heatTransferCoeffUA / Math.max(1.0, cMin);

    // Unmixed-unmixed crossflow effectiveness correlation:
    // epsilon = 1 - exp((NTU^0.22 / Cr) * (exp(-Cr * NTU^0.78) - 1))
    const expTerm = Math.exp(-cRatio * Math.pow(Math.max(0.01, ntu), 0.78)) - 1.0;
    const epsilon = Math.min(
      0.95,
      Math.max(0.05, 1.0 - Math.exp((Math.pow(Math.max(0.01, ntu), 0.22) / Math.max(0.05, cRatio)) * expTerm))
    );

    // Heat transfer rate (Watts & kW):
    const deltaTMax = Math.max(0, inlet.coolantInletTempC - inlet.ambientAirTempC);
    const heatTransferWatts = epsilon * cMin * deltaTMax;
    const heatRejectionKw = heatTransferWatts / 1000.0;

    // Outlet temperatures:
    const airOutletTempC = inlet.ambientAirTempC + heatTransferWatts / Math.max(1.0, cAir);
    const coolantOutletTempC = inlet.coolantInletTempC - heatTransferWatts / Math.max(1.0, cCoolant);

    // ------------------------------------------------------------------------
    // 4. MOMENTUM DEFICIT INTERNAL COOLING DRAG
    // ------------------------------------------------------------------------
    // Air enters with freestream velocity vInf, exits from louvers with reduced velocity:
    const exitVelocity = effectiveFaceVelocity * (geom.coreAreaM2 / geom.exitAreaM2) * 0.75;
    // Drag = m_dot * (v_in - v_out) + pressure thrust delta
    const momentumLossForceN = mDotAir * Math.max(0, vInf - exitVelocity);
    const internalCoolingDragN = momentumLossForceN * 1.15; // Including exit turning losses

    // Cooling drag coefficient increment:
    const coolingCd = internalCoolingDragN / (qInf * inlet.carFrontalAreaM2);

    return {
      airMassFlowRateKgS: Number(mDotAir.toFixed(3)),
      coreFaceVelocityMs: Number(effectiveFaceVelocity.toFixed(2)),
      corePressureDropPa: Number(deltaPCore.toFixed(1)),
      heatRejectionRateKw: Number(heatRejectionKw.toFixed(1)),
      coolantOutletTempC: Number(coolantOutletTempC.toFixed(2)),
      airOutletTempC: Number(airOutletTempC.toFixed(2)),
      internalCoolingDragN: Number(internalCoolingDragN.toFixed(1)),
      internalCoolingCd: Number(coolingCd.toFixed(4)),
      heatExchangerEffectiveness: Number(epsilon.toFixed(3)),
    };
  }
}
