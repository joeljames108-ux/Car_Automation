// ============================================================================
// ULTRA-HIGH-FIDELITY MODULAR GLB GENERATOR — RACING V12 EVOLUTION PLENUM COVER
// ============================================================================
// Solid-modeling engineering generator for the autoclaved 3K 2x2 twill
// dry-carbon monocoque plenum beauty cover:
//   • Raised aerodynamic crown with full-length quartz glass viewing window
//     exposing 12 individual-throttle-body gold velocity trumpets laid on the
//     60° V bank axes over a matte display tub
//   • CNC gold-anodized window bezel with 12 M4 micro-bolts
//   • Gold-anodized perimeter edge trim + 6 quarter-turn Dzus fasteners
//   • Carbon ram-air induction tube with anodized collar & debris screen
//   • Heat-extraction louver grille slats on both shoulders
//   • Gold "RACING V12 EVOLUTION" stroke-font lettering built as real
//     extruded geometry (canvas-free, so it survives the Node CLI export)
// ============================================================================

import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { globalMaterialLibrary } from '../materials/pbrMaterialSystem';
import {
  createAllenSocketHead,
  mergeBufferGeometries,
} from './geometryDetailUtils';

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
  coverLengthM: number; // 0.720 m
  coverWidthM: number; // 0.440 m
  coverHeightM: number; // 0.080 m (raised plenum crown)
  glassWindowWidthM: number; // 0.172 m
  glassWindowLengthM: number; // 0.552 m
  scoopHeightM: number; // 0.030 m ram tube radius
  louverCount: number; // 6 louvers per shoulder
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

// ─── STROKE-FONT GOLD LETTERING (geometry, canvas-free) ─────────────────────
// Glyphs defined as stroke segments on a 4-wide × 6-tall grid.

const COVER_LETTER_FONT: Record<string, number[][]> = {
  R: [[0, 0, 0, 6], [0, 6, 2.6, 6], [2.6, 6, 2.6, 3.4], [2.6, 3.4, 0, 3.4], [1.3, 3.4, 3.4, 0]],
  A: [[0, 0, 1.7, 6], [1.7, 6, 3.4, 0], [0.8, 2.1, 2.6, 2.1]],
  C: [[3.4, 4.8, 3.4, 6], [3.4, 6, 0, 6], [0, 6, 0, 0], [0, 0, 3.4, 0], [3.4, 0, 3.4, 1.2]],
  I: [[0.5, 6, 2.9, 6], [1.7, 6, 1.7, 0], [0.5, 0, 2.9, 0]],
  N: [[0, 0, 0, 6], [0, 6, 3.4, 0], [3.4, 0, 3.4, 6]],
  G: [[3.4, 4.8, 3.4, 6], [3.4, 6, 0, 6], [0, 6, 0, 0], [0, 0, 3.4, 0], [3.4, 0, 3.4, 2.4], [3.4, 2.4, 2.0, 2.4]],
  V: [[0, 6, 1.7, 0], [1.7, 0, 3.4, 6]],
  E: [[0, 0, 0, 6], [0, 6, 3.2, 6], [0, 3.1, 2.5, 3.1], [0, 0, 3.2, 0]],
  O: [[0.9, 6, 2.5, 6], [2.5, 6, 3.4, 5.1], [3.4, 5.1, 3.4, 0.9], [3.4, 0.9, 2.5, 0], [2.5, 0, 0.9, 0], [0.9, 0, 0, 0.9], [0, 0.9, 0, 5.1], [0, 5.1, 0.9, 6]],
  L: [[0, 6, 0, 0], [0, 0, 3.0, 0]],
  U: [[0, 6, 0, 0.9], [0, 0.9, 0.9, 0], [0.9, 0, 2.5, 0], [2.5, 0, 3.4, 0.9], [3.4, 0.9, 3.4, 6]],
  T: [[0, 6, 3.4, 6], [1.7, 6, 1.7, 0]],
  S: [[3.1, 6, 0.7, 6], [0.7, 6, 0, 5.2], [0, 5.2, 0, 3.9], [0, 3.9, 0.7, 3.1], [0.7, 3.1, 2.7, 3.1], [2.7, 3.1, 3.4, 2.3], [3.4, 2.3, 3.4, 1.0], [3.4, 1.0, 2.7, 0], [2.7, 0, 0.3, 0]],
  '1': [[1.7, 0, 1.7, 6], [0.6, 5.1, 1.7, 6], [0.8, 0, 2.6, 0]],
  '2': [[0.3, 6, 2.9, 6], [2.9, 6, 3.4, 5.3], [3.4, 5.3, 3.4, 4.5], [3.4, 4.5, 0, 0], [0, 0, 3.4, 0]],
};

const LETTER_ADVANCE = 5.2;
const SPACE_ADVANCE = 3.2;

/** Builds merged, centered stroke lettering geometry lying in the XY plane (z = extrusion). */
function buildStrokeLettering(
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

  for (const ch of text) {
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

  const merged = mergeBufferGeometries(geos);
  merged.applyMatrix4(new THREE.Matrix4().makeShear(0, 0, italicShear, 0, 0, 0)); // slant X by Y (italic)
  merged.computeBoundingBox();
  const bb = merged.boundingBox!;
  merged.translate(-(bb.min.x + bb.max.x) / 2, -(bb.min.y + bb.max.y) / 2, 0);
  return merged;
}

// ─── ITB VELOCITY TRUMPET (lathe bell profile) ──────────────────────────────

function buildVelocityTrumpetGeometry(): THREE.BufferGeometry {
  const profile: THREE.Vector2[] = [
    [0.0145, 0.0], [0.0145, 0.004], [0.0153, 0.0098], [0.0168, 0.0147],
    [0.0192, 0.0196], [0.023, 0.0228], [0.0262, 0.0246], [0.0272, 0.0255],
    [0.025, 0.0253], [0.0224, 0.0232], [0.0202, 0.0188], [0.019, 0.0128],
    [0.0187, 0.005], [0.0187, 0.0],
  ].map(([r, y]) => new THREE.Vector2(r, y));
  const geo = new THREE.LatheGeometry(profile, 28);
  geo.rotateX(Math.PI / 2); // lathe +Y axis → +Z (engine up)
  return geo;
}

/**
 * Builds the complete ultra-high-fidelity 3D scene graph for the
 * "RACING V12 EVOLUTION" dry carbon plenum engine cover.
 */
export function buildEngineCoverScene(): THREE.Scene {
  const scene = new THREE.Scene();
  scene.name = 'V12_Dry_Carbon_EngineCover_Scene';

  const rootGroup = new THREE.Group();
  rootGroup.name = '12_Engine_Cover_Master_Assembly_Group';
  scene.add(rootGroup);

  const matLib = globalMaterialLibrary;
  const matCarbonShell = matLib.getDryCarbonFiber();
  const matGoldBezel = matLib.getGoldAnodized();
  const matQuartzGlass = matLib.getQuartzGlass();
  const matDzusFastener = matLib.getNitridedCrank();
  const matMeshGrille = matLib.getTranslucentMesh();
  const matFastenerBillet = matLib.getMachinedBillet();

  const spec = V12_COVER_SPECS;

  // ─── 1. DRY CARBON MONOCOQUE BASE SLAB ───
  const shellGroup = new THREE.Group();
  shellGroup.name = 'Carbon_Monocoque_Shell_Subsystem';

  const baseGeo = new THREE.ExtrudeGeometry(roundedRectShape(spec.coverLengthM, spec.coverWidthM, 0.055), {
    depth: 0.02,
    bevelEnabled: true,
    bevelThickness: 0.006,
    bevelSize: 0.006,
    bevelSegments: 3,
    curveSegments: 24,
  });
  baseGeo.translate(0, 0, 0.006); // base at z=0, top at z=0.032
  const baseMesh = new THREE.Mesh(baseGeo, matCarbonShell);
  baseMesh.name = 'Autoclaved_Dry_Carbon_Cover_Body';
  baseMesh.castShadow = true;
  baseMesh.receiveShadow = true;
  shellGroup.add(baseMesh);

  // Gold-Anodized Perimeter Edge Trim Frame (wraps the top outer edge)
  const trimGeo = roundedFrameGeometry(
    spec.coverLengthM + 0.006, spec.coverWidthM + 0.006, 0.06,
    spec.coverLengthM - 0.026, spec.coverWidthM - 0.026, 0.04,
    0.005, 0.0025
  );
  const trimMesh = new THREE.Mesh(trimGeo, matGoldBezel);
  trimMesh.name = 'Perimeter_Gold_Anodized_Trim_Frame';
  trimMesh.position.set(0, 0, 0.0265);
  trimMesh.castShadow = true;
  shellGroup.add(trimMesh);

  rootGroup.add(shellGroup);

  // ─── 2. RAISED PLENUM CROWN WITH ITB WINDOW APERTURE ───
  const crownGroup = new THREE.Group();
  crownGroup.name = 'Carbon_Plenum_Crown_Subsystem';

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
  crownGeo.translate(0, 0, 0.008); // local z 0..0.042
  const crownMesh = new THREE.Mesh(crownGeo, matCarbonShell);
  crownMesh.name = 'Carbon_Plenum_Crown_Dome';
  crownMesh.position.set(0, 0, 0.03); // spans z 0.030..0.072
  crownMesh.castShadow = true;
  crownMesh.receiveShadow = true;
  crownGroup.add(crownMesh);

  rootGroup.add(crownGroup);

  // ─── 3. 12 GOLD ITB VELOCITY TRUMPETS ON THE DISPLAY FLOOR ───
  const itbGroup = new THREE.Group();
  itbGroup.name = 'ITB_Velocity_Trumpet_Subsystem';

  const trumpetGeo = buildVelocityTrumpetGeometry();
  const bankTilt = THREE.MathUtils.degToRad(28); // 60° V → 28° effective stack rake
  let trumpetIdx = 0;
  [-1, 1].forEach((rowDir) => {
    for (let i = 0; i < 6; i++) {
      trumpetIdx += 1;
      const trumpet = new THREE.Mesh(trumpetGeo, matGoldBezel);
      trumpet.name = `ITB_Velocity_Trumpet_Anodized_Gold_${trumpetIdx}`;
      trumpet.position.set(-0.23 + i * 0.092, rowDir * 0.048, 0.032);
      trumpet.rotation.x = rowDir * bankTilt * -1; // tilt stacks outward with the V
      itbGroup.add(trumpet);
    }
  });

  rootGroup.add(itbGroup);

  // ─── 4. TRANSMISSIVE QUARTZ GLASS WINDOW & GOLD BEZEL ───
  const windowGroup = new THREE.Group();
  windowGroup.name = 'Quartz_ITB_Window_Subsystem';

  // CNC Gold-Anodized Perimeter Window Bezel
  const bezelGeo = roundedFrameGeometry(
    0.612, 0.215, 0.045,
    spec.glassWindowLengthM - 0.004, spec.glassWindowWidthM - 0.004, 0.03,
    0.01, 0.002
  );
  const bezelMesh = new THREE.Mesh(bezelGeo, matGoldBezel);
  bezelMesh.name = 'CNC_Gold_Anodized_Window_Bezel';
  bezelMesh.position.set(0, 0, 0.066);
  bezelMesh.castShadow = true;
  windowGroup.add(bezelMesh);

  // 12 Bezel Retention Micro-Bolts (6 per long flank)
  for (let b = 0; b < 6; b++) {
    const bx = -0.21 + b * 0.084;
    [-0.096, 0.096].forEach((by, bIdx) => {
      const boltGeo = createAllenSocketHead(0.0022, 0.004);
      boltGeo.rotateX(Math.PI / 2); // head axis → +Z
      const boltMesh = new THREE.Mesh(boltGeo, matFastenerBillet);
      boltMesh.name = `Bezel_M4_Bolt_${b + 1}_${bIdx === 0 ? 'L' : 'R'}`;
      boltMesh.position.set(bx, by, 0.0785);
      windowGroup.add(boltMesh);
    });
  }

  // High-Transparency Quartz Glass Inspection Window
  const glassGeo = roundedRectShape(spec.glassWindowLengthM, spec.glassWindowWidthM, 0.028);
  const glassExt = new THREE.ExtrudeGeometry(glassGeo, {
    depth: 0.004,
    bevelEnabled: false,
    curveSegments: 24,
  });
  const glassMesh = new THREE.Mesh(glassExt, matQuartzGlass);
  glassMesh.name = 'Transmissive_Quartz_Glass_ITB_Window';
  glassMesh.position.set(0, 0, 0.068);
  windowGroup.add(glassMesh);

  rootGroup.add(windowGroup);

  // ─── 5. GOLD "RACING V12 EVOLUTION" BADGE LETTERING ───
  const badgeGroup = new THREE.Group();
  badgeGroup.name = 'Racing_Badge_Lettering_Subsystem';

  const letteringGeo = buildStrokeLettering('RACING V12 EVOLUTION', 0.026, 0.62, 0.0035, 0.16);
  const letteringMesh = new THREE.Mesh(letteringGeo, matGoldBezel);
  letteringMesh.name = 'Badge_Racing_V12_Evolution_Anodized_Gold_Lettering';
  letteringMesh.position.set(0, -0.1248, 0.0725); // front carbon strip of the crown
  badgeGroup.add(letteringMesh);

  rootGroup.add(badgeGroup);

  // ─── 6. HEAT-EXTRACTION LOUVER GRILLE SLATS (both shoulders) ───
  const louverGroup = new THREE.Group();
  louverGroup.name = 'Heat_Extraction_Louver_Subsystem';

  [-1, 1].forEach((dir) => {
    const yPos = dir * 0.182;
    for (let l = 0; l < spec.louverCount; l++) {
      const lx = -0.22 + l * 0.088;
      const louverGeo = new THREE.BoxGeometry(0.045, 0.03, 0.004);
      louverGeo.rotateY(THREE.MathUtils.degToRad(-25));
      const louverMesh = new THREE.Mesh(louverGeo, matMeshGrille);
      louverMesh.name = `Heat_Extraction_Grille_Louver_${dir === -1 ? 'Left' : 'Right'}_${l + 1}`;
      louverMesh.position.set(lx, yPos, 0.035);
      louverGroup.add(louverMesh);
    }
  });

  rootGroup.add(louverGroup);

  // ─── 7. CARBON RAM-AIR INDUCTION TUBE (+X END) ───
  const ramGroup = new THREE.Group();
  ramGroup.name = 'Ram_Air_Induction_Subsystem';

  const tubeGeo = new THREE.CylinderGeometry(spec.scoopHeightM, spec.scoopHeightM, 0.15, 28);
  tubeGeo.rotateZ(Math.PI / 2); // axis → X
  const tubeMesh = new THREE.Mesh(tubeGeo, matCarbonShell);
  tubeMesh.name = 'Carbon_Fiber_Ram_Air_Induction_Tube';
  tubeMesh.position.set(0.375, 0, 0.046);
  tubeMesh.castShadow = true;
  ramGroup.add(tubeMesh);

  const collarGeo = new THREE.TorusGeometry(spec.scoopHeightM + 0.002, 0.006, 12, 28);
  collarGeo.rotateY(Math.PI / 2); // ring axis → X
  const collarMesh = new THREE.Mesh(collarGeo, matGoldBezel);
  collarMesh.name = 'RamTube_Gold_Anodized_Collar_Ring';
  collarMesh.position.set(0.435, 0, 0.046);
  ramGroup.add(collarMesh);

  const screenGeo = new THREE.CylinderGeometry(0.026, 0.026, 0.004, 24);
  screenGeo.rotateZ(Math.PI / 2);
  const screenMesh = new THREE.Mesh(screenGeo, matMeshGrille);
  screenMesh.name = 'Honeycomb_Rock_Debris_Grille_Screen';
  screenMesh.position.set(0.452, 0, 0.046);
  ramGroup.add(screenMesh);

  rootGroup.add(ramGroup);

  // ─── 8. 6 QUARTER-TURN DZUS AEROSPACE FASTENERS ───
  const fastenerGroup = new THREE.Group();
  fastenerGroup.name = 'Dzus_Fasteners_Subsystem';

  let dzusIdx = 0;
  [-0.25, 0, 0.25].forEach((fx) => {
    [-0.182, 0.182].forEach((fy) => {
      dzusIdx += 1;
      const dzusGeo = createAllenSocketHead(0.008, 0.006);
      dzusGeo.rotateX(Math.PI / 2); // head axis → +Z
      const dzusMesh = new THREE.Mesh(dzusGeo, matDzusFastener);
      dzusMesh.name = `QuarterTurn_Dzus_Fastener_Bolt_${dzusIdx}`;
      dzusMesh.position.set(fx, fy, 0.034);
      fastenerGroup.add(dzusMesh);
    });
  });

  rootGroup.add(fastenerGroup);

  return scene;
}

/**
 * Exports the engine cover scene to a binary GLB ArrayBuffer.
 */
export async function generateEngineCoverGlbBuffer(): Promise<ArrayBuffer> {
  const scene = buildEngineCoverScene();
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
