// ============================================================================
// MODULAR GLB ENGINE ASSEMBLY — ENGINE RUNTIME ANIMATION PHYSICS ENGINE
// ============================================================================
// Realistic engine motion simulation for assembled engines:
// - V12 piston reciprocation with accurate firing order phase offsets
// - Crankshaft rotation with connecting rod angular correction
// - Camshaft timing (half crankshaft speed)
// - Valve lift profiles (intake/exhaust with cam lobe math)
// - Turbocharger turbine wheel spin
// - Oil pump gear rotation
// - Serpentine belt path animation
// - RPM-based vibration and exhaust pulse timing
// ============================================================================

// ============================================================================
// 1. FIRING ORDER DATABASE
// ============================================================================

/** V12 firing order (Bosch order) — each bank has 6 cylinders.
 *  Phase angles in degrees (0-720° per 4-stroke cycle).
 */
export const V12_FIRING_ORDER = [
  // Bank A (right side, cylinders 1-6)
  0, 120, 240, 60, 180, 300,
  // Bank B (left side, cylinders 7-12)
  60, 180, 300, 0, 120, 240,
];

/** Flat-plane V8 firing order */
export const FLATPLANE_V8_FIRING_ORDER = [0, 180, 180, 0, 270, 90, 90, 270];

/** Cross-plane V8 firing order */
export const CROSSPLANE_V8_FIRING_ORDER = [0, 180, 270, 90, 45, 225, 315, 135];

/** Inline-4 firing order */
export const INLINE4_FIRING_ORDER = [0, 540, 180, 360];

/** Flat-6 (boxer) firing order */
export const FLAT6_FIRING_ORDER = [0, 240, 480, 240, 480, 0];

export type EngineType = 'V12' | 'V8_FLAT' | 'V8_CROSS' | 'I4' | 'FLAT6' | 'V6' | 'V10';

export function getFiringOrderForType(type: EngineType): number[] {
  switch (type) {
    case 'V12': return V12_FIRING_ORDER;
    case 'V8_FLAT': return FLATPLANE_V8_FIRING_ORDER;
    case 'V8_CROSS': return CROSSPLANE_V8_FIRING_ORDER;
    case 'I4': return INLINE4_FIRING_ORDER;
    case 'FLAT6': return FLAT6_FIRING_ORDER;
    case 'V6': return [0, 120, 240, 60, 180, 300]; // 60° V6
    case 'V10': return [0, 144, 288, 72, 216, 360, 144, 288, 72, 216];
    default: return V12_FIRING_ORDER;
  }
}

// ============================================================================
// 2. PISTON RECIPROCATION KINEMATICS
// ============================================================================

export interface PistonKinematicsConfig {
  strokeMm: number;       // Piston stroke (e.g., 80mm for V12)
  conRodLengthMm: number; // Connecting rod center-to-center length
  compressionRatio: number;
  boreMm: number;         // Cylinder bore diameter
  cylinderSpacingMm: number;
  bankAngle: number;      // degrees, e.g., 60 for V12
}

export const PISTON_CONFIGS: Record<EngineType, PistonKinematicsConfig> = {
  V12: {
    strokeMm: 80,
    conRodLengthMm: 144,
    compressionRatio: 13.5,
    boreMm: 73,
    cylinderSpacingMm: 90,
    bankAngle: 60,
  },
  V8_FLAT: {
    strokeMm: 86,
    conRodLengthMm: 152.5,
    compressionRatio: 12.5,
    boreMm: 94,
    cylinderSpacingMm: 110,
    bankAngle: 90,
  },
  V8_CROSS: {
    strokeMm: 92,
    conRodLengthMm: 160,
    compressionRatio: 11.5,
    boreMm: 101.6,
    cylinderSpacingMm: 115,
    bankAngle: 90,
  },
  I4: {
    strokeMm: 86,
    conRodLengthMm: 145,
    compressionRatio: 10.5,
    boreMm: 86,
    cylinderSpacingMm: 96,
    bankAngle: 0,
  },
  FLAT6: {
    strokeMm: 76.4,
    conRodLengthMm: 131,
    compressionRatio: 12.7,
    boreMm: 102,
    cylinderSpacingMm: 100,
    bankAngle: 180,
  },
  V6: {
    strokeMm: 78,
    conRodLengthMm: 140,
    compressionRatio: 11.0,
    boreMm: 86,
    cylinderSpacingMm: 96,
    bankAngle: 60,
  },
  V10: {
    strokeMm: 84,
    conRodLengthMm: 148,
    compressionRatio: 12.0,
    boreMm: 85,
    cylinderSpacingMm: 94,
    bankAngle: 72,
  },
};

/**
 * Calculates instantaneous piston position from crankshaft angle.
 * Uses the exact slider-crank mechanism formula:
 *   y = R·cos(θ) + √(L² - R²·sin²(θ))
 * where R = stroke/2, L = conrod length, θ = crank angle.
 */
export function calculatePistonDisplacement(
  crankAngleDeg: number,
  config: PistonKinematicsConfig
): number {
  const R = config.strokeMm / 2;
  const L = config.conRodLengthMm;
  const theta = (crankAngleDeg * Math.PI) / 180;

  // Exact slider-crank position (top dead center = 0, downward positive)
  const sinTheta = Math.sin(theta);
  const cosTheta = Math.cos(theta);
  const displacement = R * cosTheta + Math.sqrt(L * L - R * R * sinTheta * sinTheta);

  // Normalize: TDC = 0, max displacement = stroke
  return displacement - (R + L);
}

/**
 * Returns piston position as fraction of stroke (0 = TDC, 1 = BDC).
 */
export function getPistonStrokeFraction(
  crankAngleDeg: number,
  config: PistonKinematicsConfig
): number {
  const R = config.strokeMm / 2;
  const L = config.conRodLengthMm;
  const theta = (crankAngleDeg * Math.PI) / 180;

  const cosTheta = Math.cos(theta);
  const sinTheta = Math.sin(theta);
  const denom = R + L;

  const y = (R * cosTheta + Math.sqrt(L * L - R * R * sinTheta * sinTheta)) / denom;

  // Normalize: TDC position → 0, BDC position → 1
  return 1 - y;
}

/**
 * Calculates connecting rod angular offset from cylinder centerline.
 * Returns angle in radians.
 */
export function calculateConRodAngle(
  crankAngleDeg: number,
  config: PistonKinematicsConfig
): number {
  const R = config.strokeMm / 2;
  const L = config.conRodLengthMm;
  const theta = (crankAngleDeg * Math.PI) / 180;

  return Math.asin((R * Math.sin(theta)) / L);
}

// ============================================================================
// 3. VALVE LIFT PROFILE (CAM LOBE GEOMETRY)
// ============================================================================

export interface ValveTimingConfig {
  intakeOpenDeg: number;   // Crank angle when intake opens (BTDC)
  intakeCloseDeg: number;  // Crank angle when intake closes (ABDC)
  exhaustOpenDeg: number;  // Crank angle when exhaust opens (BBDC)
  exhaustCloseDeg: number; // Crank angle when exhaust closes (ATDC)
  maxLiftMm: number;       // Maximum valve lift
  duration: number;        // Total duration in crank degrees
}

export const DEFAULT_VALVE_TIMING: ValveTimingConfig = {
  intakeOpenDeg: 30,
  intakeCloseDeg: 60,
  exhaustOpenDeg: 55,
  exhaustCloseDeg: 25,
  maxLiftMm: 10.5,
  duration: 270,
};

/**
 * Calculates valve lift at a given cam angle using a polynomial cam lobe profile.
 * Returns lift in mm (0 = closed, maxLift = fully open).
 */
export function calculateValveLift(
  camAngleDeg: number,
  timing: ValveTimingConfig = DEFAULT_VALVE_TIMING
): number {
  // Normalize to 0-720° cycle
  const normalized = ((camAngleDeg % 720) + 720) % 720;

  // Intake valve opens at (720 - intakeOpenDeg) and closes at intakeCloseDeg
  const intakeOpen = 720 - timing.intakeOpenDeg;
  const intakeClose = timing.duration - timing.intakeOpenDeg;
  const exhaustOpen = 360 - timing.exhaustOpenDeg;
  const exhaustClose = 360 + timing.duration - timing.exhaustOpenDeg;

  let lift = 0;

  // Check intake window
  if (normalized >= intakeOpen || normalized <= intakeClose) {
    const start = intakeOpen;
    const end = normalized < intakeClose ? intakeClose : normalized;
    const windowStart = normalized >= intakeOpen ? normalized : intakeOpen;
    const span = normalized >= intakeOpen
      ? normalized - intakeOpen
      : (720 - intakeOpen) + normalized;

    const totalDuration = timing.duration;
    const t = span / totalDuration;
    // Polynomial cam lobe profile: smooth rise, quick close
    lift = timing.maxLiftMm * (1 - Math.cos(t * Math.PI)) / 2;
  }

  // Check exhaust window
  if (normalized >= exhaustOpen && normalized <= exhaustClose) {
    const span = normalized - exhaustOpen;
    const totalDuration = timing.duration;
    const t = span / totalDuration;
    const exhLift = timing.maxLiftMm * (1 - Math.cos(t * Math.PI)) / 2;
    lift = Math.max(li
