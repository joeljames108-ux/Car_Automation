// ===================================================================
// THREE.JS BUMPER FOG & DRL PROJECTOR LIGHTS 3D GEOMETRY GENERATOR
// ===================================================================

import * as THREE from "three";

export function generateFogLights3DGeometry(): THREE.Group {
  const group = new THREE.Group();
  group.name = "Fog_Lights_Assembly";

  const fogMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0x38bdf8,
    emissiveIntensity: 1.8,
  });

  // Left Fog Light Pod
  const podGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.06, 16);
  const leftPod = new THREE.Mesh(podGeo, fogMat);
  leftPod.position.set(0, 0, 0.42);
  leftPod.rotation.z = Math.PI / 2;
  group.add(leftPod);

  // Right Fog Light Pod
  const rightPod = new THREE.Mesh(podGeo, fogMat);
  rightPod.position.set(0, 0, -0.42);
  rightPod.rotation.z = Math.PI / 2;
  group.add(rightPod);

  return group;
}
