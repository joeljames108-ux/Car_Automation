import { VehicleComponentId } from "../../sim/vehicleAssemblyTypes";
import { AssemblyPhase } from "../../sim/assemblyTypes";

export interface ComponentAnimationConfig {
  id: VehicleComponentId;
  timings: Record<Exclude<AssemblyPhase, "idle" | "complete">, number>;
  totalDuration: number;
  rotationDegrees?: number;
  vibrateOnInsert?: boolean;
  flashOnLock?: boolean;
  repeatCount?: number;
  springStiffness?: number;
  springDamping?: number;
  springMass?: number;
  arcControlPoints?: { x: number; y: number };
}

export const VEHICLE_COMPONENT_ANIMATION_PRESETS: Record<VehicleComponentId, ComponentAnimationConfig> = {
  chassis_frame: {
    id: "chassis_frame",
    timings: { picking: 350, traveling: 500, aligning: 300, inserting: 400, locking: 250, confirming: 350 },
    totalDuration: 2150,
    rotationDegrees: 0,
    vibrateOnInsert: true,
    flashOnLock: true,
    repeatCount: 1,
    springStiffness: 120,
    springDamping: 14,
    springMass: 3.0,
    arcControlPoints: { x: 0, y: -100 },
  },
  engine_bay: {
    id: "engine_bay",
    timings: { picking: 400, traveling: 600, aligning: 350, inserting: 450, locking: 300, confirming: 400 },
    totalDuration: 2500,
    rotationDegrees: -15,
    vibrateOnInsert: true,
    flashOnLock: true,
    repeatCount: 1,
    springStiffness: 110,
    springDamping: 15,
    springMass: 2.8,
    arcControlPoints: { x: -80, y: -50 },
  },
  transmission: {
    id: "transmission",
    timings: { picking: 300, traveling: 450, aligning: 250, inserting: 350, locking: 200, confirming: 300 },
    totalDuration: 1850,
    rotationDegrees: 10,
    vibrateOnInsert: false,
    flashOnLock: true,
    repeatCount: 1,
    springStiffness: 150,
    springDamping: 11,
    springMass: 1.8,
    arcControlPoints: { x: 0, y: 80 },
  },
  exhaust_system: {
    id: "exhaust_system",
    timings: { picking: 250, traveling: 400, aligning: 250, inserting: 300, locking: 200, confirming: 250 },
    totalDuration: 1650,
    rotationDegrees: 5,
    vibrateOnInsert: false,
    flashOnLock: true,
    repeatCount: 1,
    springStiffness: 160,
    springDamping: 10,
    springMass: 1.2,
    arcControlPoints: { x: 90, y: 60 },
  },
  suspension_front: {
    id: "suspension_front",
    timings: { picking: 300, traveling: 450, aligning: 300, inserting: 350, locking: 200, confirming: 300 },
    totalDuration: 1900,
    rotationDegrees: -20,
    vibrateOnInsert: true,
    flashOnLock: true,
    repeatCount: 1,
    springStiffness: 140,
    springDamping: 12,
    springMass: 1.5,
    arcControlPoints: { x: -120, y: -40 },
  },
  suspension_rear: {
    id: "suspension_rear",
    timings: { picking: 300, traveling: 450, aligning: 300, inserting: 350, locking: 200, confirming: 300 },
    totalDuration: 1900,
    rotationDegrees: 20,
    vibrateOnInsert: true,
    flashOnLock: true,
    repeatCount: 1,
    springStiffness: 140,
    springDamping: 12,
    springMass: 1.5,
    arcControlPoints: { x: 120, y: 40 },
  },
  brakes: {
    id: "brakes",
    timings: { picking: 250, traveling: 350, aligning: 200, inserting: 300, locking: 150, confirming: 250 },
    totalDuration: 1500,
    rotationDegrees: 45,
    vibrateOnInsert: false,
    flashOnLock: true,
    repeatCount: 1,
    springStiffness: 180,
    springDamping: 9,
    springMass: 0.9,
    arcControlPoints: { x: 0, y: -90 },
  },
  wheels_tires: {
    id: "wheels_tires",
    timings: { picking: 250, traveling: 400, aligning: 200, inserting: 300, locking: 200, confirming: 250 },
    totalDuration: 1600,
    rotationDegrees: 90,
    vibrateOnInsert: true,
    flashOnLock: true,
    repeatCount: 1,
    springStiffness: 170,
    springDamping: 10,
    springMass: 1.4,
    arcControlPoints: { x: -140, y: 60 },
  },
  aero_package: {
    id: "aero_package",
    timings: { picking: 300, traveling: 500, aligning: 300, inserting: 400, locking: 250, confirming: 300 },
    totalDuration: 2050,
    rotationDegrees: -5,
    vibrateOnInsert: false,
    flashOnLock: true,
    repeatCount: 1,
    springStiffness: 130,
    springDamping: 13,
    springMass: 1.6,
    arcControlPoints: { x: 140, y: -70 },
  },
  electronics_ecu: {
    id: "electronics_ecu",
    timings: { picking: 200, traveling: 300, aligning: 200, inserting: 250, locking: 150, confirming: 200 },
    totalDuration: 1300,
    rotationDegrees: 0,
    vibrateOnInsert: false,
    flashOnLock: true,
    repeatCount: 1,
    springStiffness: 200,
    springDamping: 8,
    springMass: 0.6,
    arcControlPoints: { x: 50, y: -90 },
  },
};
