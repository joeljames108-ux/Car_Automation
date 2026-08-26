/**
 * ============================================================================
 * APEX ENGINEER — COMPUTATIONAL ENGINE ACOUSTICS & NVH SOLVER
 * ============================================================================
 * Solves internal combustion & hybrid powertrain acoustics, mechanical NVH,
 * exhaust acoustic resonance, and cabin decibel transfer functions.
 *
 * Subsystems:
 * 1. 1/3-Octave Band Sound Pressure Frequency Spectrum (20 Hz to 20 kHz)
 * 2. Exhaust Pipe Helmholtz Resonant Frequency & Drone Prediction
 * 3. Valvetrain & Piston Slap Mechanical Noise Generator
 * 4. Muffler Acoustic Insertion Loss & Sound Quality Metric (Sone / dB)
 * ============================================================================
 */

import { MasterEngineState } from "./masterEngineTypes";

export interface OctaveBandFrequencySample {
  centerFreqHz: number;
  soundPressureLevelDb: number; // SPL in dB
  dBAWeighted: number;
}

export interface ExhaustAcousticResonance {
  fundamentalExhaustPulseFreqHz: number;
  helmholtzResonatorFreqHz: number;
  exhaustPipeLengthM: number;
  isCabinDroneRisk: boolean;
  droneRpmRange: [number, number]; // e.g. [2200, 2600] RPM
  mufflerInsertionLossDb: number;
}

export interface MechanicalNoiseMetrics {
  valvetrainTappetNoiseDb: number;
  pistonSlapNoiseDb: number;
  timingChainWhineDb: number;
  gearMeshWhineDb: number;
  combustionClatterDb: number;
  overallEngineBayNoiseDbA: number;
  cabinNoiseAtCruiseDbA: number;
  cabinNoiseAtWOTDbA: number;
}

export interface NVHAcousticsReport {
  rpm: number;
  overallDbA: number;
  loudnessSones: number;
  soundQualityScore: number; // 0 to 100
  octaveBands: OctaveBandFrequencySample[];
  exhaustResonance: ExhaustAcousticResonance;
  mechanicalNoise: MechanicalNoiseMetrics;
}

export class EngineAcousticsNVHSolver {
  // Standard 1/3 Octave ISO Center Frequencies (Hz)
  public static readonly CENTER_FREQUENCIES_HZ = [
    25, 31.5, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630, 800,
    1000, 1250, 1600, 2000, 2500, 3150, 4000, 5000, 6300, 8000, 10000, 12500, 16000
  ];

  // A-weighting decibel correction factors per frequency band (IEC 61672:2003)
  private static readonly A_WEIGHTING_DB: Record<number, number> = {
    25: -44.7, 31.5: -39.4, 40: -34.6, 50: -30.2, 63: -26.2, 80: -22.5, 100: -19.1, 125: -16.1,
    160: -13.4, 200: -10.9, 250: -8.6, 315: -6.6, 400: -4.8, 500: -3.2, 630: -1.9, 800: -0.8,
    1000: 0.0, 1250: 0.6, 1600: 1.0, 2000: 1.2, 2500: 1.3, 3150: 1.2, 4000: 1.0, 5000: 0.5,
    6300: -0.1, 8000: -1.1, 10000: -2.5, 12500: -4.3, 16000: -6.6
  };

  /**
   * Evaluates total acoustics, NVH noise, frequency spectra & exhaust resonance
   */
  public static solve(
    state: MasterEngineState,
    rpm: number = 3500,
    throttle: number = 0.8
  ): NVHAcousticsReport {
    const numCyl = state.architecture.cylinderCount;
    const isElectric = (state.architecture.family as string) === "electric";
    const exhaustStyle = state.exhaust?.headerStyle || "cast_manifold";
    const isTitaniumExhaust = state.cosmetics?.exhaustFinish === "titanium_blued";
    const isStraightPipe = exhaustStyle === "inconel_pie_cut_hot_v";

    // 1. Fundamental Firing Frequency (Hz)
    // Freq = (RPM / 60) * (Cylinders / 2)
    const fundamentalExhaustFreqHz = isElectric ? 0 : (rpm / 60) * (numCyl / 2);

    // 2. Exhaust Acoustics & Resonator Calculation
    const pipeLengthM = 3.2; // Typical dual exhaust pipe length
    const speedOfSoundMs = 343; // Air speed of sound
    const helmholtzResonatorFreqHz = Number((speedOfSoundMs / (2 * pipeLengthM)).toFixed(1)); // ~53.6 Hz

    // Check if fundamental exhaust pulse frequency aligns with Helmholtz resonance (Drone Risk)
    const droneFreqRatio = fundamentalExhaustFreqHz / Math.max(1, helmholtzResonatorFreqHz);
    const isCabinDroneRisk = !isElectric && Math.abs(droneFreqRatio - 1.0) < 0.15;
    const droneStartRpm = Math.round((helmholtzResonatorFreqHz * 0.85 * 60) / (numCyl / 2));
    const droneEndRpm = Math.round((helmholtzResonatorFreqHz * 1.15 * 60) / (numCyl / 2));

    const mufflerInsertionLossDb = isStraightPipe ? 4 : isTitaniumExhaust ? 14 : 22;

    // 3. Mechanical Component Noise Breakdown (dBA)
    const valvetrainTappetNoiseDb = isElectric ? 20 : Math.round(55 + (rpm / 8000) * 22 + (state.cylinderHeads?.valvetrain.includes("solid") ? 12 : 0));
    const pistonSlapNoiseDb = isElectric ? 15 : Math.round(48 + (rpm / 8000) * 24 + (state.pistons?.materialClass?.includes("2618") ? 10 : 0));
    const timingChainWhineDb = isElectric ? 30 : Math.round(50 + (rpm / 8000) * 18);
    const gearMeshWhineDb = Math.round(42 + (rpm / 8000) * 32);
    const combustionClatterDb = isElectric ? 10 : Math.round(68 + throttle * 28 + (state.turboSystem?.type !== "naturally_aspirated" ? 12 : 0));

    const overallEngineBayNoiseDbA = isElectric
      ? Math.round(58 + (rpm / 10000) * 20)
      : Math.round(75 + (rpm / 8000) * 32 * throttle - (mufflerInsertionLossDb * 0.4));

    const cabinIsolationDb = 38.0; // Typical acoustic insulation rating
    const cabinNoiseAtCruiseDbA = Math.round(overallEngineBayNoiseDbA - cabinIsolationDb);
    const cabinNoiseAtWOTDbA = Math.round(overallEngineBayNoiseDbA - cabinIsolationDb + 16);

    // 4. Generate 1/3-Octave Band Frequency Spectrum
    const octaveBands: OctaveBandFrequencySample[] = [];

    this.CENTER_FREQUENCIES_HZ.forEach((freq) => {
      let baseSpl = 40 + Math.random() * 8; // Baseline background noise

      // Exhaust firing pulse peak frequency
      if (!isElectric && fundamentalExhaustFreqHz > 0) {
        const deltaFreq = Math.abs(freq - fundamentalExhaustFreqHz);
        if (deltaFreq < fundamentalExhaustFreqHz * 0.4) {
          const spike = 35 * Math.exp(-Math.pow(deltaFreq / (fundamentalExhaustFreqHz * 0.2), 2));
          baseSpl += spike;
        }
      }

      // Valvetrain high frequency mechanical noise (2 kHz - 8 kHz)
      if (freq >= 2000 && freq <= 8000) {
        baseSpl += (valvetrainTappetNoiseDb - 50) * 0.5;
      }

      // High RPM induction howl (1 kHz - 4 kHz)
      if (freq >= 1000 && freq <= 4000) {
        baseSpl += throttle * 12;
      }

      const splDb = Math.min(130, Math.max(25, Number(baseSpl.toFixed(1))));
      const aWeighting = this.A_WEIGHTING_DB[freq] || 0;
      const dBAVal = Number((splDb + aWeighting).toFixed(1));

      octaveBands.push({
        centerFreqHz: freq,
        soundPressureLevelDb: splDb,
        dBAWeighted: dBAVal,
      });
    });

    // Loudness in Sones approximation (1 Sone = 40 dB at 1 kHz)
    const loudnessSones = Number((Math.pow(2, (overallEngineBayNoiseDbA - 40) / 10)).toFixed(1));
    const soundQualityScore = Math.min(100, Math.max(10, Math.round(
      100 - (overallEngineBayNoiseDbA > 95 ? (overallEngineBayNoiseDbA - 95) * 3 : 0) - (isCabinDroneRisk ? 25 : 0) + (isTitaniumExhaust ? 12 : 0)
    )));

    return {
      rpm,
      overallDbA: overallEngineBayNoiseDbA,
      loudnessSones,
      soundQualityScore,
      octaveBands,
      exhaustResonance: {
        fundamentalExhaustPulseFreqHz: Number(fundamentalExhaustFreqHz.toFixed(1)),
        helmholtzResonatorFreqHz,
        exhaustPipeLengthM: pipeLengthM,
        isCabinDroneRisk,
        droneRpmRange: [droneStartRpm, droneEndRpm],
        mufflerInsertionLossDb,
      },
      mechanicalNoise: {
        valvetrainTappetNoiseDb,
        pistonSlapNoiseDb,
        timingChainWhineDb,
        gearMeshWhineDb,
        combustionClatterDb,
        overallEngineBayNoiseDbA,
        cabinNoiseAtCruiseDbA,
        cabinNoiseAtWOTDbA,
      },
    };
  }
}
