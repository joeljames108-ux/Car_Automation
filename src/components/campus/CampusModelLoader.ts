/**
 * AUTO TYCOON CAMPUS HQ - GLB MODEL LOADER & CACHE MANAGER (PHASE 36)
 * 
 * Manages asynchronous loading, memory caching, and LOD resolution
 * for campus buildings, roads, terrain, and decorative props.
 */

import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { CampusUnitId } from "../../sim/campus/campusTypes";

export interface CampusModelLoadResult {
  scene: THREE.Group;
  animations: THREE.AnimationClip[];
  isPlaceholderFallback: boolean;
}

export class CampusModelLoader {
  private static instance: CampusModelLoader | null = null;
  private loader: GLTFLoader;
  private cache: Map<string, THREE.Group> = new Map();
  private pendingPromises: Map<string, Promise<CampusModelLoadResult>> = new Map();

  private constructor() {
    this.loader = new GLTFLoader();
  }

  public static getInstance(): CampusModelLoader {
    if (!CampusModelLoader.instance) {
      CampusModelLoader.instance = new CampusModelLoader();
    }
    return CampusModelLoader.instance;
  }

  /**
   * Loads a GLB model with memory caching and fallback geometry if asset is missing
   */
  public async loadModel(
    url: string,
    unitId?: CampusUnitId,
    level: number = 1,
    onProgress?: (pct: number) => void
  ): Promise<CampusModelLoadResult> {
    // 1. Check in-memory cache
    if (this.cache.has(url)) {
      const cached = this.cache.get(url)!;
      return {
        scene: cached.clone(true),
        animations: [],
        isPlaceholderFallback: false,
      };
    }

    // 2. Deduplicate concurrent requests
    if (this.pendingPromises.has(url)) {
      return this.pendingPromises.get(url)!;
    }

    const loadPromise = new Promise<CampusModelLoadResult>((resolve) => {
      this.loader.load(
        url,
        (gltf) => {
          // Enable shadows and PBR properties
          gltf.scene.traverse((node) => {
            if ((node as THREE.Mesh).isMesh) {
              const mesh = node as THREE.Mesh;
              mesh.castShadow = true;
              mesh.receiveShadow = true;
              if (unitId) {
                mesh.userData.unitId = unitId;
                mesh.userData.level = level;
              }
            }
          });

          this.cache.set(url, gltf.scene);
          this.pendingPromises.delete(url);
          resolve({
            scene: gltf.scene.clone(true),
            animations: gltf.animations,
            isPlaceholderFallback: false,
          });
        },
        (xhr) => {
          if (xhr.total > 0 && onProgress) {
            onProgress(Math.round((xhr.loaded / xhr.total) * 100));
          }
        },
        (error) => {
          // Fallback gracefully to procedural architectural placeholder
          console.warn(`[CampusModelLoader] GLB not found at '${url}', generating procedural placeholder:`, error);
          const fallbackScene = this.createFallbackBuildingMesh(unitId, level);
          this.pendingPromises.delete(url);
          resolve({
            scene: fallbackScene,
            animations: [],
            isPlaceholderFallback: true,
          });
        }
      );
    });

    this.pendingPromises.set(url, loadPromise);
    return loadPromise;
  }

  /**
   * Generates a stylized procedural diorama building as a fallback
   */
  public createFallbackBuildingMesh(unitId?: CampusUnitId, level: number = 1): THREE.Group {
    const group = new THREE.Group();
    const height = 12 + level * 3;
    const width = 22 + (level > 3 ? 8 : 0);
    const length = 22 + (level > 3 ? 8 : 0);

    // Warm exposed brick base
    const baseGeo = new THREE.BoxGeometry(width, height, length);
    const baseMat = new THREE.MeshStandardMaterial({
      color: level <= 2 ? "#e2c4b8" : "#cbd5e1", // Brick pink in early era -> slate gray in modern
      roughness: 0.7,
      metalness: 0.1,
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = height / 2;
    baseMesh.castShadow = true;
    baseMesh.receiveShadow = true;
    if (unitId) baseMesh.userData.unitId = unitId;
    group.add(baseMesh);

    // Dark slate roof trim
    const roofGeo = new THREE.BoxGeometry(width + 1.5, 1.2, length + 1.5);
    const roofMat = new THREE.MeshStandardMaterial({
      color: "#1e293b",
      roughness: 0.5,
    });
    const roofMesh = new THREE.Mesh(roofGeo, roofMat);
    roofMesh.position.y = height + 0.6;
    roofMesh.castShadow = true;
    if (unitId) roofMesh.userData.unitId = unitId;
    group.add(roofMesh);

    // Glazing strip windows
    const windowMat = new THREE.MeshPhysicalMaterial({
      color: "#93c5fd",
      transmission: 0.6,
      roughness: 0.15,
      ior: 1.5,
      reflectivity: 0.8,
    });
    const windowGeo = new THREE.BoxGeometry(width + 0.2, 2.5, length + 0.2);
    const windowMesh = new THREE.Mesh(windowGeo, windowMat);
    windowMesh.position.y = height * 0.65;
    group.add(windowMesh);

    if (unitId) group.userData.unitId = unitId;
    return group;
  }

  /**
   * Clear cache if needed (e.g. upon scene destruction or low memory)
   */
  public clearCache(): void {
    this.cache.clear();
    this.pendingPromises.clear();
  }
}
