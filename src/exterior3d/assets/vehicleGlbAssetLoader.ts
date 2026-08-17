// ============================================================================
// MODULAR glTF VEHICLE CONSTRUCTION SYSTEM — VEHICLE GLB ASSET LOADER
// ============================================================================
// High-performance asynchronous glTF 2.0 / GLB asset loader for vehicle
// chassis, interior, powertrain, closures, and suspension.
// Scans and binds attachment markers (MOUNT_*, HARDPOINT_*).
// ============================================================================

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export interface VehicleGlbLoadResult {
  scene: THREE.Group;
  hardpoints: Record<string, THREE.Vector3>;
  meshCount: number;
  vertexCount: number;
}

export class VehicleGlbAssetLoader {
  private static instance: VehicleGlbAssetLoader;
  private loader: GLTFLoader;
  private cache: Map<string, VehicleGlbLoadResult>;

  private constructor() {
    this.loader = new GLTFLoader();
    this.cache = new Map();
  }

  public static getInstance(): VehicleGlbAssetLoader {
    if (!VehicleGlbAssetLoader.instance) {
      VehicleGlbAssetLoader.instance = new VehicleGlbAssetLoader();
    }
    return VehicleGlbAssetLoader.instance;
  }

  /**
   * Asynchronously loads a .glb / .gltf file from the public/models directory.
   */
  public async loadModel(url: string): Promise<VehicleGlbLoadResult> {
    if (this.cache.has(url)) {
      const cached = this.cache.get(url)!;
      return {
        scene: cached.scene.clone(true),
        hardpoints: { ...cached.hardpoints },
        meshCount: cached.meshCount,
        vertexCount: cached.vertexCount,
      };
    }

    return new Promise((resolve, reject) => {
      this.loader.load(
        url,
        (gltf) => {
          const root = gltf.scene;
          const hardpoints: Record<string, THREE.Vector3> = {};
          let meshCount = 0;
          let vertexCount = 0;

          // Traverse and extract hardpoint attachment nodes
          root.traverse((child) => {
            if (child.name.startsWith('MOUNT_') || child.name.startsWith('HARDPOINT_')) {
              const worldPos = new THREE.Vector3();
              child.getWorldPosition(worldPos);
              hardpoints[child.name] = worldPos;
            }

            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              mesh.castShadow = true;
              mesh.receiveShadow = true;
              meshCount++;
              if (mesh.geometry) {
                vertexCount += mesh.geometry.attributes.position?.count || 0;
              }
            }
          });

          const result: VehicleGlbLoadResult = {
            scene: root,
            hardpoints,
            meshCount,
            vertexCount,
          };

          this.cache.set(url, result);
          resolve({
            scene: root.clone(true),
            hardpoints: { ...hardpoints },
            meshCount,
            vertexCount,
          });
        },
        undefined,
        (error) => {
          console.warn(`[VehicleGlbAssetLoader] Could not load GLB at ${url}, falling back to procedural mesh.`, error);
          reject(error);
        }
      );
    });
  }
}
