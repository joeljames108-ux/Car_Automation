// ===================================================================
// REALISTIC LED TAILLIGHT 3D GEOMETRY GENERATOR
// ===================================================================
// Modeled after 2024 BMW/Mercedes/Audi full-width LED taillights:
// - Full-width light bar with individual LED segments
// - 3D sculpted housing with smoked lens
// - Sequential turn indicator strip
// - Reverse light module
// - Carbon fiber inner trim
// ===================================================================

import * as THREE from "three";

export function generateTaillights3DGeometry(): THREE.Group {
  const group = new THREE.Group();
  group.name = "Taillights_Assembly";

  const housingMat = new THREE.MeshPhysicalMaterial({
    color: 0x1a0000, metalness: 0.6, roughness: 0.3,
    clearcoat: 0.5,
  });
  const ledRedMat = new THREE.MeshBasicMaterial({ color: 0xff1a1a });
  const brakeRedMat = new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0xff0000, emissiveIntensity: 0.5 });
  const indicatorMat = new THREE.MeshBasicMaterial({ color: 0xff8c00, transparent: true, opacity: 0.85 });
  const reverseMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const lensMat = new THREE.MeshPhysicalMaterial({
    color: 0x330000, transmission: 0.7, opacity: 0.3, transparent: true,
    roughness: 0.05, ior: 1.5,
  });
  const carbonMat = new THREE.MeshPhysicalMaterial({
    color: 0x0a0e18, metalness: 0.9, roughness: 0.2, clearcoat: 0.8,
  });

  [-1, 1].forEach((side) => {
    const tlGroup = new THREE.Group();
    tlGroup.position.set(0, 0, side * 0.44);
    tlGroup.rotation.y = side * 0.1;

    // Housing shell (sculpted L-shape)
    const shGeo = new THREE.ExtrudeGeometry(
      (() => {
        const s = new THREE.Shape();
        s.moveTo(-0.18, -0.04);
        s.bezierCurveTo(-0.18, 0.03, -0.14, 0.05, -0.06, 0.05);
        s.lineTo(0.14, 0.05);
        s.bezierCurveTo(0.18, 0.05, 0.20, 0.03, 0.20, 0.0);
        s.lineTo(0.20, -0.04);
        s.bezierCurveTo(0.20, -0.05, 0.18, -0.05, 0.14, -0.05);
        s.lineTo(-0.14, -0.05);
        s.bezierCurveTo(-0.18, -0.05, -0.18, -0.045, -0.18, -0.04);
        return s;
      })(),
      { depth: 0.14, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.006, bevelSegments: 4 }
    );
    const shMesh = new THREE.Mesh(shGeo, housingMat);
    shMesh.rotation.y = side * 0.08;
    shMesh.castShadow = true;
    tlGroup.add(shMesh);

    // Full-width LED light bar (12 individual segments)
    for (let seg = 0; seg < 12; seg++) {
      const segGeo = new THREE.BoxGeometry(0.025, 0.012, 0.01);
      const segMesh = new THREE.Mesh(segGeo, seg < 8 ? ledRedMat : brakeRedMat);
      segMesh.position.set(-0.12 + seg * 0.028, 0.015, 0.075);
      shMesh.add(segMesh);
    }

    // Upper brake light bar (continuous)
    const brakeGeo = new THREE.BoxGeometry(0.30, 0.008, 0.008);
    const brake = new THREE.Mesh(brakeGeo, brakeRedMat);
    brake.position.set(0.01, 0.035, 0.075);
    shMesh.add(brake);

    // Sequential turn indicator (amber strip below light bar)
    const indGeo = new THREE.BoxGeometry(0.18, 0.006, 0.008);
    const ind = new THREE.Mesh(indGeo, indicatorMat);
    ind.position.set(0.0, -0.01, 0.075);
    shMesh.add(ind);

    // Reverse light module
    const revGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.01, 10);
    const rev = new THREE.Mesh(revGeo, reverseMat);
    rev.rotation.x = Math.PI / 2;
    rev.position.set(0.14, -0.025, 0.075);
    shMesh.add(rev);

    // Smoked polycarbonate outer lens
    const lensGeo = new THREE.BoxGeometry(0.36, 0.095, 0.008);
    const lens = new THREE.Mesh(lensGeo, lensMat);
    lens.position.set(0.01, 0.005, 0.08);
    shMesh.add(lens);

    // Carbon fiber inner trim surround
    const trimGeo = new THREE.BoxGeometry(0.38, 0.11, 0.004);
    const trim = new THREE.Mesh(trimGeo, carbonMat);
    trim.position.set(0.01, 0.005, 0.065);
    shMesh.add(trim);

    tlGroup.add(shMesh);
    group.add(tlGroup);
  });

  // Optional: Full-width center connecting light bar
  const centerBarGeo = new THREE.BoxGeometry(0.006, 0.012, 0.24);
  const centerBar = new THREE.Mesh(centerBarGeo, ledRedMat);
  centerBar.position.set(-0.35, 0.02, 0);
  group.add(centerBar);

  return group;
}
