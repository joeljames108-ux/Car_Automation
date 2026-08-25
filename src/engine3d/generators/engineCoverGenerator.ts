// ============================================================================
// ULTRA-HIGH-FIDELITY MODULAR GLB GENERATOR — RACING ENGINE BEAUTY COVERS
// ============================================================================
// Solid-modeling engineering generator supporting 5 distinct high-performance
// engine cover models + exposed race valvetrain:
//   1. APEX HYPERCAR MONOCOQUE (Quartz window, gold bezel, ram scoop, louvers)
//   2. SARTHE GT3 ENDURANCE (Twin carbon airboxes, exposed ITBs, racing livery)
//   3. MODENA BILLET SKELETON (CNC 6061-T6 lattice truss frame, open valvetrain)
//   4. PRANCING HERITAGE WRINKLE-RED (Dual cast plenum with cooling fins & badges)
//   5. STEALTH TRACK VORTEX (Forged carbon with gold flake & vortex aero blades)
//   6. EXPOSED ITB RACING PURIST (Raw velocity stacks & billet fuel rails)
//
// Includes full alphanumeric 3D stroke-font geometry (canvas-free) and rich PBR materials.
// ============================================================================

import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { globalMaterialLibrary } from '../materials/pbrMaterialSystem';
import {
  createAllenSocketHead,
  mergeBufferGeometries,
} from './geometryDetailUtils';
import type {
  EngineCoverModel,
  EngineCoverColor,
  EngineCoverBezelColor,
} from '../../sim/engine/masterEngineTypes';
import type { EngineConfig } from '../../sim/types';

// Polyfill Node.js FileReader if executing in CLI
if (typeof globalThis !== 'undefined' && typeof (globalThis as any).FileReader === 'undefined') {
  class NodeFileReader {
    result: ArrayBuffer | null = null;
    onloadend: (() => void) | null = null;
    async readAsArrayBuffer(blob: Blob) {
      this.result = await blob.arrayBuffer();
      if (this.onloadend) this.onloadend();
    }
  }
  // @ts-ignore
  globalThis.FileReader = NodeFileReader;
}

export interface EngineCoverSpec {
  coverLengthM: number;
  coverWidthM: number;
  coverHeightM: number;
  glassWindowWidthM: number;
  glassWindowLengthM: number;
  scoopHeightM: number;
  louverCount: number;
}

export const V12_COVER_SPECS: EngineCoverSpec = {
  coverLengthM: 0.72,
  coverWidthM: 0.44,
  coverHeightM: 0.08,
  glassWindowWidthM: 0.172,
  glassWindowLengthM: 0.552,
  scoopHeightM: 0.03,
  louverCount: 6,
};

export interface EngineCoverBuildOptions {
  model?: EngineCoverModel;
  coverColor?: EngineCoverColor;
  bezelColor?: EngineCoverBezelColor;
  stripeStyle?: string;
  stripeColor?: string;
  badgeText?: string;
  badgeFinish?: string;
  cylsPerBank?: number;
}

// ─── SHAPE HELPERS ──────────────────────────────────────────────────────────

function roundedRectPath(target: THREE.Path, w: number, h: number, r: number): void {
  const x = -w / 2;
  const y = -h / 2;
  target.moveTo(x + r, y);
  target.lineTo(x + w - r, y);
  target.quadraticCurveTo(x + w, y, x + w, y + r);
  target.lineTo(x + w, y + h - r);
  target.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  target.lineTo(x + r, y + h);
  target.quadraticCurveTo(x, y + h, x, y + h - r);
  target.lineTo(x, y + r);
  target.quadraticCurveTo(x, y, x + r, y);
}

function roundedRectShape(w: number, h: number, r: number): THREE.Shape {
  const s = new THREE.Shape();
  roundedRectPath(s, w, h, r);
  return s;
}

/** Extruded rounded frame (rounded rect with rounded-rect hole), bevelled, base at z=0. */
function roundedFrameGeometry(
  w: number,
  h: number,
  r: number,
  holeW: number,
  holeH: number,
  holeR: number,
  depth: number,
  bevel: number
): THREE.BufferGeometry {
  const shape = roundedRectShape(w, h, r);
  shape.holes.push(roundedRectShape(holeW, holeH, holeR));
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 2,
    curveSegments: 24,
  });
  geo.translate(0, 0, bevel);
  return geo;
}

// ─── COMPLETE ALPHANUMERIC STROKE-FONT (geometry, canvas-free) ───────────────
// Glyphs defined as stroke segments on a 3.4-wide × 6-tall grid.

export const COVER_LETTER_FONT: Record<string, number[][]> = {
  A: [[0, 0, 1.7, 6], [1.7, 6, 3.4, 0], [0.8, 2.1, 2.6, 2.1]],
  B: [[0, 0, 0, 6], [0, 6, 2.2, 6], [2.2, 6, 3.2, 4.8], [3.2, 4.8, 2.2, 3.2], [2.2, 3.2, 0, 3.2], [2.2, 3.2, 3.4, 1.6], [3.4, 1.6, 2.2, 0], [2.2, 0, 0, 0]],
  C: [[3.4, 4.8, 3.4, 6], [3.4, 6, 0, 6], [0, 6, 0, 0], [0, 0, 3.4, 0], [3.4, 0, 3.4, 1.2]],
  D: [[0, 0, 0, 6], [0, 6, 1.8, 6], [1.8, 6, 3.4, 4.5], [3.4, 4.5, 3.4, 1.5], [3.4, 1.5, 1.8, 0], [1.8, 0, 0, 0]],
  E: [[0, 0, 0, 6], [0, 6, 3.2, 6], [0, 3.1, 2.5, 3.1], [0, 0, 3.2, 0]],
  F: [[0, 0, 0, 6], [0, 6, 3.2, 6], [0, 3.2, 2.4, 3.2]],
  G: [[3.4, 4.8, 3.4, 6], [3.4, 6, 0, 6], [0, 6, 0, 0], [0, 0, 3.4, 0], [3.4, 0, 3.4, 2.4], [3.4, 2.4, 2.0, 2.4]],
  H: [[0, 0, 0, 6], [3.4, 0, 3.4, 6], [0, 3.1, 3.4, 3.1]],
  I: [[0.5, 6, 2.9, 6], [1.7, 6, 1.7, 0], [0.5, 0, 2.9, 0]],
  J: [[3.4, 6, 3.4, 1.2], [3.4, 1.2, 2.2, 0], [2.2, 0, 0.8, 0], [0.8, 0, 0, 1.2], [0, 1.2, 0, 2.4], [1.5, 6, 3.4, 6]],
  K: [[0, 0, 0, 6], [3.4, 6, 0, 2.8], [0.8, 3.4, 3.4, 0]],
  L: [[0, 6, 0, 0], [0, 0, 3.0, 0]],
  M: [[0, 0, 0, 6], [0, 6, 1.7, 2.5], [1.7, 2.5, 3.4, 6], [3.4, 6, 3.4, 0]],
  N: [[0, 0, 0, 6], [0, 6, 3.4, 0], [3.4, 0, 3.4, 6]],
  O: [[0.9, 6, 2.5, 6], [2.5, 6, 3.4, 5.1], [3.4, 5.1, 3.4, 0.9], [3.4, 0.9, 2.5, 0], [2.5, 0, 0.9, 0], [0.9, 0, 0, 0.9], [0, 0.9, 0, 5.1], [0, 5.1, 0.9, 6]],
  P: [[0, 0, 0, 6], [0, 6, 2.5, 6], [2.5, 6, 3.4, 4.8], [3.4, 4.8, 2.5, 3.2], [2.5, 3.2, 0, 3.2]],
  Q: [[0.9, 6, 2.5, 6], [2.5, 6, 3.4, 5.1], [3.4, 5.1, 3.4, 0.9], [3.4, 0.9, 2.5, 0], [2.5, 0, 0.9, 0], [0.9, 0, 0, 0.9], [0, 0.9, 0, 5.1], [0, 5.1, 0.9, 6], [1.8, 1.8, 3.4, 0]],
  R: [[0, 0, 0, 6], [0, 6, 2.6, 6], [2.6, 6, 2.6, 3.4], [2.6, 3.4, 0, 3.4], [1.3, 3.4, 3.4, 0]],
  S: [[3.1, 6, 0.7, 6], [0.7, 6, 0, 5.2], [0, 5.2, 0, 3.9], [0, 3.9, 0.7, 3.1], [0.7, 3.1, 2.7, 3.1], [2.7, 3.1, 3.4, 2.3], [3.4, 2.3, 3.4, 1.0], [3.4, 1.0, 2.7, 0], [2.7, 0, 0.3, 0]],
  T: [[0, 6, 3.4, 6], [1.7, 6, 1.7, 0]],
  U: [[0, 6, 0, 0.9], [0, 0.9, 0.9, 0], [0.9, 0, 2.5, 0], [2.5, 0, 3.4, 0.9], [3.4, 0.9, 3.4, 6]],
  V: [[0, 6, 1.7, 0], [1.7, 0, 3.4, 6]],
  W: [[0, 6, 0.8, 0], [0.8, 0, 1.7, 3.5], [1.7, 3.5, 2.6, 0], [2.6, 0, 3.4, 6]],
  X: [[0, 6, 3.4, 0], [0, 0, 3.4, 6]],
  Y: [[0, 6, 1.7, 3.2], [3.4, 6, 1.7, 3.2], [1.7, 3.2, 1.7, 0]],
  Z: [[0, 6, 3.4, 6], [3.4, 6, 0, 0], [0, 0, 3.4, 0]],
  '0': [[0.9, 6, 2.5, 6], [2.5, 6, 3.4, 5.1], [3.4, 5.1, 3.4, 0.9], [3.4, 0.9, 2.5, 0], [2.5, 0, 0.9, 0], [0.9, 0, 0, 0.9], [0, 0.9, 0, 5.1], [0, 5.1, 0.9, 6], [0.6, 1.2, 2.8, 4.8]],
  '1': [[1.7, 0, 1.7, 6], [0.6, 5.1, 1.7, 6], [0.8, 0, 2.6, 0]],
  '2': [[0.3, 6, 2.9, 6], [2.9, 6, 3.4, 5.3], [3.4, 5.3, 3.4, 4.5], [3.4, 4.5, 0, 0], [0, 0, 3.4, 0]],
  '3': [[0.3, 6, 3.2, 6], [3.2, 6, 3.2, 3.3], [3.2, 3.3, 1.2, 3.3], [3.2, 3.3, 3.2, 0.8], [3.2, 0.8, 2.4, 0], [2.4, 0, 0.3, 0]],
  '4': [[2.6, 0, 2.6, 6], [2.6, 6, 0, 2.0], [0, 2.0, 3.4, 2.0]],
  '5': [[3.2, 6, 0, 6], [0, 6, 0, 3.4], [0, 3.4, 2.6, 3.4], [2.6, 3.4, 3.4, 2.2], [3.4, 2.2, 3.4, 0.9], [3.4, 0.9, 2.4, 0], [2.4, 0, 0, 0]],
  '6': [[3.0, 6, 0.8, 6], [0.8, 6, 0, 4.5], [0, 4.5, 0, 0.9], [0, 0.9, 0.9, 0], [0.9, 0, 2.5, 0], [2.5, 0, 3.4, 0.9], [3.4, 0.9, 3.4, 3.1], [3.4, 3.1, 0, 3.1]],
  '7': [[0, 6, 3.4, 6], [3.4, 6, 1.2, 0]],
  '8': [[0.8, 6, 2.6, 6], [2.6, 6, 3.4, 4.8], [3.4, 4.8, 2.6, 3.3], [2.6, 3.3, 0.8, 3.3], [0.8, 3.3, 0, 4.8], [0, 4.8, 0.8, 6], [2.6, 3.3, 3.4, 1.8], [3.4, 1.8, 2.6, 0], [2.6, 0, 0.8, 0], [0.8, 0, 0, 1.8], [0, 1.8, 0.8, 3.3]],
  '9': [[3.4, 2.9, 0, 2.9], [0, 2.9, 0, 5.1], [0, 5.1, 0.9, 6], [0.9, 6, 2.5, 6], [2.5, 6, 3.4, 5.1], [3.4, 5.1, 3.4, 1.5], [3.4, 1.5, 2.6, 0], [2.6, 0, 0.4, 0]],
  '-': [[0.6, 3.0, 2.8, 3.0]],
  '/': [[0.5, 0, 2.9, 6]],
  '.': [[1.4, 0, 2.0, 0]],
  '!': [[1.7, 2.0, 1.7, 6], [1.7, 0, 1.7, 0.8]],
};

const LETTER_ADVANCE = 5.2;
const SPACE_ADVANCE = 3.2;

/** Builds merged, centered stroke lettering geometry lying in the XY plane (z = extrusion). */
export function buildStrokeLettering(
  text: string,
  letterHeight: number,
  strokeUnits: number,
  depth: number,
  italicShear: number
): THREE.BufferGeometry {
  const unit = letterHeight / 6;
  const stroke = strokeUnits * unit;
  const geos: THREE.BufferGeometry[] = [];
  let cursor = 0;

  const normalized = text.toUpperCase();

  for (const ch of normalized) {
    if (ch === ' ') {
      cursor += SPACE_ADVANCE;
      continue;
    }
    const segs = COVER_LETTER_FONT[ch];
    if (!segs) {
      cursor += LETTER_ADVANCE;
      continue;
    }
    for (const seg of segs) {
      const [x1, y1, x2, y2] = seg;
      const len = Math.hypot(x2 - x1, y2 - y1);
      const angle = Math.atan2(y2 - y1, x2 - x1);
      const ox = (cursor + x1) * unit;
      const oy = y1 * unit;
      const mx = (cursor + (x1 + x2) / 2) * unit;
      const my = ((y1 + y2) / 2) * unit;

      const bar = new THREE.BoxGeometry(len * unit + stroke, stroke, depth);
      bar.rotateZ(angle);
      bar.translate(mx, my, depth / 2);
      geos.push(bar);

      for (const [px, py] of [[ox, oy], [ox + (x2 - x1) * unit, oy + (y2 - y1) * unit]]) {
        const cap = new THREE.CylinderGeometry(stroke / 2, stroke / 2, depth, 8);
        cap.rotateX(Math.PI / 2);
        cap.translate(px, py, depth / 2);
        geos.push(cap);
      }
    }
    cursor += LETTER_ADVANCE;
  }

  if (geos.length === 0) {
    return new THREE.BufferGeometry();
  }

  const merged = mergeBufferGeometries(geos);
  if (italicShear !== 0) {
    merged.applyMatrix4(new THREE.Matrix4().makeShear(0, 0, italicShear, 0, 0, 0));
  }
  merged.computeBoundingBox();
  const bb = merged.boundingBox!;
  merged.translate(-(bb.min.x + bb.max.x) / 2, -(bb.min.y + bb.max.y) / 2, 0);
  return merged;
}

// ─── ITB VELOCITY TRUMPET (lathe bell profile) ──────────────────────────────

export function buildVelocityTrumpetGeometry(): THREE.BufferGeometry {
  const profile: THREE.Vector2[] = [
    [0.0145, 0.0], [0.0145, 0.004], [0.0153, 0.0098], [0.0168, 0.0147],
    [0.0192, 0.0196], [0.023, 0.0228], [0.0262, 0.0246], [0.0272, 0.0255],
    [0.025, 0.0253], [0.0224, 0.0232], [0.0202, 0.0188], [0.019, 0.0128],
    [0.0187, 0.005], [0.0187, 0.0],
  ].map(([r, y]) => new THREE.Vector2(r, y));
  const geo = new THREE.LatheGeometry(profile, 28);
  geo.rotateX(Math.PI / 2);
  return geo;
}

// ─── MATERIAL RESOLVER HELPER ───────────────────────────────────────────────

function resolveCoverMaterial(color?: EngineCoverColor): THREE.Material {
  const matLib = globalMaterialLibrary;
  switch (color) {
    case 'forged_carbon_gold':
      return matLib.getForgedGoldFlakeCarbon();
    case 'rosso_corsa':
      return matLib.getRossoCorsaPowdercoat();
    case 'apex_blue':
      return matLib.getMonacoBluePowdercoat();
    case 'giallo_yellow':
      return matLib.getGialloModenaPowdercoat();
    case 'british_racing_green':
      return matLib.getBritishRacingGreenPowdercoat();
    case 'stealth_black':
      return matLib.getStealthBlackCeramic();
    case 'billet_silver':
      return matLib.getMachinedBillet();
    case 'gold_leaf':
      return matLib.getGoldLeaf();
    case 'dry_carbon':
    default:
      return matLib.getDryCarbonFiber();
  }
}

function resolveBezelMaterial(bezel?: EngineCoverBezelColor): THREE.Material {
  const matLib = globalMaterialLibrary;
  switch (bezel) {
    case 'titanium_blue':
      return matLib.getTitaniumBlued();
    case 'crimson_red':
      return matLib.getRossoCorsaPowdercoat();
    case 'cobalt_blue':
      return matLib.getCobaltAnodized();
    case 'stealth_black':
      return matLib.getStealthBlackCeramic();
    case 'polished_chrome':
      return matLib.getPolishedChrome();
    case 'billet_gold':
    default:
      return matLib.getGoldAnodized();
  }
}

// ─── MODEL 1: APEX HYPERCAR MONOCOQUE COVER ─────────────────────────────────

function buildHypercarQuartzCover(opts: EngineCoverBuildOptions): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Model1_Hypercar_Quartz_Cover';

  const spec = V12_COVER_SPECS;
  const matLib = globalMaterialLibrary;
  const matCover = resolveCoverMaterial(opts.coverColor);
  const matBezel = resolveBezelMaterial(opts.bezelColor);
  const matQuartzGlass = matLib.getQuartzGlass();
  const matDzus = matLib.getNitridedCrank();
  const matGrille = matLib.getTranslucentMesh();
  const matFastener = matLib.getMachinedBillet();

  // 1. Base Carbon Monocoque
  const baseGeo = new THREE.ExtrudeGeometry(roundedRectShape(spec.coverLengthM, spec.coverWidthM, 0.055), {
    depth: 0.02,
    bevelEnabled: true,
    bevelThickness: 0.006,
    bevelSize: 0.006,
    bevelSegments: 3,
    curveSegments: 24,
  });
  baseGeo.translate(0, 0, 0.006);
  const baseMesh = new THREE.Mesh(baseGeo, matCover);
  baseMesh.castShadow = true;
  baseMesh.receiveShadow = true;
  group.add(baseMesh);

  // 2. Bezel Edge Trim
  const trimGeo = roundedFrameGeometry(
    spec.coverLengthM + 0.006, spec.coverWidthM + 0.006, 0.06,
    spec.coverLengthM - 0.026, spec.coverWidthM - 0.026, 0.04,
    0.005, 0.0025
  );
  const trimMesh = new THREE.Mesh(trimGeo, matBezel);
  trimMesh.position.set(0, 0, 0.0265);
  trimMesh.castShadow = true;
  group.add(trimMesh);

  // 3. Raised Crown with ITB window hole
  const crownShape = roundedRectShape(0.62, 0.3, 0.045);
  crownShape.holes.push(roundedRectShape(spec.glassWindowLengthM + 0.008, spec.glassWindowWidthM + 0.008, 0.038));
  const crownGeo = new THREE.ExtrudeGeometry(crownShape, {
    depth: 0.026,
    bevelEnabled: true,
    bevelThickness: 0.008,
    bevelSize: 0.008,
    bevelSegments: 3,
    curveSegments: 24,
  });
  crownGeo.translate(0, 0, 0.008);
  const crownMesh = new THREE.Mesh(crownGeo, matCover);
  crownMesh.position.set(0, 0, 0.03);
  crownMesh.castShadow = true;
  group.add(crownMesh);

  // 4. Velocity Trumpets
  const trumpetGeo = buildVelocityTrumpetGeometry();
  const bankTilt = THREE.MathUtils.degToRad(28);
  const cyls = opts.cylsPerBank || 6;
  const spanX = 0.46;
  const startX = -spanX / 2;
  const stepX = spanX / Math.max(1, cyls - 1);

  [-1, 1].forEach((rowDir) => {
    for (let i = 0; i < cyls; i++) {
      const trumpet = new THREE.Mesh(trumpetGeo, matBezel);
      trumpet.position.set(startX + i * stepX, rowDir * 0.048, 0.032);
      trumpet.rotation.x = rowDir * bankTilt * -1;
      group.add(trumpet);
    }
  });

  // 5. Quartz Glass Window & Bezel
  const windowBezelGeo = roundedFrameGeometry(
    0.612, 0.215, 0.045,
    spec.glassWindowLengthM - 0.004, spec.glassWindowWidthM - 0.004, 0.03,
    0.01, 0.002
  );
  const windowBezelMesh = new THREE.Mesh(windowBezelGeo, matBezel);
  windowBezelMesh.position.set(0, 0, 0.066);
  group.add(windowBezelMesh);

  for (let b = 0; b < 6; b++) {
    const bx = -0.21 + b * 0.084;
    [-0.096, 0.096].forEach((by) => {
      const boltGeo = createAllenSocketHead(0.0022, 0.004);
      boltGeo.rotateX(Math.PI / 2);
      const boltMesh = new THREE.Mesh(boltGeo, matFastener);
      boltMesh.position.set(bx, by, 0.0785);
      group.add(boltMesh);
    });
  }

  const glassGeo = roundedRectShape(spec.glassWindowLengthM, spec.glassWindowWidthM, 0.028);
  const glassExt = new THREE.ExtrudeGeometry(glassGeo, { depth: 0.004, bevelEnabled: false, curveSegments: 24 });
  const glassMesh = new THREE.Mesh(glassExt, matQuartzGlass);
  glassMesh.position.set(0, 0, 0.068);
  group.add(glassMesh);

  // 6. Custom Badge Lettering
  const badgeText = opts.badgeText || 'APEX V12';
  const letteringGeo = buildStrokeLettering(badgeText, 0.026, 0.62, 0.0035, 0.16);
  const letteringMesh = new THREE.Mesh(letteringGeo, matBezel);
  letteringMesh.position.set(0, -0.125, 0.0725);
  group.add(letteringMesh);

  // 7. Ram-air scoop & collar
  const tubeGeo = new THREE.CylinderGeometry(spec.scoopHeightM, spec.scoopHeightM, 0.15, 28);
  tubeGeo.rotateZ(Math.PI / 2);
  const tubeMesh = new THREE.Mesh(tubeGeo, matCover);
  tubeMesh.position.set(0.375, 0, 0.046);
  group.add(tubeMesh);

  const collarGeo = new THREE.TorusGeometry(spec.scoopHeightM + 0.002, 0.006, 12, 28);
  collarGeo.rotateY(Math.PI / 2);
  const collarMesh = new THREE.Mesh(collarGeo, matBezel);
  collarMesh.position.set(0.435, 0, 0.046);
  group.add(collarMesh);

  const screenGeo = new THREE.CylinderGeometry(0.026, 0.026, 0.004, 24);
  screenGeo.rotateZ(Math.PI / 2);
  const screenMesh = new THREE.Mesh(screenGeo, matGrille);
  screenMesh.position.set(0.452, 0, 0.046);
  group.add(screenMesh);

  // 8. Louver Slats & Fasteners
  [-1, 1].forEach((dir) => {
    const yPos = dir * 0.182;
    for (let l = 0; l < spec.louverCount; l++) {
      const lx = -0.22 + l * 0.088;
      const louverGeo = new THREE.BoxGeometry(0.045, 0.03, 0.004);
      louverGeo.rotateY(THREE.MathUtils.degToRad(-25));
      const louverMesh = new THREE.Mesh(louverGeo, matGrille);
      louverMesh.position.set(lx, yPos, 0.035);
      group.add(louverMesh);
    }
  });

  [-0.25, 0, 0.25].forEach((fx) => {
    [-0.182, 0.182].forEach((fy) => {
      const dzusGeo = createAllenSocketHead(0.008, 0.006);
      dzusGeo.rotateX(Math.PI / 2);
      const dzusMesh = new THREE.Mesh(dzusGeo, matDzus);
      dzusMesh.position.set(fx, fy, 0.034);
      group.add(dzusMesh);
    });
  });

  return group;
}

// ─── MODEL 2: SARTHE GT3 ENDURANCE AIRBOX COVER ─────────────────────────────

function buildGT3EnduranceCover(opts: EngineCoverBuildOptions): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Model2_Sarthe_GT3_Endurance_Cover';

  const matLib = globalMaterialLibrary;
  const matCarbon = resolveCoverMaterial(opts.coverColor);
  const matAccent = resolveBezelMaterial(opts.bezelColor);
  const matBillet = matLib.getMachinedBillet();

  // Dual Aerodynamic Carbon Intake Airboxes (Bank 1 and Bank 2)
  for (const side of [-1, 1]) {
    const boxGeo = new THREE.BoxGeometry(0.66, 0.16, 0.07);
    const boxMesh = new THREE.Mesh(boxGeo, matCarbon);
    boxMesh.position.set(0, side * 0.14, 0.045);
    boxMesh.castShadow = true;
    group.add(boxMesh);

    // Kevlar Ram Inlets
    const inletGeo = new THREE.CylinderGeometry(0.038, 0.038, 0.12, 24);
    inletGeo.rotateZ(Math.PI / 2);
    const inletMesh = new THREE.Mesh(inletGeo, matAccent);
    inletMesh.position.set(0.36, side * 0.14, 0.045);
    group.add(inletMesh);

    // Billet Quick-Latch Pin Plates
    for (let p = 0; p < 3; p++) {
      const px = -0.22 + p * 0.22;
      const latchGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.008, 16);
      latchGeo.rotateX(Math.PI / 2);
      const latchMesh = new THREE.Mesh(latchGeo, matBillet);
      latchMesh.position.set(px, side * 0.21, 0.075);
      group.add(latchMesh);
    }
  }

  // Central Racing Stripe Plate
  const stripeGeo = new THREE.BoxGeometry(0.64, 0.06, 0.008);
  const stripeMesh = new THREE.Mesh(stripeGeo, matAccent);
  stripeMesh.position.set(0, 0, 0.035);
  group.add(stripeMesh);

  // Center GT3 Badge
  const badgeText = opts.badgeText || 'GT3 RACING';
  const badgeGeo = buildStrokeLettering(badgeText, 0.024, 0.6, 0.003, 0.12);
  const badgeMesh = new THREE.Mesh(badgeGeo, matLib.getPolishedChrome());
  badgeMesh.position.set(0, 0, 0.042);
  group.add(badgeMesh);

  // Center Exposed Velocity Stacks Peak
  const trumpetGeo = buildVelocityTrumpetGeometry();
  for (let i = 0; i < 6; i++) {
    const cx = -0.22 + i * 0.088;
    const tL = new THREE.Mesh(trumpetGeo, matAccent);
    tL.position.set(cx, -0.05, 0.04);
    tL.scale.set(0.9, 0.9, 0.9);
    group.add(tL);

    const tR = new THREE.Mesh(trumpetGeo, matAccent);
    tR.position.set(cx, 0.05, 0.04);
    tR.scale.set(0.9, 0.9, 0.9);
    group.add(tR);
  }

  return group;
}

// ─── MODEL 3: MODENA BILLET SKELETON LATTICE COVER ──────────────────────────

function buildBilletSkeletonCover(opts: EngineCoverBuildOptions): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Model3_Modena_Billet_Skeleton_Cover';

  const matLib = globalMaterialLibrary;
  const matBillet = resolveCoverMaterial(opts.coverColor);
  const matAccent = resolveBezelMaterial(opts.bezelColor);
  const matTitanium = matLib.getTitaniumAerospace();

  // Perimeter CNC Truss Frame Rails
  const railLongL = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.025, 0.025), matBillet);
  railLongL.position.set(0, -0.18, 0.05);
  group.add(railLongL);

  const railLongR = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.025, 0.025), matBillet);
  railLongR.position.set(0, 0.18, 0.05);
  group.add(railLongR);

  // Diagonal X-Truss Cross Braces
  for (let b = 0; b < 5; b++) {
    const bx = -0.25 + b * 0.125;
    const trussL = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.016, 0.014), matAccent);
    trussL.position.set(bx, 0, 0.05);
    trussL.rotation.z = Math.PI / 4;
    group.add(trussL);

    const trussR = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.016, 0.014), matAccent);
    trussR.position.set(bx, 0, 0.05);
    trussR.rotation.z = -Math.PI / 4;
    group.add(trussR);

    // Titanium Fastener Nodes
    const nodeGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.03, 16);
    nodeGeo.rotateX(Math.PI / 2);
    const nodeMesh = new THREE.Mesh(nodeGeo, matTitanium);
    nodeMesh.position.set(bx, 0, 0.058);
    group.add(nodeMesh);
  }

  // Central CNC Emblem Plaque
  const plaqueGeo = new THREE.BoxGeometry(0.24, 0.07, 0.012);
  const plaqueMesh = new THREE.Mesh(plaqueGeo, matBillet);
  plaqueMesh.position.set(0, 0, 0.065);
  group.add(plaqueMesh);

  const badgeText = opts.badgeText || 'V12 CORSA';
  const badgeGeo = buildStrokeLettering(badgeText, 0.020, 0.6, 0.003, 0.12);
  const badgeMesh = new THREE.Mesh(badgeGeo, matAccent);
  badgeMesh.position.set(0, 0, 0.073);
  group.add(badgeMesh);

  return group;
}

// ─── MODEL 4: PRANCING HERITAGE WRINKLE-FINISH DUAL PLENUM ──────────────────

function buildHeritageWrinkleCover(opts: EngineCoverBuildOptions): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Model4_Heritage_Wrinkle_Dual_Plenum';

  const matLib = globalMaterialLibrary;
  const matWrinkle = opts.coverColor ? resolveCoverMaterial(opts.coverColor) : matLib.getRossoCorsaPowdercoat();
  const matChrome = resolveBezelMaterial(opts.bezelColor) || matLib.getPolishedChrome();
  const matBillet = matLib.getMachinedBillet();

  // Dual Cast Aluminum Wrinkle-Red Intake Plenums with Longitudinal Cooling Ribs
  for (const side of [-1, 1]) {
    const plenumGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.64, 32);
    plenumGeo.rotateZ(Math.PI / 2);
    const plenumMesh = new THREE.Mesh(plenumGeo, matWrinkle);
    plenumMesh.position.set(0, side * 0.13, 0.05);
    plenumMesh.castShadow = true;
    group.add(plenumMesh);

    // Polished Longitudinal Aluminum Ribs
    for (let r = 0; r < 5; r++) {
      const angle = (r - 2) * 0.22;
      const ribGeo = new THREE.BoxGeometry(0.62, 0.005, 0.008);
      const ribMesh = new THREE.Mesh(ribGeo, matBillet);
      ribMesh.position.set(0, side * 0.13 + Math.sin(angle) * 0.068, 0.05 + Math.cos(angle) * 0.068);
      group.add(ribMesh);
    }

    // Polished Script Badge Plate
    const badgePlateGeo = new THREE.BoxGeometry(0.18, 0.032, 0.006);
    const badgePlateMesh = new THREE.Mesh(badgePlateGeo, matChrome);
    badgePlateMesh.position.set(0, side * 0.13, 0.118);
    group.add(badgePlateMesh);

    const scriptGeo = buildStrokeLettering('48 VALVE', 0.012, 0.6, 0.002, 0.15);
    const scriptMesh = new THREE.Mesh(scriptGeo, matLib.getNitridedCrank());
    scriptMesh.position.set(0, side * 0.13, 0.122);
    group.add(scriptMesh);
  }

  // Polished Chrome Center Crossover Bridge with Vintage Oil Cap
  const bridgeGeo = new THREE.BoxGeometry(0.12, 0.26, 0.035);
  const bridgeMesh = new THREE.Mesh(bridgeGeo, matWrinkle);
  bridgeMesh.position.set(0, 0, 0.06);
  group.add(bridgeMesh);

  const capGeo = new THREE.CylinderGeometry(0.024, 0.024, 0.020, 24);
  const capMesh = new THREE.Mesh(capGeo, matChrome);
  capMesh.position.set(0, 0, 0.088);
  group.add(capMesh);

  return group;
}

// ─── MODEL 5: STEALTH TRACK VORTEX COVER ────────────────────────────────────

function buildStealthVortexCover(opts: EngineCoverBuildOptions): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Model5_Stealth_Track_Vortex';

  const matLib = globalMaterialLibrary;
  const matForged = opts.coverColor ? resolveCoverMaterial(opts.coverColor) : matLib.getForgedGoldFlakeCarbon();
  const matAccent = resolveBezelMaterial(opts.bezelColor);
  const matTitanium = matLib.getTitaniumBlued();

  // Angular Stealth Faceted Top Shield
  const shieldGeo = new THREE.BoxGeometry(0.66, 0.38, 0.025);
  const shieldMesh = new THREE.Mesh(shieldGeo, matForged);
  shieldMesh.position.set(0, 0, 0.04);
  shieldMesh.castShadow = true;
  group.add(shieldMesh);

  // Active Aerodynamic Vortex Generator Fins
  for (let v = 0; v < 8; v++) {
    const vx = -0.26 + v * 0.075;
    [-0.10, 0.10].forEach((vy) => {
      const finGeo = new THREE.ConeGeometry(0.012, 0.035, 4);
      finGeo.rotateX(Math.PI / 2);
      finGeo.rotateZ(0.2);
      const finMesh = new THREE.Mesh(finGeo, matAccent);
      finMesh.position.set(vx, vy, 0.058);
      group.add(finMesh);
    });
  }

  // Dark Titanium Stealth Emblem
  const badgeText = opts.badgeText || 'STEALTH V12';
  const badgeGeo = buildStrokeLettering(badgeText, 0.024, 0.65, 0.003, 0.14);
  const badgeMesh = new THREE.Mesh(badgeGeo, matTitanium);
  badgeMesh.position.set(0, 0, 0.055);
  group.add(badgeMesh);

  return group;
}

// ─── MODEL 6: EXPOSED ITB RACING PURIST ─────────────────────────────────────

function buildExposedITBs(opts: EngineCoverBuildOptions): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Model6_Exposed_ITB_Purist';

  const matBezel = resolveBezelMaterial(opts.bezelColor);
  const matLib = globalMaterialLibrary;
  const matFuelRail = matLib.getGoldAnodized();
  const matMachined = matLib.getMachinedBillet();

  const trumpetGeo = buildVelocityTrumpetGeometry();
  const cyls = opts.cylsPerBank || 6;
  const spanX = 0.50;
  const startX = -spanX / 2;
  const stepX = spanX / Math.max(1, cyls - 1);

  // 12 Exposed Trumpets
  [-1, 1].forEach((rowDir) => {
    for (let i = 0; i < cyls; i++) {
      const trumpet = new THREE.Mesh(trumpetGeo, matBezel);
      trumpet.position.set(startX + i * stepX, rowDir * 0.065, 0.035);
      trumpet.scale.set(1.15, 1.15, 1.15);
      trumpet.rotation.x = rowDir * -0.4;
      group.add(trumpet);
    }
  });

  // Billet Fuel Rails & Cross-Linkage
  const fuelRailL = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.56, 16), matFuelRail);
  fuelRailL.rotation.z = Math.PI / 2;
  fuelRailL.position.set(0, -0.11, 0.04);
  group.add(fuelRailL);

  const fuelRailR = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.56, 16), matFuelRail);
  fuelRailR.rotation.z = Math.PI / 2;
  fuelRailR.position.set(0, 0.11, 0.04);
  group.add(fuelRailR);

  const linkage = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.006, 0.006), matMachined);
  linkage.position.set(0, 0, 0.048);
  group.add(linkage);

  return group;
}

// ─── MODEL 7: INLINE TWIN-CAM TURBO COVER (I3, I4, I5, I6) ──────────────────

function buildInlineTwinCamCover(opts: EngineCoverBuildOptions): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Model7_Inline_TwinCam_Turbo_Cover';

  const matLib = globalMaterialLibrary;
  const matCover = resolveCoverMaterial(opts.coverColor);
  const matBezel = resolveBezelMaterial(opts.bezelColor);
  const matTitanium = matLib.getTitaniumAerospace();
  const matGoldAnodized = matLib.getGoldAnodized();
  const matBlackCeramic = matLib.getStealthBlackCeramic();
  const matRosso = matLib.getRossoCorsaPowdercoat();

  const cyls = opts.cylsPerBank || 4;
  const coverLength = Math.max(0.48, cyls * 0.125);
  const coverWidth = 0.28;

  // 1. Asymmetrical Contoured Main Carbon / Billet Spark Plug & Cam Cover
  const mainCoverGeo = new THREE.BoxGeometry(coverLength, coverWidth, 0.045);
  const mainCoverMesh = new THREE.Mesh(mainCoverGeo, matCover);
  mainCoverMesh.position.set(0, 0, 0.035);
  mainCoverMesh.castShadow = true;
  group.add(mainCoverMesh);

  // 2. Central Recessed Spark Plug / Ignition Coil Valley with Racing Red Channel
  const valleyGeo = new THREE.BoxGeometry(coverLength * 0.92, 0.075, 0.015);
  const valleyMesh = new THREE.Mesh(valleyGeo, matRosso);
  valleyMesh.position.set(0, 0, 0.055);
  group.add(valleyMesh);

  // 3. Individual Coil-On-Plug Modules & High-Voltage Wiring Harness
  const startX = -(coverLength * 0.78) / 2;
  const stepX = (coverLength * 0.78) / Math.max(1, cyls - 1);

  for (let i = 0; i < cyls; i++) {
    const cx = startX + i * stepX;

    // Coil-on-plug head module
    const coilGeo = new THREE.BoxGeometry(0.042, 0.048, 0.022);
    const coilMesh = new THREE.Mesh(coilGeo, matBlackCeramic);
    coilMesh.position.set(cx, 0, 0.065);
    group.add(coilMesh);

    // Gold grounding terminal stud
    const studGeo = new THREE.CylinderGeometry(0.004, 0.004, 0.012, 12);
    studGeo.rotateX(Math.PI / 2);
    const studMesh = new THREE.Mesh(studGeo, matGoldAnodized);
    studMesh.position.set(cx, -0.018, 0.076);
    group.add(studMesh);

    // Fastener bolt
    const boltGeo = createAllenSocketHead(0.004, 0.007, 0.005);
    boltGeo.rotateX(Math.PI / 2);
    const boltMesh = new THREE.Mesh(boltGeo, matTitanium);
    boltMesh.position.set(cx, 0.018, 0.076);
    group.add(boltMesh);
  }

  // Wiring harness conduit runner
  const conduitGeo = new THREE.CylinderGeometry(0.006, 0.006, coverLength * 0.88, 16);
  conduitGeo.rotateZ(Math.PI / 2);
  const conduitMesh = new THREE.Mesh(conduitGeo, matBlackCeramic);
  conduitMesh.position.set(0, -0.028, 0.068);
  group.add(conduitMesh);

  // 4. Exhaust Flank Stamped Titanium Turbo Heat Shield
  const heatShieldCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-coverLength * 0.44, 0.12, 0.04),
    new THREE.Vector3(0, 0.15, 0.02),
    new THREE.Vector3(coverLength * 0.44, 0.12, 0.04),
  ]);
  const shieldGeo = new THREE.TubeGeometry(heatShieldCurve, 20, 0.014, 12, false);
  const shieldMesh = new THREE.Mesh(shieldGeo, matTitanium);
  group.add(shieldMesh);

  // Embossed Turbo Heat Barrier Plate
  const barrierGeo = new THREE.BoxGeometry(coverLength * 0.65, 0.045, 0.005);
  const barrierMesh = new THREE.Mesh(barrierGeo, matTitanium);
  barrierMesh.position.set(0, 0.145, 0.032);
  barrierMesh.rotation.x = -0.3;
  group.add(barrierMesh);

  // 5. CNC Knurled Aluminum Oil Filler Cap with Laser-Etched Viscosity
  const oilCapGeo = new THREE.CylinderGeometry(0.026, 0.026, 0.018, 32);
  oilCapGeo.rotateX(Math.PI / 2);
  const oilCapMesh = new THREE.Mesh(oilCapGeo, matBezel);
  oilCapMesh.position.set(-coverLength * 0.36, -0.075, 0.065);
  group.add(oilCapMesh);

  const oilGripGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.024, 6);
  oilGripGeo.rotateX(Math.PI / 2);
  const oilGripMesh = new THREE.Mesh(oilGripGeo, matLib.getMachinedBillet());
  oilGripMesh.position.set(-coverLength * 0.36, -0.075, 0.072);
  group.add(oilGripMesh);

  // 6. Perimeter Allen Socket Head Hardware
  const boltPositions = [
    [-coverLength * 0.45, -coverWidth * 0.42],
    [-coverLength * 0.45, coverWidth * 0.42],
    [0, -coverWidth * 0.45],
    [0, coverWidth * 0.45],
    [coverLength * 0.45, -coverWidth * 0.42],
    [coverLength * 0.45, coverWidth * 0.42],
  ];
  boltPositions.forEach(([bx, by]) => {
    const bGeo = createAllenSocketHead(0.005, 0.009, 0.006);
    bGeo.rotateX(Math.PI / 2);
    const bMesh = new THREE.Mesh(bGeo, matTitanium);
    bMesh.position.set(bx, by, 0.058);
    group.add(bMesh);
  });

  // 7. Laser-Etched 3D Stroke Badge Plaque
  const badgeText = opts.badgeText || (cyls === 6 ? 'I6 TWIN-CAM 24V' : `I${cyls} TWIN-CAM TURBO`);
  const badgeGeo = buildStrokeLettering(badgeText, 0.016, 0.6, 0.003, 0.12);
  const badgeMesh = new THREE.Mesh(badgeGeo, matBezel);
  badgeMesh.position.set(coverLength * 0.12, -0.075, 0.062);
  group.add(badgeMesh);

  return group;
}

// ─── MODEL 8: BOXER TWIN-PLENUM FLAT COVER (FLAT-4 & FLAT-6) ────────────────

function buildBoxerTwinPlenumCover(opts: EngineCoverBuildOptions): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Model8_Boxer_TwinPlenum_Flat_Cover';

  const matLib = globalMaterialLibrary;
  const matCover = resolveCoverMaterial(opts.coverColor);
  const matBezel = resolveBezelMaterial(opts.bezelColor);
  const matTitanium = matLib.getTitaniumAerospace();
  const matBillet = matLib.getMachinedBillet();
  const matSilicone = resolveCoverMaterial('apex_blue');

  // 1. Dual Horizontal Low-Profile Runner Plenums (Left & Right Banks)
  for (const side of [-1, 1]) {
    const plenumGeo = new THREE.CylinderGeometry(0.052, 0.058, 0.54, 28);
    plenumGeo.rotateZ(Math.PI / 2);
    const plenumMesh = new THREE.Mesh(plenumGeo, matCover);
    plenumMesh.position.set(0, side * 0.15, 0.038);
    plenumMesh.castShadow = true;
    group.add(plenumMesh);

    // Longitudinal Cooling Ribs on Plenums
    for (let r = 0; r < 3; r++) {
      const ribAngle = (r - 1) * 0.35;
      const ribGeo = new THREE.BoxGeometry(0.50, 0.004, 0.008);
      const ribMesh = new THREE.Mesh(ribGeo, matBillet);
      ribMesh.position.set(0, side * 0.15 + Math.sin(ribAngle) * 0.056, 0.038 + Math.cos(ribAngle) * 0.056);
      group.add(ribMesh);
    }

    // High-Flow Intake Horns with Silicone Hose Couplers
    const hornGeo = new THREE.CylinderGeometry(0.038, 0.048, 0.08, 24);
    hornGeo.rotateZ(Math.PI / 2);
    const hornMesh = new THREE.Mesh(hornGeo, matSilicone);
    hornMesh.position.set(-0.31, side * 0.15, 0.038);
    group.add(hornMesh);

    // T-Bolt Hose Clamps
    const clampGeo = new THREE.TorusGeometry(0.044, 0.003, 8, 24);
    clampGeo.rotateY(Math.PI / 2);
    const clampMesh = new THREE.Mesh(clampGeo, matTitanium);
    clampMesh.position.set(-0.29, side * 0.15, 0.038);
    group.add(clampMesh);
  }

  // 2. Central Top-Mount Intercooler / Charge Air Cooler Box with Micro Aluminum Heat Exchanger Fins
  const intercoolerBoxGeo = new THREE.BoxGeometry(0.36, 0.22, 0.042);
  const intercoolerBox = new THREE.Mesh(intercoolerBoxGeo, matCover);
  intercoolerBox.position.set(0, 0, 0.052);
  intercoolerBox.castShadow = true;
  group.add(intercoolerBox);

  // Micro Aluminum Cooling Fins Core
  for (let f = 0; f < 18; f++) {
    const fx = -0.15 + f * 0.0175;
    const finGeo = new THREE.BoxGeometry(0.003, 0.18, 0.008);
    const finMesh = new THREE.Mesh(finGeo, matBillet);
    finMesh.position.set(fx, 0, 0.075);
    group.add(finMesh);
  }

  // 3. Titanium Cross-Tower Structural Strut Support Bar
  const strutBarGeo = new THREE.CylinderGeometry(0.010, 0.010, 0.44, 16);
  strutBarGeo.rotateX(Math.PI / 2);
  const strutBarMesh = new THREE.Mesh(strutBarGeo, matTitanium);
  strutBarMesh.position.set(0.12, 0, 0.088);
  group.add(strutBarMesh);

  // Strut Mounting Clevises
  for (const side of [-1, 1]) {
    const clevisGeo = new THREE.BoxGeometry(0.035, 0.035, 0.035);
    const clevisMesh = new THREE.Mesh(clevisGeo, matBezel);
    clevisMesh.position.set(0.12, side * 0.21, 0.078);
    group.add(clevisMesh);
  }

  // 4. Central Embossed Carbon Plaque
  const badgeText = opts.badgeText || 'BOXER-6 TWIN TURBO';
  const badgeGeo = buildStrokeLettering(badgeText, 0.016, 0.6, 0.003, 0.12);
  const badgeMesh = new THREE.Mesh(badgeGeo, matBezel);
  badgeMesh.position.set(-0.06, 0, 0.076);
  group.add(badgeMesh);

  return group;
}

// ─── MODEL 9: W16 QUAD-TURBO HYPERSPORT COVER (W12 & W16) ───────────────────

function buildW16HypersportCover(opts: EngineCoverBuildOptions): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Model9_W16_QuadTurbo_Hypersport_Cover';

  const matLib = globalMaterialLibrary;
  const matCover = resolveCoverMaterial(opts.coverColor);
  const matBezel = resolveBezelMaterial(opts.bezelColor);
  const matTitanium = matLib.getTitaniumAerospace();
  const matInconel = matLib.getInconelExhaust();
  const matMachined = matLib.getMachinedBillet();

  // 1. Massive Dual Outer Carbon Fiber Air Plenum Domes (Feeding 4 Banks Total)
  for (const side of [-1, 1]) {
    const domeGeo = new THREE.BoxGeometry(0.72, 0.18, 0.065);
    const domeMesh = new THREE.Mesh(domeGeo, matCover);
    domeMesh.position.set(0, side * 0.17, 0.045);
    domeMesh.castShadow = true;
    group.add(domeMesh);

    // Quad Turbo Ram-Air Carbon Ducts on Flanks
    for (let t = 0; t < 2; t++) {
      const tx = -0.22 + t * 0.44;
      const scoopGeo = new THREE.CylinderGeometry(0.032, 0.038, 0.09, 20);
      scoopGeo.rotateZ(Math.PI / 2);
      const scoopMesh = new THREE.Mesh(scoopGeo, matCover);
      scoopMesh.position.set(tx, side * 0.27, 0.055);
      group.add(scoopMesh);

      // Titanium Mesh Grille in Scoop Inlets
      const meshGrateGeo = new THREE.CircleGeometry(0.031, 16);
      meshGrateGeo.rotateY(Math.PI / 2);
      const meshGrate = new THREE.Mesh(meshGrateGeo, matTitanium);
      meshGrate.position.set(tx - 0.045, side * 0.27, 0.055);
      group.add(meshGrate);
    }
  }

  // 2. Central Titanium Exhaust Valley Heat Shield with Herringbone Cooling Vents
  const valleyShieldGeo = new THREE.BoxGeometry(0.68, 0.14, 0.018);
  const valleyShield = new THREE.Mesh(valleyShieldGeo, matInconel);
  valleyShield.position.set(0, 0, 0.032);
  group.add(valleyShield);

  // Herringbone Heat Dissipation Louvers
  for (let l = 0; l < 10; l++) {
    const lx = -0.26 + l * 0.058;
    const louverL = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.045, 0.008), matMachined);
    louverL.position.set(lx, -0.03, 0.043);
    louverL.rotation.z = 0.35;
    group.add(louverL);

    const louverR = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.045, 0.008), matMachined);
    louverR.position.set(lx, 0.03, 0.043);
    louverR.rotation.z = -0.35;
    group.add(louverR);
  }

  // 3. Massive Brushed Billet Center Crest Plaque
  const crestGeo = new THREE.BoxGeometry(0.32, 0.11, 0.016);
  const crestMesh = new THREE.Mesh(crestGeo, matMachined);
  crestMesh.position.set(0, 0, 0.065);
  group.add(crestMesh);

  const bezelGeo = new THREE.BoxGeometry(0.33, 0.12, 0.006);
  const bezelMesh = new THREE.Mesh(bezelGeo, matBezel);
  bezelMesh.position.set(0, 0, 0.058);
  group.add(bezelMesh);

  // 3D Stroke Inscription
  const badgeText = opts.badgeText || 'W16 QUAD-TURBO 8.0L';
  const badgeGeo = buildStrokeLettering(badgeText, 0.018, 0.65, 0.004, 0.12);
  const badgeMesh = new THREE.Mesh(badgeGeo, matBezel);
  badgeMesh.position.set(0, 0, 0.075);
  group.add(badgeMesh);

  // 4. 16 Individual High-Performance Ignition Coil Heat Sinks
  for (let bank = 0; bank < 4; bank++) {
    const by = -0.19 + bank * 0.127;
    for (let c = 0; c < 4; c++) {
      const cx = -0.22 + c * 0.147;
      const sinkGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.014, 12);
      sinkGeo.rotateX(Math.PI / 2);
      const sinkMesh = new THREE.Mesh(sinkGeo, matBezel);
      sinkMesh.position.set(cx, by, 0.082);
      group.add(sinkMesh);
    }
  }

  return group;
}

// ─── MODEL 10: ROTARY APEX TROCHOID COVER (WANKEL ROTARY) ───────────────────

function buildRotaryApexCover(opts: EngineCoverBuildOptions): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Model10_Rotary_Apex_Trochoid_Cover';

  const matLib = globalMaterialLibrary;
  const matCover = resolveCoverMaterial(opts.coverColor);
  const matBezel = resolveBezelMaterial(opts.bezelColor);
  const matBillet = matLib.getMachinedBillet();
  const matTitanium = matLib.getTitaniumBlued();

  // 1. Epitrochoid / Reuleaux Triangle Rotor Shaped Housing
  const rotorShape = new THREE.Shape();
  const r = 0.22;
  for (let i = 0; i < 3; i++) {
    const a1 = (i * 2 * Math.PI) / 3;
    const a2 = ((i + 1) * 2 * Math.PI) / 3;
    const x1 = Math.cos(a1) * r;
    const y1 = Math.sin(a1) * r;
    const x2 = Math.cos(a2) * r;
    const y2 = Math.sin(a2) * r;
    if (i === 0) rotorShape.moveTo(x1, y1);
    // Bulging curve for Reuleaux rotor flank
    const midAngle = (a1 + a2) / 2;
    const mx = Math.cos(midAngle) * (r * 1.25);
    const my = Math.sin(midAngle) * (r * 1.25);
    rotorShape.quadraticCurveTo(mx, my, x2, y2);
  }

  const rotorExtrudeGeo = new THREE.ExtrudeGeometry(rotorShape, {
    depth: 0.045,
    bevelEnabled: true,
    bevelThickness: 0.008,
    bevelSize: 0.008,
    bevelSegments: 3,
  });
  const rotorMesh = new THREE.Mesh(rotorExtrudeGeo, matCover);
  rotorMesh.position.set(0, 0, 0.015);
  rotorMesh.castShadow = true;
  group.add(rotorMesh);

  // 2. Central Rotor Core Gear with Circular Eccentric Shaft Hole
  const gearRingGeo = new THREE.TorusGeometry(0.085, 0.012, 16, 32);
  const gearRing = new THREE.Mesh(gearRingGeo, matBezel);
  gearRing.position.set(0, 0, 0.068);
  group.add(gearRing);

  // 3. Side-Draft Intake Velocity Trumpets with Protective Mesh Stone Guards
  const trumpetGeo = buildVelocityTrumpetGeometry();
  for (const side of [-1, 1]) {
    const trumpet = new THREE.Mesh(trumpetGeo, matBezel);
    trumpet.position.set(0, side * 0.16, 0.062);
    trumpet.rotation.x = side * -0.35;
    trumpet.scale.set(1.1, 1.1, 1.1);
    group.add(trumpet);

    // Spun aluminum mesh screen
    const screenGeo = new THREE.CircleGeometry(0.024, 16);
    const screenMesh = new THREE.Mesh(screenGeo, matTitanium);
    screenMesh.position.set(0, side * 0.16, 0.088);
    screenMesh.rotation.x = side * -0.35;
    group.add(screenMesh);
  }

  // 4. Braided Stainless Steel Oil Metering Lines with Anodized -AN Banjo Fittings
  const oilLineCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.12, -0.10, 0.05),
    new THREE.Vector3(-0.15, 0, 0.065),
    new THREE.Vector3(-0.12, 0.10, 0.05),
  ]);
  const oilLineGeo = new THREE.TubeGeometry(oilLineCurve, 16, 0.005, 8, false);
  const oilLineMesh = new THREE.Mesh(oilLineGeo, matLib.getMachinedBillet());
  group.add(oilLineMesh);

  // 5. Rotor Apex Seals Inspection Badge
  const badgeText = opts.badgeText || 'ROTARY RACING WANKEL';
  const badgeGeo = buildStrokeLettering(badgeText, 0.014, 0.6, 0.003, 0.12);
  const badgeMesh = new THREE.Mesh(badgeGeo, matBezel);
  badgeMesh.position.set(0, -0.065, 0.068);
  group.add(badgeMesh);

  return group;
}

// ─── MODEL 11: SUPERCHARGED V8 SHAKER HOOD SCOOP COVER ───────────────────────

function buildSuperchargedShakerCover(opts: EngineCoverBuildOptions): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Model11_Supercharged_V8_Shaker_Cover';

  const matLib = globalMaterialLibrary;
  const matCover = resolveCoverMaterial(opts.coverColor);
  const matBezel = resolveBezelMaterial(opts.bezelColor);
  const matBillet = matLib.getMachinedBillet();
  const matBlackCeramic = matLib.getStealthBlackCeramic();
  const matRosso = matLib.getRossoCorsaPowdercoat();

  // 1. Massive Billet Aluminum Supercharger Blower Case Cover
  const caseGeo = new THREE.BoxGeometry(0.56, 0.34, 0.075);
  const caseMesh = new THREE.Mesh(caseGeo, matCover);
  caseMesh.position.set(0, 0, 0.045);
  caseMesh.castShadow = true;
  group.add(caseMesh);

  // Longitudinal Cooling Heat Sink Fins on Case
  for (let f = 0; f < 7; f++) {
    const fy = -0.12 + f * 0.04;
    const finGeo = new THREE.BoxGeometry(0.50, 0.005, 0.012);
    const finMesh = new THREE.Mesh(finGeo, matBillet);
    finMesh.position.set(0, fy, 0.088);
    group.add(finMesh);
  }

  // 2. Protruding Functional Cold-Air "Shaker" Induction Hood Scoop
  const scoopGeo = new THREE.BoxGeometry(0.32, 0.24, 0.065);
  const scoopMesh = new THREE.Mesh(scoopGeo, matBlackCeramic);
  scoopMesh.position.set(-0.06, 0, 0.115);
  scoopMesh.castShadow = true;
  group.add(scoopMesh);

  // Forward Facing Shaker Ram Intake Snout
  const snoutGeo = new THREE.BoxGeometry(0.06, 0.22, 0.045);
  const snoutMesh = new THREE.Mesh(snoutGeo, matBlackCeramic);
  snoutMesh.position.set(-0.23, 0, 0.115);
  group.add(snoutMesh);

  // Dual Functional Throttle Butterfly Flaps Inside Scoop
  for (const side of [-1, 1]) {
    const flapGeo = new THREE.CircleGeometry(0.042, 24);
    flapGeo.rotateY(Math.PI / 2);
    flapGeo.rotateZ(0.25); // Slightly cracked open throttle angle
    const flapMesh = new THREE.Mesh(flapGeo, matRosso);
    flapMesh.position.set(-0.25, side * 0.055, 0.115);
    group.add(flapMesh);

    // Butterfly Shaft
    const shaftGeo = new THREE.CylinderGeometry(0.003, 0.003, 0.18, 12);
    const shaftMesh = new THREE.Mesh(shaftGeo, matBillet);
    shaftMesh.position.set(-0.25, 0, 0.115);
    group.add(shaftMesh);
  }

  // 3. Front Cogged Supercharger Drive Pulley Shield & Belt
  const pulleyShieldGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.035, 28);
  pulleyShieldGeo.rotateZ(Math.PI / 2);
  const pulleyShield = new THREE.Mesh(pulleyShieldGeo, matBezel);
  pulleyShield.position.set(-0.30, 0, 0.045);
  group.add(pulleyShield);

  // Exposed High-Tensile Cogged Belt
  const beltGeo = new THREE.TorusGeometry(0.068, 0.008, 8, 28);
  beltGeo.rotateY(Math.PI / 2);
  const beltMesh = new THREE.Mesh(beltGeo, matBlackCeramic);
  beltMesh.position.set(-0.30, 0, 0.045);
  group.add(beltMesh);

  // 4. Laser-Etched Emblem Badges with Red Accent Bars
  const badgeText = opts.badgeText || 'SUPERCHARGED HEMI';
  const badgeGeo = buildStrokeLettering(badgeText, 0.016, 0.65, 0.003, 0.12);
  const badgeMesh = new THREE.Mesh(badgeGeo, matBezel);
  badgeMesh.position.set(0.12, 0, 0.088);
  group.add(badgeMesh);

  return group;
}

// ─── MODEL 12: FORMULA 1 PNEUMATIC CARBON AIRBOX PLENUM COVER ───────────────

function buildF1PneumaticPlenumCover(opts: EngineCoverBuildOptions): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Model12_F1_Pneumatic_Carbon_Plenum_Cover';

  const matLib = globalMaterialLibrary;
  const matCover = resolveCoverMaterial(opts.coverColor);
  const matBezel = resolveBezelMaterial(opts.bezelColor);
  const matTitanium = matLib.getTitaniumAerospace();
  const matGoldLeaf = matLib.getGoldLeaf();
  const matGoldAnodized = matLib.getGoldAnodized();

  // 1. Aerodynamic Teardrop Carbon Fiber Airbox Plenum
  const airboxCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.28, 0, 0.08),
    new THREE.Vector3(-0.10, 0, 0.12),
    new THREE.Vector3(0.15, 0, 0.07),
    new THREE.Vector3(0.32, 0, 0.03),
  ]);
  const airboxGeo = new THREE.TubeGeometry(airboxCurve, 28, 0.12, 16, false);
  const airboxMesh = new THREE.Mesh(airboxGeo, matCover);
  airboxMesh.scale.set(1, 1.25, 0.75);
  airboxMesh.castShadow = true;
  group.add(airboxMesh);

  // 2. 24K Gold Foil Thermal Reflection Barrier Blanket Underneath
  const foilGeo = new THREE.BoxGeometry(0.56, 0.28, 0.006);
  const foilMesh = new THREE.Mesh(foilGeo, matGoldLeaf);
  foilMesh.position.set(0.02, 0, 0.018);
  group.add(foilMesh);

  // 3. Dual Pneumatic Valvetrain Nitrogen Recharge Quick-Connect Ports
  for (const side of [-1, 1]) {
    const portGeo = new THREE.CylinderGeometry(0.012, 0.014, 0.035, 16);
    portGeo.rotateX(Math.PI / 2);
    const portMesh = new THREE.Mesh(portGeo, matGoldAnodized);
    portMesh.position.set(-0.16, side * 0.09, 0.115);
    group.add(portMesh);

    // Brass Knurled Valve Cap
    const capGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.012, 12);
    capGeo.rotateX(Math.PI / 2);
    const capMesh = new THREE.Mesh(capGeo, matBezel);
    capMesh.position.set(-0.16, side * 0.09, 0.135);
    group.add(capMesh);
  }

  // 4. Perimeter Titanium Quick-Release 1/4-Turn Dzus Latch Pins
  const dzusPositions = [
    [-0.24, -0.12], [-0.24, 0.12],
    [-0.05, -0.15], [-0.05, 0.15],
    [0.15, -0.14], [0.15, 0.14],
    [0.28, -0.09], [0.28, 0.09],
  ];
  dzusPositions.forEach(([dx, dy]) => {
    const pinGeo = createAllenSocketHead(0.004, 0.007, 0.004);
    pinGeo.rotateX(Math.PI / 2);
    const pinMesh = new THREE.Mesh(pinGeo, matTitanium);
    pinMesh.position.set(dx, dy, 0.065);
    group.add(pinMesh);
  });

  // 5. Racing Telemetry FIA Serial Plaque
  const badgeText = opts.badgeText || 'F1 V10 PNEUMATIC 18,000 RPM';
  const badgeGeo = buildStrokeLettering(badgeText, 0.015, 0.65, 0.003, 0.12);
  const badgeMesh = new THREE.Mesh(badgeGeo, matBezel);
  badgeMesh.position.set(0.06, 0, 0.095);
  group.add(badgeMesh);

  return group;
}

// ─── MASTER ENGINE COVER SCENE GENERATOR ────────────────────────────────────

/**
 * Builds the complete ultra-high-fidelity 3D scene graph for the engine cover
 * with selected model style, materials, colors, and badge configurations.
 */
export function buildEngineCoverScene(
  optionsOrConfig?: EngineCoverBuildOptions | Partial<EngineConfig> | number
): THREE.Scene {
  const scene = new THREE.Scene();
  scene.name = 'V12_EngineCover_Scene';

  let opts: EngineCoverBuildOptions = {};
  if (typeof optionsOrConfig === 'number') {
    opts.cylsPerBank = optionsOrConfig;
  } else if (optionsOrConfig && 'model' in optionsOrConfig) {
    opts = optionsOrConfig as EngineCoverBuildOptions;
  } else if (optionsOrConfig && 'layout' in optionsOrConfig) {
    const l = (optionsOrConfig as EngineConfig).layout;
    opts.cylsPerBank =
      l === 'i3' || l === 'v6' ? 3 :
      l === 'i4' || l === 'boxer4' || l === 'v8' ? 4 :
      l === 'v10' ? 5 :
      l === 'w12' ? 3 :
      l === 'w16' ? 4 :
      l === 'w18' ? 5 :
      6;
  }

  const model: EngineCoverModel = opts.model || 'hypercar_quartz';

  let coverGroup: THREE.Group;
  switch (model) {
    case 'gt3_endurance':
      coverGroup = buildGT3EnduranceCover(opts);
      break;
    case 'billet_skeleton':
      coverGroup = buildBilletSkeletonCover(opts);
      break;
    case 'heritage_wrinkle':
      coverGroup = buildHeritageWrinkleCover(opts);
      break;
    case 'stealth_vortex':
      coverGroup = buildStealthVortexCover(opts);
      break;
    case 'exposed_itb':
      coverGroup = buildExposedITBs(opts);
      break;
    case 'inline_twin_cam_turbo':
      coverGroup = buildInlineTwinCamCover(opts);
      break;
    case 'boxer_twin_plenum_flat':
      coverGroup = buildBoxerTwinPlenumCover(opts);
      break;
    case 'w16_quad_turbo_hypersport':
      coverGroup = buildW16HypersportCover(opts);
      break;
    case 'rotary_apex_trochoid':
      coverGroup = buildRotaryApexCover(opts);
      break;
    case 'supercharged_v8_shaker':
      coverGroup = buildSuperchargedShakerCover(opts);
      break;
    case 'f1_pneumatic_carbon_plenum':
      coverGroup = buildF1PneumaticPlenumCover(opts);
      break;
    case 'hypercar_quartz':
    default:
      coverGroup = buildHypercarQuartzCover(opts);
      break;
  }

  scene.add(coverGroup);
  return scene;
}

/**
 * Exports the engine cover scene to a binary GLB ArrayBuffer.
 */
export async function generateEngineCoverGlbBuffer(
  opts?: EngineCoverBuildOptions
): Promise<ArrayBuffer> {
  const scene = buildEngineCoverScene(opts);
  const exporter = new GLTFExporter();

  return new Promise<ArrayBuffer>((resolve, reject) => {
    exporter.parse(
      scene,
      (gltf) => {
        if (gltf instanceof ArrayBuffer) {
          resolve(gltf);
        } else {
          resolve(gltf as unknown as ArrayBuffer);
        }
      },
      (err) => reject(err),
      { binary: true }
    );
  });
}

export default buildEngineCoverScene;
