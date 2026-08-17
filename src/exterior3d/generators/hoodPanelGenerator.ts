// ===================================================================
// THREE.JS AERO HOOD PANEL 3D GEOMETRY GENERATOR
// ===================================================================

import * as THREE from "three";
import type { ExteriorEngineeringConfig } from "../../sim/types/exterior";

export function generateHoodPanel3DGeometry(
  config?: Partial<ExteriorEngineeringConfig>
): THREE.Group {
  const group = new THREE.Group();
  group.name = "Hood_Panel_Assembly";

  const hoodMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    roughness: 0.15,
    metalness: 0.85,
    name: "Body_Paint_Primary",
  });

  // Sculpted Hood Outer Skin Curve
  const hoodShape = new THREE.Shape();
  hoodShape.moveTo(0, -0.65);
  hoodShape.lineTo(1.15, -0.55);
  hoodShape.lineTo(1.15, 0.55);
  hoodShape.lineTo(0, 0.65);
  hoodShape.closePath();

  const extrudeSettings = {
    steps: 2,
    depth: 0.03,
    bevelEnabled: true,
    bevelThickness: 0.015,
    bevelSize: 0.015,
    bevelSegments: 4,
  };

  const hoodGeo = new THREE.ExtrudeGeometry(hoodShape, extrudeSettings);
  const hoodMesh = new THREE.Mesh(hoodGeo, hoodMat);
  hoodMesh.rotation.x = Math.PI / 2;
  hoodMesh.rotation.z = Math.PI / 2;
  hoodMesh.castShadow = true;
  hoodMesh.receiveShadow = true;
  group.add(hoodMesh);

  // Dual Radiator Heat Extraction Vents (Left & Right)
  const ventMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.4,
    metalness: 0.6,
  });

  const ventGeo = new THREE.BoxGeometry(0.25, 0.02, 0.14);
  const leftVent = new THREE.Mesh(ventGeo, ventMat);
  leftVent.position.set(0.35, 0.02, 0.28);
  group.add(leftVent);

  const rightVent = new THREE.Mesh(ventGeo, ventMat);
  rightVent.position.set(0.35, 0.02, -0.28);
  group.add(rightVent);

  return group;
}
