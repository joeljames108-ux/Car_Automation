/**
 * ============================================================================
 * PHASE 7 ULTRA-FIDELITY EXTERIOR 3D GLB & AESTHETICS MASTER TEST SUITE
 * ============================================================================
 * Rigorous assertions for:
 * 1. NACA 6412/4412 Analytical Aerofoil Coordinates & Lofting
 * 2. Multi-Element Wing Stack 3D Mesh Generation & CFD Polars
 * 3. Active Underbody Venturi Floor & Bernoulli Suction Engine
 * 4. Forged Turbofan Magnesium Wheels & 420mm C/SiC Brakes
 * 5. Matrix Laser Projection Optics & 3D OLED Ribbon Light Blades
 * 6. Advanced 5-Layer Spectral Automotive Paint Material & Flake Shader
 * 7. Procedural Motorsport Liveries & 24H Track Weathering Engine
 * 8. Phase 7 Master Preset Scene Generation & Binary GLB Export Pipeline
 * ============================================================================
 */

import { describe, it, expect } from "vitest";
import * as THREE from "three";
import { ParametricWidebodyAeroAerofoilCad } from "../geometry/parametricWidebodyAeroAerofoilCad";
import { ActiveUnderbodyGroundEffectDiffuserCad } from "../aerodynamics/activeUnderbodyGroundEffectDiffuserCad";
import { CarbonCeramicBrakeAeroTurbofanWheelGlbGenerator } from "../generators/carbonCeramicBrakeAeroTurbofanWheelGlbGenerator";
import { MatrixLaserProjectionOpticsGlbGenerator } from "../generators/matrixLaserProjectionOpticsGlbGenerator";
import { AdvancedSpectralMultiLayerPaintShader } from "../materials/advancedSpectralMultiLayerPaintShader";
import { ProceduralTrackWeatheringLiveriesEngine } from "../materials/proceduralTrackWeatheringLiveriesEngine";
import {
  GeneratePhase7ExteriorGlbSuite,
  PHASE_7_PRESETS,
} from "../export/generatePhase7ExteriorGlbSuite";
import { UniversalGlbExporter } from "../export/universalGlbExporter";

describe("Phase 7 Ultra-Fidelity Exterior 3D GLB Master Test Suite", () => {
  // ==========================================================================
  // 1. NACA AEROFOIL & MULTI-ELEMENT WING TESTS
  // ==========================================================================
  describe("ParametricWidebodyAeroAerofoilCad Geometry & CFD Polars", () => {
    it("calculates accurate NACA 4-digit upper and lower aerofoil coordinates", () => {
      const coords = ParametricWidebodyAeroAerofoilCad.calculateNaca4DigitCoordinates({
        profileType: "NACA_6412_SUPERCRITICAL",
        maxCamberPct: 6,
        maxCamberPosTenths: 4,
        thicknessPct: 12,
        chordMm: 400,
        spanMm: 1800,
        geometricTwistDeg: -3.0,
        sweepAngleDeg: 8.0,
        dihedralAngleDeg: -2.0,
      });

      expect(coords.upperCoords.length).toBeGreaterThan(50);
      expect(coords.lowerCoords.length).toBeGreaterThan(50);
      expect(coords.camberLine.length).toBeGreaterThan(50);

      // Trailing edge check (at chord length ~0.4m)
      const te = coords.upperCoords[coords.upperCoords.length - 1];
      expect(te.x).toBeCloseTo(0.4, 2);
    });

    it("generates watertight 3D lofted multi-element wing group with swan-neck pylons", () => {
      const wingGroup = ParametricWidebodyAeroAerofoilCad.generateMultiElementWingMesh({
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
        flapDeflectionAngleDeg: 24,
        hasGurneyFlap: true,
        gurneyFlapHeightMm: 10,
        pylonMountType: "SWAN_NECK_TOP_MOUNT",
        pylonCount: 2,
        endplateDesign: "GT3_CURVED_CASCADE",
      });

      expect(wingGroup).toBeInstanceOf(THREE.Group);
      expect(wingGroup.children.length).toBeGreaterThanOrEqual(4);
      expect(wingGroup.getObjectByName("MAIN_PLANE_AEROFOIL")).toBeDefined();
      expect(wingGroup.getObjectByName("SECONDARY_DRS_FLAP")).toBeDefined();
      expect(wingGroup.getObjectByName("SWAN_NECK_PYLON_GROUP")).toBeDefined();
      expect(wingGroup.getObjectByName("AERODYNAMIC_ENDPLATE_ASSEMBLY")).toBeDefined();
    });

    it("solves high-downforce CFD aerodynamic polar and lift-to-drag ratio", () => {
      const result = ParametricWidebodyAeroAerofoilCad.solveAerodynamicPerformance(
        {
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
          flapDeflectionAngleDeg: 28,
          hasGurneyFlap: true,
          gurneyFlapHeightMm: 10,
          pylonMountType: "SWAN_NECK_TOP_MOUNT",
          pylonCount: 2,
          endplateDesign: "GT3_CURVED_CASCADE",
        },
        280
      );

      expect(result.totalDownforceN).toBeGreaterThan(4000);
      expect(result.totalDownforceKg).toBeGreaterThan(400);
      expect(result.liftToDragRatio).toBeGreaterThan(2.5);
      expect(result.surfaceCpPressureHeatmap.length).toBeGreaterThan(15);
    });
  });

  // ==========================================================================
  // 2. ACTIVE UNDERBODY VENTURI FLOOR TESTS
  // ==========================================================================
  describe("ActiveUnderbodyGroundEffectDiffuserCad", () => {
    it("generates 3D underbody floor with twin Venturi tunnels and diffuser strakes", () => {
      const underbody = ActiveUnderbodyGroundEffectDiffuserCad.generateUnderbodyMesh({
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

      expect(underbody).toBeInstanceOf(THREE.Group);
      expect(underbody.children.length).toBeGreaterThanOrEqual(3);
      expect(underbody.getObjectByName("VENTURI_TUNNEL_PAIR")).toBeDefined();
      expect(underbody.getObjectByName("REAR_DIFFUSER_ASSEMBLY")).toBeDefined();
      expect(underbody.getObjectByName("LONGITUDINAL_SEALING_SKIRTS")).toBeDefined();
    });

    it("solves Bernoulli underbody suction force and porpoising stability index", () => {
      const physics = ActiveUnderbodyGroundEffectDiffuserCad.solveUnderbodyPhysics(
        {
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
        },
        300,
        32
      );

      expect(physics.underbodyDownforceN).toBeGreaterThan(5000);
      expect(physics.diffuserSuctionPeakPa).toBeLessThan(0); // High negative pressure
      expect(physics.groundEffectSealingEfficiency).toBeGreaterThan(0.85);
      expect(physics.isBoundaryLayerAttached).toBe(true);
    });
  });

  // ==========================================================================
  // 3. FORGED TURBOFAN WHEELS & C/SIC BRAKES TESTS
  // ==========================================================================
  describe("CarbonCeramicBrakeAeroTurbofanWheelGlbGenerator", () => {
    it("builds 21-inch forged wheel with turbofan cover and 10-piston caliper", () => {
      const wheelGroup = CarbonCeramicBrakeAeroTurbofanWheelGlbGenerator.generateWheelBrakeAssembly({
        rimDiameterInches: 21,
        rimWidthInches: 12.5,
        tireAspectWidthMm: 345,
        tireAspectRatio: 30,
        lugStyle: "CENTERLOCK_RACING",
        hasCarbonTurbofanCover: true,
        turbofanVaneAngleDeg: 24,
        brakeRotorDiameterMm: 420,
        caliperColorHex: 0xe11d48,
        brakePadCompound: "SPRINT_SINTERED_CSIC",
      });

      expect(wheelGroup).toBeInstanceOf(THREE.Group);
      expect(wheelGroup.getObjectByName("FORGED_MAGNESIUM_RIM")).toBeDefined();
      expect(wheelGroup.getObjectByName("AERO_TURBOFAN_COVER")).toBeDefined();
      expect(wheelGroup.getObjectByName("FLOATING_CSIC_BRAKE_ROTOR")).toBeDefined();
      expect(wheelGroup.getObjectByName("TEN_PISTON_MONOBLOC_CALIPER")).toBeDefined();
      expect(wheelGroup.getObjectByName("MICHELIN_CUP_2R_TRACK_TIRE")).toBeDefined();
    });
  });

  // ==========================================================================
  // 4. MATRIX LASER OPTICS & OLED RIBBON TESTS
  // ==========================================================================
  describe("MatrixLaserProjectionOpticsGlbGenerator", () => {
    it("generates matrix laser headlights and 3D OLED ribbon light blade", () => {
      const optics = MatrixLaserProjectionOpticsGlbGenerator.generateLightingAssembly({
        headlightTech: "DMD_DIGITAL_MATRIX_LASER",
        drlSignatureStyle: "CRYSTAL_CLAW_TRIPLE",
        taillightTech: "FULL_WIDTH_3D_OLED_RIBBON",
        hasSweepingIndicators: true,
        lightingState: "HIGH_BEAM_LASER",
        primaryEmissiveHex: 0xfbbf24,
        taillightEmissiveHex: 0xff0033,
      });

      expect(optics).toBeInstanceOf(THREE.Group);
      expect(optics.getObjectByName("FRONT_MATRIX_HEADLIGHT_CLUSTER")).toBeDefined();
      expect(optics.getObjectByName("REAR_OLED_LIGHT_BLADE_ASSEMBLY")).toBeDefined();
    });
  });

  // ==========================================================================
  // 5. SPECTRAL PAINT & LIVERIES TESTS
  // ==========================================================================
  describe("AdvancedSpectralMultiLayerPaintShader & ProceduralTrackWeatheringLiveriesEngine", () => {
    it("creates 5-layer spectral automotive paint material with clearcoat normal mapping", () => {
      const paintMat = AdvancedSpectralMultiLayerPaintShader.createSpectralPaintMaterial({
        baseColorHex: "#00e5ff",
        candyChromaStrength: 0.85,
        metallicFlakeDensity: 0.8,
        flakeSparkleIntensity: 1.5,
        chameleonShiftAngleDeg: 35,
        secondaryChameleonHex: "#d97706",
        clearcoatGloss: 0.98,
        orangePeelMicroRoughness: 0.02,
        isCarbonExposed: false,
      });

      expect(paintMat).toBeInstanceOf(THREE.MeshPhysicalMaterial);
      expect(paintMat.clearcoat).toBeCloseTo(0.98);
      expect(paintMat.clearcoatNormalMap).toBeDefined();
    });

    it("generates dynamic canvas livery texture with FIA roundels and track weathering", () => {
      const liveryTex = ProceduralTrackWeatheringLiveriesEngine.generateLiveryTexture({
        style: "HERITAGE_LE_MANS_STRIPES",
        primaryAccentHex: "#ffffff",
        secondaryAccentHex: "#ff0055",
        raceNumber: 24,
        hasSponsorDecals: true,
        weatheringIntensity: "LE_MANS_24H_BATTLE_SCARS",
      });

      expect(liveryTex).toBeInstanceOf(THREE.Texture);
      expect(liveryTex).toBeDefined();
    });
  });

  // ==========================================================================
  // 6. PHASE 7 MASTER PRESET SCENES & GLB EXPORT
  // ==========================================================================
  describe("GeneratePhase7ExteriorGlbSuite Pipeline", () => {
    it("builds all 4 master preset 3D scenes with complete hierarchies", () => {
      for (const preset of PHASE_7_PRESETS) {
        const scene = GeneratePhase7ExteriorGlbSuite.buildPresetScene(preset);
        expect(scene).toBeInstanceOf(THREE.Group);
        expect(scene.children.length).toBeGreaterThanOrEqual(5);
      }
    });

    it("asynchronously serializes Master Apex Hyper GT Stradale to binary GLB Blob", async () => {
      const preset = PHASE_7_PRESETS[0];
      const scene = GeneratePhase7ExteriorGlbSuite.buildPresetScene(preset);

      const res = await UniversalGlbExporter.exportVehicleToGlb(scene, {
        binary: true,
      });

      expect(res.buffer).toBeDefined();
      expect(res.buffer.byteLength).toBeGreaterThan(15000); // Must produce substantial binary GLB
    }, 30000);
  });
});
