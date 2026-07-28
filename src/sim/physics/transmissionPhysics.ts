// ===================================================================
// TRANSMISSION PHYSICS — Gearbox, ratios, differential, shift dynamics
// ===================================================================
// Phase 1: Gear ratio calculation, shift time penalty, drivetrain losses,
// differential model, and optimal shift point detection.

import type { VehicleConfig, TransmissionType } from '../types';
import { TRANSMISSION_TYPES } from '../constants';
import type { TorqueCurvePoint } from './enginePhysics';
import { torqueAtRpm } from './enginePhysics';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface GearRatio {
  gear: number;          // 1-indexed gear number
  ratio: number;         // gear ratio (e.g., 3.42)
  minSpeed: number;      // km/h at idle RPM in this gear
  maxSpeed: number;      // km/h at redline in this gear
}

export interface TransmissionState {
  gearRatios: GearRatio[];
  finalDrive: number;
  gearCount: number;
  shiftTime: number;         // seconds per shift
  drivetrainEfficiency: number; // 0-1 (power loss through drivetrain)
  driveType: 'fwd' | 'rwd' | 'awd';
  diffType: string;
  diffLockFactor: number;    // 0 = open, 1 = fully locked
  wheelRadiusM: number;      // metres
}

export interface ShiftPoint {
  fromGear: number;
  toGear: number;
  shiftRpm: number;          // RPM to upshift for maximum acceleration
  shiftSpeed: number;        // km/h at this shift point
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

// Drivetrain efficiency losses
const DRIVE_EFFICIENCY: Record<string, number> = {
  fwd: 0.88,
  rwd: 0.85,
  awd: 0.82,
};

// Differential lock factors by type
const DIFF_LOCK: Record<string, number> = {
  open: 0.0,       // no torque transfer
  lsd: 0.40,       // limited slip — transfers ~40% to gripped wheel
  torsen: 0.55,    // torsen — mechanical torque-biasing
  active: 0.80,    // electronically controlled — near full vectoring
  locked: 1.0,     // welded/locked — full torque transfer (drift/rally)
};

// Standard gear ratio spreads (these are typical and get scaled by finalDrive)
function generateGearRatios(gearCount: number, finalDrive: number): number[] {
  // Geometric progression: each gear ratio decreases by a constant factor
  // First gear: ~3.5-4.0, Last gear: ~0.7-0.9
  const first = 3.50 + (gearCount - 5) * 0.15; // more gears = taller first
  const last = gearCount <= 5 ? 0.85 : gearCount <= 7 ? 0.75 : 0.68;
  const ratios: number[] = [];
  
  if (gearCount <= 1) {
    // Single speed (EV)
    return [finalDrive > 0 ? 1.0 : 8.0];
  }

  const factor = Math.pow(last / first, 1 / (gearCount - 1));
  for (let i = 0; i < gearCount; i++) {
    ratios.push(Math.round(first * Math.pow(factor, i) * 1000) / 1000);
  }
  return ratios;
}

// ---------------------------------------------------------------------------
// Core: build transmission state from VehicleConfig
// ---------------------------------------------------------------------------

export function buildTransmissionState(
  vehicle: VehicleConfig,
  redline: number,
  idleRpm: number,
): TransmissionState {
  const trans = TRANSMISSION_TYPES[vehicle.transmission];
  const gearCount = vehicle.gearCount || trans.gearCount;
  const finalDrive = vehicle.finalDrive || 3.73;

  // Wheel radius from diameter (inches → metres) + tyre sidewall estimate
  const rimRadiusM = (vehicle.wheelDiameter * 0.0254) / 2;
  const tireAspect = 0.55 - (vehicle.wheelDiameter - 15) * 0.015; // lower profile with larger rims
  const tireWidthM = vehicle.wheelWidth * 0.0254;
  const sidewallM = tireWidthM * Math.max(0.25, tireAspect);
  const wheelRadiusM = rimRadiusM + sidewallM;

  const ratioValues = generateGearRatios(gearCount, finalDrive);

  // Speed at given RPM: v = (RPM × 2π × wheelRadius) / (gearRatio × finalDrive × 60)
  // in km/h: multiply by 3.6
  const gearRatios: GearRatio[] = ratioValues.map((ratio, i) => {
    const rpmToSpeed = (rpm: number) => (rpm * 2 * Math.PI * wheelRadiusM * 3.6) / (ratio * finalDrive * 60);
    return {
      gear: i + 1,
      ratio,
      minSpeed: Math.round(rpmToSpeed(idleRpm) * 10) / 10,
      maxSpeed: Math.round(rpmToSpeed(redline) * 10) / 10,
    };
  });

  const driveEff = DRIVE_EFFICIENCY[vehicle.driveType] ?? 0.85;
  // Transmission itself has an efficiency too
  const totalEff = driveEff * trans.efficiency;

  const diffLock = DIFF_LOCK[vehicle.diffType] ?? 0;
  // Diff preload adds base lock (for LSD types)
  const effectiveDiffLock = Math.min(1, diffLock + (vehicle.diffType === 'lsd' ? vehicle.diffPreload * 0.3 : 0));

  return {
    gearRatios,
    finalDrive,
    gearCount,
    shiftTime: trans.shiftTime,
    drivetrainEfficiency: Math.round(totalEff * 1000) / 1000,
    driveType: vehicle.driveType,
    diffType: vehicle.diffType,
    diffLockFactor: Math.round(effectiveDiffLock * 100) / 100,
    wheelRadiusM: Math.round(wheelRadiusM * 10000) / 10000,
  };
}

// ---------------------------------------------------------------------------
// Gear selection: find the gear that maximizes wheel torque at given speed
// ---------------------------------------------------------------------------

export function selectGear(
  speedKmh: number,
  trans: TransmissionState,
  redline: number,
  torqueCurve: TorqueCurvePoint[],
): number {
  let bestGear = 1;
  let bestWheelTorque = 0;

  for (const gr of trans.gearRatios) {
    // RPM at this speed in this gear
    const speedMs = speedKmh / 3.6;
    const rpm = (speedMs * gr.ratio * trans.finalDrive * 60) / (2 * Math.PI * trans.wheelRadiusM);

    // Skip if RPM is outside drivable range
    if (rpm < 1000 || rpm > redline) continue;

    const engineTorque = torqueAtRpm(torqueCurve, rpm);
    const wheelTorque = engineTorque * gr.ratio * trans.finalDrive * trans.drivetrainEfficiency;

    if (wheelTorque > bestWheelTorque) {
      bestWheelTorque = wheelTorque;
      bestGear = gr.gear;
    }
  }

  return bestGear;
}

// ---------------------------------------------------------------------------
// Calculate RPM from speed and gear
// ---------------------------------------------------------------------------

export function rpmFromSpeed(
  speedKmh: number,
  gear: number,
  trans: TransmissionState,
): number {
  const gr = trans.gearRatios[gear - 1];
  if (!gr) return 0;
  const speedMs = speedKmh / 3.6;
  return (speedMs * gr.ratio * trans.finalDrive * 60) / (2 * Math.PI * trans.wheelRadiusM);
}

export function speedFromRpm(
  rpm: number,
  gear: number,
  trans: TransmissionState,
): number {
  const gr = trans.gearRatios[gear - 1];
  if (!gr) return 0;
  return (rpm * 2 * Math.PI * trans.wheelRadiusM * 3.6) / (gr.ratio * trans.finalDrive * 60);
}

// ---------------------------------------------------------------------------
// Wheel torque at given speed and gear
// ---------------------------------------------------------------------------

export function wheelTorque(
  engineTorque: number,
  gear: number,
  trans: TransmissionState,
): number {
  const gr = trans.gearRatios[gear - 1];
  if (!gr) return 0;
  return engineTorque * gr.ratio * trans.finalDrive * trans.drivetrainEfficiency;
}

// ---------------------------------------------------------------------------
// Driving force at wheel contact patch
// ---------------------------------------------------------------------------

export function drivingForce(
  engineTorque: number,
  gear: number,
  trans: TransmissionState,
): number {
  return wheelTorque(engineTorque, gear, trans) / trans.wheelRadiusM;
}

// ---------------------------------------------------------------------------
// Optimal shift points (for acceleration runs)
// ---------------------------------------------------------------------------

export function calculateShiftPoints(
  trans: TransmissionState,
  torqueCurve: TorqueCurvePoint[],
  redline: number,
): ShiftPoint[] {
  const points: ShiftPoint[] = [];

  for (let g = 0; g < trans.gearRatios.length - 1; g++) {
    const currentGear = trans.gearRatios[g];
    const nextGear = trans.gearRatios[g + 1];

    // Find the RPM where the wheel force in current gear equals wheel force in next gear
    // (i.e., where upshifting gives more acceleration)
    let shiftRpm = redline; // default: shift at redline
    let shiftSpeed = currentGear.maxSpeed;

    for (let rpm = Math.round(redline * 0.7); rpm <= redline; rpm += 50) {
      const speedAtRpm = speedFromRpm(rpm, g + 1, trans);
      const rpmInNext = rpmFromSpeed(speedAtRpm, g + 2, trans);

      if (rpmInNext < 1000) continue;

      const forceCurrent = drivingForce(torqueAtRpm(torqueCurve, rpm), g + 1, trans);
      const forceNext = drivingForce(torqueAtRpm(torqueCurve, rpmInNext), g + 2, trans);

      if (forceNext >= forceCurrent) {
        shiftRpm = rpm;
        shiftSpeed = speedAtRpm;
        break;
      }
    }

    points.push({
      fromGear: g + 1,
      toGear: g + 2,
      shiftRpm: Math.round(shiftRpm),
      shiftSpeed: Math.round(shiftSpeed * 10) / 10,
    });
  }

  return points;
}

// ---------------------------------------------------------------------------
// Traction limit based on differential and drive type
// ---------------------------------------------------------------------------

/** Maximum driving force before wheel spin, accounting for diff type */
export function tractionLimit(
  normalForceOnDrivenAxle: number,   // N
  tyreGripCoeff: number,             // μ
  diffLockFactor: number,            // 0-1
  driveType: 'fwd' | 'rwd' | 'awd',
): number {
  // With an open diff, only the wheel with LESS grip limits traction
  // With locked diff, both wheels can contribute fully
  // In reality, weight transfer means inside wheel has less load
  // Open diff: effective force = μ × min(F_left, F_right) × 2
  // We model this as: F_max = μ × F_total × (0.5 + 0.5 × lockFactor)
  const lockEfficiency = 0.55 + 0.45 * diffLockFactor;
  const force = tyreGripCoeff * normalForceOnDrivenAxle * lockEfficiency;

  // AWD splits torque across both axles (more total grip available)
  if (driveType === 'awd') return force * 1.65; // ~65% more traction than single-axle

  return force;
}
