// ============================================================================
// ULTRA-HIGH-FIDELITY MODULAR GLB GENERATOR — TWIN-SCROLL BALL-BEARING TURBO
// ============================================================================
// Solid-modeling engineering generator for a twin-scroll ceramic dual-ball-bearing
// racing turbocharger. Features a CNC billet anti-surge compressor housing,
// 11-blade extended-tip forged compressor wheel, water-cooled ceramic CHRA cartridge
// with AN-4 oil feed & AN-10 drain, divided Ni-Resist twin-scroll turbine housing,
// Inconel 713C turbine wheel, and adjustable pneumatic wastegate canister.
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

export interface TurbochargerSpec {
  compressorInducerDiameterMm: number; // 68.0 mm
  compressorExducerDiameterMm: number; // 84.0 mm
  turbineInducerDiameterMm: number; // 74.0 mm
  turbineExducerDiameterMm: number; // 64.0 mm
  chraLengthM: number; // 0.055 m
  chraDiameterM: number; // 0.058 m
  vBandDischargeDiameterMm: number; // 76.0 mm (3 inch)
}

export const V12_TURBO_SPECS: TurbochargerSpec = {
  compressorInducerDiameterMm: 68.0,
  compressorExducerDiameterMm: 84.0,
  turbineInducerDiameterMm: 74.0,
  turbineExducerDiameterMm: 64.0,
  chraLengthM: 0.055,
  chraDiameterM: 0.058,
  vBandDischargeDiameterMm: 76.0,
};

/**
 * Builds the complete ultra-high-fidelity 3D scene graph for a racing turbocharger.
 */
export function buildTurbochargerScene(): THREE.Scene {
  const scene = new THREE.Scene();
  scene.name = 'V12_TwinScroll_Turbocharger_Scene';

  const rootGroup = new THREE.Group();
  rootGroup.name = '08_Turbocharger_Master_Assembly_Group';
  scene.add(rootGroup);

  const matLib = globalMaterialLibrary;
  const matCompressorBillet = matLib.getMachinedBillet();
  const matWheelBillet = matLib.getGoldAnodized();
  const matChraCasting = matLib.getCastAluminum();
  const matTurbineNiResist = matLib.getInconelExhaust();
  const matAnFittingGold = matLib.getGoldAnodized();
  const matAnFittingBlue = matLib.getCobaltAnodized();
  const matActuatorBlack = matLib.getBlackPolymer();
  const matStainless = matLib.getNitridedCrank();

  // ─── 1. BILLET ANTI-SURGE COMPRESSOR HOUSING & 11-BLADE IMPELLER ───
  const compGroup = new THREE.Group();
  compGroup.name = 'Compressor_Housing_Impeller_Subsystem';
  compGroup.position.set(-0.045, 0, 0);

  // CNC Billet Compressor Volute Scroll
  const compScrollGeo = new THREE.TorusGeometry(0.052, 0.026, 28, 36, Math.PI * 1.65);
  const compScrollMesh = new THREE.Mesh(compScrollGeo, matCompressorBillet);
  compScrollMesh.name = 'Compressor_Volute_Scroll';
  compScrollMesh.castShadow = true;
  compScrollMesh.receiveShadow = true;
  compGroup.add(compScrollMesh);

  // Anti-Surge Ported Shroud Air Inlet Snout (84mm -> 68mm)
  const inletGeo = new THREE.CylinderGeometry(0.034, 0.042, 0.048, 32);
  inletGeo.rotateZ(Math.PI / 2);
  const inletMesh = new THREE.Mesh(inletGeo, matCompressorBillet);
  inletMesh.name = 'Anti_Surge_Ported_Air_Inlet_Snout';
  inletMesh.position.set(-0.048, 0, 0);
  inletMesh.castShadow = true;
  compGroup.add(inletMesh);

  // Ported Shroud Anti-Surge Recirculation Bleed Ring Slots (4 Slots)
  for (let s = 0; s < 4; s++) {
    const sAngle = (s * Math.PI) / 2;
    const sy = Math.sin(sAngle) * 0.038;
    const sz = Math.cos(sAngle) * 0.038;

    const slotGeo = new THREE.BoxGeometry(0.016, 0.005, 0.005);
    const slotMesh = new THREE.Mesh(slotGeo, matStainless);
    slotMesh.name = `AntiSurge_Bleed_Slot_${s + 1}`;
    slotMesh.position.set(-0.045, sy, sz);
    compGroup.add(slotMesh);
  }

  // Tangential Boost Discharge Pipe with V-Band Lip
  const compOutletGeo = new THREE.CylinderGeometry(0.028, 0.028, 0.058, 24);
  const compOutletMesh = new THREE.Mesh(compOutletGeo, matCompressorBillet);
  compOutletMesh.name = 'Compressor_Boost_Outlet_Pipe';
  compOutletMesh.position.set(0, 0.072, 0);
  compOutletMesh.castShadow = true;
  compGroup.add(compOutletMesh);

  // 11-Blade Extended-Tip Forged Billet Compressor Wheel
  const wheelHubGeo = new THREE.ConeGeometry(0.014, 0.032, 24);
  wheelHubGeo.rotateZ(-Math.PI / 2);
  const wheelHubMesh = new THREE.Mesh(wheelHubGeo, matWheelBillet);
  wheelHubMesh.name = 'Compressor_Wheel_Center_Hub';
  wheelHubMesh.position.set(-0.022, 0, 0);
  compGroup.add(wheelHubMesh);

  for (let b = 0; b < 11; b++) {
    const bAngle = (b * Math.PI * 2) / 11;
    const by = Math.sin(bAngle) * 0.022;
    const bz = Math.cos(bAngle) * 0.022;

    const bladeGeo = new THREE.BoxGeometry(0.018, 0.002, 0.016);
    bladeGeo.rotateX(bAngle + Math.PI / 6);
    const bladeMesh = new THREE.Mesh(bladeGeo, matWheelBillet);
    bladeMesh.name = `Compressor_Billet_Blade_${b + 1}`;
    bladeMesh.position.set(-0.024, by, bz);
    compGroup.add(bladeMesh);
  }

  rootGroup.add(compGroup);

  // ─── 2. CERAMIC DUAL-BALL-BEARING CHRA CARTRIDGE ───
  const chraGroup = new THREE.Group();
  chraGroup.name = 'CHRA_Bearing_Cartridge_Subsystem';
  chraGroup.position.set(0, 0, 0);

  // Water-Cooled CHRA Cast Housing Core
  const chraGeo = new THREE.CylinderGeometry(0.030, 0.030, 0.046, 28);
  chraGeo.rotateZ(Math.PI / 2);
  const chraMesh = new THREE.Mesh(chraGeo, matChraCasting);
  chraMesh.name = 'CHRA_Bearing_Center_Housing';
  chraMesh.castShadow = true;
  chraMesh.receiveShadow = true;
  chraGroup.add(chraMesh);

  // Top AN-4 High-Pressure Oil Feed Boss
  const oilFeedGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.018, 16);
  const oilFeedMesh = new THREE.Mesh(oilFeedGeo, matAnFittingGold);
  oilFeedMesh.name = 'AN4_Turbo_Oil_Feed_Fitting';
  oilFeedMesh.position.set(0, 0.035, 0);
  chraGroup.add(oilFeedMesh);

  // Bottom AN-10 High-Flow Gravity Oil Drain Flange
  const oilDrainGeo = new THREE.CylinderGeometry(0.011, 0.011, 0.018, 16);
  const oilDrainMesh = new THREE.Mesh(oilDrainGeo, matAnFittingBlue);
  oilDrainMesh.name = 'AN10_Turbo_Oil_Drain_Fitting';
  oilDrainMesh.position.set(0, -0.035, 0);
  chraGroup.add(oilDrainMesh);

  // Dual M14 Water Cooling Banjo Ports (Fore & Aft)
  [-0.016, 0.016].forEach((wx, wIdx) => {
    const waterGeo = new THREE.CylinderGeometry(0.007, 0.007, 0.016, 16);
    waterGeo.rotateX(Math.PI / 2);
    const waterMesh = new THREE.Mesh(waterGeo, matAnFittingBlue);
    waterMesh.name = `Water_Cooling_Banjo_Port_${wIdx === 0 ? 'Inlet' : 'Outlet'}`;
    waterMesh.position.set(wx, 0, 0.032);
    chraGroup.add(waterMesh);
  });

  rootGroup.add(chraGroup);

  // ─── 3. DIVIDED TWIN-SCROLL NI-RESIST TURBINE VOLUTE & WHEEL ───
  const turbineGroup = new THREE.Group();
  turbineGroup.name = 'TwinScroll_Turbine_Housing_Subsystem';
  turbineGroup.position.set(0.045, 0, 0);

  // Ni-Resist Cast Divided Twin-Scroll Volute
  const turbScrollGeo = new THREE.TorusGeometry(0.045, 0.022, 28, 36, Math.PI * 1.55);
  const turbScrollMesh = new THREE.Mesh(turbScrollGeo, matTurbineNiResist);
  turbScrollMesh.name = 'Divided_TwinScroll_Turbine_Volute';
  turbScrollMesh.castShadow = true;
  turbScrollMesh.receiveShadow = true;
  turbineGroup.add(turbScrollMesh);

  // Divided Twin-Scroll Entry Flange Divider Wall
  const dividerGeo = new THREE.BoxGeometry(0.018, 0.003, 0.026);
  const dividerMesh = new THREE.Mesh(dividerGeo, matTurbineNiResist);
  dividerMesh.name = 'TwinScroll_Internal_Divider_Tongue';
  dividerMesh.position.set(-0.012, 0, -0.042);
  turbineGroup.add(dividerMesh);

  // Inconel 713C 9-Blade Turbine Wheel
  const turbHubGeo = new THREE.ConeGeometry(0.013, 0.028, 20);
  turbHubGeo.rotateZ(Math.PI / 2);
  const turbHubMesh = new THREE.Mesh(turbHubGeo, matTurbineNiResist);
  turbHubMesh.name = 'Inconel_Turbine_Wheel_Hub';
  turbHubMesh.position.set(0.020, 0, 0);
  turbineGroup.add(turbHubMesh);

  // 76mm Machined V-Band Turbine Exhaust Discharge Flange
  const turbOutletGeo = new THREE.CylinderGeometry(0.038, 0.038, 0.028, 32);
  turbOutletGeo.rotateZ(Math.PI / 2);
  const turbOutletMesh = new THREE.Mesh(turbOutletGeo, matTurbineNiResist);
  turbOutletMesh.name = 'Turbine_VBand_Exhaust_Flange';
  turbOutletMesh.position.set(0.048, 0, 0);
  turbOutletMesh.castShadow = true;
  turbineGroup.add(turbOutletMesh);

  rootGroup.add(turbineGroup);

  // ─── 4. PNEUMATIC DUAL-PORT WASTEGATE CANISTER & LINKAGE ───
  const wastegateGroup = new THREE.Group();
  wastegateGroup.name = 'Pneumatic_Wastegate_Actuator_Subsystem';

  // Anodized Black Billet Wastegate Canister
  const canGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.042, 24);
  const canMesh = new THREE.Mesh(canGeo, matActuatorBlack);
  canMesh.name = 'DualPort_Wastegate_Canister';
  canMesh.position.set(-0.024, -0.068, 0.025);
  canMesh.castShadow = true;
  wastegateGroup.add(canMesh);

  // Adjustable Threaded Wastegate Rod
  const rodGeo = new THREE.CylinderGeometry(0.0035, 0.0035, 0.068, 12);
  rodGeo.rotateX(Math.PI / 3.2);
  const rodMesh = new THREE.Mesh(rodGeo, matStainless);
  rodMesh.name = 'Adjustable_Wastegate_Linkage_Rod';
  rodMesh.position.set(0.012, -0.048, 0.012);
  wastegateGroup.add(rodMesh);

  // Stainless Wastegate Crank Arm & Pivot Bushing
  const armGeo = new THREE.BoxGeometry(0.012, 0.022, 0.006);
  const armMesh = new THREE.Mesh(armGeo, matStainless);
  armMesh.name = 'Internal_Wastegate_Flapper_Crank';
  armMesh.position.set(0.036, -0.032, -0.012);
  wastegateGroup.add(armMesh);

  rootGroup.add(wastegateGroup);

  return scene;
}

/**
 * Exports the turbocharger scene to a binary GLB ArrayBuffer.
 */
export async function generateTurbochargerGlbBuffer(): Promise<ArrayBuffer> {
  const scene = buildTurbochargerScene();
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

export default buildTurbochargerScene;

