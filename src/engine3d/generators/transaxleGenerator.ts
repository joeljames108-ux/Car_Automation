// ============================================================================
// ULTRA-HIGH-FIDELITY MODULAR GLB GENERATOR — ADVANCED TRANSMISSIONS & GEARBOXES
// ============================================================================
// Solid-modeling engineering generator supporting all 5 transmission architectures:
// - 7/8/9-Speed Dual-Clutch Transmission (DCT) with dual concentric shafts, wet clutch basket, and mechatronics
// - 5/6/7-Speed H-Pattern Manual Transmission with shift turret, linkage rods, and bronze synchronizers
// - 6/7/8-Speed Sequential Dog-Ring Racing Transaxle with magnesium dry-sump, paddle shift block, and ramp LSD
// - Single-Speed EV Reduction Gearbox & e-Axle with dual-stage helical gears and park lock pawl
// - Continuously Variable Transmission (CVT) with variable conical pulleys and steel push-belt
// ============================================================================

import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { globalMaterialLibrary } from '../materials/pbrMaterialSystem';
import type { TransmissionType } from '../../sim/types';
import {
  createHexBoltHead,
  createAllenSocketHead,
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

export interface TransaxleSpec {
  gearboxLengthM: number;
  gearboxWidthM: number;
  gearboxHeightM: number;
  bellhousingDiameterM: number;
  bellhousingLengthM: number;
  diffFlangeDiameterMm: number;
  diffFlangeRadiusM: number;
  gearPairsCount: number;
}

export const V12_TRANSAXLE_SPECS: TransaxleSpec = {
  gearboxLengthM: 0.520,
  gearboxWidthM: 0.340,
  gearboxHeightM: 0.320,
  bellhousingDiameterM: 0.380,
  bellhousingLengthM: 0.160,
  diffFlangeDiameterMm: 108.0,
  diffFlangeRadiusM: 0.054,
  gearPairsCount: 7,
};

/**
 * Helper: Creates a 3D Gear Mesh with perimeter teeth notches, recessed web, and splined bore.
 */
export function createGearMesh(
  radius: number,
  faceWidth: number,
  teethCount: number,
  boreRadius: number,
  material: THREE.Material,
  isHelical: boolean = false
): THREE.Group {
  const gearGroup = new THREE.Group();
  gearGroup.name = "GearMesh";

  // Core Gear Rim
  const rimGeo = new THREE.CylinderGeometry(radius * 0.94, radius * 0.94, faceWidth, 36);
  rimGeo.rotateZ(Math.PI / 2);
  const rim = new THREE.Mesh(rimGeo, material);
  rim.castShadow = true;
  gearGroup.add(rim);

  // Outer Gear Teeth Notches around circumference
  const toothWidth = faceWidth * 0.95;
  const toothHeight = radius * 0.14;
  const toothThickness = (2 * Math.PI * radius) / (teethCount * 2.2);

  const toothGeo = new THREE.BoxGeometry(toothWidth, toothHeight, toothThickness);
  if (isHelical) {
    toothGeo.rotateY(Math.PI / 12);
  }

  for (let i = 0; i < teethCount; i++) {
    const angle = (i * 2 * Math.PI) / teethCount;
    const tooth = new THREE.Mesh(toothGeo, material);
    const tz = Math.sin(angle) * (radius - toothHeight * 0.3);
    const ty = Math.cos(angle) * (radius - toothHeight * 0.3);
    tooth.position.set(0, ty, tz);
    tooth.rotation.x = -angle;
    tooth.castShadow = true;
    gearGroup.add(tooth);
  }

  // Recessed Web Windows
  const webRecessGeo = new THREE.CylinderGeometry(radius * 0.72, radius * 0.72, faceWidth * 0.4, 24);
  webRecessGeo.rotateZ(Math.PI / 2);
  const webRecess = new THREE.Mesh(webRecessGeo, material);
  gearGroup.add(webRecess);

  // Splined Hub Bore
  const hubGeo = new THREE.CylinderGeometry(boreRadius + 0.008, boreRadius + 0.008, faceWidth * 1.1, 20);
  hubGeo.rotateZ(Math.PI / 2);
  const hub = new THREE.Mesh(hubGeo, material);
  gearGroup.add(hub);

  return gearGroup;
}

/**
 * Helper: Creates a Synchronizer Ring assembly with brass friction ring and engagement teeth.
 */
export function createSynchroRingMesh(
  radius: number,
  width: number,
  steelMat: THREE.Material,
  brassMat: THREE.Material
): THREE.Group {
  const synchroGroup = new THREE.Group();
  synchroGroup.name = "SynchroAssembly";

  // Steel Hub Sleeve
  const sleeveGeo = new THREE.CylinderGeometry(radius, radius, width, 32);
  sleeveGeo.rotateZ(Math.PI / 2);
  const sleeve = new THREE.Mesh(sleeveGeo, steelMat);

  // Shift Fork Outer Groove
  const grooveGeo = new THREE.TorusGeometry(radius * 0.98, width * 0.2, 12, 32);
  grooveGeo.rotateY(Math.PI / 2);
  const groove = new THREE.Mesh(grooveGeo, steelMat);

  // Inner Brass Synchronizer Ring
  const brassGeo = new THREE.CylinderGeometry(radius * 0.88, radius * 0.88, width * 0.8, 24);
  brassGeo.rotateZ(Math.PI / 2);
  const brassRing = new THREE.Mesh(brassGeo, brassMat);

  synchroGroup.add(sleeve, groove, brassRing);
  return synchroGroup;
}

/**
 * Helper: Creates a Hypoid Bevel Crown Wheel Differential Ring Gear.
 */
export function createCrownWheelMesh(
  outerRadius: number,
  innerRadius: number,
  faceWidth: number,
  material: THREE.Material
): THREE.Group {
  const group = new THREE.Group();
  group.name = "CrownWheelRingGear";

  const ringGeo = new THREE.CylinderGeometry(outerRadius, outerRadius * 0.85, faceWidth, 48);
  ringGeo.rotateZ(Math.PI / 2);
  const ring = new THREE.Mesh(ringGeo, material);
  group.add(ring);

  const teethCount = 38;
  const toothGeo = new THREE.BoxGeometry(faceWidth * 0.9, outerRadius * 0.08, outerRadius * 0.08);
  toothGeo.rotateY(Math.PI / 6);

  for (let i = 0; i < teethCount; i++) {
    const angle = (i * 2 * Math.PI) / teethCount;
    const tooth = new THREE.Mesh(toothGeo, material);
    const tz = Math.sin(angle) * (outerRadius - outerRadius * 0.04);
    const ty = Math.cos(angle) * (outerRadius - outerRadius * 0.04);
    tooth.position.set(0, ty, tz);
    tooth.rotation.x = -angle;
    group.add(tooth);
  }

  return group;
}

/**
 * Master 3D group builder for Transmissions and Gearboxes.
 */
export function buildTransaxleGroup(transType: TransmissionType = 'seq_7'): THREE.Group {
  const scene = buildTransaxleScene(transType);
  const group = scene.children[0] as THREE.Group;
  return group || new THREE.Group();
}

/**
 * Master 3D scene builder for Transmissions and Gearboxes.
 */
export function buildTransaxleScene(transType: TransmissionType = 'seq_7'): THREE.Scene {
  const scene = new THREE.Scene();
  scene.name = `Transmission_${transType}_Scene`;

  const rootGroup = new THREE.Group();
  rootGroup.name = `10_Transaxle_${transType}_Master_Group`;
  scene.add(rootGroup);

  const matLib = globalMaterialLibrary;
  const matMagnesiumCase = matLib.getTransaxleMagnesium();
  const matCastAluminum = matLib.getCastAluminum();
  const matBilletMachined = matLib.getMachinedBillet();
  const matCarbonPlates = matLib.getDryCarbonFiber();
  const matHardenedGears = matLib.getNitridedCrank();
  const matGoldAnodized = matLib.getGoldAnodized();
  const matBlackPolymer = matLib.getBlackPolymer();
  const matCobaltAnodized = matLib.getCobaltAnodized();

  if (transType.startsWith('dct')) {
    const gears = transType === 'dct_9' ? 9 : transType === 'dct_8' ? 8 : 7;
    buildDCTGearboxScene(rootGroup, gears, matCastAluminum, matBilletMachined, matHardenedGears, matGoldAnodized, matBlackPolymer, matCarbonPlates);
  } else if (transType.startsWith('manual') || transType === 'dog_leg') {
    const gears = transType === 'manual_5' ? 5 : transType === 'manual_7' ? 7 : 6;
    buildManualGearboxScene(rootGroup, gears, matCastAluminum, matBilletMachined, matHardenedGears, matGoldAnodized, matBlackPolymer);
  } else if (transType === 'single_speed') {
    buildEVReductionGearboxScene(rootGroup, matCastAluminum, matBilletMachined, matHardenedGears, matCobaltAnodized, matBlackPolymer);
  } else if (transType === 'cvt') {
    buildCVTGearboxScene(rootGroup, matCastAluminum, matBilletMachined, matHardenedGears, matGoldAnodized, matBlackPolymer);
  } else {
    // Sequential Dog-Ring Racing Gearbox (Default / seq_6, seq_7, seq_8)
    const gears = transType === 'seq_6' ? 6 : transType === 'seq_8' ? 8 : 7;
    buildSequentialRacingGearboxScene(rootGroup, gears, matMagnesiumCase, matBilletMachined, matCarbonPlates, matHardenedGears, matGoldAnodized, matBlackPolymer);
  }

  return scene;
}

// ============================================================================
// 1. DUAL-CLUTCH TRANSMISSION (DCT - 7/8/9 SPEED)
// ============================================================================
function buildDCTGearboxScene(
  root: THREE.Group,
  gears: number,
  casingMat: THREE.Material,
  billetMat: THREE.Material,
  gearMat: THREE.Material,
  accentMat: THREE.Material,
  polymerMat: THREE.Material,
  carbonMat: THREE.Material
) {
  const group = new THREE.Group();
  group.name = `DCT_${gears}Speed_Transmission_Subsystem`;

  // Casing Sub-Group
  const casingGroup = new THREE.Group();
  casingGroup.name = "Casing_Subsystem";
  casingGroup.userData = { subsystem: "casing", initialZ: 0 };

  const caseGeo = new THREE.BoxGeometry(0.50, 0.32, 0.30);
  const caseMesh = new THREE.Mesh(caseGeo, casingMat);
  caseMesh.position.set(0.18, 0, 0);
  caseMesh.castShadow = true;
  casingGroup.add(caseMesh);

  for (let r = 0; r < 4; r++) {
    const rx = 0.0 + r * 0.12;
    const ribGeo = new THREE.BoxGeometry(0.014, 0.30, 0.016);
    const rib = new THREE.Mesh(ribGeo, casingMat);
    rib.position.set(rx, 0, 0.158);
    casingGroup.add(rib);
  }

  const bellGeo = new THREE.CylinderGeometry(0.16, 0.19, 0.16, 48);
  bellGeo.rotateZ(Math.PI / 2);
  const bell = new THREE.Mesh(bellGeo, casingMat);
  bell.position.set(-0.15, 0, 0);
  casingGroup.add(bell);
  group.add(casingGroup);

  // Dual Wet Multi-Plate Clutch Housing Basket
  const clutchGroup = new THREE.Group();
  clutchGroup.name = "Dual_Clutch_Subsystem";
  clutchGroup.userData = { subsystem: "clutch", initialX: -0.16 };

  const clutchBasketGeo = new THREE.CylinderGeometry(0.11, 0.11, 0.06, 36);
  clutchBasketGeo.rotateZ(Math.PI / 2);
  const clutchBasket = new THREE.Mesh(clutchBasketGeo, billetMat);
  clutchBasket.position.set(-0.16, 0, 0);
  clutchGroup.add(clutchBasket);

  for (let p = 0; p < 6; p++) {
    const px = -0.18 + p * 0.008;
    const plateGeo = new THREE.TorusGeometry(0.095, 0.006, 12, 32);
    plateGeo.rotateY(Math.PI / 2);
    const plate = new THREE.Mesh(plateGeo, p % 2 === 0 ? carbonMat : billetMat);
    plate.position.set(px, 0, 0);
    clutchGroup.add(plate);
  }

  const outerShaftGeo = new THREE.CylinderGeometry(0.024, 0.024, 0.12, 28);
  outerShaftGeo.rotateZ(Math.PI / 2);
  const outerShaft = new THREE.Mesh(outerShaftGeo, gearMat);
  outerShaft.position.set(-0.19, 0, 0);

  const innerShaftGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.16, 28);
  innerShaftGeo.rotateZ(Math.PI / 2);
  const innerShaft = new THREE.Mesh(innerShaftGeo, billetMat);
  innerShaft.position.set(-0.21, 0, 0);
  clutchGroup.add(outerShaft, innerShaft);
  group.add(clutchGroup);

  // Internal Dual-Shaft Gearsets
  const gearGroup = new THREE.Group();
  gearGroup.name = "DCT_Gearsets_Subsystem";
  gearGroup.userData = { subsystem: "gears" };

  const gearStep = 0.38 / Math.max(1, gears);
  for (let g = 0; g < gears; g++) {
    const gx = -0.04 + g * gearStep;
    const gearRad = 0.046 + (g % 2 === 0 ? 0.014 : -0.008);
    const gearMesh = createGearMesh(gearRad, 0.022, 24 + g * 2, 0.016, gearMat, true);
    gearMesh.position.set(gx, 0, 0.04);
    gearGroup.add(gearMesh);

    if (g % 2 === 0) {
      const synchro = createSynchroRingMesh(0.038, 0.012, billetMat, accentMat);
      synchro.position.set(gx + gearStep * 0.35, 0, 0.04);
      gearGroup.add(synchro);
    }
  }
  group.add(gearGroup);

  // Top CNC Billet Mechatronics Hydraulic Valve Body Block
  const mechaGroup = new THREE.Group();
  mechaGroup.name = "Mechatronics_Subsystem";
  mechaGroup.userData = { subsystem: "mechatronics", initialZ: 0.18 };

  const mechatronicsGeo = new THREE.BoxGeometry(0.22, 0.16, 0.09);
  const mechatronics = new THREE.Mesh(mechatronicsGeo, billetMat);
  mechatronics.position.set(0.16, 0, 0.18);
  mechaGroup.add(mechatronics);

  for (let s = 0; s < 6; s++) {
    const sx = 0.09 + (s % 3) * 0.07;
    const sy = s < 3 ? -0.05 : 0.05;
    const solGeo = createAllenSocketHead(0.012, 0.035);
    solGeo.rotateX(Math.PI / 2);
    const sol = new THREE.Mesh(solGeo, accentMat);
    sol.position.set(sx, sy, 0.235);
    mechaGroup.add(sol);
  }

  const tcuGeo = new THREE.BoxGeometry(0.05, 0.04, 0.03);
  const tcu = new THREE.Mesh(tcuGeo, polymerMat);
  tcu.position.set(0.06, 0, 0.23);
  mechaGroup.add(tcu);
  group.add(mechaGroup);

  const coolerGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.14, 28);
  coolerGeo.rotateZ(Math.PI / 2);
  const cooler = new THREE.Mesh(coolerGeo, billetMat);
  cooler.position.set(0.18, 0.17, -0.04);
  group.add(cooler);

  [-0.03, 0.03].forEach((cx) => {
    const fittingGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.025, 16);
    const fitting = new THREE.Mesh(fittingGeo, accentMat);
    fitting.position.set(0.18 + cx, 0.20, -0.04);
    group.add(fitting);
  });

  addDifferentialAndFlanges(group, 0.36, 0.32, casingMat, gearMat);
  root.add(group);
}

// ============================================================================
// 2. H-PATTERN MANUAL TRANSMISSION (5/6/7 SPEED)
// ============================================================================
function buildManualGearboxScene(
  root: THREE.Group,
  gears: number,
  casingMat: THREE.Material,
  billetMat: THREE.Material,
  gearMat: THREE.Material,
  accentMat: THREE.Material,
  polymerMat: THREE.Material
) {
  const group = new THREE.Group();
  group.name = `Manual_${gears}Speed_Transmission_Subsystem`;

  const length = 0.48;

  // 1. Casing Sub-Group
  const casingGroup = new THREE.Group();
  casingGroup.name = "Casing_Subsystem";
  casingGroup.userData = { subsystem: "casing", initialZ: 0 };

  const caseGeo = new THREE.BoxGeometry(length, 0.28, 0.28);
  const caseMesh = new THREE.Mesh(caseGeo, casingMat);
  caseMesh.position.set(0.16, 0, 0);
  caseMesh.castShadow = true;
  casingGroup.add(caseMesh);

  // Longitudinal Casing Split Flanges
  const splitFlangeGeo = new THREE.BoxGeometry(length, 0.012, 0.025);
  const splitFlangeL = new THREE.Mesh(splitFlangeGeo, casingMat);
  splitFlangeL.position.set(0.16, -0.145, 0);

  const splitFlangeR = splitFlangeL.clone();
  splitFlangeR.position.y = 0.145;
  casingGroup.add(splitFlangeL, splitFlangeR);

  // Slotted Bellhousing
  const bellGeo = new THREE.CylinderGeometry(0.15, 0.19, 0.15, 48);
  bellGeo.rotateZ(Math.PI / 2);
  const bell = new THREE.Mesh(bellGeo, casingMat);
  bell.position.set(-0.14, 0, 0);
  casingGroup.add(bell);

  // Tailhousing with Reverse Switch
  const revSwitchGeo = new THREE.CylinderGeometry(0.010, 0.010, 0.025, 16);
  const revSwitch = new THREE.Mesh(revSwitchGeo, polymerMat);
  revSwitch.position.set(0.34, 0.12, 0.08);
  casingGroup.add(revSwitch);
  group.add(casingGroup);

  // 2. Clutch Sub-Group
  const clutchGroup = new THREE.Group();
  clutchGroup.name = "Manual_Clutch_Subsystem";
  clutchGroup.userData = { subsystem: "clutch", initialX: -0.14 };

  const flywheelGeo = new THREE.CylinderGeometry(0.13, 0.13, 0.022, 36);
  flywheelGeo.rotateZ(Math.PI / 2);
  const flywheel = new THREE.Mesh(flywheelGeo, billetMat);
  flywheel.position.set(-0.16, 0, 0);

  const clutchDiscGeo = new THREE.CylinderGeometry(0.11, 0.11, 0.024, 32);
  clutchDiscGeo.rotateZ(Math.PI / 2);
  const clutchDisc = new THREE.Mesh(clutchDiscGeo, accentMat);
  clutchDisc.position.set(-0.14, 0, 0);

  const slaveGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.09, 20);
  slaveGeo.rotateZ(Math.PI / 2);
  const slave = new THREE.Mesh(slaveGeo, billetMat);
  slave.position.set(-0.12, -0.16, 0.06);

  const bleederGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.02, 12);
  const bleeder = new THREE.Mesh(bleederGeo, accentMat);
  bleeder.position.set(-0.12, -0.16, 0.08);

  clutchGroup.add(flywheel, clutchDisc, slave, bleeder);
  group.add(clutchGroup);

  // 3. Shift Turret & Linkage Sub-Group
  const mechaGroup = new THREE.Group();
  mechaGroup.name = "Shift_Turret_Subsystem";
  mechaGroup.userData = { subsystem: "mechatronics", initialZ: 0.17 };

  const turretGeo = new THREE.CylinderGeometry(0.045, 0.055, 0.09, 28);
  const turret = new THREE.Mesh(turretGeo, billetMat);
  turret.position.set(0.24, 0, 0.17);

  const shiftRodGeo = new THREE.CylinderGeometry(0.010, 0.010, 0.18, 16);
  shiftRodGeo.rotateZ(Math.PI / 2);
  const shiftRod = new THREE.Mesh(shiftRodGeo, billetMat);
  shiftRod.position.set(0.32, 0, 0.22);

  const heimGeo = new THREE.SphereGeometry(0.016, 20, 16);
  const heim = new THREE.Mesh(heimGeo, accentMat);
  heim.position.set(0.40, 0, 0.22);

  mechaGroup.add(turret, shiftRod, heim);
  group.add(mechaGroup);

  // 4. Internal Gearsets & Synchronizers Sub-Group
  const gearGroup = new THREE.Group();
  gearGroup.name = "Manual_Gearsets_Subsystem";
  gearGroup.userData = { subsystem: "gears" };

  const mainShaftGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.38, 24);
  mainShaftGeo.rotateZ(Math.PI / 2);
  const mainShaft = new THREE.Mesh(mainShaftGeo, billetMat);
  mainShaft.position.set(0.14, 0, 0.03);

  const layShaftGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.36, 24);
  layShaftGeo.rotateZ(Math.PI / 2);
  const layShaft = new THREE.Mesh(layShaftGeo, gearMat);
  layShaft.position.set(0.14, 0, -0.05);
  gearGroup.add(mainShaft, layShaft);

  const step = 0.32 / Math.max(1, gears);
  for (let g = 0; g < gears; g++) {
    const gx = -0.02 + g * step;
    const gearRad = 0.044 + (g % 2 === 0 ? 0.012 : -0.008);

    const mainGear = createGearMesh(gearRad, 0.020, 20 + g * 2, 0.014, gearMat, true);
    mainGear.position.set(gx, 0, 0.03);
    gearGroup.add(mainGear);

    const counterRad = 0.078 - gearRad;
    const counterGear = createGearMesh(counterRad, 0.020, 36 - g * 2, 0.014, gearMat, true);
    counterGear.position.set(gx, 0, -0.05);
    gearGroup.add(counterGear);

    if (g % 2 === 0) {
      const synchro = createSynchroRingMesh(0.036, 0.010, billetMat, accentMat);
      synchro.position.set(gx + step * 0.4, 0, 0.03);
      gearGroup.add(synchro);
    }
  }
  group.add(gearGroup);

  addDifferentialAndFlanges(group, 0.35, 0.28, casingMat, gearMat);

  root.add(group);
}

// ============================================================================
// 3. SEQUENTIAL DOG-RING RACING TRANSAXLE (6/7/8 SPEED)
// ============================================================================
function buildSequentialRacingGearboxScene(
  root: THREE.Group,
  gears: number,
  magnesiumMat: THREE.Material,
  billetMat: THREE.Material,
  carbonMat: THREE.Material,
  gearMat: THREE.Material,
  accentMat: THREE.Material,
  polymerMat: THREE.Material
) {
  const group = new THREE.Group();
  group.name = `Sequential_${gears}Speed_Racing_Transaxle_Subsystem`;

  const spec = V12_TRANSAXLE_SPECS;

  // 1. Lightweight Magnesium Casing with Stiffening Rib Grid
  const caseGeo = new THREE.BoxGeometry(spec.gearboxLengthM, spec.gearboxWidthM, spec.gearboxHeightM);
  const caseMesh = new THREE.Mesh(caseGeo, magnesiumMat);
  caseMesh.position.set(0.18, 0, 0);
  caseMesh.castShadow = true;
  group.add(caseMesh);

  // Exterior Stiffening Grid Webbing Ribs (Top & Sides)
  for (let r = 0; r < 5; r++) {
    const rx = -0.04 + r * 0.11;

    const topRibGeo = new THREE.BoxGeometry(0.012, spec.gearboxWidthM - 0.04, 0.016);
    const topRib = new THREE.Mesh(topRibGeo, magnesiumMat);
    topRib.position.set(rx, 0, spec.gearboxHeightM / 2 + 0.008);
    group.add(topRib);

    [-spec.gearboxWidthM / 2 - 0.006, spec.gearboxWidthM / 2 + 0.006].forEach((sy) => {
      const sideRibGeo = new THREE.BoxGeometry(0.012, 0.012, spec.gearboxHeightM - 0.04);
      const sideRib = new THREE.Mesh(sideRibGeo, magnesiumMat);
      sideRib.position.set(rx, sy, 0);
      group.add(sideRib);
    });
  }

  // 2. Conical Bellhousing, 3-Plate Carbon Clutch & Geared Starter
  const bellGeo = new THREE.CylinderGeometry(0.16, spec.bellhousingDiameterM / 2, spec.bellhousingLengthM, 48);
  bellGeo.rotateZ(Math.PI / 2);
  const bell = new THREE.Mesh(bellGeo, magnesiumMat);
  bell.position.set(-0.16, 0, 0);
  group.add(bell);

  const clutchCoverGeo = new THREE.CylinderGeometry(0.105, 0.105, 0.045, 36);
  clutchCoverGeo.rotateZ(Math.PI / 2);
  const clutchCover = new THREE.Mesh(clutchCoverGeo, billetMat);
  clutchCover.position.set(-0.18, 0, 0);
  group.add(clutchCover);

  [-0.19, -0.17].forEach((cx) => {
    const discGeo = new THREE.TorusGeometry(0.092, 0.008, 16, 36);
    discGeo.rotateY(Math.PI / 2);
    const disc = new THREE.Mesh(discGeo, carbonMat);
    disc.position.set(cx, 0, 0);
    group.add(disc);
  });

  // Starter Motor & Solenoid
  const starterGeo = new THREE.CylinderGeometry(0.042, 0.042, 0.14, 28);
  starterGeo.rotateZ(Math.PI / 2);
  const starter = new THREE.Mesh(starterGeo, polymerMat);
  starter.position.set(-0.18, 0.14, 0.11);

  const solGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.08, 20);
  solGeo.rotateZ(Math.PI / 2);
  const sol = new THREE.Mesh(solGeo, accentMat);
  sol.position.set(-0.18, 0.14, 0.16);
  group.add(starter, sol);

  // 3. Straight-Cut Dog-Ring Gearsets & Dog-Rings
  for (let g = 0; g < gears; g++) {
    const gx = 0.02 + g * (0.34 / gears);
    const gearRad = 0.048 + (g % 2 === 0 ? 0.014 : -0.010);

    const gear = createGearMesh(gearRad, 0.022, 26, 0.014, gearMat, false);
    gear.name = `Sequential_StraightCut_Gear_${g + 1}`;
    gear.position.set(gx, 0, 0.04);

    const dogGeo = new THREE.CylinderGeometry(0.038, 0.038, 0.01, 20);
    dogGeo.rotateZ(Math.PI / 2);
    const dog = new THREE.Mesh(dogGeo, gearMat);
    dog.name = `Sequential_Dog_Ring_${g + 1}`;
    dog.position.set(gx + 0.014, 0, 0.04);
    group.add(gear, dog);
  }

  // Casing Split-Line Parting Flange with Perimeter Fasteners
  const partingGeo = new THREE.BoxGeometry(spec.gearboxLengthM + 0.004, spec.gearboxWidthM + 0.004, 0.006);
  const partingMesh = new THREE.Mesh(partingGeo, billetMat);
  partingMesh.name = 'Casing_SplitLine_Parting_Flange';
  partingMesh.position.set(0.18, 0, 0);
  group.add(partingMesh);

  for (let b = 0; b < 8; b++) {
    const bx = 0.18 - spec.gearboxLengthM / 2 + 0.03 + b * ((spec.gearboxLengthM - 0.06) / 7);
    [-1, 1].forEach((s) => {
      const boltGeo = createHexBoltHead(0.005, 0.006);
      const bolt = new THREE.Mesh(boltGeo, accentMat);
      bolt.name = `Casing_SplitLine_Bolt_${b + 1}_${s < 0 ? 'L' : 'R'}`;
      bolt.position.set(bx, s * (spec.gearboxWidthM / 2 + 0.004), 0);
      group.add(bolt);
    });
  }

  // Manufacturer Badge Plate on the Case End
  const seqBadgeGeo = new THREE.BoxGeometry(0.0015, 0.05, 0.028);
  const seqBadge = new THREE.Mesh(seqBadgeGeo, accentMat);
  seqBadge.name = 'Casing_Manufacturer_Badge_Plate';
  seqBadge.position.set(0.18 + spec.gearboxLengthM / 2 + 0.001, 0.06, 0.05);
  group.add(seqBadge);

  // 4. Electro-Pneumatic Paddle-Shift Solenoid Block
  const pneuBlockGeo = new THREE.BoxGeometry(0.12, 0.09, 0.06);
  const pneuBlock = new THREE.Mesh(pneuBlockGeo, accentMat);
  pneuBlock.position.set(0.18, 0, spec.gearboxHeightM / 2 + 0.04);
  group.add(pneuBlock);

  [-0.03, 0.03].forEach((sy) => {
    const solValveGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.045, 20);
    const solValve = new THREE.Mesh(solValveGeo, polymerMat);
    solValve.position.set(0.18, sy, spec.gearboxHeightM / 2 + 0.08);
    group.add(solValve);
  });

  // 5. Multi-Plate Ramp-Style LSD & 108mm CV Drive Flanges
  addDifferentialAndFlanges(group, 0.38, spec.gearboxWidthM, magnesiumMat, gearMat);

  root.add(group);
}

// ============================================================================
// 4. SINGLE-SPEED EV REDUCTION GEARBOX & E-AXLE
// ============================================================================
function buildEVReductionGearboxScene(
  root: THREE.Group,
  casingMat: THREE.Material,
  billetMat: THREE.Material,
  gearMat: THREE.Material,
  accentMat: THREE.Material,
  polymerMat: THREE.Material
) {
  const group = new THREE.Group();
  group.name = 'EV_SingleSpeed_Reduction_eAxle_Subsystem';

  // 1. Ultra-Compact Ribbed Aluminum e-Axle Reduction Housing
  const caseGeo = new THREE.BoxGeometry(0.36, 0.28, 0.26);
  const caseMesh = new THREE.Mesh(caseGeo, casingMat);
  caseMesh.position.set(0.10, 0, 0);
  caseMesh.castShadow = true;
  group.add(caseMesh);

  // 2. Dual-Stage Precision Ground Helical Reduction Gearpairs
  const inputPinionGeo = new THREE.CylinderGeometry(0.032, 0.032, 0.035, 32);
  inputPinionGeo.rotateZ(Math.PI / 2);
  const inputPinion = new THREE.Mesh(inputPinionGeo, gearMat);
  inputPinion.position.set(0.02, 0, 0.06);

  const intermediateGearGeo = new THREE.CylinderGeometry(0.078, 0.078, 0.035, 48);
  intermediateGearGeo.rotateZ(Math.PI / 2);
  const intermediateGear = new THREE.Mesh(intermediateGearGeo, gearMat);
  intermediateGear.position.set(0.10, 0, -0.01);
  group.add(inputPinion, intermediateGear);

  // 3. Electro-Mechanical Park Lock Pawl Wheel & Solenoid
  const parkLockGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.018, 24);
  parkLockGeo.rotateZ(Math.PI / 2);
  const parkLock = new THREE.Mesh(parkLockGeo, billetMat);
  parkLock.position.set(0.16, 0, 0.06);

  const parkActuatorGeo = new THREE.BoxGeometry(0.06, 0.05, 0.07);
  const parkActuator = new THREE.Mesh(parkActuatorGeo, polymerMat);
  parkActuator.position.set(0.16, 0, 0.15);
  group.add(parkLock, parkActuator);

  // 4. Liquid Glycol Cooling Ports
  [-0.04, 0.04].forEach((py) => {
    const portGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.03, 20);
    const port = new THREE.Mesh(portGeo, accentMat);
    port.position.set(0.04, py, 0.14);
    group.add(port);
  });

  // 5. Output Planetary Differential & Splined Flanges
  addDifferentialAndFlanges(group, 0.22, 0.28, casingMat, gearMat);

  root.add(group);
}

// ============================================================================
// 5. CONTINUOUSLY VARIABLE TRANSMISSION (CVT)
// ============================================================================
function buildCVTGearboxScene(
  root: THREE.Group,
  casingMat: THREE.Material,
  billetMat: THREE.Material,
  gearMat: THREE.Material,
  accentMat: THREE.Material,
  polymerMat: THREE.Material
) {
  const group = new THREE.Group();
  group.name = 'CVT_Continuously_Variable_Transmission_Subsystem';

  // 1. Die-Cast Aluminum Pulley Casing
  const caseGeo = new THREE.BoxGeometry(0.44, 0.30, 0.30);
  const caseMesh = new THREE.Mesh(caseGeo, casingMat);
  caseMesh.position.set(0.14, 0, 0);
  group.add(caseMesh);

  // 2. Dual Variable Conical Pulley Sheaves
  const primarySheaveGeo = new THREE.ConeGeometry(0.08, 0.04, 32);
  primarySheaveGeo.rotateZ(Math.PI / 2);
  const primarySheaveL = new THREE.Mesh(primarySheaveGeo, billetMat);
  primarySheaveL.position.set(0.06, -0.04, 0.05);

  const primarySheaveR = primarySheaveL.clone();
  primarySheaveR.rotation.z = -Math.PI / 2;
  primarySheaveR.position.y = 0.04;

  const secondarySheaveL = primarySheaveL.clone();
  secondarySheaveL.position.set(0.22, -0.04, -0.05);

  const secondarySheaveR = primarySheaveR.clone();
  secondarySheaveR.position.set(0.22, 0.04, -0.05);

  group.add(primarySheaveL, primarySheaveR, secondarySheaveL, secondarySheaveR);

  // 3. Multi-Link High-Torque Steel Push-Belt
  const beltGeo = new THREE.TorusGeometry(0.11, 0.012, 16, 48);
  beltGeo.rotateY(Math.PI / 2);
  const belt = new THREE.Mesh(beltGeo, gearMat);
  belt.position.set(0.14, 0, 0);
  group.add(belt);

  // 4. Hydraulic Pressure Pump Housing & Fluid Filter
  const pumpGeo = new THREE.CylinderGeometry(0.038, 0.038, 0.06, 20);
  pumpGeo.rotateZ(Math.PI / 2);
  const pump = new THREE.Mesh(pumpGeo, accentMat);
  pump.position.set(0.02, 0.16, 0.08);

  const filterGeo = new THREE.CylinderGeometry(0.028, 0.028, 0.08, 20);
  const filter = new THREE.Mesh(filterGeo, polymerMat);
  filter.position.set(0.02, 0.16, -0.08);
  group.add(pump, filter);

  addDifferentialAndFlanges(group, 0.32, 0.30, casingMat, gearMat);

  root.add(group);
}

// ============================================================================
// HELPER: DIFFERENTIAL BULGE & CV DRIVE FLANGES WITH AEROSPACE BOLTS
// ============================================================================
function addDifferentialAndFlanges(
  parent: THREE.Group,
  diffX: number,
  widthM: number,
  diffMat: THREE.Material,
  flangeMat: THREE.Material
) {
  const diffGroup = new THREE.Group();
  diffGroup.name = "Differential_Subsystem";
  diffGroup.userData = { subsystem: "diff", initialY: 0 };

  // Center Crown Wheel Differential Carrier Bulge
  const diffSphereGeo = new THREE.SphereGeometry(0.12, 32, 28);
  const diffSphere = new THREE.Mesh(diffSphereGeo, diffMat);
  diffSphere.position.set(diffX, 0, -0.02);
  diffGroup.add(diffSphere);

  // Hypoid Crown Wheel Ring Gear Wrapping the Carrier
  const crownWheel = createCrownWheelMesh(0.118, 0.06, 0.024, flangeMat);
  crownWheel.name = 'Diff_Hypoid_Crown_Wheel_Ring_Gear';
  crownWheel.rotation.z = -Math.PI / 2;
  crownWheel.position.set(diffX - 0.108, 0, -0.02);
  diffGroup.add(crownWheel);

  // Magnetic Fill & Drain Plugs
  const fillPlugGeo = createHexBoltHead(0.01, 0.008);
  fillPlugGeo.rotateX(Math.PI / 2);
  const fillPlug = new THREE.Mesh(fillPlugGeo, flangeMat);
  fillPlug.name = 'Diff_Magnetic_Fill_Plug';
  fillPlug.position.set(diffX, 0.085, 0.06);
  diffGroup.add(fillPlug);

  const drainPlugGeo = createHexBoltHead(0.01, 0.008);
  drainPlugGeo.rotateX(Math.PI / 2);
  const drainPlug = new THREE.Mesh(drainPlugGeo, flangeMat);
  drainPlug.name = 'Diff_Magnetic_Drain_Plug';
  drainPlug.position.set(diffX, -0.085, -0.07);
  diffGroup.add(drainPlug);

  // Dual 108mm Porsche-Style 6-Bolt CV Drive Flange Hubs
  [-1, 1].forEach((dir) => {
    const yPos = dir * (widthM / 2 + 0.03);

    const flangeGeo = new THREE.CylinderGeometry(0.054, 0.054, 0.028, 36);
    flangeGeo.rotateX(Math.PI / 2);
    const flange = new THREE.Mesh(flangeGeo, flangeMat);
    flange.name = dir === -1 ? "Left_Output_Flange" : "Right_Output_Flange";
    flange.position.set(diffX, yPos, -0.02);
    flange.castShadow = true;
    diffGroup.add(flange);

    // 6 Perimeter M10 Aerospace CV Hex Flange Bolts
    for (let b = 0; b < 6; b++) {
      const bAngle = (b * Math.PI * 2) / 6;
      const bz = Math.sin(bAngle) * 0.040;
      const bx = Math.cos(bAngle) * 0.040;

      const boltGeo = createHexBoltHead(0.005, 0.012);
      boltGeo.rotateX(Math.PI / 2);
      const bolt = new THREE.Mesh(boltGeo, flangeMat);
      bolt.position.set(diffX + bx, yPos + dir * 0.014, -0.02 + bz);
      diffGroup.add(bolt);
    }
  });

  parent.add(diffGroup);
}

/**
 * Updates exploded view offset for transaxle subassemblies.
 * Slides outer casing, shift solenoids, and clutch covers outwards while keeping internal gearsets visible.
 */
export function updateTransaxleExplodedView(group: THREE.Group, progress: number): void {
  group.traverse((child) => {
    if (child.userData && child.userData.subsystem) {
      const sub = child.userData.subsystem;
      if (sub === 'casing') {
        child.position.z = (child.userData.initialZ || 0) + progress * 0.28;
      } else if (sub === 'mechatronics') {
        child.position.z = (child.userData.initialZ || 0) + progress * 0.35;
      } else if (sub === 'clutch') {
        child.position.x = (child.userData.initialX || 0) - progress * 0.25;
      } else if (sub === 'diff') {
        child.position.y = (child.userData.initialY || 0) + progress * 0.22;
      }
    }
  });
}

/**
 * Animates internal gear shaft rotation, countershafts, and differential drive flanges.
 */
export function animateTransaxleRotation(
  group: THREE.Group,
  deltaTimeSeconds: number,
  inputRpm: number = 3000,
  currentGearRatio: number = 3.5
): void {
  const inputRadPerSec = (inputRpm * 2 * Math.PI) / 60;
  const outputRadPerSec = inputRadPerSec / Math.max(0.5, currentGearRatio);
  const diffRadPerSec = outputRadPerSec / 3.4;

  group.traverse((child) => {
    if (child.name.includes("Shaft") || child.name.includes("Clutch")) {
      child.rotation.x += inputRadPerSec * deltaTimeSeconds * 0.2;
    } else if (child.name.includes("Gear") || child.name.includes("Dog") || child.name.includes("Synchro")) {
      child.rotation.x += outputRadPerSec * deltaTimeSeconds * 0.2;
    } else if (child.name.includes("Flange") || child.name.includes("CrownWheel")) {
      child.rotation.y += diffRadPerSec * deltaTimeSeconds * 0.2;
    }
  });
}

/**
 * Exports the transaxle scene to a binary GLB ArrayBuffer.
 */
export async function generateTransaxleGlbBuffer(transType: TransmissionType = 'seq_7'): Promise<ArrayBuffer> {
  const scene = buildTransaxleScene(transType);
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

export default buildTransaxleScene;
