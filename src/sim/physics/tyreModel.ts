// ===================================================================
// TYRE PHYSICS MODEL — Grip, temperature, wear, load sensitivity
// ===================================================================
// Phase 4: Pacejka-inspired grip model with thermal dynamics,
// compound characteristics, degradation, and load sensitivity.

import type { TireCompound } from '../types';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface TyreState {
  compound: TireCompound;
  temperature: [number, number, number, number]; // FL, FR, RL, RR (°C)
  wear: [number, number, number, number];         // FL, FR, RL, RR (0 = new, 1 = dead)
  pressure: [number, number, number, number];     // bar
  gripMultiplier: number;                          // overall compound base grip
}

export interface TyreGripResult {
  gripFL: number;              // effective μ front-left
  gripFR: number;
  gripRL: number;
  gripRR: number;
  avgGrip: number;             // average effective μ
  frontGrip: number;           // average front μ
  rearGrip: number;            // average rear μ
  isOverheating: boolean;      // any tyre above optimal range
  isUndercooled: boolean;      // any tyre below optimal range
}

export interface TyreWearResult {
  wearFL: number;
  wearFR: number;
  wearRL: number;
  wearRR: number;
  cliffReached: boolean;       // any tyre past the performance cliff
}

export interface TyreThermalInput {
  lateralForce: [number, number, number, number]; // N per wheel
  speed: number;               // km/h
  ambientTemp: number;         // °C
  trackTemp: number;           // °C
  dt: number;                  // time step in seconds
}

// ---------------------------------------------------------------------------
// Compound data (aligned with existing TIRE_COMPOUNDS in constants.ts)
// ---------------------------------------------------------------------------

interface CompoundPhysics {
  muBase: number;              // base grip coefficient
  optimalTemp: number;         // °C at peak grip
  tempRange: [number, number]; // operating window °C
  wearRate: number;            // per-lap base wear (0-1 scale per lap)
  warmupRate: number;          // how fast temp rises (°C per kJ)
  thermalMass: number;         // resistance to temp change
  loadSensitivity: number;     // exponent for load-sensitivity model
  wearCliff: number;           // wear level where grip drops sharply (0-1)
  wetGripMul: number;          // grip multiplier in wet conditions
}

const COMPOUND_PHYSICS: Record<TireCompound, CompoundPhysics> = {
  hard:        { muBase: 1.05, optimalTemp: 100, tempRange: [85, 115], wearRate: 0.003, warmupRate: 0.08, thermalMass: 1.4, loadSensitivity: 0.15, wearCliff: 0.85, wetGripMul: 0.80 },
  medium:      { muBase: 1.15, optimalTemp: 95,  tempRange: [80, 110], wearRate: 0.006, warmupRate: 0.12, thermalMass: 1.2, loadSensitivity: 0.14, wearCliff: 0.80, wetGripMul: 0.75 },
  soft:        { muBase: 1.25, optimalTemp: 90,  tempRange: [75, 105], wearRate: 0.012, warmupRate: 0.18, thermalMass: 1.0, loadSensitivity: 0.13, wearCliff: 0.72, wetGripMul: 0.70 },
  supersoft:   { muBase: 1.35, optimalTemp: 85,  tempRange: [70, 100], wearRate: 0.020, warmupRate: 0.25, thermalMass: 0.8, loadSensitivity: 0.12, wearCliff: 0.65, wetGripMul: 0.60 },
  slick:       { muBase: 1.40, optimalTemp: 95,  tempRange: [80, 110], wearRate: 0.015, warmupRate: 0.20, thermalMass: 0.9, loadSensitivity: 0.12, wearCliff: 0.70, wetGripMul: 0.30 },
  wet:         { muBase: 0.80, optimalTemp: 55,  tempRange: [40, 75],  wearRate: 0.004, warmupRate: 0.10, thermalMass: 1.3, loadSensitivity: 0.18, wearCliff: 0.90, wetGripMul: 1.00 },
  intermediate:{ muBase: 0.95, optimalTemp: 65,  tempRange: [50, 85],  wearRate: 0.005, warmupRate: 0.14, thermalMass: 1.1, loadSensitivity: 0.16, wearCliff: 0.85, wetGripMul: 0.90 },
};

// ---------------------------------------------------------------------------
// Create initial tyre state
// ---------------------------------------------------------------------------

export function createTyreState(
  compound: TireCompound,
  startingTemp: number,
  pressure: number = 1.8,
): TyreState {
  const cp = COMPOUND_PHYSICS[compound];
  return {
    compound,
    temperature: [startingTemp, startingTemp, startingTemp, startingTemp],
    wear: [0, 0, 0, 0],
    pressure: [pressure, pressure, pressure, pressure],
    gripMultiplier: cp.muBase,
  };
}

// ---------------------------------------------------------------------------
// Calculate grip per wheel
// ---------------------------------------------------------------------------

/** Temperature-based grip factor: Gaussian centered on optimal temp */
function tempGripFactor(temp: number, cp: CompoundPhysics): number {
  const { optimalTemp, tempRange } = cp;
  const width = (tempRange[1] - tempRange[0]) / 2;

  if (temp >= tempRange[0] && temp <= tempRange[1]) {
    // Inside operating window — peak near optimal
    const deviation = Math.abs(temp - optimalTemp) / width;
    return 1 - deviation * deviation * 0.08; // small penalty near edges
  } else if (temp < tempRange[0]) {
    // Cold — grip drops significantly
    const underTemp = tempRange[0] - temp;
    return Math.max(0.50, 1 - underTemp * 0.015);
  } else {
    // Overheated — grip drops and tyre blisters
    const overTemp = temp - tempRange[1];
    return Math.max(0.55, 1 - overTemp * 0.012);
  }
}

/** Wear-based grip factor: linear until cliff, then rapid drop */
function wearGripFactor(wear: number, cp: CompoundPhysics): number {
  if (wear <= cp.wearCliff) {
    // Linear gentle degradation up to cliff
    return 1 - wear * 0.15; // lose ~15% grip by cliff
  }
  // Past cliff: rapid grip drop
  const pastCliff = (wear - cp.wearCliff) / (1 - cp.wearCliff);
  return Math.max(0.30, (1 - cp.wearCliff * 0.15) - pastCliff * 0.55);
}

/** Load sensitivity: higher normal force → diminishing grip returns */
function loadSensitivityFactor(normalForce: number, cp: CompoundPhysics): number {
  const refForce = 4000; // N reference (1/4 of ~1600kg car)
  if (normalForce <= 0) return 1;
  return Math.pow(refForce / normalForce, cp.loadSensitivity);
}

export function calculateTyreGrip(
  tyre: TyreState,
  normalForce: [number, number, number, number], // N per wheel
  surfaceGrip: number = 1.0,  // track surface multiplier
  weatherGrip: number = 1.0,  // weather multiplier
): TyreGripResult {
  const cp = COMPOUND_PHYSICS[tyre.compound];
  const grips = [0, 0, 0, 0];
  let overheating = false;
  let undercooled = false;

  for (let i = 0; i < 4; i++) {
    const tFactor = tempGripFactor(tyre.temperature[i], cp);
    const wFactor = wearGripFactor(tyre.wear[i], cp);
    const lFactor = loadSensitivityFactor(normalForce[i], cp);

    // Check thermal status
    if (tyre.temperature[i] > cp.tempRange[1]) overheating = true;
    if (tyre.temperature[i] < cp.tempRange[0]) undercooled = true;

    // Wet compound bonus in wet conditions
    const wetBonus = weatherGrip < 0.9 ? cp.wetGripMul : 1.0;

    grips[i] = cp.muBase * tFactor * wFactor * lFactor * surfaceGrip * weatherGrip * wetBonus;
  }

  return {
    gripFL: Math.round(grips[0] * 1000) / 1000,
    gripFR: Math.round(grips[1] * 1000) / 1000,
    gripRL: Math.round(grips[2] * 1000) / 1000,
    gripRR: Math.round(grips[3] * 1000) / 1000,
    avgGrip: Math.round(((grips[0] + grips[1] + grips[2] + grips[3]) / 4) * 1000) / 1000,
    frontGrip: Math.round(((grips[0] + grips[1]) / 2) * 1000) / 1000,
    rearGrip: Math.round(((grips[2] + grips[3]) / 2) * 1000) / 1000,
    isOverheating: overheating,
    isUndercooled: undercooled,
  };
}

// ---------------------------------------------------------------------------
// Temperature update
// ---------------------------------------------------------------------------

export function updateTyreTemperature(
  tyre: TyreState,
  input: TyreThermalInput,
): TyreState {
  const cp = COMPOUND_PHYSICS[tyre.compound];
  const newTemp = [...tyre.temperature] as [number, number, number, number];

  for (let i = 0; i < 4; i++) {
    // Heat generation from tyre slip/force
    const frictionHeat = Math.abs(input.lateralForce[i]) * 0.0001 * cp.warmupRate;

    // Speed-based convective cooling
    const speedMs = input.speed / 3.6;
    const convectiveCooling = (newTemp[i] - input.ambientTemp) * speedMs * 0.0003 / cp.thermalMass;

    // Conductive heating from track surface
    const conductiveHeat = (input.trackTemp - newTemp[i]) * 0.002;

    // Net temperature change
    const dT = (frictionHeat - convectiveCooling + conductiveHeat) * input.dt;
    newTemp[i] = Math.max(input.ambientTemp, Math.min(200, newTemp[i] + dT));
  }

  return { ...tyre, temperature: newTemp };
}

// ---------------------------------------------------------------------------
// Wear update
// ---------------------------------------------------------------------------

export function updateTyreWear(
  tyre: TyreState,
  forces: {
    lateralForce: [number, number, number, number];
    longitudinalForce: [number, number, number, number];
  },
  speedKmh: number,
  dt: number,
  driverTyreManagement: number = 0.5, // 0=abusive, 1=gentle
): TyreState {
  const cp = COMPOUND_PHYSICS[tyre.compound];
  const newWear = [...tyre.wear] as [number, number, number, number];

  for (let i = 0; i < 4; i++) {
    // Combined slip force
    const totalForce = Math.sqrt(forces.lateralForce[i] ** 2 + forces.longitudinalForce[i] ** 2);

    // Temperature accelerates wear when overheating
    const tempWearMul = tyre.temperature[i] > cp.tempRange[1]
      ? 1 + ((tyre.temperature[i] - cp.tempRange[1]) / 30) * 2.5
      : tyre.temperature[i] < cp.tempRange[0]
      ? 0.7 // cold tyres wear slower
      : 1.0;

    // Base wear per second
    const wearPerSec = cp.wearRate / 90; // ~90 sec lap → wearRate per lap

    // Force-dependent wear
    const forceWearMul = 1 + (totalForce / 8000) * 0.5;

    // Driver management reduces wear
    const driverMul = 1 - driverTyreManagement * 0.20;

    const dWear = wearPerSec * tempWearMul * forceWearMul * driverMul * dt;
    newWear[i] = Math.min(1, newWear[i] + dWear);
  }

  return { ...tyre, wear: newWear };
}

// ---------------------------------------------------------------------------
// Check if any tyre has hit the cliff
// ---------------------------------------------------------------------------

export function checkTyreCliff(tyre: TyreState): boolean {
  const cp = COMPOUND_PHYSICS[tyre.compound];
  return tyre.wear.some(w => w >= cp.wearCliff);
}

// ---------------------------------------------------------------------------
// Tyre grip summary for simplified corner calculations
// ---------------------------------------------------------------------------

export function avgTyreGrip(tyre: TyreState, surfaceGrip: number = 1, weatherGrip: number = 1): number {
  const refForce: [number, number, number, number] = [4000, 4000, 4000, 4000];
  const result = calculateTyreGrip(tyre, refForce, surfaceGrip, weatherGrip);
  return result.avgGrip;
}
