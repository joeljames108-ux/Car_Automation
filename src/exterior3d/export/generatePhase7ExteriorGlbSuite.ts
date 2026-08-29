/**
 * ============================================================================
 * PHASE 7 MASTER EXTERIOR 3D BINARY GLB ASSET GENERATOR
 * ============================================================================
 * Assembles and exports 4 brand-new high-poly exterior binary .glb master assets:
 *
 * 1. `vehicle_apex_hyper_gt_stradale.glb` (Megawatt Twin-Turbo V8 Hybrid Hypercar)
 * 2. `vehicle_wec_le_mans_hypercar_prototype.glb` (FIA WEC LMH 24H Endurance Prototype)
 * 3. `vehicle_formula_supremacy_aero_spec.glb` (Active Ground-Effect Aero Concept)
 * 4. `vehicle_time_attack_carbon_phantom.glb` (Full Exposed Carbon Time Attack Monster)
 * ============================================================================
 */

import * as THREE from "three";
import * as fs from "fs";
import * as path from "path";
import { ParametricWidebodyAeroAerofoilCad } from "../geometry/parametricWidebodyAeroAerofoilCad";
import { ActiveUnderbodyGroundEffectDiffuserCad } from "../aerodynamics/activeUnderbodyGroundEffectDiffuserCad";
import { CarbonCeramicBrakeAeroTurbofanWheelGlbGenerator } from "../generators/carbonCeramicBrakeAeroTurbofanWheelGlbGenerator";
import { MatrixLaserProjectionOpticsGlbGenerator } from "../generators/matrixLaserProjectionOpticsGlbGenerator";
import { AdvancedSpectralMultiLayerPaintShader } from "../materials/advancedSpectralMultiLayerPaintShader";
import { UniversalGlbExporter } from "./universalGlbExporter";

export interface MasterVehiclePresetSpec {
  id: string;
  filename: string;
  name: string;
  baseColorHex: string;
  candyChromaStrength: number;
  metallicFlakeDensity: number;
  clearcoatGloss: number;
  wingAngleDeg: number;
  hasTurbofanCover: boolean;
  caliperColorHex: number;
  isExposedCarbon: boolean;
}

export const PHASE_7_PRESETS: MasterVehiclePresetSpec[] = [
  {
    id: "apex_hyper_gt_stradale",
    filename: "vehicle_apex_hyper_gt_stradale.glb",
    name: "Apex Hyper GT Stradale",
    baseColorHex: "#00e5ff",
    candyChromaStrength: 0.85,
    metallicFlakeDensity: 0.8,
    clearcoatGloss: 0.98,
    wingAngleDeg: 12,
    hasTurbofanCover: true,
    caliperColorHex: 0xe11d48,
    isExposedCarbon: false,
  },
  {
    id: "wec_le_mans_hypercar_prototype",
    filename: "vehicle_wec_le_mans_hypercar_prototype.glb",
    name: "WEC LMH Prototype 24H",
    baseColorHex: "#ffffff",
    candyChromaStrength: 0.2,
    metallicFlakeDensity: 0.4,
    clearcoatGloss: 0.9,
    wingAngleDeg: 28,
    hasTurbofanCover: true,
    caliperColorHex: 0xf59e0b,
    isExposedCarbon: false,
  },
  {
    id: "formula_supremacy_aero_spec",
    filename: "vehicle_formula_supremacy_aero_spec.glb",
    name: "Formula Supremacy Aero Spec",
    baseColorHex: "#10b981",
    candyChromaStrength: 0.9,
    metallicFlakeDensity: 0.85,
    clearcoatGloss: 0.95,
    wingAngleDeg: 38,
    hasTurbofanCover: false,
    caliperColorHex: 0x06b6d4,
    isExposedCarbon: false,
  },
  {
    id: "time_attack_carbon_phantom",
    filename: "vehicle_time_attack_carbon_phantom.glb",
    name: "Time Attack Carbon Phantom",
    baseColorHex: "#111317",
    candyChromaStrength: 0.0,
    metallicFlakeDensity: 0.95,
    clearcoatGloss: 0.65,
    wingAngleDeg: 42,
    hasTurbofanCover: true,
    caliperColorHex: 0x84cc16,
    isExposedCarbon: true,
  },
];

export class GeneratePhase7ExteriorGlbSuite {
  /**
   * Builds the 3D Master Scene Group for a given preset.
   */
  public static buildPresetScene(preset: MasterVehiclePresetSpec): THREE.Group {
    const masterGroup = new THREE.Group();
    masterGroup.name = preset.id.toUpperCase();

    // 1. Spectral Automotive Paint Material
    const paintMaterial = AdvancedSpectralMultiLayerPaintShader.createSpectralPaintMaterial({
      baseColorHex: preset.baseColorHex,
      candyChromaStrength: preset.candyChromaStrength,
      metallicFlakeDensity: preset.metallicFlakeDensity,
      flakeSparkleIntensity: 1.6,
      chameleonShiftAngleDeg: 35,
      secondaryChameleonHex: "#d97706",
      clearcoatGloss: preset.clearcoatGloss,
      orangePeelMicroRoughness: 0.02,
      isCarbonExposed: preset.isExposedCarbon,
    });

    // 2. Monocoque Body
    const bodyGeo = new THREE.BoxGeometry(1.95, 0.48, 4.45);
    const bodyMesh = new THREE.Mesh(bodyGeo, paintMaterial);
    bodyMesh.position.set(0, 0.48, 0);
    bodyMesh.castShadow = true;
    masterGroup.add(bodyMesh);

    // Aerodynamic Cockpit Glass
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x05070a,
      transmission: 0.88,
      roughness: 0.05,
      ior: 1.52,
    });
    const cabinGeo = new THREE.BoxGeometry(1.35, 0.42, 1.85);
    const cabinMesh = new THREE.Mesh(cabinGeo, glassMat);
    cabinMesh.position.set(0, 0.82, -0.15);
    masterGroup.add(cabinMesh);

    // 3. Multi-Element Aerofoil Wing
    const wingMesh = ParametricWidebodyAeroAerofoilCad.generateMultiElementWingMesh({
      mainPlane: {
        profileType: "NACA_6412_SUPERCRITICAL",
        maxCamberPct: 6,
        maxCamberPosTenths: 4,
        thicknessPct: 12,
        chordMm: 420,
        spanMm: 1950,
        geometricTwistDeg: -3.5,
        sweepAngleDeg: 8,
        dihedralAngleDeg: -2,
      },
      secondaryFlap: {
        profileType: "NACA_4412_HIGH_LIFT",
        maxCamberPct: 4,
        maxCamberPosTenths: 4,
        thicknessPct: 10,
        chordMm: 220,
        spanMm: 1900,
        geometricTwistDeg: -2.0,
        sweepAngleDeg: 8,
        dihedralAngleDeg: -2,
      },
      flapOverlapMm: 25,
      flapSlotGapMm: 18,
      flapDeflectionAngleDeg: preset.wingAngleDeg,
      hasGurneyFlap: true,
      gurneyFlapHeightMm: 10,
      pylonMountType: "SWAN_NECK_TOP_MOUNT",
      pylonCount: 2,
      endplateDesign: "GT3_CURVED_CASCADE",
    });
    wingMesh.position.set(0, 0.95, 1.85);
    masterGroup.add(wingMesh);

    // 4. Active Underbody Floor & Diffuser
    const underbodyMesh = ActiveUnderbodyGroundEffectDiffuserCad.generateUnderbodyMesh({
      wheelbaseMm: 2750,
      floorWidthMm: 1950,
      frontThroatHeightMm: 32,
      midTunnelHeightMm: 45,
      rearDiffuserLengthMm: 950,
      diffuserExpansionAngleDeg: 16.5,
      strakeCount: 4,
      hasActiveSealingSkirts: true,
      skirtGroundClearanceMm: 4,
      hasBoundaryLayerBleedGills: true,
    });
    masterGroup.add(underbodyMesh);

    // 5. Matrix Laser Optics
    const lightingMesh = MatrixLaserProjectionOpticsGlbGenerator.generateLightingAssembly({
      headlightTech: "DMD_DIGITAL_MATRIX_LASER",
      drlSignatureStyle: "CRYSTAL_CLAW_TRIPLE",
      taillightTech: "FULL_WIDTH_3D_OLED_RIBBON",
      hasSweepingIndicators: true,
      lightingState: "HIGH_BEAM_LASER",
      primaryEmissiveHex: 0xfbbf24,
      taillightEmissiveHex: 0xff0033,
    });
    masterGroup.add(lightingMesh);

    // 6. Forged Turbofan Wheels
    const wheelPositions = [
      { x: -0.92, y: 0.35, z: -1.35, isFront: true },
      { x: 0.92, y: 0.35, z: -1.35, isFront: true },
      { x: -0.96, y: 0.36, z: 1.45, isFront: false },
      { x: 0.96, y: 0.36, z: 1.45, isFront: false },
    ];

    for (const wPos of wheelPositions) {
      const wheel = CarbonCeramicBrakeAeroTurbofanWheelGlbGenerator.generateWheelBrakeAssembly({
        rimDiameterInches: wPos.isFront ? 20 : 21,
        rimWidthInches: wPos.isFront ? 10.5 : 12.5,
        tireAspectWidthMm: wPos.isFront ? 275 : 345,
        tireAspectRatio: 30,
        lugStyle: "CENTERLOCK_RACING",
        hasCarbonTurbofanCover: preset.hasTurbofanCover,
        turbofanVaneAngleDeg: 24,
        brakeRotorDiameterMm: wPos.isFront ? 420 : 400,
        caliperColorHex: preset.caliperColorHex,
        brakePadCompound: "SPRINT_SINTERED_CSIC",
      });
      wheel.position.set(wPos.x, wPos.y, wPos.z);
      if (wPos.x > 0) wheel.rotation.y = Math.PI;
      masterGroup.add(wheel);
    }

    return masterGroup;
  }

  /**
   * Builds and saves all binary GLBs to the target folder.
   */
  public static async exportAllPhase7Glbs(targetDir: string = "public/models/exterior"): Promise<string[]> {
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const exportedPaths: string[] = [];

    for (const preset of PHASE_7_PRESETS) {
      const group = this.buildPresetScene(preset);
      const res = await UniversalGlbExporter.exportVehicleToGlb(group, {
        binary: true,
      });

      const buffer = Buffer.from(res.buffer);
      const outPath = path.join(targetDir, preset.filename);
      fs.writeFileSync(outPath, buffer);
      exportedPaths.push(outPath);
    }

    return exportedPaths;
  }
}
