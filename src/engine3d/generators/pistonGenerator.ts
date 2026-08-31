// ============================================================================
// ULTRA-HIGH-FIDELITY MODULAR GLB GENERATOR — FORGED 2618 ALLOY RACING PISTON
// ============================================================================
// Solid-modeling engineering generator for an 88.0mm bore slipper-skirt racing
// piston forged from aerospace 2618-T6 aluminum alloy. Features CNC valve relief
// combustion dome pockets, plasma-sprayed ceramic thermal barrier crown coating,
// 3-piece gas-nitrided ring pack with accumulator groove, moly-coated anti-friction
// skirt panels with CNC weight-pad relief pockets, internal box-bridge X-truss stiffeners,
// under-crown forced cooling oil gallery, hollow DLC tool-steel wrist pin with spiral locks.
// ============================================================================

import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import type { EngineConfig } from '../../sim/types';
import { globalMaterialLibrary } from '../materials/pbrMaterialSystem';
import {
  createORingSeal,
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

export interface PistonSpec {
  boreMm: number;
  boreRadiusM: number;
  compressionHeightMm: number;
  crownThicknessM: number;
  pinDiameterMm: number;
  pinRadiusM: number;
  pinLengthM: number;
  topRingLandM: number;
  secondRingLandM: number;
  oilRingLandM: number;
  skirtWidthM: number;
  skirtHeightM: number;
}

export const V12_PISTON_SPECS: PistonSpec = {
  boreMm: 88.0,
  boreRadiusM: 0.044,
  compressionHeightMm: 32.0,
  crownThicknessM: 0.007,
  pinDiameterMm: 22.0,
  pinRadiusM: 0.011,
  pinLengthM: 0.054,
  topRingLandM: 0.006,
  secondRingLandM: 0.0035,
  oilRingLandM: 0.0025,
  skirtWidthM: 0.046,
  skirtHeightM: 0.038,
};

/**
 * Builds the complete ultra-high-fidelity 3D scene graph for a forged racing piston.
 */
export function buildPistonScene(configOrBore?: Partial<EngineConfig> | number): THREE.Scene {
  const scene = new THREE.Scene();
  scene.name = 'Forged_Racing_Piston_Scene';

  const rootGroup = new THREE.Group();
  rootGroup.name = 'Piston_Master_Assembly_Group';
  scene.add(rootGroup);

  const boreMm = typeof configOrBore === 'number' ? configOrBore : (configOrBore?.bore || 88.0);
  const boreRadiusM = (boreMm / 2) / 1000;

  const matLib = globalMaterialLibrary;
  const pistonMatType = typeof configOrBore === 'object' ? (configOrBore?.pistons || 'forged') : 'forged';
  const matPrimaryCrown =
    pistonMatType === 'cast' ? matLib.getCastAluminum() :
    pistonMatType === 'billet' ? matLib.getMachinedBillet() :
    pistonMatType === 'ceramic' ? matLib.getThermalBarrierCeramic() :
    matLib.getMachinedBillet();

  const matForgedBillet = matPrimaryCrown;
  const matThermalBarrier = matLib.getThermalBarrierCeramic();
  const matMolySkirt = new THREE.MeshPhysicalMaterial({
    name: 'Moly_AntiFriction_Skirt_Coating',
    color: new THREE.Color(0x1e293b),
    metalness: 0.35,
    roughness: 0.65,
clearcoat: 0.35,
clearcoatRoughness: 0.,
      });
  const matTopRing = new THREE.MeshPhysicalMaterial({
    name: 'Gas_Nitrided_Steel_Top_Ring',
    color: new THREE.Color(0x94a3b8),
    metalness: 0.90,
    roughness: 0.20,
clearcoat: 0.35,
clearcoatRoughness: 0.,
      });
  const matDlcPin = new THREE.MeshPhysicalMaterial({
    name: 'DLC_Diamond_Like_Carbon_WristPin',
    color: new THREE.Color(0x0f172a),
    metalness: 0.95,
    roughness: 0.12,
clearcoat: 0.35,
clearcoatRoughness: 0.,
      });
  const matBrassSpiroloc = matLib.getGoldAnodized();
  const matUnderCrown = matLib.getCastAluminum();

  const spec: PistonSpec = {
    ...V12_PISTON_SPECS,
    boreMm,
    boreRadiusM,
    skirtWidthM: boreRadiusM * 1.05,
    pinLengthM: boreRadiusM * 1.22,
  };

  // ─── 1. CNC FORGED PISTON CROWN & COMBUSTION DOME ───
  const crownGroup = new THREE.Group();
  crownGroup.name = 'Piston_Crown_Subsystem';

  // Main Cylinder Crown Body (High-precision 48-segment geometry)
  const crownGeo = new THREE.CylinderGeometry(spec.boreRadiusM - 0.0006, spec.boreRadiusM - 0.0006, 0.022, 48);
  const crownMesh = new THREE.Mesh(crownGeo, matForgedBillet);
  crownMesh.name = 'Piston_Crown_Main_Body';
  crownMesh.position.set(0, 0, 0.011);
  crownMesh.castShadow = true;
  crownMesh.receiveShadow = true;
  crownGroup.add(crownMesh);

  // Plasma-Sprayed Ceramic Thermal Barrier Crown Face Disc
  const tbcGeo = new THREE.CylinderGeometry(spec.boreRadiusM - 0.002, spec.boreRadiusM - 0.002, 0.0012, 48);
  const tbcMesh = new THREE.Mesh(tbcGeo, matThermalBarrier);
  tbcMesh.name = 'Thermal_Barrier_Ceramic_Coating_Disc';
  tbcMesh.position.set(0, 0, 0.0225);
  crownGroup.add(tbcMesh);

  // Raised High-Compression Dome Ridge (+12.5:1 Compression Ratio)
  const domeGeo = new THREE.CylinderGeometry(spec.boreRadiusM - 0.006, spec.boreRadiusM - 0.003, 0.004, 48);
  const domeMesh = new THREE.Mesh(domeGeo, matForgedBillet);
  domeMesh.name = 'High_Compression_Quench_Dome';
  domeMesh.position.set(0, 0, 0.024);
  domeMesh.castShadow = true;
  crownGroup.add(domeMesh);

  // Dual Intake Valve Relief Pockets (38mm Valve Cutouts, 22° Angle)
  [-0.016, 0.016].forEach((vx, vIdx) => {
    const intakePocketGeo = new THREE.CylinderGeometry(0.020, 0.020, 0.006, 32);
    intakePocketGeo.rotateX(THREE.MathUtils.degToRad(-15));
    const intakePocketMesh = new THREE.Mesh(intakePocketGeo, matForgedBillet);
    intakePocketMesh.name = `Intake_Valve_Relief_Pocket_${vIdx + 1}`;
    intakePocketMesh.position.set(vx, 0.014, 0.023);
    crownGroup.add(intakePocketMesh);
  });

  // Dual Exhaust Valve Relief Pockets (32mm Valve Cutouts, 20° Angle)
  [-0.014, 0.014].forEach((vx, vIdx) => {
    const exhaustPocketGeo = new THREE.CylinderGeometry(0.017, 0.017, 0.005, 32);
    exhaustPocketGeo.rotateX(THREE.MathUtils.degToRad(15));
    const exhaustPocketMesh = new THREE.Mesh(exhaustPocketGeo, matForgedBillet);
    exhaustPocketMesh.name = `Exhaust_Valve_Relief_Pocket_${vIdx + 1}`;
    exhaustPocketMesh.position.set(vx, -0.014, 0.023);
    crownGroup.add(exhaustPocketMesh);
  });

  // Under-Crown Oil Cooling Toroidal Cavity Gallery
  const galleryGeo = new THREE.TorusGeometry(spec.boreRadiusM - 0.014, 0.004, 16, 36);
  galleryGeo.rotateX(Math.PI / 2);
  const galleryMesh = new THREE.Mesh(galleryGeo, matUnderCrown);
  galleryMesh.name = 'UnderCrown_Oil_Cooling_Gallery';
  galleryMesh.position.set(0, 0, 0.008);
  crownGroup.add(galleryMesh);

  rootGroup.add(crownGroup);

  // ─── 2. 3-PIECE GAS-NITRIDED RING PACK & ACCUMULATOR GROOVES ───
  const ringGroup = new THREE.Group();
  ringGroup.name = 'Piston_Ring_Pack_Subsystem';

  // Ring Land Positions along Z axis (with realistic ring gap breaks)
  const ringSpecs = [
    { name: 'Top_Gas_Nitrided_Compression_Ring', z: 0.018, thickness: 0.0012, radius: spec.boreRadiusM, gapAngle: 0.2 },
    { name: 'Second_Napier_Hook_Scraper_Ring', z: 0.013, thickness: 0.0012, radius: spec.boreRadiusM, gapAngle: 3.3 },
    { name: 'Three_Piece_Oil_Control_Ring_Pack', z: 0.007, thickness: 0.0020, radius: spec.boreRadiusM, gapAngle: 1.8 },
  ];

  ringSpecs.forEach((r) => {
    // Outer Spring Steel Ring with End-Gap Arc Break
    const rGeo = new THREE.TorusGeometry(r.radius - 0.0004, r.thickness / 2, 16, 48, Math.PI * 1.95);
    rGeo.rotateX(Math.PI / 2);
    rGeo.rotateZ(r.gapAngle);
    const rMesh = new THREE.Mesh(rGeo, matTopRing);
    rMesh.name = r.name;
    rMesh.position.set(0, 0, r.z);
    ringGroup.add(rMesh);
  });

  // Accumulator Pressure Relief Groove between 1st and 2nd Ring Lands
  const accumGeo = new THREE.TorusGeometry(spec.boreRadiusM - 0.002, 0.0008, 12, 48);
  accumGeo.rotateX(Math.PI / 2);
  const accumMesh = new THREE.Mesh(accumGeo, matForgedBillet);
  accumMesh.name = 'Inter_Ring_Pressure_Accumulator_Groove';
  accumMesh.position.set(0, 0, 0.0155);
  ringGroup.add(accumMesh);

  // 12 Radial CNC Oil Drainback Holes behind Oil Ring (Enhanced from 8 to 12)
  for (let h = 0; h < 12; h++) {
    const angle = (h * Math.PI * 2) / 12;
    const hx = Math.sin(angle) * (spec.boreRadiusM - 0.004);
    const hy = Math.cos(angle) * (spec.boreRadiusM - 0.004);

    const holeGeo = new THREE.CylinderGeometry(0.0012, 0.0012, 0.008, 16);
    holeGeo.rotateX(Math.PI / 2);
    const holeMesh = new THREE.Mesh(holeGeo, matUnderCrown);
    holeMesh.name = `Oil_Drainback_Drilling_${h + 1}`;
    holeMesh.position.set(hx, hy, 0.007);
    ringGroup.add(holeMesh);
  }

  rootGroup.add(ringGroup);

  // ─── 3. ASYMMETRIC SLIPPER SKIRT & INTERNAL BOX-BRIDGE WEB ───
  const skirtGroup = new THREE.Group();
  skirtGroup.name = 'Slipper_Skirt_Subsystem';

  // Major Thrust (+Y) and Minor Anti-Thrust (-Y) Skirt Panels
  [-0.032, 0.032].forEach((sy, sIdx) => {
    const isThrust = sIdx === 1;
    const sWidth = isThrust ? spec.skirtWidthM : spec.skirtWidthM - 0.006;

    // Curved Outer Skirt Panel (Smooth 32 segments)
    const panelGeo = new THREE.CylinderGeometry(
      spec.boreRadiusM - 0.0008,
      spec.boreRadiusM - 0.0008,
      spec.skirtHeightM,
      32,
      1,
      true,
      isThrust ? Math.PI * 0.25 : Math.PI * 1.25,
      Math.PI * 0.5
    );
    panelGeo.rotateX(Math.PI / 2);
    const panelMesh = new THREE.Mesh(panelGeo, matMolySkirt);
    panelMesh.name = `Moly_Coated_Skirt_Panel_${isThrust ? 'Thrust' : 'AntiThrust'}`;
    panelMesh.position.set(0, 0, -0.012);
    panelMesh.castShadow = true;
    skirtGroup.add(panelMesh);
  });

  // Internal Box-Bridge X-Truss Stiffeners
  [-0.016, 0.016].forEach((tx, tIdx) => {
    const trussGeo = new THREE.BoxGeometry(0.006, 0.052, 0.026);
    const trussMesh = new THREE.Mesh(trussGeo, matUnderCrown);
    trussMesh.name = `Box_Bridge_Truss_Rib_${tIdx + 1}`;
    trussMesh.position.set(tx, 0, -0.008);
    trussMesh.castShadow = true;
    skirtGroup.add(trussMesh);

    // CNC Weight-Pad Lightening Recess Pockets
    const pocketGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.004, 16);
    pocketGeo.rotateZ(Math.PI / 2);
    const pocketMesh = new THREE.Mesh(pocketGeo, matForgedBillet);
    pocketMesh.name = `Weight_Reduction_Pocket_${tIdx + 1}`;
    pocketMesh.position.set(tx, 0, -0.016);
    skirtGroup.add(pocketMesh);
  });

  rootGroup.add(skirtGroup);

  // ─── 4. DLC TOOL-STEEL WRIST PIN & SPIROLOC RETENTION CLIPS ───
  const pinGroup = new THREE.Group();
  pinGroup.name = 'DLC_Wrist_Pin_Subsystem';

  // DLC-Coated 22mm Hollow Pin Outer Sleeve
  const pinGeo = new THREE.CylinderGeometry(spec.pinRadiusM, spec.pinRadiusM, spec.pinLengthM, 36);
  pinGeo.rotateZ(Math.PI / 2);
  const pinMesh = new THREE.Mesh(pinGeo, matDlcPin);
  pinMesh.name = 'DLC_Tool_Steel_Wrist_Pin';
  pinMesh.position.set(0, 0, -0.008);
  pinMesh.castShadow = true;
  pinGroup.add(pinMesh);

  // Gun-Drilled Center Tapered Hollow Bore (Lightweight)
  const pinHollowGeo = new THREE.CylinderGeometry(spec.pinRadiusM - 0.0035, spec.pinRadiusM - 0.0035, spec.pinLengthM + 0.002, 28);
  pinHollowGeo.rotateZ(Math.PI / 2);
  const pinHollowMesh = new THREE.Mesh(pinHollowGeo, matUnderCrown);
  pinHollowMesh.name = 'WristPin_Taper_Hollow_Bore';
  pinHollowMesh.position.set(0, 0, -0.008);
  pinGroup.add(pinHollowMesh);

  // Dual Spiroloc Retaining Rings on Pin Outer Ends
  [-spec.pinLengthM / 2 + 0.001, spec.pinLengthM / 2 - 0.001].forEach((px, pIdx) => {
    const lockGeo = new THREE.TorusGeometry(spec.pinRadiusM + 0.0015, 0.0008, 12, 32, Math.PI * 1.8);
    lockGeo.rotateY(Math.PI / 2);
    const lockMesh = new THREE.Mesh(lockGeo, matBrassSpiroloc);
    lockMesh.name = `Spiroloc_Pin_Retainer_${pIdx === 0 ? 'Left' : 'Right'}`;
    lockMesh.position.set(px, 0, -0.008);
    pinGroup.add(lockMesh);
  });

  // Forced Pin Bore Lubrication Feed Slots & Pin Anti-Rotation Boss
  [-0.018, 0.018].forEach((bx, bIdx) => {
    const feedGeo = new THREE.CylinderGeometry(0.002, 0.002, 0.012, 16);
    const feedMesh = new THREE.Mesh(feedGeo, matUnderCrown);
    feedMesh.name = `WristPin_Forced_Oil_Feed_Slot_${bIdx + 1}`;
    feedMesh.position.set(bx, 0, -0.002);
    pinGroup.add(feedMesh);
  });

  rootGroup.add(pinGroup);

  // ─── 5. EMBEDDED WRIST PIN MOUNT SOCKET FOR CONNECTING ROD ───
  const mountNode = new THREE.Object3D();
  mountNode.name = 'Piston_WristPin_Mount';
  mountNode.position.set(0, 0, -0.008);
  mountNode.userData = {
    isAttachmentPoint: true,
    category: 'connecting_rod_wrist_pin',
    acceptsType: 'connecting-rod',
  };
  rootGroup.add(mountNode);

  return scene;
}

/**
 * Exports the piston scene to a binary GLB ArrayBuffer.
 */
export async function generatePistonGlbBuffer(): Promise<ArrayBuffer> {
  const scene = buildPistonScene();
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

export default buildPistonScene;
