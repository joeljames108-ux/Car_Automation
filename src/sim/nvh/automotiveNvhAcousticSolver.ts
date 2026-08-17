// ============================================================================
// PHASE 37 — AUTOMOTIVE NVH & ACOUSTIC SPECTRAL SOLVER
// ============================================================================
// Harmonic order tracking, gear mesh whine frequencies, tire cavity resonance,
// A-weighted interior cabin decibels (dBA), and Active Noise Cancellation (ANC).
// ============================================================================

export interface AcousticHarmonicPeak {
  order: number;
  frequencyHz: number;
  amplitudeDb: number;
  source: 'ENGINE_FIRING' | 'TRANSMISSION_GEARMESH' | 'TIRE_CAVITY' | 'AERO_TURBULENCE';
}

export interface NvhCabinAcousticResult {
  engineRpm: number;
  vehicleSpeedKmh: number;
  gearMeshFrequencyHz: number;
  tireCavityFrequencyHz: number;
  rawCabinSoundPressureDb: number;
  aWeightedCabinLevelDba: number;
  ancActive: boolean;
  ancNoiseReductionDba: number;
  finalCabinSoundDba: number;
  harmonicPeaks: AcousticHarmonicPeak[];
}

export class AutomotiveNvhAcousticSolver {
  /**
   * Evaluates interior cabin noise, vibration, and psychoacoustic harshness.
   */
  public static evaluateCabinNvh(params: {
    rpm: number;
    speedKmh: number;
    cylinderCount: number;
    currentGear: number;
    ancEnabled: boolean;
  }): NvhCabinAcousticResult {
    const rpm = Math.max(800, params.rpm);
    const speed = Math.max(0, params.speedKmh);

    // 1. Engine Firing Fundamental Frequency: f0 = (Cylinders / 2) * (RPM / 60)
    const engineOrder = params.cylinderCount / 2;
    const f0EngineHz = (engineOrder * rpm) / 60;

    // 2. Transmission Gear Mesh Frequency: f_gm = z_pinion * (RPM / 60) (approx 28 teeth)
    const fGearMeshHz = (28 * rpm) / 60;

    // 3. Tire Cavity Acoustic Standing Wave (approx 215 Hz)
    const fTireCavityHz = 215;

    // 4. Harmonic Peak Synthesis
    const peaks: AcousticHarmonicPeak[] = [
      // Primary Engine Order (e.g. 4th order for V8, 3rd for V6, 2nd for I4)
      {
        order: engineOrder,
        frequencyHz: Math.round(f0EngineHz),
        amplitudeDb: Math.min(88, 62 + (rpm / 8000) * 22),
        source: 'ENGINE_FIRING',
      },
      // 2nd Harmonic of Engine Order
      {
        order: engineOrder * 2,
        frequencyHz: Math.round(f0EngineHz * 2),
        amplitudeDb: Math.min(82, 54 + (rpm / 8000) * 24),
        source: 'ENGINE_FIRING',
      },
      // Transmission Straight-Cut / Helical Gear Mesh Whine
      {
        order: 28,
        frequencyHz: Math.round(fGearMeshHz),
        amplitudeDb: Math.min(76, 48 + (speed / 200) * 22),
        source: 'TRANSMISSION_GEARMESH',
      },
      // Tire Cavity Resonance
      {
        order: 0,
        frequencyHz: fTireCavityHz,
        amplitudeDb: Math.min(74, 45 + (speed / 200) * 25),
        source: 'TIRE_CAVITY',
      },
    ];

    // 5. Total Raw Sound Pressure Level (Logarithmic Sum): L_total = 10 * log10(sum(10^(L_i / 10)))
    const sumLinear = peaks.reduce((acc, p) => acc + Math.pow(10, p.amplitudeDb / 10), 0);
    const rawDb = 10 * Math.log10(Math.max(1, sumLinear));

    // 6. A-Weighting Filter Correction (Human Ear Sensitivity)
    const aWeightedDba = Math.max(42, rawDb - 3.5);

    // 7. Active Noise Cancellation (ANC) Anti-Phase Reduction
    const ancReductionDba = params.ancEnabled ? 8.5 : 0.0;
    const finalDba = Math.max(38, aWeightedDba - ancReductionDba);

    return {
      engineRpm: Math.round(rpm),
      vehicleSpeedKmh: Math.round(speed),
      gearMeshFrequencyHz: Math.round(fGearMeshHz),
      tireCavityFrequencyHz: fTireCavityHz,
      rawCabinSoundPressureDb: Math.round(rawDb * 10) / 10,
      aWeightedCabinLevelDba: Math.round(aWeightedDba * 10) / 10,
      ancActive: params.ancEnabled,
      ancNoiseReductionDba: ancReductionDba,
      finalCabinSoundDba: Math.round(finalDba * 10) / 10,
      harmonicPeaks: peaks,
    };
  }
}
