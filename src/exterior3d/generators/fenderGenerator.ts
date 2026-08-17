// ===================================================================
// THREE.JS SCULPTED FRONT FENDERS 3D GEOMETRY GENERATOR
// ===================================================================

import * as THREE from "three";

export function generateFenders3DGeometry(): THREE.Group {
  const group = new THREE.Group();
  group.name = "Front_Fenders_Assembly";

  const fenderMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    roughness: 0.15,
    metalness: 0.85,
    name: "Body_Paint_Primary",
  });

  // Left Fender Arch Sheet
  const fenderGeo = new THREE.BoxGeometry(0.85, 0.45, 0.08);
  const leftFender = new THREE.Mesh(fenderGeo, fenderMat);
  leftFender.position.set(0, 0, 0.45);
  leftFender.castShadow = true;
  group.add(leftFender);

  // Right Fender Arch Sheet
  const rightFender = new THREE.Mesh(fenderGeo, fenderMat);
  rightFender.position.set(0, 0, -0.45);
  rightFender.castShadow = true;
  group.add(rightFender);

  return group;
}
