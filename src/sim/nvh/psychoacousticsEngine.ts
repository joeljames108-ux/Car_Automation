// ===================================================================
// PSYCHOACOUSTIC SOUND QUALITY EVALUATION ENGINE
// ===================================================================
// Calculates human auditory perception metrics: Zwicker Loudness (Sones),
// Aures Sharpness (Acums), Roughness (Asper), and Speech Articulation Index.
// ===================================================================

export interface PsychoacousticQualityProfile {
  zwickerLoudnessSones: number; // Auditory volume perception (1 Sone = 40 dB SPL @ 1 kHz)
  auresSharpnessAcums: number; // High frequency harshness rating
  asperRoughnessAsper: number; // Modulation roughness (15-300 Hz modulation)
  articulationIndexPct: number; // % speech intelligibility inside cabin
  cabinLuxuryRating: "WORLD_CLASS_SILENT" | "EXECUTIVE_PREMIUM" | "SPORT_REFINED" | "NOISY_UNREFINED";
  perceivedAcousticSummary: string;
}

export class PsychoacousticsEngine {
  /**
   * Calculates Zwicker Loudness in Sones from dBA sound pressure level.
   * Standard conversion: 1 Sone = 40 dBA. Loudness doubles every +10 dBA.
   */
  public static calculateZwickerLoudness(splDba: number): number {
    if (splDba <= 20) return 0.2;
    const sones = Math.pow(2, (splDba - 40) / 10);
    return Number(sones.toFixed(2));
  }

  /**
   * Evaluates complete psychoacoustic quality metrics for a vehicle interior sound field.
   */
  public static evaluateQuality(params: {
    totalSplDba: number;
    highFrequencyContentPct: number; // % energy above 3 kHz
    modulationFrequencyHz: number; // Modulation frequency
    cabinVolumeM3: number;
    glassAcousticLaminated: boolean;
  }): PsychoacousticQualityProfile {
    const { totalSplDba, highFrequencyContentPct, modulationFrequencyHz, glassAcousticLaminated } = params;

    // 1. Zwicker Loudness (Sones)
    let zwickerLoudnessSones = this.calculateZwickerLoudness(totalSplDba);
    if (glassAcousticLaminated) {
      zwickerLoudnessSones *= 0.82; // 18% reduction from acoustic acoustic laminate glass
    }

    // 2. Aures Sharpness (Acums) - Higher high-frequency content increases sharpness
    const auresSharpnessAcums = Number((0.8 + (highFrequencyContentPct / 100) * 1.8).toFixed(2));

    // 3. Roughness (Asper) - Peak roughness occurs near 70 Hz modulation
    const modulationFactor = Math.exp(-Math.pow(modulationFrequencyHz - 70, 2) / 2000);
    const asperRoughnessAsper = Number((0.2 + modulationFactor * 1.5).toFixed(2));

    // 4. Articulation Index (AI %) - % intelligibility of speech
    // AI decreases as dBA noise level increases
    const rawAi = Math.max(0, Math.min(100, 100 - (totalSplDba - 40) * 1.8));
    const articulationIndexPct = Number(rawAi.toFixed(1));

    // 5. Cabin Luxury Classification
    let cabinLuxuryRating: "WORLD_CLASS_SILENT" | "EXECUTIVE_PREMIUM" | "SPORT_REFINED" | "NOISY_UNREFINED" =
      "SPORT_REFINED";
    let perceivedAcousticSummary = "Sporty exhaust note with moderate cabin road noise.";

    if (totalSplDba < 58 && zwickerLoudnessSones < 4.0) {
      cabinLuxuryRating = "WORLD_CLASS_SILENT";
      perceivedAcousticSummary = "Serene, whisper-quiet cabin environment rivaling luxury flagships.";
    } else if (totalSplDba < 66) {
      cabinLuxuryRating = "EXECUTIVE_PREMIUM";
      perceivedAcousticSummary = "Well-insulated executive interior with muted powertrain harmonics.";
    } else if (totalSplDba > 78) {
      cabinLuxuryRating = "NOISY_UNREFINED";
      perceivedAcousticSummary = "High cabin noise floor causing speech masking and long-trip fatigue.";
    }

    return {
      zwickerLoudnessSones: Number(zwickerLoudnessSones.toFixed(2)),
      auresSharpnessAcums,
      asperRoughnessAsper,
      articulationIndexPct,
      cabinLuxuryRating,
      perceivedAcousticSummary,
    };
  }
}
