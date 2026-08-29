// ========================================================================
// SUSPENSION COMPLIANCE SOLVER — Elastokinematic model
// ========================================================================
// Bushing model: 6-DOF stiffness per suspension mount point
export interface Bushing {
  radialK: number; axialK: number; conicalK: number;
  damping: number; preload: number;
}
export interface SuspensionCorner {
  springRate: number; damperLowSpeed: number; damperHighSpeed: number;
  bumpStopRate: number; reboundStopRate: number;
  arbRate: number; pushRodMotionRatio: number;
  camberGain: number; toeGain: number;
  antiDivePct: number; antiSquatPct: number;
  rollCenterHeight: number; instantCenter: {x:number; y:number};
  upperWishbone: {inner:{x:number;y:number}; outer:{x:number;y:number}};
  lowerWishbone: {inner:{x:number;y:number}; outer:{x:number;y:number}};
  kingpinAngle: number; scrubRadius: number;
  casterAngle: number; trail: number;
  bumpSteerCurve: number[];
  rollSteerCurve: number[];
}

// Bump steer: toe change with ride height
export function bumpSteer(bumpMm: number, curve: number[]): number {
  const idx = (bumpMm+30)/60*(curve.length-1);
  const i = Math.max(0, Math.min(curve.length-2, Math.floor(idx)));
  const frac = idx-i;
  return curve[i]*(1-frac)+curve[i+1]*frac;
}

// Roll steer: toe change with body roll
export function rollSteer(rollDeg: number, curve: number[]): number {
  const idx = (rollDeg+5)/10*(curve.length-1);
  const i = Math.max(0, Math.min(curve.length-2, Math.floor(idx)));
  const frac = idx-i;
  return curve[i]*(1-frac)+curve[i+1]*frac;
}

// Elastokinematic compliance: lateral toe change under lateral load
export function latComplianceToe(latForceN: number, bushingK: number): number {
  const deflectionM = latForceN / Math.max(1, bushingK);
  return deflectionM * 180 / Math.PI / 0.5 * 1000;
}

// Dynamic roll center migration
export function rollCenterMigration(bumpMm: number, sc: SuspensionCorner): number {
  const upperMove = bumpMm * 0.3;
  const lowerMove = bumpMm * 0.05;
  return sc.rollCenterHeight + (upperMove - lowerMove) * 0.1;
}

// Effective spring rate at wheel (accounting for motion ratio)
export function wheelSpringRate(springRate: number, motionRatio: number): number {
  return springRate * motionRatio * motionRatio;
}

// Damper force at given velocity
export function damperForce(velMs: number, lowSpeed: number, highSpeed: number, crossover: number = 0.05): number {
  const absVel = Math.abs(velMs);
  const rate = absVel < crossover ? lowSpeed : lowSpeed + (highSpeed-lowSpeed)*(absVel-crossover)/(0.3-crossover);
  return velMs * rate;
}

// Heave mode: front and rear natural frequencies
export function heaveFrequency(wf: number, wr: number, sf: number, sr: number): { fF: number; fR: number } {
  const fF = Math.sqrt(sf*1000/Math.max(1,wf))/(2*Math.PI);
  const fR = Math.sqrt(sr*1000/Math.max(1,wr))/(2*Math.PI);
  return { fF: Math.round(fF*100)/100, fR: Math.round(fR*100)/100 };
}

// Ride frequency vs handling frequency analysis
export function rideHandlingBalance(susF: SuspensionCorner, susR: SuspensionCorner, wf: number, wr: number): { rideFreq: number; handlingFreq: number; balance: string } {
  const rf = heaveFrequency(wf,wr,susF.springRate,susR.springRate);
  const rideFreq = (rf.fF+rf.fR)/2;
  const handlingFreq = Math.sqrt((susF.springRate+susR.springRate)*1000/(wf+wr))/(2*Math.PI);
  const balance = handlingFreq > rideFreq*1.5 ? "stiff" : handlingFreq < rideFreq*0.8 ? "soft" : "balanced";
  return { rideFreq, handlingFreq, balance };
}
