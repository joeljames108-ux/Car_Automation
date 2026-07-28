// ===================================================================
// BRAKE MODEL — Brake force, ABS, bias, fade, stopping distance
// ===================================================================
// Phase 7: Calculates braking forces with thermal fade, brake bias
// distribution, ABS efficiency, and stopping distances.

import type { BrakeType } from '../types';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface BrakePhysicsConfig {
  brakeType: BrakeType;
  discSizeMm: number;         // mm diameter
  pistonCount: number;         // 2, 4, 6, 8
  padCompound: number;         // 0-1 (0=eco, 1=racing)
  brakeBias: number;           // 0-1 (0=full rear, 1=full front)
  hasAbs: boolean;
  hasBrakeCooling: number;     // 0-1 (duct opening)
}

export interface BrakeState {
  temperature: number;         // °C (disc temperature)
  fadeLevel: number;           // 0-1 (0=no fade, 1=total fade)
}

export interface BrakeResult {
  maxBrakeForce: number;       // N total
  frontBrakeForce: number;     // N
  rearBrakeForce: number;      // N
  brakingG: number;            // G-force
  absActive: boolean;          // true if ABS limiting brake force
  fadePenalty: number;         // 0-1 reduction from fade
}

export interface StoppingResult {
  distance100_0: number;       // m from 100 km/h to 0
  distance60_0: number;        // m from 60 km/h to 0 (97→0)
  distance200_0: number;       // m from 200 km/h to 0
  avgDecelG: number;           // average deceleration in G
  peakDecelG: number;          // peak deceleration in G
}

// ---------------------------------------------------------------------------
// Brake type physics
// ---------------------------------------------------------------------------

interface BrakeTypePhysics {
  frictionCoeff: number;       // pad-to-disc μ
  fadeResistance: number;      // 0-1 (higher = less fade)
  maxTemp: number;             // °C before severe performance loss
  coolingRate: number;         // °C/s natural cooling rate
  weight: number;              // relative weight factor
}

const BRAKE_PHYSICS: Record<BrakeType, BrakeTypePhysics> = {
  drum:                { frictionCoeff: 0.30, fadeResistance: 0.25, maxTemp: 300,  coolingRate: 8,  weight: 0.85 },
  solid_disc:          { frictionCoeff: 0.38, fadeResistance: 0.35, maxTemp: 450,  coolingRate: 12, weight: 0.90 },
  cast_iron:           { frictionCoeff: 0.42, fadeResistance: 0.45, maxTemp: 550,  coolingRate: 15, weight: 1.00 },
  slotted_steel:       { frictionCoeff: 0.48, fadeResistance: 0.65, maxTemp: 650,  coolingRate: 20, weight: 0.95 },
  carbon_ceramic:      { frictionCoeff: 0.55, fadeResistance: 0.90, maxTemp: 900,  coolingRate: 25, weight: 0.65 },
  carbon_carbon:       { frictionCoeff: 0.60, fadeResistance: 0.98, maxTemp: 1100, coolingRate: 18, weight: 0.50 },
  regenerative_hybrid: { frictionCoeff: 0.50, fadeResistance: 0.80, maxTemp: 700,  coolingRate: 22, weight: 0.80 },
};

// ---------------------------------------------------------------------------
// Create initial brake state
// ---------------------------------------------------------------------------

export function createBrakeState(): BrakeState {
  return { temperature: 25, fadeLevel: 0 };
}

// ---------------------------------------------------------------------------
// Calculate braking force
// ---------------------------------------------------------------------------

export function calculateBrakeForce(
  config: BrakePhysicsConfig,
  state: BrakeState,
  mass: number,
  tyreGrip: number,           // effective μ
  speed: number,              // km/h
  hasAbs: boolean,
): BrakeResult {
  const bp = BRAKE_PHYSICS[config.brakeType];

  // Base brake force from caliper + disc + pad
  // F = μ_pad × PistonArea × HydraulicPressure × (DiscRadius / WheelRadius)
  // Simplified: scale by disc size, piston count, and pad compound
  const discFactor = config.discSizeMm / 350;  // 350mm as reference
  const pistonFactor = 1 + (config.pistonCount - 4) * 0.08;
  const padFactor = 0.70 + config.padCompound * 0.30;

  let maxForce = bp.frictionCoeff * discFactor * pistonFactor * padFactor * mass * 9.81 * 1.2;

  // Fade penalty
  const fadePenalty = state.fadeLevel * (1 - bp.fadeResistance);
  maxForce *= (1 - fadePenalty);

  // ABS: prevents wheels from locking by limiting force to tyre grip capacity
  const tyreGripForce = tyreGrip * mass * 9.81;
  let absActive = false;
  if (hasAbs && maxForce > tyreGripForce) {
    maxForce = tyreGripForce * 0.95; // ABS is ~95% efficient
    absActive = true;
  } else if (!hasAbs && maxForce > tyreGripForce) {
    // Without ABS, locking wheels reduces effective braking
    maxForce = tyreGripForce * 0.75; // locked wheels = less grip
    absActive = false;
  }

  // Distribute by brake bias
  const frontForce = maxForce * config.brakeBias;
  const rearForce = maxForce * (1 - config.brakeBias);

  // Braking G
  const brakingG = maxForce / (mass * 9.81);

  return {
    maxBrakeForce: Math.round(maxForce),
    frontBrakeForce: Math.round(frontForce),
    rearBrakeForce: Math.round(rearForce),
    brakingG: Math.round(brakingG * 100) / 100,
    absActive,
    fadePenalty: Math.round(fadePenalty * 1000) / 1000,
  };
}

// ---------------------------------------------------------------------------
// Update brake temperature
// ---------------------------------------------------------------------------

export function updateBrakeTemperature(
  state: BrakeState,
  config: BrakePhysicsConfig,
  brakeForceApplied: number, // N
  speed: number,             // km/h
  ambientTemp: number,       // °C
  dt: number,                // seconds
): BrakeState {
  const bp = BRAKE_PHYSICS[config.brakeType];

  // Heat generation: Q = F × v (kinetic energy → heat)
  const speedMs = speed / 3.6;
  const heatInput = brakeForceApplied * speedMs * 0.0005 * dt;

  // Cooling: convective (speed-dependent) + radiative + duct cooling
  const speedCooling = speedMs * 0.3;
  const ductCooling = config.hasBrakeCooling * 15;
  const radiativeCooling = Math.max(0, (state.temperature - ambientTemp)) * 0.02;
  const totalCooling = (bp.coolingRate + speedCooling + ductCooling + radiativeCooling) * dt;

  const newTemp = Math.max(ambientTemp, state.temperature + heatInput - totalCooling);

  // Fade level: increases above max temp threshold
  let fadeLevel = state.fadeLevel;
  if (newTemp > bp.maxTemp * 0.7) {
    const excess = (newTemp - bp.maxTemp * 0.7) / (bp.maxTemp * 0.3);
    fadeLevel = Math.min(1, excess * excess * 0.8); // quadratic fade onset
  } else {
    // Fade recovery when cool
    fadeLevel = Math.max(0, fadeLevel - dt * 0.05);
  }

  return {
    temperature: Math.round(newTemp * 10) / 10,
    fadeLevel: Math.round(fadeLevel * 1000) / 1000,
  };
}

// ---------------------------------------------------------------------------
// Braking distance calculation
// ---------------------------------------------------------------------------

export function calculateStoppingDistance(
  config: BrakePhysicsConfig,
  mass: number,
  tyreGrip: number,
  hasAbs: boolean,
): StoppingResult {
  const GRAVITY = 9.81;
  const bp = BRAKE_PHYSICS[config.brakeType];

  // Effective deceleration (limited by either brakes or tyres)
  const brakeDecel = bp.frictionCoeff * (config.discSizeMm / 350) * (1 + (config.pistonCount - 4) * 0.08) * (0.70 + config.padCompound * 0.30) * 1.2;
  const tyreDecel = tyreGrip;
  const effectiveDecel = Math.min(brakeDecel, hasAbs ? tyreDecel * 0.95 : tyreDecel * 0.75);
  const decelG = effectiveDecel;
  const decelMs2 = decelG * GRAVITY;

  // d = v² / (2 × a)
  const v100 = 100 / 3.6;
  const v60 = 60 / 3.6;
  const v200 = 200 / 3.6;

  return {
    distance100_0: Math.round((v100 * v100) / (2 * decelMs2) * 10) / 10,
    distance60_0: Math.round((v60 * v60) / (2 * decelMs2) * 10) / 10,
    distance200_0: Math.round((v200 * v200) / (2 * decelMs2) * 10) / 10,
    avgDecelG: Math.round(decelG * 100) / 100,
    peakDecelG: Math.round(decelG * 1.05 * 100) / 100, // peak slightly higher than sustained
  };
}

// ---------------------------------------------------------------------------
// Braking zone distance for a specific speed reduction
// ---------------------------------------------------------------------------

export function brakingZoneDistance(
  fromSpeedKmh: number,
  toSpeedKmh: number,
  brakingG: number,
): number {
  const v1 = fromSpeedKmh / 3.6;
  const v2 = toSpeedKmh / 3.6;
  const decel = brakingG * 9.81;
  if (decel <= 0) return 0;
  return Math.max(0, (v1 * v1 - v2 * v2) / (2 * decel));
}

/** Time to brake from v1 to v2 at given G */
export function brakingZoneTime(
  fromSpeedKmh: number,
  toSpeedKmh: number,
  brakingG: number,
): number {
  const v1 = fromSpeedKmh / 3.6;
  const v2 = toSpeedKmh / 3.6;
  const decel = brakingG * 9.81;
  if (decel <= 0) return 0;
  return Math.max(0, (v1 - v2) / decel);
}
