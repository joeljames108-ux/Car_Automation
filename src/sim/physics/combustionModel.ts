// ===================================================================
// COMBUSTION THERMODYNAMICS MODEL — Wiebe Function & IMEP/BMEP Physics
// ===================================================================
// Phase 1: Replaces empirical torque calculation with thermodynamic
// combustion equations, mass fraction burned, indicated power, and IMEP.

export interface CombustionConfig {
  compressionRatio: number; // e.g. 10.5
  volumetricEfficiency: number; // 0.0 - 1.5 (including boost)
  fuelLHV: number; // Lower Heating Value in MJ/kg (e.g. Gasoline ~44 MJ/kg, E85 ~29 MJ/kg)
  stoichAFR: number; // e.g. 14.7 for Gasoline
  actualAFR: number; // e.g. 12.5 for rich power mixture
  combustionDurationDeg: number; // Crank angle duration of combustion, e.g., 40°-60°
  gamma: number; // Specific heat ratio ~1.30-1.35 for burned gas
}

export interface CombustionResult {
  idealOttoEfficiency: number; // 0-1
  combustionEfficiency: number; // 0-1 accounting for AFR rich/lean losses
  imepGross: number; // Indicated Mean Effective Pressure (bar)
  cylinderPeakPressureEstimate: number; // bar
}

/**
 * Wiebe function for mass fraction burned x(θ)
 * x(θ) = 1 - exp(-a * ((θ - θ_start) / Δθ)^(m + 1))
 * @param theta Current crank angle relative to start of ignition
 * @param deltaTheta Total combustion duration in degrees
 * @param a Efficiency parameter (typically 5.0 for complete combustion)
 * @param m Form factor / shape parameter (typically 2.0 for standard spark ignition)
 */
export function wiebeMassFractionBurned(
  theta: number,
  deltaTheta: number,
  a: number = 5.0,
  m: number = 2.0
): number {
  if (theta <= 0) return 0;
  if (theta >= deltaTheta) return 1;
  const ratio = theta / deltaTheta;
  return 1 - Math.exp(-a * Math.pow(ratio, m + 1));
}

/**
 * Calculates Gross Indicated Mean Effective Pressure (IMEP_gross) in bar
 */
export function calculateIMEP(config: CombustionConfig): CombustionResult {
  const { compressionRatio, volumetricEfficiency, fuelLHV, stoichAFR, actualAFR, gamma } = config;

  // 1. Ideal Otto cycle thermal efficiency
  const idealOttoEfficiency = 1 - 1 / Math.pow(compressionRatio, gamma - 1);

  // 2. Combustion efficiency based on Equivalence Ratio (lambda = actualAFR / stoichAFR)
  const lambda = actualAFR / stoichAFR;
  let combustionEfficiency = 0.98;
  if (lambda < 1.0) {
    // Rich mixture: unburned fuel due to insufficient O2
    combustionEfficiency = 0.98 * lambda;
  } else if (lambda > 1.2) {
    // Too lean: slower flame speed, lower thermal conversion
    combustionEfficiency = 0.98 * Math.max(0.7, 1.0 - (lambda - 1.2) * 0.5);
  }

  // 3. Fuel energy per unit displacement volume (J / m³)
  // Air density at sea level ~ 1.225 kg/m³
  const rhoAir = 1.225;
  const massAirPerVolume = rhoAir * volumetricEfficiency; // kg_air / m³_disp
  const massFuelPerVolume = massAirPerVolume / Math.max(1, actualAFR); // kg_fuel / m³_disp
  const fuelEnergyPerVolume = massFuelPerVolume * (fuelLHV * 1e6); // J / m³

  // 4. Indicated Work per unit displacement = Fuel Energy * Otto Eff * Comb Eff * Real Gas Factor (~0.82)
  const realGasLossFactor = 0.82;
  const indicatedWorkPerVolume = fuelEnergyPerVolume * idealOttoEfficiency * combustionEfficiency * realGasLossFactor; // Pa (N/m²)

  // Convert Pa to bar (1 bar = 100,000 Pa)
  const imepGross = indicatedWorkPerVolume / 100000;

  // Peak cylinder pressure estimate (P_max ≈ P_0 * CR^γ + C * IMEP)
  const p0 = 1.013 * (volumetricEfficiency > 1.0 ? volumetricEfficiency : 1.0); // ambient/boost pressure bar
  const pComp = p0 * Math.pow(compressionRatio, gamma);
  const cylinderPeakPressureEstimate = pComp + imepGross * 2.8;

  return {
    idealOttoEfficiency,
    combustionEfficiency,
    imepGross: Math.max(0, imepGross),
    cylinderPeakPressureEstimate: Math.max(0, cylinderPeakPressureEstimate),
  };
}

/**
 * Calculates Dynamic Compression Ratio based on Intake Valve Closing (IVC) angle (degrees ABDC)
 * DCR = 1 + (Effective Stroke / Clearance Volume)
 */
export function calculateDynamicCompressionRatio(
  staticCR: number,
  ivcDegABDC: number = 45
): number {
  // IVC typically ranges from 30° (commuter) to 70° (race cam) ABDC
  const strokeFraction = Math.cos((ivcDegABDC * Math.PI) / 180);
  const effectiveCR = 1 + (staticCR - 1) * ((1 + strokeFraction) / 2);
  return Math.round(effectiveCR * 100) / 100;
}

/**
 * Evaluates Octane Detonation / Knock Threshold Limit
 * @returns knockSafetyMargin (positive = safe, negative = knocking/detonation risk)
 */
export function evaluateOctaneKnockLimit(
  staticCR: number,
  boostPressureBar: number,
  octaneRating: number = 93, // e.g. 91, 93, 100, 110 (E85/Race)
  iatCelsius: number = 35 // Intake air temperature
): number {
  // Base allowable effective pressure limit for given octane rating
  // 91 Octane ~ 14 bar limit, 93 Octane ~ 17 bar limit, 110 Octane ~ 35 bar limit
  const baseAllowableBar = 10 + (octaneRating - 87) * 0.85;

  // Temperature penalty: every 10°C over 30°C reduces knock limit by 0.6 bar
  const tempPenalty = Math.max(0, (iatCelsius - 30) * 0.06);

  // Current effective charge density factor
  const effectivePressureDemand = staticCR * 1.1 + boostPressureBar * 8.5;

  const margin = baseAllowableBar - tempPenalty - effectivePressureDemand;
  return Math.round(margin * 10) / 10;
}
