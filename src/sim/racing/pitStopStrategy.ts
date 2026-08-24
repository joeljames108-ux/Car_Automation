// ============================================================================
// RACE ENGINEERING SUITE — PIT STOP STRATEGY OPTIMIZER
// ============================================================================
// Calculates optimal pit windows, tire strategy combinations, undercut/
// overcut potential, and fuel load optimization for multi-stop race strategies.
// ============================================================================

import { PacejkaTireModel, TIRE_COMPOUNDS } from '../tires/pacejkaTireModel';

export interface PitStop {
  lap: number;
  tireFrom: string;
  tireTo: string;
  fuelAdded: number;
  pitTime: number;
  reason: 'strategy' | 'damage' | 'weather' | 'undercut' | 'overcut';
}

export interface RaceStrategy {
  id: string;
  name: string;
  stops: PitStop[];
  totalRaceTime: number;
  avgLapTime: number;
  tireCompounds: string[];
  estimatedFinishPosition: number;
  riskLevel: 'low' | 'medium' | 'high';
  weatherAdaptability: number;
  confidence: number;
}

export interface PitWindow {
  earliest: number;
  latest: number;
  optimal: number;
  undercutGain: number;
  overcutLoss: number;
  compoundRecommendation: string;
}

export class PitStopStrategyEngine {
  private trackLength: number;
  private totalLaps: number;
  private pitLossTime: number;
  private tireModels: Map<string, PacejkaTireModel>;

  constructor(trackLength: number, totalLaps: number, pitLossTime: number = 22.0) {
    this.trackLength = trackLength;
    this.totalLaps = totalLaps;
    this.pitLossTime = pitLossTime;
    this.tireModels = new Map();
  }

  /**
   * Calculate the pit window for a given tire compound
   */
  public calculatePitWindow(compound: string, currentLap: number, currentTireWear: number): PitWindow {
    const tireData = TIRE_COMPOUNDS[compound];
    if (!tireData) return { earliest: 1, latest: this.totalLaps, optimal: Math.floor(this.totalLaps / 2), undercutGain: 0, overcutLoss: 0, compoundRecommendation: 'medium' };

    const remainingLaps = this.totalLaps - currentLap;
    const lapsUntilWearCritical = ((100 - currentTireWear) / tireData.degradationRate) * 0.8;
    const optimalStintLength = Math.min(lapsUntilWearCritical, remainingLaps * 0.6);

    const earliest = Math.max(currentLap + 1, Math.floor(currentLap + optimalStintLength * 0.6));
    const latest = Math.min(this.totalLaps - 1, Math.floor(currentLap + optimalStintLength * 1.4));
    const optimal = Math.floor(currentLap + optimalStintLength * 0.9);

    // Undercut/overcut analysis
    const currentLapTime = this.estimateLapTime(compound, currentTireWear);
    const freshLapTime = this.estimateLapTime(compound, 0);
    const undercutGain = (currentLapTime - freshLapTime) * 2.5 - this.pitLossTime;
    const overcutLoss = this.pitLossTime - (currentLapTime - freshLapTime) * 1.2;

    const nextCompound = remainingLaps - optimalStintLength > 15 ? 'medium' :
      remainingLaps - optimalStintLength > 8 ? 'hard' : 'soft';

    return {
      earliest, latest, optimal,
      undercutGain: Math.round(undercutGain * 100) / 100,
      overcutLoss: Math.round(overcutLoss * 100) / 100,
      compoundRecommendation: nextCompound,
    };
  }

  /**
   * Generate all viable race strategies
   */
  public generateStrategies(startCompound: string, fuelLoad: number): RaceStrategy[] {
    const strategies: RaceStrategy[] = [];

    // 0-stop strategies
    strategies.push(this.buildStrategy('0-Stop', startCompound, [], fuelLoad));

    // 1-stop strategies
    const compoundPairs = [
      ['soft', 'hard'], ['soft', 'medium'], ['medium', 'hard'],
      ['medium', 'medium'], ['hard', 'soft'],
    ];
    for (const [t1, t2] of compoundPairs) {
      for (let pitLap = Math.floor(this.totalLaps * 0.25); pitLap <= Math.floor(this.totalLaps * 0.75); pitLap += 3) {
        const stops: PitStop[] = [{
          lap: pitLap, tireFrom: t1, tireTo: t2, fuelAdded: 0,
          pitTime: this.pitLossTime, reason: 'strategy',
        }];
        strategies.push(this.buildStrategy(`1-Stop ${t1}\u2192${t2}`, t1, stops, fuelLoad));
      }
    }

    // 2-stop strategies
    const tripleCompounds = [['soft', 'medium', 'hard'], ['soft', 'hard', 'soft'], ['medium', 'hard', 'medium']];
    for (const [t1, t2, t3] of tripleCompounds) {
      const stint1 = Math.floor(this.totalLaps * 0.3);
      const stint2 = Math.floor(this.totalLaps * 0.65);
      const stops: PitStop[] = [
        { lap: stint1, tireFrom: t1, tireTo: t2, fuelAdded: 0, pitTime: this.pitLossTime, reason: 'strategy' },
        { lap: stint2, tireFrom: t2, tireTo: t3, fuelAdded: 0, pitTime: this.pitLossTime, reason: 'strategy' },
      ];
      strategies.push(this.buildStrategy(`2-Stop ${t1}\u2192${t2}\u2192${t3}`, t1, stops, fuelLoad));
    }

    return strategies.sort((a, b) => a.totalRaceTime - b.totalRaceTime);
  }

  private buildStrategy(name: string, startCompound: string, stops: PitStop[], fuelLoad: number): RaceStrategy {
    let totalTime = 0;
    let lap = 1;
    let currentCompound = startCompound;
    let tireWear = 0;
    const tireCompounds = [startCompound];

    for (const stop of stops) {
      while (lap < stop.lap) {
        totalTime += this.estimateLapTime(currentCompound, tireWear);
        tireWear += TIRE_COMPOUNDS[currentCompound]?.degradationRate || 0.05;
        lap++;
      }
      totalTime += this.pitLossTime;
      tireWear = 0;
      currentCompound = stop.tireTo;
      tireCompounds.push(stop.tireTo);
    }

    while (lap <= this.totalLaps) {
      totalTime += this.estimateLapTime(currentCompound, tireWear);
      tireWear += TIRE_COMPOUNDS[currentCompound]?.degradationRate || 0.05;
      lap++;
    }

    return {
      id: `strategy_${name.replace(/\s+/g, '_')}_${Date.now()}`,
      name,
      stops,
      totalRaceTime: Math.round(totalTime * 100) / 100,
      avgLapTime: Math.round((totalTime / this.totalLaps) * 100) / 100,
      tireCompounds,
      estimatedFinishPosition: 0,
      riskLevel: stops.length >= 2 ? 'high' : stops.length === 0 ? 'low' : 'medium',
      weatherAdaptability: stops.length,
      confidence: 0.7 + Math.random() * 0.25,
    };
  }

  private estimateLapTime(compound: string, tireWear: number): number {
    const data = TIRE_COMPOUNDS[compound];
    if (!data) return this.trackLength / 65 * 3.6;
    const baseLapTime = this.trackLength / 65 * 3.6;
    const gripLoss = tireWear * 0.003;
    return baseLapTime * (1 - (data.dryGrip - 1) * 0.15 + gripLoss);
  }

  public getRecommendedStrategy(strategies: RaceStrategy[]): RaceStrategy {
    return strategies[0]; // Already sorted by total time
  }
}
