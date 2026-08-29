/**
 * ============================================================================
 * COMPLETE PHASE 9 MASTER HYPERCAR VEHICLE ASSEMBLY GENERATOR
 * ============================================================================
 * Parametrically integrates all Phase 9 hypercar CAD systems into a master model:
 *
 * 1. HyperExtremeSculptedBodyworkCad (Deep Undercuts, S-Duct, Roof Scoop, Flying Buttresses)
 * 2. ActiveHydraulicAeroFlapsDrsCad (4-Quadrant Active Flaps & Dynamic Airbrake)
 * 3. DualIntercoolerRadiatorHeatExchangerCadGenerator (Twin Radiators & Sidepod Intercoolers)
 * 4. ActiveSuspensionStanceGeometryCad (Pushrod Double Wishbones & Multimatic Dampers)
 * 5. CyberpunkUnderglowLidarSensorSuiteGenerator (Solid-State LiDAR & RGB Underglow)
 * 6. NACA 6412 Rear Wings, Venturi Underbody Diffusers, Turbofan Wheels & Matrix Optics
 * ============================================================================
 */

import * as THREE from "three";
import { HyperExtremeSculptedBodyworkCad, SculptedBodyworkSpec } from "../geometry/hyperExtremeSculptedBodyworkCad";
import { ActiveHydraulicAeroFlapsDrsCad, ActiveAeroFlapsSpec } from "../aerodynamics/activeHydraulicAeroFlapsDrsCad";
import { DualIntercoolerRadiatorHeatExchangerCadGenerator, HeatExchangerSpec } from "./dualIntercoolerRadiatorHeatExchangerCadGenerator";
import { ActiveSuspensionStanceGeometryCad, ActiveSuspensionSpec } from "../kinematics/activeSuspensionStanceGeometryCad";
import { CyberpunkUnderglowLidarSensorSuiteGenerator, LidarSensorSuiteSpec } from "./cyberpunkUnderglowLidarSensorSuiteGenerator";
import { ParametricWidebodyAeroAerofoilCad } from "../geometry/parametricWidebodyAeroAerofoilCad";
import { ActiveUnderbodyGroundEffectDiffuserCad } from "../aerodynamics/activeUnderbodyGroundEffectDiffuserCad";
import { CarbonCeramicBrakeAeroTurbofanWheelGlbGenerator } from "./carbonCeramicBrakeAeroTurbofanWheelGlbGenerator";
import { MatrixLaserProjectionOpticsGlbGenerator } from "./matrixLaserProjectionOpticsGlbGenerator";
import { ProceduralCarbonFiberWeaveArchitectures, CarbonWeavePattern } from "../materials/proceduralCarbonFiberWeaveArchitectures";
import { QuadExhaustInconelTitaniumCadGenerator } from "./quadExhaustInconelTitaniumCadGenerator";

export interface Phase9CompleteVehicleConfig {
  name: string;
  bodyColorHex: string;
  carbonPattern: CarbonWeavePattern;
  sculptedBody: SculptedBodyworkSpec;
  activeFlaps: ActiveAeroFlapsSpec;
  cooling: HeatExchangerSpec;
  suspension: ActiveSuspensionSpec;
  sensorsAndUnderglow: LidarSensorSuiteSpec;
  exhaustTempC: number;
}

export class CompletePhase9MasterHypercarAssembly {
  /**
   * Generates Complete Watertight 3D Master Hypercar Hierarchy.
   */
  public static generateMasterVehicle(config: Phase9CompleteVehicleConfig): THREE.Group {
    const vehicleGroup = new THREE.Group();
    vehicleGroup.name = `MASTER_VEHICLE_${config.name.toUpperCase().replace(/\s+/g, "_")}`;

    // ── 1. Materials ──
    const carbonMat = ProceduralCarbonFiberWeaveArchitectures.createCarbonFiberMaterial({
      pattern: config.carbonPattern,
      resinTintHex: config.bodyColorHex,
      clearcoatGloss: 0.96,
      anisotropyStrength: 0.88,
      weaveScale: 28,
    });

    const bodyPaintMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(config.bodyColorHex),
      roughness: 0.15,
      metalness: 0.9,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
    });

    // ── 2. Central Monocoque Core Chassis ──
    const monocoqueGeo = new THREE.BoxGeometry(1.68, 0.75, 4.42);
    const monocoqueMesh = new THREE.Mesh(monocoqueGeo, bodyPaintMat);
    monocoqueMesh.position.set(0, 0.45, 0);
    monocoqueMesh.castShadow = true;
    vehicleGroup.add(monocoqueMesh);

    // ── 3. Sculpted Bodywork Subsystems (Undercuts, S-Duct, Scoop, Buttresses) ──
    const sculptedBody = HyperExtremeSculptedBodyworkCad.generateSculptedBodyworkAssembly(
      config.sculptedBody,
      { bodyworkMat: bodyPaintMat, carbonAccentMat: carbonMat }
    );
    vehicleGroup.add(sculptedBody);

    // ── 4. 4-Quadrant Active Aero Flaps & DRS ──
    const flaps = ActiveHydraulicAeroFlapsDrsCad.generateActiveFlapAssembly(
      config.activeFlaps,
      { carbonFlapMat: carbonMat }
    );
    vehicleGroup.add(flaps);

    // ── 5. Twin Radiator & Intercooler Heat Exchangers ──
    const cooling = DualIntercoolerRadiatorHeatExchangerCadGenerator.generateCoolingAssembly(config.cooling);
    vehicleGroup.add(cooling);

    // ── 6. Pushrod Suspension Double Wishbones ──
    const suspension = ActiveSuspensionStanceGeometryCad.generateSuspensionAssembly(
      config.suspension,
      { pushrodCarbonMat: carbonMat }
    );
    vehicleGroup.add(suspension);

    // ── 7. LiDAR Sensor Pod & Underglow ──
    const sensors = CyberpunkUnderglowLidarSensorSuiteGenerator.generateSensorUnderglowAssembly(
      config.sensorsAndUnderglow
    );
    vehicleGroup.add(sensors);

    // ── 8. Inconel Top/Diffuser Exhaust ──
    const exhaust = QuadExhaustInconelTitaniumCadGenerator.generateExhaustAssembly({
      mountLocation: "TOP_EXIT_SPYDER_CANNONS",
      tipDiameterMm: 102,
      wallThicknessMm: 1.2,
      operatingTempC: config.exhaustTempC,
      hasBackfireFlames: true,
      hasHoneycombHeatShield: true,
    });
    vehicleGroup.add(exhaust);

    // ── 9. Supercritical Multi-Element Rear Wing ──
    const wing = ParametricWidebodyAeroAerofoilCad.generateMultiElementWingMesh(
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
    wing.position.set(0, 0.95, 1.85);
    vehicleGroup.add(wing);

    // ── 10. Venturi Underbody Diffuser ──
    const underbody = ActiveUnderbodyGroundEffectDiffuserCad.generateUnderbodyMesh(
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
    vehicleGroup.add(underbody);

    // ── 11. Matrix Laser Optics ──
    const optics = MatrixLaserProjectionOpticsGlbGenerator.generateLightingAssembly({
      headlightTech: "DMD_DIGITAL_MATRIX_LASER",
      drlSignatureStyle: "CRYSTAL_CLAW_TRIPLE",
      taillightTech: "FULL_WIDTH_3D_OLED_RIBBON",
      hasSweepingIndicators: true,
      lightingState: "HIGH_BEAM_LASER",
      primaryEmissiveHex: 0x00f0ff,
      taillightEmissiveHex: 0xff0033,
    });
    vehicleGroup.add(optics);

    // ── 12. 4 Turbofan Wheels ──
    const wheelPositions = [
      { x: -0.92, y: 0.35 + config.suspension.frontRideHeightOffsetMm / 1000, z: -1.35, isFront: true },
      { x: 0.92, y: 0.35 + config.suspension.frontRideHeightOffsetMm / 1000, z: -1.35, isFront: true },
      { x: -0.96, y: 0.37 + config.suspension.rearRideHeightOffsetMm / 1000, z: 1.45, isFront: false },
      { x: 0.96, y: 0.37 + config.suspension.rearRideHeightOffsetMm / 1000, z: 1.45, isFront: false },
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
        caliperColorHex: parseInt(config.bodyColorHex.replace("#", "0x"), 16) || 0x00f0ff,
        brakePadCompound: "SPRINT_SINTERED_CSIC",
      });
      wheel.position.set(wPos.x, wPos.y, wPos.z);
      if (wPos.x > 0) wheel.rotation.y = Math.PI;
      vehicleGroup.add(wheel);
    }

    return vehicleGroup;
  }
}
