// ===================================================================
// THREE.JS ACTIVE REAR WING AIRFOIL 3D GEOMETRY GENERATOR
// ===================================================================
// Generates motorsport swan-neck carbon fiber GT3 rear aerofoil with
// cambered teardrop chord profile, secondary slotted flap, and 3D endplates.
// ===================================================================

import * as THREE from "three";
import type { AeroSurfaceConfig } from "../../sim/types/exterior";

export function generateRearWing3DGeometry(
  config?: Partial<AeroSurfaceConfig>
): THREE.Group {
  const group = new THREE.Group();
  group.name = "Rear_Wing_Assembly";

  const carbonMat = new THREE.MeshPhysicalMaterial({
    color: 0x090d16,
    roughness: 0.15,
    metalness: 0.90,
    clearcoat: 1.0,
    clearcoatRoughness: 0.02,
    reflectivity: 0.95,
    name: "Carbon_Aero_Material",
  });

  const span = (config?.wingSpanMm || 1680) / 1000;
  const chord = (config?.wingChordMm || 320) / 1000;
  const aoaDeg = config?.wingAngleOfAttackDeg || 14;

  // Swan-Neck Top-Mount Pylons (Smooth Curves Mounting to Top of Wing)
  [-span * 0.22, span * 0.22].forEach((zPos) => {
    const pylonCurve = new THREE.CubicBezierCurve3(
      new THREE.Vector3(-0.06, -0.26, zPos),
      new THREE.Vector3(-0.02, -0.12, zPos),
      new THREE.Vector3(0.04, -0.02, zPos),
      new THREE.Vector3(0.02, 0.04, zPos)
    );
    const pylonGeo = new THREE.TubeGeometry(pylonCurve, 16, 0.016, 8, false);
    const pylon = new THREE.Mesh(pylonGeo, carbonMat);
    group.add(pylon);
  });

  // Main Cambered Aerofoil Airfoil Chord
  const bladeGeo = new THREE.CylinderGeometry(chord * 0.48, chord * 0.52, span, 20);
  const bladeMesh = new THREE.Mesh(bladeGeo, carbonMat);
  bladeMesh.rotation.z = Math.PI / 2;
  bladeMesh.rotation.x = (aoaDeg * Math.PI) / 180;
  bladeMesh.scale.set(1.0, 0.035 / (chord * 0.5), 1.0);
  bladeMesh.castShadow = true;
  group.add(bladeMesh);

  // Secondary Slotted Aerofoil Flap
  const flapDepth = chord * 0.55;
  const flapGeo = new THREE.CylinderGeometry(flapDepth * 0.46, flapDepth * 0.52, span * 0.96, 16);
  const flap = new THREE.Mesh(flapGeo, carbonMat);
  flap.rotation.z = Math.PI / 2;
  flap.rotation.x = ((aoaDeg - 8) * Math.PI) / 180;
  flap.scale.set(1.0, 0.02 / (flapDepth * 0.5), 1.0);
  flap.position.set(-0.08, 0.06, 0);
  group.add(flap);

  // Vertical Endplates (LH & RH) with Spill Fences
  const endplateGeo = new THREE.BoxGeometry(chord * 1.3, 0.28, 0.012);
  [-span / 2, span / 2].forEach((sideZ) => {
    const endplate = new THREE.Mesh(endplateGeo, carbonMat);
    endplate.position.set(-0.02, 0, sideZ);
    group.add(endplate);
  });

  return group;
}
