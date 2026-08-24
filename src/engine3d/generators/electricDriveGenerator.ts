// ============================================================================
// ULTRA-HIGH-FIDELITY MODULAR GLB GENERATOR — ELECTRIC / HYBRID STATOR DRIVE UNIT
// ============================================================================
// Solid-modeling engineering generator for high-performance electric drive units
// and hybrid powertrain motor casings (e.g. Dual Axial-Flux / Permanent Magnet
// Synchronous Motor with integrated inverter junction, helical cooling jacket,
// copper hairpin winding overhangs, rotor sleeve, and 3-phase orange HV busbars).
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
  createKnurledBand,
  createORingSeal,
  createThreadedShaft,
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

export interface ElectricDriveSpec {
  statorOuterRadiusM: number; // 0.165 m (330 mm diameter motor casing)
  statorInnerRadiusM: number; // 0.115 m (230 mm stator bore)
  statorLengthM: number; // 0.280 m
  rotorRadiusM: number; // 0.112 m
  shaftDiameterM: number; // 0.048 m
  casingLengthM: number; // 0.360 m total with endbells
  voltageTier: '400V' | '800V'; // 800V Silicon-Carbide high voltage architecture
}

export function computeElectricDriveSpecs(isHybrid: boolean = false): ElectricDriveSpec {
  return {
    statorOuterRadiusM: isHybrid ? 0.145 : 0.170,
    statorInnerRadiusM: isHybrid ? 0.095 : 0.120,
    statorLengthM: isHybrid ? 0.180 : 0.280,
    rotorRadiusM: isHybrid ? 0.092 : 0.117,
    shaftDiameterM: isHybrid ? 0.038 : 0.048,
    casingLengthM: isHybrid ? 0.240 : 0.380,
    voltageTier: '800V',
  };
}

// ============================================================================
// 1. HELICAL WATER-COOLED STATOR CASING & COOLING FINS
// ============================================================================

export function buildElectricStatorCasing(
  specs: ElectricDriveSpec,
  materials: V12BlockMaterialPalette
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Electric_Stator_Casing';

  // Main Cylindrical Aluminum Casing Body
  const casingGeo = new THREE.CylinderGeometry(
    specs.statorOuterRadiusM,
    specs.statorOuterRadiusM,
    specs.statorLengthM,
    36,
    1,
    true
  );
  casingGeo.rotateZ(Math.PI / 2);
  const casingMesh = new THREE.Mesh(casingGeo, materials.castAluminumBlock);
  casingMesh.castShadow = true;
  casingMesh.receiveShadow = true;
  group.add(casingMesh);

  // Circumferential Heat Dissipation & Structural Ribs
  const finCount = Math.floor(specs.statorLengthM / 0.024);
  for (let f = 0; f <= finCount; f++) {
    const fX = -specs.statorLengthM / 2 + f * (specs.statorLengthM / finCount);
    const finGeo = new THREE.TorusGeometry(specs.statorOuterRadiusM + 0.006, 0.003, 8, 36);
    finGeo.rotateY(Math.PI / 2);
    finGeo.translate(fX, 0, 0);
    const finMesh = new THREE.Mesh(finGeo, materials.machinedDeckSurface);
    group.add(finMesh);
  }

  // Internal Helical Spiral Cooling Channel Jacket
  const jacketGeo = new THREE.CylinderGeometry(
    specs.statorOuterRadiusM - 0.008,
    specs.statorOuterRadiusM - 0.008,
    specs.statorLengthM * 0.92,
    32,
    1,
    true
  );
  jacketGeo.rotateZ(Math.PI / 2);
  const jacketMesh = new THREE.Mesh(jacketGeo, materials.coolantJacketInterior);
  group.add(jacketMesh);

  // Dual Coolant Inlet/Outlet AN-Fittings (Cobalt Blue Anodized)
  for (const [zSign, label] of [
    [-1, 'Coolant_Inlet_AN8'],
    [1, 'Coolant_Outlet_AN8'],
  ] as const) {
    const fittingGroup = new THREE.Group();
    fittingGroup.name = label;
    fittingGroup.position.set(-specs.statorLengthM * 0.35, specs.statorOuterRadiusM + 0.015, zSign * 0.065);

    const fittingBody = new THREE.CylinderGeometry(0.014, 0.014, 0.028, 16);
    const fMesh = new THREE.Mesh(fittingBody, globalMaterialLibrary.getCobaltAnodized());
    fittingGroup.add(fMesh);

    const nutHex = createHexBoltHead(0.016, 0.012);
    nutHex.translate(0, -0.006, 0);
    const nMesh = new THREE.Mesh(nutHex, globalMaterialLibrary.getGoldAnodized());
    fittingGroup.add(nMesh);

    group.add(fittingGroup);
  }

  return group;
}

// ============================================================================
// 2. STATOR CORE LAMINATIONS & COPPER HAIRPIN WINDINGS
// ============================================================================

export function buildStatorHairpinWindings(
  specs: ElectricDriveSpec,
  materials: V12BlockMaterialPalette
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Stator_Hairpin_Windings';

  // Laminated Silicon-Steel Stator Iron Core
  const coreGeo = new THREE.CylinderGeometry(
    specs.statorOuterRadiusM - 0.015,
    specs.statorInnerRadiusM,
    specs.statorLengthM * 0.78,
    36,
    1,
    true
  );
  coreGeo.rotateZ(Math.PI / 2);
  const coreMesh = new THREE.Mesh(coreGeo, materials.arpHardenedFastener);
  group.add(coreMesh);

  // Copper Hairpin Winding Crown Overhangs (Front & Rear Winding Baskets)
  const pinCount = 48; // 48-slot high-density hairpin stator
  const pinRadius = (specs.statorInnerRadiusM + specs.statorOuterRadiusM - 0.015) / 2;

  const copperMat = globalMaterialLibrary.getGoldAnodized(); // Lustrous bright copper/gold

  for (const xSign of [-1, 1]) {
    const crownX = xSign * (specs.statorLengthM * 0.42);
    const crownGroup = new THREE.Group();
    crownGroup.name = `Hairpin_Crown_${xSign > 0 ? 'Front' : 'Rear'}`;

    const crownGeos: THREE.BufferGeometry[] = [];

    for (let p = 0; p < pinCount; p++) {
      const angle = (p * Math.PI * 2) / pinCount;
      const pZ = Math.sin(angle) * pinRadius;
      const pY = Math.cos(angle) * pinRadius;

      // Twisted rectangular copper hairpin wire
      const pin = new THREE.BoxGeometry(0.024, 0.005, 0.0035);
      pin.rotateZ((xSign * Math.PI) / 6);
      pin.rotateX(angle);
      pin.translate(crownX, pY, pZ);
      crownGeos.push(pin);
    }

    if (crownGeos.length > 0) {
      const mergedCrown = mergeBufferGeometries(crownGeos);
      const crownMesh = new THREE.Mesh(mergedCrown, copperMat);
      crownMesh.castShadow = true;
      crownGroup.add(crownMesh);
    }

    // High-Temp Amber/Red Insulating Resin Potting Ring
    const pottingRing = new THREE.TorusGeometry(pinRadius, 0.012, 12, 36);
    pottingRing.rotateY(Math.PI / 2);
    pottingRing.translate(crownX + xSign * 0.005, 0, 0);
    const pottingMesh = new THREE.Mesh(pottingRing, materials.gasketChannel);
    crownGroup.add(pottingMesh);

    group.add(crownGroup);
  }

  return group;
}

// ============================================================================
// 3. INTERNAL PERMANENT MAGNET ROTOR & HOLLOW SHAFT
// ============================================================================

export function buildElectricRotorAssembly(
  specs: ElectricDriveSpec,
  materials: V12BlockMaterialPalette
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Electric_Rotor_Assembly';

  // Carbon-Fiber Wrapped Magnet Retention Sleeve
  const sleeveGeo = new THREE.CylinderGeometry(
    specs.rotorRadiusM,
    specs.rotorRadiusM,
    specs.statorLengthM * 0.76,
    32
  );
  sleeveGeo.rotateZ(Math.PI / 2);
  const sleeveMesh = new THREE.Mesh(sleeveGeo, globalMaterialLibrary.getDryCarbonFiber());
  group.add(sleeveMesh);

  // Central Hollow Splined Rotor Output Shaft
  const shaftLength = specs.casingLengthM * 1.12;
  const shaftGeo = new THREE.CylinderGeometry(
    specs.shaftDiameterM / 2,
    specs.shaftDiameterM / 2,
    shaftLength,
    28
  );
  shaftGeo.rotateZ(Math.PI / 2);
  const shaftMesh = new THREE.Mesh(shaftGeo, materials.machinedDeckSurface);
  group.add(shaftMesh);

  // Internal Gun-Drilled Cooling Oil Hole
  const oilBoreGeo = new THREE.CylinderGeometry(0.010, 0.010, shaftLength + 0.002, 20);
  oilBoreGeo.rotateZ(Math.PI / 2);
  const boreMesh = new THREE.Mesh(oilBoreGeo, materials.oilGalleryPassage);
  group.add(boreMesh);

  // Output Splines on front shaft snout
  const splineBand = createKnurledBand(specs.shaftDiameterM / 2, 0.045, 24, 0.002);
  splineBand.rotateZ(Math.PI / 2);
  splineBand.translate(specs.casingLengthM / 2 + 0.015, 0, 0);
  const splineMesh = new THREE.Mesh(splineBand, materials.machinedDeckSurface);
  group.add(splineMesh);

  // High-Resolution Optical/Magnetic Speed Resolver Ring
  const resolverGeo = new THREE.CylinderGeometry(0.038, 0.038, 0.018, 32);
  resolverGeo.rotateZ(Math.PI / 2);
  resolverGeo.translate(-specs.statorLengthM * 0.46, 0, 0);
  const resolverMesh = new THREE.Mesh(resolverGeo, globalMaterialLibrary.getTitaniumAerospace());
  group.add(resolverMesh);

  return group;
}

// ============================================================================
// 4. HIGH-VOLTAGE 3-PHASE TERMINAL JUNCTION BOX (ORANGE HV BUSBARS)
// ============================================================================

export function buildElectricHVTerminalBox(
  specs: ElectricDriveSpec,
  materials: V12BlockMaterialPalette
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'HV_Terminal_Junction_Box';
  group.position.set(0, specs.statorOuterRadiusM + 0.045, 0);

  // Shielded Die-Cast Aluminum Terminal Enclosure Box
  const boxGeo = new THREE.BoxGeometry(0.140, 0.075, 0.160);
  const boxMesh = new THREE.Mesh(boxGeo, materials.castAluminumBlock);
  group.add(boxMesh);

  // Top CNC Machined Inspection Lid with Perimeter M5 Fasteners
  const lidGeo = new THREE.BoxGeometry(0.144, 0.010, 0.164);
  const lidMesh = new THREE.Mesh(lidGeo, materials.machinedDeckSurface);
  lidMesh.position.set(0, 0.042, 0);
  group.add(lidMesh);

  // 8 Perimeter M5 Lid Bolts
  for (let bx = -0.060; bx <= 0.060; bx += 0.060) {
    for (let bz = -0.070; bz <= 0.070; bz += 0.070) {
      const bolt = createAllenSocketHead(0.004, 0.006);
      const bMesh = new THREE.Mesh(bolt, materials.arpHardenedFastener);
      bMesh.position.set(bx, 0.048, bz);
      group.add(bMesh);
    }
  }

  // 3-Phase High-Voltage Orange Power Cables & Glands (U, V, W Phases)
  // Standard EV Safety High-Voltage Safety Orange (#f97316)
  const hvOrangeMat = new THREE.MeshStandardMaterial({
    name: 'PBR_HV_Safety_Orange',
    color: 0xf97316,
    metalness: 0.20,
    roughness: 0.35,
    envMapIntensity: 1.4,
  });

  for (let ph = -1; ph <= 1; ph++) {
    const cableZ = ph * 0.045;
    const glandGroup = new THREE.Group();
    glandGroup.position.set(0.072, 0, cableZ);

    // Cable Gland Housing
    const glandGeo = new THREE.CylinderGeometry(0.016, 0.018, 0.024, 20);
    glandGeo.rotateZ(Math.PI / 2);
    const glandMesh = new THREE.Mesh(glandGeo, materials.machinedDeckSurface);
    glandGroup.add(glandMesh);

    // Orange High-Voltage Shielded Cable
    const cableGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.045, 20);
    cableGeo.rotateZ(Math.PI / 2);
    cableGeo.translate(0.022, 0, 0);
    const cableMesh = new THREE.Mesh(cableGeo, hvOrangeMat);
    glandGroup.add(cableMesh);

    // Heavy Copper Terminal Lug Stud
    const lugGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.018, 12);
    lugGeo.translate(-0.035, 0, 0);
    const lugMesh = new THREE.Mesh(lugGeo, globalMaterialLibrary.getGoldAnodized());
    glandGroup.add(lugMesh);

    group.add(glandGroup);
  }

  // High-Voltage Interlock (HVIL) Micro-Connector Port
  const hvilGeo = new THREE.BoxGeometry(0.022, 0.018, 0.032);
  const hvilMesh = new THREE.Mesh(hvilGeo, materials.arpHardenedFastener);
  hvilMesh.position.set(-0.072, 0, 0);
  group.add(hvilMesh);

  return group;
}

// ============================================================================
// 5. FRONT & REAR ENDBELL HOUSINGS & BEARING CARRIERS
// ============================================================================

export function buildElectricEndbells(
  specs: ElectricDriveSpec,
  materials: V12BlockMaterialPalette
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Electric_Endbells';

  for (const xSign of [-1, 1]) {
    const endX = xSign * (specs.casingLengthM / 2);
    const endGroup = new THREE.Group();
    endGroup.name = `Endbell_${xSign > 0 ? 'Front_Transmission' : 'Rear_Resolver'}`;
    endGroup.position.set(endX, 0, 0);

    // Circular Endbell Flange Plate
    const plateGeo = new THREE.CylinderGeometry(
      specs.statorOuterRadiusM * 1.05,
      specs.statorOuterRadiusM * 1.05,
      0.022,
      36
    );
    plateGeo.rotateZ(Math.PI / 2);
    const plateMesh = new THREE.Mesh(plateGeo, materials.machinedDeckSurface);
    endGroup.add(plateMesh);

    // Ceramic Hybrid Ball Bearing Carrier Pocket
    const bearingGeo = new THREE.CylinderGeometry(
      specs.shaftDiameterM / 2 + 0.022,
      specs.shaftDiameterM / 2 + 0.022,
      0.026,
      28
    );
    bearingGeo.rotateZ(Math.PI / 2);
    const bMesh = new THREE.Mesh(bearingGeo, materials.nikasilCylinderBore);
    endGroup.add(bMesh);

    // 12 Perimeter M8 Clamping Bolts
    const boltGeos: THREE.BufferGeometry[] = [];
    for (let b = 0; b < 12; b++) {
      const angle = (b * Math.PI * 2) / 12;
      const bZ = Math.sin(angle) * (specs.statorOuterRadiusM * 0.94);
      const bY = Math.cos(angle) * (specs.statorOuterRadiusM * 0.94);

      const bolt = createAllenSocketHead(0.006, 0.012);
      bolt.rotateZ((xSign * Math.PI) / 2);
      bolt.translate(xSign * 0.014, bY, bZ);
      boltGeos.push(bolt);
    }

    if (boltGeos.length > 0) {
      const mergedB = mergeBufferGeometries(boltGeos);
      const boltsMesh = new THREE.Mesh(mergedB, materials.arpHardenedFastener);
      endGroup.add(boltsMesh);
    }

    group.add(endGroup);
  }

  return group;
}

// ============================================================================
// 6. MASTER ELECTRIC DRIVE UNIT SCENE INTEGRATOR
// ============================================================================

export function buildElectricDriveScene(config?: Partial<EngineConfig> | number): THREE.Scene {
  const scene = new THREE.Scene();
  scene.name = 'Electric_Drive_Unit_Scene';

  const rootGroup = new THREE.Group();
  rootGroup.name = 'Electric_Drive_Unit_Master';
  scene.add(rootGroup);

  const isHybrid = typeof config === 'object' && config?.layout === 'hybrid';
  const specs = computeElectricDriveSpecs(isHybrid);
  const materials = createBlockMaterialPalette();

  // 1. Helical Stator Casing & Cooling Fins
  const casing = buildElectricStatorCasing(specs, materials);
  rootGroup.add(casing);

  // 2. Stator Core Laminations & Copper Hairpin Windings
  const windings = buildStatorHairpinWindings(specs, materials);
  rootGroup.add(windings);

  // 3. Carbon-Wrapped Rotor & Hollow Spline Shaft
  const rotor = buildElectricRotorAssembly(specs, materials);
  rootGroup.add(rotor);

  // 4. 800V High-Voltage 3-Phase Junction Box & Orange Cables
  const hvBox = buildElectricHVTerminalBox(specs, materials);
  rootGroup.add(hvBox);

  // 5. Front & Rear Endbells with Bearing Carriers
  const endbells = buildElectricEndbells(specs, materials);
  rootGroup.add(endbells);

  return scene;
}

export default buildElectricDriveScene;
