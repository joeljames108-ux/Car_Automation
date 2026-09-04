// ============================================================================
// MODULE 20: BENCHMARK LAP TELEMETRY COMPARATOR & COACHING ANALYZER
// ============================================================================
// Spatial distance-domain telemetry overlay comparator (Lap A vs Lap B).
// Solves delta-time cumulative traces Delta_t(s), 2D friction circle utilization
// efficiency, micro-sector delta breakdowns, braking marker offsets, and
// apex speed variances for driver performance analysis.
// ============================================================================

export interface TelemetryPointCompact {
  distanceM: number;
  timeSeconds: number;
  speedKmh: number;
  lateralAccelG: number;
  longitudinalAccelG: number;
  throttlePct: number;
  brakePct: number;
}

export interface MicroSectorDelta {
  startDistanceM: number;
  endDistanceM: number;
  lapATimeSeconds: number;
  lapBTimeSeconds: number;
  deltaTimeSeconds: number; // lapB - lapA (< 0 means B is faster)
  speedDeltaKmh: number;    // avg speed B - avg speed A
  fasterLap: 'LAP_A' | 'LAP_B' | 'TIED';
  primaryFactor: 'BRAKING' | 'APEX_GRIP' | 'TRACTION_ACCEL' | 'TOP_SPEED';
}

export interface LapComparisonSummary {
  lapATotalTimeSeconds: number;
  lapBTotalTimeSeconds: number;
  lapTimeDeltaSeconds: number;
  fasterLap: 'LAP_A' | 'LAP_B';
  lapAAvgFrictionCircleUtilizationPct: number;
  lapBAvgFrictionCircleUtilizationPct: number;
  lapAPeakSpeedKmh: number;
  lapBPeakSpeedKmh: number;
  lapAPeakLateralG: number;
  lapBPeakLateralG: number;
  microSectors: MicroSectorDelta[];
  coachingInsights: string[];
}

export class BenchmarkLapTelemetryComparator {
  /**
   * Compares two complete lap telemetry traces in the spatial distance domain.
   */
  public static compareLaps(
    lapA: TelemetryPointCompact[],
    lapB: TelemetryPointCompact[],
    microSectorLengthM: number = 100.0,
    peakGripCoeff: number = 1.65
  ): LapComparisonSummary {
    if (lapA.length < 2 || lapB.length < 2) {
      throw new Error('Both telemetry traces must contain at least 2 data points');
    }

    const lapATotalTime = lapA[lapA.length - 1].timeSeconds;
    const lapBTotalTime = lapB[lapB.length - 1].timeSeconds;
    const lapTimeDelta = lapBTotalTime - lapATotalTime;

    // ------------------------------------------------------------------------
    // 1. FRICTION CIRCLE UTILIZATION
    // ------------------------------------------------------------------------
    const calcUtil = (pts: TelemetryPointCompact[]): number => {
      let sum = 0;
      for (const p of pts) {
        const totalG = Math.sqrt(p.lateralAccelG * p.lateralAccelG + p.longitudinalAccelG * p.longitudinalAccelG);
        const util = (totalG / peakGripCoeff) * 100.0;
        sum += Math.min(100.0, util);
      }
      return sum / pts.length;
    };

    const lapAUtil = calcUtil(lapA);
    const lapBUtil = calcUtil(lapB);

    // Peak stats
    let peakSpeedA = 0, peakSpeedB = 0;
    let peakLatA = 0, peakLatB = 0;

    for (const p of lapA) {
      if (p.speedKmh > peakSpeedA) peakSpeedA = p.speedKmh;
      if (Math.abs(p.lateralAccelG) > peakLatA) peakLatA = Math.abs(p.lateralAccelG);
    }
    for (const p of lapB) {
      if (p.speedKmh > peakSpeedB) peakSpeedB = p.speedKmh;
      if (Math.abs(p.lateralAccelG) > peakLatB) peakLatB = Math.abs(p.lateralAccelG);
    }

    // ------------------------------------------------------------------------
    // 2. MICRO-SECTOR SPATIAL DISCRETIZATION
    // ------------------------------------------------------------------------
    const totalDist = Math.min(lapA[lapA.length - 1].distanceM, lapB[lapB.length - 1].distanceM);
    const microSectors: MicroSectorDelta[] = [];
    const insights: string[] = [];

    let currentStart = 0;
    let indexA = 0;
    let indexB = 0;

    while (currentStart + microSectorLengthM <= totalDist) {
      const currentEnd = currentStart + microSectorLengthM;

      // Find points in this sector
      const ptsA: TelemetryPointCompact[] = [];
      while (indexA < lapA.length && lapA[indexA].distanceM <= currentEnd) {
        if (lapA[indexA].distanceM >= currentStart) ptsA.push(lapA[indexA]);
        indexA++;
      }
      // Rewind one index so next sector captures boundary
      if (indexA > 0) indexA--;

      const ptsB: TelemetryPointCompact[] = [];
      while (indexB < lapB.length && lapB[indexB].distanceM <= currentEnd) {
        if (lapB[indexB].distanceM >= currentStart) ptsB.push(lapB[indexB]);
        indexB++;
      }
      if (indexB > 0) indexB--;

      if (ptsA.length >= 2 && ptsB.length >= 2) {
        const tA = ptsA[ptsA.length - 1].timeSeconds - ptsA[0].timeSeconds;
        const tB = ptsB[ptsB.length - 1].timeSeconds - ptsB[0].timeSeconds;
        const dt = tB - tA;

        const avgSpdA = ptsA.reduce((s, p) => s + p.speedKmh, 0) / ptsA.length;
        const avgSpdB = ptsB.reduce((s, p) => s + p.speedKmh, 0) / ptsB.length;
        const spdDelta = avgSpdB - avgSpdA;

        const avgBrakeA = ptsA.reduce((s, p) => s + p.brakePct, 0) / ptsA.length;
        const avgBrakeB = ptsB.reduce((s, p) => s + p.brakePct, 0) / ptsB.length;
        const avgLatA = ptsA.reduce((s, p) => s + Math.abs(p.lateralAccelG), 0) / ptsA.length;
        const avgLatB = ptsB.reduce((s, p) => s + Math.abs(p.lateralAccelG), 0) / ptsB.length;

        let primaryFactor: 'BRAKING' | 'APEX_GRIP' | 'TRACTION_ACCEL' | 'TOP_SPEED' = 'TOP_SPEED';
        if (avgBrakeA > 20 || avgBrakeB > 20) {
          primaryFactor = 'BRAKING';
        } else if (avgLatA > 1.2 || avgLatB > 1.2) {
          primaryFactor = 'APEX_GRIP';
        } else if ((ptsA[0].throttlePct > 50 || ptsB[0].throttlePct > 50) && (avgSpdA < 160 || avgSpdB < 160)) {
          primaryFactor = 'TRACTION_ACCEL';
        }

        const faster = Math.abs(dt) < 0.005 ? 'TIED' : dt < 0 ? 'LAP_B' : 'LAP_A';

        microSectors.push({
          startDistanceM: currentStart,
          endDistanceM: currentEnd,
          lapATimeSeconds: Number(tA.toFixed(3)),
          lapBTimeSeconds: Number(tB.toFixed(3)),
          deltaTimeSeconds: Number(dt.toFixed(3)),
          speedDeltaKmh: Number(spdDelta.toFixed(1)),
          fasterLap: faster,
          primaryFactor,
        });
      }

      currentStart = currentEnd;
    }

    // ------------------------------------------------------------------------
    // 3. COACHING INSIGHTS GENERATION
    // ------------------------------------------------------------------------
    if (lapTimeDelta < 0) {
      insights.push(`Lap B is faster overall by ${Math.abs(lapTimeDelta).toFixed(3)}s.`);
    } else if (lapTimeDelta > 0) {
      insights.push(`Lap A is faster overall by ${lapTimeDelta.toFixed(3)}s.`);
    } else {
      insights.push('Both laps set identical lap times.');
    }

    if (lapBUtil > lapAUtil + 2.0) {
      insights.push(`Lap B utilized ${(lapBUtil - lapAUtil).toFixed(1)}% more friction ellipse capacity than Lap A.`);
    } else if (lapAUtil > lapBUtil + 2.0) {
      insights.push(`Lap A utilized ${(lapAUtil - lapBUtil).toFixed(1)}% more friction ellipse capacity than Lap B.`);
    }

    const brakingDeltas = microSectors.filter(s => s.primaryFactor === 'BRAKING');
    const bFasterInBraking = brakingDeltas.filter(s => s.fasterLap === 'LAP_B').length;
    const aFasterInBraking = brakingDeltas.filter(s => s.fasterLap === 'LAP_A').length;
    if (bFasterInBraking > aFasterInBraking) {
      insights.push('Lap B gained significant lap time by braking deeper into corner entry zones.');
    } else if (aFasterInBraking > bFasterInBraking) {
      insights.push('Lap A demonstrated superior threshold braking and deceleration stability.');
    }

    return {
      lapATotalTimeSeconds: Number(lapATotalTime.toFixed(3)),
      lapBTotalTimeSeconds: Number(lapBTotalTime.toFixed(3)),
      lapTimeDeltaSeconds: Number(lapTimeDelta.toFixed(3)),
      fasterLap: lapTimeDelta <= 0 ? 'LAP_B' : 'LAP_A',
      lapAAvgFrictionCircleUtilizationPct: Number(lapAUtil.toFixed(1)),
      lapBAvgFrictionCircleUtilizationPct: Number(lapBUtil.toFixed(1)),
      lapAPeakSpeedKmh: Number(peakSpeedA.toFixed(1)),
      lapBPeakSpeedKmh: Number(peakSpeedB.toFixed(1)),
      lapAPeakLateralG: Number(peakLatA.toFixed(2)),
      lapBPeakLateralG: Number(peakLatB.toFixed(2)),
      microSectors,
      coachingInsights: insights,
    };
  }
}
