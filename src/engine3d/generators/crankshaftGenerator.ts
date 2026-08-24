// ============================================================================
// ULTRA-HIGH-FIDELITY MODULAR GLB GENERATOR — 60° V12 FORGED NITRIDED CRANKSHAFT
// ============================================================================
// Solid-modeling engineering generator for a 6-throw, 12-counterweight forged
// nitrided 4340 alloy steel crankshaft. Features 7 micro-polished main journals,
// cross-drilled pressurized oil galleries, gun-drilled hollow crankpin lightening bores,
// knife-edged teardrop counterweights with embedded heavy tungsten balancing slugs,
// rear centrifugal oil flinger disc, main seal step grooves, 60-2 timing reluctor wheel,
// dual Woodruff keys with harmonic damper elastomer isolator, and 8-bolt flywheel flange.
// ============================================================================

import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import type { EngineConfig } from '../../sim/types';
import { globalMaterialLibrary } from '../materials/pbrMaterialSystem';
import { V12_CRANKSHAFT_ATTACHMENTS } from '../attachmentMaps/v12AttachmentMap';
import {
  createHexBoltHead,
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

export interface CrankshaftSpec {
  strokeMm: number; // 92.8 mm stroke
  strokeM: number; // 0.0928 m
  throwRadiusM: number; // 0.0464 m
  mainJournalDiameterMm: number; // 68.0 mm
  mainJournalRadiusM: number; // 0.034 m
  mainJournalWidthM: number; // 0.026 m
  crankpinDiameterMm: number; // 48.0 mm
  crankpinRadiusM: number; // 0.024 m
  crankpinWidthM: number; // 0.040 m (dual rods side-by-side)
  webThicknessM: number; // 0.018 m
  totalLengthM: number; // 0.680 m
  snoutDiameterM: number; // 0.032 m
  snoutLengthM: number; // 0.065 m
  flywheelFlangeDiameterM: number; // 0.118 m
  flywheelFlangeThicknessM: number; // 0.018 m
}

export const V12_CRANK_SPECS: CrankshaftSpec = {
  strokeMm: 92.8,
  strokeM: 0.0928,
  throwRadiusM: 0.0464,
  mainJournalDiameterMm: 68.0,
  mainJournalRadiusM: 0.034,
  mainJournalWidthM: 0.026,
  crankpinDiameterMm: 48.0,
  crankpinRadiusM: 0.024,
  crankpinWidthM: 0.040,
  webThicknessM: 0.018,
  totalLengthM: 0.680,
  snoutDiameterM: 0.032,
  snoutLengthM: 0.065,
  flywheelFlangeDiameterM: 0.118,
  flywheelFlangeThicknessM: 0.018,
};

/**
 * Builds the complete ultra-high-fidelity 3D scene graph for the 60° V12 crankshaft.
 */
export function buildCrankshaftScene(configOrThrows?: Partial<EngineConfig> | number): THREE.Scene {
  const scene = new THREE.Scene();
  scene.name = 'Forged_Crankshaft_Scene';

  const rootGroup = new THREE.Group();
  rootGroup.name = 'Crankshaft_Assembly_Master';
  scene.add(rootGroup);

  let throwCount = 6;
  if (typeof configOrThrows === 'number') {
    throwCount = configOrThrows;
  } else if (configOrThrows?.layout) {
    const l = configOrThrows.layout;
    throwCount =
      l === 'i3' || l === 'v6' ? 3 :
      l === 'i4' || l === 'boxer4' || l === 'v8' || l === 'w16' ? 4 :
      l === 'v10' ? 5 :
      6;
  }

  const matLib = globalMaterialLibrary;
  const crankMatType = typeof configOrThrows === 'object' ? (configOrThrows?.crank || 'forged_steel') : 'forged_steel';
  const matPrimaryCrank =
    crankMatType === 'cast_iron' ? matLib.getCastIron() :
    crankMatType === 'billet_steel' ? matLib.getMachinedBillet() :
    crankMatType === 'titanium' ? matLib.getTitaniumAerospace() :
    matLib.getNitridedCrank();

  const matNitrided = matPrimaryCrank;
  const matMicroPolished = matLib.getMachinedBillet();
  const matTungsten = new THREE.MeshStandardMaterial({
    name: 'Tungsten_Heavy_Metal_Slug',
    color: new THREE.Color(0x64748b),
    metalness: 0.95,
    roughness: 0.22,
  });
  const matGoldReluctor = matLib.getGoldAnodized();
  const matDarkIron = matLib.getCastAluminum();
  const matElastomer = matLib.getRubberOring();

  const spec = V12_CRANK_SPECS;
  const throwSpacingM = 0.108;
  const crankLengthM = (throwCount - 1) * throwSpacingM + 0.220;
  const halfSpanX = ((throwCount - 1) * throwSpacingM) / 2;

  // ─── 1. SOLID CORE CRANKSHAFT AXIS LINE ───
  const coreGeo = new THREE.CylinderGeometry(spec.mainJournalRadiusM - 0.003, spec.mainJournalRadiusM - 0.003, crankLengthM, 48);
  coreGeo.rotateZ(Math.PI / 2);
  const coreMesh = new THREE.Mesh(coreGeo, matNitrided);
  coreMesh.name = 'Crankshaft_Forged_Core_Shaft';
  coreMesh.castShadow = true;
  coreMesh.receiveShadow = true;
  rootGroup.add(coreMesh);

  // ─── 2. MAIN JOURNALS WITH OIL SUPPLY HOLES ───
  const mainJournalCount = throwCount + 1;
  for (let m = 0; m < mainJournalCount; m++) {
    const mx = -halfSpanX - throwSpacingM * 0.5 + m * throwSpacingM;
    const isThrustJournal = m === Math.floor(mainJournalCount / 2);

    // Main Journal Sleeve (Smooth 48 segments)
    const journalGeo = new THREE.CylinderGeometry(spec.mainJournalRadiusM, spec.mainJournalRadiusM, spec.mainJournalWidthM, 48);
    journalGeo.rotateZ(Math.PI / 2);
    const journalMesh = new THREE.Mesh(journalGeo, matMicroPolished);
    journalMesh.name = `Main_Bearing_Journal_${m + 1}`;
    journalMesh.position.set(mx, 0, 0);
    journalMesh.castShadow = true;
    journalMesh.receiveShadow = true;
    rootGroup.add(journalMesh);

    // Bearing Cap Alignment Register Lip (Centering shoulder)
    const registerLipGeo = new THREE.TorusGeometry(spec.mainJournalRadiusM + 0.002, 0.0012, 12, 48);
    registerLipGeo.rotateY(Math.PI / 2);
    const registerLipMesh = new THREE.Mesh(registerLipGeo, matNitrided);
    registerLipMesh.name = `Main_Register_Lip_${m + 1}`;
    registerLipMesh.position.set(mx, 0, 0);
    rootGroup.add(registerLipMesh);

    // Journal Oil Chamfer Fillet Bands
    [-spec.mainJournalWidthM / 2, spec.mainJournalWidthM / 2].forEach((cx, cIdx) => {
      const chamferGeo = new THREE.TorusGeometry(spec.mainJournalRadiusM, 0.0018, 12, 48);
      chamferGeo.rotateY(Math.PI / 2);
      const chamferMesh = new THREE.Mesh(chamferGeo, matNitrided);
      chamferMesh.name = `Main_Journal_Chamfer_${m + 1}_${cIdx === 0 ? 'F' : 'R'}`;
      chamferMesh.position.set(mx + cx, 0, 0);
      rootGroup.add(chamferMesh);
    });

    // Radial Pressurized Oil Feed Hole
    const oilDrillingGeo = new THREE.CylinderGeometry(0.0035, 0.0035, 0.015, 16);
    const oilDrillingMesh = new THREE.Mesh(oilDrillingGeo, matDarkIron);
    oilDrillingMesh.name = `Main_Oil_Supply_Drilling_${m + 1}`;
    oilDrillingMesh.position.set(mx, spec.mainJournalRadiusM - 0.004, 0);
    rootGroup.add(oilDrillingMesh);

    // Integrated Thrust Collars on Center Main
    if (isThrustJournal) {
      [-spec.mainJournalWidthM / 2 - 0.002, spec.mainJournalWidthM / 2 + 0.002].forEach((tx, tIdx) => {
        const thrustGeo = new THREE.CylinderGeometry(spec.mainJournalRadiusM + 0.014, spec.mainJournalRadiusM + 0.014, 0.003, 48);
        thrustGeo.rotateZ(Math.PI / 2);
        const thrustMesh = new THREE.Mesh(thrustGeo, matMicroPolished);
        thrustMesh.name = `Integrated_Thrust_Collar_${tIdx === 0 ? 'Front' : 'Rear'}`;
        thrustMesh.position.set(mx + tx, 0, 0);
        thrustMesh.castShadow = true;
        rootGroup.add(thrustMesh);
      });
    }
  }

  // ─── 3. CRANKPINS & AERODYNAMIC KNIFE-EDGED COUNTERWEIGHTS ───
  for (let p = 0; p < throwCount; p++) {
    const px = -halfSpanX + p * throwSpacingM;
    const angle =
      throwCount === 3 ? (p * (2 * Math.PI)) / 3 :
      throwCount === 4 ? (p % 2 === 0 ? 0 : Math.PI) :
      throwCount === 5 ? (p * (2 * Math.PI)) / 5 :
      (p % 3) * ((2 * Math.PI) / 3);

    const pinY = Math.sin(angle) * spec.throwRadiusM;
    const pinZ = Math.cos(angle) * spec.throwRadiusM;

    // ── A. Precision Ground Crankpin Journal ──
    const pinGeo = new THREE.CylinderGeometry(spec.crankpinRadiusM, spec.crankpinRadiusM, spec.crankpinWidthM, 48);
    pinGeo.rotateZ(Math.PI / 2);
    const pinMesh = new THREE.Mesh(pinGeo, matMicroPolished);
    pinMesh.name = `Crankpin_Journal_${p + 1}`;
    pinMesh.position.set(px, pinY, pinZ);
    pinMesh.castShadow = true;
    pinMesh.receiveShadow = true;
    rootGroup.add(pinMesh);

    // Gun-Drilled Crankpin Center Lightening Hollow Bore
    const hollowGeo = new THREE.CylinderGeometry(spec.crankpinRadiusM - 0.009, spec.crankpinRadiusM - 0.009, spec.crankpinWidthM + 0.002, 28);
    hollowGeo.rotateZ(Math.PI / 2);
    const hollowMesh = new THREE.Mesh(hollowGeo, matDarkIron);
    hollowMesh.name = `Crankpin_GunDrilled_Lightening_Bore_${p + 1}`;
    hollowMesh.position.set(px, pinY, pinZ);
    rootGroup.add(hollowMesh);

    // Dual Connecting Rod Thrust Shoulders
    [-spec.crankpinWidthM / 2, spec.crankpinWidthM / 2].forEach((sx, sIdx) => {
      const shoulderGeo = new THREE.TorusGeometry(spec.crankpinRadiusM + 0.004, 0.002, 16, 48);
      shoulderGeo.rotateY(Math.PI / 2);
      const shoulderMesh = new THREE.Mesh(shoulderGeo, matNitrided);
      shoulderMesh.name = `Rod_Side_Thrust_Shoulder_${p + 1}_${sIdx === 0 ? 'Fwd' : 'Aft'}`;
      shoulderMesh.position.set(px + sx, pinY, pinZ);
      rootGroup.add(shoulderMesh);
    });

    // ── B. 2 Sculpted Knife-Edged Counterweights per Throw ──
    [-0.024, 0.024].forEach((wx, wIdx) => {
      const weightGroup = new THREE.Group();
      weightGroup.name = `Counterweight_Assembly_${p + 1}_${wIdx === 0 ? 'F' : 'R'}`;
      weightGroup.position.set(px + wx, 0, 0);

      // Teardrop / Sector Counterweight Main Body
      const cweightGeo = new THREE.CylinderGeometry(
        0.076,
        0.076,
        spec.webThicknessM,
        48,
        1,
        false,
        angle + Math.PI - 1.05,
        2.1
      );
      cweightGeo.rotateZ(Math.PI / 2);
      const cweightMesh = new THREE.Mesh(cweightGeo, matNitrided);
      cweightMesh.name = `Counterweight_Lobe_${p + 1}`;
      cweightMesh.castShadow = true;
      weightGroup.add(cweightMesh);

      // Knife-Edged Windage Aerodynamic Leading & Trailing Edges
      const knifeGeo = new THREE.BoxGeometry(spec.webThicknessM * 0.7, 0.04, 0.012);
      knifeGeo.rotateX(angle + Math.PI);
      const knifeMesh = new THREE.Mesh(knifeGeo, matMicroPolished);
      knifeMesh.name = `Knife_Edge_Bevel_${p + 1}`;
      knifeMesh.position.set(0, -Math.sin(angle) * 0.068, -Math.cos(angle) * 0.068);
      weightGroup.add(knifeMesh);

      // Embedded Dense Tungsten Balancing Slugs (2 Press-Fit Slugs per Lobe)
      [-0.020, 0.020].forEach((slugAngleOffset, slugIdx) => {
        const slugAngle = angle + Math.PI + slugAngleOffset;
        const slugY = Math.sin(slugAngle) * 0.062;
        const slugZ = Math.cos(slugAngle) * 0.062;

        const slugGeo = new THREE.CylinderGeometry(0.011, 0.011, spec.webThicknessM + 0.002, 28);
        slugGeo.rotateZ(Math.PI / 2);
        const slugMesh = new THREE.Mesh(slugGeo, matTungsten);
        slugMesh.name = `Tungsten_Balance_Slug_${p + 1}_${slugIdx + 1}`;
        slugMesh.position.set(0, slugY, slugZ);
        weightGroup.add(slugMesh);
      });

      rootGroup.add(weightGroup);
    });

    // ── C. Angled Cross-Drilled High-Pressure Oil Gallery Passage ──
    const mainRefX = px - 0.027;
    const oilPassageCurve = new THREE.LineCurve3(
      new THREE.Vector3(mainRefX, 0, 0),
      new THREE.Vector3(px + 0.0075, pinY, pinZ)
    );
    const oilPassageGeo = new THREE.TubeGeometry(oilPassageCurve, 16, 0.0035, 16, false);
    const oilPassageMesh = new THREE.Mesh(oilPassageGeo, matDarkIron);
    oilPassageMesh.name = `Internal_Oil_Drilling_Tract_${p + 1}`;
    rootGroup.add(oilPassageMesh);
  }

  // ─── 4. FRONT TIMING SNOUT, OIL PUMP DRIVE & BALANCER INTERFACE ───
  const frontSnoutGroup = new THREE.Group();
  frontSnoutGroup.name = 'Front_Timing_Snout_Assembly';
  frontSnoutGroup.position.set(-0.355, 0, 0);

  // Stepped Hardened Snout Shaft
  const snoutGeo = new THREE.CylinderGeometry(spec.snoutDiameterM / 2, spec.snoutDiameterM / 2, spec.snoutLengthM, 48);
  snoutGeo.rotateZ(Math.PI / 2);
  const snoutMesh = new THREE.Mesh(snoutGeo, matMicroPolished);
  snoutMesh.name = 'Front_Snout_Shaft';
  snoutMesh.castShadow = true;
  frontSnoutGroup.add(snoutMesh);

  // Front Viton Crank Seal Step Relief Groove
  const frontSealGrooveGeo = new THREE.CylinderGeometry(spec.snoutDiameterM / 2 - 0.002, spec.snoutDiameterM / 2 - 0.002, 0.008, 48);
  frontSealGrooveGeo.rotateZ(Math.PI / 2);
  const frontSealGrooveMesh = new THREE.Mesh(frontSealGrooveGeo, matDarkIron);
  frontSealGrooveMesh.name = 'Front_Main_Seal_Surface_Groove';
  frontSealGrooveMesh.position.set(0.005, 0, 0);
  frontSnoutGroup.add(frontSealGrooveMesh);

  // Harmonic Damper Elastomer Isolator Rubber Ring
  const damperRingGeo = createORingSeal(spec.snoutDiameterM / 2 + 0.006, 0.003, 16, 36);
  damperRingGeo.rotateY(Math.PI / 2);
  const damperRingMesh = new THREE.Mesh(damperRingGeo, matElastomer);
  damperRingMesh.name = 'Harmonic_Damper_Elastomer_Isolator';
  damperRingMesh.position.set(-0.012, 0, 0);
  frontSnoutGroup.add(damperRingMesh);

  // Dual Semi-Circular Woodruff Drive Keys
  [-0.015, 0.015].forEach((kx, kIdx) => {
    const keyGeo = new THREE.CylinderGeometry(0.007, 0.007, 0.005, 16, 1, false, 0, Math.PI);
    keyGeo.rotateZ(Math.PI / 2);
    const keyMesh = new THREE.Mesh(keyGeo, matDarkIron);
    keyMesh.name = `Woodruff_Drive_Key_${kIdx === 0 ? 'OilPump' : 'Damper'}`;
    keyMesh.position.set(kx, spec.snoutDiameterM / 2 + 0.002, 0);
    frontSnoutGroup.add(keyMesh);
  });

  // Front Oil Pump Drive Helical Gear Sprocket
  const oilPumpDriveGeo = new THREE.CylinderGeometry(0.026, 0.026, 0.016, 32);
  oilPumpDriveGeo.rotateZ(Math.PI / 2);
  const oilPumpDriveMesh = new THREE.Mesh(oilPumpDriveGeo, matNitrided);
  oilPumpDriveMesh.name = 'Gerotor_Oil_Pump_Drive_Gear';
  oilPumpDriveMesh.position.set(0.018, 0, 0);
  frontSnoutGroup.add(oilPumpDriveMesh);

  // Harmonic Damper Retention Center Thread Bore & M16 Flanged Bolt
  const damperBoltGeo = createHexBoltHead(0.012, 0.008);
  damperBoltGeo.rotateZ(Math.PI / 2);
  const damperBoltMesh = new THREE.Mesh(damperBoltGeo, matNitrided);
  damperBoltMesh.name = 'Damper_Retention_M16_Center_Bolt';
  damperBoltMesh.position.set(-spec.snoutLengthM / 2 - 0.004, 0, 0);
  frontSnoutGroup.add(damperBoltMesh);

  rootGroup.add(frontSnoutGroup);

  // ─── 5. REAR 8-BOLT FLYWHEEL FLANGE & 60-2 TIMING RELUCTOR RING ───
  const rearFlangeGroup = new THREE.Group();
  rearFlangeGroup.name = 'Rear_Flywheel_Flange_Assembly';
  rearFlangeGroup.position.set(0.355, 0, 0);

  // Rear Centrifugal Oil Flinger Disc (Prevents oil flooding the rear main seal)
  const flingerGeo = new THREE.CylinderGeometry(0.052, 0.052, 0.003, 48);
  flingerGeo.rotateZ(Math.PI / 2);
  const flingerMesh = new THREE.Mesh(flingerGeo, matMicroPolished);
  flingerMesh.name = 'Centrifugal_Rear_Oil_Flinger_Disc';
  flingerMesh.position.set(-0.024, 0, 0);
  rearFlangeGroup.add(flingerMesh);

  // Heavy-Duty Billet Flywheel Mounting Flange Plate (48 segments)
  const flangeGeo = new THREE.CylinderGeometry(
    spec.flywheelFlangeDiameterM / 2,
    spec.flywheelFlangeDiameterM / 2,
    spec.flywheelFlangeThicknessM,
    48
  );
  flangeGeo.rotateZ(Math.PI / 2);
  const flangeMesh = new THREE.Mesh(flangeGeo, matMicroPolished);
  flangeMesh.name = 'Rear_Flywheel_Mating_Flange';
  flangeMesh.castShadow = true;
  rearFlangeGroup.add(flangeMesh);

  // Transmission Input Shaft Pilot Bearing Bore
  const pilotBoreGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.025, 32);
  pilotBoreGeo.rotateZ(Math.PI / 2);
  const pilotBoreMesh = new THREE.Mesh(pilotBoreGeo, matDarkIron);
  pilotBoreMesh.name = 'Clutch_Pilot_Bearing_Recess';
  pilotBoreMesh.position.set(0.005, 0, 0);
  rearFlangeGroup.add(pilotBoreMesh);

  // 8 High-Strength M12 Flywheel Retention Bolt Holes & Threaded Fasteners
  for (let b = 0; b < 8; b++) {
    const bAngle = (b * Math.PI) / 4;
    const by = Math.sin(bAngle) * 0.042;
    const bz = Math.cos(bAngle) * 0.042;

    const boltHoleGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.022, 20);
    boltHoleGeo.rotateZ(Math.PI / 2);
    const boltHoleMesh = new THREE.Mesh(boltHoleGeo, matDarkIron);
    boltHoleMesh.name = `Flywheel_M12_Bolt_Hole_${b + 1}`;
    boltHoleMesh.position.set(0, by, bz);
    rearFlangeGroup.add(boltHoleMesh);
  }

  // 60-2 Precision Laser-Cut Crankshaft Position Trigger Wheel
  const reluctorGeo = new THREE.CylinderGeometry(0.068, 0.068, 0.006, 60);
  reluctorGeo.rotateZ(Math.PI / 2);
  const reluctorMesh = new THREE.Mesh(reluctorGeo, matGoldReluctor);
  reluctorMesh.name = '60_Minus_2_Crank_Reluctor_Trigger_Wheel';
  reluctorMesh.position.set(-0.014, 0, 0);
  rearFlangeGroup.add(reluctorMesh);

  // 58 Individual Trigger Teeth on Reluctor Perimeter (2 Missing for TDC reference)
  for (let t = 0; t < 58; t++) {
    const tAngle = (t * Math.PI * 2) / 60;
    const ty = Math.sin(tAngle) * 0.071;
    const tz = Math.cos(tAngle) * 0.071;

    const toothGeo = new THREE.BoxGeometry(0.005, 0.004, 0.004);
    toothGeo.rotateX(tAngle);
    const toothMesh = new THREE.Mesh(toothGeo, matGoldReluctor);
    toothMesh.name = `Reluctor_Tooth_${t + 1}`;
    toothMesh.position.set(-0.014, ty, tz);
    rearFlangeGroup.add(toothMesh);
  }

  rootGroup.add(rearFlangeGroup);

  // ─── 6. EMBEDDED NAMED ATTACHMENT SOCKETS FOR KINEMATIC INTEGRATION ───
  for (const attachment of V12_CRANKSHAFT_ATTACHMENTS) {
    const anchorNode = new THREE.Object3D();
    anchorNode.name = attachment.id;
    anchorNode.position.set(attachment.position.x, attachment.position.y, attachment.position.z - 0.05);
    anchorNode.rotation.set(attachment.rotation.x, attachment.rotation.y, attachment.rotation.z);
    anchorNode.userData = {
      isAttachmentPoint: true,
      category: attachment.category,
      acceptsType: attachment.acceptsType,
      cylinderIndex: attachment.cylinderIndex,
      bankSide: attachment.bankSide,
    };
    rootGroup.add(anchorNode);
  }

  return scene;
}

/**
 * Exports the crankshaft scene to a binary GLB ArrayBuffer.
 */
export async function generateCrankshaftGlbBuffer(): Promise<ArrayBuffer> {
  const scene = buildCrankshaftScene();
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

export default buildCrankshaftScene;
