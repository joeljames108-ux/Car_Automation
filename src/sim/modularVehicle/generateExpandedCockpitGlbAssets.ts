/**
 * ============================================================================
 * STANDALONE EXPANDED COCKPIT GLB ASSET GENERATOR
 * ============================================================================
 * Node.js CLI & programmatic asset exporter for next-gen automotive cockpits:
 * 1. `cockpit_hypercar_halo.glb` - Formula 1 / Le Mans Hypercar with Titanium Halo
 * 2. `cockpit_executive_theater.glb` - VIP Lounge with 31.3" 8K Theater Screen & Partition
 * 3. `cockpit_bespoke_atelier.glb` - Rolls-Royce / Bentley inspired coachbuilt salon
 * ============================================================================
 */

import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import * as fs from "fs";
import * as path from "path";
import { HypercarAeroCockpitGlbGenerator } from "../../exterior3d/generators/interior/hypercarAeroCockpitGlbGenerator";
import { ExecutiveRearLoungeGlbGenerator } from "../../exterior3d/generators/interior/executiveRearLoungeGlbGenerator";
import { DashboardModularGlbGenerator } from "../../exterior3d/generators/interior/dashboardModularGlbGenerator";
import { SeatModularGlbGenerator } from "../../exterior3d/generators/interior/seatModularGlbGenerator";
import { SteeringModularGlbGenerator } from "../../exterior3d/generators/interior/steeringModularGlbGenerator";
import { CenterConsoleModularGlbGenerator } from "../../exterior3d/generators/interior/centerConsoleModularGlbGenerator";
import { DoorCardModularGlbGenerator } from "../../exterior3d/generators/interior/doorCardModularGlbGenerator";
import { CabinEnvironmentModularGlbGenerator } from "../../exterior3d/generators/interior/cabinEnvironmentModularGlbGenerator";
import { EnduranceGt3CockpitGlbGenerator } from "../../exterior3d/generators/interior/enduranceGt3CockpitGlbGenerator";
import { CoachbuiltVipLoungeBarGlbGenerator } from "../../exterior3d/generators/interior/coachbuiltVipLoungeBarGlbGenerator";
import { QuantumDotCockpitBladeGlbGenerator } from "../../exterior3d/generators/interior/quantumDotCockpitBladeGlbGenerator";
import { InteriorBakedLightingEngine } from "../../exterior3d/lighting/interiorBakedLightingEngine";
import { UniversalGlbExporter } from "../../exterior3d/export/universalGlbExporter";

// Polyfill Node.js FileReader for Three.js GLTFExporter binary writer
class NodeFileReader {
  result: ArrayBuffer | null = null;
  onload: (() => void) | null = null;
  onloadend: (() => void) | null = null;
  async readAsArrayBuffer(blob: any) {
    if (blob && typeof blob.arrayBuffer === "function") {
      this.result = await blob.arrayBuffer();
    } else {
      this.result = new ArrayBuffer(0);
    }
    if (this.onload) this.onload();
    if (this.onloadend) this.onloadend();
  }
}
// @ts-ignore
globalThis.FileReader = NodeFileReader;

export type ExpandedCockpitType =
  | "hypercar_halo"
  | "executive_theater"
  | "bespoke_atelier"
  | "endurance_gt3"
  | "coachbuilt_vip_salon"
  | "quantum_hyperblade";

export class GenerateExpandedCockpitGlbAssets {
  /**
   * Builds the complete 3D scene graph for the specified cockpit configuration.
   */
  public static buildSceneGraph(
    typology: ExpandedCockpitType
  ): THREE.Scene {
    const scene = new THREE.Scene();
    scene.name = `CockpitScene_${typology}`;

    const lightingEngine = InteriorBakedLightingEngine.getInstance();

    switch (typology) {
      case "hypercar_halo": {
        const aeroCockpit = HypercarAeroCockpitGlbGenerator.buildHypercarCockpitGroup({
          haloEnabled: true,
          haloMaterial: "raw_titanium",
          primaryCarbonType: "3k_twill_carbon_fiber",
          hasRoofSnorkel: true,
          hasFireSuppressionSystem: true,
        });
        scene.add(aeroCockpit);

        const steeringYoke = SteeringModularGlbGenerator.buildSteeringGroup({
          typology: "formula_gt3_carbon_yoke",
          rimMaterial: "perforated_alcantara",
          spokeMaterial: "3k_twill_carbon_fiber",
          hasManettinoDial: true,
        });
        steeringYoke.position.set(0, 0.58, -0.22);
        scene.add(steeringYoke);
        break;
      }

      case "executive_theater": {
        const lounge = ExecutiveRearLoungeGlbGenerator.buildExecutiveLoungeGroup({
          primaryMaterial: "semi_aniline_leather",
          woodTrimMaterial: "open_pore_walnut",
          theaterScreenDeployed: true,
          privacyPartitionClosed: true,
        });
        scene.add(lounge);

        const doors = DoorCardModularGlbGenerator.buildDoorCardAssemblies({
          primaryMaterial: "semi_aniline_leather",
          secondaryMaterial: "perforated_alcantara",
          trimAccentMaterial: "open_pore_walnut",
        });
        scene.add(doors);
        break;
      }

      case "bespoke_atelier": {
        const dash = DashboardModularGlbGenerator.buildDashboardGroup({
          typology: "pillar_to_pillar_hyperscreen_blade",
          primaryMaterial: "semi_aniline_leather",
          secondaryMaterial: "semi_aniline_leather",
          trimAccentMaterial: "open_pore_walnut",
          hudEnabled: true,
        });
        scene.add(dash);

        const seats = SeatModularGlbGenerator.buildSeatingGroup({
          frontSeatType: "executive_22way_massage_ottoman",
          primaryMaterial: "semi_aniline_leather",
          secondaryMaterial: "semi_aniline_leather",
          hasHeadrestSpeakers: true,
        });
        scene.add(seats);

        const console = CenterConsoleModularGlbGenerator.buildCenterConsoleGroup({
          typology: "crystal_glass_monostable_rotary",
          primaryMaterial: "semi_aniline_leather",
          trimAccentMaterial: "open_pore_walnut",
        });
        scene.add(console);

        const env = CabinEnvironmentModularGlbGenerator.buildCabinEnvironmentGroup({
          headlinerMaterial: "perforated_alcantara",
          carpetMaterial: "soft_touch_polyurethane",
          hasStarlightHeadliner: true,
        });
        scene.add(env);
        break;
      }

      case "endurance_gt3": {
        const gt3 = EnduranceGt3CockpitGlbGenerator.buildEnduranceGt3CockpitGroup({
          rollcageColorHex: "#e63946",
          hasWindowSafetyNets: true,
          hasHelmetCoolingDuct: true,
          hasSmartOledMirror: true,
        });
        scene.add(gt3);
        break;
      }

      case "coachbuilt_vip_salon": {
        const salon = CoachbuiltVipLoungeBarGlbGenerator.buildCoachbuiltVipLoungeGroup({
          primaryLeather: "semi_aniline_leather",
          woodVeneerType: "open_pore_walnut",
          barCabinetDeployed: true,
          deskTableDeployed: true,
          hasTourbillonClock: true,
          hasUmbrellaDispenser: true,
        });
        scene.add(salon);
        break;
      }

      case "quantum_hyperblade": {
        const blade = QuantumDotCockpitBladeGlbGenerator.buildQuantumDotBladeGroup({
          bladeWidthM: 1.42,
          hasArHudProjector: true,
          hasDriverMonitoringSystem: true,
          hasPassengerDisplay: true,
        });
        scene.add(blade);
        break;
      }
    }

    return scene;
  }

  /**
   * Asynchronously exports a GLB ArrayBuffer.
   */
  public static async exportGlbBufferAsync(scene: THREE.Scene): Promise<ArrayBuffer> {
    const result = await UniversalGlbExporter.exportVehicleToGlb(scene, {
      binary: true,
      embedTextures: false,
    });
    return result.buffer;
  }

  /**
   * Exports all 3 expanded cockpit models to the public models directory.
   */
  public static async exportAllExpandedCockpitGlbs(outputDir: string): Promise<void> {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const typologies: ExpandedCockpitType[] = [
      "hypercar_halo",
      "executive_theater",
      "bespoke_atelier",
      "endurance_gt3",
      "coachbuilt_vip_salon",
      "quantum_hyperblade",
    ];

    for (const typo of typologies) {
      console.log(`[Expanded GLB Exporter] Generating 3D Scene for: ${typo}...`);
      const scene = this.buildSceneGraph(typo);
      const buffer = await this.exportGlbBufferAsync(scene);
      const filePath = path.join(outputDir, `cockpit_${typo}.glb`);
      fs.writeFileSync(filePath, Buffer.from(buffer));
      console.log(`[Expanded GLB Exporter] Successfully saved: ${filePath} (${(buffer.byteLength / 1024).toFixed(1)} KB)`);
    }

    console.log("[Expanded GLB Exporter] All expanded cockpit GLBs generated successfully!");
  }
}

// CLI Execution Entry Point
if (typeof process !== "undefined" && process.argv && process.argv[1]?.toLowerCase().includes("generateexpandedcockpitglbassets")) {
  const targetDir = path.resolve(process.cwd(), "public/models/interior");
  GenerateExpandedCockpitGlbAssets.exportAllExpandedCockpitGlbs(targetDir)
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("[Expanded GLB Exporter Error]", err);
      process.exit(1);
    });
}
