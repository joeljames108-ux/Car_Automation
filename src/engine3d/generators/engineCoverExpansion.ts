// ============================================================================
// EXPANDED ENGINE COVER SYSTEM — 25 MODELS ACROSS 5 ENGINE FAMILIES
// ============================================================================
// Complete cover library covering V-Type, Inline, Boxer, W-Type, and Rotary.
// When engine cover is active, internal components are hidden for optimization.
// ============================================================================

import * as THREE from 'three';
import { globalMaterialLibrary } from '../materials/pbrMaterialSystem';
import { createAllenSocketHead, mergeBufferGeometries } from './geometryDetailUtils';
import type { EngineCoverBuildOptions } from './engineCoverGenerator';

// Helper to add a mesh at a position cleanly
function addMeshAt(
  group: THREE.Group,
  geo: THREE.BufferGeometry,
  mat: THREE.Material,
  x: number, y: number, z: number,
  rx = 0, ry = 0, rz = 0,
  castShadow = true,
): THREE.Mesh {
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, y, z);
  if (rx) mesh.rotation.x = rx;
  if (ry) mesh.rotation.y = ry;
  if (rz) mesh.rotation.z = rz;
  mesh.castShadow = castShadow;
  mesh.receiveShadow = true;
  group.add(mesh);
  return mesh;
}

// Helper: bolt pattern around perimeter
function addBoltPattern(
  group: THREE.Group,
  mat: THREE.Material,
  positions: [number, number, number][],
  radius: number,
  height: number,
): void {
  for (const [bx, by, bz] of positions) {
    const bGeo = createAllenSocketHead(radius, height, radius * 0.6);
    bGeo.rotateX(Math.PI / 2);
    addMeshAt(group, bGeo, mat, bx, by, bz);
  }
}

// Helper: rounded rect shape
function rRect(w: number, h: number, r: number): THREE.Shape {
  const s = new THREE.Shape();
  const x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

// ============================================================================
// === INLINE ENGINE COVERS (I3/I4/I5/I6) ===================================
// ============================================================================

// MODEL: BMW M-POWER RIBBED COVER (Inline 6)
export function buildInlineMPowerCover(opts: EngineCoverBuildOptions): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Inline_M_Power_Ribbed_Cover';
  const matLib = globalMaterialLibrary;
  const matCover = matLib.getBMW_Orange();
  const matBezel = matLib.getBrushedAluminum();
  const matBlack = matLib.getStealthBlackCeramic();
  const matChrome = matLib.getPolishedChrome();
  const matTitanium = matLib.getTitaniumAerospace();

  const cyls = opts.cylsPerBank || 6;
  const coverLen = Math.max(0.48, cyls * 0.125);
  const coverW = 0.26;

  // 1. Main BMW M ribbed cover plate
  const mainGeo = new THREE.BoxGeometry(coverLen, coverW, 0.04);
  addMeshAt(group, mainGeo, matCover, 0, 0, 0.035);

  // 2. Longitudinal ribs (BMW signature)
  for (let r = 0; r < 7; r++) {
    const ry = -coverW * 0.4 + r * coverW * 0.133;
    const ribGeo = new THREE.BoxGeometry(coverLen * 0.92, 0.006, 0.012);
    addMeshAt(group, ribGeo, matBezel, 0, ry, 0.06);
  }

  // 3. BMW M tri-color stripe (blue-violet-red)
  const stripeColors = [0x0066b1, 0x6c1d8e, 0xcc0000];
  stripeColors.forEach((color, i) => {
    const sMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(color), metalness: 0.2, roughness: 0.3, clearcoat: 0.8,
    });
    const sGeo = new THREE.BoxGeometry(coverLen * 0.92, 0.008, 0.003);
    addMeshAt(group, sGeo, sMat, 0, -coverW * 0.28 + i * 0.012, 0.064);
  });

  // 4. BMW roundel badge center
  const roundelGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.005, 24);
  addMeshAt(group, roundelGeo, matChrome, 0, 0, 0.068, Math.PI / 2);
  const roundelRimGeo = new THREE.TorusGeometry(0.024, 0.003, 8, 24);
  addMeshAt(group, roundelRimGeo, matBezel, 0, 0, 0.068);

  // 5. Individual coil-on-plug wells
  const startX = -(coverLen * 0.78) / 2;
  const step = (coverLen * 0.78) / Math.max(1, cyls - 1);
  for (let i = 0; i < cyls; i++) {
    const cx = startX + i * step;
    const wellGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.025, 16);
    addMeshAt(group, wellGeo, matBlack, cx, 0, 0.055, Math.PI / 2);
    // Ignition coil top
    const coilGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.008, 12);
    addMeshAt(group, coilGeo, matTitanium, cx, 0, 0.07);
  }

  // 6. Oil filler cap
  const capGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.014, 20);
  addMeshAt(group, capGeo, matBezel, coverLen * 0.35, -coverW * 0.35, 0.06, Math.PI / 2);
  const gripGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.018, 6);
  addMeshAt(group, gripGeo, matChrome, coverLen * 0.35, -coverW * 0.35, 0.065, Math.PI / 2);

  // 7. "BMW M POWER" badge lettering placeholder (box)
  const badgePlate = new THREE.BoxGeometry(0.12, 0.03, 0.004);
  addMeshAt(group, badgePlate, matChrome, coverLen * 0.15, -coverW * 0.38, 0.06);

  // 8. Perimeter bolts
  addBoltPattern(group, matTitanium, [
    [-coverLen * 0.44, -coverW * 0.42, 0.058],
    [-coverLen * 0.44, coverW * 0.42, 0.058],
    [0, -coverW * 0.44, 0.058],
    [0, coverW * 0.44, 0.058],
    [coverLen * 0.44, -coverW * 0.42, 0.058],
    [coverLen * 0.44, coverW * 0.42, 0.058],
  ], 0.004, 0.008);

  return group;
}

// MODEL: HONDA VTEC EARTH DREAMS COVER (Inline 4)
export function buildInlineVTECCover(opts: EngineCoverBuildOptions): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Inline_VTEC_Earth_Dreams';
  const matLib = globalMaterialLibrary;
  const matCover = matLib.getMazdaSoulRed();
  const matBezel = matLib.getBrushedAluminum();
  const matBlack = matLib.getStealthBlackCeramic();

  const cyls = opts.cylsPerBank || 4;
  const coverLen = Math.max(0.38, cyls * 0.12);
  const coverW = 0.22;

  // 1. Contoured cover with raised center dome
  const mainGeo = new THREE.BoxGeometry(coverLen, coverW, 0.035);
  addMeshAt(group, mainGeo, matCover, 0, 0, 0.03);

  // 2. Central intake plenum dome
  const domeGeo = new THREE.CylinderGeometry(0.065, 0.08, 0.045, 28);
  addMeshAt(group, domeGeo, matCover, 0, 0, 0.06);
  const domeRimGeo = new THREE.TorusGeometry(0.082, 0.004, 8, 28);
  addMeshAt(group, domeRimGeo, matBezel, 0, 0, 0.083);

  // 3. VTEC solenoid housing
  const solGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.03, 12);
  addMeshAt(group, solGeo, matBezel, coverLen * 0.3, coverW * 0.3, 0.05, Math.PI / 2);

  // 4. Coil-on-plug wells
  const startX = -(coverLen * 0.7) / 2;
  const step = (coverLen * 0.7) / Math.max(1, cyls - 1);
  for (let i = 0; i < cyls; i++) {
    const cx = startX + i * step;
    const wellGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.02, 14);
    addMeshAt(group, wellGeo, matBlack, cx, 0, 0.048, Math.PI / 2);
    // Orange ignition wire
    const wireGeo = new THREE.CylinderGeometry(0.003, 0.003, 0.025, 8);
    addMeshAt(group, wireGeo, new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0xff6600), metalness: 0.1, roughness: 0.5,
    }), cx, 0, 0.06);
  }

  // 5. Oil filler cap
  const capGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.012, 20);
  addMeshAt(group, capGeo, matBezel, -coverLen * 0.35, -coverW * 0.3, 0.055, Math.PI / 2);

  // 6. Perimeter fastener bolts
  addBoltPattern(group, matBezel, [
    [-coverLen * 0.42, -coverW * 0.4, 0.052],
    [-coverLen * 0.42, coverW * 0.4, 0.052],
    [coverLen * 0.42, -coverW * 0.4, 0.052],
    [coverLen * 0.42, coverW * 0.4, 0.052],
  ], 0.004, 0.007);

  return group;
}

// MODEL: JDM TURBO FLAT COVER (Inline 4/6)
export function buildInlineJDMFlatCover(opts: EngineCoverBuildOptions): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Inline_JDM_Turbo_Flat';
  const matLib = globalMaterialLibrary;
  const matCover = matLib.getNismoUltima

// ============================================================================
// === W-TYPE ENGINE COVERS (W12/W16/W18) ====================================
// ============================================================================

// MODEL: W12 CONTINENTAL GRAND COVER
export function buildW12ContinentalGrandCover(opts: EngineCoverBuildOptions): THREE.Group {
  const group = new THREE.Group();
  group.name = 'W12_Continental_Grand';
  const matLib = globalMaterialLibrary;
  const matCover = matLib.getAMGGalacticBeige();
  const matBezel = matLib.getDarkChrome();
  const matChrome = matLib.getPolishedChrome();
  const matCarbon = matLib.getDryCarbonFiber();

  // 1. Wide luxury plenum cover
  const mainGeo = new THREE.BoxGeometry(0.70, 0.38, 0.055);
  addMeshAt(group, mainGeo, matCover, 0, 0, 0.04);

  // 2. Chrome center stripe with W12 emblem
  const stripeGeo = new THREE.BoxGeometry(0.66, 0.04, 0.005);
  addMeshAt(group, stripeGeo, matChrome, 0, 0, 0.07);
  const emblemGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.006, 20);
  addMeshAt(group, emblemGeo, matChrome, 0, 0, 0.078, Math.PI / 2);

  // 3. Quad intake runners per bank (4 banks total for W12)
  for (const side of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      const rx = -0.22 + i * 0.22;
      const runnerGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.04, 12);
      addMeshAt(group, runnerGeo, matBezel, rx, side * 0.15, 0.075, Math.PI / 2);
    }
  }

  // 4. Carbon fiber side heat shields
  for (const side of [-1, 1]) {
    const shieldGeo = new THREE.BoxGeometry(0.66, 0.06, 0.004);
    addMeshAt(group, shieldGeo, matCarbon, 0, side * 0.17, 0.04);
  }

  // 5. Luxury oil cap with knurl
  const capGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.016, 24);
  addMeshAt(group, capGeo, matChrome, 0.30, -0.14, 0.065, Math.PI / 2);

  return group;
}

// MODEL: W16 MODIFIED MONSTER COVER
export function buildW16ModifiedMonsterCover(opts: EngineCoverBuildOptions): THREE.Group {
  const group = new THREE.Group();
  group.name = 'W16_Modified_Monster';
  const matLib = globalMaterialLibrary;
  const matCover = matLib.getBugattiCarbonBlue();
  const matBezel = matLib.getAnodizedRed();
  const matTitanium = matLib.getTitaniumAerospace();

  // 1. Massive aggressive carbon fiber cover
  const mainGeo = new THREE.BoxGeometry(0.74, 0.40, 0.06);
  addMeshAt(group, mainGeo, matCover, 0, 0, 0.04);

  // 2. Angular aero fins
  for (let f = 0; f < 6; f++) {
    const fx = -0.28 + f * 0.112;
    const finGeo = new THREE.BoxGeometry(0.006, 0.08, 0.04);
    const fin = new THREE.Mesh(finGeo, matBezel);
    fin.position.set(fx, 0, 0.08);
    fin.rotation.z = 0.15;
    group.add(fin);
  }

  // 3. Quad turbo inlet ducts
  for (const [sx, sy] of [[-0.28, -0.15], [-0.28, 0.15], [0.28, -0.15], [0.28, 0.15]]) {
    const ductGeo = new THREE.CylinderGeometry(0.025, 0.03, 0.06, 16);
    addMeshAt(group, ductGeo, matTitanium, sx, sy, 0.055, Math.PI / 2);
  }

  // 4. Red center accent strip
  const stripGeo = new THREE.BoxGeometry(0.68, 0.02, 0.004);
  addMeshAt(group, stripGeo, matBezel, 0, 0, 0.075);

  return group;
}

// MODEL: W12 CENTRAL EXHAUST COVER
export function buildW12CentralExhaustCover(opts: EngineCoverBuildOptions): THREE.Group {
  const group = new THREE.Group();
  group.name = 'W12_Central_Exhaust';
  const matLib = globalMaterialLibrary;
  const matCover = matLib.getLamboArancio();
  const matBezel = matLib.getBrushedAluminum();
  const matInconel = matLib.getInconelExhaust();

  // 1. Bold orange cover
  const mainGeo = new THREE.BoxGeometry(0.68, 0.36, 0.05);
  addMeshAt(group, mainGeo, matCover, 0, 0, 0.04);

  // 2. Central exhaust tunnel
  const tunnelGeo = new THREE.BoxGeometry(0.60, 0.08, 0.025);
  addMeshAt(group, tunnelGeo, matInconel, 0, 0, 0.07);

  // 3. Heat-dissipating fins around tunnel
  for (let f = 0; f < 8; f++) {
    const fx = -0.24 + f * 0.068;
    const finGeo = new THREE.BoxGeometry(0.003, 0.06, 0.015);
    addMeshAt(group, finGeo, matBezel, fx, 0, 0.09);
  }

  // 4. Side cooling vents
  for (const side of [-1, 1]) {
    for (let v = 0; v < 4; v++) {
      const vy = side * (0.12 + v * 0.04);
      const ventGeo = new THREE.BoxGeometry(0.08, 0.006, 0.003);
      addMeshAt(group, ventGeo, matBezel, 0, vy, 0.066);
    }
  }

  return group;
}

// MODEL: W16 BENTLEY HERITAGE COVER
export function buildW16BentleyHeritageCover(opts: EngineCoverBuildOptions): THREE.Group {
  const group = new THREE.Group();
  group.name = 'W16_Bentley_Heritage';
  const matLib = globalMaterialLibrary;
  const matCover = matLib.getAMGGalacticBeige();
  const matBezel = matLib.getBronzeAntique();
  const matChrome = matLib.getPolishedChrome();

  // 1. Grand tourer-style wide cover
  const mainGeo = new THREE.BoxGeometry(0.72, 0.40, 0.055);
  addMeshAt(group, mainGeo, matCover, 0, 0, 0.04);

  // 2. Central chrome wing badge plate
  const badgeGeo = new THREE.BoxGeometry(0.20, 0.06, 0.01);
  addMeshAt(group, badgeGeo, matChrome, 0, 0, 0.07);

  // 3. Bronze accent ribs
  for (let r = 0; r < 8; r++) {
    const rx = -0.30 + r * 0.085;
    const ribGeo = new THREE.BoxGeometry(0.005, 0.36, 0.008);
    addMeshAt(group, ribGeo, matBezel, rx, 0, 0.07);
  }

  // 4. Twin oil filler caps (luxury style)
  for (const side of [-1, 1]) {
    const capGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.014, 20);
    addMeshAt(group, capGeo, matChrome, side * 0.28, -0.14, 0.065, Math.PI / 2);
  }

  return group;
}

// ============================================================================
// === ROTARY ENGINE COVERS (2/3/4-ROTOR) ====================================
// ============================================================================

// MODEL: MAZDA 13B STREET COVER
export function buildRotary13BStreetCover(opts: EngineCoverBuildOptions): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Rotary_13B_Street';
  const matLib = globalMaterialLibrary;
  const matCover = matLib.getMazdaSoulRed();
  const matBezel = matLib.getBrushedAluminum();

  // 1. Reuleaux triangle shape housing
  const rotorShape = new THREE.Shape();
  const r = 0.18;
  for (let i = 0; i < 3; i++) {
    const a1 = (i * 2 * Math.PI) / 3;
    const a2 = ((i + 1) * 2 * Math.PI) / 3;
    const x1 = Math.cos(a1) * r;
    const y1 = Math.sin(a1) * r;
    const x2 = Math.cos(a2) * r;
    const y2 = Math.sin(a2) * r;
    if (i === 0) rotorShape.moveTo(x1, y1);
    const midAngle = (a1 + a2) / 2;
    rotorShape.quadraticCurveTo(
      Math.cos(midAngle) * r * 1.22,
      Math.sin(midAngle) * r * 1.22,
      x2, y2
    );
  }
  const rotorGeo = new THREE.ExtrudeGeometry(rotorShape, {
    depth: 0.04, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.006, bevelSegments: 2,
  });
  addMeshAt(group, rotorGeo, matCover, 0, 0, 0.015);

  // 2. Central gear ring
  const gearGeo = new THREE.TorusGeometry(0.07, 0.01, 12, 28);
  addMeshAt(group, gearGeo, matBezel, 0, 0, 0.06);

  // 3. Mazda "R" badge
  const badgeGeo = new THREE.BoxGeometry(0.04, 0.02, 0.003);
  addMeshAt(group, badgeGeo, matBezel, 0, 0.06, 0.065);

  return group;
}

// MODEL: 3-ROTOR RACE COVER
export function buildRotary3RotorRaceCover(opts: EngineCoverBuildOptions): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Rotary_3Rotor_Race';
  const matLib = globalMaterialLibrary;
  const matCover = matLib.getDryCarbonFiber();
  const matBezel = matLib.getGoldAnodized();
  const matTitanium = matLib.getTitaniumAerospace();

  // 1. Extended triple-rotor housing shape
  const mainGeo = new THREE.BoxGeometry(0.56, 0.30, 0.04);
  addMeshAt(group, mainGeo, matCover, 0, 0, 0.03);

  // 2. Three rotor inspection windows
  for (let i = 0; i < 3; i++) {
    const wx = -0.18 + i * 0.18;
    const windowGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.005, 20);
    addMeshAt(group, windowGeo, matBezel, wx, 0, 0.055, Math.PI / 2);
    const rimGeo = new THREE.TorusGeometry(0.042, 0.004, 8, 20);
    addMeshAt(group, rimGeo, matTitanium, wx, 0, 0.055);
  }

  // 3. Turbo intake duct
  const 
