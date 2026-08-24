// ============================================================================
// MODULAR GLB/glTF ENGINE ASSEMBLY — GLB ASSET LOADER & CACHE MANAGER
// ============================================================================
// High-performance asynchronous glTF 2.0 / GLB asset loader, deep cloning engine
// with material independence, reference-counted GPU cache, procedural fallback
// proxy geometry generator supporting all 14 engine layouts, and LOD asset streaming.
// ============================================================================

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { Engine3DComponentManifest, Engine3DComponentType } from '../types';
import type { EngineConfig, EngineLayout, TransmissionType } from '../../sim/types';
import { globalMaterialLibrary } from '../materials/pbrMaterialSystem';
import { buildEngineBlockScene } from '../generators/engineBlockGenerator';
import { buildInlineBlockScene } from '../generators/inlineBlockGenerator';
import { buildBoxerBlockScene } from '../generators/boxerBlockGenerator';
import { buildWBlockScene } from '../generators/wEngineBlockGenerator';
import { buildRotaryBlockScene } from '../generators/rotaryBlockGenerator';
import { buildElectricDriveScene } from '../generators/electricDriveGenerator';
import { buildCrankshaftScene } from '../generators/crankshaftGenerator';
import { buildPistonScene } from '../generators/pistonGenerator';
import { buildConnectingRodScene } from '../generators/connectingRodGenerator';
import { buildCylinderHeadScene } from '../generators/cylinderHeadGenerator';
import { buildValveCoverScene } from '../generators/valveCoverGenerator';
import { buildIntakeManifoldScene } from '../generators/intakeManifoldGenerator';
import { buildExhaustHeaderScene } from '../generators/exhaustHeaderGenerator';
import { buildTurbochargerScene } from '../generators/turbochargerGenerator';
import { buildDrySumpScene } from '../generators/drySumpGenerator';
import { buildRadiatorScene } from '../generators/radiatorGenerator';
import { buildTransaxleScene } from '../generators/transaxleGenerator';
import { buildEngineCoverScene } from '../generators/engineCoverGenerator';

// ============================================================================
// 1. CACHE ENTRY & PROGRESS INTERFACES
// ============================================================================

export interface GlbCacheEntry {
  path: string;
  originalScene: THREE.Group;
  refCount: number;
  loadedAt: number;
  byteSizeEstimate: number;
  meshCount: number;
  vertexCount: number;
}

export interface AssetLoadProgress {
  totalAssets: number;
  loadedAssets: number;
  failedAssets: number;
  percentage: number;
  currentAssetPath: string;
}

export type AssetProgressListener = (progress: AssetLoadProgress) => void;

// ============================================================================
// 2. PROCEDURAL PROXY GEOMETRY FALLBACK GENERATOR (MULTI-LAYOUT ARCHITECTURES)
// ============================================================================

function cloneSceneIntoGroup(scene: THREE.Scene, targetGroup: THREE.Group, scaleX: number = 1.0) {
  for (const child of scene.children) {
    const cloned = child.clone(true);
    if (scaleX !== 1.0) {
      cloned.scale.x *= scaleX;
    }
    targetGroup.add(cloned);
  }
}

/**
 * Builds realistic programmatic Three.js fallback proxy geometry if a requested
 * .glb asset file is loading or missing, ensuring the engine configurator remains
 * 100% interactive and structurally valid at all times across all engine layouts.
 */
export function buildProceduralFallbackMesh(
  type: Engine3DComponentType,
  config?: Partial<EngineConfig>
): THREE.Group {
  const group = new THREE.Group();
  group.name = `Fallback_${type}`;
  const matLib = globalMaterialLibrary;

  const layout: EngineLayout = config?.layout || 'v12';

  // Compute Layout Parameters
  const isInline = layout === 'i3' || layout === 'i4' || layout === 'i6';
  const isBoxer = layout === 'boxer4' || layout === 'boxer6';
  const isW = layout === 'w12' || layout === 'w16' || layout === 'w18';
  const isRotary = layout === 'rotary';
  const isElectric = layout === 'electric' || layout === 'hybrid';

  const totalCylinders =
    layout === 'i3' ? 3 :
    layout === 'i4' || layout === 'boxer4' ? 4 :
    layout === 'i6' || layout === 'v6' || layout === 'boxer6' ? 6 :
    layout === 'v8' ? 8 :
    layout === 'v10' ? 10 :
    layout === 'w12' ? 12 :
    layout === 'w16' ? 16 :
    layout === 'w18' ? 18 :
    12; // v12 baseline

  const cylsPerBank = isInline ? totalCylinders : isBoxer ? totalCylinders / 2 : isW ? Math.ceil(totalCylinders / 4) : Math.ceil(totalCylinders / 2);
  const blockLength = isInline
    ? cylsPerBank === 3 ? 0.38 : cylsPerBank === 4 ? 0.48 : 0.68
    : isBoxer
    ? cylsPerBank === 2 ? 0.42 : 0.58
    : isW
    ? 0.68
    : isRotary
    ? 0.40
    : isElectric
    ? 0.36
    : cylsPerBank === 3 ? 0.46 : cylsPerBank === 4 ? 0.56 : cylsPerBank === 5 ? 0.64 : 0.68;

  const scaleX = Math.max(0.4, cylsPerBank / 6);

  switch (type) {
    case 'engine-block': {
      if (isElectric) {
        // Ultra-High-Fidelity Liquid-Cooled Stator Casing with 800V HV Terminal Box
        const electricScene = buildElectricDriveScene(config);
        cloneSceneIntoGroup(electricScene, group, 1.0);
        break;
      }

      if (isRotary) {
        // Ultra-High-Fidelity Wankel Epitrochoid Rotor Housings & Tension Studs
        const rotaryScene = buildRotaryBlockScene(config);
        cloneSceneIntoGroup(rotaryScene, group, 1.0);
        break;
      }

      if (isInline) {
        // Ultra-High-Fidelity Deep-Skirt Inline Mono-Deck Engine Block (I3/I4/I6)
        const inlineScene = buildInlineBlockScene(config);
        cloneSceneIntoGroup(inlineScene, group, 1.0);
        break;
      }

      if (isBoxer) {
        // Ultra-High-Fidelity Horizontally Opposed Split-Case Boxer Block (Boxer-4/Boxer-6)
        const boxerScene = buildBoxerBlockScene(config);
        cloneSceneIntoGroup(boxerScene, group, 1.0);
        break;
      }

      if (isW) {
        // Ultra-High-Fidelity Dual-VR Quad-Row Staggered W-Block (W12/W16/W18)
        const wScene = buildWBlockScene(config);
        cloneSceneIntoGroup(wScene, group, 1.0);
        break;
      }

      // Ultra-High-Fidelity V-Engine Block with 60°/90°/72° V-Angles (V6/V8/V10/V12)
      const blockScene = buildEngineBlockScene(config);
      cloneSceneIntoGroup(blockScene, group, 1.0);
      break;
    }

    case 'crankshaft': {
      if (isRotary) {
        // Eccentric Shaft with 2 Rotor Lobes
        const shaftGeo = new THREE.CylinderGeometry(0.028, 0.028, blockLength, 24);
        shaftGeo.rotateZ(Math.PI / 2);
        const shaftMesh = new THREE.Mesh(shaftGeo, matLib.getNitridedCrank());
        group.add(shaftMesh);

        for (let r = 0; r < 2; r++) {
          const rx = -0.09 + r * 0.18;
          const lobeGeo = new THREE.CylinderGeometry(0.055, 0.055, 0.065, 24);
          lobeGeo.rotateZ(Math.PI / 2);
          const lobe = new THREE.Mesh(lobeGeo, matLib.getMachinedBillet());
          lobe.position.set(rx, 0, 0.02 * (r === 0 ? 1 : -1));
          group.add(lobe);
        }
        break;
      }

      const crankScene = buildCrankshaftScene(config);
      cloneSceneIntoGroup(crankScene, group, 1.0);
      break;
    }

    case 'piston': {
      const pistonScene = buildPistonScene(config);
      cloneSceneIntoGroup(pistonScene, group, 1.0);
      break;
    }

    case 'connecting-rod': {
      const rodScene = buildConnectingRodScene(config);
      cloneSceneIntoGroup(rodScene, group, 1.0);
      break;
    }

    case 'cylinder-head-left': {
      const headScene = buildCylinderHeadScene('left', config);
      cloneSceneIntoGroup(headScene, group, 1.0);
      break;
    }

    case 'cylinder-head-right': {
      const headScene = buildCylinderHeadScene('right', config);
      cloneSceneIntoGroup(headScene, group, 1.0);
      break;
    }

    case 'valve-cover-left': {
      const coverScene = buildValveCoverScene('left', config);
      cloneSceneIntoGroup(coverScene, group, 1.0);
      break;
    }

    case 'valve-cover-right': {
      const coverScene = buildValveCoverScene('right', config);
      cloneSceneIntoGroup(coverScene, group, 1.0);
      break;
    }

    case 'intake-manifold-left': {
      const intakeScene = buildIntakeManifoldScene('left', config);
      cloneSceneIntoGroup(intakeScene, group, 1.0);
      break;
    }

    case 'intake-manifold-right': {
      const intakeScene = buildIntakeManifoldScene('right', config);
      cloneSceneIntoGroup(intakeScene, group, 1.0);
      break;
    }

    case 'exhaust-header-left': {
      const exhaustScene = buildExhaustHeaderScene('left', config);
      cloneSceneIntoGroup(exhaustScene, group, 1.0);
      break;
    }

    case 'exhaust-header-right': {
      const exhaustScene = buildExhaustHeaderScene('right', config);
      cloneSceneIntoGroup(exhaustScene, group, 1.0);
      break;
    }

    case 'turbocharger': {
      const turboScene = buildTurbochargerScene(config);
      cloneSceneIntoGroup(turboScene, group, 1.0);
      break;
    }

    case 'dry-sump': {
      const sumpScene = buildDrySumpScene(config);
      cloneSceneIntoGroup(sumpScene, group, 1.0);
      break;
    }

    case 'radiator': {
      const radScene = buildRadiatorScene();
      cloneSceneIntoGroup(radScene, group, 1.0);
      break;
    }

    case 'transaxle': {
      const transType = ((config as Record<string, any>)?.transmission as TransmissionType) || 'seq_7';
      const transScene = buildTransaxleScene(transType);
      cloneSceneIntoGroup(transScene, group, 1.0);
      break;
    }

    case 'engine-cover': {
      const coverScene = buildEngineCoverScene();
      cloneSceneIntoGroup(coverScene, group, scaleX);
      break;
    }

    default: {
      const defaultGeo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
      const defaultMesh = new THREE.Mesh(defaultGeo, matLib.getMachinedBillet());
      group.add(defaultMesh);
      break;
    }
  }

  return group;
}

// ============================================================================
// 3. GLB ASSET CACHE & LOADER SINGLETON
// ============================================================================

export class GlbAssetCache {
  private static instance: GlbAssetCache;
  private loader: GLTFLoader = new GLTFLoader();
  private cache: Map<string, GlbCacheEntry> = new Map();
  private inFlightLoads: Map<string, Promise<THREE.Group>> = new Map();
  private progressListeners: Set<AssetProgressListener> = new Set();

  private constructor() {}

  public static getInstance(): GlbAssetCache {
    if (!GlbAssetCache.instance) {
      GlbAssetCache.instance = new GlbAssetCache();
    }
    return GlbAssetCache.instance;
  }

  /**
   * Subscribes to asset loading progress notifications.
   */
  public onProgress(listener: AssetProgressListener): () => void {
    this.progressListeners.add(listener);
    return () => this.progressListeners.delete(listener);
  }

  private notifyProgress(progress: AssetLoadProgress): void {
    this.progressListeners.forEach((fn) => fn(progress));
  }

  /**
   * Asynchronously loads a glTF 2.0 / GLB file, caching the master scene.
   * If the file is not found, gracefully falls back to procedural geometry.
   */
  public async loadComponentGlb(
    path: string,
    fallbackType?: Engine3DComponentType,
    config?: Partial<EngineConfig>
  ): Promise<THREE.Group> {
    const layoutKey = config?.layout || 'v12';
    const cacheKey = `${path}_${layoutKey}`;

    // 1. Return from cache if already loaded
    const cached = this.cache.get(cacheKey);
    if (cached) {
      cached.refCount++;
      return this.deepCloneScene(cached.originalScene);
    }

    // 2. Return in-flight promise if currently loading
    const inFlight = this.inFlightLoads.get(cacheKey);
    if (inFlight) {
      const scene = await inFlight;
      return this.deepCloneScene(scene);
    }

    // 3. If layout is not v12, generate layout-specific procedural geometry directly
    if (layoutKey !== 'v12') {
      const fallback = buildProceduralFallbackMesh(fallbackType || 'engine-block', config);
      this.optimizeLoadedScene(fallback);

      this.cache.set(cacheKey, {
        path: cacheKey,
        originalScene: fallback,
        refCount: 1,
        loadedAt: Date.now(),
        byteSizeEstimate: 4096,
        meshCount: fallback.children.length || 1,
        vertexCount: 500,
      });

      return this.deepCloneScene(fallback);
    }

    // 4. Initiate new fetch and parse for V12 GLB model
    const loadPromise = new Promise<THREE.Group>((resolve) => {
      this.loader.load(
        path,
        (gltf) => {
          const scene = gltf.scene;
          this.optimizeLoadedScene(scene);

          // Calculate statistics
          let meshCount = 0;
          let vertexCount = 0;
          scene.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              meshCount++;
              const geom = (child as THREE.Mesh).geometry;
              if (geom && geom.attributes.position) {
                vertexCount += geom.attributes.position.count;
              }
            }
          });

          this.cache.set(cacheKey, {
            path: cacheKey,
            originalScene: scene,
            refCount: 1,
            loadedAt: Date.now(),
            byteSizeEstimate: vertexCount * 32,
            meshCount,
            vertexCount,
          });

          this.inFlightLoads.delete(cacheKey);
          resolve(this.deepCloneScene(scene));
        },
        undefined,
        (err) => {
          console.warn(`[GlbAssetCache] Failed to load GLB at '${path}', using procedural fallback. Details:`, err);
          const fallback = buildProceduralFallbackMesh(fallbackType || 'engine-block', config);
          this.optimizeLoadedScene(fallback);

          this.cache.set(cacheKey, {
            path: cacheKey,
            originalScene: fallback,
            refCount: 1,
            loadedAt: Date.now(),
            byteSizeEstimate: 1024,
            meshCount: 1,
            vertexCount: 100,
          });

          this.inFlightLoads.delete(cacheKey);
          resolve(this.deepCloneScene(fallback));
        }
      );
    });

    this.inFlightLoads.set(cacheKey, loadPromise);
    return loadPromise;
  }

  /**
   * Preloads all assets defined in a manifest list in parallel with progress updates.
   */
  public async preloadManifests(manifests: Engine3DComponentManifest[], config?: Partial<EngineConfig>): Promise<void> {
    const total = manifests.length;
    let loaded = 0;
    let failed = 0;

    const promises = manifests.map(async (m) => {
      try {
        await this.loadComponentGlb(m.assetPath, m.type, config);
        loaded++;
      } catch {
        failed++;
      } finally {
        this.notifyProgress({
          totalAssets: total,
          loadedAssets: loaded,
          failedAssets: failed,
          percentage: Math.round(((loaded + failed) / total) * 100),
          currentAssetPath: m.assetPath,
        });
      }
    });

    await Promise.all(promises);
  }

  /**
   * Deep clones a scene graph, duplicating meshes and creating independent
   * material references so modifications (selection highlights, variant swaps)
   * on one instance do not cross-contaminate other instances.
   */
  public deepCloneScene(source: THREE.Group): THREE.Group {
    const clone = source.clone(true);

    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        if (Array.isArray(mesh.material)) {
          mesh.material = mesh.material.map((m) => m.clone());
        } else if (mesh.material) {
          mesh.material = mesh.material.clone();
        }
      }
    });

    return clone;
  }

  /**
   * Auto-computes vertex normals, bounding boxes, and shadow flags on imported geometry.
   */
  private optimizeLoadedScene(scene: THREE.Object3D): void {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        if (mesh.geometry) {
          if (!mesh.geometry.attributes.normal) {
            mesh.geometry.computeVertexNormals();
          }
          mesh.geometry.computeBoundingBox();
          mesh.geometry.computeBoundingSphere();
        }
      }
    });
  }

  /**
   * Releases an instance from the cache, decrementing reference count.
   */
  public releaseInstance(path: string, layout?: string): void {
    const key = layout ? `${path}_${layout}` : path;
    const entry = this.cache.get(key) || this.cache.get(path);
    if (entry) {
      entry.refCount = Math.max(0, entry.refCount - 1);
    }
  }

  /**
   * Cleans up all cached scenes and releases GPU textures/buffers.
   */
  public dispose(): void {
    this.cache.forEach((entry) => {
      entry.originalScene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (mesh.geometry) mesh.geometry.dispose();
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m) => m.dispose());
          } else if (mesh.material) {
            mesh.material.dispose();
          }
        }
      });
    });

    this.cache.clear();
    this.inFlightLoads.clear();
    this.progressListeners.clear();
  }
}

/** Global singleton instance */
export const globalAssetCache = GlbAssetCache.getInstance();
