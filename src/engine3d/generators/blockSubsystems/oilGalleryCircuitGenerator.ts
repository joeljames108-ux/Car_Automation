// ============================================================================
// MODULAR GLB GENERATOR — 60° V12 HIGH-PRESSURE LUBRICATION GALLERY CIRCUIT
// ============================================================================
// Solid-modeling generator for the engine block's internal lubrication network:
// main 14mm longitudinal pressure rifle, 7 main journal feeder passages, 12 under-
// piston cooling oil squirt jets with check valves, dual low-resistance gravity
// drainback chutes, oil pressure regulator valve, and side oil filter console.
// ============================================================================

import * as THREE from 'three';
import type { V12BlockMaterialPalette } from '../engineBlockGenerator';

// ============================================================================
// 1. OIL GALLERY SPECIFICATION CONSTANTS
// ============================================================================

export interface OilGallerySpec {
  mainRifleDiameterMm: number; // 14.0 mm main longitudinal rifle
  mainRifleRadiusM: number; // 0.007 m
  mainRifleLengthMm: number; // 700.0 mm total block length
  feederDrillDiameterMm: number; // 8.0 mm feed to main journals
  feederDrillRadiusM: number; // 0.004 m
  squirtNozzleDiameterMm: number; // 3.2 mm under-piston squirt orifice
  squirtNozzleRadiusM: number; // 0.0016 m
  squirtBodyLengthMm: number; // 24.0 mm brass jet body
  squirtBodyLengthM: number; // 0.024 m
  drainbackChuteWidthMm: number; // 22.0 mm gravity return channel
  drainbackChuteWidthM: number; // 0.022 m
  filterConsoleDiameterMm: number; // 96.0 mm spin-on filter mounting pad
  filterConsoleRadiusM: number; // 0.048 m
  coolerPortFitting: 'AN-10' | 'AN-12';
}

export const V12_OIL_GALLERY_SPECS: OilGallerySpec = {
  mainRifleDiameterMm: 14.0,
  mainRifleRadiusM: 0.007,
  mainRifleLengthMm: 700.0,
  feederDrillDiameterMm: 8.0,
  feederDrillRadiusM: 0.004,
  squirtNozzleDiameterMm: 3.2,
  squirtNozzleRadiusM: 0.0016,
  squirtBodyLengthMm: 24.0,
  squirtBodyLengthM: 0.024,
  drainbackChuteWidthMm: 22.0,
  drainbackChuteWidthM: 0.022,
  filterConsoleDiameterMm: 96.0,
  filterConsoleRadiusM: 0.048,
  coolerPortFitting: 'AN-10',
};

// ============================================================================
// 2. 12 UNDER-PISTON COOLING SQUIRT JET BUILDER
// ============================================================================

export interface SquirtJetConfig {
  cylinderNumber: number; // 1 through 12
  bank: 'left' | 'right';
  positionX: number;
  spec: OilGallerySpec;
}

/**
 * Builds a single brass under-piston oil cooling jet with internal pressure
 * check valve and precision angled spray nozzle targeted at the piston crown underside.
 */
export function buildSinglePistonCoolingJet(
  config: SquirtJetConfig,
  materials: V12BlockMaterialPalette
): THREE.Group {
  const { cylinderNumber, bank, positionX, spec } = config;
  const isLeft = bank === 'left';
  const group = new THREE.Group();
  group.name = `Piston_Cooling_Jet_Cyl_${cylinderNumber}`;

  // Position at the lower cylinder base along the main gallery
  const bankY = isLeft ? 0.075 : -0.075;
  group.position.set(positionX, bankY, 0.09);

  // 1. Threaded Brass Hex Retaining Body
  const bodyGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.014, 6);
  bodyGeo.rotateX(Math.PI / 2);
  const bodyMesh = new THREE.Mesh(bodyGeo, materials.brassFreezePlug);
  bodyMesh.name = `Squirt_Hex_Body_${cylinderNumber}`;
  bodyMesh.castShadow = true;
  group.add(bodyMesh);

  // 2. Angled Precision Micro-Spray Nozzle Tube
  const nozzleGeo = new THREE.CylinderGeometry(
    spec.squirtNozzleRadiusM,
    spec.squirtNozzleRadiusM,
    spec.squirtBodyLengthM,
    16
  );
  // Angle nozzle upwards toward the underside of the piston crown (30° tilt)
  nozzleGeo.rotateZ(isLeft ? Math.PI / 6 : -Math.PI / 6);
  const nozzleMesh = new THREE.Mesh(nozzleGeo, materials.brassFreezePlug);
  nozzleMesh.name = `Squirt_Nozzle_Tube_${cylinderNumber}`;
  nozzleMesh.position.set(0, isLeft ? 0.008 : -0.008, 0.014);
  nozzleMesh.castShadow = true;
  group.add(nozzleMesh);

  // 3. Pressure Check Valve Relief Ball & Spring Seat
  const valveGeo = new THREE.SphereGeometry(0.0025, 12, 12);
  const valveMesh = new THREE.Mesh(valveGeo, materials.arpHardenedFastener);
  valveMesh.name = `Check_Valve_Ball_${cylinderNumber}`;
  valveMesh.position.set(0, 0, 0);
  group.add(valveMesh);

  return group;
}

// ============================================================================
// 3. MASTER LUBRICATION CIRCUIT BUILDER
// ============================================================================

/**
 * Builds the complete physical oil lubrication circuit including the main rifle,
 * journal feeders, 12 piston squirt jets, drainback chutes, and filter console.
 */
export function buildV12OilGalleryCircuit(
  materials: V12BlockMaterialPalette
): THREE.Group {
  const group = new THREE.Group();
  group.name = '02_V12_Oil_Gallery_Circuit_Assembly';
  const spec = V12_OIL_GALLERY_SPECS;

  // ── A. Main Longitudinal High-Pressure Oil Rifle ──
  const mainRifleGeo = new THREE.CylinderGeometry(
    spec.mainRifleRadiusM,
    spec.mainRifleRadiusM,
    spec.mainRifleLengthMm / 1000,
    24
  );
  mainRifleGeo.rotateZ(Math.PI / 2);
  const mainRifleMesh = new THREE.Mesh(mainRifleGeo, materials.machinedDeckSurface);
  mainRifleMesh.name = 'Main_High_Pressure_Oil_Rifle';
  mainRifleMesh.position.set(0, -0.088, 0.12);
  mainRifleMesh.castShadow = true;
  group.add(mainRifleMesh);

  // ── B. 7 Angled Main Journal Oil Feeder Passages ──
  const feedPassageGeo = new THREE.CylinderGeometry(
    spec.feederDrillRadiusM,
    spec.feederDrillRadiusM,
    0.065,
    16
  );
  feedPassageGeo.rotateX(Math.PI / 4);

  for (let i = 0; i < 7; i++) {
    const mx = -0.30 + i * (0.60 / 6);
    const feedMesh = new THREE.Mesh(feedPassageGeo, materials.oilGalleryPassage);
    feedMesh.name = `Main_Journal_Oil_Feeder_${i + 1}`;
    feedMesh.position.set(mx, -0.044, 0.09);
    group.add(feedMesh);
  }

  // ── C. 12 Independent Piston Cooling Oil Squirt Jets ──
  // Bank 1 (Left 6 Jets)
  for (let c = 0; c < 6; c++) {
    const cylNum = c * 2 + 1;
    const px = -0.27 + c * 0.108;
    const jet = buildSinglePistonCoolingJet(
      {
        cylinderNumber: cylNum,
        bank: 'left',
        positionX: px,
        spec,
      },
      materials
    );
    group.add(jet);
  }

  // Bank 2 (Right 6 Jets with 15mm stagger)
  for (let c = 0; c < 6; c++) {
    const cylNum = (c + 1) * 2;
    const px = -0.27 + c * 0.108 + 0.015;
    const jet = buildSinglePistonCoolingJet(
      {
        cylinderNumber: cylNum,
        bank: 'right',
        positionX: px,
        spec,
      },
      materials
    );
    group.add(jet);
  }

  // ── D. Dual Oversized Outer Drainback Return Chutes ──
  // Left and Right gravity oil drain channels returning oil to the dry sump
  const chuteGeo = new THREE.BoxGeometry(0.64, spec.drainbackChuteWidthM, 0.16);

  [-0.14, 0.14].forEach((cy, chuteIdx) => {
    const chuteMesh = new THREE.Mesh(chuteGeo, materials.oilGalleryPassage);
    chuteMesh.name = `Gravity_Oil_Drainback_Chute_${chuteIdx === 0 ? 'Left' : 'Right'}`;
    chuteMesh.position.set(0, cy, 0.16);
    group.add(chuteMesh);
  });

  // ── E. High-Pressure Oil Filter Console & Spin-On Adapter Pad ──
  const filterConsoleGeo = new THREE.CylinderGeometry(
    spec.filterConsoleRadiusM,
    spec.filterConsoleRadiusM,
    0.024,
    36
  );
  filterConsoleGeo.rotateZ(Math.PI / 2);
  const filterConsoleMesh = new THREE.Mesh(filterConsoleGeo, materials.machinedDeckSurface);
  filterConsoleMesh.name = 'Oil_Filter_Mounting_Console';
  filterConsoleMesh.position.set(-0.24, 0.19, 0.07);
  filterConsoleMesh.castShadow = true;
  group.add(filterConsoleMesh);

  // Central Threaded Spin-On Spindle
  const spindleGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.038, 16);
  spindleGeo.rotateZ(Math.PI / 2);
  const spindleMesh = new THREE.Mesh(spindleGeo, materials.arpHardenedFastener);
  spindleMesh.name = 'Filter_Threaded_Spindle';
  spindleMesh.position.set(-0.24, 0.20, 0.07);
  group.add(spindleMesh);

  // Dual AN-10 External Oil Cooler Supply/Return Bungs
  const anFittingGeo = new THREE.CylinderGeometry(0.011, 0.011, 0.025, 6);
  anFittingGeo.rotateZ(Math.PI / 2);

  [-0.025, 0.025].forEach((fz, fittingIdx) => {
    const fittingMesh = new THREE.Mesh(anFittingGeo, materials.arpHardenedFastener);
    fittingMesh.name = `AN10_Cooler_Port_${fittingIdx === 0 ? 'Feed' : 'Return'}`;
    fittingMesh.position.set(-0.24, 0.195, 0.07 + fz);
    fittingMesh.castShadow = true;
    group.add(fittingMesh);
  });

  // ── F. Oil Pressure Relief Regulator Valve Boss ──
  const reliefBossGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.035, 16);
  const reliefMesh = new THREE.Mesh(reliefBossGeo, materials.machinedDeckSurface);
  reliefMesh.name = 'Oil_Pressure_Relief_Valve_Housing';
  reliefMesh.position.set(-0.32, -0.088, 0.12);
  reliefMesh.castShadow = true;
  group.add(reliefMesh);

  return group;
}

export default buildV12OilGalleryCircuit;
