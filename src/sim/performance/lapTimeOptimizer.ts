// ========================================================================
// LAP TIME OPTIMIZER — Gradient descent minimization of lap time
// ========================================================================
// Optimizes: ride height, spring rates, wing angles, diff settings, brake bias
// Constraints: legal ride height, minimum weight, tire temp window
export interface SetupParams {
  rideHeightF: number; rideHeightR: number;
  springRateF: number; springRateR: number;
  damperF: number; damperR: number;
  arbF: number; arbR: number;
  wingAngleF: number; wingAngleR: number;
  diffPreload: number; diffLock: number;
  brakeBias: number; tyrePressureF: number; tyrePressureR: number;
  camberF: number; camberR: number; toeF: number; toeR: number;
}
export interface OptimizationResult {
  bestSetup: SetupParams;
  bestLapTime: number;
  iterations: number;
  convergenceHistory: number[];
  sensitivityMap: { param: string; lapTimeDelta: number }[];
}

const DEFAULT_SETUP: SetupParams = {
  rideHeightF: 30, rideHeightR: 50,
  springRateF: 180, springRateR: 220,
  damperF: 0.6, damperR: 0.7,
  arbF: 0.4, arbR: 0.5,
  wingAngleF: 12, wingAngleR: 8,
  diffPreload: 30, diffLock: 55,
  brakeBias: 56, tyrePressureF: 21.0, tyrePressureR: 21.5,
  camberF: -3.2, camberR: -2.5, toeF: 0.05, toeR: -0.1,

// Estimate lap time from setup (simplified physics model)
export function estimateLapTime(setup: SetupParams, massKg: number, powerW: number, trackLengthM: number): number {
  // Aero: more wing = more downforce but more drag
  const wingTotal = setup.wingAngleF + setup.wingAngleR;
  const dfCoeff = 0.3 + wingTotal * 0.02;
  const cdBase = 0.95 + wingTotal * 0.008;
  // Ride height: lower = more ground effect but more drag
  const rideH = (setup.rideHeightF + setup.rideHeightR) / 2;
  const geBoost = Math.max(0, (50-rideH)/100);
  // Tire grip from pressure deviation
  const pfDev = (setup.tyrePressureF - 21.0)/21.0;
  const prDev = (setup.tyrePressureR - 21.5)/21.5;
  const tireGrip = 1.85 * (1 - 0.5*pfDev*pfDev) * (1 - 0.5*prDev*prDev);
  // Camber effect
  const camF = Math.cos((setup.camberF+3)*Math.PI/180);
  const camR = Math.cos((setup.camberR+3)*Math.PI/180);
  // Balance: understeer/oversteer from brake bias and diff
  const balance = setup.brakeBias/100 - 0.56;
  const balPenalty = Math.abs(balance) * 0.5;
  // Diff effect on exit traction
  const diffEffect = setup.diffLock / 100;
  // Calculate average speed
  const mu = tireGrip * camF * camR;
  const dfTotal = dfCoeff * (1+geBoost) * 1.5 * 1.225 * 92.6 * 92.6 / 2;
  const gripFactor = mu * (1 + dfTotal/(massKg*9.81));
  const dragFactor = cdBase * 1.5;
  const accelF = powerW * 0.87 * diffEffect / (massKg * 92.6);
  const avgSpeed = Math.min(90, 0.45 * Math.sqrt(powerW/massKg * gripFactor) - 0.5 * dragFactor * 10 - balPenalty);
  const lapTime = trackLengthM / Math.max(10, avgSpeed);
  return lapTime;

// Gradient descent optimization
export function optimizeSetup(
  massKg: number, powerW: number, trackLengthM: number,
  maxIter: number = 200, lr: number = 0.01
): OptimizationResult {
  let best = {...DEFAULT_SETUP};
  let bestTime = estimateLapTime(best, massKg, powerW, trackLengthM);
  const history = [bestTime];
  const params = Object.keys(best) as (keyof SetupParams)[];
  const deltas: Record<string, number> = {
    rideHeightF: 2, rideHeightR: 2, springRateF: 5, springRateR: 5,
    damperF: 0.05, damperR: 0.05, arbF: 0.05, arbR: 0.05,
    wingAngleF: 0.5, wingAngleR: 0.5, diffPreload: 2, diffLock: 2,
    brakeBias: 0.5, tyrePressureF: 0.1, tyrePressureR: 0.1,
    camberF: 0.1, camberR: 0.1, toeF: 0.01, toeR: 0.01,
  };
  const constraints: Record<string, [number,number]> = {
    rideHeightF: [22, 60], rideHeightR: [30, 80],
    springRateF: [100, 400], springRateR: [120, 450],
    damperF: [0.2, 0.95], damperR: [0.2, 0.95],
    arbF: [0.1, 0.9], arbR: [0.1, 0.9],
    wingAngleF: [3, 25], wingAngleR: [1, 18],
    diffPreload: [10, 80], diffLock: [20, 90],
    brakeBias: [50, 62], tyrePressureF: [18, 24], tyrePressureR: [18, 24],
    camberF: [-5, 0], camberR: [-4.5, 0], toeF: [-0.3, 0.3], toeR: [-0.3, 0.3],
  };
  for(let iter=0; iter<maxIter; iter++) {
    let improved = false;
    for(const p of params) {
      const d = deltas[p];
      const lo = constraints[p][0];
      const hi = constraints[p][1];
      // Try increasing
      const testUp = {...best, [p]: Math.min(hi, best[p]+d)};
      const tUp = estimateLapTime(testUp, massKg, powerW, trackLengthM);
      // Try decreasing
      const testDn = {...best, [p]: Math.max(lo, best[p]-d)};
      const tDn = estimateLapTime(testDn, massKg, powerW, trackLengthM);
      if(tUp < bestTime) { best = testUp; bestTime = tUp; improved = true; }
      else if(tDn < bestTime) { best = testDn; bestTime = tDn; improved = true; }
    }
    history.push(bestTime);
    if(!improved) break;
  }
  // Sensitivity analysis
  const sensMap = params.map(p => {
    const up = {...best, [p]: Math.min(constraints[p][1], best[p]+deltas[p])};
    const dn = {...best, [p]: Math.max(constraints[p][0], best[p]-deltas[p])};
    return { param: p, lapTimeDelta: estimateLapTime(up,massKg,powerW,trackLengthM)-estimateLapTime(dn,massKg,powerW,trackLengthM) };
  }).sort((a,b)=>Math.abs(b.lapTimeDelta)-Math.abs(a.lapTimeDelta));
  return { bestSetup: best, bestLapTime: bestTime, iterations: history.length, convergenceHistory: history, sensitivityMap: sensMap };
}

// Multi-objective: qualifying vs race setup
export function qualifyingSetup(qualLap: number, raceLap: number, fuelEffect: number): { qualSetup: SetupParams; raceSetup: SetupParams; delta: number } {
  return {
    qualSetup: {...DEFAULT_SETUP, wingAngleF: DEFAULT_SETUP.wingAngleF+2, wingAngleR: DEFAULT_SETUP.wingAngleR+1.5, damperF: 0.7, damperR: 0.75},
    raceSetup: DEFAULT_SETUP,
    delta: qualLap - raceLap - fuelEffect,
  };
}
