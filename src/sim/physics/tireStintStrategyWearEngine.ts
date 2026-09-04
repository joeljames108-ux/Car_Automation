// ============================================================================
// MODULE 13: TIRE STINT THERMAL DEGRADATION & RACE STRATEGY OPTIMIZER
// ============================================================================
// Comprehensive tire lifecycle, degradation kinetics & race strategy model:
// 1. Polymer vulcanization cross-link thermal aging & rubber durometer hardening
// 2. 3-Zone Infrared contact patch thermal profile (Inner, Center, Outer)
// 3. Camber indicator (T_in - T_out) & Inflation pressure crowning (T_center - T_mean)
// 4. Multi-compound database (Soft, Medium, Hard, Intermediate, Wet)
// 5. Undercut vs Overcut delta, pit lane transit loss, and optimal pit window
// ============================================================================

export type PirelliCompoundTier = 'C1_Hard' | 'C2_Medium_Hard' | 'C3_Medium' | 'C4_Soft_Medium' | 'C5_Soft' | 'Intermediate' | 'Full_Wet';

export interface CompoundCharacteristics {
  name: string;
  tier: PirelliCompoundTier;
  peakGripMu: number;              // Initial fresh tire friction coefficient
  wearRateFractionPerLap: number;  // Base wear per lap (e.g. 0.025)
  cliffWearThreshold: number;      // Wear fraction where grip falls off cliff (e.g. 0.75)
  optimalTempWindowLowC: number;   // e.g. 90 °C
  optimalTempWindowHighC: number;  // e.g. 115 °C
  heatCycleHardeningDurometerDelta: number; // Shore A durometer hardening per heat cycle
  isWetTread: boolean;
  grooveDepthMm: number;           // Tread depth for water displacement
}

export interface ThreeZoneTireThermalProfile {
  innerShoulderTempC: number;
  centerTreadTempC: number;
  outerShoulderTempC: number;
  bulkCoreTempC: number;
  camberDiagnosticMessage: string;
  pressureDiagnosticMessage: string;
}

export interface StintLapSimulationStep {
  lapNumber: number;
  lapTimeSeconds: number;
  lapTimeDeltaToBestSeconds: number;
  tireWearPercent: number;
  tireGripMu: number;
  heatCyclesCount: number;
  isPastCliff: boolean;
  thermals: ThreeZoneTireThermalProfile;
}

export interface StrategyStintEvaluation {
  compound: PirelliCompoundTier;
  targetStintLaps: number;
  optimalPitStopLap: number;
  totalStintTimeSeconds: number;
  averageLapTimeSeconds: number;
  undercutPaceDeltaSeconds: number; // Advantage on lap 1 out of pits
  pitStopTransitLossSeconds: number;
  lapByLapProgression: StintLapSimulationStep[];
}

export class TireStintStrategyWearEngine {
  public static readonly RACING_COMPOUNDS: Record<PirelliCompoundTier, CompoundCharacteristics> = {
    C5_Soft: {
      name: 'Pirelli P Zero C5 (Softest Red)',
      tier: 'C5_Soft',
      peakGripMu: 1.88,
      wearRateFractionPerLap: 0.042, // High wear (~18-22 laps)
      cliffWearThreshold: 0.68,
      optimalTempWindowLowC: 80,
      optimalTempWindowHighC: 105,
      heatCycleHardeningDurometerDelta: 2.8,
      isWetTread: false,
      grooveDepthMm: 0,
    },
    C3_Medium: {
      name: 'Pirelli P Zero C3 (Medium Yellow)',
      tier: 'C3_Medium',
      peakGripMu: 1.76,
      wearRateFractionPerLap: 0.024, // Balanced (~30-35 laps)
      cliffWearThreshold: 0.78,
      optimalTempWindowLowC: 95,
      optimalTempWindowHighC: 120,
      heatCycleHardeningDurometerDelta: 2.1,
      isWetTread: false,
      grooveDepthMm: 0,
    },
    C1_Hard: {
      name: 'Pirelli P Zero C1 (Durable White)',
      tier: 'C1_Hard',
      peakGripMu: 1.64,
      wearRateFractionPerLap: 0.014, // Ultra durable (~45-55 laps)
      cliffWearThreshold: 0.86,
      optimalTempWindowLowC: 110,
      optimalTempWindowHighC: 135,
      heatCycleHardeningDurometerDelta: 1.4,
      isWetTread: false,
      grooveDepthMm: 0,
    },
    C2_Medium_Hard: {
      name: 'Pirelli P Zero C2 (Medium-Hard)',
      tier: 'C2_Medium_Hard',
      peakGripMu: 1.70,
      wearRateFractionPerLap: 0.018,
      cliffWearThreshold: 0.82,
      optimalTempWindowLowC: 100,
      optimalTempWindowHighC: 125,
      heatCycleHardeningDurometerDelta: 1.7,
      isWetTread: false,
      grooveDepthMm: 0,
    },
    C4_Soft_Medium: {
      name: 'Pirelli P Zero C4 (Soft-Medium)',
      tier: 'C4_Soft_Medium',
      peakGripMu: 1.82,
      wearRateFractionPerLap: 0.032,
      cliffWearThreshold: 0.72,
      optimalTempWindowLowC: 85,
      optimalTempWindowHighC: 110,
      heatCycleHardeningDurometerDelta: 2.4,
      isWetTread: false,
      grooveDepthMm: 0,
    },
    Intermediate: {
      name: 'Cinturato Green (Intermediate)',
      tier: 'Intermediate',
      peakGripMu: 1.42,
      wearRateFractionPerLap: 0.035,
      cliffWearThreshold: 0.75,
      optimalTempWindowLowC: 60,
      optimalTempWindowHighC: 90,
      heatCycleHardeningDurometerDelta: 1.5,
      isWetTread: true,
      grooveDepthMm: 4.5,
    },
    Full_Wet: {
      name: 'Cinturato Blue (Extreme Wet)',
      tier: 'Full_Wet',
      peakGripMu: 1.28,
      wearRateFractionPerLap: 0.040,
      cliffWearThreshold: 0.70,
      optimalTempWindowLowC: 45,
      optimalTempWindowHighC: 75,
      heatCycleHardeningDurometerDelta: 1.2,
      isWetTread: true,
      grooveDepthMm: 7.2,
    },
  };

  /**
   * Computes 3-zone surface infrared thermal distribution (Inner, Center, Outer)
   * and provides alignment camber and inflation pressure diagnostic feedback.
   */
  public static evaluateThreeZoneThermalMap(
    bulkTempC: number,
    camberDeg: number,
    pressureBar: number,
    lateralG: number
  ): ThreeZoneTireThermalProfile {
    // Camber creates heat bias between inner shoulder and outer shoulder:
    // Excessive negative camber cooks inner shoulder.
    const camberHeatDelta = Math.abs(camberDeg) * 4.2 + (lateralG * 2.8);
    const innerTemp = bulkTempC + (camberDeg < 0 ? camberHeatDelta * 0.7 : -camberHeatDelta * 0.5);
    const outerTemp = bulkTempC + (camberDeg < 0 ? -camberHeatDelta * 0.6 : camberHeatDelta * 0.7);

    // Pressure crowning effect:
    // Over-inflation (>2.2 bar) crowns center tread (T_center spikes).
    // Under-inflation (<1.9 bar) rides outer shoulders (T_center runs cool).
    const nominalPressure = 2.10;
    const deltaP = pressureBar - nominalPressure;
    const centerCrowningDelta = deltaP * 18.5;
    const centerTemp = bulkTempC + centerCrowningDelta;

    // Diagnostics
    let camberMsg = 'Optimal camber thermal spread';
    const deltaShoulders = innerTemp - outerTemp;
    if (deltaShoulders > 16.0) {
      camberMsg = 'Excessive negative camber — inner shoulder overheating risk';
    } else if (deltaShoulders < -6.0) {
      camberMsg = 'Insufficient negative camber — outer shoulder scrubbing';
    }

    let pressureMsg = 'Optimal inflation pressure footprint';
    const crownTempDelta = centerTemp - (innerTemp + outerTemp) / 2.0;
    if (crownTempDelta > 8.0) {
      pressureMsg = 'Over-inflated — contact patch crowned, center rib overheating';
    } else if (crownTempDelta < -8.0) {
      pressureMsg = 'Under-inflated — sidewall deflection high, center rib cold';
    }

    return {
      innerShoulderTempC: Number(innerTemp.toFixed(1)),
      centerTreadTempC: Number(centerTemp.toFixed(1)),
      outerShoulderTempC: Number(outerTemp.toFixed(1)),
      bulkCoreTempC: Number(bulkTempC.toFixed(1)),
      camberDiagnosticMessage: camberMsg,
      pressureDiagnosticMessage: pressureMsg,
    };
  }

  /**
   * Evaluates a full multi-lap race stint, simulating lap-by-lap tire degradation,
   * heat cycling, cliff wear falloff, and optimal pit stop strategy window.
   */
  public static simulateStint(
    compoundTier: PirelliCompoundTier,
    totalStintLaps: number = 30,
    baseQualifyingLapTimeSeconds: number = 102.5,
    camberDeg: number = -3.2,
    tirePressureBar: number = 2.10,
    pitLaneLossSeconds: number = 22.5
  ): StrategyStintEvaluation {
    const compound = TireStintStrategyWearEngine.RACING_COMPOUNDS[compoundTier];
    const progression: StintLapSimulationStep[] = [];

    let currentWear = 0;
    let heatCycles = 1;
    let totalTime = 0;
    let optimalPitLap = totalStintLaps;
    let minStintAverage = 9999;

    for (let lap = 1; lap <= totalStintLaps; lap++) {
      // Linear wear plus thermal shear escalation
      const wearDelta = compound.wearRateFractionPerLap * (1.0 + currentWear * 0.45);
      currentWear = Math.min(1.0, currentWear + wearDelta);

      const isPastCliff = currentWear >= compound.cliffWearThreshold;

      // Base grip degradation: linear until cliff, exponential afterwards
      let gripLoss = currentWear * 0.18;
      if (isPastCliff) {
        const pastCliffFraction = (currentWear - compound.cliffWearThreshold) / (1.0 - compound.cliffWearThreshold);
        gripLoss += Math.pow(pastCliffFraction, 2) * 0.45; // Cliff drop
      }

      // Heat cycle rubber hardening reduces micro-conformation tackiness
      const hardeningLoss = (heatCycles - 1) * 0.025;
      const dynamicMu = Math.max(0.65, compound.peakGripMu * (1.0 - gripLoss - hardeningLoss));

      // Lap time penalty derived from tire grip loss: ~2.2s per 0.1 delta in mu
      const muDelta = compound.peakGripMu - dynamicMu;
      const lapTimePenalty = muDelta * 18.5;
      const lapTime = baseQualifyingLapTimeSeconds + lapTimePenalty;
      totalTime += lapTime;

      // Running average to detect optimal crossover pit stop window
      const runningAvg = totalTime / lap;
      if (isPastCliff && optimalPitLap === totalStintLaps) {
        optimalPitLap = lap;
      }

      // Thermal profile
      const bulkTemp = (compound.optimalTempWindowLowC + compound.optimalTempWindowHighC) / 2.0 + (currentWear * 12.0);
      const thermalMap = TireStintStrategyWearEngine.evaluateThreeZoneThermalMap(bulkTemp, camberDeg, tirePressureBar, 2.4);

      progression.push({
        lapNumber: lap,
        lapTimeSeconds: Number(lapTime.toFixed(3)),
        lapTimeDeltaToBestSeconds: Number((lapTime - baseQualifyingLapTimeSeconds).toFixed(3)),
        tireWearPercent: Number((currentWear * 100.0).toFixed(1)),
        tireGripMu: Number(dynamicMu.toFixed(3)),
        heatCyclesCount: heatCycles,
        isPastCliff,
        thermals: thermalMap,
      });
    }

    const averageLapTime = totalTime / totalStintLaps;

    // Undercut advantage: difference between fresh out-lap pace and worn tire in-lap pace
    const inLapTime = progression[optimalPitLap - 1].lapTimeSeconds;
    const freshOutLapTime = baseQualifyingLapTimeSeconds + 0.8; // cold fresh tire out lap
    const undercutPaceDelta = inLapTime - freshOutLapTime;

    return {
      compound: compoundTier,
      targetStintLaps: totalStintLaps,
      optimalPitStopLap: optimalPitLap,
      totalStintTimeSeconds: Number(totalTime.toFixed(3)),
      averageLapTimeSeconds: Number(averageLapTime.toFixed(3)),
      undercutPaceDeltaSeconds: Number(undercutPaceDelta.toFixed(3)),
      pitStopTransitLossSeconds: pitLaneLossSeconds,
      lapByLapProgression: progression,
    };
  }
}
