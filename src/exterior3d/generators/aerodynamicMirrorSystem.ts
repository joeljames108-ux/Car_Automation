import * as THREE from "three";

export function createAerodynamicMirrorAssembly(
  bodyPaintMat: THREE.Material,
  mirrorGlassMat: THREE.Material,
  carbonMat: THREE.Material,
  trimMat: THREE.Material,
  amberIndicatorMat: THREE.Material,
  isRight: boolean = false
): THREE.Group {
  const grp = new THREE.Group();
  grp.name = isRight ? "MirrorAssembly_R" : "MirrorAssembly_L";
  const side = isRight ? 1 : -1;

  // 1. Mounting arm
  const armGeo = new THREE.CylinderGeometry(0.008, 0.012, 0.14, 12, 1, false);
  armGeo.rotateZ(Math.PI / 3.2);
  const arm = new THREE.Mesh(armGeo, trimMat);
  arm.position.set(-0.02, -0.01, side * 0.06);
  arm.name = "MirrorArm";
  grp.add(arm);

  // Arm fairing
  const armFairingGeo = new THREE.CylinderGeometry(0.014, 0.018, 0.10, 10, 1, false);
  armFairingGeo.scale(1.0, 1.0, 0.6);
  armFairingGeo.rotateZ(Math.PI / 3.2);
  const armFairing = new THREE.Mesh(armFairingGeo, bodyPaintMat);
  armFairing.position.set(-0.02, 0.00, side * 0.06);
  armFairing.name = "MirrorArmFairing";
  grp.add(armFairing);

  // 2. Housing
  const housingGeo = new THREE.SphereGeometry(0.062, 20, 14);
  housingGeo.scale(1.9, 0.82, 0.95);
  const hPos = housingGeo.attributes.position;
  for (let i = 0; i < hPos.count; i++) {
    if (side * hPos.getZ(i) > 0.02) hPos.setZ(i, side * 0.02);
  }
  housingGeo.computeVertexNormals();
  const housing = new THREE.Mesh(housingGeo, bodyPaintMat);
  housing.position.set(-0.02, 0.06, side * 0.13);
  housing.name = "MirrorHousing";
  grp.add(housing);

  // 3. Mirror glass
  const glassGeo = new THREE.SphereGeometry(0.055, 18, 12);
  glassGeo.scale(0.05, 0.72, 0.88);
  const gPos = glassGeo.attributes.position;
  for (let i = 0; i < gPos.count; i++) {
    if (side * gPos.getX(i) < -0.01) gPos.setX(i, side * -0.01);
  }
  glassGeo.computeVertexNormals();
  const glass = new THREE.Mesh(glassGeo, mirrorGlassMat);
  glass.position.set(-0.02, 0.06, side * 0.11);
  glass.name = "MirrorGlass";
  grp.add(glass);

  // Glass bezel
  const bezelGeo = new THREE.TorusGeometry(0.054, 0.003, 8, 24);
  bezelGeo.scale(0.05, 0.72, 0.88);
  const bezel = new THREE.Mesh(bezelGeo, trimMat);
  bezel.position.set(-0.02, 0.06, side * 0.112);
  bezel.name = "MirrorBezel";
  grp.add(bezel);

  // 4. LED indicator
  const indicatorGeo = new THREE.BoxGeometry(0.003, 0.012, 0.10);
  const indicator = new THREE.Mesh(indicatorGeo, amberIndicatorMat);
  indicator.position.set(-0.02, 0.03, side * 0.14);
  indicator.name = "TurnIndicatorLED";
  grp.add(indicator);

  const lensMat = new THREE.MeshPhysicalMaterial({
    color: 0xffeedd, metalness: 0, roughness: 0.1,
    transmission: 0.7, transparent: true, opacity: 0.5,
    clearcoat: 1, clearcoatRoughness: 0.02, depthWrite: false, side: THREE.DoubleSide,
  });
  const lens = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.016, 0.11), lensMat);
  lens.position.set(-0.02, 0.03, side * 0.142);
  lens.name = "IndicatorLens";
  grp.add(lens);

  // 5. BSM triangle
  const bsmGeo = new THREE.BufferGeometry();
  bsmGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array([0,0.012,0, -0.008,-0.006,0, 0.008,-0.006,0]), 3));
  bsmGeo.computeVertexNormals();
  const bsm = new THREE.Mesh(bsmGeo, amberIndicatorMat);
  bsm.position.set(-0.025, 0.085, side * 0.09);
  bsm.name = "BSM_Triangle";
  grp.add(bsm);

  // 6. Camera pod
  const cam = new THREE.Mesh(new THREE.SphereGeometry(0.010, 10, 10), trimMat);
  cam.position.set(0, -0.02, side * 0.06);
  cam.name = "SurroundCamera";
  grp.add(cam);
  const camRing = new THREE.Mesh(new THREE.TorusGeometry(0.006, 0.002, 6, 16), trimMat);
  camRing.position.set(0, -0.02, side * 0.068);
  camRing.name = "CameraLensRing";
  grp.add(camRing);

  // 7. Aero strakes
  for (let k = 0; k < 3; k++) {
    const strake = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.004, 0.008), carbonMat);
    strake.position.set(-0.08, 0.02 + k * 0.022, side * 0.13);
    strake.name = "Strake";
    grp.add(strake);
  }

  // 8. Drain slot
  const drain = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.003, 0.004), trimMat);
  drain.position.set(-0.02, 0.01, side * 0.13);
  drain.name = "DrainSlot";
  grp.add(drain);

  return grp;
}

export function addSideMirrors(
  parent: THREE.Group,
  position: [number, number, number],
  bodyPaintMat: THREE.Material,
  mirrorGlassMat: THREE.Material,
  carbonMat: THREE.Material,
  trimMat: THREE.Material,
  amberIndicatorMat: THREE.Material,
  lateralOffset: number = 0.14
): void {
  const mL = createAerodynamicMirrorAssembly(bodyPaintMat, mirrorGlassMat, carbonMat, trimMat, amberIndicatorMat, false);
  mL.position.set(position[0], position[1], position[2] - lateralOffset);
  parent.add(mL);
  const mR = createAerodynamicMirrorAssembly(bodyPaintMat, mirrorGlassMat, carbonMat, trimMat, amberIndicatorMat, true);
  mR.position.set(position[0], position[1], position[2] + lateralOffset);
  parent.add(mR);
}