// ===================================================================
// MULTI-PHYSICS COUPLING BUS
// ===================================================================
// Closed-loop bidirectional coupling across domain solvers:
// 1. Aero ↔ Thermal: Radiator core airflow resistance & ram cooling drag
// 2. NVH / Psychoacoustics ↔ Press & Customer Review Refinement index
// 3. Battery Degradation & Thermals ↔ Powertrain power envelope derating
// 4. Manufacturing Quality & Assembly QA ↔ Reliability & Warranty risk
// ===================================================================

export interface AeroThermalCouplingResult {
  coolingAirflowM3s: number;
  radiatorDeltaCd: number;
  totalCoupledCd: number;
  engineBayThermalRejectionKw: number;
  coolingAdequacyRatio: number;
}

export interface PsychoacousticPerceptionResult {
  loudnessSones: number;
  sharpnessAcum: number;
  refinementScorePct: number;
  cabinQuietnessRating: number; // 0 - 10
  pressReviewSoundSnippet: string;
}

export interface BatteryPowertrainCouplingResult {
  deratingMultiplier: number;
  effectivePeakPowerKw: number;
  usableRegenKw: number;
  packTemperatureC: number;
  isThermalDeratingActive: boolean;
}

export interface ManufacturingReliabilityCouplingResult {
  defectPartsPerMillion: number;
  mtbfHours: number;
  projectedAnnualWarrantyCostPerUnit: number;
  overallReliabilityScorePct: number;
  fitAndFinishRating: number; // 0 - 10
}

export interface VehicleMultiPhysicsCouplingState {
  aeroThermal: AeroThermalCouplingResult;
  psychoacoustics: PsychoacousticPerceptionResult;
  batteryPowertrain: BatteryPowertrainCouplingResult;
  manufacturingReliability: ManufacturingReliabilityCouplingResult;
}

export class MultiPhysicsCouplingBus {
  private static instance: MultiPhysicsCouplingBus;

  public static getInstance(): MultiPhysicsCouplingBus {
    if (!MultiPhysicsCouplingBus.instance) {
      MultiPhysicsCouplingBus.instance = new MultiPhysicsCouplingBus();
    }
    return MultiPhysicsCouplingBus.instance;
  }

  /**
   * Calculates aerodynamic drag penalty induced by cooling radiator duct airflow.
   */
  public computeAeroThermalCoupling(params: {
    baseCd: number;
    radiatorAreaM2: number;
    coolingDemandKw: number;
    vehicleSpeedKmh: number;
    activeGrilleShutterClosedPct?: number;
  }): AeroThermalCouplingResult {
    const { baseCd, radiatorAreaM2, coolingDemandKw, vehicleSpeedKmh, activeGrilleShutterClosedPct = 0 } = params;
    const speedMs = Math.max(1, vehicleSpeedKmh / 3.6);
    const airDensity = 1.225;

    // Mass airflow through heat exchangers: Q = m_dot * Cp * deltaT
    const deltaT = 45.0; // Coolant to ambient delta T
    const cpAir = 1005; // J/kg*K
    const requiredMassFlowKgS = (coolingDemandKw * 1000) / (cpAir * deltaT);
    const volumetricFlowM3s = requiredMassFlowKgS / airDensity;

    // Dynamic ram drag across porous radiator matrix: F_drag = 0.5 * rho * v^2 * A * K_loss
    const shutterOpenRatio = Math.max(0.1, 1 - activeGrilleShutterClosedPct / 100);
    const radiatorLossCoefficient = 1.65;
    const frontalAreaDuct = radiatorAreaM2 * shutterOpenRatio;

    // Cooling drag delta on vehicle Cd
    const deltaCd = (radiatorLossCoefficient * frontalAreaDuct * (volumetricFlowM3s / (speedMs * Math.max(0.01, radiatorAreaM2)))) * 0.045;
    const totalCoupledCd = Number((baseCd + deltaCd).toFixed(4));

    const maxCoolingCapacityKw = (airDensity * volumetricFlowM3s * cpAir * deltaT) / 1000;
    const coolingAdequacyRatio = Number(Math.min(2.0, maxCoolingCapacityKw / Math.max(1, coolingDemandKw)).toFixed(2));

    return {
      coolingAirflowM3s: Number(volumetricFlowM3s.toFixed(3)),
      radiatorDeltaCd: Number(deltaCd.toFixed(4)),
      totalCoupledCd,
      engineBayThermalRejectionKw: Number(coolingDemandKw.toFixed(1)),
      coolingAdequacyRatio,
    };
  }

  /**
   * Translates psychoacoustic metrics into cabin luxury and refinement perception.
   */
  public computePsychoacousticRefinement(params: {
    loudnessSones: number;
    sharpnessAcum: number;
    hasActiveNoiseCancellation: boolean;
    acousticGlassTier: number; // 0, 1, 2
  }): PsychoacousticPerceptionResult {
    const { loudnessSones, sharpnessAcum, hasActiveNoiseCancellation, acousticGlassTier } = params;

    const ancReduction = hasActiveNoiseCancellation ? 0.82 : 1.0;
    const glassReduction = 1.0 - acousticGlassTier * 0.08;
    const effectiveLoudness = Math.max(0.5, loudnessSones * ancReduction * glassReduction);
    const effectiveSharpness = Math.max(0.2, sharpnessAcum * (hasActiveNoiseCancellation ? 0.9 : 1.0));

    // Luxury refinement formula (lower loudness & sharpness -> higher score)
    const rawRefinement = 100 - (effectiveLoudness * 2.2 + effectiveSharpness * 12.0);
    const refinementScorePct = Number(Math.min(99.5, Math.max(15.0, rawRefinement)).toFixed(1));
    const cabinQuietnessRating = Number((refinementScorePct / 10).toFixed(1));

    let pressReviewSoundSnippet = "The cabin NVH profile delivers acceptable mechanical sound isolation.";
    if (refinementScorePct >= 90) {
      pressReviewSoundSnippet = "Whisper-quiet cabin isolation with vault-like acoustic damping and silk-smooth harmonics.";
    } else if (refinementScorePct >= 75) {
      pressReviewSoundSnippet = "Well-controlled engine harmonics and minimal tire roar on coarse asphalt surfaces.";
    } else if (refinementScorePct < 50) {
      pressReviewSoundSnippet = "Noticeable road boom and high-frequency intake harshness intrusive at sustained highway speeds.";
    }

    return {
      loudnessSones: Number(effectiveLoudness.toFixed(2)),
      sharpnessAcum: Number(effectiveSharpness.toFixed(2)),
      refinementScorePct,
      cabinQuietnessRating,
      pressReviewSoundSnippet,
    };
  }

  /**
   * Couples battery state of health, cell temperature, and C-rate into active powertrain limits.
   */
  public computeBatteryPowertrainCoupling(params: {
    nominalPowerKw: number;
    stateOfHealthPct: number;
    cellTemperatureC: number;
    stateOfChargePct: number;
    isImmersionCooled?: boolean;
  }): BatteryPowertrainCouplingResult {
    const { nominalPowerKw, stateOfHealthPct, cellTemperatureC, stateOfChargePct, isImmersionCooled = false } = params;

    let deratingMultiplier = 1.0;

    // Temperature derating curve (Optimal: 25C - 42C)
    if (cellTemperatureC > 55) {
      deratingMultiplier *= Math.max(0.35, 1.0 - (cellTemperatureC - 55) * 0.04);
    } else if (cellTemperatureC < 0) {
      deratingMultiplier *= Math.max(0.5, 1.0 + cellTemperatureC * 0.025);
    }

    // State of Charge de-rating (Voltage sag near depleted SOC)
    if (stateOfChargePct < 15) {
      deratingMultiplier *= Math.max(0.4, stateOfChargePct / 15);
    }

    // Health degradation limit
    deratingMultiplier *= Math.min(1.0, stateOfHealthPct / 100);

    if (isImmersionCooled && cellTemperatureC > 45) {
      // Immersion cooling restores 40% of lost thermal margin
      deratingMultiplier = Math.min(1.0, deratingMultiplier + 0.15);
    }

    const effectivePeakPowerKw = Number((nominalPowerKw * deratingMultiplier).toFixed(1));
    const usableRegenKw = Number((effectivePeakPowerKw * 0.65 * (stateOfChargePct > 92 ? (100 - stateOfChargePct) / 8 : 1.0)).toFixed(1));

    return {
      deratingMultiplier: Number(deratingMultiplier.toFixed(3)),
      effectivePeakPowerKw,
      usableRegenKw,
      packTemperatureC: cellTemperatureC,
      isThermalDeratingActive: deratingMultiplier < 0.95,
    };
  }

  /**
   * Couples factory automation level, tooling tolerances, and QA to vehicle reliability and warranty costs.
   */
  public computeManufacturingReliabilityCoupling(params: {
    automationLevelPct: number;
    qcInspectionTiers: number; // 1 - 5
    componentCount: number;
    baseUnitMSRP: number;
  }): ManufacturingReliabilityCouplingResult {
    const { automationLevelPct, qcInspectionTiers, componentCount, baseUnitMSRP } = params;

    // Defect PPM modeled with Six Sigma precision curve
    const basePpm = 2500;
    const automationFactor = Math.pow(1 - automationLevelPct / 120, 1.2);
    const qcFactor = Math.pow(0.58, qcInspectionTiers - 1);
    const defectPartsPerMillion = Number(Math.max(12, basePpm * automationFactor * qcFactor).toFixed(0));

    // MTBF calculated from defect density and component count
    const failureRatePerHour = (defectPartsPerMillion * 1e-6 * componentCount) / 1200;
    const mtbfHours = Number(Math.min(150000, 1 / Math.max(1e-7, failureRatePerHour)).toFixed(0));

    const reliabilityScorePct = Number(Math.min(99.2, Math.max(30.0, 100 - defectPartsPerMillion / 50)).toFixed(1));
    const fitAndFinishRating = Number((reliabilityScorePct / 10).toFixed(1));

    // Warranty reserves per vehicle = defect probability * average repair cost factor
    const annualClaimRate = defectPartsPerMillion / 8000;
    const avgRepairCost = baseUnitMSRP * 0.065;
    const projectedAnnualWarrantyCostPerUnit = Number((annualClaimRate * avgRepairCost).toFixed(2));

    return {
      defectPartsPerMillion,
      mtbfHours,
      projectedAnnualWarrantyCostPerUnit,
      overallReliabilityScorePct: reliabilityScorePct,
      fitAndFinishRating,
    };
  }
}
