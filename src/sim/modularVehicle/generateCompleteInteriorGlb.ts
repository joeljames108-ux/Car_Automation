import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import * as fs from "fs";
import * as path from "path";
import { DashboardModularGlbGenerator } from "../../exterior3d/generators/interior/dashboardModularGlbGenerator";
import { SeatModularGlbGenerator } from "../../exterior3d/generators/interior/seatModularGlbGenerator";
import { SteeringModularGlbGenerator } from "../../exterior3d/generators/interior/steeringModularGlbGenerator";
import { CenterConsoleModularGlbGenerator } from "../../exterior3d/generators/interior/centerConsoleModularGlbGenerator";
import { DoorCardModularGlbGenerator } from "../../exterior3d/generators/interior/doorCardModularGlbGenerator";
import { CabinEnvironmentModularGlbGenerator } from "../../exterior3d/generators/interior/cabinEnvironmentModularGlbGenerator";
import {
  InteriorMaterialType,
  DashboardTypology,
  FrontSeatTypology,
  SteeringWheelTypology,
  CenterConsoleTypology,
} from "../interior/masterInteriorTypes";

// Polyfill Node.js FileReader for Three.js GLTFExporter binary writer
class NodeFileReader {
  result: ArrayBuffer | null = null;
  onloadend: (() => void) | null = null;
  async readAsArrayBuffer(blob: Blob) {
    this.result = await blob.arrayBuffer();
    if (this.onloadend) this.onloadend();
  }
}
// @ts-ignore
if (typeof globalThis.FileReader === "undefined") {
  // @ts-ignore
  globalThis.FileReader = NodeFileReader;
}

/**
 * ============================================================================
 * COMPLETE AUTOMOTIVE INTERIOR 3D GLB MASTER GENERATOR & EXPORTER
 * ============================================================================
 * Generates photorealistic glTF 2.0 binary (.glb) models for automotive cockpits:
 * 1. Complete Cockpit Presets:
 *    - Luxury Executive Bespoke (Nappa Leather, Open-Pore Walnut, Starlight Roof)
 *    - Hypercar Carbon Aero (3K Twill & Forged Carbon, Carbon Yoke, Telemetry Screen)
 *    - GT3 Competition Track (FIA Monocoque Buckets, 6-Point Harness, Roll Cage)
 * 2. Standalone Subassembly GLBs:
 *    - `dashboard_blade.glb`, `seat_sport_bucket.glb`, `steering_wheel_yoke.glb`,
 *      `center_console_bridge.glb`, `door_cards_acoustic.glb`
 * ============================================================================
 */

export type InteriorCockpitGlbPreset = "luxury_executive" | "hypercar_carbon" | "gt3_competition";

export class CompleteInteriorGlbMasterGenerator {
  /**
   * Builds the complete 3D interior cabin scene graph for the specified preset.
   */
  public static buildInteriorScene(
    preset: InteriorCockpitGlbPreset = "luxury_executive",
    explodedFactor: number = 0.0
  ): THREE.Scene {
    const scene = new THREE.Scene();
    scene.name = `MasterInteriorCockpit_${preset}`;

    // Preset configurations
    let dashPrimary: InteriorMaterialType = "nappa_leather";
    let dashTrim: InteriorMaterialType = "open_pore_walnut";
    let seatType: FrontSeatTypology = "executive_22way_massage_ottoman";
    let steeringType: SteeringWheelTypology = "executive_two_spoke_heated";
    let consoleType: CenterConsoleTypology = "crystal_glass_monostable_rotary";
    let consoleTrim: InteriorMaterialType = "open_pore_walnut";
    let dashTypology: DashboardTypology = "executive_dual_tier_leather";
    let ambHex = "#00f0ff";
    let isHyperscreen = false;

    if (preset === "hypercar_carbon") {
      dashPrimary = "perforated_alcantara";
      dashTrim = "forged_carbon_composite";
      dashTypology = "pillar_to_pillar_hyperscreen_blade";
      seatType = "sport_14way_adaptive_bolster";
      steeringType = "formula_gt3_carbon_yoke";
      consoleType = "fighter_jet_start_flap_matrix";
      consoleTrim = "forged_carbon_composite";
      ambHex = "#ffaa00";
      isHyperscreen = true;
    } else if (preset === "gt3_competition") {
      dashPrimary = "perforated_alcantara";
      dashTrim = "3k_twill_carbon_fiber";
      dashTypology = "gt3_competition_dry_carbon";
      seatType = "carbon_monocoque_fixed_bucket";
      steeringType = "formula_gt3_carbon_yoke";
      consoleType = "track_competition_fire_suppression";
      consoleTrim = "3k_twill_carbon_fiber";
      ambHex = "#00ff66";
      isHyperscreen = false;
    }

    // 1. Dashboard Subassembly
    const dashboard = DashboardModularGlbGenerator.buildDashboardGroup({
      typology: dashTypology,
      primaryMaterial: dashPrimary,
      secondaryMaterial: dashPrimary,
      trimAccentMaterial: dashTrim,
      ambientLightColorHex: ambHex,
      hyperscreenEnabled: isHyperscreen,
      hudEnabled: true,
    });
    dashboard.position.set(0, 0, -explodedFactor * 0.4);
    scene.add(dashboard);

    // 2. Seating Subassembly
    const seating = SeatModularGlbGenerator.buildSeatingGroup({
      frontSeatType: seatType,
      primaryMaterial: dashPrimary,
      secondaryMaterial: dashPrimary,
      harnessType: preset === "gt3_competition" ? "6_point_fia_race" : "none",
      seatCount: preset === "gt3_competition" ? 2 : 4,
    });
    seating.position.set(0, 0, explodedFactor * 0.2);
    scene.add(seating);

    // 3. Steering Wheel & Column Subassembly
    const steering = SteeringModularGlbGenerator.buildSteeringGroup({
      typology: steeringType,
      rimMaterial: dashPrimary,
      spokeMaterial: dashTrim,
      accentColorHex: ambHex,
      hasTelemetryDisplay: isHyperscreen || preset === "hypercar_carbon",
      hasMagneticPaddles: true,
      hasManettinoDial: true,
    });
    steering.position.set(-0.46, 0.65, -0.32 - explodedFactor * 0.3);
    scene.add(steering);

    // 4. Center Console & Bridge Subassembly
    const consoleGroup = CenterConsoleModularGlbGenerator.buildCenterConsoleGroup({
      typology: consoleType,
      primaryMaterial: dashPrimary,
      trimAccentMaterial: consoleTrim,
      ambientLightColorHex: ambHex,
      hasCrystalShifter: preset === "luxury_executive",
      hasWirelessCharger: true,
      hasCupHolderHalos: true,
      hasRearTouchscreen: preset === "luxury_executive",
    });
    consoleGroup.position.set(0, 0, explodedFactor * 0.1);
    scene.add(consoleGroup);

    // 5. Acoustic Door Cards Subassemblies (Left & Right)
    const doorCards = DoorCardModularGlbGenerator.buildDoorCardAssemblies({
      primaryMaterial: dashPrimary,
      secondaryMaterial: dashPrimary,
      trimAccentMaterial: dashTrim,
      ambientLightColorHex: ambHex,
      hasSeatMemoryButtons: true,
      hasPuddleLamps: true,
    });
    // Explode doors outwards laterally
    if (explodedFactor > 0) {
      doorCards.children.forEach((door) => {
        if (door.name === "DoorCard_Left") door.position.x -= explodedFactor * 0.6;
        if (door.name === "DoorCard_Right") door.position.x += explodedFactor * 0.6;
      });
    }
    scene.add(doorCards);

    // 6. Cabin Environment, Headliner & Floor Subassembly
    const cabinEnv = CabinEnvironmentModularGlbGenerator.buildCabinEnvironmentGroup({
      headlinerMaterial: "perforated_alcantara",
      carpetMaterial: "perforated_alcantara",
      ambientLightColorHex: ambHex,
      hasStarlightHeadliner: preset === "luxury_executive",
      hasPanoramicRoof: preset !== "gt3_competition",
      hasSportPedals: true,
    });
    if (explodedFactor > 0) {
      cabinEnv.children.forEach((c: THREE.Object3D) => {
        if (c.name === "Cabin_OverheadHeadliner") c.position.y += explodedFactor * 0.5;
        if (c.name === "Cabin_FloorTub") c.position.y -= explodedFactor * 0.3;
      });
    }
    scene.add(cabinEnv);

    return scene;
  }

  /**
   * Exports a scene to a glTF binary (.glb) ArrayBuffer.
   */
  public static async exportSceneToGlbBufferAsync(scene: THREE.Scene): Promise<ArrayBuffer> {
    const exporter = new GLTFExporter();
    return new Promise((resolve, reject) => {
      exporter.parse(
        scene,
        (gltf) => {
          if (gltf instanceof ArrayBuffer) {
            resolve(gltf);
          } else {
            // Convert JSON object to buffer if necessary
            const jsonStr = JSON.stringify(gltf);
            const buf = Buffer.from(jsonStr).buffer;
            resolve(buf);
          }
        },
        (error) => {
          reject(error);
        },
        { binary: true }
      );
    });
  }

  /**
   * CLI Runner: Writes the 3 master cockpits to disk in public/models/interior/
   */
  public static async generateAndSaveAllGlbsAsync(outputDir: string): Promise<void> {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const presets: InteriorCockpitGlbPreset[] = ["luxury_executive", "hypercar_carbon", "gt3_competition"];

    for (const preset of presets) {
      console.log(`[GLB Exporter] Generating 3D Scene for: ${preset}...`);
      const scene = this.buildInteriorScene(preset, 0.0);
      const buffer = await this.exportSceneToGlbBufferAsync(scene);
      const filePath = path.join(outputDir, `cockpit_${preset}.glb`);
      fs.writeFileSync(filePath, Buffer.from(buffer));
      console.log(`[GLB Exporter] Successfully saved: ${filePath} (${(buffer.byteLength / 1024).toFixed(1)} KB)`);
    }
  }
}

// Auto-run if executed directly via tsx
if (typeof process !== "undefined" && process.argv && process.argv[1]?.includes("generateCompleteInteriorGlb")) {
  const targetDir = path.resolve(process.cwd(), "public/models/interior");
  CompleteInteriorGlbMasterGenerator.generateAndSaveAllGlbsAsync(targetDir)
    .then(() => console.log("[GLB Exporter] All interior GLBs generated successfully!"))
    .catch((err) => console.error("[GLB Exporter] Failed to generate GLBs:", err));
}
