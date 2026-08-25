// ===================================================================
// THREE.JS MATRIX LED HEADLIGHTS 3D GEOMETRY GENERATOR
// ===================================================================
// Generates swept-back aerodynamic headlight clusters with quad LED
// projector crystal lenses, ice-blue glowing DRL light blades, and dark carbon housings.
// ===================================================================

import * as THREE from "three";

export function generateHeadlights3DGeometry(): THREE.Group {
  const group = new THREE.Group();
  group.name = "Headlights_Assembly";

  // Dark Carbon Fiber Housing Shell
  const housingMat = new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.25, metalness: 0.85 });
  const ledProjectorMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const drlBladeMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
  const lensGlassMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transmission: 0.96,
    opacity: 0.4,
    transparent: true,
    roughness: 0.01,
    ior: 1.52,
  });

  [-1, 1].forEach((side) => {
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0, side * 0.45);

    // Swept-Back Aerodynamic Housing
    const houseGeo = new THREE.BoxGeometry(0.38, 0.08, 0.24);
    const houseMesh = new THREE.Mesh(houseGeo, housingMat);
    houseMesh.rotation.y = side * -0.28;
    houseMesh.rotation.z = side * -0.06;
    headGroup.add(houseMesh);

    // L-Shaped Glowing Ice-Blue DRL Light Blade
    const drlGeo = new THREE.BoxGeometry(0.34, 0.018, 0.22);
    const drlMesh = new THREE.Mesh(drlGeo, drlBladeMat);
    drlMesh.position.set(0, -0.02, 0);
    houseMesh.add(drlMesh);

    // Dual Projector Optical Crystal Spheres
    for (let p = 0; p < 2; p++) {
      const projGeo = new THREE.SphereGeometry(0.028, 16, 16);
      const proj = new THREE.Mesh(projGeo, ledProjectorMat);
      proj.position.set((p - 0.5) * 0.11 + 0.06, 0.015, -0.04);
      houseMesh.add(proj);
    }

    // Outer Polycarbonate Protective Lens Cover
    const lensGeo = new THREE.BoxGeometry(0.40, 0.09, 0.26);
    const lensMesh = new THREE.Mesh(lensGeo, lensGlassMat);
    houseMesh.add(lensMesh);

    group.add(headGroup);
  });

  return group;
}
