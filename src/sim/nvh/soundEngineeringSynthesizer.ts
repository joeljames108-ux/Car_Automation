// ===================================================================
// PROCEDURAL AUTOMOTIVE ACOUSTIC SOUND SYNTHESIZER
// ===================================================================
// Integrates Order Tracking, Psychoacoustics, Active Noise Cancellation,
// and exhaust valve acoustic bypass for complete sound synthesis.
// ===================================================================

import { OrderTrackingAnalyzer, NvhOrderSweepResult } from "./orderTrackingAnalyzer";
import { PsychoacousticsEngine, PsychoacousticQualityProfile } from "./psychoacousticsEngine";
import { ActiveNoiseCancellationDsp, AncDspTickResult } from "./activeNoiseCancellationDsp";

export interface SoundSynthesisConfig {
  cylinders: number;
  engineRpm: number;
  vehicleSpeedKmH: number;
  exhaustValveOpen: boolean; // Active exhaust flap bypass
  cabinGlassAcousticLaminate: boolean;
  ancActive: boolean;
  gearRatio: number;
  finalDriveRatio: number;
  tireRadiusM: number;
}

export interface SoundSynthesisOutput {
  orderSweep: NvhOrderSweepResult;
  psychoacoustics: PsychoacousticQualityProfile;
  ancStatus: AncDspTickResult;
  synthesizedExhaustFrequencyHz: number;
  turboSpoolWhineFreqHz: number;
  finalCabinDba: number;
  soundSignatureDescription: string;
}

const soundCache = new Map<string, SoundSynthesisOutput>();
const MAX_SOUND_CACHE = 40;

export class SoundEngineeringSynthesizer {
  /**
   * Synthesizes full vehicle acoustic telemetry and sound quality metrics.
   */
  public static synthesizeSound(config: SoundSynthesisConfig): SoundSynthesisOutput {
    const cacheKey = `${config.cylinders}_${config.engineRpm}_${Math.round(config.vehicleSpeedKmH)}_${config.exhaustValveOpen}_${config.cabinGlassAcousticLaminate}_${config.ancActive}`;
    if (soundCache.has(cacheKey)) {
      return soundCache.get(cacheKey)!;
    }
    const {
      cylinders,
      engineRpm,
      vehicleSpeedKmH,
      exhaustValveOpen,
      cabinGlassAcousticLaminate,
      ancActive,
      gearRatio,
      finalDriveRatio,
      tireRadiusM,
    } = config;

    const baseCabinIsolation = cabinGlassAcousticLaminate ? 28 : 22;

    // 1. Order Tracking Sweep
    const orderSweep = OrderTrackingAnalyzer.analyzeOrders({
      engineRpm,
      cylinders,
      vehicleSpeedKmH,
      gearRatio,
      finalDriveRatio,
      tireRadiusM,
      cabinIsolationDba: baseCabinIsolation,
    });

    let rawSpl = orderSweep.totalSoundPressureDba;
    if (exhaustValveOpen) {
      rawSpl += 8.5; // Active exhaust bypass increases SPL by +8.5 dBA
    }

    // 2. Active Noise Cancellation
    const ancStatus = ActiveNoiseCancellationDsp.prototype.processFxLmsTick({
      rawSplDba: rawSpl,
      engineFiringOrder: orderSweep.primaryFiringOrder,
      referenceSignalFreqHz: orderSweep.dominantFrequencyHz,
      speakerCount: 8,
    });

    const finalCabinDba = ancActive && ancStatus.isAncEnabled ? ancStatus.cancelledSplDba : rawSpl;

    // 3. Psychoacoustic Evaluation
    const psychoacoustics = PsychoacousticsEngine.evaluateQuality({
      totalSplDba: finalCabinDba,
      highFrequencyContentPct: exhaustValveOpen ? 45 : 20,
      modulationFrequencyHz: orderSweep.dominantFrequencyHz,
      cabinVolumeM3: 3.5,
      glassAcousticLaminated: cabinGlassAcousticLaminate,
    });

    // Synthesized Frequencies
    const synthesizedExhaustFrequencyHz = orderSweep.dominantFrequencyHz;
    const turboSpoolWhineFreqHz = (engineRpm * 18) / 60; // Turbo wheel spins ~18x engine RPM

    const soundSignatureDescription = `${cylinders}-cylinder ${orderSweep.primaryFiringOrder}E acoustic harmonic (${synthesizedExhaustFrequencyHz} Hz), ${
      exhaustValveOpen ? "Active Exhaust Valves OPEN" : "Muffled Exhaust"
    }, ${ancActive ? "ANC Active (-" + ancStatus.noiseAttenuationDb + " dB)" : "ANC Off"}.`;

    const res: SoundSynthesisOutput = {
      orderSweep,
      psychoacoustics,
      ancStatus,
      synthesizedExhaustFrequencyHz,
      turboSpoolWhineFreqHz,
      finalCabinDba,
      soundSignatureDescription,
    };

    if (soundCache.size >= MAX_SOUND_CACHE) {
      const firstKey = soundCache.keys().next().value;
      if (firstKey) soundCache.delete(firstKey);
    }
    soundCache.set(cacheKey, res);

    return res;
  }
}
