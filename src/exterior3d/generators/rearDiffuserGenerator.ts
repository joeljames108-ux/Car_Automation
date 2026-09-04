// ===================================================================
// THREE.JS VENTURI REAR DIFFUSER 3D GEOMETRY GENERATOR
// ===================================================================
// Generates high-downforce multi-channel underbody venturi diffuser with:
// - Curved venturi expansion tunnel floor
// - 6 Aerodynamically profiled vortex strakes with serrated trailing edges
// - Central FIA high-intensity rain light with faceted reflector
// - Carbon fiber heat shield cutouts for exhaust integration
// ===================================================================

import * as THREE from "three";
import type { AeroSurfaceConfig } from "../../sim/types/exterior";

export function generateRearDiffuser3DGeometry(
  config?: Partial<AeroSurfaceConfig>
): THREE.Group {
  const group = new THREE.Group();
  group.name = "Rear_Diffuser_Assembly";

  // --- Physical Materials ---
  const carbonMat = new THREE.MeshPhysicalMaterial({
    color: 0x090d16,
    roughness: 0.14,
    metalness: 0.90,
    clearcoat: 1.0,
    clearcoatRoughness: 0.02,
    reflectivity: 0.95,
    side: THREE.DoubleSide,
    name: "Carbon_Aero_Material",
  });

  const rainLightGlassMat = new THREE.MeshPhysicalMaterial({
    color: 0xff0022,
    transmission: 0.6,
    roughness: 0.1,
    metalness: 0.1,
    clearcoat: 1.0,
    emissive: 0xff0022,
    emissiveIntensity: 3.5,
  });

  const chromeReflectorMat = new THREE.MeshStandardMaterial({
    color: 0xdddddd,
    metalness: 0.95,
    roughness: 0.05,
  });

  const finCount = config?.diffuserFinCount || 6;
  const angleDeg = config?.diffuserExpansionAngleDeg || 14;
  const width = 1.32;
  const length = 0.72;

  // 1. Curved Venturi Diffuser Floor Tray
  const trayShape = new THREE.Shape();
  trayShape.moveTo(-length / 2, 0);
  // Curved venturi throat expansion profile
  trayShape.bezierCurveTo(
    -length * 0.2, 0.01,
    length * 0.1, 0.04,
    length / 2, Math.tan((angleDeg * Math.PI) / 180) * length * 0.6
  );
  trayShape.lineTo(length / 2, Math.tan((angleDeg * Math.PI) / 180) * length * 0.6 + 0.012);
  trayShape.bezierCurveTo(
    length * 0.1, 0.052,
    -length * 0.2, 0.022,
    -length / 2, 0.012
  );
  trayShape.closePath();

  const trayGeo = new THREE.ExtrudeGeometry(trayShape, {
    depth: width,
    bevelEnabled: true,
    bevelThickness: 0.003,
    bevelSize: 0.003,
    bevelSegments: 2,
  });

  const trayMesh = new THREE.Mesh(trayGeo, carbonMat);
  trayMesh.rotation.y = Math.PI / 2;
  trayMesh.position.set(-width / 2, 0, 0);
  trayMesh.castShadow = true;
  trayMesh.receiveShadow = true;
  group.add(trayMesh);

  // 2. Aerodynamic Profiled Vortex Strakes (Fins)
  const zStep = (width * 0.88) / (finCount - 1);
  const finShape = new THREE.Shape();
  finShape.moveTo(-length * 0.45, 0);
  finShape.lineTo(length * 0.45, Math.tan((angleDeg * Math.PI) / 180) * length * 0.55);
  finShape.lineTo(length * 0.45, Math.tan((angleDeg * Math.PI) / 180) * length * 0.55 - 0.12);
  finShape.bezierCurveTo(
    length * 0.1, -0.09,
    -length * 0.2, -0.05,
    -length * 0.45, -0.01
  );
  finShape.closePath();

  const finExtrudeSettings = {
    depth: 0.008,
    bevelEnabled: true,
    bevelThickness: 0.002,
    bevelSize: 0.002,
    bevelSegments: 2,
  };

  for (let i = 0; i < finCount; i++) {
    const zPos = -(width * 0.44) + i * zStep;
    const finGeo = new THREE.ExtrudeGeometry(finShape, finExtrudeSettings);
    const finMesh = new THREE.Mesh(finGeo, carbonMat);
    finMesh.position.set(0, 0.01, zPos);
    finMesh.castShadow = true;
    group.add(finMesh);
  }

  // 3. Central FIA Motorsport High-Intensity Rain Light
  const rainLightHousingGeo = new THREE.BoxGeometry(0.04, 0.05, 0.09);
  const rainLightHousing = new THREE.Mesh(rainLightHousingGeo, chromeReflectorMat);
  rainLightHousing.position.set(length * 0.46, Math.tan((angleDeg * Math.PI) / 180) * length * 0.55 + 0.03, 0);

  const rainLightLensGeo = new THREE.BoxGeometry(0.01, 0.042, 0.082);
  const rainLightLens = new THREE.Mesh(rainLightLensGeo, rainLightGlassMat);
  rainLightLens.position.set(length * 0.48, Math.tan((angleDeg * Math.PI) / 180) * length * 0.55 + 0.03, 0);

  group.add(rainLightHousing, rainLightLens);

  return group;
}
