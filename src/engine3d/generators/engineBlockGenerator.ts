// ============================================================================
// ULTRA-HIGH-FIDELITY MODULAR GLB GENERATOR — 60° V12 ENGINE BLOCK CASTING
// ============================================================================
// Master architectural integration coordinator combining all 10 specialized
// block subsystem generators: hollow Nikasil cylinder liners, 7 cross-bolted
// main bulkheads with ARP fasteners, internal oil pressure rifle circuits,
// multi-pass coolant water jackets, CNC milled decks, structural skirt webbing,
// timing/bellhousing end flanges, central valley scavenge, and procedural PBR shaders.
// ============================================================================

import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { V12_ENGINE_BLOCK_ATTACHMENTS } from '../attachmentMaps/v12AttachmentMap';

// Subsystem generator imports
import { buildV12CylinderLinerSystem } from './blockSubsystems/cylinderLinerGenerator';
import { buildV12MainBulkheadSystem } from './blockSubsystems/mainBearingBulkheadGenerator';
import { buildV12OilGalleryCircuit } from './blockSubsystems/oilGalleryCircuitGenerator';
import { buildV12CoolantJacketSystem } from './blockSubsystems/coolantJacketGenerator';
import { buildV12CylinderDeckSuite } from './blockSubsystems/cylinderDeckGenerator';
import { buildV12StructuralWebbingSystem } from './blockSubsystems/structuralWebbingGenerator';
import { buildV12EndFlangesSystem } from './blockSubsystems/endFlangesGenerator';
import { buildV12ValleyScavengeSystem } from './blockSubsystems/valleyScavengeGenerator';
import { initializeBlockShaderSuite, type BlockShaderSuite } from '../materials/blockShaderPipeline';

// Polyfill Node.js FileReader if executing in Node CLI environment
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

// Re-export type interface for material palette compatibility
export interface V12BlockMaterialPalette {
  castAluminumBlock: THREE.MeshStandardMaterial;
  machinedDeckSurface: THREE.MeshStandardMaterial;
  nikasilCylinderBore: THREE.MeshStandardMaterial;
  arpHardenedFastener: THREE.MeshStandardMaterial;
  brassFreezePlug: THREE.MeshStandardMaterial;
  coolantJacketInterior: THREE.MeshStandardMaterial;
  oilGalleryPassage: THREE.MeshStandardMaterial;
  gasketChannel: THREE.MeshStandardMaterial;
}

/**
 * Creates the active physical material palette mapped to the shader pipeline.
 */
export function createBlockMaterialPalette(): V12BlockMaterialPalette {
  const shaders: BlockShaderSuite = initializeBlockShaderSuite();

  return {
    castAluminumBlock: shaders.sandCastAluminum,
    machinedDeckSurface: shaders.cncMilledDeck,
    nikasilCylinderBore: shaders.plateauHonedNikasil,
    arpHardenedFastener: shaders.hardenedArpFastener,
    brassFreezePlug: shaders.machinedBrassPlug,
    coolantJacketInterior: shaders.coolantWaterPassage,
    oilGalleryPassage: shaders.oilGalleryPassage,
    gasketChannel: shaders.fireRingSeal,
  };
}

/**
 * Builds the complete 3D solid model scene graph for the 60° V12 Engine Block Casting,
 * integrating all 10 engineering subsystems.
 */
export function buildEngineBlockScene(): THREE.Scene {
  const scene = new THREE.Scene();
  scene.name = 'V12_Engine_Block_Scene';

  const rootGroup = new THREE.Group();
  rootGroup.name = '01_V12_Engine_Block_Master';
  scene.add(rootGroup);

  // Initialize unified PBR metallurgic material palette
  const materials = createBlockMaterialPalette();

  // ── 1. Phase 2: Lower Crankcase & 7 Cross-Bolted Main Bulkheads ──
  const mainBulkheadGroup = buildV12MainBulkheadSystem(materials);
  rootGroup.add(mainBulkheadGroup);

  // ── 2. Phase 1: Bank 1 (Left) 6 Hollow Nikasil Cylinder Bore Sleeves ──
  const bank1Liners = buildV12CylinderLinerSystem('left', materials);
  bank1Liners.position.set(0, 0.11, 0.22);
  bank1Liners.rotation.x = -Math.PI / 6;
  rootGroup.add(bank1Liners);

  // ── 3. Phase 1: Bank 2 (Right, 15mm stagger) 6 Hollow Nikasil Cylinder Bore Sleeves ──
  const bank2Liners = buildV12CylinderLinerSystem('right', materials);
  bank2Liners.position.set(0.015, -0.11, 0.22);
  bank2Liners.rotation.x = Math.PI / 6;
  rootGroup.add(bank2Liners);

  // ── 4. Phase 5: CNC Cylinder Head Decks, Head Stud Pillars & Dowels ──
  const cylinderDeckSuite = buildV12CylinderDeckSuite(materials);
  rootGroup.add(cylinderDeckSuite);

  // ── 5. Phase 3: High-Pressure Lubrication Galleys & 12 Piston Cooling Jets ──
  const oilCircuitGroup = buildV12OilGalleryCircuit(materials);
  rootGroup.add(oilCircuitGroup);

  // ── 6. Phase 4: Multi-Pass Coolant Water Jackets & Brass Core Freeze Plugs ──
  const coolantSystemGroup = buildV12CoolantJacketSystem(materials);
  rootGroup.add(coolantSystemGroup);

  // ── 7. Phase 6: Triangulated Structural Skirt Webbing & Engine Mount Cradles ──
  const structuralWebbingGroup = buildV12StructuralWebbingSystem(materials);
  rootGroup.add(structuralWebbingGroup);

  // ── 8. Phase 7: Front Timing Gearcase Flange & Rear Transmission Bellhousing ──
  const endFlangesGroup = buildV12EndFlangesSystem(materials);
  rootGroup.add(endFlangesGroup);

  // ── 9. Phase 8: Central 60° V-Valley Oil Scavenge & Knock Sensor Resonance Bosses ──
  const valleyScavengeGroup = buildV12ValleyScavengeSystem(materials);
  rootGroup.add(valleyScavengeGroup);

  // ── 10. Embedded Named Attachment Anchor Nodes for Modular Kinematic Snapping ──
  V12_ENGINE_BLOCK_ATTACHMENTS.forEach((anchor) => {
    const anchorNode = new THREE.Object3D();
    anchorNode.name = anchor.id;
    anchorNode.position.set(anchor.position.x, anchor.position.y, anchor.position.z);
    anchorNode.rotation.set(anchor.rotation.x, anchor.rotation.y, anchor.rotation.z);
    rootGroup.add(anchorNode);
  });

  return scene;
}

/**
 * Exports the complete 60° V12 Engine Block 3D model to a binary glTF (.glb) ArrayBuffer.
 */
export async function generateEngineBlockGlbBuffer(): Promise<ArrayBuffer> {
  const scene = buildEngineBlockScene();
  const exporter = new GLTFExporter();

  return new Promise((resolve, reject) => {
    exporter.parse(
      scene,
      (gltf) => {
        if (gltf instanceof ArrayBuffer) {
          resolve(gltf);
        } else {
          resolve(gltf as unknown as ArrayBuffer);
        }
      },
      (error) => reject(error),
      { binary: true }
    );
  });
}

export default buildEngineBlockScene;
