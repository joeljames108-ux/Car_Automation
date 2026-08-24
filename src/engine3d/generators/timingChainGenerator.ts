// ============================================================================
// ULTRA-HIGH-FIDELITY MODULAR GLB GENERATOR — DUAL-ROLLER MOTORSPORT TIMING TRAIN
// ============================================================================
// Solid-modeling engineering generator for the 60° V12 timing drive: twin
// hardened chrome-alloy roller chains, four billet adjustable vernier cam
// gears with lightening drillings and 12-point center bolts, hardened crank
// snout sprocket, spring-blade slack-side guide rails, and hydraulic
// auto-tensioner shoes with piston bores.
//
// Declared in v12Manifest as component type 'timing-chain' with default
// transform position (-0.31, 0, 0.25) relative to the engine block and an
// exploded offset of (-0.20, 0, 0).
// ============================================================================

import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { create12PointHead, createKnurledBand } from './geometryDetailUtils';

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

/**
 * Builds the complete ultra-high-fidelity 3D scene graph for the timing train.
 */
export function buildTimingChainScene(): THREE.Scene {
  const scene = new THREE.Scene();
  scene.name = 'Dual_Roller_Timing_Train_Scene';

  const rootGroup = new THREE.Group();
  rootGroup.name = 'Timing_Train_Master_Assembly_Group';
  scene.add(rootGroup);

  // ─── MATERIALS ───
  const matChainSteel = new THREE.MeshStandardMaterial({
    name: 'Hardened_Chrome_Alloy_Roller_Chain',
    color: new THREE.Color(0xcbd5e1),
    metalness: 0.90,
    roughness: 0.22,
  });

  const matBilletGear = new THREE.MeshStandardMaterial({
    name: 'Billet_Adjustable_Vernier_Cam_Gear',
    color: new THREE.Color(0xf59e0b),
    metalness: 0.92,
    roughness: 0.16,
  });

  const matCrankSprocket = new THREE.MeshStandardMaterial({
    name: 'Case_Hardened_Crank_Sprocket',
    color: new THREE.Color(0x94a3b8),
    metalness: 0.88,
    roughness: 0.25,
  });

  const matTensionerBody = new THREE.MeshStandardMaterial({
    name: 'Anodized_Hydraulic_Tensioner_Body',
    color: new THREE.Color(0x0284c7),
    metalness: 0.85,
    roughness: 0.2,
  });

  const matGuidePolymer = new THREE.MeshStandardMaterial({
    name: 'Low_Friction_Polymer_Guide_Rail',
    color: new THREE.Color(0x111827),
    metalness: 0.05,
    roughness: 0.65,
  });

  const matSpringSteel = new THREE.MeshStandardMaterial({
    name: 'Music_Wire_Spring_Steel',
    color: new THREE.Color(0x64748b),
    metalness: 0.9,
    roughness: 0.3,
  });

  // ─── SHARED GEOMETRY ───
  const linkGeo = new THREE.BoxGeometry(0.010, 0.012, 0.007);
  const gearFaceGeo = new THREE.CylinderGeometry(0.042, 0.042, 0.011, 32);
  gearFaceGeo.rotateZ(Math.PI / 2);
  const gearToothRingGeo = createKnurledBand(0.044, 0.009, 36);
  const gearHubGeo = new THREE.CylinderGeometry(0.013, 0.013, 0.020, 18);
  gearHubGeo.rotateZ(Math.PI / 2);
  const centerBoltGeo = create12PointHead(0.008, 0.008, 0.010, 0.0025);
  const lighteningDiscGeo = new THREE.CylinderGeometry(0.0065, 0.0065, 0.013, 12);
  lighteningDiscGeo.rotateZ(Math.PI / 2);

  // ─── 1. FOUR BILLET VERNIER CAM GEARS (TWIN BANKS × INTAKE/EXHAUST) ───
  const gearGroup = new THREE.Group();
  gearGroup.name = 'Vernier_Cam_Gear_Subsystem';

  const gearSpots: Array<[number, number, string]> = [
    [0.155, -0.012, 'Bank1_Intake'],
    [0.075, 0.026, 'Bank1_Exhaust'],
    [-0.155, -0.012, 'Bank2_Intake'],
    [-0.075, 0.026, 'Bank2_Exhaust'],
  ];

  for (const [gy, gxPlaneOffset, tag] of gearSpots) {
    for (const planeX of [-0.016, 0.016]) {
      const gearName = `Cam_Gear_${tag}_${planeX < 0 ? 'Front' : 'Rear'}_Plane`;

      gearGroup.add(namedMesh(gearFaceGeo, matBilletGear, gearName, planeX, gy, gxPlaneOffset));

      const teeth = namedMesh(gearToothRingGeo, matBilletGear, `${gearName}_ToothRing`, planeX, gy, gxPlaneOffset);
      teeth.rotation.z = Math.PI / 2;
      gearGroup.add(teeth);

      gearGroup.add(namedMesh(gearHubGeo, matBilletGear, `${gearName}_Hub`, planeX, gy, gxPlaneOffset));

      const bolt = namedMesh(centerBoltGeo, matChainSteel, `${gearName}_Center_12pt_Bolt`, planeX + 0.012, gy, gxPlaneOffset);
      bolt.rotation.z = Math.PI / 2;
      gearGroup.add(bolt);

      for (let d = 0; d < 6; d++) {
        const ang = (d * Math.PI * 2) / 6;
        const disc = namedMesh(lighteningDiscGeo, matGuidePolymer, `${gearName}_Lightening_Drill_${d + 1}`, planeX, gy + Math.cos(ang) * 0.028, gxPlaneOffset + Math.sin(ang) * 0.028);
        gearGroup.add(disc);
      }

      for (let v = 0; v < 3; v++) {
        const vang = ((v + 0.5) * Math.PI * 2) / 3;
        const spoke = namedMesh(new THREE.BoxGeometry(0.024, 0.008, 0.008), matBilletGear, `${gearName}_Vernier_Index_Mark_${v + 1}`, planeX + 0.007, gy + Math.cos(vang) * 0.024, gxPlaneOffset + Math.sin(vang) * 0.024);
        spoke.rotation.z = vang;
        gearGroup.add(spoke);
      }
    }
  }

  rootGroup.add(gearGroup);

  // ─── 2. HARDENED CRANK SNOUT SPROCKET ───
  const crankSprocketGroup = new THREE.Group();
  crankSprocketGroup.name = 'Crank_Snout_Sprocket_Subsystem';

  for (const planeX of [-0.016, 0.016]) {
    const crankGearGeo = new THREE.CylinderGeometry(0.030, 0.030, 0.010, 28);
    crankGearGeo.rotateZ(Math.PI / 2);
    crankSprocketGroup.add(namedMesh(crankGearGeo, matCrankSprocket, `Crank_Sprocket_${planeX < 0 ? 'Front' : 'Rear'}_Plane`, planeX, -0.175, 0.0));

    const crankTeeth = namedMesh(createKnurledBand(0.0315, 0.008, 28), matCrankSprocket, `Crank_Sprocket_ToothRing_${planeX < 0 ? 'Front' : 'Rear'}_Plane`, planeX, -0.175, 0.0);
    crankTeeth.rotation.z = Math.PI / 2;
    crankSprocketGroup.add(crankTeeth);
  }

  const snoutKey = namedMesh(new THREE.BoxGeometry(0.05, 0.006, 0.006), matCrankSprocket, 'Crank_Snout_Keyway_Bar', 0.0, -0.175, 0.0);
  crankSprocketGroup.add(snoutKey);

  rootGroup.add(crankSprocketGroup);

  // ─── 3. TWIN ROLLER CHAINS WITH INDIVIDUAL LINK SEGMENTS ───
  const chainGroup = new THREE.Group();
  chainGroup.name = 'Dual_Roller_Chain_Subsystem';

  const loopPoints = [
    new THREE.Vector3(0, 0.205, -0.012),
    new THREE.Vector3(0, 0.115, -0.045),
    new THREE.Vector3(0, -0.115, -0.045),
    new THREE.Vector3(0, -0.215, -0.010),
    new THREE.Vector3(0, -0.120, 0.040),
    new THREE.Vector3(0, 0.110, 0.040),
  ];
  const chainCurveTemplate = new THREE.CatmullRomCurve3(loopPoints, true);

  let linkIdx = 0;
  for (const planeX of [-0.016, 0.016]) {
    const tag = planeX < 0 ? 'Front' : 'Rear';

    const spaced = chainCurveTemplate.getSpacedPoints(56);
    for (let i = 0; i < spaced.length; i++) {
      const p = spaced[i];
      const pNext = spaced[(i + 1) % spaced.length];
      linkIdx++;

      const link = namedMesh(linkGeo, matChainSteel, `Roller_Chain_Link_${tag}_${linkIdx}`, planeX, p.y, p.z);
      const dy = pNext.y - p.y;
      const dz = pNext.z - p.z;
      link.rotation.x = Math.atan2(dy, dz);
      chainGroup.add(link);

      if (i % 2 === 0) {
        const roller = namedMesh(new THREE.CylinderGeometry(0.0035, 0.0035, 0.011, 8), matSpringSteel, `Chain_Roller_Pin_${tag}_${linkIdx}`, planeX, p.y, p.z);
        roller.rotation.z = Math.PI / 2;
        chainGroup.add(roller);
      }
    }
  }

  rootGroup.add(chainGroup);

  // ─── 4. HYDRAULIC AUTO-TENSIONER SHOES & SPRING BLADE GUIDES ───
  const tensionerGroup = new THREE.Group();
  tensionerGroup.name = 'Tensioner_Guide_Rail_Subsystem';

  for (const planeX of [-0.016, 0.016]) {
    const tag = planeX < 0 ? 'Front' : 'Rear';

    const tensionerBody = namedMesh(new THREE.CylinderGeometry(0.014, 0.016, 0.055, 16), matTensionerBody, `Hydraulic_Tensioner_Body_${tag}`, planeX, 0.02, -0.075);
    tensionerBody.rotation.x = 0.35;
    tensionerGroup.add(tensionerBody);

    const piston = namedMesh(new THREE.CylinderGeometry(0.009, 0.009, 0.030, 12), matSpringSteel, `Tensioner_Plunger_Piston_${tag}`, planeX, 0.02, -0.105);
    piston.rotation.x = 0.35;
    tensionerGroup.add(piston);

    const shoeCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(planeX, 0.10, -0.052),
      new THREE.Vector3(planeX, 0.0, -0.058),
      new THREE.Vector3(planeX, -0.09, -0.048),
    ]);
    tensionerGroup.add(namedMesh(new THREE.TubeGeometry(shoeCurve, 12, 0.008, 8), matGuidePolymer, `SlackSide_Tensioner_Shoe_${tag}`));

    const railCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(planeX, 0.12, 0.052),
      new THREE.Vector3(planeX, 0.0, 0.056),
      new THREE.Vector3(planeX, -0.11, 0.050),
    ]);
    tensionerGroup.add(namedMesh(new THREE.TubeGeometry(railCurve, 12, 0.008, 8), matGuidePolymer, `Fixed_Guide_Rail_Blade_${tag}`));

    const springCoilPts: THREE.Vector3[] = [];
    for (let c = 0; c <= 24; c++) {
      const t = c / 24;
      springCoilPts.push(new THREE.Vector3(planeX + Math.cos(t * Math.PI * 8) * 0.007, -0.02 - t * 0.07, -0.075));
    }
    tensionerGroup.add(namedMesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(springCoilPts), 32, 0.0022, 6), matSpringSteel, `Tensioner_Return_Spring_${tag}`));

    for (const py of [0.10, -0.09]) {
      const pivot = namedMesh(create12PointHead(0.006, 0.006, 0.008, 0.002), matChainSteel, `Guide_Rail_Pivot_Bolt_${tag}_${py > 0 ? 'Top' : 'Bottom'}`, planeX, py, py > 0 ? 0.048 : -0.044);
      pivot.rotation.x = Math.PI / 2;
      tensionerGroup.add(pivot);
    }
  }

  rootGroup.add(tensionerGroup);

  return scene;
}

/**
 * Exports the timing train scene to a binary GLB ArrayBuffer.
 */
export async function generateTimingChainGlbBuffer(): Promise<ArrayBuffer> {
  const scene = buildTimingChainScene();
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

export default buildTimingChainScene;
