/**
 * ============================================================================
 * PHASE 8 ULTRA-FIDELITY EXTERIOR 3D GLB MASTER TEST SUITE
 * ============================================================================
 * Comprehensive unit test verification of Phase 8 aero-kinematics modules:
 *
 * 1. HyperAdvancedLouveredFenderAeroCanardCad (Louvers, Canards & Stagnation Relief)
 * 2. ButterflyDihedralDoorKinematicsCad (Multi-Axis Dihedral Synchro-Helix Transformations)
 * 3. AeroAcousticCfdWindNoiseSolver (Strouhal Vortex Frequency & Zwicker Loudness)
 * 4. QuadExhaustInconelTitaniumCadGenerator (Thermal Blued Titanium Shaders & Cannons)
 * 5. ProceduralCarbonFiberWeaveArchitectures (Twill, Forged, Spread Tow Textures)
 * 6. ModularActiveAeroSplitterDiffuserAssembly (Splitter Flaps & Shark Fin Balance)
 * 7. GeneratePhase8ExteriorGlbSuite (3D Scene Assembly & Async Binary GLB Export)
 * ============================================================================
 */

import { describe, it, expect } from "vitest";
import * as THREE from "three";
import { HyperAdvancedLouveredFenderAeroCanardCad } from "../geometry/hyperAdvancedLouveredFenderAeroCanardCad";
import { ButterflyDihedralDoorKinematicsCad } from "../kinematics/butterflyDihedralDoorKinematicsCad";
import { AeroAcousticCfdWindNoiseSolver } from "../aerodynamics/aeroAcousticCfdWindNoiseSolver";
import { QuadExhaustInconelTitaniumCadGenerator } from "../generators/quadExhaustInconelTitaniumCadGenerator";
import { ProceduralCarbonFiberWeaveArchitectures } from "../materials/proceduralCarbonFiberWeaveArchitectures";
import { ModularActiveAeroSplitterDiffuserAssembly } from "../generators/modularActiveAeroSplitterDiffuserAssembly";
import { GeneratePhase8ExteriorGlbSuite, PHASE_8_PRESETS } from "../export/generatePhase8ExteriorGlbSuite";
import { UniversalGlbExporter } from "../export/universalGlbExporter";

describe("Phase 8 Ultra-Fidelity Exterior 3D GLB Master Test Suite", () => {
  // ==========================================================================
  // 1. LOUVERED FENDER & CANARD CAD ENGINE
  // ==========================================================================
  describe("HyperAdvancedLouveredFenderAeroCanardCad", () => {
    it("generates watertight 3D louvered fender assembly with canards and air curtains", () => {
      const group = HyperAdvancedLouveredFenderAeroCanardCad.generateFenderCanardAssembly({
        fenderWidthMm: 2040,
        louverCount: 7,
        louverAngleDeg: 28,
        canardTierCount: 3,
        canardSpanMm: 280,
        hasSharkGillVents: true,
        hasAirCurtainDucts: true,
        hasTireWakeDeflectors: true,
      });

      expect(group).toBeInstanceOf(THREE.Group);
      expect(group.name).toBe("LOUVERED_FENDER_CANARD_ASSEMBLY");
      expect(group.children.length).toBeGreaterThanOrEqual(4);
    });

    it("accurately computes wheelhouse lift reduction and front downforce gain", () => {
      const aero = HyperAdvancedLouveredFenderAeroCanardCad.solveFenderAeroPhysics(
        {
          fenderWidthMm: 2040,
          louverCount: 7,
          louverAngleDeg: 28,
          canardTierCount: 3,
          canardSpanMm: 280,
          hasSharkGillVents: true,
          hasAirCurtainDucts: true,
          hasTireWakeDeflectors: true,
        },
        280
      );

      expect(aero.wheelWellPressureReductionPct).toBeGreaterThan(20);
      expect(aero.frontAxleDownforceN).toBeGreaterThan(1000);
      expect(aero.frontAxleDownforceKg).toBeGreaterThan(100);
      expect(aero.tireWakeTurbulenceReductionPct).toBe(28);
    });
  });

  // ==========================================================================
  // 2. BUTTERFLY & DIHEDRAL DOOR KINEMATICS
  // ==========================================================================
  describe("ButterflyDihedralDoorKinematicsCad", () => {
    it("computes 90° Dihedral Synchro-Helix transformation matrix", () => {
      const transformClosed = ButterflyDihedralDoorKinematicsCad.computeKinematicTransform(
        {
          doorType: "DIHEDRAL_SYNCHRO_HELIX_90",
          openProgress: 0.0,
          doorLengthMm: 1250,
          doorHeightMm: 850,
          hasCarbonAeroMirror: true,
          hasFramelessGlass: true,
          hasPneumaticStruts: true,
        },
        true
      );

      expect(transformClosed.translationM.x).toBeCloseTo(0);
      expect(transformClosed.rotationEulerRad.z).toBeCloseTo(0);

      const transformOpen = ButterflyDihedralDoorKinematicsCad.computeKinematicTransform(
        {
          doorType: "DIHEDRAL_SYNCHRO_HELIX_90",
          openProgress: 1.0,
          doorLengthMm: 1250,
          doorHeightMm: 850,
          hasCarbonAeroMirror: true,
          hasFramelessGlass: true,
          hasPneumaticStruts: true,
        },
        true
      );

      expect(transformOpen.translationM.x).toBeGreaterThan(0.04);
      expect(transformOpen.rotationEulerRad.z).toBeCloseTo(THREE.MathUtils.degToRad(-90));
      expect(transformOpen.windowDropOffsetM).toBeCloseTo(0.012);
      expect(transformOpen.egressWidthClearanceM).toBeGreaterThan(1.0);
    });

    it("generates complete 3D door assembly with frameless glass and carbon mirrors", () => {
      const doorGroup = ButterflyDihedralDoorKinematicsCad.generateDoorAssembly({
        doorType: "BUTTERFLY_LE_MANS_FORWARD_UP",
        openProgress: 0.5,
        doorLengthMm: 1250,
        doorHeightMm: 850,
        hasCarbonAeroMirror: true,
        hasFramelessGlass: true,
        hasPneumaticStruts: true,
      });

      expect(doorGroup).toBeInstanceOf(THREE.Group);
      expect(doorGroup.children.length).toBe(2); // Left & Right doors
    });
  });

  // ==========================================================================
  // 3. AERO-ACOUSTIC CFD WIND NOISE SOLVER
  // ==========================================================================
  describe("AeroAcousticCfdWindNoiseSolver", () => {
    it("solves Strouhal vortex shedding frequency and acoustic glass transmission loss", () => {
      const result = AeroAcousticCfdWindNoiseSolver.solveAeroAcoustics(
        {
          mirrorAerodynamicType: "OPTIMIZED_CARBON_AIRFOIL",
          aPillarRadiusMm: 45,
          windshieldRakeAngleDeg: 26,
          glassType: "ACOUSTIC_PVB_LAMINATED_4_8MM",
          underfloorSealingQualityPct: 95,
        },
        200
      );

      expect(result.mirrorVortexSheddingFreqHz).toBeGreaterThan(100);
      expect(result.totalCabinNoiseDbA).toBeLessThan(75);
      expect(result.acousticGlassAttenuationDb).toBe(42);
      expect(result.articulationIndexPct).toBeGreaterThan(50);
    });

    it("generates 3D acoustic pressure vector visualization tubes", () => {
      const viz = AeroAcousticCfdWindNoiseSolver.generateAcousticVectorVisualization(200);
      expect(viz).toBeInstanceOf(THREE.Group);
      expect(viz.children.length).toBeGreaterThanOrEqual(5);
    });
  });

  // ==========================================================================
  // 4. QUAD INCONEL EXHAUST & TITANIUM SHADERS
  // ==========================================================================
  describe("QuadExhaustInconelTitaniumCadGenerator", () => {
    it("creates temperature-dependent blued titanium PBR physical materials", () => {
      const coldTi = QuadExhaustInconelTitaniumCadGenerator.createBluedTitaniumMaterial(20);
      expect(coldTi.color.getHex()).toBe(0x94a3b8);
      expect(coldTi.emissiveIntensity).toBe(0);

      const hotTi = QuadExhaustInconelTitaniumCadGenerator.createBluedTitaniumMaterial(880);
      expect(hotTi.color.getHex()).toBe(0x00d2ff);
      expect(hotTi.emissiveIntensity).toBeGreaterThan(0.4);
    });

    it("builds 3D quad exhaust assembly with backfire flames and heat shields", () => {
      const exhaust = QuadExhaustInconelTitaniumCadGenerator.generateExhaustAssembly({
        mountLocation: "LOWER_DIFFUSER_QUAD_TIPS",
        tipDiameterMm: 102,
        wallThicknessMm: 1.2,
        operatingTempC: 850,
        hasBackfireFlames: true,
        hasHoneycombHeatShield: true,
      });

      expect(exhaust).toBeInstanceOf(THREE.Group);
      expect(exhaust.children.length).toBeGreaterThanOrEqual(4);
    });
  });

  // ==========================================================================
  // 5. PROCEDURAL CARBON WEAVE ARCHITECTURES
  // ==========================================================================
  describe("ProceduralCarbonFiberWeaveArchitectures", () => {
    it("generates 2x2 Twill, Forged Composite, and Spread-Tow carbon materials", () => {
      for (const pattern of ["TWILL_2X2_3K", "FORGED_COMPOSITE_CHOPPED", "SPREAD_TOW_BIAXIAL"] as const) {
        const mat = ProceduralCarbonFiberWeaveArchitectures.createCarbonFiberMaterial({
          pattern,
          resinTintHex: "#00f0ff",
          clearcoatGloss: 0.95,
          anisotropyStrength: 0.85,
          weaveScale: 32,
        });

        expect(mat).toBeInstanceOf(THREE.MeshPhysicalMaterial);
        expect(mat.normalMap).toBeDefined();
        expect(mat.roughnessMap).toBeDefined();
      }
    });
  });

  // ==========================================================================
  // 6. ACTIVE SPLITTER & ROOF SHARK FIN ASSEMBLY
  // ==========================================================================
  describe("ModularActiveAeroSplitterDiffuserAssembly", () => {
    it("generates active front splitter and yaw-stabilizing shark fin geometry", () => {
      const splitter = ModularActiveAeroSplitterDiffuserAssembly.generateAssembly({
        splitterExtensionMm: 180,
        splitterFlapAngleDeg: 16,
        hasRoofSharkFin: true,
        sharkFinHeightMm: 280,
        hasAnodizedTowHook: true,
        towHookColorHex: "#ef4444",
        hasUnderfloorStrakes: true,
      });

      expect(splitter).toBeInstanceOf(THREE.Group);
      expect(splitter.children.length).toBeGreaterThanOrEqual(3);
    });

    it("solves dynamic aerodynamic balance distribution and yaw damping", () => {
      const balance = ModularActiveAeroSplitterDiffuserAssembly.solveAeroBalance(
        {
          splitterExtensionMm: 180,
          splitterFlapAngleDeg: 20,
          hasRoofSharkFin: true,
          sharkFinHeightMm: 280,
          hasAnodizedTowHook: true,
          towHookColorHex: "#ef4444",
          hasUnderfloorStrakes: true,
        },
        3000,
        280
      );

      expect(balance.frontDownforceN).toBeGreaterThan(1500);
      expect(balance.aerodynamicBalanceFrontPct).toBeGreaterThan(30);
      expect(balance.yawStabilityDerivCnBeta).toBeCloseTo(0.082);
    });
  });

  // ==========================================================================
  // 7. PHASE 8 MASTER PRESETS & ASYNC GLB SERIALIZATION
  // ==========================================================================
  describe("GeneratePhase8ExteriorGlbSuite Pipeline", () => {
    it("builds all 4 master Phase 8 preset 3D scene hierarchies", () => {
      for (const preset of PHASE_8_PRESETS) {
        const scene = GeneratePhase8ExteriorGlbSuite.buildPresetScene(preset);
        expect(scene).toBeInstanceOf(THREE.Group);
        expect(scene.children.length).toBeGreaterThanOrEqual(8);
      }
    });

    it("asynchronously serializes Apex Valkyrie LMH to binary GLB buffer", async () => {
      const preset = PHASE_8_PRESETS[0];
      const scene = GeneratePhase8ExteriorGlbSuite.buildPresetScene(preset);

      const res = await UniversalGlbExporter.exportVehicleToGlb(scene, {
        binary: true,
        vehicleName: preset.name,
      });

      expect(res.buffer).toBeDefined();
      expect(res.buffer.byteLength).toBeGreaterThan(20000);
    }, 30000);
  });
});
