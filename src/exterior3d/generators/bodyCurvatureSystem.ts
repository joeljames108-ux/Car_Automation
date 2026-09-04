// ============================================================================
// AUTOMOTIVE BODY CURVATURE SYSTEM — Realistic Surface Construction
// ============================================================================
// Provides compound-curved body panels that replace flat/boxy geometry.
// Uses parametric surface lofting for stamping-grade automotive surfacing.
// ============================================================================

import * as THREE from 'three';

/**
 * Create a compound-curved automotive panel using parametric surface lofting.
 * Replaces flat PlaneGeometry with properly curved stamped panel geometry.
 */
export function createCompoundCurvedPanel(
  lengthM: number,
  widthM: number,
  gridX: number,
  gridY: number,
  surfaceFn: (u: number, v: number) => { x: number; y: number; z: number },
  material: THREE.Material,
  name: string
): THREE.Mesh {
  const geo = new THREE.PlaneGeometry(lengthM, widthM, gridX, gridY);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;

  for (let i = 0; i < pos.count; i++) {
    const px = pos.getX(i);
    const pz = pos.getZ(i);
    const u = (px + lengthM / 2) / lengthM;
    const v = (pz + widthM / 2) / widthM;
    const result = surfaceFn(u, v);
    pos.setX(i, result.x);
    pos.setY(i, result.y);
    pos.setZ(i, result.z);
  }

  geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, material);
  mesh.name = name;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

/** Parametric sedan hood surface */
export function sedanHoodSurface(
  hoodLen: number, spanZ: number, cowlHeight: number, grilleHeight: number
) {
  return (u: number, v: number) => {
    const vc = (v - 0.5) * 2;
    const slope = cowlHeight + (grilleHeight - cowlHeight) * u;
    const crown = (1.0 - vc * vc) * 0.030;
    const crease1 = Math.max(0, 0.012 - Math.abs(vc - 0.38) * 0.06) * (1.0 - u * 0.3);
    const crease2 = Math.max(0, 0.012 - Math.abs(vc + 0.38) * 0.06) * (1.0 - u * 0.3);
    const powerDome = Math.exp(-Math.pow(vc / 0.28, 2.0)) * 0.018 * (1.0 - u * 0.4);
    const edgeDrop = -Math.pow(Math.abs(vc), 3.5) * 0.012;
    return { x: (u - 0.5) * hoodLen, y: slope + crown + crease1 + crease2 + powerDome + edgeDrop, z: (v - 0.5) * spanZ };
  };
}

/** Parametric coupe hood surface */
export function coupeHoodSurface(
  hoodLen: number, spanZ: number, cowlHeight: number, noseHeight: number
) {
  return (u: number, v: number) => {
    const vc = (v - 0.5) * 2;
    const slope = cowlHeight + (noseHeight - cowlHeight) * Math.pow(u, 0.85);
    const powerDome = Math.exp(-Math.pow(vc / 0.30, 2.0)) * 0.040;
    const sideRoll = -Math.pow(Math.abs(vc), 2.2) * 0.050;
    const ventDepress = -(Math.exp(-Math.pow((Math.abs(vc) - 0.55) / 0.12, 2.0)) * 0.012);
    const noseTuck = u * u * (1.0 - Math.abs(vc)) * -0.015;
    return { x: (u - 0.5) * hoodLen, y: slope + powerDome + sideRoll + ventDepress + noseTuck, z: (v - 0.5) * spanZ };
  };
}

/** Parametric door surface with waist tuck, tumblehome, shoulder crease */
export function doorSurface(doorLen: number, doorHeight: number, isLeft: boolean, isRear = false) {
  return (u: number, v: number) => {
    const uc = (u - 0.5) * 2;
    const vc = (v - 0.5) * 2;
    const side = isLeft ? -1 : 1;
    const waistTuck = Math.sin(uc * Math.PI * 0.5) * 0.028;
    const tumblehome = Math.pow(vc + 1, 1.8) * 0.018;
    const lowerFlare = Math.max(0, -vc) * 0.012;
    const shoulderCrease = Math.exp(-Math.pow((vc - 0.56) * 6.0, 2.0)) * 0.008;
    const handleRecess = isRear ? 0 : -(Math.exp(-Math.pow((uc - 0.3) / 0.08, 2.0)) * Math.exp(-Math.pow((vc + 0.1) / 0.06, 2.0)) * 0.004);
    const convexSwell = Math.sin(uc * Math.PI) * Math.sin(vc * Math.PI) * 0.006;
    return { x: 0, y: 0, z: side * (waistTuck + tumblehome + lowerFlare + shoulderCrease + handleRecess + convexSwell) };
  };
}

/** Parametric sedan roof surface */
export function sedanRoofSurface(roofLen: number, roofWidth: number) {
  return (_u: number, v: number) => {
    const vc = (v - 0.5) * 2;
    const crown = (1.0 - vc * vc) * 0.018;
    const gutter = Math.pow(Math.abs(vc), 4.0) * 0.004;
    const centerChannel = -Math.exp(-Math.pow(vc / 0.12, 2.0)) * 0.003;
    return { x: 0, y: crown + gutter + centerChannel, z: 0 };
  };
}

/** Parametric rear fender haunch surface */
export function rearHaunchSurface(haunchLen: number, haunchHeight: number, isLeft: boolean) {
  return (u: number, v: number) => {
    const side = isLeft ? -1 : 1;
    const uc = (u - 0.5) * 2;
    const vc = (v - 0.5) * 2;
    const wheelBulge = Math.sin(uc * Math.PI) * 0.045;
    const heightBulge = Math.sin(vc * Math.PI * 0.8) * 0.020;
    const upperTaper = Math.max(0, vc) * -0.015;
    const lowerFlare = Math.max(0, -vc) * 0.008;
    return { x: 0, y: 0, z: side * (wheelBulge + heightBulge + upperTaper + lowerFlare) };
  };
}

/** Parametric trunk decklid surface */
export function trunkDeckSurface(trunkLen: number, trunkWidth: number) {
  return (u: number, v: number) => {
    const vc = (v - 0.5) * 2;
    const uc = (u - 0.5) * 2;
    const crown = (1.0 - vc * vc) * 0.014;
    const rearLip = Math.pow(Math.max(0, uc), 2.0) * 0.006;
    const charLine1 = Math.max(0, 0.005 - Math.abs(vc - 0.42) * 0.03);
    const charLine2 = Math.max(0, 0.005 - Math.abs(vc + 0.42) * 0.03);
    return { x: 0, y: crown + rearLip + charLine1 + charLine2, z: 0 };
  };
}

/** Parametric front bumper surface */
export function frontBumperSurface(bumperLen: number, bumperWidth: number, bumperHeight: number) {
  return (u: number, v: number) => {
    const vc = (v - 0.5) * 2;
    const hc = (u - 0.5) * 2;
    const centralBulge = (1.0 - vc * vc) * 0.025;
    const spoilerLip = Math.max(0, -hc) * 0.015 * (1.0 - Math.abs(vc) * 0.5);
    const cornerWrap = vc * vc * 0.020 * (1.0 - Math.abs(hc));
    return { x: 0, y: 0, z: centralBulge + spoilerLip + cornerWrap };
  };
}

/** Parametric rear bumper surface */
export function rearBumperSurface(bumperLen: number, bumperWidth: number, bumperHeight: number) {
  return (u: number, v: number) => {
    const vc = (v - 0.5) * 2;
    const hc = (u - 0.5) * 2;
    const convex = (1.0 - vc * vc) * 0.018;
    const exhaustBulge = Math.exp(-Math.pow((Math.abs(vc) - 0.35) / 0.12, 2.0)) * 0.008;
    const cornerWrap = vc * vc * 0.015 * (1.0 - Math.abs(hc));
    return { x: 0, y: 0, z: convex + exhaustBulge + cornerWrap };
  };
}

/** Create a proper automotive wheel arch with inner liner and fender lip */
export function createWheelArchGroup(
  innerRadiusM: number,
  outerRadiusM: number,
  widthM: number,
  material: THREE.Material,
  linerMaterial: THREE.Material,
  isLeft: boolean
): THREE.Group {
  const group = new THREE.Group();
  group.name = isLeft ? 'WheelArch_Left' : 'WheelArch_Right';
  const side = isLeft ? -1 : 1;

  // Outer fender arch
  const outerArchGeo = new THREE.TorusGeometry(outerRadiusM, 0.012, 8, 32, Math.PI);
  const outerArch = new THREE.Mesh(outerArchGeo, material);
  outerArch.position.set(0, innerRadiusM, side * widthM * 0.5);
  outerArch.rotation.y = Math.PI / 2;
  outerArch.rotation.x = isLeft ? Math.PI : 0;
  outerArch.castShadow = true;
  group.add(outerArch);

  // Inner wheel liner
  const innerLinerGeo = new THREE.TorusGeometry(innerRadiusM * 1.02, 0.008, 8, 24, Math.PI * 1.1);
  const innerLiner = new THREE.Mesh(innerLinerGeo, linerMaterial);
  innerLiner.position.set(0, innerRadiusM * 0.98, side * widthM * 0.38);
  innerLiner.rotation.y = Math.PI / 2;
  innerLiner.rotation.x = isLeft ? Math.PI * 0.95 : Math.PI * 0.05;
  group.add(innerLiner);

  // Fender lip (rolled edge)
  const lipGeo = new THREE.TorusGeometry(outerRadiusM * 1.01, 0.006, 6, 28, Math.PI * 1.05);
  const lip = new THREE.Mesh(lipGeo, material);
  lip.position.set(0, innerRadiusM * 1.01, side * widthM * 0.48);
  lip.rotation.y = Math.PI / 2;
  lip.rotation.x = isLeft ? Math.PI : 0;
  group.add(lip);

  // Mudflap
  const mudflapGeo = new THREE.BoxGeometry(0.08, 0.12, 0.003);
  const mudflap = new THREE.Mesh(mudflapGeo, linerMaterial);
  mudflap.position.set(-innerRadiusM * 0.95, innerRadiusM * 0.3, side * widthM * 0.42);
  group.add(mudflap);

  return group;
}

export function createSUVDoorGeometry(w: number, h: number, d: number): THREE.BufferGeometry {
  const geo = new THREE.BoxGeometry(w, h, d);
  geo.computeVertexNormals();
  return geo;
}

export function createPickupHoodGeometry(w: number, h: number, d: number): THREE.BufferGeometry {
  const geo = new THREE.BoxGeometry(w, h, d);
  geo.computeVertexNormals();
  return geo;
}

export function createHatchbackHoodGeometry(w: number, h: number, d: number): THREE.BufferGeometry {
  const geo = new THREE.BoxGeometry(w, h, d);
  geo.computeVertexNormals();
  return geo;
}
