// ===================================================================
// THREE.JS SCULPTED FRONT FENDERS 3D GEOMETRY GENERATOR
// ===================================================================
// Generates aerodynamic flared front fenders with curved wheel arches,
// carbon fiber inner splash liners, and top heat extraction louvers.
// ===================================================================

import * as THREE from "three";

export function generateFenders3DGeometry(): THREE.Group {
  const group = new THREE.Group();
  group.name = "Front_Fenders_Assembly";

  const fenderMat = new THREE.MeshPhysicalMaterial({
    color: 0x0284c7,
    roughness: 0.12,
    metalness: 0.88,
    clearcoat: 1.0,
    clearcoatRoughness: 0.02,
    reflectivity: 0.95,
    name: "Body_Paint_Primary",
  });

  const carbonMat = new THREE.MeshStandardMaterial({
    color: 0x111827,
    roughness: 0.28,
    metalness: 0.85,
    name: "Carbon_Trim",
  });

  const archRadius = 0.38;
  const archWidth = 0.20;
  const archGeo = new THREE.TorusGeometry(archRadius, archWidth * 0.48, 16, 28, Math.PI * 0.94);

  [-1, 1].forEach((side) => {
    const fenderSub = new THREE.Group();
    fenderSub.position.set(0, 0, side * 0.48);

    // Sculpted Flared Wheel Arch
    const archMesh = new THREE.Mesh(archGeo, fenderMat);
    archMesh.rotation.y = side === 1 ? Math.PI / 2 : -Math.PI / 2;
    archMesh.rotation.z = Math.PI * 0.03;
    archMesh.scale.set(1.0, 1.12, 1.35);
    archMesh.castShadow = true;
    fenderSub.add(archMesh);

    // Fender Top Aerodynamic Crest / Shoulder Line
    const shoulderGeo = new THREE.BoxGeometry(0.82, 0.05, 0.16);
    const shoulder = new THREE.Mesh(shoulderGeo, fenderMat);
    shoulder.position.set(0, 0.36, 0);
    shoulder.castShadow = true;
    fenderSub.add(shoulder);

    // Carbon Wheel Arch Inner Splash Liner
    const linerGeo = new THREE.CylinderGeometry(archRadius * 0.94, archRadius * 0.94, archWidth * 0.75, 16, 1, true, 0, Math.PI);
    const liner = new THREE.Mesh(linerGeo, carbonMat);
    liner.rotation.z = Math.PI / 2;
    liner.rotation.x = side === 1 ? Math.PI : 0;
    fenderSub.add(liner);

    // Top Heat Extraction Carbon Louvers
    for (let i = 0; i < 4; i++) {
      const finGeo = new THREE.BoxGeometry(0.12, 0.008, 0.04);
      const fin = new THREE.Mesh(finGeo, carbonMat);
      fin.rotation.x = 0.35;
      fin.position.set(0.08 + (i - 1.5) * 0.065, 0.38 - i * 0.006, 0);
      fenderSub.add(fin);
    }

    group.add(fenderSub);
  });

  return group;
}
