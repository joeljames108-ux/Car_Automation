// ============================================================================
// ULTRA-HIGH-FIDELITY MODULAR GLB GENERATOR — TWIN-SCROLL BALL-BEARING TURBO
// ============================================================================
// Solid-modeling engineering generator for a twin-scroll ceramic dual-ball-bearing
// racing turbocharger. Features a CNC billet anti-surge compressor housing,
// 11-blade extended-tip forged compressor wheel with 11 splitter blades, water-cooled
// ceramic CHRA cartridge with AN-4 oil feed & AN-10 drain, speed sensor boss,
// divided Ni-Resist twin-scroll turbine housing with 9 sculpted Inconel airfoil blades,
// dual quick-release V-band clamps, embossed thermal blanket, silicone inlet coupler
// with stainless T-bolt hose clamps, and adjustable pneumatic wastegate canister.
// Supports Single Turbo, Twin Turbo (Left & Right), and Quad Turbo (W16/W18).
// ============================================================================

import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import type { EngineConfig } from '../../sim/types';
import { globalMaterialLibrary } from '../materials/pbrMaterialSystem';
import {
  createHexBoltHead,
  createAllenSocketHead,
  createORingSeal,
  createHoseClamp,
  createTurbineAirfoilBlade,
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

export interface TurbochargerSpec {
  compressorInducerDiameterMm: number;
  compressorExducerDiameterMm: number;
  turbineInducerDiameterMm: number;
  turbineExducerDiameterMm: number;
  chraLengthM: number;
  chraDiameterM: number;
  vBandDischargeDiameterMm: number;
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

function createSingleTurboUnit(sideOffset: number, scale: number = 1.0, config?: Partial<EngineConfig>): THREE.Group {
  const unitGroup = new THREE.Group();
  unitGroup.name = `Turbocharger_Unit_${sideOffset >= 0 ? 'Right' : 'Left'}`;
  unitGroup.position.set(0, sideOffset, 0);
  unitGroup.scale.set(scale, scale, scale);

  const matLib = globalMaterialLibrary;
  const turboHousingMat = config?.turboHousing || 'inconel';
  const matTurbineHousing =
    turboHousingMat === 'cast_iron' ? matLib.getCastIron() :
    turboHousingMat === 'titanium' ? matLib.getTitaniumAerospace() :
    turboHousingMat === 'ceramic_coated' ? matLib.getCeramicIntake() :
    matLib.getInconelExhaust();

  const matCompressorBillet = matLib.getMachinedBillet();
  const matWheelBillet = matLib.getGoldAnodized();
  const matChraCasting = matLib.getCastAluminum();
  const matTurbineNiResist = matTurbineHousing;
  const matAnFittingGold = matLib.getGoldAnodized();
  const matAnFittingBlue = matLib.getCobaltAnodized();
  const matActuatorBlack = matLib.getBlackPolymer();
  const matStainless = matLib.getNitridedCrank();
  const matHeatShield = matLib.getHeatShieldBlanket();
  const matSiliconeCoupler = matLib.getBlueSilicone();
  const matVitonOring = matLib.getRubberOring();

  // ─── 1. BILLET ANTI-SURGE COMPRESSOR HOUSING & DUAL-TIER IMPELLER ───
  const compGroup = new THREE.Group();
  compGroup.name = 'Compressor_Housing_Impeller_Subsystem';
  compGroup.position.set(-0.045, 0, 0);

  // CNC Billet Compressor Volute Scroll (Smooth 48-segment torus)
  const compScrollGeo = new THREE.TorusGeometry(0.052, 0.026, 36, 48, Math.PI * 1.65);
  const compScrollMesh = new THREE.Mesh(compScrollGeo, matCompressorBillet);
  compScrollMesh.name = 'Compressor_Volute_Scroll';
  compScrollMesh.castShadow = true;
  compScrollMesh.receiveShadow = true;
  compGroup.add(compScrollMesh);

  // Anti-Surge Ported Shroud Air Inlet Snout (84mm -> 68mm)
  const inletGeo = new THREE.CylinderGeometry(0.034, 0.042, 0.048, 48);
  inletGeo.rotateZ(Math.PI / 2);
  const inletMesh = new THREE.Mesh(inletGeo, matCompressorBillet);
  inletMesh.name = 'Anti_Surge_Ported_Air_Inlet_Snout';
  inletMesh.position.set(-0.048, 0, 0);
  inletMesh.castShadow = true;
  compGroup.add(inletMesh);

  // High-Grade 4-Ply Silicone Turbo Inlet Coupler
  const couplerGeo = new THREE.CylinderGeometry(0.036, 0.036, 0.028, 36, 1, true);
  couplerGeo.rotateZ(Math.PI / 2);
  const couplerMesh = new THREE.Mesh(couplerGeo, matSiliconeCoupler);
  couplerMesh.name = 'Silicone_Inlet_Coupler_Boot';
  couplerMesh.position.set(-0.062, 0, 0);
  compGroup.add(couplerMesh);

  // Dual Stainless Steel Worm-Drive Hose Clamps on Coupler
  [-0.070, -0.054].forEach((cx, cIdx) => {
    const clampGeo = createHoseClamp(0.073, 0.007);
    const clampMesh = new THREE.Mesh(clampGeo, matStainless);
    clampMesh.name = `Inlet_Coupler_T_Clamp_${cIdx + 1}`;
    clampMesh.position.set(cx, 0, 0);
    compGroup.add(clampMesh);
  });

  // Ported Shroud Anti-Surge Recirculation Bleed Ring Slots (6 Radial Slots)
  for (let s = 0; s < 6; s++) {
    const sAngle = (s * Math.PI * 2) / 6;
    const sy = Math.sin(sAngle) * 0.038;
    const sz = Math.cos(sAngle) * 0.038;

    const slotGeo = new THREE.BoxGeometry(0.016, 0.004, 0.004);
    const slotMesh = new THREE.Mesh(slotGeo, matStainless);
    slotMesh.name = `AntiSurge_Bleed_Slot_${s + 1}`;
    slotMesh.position.set(-0.045, sy, sz);
    compGroup.add(slotMesh);
  }

  // Tangential Boost Discharge Pipe with V-Band Lip
  const compOutletGeo = new THREE.CylinderGeometry(0.028, 0.028, 0.058, 32);
  const compOutletMesh = new THREE.Mesh(compOutletGeo, matCompressorBillet);
  compOutletMesh.name = 'Compressor_Boost_Outlet_Pipe';
  compOutletMesh.position.set(0, 0.072, 0);
  compOutletMesh.castShadow = true;
  compGroup.add(compOutletMesh);

  // 11-Blade Extended-Tip Forged Billet Compressor Wheel Hub
  const wheelHubGeo = new THREE.ConeGeometry(0.014, 0.032, 32);
  wheelHubGeo.rotateZ(-Math.PI / 2);
  const wheelHubMesh = new THREE.Mesh(wheelHubGeo, matWheelBillet);
  wheelHubMesh.name = 'Compressor_Wheel_Center_Hub';
  wheelHubMesh.position.set(-0.022, 0, 0);
  compGroup.add(wheelHubMesh);

  // Primary 11 Full-Length Aerodynamic Impeller Blades
  for (let b = 0; b < 11; b++) {
    const bAngle = (b * Math.PI * 2) / 11;
    const by = Math.sin(bAngle) * 0.022;
    const bz = Math.cos(bAngle) * 0.022;

    const bladeGeo = new THREE.BoxGeometry(0.018, 0.002, 0.016);
    bladeGeo.rotateX(bAngle + Math.PI / 6);
    const bladeMesh = new THREE.Mesh(bladeGeo, matWheelBillet);
    bladeMesh.name = `Compressor_Billet_Primary_Blade_${b + 1}`;
    bladeMesh.position.set(-0.024, by, bz);
    compGroup.add(bladeMesh);

    // 11 Interleaved Splitter Blades (Shorter inducer height for high-mass flow)
    const sBladeAngle = bAngle + Math.PI / 11;
    const sby = Math.sin(sBladeAngle) * 0.020;
    const sbz = Math.cos(sBladeAngle) * 0.020;
    const sBladeGeo = new THREE.BoxGeometry(0.012, 0.0018, 0.013);
    sBladeGeo.rotateX(sBladeAngle + Math.PI / 5.5);
    const sBladeMesh = new THREE.Mesh(sBladeGeo, matWheelBillet);
    sBladeMesh.name = `Compressor_Splitter_Blade_${b + 1}`;
    sBladeMesh.position.set(-0.019, sby, sbz);
    compGroup.add(sBladeMesh);
  }

  // CNC Backplate with O-Ring Gasket Channel & Fasteners
  const backplateGeo = new THREE.CylinderGeometry(0.050, 0.050, 0.008, 36);
  backplateGeo.rotateZ(Math.PI / 2);
  const backplateMesh = new THREE.Mesh(backplateGeo, matCompressorBillet);
  backplateMesh.name = 'Compressor_Seal_Backplate';
  backplateMesh.position.set(0.012, 0, 0);
  compGroup.add(backplateMesh);

  // Viton O-Ring Seal Ring between Backplate and CHRA
  const oringGeo = createORingSeal(0.046, 0.0015);
  oringGeo.rotateY(Math.PI / 2);
  const oringMesh = new THREE.Mesh(oringGeo, matVitonOring);
  oringMesh.name = 'Backplate_Viton_O_Ring';
  oringMesh.position.set(0.016, 0, 0);
  compGroup.add(oringMesh);

  // 6 Perimeter M6 Socket-Head Bolts on Backplate
  for (let bk = 0; bk < 6; bk++) {
    const bkAngle = (bk * Math.PI * 2) / 6;
    const bky = Math.sin(bkAngle) * 0.042;
    const bkz = Math.cos(bkAngle) * 0.042;
    const boltGeo = createAllenSocketHead(0.0035, 0.008);
    boltGeo.rotateZ(Math.PI / 2);
    const boltMesh = new THREE.Mesh(boltGeo, matStainless);
    boltMesh.name = `Backplate_M6_Bolt_${bk + 1}`;
    boltMesh.position.set(0.016, bky, bkz);
    compGroup.add(boltMesh);
  }

  unitGroup.add(compGroup);

  // ─── 2. CERAMIC DUAL-BALL-BEARING CHRA CARTRIDGE ───
  const chraGroup = new THREE.Group();
  chraGroup.name = 'CHRA_Bearing_Cartridge_Subsystem';
  chraGroup.position.set(0, 0, 0);

  // Water-Cooled CHRA Cast Housing Core
  const chraGeo = new THREE.CylinderGeometry(0.030, 0.030, 0.046, 36);
  chraGeo.rotateZ(Math.PI / 2);
  const chraMesh = new THREE.Mesh(chraGeo, matChraCasting);
  chraMesh.name = 'CHRA_Bearing_Center_Housing';
  chraMesh.castShadow = true;
  chraMesh.receiveShadow = true;
  chraGroup.add(chraMesh);

  // Top AN-4 High-Pressure Oil Feed Boss & Hex Fitting
  const oilFeedGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.018, 20);
  const oilFeedMesh = new THREE.Mesh(oilFeedGeo, matAnFittingGold);
  oilFeedMesh.name = 'AN4_Turbo_Oil_Feed_Fitting';
  oilFeedMesh.position.set(0, 0.035, 0);
  chraGroup.add(oilFeedMesh);

  const oilFeedHexGeo = createHexBoltHead(0.008, 0.006);
  const oilFeedHexMesh = new THREE.Mesh(oilFeedHexGeo, matAnFittingGold);
  oilFeedHexMesh.name = 'AN4_Hex_Nut_Body';
  oilFeedHexMesh.position.set(0, 0.041, 0);
  chraGroup.add(oilFeedHexMesh);

  // Bottom AN-10 High-Flow Gravity Oil Drain Flange
  const oilDrainGeo = new THREE.CylinderGeometry(0.011, 0.011, 0.018, 20);
  const oilDrainMesh = new THREE.Mesh(oilDrainGeo, matAnFittingBlue);
  oilDrainMesh.name = 'AN10_Turbo_Oil_Drain_Fitting';
  oilDrainMesh.position.set(0, -0.035, 0);
  chraGroup.add(oilDrainMesh);

  // Dual M14 Water Cooling Banjo Ports (Fore & Aft)
  [-0.016, 0.016].forEach((wx, wIdx) => {
    const waterGeo = new THREE.CylinderGeometry(0.007, 0.007, 0.016, 20);
    waterGeo.rotateX(Math.PI / 2);
    const waterMesh = new THREE.Mesh(waterGeo, matAnFittingBlue);
    waterMesh.name = `Water_Cooling_Banjo_Port_${wIdx === 0 ? 'Inlet' : 'Outlet'}`;
    waterMesh.position.set(wx, 0, 0.032);
    chraGroup.add(waterMesh);
  });

  // Optical Wheel Speed Sensor Boss & Pig-tail Wire Harness
  const speedSensorGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.022, 16);
  speedSensorGeo.rotateZ(Math.PI / 3);
  const speedSensorMesh = new THREE.Mesh(speedSensorGeo, matActuatorBlack);
  speedSensorMesh.name = 'Turbo_Shaft_Speed_Sensor';
  speedSensorMesh.position.set(-0.015, -0.026, 0.024);
  chraGroup.add(speedSensorMesh);

  // Dual Quick-Release V-Band Housing Clamps
  [-0.023, 0.023].forEach((vx, vIdx) => {
    const vClampGeo = new THREE.TorusGeometry(0.034, 0.004, 12, 36);
    vClampGeo.rotateY(Math.PI / 2);
    const vClampMesh = new THREE.Mesh(vClampGeo, matStainless);
    vClampMesh.name = `CHRA_VBand_Retention_Clamp_${vIdx === 0 ? 'Compressor' : 'Turbine'}`;
    vClampMesh.position.set(vx, 0, 0);
    chraGroup.add(vClampMesh);

    // V-Band Tightening T-Bolt & Locknut
    const tboltGeo = createThreadedShaft(0.0025, 0.018, 1.0);
    const tboltMesh = new THREE.Mesh(tboltGeo, matStainless);
    tboltMesh.name = `VBand_T_Bolt_${vIdx + 1}`;
    tboltMesh.position.set(vx, 0.036, 0);
    chraGroup.add(tboltMesh);
  });

  unitGroup.add(chraGroup);

  // ─── 3. DIVIDED TWIN-SCROLL NI-RESIST TURBINE VOLUTE & INCONEL AIRFOIL WHEEL ───
  const turbineGroup = new THREE.Group();
  turbineGroup.name = 'TwinScroll_Turbine_Housing_Subsystem';
  turbineGroup.position.set(0.045, 0, 0);

  // Ni-Resist Cast Divided Twin-Scroll Volute (Smooth 48-segment mesh)
  const turbScrollGeo = new THREE.TorusGeometry(0.045, 0.022, 36, 48, Math.PI * 1.55);
  const turbScrollMesh = new THREE.Mesh(turbScrollGeo, matTurbineNiResist);
  turbScrollMesh.name = 'Divided_TwinScroll_Turbine_Volute';
  turbScrollMesh.castShadow = true;
  turbScrollMesh.receiveShadow = true;
  turbineGroup.add(turbScrollMesh);

  // Embossed Thermal Insulation Blanket Shield on Outer Volute
  const blanketGeo = new THREE.TorusGeometry(0.046, 0.0235, 20, 36, Math.PI * 1.1);
  const blanketMesh = new THREE.Mesh(blanketGeo, matHeatShield);
  blanketMesh.name = 'Inconel_Foil_Turbine_Thermal_Blanket';
  blanketMesh.position.set(0, 0, 0);
  blanketMesh.castShadow = true;
  turbineGroup.add(blanketMesh);

  // Divided Twin-Scroll Entry Flange Divider Wall
  const dividerGeo = new THREE.BoxGeometry(0.018, 0.003, 0.026);
  const dividerMesh = new THREE.Mesh(dividerGeo, matTurbineNiResist);
  dividerMesh.name = 'TwinScroll_Internal_Divider_Tongue';
  dividerMesh.position.set(-0.012, 0, -0.042);
  turbineGroup.add(dividerMesh);

  // Inconel 713C Turbine Wheel Center Hub
  const turbHubGeo = new THREE.ConeGeometry(0.013, 0.028, 28);
  turbHubGeo.rotateZ(Math.PI / 2);
  const turbHubMesh = new THREE.Mesh(turbHubGeo, matTurbineNiResist);
  turbHubMesh.name = 'Inconel_Turbine_Wheel_Hub';
  turbHubMesh.position.set(0.020, 0, 0);
  turbineGroup.add(turbHubMesh);

  // 9 Aerodynamic Inconel Airfoil Turbine Rotor Blades
  for (let tb = 0; tb < 9; tb++) {
    const tbAngle = (tb * Math.PI * 2) / 9;
    const bladeGeo = createTurbineAirfoilBlade(0.022, 0.015, 0.009, 42, 0.002);
    bladeGeo.rotateX(tbAngle);
    bladeGeo.rotateZ(Math.PI / 2);
    const bladeMesh = new THREE.Mesh(bladeGeo, matTurbineNiResist);
    bladeMesh.name = `Inconel_Turbine_Airfoil_Blade_${tb + 1}`;
    bladeMesh.position.set(0.018, Math.sin(tbAngle) * 0.016, Math.cos(tbAngle) * 0.016);
    bladeMesh.castShadow = true;
    turbineGroup.add(bladeMesh);
  }

  // 76mm Machined V-Band Turbine Exhaust Discharge Flange
  const turbOutletGeo = new THREE.CylinderGeometry(0.038, 0.038, 0.028, 36);
  turbOutletGeo.rotateZ(Math.PI / 2);
  const turbOutletMesh = new THREE.Mesh(turbOutletGeo, matTurbineNiResist);
  turbOutletMesh.name = 'Turbine_VBand_Exhaust_Flange';
  turbOutletMesh.position.set(0.048, 0, 0);
  turbOutletMesh.castShadow = true;
  turbineGroup.add(turbOutletMesh);

  unitGroup.add(turbineGroup);

  // ─── 4. PNEUMATIC DUAL-PORT WASTEGATE CANISTER & LINKAGE ───
  const wastegateGroup = new THREE.Group();
  wastegateGroup.name = 'Pneumatic_Wastegate_Actuator_Subsystem';

  // Anodized Black Billet Wastegate Canister
  const canGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.042, 32);
  const canMesh = new THREE.Mesh(canGeo, matActuatorBlack);
  canMesh.name = 'DualPort_Wastegate_Canister';
  canMesh.position.set(-0.024, -0.068, 0.025);
  canMesh.castShadow = true;
  wastegateGroup.add(canMesh);

  // Dual Boost Pressure Reference Barb Ports
  [-0.010, 0.010].forEach((px, pIdx) => {
    const barbGeo = new THREE.CylinderGeometry(0.003, 0.003, 0.012, 12);
    const barbMesh = new THREE.Mesh(barbGeo, matAnFittingGold);
    barbMesh.name = `Wastegate_Pressure_Barb_${pIdx === 0 ? 'Top' : 'Bottom'}`;
    barbMesh.position.set(-0.024 + px, -0.092, 0.025);
    wastegateGroup.add(barbMesh);
  });

  // Adjustable Threaded Wastegate Rod
  const rodGeo = createThreadedShaft(0.0035, 0.068, 1.25);
  rodGeo.rotateX(Math.PI / 3.2);
  const rodMesh = new THREE.Mesh(rodGeo, matStainless);
  rodMesh.name = 'Adjustable_Wastegate_Linkage_Rod';
  rodMesh.position.set(0.012, -0.048, 0.012);
  wastegateGroup.add(rodMesh);

  // Dual Hex Locknuts on Wastegate Rod
  const nutGeo = createHexBoltHead(0.006, 0.004);
  nutGeo.rotateX(Math.PI / 3.2);
  const nutMesh = new THREE.Mesh(nutGeo, matStainless);
  nutMesh.name = 'Wastegate_Rod_Preload_Locknut';
  nutMesh.position.set(0.008, -0.052, 0.015);
  wastegateGroup.add(nutMesh);

  // Stainless Wastegate Crank Arm & Pivot Bushing
  const armGeo = new THREE.BoxGeometry(0.012, 0.022, 0.006);
  const armMesh = new THREE.Mesh(armGeo, matStainless);
  armMesh.name = 'Internal_Wastegate_Flapper_Crank';
  armMesh.position.set(0.036, -0.032, -0.012);
  wastegateGroup.add(armMesh);

  unitGroup.add(wastegateGroup);

  return unitGroup;
}

/**
 * Builds the complete ultra-high-fidelity 3D scene graph for a racing turbocharger setup.
 * Supports Single Turbo, Twin Turbo (V6/V8/V12/Boxer), and Quad Turbo (W16/W18).
 */
export function buildTurbochargerScene(configOrCount?: Partial<EngineConfig> | number | string): THREE.Scene {
  const scene = new THREE.Scene();
  scene.name = 'Turbocharger_System_Scene';

  const rootGroup = new THREE.Group();
  rootGroup.name = 'Turbocharger_Master_Assembly_Group';
  scene.add(rootGroup);

  let turboCount = 1;
  if (typeof configOrCount === 'number') {
    turboCount = configOrCount;
  } else if (typeof configOrCount === 'string') {
    turboCount = configOrCount === 'quad-turbo' ? 4 : configOrCount === 'twin-turbo' ? 2 : 1;
  } else if (configOrCount?.layout) {
    const l = configOrCount.layout;
    if (l === 'w16' || l === 'w18') {
      turboCount = 4;
    } else if (l === 'v6' || l === 'v8' || l === 'v10' || l === 'v12' || l === 'boxer6') {
      turboCount = 2;
    } else {
      turboCount = 1;
    }
  }

  const cfgObj = typeof configOrCount === 'object' ? configOrCount : undefined;

  if (turboCount === 4) {
    // Quad-Turbo Layout (W16/W18)
    const t1 = createSingleTurboUnit(-0.16, 0.85, cfgObj);
    t1.position.set(-0.10, -0.16, 0.05);
    rootGroup.add(t1);

    const t2 = createSingleTurboUnit(-0.16, 0.85, cfgObj);
    t2.position.set(0.10, -0.16, 0.05);
    rootGroup.add(t2);

    const t3 = createSingleTurboUnit(0.16, 0.85, cfgObj);
    t3.position.set(-0.10, 0.16, 0.05);
    t3.rotation.z = Math.PI;
    rootGroup.add(t3);

    const t4 = createSingleTurboUnit(0.16, 0.85, cfgObj);
    t4.position.set(0.10, 0.16, 0.05);
    t4.rotation.z = Math.PI;
    rootGroup.add(t4);
  } else if (turboCount === 2) {
    // Twin-Turbo Layout (V-Engines & Boxers)
    const tLeft = createSingleTurboUnit(-0.18, 0.95, cfgObj);
    tLeft.position.set(0.05, -0.18, 0.02);
    rootGroup.add(tLeft);

    const tRight = createSingleTurboUnit(0.18, 0.95, cfgObj);
    tRight.position.set(0.05, 0.18, 0.02);
    tRight.rotation.z = Math.PI;
    rootGroup.add(tRight);
  } else {
    // Single High-Flow Twin-Scroll Turbo
    const tSingle = createSingleTurboUnit(0, 1.05, cfgObj);
    tSingle.position.set(0.08, 0, 0.04);
    rootGroup.add(tSingle);
  }

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
