// ===================================================================
// THREE.JS DOUBLE-BUBBLE ROOF PANEL 3D GEOMETRY GENERATOR
// ===================================================================

import * as THREE from "three";

export function generateRoofPanel3DGeometry(): THREE.Group {
  const group = new THREE.Group();
  group.name = "Roof_Panel_Assembly";

  const roofMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.25,
    metalness: 0.85,
    name: "Contrast_Roof_Carbon",
  });

  const roofGeo = new THREE.BoxGeometry(0.85, 0.04, 0.75);
  const roofMesh = new THREE.Mesh(roofGeo, roofMat);
  roofMesh.castShadow = true;
  group.add(roofMesh);

  return group;
}
