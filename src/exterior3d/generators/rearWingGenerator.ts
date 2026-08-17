// ===================================================================
// THREE.JS ACTIVE REAR WING AIRFOIL 3D GEOMETRY GENERATOR
// ===================================================================

import * as THREE from "three";
import type { AeroSurfaceConfig } from "../../sim/types/exterior";

export function generateRearWing3DGeometry(
  config?: Partial<AeroSurfaceConfig>
): THREE.Group {
  const group = new THREE.Group();
  group.name = "Rear_Wing_Assembly";

  const carbonMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.2,
    metalness: 0.9,
    name: "Carbon_Aero_Material",
  });

  const span = (config?.wingSpanMm || 1680) / 1000;
  const chord = (config?.wingChordMm || 320) / 1000;
  const aoaDeg = config?.wingAngleOfAttackDeg || 14;

  // Swan-Neck Top-Mount Pylons (Left & Right)
  const pylonGeo = new THREE.BoxGeometry(0.04, 0.35, 0.02);
  const leftPylon = new THREE.Mesh(pylonGeo, carbonMat);
  leftPylon.position.set(0, -0.15, span * 0.25);
  leftPylon.rotation.z = 0.2;
  group.add(leftPylon);

  const rightPylon = new THREE.Mesh(pylonGeo, carbonMat);
  rightPylon.position.set(0, -0.15, -span * 0.25);
  rightPylon.rotation.z = 0.2;
  group.add(rightPylon);

  // Main Airfoil Blade
  const bladeGeo = new THREE.BoxGeometry(chord, 0.025, span);
  const bladeMesh = new THREE.Mesh(bladeGeo, carbonMat);
  bladeMesh.rotation.z = (aoaDeg * Math.PI) / 180;
  bladeMesh.castShadow = true;
  group.add(bladeMesh);

  // Vertical Endplates (LH & RH)
  const endplateGeo = new THREE.BoxGeometry(chord * 1.25, 0.18, 0.015);
  const leftEndplate = new THREE.Mesh(endplateGeo, carbonMat);
  leftEndplate.position.set(0, 0, span / 2);
  group.add(leftEndplate);

  const rightEndplate = new THREE.Mesh(endplateGeo, carbonMat);
  rightEndplate.position.set(0, 0, -span / 2);
  group.add(rightEndplate);

  return group;
}
