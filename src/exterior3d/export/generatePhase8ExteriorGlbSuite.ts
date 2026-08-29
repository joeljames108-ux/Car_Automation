/**
 * ============================================================================
 * PHASE 8 MASTER EXTERIOR 3D BINARY GLB ASSET GENERATOR
 * ============================================================================
 * Programmatically constructs and exports 4 flagship Phase 8 hypercar geometries:
 *
 * 1. `vehicle_apex_hyper_valkyrie_lmh.glb` - WEC LMH Prototype with Dihedral Doors
 * 2. `vehicle_phantom_forged_carbon_gt.glb` - Forged Carbon Super GT with Top-Exit Exhaust
 * 3. `vehicle_nurburgring_record_breaker.glb` - Active Canard & Louvered Time Attack Spec
 * 4. `vehicle_cyber_interceptor_pursuit.glb` - Futuristic Aero Pursuit with Shark Fin
 * ============================================================================
 */

import * as THREE from "three";
import * as fs from "fs";
import * as path from "path";
import { HyperAdvancedLouveredFenderAeroCanardCad } from "../geometry/hyperAdvancedLouveredFenderAeroCanardCad";
import { ButterflyDihedralDoorKinematicsCad, DoorKinematicsType } from "../kinematics/butterflyDihedralDoorKinematicsCad";
import { QuadExhaustInconelTitaniumCadGenerator, ExhaustMountLocation } from "../generators/quadExhaustInconelTitaniumCadGenerator";
import { ProceduralCarbonFiberWeaveArchitectures, CarbonWeavePattern } from "../materials/proceduralCarbonFiberWeaveArchitectures";
import { ModularActiveAeroSplitterDiffuserAssembly } from "../generators/modularActiveAeroSplitterDiffuserAssembly";
import { ParametricWidebodyAeroAerofoilCad } from "../geometry/parametricWidebodyAeroAerofoilCad";
import { ActiveUnderbodyGroundEffectDiffuserCad } from "../aerodynamics/activeUnderbodyGroundEffectDiffuserCad";
import { CarbonCeramicBrakeAeroTurbofanWheelGlbGenerator } from "../generators/carbonCeramicBrakeAeroTurbofanWheelGlbGenerator";
import { MatrixLaserProjectionOpticsGlbGenerator } from "../generators/matrixLaserProjectionOpticsGlbGenerator";
import { UniversalGlbExporter } from "./universalGlbExporter";

export interface Phase8MasterPreset {
  id: string;
  filename: string;
  name: string;
  doorType: DoorKinematicsType;
  carbonPattern: CarbonWeavePattern;
  carbonTintHex: string;
  louverCount: 3 | 5 | 7;
  canardTiers: 1 | 2 | 3;
  exhaustLocation: ExhaustMountLocation;
  exhaustTempC: number;
  splitterFlapAngleDeg: number;
  hasSharkFin: boolean;
}

export const PHASE_8_PRESETS: Phase8MasterPreset[] = [
  {
    id: "apex_valkyrie_lmh",
    filename: "vehicle_apex_hyper_valkyrie_lmh.glb",
    name: "Apex Valkyrie LMH Prototype",
    doorType: "BUTTERFLY_LE_MANS_FORWARD_UP",
    carbonPattern: "TWILL_2X2_3K",
    carbonTintHex: "#00f0ff",
    louverCount: 7,
    canardTiers: 3,
    exhaustLocation: "TOP_EXIT_SPYDER_CANNONS",
    exhaustTempC: 850,
    splitterFlapAngleDeg: 18,
    hasSharkFin: true,
  },
  {
    id: "phantom_forged_carbon_gt",
    filename: "vehicle_phantom_forged_carbon_gt.glb",
    name: "Phantom Forged Carbon Super GT",
    doorType: "DIHEDRAL_SYNCHRO_HELIX_90",
    carbonPattern: "FORGED_COMPOSITE_CHOPPED",
    carbonTintHex: "#1e1e24",
    louverCount: 5,
    canardTiers: 2,
    exhaustLocation: "LOWER_DIFFUSER_QUAD_TIPS",
    exhaustTempC: 620,
    splitterFlapAngleDeg: 12,
    hasSharkFin: false,
  },
  {
    id: "nurburgring_record_breaker",
    filename: "vehicle_nurburgring_record_breaker.glb",
    name: "Nürburgring Time Attack Spec",
    doorType: "GULLWING_ROOF_HINGED",
    carbonPattern: "SPREAD_TOW_BIAXIAL",
    carbonTintHex: "#ff0055",
    louverCount: 7,
    canardTiers: 3,
    exhaustLocation: "TOP_EXIT_SPYDER_CANNONS",
    exhaustTempC: 920,
    splitterFlapAngleDeg: 24,
    hasSharkFin: true,
  },
  {
    id: "cyber_interceptor_pursuit",
    filename: "vehicle_cyber_interceptor_pursuit.glb",
    name: "Cyber Interceptor Aero Pursuit",
    doorType: "DIHEDRAL_SYNCHRO_HELIX_90",
    carbonPattern: "TWILL_2X2_3K",
    carbonTintHex: "#f59e0b",
    louverCount: 5,
    canardTiers: 2,
    exhaustLocation: "LOWER_DIFFUSER_QUAD_TIPS",
    exhaustTempC: 780,
    splitterFlapAngleDeg: 15,
    hasSharkFin: true,
  },
];

export class GeneratePhase8ExteriorGlbSuite {
  /**
   * Constructs the full 3D hierarchical scene for a Phase 8 Preset.
   */
  public static buildPresetScene(preset: Phase8MasterPreset): THREE.Group {
    const sceneGroup = new THREE.Group();
    sceneGroup.name = `SCENE_${preset.id.toUpperCase()}`;

    // 1. Carbon Weave Material
    const carbonMat = ProceduralCarbonFiberWeaveArchitectures.createCarbonFiberMaterial({
      pattern: preset.carbonPattern,
      resinTintHex: preset.carbonTintHex,
      clearcoatGloss: 0.95,
      anisotropyStrength: 0.9,
      weaveScale: 28,
    });

    // 2. Central Monocoque Body
    const monoGeo = new THREE.BoxGeometry(1.65, 0.72, 4.45);
    const monoMesh = new THREE.Mesh(monoGeo, carbonMat);
    monoMesh.position.set(0, 0.45, 0);
    monoMesh.castShadow = true;
    sceneGroup.add(monoMesh);

    // 3. Louvered Front Fenders & Aero Canards
    const fenderAssembly = HyperAdvancedLouveredFenderAeroCanardCad.generateFenderCanardAssembly(
      {
        fenderWidthMm: 2040,
        louverCount: preset.louverCount,
        louverAngleDeg: 28,
        canardTierCount: preset.canardTiers,
        canardSpanMm: 280,
        hasSharkGillVents: true,
        hasAirCurtainDucts: true,
        hasTireWakeDeflectors: true,
      },
      { carbonFiberMat: carbonMat }
    );
    sceneGroup.add(fenderAssembly);

    // 4. Kinematic Doors
    const doorAssembly = ButterflyDihedralDoorKinematicsCad.generateDoorAssembly(
      {
        doorType: preset.doorType,
        openProgress: 0.0, // Closed for export
        doorLengthMm: 1250,
        doorHeightMm: 850,
        hasCarbonAeroMirror: true,
        hasFramelessGlass: true,
        hasPneumaticStruts: true,
      },
      { bodyOuterPaintMat: carbonMat }
    );
    sceneGroup.add(doorAssembly);

    // 5. Quad Exhaust Assembly
    const exhaustAssembly = QuadExhaustInconelTitaniumCadGenerator.generateExhaustAssembly({
      mountLocation: preset.exhaustLocation,
      tipDiameterMm: 102,
      wallThicknessMm: 1.2,
      operatingTempC: preset.exhaustTempC,
      hasBackfireFlames: true,
      hasHoneycombHeatShield: true,
    });
    sceneGroup.add(exhaustAssembly);

    // 6. Active Splitter & Roof Shark Fin
    const splitterAssembly = ModularActiveAeroSplitterDiffuserAssembly.generateAssembly(
      {
        splitterExtensionMm: 180,
        splitterFlapAngleDeg: preset.splitterFlapAngleDeg,
        hasRoofSharkFin: preset.hasSharkFin,
        sharkFinHeightMm: 260,
        hasAnodizedTowHook: true,
        towHookColorHex: "#ef4444",
        hasUnderfloorStrakes: true,
      },
      { carbonSplitterMat: carbonMat }
    );
    sceneGroup.add(splitterAssembly);

    // 7. NACA Supercritical Multi-Element Rear Wing
    const wingAssembly = ParametricWidebodyAeroAerofoilCad.generateMultiElementWingMesh(
      {
        mainPlane: {
          profileType: "NACA_6412_SUPERCRITICAL",
          chordMm: 380,
          spanMm: 1980,
          thicknessPct: 12,
          maxCamberPct: 4,
          maxCamberPosTenths: 4,
          sweepAngleDeg: 8.0,
          geometricTwistDeg: -3.5,
          dihedralAngleDeg: -2.0,
        },
        secondaryFlap: {
          profileType: "NACA_4412_HIGH_LIFT",
          chordMm: 220,
          spanMm: 1940,
          thicknessPct: 10,
          maxCamberPct: 5,
          maxCamberPosTenths: 4,
          sweepAngleDeg: 8.0,
          geometricTwistDeg: -3.0,
          dihedralAngleDeg: -2.0,
        },
        flapOverlapMm: 25,
        flapSlotGapMm: 18,
        flapDeflectionAngleDeg: 16,
        hasGurneyFlap: true,
        gurneyFlapHeightMm: 8,
        pylonMountType: "SWAN_NECK_TOP_MOUNT",
        pylonCount: 2,
        endplateDesign: "GT3_CURVED_CASCADE",
      },
      { carbonFiberMat: carbonMat }
    );
    wingAssembly.position.set(0, 0.95, 1.85);
    sceneGroup.add(wingAssembly);

    // 8. Ground-Effect Venturi Underbody Diffuser
    const underbodyAssembly = ActiveUnderbodyGroundEffectDiffuserCad.generateUnderbodyMesh(
      {
        wheelbaseMm: 2750,
        floorWidthMm: 1880,
        frontThroatHeightMm: 32,
        midTunnelHeightMm: 45,
        rearDiffuserLengthMm: 950,
        diffuserExpansionAngleDeg: 16.5,
        strakeCount: 4,
        hasActiveSealingSkirts: true,
        skirtGroundClearanceMm: 4,
        hasBoundaryLayerBleedGills: true,
      },
      { carbonUndertrayMat: carbonMat }
    );
    sceneGroup.add(underbodyAssembly);

    // 9. Matrix Laser Lighting Arrays
    const opticsAssembly = MatrixLaserProjectionOpticsGlbGenerator.generateLightingAssembly({
      headlightTech: "DMD_DIGITAL_MATRIX_LASER",
      drlSignatureStyle: "CRYSTAL_CLAW_TRIPLE",
      taillightTech: "FULL_WIDTH_3D_OLED_RIBBON",
      hasSweepingIndicators: true,
      lightingState: "HIGH_BEAM_LASER",
      primaryEmissiveHex: 0x00f0ff,
      taillightEmissiveHex: 0xff0033,
    });
    sceneGroup.add(opticsAssembly);

    // 10. Forged Turbofan Wheels
    const wheelPositions = [
      { x: -0.92, y: 0.35, z: -1.35, isFront: true },
      { x: 0.92, y: 0.35, z: -1.35, isFront: true },
      { x: -0.96, y: 0.37, z: 1.45, isFront: false },
      { x: 0.96, y: 0.37, z: 1.45, isFront: false },
    ];

    for (const wPos of wheelPositions) {
      const wheel = CarbonCeramicBrakeAeroTurbofanWheelGlbGenerator.generateWheelBrakeAssembly({
        rimDiameterInches: wPos.isFront ? 20 : 21,
        rimWidthInches: wPos.isFront ? 10.5 : 12.5,
        tireAspectWidthMm: wPos.isFront ? 275 : 345,
        tireAspectRatio: 30,
        lugStyle: "CENTERLOCK_RACING",
        hasCarbonTurbofanCover: true,
        turbofanVaneAngleDeg: 24,
        brakeRotorDiameterMm: wPos.isFront ? 420 : 400,
        caliperColorHex: parseInt(preset.carbonTintHex.replace("#", "0x"), 16) || 0x00f0ff,
        brakePadCompound: "SPRINT_SINTERED_CSIC",
      });
      wheel.position.set(wPos.x, wPos.y, wPos.z);
      if (wPos.x > 0) wheel.rotation.y = Math.PI;
      sceneGroup.add(wheel);
    }

    return sceneGroup;
  }

  /**
   * Programmatically exports all 4 Phase 8 master hypercar models to binary GLB.
   */
  public static async exportAllPhase8Glbs(outputDir?: string): Promise<string[]> {
    const targetDir = outputDir || path.resolve(process.cwd(), "public/models/exterior");
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const exportedPaths: string[] = [];

    for (const preset of PHASE_8_PRESETS) {
      const group = this.buildPresetScene(preset);
      const res = await UniversalGlbExporter.exportVehicleToGlb(group, {
        binary: true,
        vehicleName: preset.name,
      });

      const buffer = Buffer.from(res.buffer);
      const outPath = path.join(targetDir, preset.filename);
      fs.writeFileSync(outPath, buffer);
      exportedPaths.push(outPath);
    }

    return exportedPaths;
  }
}
