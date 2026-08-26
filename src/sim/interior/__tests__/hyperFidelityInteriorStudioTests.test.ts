// ============================================================================
// HYPER-FIDELITY AUTOMOTIVE INTERIOR STUDIO ENGINEERING UNIT TESTS
// ============================================================================
// Validates 3D CAD mesh generation, material synthesis, acoustic NVH & ANC simulation,
// SAE J1100 ergonomics posture solver, and binary GLB asset exporter pipelines.
// ============================================================================

import { describe, it, expect } from "vitest";
import * as THREE from "three";

if (typeof globalThis !== 'undefined' && typeof (globalThis as any).FileReader === 'undefined') {
  class NodeFileReader {
    result: ArrayBuffer | null = null;
    onloadend: (() => void) | null = null;
    async readAsArrayBuffer(blob: Blob) {
      this.result = await blob.arrayBuffer();
      if (this.onloadend) this.onloadend();
    }
  }
  // @ts-ignore
  globalThis.FileReader = NodeFileReader;
}
import { HyperFidelityInteriorCadEngine } from "../../../exterior3d/generators/interior/hyperFidelityInteriorCadEngine";
import { InteriorMaterialPbrSynthesizer } from "../../../exterior3d/materials/interiorMaterialPbrSynthesizer";
import { InteriorAcousticThermalSimulator } from "../interiorAcousticThermalSimulator";
import { InteriorErgonomicsBiometricsEngine } from "../interiorErgonomicsBiometricsEngine";
import { UniversalGlbExporter } from "../../../exterior3d/export/universalGlbExporter";
import { DEFAULT_BESPOKE_STATE } from "../../../components/interior/BespokeLuxuryInteriorStudioHub";

describe("HyperFidelityInteriorStudioEngine", () => {

  // 1. 3D CAD Mesh Engine & Subassembly Hierarchies
  describe("HyperFidelityInteriorCadEngine", () => {
    it("generates a complete 3D interior CAD hierarchy with valid metadata tags", () => {
      const root = HyperFidelityInteriorCadEngine.buildFullInteriorCad(DEFAULT_BESPOKE_STATE, 0.10, 0.20, 15.0);
      expect(root).toBeInstanceOf(THREE.Group);
      expect(root.name).toContain("InteriorCad_Root");
      expect(root.children.length).toBeGreaterThanOrEqual(8);

      // Check component metadata tags
      let taggedCount = 0;
      root.traverse((child) => {
        if (child.userData?.metadata) {
          taggedCount++;
          expect(child.userData.metadata.massKg).toBeGreaterThan(0);
          expect(child.userData.metadata.triangleCount).toBeGreaterThan(0);
        }
      });
      expect(taggedCount).toBeGreaterThan(0);
    });

    it("builds carbon monocoque tub and floorpan geometry", () => {
      const tub = HyperFidelityInteriorCadEngine.buildMonocoqueTub(DEFAULT_BESPOKE_STATE, 0.81, 2.75, 0.0);
      expect(tub).toBeInstanceOf(THREE.Group);
      expect(tub.name).toBe("CAD_MonocoqueTub");
      expect(tub.children.length).toBeGreaterThanOrEqual(4);
    });

    it("builds dashboard assembly with curved screen blade", () => {
      const dash = HyperFidelityInteriorCadEngine.buildDashboardAssembly(DEFAULT_BESPOKE_STATE, 0.81, 0.0);
      expect(dash).toBeInstanceOf(THREE.Group);
      expect(dash.name).toBe("CAD_DashboardAssembly");
      expect(dash.children.length).toBeGreaterThanOrEqual(5);
    });

    it("builds GT3 carbon yoke and paddle shifter assembly", () => {
      const steering = HyperFidelityInteriorCadEngine.buildSteeringAssembly(DEFAULT_BESPOKE_STATE, 0.35, 0.0);
      expect(steering).toBeInstanceOf(THREE.Group);
      expect(steering.name).toBe("CAD_SteeringAssembly");
      expect(steering.children.length).toBeGreaterThanOrEqual(3);
    });

    it("builds driver and passenger sport bucket seats with 6-point harness", () => {
      const seating = HyperFidelityInteriorCadEngine.buildSeatingSystem(DEFAULT_BESPOKE_STATE, 0.81, 0.0);
      expect(seating).toBeInstanceOf(THREE.Group);
      expect(seating.name).toBe("CAD_SeatingSystem");
      expect(seating.children.length).toBe(2);
    });

    it("builds crystal rotary dial center console and armrest vault", () => {
      const consoleGroup = HyperFidelityInteriorCadEngine.buildCenterConsoleAssembly(DEFAULT_BESPOKE_STATE, 0.0);
      expect(consoleGroup).toBeInstanceOf(THREE.Group);
      expect(consoleGroup.name).toBe("CAD_CenterConsole");
      expect(consoleGroup.children.length).toBeGreaterThanOrEqual(5);
    });

    it("builds left and right acoustic door cards", () => {
      const doors = HyperFidelityInteriorCadEngine.buildDoorCardAssemblies(DEFAULT_BESPOKE_STATE, 0.81, 25.0, 0.0);
      expect(doors).toBeInstanceOf(THREE.Group);
      expect(doors.name).toBe("CAD_DoorPanels");
      expect(doors.children.length).toBe(2);
    });

    it("builds billet hydraulic pedal box assembly", () => {
      const pedals = HyperFidelityInteriorCadEngine.buildPedalBoxAssembly(DEFAULT_BESPOKE_STATE, 0.0);
      expect(pedals).toBeInstanceOf(THREE.Group);
      expect(pedals.name).toBe("CAD_PedalBox");
      expect(pedals.children.length).toBeGreaterThanOrEqual(4);
    });

    it("builds FIA chromoly roll cage and starlight roof headliner", () => {
      const safety = HyperFidelityInteriorCadEngine.buildSafetyAndRoofAssembly(DEFAULT_BESPOKE_STATE, 0.81, 0.0);
      expect(safety).toBeInstanceOf(THREE.Group);
      expect(safety.name).toBe("CAD_SafetyAndRoof");
      expect(safety.children.length).toBeGreaterThanOrEqual(3);
    });
  });

  // 2. Interior Material PBR Synthesizer
  describe("InteriorMaterialPbrSynthesizer", () => {
    it("creates custom PBR physical materials with sheen and clearcoat", () => {
      const synth = InteriorMaterialPbrSynthesizer.getInstance();
      const mat = synth.createPbrMaterial({
        id: "Test_Leather_01",
        name: "Test Leather",
        materialType: "nappa_leather",
        baseColorHex: "#1e293b",
        roughness: 0.65,
        metalness: 0.04,
        clearcoat: 0.15,
        clearcoatRoughness: 0.45,
        sheen: 0.3,
        sheenColorHex: "#334155",
        sheenRoughness: 0.6,
        transmission: 0,
        ior: 1.5,
        bumpScale: 0.3,
        envMapIntensity: 0.4,
      });

      expect(mat).toBeInstanceOf(THREE.MeshPhysicalMaterial);
      expect(mat.roughness).toBe(0.65);
      expect(mat.clearcoat).toBe(0.15);
      expect(mat.sheen).toBe(0.3);
    });

    it("synthesizes full theme material palette for upholstery, trim, and stitching", () => {
      const synth = InteriorMaterialPbrSynthesizer.getInstance();
      const palette = synth.synthesizeThemeMaterials(DEFAULT_BESPOKE_STATE.materials);

      expect(palette.primaryUpholsteryMat).toBeInstanceOf(THREE.MeshPhysicalMaterial);
      expect(palette.secondaryUpholsteryMat).toBeInstanceOf(THREE.MeshPhysicalMaterial);
      expect(palette.trimAccentMat).toBeInstanceOf(THREE.MeshPhysicalMaterial);
      expect(palette.carpetMat).toBeInstanceOf(THREE.MeshStandardMaterial);
      expect(palette.headlinerMat).toBeInstanceOf(THREE.MeshStandardMaterial);
      expect(palette.stitchingColor).toBeInstanceOf(THREE.Color);
    });
  });

  // 3. Cabin Acoustics, Thermal & ANC Active Simulator
  describe("InteriorAcousticThermalSimulator", () => {
    it("simulates cabin acoustics reverberation T60, SPL dBA, and ANC attenuation", () => {
      const result = InteriorAcousticThermalSimulator.simulateCabinAcoustics(DEFAULT_BESPOKE_STATE, 4200, 120, true);

      expect(result.reverberationTimeT60Sec).toBeGreaterThan(0.05);
      expect(result.reverberationTimeT60Sec).toBeLessThan(0.80);
      expect(result.driverEarSplDba).toBeGreaterThan(30);
      expect(result.driverEarSplDba).toBeLessThan(100);
      expect(result.ancAttenuationDb).toBeGreaterThan(5.0); // ANC is effective
      expect(result.speechIntelligibilityIndex).toBeGreaterThan(0.50);
      expect(result.soundQualityScoreZwicker).toBeGreaterThan(40);
    });

    it("simulates 4-zone HVAC climate equilibrium and solar heat load", () => {
      const thermal = InteriorAcousticThermalSimulator.simulateCabinThermal(DEFAULT_BESPOKE_STATE, 38.0, 21.5, 850, 5);

      expect(thermal.solarHeatLoadWatts).toBeGreaterThan(100);
      expect(thermal.hvacCoolingPowerKw).toBeGreaterThan(3.0);
      expect(thermal.timeToTargetTempSec).toBeGreaterThan(10);
      expect(thermal.driverZoneTempC).toBeCloseTo(21.7, 1);
    });
  });

  // 4. Driver Ergonomics & Biometrics Posture Solver
  describe("InteriorErgonomicsBiometricsEngine", () => {
    it("solves SAE J1100 H-Point coordinates and joint flexion angles for 50th percentile male", () => {
      const ergo = InteriorErgonomicsBiometricsEngine.solveDriverErgonomics(DEFAULT_BESPOKE_STATE, "50th_male", 0, 0);

      expect(ergo.hPointCoordinatesMm.x).toBeDefined();
      expect(ergo.hPointCoordinatesMm.y).toBeGreaterThan(200);
      expect(ergo.headroomClearanceMm).toBeGreaterThan(20);
      expect(ergo.kneeAngleDeg).toBeGreaterThan(90);
      expect(ergo.kneeAngleDeg).toBeLessThan(150);
      expect(ergo.elbowAngleDeg).toBeGreaterThanOrEqual(90);
      expect(ergo.overallSaeErgonomicsScore).toBeGreaterThan(60);
    });

    it("evaluates accommodation for 95th percentile male driver", () => {
      const ergo95 = InteriorErgonomicsBiometricsEngine.solveDriverErgonomics(DEFAULT_BESPOKE_STATE, "95th_male", -40, 10);

      expect(ergo95.hPointCoordinatesMm.x).toBeLessThan(0);
      expect(ergo95.pedalDepressionForceN).toBeGreaterThan(90);
      expect(ergo95.gForceBolsterContainmentRating).toBeGreaterThan(70);
    });
  });

  // 5. Universal GLB Exporter Pipeline
  describe("UniversalGlbExporter Integration", () => {
    it("exports interior CAD hierarchy to binary GLB buffer", async () => {
      const cadGroup = HyperFidelityInteriorCadEngine.buildFullInteriorCad(DEFAULT_BESPOKE_STATE, 0.0, 0.0, 0.0);
      const exportResult = await UniversalGlbExporter.exportVehicleToGlb(cadGroup, {
        vehicleName: "Test_Interior_Export",
        author: "Unit Test",
      });

      expect(exportResult.filename).toBe("test_interior_export.glb");
      expect(exportResult.byteLength).toBeGreaterThan(1024);
      expect(exportResult.buffer).toBeInstanceOf(ArrayBuffer);
    });
  });
});
