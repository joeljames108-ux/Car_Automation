// ============================================================================
// MODULAR GLB GENERATOR — 60° V12 STRUCTURAL SKIRT WEBBING & ENGINE MOUNTS
// ============================================================================
// Solid-modeling generator for the exterior triangulated isometric rib lattice,
// torsional block stiffening gussets, 4 heavy-duty 4-bolt chassis engine mount
// pads, starter motor pocket casting, and crankshaft position sensor bosses.
// ============================================================================

import * as THREE from 'three';
import type { V12BlockMaterialPalette } from '../engineBlockGenerator';

// ============================================================================
// 1. STRUCTURAL WEBBING SPECIFICATION CONSTANTS
// ============================================================================

export interface StructuralWebbingSpec {
  ribThicknessMm: number; // 14.0 mm cast reinforcing rib thickness
  ribThicknessM: number; // 0.014 m
  ribHeightMm: number; // 24.0 mm rib protrusion height
  ribHeightM: number; // 0.024 m
  ribAngleDeg: number; // 26.5° triangulated diagonal lattice angle
  mountPadWidthMm: number; // 94.0 mm 4-bolt chassis mount pad
  mountPadWidthM: number; // 0.094 m
  mountPadHeightMm: number; // 84.0 mm
  mountPadHeightM: number; // 0.084 m
  mountBoltThread: 'M12x1.5 Grade 10.9';
  mountBoltRadiusM: number; // 0.006 m
  starterBoreDiameterMm: number; // 90.0 mm starter motor pocket diameter
  starterBoreRadiusM: number; // 0.045 m
}

export const V12_WEBBING_SPECS: StructuralWebbingSpec = {
  ribThicknessMm: 14.0,
  ribThicknessM: 0.014,
  ribHeightMm: 24.0,
  ribHeightM: 0.024,
  ribAngleDeg: 26.5,
  mountPadWidthMm: 94.0,
  mountPadWidthM: 0.094,
  mountPadHeightMm: 84.0,
  mountPadHeightM: 0.084,
  mountBoltThread: 'M12x1.5 Grade 10.9',
  mountBoltRadiusM: 0.006,
  starterBoreDiameterMm: 90.0,
  starterBoreRadiusM: 0.045,
};

// ============================================================================
// 2. CHASSIS ENGINE MOUNT PAD BUILDER
// ============================================================================

export interface EngineMountPadConfig {
  positionName: 'Front_Left' | 'Front_Right' | 'Rear_Left' | 'Rear_Right';
  posX: number;
  posY: number;
  posZ: number;
  spec: StructuralWebbingSpec;
}

/**
 * Builds a single heavy-duty 4-bolt chassis engine mount pad with reinforced
 * load transfer gussets capable of reacting 1,200 Nm torque loads.
 */
export function buildSingleEngineMountPad(
  config: EngineMountPadConfig,
  materials: V12BlockMaterialPalette
): THREE.Group {
  const { positionName, posX, posY, posZ, spec } = config;
  const group = new THREE.Group();
  group.name = `Engine_Mount_Pad_${positionName}`;
  group.position.set(posX, posY, posZ);

  // 1. CNC Machined Solid Mounting Flange Block
  const padGeo = new THREE.BoxGeometry(
    spec.mountPadWidthM,
    0.038,
    spec.mountPadHeightM
  );
  const padMesh = new THREE.Mesh(padGeo, materials.machinedDeckSurface);
  padMesh.name = `Mount_Face_${positionName}`;
  padMesh.castShadow = true;
  padMesh.receiveShadow = true;
  group.add(padMesh);

  // 2. 4 M12 Chassis Retention Bolt Holes
  const holeGeo = new THREE.CylinderGeometry(
    spec.mountBoltRadiusM,
    spec.mountBoltRadiusM,
    0.045,
    16
  );
  holeGeo.rotateX(Math.PI / 2);

  [-0.030, 0.030].forEach((hx) => {
    [-0.026, 0.026].forEach((hz, holeIdx) => {
      const hole = new THREE.Mesh(holeGeo, materials.oilGalleryPassage);
      hole.name = `Mount_Bolt_Hole_${positionName}_${hx > 0 ? 'Fwd' : 'Aft'}_${hz > 0 ? 'Top' : 'Btm'}`;
      hole.position.set(hx, 0, hz);
      group.add(hole);
    });
  });

  // 3. Stiffening Web Gusset Ribs (Triangulated to crankcase skirt)
  const gussetGeo = new THREE.BoxGeometry(0.012, 0.045, 0.06);
  gussetGeo.rotateX(Math.PI / 6);
  const gussetMesh = new THREE.Mesh(gussetGeo, materials.castAluminumBlock);
  gussetMesh.name = `Mount_Gusset_${positionName}`;
  gussetMesh.position.set(0, posY > 0 ? -0.025 : 0.025, -0.02);
  gussetMesh.castShadow = true;
  group.add(gussetMesh);

  return group;
}

// ============================================================================
// 3. MASTER STRUCTURAL WEBBING ASSEMBLY BUILDER
// ============================================================================

/**
 * Builds the complete exterior structural webbing, triangulated rib trusses,
 * engine mount cradles, starter motor pocket, and sensor ports.
 */
export function buildV12StructuralWebbingSystem(
  materials: V12BlockMaterialPalette,
  cylindersPerBank: number = 6
): THREE.Group {
  const group = new THREE.Group();
  group.name = '05_V12_Structural_Webbing_Mounts_Assembly';
  const spec = V12_WEBBING_SPECS;
  const pitchM = 0.108;
  const blockHalfLen = (cylindersPerBank * pitchM) / 2;
  const ribCount = Math.max(3, cylindersPerBank + 1);
  const ribSpan = (cylindersPerBank - 1) * pitchM * 0.95;
  const ribStart = -ribSpan / 2;

  // ── A. Triangulated Diagonal Lattice Rib Grids (Left & Right Flanks) ──
  const ribGeo = new THREE.BoxGeometry(spec.ribThicknessM, 0.026, 0.22);

  [-0.182, 0.182].forEach((wy, flankIdx) => {
    const flankName = flankIdx === 0 ? 'Left' : 'Right';

    for (let r = 0; r < ribCount; r++) {
      const rx = ribStart + r * (ribSpan / (ribCount - 1));

      // Positive diagonal truss rib (+26.5°)
      const ribA = new THREE.Mesh(ribGeo, materials.castAluminumBlock);
      ribA.name = `Lattice_Rib_${flankName}_A_${r + 1}`;
      ribA.position.set(rx, wy, 0.18);
      ribA.rotation.y = Math.PI / 6.8;
      ribA.castShadow = true;
      group.add(ribA);

      // Negative diagonal truss rib (-26.5°)
      const ribB = new THREE.Mesh(ribGeo, materials.castAluminumBlock);
      ribB.name = `Lattice_Rib_${flankName}_B_${r + 1}`;
      ribB.position.set(rx, wy, 0.18);
      ribB.rotation.y = -Math.PI / 6.8;
      ribB.castShadow = true;
      group.add(ribB);
    }
  });

  // ── B. Starter Motor Clearance Pocket & Mounting Flange ──
  const starterPocketGeo = new THREE.CylinderGeometry(
    spec.starterBoreRadiusM,
    spec.starterBoreRadiusM,
    0.15,
    24
  );
  starterPocketGeo.rotateZ(Math.PI / 2);
  const starterPocketMesh = new THREE.Mesh(starterPocketGeo, materials.castAluminumBlock);
  starterPocketMesh.name = 'Starter_Motor_Pocket_Casting';
  starterPocketMesh.position.set(blockHalfLen - 0.04, -0.18, 0.08);
  starterPocketMesh.castShadow = true;
  group.add(starterPocketMesh);

  // Dual M10 Starter Mounting Ears
  const earGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.025, 16);
  earGeo.rotateZ(Math.PI / 2);

  [-0.035, 0.035].forEach((ez, earIdx) => {
    const earMesh = new THREE.Mesh(earGeo, materials.machinedDeckSurface);
    earMesh.name = `Starter_Mount_Ear_${earIdx === 0 ? 'Top' : 'Btm'}`;
    earMesh.position.set(blockHalfLen + 0.02, -0.18, 0.08 + ez);
    group.add(earMesh);
  });

  // ── C. Crankshaft Position Sensor Machined Boss ──
  const crankSensorGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.032, 16);
  crankSensorGeo.rotateZ(Math.PI / 2);
  const crankSensorMesh = new THREE.Mesh(crankSensorGeo, materials.machinedDeckSurface);
  crankSensorMesh.name = 'Crank_Position_Sensor_Boss';
  crankSensorMesh.position.set(blockHalfLen - 0.01, 0.16, 0.06);
  crankSensorMesh.castShadow = true;
  group.add(crankSensorMesh);

  return group;
}

export default buildV12StructuralWebbingSystem;
