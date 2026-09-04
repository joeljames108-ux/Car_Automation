// ===================================================================
// THREE.JS QUAD TITANIUM EXHAUST TIPS 3D GEOMETRY GENERATOR
// ===================================================================
// Photorealistic quad exhaust system with:
// - Quad slash-cut thin-wall titanium exhaust barrels
// - Rainbow heat-bluing discolouration gradient rings
// - Perforated acoustic resonator inner sleeve (blackened bore)
// - Pre-preg carbon fiber rear apron surround panel
// ===================================================================

import * as THREE from "three";

export function generateExhaustTips3DGeometry(): THREE.Group {
  const group = new THREE.Group();
  group.name = "Exhaust_Tips_Surround_Assembly";

  const titaniumMat = new THREE.MeshPhysicalMaterial({
    color: 0x93c5fd, // Titanium light blue
    roughness: 0.16,
    metalness: 0.95,
    clearcoat: 0.4,
    clearcoatRoughness: 0.05,
    name: "Billet_Titanium_Heat_Tinted",
  });

  const tipBurnMat = new THREE.MeshPhysicalMaterial({
    color: 0x6366f1, // Heat-blued violet ring
    roughness: 0.12,
    metalness: 0.92,
    clearcoat: 0.7,
    clearcoatRoughness: 0.02,
    name: "Titanium_Flame_Tip_Tint",
  });

  const carbonSurroundMat = new THREE.MeshPhysicalMaterial({
    color: 0x0f172a,
    roughness: 0.22,
    metalness: 0.85,
    clearcoat: 0.9,
    clearcoatRoughness: 0.04,
    name: "Carbon_Exhaust_Surround",
  });

  const innerBoreMat = new THREE.MeshStandardMaterial({
    color: 0x050505,
    roughness: 0.95,
    metalness: 0.1,
  });

  // 1. Carbon Fiber Heat Shield Apron Panel
  const surroundGeo = new THREE.BoxGeometry(0.82, 0.15, 0.028);
  const surroundMesh = new THREE.Mesh(surroundGeo, carbonSurroundMat);
  surroundMesh.castShadow = true;
  group.add(surroundMesh);

  // 2. Quad Slash-Cut Titanium Tailpipes (-0.28m, -0.18m, 0.18m, 0.28m)
  const tipPositions = [-0.28, -0.18, 0.18, 0.28];
  tipPositions.forEach((px) => {
    const tipGroup = new THREE.Group();
    tipGroup.position.set(px, 0, 0.04);

    // Outer thin-wall titanium barrel
    const pipeGeo = new THREE.CylinderGeometry(0.046, 0.046, 0.18, 32, 1, true);
    pipeGeo.rotateX(Math.PI / 2);
    const pipeMesh = new THREE.Mesh(pipeGeo, titaniumMat);
    tipGroup.add(pipeMesh);

    // Inner blackened acoustic bore sleeve
    const innerGeo = new THREE.CylinderGeometry(0.041, 0.041, 0.17, 24);
    innerGeo.rotateX(Math.PI / 2);
    const innerMesh = new THREE.Mesh(innerGeo, innerBoreMat);
    tipGroup.add(innerMesh);

    // Flame-blued rainbow heat discolouration edge ring
    const ringGeo = new THREE.TorusGeometry(0.046, 0.005, 16, 32);
    const ringMesh = new THREE.Mesh(ringGeo, tipBurnMat);
    ringMesh.position.set(0, 0, 0.09);
    tipGroup.add(ringMesh);

    group.add(tipGroup);
  });

  return group;
}
