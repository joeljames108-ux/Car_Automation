// ============================================================================
// MODULAR GLB GENERATOR — 60° V12 TIMING CASE & BELLHOUSING INTERFACES
// ============================================================================
// Solid-modeling generator for the front timing chain gearcase interface, front
// crankshaft oil seal bore, timing chain tensioner guide bosses, rear transmission
// bellhousing interface flange with 10 M10 bolt bosses, and rear main seal retainer.
// ============================================================================

import * as THREE from 'three';
import type { V12BlockMaterialPalette } from '../engineBlockGenerator';

// ============================================================================
// 1. END FLANGE SPECIFICATION CONSTANTS
// ============================================================================

export interface EndFlangesSpec {
  frontFlangeWidthMm: number; // 380.0 mm front timing cover interface
  frontFlangeWidthM: number; // 0.380 m
  frontFlangeHeightMm: number; // 320.0 mm
  frontFlangeHeightM: number; // 0.320 m
  frontSealDiameterMm: number; // 84.0 mm front crank snout seal bore
  frontSealRadiusM: number; // 0.042 m
  rearBellhousingWidthMm: number; // 440.0 mm transaxle bellhousing flange width
  rearBellhousingWidthM: number; // 0.440 m
  rearBellhousingHeightMm: number; // 380.0 mm
  rearBellhousingHeightM: number; // 0.380 m
  rearSealDiameterMm: number; // 110.0 mm rear main seal carrier bore
  rearSealRadiusM: number; // 0.055 m
  bellhousingBoltCount: number; // 10 M10 perimeter transmission bolt holes
  bellhousingBoltRadiusM: number; // 0.005 m
}

export const V12_END_FLANGES_SPECS: EndFlangesSpec = {
  frontFlangeWidthMm: 380.0,
  frontFlangeWidthM: 0.380,
  frontFlangeHeightMm: 320.0,
  frontFlangeHeightM: 0.320,
  frontSealDiameterMm: 84.0,
  frontSealRadiusM: 0.042,
  rearBellhousingWidthMm: 440.0,
  rearBellhousingWidthM: 0.440,
  rearBellhousingHeightMm: 380.0,
  rearBellhousingHeightM: 0.380,
  rearSealDiameterMm: 110.0,
  rearSealRadiusM: 0.055,
  bellhousingBoltCount: 10,
  bellhousingBoltRadiusM: 0.005,
};

// ============================================================================
// 2. MASTER END FLANGES ASSEMBLY BUILDER
// ============================================================================

/**
 * Builds the complete front timing gearcase and rear transaxle bellhousing assembly.
 */
export function buildV12EndFlangesSystem(
  materials: V12BlockMaterialPalette,
  cylindersPerBank: number = 6
): THREE.Group {
  const group = new THREE.Group();
  group.name = '06_V12_End_Flanges_Timing_Bellhousing_Assembly';
  const spec = V12_END_FLANGES_SPECS;
  const pitchM = 0.108;
  const blockHalfLen = (cylindersPerBank * pitchM) / 2;
  const frontX = -(blockHalfLen + 0.036);
  const rearX = blockHalfLen + 0.036;

  // ============================================================================
  // ── A. FRONT TIMING CHAIN CASE MATING FLANGE ──
  // ============================================================================
  const frontGroup = new THREE.Group();
  frontGroup.name = 'Front_Timing_Case_System';
  frontGroup.position.set(frontX, 0, 0.16);

  // 1. CNC Perimeter Face Flange Plate
  const frontPlateGeo = new THREE.BoxGeometry(0.022, spec.frontFlangeWidthM, spec.frontFlangeHeightM);
  const frontPlateMesh = new THREE.Mesh(frontPlateGeo, materials.machinedDeckSurface);
  frontPlateMesh.name = 'Timing_Cover_Mating_Face';
  frontPlateMesh.castShadow = true;
  frontGroup.add(frontPlateMesh);

  // 2. Front Crankshaft Snout Oil Seal Carrier Bore
  const frontSealGeo = new THREE.CylinderGeometry(
    spec.frontSealRadiusM,
    spec.frontSealRadiusM,
    0.032,
    32
  );
  frontSealGeo.rotateZ(Math.PI / 2);
  const frontSealMesh = new THREE.Mesh(frontSealGeo, materials.machinedDeckSurface);
  frontSealMesh.name = 'Front_Crank_Seal_Bore';
  frontSealMesh.position.set(0, 0, -0.10);
  frontGroup.add(frontSealMesh);

  // 3. 16 Perimeter M6 Timing Cover Fastener Holes
  const frontHoleGeo = new THREE.CylinderGeometry(0.003, 0.003, 0.03, 12);
  frontHoleGeo.rotateZ(Math.PI / 2);

  for (let f = 0; f < 16; f++) {
    const angle = (f / 16) * Math.PI * 2;
    const fy = Math.sin(angle) * (spec.frontFlangeWidthM / 2 - 0.018);
    const fz = Math.cos(angle) * (spec.frontFlangeHeightM / 2 - 0.022);

    const hole = new THREE.Mesh(frontHoleGeo, materials.oilGalleryPassage);
    hole.name = `Timing_Cover_Bolt_Hole_${f + 1}`;
    hole.position.set(0, fy, fz);
    frontGroup.add(hole);
  }

  // 4. Dual Timing Chain Hydraulic Tensioner Mounting Bosses
  const tensionerBossGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.028, 16);
  tensionerBossGeo.rotateZ(Math.PI / 2);

  [-0.085, 0.085].forEach((ty, tIdx) => {
    const tensionerMesh = new THREE.Mesh(tensionerBossGeo, materials.machinedDeckSurface);
    tensionerMesh.name = `Timing_Tensioner_Boss_${tIdx === 0 ? 'Left' : 'Right'}`;
    tensionerMesh.position.set(0, ty, 0.04);
    frontGroup.add(tensionerMesh);
  });

  group.add(frontGroup);

  // ============================================================================
  // ── B. REAR TRANSAXLE BELLHOUSING MATING FLANGE ──
  // ============================================================================
  const rearGroup = new THREE.Group();
  rearGroup.name = 'Rear_Bellhousing_System';
  rearGroup.position.set(rearX, 0, 0.17);

  // 1. Heavy-Duty Rear Bellhousing Structural Flange Plate
  const rearPlateGeo = new THREE.BoxGeometry(0.026, spec.rearBellhousingWidthM, spec.rearBellhousingHeightM);
  const rearPlateMesh = new THREE.Mesh(rearPlateGeo, materials.machinedDeckSurface);
  rearPlateMesh.name = 'Rear_Bellhousing_Face';
  rearPlateMesh.castShadow = true;
  rearGroup.add(rearPlateMesh);

  // 2. Rear Main Crankshaft Oil Seal Retainer Carrier
  const rearSealGeo = new THREE.CylinderGeometry(
    spec.rearSealRadiusM,
    spec.rearSealRadiusM,
    0.035,
    36
  );
  rearSealGeo.rotateZ(Math.PI / 2);
  const rearSealMesh = new THREE.Mesh(rearSealGeo, materials.machinedDeckSurface);
  rearSealMesh.name = 'Rear_Main_Seal_Carrier';
  rearSealMesh.position.set(0, 0, -0.11);
  rearGroup.add(rearSealMesh);

  // 3. 10 Perimeter M10 Transmission Bellhousing Bolt Bosses
  const rearHoleGeo = new THREE.CylinderGeometry(
    spec.bellhousingBoltRadiusM,
    spec.bellhousingBoltRadiusM,
    0.035,
    16
  );
  rearHoleGeo.rotateZ(Math.PI / 2);

  for (let b = 0; b < spec.bellhousingBoltCount; b++) {
    const angle = (b / spec.bellhousingBoltCount) * Math.PI * 2;
    const by = Math.sin(angle) * (spec.rearBellhousingWidthM / 2 - 0.028);
    const bz = Math.cos(angle) * (spec.rearBellhousingHeightM / 2 - 0.030);

    const hole = new THREE.Mesh(rearHoleGeo, materials.oilGalleryPassage);
    hole.name = `Bellhousing_M10_Bolt_Hole_${b + 1}`;
    hole.position.set(0, by, bz);
    rearGroup.add(hole);
  }

  // 4. Dual Precision Transmission Alignment Dowel Sleeves
  const dowelGeo = new THREE.CylinderGeometry(0.007, 0.007, 0.024, 16);
  dowelGeo.rotateZ(Math.PI / 2);

  [-0.16, 0.16].forEach((dy, dowelIdx) => {
    const dowelMesh = new THREE.Mesh(dowelGeo, materials.arpHardenedFastener);
    dowelMesh.name = `Bellhousing_Dowel_${dowelIdx === 0 ? 'Left' : 'Right'}`;
    dowelMesh.position.set(0.008, dy, 0);
    dowelMesh.castShadow = true;
    rearGroup.add(dowelMesh);
  });

  group.add(rearGroup);

  return group;
}

export default buildV12EndFlangesSystem;
