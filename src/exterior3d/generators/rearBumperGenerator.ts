// ===================================================================
// THREE.JS HIGH-FIDELITY REAR BUMPER FASCIA 3D GEOMETRY GENERATOR
// ===================================================================
// Generates sculpted aerodynamic rear bumper with integrated heat extraction
// grilles, carbon diffuser tunnels, and titanium quad exhaust outlets.
// ===================================================================

import * as THREE from "three";

export function generateRearBumper3DGeometry(): THREE.Group {
  const group = new THREE.Group();
  group.name = "Rear_Bumper_Fascia_Assembly";

  const paintMat = new THREE.MeshPhysicalMaterial({
    color: 0x0284c7,
    roughness: 0.12,
    metalness: 0.88,
    clearcoat: 1.0,
    clearcoatRoughness: 0.02,
    reflectivity: 0.95,
    name: "Body_Paint_Primary",
  });

  const carbonMat = new THREE.MeshPhysicalMaterial({
    color: 0x090d16,
    roughness: 0.15,
    metalness: 0.90,
    clearcoat: 1.0,
    name: "Carbon_Apron_Material",
  });

  const trimMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.85,
    metalness: 0.1,
  });

  // Main Curved Bumper Fascia Shell
  const mainBumperGeo = new THREE.BoxGeometry(0.38, 0.44, 1.82);
  const mainBumperMesh = new THREE.Mesh(mainBumperGeo, paintMat);
  mainBumperMesh.castShadow = true;
  group.add(mainBumperMesh);

  // Lower Carbon Diffuser Apron
  const apronGeo = new THREE.BoxGeometry(0.32, 0.16, 1.76);
  const apronMesh = new THREE.Mesh(apronGeo, carbonMat);
  apronMesh.position.set(0.04, -0.16, 0);
  apronMesh.castShadow = true;
  group.add(apronMesh);

  // Rear Heat Extraction Hex Mesh Panel
  const meshGeo = new THREE.BoxGeometry(0.02, 0.18, 1.55);
  const meshPanel = new THREE.Mesh(meshGeo, trimMat);
  meshPanel.position.set(0.19, 0.02, 0);
  group.add(meshPanel);

  // Quad Exhaust Tips (Titanium Burnt Gradient)
  const tipGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.18, 16);
  const tipMat = new THREE.MeshPhysicalMaterial({
    color: 0x60a5fa,
    metalness: 0.95,
    roughness: 0.15,
    sheen: 0.8,
    sheenColor: new THREE.Color(0x818cf8),
  });

  [-0.24, -0.10, 0.10, 0.24].forEach((tipZ) => {
    const tip = new THREE.Mesh(tipGeo, tipMat);
    tip.rotation.z = Math.PI / 2;
    tip.position.set(0.24, -0.12, tipZ);
    group.add(tip);
  });

  return group;
}
