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
import type { EngineConfig } from '../../sim/types';
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
  castAluminumBlock: THREE.MeshPhysicalMaterial;
  machinedDeckSurface: THREE.MeshPhysicalMaterial;
  nikasilCylinderBore: THREE.MeshPhysicalMaterial;
  arpHardenedFastener: THREE.MeshPhysicalMaterial;
  brassFreezePlug: THREE.MeshPhysicalMaterial;
  coolantJacketInterior: THREE.MeshPhysicalMaterial;
  oilGalleryPassage: THREE.MeshPhysicalMaterial;
  gasketChannel: THREE.MeshPhysicalMaterial;
}

/**
 * Creates the active physical material palette mapped to the shader pipeline.
 */
export function createBlockMaterialPalette(configOrMat?: Partial<EngineConfig> | string): V12BlockMaterialPalette {
  let matString = 'aluminum';
  if (typeof configOrMat === 'string') {
    matString = configOrMat;
  } else if (configOrMat && typeof configOrMat === 'object') {
    matString = (configOrMat as any).blockMaterial || (configOrMat as any).material || 'aluminum';
  }

  const shaders: BlockShaderSuite = initializeBlockShaderSuite(matString);

  return {
    castAluminumBlock: shaders.primaryBlockMaterial,
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
export function buildEngineBlockScene(configOrCyls?: Partial<EngineConfig> | number): THREE.Scene {
  const scene = new THREE.Scene();
  scene.name = 'V_Engine_Block_Scene';

  const rootGroup = new THREE.Group();
  rootGroup.name = 'V_Engine_Block_Master';
  scene.add(rootGroup);

  let cylindersPerBank = 6;
  let bankAngleDeg = 60; // 60° default for V12/V6

  if (typeof configOrCyls === 'number') {
    cylindersPerBank = configOrCyls;
    bankAngleDeg = cylindersPerBank === 4 ? 90 : cylindersPerBank === 5 ? 72 : 60;
  } else if (configOrCyls?.layout) {
    const l = configOrCyls.layout;
    if (l === 'v6') {
      cylindersPerBank = 3;
      bankAngleDeg = 60;
    } else if (l === 'v8') {
      cylindersPerBank = 4;
      bankAngleDeg = 90;
    } else if (l === 'v10') {
      cylindersPerBank = 5;
      bankAngleDeg = 72;
    } else if (l === 'v12') {
      cylindersPerBank = 6;
      bankAngleDeg = 60;
    } else {
      cylindersPerBank = 6;
      bankAngleDeg = 60;
    }
  }

  const halfVAngleRad = (bankAngleDeg / 2) * (Math.PI / 180);
  const bankOffsetY = 0.22 * Math.cos(halfVAngleRad);
  const bankOffsetZ = 0.22 * Math.sin(halfVAngleRad);

  // Initialize unified PBR metallurgic material palette matching engine material
  const materials = createBlockMaterialPalette(typeof configOrCyls === 'object' ? configOrCyls : undefined);

  // ── 1. Phase 2: Lower Crankcase & Main Bulkheads ──
  const mainBulkheadGroup = buildV12MainBulkheadSystem(materials, cylindersPerBank);
  rootGroup.add(mainBulkheadGroup);

  // ── 2. Phase 1: Bank 1 (Left) Hollow Nikasil Cylinder Bore Sleeves ──
  const bank1Liners = buildV12CylinderLinerSystem('left', materials, cylindersPerBank);
  bank1Liners.position.set(0, bankOffsetY * 0.5, bankOffsetZ);
  bank1Liners.rotation.x = -halfVAngleRad;
  rootGroup.add(bank1Liners);

  // ── 3. Phase 1: Bank 2 (Right, 15mm stagger) Hollow Nikasil Cylinder Bore Sleeves ──
  const bank2Liners = buildV12CylinderLinerSystem('right', materials, cylindersPerBank);
  bank2Liners.position.set(0.015, bankOffsetY * 0.5, -bankOffsetZ);
  bank2Liners.rotation.x = halfVAngleRad;
  rootGroup.add(bank2Liners);

  // ── 4. Phase 5: CNC Cylinder Head Decks, Head Stud Pillars & Dowels ──
  const cylinderDeckSuite = buildV12CylinderDeckSuite(materials, cylindersPerBank);
  rootGroup.add(cylinderDeckSuite);

  // ── 5. Phase 3: High-Pressure Lubrication Galleys & Piston Cooling Jets ──
  const oilCircuitGroup = buildV12OilGalleryCircuit(materials, cylindersPerBank);
  rootGroup.add(oilCircuitGroup);

  // ── 6. Phase 4: Multi-Pass Coolant Water Jackets & Brass Core Freeze Plugs ──
  const coolantSystemGroup = buildV12CoolantJacketSystem(materials, cylindersPerBank);
  rootGroup.add(coolantSystemGroup);

  // ── 7. Phase 6: Triangulated Structural Skirt Webbing & Engine Mount Cradles ──
  const structuralWebbingGroup = buildV12StructuralWebbingSystem(materials, cylindersPerBank);
  rootGroup.add(structuralWebbingGroup);

  // ── 8. Phase 7: Front Timing Gearcase Flange & Rear Transmission Bellhousing ──
  const endFlangesGroup = buildV12EndFlangesSystem(materials, cylindersPerBank);
  rootGroup.add(endFlangesGroup);

  // ── 9. Phase 8: Central V-Valley Oil Scavenge & Knock Sensor Resonance Bosses ──
  const valleyScavengeGroup = buildV12ValleyScavengeSystem(materials, cylindersPerBank);
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
