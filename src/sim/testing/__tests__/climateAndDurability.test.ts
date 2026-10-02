import { describe, it, expect } from "vitest";
import {
  ClimateAndDurabilityEngine,
  TestVehicleSpec,
} from "../climateAndDurabilityEngine";

describe("Extreme Climate & Accelerated Durability Testing Suite (UNIT_07)", () => {
  const robustVehicle: TestVehicleSpec = {
    id: "apex_gt_durability",
    name: "Apex GT Durability Mule",
    powertrainType: "ice",
    engineCoolingCapacityW: 160000,
    oilViscosityGrade: "5w30",
    batteryCapacityKwh: 2.5,
    hasBatteryThermalManagement: true,
    radiatorSurfaceAreaM2: 0.65,
    airConditioningKw: 7.5,
    cabinVolumeM3: 2.8,
    chassisTorsionalRigidityNmDeg: 28000,
    suspensionBushingMaterial: "polyurethane",
    chassisMaterial: "high_strength_steel",
    weatherstripQuality: "dual_lip_automotive",
  };

  it("should pass all extreme climate & durability tests for a properly engineered vehicle", () => {
    const report = ClimateAndDurabilityEngine.runFullDurabilitySuite(robustVehicle);
    expect(report.allChambersPassed).toBe(true);
    expect(report.overallScore).toBe(100);
    expect(report.earnedValidationMileageKm).toBeGreaterThanOrEqual(90000);
  });

  it("should flag cold-start lubrication delay in -40°C arctic cell when using heavy 20W-50 oil", () => {
    const heavyOilCar: TestVehicleSpec = {
      ...robustVehicle,
      oilViscosityGrade: "20w50",
    };
    const arcticResult = ClimateAndDurabilityEngine.testArcticCell(heavyOilCar);
    expect(arcticResult.passed).toBe(false);
    expect(arcticResult.oilFlowDelaySeconds).toBeGreaterThan(6.0);
    expect(arcticResult.deficiencies.some(d => d.includes("20W-50"))).toBe(true);
  });

  it("should detect coolant boilover and vapor lock in +50°C desert cell if radiator capacity is undersized", () => {
    const weakCoolingCar: TestVehicleSpec = {
      ...robustVehicle,
      engineCoolingCapacityW: 75000, // Deficit of 75kW
    };
    const desertResult = ClimateAndDurabilityEngine.testDesertCell(weakCoolingCar);
    expect(desertResult.passed).toBe(false);
    expect(desertResult.coolantBoiloverRisk).toBe(true);
    expect(desertResult.peakCoolantTempC).toBeGreaterThanOrEqual(115);
  });

  it("should detect water ingress in monsoon deluge when using basic EPDM weatherstripping", () => {
    const basicSealsCar: TestVehicleSpec = {
      ...robustVehicle,
      weatherstripQuality: "standard_epdm",
    };
    const monsoonResult = ClimateAndDurabilityEngine.testMonsoonChamber(basicSealsCar);
    expect(monsoonResult.passed).toBe(false);
    expect(monsoonResult.sealWaterIngressDetected).toBe(true);
    expect(monsoonResult.ingressProtectionRating).toBe("IP54");
  });

  it("should detect weld micro-cracking and loss of torsional rigidity on 7-post shaker if chassis is flimsy", () => {
    const flimsyCar: TestVehicleSpec = {
      ...robustVehicle,
      chassisTorsionalRigidityNmDeg: 9500, // Very flexible 1960s style unibody
    };
    const shakerResult = ClimateAndDurabilityEngine.testShakerDurability(flimsyCar);
    expect(shakerResult.passed).toBe(false);
    expect(shakerResult.weldMicroCrackingDetected).toBe(true);
    expect(shakerResult.structuralRigidityRetentionPct).toBeLessThan(85);
    expect(shakerResult.recommendedReinforcements.length).toBeGreaterThan(0);
  });
});
