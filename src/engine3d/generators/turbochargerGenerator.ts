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

export interface TurbochargerBuildOptions {
  turboCount?: 1 | 2 | 4;
  layout?: 'single' | 'twin' | 'quad' | 'hot_v';
  scale?: number;
  compressorInducerMm?: number; // 45 to 110 mm
  turbineExducerMm?: number;    // 48 to 115 mm
  aRatio?: number;              // 0.50 to 1.45
  housingFinish?: string;
  compressorWheelColor?: string;
  wastegateCapColor?: string;
  couplerColor?: string;
  sideOffset?: number;
}

export function createSingleTurboUnit(
  sideOffset: number,
  scale: number = 1.0,
  configOrOpts?: Partial<EngineConfig> | TurbochargerBuildOptions
): THREE.Group {
  const opts = (configOrOpts && ('compressorInducerMm' in configOrOpts || 'housingFinish' in configOrOpts || 'layout' in configOrOpts))
    ? (configOrOpts as TurbochargerBuildOptions)
    : undefined;
  const legacyCfg = (!opts && configOrOpts) ? (configOrOpts as Partial<EngineConfig>) : undefined;

  // Compute parametric sizing scale
  const parametricScale = (opts?.compressorInducerMm ? opts.compressorInducerMm / 68.0 : 1.0) * scale;

  const unitGroup = new THREE.Group();
  unitGroup.name = `Turbocharger_Unit_${sideOffset >= 0 ? 'Right' : 'Left'}`;
  unitGroup.position.set(0, sideOffset, 0);
  unitGroup.scale.set(parametricScale, parametricScale, parametricScale);

  const matLib = globalMaterialLibrary;

  // Resolve turbine housing finish
  const housingKey = (opts?.housingFinish || legacyCfg?.turboHousing || 'inconel').toLowerCase();
  const matTurbineHousing =
    housingKey.includes('titanium_blued') || housingKey.includes('burnt_titanium') ? matLib.getTitaniumBlued() :
    housingKey.includes('cast_iron') ? matLib.getCastIron() :
    housingKey.includes('titanium') ? matLib.getTitaniumAerospace() :
    housingKey.includes('ceramic_white') || housingKey.includes('ceramic') ? matLib.getCeramicIntake() :
    housingKey.includes('stealth_black') ? matLib.getStealthBlackCeramic() :
    housingKey.includes('gold') ? matLib.getGoldAnodized() :
    housingKey.includes('rosso') ? matLib.getRossoCorsaPowdercoat() :
    housingKey.includes('billet') || housingKey.includes('chrome') ? matLib.getPolishedChrome() :
    matLib.getInconelExhaust();

  // Resolve compressor wheel finish
  const wheelKey = (opts?.compressorWheelColor || 'billet_gold').toLowerCase();
  const matWheelBillet =
    wheelKey.includes('emerald') || wheelKey.includes('green') ? matLib.getBilletEmerald() :
    wheelKey.includes('cobalt') || wheelKey.includes('blue') ? matLib.getBilletCobalt() :
    wheelKey.includes('crimson') || wheelKey.includes('red') ? matLib.getBilletCrimson() :
    wheelKey.includes('silver') || wheelKey.includes('polished') ? matLib.getMachinedBillet() :
    matLib.getGoldAnodized();

  // Resolve wastegate actuator cap finish
  const wgKey = (opts?.wastegateCapColor || 'anodized_purple').toLowerCase();
  const matActuatorCap =
    wgKey.includes('purple') ? matLib.getAnodizedPurple() :
    wgKey.includes('blue') || wgKey.includes('cobalt') ? matLib.getBilletCobalt() :
    wgKey.includes('gold') ? matLib.getGoldAnodized() :
    wgKey.includes('red') || wgKey.includes('crimson') ? matLib.getBilletCrimson() :
    wgKey.includes('black') ? matLib.getStealthBlackCeramic() :
    matLib.getAnodizedPurple();

  // Resolve silicone coupler color
  const couplerKey = (opts?.couplerColor || 'blue_silicone').toLowerCase();
  const matSiliconeCoupler =
    couplerKey.includes('red') ? matLib.getRedSilicone() :
    couplerKey.includes('black') || couplerKey.includes('viton') ? matLib.getBlackViton() :
    matLib.getBlueSilicone();

  const matCompressorBillet = matLib.getMachinedBillet();
  const matChraCasting = matLib.getCastAluminum();
  const matTurbineNiResist = matTurbineHousing;
  const matAnFittingGold = matLib.getGoldAnodized();
  const matAnFittingBlue = matLib.getCobaltAnodized();
  const matActuatorBlack = matActuatorCap;
  const matStainless = matLib.getNitridedCrank();
  const matHeatShield = matLib.getHeatShieldBlanket();
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

  // Laser-Etched Manufacturer Badge Plate on the Compressor Volute
  const compBadgeGeo = new THREE.BoxGeometry(0.0015, 0.026, 0.012);
  const compBadgeMesh = new THREE.Mesh(compBadgeGeo, matAnFittingGold);
  compBadgeMesh.name = 'Compressor_Cover_Anodized_Badge_Plate';
  compBadgeMesh.position.set(-0.045, -0.0765, 0.01);
  compGroup.add(compBadgeMesh);

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

    // Hollow Banjo Bolt with Dual Crush Washers
    const banjoBoltGeo = createHexBoltHead(0.0085, 0.007);
    banjoBoltGeo.rotateX(Math.PI / 2);
    const banjoBoltMesh = new THREE.Mesh(banjoBoltGeo, matStainless);
    banjoBoltMesh.name = `Water_Banjo_Hollow_Bolt_${wIdx === 0 ? 'In' : 'Out'}`;
    banjoBoltMesh.position.set(wx, 0, 0.043);
    chraGroup.add(banjoBoltMesh);

    [-0.0025, 0.0025].forEach((wy) => {
      const washerGeo = new THREE.TorusGeometry(0.0085, 0.0008, 8, 20);
      const washerMesh = new THREE.Mesh(washerGeo, matStainless);
      washerMesh.name = `Banjo_Crush_Washer_${wIdx}_${wy < 0 ? 'A' : 'B'}`;
      washerMesh.position.set(wx, wy, 0.041);
      chraGroup.add(washerMesh);
    });
  });

  // Optical Wheel Speed Sensor Boss & Pig-tail Wire Harness
  const speedSensorGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.022, 16);
  speedSensorGeo.rotateZ(Math.PI / 3);
  const speedSensorMesh = new THREE.Mesh(speedSensorGeo, matActuatorBlack);
  speedSensorMesh.name = 'Turbo_Shaft_Speed_Sensor';
  speedSensorMesh.position.set(-0.015, -0.026, 0.024);
  chraGroup.add(speedSensorMesh);

  // Deutsch-Style Connector Boot on the Speed Sensor
  const sensorBootGeo = new THREE.CylinderGeometry(0.0065, 0.0045, 0.014, 12);
  sensorBootGeo.rotateZ(Math.PI / 3);
  const sensorBootMesh = new THREE.Mesh(sensorBootGeo, matActuatorBlack);
  sensorBootMesh.name = 'Speed_Sensor_Deutsch_Connector_Boot';
  speedSensorMesh.position.set(-0.015, -0.026, 0.024);
  sensorBootMesh.position.set(-0.022, -0.036, 0.030);
  chraGroup.add(sensorBootMesh);

  // Shielded Sensor Pigtail Wiring Loop
  const sensorWireCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.026, -0.040, 0.033),
    new THREE.Vector3(-0.040, -0.050, 0.026),
    new THREE.Vector3(-0.052, -0.046, 0.014),
  ]);
  const sensorWireGeo = new THREE.TubeGeometry(sensorWireCurve, 16, 0.0015, 6, false);
  const sensorWireMesh = new THREE.Mesh(sensorWireGeo, matActuatorBlack);
  sensorWireMesh.name = 'Speed_Sensor_Shielded_Pigtail';
  chraGroup.add(sensorWireMesh);

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

  // V-Band Clamp Ring on the Turbine Discharge Flange
  const turbVBandGeo = new THREE.TorusGeometry(0.040, 0.005, 12, 40);
  turbVBandGeo.rotateY(Math.PI / 2);
  const turbVBandMesh = new THREE.Mesh(turbVBandGeo, matStainless);
  turbVBandMesh.name = 'Turbine_Discharge_VBand_Clamp_Ring';
  turbVBandMesh.position.set(0.062, 0, 0);
  turbineGroup.add(turbVBandMesh);

  // Discharge V-Band T-Bolt Tightener
  const turbTboltGeo = createThreadedShaft(0.0025, 0.018, 1.0);
  const turbTboltMesh = new THREE.Mesh(turbTboltGeo, matStainless);
  turbTboltMesh.name = 'Turbine_VBand_T_Bolt';
  turbTboltMesh.position.set(0.062, 0.042, 0);
  turbineGroup.add(turbTboltMesh);

  // Turbine Housing Manifold Mounting Flange Feet
  [-0.030, 0.030].forEach((mz) => {
    const footGeo = new THREE.BoxGeometry(0.024, 0.030, 0.008);
    const footMesh = new THREE.Mesh(footGeo, matTurbineNiResist);
    footMesh.name = `Turbine_Manifold_Mount_Foot_${mz < 0 ? 'A' : 'B'}`;
    footMesh.position.set(-0.010, 0, mz);
    turbineGroup.add(footMesh);

    const footStudGeo = createThreadedShaft(0.0035, 0.016, 1.25);
    const footStudMesh = new THREE.Mesh(footStudGeo, matStainless);
    footStudMesh.name = `Manifold_Mount_Stud_${mz < 0 ? 'A' : 'B'}`;
    footStudMesh.position.set(-0.010, 0, mz * 1.35);
    turbineGroup.add(footStudMesh);
  });

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

  // Diaphragm Crimp Ring Seams (Top & Bottom of Canister)
  [-0.052, -0.084].forEach((cy) => {
    const crimpGeo = new THREE.TorusGeometry(0.0225, 0.0016, 8, 32);
    crimpGeo.rotateX(Math.PI / 2);
    const crimpMesh = new THREE.Mesh(crimpGeo, matStainless);
    crimpMesh.name = 'Wastegate_Diaphragm_Crimp_Ring';
    crimpMesh.position.set(-0.024, cy, 0.025);
    wastegateGroup.add(crimpMesh);
  });

  // Wastegate Mounting Bracket Tying Canister to the Turbine Housing
  const wgBracketGeo = new THREE.BoxGeometry(0.006, 0.028, 0.014);
  const wgBracketMesh = new THREE.Mesh(wgBracketGeo, matStainless);
  wgBracketMesh.name = 'Wastegate_Mounting_Bracket';
  wgBracketMesh.position.set(-0.024, -0.044, 0.025);
  wastegateGroup.add(wgBracketMesh);

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

  // Crank Arm Pivot Pin with Retaining Clip Groove
  const wgPivotGeo = new THREE.CylinderGeometry(0.0025, 0.0025, 0.016, 12);
  wgPivotGeo.rotateX(Math.PI / 2);
  const wgPivotMesh = new THREE.Mesh(wgPivotGeo, matStainless);
  wgPivotMesh.name = 'Wastegate_Crank_Pivot_Pin';
  wgPivotMesh.position.set(0.036, -0.032, -0.004);
  wastegateGroup.add(wgPivotMesh);

  // Rod-End Clevis Joint at the Linkage Termination
  const clevisGeo = new THREE.SphereGeometry(0.006, 14, 14);
  const clevisMesh = new THREE.Mesh(clevisGeo, matStainless);
  clevisMesh.name = 'Wastegate_RodEnd_Clevis_Joint';
  clevisMesh.position.set(0.028, -0.034, -0.002);
  wastegateGroup.add(clevisMesh);

  unitGroup.add(wastegateGroup);

  return unitGroup;
}

/**
 * Builds the complete ultra-high-fidelity 3D scene graph for a racing turbocharger setup.
 * Supports Single Turbo, Twin Turbo (V6/V8/V12/Boxer), and Quad Turbo (W16/W18).
 */
/**
 * Builds the complete ultra-high-fidelity 3D scene graph for a racing turbocharger setup.
 * Supports Single Turbo, Twin Turbo (V6/V8/V12/Boxer), Quad Turbo (W16/W18), and Hot-V.
 */
export function buildTurbochargerScene(
  configOrCountOrOpts?: Partial<EngineConfig> | TurbochargerBuildOptions | number | string
): THREE.Scene {
  const scene = new THREE.Scene();
  scene.name = 'Turbocharger_System_Scene';

  const rootGroup = new THREE.Group();
  rootGroup.name = 'Turbocharger_Master_Assembly_Group';
  scene.add(rootGroup);

  const matLib = globalMaterialLibrary;
  const matStainless = matLib.getNitridedCrank();
  const matBillet = matLib.getMachinedBillet();

  let opts: TurbochargerBuildOptions = {};
  if (typeof configOrCountOrOpts === 'number') {
    opts = { turboCount: configOrCountOrOpts as any };
  } else if (typeof configOrCountOrOpts === 'string') {
    const s = configOrCountOrOpts.toLowerCase();
    opts = {
      turboCount: s.includes('quad') ? 4 : s.includes('twin') || s.includes('hot_v') ? 2 : 1,
      layout: s.includes('quad') ? 'quad' : s.includes('hot_v') ? 'hot_v' : s.includes('twin') ? 'twin' : 'single',
    };
  } else if (configOrCountOrOpts && typeof configOrCountOrOpts === 'object') {
    if ('compressorInducerMm' in configOrCountOrOpts || 'housingFinish' in configOrCountOrOpts || 'turboCount' in configOrCountOrOpts) {
      opts = configOrCountOrOpts as TurbochargerBuildOptions;
    } else {
      const cfg = configOrCountOrOpts as Partial<EngineConfig>;
      const l = cfg.layout;
      opts = {
        turboCount: (l === 'w16' || l === 'w18') ? 4 : (l === 'v6' || l === 'v8' || l === 'v10' || l === 'v12' || l === 'boxer6') ? 2 : 1,
        housingFinish: cfg.turboHousing,
      };
    }
  }

  const turboCount = opts.turboCount ?? (opts.layout === 'quad' ? 4 : opts.layout === 'twin' || opts.layout === 'hot_v' ? 2 : 1);
  const layout = opts.layout ?? (turboCount === 4 ? 'quad' : turboCount === 2 ? 'twin' : 'single');

  // Coupler Material for Intercooler Pipes
  const couplerKey = (opts.couplerColor || 'blue_silicone').toLowerCase();
  const matSiliconeCoupler =
    couplerKey.includes('red') ? matLib.getRedSilicone() :
    couplerKey.includes('black') || couplerKey.includes('viton') ? matLib.getBlackViton() :
    matLib.getBlueSilicone();

  // Blow-Off Valve Material
  const bovKey = (opts.wastegateCapColor || 'anodized_purple').toLowerCase();
  const matBovCap =
    bovKey.includes('purple') ? matLib.getAnodizedPurple() :
    bovKey.includes('blue') ? matLib.getBilletCobalt() :
    bovKey.includes('gold') ? matLib.getGoldAnodized() :
    bovKey.includes('red') ? matLib.getBilletCrimson() :
    matLib.getStealthBlackCeramic();

  if (layout === 'quad' || turboCount === 4) {
    // ═════════════════════════════════════════════════════════════════════════
    // QUAD-TURBOCHARGER SYSTEM (W16/W18 & Megawatt Hypercar Setup)
    // ═════════════════════════════════════════════════════════════════════════
    const qScale = 0.88 * (opts.scale || 1.0);

    // Front-Left Turbo
    const tFL = createSingleTurboUnit(-0.16, qScale, opts);
    tFL.name = 'Turbocharger_Quad_Front_Left';
    tFL.position.set(-0.14, -0.18, 0.04);
    rootGroup.add(tFL);

    // Rear-Left Turbo
    const tRL = createSingleTurboUnit(-0.16, qScale, opts);
    tRL.name = 'Turbocharger_Quad_Rear_Left';
    tRL.position.set(0.14, -0.18, 0.04);
    rootGroup.add(tRL);

    // Front-Right Turbo
    const tFR = createSingleTurboUnit(0.16, qScale, opts);
    tFR.name = 'Turbocharger_Quad_Front_Right';
    tFR.position.set(-0.14, 0.18, 0.04);
    tFR.rotation.z = Math.PI;
    rootGroup.add(tFR);

    // Rear-Right Turbo
    const tRR = createSingleTurboUnit(0.16, qScale, opts);
    tRR.name = 'Turbocharger_Quad_Rear_Right';
    tRR.position.set(0.14, 0.18, 0.04);
    tRR.rotation.z = Math.PI;
    rootGroup.add(tRR);

    // Intercooler Charge Merge Pipes (Left & Right Banks)
    [-0.18, 0.18].forEach((py, idx) => {
      const bridgeCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.14, py, 0.08),
        new THREE.Vector3(0, py * 0.9, 0.12),
        new THREE.Vector3(0.14, py, 0.08),
      ]);
      const bridgeGeo = new THREE.TubeGeometry(bridgeCurve, 20, 0.018, 16, false);
      const bridgeMesh = new THREE.Mesh(bridgeGeo, matStainless);
      bridgeMesh.name = `Quad_Charge_Merge_Bridge_${idx === 0 ? 'Left' : 'Right'}`;
      bridgeMesh.castShadow = true;
      rootGroup.add(bridgeMesh);

      // Silicone Joiner Sleeves
      [-0.12, 0.12].forEach((sx) => {
        const sleeveGeo = new THREE.CylinderGeometry(0.021, 0.021, 0.022, 24);
        sleeveGeo.rotateZ(Math.PI / 2);
        const sleeveMesh = new THREE.Mesh(sleeveGeo, matSiliconeCoupler);
        sleeveMesh.position.set(sx, py, 0.085);
        rootGroup.add(sleeveMesh);
      });
    });

    // Dual 50mm Atmospheric Blow-Off Valves
    [-0.10, 0.10].forEach((by) => {
      const bovGroup = new THREE.Group();
      bovGroup.name = `Atmospheric_BOV_50mm_${by < 0 ? 'L' : 'R'}`;
      bovGroup.position.set(0, by, 0.13);

      const bovBody = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.018, 0.032, 24), matBillet);
      bovGroup.add(bovBody);

      const bovCap = new THREE.Mesh(new THREE.CylinderGeometry(0.017, 0.017, 0.012, 24), matBovCap);
      bovCap.position.y = 0.018;
      bovGroup.add(bovCap);

      const bovHorn = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.008, 0.018, 20), matBillet);
      bovHorn.rotation.z = Math.PI / 2;
      bovHorn.position.set(0.014, 0, 0);
      bovGroup.add(bovHorn);

      rootGroup.add(bovGroup);
    });

  } else if (layout === 'hot_v') {
    // ═════════════════════════════════════════════════════════════════════════
    // HOT-V TWIN-TURBO SYSTEM (Valley-Mounted Compact Packaging)
    // ═════════════════════════════════════════════════════════════════════════
    const hvScale = 0.92 * (opts.scale || 1.0);
    const tL = createSingleTurboUnit(-0.06, hvScale, opts);
    tL.position.set(-0.04, -0.06, 0.06);
    rootGroup.add(tL);

    const tR = createSingleTurboUnit(0.06, hvScale, opts);
    tR.position.set(-0.04, 0.06, 0.06);
    tR.rotation.z = Math.PI;
    rootGroup.add(tR);

    // Valley Heat Shield Blanket
    const shieldGeo = new THREE.BoxGeometry(0.22, 0.18, 0.006);
    const shieldMesh = new THREE.Mesh(shieldGeo, matLib.getHeatShieldBlanket());
    shieldMesh.name = 'Hot_V_Thermal_Inconel_Heat_Shield';
    shieldMesh.position.set(-0.04, 0, 0.02);
    rootGroup.add(shieldMesh);

  } else if (layout === 'twin' || turboCount === 2) {
    // ═════════════════════════════════════════════════════════════════════════
    // PARALLEL TWIN-TURBO SYSTEM (Left & Right Outboard Turbochargers)
    // ═════════════════════════════════════════════════════════════════════════
    const tScale = 0.96 * (opts.scale || 1.0);
    const tLeft = createSingleTurboUnit(-0.18, tScale, opts);
    tLeft.position.set(0.04, -0.18, 0.02);
    rootGroup.add(tLeft);

    const tRight = createSingleTurboUnit(0.18, tScale, opts);
    tRight.position.set(0.04, 0.18, 0.02);
    tRight.rotation.z = Math.PI;
    rootGroup.add(tRight);

    // Cross-Bank Charge Pipe with Central Blow-Off Valve
    const chargeCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.04, -0.15, 0.06),
      new THREE.Vector3(0.12, 0, 0.10),
      new THREE.Vector3(0.04, 0.15, 0.06),
    ]);
    const chargeGeo = new THREE.TubeGeometry(chargeCurve, 24, 0.022, 16, false);
    const chargeMesh = new THREE.Mesh(chargeGeo, matStainless);
    chargeMesh.name = 'Twin_Turbo_Equalized_Charge_Y_Pipe';
    chargeMesh.castShadow = true;
    rootGroup.add(chargeMesh);

    // Central Atmospheric Blow-Off Valve
    const bovGroup = new THREE.Group();
    bovGroup.name = 'Twin_Turbo_Central_BOV';
    bovGroup.position.set(0.12, 0, 0.12);

    const bovBody = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.020, 0.036, 24), matBillet);
    bovGroup.add(bovBody);

    const bovCap = new THREE.Mesh(new THREE.CylinderGeometry(0.019, 0.019, 0.014, 24), matBovCap);
    bovCap.position.y = 0.022;
    bovGroup.add(bovCap);

    rootGroup.add(bovGroup);

  } else {
    // ═════════════════════════════════════════════════════════════════════════
    // SINGLE HIGH-FLOW TWIN-SCROLL DRAG/RACE TURBOCHARGER
    // ═════════════════════════════════════════════════════════════════════════
    const sScale = 1.15 * (opts.scale || 1.0);
    const tSingle = createSingleTurboUnit(0, sScale, opts);
    tSingle.name = 'Turbocharger_Single_HighFlow_Unit';
    tSingle.position.set(0.08, 0, 0.04);
    rootGroup.add(tSingle);

    // High-Flow Billet Velocity Bellmouth Horn on Inlet Snout
    const bellGeo = new THREE.CylinderGeometry(0.052, 0.040, 0.032, 36);
    bellGeo.rotateZ(Math.PI / 2);
    const bellMesh = new THREE.Mesh(bellGeo, matBillet);
    bellMesh.name = 'CNC_Velocity_Stack_Inlet_Horn';
    bellMesh.position.set(0.08 - 0.11 * sScale, 0, 0.04);
    rootGroup.add(bellMesh);
  }

  return scene;
}

/**
 * Exports the turbocharger scene to a binary GLB ArrayBuffer.
 */
export async function generateTurbochargerGlbBuffer(
  opts?: TurbochargerBuildOptions
): Promise<ArrayBuffer> {
  const scene = buildTurbochargerScene(opts);
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

export async function generateTwinTurboGlbBuffer(opts?: TurbochargerBuildOptions): Promise<ArrayBuffer> {
  return generateTurbochargerGlbBuffer({ ...opts, layout: 'twin', turboCount: 2 });
}

export async function generateQuadTurboGlbBuffer(opts?: TurbochargerBuildOptions): Promise<ArrayBuffer> {
  return generateTurbochargerGlbBuffer({ ...opts, layout: 'quad', turboCount: 4 });
}

export async function generateSingleTurboGlbBuffer(opts?: TurbochargerBuildOptions): Promise<ArrayBuffer> {
  return generateTurbochargerGlbBuffer({ ...opts, layout: 'single', turboCount: 1 });
}

export default buildTurbochargerScene;

