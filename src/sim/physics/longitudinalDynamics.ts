// ===================================================================
// LONGITUDINAL DYNAMICS — Acceleration & braking with F=ma
// ===================================================================
// Phase 2: Newton's second law for straights. Includes drag, rolling
// resistance, gradient force, traction limiting, and rotating inertia.

import type { TorqueCurvePoint } from './enginePhysics';
import { totalTorqueAtRpm } from './enginePhysics';
import type { TransmissionState } from './transmissionPhysics';
import { rpmFromSpeed, drivingForce, selectGear, speedFromRpm } from './transmissionPhysics';
import type { AeroForces } from './aeroPhysics';
import { calculateAeroForces, type AeroPhysicsConfig } from './aeroPhysics';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface StraightParams {
  length: number;                // metres
  entrySpeed: number;            // km/h
  maxExitSpeed: number;          // km/h (limited by next corner)
  gradient: number;              // radians (positive = uphill)
  airDensity: number;            // kg/m³
  vehicle: VehiclePhysics;
  engine: EnginePhysicsParams;
  trans: TransmissionState;
  aeroConfig: AeroPhysicsConfig;
  tyreGrip: number;              // effective μ on driven axle
  drsActive: boolean;
}

export interface VehiclePhysics {
  mass: number;                  // kg (including fuel)
  weightDistFront: number;       // 0-1
  cgHeight: number;              // metres
  wheelbase: number;             // metres
  rollingResistanceCoeff: number;// Crr (~0.010-0.015)
}

export interface EnginePhysicsParams {
  torqueCurve: TorqueCurvePoint[];
  redline: number;
  hybridBoostTorque: number;
  hybridBoostMaxRpm: number;
  rotationalInertia: number;     // kg·m²
}

export interface StraightResult {
  time: number;                  // seconds
  exitSpeed: number;             // km/h
  peakSpeed: number;             // km/h achieved
  distance: number;              // metres covered
  gearChanges: number;
  finalGear: number;
  avgThrottle: number;           // 0-1 (for telemetry)
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const GRAVITY = 9.81;
const DT = 0.01;  // 10ms simulation timestep (100 Hz)

// Effective mass multiplier accounting for rotational inertia
// Wheels + driveshaft + flywheel add ~5-8% effective mass
function effectiveMass(mass: number, rotInertia: number, wheelRadiusM: number): number {
  // I_wheels ≈ 4 × 0.8 kg·m² (typical)
  const wheelInertia = 4 * 0.8;
  const totalRotInertia = rotInertia + wheelInertia;
  return mass + totalRotInertia / (wheelRadiusM * wheelRadiusM);
}

// ---------------------------------------------------------------------------
// Core: simulate a straight segment
// ---------------------------------------------------------------------------

export function simulateStraight(params: StraightParams): StraightResult {
  const { length, entrySpeed, maxExitSpeed, gradient, airDensity, vehicle, engine, trans, aeroConfig, tyreGrip, drsActive } = params;

  let speed = entrySpeed / 3.6; // convert to m/s
  const maxSpeed = maxExitSpeed / 3.6;
  let distance = 0;
  let time = 0;
  let peakSpeed = speed;
  let gearChanges = 0;
  let totalThrottle = 0;
  let steps = 0;

  const mEff = effectiveMass(vehicle.mass, engine.rotationalInertia, trans.wheelRadiusM);

  let currentGear = selectGear(speed * 3.6, trans, engine.redline, engine.torqueCurve);

  // Safety: prevent infinite loop
  const maxSteps = Math.ceil(length / (0.1 * DT)) + 50000;

  while (distance < length && steps < maxSteps) {
    const speedKmh = speed * 3.6;

    // 1. Determine if we need to brake for end-of-straight speed limit
    const remainingDist = length - distance;
    const brakingDistNeeded = speed > maxSpeed
      ? (speed * speed - maxSpeed * maxSpeed) / (2 * tyreGrip * GRAVITY)
      : 0;

    let throttle = 1.0;
    let braking = false;

    if (brakingDistNeeded >= remainingDist && speed > maxSpeed) {
      // We need to brake
      throttle = 0;
      braking = true;
    }

    // 2. Select gear
    const newGear = selectGear(speedKmh, trans, engine.redline, engine.torqueCurve);
    if (newGear !== currentGear) {
      gearChanges++;
      currentGear = newGear;
    }

    // 3. Calculate forces
    const rpm = rpmFromSpeed(speedKmh, currentGear, trans);
    const aero = calculateAeroForces(speedKmh, aeroConfig, airDensity, drsActive);

    // Driving force (or 0 if braking/coasting)
    let Fdrive = 0;
    if (!braking && throttle > 0) {
      const engineTorque = totalTorqueAtRpm(engine.torqueCurve, rpm, engine.hybridBoostTorque, engine.hybridBoostMaxRpm);
      Fdrive = drivingForce(engineTorque * throttle, currentGear, trans);

      // Traction limit on driven axle
      const normalForceDriven = drivenAxleNormalForce(vehicle, aero, trans.driveType);
      const maxTraction = tyreGrip * normalForceDriven;
      if (Fdrive > maxTraction) {
        Fdrive = maxTraction; // wheel spin limit
        throttle = maxTraction / Math.max(Fdrive, 1);
      }
    }

    // Drag force
    const Fdrag = aero.dragForce;

    // Rolling resistance
    const Froll = vehicle.rollingResistanceCoeff * vehicle.mass * GRAVITY * Math.cos(gradient);

    // Gradient force
    const Fgrade = vehicle.mass * GRAVITY * Math.sin(gradient);

    // Braking force
    let Fbrake = 0;
    if (braking) {
      Fbrake = tyreGrip * vehicle.mass * GRAVITY * 0.95; // ~95% of grip limit
    }

    // 4. Net force and acceleration: F = ma
    const Fnet = Fdrive - Fdrag - Froll - Fgrade - Fbrake;
    const accel = Fnet / mEff;

    // 5. Integrate (Euler method)
    speed += accel * DT;
    speed = Math.max(speed, 1); // don't go negative
    if (speed > peakSpeed) peakSpeed = speed;

    distance += speed * DT;
    time += DT;
    totalThrottle += throttle;
    steps++;
  }

  return {
    time: Math.round(time * 10000) / 10000,
    exitSpeed: Math.round(Math.min(speed * 3.6, maxExitSpeed) * 10) / 10,
    peakSpeed: Math.round(peakSpeed * 3.6 * 10) / 10,
    distance: Math.round(distance * 10) / 10,
    gearChanges,
    finalGear: currentGear,
    avgThrottle: steps > 0 ? Math.round((totalThrottle / steps) * 100) / 100 : 1,
  };
}

// ---------------------------------------------------------------------------
// Normal force on driven axle (accounting for aero)
// ---------------------------------------------------------------------------

function drivenAxleNormalForce(
  vehicle: VehiclePhysics,
  aero: AeroForces,
  driveType: 'fwd' | 'rwd' | 'awd',
): number {
  const totalWeight = vehicle.mass * GRAVITY;
  const frontWeight = totalWeight * vehicle.weightDistFront + aero.frontDownforce;
  const rearWeight = totalWeight * (1 - vehicle.weightDistFront) + aero.rearDownforce;

  switch (driveType) {
    case 'fwd': return frontWeight;
    case 'rwd': return rearWeight;
    case 'awd': return frontWeight + rearWeight;
  }
}

// ---------------------------------------------------------------------------
// 0-100 and 0-200 acceleration simulation
// ---------------------------------------------------------------------------

export interface AccelerationResult {
  time0_100: number;             // seconds
  time0_200: number;             // seconds
  time100_200: number;           // seconds
  quarterMileTime: number;       // seconds
  quarterMileSpeed: number;      // km/h trap speed
}

export function simulateAcceleration(
  vehicle: VehiclePhysics,
  engine: EnginePhysicsParams,
  trans: TransmissionState,
  aeroConfig: AeroPhysicsConfig,
  tyreGrip: number,
  airDensity: number = 1.225,
): AccelerationResult {
  let speed = 0.001; // m/s (just above zero)
  let distance = 0;
  let time = 0;

  let time0_100 = 0;
  let time0_200 = 0;
  let quarterMileTime = 0;
  let quarterMileSpeed = 0;
  let hit100 = false, hit200 = false, hitQM = false;

  const mEff = effectiveMass(vehicle.mass, engine.rotationalInertia, trans.wheelRadiusM);
  const maxSteps = 200000;

  for (let step = 0; step < maxSteps; step++) {
    const speedKmh = speed * 3.6;
    const gear = selectGear(speedKmh, trans, engine.redline, engine.torqueCurve);
    const rpm = rpmFromSpeed(speedKmh, gear, trans);
    const engineTorque = totalTorqueAtRpm(engine.torqueCurve, rpm, engine.hybridBoostTorque, engine.hybridBoostMaxRpm);

    const Fdrive = drivingForce(engineTorque, gear, trans);
    const aero = calculateAeroForces(speedKmh, aeroConfig, airDensity, false);

    // Traction limit
    const normalForceDriven = drivenAxleNormalForce(vehicle, aero, trans.driveType);
    const maxTraction = tyreGrip * normalForceDriven;
    const effectiveDrive = Math.min(Fdrive, maxTraction);

    const Fdrag = aero.dragForce;
    const Froll = vehicle.rollingResistanceCoeff * vehicle.mass * GRAVITY;

    const Fnet = effectiveDrive - Fdrag - Froll;
    const accel = Fnet / mEff;

    if (accel <= 0.01) break; // can't accelerate further (hit top speed)

    speed += accel * DT;
    distance += speed * DT;
    time += DT;

    if (!hit100 && speed * 3.6 >= 100) { time0_100 = time; hit100 = true; }
    if (!hit200 && speed * 3.6 >= 200) { time0_200 = time; hit200 = true; }
    if (!hitQM && distance >= 402.336) { quarterMileTime = time; quarterMileSpeed = speed * 3.6; hitQM = true; }

    // Stop if we've gathered all data or exceeded 60 seconds
    if (hit100 && hit200 && hitQM) break;
    if (time > 60) break;
  }

  return {
    time0_100: Math.round(time0_100 * 100) / 100,
    time0_200: Math.round(time0_200 * 100) / 100 || 0,
    time100_200: Math.round((time0_200 - time0_100) * 100) / 100 || 0,
    quarterMileTime: Math.round(quarterMileTime * 100) / 100,
    quarterMileSpeed: Math.round(quarterMileSpeed * 10) / 10,
  };
}
