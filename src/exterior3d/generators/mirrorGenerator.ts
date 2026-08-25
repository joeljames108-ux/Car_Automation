// ===================================================================
// THREE.JS STALK SIDE MIRRORS 3D GEOMETRY GENERATOR
// ===================================================================
// Generates aerodynamic wing mirror stalks with sculpted carbon mirror caps,
// optical reflective glass lenses, and amber LED blind-spot indicators.
// ===================================================================

import * as THREE from "three";

export function generateMirrors3DGeometry(): THREE.Group {
  const group = new THREE.Group();
  group.name = "Side_Mirrors_Assembly";

  const carbonMat = new THREE.MeshPhysicalMaterial({
    color: 0x090d16,
    roughness: 0.15,
    metalness: 0.90,
    clearcoat: 1.0,
    clearcoatRoughness: 0.02,
    reflectivity: 0.95,
  });

  const mirrorGlassMat = new THREE.MeshPhysicalMaterial({
    color: 0xc8ddf0,
    metalness: 0.99,
    roughness: 0.01,
    clearcoat: 1.0,
    reflectivity: 1.0,
  });

  const amberMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });

  [-1, 1].forEach((side) => {
    const mirrorGroup = new THREE.Group();
    mirrorGroup.position.set(0, 0, side * 0.58);

    // Aerodynamic Stalk Mount
    const stemGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.16, 8);
    const stem = new THREE.Mesh(stemGeo, carbonMat);
    stem.rotation.z = Math.PI / 3;
    stem.position.set(0, 0, 0);
    mirrorGroup.add(stem);

    // Sculpted Aerofoil Mirror Cap
    const capGeo = new THREE.SphereGeometry(0.07, 16, 12);
    const cap = new THREE.Mesh(capGeo, carbonMat);
    cap.scale.set(1.45, 0.7, 0.9);
    cap.position.set(-0.06, 0.08, side * 0.05);
    mirrorGroup.add(cap);

    // Reflective Glass Mirror Face
    const glassGeo = new THREE.BoxGeometry(0.01, 0.09, 0.14);
    const glass = new THREE.Mesh(glassGeo, mirrorGlassMat);
    glass.position.set(-0.08, 0.08, side * 0.05);
    mirrorGroup.add(glass);

    // Amber Turn Indicator Strip
    const indGeo = new THREE.BoxGeometry(0.06, 0.008, 0.012);
    const ind = new THREE.Mesh(indGeo, amberMat);
    ind.position.set(-0.02, 0.08, side * 0.08);
    mirrorGroup.add(ind);

    group.add(mirrorGroup);
  });

  return group;
}
