/**
 * ============================================================================
 * HYPER COCKPIT MASTER PHASE EXPANSION UNIT TESTS
 * ============================================================================
 */

import { describe, it, expect } from "vitest";
import * as THREE from "three";
import { InteriorBakedLightingEngine } from "../../../exterior3d/lighting/interiorBakedLightingEngine";
import {
  ElectrochromicRoofShader,
  HyperOledGlassShader,
  FramelessMirrorShader,
  DynamicStarlightHeadlinerShader,
} from "../../../exterior3d/shaders/cockpitHyperShaders";
import { HypercarAeroCockpitGlbGenerator } from "../../../exterior3d/generators/interior/hypercarAeroCockpitGlbGenerator";
import { ExecutiveRearLoungeGlbGenerator } from "../../../exterior3d/generators/interior/executiveRearLoungeGlbGenerator";
import { CockpitKinematicsPhysicsEngine } from "../cockpitKinematicsPhysicsEngine";
import { InteractiveCockpitHmiOs } from "../../../exterior3d/generators/interior/interactiveCockpitHmiOs";

describe("Hyper Cockpit & Interior GLB Master Expansion Suite", () => {
  // ==========================================================================
  // 1. BAKED LIGHTING & IRRADIANCE ENGINE
  // ==========================================================================
  describe("InteriorBakedLightingEngine", () => {
    it("creates multi-fixture studio lighting rigs across all 6 moods", () => {
      const engine = InteriorBakedLightingEngine.getInstance();
      const moods = [
        "studio_neutral_clean",
        "warm_sunset_golden",
        "cyberpunk_neon_edge",
        "obsidian_dark_stealth",
        "hypercar_track_daylight",
        "bespoke_luxury_salon",
      ] as const;

      for (const mood of moods) {
        const rig = engine.createCockpitLightingRig({
          mood,
          intensityScale: 1.2,
          enableFootwellWash: true,
          enableRoofAmbientStrip: true,
          enableIrradianceProbes: true,
        });

        expect(rig).toBeDefined();
        expect(rig.children.length).toBeGreaterThan(3);
      }
    });

    it("samples irradiance color from 3D probe volume grid", () => {
      const engine = InteriorBakedLightingEngine.getInstance();
      const sample = engine.sampleIrradianceAtPosition(new THREE.Vector3(0, 0.5, 0));
      expect(sample).toBeDefined();
      expect(sample.r).toBeGreaterThanOrEqual(0);
      expect(sample.g).toBeGreaterThanOrEqual(0);
      expect(sample.b).toBeGreaterThanOrEqual(0);
    });

    it("synthesizes soft contact shadow plane meshes with valid textures", () => {
      const engine = InteriorBakedLightingEngine.getInstance();
      const shadowPlane = engine.createContactShadowPlane({
        width: 0.8,
        length: 1.2,
        opacity: 0.75,
      });

      expect(shadowPlane).toBeDefined();
      expect(shadowPlane.geometry).toBeInstanceOf(THREE.PlaneGeometry);
      expect(shadowPlane.material).toBeDefined();
    });

    it("computes vertex ambient occlusion attributes on buffer geometry", () => {
      const engine = InteriorBakedLightingEngine.getInstance();
      const boxGeo = new THREE.BoxGeometry(1, 1, 1);
      engine.bakeVertexAmbientOcclusion(boxGeo, 1.2, 0.3);

      const colorAttr = boxGeo.getAttribute("color");
      expect(colorAttr).toBeDefined();
      expect(colorAttr.count).toBe(boxGeo.getAttribute("position")!.count);
    });
  });

  // ==========================================================================
  // 2. COCKPIT HYPER-SHADERS
  // ==========================================================================
  describe("CockpitHyperShaders", () => {
    it("creates valid electrochromic smart glass shader material", () => {
      const mat = ElectrochromicRoofShader.createMaterial("#0a1525", 0.7);
      expect(mat).toBeInstanceOf(THREE.ShaderMaterial);
      expect(mat.uniforms.uOpacity.value).toBe(0.7);
      expect(mat.uniforms.uHexScale.value).toBe(45.0);
    });

    it("creates valid hyper-OLED anti-reflective screen material", () => {
      const mat = HyperOledGlassShader.createMaterial(null);
      expect(mat).toBeInstanceOf(THREE.ShaderMaterial);
      expect(mat.uniforms.uBrightness.value).toBe(1.25);
      expect(mat.uniforms.uParallaxDepth.value).toBe(0.08);
    });

    it("creates valid frameless planar reflection mirror material", () => {
      const mat = FramelessMirrorShader.createMaterial(true);
      expect(mat).toBeInstanceOf(THREE.ShaderMaterial);
      expect(mat.uniforms.uAntiDazzleDimming.value).toBe(0.8);
    });

    it("creates valid dynamic starlight headliner material", () => {
      const mat = DynamicStarlightHeadlinerShader.createMaterial("#00f0ff");
      expect(mat).toBeInstanceOf(THREE.ShaderMaterial);
      expect(mat.uniforms.uStarDensity.value).toBe(38.0);
      expect(mat.uniforms.uTwinkleSpeed.value).toBe(2.2);
    });
  });

  // ==========================================================================
  // 3. HYPERCAR AERO COCKPIT GLB GENERATOR
  // ==========================================================================
  describe("HypercarAeroCockpitGlbGenerator", () => {
    it("builds complete Formula 1 / Le Mans Hypercar cockpit with Titanium Halo", () => {
      const group = HypercarAeroCockpitGlbGenerator.buildHypercarCockpitGroup({
        haloEnabled: true,
        haloMaterial: "raw_titanium",
        primaryCarbonType: "3k_twill_carbon_fiber",
        hasRoofSnorkel: true,
        hasFireSuppressionSystem: true,
      });

      expect(group).toBeInstanceOf(THREE.Group);
      expect(group.name).toBe("Hypercar_AeroCockpit_Subassembly_Root");

      // Verify sub-assemblies present
      const halo = group.getObjectByName("FIA_Titanium_Halo_Assembly");
      const tub = group.getObjectByName("Carbon_Monocoque_Tub");
      const qrHub = group.getObjectByName("Steering_QuickRelease_Hub");
      const snorkel = group.getObjectByName("Roof_Airbox_SnorkelConduit");
      const fire = group.getObjectByName("FIA_FireSuppression_Plumbing");

      expect(halo).toBeDefined();
      expect(tub).toBeDefined();
      expect(qrHub).toBeDefined();
      expect(snorkel).toBeDefined();
      expect(fire).toBeDefined();
    });
  });

  // ==========================================================================
  // 4. EXECUTIVE REAR LOUNGE GLB GENERATOR
  // ==========================================================================
  describe("ExecutiveRearLoungeGlbGenerator", () => {
    it("builds ultra-luxury executive rear lounge with 8K theater screen & privacy wall", () => {
      const group = ExecutiveRearLoungeGlbGenerator.buildExecutiveLoungeGroup({
        primaryMaterial: "semi_aniline_leather",
        woodTrimMaterial: "open_pore_walnut",
        theaterScreenDeployed: true,
        privacyPartitionClosed: true,
      });

      expect(group).toBeInstanceOf(THREE.Group);
      expect(group.name).toBe("Executive_RearLounge_Subassembly_Root");

      const screen = group.getObjectByName("Motorized_TheaterScreen_Assembly");
      const partition = group.getObjectByName("Chauffeur_PrivacyPartition_Wall");
      const leftSeat = group.getObjectByName("RearSeat_Left");
      const rightSeat = group.getObjectByName("RearSeat_Right");
      const waterfall = group.getObjectByName("Executive_CenterWaterfall_Console");

      expect(screen).toBeDefined();
      expect(partition).toBeDefined();
      expect(leftSeat).toBeDefined();
      expect(rightSeat).toBeDefined();
      expect(waterfall).toBeDefined();
    });
  });

  // ==========================================================================
  // 5. COCKPIT KINEMATICS PHYSICS ENGINE
  // ==========================================================================
  describe("CockpitKinematicsPhysicsEngine", () => {
    it("solves glovebox viscous soft-drop damper physics over time steps", () => {
      const engine = CockpitKinematicsPhysicsEngine.getInstance();
      let state = {
        isOpen: false,
        openProgress: 0.0,
        angularVelocityRadPerSec: 0.0,
      };

      // Step forward 10 frames opening
      for (let f = 0; f < 10; f++) {
        state = engine.stepGloveboxDamper(state, true, 0.05);
      }
      expect(state.openProgress).toBeGreaterThan(0.0);
      expect(state.openProgress).toBeLessThanOrEqual(1.0);
    });

    it("updates motorized HVAC oscillating louvers", () => {
      const engine = CockpitKinematicsPhysicsEngine.getInstance();
      const defaultState = engine.createDefaultState();
      const osc = engine.updateHvacOscillation(defaultState.hvacLouvers, 1.5);

      expect(osc.driverVentHorizontalDeg).toBeDefined();
      expect(osc.driverVentVerticalDeg).toBeDefined();
      expect(Math.abs(osc.driverVentHorizontalDeg)).toBeLessThanOrEqual(35.0);
    });

    it("calculates H-point spatial offset from 24-way seat positions", () => {
      const engine = CockpitKinematicsPhysicsEngine.getInstance();
      const defaultState = engine.createDefaultState();
      const offset = engine.calculateHPointOffset(defaultState.driverSeat);

      expect(offset).toHaveProperty("x");
      expect(offset).toHaveProperty("y");
      expect(offset).toHaveProperty("z");
    });
  });

  // ==========================================================================
  // 6. INTERACTIVE COCKPIT HMI OS
  // ==========================================================================
  describe("InteractiveCockpitHmiOs", () => {
    it("renders dynamic telemetry and dispatches touch events", () => {
      const hmi = new InteractiveCockpitHmiOs(512, 256);
      expect(hmi.getTexture()).toBeDefined();

      hmi.render(
        {
          speedKmh: 180,
          rpm: 6500,
          gear: "4",
          batterySocPercent: 82,
          batteryPowerKw: 420,
          tireTempsC: [88, 89, 92, 91],
          tirePressuresBar: [2.2, 2.2, 2.3, 2.3],
          latG: 1.15,
          longG: 0.45,
          steeringAngleDeg: 12.5,
          cabinTempDriverC: 21.0,
          cabinTempPassC: 22.0,
        },
        1.0
      );

      expect(hmi.getActiveTab()).toBe("telemetry");

      // Test UV touch on navigation tab (second tab: u ~ 0.3)
      const clickedTab = hmi.handleTouchAtUv(0.3, 0.95);
      expect(clickedTab).toBe("navigation");
      expect(hmi.getActiveTab()).toBe("navigation");
    });
  });
});
