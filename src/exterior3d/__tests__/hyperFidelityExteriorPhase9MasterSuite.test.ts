/**
 * ============================================================================
 * PHASE 9 ULTRA-FIDELITY EXTERIOR 3D GLB MASTER TEST SUITE
 * ============================================================================
 * Comprehensive unit test verification of Phase 9 extreme hypercar CAD modules:
 *
 * 1. HyperExtremeSculptedBodyworkCad (Undercuts, S-Duct, Scoop & Buttress Aerodynamics)
 * 2. ActiveHydraulicAeroFlapsDrsCad (4-Quadrant Downforce Vectoring & Airbrake Decel)
 * 3. DualIntercoolerRadiatorHeatExchangerCadGenerator (Twin Rads, Fans & Heat Rejection)
 * 4. ActiveSuspensionStanceGeometryCad (Pushrod Double Wishbones, Camber & Ride Height)
 * 5. CyberpunkUnderglowLidarSensorSuiteGenerator (Solid-State LiDAR & Multi-Zone RGB)
 * 6. CompletePhase9MasterHypercarAssembly (Full Watertight Parametric Vehicle Graph)
 * 7. GeneratePhase9ExteriorGlbSuite (Async Binary GLB Serialization of 4 Flagship Hypercars)
 * ============================================================================
 */

import { describe, it, expect } from "vitest";
import * as THREE from "three";
import { HyperExtremeSculptedBodyworkCad } from "../geometry/hyperExtremeSculptedBodyworkCad";
import { ActiveHydraulicAeroFlapsDrsCad } from "../aerodynamics/activeHydraulicAeroFlapsDrsCad";
import { DualIntercoolerRadiatorHeatExchangerCadGenerator } from "../generators/dualIntercoolerRadiatorHeatExchangerCadGenerator";
import { ActiveSuspensionStanceGeometryCad } from "../kinematics/activeSuspensionStanceGeometryCad";
import { CyberpunkUnderglowLidarSensorSuiteGenerator } from "../generators/cyberpunkUnderglowLidarSensorSuiteGenerator";
import { CompletePhase9MasterHypercarAssembly } from "../generators/completePhase9MasterHypercarAssembly";
import { GeneratePhase9ExteriorGlbSuite, PHASE_9_PRESETS } from "../export/generatePhase9ExteriorGlbSuite";
import { UniversalGlbExporter } from "../export/universalGlbExporter";

describe("Phase 9 Ultra-Fidelity Exterior 3D GLB Master Test Suite", () => {
  // ==========================================================================
  // 1. SCULPTED BODYWORK CAD ENGINE
  // ==========================================================================
  describe("HyperExtremeSculptedBodyworkCad", () => {
    it("generates sculpted sidepods, periscope scoop, hood S-duct, and flying buttresses", () => {
      const assembly = HyperExtremeSculptedBodyworkCad.generateSculptedBodyworkAssembly({
        hasSidepodUndercuts: true,
        sidepodUndercutDepthMm: 180,
        hasRoofPeriscopeScoop: true,
        roofScoopHeightMm: 160,
        hasHoodSDuct: true,
        sDuctWidthMm: 420,
        hasFlyingButtresses: true,
        buttressSpanMm: 680,
      });

      expect(assembly).toBeInstanceOf(THREE.Group);
      expect(assembly.name).toBe("HYPER_EXTREME_SCULPTED_BODYWORK_ASSEMBLY");
      expect(assembly.children.length).toBe(4);
    });

    it("evaluates S-duct downforce contribution and isentropic ram pressure ratio", () => {
      const metrics = HyperExtremeSculptedBodyworkCad.solveSculptedAeroMetrics(
        {
          hasSidepodUndercuts: true,
          sidepodUndercutDepthMm: 180,
          hasRoofPeriscopeScoop: true,
          roofScoopHeightMm: 160,
          hasHoodSDuct: true,
          sDuctWidthMm: 420,
          hasFlyingButtresses: true,
          buttressSpanMm: 680,
        },
        300
      );

      expect(metrics.sDuctDownforceContributionN).toBeGreaterThan(500);
      expect(metrics.sidepodCoolingMassFlowKgS).toBeGreaterThan(10);
      expect(metrics.roofScoopRamPressureRatio).toBeGreaterThan(1.0);
    });
  });

  // ==========================================================================
  // 2. 4-QUADRANT ACTIVE AERO FLAPS & DRS
  // ==========================================================================
  describe("ActiveHydraulicAeroFlapsDrsCad", () => {
    it("builds 4-quadrant active corner flap assembly with hydraulic pistons", () => {
      const flaps = ActiveHydraulicAeroFlapsDrsCad.generateActiveFlapAssembly({
        flFlapAngleDeg: 15,
        frFlapAngleDeg: 15,
        rlFlapAngleDeg: 30,
        rrFlapAngleDeg: 30,
        isAirbrakeActive: false,
        isDrsActive: false,
        hasHydraulicPistons: true,
      });

      expect(flaps).toBeInstanceOf(THREE.Group);
      expect(flaps.children.length).toBe(2); // Front and Rear pairs
    });

    it("solves 4-wheel downforce vectoring, roll restoring torque, and airbrake deceleration", () => {
      const result = ActiveHydraulicAeroFlapsDrsCad.solveFlapVectoringTelemetry(
        {
          flFlapAngleDeg: 10,
          frFlapAngleDeg: 35,
          rlFlapAngleDeg: 15,
          rrFlapAngleDeg: 45,
          isAirbrakeActive: true,
          isDrsActive: false,
          hasHydraulicPistons: true,
        },
        280,
        1450
      );

      expect(result.totalDownforceN).toBeGreaterThan(1000);
      expect(result.rollRestoringTorqueNm).toBeGreaterThan(0);
      expect(result.airbrakeDecelDeltaMs2).toBeGreaterThan(0.5);
    });
  });

  // ==========================================================================
  // 3. DUAL RADIATOR & INTERCOOLER HEAT EXCHANGERS
  // ==========================================================================
  describe("DualIntercoolerRadiatorHeatExchangerCadGenerator", () => {
    it("generates front twin radiators with electric fans and sidepod intercoolers", () => {
      const cooling = DualIntercoolerRadiatorHeatExchangerCadGenerator.generateCoolingAssembly({
        radiatorCoreWidthMm: 580,
        radiatorCoreHeightMm: 340,
        intercoolerCoreThicknessMm: 85,
        hasElectricSuctionFans: true,
        fanSpeedRpm: 3200,
        hasAnodizedAnFittings: true,
      });

      expect(cooling).toBeInstanceOf(THREE.Group);
      expect(cooling.children.length).toBe(2);
    });

    it("computes thermal heat dissipation and charge-air temperature drop", () => {
      const metrics = DualIntercoolerRadiatorHeatExchangerCadGenerator.solveCoolingThermalMetrics(
        {
          radiatorCoreWidthMm: 580,
          radiatorCoreHeightMm: 340,
          intercoolerCoreThicknessMm: 85,
          hasElectricSuctionFans: true,
          fanSpeedRpm: 3200,
          hasAnodizedAnFittings: true,
        },
        280,
        320
      );

      expect(metrics.totalHeatRejectionKw).toBeGreaterThan(100);
      expect(metrics.chargeAirTempDropC).toBeGreaterThan(40);
    });
  });

  // ==========================================================================
  // 4. ACTIVE PUSHROD SUSPENSION STANCE & CAMBER
  // ==========================================================================
  describe("ActiveSuspensionStanceGeometryCad", () => {
    it("generates pushrod double wishbones with Multimatic DSSV dampers and coil springs", () => {
      const susp = ActiveSuspensionStanceGeometryCad.generateSuspensionAssembly({
        mode: "TRACK_ATTACK_SLAMMED",
        frontRideHeightOffsetMm: -25,
        rearRideHeightOffsetMm: -20,
        frontCamberDeg: -3.2,
        rearCamberDeg: -2.4,
        hasDssvDampers: true,
        hasHeaveSprings: true,
      });

      expect(susp).toBeInstanceOf(THREE.Group);
      expect(susp.children.length).toBe(2); // Front & Rear axles
    });

    it("solves ground clearance and roll center heights across stance offsets", () => {
      const stance = ActiveSuspensionStanceGeometryCad.solveStanceTelemetry({
        mode: "TRACK_ATTACK_SLAMMED",
        frontRideHeightOffsetMm: -25,
        rearRideHeightOffsetMm: -20,
        frontCamberDeg: -3.2,
        rearCamberDeg: -2.4,
        hasDssvDampers: true,
        hasHeaveSprings: true,
      });

      expect(stance.groundClearanceFrontMm).toBe(80);
      expect(stance.groundClearanceRearMm).toBe(95);
      expect(stance.antiDivePct).toBe(28.5);
    });
  });

  // ==========================================================================
  // 5. CYBERPUNK UNDERGLOW & LIDAR SENSOR SUITE
  // ==========================================================================
  describe("CyberpunkUnderglowLidarSensorSuiteGenerator", () => {
    it("constructs roof LiDAR pod, 8 surround cameras, and neon underglow lightbars", () => {
      const sensors = CyberpunkUnderglowLidarSensorSuiteGenerator.generateSensorUnderglowAssembly({
        hasRoofLidarPod: true,
        lidarType: "SOLID_STATE_1550NM",
        hasSurroundVisionCameras: true,
        hasUnderglowLightbars: true,
        underglowColorHex: "#00f0ff",
        underglowIntensity: 2.0,
        underglowMode: "BREATHING_PULSE",
      });

      expect(sensors).toBeInstanceOf(THREE.Group);
      expect(sensors.children.length).toBe(3);
    });

    it("solves LiDAR point density and autonomous perception latency", () => {
      const metrics = CyberpunkUnderglowLidarSensorSuiteGenerator.solveSensorMetrics({
        hasRoofLidarPod: true,
        lidarType: "SOLID_STATE_1550NM",
        hasSurroundVisionCameras: true,
        hasUnderglowLightbars: true,
        underglowColorHex: "#00f0ff",
        underglowIntensity: 2.0,
        underglowMode: "BREATHING_PULSE",
      });

      expect(metrics.lidarPointDensityPtsSec).toBe(2400000);
      expect(metrics.lidarDetectionRangeM).toBe(320);
      expect(metrics.autonomousPerceptionLatencyMs).toBeLessThan(10);
    });
  });

  // ==========================================================================
  // 6. COMPLETE MASTER HYPERCAR VEHICLE ASSEMBLY
  // ==========================================================================
  describe("CompletePhase9MasterHypercarAssembly", () => {
    it("builds complete Phase 9 master hypercar with all integrated subsystems", () => {
      const preset = PHASE_9_PRESETS[0];
      const vehicle = CompletePhase9MasterHypercarAssembly.generateMasterVehicle(preset.config);

      expect(vehicle).toBeInstanceOf(THREE.Group);
      expect(vehicle.children.length).toBeGreaterThanOrEqual(10);
    });
  });

  // ==========================================================================
  // 7. ASYNC BINARY GLB SERIALIZATION
  // ==========================================================================
  describe("GeneratePhase9ExteriorGlbSuite Pipeline", () => {
    it("builds all 4 Phase 9 master preset 3D scene graphs", () => {
      for (const preset of PHASE_9_PRESETS) {
        const scene = GeneratePhase9ExteriorGlbSuite.buildPresetScene(preset);
        expect(scene).toBeInstanceOf(THREE.Group);
        expect(scene.children.length).toBeGreaterThanOrEqual(10);
      }
    });

    it("asynchronously serializes Apex Huayra Active Vector to binary GLB buffer", async () => {
      const preset = PHASE_9_PRESETS[0];
      const scene = GeneratePhase9ExteriorGlbSuite.buildPresetScene(preset);

      const res = await UniversalGlbExporter.exportVehicleToGlb(scene, {
        binary: true,
        vehicleName: preset.config.name,
      });

      expect(res.buffer).toBeDefined();
      expect(res.buffer.byteLength).toBeGreaterThan(25000);
    }, 30000);
  });
});
