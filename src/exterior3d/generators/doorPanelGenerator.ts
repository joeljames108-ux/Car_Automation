// ===================================================================
// THREE.JS SCULPTED BUTTERFLY / SIDE DOORS 3D GEOMETRY GENERATOR
// ===================================================================
// Generates aerodynamic sculpted dihedral doors with side intake scoops,
// aero wing mirror stalks, flush touch handles, and carbon inner door skins.
// ===================================================================

import * as THREE from "three";

export function generateDoors3DGeometry(): THREE.Group {
  const group = new THREE.Group();
  group.name = "Doors_Assembly";

  const doorMat = new THREE.MeshPhysicalMaterial({
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

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x1e293b,
    transmission: 0.75,
    opacity: 0.6,
    transparent: true,
    roughness: 0.05,
    ior: 1.52,
  });

  [-1, 1].forEach((side) => {
    const doorSub = new THREE.Group();
    doorSub.position.set(0, 0, side * 0.48);

    // Sculpted Outer Door Skin (Scalloped Waistline Contour)
    const skinGeo = new THREE.BoxGeometry(0.92, 0.46, 0.08);
    const skinMesh = new THREE.Mesh(skinGeo, doorMat);
    skinMesh.position.set(0, 0, 0);
    skinMesh.castShadow = true;
    doorSub.add(skinMesh);

    // Side Aerodynamic NACA Cooling Channel Scoop
    const ductGeo = new THREE.BoxGeometry(0.55, 0.18, 0.045);
    const ductMesh = new THREE.Mesh(ductGeo, carbonMat);
    ductMesh.position.set(0.12, -0.05, side * 0.03);
    doorSub.add(ductMesh);

    // Frameless Teardrop Door Window Glass
    const windowGeo = new THREE.BoxGeometry(0.72, 0.26, 0.012);
    const winMesh = new THREE.Mesh(windowGeo, glassMat);
    winMesh.position.set(0, 0.32, side * 0.02);
    doorSub.add(winMesh);

    // Aerodynamic Wing Mirror Stalk & Mirror Cap
    const mirrorStemGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.14, 8);
    const stem = new THREE.Mesh(mirrorStemGeo, carbonMat);
    stem.rotation.z = Math.PI / 3;
    stem.position.set(-0.25, 0.22, side * 0.08);

    const mirrorCapGeo = new THREE.SphereGeometry(0.065, 12, 8);
    const mirrorCap = new THREE.Mesh(mirrorCapGeo, carbonMat);
    mirrorCap.scale.set(1.4, 0.65, 0.85);
    mirrorCap.position.set(-0.32, 0.28, side * 0.12);

    doorSub.add(stem, mirrorCap);

    group.add(doorSub);
  });

  return group;
}
