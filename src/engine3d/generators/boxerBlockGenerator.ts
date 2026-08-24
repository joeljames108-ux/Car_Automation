// ============================================================================
// ULTRA-HIGH-FIDELITY MODULAR GLB GENERATOR — BOXER / FLAT ENGINE BLOCK
// ============================================================================
// Solid-modeling engineering generator for 180° horizontally opposed Boxer engine
// blocks (Boxer-4 and Boxer-6, e.g. Porsche GT3 / Subaru EJ/FA architecture).
// Features split-case crankcase halves (Left Case A & Right Case B) with central
// through-bolts, opposed horizontal cylinder decks, dry-sump scavenge troughs,
// integrated timing housing, and dual-bank coolant crossover circuits.
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

export interface BoxerBlockSpec {
  cylinderCount: number; // 4 or 6
  cylsPerBank: number; // 2 for Boxer-4, 3 for Boxer-6
  boreDiameterMm: number; // 102.0 mm GT3 standard bore
  boreRadiusM: number; // 0.051 m
  boreSpacingMm: number; // 118.0 mm
  boreSpacingM: number; // 0.118 m
  bankStaggerM: number; // 0.014 m bank offset for opposing connecting rods
  crankcaseWidthM: number; // 0.210 m central split-case width
  halfWidthM: number; // 0.105 m per case half
  bankReachM: number; // 0.210 m horizontal cylinder bank reach from center
  totalWidthM: number; // 0.630 m total opposed width
  totalLengthM: number; // dynamically computed
  journalRadiusM: number; // 0.030 m (60mm main journal)
}

export function computeBoxerSpecs(totalCyls: number = 6): BoxerBlockSpec {
  const count = totalCyls === 4 ? 4 : 6;
  const cylsPerBank = count / 2;
  const boreSpacingM = 0.118;
  const frontMarginM = 0.075;
  const rearMarginM = 0.085;
  const totalLengthM = (cylsPerBank - 1) * boreSpacingM + frontMarginM + rearMarginM;

  return {
    cylinderCount: count,
    cylsPerBank,
    boreDiameterMm: 102.0,
    boreRadiusM: 0.051,
    boreSpacingMm: 118.0,
    boreSpacingM,
    bankStaggerM: 0.014,
    crankcaseWidthM: 0.210,
    halfWidthM: 0.105,
    bankReachM: 0.210,
    totalWidthM: 0.630,
    totalLengthM,
    journalRadiusM: 0.030,
  };
}

// ============================================================================
// 1. SPLIT-CASE CRANKCASE HALVES (CASE A & CASE B) & MAIN THROUGH-BOLTS
// ============================================================================

export function buildBoxerSplitCaseCrankcase(
  specs: BoxerBlockSpec,
  materials: V12BlockMaterialPalette
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Boxer_Split_Case_Crankcase';

  const caseHeight = 0.200;
  const bulkheadCount = specs.cylsPerBank + 1; // 3 for Boxer-4, 4 for Boxer-6
  const halfLength = ((specs.cylsPerBank - 1) * specs.boreSpacingM) / 2;

  // ── 1.1 Left Half (Case A, +Z side) & Right Half (Case B, -Z side) ──
  for (const zSign of [-1, 1]) {
    const caseGroup = new THREE.Group();
    caseGroup.name = `Boxer_Case_Half_${zSign > 0 ? 'Left_A' : 'Right_B'}`;

    // Main Case Half Solid Casting
    const caseGeo = new THREE.BoxGeometry(specs.totalLengthM * 0.96, caseHeight, specs.halfWidthM);
    const caseMesh = new THREE.Mesh(caseGeo, materials.castAluminumBlock);
    caseMesh.position.set(0, 0, zSign * (specs.halfWidthM / 2));
    caseMesh.castShadow = true;
    caseMesh.receiveShadow = true;
    caseGroup.add(caseMesh);

    // Split Plane CNC Machined Interface Surface
    const splitFaceGeo = new THREE.BoxGeometry(specs.totalLengthM * 0.98, caseHeight * 0.98, 0.003);
    const splitFaceMesh = new THREE.Mesh(splitFaceGeo, materials.machinedDeckSurface);
    splitFaceMesh.position.set(0, 0, zSign * 0.0015);
    caseGroup.add(splitFaceMesh);

    // Precision Split-Plane Alignment Dowels (4 Dowels per half)
    for (const [dx, dy] of [
      [-specs.totalLengthM * 0.42, -caseHeight * 0.38],
      [-specs.totalLengthM * 0.42, caseHeight * 0.38],
      [specs.totalLengthM * 0.42, -caseHeight * 0.38],
      [specs.totalLengthM * 0.42, caseHeight * 0.38],
    ]) {
      const dowelGeo = createAlignmentDowel(0.006, 0.014);
      dowelGeo.rotateX(Math.PI / 2);
      const dowelMesh = new THREE.Mesh(dowelGeo, materials.machinedDeckSurface);
      dowelMesh.position.set(dx, dy, zSign * 0.005);
      caseGroup.add(dowelMesh);
    }

    group.add(caseGroup);
  }

  // ── 1.2 Main Bearing Journal Saddles & High-Tensile 12mm Through-Bolts ──
  const boltGeos: THREE.BufferGeometry[] = [];
  const washerGeos: THREE.BufferGeometry[] = [];

  for (let b = 0; b < bulkheadCount; b++) {
    const bX = -halfLength - specs.boreSpacingM * 0.5 + b * specs.boreSpacingM;

    // Semicircular Main Bearing Saddle
    const saddleGeo = new THREE.CylinderGeometry(specs.journalRadiusM, specs.journalRadiusM, 0.032, 28, 1, true);
    saddleGeo.rotateZ(Math.PI / 2);
    const saddleMesh = new THREE.Mesh(saddleGeo, materials.machinedDeckSurface);
    saddleMesh.position.set(bX, 0, 0);
    group.add(saddleMesh);

    // Dual Main Through-Bolts per bulkhead (Top & Bottom through-bolts)
    for (const ySign of [-1, 1]) {
      const bY = ySign * (specs.journalRadiusM + 0.032);

      // Through-bolt shaft spanning across both halves
      const shaft = new THREE.CylinderGeometry(0.006, 0.006, specs.crankcaseWidthM * 1.08, 16);
      shaft.rotateX(Math.PI / 2);
      shaft.translate(bX, bY, 0);
      boltGeos.push(shaft);

      // 12-point ARP nuts on both Left and Right outer case flanks
      for (const zSign of [-1, 1]) {
        const nut = create12PointHead(0.009, 0.011, 0.014, 0.003);
        nut.rotateX((zSign * Math.PI) / 2);
        nut.translate(bX, bY, zSign * (specs.crankcaseWidthM / 2 + 0.005));
        boltGeos.push(nut);

        // Aluminum crush sealing washer
        const washer = new THREE.CylinderGeometry(0.015, 0.015, 0.0025, 20);
        washer.rotateX(Math.PI / 2);
        washer.translate(bX, bY, zSign * (specs.crankcaseWidthM / 2 + 0.001));
        washerGeos.push(washer);
      }
    }
  }

  // ── 1.3 Case Perimeter M8 Clamping Bolts (Top & Bottom Seams) ──
  const perimeterBoltCount = Math.floor(specs.totalLengthM / 0.045);
  for (let p = 0; p <= perimeterBoltCount; p++) {
    const pX = -specs.totalLengthM / 2 + p * (specs.totalLengthM / perimeterBoltCount);
    for (const ySign of [-1, 1]) {
      const pY = ySign * (caseHeight / 2 - 0.012);
      const bolt = createAllenSocketHead(0.005, 0.010);
      bolt.rotateX(Math.PI / 2);
      bolt.translate(pX, pY, specs.crankcaseWidthM / 2 + 0.004);
      boltGeos.push(bolt);
    }
  }

  if (boltGeos.length > 0) {
    const mergedB = mergeBufferGeometries(boltGeos);
    const boltsMesh = new THREE.Mesh(mergedB, materials.arpHardenedFastener);
    group.add(boltsMesh);
  }

  if (washerGeos.length > 0) {
    const mergedW = mergeBufferGeometries(washerGeos);
    const washersMesh = new THREE.Mesh(mergedW, materials.machinedDeckSurface);
    group.add(washersMesh);
  }

  return group;
}

// ============================================================================
// 2. OPPOSED HORIZONTAL CYLINDER BANKS & NIKASIL BORES
// ============================================================================

export function buildBoxerCylinderBanks(
  specs: BoxerBlockSpec,
  materials: V12BlockMaterialPalette
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Boxer_Opposed_Cylinder_Banks';

  const halfLength = ((specs.cylsPerBank - 1) * specs.boreSpacingM) / 2;
  const linerLength = specs.bankReachM * 0.90;
  const wallThickness = 0.006;

  // ── Bank 1 (Left, +Z) and Bank 2 (Right, -Z, staggered by 14mm) ──
  for (const [bankName, zSign, staggerX] of [
    ['Bank_1_Left', 1, 0],
    ['Bank_2_Right', -1, specs.bankStaggerM],
  ] as const) {
    const bankGroup = new THREE.Group();
    bankGroup.name = `Boxer_${bankName}`;

    for (let i = 0; i < specs.cylsPerBank; i++) {
      const cX = -halfLength + i * specs.boreSpacingM + staggerX;
      const cylGroup = new THREE.Group();
      cylGroup.name = `${bankName}_Cyl_${i + 1}`;
      cylGroup.position.set(cX, 0, zSign * (specs.halfWidthM + linerLength / 2));

      // Outer Cylinder Barrel Casting
      const barrelGeo = new THREE.CylinderGeometry(
        specs.boreRadiusM + wallThickness,
        specs.boreRadiusM + wallThickness,
        linerLength,
        32,
        1,
        true
      );
      barrelGeo.rotateX(Math.PI / 2);
      const barrelMesh = new THREE.Mesh(barrelGeo, materials.castAluminumBlock);
      cylGroup.add(barrelMesh);

      // Inner Plateau-Honed Nikasil Cylinder Bore
      const boreGeo = new THREE.CylinderGeometry(
        specs.boreRadiusM,
        specs.boreRadiusM,
        linerLength + 0.001,
        32,
        1,
        true
      );
      boreGeo.rotateX(Math.PI / 2);
      const boreMesh = new THREE.Mesh(boreGeo, materials.nikasilCylinderBore);
      cylGroup.add(boreMesh);

      // Outer Circumferential Cooling Fins on Cylinder Barrels
      for (let f = -3; f <= 3; f++) {
        const finGeo = new THREE.TorusGeometry(specs.boreRadiusM + wallThickness + 0.005, 0.002, 6, 28);
        finGeo.rotateX(Math.PI / 2);
        finGeo.translate(0, 0, f * 0.022);
        const finMesh = new THREE.Mesh(finGeo, materials.castAluminumBlock);
        cylGroup.add(finMesh);
      }

      bankGroup.add(cylGroup);
    }

    group.add(bankGroup);
  }

  return group;
}

// ============================================================================
// 3. OPPOSED CNC CYLINDER DECKS & ARP HEAD STUDS
// ============================================================================

export function buildBoxerCylinderDecks(
  specs: BoxerBlockSpec,
  materials: V12BlockMaterialPalette
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Boxer_Opposed_Cylinder_Decks';

  const deckLength = specs.totalLengthM * 0.94;
  const deckHeight = specs.boreDiameterMm * 0.001 + 0.045; // 0.147m
  const deckThickness = 0.018;
  const halfLength = ((specs.cylsPerBank - 1) * specs.boreSpacingM) / 2;

  for (const [bankName, zSign, staggerX] of [
    ['Left_Deck', 1, 0],
    ['Right_Deck', -1, specs.bankStaggerM],
  ] as const) {
    const deckGroup = new THREE.Group();
    deckGroup.name = `Boxer_${bankName}`;
    const deckZ = zSign * (specs.halfWidthM + specs.bankReachM);

    // Vertical CNC Milled Deck Surface Slab
    const deckSlabGeo = new THREE.BoxGeometry(deckLength, deckHeight, deckThickness);
    const deckSlabMesh = new THREE.Mesh(deckSlabGeo, materials.machinedDeckSurface);
    deckSlabMesh.position.set(staggerX, 0, deckZ);
    deckGroup.add(deckSlabMesh);

    // Combustion Chamber Fire Ring Seals & Water Passages
    for (let i = 0; i < specs.cylsPerBank; i++) {
      const cX = -halfLength + i * specs.boreSpacingM + staggerX;

      // Fire Ring Gasket Bead
      const fireRing = createFireRingGasketBead(specs.boreRadiusM, 0.0035, 0.002);
      fireRing.rotateY(Math.PI / 2);
      fireRing.translate(cX, 0, deckZ + zSign * (deckThickness / 2 + 0.001));
      const fireMesh = new THREE.Mesh(fireRing, materials.gasketChannel);
      deckGroup.add(fireMesh);

      // Coolant Port Holes (Top & Bottom of each bore)
      for (const ySign of [-1, 1]) {
        const portGeo = new THREE.CylinderGeometry(0.009, 0.009, deckThickness * 1.05, 16);
        portGeo.rotateX(Math.PI / 2);
        const portMesh = new THREE.Mesh(portGeo, materials.coolantJacketInterior);
        portMesh.position.set(cX, ySign * (specs.boreRadiusM + 0.016), deckZ);
        deckGroup.add(portMesh);
      }
    }

    // ARP 12-Point Head Studs (4 per cylinder)
    const studGeos: THREE.BufferGeometry[] = [];
    const studOffset = specs.boreRadiusM + 0.022;

    for (let i = 0; i <= specs.cylsPerBank; i++) {
      const sX = -halfLength - specs.boreSpacingM * 0.5 + i * specs.boreSpacingM + staggerX;

      for (const ySign of [-1, 1]) {
        const sY = ySign * studOffset;
        const stud = createThreadedStudWithNut(0.006, 0.055, 0.009, 0.010);
        stud.rotateX((zSign * Math.PI) / 2);
        stud.translate(sX, sY, deckZ + zSign * 0.024);
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
// 4. DRY-SUMP SCAVENGE TROUGHS & LUBRICATION SUITE
// ============================================================================

export function buildBoxerLubricationSuite(
  specs: BoxerBlockSpec,
  materials: V12BlockMaterialPalette
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Boxer_Lubrication_Subsystem';

  const halfLength = ((specs.cylsPerBank - 1) * specs.boreSpacingM) / 2;

  // Bottom Dry-Sump Scavenge Pan Trough
  const troughLength = specs.totalLengthM * 0.88;
  const troughWidth = specs.crankcaseWidthM * 0.85;
  const troughGeo = new THREE.BoxGeometry(troughLength, 0.024, troughWidth);
  const troughMesh = new THREE.Mesh(troughGeo, materials.machinedDeckSurface);
  troughMesh.position.set(0, -0.105, 0);
  group.add(troughMesh);

  // Dual Dry-Sump Scavenge Suction Tubes (Fore & Aft pickups)
  for (const xSign of [-1, 1]) {
    const pickupGroup = new THREE.Group();
    pickupGroup.position.set(xSign * (troughLength * 0.35), -0.118, 0);

    const tubeGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.038, 20);
    const tubeMesh = new THREE.Mesh(tubeGeo, materials.oilGalleryPassage);
    pickupGroup.add(tubeMesh);

    const strainerGeo = new THREE.CylinderGeometry(0.024, 0.020, 0.010, 24);
    strainerGeo.translate(0, -0.018, 0);
    const strainerMesh = new THREE.Mesh(strainerGeo, materials.arpHardenedFastener);
    pickupGroup.add(strainerMesh);

    group.add(pickupGroup);
  }

  // Piston Cooling Oil Squirt Jets (Aimed at opposing cylinder under-crowns)
  for (let i = 0; i < specs.cylsPerBank; i++) {
    for (const [zSign, staggerX] of [
      [1, 0],
      [-1, specs.bankStaggerM],
    ] as const) {
      const cX = -halfLength + i * specs.boreSpacingM + staggerX;
      const jetGroup = new THREE.Group();
      jetGroup.position.set(cX, 0.015, zSign * (specs.halfWidthM * 0.65));

      const nozzle = new THREE.CylinderGeometry(0.003, 0.002, 0.025, 12);
      nozzle.rotateX((zSign * Math.PI) / 3);
      const nMesh = new THREE.Mesh(nozzle, materials.brassFreezePlug);
      jetGroup.add(nMesh);

      group.add(jetGroup);
    }
  }

  return group;
}

// ============================================================================
// 5. COOLANT CROSSOVER MANIFOLDS & BRASS FREEZE PLUGS
// ============================================================================

export function buildBoxerCoolantSuite(
  specs: BoxerBlockSpec,
  materials: V12BlockMaterialPalette
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Boxer_Coolant_Subsystem';

  const halfLength = ((specs.cylsPerBank - 1) * specs.boreSpacingM) / 2;

  // Top Coolant Crossover Bridge Pipe (Connecting Left & Right Banks)
  const bridgeGeo = new THREE.CylinderGeometry(0.018, 0.018, specs.totalWidthM * 0.70, 24);
  bridgeGeo.rotateX(Math.PI / 2);
  const bridgeMesh = new THREE.Mesh(bridgeGeo, materials.castAluminumBlock);
  bridgeMesh.position.set(specs.totalLengthM * 0.32, 0.095, 0);
  group.add(bridgeMesh);

  // Thermostat Housing on front crossover
  const thermoGeo = new THREE.CylinderGeometry(0.034, 0.038, 0.045, 24);
  const thermoMesh = new THREE.Mesh(thermoGeo, materials.machinedDeckSurface);
  thermoMesh.position.set(specs.totalLengthM * 0.32, 0.125, 0);
  group.add(thermoMesh);

  // Brass Core Freeze Plugs along upper and lower cylinder bank barrels
  const plugRadius = 0.015;
  for (let i = 0; i < specs.cylsPerBank; i++) {
    for (const [zSign, staggerX] of [
      [1, 0],
      [-1, specs.bankStaggerM],
    ] as const) {
      const cX = -halfLength + i * specs.boreSpacingM + staggerX;

      for (const ySign of [-1, 1]) {
        const plugGroup = new THREE.Group();
        plugGroup.position.set(cX, ySign * 0.075, zSign * (specs.halfWidthM + specs.bankReachM * 0.50));

        const plugGeo = createCoreFreezePlug(plugRadius, 0.007, 0.0015);
        plugGeo.rotateX(ySign > 0 ? -Math.PI / 2 : Math.PI / 2);
        const plugMesh = new THREE.Mesh(plugGeo, materials.brassFreezePlug);
        plugGroup.add(plugMesh);

        group.add(plugGroup);
      }
    }
  }

  return group;
}

// ============================================================================
// 6. FRONT TIMING COVER & REAR BELLHOUSING HOUSINGS
// ============================================================================

export function buildBoxerEndFlangesSuite(
  specs: BoxerBlockSpec,
  materials: V12BlockMaterialPalette
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Boxer_End_Flanges_Subsystem';

  const frontX = specs.totalLengthM / 2;
  const rearX = -specs.totalLengthM / 2;

  // ── 6.1 Front Integrated Timing Gear Case ──
  const timingGroup = new THREE.Group();
  timingGroup.name = 'Front_Timing_Case';
  timingGroup.position.set(frontX, 0, 0);

  const timingPlateGeo = new THREE.BoxGeometry(0.022, 0.220, specs.totalWidthM * 0.78);
  const timingPlateMesh = new THREE.Mesh(timingPlateGeo, materials.machinedDeckSurface);
  timingGroup.add(timingPlateMesh);

  // Crankshaft Front Snout Oil Seal Bore
  const frontSeal = new THREE.CylinderGeometry(0.040, 0.040, 0.026, 32, 1, true);
  frontSeal.rotateZ(Math.PI / 2);
  const frontSealMesh = new THREE.Mesh(frontSeal, materials.nikasilCylinderBore);
  timingGroup.add(frontSealMesh);

  // Dual Camshaft Drive Idler Sprocket Mounting Hubs (Left & Right)
  for (const zSign of [-1, 1]) {
    const hubGeo = new THREE.CylinderGeometry(0.026, 0.026, 0.035, 24);
    hubGeo.rotateZ(Math.PI / 2);
    const hubMesh = new THREE.Mesh(hubGeo, materials.castAluminumBlock);
    hubMesh.position.set(0.015, 0.045, zSign * (specs.crankcaseWidthM * 0.65));
    timingGroup.add(hubMesh);
  }
  group.add(timingGroup);

  // ── 6.2 Rear Transaxle Bellhousing Flange ──
  const bellGroup = new THREE.Group();
  bellGroup.name = 'Rear_Bellhousing_Flange';
  bellGroup.position.set(rearX, 0, 0);

  const bellPlateGeo = new THREE.BoxGeometry(0.026, 0.260, specs.totalWidthM * 0.85);
  const bellPlateMesh = new THREE.Mesh(bellPlateGeo, materials.machinedDeckSurface);
  bellGroup.add(bellPlateMesh);

  // Rear Main Crankshaft Oil Seal
  const rearSeal = new THREE.CylinderGeometry(0.054, 0.054, 0.028, 32, 1, true);
  rearSeal.rotateZ(Math.PI / 2);
  const rearSealMesh = new THREE.Mesh(rearSeal, materials.nikasilCylinderBore);
  bellGroup.add(rearSealMesh);

  // 10 M10 Transaxle Mating Bolt Bosses & Fasteners
  const bellBoltGeos: THREE.BufferGeometry[] = [];
  for (let b = 0; b < 10; b++) {
    const angle = (b * Math.PI * 2) / 10;
    const bZ = Math.sin(angle) * (specs.totalWidthM * 0.38);
    const bY = Math.cos(angle) * 0.115;

    const bolt = create12PointHead(0.007, 0.009, 0.011, 0.003);
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
// 7. MASTER BOXER ENGINE BLOCK SCENE INTEGRATOR
// ============================================================================

export function buildBoxerBlockScene(config?: Partial<EngineConfig> | number): THREE.Scene {
  const scene = new THREE.Scene();
  scene.name = 'Boxer_Engine_Block_Scene';

  const rootGroup = new THREE.Group();
  rootGroup.name = 'Boxer_Engine_Block_Master';
  scene.add(rootGroup);

  let totalCyls = 6;
  if (typeof config === 'number') {
    totalCyls = config;
  } else if (config?.layout) {
    totalCyls = config.layout === 'boxer4' ? 4 : 6;
  }

  const specs = computeBoxerSpecs(totalCyls);
  const materials = createBlockMaterialPalette(typeof config === 'object' ? config : undefined);

  // 1. Split-Case Crankcase Halves & Central Through-Bolts
  const splitCase = buildBoxerSplitCaseCrankcase(specs, materials);
  rootGroup.add(splitCase);

  // 2. Horizontally Opposed Cylinder Banks & Liners
  const cylinderBanks = buildBoxerCylinderBanks(specs, materials);
  rootGroup.add(cylinderBanks);

  // 3. Opposed CNC Cylinder Decks & Head Studs
  const decks = buildBoxerCylinderDecks(specs, materials);
  rootGroup.add(decks);

  // 4. Dry-Sump Scavenge & Lubrication Suite
  const lubeSuite = buildBoxerLubricationSuite(specs, materials);
  rootGroup.add(lubeSuite);

  // 5. Coolant Crossover Manifolds & Freeze Plugs
  const coolantSuite = buildBoxerCoolantSuite(specs, materials);
  rootGroup.add(coolantSuite);

  // 6. Front Timing & Rear Bellhousing Flanges
  const endFlanges = buildBoxerEndFlangesSuite(specs, materials);
  rootGroup.add(endFlanges);

  return scene;
}

export default buildBoxerBlockScene;
