// ===================================================================
// AR HEAD-UP DISPLAY (HUD) & HMI COGNITIVE WORKLOAD ENGINE
// ===================================================================
// Models Augmented Reality (AR) HUD Projection Optics (7.5m Virtual Distance,
// 12,000 nits luminance), NHTSA Visual Distraction Glance Durations,
// 18-Speaker Spatial Audio DSP, and HMI Cognitive Workload Index.
// ===================================================================

export interface ArHudProjectionSpec {
  virtualImageDistanceMeters: number; // e.g. 7.5m focal plane
  fieldOfViewDegX: number; // e.g. 10.0° horizontal
  fieldOfViewDegY: number; // e.g. 4.0° vertical
  displayLuminanceNits: number; // e.g. 12,000 nits daylight sunlight viewable
  eyeboxSizeMmX: number; // 130mm x 80mm eyebox
  eyeboxSizeMmY: number;
  arNavigationOverlayLatencyMs: number; // e.g. 15ms zero-latency tracking
}

export interface NhtsaVisualDistractionAudit {
  singleGlanceDurationMaxSec: number; // Max 2.0s allowed by NHTSA guidelines
  totalGlanceTimeCumulativeSec: number; // Max 12.0s total task completion
  offRoadVisualGlancePct: number;
  isNhtsaGuidelineCompliant: boolean;
  hmiCognitiveWorkloadIndex: number; // 0 - 100 (Lower = Safer)
}

export interface AudioSystemAcousticSpec {
  speakerCount: number; // e.g. 18-speaker setup
  totalAmplifierPowerWatts: number; // e.g. 1400W Class-D amp
  subwooferCount: number;
  hasSpatialAudioBeamforming: boolean;
  frequencyResponseHz: string; // "20 Hz - 40,000 Hz"
  totalHarmonicDistortionThdPct: number;
}

export interface HmiSimulationResult {
  arHudSpec: ArHudProjectionSpec;
  nhtsaDistractionAudit: NhtsaVisualDistractionAudit;
  audioSpec: AudioSystemAcousticSpec;
  hmiOverallSafetyRatingPct: number; // 0 - 100
}

export class InfotainmentHmiEngine {
  /**
   * Evaluates NHTSA Driver Visual Distraction & HMI Cognitive Workload.
   */
  public static auditNhtsaDistraction(params: {
    touchscreenDiagonalInches: number;
    hasPhysicalClimateButtons: boolean;
    hasSteeringWheelScrollWheels: boolean;
    hasVoiceCommandAi: boolean;
  }): NhtsaVisualDistractionAudit {
    const { touchscreenDiagonalInches, hasPhysicalClimateButtons, hasSteeringWheelScrollWheels, hasVoiceCommandAi } = params;

    // Physical buttons reduce off-road visual glance time significantly
    let singleGlanceMaxSec = 1.4;
    let totalGlanceSec = 7.5;

    if (!hasPhysicalClimateButtons) {
      singleGlanceMaxSec += 0.5; // Touchscreen climate controls increase glance duration
      totalGlanceSec += 3.2;
    }

    if (touchscreenDiagonalInches > 15) {
      totalGlanceSec += 1.5;
    }

    if (hasVoiceCommandAi) {
      singleGlanceMaxSec *= 0.75;
      totalGlanceSec *= 0.65;
    }

    const isNhtsaGuidelineCompliant = singleGlanceMaxSec <= 2.0 && totalGlanceSec <= 12.0;
    const hmiCognitiveWorkloadIndex = Number(Math.min(99, Math.max(10, (singleGlanceMaxSec / 2.0) * 50 + (totalGlanceSec / 12.0) * 50)).toFixed(1));

    return {
      singleGlanceDurationMaxSec: Number(singleGlanceMaxSec.toFixed(2)),
      totalGlanceTimeCumulativeSec: Number(totalGlanceSec.toFixed(2)),
      offRoadVisualGlancePct: Number(((totalGlanceSec / 20.0) * 100).toFixed(1)),
      isNhtsaGuidelineCompliant,
      hmiCognitiveWorkloadIndex,
    };
  }

  /**
   * Executes full HMI & AR HUD System Simulation.
   */
  public static simulateHmiSystem(params: {
    hasArHud: boolean;
    touchscreenDiagonalInches: number;
    hasPhysicalClimateButtons: boolean;
    speakerCount: number;
  }): HmiSimulationResult {
    const { hasArHud, touchscreenDiagonalInches, hasPhysicalClimateButtons, speakerCount } = params;

    const arHudSpec: ArHudProjectionSpec = {
      virtualImageDistanceMeters: hasArHud ? 7.5 : 2.5,
      fieldOfViewDegX: hasArHud ? 10.0 : 4.0,
      fieldOfViewDegY: hasArHud ? 4.0 : 2.0,
      displayLuminanceNits: hasArHud ? 12000 : 3000,
      eyeboxSizeMmX: 130,
      eyeboxSizeMmY: 80,
      arNavigationOverlayLatencyMs: 14,
    };

    const nhtsaDistractionAudit = this.auditNhtsaDistraction({
      touchscreenDiagonalInches,
      hasPhysicalClimateButtons,
      hasSteeringWheelScrollWheels: true,
      hasVoiceCommandAi: true,
    });

    const audioSpec: AudioSystemAcousticSpec = {
      speakerCount,
      totalAmplifierPowerWatts: speakerCount * 80,
      subwooferCount: speakerCount >= 12 ? 2 : 1,
      hasSpatialAudioBeamforming: speakerCount >= 14,
      frequencyResponseHz: "20 Hz - 40,000 Hz",
      totalHarmonicDistortionThdPct: 0.05,
    };

    const hmiOverallSafetyRatingPct = Number(Math.min(99, Math.max(30, 100 - nhtsaDistractionAudit.hmiCognitiveWorkloadIndex + (hasArHud ? 15 : 0))).toFixed(1));

    return {
      arHudSpec,
      nhtsaDistractionAudit,
      audioSpec,
      hmiOverallSafetyRatingPct,
    };
  }
}
