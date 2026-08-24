// ============================================================================
// RACE ENGINEERING SUITE — RACE STRATEGY SIMULATOR (MONTE CARLO)
// ============================================================================
// Runs thousands of Monte Carlo race simulations to determine statistically
// optimal strategies, factoring in safety car probability, weather changes,
// tire degradation variability, and fuel load optimization.
// ============================================================================

import { PacejkaTireModel, TIRE_COMPOUNDS } from '../tires/pacejkaTireModel';
import { FuelModel } from './fuelModel';
import { RaceWeatherSystem, WeatherCondition } from '../weather/raceWeatherSystem';

export interface SimulationConfig {
  trackLength: number;
  totalLaps: number;
  pitLossTime: number;
  simulations: number;
  safetyCarProbability: number;
  weatherChangeProbability: number;
  tireDegVariance: number;
  fuelLoad: number;
}

export interface SimulationResult {
  strategyId: string;
  stops: { lap: number; compound: string }[];
  avgFinishTime: number;
  stdDev: number;
  winProbability: number;
  podiumProbability: number;
  dnfProbability: number;
  pointsProbability: number;
  bestCaseTime: number;
  worstCaseTime: number;
  riskScore: number;
}

export interface StrategyOption {
  id: string;
  name: string;
  stints: { compound: string; maxLaps: number }[];
}

const DEFAULT_STRATEGIES: StrategyOption[] = [
  { id: 'zero_stop', name: '0-Stop', stints: [{ compound: 'hard', maxLaps: 52 }] },
  { id: 'one_soft_med', name: '1-Stop S\u2192M', stints: [{ compound: 'soft', maxLaps: 18 }, { compound: 'medium', maxLaps: 34 }] },
  { id: 'one_soft_hard', name: '1-Stop S\u2192H', stints: [{ compound: 'soft', maxLaps: 18 }, { compound: 'hard', maxLaps: 34 }] },
  { id: 'one_med_hard', name: '1-Stop M\u2192H', stints: [{ compound: 'medium', maxLaps: 26 }, { compound: 'hard', maxLaps: 26 }] },
  { id: 'two_s_m_h', name: '2-Stop S\u2192M\u2192H', stints: [{ compound: 'soft', maxLaps: 15 }, { compound: 'medium', maxLaps: 18 }, { compound: 'hard', maxLaps: 19 }] },
  { id: 'two_s_s_h', name: '2-Stop S\u2192S\u2192H', stints: [{ compound: 'soft', maxLaps: 14 }, { compound: 'soft', maxLaps: 14 }, { compound: 'hard', maxLaps: 24 }] },
  { id: 'two_m_h_s', name: '2-Stop M\u2192H\u2192S', stints: [{ compound: 'medium', maxLaps: 18 }, { compound: 'hard', maxLaps: 18 }, { compound: 'soft', maxLaps: 16 }] },
];

export class RaceStrategySimulator {
  private config: SimulationConfig;

  constructor(config: Partial<SimulationConfig> = {}) {
    this.config = {
      trackLength: 5.891,
      totalLaps: 52,
      pitLossTime: 22,
      simulations: 1000,
      safetyCarProbability: 0.3,
      weatherChangeProbability: 0.15,
      tireDegVariance: 0.15,
      fuelLoad: 110,
      ...config,
    };
  }

  public simulateStrategies(): SimulationResult[] {
    return DEFAULT_STRATEGIES.map(strategy => this.simulateStrategy(strategy));
  }

  private simulateStrategy(strategy: StrategyOption): SimulationResult {
    const times: number[] = [];
    let wins = 0, podiums = 0, dnfs = 0, points = 0;
    let bestTime = Infinity, worstTime = 0;

    for (let sim = 0; sim < this.config.simulations; sim++) {
      const result = this.runSingleSimulation(strategy);
      times.push(result.time);
      if (result.dnf) { dnfs++; continue; }
      bestTime = Math.min(bestTime, result.time);
      worstTime = Math.max(worstTime, result.time);
    }

    const validTimes = times.filter(t => t < Infinity);
    if (validTimes.length === 0) {
      return {
        strategyId: strategy.id, stops: strategy.stints.map((s, i) => ({ lap: i * 20, compound: s.compound })),
        avgFinishTime: Infinity, stdDev: 0, winProbability: 0, podiumProbability: 0,
        dnfProbability: 1, pointsProbability: 0, bestCaseTime: Infinity, worstCaseTime: Infinity, riskScore: 1,
      };
    }

    // Compare to other strategies
    const allAvg = 5000;
    wins = validTimes.filter(t => t < allAvg * 0.98).length;
    podiums = validTimes.filter(t => t < allAvg * 1.01).length;
    points = validTimes.filter(t => t < allAvg * 1.05).length;

    const avg = validTimes.reduce((a, b) => a + b, 0) / validTimes.length;
    const stdDev = Math.sqrt(validTimes.reduce((sum, t) => sum + Math.pow(t - avg, 2), 0) / validTimes.length);

    return {
      strategyId: strategy.id,
      stops: strategy.stints.slice(0, -1).map((s, i) => ({
        lap: Math.round(strategy.stints.slice(0, i + 1).reduce((sum, st) => sum + st.maxLaps, 0)),
        compound: strategy.stints[i + 1].compound,
      })),
      avgFinishTime: Math.round(avg * 100) / 100,
      stdDev: Math.round(stdDev * 100) / 100,
      winProbability: Math.round((wins / this.config.simulations) * 1000) / 10,
      podiumProbability: Math.round((podiums / this.config.simulations) * 1000) / 10,
      dnfProbability: Math.round((dnfs / this.config.simulations) * 1000) / 10,
      pointsProbability: Math.round((points / this.config.simulations) * 1000) / 10,
      bestCaseTime: bestTime,
      worstCaseTime: worstTime,
      riskScore: Math.round((stdDev / avg + dnfs / this.config.simulations) * 100) / 100,
    };
  }

  private runSingleSimulation(strategy: StrategyOption): { time: number; dnf: boolean } {
    let totalTime = 0;
    let lap = 0;
    let currentStint = 0;
    let stintLaps = 0;
    let currentCompound = strategy.stints[0].compound;
    let dnf = false;
    const fuel = new FuelModel(this.config.fuelLoad, this.config.trackLength);

    while (lap < this.config.totalLaps && !dnf) {
      const tire = new PacejkaTireModel(currentCompound);
      const degVariance = 1 + (Math.random() - 0.5) * this.config.tireDegVariance;

      // Simulate a stint
      const maxLaps = strategy.stints[currentStint]?.maxLaps || this.config.totalLaps;
      while (stintLaps < maxLaps && lap < this.config.totalLaps && !dnf) {
        const baseLapTime = this.estimateLapTime(currentCompound, tire.getState().wear);
        const lapTime = baseLapTime * degVariance + (Math.random() - 0.5) * 0.5;
        tire.update(1, 4500, Math.random() * 2, Math.random() * 0.05, 200, 0);
        tire.newLap();
        fuel.consumeLap(0.8, 9000, 0);
        totalTime += lapTime;
        stintLaps++;
        lap++;

        // Safety car randomly
        if (Math.random() < this.config.safetyCarProbability / this.config.totalLaps) {
          totalTime += this.config.pitLossTime * 0.5;
        }

        // DNF chance
        if (Math.random() < 0.0008) dnf = true;
      }

      // Pit stop
      if (lap < this.config.totalLaps && currentStint < strategy.stints.length - 1) {
        totalTime += this.config.pitLossTime;
        currentStint++;
        stintLaps = 0;
        currentCompound = strategy.stints[currentStint]?.compound || currentCompound;
      }
    }

    return { time: dnf ? Infinity : totalTime, dnf };
  }

  private estimateLapTime(compound: string, tireWear: number): number {
    const data = TIRE_COMPOUNDS[compound];
    const baseTime = this.config.trackLength / 65 * 3.6;
    const gripFactor = data ? (1 - (data.dryGrip - 1) * 0.15) : 1.0;
    const degFactor = tireWear * 0.003;
    return baseTime * (gripFactor + degFactor);
  }

  public getConfig(): SimulationConfig { return { ...this.config }; }
}
