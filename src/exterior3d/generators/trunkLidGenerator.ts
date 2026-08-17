// ===================================================================
// THREE.JS REAR TRUNK DECKLID 3D GEOMETRY GENERATOR
// ===================================================================

import * as THREE from "three";

export function generateTrunkLid3DGeometry(): THREE.Group {
  const group = new THREE.Group();
  group.name = "Trunk_Decklid_Assembly";

  const trunkMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    roughness: 0.15,
    metalness: 0.85,
    name: "Body_Paint_Primary",
  });

  const trunkGeo = new THREE.BoxGeometry(0.75, 0.04, 0.70);
  const trunkMesh = new THREE.Mesh(trunkGeo, trunkMat);
  trunkMesh.castShadow = true;
  group.add(trunkMesh);

  return group;
}
