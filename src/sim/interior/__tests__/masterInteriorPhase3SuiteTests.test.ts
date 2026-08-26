// ============================================================================
// MASTER BESPOKE INTERIOR PHASE 3 ENGINEERING SUITE UNIT TESTS
// ============================================================================
// Validates 3D Voxel CFD airflow & ISO 7730 thermal comfort, HMI screen textures,
// ISO 2631-1 seat NVH transmissibility, Bespoke Lighting CAD, and Master Suite.
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

import { InteriorThermalFluidDynamicsEngine } from "../interiorThermalFluidDynamicsEngine";
import { HyperFidelityHmiScreenRenderer } from "../../../exterior3d/generators/interior/hyperFidelityHmiScreenRenderer";
import { CabinVibrationSeatNvhSolver } from "../cabinVibrationSeatNvhSolver";
import { BespokeInteriorLightingCadBuilder } from "../../../exterior3d/generators/interior/bespokeInteriorLightingCadBuilder";
import { MasterBespokeInteriorSuite } from "../masterBespokeInteriorSuite";
import { DEFAULT_BESPOKE_STATE } from "../../../components/interior/BespokeLuxuryInteriorStudioHub";

describe("MasterBespokeInteriorPhase3Suite", () => {
  // 1. 3D Voxel CFD Airflow & ISO 7730 Thermal Comfort Engine
  describe("InteriorThermalFluidDynamicsEngine", () => {
    it("simulates 3D Voxel CFD airflow and calculates cabin average temperature and air velocity", () => {
      const cfd = InteriorThermalFluidDynamicsEngine.simulateCabinCfd(DEFAULT_BESPOKE_STATE, 36.0, 850, 21.5, 5);

      expect(cfd.totalAirCells).toBe(8192); // 32 x 16 x 16
      expect(cfd.averageCabinTempC).toBeGreaterThan(15.0);
      expect(cfd.averageCabinTempC).toBeLessThan(45.0);
      expect(cfd.maxAirVelocityMps).toBeGreaterThan(1.0);
      expect(cfd.hvacCoolingDutyKw).toBeGreaterThan(2.0);
      expect(cfd.thermalComfortZones.length).toBe(4);
    });

    it("evaluates ISO 7730 Fanger PMV & PPD comfort indexes for comfortable driver zone", () => {
      const comfort = InteriorThermalFluidDynamicsEngine.calculateIso7730Comfort("DRIVER", 21.5, 0.35, 45, 30.0);

      expect(comfort.pmvIndex).toBeGreaterThan(-1.5);
      expect(comfort.pmvIndex).toBeLessThan(1.5);
      expect(comfort.ppdPercent).toBeGreaterThanOrEqual(5.0);
      expect(comfort.ppdPercent).toBeLessThanOrEqual(100.0);
      expect(comfort.thermalSensationCategory).toBeDefined();
    });
  });

  // 2. Hyper-Fidelity Cockpit HMI & Screen Display Renderer
  describe("HyperFidelityHmiScreenRenderer", () => {
    it("generates 16-inch OLED instrument cluster display texture", () => {
      const renderer = HyperFidelityHmiScreenRenderer.getInstance();
      const texture = renderer.generateClusterDisplayTexture({ rpm: 7500, speedKmh: 195 });

      expect(texture).toBeInstanceOf(THREE.Texture);
    });

    it("generates 56-inch Hyperscreen central HMI display texture", () => {
      const renderer = HyperFidelityHmiScreenRenderer.getInstance();
      const texture = renderer.generateCentralHmiDisplayTexture("cyberpunk_neon_cyan");

      expect(texture).toBeInstanceOf(THREE.Texture);
    });
  });

  // 3. Cabin NVH & ISO 2631-1 Seat Transmissibility Solver
  describe("CabinVibrationSeatNvhSolver", () => {
    it("solves ISO 2631-1 seat vibration weighted acceleration aw and SEAT factor ratio", () => {
      const nvh = CabinVibrationSeatNvhSolver.solveSeatVibrationNvh(DEFAULT_BESPOKE_STATE, 4200, 110, true);

      expect(nvh.floorAccelRmsMps2).toBeGreaterThan(0.2);
      expect(nvh.weightedAccelAwMps2).toBeGreaterThan(0.0001);
      expect(nvh.seatFactorRatio).toBeGreaterThan(0);
      expect(nvh.vibrationDoseValueVdv).toBeGreaterThan(0);
      expect(nvh.healthRiskCategory).toBeDefined();
    });

    it("generates 10-point NVH frequency attenuation spectrum", () => {
      const spectrum = CabinVibrationSeatNvhSolver.generateNvhSpectrum(DEFAULT_BESPOKE_STATE, 4200);

      expect(spectrum.length).toBe(10);
      expect(spectrum[0].frequencyHz).toBe(20);
      expect(spectrum[0].attenuationDb).toBeGreaterThan(0);
    });
  });

  // 4. Multi-Zone Fiber-Optic Lighting & Starlight CAD Builder
  describe("BespokeInteriorLightingCadBuilder", () => {
    it("builds 3D optical lighting CAD group and 64-node starlight roof mesh", () => {
      const group = BespokeInteriorLightingCadBuilder.buildFullLightingGroup(DEFAULT_BESPOKE_STATE, 0.81, 0.0);

      expect(group).toBeInstanceOf(THREE.Group);
      expect(group.name).toBe("BespokeLighting_Root");
      expect(group.userData?.metadata?.totalLedNodes).toBeGreaterThanOrEqual(64);
    });
  });

  // 5. Master Bespoke Interior Suite Orchestrator
  describe("MasterBespokeInteriorSuite", () => {
    it("evaluates full multi-physics engineering analysis report", () => {
      const suite = MasterBespokeInteriorSuite.getInstance();
      const report = suite.evaluateFullInteriorSuite(DEFAULT_BESPOKE_STATE, 4200, 120, 36.0, 21.5);

      expect(report.cadGroup).toBeInstanceOf(THREE.Group);
      expect(report.totalMassKg).toBeGreaterThan(50);
      expect(report.cfdAirflow.totalAirCells).toBe(8192);
      expect(report.nvhVibration.seatFactorRatio).toBeGreaterThan(0);
      expect(report.saeErgonomics.overallSaeErgonomicsScore).toBeGreaterThan(50);
    });

    it("exports complete interior CAD assembly to binary GLB file", async () => {
      const suite = MasterBespokeInteriorSuite.getInstance();
      const glbResult = await suite.exportInteriorToBinaryGlb(DEFAULT_BESPOKE_STATE);

      expect(glbResult.filename).toContain("interior_cabin_");
      expect(glbResult.byteLength).toBeGreaterThan(1024);
      expect(glbResult.buffer).toBeInstanceOf(ArrayBuffer);
    });
  });
});
