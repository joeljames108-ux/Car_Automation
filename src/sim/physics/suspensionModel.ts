// ===================================================================
// SUSPENSION MODEL — Weight transfer, roll, camber, toe effects
// ===================================================================
// Phase 6: Calculates dynamic weight transfer under braking,
// acceleration, and cornering. Models roll angle, effective camber,
// and anti-roll bar influence on balance.

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface WheelLoads {
  fl: number;  // N front-left
  fr: number;  // N front-right
  rl: number;  // N rear-left
  rr: number;  // N rear-right
  totalFront: number; // N
  totalRear: number;  // N
}

export interface SuspensionConfig {
  mass: number;              // kg
  weightDistFront: number;   // 0-1
  cgHeight: number;          // m
  wheelbase: number;         // m
  trackWidthFront: number;   // m (1.4-1.8 typical)
  trackWidthRear: number;    // m
  springRateFront: number;   // N/mm
  springRateRear: number;    // N/mm
  damperFront: number;       // 0-1 (0=soft, 1=stiff)
  damperRear: number;        // 0-1
  arbFront: number;          // 0-1 (anti-roll bar stiffness)
  arbRear: number;           // 0-1
  camberFront: number;       // degrees (negative = tops in)
  camberRear: number;        // degrees
  toeFront: number;          // degrees (positive = toe-in)
  toeRear: number;           // degrees
  rideHeight: number;        // mm
}

export interface RollState {
  rollAngle: number;         // degrees
  pitchAngle: number;        // degrees
  rollStiffnessFront: number;// N·m/deg
  rollStiffnessRear: number; // N·m/deg
  rollDistribution: number;  // 0-1 (fraction of roll stiffness on front)
  dynamicCamberFL: number;   // degrees
  dynamicCamberFR: number;
  dynamicCamberRL: number;
  dynamicCamberRR: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const GRAVITY = 9.81;

// ---------------------------------------------------------------------------
// Static weight distribution (no acceleration)
// ---------------------------------------------------------------------------

export function staticWheelLoads(mass: number, weightDistFront: number): WheelLoads {
  const totalWeight = mass * GRAVITY;
  const front = totalWeight * weightDistFront;
  const rear = totalWeight * (1 - weightDistFront);
  return {
    fl: front / 2,
    fr: front / 2,
    rl: rear / 2,
    rr: rear / 2,
    totalFront: front,
    totalRear: rear,
  };
}

// ---------------------------------------------------------------------------
// Dynamic weight transfer
// ---------------------------------------------------------------------------

/**
 * Calculate wheel loads under combined longitudinal and lateral acceleration.
 * 
 * Longitudinal transfer: ΔF = m × ax × h_cg / wheelbase
 * Lateral transfer: ΔF = m × ay × h_cg / track_width
 */
export function calculateWeightTransfer(
  config: SuspensionConfig,
  longitudinalG: number,  // positive = braking (weight forward), negative = acceleration
  lateralG: number,       // positive = turning right (weight shifts left)
  downforceFront: number = 0,  // N from aero
  downforceRear: number = 0,
): WheelLoads {
  const W = config.mass * GRAVITY;
  const Wf = W * config.weightDistFront + downforceFront;
  const Wr = W * (1 - config.weightDistFront) + downforceRear;

  // Longitudinal weight transfer
  const deltaLong = config.mass * Math.abs(longitudinalG) * GRAVITY * config.cgHeight / config.wheelbase;
  const frontTotal = longitudinalG > 0 ? Wf + deltaLong : Wf - deltaLong;
  const rearTotal = longitudinalG > 0 ? Wr - deltaLong : Wr + deltaLong;

  // Lateral weight transfer (front and rear independently based on roll stiffness distribution)
  const rollDist = rollDistribution(config);
  const totalLatTransfer = config.mass * Math.abs(lateralG) * GRAVITY * config.cgHeight;

  const latTransferFront = totalLatTransfer * rollDist / Math.max(config.trackWidthFront, 0.1);
  const latTransferRear = totalLatTransfer * (1 - rollDist) / Math.max(config.trackWidthRear, 0.1);

  // Distribute: positive lateralG = turning right = weight shifts left
  const sign = lateralG > 0 ? 1 : -1;

  return {
    fl: Math.max(0, frontTotal / 2 + sign * latTransferFront / 2),
    fr: Math.max(0, frontTotal / 2 - sign * latTransferFront / 2),
    rl: Math.max(0, rearTotal / 2 + sign * latTransferRear / 2),
    rr: Math.max(0, rearTotal / 2 - sign * latTransferRear / 2),
    totalFront: Math.max(0, frontTotal),
    totalRear: Math.max(0, rearTotal),
  };
}

// ---------------------------------------------------------------------------
// Roll stiffness distribution
// ---------------------------------------------------------------------------

function rollDistribution(config: SuspensionConfig): number {
  // Roll stiffness comes from spring rates and ARBs
  // Higher front ARB/spring = more front roll stiffness = more weight transfer to front
  // This makes the front limit first → understeer
  const frontStiffness = config.springRateFront * (1 + config.arbFront * 1.5);
  const rearStiffness = config.springRateRear * (1 + config.arbRear * 1.5);
  const total = frontStiffness + rearStiffness;
  return total > 0 ? frontStiffness / total : 0.5;
}

// ---------------------------------------------------------------------------
// Roll and pitch angles
// ---------------------------------------------------------------------------

export function calculateRollState(
  config: SuspensionConfig,
  lateralG: number,
  longitudinalG: number,
): RollState {
  // Roll angle: θ = (m × ay × g × h_cg) / (K_roll_total)
  const rollStiffF = config.springRateFront * config.trackWidthFront * config.trackWidthFront / 4 * (1 + config.arbFront * 2);
  const rollStiffR = config.springRateRear * config.trackWidthRear * config.trackWidthRear / 4 * (1 + config.arbRear * 2);
  const totalRollStiff = rollStiffF + rollStiffR;

  const rollMoment = config.mass * Math.abs(lateralG) * GRAVITY * config.cgHeight;
  const rollAngle = totalRollStiff > 0 ? (rollMoment / totalRollStiff) * (180 / Math.PI) : 0;

  // Pitch angle (simplified)
  const pitchStiff = (config.springRateFront + config.springRateRear) * config.wheelbase * config.wheelbase / 4;
  const pitchMoment = config.mass * Math.abs(longitudinalG) * GRAVITY * config.cgHeight;
  const pitchAngle = pitchStiff > 0 ? (pitchMoment / pitchStiff) * (180 / Math.PI) : 0;

  // Dynamic camber from body roll
  // As the body rolls, outside wheel gains negative camber, inside loses it
  // Ratio depends on suspension geometry (~0.8 for double wishbone, ~1.2 for macpherson)
  const camberGainRate = 0.85; // degrees camber per degree roll
  const camberChangeF = rollAngle * camberGainRate;
  const camberChangeR = rollAngle * camberGainRate * 0.9; // rear slightly less

  const sign = lateralG > 0 ? 1 : -1;

  return {
    rollAngle: Math.round(rollAngle * 100) / 100,
    pitchAngle: Math.round(pitchAngle * 100) / 100,
    rollStiffnessFront: Math.round(rollStiffF),
    rollStiffnessRear: Math.round(rollStiffR),
    rollDistribution: totalRollStiff > 0 ? Math.round((rollStiffF / totalRollStiff) * 1000) / 1000 : 0.5,
    dynamicCamberFL: Math.round((config.camberFront - sign * camberChangeF) * 100) / 100,
    dynamicCamberFR: Math.round((config.camberFront + sign * camberChangeF) * 100) / 100,
    dynamicCamberRL: Math.round((config.camberRear - sign * camberChangeR) * 100) / 100,
    dynamicCamberRR: Math.round((config.camberRear + sign * camberChangeR) * 100) / 100,
  };
}

// ---------------------------------------------------------------------------
// Suspension grip modifier (camber + toe effects on tyre contact patch)
// ---------------------------------------------------------------------------

export function suspensionGripModifier(config: SuspensionConfig, rollState: RollState): {
  frontGripMod: number;   // multiplier
  rearGripMod: number;
  understeerTendency: number; // 0-1 (higher = more understeer)
} {
  // Optimal camber for peak grip is ~-2° to -3°
  const optimalCamber = -2.5;

  // Front grip: average of dynamic cambers on loaded (outside) wheel
  const frontCamberDeviation = Math.abs(Math.min(rollState.dynamicCamberFL, rollState.dynamicCamberFR) - optimalCamber);
  const rearCamberDeviation = Math.abs(Math.min(rollState.dynamicCamberRL, rollState.dynamicCamberRR) - optimalCamber);

  const frontCamberGrip = 1 - frontCamberDeviation * 0.02; // ~2% loss per degree off optimal
  const rearCamberGrip = 1 - rearCamberDeviation * 0.02;

  // Toe effects:
  // Front toe-out improves turn-in response (+grip) but increases tyre wear
  // Rear toe-in improves stability (+grip at rear)
  const frontToeGrip = config.toeFront < 0 ? 1.01 : 1 - Math.abs(config.toeFront) * 0.005;
  const rearToeGrip = config.toeRear > 0 ? 1.01 : 1 - Math.abs(config.toeRear) * 0.005;

  // Damper tuning: too soft = body movement, too stiff = no compliance
  const damperFrontMul = 1 - Math.abs(config.damperFront - 0.55) * 0.04;
  const damperRearMul = 1 - Math.abs(config.damperRear - 0.55) * 0.04;

  const frontGripMod = Math.max(0.85, frontCamberGrip * frontToeGrip * damperFrontMul);
  const rearGripMod = Math.max(0.85, rearCamberGrip * rearToeGrip * damperRearMul);

  // Understeer tendency from roll distribution
  const understeerTendency = rollState.rollDistribution; // higher front roll stiffness = more understeer

  return {
    frontGripMod: Math.round(frontGripMod * 1000) / 1000,
    rearGripMod: Math.round(rearGripMod * 1000) / 1000,
    understeerTendency: Math.round(understeerTendency * 1000) / 1000,
  };
}

// ---------------------------------------------------------------------------
// Build SuspensionConfig from VehicleConfig
// ---------------------------------------------------------------------------

export function suspensionConfigFromVehicle(vehicle: {
  springRateF: number; springRateR: number;
  damperF: number; damperR: number;
  antiRollBarF: number; antiRollBarR: number;
  camberF: number; camberR: number;
  toeF: number; toeR: number;
  rideHeight: number;
  wheelWidth: number;
}, mass: number, weightDistFront: number, cgHeight: number): SuspensionConfig {
  // Estimate wheelbase and track width from body type/platform
  const wheelbase = 2.6; // m (typical sports car)
  const trackWidth = 1.5 + vehicle.wheelWidth * 0.0254 * 0.3;

  return {
    mass,
    weightDistFront,
    cgHeight: cgHeight / 1000, // mm to m
    wheelbase,
    trackWidthFront: trackWidth,
    trackWidthRear: trackWidth * 0.98,
    springRateFront: vehicle.springRateF,
    springRateRear: vehicle.springRateR,
    damperFront: vehicle.damperF,
    damperRear: vehicle.damperR,
    arbFront: vehicle.antiRollBarF,
    arbRear: vehicle.antiRollBarR,
    camberFront: vehicle.camberF,
    camberRear: vehicle.camberR,
    toeFront: vehicle.toeF,
    toeRear: vehicle.toeR,
    rideHeight: vehicle.rideHeight,
  };
}
