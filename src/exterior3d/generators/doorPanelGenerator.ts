// ===================================================================
// THREE.JS BUTTERFLY / SIDE DOORS 3D GEOMETRY GENERATOR
// ===================================================================

import * as THREE from "three";

export function generateDoors3DGeometry(): THREE.Group {
  const group = new THREE.Group();
  group.name = "Doors_Assembly";

  const doorMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    roughness: 0.15,
    metalness: 0.85,
    name: "Body_Paint_Primary",
  });

  // Left Door Outer Shell
  const doorGeo = new THREE.BoxGeometry(0.95, 0.55, 0.06);
  const leftDoor = new THREE.Mesh(doorGeo, doorMat);
  leftDoor.position.set(0, 0, 0.48);
  leftDoor.castShadow = true;
  group.add(leftDoor);

  // Right Door Outer Shell
  const rightDoor = new THREE.Mesh(doorGeo, doorMat);
  rightDoor.position.set(0, 0, -0.48);
  rightDoor.castShadow = true;
  group.add(rightDoor);

  return group;
}
