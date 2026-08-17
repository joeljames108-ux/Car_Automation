// ============================================================================
// MODULAR glTF VEHICLE CONSTRUCTION SYSTEM — ATTACHMENT ENGINE
// ============================================================================
// Validates physical compatibility and computes exact 3D transformations
// for attaching any modular component to its parent chassis hardpoint.
// ============================================================================

import {
  ModularComponentMeta,
  Chassis50Definition,
  VehicleBodyType,
  AttachmentTransformResult,
} from '../types/vehicleConstructionTypes';
import { solveChassisHardpoints } from './chassisHardpointSolver';

export class ModularVehicleAttachmentEngine {
  /**
   * Validates whether a component can be physically attached to a chassis & body type.
   */
  public static isComponentCompatible(
    component: ModularComponentMeta,
    chassis: Chassis50Definition,
    bodyType: VehicleBodyType
  ): { compatible: boolean; reason?: string } {
    // 1. Check Body Type compatibility
    if (component.compatibleBodyTypes.length > 0 && !component.compatibleBodyTypes.includes(bodyType)) {
      return {
        compatible: false,
        reason: `Component ${component.name} is not compatible with ${bodyType} body architecture.`,
      };
    }

    // 2. Check Specific Chassis ID compatibility (if restricted)
    if (component.compatibleChassisIds.length > 0 && !component.compatibleChassisIds.includes(chassis.id)) {
      return {
        compatible: false,
        reason: `Component ${component.name} requires chassis platform ${component.compatibleChassisIds.join(', ')}.`,
      };
    }

    // 3. Check Parent Hardpoint existence on Chassis
    const hardpoint = chassis.hardpoints.find((h) => h.nodeId === component.parentAttachmentNodeId);
    if (!hardpoint && component.parentAttachmentNodeId !== 'CHASSIS_ROOT') {
      return {
        compatible: false,
        reason: `Chassis ${chassis.id} does not provide required attachment hardpoint ${component.parentAttachmentNodeId}.`,
      };
    }

    // 4. Check Subsystem type permission on Hardpoint
    if (hardpoint && !hardpoint.allowedComponentTypes.includes(component.subsystem)) {
      return {
        compatible: false,
        reason: `Hardpoint ${hardpoint.nodeId} does not permit ${component.subsystem} subsystem attachments.`,
      };
    }

    return { compatible: true };
  }

  /**
   * Solves world transform for a component attached to a chassis.
   */
  public static solveAttachmentTransform(
    component: ModularComponentMeta,
    chassis: Chassis50Definition,
    customWheelbaseMm?: number,
    customTrackFrontMm?: number,
    customTrackRearMm?: number,
    customRideHeightMm?: number
  ): AttachmentTransformResult {
    const solved = solveChassisHardpoints(
      chassis,
      customWheelbaseMm,
      customTrackFrontMm,
      customTrackRearMm,
      customRideHeightMm
    );

    const hp = solved.hardpoints[component.parentAttachmentNodeId];

    if (!hp && component.parentAttachmentNodeId !== 'CHASSIS_ROOT') {
      return {
        worldPosition: [0, 0, 0],
        worldRotation: [0, 0, 0, 1],
        worldScale: [1, 1, 1],
        isValid: false,
        errorMessage: `Target attachment node ${component.parentAttachmentNodeId} not found on chassis ${chassis.id}.`,
      };
    }

    const basePos = hp ? hp.positionM : [0, 0, 0];
    const offset = component.localOffsetMeters;

    const worldPos: [number, number, number] = [
      basePos[0] + offset[0],
      basePos[1] + offset[1],
      basePos[2] + offset[2],
    ];

    // Euler to Quaternion [0, 0, 0, 1]
    const worldRot: [number, number, number, number] = [0, 0, 0, 1];

    return {
      worldPosition: worldPos,
      worldRotation: worldRot,
      worldScale: [1, 1, 1],
      isValid: true,
    };
  }
}
