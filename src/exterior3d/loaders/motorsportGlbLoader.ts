// ============================================================================
// MOTORSPORT 3D CAD GLB ASSET LOADER & CACHE MANAGER
// ============================================================================
// Unified loader for Blender-modeled Formula 1 and FIA WEC Hypercar assets:
// - Complete assembled vehicle models (/vehicles/f1/complete-f1.glb, /vehicles/gt3_supercar/complete-gt3_supercar.glb)
// - Modular individual socket subcomponents
// - In-memory LRU template caching with fast deep cloning
// - Automatic DRACO decoding, shadow casting, and normal recomputation
// ============================================================================

import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import type { HypercarSocketId } from "../../sim/hypercar/modular/hypercarSockets";

// Mapping of F1 Component meshName to GLB asset URL
export const F1_GLB_ASSET_MAP: Record<string, string> = {
  F1_Monocoque_T800: "/vehicles/f1/f1_monocoque_t800.glb",
  F1_Monocoque_M55J: "/vehicles/f1/f1_monocoque_m55j.glb",
  F1_Nose_Undercut: "/vehicles/f1/f1_nose_undercut.glb",
  F1_Nose_Wide: "/vehicles/f1/f1_nose_wide.glb",
  F1_FrontWing_Outwash4: "/vehicles/f1/f1_frontwing_outwash4.glb",
  F1_FrontWing_Monza3: "/vehicles/f1/f1_frontwing_monza3.glb",
  F1_Halo_Grade5: "/vehicles/f1/f1_halo_grade5.glb",
  F1_Cockpit_PDU: "/vehicles/f1/f1_cockpit_pdu.glb",
  F1_Suspension_FL_Pullrod: "/vehicles/f1/f1_suspension_fl_pullrod.glb",
  F1_Suspension_FR_Pullrod: "/vehicles/f1/f1_suspension_fr_pullrod.glb",
  F1_Floor_QuadFence: "/vehicles/f1/f1_floor_quadfence.glb",
  F1_Floor_AntiPorpoise: "/vehicles/f1/f1_floor_antiporpoise.glb",
  F1_Sidepod_L_Downwash: "/vehicles/f1/f1_sidepod_l_downwash.glb",
  F1_Sidepod_R_Downwash: "/vehicles/f1/f1_sidepod_r_downwash.glb",
  F1_PowerUnit_ApexWorks: "/vehicles/f1/f1_powerunit_apexworks.glb",
  F1_Gearbox_Carbon8: "/vehicles/f1/f1_gearbox_carbon8.glb",
  F1_Diffuser_QuadStrake: "/vehicles/f1/f1_diffuser_quadstrake.glb",
  F1_RearWing_CascadeDRS: "/vehicles/f1/f1_rearwing_cascadedrs.glb",
  F1_RearWing_MonzaSpoon: "/vehicles/f1/f1_rearwing_monzaspoon.glb",
  F1_Suspension_RL_Pushrod: "/vehicles/f1/f1_suspension_rl_pushrod.glb",
  F1_Suspension_RR_Pushrod: "/vehicles/f1/f1_suspension_rr_pushrod.glb",
  F1_Wheel_FL: "/vehicles/f1/f1_wheel_fl.glb",
  F1_Wheel_FR: "/vehicles/f1/f1_wheel_fr.glb",
  F1_Wheel_RL: "/vehicles/f1/f1_wheel_rl.glb",
  F1_Wheel_RR: "/vehicles/f1/f1_wheel_rr.glb",
};

// Mapping of Hypercar Socket IDs to GLB asset URLs (can be single or multiple parts)
export const HYPERCAR_GLB_ASSET_MAP: Partial<Record<HypercarSocketId, string[]>> = {
  SOCKET_CENTRAL_MONOCOQUE: ["/vehicles/gt3_supercar/hypercar_chassis_monocoque.glb"],
  SOCKET_FRONT_CRASH_NOSE: ["/vehicles/gt3_supercar/hypercar_front_bumper_fascia.glb"],
  SOCKET_FRONT_CLAMSHELL: ["/vehicles/gt3_supercar/hypercar_hood_vented.glb"],
  SOCKET_FRONT_SPLITTER: ["/vehicles/gt3_supercar/hypercar_front_splitter.glb"],
  SOCKET_FRONT_CANARDS: [
    "/vehicles/gt3_supercar/hypercar_fender_front_left.glb",
    "/vehicles/gt3_supercar/hypercar_fender_front_right.glb",
  ],
  SOCKET_WINDSCREEN_ROOF: ["/vehicles/gt3_supercar/hypercar_roof_canopy.glb"],
  SOCKET_SIDE_BODY_L: [
    "/vehicles/gt3_supercar/hypercar_door_butterfly_left.glb",
    "/vehicles/gt3_supercar/hypercar_rocker_skirt_left.glb",
  ],
  SOCKET_SIDE_BODY_R: [
    "/vehicles/gt3_supercar/hypercar_door_butterfly_right.glb",
    "/vehicles/gt3_supercar/hypercar_rocker_skirt_right.glb",
  ],
  SOCKET_REAR_WING: ["/vehicles/gt3_supercar/hypercar_active_rear_wing.glb"],
  SOCKET_REAR_DIFFUSER: ["/vehicles/gt3_supercar/hypercar_rear_diffuser.glb"],
  SOCKET_EXHAUST_SYSTEM: ["/vehicles/gt3_supercar/hypercar_rear_bumper.glb"],
  SOCKET_DORSAL_SHARK_FIN: [
    "/vehicles/gt3_supercar/hypercar_rear_haunch_left.glb",
    "/vehicles/gt3_supercar/hypercar_rear_haunch_right.glb",
  ],
  SOCKET_WHEELS_BRAKES_FL: ["/vehicles/gt3_supercar/hypercar_wheel_fl.glb"],
  SOCKET_WHEELS_BRAKES_FR: ["/vehicles/gt3_supercar/hypercar_wheel_fr.glb"],
  SOCKET_WHEELS_BRAKES_RL: ["/vehicles/gt3_supercar/hypercar_wheel_rl.glb"],
  SOCKET_WHEELS_BRAKES_RR: ["/vehicles/gt3_supercar/hypercar_wheel_rr.glb"],
};

export class MotorsportGlbLoader {
  private static gltfLoader: GLTFLoader | null = null;
  private static dracoLoader: DRACOLoader | null = null;
  private static templateCache: Map<string, THREE.Group> = new Map();
  private static pendingPromises: Map<string, Promise<THREE.Group>> = new Map();

  /**
   * Initializes and returns singleton GLTFLoader with DRACO support.
   */
  public static getLoader(): GLTFLoader {
    if (!this.gltfLoader) {
      this.gltfLoader = new GLTFLoader();
      try {
        this.gltfLoader.setMeshoptDecoder(MeshoptDecoder);
      } catch {
        // Fallback if Meshopt unavailable
      }
      if (typeof window !== "undefined") {
        try {
          this.dracoLoader = new DRACOLoader();
          this.dracoLoader.setDecoderPath("/draco/");
          this.gltfLoader.setDRACOLoader(this.dracoLoader);
        } catch {
          // Graceful fallback if offline
        }
      }
    }
    return this.gltfLoader;
  }

  /**
   * Loads a raw GLB URL, caching the parsed template scene.
   */
  public static async loadRawGlb(url: string): Promise<THREE.Group> {
    if (this.templateCache.has(url)) {
      return this.cloneModel(this.templateCache.get(url)!);
    }

    if (this.pendingPromises.has(url)) {
      const template = await this.pendingPromises.get(url)!;
      return this.cloneModel(template);
    }

    const loader = this.getLoader();
    const loadPromise = new Promise<THREE.Group>((resolve, reject) => {
      loader.load(
        url,
        (gltf) => {
          const scene = gltf.scene;
          // Pre-configure lighting and shadows on template
          scene.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              mesh.castShadow = true;
              mesh.receiveShadow = true;
              if (mesh.geometry) {
                mesh.geometry.computeVertexNormals();
              }
            }
          });
          this.templateCache.set(url, scene);
          this.pendingPromises.delete(url);
          resolve(scene);
        },
        undefined,
        (err) => {
          this.pendingPromises.delete(url);
          reject(err);
        }
      );
    });

    this.pendingPromises.set(url, loadPromise);
    const loadedTemplate = await loadPromise;
    return this.cloneModel(loadedTemplate);
  }

  /**
   * Returns a synchronous clone if already cached in memory, or null if not yet loaded.
   */
  public static getCachedRawGlb(url: string): THREE.Group | null {
    const cached = this.templateCache.get(url);
    if (!cached) return null;
    return this.cloneModel(cached);
  }

  /**
   * Deep clones a model hierarchy and clones all materials so state changes (wireframe,
   * opacity, emissive) don't mutate the template or other instances.
   */
  public static cloneModel(source: THREE.Group): THREE.Group {
    const clone = source.clone(true);
    clone.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) {
        const mesh = node as THREE.Mesh;
        if (Array.isArray(mesh.material)) {
          mesh.material = mesh.material.map((m) => m.clone());
        } else if (mesh.material) {
          mesh.material = mesh.material.clone();
        }
      }
    });
    return clone;
  }

  // ── High-Level Vehicle Loaders ──

  /**
   * Loads the complete unified 2026 F1 vehicle model.
   */
  public static async loadF1CompleteVehicle(): Promise<THREE.Group> {
    return this.loadRawGlb("/vehicles/f1/complete-f1.glb");
  }

  /**
   * Loads the complete unified FIA WEC Hypercar / GT3 model.
   */
  public static async loadHypercarCompleteVehicle(): Promise<THREE.Group> {
    return this.loadRawGlb("/vehicles/gt3_supercar/complete-gt3_supercar.glb");
  }

  /**
   * Loads an individual modular F1 part by its glbMeshName.
   */
  public static async loadF1Part(meshName: string): Promise<THREE.Group | null> {
    const url = F1_GLB_ASSET_MAP[meshName];
    if (!url) return null;
    try {
      return await this.loadRawGlb(url);
    } catch (err) {
      console.warn(`Failed to load F1 modular part ${meshName} from ${url}:`, err);
      return null;
    }
  }

  /**
   * Checks synchronous cache for an individual modular F1 part.
   */
  public static getCachedF1Part(meshName: string): THREE.Group | null {
    const url = F1_GLB_ASSET_MAP[meshName];
    if (!url) return null;
    return this.getCachedRawGlb(url);
  }

  /**
   * Loads an individual modular Hypercar part by socket ID.
   */
  public static async loadHypercarPart(socketId: HypercarSocketId): Promise<THREE.Group | null> {
    const urls = HYPERCAR_GLB_ASSET_MAP[socketId];
    if (!urls || urls.length === 0) return null;

    try {
      if (urls.length === 1) {
        return await this.loadRawGlb(urls[0]);
      }
      // Compound group for sockets with multiple panels (e.g., left + right canard)
      const compound = new THREE.Group();
      compound.name = `COMPOUND_${socketId}`;
      const loaded = await Promise.all(urls.map((u) => this.loadRawGlb(u)));
      loaded.forEach((g) => compound.add(g));
      return compound;
    } catch (err) {
      console.warn(`Failed to load Hypercar modular part for socket ${socketId}:`, err);
      return null;
    }
  }

  /**
   * Checks synchronous cache for Hypercar socket part.
   */
  public static getCachedHypercarPart(socketId: HypercarSocketId): THREE.Group | null {
    const urls = HYPERCAR_GLB_ASSET_MAP[socketId];
    if (!urls || urls.length === 0) return null;

    if (urls.length === 1) {
      return this.getCachedRawGlb(urls[0]);
    }
    const parts = urls.map((u) => this.getCachedRawGlb(u));
    if (parts.some((p) => p === null)) return null;
    const compound = new THREE.Group();
    compound.name = `COMPOUND_${socketId}`;
    parts.forEach((p) => p && compound.add(p));
    return compound;
  }

  /**
   * Pre-fetches key GLB assets in background for instant switching.
   */
  public static preloadCoreAssets(): void {
    if (typeof window === "undefined") return;
    setTimeout(() => {
      this.loadF1CompleteVehicle().catch(() => {});
      this.loadHypercarCompleteVehicle().catch(() => {});
    }, 100);
  }
}
