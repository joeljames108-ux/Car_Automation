// ============================================================================
// MODULAR GLB GENERATOR — 60° V12 NIKASIL CYLINDER LINER SLEEVING SYSTEM
// ============================================================================
// High-precision physical solid-modeling generator for the 12 independent
// Nikasil-plated cylinder bore liners, 45° plateau cross-hatch honing shaders,
// combustion fire-ring receiver grooves, deck chamfer bevels, lower connecting rod
// swing clearance scallops, and annular coolant jacket sleeve channels.
// ============================================================================

import * as THREE from 'three';
import type { V12BlockMaterialPalette } from '../engineBlockGenerator';

// ============================================================================
// 1. CYLINDER LINER GEOMETRIC SPECIFICATION CONSTANTS
// ============================================================================

export interface CylinderLinerSpec {
  boreDiameterMm: number; // 88.0 mm internal bore diameter
  boreRadiusM: number; // 0.044 m internal bore radius
  outerSleeveDiameterMm: number; // 96.0 mm outer sleeve diameter
  outerSleeveRadiusM: number; // 0.048 m outer sleeve radius
  sleeveWallThicknessMm: number; // 4.0 mm nominal wall thickness
  boreDepthMm: number; // 190.0 mm total bore length
  boreDepthM: number; // 0.190 m depth along cylinder axis
  flangeDiameterMm: number; // 102.0 mm top seating flange
  flangeRadiusM: number; // 0.051 m top seating flange radius
  flangeHeightMm: number; // 6.0 mm deck seating flange height
  flangeHeightM: number; // 0.006 m
  chamferAngleDeg: number; // 45.0° deck entry chamfer
  chamferWidthMm: number; // 1.5 mm
  chamferWidthM: number; // 0.0015 m
  fireRingDepthMm: number; // 1.2 mm
  fireRingWidthMm: number; // 2.4 mm
  coolantAnnulusWidthMm: number; // 6.0 mm water passage slot
  coolantAnnulusWidthM: number; // 0.006 m
  scallopClearanceAngleDeg: number; // 38.0° rod swing swing cutout
  scallopDepthMm: number; // 28.0 mm bottom skirt scallop
  scallopDepthM: number; // 0.028 m
  bankStaggerMm: number; // 15.0 mm Bank 2 longitudinal offset
  borePitchMm: number; // 108.0 mm center-to-center spacing
}

export const V12_LINER_SPECS: CylinderLinerSpec = {
  boreDiameterMm: 88.0,
  boreRadiusM: 0.044,
  outerSleeveDiameterMm: 96.0,
  outerSleeveRadiusM: 0.048,
  sleeveWallThicknessMm: 4.0,
  boreDepthMm: 190.0,
  boreDepthM: 0.190,
  flangeDiameterMm: 102.0,
  flangeRadiusM: 0.051,
  flangeHeightMm: 6.0,
  flangeHeightM: 0.006,
  chamferAngleDeg: 45.0,
  chamferWidthMm: 1.5,
  chamferWidthM: 0.0015,
  fireRingDepthMm: 1.2,
  fireRingWidthMm: 2.4,
  coolantAnnulusWidthMm: 6.0,
  coolantAnnulusWidthM: 0.006,
  scallopClearanceAngleDeg: 38.0,
  scallopDepthMm: 28.0,
  scallopDepthM: 0.028,
  bankStaggerMm: 15.0,
  borePitchMm: 108.0,
};

// ============================================================================
// 2. INDIVIDUAL CYLINDER BORE SLEEVE BUILDER
// ============================================================================

export interface CylinderBoreConfig {
  cylinderNumber: number; // 1 through 12
  bank: 'left' | 'right'; // Bank 1 (Left) or Bank 2 (Right)
  bankIndex: number; // 0 through 5
  centerX: number; // Longitudinal X position relative to bank
  spec: CylinderLinerSpec;
}

/**
 * Builds the complete 3D solid model assembly for a single physical hollow
 * Nikasil-plated cylinder bore liner with all micro-engineering features.
 */
export function buildSingleCylinderBoreUnit(
  config: CylinderBoreConfig,
  materials: V12BlockMaterialPalette
): THREE.Group {
  const { cylinderNumber, bank, bankIndex, centerX, spec } = config;
  const group = new THREE.Group();
  group.name = `Cylinder_Bore_Unit_${cylinderNumber.toString().padStart(2, '0')}`;
  group.position.set(centerX, 0, 0);

  // ── A. Hollow Nikasil Liner Sleeve (Inner Plateau-Honed Surface) ──
  // Open-ended double-sided hollow tube with 45° cross-hatch reflection
  const innerHoneGeo = new THREE.CylinderGeometry(
    spec.boreRadiusM,
    spec.boreRadiusM,
    spec.boreDepthM,
    48, // 48 radial segments for ultra-smooth circular curvature
    8,  // 8 height segments for axial stress distribution
    true // open-ended hollow tube
  );
  innerHoneGeo.rotateX(Math.PI / 2);
  const innerHoneMesh = new THREE.Mesh(innerHoneGeo, materials.nikasilCylinderBore);
  innerHoneMesh.name = `Nikasil_Hone_Surface_Cyl_${cylinderNumber}`;
  innerHoneMesh.position.set(0, 0, 0.005);
  innerHoneMesh.castShadow = true;
  innerHoneMesh.receiveShadow = true;
  group.add(innerHoneMesh);

  // ── B. Outer Ductile Iron / Alloy Structural Liner Sleeve ──
  const outerSleeveGeo = new THREE.CylinderGeometry(
    spec.outerSleeveRadiusM,
    spec.outerSleeveRadiusM,
    spec.boreDepthM - 0.015,
    48,
    4,
    true
  );
  outerSleeveGeo.rotateX(Math.PI / 2);
  const outerSleeveMesh = new THREE.Mesh(outerSleeveGeo, materials.castAluminumBlock);
  outerSleeveMesh.name = `Liner_Outer_Sleeve_Cyl_${cylinderNumber}`;
  outerSleeveMesh.position.set(0, 0, 0.002);
  outerSleeveMesh.castShadow = true;
  group.add(outerSleeveMesh);

  // ── C. Top Deck Seating Flange Shoulder & Mating Step ──
  const flangeGeo = new THREE.RingGeometry(
    spec.boreRadiusM,
    spec.flangeRadiusM,
    48
  );
  const flangeMesh = new THREE.Mesh(flangeGeo, materials.machinedDeckSurface);
  flangeMesh.name = `Deck_Flange_Shoulder_Cyl_${cylinderNumber}`;
  flangeMesh.position.set(0, 0, 0.108);
  flangeMesh.castShadow = true;
  group.add(flangeMesh);

  // ── D. 45° Combustion Chamber Deck Entry Chamfer Ring ──
  const chamferRingGeo = new THREE.RingGeometry(
    spec.boreRadiusM - spec.chamferWidthM,
    spec.boreRadiusM + spec.chamferWidthM,
    48
  );
  const chamferRingMesh = new THREE.Mesh(chamferRingGeo, materials.machinedDeckSurface);
  chamferRingMesh.name = `Deck_Chamfer_Ring_Cyl_${cylinderNumber}`;
  chamferRingMesh.position.set(0, 0, 0.1085);
  group.add(chamferRingMesh);

  // ── E. Stainless Steel Fire-Ring Gasket Sealing Groove ──
  const fireRingGeo = new THREE.RingGeometry(
    spec.boreRadiusM + 0.003,
    spec.boreRadiusM + 0.006,
    48
  );
  const fireRingMesh = new THREE.Mesh(fireRingGeo, materials.gasketChannel);
  fireRingMesh.name = `Fire_Ring_Groove_Cyl_${cylinderNumber}`;
  fireRingMesh.position.set(0, 0, 0.1082);
  group.add(fireRingMesh);

  // ── F. Coolant Jacket Annular Flow Slot Surrounding Upper Sleeve ──
  const coolantSlotGeo = new THREE.RingGeometry(
    spec.outerSleeveRadiusM,
    spec.outerSleeveRadiusM + spec.coolantAnnulusWidthM,
    36
  );
  const coolantSlotMesh = new THREE.Mesh(coolantSlotGeo, materials.coolantJacketInterior);
  coolantSlotMesh.name = `Coolant_Annulus_Slot_Cyl_${cylinderNumber}`;
  coolantSlotMesh.position.set(0, 0, 0.1078);
  group.add(coolantSlotMesh);

  // ── G. Bottom Crankcase Rod Clearance Scallop Wings ──
  // Cutout reliefs at the lower liner skirt preventing connecting rod collision
  const scallopWingGeo = new THREE.BoxGeometry(
    0.042,
    0.012,
    spec.scallopDepthM
  );
  [-0.035, 0.035].forEach((sy, wingIdx) => {
    const wingMesh = new THREE.Mesh(scallopWingGeo, materials.machinedDeckSurface);
    wingMesh.name = `Rod_Clearance_Scallop_${cylinderNumber}_${wingIdx === 0 ? 'L' : 'R'}`;
    wingMesh.position.set(0, sy, -spec.boreDepthM / 2 + spec.scallopDepthM / 2);
    wingMesh.castShadow = true;
    group.add(wingMesh);
  });

  // ── H. Middle O-Ring Coolant/Oil Barrier Seal Grooves (Wet Liner Steps) ──
  const sealRingGeo = new THREE.TorusGeometry(
    spec.outerSleeveRadiusM,
    0.0012,
    16,
    48
  );
  sealRingGeo.rotateX(Math.PI / 2);
  [-0.02, -0.05].forEach((sz, ringIdx) => {
    const sealMesh = new THREE.Mesh(sealRingGeo, materials.gasketChannel);
    sealMesh.name = `Liner_Wet_Seal_O_Ring_${cylinderNumber}_${ringIdx + 1}`;
    sealMesh.position.set(0, 0, sz);
    group.add(sealMesh);
  });

  // ── I. Embedded Kinematic Snap Anchor Socket for Piston Insertion ──
  const socketAnchor = new THREE.Object3D();
  socketAnchor.name = `Piston_${cylinderNumber.toString().padStart(2, '0')}_Mount`;
  socketAnchor.position.set(0, 0, 0.06);
  group.add(socketAnchor);

  // ── J. Embedded Kinematic Snap Anchor Socket for Cylinder Head Deck ──
  const headDeckAnchor = new THREE.Object3D();
  headDeckAnchor.name = `Head_Deck_${cylinderNumber.toString().padStart(2, '0')}_Port`;
  headDeckAnchor.position.set(0, 0, 0.108);
  group.add(headDeckAnchor);

  return group;
}

// ============================================================================
// 3. MASTER 12-CYLINDER LINER ARRAY BUILDER
// ============================================================================

/**
 * Builds the complete multi-bank set of 12 hollow cylinder bore liner assemblies
 * including Bank 1 (Left 6 bores) and Bank 2 (Right 6 bores with 15mm stagger).
 */
export function buildV12CylinderLinerSystem(
  bankSide: 'left' | 'right',
  materials: V12BlockMaterialPalette,
  cylindersPerBank: number = 6
): THREE.Group {
  const group = new THREE.Group();
  const isLeft = bankSide === 'left';
  const bankName = isLeft ? 'Bank_1_Left' : 'Bank_2_Right';
  const spec = V12_LINER_SPECS;
  const pitchM = spec.borePitchMm / 1000;
  const startX = -((cylindersPerBank - 1) * pitchM) / 2;

  group.name = `${bankName}_Cylinder_Liner_Array`;

  for (let i = 0; i < cylindersPerBank; i++) {
    const cylinderNumber = isLeft ? i * 2 + 1 : (i + 1) * 2;
    const centerX = startX + i * pitchM;

    const boreUnit = buildSingleCylinderBoreUnit(
      {
        cylinderNumber,
        bank: bankSide,
        bankIndex: i,
        centerX,
        spec,
      },
      materials
    );

    group.add(boreUnit);
  }

  // ── Inter-Bore Siamese Coolant Transfer Cross-Drillings ──
  // Water channels communicating coolant across adjacent cylinder liners
  const crossDrillGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.035, 16);
  crossDrillGeo.rotateZ(Math.PI / 2);

  for (let j = 0; j < cylindersPerBank - 1; j++) {
    const midX = startX + (j + 0.5) * pitchM;
    const crossDrillMesh = new THREE.Mesh(crossDrillGeo, materials.coolantJacketInterior);
    crossDrillMesh.name = `${bankName}_Inter_Bore_Coolant_Bridge_${j + 1}`;
    crossDrillMesh.position.set(midX, 0, 0.04);
    group.add(crossDrillMesh);
  }

  return group;
}

export default buildV12CylinderLinerSystem;
