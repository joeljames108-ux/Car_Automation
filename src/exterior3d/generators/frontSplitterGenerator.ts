// ===================================================================
// REALISTIC FRONT SPLITTER & CANARD 3D GEOMETRY GENERATOR
// ===================================================================
// Modeled after GT3/LMP front splitter with:
// - NACA airfoil cross-section splitter blade
// - 4 turning vanes (2 per side) for downforce
// - Gurney flap trailing edge
// - Carbon fiber endplates with dive plane
// - Central intake duct with mesh screen
// ===================================================================

import * as THREE from "three";

export function generateFrontSplitter3DGeometry(): THREE.Group {
  const group = new THREE.Group();
  group.name = "FrontSplitter_Assembly";

  const carbonMat = new THREE.MeshPhysicalMaterial({
    color: 0x0a0e18, metalness: 0.92, roughness: 0.15,
    clearcoat: 0.9, clearcoatRoughness: 0.03,
  });
  const kevlarMat = new THREE.MeshPhysicalMaterial({
    color: 0x1a1508, metalness: 0.3, roughness: 0.6,
  });
  const meshMat = new THREE.MeshStandardMaterial({
    color: 0x111111, wireframe: true, transparent: true, opacity: 0.4,
  });

  // ── Main Splitter Blade (NACA airfoil profile) ──
  const splitterShape = new THREE.Shape();
  // NACA 4412 inspired profile
  splitterShape.moveTo(-0.60, 0);
  splitterShape.bezierCurveTo(-0.55, 0.008, -0.40, 0.015, -0.20, 0.018);
  splitterShape.bezierCurveTo(0.0, 0.020, 0.30, 0.015, 0.50, 0.008);
  splitterShape.bezierCurveTo(0.55, 0.004, 0.58, 0.001, 0.60, 0);
  splitterShape.bezierCurveTo(0.55, -0.004, 0.40, -0.006, 0.20, -0.005);
  splitterShape.bezierCurveTo(0.0, -0.004, -0.30, -0.002, -0.60, 0);

  const splitterGeo = new THREE.ExtrudeGeometry(splitterShape, {
    depth: 1.1, bevelEnabled: true, bevelThickness: 0.003,
    bevelSize: 0.002, bevelSegments: 3
  });
  const splitter = new THREE.Mesh(splitterGeo, carbonMat);
  splitter.rotation.y = Math.PI / 2;
  splitter.position.set(0, -0.08, 0);
  splitter.castShadow = true;
  splitter.receiveShadow = true;
  group.add(splitter);

  // ── Gurney Flap (trailing edge lip) ──
  const gurneyGeo = new THREE.BoxGeometry(0.004, 0.02, 1.1);
  const gurney = new THREE.Mesh(gurneyGeo, carbonMat);
  gurney.position.set(-0.60, -0.07, 0);
  group.add(gurney);

  // ── Turning Vanes (4 total, 2 per side) ──
  [-1, 1].forEach((side) => {
    for (let v = 0; v < 2; v++) {
      const vaneShape = new THREE.Shape();
      vaneShape.moveTo(0, 0);
      vaneShape.lineTo(0.08, 0.015);
      vaneShape.lineTo(0.08, 0.019);
      vaneShape.lineTo(0, 0.004);
      vaneShape.closePath();

      const vaneGeo = new THREE.ExtrudeGeometry(vaneShape, {
        depth: 0.003, bevelEnabled: false
      });
      const vane = new THREE.Mesh(vaneGeo, carbonMat);
      vane.position.set(-0.35 + v * 0.30, -0.08, side * (0.35 + v * 0.15));
      vane.rotation.y = side * 0.15;
      group.add(vane);
    }
  });

  // ── Endplates (vertical sides) ──
  [-1, 1].forEach((side) => {
    const epShape = new THREE.Shape();
    epShape.moveTo(0, 0);
    epShape.lineTo(0.02, 0);
    epShape.bezierCurveTo(0.025, 0.02, 0.02, 0.06, 0.01, 0.08);
    epShape.lineTo(-0.005, 0.07);
    epShape.bezierCurveTo(-0.01, 0.05, -0.01, 0.02, 0, 0);

    const epGeo = new THREE.ExtrudeGeometry(epShape, {
      depth: 0.15, bevelEnabled: true, bevelThickness: 0.002, bevelSize: 0.002, bevelSegments: 2
    });
    const ep = new THREE.Mesh(epGeo, carbonMat);
    ep.position.set(-0.10, -0.08, side * 0.50);
    ep.castShadow = true;
    group.add(ep);

    // Dive plane / canard on endplate
    const canardShape = new THREE.Shape();
    canardShape.moveTo(0, 0);
    canardShape.bezierCurveTo(0.02, 0.003, 0.06, 0.005, 0.10, 0.003);
    canardShape.lineTo(0.10, 0.001);
    canardShape.bezierCurveTo(0.06, -0.001, 0.02, -0.001, 0, 0);

    const canardGeo = new THREE.ExtrudeGeometry(canardShape, {
      depth: 0.003, bevelEnabled: false
    });
    const canard = new THREE.Mesh(canardGeo, carbonMat);
    canard.position.set(-0.05, -0.02, side * 0.53);
    canard.rotation.z = side * -0.1;
    group.add(canard);
  });

  // ── Central Intake Duct with Mesh Screen ──
  const ductGeo = new THREE.BoxGeometry(0.10, 0.04, 0.15);
  const duct = new THREE.Mesh(ductGeo, kevlarMat);
  duct.position.set(-0.20, -0.065, 0);
  group.add(duct);

  const meshGeo = new THREE.PlaneGeometry(0.08, 0.035);
  const mesh = new THREE.Mesh(meshGeo, meshMat);
  mesh.position.set(-0.20, -0.065, 0.076);
  group.add(mesh);

  // ── Support Struts (connecting splitter to bumper) ──
  [-1, 1].forEach((side) => {
    const strutGeo = new THREE.CylinderGeometry(0.003, 0.003, 0.08, 6);
    const strut = new THREE.Mesh(strutGeo, new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.8, roughness: 0.3 }));
    strut.position.set(-0.20, -0.04, side * 0.30);
    group.add(strut);
  });

  return group;
}
