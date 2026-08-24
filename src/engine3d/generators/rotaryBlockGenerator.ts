// ============================================================================
// ULTRA-HIGH-FIDELITY MODULAR GLB GENERATOR — ROTARY ENGINE BLOCK (2/3/4-ROTOR)
// ============================================================================
// Solid-modeling engineering generator for Wankel rotary engine blocks (2-Rotor,
// 3-Rotor, 4-Rotor e.g. Mazda 13B-REW / 20B-REW / 26B 4-Rotor racing architecture).
// Features analytical epitrochoid rotor housings with chrome-plated wear surfaces,
// ductile iron front/intermediate/rear side plates, 18-24 tension tie bolts,
// dual spark plug bosses (Leading & Trailing), perimeter coolant O-ring channels,
// and side intake/exhaust port tracts.
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
  createThreadedShaft,
  createEpitrochoidCurve,
  createFireRingGasketBead,
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

export interface RotaryBlockSpec {
  rotorCount: number; // 2, 3, or 4 rotors
  generatingRadiusR: number; // 0.105 m (105 mm generating radius)
  eccentricityE: number; // 0.015 m (15 mm rotor eccentricity)
  housingWidthM: number; // 0.080 m (80 mm rotor chamber width)
  ironPlateThicknessM: number; // 0.035 m (35 mm side housing plate thickness)
  totalLengthM: number; // dynamically computed
  shaftBoreRadiusM: number; // 0.026 m (52 mm eccentric shaft bearing bore)
}

export function computeRotarySpecs(rotors: number = 2): RotaryBlockSpec {
  const count = Math.max(2, Math.min(4, rotors));
  const housingWidthM = 0.080;
  const ironPlateThicknessM = 0.035;
  const plateCount = count + 1; // 2 rotors = 3 plates (Front, Middle, Rear)
  const totalLengthM = count * housingWidthM + plateCount * ironPlateThicknessM;

  return {
    rotorCount: count,
    generatingRadiusR: 0.105,
    eccentricityE: 0.015,
    housingWidthM,
    ironPlateThicknessM,
    totalLengthM,
    shaftBoreRadiusM: 0.026,
  };
}

// ============================================================================
// 1. EPITROCHOID ROTOR HOUSINGS & CHROME WORKING SURFACES
// ============================================================================

export function buildEpitrochoidRotorHousings(
  specs: RotaryBlockSpec,
  materials: V12BlockMaterialPalette
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Rotary_Epitrochoid_Housings';

  const curvePoints = createEpitrochoidCurve(specs.generatingRadiusR, specs.eccentricityE, 64);
  const innerShape = new THREE.Shape(curvePoints);

  // Outer housing rectangular perimeter shape
  const outerWidth = specs.generatingRadiusR * 2.45; // ~0.257m
  const outerHeight = specs.generatingRadiusR * 2.55; // ~0.268m

  for (let r = 0; r < specs.rotorCount; r++) {
    // Position of this rotor housing along X axis
    const rX = -specs.totalLengthM / 2 + specs.ironPlateThicknessM + r * (specs.housingWidthM + specs.ironPlateThicknessM) + specs.housingWidthM / 2;
    const housingGroup = new THREE.Group();
    housingGroup.name = `Rotor_Housing_${r + 1}`;
    housingGroup.position.set(rX, 0, 0);

    // ── 1.1 Outer Aluminum Casting Body ──
    const bodyShape = new THREE.Shape();
    bodyShape.moveTo(-outerWidth / 2, -outerHeight / 2);
    bodyShape.lineTo(outerWidth / 2, -outerHeight / 2);
    bodyShape.lineTo(outerWidth / 2, outerHeight / 2);
    bodyShape.lineTo(-outerWidth / 2, outerHeight / 2);
    bodyShape.closePath();
    bodyShape.holes.push(innerShape);

    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      steps: 1,
      depth: specs.housingWidthM,
      bevelEnabled: true,
      bevelThickness: 0.002,
      bevelSize: 0.002,
    };

    const housingGeo = new THREE.ExtrudeGeometry(bodyShape, extrudeSettings);
    housingGeo.rotateY(Math.PI / 2);
    housingGeo.translate(-specs.housingWidthM / 2, 0, 0);
    const housingMesh = new THREE.Mesh(housingGeo, materials.castAluminumBlock);
    housingMesh.castShadow = true;
    housingGroup.add(housingMesh);

    // ── 1.2 Inner Mirror-Chrome Plated Trochoid Wear Track ──
    const innerExtrudeGeo = new THREE.ExtrudeGeometry(innerShape, {
      steps: 1,
      depth: specs.housingWidthM,
      bevelEnabled: false,
    });
    innerExtrudeGeo.rotateY(Math.PI / 2);
    innerExtrudeGeo.translate(-specs.housingWidthM / 2, 0, 0);
    const innerMesh = new THREE.Mesh(innerExtrudeGeo, materials.nikasilCylinderBore);
    housingGroup.add(innerMesh);

    // ── 1.3 Leading & Trailing Spark Plug Bosses (M14 threaded ports) ──
    // Trailing (T) at top quadrant, Leading (L) below trailing
    const plugYPositions = [0.032, -0.015];
    const plugLabels = ['Trailing_T', 'Leading_L'];

    for (let p = 0; p < 2; p++) {
      const pY = plugYPositions[p];
      const plugBoss = new THREE.CylinderGeometry(0.012, 0.012, 0.035, 20);
      plugBoss.rotateZ(Math.PI / 2);
      plugBoss.translate(0, pY, outerWidth / 2 - 0.005);
      const bMesh = new THREE.Mesh(plugBoss, materials.machinedDeckSurface);
      bMesh.name = `Spark_Plug_Boss_${plugLabels[p]}`;
      housingGroup.add(bMesh);

      // Threaded spark plug well
      const plugHole = createAllenSocketHead(0.007, 0.016);
      plugHole.rotateZ(Math.PI / 2);
      plugHole.translate(0, pY, outerWidth / 2 + 0.010);
      const hMesh = new THREE.Mesh(plugHole, materials.arpHardenedFastener);
      housingGroup.add(hMesh);
    }

    // ── 1.4 Peripheral Exhaust Port Runner ──
    const exhaustPortGeo = new THREE.CylinderGeometry(0.024, 0.028, 0.045, 24);
    exhaustPortGeo.rotateX(Math.PI / 2);
    exhaustPortGeo.translate(0, -0.065, -outerWidth / 2 + 0.010);
    const exhaustMesh = new THREE.Mesh(exhaustPortGeo, materials.machinedDeckSurface);
    housingGroup.add(exhaustMesh);

    group.add(housingGroup);
  }

  return group;
}

// ============================================================================
// 2. FRONT, INTERMEDIATE & REAR DUCTILE IRON SIDE PLATES
// ============================================================================

export function buildRotarySidePlates(
  specs: RotaryBlockSpec,
  materials: V12BlockMaterialPalette
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Rotary_Side_Plates';

  const outerWidth = specs.generatingRadiusR * 2.45;
  const outerHeight = specs.generatingRadiusR * 2.55;
  const plateCount = specs.rotorCount + 1; // 3 for 2-rotor, 4 for 3-rotor

  for (let p = 0; p < plateCount; p++) {
    const isFront = p === 0;
    const isRear = p === plateCount - 1;
    const pX = -specs.totalLengthM / 2 + p * (specs.housingWidthM + specs.ironPlateThicknessM) + specs.ironPlateThicknessM / 2;

    const plateGroup = new THREE.Group();
    plateGroup.name = isFront ? 'Front_Iron_Plate' : isRear ? 'Rear_Iron_Plate' : `Intermediate_Iron_Plate_${p}`;
    plateGroup.position.set(pX, 0, 0);

    // Main Cast-Iron Plate Slab
    const plateGeo = new THREE.BoxGeometry(specs.ironPlateThicknessM, outerHeight, outerWidth);
    const plateMesh = new THREE.Mesh(plateGeo, materials.machinedDeckSurface);
    plateMesh.castShadow = true;
    plateMesh.receiveShadow = true;
    plateGroup.add(plateMesh);

    // Center Eccentric Shaft Bearing Stator Bore
    const statorGeo = new THREE.CylinderGeometry(specs.shaftBoreRadiusM + 0.008, specs.shaftBoreRadiusM + 0.008, specs.ironPlateThicknessM * 1.05, 32);
    statorGeo.rotateZ(Math.PI / 2);
    const statorMesh = new THREE.Mesh(statorGeo, materials.nikasilCylinderBore);
    plateGroup.add(statorMesh);

    // Stationary Gear Hub Mounting Flange (Front & Rear plates)
    if (isFront || isRear) {
      const gearHub = new THREE.CylinderGeometry(0.048, 0.048, 0.016, 24);
      gearHub.rotateZ(Math.PI / 2);
      gearHub.translate(isFront ? -specs.ironPlateThicknessM * 0.45 : specs.ironPlateThicknessM * 0.45, 0, 0);
      const gMesh = new THREE.Mesh(gearHub, materials.arpHardenedFastener);
      plateGroup.add(gMesh);
    }

    // Side Intake Ports (CNC D-shaped runners)
    for (const portY of [0.035, -0.025]) {
      const portGeo = new THREE.CylinderGeometry(0.016, 0.018, specs.ironPlateThicknessM * 1.02, 16);
      portGeo.rotateZ(Math.PI / 2);
      portGeo.translate(0, portY, 0.055);
      const portMesh = new THREE.Mesh(portGeo, materials.coolantJacketInterior);
      plateGroup.add(portMesh);
    }

    // Perimeter Viton O-Ring Sealing Bead Groove around plate face
    for (const faceSign of [-1, 1]) {
      const oRing = createFireRingGasketBead(specs.generatingRadiusR * 1.15, 0.003, 0.0012);
      oRing.rotateY(Math.PI / 2);
      oRing.translate(faceSign * (specs.ironPlateThicknessM / 2 + 0.0005), 0, 0);
      const oMesh = new THREE.Mesh(oRing, materials.gasketChannel);
      plateGroup.add(oMesh);
    }

    group.add(plateGroup);
  }

  return group;
}

// ============================================================================
// 3. THROUGH-TENSION TIE BOLT CLAMPING ARRAY (18 TO 24 STUDS)
// ============================================================================

export function buildRotaryTensionBolts(
  specs: RotaryBlockSpec,
  materials: V12BlockMaterialPalette
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Rotary_Tension_Bolts_Array';

  const outerRadius = specs.generatingRadiusR * 1.18;
  const boltCount = specs.rotorCount === 4 ? 24 : specs.rotorCount === 3 ? 20 : 18;
  const boltLength = specs.totalLengthM * 1.06;

  const boltGeos: THREE.BufferGeometry[] = [];

  for (let b = 0; b < boltCount; b++) {
    const angle = (b * Math.PI * 2) / boltCount;
    const bZ = Math.sin(angle) * (outerRadius * 0.95);
    const bY = Math.cos(angle) * (outerRadius * 1.05);

    // Continuous full-length tension tie bolt rod
    const shaft = createThreadedShaft(0.005, boltLength, 1.25, 0.0002);
    shaft.rotateZ(Math.PI / 2);
    shaft.translate(0, bY, bZ);
    boltGeos.push(shaft);

    // Front & Rear 12-Point Tension Flanged Nuts
    for (const xSign of [-1, 1]) {
      const nut = create12PointHead(0.008, 0.010, 0.012, 0.0025);
      nut.rotateZ((xSign * Math.PI) / 2);
      nut.translate(xSign * (boltLength / 2 - 0.005), bY, bZ);
      boltGeos.push(nut);
    }
  }

  if (boltGeos.length > 0) {
    const mergedB = mergeBufferGeometries(boltGeos);
    const boltsMesh = new THREE.Mesh(mergedB, materials.arpHardenedFastener);
    boltsMesh.castShadow = true;
    group.add(boltsMesh);
  }

  return group;
}

// ============================================================================
// 4. OIL METERING PUMP (OMP) & INJECTOR LINES
// ============================================================================

export function buildRotaryOilMeteringPump(
  specs: RotaryBlockSpec,
  materials: V12BlockMaterialPalette
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Rotary_Oil_Metering_Pump';

  const ompX = -specs.totalLengthM * 0.38;
  const ompGroup = new THREE.Group();
  ompGroup.position.set(ompX, -0.095, specs.generatingRadiusR * 1.15);

  // Stepper Motor Driven OMP Body
  const pumpBody = new THREE.BoxGeometry(0.045, 0.045, 0.040);
  const bodyMesh = new THREE.Mesh(pumpBody, materials.machinedDeckSurface);
  ompGroup.add(bodyMesh);

  // Stepper Actuator Cylindrical Cap
  const actuator = new THREE.CylinderGeometry(0.016, 0.016, 0.032, 20);
  actuator.translate(0, 0.032, 0);
  const actMesh = new THREE.Mesh(actuator, materials.arpHardenedFastener);
  ompGroup.add(actMesh);

  // Brass Micro-Lines delivering two-stroke premix/metered oil to rotor housings
  for (let r = 0; r < specs.rotorCount; r++) {
    const targetX = -specs.totalLengthM / 2 + specs.ironPlateThicknessM + r * (specs.housingWidthM + specs.ironPlateThicknessM) + specs.housingWidthM / 2;
    const lineGeo = new THREE.CylinderGeometry(0.0015, 0.0015, Math.abs(targetX - ompX) + 0.035, 8);
    lineGeo.rotateZ(Math.PI / 2);
    lineGeo.translate((targetX - ompX) / 2, 0.015, 0.018);
    const lineMesh = new THREE.Mesh(lineGeo, materials.brassFreezePlug);
    ompGroup.add(lineMesh);
  }

  group.add(ompGroup);
  return group;
}

// ============================================================================
// 5. MASTER ROTARY ENGINE BLOCK SCENE INTEGRATOR
// ============================================================================

export function buildRotaryBlockScene(config?: Partial<EngineConfig> | number): THREE.Scene {
  const scene = new THREE.Scene();
  scene.name = 'Rotary_Engine_Block_Scene';

  const rootGroup = new THREE.Group();
  rootGroup.name = 'Rotary_Engine_Block_Master';
  scene.add(rootGroup);

  let rotorCount = 2;
  if (typeof config === 'number') {
    rotorCount = config;
  } else if (config?.layout === 'rotary') {
    rotorCount = 2; // 2-rotor standard baseline
  }

  const specs = computeRotarySpecs(rotorCount);
  const materials = createBlockMaterialPalette(typeof config === 'object' ? config : undefined);

  // 1. Epitrochoid Rotor Housings & Chrome Trochoid Tracks
  const housings = buildEpitrochoidRotorHousings(specs, materials);
  rootGroup.add(housings);

  // 2. Front, Intermediate & Rear Side Iron Plates
  const sidePlates = buildRotarySidePlates(specs, materials);
  rootGroup.add(sidePlates);

  // 3. 18-24 Through-Tension Tie Bolts
  const tensionBolts = buildRotaryTensionBolts(specs, materials);
  rootGroup.add(tensionBolts);

  // 4. Oil Metering Pump & Injection Circuits
  const omp = buildRotaryOilMeteringPump(specs, materials);
  rootGroup.add(omp);

  return scene;
}

export default buildRotaryBlockScene;
