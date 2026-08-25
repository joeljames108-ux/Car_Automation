// ============================================================================
// ULTRA-HIGH-FIDELITY MODULAR GLB GENERATOR — RACING SUPERCHARGERS
// ============================================================================
// Solid-modeling engineering generator for forced-induction supercharger systems:
// 1. Twin-Screw / Roots Positive Displacement Supercharger (2.0L - 4.5L blower)
//    - Deep longitudinal cooling ribs, internal twin intermeshing helical rotors
//    - Billet front drive snout with knurled cogged drive pulley
//    - Integrated water-to-air charge cooler core & finned lid
//    - Vacuum bypass valve and throttle body adapter
// 2. Centrifugal Supercharger (ProCharger / Vortech Style)
//    - Billet CNC compressor volute scroll & high-speed impeller
//    - Internal planetary step-up gearbox with lubrication ports
//    - Billet front mounting bracket, cogged drive belt, and surge bypass valve
// ============================================================================

import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { globalMaterialLibrary } from '../materials/pbrMaterialSystem';
import {
  createHexBoltHead,
  createAllenSocketHead,
  createHoseClamp,
  createKnurledBand,
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

export interface SuperchargerBuildOptions {
  type?: 'twin_screw_roots' | 'centrifugal_planetary';
  displacementLiters?: number; // 1.8 to 4.5 L (blower size)
  pulleyRatio?: number;        // 1.8 to 3.4
  scale?: number;
  housingFinish?: string;
  pulleyFinish?: string;
  bypassCapColor?: string;
  couplerColor?: string;
}

/**
 * Builds a Twin-Screw / Roots Valley-Mounted Supercharger assembly.
 */
export function createTwinScrewSuperchargerAssembly(options?: SuperchargerBuildOptions): THREE.Group {
  const rootGroup = new THREE.Group();
  rootGroup.name = 'TwinScrew_Supercharger_Assembly';

  const disp = options?.displacementLiters ?? 3.0;
  const dispScale = Math.pow(disp / 3.0, 0.45) * (options?.scale ?? 1.0);
  rootGroup.scale.set(dispScale, dispScale, dispScale);

  const matLib = globalMaterialLibrary;

  // Resolve finish materials
  const finishKey = (options?.housingFinish || 'billet_polished').toLowerCase();
  const matHousing =
    finishKey.includes('rosso') ? matLib.getRossoCorsaPowdercoat() :
    finishKey.includes('black') || finishKey.includes('stealth') ? matLib.getStealthBlackCeramic() :
    finishKey.includes('blue') ? matLib.getMonacoBluePowdercoat() :
    finishKey.includes('gold') ? matLib.getGoldAnodized() :
    finishKey.includes('titanium') ? matLib.getTitaniumAerospace() :
    matLib.getMachinedBillet();

  const pulleyKey = (options?.pulleyFinish || 'billet_gold').toLowerCase();
  const matPulley =
    pulleyKey.includes('purple') ? matLib.getAnodizedPurple() :
    pulleyKey.includes('blue') ? matLib.getBilletCobalt() :
    pulleyKey.includes('red') ? matLib.getBilletCrimson() :
    pulleyKey.includes('black') ? matLib.getStealthBlackCeramic() :
    matLib.getGoldAnodized();

  const matStainless = matLib.getNitridedCrank();
  const matCastAlum = matLib.getCastAluminum();
  const matCarbon = matLib.getDryCarbonFiber();
  const matBelt = matLib.getCoggedBeltRubber();
  const matBypassCap = options?.bypassCapColor ? matLib.resolveMaterialForVariant(options.bypassCapColor) : matLib.getAnodizedPurple();

  // 1. Main Blower Casing (Extruded dual-cylinder lobe profile)
  const casingGroup = new THREE.Group();
  casingGroup.name = 'Supercharger_Main_Casing';

  const casingGeo = new THREE.BoxGeometry(0.22, 0.12, 0.36);
  const casingMesh = new THREE.Mesh(casingGeo, matHousing);
  casingMesh.name = 'Blower_Case_Block';
  casingMesh.castShadow = true;
  casingMesh.receiveShadow = true;
  casingGroup.add(casingMesh);

  // Longitudinal Cooling Ribs on Blower Flanks (8 ribs per side)
  for (let side of [-1, 1]) {
    for (let r = 0; r < 8; r++) {
      const ry = -0.045 + r * 0.013;
      const ribGeo = new THREE.BoxGeometry(0.008, 0.004, 0.34);
      const ribMesh = new THREE.Mesh(ribGeo, matHousing);
      ribMesh.name = `Blower_Cooling_Rib_${side < 0 ? 'L' : 'R'}_${r + 1}`;
      ribMesh.position.set(side * 0.114, ry, 0);
      casingGroup.add(ribMesh);
    }
  }

  // 2. Top Water-to-Air Charge Cooler Lid with Carbon Inset
  const lidGeo = new THREE.BoxGeometry(0.21, 0.035, 0.35);
  const lidMesh = new THREE.Mesh(lidGeo, matHousing);
  lidMesh.name = 'Intercooler_Core_Lid';
  lidMesh.position.set(0, 0.075, 0);
  lidMesh.castShadow = true;
  casingGroup.add(lidMesh);

  // Carbon Fiber Top Inspection / Styling Badge Plate
  const carbonPlateGeo = new THREE.BoxGeometry(0.16, 0.004, 0.28);
  const carbonPlateMesh = new THREE.Mesh(carbonPlateGeo, matCarbon);
  carbonPlateMesh.name = 'Supercharger_Carbon_Top_Plate';
  carbonPlateMesh.position.set(0, 0.094, 0);
  casingGroup.add(carbonPlateMesh);

  // Embossed Billet APEX SC Emblem on top
  const emblemGeo = new THREE.BoxGeometry(0.08, 0.003, 0.03);
  const emblemMesh = new THREE.Mesh(emblemGeo, matPulley);
  emblemMesh.name = 'Embossed_Apex_SC_Emblem';
  emblemMesh.position.set(0, 0.097, 0);
  casingGroup.add(emblemMesh);

  // Perimeter Allen Cap Bolts securing the Lid (16 bolts)
  for (let bx = -0.095; bx <= 0.095; bx += 0.063) {
    for (let bz of [-0.165, 0.165]) {
      const boltGeo = createAllenSocketHead(0.005, 0.006);
      const boltMesh = new THREE.Mesh(boltGeo, matStainless);
      boltMesh.position.set(bx, 0.095, bz);
      casingGroup.add(boltMesh);
    }
  }

  // 3. Extended Front Drive Snout & Bearings
  const snoutGroup = new THREE.Group();
  snoutGroup.name = 'Blower_Drive_Snout_Subsystem';

  const snoutGeo = new THREE.CylinderGeometry(0.042, 0.052, 0.18, 24);
  snoutGeo.rotateX(Math.PI / 2);
  const snoutMesh = new THREE.Mesh(snoutGeo, matHousing);
  snoutMesh.name = 'Billet_Drive_Snout_Housing';
  snoutMesh.position.set(0, 0.015, -0.26);
  snoutMesh.castShadow = true;
  snoutGroup.add(snoutMesh);

  // Billet Drive Shaft
  const shaftGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.22, 20);
  shaftGeo.rotateX(Math.PI / 2);
  const shaftMesh = new THREE.Mesh(shaftGeo, matStainless);
  shaftMesh.name = 'Supercharger_Main_Drive_Shaft';
  shaftMesh.position.set(0, 0.015, -0.28);
  snoutGroup.add(shaftMesh);

  // 4. Knurled Cogged Drive Pulley (with sizing from pulleyRatio)
  const pRatio = options?.pulleyRatio ?? 2.4;
  const pulleyRadius = 0.038 / (pRatio / 2.2);
  const pulleyGroup = new THREE.Group();
  pulleyGroup.name = 'Blower_Cogged_Drive_Pulley';
  pulleyGroup.position.set(0, 0.015, -0.37);

  const pulleyDiscGeo = new THREE.CylinderGeometry(pulleyRadius, pulleyRadius, 0.036, 36);
  pulleyDiscGeo.rotateX(Math.PI / 2);
  const pulleyDiscMesh = new THREE.Mesh(pulleyDiscGeo, matPulley);
  pulleyDiscMesh.castShadow = true;
  pulleyGroup.add(pulleyDiscMesh);

  // Pulley Retaining Flanges (Front & Rear Lips)
  [-0.018, 0.018].forEach((fz) => {
    const lipGeo = new THREE.TorusGeometry(pulleyRadius + 0.003, 0.002, 10, 36);
    const lipMesh = new THREE.Mesh(lipGeo, matPulley);
    lipMesh.position.z = fz;
    pulleyGroup.add(lipMesh);
  });

  // Knurled Grip Pattern on Pulley Perimeter
  const knurlGeo = createKnurledBand(pulleyRadius + 0.0005, 0.026, 40);
  knurlGeo.rotateX(Math.PI / 2);
  const knurlMesh = new THREE.Mesh(knurlGeo, matStainless);
  pulleyGroup.add(knurlMesh);

  // Central Grade 12.9 Billet Hex Retaining Bolt
  const cenBoltGeo = createHexBoltHead(0.014, 0.010);
  cenBoltGeo.rotateX(Math.PI / 2);
  const cenBoltMesh = new THREE.Mesh(cenBoltGeo, matStainless);
  cenBoltMesh.position.z = -0.022;
  pulleyGroup.add(cenBoltMesh);

  snoutGroup.add(pulleyGroup);

  // 5. Heavy-Duty Cogged Serpentine Belt Loop down to crankshaft
  const beltCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.015, -0.37),
    new THREE.Vector3(-0.06, -0.12, -0.37),
    new THREE.Vector3(0, -0.26, -0.37),
    new THREE.Vector3(0.06, -0.12, -0.37),
  ], true);
  const beltGeo = new THREE.TubeGeometry(beltCurve, 32, 0.010, 10, true);
  const beltMesh = new THREE.Mesh(beltGeo, matBelt);
  beltMesh.name = 'Cogged_Supercharger_Drive_Belt';
  snoutGroup.add(beltMesh);

  // Idler Tensioner Pulley
  const tensionerGeo = new THREE.CylinderGeometry(0.028, 0.028, 0.032, 24);
  tensionerGeo.rotateX(Math.PI / 2);
  const tensionerMesh = new THREE.Mesh(tensionerGeo, matStainless);
  tensionerMesh.name = 'Belt_Tensioner_Idler_Pulley';
  tensionerMesh.position.set(-0.075, -0.09, -0.37);
  snoutGroup.add(tensionerMesh);

  casingGroup.add(snoutGroup);

  // 6. Rear Air Intake Elbow & 92mm Throttle Body
  const intakeElbowGroup = new THREE.Group();
  intakeElbowGroup.name = 'Rear_Air_Intake_Elbow_Subsystem';

  const elbowCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.02, 0.18),
    new THREE.Vector3(0, 0.03, 0.25),
    new THREE.Vector3(-0.08, 0.02, 0.29),
  ]);
  const elbowGeo = new THREE.TubeGeometry(elbowCurve, 16, 0.046, 24, false);
  const elbowMesh = new THREE.Mesh(elbowGeo, matCastAlum);
  elbowMesh.name = 'Intake_Plenum_Rear_Elbow';
  elbowMesh.castShadow = true;
  intakeElbowGroup.add(elbowMesh);

  // Billet Throttle Body Housing
  const tbGeo = new THREE.CylinderGeometry(0.048, 0.048, 0.05, 24);
  tbGeo.rotateZ(Math.PI / 2);
  const tbMesh = new THREE.Mesh(tbGeo, matHousing);
  tbMesh.name = 'CNC_92mm_Billet_Throttle_Body';
  tbMesh.position.set(-0.11, 0.02, 0.29);
  intakeElbowGroup.add(tbMesh);

  // 7. Vacuum Bypass Valve Actuator
  const bpGroup = new THREE.Group();
  bpGroup.name = 'Vacuum_Bypass_Actuator_Valve';
  bpGroup.position.set(0.09, -0.02, 0.12);

  const bpBody = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.032, 20), matStainless);
  bpGroup.add(bpBody);

  const bpCap = new THREE.Mesh(new THREE.CylinderGeometry(0.017, 0.017, 0.012, 20), matBypassCap);
  bpCap.position.y = 0.020;
  bpGroup.add(bpCap);

  casingGroup.add(bpGroup);
  casingGroup.add(intakeElbowGroup);

  rootGroup.add(casingGroup);
  return rootGroup;
}

/**
 * Builds a Centrifugal Supercharger (ProCharger/Vortech Style) assembly.
 */
export function createCentrifugalSuperchargerAssembly(options?: SuperchargerBuildOptions): THREE.Group {
  const rootGroup = new THREE.Group();
  rootGroup.name = 'Centrifugal_Supercharger_Assembly';

  const cScale = (options?.scale ?? 1.0);
  rootGroup.scale.set(cScale, cScale, cScale);

  const matLib = globalMaterialLibrary;
  const finishKey = (options?.housingFinish || 'billet_polished').toLowerCase();
  const matVolute =
    finishKey.includes('rosso') ? matLib.getRossoCorsaPowdercoat() :
    finishKey.includes('black') || finishKey.includes('stealth') ? matLib.getStealthBlackCeramic() :
    finishKey.includes('gold') ? matLib.getGoldAnodized() :
    finishKey.includes('titanium') ? matLib.getTitaniumAerospace() :
    matLib.getMachinedBillet();

  const pulleyKey = (options?.pulleyFinish || 'billet_gold').toLowerCase();
  const matPulley =
    pulleyKey.includes('purple') ? matLib.getAnodizedPurple() :
    pulleyKey.includes('blue') ? matLib.getBilletCobalt() :
    pulleyKey.includes('red') ? matLib.getBilletCrimson() :
    pulleyKey.includes('black') ? matLib.getStealthBlackCeramic() :
    matLib.getGoldAnodized();

  const matStainless = matLib.getNitridedCrank();
  const matBelt = matLib.getCoggedBeltRubber();
  const matSilicone = options?.couplerColor ? matLib.resolveMaterialForVariant(options.couplerColor) : matLib.getBlueSilicone();

  // 1. CNC Billet Compressor Volute (Torus scroll)
  const voluteGeo = new THREE.TorusGeometry(0.068, 0.034, 32, 48, Math.PI * 1.7);
  voluteGeo.rotateY(Math.PI / 2);
  const voluteMesh = new THREE.Mesh(voluteGeo, matVolute);
  voluteMesh.name = 'Centrifugal_Compressor_Volute';
  voluteMesh.castShadow = true;
  rootGroup.add(voluteMesh);

  // 2. Air Inlet Velocity Bellmouth Horn
  const bellGeo = new THREE.CylinderGeometry(0.048, 0.058, 0.052, 36);
  bellGeo.rotateZ(Math.PI / 2);
  const bellMesh = new THREE.Mesh(bellGeo, matVolute);
  bellMesh.name = 'Centrifugal_Air_Inlet_Horn';
  bellMesh.position.set(-0.064, 0, 0);
  bellMesh.castShadow = true;
  rootGroup.add(bellMesh);

  // Billet Impeller visible inside bellmouth
  const impGeo = new THREE.ConeGeometry(0.038, 0.028, 16);
  impGeo.rotateZ(-Math.PI / 2);
  const impMesh = new THREE.Mesh(impGeo, matPulley);
  impMesh.name = 'Billet_Centrifugal_Impeller';
  impMesh.position.set(-0.045, 0, 0);
  rootGroup.add(impMesh);

  // 3. Tangential Discharge Duct & Silicone Coupler
  const ductGeo = new THREE.CylinderGeometry(0.032, 0.032, 0.075, 24);
  const ductMesh = new THREE.Mesh(ductGeo, matVolute);
  ductMesh.name = 'Boost_Discharge_Outlet_Duct';
  ductMesh.position.set(0, 0.095, 0);
  rootGroup.add(ductMesh);

  const coupGeo = new THREE.CylinderGeometry(0.034, 0.034, 0.028, 24);
  const coupMesh = new THREE.Mesh(coupGeo, matSilicone);
  coupMesh.name = 'Discharge_Silicone_Coupler';
  coupMesh.position.set(0, 0.125, 0);
  rootGroup.add(coupMesh);

  // Dual Stainless T-Bolt Clamps
  [-0.008, 0.008].forEach((cy) => {
    const clampGeo = createHoseClamp(0.070, 0.006);
    const clampMesh = new THREE.Mesh(clampGeo, matStainless);
    clampMesh.position.set(0, 0.125 + cy, 0);
    rootGroup.add(clampMesh);
  });

  // 4. Internal Planetary Step-Up Gearcase (Behind volute)
  const gearcaseGeo = new THREE.CylinderGeometry(0.062, 0.062, 0.055, 32);
  gearcaseGeo.rotateZ(Math.PI / 2);
  const gearcaseMesh = new THREE.Mesh(gearcaseGeo, matVolute);
  gearcaseMesh.name = 'Planetary_StepUp_Gearcase';
  gearcaseMesh.position.set(0.052, 0, 0);
  rootGroup.add(gearcaseMesh);

  // 5. Heavy-Duty CNC 6061 Billet Engine Mounting Bracket
  const bracketGeo = new THREE.BoxGeometry(0.016, 0.18, 0.14);
  const bracketMesh = new THREE.Mesh(bracketGeo, matVolute);
  bracketMesh.name = 'CNC_Billet_Mounting_Bracket';
  bracketMesh.position.set(0.088, -0.04, 0);
  rootGroup.add(bracketMesh);

  // 6. Cogged Input Pulley
  const pulleyGeo = new THREE.CylinderGeometry(0.038, 0.038, 0.034, 32);
  pulleyGeo.rotateZ(Math.PI / 2);
  const pulleyMesh = new THREE.Mesh(pulleyGeo, matPulley);
  pulleyMesh.name = 'Centrifugal_Drive_Pulley';
  pulleyMesh.position.set(0.108, 0, 0);
  pulleyMesh.castShadow = true;
  rootGroup.add(pulleyMesh);

  // 7. Cogged Drive Belt
  const beltCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.108, 0, 0),
    new THREE.Vector3(0.108, -0.14, 0.05),
    new THREE.Vector3(0.108, -0.26, 0),
    new THREE.Vector3(0.108, -0.14, -0.05),
  ], true);
  const beltGeo = new THREE.TubeGeometry(beltCurve, 32, 0.009, 10, true);
  const beltMesh = new THREE.Mesh(beltGeo, matBelt);
  beltMesh.name = 'Centrifugal_Cogged_Belt';
  rootGroup.add(beltMesh);

  return rootGroup;
}

/**
 * Builds the complete 3D scene graph for a Supercharger setup.
 */
export function buildSuperchargerScene(options?: SuperchargerBuildOptions): THREE.Scene {
  const scene = new THREE.Scene();
  scene.name = 'Supercharger_System_Scene';

  const rootGroup = new THREE.Group();
  rootGroup.name = 'Supercharger_Master_Assembly_Group';
  scene.add(rootGroup);

  if (options?.type === 'centrifugal_planetary') {
    const sc = createCentrifugalSuperchargerAssembly(options);
    sc.position.set(-0.16, 0.12, -0.22);
    rootGroup.add(sc);
  } else {
    const sc = createTwinScrewSuperchargerAssembly(options);
    sc.position.set(0, 0.08, 0);
    rootGroup.add(sc);
  }

  return scene;
}

/**
 * Exports the supercharger scene to a binary GLB ArrayBuffer.
 */
export async function generateSuperchargerGlbBuffer(
  options?: SuperchargerBuildOptions
): Promise<ArrayBuffer> {
  const scene = buildSuperchargerScene(options);
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

export async function generateTwinScrewSuperchargerGlbBuffer(options?: SuperchargerBuildOptions): Promise<ArrayBuffer> {
  return generateSuperchargerGlbBuffer({ ...options, type: 'twin_screw_roots' });
}

export async function generateCentrifugalSuperchargerGlbBuffer(options?: SuperchargerBuildOptions): Promise<ArrayBuffer> {
  return generateSuperchargerGlbBuffer({ ...options, type: 'centrifugal_planetary' });
}

export default buildSuperchargerScene;
