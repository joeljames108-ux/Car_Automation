/**
 * ============================================================================
 * PHASE 9 MASTER EXTERIOR 3D BINARY GLB ASSET GENERATOR
 * ============================================================================
 * Programmatically constructs and exports 4 flagship Phase 9 hypercar geometries:
 *
 * 1. `vehicle_apex_huayra_active_vector.glb` - 4-Quadrant Active Corner Vectoring Flaps
 * 2. `vehicle_valkyrie_flying_buttress_lmh.glb` - Extreme Undercuts & Flying Buttresses
 * 3. `vehicle_cyber_autonomous_pursuit_gt.glb` - Autonomous LiDAR Pod & Neon Underglow
 * 4. `vehicle_nurburgring_dssv_stance_king.glb` - Pushrod Stance Double Wishbone Beast
 * ============================================================================
 */

import * as THREE from "three";
import * as fs from "fs";
import * as path from "path";
import { CompletePhase9MasterHypercarAssembly, Phase9CompleteVehicleConfig } from "../generators/completePhase9MasterHypercarAssembly";
import { UniversalGlbExporter } from "./universalGlbExporter";

export interface Phase9MasterPresetDef {
  id: string;
  filename: string;
  config: Phase9CompleteVehicleConfig;
}

export const PHASE_9_PRESETS: Phase9MasterPresetDef[] = [
  {
    id: "apex_huayra_active_vector",
    filename: "vehicle_apex_huayra_active_vector.glb",
    config: {
      name: "Apex Huayra Active Vector",
      bodyColorHex: "#00f0ff",
      carbonPattern: "TWILL_2X2_3K",
      sculptedBody: {
        hasSidepodUndercuts: true,
        sidepodUndercutDepthMm: 180,
        hasRoofPeriscopeScoop: true,
        roofScoopHeightMm: 160,
        hasHoodSDuct: true,
        sDuctWidthMm: 420,
        hasFlyingButtresses: true,
        buttressSpanMm: 680,
      },
      activeFlaps: {
        flFlapAngleDeg: 18,
        frFlapAngleDeg: 18,
        rlFlapAngleDeg: 32,
        rrFlapAngleDeg: 32,
        isAirbrakeActive: false,
        isDrsActive: false,
        hasHydraulicPistons: true,
      },
      cooling: {
        radiatorCoreWidthMm: 580,
        radiatorCoreHeightMm: 340,
        intercoolerCoreThicknessMm: 85,
        hasElectricSuctionFans: true,
        fanSpeedRpm: 3200,
        hasAnodizedAnFittings: true,
      },
      suspension: {
        mode: "TRACK_ATTACK_SLAMMED",
        frontRideHeightOffsetMm: -25,
        rearRideHeightOffsetMm: -20,
        frontCamberDeg: -3.2,
        rearCamberDeg: -2.4,
        hasDssvDampers: true,
        hasHeaveSprings: true,
      },
      sensorsAndUnderglow: {
        hasRoofLidarPod: true,
        lidarType: "SOLID_STATE_1550NM",
        hasSurroundVisionCameras: true,
        hasUnderglowLightbars: true,
        underglowColorHex: "#00f0ff",
        underglowIntensity: 2.0,
        underglowMode: "BREATHING_PULSE",
      },
      exhaustTempC: 850,
    },
  },
  {
    id: "valkyrie_flying_buttress_lmh",
    filename: "vehicle_valkyrie_flying_buttress_lmh.glb",
    config: {
      name: "Valkyrie Flying Buttress LMH",
      bodyColorHex: "#10b981",
      carbonPattern: "FORGED_COMPOSITE_CHOPPED",
      sculptedBody: {
        hasSidepodUndercuts: true,
        sidepodUndercutDepthMm: 220,
        hasRoofPeriscopeScoop: true,
        roofScoopHeightMm: 190,
        hasHoodSDuct: true,
        sDuctWidthMm: 460,
        hasFlyingButtresses: true,
        buttressSpanMm: 720,
      },
      activeFlaps: {
        flFlapAngleDeg: 0,
        frFlapAngleDeg: 0,
        rlFlapAngleDeg: 0,
        rrFlapAngleDeg: 0,
        isAirbrakeActive: false,
        isDrsActive: true,
        hasHydraulicPistons: true,
      },
      cooling: {
        radiatorCoreWidthMm: 620,
        radiatorCoreHeightMm: 360,
        intercoolerCoreThicknessMm: 95,
        hasElectricSuctionFans: true,
        fanSpeedRpm: 3400,
        hasAnodizedAnFittings: true,
      },
      suspension: {
        mode: "TRACK_ATTACK_SLAMMED",
        frontRideHeightOffsetMm: -30,
        rearRideHeightOffsetMm: -25,
        frontCamberDeg: -3.5,
        rearCamberDeg: -2.8,
        hasDssvDampers: true,
        hasHeaveSprings: true,
      },
      sensorsAndUnderglow: {
        hasRoofLidarPod: true,
        lidarType: "ROTATING_AEROSPACE_PRISM",
        hasSurroundVisionCameras: true,
        hasUnderglowLightbars: true,
        underglowColorHex: "#10b981",
        underglowIntensity: 2.2,
        underglowMode: "STATIC_SOLID",
      },
      exhaustTempC: 920,
    },
  },
  {
    id: "cyber_autonomous_pursuit_gt",
    filename: "vehicle_cyber_autonomous_pursuit_gt.glb",
    config: {
      name: "Cyber Autonomous Pursuit GT",
      bodyColorHex: "#f59e0b",
      carbonPattern: "SPREAD_TOW_BIAXIAL",
      sculptedBody: {
        hasSidepodUndercuts: true,
        sidepodUndercutDepthMm: 160,
        hasRoofPeriscopeScoop: false,
        roofScoopHeightMm: 0,
        hasHoodSDuct: true,
        sDuctWidthMm: 380,
        hasFlyingButtresses: true,
        buttressSpanMm: 640,
      },
      activeFlaps: {
        flFlapAngleDeg: 10,
        frFlapAngleDeg: 25,
        rlFlapAngleDeg: 15,
        rrFlapAngleDeg: 40,
        isAirbrakeActive: false,
        isDrsActive: false,
        hasHydraulicPistons: true,
      },
      cooling: {
        radiatorCoreWidthMm: 540,
        radiatorCoreHeightMm: 320,
        intercoolerCoreThicknessMm: 80,
        hasElectricSuctionFans: true,
        fanSpeedRpm: 2900,
        hasAnodizedAnFittings: true,
      },
      suspension: {
        mode: "SPORT_STREET",
        frontRideHeightOffsetMm: 0,
        rearRideHeightOffsetMm: 0,
        frontCamberDeg: -2.0,
        rearCamberDeg: -1.5,
        hasDssvDampers: true,
        hasHeaveSprings: true,
      },
      sensorsAndUnderglow: {
        hasRoofLidarPod: true,
        lidarType: "SOLID_STATE_1550NM",
        hasSurroundVisionCameras: true,
        hasUnderglowLightbars: true,
        underglowColorHex: "#f59e0b",
        underglowIntensity: 2.5,
        underglowMode: "SPECTRUM_CHASE",
      },
      exhaustTempC: 740,
    },
  },
  {
    id: "nurburgring_dssv_stance_king",
    filename: "vehicle_nurburgring_dssv_stance_king.glb",
    config: {
      name: "Nurburgring DSSV Stance King",
      bodyColorHex: "#ef4444",
      carbonPattern: "TWILL_2X2_3K",
      sculptedBody: {
        hasSidepodUndercuts: true,
        sidepodUndercutDepthMm: 200,
        hasRoofPeriscopeScoop: true,
        roofScoopHeightMm: 180,
        hasHoodSDuct: true,
        sDuctWidthMm: 450,
        hasFlyingButtresses: true,
        buttressSpanMm: 700,
      },
      activeFlaps: {
        flFlapAngleDeg: 35,
        frFlapAngleDeg: 35,
        rlFlapAngleDeg: 68,
        rrFlapAngleDeg: 68,
        isAirbrakeActive: true,
        isDrsActive: false,
        hasHydraulicPistons: true,
      },
      cooling: {
        radiatorCoreWidthMm: 600,
        radiatorCoreHeightMm: 350,
        intercoolerCoreThicknessMm: 90,
        hasElectricSuctionFans: true,
        fanSpeedRpm: 3500,
        hasAnodizedAnFittings: true,
      },
      suspension: {
        mode: "TRACK_ATTACK_SLAMMED",
        frontRideHeightOffsetMm: -35,
        rearRideHeightOffsetMm: -30,
        frontCamberDeg: -3.5,
        rearCamberDeg: -2.8,
        hasDssvDampers: true,
        hasHeaveSprings: true,
      },
      sensorsAndUnderglow: {
        hasRoofLidarPod: false,
        lidarType: "SOLID_STATE_1550NM",
        hasSurroundVisionCameras: true,
        hasUnderglowLightbars: true,
        underglowColorHex: "#ef4444",
        underglowIntensity: 2.0,
        underglowMode: "STATIC_SOLID",
      },
      exhaustTempC: 950,
    },
  },
];

export class GeneratePhase9ExteriorGlbSuite {
  /**
   * Constructs the full 3D hierarchical scene for a Phase 9 Preset.
   */
  public static buildPresetScene(preset: Phase9MasterPresetDef): THREE.Group {
    return CompletePhase9MasterHypercarAssembly.generateMasterVehicle(preset.config);
  }

  /**
   * Programmatically exports all 4 Phase 9 master hypercars to binary GLB.
   */
  public static async exportAllPhase9Glbs(outputDir?: string): Promise<string[]> {
    const targetDir = outputDir || path.resolve(process.cwd(), "public/models/exterior");
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const exportedPaths: string[] = [];

    for (const preset of PHASE_9_PRESETS) {
      const group = this.buildPresetScene(preset);
      const res = await UniversalGlbExporter.exportVehicleToGlb(group, {
        binary: true,
        vehicleName: preset.config.name,
      });

      const buffer = Buffer.from(res.buffer);
      const outPath = path.join(targetDir, preset.filename);
      fs.writeFileSync(outPath, buffer);
      exportedPaths.push(outPath);
    }

    return exportedPaths;
  }
}
