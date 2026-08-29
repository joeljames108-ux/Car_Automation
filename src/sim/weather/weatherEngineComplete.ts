// ========================================================================
// WEATHER ENGINE — Full atmospheric model with track evolution
// ========================================================================
export interface WeatherState {
  tempC: number; humidity: number; pressureHpa: number;
  rainIntensity: number; windSpeedKmh: number; windDir: number;
  trackTempC: number; cloudCover: number;
}
export interface TrackEvolution {
  rubberLevel: number;
  gripFactor: number;
  marblesLevel: number;
  surfaceTemp: number;
}

// Full air density with humidity
export function airDensityFull(tempC: number, humidity: number, pressureHpa: number, altM: number): number {
  const P = (pressureHpa - 12*(altM/100))*100;
  const T = tempC+273.15;
  const rhoDry = P/(287.058*T);
  const Pv = 6.1078*Math.pow(10, 7.5*tempC/(237.3+tempC))*humidity*100;
  return rhoDry*(1-0.378*Pv/P);
}

// Wind effect on drag and side force
export function windEffect(vKmh: number, windSpeed: number, windDir: number, cd: number, cSide: number, area: number) {
  const vCar = vKmh/3.6;
  const vWind = windSpeed/3.6;
  const b = windDir*Math.PI/180;
  const vHeadwind = vWind*Math.cos(b);
  const vCrosswind = vWind*Math.sin(b);
  const vEff = vCar + vHeadwind;
  const dragMul = (vEff*vEff)/(vCar*vCar+0.01);
  const sideForce = 0.5*1.225*vCrosswind*vCrosswind*cSide*area;
  return { effectiveSpeed: vEff*3.6, dragMultiplier: dragMul, sideForce };
}

// Track evolution model: rubber build-up over race distance
export function updateTrackEvolution(ev: TrackEvolution, lapNum: number, weatherGrip: number): TrackEvolution {
  const rubberBuildup = 0.002 * (1-Math.exp(-lapNum/20));
  const marblesAccum = 0.001 * lapNum;
  const tempEvolution = ev.surfaceTemp + 0.05;
  return {
    rubberLevel: Math.min(1, ev.rubberLevel + rubberBuildup),
    gripFactor: 0.95 + rubberBuildup*5 - marblesAccum*3,
    marblesLevel: Math.min(0.3, marblesAccum),
    surfaceTemp: tempEvolution,
  };
}

// Track drying model
export function trackDrying(waterMm: number, evapRate: number, drainageRate: number, rubberLevel: number): number {
  const clearing = evapRate + drainageRate + rubberLevel*0.01;
  return Math.max(0, waterMm - clearing);
}

// Safety car probability based on conditions
export function scProbability(lapNum: number, totalLaps: number, weatherGrip: number, overtakingDiff: number): number {
  const base = 0.005;
  const weatherFactor = (1-weatherGrip)*0.03;
  const overtakingFactor = overtakingDiff*0.002;
  const lapFactor = lapNum < 5 ? 0.02 : lapNum > totalLaps-5 ? 0.015 : 0;
  return Math.min(0.1, base+weatherFactor+overtakingFactor+lapFactor);
}

// ========================================================================
// MONTE CARLO ENGINE — 10K lap statistical simulation
// ========================================================================
export interface MonteCarloResult {
  meanLapTime: number; stdDev: number;
  percentiles: { p1: number; p5: number; p25: number; p50: number; p75: number; p95: number; p99: number };
  poleProbability: number;
  pointsProbability: number;
  histogram: { bucket: string; count: number }[];
}

export function monteCarloSim(
  baseLap: number, numLaps: number, variationPct: number,
  lapFn: (v: number) => number
): MonteCarloResult {
  const times: number[] = [];
  for(let i=0;i<numLaps;i++) {
    const r1=Math.random(), r2=Math.random(), r3=Math.random();
    const gaussian = (r1+r2+r3-1.5)/1.5;
    const variation = gaussian * variationPct * baseLap;
    times.push(lapFn(variation));
  }
  times.sort((a,b)=>a-b);
  const mean = times.reduce((s,x)=>s+x,0)/times.length;
  const std = Math.sqrt(times.reduce((s,x)=>s+(x-mean)*(x-mean),0)/times.length);
  const pct = (f: number) => times[Math.floor(f*times.length)];
  // Histogram
  const min = times[0], max = times[times.length-1];
  const bucketSize = (max-min)/20;
  const histogram: {bucket:string;count:number}[] = [];
  for(let b=0;b<20;b++) {
    const lo = min+b*bucketSize;
    const hi = lo+bucketSize;
    const count = times.filter(t=>t>=lo&&t<hi).length;
    histogram.push({ bucket: lo.toFixed(2)+"-"+hi.toFixed(2), count });
  }
  return {
    meanLapTime: Math.round(mean*1000)/1000,
    stdDev: Math.round(std*1000)/1000,
    percentiles: { p1:pct(0.01), p5:pct(0.05), p25:pct(0.25), p50:pct(0.5), p75:pct(0.75), p95:pct(0.95), p99:pct(0.99) },
    poleProbability: times.filter(t=>t<baseLap*1.005).length/times.length,
    pointsProbability: times.filter(t=>t<baseLap*1.02).length/times.length,
    histogram,
  };
}
