// ============================================================================
// MODULAR glTF VEHICLE CONSTRUCTION SYSTEM — HARDPOINT SOLVER
// ============================================================================
// Calculates dynamic 3D world hardpoints in millimeters and Three.js meters
// for any of the 50 chassis based on wheelbase, track widths, and ride height.
// ============================================================================

import { Chassis50Definition, ChassisHardpointSpec } from '../types/vehicleConstructionTypes';

export interface SolvedChassisHardpoints {
  chassisId: string;
  wheelbaseM: number;
  trackWidthFrontM: number;
  trackWidthRearM: number;
  rideHeightM: number;
  hardpoints: Record<string, {
    positionM: [number, number, number];
    normalAxis: [number, number, number];
    allowedTypes: string[];
    description: string;
  }>;
}

/**
 * Solves exact Three.js 3D coordinates (in meters) for all hardpoints on a chassis.
 * Standard automotive coordinates: +X = Forward, +Y = Up, +Z = Right
 * Origin (0,0,0) = Front Axle Centerline at ground plane.
 */
export function solveChassisHardpoints(
  chassis: Chassis50Definition,
  customWheelbaseMm?: number,
  customTrackFrontMm?: number,
  customTrackRearMm?: number,
  customRideHeightMm?: number
): SolvedChassisHardpoints {
  const wbMm = customWheelbaseMm ?? chassis.wheelbaseMm;
  const tfMm = customTrackFrontMm ?? chassis.trackWidthFrontMm;
  const trMm = customTrackRearMm ?? chassis.trackWidthRearMm;
  const rhMm = customRideHeightMm ?? chassis.rideHeightMm;

  const wbM = wbMm / 1000;
  const halfTfM = (tfMm / 2) / 1000;
  const halfTrM = (trMm / 2) / 1000;
  const rhM = rhMm / 1000;

  const hardpointMap: Record<string, {
    positionM: [number, number, number];
    normalAxis: [number, number, number];
    allowedTypes: string[];
    description: string;
  }> = {};

  // Compute for all registered hardpoints in the chassis definition
  for (const hp of chassis.hardpoints) {
    const [relXmm, relYmm, relZmm] = hp.relativePosMm;
    
    // Scale relative positions to customized wheelbase & track
    let posX = relXmm / 1000;
    let posY = (relYmm + rhMm) / 1000;
    let posZ = relZmm / 1000;

    // Adjust rear axle relative hardpoints
    if (hp.nodeId.includes('REAR') || hp.nodeId.includes('_R')) {
      if (hp.nodeId.startsWith('SUSP_MOUNT_R')) {
        posX = -wbM;
        posZ = hp.nodeId === 'SUSP_MOUNT_RL' ? -halfTrM : halfTrM;
      }
    } else if (hp.nodeId.startsWith('SUSP_MOUNT_F')) {
      posX = 0;
      posZ = hp.nodeId === 'SUSP_MOUNT_FL' ? -halfTfM : halfTfM;
    }

    hardpointMap[hp.nodeId] = {
      positionM: [posX, posY, posZ],
      normalAxis: hp.normalAxis,
      allowedTypes: hp.allowedComponentTypes,
      description: hp.description,
    };
  }

  return {
    chassisId: chassis.id,
    wheelbaseM: wbM,
    trackWidthFrontM: tfMm / 1000,
    trackWidthRearM: trMm / 1000,
    rideHeightM: rhM,
    hardpoints: hardpointMap,
  };
}
