// ============================================================================
// ENGINE 3D SCENE MANAGER — CENTRALIZED HIGH-PERFORMANCE COORDINATOR
// ============================================================================
// Core architecture for ultra-fast, zero-overhead 3D Engine configuration:
// 1. EngineAssetManager: Singleton GLTF/GLB, texture, and geometry cache.
// 2. EngineMaterialManager: Pre-warmed, memoized PBR materials.
// 3. EngineInstanceManager: GPU InstancedMesh manager for repeated hardware.
// 4. EnginePerformanceMonitor: Real-time telemetry (FPS, frame time, draw calls).
// 5. AdaptiveRenderController: Smart idle sleep & instant reactive wakeup.
// ============================================================================

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

// ============================================================================
// 1. PERFORMANCE MONITOR & TELEMETRY TRACKER
// ============================================================================

export interface EnginePerformanceMetrics {
  fps: number;
  frameTimeMs: number;
  drawCalls: number;
  triangles: number;
  geometries: number;
  textures: number;
  activeMeshes: number;
  memoryEstimateMB: number;
  isSleeping: boolean;
  loadTimeMs: number;
}

export class EnginePerformanceMonitor {
  private static instance: EnginePerformanceMonitor;
  private metrics: EnginePerformanceMetrics = {
    fps: 60,
    frameTimeMs: 16.6,
    drawCalls: 0,
    triangles: 0,
    geometries: 0,
    textures: 0,
    activeMeshes: 0,
    memoryEstimateMB: 0,
    isSleeping: false,
    loadTimeMs: 0,
  };

  private frameCount = 0;
  private lastTime = performance.now();
  private listeners: Set<(metrics: EnginePerformanceMetrics) => void> = new Set();

  public static getInstance(): EnginePerformanceMonitor {
    if (!this.instance) {
      this.instance = new EnginePerformanceMonitor();
    }
    return this.instance;
  }

  public recordFrame(renderer: THREE.WebGLRenderer, scene: THREE.Scene, deltaMs: number, isSleeping: boolean = false) {
    this.frameCount++;
    const now = performance.now();

    if (now - this.lastTime >= 500) {
      const elapsed = (now - this.lastTime) / 1000;
      this.metrics.fps = Math.round(this.frameCount / elapsed);
      this.metrics.frameTimeMs = Number(deltaMs.toFixed(2));
      this.frameCount = 0;
      this.lastTime = now;

      // WebGL Renderer Info
      if (renderer.info) {
        this.metrics.drawCalls = renderer.info.render.calls;
        this.metrics.triangles = renderer.info.render.triangles;
        this.metrics.geometries = renderer.info.memory.geometries;
        this.metrics.textures = renderer.info.memory.textures;
      }

      // Scene Graph Metrics
      let meshCount = 0;
      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) meshCount++;
      });
      this.metrics.activeMeshes = meshCount;
      this.metrics.isSleeping = isSleeping;

      // Approximate GPU memory estimate
      this.metrics.memoryEstimateMB = Number(
        ((this.metrics.triangles * 32 + this.metrics.textures * 1024 * 1024 * 4) / (1024 * 1024)).toFixed(1)
      );

      this.notify();
    }
  }

  public setLoadTime(ms: number) {
    this.metrics.loadTimeMs = ms;
    this.notify();
  }

  public subscribe(listener: (m: EnginePerformanceMetrics) => void): () => void {
    this.listeners.add(listener);
    listener(this.metrics);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l({ ...this.metrics }));
  }

  public getMetrics(): EnginePerformanceMetrics {
    return { ...this.metrics };
  }
}

// ============================================================================
// 2. CENTRALIZED PBR MATERIAL MANAGER (ZERO-OVERHEAD REUSE)
// ============================================================================

export class EngineMaterialManager {
  private static instance: EngineMaterialManager;
  private materialCache: Map<string, THREE.Material> = new Map();

  public static getInstance(): EngineMaterialManager {
    if (!this.instance) {
      this.instance = new EngineMaterialManager();
    }
    return this.instance;
  }

  constructor() {
    this.initMasterMaterials();
  }

  private initMasterMaterials() {
    // 1. Cast Aluminum (Block, Sump, Transmission Housing)
    this.materialCache.set(
      'cast_aluminum',
      new THREE.MeshStandardMaterial({
        color: 0x64748b,
        metalness: 0.82,
        roughness: 0.38,
        name: 'Mat_CastAluminum',
      })
    );

    // 2. CNC Billet 6061-T6 (Plenums, Fuel Rails, Pulleys)
    this.materialCache.set(
      'billet_aluminum',
      new THREE.MeshPhysicalMaterial({
        color: 0xe2e8f0,
        metalness: 0.94,
        roughness: 0.12,
        clearcoat: 0.6,
        clearcoatRoughness: 0.08,
        name: 'Mat_BilletAluminum',
      })
    );

    // 3. Forged 4340 Steel (Crankshaft, Rods, Camshafts)
    this.materialCache.set(
      'forged_steel',
      new THREE.MeshStandardMaterial({
        color: 0x334155,
        metalness: 0.90,
        roughness: 0.22,
        name: 'Mat_ForgedSteel',
      })
    );

    // 4. Nitrided Journal Steel (Polished Crank Journals, Cam Lobes)
    this.materialCache.set(
      'nitrided_steel',
      new THREE.MeshPhysicalMaterial({
        color: 0x1e293b,
        metalness: 0.96,
        roughness: 0.06,
        name: 'Mat_NitridedSteel',
      })
    );

    // 5. Titanium Grade 5 Ti-6Al-4V (Valves, Rods, Hardware)
    this.materialCache.set(
      'titanium',
      new THREE.MeshPhysicalMaterial({
        color: 0x94a3b8,
        metalness: 0.92,
        roughness: 0.16,
        clearcoat: 0.4,
        name: 'Mat_Titanium',
      })
    );

    // 6. 3K Twill Carbon Fiber (Intake Plenum, Engine Covers)
    this.materialCache.set(
      'carbon_fiber',
      new THREE.MeshPhysicalMaterial({
        color: 0x090d16,
        metalness: 0.30,
        roughness: 0.18,
        clearcoat: 0.95,
        clearcoatRoughness: 0.04,
        name: 'Mat_CarbonFiber',
      })
    );

    // 7. Forged Carbon Gold Leaf
    this.materialCache.set(
      'forged_carbon_gold',
      new THREE.MeshPhysicalMaterial({
        color: 0x1c1917,
        metalness: 0.45,
        roughness: 0.22,
        clearcoat: 0.98,
        name: 'Mat_ForgedCarbonGold',
      })
    );

    // 8. Anodized Colors
    this.materialCache.set('gold_anodized', new THREE.MeshPhysicalMaterial({ color: 0xf59e0b, metalness: 0.88, roughness: 0.15, clearcoat: 0.5 }));
    this.materialCache.set('cobalt_anodized', new THREE.MeshPhysicalMaterial({ color: 0x2563eb, metalness: 0.88, roughness: 0.15, clearcoat: 0.5 }));
    this.materialCache.set('crimson_anodized', new THREE.MeshPhysicalMaterial({ color: 0xe11d48, metalness: 0.88, roughness: 0.15, clearcoat: 0.5 }));

    // 9. Powdercoat Valve Covers
    this.materialCache.set('rosso_corsa', new THREE.MeshPhysicalMaterial({ color: 0xdc2626, metalness: 0.20, roughness: 0.25, clearcoat: 0.8 }));
    this.materialCache.set('monaco_blue', new THREE.MeshPhysicalMaterial({ color: 0x1d4ed8, metalness: 0.20, roughness: 0.25, clearcoat: 0.8 }));
    this.materialCache.set('stealth_black', new THREE.MeshPhysicalMaterial({ color: 0x0f172a, metalness: 0.15, roughness: 0.65 }));

    // 10. Exhaust Finishes
    this.materialCache.set('titanium_blued', new THREE.MeshPhysicalMaterial({ color: 0x38bdf8, metalness: 0.92, roughness: 0.12, clearcoat: 0.7 }));
    this.materialCache.set('inconel_exhaust', new THREE.MeshPhysicalMaterial({ color: 0xd97706, metalness: 0.88, roughness: 0.28 }));
    this.materialCache.set('polished_chrome', new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0.98, roughness: 0.04 }));

    // 11. Combustion Flame Material
    this.materialCache.set(
      'combustion_flame',
      new THREE.MeshBasicMaterial({
        color: 0xff6b00,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
      })
    );
  }

  public getMaterial(id: string): THREE.Material {
    return this.materialCache.get(id) || this.materialCache.get('cast_aluminum')!;
  }

  public registerMaterial(id: string, mat: THREE.Material): void {
    if (!this.materialCache.has(id)) {
      this.materialCache.set(id, mat);
    }
  }

  public dispose() {
    this.materialCache.forEach((mat) => mat.dispose());
    this.materialCache.clear();
  }
}

// ============================================================================
// 3. GPU HARDWARE INSTANCE MANAGER (BATCHED REPEATED MESHES)
// ============================================================================

export class EngineInstanceManager {
  private static instance: EngineInstanceManager;
  private instanceGroups: Map<string, THREE.InstancedMesh> = new Map();

  public static getInstance(): EngineInstanceManager {
    if (!this.instance) {
      this.instance = new EngineInstanceManager();
    }
    return this.instance;
  }

  /**
   * Creates or updates a batch of hardware bolts/fasteners in a single draw call.
   */
  public createInstancedBatch(
    key: string,
    geometry: THREE.BufferGeometry,
    material: THREE.Material,
    transforms: { position: [number, number, number]; rotation?: [number, number, number]; scale?: [number, number, number] }[]
  ): THREE.InstancedMesh {
    const existing = this.instanceGroups.get(key);
    if (existing) {
      existing.geometry.dispose();
    }

    const count = transforms.length;
    const instancedMesh = new THREE.InstancedMesh(geometry, material, count);
    instancedMesh.castShadow = true;
    instancedMesh.receiveShadow = true;

    const dummy = new THREE.Object3D();
    transforms.forEach((t, i) => {
      dummy.position.set(t.position[0], t.position[1], t.position[2]);
      if (t.rotation) dummy.rotation.set(t.rotation[0], t.rotation[1], t.rotation[2]);
      if (t.scale) dummy.scale.set(t.scale[0], t.scale[1], t.scale[2]);
      dummy.updateMatrix();
      instancedMesh.setMatrixAt(i, dummy.matrix);
    });

    instancedMesh.instanceMatrix.needsUpdate = true;
    this.instanceGroups.set(key, instancedMesh);
    return instancedMesh;
  }

  public dispose() {
    this.instanceGroups.forEach((mesh) => {
      mesh.geometry.dispose();
    });
    this.instanceGroups.clear();
  }
}

// ============================================================================
// 4. CENTRAL ASSET CACHE MANAGER (GLTF/TEXTURE SINGLETON)
// ============================================================================

export class EngineAssetManager {
  private static instance: EngineAssetManager;
  private gltfCache: Map<string, THREE.Group> = new Map();
  private inFlightLoads: Map<string, Promise<THREE.Group>> = new Map();
  private gltfLoader: GLTFLoader;

  public static getInstance(): EngineAssetManager {
    if (!this.instance) {
      this.instance = new EngineAssetManager();
    }
    return this.instance;
  }

  constructor() {
    this.gltfLoader = new GLTFLoader();
    // Setup Draco decoder if available
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    this.gltfLoader.setDRACOLoader(dracoLoader);
  }

  public async loadGlbCached(url: string): Promise<THREE.Group> {
    if (this.gltfCache.has(url)) {
      return this.cloneScene(this.gltfCache.get(url)!);
    }

    if (this.inFlightLoads.has(url)) {
      const cached = await this.inFlightLoads.get(url)!;
      return this.cloneScene(cached);
    }

    const loadPromise = new Promise<THREE.Group>((resolve, reject) => {
      const startTime = performance.now();
      this.gltfLoader.load(
        url,
        (gltf) => {
          const group = gltf.scene;
          this.optimizeImportedScene(group);
          this.gltfCache.set(url, group);
          this.inFlightLoads.delete(url);
          const elapsed = performance.now() - startTime;
          EnginePerformanceMonitor.getInstance().setLoadTime(Math.round(elapsed));
          resolve(this.cloneScene(group));
        },
        undefined,
        (error) => {
          console.warn(`[EngineAssetManager] Could not load GLB from ${url}, falling back.`, error);
          this.inFlightLoads.delete(url);
          reject(error);
        }
      );
    });

    this.inFlightLoads.set(url, loadPromise);
    return loadPromise;
  }

  private optimizeImportedScene(scene: THREE.Object3D) {
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

  public cloneScene(source: THREE.Group): THREE.Group {
    const clone = source.clone(true);
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
    return clone;
  }

  public dispose() {
    this.gltfCache.forEach((group) => {
      group.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.geometry.dispose();
        }
      });
    });
    this.gltfCache.clear();
    this.inFlightLoads.clear();
  }
}

// ============================================================================
// 5. ADAPTIVE RENDER CONTROLLER (IDLE SLEEP & INSTANT WAKEUP)
// ============================================================================

export class AdaptiveRenderController {
  private isDirty = true;
  private isAnimating = true;
  private lastInteractionTime = performance.now();
  private idleThresholdMs = 2500; // Sleep after 2.5s of no motion

  public markDirty() {
    this.isDirty = true;
    this.lastInteractionTime = performance.now();
  }

  public setAnimating(animating: boolean) {
    this.isAnimating = animating;
    if (animating) this.markDirty();
  }

  public shouldRender(): boolean {
    if (this.isAnimating) return true;
    if (this.isDirty) {
      if (performance.now() - this.lastInteractionTime > this.idleThresholdMs) {
        this.isDirty = false;
        return false;
      }
      return true;
    }
    return false;
  }
}
