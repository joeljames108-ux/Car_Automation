// ============================================================================
// ULTRA-HIGH-FIDELITY MODULAR GLB GENERATOR — W-ENGINE BLOCK (W12 / W16 / W18)
// ============================================================================
// Solid-modeling engineering generator for dual-VR narrow-angle W-engine blocks
// (W12, W16, W18, e.g. Bugatti Chiron 8.0L W16 / Bentley 6.0L W12 architecture).
// Features 4 staggered cylinder rows across dual 15° VR-banks in a 72° master V,
// multi-angle stepped CNC decks, heavy-duty lower crankcase bedplate girdle with
// double cross-bolted main bulkheads, quad coolant distribution jackets, and dual valley scavenge.
// ============================================================================

import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import type { EngineConfig } from '../../sim/types';
import { createBlockMaterialPalette, type V12BlockMaterialPalette } from './engineBlockGenerator';
import {
  create12PointHead,
  createAllenSocketHead,
  createHexBoltHead,
  createCoreFreezePlug,
  createAlignmentDowel,
  createMainBearingCap,
  createFireRingGasketBead,
  createThreadedStudWithNut,
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

export interface WBlockSpec {
  cylinderCount: number; // 12, 16, or 18
  cylsPerRow: number; // 3 for W12, 4 for W16, 5/6 for W18
  vrAngleDeg: number; // 15.0° narrow VR angle between staggered rows
  masterVAngleDeg: number; // 72.0° master V angle between left and right VR banks
  boreDiameterMm: number; // 86.0 mm
  boreRadiusM: number; // 0.043 m
  boreSpacingMm: number; // 88.0 mm compact VR bore pitch
  boreSpacingM: number; // 0.088 m
  rowStaggerM: number; // 0.022 m lateral offset between staggered VR rows
  deckHeightM: number; // 0.235 m
  blockWidthM: number; // 0.380 m broad W-block stance
  totalLengthM: number; // dynamically computed
  journalRadiusM: number; // 0.034 m (68mm heavy-duty main journal)
}

export function computeWBlockSpecs(
  totalCylsOrConfig: number | Partial<EngineConfig> = 16,
  maybeConfig?: Partial<EngineConfig>
): WBlockSpec {
  const config = typeof totalCylsOrConfig === 'object' ? totalCylsOrConfig : maybeConfig;
  let count = typeof totalCylsOrConfig === 'number' ? totalCylsOrConfig : 16;
  if (config?.layout) {
    count = config.layout === 'w12' ? 12 : config.layout === 'w18' ? 18 : 16;
  }
  const cylsPerRow = count === 12 ? 3 : count === 18 ? 5 : 4;

  const boreDiameterMm = config?.bore || 86.0;
  const strokeMm = config?.stroke || 82.0;
  const rodLengthMm = config?.rodLength || 140.0;

  const boreSpacingMm = Math.max(88.0, boreDiameterMm + 4.0);
  const boreSpacingM = boreSpacingMm / 1000;
  const frontMarginM = 0.080;
  const rearMarginM = 0.090;
  const totalLengthM = (cylsPerRow - 1) * boreSpacingM + frontMarginM + rearMarginM;
  const boreRadiusM = (boreDiameterMm / 2) / 1000;
  const deckHeightM = (strokeMm * 0.5 + rodLengthMm + 40.0) / 1000;
  const blockWidthM = Math.max(0.380, (boreDiameterMm * 4.2) / 1000);

  return {
    cylinderCount: count,
    cylsPerRow,
    vrAngleDeg: 15.0,
    masterVAngleDeg: 72.0,
    boreDiameterMm,
    boreRadiusM,
    boreSpacingMm,
    boreSpacingM,
    rowStaggerM: 0.022,
    deckHeightM,
    blockWidthM,
    totalLengthM,
    journalRadiusM: 0.034,
  };
}

// ============================================================================
// 1. 4 STAGGERED CYLINDER ROWS & NIKASIL BORES (DUAL VR-BANKS)
// ============================================================================

export function buildWEngineCylinderLiners(
  specs: WBlockSpec,
  materials: V12BlockMaterialPalette
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'W_Engine_Staggered_Liners';

  const halfMasterVRad = (specs.masterVAngleDeg / 2) * (Math.PI / 180); // 36°
  const halfVRRad = (specs.vrAngleDeg / 2) * (Math.PI / 180); // 7.5°
  const halfLength = ((specs.cylsPerRow - 1) * specs.boreSpacingM) / 2;
  const linerHeight = specs.deckHeightM * 0.82;
  const wallThickness = 0.0055;

  // 4 Rows: [Bank, RowName, MasterSign, VRSign, StaggerX]
  const rows = [
    { bank: 'Left_VR', row: 'Row_1A_Inner', masterSign: 1, vrSign: -1, staggerX: 0 },
    { bank: 'Left_VR', row: 'Row_1B_Outer', masterSign: 1, vrSign: 1, staggerX: specs.boreSpacingM * 0.5 },
    { bank: 'Right_VR', row: 'Row_2A_Inner', masterSign: -1, vrSign: -1, staggerX: 0.015 },
    { bank: 'Right_VR', row: 'Row_2B_Outer', masterSign: -1, vrSign: 1, staggerX: specs.boreSpacingM * 0.5 + 0.015 },
  ];

  for (const r of rows) {
    const rowGroup = new THREE.Group();
    rowGroup.name = `W_${r.bank}_${r.row}`;

    // Total tilt angle for this specific staggered cylinder row
    const totalAngleRad = r.masterSign * halfMasterVRad + r.vrSign * halfVRRad;
    const rowOffsetY = 0.16 * Math.cos(totalAngleRad);
    const rowOffsetZ = 0.16 * Math.sin(totalAngleRad) + r.vrSign * r.masterSign * specs.rowStaggerM;

    for (let i = 0; i < specs.cylsPerRow; i++) {
      const cX = -halfLength + i * specs.boreSpacingM + r.staggerX;
      const cylGroup = new THREE.Group();
      cylGroup.name = `W_Bore_${r.row}_${i + 1}`;
      cylGroup.position.set(cX, rowOffsetY, rowOffsetZ);
      cylGroup.rotation.x = -totalAngleRad;

      // Outer Ductile Iron Liner Sleeve
      const outerLiner = new THREE.CylinderGeometry(
        specs.boreRadiusM + wallThickness,
        specs.boreRadiusM + wallThickness,
        linerHeight,
        28,
        1,
        true
      );
      const outerMesh = new THREE.Mesh(outerLiner, materials.castAluminumBlock);
      cylGroup.add(outerMesh);

      // Inner Honed Nikasil Bore
      const innerBore = new THREE.CylinderGeometry(
        specs.boreRadiusM,
        specs.boreRadiusM,
        linerHeight + 0.001,
        28,
        1,
        true
      );
      const innerMesh = new THREE.Mesh(innerBore, materials.nikasilCylinderBore);
      cylGroup.add(innerMesh);

      // Fire Ring Combustion Seal Ring
      const fireRing = createFireRingGasketBead(specs.boreRadiusM, 0.003, 0.0015);
      const fMesh = new THREE.Mesh(fireRing, materials.gasketChannel);
      fMesh.position.set(0, linerHeight / 2, 0);
      cylGroup.add(fMesh);

      rowGroup.add(cylGroup);
    }

    group.add(rowGroup);
  }

  return group;
}

// ============================================================================
// 2. MULTI-PLANE CNC STEPPED CYLINDER DECKS & HEAD STUDS
// ============================================================================

export function buildWEngineCylinderDecks(
  specs: WBlockSpec,
  materials: V12BlockMaterialPalette
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'W_Engine_Stepped_Decks';

  const halfMasterVRad = (specs.masterVAngleDeg / 2) * (Math.PI / 180);
  const deckLength = specs.totalLengthM * 0.96;
  const vrDeckWidth = specs.boreDiameterMm * 0.002 + 0.040; // 0.212m wide combined VR deck

  // Dual Wide Multi-Angle VR Decks (Left VR Deck & Right VR Deck)
  for (const masterSign of [-1, 1]) {
    const deckGroup = new THREE.Group();
    deckGroup.name = `W_VR_Deck_${masterSign > 0 ? 'Left' : 'Right'}`;

    const deckY = specs.deckHeightM * Math.cos(halfMasterVRad) + 0.035;
    const deckZ = masterSign * (specs.deckHeightM * Math.sin(halfMasterVRad) + 0.035);

    deckGroup.position.set(0, deckY, deckZ);
    deckGroup.rotation.x = -masterSign * halfMasterVRad;

    // Combined CNC VR Deck Slab (Houses both inner and outer staggered bores)
    const slabGeo = new THREE.BoxGeometry(deckLength, 0.022, vrDeckWidth);
    const slabMesh = new THREE.Mesh(slabGeo, materials.machinedDeckSurface);
    deckGroup.add(slabMesh);

    // Perimeter ARP Head Stud Pattern (32+ studs across the dual VR banks)
    const studGeos: THREE.BufferGeometry[] = [];
    const studCountX = specs.cylsPerRow + 1;
    const halfLength = ((specs.cylsPerRow - 1) * specs.boreSpacingM) / 2;

    for (let i = 0; i <= studCountX; i++) {
      const sX = -halfLength - specs.boreSpacingM * 0.5 + i * (specs.boreSpacingM * 0.95);

      for (const zOff of [-vrDeckWidth * 0.42, 0, vrDeckWidth * 0.42]) {
        const stud = createThreadedStudWithNut(0.006, 0.055, 0.009, 0.010);
        stud.translate(sX, 0.025, zOff);
        studGeos.push(stud);
      }
    }

    if (studGeos.length > 0) {
      const mergedS = mergeBufferGeometries(studGeos);
      const studsMesh = new THREE.Mesh(mergedS, materials.arpHardenedFastener);
      deckGroup.add(studsMesh);
    }

    group.add(deckGroup);
  }

  return group;
}

// ============================================================================
// 3. HEAVY-DUTY BEDPLATE GIRDLE & DOUBLE CROSS-BOLTED MAIN BULKHEADS
// ============================================================================

export function buildWEngineBedplateGirdle(
  specs: WBlockSpec,
  materials: V12BlockMaterialPalette
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'W_Engine_Bedplate_Girdle';

  const bulkheadCount = specs.cylsPerRow + 1;
  const halfLength = ((specs.cylsPerRow - 1) * specs.boreSpacingM) / 2;

  // Solid Lower Monolithic Bedplate Slab (Structural reinforcing crank girdle)
  const bedplateHeight = 0.055;
  const bedplateGeo = new THREE.BoxGeometry(specs.totalLengthM * 1.02, bedplateHeight, specs.blockWidthM * 0.95);
  const bedplateMesh = new THREE.Mesh(bedplateGeo, materials.castAluminumBlock);
  bedplateMesh.position.set(0, -specs.deckHeightM * 0.35, 0);
  bedplateMesh.receiveShadow = true;
  group.add(bedplateMesh);

  // CNC Machined Bedplate Split Line Flange
  const splitLineGeo = new THREE.BoxGeometry(specs.totalLengthM * 1.04, 0.012, specs.blockWidthM * 0.98);
  const splitLineMesh = new THREE.Mesh(splitLineGeo, materials.machinedDeckSurface);
  splitLineMesh.position.set(0, -specs.deckHeightM * 0.35 + bedplateHeight / 2, 0);
  group.add(splitLineMesh);

  // Double Cross-Bolted Main Bearing Bulkheads (4 Cross-Bolts per bulkhead for 2000HP rigidity)
  const boltGeos: THREE.BufferGeometry[] = [];

  for (let b = 0; b < bulkheadCount; b++) {
    const bX = -halfLength - specs.boreSpacingM * 0.5 + b * specs.boreSpacingM;

    // Upper Bulkhead Saddle
    const saddleGeo = new THREE.CylinderGeometry(specs.journalRadiusM, specs.journalRadiusM, 0.038, 32, 1, true);
    saddleGeo.rotateZ(Math.PI / 2);
    const saddleMesh = new THREE.Mesh(saddleGeo, materials.machinedDeckSurface);
    saddleMesh.position.set(bX, 0, 0);
    group.add(saddleMesh);

    // 4 Vertical ARP Main Studs (2 inner, 2 outer)
    for (const zSign of [-1, 1]) {
      for (const zDist of [specs.journalRadiusM + 0.018, specs.journalRadiusM + 0.042]) {
        const vStud = createThreadedStudWithNut(0.007, 0.075, 0.010, 0.012);
        vStud.rotateX(Math.PI);
        vStud.translate(bX, -specs.deckHeightM * 0.32, zSign * zDist);
        boltGeos.push(vStud);
      }

      // Dual Lateral Cross-Bolts per side (Upper & Lower Cross-Bolts)
      for (const ySign of [-1, 1]) {
        const cBolt = createAllenSocketHead(0.006, 0.018);
        cBolt.rotateZ((zSign * Math.PI) / 2);
        cBolt.translate(bX, ySign * 0.016, zSign * (specs.blockWidthM * 0.44));
        boltGeos.push(cBolt);
      }
    }
  }

  if (boltGeos.length > 0) {
    const mergedB = mergeBufferGeometries(boltGeos);
    const boltsMesh = new THREE.Mesh(mergedB, materials.arpHardenedFastener);
    group.add(boltsMesh);
  }

  return group;
}

// ============================================================================
// 4. QUAD COOLANT DISTRIBUTION CIRCUITS & WATER PUMP VOLUTES
// ============================================================================

export function buildWEngineCoolantSuite(
  specs: WBlockSpec,
  materials: V12BlockMaterialPalette
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'W_Engine_Coolant_Subsystem';

  const halfLength = ((specs.cylsPerRow - 1) * specs.boreSpacingM) / 2;

  // Quad Outer Coolant Water Jackets
  for (const masterSign of [-1, 1]) {
    const jacketGeo = new THREE.BoxGeometry(specs.totalLengthM * 0.88, specs.deckHeightM * 0.55, 0.024);
    const jacketMesh = new THREE.Mesh(jacketGeo, materials.castAluminumBlock);
    jacketMesh.position.set(0, specs.deckHeightM * 0.25, masterSign * (specs.blockWidthM * 0.42));
    group.add(jacketMesh);

    // 6 Brass Freeze Plugs per flank
    for (let i = 0; i < specs.cylsPerRow; i++) {
      const cX = -halfLength + i * specs.boreSpacingM;
      const plugGeo = createCoreFreezePlug(0.016, 0.008, 0.0015);
      plugGeo.rotateX(masterSign > 0 ? Math.PI / 2 : -Math.PI / 2);
      plugGeo.translate(cX, specs.deckHeightM * 0.22, masterSign * (specs.blockWidthM * 0.42 + 0.012));
      const plugMesh = new THREE.Mesh(plugGeo, materials.brassFreezePlug);
      group.add(plugMesh);
    }
  }

  // Dual High-Flow Water Pump Scrolls (Front Left & Front Right)
  for (const masterSign of [-1, 1]) {
    const pumpGroup = new THREE.Group();
    pumpGroup.name = `Water_Pump_Scroll_${masterSign > 0 ? 'Left' : 'Right'}`;
    pumpGroup.position.set(specs.totalLengthM / 2 + 0.015, specs.deckHeightM * 0.15, masterSign * (specs.blockWidthM * 0.28));

    const scrollGeo = new THREE.CylinderGeometry(0.052, 0.058, 0.032, 24);
    scrollGeo.rotateZ(Math.PI / 2);
    const scrollMesh = new THREE.Mesh(scrollGeo, materials.castAluminumBlock);
    pumpGroup.add(scrollMesh);

    const inletGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.035, 20);
    inletGeo.rotateX(masterSign * (Math.PI / 4));
    const inletMesh = new THREE.Mesh(inletGeo, materials.machinedDeckSurface);
    pumpGroup.add(inletMesh);

    group.add(pumpGroup);
  }

  return group;
}

// ============================================================================
// 5. DUAL CENTRAL VALLEY OIL SCAVENGE & KNOCK SENSORS
// ============================================================================

export function buildWEngineValleyScavengeSuite(
  specs: WBlockSpec,
  materials: V12BlockMaterialPalette
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'W_Engine_Valley_Scavenge';

  // Central Scavenge Floor Troughs (Dual Valleys between VR banks)
  const valleyLength = specs.totalLengthM * 0.85;
  const valleyFloorGeo = new THREE.BoxGeometry(valleyLength, 0.016, specs.blockWidthM * 0.28);
  const valleyMesh = new THREE.Mesh(valleyFloorGeo, materials.machinedDeckSurface);
  valleyMesh.position.set(0, specs.deckHeightM * 0.32, 0);
  group.add(valleyMesh);

  // 4 Knock Sensor Resonance Bosses (M8 x 1.25)
  const halfLength = ((specs.cylsPerRow - 1) * specs.boreSpacingM) / 2;
  for (let k = 0; k < 4; k++) {
    const kX = -halfLength * 0.75 + k * (halfLength * 0.5);
    const kZ = (k % 2 === 0 ? 1 : -1) * (specs.blockWidthM * 0.08);

    const bossGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.022, 16);
    bossGeo.translate(kX, specs.deckHeightM * 0.34, kZ);
    const bossMesh = new THREE.Mesh(bossGeo, materials.castAluminumBlock);
    group.add(bossMesh);

    const boltGeo = createAllenSocketHead(0.007, 0.010);
    boltGeo.translate(kX, specs.deckHeightM * 0.35 + 0.004, kZ);
    const boltMesh = new THREE.Mesh(boltGeo, materials.arpHardenedFastener);
    group.add(boltMesh);
  }

  // PCV Oil Separation Breather Chimneys
  for (const xSign of [-1, 1]) {
    const chimney = new THREE.CylinderGeometry(0.018, 0.022, 0.038, 16);
    chimney.translate(xSign * (valleyLength * 0.35), specs.deckHeightM * 0.36, 0);
    const cMesh = new THREE.Mesh(chimney, materials.castAluminumBlock);
    group.add(cMesh);
  }

  return group;
}

// ============================================================================
// 6. FRONT QUAD-CAM TIMING CASE & REAR BELLHOUSING FLANGES
// ============================================================================

export function buildWEngineEndFlangesSuite(
  specs: WBlockSpec,
  materials: V12BlockMaterialPalette
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'W_Engine_End_Flanges';

  const frontX = specs.totalLengthM / 2;
  const rearX = -specs.totalLengthM / 2;
  const flangeHeight = specs.deckHeightM * 1.35;

  // ── 6.1 Front Quad-Cam Timing Cover Flange ──
  const timingGroup = new THREE.Group();
  timingGroup.name = 'Front_Timing_Flange';
  timingGroup.position.set(frontX, 0, 0);

  const frontPlateGeo = new THREE.BoxGeometry(0.024, flangeHeight, specs.blockWidthM * 1.05);
  const frontPlateMesh = new THREE.Mesh(frontPlateGeo, materials.machinedDeckSurface);
  timingGroup.add(frontPlateMesh);

  // Front Crank Seal Bore
  const frontSeal = new THREE.CylinderGeometry(0.044, 0.044, 0.028, 32, 1, true);
  frontSeal.rotateZ(Math.PI / 2);
  const frontSealMesh = new THREE.Mesh(frontSeal, materials.nikasilCylinderBore);
  timingGroup.add(frontSealMesh);

  // 4 Camshaft Drive Intermediate Sprocket Hubs (2 per VR Bank)
  for (const masterSign of [-1, 1]) {
    for (const vrSign of [-1, 1]) {
      const hubGeo = new THREE.CylinderGeometry(0.024, 0.024, 0.032, 20);
      hubGeo.rotateZ(Math.PI / 2);
      const hubMesh = new THREE.Mesh(hubGeo, materials.castAluminumBlock);
      hubMesh.position.set(0.016, specs.deckHeightM * 0.45, masterSign * (specs.blockWidthM * 0.28) + vrSign * 0.035);
      timingGroup.add(hubMesh);
    }
  }
  group.add(timingGroup);

  // ── 6.2 Rear Dual-Clutch / Transaxle Bellhousing Flange ──
  const bellGroup = new THREE.Group();
  bellGroup.name = 'Rear_Bellhousing_Flange';
  bellGroup.position.set(rearX, 0, 0);

  const bellPlateGeo = new THREE.BoxGeometry(0.028, flangeHeight * 1.15, specs.blockWidthM * 1.18);
  const bellPlateMesh = new THREE.Mesh(bellPlateGeo, materials.machinedDeckSurface);
  bellGroup.add(bellPlateMesh);

  // Rear Main Crankshaft Seal
  const rearSeal = new THREE.CylinderGeometry(0.058, 0.058, 0.030, 32, 1, true);
  rearSeal.rotateZ(Math.PI / 2);
  const rearSealMesh = new THREE.Mesh(rearSeal, materials.nikasilCylinderBore);
  bellGroup.add(rearSealMesh);

  // 12 Heavy-Duty M10 Bellhousing Bolt Fasteners
  const bellBoltGeos: THREE.BufferGeometry[] = [];
  for (let b = 0; b < 12; b++) {
    const angle = (b * Math.PI * 2) / 12;
    const bZ = Math.sin(angle) * (specs.blockWidthM * 0.52);
    const bY = Math.cos(angle) * (flangeHeight * 0.50);

    const bolt = create12PointHead(0.008, 0.010, 0.012, 0.003);
    bolt.rotateZ(-Math.PI / 2);
    bolt.translate(-0.018, bY, bZ);
    bellBoltGeos.push(bolt);
  }
  if (bellBoltGeos.length > 0) {
    const mergedB = mergeBufferGeometries(bellBoltGeos);
    const bMesh = new THREE.Mesh(mergedB, materials.arpHardenedFastener);
    bellGroup.add(bMesh);
  }
  group.add(bellGroup);

  return group;
}

// ============================================================================
// 7. MASTER W-ENGINE BLOCK SCENE INTEGRATOR
// ============================================================================

export function buildWBlockScene(config?: Partial<EngineConfig> | number): THREE.Scene {
  const scene = new THREE.Scene();
  scene.name = 'W_Engine_Block_Scene';

  const rootGroup = new THREE.Group();
  rootGroup.name = 'W_Engine_Block_Master';
  scene.add(rootGroup);

  const specs = computeWBlockSpecs(config);
  const materials = createBlockMaterialPalette(typeof config === 'object' ? config : undefined);

  // 1. 4 Staggered Cylinder Rows & Nikasil Bores
  const liners = buildWEngineCylinderLiners(specs, materials);
  rootGroup.add(liners);

  // 2. Stepped Multi-Angle CNC VR Decks & Head Studs
  const decks = buildWEngineCylinderDecks(specs, materials);
  rootGroup.add(decks);

  // 3. Heavy-Duty Lower Bedplate Girdle & Cross-Bolts
  const bedplate = buildWEngineBedplateGirdle(specs, materials);
  rootGroup.add(bedplate);

  // 4. Quad Coolant Water Jackets & Dual Water Pumps
  const coolant = buildWEngineCoolantSuite(specs, materials);
  rootGroup.add(coolant);

  // 5. Dual Valley Oil Scavenge & Knock Sensors
  const valley = buildWEngineValleyScavengeSuite(specs, materials);
  rootGroup.add(valley);

  // 6. Front Quad-Cam Timing & Rear Bellhousing Flanges
  const endFlanges = buildWEngineEndFlangesSuite(specs, materials);
  rootGroup.add(endFlanges);

  return scene;
}

export default buildWBlockScene;
