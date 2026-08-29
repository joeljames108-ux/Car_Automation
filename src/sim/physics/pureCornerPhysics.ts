// PURE CORNER PHYSICS — Every Formula for Corner Performance
// Pacejka tire model, friction ellipse, aero coupling, weight transfer
const GRAVITY = 9.81;
const AIR_DENSITY = 1.225;

export interface PacejkaCoefficients { B: number; C: number; D: number; E: number; }

export interface TireCompoundData {
  name: string; muDry: number; muWet: number; optimalTempLow: number;
  optimalTempHigh: number; peakTemp: number; thermalMass: number;
  wearRate: number; wearGripFactor: number; cliffWear: number;
  loadSensitivity: number; relaxationLength: number;
  contactPatchLength: number; contactPatchWidth: number;
  inflationPressure: number; rollingResistance: number;
}

export const TIRE_COMPOUNDS: Record<string, TireCompoundData> = {
  C1_Hard: { name:"Pirelli C1",muDry:1.68,muWet:0.92,optimalTempLow:110,optimalTempHigh:140,peakTemp:125,thermalMass:2200,wearRate:0.0018,wearGripFactor:0.40,cliffWear:0.88,loadSensitivity:0.085,relaxationLength:0.28,contactPatchLength:0.22,contactPatchWidth:0.27,inflationPressure:21.5,rollingResistance:0.0095 },
  C3_Medium: { name:"Pirelli C3",muDry:1.78,muWet:0.88,optimalTempLow:95,optimalTempHigh:125,peakTemp:110,thermalMass:1900,wearRate:0.0035,wearGripFactor:0.45,cliffWear:0.80,loadSensitivity:0.095,relaxationLength:0.26,contactPatchLength:0.22,contactPatchWidth:0.27,inflationPressure:21.0,rollingResistance:0.0102 },
  C5_Soft: { name:"Pirelli C5",muDry:1.90,muWet:0.82,optimalTempLow:80,optimalTempHigh:105,peakTemp:92,thermalMass:1500,wearRate:0.0085,wearGripFactor:0.52,cliffWear:0.65,loadSensitivity:0.105,relaxationLength:0.24,contactPatchLength:0.22,contactPatchWidth:0.27,inflationPressure:20.0,rollingResistance:0.0115 },
  FullWet: { name:"Pirelli Wet",muDry:0.45,muWet:1.35,optimalTempLow:40,optimalTempHigh:70,peakTemp:55,thermalMass:2000,wearRate:0.0020,wearGripFactor:0.35,cliffWear:0.90,loadSensitivity:0.080,relaxationLength:0.30,contactPatchLength:0.22,contactPatchWidth:0.27,inflationPressure:19.0,rollingResistance:0.0120 },
  GT3_Hard: { name:"GT3 Hard",muDry:1.55,muWet:0.85,optimalTempLow:85,optimalTempHigh:110,peakTemp:97,thermalMass:2400,wearRate:0.0020,wearGripFactor:0.38,cliffWear:0.82,loadSensitivity:0.090,relaxationLength:0.32,contactPatchLength:0.25,contactPatchWidth:0.30,inflationPressure:22.0,rollingResistance:0.0100 },
  GT3_Soft: { name:"GT3 Soft",muDry:1.70,muWet:0.78,optimalTempLow:75,optimalTempHigh:100,peakTemp:87,thermalMass:2000,wearRate:0.0045,wearGripFactor:0.42,cliffWear:0.72,loadSensitivity:0.100,relaxationLength:0.30,contactPatchLength:0.25,contactPatchWidth:0.30,inflationPressure:21.0,rollingResistance:0.0110 },
};

// PACEJKA MAGIC FORMULA: F = D * sin(C * arctan(B*x - E*(B*x - arctan(B*x))))
export function pacejkaLateral(slipAngleDeg: number, Fz: number, p: PacejkaCoefficients): number {
  const x = slipAngleDeg * Math.PI / 180;
  const D = p.D * Fz / 1000;
  return D * Math.sin(p.C * Math.atan(p.B * x));
}

// FRICTION ELLIPSE: Limits total force to mu*Fz when combined slip
export function frictionEllipse(fx: number, fy: number, maxF: number): [number, number] {
  const tot = Math.sqrt(fx*fx + fy*fy);
  if (tot <= maxF) return [fx, fy];
  const s = maxF / tot;
  return [fx*s, fy*s];
}

// AERO: downforce and drag at speed. DF = 0.5*rho*v^2*Cl*A
export function calcAero(vKmh: number, cd: number, clF: number, clR: number, area: number, rho: number = AIR_DENSITY) {
  const v = vKmh / 3.6;
  const qS = 0.5 * rho * v * v * area;
  return { drag: qS*cd, dfFront: -qS*clF, dfRear: -qS*clR, dfTotal: -qS*(clF+clR) };
}

// AIR DENSITY: rho = P/(R*T) corrected for altitude
export function airDensity(altM: number, tempC: number): number {
  return (101325 - 1201*(altM/100)) / (287.058 * (tempC + 273.15));
}

export interface VehicleParams {
  massKg: number; wdf: number; cgH: number; wb: number; twF: number; twR: number;
}

export interface WheelLoads { fl: number; fr: number; rl: number; rr: number; fTotal: number; rTotal: number; }

// WEIGHT TRANSFER: dFlong = m*ax*h/wb, dFlat = m*ay*h/tw
export function wheelLoads(v: VehicleParams, axG: number, ayG: number, dFf: number = 0, dFr: number = 0): WheelLoads {
  const W = v.massKg * GRAVITY;
  const Wf = W*v.wdf + dFf;
  const Wr = W*(1-v.wdf) + dFr;
  const dL = v.massKg * axG * GRAVITY * v.cgH / v.wb;
  const fT = axG>0 ? Wf+dL : Wf-dL;
  const rT = axG>0 ? Wr-dL : Wr+dL;
  const dLat = v.massKg * ayG * GRAVITY * v.cgH;
  const dLF = dLat * 0.6 / v.twF;
  const dLR = dLat * 0.4 / v.twR;
  return { fl:Math.max(0,fT/2-dLF), fr:Math.max(0,fT/2+dLF), rl:Math.max(0,rT/2-dLR), rr:Math.max(0,rT/2+dLR), fTotal:fT, rTotal:rT };
}

// BRAKING: v^2 = v0^2 - 2*a*d, a = mu*g*(1 + DF/m*g)
export function brakingDistance(v0Kmh: number, v1Kmh: number, mu: number, massKg: number, dfN: number, brakeTempC: number = 400): { distM: number; timeS: number; decelG: number; energyJ: number } {
  const v0 = v0Kmh/3.6, v1 = v1Kmh/3.6;
  const tempF = brakeTempC < 200 ? 0.7+0.3*(brakeTempC/200) : brakeTempC > 900 ? 0.6+0.4*Math.max(0,(1100-brakeTempC)/200) : 1.0;
  const avgV = (v0+v1)/2;
  const avgDF = dfN * Math.pow(avgV/(200/3.6), 2);
  const Fz = massKg*GRAVITY + avgDF;
  const a = mu*tempF*Fz/massKg;
  const d = Math.max(0,(v0*v0-v1*v1)/(2*a));
  const t = Math.max(0,(v0-v1)/a);
  return { distM:d, timeS:t, decelG:a/GRAVITY, energyJ:0.5*massKg*(v0*v0-v1*v1) };
}

// CORNER SPEED: v = sqrt(mu*(g + DF/m)*R * cos(camber) + g*tan(banking)*R)
export function maxCornerSpeed(mu: number, R: number, massKg: number, dfN: number, camberDeg: number, bankDeg: number): number {
  const camF = Math.cos(camberDeg*Math.PI/180);
  const bankF = Math.tan(bankDeg*Math.PI/180)*GRAVITY;
  const v = Math.sqrt(Math.max(1, mu*GRAVITY*R*camF + bankF*R));
  // Iterate for downforce coupling
  let vm = v;
  for(let i=0;i<10;i++) {
    const f = mu*(massKg*GRAVITY+dfN*Math.pow(vm/(200/3.6),2))/massKg;
    const vn = Math.sqrt(Math.max(1,f*R*camF+bankF*R));
    if(Math.abs(vn-vm)<0.05) break;
    vm = vm*0.5+vn*0.5;
  }
  return vm*3.6;
}

// TRAIL BRAKING: brake pressure vs corner progress
// Phase1(0-30%): full brake, Phase2(30-70%): trail, Phase3(70-100%): lateral only
export function trailBrake(progress: number, depth: number): number {
  if(progress<0.3) return 1.0;
  if(progress>0.7) return 0.0;
  return Math.max(0, 1.0-((progress-0.3)/0.4)*(1+depth*0.3));
}

// THROTTLE: progress through corner exit, limited by rear grip
export function throttlePos(progress: number, rearGrip: number, smooth: number): number {
  return Math.min(Math.max(0,progress*2*(1-smooth*0.5)), rearGrip);
}

// CORNER DIFFICULTY INDEX (0-100)
export function difficultyIndex(appSpd: number, apexSpd: number, R: number, cam: number, elev: number, grip: number, w: number): number {
  const sr = (appSpd-apexSpd)/appSpd;
  return Math.round(Math.min(100, sr*30 + Math.min(1,50/R)*20 + Math.min(1,appSpd/350)*15 + Math.abs(cam)/10*10 + Math.abs(elev)/40*10 + (1-grip)*10 + Math.min(1,(14-w)/6)*5));
}

// MAX CORNER SPEED (SIMPLIFIED)
export function maxCSimple(R: number, mu: number, m: number, df: number): number {
  return Math.max(5, Math.sqrt(mu*GRAVITY*R*(1+df/(m*GRAVITY))))*3.6;
}

// ========================================================================
// MASTER CORNER SOLVER — Full physics for a single corner
// ========================================================================
export interface CornerInput {
  radiusM: number; arcDeg: number; camberDeg: number; elevChangeM: number;
  surfaceGrip: number; approachKmh: number;
  massKg: number; wdf: number; cgH: number; wb: number; twF: number; twR: number;
  cd: number; clF: number; clR: number; area: number;
  muDry: number; tireTempC: number; tireWear: number;
  peakTemp: number; tempLow: number; tempHigh: number; wearRate: number; wearFactor: number; cliffWear: number; loadSens: number;
  weatherGrip: number; driverSkill: number; trailDepth: number;
  brakeTempC: number; hasDRS: boolean;
}

export interface CornerResult {
  apexKmh: number; exitKmh: number; maxLatG: number; maxBrakeG: number;
  brakeDistM: number; brakeTimeS: number; cornerDistM: number; cornerTimeS: number; totalTimeS: number;
  flN: number; frN: number; rlN: number; rrN: number;
  aeroPct: number; severity: string;
}

export function solveCorner(inp: CornerInput): CornerResult {
  const { radiusM: R, camberDeg: cam, surfaceGrip: gs, weatherGrip: wg, massKg: m, wdf, cgH, wb, twF, twR, cd, clF, clR, area, driverSkill, trailDepth } = inp;
  const eg = gs * wg;
  const tDiff = inp.tireTempC - inp.peakTemp;
  const tSig = (inp.tempHigh - inp.tempLow) / 3;
  const tF = Math.exp(-0.5 * (tDiff*tDiff) / (tSig*tSig));
  const wF = inp.tireWear < inp.cliffWear ? 1-inp.wearFactor*inp.tireWear : Math.max(0.3, 1-inp.wearFactor*inp.tireWear-2*(inp.tireWear-inp.cliffWear));
  const mu = inp.muDry * eg * tF * wF;
  // Iterative corner speed with downforce coupling
  let vm = Math.sqrt(Math.max(1, mu*GRAVITY*R));
  for(let i=0;i<12;i++) {
    const rho = airDensity(inp.cgH*10, 25);
    const aero = calcAero(vm*3.6, cd, clF, clR, area, rho);
    const Fz = m*GRAVITY + aero.dfTotal;
    const lsf = Math.pow(Fz/(m*GRAVITY), -inp.loadSens);
    const camF = Math.cos(cam*Math.PI/180);
    const f = mu*Fz*lsf*camF/m;
    const vn = Math.sqrt(Math.max(1, f*R));
    if(Math.abs(vn-vm)<0.05) break;
    vm = vm*0.5+vn*0.5;
  }
  const apexKmh = Math.max(18, vm*3.6);
  const skillF = 0.85+0.15*driverSkill;
  const adjApex = apexKmh * skillF * (1+trailDepth*0.03);
  const v0 = inp.approachKmh/3.6;
  const v1 = adjApex*1.05/3.6;
  const br = brakingDistance(inp.approachKmh, adjApex*1.05, mu, m, calcAero((inp.approachKmh+adjApex)/2,cd,clF,clR,area).dfTotal, inp.brakeTempC);
  const arcLen = (inp.arcDeg/360)*2*Math.PI*R;
  const cornerTime = arcLen / Math.max(1, vm);
  const latG = vm*vm/(R*GRAVITY);
  const wl = wheelLoads({massKg:m,wdf,cgH,wb,twF,twR}, 0, latG);
  const aero = calcAero(adjApex, cd, clF, clR, area);
  const sev = latG>3.5?"extreme":latG>2.5?"high":latG>1.5?"medium":"low";
  return {
    apexKmh: Math.round(adjApex*10)/10, exitKmh: Math.round(adjApex*1.08*10)/10,
    maxLatG: Math.round(latG*100)/100, maxBrakeG: br.decelG,
    brakeDistM: br.distM, brakeTimeS: br.timeS, cornerDistM: arcLen, cornerTimeS: cornerTime,
    totalTimeS: Math.round((br.timeS+cornerTime+0.5)*1000)/1000,
    flN: wl.fl, frN: wl.fr, rlN: wl.rl, rrN: wl.rr,
    aeroPct: Math.round(aero.dfTotal/(m*GRAVITY)*100*10)/10, severity: sev,
  };
}

// ========================================================================
// FULL LAP TIME SIMULATOR — Applies corner physics to every corner
// ========================================================================
export interface TrackCorner { name: string; radiusM: number; arcDeg: number; camberDeg: number; elevM: number; grip: number; widthM: number; drs: boolean; }
export interface TrackSegment { type: "straight"|"corner"; lengthM: number; corner?: TrackCorner; }
export interface VehicleSetup {
  massKg: number; wdf: number; cgH: number; wb: number; twF: number; twR: number;
  cd: number; clF: number; clR: number; area: number;
  peakPowerW: number; dragN: number;
  tireMu: number; tireTemp: number; tireWear: number;
  peakTemp: number; tempLow: number; tempHigh: number; wearRate: number; wearFac: number; cliffWear: number; loadSens: number;
  brakeTemp: number; weatherGrip: number; driverSkill: number; trailDepth: number;
}
export interface LapResult {
  totalTimeS: number; lapTimeStr: string; topSpeedKmh: number; avgSpeedKmh: number;
  corners: { name: string; apexKmh: number; latG: number; brakeDist: number; time: number; severity: string; aeroPct: number; }[];
  sectorTimes: number[];
}

// FORWARD-BACKWARD SPEED PROFILE INTEGRATOR
// 1. Calculate max corner speed for each corner (grip limit)
// 2. Backward pass: braking from next corner speed
// 3. Forward pass: power-limited acceleration between corners
export function simulateFullLap(segments: TrackSegment[], vehicle: VehicleSetup): LapResult {
  const N = segments.length;
  const ds = 25;
  const totalSteps = Math.ceil(segments.reduce((s,x)=>s+x.lengthM,0)/ds);
  const speed = new Float64Array(totalSteps);
  const mu = vehicle.tireMu * vehicle.weatherGrip;
  const rho = airDensity(vehicle.cgH*10, 25);
  const kDf = Math.max(0, vehicle.clF+vehicle.clR) * 0.5 * rho * vehicle.area / (Math.pow(200/3.6,2));
  const wheelPowerW = vehicle.peakPowerW * 0.87 * 0.9;
  const rollingN = 0.012 * vehicle.massKg * GRAVITY;
  const brakeDecelMs2 = mu * 1.04 * GRAVITY;
  // Fill speed profile: corners = grip limit, straights = 250
  let dist = 0;
  for(const seg of segments) {
    const steps = Math.ceil(seg.lengthM / ds);
    for(let i=0;i<steps;i++) {
      const idx = Math.floor(dist/ds);
      if(idx < totalSteps) {
        if(seg.type==="corner" && seg.corner) {
          speed[idx] = maxCSimple(seg.corner.radiusM, mu, vehicle.massKg, calcAero(200,vehicle.cd,vehicle.clF,vehicle.clR,vehicle.area).dfTotal);
          speed[idx] /= 3.6;
        } else {
          speed[idx] = speed[idx] || 60;
        }
      }
      dist += ds;
    }
  }
  // Backward: braking integration
  for(let i=totalSteps-2;i>=0;i--) {
    if(speed[i]>0) {
      const allowed = Math.sqrt(speed[i+1]*speed[i+1] + 2*brakeDecelMs2*ds);
      speed[i] = Math.min(speed[i], allowed);
    }
  }
  // Forward: power-limited acceleration
  speed[0] = Math.max(speed[0], 16.7);
  for(let i=0;i<totalSteps-1;i++) {
    const v = Math.max(8, speed[i]);
    const drag = 0.5*rho*(vehicle.cd+kDf*0.11)*v*v+rollingN;
    const accel = Math.min(mu*0.62*0.85*0.92*GRAVITY, wheelPowerW/(vehicle.massKg*v)-drag/vehicle.massKg);
    const ns = Math.sqrt(v*v+2*Math.max(0.4,accel)*ds);
    speed[i+1] = Math.min(speed[i+1]||999, ns);
  }
  // Lap time
  let totalTime=0, maxSpd=0;
  for(let i=0;i<totalSteps;i++) {
    const v = Math.max(5, speed[i]);
    totalTime += ds/v;
    maxSpd = Math.max(maxSpd, v*3.6);
  }
  const totalDist = totalSteps*ds;
  const mins = Math.floor(totalTime/60);
  const secs = (totalTime%60).toFixed(3);
  return {
    totalTimeS: Math.round(totalTime*1000)/1000, lapTimeStr: mins+":"+(parseFloat(secs)<10?"0":"")+secs,
    topSpeedKmh: Math.round(maxSpd*10)/10, avgSpeedKmh: Math.round((totalDist/1000)/(totalTime/3600)*10)/10,
    corners: [], sectorTimes: [totalTime/3, totalTime/3, totalTime/3],
  };
}

// ========================================================================
// TIRE THERMAL MODEL — Temperature evolution through stint
// ========================================================================
export interface TireThermalState { tempC: number; pressure: number; wear: number; gripMu: number; }

// Heat generation: Q = F_slip * v_slip * dt
// Heat dissipation: Q_out = h * A * (T - T_amb)
// Temperature change: dT = (Q_in - Q_out) / (m * cp)
export function updateTireTemp(state: TireThermalState, latForceN: number, speedKmh: number, ambTempC: number, dt: number, compound: { thermalMass: number; peakTemp: number; optimalTempLow: number; optimalTempHigh: number; muDry: number; loadSensitivity: number; wearGripFactor: number; cliffWear: number; wearRate: number; }): TireThermalState {
  const v = speedKmh/3.6;
  const slipSpeed = v * 0.08;
  const heatGen = latForceN * slipSpeed * dt;
  const convH = 25 + 0.5 * speedKmh;
  const area = 0.055;
  const heatOut = convH * area * (state.tempC - ambTempC) * dt;
  const dT = (heatGen - heatOut) / compound.thermalMass;
  const newTemp = state.tempC + dT;
  const tempDiff = newTemp - compound.peakTemp;
  const tSig = (compound.optimalTempHigh - compound.optimalTempLow) / 3;
  const tFactor = Math.exp(-0.5 * (tempDiff/tSig) * (tempDiff/tSig));
  const wF = state.wear < compound.cliffWear ? 1-compound.wearGripFactor*state.wear : Math.max(0.3, 1-compound.wearGripFactor*state.wear-2*(state.wear-compound.cliffWear));
  const newWear = state.wear + compound.wearRate * v * dt / 3600;
  const Fz = 5000;
  const lsf = Math.pow(Fz/5000, -compound.loadSensitivity);
  return { tempC: newTemp, pressure: state.pressure * (1 + 0.001 * dT), wear: Math.min(1, newWear), gripMu: compound.muDry * tFactor * wF * lsf };
}
export function createTireState(tempC: number, pressure: number): TireThermalState {
  return { tempC, pressure, wear: 0, gripMu: 1.5 };
}

// ========================================================================
// WEATHER & TRACK EVOLUTION MODEL
// ========================================================================
export interface WeatherState {
  tempC: number; humidity: number; pressureHpa: number;
  rainIntensity: number; windSpeedKmh: number; windDir: number;
  trackTempC: number; gripLevel: number;
}

export function airDensityW(w: WeatherState, altM: number): number {
  const P = (w.pressureHpa - 12*(altM/100)) * 100;
  const T = w.tempC + 273.15;
  const rhoDry = P / (287.058 * T);
  const Pv = 6.1078 * Math.pow(10, 7.5*w.tempC/(237.3+w.tempC)) * w.humidity * 100;
  return rhoDry * (1 - 0.378 * Pv / P);
}

// Track rubber build-up: grip improves 2-5% over first stint
export function trackEvolution(lapNum: number, baseGrip: number): number {
  return baseGrip + 0.03 * (1 - Math.exp(-lapNum / 15));
}

// Rain grip model: standing water reduces grip exponentially
export function rainGrip(rainMM: number, tireWet: boolean): number {
  if(!tireWet) return Math.max(0.4, 1 - rainMM * 0.08);
  return Math.max(0.55, 1 - rainMM * 0.03);
}

// Hydroplaning speed: V = sqrt(2*P/(rho_w*A)*(1/tread_depth))
export function hydroplaningSpeed(waterDepthMm: number, tirePressureBar: number): number {
  const P = tirePressureBar * 100000;
  const rho_w = 997;
  const A = 0.05;
  const tread = Math.max(0.001, waterDepthMm / 1000);
  return Math.sqrt(2 * P / (rho_w * A * (1/tread))) * 3.6;
}

// ========================================================================
// MONTE CARLO LAP TIME SIMULATION
// ========================================================================
export interface MonteCarloResult {
  meanTimeS: number; stdDevS: number; minTimeS: number; maxTimeS: number;
  percentiles: { p5: number; p25: number; p50: number; p75: number; p95: number };
  lapTimes: number[];
}

export function monteCarloLap(baseTimeS: number, numLaps: number, lapFn: (variation: number) => number): MonteCarloResult {
  const times: number[] = [];
  for(let i=0;i<numLaps;i++) {
    const v = (Math.random()+Math.random()+Math.random()-1.5)/3 * 0.02;
    times.push(lapFn(v));
  }
  times.sort((a,b)=>a-b);
  const mean = times.reduce((s,x)=>s+x,0)/times.length;
  const std = Math.sqrt(times.reduce((s,x)=>s+(x-mean)*(x-mean),0)/times.length);
  return {
    meanTimeS: Math.round(mean*1000)/1000, stdDevS: Math.round(std*1000)/1000,
    minTimeS: times[0], maxTimeS: times[times.length-1],
    percentiles: {
      p5: times[Math.floor(numLaps*0.05)], p25: times[Math.floor(numLaps*0.25)],
      p50: times[Math.floor(numLaps*0.50)], p75: times[Math.floor(numLaps*0.75)],
      p95: times[Math.floor(numLaps*0.95)],
    },
    lapTimes: times,
  };
}

// ========================================================================
// RACE STRATEGY OPTIMIZER
// ========================================================================
export interface StrategyStint {
  compound: string; laps: number; startFuelKg: number;
}

export interface StrategyResult {
  totalTimeS: number; pitStops: number; stints: StrategyStint[];
  avgLapTimeS: number; tireDegCurve: number[];
}

export function optimizeStint(baseLapTimeS: number, stintLaps: number, wearRate: number, cliffWear: number, pitLossS: number): { avgTime: number; totalStintTime: number } {
  let total = 0;
  for(let lap=0;lap<stintLaps;lap++) {
    const wear = lap * wearRate;
    const wearPenalty = wear < cliffWear ? wear * 0.15 : wear * 0.15 + 2*(wear-cliffWear);
    total += baseLapTimeS + wearPenalty;
  }
  return { avgTime: total/stintLaps, totalStintTime: total };
}

// ========================================================================
// LAP TIME SENSITIVITY ANALYSIS
// ========================================================================
export interface SensitivityResult {
  parameter: string; lowValue: number; highValue: number;
  lowLapTime: number; highLapTime: number; sensitivity: number;
}

export function sensitivityAnalysis(baseLapS: number, params: { name: string; low: number; high: number; lapAtLow: number; lapAtHigh: number }[]): SensitivityResult[] {
  return params.map(p => ({
    parameter: p.name, lowValue: p.low, highValue: p.high,
    lowLapTime: p.lapAtLow, highLapTime: p.lapAtHigh,
    sensitivity: Math.abs(p.lapAtHigh - p.lapAtLow) / (p.high - p.low),
  }));
}

// ========================================================================
// ENGINE POWERTRAIN MODEL — Torque curve, power delivery, gear selection
// ========================================================================
export interface EngineParams {
  peakPowerW: number; peakTorqueNm: number; peakPowerRpm: number; peakTorqueRpm: number;
  redline: number; idleRpm: number; displacement: number; cylinders: number;
  isTurbo: boolean; boostBar: number; turboLag: number;
  isHybrid: boolean; mguKPower: number; mguHPower: number;
  bsfc: number; fuelEnergyMJ: number;
  frictionCoeff: number; rotationalInertia: number;
}

// Torque curve model using exponential rise and fall
// T(rpm) = T_peak * f(rpm) where f is a shape function
export function torqueAtRpm(rpm: number, e: EngineParams): number {
  if(rpm < e.idleRpm || rpm > e.redline) return 0;
  const rpmNorm = (rpm - e.idleRpm) / (e.redline - e.idleRpm);
  const peakNorm = (e.peakTorqueRpm - e.idleRpm) / (e.redline - e.idleRpm);
  // Rise to peak
  if(rpmNorm <= peakNorm) {
    const t = rpmNorm / peakNorm;
    return e.peakTorqueNm * Math.pow(t, 0.6);
  }
  // Fall from peak (naturally aspirated: gradual, turbo: steeper)
  const t = (rpmNorm - peakNorm) / (1 - peakNorm);
  const fallRate = e.isTurbo ? 1.8 : 1.2;
  return e.peakTorqueNm * Math.pow(1 - t, fallRate);
}

// Power = Torque * angular_velocity
export function powerAtRpm(rpm: number, e: EngineParams): number {
  return torqueAtRpm(rpm, e) * rpm * Math.PI / 30;
}

// Gear ratios and final drive
export interface TransmissionParams {
  gearRatios: number[]; finalDrive: number; efficiency: number;
  shiftTimeMs: number; type: "sequential"|"dct"|"auto"|"manual";
}

// Speed at RPM in given gear: v = rpm * 2*pi*r / (gear * finalDrive)
export function speedAtRpm(rpm: number, gear: number, trans: TransmissionParams, wheelRadius: number = 0.33): number {
  if(gear < 1 || gear > trans.gearRatios.length) return 0;
  const ratio = trans.gearRatios[gear-1] * trans.finalDrive;
  return rpm * 2 * Math.PI * wheelRadius / (ratio * 60) * 3.6;
}

// RPM at speed in given gear
export function rpmAtSpeed(vKmh: number, gear: number, trans: TransmissionParams, wheelRadius: number = 0.33): number {
  if(gear < 1 || gear > trans.gearRatios.length) return 0;
  const ratio = trans.gearRatios[gear-1] * trans.finalDrive;
  return vKmh / 3.6 * ratio * 60 / (2 * Math.PI * wheelRadius);
}

// Optimal gear selection: highest gear where RPM stays above 60% of peak torque
export function optimalGear(vKmh: number, trans: TransmissionParams, redline: number, wr: number = 0.33): number {
  let best = 1;
  for(let g=1;g<=trans.gearRatios.length;g++) {
    const rpm = rpmAtSpeed(vKmh, g, trans, wr);
    if(rpm >= redline * 0.4 && rpm <= redline) best = g;
  }
  return best;
}

// Driving force at wheel: F = T * ratio * efficiency / wheel_radius
export function drivingForce(torqueNm: number, gear: number, trans: TransmissionParams, wr: number = 0.33): number {
  const ratio = trans.gearRatios[gear-1] * trans.finalDrive;
  return torqueNm * ratio * trans.efficiency / wr;
}

// ========================================================================
// SUSPENSION DYNAMICS — Weight transfer, roll, camber change
// ========================================================================
export interface SuspConfig {
  springF: number; springR: number; damperF: number; damperR: number;
  arbF: number; arbR: number; camberF: number; camberR: number;
  rideHeight: number; travel: number;
}

// Roll angle: phi = m*ay*cgH / (Kf + Kr - m*g*cgH)
// where Kf, Kr are roll stiffnesses in Nm/deg
export function rollAngle(ayG: number, massKg: number, cgH: number, twF: number, twR: number, s: SuspConfig): number {
  const Kf = s.springF * twF * twF / 2 + s.arbF * 5000;
  const Kr = s.springR * twR * twR / 2 + s.arbR * 5000;
  const rollMoment = massKg * ayG * GRAVITY * cgH;
  const rollStiffness = Kf + Kr - massKg * GRAVITY * cgH;
  return rollMoment / Math.max(1, rollStiffness) * 180 / Math.PI;
}

// Dynamic camber: static camber + roll-induced camber change
// For double wishbone: dCamber/dRoll ~= 0.5-0.7
export function dynamicCamber(staticCamber: number, rollDeg: number, rollCamberRate: number = 0.6): number {
  return staticCamber + rollDeg * rollCamberRate;
}

// Understeer gradient: K_us = (Wf/mu_f - Wr/mu_r) / (g * L)
// Positive = understeer, Negative = oversteer
export function understeerGradient(wfN: number, wrN: number, muF: number, muR: number, wb: number): number {
  return (wfN/Math.max(0.1,muF) - wrN/Math.max(0.1,muR)) / (GRAVITY * wb);
}

// ========================================================================
// BRAKE THERMAL DYNAMICS — Disc temperature, pad friction, fade
// ========================================================================
export interface BrakeState { discTempC: number; padTempC: number; fluidTempC: number; padWear: number; }
export function createBrakeState(): BrakeState { return { discTempC: 300, padTempC: 200, fluidTempC: 80, padWear: 0 }; }

// Brake disc heating: dT_disc = Q / (m * cp) where Q = friction * N * v * dt
// Brake disc cooling: dT = -h*A*(T-T_amb)*dt/(m*cp) where h depends on speed
export function updateBrakeTemp(state: BrakeState, brakeForceN: number, speedKmh: number, ambTempC: number, dt: number): BrakeState {
  const v = speedKmh/3.6;
  const muPad = 0.55;
  const discR = 0.165;
  const heatIn = brakeForceN * muPad * v * dt;
  const discMass = 5;
  const discCp = 800;
  const h = 100 + 2 * speedKmh;
  const A = 0.03;
  const heatOut = h * A * (state.discTempC - ambTempC) * dt;
  const newDiscTemp = state.discTempC + (heatIn - heatOut) / (discMass * discCp);
  const newPadTemp = state.padTempC + heatIn * 0.3 / (0.5 * 1000) - 50 * (state.padTempC - ambTempC) * dt / 1000;
  return { discTempC: Math.max(ambTempC, Math.min(1200, newDiscTemp)), padTempC: Math.max(ambTempC, Math.min(800, newPadTemp)), fluidTempC: state.fluidTempC, padWear: state.padWear + brakeForceN * v * dt * 1e-10 };
}

// Pad friction vs temperature: peak around 400-600C for carbon
export function padFriction(tempC: number): number {
  if(tempC < 200) return 0.35 + 0.2 * (tempC/200);
  if(tempC < 400) return 0.55 + 0.25 * ((tempC-200)/200);
  if(tempC < 600) return 0.80 + 0.05 * ((tempC-400)/200);
  if(tempC < 900) return 0.85 - 0.15 * ((tempC-600)/300);
  return 0.70 - 0.35 * ((tempC-900)/300);
}

// ========================================================================
// DIFFERENTIAL MODEL — LSD torque bias, differential lock effect
// ========================================================================
export function diffTorqueSplit(innerWheelSpeed: number, outerWheelSpeed: number, preloadNm: number, rampAngle: number, lockPct: number): { inner: number; outer: number } {
  const speedDiff = outerWheelSpeed - innerWheelSpeed;
  const biasTorque = preloadNm + speedDiff * Math.tan(rampAngle * Math.PI / 180) * lockPct;
  return { inner: biasTorque, outer: -biasTorque };
}

// ========================================================================
// DRIVER MODEL — Reaction time, consistency, error probability
// ========================================================================
export interface DriverProfile {
  skill: number; reactionMs: number; consistency: number;
  wetSkill: number; tyreManagement: number; racecraft: number;
}

export const DRIVER_SKILLS: Record<string, DriverProfile> = {
  beginner:  { skill: 0.50, reactionMs: 320, consistency: 0.85, wetSkill: 0.40, tyreManagement: 0.50, racecraft: 0.40 },
  amateur:   { skill: 0.60, reactionMs: 280, consistency: 0.88, wetSkill: 0.50, tyreManagement: 0.55, racecraft: 0.50 },
  club:      { skill: 0.70, reactionMs: 250, consistency: 0.90, wetSkill: 0.60, tyreManagement: 0.60, racecraft: 0.60 },
  semiPro:   { skill: 0.80, reactionMs: 220, consistency: 0.93, wetSkill: 0.70, tyreManagement: 0.70, racecraft: 0.70 },
  pro:       { skill: 0.90, reactionMs: 190, consistency: 0.96, wetSkill: 0.80, tyreManagement: 0.80, racecraft: 0.85 },
  elite:     { skill: 0.95, reactionMs: 170, consistency: 0.98, wetSkill: 0.90, tyreManagement: 0.90, racecraft: 0.90 },
  f1Champ:   { skill: 1.00, reactionMs: 150, consistency: 0.99, wetSkill: 0.95, tyreManagement: 0.95, racecraft: 0.95 },
}

// Driver error probability: increases with speed, difficulty, fatigue
export function errorProbability(driver: DriverProfile, cornerDifficulty: number, lapNumber: number, tireWear: number): number {
  const baseProb = (1 - driver.consistency) * 0.5;
  const diffFactor = cornerDifficulty / 100;
  const fatigueFactor = lapNumber * 0.002;
  const wearFactor = tireWear * 0.3;
  return Math.min(0.5, baseProb * diffFactor * (1 + fatigueFactor + wearFactor));
}

// Time lost when error occurs (lockup, wheelspin, off-track)
export function errorTimeLost(type: string): number {
  switch(type) {
    case "lockup": return 0.3;
    case "wheelspin": return 0.15;
    case "missed_apex": return 0.2;
    case "off_track": return 1.5;
    case "spin": return 5.0;
    default: return 0.1;
  }
}

// GROUND EFFECT: DF increases exponentially with lower ride height
export function groundEffectDF(clBase: number, rideH: number, area: number, vKmh: number): number {
  const v=vKmh/3.6;
  const cl=clBase*(1+0.15/Math.pow(Math.max(10,rideH)/100,0.8));
  return -0.5*AIR_DENSITY*v*v*area*cl;
}
export function porpoisingRisk(rideH: number, dfN: number, m: number, kF: number): boolean {
  return dfN > kF*Math.max(0,rideH-25)/1000*0.8 && rideH < 35;
}

// DRS: 15-20% drag reduction. Slipstream: up to 30%
export function effectiveDrag(cd: number, drs: boolean, slip: boolean, gap: number): number {
  if(drs) cd*=0.82;
  if(slip&&gap<1.5) cd*=0.72; else if(slip&&gap<3) cd*=0.85; else if(slip&&gap<5) cd*=0.92;
  return cd;
}

// Fuel: BSFC-based. Returns kg consumed
export function fuelUse(powerW: number, thr: number, dt: number): number {
  return (powerW/0.35*280/3.6e9)*dt*(thr>0.9?1.15:1)*(thr<0.01?0:1);
}

// Pit stop time loss
export function pitLoss(pitLen: number, pitSpd: number, stopTime: number): number {
  return pitLen/(pitSpd/3.6)+stopTime;
}

// Altitude power: NA loses ~12% per 1000m. Turbo compensates
export function altPower(altM: number, turbo: boolean): number {
  return turbo ? 1-altM*0.00005 : Math.pow(1-2.25577e-5*altM,5.25588);
}

// Lap time prediction from car specs
export function predictLap(mass: number, power: number, df: number, mu: number, cd: number, area: number, len: number): number {
  const ptw=power/mass;
  const gf=mu*(1+df/(mass*GRAVITY));
  const spd=Math.min(90,0.45*Math.sqrt(ptw*gf)-0.5*cd*area*10);
  return len/Math.max(10,spd);
}

// Pressure effect on grip
export function pressureGrip(actual: number, nominal: number): number {
  const d=(actual-nominal)/nominal;
  return 1-0.5*d*d;
}

// CORNER-BY-CORNER ANALYSIS: 6-phase breakdown for every corner
export interface CornerAnalysis {
  name: string;
  approach: { speed: number; dist: number; time: number };
  braking: { entry: number; exit: number; dist: number; time: number; decelG: number; trail: number };
  turnIn: { speed: number; slipAngle: number };
  midCorner: { speed: number; latG: number; downforce: number };
  apex: { speed: number; camberEff: number; gripMargin: number };
  exit: { speed: number; throttle: number; accelG: number };
  totalTime: number; totalDist: number; severity: string;
}
export function analyzeCorner(name: string, R: number, arcDeg: number, camDeg: number, appSpd: number, m: number, mu: number, dfN: number, trail: number): CornerAnalysis {
  const apexSpd = maxCSimple(R, mu, m, dfN);
  const br = brakingDistance(appSpd, apexSpd, mu, m, dfN);
  const arc = (arcDeg/360)*2*Math.PI*R;
  const cTime = arc / Math.max(1, apexSpd/3.6);
  const latG = Math.pow(apexSpd/3.6, 2) / (R * GRAVITY);
  const camE = Math.cos((camDeg+3)*Math.PI/180);
  const gM = mu*(1+dfN/(m*GRAVITY))*100 - latG*100;
  const sev = latG>3.5?"extreme":latG>2.5?"high":latG>1.5?"medium":"low";
  return { name, approach:{speed:appSpd,dist:br.distM+arc+30,time:br.timeS+cTime+0.5},
    braking:{entry:appSpd,exit:apexSpd*1.05,dist:br.distM,time:br.timeS,decelG:br.decelG,trail},
    turnIn:{speed:apexSpd*1.02,slipAngle:5+latG*1.5}, midCorner:{speed:apexSpd,latG,downforce:dfN},
    apex:{speed:apexSpd,camberEff:camE*100,gripMargin:gM}, exit:{speed:apexSpd*1.08,throttle:75,accelG:mu*0.5},
    totalTime:br.timeS+cTime+0.5, totalDist:br.distM+arc+30, severity:sev };
}

// SENSITIVITY: vary each parameter and measure lap time delta
export function sensitivity(params: {name:string; low:number; high:number; tLow:number; tHigh:number}[]): {name:string; delta:number; sensitivity:number}[] {
  return params.map(p=>({name:p.name, delta:p.tHigh-p.tLow, sensitivity:Math.abs(p.tHigh-p.tLow)/(p.high-p.low)}));
}

// MULTI-LAP RACE SIMULATION: tire degradation + fuel effect
export function raceSimulation(baseLap: number, totalLaps: number, wearRate: number, cliff: number, pitLoss: number, pitLap: number): { total: number; avgLap: number; bestLap: number; pitStops: number } {
  let total=0, best=999, stops=0;
  for(let l=0;l<totalLaps;l++) {
    let lap=baseLap;
    const wear = l * wearRate;
    lap += wear < cliff ? wear*0.15 : wear*0.15+2*(wear-cliff);
    if(l===pitLap) { lap+=pitLoss; stops++; }
    total+=lap;
    if(lap<best) best=lap;
  }
  return {total:Math.round(total*1000)/1000, avgLap:Math.round(total/totalLaps*1000)/1000, bestLap:Math.round(best*1000)/1000, pitStops:stops};
}

// QUALIFYING vs RACE SETUP: qualifying uses softer tires, lower fuel
export function qualifyingBoost(raceLap: number, qualLap: number, fuelEffect: number): number {
  return raceLap - qualLap - fuelEffect;
}

// SAFETY CAR probability per lap based on track and conditions
export function safetyCarProbability(trackBumps: number, weatherGrip: number, overtakingDiff: number): number {
  return 0.005 + trackBumps*0.01 + (1-weatherGrip)*0.03 + overtakingDiff*0.002;
}

// ========================================================================
// ADVANCED TIRE CONTACT PATCH MODEL
// Finite-element-inspired discretization of contact patch
// ========================================================================
export interface ContactPatchNode {
  x: number; y: number; pressure: number; tempC: number;
  slipX: number; slipY: number; fx: number; fy: number;
}

// Contact patch pressure distribution: parabolic front to trapezoidal rear
export function contactPatchPressure(nx: number, ny: number, FzN: number, mu: number, slipAngle: number): ContactPatchNode[] {
  const nodes: ContactPatchNode[] = [];
  const halfW = 0.135;
  const halfL = 0.11;
  for(let i=0;i<nx;i++) {
    for(let j=0;j<ny;j++) {
      const xi = (i+0.5)/nx;
      const yj = (j+0.5)/ny;
      const x = (xi-0.5)*2*halfL;
      const y = (yj-0.5)*2*halfW;
      const pMax = FzN / (Math.PI*halfL*halfW);
      const p = pMax * Math.pow(1-x*x/(halfL*halfL),0.5) * Math.pow(1-y*y/(halfW*halfW),0.5);
      const slipX = 0.05;
      const slipY = slipAngle*Math.PI/180;
      const fMax = p*mu*(2*halfL/nx)*(2*halfW/ny);
      const fx = Math.min(fMax, fMax*slipX/0.1);
      const fy = Math.min(fMax, fMax*slipY/0.1);
      nodes.push({ x, y, pressure:p, tempC:90, slipX, slipY, fx, fy });
    }
  }
  return nodes;
}

// TIRE RELAXATION LENGTH: transient force build-up
// Fy(t+dt) = Fy稳态 + (Fy稳态 - Fy(t)) * v*dt/sigma
export function tireTransient(forceSteady: number, forcePrev: number, speedMs: number, relaxationLength: number, dt: number): number {
  return forcePrev + (forceSteady - forcePrev) * speedMs * dt / Math.max(0.01, relaxationLength);
}

// SLIP ANGLE: alpha = atan(vy/vx)
export function slipAngle(vxMs: number, vyMs: number, steeringRad: number, wb: number, yawRate: number): number {
  const alpha = Math.atan2(vyMs + yawRate*wb*0.5, Math.max(0.1, Math.abs(vxMs))) - steeringRad;
  return alpha * 180 / Math.PI;
}

// SLIP RATIO: s = (omega*r - v) / max(|omega*r|, |v|)
export function slipRatio(wheelAngVel: number, wheelRadius: number, vehicleSpeed: number): number {
  const wr = wheelAngVel * wheelRadius;
  return (wr - vehicleSpeed) / Math.max(Math.abs(wr), Math.abs(vehicleSpeed), 0.1);
}

// ENERGY BALANCE: fuel energy = work + heat + friction
export interface EnergyBalance {
  fuelEnergyIn: number; mechanicalWork: number; heatRejection: number;
  frictionLoss: number; pumpingLoss: number; exhaustLoss: number;
  efficiency: number;
}
export function energyBalance(fuelPowerW: number, brakePowerW: number, thermalEff: number, frictionPct: number): EnergyBalance {
  const heat = fuelPowerW * (1 - thermalEff);
  const friction = fuelPowerW * frictionPct;
  return {
    fuelEnergyIn: fuelPowerW, mechanicalWork: brakePowerW,
    heatRejection: heat, frictionLoss: friction,
    pumpingLoss: fuelPowerW*0.05, exhaustLoss: heat*0.4,
    efficiency: brakePowerW / Math.max(1, fuelPowerW),
  };
}

// BATTERY SOC MODEL for hybrid/EV
export function batterySOC(soc: number, deployW: number, harvestW: number, dt: number, capacityWh: number, efficiency: number = 0.92): number {
  const netW = harvestW * efficiency - deployW / efficiency;
  const socChange = netW * dt / 3600 / capacityWh;
  return Math.max(0, Math.min(1, soc + socChange));
}

// KNOCK MODEL: end-gas autoignition prediction
export function knockRisk(rpm: number, load: number, timing: number, octane: number, boost: number): number {
  const tempFactor = rpm/10000 * load;
  const timingAdv = timing / 30;
  const knock = (tempFactor * boost * 0.5) / (octane/100 * (1+timingAdv));
  return Math.min(1, Math.max(0, knock));
}

// NVH: Engine order vibration
export function engineOrderVibration(rpm: number, cylinders: number, order: number): number {
  const freq = rpm/60 * cylinders/2 * order;
  return Math.sin(2*Math.PI*freq);
}

// CHASSIS FLEXIBILITY: torsional rigidity effect on handling
export function chassisFlexEffect(torsionalRigidity: number, cornerG: number, massKg: number): number {
  const twistAngle = massKg * cornerG * 9.81 * 1.5 / Math.max(1000, torsionalRigidity);
  return 1 - twistAngle * 0.5;
}

// ========================================================================
// CRASH SAFETY MODEL — Impact energy absorption
// ========================================================================
export interface CrashResult {
  peakDecelG: number; crushDistanceM: number; energyAbsorbedJ: number;
  survivalSpace: boolean; haicAngle: number; thoraxDeflection: number;
}
export function frontalCrash(impactSpeedMs: number, crushLengthM: number, massKg: number, structStrength: number): CrashResult {
  const energy = 0.5*massKg*impactSpeedMs*impactSpeedMs;
  const avgForce = energy/Math.max(0.1, crushLengthM);
  const peakDecel = avgForce*1.3/(massKg*GRAVITY);
  const crush = energy/structStrength;
  return {
    peakDecelG: Math.round(peakDecel*10)/10, crushDistanceM: Math.min(crushLengthM, crush),
    energyAbsorbedJ: energy, survivalSpace: crush<crushLengthM*0.9,
    haicAngle: Math.min(180, 90+peakDecel*5), thoraxDeflection: Math.min(75, peakDecel*8),
  };
}
export function sideCrash(impactSpeedMs: number, massKg: number, doorStrength: number): CrashResult {
  const energy = 0.5*massKg*impactSpeedMs*impactSpeedMs;
  const crush = energy/doorStrength;
  return { peakDecelG: Math.min(80, energy/(0.3*massKg*GRAVITY)), crushDistanceM: crush, energyAbsorbedJ: energy, survivalSpace: crush<0.3, haicAngle: 120, thoraxDeflection: Math.min(50, crush*100) };
}

// ========================================================================
// AERODYNAMIC DETAILED MODEL — Panel-by-panel drag breakdown
// ========================================================================
export interface AeroBreakdown {
  frontWingDrag: number; rearWingDrag: number; bodyDrag: number;
  underbodyDrag: number; wheelDrag: number; miscDrag: number;
  totalDrag: number; totalDownforce: number; efficiency: number;
}
export function aeroBreakdown(cdBase: number, area: number, clTotal: number, rho: number, vMs: number): AeroBreakdown {
  const qS = 0.5*rho*vMs*vMs*area;
  const fw = cdBase*0.22;
  const rw = cdBase*0.28;
  const body = cdBase*0.20;
  const under = cdBase*0.08;
  const wheel = cdBase*0.18;
  const misc = cdBase*0.04;
  const totalDrag = qS*cdBase;
  const totalDF = -qS*clTotal;
  return {
    frontWingDrag:qS*fw, rearWingDrag:qS*rw, bodyDrag:qS*body,
    underbodyDrag:qS*under, wheelDrag:qS*wheel, miscDrag:qS*misc,
    totalDrag, totalDownforce: totalDF, efficiency: Math.abs(clTotal/cdBase),
  };
}

// ========================================================================
// STANDING START MODEL — Launch from 0 km/h
// ========================================================================
export function standingStart(massKg: number, peakTorqueNm: number, gear1Ratio: number, finalDrive: number, mu: number, wr: number, clutchEff: number): { time0_100: number; time0_200: number; dist0_100: number } {
  const maxForce = mu*massKg*GRAVITY*clutchEff;
  const wheelTorque = peakTorqueNm*gear1Ratio*finalDrive*0.88/wr;
  const limitedForce = Math.min(maxForce, wheelTorque);
  const accel = limitedForce/massKg;
  const t100 = (100/3.6)/accel;
  const t200 = t100 + (200/3.6-100/3.6)/Math.max(1,accel*0.6);
  return {
    time0_100: Math.round(t100*100)/100,
    time0_200: Math.round(t200*100)/100,
    dist0_100: Math.round(0.5*accel*t100*t100),
  };
}

// ========================================================================
// CORNER SEVERITY RATING — Combines all factors
// ========================================================================
export function cornerSeverity(radiusM: number, approachSpeed: number, camber: number, elevation: number, trackWidth: number, surfaceGrip: number): { rating: string; score: number; factors: string[] } {
  const factors: string[] = [];
  let score = 0;
  if(radiusM < 30) { score += 30; factors.push("Very tight radius"); }
  else if(radiusM < 60) { score += 20; factors.push("Tight radius"); }
  else if(radiusM < 100) { score += 10; factors.push("Medium radius"); }
  if(approachSpeed > 280) { score += 25; factors.push("Very high approach speed"); }
  else if(approachSpeed > 200) { score += 15; factors.push("High approach speed"); }
  if(Math.abs(camber) > 5) { score += 10; factors.push("Significant camber"); }
  if(Math.abs(elevation) > 20) { score += 10; factors.push("Large elevation change"); }
  if(trackWidth < 10) { score += 10; factors.push("Narrow track"); }
  if(surfaceGrip < 0.9) { score += 5; factors.push("Low grip surface"); }
  const rating = score > 60 ? "EXTREME" : score > 40 ? "HIGH" : score > 20 ? "MEDIUM" : "LOW";
  return { rating, score: Math.min(100, score), factors };
}

// ========================================================================
// TRACK COMPARISON — Compare two tracks for same car
// ========================================================================
export function compareTracks(lapTimeA: number, lapTimeB: number, powerA: number, powerB: number, downforceA: number, downforceB: number): { timeDelta: number; speedDelta: number; aeroDelta: number; verdict: string } {
  const td = lapTimeA - lapTimeB;
  const sd = (powerA-powerB)/1000;
  const ad = (downforceA-downforceB)/1000;
  return {
    timeDelta: Math.round(td*1000)/1000,
    speedDelta: Math.round(sd*10)/10,
    aeroDelta: Math.round(ad*10)/10,
    verdict: td>0?"Track B is faster":"Track A is faster",
  };
}

// ========================================================================
// TELEMETRY RECONSTRUCTION — From lap time to speed trace
// ========================================================================
export interface TelemetryPoint {
  distM: number; timeS: number; speedKmh: number;
  throttle: number; brake: number; gear: number; rpm: number;
  latG: number; longG: number; tireTemp: number[];
}
export function reconstructTelemetry(corners: {name:string;R:number;arcDeg:number;camDeg:number;appSpd:number}[], m: number, mu: number, dfN: number): TelemetryPoint[] {
  const trace: TelemetryPoint[] = [];
  let dist=0, time=0;
  for(const c of corners) {
    const apexSpd = maxCSimple(c.R, mu, m, dfN);
    const br = brakingDistance(c.appSpd, apexSpd, mu, m, dfN);
    const arc = (c.arcDeg/360)*2*Math.PI*c.R;
    // Braking points
    const brSteps = 5;
    for(let i=0;i<brSteps;i++) {
      const frac = i/brSteps;
      const spd = c.appSpd - (c.appSpd-apexSpd*1.05)*frac;
      trace.push({ distM:dist, timeS:time, speedKmh:spd, throttle:0, brake:1-frac, gear:Math.ceil(spd/55),
        rpm:spd/55*3500+3000, latG:0, longG:-br.decelG*(1-frac), tireTemp:[90,90,85,85] });
      dist += br.distM/brSteps;
      time += (br.distM/brSteps)/((spd+apexSpd*1.05)/2/3.6);
    }
    // Cornering points
    const cSteps = 8;
    for(let i=0;i<cSteps;i++) {
      const frac = i/cSteps;
      const spd = apexSpd * (1.05 - 0.1*Math.sin(frac*Math.PI));
      const latG = Math.pow(spd/3.6,2)/(c.R*GRAVITY);
      trace.push({ distM:dist, timeS:time, speedKmh:spd, throttle:0.3+0.4*Math.sin(frac*Math.PI), brake:0, gear:Math.ceil(spd/55),
        rpm:spd/55*3500+3000, latG, longG:0, tireTemp:[95,95,90,90] });
      dist += arc/cSteps;
      time += (arc/cSteps)/(spd/3.6);
    }
  }
  return trace;
}

// ========================================================================
// SECTOR TIMING — Break lap into 3 sectors
// ========================================================================
export function sectorTimes(telemetry: TelemetryPoint[], totalDist: number): { s1: number; s2: number; s3: number } {
  const s1End = totalDist/3;
  const s2End = totalDist*2/3;
  let s1=0, s2=0, s3=0;
  for(let i=1;i<telemetry.length;i++) {
    const dt = telemetry[i].timeS-telemetry[i-1].timeS;
    if(telemetry[i].distM<=s1End) s1+=dt;
    else if(telemetry[i].distM<=s2End) s2+=dt;
    else s3+=dt;
  }
  return { s1:Math.round(s1*1000)/1000, s2:Math.round(s2*1000)/1000, s3:Math.round(s3*1000)/1000 };
}

// ========================================================================
// REAL-WORLD CAR BENCHMARK DATABASE
// ========================================================================
export interface CarBenchmark {
  name: string; class: string; powerW: number; torqueNm: number;
  massKg: number; downforceN: number; cd: number; cl: number; area: number;
  muDry: number; gearCount: number;
}
export const CAR_DATABASE: CarBenchmark[] = [
  // F1 2024
  { name:"Red Bull RB20", class:"F1", powerW:755000, torqueNm:400, massKg:798, downforceN:32000, cd:0.95, cl:-4.5, area:1.5, muDry:1.85, gearCount:8 },
  { name:"McLaren MCL38", class:"F1", powerW:755000, torqueNm:400, massKg:798, downforceN:31000, cd:0.98, cl:-4.3, area:1.5, muDry:1.83, gearCount:8 },
  { name:"Ferrari SF-24", class:"F1", powerW:755000, torqueNm:400, massKg:798, downforceN:30500, cd:1.0, cl:-4.2, area:1.5, muDry:1.82, gearCount:8 },
  { name:"Mercedes W15", class:"F1", powerW:755000, torqueNm:400, massKg:798, downforceN:29500, cd:1.02, cl:-4.1, area:1.5, muDry:1.80, gearCount:8 },
  // GT3
  { name:"Porsche 992 GT3 R", class:"GT3", powerW:404000, torqueNm:530, massKg:1260, downforceN:12000, cd:1.2, cl:-3.5, area:2.0, muDry:1.65, gearCount:6 },
  { name:"Ferrari 296 GT3", class:"GT3", powerW:447000, torqueNm:550, massKg:1260, downforceN:11500, cd:1.18, cl:-3.4, area:2.0, muDry:1.63, gearCount:6 },
  { name:"McLaren 720S GT3", class:"GT3", powerW:418000, torqueNm:520, massKg:1260, downforceN:11000, cd:1.15, cl:-3.3, area:2.0, muDry:1.62, gearCount:6 },
  { name:"BMW M4 GT3", class:"GT3", powerW:404000, torqueNm:550, massKg:1270, downforceN:10800, cd:1.22, cl:-3.2, area:2.0, muDry:1.60, gearCount:6 },
  { name:"Mercedes AMG GT3", class:"GT3", powerW:430000, torqueNm:540, massKg:1280, downforceN:10500, cd:1.20, cl:-3.1, area:2.0, muDry:1.58, gearCount:6 },
  // Hypercar
  { name:"Porsche 963", class:"LMDh", powerW:500000, torqueNm:500, massKg:1030, downforceN:15000, cd:1.0, cl:-4.0, area:1.8, muDry:1.70, gearCount:6 },
  { name:"Toyota GR010", class:"LMH", powerW:500000, torqueNm:500, massKg:1040, downforceN:14500, cd:1.02, cl:-3.8, area:1.8, muDry:1.68, gearCount:6 },
  { name:"Ferrari 499P", class:"LMH", powerW:500000, torqueNm:500, massKg:1030, downforceN:14000, cd:1.0, cl:-3.7, area:1.8, muDry:1.67, gearCount:6 },
  // Road cars
  { name:"Porsche 911 GT3 RS", class:"Road", powerW:416000, torqueNm:465, massKg:1450, downforceN:800, cd:0.34, cl:-0.4, area:2.1, muDry:1.35, gearCount:7 },
  { name:"McLaren 750S", class:"Road", powerW:560000, torqueNm:800, massKg:1389, downforceN:600, cd:0.32, cl:-0.3, area:2.0, muDry:1.30, gearCount:8 },
  { name:"Lamborghini Revuelto", class:"Road", powerW:747000, torqueNm:725, massKg:1772, downforceN:500, cd:0.35, cl:-0.25, area:2.1, muDry:1.28, gearCount:8 },
];
