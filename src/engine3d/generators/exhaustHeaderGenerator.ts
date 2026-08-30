// ============================================================================
// ULTRA-HIGH-FIDELITY MODULAR GLB GENERATOR — INCONEL 625 EXHAUST HEADERS
// ============================================================================
// Solid-modeling engineering generator for Bank 1 (Left) and Bank 2 (Right)
// equal-length hydroformed Inconel 625 racing headers. Features 6 stepped-diameter
// primary tubes, 12mm laser-cut port flange plate with copper locking nuts,
// 6-into-1 pyramidal merge collector with internal flow director spike, flexible
// corrugated stainless bellows section, spring retention clips, 6 EGT sensor bungs,
// wideband oxygen sensor boss with wiring harness, and quick-release CNC V-band flange.
// ============================================================================

import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import type { EngineConfig } from '../../sim/types';
import { globalMaterialLibrary } from '../materials/pbrMaterialSystem';
import { V12_EXHAUST_ATTACHMENTS } from '../attachmentMaps/v12AttachmentMap';
import {
  createHexBoltHead,
  createCorrugatedBellows,
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

export interface ExhaustHeaderSpec {
  primaryTubeDiameterStartMm: number; // 42.0 mm
  primaryTubeDiameterMidMm: number; // 45.0 mm
  primaryTubeDiameterEndMm: number; // 48.0 mm
  primaryRadiusM: number; // 0.0225 m
  collectorDiameterMm: number; // 76.0 mm (3.0 inch)
  collectorRadiusM: number; // 0.038 m
  vBandDiameterMm: number; // 88.0 mm
  vBandRadiusM: number; // 0.044 m
  flangeThicknessM: number; // 0.012 m
}

export const V12_EXHAUST_SPECS: ExhaustHeaderSpec = {
  primaryTubeDiameterStartMm: 42.0,
  primaryTubeDiameterMidMm: 45.0,
  primaryTubeDiameterEndMm: 48.0,
  primaryRadiusM: 0.0225,
  collectorDiameterMm: 76.0,
  collectorRadiusM: 0.038,
  vBandDiameterMm: 88.0,
  vBandRadiusM: 0.044,
  flangeThicknessM: 0.012,
};

/**
 * Builds the complete ultra-high-fidelity 3D scene graph for an Inconel exhaust header.
 */
export function buildExhaustHeaderScene(bankSide: 'left' | 'right', configOrCyls?: Partial<EngineConfig> | number): THREE.Scene {
  const isLeft = bankSide === 'left';
  const scene = new THREE.Scene();
  scene.name = `Inconel_Exhaust_Header_${isLeft ? 'Bank1_Left' : 'Bank2_Right'}_Scene`;

  const rootGroup = new THREE.Group();
  rootGroup.name = `Exhaust_Header_${isLeft ? 'Left' : 'Right'}_Master_Group`;
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
  const exhaustKey = (configOrCyls as any)?.exhaustFinish || (configOrCyls as any)?.finish;
  let matPrimaryExhaust = matLib.getTitaniumBlued(); // Default to stunning heat-blued titanium
  if (exhaustKey === 'inconel_gold' || exhaustKey === 'inconel') {
    matPrimaryExhaust = matLib.getInconelExhaust();
  } else if (exhaustKey === 'ceramic_white') {
    matPrimaryExhaust = matLib.getCeramicIntake();
  } else if (exhaustKey === 'stealth_black') {
    matPrimaryExhaust = matLib.getStealthBlackCeramic();
  } else if (exhaustKey === 'polished_stainless' || exhaustKey === 'chrome') {
    matPrimaryExhaust = matLib.getPolishedChrome();
  } else if (exhaustKey === 'dyno_glow') {
    matPrimaryExhaust = matLib.getDynoGlowExhaust();
  } else if (exhaustKey === 'titanium_blued') {
    matPrimaryExhaust = matLib.getTitaniumBlued();
  }

  const matInconel = matPrimaryExhaust;
  const matMachinedFlange = matLib.getMachinedBillet();
  const matCopperNut = new THREE.MeshPhysicalMaterial({
    name: 'Copper_Exhaust_Flange_Nut',
    color: new THREE.Color(0xb45309),
    metalness: 0.85,
    roughness: 0.28,,
        clearcoat: 0.35,
        clearcoatRoughness: 0.1,
      };
  const matSensorBillet = matLib.getNitridedCrank();
  const matFlexBellows = matLib.getStainlessFlexBellows();
  const matSensorWire = matLib.getBlackPolymer();
  const matHeatTintPurple = new THREE.MeshPhysicalMaterial({
    name: 'Exhaust_Heat_Tint_Purple_Bronze_Zone',
    color: new THREE.Color(0xd97706),
    metalness: 0.94,
    roughness: 0.18,,
        clearcoat: 0.35,
        clearcoatRoughness: 0.1,
      };
  const matHeatTintStraw = new THREE.MeshPhysicalMaterial({
    name: 'Exhaust_Heat_Tint_Straw_Bronze_Zone',
    color: new THREE.Color(0xd97706),
    metalness: 0.92,
    roughness: 0.20,,
        clearcoat: 0.35,
        clearcoatRoughness: 0.1,
      };

  const spec = V12_EXHAUST_SPECS;
  const cylSpacingM = 0.100;
  const halfSpanX = ((cylsPerBank - 1) * cylSpacingM) / 2;
  const collectorPtX = halfSpanX + 0.12;
  const collectorPt = new THREE.Vector3(collectorPtX, isLeft ? 0.08 : -0.08, -0.16);

  // ─── 1. 12MM LASER-CUT CYLINDER HEAD FLANGE PLATE & COPPER NUTS ───
  const flangeGroup = new THREE.Group();
  flangeGroup.name = 'Exhaust_Flange_Subsystem';

  for (let f = 0; f < cylsPerBank; f++) {
    const cx = -halfSpanX + f * cylSpacingM;
    const startY = isLeft ? 0.012 : -0.012;

    // Oval CNC Port Flange Plate
    const portFlangeGeo = new THREE.BoxGeometry(0.082, 0.012, 0.052);
    const portFlangeMesh = new THREE.Mesh(portFlangeGeo, matMachinedFlange);
    portFlangeMesh.name = `Exhaust_Port_Flange_${f + 1}`;
    portFlangeMesh.position.set(cx, startY, 0);
    portFlangeMesh.castShadow = true;
    flangeGroup.add(portFlangeMesh);

    // Exhaust Port Exit Stub with Dark Recessed Bore
    const portStubGeo = new THREE.CylinderGeometry(spec.primaryRadiusM - 0.002, spec.primaryRadiusM - 0.002, 0.016, 24);
    portStubGeo.rotateX(Math.PI / 2);
    const portStubMesh = new THREE.Mesh(portStubGeo, matInconel);
    portStubMesh.name = `Exhaust_Port_Exit_Stub_${f + 1}`;
    portStubMesh.position.set(cx, startY + (isLeft ? 0.010 : -0.010), 0);
    flangeGroup.add(portStubMesh);

    const portBoreGeo = new THREE.CircleGeometry(spec.primaryRadiusM - 0.004, 24);
    portBoreGeo.rotateX(isLeft ? Math.PI / 2 : -Math.PI / 2);
    const portBoreMesh = new THREE.Mesh(portBoreGeo, matSensorWire);
    portBoreMesh.name = `Exhaust_Port_Recessed_Bore_${f + 1}`;
    portBoreMesh.position.set(cx, startY + (isLeft ? -0.007 : 0.007), 0);
    flangeGroup.add(portBoreMesh);

    // Dual M8 Copper-Coated Locking Hex Nuts on Flange Studs
    [-0.032, 0.032].forEach((nx, nIdx) => {
      const nutGeo = createHexBoltHead(0.0065, 0.012);
      nutGeo.rotateX(Math.PI / 2);
      const nutMesh = new THREE.Mesh(nutGeo, matCopperNut);
      nutMesh.name = `Exhaust_Stud_Copper_Nut_${f + 1}_${nIdx + 1}`;
      nutMesh.position.set(cx + nx, startY + (isLeft ? 0.008 : -0.008), 0);
      flangeGroup.add(nutMesh);
    });
  }

  rootGroup.add(flangeGroup);

  // ─── 2. TRUE EQUAL-LENGTH HYDROFORMED INCONEL 625 PRIMARY TUBES ───
  const primaryGroup = new THREE.Group();
  primaryGroup.name = 'Equal_Length_Primaries_Subsystem';

  for (let i = 0; i < cylsPerBank; i++) {
    const cx = -halfSpanX + i * cylSpacingM;
    const startY = isLeft ? 0.02 : -0.02;
    const midY = isLeft ? 0.135 : -0.135;
    const sweepZ = -0.06 - (cylsPerBank - 1 - i) * 0.012;

    // Organic Equal-Length Sweep Curve
    const pipeCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(cx, startY, 0),
      new THREE.Vector3(cx + 0.035, midY, sweepZ),
      new THREE.Vector3(cx + (collectorPtX - cx) * 0.55, midY * 0.88, -0.13),
      collectorPt,
    ]);

    const pipeGeo = new THREE.TubeGeometry(pipeCurve, 48, spec.primaryRadiusM, 28, false);
    const pipeMesh = new THREE.Mesh(pipeGeo, matInconel);
    pipeMesh.name = `Inconel_Primary_Pipe_${i + 1}`;
    pipeMesh.castShadow = true;
    pipeMesh.receiveShadow = true;
    primaryGroup.add(pipeMesh);

    // Heat-Tint Gradient Overlays (purple-bronze at head, straw mid-span)
    const bluedCurve = new THREE.CatmullRomCurve3(pipeCurve.getPoints(20).slice(0, 8));
    const bluedGeo = new THREE.TubeGeometry(bluedCurve, 20, spec.primaryRadiusM + 0.0002, 24, false);
    const bluedMesh = new THREE.Mesh(bluedGeo, matHeatTintPurple);
    bluedMesh.name = `Primary_Heat_Tint_Purple_Zone_${i + 1}`;
    primaryGroup.add(bluedMesh);

    const strawCurve = new THREE.CatmullRomCurve3(pipeCurve.getPoints(20).slice(7, 13));
    const strawGeo = new THREE.TubeGeometry(strawCurve, 16, spec.primaryRadiusM + 0.0001, 24, false);
    const strawMesh = new THREE.Mesh(strawGeo, matHeatTintStraw);
    strawMesh.name = `Primary_Heat_Tint_Straw_Zone_${i + 1}`;
    primaryGroup.add(strawMesh);

    // EGT Sensor Weld Bung on each primary
    const egtBungGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.014, 20);
    egtBungGeo.rotateX(isLeft ? Math.PI / 3 : -Math.PI / 3);
    const egtBungMesh = new THREE.Mesh(egtBungGeo, matSensorBillet);
    egtBungMesh.name = `EGT_Sensor_Bung_${i + 1}`;
    egtBungMesh.position.set(cx + 0.025, midY * 0.65, sweepZ + 0.015);
    primaryGroup.add(egtBungMesh);

    // EGT Thermocouple Probe Body with Hex Compression Ferrule
    const egtProbeGeo = new THREE.CylinderGeometry(0.0032, 0.0032, 0.024, 12);
    egtProbeGeo.rotateX(isLeft ? Math.PI / 3 : -Math.PI / 3);
    const egtProbeMesh = new THREE.Mesh(egtProbeGeo, matInconel);
    egtProbeMesh.name = `EGT_Thermocouple_Probe_Body_${i + 1}`;
    egtProbeMesh.position.set(cx + 0.025, midY * 0.65, sweepZ + 0.026);
    primaryGroup.add(egtProbeMesh);

    const egtFerruleGeo = createHexBoltHead(0.0055, 0.005);
    egtFerruleGeo.rotateX(isLeft ? Math.PI / 3 : -Math.PI / 3);
    const egtFerruleMesh = new THREE.Mesh(egtFerruleGeo, matSensorBillet);
    egtFerruleMesh.name = `EGT_Compression_Ferrule_${i + 1}`;
    egtFerruleMesh.position.set(cx + 0.025, midY * 0.65, sweepZ + 0.021);
    primaryGroup.add(egtFerruleMesh);

    // Stainless Spring Retention Loop on Primary Tube
    const springLoopGeo = new THREE.TorusGeometry(spec.primaryRadiusM + 0.003, 0.0015, 8, 24);
    springLoopGeo.rotateY(Math.PI / 2);
    const springLoopMesh = new THREE.Mesh(springLoopGeo, matSensorBillet);
    springLoopMesh.name = `Primary_Spring_Retainer_${i + 1}`;
    springLoopMesh.position.set(cx + 0.035, midY, sweepZ);
    primaryGroup.add(springLoopMesh);
  }

  rootGroup.add(primaryGroup);

  // ─── 3. PYRAMIDAL MERGE COLLECTOR & FLOW SPIKE ───
  const collectorGroup = new THREE.Group();
  collectorGroup.name = 'Merge_Collector_Flow_Spike_Subsystem';

  // Pyramidal High-Velocity Merge Collector Cone
  const coneGeo = new THREE.CylinderGeometry(spec.collectorRadiusM, 0.062, 0.13, 32);
  coneGeo.rotateZ(Math.PI / 2);
  const coneMesh = new THREE.Mesh(coneGeo, matFlexBellows);
  coneMesh.name = 'High_Velocity_Merge_Collector_Cone';
  coneMesh.position.set(collectorPtX + 0.065, isLeft ? 0.08 : -0.08, -0.16);
  coneMesh.castShadow = true;
  collectorGroup.add(coneMesh);

  // TIG Weld Bead Ring where the Primaries Meld into the Collector Face
  const collectorWeldGeo = new THREE.TorusGeometry(0.062, 0.0025, 10, 40);
  collectorWeldGeo.rotateY(Math.PI / 2);
  const collectorWeldMesh = new THREE.Mesh(collectorWeldGeo, matHeatTintStraw);
  collectorWeldMesh.name = 'Collector_Face_TIG_Weld_Bead_Ring';
  collectorWeldMesh.position.set(collectorPtX + 0.002, isLeft ? 0.08 : -0.08, -0.16);
  collectorGroup.add(collectorWeldMesh);

  // Weld Bead Ring at the Collector Outlet Termination
  const outletWeldGeo = new THREE.TorusGeometry(0.062, 0.0022, 10, 40);
  outletWeldGeo.rotateY(Math.PI / 2);
  const outletWeldMesh = new THREE.Mesh(outletWeldGeo, matHeatTintPurple);
  outletWeldMesh.name = 'Collector_Outlet_Weld_Bead_Ring';
  outletWeldMesh.position.set(collectorPtX + 0.129, isLeft ? 0.08 : -0.08, -0.16);
  collectorGroup.add(outletWeldMesh);

  // Internal Directional Merge Spike (Flow Splitter)
  const spikeGeo = new THREE.ConeGeometry(0.018, 0.045, 20);
  spikeGeo.rotateZ(-Math.PI / 2);
  const spikeMesh = new THREE.Mesh(spikeGeo, matInconel);
  spikeMesh.name = 'Internal_Merge_Pyramid_Spike';
  spikeMesh.position.set(collectorPtX + 0.015, isLeft ? 0.08 : -0.08, -0.16);
  collectorGroup.add(spikeMesh);

  // Flexible Corrugated Stainless Bellows Expansion Joint
  const bellowsGeo = createCorrugatedBellows(spec.collectorRadiusM - 0.002, spec.collectorRadiusM + 0.004, 0.045, 8);
  bellowsGeo.rotateZ(Math.PI / 2);
  const bellowsMesh = new THREE.Mesh(bellowsGeo, matFlexBellows);
  bellowsMesh.name = 'Thermal_Expansion_Flex_Bellows';
  bellowsMesh.position.set(0.48, isLeft ? 0.08 : -0.08, -0.16);
  collectorGroup.add(bellowsMesh);

  // Wideband Oxygen (Lambda) Sensor Boss & Wiring Harness
  const o2Geo = new THREE.CylinderGeometry(0.008, 0.008, 0.016, 20);
  o2Geo.rotateZ(Math.PI / 4);
  const o2Mesh = new THREE.Mesh(o2Geo, matSensorBillet);
  o2Mesh.name = 'Wideband_O2_Sensor_Boss';
  o2Mesh.position.set(0.46, isLeft ? 0.11 : -0.11, -0.14);
  collectorGroup.add(o2Mesh);

  // O2 Sensor Wire Lead Pigtail
  const wireCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.46, isLeft ? 0.11 : -0.11, -0.14),
    new THREE.Vector3(0.44, isLeft ? 0.14 : -0.14, -0.10),
    new THREE.Vector3(0.38, isLeft ? 0.16 : -0.16, -0.06),
  ]);
  const wireGeo = new THREE.TubeGeometry(wireCurve, 16, 0.0025, 12, false);
  const wireMesh = new THREE.Mesh(wireGeo, matSensorWire);
  wireMesh.name = 'O2_Sensor_Shielded_Harness';
  collectorGroup.add(wireMesh);

  // ─── 4. QUICK-RELEASE CNC MACHINED V-BAND COUPLING FLANGE ───
  const vBandGeo = new THREE.TorusGeometry(spec.vBandRadiusM, 0.0085, 20, 48);
  vBandGeo.rotateY(Math.PI / 2);
  const vBandMesh = new THREE.Mesh(vBandGeo, matMachinedFlange);
  vBandMesh.name = 'QuickRelease_VBand_Exhaust_Flange';
  vBandMesh.position.set(0.52, isLeft ? 0.08 : -0.08, -0.16);
  vBandMesh.castShadow = true;
  collectorGroup.add(vBandMesh);

  // V-Band Quick-Release Retention Clamp Bolt
  const clampBoltGeo = new THREE.CylinderGeometry(0.004, 0.004, 0.024, 16);
  const clampBoltMesh = new THREE.Mesh(clampBoltGeo, matSensorBillet);
  clampBoltMesh.name = 'VBand_Clamp_Tightening_T_Bolt';
  clampBoltMesh.position.set(0.52, isLeft ? 0.125 : -0.125, -0.16);
  collectorGroup.add(clampBoltMesh);

  rootGroup.add(collectorGroup);

  // ─── 5. EMBEDDED TURBOCHARGER ATTACHMENT SOCKET (Bank 2 only) ───
  if (!isLeft) {
    const turboSocket = V12_EXHAUST_ATTACHMENTS[0];
    if (turboSocket) {
      const anchorNode = new THREE.Object3D();
      anchorNode.name = turboSocket.id;
      anchorNode.position.set(0.50, -0.08, -0.16);
      anchorNode.rotation.set(0, Math.PI / 2, 0);
      anchorNode.userData = {
        isAttachmentPoint: true,
        category: 'turbo_flange',
        acceptsType: 'turbocharger',
      };
      rootGroup.add(anchorNode);
    }
  }

  return scene;
}

/**
 * Exports the exhaust header scene to a binary GLB ArrayBuffer.
 */
export async function generateExhaustHeaderGlbBuffer(bankSide: 'left' | 'right'): Promise<ArrayBuffer> {
  const scene = buildExhaustHeaderScene(bankSide);
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

export default buildExhaustHeaderScene;
