// ============================================================================
// ULTRA-HIGH-FIDELITY MODULAR GLB GENERATOR — FORGED 2618 ALLOY RACING PISTON
// ============================================================================
// Solid-modeling engineering generator for an 88.0mm bore slipper-skirt racing
// piston forged from aerospace 2618-T6 aluminum alloy. Features CNC valve relief
// combustion dome pockets, 3-piece gas-nitrided ring pack with accumulator groove,
// moly-coated anti-friction skirt panels, internal box-bridge X-truss stiffeners,
// hollow DLC tool-steel wrist pin with forced oil feed drillings, and spiral locks.
// ============================================================================

import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { globalMaterialLibrary } from '../materials/pbrMaterialSystem';

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
  boreMm: number; // 88.0 mm bore
  boreRadiusM: number; // 0.044 m
  compressionHeightMm: number; // 32.0 mm
  crownThicknessM: number; // 0.007 m
  pinDiameterMm: number; // 22.0 mm
  pinRadiusM: number; // 0.011 m
  pinLengthM: number; // 0.054 m
  topRingLandM: number; // 0.006 m
  secondRingLandM: number; // 0.0035 m
  oilRingLandM: number; // 0.0025 m
  skirtWidthM: number; // 0.046 m
  skirtHeightM: number; // 0.038 m
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
export function buildPistonScene(): THREE.Scene {
  const scene = new THREE.Scene();
  scene.name = 'Forged_Racing_Piston_Scene';

  const rootGroup = new THREE.Group();
  rootGroup.name = 'Piston_Master_Assembly_Group';
  scene.add(rootGroup);

  const matLib = globalMaterialLibrary;
  const matForgedBillet = matLib.getMachinedBillet();
  const matMolySkirt = new THREE.MeshStandardMaterial({
    name: 'Moly_AntiFriction_Skirt_Coating',
    color: new THREE.Color(0x1e293b),
    metalness: 0.35,
    roughness: 0.65,
  });
  const matTopRing = new THREE.MeshStandardMaterial({
    name: 'Gas_Nitrided_Steel_Top_Ring',
    color: new THREE.Color(0x94a3b8),
    metalness: 0.90,
    roughness: 0.20,
  });
  const matDlcPin = new THREE.MeshStandardMaterial({
    name: 'DLC_Diamond_Like_Carbon_WristPin',
    color: new THREE.Color(0x0f172a),
    metalness: 0.95,
    roughness: 0.12,
  });
  const matBrassSpiroloc = matLib.getGoldAnodized();
  const matUnderCrown = matLib.getCastAluminum();

  const spec = V12_PISTON_SPECS;

  // ─── 1. CNC FORGED PISTON CROWN & COMBUSTION DOME ───
  const crownGroup = new THREE.Group();
  crownGroup.name = 'Piston_Crown_Subsystem';

  // Main Cylinder Crown Body
  const crownGeo = new THREE.CylinderGeometry(spec.boreRadiusM - 0.0006, spec.boreRadiusM - 0.0006, 0.022, 36);
  const crownMesh = new THREE.Mesh(crownGeo, matForgedBillet);
  crownMesh.name = 'Piston_Crown_Main_Body';
  crownMesh.position.set(0, 0, 0.011);
  crownMesh.castShadow = true;
  crownMesh.receiveShadow = true;
  crownGroup.add(crownMesh);

  // Raised High-Compression Dome Ridge (+12.5:1 Compression Ratio)
  const domeGeo = new THREE.CylinderGeometry(spec.boreRadiusM - 0.006, spec.boreRadiusM - 0.003, 0.004, 32);
  const domeMesh = new THREE.Mesh(domeGeo, matForgedBillet);
  domeMesh.name = 'High_Compression_Quench_Dome';
  domeMesh.position.set(0, 0, 0.024);
  domeMesh.castShadow = true;
  crownGroup.add(domeMesh);

  // Dual Intake Valve Relief Pockets (38mm Valve Cutouts, 22° Angle)
  [-0.016, 0.016].forEach((vx, vIdx) => {
    const intakePocketGeo = new THREE.CylinderGeometry(0.020, 0.020, 0.006, 24);
    intakePocketGeo.rotateX(THREE.MathUtils.degToRad(-15));
    const intakePocketMesh = new THREE.Mesh(intakePocketGeo, matForgedBillet);
    intakePocketMesh.name = `Intake_Valve_Relief_Pocket_${vIdx + 1}`;
    intakePocketMesh.position.set(vx, 0.014, 0.023);
    crownGroup.add(intakePocketMesh);
  });

  // Dual Exhaust Valve Relief Pockets (32mm Valve Cutouts, 20° Angle)
  [-0.014, 0.014].forEach((vx, vIdx) => {
    const exhaustPocketGeo = new THREE.CylinderGeometry(0.017, 0.017, 0.005, 24);
    exhaustPocketGeo.rotateX(THREE.MathUtils.degToRad(15));
    const exhaustPocketMesh = new THREE.Mesh(exhaustPocketGeo, matForgedBillet);
    exhaustPocketMesh.name = `Exhaust_Valve_Relief_Pocket_${vIdx + 1}`;
    exhaustPocketMesh.position.set(vx, -0.014, 0.023);
    crownGroup.add(exhaustPocketMesh);
  });

  rootGroup.add(crownGroup);

  // ─── 2. 3-PIECE GAS-NITRIDED RING PACK & ACCUMULATOR GROOVES ───
  const ringGroup = new THREE.Group();
  ringGroup.name = 'Piston_Ring_Pack_Subsystem';

  // Ring Land Positions along Z axis
  const ringSpecs = [
    { name: 'Top_Gas_Nitrided_Compression_Ring', z: 0.018, thickness: 0.0012, radius: spec.boreRadiusM },
    { name: 'Second_Napier_Hook_Scraper_Ring', z: 0.013, thickness: 0.0012, radius: spec.boreRadiusM },
    { name: 'Three_Piece_Oil_Control_Ring_Pack', z: 0.007, thickness: 0.0020, radius: spec.boreRadiusM },
  ];

  ringSpecs.forEach((r) => {
    // Outer Spring Steel Ring
    const rGeo = new THREE.TorusGeometry(r.radius - 0.0004, r.thickness / 2, 16, 36, Math.PI * 1.96);
    rGeo.rotateX(Math.PI / 2);
    const rMesh = new THREE.Mesh(rGeo, matTopRing);
    rMesh.name = r.name;
    rMesh.position.set(0, 0, r.z);
    ringGroup.add(rMesh);
  });

  // Accumulator Pressure Relief Groove between 1st and 2nd Ring Lands
  const accumGeo = new THREE.TorusGeometry(spec.boreRadiusM - 0.002, 0.0008, 12, 36);
  accumGeo.rotateX(Math.PI / 2);
  const accumMesh = new THREE.Mesh(accumGeo, matForgedBillet);
  accumMesh.name = 'Inter_Ring_Pressure_Accumulator_Groove';
  accumMesh.position.set(0, 0, 0.0155);
  ringGroup.add(accumMesh);

  // 8 Radial CNC Oil Drainback Holes behind Oil Ring
  for (let h = 0; h < 8; h++) {
    const angle = (h * Math.PI * 2) / 8;
    const hx = Math.sin(angle) * (spec.boreRadiusM - 0.004);
    const hy = Math.cos(angle) * (spec.boreRadiusM - 0.004);

    const holeGeo = new THREE.CylinderGeometry(0.0012, 0.0012, 0.008, 12);
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

    // Curved Outer Skirt Panel
    const panelGeo = new THREE.CylinderGeometry(
      spec.boreRadiusM - 0.0008,
      spec.boreRadiusM - 0.0008,
      spec.skirtHeightM,
      24,
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
  });

  rootGroup.add(skirtGroup);

  // ─── 4. DLC TOOL-STEEL WRIST PIN & SPIROLOC RETENTION CLIPS ───
  const pinGroup = new THREE.Group();
  pinGroup.name = 'DLC_Wrist_Pin_Subsystem';

  // DLC-Coated 22mm Hollow Pin Outer Sleeve
  const pinGeo = new THREE.CylinderGeometry(spec.pinRadiusM, spec.pinRadiusM, spec.pinLengthM, 32);
  pinGeo.rotateZ(Math.PI / 2);
  const pinMesh = new THREE.Mesh(pinGeo, matDlcPin);
  pinMesh.name = 'DLC_Tool_Steel_Wrist_Pin';
  pinMesh.position.set(0, 0, -0.008);
  pinMesh.castShadow = true;
  pinGroup.add(pinMesh);

  // Gun-Drilled Center Tapered Hollow Bore (Lightweight)
  const pinHollowGeo = new THREE.CylinderGeometry(spec.pinRadiusM - 0.0035, spec.pinRadiusM - 0.0035, spec.pinLengthM + 0.002, 24);
  pinHollowGeo.rotateZ(Math.PI / 2);
  const pinHollowMesh = new THREE.Mesh(pinHollowGeo, matUnderCrown);
  pinHollowMesh.name = 'WristPin_Taper_Hollow_Bore';
  pinHollowMesh.position.set(0, 0, -0.008);
  pinGroup.add(pinHollowMesh);

  // Dual Spiroloc Retaining Rings on Pin Outer Ends
  [-spec.pinLengthM / 2 + 0.001, spec.pinLengthM / 2 - 0.001].forEach((px, pIdx) => {
    const lockGeo = new THREE.TorusGeometry(spec.pinRadiusM + 0.0015, 0.0008, 12, 24, Math.PI * 1.8);
    lockGeo.rotateY(Math.PI / 2);
    const lockMesh = new THREE.Mesh(lockGeo, matBrassSpiroloc);
    lockMesh.name = `Spiroloc_Pin_Retainer_${pIdx === 0 ? 'Left' : 'Right'}`;
    lockMesh.position.set(px, 0, -0.008);
    pinGroup.add(lockMesh);
  });

  // Forced Pin Bore Lubrication Feed Slots
  [-0.018, 0.018].forEach((bx, bIdx) => {
    const feedGeo = new THREE.CylinderGeometry(0.002, 0.002, 0.012, 12);
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

