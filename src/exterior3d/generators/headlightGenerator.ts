// ===================================================================
// THREE.JS MATRIX LED HEADLIGHTS 3D GEOMETRY GENERATOR
// ===================================================================

import * as THREE from "three";

export function generateHeadlights3DGeometry(): THREE.Group {
  const group = new THREE.Group();
  group.name = "Headlights_Assembly";

  // Carbon Bezel Shell
  const shellMat = new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.3, metalness: 0.8 });
  const lensMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transmission: 0.95,
    opacity: 1,
    transparent: true,
    roughness: 0.05,
    ior: 1.52,
  });
  const emissiveMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0x38bdf8,
    emissiveIntensity: 2.5,
  });

  // Left Headlight Housing
  const headGeo = new THREE.BoxGeometry(0.35, 0.18, 0.22);
  const leftHead = new THREE.Mesh(headGeo, shellMat);
  leftHead.position.set(0, 0, 0.45);
  group.add(leftHead);

  // Left Projector Lens
  const projGeo = new THREE.SphereGeometry(0.06, 16, 16);
  const leftProj = new THREE.Mesh(projGeo, emissiveMat);
  leftProj.position.set(0.12, 0, 0.45);
  group.add(leftProj);

  // Right Headlight Housing
  const rightHead = new THREE.Mesh(headGeo, shellMat);
  rightHead.position.set(0, 0, -0.45);
  group.add(rightHead);

  const rightProj = new THREE.Mesh(projGeo, emissiveMat);
  rightProj.position.set(0.12, 0, -0.45);
  group.add(rightProj);

  return group;
}
