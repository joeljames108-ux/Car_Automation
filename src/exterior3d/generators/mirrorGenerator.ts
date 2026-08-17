// ===================================================================
// THREE.JS STALK SIDE MIRRORS 3D GEOMETRY GENERATOR
// ===================================================================

import * as THREE from "three";

export function generateMirrors3DGeometry(): THREE.Group {
  const group = new THREE.Group();
  group.name = "Side_Mirrors_Assembly";

  const carbonMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.2,
    metalness: 0.9,
  });

  // Left Mirror Housing
  const mirrorGeo = new THREE.BoxGeometry(0.18, 0.12, 0.08);
  const leftMirror = new THREE.Mesh(mirrorGeo, carbonMat);
  leftMirror.position.set(0, 0, 0.58);
  group.add(leftMirror);

  // Right Mirror Housing
  const rightMirror = new THREE.Mesh(mirrorGeo, carbonMat);
  rightMirror.position.set(0, 0, -0.58);
  group.add(rightMirror);

  return group;
}
