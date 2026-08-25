// ===================================================================
// THREE.JS FRAMELESS SIDE WINDOW GLASS 3D GEOMETRY GENERATOR
// ===================================================================
// Generates frameless teardrop side door window glass with privacy tint,
// black weatherstrip border trim, and B-pillar curvature.
// ===================================================================

import * as THREE from "three";

export function generateSideGlass3DGeometry(): THREE.Group {
  const group = new THREE.Group();
  group.name = "Side_Glass_Assembly";

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x1e293b,
    transmission: 0.78,
    opacity: 0.55,
    transparent: true,
    roughness: 0.02,
    metalness: 0.05,
    ior: 1.54,
    name: "Tinted_Quarter_Glass",
  });

  const trimMat = new THREE.MeshStandardMaterial({
    color: 0x0a0c10,
    roughness: 0.95,
    metalness: 0.05,
  });

  [-1, 1].forEach((side) => {
    const glassGroup = new THREE.Group();
    glassGroup.position.set(0, 0, side * 0.48);

    // Teardrop Side Window Glass
    const glassGeo = new THREE.BoxGeometry(0.82, 0.28, 0.008);
    const glass = new THREE.Mesh(glassGeo, glassMat);
    glass.rotation.y = side * 0.04;
    glassGroup.add(glass);

    // Weatherstripping Perimeter Border
    const trimGeo = new THREE.BoxGeometry(0.84, 0.015, 0.012);
    const topTrim = new THREE.Mesh(trimGeo, trimMat);
    topTrim.position.set(0, 0.14, 0);
    const bottomTrim = new THREE.Mesh(trimGeo, trimMat);
    bottomTrim.position.set(0, -0.14, 0);
    glassGroup.add(topTrim, bottomTrim);

    group.add(glassGroup);
  });

  return group;
}
