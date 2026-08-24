// ============================================================================
// BENCHMARK CORRELATION ENGINE
// ============================================================================
// Runs all 100 real cars through the vehicle dynamics solver and lap time
// simulator, then evaluates statistical correlation against real-world data.

import { RealCarSpec, ALL_REAL_SPORTS_CARS_100 } from './realWorldSportsCar100Dataset';
import { mapRealCarToSimulatorState } from './realCarSimulatorMapper';
import { MasterVehicleStateEngine } from '../masterVehicleState/masterVehicleStateEngine';
import { CircuitLapTimeSimulator, CircuitTrackDefinition } from '../track/circuitLapTimeSimulator';

export interface CarSimulationResult {
  car: RealCarSpec;
  // Simulated metrics from MasterVehicleStateEngine
  simTopSpeedKmh: number;
  simZeroTo100Sec: number;
  simZeroTo200Sec: number;
  simQuarterMileSec: number;
  simQuarterMileTrapKmh: number;
  simMaxLateralG: number;
  simBrakingDist100To0M: number;
  simNurburgringSec: number;
  simSpaSec: number;
  simLagunaSecaSec: number;
  // Lap time simulator results
  lapSimNurburgringSec: number;
  lapSimSpaSec: number;
}

export interface MetricCorrelation {
  metricName: string;
  rSquared: number;
  pearsonR: number;
  mape: number;
  meanAbsoluteError: number;
  slope: number;
  intercept: number;
  samples: number;
  passRSquared: boolean;
  passMAPE: boolean;
}

export interface BenchmarkReport {
  results: CarSimulationResult[];
  correlations: MetricCorrelation[];
  analyticalVsDiscreteCorrelation: MetricCorrelation;
  overallPassRate: number;
  timestamp: string;
}

export class BenchmarkCorrelationEngine {
  // Statistical thresholds
  private static readonly THRESHOLDS: Record<string, { r2Min: number; mapeMax: number }> = {
    'Top Speed': { r2Min: 0.95, mapeMax: 3.5 },
    '0-100 km/h': { r2Min: 0.92, mapeMax: 5.0 },
    'Quarter Mile Time': { r2Min: 0.94, mapeMax: 4.0 },
    'Nurburgring Lap': { r2Min: 0.90, mapeMax: 4.5 },
  };

  static runFullBenchmark(cars?: RealCarSpec[]): BenchmarkReport {
    const dataset = cars || ALL_REAL_SPORTS_CARS_100;
    const results: CarSimulationResult[] = [];
    for (const car of dataset) {
      const state = mapRealCarToSimulatorState(car);
      const solved = MasterVehicleStateEngine.calculateStateMetrics(state);
      const m = solved.metrics;
      let lapNRing = 0, lapSpa = 0;
      try {
        const nrResult = CircuitLapTimeSimulator.simulateLap(
          CircuitLapTimeSimulator.PRESET_TRACKS.NURBURGRING_NORDSCHLEIFE,
          m.totalCurbMassKg, m.peakHorsepowerHp,
          car.tireCompound === 'racing_slick' ? 1.95 : car.tireCompound === 'track_r_compound' ? 1.60 : 1.35,
          m.downforceAt250KmhN
        );
        lapNRing = nrResult.lapTimeSeconds;
        const spaResult = CircuitLapTimeSimulator.simulateLap(
          CircuitLapTimeSimulator.PRESET_TRACKS.SPA_FRANCORCHAMPS,
          m.totalCurbMassKg, m.peakHorsepowerHp,
          car.tireCompound === 'racing_slick' ? 1.95 : car.tireCompound === 'track_r_compound' ? 1.60 : 1.35,
          m.downforceAt250KmhN
        );
        lapSpa = spaResult.lapTimeSeconds;
      } catch {}
      results.push({
        car,
        simTopSpeedKmh: m.topSpeedKmh,
        simZeroTo100Sec: m.zeroToHundredKmhSec,
        simZeroTo200Sec: m.zeroToTwoHundredKmhSec,
        simQuarterMileSec: m.quarterMileTimeSec,
        simQuarterMileTrapKmh: m.quarterMileTrapSpeedKmh,
        simMaxLateralG: m.maxLateralAccelerationG,
        simBrakingDist100To0M: m.brakingDistance100To0M,
        simNurburgringSec: m.nurburgringNordschleifeLapSec,
        simSpaSec: m.spaFrancorchampsLapSec,
        simLagunaSecaSec: m.lagunaSecaLapSec,
        lapSimNurburgringSec: lapNRing,
        lapSimSpaSec: lapSpa,
      });
    }
    const correlations: MetricCorrelation[] = [];
    correlations.push(this.correlate('Top Speed',
      results.map(r => r.car.realTopSpeedKmh), results.map(r => r.simTopSpeedKmh)));
    correlations.push(this.correlate('0-100 km/h',
      results.map(r => r.car.realZeroTo100Sec), results.map(r => r.simZeroTo100Sec)));
    correlations.push(this.correlate('Quarter Mile Time',
      results.filter(r => r.car.realQuarterMileSec > 0).map(r => r.car.realQuarterMileSec),
      results.filter(r => r.car.realQuarterMileSec > 0).map(r => r.simQuarterMileSec)));
    const nringCars = results.filter(r => r.car.realNurburgringSec > 0);
    if (nringCars.length > 5) {
      correlations.push(this.correlate('Nurburgring Lap',
        nringCars.map(r => r.car.realNurburgringSec), nringCars.map(r => r.simNurburgringSec)));
    }
    const anaVsDisc = this.correlate('Analytical vs Discrete Lap',
      results.filter(r => r.lapSimNurburgringSec > 0).map(r => r.simNurburgringSec),
      results.filter(r => r.lapSimNurburgringSec > 0).map(r => r.lapSimNurburgringSec));
    let passCount = 0;
    for (const c of correlations) {
      const t = this.THRESHOLDS[c.metricName];
      if (t) { c.passRSquared = c.rSquared >= t.r2Min; c.passMAPE = c.mape <= t.mapeMax; }
      else { c.passRSquared = true; c.passMAPE = true; }
      if (c.passRSquared && c.passMAPE) passCount++;
    }
    return {
      results, correlations,
      analyticalVsDiscreteCorrelation: anaVsDisc,
      overallPassRate: passCount / Math.max(1, correlations.length),
      timestamp: new Date().toISOString(),
    };
  }

  static correlate(name: string, realVals: number[], simVals: number[]): MetricCorrelation {
    const n = Math.min(realVals.length, simVals.length);
    const R = realVals.slice(0, n), S = simVals.slice(0, n);
    const meanR = R.reduce((a, b) => a + b, 0) / n;
    const meanS = S.reduce((a, b) => a + b, 0) / n;
    let ssRes = 0, ssTot = 0, ssXY = 0, ssX = 0, ssY = 0, sumAbsErr = 0, sumPctErr = 0;
    for (let i = 0; i < n; i++) {
      ssRes += (R[i] - S[i]) ** 2;
      ssTot += (R[i] - meanR) ** 2;
      ssXY += (R[i] - meanR) * (S[i] - meanS);
      ssX += (R[i] - meanR) ** 2;
      ssY += (S[i] - meanS) ** 2;
      sumAbsErr += Math.abs(R[i] - S[i]);
      sumPctErr += R[i] !== 0 ? Math.abs((S[i] - R[i]) / R[i]) * 100 : 0;
    }
    const rSquared = ssTot > 0 ? Math.max(0, 1 - ssRes / ssTot) : 0;
    const pearsonR = (ssX > 0 && ssY > 0) ? ssXY / Math.sqrt(ssX * ssY) : 0;
    const slope = ssX > 0 ? ssXY / ssX : 1;
    const intercept = meanS - slope * meanR;
    return {
      metricName: name, rSquared: +rSquared.toFixed(4), pearsonR: +pearsonR.toFixed(4),
      mape: +(sumPctErr / n).toFixed(2), meanAbsoluteError: +(sumAbsErr / n).toFixed(2),
      slope: +slope.toFixed(4), intercept: +intercept.toFixed(2), samples: n,
      passRSquared: false, passMAPE: false,
    };
  }
}
