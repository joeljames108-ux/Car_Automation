/**
 * ============================================================================
 * STANDALONE EXPANDED EXTERIOR VEHICLE GLB ASSET GENERATOR
 * ============================================================================
 * Node.js CLI & programmatic asset exporter for next-gen exterior vehicle models:
 * 1. `vehicle_hypercar_apex_gt3.glb` - Active DRS Track Hypercar
 * 2. `vehicle_lemans_prototype.glb` - WEC Le Mans Hypercar with Shark Fin & Venturi
 * 3. `vehicle_grand_tourer_coupe.glb` - Muscular High-Speed Fastback GT
 * 4. `vehicle_time_attack_widebody.glb` - Aerodynamic Hillclimb with Flared Turbofans
 * ============================================================================
 */

import * as THREE from "three";
import * as fs from "fs";
import * as path from "path";
import { HyperFidelityExteriorBodyTopologyCad } from "../../exterior3d/geometry/hyperFidelityExteriorBodyTopologyCad";
import { ActiveMorphingAeroCadEngine } from "../../exterior3d/aerodynamics/activeMorphingAeroCadEngine";
import { HyperFidelityOpticalLightingGlbGenerator } from "../../exterior3d/generators/hyperFidelityOpticalLightingGlbGenerator";
import { ForgedAeroWheelBrakeTireCadGenerator } from "../../exterior3d/generators/forgedAeroWheelBrakeTireCadGenerator";
import { SmartGlassAeroCoatingsSystem } from "../../exterior3d/materials/smartGlassAeroCoatingsSystem";
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

export type MasterExteriorVehicleTypology =
  | "hypercar_apex_gt3"
  | "lemans_prototype"
  | "grand_tourer_coupe"
  | "time_attack_widebody";

export class GenerateExpandedExteriorGlbAssets {
  /**
   * Builds the complete 3D scene graph for the specified vehicle configuration.
   */
  public static buildSceneGraph(
    typology: MasterExteriorVehicleTypology
  ): THREE.Scene {
    const scene = new THREE.Scene();
    scene.name = `MasterVehicleScene_${typology}`;

    let bodyStyle: "hypercar_apex_prototype" | "lemans_hypercar_wec" | "grand_tourer_fastback" | "time_attack_widebody" = "hypercar_apex_prototype";
    let paintHex = 0x00f0ff;
    let wingAngle = 12;
    let wheelFinish: "satin_titanium" | "gloss_carbon_twill" | "champagne_gold" | "stealth_black" = "satin_titanium";
    let wheelStyle: "forged_turbofan_aero" | "split_10_spoke_monoblock" | "gt3_centerlock" = "split_10_spoke_monoblock";

    switch (typology) {
      case "hypercar_apex_gt3":
        bodyStyle = "hypercar_apex_prototype";
        paintHex = 0x00f0ff;
        wingAngle = 16;
        wheelStyle = "gt3_centerlock";
        break;
      case "lemans_prototype":
        bodyStyle = "lemans_hypercar_wec";
        paintHex = 0xe63946;
        wingAngle = 24;
        wheelStyle = "forged_turbofan_aero";
        wheelFinish = "gloss_carbon_twill";
        break;
      case "grand_tourer_coupe":
        bodyStyle = "grand_tourer_fastback";
        paintHex = 0x1d3557;
        wingAngle = 6;
        wheelStyle = "split_10_spoke_monoblock";
        wheelFinish = "champagne_gold";
        break;
      case "time_attack_widebody":
        bodyStyle = "time_attack_widebody";
        paintHex = 0xffb703;
        wingAngle = 32;
        wheelStyle = "forged_turbofan_aero";
        wheelFinish = "stealth_black";
        break;
    }

    // 1. Sculpted Class-A Body Shell
    const body = HyperFidelityExteriorBodyTopologyCad.buildExteriorBodySubassembly({
      typologyStyle: bodyStyle,
      primaryPaintColorHex: paintHex,
      hasDtmFenderLouvers: true,
      hasRoofSnorkel: bodyStyle !== "grand_tourer_fastback",
      hasSharkFinStabilizer: bodyStyle === "lemans_hypercar_wec",
    });
    scene.add(body);

    // 2. Active Aerodynamics
    const aero = ActiveMorphingAeroCadEngine.buildActiveAeroAssembly({
      wingAngleDeg: wingAngle,
      hasCanardArray: true,
      hasRearDiffuserVanes: true,
    });
    scene.add(aero);

    // 3. Optical Lighting Clusters
    const lighting = HyperFidelityOpticalLightingGlbGenerator.buildOpticalLightingGroup({
      hasLaserHighBeam: true,
      hasSequentialOledTaillights: true,
    });
    scene.add(lighting);

    // 4. Forged Rolling Gear
    const wheels = ForgedAeroWheelBrakeTireCadGenerator.buildFullVehicleRollingGearGroup(2.75, 1.72, {
      wheelStyle,
      finish: wheelFinish,
      caliperColorHex: 0xd90429,
    });
    scene.add(wheels);

    // 5. Photovoltaic Solar Roof
    const smartGlass = SmartGlassAeroCoatingsSystem.getInstance();
    const solarRoof = smartGlass.createPhotovoltaicSolarRoofMesh(1.15, 1.42);
    scene.add(solarRoof);

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
   * Exports all 4 expanded exterior vehicle models to the public models directory.
   */
  public static async exportAllExpandedExteriorGlbs(outputDir: string): Promise<void> {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const typologies: MasterExteriorVehicleTypology[] = [
      "hypercar_apex_gt3",
      "lemans_prototype",
      "grand_tourer_coupe",
      "time_attack_widebody",
    ];

    for (const typo of typologies) {
      console.log(`[Exterior GLB Exporter] Generating 3D Vehicle Scene for: ${typo}...`);
      const scene = this.buildSceneGraph(typo);
      const buffer = await this.exportGlbBufferAsync(scene);
      const filePath = path.join(outputDir, `vehicle_${typo}.glb`);
      fs.writeFileSync(filePath, Buffer.from(buffer));
      console.log(`[Exterior GLB Exporter] Successfully saved: ${filePath} (${(buffer.byteLength / 1024).toFixed(1)} KB)`);
    }

    console.log("[Exterior GLB Exporter] All expanded exterior vehicle GLBs generated successfully!");
  }
}

// CLI Execution Entry Point
if (typeof process !== "undefined" && process.argv && process.argv[1]?.toLowerCase().includes("generateexpandedexteriorglbassets")) {
  const targetDir = path.resolve(process.cwd(), "public/models/exterior");
  GenerateExpandedExteriorGlbAssets.exportAllExpandedExteriorGlbs(targetDir)
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("[Exterior GLB Exporter Error]", err);
      process.exit(1);
    });
}
