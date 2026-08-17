// ============================================================================
// PHASE 75 — CARBON-CERAMIC (CCM) BRAKE DISC THERMAL STRESS & DELAMINATION FEA
// ============================================================================
// C/SiC ceramic composite matrix, 1050°C peak pyrometry, thermo-elastic
// hoop stress tensor, and interlaminar oxidation/delamination safety margins.
// ============================================================================

export interface CarbonCeramicDiscState {
  discOuterRadiusMm: number;
  peakSurfaceTempC: number;
  coreTempC: number;
  thermalGradientCPerMm: number;
  peakThermoElasticHoopStressMpa: number;
  matrixCompressiveStressMpa: number;
  interlaminarShearStressMpa: number;
  delaminationSafetyFactor: number;
  antioxidantCoatingHealthPct: number;
  isThermalShockSafe: boolean;
}

export class CarbonCeramicThermalStressFea {
  // C/SiC Carbon-Ceramic Properties
  private static readonly E_MODULUS_GPA = 32.0; // Quasi-isotropic woven matrix
  private static readonly POISSON_RATIO = 0.18;
  private static readonly THERMAL_EXPANSION_PPM = 2.4; // Ultra-low CTE (2.4e-6 / K)
  private static readonly INTERLAMINAR_SHEAR_LIMIT_MPA = 48.0;

  /**
   * Solves transient thermo-elastic stress and interlaminar delamination risk in CCM discs.
   */
  public static evaluateBrakeDiscStress(params: {
    brakingPowerKwPerWheel: number;
    initialDiscTempC?: number;
    coolingAirVelocityMs?: number;
    rotorDiameterMm?: number;
  }): CarbonCeramicDiscState {
    const pBrakeKw = params.brakingPowerKwPerWheel;
    const tInit = params.initialDiscTempC || 450.0;
    const vCool = params.coolingAirVelocityMs || 45.0;
    const diamMm = params.rotorDiameterMm || 420.0; // 420mm front GT3 carbon ceramic rotor

    // 1. Transient Surface Temperature Rise during Hard Deceleration
    // DeltaT = (P_brake * dt) / (m_rotor * c_p)
    const rotorMassKg = 7.8; // 7.8 kg lightweight carbon ceramic vs 16 kg iron
    const cpCeramic = 1250; // J/(kg*K)
    const heatFluxDurationSec = 3.2; // 3.2s heavy braking zone
    const deltaTC = (pBrakeKw * 1000 * heatFluxDurationSec * 0.85) / (rotorMassKg * cpCeramic);

    const surfaceTemp = Math.min(1150, tInit + deltaTC);
    const coreTemp = tInit + deltaTC * 0.58; // Thermal lag inside core vanes

    // 2. Thermal Gradient across 38mm Disc Thickness
    const discThicknessMm = 38.0;
    const thermalGradient = (surfaceTemp - coreTemp) / (discThicknessMm / 2);

    // 3. Thermo-Elastic Hoop Stress Tensor: sigma_thermal = (alpha * E / (1 - nu)) * DeltaT_radial
    const alpha = this.THERMAL_EXPANSION_PPM * 1e-6;
    const ePa = this.E_MODULUS_GPA * 1e9;
    const nu = this.POISSON_RATIO;

    const deltaTRadial = (surfaceTemp - coreTemp);
    const hoopStressPa = (alpha * ePa * deltaTRadial) / (1 - nu);
    const hoopStressMpa = hoopStressPa / 1e6;

    // 4. Interlaminar Shear Stress at Carbon Matrix Boundaries
    const shearStressMpa = hoopStressMpa * 0.28;
    const safetyFactor = this.INTERLAMINAR_SHEAR_LIMIT_MPA / Math.max(1, shearStressMpa);

    // 5. Silicon Carbide Antioxidant Pyrolytic Coating Health (Degrades above 950°C)
    let coatingHealthPct = 99.0;
    if (surfaceTemp > 950) {
      coatingHealthPct = Math.max(75.0, 99.0 - (surfaceTemp - 950) * 0.12);
    }

    return {
      discOuterRadiusMm: diamMm / 2,
      peakSurfaceTempC: Math.round(surfaceTemp * 10) / 10,
      coreTempC: Math.round(coreTemp * 10) / 10,
      thermalGradientCPerMm: Math.round(thermalGradient * 10) / 10,
      peakThermoElasticHoopStressMpa: Math.round(hoopStressMpa * 10) / 10,
      matrixCompressiveStressMpa: Math.round(hoopStressMpa * 1.45 * 10) / 10,
      interlaminarShearStressMpa: Math.round(shearStressMpa * 10) / 10,
      delaminationSafetyFactor: Math.round(safetyFactor * 100) / 100,
      antioxidantCoatingHealthPct: Math.round(coatingHealthPct * 10) / 10,
      isThermalShockSafe: safetyFactor > 1.35 && surfaceTemp < 1100,
    };
  }
}
