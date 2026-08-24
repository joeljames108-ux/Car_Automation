import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import * as fs from "fs";
import * as path from "path";
import { NodeIO } from "@gltf-transform/core";
import {
  ALL_EXTENSIONS,
  KHRMaterialsClearcoat,
  KHRMaterialsTransmission,
  KHRMaterialsIOR,
} from "@gltf-transform/extensions";
import { createKnurledBand, createHexBoltHead } from "../../engine3d/generators/geometryDetailUtils";

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
 * HIGH-FIDELITY HYPERCAR REAR ASSEMBLY 3D GLB MASTER GENERATOR — ULTRA DETAIL EDITION
 * ════════════════════════════════════════════════════════════════════════════════
 *
 * Generates photorealistic glTF 2.0 binary (.glb) models for the Rear Section of
 * the car including:
 *  - Sculpted Muscular Rear Fender Haunches with wheel-arch lips & C-Pillar Buttresses
 *  - Active Swan-Neck Aero Rear Wing with cambered airfoil, DRS hydraulics & louvers
 *  - Venturi Underbody Diffuser with strakes, vortex generators & kick planes
 *  - Continuous 3D OLED Edge-Lit Taillight Bar, C-Clusters, Reverse/Fog/Indicators
 *  - Quad Heat-Tinted Titanium Exhaust Tailpipes, valved muffler & heat shielding
 *  - Tubular Rear Subframe, Finned Differential, Double-Wishbone Coilover Suspension,
 *    Forged Multi-Spoke Centerlock Wheels & Carbon-Ceramic Brakes
 */

/** Helper: named mesh with position */
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

/** Helper: helical spring curve points */
function helixPoints(radius: number, height: number, turns: number, segPerTurn: number = 16): THREE.Vector3[] {
  const pts: THREE.Vector3[] = [];
  const total = Math.floor(turns * segPerTurn);
  for (let i = 0; i <= total; i++) {
    const t = i / total;
    const ang = t * turns * Math.PI * 2;
    pts.push(new THREE.Vector3(Math.cos(ang) * radius, t * height - height / 2, Math.sin(ang) * radius));
  }
  return pts;
}

export function buildRearCarScene(explodedAmount: number = 0): THREE.Scene {
  const scene = new THREE.Scene();
  scene.name = "Hypercar_Rear_Assembly_Master";

  // ─── PBR MASTER MATERIALS PALETTE ───
  const matBodyPaint = new THREE.MeshStandardMaterial({
    name: "Clearcoat_Apex_Blue_Paint",
    color: 0x0284c7,
    metalness: 0.88,
    roughness: 0.18,
  });

  const matDryCarbon = new THREE.MeshStandardMaterial({
    name: "Autoclaved_2x2_Twill_Dry_Carbon",
    color: 0x111827,
    metalness: 0.45,
    roughness: 0.32,
  });

  const matTitaniumExhaust = new THREE.MeshStandardMaterial({
    name: "Billet_Titanium_Heat_Tinted",
    color: 0x93c5fd,
    metalness: 0.95,
    roughness: 0.22,
  });

  const matExhaustHeatBurn = new THREE.MeshStandardMaterial({
    name: "Titanium_Exhaust_Tip_Flame_Tint",
    color: 0x6366f1,
    metalness: 0.92,
    roughness: 0.20,
  });

  const matOledLightbar = new THREE.MeshStandardMaterial({
    name: "OLED_Taillight_Emissive_Red",
    color: 0xdc2626,
    emissive: 0xef4444,
    emissiveIntensity: 2.8,
    roughness: 0.1,
  });

  const matIndicatorAmber = new THREE.MeshStandardMaterial({
    name: "Sequential_Indicator_Amber_Emissive",
    color: 0xf59e0b,
    emissive: 0xfbbf24,
    emissiveIntensity: 2.2,
    roughness: 0.15,
  });

  const matReverseWhite = new THREE.MeshStandardMaterial({
    name: "Reverse_Light_Clear_White",
    color: 0xf8fafc,
    emissive: 0xe2e8f0,
    emissiveIntensity: 1.4,
    roughness: 0.15,
  });

  const matFiaRainLight = new THREE.MeshStandardMaterial({
    name: "FIA_Rain_Strobe_Amber_Emissive",
    color: 0xf59e0b,
    emissive: 0xfbbf24,
    emissiveIntensity: 3.5,
    roughness: 0.1,
  });

  const matLightHousing = new THREE.MeshStandardMaterial({
    name: "Gloss_Black_Light_Housing",
    color: 0x020617,
    metalness: 0.55,
    roughness: 0.28,
  });

  const matSmokedGlass = new THREE.MeshPhysicalMaterial({
    name: "Smoked_Rear_Backlite_Glass",
    color: 0x0f172a,
    metalness: 0.1,
    roughness: 0.05,
    transmission: 0.75,
    opacity: 0.85,
    transparent: true,
  });

  const matAluSubframe = new THREE.MeshStandardMaterial({
    name: "Cast_Aluminum_Rear_Subframe",
    color: 0x94a3b8,
    metalness: 0.82,
    roughness: 0.38,
  });

  const matMachinedSteel = new THREE.MeshStandardMaterial({
    name: "Machined_ChroMoly_Steel",
    color: 0xcbd5e1,
    metalness: 0.90,
    roughness: 0.20,
  });

  const matBrakeDisc = new THREE.MeshStandardMaterial({
    name: "Carbon_Ceramic_Brake_Matrix",
    color: 0x334155,
    metalness: 0.75,
    roughness: 0.45,
  });

  const matBrakeCaliper = new THREE.MeshStandardMaterial({
    name: "Red_Anodized_Brake_Caliper",
    color: 0xb91c1c,
    metalness: 0.80,
    roughness: 0.25,
  });

  const matTireRubber = new THREE.MeshStandardMaterial({
    name: "High_Grip_Comp_Tire_Rubber",
    color: 0x1e293b,
    metalness: 0.05,
    roughness: 0.92,
  });

  const matForgedWheel = new THREE.MeshStandardMaterial({
    name: "Forged_Satin_Black_Wheel",
    color: 0x0f172a,
    metalness: 0.85,
    roughness: 0.25,
  });

  const matGoldAnodized = new THREE.MeshStandardMaterial({
    name: "Billet_Gold_Anodized",
    color: 0xf59e0b,
    metalness: 0.9,
    roughness: 0.2,
  });

  const matRubberBlack = new THREE.MeshStandardMaterial({
    name: "EPDM_Elastomer_Black",
    color: 0x111111,
    metalness: 0.0,
    roughness: 0.92,
  });

  const matCoilSpringRed = new THREE.MeshStandardMaterial({
    name: "Linear_Rate_Coilover_Spring_Red",
    color: 0xdc2626,
    metalness: 0.65,
    roughness: 0.35,
  });

  // Master Rear Root Group
  const rearRoot = new THREE.Group();
  rearRoot.name = "Rear_Car_Master_Assembly";
  scene.add(rearRoot);

  const expZ = explodedAmount * 0.18;
  const expY = explodedAmount * 0.12;
  const expX = explodedAmount * 0.15;

  // ══════════════════════════════════════════════════════════
  // ─── 01. REAR BODYWORK SHELL & FASTBACK DECKLID ───
  // ══════════════════════════════════════════════════════════
  const bodyworkGroup = new THREE.Group();
  bodyworkGroup.name = "01_Rear_Bodywork_Shell";

  const fenderProfile = new THREE.Shape();
  fenderProfile.moveTo(-0.62, -0.26);
  fenderProfile.lineTo(-0.62, 0.12);
  fenderProfile.quadraticCurveTo(-0.40, 0.245, 0.0, 0.255);
  fenderProfile.quadraticCurveTo(0.40, 0.245, 0.62, 0.12);
  fenderProfile.lineTo(0.62, -0.26);
  fenderProfile.lineTo(0.44, -0.26);
  fenderProfile.absarc(0.0, -0.26, 0.44, 0, Math.PI, false);
  fenderProfile.closePath();

  const fenderExtrudeSettings: THREE.ExtrudeGeometryOptions = {
    steps: 6,
    depth: 0.53,
    bevelEnabled: true,
    bevelThickness: 0.012,
    bevelSize: 0.012,
    bevelSegments: 2,
  };

  for (const side of [-1, 1]) {
    const tag = side > 0 ? "RH" : "LH";

    const fenderGeo = new THREE.ExtrudeGeometry(fenderProfile, fenderExtrudeSettings);
    const fender = new THREE.Mesh(fenderGeo, matBodyPaint);
    fender.name = `Sculpted_Fender_Haunch_${tag}`;
    if (side > 0) {
      fender.rotation.y = -Math.PI / 2;
      fender.position.set(1.06, 0.52, 0.60);
    } else {
      fender.rotation.y = Math.PI / 2;
      fender.position.set(-1.06, 0.52, 0.60);
    }
    fender.castShadow = true;
    bodyworkGroup.add(fender);

    const archLipGeo = new THREE.TorusGeometry(0.445, 0.014, 10, 40, Math.PI);
    const archLip = namedMesh(archLipGeo, matDryCarbon, `Wheel_Arch_Lip_${tag}`, side * 1.02, 0.26, 0.60);
    archLip.rotation.y = Math.PI / 2;
    bodyworkGroup.add(archLip);

    const buttress = namedMesh(new THREE.BoxGeometry(0.07, 0.34, 0.52), matBodyPaint, `Fastback_C_Pillar_Buttress_${tag}`, side * 0.72, 0.86, -0.18);
    buttress.rotation.x = 0.48;
    bodyworkGroup.add(buttress);
  }

  const decklidMesh = namedMesh(new THREE.BoxGeometry(1.05, 0.08, 0.95), matBodyPaint, "Rear_Trunk_Decklid", 0, 0.72 + expY * 1.5, 0.45);
  bodyworkGroup.add(decklidMesh);

  const louverFrame = namedMesh(new THREE.BoxGeometry(0.82, 0.012, 0.66), matLightHousing, "Engine_Deck_Louver_Recess_Frame", 0, 0.762 + expY * 1.5, 0.44);
  bodyworkGroup.add(louverFrame);

  for (let i = 0; i < 5; i++) {
    const louverGeo = new THREE.BoxGeometry(0.75, 0.014, 0.09);
    const louverMesh = namedMesh(louverGeo, matDryCarbon, `Engine_Deck_Cooling_Louver_${i + 1}`, 0, 0.772 + expY * 1.5, 0.20 + i * 0.12);
    louverMesh.rotation.x = -0.22;
    bodyworkGroup.add(louverMesh);

    const pivotL = namedMesh(new THREE.CylinderGeometry(0.006, 0.006, 0.02, 10), matMachinedSteel, `Louver_Pivot_LH_${i + 1}`, -0.39, 0.772 + expY * 1.5, 0.20 + i * 0.12);
    pivotL.rotation.z = Math.PI / 2;
    bodyworkGroup.add(pivotL);
    const pivotR = pivotL.clone();
    pivotR.name = `Louver_Pivot_RH_${i + 1}`;
    pivotR.position.x = 0.39;
    bodyworkGroup.add(pivotR);
  }

  const windowMesh = namedMesh(new THREE.BoxGeometry(0.92, 0.02, 0.55), matSmokedGlass, "Tinted_Rear_Backlite_Glass", 0, 0.82 + expY * 1.8, -0.25);
  windowMesh.rotation.x = 0.45;
  bodyworkGroup.add(windowMesh);

  const windowSeal = namedMesh(new THREE.BoxGeometry(0.96, 0.012, 0.59), matRubberBlack, "Backlite_EPDM_Encapsulation_Seal", 0, 0.808 + expY * 1.8, -0.25);
  windowSeal.rotation.x = 0.45;
  bodyworkGroup.add(windowSeal);

  const bumperProfile = new THREE.Shape();
  bumperProfile.moveTo(-0.96, 0.155);
  bumperProfile.quadraticCurveTo(-0.985, 0.30, -0.93, 0.40);
  bumperProfile.quadraticCurveTo(0.0, 0.495, 0.93, 0.40);
  bumperProfile.quadraticCurveTo(0.985, 0.30, 0.96, 0.155);
  bumperProfile.quadraticCurveTo(0.0, 0.115, -0.96, 0.155);
  bumperProfile.closePath();

  const bumperExtrude: THREE.ExtrudeGeometryOptions = {
    steps: 3,
    depth: 0.33,
    bevelEnabled: true,
    bevelThickness: 0.015,
    bevelSize: 0.015,
    bevelSegments: 2,
  };
  const bumperGeo = new THREE.ExtrudeGeometry(bumperProfile, bumperExtrude);
  const bumperMesh = new THREE.Mesh(bumperGeo, matBodyPaint);
  bumperMesh.name = "Sculpted_Rear_Bumper_Fascia";
  bumperMesh.position.set(0, 0.20, 1.01 + expZ);
  bodyworkGroup.add(bumperMesh);

  const bumperLowerLip = namedMesh(new THREE.BoxGeometry(1.88, 0.055, 0.10), matDryCarbon, "Bumper_Integrated_Lower_Lip_Splitter", 0, 0.185, 1.31 + expZ);
  bodyworkGroup.add(bumperLowerLip);

  for (const side of [-1, 1]) {
    const canard = namedMesh(new THREE.BoxGeometry(0.16, 0.012, 0.09), matDryCarbon, `Bumper_Aero_Canard_${side > 0 ? "RH" : "LH"}`, side * 0.83, 0.27, 1.33 + expZ);
    canard.rotation.z = side * 0.18;
    canard.rotation.x = -0.15;
    bodyworkGroup.add(canard);
  }

  const reflectorMat = new THREE.MeshStandardMaterial({
    name: "Rear_Reflector_Fresnel_Red",
    color: 0x991b1b,
    metalness: 0.3,
    roughness: 0.4,
  });
  for (const side of [-1, 1]) {
    bodyworkGroup.add(namedMesh(new THREE.BoxGeometry(0.11, 0.035, 0.02), reflectorMat, `Bumper_Reflector_Pods_${side > 0 ? "RH" : "LH"}`, side * 0.60, 0.315, 1.365 + expZ));
  }

  for (let ps = 0; ps < 4; ps++) {
    const px = -0.69 + ps * 0.46;
    const sensorDisc = namedMesh(new THREE.CylinderGeometry(0.014, 0.014, 0.012, 14), matLightHousing, `Ultrasonic_Park_Sensor_${ps + 1}`, px, 0.40, 1.352 + expZ);
    sensorDisc.rotation.x = Math.PI / 2;
    bodyworkGroup.add(sensorDisc);
  }

  const licenseRecess = namedMesh(new THREE.BoxGeometry(0.52, 0.14, 0.015), matLightHousing, "License_Plate_Recess_Pocket", 0, 0.315, 1.345 + expZ);
  bodyworkGroup.add(licenseRecess);
  const licenseLedStrip = namedMesh(new THREE.BoxGeometry(0.54, 0.012, 0.012), matReverseWhite, "License_Plate_LED_Illumination_Bar", 0, 0.395, 1.345 + expZ);
  bodyworkGroup.add(licenseLedStrip);

  const towCover = namedMesh(new THREE.CylinderGeometry(0.045, 0.045, 0.010, 20), matBodyPaint, "Tow_Hook_Cover_Disc", 0.70, 0.315, 1.36 + expZ);
  towCover.rotation.x = Math.PI / 2;
  bodyworkGroup.add(towCover);

  const crashBeam = namedMesh(new THREE.BoxGeometry(1.60, 0.14, 0.06), matAluSubframe, "Rear_Crash_Crossbeam", 0, 0.36, 0.86);
  bodyworkGroup.add(crashBeam);
  for (const side of [-1, 1]) {
    const crushBox = namedMesh(new THREE.BoxGeometry(0.16, 0.16, 0.22), matAluSubframe, `Aluminum_Crush_Cone_Box_${side > 0 ? "RH" : "LH"}`, side * 0.68, 0.36, 0.97);
    bodyworkGroup.add(crushBox);
  }

  rearRoot.add(bodyworkGroup);

  // ══════════════════════════════════════════════════════════
  // ─── 02. ACTIVE SWAN-NECK GT3 REAR WING ASSEMBLY ───
  // ══════════════════════════════════════════════════════════
  const wingGroup = new THREE.Group();
  wingGroup.name = "02_Active_SwanNeck_Rear_Wing";
  wingGroup.position.set(0, 0.95 + expY * 2, 1.15 + expZ * 1.8);

  const span = 1.72;
  const chord = 0.34;

  const airfoil = new THREE.Shape();
  airfoil.moveTo(-chord / 2, 0);
  airfoil.quadraticCurveTo(-chord * 0.15, 0.028, chord * 0.18, 0.024);
  airfoil.quadraticCurveTo(chord * 0.38, 0.016, chord / 2, 0.002);
  airfoil.quadraticCurveTo(chord * 0.1, -0.016, -chord / 2, 0);
  airfoil.closePath();

  const bladeGeo = new THREE.ExtrudeGeometry(airfoil, {
    steps: 8,
    depth: span,
    bevelEnabled: false,
  });
  bladeGeo.rotateY(Math.PI / 2);
  bladeGeo.translate(span / 2, 0, 0);
  const bladeMesh = new THREE.Mesh(bladeGeo, matDryCarbon);
  bladeMesh.name = "Cambered_Main_Airfoil_Element";
  bladeMesh.rotation.x = 0.22;
  bladeMesh.castShadow = true;
  wingGroup.add(bladeMesh);

  const gurneyGeo = new THREE.BoxGeometry(span - 0.04, 0.015, 0.015);
  const gurneyMesh = namedMesh(gurneyGeo, matDryCarbon, "Trailing_Edge_Gurney_Flap", 0, 0.028, chord / 2);
  gurneyMesh.rotation.x = 0.22;
  wingGroup.add(gurneyMesh);

  const endplateGeo = new THREE.BoxGeometry(0.015, 0.24, chord * 1.3);
  for (const side of [-1, 1]) {
    const tag = side > 0 ? "RH" : "LH";
    const ep = namedMesh(endplateGeo, matDryCarbon, `Aero_Endplate_${tag}`, (side * span) / 2, -0.02, 0);
    wingGroup.add(ep);

    for (let lv = 0; lv < 3; lv++) {
      const louver = namedMesh(new THREE.BoxGeometry(0.017, 0.012, 0.10), matLightHousing, `Endplate_Louver_${tag}_${lv + 1}`, (side * span) / 2, 0.02 + lv * 0.05, -0.06 + lv * 0.05);
      louver.rotation.x = 0.5;
      wingGroup.add(louver);
    }
  }

  const pylonGeo = new THREE.CapsuleGeometry(0.02, 0.30, 6, 14);
  for (const px of [-0.42, 0.42]) {
    const pylon = namedMesh(pylonGeo, matDryCarbon, `SwanNeck_Mount_Pylon_${px > 0 ? "RH" : "LH"}`, px, -0.20, -0.04);
    pylon.rotation.x = -0.30;
    wingGroup.add(pylon);
  }

  const drsActuatorGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.12, 16);
  for (const px of [-0.42, 0.42]) {
    const drs = namedMesh(drsActuatorGeo, matMachinedSteel, `DRS_Hydraulic_Actuator_${px > 0 ? "RH" : "LH"}`, px, -0.05, 0.02);
    drs.rotation.x = 0.22;
    wingGroup.add(drs);
  }

  const accumulator = namedMesh(new THREE.CylinderGeometry(0.022, 0.022, 0.09, 16), matGoldAnodized, "DRS_Central_Hydraulic_Accumulator", 0, -0.14, -0.10);
  wingGroup.add(accumulator);

  for (const px of [-0.42, 0.42]) {
    const lineCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(px, -0.05, 0.02),
      new THREE.Vector3(px * 0.5, -0.12, -0.06),
      new THREE.Vector3(0, -0.14, -0.10),
    ]);
    wingGroup.add(namedMesh(new THREE.TubeGeometry(lineCurve, 12, 0.004, 8), matMachinedSteel, `DRS_Hydraulic_Line_${px > 0 ? "RH" : "LH"}`));
  }

  for (const px of [-0.42, 0.42]) {
    const basePlate = namedMesh(new THREE.BoxGeometry(0.10, 0.012, 0.16), matDryCarbon, `Wing_Decklid_BasePlate_${px > 0 ? "RH" : "LH"}`, px, -0.365, 0.02);
    wingGroup.add(basePlate);
    const boltGeo = createHexBoltHead(0.007, 0.006);
    for (const [bx, bz] of [
      [-0.032, -0.05],
      [0.032, -0.05],
      [-0.032, 0.05],
      [0.032, 0.05],
    ]) {
      const bolt = namedMesh(boltGeo, matMachinedSteel, `Wing_Base_Bolt_${px > 0 ? "RH" : "LH"}_${bx}_${bz}`, px + bx, -0.372, bz + 0.02);
      wingGroup.add(bolt);
    }
  }

  rearRoot.add(wingGroup);

  // ══════════════════════════════════════════════════════════
  // ─── 03. UNDERBODY VENTURI REAR DIFFUSER ───
  // ══════════════════════════════════════════════════════════
  const diffuserGroup = new THREE.Group();
  diffuserGroup.name = "03_Underbody_Venturi_Diffuser";
  diffuserGroup.position.set(0, 0.12 - expY, 0.95 + expZ * 1.2);

  const trayMesh = namedMesh(new THREE.BoxGeometry(1.65, 0.025, 0.88), matDryCarbon, "Venturi_Expansion_Tray_Primary", 0, 0, 0);
  trayMesh.rotation.x = -0.25;
  trayMesh.castShadow = true;
  diffuserGroup.add(trayMesh);

  const strakeCount = 5;
  const strakeStep = 1.35 / (strakeCount - 1);
  for (let i = 0; i < strakeCount; i++) {
    const sx = -0.675 + i * strakeStep;
    const strakeMesh = namedMesh(new THREE.BoxGeometry(0.015, 0.14, 0.82), matDryCarbon, `Vertical_Strake_Fin_${i + 1}`, sx, -0.06, 0);
    strakeMesh.rotation.x = -0.25;
    diffuserGroup.add(strakeMesh);
  }

  const vortexFinGeo = new THREE.ConeGeometry(0.014, 0.055, 3);
  for (let v = 0; v < 9; v++) {
    const vx = -0.72 + v * 0.18;
    const vg = namedMesh(vortexFinGeo, matDryCarbon, `Vortex_Generator_Vane_${v + 1}`, vx, 0.055, -0.36);
    vg.rotation.x = 0.35;
    diffuserGroup.add(vg);
  }

  for (const side of [-1, 1]) {
    const kickPlane = namedMesh(new THREE.BoxGeometry(0.14, 0.012, 0.24), matDryCarbon, `Adjustable_Kick_Plane_${side > 0 ? "RH" : "LH"}`, side * 0.86, 0.02, 0.30);
    kickPlane.rotation.x = -0.55;
    diffuserGroup.add(kickPlane);

    const turnbuckle = namedMesh(new THREE.CylinderGeometry(0.007, 0.007, 0.06, 10), matMachinedSteel, `Kick_Plane_Turnbuckle_${side > 0 ? "RH" : "LH"}`, side * 0.84, 0.06, 0.22);
    turnbuckle.rotation.x = -0.4;
    diffuserGroup.add(turnbuckle);
  }

  const towRing = namedMesh(new THREE.TorusGeometry(0.032, 0.008, 10, 24), matMachinedSteel, "Unbraked_Tow_Hook_Ring", 0, -0.10, -0.20);
  towRing.rotation.x = Math.PI / 2;
  diffuserGroup.add(towRing);
  diffuserGroup.add(namedMesh(new THREE.BoxGeometry(0.09, 0.012, 0.09), matMachinedSteel, "Tow_Hook_BackPlate", 0, -0.105, -0.20));

  for (let r = 0; r < 3; r++) {
    const rz = -0.30 + r * 0.30;
    const rib = namedMesh(new THREE.BoxGeometry(1.60, 0.02, 0.04), matDryCarbon, `Diffuser_Mounting_Rib_${r + 1}`, 0, -0.022, rz);
    rib.rotation.x = -0.25;
    diffuserGroup.add(rib);
  }

  for (const skx of [-0.92, 0.92]) {
    const skirtMesh = namedMesh(new THREE.BoxGeometry(0.18, 0.02, 0.75), matDryCarbon, `SideSkirt_Aero_Extension_${skx > 0 ? "RH" : "LH"}`, skx, -0.02, -0.10);
    diffuserGroup.add(skirtMesh);
  }

  rearRoot.add(diffuserGroup);

  // ══════════════════════════════════════════════════════════
  // ─── 04. OLED 3D LIGHTBAR & TAILLIGHT ASSEMBLY ───
  // ══════════════════════════════════════════════════════════
  const lightsGroup = new THREE.Group();
  lightsGroup.name = "04_OLED_Rear_Lighting_System";
  lightsGroup.position.set(0, 0.54 + expY, 1.22 + expZ * 1.5);

  const housingStrip = namedMesh(new THREE.BoxGeometry(1.72, 0.075, 0.035), matLightHousing, "Lightbar_Housing_Shell", 0, -0.004, -0.028);
  lightsGroup.add(housingStrip);

  const centerBarGeo = new THREE.BoxGeometry(1.10, 0.045, 0.05);
  lightsGroup.add(namedMesh(centerBarGeo, matOledLightbar, "OLED_Lightbar_Center_Segment", 0, 0, 0));

  for (const side of [-1, 1]) {
    const cornerLen = 0.34;
    const corner = namedMesh(new THREE.BoxGeometry(cornerLen, 0.045, 0.05), matOledLightbar, `OLED_Lightbar_Corner_${side > 0 ? "RH" : "LH"}`, side * 0.70, 0.008, -0.012);
    corner.rotation.y = side * -0.5;
    lightsGroup.add(corner);

    const indicator = namedMesh(new THREE.BoxGeometry(0.10, 0.045, 0.05), matIndicatorAmber, `Sequential_Indicator_Element_${side > 0 ? "RH" : "LH"}`, side * 0.85, 0.008, -0.05);
    indicator.rotation.y = side * -0.5;
    lightsGroup.add(indicator);
  }

  for (let rib = 0; rib < 14; rib++) {
    const rx = -0.52 + rib * 0.08;
    const ribLine = namedMesh(new THREE.BoxGeometry(0.006, 0.052, 0.054), matLightHousing, `Lightbar_Lens_Reflector_Rib_${rib + 1}`, rx, 0, 0.001);
    lightsGroup.add(ribLine);
  }

  for (const lx of [-0.75, 0.75]) {
    const clusterHousing = namedMesh(new THREE.BoxGeometry(0.30, 0.16, 0.07), matLightHousing, `Taillight_Cluster_Housing_${lx > 0 ? "RH" : "LH"}`, lx, 0.02, -0.025);
    lightsGroup.add(clusterHousing);

    const cluster = namedMesh(new THREE.BoxGeometry(0.28, 0.14, 0.055), matOledLightbar, `CShaped_OLED_Taillight_Cluster_${lx > 0 ? "RH" : "LH"}`, lx, 0.02, 0.005);
    lightsGroup.add(cluster);
  }

  lightsGroup.add(namedMesh(new THREE.BoxGeometry(0.09, 0.045, 0.03), matReverseWhite, "Center_Reverse_Light_Element", 0, -0.055, 0));
  lightsGroup.add(namedMesh(new THREE.BoxGeometry(0.07, 0.04, 0.03), matOledLightbar, "Rear_Fog_Lamp_Element", -0.62, -0.06, 0));

  const fiaBracket = namedMesh(new THREE.BoxGeometry(0.14, 0.10, 0.012), matLightHousing, "FIA_Rain_Light_Mounting_Bracket", 0, -0.28, -0.035);
  lightsGroup.add(fiaBracket);
  const fiaMesh = namedMesh(new THREE.BoxGeometry(0.12, 0.08, 0.04), matFiaRainLight, "Central_FIA_Rain_Strobe_Safety_Light", 0, -0.28, -0.01);
  lightsGroup.add(fiaMesh);
  const fiaWire = namedMesh(new THREE.CylinderGeometry(0.004, 0.004, 0.08, 8), matRubberBlack, "FIA_Light_Wiring_Stub", 0, -0.345, -0.03);
  lightsGroup.add(fiaWire);

  rearRoot.add(lightsGroup);

  // ══════════════════════════════════════════════════════════
  // ─── 05. QUAD VALVED TITANIUM EXHAUST SYSTEM ───
  // ══════════════════════════════════════════════════════════
  const exhaustGroup = new THREE.Group();
  exhaustGroup.name = "05_Quad_Titanium_Exhaust_System";
  exhaustGroup.position.set(0, 0.32, 1.25 + expZ * 1.4);

  const mufflerMesh = namedMesh(new THREE.BoxGeometry(0.72, 0.22, 0.28), matTitaniumExhaust, "Transverse_Titanium_Muffler_Silencer", 0, 0, -0.22);
  exhaustGroup.add(mufflerMesh);

  const heatShieldGeo = new THREE.BoxGeometry(0.30, 0.012, 0.26);
  for (const hx of [-0.18, 0.18]) {
    const panel = namedMesh(heatShieldGeo, matTitaniumExhaust, `Muffler_HeatShield_Panel_${hx > 0 ? "RH" : "LH"}`, hx, 0.16, -0.22);
    panel.rotation.x = -0.25;
    exhaustGroup.add(panel);
  }

  const lambdaGeo = createHexBoltHead(0.012, 0.016);
  for (const lx of [-0.20, 0.20]) {
    const bung = namedMesh(lambdaGeo, matMachinedSteel, `Lambda_O2_Sensor_Bung_${lx > 0 ? "RH" : "LH"}`, lx, 0.115, -0.22);
    exhaustGroup.add(bung);
  }

  for (const side of [-1, 1]) {
    const valveBody = namedMesh(new THREE.CylinderGeometry(0.026, 0.026, 0.06, 14), matMachinedSteel, `Electric_Exhaust_Cutout_Valve_${side > 0 ? "RH" : "LH"}`, side * 0.30, 0.0, -0.40);
    valveBody.rotation.x = Math.PI / 2;
    exhaustGroup.add(valveBody);

    const valveMotor = namedMesh(new THREE.BoxGeometry(0.045, 0.045, 0.05), matLightHousing, `Cutout_Valve_Actuator_Motor_${side > 0 ? "RH" : "LH"}`, side * 0.30, 0.0, -0.45);
    exhaustGroup.add(valveMotor);
  }

  const hangerStrapGeo = new THREE.TorusGeometry(0.055, 0.008, 8, 18, Math.PI);
  for (const hx of [-0.28, 0.28]) {
    const strap = namedMesh(hangerStrapGeo, matRubberBlack, `Muffler_Rubber_Hanger_Strap_${hx > 0 ? "RH" : "LH"}`, hx, 0.13, -0.22);
    exhaustGroup.add(strap);
  }

  const pipeOffsets = [-0.28, -0.18, 0.18, 0.28];
  const innerCoreGeo = new THREE.CylinderGeometry(0.036, 0.036, 0.02, 18);
  innerCoreGeo.rotateX(Math.PI / 2);
  const rolledLipGeo = new THREE.TorusGeometry(0.045, 0.005, 12, 24);

  pipeOffsets.forEach((px, pi) => {
    const tag = `T${pi + 1}`;

    const pipeGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.18, 24);
    pipeGeo.rotateX(Math.PI / 2);
    exhaustGroup.add(namedMesh(pipeGeo, matTitaniumExhaust, `Quad_Tailpipe_Barrel_${tag}`, px, 0, 0.02));

    const coreMesh = namedMesh(innerCoreGeo, matLightHousing, `Tailpipe_Perforated_Core_${tag}`, px, 0, 0.108);
    exhaustGroup.add(coreMesh);

    const lipRing = namedMesh(rolledLipGeo, matExhaustHeatBurn, `Tailpipe_Rolled_Lip_${tag}`, px, 0, 0.112);
    exhaustGroup.add(lipRing);

    const tipBandGeo = new THREE.TorusGeometry(0.047, 0.004, 10, 22);
    const band = namedMesh(tipBandGeo, matExhaustHeatBurn, `Tailpipe_HeatTint_Band_${tag}`, px, 0, 0.06);
    exhaustGroup.add(band);
  });

  const surroundMesh = namedMesh(new THREE.BoxGeometry(0.76, 0.14, 0.02), matDryCarbon, "Carbon_Fiber_Exhaust_Surround_Aperture", 0, 0, -0.02);
  exhaustGroup.add(surroundMesh);

  rearRoot.add(exhaustGroup);

  // ══════════════════════════════════════════════════════════
  // ─── 06. TUBULAR SUBFRAME, WISHBONES, DIFF & DRIVETRAIN ───
  // ══════════════════════════════════════════════════════════
  const chassisGroup = new THREE.Group();
  chassisGroup.name = "06_Rear_Chassis_Suspension_Drivetrain";

  const railGeoShared = new THREE.CylinderGeometry(0.028, 0.028, 1.40, 18);
  railGeoShared.rotateX(Math.PI / 2);
  for (const rx of [-0.55, 0.55]) {
    chassisGroup.add(namedMesh(railGeoShared, matAluSubframe, `Subframe_Longitudinal_Rail_${rx > 0 ? "RH" : "LH"}`, rx, 0.26 - expY, 0.45));
  }
  for (const cz of [0.10, 0.80]) {
    const crossGeo = new THREE.CylinderGeometry(0.024, 0.024, 1.10, 16);
    crossGeo.rotateZ(Math.PI / 2);
    chassisGroup.add(namedMesh(crossGeo, matAluSubframe, `Subframe_Transverse_Crossmember_Z${cz.toFixed(2)}`, 0, 0.26 - expY, cz));
  }
  const diagA = new THREE.CatmullRomCurve3([new THREE.Vector3(-0.55, 0.26 - expY, 0.10), new THREE.Vector3(0.55, 0.26 - expY, 0.80)]);
  const diagB = new THREE.CatmullRomCurve3([new THREE.Vector3(0.55, 0.26 - expY, 0.10), new THREE.Vector3(-0.55, 0.26 - expY, 0.80)]);
  chassisGroup.add(namedMesh(new THREE.TubeGeometry(diagA, 8, 0.020, 12), matAluSubframe, "Subframe_Diagonal_Brace_A"));
  chassisGroup.add(namedMesh(new THREE.TubeGeometry(diagB, 8, 0.020, 12), matAluSubframe, "Subframe_Diagonal_Brace_B"));

  for (const bx of [-0.55, 0.55]) {
    for (const bz of [0.10, 0.80]) {
      chassisGroup.add(namedMesh(new THREE.CylinderGeometry(0.034, 0.034, 0.05, 16), matRubberBlack, `Subframe_Bushing_Puck_X${bx}_Z${bz}`, bx, 0.26 - expY, bz));
    }
  }

  const diffMesh = namedMesh(new THREE.SphereGeometry(0.18, 24, 20), matMachinedSteel, "Transaxle_Differential_Housing", 0, 0.26, 0.45);
  chassisGroup.add(diffMesh);

  const diffFinGeo = createKnurledBand(0.182, 0.05, 40);
  const diffFins = namedMesh(diffFinGeo, matMachinedSteel, "Differential_Cooling_Fin_Ring", 0, 0.26, 0.45);
  diffFins.rotation.z = Math.PI / 2;
  chassisGroup.add(diffFins);

  const inputFlange = namedMesh(new THREE.CylinderGeometry(0.045, 0.045, 0.03, 20), matMachinedSteel, "Diff_Input_Drive_Flange", 0, 0.26, 0.24);
  inputFlange.rotation.x = Math.PI / 2;
  chassisGroup.add(inputFlange);
  chassisGroup.add(namedMesh(new THREE.CylinderGeometry(0.006, 0.006, 0.03, 8), matMachinedSteel, "Diff_Breather_Fitting", 0.06, 0.43, 0.45));

  const axleGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.42, 16);
  axleGeo.rotateZ(Math.PI / 2);
  const bootGeo = new THREE.ConeGeometry(0.04, 0.07, 16, 1, true);
  for (const ax of [-0.45, 0.45]) {
    const tag = ax > 0 ? "RH" : "LH";
    chassisGroup.add(namedMesh(axleGeo, matMachinedSteel, `CV_Drive_Axle_HalfShaft_${tag}`, ax, 0.26, 0.45));
    const outerBoot = namedMesh(bootGeo, matRubberBlack, `CV_Joint_Rubber_Boot_${tag}`, ax + (ax > 0 ? -0.14 : 0.14), 0.26, 0.45);
    outerBoot.rotation.z = ax > 0 ? Math.PI / 2 : -Math.PI / 2;
    chassisGroup.add(outerBoot);
    const innerBoot = namedMesh(bootGeo, matRubberBlack, `CV_Inboard_Boot_${tag}`, ax + (ax > 0 ? -0.05 : 0.05), 0.26, 0.45);
    innerBoot.rotation.z = ax > 0 ? Math.PI / 2 : -Math.PI / 2;
    chassisGroup.add(innerBoot);
  }

  const tireLathePts: THREE.Vector2[] = [
    new THREE.Vector2(0.26, -0.168),
    new THREE.Vector2(0.305, -0.176),
    new THREE.Vector2(0.338, -0.166),
    new THREE.Vector2(0.352, -0.128),
    new THREE.Vector2(0.352, 0.128),
    new THREE.Vector2(0.338, 0.166),
    new THREE.Vector2(0.305, 0.176),
    new THREE.Vector2(0.26, 0.168),
  ];
  const tireGeo = new THREE.LatheGeometry(tireLathePts, 40);
  tireGeo.rotateZ(Math.PI / 2);
  const rimBarrelGeo = new THREE.CylinderGeometry(0.26, 0.26, 0.30, 32, 1, true);
  rimBarrelGeo.rotateZ(Math.PI / 2);
  const rimFaceGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.02, 32);
  rimFaceGeo.rotateZ(Math.PI / 2);
  const spokeGeo = new THREE.BoxGeometry(0.035, 0.21, 0.024);
  const rimLipGeo = new THREE.TorusGeometry(0.255, 0.012, 10, 36);
  rimLipGeo.rotateY(Math.PI / 2);
  const centerlockGeo = createKnurledBand(0.045, 0.030, 24);
  const rotorGeo = new THREE.CylinderGeometry(0.19, 0.19, 0.032, 36);
  rotorGeo.rotateZ(Math.PI / 2);
  const rotorHatGeo = new THREE.CylinderGeometry(0.105, 0.105, 0.045, 24);
  rotorHatGeo.rotateZ(Math.PI / 2);
  const drillRingGeo = new THREE.TorusGeometry(0.155, 0.0025, 6, 40);
  drillRingGeo.rotateY(Math.PI / 2);
  const slotMarkGeo = new THREE.BoxGeometry(0.002, 0.034, 0.006);

  for (const wx of [-0.82, 0.82]) {
    const isLH = wx < 0;
    const tag = isLH ? "LH" : "RH";
    const sideExp = isLH ? -expX : expX;
    const wheelBaseX = wx + sideExp;

    const wheelGroup = new THREE.Group();
    wheelGroup.name = `Rear_Wheel_Corner_Assembly_${tag}`;
    wheelGroup.position.set(wheelBaseX, 0.32, 0.45);

    wheelGroup.add(namedMesh(tireGeo, matTireRubber, `335_Compound_Tire_${tag}`));
    wheelGroup.add(namedMesh(rimBarrelGeo, matForgedWheel, `Forged_Wheel_Rim_Barrel_${tag}`));

    const faceOffset = isLH ? -0.14 : 0.14;
    wheelGroup.add(namedMesh(rimFaceGeo, matForgedWheel, `Wheel_Face_Disc_${tag}`, faceOffset * 0.5, 0, 0));

    for (let sp = 0; sp < 10; sp++) {
      const ang = (sp * Math.PI * 2) / 10;
      const spoke = namedMesh(spokeGeo, matForgedWheel, `Wheel_TwinSpoke_${tag}_${sp + 1}`, faceOffset * 0.5, Math.cos(ang) * 0.125, Math.sin(ang) * 0.125);
      spoke.rotation.x = ang;
      wheelGroup.add(spoke);
    }

    const rimLip = namedMesh(rimLipGeo, matForgedWheel, `Rim_Outboard_Lip_${tag}`, faceOffset * 0.9, 0, 0);
    wheelGroup.add(rimLip);

    const centerlock = namedMesh(centerlockGeo, matGoldAnodized, `Centerlock_Wheel_Nut_${tag}`, faceOffset * 0.62, 0, 0);
    centerlock.rotation.z = Math.PI / 2;
    wheelGroup.add(centerlock);

    wheelGroup.add(namedMesh(rotorGeo, matBrakeDisc, `CarbonCeramic_Brake_Rotor_${tag}`, faceOffset * 0.35, 0, 0));
    wheelGroup.add(namedMesh(rotorHatGeo, matMachinedSteel, `Rotor_Center_Hat_${tag}`, faceOffset * 0.3, 0, 0));

    const drillRing = namedMesh(drillRingGeo, matLightHousing, `Rotor_CrossDrill_Ring_${tag}`, faceOffset * 0.37, 0, 0);
    wheelGroup.add(drillRing);

    for (let sl = 0; sl < 6; sl++) {
      const sang = (sl * Math.PI * 2) / 6;
      const slot = namedMesh(slotMarkGeo, matLightHousing, `Rotor_Wear_Slot_${tag}_${sl + 1}`, faceOffset * 0.37, Math.cos(sang) * 0.10, Math.sin(sang) * 0.10);
      slot.rotation.x = sang;
      wheelGroup.add(slot);
    }

    const caliper = namedMesh(new THREE.BoxGeometry(0.055, 0.09, 0.19), matBrakeCaliper, `SixPiston_Monobloc_Caliper_${tag}`, isLH ? 0.045 : -0.045, 0.10, 0.06);
    wheelGroup.add(caliper);
    const caliperBridge = namedMesh(new THREE.BoxGeometry(0.030, 0.05, 0.19), matBrakeCaliper, `Caliper_Bridge_${tag}`, isLH ? 0.075 : -0.075, 0.145, 0.06);
    wheelGroup.add(caliperBridge);
    for (let bb = 0; bb < 2; bb++) {
      const banjo = namedMesh(createHexBoltHead(0.006, 0.005), matMachinedSteel, `Caliper_Banjo_Bolt_${tag}_${bb + 1}`, isLH ? 0.075 : -0.075, 0.06 + bb * 0.09, 0.145);
      banjo.rotation.z = Math.PI / 2;
      wheelGroup.add(banjo);
    }

    const hardlineCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(isLH ? 0.08 : -0.08, 0.06, 0.145),
      new THREE.Vector3(isLH ? 0.16 : -0.16, 0.16, 0.05),
      new THREE.Vector3(isLH ? 0.20 : -0.20, 0.24, -0.02),
    ]);
    wheelGroup.add(namedMesh(new THREE.TubeGeometry(hardlineCurve, 12, 0.0035, 6), matMachinedSteel, `Brake_Hardline_To_Upright_${tag}`));

    const upright = namedMesh(new THREE.BoxGeometry(0.06, 0.22, 0.10), matMachinedSteel, `Forged_Upright_Knuckle_${tag}`, isLH ? 0.14 : -0.14, 0.02, 0);
    wheelGroup.add(upright);

    const armRadius = 0.014;
    const upperArmFwd = new THREE.CatmullRomCurve3([
      new THREE.Vector3(isLH ? 0.17 : -0.17, 0.10, 0.02),
      new THREE.Vector3(isLH ? 0.45 : -0.45, 0.10, 0.10),
    ]);
    const upperArmRear = new THREE.CatmullRomCurve3([
      new THREE.Vector3(isLH ? 0.17 : -0.17, 0.10, 0.02),
      new THREE.Vector3(isLH ? 0.45 : -0.45, 0.10, -0.16),
    ]);
    const lowerArmFwd = new THREE.CatmullRomCurve3([
      new THREE.Vector3(isLH ? 0.17 : -0.17, -0.06, 0.06),
      new THREE.Vector3(isLH ? 0.45 : -0.45, -0.06, 0.14),
    ]);
    const lowerArmRear = new THREE.CatmullRomCurve3([
      new THREE.Vector3(isLH ? 0.17 : -0.17, -0.06, 0.06),
      new THREE.Vector3(isLH ? 0.45 : -0.45, -0.06, -0.18),
    ]);
    wheelGroup.add(namedMesh(new THREE.TubeGeometry(upperArmFwd, 6, armRadius, 8), matAluSubframe, `Upper_Wishbone_Fwd_Leg_${tag}`));
    wheelGroup.add(namedMesh(new THREE.TubeGeometry(upperArmRear, 6, armRadius, 8), matAluSubframe, `Upper_Wishbone_Rear_Leg_${tag}`));
    wheelGroup.add(namedMesh(new THREE.TubeGeometry(lowerArmFwd, 6, armRadius, 8), matAluSubframe, `Lower_Wishbone_Fwd_Leg_${tag}`));
    wheelGroup.add(namedMesh(new THREE.TubeGeometry(lowerArmRear, 6, armRadius, 8), matAluSubframe, `Lower_Wishbone_Rear_Leg_${tag}`));

    const ballJointTop = namedMesh(new THREE.SphereGeometry(0.020, 14, 12), matMachinedSteel, `Upper_Ball_Joint_${tag}`, isLH ? 0.16 : -0.16, 0.10, 0.02);
    wheelGroup.add(ballJointTop);
    const ballJointBottom = namedMesh(new THREE.SphereGeometry(0.022, 14, 12), matMachinedSteel, `Lower_Ball_Joint_${tag}`, isLH ? 0.16 : -0.16, -0.06, 0.06);
    wheelGroup.add(ballJointBottom);

    const pushrod = new THREE.CatmullRomCurve3([
      new THREE.Vector3(isLH ? 0.18 : -0.18, -0.05, 0.08),
      new THREE.Vector3(isLH ? 0.34 : -0.34, 0.16, 0.02),
    ]);
    wheelGroup.add(namedMesh(new THREE.TubeGeometry(pushrod, 6, 0.008, 8), matMachinedSteel, `Pushrod_Actuating_Link_${tag}`));

    const coiloverBody = namedMesh(new THREE.CylinderGeometry(0.024, 0.024, 0.20, 16), matMachinedSteel, `Coilover_Damper_Body_${tag}`, isLH ? 0.40 : -0.40, 0.16, 0.02);
    coiloverBody.rotation.z = isLH ? -0.35 : 0.35;
    wheelGroup.add(coiloverBody);

    const springPts = helixPoints(0.038, 0.16, 6);
    const springCurve = new THREE.CatmullRomCurve3(springPts);
    const coilSpring = namedMesh(new THREE.TubeGeometry(springCurve, 64, 0.007, 8), matCoilSpringRed, `Linear_Coilover_Spring_${tag}`, isLH ? 0.415 : -0.415, 0.20, 0.02);
    coilSpring.rotation.z = isLH ? -0.35 : 0.35;
    wheelGroup.add(coilSpring);

    const springPerch = namedMesh(new THREE.CylinderGeometry(0.042, 0.042, 0.010, 20), matAluSubframe, `Adjustable_Spring_Perk_${tag}`, isLH ? 0.415 : -0.415, 0.135, 0.02);
    springPerch.rotation.z = isLH ? -0.35 : 0.35;
    wheelGroup.add(springPerch);

    const toeLink = new THREE.CatmullRomCurve3([
      new THREE.Vector3(isLH ? 0.17 : -0.17, -0.02, -0.10),
      new THREE.Vector3(isLH ? 0.48 : -0.48, -0.02, -0.22),
    ]);
    wheelGroup.add(namedMesh(new THREE.TubeGeometry(toeLink, 6, 0.010, 8), matMachinedSteel, `Toe_Adjuster_Link_${tag}`));

    chassisGroup.add(wheelGroup);
  }

  rearRoot.add(chassisGroup);

  return scene;
}

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
    if (name.includes("Clearcoat") || name.includes("Paint") || name.includes("Dry_Carbon")) {
      const clearcoat = clearcoatExt.createClearcoat().setClearcoatFactor(0.92).setClearcoatRoughnessFactor(0.08);
      material.setExtension("KHR_materials_clearcoat", clearcoat);
    }
    if (name.includes("Smoked_Rear")) {
      const transmission = transmissionExt.createTransmission().setTransmissionFactor(0.85);
      material.setExtension("KHR_materials_transmission", transmission);
      const ior = iorExt.createIOR().setIOR(1.52);
      material.setExtension("KHR_materials_ior", ior);
    }
  }

  const outputUint8 = await io.writeBinary(document);
  return Buffer.from(outputUint8);
}

/**
 * Main export function to generate and save rear car GLB assets
 */
export async function exportRearCarGlbFiles() {
  console.log("=================================================");
  console.log("  HYPERCAR REAR ASSEMBLY 3D GLB MASTER EXPORTER  ");
  console.log("=================================================");

  const exporter = new GLTFExporter();

  let nodeCount = 0;
  buildRearCarScene(0).traverse((o) => {
    if ((o as THREE.Mesh).isMesh) nodeCount++;
  });
  console.log(`[Info] Scene graph contains ${nodeCount} named detail nodes.`);

  const assembledScene = buildRearCarScene(0);
  console.log("[1/5] Compiling Fully Assembled Hypercar Rear 3D Scene Graph...");

  const rawBuffer = await new Promise<Buffer>((resolve, reject) => {
    exporter.parse(
      assembledScene,
      (gltf) => resolve(Buffer.from(gltf as ArrayBuffer)),
      (err) => reject(err),
      { binary: true }
    );
  });

  console.log("[2/5] Optimizing with @gltf-transform & Khronos PBR Clearcoat Extensions...");
  const assembledBuffer = await optimizeGlbBuffer(rawBuffer);

  const exteriorDir = path.resolve("public/models/exterior");
  if (!fs.existsSync(exteriorDir)) {
    fs.mkdirSync(exteriorDir, { recursive: true });
  }

  const mainPath = path.join(exteriorDir, "rear_car_assembly.glb");
  fs.writeFileSync(mainPath, assembledBuffer);
  console.log(`[3/5] ✅ Saved Master Web App Asset: ${mainPath} (${(assembledBuffer.byteLength / 1024).toFixed(1)} KB)`);

  const saveSubComponent = async (sceneName: string, subScene: THREE.Scene, fileName: string) => {
    const rawSub = await new Promise<Buffer>((res, rej) => {
      exporter.parse(subScene, (g) => res(Buffer.from(g as ArrayBuffer)), (e) => rej(e), { binary: true });
    });
    const optSub = await optimizeGlbBuffer(rawSub);
    const subPath = path.join(exteriorDir, fileName);
    fs.writeFileSync(subPath, optSub);
    console.log(`       -> Saved Modular Component (${sceneName}): ${subPath} (${(optSub.byteLength / 1024).toFixed(1)} KB)`);
  };

  const bumperScene = new THREE.Scene();
  bumperScene.add(buildRearCarScene(0).getObjectByName("01_Rear_Bodywork_Shell")?.clone() || new THREE.Group());
  await saveSubComponent("Rear Bumper Fascia", bumperScene, "rear_bumper.glb");

  const diffuserScene = new THREE.Scene();
  diffuserScene.add(buildRearCarScene(0).getObjectByName("03_Underbody_Venturi_Diffuser")?.clone() || new THREE.Group());
  await saveSubComponent("Rear Diffuser", diffuserScene, "rear_diffuser.glb");

  const wingScene = new THREE.Scene();
  wingScene.add(buildRearCarScene(0).getObjectByName("02_Active_SwanNeck_Rear_Wing")?.clone() || new THREE.Group());
  await saveSubComponent("Rear Wing", wingScene, "rear_wing.glb");

  const lightScene = new THREE.Scene();
  lightScene.add(buildRearCarScene(0).getObjectByName("04_OLED_Rear_Lighting_System")?.clone() || new THREE.Group());
  await saveSubComponent("OLED Taillights", lightScene, "taillights.glb");

  const userDownloadsDir = "C:\\Users\\joelj\\Downloads";
  const userDownloadPath = path.join(userDownloadsDir, "rear_car_assembly_complete.glb");
  try {
    fs.writeFileSync(userDownloadPath, assembledBuffer);
    console.log(`[4/5] ✅ Saved to Downloads: ${userDownloadPath} (${(assembledBuffer.byteLength / 1024).toFixed(1)} KB)`);
  } catch (err) {
    console.warn("Notice: Could not write to Downloads directory directly:", err);
  }

  const explodedScene = buildRearCarScene(0.5);
  const rawExploded = await new Promise<Buffer>((resolve, reject) => {
    exporter.parse(
      explodedScene,
      (gltf) => resolve(Buffer.from(gltf as ArrayBuffer)),
      (err) => reject(err),
      { binary: true }
    );
  });
  const explodedBuffer = await optimizeGlbBuffer(rawExploded);
  const explodedPath = path.join(userDownloadsDir, "rear_car_assembly_exploded.glb");
  try {
    fs.writeFileSync(explodedPath, explodedBuffer);
    console.log(`[5/5] ✅ Saved Exploded View to Downloads: ${explodedPath} (${(explodedBuffer.byteLength / 1024).toFixed(1)} KB)`);
  } catch (err) {
    console.warn("Notice: Could not write exploded view to Downloads:", err);
  }

  console.log("-------------------------------------------------");
  console.log("🎉 Rear Car GLB Generation Complete! Ready for 3D viewing!");
  console.log("=================================================");
}

// Execute export when invoked via CLI / node
exportRearCarGlbFiles()
  .then(() => {
    console.log("Export script finished successfully.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Fatal export error:", err);
    process.exit(1);
  });
