// ===================================================================
// THREE.JS DOUBLE WISHBONE FRONT SUSPENSION 3D GENERATOR
// ===================================================================

import * as THREE from "three";

export function generateFrontSuspension3DGeometry(): THREE.Group {
  const group = new THREE.Group();
  group.name = "Front_Suspension_Assembly";

  const armMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.3, metalness: 0.8 });
  const springMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.2, metalness: 0.8 });

  // Upper Control Arm
  const upperGeo = new THREE.BoxGeometry(0.35, 0.03, 0.25);
  const upperMesh = new THREE.Mesh(upperGeo, armMat);
  upperMesh.position.set(0, 0.15, 0);
  group.add(upperMesh);

  // Lower Control Arm
  const lowerGeo = new THREE.BoxGeometry(0.45, 0.04, 0.30);
  const lowerMesh = new THREE.Mesh(lowerGeo, armMat);
  lowerMesh.position.set(0, -0.15, 0);
  group.add(lowerMesh);

  // Coilover Damper Tube
  const coilGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.35, 16);
  const coilMesh = new THREE.Mesh(coilGeo, springMat);
  coilMesh.position.set(0, 0, 0);
  group.add(coilMesh);

  return group;
}
