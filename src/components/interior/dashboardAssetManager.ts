/**
 * ============================================================================
 * DASHBOARD ASSET MANAGER (Three.js WebGL Engine)
 * ============================================================================
 * Handles GLTF loading, scene traversal, node indexing, and semantic lookups
 * for `public/models/interior/dashboard_interactive_master.glb`.
 * ============================================================================
 */

import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export class DashboardAssetManager {
  private loader: GLTFLoader;
  private nodeMap: Map<string, THREE.Object3D> = new Map();
  private modelRoot: THREE.Group | null = null;
  private isLoaded: boolean = false;

  constructor() {
    this.loader = new GLTFLoader();
  }

  public async loadModel(
    url: string,
    onProgress?: (percent: number) => void
  ): Promise<THREE.Group> {
    return new Promise((resolve, reject) => {
      this.loader.load(
        url,
        (gltf) => {
          this.modelRoot = gltf.scene;
          this.nodeMap.clear();

          // Traverse and index every semantic node
          this.modelRoot.traverse((child) => {
            if (child.name) {
              this.nodeMap.set(child.name, child);
            }

            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              mesh.castShadow = true;
              mesh.receiveShadow = true;

              // Ensure material clones so individual part recoloring doesn't cross-contaminate
              if (Array.isArray(mesh.material)) {
                mesh.material = mesh.material.map((m) => m.clone());
              } else if (mesh.material) {
                mesh.material = mesh.material.clone();
              }
            }
          });

          this.isLoaded = true;
          resolve(this.modelRoot);
        },
        (xhr) => {
          if (onProgress && xhr.total > 0) {
            onProgress(Math.round((xhr.loaded / xhr.total) * 100));
          }
        },
        (err) => {
          console.error("[DashboardAssetManager] Error loading GLB:", err);
          reject(err);
        }
      );
    });
  }

  public getNode<T extends THREE.Object3D = THREE.Object3D>(name: string): T | null {
    return (this.nodeMap.get(name) as T) || null;
  }

  public findNodesWithPrefix(prefix: string): THREE.Object3D[] {
    const results: THREE.Object3D[] = [];
    for (const [name, obj] of this.nodeMap.entries()) {
      if (name.startsWith(prefix)) {
        results.push(obj);
      }
    }
    return results;
  }

  public getAllNodes(): Map<string, THREE.Object3D> {
    return this.nodeMap;
  }

  public getRoot(): THREE.Group | null {
    return this.modelRoot;
  }

  public isModelLoaded(): boolean {
    return this.isLoaded;
  }
}
