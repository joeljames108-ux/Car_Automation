// ===================================================================
// KNOCK PREDICTION & ENGINE PROTECTION — Livengood-Wu Integral
// ===================================================================
// Phase 11: Livengood-Wu auto-ignition integral model for knock onset,
// octane rating requirements, ignition retard compensation, and damage accumulation.

export interface KnockParams {
  octaneRatingR+M2: number; // e.g. 91, 93, 98, 100 RON
  compressionRatio: number;
  boostPressureBar: number;
  ignitionTimingDegBTDC: number;
  afr: number;
  coolantTempC: number;
  hasKnockSensor: boolean;
}

export interface KnockState {
  knockIntegral: number; // 0.0 to 1.0 (>= 1.0 means auto-ignition / detonation occurs)
  isKnocking: boolean;
  knockIntensity: number; // 0.0 (none) to 1.0 (destructive detonation)
  ecuTimingRetardDeg: number; // Degrees of timing pulled by ECU knock control
  octaneRequired: number; // Recommended octane rating
  knockDamageRisk: number; // Cumulative engine reliability penalty
}

/**
 * Calculates Livengood-Wu Auto-Ignition Knock Integral
 */
export function evaluateKnock(
  rpm: number,
  params: KnockParams
): KnockState {
  const {
    compressionRatio, boostPressureBar, ignitionTimingDegBTDC,
    afr, coolantTempC, hasKnockSensor
  } = params;
  const octane = params['octaneRatingR+M2'] || 93;

  // 1. Calculate Required Octane
  const effectiveCR = compressionRatio + boostPressureBar * 0.7;
  const octaneRequired = Math.round(85 + (effectiveCR - 8) * 3.8 + (boostPressureBar > 0 ? boostPressureBar * 7 : 0));

  // 2. Unburned end-gas temperature and pressure estimate
  const endGasTempK = 350 + coolantTempC * 1.2 + (effectiveCR - 9) * 25 + boostPressureBar * 40;
  const endGasPressureBar = 10 * Math.pow(effectiveCR, 1.3) + boostPressureBar * 15;

  // 3. Ignition timing factor (advance beyond MBT ~28° increases end-gas residence time)
  const timingOverAdvance = Math.max(0, ignitionTimingDegBTDC - 26);

  // 4. Livengood-Wu auto-ignition delay tau (ms)
  // tau = A * P^(-n) * exp(B / T)
  const A = 0.018;
  const B = 4800;
  const tauMs = A * Math.pow(endGasPressureBar, -1.2) * Math.exp(B / endGasTempK) * (octane / 90);

  // Residence time in end-gas zone (ms) = f(RPM, ignition advance)
  const residenceTimeMs = (15 / (rpm / 60)) * (1 + timingOverAdvance * 0.03);

  // Knock Integral I = ∫ (1 / tau) dt ≈ residenceTime / tau
  const knockIntegral = residenceTimeMs / Math.max(0.1, tauMs);

  let isKnocking = knockIntegral >= 0.85;
  let knockIntensity = Math.max(0, Math.min(1.0, (knockIntegral - 0.85) / 0.5));
  let ecuTimingRetardDeg = 0;

  if (isKnocking && hasKnockSensor) {
    // ECU knock control pulls up to 8° of timing to stop detonation
    ecuTimingRetardDeg = Math.min(8, Math.round(knockIntensity * 10));
    // Pulling timing reduces effective knock intensity
    knockIntensity = Math.max(0, knockIntensity - (ecuTimingRetardDeg * 0.1));
    if (knockIntensity < 0.15) isKnocking = false;
  }

  const knockDamageRisk = Math.min(1.0, knockIntensity * (1 - (hasKnockSensor ? 0.7 : 0)));

  return {
    knockIntegral: Math.round(knockIntegral * 100) / 100,
    isKnocking,
    knockIntensity: Math.round(knockIntensity * 100) / 100,
    ecuTimingRetardDeg,
    octaneRequired,
    knockDamageRisk: Math.round(knockDamageRisk * 100) / 100,
  };
}
