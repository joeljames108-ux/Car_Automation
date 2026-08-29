// ===================================================================
// REALISTIC FENDER & WHEEL ARCH 3D GEOMETRY GENERATOR
// ===================================================================
// Smooth curved fender flares with:
// - Bezier-sculpted outer skin
// - Flared wheel arch lip with rolled edge
// - Inner fender liner (plastic)
// - Aero vent louvers behind front wheel
// - Brake cooling exit vents
// ===================================================================

import * as THREE from "three";

export function generateFenders3DGeometry(): THREE.Group {
  const group = new THREE.Group();
  group.name = "Fenders_Assembly";

  const bodyMat = new THREE.MeshPhysicalMaterial({
    color: 0x1a1a2e, metalness: 0.85, roughness: 0.12,
    clearcoat: 1.0, clearcoatRoughness: 0.02, envMapIntensity: 1.5,
  });
  const linerMat = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a, roughness: 0.8, metalness: 0.1,
  });
  const ventMat = new THREE.MeshPhysicalMaterial({
    color: 0x0a0e18, metalness: 0.9, roughness: 0.2, clearcoat: 0.8,
  });

  // Front and rear axle positions
  const frontX = 0.60;
  const rearX = -0.55;
  const archRadius = 0.30;

  [-1, 1].forEach((side) => {
    // ── Front Fender ──
    const frontFenderGroup = new THREE.Group();

    // Outer fender skin (smooth curved panel)
    const fenderShape = new THREE.Shape();
    fenderShape.moveTo(-0.35, 0);
    fenderShape.bezierCurveTo(-0.35, 0.15, -0.20, 0.28, 0.0, 0.30);
    fenderShape.bezierCurveTo(0.20, 0.28, 0.35, 0.15, 0.35, 0);
    fenderShape.lineTo(0.35, -0.08);
    fenderShape.bezierCurveTo(0.30, -0.12, 0.15, -0.14, 0.0, -0.14);
    fenderShape.bezierCurveTo(-0.15, -0.14, -0.30, -0.12, -0.35, -0.08);
    fenderShape.closePath();

    // Cut out wheel arch hole
    const archHole = new THREE.Path();
    archHole.moveTo(0.10, -0.10);
    archHole.absarc(0, -0.10, 0.22, 0.15, Math.PI - 0.15, false);
    archHole.lineTo(-0.10, -0.10);
    fenderShape.holes.push(archHole);

    const fenderGeo = new THREE.ExtrudeGeometry(fenderShape, {
      depth: 0.012, bevelEnabled: true, bevelThickness: 0.003,
      bevelSize: 0.002, bevelSegments: 3
    });
    const fender = new THREE.Mesh(fenderGeo, bodyMat);
    fender.position.set(frontX, 0.12, side * 0.50);
    fender.rotation.y = side * 0.05;
    fender.castShadow = true;
    frontFenderGroup.add(fender);

    // Flared wheel arch lip (rolled edge)
    const lipCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(frontX - 0.22, 0.12, side * 0.62),
      new THREE.Vector3(frontX - 0.10, 0.32, side * 0.60),
      new THREE.Vector3(frontX + 0.10, 0.38, side * 0.58),
      new THREE.Vector3(frontX + 0.22, 0.25, side * 0.56),
      new THREE.Vector3(frontX + 0.25, 0.12, side * 0.55),
    ]);
    const lipGeo = new THREE.TubeGeometry(lipCurve, 20, 0.006, 8, false);
    const lip = new THREE.Mesh(lipGeo, bodyMat);
    frontFenderGroup.add(lip);

    // Inner fender liner
    const linerGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.15, 16, 1, true, 0.2, Math.PI - 0.4);
    const liner = new THREE.Mesh(linerGeo, linerMat);
    liner.position.set(frontX, 0.12, side * 0.48);
    liner.rotation.y = Math.PI / 2;
    liner.rotation.z = Math.PI / 2;
    frontFenderGroup.add(liner);

    group.add(frontFenderGroup);

    // ── Rear Fender (wider, more aggressive) ──
    const rearFenderGroup = new THREE.Group();

    const rearFenderShape = new THREE.Shape();
    rearFenderShape.moveTo(-0.38, 0);
    rearFenderShape.bezierCurveTo(-0.38, 0.18, -0.22, 0.32, 0.0, 0.34);
    rearFenderShape.bezierCurveTo(0.22, 0.32, 0.38, 0.18, 0.38, 0);
    rearFenderShape.lineTo(0.38, -0.10);
    rearFenderShape.bezierCurveTo(0.32, -0.14, 0.16, -0.16, 0.0, -0.16);
    rearFenderShape.bezierCurveTo(-0.16, -0.16, -0.32, -0.14, -0.38, -0.10);
    rearFenderShape.closePath();

    const rearArchHole = new THREE.Path();
    rearArchHole.moveTo(0.12, -0.12);
    rearArchHole.absarc(0, -0.12, 0.24, 0.15, Math.PI - 0.15, false);
    rearArchHole.lineTo(-0.12, -0.12);
    rearFenderShape.holes.push(rearArchHole);

    const rearFenderGeo = new THREE.ExtrudeGeometry(rearFenderShape, {
      depth: 0.014, bevelEnabled: true, bevelThickness: 0.003,
      bevelSize: 0.002, bevelSegments: 3
    });
    const rearFender = new THREE.Mesh(rearFenderGeo, bodyMat);
    rearFender.position.set(rearX, 0.12, side * 0.52);
    rearFender.rotation.y = side * 0.05;
    rearFender.castShadow = true;
    rearFenderGroup.add(rearFender);

    // Rear fender flare lip
    const rearLipCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(rearX - 0.24, 0.12, side * 0.64),
      new THREE.Vector3(rearX - 0.12, 0.36, side * 0.62),
      new THREE.Vector3(rearX + 0.12, 0.42, side * 0.60),
      new THREE.Vector3(rearX + 0.24, 0.28, side * 0.58),
      new THREE.Vector3(rearX + 0.28, 0.12, side * 0.57),
    ]);
    const rearLipGeo = new THREE.TubeGeometry(rearLipCurve, 20, 0.007, 8, false);
    const rearLip = new THREE.Mesh(rearLipGeo, bodyMat);
    rearFenderGroup.add(rearLip);

    // Aero vent louvers behind rear wheel (3 horizontal slats)
    for (let l = 0; l < 3; l++) {
      const louverGeo = new THREE.BoxGeometry(0.06, 0.003, 0.01);
      const louver = new THREE.Mesh(louverGeo, ventMat);
      louver.position.set(rearX - 0.35, 0.08 + l * 0.025, side * 0.55);
      louver.rotation.z = 0.15;
      rearFenderGroup.add(louver);
    }

    group.add(rearFenderGroup);
  });

  return group;
}
