// ============================================================================
// 60° V12 RACING ENGINE & TRANSAXLE — 3D ATTACHMENT POINT MASTER MAP
// ============================================================================
// Defines physically accurate 3D coordinates, vectors, angles, and kinematic
// constraints for every mounting point, socket, and mechanical interface across
// the 60° V12 racing powertrain assembly.
//
// Baseline Engine Architecture:
// - V-Angle: 60° (Bank 1 Left tilted +30°, Bank 2 Right tilted -30°)
// - Bore: 88.0 mm (0.088 m)
// - Stroke: 92.8 mm (0.0928 m)
// - Bore Pitch / Spacing: 108.0 mm (0.108 m)
// - Bank Stagger Offset: 15.0 mm (0.015 m) for side-by-side connecting rod journals
// - Deck Height: 220.0 mm (0.220 m)
// - Connecting Rod Center-to-Center Length: 140.0 mm (0.140 m)
// - Main Bearing Journal Diameter: 68.0 mm (0.068 m)
// - Crankpin Journal Diameter: 48.0 mm (0.048 m)
// ============================================================================

import type {
  AttachmentPoint3D,
  Engine3DComponentType,
  AttachmentCategory3D,
  BankSide3D,
  Vector3D,
  Euler3D,
} from '../types';
import { VectorMath, EulerMath } from '../types';

// ============================================================================
// 1. ENGINE GEOMETRY CONSTANTS & DERIVATION PARAMETERS
// ============================================================================

export const V12_PHYSICAL_SPECS = {
  vAngleDeg: 60,
  vAngleRad: (60 * Math.PI) / 180,
  bank1TiltDeg: -30,  // Tilted towards +Y
  bank1TiltRad: (-30 * Math.PI) / 180,
  bank2TiltDeg: 30,   // Tilted towards -Y
  bank2TiltRad: (30 * Math.PI) / 180,
  numCylinders: 12,
  cylindersPerBank: 6,
  boreMm: 88.0,
  boreM: 0.088,
  strokeMm: 92.8,
  strokeM: 0.0928,
  borePitchMm: 108.0,
  borePitchM: 0.108,
  bankStaggerMm: 15.0,
  bankStaggerM: 0.015,
  deckHeightMm: 220.0,
  deckHeightM: 0.220,
  connectingRodLengthMm: 140.0,
  connectingRodLengthM: 0.140,
  crankshaftLengthMm: 680.0,
  crankshaftLengthM: 0.680,
  blockLengthMm: 640.0,
  blockLengthM: 0.640,
  blockWidthMm: 420.0,
  blockWidthM: 0.420,
  blockHeightMm: 340.0,
  blockHeightM: 0.340,
  mainBearingCount: 7,
  crankpinCount: 6,
  firingOrder: [1, 12, 5, 8, 3, 10, 6, 7, 2, 11, 4, 9] as const,
};

// ============================================================================
// 2. MATHEMATICAL POSITION DERIVATION HELPERS
// ============================================================================

/**
 * Calculates the exact 3D center position of a cylinder bore in engine-local coordinates.
 * @param bankSide 'left' (Bank 1, odd cylinders 1-11) or 'right' (Bank 2, even cylinders 2-12)
 * @param indexInBank 0 to 5 (cylinder 1 to 6 within that bank)
 * @param elevationOffset Offset along the cylinder bore axis from the deck plane
 */
export function calculateCylinderBorePosition(
  bankSide: 'left' | 'right',
  indexInBank: number,
  elevationOffset: number = 0
): Vector3D {
  const isLeft = bankSide === 'left';
  const startX = -0.27; // Center of cylinder 1 along engine X axis (front-to-back)
  const pitch = V12_PHYSICAL_SPECS.borePitchM;
  const stagger = isLeft ? 0 : V12_PHYSICAL_SPECS.bankStaggerM;

  const posX = startX + indexInBank * pitch + stagger;
  const bankAngle = isLeft ? V12_PHYSICAL_SPECS.bank1TiltRad : V12_PHYSICAL_SPECS.bank2TiltRad;
  
  // Base deck plane coordinates
  const baseCenterY = isLeft ? 0.11 : -0.11;
  const baseCenterZ = 0.22;

  // Apply elevation offset along cylinder bore normal
  const normalY = Math.sin(bankAngle);
  const normalZ = Math.cos(bankAngle);

  return {
    x: posX,
    y: baseCenterY + normalY * elevationOffset,
    z: baseCenterZ + normalZ * elevationOffset,
  };
}

/**
 * Calculates rotation Euler angles for a cylinder bank.
 */
export function getBankRotation(bankSide: 'left' | 'right'): Euler3D {
  return {
    x: bankSide === 'left' ? V12_PHYSICAL_SPECS.bank1TiltRad : V12_PHYSICAL_SPECS.bank2TiltRad,
    y: 0,
    z: 0,
    order: 'XYZ',
  };
}

// ============================================================================
// 3. ENGINE BLOCK MASTER ATTACHMENT MAP
// ============================================================================

/**
 * Complete list of attachment sockets located on the V12 Engine Block & Crankcase.
 */
export const V12_ENGINE_BLOCK_ATTACHMENTS: AttachmentPoint3D[] = [
  // ─── 12 Piston Cylinder Bore Sockets (Bank 1 Left: 1,3,5,7,9,11 | Bank 2 Right: 2,4,6,8,10,12) ───
  // Bank 1 (Left, Odd cylinders)
  {
    id: 'Piston_01_Mount',
    position: calculateCylinderBorePosition('left', 0),
    rotation: getBankRotation('left'),
    category: 'piston_cylinder_bore',
    acceptsType: 'piston',
    occupied: false,
    bankSide: 'left',
    cylinderIndex: 1,
    snappingToleranceRadiusMm: 12,
  },
  {
    id: 'Piston_03_Mount',
    position: calculateCylinderBorePosition('left', 1),
    rotation: getBankRotation('left'),
    category: 'piston_cylinder_bore',
    acceptsType: 'piston',
    occupied: false,
    bankSide: 'left',
    cylinderIndex: 3,
    snappingToleranceRadiusMm: 12,
  },
  {
    id: 'Piston_05_Mount',
    position: calculateCylinderBorePosition('left', 2),
    rotation: getBankRotation('left'),
    category: 'piston_cylinder_bore',
    acceptsType: 'piston',
    occupied: false,
    bankSide: 'left',
    cylinderIndex: 5,
    snappingToleranceRadiusMm: 12,
  },
  {
    id: 'Piston_07_Mount',
    position: calculateCylinderBorePosition('left', 3),
    rotation: getBankRotation('left'),
    category: 'piston_cylinder_bore',
    acceptsType: 'piston',
    occupied: false,
    bankSide: 'left',
    cylinderIndex: 7,
    snappingToleranceRadiusMm: 12,
  },
  {
    id: 'Piston_09_Mount',
    position: calculateCylinderBorePosition('left', 4),
    rotation: getBankRotation('left'),
    category: 'piston_cylinder_bore',
    acceptsType: 'piston',
    occupied: false,
    bankSide: 'left',
    cylinderIndex: 9,
    snappingToleranceRadiusMm: 12,
  },
  {
    id: 'Piston_11_Mount',
    position: calculateCylinderBorePosition('left', 5),
    rotation: getBankRotation('left'),
    category: 'piston_cylinder_bore',
    acceptsType: 'piston',
    occupied: false,
    bankSide: 'left',
    cylinderIndex: 11,
    snappingToleranceRadiusMm: 12,
  },

  // Bank 2 (Right, Even cylinders, staggered +15mm along X)
  {
    id: 'Piston_02_Mount',
    position: calculateCylinderBorePosition('right', 0),
    rotation: getBankRotation('right'),
    category: 'piston_cylinder_bore',
    acceptsType: 'piston',
    occupied: false,
    bankSide: 'right',
    cylinderIndex: 2,
    snappingToleranceRadiusMm: 12,
  },
  {
    id: 'Piston_04_Mount',
    position: calculateCylinderBorePosition('right', 1),
    rotation: getBankRotation('right'),
    category: 'piston_cylinder_bore',
    acceptsType: 'piston',
    occupied: false,
    bankSide: 'right',
    cylinderIndex: 4,
    snappingToleranceRadiusMm: 12,
  },
  {
    id: 'Piston_06_Mount',
    position: calculateCylinderBorePosition('right', 2),
    rotation: getBankRotation('right'),
    category: 'piston_cylinder_bore',
    acceptsType: 'piston',
    occupied: false,
    bankSide: 'right',
    cylinderIndex: 6,
    snappingToleranceRadiusMm: 12,
  },
  {
    id: 'Piston_08_Mount',
    position: calculateCylinderBorePosition('right', 3),
    rotation: getBankRotation('right'),
    category: 'piston_cylinder_bore',
    acceptsType: 'piston',
    occupied: false,
    bankSide: 'right',
    cylinderIndex: 8,
    snappingToleranceRadiusMm: 12,
  },
  {
    id: 'Piston_10_Mount',
    position: calculateCylinderBorePosition('right', 4),
    rotation: getBankRotation('right'),
    category: 'piston_cylinder_bore',
    acceptsType: 'piston',
    occupied: false,
    bankSide: 'right',
    cylinderIndex: 10,
    snappingToleranceRadiusMm: 12,
  },
  {
    id: 'Piston_12_Mount',
    position: calculateCylinderBorePosition('right', 5),
    rotation: getBankRotation('right'),
    category: 'piston_cylinder_bore',
    acceptsType: 'piston',
    occupied: false,
    bankSide: 'right',
    cylinderIndex: 12,
    snappingToleranceRadiusMm: 12,
  },

  // ─── Crankshaft Main Bearing Journal Line ───
  {
    id: 'Crankshaft_Mount',
    position: { x: 0, y: 0, z: 0.05 },
    rotation: { x: 0, y: 0, z: 0, order: 'XYZ' },
    category: 'crankshaft_main_saddle',
    acceptsType: 'crankshaft',
    occupied: false,
    bankSide: 'center',
    torqueSpecNm: 95,
  },

  // ─── Cylinder Head Deck Mounts (Left & Right Banks) ───
  {
    id: 'CylinderHead_Left_Mount',
    position: { x: 0, y: 0.18, z: 0.32 },
    rotation: getBankRotation('left'),
    category: 'cylinder_head_deck',
    acceptsType: 'cylinder-head-left',
    occupied: false,
    bankSide: 'left',
    torqueSpecNm: 125,
  },
  {
    id: 'CylinderHead_Right_Mount',
    position: { x: 0.0075, y: -0.18, z: 0.32 },
    rotation: getBankRotation('right'),
    category: 'cylinder_head_deck',
    acceptsType: 'cylinder-head-right',
    occupied: false,
    bankSide: 'right',
    torqueSpecNm: 125,
  },

  // ─── Dry Sump Oil Pan Bottom Mount ───
  {
    id: 'OilPan_Mount',
    position: { x: 0, y: 0, z: -0.03 },
    rotation: { x: 0, y: 0, z: 0, order: 'XYZ' },
    category: 'oil_pan_skirt',
    acceptsType: 'dry-sump',
    occupied: false,
    bankSide: 'center',
    torqueSpecNm: 22,
  },

  // ─── Front Timing Case Mount ───
  {
    id: 'TimingChain_Front_Mount',
    position: { x: -0.34, y: 0, z: 0.18 },
    rotation: { x: 0, y: 0, z: 0, order: 'XYZ' },
    category: 'timing_case_front',
    acceptsType: 'timing-chain',
    occupied: false,
    bankSide: 'center',
    torqueSpecNm: 35,
  },

  // ─── Rear Drivetrain / Flywheel / Transaxle Bellhousing Mount ───
  {
    id: 'Transaxle_Rear_Mount',
    position: { x: 0.34, y: 0, z: 0.08 },
    rotation: { x: 0, y: 0, z: 0, order: 'XYZ' },
    category: 'transaxle_bellhousing_flange',
    acceptsType: 'transaxle',
    occupied: false,
    bankSide: 'center',
    torqueSpecNm: 75,
  },

  // ─── Front Radiator Bracket Mount ───
  {
    id: 'Radiator_Front_Mount',
    position: { x: -0.46, y: 0, z: 0.18 },
    rotation: { x: 0, y: 0, z: 0, order: 'XYZ' },
    category: 'radiator_chassis_bracket',
    acceptsType: 'radiator',
    occupied: false,
    bankSide: 'center',
  },

  // ─── Top Engine Cover Stud Mounts ───
  {
    id: 'EngineCover_Top_Mount',
    position: { x: 0, y: 0, z: 0.54 },
    rotation: { x: 0, y: 0, z: 0, order: 'XYZ' },
    category: 'engine_cover_stud',
    acceptsType: 'engine-cover',
    occupied: false,
    bankSide: 'center',
  },

  // ─── Auxiliary Mounts ───
  {
    id: 'OilFilter_Mount',
    position: { x: -0.28, y: -0.22, z: -0.07 },
    rotation: { x: 0, y: 0, z: 0, order: 'XYZ' },
    category: 'oil_pan_skirt',
    acceptsType: 'oil-filter',
    occupied: false,
    bankSide: 'right',
  },
  {
    id: 'WaterPump_Mount',
    position: { x: -0.36, y: 0.08, z: 0.08 },
    rotation: { x: 0, y: 0, z: 0, order: 'XYZ' },
    category: 'timing_case_front',
    acceptsType: 'water-pump',
    occupied: false,
    bankSide: 'left',
  },
];

// ============================================================================
// 4. CRANKSHAFT ATTACHMENT MAP
// ============================================================================

/**
 * Connecting Rod journal mount positions along the forged nitrided crankshaft.
 * 6 crankpins spaced at 108mm pitch, each hosting two connecting rods side-by-side.
 */
export const V12_CRANKSHAFT_ATTACHMENTS: AttachmentPoint3D[] = [
  // Crankpin 1 (Cylinders 1 & 2)
  {
    id: 'Crank_Journal_01_Left_Mount',
    position: { x: -0.27, y: 0, z: 0.05 },
    rotation: getBankRotation('left'),
    category: 'connecting_rod_crank_journal',
    acceptsType: 'connecting-rod',
    occupied: false,
    bankSide: 'left',
    cylinderIndex: 1,
    torqueSpecNm: 75,
  },
  {
    id: 'Crank_Journal_01_Right_Mount',
    position: { x: -0.27 + 0.015, y: 0, z: 0.05 },
    rotation: getBankRotation('right'),
    category: 'connecting_rod_crank_journal',
    acceptsType: 'connecting-rod',
    occupied: false,
    bankSide: 'right',
    cylinderIndex: 2,
    torqueSpecNm: 75,
  },

  // Crankpin 2 (Cylinders 3 & 4)
  {
    id: 'Crank_Journal_02_Left_Mount',
    position: { x: -0.27 + 0.108, y: 0, z: 0.05 },
    rotation: getBankRotation('left'),
    category: 'connecting_rod_crank_journal',
    acceptsType: 'connecting-rod',
    occupied: false,
    bankSide: 'left',
    cylinderIndex: 3,
    torqueSpecNm: 75,
  },
  {
    id: 'Crank_Journal_02_Right_Mount',
    position: { x: -0.27 + 0.108 + 0.015, y: 0, z: 0.05 },
    rotation: getBankRotation('right'),
    category: 'connecting_rod_crank_journal',
    acceptsType: 'connecting-rod',
    occupied: false,
    bankSide: 'right',
    cylinderIndex: 4,
    torqueSpecNm: 75,
  },

  // Crankpin 3 (Cylinders 5 & 6)
  {
    id: 'Crank_Journal_03_Left_Mount',
    position: { x: -0.27 + 0.216, y: 0, z: 0.05 },
    rotation: getBankRotation('left'),
    category: 'connecting_rod_crank_journal',
    acceptsType: 'connecting-rod',
    occupied: false,
    bankSide: 'left',
    cylinderIndex: 5,
    torqueSpecNm: 75,
  },
  {
    id: 'Crank_Journal_03_Right_Mount',
    position: { x: -0.27 + 0.216 + 0.015, y: 0, z: 0.05 },
    rotation: getBankRotation('right'),
    category: 'connecting_rod_crank_journal',
    acceptsType: 'connecting-rod',
    occupied: false,
    bankSide: 'right',
    cylinderIndex: 6,
    torqueSpecNm: 75,
  },

  // Crankpin 4 (Cylinders 7 & 8)
  {
    id: 'Crank_Journal_04_Left_Mount',
    position: { x: -0.27 + 0.324, y: 0, z: 0.05 },
    rotation: getBankRotation('left'),
    category: 'connecting_rod_crank_journal',
    acceptsType: 'connecting-rod',
    occupied: false,
    bankSide: 'left',
    cylinderIndex: 7,
    torqueSpecNm: 75,
  },
  {
    id: 'Crank_Journal_04_Right_Mount',
    position: { x: -0.27 + 0.324 + 0.015, y: 0, z: 0.05 },
    rotation: getBankRotation('right'),
    category: 'connecting_rod_crank_journal',
    acceptsType: 'connecting-rod',
    occupied: false,
    bankSide: 'right',
    cylinderIndex: 8,
    torqueSpecNm: 75,
  },

  // Crankpin 5 (Cylinders 9 & 10)
  {
    id: 'Crank_Journal_05_Left_Mount',
    position: { x: -0.27 + 0.432, y: 0, z: 0.05 },
    rotation: getBankRotation('left'),
    category: 'connecting_rod_crank_journal',
    acceptsType: 'connecting-rod',
    occupied: false,
    bankSide: 'left',
    cylinderIndex: 9,
    torqueSpecNm: 75,
  },
  {
    id: 'Crank_Journal_05_Right_Mount',
    position: { x: -0.27 + 0.432 + 0.015, y: 0, z: 0.05 },
    rotation: getBankRotation('right'),
    category: 'connecting_rod_crank_journal',
    acceptsType: 'connecting-rod',
    occupied: false,
    bankSide: 'right',
    cylinderIndex: 10,
    torqueSpecNm: 75,
  },

  // Crankpin 6 (Cylinders 11 & 12)
  {
    id: 'Crank_Journal_06_Left_Mount',
    position: { x: -0.27 + 0.540, y: 0, z: 0.05 },
    rotation: getBankRotation('left'),
    category: 'connecting_rod_crank_journal',
    acceptsType: 'connecting-rod',
    occupied: false,
    bankSide: 'left',
    cylinderIndex: 11,
    torqueSpecNm: 75,
  },
  {
    id: 'Crank_Journal_06_Right_Mount',
    position: { x: -0.27 + 0.540 + 0.015, y: 0, z: 0.05 },
    rotation: getBankRotation('right'),
    category: 'connecting_rod_crank_journal',
    acceptsType: 'connecting-rod',
    occupied: false,
    bankSide: 'right',
    cylinderIndex: 12,
    torqueSpecNm: 75,
  },

  // Rear Flywheel Flange
  {
    id: 'Crank_Flywheel_Flange_Mount',
    position: { x: 0.34, y: 0, z: 0.05 },
    rotation: { x: 0, y: 0, z: 0, order: 'XYZ' },
    category: 'flywheel_crank_flange',
    acceptsType: 'flywheel',
    occupied: false,
    bankSide: 'center',
    torqueSpecNm: 140,
  },
];

// ============================================================================
// 5. CYLINDER HEAD ATTACHMENT MAP (LEFT & RIGHT)
// ============================================================================

/**
 * Attachment points located on the Left Cylinder Head (Bank 1).
 */
export const V12_CYLINDER_HEAD_LEFT_ATTACHMENTS: AttachmentPoint3D[] = [
  // Valve Cover Mount (top rail)
  {
    id: 'ValveCover_Left_Mount',
    position: { x: 0, y: 0.22, z: 0.39 },
    rotation: getBankRotation('left'),
    category: 'valve_cover_rail',
    acceptsType: 'valve-cover-left',
    occupied: false,
    bankSide: 'left',
    torqueSpecNm: 12,
  },

  // Intake Manifold Mount (inner valley side)
  {
    id: 'IntakeManifold_Left_Mount',
    position: { x: 0, y: 0.12, z: 0.36 },
    rotation: getBankRotation('left'),
    category: 'intake_port_flange',
    acceptsType: 'intake-manifold-left',
    occupied: false,
    bankSide: 'left',
    torqueSpecNm: 28,
  },

  // Exhaust Header Mount (outer flank side)
  {
    id: 'ExhaustHeader_Left_Mount',
    position: { x: 0, y: 0.24, z: 0.28 },
    rotation: getBankRotation('left'),
    category: 'exhaust_port_flange',
    acceptsType: 'exhaust-header-left',
    occupied: false,
    bankSide: 'left',
    torqueSpecNm: 45,
  },

  // 6 Spark Plug Wells (Bank 1: Cylinders 1,3,5,7,9,11)
  ...[0, 1, 2, 3, 4, 5].map((i): AttachmentPoint3D => ({
    id: `SparkPlug_${(i * 2 + 1).toString().padStart(2, '0')}_Mount`,
    position: { x: -0.25 + i * 0.10, y: 0.22, z: 0.42 },
    rotation: getBankRotation('left'),
    category: 'spark_plug_well',
    acceptsType: 'spark-plug',
    occupied: false,
    bankSide: 'left',
    cylinderIndex: i * 2 + 1,
    torqueSpecNm: 25,
  })),
];

/**
 * Attachment points located on the Right Cylinder Head (Bank 2).
 */
export const V12_CYLINDER_HEAD_RIGHT_ATTACHMENTS: AttachmentPoint3D[] = [
  // Valve Cover Mount
  {
    id: 'ValveCover_Right_Mount',
    position: { x: 0.015, y: -0.22, z: 0.39 },
    rotation: getBankRotation('right'),
    category: 'valve_cover_rail',
    acceptsType: 'valve-cover-right',
    occupied: false,
    bankSide: 'right',
    torqueSpecNm: 12,
  },

  // Intake Manifold Mount
  {
    id: 'IntakeManifold_Right_Mount',
    position: { x: 0.015, y: -0.12, z: 0.36 },
    rotation: getBankRotation('right'),
    category: 'intake_port_flange',
    acceptsType: 'intake-manifold-right',
    occupied: false,
    bankSide: 'right',
    torqueSpecNm: 28,
  },

  // Exhaust Header Mount
  {
    id: 'ExhaustHeader_Right_Mount',
    position: { x: 0.015, y: -0.24, z: 0.28 },
    rotation: getBankRotation('right'),
    category: 'exhaust_port_flange',
    acceptsType: 'exhaust-header-right',
    occupied: false,
    bankSide: 'right',
    torqueSpecNm: 45,
  },

  // 6 Spark Plug Wells (Bank 2: Cylinders 2,4,6,8,10,12)
  ...[0, 1, 2, 3, 4, 5].map((i): AttachmentPoint3D => ({
    id: `SparkPlug_${((i + 1) * 2).toString().padStart(2, '0')}_Mount`,
    position: { x: -0.25 + i * 0.10 + 0.015, y: -0.22, z: 0.42 },
    rotation: getBankRotation('right'),
    category: 'spark_plug_well',
    acceptsType: 'spark-plug',
    occupied: false,
    bankSide: 'right',
    cylinderIndex: (i + 1) * 2,
    torqueSpecNm: 25,
  })),
];

// ============================================================================
// 6. INTAKE & EXHAUST SUBSYSTEM ATTACHMENT MAP
// ============================================================================

/** Sockets on Intake Manifolds for fuel rails and velocity stacks */
export const V12_INTAKE_ATTACHMENTS: AttachmentPoint3D[] = [
  {
    id: 'FuelRail_Left_Mount',
    position: { x: 0, y: 0.05, z: 0.46 },
    rotation: { x: 0, y: 0, z: 0, order: 'XYZ' },
    category: 'fuel_rail_boss',
    acceptsType: 'fuel-rail-left',
    occupied: false,
    bankSide: 'left',
  },
  {
    id: 'FuelRail_Right_Mount',
    position: { x: 0.015, y: -0.05, z: 0.46 },
    rotation: { x: 0, y: 0, z: 0, order: 'XYZ' },
    category: 'fuel_rail_boss',
    acceptsType: 'fuel-rail-right',
    occupied: false,
    bankSide: 'right',
  },
  {
    id: 'VelocityStack_Left_Mount',
    position: { x: 0, y: 0.08, z: 0.53 },
    rotation: { x: 0, y: 0, z: 0, order: 'XYZ' },
    category: 'intake_port_flange',
    acceptsType: 'velocity-stack-left',
    occupied: false,
    bankSide: 'left',
  },
  {
    id: 'VelocityStack_Right_Mount',
    position: { x: 0.015, y: -0.08, z: 0.53 },
    rotation: { x: 0, y: 0, z: 0, order: 'XYZ' },
    category: 'intake_port_flange',
    acceptsType: 'velocity-stack-right',
    occupied: false,
    bankSide: 'right',
  },
];

/** Sockets on Exhaust Headers for turbocharger mounting */
export const V12_EXHAUST_ATTACHMENTS: AttachmentPoint3D[] = [
  {
    id: 'Turbocharger_Mount',
    position: { x: 0.50, y: -0.32, z: 0.12 },
    rotation: { x: 0, y: Math.PI / 2, z: 0, order: 'XYZ' },
    category: 'turbo_flange',
    acceptsType: 'turbocharger',
    occupied: false,
    bankSide: 'right',
    torqueSpecNm: 55,
  },
];

// ============================================================================
// 7. MASTER QUERY & LOOKUP REGISTRY HELPERS
// ============================================================================

/**
 * Returns all attachment points across all V12 engine components in a flat array.
 */
export function getAllV12AttachmentPoints(): AttachmentPoint3D[] {
  return [
    ...V12_ENGINE_BLOCK_ATTACHMENTS,
    ...V12_CRANKSHAFT_ATTACHMENTS,
    ...V12_CYLINDER_HEAD_LEFT_ATTACHMENTS,
    ...V12_CYLINDER_HEAD_RIGHT_ATTACHMENTS,
    ...V12_INTAKE_ATTACHMENTS,
    ...V12_EXHAUST_ATTACHMENTS,
  ];
}

/**
 * Finds an attachment point by its unique ID.
 */
export function findAttachmentPointById(id: string): AttachmentPoint3D | undefined {
  return getAllV12AttachmentPoints().find((p) => p.id === id);
}

/**
 * Retrieves all sockets hosted on a specific component type.
 */
export function getSocketsForComponentType(type: Engine3DComponentType): AttachmentPoint3D[] {
  switch (type) {
    case 'engine-block':
      return V12_ENGINE_BLOCK_ATTACHMENTS;
    case 'crankshaft':
      return V12_CRANKSHAFT_ATTACHMENTS;
    case 'cylinder-head-left':
      return V12_CYLINDER_HEAD_LEFT_ATTACHMENTS;
    case 'cylinder-head-right':
      return V12_CYLINDER_HEAD_RIGHT_ATTACHMENTS;
    case 'intake-manifold-left':
    case 'intake-manifold-right':
      return V12_INTAKE_ATTACHMENTS;
    case 'exhaust-header-left':
    case 'exhaust-header-right':
      return V12_EXHAUST_ATTACHMENTS;
    default:
      return [];
  }
}

/**
 * Retrieves all attachment points that accept a given child component type.
 */
export function getAvailableSocketsForChild(childType: Engine3DComponentType): AttachmentPoint3D[] {
  return getAllV12AttachmentPoints().filter((p) => p.acceptsType === childType);
}

/**
 * Retrieves all 12 piston attachment sockets in cylinder firing order sequence.
 */
export function getPistonSocketsInFiringOrder(): AttachmentPoint3D[] {
  const order = V12_PHYSICAL_SPECS.firingOrder;
  const result: AttachmentPoint3D[] = [];

  for (const cyl of order) {
    const id = `Piston_${cyl.toString().padStart(2, '0')}_Mount`;
    const socket = V12_ENGINE_BLOCK_ATTACHMENTS.find((p) => p.id === id);
    if (socket) {
      result.push(socket);
    }
  }

  return result;
}

/**
 * Validates that all parent-to-child socket mappings are physically valid and non-colliding.
 */
export function validateAttachmentTopology(): { isValid: boolean; errors: string[] } {
  const allPoints = getAllV12AttachmentPoints();
  const errors: string[] = [];
  const idSet = new Set<string>();

  for (const pt of allPoints) {
    if (idSet.has(pt.id)) {
      errors.push(`Duplicate attachment point ID: ${pt.id}`);
    }
    idSet.add(pt.id);

    if (
      isNaN(pt.position.x) ||
      isNaN(pt.position.y) ||
      isNaN(pt.position.z) ||
      isNaN(pt.rotation.x) ||
      isNaN(pt.rotation.y) ||
      isNaN(pt.rotation.z)
    ) {
      errors.push(`Attachment point ${pt.id} contains NaN coordinate values`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
