// ============================================================================
// ULTRA-HIGH-FIDELITY MODULAR GLB GENERATOR — INLINE ENGINE BLOCK (I3 / I4 / I6)
// ============================================================================
// Solid-modeling engineering generator for high-performance inline engine blocks.
// Features deep-skirt A356-T6 cast aluminum block with ductile iron liners,
// CNC milled mono-deck, 4-bolt cross-bolted main bearing caps with ARP fasteners,
// pressurized longitudinal oil gallery with piston cooling squirt jets, multi-pass
// side coolant water jackets with brass freeze plugs, front integrated timing case,
// and rear transaxle bellhousing flange with starter motor pocket.
// ============================================================================

import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import type { EngineConfig } from '../../sim/types';
import { globalMaterialLibrary } from '../materials/pbrMaterialSystem';
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

export interface InlineBlockSpec {
  cylinderCount: number; // 3, 4, or 6
  boreDiameterMm: number; // 86.0 mm standard bore
  boreRadiusM: number; // 0.043 m
  boreSpacingMm: number; // 96.0 mm bore center-to-center
  boreSpacingM: number; // 0.096 m
  deckHeightMm: number; // 225.0 mm deck height
  deckHeightM: number; // 0.225 m
  deckThicknessM: number; // 0.018 m
  blockWidthM: number; // 0.240 m
  totalLengthM: number; // dynamically computed
  crankJournalDiameterMm: number; // 55.0 mm
  crankJournalRadiusM: number; // 0.0275 m
  skirtDepthMm: number; // 65.0 mm deep skirt below crank centerline
  skirtDepthM: number; // 0.065 m
}

export function computeInlineBlockSpecs(cylCount: number = 4): InlineBlockSpec {
  const count = Math.max(3, Math.min(6, cylCount));
  const boreSpacingM = 0.096;
  const frontMarginM = 0.065;
  const rearMarginM = 0.075;
  const totalLengthM = (count - 1) * boreSpacingM + frontMarginM + rearMarginM;

  return {
    cylinderCount: count,
    boreDiameterMm: 86.0,
    boreRadiusM: 0.043,
    boreSpacingMm: 96.0,
    boreSpacingM,
    deckHeightMm: 225.0,
    deckHeightM: 0.225,
    deckThicknessM: 0.018,
    blockWidthM: 0.240,
    totalLengthM,
    crankJournalDiameterMm: 55.0,
    crankJournalRadiusM: 0.0275,
    skirtDepthMm: 65.0,
    skirtDepthM: 0.065,
  };
}

// ============================================================================
// 1. INLINE CYLINDER LINERS & MONOLITHIC BORES
// ============================================================================

export function buildInlineCylinderLiners(
  specs: InlineBlockSpec,
  materials: V12BlockMaterialPalette
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Inline_Cylinder_Liners_Subsystem';

  const halfLength = ((specs.cylinderCount - 1) * specs.boreSpacingM) / 2;
  const linerHeight = specs.deckHeightM * 0.88;
  const wallThickness = 0.0055; // 5.5mm ductile iron liner wall

  for (let i = 0; i < specs.cylinderCount; i++) {
    const cylX = -halfLength + i * specs.boreSpacingM;
    const cylGroup = new THREE.Group();
    cylGroup.name = `Inline_Cylinder_Liner_${i + 1}`;
    cylGroup.position.set(cylX, specs.deckHeightM / 2 - 0.015, 0);

    // Outer liner sleeve
    const outerGeo = new THREE.CylinderGeometry(
      specs.boreRadiusM + wallThickness,
      specs.boreRadiusM + wallThickness,
      linerHeight,
      32,
      1,
      true
    );
    const outerMesh = new THREE.Mesh(outerGeo, materials.castAluminumBlock);
    cylGroup.add(outerMesh);

    // Inner honed Nikasil bore sleeve
    const innerGeo = new THREE.CylinderGeometry(
      specs.boreRadiusM,
      specs.boreRadiusM,
      linerHeight + 0.0005,
      32,
      1,
      true
    );
    const innerMesh = new THREE.Mesh(innerGeo, materials.nikasilCylinderBore);
    cylGroup.add(innerMesh);

    // Top chamfer fire ring collar
    const collarGeo = createFireRingGasketBead(specs.boreRadiusM, 0.0035, 0.0018);
    const collarMesh = new THREE.Mesh(collarGeo, materials.gasketChannel);
    collarMesh.position.set(0, linerHeight / 2, 0);
    cylGroup.add(collarMesh);

    // Bottom Siamese sipe cooling slot
    if (i < specs.cylinderCount - 1) {
      const sipeGeo = new THREE.BoxGeometry(0.012, linerHeight * 0.45, 0.006);
      const sipeMesh = new THREE.Mesh(sipeGeo, materials.coolantJacketInterior);
      sipeMesh.position.set(specs.boreSpacingM / 2, -linerHeight * 0.15, 0);
      cylGroup.add(sipeMesh);
    }

    group.add(cylGroup);
  }

  return group;
}

// ============================================================================
// 2. CNC MILLED MONO-DECK, HEAD STUD PILLARS & DOWELS
// ============================================================================

export function buildInlineCylinderDeckSuite(
  specs: InlineBlockSpec,
  materials: V12BlockMaterialPalette
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Inline_Cylinder_Deck_Subsystem';

  const deckLength = specs.totalLengthM * 0.98;
  const deckWidth = specs.blockWidthM * 0.85;

  // CNC Milled Top Deck Slab
  const deckGeo = new THREE.BoxGeometry(deckLength, specs.deckThicknessM, deckWidth);
  const deckMesh = new THREE.Mesh(deckGeo, materials.machinedDeckSurface);
  deckMesh.position.set(0, specs.deckHeightM - specs.deckThicknessM / 2, 0);
  deckMesh.receiveShadow = true;
  group.add(deckMesh);

  // Perimeter Head Stud Columns & ARP Hardware
  const halfLength = ((specs.cylinderCount - 1) * specs.boreSpacingM) / 2;
  const studOffsetZ = specs.boreRadiusM + 0.024;

  const studGeos: THREE.BufferGeometry[] = [];
  const pillarGeos: THREE.BufferGeometry[] = [];

  for (let i = 0; i <= specs.cylinderCount; i++) {
    const xPos = -halfLength - specs.boreSpacingM * 0.5 + i * specs.boreSpacingM;

    for (const zSign of [-1, 1]) {
      const zPos = zSign * studOffsetZ;

      // Solid structural casting pillar beneath deck
      const pillar = new THREE.CylinderGeometry(0.014, 0.016, specs.deckHeightM * 0.85, 16);
      pillar.translate(xPos, specs.deckHeightM * 0.5, zPos);
      pillarGeos.push(pillar);

      // ARP 12-point head stud extending above deck
      const stud = createThreadedStudWithNut(0.006, 0.045, 0.009, 0.010);
      stud.translate(xPos, specs.deckHeightM + 0.020, zPos);
      studGeos.push(stud);
    }
  }

  if (pillarGeos.length > 0) {
    const mergedPillars = mergeBufferGeometries(pillarGeos);
    const pillarsMesh = new THREE.Mesh(mergedPillars, materials.castAluminumBlock);
    group.add(pillarsMesh);
  }

  if (studGeos.length > 0) {
    const mergedStuds = mergeBufferGeometries(studGeos);
    const studsMesh = new THREE.Mesh(mergedStuds, materials.arpHardenedFastener);
    studsMesh.castShadow = true;
    group.add(studsMesh);
  }

  // Precision Hollow Alignment Dowel Pins (Front & Rear Deck Corners)
  for (const [dx, dz] of [
    [-deckLength * 0.46, -deckWidth * 0.42],
    [deckLength * 0.46, deckWidth * 0.42],
  ]) {
    const dowelGeo = createAlignmentDowel(0.007, 0.018);
    const dowelMesh = new THREE.Mesh(dowelGeo, materials.machinedDeckSurface);
    dowelMesh.position.set(dx, specs.deckHeightM + 0.008, dz);
    group.add(dowelMesh);
  }

  // Coolant Transfer Orifices between cylinders
  for (let i = 0; i < specs.cylinderCount; i++) {
    const cX = -halfLength + i * specs.boreSpacingM;
    for (const cZ of [-deckWidth * 0.32, deckWidth * 0.32]) {
      const holeGeo = new THREE.CylinderGeometry(0.008, 0.008, specs.deckThicknessM * 1.05, 16);
      const holeMesh = new THREE.Mesh(holeGeo, materials.coolantJacketInterior);
      holeMesh.position.set(cX, specs.deckHeightM - specs.deckThicknessM / 2, cZ);
      group.add(holeMesh);
    }
  }

  return group;
}

// ============================================================================
// 3. DEEP-SKIRT CRANKCASE, CROSS-BOLTED MAIN BEARING CAPS & OIL PAN RAIL
// ============================================================================

export function buildInlineCrankcaseSuite(
  specs: InlineBlockSpec,
  materials: V12BlockMaterialPalette
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Inline_Crankcase_Subsystem';

  const bulkheadCount = specs.cylinderCount + 1; // 4 for I3, 5 for I4, 7 for I6
  const halfLength = ((specs.cylinderCount - 1) * specs.boreSpacingM) / 2;

  // Outer Deep-Skirt Block Casting Walls (Intake & Exhaust Sides)
  const wallThickness = 0.016;
  const skirtHeight = specs.deckHeightM + specs.skirtDepthM;

  for (const zSign of [-1, 1]) {
    const wallGeo = new THREE.BoxGeometry(specs.totalLengthM, skirtHeight, wallThickness);
    const wallMesh = new THREE.Mesh(wallGeo, materials.castAluminumBlock);
    wallMesh.position.set(
      0,
      specs.deckHeightM / 2 - specs.skirtDepthM / 2,
      zSign * (specs.blockWidthM / 2 - wallThickness / 2)
    );
    wallMesh.castShadow = true;
    wallMesh.receiveShadow = true;
    group.add(wallMesh);
  }

  // Oil Pan Flange Perimeter Rail (with M6 tapped fastener holes)
  const railWidth = 0.024;
  const railHeight = 0.014;
  const railGeo = new THREE.BoxGeometry(specs.totalLengthM * 1.04, railHeight, specs.blockWidthM * 1.04);
  const railMesh = new THREE.Mesh(railGeo, materials.machinedDeckSurface);
  railMesh.position.set(0, -specs.skirtDepthM - railHeight / 2, 0);
  group.add(railMesh);

  // M6 Oil Pan Flange Hex Fasteners along bottom perimeter
  const fastenerGeos: THREE.BufferGeometry[] = [];
  const boltCountX = Math.floor(specs.totalLengthM / 0.055);
  for (let b = 0; b <= boltCountX; b++) {
    const bX = -specs.totalLengthM / 2 + b * (specs.totalLengthM / boltCountX);
    for (const bZ of [-specs.blockWidthM / 2, specs.blockWidthM / 2]) {
      const bolt = createHexBoltHead(0.005, 0.007);
      bolt.rotateX(Math.PI);
      bolt.translate(bX, -specs.skirtDepthM - railHeight - 0.003, bZ);
      fastenerGeos.push(bolt);
    }
  }

  if (fastenerGeos.length > 0) {
    const mergedFasteners = mergeBufferGeometries(fastenerGeos);
    const fastenersMesh = new THREE.Mesh(mergedFasteners, materials.arpHardenedFastener);
    group.add(fastenersMesh);
  }

  // Heavy-Duty Cross-Bolted Main Bearing Bulkheads & Caps
  for (let b = 0; b < bulkheadCount; b++) {
    const bX = -halfLength - specs.boreSpacingM * 0.5 + b * specs.boreSpacingM;

    // Upper Bulkhead Saddle Casting (Integrated in upper block)
    const upperBulkheadGeo = new THREE.BoxGeometry(specs.blockWidthM * 0.90, specs.deckHeightM * 0.55, 0.028);
    const upperMesh = new THREE.Mesh(upperBulkheadGeo, materials.castAluminumBlock);
    upperMesh.position.set(bX, specs.deckHeightM * 0.28, 0);
    group.add(upperMesh);

    // Main Journal Semicircular Bearing Shell Half
    const journalGeo = new THREE.CylinderGeometry(
      specs.crankJournalRadiusM,
      specs.crankJournalRadiusM,
      0.028,
      28,
      1,
      true
    );
    journalGeo.rotateZ(Math.PI / 2);
    const journalMesh = new THREE.Mesh(journalGeo, materials.machinedDeckSurface);
    journalMesh.position.set(bX, 0, 0);
    group.add(journalMesh);

    // Removable 4-Bolt Cross-Bolted Lower Main Bearing Cap
    const capGeo = createMainBearingCap(
      specs.blockWidthM * 0.65,
      specs.skirtDepthM * 0.85,
      0.026,
      specs.crankJournalRadiusM,
      true
    );
    const capMesh = new THREE.Mesh(capGeo, materials.machinedDeckSurface);
    capMesh.position.set(bX, 0, 0);
    group.add(capMesh);
  }

  return group;
}

// ============================================================================
// 4. LUBRICATION GALLERY CIRCUIT & PISTON COOLING SQUIRT JETS
// ============================================================================

export function buildInlineOilGalleryCircuit(
  specs: InlineBlockSpec,
  materials: V12BlockMaterialPalette
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Inline_Oil_Gallery_Subsystem';

  const galleryLength = specs.totalLengthM * 0.96;
  const rifleRadius = 0.008; // 16mm main longitudinal rifle bore
  const halfLength = ((specs.cylinderCount - 1) * specs.boreSpacingM) / 2;

  // Main Longitudinal High-Pressure Oil Rifle Pipe (Exhaust Flank)
  const rifleGeo = new THREE.CylinderGeometry(rifleRadius, rifleRadius, galleryLength, 20);
  rifleGeo.rotateZ(Math.PI / 2);
  const rifleMesh = new THREE.Mesh(rifleGeo, materials.oilGalleryPassage);
  rifleMesh.position.set(0, specs.deckHeightM * 0.40, specs.blockWidthM * 0.32);
  group.add(rifleMesh);

  // Front & Rear Gallery Threaded Service Plugs (NPT Allen Hex)
  for (const xSign of [-1, 1]) {
    const plugGeo = createAllenSocketHead(0.010, 0.008);
    plugGeo.rotateZ((xSign * Math.PI) / 2);
    const plugMesh = new THREE.Mesh(plugGeo, materials.arpHardenedFastener);
    plugMesh.position.set(xSign * (galleryLength / 2 + 0.004), specs.deckHeightM * 0.40, specs.blockWidthM * 0.32);
    group.add(plugMesh);
  }

  // Cross-Drilled Feeder Passages to Main Bearing Journals
  for (let b = 0; b <= specs.cylinderCount; b++) {
    const bX = -halfLength - specs.boreSpacingM * 0.5 + b * specs.boreSpacingM;
    const drillLength = specs.blockWidthM * 0.35;

    const drillGeo = new THREE.CylinderGeometry(0.004, 0.004, drillLength, 12);
    drillGeo.rotateX(Math.PI / 3);
    const drillMesh = new THREE.Mesh(drillGeo, materials.oilGalleryPassage);
    drillMesh.position.set(bX, specs.deckHeightM * 0.20, specs.blockWidthM * 0.16);
    group.add(drillMesh);
  }

  // Brass Piston Cooling Oil Squirt Nozzles (Targeting under-crown of each cylinder)
  for (let i = 0; i < specs.cylinderCount; i++) {
    const cX = -halfLength + i * specs.boreSpacingM;
    const squirtGroup = new THREE.Group();
    squirtGroup.name = `Piston_Oil_Jet_${i + 1}`;
    squirtGroup.position.set(cX, 0.025, specs.boreRadiusM * 0.65);

    // Brass Banjo Body
    const banjoGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.010, 16);
    const banjoMesh = new THREE.Mesh(banjoGeo, materials.brassFreezePlug);
    squirtGroup.add(banjoMesh);

    // Angled Aimed Spray Nozzle Wand
    const wandGeo = new THREE.CylinderGeometry(0.002, 0.0015, 0.028, 12);
    wandGeo.rotateX(-Math.PI / 4);
    wandGeo.translate(0, 0.012, -0.008);
    const wandMesh = new THREE.Mesh(wandGeo, materials.brassFreezePlug);
    squirtGroup.add(wandMesh);

    // M8 Banjo Retaining Bolt
    const banjoBolt = createHexBoltHead(0.005, 0.006);
    banjoBolt.translate(0, 0.006, 0);
    const boltMesh = new THREE.Mesh(banjoBolt, materials.arpHardenedFastener);
    squirtGroup.add(boltMesh);

    group.add(squirtGroup);
  }

  return group;
}

// ============================================================================
// 5. SIDE WATER JACKET CAVITY & BRASS CORE FREEZE PLUGS
// ============================================================================

export function buildInlineCoolantJacketSuite(
  specs: InlineBlockSpec,
  materials: V12BlockMaterialPalette
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Inline_Coolant_Jacket_Subsystem';

  const halfLength = ((specs.cylinderCount - 1) * specs.boreSpacingM) / 2;
  const jacketLength = specs.totalLengthM * 0.90;
  const jacketHeight = specs.deckHeightM * 0.65;

  // External Water Jacket Bulge Castings (Intake & Exhaust Flanks)
  for (const zSign of [-1, 1]) {
    const jacketGeo = new THREE.BoxGeometry(jacketLength, jacketHeight, 0.022);
    const jacketMesh = new THREE.Mesh(jacketGeo, materials.castAluminumBlock);
    jacketMesh.position.set(0, specs.deckHeightM * 0.55, zSign * (specs.blockWidthM * 0.42));
    group.add(jacketMesh);
  }

  // Deep-Cup Brass Core Freeze Plugs (Casting Sand Evacuation Ports)
  const plugRadius = 0.016; // 32mm core freeze plug
  for (let i = 0; i < specs.cylinderCount; i++) {
    const cX = -halfLength + i * specs.boreSpacingM;

    for (const zSign of [-1, 1]) {
      const plugGroup = new THREE.Group();
      plugGroup.position.set(cX, specs.deckHeightM * 0.50, zSign * (specs.blockWidthM * 0.42 + 0.011));

      // Precision machined counterbore ring
      const boreRing = new THREE.CylinderGeometry(plugRadius + 0.003, plugRadius + 0.003, 0.004, 24);
      boreRing.rotateX(Math.PI / 2);
      const ringMesh = new THREE.Mesh(boreRing, materials.machinedDeckSurface);
      plugGroup.add(ringMesh);

      // Brass freeze plug cup
      const plugGeo = createCoreFreezePlug(plugRadius, 0.008, 0.0015);
      plugGeo.rotateX(zSign > 0 ? Math.PI / 2 : -Math.PI / 2);
      const plugMesh = new THREE.Mesh(plugGeo, materials.brassFreezePlug);
      plugGroup.add(plugMesh);

      group.add(plugGroup);
    }
  }

  // Front Water Pump Scroll Volute Housing
  const pumpGroup = new THREE.Group();
  pumpGroup.name = 'Front_Water_Pump_Scroll';
  pumpGroup.position.set(specs.totalLengthM / 2 + 0.012, specs.deckHeightM * 0.48, specs.blockWidthM * 0.22);

  const scrollGeo = new THREE.CylinderGeometry(0.048, 0.054, 0.028, 28);
  scrollGeo.rotateZ(Math.PI / 2);
  const scrollMesh = new THREE.Mesh(scrollGeo, materials.castAluminumBlock);
  pumpGroup.add(scrollMesh);

  // Water pump inlet snout with hose bead
  const snoutGeo = new THREE.CylinderGeometry(0.020, 0.020, 0.038, 24);
  snoutGeo.rotateX(Math.PI / 3);
  snoutGeo.translate(0, -0.010, 0.022);
  const snoutMesh = new THREE.Mesh(snoutGeo, materials.machinedDeckSurface);
  pumpGroup.add(snoutMesh);

  // 6 perimeter M6 mounting bosses
  for (let p = 0; p < 6; p++) {
    const angle = (p * Math.PI * 2) / 6;
    const pZ = Math.sin(angle) * 0.042;
    const pY = Math.cos(angle) * 0.042;
    const bossGeo = createHexBoltHead(0.005, 0.008);
    bossGeo.rotateZ(Math.PI / 2);
    bossGeo.translate(0.015, pY, pZ);
    const bossMesh = new THREE.Mesh(bossGeo, materials.arpHardenedFastener);
    pumpGroup.add(bossMesh);
  }
  group.add(pumpGroup);

  return group;
}

// ============================================================================
// 6. STRUCTURAL LATTICE WEBBING & STARTER MOTOR CRADLE
// ============================================================================

export function buildInlineStructuralWebbingSuite(
  specs: InlineBlockSpec,
  materials: V12BlockMaterialPalette
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Inline_Structural_Webbing_Subsystem';

  const halfLength = ((specs.cylinderCount - 1) * specs.boreSpacingM) / 2;
  const webGeos: THREE.BufferGeometry[] = [];

  // Triangulated Gusset Ribs bridging cylinder bores to skirt rails
  for (let i = 0; i <= specs.cylinderCount; i++) {
    const wX = -halfLength - specs.boreSpacingM * 0.5 + i * specs.boreSpacingM;

    for (const zSign of [-1, 1]) {
      // 45-degree diagonal triangular brace
      const rib = new THREE.BoxGeometry(0.012, specs.deckHeightM * 0.45, 0.038);
      rib.rotateZ(Math.PI / 6);
      rib.translate(wX, specs.deckHeightM * 0.28, zSign * (specs.blockWidthM * 0.35));
      webGeos.push(rib);
    }
  }

  // Knock Sensor Threaded Resonance Bosses (M8 x 1.25)
  const sensorCount = specs.cylinderCount >= 4 ? 2 : 1;
  for (let k = 0; k < sensorCount; k++) {
    const kX = -halfLength * 0.5 + k * halfLength;
    const bossGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.024, 20);
    bossGeo.rotateX(Math.PI / 2);
    bossGeo.translate(kX, specs.deckHeightM * 0.52, -specs.blockWidthM * 0.44);
    webGeos.push(bossGeo);

    const holeGeo = createAllenSocketHead(0.008, 0.012);
    holeGeo.rotateX(Math.PI / 2);
    holeGeo.translate(kX, specs.deckHeightM * 0.52, -specs.blockWidthM * 0.44 - 0.008);
    webGeos.push(holeGeo);
  }

  if (webGeos.length > 0) {
    const mergedWebs = mergeBufferGeometries(webGeos);
    const websMesh = new THREE.Mesh(mergedWebs, materials.castAluminumBlock);
    websMesh.castShadow = true;
    group.add(websMesh);
  }

  // Starter Motor Pocket & Machined Mounting Ears (Rear Intake Lower Flank)
  const starterPocketGroup = new THREE.Group();
  starterPocketGroup.name = 'Starter_Motor_Pocket';
  starterPocketGroup.position.set(-specs.totalLengthM * 0.38, -specs.skirtDepthM * 0.25, -specs.blockWidthM * 0.42);

  const pocketCyl = new THREE.CylinderGeometry(0.046, 0.046, 0.075, 24);
  pocketCyl.rotateZ(Math.PI / 2);
  const pocketMesh = new THREE.Mesh(pocketCyl, materials.castAluminumBlock);
  starterPocketGroup.add(pocketMesh);

  // Dual M10 tapped mounting ears
  for (const ey of [-0.038, 0.038]) {
    const earGeo = new THREE.BoxGeometry(0.018, 0.026, 0.022);
    const earMesh = new THREE.Mesh(earGeo, materials.machinedDeckSurface);
    earMesh.position.set(-0.038, ey, 0.028);
    starterPocketGroup.add(earMesh);

    const bolt = create12PointHead(0.007, 0.008);
    bolt.rotateZ(Math.PI / 2);
    const bMesh = new THREE.Mesh(bolt, materials.arpHardenedFastener);
    bMesh.position.set(-0.046, ey, 0.028);
    starterPocketGroup.add(bMesh);
  }
  group.add(starterPocketGroup);

  return group;
}

// ============================================================================
// 7. FRONT TIMING CHAIN CASE & REAR TRANSAXLE BELLHOUSING FLANGES
// ============================================================================

export function buildInlineEndFlangesSuite(
  specs: InlineBlockSpec,
  materials: V12BlockMaterialPalette
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Inline_End_Flanges_Subsystem';

  const frontX = specs.totalLengthM / 2;
  const rearX = -specs.totalLengthM / 2;
  const flangeHeight = specs.deckHeightM + specs.skirtDepthM;

  // ── 7.1 Front Timing Chain Case Flange ──
  const timingGroup = new THREE.Group();
  timingGroup.name = 'Front_Timing_Case_Flange';
  timingGroup.position.set(frontX, specs.deckHeightM / 2 - specs.skirtDepthM / 2, 0);

  const frontPlateGeo = new THREE.BoxGeometry(0.018, flangeHeight, specs.blockWidthM * 0.94);
  const frontPlateMesh = new THREE.Mesh(frontPlateGeo, materials.machinedDeckSurface);
  timingGroup.add(frontPlateMesh);

  // Crankshaft Front Snout Oil Seal Bore
  const sealBoreGeo = new THREE.CylinderGeometry(0.038, 0.038, 0.022, 32, 1, true);
  sealBoreGeo.rotateZ(Math.PI / 2);
  const sealMesh = new THREE.Mesh(sealBoreGeo, materials.nikasilCylinderBore);
  sealMesh.position.set(0, -specs.deckHeightM / 2 + specs.skirtDepthM / 2, 0);
  timingGroup.add(sealMesh);

  // Timing Cover Perimeter M6 Bolts (10 Fasteners)
  const timingBoltGeos: THREE.BufferGeometry[] = [];
  for (let b = 0; b < 10; b++) {
    const angle = (b * Math.PI * 2) / 10;
    const bZ = Math.sin(angle) * (specs.blockWidthM * 0.40);
    const bY = Math.cos(angle) * (flangeHeight * 0.42);

    const bolt = createAllenSocketHead(0.005, 0.008);
    bolt.rotateZ(Math.PI / 2);
    bolt.translate(0.010, bY, bZ);
    timingBoltGeos.push(bolt);
  }
  if (timingBoltGeos.length > 0) {
    const mergedT = mergeBufferGeometries(timingBoltGeos);
    const tMesh = new THREE.Mesh(mergedT, materials.arpHardenedFastener);
    timingGroup.add(tMesh);
  }
  group.add(timingGroup);

  // ── 7.2 Rear Transmission Bellhousing Flange ──
  const bellGroup = new THREE.Group();
  bellGroup.name = 'Rear_Bellhousing_Flange';
  bellGroup.position.set(rearX, specs.deckHeightM / 2 - specs.skirtDepthM / 2, 0);

  const bellPlateGeo = new THREE.BoxGeometry(0.024, flangeHeight * 1.08, specs.blockWidthM * 1.12);
  const bellPlateMesh = new THREE.Mesh(bellPlateGeo, materials.machinedDeckSurface);
  bellGroup.add(bellPlateMesh);

  // Rear Crankshaft Main Seal Retainer Plate
  const rearSealGeo = new THREE.CylinderGeometry(0.052, 0.052, 0.026, 32, 1, true);
  rearSealGeo.rotateZ(Math.PI / 2);
  const rearSealMesh = new THREE.Mesh(rearSealGeo, materials.nikasilCylinderBore);
  rearSealMesh.position.set(0, -specs.deckHeightM / 2 + specs.skirtDepthM / 2, 0);
  bellGroup.add(rearSealMesh);

  // 10 Heavy-Duty M10 Bellhousing Transmission Bolt Bosses
  const bellBoltGeos: THREE.BufferGeometry[] = [];
  for (let b = 0; b < 10; b++) {
    const angle = (b * Math.PI * 2) / 10;
    const bZ = Math.sin(angle) * (specs.blockWidthM * 0.50);
    const bY = Math.cos(angle) * (flangeHeight * 0.48);

    const boss = new THREE.CylinderGeometry(0.012, 0.012, 0.028, 16);
    boss.rotateZ(Math.PI / 2);
    boss.translate(-0.006, bY, bZ);
    bellBoltGeos.push(boss);

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
// 8. MASTER INLINE ENGINE BLOCK SCENE INTEGRATOR
// ============================================================================

export function buildInlineBlockScene(config?: Partial<EngineConfig> | number): THREE.Scene {
  const scene = new THREE.Scene();
  scene.name = 'Inline_Engine_Block_Scene';

  const rootGroup = new THREE.Group();
  rootGroup.name = 'Inline_Engine_Block_Master';
  scene.add(rootGroup);

  let cylCount = 4;
  if (typeof config === 'number') {
    cylCount = config;
  } else if (config?.layout) {
    cylCount = config.layout === 'i3' ? 3 : config.layout === 'i6' ? 6 : 4;
  }

  const specs = computeInlineBlockSpecs(cylCount);
  const materials = createBlockMaterialPalette(typeof config === 'object' ? config : undefined);

  // 1. Cylinder Liners & Nikasil Bores
  const liners = buildInlineCylinderLiners(specs, materials);
  rootGroup.add(liners);

  // 2. CNC Mono-Deck & Head Stud Pillars
  const deckSuite = buildInlineCylinderDeckSuite(specs, materials);
  rootGroup.add(deckSuite);

  // 3. Deep-Skirt Crankcase & Main Bearing Bulkheads
  const crankcase = buildInlineCrankcaseSuite(specs, materials);
  rootGroup.add(crankcase);

  // 4. Lubrication Gallery & Oil Squirt Jets
  const oilCircuit = buildInlineOilGalleryCircuit(specs, materials);
  rootGroup.add(oilCircuit);

  // 5. Water Jackets, Freeze Plugs & Water Pump Scroll
  const coolantSystem = buildInlineCoolantJacketSuite(specs, materials);
  rootGroup.add(coolantSystem);

  // 6. Structural Webbing & Starter Cradle
  const structuralWebbing = buildInlineStructuralWebbingSuite(specs, materials);
  rootGroup.add(structuralWebbing);

  // 7. Front Timing & Rear Bellhousing Flanges
  const endFlanges = buildInlineEndFlangesSuite(specs, materials);
  rootGroup.add(endFlanges);

  return scene;
}

export default buildInlineBlockScene;
