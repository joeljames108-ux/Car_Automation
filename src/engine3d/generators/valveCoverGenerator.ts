// ============================================================================
// ULTRA-HIGH-FIDELITY MODULAR GLB GENERATOR — BILLET ANODIZED VALVE COVERS
// ============================================================================
// Solid-modeling engineering generator for Bank 1 (Left) and Bank 2 (Right)
// CNC billet 6061-T6 aluminum valve covers. Features multi-tiered aerodynamic
// cooling fins, 6 isolated deep spark plug wells with coil-on-plug retention
// bosses, coil harness routing p-clips, internal labyrinth oil/air separator baffle
// chambers, dual AN-10 breather bungs, knurled quick-release oil filler neck (Bank 1),
// Viton molded perimeter seal gasket, and 16 perimeter Allen socket cap screws.
// ============================================================================

import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import type { EngineConfig } from '../../sim/types';
import { globalMaterialLibrary } from '../materials/pbrMaterialSystem';
import {
  createAllenSocketHead,
  createKnurledBand,
  createORingSeal,
} from './geometryDetailUtils';
import { buildStrokeLettering } from './engineCoverGenerator';

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

export interface ValveCoverSpec {
  coverLengthM: number; // 0.620 m
  coverWidthM: number; // 0.160 m
  coverHeightM: number; // 0.085 m
  finCount: number; // 5 longitudinal cooling fins
  finHeightM: number; // 0.016 m
  flangeThicknessM: number; // 0.008 m
  sparkWellRadiusM: number; // 0.015 m
  anFittingDiameterMm: number; // AN-10 (22mm hex)
}

export const V12_COVER_SPECS: ValveCoverSpec = {
  coverLengthM: 0.620,
  coverWidthM: 0.160,
  coverHeightM: 0.085,
  finCount: 5,
  finHeightM: 0.016,
  flangeThicknessM: 0.008,
  sparkWellRadiusM: 0.015,
  anFittingDiameterMm: 22.0,
};

/**
 * Builds the complete ultra-high-fidelity 3D scene graph for an anodized billet valve cover.
 */
export function buildValveCoverScene(bankSide: 'left' | 'right', configOrCyls?: Partial<EngineConfig> | number): THREE.Scene {
  const isLeft = bankSide === 'left';
  const scene = new THREE.Scene();
  scene.name = `Valve_Cover_${isLeft ? 'Bank1_Left' : 'Bank2_Right'}_Scene`;

  const rootGroup = new THREE.Group();
  rootGroup.name = `Valve_Cover_${isLeft ? 'Left' : 'Right'}_Master_Group`;
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
  const matGoldCover = matLib.getGoldAnodized();
  const matBilletCap = matLib.getMachinedBillet();
  const matCarbonIgnition = matLib.getBlackPolymer();
  const matCobaltAn = matLib.getCobaltAnodized();
  const matStainlessFastener = matLib.getNitridedCrank();
  const matInternalBaffle = matLib.getCastAluminum();
  const matVitonGasket = matLib.getRubberOring();

  const spec = V12_COVER_SPECS;
  const cylSpacingM = 0.100;
  const coverLengthM = (cylsPerBank - 1) * cylSpacingM + 0.120;
  const halfSpanX = ((cylsPerBank - 1) * cylSpacingM) / 2;

  // ─── 1. CNC SCULPTED BILLET COVER CASING & COOLING FINS ───
  const shellGroup = new THREE.Group();
  shellGroup.name = 'Valve_Cover_Shell_Subsystem';

  // Sculpted Chamfered Main Cover Shell
  const coverGeo = new THREE.BoxGeometry(coverLengthM, spec.coverWidthM, spec.coverHeightM - 0.015);
  const coverMesh = new THREE.Mesh(coverGeo, matGoldCover);
  coverMesh.name = 'Valve_Cover_Main_Billet_Shell';
  coverMesh.position.set(0, 0, 0);
  coverMesh.castShadow = true;
  coverMesh.receiveShadow = true;
  shellGroup.add(coverMesh);

  // Perimeter Gasket Mating Flange Rail
  const flangeGeo = new THREE.BoxGeometry(coverLengthM + 0.008, spec.coverWidthM + 0.008, spec.flangeThicknessM);
  const flangeMesh = new THREE.Mesh(flangeGeo, matGoldCover);
  flangeMesh.name = 'Perimeter_Gasket_Mating_Flange';
  flangeMesh.position.set(0, 0, -spec.coverHeightM / 2 + spec.flangeThicknessM / 2);
  flangeMesh.castShadow = true;
  shellGroup.add(flangeMesh);

  // Molded Viton Perimeter Gasket Strip
  const gasketGeo = new THREE.BoxGeometry(coverLengthM + 0.006, spec.coverWidthM + 0.006, 0.002);
  const gasketMesh = new THREE.Mesh(gasketGeo, matVitonGasket);
  gasketMesh.name = 'Molded_Viton_Perimeter_Gasket';
  gasketMesh.position.set(0, 0, -spec.coverHeightM / 2 - 0.001);
  shellGroup.add(gasketMesh);

  // Longitudinal Aerodynamic Heat-Sink Cooling Fins
  [-0.05, -0.025, 0, 0.025, 0.05].forEach((finY, finIdx) => {
    const finGeo = new THREE.BoxGeometry(coverLengthM - 0.04, 0.0045, spec.finHeightM);
    const finMesh = new THREE.Mesh(finGeo, matGoldCover);
    finMesh.name = `Longitudinal_Cooling_Fin_${finIdx + 1}`;
    finMesh.position.set(0, finY, spec.coverHeightM / 2 - 0.002);
    finMesh.castShadow = true;
    shellGroup.add(finMesh);
  });

  // Laser-Etched "APEX V12" Anodized Badge Lettering on the Front Deck Strip
  const badgeGeo = buildStrokeLettering('APEX V12', 0.02, 0.62, 0.0025, 0.12);
  const badgeMesh = new THREE.Mesh(badgeGeo, matCarbonIgnition);
  badgeMesh.name = 'Valve_Cover_Badge_Apex_V12_Anodized_Lettering';
  badgeMesh.position.set(0, -0.065, spec.coverHeightM / 2 - 0.0065);
  shellGroup.add(badgeMesh);

  rootGroup.add(shellGroup);

  // ─── 2. ISOLATED SPARK PLUG WELLS & COIL-ON-PLUG PACKS ───
  const ignitionGroup = new THREE.Group();
  ignitionGroup.name = 'Coil_On_Plug_Ignition_Subsystem';

  for (let s = 0; s < cylsPerBank; s++) {
    const cx = -halfSpanX + s * cylSpacingM;

    // Recessed Viton Sealed Spark Plug Pass-Through Tube
    const tubeGeo = new THREE.CylinderGeometry(spec.sparkWellRadiusM, spec.sparkWellRadiusM, spec.coverHeightM + 0.004, 32);
    const tubeMesh = new THREE.Mesh(tubeGeo, matBilletCap);
    tubeMesh.name = `Spark_Plug_Seal_Tube_${s + 1}`;
    tubeMesh.position.set(cx, 0, 0);
    ignitionGroup.add(tubeMesh);

    // High-Output Smart Ignition Coil-On-Plug Housing
    const coilGeo = new THREE.BoxGeometry(0.028, 0.038, 0.016);
    const coilMesh = new THREE.Mesh(coilGeo, matCarbonIgnition);
    coilMesh.name = `Smart_Ignition_Coil_Pack_${s + 1}`;
    coilMesh.position.set(cx, 0, spec.coverHeightM / 2 + 0.006);
    coilMesh.castShadow = true;
    ignitionGroup.add(coilMesh);

    // Rubber Insulating Boot Extending into the Spark Tube
    const bootGeo = new THREE.CylinderGeometry(0.008, 0.006, 0.022, 16);
    const bootMesh = new THREE.Mesh(bootGeo, matVitonGasket);
    bootMesh.name = `Coil_Rubber_Insulating_Boot_${s + 1}`;
    bootMesh.position.set(cx, 0, spec.coverHeightM / 2 - 0.002);
    ignitionGroup.add(bootMesh);

    // Electrical Connection Plug Body on the Coil Flank
    const plugBodyGeo = new THREE.BoxGeometry(0.014, 0.012, 0.010);
    const plugBodyMesh = new THREE.Mesh(plugBodyGeo, matCarbonIgnition);
    plugBodyMesh.name = `Coil_Connector_Plug_${s + 1}`;
    plugBodyMesh.position.set(cx, -0.026, spec.coverHeightM / 2 + 0.010);
    ignitionGroup.add(plugBodyMesh);

    // Coil Retention M6 Socket Cap Screw
    const coilBoltGeo = createAllenSocketHead(0.003, 0.012);
    const coilBoltMesh = new THREE.Mesh(coilBoltGeo, matStainlessFastener);
    coilBoltMesh.name = `Coil_M6_Fastener_${s + 1}`;
    coilBoltMesh.position.set(cx, 0.016, spec.coverHeightM / 2 + 0.014);
    ignitionGroup.add(coilBoltMesh);

    // Wiring Harness Routing Clip (P-Clip on side of coil)
    const pclipGeo = new THREE.BoxGeometry(0.004, 0.008, 0.006);
    const pclipMesh = new THREE.Mesh(pclipGeo, matStainlessFastener);
    pclipMesh.name = `Coil_Wiring_PClip_${s + 1}`;
    pclipMesh.position.set(cx, -0.018, spec.coverHeightM / 2 + 0.010);
    ignitionGroup.add(pclipMesh);
  }

  // Ignition Harness Loom Routed Through the Connector Plugs
  const loomCurve = new THREE.CatmullRomCurve3(
    Array.from({ length: cylsPerBank }, (_, i) =>
      new THREE.Vector3(-halfSpanX + i * cylSpacingM, -0.026, spec.coverHeightM / 2 + 0.010)
    )
  );
  const loomGeo = new THREE.TubeGeometry(loomCurve, cylsPerBank * 8, 0.004, 10, false);
  const loomMesh = new THREE.Mesh(loomGeo, matVitonGasket);
  loomMesh.name = 'Ignition_Coil_Harness_Loom';
  ignitionGroup.add(loomMesh);

  rootGroup.add(ignitionGroup);

  // ─── 3. OIL FILLER SYSTEM & DUAL CRANKCASE BREATHER AN-10 FITTINGS ───
  const breatherGroup = new THREE.Group();
  breatherGroup.name = 'Breather_Oil_Filler_Subsystem';

  // Bank 1 (Left) CNC Quick-Turn Knurled Oil Filler Neck & Cap
  if (isLeft) {
    const fillerNeckGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.032, 32);
    const fillerNeckMesh = new THREE.Mesh(fillerNeckGeo, matBilletCap);
    fillerNeckMesh.name = 'Billet_Oil_Filler_Neck';
    fillerNeckMesh.position.set(-0.24, 0.045, spec.coverHeightM / 2 + 0.012);
    fillerNeckMesh.castShadow = true;
    breatherGroup.add(fillerNeckMesh);

    const fillerCapGeo = new THREE.CylinderGeometry(0.026, 0.026, 0.014, 32);
    const fillerCapMesh = new THREE.Mesh(fillerCapGeo, matGoldCover);
    fillerCapMesh.name = 'Knurled_Billet_Oil_Filler_Cap';
    fillerCapMesh.position.set(-0.24, 0.045, spec.coverHeightM / 2 + 0.028);
    fillerCapMesh.castShadow = true;
    breatherGroup.add(fillerCapMesh);

    // Knurled Diamond Grip Perimeter Band on Oil Cap
    const knurlGeo = createKnurledBand(0.0262, 0.008, 36);
    const knurlMesh = new THREE.Mesh(knurlGeo, matBilletCap);
    knurlMesh.name = 'OilCap_Knurled_Grip_Band';
    knurlMesh.position.set(-0.24, 0.045, spec.coverHeightM / 2 + 0.028);
    breatherGroup.add(knurlMesh);

    // Laser-Etched "OIL" Lettering on the Filler Cap Face
    const oilLetterGeo = buildStrokeLettering('OIL', 0.011, 0.62, 0.0015, 0);
    const oilLetterMesh = new THREE.Mesh(oilLetterGeo, matCarbonIgnition);
    oilLetterMesh.name = 'Oil_Filler_Cap_Anodized_Lettering';
    oilLetterMesh.position.set(-0.24, 0.045, spec.coverHeightM / 2 + 0.0355);
    breatherGroup.add(oilLetterMesh);
  }

  // Dual AN-10 (7/8-14 UNF) Crankcase Breather Fitting Bungs
  [0.22, 0.26].forEach((bx, bIdx) => {
    const anHexGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.028, 6);
    anHexGeo.rotateX(Math.PI / 2);
    const anHexMesh = new THREE.Mesh(anHexGeo, matCobaltAn);
    anHexMesh.name = `AN10_Breather_Hex_Fitting_${bIdx + 1}`;
    anHexMesh.position.set(bx, isLeft ? 0.075 : -0.075, 0.01);
    anHexMesh.castShadow = true;
    breatherGroup.add(anHexMesh);

    // Blue Anodized Port Flange Nut
    const anNutGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.008, 6);
    anNutGeo.rotateX(Math.PI / 2);
    const anNutMesh = new THREE.Mesh(anNutGeo, matCobaltAn);
    anNutMesh.name = `AN10_Port_Locknut_${bIdx + 1}`;
    anNutMesh.position.set(bx, isLeft ? 0.062 : -0.062, 0.01);
    breatherGroup.add(anNutMesh);

    // Rubber Breather Hose Stub Exiting the Fitting
    const hoseGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.022, 16);
    hoseGeo.rotateX(Math.PI / 2);
    const hoseMesh = new THREE.Mesh(hoseGeo, matVitonGasket);
    hoseMesh.name = `AN10_Breather_Hose_Stub_${bIdx + 1}`;
    hoseMesh.position.set(bx, isLeft ? 0.092 : -0.092, 0.01);
    breatherGroup.add(hoseMesh);
  });

  // Internal Labyrinth Oil/Air Separator Baffle Chamber
  const baffleGeo = new THREE.BoxGeometry(0.12, 0.08, 0.012);
  const baffleMesh = new THREE.Mesh(baffleGeo, matInternalBaffle);
  baffleMesh.name = 'Internal_Labyrinth_Oil_Separator_Baffle';
  baffleMesh.position.set(0.24, 0, -spec.coverHeightM / 2 + 0.02);
  breatherGroup.add(baffleMesh);

  rootGroup.add(breatherGroup);

  // ─── 4. 16 PERIMETER FLANGE MOUNTING SOCKET CAP SCREWS ───
  const fastenerGroup = new THREE.Group();
  fastenerGroup.name = 'Perimeter_Fastener_Hardware_Subsystem';

  for (let f = 0; f < 8; f++) {
    const fx = -0.28 + f * (0.56 / 7);

    [-spec.coverWidthM / 2 - 0.002, spec.coverWidthM / 2 + 0.002].forEach((fy, fIdx) => {
      const boltGeo = createAllenSocketHead(0.004, 0.012);
      const boltMesh = new THREE.Mesh(boltGeo, matStainlessFastener);
      boltMesh.name = `Flange_M6_Socket_Bolt_${f + 1}_${fIdx === 0 ? 'Inner' : 'Outer'}`;
      boltMesh.position.set(fx, fy, -spec.coverHeightM / 2 + spec.flangeThicknessM + 0.004);
      boltMesh.castShadow = true;
      fastenerGroup.add(boltMesh);
    });
  }

  // End Flange Retention Bolts (2 per end)
  [-(coverLengthM / 2 - 0.015), coverLengthM / 2 - 0.015].forEach((ex, eIdx) => {
    [-0.04, 0.04].forEach((ey) => {
      const endBoltGeo = createAllenSocketHead(0.004, 0.012);
      const endBoltMesh = new THREE.Mesh(endBoltGeo, matStainlessFastener);
      endBoltMesh.name = `Flange_End_Bolt_${eIdx === 0 ? 'Front' : 'Rear'}_${ey < 0 ? 'A' : 'B'}`;
      endBoltMesh.position.set(ex, ey, -spec.coverHeightM / 2 + spec.flangeThicknessM + 0.004);
      endBoltMesh.castShadow = true;
      fastenerGroup.add(endBoltMesh);
    });
  });

  rootGroup.add(fastenerGroup);

  return scene;
}

/**
 * Exports the valve cover scene to a binary GLB ArrayBuffer.
 */
export async function generateValveCoverGlbBuffer(bankSide: 'left' | 'right'): Promise<ArrayBuffer> {
  const scene = buildValveCoverScene(bankSide);
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

export default buildValveCoverScene;
