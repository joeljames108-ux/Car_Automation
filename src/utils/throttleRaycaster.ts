// ============================================================================
// THROTTLED RAYCASTER — PERFORMANCE OPTIMIZATION UTILITY
// ============================================================================
// Reusable throttled raycaster that prevents expensive intersection tests
// from running on every pointer move event. Limits to ~30fps max.
// ============================================================================

import * as THREE from "three";

export interface ThrottledRaycasterConfig {
  throttleMs: number;
  maxDistance: number;
}

const DEFAULT_CONFIG: ThrottledRaycasterConfig = {
  throttleMs: 32, // ~30fps
  maxDistance: 100,
};

export class ThrottledRaycaster {
  private raycaster: THREE.Raycaster;
  private mouse: THREE.Vector2;
  private lastCastTime: number = 0;
  private config: ThrottledRaycasterConfig;
  private pendingEvent: MouseEvent | null = null;
  private isProcessing: boolean = false;

  constructor(config: Partial<ThrottledRaycasterConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.raycaster = new THREE.Raycaster();
    this.raycaster.far = this.config.maxDistance;
    this.mouse = new THREE.Vector2();
  }

  /**
   * Returns true if enough time has passed since the last raycast.
   */
  public shouldCast(): boolean {
    const now = performance.now();
    if (now - this.lastCastTime >= this.config.throttleMs) {
      this.lastCastTime = now;
      return true;
    }
    return false;
  }

  /**
   * Performs a raycast from a mouse event against scene objects.
   * Returns intersection results or null if throttled.
   */
  public cast(
    event: MouseEvent | PointerEvent,
    camera: THREE.Camera,
    scene: THREE.Scene,
    recursive: boolean = true
  ): THREE.Intersection[] | null {
    if (!this.shouldCast()) return null;

    const target = event.currentTarget as HTMLElement;
    if (!target) return null;

    const rect = target.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, camera);
    return this.raycaster.intersectObjects(scene.children, recursive);
  }

  /**
   * Performs raycast from explicit NDC coordinates.
   */
  public castFromNDC(
    x: number,
    y: number,
    camera: THREE.Camera,
    scene: THREE.Scene,
    recursive: boolean = true
  ): THREE.Intersection[] | null {
    if (!this.shouldCast()) return null;

    this.mouse.x = x;
    this.mouse.y = y;

    this.raycaster.setFromCamera(this.mouse, camera);
    return this.raycaster.intersectObjects(scene.children, recursive);
  }

  /**
   * Updates the raycaster's far distance.
   */
  public setMaxDistance(distance: number): void {
    this.raycaster.far = distance;
  }

  /**
   * Resets the throttle timer (e.g., on mouse down for immediate response).
   */
  public reset(): void {
    this.lastCastTime = 0;
  }

  /**
   * Disposes internal resources.
   */
  public dispose(): void {
    // Nothing to dispose — raycaster is reused
  }
}

/**
 * Extracts a named userData value from a raycast hit by traversing up the parent chain.
 * Works with COMP_, HOTSPOT_, and general userData patterns.
 */
export function extractHitUserData(
  intersections: THREE.Intersection[],
  key: string
): { value: string; object: THREE.Object3D } | null {
  for (const hit of intersections) {
    let current: THREE.Object3D | null = hit.object;
    while (current) {
      // Check name prefix patterns
      const name = current.name;
      if (name.startsWith("COMP_") && key === "socketId") {
        return { value: name.replace("COMP_", ""), object: current };
      }
      if (name.startsWith("HOTSPOT_") && key === "socketId") {
        return { value: name.replace("HOTSPOT_", ""), object: current };
      }
      // Check userData
      if (current.userData && current.userData[key]) {
        return { value: current.userData[key] as string, object: current };
      }
      current = current.parent;
    }
  }
  return null;
}

/**
 * Disposes a Three.js scene and all its children to prevent memory leaks.
 * Handles materials, geometries, textures, and removes from parent.
 */
export function disposeThreeSceneOptimized(
  scene: THREE.Scene,
  renderer?: THREE.WebGLRenderer
): void {
  scene.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      if (object.geometry) {
        object.geometry.dispose();
      }
      if (object.material) {
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((mat) => {
          if (mat instanceof THREE.MeshPhysicalMaterial || mat instanceof THREE.MeshStandardMaterial) {
            // Dispose textures
            if (mat.map) mat.map.dispose();
            if (mat.normalMap) mat.normalMap.dispose();
            if (mat.roughnessMap) mat.roughnessMap.dispose();
            if (mat.metalnessMap) mat.metalnessMap.dispose();
            if ('clearcoatMap' in mat && (mat as any).clearcoatMap) (mat as any).clearcoatMap.dispose();
            if (mat.envMap) mat.envMap.dispose();
          }
          mat.dispose();
        });
      }
    }
    if (object instanceof THREE.Points) {
      if (object.geometry) object.geometry.dispose();
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach((m) => m.dispose());
        } else {
          object.material.dispose();
        }
      }
    }
    if (object instanceof THREE.Line || object instanceof THREE.LineSegments) {
      if (object.geometry) object.geometry.dispose();
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach((m) => m.dispose());
        } else {
          object.material.dispose();
        }
      }
    }
  });

  // Remove all children from scene
  while (scene.children.length > 0) {
    scene.remove(scene.children[0]);
  }

  if (renderer) {
    renderer.dispose();
    renderer.forceContextLoss();
  }
}

/**
 * Creates a reusable geometry cache to avoid recreating geometries on every state change.
 */
export class GeometryCache {
  private cache: Map<string, THREE.BufferGeometry> = new Map();

  public getBox(width: number, height: number, depth: number): THREE.BufferGeometry {
    const key = `box_${width}_${height}_${depth}`;
    if (!this.cache.has(key)) {
      this.cache.set(key, new THREE.BoxGeometry(width, height, depth));
    }
    return this.cache.get(key)!.clone();
  }

  public getCylinder(radiusTop: number, radiusBottom: number, height: number, segments: number = 16): THREE.BufferGeometry {
    const key = `cyl_${radiusTop}_${radiusBottom}_${height}_${segments}`;
    if (!this.cache.has(key)) {
      this.cache.set(key, new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments));
    }
    return this.cache.get(key)!.clone();
  }

  public getCone(radius: number, height: number, segments: number = 16): THREE.BufferGeometry {
    const key = `cone_${radius}_${height}_${segments}`;
    if (!this.cache.has(key)) {
      this.cache.set(key, new THREE.ConeGeometry(radius, height, segments));
    }
    return this.cache.get(key)!.clone();
  }

  public getTorus(radius: number, tube: number, radialSegments: number = 12, tubularSegments: number = 24): THREE.BufferGeometry {
    const key = `torus_${radius}_${tube}_${radialSegments}_${tubularSegments}`;
    if (!this.cache.has(key)) {
      this.cache.set(key, new THREE.TorusGeometry(radius, tube, radialSegments, tubularSegments));
    }
    return this.cache.get(key)!.clone();
  }

  public dispose(): void {
    this.cache.forEach((geo) => geo.dispose());
    this.cache.clear();
  }

  public get size(): number {
    return this.cache.size;
  }
}

/**
 * Adaptive quality scaler that reduces rendering quality when FPS drops below threshold.
 */
export class AdaptiveQualityScaler {
  private fpsHistory: number[] = [];
  private targetFps: number;
  private currentQuality: number = 1.0;
  private lastCheckTime: number = 0;

  constructor(targetFps: number = 55) {
    this.targetFps = targetFps;
  }

  /**
   * Call once per frame with the delta time.
   * Returns a quality multiplier (0.5 = half resolution, 1.0 = full).
   */
  public update(deltaTime: number): number {
    const now = performance.now();
    if (now - this.lastCheckTime < 500) return this.currentQuality; // Check every 500ms

    this.lastCheckTime = now;
    const fps = 1 / deltaTime;
    this.fpsHistory.push(fps);

    if (this.fpsHistory.length > 10) {
      this.fpsHistory.shift();
    }

    const avgFps = this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;

    if (avgFps < this.targetFps * 0.8) {
      // Performance is bad — reduce quality
      this.currentQuality = Math.max(0.5, this.currentQuality - 0.1);
    } else if (avgFps > this.targetFps * 1.2) {
      // Performance is good — increase quality
      this.currentQuality = Math.min(1.0, this.currentQuality + 0.05);
    }

    return this.currentQuality;
  }

  public getQuality(): number {
    return this.currentQuality;
  }

  public getPixelRatio(baseRatio: number): number {
    return Math.min(baseRatio * this.currentQuality, 2);
  }

  public getShadowMapSize(baseSize: number): number {
    return Math.floor(baseSize * this.currentQuality);
  }
}
