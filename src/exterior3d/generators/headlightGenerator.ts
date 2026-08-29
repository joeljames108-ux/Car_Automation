// ===================================================================
// REALISTIC MATRIX LED HEADLIGHTS 3D GEOMETRY GENERATOR
// ===================================================================
// Modeled after 2024 BMW/Audi/Mercedes matrix LED systems
// - Smooth curved polycarbonate lens covers
// - 8-segment matrix LED projector array with chrome reflectors
// - Swept DRL light blade with sequential indicator
// - Carbon fiber inner housing with heat sink fins
// ===================================================================

import * as THREE from "three";

export function generateHeadlights3DGeometry(): THREE.Group {
  const group = new THREE.Group();
  group.name = "Headlights_Assembly";

  const carbonMat = new THREE.MeshPhysicalMaterial({
    color: 0x0a0e18, metalness: 0.92, roughness: 0.18,
    clearcoat: 0.8, clearcoatRoughness: 0.05,
  });
  const chromeMat = new THREE.MeshPhysicalMaterial({
    color: 0xf8fafc, metalness: 0.98, roughness: 0.02,
  });
  const ledMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const drlMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95 });
  const indicatorMat = new THREE.MeshBasicMaterial({ color: 0xffa500, transparent: true, opacity: 0.9 });
  const lensMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff, transmission: 0.94, opacity: 0.15, transparent: true,
    roughness: 0.01, ior: 1.52,
  });

  [-1, 1].forEach((side) => {
    const hg = new THREE.Group();
    hg.position.set(0, 0, side * 0.46);
    hg.rotation.y = side * -0.15;

    const sh = new THREE.Shape();
    sh.moveTo(-0.22, -0.05);
    sh.bezierCurveTo(-0.22, 0.04, -0.18, 0.06, -0.10, 0.06);
    sh.bezierCurveTo(0.05, 0.055, 0.16, 0.04, 0.22, 0.01);
    sh.bezierCurveTo(0.22, -0.01, 0.18, -0.055, 0.10, -0.055);
    sh.bezierCurveTo(-0.05, -0.055, -0.18, -0.055, -0.22, -0.05);
    const sGeo = new THREE.ExtrudeGeometry(sh, { depth: 0.18, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.01, bevelSegments: 6 });
    const sMesh = new THREE.Mesh(sGeo, carbonMat);
    sMesh.rotation.y = side * -0.12;
    sMesh.castShadow = true;
    hg.add(sMesh);
    // Chrome Reflector Bowl
    const rGeo = new THREE.SphereGeometry(0.06, 20, 12, 0, Math.PI * 1.4, 0, Math.PI * 0.7);
    const rMesh = new THREE.Mesh(rGeo, chromeMat);
    rMesh.position.set(-0.04, 0.0, 0.09);
    rMesh.rotation.x = Math.PI * 0.1;
    sMesh.add(rMesh);

    // Matrix LED Projector Array (8 segments)
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 4; col++) {
        const lGeo = new THREE.CylinderGeometry(0.012, 0.014, 0.025, 12);
        const led = new THREE.Mesh(lGeo, ledMat);
        led.rotation.x = Math.PI / 2;
        led.position.set(-0.08 + col * 0.045, -0.015 + row * 0.03, 0.085);
        sMesh.add(led);
        const rg = new THREE.TorusGeometry(0.015, 0.002, 6, 12);
        const ring = new THREE.Mesh(rg, chromeMat);
        ring.position.copy(led.position);
        ring.rotation.x = Math.PI / 2;
        sMesh.add(ring);
      }
    }

    // Adaptive Cornering Light
    const cGeo = new THREE.CylinderGeometry(0.02, 0.025, 0.03, 10);
    const cLight = new THREE.Mesh(cGeo, new THREE.MeshBasicMaterial({ color: 0xffe4b5 }));
    cLight.rotation.x = Math.PI / 2;
    cLight.position.set(0.12, -0.01, 0.06);
    sMesh.add(cLight);

    // DRL Light Blade
    const dGeo = new THREE.BoxGeometry(0.36, 0.008, 0.008);
    const drl = new THREE.Mesh(dGeo, drlMat);
    drl.position.set(0, -0.035, 0.06);
    sMesh.add(drl);

    // Sequential Turn Indicator
    const iGeo = new THREE.BoxGeometry(0.16, 0.006, 0.012);
    const ind = new THREE.Mesh(iGeo, indicatorMat);
    ind.position.set(0, -0.048, 0.065);
    sMesh.add(ind);

    // Heat Sink Fins
    for (let f = 0; f < 8; f++) {
      const fGeo = new THREE.BoxGeometry(0.003, 0.025, 0.12);
      const fin = new THREE.Mesh(fGeo, new THREE.MeshStandardMaterial({ color: 0x2a2a2a, metalness: 0.7, roughness: 0.5 }));
      fin.position.set(-0.15 + f * 0.015, -0.055, 0.09);
      sMesh.add(fin);
    }

    // Outer Polycarbonate Lens
    const lsh = new THREE.Shape();
    lsh.moveTo(-0.23, -0.055);
    lsh.bezierCurveTo(-0.23, 0.045, -0.19, 0.065, -0.10, 0.065);
    lsh.bezierCurveTo(0.06, 0.06, 0.17, 0.045, 0.23, 0.015);
    lsh.bezierCurveTo(0.23, -0.015, 0.19, -0.06, 0.10, -0.06);
    lsh.bezierCurveTo(-0.06, -0.06, -0.19, -0.06, -0.23, -0.055);
    const lGeo = new THREE.ExtrudeGeometry(lsh, { depth: 0.005, bevelEnabled: true, bevelThickness: 0.003, bevelSize: 0.003, bevelSegments: 4 });
    const lens = new THREE.Mesh(lGeo, lensMat);
    lens.position.set(0, 0, 0.005);
    sMesh.add(lens);

    hg.add(sMesh);
    group.add(hg);
  });

  return group;
}
