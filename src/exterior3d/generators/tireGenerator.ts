// ===================================================================
// THREE.JS MOTORSPORT TIRES 3D GEOMETRY GENERATOR
// ===================================================================

import * as THREE from "three";

export function generateTire3DGeometry(): THREE.Group {
  const group = new THREE.Group();
  group.name = "Tire_Assembly";

  const tireMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.85,
    metalness: 0.1,
    name: "Tire_Rubber_Material",
  });

  const tireGeo = new THREE.TorusGeometry(0.32, 0.10, 16, 32);
  const tireMesh = new THREE.Mesh(tireGeo, tireMat);
  tireMesh.rotation.y = Math.PI / 2;
  tireMesh.castShadow = true;
  group.add(tireMesh);

  return group;
}
