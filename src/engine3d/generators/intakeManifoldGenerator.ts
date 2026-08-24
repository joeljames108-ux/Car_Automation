// ============================================================================
// ULTRA-HIGH-FIDELITY MODULAR GLB GENERATOR — ITB INTAKE MANIFOLD
// ============================================================================
// Solid-modeling engineering generator for Bank 1 (Left) and Bank 2 (Right)
// 6-cylinder Individual Throttle Body (ITB) induction systems. Features 6 ceramic-
// coated parabolic runners, 6 cobalt-anodized velocity stack bellmouths with stainless
// wire-mesh screen filters, CNC brass butterfly plates with stainless throttle shafts,
// progressive return springs, dual-tier 350-bar GDI fuel rail with Bosch high-pressure
// injectors, MAP sensor boss, IAT sensor bung, and vacuum equalization balance plenum rail.
// ============================================================================

import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import type { EngineConfig } from '../../sim/types';
import { globalMaterialLibrary } from '../materials/pbrMaterialSystem';
import { V12_INTAKE_ATTACHMENTS } from '../attachmentMaps/v12AttachmentMap';
import {
  createHexBoltHead,
  createORingSeal,
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

export interface IntakeManifoldSpec {
  runnerLengthM: number; // 0.160 m
  runnerDiameterMm: number; // 45.0 mm
  runnerRadiusM: number; // 0.0225 m
  stackBellmouthDiameterMm: number; // 68.0 mm
  stackBellmouthRadiusM: number; // 0.034 m
  stackHeightM: number; // 0.065 m
  throttlePlateDiameterMm: number; // 44.0 mm
  fuelRailLengthM: number; // 0.580 m
  fuelRailDiameterM: number; // 0.016 m
}

export const V12_INTAKE_SPECS: IntakeManifoldSpec = {
  runnerLengthM: 0.160,
  runnerDiameterMm: 45.0,
  runnerRadiusM: 0.0225,
  stackBellmouthDiameterMm: 68.0,
  stackBellmouthRadiusM: 0.034,
  stackHeightM: 0.065,
  throttlePlateDiameterMm: 44.0,
  fuelRailLengthM: 0.580,
  fuelRailDiameterM: 0.016,
};

/**
 * Builds the complete ultra-high-fidelity 3D scene graph for an ITB intake manifold.
 */
export function buildIntakeManifoldScene(bankSide: 'left' | 'right', configOrCyls?: Partial<EngineConfig> | number): THREE.Scene {
  const isLeft = bankSide === 'left';
  const scene = new THREE.Scene();
  scene.name = `ITB_Intake_Manifold_${isLeft ? 'Bank1_Left' : 'Bank2_Right'}_Scene`;

  const rootGroup = new THREE.Group();
  rootGroup.name = `Intake_Manifold_${isLeft ? 'Left' : 'Right'}_Master_Group`;
  scene.add(rootGroup);

  let cylsPerBank = 6;
  if (typeof configOrCyls === 'number') {
    cylsPerBank = configOrCyls;
  } else if (configOrCyls?.layout) {
    const l = configOrCyls.layout;
    cylsPerBank =
      l === 'i3' || l === 'v6' ? 3 :
      l === 'i4' || l === 'boxer4' || l === 'v8' ? 4 :
      l === 'v10' ? 5 :
      l === 'w12' ? 3 :
      l === 'w16' ? 4 :
      l === 'w18' ? 5 :
      6;
  }

  const matLib = globalMaterialLibrary;
  const matCeramicRunner = matLib.getCeramicIntake();
  const matCobaltStack = matLib.getCobaltAnodized();
  const matBrassPlate = new THREE.MeshStandardMaterial({
    name: 'Polished_Brass_Butterfly_Disc',
    color: new THREE.Color(0xfacc15),
    metalness: 0.85,
    roughness: 0.22,
  });
  const matGoldFuelRail = matLib.getGoldAnodized();
  const matInjectorBillet = matLib.getMachinedBillet();
  const matBlackPolymer = matLib.getBlackPolymer();
  const matThrottleShaft = matLib.getNitridedCrank();
  const matWireMesh = matLib.getTranslucentMesh();

  const spec = V12_INTAKE_SPECS;
  const cylSpacingM = 0.100;
  const halfSpanX = ((cylsPerBank - 1) * cylSpacingM) / 2;
  const manifoldLengthM = (cylsPerBank - 1) * cylSpacingM + 0.100;

  // ─── 1. TUNED-LENGTH PARABOLIC CERAMIC RUNNERS & VELOCITY STACKS ───
  const runnerGroup = new THREE.Group();
  runnerGroup.name = 'Parabolic_Runners_Velocity_Stacks_Subsystem';

  for (let r = 0; r < cylsPerBank; r++) {
    const cx = -halfSpanX + r * cylSpacingM;
    const runnerCurvatureY = isLeft ? 0.032 : -0.032;
    const stackOffsetY = isLeft ? -0.018 : 0.018;

    // Organic S-Curved Hydroformed Ceramic Runner Tube
    const runnerCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(cx, 0, 0),
      new THREE.Vector3(cx, runnerCurvatureY, 0.055),
      new THREE.Vector3(cx, stackOffsetY, 0.135),
    ]);
    const runnerGeo = new THREE.TubeGeometry(runnerCurve, 36, spec.runnerRadiusM, 24, false);
    const runnerMesh = new THREE.Mesh(runnerGeo, matCeramicRunner);
    runnerMesh.name = `Ceramic_Intake_Runner_${r + 1}`;
    runnerMesh.castShadow = true;
    runnerMesh.receiveShadow = true;
    runnerGroup.add(runnerMesh);

    // CNC Cylinder Head Interface Flange Base
    const baseGeo = new THREE.CylinderGeometry(spec.runnerRadiusM + 0.008, spec.runnerRadiusM + 0.008, 0.012, 28);
    const baseMesh = new THREE.Mesh(baseGeo, matInjectorBillet);
    baseMesh.name = `Runner_Mating_Flange_Base_${r + 1}`;
    baseMesh.position.set(cx, 0, 0.006);
    runnerGroup.add(baseMesh);

    // Cobalt Anodized Parabolic Bellmouth Velocity Stack
    const stackGeo = new THREE.CylinderGeometry(
      spec.stackBellmouthRadiusM,
      spec.runnerRadiusM,
      spec.stackHeightM,
      48,
      1,
      true
    );
    const stackMesh = new THREE.Mesh(stackGeo, matCobaltStack);
    stackMesh.name = `Cobalt_Velocity_Stack_${r + 1}`;
    stackMesh.position.set(cx, stackOffsetY, 0.168);
    stackMesh.castShadow = true;
    runnerGroup.add(stackMesh);

    // Rolled Aerodynamic Outer Lip on Stack Mouth
    const lipGeo = new THREE.TorusGeometry(spec.stackBellmouthRadiusM, 0.0035, 16, 48);
    lipGeo.rotateX(Math.PI / 2);
    const lipMesh = new THREE.Mesh(lipGeo, matCobaltStack);
    lipMesh.name = `Stack_Rolled_Parabolic_Lip_${r + 1}`;
    lipMesh.position.set(cx, stackOffsetY, 0.168 + spec.stackHeightM / 2);
    runnerGroup.add(lipMesh);

    // Stainless Steel Wire Cloth Protective Debris Screen at Stack Mouth
    const screenGeo = new THREE.CircleGeometry(spec.stackBellmouthRadiusM - 0.002, 32);
    screenGeo.rotateX(Math.PI / 2);
    const screenMesh = new THREE.Mesh(screenGeo, matWireMesh);
    screenMesh.name = `Velocity_Stack_Wire_Screen_${r + 1}`;
    screenMesh.position.set(cx, stackOffsetY, 0.168 + spec.stackHeightM / 2 - 0.002);
    runnerGroup.add(screenMesh);
  }

  rootGroup.add(runnerGroup);

  // ─── 2. INDIVIDUAL THROTTLE BODIES, BRASS BUTTERFLIES & LINKAGE ───
  const itbGroup = new THREE.Group();
  itbGroup.name = 'ITB_Throttle_Valves_Linkage_Subsystem';

  // Common Throttle Actuator Shaft Line
  const shaftGeo = new THREE.CylinderGeometry(0.004, 0.004, manifoldLengthM, 20);
  shaftGeo.rotateZ(Math.PI / 2);
  const shaftMesh = new THREE.Mesh(shaftGeo, matThrottleShaft);
  shaftMesh.name = 'Master_Throttle_Synchronization_Shaft';
  shaftMesh.position.set(0, isLeft ? -0.022 : 0.022, 0.155);
  itbGroup.add(shaftMesh);

  for (let t = 0; t < 6; t++) {
    const cx = -0.25 + t * 0.10;
    const posY = isLeft ? -0.018 : 0.018;

    // Precision CNC Brass Butterfly Valve Plate (32° High-Response Idle Angle)
    const plateGeo = new THREE.CylinderGeometry(0.0215, 0.0215, 0.0025, 32);
    plateGeo.rotateX(THREE.MathUtils.degToRad(32));
    const plateMesh = new THREE.Mesh(plateGeo, matBrassPlate);
    plateMesh.name = `Brass_Butterfly_Plate_${t + 1}`;
    plateMesh.position.set(cx, posY, 0.155);
    itbGroup.add(plateMesh);

    // Throttle Shaft Ball Bearing Pivot Housing
    const pivotGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.018, 20);
    pivotGeo.rotateZ(Math.PI / 2);
    const pivotMesh = new THREE.Mesh(pivotGeo, matInjectorBillet);
    pivotMesh.name = `ITB_Shaft_Bearing_Pivot_${t + 1}`;
    pivotMesh.position.set(cx + 0.025, posY, 0.155);
    itbGroup.add(pivotMesh);

    // Progressive Dual Torsion Return Spring
    const springGeo = new THREE.TorusGeometry(0.007, 0.0015, 12, 24);
    springGeo.rotateY(Math.PI / 2);
    const springMesh = new THREE.Mesh(springGeo, matBrassPlate);
    springMesh.name = `ITB_Torsion_Return_Spring_${t + 1}`;
    springMesh.position.set(cx + 0.025, posY, 0.155);
    itbGroup.add(springMesh);
  }

  rootGroup.add(itbGroup);

  // ─── 3. 350-BAR GDI FUEL RAIL & DUAL INJECTOR ARCHITECTURE ───
  const fuelGroup = new THREE.Group();
  fuelGroup.name = 'GDI_HighPressure_Fuel_Rail_Subsystem';

  // Forged Gold-Anodized High-Pressure Fuel Rail Extrusion
  const railGeo = new THREE.CylinderGeometry(spec.fuelRailDiameterM / 2, spec.fuelRailDiameterM / 2, spec.fuelRailLengthM, 32);
  railGeo.rotateZ(Math.PI / 2);
  const railMesh = new THREE.Mesh(railGeo, matGoldFuelRail);
  railMesh.name = 'GDI_350Bar_Forged_Fuel_Rail';
  railMesh.position.set(0, isLeft ? -0.045 : 0.045, 0.095);
  railMesh.castShadow = true;
  fuelGroup.add(railMesh);

  // 6 Primary Port + 6 Secondary Direct Injector Cups
  for (let i = 0; i < 6; i++) {
    const cx = -0.25 + i * 0.10;
    const injY = isLeft ? -0.038 : 0.038;

    // Fuel Injector Cup Body
    const cupGeo = new THREE.CylinderGeometry(0.0085, 0.0085, 0.032, 20);
    cupGeo.rotateX(isLeft ? THREE.MathUtils.degToRad(25) : THREE.MathUtils.degToRad(-25));
    const cupMesh = new THREE.Mesh(cupGeo, matInjectorBillet);
    cupMesh.name = `Bosch_GDI_Injector_Housing_${i + 1}`;
    cupMesh.position.set(cx, injY, 0.075);
    cupMesh.castShadow = true;
    fuelGroup.add(cupMesh);

    // Electrical Solenoid Connector Plug
    const plugGeo = new THREE.BoxGeometry(0.008, 0.012, 0.010);
    const plugMesh = new THREE.Mesh(plugGeo, matBlackPolymer);
    plugMesh.name = `Injector_Electrical_Connector_${i + 1}`;
    plugMesh.position.set(cx, injY - (isLeft ? 0.008 : -0.008), 0.088);
    fuelGroup.add(plugMesh);
  }

  // High-Pressure Fuel Pressure Transducer Sensor (Front of Rail)
  const sensorGeo = new THREE.CylinderGeometry(0.009, 0.009, 0.024, 20);
  sensorGeo.rotateZ(Math.PI / 2);
  const sensorMesh = new THREE.Mesh(sensorGeo, matInjectorBillet);
  sensorMesh.name = 'Fuel_Rail_Pressure_Transducer';
  sensorMesh.position.set(-spec.fuelRailLengthM / 2 - 0.012, isLeft ? -0.045 : 0.045, 0.095);
  fuelGroup.add(sensorMesh);

  // Fuel Feed Stainless Banjo Bolt (Rear of Rail)
  const banjoGeo = new THREE.CylinderGeometry(0.011, 0.011, 0.016, 20);
  const banjoMesh = new THREE.Mesh(banjoGeo, matThrottleShaft);
  banjoMesh.name = 'AN6_Fuel_Feed_Banjo_Fitting';
  banjoMesh.position.set(spec.fuelRailLengthM / 2 + 0.008, isLeft ? -0.045 : 0.045, 0.095);
  fuelGroup.add(banjoMesh);

  rootGroup.add(fuelGroup);

  // ─── 4. VACUUM EQUALIZATION BALANCE PLENUM RAIL, MAP & IAT SENSORS ───
  const sensorPlenumGroup = new THREE.Group();
  sensorPlenumGroup.name = 'Plenum_Sensors_Subsystem';

  // Vacuum Equalization Rail Tube
  const vacGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.54, 20);
  vacGeo.rotateZ(Math.PI / 2);
  const vacMesh = new THREE.Mesh(vacGeo, matThrottleShaft);
  vacMesh.name = 'Vacuum_Equalization_Balance_Rail';
  vacMesh.position.set(0, isLeft ? 0.022 : -0.022, 0.045);
  sensorPlenumGroup.add(vacMesh);

  // MAP (Manifold Absolute Pressure) Sensor on Vacuum Rail
  const mapSensorGeo = new THREE.BoxGeometry(0.024, 0.018, 0.014);
  const mapSensorMesh = new THREE.Mesh(mapSensorGeo, matBlackPolymer);
  mapSensorMesh.name = 'MAP_Absolute_Pressure_Sensor';
  mapSensorMesh.position.set(0.18, isLeft ? 0.026 : -0.026, 0.052);
  sensorPlenumGroup.add(mapSensorMesh);

  // IAT (Intake Air Temperature) Fast-Response Sensor Bung
  const iatSensorGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.016, 16);
  iatSensorGeo.rotateX(Math.PI / 2);
  const iatSensorMesh = new THREE.Mesh(iatSensorGeo, matInjectorBillet);
  iatSensorMesh.name = 'IAT_Air_Temp_Sensor_Bung';
  iatSensorMesh.position.set(-0.18, isLeft ? 0.026 : -0.026, 0.052);
  sensorPlenumGroup.add(iatSensorMesh);

  // PCV (Crankcase Ventilation) Barbed Hose Fitting Port
  const pcvBarbGeo = new THREE.CylinderGeometry(0.005, 0.004, 0.016, 16);
  pcvBarbGeo.rotateZ(Math.PI / 2);
  const pcvBarbMesh = new THREE.Mesh(pcvBarbGeo, matGoldFuelRail);
  pcvBarbMesh.name = 'PCV_Ventilation_Barb_Fitting';
  pcvBarbMesh.position.set(-0.28, isLeft ? 0.022 : -0.022, 0.045);
  sensorPlenumGroup.add(pcvBarbMesh);

  rootGroup.add(sensorPlenumGroup);

  // ─── 5. EMBEDDED MOUNT ATTACHMENT SOCKETS ───
  const mountIdx = isLeft ? 0 : 1;
  const fuelRailSocket = V12_INTAKE_ATTACHMENTS[mountIdx];
  if (fuelRailSocket) {
    const anchorNode = new THREE.Object3D();
    anchorNode.name = fuelRailSocket.id;
    anchorNode.position.set(0, isLeft ? -0.045 : 0.045, 0.095);
    anchorNode.userData = { isAttachmentPoint: true, category: 'fuel_rail_boss' };
    rootGroup.add(anchorNode);
  }

  return scene;
}

/**
 * Exports the intake manifold scene to a binary GLB ArrayBuffer.
 */
export async function generateIntakeManifoldGlbBuffer(bankSide: 'left' | 'right'): Promise<ArrayBuffer> {
  const scene = buildIntakeManifoldScene(bankSide);
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

export default buildIntakeManifoldScene;
