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
    buildDCTGearboxScene(rootGroup, matCastAluminum, matBilletMachined, matHardenedGears, matGoldAnodized, matBlackPolymer, matCarbonPlates);
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
  casingMat: THREE.Material,
  billetMat: THREE.Material,
  gearMat: THREE.Material,
  accentMat: THREE.Material,
  polymerMat: THREE.Material,
  carbonMat: THREE.Material
) {
  const group = new THREE.Group();
  group.name = 'DCT_Transmission_Subsystem';

  // 1. Main Cast Aluminum Dual-Clutch Casing with Structural Webbing
  const caseGeo = new THREE.BoxGeometry(0.50, 0.32, 0.30);
  const caseMesh = new THREE.Mesh(caseGeo, casingMat);
  caseMesh.position.set(0.18, 0, 0);
  caseMesh.castShadow = true;
  group.add(caseMesh);

  // Stiffening Webbing Ribs
  for (let r = 0; r < 4; r++) {
    const rx = 0.0 + r * 0.12;
    const ribGeo = new THREE.BoxGeometry(0.014, 0.30, 0.016);
    const rib = new THREE.Mesh(ribGeo, casingMat);
    rib.position.set(rx, 0, 0.158);
    group.add(rib);
  }

  // 2. Bellhousing with Dual Concentric Input Shafts & Wet Clutch Basket
  const bellGeo = new THREE.CylinderGeometry(0.16, 0.19, 0.16, 32);
  bellGeo.rotateZ(Math.PI / 2);
  const bell = new THREE.Mesh(bellGeo, casingMat);
  bell.position.set(-0.15, 0, 0);
  group.add(bell);

  // Dual Wet Multi-Plate Clutch Housing Basket
  const clutchBasketGeo = new THREE.CylinderGeometry(0.11, 0.11, 0.06, 28);
  clutchBasketGeo.rotateZ(Math.PI / 2);
  const clutchBasket = new THREE.Mesh(clutchBasketGeo, billetMat);
  clutchBasket.position.set(-0.16, 0, 0);
  group.add(clutchBasket);

  // Outer Hollow Input Shaft (Even Gears) & Inner Solid Input Shaft (Odd Gears)
  const outerShaftGeo = new THREE.CylinderGeometry(0.024, 0.024, 0.12, 20);
  outerShaftGeo.rotateZ(Math.PI / 2);
  const outerShaft = new THREE.Mesh(outerShaftGeo, gearMat);
  outerShaft.position.set(-0.19, 0, 0);

  const innerShaftGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.16, 20);
  innerShaftGeo.rotateZ(Math.PI / 2);
  const innerShaft = new THREE.Mesh(innerShaftGeo, billetMat);
  innerShaft.position.set(-0.21, 0, 0);
  group.add(outerShaft, innerShaft);

  // 3. Top CNC Billet Mechatronics Hydraulic Valve Body Block
  const mechatronicsGeo = new THREE.BoxGeometry(0.22, 0.16, 0.09);
  const mechatronics = new THREE.Mesh(mechatronicsGeo, billetMat);
  mechatronics.position.set(0.16, 0, 0.18);
  group.add(mechatronics);

  // 6 High-Frequency Proportional Electro-Hydraulic Shift Solenoids
  for (let s = 0; s < 6; s++) {
    const sx = 0.09 + (s % 3) * 0.07;
    const sy = s < 3 ? -0.05 : 0.05;
    const solGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.035, 16);
    const sol = new THREE.Mesh(solGeo, accentMat);
    sol.position.set(sx, sy, 0.235);
    group.add(sol);
  }

  // TCU Multi-Pin Wiring Harness Connector
  const tcuGeo = new THREE.BoxGeometry(0.05, 0.04, 0.03);
  const tcu = new THREE.Mesh(tcuGeo, polymerMat);
  tcu.position.set(0.06, 0, 0.23);
  group.add(tcu);

  // 4. Liquid-to-Oil Transmission Fluid Heat Exchanger Canister
  const coolerGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.14, 20);
  coolerGeo.rotateZ(Math.PI / 2);
  const cooler = new THREE.Mesh(coolerGeo, billetMat);
  cooler.position.set(0.18, 0.17, -0.04);
  group.add(cooler);

  // Dual Braided AN-8 Fluid Lines
  [-0.03, 0.03].forEach((cx) => {
    const fittingGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.025, 12);
    const fitting = new THREE.Mesh(fittingGeo, accentMat);
    fitting.position.set(0.18 + cx, 0.20, -0.04);
    group.add(fitting);
  });

  // 5. Electronic Limited-Slip Differential (e-LSD) & Drive Flanges
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

  // 1. Die-Cast Aluminum Ribbed Transmission Casing
  const caseGeo = new THREE.BoxGeometry(length, 0.28, 0.28);
  const caseMesh = new THREE.Mesh(caseGeo, casingMat);
  caseMesh.position.set(0.16, 0, 0);
  caseMesh.castShadow = true;
  group.add(caseMesh);

  // Longitudinal Casing Split Flanges
  const splitFlangeGeo = new THREE.BoxGeometry(length, 0.012, 0.025);
  const splitFlangeL = new THREE.Mesh(splitFlangeGeo, casingMat);
  splitFlangeL.position.set(0.16, -0.145, 0);

  const splitFlangeR = splitFlangeL.clone();
  splitFlangeR.position.y = 0.145;
  group.add(splitFlangeL, splitFlangeR);

  // 2. Slotted Bellhousing with Lightened Flywheel & Spring-Damped Clutch
  const bellGeo = new THREE.CylinderGeometry(0.15, 0.19, 0.15, 32);
  bellGeo.rotateZ(Math.PI / 2);
  const bell = new THREE.Mesh(bellGeo, casingMat);
  bell.position.set(-0.14, 0, 0);
  group.add(bell);

  // Billet Chromoly Lightened Flywheel
  const flywheelGeo = new THREE.CylinderGeometry(0.13, 0.13, 0.022, 32);
  flywheelGeo.rotateZ(Math.PI / 2);
  const flywheel = new THREE.Mesh(flywheelGeo, billetMat);
  flywheel.position.set(-0.16, 0, 0);
  group.add(flywheel);

  // Sprung-Hub Organic Clutch Friction Disc with Diaphragm Spring
  const clutchDiscGeo = new THREE.CylinderGeometry(0.11, 0.11, 0.024, 24);
  clutchDiscGeo.rotateZ(Math.PI / 2);
  const clutchDisc = new THREE.Mesh(clutchDiscGeo, accentMat);
  clutchDisc.position.set(-0.14, 0, 0);
  group.add(clutchDisc);

  // 3. Top Aluminum Mechanical Shift Turret & Articulated Linkage Rods
  const turretGeo = new THREE.CylinderGeometry(0.045, 0.055, 0.09, 20);
  const turret = new THREE.Mesh(turretGeo, billetMat);
  turret.position.set(0.24, 0, 0.17);
  group.add(turret);

  // Articulated Stainless Steel Shift Selector Rod
  const shiftRodGeo = new THREE.CylinderGeometry(0.010, 0.010, 0.18, 12);
  shiftRodGeo.rotateZ(Math.PI / 2);
  const shiftRod = new THREE.Mesh(shiftRodGeo, billetMat);
  shiftRod.position.set(0.32, 0, 0.22);

  // Spherical Heim Joint Pivot Bearings
  const heimGeo = new THREE.SphereGeometry(0.016, 16, 12);
  const heim = new THREE.Mesh(heimGeo, accentMat);
  heim.position.set(0.40, 0, 0.22);
  group.add(shiftRod, heim);

  // 4. Side-Mounted Hydraulic Clutch Slave Cylinder with Bleeder
  const slaveGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.09, 16);
  slaveGeo.rotateZ(Math.PI / 2);
  const slave = new THREE.Mesh(slaveGeo, billetMat);
  slave.position.set(-0.12, -0.16, 0.06);

  const bleederGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.02, 8);
  const bleeder = new THREE.Mesh(bleederGeo, accentMat);
  bleeder.position.set(-0.12, -0.16, 0.08);
  group.add(slave, bleeder);

  // 5. Tailhousing with Speedometer Sensor & Reverse Switch
  const revSwitchGeo = new THREE.CylinderGeometry(0.010, 0.010, 0.025, 12);
  const revSwitch = new THREE.Mesh(revSwitchGeo, polymerMat);
  revSwitch.position.set(0.34, 0.12, 0.08);
  group.add(revSwitch);

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
  const bellGeo = new THREE.CylinderGeometry(0.16, spec.bellhousingDiameterM / 2, spec.bellhousingLengthM, 32);
  bellGeo.rotateZ(Math.PI / 2);
  const bell = new THREE.Mesh(bellGeo, magnesiumMat);
  bell.position.set(-0.16, 0, 0);
  group.add(bell);

  const clutchCoverGeo = new THREE.CylinderGeometry(0.105, 0.105, 0.045, 28);
  clutchCoverGeo.rotateZ(Math.PI / 2);
  const clutchCover = new THREE.Mesh(clutchCoverGeo, billetMat);
  clutchCover.position.set(-0.18, 0, 0);
  group.add(clutchCover);

  [-0.19, -0.17].forEach((cx) => {
    const discGeo = new THREE.TorusGeometry(0.092, 0.008, 12, 28);
    discGeo.rotateY(Math.PI / 2);
    const disc = new THREE.Mesh(discGeo, carbonMat);
    disc.position.set(cx, 0, 0);
    group.add(disc);
  });

  // Starter Motor & Solenoid
  const starterGeo = new THREE.CylinderGeometry(0.042, 0.042, 0.14, 20);
  starterGeo.rotateZ(Math.PI / 2);
  const starter = new THREE.Mesh(starterGeo, polymerMat);
  starter.position.set(-0.18, 0.14, 0.11);

  const solGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.08, 16);
  solGeo.rotateZ(Math.PI / 2);
  const sol = new THREE.Mesh(solGeo, accentMat);
  sol.position.set(-0.18, 0.14, 0.16);
  group.add(starter, sol);

  // 3. Straight-Cut Dog-Ring Gearsets & Dog-Rings
  for (let g = 0; g < gears; g++) {
    const gx = 0.02 + g * (0.34 / gears);
    const gearRad = 0.048 + (g % 2 === 0 ? 0.014 : -0.010);

    const gearGeo = new THREE.CylinderGeometry(gearRad, gearRad, 0.022, 24);
    gearGeo.rotateZ(Math.PI / 2);
    const gear = new THREE.Mesh(gearGeo, gearMat);
    gear.position.set(gx, 0, 0.04);

    const dogGeo = new THREE.CylinderGeometry(0.038, 0.038, 0.010, 16);
    dogGeo.rotateZ(Math.PI / 2);
    const dog = new THREE.Mesh(dogGeo, gearMat);
    dog.position.set(gx + 0.014, 0, 0.04);
    group.add(gear, dog);
  }

  // 4. Electro-Pneumatic Paddle-Shift Solenoid Block
  const pneuBlockGeo = new THREE.BoxGeometry(0.12, 0.09, 0.06);
  const pneuBlock = new THREE.Mesh(pneuBlockGeo, accentMat);
  pneuBlock.position.set(0.18, 0, spec.gearboxHeightM / 2 + 0.04);
  group.add(pneuBlock);

  [-0.03, 0.03].forEach((sy) => {
    const solValveGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.045, 16);
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
  const inputPinionGeo = new THREE.CylinderGeometry(0.032, 0.032, 0.035, 24);
  inputPinionGeo.rotateZ(Math.PI / 2);
  const inputPinion = new THREE.Mesh(inputPinionGeo, gearMat);
  inputPinion.position.set(0.02, 0, 0.06);

  const intermediateGearGeo = new THREE.CylinderGeometry(0.078, 0.078, 0.035, 32);
  intermediateGearGeo.rotateZ(Math.PI / 2);
  const intermediateGear = new THREE.Mesh(intermediateGearGeo, gearMat);
  intermediateGear.position.set(0.10, 0, -0.01);
  group.add(inputPinion, intermediateGear);

  // 3. Electro-Mechanical Park Lock Pawl Wheel & Solenoid
  const parkLockGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.018, 16);
  parkLockGeo.rotateZ(Math.PI / 2);
  const parkLock = new THREE.Mesh(parkLockGeo, billetMat);
  parkLock.position.set(0.16, 0, 0.06);

  const parkActuatorGeo = new THREE.BoxGeometry(0.06, 0.05, 0.07);
  const parkActuator = new THREE.Mesh(parkActuatorGeo, polymerMat);
  parkActuator.position.set(0.16, 0, 0.15);
  group.add(parkLock, parkActuator);

  // 4. Liquid Glycol Cooling Ports
  [-0.04, 0.04].forEach((py) => {
    const portGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.03, 16);
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

  // 2. Dual Variable Conical Pulley Sheaves (Primary Input & Secondary Output)
  const primarySheaveGeo = new THREE.ConeGeometry(0.08, 0.04, 24);
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
  const beltGeo = new THREE.TorusGeometry(0.11, 0.012, 10, 32);
  beltGeo.rotateY(Math.PI / 2);
  const belt = new THREE.Mesh(beltGeo, gearMat);
  belt.position.set(0.14, 0, 0);
  group.add(belt);

  // 4. Hydraulic Pressure Pump Housing & Fluid Filter
  const pumpGeo = new THREE.CylinderGeometry(0.038, 0.038, 0.06, 16);
  pumpGeo.rotateZ(Math.PI / 2);
  const pump = new THREE.Mesh(pumpGeo, accentMat);
  pump.position.set(0.02, 0.16, 0.08);

  const filterGeo = new THREE.CylinderGeometry(0.028, 0.028, 0.08, 16);
  const filter = new THREE.Mesh(filterGeo, polymerMat);
  filter.position.set(0.02, 0.16, -0.08);
  group.add(pump, filter);

  addDifferentialAndFlanges(group, 0.32, 0.30, casingMat, gearMat);

  root.add(group);
}

// ============================================================================
// HELPER: DIFFERENTIAL BULGE & CV DRIVE FLANGES
// ============================================================================
function addDifferentialAndFlanges(
  parent: THREE.Group,
  diffX: number,
  widthM: number,
  diffMat: THREE.Material,
  flangeMat: THREE.Material
) {
  // Center Crown Wheel Differential Carrier Bulge
  const diffSphereGeo = new THREE.SphereGeometry(0.12, 24, 20);
  const diffSphere = new THREE.Mesh(diffSphereGeo, diffMat);
  diffSphere.position.set(diffX, 0, -0.02);
  parent.add(diffSphere);

  // Dual 108mm Porsche-Style 6-Bolt CV Drive Flange Hubs
  [-1, 1].forEach((dir) => {
    const yPos = dir * (widthM / 2 + 0.03);

    const flangeGeo = new THREE.CylinderGeometry(0.054, 0.054, 0.028, 28);
    flangeGeo.rotateX(Math.PI / 2);
    const flange = new THREE.Mesh(flangeGeo, flangeMat);
    flange.position.set(diffX, yPos, -0.02);
    flange.castShadow = true;
    parent.add(flange);

    // 6 Perimeter M10 Aerospace CV Bolts
    for (let b = 0; b < 6; b++) {
      const bAngle = (b * Math.PI * 2) / 6;
      const bz = Math.sin(bAngle) * 0.040;
      const bx = Math.cos(bAngle) * 0.040;

      const boltGeo = new THREE.CylinderGeometry(0.004, 0.004, 0.014, 12);
      boltGeo.rotateX(Math.PI / 2);
      const bolt = new THREE.Mesh(boltGeo, flangeMat);
      bolt.position.set(diffX + bx, yPos + dir * 0.014, -0.02 + bz);
      parent.add(bolt);
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
