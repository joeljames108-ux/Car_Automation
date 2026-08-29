/**
 * ============================================================================
 * HYPER-FIDELITY EXTERIOR 3D GLB & AERODYNAMICS PHASE 5 MASTER TEST SUITE
 * ============================================================================
 * Comprehensive unit and integration verification for Phase 5 exterior systems:
 * 1. Class-A Surfacing & Micro-Panel Topology CAD Engine
 * 2. Active Morphing Aerodynamics & Real-Time CFD Polar Solver
 * 3. DMD Matrix Optical Headlights & 3D OLED Light Blade
 * 4. Forged Aero Wheels, C/SiC Carbon Ceramic Brakes & Tires
 * 5. SPD Electrochromic Smart Glass & Photovoltaic Solar Roof
 * 6. Procedural Multi-Layer Paint, Carbon Weaves & Weathering Maps
 * 7. Universal GLB Binary Serializer & Assembly Validation
 * ============================================================================
 */

import { describe, it, expect } from "vitest";
import * as THREE from "three";

if (typeof globalThis !== "undefined" && typeof (globalThis as any).FileReader === "undefined") {
  class NodeFileReader {
    result: ArrayBuffer | null = null;
    onload: (() => void) | null = null;
    onloadend: (() => void) | null = null;
    async readAsArrayBuffer(blob: any) {
      this.result = blob && typeof blob.arrayBuffer === "function" ? await blob.arrayBuffer() : new ArrayBuffer(0);
      if (this.onload) this.onload();
      if (this.onloadend) this.onloadend();
    }
  }
  // @ts-ignore
  globalThis.FileReader = NodeFileReader;
}

import { HyperFidelityExteriorBodyTopologyCad } from "../geometry/hyperFidelityExteriorBodyTopologyCad";
import { ActiveMorphingAeroCadEngine } from "../aerodynamics/activeMorphingAeroCadEngine";
import { HyperFidelityOpticalLightingGlbGenerator } from "../generators/hyperFidelityOpticalLightingGlbGenerator";
import { ForgedAeroWheelBrakeTireCadGenerator } from "../generators/forgedAeroWheelBrakeTireCadGenerator";
import { SmartGlassAeroCoatingsSystem } from "../materials/smartGlassAeroCoatingsSystem";
import { ProceduralExteriorCoatingsEngine } from "../materials/proceduralExteriorCoatingsEngine";
import { GenerateExpandedExteriorGlbAssets } from "../../sim/modularVehicle/generateExpandedExteriorGlbAssets";
import { UniversalGlbExporter } from "../export/universalGlbExporter";

describe("Hyper-Fidelity Exterior 3D GLB & Aerodynamics Phase 5 Master Test Suite", () => {
  // ==========================================================================
  // 1. CLASS-A BODY TOPOLOGY & WIDEBODY CAD ENGINE
  // ==========================================================================
  describe("HyperFidelityExteriorBodyTopologyCad", () => {
    it("generates Class-A body shell with DTM louvers, roof snorkel, and dihedral doors", () => {
      const body = HyperFidelityExteriorBodyTopologyCad.buildExteriorBodySubassembly({
        typologyStyle: "hypercar_apex_prototype",
        primaryPaintColorHex: 0x00f0ff,
        hasDtmFenderLouvers: true,
        hasRoofSnorkel: true,
        hasSharkFinStabilizer: false,
      });

      expect(body.name).toBe("HyperFidelity_ExteriorBody_Subassembly_Root");

      let bonnetFound = false;
      let fenderFound = false;
      let roofFound = false;
      let doorsFound = false;

      body.traverse((child) => {
        if (child.name === "ClassA_Bonnet_Assembly") bonnetFound = true;
        if (child.name === "Widebody_FlaredFenders_Assembly") fenderFound = true;
        if (child.name === "Sculpted_Roof_Canopy_Assembly") roofFound = true;
        if (child.name.includes("SculptedDoors")) doorsFound = true;
      });

      expect(bonnetFound).toBe(true);
      expect(fenderFound).toBe(true);
      expect(roofFound).toBe(true);
      expect(doorsFound).toBe(true);
    });
  });

  // ==========================================================================
  // 2. ACTIVE MORPHING AERODYNAMICS & CFD POLAR MATH
  // ==========================================================================
  describe("ActiveMorphingAeroCadEngine", () => {
    const engine = ActiveMorphingAeroCadEngine.getInstance();

    it("generates active swan-neck rear wing and underbody Venturi floor", () => {
      const aero = ActiveMorphingAeroCadEngine.buildActiveAeroAssembly({
        wingAngleDeg: 14,
        drsActive: false,
        hasCanardArray: true,
        hasRearDiffuserVanes: true,
      });

      expect(aero.name).toBe("ActiveMorphing_Aerodynamics_Assembly_Root");

      let wingFound = false;
      let venturiFound = false;
      let splitterFound = false;

      aero.traverse((child) => {
        if (child.name === "Active_MultiElement_RearWing_Group") wingFound = true;
        if (child.name === "Underbody_Venturi_GroundEffect_System") venturiFound = true;
        if (child.name === "Active_FrontSplitter_Canards_Assembly") splitterFound = true;
      });

      expect(wingFound).toBe(true);
      expect(venturiFound).toBe(true);
      expect(splitterFound).toBe(true);
    });

    it("computes aerodynamic downforce, drag, and L/D ratios across DRS states", () => {
      // Standard Downforce Mode at 250 km/h
      const downforceTelem = engine.evaluateAeroTelemetry({
        drsDeployed: false,
        wingAngleDeg: 22,
        airbrakeDeployed: false,
        activeFlapsOpenPercent: 100,
        underbodyRideHeightMm: 45,
        speedKmh: 250,
      });

      expect(downforceTelem.downforceN).toBeGreaterThan(4000);
      expect(downforceTelem.liftToDragRatio).toBeGreaterThan(1.8);
      expect(downforceTelem.frontAeroBalancePercent).toBeGreaterThan(30);

      // DRS High-Speed Mode at 320 km/h
      const drsTelem = engine.evaluateAeroTelemetry({
        drsDeployed: true,
        wingAngleDeg: 8,
        airbrakeDeployed: false,
        activeFlapsOpenPercent: 50,
        underbodyRideHeightMm: 40,
        speedKmh: 320,
      });

      expect(drsTelem.totalCd).toBeLessThan(downforceTelem.totalCd);
    });
  });

  // ==========================================================================
  // 3. OPTICAL LIGHTING & 3D OLED MATRIX
  // ==========================================================================
  describe("HyperFidelityOpticalLightingGlbGenerator", () => {
    it("builds DMD matrix headlights with laser core and 3D OLED light blade", () => {
      const lights = HyperFidelityOpticalLightingGlbGenerator.buildOpticalLightingGroup({
        hasLaserHighBeam: true,
        hasSequentialOledTaillights: true,
      });

      expect(lights.name).toBe("HyperFidelity_OpticalLighting_Subassembly_Root");

      let frontFound = false;
      let rearFound = false;

      lights.traverse((child) => {
        if (child.name === "Front_DmdMatrix_Headlights_Cluster") frontFound = true;
        if (child.name === "Rear_3DOled_LightBlade_Assembly") rearFound = true;
      });

      expect(frontFound).toBe(true);
      expect(rearFound).toBe(true);
    });
  });

  // ==========================================================================
  // 4. FORGED ROLLING GEAR & C/SiC BRAKES
  // ==========================================================================
  describe("ForgedAeroWheelBrakeTireCadGenerator", () => {
    it("generates 4-corner staggered wheel assembly with C/SiC discs and Michelin Cup 2R tires", () => {
      const rollingGear = ForgedAeroWheelBrakeTireCadGenerator.buildFullVehicleRollingGearGroup(2.75, 1.72, {
        wheelStyle: "forged_turbofan_aero",
        caliperPistons: 10,
      });

      expect(rollingGear.name).toBe("FullVehicle_RollingGear_Subassembly_Root");
      expect(rollingGear.children.length).toBe(4); // 4 corners

      let flTireFound = false;
      let flBrakeFound = false;

      rollingGear.traverse((child) => {
        if (child.name === "Tire_Cup2R_Assembly") flTireFound = true;
        if (child.name === "CSiC_Brake_Assembly") flBrakeFound = true;
      });

      expect(flTireFound).toBe(true);
      expect(flBrakeFound).toBe(true);
    });
  });

  // ==========================================================================
  // 5. SMART ELECTROCHROMIC GLASS & SOLAR ROOF
  // ==========================================================================
  describe("SmartGlassAeroCoatingsSystem", () => {
    const engine = SmartGlassAeroCoatingsSystem.getInstance();

    it("generates electrochromic SPD glass material with dynamic transmittance", () => {
      const glassMat = engine.createElectrochromicMaterial(0.2); // 20% tint
      expect(glassMat.transmission).toBeGreaterThan(0.15);
      expect(glassMat.transmission).toBeLessThan(0.40);
    });

    it("calculates solar roof photovoltaic power generation and thermal SHGC", () => {
      const perf = engine.calculateSolarPerformance({
        spdVoltagePercent: 0.5,
        solarRoofEnabled: true,
        rainDropletsDensity: 0.0,
        windVelocityKmh: 120,
        irHeatRejectionFactor: 0.92,
      });

      expect(perf.solarPowerWatts).toBeGreaterThan(250);
      expect(perf.uvRejectionPercent).toBeGreaterThan(99.0);
      expect(perf.auxiliaryAirConditioningRuntimeHours).toBeGreaterThan(3.0);
    });
  });

  // ==========================================================================
  // 6. PROCEDURAL MULTI-LAYER PAINT & CARBON COMPOSITES
  // ==========================================================================
  describe("ProceduralExteriorCoatingsEngine", () => {
    const engine = ProceduralExteriorCoatingsEngine.getInstance();

    it("synthesizes 2x2 twill carbon fiber weave and track weathering maps", () => {
      const carbonTex = engine.generateCarbonWeaveNormalMap("2x2_twill", 256);
      const weatherTex = engine.generateTrackWeatheringMap(0.5, 0.6, 256);

      expect(carbonTex).toBeDefined();
      expect(weatherTex).toBeDefined();
      expect(carbonTex.wrapS).toBe(THREE.RepeatWrapping);
    });
  });

  // ==========================================================================
  // 7. EXPANDED EXTERIOR GLB GENERATOR PIPELINE
  // ==========================================================================
  describe("GenerateExpandedExteriorGlbAssets Integration", () => {
    it("asynchronously builds and exports Master Hypercar Apex GT3 scene to valid binary GLB", async () => {
      const scene = GenerateExpandedExteriorGlbAssets.buildSceneGraph("hypercar_apex_gt3");
      const buffer = await GenerateExpandedExteriorGlbAssets.exportGlbBufferAsync(scene);

      expect(buffer).toBeInstanceOf(ArrayBuffer);
      expect(buffer.byteLength).toBeGreaterThan(5000);
    }, 25000);
  });
});
