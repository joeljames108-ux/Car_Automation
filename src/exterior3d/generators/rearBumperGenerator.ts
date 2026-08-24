// ===================================================================
// THREE.JS HIGH-FIDELITY REAR BUMPER FASCIA 3D GEOMETRY GENERATOR
// ===================================================================

import * as THREE from "three";

export function generateRearBumper3DGeometry(): THREE.Group {
  const group = new THREE.Group();
  group.name = "Rear_Bumper_Fascia_Assembly";

  const paintMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    roughness: 0.18,
    metalness: 0.88,
    name: "Body_Paint_Primary",
  });

  const carbonMat = new THREE.MeshStandardMaterial({
    color: 0x111827,
    roughness: 0.30,
    metalness: 0.50,
    name: "Carbon_Apron_Material",
  });

  // Main Bumper Shell Curve
  const mainBumperGeo = new THREE.BoxGeometry(1.85, 0.42, 0.32);
  const mainBumperMesh = new THREE.Mesh(mainBumperGeo, paintMat);
  mainBumperMesh.castShadow = true;
  group.add(mainBumperMesh);

  // Lower Carbon Apron Mesh
  const apronGeo = new THREE.BoxGeometry(1.78, 0.12, 0.28);
  const apronMesh = new THREE.Mesh(apronGeo, carbonMat);
  apronMesh.position.set(0, -0.18, 0.04);
  apronMesh.castShadow = true;
  group.add(apronMesh);

  // Side Brake Cooling Extraction Vents (LH & RH)
  [-0.75, 0.75].forEach((vx) => {
    const ventGeo = new THREE.BoxGeometry(0.18, 0.22, 0.02);
    const ventMesh = new THREE.Mesh(ventGeo, carbonMat);
    ventMesh.position.set(vx, 0.02, 0.16);
    group.add(ventMesh);
  });

  return group;
}
