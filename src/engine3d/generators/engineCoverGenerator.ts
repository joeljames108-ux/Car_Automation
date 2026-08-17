// ============================================================================
// ULTRA-HIGH-FIDELITY MODULAR GLB GENERATOR — DRY CARBON ENGINE COVER
// ============================================================================
// Solid-modeling engineering generator for an autoclaved 3K 2x2 twill dry carbon
// fiber monocoque beauty cover. Features molded aerodynamic side pontoons, heat
// extraction louver slots, CNC gold-anodized perimeter trim bezel with laser-etched
// "V12 TWIN-TURBO 6.0L" badge plaque, center transmissive quartz glass viewing
// window exposing the ITB velocity stacks, and 4 Dzus aerospace fasteners.
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

export interface EngineCoverSpec {
  coverLengthM: number; // 0.720 m
  coverWidthM: number; // 0.440 m
  coverHeightM: number; // 0.045 m
  glassWindowWidthM: number; // 0.160 m
  glassWindowLengthM: number; // 0.540 m
  scoopHeightM: number; // 0.038 m
  louverCount: number; // 6 louvers per side
}

export const V12_COVER_SPECS: EngineCoverSpec = {
  coverLengthM: 0.720,
  coverWidthM: 0.440,
  coverHeightM: 0.045,
  glassWindowWidthM: 0.160,
  glassWindowLengthM: 0.540,
  scoopHeightM: 0.038,
  louverCount: 6,
};

/**
 * Builds the complete ultra-high-fidelity 3D scene graph for the dry carbon engine cover.
 */
export function buildEngineCoverScene(): THREE.Scene {
  const scene = new THREE.Scene();
  scene.name = 'V12_Dry_Carbon_EngineCover_Scene';

  const rootGroup = new THREE.Group();
  rootGroup.name = '12_Engine_Cover_Master_Assembly_Group';
  scene.add(rootGroup);

  const matLib = globalMaterialLibrary;
  const matCarbonShell = matLib.getDryCarbonFiber();
  const matGoldBezel = matLib.getGoldAnodized();
  const matQuartzGlass = matLib.getQuartzGlass();
  const matDzusFastener = matLib.getNitridedCrank();
  const matMeshGrille = matLib.getBlackPolymer();

  const spec = V12_COVER_SPECS;

  // ─── 1. 3K 2X2 TWILL DRY CARBON MONOCOQUE COVER SHELL ───
  const shellGroup = new THREE.Group();
  shellGroup.name = 'Carbon_Monocoque_Shell_Subsystem';

  // Aerodynamic Sculpted Carbon Cover Body
  const coverGeo = new THREE.BoxGeometry(spec.coverLengthM, spec.coverWidthM, spec.coverHeightM);
  const coverMesh = new THREE.Mesh(coverGeo, matCarbonShell);
  coverMesh.name = 'Autoclaved_Dry_Carbon_Cover_Body';
  coverMesh.position.set(0, 0, 0);
  coverMesh.castShadow = true;
  coverMesh.receiveShadow = true;
  shellGroup.add(coverMesh);

  // Left & Right Molded Aerodynamic Shoulder Pontoons
  [-1, 1].forEach((dir) => {
    const yPos = dir * (spec.coverWidthM / 2 - 0.035);

    const pontoonGeo = new THREE.BoxGeometry(spec.coverLengthM - 0.06, 0.07, 0.018);
    const pontoonMesh = new THREE.Mesh(pontoonGeo, matCarbonShell);
    pontoonMesh.name = `Aerodynamic_Shoulder_Pontoon_${dir === -1 ? 'Left' : 'Right'}`;
    pontoonMesh.position.set(0, yPos, spec.coverHeightM / 2 + 0.008);
    pontoonMesh.castShadow = true;
    shellGroup.add(pontoonMesh);

    // 6 Heat Extraction Louvers per side pontoon
    for (let l = 0; l < spec.louverCount; l++) {
      const lx = -0.22 + l * 0.088;
      const louverGeo = new THREE.BoxGeometry(0.045, 0.035, 0.004);
      louverGeo.rotateY(THREE.MathUtils.degToRad(-25));
      const louverMesh = new THREE.Mesh(louverGeo, matMeshGrille);
      louverMesh.name = `Heat_Extraction_Louver_${dir === -1 ? 'Left' : 'Right'}_${l + 1}`;
      louverMesh.position.set(lx, yPos, spec.coverHeightM / 2 + 0.018);
      shellGroup.add(louverMesh);
    }
  });

  rootGroup.add(shellGroup);

  // ─── 2. TRANSMISSIVE QUARTZ GLASS ITB WINDOW & GOLD BEZEL ───
  const windowGroup = new THREE.Group();
  windowGroup.name = 'Quartz_ITB_Window_Subsystem';

  // CNC Gold-Anodized Perimeter Trim Bezel
  const bezelGeo = new THREE.BoxGeometry(spec.glassWindowLengthM + 0.024, spec.glassWindowWidthM + 0.024, 0.008);
  const bezelMesh = new THREE.Mesh(bezelGeo, matGoldBezel);
  bezelMesh.name = 'CNC_Gold_Anodized_Window_Bezel';
  bezelMesh.position.set(0, 0, spec.coverHeightM / 2 + 0.004);
  bezelMesh.castShadow = true;
  windowGroup.add(bezelMesh);

  // High-Transparency Quartz Glass Inspection Window
  const glassGeo = new THREE.BoxGeometry(spec.glassWindowLengthM, spec.glassWindowWidthM, 0.006);
  const glassMesh = new THREE.Mesh(glassGeo, matQuartzGlass);
  glassMesh.name = 'Transmissive_Quartz_Glass_ITB_Window';
  glassMesh.position.set(0, 0, spec.coverHeightM / 2 + 0.005);
  windowGroup.add(glassMesh);

  // Laser-Etched "V12 TWIN-TURBO 6.0L" Badge Plaque
  const badgeGeo = new THREE.BoxGeometry(0.14, 0.035, 0.004);
  const badgeMesh = new THREE.Mesh(badgeGeo, matGoldBezel);
  badgeMesh.name = 'LaserEtched_V12_TwinTurbo_Badge_Plaque';
  badgeMesh.position.set(0.24, 0, spec.coverHeightM / 2 + 0.010);
  windowGroup.add(badgeMesh);

  rootGroup.add(windowGroup);

  // ─── 3. ROOF RAM-AIR NACA INDUCTION SCOOP & DEBRIS GUARD ───
  const scoopGroup = new THREE.Group();
  scoopGroup.name = 'NACA_RamAir_Scoop_Subsystem';

  // Aerodynamic Ram-Air Scoop Cowl
  const scoopGeo = new THREE.ConeGeometry(0.065, 0.16, 20);
  scoopGeo.rotateZ(Math.PI / 2);
  const scoopMesh = new THREE.Mesh(scoopGeo, matCarbonShell);
  scoopMesh.name = 'NACA_RamAir_Induction_Scoop';
  scoopMesh.position.set(-0.28, 0, spec.coverHeightM / 2 + spec.scoopHeightM / 2);
  scoopMesh.castShadow = true;
  scoopGroup.add(scoopMesh);

  // Aluminum Honeycomb Protective Debris Screen
  const debrisGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.004, 16);
  debrisGeo.rotateZ(Math.PI / 2);
  const debrisMesh = new THREE.Mesh(debrisGeo, matMeshGrille);
  debrisMesh.name = 'Honeycomb_Rock_Debris_Screen';
  debrisMesh.position.set(-0.35, 0, spec.coverHeightM / 2 + spec.scoopHeightM / 2);
  scoopGroup.add(debrisMesh);

  rootGroup.add(scoopGroup);

  // ─── 4. 4 QUARTER-TURN DZUS AEROSPACE FASTENERS ───
  const fastenerGroup = new THREE.Group();
  fastenerGroup.name = 'Dzus_Fasteners_Subsystem';

  [-spec.coverLengthM / 2 + 0.04, spec.coverLengthM / 2 - 0.04].forEach((fx) => {
    [-spec.coverWidthM / 2 + 0.03, spec.coverWidthM / 2 - 0.03].forEach((fy) => {
      // Dzus Flush Slotted Head Fastener
      const dzusGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.006, 20);
      const dzusMesh = new THREE.Mesh(dzusGeo, matDzusFastener);
      dzusMesh.name = 'QuarterTurn_Dzus_Fastener_Head';
      dzusMesh.position.set(fx, fy, spec.coverHeightM / 2 + 0.003);
      fastenerGroup.add(dzusMesh);
    });
  });

  rootGroup.add(fastenerGroup);

  return scene;
}

/**
 * Exports the engine cover scene to a binary GLB ArrayBuffer.
 */
export async function generateEngineCoverGlbBuffer(): Promise<ArrayBuffer> {
  const scene = buildEngineCoverScene();
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

export default buildEngineCoverScene;
