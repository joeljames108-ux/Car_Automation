// ====================================================================
// GLB MATERIAL PIPELINE INTEGRATOR — Auto-Applies All 8 Systems
// ====================================================================
// Central integration module that analyzes a loaded GLB scene graph
// and automatically applies the appropriate material systems:
//
// 1. MultiLayerPaintSystem   → body panels, doors, hood, fenders
// 2. GlassRefractionSystem   → windshield, windows, headlight/taillight lenses
// 3. WheelTireDetailSystem   → wheel assemblies with detailed brake components
// 4. LightingOpticsSystem    → headlights, taillights, DRLs, light pipes
// 5. ExteriorDetailGenerator → door handles, badges, exhaust tips, mirrors
// 6. BodyPanelGapSystem      → shut lines, drain channels, seal strips
// 7. EnvironmentReflectionSystem → ground plane, contact shadows, studio env
// 8. PaintFlakeShaderModule  → animated sparkle on paint materials
//
// Usage: Call GLBMaterialPipelineIntegrator.integrate(scene) after loading
// ====================================================================

import * as THREE from "three";
// Lazy-loaded material systems — only imported when actually needed
// This keeps the initial bundle small and defers heavy 3D material code
let _paintSystem: typeof import("./multiLayerPaintSystem") | null = null;
let _glassSystem: typeof import("./glassRefractionSystem") | null = null;
let _wheelSystem: typeof import("./wheelTireDetailSystem") | null = null;
let _lightingSystem: typeof import("./lightingOpticsSystem") | null = null;
let _detailSystem: typeof import("./exteriorDetailGenerator") | null = null;
let _gapSystem: typeof import("./bodyPanelGapSystem") | null = null;
let _envSystem: typeof import("./environmentReflectionSystem") | null = null;

async function loadPaintSystem() { if (!_paintSystem) _paintSystem = await import("./multiLayerPaintSystem"); return _paintSystem; }
async function loadGlassSystem() { if (!_glassSystem) _glassSystem = await import("./glassRefractionSystem"); return _glassSystem; }
async function loadWheelSystem() { if (!_wheelSystem) _wheelSystem = await import("./wheelTireDetailSystem"); return _wheelSystem; }
async function loadLightingSystem() { if (!_lightingSystem) _lightingSystem = await import("./lightingOpticsSystem"); return _lightingSystem; }
async function loadDetailSystem() { if (!_detailSystem) _detailSystem = await import("./exteriorDetailGenerator"); return _detailSystem; }
async function loadGapSystem() { if (!_gapSystem) _gapSystem = await import("./bodyPanelGapSystem"); return _gapSystem; }
async function loadEnvSystem() { if (!_envSystem) _envSystem = await import("./environmentReflectionSystem"); return _envSystem; }

// --- MESH CLASSIFICATION KEYWORDS ---
const BODY_KEYWORDS = [
  "body", "panel", "door", "hood", "fender", "bonnet", "roof",
  "bumper", "quarter", "fascia", "skirt", "rocker", "cowl",
  "valance", "trunk", "decklid", "spoil", "wing", "flare",
  "canard", "splitter", "diffuser", "aero", "lip",
];

const GLASS_KEYWORDS = [
  "glass", "window", "windshield", "windscreen", "lens",
  "headlight", "taillight", "lightbar", "mirror", "glazing",
];

const WHEEL_KEYWORDS = [
  "wheel", "rim", "tire", "tyre", "hub", "lug", "centerlock",
  "brake", "caliper", "rotor", "disc", "drum",
];

const LIGHT_KEYWORDS = [
  "headlight", "taillight", "led", "drl", "lightbar",
  "turn", "signal", "fog", "light", "lamp",
];

const EXCLUDE_KEYWORDS = [
  "suspension", "engine", "transmission", "exhaust", "intake",
  "cylinder", "piston", "turbo", "intercooler", "radiator",
  "chassis", "frame", "subframe", "cradle", "drivetrain",
  "axle", "differential", "driveshaft", "halfshaft", "cv",
];

// --- INTEGRATION CONFIGURATION ---
export interface GLBIntegrationConfig {
  paintPreset: string;
  applyGlass: boolean;
  applyWheels: boolean;
  applyLighting: boolean;
  applyDetails: boolean;
  applyPanelGaps: boolean;
  applyEnvironment: boolean;
  applyPostProcessing: boolean;
  wheelBase: number;
  trackWidth: number;
}

const DEFAULT_CONFIG: GLBIntegrationConfig = {
  paintPreset: "bugattiAtlanticBlue",
  applyGlass: true,
  applyWheels: true,
  applyLighting: true,
  applyDetails: true,
  applyPanelGaps: true,
  applyEnvironment: true,
  applyPostProcessing: true,
  wheelBase: 2.8,
  trackWidth: 1.6,
};

// --- GLB MATERIAL PIPELINE INTEGRATOR ---
export class GLBMaterialPipelineIntegrator {

  /**
   * Main entry point — analyzes scene and applies all material systems.
   * Call this after loading a GLB and before adding to the render scene.
   * Now async to support lazy-loaded material systems.
   */
  public static async integrate(
    scene: THREE.Group,
    config: Partial<GLBIntegrationConfig> = {}
  ): Promise<GLBIntegrationResult> {
    const cfg = { ...DEFAULT_CONFIG, ...config };
    const result: GLBIntegrationResult = {
      paintApplied: 0,
      glassApplied: 0,
      lightingApplied: 0,
      detailsAdded: false,
      panelGapsAdded: false,
      environmentAdded: false,
    };

    // Phase 1: Classify all meshes (synchronous, fast)
    const classification = this.classifyMeshes(scene);

    // Phase 2: Apply multi-layer paint to body panels (lazy load)
    if (cfg.paintPreset) {
      const paintMod = await loadPaintSystem();
      if (paintMod.PAINT_PRESETS[cfg.paintPreset]) {
        const paintConfig = paintMod.PAINT_PRESETS[cfg.paintPreset];
        result.paintApplied = this.applyPaint(scene, paintConfig, classification.bodyMeshes, paintMod.MultiLayerPaintSystem);
      }
    }

    // Phase 3: Apply glass materials (lazy load)
    if (cfg.applyGlass) {
      const glassMod = await loadGlassSystem();
      result.glassApplied = this.applyGlass(scene, classification.glassMeshes, glassMod.GlassRefractionSystem, glassMod.GLASS_TYPES);
    }

    // Phase 4: Apply lighting materials (lazy load)
    if (cfg.applyLighting) {
      const lightMod = await loadLightingSystem();
      result.lightingApplied = this.applyLighting(scene, classification.lightMeshes, lightMod.LightingOpticsSystem);
    }

    // Phase 5: Add wheel assemblies if no wheel meshes found (lazy load)
    if (cfg.applyWheels && classification.wheelMeshes.length === 0) {
      const wheelMod = await loadWheelSystem();
      this.addWheelAssemblies(scene, cfg, wheelMod.WheelTireDetailSystem);
    }

    // Phase 6: Add exterior details if not present (lazy load)
    if (cfg.applyDetails) {
      const detailMod = await loadDetailSystem();
      this.addExteriorDetails(scene, detailMod.ExteriorDetailGenerator);
      result.detailsAdded = true;
    }

    // Phase 7: Add body panel gaps (lazy load)
    if (cfg.applyPanelGaps) {
      const gapMod = await loadGapSystem();
      gapMod.BodyPanelGapSystem.applyToScene(scene, cfg.wheelBase, cfg.trackWidth);
      result.panelGapsAdded = true;
    }

    // Phase 8: Add environment (lazy load)
    if (cfg.applyEnvironment) {
      const envMod = await loadEnvSystem();
      this.addEnvironment(scene, envMod.EnvironmentReflectionSystem);
      result.environmentAdded = true;
    }

    return result;
  }

  /**
   * Classify all meshes in the scene by their likely role.
   */
  private static classifyMeshes(scene: THREE.Group): MeshClassification {
    const bodyMeshes: THREE.Mesh[] = [];
    const glassMeshes: THREE.Mesh[] = [];
    const wheelMeshes: THREE.Mesh[] = [];
    const lightMeshes: THREE.Mesh[] = [];
    const otherMeshes: THREE.Mesh[] = [];

    scene.traverse((child) => {
      if (!(child as THREE.Mesh).isMesh) return;
      const mesh = child as THREE.Mesh;
      const name = mesh.name.toLowerCase();
      const parentName = mesh.parent?.name?.toLowerCase() || "";

      // Check exclusions first (suspension, engine, etc.)
      if (EXCLUDE_KEYWORDS.some((k) => name.includes(k) || parentName.includes(k))) {
        otherMeshes.push(mesh);
        return;
      }

      // Classify by name keywords
      if (BODY_KEYWORDS.some((k) => name.includes(k))) {
        bodyMeshes.push(mesh);
      } else if (GLASS_KEYWORDS.some((k) => name.includes(k))) {
        glassMeshes.push(mesh);
      } else if (LIGHT_KEYWORDS.some((k) => name.includes(k))) {
        lightMeshes.push(mesh);
      } else if (WHEEL_KEYWORDS.some((k) => name.includes(k))) {
        wheelMeshes.push(mesh);
      } else {
        // Heuristic: large flat-ish meshes are likely body panels
        const geo = mesh.geometry;
        if (geo) {
          const bbox = new THREE.Box3().setFromObject(mesh);
          const size = new THREE.Vector3();
          bbox.getSize(size);
          const maxDim = Math.max(size.x, size.y, size.z);
          if (maxDim > 0.3 && size.y < maxDim * 0.5) {
            // Wide and flat → likely a body panel
            bodyMeshes.push(mesh);
          } else {
            otherMeshes.push(mesh);
          }
        } else {
          otherMeshes.push(mesh);
        }
      }
    });

    return { bodyMeshes, glassMeshes, wheelMeshes, lightMeshes, otherMeshes };
  }

  /**
   * Apply multi-layer paint materials to classified body meshes.
   */
  private static applyPaint(
    scene: THREE.Group,
    paintConfig: any,
    bodyMeshes: THREE.Mesh[],
    PaintSystem: any
  ): number {
    if (bodyMeshes.length === 0) return 0;
    const paintMat = PaintSystem.createPaintMaterial(paintConfig);
    let count = 0;
    for (const mesh of bodyMeshes) {
      const existingMap = (mesh.material as THREE.MeshStandardMaterial)?.map;
      mesh.material = paintMat.clone();
      if (existingMap) (mesh.material as THREE.MeshPhysicalMaterial).map = existingMap;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      count++;
    }
    return count;
  }

  /**
   * Apply glass materials to classified glass meshes.
   */
  private static applyGlass(
    scene: THREE.Group,
    glassMeshes: THREE.Mesh[],
    GlassSystem: any,
    glassTypes: Record<string, any>
  ): number {
    if (glassMeshes.length === 0) return 0;

    const defaultGlass = GlassSystem.createGlassMaterial(glassTypes.windshield);

    let count = 0;
    for (const mesh of glassMeshes) {
      const name = mesh.name.toLowerCase();
      let glassMat: THREE.MeshPhysicalMaterial;

      if (name.includes("headlight") && name.includes("lens")) {
        glassMat = GlassSystem.createGlassMaterial(glassTypes.headlightLens || defaultGlass);
      } else if (name.includes("taillight") && name.includes("lens")) {
        glassMat = GlassSystem.createGlassMaterial(glassTypes.taillightLens || defaultGlass);
      } else if (name.includes("windshield") || name.includes("windscreen")) {
        glassMat = GlassSystem.createGlassMaterial(glassTypes.windshield || defaultGlass);
      } else if (name.includes("rear") && (name.includes("glass") || name.includes("window"))) {
        glassMat = GlassSystem.createGlassMaterial(glassTypes.privacyRear || defaultGlass);
      } else if (name.includes("mirror") && name.includes("glass")) {
        glassMat = GlassSystem.createGlassMaterial(glassTypes.mirrorGlass || defaultGlass);
      } else {
        glassMat = GlassSystem.createGlassMaterial(glassTypes.sideWindow || defaultGlass);
      }

      mesh.material = glassMat;
      count++;
    }
    return count;
  }

  /**
   * Apply lighting materials to classified light meshes.
   */
  private static applyLighting(
    scene: THREE.Group,
    lightMeshes: THREE.Mesh[],
    LightSystem: any
  ): number {
    if (lightMeshes.length === 0) return 0;

    let count = 0;
    for (const mesh of lightMeshes) {
      const name = mesh.name.toLowerCase();

      if (name.includes("drl") || name.includes("daytime")) {
        mesh.material = LightSystem.createDRLMaterial();
      } else if (name.includes("brake")) {
        mesh.material = LightSystem.createBrakeLightMaterial();
      } else if (name.includes("turn") || name.includes("signal")) {
        mesh.material = LightSystem.createTurnSignalMaterial();
      } else if (name.includes("fog")) {
        mesh.material = LightSystem.createFogLightMaterial();
      } else if (name.includes("reverse")) {
        mesh.material = LightSystem.createReverseLightMaterial();
      } else if (name.includes("headlight") || name.includes("led")) {
        mesh.material = LightSystem.createHeadlightMaterial(6000);
      } else if (name.includes("taillight") || name.includes("lightbar")) {
        mesh.material = LightSystem.createTaillightMaterial();
      } else if (name.includes("light") && name.includes("reflect")) {
        mesh.material = LightSystem.createReflectiveHousingMaterial();
      } else if (name.includes("light") && name.includes("lens")) {
        mesh.material = LightSystem.createProjectorLensMaterial();
      } else {
        mesh.material = LightSystem.createDRLMaterial();
      }
      count++;
    }
    return count;
  }

  /**
   * Add detailed wheel assemblies at detected wheel positions.
   */
  private static addWheelAssemblies(
    scene: THREE.Group,
    config: GLBIntegrationConfig,
    WheelSystem: any
  ): void {
    // Try to detect wheel positions from existing wheel-like meshes
    const wheelPositions: Array<{ x: number; y: number; z: number; side: number }> = [];
    scene.traverse((child) => {
      if (!(child as THREE.Mesh).isMesh) return;
      const mesh = child as THREE.Mesh;
      const name = mesh.name.toLowerCase();
      if (name.includes("hub") || name.includes("axle") || name.includes("strut")) {
        const pos = new THREE.Vector3();
        mesh.getWorldPosition(pos);
        wheelPositions.push({ x: pos.x, y: pos.y, z: pos.z, side: pos.z > 0 ? 1 : -1 });
      }
    });

    // Fallback to standard wheel positions if none detected
    const positions = wheelPositions.length >= 4 ? wheelPositions : [
      { x: config.wheelBase * 0.37, y: 0.18, z: config.trackWidth / 2, side: 1 },
      { x: config.wheelBase * 0.37, y: 0.18, z: -config.trackWidth / 2, side: -1 },
      { x: -config.wheelBase * 0.37, y: 0.18, z: config.trackWidth / 2, side: 1 },
      { x: -config.wheelBase * 0.37, y: 0.18, z: -config.trackWidth / 2, side: -1 },
    ];

    const wheelConfig = {
      rimDiameterInch: 20,
      tireWidthMm: 245,
      aspectRatio: 35,
      rimStyle: "split_5" as const,
      rimFinish: "gloss_black" as const,
      tireCompound: "street" as const,
      caliperPistons: 6,
      rotorDiameterMm: 380,
      rotorType: "carbon_ceramic" as const,
      hasCenterLock: false,
      brakeDuctFins: false,
      beadlockRing: false,
      tireSidewall: "standard" as const,
      wheelWeight: 9.5,
      offset: 35,
    };

    for (const pos of positions.slice(0, 4)) {
      const assembly = WheelSystem.buildWheelAssembly(wheelConfig);
      assembly.position.set(pos.x, pos.y, pos.z);
      if (pos.side < 0) assembly.rotation.y = Math.PI;
      assembly.name = `WheelAssembly_${pos.side > 0 ? "FL" : "FR"}`;
      scene.add(assembly);
    }
  }

  /**
   * Add exterior details if not already present.
   */
  private static addExteriorDetails(scene: THREE.Group, DetailGenerator: any): void {
    // Check if details already exist
    let hasDetails = false;
    scene.traverse((child) => {
      if (child.name === "ExteriorDetails") hasDetails = true;
    });
    if (hasDetails) return;

    const detailConfig = {
      doorHandleStyle: "flush_pop" as const,
      badgeStyle: "3d_emblem" as const,
      antennaType: "shark_fin" as const,
      wiperStyle: "aero" as const,
      fuelCapStyle: "flush" as const,
      exhaustTipStyle: "quad_round" as const,
      mirrorType: "standard" as const,
      garnishFinish: "gloss_black" as const,
      hasHoodVents: true,
      hasSideVents: true,
      hasDiffuser: true,
      hasSpoiler: true,
      hasRoofRails: false,
      hasTowHookCover: true,
      splitterStyle: "lip" as const,
    };

    const details = DetailGenerator.buildAllDetails(detailConfig);
    scene.add(details);
  }

  /**
   * Add environment (ground plane, contact shadows, studio lighting).
   */
  private static addEnvironment(scene: THREE.Group, EnvSystem: any): void {
    // Check if environment already exists
    let hasGround = false;
    let hasShadow = false;
    scene.traverse((child) => {
      if (child.name === "GroundPlane") hasGround = true;
      if (child.name === "ContactShadow") hasShadow = true;
    });

    if (!hasGround) {
      const ground = EnvSystem.createGroundPlane({
        type: "studio_floor", reflectivity: 0.5, color: 0x1a1208, roughness: 0.15,
      });
      scene.add(ground);
    }

    if (!hasShadow) {
      const shadow = EnvSystem.createContactShadowPlane();
      scene.add(shadow);
    }
  }
}

// --- RESULT TYPE ---
export interface GLBIntegrationResult {
  paintApplied: number;
  glassApplied: number;
  lightingApplied: number;
  detailsAdded: boolean;
  panelGapsAdded: boolean;
  environmentAdded: boolean;
}

// --- INTERNAL CLASSIFICATION ---
interface MeshClassification {
  bodyMeshes: THREE.Mesh[];
  glassMeshes: THREE.Mesh[];
  wheelMeshes: THREE.Mesh[];
  lightMeshes: THREE.Mesh[];
  otherMeshes: THREE.Mesh[];
}
