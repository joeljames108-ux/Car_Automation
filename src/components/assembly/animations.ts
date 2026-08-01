import { ComponentId, AssemblyPhase } from "../../sim/assemblyTypes";

export interface ComponentAnimationConfig {
  id: ComponentId;
  timings: {
    picking: number;
    traveling: number;
    aligning: number;
    inserting: number;
    locking: number;
    confirming: number;
  };
  totalDuration: number;
  rotationDegrees: number;
  vibrateOnInsert: boolean;
  flashOnLock: boolean;
  repeatCount: number; // e.g. 4x for 4 cylinders on pistons
}

export const COMPONENT_ANIMATION_PRESETS: Record<ComponentId, ComponentAnimationConfig> = {
  block: {
    id: "block",
    timings: { picking: 350, traveling: 500, aligning: 300, inserting: 400, locking: 200, confirming: 350 },
    totalDuration: 2100,
    rotationDegrees: 0,
    vibrateOnInsert: true,
    flashOnLock: true,
    repeatCount: 1,
  },
  crankshaft: {
    id: "crankshaft",
    timings: { picking: 400, traveling: 600, aligning: 350, inserting: 500, locking: 250, confirming: 400 },
    totalDuration: 2500,
    rotationDegrees: 90,
    vibrateOnInsert: true,
    flashOnLock: true,
    repeatCount: 1,
  },
  pistons: {
    id: "pistons",
    timings: { picking: 300, traveling: 450, aligning: 300, inserting: 400, locking: 200, confirming: 350 },
    totalDuration: 2000,
    rotationDegrees: 0,
    vibrateOnInsert: true,
    flashOnLock: true,
    repeatCount: 4, // Multi-piston sequence
  },
  rods: {
    id: "rods",
    timings: { picking: 300, traveling: 400, aligning: 250, inserting: 350, locking: 200, confirming: 300 },
    totalDuration: 1800,
    rotationDegrees: 15,
    vibrateOnInsert: true,
    flashOnLock: false,
    repeatCount: 4,
  },
  oil_pan: {
    id: "oil_pan",
    timings: { picking: 300, traveling: 450, aligning: 250, inserting: 300, locking: 200, confirming: 300 },
    totalDuration: 1800,
    rotationDegrees: 0,
    vibrateOnInsert: false,
    flashOnLock: false,
    repeatCount: 1,
  },
  head_gasket: {
    id: "head_gasket",
    timings: { picking: 250, traveling: 350, aligning: 200, inserting: 250, locking: 150, confirming: 250 },
    totalDuration: 1450,
    rotationDegrees: 0,
    vibrateOnInsert: false,
    flashOnLock: false,
    repeatCount: 1,
  },
  cylinder_head: {
    id: "cylinder_head",
    timings: { picking: 400, traveling: 550, aligning: 350, inserting: 450, locking: 250, confirming: 400 },
    totalDuration: 2400,
    rotationDegrees: 0,
    vibrateOnInsert: true,
    flashOnLock: true,
    repeatCount: 1,
  },
  camshaft: {
    id: "camshaft",
    timings: { picking: 300, traveling: 450, aligning: 300, inserting: 350, locking: 200, confirming: 300 },
    totalDuration: 1900,
    rotationDegrees: 180,
    vibrateOnInsert: false,
    flashOnLock: false,
    repeatCount: 1,
  },
  valves: {
    id: "valves",
    timings: { picking: 250, traveling: 350, aligning: 250, inserting: 300, locking: 150, confirming: 250 },
    totalDuration: 1550,
    rotationDegrees: 0,
    vibrateOnInsert: false,
    flashOnLock: false,
    repeatCount: 16, // 16 valve springs
  },
  intake_manifold: {
    id: "intake_manifold",
    timings: { picking: 300, traveling: 450, aligning: 300, inserting: 350, locking: 200, confirming: 300 },
    totalDuration: 1900,
    rotationDegrees: -15,
    vibrateOnInsert: false,
    flashOnLock: false,
    repeatCount: 1,
  },
  exhaust_headers: {
    id: "exhaust_headers",
    timings: { picking: 300, traveling: 450, aligning: 300, inserting: 350, locking: 200, confirming: 300 },
    totalDuration: 1900,
    rotationDegrees: 15,
    vibrateOnInsert: false,
    flashOnLock: false,
    repeatCount: 1,
  },
  turbocharger: {
    id: "turbocharger",
    timings: { picking: 450, traveling: 650, aligning: 400, inserting: 500, locking: 250, confirming: 450 },
    totalDuration: 2700,
    rotationDegrees: 45,
    vibrateOnInsert: true,
    flashOnLock: true,
    repeatCount: 1,
  },
};

export const ASSEMBLY_PHASE_ORDER: AssemblyPhase[] = [
  "picking",
  "traveling",
  "aligning",
  "inserting",
  "locking",
  "confirming",
];
