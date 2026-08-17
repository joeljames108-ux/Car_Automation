// ===================================================================
// THREE.JS HEATED REAR WINDOW BACKLITE 3D GEOMETRY GENERATOR
// ===================================================================

import * as THREE from "three";

export function generateRearWindow3DGeometry(): THREE.Group {
  const group = new THREE.Group();
  group.name = "Rear_Window_Assembly";

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x38bdf8,
    transmission: 0.85,
    opacity: 1,
    transparent: true,
    roughness: 0.02,
    ior: 1.52,
  });

  const rearGeo = new THREE.BoxGeometry(0.75, 0.55, 0.015);
  const rearMesh = new THREE.Mesh(rearGeo, glassMat);
  rearMesh.rotation.z = 0.65;
  rearMesh.castShadow = true;
  group.add(rearMesh);

  return group;
}
