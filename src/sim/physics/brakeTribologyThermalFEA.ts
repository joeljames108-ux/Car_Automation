// ============================================================================
// MODULE 6: BRAKE TRIBOLOGY & 1D RADIAL DISC THERMAL FEA ENGINE
// ============================================================================
// Advanced braking system dynamics & thermodynamics:
// 1. Master cylinder hydraulics, pedal leverage ratio, caliper piston clamping force
// 2. Pad friction coefficient non-linear characteristic mu(T_disc, v_rub, P_line)
// 3. Multi-node radial disc finite-volume conductive & convective thermal solver
// 4. Internal ventilation vane forced cooling airflow & Stefan-Boltzmann radiation
// 5. Brake fluid boiling, vapor lock risk & spongy pedal stroke degradation
// 6. Dynamic front/rear brake bias migration & ABS threshold slip modulation
// ============================================================================

export type BrakeMaterialType = 'carbon_ceramic' | 'cast_iron_slotted' | 'carbon_carbon_f1';

export interface BrakeHardwareSpecs {
  material: BrakeMaterialType;
  discOuterRadiusM: number;       // e.g. 0.195 m (390 mm disc)
  discInnerRadiusM: number;       // e.g. 0.115 m
  discThicknessM: number;          // e.g. 0.034 m (34 mm)
  discMassKg: number;              // e.g. 6.8 kg (carbon ceramic) or 12.5 kg (cast iron)
  caliperPistonCount: number;      // e.g. 6 pistons
  caliperPistonDiameterMm: number; // e.g. 32 mm
  padSurfaceAreaM2: number;        // e.g. 0.0095 m2
  coolingDuctAirflowEfficiency: number; // 0 to 1.0
  fluidDryBoilingPointC: number;   // e.g. 325 °C (racing DOT 4/5.1)
  fluidWetBoilingPointC: number;   // e.g. 215 °C
  fluidWaterContentPct: number;    // e.g. 0.8%
}

export interface BrakeThermalNodeState {
  innerHubTempC: number;
  midFrictionRingTempC: number;
  outerEdgeTempC: number;
  caliperBridgeTempC: number;
  brakeFluidTempC: number;
  padSurfaceTempC: number;
}

export interface BrakeSystemState {
  frontLeft: BrakeThermalNodeState;
  frontRight: BrakeThermalNodeState;
  rearLeft: BrakeThermalNodeState;
  rearRight: BrakeThermalNodeState;
  padRemainingThicknessMm: number;
  isVaporLockOccurred: boolean;
  pedalFirmnessPct: number;        // 100% = rock solid, <40% = vapor lock sink
}

export interface BrakeDemandInput {
  pedalEffortForceN: number;       // Driver foot force on brake pedal (0 to 1200 N)
  pedalLeverageRatio: number;      // e.g. 5.4:1
  staticBiasFrontPct: number;      // e.g. 58.0%
  vehicleSpeedMs: number;
  ambientTempC: number;
  wheelLoadsN: [number, number, number, number]; // FL, FR, RL, RR
  tireGrips: [number, number, number, number];   // FL, FR, RL, RR available mu
  isAbsEnabled: boolean;
  dtSeconds: number;
}

export interface BrakeOutput {
  flBrakingForceN: number;
  frBrakingForceN: number;
  rlBrakingForceN: number;
  rrBrakingForceN: number;
  totalBrakingForceN: number;
  dynamicBiasFrontPct: number;
  decelerationG: number;
  thermalDissipationKw: number;
  padFrictionCoeffFl: number;
  padFrictionCoeffRl: number;
  peakDiscTempC: number;
  isAbsActiveFl: boolean;
  isAbsActiveRl: boolean;
  isFluidBoiling: boolean;
  state: BrakeSystemState;
}

export class BrakeTribologyThermalFEA {
  public static readonly STEFAN_BOLTZMANN = 5.670374e-8; // W/(m2·K4)

  /**
   * Initializes brake system thermal nodes at ambient temperature.
   */
  public static createBrakeState(initialTempC: number = 25.0): BrakeSystemState {
    const makeNode = (): BrakeThermalNodeState => ({
      innerHubTempC: initialTempC,
      midFrictionRingTempC: initialTempC,
      outerEdgeTempC: initialTempC,
      caliperBridgeTempC: initialTempC,
      brakeFluidTempC: initialTempC,
      padSurfaceTempC: initialTempC,
    });

    return {
      frontLeft: makeNode(),
      frontRight: makeNode(),
      rearLeft: makeNode(),
      rearRight: makeNode(),
      padRemainingThicknessMm: 12.0,
      isVaporLockOccurred: false,
      pedalFirmnessPct: 100.0,
    };
  }

  /**
   * Evaluates hydraulic line pressure, pad-disc friction vs temperature, 1D radial disc
   * heat conduction, forced ventilation cooling, fluid boiling, and ABS slip cycling.
   */
  public static evaluateBrakes(
    frontSpecs: BrakeHardwareSpecs,
    rearSpecs: BrakeHardwareSpecs,
    state: BrakeSystemState,
    demand: BrakeDemandInput
  ): BrakeOutput {
    const dt = Math.max(0.001, demand.dtSeconds);
    const v = Math.max(0.1, demand.vehicleSpeedMs);

    // ------------------------------------------------------------------------
    // 1. MASTER CYLINDER HYDRAULICS & LINE PRESSURE
    // ------------------------------------------------------------------------
    // Total pedal force multiplied by mechanical leverage:
    const rodForceN = demand.pedalEffortForceN * demand.pedalLeverageRatio;
    const masterCylinderAreaM2 = Math.PI * Math.pow(0.022 / 2.0, 2); // 22mm tandem master cylinder
    const rawHydraulicPressurePa = rodForceN / masterCylinderAreaM2;

    // Fluid vaporization check: if fluid temperature exceeds boiling point, line pressure collapses
    const currentBoilingPointC = frontSpecs.fluidDryBoilingPointC - (frontSpecs.fluidDryBoilingPointC - frontSpecs.fluidWetBoilingPointC) * (frontSpecs.fluidWaterContentPct / 3.0);
    const maxFluidTemp = Math.max(
      state.frontLeft.brakeFluidTempC,
      state.frontRight.brakeFluidTempC,
      state.rearLeft.brakeFluidTempC,
      state.rearRight.brakeFluidTempC
    );

    const isFluidBoiling = maxFluidTemp >= currentBoilingPointC;
    let pedalFirmness = 100.0;
    if (isFluidBoiling) {
      // Vapor lock: compressibility of boiled gas creates long spongy pedal stroke
      pedalFirmness = Math.max(15.0, 100.0 - (maxFluidTemp - currentBoilingPointC) * 6.5);
    }
    const effectiveLinePressurePa = rawHydraulicPressurePa * (pedalFirmness / 100.0);

    // ------------------------------------------------------------------------
    // 2. PAD-DISC FRICTION COEFFICIENT (MU VS TEMPERATURE & MATERIAL)
    // ------------------------------------------------------------------------
    const computePadMu = (tempC: number, mat: BrakeMaterialType): number => {
      if (mat === 'carbon_ceramic') {
        // Carbon Ceramic: cold bite good, broad peak 300C - 750C, fade above 950C
        if (tempC < 150) return 0.42 + 0.10 * (tempC / 150.0);
        if (tempC <= 750) return 0.52 + 0.05 * Math.sin(((tempC - 150) / 600.0) * Math.PI);
        if (tempC <= 950) return 0.57 - 0.12 * ((tempC - 750) / 200.0);
        return Math.max(0.22, 0.45 - 0.25 * ((tempC - 950) / 200.0)); // Fade
      } else if (mat === 'carbon_carbon_f1') {
        // F1 Carbon-Carbon: terrible cold (<300C), astronomical peak 500C - 1000C
        if (tempC < 350) return 0.20 + 0.25 * (tempC / 350.0);
        if (tempC <= 950) return 0.62 + 0.06 * Math.sin(((tempC - 350) / 600.0) * Math.PI);
        return Math.max(0.35, 0.68 - 0.25 * ((tempC - 950) / 250.0));
      } else {
        // High Performance Cast Iron: peak 250C - 550C, severe fade above 650C
        if (tempC < 100) return 0.38 + 0.08 * (tempC / 100.0);
        if (tempC <= 500) return 0.46 + 0.04 * Math.sin(((tempC - 100) / 400.0) * Math.PI);
        if (tempC <= 650) return 0.50 - 0.18 * ((tempC - 500) / 150.0);
        return Math.max(0.18, 0.32 - 0.15 * ((tempC - 650) / 150.0)); // Severe Fade
      }
    };

    const muFl = computePadMu(state.frontLeft.midFrictionRingTempC, frontSpecs.material);
    const muFr = computePadMu(state.frontRight.midFrictionRingTempC, frontSpecs.material);
    const muRl = computePadMu(state.rearLeft.midFrictionRingTempC, rearSpecs.material);
    const muRr = computePadMu(state.rearRight.midFrictionRingTempC, rearSpecs.material);

    // ------------------------------------------------------------------------
    // 3. CALIPER CLAMPING FORCE & BRAKING TORQUE
    // ------------------------------------------------------------------------
    const frontPistonArea = frontSpecs.caliperPistonCount * (Math.PI * Math.pow((frontSpecs.caliperPistonDiameterMm / 1000.0) / 2.0, 2));
    const rearPistonArea = rearSpecs.caliperPistonCount * (Math.PI * Math.pow((rearSpecs.caliperPistonDiameterMm / 1000.0) / 2.0, 2));

    const biasFront = demand.staticBiasFrontPct / 100.0;
    const biasRear = 1.0 - biasFront;

    const clampForceFrontFlN = effectiveLinePressurePa * frontPistonArea * biasFront * 2.0;
    const clampForceFrontFrN = effectiveLinePressurePa * frontPistonArea * biasFront * 2.0;
    const clampForceRearRlN = effectiveLinePressurePa * rearPistonArea * biasRear * 2.0;
    const clampForceRearRrN = effectiveLinePressurePa * rearPistonArea * biasRear * 2.0;

    const rEffectiveFront = (frontSpecs.discOuterRadiusM + frontSpecs.discInnerRadiusM) / 2.0;
    const rEffectiveRear = (rearSpecs.discOuterRadiusM + rearSpecs.discInnerRadiusM) / 2.0;
    const rTire = 0.33;

    // Brake force at tire contact patch: F_brake = (ClampForce * mu_pad * 2 * r_eff) / r_tire
    let fFl = (clampForceFrontFlN * muFl * 2.0 * rEffectiveFront) / rTire;
    let fFr = (clampForceFrontFrN * muFr * 2.0 * rEffectiveFront) / rTire;
    let fRl = (clampForceRearRlN * muRl * 2.0 * rEffectiveRear) / rTire;
    let fRr = (clampForceRearRrN * muRr * 2.0 * rEffectiveRear) / rTire;

    // ------------------------------------------------------------------------
    // 4. TIRE ADHESION LIMITS & ABS THRESHOLD SLIP MODULATION
    // ------------------------------------------------------------------------
    const maxTractionFl = demand.wheelLoadsN[0] * demand.tireGrips[0];
    const maxTractionFr = demand.wheelLoadsN[1] * demand.tireGrips[1];
    const maxTractionRl = demand.wheelLoadsN[2] * demand.tireGrips[2];
    const maxTractionRr = demand.wheelLoadsN[3] * demand.tireGrips[3];

    let absFl = false;
    let absFr = false;
    let absRl = false;
    let absRr = false;

    if (demand.isAbsEnabled) {
      if (fFl > maxTractionFl) { fFl = maxTractionFl * 0.96; absFl = true; }
      if (fFr > maxTractionFr) { fFr = maxTractionFr * 0.96; absFr = true; }
      if (fRl > maxTractionRl) { fRl = maxTractionRl * 0.96; absRl = true; }
      if (fRr > maxTractionRr) { fRr = maxTractionRr * 0.96; absRr = true; }
    } else {
      // Driver lockup without ABS: sliding friction drops ~20%
      if (fFl > maxTractionFl) fFl = maxTractionFl * 0.80;
      if (fFr > maxTractionFr) fFr = maxTractionFr * 0.80;
      if (fRl > maxTractionRl) fRl = maxTractionRl * 0.80;
      if (fRr > maxTractionRr) fRr = maxTractionRr * 0.80;
    }

    const totalBrakingForceN = fFl + fFr + fRl + fRr;
    const dynamicBiasFrontPct = totalBrakingForceN > 10.0 ? ((fFl + fFr) / totalBrakingForceN) * 100.0 : demand.staticBiasFrontPct;

    // ------------------------------------------------------------------------
    // 5. 1D RADIAL DISC FINITE-VOLUME THERMAL DIFFUSION & COOLING
    // ------------------------------------------------------------------------
    const updateDiscThermals = (
      node: BrakeThermalNodeState,
      brakeForceN: number,
      specs: BrakeHardwareSpecs
    ): BrakeThermalNodeState => {
      // Frictional heat flux generated at pad interface: Q = F_brake * v
      const heatInputWatts = brakeForceN * v;

      // Disc material specific heat and thermal conductivity
      const isCarbon = specs.material !== 'cast_iron_slotted';
      const cpDisc = isCarbon ? 1400 : 500; // J/(kg·K)
      const kConductivity = isCarbon ? 45.0 : 52.0; // W/(m·K)
      const emissivity = isCarbon ? 0.92 : 0.82;

      // Forced convective heat transfer coefficient inside internal cooling vanes:
      // h_conv = 22 + 1.8 * (v * 3.6)^0.78 * coolingEfficiency
      const hConv = (22.0 + 1.85 * Math.pow(v * 3.6, 0.78)) * (1.0 + specs.coolingDuctAirflowEfficiency * 0.8);
      const frictionRingArea = 2.0 * Math.PI * (Math.pow(specs.discOuterRadiusM, 2) - Math.pow(specs.discInnerRadiusM, 2));

      // Stefan-Boltzmann high-temperature radiation: Q_rad = eps * sigma * A * (T^4 - T_amb^4)
      const tKelvin = node.midFrictionRingTempC + 273.15;
      const tAmbKelvin = demand.ambientTempC + 273.15;
      const qRadWatts = emissivity * BrakeTribologyThermalFEA.STEFAN_BOLTZMANN * frictionRingArea * (Math.pow(tKelvin, 4) - Math.pow(tAmbKelvin, 4));

      // Convective cooling to vane air
      const qConvWatts = hConv * frictionRingArea * (node.midFrictionRingTempC - demand.ambientTempC);

      // 1D radial conduction between Hub <-> Friction Ring <-> Outer Edge
      const qHubCondWatts = (kConductivity * 0.045) * (node.midFrictionRingTempC - node.innerHubTempC);
      const qEdgeCondWatts = (kConductivity * 0.035) * (node.midFrictionRingTempC - node.outerEdgeTempC);

      // Temperature differential updates
      const massFrictionRing = specs.discMassKg * 0.75;
      const massHub = specs.discMassKg * 0.25;

      const dTMid = (heatInputWatts * 0.90 - qConvWatts - qRadWatts - qHubCondWatts - qEdgeCondWatts) / (massFrictionRing * cpDisc) * dt;
      const dTHub = (qHubCondWatts - 25.0 * (node.innerHubTempC - demand.ambientTempC)) / (massHub * cpDisc) * dt;
      const dTEdge = (qEdgeCondWatts - 35.0 * (node.outerEdgeTempC - demand.ambientTempC)) / (specs.discMassKg * 0.1 * cpDisc) * dt;

      // Caliper bridge heat conduction through pad backing plate:
      const qToCaliper = 35.0 * (node.midFrictionRingTempC - node.caliperBridgeTempC);
      const dTCaliper = (qToCaliper - 45.0 * (node.caliperBridgeTempC - demand.ambientTempC)) / (4.5 * 900) * dt;

      // Brake fluid heating from caliper body:
      const qToFluid = 15.0 * (node.caliperBridgeTempC - node.brakeFluidTempC);
      const dTFluid = (qToFluid - 8.0 * (node.brakeFluidTempC - demand.ambientTempC)) / (0.25 * 1800) * dt;

      return {
        innerHubTempC: Math.max(demand.ambientTempC, Number((node.innerHubTempC + dTHub).toFixed(1))),
        midFrictionRingTempC: Math.max(demand.ambientTempC, Number((node.midFrictionRingTempC + dTMid).toFixed(1))),
        outerEdgeTempC: Math.max(demand.ambientTempC, Number((node.outerEdgeTempC + dTEdge).toFixed(1))),
        caliperBridgeTempC: Math.max(demand.ambientTempC, Number((node.caliperBridgeTempC + dTCaliper).toFixed(1))),
        brakeFluidTempC: Math.max(demand.ambientTempC, Number((node.brakeFluidTempC + dTFluid).toFixed(1))),
        padSurfaceTempC: Math.max(demand.ambientTempC, Number((node.midFrictionRingTempC + heatInputWatts * 0.00015).toFixed(1))),
      };
    };

    const newFl = updateDiscThermals(state.frontLeft, fFl, frontSpecs);
    const newFr = updateDiscThermals(state.frontRight, fFr, frontSpecs);
    const newRl = updateDiscThermals(state.rearLeft, fRl, rearSpecs);
    const newRr = updateDiscThermals(state.rearRight, fRr, rearSpecs);

    const peakDiscTemp = Math.max(
      newFl.midFrictionRingTempC,
      newFr.midFrictionRingTempC,
      newRl.midFrictionRingTempC,
      newRr.midFrictionRingTempC
    );

    const totalThermalWatts = (fFl + fFr + fRl + fRr) * v;
    const vehicleMassKg = (demand.wheelLoadsN[0] + demand.wheelLoadsN[1] + demand.wheelLoadsN[2] + demand.wheelLoadsN[3]) / 9.80665;
    const decelG = totalBrakingForceN / (vehicleMassKg * 9.80665);

    const updatedState: BrakeSystemState = {
      frontLeft: newFl,
      frontRight: newFr,
      rearLeft: newRl,
      rearRight: newRr,
      padRemainingThicknessMm: Math.max(0.5, state.padRemainingThicknessMm - (totalBrakingForceN * v * dt * 1.5e-11)),
      isVaporLockOccurred: isFluidBoiling,
      pedalFirmnessPct: Number(pedalFirmness.toFixed(1)),
    };

    return {
      flBrakingForceN: Number(fFl.toFixed(1)),
      frBrakingForceN: Number(fFr.toFixed(1)),
      rlBrakingForceN: Number(fRl.toFixed(1)),
      rrBrakingForceN: Number(fRr.toFixed(1)),
      totalBrakingForceN: Number(totalBrakingForceN.toFixed(1)),
      dynamicBiasFrontPct: Number(dynamicBiasFrontPct.toFixed(2)),
      decelerationG: Number(decelG.toFixed(3)),
      thermalDissipationKw: Number((totalThermalWatts / 1000.0).toFixed(1)),
      padFrictionCoeffFl: Number(muFl.toFixed(3)),
      padFrictionCoeffRl: Number(muRl.toFixed(3)),
      peakDiscTempC: peakDiscTemp,
      isAbsActiveFl: absFl,
      isAbsActiveRl: absRl,
      isFluidBoiling,
      state: updatedState,
    };
  }
}
