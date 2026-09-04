// ============================================================================
// MODULAR glTF VEHICLE CONSTRUCTION SYSTEM — CAR BODY & COMPONENT GLB GENERATOR
// ============================================================================
// Generates purpose-built, high-polygon exterior car & component GLB assets:
//
//   1. Master Car Assemblies:
//      - hypercar_apex_gt3.glb         — Le Mans prototype / GT3 hypercar
//      - sports_coupe_gt.glb           — Muscular GT fastback coupe
//      - doors_butterfly_pair.glb      — Dihedral butterfly doors
//      - aerodynamic_widebody_kit.glb  — Modular aero kit
//      - full_modular_car_assembly.glb — Complete vehicle with all 40+ parts
//
//   2. Individual Modular Vehicle Component GLBs (all 40+ EXTERIOR_3D_MANIFEST parts):
//      - front_subframe.glb, rear_subframe.glb, floor_pan.glb, firewall_bulkhead.glb
//      - a_pillar.glb, b_pillar.glb, c_pillar.glb, rocker_panels.glb
//      - crash_boxes.glb, roll_cage.glb, suspension_front.glb, suspension_rear.glb
//      - brakes.glb, wheels.glb, hood_panel.glb, hood.glb, front_fenders.glb
//      - doors.glb, rear_quarters.glb, trunk_decklid.glb, roof_panel.glb
//      - front_bumper.glb, rear_bumper.glb, front_splitter.glb, rear_diffuser.glb
//      - side_skirts.glb, rear_wing.glb, canards.glb, vents.glb, windshield.glb
//      - side_glass.glb, rear_window.glb, headlights.glb, taillights.glb, fog_lights.glb
//      - mirrors.glb, grille.glb, exhaust_tips.glb, door_handles.glb, wipers.glb, badges.glb
//      - rear_car_assembly.glb
//
// Coordinate standard: +X right, +Y up, +Z rearward, 1 unit = 1 meter.
// ============================================================================

import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import * as fs from 'fs';
import * as path from 'path';
import { enhanceGlbBuffer } from '../loaders/glbPbrEnhancer';

// Import component geometry generators
import { generateSubframe3DGeometry } from './subframeGenerator';
import { generateHoodPanel3DGeometry } from './hoodPanelGenerator';
import { generateFenders3DGeometry } from './fenderGenerator';
import { generateDoors3DGeometry } from './doorPanelGenerator';
import { generateRoofPanel3DGeometry } from './roofPanelGenerator';
import { generateTrunkLid3DGeometry } from './trunkLidGenerator';
import { generateFrontSplitter3DGeometry } from './frontSplitterGenerator';
import { generateRearDiffuser3DGeometry } from './rearDiffuserGenerator';
import { generateRearWing3DGeometry } from './rearWingGenerator';
import { generateSideSkirts3DGeometry } from './sideSkirtGenerator';
import { generateHeadlights3DGeometry } from './headlightGenerator';
import { generateTaillights3DGeometry } from './taillightGenerator';
import { generateFogLights3DGeometry } from './fogLightGenerator';
import { generateWindshield3DGeometry } from './windshieldGenerator';
import { generateSideGlass3DGeometry } from './sideGlassGenerator';
import { generateRearWindow3DGeometry } from './rearWindowGenerator';
import { generateMirrors3DGeometry } from './mirrorGenerator';
import { generateWheel3DGeometry } from './wheelGenerator';
import { generateBrakes3DGeometry } from './brakeCaliperGenerator';
import { generateFrontSuspension3DGeometry } from './frontSuspensionGenerator';
import { generateRearSuspension3DGeometry } from './rearSuspensionGenerator';
import { generateRearBumper3DGeometry } from './rearBumperGenerator';
import { generateExhaustTips3DGeometry } from './exhaustTipsGenerator';
import { generateTire3DGeometry } from './tireGenerator';
import { generateLoftedBodyShell, HYPERCAR_PROPORTIONS, GT_COUPE_PROPORTIONS } from './automotiveBodyLofter';
import { StampedBodyPrimarySurfaces } from './stampedBodyPrimarySurfaces';
import {
  generatePowertrainBayMesh,
  generateDetailedCockpitMesh,
  generateExteriorRacingHardwareMesh,
  generateInconelExhaustHeadersMesh,
  generateUnderbodyAerodynamicsVenturiMesh,
  generateChassisDoorSillAndExtinguisherMesh,
  generateWheelBalancersAndHubDetailMesh,
} from './highFidelityAutomotiveMeshDetails';
import {
  generateSpaceframeSubframeAndCrashStructureMesh,
  generateDrivetrainDifferentialAndCoolersMesh,
  generateActiveAeroAndFenderLouversMesh,
  generateCockpitMotorsportElectronicsMesh,
} from './spaceframeDrivetrainAndActiveAeroMesh';
import {
  generateFuelCellAndRefuelingSystemMesh,
  generatePneumaticAirJacksSystemMesh,
  generateSteeringRackAndShaftAssemblyMesh,
  generateAuxiliaryCoolersAndDuctingMesh,
  generateTelemetrySensorsAndAeroCurlsMesh,
} from './pneumaticFuelSteeringAndCoolingMesh';
import {
  generateDrySumpLubricationAndCatchCanMesh,
  generateTwinIntercoolersAndBlowOffValvesMesh,
  generatePedalBoxBulkheadMasterCylindersMesh,
  generateDualTierDivePlanesAndFrontVenturiMesh,
  generateRoofRamAirSnorkelMesh,
} from './drySumpIntercoolersAndPedalHydraulicsMesh';
import {
  generateInboardPushrodAndHeaveDamperMesh,
  generateRotorFloatingBobbinsAndTireValvesMesh,
  generateCockpitDashDisplayAndShiftLightsMesh,
  generateRearDiffuserStrakesAndRainLightMesh,
  generateExhaustThermalShieldsAndRearAeroMesh,
} from './inboardPushrodHeaveAndCockpitTelemetryMesh';
import {
  generateHybridKersAndInverterSystemMesh,
  generateRacingClutchFlywheelAndStarterMesh,
  generateSwanNeckWingPylonsAndPitchPlatesMesh,
  generateBumperAirCurtainsAndCaliperBleedersMesh,
  generateRollCagePaddingAndConsoleDialsMesh,
} from './hybridKersClutchAndSwanNeckWingMesh';
import {
  generateSplitterTurnbucklesAndKeelMesh,
  generateTurboThermalBlanketsAndWaterLinesMesh,
  generateSequentialShifterLinkageAndHeelPlateMesh,
  generateCaliperBridgesAndPadClipsMesh,
  generateWingEndplateAeroStrakesAndTireVentsMesh,
} from './splitterStrutsTurboBlanketsAndCaliperBridgesMesh';
import {
  generateDorsalSharkFinAndPitotMesh,
  generatePneumaticShiftActuatorAndGasBottleMesh,
  generateSeatHaloRestraintsAndBracketsMesh,
  generateHubDrivePinsAndLocknutMesh,
  generateExhaustResonatorsAndO2SensorsMesh,
} from './dorsalFinPneumaticShiftAndSeatHaloMesh';
import {
  generateAerocatchLatchesAndTowHookMesh,
  generateHelmetBlowerAndVentilationMesh,
  generateClutchInspectionAndSlaveLineMesh,
  generateRideHeightLasersAndFloorStrakesMesh,
  generateExhaustFlameDispersersAndHangersMesh,
} from './hoodAerocatchHelmetBlowerAndGroundLasersMesh';
import {
  generateWingletGurneyAndFastenersMesh,
  generateCockpitDigitalCamerasAndMonitorsMesh,
  generateEmergencyCutoffAndFabricTowStrapsMesh,
  generateBilletOilCatchTankAndBreathersMesh,
  generateFrontSplitterRampsAndSkidPlatesMesh,
} from './wingletGurneyCatchTankAndSplitterSkidsMesh';
import {
  generateDrsActuatorAndFlapBearingsMesh,
  generateDriverDrinkBottleAndFootboardMesh,
  generateHoodNacaDuctsAndRadiatorScreensMesh,
  generateRotorWearSensorsAndHubInfraredMesh,
  generateExhaustSlipSpringsAndLambdaPlugsMesh,
} from './drsActuatorNacaDuctsAndDrinkSystemMesh';
import {
  generateTransaxleDualCoolersAndScoopsMesh,
  generateBrakeRotorInternalVanesAndHatsMesh,
  generateCockpitCenterNetAndHydrationMesh,
  generateActiveSplitterFlapMotorsMesh,
  generateChassisGroundStrapsAndReluctorRingsMesh,
} from './transaxleCoolersActiveFlapsAndGroundStrapsMesh';

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

function namedMesh(
  geo: THREE.BufferGeometry,
  mat: THREE.Material,
  name: string,
  x = 0,
  y = 0,
  z = 0
): THREE.Mesh {
  const m = new THREE.Mesh(geo, mat);
  m.name = name;
  m.position.set(x, y, z);
  return m;
}

function mountNode(name: string, x: number, y: number, z: number): THREE.Object3D {
  const o = new THREE.Object3D();
  o.name = name;
  o.position.set(x, y, z);
  return o;
}

function sceneFromGroup(group: THREE.Object3D, sceneName: string): THREE.Scene {
  const scene = new THREE.Scene();
  scene.name = sceneName;
  scene.add(group);
  return scene;
}

// Common PBR materials
const matPaintMain = new THREE.MeshStandardMaterial({
  name: 'Car_Body_Primary_Paint',
  color: 0x0ea5e9,
  metalness: 0.90,
  roughness: 0.10,
});

const matCarbonTwill = new THREE.MeshStandardMaterial({
  name: 'Exposed_Carbon_Fiber_Twill',
  color: 0x111827,
  metalness: 0.70,
  roughness: 0.25,
});

const matGlassTinted = new THREE.MeshStandardMaterial({
  name: 'Canopy_Windshield_Tinted_Glass',
  color: 0x0f172a,
  metalness: 0.95,
  roughness: 0.05,
  transparent: true,
  opacity: 0.65,
});

const matChrome = new THREE.MeshStandardMaterial({
  name: 'Polished_Chrome_Trim',
  color: 0xe2e8f0,
  metalness: 0.98,
  roughness: 0.08,
});

const matLaserLights = new THREE.MeshStandardMaterial({
  name: 'Matrix_Laser_Headlight_Optics',
  color: 0xffffff,
  emissive: new THREE.Color(0xfbbf24),
  emissiveIntensity: 0.8,
});

const matOledTaillights = new THREE.MeshStandardMaterial({
  name: 'OLED_Taillight_Lightbar',
  color: 0xff1e1e,
  emissive: new THREE.Color(0xef4444),
  emissiveIntensity: 0.9,
});

/** 1. Apex GT3 / Prototype Le Mans Hypercar Body Assembly */
export function buildApexGT3HypercarScene(): THREE.Scene {
  const scene = new THREE.Scene();
  scene.name = 'Apex_GT3_Hypercar_Scene';

  const root = new THREE.Group();
  root.name = 'Apex_GT3_Hypercar_Master_Body';
  scene.add(root);

  const bodyGroup = new THREE.Group();
  bodyGroup.name = 'Hypercar_Sculpted_Fuselage';

  // Phases 03-07: Lofted primary body surfaces, coke-bottle contour, wheel arches & split panels (24 subdivisions)
  const loftedShell = generateLoftedBodyShell(
    HYPERCAR_PROPORTIONS,
    matPaintMain,
    matCarbonTwill,
    { longitudinalSubdivisions: 24, splitUpperLower: true }
  );
  loftedShell.name = 'Hypercar_CatmullRom_Lofted_Shell';
  // Align ISO 8855 (+X forward, +Z right) to scene standard (-Z forward, +X right)
  loftedShell.rotation.y = -Math.PI / 2;
  loftedShell.position.set(0, 0, 0.45);
  bodyGroup.add(loftedShell);

  // Batch 1: Stamped G2 primary surfaces & real 3D radiator cavities
  const stampedSurfaces = StampedBodyPrimarySurfaces.buildStampedBody({
    paintMaterial: matPaintMain,
    carbonMaterial: matCarbonTwill,
    glassMaterial: matGlassTinted,
  });
  bodyGroup.add(stampedSurfaces);

  // Batch 1: Stamped contoured wheel arches, rolled lips & inner wheelhouse tubs
  const stampedFenders = generateFenders3DGeometry();
  bodyGroup.add(stampedFenders);

  for (const sx of [-1, 1]) {
    for (let l = 0; l < 4; l++) {
      const louverGeo = new THREE.BoxGeometry(0.18, 0.012, 0.06);
      const louver = namedMesh(louverGeo, matCarbonTwill, `Fender_Louver_${sx < 0 ? 'LH' : 'RH'}_${l + 1}`, sx * 0.84, 0.72 + l * 0.015, -1.30 + l * 0.09);
      louver.rotation.x = -0.35;
      bodyGroup.add(louver);
    }
  }

  for (const sx of [-1, 1]) {
    const intakeGeo = new THREE.BoxGeometry(0.14, 0.24, 0.42);
    bodyGroup.add(namedMesh(intakeGeo, matCarbonTwill, `Side_Naca_Intake_Duct_${sx < 0 ? 'LH' : 'RH'}`, sx * 0.88, 0.50, 0.35));
  }

  const canopyGeo = new THREE.SphereGeometry(0.68, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2);
  canopyGeo.scale(1.0, 0.65, 1.85);
  bodyGroup.add(namedMesh(canopyGeo, matGlassTinted, 'Teardrop_Cockpit_Canopy_Glass', 0, 0.68, -0.15));

  const scoopGeo = new THREE.ConeGeometry(0.18, 0.62, 12);
  scoopGeo.rotateX(-Math.PI / 2);
  bodyGroup.add(namedMesh(scoopGeo, matCarbonTwill, 'Roof_Periscope_Intake_Scoop', 0, 1.02, 0.35));

  const finGeo = new THREE.BoxGeometry(0.024, 0.45, 1.25);
  bodyGroup.add(namedMesh(finGeo, matCarbonTwill, 'Aero_Stabilizer_Shark_Fin', 0, 0.95, 1.05));
  root.add(bodyGroup);

  // Phases 08-10: 4 Corner Wheel, Tire & Brake Assemblies
  const wheelsGroup = new THREE.Group();
  wheelsGroup.name = 'Hypercar_Corner_Wheels_Brakes';
  const wheelCorners = [
    { name: 'FL', x: -0.84, y: 0.34, z: -1.35, isLeft: true },
    { name: 'FR', x: 0.84, y: 0.34, z: -1.35, isLeft: false },
    { name: 'RL', x: -0.86, y: 0.34, z: 1.35, isLeft: true },
    { name: 'RR', x: 0.86, y: 0.34, z: 1.35, isLeft: false },
  ];
  for (const c of wheelCorners) {
    const cornerGroup = new THREE.Group();
    cornerGroup.name = `Wheel_Corner_${c.name}`;
    cornerGroup.position.set(c.x, c.y, c.z);

    const rim = generateWheel3DGeometry({ finish: 'satin_bronze' });
    rim.name = `Wheel_Rim_${c.name}`;
    rim.rotation.y = c.isLeft ? -Math.PI / 2 : Math.PI / 2;
    cornerGroup.add(rim);

    const tire = generateTire3DGeometry();
    tire.name = `Tire_${c.name}`;
    tire.rotation.y = c.isLeft ? -Math.PI / 2 : Math.PI / 2;
    cornerGroup.add(tire);

    const brakes = generateBrakes3DGeometry({ caliperColorHex: '#dc2626' });
    brakes.name = `Brakes_Assembly_${c.name}`;
    brakes.rotation.y = c.isLeft ? -Math.PI / 2 : Math.PI / 2;
    brakes.position.x = c.isLeft ? 0.03 : -0.03;
    cornerGroup.add(brakes);

    wheelsGroup.add(cornerGroup);
  }
  root.add(wheelsGroup);

  const aeroGroup = new THREE.Group();
  aeroGroup.name = 'Hypercar_Aero_Package';
  const splitterGeo = new THREE.BoxGeometry(1.96, 0.035, 0.68);
  aeroGroup.add(namedMesh(splitterGeo, matCarbonTwill, 'Front_Track_Carbon_Splitter', 0, 0.14, -2.15));

  for (const sx of [-1, 1]) {
    const canard1 = namedMesh(new THREE.BoxGeometry(0.26, 0.015, 0.16), matCarbonTwill, `Front_Dive_Plane_Upper_${sx < 0 ? 'LH' : 'RH'}`, sx * 0.94, 0.42, -2.05);
    canard1.rotation.z = sx * 0.20;
    canard1.rotation.y = sx * -0.25;
    const canard2 = namedMesh(new THREE.BoxGeometry(0.28, 0.015, 0.18), matCarbonTwill, `Front_Dive_Plane_Lower_${sx < 0 ? 'LH' : 'RH'}`, sx * 0.96, 0.28, -2.08);
    canard2.rotation.z = sx * 0.20;
    canard2.rotation.y = sx * -0.25;
    aeroGroup.add(canard1, canard2);
    const skirtGeo = new THREE.BoxGeometry(0.12, 0.04, 2.45);
    aeroGroup.add(namedMesh(skirtGeo, matCarbonTwill, `Side_Skirt_Aero_Blade_${sx < 0 ? 'LH' : 'RH'}`, sx * 0.95, 0.14, 0.0));
  }

  const diffuserGeo = new THREE.BoxGeometry(1.65, 0.18, 0.85);
  diffuserGeo.rotateX(0.18);
  aeroGroup.add(namedMesh(diffuserGeo, matCarbonTwill, 'Rear_Venturi_Diffuser_Main', 0, 0.22, 2.05));

  for (const sx of [-0.48, -0.16, 0.16, 0.48]) {
    const strake = namedMesh(new THREE.BoxGeometry(0.018, 0.16, 0.72), matCarbonTwill, `Diffuser_Vertical_Strake_X${sx}`, sx, 0.22, 2.05);
    strake.rotation.x = 0.18;
    aeroGroup.add(strake);
  }

  const wingBladeGeo = new THREE.BoxGeometry(1.92, 0.038, 0.38);
  wingBladeGeo.rotateX(-0.12);
  aeroGroup.add(namedMesh(wingBladeGeo, matCarbonTwill, 'Swan_Neck_Active_Rear_Wing', 0, 1.15, 2.15));

  for (const sx of [-0.42, 0.42]) {
    const pylonCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(sx, 0.72, 1.78),
      new THREE.Vector3(sx, 1.22, 1.95),
      new THREE.Vector3(sx, 1.15, 2.15),
    ]);
    aeroGroup.add(namedMesh(new THREE.TubeGeometry(pylonCurve, 12, 0.024, 10), matCarbonTwill, `Swan_Neck_Pylon_${sx < 0 ? 'LH' : 'RH'}`));
  }
  root.add(aeroGroup);

  // Phase 11: Front & Rear High-Fidelity Suspension Rigs
  const frontSusp = generateFrontSuspension3DGeometry();
  frontSusp.position.set(0, 0.34, -1.35);
  root.add(frontSusp);

  const rearSusp = generateRearSuspension3DGeometry();
  rearSusp.position.set(0, 0.34, 1.35);
  root.add(rearSusp);

  // Phase 15: Cockpit Interior Seating & Ergonomics
  root.add(buildCockpitInteriorScene('hypercar'));

  // Phase 17: Side Wing Mirrors
  const mirrors = generateMirrors3DGeometry();
  mirrors.position.set(0, 0.65, -0.45);
  root.add(mirrors);

  // Phase 13: High-Fidelity Matrix LED & Taillights
  const headlights = generateHeadlights3DGeometry();
  headlights.position.set(0, 0.48, -2.05);
  root.add(headlights);

  const taillights = generateTaillights3DGeometry();
  taillights.position.set(0, 0.68, 2.15);
  root.add(taillights);

  // High-Density Mechanical, Cockpit & Racing Hardware Meshes
  root.add(generatePowertrainBayMesh());
  root.add(generateDetailedCockpitMesh('hypercar'));
  root.add(generateExteriorRacingHardwareMesh());
  root.add(generateInconelExhaustHeadersMesh());
  root.add(generateUnderbodyAerodynamicsVenturiMesh());
  root.add(generateChassisDoorSillAndExtinguisherMesh());
  root.add(generateWheelBalancersAndHubDetailMesh());
  root.add(generateSpaceframeSubframeAndCrashStructureMesh());
  root.add(generateDrivetrainDifferentialAndCoolersMesh());
  root.add(generateActiveAeroAndFenderLouversMesh());
  root.add(generateCockpitMotorsportElectronicsMesh());
  root.add(generateFuelCellAndRefuelingSystemMesh());
  root.add(generatePneumaticAirJacksSystemMesh());
  root.add(generateSteeringRackAndShaftAssemblyMesh());
  root.add(generateAuxiliaryCoolersAndDuctingMesh());
  root.add(generateTelemetrySensorsAndAeroCurlsMesh());
  root.add(generateDrySumpLubricationAndCatchCanMesh());
  root.add(generateTwinIntercoolersAndBlowOffValvesMesh());
  root.add(generatePedalBoxBulkheadMasterCylindersMesh());
  root.add(generateDualTierDivePlanesAndFrontVenturiMesh());
  root.add(generateRoofRamAirSnorkelMesh());
  root.add(generateInboardPushrodAndHeaveDamperMesh());
  root.add(generateRotorFloatingBobbinsAndTireValvesMesh());
  root.add(generateCockpitDashDisplayAndShiftLightsMesh());
  root.add(generateRearDiffuserStrakesAndRainLightMesh());
  root.add(generateExhaustThermalShieldsAndRearAeroMesh());
  root.add(generateHybridKersAndInverterSystemMesh());
  root.add(generateRacingClutchFlywheelAndStarterMesh());
  root.add(generateSwanNeckWingPylonsAndPitchPlatesMesh());
  root.add(generateBumperAirCurtainsAndCaliperBleedersMesh());
  root.add(generateRollCagePaddingAndConsoleDialsMesh());
  root.add(generateSplitterTurnbucklesAndKeelMesh());
  root.add(generateTurboThermalBlanketsAndWaterLinesMesh());
  root.add(generateSequentialShifterLinkageAndHeelPlateMesh());
  root.add(generateCaliperBridgesAndPadClipsMesh());
  root.add(generateWingEndplateAeroStrakesAndTireVentsMesh());
  root.add(generateDorsalSharkFinAndPitotMesh());
  root.add(generatePneumaticShiftActuatorAndGasBottleMesh());
  root.add(generateSeatHaloRestraintsAndBracketsMesh());
  root.add(generateHubDrivePinsAndLocknutMesh());
  root.add(generateExhaustResonatorsAndO2SensorsMesh());
  root.add(generateAerocatchLatchesAndTowHookMesh());
  root.add(generateHelmetBlowerAndVentilationMesh());
  root.add(generateClutchInspectionAndSlaveLineMesh());
  root.add(generateRideHeightLasersAndFloorStrakesMesh());
  root.add(generateExhaustFlameDispersersAndHangersMesh());
  root.add(generateWingletGurneyAndFastenersMesh());
  root.add(generateCockpitDigitalCamerasAndMonitorsMesh());
  root.add(generateEmergencyCutoffAndFabricTowStrapsMesh());
  root.add(generateBilletOilCatchTankAndBreathersMesh());
  root.add(generateFrontSplitterRampsAndSkidPlatesMesh());
  root.add(generateDrsActuatorAndFlapBearingsMesh());
  root.add(generateDriverDrinkBottleAndFootboardMesh());
  root.add(generateHoodNacaDuctsAndRadiatorScreensMesh());
  root.add(generateRotorWearSensorsAndHubInfraredMesh());
  root.add(generateExhaustSlipSpringsAndLambdaPlugsMesh());
  root.add(generateTransaxleDualCoolersAndScoopsMesh());
  root.add(generateBrakeRotorInternalVanesAndHatsMesh());
  root.add(generateCockpitCenterNetAndHydrationMesh());
  root.add(generateActiveSplitterFlapMotorsMesh());
  root.add(generateChassisGroundStrapsAndReluctorRingsMesh());

  return scene;
}

/** Helper builder for physical cockpit interior visible through glass */
function buildCockpitInteriorScene(type: 'hypercar' | 'gt'): THREE.Group {
  const interiorGroup = new THREE.Group();
  interiorGroup.name = `${type === 'hypercar' ? 'Hypercar' : 'GT_Coupe'}_Cockpit_Interior`;

  // 1. Molded Carbon Dashboard Binnacle
  const dashGeo = new THREE.BoxGeometry(1.22, 0.28, 0.46);
  const dashMesh = namedMesh(dashGeo, matCarbonTwill, 'Cockpit_Molded_Dashboard', 0, 0.62, -0.42);
  interiorGroup.add(dashMesh);

  // 2. Digital Instrument Cluster (HUD Screen)
  const screenMat = new THREE.MeshStandardMaterial({
    name: 'Digital_Cockpit_Telemetry_Display',
    color: 0x0284c7,
    emissive: new THREE.Color(0x38bdf8),
    emissiveIntensity: 1.8,
  });
  const screenGeo = new THREE.PlaneGeometry(0.24, 0.11);
  const screenMesh = new THREE.Mesh(screenGeo, screenMat);
  screenMesh.name = 'Telemetry_HUD_Screen';
  screenMesh.position.set(-0.32, 0.72, -0.32);
  screenMesh.rotation.x = -0.28;
  interiorGroup.add(screenMesh);

  // 3. Central Infotainment Display
  const centerScreenGeo = new THREE.PlaneGeometry(0.26, 0.16);
  const centerScreen = new THREE.Mesh(centerScreenGeo, screenMat);
  centerScreen.name = 'Center_Console_Infotainment';
  centerScreen.position.set(0, 0.66, -0.36);
  centerScreen.rotation.x = -0.35;
  interiorGroup.add(centerScreen);

  // 4. Twin Racing Bucket Seats
  const cushionMat = new THREE.MeshStandardMaterial({
    name: 'Alcantara_Seat_Cushion',
    color: type === 'hypercar' ? 0x18181b : 0x27272a,
    roughness: 0.92,
    metalness: 0.05,
  });

  for (const sx of [-0.34, 0.34]) {
    const seatGroup = new THREE.Group();
    seatGroup.name = `Race_Bucket_Seat_${sx < 0 ? 'LH_Driver' : 'RH_Passenger'}`;
    seatGroup.position.set(sx, 0.42, 0.05);

    // Carbon fiber back shell
    const backGeo = new THREE.BoxGeometry(0.42, 0.62, 0.08);
    const backMesh = namedMesh(backGeo, matCarbonTwill, `Seat_Back_Shell_${sx < 0 ? 'LH' : 'RH'}`, 0, 0.28, -0.06);
    backMesh.rotation.x = 0.22;
    seatGroup.add(backMesh);

    // Base cushion
    const cushionGeo = new THREE.BoxGeometry(0.38, 0.08, 0.42);
    const cushionMesh = namedMesh(cushionGeo, cushionMat, `Seat_Base_Cushion_${sx < 0 ? 'LH' : 'RH'}`, 0, 0.04, 0.12);
    seatGroup.add(cushionMesh);

    // Headrest
    const headrestGeo = new THREE.BoxGeometry(0.22, 0.16, 0.07);
    const headrestMesh = namedMesh(headrestGeo, cushionMat, `Seat_Headrest_${sx < 0 ? 'LH' : 'RH'}`, 0, 0.58, -0.12);
    seatGroup.add(headrestMesh);

    interiorGroup.add(seatGroup);
  }

  // 5. Motorsport Steering Wheel
  const steeringGroup = new THREE.Group();
  steeringGroup.name = 'Motorsport_Steering_Wheel_Assembly';
  steeringGroup.position.set(-0.32, 0.64, -0.28);
  steeringGroup.rotation.x = 0.35;

  const rimGeo = new THREE.TorusGeometry(0.13, 0.015, 12, 32);
  const steeringRim = namedMesh(rimGeo, matCarbonTwill, 'Steering_Wheel_Rim', 0, 0, 0);
  const hubGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.02, 16);
  hubGeo.rotateX(Math.PI / 2);
  const hubMesh = namedMesh(hubGeo, matCarbonTwill, 'Steering_Wheel_Hub', 0, 0, 0);
  steeringGroup.add(steeringRim, hubMesh);
  interiorGroup.add(steeringGroup);

  // 6. FIA Safety Roll Cage
  const cageMat = new THREE.MeshStandardMaterial({
    name: 'FIA_Homologated_Roll_Cage_Tube',
    color: type === 'hypercar' ? 0x0284c7 : 0xdc2626,
    metalness: 0.85,
    roughness: 0.22,
  });

  const mainHoopCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.62, 0.35, 0.38),
    new THREE.Vector3(-0.60, 0.96, 0.38),
    new THREE.Vector3(0.0, 1.02, 0.38),
    new THREE.Vector3(0.60, 0.96, 0.38),
    new THREE.Vector3(0.62, 0.35, 0.38),
  ]);
  const mainHoop = namedMesh(new THREE.TubeGeometry(mainHoopCurve, 24, 0.022, 12), cageMat, 'FIA_Roll_Cage_Main_Hoop');
  interiorGroup.add(mainHoop);

  return interiorGroup;
}

/** 2. Muscular Grand Tourer / Sports GT Coupe Body Assembly */
export function buildSportsGTCoupeScene(): THREE.Scene {
  const scene = new THREE.Scene();
  scene.name = 'Sports_GT_Coupe_Scene';
  const root = new THREE.Group();
  root.name = 'Sports_GT_Coupe_Master_Body';
  scene.add(root);

  const matRedPaint = new THREE.MeshStandardMaterial({ name: 'Car_Body_Primary_Paint', color: 0x991b1b, metalness: 0.88, roughness: 0.14 });
  const matCarbon = new THREE.MeshStandardMaterial({ name: 'Carbon_Trim_Aero', color: 0x1e293b, metalness: 0.65, roughness: 0.35 });
  const matGlass = new THREE.MeshStandardMaterial({ name: 'Fastback_Glass_Canopy', color: 0x0a0f1d, metalness: 0.96, roughness: 0.04, transparent: true, opacity: 0.70 });

  // Lofted GT Coupe Body Shell (24 subdivisions)
  const loftedGt = generateLoftedBodyShell(
    GT_COUPE_PROPORTIONS,
    matRedPaint,
    matCarbon,
    { longitudinalSubdivisions: 24, splitUpperLower: true }
  );
  loftedGt.name = 'GT_Coupe_CatmullRom_Lofted_Shell';
  loftedGt.rotation.y = -Math.PI / 2;
  loftedGt.position.set(0, 0, 0.50);
  root.add(loftedGt);

  // Batch 1: Stamped GT Coupe primary body surfaces replacing primitive boxes
  const stampedGtSurfaces = StampedBodyPrimarySurfaces.buildStampedBody({
    paintMaterial: matRedPaint,
    carbonMaterial: matCarbon,
    glassMaterial: matGlass,
  });
  root.add(stampedGtSurfaces);

  const stampedGtFenders = generateFenders3DGeometry();
  root.add(stampedGtFenders);

  // 4 Corner Wheels for GT Coupe
  const gtWheelCorners = [
    { name: 'FL', x: -0.81, y: 0.34, z: -1.35, isLeft: true },
    { name: 'FR', x: 0.81, y: 0.34, z: -1.35, isLeft: false },
    { name: 'RL', x: -0.83, y: 0.34, z: 1.45, isLeft: true },
    { name: 'RR', x: 0.83, y: 0.34, z: 1.45, isLeft: false },
  ];
  for (const c of gtWheelCorners) {
    const cg = new THREE.Group();
    cg.name = `GT_Wheel_Corner_${c.name}`;
    cg.position.set(c.x, c.y, c.z);

    const rim = generateWheel3DGeometry({ finish: 'gloss_jet_black' });
    rim.rotation.y = c.isLeft ? -Math.PI / 2 : Math.PI / 2;
    cg.add(rim);

    const tire = generateTire3DGeometry();
    tire.rotation.y = c.isLeft ? -Math.PI / 2 : Math.PI / 2;
    cg.add(tire);

    const brakes = generateBrakes3DGeometry({ caliperColorHex: '#eab308' });
    brakes.rotation.y = c.isLeft ? -Math.PI / 2 : Math.PI / 2;
    brakes.position.x = c.isLeft ? 0.03 : -0.03;
    cg.add(brakes);

    root.add(cg);
  }

  // Suspension Rigs for GT Coupe
  const gtFrontSusp = generateFrontSuspension3DGeometry();
  gtFrontSusp.position.set(0, 0.34, -1.35);
  root.add(gtFrontSusp);

  const gtRearSusp = generateRearSuspension3DGeometry();
  gtRearSusp.position.set(0, 0.34, 1.45);
  root.add(gtRearSusp);

  // Cockpit Interior for GT Coupe
  root.add(buildCockpitInteriorScene('gt'));

  // High-Fidelity Exhaust Tips with Heat Bluing
  const gtExhaust = generateExhaustTips3DGeometry();
  gtExhaust.position.set(0, 0.32, 2.25);
  root.add(gtExhaust);

  // Side Mirrors
  const gtMirrors = generateMirrors3DGeometry();
  gtMirrors.position.set(0, 0.68, -0.42);
  root.add(gtMirrors);

  // High-Density Mechanical & Cockpit Hardware for GT Coupe
  root.add(generatePowertrainBayMesh());
  root.add(generateDetailedCockpitMesh('gt'));
  root.add(generateExteriorRacingHardwareMesh());
  root.add(generateInconelExhaustHeadersMesh());
  root.add(generateUnderbodyAerodynamicsVenturiMesh());
  root.add(generateChassisDoorSillAndExtinguisherMesh());
  root.add(generateWheelBalancersAndHubDetailMesh());
  root.add(generateSpaceframeSubframeAndCrashStructureMesh());
  root.add(generateDrivetrainDifferentialAndCoolersMesh());
  root.add(generateActiveAeroAndFenderLouversMesh());
  root.add(generateCockpitMotorsportElectronicsMesh());
  root.add(generateFuelCellAndRefuelingSystemMesh());
  root.add(generatePneumaticAirJacksSystemMesh());
  root.add(generateSteeringRackAndShaftAssemblyMesh());
  root.add(generateAuxiliaryCoolersAndDuctingMesh());
  root.add(generateTelemetrySensorsAndAeroCurlsMesh());
  root.add(generateDrySumpLubricationAndCatchCanMesh());
  root.add(generateTwinIntercoolersAndBlowOffValvesMesh());
  root.add(generatePedalBoxBulkheadMasterCylindersMesh());
  root.add(generateDualTierDivePlanesAndFrontVenturiMesh());
  root.add(generateRoofRamAirSnorkelMesh());
  root.add(generateInboardPushrodAndHeaveDamperMesh());
  root.add(generateRotorFloatingBobbinsAndTireValvesMesh());
  root.add(generateCockpitDashDisplayAndShiftLightsMesh());
  root.add(generateRearDiffuserStrakesAndRainLightMesh());
  root.add(generateExhaustThermalShieldsAndRearAeroMesh());
  root.add(generateHybridKersAndInverterSystemMesh());
  root.add(generateRacingClutchFlywheelAndStarterMesh());
  root.add(generateSwanNeckWingPylonsAndPitchPlatesMesh());
  root.add(generateBumperAirCurtainsAndCaliperBleedersMesh());
  root.add(generateRollCagePaddingAndConsoleDialsMesh());
  root.add(generateSplitterTurnbucklesAndKeelMesh());
  root.add(generateTurboThermalBlanketsAndWaterLinesMesh());
  root.add(generateSequentialShifterLinkageAndHeelPlateMesh());
  root.add(generateCaliperBridgesAndPadClipsMesh());
  root.add(generateWingEndplateAeroStrakesAndTireVentsMesh());
  root.add(generateDorsalSharkFinAndPitotMesh());
  root.add(generatePneumaticShiftActuatorAndGasBottleMesh());
  root.add(generateSeatHaloRestraintsAndBracketsMesh());
  root.add(generateHubDrivePinsAndLocknutMesh());
  root.add(generateExhaustResonatorsAndO2SensorsMesh());
  root.add(generateAerocatchLatchesAndTowHookMesh());
  root.add(generateHelmetBlowerAndVentilationMesh());
  root.add(generateClutchInspectionAndSlaveLineMesh());
  root.add(generateRideHeightLasersAndFloorStrakesMesh());
  root.add(generateExhaustFlameDispersersAndHangersMesh());
  root.add(generateWingletGurneyAndFastenersMesh());
  root.add(generateCockpitDigitalCamerasAndMonitorsMesh());
  root.add(generateEmergencyCutoffAndFabricTowStrapsMesh());
  root.add(generateBilletOilCatchTankAndBreathersMesh());
  root.add(generateFrontSplitterRampsAndSkidPlatesMesh());
  root.add(generateDrsActuatorAndFlapBearingsMesh());
  root.add(generateDriverDrinkBottleAndFootboardMesh());
  root.add(generateHoodNacaDuctsAndRadiatorScreensMesh());
  root.add(generateRotorWearSensorsAndHubInfraredMesh());
  root.add(generateExhaustSlipSpringsAndLambdaPlugsMesh());
  root.add(generateTransaxleDualCoolersAndScoopsMesh());
  root.add(generateBrakeRotorInternalVanesAndHatsMesh());
  root.add(generateCockpitCenterNetAndHydrationMesh());
  root.add(generateActiveSplitterFlapMotorsMesh());
  root.add(generateChassisGroundStrapsAndReluctorRingsMesh());

  root.add(namedMesh(new THREE.BoxGeometry(1.10, 0.28, 0.08), matCarbon, 'Front_Lower_Hex_Grille', 0, 0.34, -2.28));

  // Batch 1: Stamped primary surfaces & contoured wheel arches
  root.add(StampedBodyPrimarySurfaces.buildStampedBody({
    paintMaterial: matPaintMain,
    carbonMaterial: matCarbonTwill,
    glassMaterial: matGlassTinted,
  }));
  root.add(generateFenders3DGeometry());

  return scene;
}

/** 3. Articulated Dihedral Butterfly Doors Assembly */
export function buildButterflyDoorsScene(): THREE.Scene {
  const scene = new THREE.Scene();
  scene.name = 'Butterfly_Doors_Assembly_Scene';
  const root = new THREE.Group();
  root.name = 'Butterfly_Doors_Master';
  scene.add(root);

  for (const sx of [-1, 1]) {
    const doorGroup = new THREE.Group();
    doorGroup.name = `Butterfly_Door_Assembly_${sx < 0 ? 'LH' : 'RH'}`;
    doorGroup.add(namedMesh(new THREE.BoxGeometry(0.06, 0.58, 1.25), matPaintMain, `Door_Outer_Skin_${sx < 0 ? 'LH' : 'RH'}`, sx * 0.88, 0.62, 0.0));
    doorGroup.add(namedMesh(new THREE.BoxGeometry(0.04, 0.52, 1.15), matCarbonTwill, `Door_Inner_Card_${sx < 0 ? 'LH' : 'RH'}`, sx * 0.84, 0.62, 0.0));
    doorGroup.add(namedMesh(new THREE.BoxGeometry(0.015, 0.38, 1.05), matGlassTinted, `Door_Frameless_Window_${sx < 0 ? 'LH' : 'RH'}`, sx * 0.85, 0.98, 0.05));
    root.add(doorGroup);
  }
  return scene;
}

/** 4. Modular Aerodynamic Widebody Kit Assembly */
export function buildAerodynamicWidebodyKitScene(): THREE.Scene {
  const scene = new THREE.Scene();
  scene.name = 'Aerodynamic_Widebody_Kit_Scene';
  const root = new THREE.Group();
  root.name = 'Aero_Widebody_Kit_Master';
  scene.add(root);

  root.add(namedMesh(new THREE.BoxGeometry(1.98, 0.04, 0.72), matCarbonTwill, 'Aero_Front_Splitter_Track', 0, 0.12, -2.18));
  for (const sx of [-1, 1]) {
    root.add(namedMesh(new THREE.BoxGeometry(0.14, 0.035, 2.50), matCarbonTwill, `Aero_Side_Skirt_${sx < 0 ? 'LH' : 'RH'}`, sx * 0.96, 0.12, 0.0));
  }
  root.add(namedMesh(new THREE.BoxGeometry(1.72, 0.18, 0.88), matCarbonTwill, 'Aero_Rear_Venturi_Diffuser', 0, 0.20, 2.10));
  root.add(namedMesh(new THREE.BoxGeometry(1.95, 0.04, 0.40), matCarbonTwill, 'Aero_Swan_Neck_Wing_Blade', 0, 1.18, 2.18));
  return scene;
}

// ─── 5. INDIVIDUAL MODULAR COMPONENT SCENE BUILDERS ───

function buildFloorPanScene(): THREE.Scene {
  const group = new THREE.Group();
  group.name = 'Floor_Pan_Assembly';
  const floorGeo = new THREE.BoxGeometry(1.45, 0.04, 2.65);
  group.add(namedMesh(floorGeo, matCarbonTwill, 'Floor_Pan_Primary_Tub', 0, 0.12, 0));
  const tunnelGeo = new THREE.BoxGeometry(0.32, 0.22, 2.45);
  group.add(namedMesh(tunnelGeo, matCarbonTwill, 'Torque_Tunnel_Enclosure', 0, 0.24, 0));
  return sceneFromGroup(group, 'Floor_Pan_Scene');
}

function buildFirewallBulkheadScene(): THREE.Scene {
  const group = new THREE.Group();
  group.name = 'Firewall_Bulkhead_Assembly';
  const wallGeo = new THREE.BoxGeometry(1.52, 0.65, 0.05);
  group.add(namedMesh(wallGeo, matCarbonTwill, 'Engine_Firewall_Barrier', 0, 0.55, -0.95));
  const cowlGeo = new THREE.BoxGeometry(1.48, 0.14, 0.28);
  group.add(namedMesh(cowlGeo, matCarbonTwill, 'Windshield_Cowl_Structure', 0, 0.82, -0.95));
  return sceneFromGroup(group, 'Firewall_Bulkhead_Scene');
}

function buildAPillarScene(): THREE.Scene {
  const group = new THREE.Group();
  group.name = 'A_Pillar_Assembly';
  for (const sx of [-1, 1]) {
    const pillarGeo = new THREE.BoxGeometry(0.08, 0.72, 0.08);
    const pillar = namedMesh(pillarGeo, matPaintMain, `A_Pillar_Upright_${sx < 0 ? 'LH' : 'RH'}`, sx * 0.72, 0.85, -0.65);
    pillar.rotation.z = sx * -0.22;
    pillar.rotation.x = -0.45;
    group.add(pillar);
  }
  return sceneFromGroup(group, 'A_Pillar_Scene');
}

function buildBPillarScene(): THREE.Scene {
  const group = new THREE.Group();
  group.name = 'B_Pillar_Assembly';
  for (const sx of [-1, 1]) {
    const pillarGeo = new THREE.BoxGeometry(0.09, 0.68, 0.09);
    const pillar = namedMesh(pillarGeo, matPaintMain, `B_Pillar_Upright_${sx < 0 ? 'LH' : 'RH'}`, sx * 0.74, 0.82, 0.25);
    pillar.rotation.z = sx * -0.08;
    group.add(pillar);
  }
  return sceneFromGroup(group, 'B_Pillar_Scene');
}

function buildCPillarScene(): THREE.Scene {
  const group = new THREE.Group();
  group.name = 'C_Pillar_Assembly';
  for (const sx of [-1, 1]) {
    const pillarGeo = new THREE.BoxGeometry(0.12, 0.64, 0.22);
    const pillar = namedMesh(pillarGeo, matPaintMain, `C_Pillar_Fastback_${sx < 0 ? 'LH' : 'RH'}`, sx * 0.76, 0.84, 1.15);
    pillar.rotation.x = 0.35;
    pillar.rotation.z = sx * -0.15;
    group.add(pillar);
  }
  return sceneFromGroup(group, 'C_Pillar_Scene');
}

function buildRockerPanelsScene(): THREE.Scene {
  const group = new THREE.Group();
  group.name = 'Rocker_Panels_Assembly';
  for (const sx of [-1, 1]) {
    const sillGeo = new THREE.BoxGeometry(0.12, 0.16, 2.55);
    group.add(namedMesh(sillGeo, matPaintMain, `Rocker_Panel_Sill_${sx < 0 ? 'LH' : 'RH'}`, sx * 0.86, 0.18, 0));
  }
  return sceneFromGroup(group, 'Rocker_Panels_Scene');
}

function buildCrashBoxesScene(): THREE.Scene {
  const group = new THREE.Group();
  group.name = 'Crash_Boxes_Assembly';
  for (const sx of [-0.52, 0.52]) {
    const frontBox = namedMesh(new THREE.BoxGeometry(0.16, 0.18, 0.38), matCarbonTwill, `Crash_Box_Front_X${sx}`, sx, 0.32, -2.05);
    const rearBox = namedMesh(new THREE.BoxGeometry(0.16, 0.18, 0.38), matCarbonTwill, `Crash_Box_Rear_X${sx}`, sx, 0.32, 2.05);
    group.add(frontBox, rearBox);
  }
  return sceneFromGroup(group, 'Crash_Boxes_Scene');
}

function buildRollCageScene(): THREE.Scene {
  const group = new THREE.Group();
  group.name = 'Roll_Cage_Assembly';
  const matTubing = new THREE.MeshStandardMaterial({ name: 'Chromo_Roll_Cage_Steel', color: 0xfbbf24, metalness: 0.85, roughness: 0.20 });
  const hoopFront = namedMesh(new THREE.CylinderGeometry(0.024, 0.024, 1.35, 12), matTubing, 'Roll_Cage_Front_Hoop', 0, 1.05, -0.45);
  hoopFront.rotation.z = Math.PI / 2;
  const hoopMain = namedMesh(new THREE.CylinderGeometry(0.026, 0.026, 1.38, 12), matTubing, 'Roll_Cage_Main_Hoop', 0, 1.12, 0.35);
  hoopMain.rotation.z = Math.PI / 2;
  group.add(hoopFront, hoopMain);
  return sceneFromGroup(group, 'Roll_Cage_Scene');
}

function buildRearQuartersScene(): THREE.Scene {
  const group = new THREE.Group();
  group.name = 'Rear_Quarter_Panels_Assembly';
  for (const sx of [-1, 1]) {
    const panelGeo = new THREE.BoxGeometry(0.35, 0.48, 1.55);
    group.add(namedMesh(panelGeo, matPaintMain, `Rear_Quarter_Panel_${sx < 0 ? 'LH' : 'RH'}`, sx * 0.85, 0.58, 1.15));
  }
  return sceneFromGroup(group, 'Rear_Quarters_Scene');
}

function buildFrontBumperScene(): THREE.Scene {
  const group = new THREE.Group();
  group.name = 'Front_Bumper_Fascia_Assembly';
  const bumperGeo = new THREE.BoxGeometry(1.86, 0.42, 0.38);
  group.add(namedMesh(bumperGeo, matPaintMain, 'Front_Bumper_Main_Fascia', 0, 0.38, -2.10));
  const ductGeo = new THREE.BoxGeometry(1.20, 0.22, 0.12);
  group.add(namedMesh(ductGeo, matCarbonTwill, 'Front_Bumper_Central_Air_Intake', 0, 0.32, -2.25));
  return sceneFromGroup(group, 'Front_Bumper_Scene');
}

function buildCanardsScene(): THREE.Scene {
  const group = new THREE.Group();
  group.name = 'Front_Canards_Vortex_Assembly';
  for (const sx of [-1, 1]) {
    const c1 = namedMesh(new THREE.BoxGeometry(0.24, 0.015, 0.16), matCarbonTwill, `Front_Canard_Upper_${sx < 0 ? 'LH' : 'RH'}`, sx * 0.92, 0.42, -2.05);
    c1.rotation.z = sx * 0.20;
    c1.rotation.y = sx * -0.25;
    const c2 = namedMesh(new THREE.BoxGeometry(0.26, 0.015, 0.18), matCarbonTwill, `Front_Canard_Lower_${sx < 0 ? 'LH' : 'RH'}`, sx * 0.94, 0.28, -2.08);
    c2.rotation.z = sx * 0.20;
    c2.rotation.y = sx * -0.25;
    group.add(c1, c2);
  }
  return sceneFromGroup(group, 'Canards_Scene');
}

function buildVentsScene(): THREE.Scene {
  const group = new THREE.Group();
  group.name = 'Cooling_Vents_Assembly';
  for (const sx of [-1, 1]) {
    const ventGeo = new THREE.BoxGeometry(0.22, 0.02, 0.45);
    group.add(namedMesh(ventGeo, matCarbonTwill, `Hood_Extractor_Vent_${sx < 0 ? 'LH' : 'RH'}`, sx * 0.45, 0.72, -1.25));
  }
  return sceneFromGroup(group, 'Vents_Scene');
}

function buildGrilleScene(): THREE.Scene {
  const group = new THREE.Group();
  group.name = 'Front_Grille_Mesh_Assembly';
  const grilleGeo = new THREE.BoxGeometry(1.24, 0.32, 0.04);
  group.add(namedMesh(grilleGeo, matCarbonTwill, 'Front_Grille_Honeycomb_Mesh', 0, 0.42, -2.18));
  return sceneFromGroup(group, 'Grille_Scene');
}

function buildDoorHandlesScene(): THREE.Scene {
  const group = new THREE.Group();
  group.name = 'Flush_Door_Handles_Assembly';
  for (const sx of [-1, 1]) {
    const handleGeo = new THREE.BoxGeometry(0.018, 0.045, 0.18);
    group.add(namedMesh(handleGeo, matChrome, `Flush_Door_Handle_${sx < 0 ? 'LH' : 'RH'}`, sx * 0.88, 0.68, 0.15));
  }
  return sceneFromGroup(group, 'Door_Handles_Scene');
}

function buildWipersScene(): THREE.Scene {
  const group = new THREE.Group();
  group.name = 'Windshield_Wipers_Assembly';
  for (const sx of [-0.35, 0.25]) {
    const armGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.58, 8);
    armGeo.rotateZ(Math.PI / 3);
    group.add(namedMesh(armGeo, matCarbonTwill, `Windshield_Wiper_Arm_X${sx}`, sx, 0.78, -0.82));
  }
  return sceneFromGroup(group, 'Wipers_Scene');
}

function buildBadgesScene(): THREE.Scene {
  const group = new THREE.Group();
  group.name = 'Vehicle_Emblem_Badges_Assembly';
  const badgeFront = namedMesh(new THREE.CylinderGeometry(0.045, 0.045, 0.012, 24), matChrome, 'Front_Emblem_Badge', 0, 0.52, -2.18);
  badgeFront.rotation.x = Math.PI / 2;
  const badgeRear = namedMesh(new THREE.CylinderGeometry(0.042, 0.042, 0.012, 24), matChrome, 'Rear_Emblem_Badge', 0, 0.72, 2.18);
  badgeRear.rotation.x = Math.PI / 2;
  group.add(badgeFront, badgeRear);
  return sceneFromGroup(group, 'Badges_Scene');
}

function buildRearCarAssemblyScene(): THREE.Scene {
  const group = new THREE.Group();
  group.name = 'Combined_Rear_Car_Assembly';
  group.add(generateRearBumper3DGeometry());
  group.add(generateRearDiffuser3DGeometry());
  group.add(generateRearWing3DGeometry());
  group.add(generateTaillights3DGeometry());
  group.add(generateExhaustTips3DGeometry());
  return sceneFromGroup(group, 'Rear_Car_Assembly_Scene');
}

/** 6. FULL MASTER MODULAR CAR ASSEMBLY (All 40+ parts in single hierarchy) */
export function buildFullModularCarAssemblyScene(): THREE.Scene {
  const scene = new THREE.Scene();
  scene.name = 'Full_Modular_Car_Master_Assembly_Scene';

  const root = new THREE.Group();
  root.name = 'Full_Modular_Car_Master_Root';
  scene.add(root);

  // Mount Socket Anchors
  root.add(mountNode('socket_chassis', 0, 0, 0));
  root.add(mountNode('socket_front_subframe', 0, 0.15, -1.35));
  root.add(mountNode('socket_rear_subframe', 0, 0.15, 1.35));
  root.add(mountNode('socket_hood', 0, 0.72, -1.25));
  root.add(mountNode('socket_roof', 0, 1.15, 0));
  root.add(mountNode('socket_rear_wing', 0, 1.18, 2.18));

  // Add individual modular components
  root.add(generateSubframe3DGeometry('front'));
  root.add(generateHoodPanel3DGeometry());
  root.add(generateFenders3DGeometry());
  root.add(generateDoors3DGeometry());
  root.add(generateRoofPanel3DGeometry());
  root.add(generateTrunkLid3DGeometry());
  root.add(generateFrontSplitter3DGeometry());
  root.add(generateRearDiffuser3DGeometry());
  root.add(generateRearWing3DGeometry());
  root.add(generateSideSkirts3DGeometry());
  root.add(generateHeadlights3DGeometry());
  root.add(generateTaillights3DGeometry());
  root.add(generateFogLights3DGeometry());
  root.add(generateWindshield3DGeometry());
  root.add(generateSideGlass3DGeometry());
  root.add(generateRearWindow3DGeometry());
  // 4 Corner Wheel Assemblies (Phases 08-10)
  const fullAssemblyWheelCorners = [
    { name: 'FL', x: -0.84, y: 0.34, z: -1.35, isLeft: true },
    { name: 'FR', x: 0.84, y: 0.34, z: -1.35, isLeft: false },
    { name: 'RL', x: -0.86, y: 0.34, z: 1.35, isLeft: true },
    { name: 'RR', x: 0.86, y: 0.34, z: 1.35, isLeft: false },
  ];
  for (const c of fullAssemblyWheelCorners) {
    const cg = new THREE.Group();
    cg.name = `Wheel_Corner_${c.name}`;
    cg.position.set(c.x, c.y, c.z);

    const rim = generateWheel3DGeometry({ finish: 'satin_bronze' });
    rim.rotation.y = c.isLeft ? -Math.PI / 2 : Math.PI / 2;
    cg.add(rim);

    const tire = generateTire3DGeometry();
    tire.rotation.y = c.isLeft ? -Math.PI / 2 : Math.PI / 2;
    cg.add(tire);

    const brakes = generateBrakes3DGeometry({ caliperColorHex: '#dc2626' });
    brakes.rotation.y = c.isLeft ? -Math.PI / 2 : Math.PI / 2;
    brakes.position.x = c.isLeft ? 0.03 : -0.03;
    cg.add(brakes);

    root.add(cg);
  }
  root.add(generateFrontSuspension3DGeometry());
  root.add(generateRearSuspension3DGeometry());
  root.add(generateRearBumper3DGeometry());
  root.add(generateExhaustTips3DGeometry());

  // High-Density Mechanical, Cockpit & Racing Hardware Meshes
  root.add(generatePowertrainBayMesh());
  root.add(generateDetailedCockpitMesh('hypercar'));
  root.add(generateExteriorRacingHardwareMesh());
  root.add(generateInconelExhaustHeadersMesh());
  root.add(generateUnderbodyAerodynamicsVenturiMesh());
  root.add(generateChassisDoorSillAndExtinguisherMesh());
  root.add(generateWheelBalancersAndHubDetailMesh());
  root.add(generateSpaceframeSubframeAndCrashStructureMesh());
  root.add(generateDrivetrainDifferentialAndCoolersMesh());
  root.add(generateActiveAeroAndFenderLouversMesh());
  root.add(generateCockpitMotorsportElectronicsMesh());
  root.add(generateFuelCellAndRefuelingSystemMesh());
  root.add(generatePneumaticAirJacksSystemMesh());
  root.add(generateSteeringRackAndShaftAssemblyMesh());
  root.add(generateAuxiliaryCoolersAndDuctingMesh());
  root.add(generateTelemetrySensorsAndAeroCurlsMesh());
  root.add(generateDrySumpLubricationAndCatchCanMesh());
  root.add(generateTwinIntercoolersAndBlowOffValvesMesh());
  root.add(generatePedalBoxBulkheadMasterCylindersMesh());
  root.add(generateDualTierDivePlanesAndFrontVenturiMesh());
  root.add(generateRoofRamAirSnorkelMesh());
  root.add(generateInboardPushrodAndHeaveDamperMesh());
  root.add(generateRotorFloatingBobbinsAndTireValvesMesh());
  root.add(generateCockpitDashDisplayAndShiftLightsMesh());
  root.add(generateRearDiffuserStrakesAndRainLightMesh());
  root.add(generateExhaustThermalShieldsAndRearAeroMesh());
  root.add(generateHybridKersAndInverterSystemMesh());
  root.add(generateRacingClutchFlywheelAndStarterMesh());
  root.add(generateSwanNeckWingPylonsAndPitchPlatesMesh());
  root.add(generateBumperAirCurtainsAndCaliperBleedersMesh());
  root.add(generateRollCagePaddingAndConsoleDialsMesh());
  root.add(generateSplitterTurnbucklesAndKeelMesh());
  root.add(generateTurboThermalBlanketsAndWaterLinesMesh());
  root.add(generateSequentialShifterLinkageAndHeelPlateMesh());
  root.add(generateCaliperBridgesAndPadClipsMesh());
  root.add(generateWingEndplateAeroStrakesAndTireVentsMesh());
  root.add(generateDorsalSharkFinAndPitotMesh());
  root.add(generatePneumaticShiftActuatorAndGasBottleMesh());
  root.add(generateSeatHaloRestraintsAndBracketsMesh());
  root.add(generateHubDrivePinsAndLocknutMesh());
  root.add(generateExhaustResonatorsAndO2SensorsMesh());
  root.add(generateAerocatchLatchesAndTowHookMesh());
  root.add(generateHelmetBlowerAndVentilationMesh());
  root.add(generateClutchInspectionAndSlaveLineMesh());
  root.add(generateRideHeightLasersAndFloorStrakesMesh());
  root.add(generateExhaustFlameDispersersAndHangersMesh());
  root.add(generateWingletGurneyAndFastenersMesh());
  root.add(generateCockpitDigitalCamerasAndMonitorsMesh());
  root.add(generateEmergencyCutoffAndFabricTowStrapsMesh());
  root.add(generateBilletOilCatchTankAndBreathersMesh());
  root.add(generateFrontSplitterRampsAndSkidPlatesMesh());
  root.add(generateDrsActuatorAndFlapBearingsMesh());
  root.add(generateDriverDrinkBottleAndFootboardMesh());
  root.add(generateHoodNacaDuctsAndRadiatorScreensMesh());
  root.add(generateRotorWearSensorsAndHubInfraredMesh());
  root.add(generateExhaustSlipSpringsAndLambdaPlugsMesh());
  root.add(generateTransaxleDualCoolersAndScoopsMesh());
  root.add(generateBrakeRotorInternalVanesAndHatsMesh());
  root.add(generateCockpitCenterNetAndHydrationMesh());
  root.add(generateActiveSplitterFlapMotorsMesh());
  root.add(generateChassisGroundStrapsAndReluctorRingsMesh());

  return scene;
}

/**
 * Exports all car body GLB models to public/models/exterior/ (and chassis to public/models/chassis/)
 */
export async function generateCarBodyGlbs(
  outputDir: string = 'public/models/exterior'
): Promise<{ filename: string; bytes: number }[]> {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const chassisDir = path.resolve(process.cwd(), 'public/models/chassis');
  if (!fs.existsSync(chassisDir)) {
    fs.mkdirSync(chassisDir, { recursive: true });
  }

  const exporter = new GLTFExporter();
  const results: { filename: string; bytes: number }[] = [];

  const jobs: Array<[string, THREE.Scene, string?]> = [
    // Master Vehicle Assembly Models
    ['hypercar_apex_gt3.glb', buildApexGT3HypercarScene()],
    ['sports_coupe_gt.glb', buildSportsGTCoupeScene()],
    ['doors_butterfly_pair.glb', buildButterflyDoorsScene()],
    ['aerodynamic_widebody_kit.glb', buildAerodynamicWidebodyKitScene()],
    ['full_modular_car_assembly.glb', buildFullModularCarAssemblyScene()],

    // All 40+ Individual Component GLBs matching EXTERIOR_3D_MANIFEST
    ['front_subframe.glb', sceneFromGroup(generateSubframe3DGeometry('front'), 'Front_Subframe_Scene')],
    ['rear_subframe.glb', sceneFromGroup(generateSubframe3DGeometry('rear'), 'Rear_Subframe_Scene')],
    ['floor_pan.glb', buildFloorPanScene()],
    ['firewall_bulkhead.glb', buildFirewallBulkheadScene()],
    ['a_pillar.glb', buildAPillarScene()],
    ['b_pillar.glb', buildBPillarScene()],
    ['c_pillar.glb', buildCPillarScene()],
    ['rocker_panels.glb', buildRockerPanelsScene()],
    ['crash_boxes.glb', buildCrashBoxesScene()],
    ['roll_cage.glb', buildRollCageScene()],
    ['suspension_front.glb', sceneFromGroup(generateFrontSuspension3DGeometry(), 'Suspension_Front_Scene')],
    ['suspension_rear.glb', sceneFromGroup(generateRearSuspension3DGeometry(), 'Suspension_Rear_Scene')],
    ['brakes.glb', sceneFromGroup(generateBrakes3DGeometry(), 'Brakes_Scene')],
    ['wheels.glb', sceneFromGroup(generateWheel3DGeometry(), 'Wheels_Scene')],
    ['hood_panel.glb', sceneFromGroup(generateHoodPanel3DGeometry(), 'Hood_Panel_Scene')],
    ['hood.glb', sceneFromGroup(generateHoodPanel3DGeometry(), 'Hood_Scene')],
    ['front_fenders.glb', sceneFromGroup(generateFenders3DGeometry(), 'Front_Fenders_Scene')],
    ['doors.glb', sceneFromGroup(generateDoors3DGeometry(), 'Doors_Scene')],
    ['rear_quarters.glb', buildRearQuartersScene()],
    ['trunk_decklid.glb', sceneFromGroup(generateTrunkLid3DGeometry(), 'Trunk_Decklid_Scene')],
    ['roof_panel.glb', sceneFromGroup(generateRoofPanel3DGeometry(), 'Roof_Panel_Scene')],
    ['front_bumper.glb', buildFrontBumperScene()],
    ['rear_bumper.glb', sceneFromGroup(generateRearBumper3DGeometry(), 'Rear_Bumper_Scene')],
    ['front_splitter.glb', sceneFromGroup(generateFrontSplitter3DGeometry(), 'Front_Splitter_Scene')],
    ['rear_diffuser.glb', sceneFromGroup(generateRearDiffuser3DGeometry(), 'Rear_Diffuser_Scene')],
    ['side_skirts.glb', sceneFromGroup(generateSideSkirts3DGeometry(), 'Side_Skirts_Scene')],
    ['rear_wing.glb', sceneFromGroup(generateRearWing3DGeometry(), 'Rear_Wing_Scene')],
    ['canards.glb', buildCanardsScene()],
    ['vents.glb', buildVentsScene()],
    ['windshield.glb', sceneFromGroup(generateWindshield3DGeometry(), 'Windshield_Scene')],
    ['side_glass.glb', sceneFromGroup(generateSideGlass3DGeometry(), 'Side_Glass_Scene')],
    ['rear_window.glb', sceneFromGroup(generateRearWindow3DGeometry(), 'Rear_Window_Scene')],
    ['headlights.glb', sceneFromGroup(generateHeadlights3DGeometry(), 'Headlights_Scene')],
    ['taillights.glb', sceneFromGroup(generateTaillights3DGeometry(), 'Taillights_Scene')],
    ['fog_lights.glb', sceneFromGroup(generateFogLights3DGeometry(), 'Fog_Lights_Scene')],
    ['mirrors.glb', sceneFromGroup(generateMirrors3DGeometry(), 'Mirrors_Scene')],
    ['grille.glb', buildGrilleScene()],
    ['exhaust_tips.glb', sceneFromGroup(generateExhaustTips3DGeometry(), 'Exhaust_Tips_Scene')],
    ['door_handles.glb', buildDoorHandlesScene()],
    ['wipers.glb', buildWipersScene()],
    ['badges.glb', buildBadgesScene()],
    ['rear_car_assembly.glb', buildRearCarAssemblyScene()],
    ['powertrain_bay.glb', sceneFromGroup(generatePowertrainBayMesh(), 'Powertrain_Bay_Scene')],
    ['cockpit_interior.glb', sceneFromGroup(generateDetailedCockpitMesh('hypercar'), 'Cockpit_Interior_Scene')],
    ['racing_hardware.glb', sceneFromGroup(generateExteriorRacingHardwareMesh(), 'Racing_Hardware_Scene')],
    ['inconel_exhaust_headers.glb', sceneFromGroup(generateInconelExhaustHeadersMesh(), 'Inconel_Exhaust_Headers_Scene')],
    ['underbody_venturi_tunnels.glb', sceneFromGroup(generateUnderbodyAerodynamicsVenturiMesh(), 'Underbody_Venturi_Scene')],
    ['chassis_door_sills.glb', sceneFromGroup(generateChassisDoorSillAndExtinguisherMesh(), 'Chassis_Door_Sills_Scene')],
    ['wheel_hub_details.glb', sceneFromGroup(generateWheelBalancersAndHubDetailMesh(), 'Wheel_Hub_Details_Scene')],
    ['spaceframe_subframes.glb', sceneFromGroup(generateSpaceframeSubframeAndCrashStructureMesh(), 'Spaceframe_Subframes_Scene')],
    ['drivetrain_differential.glb', sceneFromGroup(generateDrivetrainDifferentialAndCoolersMesh(), 'Drivetrain_Differential_Scene')],
    ['active_aero_louvers.glb', sceneFromGroup(generateActiveAeroAndFenderLouversMesh(), 'Active_Aero_Louvers_Scene')],
    ['cockpit_electronics.glb', sceneFromGroup(generateCockpitMotorsportElectronicsMesh(), 'Cockpit_Electronics_Scene')],
    ['fuel_cell_system.glb', sceneFromGroup(generateFuelCellAndRefuelingSystemMesh(), 'Fuel_Cell_System_Scene')],
    ['pneumatic_air_jacks.glb', sceneFromGroup(generatePneumaticAirJacksSystemMesh(), 'Pneumatic_Air_Jacks_Scene')],
    ['steering_system.glb', sceneFromGroup(generateSteeringRackAndShaftAssemblyMesh(), 'Steering_System_Scene')],
    ['auxiliary_coolers.glb', sceneFromGroup(generateAuxiliaryCoolersAndDuctingMesh(), 'Auxiliary_Coolers_Scene')],
    ['telemetry_sensors.glb', sceneFromGroup(generateTelemetrySensorsAndAeroCurlsMesh(), 'Telemetry_Sensors_Scene')],
    ['dry_sump_system.glb', sceneFromGroup(generateDrySumpLubricationAndCatchCanMesh(), 'Dry_Sump_System_Scene')],
    ['intercoolers_bov.glb', sceneFromGroup(generateTwinIntercoolersAndBlowOffValvesMesh(), 'Intercoolers_Bov_Scene')],
    ['pedal_hydraulics.glb', sceneFromGroup(generatePedalBoxBulkheadMasterCylindersMesh(), 'Pedal_Hydraulics_Scene')],
    ['dive_planes_venturi.glb', sceneFromGroup(generateDualTierDivePlanesAndFrontVenturiMesh(), 'Dive_Planes_Venturi_Scene')],
    ['roof_snorkel.glb', sceneFromGroup(generateRoofRamAirSnorkelMesh(), 'Roof_Snorkel_Scene')],
    ['inboard_pushrod_heave.glb', sceneFromGroup(generateInboardPushrodAndHeaveDamperMesh(), 'Inboard_Pushrod_Heave_Scene')],
    ['rotor_bobbins_valves.glb', sceneFromGroup(generateRotorFloatingBobbinsAndTireValvesMesh(), 'Rotor_Bobbins_Valves_Scene')],
    ['cockpit_dash_display.glb', sceneFromGroup(generateCockpitDashDisplayAndShiftLightsMesh(), 'Cockpit_Dash_Display_Scene')],
    ['diffuser_strakes_light.glb', sceneFromGroup(generateRearDiffuserStrakesAndRainLightMesh(), 'Diffuser_Strakes_Light_Scene')],
    ['exhaust_thermal_aero.glb', sceneFromGroup(generateExhaustThermalShieldsAndRearAeroMesh(), 'Exhaust_Thermal_Aero_Scene')],
    ['hybrid_kers_inverter.glb', sceneFromGroup(generateHybridKersAndInverterSystemMesh(), 'Hybrid_Kers_Inverter_Scene')],
    ['racing_clutch_flywheel.glb', sceneFromGroup(generateRacingClutchFlywheelAndStarterMesh(), 'Racing_Clutch_Flywheel_Scene')],
    ['swan_neck_pylons.glb', sceneFromGroup(generateSwanNeckWingPylonsAndPitchPlatesMesh(), 'Swan_Neck_Pylons_Scene')],
    ['bumper_air_curtains.glb', sceneFromGroup(generateBumperAirCurtainsAndCaliperBleedersMesh(), 'Bumper_Air_Curtains_Scene')],
    ['rollcage_padding_dials.glb', sceneFromGroup(generateRollCagePaddingAndConsoleDialsMesh(), 'Rollcage_Padding_Dials_Scene')],
    ['splitter_struts_keel.glb', sceneFromGroup(generateSplitterTurnbucklesAndKeelMesh(), 'Splitter_Struts_Keel_Scene')],
    ['turbo_blankets_lines.glb', sceneFromGroup(generateTurboThermalBlanketsAndWaterLinesMesh(), 'Turbo_Blankets_Lines_Scene')],
    ['sequential_shifter_gate.glb', sceneFromGroup(generateSequentialShifterLinkageAndHeelPlateMesh(), 'Sequential_Shifter_Gate_Scene')],
    ['caliper_bridges_clips.glb', sceneFromGroup(generateCaliperBridgesAndPadClipsMesh(), 'Caliper_Bridges_Clips_Scene')],
    ['wing_endplate_extractors.glb', sceneFromGroup(generateWingEndplateAeroStrakesAndTireVentsMesh(), 'Wing_Endplate_Extractors_Scene')],
    ['dorsal_shark_fin.glb', sceneFromGroup(generateDorsalSharkFinAndPitotMesh(), 'Dorsal_Shark_Fin_Scene')],
    ['pneumatic_shift_bottle.glb', sceneFromGroup(generatePneumaticShiftActuatorAndGasBottleMesh(), 'Pneumatic_Shift_Bottle_Scene')],
    ['seat_halo_brackets.glb', sceneFromGroup(generateSeatHaloRestraintsAndBracketsMesh(), 'Seat_Halo_Brackets_Scene')],
    ['hub_drive_pins.glb', sceneFromGroup(generateHubDrivePinsAndLocknutMesh(), 'Hub_Drive_Pins_Scene')],
    ['exhaust_resonators_o2.glb', sceneFromGroup(generateExhaustResonatorsAndO2SensorsMesh(), 'Exhaust_Resonators_O2_Scene')],
    ['aerocatch_hood_latches.glb', sceneFromGroup(generateAerocatchLatchesAndTowHookMesh(), 'Aerocatch_Latches_Scene')],
    ['helmet_blower_ducting.glb', sceneFromGroup(generateHelmetBlowerAndVentilationMesh(), 'Helmet_Blower_Scene')],
    ['clutch_inspection_slave.glb', sceneFromGroup(generateClutchInspectionAndSlaveLineMesh(), 'Clutch_Inspection_Scene')],
    ['ground_effect_lasers.glb', sceneFromGroup(generateRideHeightLasersAndFloorStrakesMesh(), 'Ground_Effect_Lasers_Scene')],
    ['exhaust_flame_dispersers.glb', sceneFromGroup(generateExhaustFlameDispersersAndHangersMesh(), 'Exhaust_Flame_Dispersers_Scene')],
    ['winglet_gurney_fasteners.glb', sceneFromGroup(generateWingletGurneyAndFastenersMesh(), 'Winglet_Gurney_Scene')],
    ['cockpit_camera_monitors.glb', sceneFromGroup(generateCockpitDigitalCamerasAndMonitorsMesh(), 'Cockpit_Monitors_Scene')],
    ['emergency_cutoff_straps.glb', sceneFromGroup(generateEmergencyCutoffAndFabricTowStrapsMesh(), 'Emergency_Cutoff_Scene')],
    ['oil_catch_tanks.glb', sceneFromGroup(generateBilletOilCatchTankAndBreathersMesh(), 'Oil_Catch_Tanks_Scene')],
    ['splitter_ramps_skids.glb', sceneFromGroup(generateFrontSplitterRampsAndSkidPlatesMesh(), 'Splitter_Ramps_Skids_Scene')],
    ['drs_actuator_bearings.glb', sceneFromGroup(generateDrsActuatorAndFlapBearingsMesh(), 'Drs_Actuator_Scene')],
    ['driver_drink_footboard.glb', sceneFromGroup(generateDriverDrinkBottleAndFootboardMesh(), 'Driver_Drink_Scene')],
    ['hood_naca_radiator_screens.glb', sceneFromGroup(generateHoodNacaDuctsAndRadiatorScreensMesh(), 'Hood_Naca_Screens_Scene')],
    ['rotor_wear_infrared.glb', sceneFromGroup(generateRotorWearSensorsAndHubInfraredMesh(), 'Rotor_Wear_Infrared_Scene')],
    ['exhaust_slip_springs.glb', sceneFromGroup(generateExhaustSlipSpringsAndLambdaPlugsMesh(), 'Exhaust_Slip_Springs_Scene')],
    ['transaxle_dual_coolers.glb', sceneFromGroup(generateTransaxleDualCoolersAndScoopsMesh(), 'Transaxle_Coolers_Scene')],
    ['rotor_internal_vanes.glb', sceneFromGroup(generateBrakeRotorInternalVanesAndHatsMesh(), 'Rotor_Internal_Vanes_Scene')],
    ['cockpit_center_net.glb', sceneFromGroup(generateCockpitCenterNetAndHydrationMesh(), 'Cockpit_Center_Net_Scene')],
    ['active_splitter_motors.glb', sceneFromGroup(generateActiveSplitterFlapMotorsMesh(), 'Active_Splitter_Motors_Scene')],
    ['chassis_ground_straps.glb', sceneFromGroup(generateChassisGroundStrapsAndReluctorRingsMesh(), 'Chassis_Ground_Straps_Scene')],
  ];

  for (const [filename, scene, customDir] of jobs) {
    let meshCount = 0;
    scene.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) meshCount++;
    });
    const targetDir = customDir || outputDir;

    const raw = await new Promise<ArrayBuffer>((resolve, reject) => {
      exporter.parse(
        scene,
        (gltf) => resolve(gltf as ArrayBuffer),
        (err) => reject(err),
        { binary: true }
      );
    });

    const enhanced = await enhanceGlbBuffer(Buffer.from(raw));
    const filePath = path.join(targetDir, filename);
    for (let attempt = 0; attempt < 6; attempt++) {
      try {
        fs.writeFileSync(filePath, enhanced);
        break;
      } catch (err) {
        if (attempt < 5) {
          await new Promise((r) => setTimeout(r, 350 + attempt * 150));
        } else {
          try {
            const tmpPath = filePath + '.tmp_' + Date.now();
            fs.writeFileSync(tmpPath, enhanced);
            fs.renameSync(tmpPath, filePath);
            break;
          } catch {
            throw err;
          }
        }
      }
    }
    results.push({ filename, bytes: enhanced.byteLength });
    console.log(`  ✅ ${filePath} (${(enhanced.byteLength / 1024).toFixed(1)} KB)`);
  }

  return results;
}
