// ===================================================================
// REALISTIC REAR WING 3D GEOMETRY GENERATOR
// ===================================================================
// Modeled after GT3/Le Mans rear wing with:
// - Multi-element airfoil (mainplane + flap)
// - Swan-neck mounting pylons (top-mounted for clean airflow)
// - Tall endplates with Gurney flap
// - DRS actuator mechanism
// - Beam wing connecting to diffuser
// ===================================================================

import * as THREE from "three";

export function generateRearWing3DGeometry(): THREE.Group {
  const group = new THREE.Group();
  group.name = "RearWing_Assembly";

  const carbonMat = new THREE.MeshPhysicalMaterial({
    color: 0x0a0e18, metalness: 0.92, roughness: 0.12,
    clearcoat: 1.0, clearcoatRoughness: 0.02, envMapIntensity: 1.4,
  });
  const titaniumMat = new THREE.MeshPhysicalMaterial({
    color: 0x6b7280, metalness: 0.95, roughness: 0.15,
  });
  const accentMat = new THREE.MeshStandardMaterial({
    color: 0xd97706, metalness: 0.7, roughness: 0.3,
  });

  // ── Mainplane Airfoil (NACA 0012 profile) ──
  const mainShape = new THREE.Shape();
  mainShape.moveTo(-0.50, 0);
  mainShape.bezierCurveTo(-0.45, 0.015, -0.30, 0.025, -0.10, 0.028);
  mainShape.bezierCurveTo(0.10, 0.026, 0.35, 0.018, 0.50, 0.005);
  mainShape.bezierCurveTo(0.45, -0.008, 0.25, -0.012, 0.0, -0.010);
  mainShape.bezierCurveTo(-0.25, -0.008, -0.45, -0.003, -0.50, 0);

  const mainGeo = new THREE.ExtrudeGeometry(mainShape, {
    depth: 0.90, bevelEnabled: true, bevelThickness: 0.004,
    bevelSize: 0.003, bevelSegments: 4
  });
  const mainplane = new THREE.Mesh(mainGeo, carbonMat);
  mainplane.rotation.y = Math.PI / 2;
  mainplane.position.set(0, 0.55, 0);
  mainplane.castShadow = true;
  group.add(mainplane);

  // ── Flap Element (smaller, angled for more downforce) ──
  const flapShape = new THREE.Shape();
  flapShape.moveTo(-0.40, 0);
  flapShape.bezierCurveTo(-0.35, 0.008, -0.20, 0.014, 0.0, 0.015);
  flapShape.bezierCurveTo(0.20, 0.013, 0.35, 0.006, 0.40, 0);
  flapShape.bezierCurveTo(0.35, -0.004, 0.15, -0.006, 0.0, -0.005);
  flapShape.bezierCurveTo(-0.20, -0.004, -0.35, -0.001, -0.40, 0);

  const flapGeo = new THREE.ExtrudeGeometry(flapShape, {
    depth: 0.86, bevelEnabled: true, bevelThickness: 0.003,
    bevelSize: 0.002, bevelSegments: 3
  });
  const flap = new THREE.Mesh(flapGeo, carbonMat);
  flap.rotation.y = Math.PI / 2;
  flap.rotation.x = -0.12; // Higher angle of attack
  flap.position.set(0, 0.60, 0);
  flap.castShadow = true;
  group.add(flap);

  // ── Gurney Flap on trailing edge ──
  const gurneyGeo = new THREE.BoxGeometry(0.003, 0.015, 0.86);
  const gurney = new THREE.Mesh(gurneyGeo, carbonMat);
  gurney.position.set(0.40, 0.60, 0);
  group.add(gurney);

  // ── Swan-Neck Mounting Pylons (2, top-mounted) ──
  [-1, 1].forEach((side) => {
    // Upright post
    const postGeo = new THREE.CylinderGeometry(0.008, 0.010, 0.40, 12);
    const post = new THREE.Mesh(postGeo, titaniumMat);
    post.position.set(0, 0.37, side * 0.30);
    post.castShadow = true;
    group.add(post);

    // Swan-neck curved arm (connects top of post to top of wing)
    const neckCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.57, side * 0.30),
      new THREE.Vector3(0.02, 0.52, side * 0.30),
      new THREE.Vector3(0.03, 0.45, side * 0.30),
      new THREE.Vector3(0, 0.37, side * 0.30),
    ]);
    const neckGeo = new THREE.TubeGeometry(neckCurve, 16, 0.006, 8, false);
    const neck = new THREE.Mesh(neckGeo, titaniumMat);
    neck.castShadow = true;
    group.add(neck);

    // Mounting bracket (top of wing)
    const bracketGeo = new THREE.BoxGeometry(0.04, 0.008, 0.02);
    const bracket = new THREE.Mesh(bracketGeo, titaniumMat);
    bracket.position.set(0, 0.56, side * 0.30);
    group.add(bracket);
  });

  // ── Endplates (tall, sculpted) ──
  [-1, 1].forEach((side) => {
    const epShape = new THREE.Shape();
    epShape.moveTo(0, 0);
    epShape.lineTo(0.015, 0);
    epShape.bezierCurveTo(0.02, 0.10, 0.018, 0.20, 0.012, 0.30);
    epShape.lineTo(0.008, 0.32);
    epShape.bezierCurveTo(0.005, 0.25, 0.003, 0.15, 0, 0.05);
    epShape.closePath();

    const epGeo = new THREE.ExtrudeGeometry(epShape, {
      depth: 0.003, bevelEnabled: true, bevelThickness: 0.002, bevelSize: 0.002, bevelSegments: 2
    });
    const ep = new THREE.Mesh(epGeo, carbonMat);
    ep.position.set(-0.05, 0.25, side * 0.46);
    ep.castShadow = true;
    group.add(ep);

    // Endplate Gurney flap
    const epGurneyGeo = new THREE.BoxGeometry(0.003, 0.06, 0.003);
    const epGurney = new THREE.Mesh(epGurneyGeo, accentMat);
    epGurney.position.set(0.45, 0.58, side * 0.46);
    group.add(epGurney);
  });

  // ── DRS Actuator Mechanism ──
  const actuatorGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.08, 8);
  const actuator = new THREE.Mesh(actuatorGeo, titaniumMat);
  actuator.position.set(0, 0.56, 0);
  actuator.rotation.x = Math.PI / 2;
  group.add(actuator);

  // ── Beam Wing (lower element connecting to chassis) ──
  const beamShape = new THREE.Shape();
  beamShape.moveTo(-0.35, 0);
  beamShape.bezierCurveTo(-0.30, 0.005, -0.10, 0.008, 0.10, 0.007);
  beamShape.bezierCurveTo(0.25, 0.004, 0.33, 0.001, 0.35, 0);
  beamShape.bezierCurveTo(0.30, -0.003, 0.10, -0.004, -0.10, -0.003);
  beamShape.bezierCurveTo(-0.30, -0.002, -0.34, 0, -0.35, 0);

  const beamGeo = new THREE.ExtrudeGeometry(beamShape, {
    depth: 0.60, bevelEnabled: true, bevelThickness: 0.002, bevelSize: 0.002, bevelSegments: 2
  });
  const beam = new THREE.Mesh(beamGeo, carbonMat);
  beam.rotation.y = Math.PI / 2;
  beam.position.set(0, 0.18, 0);
  group.add(beam);

  return group;
}
