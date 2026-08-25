import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import * as fs from "fs";
import * as path from "path";
import {
  create12PointHead,
  createAllenSocketHead,
  createHexBoltHead,
  createKnurledBand,
} from "../../engine3d/generators/geometryDetailUtils";
import { buildStrokeLettering } from "../../engine3d/generators/engineCoverGenerator";

// Polyfill Node.js FileReader for Three.js GLTFExporter binary writer
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

/**
 * ════════════════════════════════════════════════════════════════════════════════
 * 60° V12 RACING ENGINE & TRANSAXLE 3D GLB MASTER GENERATOR — ULTRA DETAIL EDITION
 * ════════════════════════════════════════════════════════════════════════════════
 *
 * Generates a complete, photorealistic glTF 2.0 binary (.glb) model for the
 * 60° V12 Racing Engine and 7-Speed Sequential Transaxle with 14 master
 * subassemblies and 500+ individually named scene-graph nodes:
 *   01 Block Casting & Crankcase        08 Front Radiator & Cooling
 *   02 Crankshaft, Rods & Pistons       09 7-Speed Sequential Transaxle
 *   03 Dry Sump Lubrication             10 Dry-Carbon Engine Cover
 *   04 DOHC Cylinder Heads              11 Front Accessory Drive
 *   05 Anodized Valve Covers            12 Ignition Coils & Wiring Harness
 *   06 ITB Intake & Velocity Stacks     13 Sensor Array & Ancillaries
 *   07 Inconel Exhaust Headers          14 Billet Mounts & Lift Points
 */

/** Helper: create a named mesh with position. */
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

export function buildV12EngineScene(explodedAmount: number = 0): THREE.Scene {
  const scene = new THREE.Scene();
  scene.name = "V12_Racing_Powertrain_Master";

  // ─── PBR MASTER MATERIALS PALETTE ───
  const matCastAluminum = new THREE.MeshStandardMaterial({
    name: "Cast_Magnesium_Aluminum",
    color: 0x94a3b8,
    metalness: 0.75,
    roughness: 0.42,
  });

  const matMachinedDeck = new THREE.MeshStandardMaterial({
    name: "Machined_Billet_Surface",
    color: 0xe2e8f0,
    metalness: 0.88,
    roughness: 0.22,
  });

  const matNitridedCrank = new THREE.MeshStandardMaterial({
    name: "Forged_Nitrided_Steel",
    color: 0xcbd5e1,
    metalness: 0.92,
    roughness: 0.15,
  });

  const matGoldAnodized = new THREE.MeshStandardMaterial({
    name: "Billet_Gold_Anodized",
    color: 0xf59e0b,
    metalness: 0.9,
    roughness: 0.2,
  });

  const matCobaltAnodized = new THREE.MeshStandardMaterial({
    name: "Apex_Cobalt_Blue_Anodized",
    color: 0x0284c7,
    metalness: 0.85,
    roughness: 0.18,
  });

  const matPolishedBrass = new THREE.MeshStandardMaterial({
    name: "Polished_Brass_Butterfly",
    color: 0xfacc15,
    metalness: 0.82,
    roughness: 0.28,
  });

  const matCeramicIntake = new THREE.MeshStandardMaterial({
    name: "Thermal_Barrier_Ceramic_White",
    color: 0xf8fafc,
    metalness: 0.25,
    roughness: 0.35,
  });

  const matInconelExhaust = new THREE.MeshStandardMaterial({
    name: "Inconel_625_Heat_Tinted_Gold",
    color: 0xd97706,
    metalness: 0.9,
    roughness: 0.26,
  });

  const matTitaniumBlued = new THREE.MeshStandardMaterial({
    name: "Titanium_Heat_Blued_Primary",
    color: 0x2563eb,
    metalness: 0.96,
    roughness: 0.16,
  });

  const matRossoCorsa = new THREE.MeshStandardMaterial({
    name: "Rosso_Corsa_Textured_Powdercoat",
    color: 0xdc2626,
    metalness: 0.45,
    roughness: 0.28,
  });

  const matCarbonFiber = new THREE.MeshStandardMaterial({
    name: "Autoclaved_2x2_Twill_Dry_Carbon",
    color: 0x1e293b,
    metalness: 0.35,
    roughness: 0.38,
  });

  const matForgedCarbonGold = new THREE.MeshStandardMaterial({
    name: "Forged_Carbon_Gold_Flake",
    color: 0x18181b,
    metalness: 0.45,
    roughness: 0.25,
  });

  const matQuartzGlass = new THREE.MeshPhysicalMaterial({
    name: "Quartz_ITB_Inspection_Glass",
    color: 0x38bdf8,
    metalness: 0.1,
    roughness: 0.05,
    transmission: 0.85,
    opacity: 0.45,
    transparent: true,
  });

  const matRadiatorCore = new THREE.MeshStandardMaterial({
    name: "Micro_Louvered_Brazed_Aluminum",
    color: 0x334155,
    metalness: 0.8,
    roughness: 0.55,
  });

  const matBlueSilicone = new THREE.MeshStandardMaterial({
    name: "High_Pressure_Blue_Silicone",
    color: 0x2563eb,
    metalness: 0.1,
    roughness: 0.6,
  });

  const matTransaxleCast = new THREE.MeshStandardMaterial({
    name: "Transaxle_Magnesium_Casing",
    color: 0x64748b,
    metalness: 0.78,
    roughness: 0.4,
  });

  const matBlackPolymer = new THREE.MeshStandardMaterial({
    name: "Black_Polymer_Shroud",
    color: 0x0f172a,
    metalness: 0.2,
    roughness: 0.7,
  });

  const matOrangeHighVoltage = new THREE.MeshStandardMaterial({
    name: "High_Voltage_Silicone_Orange",
    color: 0xea580c,
    metalness: 0.15,
    roughness: 0.5,
  });

  const matCopperWiring = new THREE.MeshStandardMaterial({
    name: "Copper_Conductor_Wiring",
    color: 0xb45309,
    metalness: 0.65,
    roughness: 0.35,
  });

  const matRubberBlack = new THREE.MeshStandardMaterial({
    name: "EPDM_Elastomer_Black",
    color: 0x111111,
    metalness: 0.0,
    roughness: 0.92,
  });

  const matBraidedSteel = new THREE.MeshStandardMaterial({
    name: "Braided_Stainless_AN_Lines",
    color: 0xa8b3c2,
    metalness: 0.95,
    roughness: 0.45,
  });

  const matRedAnodized = new THREE.MeshStandardMaterial({
    name: "Racing_Red_Anodized",
    color: 0xdc2626,
    metalness: 0.85,
    roughness: 0.22,
  });

  const matSensorGray = new THREE.MeshStandardMaterial({
    name: "Sensor_Composite_Housing",
    color: 0x475569,
    metalness: 0.55,
    roughness: 0.5,
  });

  const matTitaniumShield = new THREE.MeshStandardMaterial({
    name: "Perforated_Titanium_Heat_Shield",
    color: 0xc7d2de,
    metalness: 0.9,
    roughness: 0.32,
  });

  const matFanBlade = new THREE.MeshStandardMaterial({
    name: "Glass_Filled_Nylon_Fan_Blade",
    color: 0x1f2937,
    metalness: 0.25,
    roughness: 0.6,
  });

  // Shared fastener geometries (single instance reused by many meshes → compact GLB)
  const bolt12Geo = create12PointHead(0.0075, 0.0085, 0.010, 0.0026);
  const allenGeo = createAllenSocketHead(0.0055, 0.012);
  const hexGeo = createHexBoltHead(0.008, 0.006);

  // Master Engine Root Node
  const engineRoot = new THREE.Group();
  engineRoot.name = "V12_Racing_Engine";
  scene.add(engineRoot);

  const expZ = explodedAmount * 0.12;
  const expX = explodedAmount * 0.15;
  const expY = explodedAmount * 0.10;

  // ══════════════════════════════════════════════════════════
  // ─── 01. ENGINE BLOCK CASTING & CRANKCASE (60° V-BANK) ───
  // ══════════════════════════════════════════════════════════
  const blockGroup = new THREE.Group();
  blockGroup.name = "01_Block_Casting_Crankcase";

  blockGroup.add(namedMesh(new THREE.BoxGeometry(0.68, 0.32, 0.14), matCastAluminum, "Block_Bedplate_Skirt", 0, 0, 0.07));

  for (let i = 0; i < 7; i++) {
    const mx = -0.30 + i * (0.60 / 6);
    const saddleGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.30, 28);
    saddleGeo.rotateZ(Math.PI / 2);
    blockGroup.add(namedMesh(saddleGeo, matMachinedDeck, `Main_Bearing_Saddle_${i + 1}`, mx, 0, 0.05));

    for (const sign of [-1, 1]) {
      const crossBolt = namedMesh(bolt12Geo, matMachinedDeck, `Cross_Bolt_Main_${i + 1}_${sign > 0 ? "RH" : "LH"}`, mx, sign * 0.052, -0.004);
      crossBolt.rotation.x = (sign * Math.PI) / 2;
      blockGroup.add(crossBolt);
    }
  }

  for (const bank of [-1, 1]) {
    const bankNum = bank === 1 ? 2 : 1;
    const bankLabel = bank === 1 ? "Left" : "Right";
    const bankRot = bank === 1 ? THREE.MathUtils.degToRad(-30) : THREE.MathUtils.degToRad(30);
    const posY = bank === 1 ? 0.11 : -0.11;

    const bankBlockMesh = namedMesh(new THREE.BoxGeometry(0.64, 0.18, 0.22), matCastAluminum, `Bank${bankNum}_Cylinder_Block_Casting`, 0, posY, 0.22);
    bankBlockMesh.rotation.x = bankRot;
    blockGroup.add(bankBlockMesh);

    const deckFace = namedMesh(new THREE.BoxGeometry(0.64, 0.204, 0.008), matMachinedDeck, `Bank${bankNum}_Machined_Deck_Face`, 0, posY + Math.cos(bankRot) * 0.092, 0.22 + Math.sin(bankRot) * 0.092);
    deckFace.rotation.x = bankRot;
    blockGroup.add(deckFace);

    for (let r = 0; r < 5; r++) {
      const t = (r - 2) * 0.042;
      const rib = namedMesh(new THREE.BoxGeometry(0.64, 0.014, 0.02), matCastAluminum, `Bank${bankNum}_Casting_Rib_${r + 1}`, 0, posY + Math.cos(bankRot) * t, 0.135 + Math.sin(bankRot) * t);
      rib.rotation.x = bankRot;
      blockGroup.add(rib);
    }

    for (let p = 0; p < 4; p++) {
      const plug = namedMesh(hexGeo, matGoldAnodized, `Bank${bankNum}_Core_Freeze_Plug_${p + 1}`, -0.24 + p * 0.16, posY * 0.72, 0.112);
      plug.rotation.x = Math.PI / 2 + bankRot;
      blockGroup.add(plug);
    }

    const galleryPlug = namedMesh(allenGeo, matRedAnodized, `Bank${bankNum}_Oil_Gallery_Plug`, 0.33, posY * 0.5, 0.16);
    galleryPlug.rotation.z = -Math.PI / 2;
    blockGroup.add(galleryPlug);

    blockGroup.add(namedMesh(new THREE.BoxGeometry(0.10, 0.05, 0.16), matCastAluminum, `Engine_Mount_Boss_${bank === 1 ? "LH" : "RH"}`, bank * 0.36, posY * 1.6, 0.04));
  }

  const cylRadius = 0.044;
  const cylHeight = 0.18;
  const numCylsPerBank = 6;
  const cylPitch = 0.54 / (numCylsPerBank - 1);

  for (let i = 0; i < numCylsPerBank; i++) {
    const cx = -0.27 + i * cylPitch;

    const b1BoreGeo = new THREE.CylinderGeometry(cylRadius, cylRadius, cylHeight, 40, 1, true);
    const b1BoreMesh = namedMesh(b1BoreGeo, matMachinedDeck, `Bank1_Nikasil_Cylinder_Bore_${i + 1}`, cx, 0.11, 0.22);
    b1BoreMesh.rotation.x = THREE.MathUtils.degToRad(-30);
    blockGroup.add(b1BoreMesh);

    const b2BoreGeo = new THREE.CylinderGeometry(cylRadius, cylRadius, cylHeight, 40, 1, true);
    const b2BoreMesh = namedMesh(b2BoreGeo, matMachinedDeck, `Bank2_Nikasil_Cylinder_Bore_${i + 1}`, cx + 0.015, -0.11, 0.22);
    b2BoreMesh.rotation.x = THREE.MathUtils.degToRad(30);
    blockGroup.add(b2BoreMesh);
  }

  const dipstickCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.30, 0.05, 0.14),
    new THREE.Vector3(-0.34, 0.14, 0.20),
    new THREE.Vector3(-0.33, 0.26, 0.26),
  ]);
  blockGroup.add(namedMesh(new THREE.TubeGeometry(dipstickCurve, 16, 0.005, 10), matBraidedSteel, "Dipstick_Guide_Tube"));
  blockGroup.add(namedMesh(createKnurledBand(0.014, 0.012, 24), matRedAnodized, "Dipstick_THandle_Cap", -0.33, 0.27, 0.26));

  engineRoot.add(blockGroup);

  // ══════════════════════════════════════════════════════════
  // ─── 02. CRANKSHAFT, CONNECTING RODS & FORGED PISTONS ───
  // ══════════════════════════════════════════════════════════
  const rotatingAssembly = new THREE.Group();
  rotatingAssembly.name = "02_Crankshaft_Pistons_Rods";

  const crankShaftGeo = new THREE.CylinderGeometry(0.034, 0.034, 0.68, 32);
  crankShaftGeo.rotateZ(Math.PI / 2);
  rotatingAssembly.add(namedMesh(crankShaftGeo, matNitridedCrank, "Crankshaft_Main_Shaft", 0, 0, 0.05));

  const pistonRingGeo = new THREE.TorusGeometry(0.0435, 0.0011, 8, 40);
  pistonRingGeo.rotateX(Math.PI / 2);
  const rodBeamGeo = new THREE.CylinderGeometry(0.012, 0.016, 0.14, 20);
  const rodBigEndGeo = new THREE.TorusGeometry(0.019, 0.007, 12, 24);
  rodBigEndGeo.rotateY(Math.PI / 2);
  const pistonGeoShared = new THREE.CylinderGeometry(0.043, 0.043, 0.045, 32);
  const crankpinGeo = new THREE.CylinderGeometry(0.021, 0.021, 0.032, 24);
  crankpinGeo.rotateZ(Math.PI / 2);

  for (let i = 0; i < 6; i++) {
    const mx = -0.27 + i * 0.108;
    const throwDir = i % 2 === 0 ? 1 : -1;
    const pinZ = 0.05 + throwDir * 0.038;

    const lobeGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.018, 28);
    lobeGeo.rotateZ(Math.PI / 2);
    rotatingAssembly.add(namedMesh(lobeGeo, matNitridedCrank, `Counterweight_Web_${i + 1}`, mx, 0, 0.05));
    rotatingAssembly.add(namedMesh(crankpinGeo, matNitridedCrank, `Crankpin_Journal_${i + 1}`, mx, 0, pinZ));

    for (const bankSide of [-1, 1]) {
      const bankRotX = bankSide === 1 ? THREE.MathUtils.degToRad(-30) : THREE.MathUtils.degToRad(30);
      const tag = `${i * 2 + (bankSide > 0 ? 1 : 2)}`;
      const px = mx + (bankSide === 1 ? 0 : 0.015);
      const py = Math.sin(rodAngleFor(bankSide)) * 0.15;
      const pz = 0.05 + Math.cos(rodAngleFor(bankSide)) * 0.15;

      const pistonMesh = namedMesh(pistonGeoShared, matMachinedDeck, `Forged_Piston_${tag}`, px, py, pz);
      pistonMesh.rotation.x = bankRotX;
      rotatingAssembly.add(pistonMesh);

      const ringOff = 0.016;
      const ringTop = namedMesh(pistonRingGeo, matNitridedCrank, `Piston_Ring_Pack_${tag}`, px, py + Math.cos(bankRotX) * ringOff, pz + Math.sin(bankRotX) * ringOff);
      ringTop.rotation.x = bankRotX;
      rotatingAssembly.add(ringTop);

      const rodMesh = namedMesh(rodBeamGeo, matMachinedDeck, `ConnectingRod_Beam_${tag}`, px, py * 0.55, pz * 0.62 + 0.02);
      rodMesh.rotation.x = bankRotX;
      rotatingAssembly.add(rodMesh);

      const bigEnd = namedMesh(rodBigEndGeo, matMachinedDeck, `Rod_BigEnd_Cap_${tag}`, px, 0, pinZ);
      rotatingAssembly.add(bigEnd);
    }
  }

  engineRoot.add(rotatingAssembly);

  function rodAngleFor(bankSide: number): number {
    return bankSide === 1 ? -0.52 : 0.52;
  }

  // ══════════════════════════════════════════════════════════
  // ─── 03. BILLET LOW-PROFILE DRY-SUMP SCAVENGE OIL PAN ───
  // ══════════════════════════════════════════════════════════
  const drySumpGroup = new THREE.Group();
  drySumpGroup.name = "03_Dry_Sump_Lubrication";
  drySumpGroup.position.set(0, 0, -expZ);

  drySumpGroup.add(namedMesh(new THREE.BoxGeometry(0.66, 0.30, 0.06), matCastAluminum, "Scavenge_Pan_Trough", 0, 0, -0.03));
  drySumpGroup.add(namedMesh(new THREE.BoxGeometry(0.50, 0.02, 0.038), matTitaniumShield, "Pickup_Mesh_Screen_Window", 0, -0.155, -0.03));

  for (let i = 0; i < 4; i++) {
    const px = -0.22 + i * 0.15;
    const anFittingGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.025, 16);
    anFittingGeo.rotateX(Math.PI / 2);
    drySumpGroup.add(namedMesh(anFittingGeo, matGoldAnodized, `AN12_Scavenge_Port_Boss_${i + 1}`, px, 0.16, -0.03));

    const tubeCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(px, 0.17, -0.03),
      new THREE.Vector3(px + 0.03, 0.22, -0.04),
      new THREE.Vector3(0.28, 0.20, -0.02),
    ]);
    drySumpGroup.add(namedMesh(new THREE.TubeGeometry(tubeCurve, 20, 0.008, 12), matBraidedSteel, `Scavenge_Hardline_${i + 1}`));
  }

  drySumpGroup.add(namedMesh(new THREE.CylinderGeometry(0.065, 0.065, 0.24, 28), matMachinedDeck, "Deaeration_Reservoir_Tank", -0.28, -0.22, 0.08));
  drySumpGroup.add(namedMesh(createKnurledBand(0.066, 0.014, 40), matRedAnodized, "Tank_Knurled_Filler_Cap", -0.28, -0.35, 0.08));
  drySumpGroup.add(namedMesh(new THREE.CylinderGeometry(0.042, 0.042, 0.10, 24), matCobaltAnodized, "SpinOn_Oil_Filter_Canister", -0.28, -0.22, -0.07));

  for (let s = 0; s < 3; s++) {
    const stage = namedMesh(new THREE.CylinderGeometry(0.038, 0.038, 0.028, 20), matCastAluminum, `Scavenge_Pump_Stage_${s + 1}`, 0.24, -0.10 + s * 0.034, -0.05);
    stage.rotation.z = Math.PI / 2;
    drySumpGroup.add(stage);
  }
  const pumpDrive = namedMesh(new THREE.CylinderGeometry(0.008, 0.008, 0.06, 12), matNitridedCrank, "Scavenge_Pump_Drive_Shaft", 0.30, -0.066, -0.05);
  pumpDrive.rotation.z = Math.PI / 2;
  drySumpGroup.add(pumpDrive);
  drySumpGroup.add(namedMesh(new THREE.CylinderGeometry(0.010, 0.012, 0.028, 12), matSensorGray, "Oil_Pressure_Transducer", 0.10, 0.17, -0.03));

  engineRoot.add(drySumpGroup);

  // ══════════════════════════════════════════════════════════
  // ─── 04. DUAL DOHC 48-VALVE CYLINDER HEADS ───
  // ══════════════════════════════════════════════════════════
  const cylinderHeadsGroup = new THREE.Group();
  cylinderHeadsGroup.name = "04_Cylinder_Heads_Valvetrain";
  cylinderHeadsGroup.position.set(0, 0, expZ * 0.5);

  const headStudGeo = new THREE.CylinderGeometry(0.0055, 0.0055, 0.05, 10);
  const camLobeGeo = new THREE.SphereGeometry(0.021, 16, 12);

  for (const bankSide of [-1, 1]) {
    const bankLabel = bankSide === 1 ? "Left" : "Right";
    const bankRot = bankSide === 1 ? THREE.MathUtils.degToRad(-30) : THREE.MathUtils.degToRad(30);
    const posY = bankSide * 0.18;

    const headMesh = namedMesh(new THREE.BoxGeometry(0.62, 0.16, 0.10), matMachinedDeck, `Cylinder_Head_${bankLabel}`, 0, posY, 0.32);
    headMesh.rotation.x = bankRot;
    cylinderHeadsGroup.add(headMesh);

    for (let sIdx = 0; sIdx < 7; sIdx++) {
      const sx = -0.27 + sIdx * 0.09;
      const stud = namedMesh(headStudGeo, matNitridedCrank, `Head_Stud_${bankLabel}_${sIdx + 1}`, sx, posY + Math.cos(bankRot) * 0.088, 0.32 + Math.sin(bankRot) * 0.088);
      stud.rotation.x = bankRot;
      cylinderHeadsGroup.add(stud);
    }

    for (let camIdx = 0; camIdx < 2; camIdx++) {
      const camOffset = camIdx === 0 ? -0.04 : 0.04;
      const camType = camIdx === 0 ? "Intake" : "Exhaust";
      const cy = posY + camOffset * Math.cos(bankRot);
      const cz = 0.35 + camOffset * Math.sin(bankRot);

      const camShaftGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.60, 24);
      camShaftGeo.rotateZ(Math.PI / 2);
      cylinderHeadsGroup.add(namedMesh(camShaftGeo, matMachinedDeck, `Camshaft_${camType}_${bankLabel}`, 0, cy, cz));

      for (let l = 0; l < 12; l++) {
        const lx = -0.27 + l * (0.54 / 11);
        const lobe = namedMesh(camLobeGeo, matNitridedCrank, `Cam_Lobe_${camType}_${bankLabel}_${l + 1}`, lx, cy, cz);
        lobe.scale.set(0.55, 1.0, 0.75);
        lobe.rotation.x = l * 0.6;
        cylinderHeadsGroup.add(lobe);
      }

      const sprocketGeo = new THREE.CylinderGeometry(0.042, 0.042, 0.012, 28);
      sprocketGeo.rotateZ(Math.PI / 2);
      cylinderHeadsGroup.add(namedMesh(sprocketGeo, matGoldAnodized, `Timing_Sprocket_${camType}_${bankLabel}`, -0.31, cy, cz));

      const sprocketTeeth = namedMesh(createKnurledBand(0.043, 0.010, 32), matGoldAnodized, `Sprocket_ToothRing_${camType}_${bankLabel}`, -0.31, cy, cz);
      sprocketTeeth.rotation.z = Math.PI / 2;
      cylinderHeadsGroup.add(sprocketTeeth);
    }
  }

  const chainPtsL = [
    new THREE.Vector3(-0.31, 0.105, 0.315),
    new THREE.Vector3(-0.31, 0.02, 0.235),
    new THREE.Vector3(-0.31, -0.105, 0.315),
  ];
  const chainPtsR = chainPtsL.map((p) => new THREE.Vector3(-p.x, p.y, p.z));
  cylinderHeadsGroup.add(namedMesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(chainPtsL), 16, 0.006, 8), matNitridedCrank, "Timing_Chain_Run_Left"));
  cylinderHeadsGroup.add(namedMesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(chainPtsR), 16, 0.006, 8), matNitridedCrank, "Timing_Chain_Run_Right"));

  engineRoot.add(cylinderHeadsGroup);

  // ══════════════════════════════════════════════════════════
  // ─── 05. ANODIZED VALVE COVERS WITH COIL-ON-PLUG ───
  // ══════════════════════════════════════════════════════════
  const valveCoversGroup = new THREE.Group();
  valveCoversGroup.name = "05_Anodized_Valve_Covers";
  valveCoversGroup.position.set(0, 0, expZ * 0.8);

  for (const bankSide of [-1, 1]) {
    const bankLabel = bankSide === 1 ? "Left" : "Right";
    const bankRot = bankSide === 1 ? THREE.MathUtils.degToRad(-30) : THREE.MathUtils.degToRad(30);
    const posY = bankSide * 0.22;

    const coverMesh = namedMesh(new THREE.BoxGeometry(0.60, 0.15, 0.08), matRossoCorsa, `Valve_Cover_${bankLabel}`, 0, posY, 0.39);
    coverMesh.rotation.x = bankRot;
    valveCoversGroup.add(coverMesh);

    for (let rx = 0; rx < 5; rx++) {
      const ox = (rx - 2) * 0.12;
      const rib = namedMesh(new THREE.BoxGeometry(0.012, 0.016, 0.06), matMachinedDeck, `Cover_Rib_${bankLabel}_${rx + 1}`, ox, posY + Math.cos(bankRot) * 0.082, 0.39 + Math.sin(bankRot) * 0.082);
      rib.rotation.x = bankRot;
      valveCoversGroup.add(rib);
    }

    const badgePlate = namedMesh(new THREE.BoxGeometry(0.14, 0.006, 0.036), matBlackPolymer, `V12_Badge_Plate_${bankLabel}`, 0.0, posY + Math.cos(bankRot) * 0.088, 0.39 + Math.sin(bankRot) * 0.088);
    badgePlate.rotation.x = bankRot;
    valveCoversGroup.add(badgePlate);

    const badgeGeo = buildStrokeLettering("APEX V12", 0.016, 0.6, 0.0025, 0.12);
    const badgeTextMesh = namedMesh(badgeGeo, matMachinedDeck, `Badge_Lettering_${bankLabel}`, 0.0, posY + Math.cos(bankRot) * 0.092, 0.39 + Math.sin(bankRot) * 0.092);
    badgeTextMesh.rotation.x = bankRot;
    valveCoversGroup.add(badgeTextMesh);

    for (let b = 0; b < 8; b++) {
      const bx = -0.27 + b * (0.54 / 7);
      const bolt = namedMesh(bolt12Geo, matMachinedDeck, `Cover_Fastener_12pt_${bankLabel}_${b + 1}`, bx, posY + Math.cos(bankRot) * 0.092, 0.39 + Math.sin(bankRot) * 0.092);
      bolt.rotation.x = bankRot;
      valveCoversGroup.add(bolt);
    }

    for (let i = 0; i < 6; i++) {
      const px = -0.25 + i * (0.50 / 5) + (bankSide === 1 ? 0 : 0.015);
      const plug = namedMesh(new THREE.CylinderGeometry(0.012, 0.012, 0.04, 16), matBlackPolymer, `Spark_Plug_Well_Tube_${bankLabel}_${i + 1}`, px, posY + Math.cos(bankRot) * 0.05, 0.42 + Math.sin(bankRot) * 0.05);
      plug.rotation.x = bankRot;
      valveCoversGroup.add(plug);
    }
  }

  valveCoversGroup.add(namedMesh(createKnurledBand(0.026, 0.016, 36), matRedAnodized, "Oil_Filler_Cap_Knurled", -0.20, 0.305, 0.44));

  engineRoot.add(valveCoversGroup);

  // ══════════════════════════════════════════════════════════
  // ─── 06. EQUAL-LENGTH CERAMIC ITB RUNNERS & VELOCITY STACKS ───
  // ══════════════════════════════════════════════════════════
  const intakeGroup = new THREE.Group();
  intakeGroup.name = "06_ITB_Intake_Velocity_Stacks";
  intakeGroup.position.set(0, 0, expZ * 1.2);

  const bellmouthProfile: THREE.Vector2[] = [];
  for (let p = 0; p <= 8; p++) {
    const t = p / 8;
    bellmouthProfile.push(new THREE.Vector2(0.022 + 0.013 * t * t, t * 0.06 - 0.03));
  }
  const stackLatheGeo = new THREE.LatheGeometry(bellmouthProfile, 28);

  const butterflyGeo = new THREE.CylinderGeometry(0.020, 0.020, 0.003, 16);
  const spindleGeo = new THREE.CylinderGeometry(0.0022, 0.0022, 0.048, 8);
  spindleGeo.rotateX(Math.PI / 2);
  const injectorBodyGeo = new THREE.CylinderGeometry(0.0075, 0.009, 0.048, 14);

  for (let i = 0; i < 6; i++) {
    const cx = -0.25 + i * (0.50 / 5);

    const b1Curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(cx, 0.12, 0.36),
      new THREE.Vector3(cx, 0.15, 0.43),
      new THREE.Vector3(cx, 0.08, 0.50),
    ]);
    intakeGroup.add(namedMesh(new THREE.TubeGeometry(b1Curve, 24, 0.020, 18), matCeramicIntake, `Intake_Runner_Left_${i + 1}`));
    intakeGroup.add(namedMesh(stackLatheGeo, matCobaltAnodized, `Velocity_Stack_Bellmouth_Left_${i + 1}`, cx, 0.08, 0.53));

    const plate1 = namedMesh(butterflyGeo, matPolishedBrass, `Butterfly_Plate_Left_${i + 1}`, cx, 0.08, 0.52);
    plate1.rotation.x = THREE.MathUtils.degToRad(35);
    intakeGroup.add(plate1);
    intakeGroup.add(namedMesh(spindleGeo, matPolishedBrass, `Throttle_Spindle_Left_${i + 1}`, cx, 0.08, 0.52));

    const inj1 = namedMesh(injectorBodyGeo, matSensorGray, `GDI_Fuel_Injector_Left_${i + 1}`, cx, 0.145, 0.40);
    inj1.rotation.x = THREE.MathUtils.degToRad(-20);
    intakeGroup.add(inj1);

    const b2Curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(cx + 0.015, -0.12, 0.36),
      new THREE.Vector3(cx + 0.015, -0.15, 0.43),
      new THREE.Vector3(cx + 0.015, -0.08, 0.50),
    ]);
    intakeGroup.add(namedMesh(new THREE.TubeGeometry(b2Curve, 24, 0.020, 18), matCeramicIntake, `Intake_Runner_Right_${i + 1}`));
    intakeGroup.add(namedMesh(stackLatheGeo, matCobaltAnodized, `Velocity_Stack_Bellmouth_Right_${i + 1}`, cx + 0.015, -0.08, 0.53));

    const plate2 = namedMesh(butterflyGeo, matPolishedBrass, `Butterfly_Plate_Right_${i + 1}`, cx + 0.015, -0.08, 0.52);
    plate2.rotation.x = THREE.MathUtils.degToRad(35);
    intakeGroup.add(plate2);
    intakeGroup.add(namedMesh(spindleGeo, matPolishedBrass, `Throttle_Spindle_Right_${i + 1}`, cx + 0.015, -0.08, 0.52));

    const inj2 = namedMesh(injectorBodyGeo, matSensorGray, `GDI_Fuel_Injector_Right_${i + 1}`, cx + 0.015, -0.145, 0.40);
    inj2.rotation.x = THREE.MathUtils.degToRad(20);
    intakeGroup.add(inj2);

    const lever = namedMesh(new THREE.BoxGeometry(0.006, 0.024, 0.004), matMachinedDeck, `ITB_Throttle_Lever_${i + 1}`, cx + 0.0075, 0.085, 0.52);
    lever.rotation.x = 0.6;
    intakeGroup.add(lever);
  }

  const linkageBar = namedMesh(new THREE.CylinderGeometry(0.004, 0.004, 0.56, 10), matMachinedDeck, "ITB_Throttle_Linkage_Bar", 0, 0.08, 0.525);
  linkageBar.rotation.z = Math.PI / 2;
  intakeGroup.add(linkageBar);

  for (let railIdx = 0; railIdx < 2; railIdx++) {
    const fy = railIdx === 0 ? -0.05 : 0.05;
    const railGeo = new THREE.CylinderGeometry(0.010, 0.010, 0.56, 16);
    railGeo.rotateZ(Math.PI / 2);
    intakeGroup.add(namedMesh(railGeo, matGoldAnodized, `GDI_Fuel_Rail_${railIdx === 0 ? "Lower" : "Upper"}`, 0, fy, 0.46));
  }

  const crossoverCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.28, -0.05, 0.46),
    new THREE.Vector3(0.31, 0.0, 0.46),
    new THREE.Vector3(0.28, 0.05, 0.46),
  ]);
  intakeGroup.add(namedMesh(new THREE.TubeGeometry(crossoverCurve, 14, 0.008, 12), matGoldAnodized, "Fuel_Rail_Crossover_Line"));

  const hpPump = namedMesh(new THREE.CylinderGeometry(0.026, 0.030, 0.075, 20), matMachinedDeck, "Mechanical_HPFP_Drive_Unit", 0.30, 0.0, 0.42);
  hpPump.rotation.z = -Math.PI / 2;
  intakeGroup.add(hpPump);

  const feedLineCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.34, 0.0, 0.42),
    new THREE.Vector3(0.37, 0.04, 0.40),
    new THREE.Vector3(0.36, 0.10, 0.38),
  ]);
  intakeGroup.add(namedMesh(new THREE.TubeGeometry(feedLineCurve, 14, 0.007, 12), matBraidedSteel, "HPFP_Braided_Feed_Line"));

  engineRoot.add(intakeGroup);

  // ══════════════════════════════════════════════════════════
  // ─── 07. 6-INTO-1 HYDROFORMED TITANIUM HEAT-BLUED EXHAUST HEADERS ───
  // ══════════════════════════════════════════════════════════
  const exhaustGroup = new THREE.Group();
  exhaustGroup.name = "07_Titanium_Blued_Exhaust_Headers";
  exhaustGroup.position.set(0, -expY, 0);

  const collectorPt = new THREE.Vector3(0.38, -0.32, 0.12);
  const springWrapGeo = new THREE.TorusGeometry(0.024, 0.0035, 8, 20);

  for (let i = 0; i < 6; i++) {
    const cx = -0.27 + i * 0.108;
    const pipeCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(cx, -0.24, 0.28),
      new THREE.Vector3(cx + 0.04, -0.36, 0.22),
      new THREE.Vector3(cx + (0.38 - cx) * 0.5, -0.35, 0.16),
      collectorPt,
    ]);
    exhaustGroup.add(namedMesh(new THREE.TubeGeometry(pipeCurve, 28, 0.022, 18), matTitaniumBlued, `Header_Primary_Pipe_${i + 1}`));

    for (let w = 0; w < 3; w++) {
      const wp = pipeCurve.getPointAt(0.08 + w * 0.05);
      const wrap = namedMesh(springWrapGeo, matGoldAnodized, `Exhaust_PieCut_Weld_${i + 1}_${w + 1}`, wp.x, wp.y, wp.z);
      wrap.rotation.y = Math.PI / 2;
      wrap.rotation.z = 0.4;
      exhaustGroup.add(wrap);
    }

    const flange = namedMesh(hexGeo, matGoldAnodized, `Header_Exit_FlangeBolt_${i + 1}`, cx, -0.225, 0.285);
    flange.rotation.x = Math.PI / 2;
    exhaustGroup.add(flange);
  }

  const collectorConeGeo = new THREE.CylinderGeometry(0.055, 0.038, 0.12, 28);
  collectorConeGeo.rotateZ(Math.PI / 2);
  exhaustGroup.add(namedMesh(collectorConeGeo, matTitaniumBlued, "Pyramidal_Merge_Collector_Cone", 0.44, -0.32, 0.12));

  const vBandGeo = new THREE.TorusGeometry(0.048, 0.010, 16, 28);
  vBandGeo.rotateY(Math.PI / 2);
  exhaustGroup.add(namedMesh(vBandGeo, matMachinedDeck, "Collector_VBand_Flange_Clamp", 0.50, -0.32, 0.12));

  const lambdaBung = namedMesh(hexGeo, matGoldAnodized, "Lambda_Sensor_Bung", 0.42, -0.27, 0.12);
  lambdaBung.rotation.z = Math.PI / 2;
  exhaustGroup.add(lambdaBung);

  const shieldCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.05, -0.17, 0.30),
    new THREE.Vector3(0.05, -0.23, 0.22),
    new THREE.Vector3(0.05, -0.27, 0.14),
  ]);
  exhaustGroup.add(namedMesh(new THREE.TubeGeometry(shieldCurve, 14, 0.030, 10), matTitaniumShield, "Titanium_Heat_Shield_Panel"));

  engineRoot.add(exhaustGroup);

  // ══════════════════════════════════════════════════════════
  // ─── 08. FRONT RACING RADIATOR & ELECTRIC FAN SHROUD ───
  // ══════════════════════════════════════════════════════════
  const radiatorGroup = new THREE.Group();
  radiatorGroup.name = "08_Front_Radiator_Cooling";
  radiatorGroup.position.set(-0.46 - expX, 0, 0.18);

  radiatorGroup.add(namedMesh(new THREE.BoxGeometry(0.05, 0.52, 0.36), matRadiatorCore, "Brazed_Aluminum_Radiator_Core"));

  for (let tankIdx = 0; tankIdx < 2; tankIdx++) {
    const ty = tankIdx === 0 ? -0.27 : 0.27;
    const endTankGeo = new THREE.CylinderGeometry(0.030, 0.030, 0.36, 20);
    endTankGeo.rotateX(Math.PI / 2);
    radiatorGroup.add(namedMesh(endTankGeo, matCastAluminum, `DieFormed_End_Tank_${tankIdx === 0 ? "Lower" : "Upper"}`, 0, ty, 0));
  }

  for (let rz = 0; rz < 2; rz++) {
    const oz = rz === 0 ? -0.185 : 0.185;
    radiatorGroup.add(namedMesh(new THREE.BoxGeometry(0.06, 0.53, 0.012), matCastAluminum, `Core_Side_Rail_${rz === 0 ? "Front" : "Rear"}`, 0, 0, oz));
  }

  radiatorGroup.add(namedMesh(new THREE.CylinderGeometry(0.020, 0.022, 0.035, 16), matCastAluminum, "Filler_Neck_Stub", 0, 0.285, 0.05));
  radiatorGroup.add(namedMesh(createKnurledBand(0.024, 0.014, 30), matGoldAnodized, "Pressure_Cap_Knurled", 0, 0.315, 0.05));

  const fanShroudGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.04, 36);
  fanShroudGeo.rotateZ(Math.PI / 2);
  radiatorGroup.add(namedMesh(fanShroudGeo, matBlackPolymer, "Electric_Fan_Shroud_Ring", 0.04, 0, 0));

  const hubDome = namedMesh(new THREE.SphereGeometry(0.030, 20, 14), matBlackPolymer, "Fan_Hub_Dome", 0.055, 0, 0);
  hubDome.scale.set(0.6, 1, 1);
  radiatorGroup.add(hubDome);

  const fanBladeGeo = new THREE.BoxGeometry(0.006, 0.115, 0.055);
  for (let b = 0; b < 7; b++) {
    const pivot = new THREE.Group();
    pivot.name = `Cooling_Fan_Blade_Assembly_${b + 1}`;
    pivot.position.set(0.05, 0, 0);
    pivot.rotation.x = (b * Math.PI * 2) / 7;

    const vane = new THREE.Mesh(fanBladeGeo, matFanBlade);
    vane.name = `Fan_Blade_Vane_${b + 1}`;
    vane.position.y = 0.075;
    vane.rotation.y = 0.4;
    pivot.add(vane);
    radiatorGroup.add(pivot);
  }

  for (let bi = 0; bi < 2; bi++) {
    radiatorGroup.add(namedMesh(new THREE.BoxGeometry(0.012, 0.03, 0.10), matCastAluminum, `Radiator_Mount_Bracket_${bi === 0 ? "Lower" : "Upper"}`, -0.02, bi === 0 ? -0.275 : 0.275, 0.0));
  }

  const hoseCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.24, -0.12),
    new THREE.Vector3(0.12, 0.26, -0.10),
    new THREE.Vector3(0.18, 0.18, -0.05),
  ]);
  radiatorGroup.add(namedMesh(new THREE.TubeGeometry(hoseCurve, 20, 0.024, 16), matBlueSilicone, "Upper_Silicone_Coolant_Hose"));

  const lowerHoseCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, -0.24, -0.12),
    new THREE.Vector3(0.11, -0.27, -0.10),
    new THREE.Vector3(0.18, -0.20, -0.05),
  ]);
  radiatorGroup.add(namedMesh(new THREE.TubeGeometry(lowerHoseCurve, 20, 0.024, 16), matBlueSilicone, "Lower_Silicone_Coolant_Hose"));

  const hoseClampGeo = new THREE.TorusGeometry(0.0265, 0.0028, 8, 22);
  const clampSpots: Array<[number, number, number, string]> = [
    [0.035, 0.255, -0.105, "Upper_Hose_Clamp_Near"],
    [0.165, 0.205, -0.062, "Upper_Hose_Clamp_Far"],
    [0.035, -0.255, -0.105, "Lower_Hose_Clamp_Near"],
  ];
  for (const [hx, hy, hz, cname] of clampSpots) {
    const clamp = namedMesh(hoseClampGeo, matBraidedSteel, cname, hx, hy, hz);
    clamp.rotation.y = 1.1;
    radiatorGroup.add(clamp);
  }

  radiatorGroup.add(namedMesh(new THREE.CylinderGeometry(0.045, 0.045, 0.16, 20), matBlueSilicone, "Coolant_Expansion_Tank", 0.10, 0.34, -0.02));
  radiatorGroup.add(namedMesh(createKnurledBand(0.046, 0.014, 32), matGoldAnodized, "Expansion_Tank_Pressure_Cap", 0.10, 0.43, -0.02));
  radiatorGroup.add(namedMesh(new THREE.CylinderGeometry(0.005, 0.005, 0.10, 8), matRubberBlack, "Overflow_Breather_Tube", 0.10, 0.47, 0.02));

  engineRoot.add(radiatorGroup);

  // ══════════════════════════════════════════════════════════
  // ─── 09. CLUTCH, BELLHOUSING & 7-SPEED SEQUENTIAL TRANSAXLE ───
  // ══════════════════════════════════════════════════════════
  const transaxleGroup = new THREE.Group();
  transaxleGroup.name = "09_7Speed_Sequential_Transaxle";
  transaxleGroup.position.set(0.38 + expX, 0, 0.08);

  const flywheelGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.025, 40);
  flywheelGeo.rotateZ(Math.PI / 2);
  transaxleGroup.add(namedMesh(flywheelGeo, matMachinedDeck, "Flywheel_Mass", 0.02, 0, 0));

  const ringGear = namedMesh(createKnurledBand(0.142, 0.020, 56), matNitridedCrank, "Starter_Ring_Gear", 0.02, 0, 0);
  ringGear.rotation.z = Math.PI / 2;
  transaxleGroup.add(ringGear);

  const clutchDiscGeo = new THREE.CylinderGeometry(0.105, 0.105, 0.014, 36);
  clutchDiscGeo.rotateZ(Math.PI / 2);
  transaxleGroup.add(namedMesh(clutchDiscGeo, matRedAnodized, "TwinPlate_Clutch_Disc_1", 0.045, 0, 0));
  transaxleGroup.add(namedMesh(clutchDiscGeo, matRedAnodized, "TwinPlate_Clutch_Disc_2", 0.062, 0, 0));

  const bellGeo = new THREE.CylinderGeometry(0.12, 0.16, 0.14, 36);
  bellGeo.rotateZ(Math.PI / 2);
  transaxleGroup.add(namedMesh(bellGeo, matCastAluminum, "Conical_DieCast_Bellhousing", 0.09, 0, 0));

  transaxleGroup.add(namedMesh(new THREE.CylinderGeometry(0.038, 0.038, 0.12, 20), matBlackPolymer, "Starter_Motor_Barrel", 0.08, 0.16, -0.04));

  const starterSol = namedMesh(new THREE.CylinderGeometry(0.020, 0.020, 0.06, 14), matSensorGray, "Starter_Solenoid_Piggyback", 0.08, 0.20, -0.04);
  starterSol.rotation.x = Math.PI / 2;
  transaxleGroup.add(starterSol);

  transaxleGroup.add(namedMesh(new THREE.BoxGeometry(0.38, 0.24, 0.22), matTransaxleCast, "Sequential_Gearbox_Main_Casing", 0.33, 0, 0));
  transaxleGroup.add(namedMesh(new THREE.BoxGeometry(0.34, 0.015, 0.18), matTransaxleCast, "Casting_Top_Surface_Plate", 0.33, 0.128, 0));

  for (let r = 0; r < 4; r++) {
    transaxleGroup.add(namedMesh(new THREE.BoxGeometry(0.015, 0.245, 0.02), matTransaxleCast, `Casing_Casting_Rib_${r + 1}`, 0.20 + r * 0.085, 0, 0.112));
  }

  transaxleGroup.add(namedMesh(new THREE.BoxGeometry(0.10, 0.07, 0.12), matBlackPolymer, "Pneumatic_Shift_Actuator_Unit", 0.30, 0.165, 0));

  for (let pi = 0; pi < 2; pi++) {
    const pz = pi === 0 ? -0.065 : 0.065;
    transaxleGroup.add(namedMesh(new THREE.CylinderGeometry(0.010, 0.010, 0.02, 12), matCobaltAnodized, `Actuator_Connection_Port_${pi === 0 ? "LH" : "RH"}`, 0.30, 0.165, pz));
  }

  const gearSensor = namedMesh(new THREE.CylinderGeometry(0.011, 0.013, 0.03, 12), matSensorGray, "Gear_Position_Sensor", 0.44, 0.06, 0.06);
  gearSensor.rotation.z = -Math.PI / 2;
  transaxleGroup.add(gearSensor);

  for (let ci = 0; ci < 2; ci++) {
    const side = ci === 0 ? -1 : 1;
    const coolerPort = namedMesh(hexGeo, matGoldAnodized, `Gearbox_OilCooler_Port_${ci === 0 ? "In" : "Out"}`, 0.33, side * 0.125, -0.06);
    coolerPort.rotation.x = (side * Math.PI) / 2;
    transaxleGroup.add(coolerPort);
  }

  const cvFlangeGeo = new THREE.CylinderGeometry(0.052, 0.052, 0.03, 24);
  cvFlangeGeo.rotateX(Math.PI / 2);
  const cvAxleGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.22, 16);
  cvAxleGeo.rotateX(Math.PI / 2);
  const cvBootGeo = new THREE.ConeGeometry(0.034, 0.06, 18, 1, true);
  cvBootGeo.rotateX(-Math.PI / 2);

  for (let ai = 0; ai < 2; ai++) {
    const ay = ai === 0 ? -0.14 : 0.14;
    const tag = ai === 0 ? "LH" : "RH";
    const outerY = ay + (ay > 0 ? 0.12 : -0.12);

    transaxleGroup.add(namedMesh(cvFlangeGeo, matMachinedDeck, `CV_Drive_Flange_${tag}`, 0.36, ay, -0.02));
    transaxleGroup.add(namedMesh(cvAxleGeo, matNitridedCrank, `CV_Axle_HalfShaft_${tag}`, 0.36, outerY, -0.02));
    transaxleGroup.add(namedMesh(cvBootGeo, matRubberBlack, `CV_Joint_Conical_Boot_${tag}`, 0.36, outerY + (ay > 0 ? 0.045 : -0.045), -0.02));
  }

  transaxleGroup.add(namedMesh(new THREE.CylinderGeometry(0.006, 0.006, 0.03, 8), matBraidedSteel, "Diff_Breather_Fitting", 0.40, 0.135, 0.05));

  engineRoot.add(transaxleGroup);

  // ══════════════════════════════════════════════════════════
  // ─── 10. HYPERCAR DRY-CARBON MONOCOQUE ENGINE COVER ───
  // ══════════════════════════════════════════════════════════
  const coverGroup = new THREE.Group();
  coverGroup.name = "10_Dry_Carbon_Engine_Cover";
  coverGroup.position.set(0, 0, 0.54 + expZ * 1.6);

  coverGroup.add(namedMesh(new THREE.BoxGeometry(0.62, 0.36, 0.025), matCarbonFiber, "Carbon_Monocoque_Shroud_Plate"));

  const pontoonGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.62, 28);
  pontoonGeo.rotateZ(Math.PI / 2);
  coverGroup.add(namedMesh(pontoonGeo, matCarbonFiber, "Arched_Shoulder_Pontoon_LH", 0, -0.17, -0.02));
  coverGroup.add(namedMesh(pontoonGeo, matCarbonFiber, "Arched_Shoulder_Pontoon_RH", 0, 0.17, -0.02));

  coverGroup.add(namedMesh(new THREE.BoxGeometry(0.52, 0.22, 0.015), matGoldAnodized, "Billet_Perimeter_Raised_Bezel_Frame", 0, 0, 0.018));
  coverGroup.add(namedMesh(new THREE.BoxGeometry(0.48, 0.18, 0.008), matQuartzGlass, "Quartz_ITB_Inspection_Window", 0, 0, 0.024));

  // Gold 3D Stroke Lettering Badge "APEX V12" on Engine Cover
  const coverBadgeGeo = buildStrokeLettering("APEX V12", 0.022, 0.62, 0.003, 0.14);
  const coverBadgeMesh = namedMesh(coverBadgeGeo, matGoldAnodized, "Cover_Gold_Apex_V12_Badge", 0, -0.12, 0.026);
  coverGroup.add(coverBadgeMesh);

  const dzusSpots: Array<[number, number]> = [
    [-0.235, -0.08],
    [-0.235, 0.08],
    [0.235, -0.08],
    [0.235, 0.08],
    [-0.10, -0.098],
    [0.10, -0.098],
  ];
  for (let d = 0; d < dzusSpots.length; d++) {
    const [dx, dy] = dzusSpots[d];
    const dzus = namedMesh(allenGeo, matTitaniumShield, `Dzus_QuarterTurn_Fastener_${d + 1}`, dx, dy, 0.026);
    dzus.rotation.x = Math.PI / 2;
    coverGroup.add(dzus);
  }

  const scoopGeo = new THREE.ConeGeometry(0.08, 0.18, 28);
  scoopGeo.rotateZ(Math.PI / 2);
  coverGroup.add(namedMesh(scoopGeo, matCarbonFiber, "RamAir_Teardrop_Induction_Scoop", -0.35, 0, 0.04));

  const ductCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.30, 0, 0.04),
    new THREE.Vector3(-0.20, 0, 0.03),
    new THREE.Vector3(-0.12, 0, 0.02),
  ]);
  coverGroup.add(namedMesh(new THREE.TubeGeometry(ductCurve, 12, 0.045, 16), matBlackPolymer, "RamAir_Interior_Duct"));

  coverGroup.add(namedMesh(new THREE.BoxGeometry(0.05, 0.03, 0.035), matTitaniumShield, "Cover_Hinge_LH", -0.28, 0.165, -0.01));
  coverGroup.add(namedMesh(new THREE.BoxGeometry(0.05, 0.03, 0.035), matTitaniumShield, "Cover_Hinge_RH", 0.28, 0.165, -0.01));

  engineRoot.add(coverGroup);

  // ══════════════════════════════════════════════════════════
  // ─── 11. FRONT ACCESSORY DRIVE (SERPENTINE BELT, ALTERNATOR) ───
  // ══════════════════════════════════════════════════════════
  const accessoryGroup = new THREE.Group();
  accessoryGroup.name = "11_Front_Accessory_Drive";
  accessoryGroup.position.set(-0.36 - expX * 0.5, 0, 0.05);

  const pulleyGeo = new THREE.CylinderGeometry(0.052, 0.052, 0.024, 28);
  pulleyGeo.rotateZ(Math.PI / 2);
  accessoryGroup.add(namedMesh(pulleyGeo, matNitridedCrank, "Crank_Nose_Damper_Pulley", 0.02, 0, 0));

  const grooveGeo = createKnurledBand(0.0525, 0.006, 40);
  for (let g = 0; g < 2; g++) {
    const groove = namedMesh(grooveGeo, matBlackPolymer, `Crank_Pulley_BeltGroove_${g === 0 ? "A" : "B"}`, 0.02 + (g === 0 ? -0.008 : 0.008), 0, 0);
    groove.rotation.z = Math.PI / 2;
    accessoryGroup.add(groove);
  }

  const altBody = namedMesh(new THREE.CylinderGeometry(0.058, 0.058, 0.13, 26), matBlackPolymer, "Alternator_Main_Barrel", -0.02, 0.17, 0);
  altBody.rotation.z = Math.PI / 2;
  accessoryGroup.add(altBody);

  const altFinGeo = new THREE.BoxGeometry(0.12, 0.008, 0.008);
  for (let f = 0; f < 8; f++) {
    const ang = (f * Math.PI) / 4;
    const fin = namedMesh(altFinGeo, matCastAluminum, `Alternator_CoolingFin_${f + 1}`, -0.02, Math.cos(ang) * 0.062, Math.sin(ang) * 0.062);
    fin.rotation.x = ang;
    accessoryGroup.add(fin);
  }

  accessoryGroup.add(namedMesh(pulleyGeo, matMachinedDeck, "Alternator_Clutch_Pulley", 0.075, 0.17, 0));

  const tensionerArm = namedMesh(new THREE.BoxGeometry(0.024, 0.13, 0.03), matCastAluminum, "Belt_Tensioner_Arm", 0.0, -0.13, 0.015);
  tensionerArm.rotation.x = -0.5;
  accessoryGroup.add(tensionerArm);
  accessoryGroup.add(namedMesh(pulleyGeo, matMachinedDeck, "Tensioner_Idler_Pulley", 0.02, -0.19, 0.04));
  accessoryGroup.add(namedMesh(pulleyGeo, matMachinedDeck, "Fixed_Idler_Pulley", -0.02, -0.17, -0.03));

  const beltPath = new THREE.CatmullRomCurve3(
    [
      new THREE.Vector3(0.045, 0.0, 0.0),
      new THREE.Vector3(0.06, 0.09, 0.0),
      new THREE.Vector3(0.075, 0.17, 0.0),
      new THREE.Vector3(0.03, 0.215, 0.0),
      new THREE.Vector3(-0.03, 0.19, 0.0),
      new THREE.Vector3(-0.045, 0.0, 0.0),
      new THREE.Vector3(-0.05, -0.12, -0.01),
      new THREE.Vector3(-0.02, -0.175, -0.03),
      new THREE.Vector3(0.02, -0.195, 0.03),
      new THREE.Vector3(0.045, -0.08, 0.0),
    ],
    true
  );
  const belt = namedMesh(new THREE.TubeGeometry(beltPath, 64, 0.007, 8), matRubberBlack, "Serpentine_Drive_Belt");
  belt.scale.set(1, 1, 0.45);
  accessoryGroup.add(belt);

  accessoryGroup.add(namedMesh(new THREE.CylinderGeometry(0.006, 0.006, 0.02, 10), matPolishedBrass, "Alternator_Output_Stud", 0.02, 0.21, 0.03));
  accessoryGroup.add(namedMesh(new THREE.ConeGeometry(0.012, 0.02, 12), matRedAnodized, "Alternator_Stud_InsulatorBoot", 0.02, 0.225, 0.03));

  engineRoot.add(accessoryGroup);

  // ══════════════════════════════════════════════════════════
  // ─── 12. IGNITION COILS & WIRING HARNESS LOOM ───
  // ══════════════════════════════════════════════════════════
  const ignitionGroup = new THREE.Group();
  ignitionGroup.name = "12_Ignition_Wiring_Harness";
  ignitionGroup.position.set(0, expY * 1.2, expZ * 0.9);

  const coilBodyGeo = new THREE.CylinderGeometry(0.014, 0.016, 0.045, 16);
  const coilBootGeo = new THREE.CylinderGeometry(0.008, 0.010, 0.022, 12);
  const coilConnGeo = new THREE.BoxGeometry(0.016, 0.010, 0.012);

  for (let i = 0; i < 6; i++) {
    const px = -0.25 + i * (0.50 / 5);

    for (const bankSide of [-1, 1]) {
      const tag = bankSide === 1 ? "Left" : "Right";
      const bankRot = bankSide === 1 ? THREE.MathUtils.degToRad(-30) : THREE.MathUtils.degToRad(30);
      const posY = bankSide * 0.30;
      const ox = bankSide === 1 ? 0 : 0.015;

      const coil = namedMesh(coilBodyGeo, matBlackPolymer, `Ignition_Coil_${tag}_${i + 1}`, px + ox, posY, 0.435);
      coil.rotation.x = bankRot;
      ignitionGroup.add(coil);

      const boot = namedMesh(coilBootGeo, matOrangeHighVoltage, `Coil_Silicone_Boot_${tag}_${i + 1}`, px + ox, posY + Math.cos(bankRot) * -0.028, 0.435 + Math.sin(bankRot) * -0.028);
      boot.rotation.x = bankRot;
      ignitionGroup.add(boot);

      const conn = namedMesh(coilConnGeo, matCobaltAnodized, `Coil_Connector_${tag}_${i + 1}`, px + ox, posY + Math.cos(bankRot) * 0.03, 0.435 + Math.sin(bankRot) * 0.03);
      conn.rotation.x = bankRot;
      ignitionGroup.add(conn);
    }
  }

  const harnessSpine = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.32, 0.05, 0.40),
    new THREE.Vector3(-0.10, 0.075, 0.415),
    new THREE.Vector3(0.10, 0.075, 0.415),
    new THREE.Vector3(0.30, 0.05, 0.40),
  ]);
  ignitionGroup.add(namedMesh(new THREE.TubeGeometry(harnessSpine, 24, 0.011, 12), matBlackPolymer, "Main_Harness_Loom_Spine"));

  for (let b = 0; b < 6; b++) {
    const bx = -0.25 + b * (0.50 / 5);

    const branchL = new THREE.CatmullRomCurve3([
      new THREE.Vector3(bx, 0.073, 0.415),
      new THREE.Vector3(bx, 0.16, 0.425),
      new THREE.Vector3(bx, 0.27, 0.44),
    ]);
    ignitionGroup.add(namedMesh(new THREE.TubeGeometry(branchL, 12, 0.004, 8), matBlackPolymer, `Coil_Branch_Left_${b + 1}`));

    const branchR = new THREE.CatmullRomCurve3([
      new THREE.Vector3(bx + 0.015, 0.073, 0.415),
      new THREE.Vector3(bx + 0.015, -0.16, 0.425),
      new THREE.Vector3(bx + 0.015, -0.27, 0.44),
    ]);
    ignitionGroup.add(namedMesh(new THREE.TubeGeometry(branchR, 12, 0.004, 8), matBlackPolymer, `Coil_Branch_Right_${b + 1}`));
  }

  const ecuTags = ["ECU_A", "ECU_B", "CHASSIS_GROUND"];
  for (let e = 0; e < 3; e++) {
    const ey = 0.10 - e * 0.04;
    ignitionGroup.add(namedMesh(new THREE.CylinderGeometry(0.016, 0.018, 0.045, 14), matBlackPolymer, `${ecuTags[e]}_Round_Connector`, -0.30, ey, 0.40));
  }

  engineRoot.add(ignitionGroup);

  // ══════════════════════════════════════════════════════════
  // ─── 13. SENSOR ARRAY & ANCILLARIES ───
  // ══════════════════════════════════════════════════════════
  const sensorsGroup = new THREE.Group();
  sensorsGroup.name = "13_Sensors_Ancillaries";
  sensorsGroup.position.set(0, expY * 0.8, expZ * 0.4);

  const sensorBodyGeo = new THREE.CylinderGeometry(0.010, 0.012, 0.030, 12);

  const sensorSpots: Array<[number, number, number, number, string]> = [
    [-0.30, 0.235, 0.36, -30, "Cam_Position_Sensor_Left"],
    [0.30, 0.235, 0.36, 30, "Cam_Position_Sensor_Right"],
    [0.30, -0.10, 0.10, 90, "Crank_Speed_Sensor_Rear"],
    [0.02, 0.02, 0.30, 0, "Knock_Detonation_Sensor"],
    [-0.20, -0.14, 0.16, 30, "Coolant_Temp_Sender"],
  ];
  for (const [sx, sy, sz, rotDeg, name] of sensorSpots) {
    const sensor = namedMesh(sensorBodyGeo, matSensorGray, name, sx, sy, sz);
    sensor.rotation.x = THREE.MathUtils.degToRad(rotDeg);
    sensorsGroup.add(sensor);

    const pigtail = new THREE.CatmullRomCurve3([
      new THREE.Vector3(sx, sy, sz),
      new THREE.Vector3(sx + 0.02, sy + 0.03, sz + 0.02),
    ]);
    sensorsGroup.add(namedMesh(new THREE.TubeGeometry(pigtail, 6, 0.003, 6), matBlackPolymer, `${name}_Pigtail`));
  }

  sensorsGroup.add(namedMesh(new THREE.BoxGeometry(0.030, 0.020, 0.016), matSensorGray, "MAP_Manifold_Pressure_Sensor", 0.15, 0.10, 0.47));

  const mapTube = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.15, 0.09, 0.462),
    new THREE.Vector3(0.15, 0.05, 0.45),
  ]);
  sensorsGroup.add(namedMesh(new THREE.TubeGeometry(mapTube, 6, 0.004, 8), matRubberBlack, "MAP_Vacuum_Tube"));

  const groundStrap = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.33, -0.05, 0.10),
    new THREE.Vector3(-0.37, -0.12, 0.06),
    new THREE.Vector3(-0.36, -0.18, 0.02),
  ]);
  sensorsGroup.add(namedMesh(new THREE.TubeGeometry(groundStrap, 10, 0.005, 6), matCopperWiring, "Chassis_Ground_Strap"));

  const altCable = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.34, 0.21, 0.08),
    new THREE.Vector3(-0.30, 0.24, 0.12),
    new THREE.Vector3(-0.26, 0.22, 0.16),
  ]);
  sensorsGroup.add(namedMesh(new THREE.TubeGeometry(altCable, 10, 0.006, 8), matRedAnodized, "Alternator_Charge_Cable"));

  engineRoot.add(sensorsGroup);

  // ══════════════════════════════════════════════════════════
  // ─── 14. BILLET ENGINE MOUNTS & LIFT POINTS ───
  // ══════════════════════════════════════════════════════════
  const mountsGroup = new THREE.Group();
  mountsGroup.name = "14_Mounts_Lift_Points";

  for (let mi = 0; mi < 2; mi++) {
    const side = mi === 0 ? -1 : 1;
    const tag = side > 0 ? "RH" : "LH";

    mountsGroup.add(namedMesh(new THREE.BoxGeometry(0.012, 0.10, 0.16), matGoldAnodized, `Mount_Base_Plate_${tag}`, side * 0.365, 0.176, 0.04));

    for (let bz = 0; bz < 2; bz++) {
      const oz = bz === 0 ? -0.05 : 0.05;
      const bolt = namedMesh(bolt12Geo, matMachinedDeck, `Mount_Bolt_${tag}_${bz === 0 ? "Front" : "Rear"}`, side * 0.378, 0.176, 0.04 + oz);
      bolt.rotation.z = -(side * Math.PI) / 2;
      mountsGroup.add(bolt);
    }

    const puck = namedMesh(new THREE.CylinderGeometry(0.030, 0.030, 0.030, 20), matRubberBlack, `Isolator_Puck_${tag}`, side * 0.395, 0.176, 0.04);
    puck.rotation.z = Math.PI / 2;
    mountsGroup.add(puck);

    mountsGroup.add(namedMesh(new THREE.BoxGeometry(0.030, 0.10, 0.14), matGoldAnodized, `Chassis_Mount_Bracket_${tag}`, side * 0.425, 0.176, 0.04));
  }

  mountsGroup.add(namedMesh(new THREE.BoxGeometry(0.14, 0.030, 0.10), matGoldAnodized, "Transaxle_Rear_Mount_Crossmember", 0.71, -0.14, 0.08));
  mountsGroup.add(namedMesh(new THREE.CylinderGeometry(0.026, 0.026, 0.026, 18), matRubberBlack, "Transaxle_Isolator_Puck", 0.71, -0.17, 0.08));
  mountsGroup.add(namedMesh(new THREE.CylinderGeometry(0.028, 0.032, 0.014, 20), matRedAnodized, "Central_LiftEye_Base_Pad", 0.0, 0.06, 0.30));

  const liftRing = namedMesh(new THREE.TorusGeometry(0.024, 0.006, 12, 26), matRedAnodized, "Forged_Lift_Eyelet_Ring", 0.0, 0.085, 0.30);
  liftRing.rotation.x = 0.4;
  mountsGroup.add(liftRing);

  engineRoot.add(mountsGroup);

  return scene;
}

import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS, KHRMaterialsClearcoat, KHRMaterialsTransmission, KHRMaterialsIOR } from "@gltf-transform/extensions";

/**
 * Optimizes a binary GLB buffer using @gltf-transform with Khronos PBR extensions
 */
async function optimizeGlbBuffer(inputBuffer: Buffer): Promise<Buffer> {
  const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
  const document = await io.readBinary(inputBuffer);

  const clearcoatExt = document.createExtension(KHRMaterialsClearcoat).setRequired(false);
  const transmissionExt = document.createExtension(KHRMaterialsTransmission).setRequired(false);
  const iorExt = document.createExtension(KHRMaterialsIOR).setRequired(false);

  for (const material of document.getRoot().listMaterials()) {
    const name = material.getName() || "";
    if (name.includes("Dry_Carbon") || name.includes("Anodized")) {
      const clearcoat = clearcoatExt.createClearcoat().setClearcoatFactor(0.85).setClearcoatRoughnessFactor(0.1);
      material.setExtension("KHR_materials_clearcoat", clearcoat);
    }
    if (name.includes("Quartz")) {
      const transmission = transmissionExt.createTransmission().setTransmissionFactor(0.9);
      material.setExtension("KHR_materials_transmission", transmission);
      const ior = iorExt.createIOR().setIOR(1.54);
      material.setExtension("KHR_materials_ior", ior);
    }
  }

  const outputUint8 = await io.writeBinary(document);
  return Buffer.from(outputUint8);
}

/**
 * Exports the V12 Engine Scene to binary .glb files
 */
export async function exportV12GlbFiles() {
  console.log("=================================================");
  console.log("  60° V12 RACING ENGINE 3D GLB MASTER EXPORTER   ");
  console.log("=================================================");

  const exporter = new GLTFExporter();

  let meshCount = 0;
  buildV12EngineScene(0).traverse((o) => {
    if ((o as THREE.Mesh).isMesh) meshCount++;
  });
  console.log(`[Info] Scene graph contains ${meshCount} named detail nodes.`);

  const assembledScene = buildV12EngineScene(0);
  console.log("[1/4] Compiling Fully Assembled V12 Engine 3D Scene Graph...");

  const rawBuffer = await new Promise<Buffer>((resolve, reject) => {
    exporter.parse(
      assembledScene,
      (gltf) => resolve(Buffer.from(gltf as ArrayBuffer)),
      (err) => reject(err),
      { binary: true }
    );
  });

  console.log("[2/4] Optimizing with @gltf-transform & Khronos PBR Extensions...");
  const assembledBuffer = await optimizeGlbBuffer(rawBuffer);

  const publicDir = path.resolve("public/models");
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  const publicPath = path.join(publicDir, "v12_racing_engine.glb");
  fs.writeFileSync(publicPath, assembledBuffer);
  console.log(`[3/4] ✅ Saved Optimized Web App Asset: ${publicPath} (${(assembledBuffer.byteLength / 1024).toFixed(1)} KB)`);

  const userDownloadsDir = "C:\\Users\\joelj\\Downloads";
  const userDownloadPath = path.join(userDownloadsDir, "v12_racing_engine_complete.glb");
  try {
    fs.writeFileSync(userDownloadPath, assembledBuffer);
    console.log(`[4/4] ✅ Saved to Downloads: ${userDownloadPath} (${(assembledBuffer.byteLength / 1024).toFixed(1)} KB)`);
  } catch (err) {
    console.warn("Notice: Could not write to Downloads directory directly:", err);
  }

  const explodedScene = buildV12EngineScene(0.5);
  const rawExploded = await new Promise<Buffer>((resolve, reject) => {
    exporter.parse(
      explodedScene,
      (gltf) => resolve(Buffer.from(gltf as ArrayBuffer)),
      (err) => reject(err),
      { binary: true }
    );
  });
  const explodedBuffer = await optimizeGlbBuffer(rawExploded);
  const explodedPath = path.join(userDownloadsDir, "v12_racing_engine_exploded.glb");
  try {
    fs.writeFileSync(explodedPath, explodedBuffer);
    console.log(`[Bonus] ✅ Saved Exploded View to Downloads: ${explodedPath} (${(explodedBuffer.byteLength / 1024).toFixed(1)} KB)`);
  } catch (err) {
    console.warn("Notice: Could not write exploded view to Downloads:", err);
  }

  console.log("-------------------------------------------------");
  console.log("🎉 GLB Generation Complete! Ready for 3D viewing!");
  console.log("=================================================");
}

// Always execute export when invoked via CLI/node
exportV12GlbFiles()
  .then(() => {
    console.log("Export script finished successfully.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Fatal export error:", err);
    process.exit(1);
  });
