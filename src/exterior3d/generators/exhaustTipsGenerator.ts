// ===================================================================
// THREE.JS QUAD TITANIUM EXHAUST TIPS 3D GEOMETRY GENERATOR
// ===================================================================

import * as THREE from "three";

export function generateExhaustTips3DGeometry(): THREE.Group {
  const group = new THREE.Group();
  group.name = "Exhaust_Tips_Surround_Assembly";

  const titaniumMat = new THREE.MeshStandardMaterial({
    color: 0x93c5fd,
    roughness: 0.20,
    metalness: 0.95,
    name: "Billet_Titanium_Heat_Tinted",
  });

  const tipBurnMat = new THREE.MeshStandardMaterial({
    color: 0x6366f1,
    roughness: 0.18,
    metalness: 0.92,
    name: "Titanium_Flame_Tip_Tint",
  });

  const carbonSurroundMat = new THREE.MeshStandardMaterial({
    color: 0x111827,
    roughness: 0.32,
    metalness: 0.45,
    name: "Carbon_Exhaust_Surround",
  });

  // Carbon Fiber Apron Surround Trim
  const surroundGeo = new THREE.BoxGeometry(0.78, 0.14, 0.025);
  const surroundMesh = new THREE.Mesh(surroundGeo, carbonSurroundMat);
  group.add(surroundMesh);

  // Quad Titanium Tailpipe Exhaust Tips (-0.28m, -0.18m, 0.18m, 0.28m)
  const tipPositions = [-0.28, -0.18, 0.18, 0.28];
  tipPositions.forEach((px) => {
    // Pipe Barrel
    const pipeGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.16, 24);
    pipeGeo.rotateX(Math.PI / 2);
    const pipeMesh = new THREE.Mesh(pipeGeo, titaniumMat);
    pipeMesh.position.set(px, 0, 0.04);
    group.add(pipeMesh);

    // Anodized Flame Burn Ring
    const ringGeo = new THREE.TorusGeometry(0.045, 0.006, 16, 24);
    const ringMesh = new THREE.Mesh(ringGeo, tipBurnMat);
    ringMesh.position.set(px, 0, 0.12);
    group.add(ringMesh);
  });

  return group;
}
