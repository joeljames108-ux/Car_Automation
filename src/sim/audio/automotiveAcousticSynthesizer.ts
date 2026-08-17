// ============================================================================
// PHASE 18 — PROCEDURAL AUTOMOTIVE ENGINE ACOUSTIC SYNTHESIZER
// ============================================================================
// Physics-driven real-time audio synthesis modeling engine cylinder firing
// order harmonics, exhaust resonance, turbocharger spool whine, and tire slip.
// ============================================================================

export interface AcousticSynthesizerState {
  engineRpm: number;
  throttlePct: number; // 0 to 100
  cylinderCount: number; // 4, 6, 8, 10, 12
  isTurbocharged: boolean;
  boostPressureBar: number;
  tireSlipRatio: number; // 0.0 to 1.0
  isMuted: boolean;
}

export interface SynthesizedAudioHarmonics {
  firingFrequencyHz: number; // Fundamental combustion frequency
  firstHarmonicHz: number;
  secondHarmonicHz: number;
  turboSpoolFrequencyHz: number;
  exhaustResonanceGain: number; // 0.0 to 1.0
  gearboxWhineFrequencyHz: number;
  tireScreechGain: number;
}

export class AutomotiveAcousticSynthesizer {
  /**
   * Computes the real-time audio harmonic frequencies and gain levels.
   */
  public static computeHarmonics(state: AcousticSynthesizerState): SynthesizedAudioHarmonics {
    const rpm = Math.max(700, Math.min(10000, state.engineRpm));
    const rps = rpm / 60.0; // Crankshaft revolutions per second

    // 4-Stroke Engine: Each cylinder fires once every 2 crankshaft revolutions
    // Fundamental firing frequency = (CylinderCount / 2) * (RPM / 60)
    const firingFrequencyHz = (state.cylinderCount / 2.0) * rps;
    const firstHarmonicHz = firingFrequencyHz * 2.0;
    const secondHarmonicHz = firingFrequencyHz * 3.0;

    // Turbocharger Turbine Spool Whine (Compressor wheel spins at ~120,000 to 220,000 RPM)
    const turboRpm = state.isTurbocharged ? 30000 + state.boostPressureBar * 95000 : 0;
    const turboSpoolFrequencyHz = (turboRpm / 60.0) * 11; // 11-blade billet compressor wheel

    // Exhaust Gas Resonance Gain (Expands with throttle load)
    const exhaustResonanceGain = 0.2 + (state.throttlePct / 100) * 0.8;

    // Transmission Straight-Cut Dog Gear Whine (Tooth mesh frequency = RPM * GearTeeth / 60)
    const gearboxWhineFrequencyHz = rps * 28.0;

    // Tire Lateral Slip Screech Gain
    const tireScreechGain = Math.max(0.0, Math.min(1.0, (state.tireSlipRatio - 0.08) * 4.0));

    return {
      firingFrequencyHz: Math.round(firingFrequencyHz * 10) / 10,
      firstHarmonicHz: Math.round(firstHarmonicHz * 10) / 10,
      secondHarmonicHz: Math.round(secondHarmonicHz * 10) / 10,
      turboSpoolFrequencyHz: Math.round(turboSpoolFrequencyHz),
      exhaustResonanceGain: Math.round(exhaustResonanceGain * 100) / 100,
      gearboxWhineFrequencyHz: Math.round(gearboxWhineFrequencyHz),
      tireScreechGain: Math.round(tireScreechGain * 100) / 100,
    };
  }
}
