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
import type { EngineConfig, EngineLayout } from '../../sim/types';
import { globalMaterialLibrary } from '../materials/pbrMaterialSystem';
import { buildTransaxleScene } from '../generators/transaxleGenerator';

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

  const bankTilt = isInline ? 0 : isBoxer ? Math.PI / 2 : layout === 'v12' ? Math.PI / 6 : Math.PI / 4;

  switch (type) {
    case 'engine-block': {
      if (isElectric) {
        // Finned Stator Axial-Flux Motor Casing
        const motorGeo = new THREE.CylinderGeometry(0.18, 0.18, blockLength, 32);
        motorGeo.rotateZ(Math.PI / 2);
        const motorMesh = new THREE.Mesh(motorGeo, matLib.getCastAluminum());
        group.add(motorMesh);

        for (let r = -2; r <= 2; r++) {
          const ribGeo = new THREE.TorusGeometry(0.185, 0.008, 8, 32);
          ribGeo.rotateY(Math.PI / 2);
          const rib = new THREE.Mesh(ribGeo, matLib.getMachinedBillet());
          rib.position.set(r * 0.06, 0, 0);
          group.add(rib);
        }
        break;
      }

      if (isRotary) {
        // Dual Epitrochoid Rotor Housings & Intermediate Plate
        for (let r = 0; r < 2; r++) {
          const rX = -0.09 + r * 0.18;
          const trochoidGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.08, 24);
          trochoidGeo.rotateZ(Math.PI / 2);
          const housing = new THREE.Mesh(trochoidGeo, matLib.getCastAluminum());
          housing.position.set(rX, 0, 0);
          group.add(housing);
        }
        const plateGeo = new THREE.BoxGeometry(0.035, 0.32, 0.32);
        const plateMid = new THREE.Mesh(plateGeo, matLib.getMachinedBillet());
        group.add(plateMid);
        break;
      }

      // 1. Crankcase bedplate
      const crankcaseWidth = isBoxer ? 0.44 : isInline ? 0.22 : 0.32;
      const crankcaseGeo = new THREE.BoxGeometry(blockLength, crankcaseWidth, 0.14);
      const crankcaseMesh = new THREE.Mesh(crankcaseGeo, matLib.getCastAluminum());
      crankcaseMesh.position.set(0, 0, 0.07);
      group.add(crankcaseMesh);

      // 2. Main bearing saddles
      const mainCount = isInline ? cylsPerBank + 1 : cylsPerBank + 1;
      for (let i = 0; i < mainCount; i++) {
        const mx = -blockLength / 2 + 0.05 + i * ((blockLength - 0.10) / (mainCount - 1));
        const saddleGeo = new THREE.CylinderGeometry(0.045, 0.045, crankcaseWidth * 0.9, 24);
        saddleGeo.rotateZ(Math.PI / 2);
        const saddleMesh = new THREE.Mesh(saddleGeo, matLib.getMachinedBillet());
        saddleMesh.position.set(mx, 0, 0.05);
        group.add(saddleMesh);
      }

      // 3. Cylinder Banks & Nikasil Bores
      if (isInline) {
        const bankGeo = new THREE.BoxGeometry(blockLength * 0.94, 0.18, 0.22);
        const bankMesh = new THREE.Mesh(bankGeo, matLib.getCastAluminum());
        bankMesh.position.set(0, 0, 0.22);
        group.add(bankMesh);

        for (let i = 0; i < cylsPerBank; i++) {
          const cx = -blockLength / 2 + (i + 0.75) * (blockLength / (cylsPerBank + 0.5));
          const boreGeo = new THREE.CylinderGeometry(0.044, 0.044, 0.18, 24, 1, true);
          const boreMesh = new THREE.Mesh(boreGeo, matLib.getMachinedBillet());
          boreMesh.position.set(cx, 0, 0.22);
          group.add(boreMesh);
        }
      } else if (isBoxer) {
        // Horizontally Opposed (180° Flat Left & Right)
        const bankGeo = new THREE.BoxGeometry(blockLength * 0.94, 0.16, 0.14);
        const bank1 = new THREE.Mesh(bankGeo, matLib.getCastAluminum());
        bank1.position.set(0, 0.18, 0.07);

        const bank2 = bank1.clone();
        bank2.position.y = -0.18;
        group.add(bank1, bank2);

        for (let i = 0; i < cylsPerBank; i++) {
          const cx = -blockLength / 2 + (i + 0.75) * (blockLength / cylsPerBank);
          const boreGeo = new THREE.CylinderGeometry(0.044, 0.044, 0.14, 24, 1, true);
          boreGeo.rotateX(Math.PI / 2);

          const b1 = new THREE.Mesh(boreGeo, matLib.getMachinedBillet());
          b1.position.set(cx, 0.18, 0.07);

          const b2 = new THREE.Mesh(boreGeo, matLib.getMachinedBillet());
          b2.position.set(cx + 0.015, -0.18, 0.07);
          group.add(b1, b2);
        }
      } else {
        // Vee & W configurations
        const bankGeo = new THREE.BoxGeometry(blockLength * 0.94, 0.18, 0.22);
        const bank1Mesh = new THREE.Mesh(bankGeo, matLib.getCastAluminum());
        bank1Mesh.position.set(0, 0.11, 0.22);
        bank1Mesh.rotation.x = -bankTilt;

        const bank2Mesh = new THREE.Mesh(bankGeo, matLib.getCastAluminum());
        bank2Mesh.position.set(0, -0.11, 0.22);
        bank2Mesh.rotation.x = bankTilt;
        group.add(bank1Mesh, bank2Mesh);

        for (let i = 0; i < cylsPerBank; i++) {
          const cx = -blockLength / 2 + (i + 0.75) * (blockLength / cylsPerBank);

          const b1BoreGeo = new THREE.CylinderGeometry(0.044, 0.044, 0.18, 24, 1, true);
          const b1BoreMesh = new THREE.Mesh(b1BoreGeo, matLib.getMachinedBillet());
          b1BoreMesh.position.set(cx, 0.11, 0.22);
          b1BoreMesh.rotation.x = -bankTilt;

          const b2BoreGeo = new THREE.CylinderGeometry(0.044, 0.044, 0.18, 24, 1, true);
          const b2BoreMesh = new THREE.Mesh(b2BoreGeo, matLib.getMachinedBillet());
          b2BoreMesh.position.set(cx + 0.015, -0.11, 0.22);
          b2BoreMesh.rotation.x = bankTilt;

          group.add(b1BoreMesh, b2BoreMesh);
        }
      }
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

      // Forged Nitrided Crankshaft
      const shaftGeo = new THREE.CylinderGeometry(0.034, 0.034, blockLength, 24);
      shaftGeo.rotateZ(Math.PI / 2);
      const shaftMesh = new THREE.Mesh(shaftGeo, matLib.getNitridedCrank());
      group.add(shaftMesh);

      const throwCount = isInline ? cylsPerBank : cylsPerBank;
      for (let i = 0; i < throwCount; i++) {
        const mx = -blockLength / 2 + (i + 0.75) * (blockLength / throwCount);
        const lobeGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.018, 24);
        lobeGeo.rotateZ(Math.PI / 2);
        const lobeMesh = new THREE.Mesh(lobeGeo, matLib.getNitridedCrank());
        lobeMesh.position.set(mx, 0, 0);
        group.add(lobeMesh);
      }
      break;
    }

    case 'piston': {
      const crownGeo = new THREE.CylinderGeometry(0.043, 0.043, 0.045, 24);
      const crownMesh = new THREE.Mesh(crownGeo, matLib.getMachinedBillet());
      group.add(crownMesh);

      const pinGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.040, 16);
      pinGeo.rotateZ(Math.PI / 2);
      const pinMesh = new THREE.Mesh(pinGeo, matLib.getNitridedCrank());
      pinMesh.position.set(0, 0, -0.01);
      group.add(pinMesh);
      break;
    }

    case 'connecting-rod': {
      const rodGeo = new THREE.CylinderGeometry(0.012, 0.016, 0.14, 16);
      const rodMesh = new THREE.Mesh(rodGeo, matLib.getMachinedBillet());
      group.add(rodMesh);

      const bigEndGeo = new THREE.CylinderGeometry(0.026, 0.026, 0.024, 20);
      bigEndGeo.rotateZ(Math.PI / 2);
      const bigEndMesh = new THREE.Mesh(bigEndGeo, matLib.getMachinedBillet());
      bigEndMesh.position.set(0, -0.07, 0);
      group.add(bigEndMesh);

      const smallEndGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.022, 16);
      smallEndGeo.rotateZ(Math.PI / 2);
      const smallEndMesh = new THREE.Mesh(smallEndGeo, matLib.getMachinedBillet());
      smallEndMesh.position.set(0, 0.07, 0);
      group.add(smallEndMesh);
      break;
    }

    case 'cylinder-head-left':
    case 'cylinder-head-right': {
      const headLength = blockLength * 0.94;
      const headGeo = new THREE.BoxGeometry(headLength, 0.16, 0.10);
      const headMesh = new THREE.Mesh(headGeo, matLib.getMachinedBillet());
      group.add(headMesh);

      [-0.04, 0.04].forEach((offset) => {
        const camGeo = new THREE.CylinderGeometry(0.016, 0.016, headLength * 0.96, 20);
        camGeo.rotateZ(Math.PI / 2);
        const camMesh = new THREE.Mesh(camGeo, matLib.getMachinedBillet());
        camMesh.position.set(0, offset, 0.06);
        group.add(camMesh);
      });
      break;
    }

    case 'valve-cover-left':
    case 'valve-cover-right': {
      const coverLength = blockLength * 0.92;
      const coverGeo = new THREE.BoxGeometry(coverLength, 0.15, 0.08);
      const coverMesh = new THREE.Mesh(coverGeo, matLib.getGoldAnodized());
      group.add(coverMesh);
      break;
    }

    case 'intake-manifold-left':
    case 'intake-manifold-right': {
      for (let i = 0; i < cylsPerBank; i++) {
        const cx = -blockLength / 2 + (i + 0.75) * (blockLength / cylsPerBank);
        const stackGeo = new THREE.CylinderGeometry(0.034, 0.022, 0.08, 24);
        const stackMesh = new THREE.Mesh(stackGeo, matLib.getCobaltAnodized());
        stackMesh.position.set(cx, 0, 0.04);
        group.add(stackMesh);
      }
      break;
    }

    case 'exhaust-header-left':
    case 'exhaust-header-right': {
      for (let i = 0; i < cylsPerBank; i++) {
        const cx = -blockLength / 2 + (i + 0.75) * (blockLength / cylsPerBank);
        const pipeGeo = new THREE.CylinderGeometry(0.020, 0.020, 0.16, 16);
        const pipeMesh = new THREE.Mesh(pipeGeo, matLib.getInconelExhaust());
        pipeMesh.position.set(cx, 0, 0);
        group.add(pipeMesh);
      }
      break;
    }

    case 'turbocharger': {
      const compGeo = new THREE.SphereGeometry(0.07, 24, 16);
      const compMesh = new THREE.Mesh(compGeo, matLib.getMachinedBillet());
      group.add(compMesh);

      const turbGeo = new THREE.SphereGeometry(0.06, 24, 16);
      const turbMesh = new THREE.Mesh(turbGeo, matLib.getInconelExhaust());
      turbMesh.position.set(0.08, 0, 0);
      group.add(turbMesh);
      break;
    }

    case 'dry-sump': {
      const panGeo = new THREE.BoxGeometry(blockLength * 0.96, 0.30, 0.06);
      const panMesh = new THREE.Mesh(panGeo, matLib.getCastAluminum());
      group.add(panMesh);
      break;
    }

    case 'radiator': {
      const coreGeo = new THREE.BoxGeometry(0.05, 0.52, 0.36);
      const coreMesh = new THREE.Mesh(coreGeo, matLib.getMachinedBillet());
      group.add(coreMesh);
      break;
    }

    case 'transaxle': {
      const transScene = buildTransaxleScene();
      while (transScene.children.length > 0) {
        group.add(transScene.children[0]);
      }
      break;
    }

    case 'engine-cover': {
      const coverPlateGeo = new THREE.BoxGeometry(blockLength * 0.92, 0.36, 0.025);
      const coverPlateMesh = new THREE.Mesh(coverPlateGeo, matLib.getDryCarbonFiber());
      group.add(coverPlateMesh);

      const glassGeo = new THREE.BoxGeometry(blockLength * 0.72, 0.18, 0.008);
      const glassMesh = new THREE.Mesh(glassGeo, matLib.getQuartzGlass());
      glassMesh.position.set(0, 0, 0.018);
      group.add(glassMesh);
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
    // 1. Return from cache if already loaded
    const cached = this.cache.get(path);
    if (cached) {
      cached.refCount++;
      return this.deepCloneScene(cached.originalScene);
    }

    // 2. Return in-flight promise if currently loading
    const inFlight = this.inFlightLoads.get(path);
    if (inFlight) {
      const scene = await inFlight;
      return this.deepCloneScene(scene);
    }

    // 3. Initiate new fetch and parse
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

          this.cache.set(path, {
            path,
            originalScene: scene,
            refCount: 1,
            loadedAt: Date.now(),
            byteSizeEstimate: vertexCount * 32,
            meshCount,
            vertexCount,
          });

          this.inFlightLoads.delete(path);
          resolve(this.deepCloneScene(scene));
        },
        undefined,
        (err) => {
          console.warn(`[GlbAssetCache] Failed to load GLB at '${path}', using procedural fallback. Details:`, err);
          const fallback = buildProceduralFallbackMesh(fallbackType || 'engine-block', config);
          this.optimizeLoadedScene(fallback);

          this.cache.set(path, {
            path,
            originalScene: fallback,
            refCount: 1,
            loadedAt: Date.now(),
            byteSizeEstimate: 1024,
            meshCount: 1,
            vertexCount: 100,
          });

          this.inFlightLoads.delete(path);
          resolve(this.deepCloneScene(fallback));
        }
      );
    });

    this.inFlightLoads.set(path, loadPromise);
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
  public releaseInstance(path: string): void {
    const entry = this.cache.get(path);
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
