// ENGINE RUNTIME ANIMATION PHYSICS ENGINE

export const V12_FIRING_ORDER = [0,120,240,60,180,300,60,180,300,0,120,240];
export const V8_FIRING_ORDER = [0,180,270,90,45,225,315,135];
export const I4_FIRING_ORDER = [0,540,180,360];
export type EngineType = "V12"|"V8_FLAT"|"V8_CROSS"|"I4"|"FLAT6"|"V6"|"V10";

export function getFiringOrderForType(type: EngineType): number[] {
  switch(type) {
    case "V12": return V12_FIRING_ORDER;
    case "V8_FLAT": return [0,180,180,0,270,90,90,270];
    case "V8_CROSS": return V8_FIRING_ORDER;
    case "I4": return I4_FIRING_ORDER;
    case "FLAT6": return [0,240,480,240,480,0];
    case "V6": return [0,120,240,60,180,300];
    case "V10": return [0,144,288,72,216,360,144,288,72,216];
    default: return V12_FIRING_ORDER;
  }
}

export interface PistonKinematicsConfig {
  strokeMm: number; conRodLengthMm: number; compressionRatio: number;
  boreMm: number; cylinderSpacingMm: number; bankAngle: number;
}

export const PISTON_CONFIGS: Record<EngineType, PistonKinematicsConfig> = {
  V12: { strokeMm:80, conRodLengthMm:144, compressionRatio:13.5, boreMm:73, cylinderSpacingMm:90, bankAngle:60 },
  V8_FLAT: { strokeMm:86, conRodLengthMm:152.5, compressionRatio:12.5, boreMm:94, cylinderSpacingMm:110, bankAngle:90 },
  V8_CROSS: { strokeMm:92, conRodLengthMm:160, compressionRatio:11.5, boreMm:101.6, cylinderSpacingMm:115, bankAngle:90 },
  I4: { strokeMm:86, conRodLengthMm:145, compressionRatio:10.5, boreMm:86, cylinderSpacingMm:96, bankAngle:0 },
  FLAT6: { strokeMm:76.4, conRodLengthMm:131, compressionRatio:12.7, boreMm:102, cylinderSpacingMm:100, bankAngle:180 },
  V6: { strokeMm:78, conRodLengthMm:140, compressionRatio:11.0, boreMm:86, cylinderSpacingMm:96, bankAngle:60 },
  V10: { strokeMm:84, conRodLengthMm:148, compressionRatio:12.0, boreMm:85, cylinderSpacingMm:94, bankAngle:72 },
};

export function calculatePistonDisplacement(crankAngleDeg: number, config: PistonKinematicsConfig): number {
  const R = config.strokeMm / 2;
  const L = config.conRodLengthMm;
  const theta = (crankAngleDeg * Math.PI) / 180;
  return R * Math.cos(theta) + Math.sqrt(L * L - R * R * Math.sin(theta) * Math.sin(theta)) - (R + L);
}

export function calculateConRodAngle(crankAngleDeg: number, config: PistonKinematicsConfig): number {
  const R = config.strokeMm / 2;
  const L = config.conRodLengthMm;
  return Math.asin((R * Math.sin((crankAngleDeg * Math.PI) / 180)) / L);
}

export interface ValveTimingConfig {
  intakeOpenDeg: number; intakeCloseDeg: number;
  exhaustOpenDeg: number; exhaustCloseDeg: number;
  maxLiftMm: number; duration: number;
}

export const DEFAULT_VALVE_TIMING: ValveTimingConfig = {
  intakeOpenDeg:30, intakeCloseDeg:60, exhaustOpenDeg:55, exhaustCloseDeg:25, maxLiftMm:10.5, duration:270
};

export function calculateValveLift(camAngleDeg: number, timing: ValveTimingConfig = DEFAULT_VALVE_TIMING): number {
  const n = ((camAngleDeg % 720) + 720) % 720;
  const intakeOpen = 720 - timing.intakeOpenDeg;
  const exhaustOpen = 360 - timing.exhaustOpenDeg;
  const exhaustClose = 360 + timing.duration - timing.exhaustOpenDeg;
  let lift = 0;
  if (n >= intakeOpen || n <= timing.duration - timing.intakeOpenDeg) {
    const span = n >= intakeOpen ? n - intakeOpen : (720 - intakeOpen) + n;
    lift = timing.maxLiftMm * (1 - Math.cos((span / timing.duration) * Math.PI)) / 2;
  }
  if (n >= exhaustOpen && n <= exhaustClose) {
    const span = n - exhaustOpen;
    const exhLift = timing.maxLiftMm * (1 - Math.cos((span / timing.duration) * Math.PI)) / 2;
    lift = Math.max(lift, exhLift);
  }
  return lift;
}

export interface CrankshaftState {
  angleDeg: number; rpm: number; targetRpm: number;
  angularVelocity: number; vibrationAmplitude: number; exhaustPulsePhase: number;
}

export function createInitialCrankshaftState(): CrankshaftState {
  return { angleDeg:0, rpm:0, targetRpm:0, angularVelocity:0, vibrationAmplitude:0, exhaustPulsePhase:0 };
}

export function advanceCrankshaft(state: CrankshaftState, deltaTimeSec: number, smooth: number = 3.0): CrankshaftState {
  const diff = state.targetRpm - state.rpm;
  const newRpm = state.rpm + diff * Math.min(1, smooth * deltaTimeSec);
  const angVel = newRpm * 6;
  let newAngle = (state.angleDeg + angVel * deltaTimeSec) % 720;
  if (newAngle < 0) newAngle += 720;
  const rf = newRpm / 4000;
  return { angleDeg:newAngle, rpm:newRpm, targetRpm:state.targetRpm, angularVelocity:angVel, vibrationAmplitude:rf*rf*0.0008, exhaustPulsePhase:(newAngle*Math.PI)/180 };
}

export function getCamshaftAngle(crankAngleDeg: number, bank: "intake"|"exhaust"): number {
  return bank === "exhaust" ? crankAngleDeg / 2 + 360 : crankAngleDeg / 2;
}

export interface TurbochargerState {
  turbineSpeedRpm: number; compressorSpeedRpm: number;
  boostPressureBar: number; wastegateOpen: boolean;
  exhaustGasTempC: number; spoolFactor: number;
}

export function createTurbochargerState(): TurbochargerState {
  return { turbineSpeedRpm:0, compressorSpeedRpm:0, boostPressureBar:0, wastegateOpen:false, exhaustGasTempC:20, spoolFactor:0 };
}

export function advanceTurbocharger(state: TurbochargerState, engineRpm: number, throttle: number, dt: number): TurbochargerState {
  const energy = engineRpm * throttle / 8000;
  const targetSpool = Math.min(1, energy * 1.2);
  const rate = targetSpool > state.spoolFactor ? 0.8 : 2.5;
  const newSpool = state.spoolFactor + (targetSpool - state.spoolFactor) * rate * dt;
  const newTurbine = state.turbineSpeedRpm + (newSpool * 150000 - state.turbineSpeedRpm) * 4 * dt;
  const maxBoost = 2.5;
  const targetBoost = newSpool * maxBoost * throttle;
  const newBoost = state.boostPressureBar + (targetBoost - state.boostPressureBar) * 3 * dt;
  return {
    turbineSpeedRpm: newTurbine, compressorSpeedRpm: newTurbine,
    boostPressureBar: newBoost, wastegateOpen: newBoost > maxBoost * 0.95,
    exhaustGasTempC: 20 + engineRpm * 0.08 + newBoost * 200,
    spoolFactor: newSpool,
  };
}

export interface EngineVibration {
  primaryX: number; primaryY: number; secondaryX: number; secondaryY: number; totalAmplitude: number;
}

export function calculateEngineVibration(crankAngleDeg: number, rpm: number, engineType: EngineType): EngineVibration {
  const theta = (crankAngleDeg * Math.PI) / 180;
  const base = (rpm / 8000) * (rpm / 8000) * 0.001;
  const bf = engineType === "V12" ? 0.05 : engineType === "I4" ? 0.6 : 0.25;
  const sf = engineType === "I4" ? 0.5 : 0.05;
  return {
    primaryX: Math.sin(theta) * base * bf,
    primaryY: Math.cos(theta) * base * bf * 0.8,
    secondaryX: Math.sin(2 * theta) * base * sf,
    secondaryY: Math.cos(2 * theta) * base * sf * 0.6,
    totalAmplitude: base * bf,
  };
}

export interface EngineRuntimeAnimationState {
  crank: CrankshaftState; turbo: TurbochargerState;
  engineType: EngineType; isRunning: boolean;
  throttlePosition: number; timeRunning: number;
}

export function createRuntimeState(engineType: EngineType = "V12"): EngineRuntimeAnimationState {
  return {
    crank: createInitialCrankshaftState(), turbo: createTurbochargerState(),
    engineType, isRunning: false, throttlePosition: 0.5, timeRunning: 0,
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
