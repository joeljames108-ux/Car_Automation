// ===================================================================
// THREE.JS CURVED WINDSHIELD GLASS 3D GEOMETRY GENERATOR
// ===================================================================

import * as THREE from "three";

export function generateWindshield3DGeometry(): THREE.Group {
  const group = new THREE.Group();
  group.name = "Windshield_Glass_Assembly";

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x38bdf8,
    transmission: 0.92,
    opacity: 1,
    transparent: true,
    roughness: 0.02,
    ior: 1.52,
    name: "Glass_Physical_Material",
  });

  const shieldGeo = new THREE.BoxGeometry(0.85, 0.65, 0.015);
  const shieldMesh = new THREE.Mesh(shieldGeo, glassMat);
  shieldMesh.rotation.z = -0.55;
  shieldMesh.castShadow = true;
  group.add(shieldMesh);

  return group;
}
