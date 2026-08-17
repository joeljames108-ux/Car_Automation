// ============================================================================
// ULTRA-HIGH-FIDELITY MODULAR GLB GENERATOR — 7-SPEED SEQUENTIAL TRANSAXLE
// ============================================================================
// Solid-modeling engineering generator for a 7-speed dog-engagement sequential
// transaxle gearbox. Features a cast magnesium casing with structural rib grid,
// integrated conical bellhousing with 3-plate carbon clutch and starter motor,
// 7 straight-cut dog-ring gearsets with pneumatic paddle-shift solenoid block,
// ramp-style clutch-pack limited slip differential (LSD), and 108mm CV drive flanges.
// ============================================================================

import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { globalMaterialLibrary } from '../materials/pbrMaterialSystem';

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

export interface TransaxleSpec {
  gearboxLengthM: number; // 0.520 m
  gearboxWidthM: number; // 0.340 m
  gearboxHeightM: number; // 0.320 m
  bellhousingDiameterM: number; // 0.380 m
  bellhousingLengthM: number; // 0.160 m
  diffFlangeDiameterMm: number; // 108.0 mm
  diffFlangeRadiusM: number; // 0.054 m
  gearPairsCount: number; // 7 gears + reverse
}

export const V12_TRANSAXLE_SPECS: TransaxleSpec = {
  gearboxLengthM: 0.520,
  gearboxWidthM: 0.340,
  gearboxHeightM: 0.320,
  bellhousingDiameterM: 0.380,
  bellhousingLengthM: 0.160,
  diffFlangeDiameterMm: 108.0,
  diffFlangeRadiusM: 0.054,
  gearPairsCount: 7,
};

/**
 * Builds the complete ultra-high-fidelity 3D scene graph for the sequential transaxle.
 */
export function buildTransaxleScene(): THREE.Scene {
  const scene = new THREE.Scene();
  scene.name = 'V12_Sequential_Transaxle_Scene';

  const rootGroup = new THREE.Group();
  rootGroup.name = '10_Transaxle_Gearbox_Master_Assembly_Group';
  scene.add(rootGroup);

  const matLib = globalMaterialLibrary;
  const matMagnesiumCase = matLib.getTransaxleMagnesium();
  const matBilletClutch = matLib.getMachinedBillet();
  const matCarbonPlates = matLib.getDryCarbonFiber();
  const matHardenedGears = matLib.getNitridedCrank();
  const matGoldAnodized = matLib.getGoldAnodized();
  const matSolenoidBlack = matLib.getBlackPolymer();
  const matDriveFlange = matLib.getMachinedBillet();

  const spec = V12_TRANSAXLE_SPECS;

  // ─── 1. STRUCTURAL MAGNESIUM GEARBOX CASING WITH EXTERIOR RIBS ───
  const casingGroup = new THREE.Group();
  casingGroup.name = 'Magnesium_Gearbox_Casing_Subsystem';

  // Main Tapered Gearbox Housing Body
  const caseGeo = new THREE.BoxGeometry(spec.gearboxLengthM, spec.gearboxWidthM, spec.gearboxHeightM);
  const caseMesh = new THREE.Mesh(caseGeo, matMagnesiumCase);
  caseMesh.name = 'High_Pressure_Magnesium_Main_Case';
  caseMesh.position.set(0.18, 0, 0);
  caseMesh.castShadow = true;
  caseMesh.receiveShadow = true;
  casingGroup.add(caseMesh);

  // Exterior Stiffening Grid Webbing Ribs (Top & Sides)
  for (let r = 0; r < 5; r++) {
    const rx = -0.04 + r * 0.11;

    // Top Rib
    const topRibGeo = new THREE.BoxGeometry(0.012, spec.gearboxWidthM - 0.04, 0.016);
    const topRibMesh = new THREE.Mesh(topRibGeo, matMagnesiumCase);
    topRibMesh.name = `Casing_Top_Stiffening_Rib_${r + 1}`;
    topRibMesh.position.set(rx, 0, spec.gearboxHeightM / 2 + 0.008);
    casingGroup.add(topRibMesh);

    // Left/Right Side Vertical Ribs
    [-spec.gearboxWidthM / 2 - 0.006, spec.gearboxWidthM / 2 + 0.006].forEach((sy, sIdx) => {
      const sideRibGeo = new THREE.BoxGeometry(0.012, 0.012, spec.gearboxHeightM - 0.04);
      const sideRibMesh = new THREE.Mesh(sideRibGeo, matMagnesiumCase);
      sideRibMesh.name = `Casing_Side_Rib_${r + 1}_${sIdx === 0 ? 'Left' : 'Right'}`;
      sideRibMesh.position.set(rx, sy, 0);
      casingGroup.add(sideRibMesh);
    });
  }

  rootGroup.add(casingGroup);

  // ─── 2. INTEGRATED BELLHOUSING CONE, 3-PLATE CLUTCH & STARTER ───
  const bellGroup = new THREE.Group();
  bellGroup.name = 'Bellhousing_Clutch_Starter_Subsystem';

  // Conical Bellhousing Adapter Casing
  const bellGeo = new THREE.CylinderGeometry(0.16, spec.bellhousingDiameterM / 2, spec.bellhousingLengthM, 32);
  bellGeo.rotateZ(Math.PI / 2);
  const bellMesh = new THREE.Mesh(bellGeo, matMagnesiumCase);
  bellMesh.name = 'Conical_Bellhousing_Adapter_Cone';
  bellMesh.position.set(-0.16, 0, 0);
  bellMesh.castShadow = true;
  bellGroup.add(bellMesh);

  // Tilton 7.25" 3-Plate Carbon-Carbon Racing Clutch Pressure Plate
  const clutchCoverGeo = new THREE.CylinderGeometry(0.105, 0.105, 0.045, 28);
  clutchCoverGeo.rotateZ(Math.PI / 2);
  const clutchCoverMesh = new THREE.Mesh(clutchCoverGeo, matBilletClutch);
  clutchCoverMesh.name = 'Tilton_Billet_Clutch_Cover';
  clutchCoverMesh.position.set(-0.18, 0, 0);
  bellGroup.add(clutchCoverMesh);

  // Exposed Carbon Friction Disc Rings
  [-0.19, -0.17].forEach((cx, cIdx) => {
    const discGeo = new THREE.TorusGeometry(0.092, 0.008, 12, 28);
    discGeo.rotateY(Math.PI / 2);
    const discMesh = new THREE.Mesh(discGeo, matCarbonPlates);
    discMesh.name = `Carbon_Friction_Disc_${cIdx + 1}`;
    discMesh.position.set(cx, 0, 0);
    bellGroup.add(discMesh);
  });

  // High-Torque Geared Reduction Starter Motor
  const starterGeo = new THREE.CylinderGeometry(0.042, 0.042, 0.14, 20);
  starterGeo.rotateZ(Math.PI / 2);
  const starterMesh = new THREE.Mesh(starterGeo, matSolenoidBlack);
  starterMesh.name = 'Geared_Reduction_Starter_Motor';
  starterMesh.position.set(-0.18, 0.14, 0.11);
  starterMesh.castShadow = true;
  bellGroup.add(starterMesh);

  // Starter Solenoid Unit
  const solGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.08, 16);
  solGeo.rotateZ(Math.PI / 2);
  const solMesh = new THREE.Mesh(solGeo, matGoldAnodized);
  solMesh.name = 'Starter_Solenoid_Relay';
  solMesh.position.set(-0.18, 0.14, 0.16);
  bellGroup.add(solMesh);

  rootGroup.add(bellGroup);

  // ─── 3. 7 DOG-ENGAGEMENT SEQUENTIAL GEARSETS & PADDLE ACTUATOR ───
  const gearGroup = new THREE.Group();
  gearGroup.name = 'Sequential_Gearsets_Actuator_Subsystem';

  // Input & Output Cluster Shafts with 7 Straight-Cut Gear Pairs
  for (let g = 0; g < 7; g++) {
    const gx = 0.02 + g * 0.055;
    const gearRad = 0.048 + (g % 2 === 0 ? 0.014 : -0.010);

    const gearGeo = new THREE.CylinderGeometry(gearRad, gearRad, 0.024, 24);
    gearGeo.rotateZ(Math.PI / 2);
    const gearMesh = new THREE.Mesh(gearGeo, matHardenedGears);
    gearMesh.name = `StraightCut_Dog_Gear_${g + 1}_Speed`;
    gearMesh.position.set(gx, 0, 0.04);
    gearGroup.add(gearMesh);

    // Dog Engagement Dog-Ring with Face Teeth
    const dogGeo = new THREE.CylinderGeometry(0.038, 0.038, 0.012, 16);
    dogGeo.rotateZ(Math.PI / 2);
    const dogMesh = new THREE.Mesh(dogGeo, matHardenedGears);
    dogMesh.name = `Dog_Engagement_Slider_${g + 1}`;
    dogMesh.position.set(gx + 0.018, 0, 0.04);
    gearGroup.add(dogMesh);
  }

  // Top Electro-Pneumatic Paddle-Shift Solenoid Block
  const pneuBlockGeo = new THREE.BoxGeometry(0.12, 0.09, 0.06);
  const pneuBlockMesh = new THREE.Mesh(pneuBlockGeo, matGoldAnodized);
  pneuBlockMesh.name = 'Pneumatic_PaddleShift_Valve_Block';
  pneuBlockMesh.position.set(0.18, 0, spec.gearboxHeightM / 2 + 0.04);
  pneuBlockMesh.castShadow = true;
  gearGroup.add(pneuBlockMesh);

  // Dual Fast-Acting Shift Actuator Solenoid Cylinders (Upshift / Downshift)
  [-0.03, 0.03].forEach((sy, sIdx) => {
    const solGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.045, 16);
    const solMesh = new THREE.Mesh(solGeo, matSolenoidBlack);
    solMesh.name = `Shift_Solenoid_Valve_${sIdx === 0 ? 'Upshift' : 'Downshift'}`;
    solMesh.position.set(0.18, sy, spec.gearboxHeightM / 2 + 0.08);
    gearGroup.add(solMesh);
  });

  rootGroup.add(gearGroup);

  // ─── 4. RAMP-STYLE LSD & 108MM CV DRIVE FLANGES ───
  const diffGroup = new THREE.Group();
  diffGroup.name = 'LSD_Differential_DriveFlanges_Subsystem';

  // Bulged Center Differential Carrier Swelling
  const diffSphereGeo = new THREE.SphereGeometry(0.13, 24, 20);
  const diffSphereMesh = new THREE.Mesh(diffSphereGeo, matMagnesiumCase);
  diffSphereMesh.name = 'Differential_Crown_Wheel_Carrier_Bulge';
  diffSphereMesh.position.set(0.38, 0, -0.02);
  diffGroup.add(diffSphereMesh);

  // Dual 108mm Porsche-Style 6-Bolt CV Drive Flange Hubs
  [-1, 1].forEach((dir) => {
    const yPos = dir * (spec.gearboxWidthM / 2 + 0.035);

    // 108mm Machined CV Output Flange
    const flangeGeo = new THREE.CylinderGeometry(spec.diffFlangeRadiusM, spec.diffFlangeRadiusM, 0.028, 28);
    flangeGeo.rotateX(Math.PI / 2);
    const flangeMesh = new THREE.Mesh(flangeGeo, matDriveFlange);
    flangeMesh.name = `CV_Drive_Output_Flange_${dir === -1 ? 'Left' : 'Right'}`;
    flangeMesh.position.set(0.38, yPos, -0.02);
    flangeMesh.castShadow = true;
    diffGroup.add(flangeMesh);

    // 6 Perimeter M10 Aerospace CV Bolts
    for (let b = 0; b < 6; b++) {
      const bAngle = (b * Math.PI * 2) / 6;
      const bz = Math.sin(bAngle) * 0.040;
      const bx = Math.cos(bAngle) * 0.040;

      const cvBoltGeo = new THREE.CylinderGeometry(0.004, 0.004, 0.014, 12);
      cvBoltGeo.rotateX(Math.PI / 2);
      const cvBoltMesh = new THREE.Mesh(cvBoltGeo, matHardenedGears);
      cvBoltMesh.name = `CV_Bolt_${b + 1}_${dir === -1 ? 'Left' : 'Right'}`;
      cvBoltMesh.position.set(0.38 + bx, yPos + dir * 0.014, -0.02 + bz);
      diffGroup.add(cvBoltMesh);
    }
  });

  rootGroup.add(diffGroup);

  return scene;
}

/**
 * Exports the transaxle scene to a binary GLB ArrayBuffer.
 */
export async function generateTransaxleGlbBuffer(): Promise<ArrayBuffer> {
  const scene = buildTransaxleScene();
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
