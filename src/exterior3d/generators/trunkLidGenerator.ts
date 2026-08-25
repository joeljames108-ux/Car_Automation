// ===================================================================
// THREE.JS REAR TRUNK DECKLID 3D GEOMETRY GENERATOR
// ===================================================================
// Generates aerodynamic sculpted rear engine decklid with cooling louvers,
// carbon ducktail spoiler lip, and quick-release fasteners.
// ===================================================================

import * as THREE from "three";

export function generateTrunkLid3DGeometry(): THREE.Group {
  const group = new THREE.Group();
  group.name = "Trunk_Decklid_Assembly";

  const trunkMat = new THREE.MeshPhysicalMaterial({
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
    name: "Carbon_Deck_Trim",
  });

  // Sculpted Decklid Outer Shell
  const trunkGeo = new THREE.BoxGeometry(0.78, 0.045, 0.74);
  const trunkMesh = new THREE.Mesh(trunkGeo, trunkMat);
  trunkMesh.castShadow = true;
  group.add(trunkMesh);

  // Engine Heat Extraction Louvers
  const louverGeo = new THREE.BoxGeometry(0.42, 0.015, 0.38);
  const louverMesh = new THREE.Mesh(louverGeo, carbonMat);
  louverMesh.position.set(0, 0.025, -0.04);
  group.add(louverMesh);

  // Integrated Carbon Ducktail Lip
  const ducktailGeo = new THREE.BoxGeometry(0.10, 0.045, 0.72);
  const ducktail = new THREE.Mesh(ducktailGeo, carbonMat);
  ducktail.position.set(0.36, 0.04, 0);
  ducktail.rotation.z = Math.PI / 8;
  group.add(ducktail);

  return group;
}
