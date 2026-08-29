// Lap Time Corner-by-Corner Solver
// Pacejka tire model, friction ellipse, aero coupling, weight transfer
import { CircuitData, CornerData } from "./circuitDatabaseComplete";

export interface CarProfile {
  power: number; weight: number; downforceCoeff: number;
  dragCoeff: number; frontalArea: number; brakeForce: number;
  tireMu: number; tireMuWet: number; gearRatios: number[];
  finalDrive: number; tireRadius: number;
}

export interface CornerResult {
  cornerId: string; cornerName: string;
  entrySpeed: number; apexSpeed: number; exitSpeed: number;
  brakingDistance: number; brakingTime: number; cornerTime: number;
  lateralG: number; tireLoadFL: number; tireLoadFR: number;
  tireLoadRL: number; tireLoadRR: number;
  downforce: number; dragForce: number; brakingEnergy: number;
  tyreTemp: number; cornerEntryGear: number; cornerExitGear: number;
  trailBrakePressure: number; optimalThrottlePoint: number;
}

export interface LapTimeResult {
  circuitId: string; lapTime: number;
  sectorTimes: [number, number, number];
  cornerResults: CornerResult[];
  topSpeed: number; avgSpeed: number;
  maxLateralG: number; maxBrakingG: number;
  fuelConsumption: number; tyreDegradation: number;
  totalBrakingEnergy: number; totalDistance: number;
}

const G = 9.81;
const RHO = 1.225;

function pacejka(a: number, Fz: number, B: number, C: number, D: number, E: number): number {
  const x = B * a;
  return Fz * D * Math.sin(C * Math.atan(x - E * (x - Math.atan(x))));
}

function frictionEllipse(Fx: number, Fy: number, mu: number, Fz: number): [number, number] {
  const Fmax = mu * Fz;
  const Fmag = Math.sqrt(Fx*Fx + Fy*Fy);
  if (Fmag <= Fmax) return [Fx, Fy];
  const s = Fmax / Fmag;
  return [Fx*s, Fy*s];
}

function maxCornerSpeed(r: number, mu: number, df: number, m: number): number {
  return Math.sqrt(mu * (G + df/m) * r);
}

function brakeDist(v1: number, v2: number, mu: number, dff: number): number {
  return (v1*v1 - v2*v2) / (2 * mu * (1 + dff*0.3) * G);
}

function brakeTime(v1: number, v2: number, mu: number, dff: number): number {
  return (v1 - v2) / (mu * (1 + dff*0.3) * G);
}

function accelAtSpeed(pw: number, m: number, v: number, cd: number, a: number): number {
  const drag = 0.5 * RHO * v * v * cd * a;
  const ef = v > 0.5 ? pw / v : pw / 0.5;
  return (ef - drag) / m;
}

function bestGear(v: number, gr: number[], fd: number, tr: number): number {
  let bg = 0, br = 0;
  for (let g = 0; g < gr.length; g++) {
    const rpm = (v * gr[g] * fd * 60) / (2 * Math.PI * tr);
    if (rpm > 2000 && rpm < 12000 && rpm > br) { br = rpm; bg = g; }
  }
  return bg;
}

function tireTemp(lg: number, ct: number, dt: number): number {
  return ct + (lg*lg*50 - (ct-30)*0.05) * dt;
}

function solveCorner(c: CornerData, entry: number, car: CarProfile, grip: number): CornerResult {
  const mu = car.tireMu * grip;
  const m = car.weight;
  const eDF = 0.5*RHO*entry*entry*car.downforceCoeff*car.frontalArea;
  let lo = 20, hi = entry;
  for (let i = 0; i < 30; i++) {
    const mid = (lo+hi)/2;
    const mDF = 0.5*RHO*mid*mid*car.downforceCoeff*car.frontalArea;
    if (maxCornerSpeed(c.radius, mu, mDF, m) > mid) lo = mid; else hi = mid;
  }
  const apex = (lo+hi)/2;
  const aDF = 0.5*RHO*apex*apex*car.downforceCoeff*car.frontalArea;
  const avgDF = (eDF+aDF)/2/m;
  const bd = brakeDist(entry, apex, mu, avgDF/G);
  const bt = brakeTime(entry, apex, mu, avgDF/G);
  let exit = apex;
  const ed = c.accelerationDistance;
  for (let d = 0; d < ed; d += 0.5) {
    const acc = accelAtSpeed(car.power, m, exit, car.dragCoeff, car.frontalArea);
    const vn = Math.sqrt(Math.max(exit*exit + 2*acc*0.5, 0));
    const df2 = 0.5*RHO*vn*vn*car.downforceCoeff*car.frontalArea;
    exit = Math.min(vn, maxCornerSpeed(c.radius, mu, df2, m));
  }
  const lg = apex*apex/(c.radius*G);
  const tl = m*G + aDF;
  const lt = m*lg*G*0.30/1.80;
  const bt2 = m*(entry-apex)/Math.max(bt,0.01)*0.35/3.10;
  const ct = (c.radius*2*Math.PI)*(apex<80?0.25:0.15);
  const cTime = bt + ct/Math.max(apex,1);
  const tb = Math.min(entry/apex*0.3, 0.9);
  const ot = Math.max(0, Math.min(1, 1-tb));
  const be = 0.5*m*(entry*entry - apex*apex);
  const tt = tireTemp(lg, 80, cTime);
  return {
    cornerId: c.id, cornerName: c.name, entrySpeed: entry, apexSpeed: apex, exitSpeed: exit,
    brakingDistance: bd, brakingTime: bt, cornerTime: cTime, lateralG: lg,
    tireLoadFL: Math.max(tl*0.25-lt/2-bt2/2,0), tireLoadFR: Math.max(tl*0.25+lt/2-bt2/2,0),
    tireLoadRL: Math.max(tl*0.25-lt/2+bt2/2,0), tireLoadRR: Math.max(tl*0.25+lt/2+bt2/2,0),
    downforce: aDF, dragForce: 0.5*RHO*apex*apex*car.dragCoeff*car.frontalArea,
    brakingEnergy: be, tyreTemp: tt,
    cornerEntryGear: bestGear(entry, car.gearRatios, car.finalDrive, car.tireRadius),
    cornerExitGear: bestGear(exit, car.gearRatios, car.finalDrive, car.tireRadius),
    trailBrakePressure: tb, optimalThrottlePoint: ot,
  };
}

export function solveLapTime(circuit: CircuitData, car: CarProfile, grip = 1.0): LapTimeResult {
  const cr: CornerResult[] = [];
  let tt = 0, td = 0, tbe = 0, tdeg = 0, tf = 0, mlG = 0, mbG = 0;
  let cs = car.power/car.weight*3.6*0.6, cg = 3, temp = 80;
  const sc: CornerData[][] = [[], [], []];
  const th = Math.ceil(circuit.allCorners.length/3);
  circuit.allCorners.forEach((c, i) => { sc[i<th?0:i<2*th?1:2].push(c); });
  const st: [number, number, number] = [0, 0, 0];
  for (let s = 0; s < 3; s++) {
    let sct = 0;
    for (const c of sc[s]) {
      const r = solveCorner(c, cs, car, grip);
      cr.push(r); sct += r.cornerTime; tbe += r.brakingEnergy;
      td += r.brakingDistance + c.accelerationDistance;
      if (r.lateralG > mlG) mlG = r.lateralG;
      const bg = (r.entrySpeed-r.apexSpeed)/Math.max(r.brakingTime,0.01)/G;
      if (bg > mbG) mbG = bg;
      cs = r.exitSpeed; cg = r.cornerExitGear; temp = r.tyreTemp;
      tdeg += Math.max(0, (temp-80)*0.001);
      tf += car.power*r.cornerTime/42000000*850;
    }
    st[s] = sct; tt += sct;
  }
  return {
    circuitId: circuit.id, lapTime: tt, sectorTimes: st, cornerResults: cr,
    topSpeed: Math.max(...cr.map(r=>r.entrySpeed),0),
    avgSpeed: td/Math.max(tt,0.1)*3.6,
    maxLateralG: mlG, maxBrakingG: mbG,
    fuelConsumption: tf, tyreDegradation: tdeg,
    totalBrakingEnergy: tbe, totalDistance: td,
  };
}

export const F1_CAR: CarProfile = { power:750000, weight:798, downforceCoeff:4.5, dragCoeff:1.0, frontalArea:1.8, brakeForce:65000, tireMu:1.7, tireMuWet:1.1, gearRatios:[3.2,2.6,2.1,1.7,1.4,1.15,0.95,0.82], finalDrive:3.5, tireRadius:0.33 };
export const GT3_CAR: CarProfile = { power:420000, weight:1300, downforceCoeff:2.5, dragCoeff:0.35, frontalArea:2.1, brakeForce:55000, tireMu:1.4, tireMuWet:0.95, gearRatios:[3.5,2.8,2.2,1.8,1.5,1.2,1.0], finalDrive:3.2, tireRadius:0.33 };
export const HYPERCAR: CarProfile = { power:700000, weight:1100, downforceCoeff:3.8, dragCoeff:0.28, frontalArea:2.0, brakeForce:60000, tireMu:1.6, tireMuWet:1.05, gearRatios:[3.0,2.4,1.9,1.55,1.3,1.1,0.92,0.8], finalDrive:3.3, tireRadius:0.33 };
export const ROAD_CAR: CarProfile = { power:200000, weight:1500, downforceCoeff:0.5, dragCoeff:0.30, frontalArea:2.2, brakeForce:35000, tireMu:1.1, tireMuWet:0.7, gearRatios:[3.8,2.4,1.6,1.2,0.9,0.75], finalDrive:3.5, tireRadius:0.33 };
