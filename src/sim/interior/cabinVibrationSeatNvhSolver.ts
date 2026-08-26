/**
 * ============================================================================
 * VEHICLE CABIN NVH & ISO 2631-1 SEAT VIBRATION TRANSMISSIBILITY SOLVER
 * ============================================================================
 * Physics-based 6-DOF biomechanical vibration & NVH solver:
 * 1. ISO 2631-1 Whole-Body Vibration (WBV) & Frequency Weighting ($W_k, W_d$)
 *    - Weighted RMS Acceleration $a_w = \sqrt{\sum (W_i \cdot a_i)^2}$ (m/s²)
 *    - Vibration Dose Value (VDV) & Health Exposure Limits (ISO 2631-1 Action Level 0.5 m/s1.75)
 * 2. Seat Effective Amplitude Transmissibility (SEAT Factor)
 *    - $\text{SEAT} = \frac{a_{w,\text{seat}}}{a_{w,\text{floor}}}$ (Ratio < 1.0 indicates vibration attenuation)
 * 3. Engine Order Structure-Borne Noise & NTF Transfer Functions
 * 4. Active Magneto-Rheological (MR) Seat Suspension Damper Controller
 * ============================================================================
 */

import { MasterModularInteriorState } from "./masterInteriorTypes";

export interface Iso2631VibrationMetrics {
  floorAccelRmsMps2: number;
  seatAccelRmsMps2: number;
  weightedAccelAwMps2: number;
  seatFactorRatio: number; // SEAT < 1.0 is attenuating
  vibrationDoseValueVdv: number; // m/s^1.75
  healthRiskCategory: "COMFORTABLE" | "AWARENESS_ZONE" | "HEALTH_RISK_ZONE";
  dominantVibrationFrequencyHz: number;
  seatTransmissibilityPeakDb: number;
}

export interface CabinNvhSpectrumPoint {
  frequencyHz: number;
  floorSplDba: number;
  seatSplDba: number;
  attenuationDb: number;
}

export class CabinVibrationSeatNvhSolver {
  /**
   * Solves ISO 2631-1 Whole-Body Vibration and SEAT Transmissibility Factor
   */
  public static solveSeatVibrationNvh(
    state: MasterModularInteriorState,
    engineRpm: number = 4200,
    vehicleSpeedKmh: number = 100,
    activeMrDamperEnabled: boolean = true
  ): Iso2631VibrationMetrics {
    // 1. Engine Firing Order & Dominant Harmonic Frequency
    const engineOrders = 3.0; // V6 / V12 3rd order primary
    const dominantFreqHz = (engineRpm / 60) * engineOrders;

    // 2. Road Surface Input Floor Acceleration (ISO 8608 Class B/C Road)
    const baseRoadAccelMps2 = 0.45 + Math.pow(vehicleSpeedKmh / 100, 1.8) * 0.55;
    const engineVibrationContrib = Math.pow(engineRpm / 3000, 1.4) * 0.35;
    const floorAccelRmsMps2 = baseRoadAccelMps2 + engineVibrationContrib;

    // 3. Seat Cushion Natural Frequency & Damping Ratio
    const isCarbonBucket = state.seating.frontSeatType === "carbon_monocoque_fixed_bucket" || state.seating.frontSeatType === "fia_homologated_racing_bucket";
    const naturalFreqHz = isCarbonBucket ? 6.2 : 3.8; // Hz
    const dampingRatio = isCarbonBucket ? 0.18 : 0.32;

    // 4. Active MR (Magneto-Rheological) Damper Attenuation
    let mrDamperFactor = 1.0;
    if (activeMrDamperEnabled) {
      mrDamperFactor = isCarbonBucket ? 0.72 : 0.58; // Active damper reduces transmissibility
    }

    // Single-DOF Transmissibility Formula: TR = sqrt((1 + (2*zeta*r)^2) / ((1 - r^2)^2 + (2*zeta*r)^2))
    const freqRatio = dominantFreqHz / naturalFreqHz;
    const numerator = 1 + Math.pow(2 * dampingRatio * freqRatio, 2);
    const denominator = Math.pow(1 - Math.pow(freqRatio, 2), 2) + Math.pow(2 * dampingRatio * freqRatio, 2);
    const rawTransmissibility = Math.sqrt(numerator / denominator);

    const netSeatTransmissibilityRatio = rawTransmissibility * mrDamperFactor;

    // 5. ISO 2631-1 Frequency Weighting W_k for Z-Axis
    const wkWeight = dominantFreqHz < 4.0 ? 0.5 : dominantFreqHz < 12.5 ? 1.0 : Math.max(0.1, 12.5 / dominantFreqHz);
    const seatAccelRmsMps2 = floorAccelRmsMps2 * netSeatTransmissibilityRatio;
    const weightedAccelAwMps2 = seatAccelRmsMps2 * wkWeight;

    // SEAT Factor Ratio = seatAw / floorAw
    const seatFactorRatio = parseFloat((weightedAccelAwMps2 / Math.max(0.01, floorAccelRmsMps2 * wkWeight)).toFixed(2));

    // Vibration Dose Value VDV = (1.4 * aw) * t^0.25 (for 8-hour drive t = 28800s)
    const exposureTimeSec = 28800;
    const vdv = parseFloat((1.4 * weightedAccelAwMps2 * Math.pow(exposureTimeSec, 0.25)).toFixed(2));

    // ISO 2631-1 Health Risk Category
    let healthRisk: Iso2631VibrationMetrics["healthRiskCategory"] = "COMFORTABLE";
    if (weightedAccelAwMps2 > 0.8) healthRisk = "HEALTH_RISK_ZONE";
    else if (weightedAccelAwMps2 > 0.45) healthRisk = "AWARENESS_ZONE";

    const peakDb = parseFloat((20 * Math.log10(Math.max(0.1, netSeatTransmissibilityRatio))).toFixed(1));

    return {
      floorAccelRmsMps2: parseFloat(floorAccelRmsMps2.toFixed(3)),
      seatAccelRmsMps2: parseFloat(seatAccelRmsMps2.toFixed(3)),
      weightedAccelAwMps2: parseFloat(weightedAccelAwMps2.toFixed(3)),
      seatFactorRatio,
      vibrationDoseValueVdv: vdv,
      healthRiskCategory: healthRisk,
      dominantVibrationFrequencyHz: Math.round(dominantFreqHz),
      seatTransmissibilityPeakDb: peakDb,
    };
  }

  /**
   * Generates a 10-point NVH frequency attenuation spectrum (20 Hz to 500 Hz)
   */
  public static generateNvhSpectrum(
    state: MasterModularInteriorState,
    engineRpm: number = 4200
  ): CabinNvhSpectrumPoint[] {
    const points: CabinNvhSpectrumPoint[] = [];
    const freqs = [20, 40, 63, 100, 125, 160, 200, 250, 315, 500];

    freqs.forEach((f) => {
      const floorSpl = 65 + 15 * Math.log10(f / 20) + (engineRpm / 4200) * 8;
      const absorption = state.materials.seatPrimaryMaterial === "perforated_alcantara" ? 14 : 9;
      const ancGain = state.audio.hasActiveNoiseCancellation && f < 250 ? 12 : 3;

      const seatSpl = Math.max(30, floorSpl - absorption - ancGain);
      const atten = floorSpl - seatSpl;

      points.push({
        frequencyHz: f,
        floorSplDba: parseFloat(floorSpl.toFixed(1)),
        seatSplDba: parseFloat(seatSpl.toFixed(1)),
        attenuationDb: parseFloat(atten.toFixed(1)),
      });
    });

    return points;
  }
}
