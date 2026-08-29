/**
 * ============================================================================
 * HYPER-FIDELITY INTERIOR & 3D GLB PHASE 5 MASTER TEST SUITE
 * ============================================================================
 * Comprehensive unit and integration verification for Phase 5 systems:
 * 1. Procedural Surface Microstructure & Anisotropic BRDF Engine
 * 2. Volumetric Cabin Atmosphere & Stefan-Boltzmann Solar Thermal Solver
 * 3. FIA GT3 Endurance Cockpit & Chrome-Moly Spaceframe Rollcage
 * 4. Coachbuilt VIP Partition Lounge & Cocktail Bar Suite
 * 5. Multi-Display Curved Quantum Dot Cockpit Blade & 3D HUD
 * 6. 3D Cabin Acoustic Raytracing & Psychoacoustics NVH Solver
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
import { ProceduralSurfaceMicrostructureEngine } from "../../../exterior3d/materials/proceduralSurfaceMicrostructureEngine";
import { CabinVolumetricAtmosphereEngine } from "../../../exterior3d/lighting/cabinVolumetricAtmosphereEngine";
import { EnduranceGt3CockpitGlbGenerator } from "../../../exterior3d/generators/interior/enduranceGt3CockpitGlbGenerator";
import { CoachbuiltVipLoungeBarGlbGenerator } from "../../../exterior3d/generators/interior/coachbuiltVipLoungeBarGlbGenerator";
import { QuantumDotCockpitBladeGlbGenerator } from "../../../exterior3d/generators/interior/quantumDotCockpitBladeGlbGenerator";
import { CabinAcousticRaytracingEngine } from "../cabinAcousticRaytracingEngine";
import { UniversalGlbExporter } from "../../../exterior3d/export/universalGlbExporter";

describe("Hyper-Fidelity Interior & 3D GLB Phase 5 Master Test Suite", () => {
  // ==========================================================================
  // 1. PROCEDURAL SURFACE MICROSTRUCTURE & ANISOTROPIC BRDF
  // ==========================================================================
  describe("ProceduralSurfaceMicrostructureEngine", () => {
    const engine = ProceduralSurfaceMicrostructureEngine.getInstance();

    it("synthesizes anisotropic fiber flow maps for Alcantara and Carbon Twill", () => {
      const anisoTex = engine.generateAnisotropicFiberFlowMap({
        materialType: "alcantara",
        tangentAngleRad: Math.PI * 0.25,
        roughnessX: 0.85,
        roughnessY: 0.45,
        anisotropyStrength: 0.9,
        sheenIntensity: 0.8,
        sheenColorHex: "#303030",
      }, 256);

      expect(anisoTex).toBeDefined();
      expect(anisoTex.wrapS).toBe(THREE.RepeatWrapping);
    });

    it("generates dual-tone French double stitch and herringbone seam normal maps", () => {
      const { normalMap, diffuseMap } = engine.generateStitchSeamTexture({
        stitchType: "french_double",
        threadColorHex: "#dfba73",
        secondaryThreadColorHex: "#ffffff",
        stitchSpacingMm: 5.0,
        stitchLengthMm: 3.5,
        threadThicknessMm: 0.8,
        creaseDepthMm: 1.2,
        tensionLevel: 0.85,
      }, 256);

      expect(normalMap).toBeDefined();
      expect(diffuseMap).toBeDefined();
      expect(normalMap.wrapT).toBe(THREE.RepeatWrapping);
    });

    it("generates cellular leather pore grain and contact wear roughness maps", () => {
      const poreGrainTex = engine.generateLeatherPoreGrainNormalMap({
        poreDensityPcm2: 450,
        wrinkleScale: 1.2,
        stretchFactorU: 1.5,
        stretchFactorV: 0.8,
        depthIntensity: 1.0,
        patinaWearFactor: 0.25,
      }, 256);

      const wearTex = engine.generateContactWearRoughnessMap(0.45, 256);

      expect(poreGrainTex).toBeDefined();
      expect(wearTex).toBeDefined();
    });
  });

  // ==========================================================================
  // 2. VOLUMETRIC CABIN ATMOSPHERE & SOLAR THERMAL PHYSICS
  // ==========================================================================
  describe("CabinVolumetricAtmosphereEngine", () => {
    const engine = CabinVolumetricAtmosphereEngine.getInstance();

    it("creates volumetric sun shafts and dust particle field", () => {
      const shaft = engine.createVolumetricSunShaftMesh(Math.PI * 0.3, 1.2, "#fff8e7");
      const dust = engine.createCabinDustParticleField(200);

      expect(shaft.name).toBe("Cabin_VolumetricSunShafts");
      expect(shaft.material).toBeInstanceOf(THREE.ShaderMaterial);
      expect(dust.name).toBe("Cabin_DustMoteParticles");
      expect(dust.geometry.attributes.position.count).toBe(200);
    });

    it("calculates localized surface equilibrium temperatures under direct solar flux", () => {
      const analysis = engine.calculateThermalHotspots({
        sunZenithAngleRad: 0.35,
        sunAzimuthAngleRad: 1.2,
        directNormalIrradianceW_m2: 980,
        ambientTemperatureC: 32.0,
        windshieldShgcFactor: 0.45,
        electrochromicRoofTintFactor: 0.15,
        dustParticleDensity: 0.2,
      });

      expect(analysis.dashboardSurfaceTempC).toBeGreaterThan(45.0);
      expect(analysis.steeringWheelUpperRimTempC).toBeGreaterThan(40.0);
      expect(analysis.solarHeatFluxTransmittedWatts).toBeGreaterThan(500);
      expect(analysis.cabinAirMeanRadiantTempC).toBeGreaterThan(32.0);
    });

    it("builds dual-zone panoramic roof prismatic edge halo", () => {
      const halo = engine.createPanoramicGlassPerimeterHalo(1.1, 1.4, "#00f0ff");
      expect(halo.name).toBe("PanoramicRoof_PrismaticEdgeHalo");
      expect(halo.children.length).toBeGreaterThanOrEqual(5);
    });
  });

  // ==========================================================================
  // 3. ENDURANCE GT3 COCKPIT & FIA SPACEFRAME ROLLCAGE
  // ==========================================================================
  describe("EnduranceGt3CockpitGlbGenerator", () => {
    it("builds FIA Article 253 compliant spaceframe rollcage and safety nets", () => {
      const gt3Cockpit = EnduranceGt3CockpitGlbGenerator.buildEnduranceGt3CockpitGroup({
        rollcageColorHex: "#e63946",
        hasWindowSafetyNets: true,
        hasHelmetCoolingDuct: true,
        hasSmartOledMirror: true,
      });

      expect(gt3Cockpit.name).toBe("EnduranceGt3_Cockpit_Subassembly_Root");

      let rollcageFound = false;
      let netFound = false;
      let coolingFound = false;
      let switchFound = false;

      gt3Cockpit.traverse((child) => {
        if (child.name === "FIA_Rollcage_Structure") rollcageFound = true;
        if (child.name === "Driver_SafetyNet_Assembly") netFound = true;
        if (child.name === "Helmet_Cooling_Conduit_System") coolingFound = true;
        if (child.name === "GT3_MilitarySwitchPanel") switchFound = true;
      });

      expect(rollcageFound).toBe(true);
      expect(netFound).toBe(true);
      expect(coolingFound).toBe(true);
      expect(switchFound).toBe(true);
    });
  });

  // ==========================================================================
  // 4. COACHBUILT VIP PARTITION LOUNGE & COCKTAIL BAR
  // ==========================================================================
  describe("CoachbuiltVipLoungeBarGlbGenerator", () => {
    it("builds solid billet champagne dispenser, fold-out desk, and tourbillon clock", () => {
      const vipLounge = CoachbuiltVipLoungeBarGlbGenerator.buildCoachbuiltVipLoungeGroup({
        primaryLeather: "semi_aniline_leather",
        woodVeneerType: "open_pore_walnut",
        barCabinetDeployed: true,
        deskTableDeployed: true,
        hasTourbillonClock: true,
        hasUmbrellaDispenser: true,
      });

      expect(vipLounge.name).toBe("Coachbuilt_VipLoungeBar_Subassembly_Root");

      let barFound = false;
      let deskFound = false;
      let clockFound = false;
      let umbrellaFound = false;

      vipLounge.traverse((child) => {
        if (child.name === "Vip_CocktailBar_Console") barFound = true;
        if (child.name.includes("ExecutiveDesk")) deskFound = true;
        if (child.name === "Coachbuilt_SwissTourbillon_Clock") clockFound = true;
        if (child.name.includes("UmbrellaConduit")) umbrellaFound = true;
      });

      expect(barFound).toBe(true);
      expect(deskFound).toBe(true);
      expect(clockFound).toBe(true);
      expect(umbrellaFound).toBe(true);
    });
  });

  // ==========================================================================
  // 5. CURVED QUANTUM DOT COCKPIT BLADE & 3D AR HUD
  // ==========================================================================
  describe("QuantumDotCockpitBladeGlbGenerator", () => {
    it("builds 55-inch curved monolithic blade with 3 OLED active displays and AR HUD", () => {
      const blade = QuantumDotCockpitBladeGlbGenerator.buildQuantumDotBladeGroup({
        bladeWidthM: 1.42,
        hasArHudProjector: true,
        hasDriverMonitoringSystem: true,
        hasPassengerDisplay: true,
      });

      expect(blade.name).toBe("QuantumDot_CockpitBlade_Subassembly_Root");

      let monolithicFound = false;
      let hudFound = false;
      let dmsFound = false;

      blade.traverse((child) => {
        if (child.name === "Curved_Monolithic_Glass_Assembly") monolithicFound = true;
        if (child.name === "AugmentedReality_3D_HUD_System") hudFound = true;
        if (child.name === "Driver_Monitoring_Infrared_Camera") dmsFound = true;
      });

      expect(monolithicFound).toBe(true);
      expect(hudFound).toBe(true);
      expect(dmsFound).toBe(true);
    });
  });

  // ==========================================================================
  // 6. CABIN ACOUSTICS RAYTRACING & PSYCHOACOUSTICS NVH
  // ==========================================================================
  describe("CabinAcousticRaytracingEngine", () => {
    const engine = CabinAcousticRaytracingEngine.getInstance();

    it("evaluates Eyring multi-octave reverberation time (RT60) and speech transmission index", () => {
      const result = engine.simulateCabinAcoustics({
        cabinVolumeM3: 3.85,
        seatingMaterial: "perforated_alcantara_foam",
        headlinerMaterial: "starlight_headliner_felt",
        hasActiveNoiseCancellation: true,
        speakerChannelCount: 28,
      });

      expect(result.cabinVolumeM3).toBe(3.85);
      expect(result.reverberationTimeRt60Sec).toBeGreaterThan(0.04);
      expect(result.reverberationTimeRt60Sec).toBeLessThan(0.35); // Realistic automotive cabin RT60
      expect(result.speechTransmissionIndexSti).toBeGreaterThan(0.70); // Excellent speech clarity
      expect(result.activeNoiseCancellationAttenDb).toBeLessThan(-10.0);
      expect(result.driverSweetSpotScore).toBeGreaterThan(80);
      expect(result.octaveBandRt60.hz1000).toBeGreaterThan(0);
    });
  });

  // ==========================================================================
  // 7. UNIVERSAL GLB BINARY SERIALIZER & EXPORT
  // ==========================================================================
  describe("UniversalGlbExporter Integration", () => {
    it("asynchronously exports complex GT3 Endurance assembly to valid binary GLB buffer", async () => {
      const gt3 = EnduranceGt3CockpitGlbGenerator.buildEnduranceGt3CockpitGroup();
      const exportResult = await UniversalGlbExporter.exportVehicleToGlb(gt3, {
        binary: true,
        vehicleName: "EnduranceGT3_TestAssembly",
      });

      expect(exportResult.buffer).toBeInstanceOf(ArrayBuffer);
      expect(exportResult.byteLength).toBeGreaterThan(1000);
      expect(exportResult.filename).toContain(".glb");
    }, 25000);
  });
});
