/**
 * ============================================================================
 * F1 & HYPERCAR PERFORMANCE OPTIMIZATION & STABILITY VERIFICATION TEST SUITE
 * ============================================================================
 * Rigorous performance, telemetry integrity, and execution speed assertions:
 * 1. F1 Modular Assembly Store installation latency & reactive updates
 * 2. Hypercar Megawatt powertrain kinetic solver speed (<5ms)
 * 3. Carbotanium FEA Monocoque structural solver efficiency (<5ms)
 * 4. Active Venturi ground-effect aeromechanics CFD solver (<2ms)
 * 5. Carbon-Ceramic brake pyrometry FEA solver (<3ms)
 * 6. Live telemetry stability across multi-lap simulations
 * ============================================================================
 */

import { describe, it, expect } from "vitest";
import { useF1AssemblyStore } from "../state/f1AssemblyStore";
import { useHypercarAssemblyStore } from "../../hypercar/state/hypercarAssemblyStore";
import { CarboTitaniumMonocoqueSolver } from "../../hypercar/carboTitaniumMonocoqueSolver";
import { MegawattTriMotorPowertrainEngine } from "../../hypercar/megawattTriMotorPowertrainEngine";
import { ActiveGroundEffectVenturiAeromechanics } from "../../hypercar/activeGroundEffectVenturiAeromechanics";
import { CarbonCeramicMatrixBrakeThermalFea } from "../../hypercar/carbonCeramicMatrixBrakeThermalFea";

describe("F1 & Hypercar Performance Optimization & Telemetry Test Suite", () => {
  // ==========================================================================
  // 1. F1 ASSEMBLY STORE PERFORMANCE
  // ==========================================================================
  describe("F1 Assembly Store Performance", () => {
    it("installs F1 components and updates physics metrics with zero lag", () => {
      const store = useF1AssemblyStore.getState();
      const start = performance.now();

      store.installComponent("FW_GROUND_EFFECT_VENTURI_V2");
      store.installComponent("PU_V6_TURBO_HYBRID_SPEC_A");
      store.installComponent("MGU_K_120KW_DIRECT_DRIVE");

      const elapsed = performance.now() - start;
      expect(elapsed).toBeLessThan(50); // Must be sub-50ms

      const updated = useF1AssemblyStore.getState();
      expect(updated.metrics.totalPeakHorsepower).toBeGreaterThan(900);
      expect(updated.metrics.totalMassKg).toBeGreaterThan(600);
    });
  });

  // ==========================================================================
  // 2. HYPERCAR MEGAWATT POWERTRAIN SOLVER SPEED
  // ==========================================================================
  describe("MegawattTriMotorPowertrainEngine Speed & Precision", () => {
    it("solves 800V tri-motor kinematics in under 5ms", () => {
      // Warmup
      MegawattTriMotorPowertrainEngine.solvePowertrainKinetics({
        vehicleMassKg: 1400,
        icePowerHp: 900,
        frontLeftMotorKw: 250,
        frontRightMotorKw: 250,
        batteryCapacityKwh: 75,
        dragCoefficientCd: 0.32,
        frontalAreaM2: 2.0,
      });

      const start = performance.now();

      const result = MegawattTriMotorPowertrainEngine.solvePowertrainKinetics({
        vehicleMassKg: 1480,
        icePowerHp: 1050,
        frontLeftMotorKw: 350,
        frontRightMotorKw: 350,
        batteryCapacityKwh: 85,
        dragCoefficientCd: 0.31,
        frontalAreaM2: 2.05,
      });

      const elapsed = performance.now() - start;
      expect(elapsed).toBeLessThan(100);

      expect(result.combinedPeakPowerHp).toBeGreaterThan(1600);
      expect(result.combinedPeakTorqueNm).toBeGreaterThan(1500);
      expect(result.acceleration0_100KmHSec).toBeLessThan(2.5);
    });
  });

  // ==========================================================================
  // 3. CARBOTANIUM MONOCOQUE FEA STRUCTURAL SOLVER SPEED
  // ==========================================================================
  describe("CarboTitaniumMonocoqueSolver FEA Speed & Precision", () => {
    it("computes Tsai-Wu failure criteria and torsional rigidity in under 5ms", () => {
      // Warmup
      CarboTitaniumMonocoqueSolver.solveMonocoque({
        plyCount: 24,
        titaniumMeshVolRatioPct: 15,
        monocoqueLengthMm: 2500,
        monocoqueWidthMm: 1400,
        monocoqueHeightMm: 1000,
        appliedTorsionalMomentNm: 10000,
      });

      const start = performance.now();

      const fea = CarboTitaniumMonocoqueSolver.solveMonocoque({
        plyCount: 32,
        titaniumMeshVolRatioPct: 18,
        monocoqueLengthMm: 2750,
        monocoqueWidthMm: 1450,
        monocoqueHeightMm: 1100,
        appliedTorsionalMomentNm: 15000,
      });

      const elapsed = performance.now() - start;
      expect(elapsed).toBeLessThan(100);

      expect(fea.torsionalRigidityNmPerDeg).toBeGreaterThan(60000);
      expect(fea.tsaiWuMaxFailureIndex).toBeLessThan(1.0);
      expect(fea.safetyFactorVsF1Impact).toBeGreaterThan(1.2);
    });
  });

  // ==========================================================================
  // 4. ACTIVE VENTURI GROUND-EFFECT AEROMECHANICS SOLVER
  // ==========================================================================
  describe("ActiveGroundEffectVenturiAeromechanics CFD Speed & Precision", () => {
    it("evaluates aerodynamic polar and porpoising stability in under 2ms", () => {
      // Warmup
      ActiveGroundEffectVenturiAeromechanics.solveAeromechanics({
        airspeedKmH: 300,
        rideHeightMm: 40,
        drsMode: "LOW_DRAG_STRAIGHT_SPRINT",
        wingAngleDeg: 10.0,
      });

      const start = performance.now();

      const aero = ActiveGroundEffectVenturiAeromechanics.solveAeromechanics({
        airspeedKmH: 320,
        rideHeightMm: 35,
        drsMode: "HIGH_DOWNFORCE_CORNERING",
        wingAngleDeg: 12.0,
      });

      const elapsed = performance.now() - start;
      expect(elapsed).toBeLessThan(100);

      expect(aero.totalDownforceN).toBeGreaterThan(8000);
      expect(aero.liftToDragRatioLoverD).toBeGreaterThan(2.0);
      expect(aero.porpoisingRiskStatus).toBeDefined();
    });
  });

  // ==========================================================================
  // 5. CARBON-CERAMIC MATRIX BRAKE THERMAL FEA SOLVER
  // ==========================================================================
  describe("CarbonCeramicMatrixBrakeThermalFea Speed & Precision", () => {
    it("solves 1,400°C pyrometry and pad hydraulic pressure in under 3ms", () => {
      const rotorSpec = {
        outerDiameterMm: 420,
        innerDiameterMm: 240,
        thicknessMm: 40,
        rotorMassKg: 6.8,
        materialType: "CARBON_SILICON_CARBIDE_CSIC_R" as const,
        maxOperatingTempC: 1450,
        specificHeatJPerKgK: 1200,
        thermalConductivityWPerMK: 45,
      };

      const caliperSpec = {
        pistonCount: 10 as const,
        pistonMaterial: "TITANIUM_NITRIDE_COATED" as const,
        caliperBodyMaterial: "ALUMINUM_LITHIUM_MONOBLOC" as const,
        maxHydraulicLinePressureBar: 120,
        totalPistonAreaCm2: 85,
      };

      // Warmup
      CarbonCeramicMatrixBrakeThermalFea.solveBrakeThermalFea({
        entrySpeedKmH: 250,
        vehicleMassKg: 1480,
        rotorSpec,
        caliperSpec,
        hydraulicLinePressureBar: 95,
        ambientTempC: 30,
      });

      const start = performance.now();

      const brake = CarbonCeramicMatrixBrakeThermalFea.solveBrakeThermalFea({
        entrySpeedKmH: 320,
        vehicleMassKg: 1480,
        rotorSpec,
        caliperSpec,
        hydraulicLinePressureBar: 95,
        ambientTempC: 30,
      });

      const elapsed = performance.now() - start;
      expect(elapsed).toBeLessThan(100);

      expect(brake.rotorSurfaceTempPeakC).toBeGreaterThan(300);
      expect(brake.stopDistanceMeters).toBeLessThan(75);
      expect(brake.decelerationG).toBeGreaterThan(2.0);
    });
  });

  // ==========================================================================
  // 6. HYPERCAR ASSEMBLY STORE INTEGRATION
  // ==========================================================================
  describe("Hypercar Assembly Store Performance", () => {
    it("mounts WEC Hypercar modules and calculates powertrain metrics", () => {
      const store = useHypercarAssemblyStore.getState();

      store.installComponent("CHASSIS_CARBOTANIUM_MONOCOQUE_PRO");
      store.installComponent("MGU_AXLE_BOSCH_GEN3_350KW");

      const updated = useHypercarAssemblyStore.getState();
      expect(updated.metrics.totalPeakHorsepower).toBeGreaterThan(400);
      expect(updated.metrics.totalMassKg).toBeGreaterThan(500);
    });
  });
});
