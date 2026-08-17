// ===================================================================
// THREE.JS FORGED WHEEL RIMS 3D GEOMETRY GENERATOR
// ===================================================================

import * as THREE from "three";
import type { ExteriorWheelConfig } from "../../sim/types/exterior";

export function generateWheel3DGeometry(config?: Partial<ExteriorWheelConfig>): THREE.Group {
  const group = new THREE.Group();
  group.name = "Wheel_Rim_Assembly";

  const wheelMat = new THREE.MeshStandardMaterial({
    color: config?.finish === "satin_bronze" ? 0xd97706 : 0x1e293b,
    roughness: 0.25,
    metalness: 0.85,
    name: "Wheel_Rim_Material",
  });

  // Outer Rim Barrel
  const rimGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.24, 32);
  const rimMesh = new THREE.Mesh(rimGeo, wheelMat);
  rimMesh.rotation.x = Math.PI / 2;
  rimMesh.castShadow = true;
  group.add(rimMesh);

  // Center Hub & Nut
  const hubGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.26, 16);
  const hubMesh = new THREE.Mesh(hubGeo, new THREE.MeshStandardMaterial({ color: 0xdc2626 }));
  hubMesh.rotation.x = Math.PI / 2;
  group.add(hubMesh);

  return group;
}
