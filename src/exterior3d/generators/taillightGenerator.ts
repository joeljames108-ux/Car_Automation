// ===================================================================
// THREE.JS 3D OLED TAILLIGHT STRIP 3D GEOMETRY GENERATOR
// ===================================================================

import * as THREE from "three";

export function generateTaillights3DGeometry(): THREE.Group {
  const group = new THREE.Group();
  group.name = "Taillights_Assembly";

  const oledMat = new THREE.MeshStandardMaterial({
    color: 0xdc2626,
    emissive: 0xff0040,
    emissiveIntensity: 2.0,
    roughness: 0.1,
  });

  // Full-Width Lightbar
  const barGeo = new THREE.BoxGeometry(0.08, 0.06, 1.25);
  const barMesh = new THREE.Mesh(barGeo, oledMat);
  barMesh.castShadow = true;
  group.add(barMesh);

  return group;
}
