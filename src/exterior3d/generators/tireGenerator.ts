// ===================================================================
// THREE.JS COMPETITION TIRES 3D GEOMETRY GENERATOR
// ===================================================================
// Generates motorsport low-profile performance tires with realistic
// curved sidewall profile, center tread channels, and satin rubber shading.
// ===================================================================

import * as THREE from "three";

export function generateTire3DGeometry(): THREE.Group {
  const group = new THREE.Group();
  group.name = "Tire_Assembly";

  const tireMat = new THREE.MeshPhysicalMaterial({
    color: 0x14161b,
    roughness: 0.82,
    metalness: 0.04,
    clearcoat: 0.15,
    clearcoatRoughness: 0.6,
    name: "Tire_Rubber_Material",
  });

  const tireRadius = 0.34;
  const tireWidth = 0.28;

  // 1. Toroidal Rounded Sidewall Profile
  const torusGeo = new THREE.TorusGeometry(tireRadius * 0.78, tireRadius * 0.24, 16, 36);
  const torus = new THREE.Mesh(torusGeo, tireMat);
  torus.scale.set(1.0, 1.0, tireWidth / (tireRadius * 0.48));
  torus.castShadow = true;
  group.add(torus);

  // 2. Tread Surface Cylinder Band
  const treadGeo = new THREE.CylinderGeometry(tireRadius, tireRadius, tireWidth * 0.84, 36, 1, true);
  const tread = new THREE.Mesh(treadGeo, tireMat);
  tread.rotation.x = Math.PI / 2;
  tread.castShadow = true;
  group.add(tread);

  // 3. Dual Longitudinal Water Drainage Grooves
  [-0.045, 0.045].forEach((gx) => {
    const grooveGeo = new THREE.TorusGeometry(tireRadius * 0.995, 0.005, 8, 36);
    const groove = new THREE.Mesh(grooveGeo, new THREE.MeshBasicMaterial({ color: 0x090a0d }));
    groove.position.set(0, 0, gx);
    group.add(groove);
  });

  return group;
}
