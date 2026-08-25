// ===================================================================
// THREE.JS 3D OLED FULL-WIDTH TAILLIGHT LIGHTBAR GENERATOR
// ===================================================================
// Generates continuous 3D OLED full-width taillight lightbar with dark
// smoked acrylic housing, volumetric light guides, and sequential amber indicators.
// ===================================================================

import * as THREE from "three";

export function generateTaillights3DGeometry(): THREE.Group {
  const group = new THREE.Group();
  group.name = "Taillights_Assembly";

  const housingMat = new THREE.MeshPhysicalMaterial({
    color: 0x09090b,
    metalness: 0.95,
    roughness: 0.05,
    clearcoat: 1.0,
  });

  const oledRedMat = new THREE.MeshBasicMaterial({
    color: 0xef4444,
  });

  const amberMat = new THREE.MeshBasicMaterial({
    color: 0xf59e0b,
  });

  // Dark Acrylic Lightbar Housing
  const barHousingGeo = new THREE.BoxGeometry(0.12, 0.06, 1.45);
  const barHousing = new THREE.Mesh(barHousingGeo, housingMat);
  barHousing.castShadow = true;
  group.add(barHousing);

  // Full-Width Continuous OLED Diffuser Blade
  const bladeGeo = new THREE.BoxGeometry(0.04, 0.025, 1.42);
  const blade = new THREE.Mesh(bladeGeo, oledRedMat);
  blade.position.set(0.04, 0, 0);
  group.add(blade);

  // Sequential Amber Turn Guide Blades (LH & RH Outboard Ends)
  [-0.64, 0.64].forEach((endZ) => {
    const turnGeo = new THREE.BoxGeometry(0.035, 0.012, 0.12);
    const turn = new THREE.Mesh(turnGeo, amberMat);
    turn.position.set(0.04, -0.015, endZ);
    group.add(turn);
  });

  return group;
}
