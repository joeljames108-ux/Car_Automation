// ============================================================================
// ULTRA-HIGH-FIDELITY MODULAR GLB GENERATOR — DOHC 24-VALVE CYLINDER HEADS
// ============================================================================
// Solid-modeling engineering generator for Bank 1 (Left) and Bank 2 (Right)
// 6-cylinder DOHC 24-valve racing cylinder heads. Features 6 CNC pent-roof combustion
// chambers with Beryllium-copper seats, 24 sodium-filled titanium/Inconel valves
// with dual progressive springs and titanium retainers, roller finger cam followers,
// hydraulic lash adjusters (HLA), dual hollow chill-cast camshafts with 7 bolted bearing
// towers, gold-anodized vernier cam gears, CNC-ported tracts, spark plug center wells,
// timing chain guide mounting bosses, coolant crossover ports, and 14 ARP head studs.
// ============================================================================

import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import type { EngineConfig } from '../../sim/types';
import { globalMaterialLibrary } from '../materials/pbrMaterialSystem';
import {
  V12_CYLINDER_HEAD_LEFT_ATTACHMENTS,
  V12_CYLINDER_HEAD_RIGHT_ATTACHMENTS,
} from '../attachmentMaps/v12AttachmentMap';
import {
  create12PointHead,
  createAllenSocketHead,
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

export interface CylinderHeadSpec {
  headLengthM: number; // 0.630 m
  headWidthM: number; // 0.170 m
  headHeightM: number; // 0.110 m
  deckThicknessM: number; // 0.016 m
  intakeValveDiameterMm: number; // 38.0 mm
  intakeValveRadiusM: number; // 0.019 m
  exhaustValveDiameterMm: number; // 32.0 mm
  exhaustValveRadiusM: number; // 0.016 m
  camShaftDiameterM: number; // 0.026 m
  camShaftLengthM: number; // 0.610 m
  camLobeBaseRadiusM: number; // 0.016 m
  camLobeLiftM: number; // 0.0125 m (12.5mm valve lift)
  sprocketDiameterM: number; // 0.088 m
}

export const V12_HEAD_SPECS: CylinderHeadSpec = {
  headLengthM: 0.630,
  headWidthM: 0.170,
  headHeightM: 0.110,
  deckThicknessM: 0.016,
  intakeValveDiameterMm: 38.0,
  intakeValveRadiusM: 0.019,
  exhaustValveDiameterMm: 32.0,
  exhaustValveRadiusM: 0.016,
  camShaftDiameterM: 0.026,
  camShaftLengthM: 0.610,
  camLobeBaseRadiusM: 0.016,
  camLobeLiftM: 0.0125,
  sprocketDiameterM: 0.088,
};

/**
 * Builds the complete ultra-high-fidelity 3D scene graph for a DOHC 24-valve cylinder head.
 */
export function buildCylinderHeadScene(bankSide: 'left' | 'right', configOrCyls?: Partial<EngineConfig> | number): THREE.Scene {
  const isLeft = bankSide === 'left';
  const scene = new THREE.Scene();
  scene.name = `DOHC_Cylinder_Head_${isLeft ? 'Bank1_Left' : 'Bank2_Right'}_Scene`;

  const rootGroup = new THREE.Group();
  rootGroup.name = `Cylinder_Head_${isLeft ? 'Left' : 'Right'}_Master_Group`;
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
  const matCasting = matLib.getCastAluminum();
  const matBilletDeck = matLib.getMachinedBillet();
  const matGoldVernier = matLib.getGoldAnodized();
  const matInconelExh = matLib.getInconelExhaust();
  const matSteelCam = matLib.getNitridedCrank();
  const matTitaniumValve = matLib.getMachinedBillet();
  const matCopperSeat = new THREE.MeshPhysicalMaterial({
    name: 'Beryllium_Copper_Valve_Seat',
    color: new THREE.Color(0xb45309),
    metalness: 0.88,
    roughness: 0.26,,
        clearcoat: 0.35,
        clearcoatRoughness: 0.1,
      };
  const matArpStud = new THREE.MeshPhysicalMaterial({
    name: 'ARP_Hardened_Head_Fastener',
    color: new THREE.Color(0x1e293b),
    metalness: 0.95,
    roughness: 0.20,,
        clearcoat: 0.35,
        clearcoatRoughness: 0.1,
      };
  const matCeramicInsulator = matLib.getCeramicIntake();
  const matCoilBoot = matLib.getRubberOring();

  const spec = V12_HEAD_SPECS;
  const cylSpacingM = 0.100;
  const headLengthM = (cylsPerBank - 1) * cylSpacingM + 0.130;
  const halfSpanX = ((cylsPerBank - 1) * cylSpacingM) / 2;

  // Helical coil valve spring (conical, along +Z)
  const createCoilSpring = (radiusTop: number, radiusBottom: number, height: number, coilCount: number, wireRadius: number): THREE.BufferGeometry => {
    const points: THREE.Vector3[] = [];
    const segments = Math.max(16, coilCount * 20);
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const angle = coilCount * Math.PI * 2 * t;
      const r = radiusBottom + (radiusTop - radiusBottom) * t;
      points.push(new THREE.Vector3(Math.cos(angle) * r, Math.sin(angle) * r, height * t));
    }
    const curve = new THREE.CatmullRomCurve3(points);
    return new THREE.TubeGeometry(curve, coilCount * 22, wireRadius, 8, false);
  };

  // ─── 1. CNC MILLED BILLET CYLINDER HEAD MONOBLOCK ───
  const headBlockGroup = new THREE.Group();
  headBlockGroup.name = 'Head_Casting_Monoblock_Subsystem';

  // Lower Main Head Casting Core
  const headGeo = new THREE.BoxGeometry(headLengthM, spec.headWidthM, spec.headHeightM - 0.02);
  const headMesh = new THREE.Mesh(headGeo, matCasting);
  headMesh.name = 'Cylinder_Head_Casting_Core';
  headMesh.position.set(0, 0, 0);
  headMesh.castShadow = true;
  headMesh.receiveShadow = true;
  headBlockGroup.add(headMesh);

  // Precision CNC Deck Mating Bottom Face Plate
  const deckPlateGeo = new THREE.BoxGeometry(headLengthM + 0.004, spec.headWidthM + 0.004, 0.008);
  const deckPlateMesh = new THREE.Mesh(deckPlateGeo, matBilletDeck);
  deckPlateMesh.name = 'Head_Deck_Precision_Milled_Face';
  deckPlateMesh.position.set(0, 0, -spec.headHeightM / 2 + 0.014);
  deckPlateMesh.receiveShadow = true;
  headBlockGroup.add(deckPlateMesh);

  // Upper Valve Cover Perimeter Mating Flange Rail
  const topRailGeo = new THREE.BoxGeometry(headLengthM + 0.002, spec.headWidthM + 0.002, 0.008);
  const topRailMesh = new THREE.Mesh(topRailGeo, matBilletDeck);
  topRailMesh.name = 'Valve_Cover_Perimeter_Mating_Rail';
  topRailMesh.position.set(0, 0, spec.headHeightM / 2 - 0.014);
  headBlockGroup.add(topRailMesh);

  // Front & Rear Coolant Crossover Port Bosses
  [-headLengthM / 2 + 0.02, headLengthM / 2 - 0.02].forEach((cx, cIdx) => {
    const crossGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.014, 24);
    crossGeo.rotateX(Math.PI / 2);
    const crossMesh = new THREE.Mesh(crossGeo, matBilletDeck);
    crossMesh.name = `Coolant_Crossover_Boss_${cIdx === 0 ? 'Front' : 'Rear'}`;
    crossMesh.position.set(cx, isLeft ? -spec.headWidthM / 2 : spec.headWidthM / 2, 0);
    headBlockGroup.add(crossMesh);
  });

  // Timing Chain Guide Rail Pivot Mounting Bosses (Front Face)
  [-0.035, 0.035].forEach((gy, gIdx) => {
    const bossGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.016, 16);
    bossGeo.rotateZ(Math.PI / 2);
    const bossMesh = new THREE.Mesh(bossGeo, matBilletDeck);
    bossMesh.name = `Chain_Guide_Pivot_Boss_${gIdx + 1}`;
    bossMesh.position.set(-headLengthM / 2 - 0.004, gy, 0.02);
    headBlockGroup.add(bossMesh);
  });

  rootGroup.add(headBlockGroup);

  // ─── 2. PENT-ROOF COMBUSTION CHAMBERS & VALVE SEATS ───
  const valvetrainGroup = new THREE.Group();
  valvetrainGroup.name = 'Valvetrain_Subsystem';

  for (let c = 0; c < cylsPerBank; c++) {
    const cx = -halfSpanX + c * cylSpacingM;

    // Pent-Roof Combustion Chamber Recess
    const chamberGeo = new THREE.CylinderGeometry(0.041, 0.034, 0.012, 32);
    const chamberMesh = new THREE.Mesh(chamberGeo, matBilletDeck);
    chamberMesh.name = `PentRoof_Chamber_${c + 1}`;
    chamberMesh.position.set(cx, 0, -spec.headHeightM / 2 + 0.018);
    chamberMesh.rotation.x = Math.PI;
    valvetrainGroup.add(chamberMesh);

    // Central Spark Plug Well
    const plugWellGeo = new THREE.CylinderGeometry(0.011, 0.011, spec.headHeightM, 24);
    const plugWellMesh = new THREE.Mesh(plugWellGeo, matBilletDeck);
    plugWellMesh.name = `Spark_Plug_Center_Well_${c + 1}`;
    plugWellMesh.position.set(cx, 0, 0.005);
    valvetrainGroup.add(plugWellMesh);

    // Iridium Spark Plug Hex Body Seated in the Well
    const plugBodyGeo = new THREE.CylinderGeometry(0.0075, 0.0075, 0.012, 16);
    const plugBodyMesh = new THREE.Mesh(plugBodyGeo, matSteelCam);
    plugBodyMesh.name = `Iridium_Spark_Plug_Body_${c + 1}`;
    plugBodyMesh.position.set(cx, 0, 0.024);
    valvetrainGroup.add(plugBodyMesh);

    // Ceramic Insulator Stack
    const insulatorGeo = new THREE.CylinderGeometry(0.005, 0.0065, 0.020, 16);
    const insulatorMesh = new THREE.Mesh(insulatorGeo, matCeramicInsulator);
    insulatorMesh.name = `Spark_Plug_Ceramic_Insulator_${c + 1}`;
    insulatorMesh.position.set(cx, 0, 0.040);
    valvetrainGroup.add(insulatorMesh);

    // Coil-On-Plug Rubber Boot Stub
    const bootGeo = new THREE.CylinderGeometry(0.008, 0.007, 0.014, 16);
    const bootMesh = new THREE.Mesh(bootGeo, matCoilBoot);
    bootMesh.name = `COP_Coil_Rubber_Boot_${c + 1}`;
    bootMesh.position.set(cx, 0, 0.056);
    valvetrainGroup.add(bootMesh);

    // ── Dual Titanium Intake Valves ──
    const intakeY = isLeft ? 0.038 : -0.038;
    [-0.017, 0.017].forEach((vx, vIdx) => {
      // Valve Seat Ring
      const seatGeo = new THREE.TorusGeometry(spec.intakeValveRadiusM, 0.0025, 16, 32);
      const seatMesh = new THREE.Mesh(seatGeo, matCopperSeat);
      seatMesh.name = `Intake_Valve_Seat_${c + 1}_${vIdx + 1}`;
      seatMesh.position.set(cx + vx, intakeY, -spec.headHeightM / 2 + 0.015);
      valvetrainGroup.add(seatMesh);

      // Valve Tulip Head
      const valveHeadGeo = new THREE.CylinderGeometry(spec.intakeValveRadiusM - 0.001, spec.intakeValveRadiusM - 0.001, 0.004, 32);
      const valveHeadMesh = new THREE.Mesh(valveHeadGeo, matTitaniumValve);
      valveHeadMesh.name = `Intake_Valve_Tulip_${c + 1}_${vIdx + 1}`;
      valveHeadMesh.position.set(cx + vx, intakeY, -spec.headHeightM / 2 + 0.016);
      valvetrainGroup.add(valveHeadMesh);

      // Valve Stem
      const stemGeo = new THREE.CylinderGeometry(0.003, 0.003, 0.082, 16);
      const stemMesh = new THREE.Mesh(stemGeo, matTitaniumValve);
      stemMesh.name = `Intake_Valve_Stem_${c + 1}_${vIdx + 1}`;
      stemMesh.position.set(cx + vx, intakeY, 0.012);
      valvetrainGroup.add(stemMesh);

      // Dual Conical Coil Valve Spring & Titanium Retainer
      const springGeo = createCoilSpring(0.0115, 0.0145, 0.038, 6, 0.0022);
      const springMesh = new THREE.Mesh(springGeo, matGoldVernier);
      springMesh.name = `Intake_Valve_Conical_Spring_${c + 1}_${vIdx + 1}`;
      springMesh.position.set(cx + vx, intakeY, 0.009);
      valvetrainGroup.add(springMesh);

      // Hardened Spring Seat Washer
      const seatWasherGeo = new THREE.TorusGeometry(0.0145, 0.0012, 8, 24);
      seatWasherGeo.translate(0, 0, 0.001);
      const seatWasherMesh = new THREE.Mesh(seatWasherGeo, matSteelCam);
      seatWasherMesh.name = `Intake_Spring_Seat_Washer_${c + 1}_${vIdx + 1}`;
      seatWasherMesh.position.set(cx + vx, intakeY, 0.009);
      valvetrainGroup.add(seatWasherMesh);

      // Roller Finger Cam Follower & Pivot HLA Post
      const followerGeo = new THREE.BoxGeometry(0.010, 0.022, 0.008);
      const followerMesh = new THREE.Mesh(followerGeo, matSteelCam);
      followerMesh.name = `Intake_Roller_Follower_${c + 1}_${vIdx + 1}`;
      followerMesh.position.set(cx + vx, intakeY, 0.048);
      valvetrainGroup.add(followerMesh);

      const rollerWheelGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.008, 16);
      rollerWheelGeo.rotateZ(Math.PI / 2);
      const rollerWheelMesh = new THREE.Mesh(rollerWheelGeo, matTitaniumValve);
      rollerWheelMesh.name = `Follower_Roller_Bearing_${c + 1}_${vIdx + 1}`;
      rollerWheelMesh.position.set(cx + vx, intakeY, 0.052);
      valvetrainGroup.add(rollerWheelMesh);
    });

    // ── Dual Inconel Exhaust Valves (Outer Flank Side) ──
    const exhaustY = isLeft ? -0.038 : 0.038;
    [-0.015, 0.015].forEach((vx, vIdx) => {
      // Valve Seat Ring
      const seatGeo = new THREE.TorusGeometry(spec.exhaustValveRadiusM, 0.0022, 16, 32);
      const seatMesh = new THREE.Mesh(seatGeo, matCopperSeat);
      seatMesh.name = `Exhaust_Valve_Seat_${c + 1}_${vIdx + 1}`;
      seatMesh.position.set(cx + vx, exhaustY, -spec.headHeightM / 2 + 0.015);
      valvetrainGroup.add(seatMesh);

      // Valve Tulip Head (32mm Inconel)
      const valveHeadGeo = new THREE.CylinderGeometry(spec.exhaustValveRadiusM - 0.001, spec.exhaustValveRadiusM - 0.001, 0.004, 32);
      const valveHeadMesh = new THREE.Mesh(valveHeadGeo, matInconelExh);
      valveHeadMesh.name = `Exhaust_Valve_Tulip_${c + 1}_${vIdx + 1}`;
      valveHeadMesh.position.set(cx + vx, exhaustY, -spec.headHeightM / 2 + 0.016);
      valvetrainGroup.add(valveHeadMesh);

      // Valve Stem
      const stemGeo = new THREE.CylinderGeometry(0.003, 0.003, 0.082, 16);
      const stemMesh = new THREE.Mesh(stemGeo, matInconelExh);
      stemMesh.name = `Exhaust_Valve_Stem_${c + 1}_${vIdx + 1}`;
      stemMesh.position.set(cx + vx, exhaustY, 0.012);
      valvetrainGroup.add(stemMesh);

      // Dual Conical Coil Valve Spring
      const exSpringGeo = createCoilSpring(0.0105, 0.0135, 0.038, 6, 0.0022);
      const exSpringMesh = new THREE.Mesh(exSpringGeo, matGoldVernier);
      exSpringMesh.name = `Exhaust_Valve_Conical_Spring_${c + 1}_${vIdx + 1}`;
      exSpringMesh.position.set(cx + vx, exhaustY, 0.009);
      valvetrainGroup.add(exSpringMesh);

      // Hardened Spring Seat Washer
      const exSeatWasherGeo = new THREE.TorusGeometry(0.0135, 0.0012, 8, 24);
      exSeatWasherGeo.translate(0, 0, 0.001);
      const exSeatWasherMesh = new THREE.Mesh(exSeatWasherGeo, matSteelCam);
      exSeatWasherMesh.name = `Exhaust_Spring_Seat_Washer_${c + 1}_${vIdx + 1}`;
      exSeatWasherMesh.position.set(cx + vx, exhaustY, 0.009);
      valvetrainGroup.add(exSeatWasherMesh);

      // Roller Follower for Exhaust
      const followerGeo = new THREE.BoxGeometry(0.010, 0.022, 0.008);
      const followerMesh = new THREE.Mesh(followerGeo, matSteelCam);
      followerMesh.name = `Exhaust_Roller_Follower_${c + 1}_${vIdx + 1}`;
      followerMesh.position.set(cx + vx, exhaustY, 0.048);
      valvetrainGroup.add(followerMesh);
    });
  }

  rootGroup.add(valvetrainGroup);

  // ─── 3. DUAL HOLLOW CAMSHAFTS & CAM BEARING TOWERS ───
  const camGroup = new THREE.Group();
  camGroup.name = 'DOHC_Camshafts_Towers_Subsystem';

  const camShaftLengthM = headLengthM * 0.98;
  const towerCount = cylsPerBank + 1;
  const lobeCount = cylsPerBank * 2;

  [-0.042, 0.042].forEach((camY, camIdx) => {
    const isIntakeCam = camIdx === 0;
    const camName = isIntakeCam ? 'Intake' : 'Exhaust';

    // Hollow Chill-Cast Camshaft Core (Smooth 48 segments)
    const camShaftGeo = new THREE.CylinderGeometry(spec.camShaftDiameterM / 2, spec.camShaftDiameterM / 2, camShaftLengthM, 48);
    camShaftGeo.rotateZ(Math.PI / 2);
    const camShaftMesh = new THREE.Mesh(camShaftGeo, matSteelCam);
    camShaftMesh.name = `${camName}_Camshaft_Shaft_Line`;
    camShaftMesh.position.set(0, camY, 0.052);
    camShaftMesh.castShadow = true;
    camGroup.add(camShaftMesh);

    // Asymmetric High-Lift Cam Lobes per Shaft (2 per cylinder)
    for (let lobe = 0; lobe < lobeCount; lobe++) {
      const lx = -halfSpanX + lobe * (headLengthM * 0.85 / Math.max(1, lobeCount - 1));
      const lobeAngle = lobe * 0.52; // Progressive firing angle

      const lobeGeo = new THREE.CylinderGeometry(
        spec.camLobeBaseRadiusM + spec.camLobeLiftM,
        spec.camLobeBaseRadiusM,
        0.015,
        28,
        1,
        false,
        lobeAngle,
        Math.PI * 1.25
      );
      lobeGeo.rotateZ(Math.PI / 2);
      const lobeMesh = new THREE.Mesh(lobeGeo, matSteelCam);
      lobeMesh.name = `${camName}_Cam_Lobe_${lobe + 1}`;
      lobeMesh.position.set(lx, camY, 0.052);
      camGroup.add(lobeMesh);
    }

    // Bolted Cam Bearing Journal Towers & Caps (cylsPerBank + 1)
    for (let t = 0; t < towerCount; t++) {
      const tx = -halfSpanX - cylSpacingM * 0.5 + t * cylSpacingM;

      // Lower Tower Web
      const towerGeo = new THREE.BoxGeometry(0.016, 0.024, 0.035);
      const towerMesh = new THREE.Mesh(towerGeo, matCasting);
      towerMesh.name = `${camName}_Cam_Tower_Base_${t + 1}`;
      towerMesh.position.set(tx, camY, 0.035);
      camGroup.add(towerMesh);

      // Upper Bolted Billet Cap
      const capGeo = new THREE.BoxGeometry(0.018, 0.026, 0.016);
      const capMesh = new THREE.Mesh(capGeo, matBilletDeck);
      capMesh.name = `${camName}_Cam_Cap_${t + 1}`;
      capMesh.position.set(tx, camY, 0.062);
      camGroup.add(capMesh);

      // Dual ARP M6 Cap Screws with Allen Socket Heads
      [-0.009, 0.009].forEach((cy, cIdx) => {
        const boltGeo = createAllenSocketHead(0.0028, 0.014);
        const boltMesh = new THREE.Mesh(boltGeo, matArpStud);
        boltMesh.name = `${camName}_Cam_Bolt_${t + 1}_${cIdx + 1}`;
        boltMesh.position.set(tx, camY + cy, 0.066);
        camGroup.add(boltMesh);
      });
    }

    // Front Gold-Anodized Vernier Adjustable Timing Sprocket (Smooth 48 segments)
    const vernierGeo = new THREE.CylinderGeometry(spec.sprocketDiameterM / 2, spec.sprocketDiameterM / 2, 0.014, 48);
    vernierGeo.rotateZ(Math.PI / 2);
    const vernierMesh = new THREE.Mesh(vernierGeo, matGoldVernier);
    vernierMesh.name = `${camName}_Vernier_Cam_Gear`;
    vernierMesh.position.set(-headLengthM / 2 - 0.008, camY, 0.052);
    vernierMesh.castShadow = true;
    camGroup.add(vernierMesh);

    // 25 Roller Timing Chain Engagement Teeth on the Sprocket Rim
    const sprocketX = -headLengthM / 2 - 0.008;
    for (let th = 0; th < 25; th++) {
      const thAngle = (th * Math.PI * 2) / 25;
      const toothGeo = new THREE.BoxGeometry(0.010, 0.004, 0.005);
      toothGeo.rotateX(thAngle);
      const toothMesh = new THREE.Mesh(toothGeo, matGoldVernier);
      toothMesh.name = `${camName}_Sprocket_Chain_Tooth_${th + 1}`;
      toothMesh.position.set(
        sprocketX,
        camY + Math.sin(thAngle) * (spec.sprocketDiameterM / 2 - 0.001),
        0.052 + Math.cos(thAngle) * (spec.sprocketDiameterM / 2 - 0.001)
      );
      camGroup.add(toothMesh);
    }

    // Vernier Degree Ring with Laser-Etched Tick Marks
    const degreeRingGeo = new THREE.TorusGeometry(spec.sprocketDiameterM / 2 + 0.0015, 0.0012, 8, 48);
    degreeRingGeo.rotateY(Math.PI / 2);
    const degreeRingMesh = new THREE.Mesh(degreeRingGeo, matArpStud);
    degreeRingMesh.name = `${camName}_Vernier_Degree_Ring`;
    degreeRingMesh.position.set(-headLengthM / 2 - 0.008, camY, 0.052);
    camGroup.add(degreeRingMesh);

    // Vernier Lightening Windows (5 Radial Pockets)
    for (let w = 0; w < 5; w++) {
      const wAngle = (w * Math.PI * 2) / 5;
      const wy = Math.sin(wAngle) * 0.025;
      const wz = Math.cos(wAngle) * 0.025;

      const windowGeo = new THREE.CylinderGeometry(0.007, 0.007, 0.016, 20);
      windowGeo.rotateZ(Math.PI / 2);
      const windowMesh = new THREE.Mesh(windowGeo, matArpStud);
      windowMesh.name = `${camName}_Vernier_Window_${w + 1}`;
      windowMesh.position.set(-headLengthM / 2 - 0.008, camY + wy, 0.052 + wz);
      camGroup.add(windowMesh);
    }
  });

  rootGroup.add(camGroup);

  // ─── 4. HEAD STUD REINFORCING PILLARS & ARP 12-POINT FASTENERS ───
  const pillarGroup = new THREE.Group();
  pillarGroup.name = 'Head_Stud_Pillars_Subsystem';

  for (let p = 0; p < towerCount; p++) {
    const px = -halfSpanX - cylSpacingM * 0.5 + p * cylSpacingM;

    [-spec.headWidthM / 2 + 0.018, spec.headWidthM / 2 - 0.018].forEach((py, pIdx) => {
      // Internal Head Stud Column Pillar
      const pillarGeo = new THREE.CylinderGeometry(0.008, 0.008, spec.headHeightM - 0.01, 24);
      const pillarMesh = new THREE.Mesh(pillarGeo, matBilletDeck);
      pillarMesh.name = `Head_Stud_Pillar_${p + 1}_${pIdx === 0 ? 'Inner' : 'Outer'}`;
      pillarMesh.position.set(px, py, 0);
      pillarGroup.add(pillarMesh);

      // Top ARP 12-Point Head Stud Nut with Flanged Base
      const nutGeo = create12PointHead(0.0065, 0.010, 0.009, 0.003);
      const nutMesh = new THREE.Mesh(nutGeo, matArpStud);
      nutMesh.name = `ARP_Head_Stud_Nut_${p + 1}_${pIdx + 1}`;
      nutMesh.position.set(px, py, spec.headHeightM / 2 - 0.005);
      pillarGroup.add(nutMesh);
    });
  }

  rootGroup.add(pillarGroup);

  // ─── 5. EMBEDDED ATTACHMENT ANCHOR NODES FOR RETENTION & INTERFACES ───
  const attachments = isLeft ? V12_CYLINDER_HEAD_LEFT_ATTACHMENTS : V12_CYLINDER_HEAD_RIGHT_ATTACHMENTS;
  for (const attachment of attachments) {
    const anchorNode = new THREE.Object3D();
    anchorNode.name = attachment.id;
    anchorNode.position.set(attachment.position.x, 0, 0.05);
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
 * Exports the cylinder head scene to a binary GLB ArrayBuffer.
 */
export async function generateCylinderHeadGlbBuffer(bankSide: 'left' | 'right'): Promise<ArrayBuffer> {
  const scene = buildCylinderHeadScene(bankSide);
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

export default buildCylinderHeadScene;
