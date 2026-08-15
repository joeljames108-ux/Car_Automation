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

// ---------------------------------------------------------------------------
// Advanced Transmission Physics Modules
// ---------------------------------------------------------------------------

/**
 * 1. MULTI-PLATE WET CLUTCH & TORQUE CONVERTER THERMAL DYNAMICS
 */
export interface ClutchThermalState {
  clutchTempC: number;
  slipEnergyJoules: number;
  isGlazed: boolean;
  frictionCoeff: number;
  torqueCapacityNm: number;
}

export function evaluateClutchSlip(
  engineTorqueNm: number,
  deltaOmegaRadS: number, // Speed delta between flywheel and transmission input shaft (rad/s)
  slipDurationSec: number,
  clutchType: 'organic' | 'cerametallic' | 'carbon_carbon' | 'wet_multiplate',
  currentTempC: number = 65,
): ClutchThermalState {
  const clutchSpecs = {
    organic: { baseMu: 0.35, maxTempC: 280, heatCapacityJperKgC: 460, massKg: 3.2, nominalAreaM2: 0.045 },
    cerametallic: { baseMu: 0.42, maxTempC: 450, heatCapacityJperKgC: 490, massKg: 2.8, nominalAreaM2: 0.042 },
    carbon_carbon: { baseMu: 0.48, maxTempC: 850, heatCapacityJperKgC: 710, massKg: 1.9, nominalAreaM2: 0.038 },
    wet_multiplate: { baseMu: 0.14, maxTempC: 220, heatCapacityJperKgC: 520, massKg: 4.5, nominalAreaM2: 0.095 },
  }[clutchType];

  // Slip Energy: E = Torque * deltaOmega * duration (Joules)
  const slipEnergyJoules = Math.abs(engineTorqueNm * deltaOmegaRadS * slipDurationSec * 0.5);

  // Thermal Rise: deltaT = Energy / (mass * c_p)
  const deltaTempC = slipEnergyJoules / (clutchSpecs.massKg * clutchSpecs.heatCapacityJperKgC);
  const newTempC = currentTempC + deltaTempC;

  // Thermal Fading: mu degrades exponentially past threshold
  let frictionCoeff = clutchSpecs.baseMu;
  if (newTempC > clutchSpecs.maxTempC) {
    const overheatDelta = newTempC - clutchSpecs.maxTempC;
    frictionCoeff *= Math.max(0.25, Math.exp(-overheatDelta / 80));
  } else if (newTempC < 100 && clutchType === 'carbon_carbon') {
    // Carbon-carbon requires heat to generate full friction
    frictionCoeff *= 0.65 + 0.35 * (newTempC / 100);
  }

  const isGlazed = newTempC > clutchSpecs.maxTempC * 1.15;
  const clampingForceN = 12500; // 12.5 kN diaphragm clamping force
  const meanRadiusM = 0.11; // 110mm mean friction radius
  const numFrictionPlates = clutchType === 'wet_multiplate' ? 12 : 2;

  // Torque Capacity: T = n * mu * F_clamp * r_mean
  const torqueCapacityNm = numFrictionPlates * frictionCoeff * clampingForceN * meanRadiusM;

  return {
    clutchTempC: Math.round(newTempC * 10) / 10,
    slipEnergyJoules: Math.round(slipEnergyJoules),
    isGlazed,
    frictionCoeff: Math.round(frictionCoeff * 1000) / 1000,
    torqueCapacityNm: Math.round(torqueCapacityNm),
  };
}

/**
 * 2. SYNCHROMESH & DOG-RING SHIFT DYNAMICS WITH G-JERK INDEX
 */
export interface ShiftTransientResult {
  synchronizationTimeSec: number;
  shiftShockJerkGPerSec: number;
  dogEngagementSuccess: boolean;
  rpmDropRatio: number;
  targetRpm: number;
}

export function computeShiftTransient(
  fromGearRatio: number,
  toGearRatio: number,
  currentRpm: number,
  shiftForkForceN: number, // Typical hand force: 150-300 N; Sequential pneumatic: 800-1200 N
  isDogRing: boolean,
  vehicleMassKg: number = 1350,
): ShiftTransientResult {
  const rpmDropRatio = toGearRatio / fromGearRatio;
  const targetRpm = Math.round(currentRpm * rpmDropRatio);

  if (isDogRing) {
    // Dog-ring dog box shifts instantaneously once rev-matched within +/- 150 RPM window
    const syncTimeSec = 0.045 + Math.random() * 0.015; // ~45-60ms sequential shift
    // High G-jerk shock due to instantaneous dog tooth mesh
    const tractiveDeltaN = (toGearRatio - fromGearRatio) * 600;
    const accelDeltaG = Math.abs(tractiveDeltaN / (vehicleMassKg * 9.81));
    const shiftShockJerkGPerSec = accelDeltaG / syncTimeSec;

    return {
      synchronizationTimeSec: Math.round(syncTimeSec * 1000) / 1000,
      shiftShockJerkGPerSec: Math.round(shiftShockJerkGPerSec * 10) / 10,
      dogEngagementSuccess: true,
      rpmDropRatio: Math.round(rpmDropRatio * 1000) / 1000,
      targetRpm,
    };
  }

  // Synchromesh Cone Synchronization Time:
  // t_sync = (I_cluster * deltaOmega) / (mu_cone * F_fork * r_cone / sin(coneAngle))
  const coneAngleRad = (7.5 * Math.PI) / 180; // 7.5 deg taper
  const coneMu = 0.10;
  const rConeM = 0.038;
  const clusterInertiaKgM2 = 0.018; // Gear cluster rotational inertia
  const deltaOmega = (currentRpm - targetRpm) * (2 * Math.PI / 60);

  const synchroTorqueNm = (coneMu * shiftForkForceN * rConeM) / Math.sin(coneAngleRad);
  const syncTimeSec = Math.max(0.12, (clusterInertiaKgM2 * deltaOmega) / synchroTorqueNm);

  // Smooth synchro taper reduces shift shock jerk
  const tractiveDeltaN = (toGearRatio - fromGearRatio) * 450;
  const accelDeltaG = Math.abs(tractiveDeltaN / (vehicleMassKg * 9.81));
  const shiftShockJerkGPerSec = accelDeltaG / (syncTimeSec * 1.5);

  return {
    synchronizationTimeSec: Math.round(syncTimeSec * 1000) / 1000,
    shiftShockJerkGPerSec: Math.round(shiftShockJerkGPerSec * 10) / 10,
    dogEngagementSuccess: true,
    rpmDropRatio: Math.round(rpmDropRatio * 1000) / 1000,
    targetRpm,
  };
}

/**
 * 3. ELECTRONIC ACTIVE LIMITED SLIP DIFFERENTIAL (E-DIFF) & TORQUE VECTORING
 */
export interface EDiffTorqueDistribution {
  leftWheelTorqueNm: number;
  rightWheelTorqueNm: number;
  lockupPercentage: number;
  vectoringYawMomentNm: number;
}

export function calculateEDiffTorqueSplit(
  totalInputTorqueNm: number,
  steeringAngleDeg: number,
  lateralAccelG: number,
  yawRateErrorRadS: number, // Desired yaw rate vs actual yaw rate
  diffRampType: '1.0_way' | '1.5_way' | '2.0_way' | 'active_ediff',
  trackWidthM: number = 1.62,
): EDiffTorqueDistribution {
  let lockupPercentage = 0;

  if (diffRampType === 'active_ediff') {
    // E-Diff continuously vectors torque to correct understeer/oversteer
    const baseLock = Math.min(1.0, Math.abs(lateralAccelG) * 0.45);
    const yawCorrection = yawRateErrorRadS * 1.2;
    lockupPercentage = Math.max(0.05, Math.min(0.95, baseLock + Math.abs(yawCorrection)));

    // Active torque bias delta between outer and inner wheel
    const biasFactor = 0.5 + Math.sign(steeringAngleDeg) * (0.15 * Math.abs(lateralAccelG) + yawCorrection * 0.1);
    const clampedBias = Math.max(0.2, Math.min(0.8, biasFactor));

    const rightWheelTorqueNm = totalInputTorqueNm * clampedBias;
    const leftWheelTorqueNm = totalInputTorqueNm * (1 - clampedBias);
    const vectoringYawMomentNm = ((rightWheelTorqueNm - leftWheelTorqueNm) * (trackWidthM / 2)) / 0.33; // wheel radius 0.33m

    return {
      leftWheelTorqueNm: Math.round(leftWheelTorqueNm),
      rightWheelTorqueNm: Math.round(rightWheelTorqueNm),
      lockupPercentage: Math.round(lockupPercentage * 100),
      vectoringYawMomentNm: Math.round(vectoringYawMomentNm),
    };
  }

  // Mechanical Salisbury Clutch-Type LSD (1.0 / 1.5 / 2.0 Way)
  const isCoast = totalInputTorqueNm < 0;
  if (diffRampType === '1.0_way') {
    lockupPercentage = isCoast ? 0 : 0.45;
  } else if (diffRampType === '1.5_way') {
    lockupPercentage = isCoast ? 0.25 : 0.60;
  } else {
    // 2.0-way lockup equal on accel and decel (motorsport drift / circuit)
    lockupPercentage = 0.70;
  }

  const splitHalf = totalInputTorqueNm * 0.5;
  const transfer = splitHalf * lockupPercentage * (Math.abs(steeringAngleDeg) / 45);
  const outerMultiplier = steeringAngleDeg >= 0 ? 1 : -1;

  const rightWheelTorqueNm = splitHalf + transfer * outerMultiplier;
  const leftWheelTorqueNm = splitHalf - transfer * outerMultiplier;

  return {
    leftWheelTorqueNm: Math.round(leftWheelTorqueNm),
    rightWheelTorqueNm: Math.round(rightWheelTorqueNm),
    lockupPercentage: Math.round(lockupPercentage * 100),
    vectoringYawMomentNm: Math.round(((rightWheelTorqueNm - leftWheelTorqueNm) * trackWidthM) / 0.66),
  };
}

/**
 * 4. OPTIMAL GEAR RATIO PROGRESSION & TOP SPEED EQUILIBRIUM
 */
export interface GearRatioStepAnalysis {
  gear: number;
  ratio: number;
  stepRatioToNext: number; // Ratio step (r_k / r_{k+1})
  maxSpeedKmh: number;
  engineRpmDropOnUpshift: number;
}

export function analyzeGearRatioProgression(
  ratios: number[],
  finalDrive: number,
  redlineRpm: number,
  wheelRadiusM: number = 0.33,
): GearRatioStepAnalysis[] {
  return ratios.map((ratio, idx) => {
    const nextRatio = ratios[idx + 1];
    const stepRatioToNext = nextRatio ? Math.round((ratio / nextRatio) * 1000) / 1000 : 1.0;
    const maxSpeedKmh = Math.round(((redlineRpm * 2 * Math.PI * wheelRadiusM * 3.6) / (ratio * finalDrive * 60)) * 10) / 10;
    const engineRpmDropOnUpshift = nextRatio ? Math.round(redlineRpm * (1 - nextRatio / ratio)) : 0;

    return {
      gear: idx + 1,
      ratio,
      stepRatioToNext,
      maxSpeedKmh,
      engineRpmDropOnUpshift,
    };
  });
}

