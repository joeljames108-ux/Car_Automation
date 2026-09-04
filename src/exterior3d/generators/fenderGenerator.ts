// ============================================================================
// REALISTIC AUTOMOTIVE FENDER & WHEEL ARCH 3D GEOMETRY GENERATOR
// ============================================================================
// Standardized to real automotive GT3/Hypercar dimensions:
// - Wheelbase: 2.70m (Front axle Z: -1.35m, Rear axle Z: +1.35m)
// - Half-track: Front X: ±0.84m, Rear X: ±0.86m
// - Wheel Center: Y = 0.34m, Tire Radius = 0.34m
// - Wheel Arch Opening: Radius = 0.385m (45mm dynamic bump clearance)
// - Formed 12mm rolled fender lips with return flanges
// - Deep inner composite wheelhouse liners preventing ground see-through
// - Carbon aero pressure-relief louvres above front wheels
// ============================================================================

import * as THREE from "three";

export function generateFenders3DGeometry(): THREE.Group {
  const group = new THREE.Group();
  group.name = "Fenders_Assembly";

  const paintMat = new THREE.MeshPhysicalMaterial({
    color: 0x0284c7, // Apex Blue
    metalness: 0.88,
    roughness: 0.14,
    clearcoat: 1.0,
    clearcoatRoughness: 0.03,
    reflectivity: 0.96,
    name: "Fender_Body_Paint",
  });

  const linerMat = new THREE.MeshStandardMaterial({
    color: 0x14161b,
    roughness: 0.78,
    metalness: 0.15,
    name: "Inner_Wheelhouse_Composite_Tub",
  });

  const carbonMat = new THREE.MeshStandardMaterial({
    color: 0x181a20,
    roughness: 0.35,
    metalness: 0.75,
    name: "Carbon_Fender_Louvres",
  });

  const frontZ = -1.35;
  const rearZ = 1.35;
  const wheelCenterY = 0.34;
  const archRadius = 0.385; // 385mm radius for 340mm tire (45mm clearance)

  [-1, 1].forEach((side) => {
    const sideName = side < 0 ? "LH" : "RH";
    const xFront = side * 0.85;
    const xRear = side * 0.88;

    // ── 1. FRONT FENDER ASSEMBLY ──
    const frontFenderGroup = new THREE.Group();
    frontFenderGroup.name = `Front_Fender_${sideName}`;

    // Stamped outer fender crown curve
    const frontShape = new THREE.Shape();
    frontShape.moveTo(-0.55, -0.22);
    frontShape.lineTo(-0.55, 0.28);
    frontShape.bezierCurveTo(-0.35, 0.40, 0.25, 0.40, 0.50, 0.26);
    frontShape.lineTo(0.50, -0.22);
    frontShape.bezierCurveTo(0.40, -0.15, 0.32, -0.10, 0.20, -0.08);

    // Cutout circular wheel arch
    const frontArchHole = new THREE.Path();
    frontArchHole.moveTo(archRadius, -0.02);
    frontArchHole.absarc(0, -0.02, archRadius, 0.05, Math.PI - 0.05, false);
    frontArchHole.lineTo(-archRadius, -0.02);
    frontShape.holes.push(frontArchHole);

    const frontGeo = new THREE.ExtrudeGeometry(frontShape, {
      depth: 0.016,
      bevelEnabled: true,
      bevelThickness: 0.005,
      bevelSize: 0.004,
      bevelSegments: 3,
    });
    frontGeo.rotateY(Math.PI / 2);

    const frontMesh = new THREE.Mesh(frontGeo, paintMat);
    frontMesh.position.set(xFront, wheelCenterY, frontZ);
    frontMesh.castShadow = true;
    frontMesh.receiveShadow = true;
    frontFenderGroup.add(frontMesh);

    // Rolled 12mm Fender Lip Flange
    const frontLipCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(xFront, wheelCenterY - 0.02, frontZ - archRadius),
      new THREE.Vector3(xFront + side * 0.015, wheelCenterY + archRadius * 0.72, frontZ - archRadius * 0.7),
      new THREE.Vector3(xFront + side * 0.022, wheelCenterY + archRadius + 0.01, frontZ),
      new THREE.Vector3(xFront + side * 0.015, wheelCenterY + archRadius * 0.72, frontZ + archRadius * 0.7),
      new THREE.Vector3(xFront, wheelCenterY - 0.02, frontZ + archRadius),
    ]);
    const frontLipGeo = new THREE.TubeGeometry(frontLipCurve, 28, 0.008, 10, false);
    const frontLip = new THREE.Mesh(frontLipGeo, paintMat);
    frontFenderGroup.add(frontLip);

    // Deep Inner Wheelhouse Liner Tub (Seals chassis & engine bay)
    const frontLinerGeo = new THREE.CylinderGeometry(
      archRadius * 0.98,
      archRadius * 0.98,
      0.24,
      28,
      2,
      true,
      0.08,
      Math.PI - 0.16
    );
    frontLinerGeo.rotateX(Math.PI / 2);
    const frontLiner = new THREE.Mesh(frontLinerGeo, linerMat);
    frontLiner.position.set(xFront - side * 0.11, wheelCenterY - 0.02, frontZ);
    frontFenderGroup.add(frontLiner);

    // High-Pressure Aerodynamic Fender Louvres (3 Carbon Slices)
    for (let l = 0; l < 3; l++) {
      const louverGeo = new THREE.BoxGeometry(0.14, 0.006, 0.05);
      const louver = new THREE.Mesh(louverGeo, carbonMat);
      louver.position.set(
        xFront - side * 0.08,
        wheelCenterY + archRadius + 0.04 + l * 0.012,
        frontZ - 0.10 + l * 0.09
      );
      louver.rotation.x = -0.32;
      frontFenderGroup.add(louver);
    }

    group.add(frontFenderGroup);

    // ── 2. REAR QUARTER FENDER & HAUNCH ASSEMBLY ──
    const rearFenderGroup = new THREE.Group();
    rearFenderGroup.name = `Rear_Fender_${sideName}`;

    const rearShape = new THREE.Shape();
    rearShape.moveTo(-0.62, -0.22);
    rearShape.lineTo(-0.62, 0.32);
    rearShape.bezierCurveTo(-0.40, 0.44, 0.30, 0.44, 0.58, 0.28);
    rearShape.lineTo(0.58, -0.22);
    rearShape.bezierCurveTo(0.45, -0.15, 0.35, -0.10, 0.20, -0.08);

    const rearArchHole = new THREE.Path();
    rearArchHole.moveTo(archRadius, -0.02);
    rearArchHole.absarc(0, -0.02, archRadius, 0.05, Math.PI - 0.05, false);
    rearArchHole.lineTo(-archRadius, -0.02);
    rearShape.holes.push(rearArchHole);

    const rearGeo = new THREE.ExtrudeGeometry(rearShape, {
      depth: 0.018,
      bevelEnabled: true,
      bevelThickness: 0.006,
      bevelSize: 0.005,
      bevelSegments: 3,
    });
    rearGeo.rotateY(Math.PI / 2);

    const rearMesh = new THREE.Mesh(rearGeo, paintMat);
    rearMesh.position.set(xRear, wheelCenterY, rearZ);
    rearMesh.castShadow = true;
    rearMesh.receiveShadow = true;
    rearFenderGroup.add(rearMesh);

    // Rolled Rear Fender Lip Flange
    const rearLipCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(xRear, wheelCenterY - 0.02, rearZ - archRadius),
      new THREE.Vector3(xRear + side * 0.018, wheelCenterY + archRadius * 0.72, rearZ - archRadius * 0.7),
      new THREE.Vector3(xRear + side * 0.025, wheelCenterY + archRadius + 0.01, rearZ),
      new THREE.Vector3(xRear + side * 0.018, wheelCenterY + archRadius * 0.72, rearZ + archRadius * 0.7),
      new THREE.Vector3(xRear, wheelCenterY - 0.02, rearZ + archRadius),
    ]);
    const rearLipGeo = new THREE.TubeGeometry(rearLipCurve, 28, 0.009, 10, false);
    const rearLip = new THREE.Mesh(rearLipGeo, paintMat);
    rearFenderGroup.add(rearLip);

    // Deep Inner Rear Wheelhouse Tub
    const rearLinerGeo = new THREE.CylinderGeometry(
      archRadius * 0.98,
      archRadius * 0.98,
      0.26,
      28,
      2,
      true,
      0.08,
      Math.PI - 0.16
    );
    rearLinerGeo.rotateX(Math.PI / 2);
    const rearLiner = new THREE.Mesh(rearLinerGeo, linerMat);
    rearLiner.position.set(xRear - side * 0.12, wheelCenterY - 0.02, rearZ);
    rearFenderGroup.add(rearLiner);

    group.add(rearFenderGroup);
  });

  return group;
}
