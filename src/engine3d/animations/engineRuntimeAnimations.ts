// ============================================================================
// ENGINE RUNTIME ANIMATION PHYSICS & KINEMATICS ENGINE
// ============================================================================

export type FourStrokePhase = 'INTAKE' | 'COMPRESSION' | 'POWER' | 'EXHAUST';

export interface CylinderCycleState {
  cylinderIndex: number;
  cycleAngleDeg: number;       // 0 to 720 degrees
  phase: FourStrokePhase;
  intakeValveLiftMm: number;
  exhaustValveLiftMm: number;
  pistonDisplacementMm: number;
  pistonNormalized01: number;
  conRodAngleRad: number;
  isSparkFiring: boolean;
  combustionIntensity: number; // 0 to 1
  exhaustPulseIntensity: number; // 0 to 1
  glowColorHex: string;
}

// 720° Four-Stroke Firing Orders & Crank Throw Offsets
// V12 60°: 1-12-5-8-3-10-6-7-2-11-4-9
// Odd: Left bank (1,3,5,7,9,11), Even: Right bank (2,4,6,8,10,12)
export const V12_FIRING_ORDER_DEGREES: number[] = [
  0,    // Cyl 1 (Throw 1, Left)
  480,  // Cyl 2 (Throw 1, Right)
  240,  // Cyl 3 (Throw 2, Left)
  600,  // Cyl 4 (Throw 2, Right)
  120,  // Cyl 5 (Throw 3, Left)
  360,  // Cyl 6 (Throw 3, Right)
  420,  // Cyl 7 (Throw 4, Left)
  180,  // Cyl 8 (Throw 4, Right)
  660,  // Cyl 9 (Throw 5, Left)
  300,  // Cyl 10 (Throw 5, Right)
  540,  // Cyl 11 (Throw 6, Left)
  60,   // Cyl 12 (Throw 6, Right)
];

export const V8_CROSS_FIRING_ORDER: number[] = [0, 180, 270, 90, 45, 225, 315, 135];
export const V8_FLAT_FIRING_ORDER: number[] = [0, 180, 180, 0, 270, 90, 90, 270];
export const I4_FIRING_ORDER: number[] = [0, 540, 180, 360];
export const FLAT6_FIRING_ORDER: number[] = [0, 240, 480, 240, 480, 0];
export const V6_FIRING_ORDER: number[] = [0, 120, 240, 60, 180, 300];
export const V10_FIRING_ORDER: number[] = [0, 144, 288, 72, 216, 360, 144, 288, 72, 216];

// ============================================================================
// V12 60° CRANK GEOMETRY — CYLINDER → CRANKPIN MAPPING
// Six crankpins (throws) spaced 60° apart; each throw carries ONE rod per bank
// (two cylinders). Cylinders sharing a throw move together and fire 360° apart.
// Classic firing order 1-12-5-8-3-10-6-7-2-11-4-9 (every 60° of crank) emerges
// naturally from this geometry.
// Piston kinematic phase offset per pin = (pinIndex * 300) % 360  =>  pin k
// reaches TDC at crank angle k*60°.
// ============================================================================
/** 0-based cylinder index -> crankpin index (0..5) for the 60° V12 */
export const V12_CYLINDER_PIN_INDEX: number[] = [0, 2, 4, 4, 2, 0, 1, 3, 5, 5, 3, 1];

/** Additive piston-phase offset (deg) for each crankpin: pin k -> (k*300) % 360 */
export const V12_PIN_PHASE_DEG: number[] = [0, 300, 240, 180, 120, 60];

/** Returns the kinematic offset (deg) for a cylinder so every piston on the
 *  same throw shares one phase — rods stay pinned, never visually detach. */
export function getV12PistonPhaseDeg(cylinderIndex0Based: number): number {
  const pin = V12_CYLINDER_PIN_INDEX[cylinderIndex0Based] ?? 0;
  return V12_PIN_PHASE_DEG[pin] ?? 0;
}

export function getV12CrankpinIndex(cylinderIndex0Based: number): number {
  return V12_CYLINDER_PIN_INDEX[cylinderIndex0Based] ?? 0;
}


export type EngineType = 'V12' | 'V8_FLAT' | 'V8_CROSS' | 'I4' | 'FLAT6' | 'V6' | 'V10';

export function getFiringOrderForType(type: EngineType): number[] {
  switch (type) {
    case 'V12': return V12_FIRING_ORDER_DEGREES;
    case 'V8_FLAT': return V8_FLAT_FIRING_ORDER;
    case 'V8_CROSS': return V8_CROSS_FIRING_ORDER;
    case 'I4': return I4_FIRING_ORDER;
    case 'FLAT6': return FLAT6_FIRING_ORDER;
    case 'V6': return V6_FIRING_ORDER;
    case 'V10': return V10_FIRING_ORDER;
    default: return V12_FIRING_ORDER_DEGREES;
  }
}

export interface PistonKinematicsConfig {
  strokeMm: number;
  conRodLengthMm: number;
  compressionRatio: number;
  boreMm: number;
  cylinderSpacingMm: number;
  bankAngle: number;
}

export const PISTON_CONFIGS: Record<EngineType, PistonKinematicsConfig> = {
  V12: { strokeMm: 76, conRodLengthMm: 132, compressionRatio: 13.5, boreMm: 73, cylinderSpacingMm: 90, bankAngle: 60 },
  V8_FLAT: { strokeMm: 86, conRodLengthMm: 152.5, compressionRatio: 12.5, boreMm: 94, cylinderSpacingMm: 110, bankAngle: 90 },
  V8_CROSS: { strokeMm: 92, conRodLengthMm: 160, compressionRatio: 11.5, boreMm: 101.6, cylinderSpacingMm: 115, bankAngle: 90 },
  I4: { strokeMm: 86, conRodLengthMm: 145, compressionRatio: 10.5, boreMm: 86, cylinderSpacingMm: 96, bankAngle: 0 },
  FLAT6: { strokeMm: 76.4, conRodLengthMm: 131, compressionRatio: 12.7, boreMm: 102, cylinderSpacingMm: 100, bankAngle: 180 },
  V6: { strokeMm: 78, conRodLengthMm: 140, compressionRatio: 11.0, boreMm: 86, cylinderSpacingMm: 96, bankAngle: 60 },
  V10: { strokeMm: 84, conRodLengthMm: 148, compressionRatio: 12.0, boreMm: 85, cylinderSpacingMm: 94, bankAngle: 72 },
};

/**
 * Exact Slider-Crank equation:
 * y(θ) = R cos θ + √(L² - R² sin² θ) - (R + L)
 * Result is negative displacement from TDC: 0 mm at TDC, -strokeMm at BDC.
 */
export function calculatePistonDisplacement(crankAngleDeg: number, config: PistonKinematicsConfig): number {
  const R = config.strokeMm / 2;
  const L = config.conRodLengthMm;
  const theta = (crankAngleDeg * Math.PI) / 180;
  const sinTheta = Math.sin(theta);
  const cosTheta = Math.cos(theta);
  const radical = Math.max(0, L * L - R * R * sinTheta * sinTheta);
  return R * cosTheta + Math.sqrt(radical) - (R + L);
}

/**
 * Exact Connecting Rod angular swing angle β(θ):
 * β = arcsin((R / L) * sin θ)
 */
export function calculateConRodAngle(crankAngleDeg: number, config: PistonKinematicsConfig): number {
  const R = config.strokeMm / 2;
  const L = config.conRodLengthMm;
  const theta = (crankAngleDeg * Math.PI) / 180;
  return Math.asin(Math.max(-1, Math.min(1, (R * Math.sin(theta)) / L)));
}

export interface ValveTimingConfig {
  intakeOpenDeg: number;
  intakeCloseDeg: number;
  exhaustOpenDeg: number;
  exhaustCloseDeg: number;
  maxLiftMm: number;
  duration: number;
}

export const DEFAULT_VALVE_TIMING: ValveTimingConfig = {
  intakeOpenDeg: 25,
  intakeCloseDeg: 65,
  exhaustOpenDeg: 60,
  exhaustCloseDeg: 20,
  maxLiftMm: 11.2,
  duration: 270,
};

/**
 * Solves the exact four-stroke cycle state for a single cylinder at given total crank angle.
 */
export function solveCylinderCycle(
  cylinderIndex: number,
  engineCrankAngleDeg: number,
  firingOffsetDeg: number,
  config: PistonKinematicsConfig = PISTON_CONFIGS.V12,
  timing: ValveTimingConfig = DEFAULT_VALVE_TIMING,
  kinematicPhaseDeg: number = firingOffsetDeg
): CylinderCycleState {
  const cycleAngleDeg = ((engineCrankAngleDeg + firingOffsetDeg) % 720 + 720) % 720;
  // Kinematic phase follows the shared crankpin (cylinders on one throw move together)
  const kinCycleDeg = ((engineCrankAngleDeg + kinematicPhaseDeg) % 720 + 720) % 720;
  const dispMm = calculatePistonDisplacement(kinCycleDeg, config);
  const norm01 = Math.max(0, Math.min(1, (dispMm + config.strokeMm) / config.strokeMm));
  const conRodAngleRad = calculateConRodAngle(kinCycleDeg, config);

  let phase: FourStrokePhase = 'INTAKE';
  let intakeLift = 0;
  let exhaustLift = 0;
  let isSparkFiring = false;
  let combustionIntensity = 0;
  let exhaustPulseIntensity = 0;
  let glowColorHex = '#000000';

  // 1. INTAKE STROKE: 0° to 180°
  // Piston travels from TDC down to BDC; intake valve is fully open
  if (cycleAngleDeg >= 0 && cycleAngleDeg < 180) {
    phase = 'INTAKE';
    const progress = cycleAngleDeg / 180;
    intakeLift = timing.maxLiftMm * Math.sin(progress * Math.PI);
    // Cyan/electric blue cold charge filling the cylinder
    glowColorHex = '#00e5ff';
    combustionIntensity = Math.sin(progress * Math.PI) * 0.45;
  }
  // 2. COMPRESSION STROKE: 180° to 360°
  // Piston travels from BDC up to TDC; all valves closed; gas compressed
  else if (cycleAngleDeg >= 180 && cycleAngleDeg < 360) {
    phase = 'COMPRESSION';
    const progress = (cycleAngleDeg - 180) / 180;
    // Golden warm pressure rise
    glowColorHex = '#fbbf24';
    combustionIntensity = Math.pow(progress, 2.5) * 0.7;

    // Spark plug fires right before TDC (ignition advance: 345° to 360°)
    if (cycleAngleDeg >= 348 && cycleAngleDeg <= 360) {
      isSparkFiring = true;
      glowColorHex = '#ffffff'; // Electric white ignition flash
      combustionIntensity = 1.0;
    }
  }
  // 3. POWER / COMBUSTION STROKE: 360° to 540°
  // Mixture detonates; high pressure expansion drives piston down from TDC to BDC
  else if (cycleAngleDeg >= 360 && cycleAngleDeg < 540) {
    phase = 'POWER';
    const progress = (cycleAngleDeg - 360) / 180;
    // Radiant fiery flame orange-red decay
    glowColorHex = progress < 0.25 ? '#ff3b00' : progress < 0.6 ? '#ff6600' : '#ff9900';
    combustionIntensity = Math.exp(-progress * 3.2);

    // Initial spark flash continues through first 5 degrees of power stroke
    if (cycleAngleDeg <= 365) {
      isSparkFiring = true;
    }
  }
  // 4. EXHAUST STROKE: 540° to 720°
  // Exhaust valve opens; rising piston scavenges burnt gas into headers
  else {
    phase = 'EXHAUST';
    const progress = (cycleAngleDeg - 540) / 180;
    exhaustLift = timing.maxLiftMm * Math.sin(progress * Math.PI);
    // Incandescent amber/red exhaust wave
    glowColorHex = '#f97316';
    exhaustPulseIntensity = Math.sin(progress * Math.PI) * 0.85;
    combustionIntensity = exhaustPulseIntensity * 0.4;
  }

  return {
    cylinderIndex,
    cycleAngleDeg,
    phase,
    intakeValveLiftMm: intakeLift,
    exhaustValveLiftMm: exhaustLift,
    pistonDisplacementMm: dispMm,
    pistonNormalized01: norm01,
    conRodAngleRad,
    isSparkFiring,
    combustionIntensity,
    exhaustPulseIntensity,
    glowColorHex,
  };
}

export function calculateValveLift(camAngleDeg: number, timing: ValveTimingConfig = DEFAULT_VALVE_TIMING): number {
  const n = ((camAngleDeg % 720) + 720) % 720;
  const intakeOpen = 720 - timing.intakeOpenDeg;
  const exhaustOpen = 360 - timing.exhaustOpenDeg;
  const exhaustClose = 360 + timing.duration - timing.exhaustOpenDeg;
  let lift = 0;
  if (n >= intakeOpen || n <= timing.duration - timing.intakeOpenDeg) {
    const span = n >= intakeOpen ? n - intakeOpen : (720 - intakeOpen) + n;
    lift = (timing.maxLiftMm * (1 - Math.cos((span / timing.duration) * Math.PI))) / 2;
  }
  if (n >= exhaustOpen && n <= exhaustClose) {
    const span = n - exhaustOpen;
    const exhLift = (timing.maxLiftMm * (1 - Math.cos((span / timing.duration) * Math.PI))) / 2;
    lift = Math.max(lift, exhLift);
  }
  return lift;
}

export function getCamshaftAngle(crankAngleDeg: number, bank: 'intake' | 'exhaust'): number {
  return bank === 'exhaust' ? crankAngleDeg / 2 + 180 : crankAngleDeg / 2;
}

export interface CrankshaftState {
  angleDeg: number;
  rpm: number;
  targetRpm: number;
  angularVelocity: number;
  vibrationAmplitude: number;
  exhaustPulsePhase: number;
}

export function createInitialCrankshaftState(): CrankshaftState {
  return { angleDeg: 0, rpm: 0, targetRpm: 0, angularVelocity: 0, vibrationAmplitude: 0, exhaustPulsePhase: 0 };
}

export function advanceCrankshaft(state: CrankshaftState, deltaTimeSec: number, smooth: number = 3.0): CrankshaftState {
  const diff = state.targetRpm - state.rpm;
  const newRpm = state.rpm + diff * Math.min(1, smooth * deltaTimeSec);
  const angVel = newRpm * 6;
  let newAngle = (state.angleDeg + angVel * deltaTimeSec) % 720;
  if (newAngle < 0) newAngle += 720;
  const rf = newRpm / 4000;
  return {
    angleDeg: newAngle,
    rpm: newRpm,
    targetRpm: state.targetRpm,
    angularVelocity: angVel,
    vibrationAmplitude: rf * rf * 0.0008,
    exhaustPulsePhase: (newAngle * Math.PI) / 180,
  };
}

export interface TurbochargerState {
  turbineSpeedRpm: number;
  compressorSpeedRpm: number;
  boostPressureBar: number;
  wastegateOpen: boolean;
  exhaustGasTempC: number;
  spoolFactor: number;
  flutterPhase: number;
}

export function createTurbochargerState(): TurbochargerState {
  return {
    turbineSpeedRpm: 0,
    compressorSpeedRpm: 0,
    boostPressureBar: 0,
    wastegateOpen: false,
    exhaustGasTempC: 20,
    spoolFactor: 0,
    flutterPhase: 0,
  };
}

export function advanceTurbocharger(state: TurbochargerState, engineRpm: number, throttle: number, dt: number): TurbochargerState {
  const energy = (engineRpm * throttle) / 8000;
  const targetSpool = Math.min(1, energy * 1.2);
  const isDecelerating = targetSpool < state.spoolFactor * 0.8;
  const rate = targetSpool > state.spoolFactor ? 0.8 : 2.5;
  const flutter = isDecelerating && state.boostPressureBar > 0.5 ? Math.sin(state.flutterPhase) * state.boostPressureBar * 0.3 : 0;
  const flutterRate = isDecelerating ? 15 : 0;
  const newSpool = state.spoolFactor + (targetSpool - state.spoolFactor) * rate * dt;
  const newTurbine = state.turbineSpeedRpm + (newSpool * 150000 - state.turbineSpeedRpm) * 4 * dt;
  const maxBoost = 2.5;
  const targetBoost = newSpool * maxBoost * throttle;
  const newBoost = state.boostPressureBar + (targetBoost - state.boostPressureBar) * 3 * dt + flutter;
  return {
    turbineSpeedRpm: newTurbine,
    compressorSpeedRpm: newTurbine,
    boostPressureBar: Math.max(0, newBoost),
    wastegateOpen: newBoost > maxBoost * 0.95,
    exhaustGasTempC: 20 + engineRpm * 0.08 + newBoost * 200,
    spoolFactor: newSpool,
    flutterPhase: state.flutterPhase + flutterRate * dt,
  };
}

export interface EngineVibration {
  primaryX: number;
  primaryY: number;
  secondaryX: number;
  secondaryY: number;
  totalAmplitude: number;
}

export function calculateEngineVibration(crankAngleDeg: number, rpm: number, engineType: EngineType): EngineVibration {
  const theta = (crankAngleDeg * Math.PI) / 180;
  const rpmNorm = rpm / 8000;
  const resonance = 1 + 0.3 * Math.abs(Math.sin(rpmNorm * Math.PI * 3)) + 0.15 * Math.abs(Math.sin(rpmNorm * Math.PI * 6));
  const base = rpmNorm * rpmNorm * 0.001 * resonance;
  const bf = engineType === 'V12' ? 0.05 : engineType === 'I4' ? 0.6 : 0.25;
  const sf = engineType === 'I4' ? 0.5 : 0.05;
  return {
    primaryX: Math.sin(theta) * base * bf,
    primaryY: Math.cos(theta) * base * bf * 0.8,
    secondaryX: Math.sin(2 * theta) * base * sf,
    secondaryY: Math.cos(2 * theta) * base * sf * 0.6,
    totalAmplitude: base * bf,
  };
}

export interface EngineRuntimeAnimationState {
  crank: CrankshaftState;
  turbo: TurbochargerState;
  engineType: EngineType;
  isRunning: boolean;
  throttlePosition: number;
  timeRunning: number;
}

export function createRuntimeState(engineType: EngineType = 'V12'): EngineRuntimeAnimationState {
  return {
    crank: createInitialCrankshaftState(),
    turbo: createTurbochargerState(),
    engineType,
    isRunning: false,
    throttlePosition: 0.5,
    timeRunning: 0,
  };
}

export function advanceRuntimeState(state: EngineRuntimeAnimationState, dt: number): EngineRuntimeAnimationState {
  if (!state.isRunning) return state;
  const newCrank = advanceCrankshaft(state.crank, dt);
  return {
    ...state,
    crank: newCrank,
    turbo: advanceTurbocharger(state.turbo, newCrank.rpm, state.throttlePosition, dt),
    timeRunning: state.timeRunning + dt,
  };
}
