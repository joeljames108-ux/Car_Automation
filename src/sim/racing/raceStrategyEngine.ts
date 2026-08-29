// ========================================================================
// RACE STRATEGY ENGINE — Multi-stop strategy optimizer
// ========================================================================
export interface StintConfig {
  compound: string; laps: number; startFuelKg: number;
  wearRate: number; cliffWear: number; baseLapTime: number;
}
export interface StrategyResult {
  totalTime: number; pitStops: number; stints: StintConfig[];
  bestLapTime: number; avgLapTime: number;
  lapByLap: { lap: number; time: number; tireWear: number; fuelKg: number }[];
}

// Calculate lap time with tire degradation and fuel load
export function lapTimeWithDeg(baseTime: number, tireWear: number, fuelKg: number, cliffWear: number, wearRate: number): number {
  const tirePenalty = tireWear < cliffWear ? tireWear*0.15 : tireWear*0.15+2*(tireWear-cliffWear);
  const fuelPenalty = fuelKg * 0.035;
  return baseTime + tirePenalty + fuelPenalty;
}

// Simulate a full stint
export function simulateStint(config: StintConfig, fuelPerLap: number): { laps: {time:number;wear:number;fuel:number}[]; totalTime: number } {
  const laps: {time:number;wear:number;fuel:number}[] = [];
  let total = 0, fuel = config.startFuelKg, wear = 0;
  for(let l=0; l<config.laps; l++) {
    const t = lapTimeWithDeg(config.baseLapTime, wear, fuel, config.cliffWear, config.wearRate);
    laps.push({ time: t, wear, fuel });
    total += t;
    wear += config.wearRate;
    fuel -= fuelPerLap;
  }
  return { laps, totalTime: total };
}

// Optimize pit stop window
export function optimizeStints(
  raceLaps: number, pitLoss: number, fuelPerLap: number,
  compounds: { name: string; baseTime: number; wearRate: number; cliffWear: number }[],
  maxStops: number
): StrategyResult {
  let bestTotal = Infinity;
  let bestStints: StintConfig[] = [];
  let bestLaps: {lap:number;time:number;tireWear:number;fuelKg:number}[] = [];
  // Try 1-stop, 2-stop, 3-stop strategies
  for(let stops=0; stops<=maxStops; stops++) {
    const numStints = stops+1;
    const lapsPerStint = Math.ceil(raceLaps/numStints);
    // Try all compound combinations
    for(const c of compounds) {
      const stints: StintConfig[] = [];
      const allLaps: {lap:number;time:number;tireWear:number;fuelKg:number}[] = [];
      let total = 0, lapNum = 0;
      for(let s=0; s<numStints; s++) {
        const stintLaps = Math.min(lapsPerStint, raceLaps-lapNum);
        const st: StintConfig = { compound: c.name, laps: stintLaps, startFuelKg: 100-lapNum*fuelPerLap,
          wearRate: c.wearRate, cliffWear: c.cliffWear, baseLapTime: c.baseTime };
        const result = simulateStint(st, fuelPerLap);
        for(let l=0;l<stintLaps;l++) {
          allLaps.push({ lap:lapNum+l, time:result.laps[l].time, tireWear:result.laps[l].wear, fuelKg:result.laps[l].fuel });
        }
        total += result.totalTime + (s>0 ? pitLoss : 0);
        stints.push(st);
        lapNum += stintLaps;
      }
      if(total < bestTotal) { bestTotal = total; bestStints = stints; bestLaps = allLaps; }
    }
  }
  return {
    totalTime: Math.round(bestTotal*1000)/1000, pitStops: bestStints.length-1,
    stints: bestStints,
    bestLapTime: Math.round(Math.min(...bestLaps.map(l=>l.time))*1000)/1000,
    avgLapTime: Math.round(bestTotal/raceLaps*1000)/1000,
    lapByLap: bestLaps,
  };
}

// Undercut vs overcut analysis
export function undercutAnalysis(leaderLap: number, chaserLap: number, pitLoss: number, newTireAdv: number): { undercutDelta: number; overcutDelta: number; best: string } {
  const undercut = -newTireAdv*2 + leaderLap - chaserLap + pitLoss;
  const overcut = newTireAdv*1 + leaderLap - chaserLap + pitLoss*0.8;
  return {
    undercutDelta: Math.round(undercut*1000)/1000,
    overcutDelta: Math.round(overcut*1000)/1000,
    best: undercut < overcut ? "undercut" : "overcut",
  };
}

// Gap management: predict gap after N laps
export function predictGap(currentGap: number, myLap: number, otherLap: number, lapsRemaining: number): number {
  const delta = myLap - otherLap;
  return Math.round((currentGap + delta * lapsRemaining)*1000)/1000;
}

// Tire compound crossover: when does compound A become slower than B?
export function crossoverLap(baseA: number, baseB: number, wearA: number, wearB: number, cliffA: number, cliffB: number): number {
  for(let l=0; l<100; l++) {
    const tA = lapTimeWithDeg(baseA, l*wearA, 100, cliffA, wearA);
    const tB = lapTimeWithDeg(baseB, l*wearB, 100, cliffB, wearB);
    if(tA > tB + 0.5) return l;
  }
  return -1;
}
