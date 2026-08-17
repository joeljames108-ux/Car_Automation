// ===================================================================
// THREE.JS MULTILINK REAR SUSPENSION 3D GENERATOR
// ===================================================================

import * as THREE from "three";

export function generateRearSuspension3DGeometry(): THREE.Group {
  const group = new THREE.Group();
  group.name = "Rear_Suspension_Assembly";

  const armMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.3, metalness: 0.8 });

  // 5 Control Links
  for (let i = 0; i < 5; i++) {
    const linkGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.35, 12);
    const linkMesh = new THREE.Mesh(linkGeo, armMat);
    linkMesh.position.set(0, -0.1 + i * 0.05, (i - 2) * 0.06);
    linkMesh.rotation.z = Math.PI / 2;
    group.add(linkMesh);
  }

  return group;
}
