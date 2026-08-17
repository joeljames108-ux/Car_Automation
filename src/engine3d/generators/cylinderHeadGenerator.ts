// ============================================================================
// ULTRA-HIGH-FIDELITY MODULAR GLB GENERATOR — DOHC 24-VALVE CYLINDER HEADS
// ============================================================================
// Solid-modeling engineering generator for Bank 1 (Left) and Bank 2 (Right)
// 6-cylinder DOHC 24-valve racing cylinder heads. Features 6 CNC pent-roof combustion
// chambers with Beryllium-copper seats, 24 sodium-filled titanium/Inconel valves
// with dual progressive springs and titanium retainers, dual hollow camshafts with
// 7 bolted bearing towers, gold-anodized vernier adjustable cam gears, CNC-ported
// intake/exhaust tracts, spark plug center wells, and perimeter head stud pillars.
// ============================================================================

import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { globalMaterialLibrary } from '../materials/pbrMaterialSystem';
import {
  V12_CYLINDER_HEAD_LEFT_ATTACHMENTS,
  V12_CYLINDER_HEAD_RIGHT_ATTACHMENTS,
} from '../attachmentMaps/v12AttachmentMap';

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
export function buildCylinderHeadScene(bankSide: 'left' | 'right'): THREE.Scene {
  const isLeft = bankSide === 'left';
  const scene = new THREE.Scene();
  scene.name = `V12_DOHC_Cylinder_Head_${isLeft ? 'Bank1_Left' : 'Bank2_Right'}_Scene`;

  const rootGroup = new THREE.Group();
  rootGroup.name = `04_Cylinder_Head_${isLeft ? 'Left' : 'Right'}_Master_Group`;
  scene.add(rootGroup);

  const matLib = globalMaterialLibrary;
  const matCasting = matLib.getCastAluminum();
  const matBilletDeck = matLib.getMachinedBillet();
  const matGoldVernier = matLib.getGoldAnodized();
  const matInconelExh = matLib.getInconelExhaust();
  const matSteelCam = matLib.getNitridedCrank();
  const matTitaniumValve = matLib.getMachinedBillet();
  const matCopperSeat = new THREE.MeshStandardMaterial({
    name: 'Beryllium_Copper_Valve_Seat',
    color: new THREE.Color(0xb45309),
    metalness: 0.88,
    roughness: 0.26,
  });
  const matArpStud = new THREE.MeshStandardMaterial({
    name: 'ARP_Hardened_Head_Fastener',
    color: new THREE.Color(0x1e293b),
    metalness: 0.95,
    roughness: 0.20,
  });

  const spec = V12_HEAD_SPECS;

  // ─── 1. CNC MILLED BILLET CYLINDER HEAD MONOBLOCK ───
  const headBlockGroup = new THREE.Group();
  headBlockGroup.name = 'Head_Casting_Monoblock_Subsystem';

  // Lower Main Head Casting Core
  const headGeo = new THREE.BoxGeometry(spec.headLengthM, spec.headWidthM, spec.headHeightM - 0.02);
  const headMesh = new THREE.Mesh(headGeo, matCasting);
  headMesh.name = 'Cylinder_Head_Casting_Core';
  headMesh.position.set(0, 0, 0);
  headMesh.castShadow = true;
  headMesh.receiveShadow = true;
  headBlockGroup.add(headMesh);

  // Precision CNC Deck Mating Bottom Face Plate
  const deckPlateGeo = new THREE.BoxGeometry(spec.headLengthM + 0.004, spec.headWidthM + 0.004, 0.008);
  const deckPlateMesh = new THREE.Mesh(deckPlateGeo, matBilletDeck);
  deckPlateMesh.name = 'Head_Deck_Precision_Milled_Face';
  deckPlateMesh.position.set(0, 0, -spec.headHeightM / 2 + 0.014);
  deckPlateMesh.receiveShadow = true;
  headBlockGroup.add(deckPlateMesh);

  // Upper Valve Cover Perimeter Mating Flange Rail
  const topRailGeo = new THREE.BoxGeometry(spec.headLengthM + 0.002, spec.headWidthM + 0.002, 0.008);
  const topRailMesh = new THREE.Mesh(topRailGeo, matBilletDeck);
  topRailMesh.name = 'Valve_Cover_Perimeter_Mating_Rail';
  topRailMesh.position.set(0, 0, spec.headHeightM / 2 - 0.014);
  headBlockGroup.add(topRailMesh);

  rootGroup.add(headBlockGroup);

  // ─── 2. 6 PENT-ROOF COMBUSTION CHAMBERS & 24 VALVE SEATS ───
  const valvetrainGroup = new THREE.Group();
  valvetrainGroup.name = 'Valvetrain_24Valve_Subsystem';

  for (let c = 0; c < 6; c++) {
    const cx = -0.25 + c * 0.10;

    // Pent-Roof Combustion Chamber Recess
    const chamberGeo = new THREE.CylinderGeometry(0.041, 0.034, 0.012, 24);
    const chamberMesh = new THREE.Mesh(chamberGeo, matBilletDeck);
    chamberMesh.name = `PentRoof_Chamber_${c + 1}`;
    chamberMesh.position.set(cx, 0, -spec.headHeightM / 2 + 0.018);
    chamberMesh.rotation.x = Math.PI;
    valvetrainGroup.add(chamberMesh);

    // Central Spark Plug Well
    const plugWellGeo = new THREE.CylinderGeometry(0.011, 0.011, spec.headHeightM, 16);
    const plugWellMesh = new THREE.Mesh(plugWellGeo, matBilletDeck);
    plugWellMesh.name = `Spark_Plug_Center_Well_${c + 1}`;
    plugWellMesh.position.set(cx, 0, 0.005);
    valvetrainGroup.add(plugWellMesh);

    // ── Dual Titanium Intake Valves (Inner Valley Side: +Y on Left, -Y on Right) ──
    const intakeY = isLeft ? 0.038 : -0.038;
    [-0.017, 0.017].forEach((vx, vIdx) => {
      // Valve Seat Ring
      const seatGeo = new THREE.TorusGeometry(spec.intakeValveRadiusM, 0.0025, 12, 24);
      const seatMesh = new THREE.Mesh(seatGeo, matCopperSeat);
      seatMesh.name = `Intake_Valve_Seat_${c + 1}_${vIdx + 1}`;
      seatMesh.position.set(cx + vx, intakeY, -spec.headHeightM / 2 + 0.015);
      valvetrainGroup.add(seatMesh);

      // Valve Tulip Head (38mm Titanium)
      const valveHeadGeo = new THREE.CylinderGeometry(spec.intakeValveRadiusM - 0.001, spec.intakeValveRadiusM - 0.001, 0.004, 24);
      const valveHeadMesh = new THREE.Mesh(valveHeadGeo, matTitaniumValve);
      valveHeadMesh.name = `Intake_Valve_Tulip_${c + 1}_${vIdx + 1}`;
      valveHeadMesh.position.set(cx + vx, intakeY, -spec.headHeightM / 2 + 0.016);
      valvetrainGroup.add(valveHeadMesh);

      // Valve Stem & Dual Progressive Springs
      const stemGeo = new THREE.CylinderGeometry(0.003, 0.003, 0.082, 12);
      const stemMesh = new THREE.Mesh(stemGeo, matTitaniumValve);
      stemMesh.name = `Intake_Valve_Stem_${c + 1}_${vIdx + 1}`;
      stemMesh.position.set(cx + vx, intakeY, 0.012);
      valvetrainGroup.add(stemMesh);

      // Conical Valve Spring & Titanium Retainer
      const springGeo = new THREE.CylinderGeometry(0.013, 0.015, 0.038, 16);
      const springMesh = new THREE.Mesh(springGeo, matGoldVernier);
      springMesh.name = `Intake_Valve_Conical_Spring_${c + 1}_${vIdx + 1}`;
      springMesh.position.set(cx + vx, intakeY, 0.028);
      valvetrainGroup.add(springMesh);
    });

    // ── Dual Inconel Exhaust Valves (Outer Flank Side: -Y on Left, +Y on Right) ──
    const exhaustY = isLeft ? -0.038 : 0.038;
    [-0.015, 0.015].forEach((vx, vIdx) => {
      // Valve Seat Ring
      const seatGeo = new THREE.TorusGeometry(spec.exhaustValveRadiusM, 0.0022, 12, 24);
      const seatMesh = new THREE.Mesh(seatGeo, matCopperSeat);
      seatMesh.name = `Exhaust_Valve_Seat_${c + 1}_${vIdx + 1}`;
      seatMesh.position.set(cx + vx, exhaustY, -spec.headHeightM / 2 + 0.015);
      valvetrainGroup.add(seatMesh);

      // Valve Tulip Head (32mm Inconel)
      const valveHeadGeo = new THREE.CylinderGeometry(spec.exhaustValveRadiusM - 0.001, spec.exhaustValveRadiusM - 0.001, 0.004, 24);
      const valveHeadMesh = new THREE.Mesh(valveHeadGeo, matInconelExh);
      valveHeadMesh.name = `Exhaust_Valve_Tulip_${c + 1}_${vIdx + 1}`;
      valveHeadMesh.position.set(cx + vx, exhaustY, -spec.headHeightM / 2 + 0.016);
      valvetrainGroup.add(valveHeadMesh);

      // Valve Stem & Dual Progressive Springs
      const stemGeo = new THREE.CylinderGeometry(0.003, 0.003, 0.082, 12);
      const stemMesh = new THREE.Mesh(stemGeo, matInconelExh);
      stemMesh.name = `Exhaust_Valve_Stem_${c + 1}_${vIdx + 1}`;
      stemMesh.position.set(cx + vx, exhaustY, 0.012);
      valvetrainGroup.add(stemMesh);

      // Conical Valve Spring
      const springGeo = new THREE.CylinderGeometry(0.012, 0.014, 0.038, 16);
      const springMesh = new THREE.Mesh(springGeo, matGoldVernier);
      springMesh.name = `Exhaust_Valve_Conical_Spring_${c + 1}_${vIdx + 1}`;
      springMesh.position.set(cx + vx, exhaustY, 0.028);
      valvetrainGroup.add(springMesh);
    });
  }

  rootGroup.add(valvetrainGroup);

  // ─── 3. DUAL HOLLOW CAMSHAFTS & 7 CAM BEARING TOWERS ───
  const camGroup = new THREE.Group();
  camGroup.name = 'DOHC_Camshafts_Towers_Subsystem';

  [-0.042, 0.042].forEach((camY, camIdx) => {
    const isIntakeCam = camIdx === 0;
    const camName = isIntakeCam ? 'Intake' : 'Exhaust';

    // Hollow Chill-Cast Camshaft Core
    const camShaftGeo = new THREE.CylinderGeometry(spec.camShaftDiameterM / 2, spec.camShaftDiameterM / 2, spec.camShaftLengthM, 32);
    camShaftGeo.rotateZ(Math.PI / 2);
    const camShaftMesh = new THREE.Mesh(camShaftGeo, matSteelCam);
    camShaftMesh.name = `${camName}_Camshaft_Shaft_Line`;
    camShaftMesh.position.set(0, camY, 0.052);
    camShaftMesh.castShadow = true;
    camGroup.add(camShaftMesh);

    // 12 Asymmetric High-Lift Cam Lobes per Shaft
    for (let lobe = 0; lobe < 12; lobe++) {
      const lx = -0.27 + lobe * (0.54 / 11);
      const lobeAngle = lobe * 0.52; // Progressive firing angle

      const lobeGeo = new THREE.CylinderGeometry(
        spec.camLobeBaseRadiusM + spec.camLobeLiftM,
        spec.camLobeBaseRadiusM,
        0.015,
        20,
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

    // 7 Bolted Cam Bearing Journal Towers & Caps
    for (let t = 0; t < 7; t++) {
      const tx = -0.29 + t * (0.58 / 6);

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

      // Dual ARP M6 Cap Bolts
      [-0.009, 0.009].forEach((cy, cIdx) => {
        const boltGeo = new THREE.CylinderGeometry(0.0025, 0.0025, 0.014, 12);
        const boltMesh = new THREE.Mesh(boltGeo, matArpStud);
        boltMesh.name = `${camName}_Cam_Bolt_${t + 1}_${cIdx + 1}`;
        boltMesh.position.set(tx, camY + cy, 0.066);
        camGroup.add(boltMesh);
      });
    }

    // Front Gold-Anodized Vernier Adjustable Timing Sprocket
    const vernierGeo = new THREE.CylinderGeometry(spec.sprocketDiameterM / 2, spec.sprocketDiameterM / 2, 0.014, 36);
    vernierGeo.rotateZ(Math.PI / 2);
    const vernierMesh = new THREE.Mesh(vernierGeo, matGoldVernier);
    vernierMesh.name = `${camName}_Vernier_Cam_Gear`;
    vernierMesh.position.set(-0.315, camY, 0.052);
    vernierMesh.castShadow = true;
    camGroup.add(vernierMesh);

    // Vernier Lightening Windows (5 Radial Pockets)
    for (let w = 0; w < 5; w++) {
      const wAngle = (w * Math.PI * 2) / 5;
      const wy = Math.sin(wAngle) * 0.025;
      const wz = Math.cos(wAngle) * 0.025;

      const windowGeo = new THREE.CylinderGeometry(0.007, 0.007, 0.016, 16);
      windowGeo.rotateZ(Math.PI / 2);
      const windowMesh = new THREE.Mesh(windowGeo, matArpStud);
      windowMesh.name = `${camName}_Vernier_Window_${w + 1}`;
      windowMesh.position.set(-0.315, camY + wy, 0.052 + wz);
      camGroup.add(windowMesh);
    }
  });

  rootGroup.add(camGroup);

  // ─── 4. 14 HEAD STUD REINFORCING PILLARS & GASKET MATING HARDWARE ───
  const pillarGroup = new THREE.Group();
  pillarGroup.name = 'Head_Stud_Pillars_Subsystem';

  for (let p = 0; p < 7; p++) {
    const px = -0.28 + p * (0.56 / 6);

    [-spec.headWidthM / 2 + 0.018, spec.headWidthM / 2 - 0.018].forEach((py, pIdx) => {
      const pillarGeo = new THREE.CylinderGeometry(0.008, 0.008, spec.headHeightM - 0.01, 16);
      const pillarMesh = new THREE.Mesh(pillarGeo, matBilletDeck);
      pillarMesh.name = `Head_Stud_Pillar_${p + 1}_${pIdx === 0 ? 'Inner' : 'Outer'}`;
      pillarMesh.position.set(px, py, 0);
      pillarGroup.add(pillarMesh);

      // Top ARP 12-Point Head Stud Nut
      const nutGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.010, 12);
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

