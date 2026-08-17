// ===================================================================
// THREE.JS FRAMELESS SIDE WINDOW GLASS 3D GEOMETRY GENERATOR
// ===================================================================

import * as THREE from "three";

export function generateSideGlass3DGeometry(): THREE.Group {
  const group = new THREE.Group();
  group.name = "Side_Glass_Assembly";

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x38bdf8,
    transmission: 0.88,
    opacity: 1,
    transparent: true,
    roughness: 0.02,
    ior: 1.52,
  });

  // Left Window Glass
  const glassGeo = new THREE.BoxGeometry(0.85, 0.35, 0.01);
  const leftGlass = new THREE.Mesh(glassGeo, glassMat);
  leftGlass.position.set(0, 0, 0.48);
  group.add(leftGlass);

  // Right Window Glass
  const rightGlass = new THREE.Mesh(glassGeo, glassMat);
  rightGlass.position.set(0, 0, -0.48);
  group.add(rightGlass);

  return group;
}
