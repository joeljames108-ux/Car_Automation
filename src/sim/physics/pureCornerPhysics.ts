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
