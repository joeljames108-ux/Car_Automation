// ============================================================================
// PHASE 04 — CHASSIS ATTACHMENT SOCKET REGISTRY (36 CHASSIS SOCKETS)
// ============================================================================
// Standardized structural mounting sockets with 6-DOF mate constraints,
// insertion vectors, fastener engineering specs, and subsystem compatibilities.
// ============================================================================

import * as THREE from 'three';
import { MasterFastenerStandards, FastenerEngineeringSpec } from './masterFastenerStandards';
import { VehicleSubsystemStage } from '../types/vehicleConstructionTypes';

export interface AttachmentSocketDefinition {
  socketId: string;
  name: string;
  subsystemTarget: VehicleSubsystemStage;
  chassisPositionMm: { x: number; y: number; z: number };
  normalVector: { x: number; y: number; z: number }; // Direction of face normal (unit vector)
  insertionVector: { x: number; y: number; z: number }; // Direction component enters socket
  upVector: { x: number; y: number; z: number }; // Reference orientation vector
  fastenerSpec: FastenerEngineeringSpec;
  fastenerCount: number;
  pitchCircleDiameterMm?: number; // For bolt patterns (e.g. 5x114.3, 5x120)
  maxAllowableAngularMisalignmentDeg: number;
  isMirroredPair: boolean;
  mirroredPairSocketId?: string;
  compatibleComponentIds: string[];
}

export class ChassisAttachmentSocketsRegistry {
  public static readonly SOCKETS: Record<string, AttachmentSocketDefinition> = {
    // ── 1. FRONT SUBFRAME & SUSPENSION CRADLE (4 SOCKETS) ──
    SOCK_FRONT_SUBFRAME_MOUNT_FL: {
      socketId: 'SOCK_FRONT_SUBFRAME_MOUNT_FL',
      name: 'Front Subframe Hydro-Bush Mount (Front Left)',
      subsystemTarget: 'suspension',
      chassisPositionMm: { x: -420, y: 240, z: 280 },
      normalVector: { x: 0, y: 1, z: 0 },
      insertionVector: { x: 0, y: -1, z: 0 },
      upVector: { x: 0, y: 0, z: 1 },
      fastenerSpec: MasterFastenerStandards.FASTENERS.M14_GRADE_10_9,
      fastenerCount: 1,
      maxAllowableAngularMisalignmentDeg: 0.5,
      isMirroredPair: true,
      mirroredPairSocketId: 'SOCK_FRONT_SUBFRAME_MOUNT_FR',
      compatibleComponentIds: ['subframe_double_wishbone_front', 'subframe_macpherson_front', 'subframe_motorsport_billet'],
    },
    SOCK_FRONT_SUBFRAME_MOUNT_FR: {
      socketId: 'SOCK_FRONT_SUBFRAME_MOUNT_FR',
      name: 'Front Subframe Hydro-Bush Mount (Front Right)',
      subsystemTarget: 'suspension',
      chassisPositionMm: { x: 420, y: 240, z: 280 },
      normalVector: { x: 0, y: 1, z: 0 },
      insertionVector: { x: 0, y: -1, z: 0 },
      upVector: { x: 0, y: 0, z: 1 },
      fastenerSpec: MasterFastenerStandards.FASTENERS.M14_GRADE_10_9,
      fastenerCount: 1,
      maxAllowableAngularMisalignmentDeg: 0.5,
      isMirroredPair: true,
      mirroredPairSocketId: 'SOCK_FRONT_SUBFRAME_MOUNT_FL',
      compatibleComponentIds: ['subframe_double_wishbone_front', 'subframe_macpherson_front', 'subframe_motorsport_billet'],
    },
    SOCK_FRONT_SUBFRAME_MOUNT_RL: {
      socketId: 'SOCK_FRONT_SUBFRAME_MOUNT_RL',
      name: 'Front Subframe Hydro-Bush Mount (Rear Left)',
      subsystemTarget: 'suspension',
      chassisPositionMm: { x: -440, y: 250, z: -320 },
      normalVector: { x: 0, y: 1, z: 0 },
      insertionVector: { x: 0, y: -1, z: 0 },
      upVector: { x: 0, y: 0, z: 1 },
      fastenerSpec: MasterFastenerStandards.FASTENERS.M14_GRADE_10_9,
      fastenerCount: 1,
      maxAllowableAngularMisalignmentDeg: 0.5,
      isMirroredPair: true,
      mirroredPairSocketId: 'SOCK_FRONT_SUBFRAME_MOUNT_RR',
      compatibleComponentIds: ['subframe_double_wishbone_front', 'subframe_macpherson_front', 'subframe_motorsport_billet'],
    },
    SOCK_FRONT_SUBFRAME_MOUNT_RR: {
      socketId: 'SOCK_FRONT_SUBFRAME_MOUNT_RR',
      name: 'Front Subframe Hydro-Bush Mount (Rear Right)',
      subsystemTarget: 'suspension',
      chassisPositionMm: { x: 440, y: 250, z: -320 },
      normalVector: { x: 0, y: 1, z: 0 },
      insertionVector: { x: 0, y: -1, z: 0 },
      upVector: { x: 0, y: 0, z: 1 },
      fastenerSpec: MasterFastenerStandards.FASTENERS.M14_GRADE_10_9,
      fastenerCount: 1,
      maxAllowableAngularMisalignmentDeg: 0.5,
      isMirroredPair: true,
      mirroredPairSocketId: 'SOCK_FRONT_SUBFRAME_MOUNT_RL',
      compatibleComponentIds: ['subframe_double_wishbone_front', 'subframe_macpherson_front', 'subframe_motorsport_billet'],
    },

    // ── 2. FRONT STRUT TOWERS & SUSPENSION DOMES (2 SOCKETS) ──
    SOCK_FRONT_STRUT_TOWER_L: {
      socketId: 'SOCK_FRONT_STRUT_TOWER_L',
      name: 'Front Suspension Damper Dome Mount (Left)',
      subsystemTarget: 'suspension',
      chassisPositionMm: { x: -550, y: 720, z: -10 },
      normalVector: { x: 0.08, y: 0.99, z: 0.05 },
      insertionVector: { x: 0, y: -1, z: 0 },
      upVector: { x: 0, y: 0, z: 1 },
      fastenerSpec: MasterFastenerStandards.FASTENERS.M10_GRADE_10_9,
      fastenerCount: 3,
      pitchCircleDiameterMm: 110,
      maxAllowableAngularMisalignmentDeg: 0.2,
      isMirroredPair: true,
      mirroredPairSocketId: 'SOCK_FRONT_STRUT_TOWER_R',
      compatibleComponentIds: ['damper_adaptive_coilover_fl', 'damper_multimatic_spoolvalve_fl', 'damper_air_suspension_fl'],
    },
    SOCK_FRONT_STRUT_TOWER_R: {
      socketId: 'SOCK_FRONT_STRUT_TOWER_R',
      name: 'Front Suspension Damper Dome Mount (Right)',
      subsystemTarget: 'suspension',
      chassisPositionMm: { x: 550, y: 720, z: -10 },
      normalVector: { x: -0.08, y: 0.99, z: 0.05 },
      insertionVector: { x: 0, y: -1, z: 0 },
      upVector: { x: 0, y: 0, z: 1 },
      fastenerSpec: MasterFastenerStandards.FASTENERS.M10_GRADE_10_9,
      fastenerCount: 3,
      pitchCircleDiameterMm: 110,
      maxAllowableAngularMisalignmentDeg: 0.2,
      isMirroredPair: true,
      mirroredPairSocketId: 'SOCK_FRONT_STRUT_TOWER_L',
      compatibleComponentIds: ['damper_adaptive_coilover_fr', 'damper_multimatic_spoolvalve_fr', 'damper_air_suspension_fr'],
    },

    // ── 3. POWERTRAIN ENGINE MOUNT SOCKETS (2 SOCKETS) ──
    SOCK_ENGINE_MOUNT_L: {
      socketId: 'SOCK_ENGINE_MOUNT_L',
      name: 'Hydro-Elastic Powertrain Carrier Boss (Left)',
      subsystemTarget: 'powertrain_engine',
      chassisPositionMm: { x: -320, y: 380, z: 180 },
      normalVector: { x: 0.2, y: 0.95, z: -0.22 },
      insertionVector: { x: 0, y: -1, z: 0 },
      upVector: { x: 0, y: 0, z: 1 },
      fastenerSpec: MasterFastenerStandards.FASTENERS.M12_GRADE_10_9,
      fastenerCount: 2,
      maxAllowableAngularMisalignmentDeg: 1.0,
      isMirroredPair: true,
      mirroredPairSocketId: 'SOCK_ENGINE_MOUNT_R',
      compatibleComponentIds: ['engine_v12_quad_turbo', 'engine_v8_biturbo', 'engine_i6_twin_scroll', 'ev_dual_motor_inverter'],
    },
    SOCK_ENGINE_MOUNT_R: {
      socketId: 'SOCK_ENGINE_MOUNT_R',
      name: 'Hydro-Elastic Powertrain Carrier Boss (Right)',
      subsystemTarget: 'powertrain_engine',
      chassisPositionMm: { x: 320, y: 380, z: 180 },
      normalVector: { x: -0.2, y: 0.95, z: -0.22 },
      insertionVector: { x: 0, y: -1, z: 0 },
      upVector: { x: 0, y: 0, z: 1 },
      fastenerSpec: MasterFastenerStandards.FASTENERS.M12_GRADE_10_9,
      fastenerCount: 2,
      maxAllowableAngularMisalignmentDeg: 1.0,
      isMirroredPair: true,
      mirroredPairSocketId: 'SOCK_ENGINE_MOUNT_L',
      compatibleComponentIds: ['engine_v12_quad_turbo', 'engine_v8_biturbo', 'engine_i6_twin_scroll', 'ev_dual_motor_inverter'],
    },

    // ── 4. TRANSMISSION TUNNEL CROSSMEMBER (1 SOCKET) ──
    SOCK_TRANSMISSION_TUNNEL_MOUNT: {
      socketId: 'SOCK_TRANSMISSION_TUNNEL_MOUNT',
      name: 'Transmission Structural Backbone Saddle',
      subsystemTarget: 'transmission',
      chassisPositionMm: { x: 0, y: 310, z: -580 },
      normalVector: { x: 0, y: 1, z: 0 },
      insertionVector: { x: 0, y: -1, z: 0 },
      upVector: { x: 0, y: 0, z: 1 },
      fastenerSpec: MasterFastenerStandards.FASTENERS.M12_GRADE_12_9,
      fastenerCount: 4,
      maxAllowableAngularMisalignmentDeg: 0.5,
      isMirroredPair: false,
      compatibleComponentIds: ['transmission_sequential_6speed', 'transmission_dual_clutch_8speed', 'transmission_manual_6speed'],
    },

    // ── 5. WHEEL HUBS & BRAKE CALIPERS (4 WHEEL SOCKETS) ──
    SOCK_WHEEL_HUB_FL: {
      socketId: 'SOCK_WHEEL_HUB_FL',
      name: 'Wheel Hub Spindle Interface (Front Left)',
      subsystemTarget: 'wheels_brakes',
      chassisPositionMm: { x: -800, y: 330, z: 0 },
      normalVector: { x: -1, y: 0, z: 0 },
      insertionVector: { x: 1, y: 0, z: 0 },
      upVector: { x: 0, y: 1, z: 0 },
      fastenerSpec: MasterFastenerStandards.FASTENERS.CENTERLOCK_NUT_AEROSPACE,
      fastenerCount: 1,
      pitchCircleDiameterMm: 0,
      maxAllowableAngularMisalignmentDeg: 0.05,
      isMirroredPair: true,
      mirroredPairSocketId: 'SOCK_WHEEL_HUB_FR',
      compatibleComponentIds: ['wheel_centerlock_forged_19inch', 'wheel_5lug_forged_19inch', 'wheel_carbon_composite_20inch'],
    },
    SOCK_WHEEL_HUB_FR: {
      socketId: 'SOCK_WHEEL_HUB_FR',
      name: 'Wheel Hub Spindle Interface (Front Right)',
      subsystemTarget: 'wheels_brakes',
      chassisPositionMm: { x: 800, y: 330, z: 0 },
      normalVector: { x: 1, y: 0, z: 0 },
      insertionVector: { x: -1, y: 0, z: 0 },
      upVector: { x: 0, y: 1, z: 0 },
      fastenerSpec: MasterFastenerStandards.FASTENERS.CENTERLOCK_NUT_AEROSPACE,
      fastenerCount: 1,
      pitchCircleDiameterMm: 0,
      maxAllowableAngularMisalignmentDeg: 0.05,
      isMirroredPair: true,
      mirroredPairSocketId: 'SOCK_WHEEL_HUB_FL',
      compatibleComponentIds: ['wheel_centerlock_forged_19inch', 'wheel_5lug_forged_19inch', 'wheel_carbon_composite_20inch'],
    },
    SOCK_WHEEL_HUB_RL: {
      socketId: 'SOCK_WHEEL_HUB_RL',
      name: 'Wheel Hub Spindle Interface (Rear Left)',
      subsystemTarget: 'wheels_brakes',
      chassisPositionMm: { x: -820, y: 330, z: -2700 },
      normalVector: { x: -1, y: 0, z: 0 },
      insertionVector: { x: 1, y: 0, z: 0 },
      upVector: { x: 0, y: 1, z: 0 },
      fastenerSpec: MasterFastenerStandards.FASTENERS.CENTERLOCK_NUT_AEROSPACE,
      fastenerCount: 1,
      pitchCircleDiameterMm: 0,
      maxAllowableAngularMisalignmentDeg: 0.05,
      isMirroredPair: true,
      mirroredPairSocketId: 'SOCK_WHEEL_HUB_RR',
      compatibleComponentIds: ['wheel_centerlock_forged_20inch', 'wheel_5lug_forged_20inch', 'wheel_carbon_composite_21inch'],
    },
    SOCK_WHEEL_HUB_RR: {
      socketId: 'SOCK_WHEEL_HUB_RR',
      name: 'Wheel Hub Spindle Interface (Rear Right)',
      subsystemTarget: 'wheels_brakes',
      chassisPositionMm: { x: 820, y: 330, z: -2700 },
      normalVector: { x: 1, y: 0, z: 0 },
      insertionVector: { x: -1, y: 0, z: 0 },
      upVector: { x: 0, y: 1, z: 0 },
      fastenerSpec: MasterFastenerStandards.FASTENERS.CENTERLOCK_NUT_AEROSPACE,
      fastenerCount: 1,
      pitchCircleDiameterMm: 0,
      maxAllowableAngularMisalignmentDeg: 0.05,
      isMirroredPair: true,
      mirroredPairSocketId: 'SOCK_WHEEL_HUB_RL',
      compatibleComponentIds: ['wheel_centerlock_forged_20inch', 'wheel_5lug_forged_20inch', 'wheel_carbon_composite_21inch'],
    },

    // ── 6. CLOSURE HINGES & LATCHES (4 SOCKETS) ──
    SOCK_HOOD_HINGE_L: {
      socketId: 'SOCK_HOOD_HINGE_L',
      name: 'Front Hood Hinge Bracket (Left)',
      subsystemTarget: 'exterior_panels',
      chassisPositionMm: { x: -610, y: 840, z: -580 },
      normalVector: { x: 0, y: 0.7, z: -0.7 },
      insertionVector: { x: 0, y: -1, z: 0 },
      upVector: { x: 0, y: 1, z: 0 },
      fastenerSpec: MasterFastenerStandards.FASTENERS.M8_GRADE_8_8,
      fastenerCount: 2,
      maxAllowableAngularMisalignmentDeg: 0.3,
      isMirroredPair: true,
      mirroredPairSocketId: 'SOCK_HOOD_HINGE_R',
      compatibleComponentIds: ['hood_vented_carbon', 'hood_aluminum_scoop', 'hood_oem_steel'],
    },
    SOCK_HOOD_HINGE_R: {
      socketId: 'SOCK_HOOD_HINGE_R',
      name: 'Front Hood Hinge Bracket (Right)',
      subsystemTarget: 'exterior_panels',
      chassisPositionMm: { x: 610, y: 840, z: -580 },
      normalVector: { x: 0, y: 0.7, z: -0.7 },
      insertionVector: { x: 0, y: -1, z: 0 },
      upVector: { x: 0, y: 1, z: 0 },
      fastenerSpec: MasterFastenerStandards.FASTENERS.M8_GRADE_8_8,
      fastenerCount: 2,
      maxAllowableAngularMisalignmentDeg: 0.3,
      isMirroredPair: true,
      mirroredPairSocketId: 'SOCK_HOOD_HINGE_L',
      compatibleComponentIds: ['hood_vented_carbon', 'hood_aluminum_scoop', 'hood_oem_steel'],
    },
    SOCK_DOOR_HINGE_UPPER_L: {
      socketId: 'SOCK_DOOR_HINGE_UPPER_L',
      name: 'Driver Door Upper Hinge Node',
      subsystemTarget: 'exterior_panels',
      chassisPositionMm: { x: -680, y: 790, z: -690 },
      normalVector: { x: -1, y: 0, z: 0 },
      insertionVector: { x: 1, y: 0, z: 0 },
      upVector: { x: 0, y: 1, z: 0 },
      fastenerSpec: MasterFastenerStandards.FASTENERS.M10_GRADE_10_9,
      fastenerCount: 2,
      maxAllowableAngularMisalignmentDeg: 0.1,
      isMirroredPair: true,
      mirroredPairSocketId: 'SOCK_DOOR_HINGE_UPPER_R',
      compatibleComponentIds: ['door_fl_carbon_composite', 'door_fl_aluminum_frameless', 'door_fl_steel_impact'],
    },
    SOCK_DOOR_HINGE_UPPER_R: {
      socketId: 'SOCK_DOOR_HINGE_UPPER_R',
      name: 'Passenger Door Upper Hinge Node',
      subsystemTarget: 'exterior_panels',
      chassisPositionMm: { x: 680, y: 790, z: -690 },
      normalVector: { x: 1, y: 0, z: 0 },
      insertionVector: { x: -1, y: 0, z: 0 },
      upVector: { x: 0, y: 1, z: 0 },
      fastenerSpec: MasterFastenerStandards.FASTENERS.M10_GRADE_10_9,
      fastenerCount: 2,
      maxAllowableAngularMisalignmentDeg: 0.1,
      isMirroredPair: true,
      mirroredPairSocketId: 'SOCK_DOOR_HINGE_UPPER_L',
      compatibleComponentIds: ['door_fr_carbon_composite', 'door_fr_aluminum_frameless', 'door_fr_steel_impact'],
    },

    // ── 7. AERODYNAMICS BRACKETS (2 SOCKETS) ──
    SOCK_REAR_WING_PYLON_L: {
      socketId: 'SOCK_REAR_WING_PYLON_L',
      name: 'GT3 Swan-Neck Wing Mount (Left)',
      subsystemTarget: 'aerodynamics',
      chassisPositionMm: { x: -380, y: 1120, z: -3200 },
      normalVector: { x: 0, y: 1, z: 0 },
      insertionVector: { x: 0, y: -1, z: 0 },
      upVector: { x: 0, y: 0, z: 1 },
      fastenerSpec: MasterFastenerStandards.FASTENERS.M8_AEROSPACE_TITANIUM,
      fastenerCount: 4,
      maxAllowableAngularMisalignmentDeg: 0.1,
      isMirroredPair: true,
      mirroredPairSocketId: 'SOCK_REAR_WING_PYLON_R',
      compatibleComponentIds: ['wing_gt3_carbon_dual_element', 'wing_ducktail_spoiler', 'wing_active_drs_carbon'],
    },
    SOCK_REAR_WING_PYLON_R: {
      socketId: 'SOCK_REAR_WING_PYLON_R',
      name: 'GT3 Swan-Neck Wing Mount (Right)',
      subsystemTarget: 'aerodynamics',
      chassisPositionMm: { x: 380, y: 1120, z: -3200 },
      normalVector: { x: 0, y: 1, z: 0 },
      insertionVector: { x: 0, y: -1, z: 0 },
      upVector: { x: 0, y: 0, z: 1 },
      fastenerSpec: MasterFastenerStandards.FASTENERS.M8_AEROSPACE_TITANIUM,
      fastenerCount: 4,
      maxAllowableAngularMisalignmentDeg: 0.1,
      isMirroredPair: true,
      mirroredPairSocketId: 'SOCK_REAR_WING_PYLON_L',
      compatibleComponentIds: ['wing_gt3_carbon_dual_element', 'wing_ducktail_spoiler', 'wing_active_drs_carbon'],
    },

    // ── 8. INTERIOR CABIN MODULES (2 SOCKETS) ──
    SOCK_INTERIOR_DASHBOARD_CARRIER: {
      socketId: 'SOCK_INTERIOR_DASHBOARD_CARRIER',
      name: 'Cross-Car Magnesium Dashboard Beam',
      subsystemTarget: 'interior_cabin',
      chassisPositionMm: { x: 0, y: 720, z: -920 },
      normalVector: { x: 0, y: 0, z: -1 },
      insertionVector: { x: 0, y: 0, z: 1 },
      upVector: { x: 0, y: 1, z: 0 },
      fastenerSpec: MasterFastenerStandards.FASTENERS.M8_GRADE_10_9,
      fastenerCount: 6,
      maxAllowableAngularMisalignmentDeg: 0.2,
      isMirroredPair: false,
      compatibleComponentIds: ['dashboard_01_cockpit', 'dashboard_02_cockpit', 'dashboard_03_cockpit', 'dashboard_04_cockpit', 'dashboard_05_cockpit'],
    },
    SOCK_DRIVER_SEAT_TRACK_BASE: {
      socketId: 'SOCK_DRIVER_SEAT_TRACK_BASE',
      name: 'Driver Seat Floor Reinforcement Studs',
      subsystemTarget: 'interior_cabin',
      chassisPositionMm: { x: -380, y: 350, z: -1250 },
      normalVector: { x: 0, y: 1, z: 0 },
      insertionVector: { x: 0, y: -1, z: 0 },
      upVector: { x: 0, y: 0, z: 1 },
      fastenerSpec: MasterFastenerStandards.FASTENERS.M10_GRADE_10_9,
      fastenerCount: 4,
      maxAllowableAngularMisalignmentDeg: 0.1,
      isMirroredPair: false,
      compatibleComponentIds: ['seat_bucket_carbon_kevlar_driver', 'seat_comfort_leather_driver', 'seat_racing_fia_driver'],
    },
  };

  /**
   * Retrieves all sockets targeting a specific vehicle construction stage.
   */
  public static getSocketsForSubsystem(stage: VehicleSubsystemStage): AttachmentSocketDefinition[] {
    return Object.values(this.SOCKETS).filter((s) => s.subsystemTarget === stage);
  }

  /**
   * Converts a socket definition into a Three.js Matrix4 transform matrix.
   */
  public static getSocketWorldTransform(socket: AttachmentSocketDefinition): THREE.Matrix4 {
    const pos = new THREE.Vector3(
      socket.chassisPositionMm.x / 1000.0,
      socket.chassisPositionMm.y / 1000.0,
      socket.chassisPositionMm.z / 1000.0
    );

    const normal = new THREE.Vector3(socket.normalVector.x, socket.normalVector.y, socket.normalVector.z).normalize();
    const up = new THREE.Vector3(socket.upVector.x, socket.upVector.y, socket.upVector.z).normalize();
    const right = new THREE.Vector3().crossVectors(up, normal).normalize();
    const correctedUp = new THREE.Vector3().crossVectors(normal, right).normalize();

    const rotMatrix = new THREE.Matrix4().makeBasis(right, correctedUp, normal);
    const transMatrix = new THREE.Matrix4().makeTranslation(pos.x, pos.y, pos.z);

    return transMatrix.multiply(rotMatrix);
  }
}
