// ===================================================================
// DRIVER MODEL — Skill, consistency, tyre management, wet ability
// ===================================================================
// Phase 9: Applies human driver characteristics to the physics
// simulation, creating realistic performance variations.

import type { DriverSkill } from '../types';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface DriverProfile {
  name: string;
  brakingSkill: number;         // 0-1: how late they brake (1 = F1 pro)
  cornerEntrySkill: number;     // 0-1: how close to limit on turn-in
  throttleControl: number;      // 0-1: how smooth throttle application is
  consistency: number;          // 0-1: variation between laps (1 = robot)
  tyreManagement: number;       // 0-1: how well they preserve tyres
  wetSkill: number;             // 0-1: performance retention in rain
  racecraft: number;            // 0-1: overtaking and defending
  riskTaking: number;           // 0-1: willingness to push limits
  trailBraking: number;         // 0-1: ability to brake while turning
  liftOffControl: number;       // 0-1: handling lift-off oversteer
}

export interface DriverEffect {
  brakingPointOffset: number;   // metres earlier (positive = more cautious)
  apexSpeedFraction: number;    // fraction of theoretical max (0.90-1.00)
  exitThrottleDelay: number;    // seconds delay to full throttle
  lapTimeVariation: number;     // ± seconds random variation per lap
  tyreWearReduction: number;    // fraction reduction in tyre wear (0-0.25)
  wetGripRetention: number;     // fraction of dry grip retained in wet
  errorProbability: number;     // per-corner chance of a mistake (0-0.05)
  overtakeChanceMul: number;    // multiplier for overtaking probability
}

// ---------------------------------------------------------------------------
// Preset driver profiles from existing DriverSkill type
// ---------------------------------------------------------------------------

const DRIVER_PRESETS: Record<DriverSkill, Omit<DriverProfile, 'name'>> = {
  rookie: {
    brakingSkill: 0.40,
    cornerEntrySkill: 0.35,
    throttleControl: 0.40,
    consistency: 0.35,
    tyreManagement: 0.30,
    wetSkill: 0.30,
    racecraft: 0.25,
    riskTaking: 0.50,      // rookies take risks out of inexperience
    trailBraking: 0.20,
    liftOffControl: 0.25,
  },
  amateur: {
    brakingSkill: 0.55,
    cornerEntrySkill: 0.50,
    throttleControl: 0.55,
    consistency: 0.50,
    tyreManagement: 0.45,
    wetSkill: 0.45,
    racecraft: 0.40,
    riskTaking: 0.45,
    trailBraking: 0.35,
    liftOffControl: 0.40,
  },
  pro: {
    brakingSkill: 0.75,
    cornerEntrySkill: 0.72,
    throttleControl: 0.78,
    consistency: 0.75,
    tyreManagement: 0.70,
    wetSkill: 0.65,
    racecraft: 0.70,
    riskTaking: 0.55,
    trailBraking: 0.65,
    liftOffControl: 0.70,
  },
  expert: {
    brakingSkill: 0.90,
    cornerEntrySkill: 0.88,
    throttleControl: 0.92,
    consistency: 0.88,
    tyreManagement: 0.85,
    wetSkill: 0.80,
    racecraft: 0.85,
    riskTaking: 0.50,
    trailBraking: 0.85,
    liftOffControl: 0.88,
  },
  legend: {
    brakingSkill: 0.97,
    cornerEntrySkill: 0.96,
    throttleControl: 0.98,
    consistency: 0.95,
    tyreManagement: 0.92,
    wetSkill: 0.95,
    racecraft: 0.95,
    riskTaking: 0.45,      // legends are calculated, not reckless
    trailBraking: 0.95,
    liftOffControl: 0.96,
  },
};

// ---------------------------------------------------------------------------
// Build driver profile from skill level
// ---------------------------------------------------------------------------

export function buildDriverProfile(skill: DriverSkill, name: string = ''): DriverProfile {
  const preset = DRIVER_PRESETS[skill];
  return { name: name || skill, ...preset };
}

// ---------------------------------------------------------------------------
// Calculate driver effects on lap simulation
// ---------------------------------------------------------------------------

export function calculateDriverEffect(driver: DriverProfile, isWet: boolean = false): DriverEffect {
  // Braking point: unskilled drivers brake 15m earlier than theoretical
  const brakingPointOffset = (1 - driver.brakingSkill) * 15;

  // Apex speed: unskilled drivers can only achieve 90-92% of theoretical max corner speed
  const baseApexFraction = 0.88 + driver.cornerEntrySkill * 0.12;
  // Trail braking allows carrying more speed into the corner
  const trailBrakingBonus = driver.trailBraking * 0.02;
  const apexSpeedFraction = Math.min(1.0, baseApexFraction + trailBrakingBonus);

  // Exit throttle delay: unskilled drivers hesitate before applying full throttle
  const exitThrottleDelay = (1 - driver.throttleControl) * 0.35; // up to 350ms delay

  // Lap time variation: inconsistent drivers vary ±1.5s per lap
  const lapTimeVariation = (1 - driver.consistency) * 1.5;

  // Tyre wear reduction from good management
  const tyreWearReduction = driver.tyreManagement * 0.25; // up to 25% less wear

  // Wet grip retention
  const wetGripRetention = isWet ? 0.60 + driver.wetSkill * 0.35 : 1.0;

  // Error probability per corner
  const errorProbability = (1 - driver.consistency) * 0.03 + driver.riskTaking * 0.02;

  // Overtaking chance multiplier
  const overtakeChanceMul = 0.5 + driver.racecraft * 1.0;

  return {
    brakingPointOffset: Math.round(brakingPointOffset * 10) / 10,
    apexSpeedFraction: Math.round(apexSpeedFraction * 1000) / 1000,
    exitThrottleDelay: Math.round(exitThrottleDelay * 1000) / 1000,
    lapTimeVariation: Math.round(lapTimeVariation * 100) / 100,
    tyreWearReduction: Math.round(tyreWearReduction * 1000) / 1000,
    wetGripRetention: Math.round(wetGripRetention * 1000) / 1000,
    errorProbability: Math.round(errorProbability * 10000) / 10000,
    overtakeChanceMul: Math.round(overtakeChanceMul * 100) / 100,
  };
}

// ---------------------------------------------------------------------------
// Apply driver variation to a lap time
// ---------------------------------------------------------------------------

export function applyLapVariation(
  baseLapTime: number,
  driver: DriverProfile,
  lapNumber: number,
  isWet: boolean = false,
): number {
  const effect = calculateDriverEffect(driver, isWet);

  // Random variation seeded by lap number for consistency
  const seed = Math.sin(lapNumber * 12345.6789) * 43758.5453;
  const random = (seed - Math.floor(seed)) * 2 - 1; // -1 to +1
  const variation = random * effect.lapTimeVariation;

  // Fatigue: driver gets slightly slower over long stints (0.1s per 15 laps)
  const fatigue = Math.floor(lapNumber / 15) * 0.1 * (1 - driver.consistency * 0.5);

  // Wet penalty: reduced pace in rain
  const wetPenalty = isWet ? baseLapTime * (1 - effect.wetGripRetention) * 0.15 : 0;

  return baseLapTime + variation + fatigue + wetPenalty;
}

// ---------------------------------------------------------------------------
// Driver error simulation
// ---------------------------------------------------------------------------

export interface DriverError {
  occurred: boolean;
  type: 'lockup' | 'oversteer' | 'understeer' | 'missed_apex' | 'none';
  timePenalty: number;          // seconds lost
  tyreWearPenalty: number;      // additional wear fraction
}

export function simulateDriverError(
  driver: DriverProfile,
  cornerDifficulty: number,      // 0-1 (how technically demanding the corner is)
  tyreWear: number,              // current tyre wear level 0-1
  lapNumber: number,
): DriverError {
  const effect = calculateDriverEffect(driver);

  // Error chance increases with corner difficulty, tyre wear, and fatigue
  const fatigueFactor = 1 + Math.floor(lapNumber / 20) * 0.1;
  const wearFactor = 1 + tyreWear * 0.5;
  const errorChance = effect.errorProbability * cornerDifficulty * fatigueFactor * wearFactor;

  // Deterministic pseudo-random based on lap + corner difficulty
  const hash = Math.sin(lapNumber * 100 + cornerDifficulty * 10000) * 43758.5453;
  const roll = hash - Math.floor(hash);

  if (roll > errorChance) {
    return { occurred: false, type: 'none', timePenalty: 0, tyreWearPenalty: 0 };
  }

  // Determine error type
  const errorTypes: Array<DriverError['type']> = ['lockup', 'oversteer', 'understeer', 'missed_apex'];
  const errorIdx = Math.floor((roll / errorChance) * errorTypes.length) % errorTypes.length;
  const errorType = errorTypes[errorIdx];

  const penalties: Record<string, { time: number; wear: number }> = {
    lockup:      { time: 0.3, wear: 0.008 },   // flat spot
    oversteer:   { time: 0.5, wear: 0.005 },   // catch and correct
    understeer:  { time: 0.4, wear: 0.003 },   // runs wide
    missed_apex: { time: 0.2, wear: 0.002 },   // suboptimal line
  };

  const p = penalties[errorType] || { time: 0.2, wear: 0.002 };

  return {
    occurred: true,
    type: errorType,
    timePenalty: p.time * (1 - driver.liftOffControl * 0.3), // better drivers recover faster
    tyreWearPenalty: p.wear,
  };
}
