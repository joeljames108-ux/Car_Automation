// ===================================================================
// THREE.JS VENTURI REAR DIFFUSER 3D GEOMETRY GENERATOR
// ===================================================================
// Generates functional multi-channel underbody venturi diffuser with
// upward expansion ramp, vertical vortex strakes, and central FIA rain light.
// ===================================================================

import * as THREE from "three";
import type { AeroSurfaceConfig } from "../../sim/types/exterior";

export function generateRearDiffuser3DGeometry(
  config?: Partial<AeroSurfaceConfig>
): THREE.Group {
  const group = new THREE.Group();
  group.name = "Rear_Diffuser_Assembly";

  const carbonMat = new THREE.MeshPhysicalMaterial({
    color: 0x090d16,
    roughness: 0.15,
    metalness: 0.90,
    clearcoat: 1.0,
    clearcoatRoughness: 0.02,
    reflectivity: 0.95,
    name: "Carbon_Aero_Material",
  });

  const rainLightMat = new THREE.MeshBasicMaterial({
    color: 0xef4444,
  });

  const finCount = config?.diffuserFinCount || 6;
  const angleDeg = config?.diffuserExpansionAngleDeg || 14;
  const width = 1.25;

  // Main Diffuser Upward Expansion Carbon Tray
  const trayGeo = new THREE.BoxGeometry(0.68, 0.018, width);
  const trayMesh = new THREE.Mesh(trayGeo, carbonMat);
  trayMesh.rotation.z = (angleDeg * Math.PI) / 180;
  trayMesh.castShadow = true;
  group.add(trayMesh);

  // Vertical Aerodynamic Vortex Strakes
  const strakeGeo = new THREE.BoxGeometry(0.62, 0.12, 0.012);
  const zStep = (width * 0.88) / (finCount - 1);

  for (let i = 0; i < finCount; i++) {
    const zPos = -(width * 0.44) + i * zStep;
    const strake = new THREE.Mesh(strakeGeo, carbonMat);
    strake.position.set(0, -0.05, zPos);
    strake.rotation.z = (angleDeg * Math.PI) / 180;
    group.add(strake);
  }

  // Central FIA Motorsport Rain Light
  const rainLightGeo = new THREE.BoxGeometry(0.06, 0.035, 0.08);
  const rainLight = new THREE.Mesh(rainLightGeo, rainLightMat);
  rainLight.position.set(0.32, 0.04, 0);
  group.add(rainLight);

  return group;
}
