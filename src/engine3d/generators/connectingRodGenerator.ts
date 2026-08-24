// ============================================================================
// ULTRA-HIGH-FIDELITY MODULAR GLB GENERATOR — TITANIUM TI-6AL-4V H-BEAM ROD
// ============================================================================
// Solid-modeling engineering generator for a 140.0mm center-to-center forged
// titanium H-beam connecting rod. Features precision fracture-split interlocking
// rod cap, dual ARP Custom Age 625+ 12-point cap screws with threaded shanks,
// bi-metal journal bearing shells with locating tangs, shot-peened fatigue-resistant
// beam surface, balance weight pads, gun-drilled internal pressurized rifle channel,
// small-end oil squirter nozzle, and silicon-bronze pin bushing with forced oil scoop.
// ============================================================================

import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import type { EngineConfig } from '../../sim/types';
import { globalMaterialLibrary } from '../materials/pbrMaterialSystem';
import {
  create12PointHead,
  createThreadedShaft,
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

export interface ConnectingRodSpec {
  centerLengthMm: number; // 140.0 mm center-to-center
  centerLengthM: number; // 0.140 m
  bigEndBoreMm: number; // 52.0 mm (48mm crankpin + 4mm shell)
  bigEndBoreRadiusM: number; // 0.026 m
  bigEndOuterRadiusM: number; // 0.034 m
  bigEndWidthM: number; // 0.019 m
  smallEndBoreMm: number; // 24.0 mm (22mm pin + 2mm bronze)
  smallEndBoreRadiusM: number; // 0.012 m
  smallEndOuterRadiusM: number; // 0.018 m
  smallEndWidthM: number; // 0.021 m
  beamWidthTopM: number; // 0.016 m
  beamWidthBtmM: number; // 0.024 m
  beamDepthM: number; // 0.015 m
  flangeThicknessM: number; // 0.0035 m
  webThicknessM: number; // 0.0035 m
}

export const V12_ROD_SPECS: ConnectingRodSpec = {
  centerLengthMm: 140.0,
  centerLengthM: 0.140,
  bigEndBoreMm: 52.0,
  bigEndBoreRadiusM: 0.026,
  bigEndOuterRadiusM: 0.034,
  bigEndWidthM: 0.019,
  smallEndBoreMm: 24.0,
  smallEndBoreRadiusM: 0.012,
  smallEndOuterRadiusM: 0.018,
  smallEndWidthM: 0.021,
  beamWidthTopM: 0.016,
  beamWidthBtmM: 0.024,
  beamDepthM: 0.015,
  flangeThicknessM: 0.0035,
  webThicknessM: 0.0035,
};

/**
 * Builds the complete ultra-high-fidelity 3D scene graph for a titanium H-beam connecting rod.
 */
export function buildConnectingRodScene(configOrStroke?: Partial<EngineConfig> | number): THREE.Scene {
  const scene = new THREE.Scene();
  scene.name = 'Titanium_Connecting_Rod_Scene';

  const rootGroup = new THREE.Group();
  rootGroup.name = 'Connecting_Rod_Master_Assembly_Group';
  scene.add(rootGroup);

  const strokeMm = typeof configOrStroke === 'number' ? configOrStroke : (configOrStroke?.stroke || 82.0);
  const centerLengthMm = strokeMm * 1.70;
  const centerLengthM = centerLengthMm / 1000;

  const matLib = globalMaterialLibrary;
  const matTitanium = matLib.getMachinedBillet();
  const matShotPeen = matLib.getShotPeenedTitanium();
  const matArpBolt = new THREE.MeshStandardMaterial({
    name: 'ARP_CustomAge_625_Fastener',
    color: new THREE.Color(0x1e293b),
    metalness: 0.95,
    roughness: 0.18,
  });
  const matBronzeBushing = new THREE.MeshStandardMaterial({
    name: 'Silicon_Bronze_Pin_Bushing',
    color: new THREE.Color(0xd97706),
    metalness: 0.85,
    roughness: 0.32,
  });
  const matBearingShell = new THREE.MeshStandardMaterial({
    name: 'TriMetal_Bearing_Shell_Liner',
    color: new THREE.Color(0xcbd5e1),
    metalness: 0.90,
    roughness: 0.15,
  });
  const matDarkSteel = matLib.getCastAluminum();

  const spec: ConnectingRodSpec = {
    ...V12_ROD_SPECS,
    centerLengthMm,
    centerLengthM,
  };
  const halfLen = spec.centerLengthM / 2; // 0.070 m

  // ─── 1. FORGED TI-6AL-4V SHOT-PEENED H-BEAM COLUMN SHANK ───
  const shankGroup = new THREE.Group();
  shankGroup.name = 'H_Beam_Shank_Subsystem';

  // Central Shot-Peened Web Plate
  const webGeo = new THREE.BoxGeometry(spec.webThicknessM, 0.012, 0.088);
  const webMesh = new THREE.Mesh(webGeo, matShotPeen);
  webMesh.name = 'H_Beam_Central_Web_Plate';
  webMesh.position.set(0, 0, 0);
  webMesh.castShadow = true;
  webMesh.receiveShadow = true;
  shankGroup.add(webMesh);

  // Left & Right Lateral Polished Flange Rails
  [-0.009, 0.009].forEach((fy, fIdx) => {
    const flangeGeo = new THREE.BoxGeometry(spec.beamDepthM, spec.flangeThicknessM, 0.092);
    const flangeMesh = new THREE.Mesh(flangeGeo, matTitanium);
    flangeMesh.name = `H_Beam_Flange_Rail_${fIdx === 0 ? 'Left' : 'Right'}`;
    flangeMesh.position.set(0, fy, 0);
    flangeMesh.castShadow = true;
    flangeMesh.receiveShadow = true;
    shankGroup.add(flangeMesh);
  });

  // Gun-Drilled Internal Rifle Pressure Oil Channel (Connecting Big End to Wrist Pin)
  const rifleGeo = new THREE.CylinderGeometry(0.0018, 0.0018, spec.centerLengthM - 0.02, 16);
  const rifleMesh = new THREE.Mesh(rifleGeo, matDarkSteel);
  rifleMesh.name = 'Gun_Drilled_Rifle_Oil_Passage';
  rifleMesh.position.set(0, 0, 0);
  shankGroup.add(rifleMesh);

  rootGroup.add(shankGroup);

  // ─── 2. FRACTURE-SPLIT BIG END JOURNAL & ARP FASTENERS ───
  const bigEndGroup = new THREE.Group();
  bigEndGroup.name = 'Big_End_Journal_Subsystem';
  bigEndGroup.position.set(0, 0, -halfLen);

  // Upper Rod Body Big-End Saddle (Smooth 48 segments)
  const upperSaddleGeo = new THREE.CylinderGeometry(
    spec.bigEndOuterRadiusM,
    spec.bigEndOuterRadiusM,
    spec.bigEndWidthM,
    48,
    1,
    false,
    0,
    Math.PI
  );
  upperSaddleGeo.rotateZ(Math.PI / 2);
  const upperSaddleMesh = new THREE.Mesh(upperSaddleGeo, matTitanium);
  upperSaddleMesh.name = 'Big_End_Upper_Saddle';
  upperSaddleMesh.castShadow = true;
  upperSaddleMesh.receiveShadow = true;
  bigEndGroup.add(upperSaddleMesh);

  // Lower Precision Fracture-Split Rod Cap
  const lowerCapGeo = new THREE.CylinderGeometry(
    spec.bigEndOuterRadiusM,
    spec.bigEndOuterRadiusM,
    spec.bigEndWidthM,
    48,
    1,
    false,
    Math.PI,
    Math.PI
  );
  lowerCapGeo.rotateZ(Math.PI / 2);
  const lowerCapMesh = new THREE.Mesh(lowerCapGeo, matTitanium);
  lowerCapMesh.name = 'Fracture_Split_Lower_Rod_Cap';
  lowerCapMesh.castShadow = true;
  lowerCapMesh.receiveShadow = true;
  bigEndGroup.add(lowerCapMesh);

  // Bottom Balance Weight Pad Boss on Rod Cap
  const capWeightPadGeo = new THREE.BoxGeometry(0.024, spec.bigEndWidthM * 0.8, 0.005);
  const capWeightPadMesh = new THREE.Mesh(capWeightPadGeo, matTitanium);
  capWeightPadMesh.name = 'BigEnd_Balance_Weight_Pad';
  capWeightPadMesh.position.set(0, 0, -spec.bigEndOuterRadiusM - 0.002);
  bigEndGroup.add(capWeightPadMesh);

  // Fracture-Split Interlocking Serrated Joint Interfaces
  [-spec.bigEndOuterRadiusM + 0.004, spec.bigEndOuterRadiusM - 0.004].forEach((jx, jIdx) => {
    const jointGeo = new THREE.BoxGeometry(0.003, spec.bigEndWidthM + 0.001, 0.002);
    const jointMesh = new THREE.Mesh(jointGeo, matDarkSteel);
    jointMesh.name = `Fracture_Split_Joint_Interface_${jIdx === 0 ? 'Left' : 'Right'}`;
    jointMesh.position.set(jx, 0, 0);
    bigEndGroup.add(jointMesh);

    // Hardened Alignment Dowel Pins
    const dowelGeo = new THREE.CylinderGeometry(0.002, 0.002, 0.008, 16);
    const dowelMesh = new THREE.Mesh(dowelGeo, matArpBolt);
    dowelMesh.name = `Cap_Alignment_Dowel_${jIdx + 1}`;
    dowelMesh.position.set(jx, 0, 0);
    bigEndGroup.add(dowelMesh);
  });

  // Tri-Metal Journal Bearing Shell Liners with Anti-Rotation Tangs
  const shellGeo = new THREE.CylinderGeometry(
    spec.bigEndBoreRadiusM,
    spec.bigEndBoreRadiusM,
    spec.bigEndWidthM - 0.002,
    48,
    1,
    true
  );
  shellGeo.rotateZ(Math.PI / 2);
  const shellMesh = new THREE.Mesh(shellGeo, matBearingShell);
  shellMesh.name = 'TriMetal_BigEnd_Bearing_Shells';
  bigEndGroup.add(shellMesh);

  // Dual ARP Custom Age 625+ 12-Point Cap Screws with Threaded Shanks
  [-0.024, 0.024].forEach((bx, bIdx) => {
    // Threaded Bolt Shank
    const boltShankGeo = createThreadedShaft(0.0045, 0.048, 1.25);
    const boltShankMesh = new THREE.Mesh(boltShankGeo, matArpBolt);
    boltShankMesh.name = `ARP_Bolt_Shank_${bIdx + 1}`;
    boltShankMesh.position.set(bx, 0, -0.008);
    bigEndGroup.add(boltShankMesh);

    // 12-Point Flanged Socket Head (ARP Racing Spec)
    const boltHeadGeo = create12PointHead(0.0065, 0.009, 0.0085, 0.0025);
    const boltHeadMesh = new THREE.Mesh(boltHeadGeo, matArpBolt);
    boltHeadMesh.name = `ARP_12Point_Flange_Head_${bIdx + 1}`;
    boltHeadMesh.position.set(bx, 0, -0.034);
    boltHeadMesh.castShadow = true;
    bigEndGroup.add(boltHeadMesh);
  });

  rootGroup.add(bigEndGroup);

  // ─── 3. SMALL END PIN BORE, BUSHING & OIL SQUIRTER NOZZLE ───
  const smallEndGroup = new THREE.Group();
  smallEndGroup.name = 'Small_End_Bushing_Subsystem';
  smallEndGroup.position.set(0, 0, halfLen);

  // Small End Titanium Housing Ring (Smooth 48 segments)
  const smallHousingGeo = new THREE.CylinderGeometry(
    spec.smallEndOuterRadiusM,
    spec.smallEndOuterRadiusM,
    spec.smallEndWidthM,
    48
  );
  smallHousingGeo.rotateZ(Math.PI / 2);
  const smallHousingMesh = new THREE.Mesh(smallHousingGeo, matTitanium);
  smallHousingMesh.name = 'Small_End_Titanium_Eye';
  smallHousingMesh.castShadow = true;
  smallHousingMesh.receiveShadow = true;
  smallEndGroup.add(smallHousingMesh);

  // Small End Balance Weight Pad Top Boss
  const smallWeightPadGeo = new THREE.BoxGeometry(0.016, spec.smallEndWidthM * 0.75, 0.004);
  const smallWeightPadMesh = new THREE.Mesh(smallWeightPadGeo, matTitanium);
  smallWeightPadMesh.name = 'SmallEnd_Balance_Weight_Pad';
  smallWeightPadMesh.position.set(0, 0, spec.smallEndOuterRadiusM + 0.002);
  smallEndGroup.add(smallWeightPadMesh);

  // Press-Fit Silicon-Bronze Bushing with Chamfer
  const bushingGeo = new THREE.CylinderGeometry(
    spec.smallEndBoreRadiusM,
    spec.smallEndBoreRadiusM,
    spec.smallEndWidthM + 0.001,
    36,
    1,
    true
  );
  bushingGeo.rotateZ(Math.PI / 2);
  const bushingMesh = new THREE.Mesh(bushingGeo, matBronzeBushing);
  bushingMesh.name = 'Silicon_Bronze_WristPin_Bushing';
  smallEndGroup.add(bushingMesh);

  // Forced Oil Scoop Orifice at Top of Small End
  const scoopGeo = new THREE.CylinderGeometry(0.0025, 0.004, 0.008, 16);
  const scoopMesh = new THREE.Mesh(scoopGeo, matDarkSteel);
  scoopMesh.name = 'Pin_Forced_Oil_Feed_Scoop';
  scoopMesh.position.set(0, 0, spec.smallEndOuterRadiusM - 0.002);
  smallEndGroup.add(scoopMesh);

  // Angled Under-Piston Oil Squirter Nozzle (Directs oil mist at wrist pin)
  const squirterGeo = new THREE.CylinderGeometry(0.0012, 0.0012, 0.014, 12);
  squirterGeo.rotateX(Math.PI / 4);
  const squirterMesh = new THREE.Mesh(squirterGeo, matBronzeBushing);
  squirterMesh.name = 'UnderPiston_Oil_Squirter_Nozzle';
  squirterMesh.position.set(0, 0.012, -0.010);
  smallEndGroup.add(squirterMesh);

  rootGroup.add(smallEndGroup);

  // ─── 4. EMBEDDED ATTACHMENT SOCKETS FOR KINEMATIC SNAPPING ───
  const bigEndMount = new THREE.Object3D();
  bigEndMount.name = 'BigEnd_Journal_Mount';
  bigEndMount.position.set(0, 0, -halfLen);
  bigEndMount.userData = {
    isAttachmentPoint: true,
    category: 'connecting_rod_crank_journal',
  };
  rootGroup.add(bigEndMount);

  const smallEndMount = new THREE.Object3D();
  smallEndMount.name = 'SmallEnd_WristPin_Mount';
  smallEndMount.position.set(0, 0, halfLen);
  smallEndMount.userData = {
    isAttachmentPoint: true,
    category: 'connecting_rod_wrist_pin',
  };
  rootGroup.add(smallEndMount);

  return scene;
}

/**
 * Exports the connecting rod scene to a binary GLB ArrayBuffer.
 */
export async function generateConnectingRodGlbBuffer(): Promise<ArrayBuffer> {
  const scene = buildConnectingRodScene();
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

export default buildConnectingRodScene;
