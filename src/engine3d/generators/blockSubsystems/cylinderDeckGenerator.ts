// ============================================================================
// MODULAR GLB GENERATOR — 60° V12 CNC CYLINDER HEAD DECK & STUD PILLARS
// ============================================================================
// Solid-modeling generator for the CNC fly-cut machined cylinder head decks,
// 28 high-tensile M11 head stud casting pillars with countersunk hex sockets,
// 4 hardened steel ground locator dowel pins, laser-etched firing order stamps,
// and precision gasket fire-ring compression receivers.
// ============================================================================

import * as THREE from 'three';
import type { V12BlockMaterialPalette } from '../engineBlockGenerator';

// ============================================================================
// 1. CYLINDER HEAD DECK SPECIFICATION CONSTANTS
// ============================================================================

export interface CylinderDeckSpec {
  deckLengthMm: number; // 670.0 mm bank deck plate length
  deckLengthM: number; // 0.670 m
  deckWidthMm: number; // 195.0 mm deck plate width
  deckWidthM: number; // 0.195 m
  deckThicknessMm: number; // 22.0 mm thick reinforced structural deck
  deckThicknessM: number; // 0.022 m
  headStudThread: 'M11x1.25 ARP Ultra 2000';
  headStudDiameterMm: number; // 11.0 mm stud thread diameter
  headStudRadiusM: number; // 0.0055 m
  headStudBossDiameterMm: number; // 20.0 mm casting pillar boss diameter
  headStudBossRadiusM: number; // 0.010 m
  headStudCountPerBank: number; // 14 studs per bank (28 total)
  dowelPinDiameterMm: number; // 14.0 mm precision ground hollow locator dowels
  dowelPinRadiusM: number; // 0.007 m
  dowelPinHeightMm: number; // 18.0 mm protruding dowel height
  dowelPinHeightM: number; // 0.018 m
}

export const V12_DECK_SPECS: CylinderDeckSpec = {
  deckLengthMm: 670.0,
  deckLengthM: 0.670,
  deckWidthMm: 195.0,
  deckWidthM: 0.195,
  deckThicknessMm: 22.0,
  deckThicknessM: 0.022,
  headStudThread: 'M11x1.25 ARP Ultra 2000',
  headStudDiameterMm: 11.0,
  headStudRadiusM: 0.0055,
  headStudBossDiameterMm: 20.0,
  headStudBossRadiusM: 0.010,
  headStudCountPerBank: 14,
  dowelPinDiameterMm: 14.0,
  dowelPinRadiusM: 0.007,
  dowelPinHeightMm: 18.0,
  dowelPinHeightM: 0.018,
};

// ============================================================================
// 2. BANK DECK PLATE & STUD PILLAR BUILDER
// ============================================================================

export interface BankDeckConfig {
  bank: 'left' | 'right';
  spec: CylinderDeckSpec;
}

/**
 * Builds the complete machined top cylinder head deck plate assembly for one bank.
 */
export function buildSingleBankDeck(
  config: BankDeckConfig,
  materials: V12BlockMaterialPalette
): THREE.Group {
  const { bank, spec } = config;
  const isLeft = bank === 'left';
  const bankName = isLeft ? 'Bank_1_Left' : 'Bank_2_Right';
  const tiltAngle = isLeft ? -Math.PI / 6 : Math.PI / 6;
  const xOffset = isLeft ? 0 : 0.015;

  const group = new THREE.Group();
  group.name = `${bankName}_Machined_Deck_Plate_Assembly`;
  group.position.set(xOffset, isLeft ? 0.11 : -0.11, 0.22);
  group.rotation.x = tiltAngle;

  // ── A. CNC Fly-Cut Machined Top Deck Plate Surface ──
  const deckGeo = new THREE.BoxGeometry(
    spec.deckLengthM,
    spec.deckWidthM,
    spec.deckThicknessM
  );
  const deckMesh = new THREE.Mesh(deckGeo, materials.machinedDeckSurface);
  deckMesh.name = `${bankName}_CNC_Deck_Slab`;
  deckMesh.position.set(0, 0, 0.108);
  deckMesh.castShadow = true;
  deckMesh.receiveShadow = true;
  group.add(deckMesh);

  // ── B. 14 High-Tensile Head Stud Casting Pillars & Threaded Sockets ──
  const studBossGeo = new THREE.CylinderGeometry(
    spec.headStudBossRadiusM,
    spec.headStudBossRadiusM + 0.002,
    0.045,
    20
  );
  studBossGeo.rotateX(Math.PI / 2);

  const socketGeo = new THREE.CylinderGeometry(
    spec.headStudRadiusM,
    spec.headStudRadiusM,
    0.050,
    16
  );
  socketGeo.rotateX(Math.PI / 2);

  const counterboreGeo = new THREE.CylinderGeometry(
    spec.headStudRadiusM + 0.002,
    spec.headStudRadiusM + 0.002,
    0.008,
    16
  );
  counterboreGeo.rotateX(Math.PI / 2);

  // 7 pairs of intake/exhaust head stud bosses along the bank
  for (let s = 0; s < 7; s++) {
    const sx = -0.32 + s * (0.64 / 6);

    // Intake row (+Y or -Y) and Exhaust row
    [-0.082, 0.082].forEach((sy, rowIdx) => {
      const isExhaust = rowIdx === 1;
      const studGroup = new THREE.Group();
      studGroup.name = `${bankName}_Head_Stud_Pillar_${s + 1}_${isExhaust ? 'Ex' : 'In'}`;
      studGroup.position.set(sx, sy, 0.095);

      // 1. Casting Boss Pillar
      const bossMesh = new THREE.Mesh(studBossGeo, materials.castAluminumBlock);
      bossMesh.castShadow = true;
      studGroup.add(bossMesh);

      // 2. Countersunk M11 Thread Socket
      const socketMesh = new THREE.Mesh(socketGeo, materials.oilGalleryPassage);
      socketMesh.position.set(0, 0, 0.01);
      studGroup.add(socketMesh);

      // 3. Precision Counterbore Chamfer
      const counterMesh = new THREE.Mesh(counterboreGeo, materials.machinedDeckSurface);
      counterMesh.position.set(0, 0, 0.024);
      studGroup.add(counterMesh);

      group.add(studGroup);
    });
  }

  // ── C. Hardened Steel Hollow Locator Dowel Sleeves (Front & Rear) ──
  const dowelGeo = new THREE.CylinderGeometry(
    spec.dowelPinRadiusM,
    spec.dowelPinRadiusM,
    spec.dowelPinHeightM,
    24,
    1,
    true
  );
  dowelGeo.rotateX(Math.PI / 2);

  [-0.315, 0.315].forEach((dx, dowelIdx) => {
    const dowelMesh = new THREE.Mesh(dowelGeo, materials.arpHardenedFastener);
    dowelMesh.name = `${bankName}_Locator_Dowel_${dowelIdx === 0 ? 'Front' : 'Rear'}`;
    dowelMesh.position.set(dx, 0, 0.122);
    dowelMesh.castShadow = true;
    group.add(dowelMesh);
  });

  // ── D. Laser-Etched Cylinder Firing Order & Bank ID Stamp Marks ──
  const stampGeo = new THREE.BoxGeometry(0.065, 0.022, 0.002);
  const stampMesh = new THREE.Mesh(stampGeo, materials.arpHardenedFastener);
  stampMesh.name = `${bankName}_Laser_Etched_ID_Plate`;
  stampMesh.position.set(0, 0.075, 0.1195);
  group.add(stampMesh);

  return group;
}

// ============================================================================
// 3. MASTER V12 CYLINDER DECK SUITE
// ============================================================================

/**
 * Builds the complete dual-bank cylinder deck assembly (Bank 1 & Bank 2).
 */
export function buildV12CylinderDeckSuite(
  materials: V12BlockMaterialPalette
): THREE.Group {
  const group = new THREE.Group();
  group.name = '04_V12_Cylinder_Decks_Suite_Assembly';
  const spec = V12_DECK_SPECS;

  // 1. Bank 1 (Left Deck Assembly)
  const bank1Deck = buildSingleBankDeck({ bank: 'left', spec }, materials);
  group.add(bank1Deck);

  // 2. Bank 2 (Right Deck Assembly with 15mm stagger)
  const bank2Deck = buildSingleBankDeck({ bank: 'right', spec }, materials);
  group.add(bank2Deck);

  return group;
}

export default buildV12CylinderDeckSuite;
