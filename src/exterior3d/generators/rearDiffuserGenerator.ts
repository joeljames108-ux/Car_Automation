// ===================================================================
// THREE.JS VENTURI REAR DIFFUSER 3D GEOMETRY GENERATOR
// ===================================================================

import * as THREE from "three";
import type { AeroSurfaceConfig } from "../../sim/types/exterior";

export function generateRearDiffuser3DGeometry(
  config?: Partial<AeroSurfaceConfig>
): THREE.Group {
  const group = new THREE.Group();
  group.name = "Rear_Diffuser_Assembly";

  const carbonMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.25,
    metalness: 0.9,
    name: "Carbon_Aero_Material",
  });

  const finCount = config?.diffuserFinCount || 7;
  const angleDeg = config?.diffuserExpansionAngleDeg || 14;

  // Main Diffuser Upward-Slanted Tray
  const trayGeo = new THREE.BoxGeometry(0.55, 0.02, 0.95);
  const trayMesh = new THREE.Mesh(trayGeo, carbonMat);
  trayMesh.rotation.z = (angleDeg * Math.PI) / 180;
  trayMesh.castShadow = true;
  group.add(trayMesh);

  // Vertical Aerodynamic Strakes / Fins
  const finGeo = new THREE.BoxGeometry(0.45, 0.08, 0.015);
  const zStep = 0.85 / (finCount - 1);

  for (let i = 0; i < finCount; i++) {
    const zPos = -0.425 + i * zStep;
    const finMesh = new THREE.Mesh(finGeo, carbonMat);
    finMesh.position.set(0, -0.04, zPos);
    finMesh.rotation.z = (angleDeg * Math.PI) / 180;
    group.add(finMesh);
  }

  return group;
}
