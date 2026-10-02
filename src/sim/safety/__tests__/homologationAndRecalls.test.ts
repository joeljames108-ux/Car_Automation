import { describe, it, expect } from "vitest";
import {
  HomologationEngine,
  HomologationCandidate,
} from "../homologationAndRecallsEngine";

describe("Regulatory Homologation & Safety Recalls Engine", () => {
  const base1970Vehicle: HomologationCandidate = {
    id: "classic_sedan_1970",
    name: "Apex Classic 2000",
    modelYear: 1970,
    ncapStars: 1,
    hasCatalyticConverter: false,
    emissionsTier: "leaded_carb",
    has5MphBumpers: false,
    hasSealedBeamLights: true,
    airbagCount: 0,
    hasESC: false,
    hasAEB_ADAS: false,
    qualityRatingScore: 75,
    validationMileageKm: 30000,
  };

  it("should approve a 1970 baseline vehicle in 1970 before 5-mph bumper & emissions laws", () => {
    const evalResult = HomologationEngine.evaluateVehicle(base1970Vehicle, 1970);
    expect(evalResult.allRegionsApproved).toBe(true);
    expect(evalResult.regionalStatuses.NA.approved).toBe(true);
    expect(evalResult.regionalStatuses.EU.approved).toBe(true);
  });

  it("should fail 1970 spec vehicle in 1974 for North America due to 5-mph bumper mandate", () => {
    const evalResult = HomologationEngine.evaluateVehicle(base1970Vehicle, 1974);
    expect(evalResult.allRegionsApproved).toBe(false);
    expect(evalResult.regionalStatuses.NA.approved).toBe(false);
    expect(evalResult.regionalStatuses.NA.unmetMandates.some(m => m.includes("5-MPH"))).toBe(true);
    expect(evalResult.regionalStatuses.NA.totalFixCostPerUnit).toBe(240);
  });

  it("should fail in 1976 for North America if missing catalytic converter", () => {
    const vehicleWithBumpers: HomologationCandidate = {
      ...base1970Vehicle,
      has5MphBumpers: true,
    };
    const evalResult = HomologationEngine.evaluateVehicle(vehicleWithBumpers, 1976);
    expect(evalResult.regionalStatuses.NA.approved).toBe(false);
    expect(evalResult.regionalStatuses.NA.unmetMandates.some(m => m.includes("Catalytic"))).toBe(true);
  });

  it("should enforce Euro 1 emissions mandate in Europe from 1993 onward", () => {
    const evalResult = HomologationEngine.evaluateVehicle(base1970Vehicle, 1994);
    expect(evalResult.regionalStatuses.EU.approved).toBe(false);
    expect(evalResult.regionalStatuses.EU.unmetMandates.some(m => m.includes("Euro 1"))).toBe(true);
  });

  it("should approve modern vehicle meeting all 2024 standards", () => {
    const modernCar: HomologationCandidate = {
      id: "apex_hyper_2024",
      name: "Apex Hyperion GT",
      modelYear: 2024,
      ncapStars: 5,
      hasCatalyticConverter: true,
      emissionsTier: "euro4_6",
      has5MphBumpers: true,
      hasSealedBeamLights: false,
      airbagCount: 8,
      hasESC: true,
      hasAEB_ADAS: true,
      qualityRatingScore: 92,
      validationMileageKm: 85000,
    };
    const evalResult = HomologationEngine.evaluateVehicle(modernCar, 2024);
    expect(evalResult.allRegionsApproved).toBe(true);
    expect(evalResult.regionalStatuses.EU.approved).toBe(true);
    expect(evalResult.regionalStatuses.NA.approved).toBe(true);
  });

  it("should calculate higher field failure rate when QA score is low and mileage is unverified", () => {
    const poorQARisk = HomologationEngine.calculateDefectRisk(40, 2000, 0.02);
    const highQARisk = HomologationEngine.calculateDefectRisk(90, 80000, 0.01);

    expect(poorQARisk.fieldFailureRatePct).toBeGreaterThan(highQARisk.fieldFailureRatePct);
    expect(poorQARisk.riskCategory).toBe("critical");
    expect(highQARisk.riskCategory).toBe("minimal");
  });

  it("should generate a government-mandated recall when defect risk is critical and trigger fires", () => {
    const unverifiedCar: HomologationCandidate = {
      ...base1970Vehicle,
      qualityRatingScore: 35,
      validationMileageKm: 1500,
    };
    // Force trigger with low seed
    const recall = HomologationEngine.checkMonthlyRecallTrigger(unverifiedCar, 10000, 1974, 5, 0.001);
    expect(recall).not.toBeNull();
    if (recall) {
      expect(recall.type).toBe("government_mandated_recall");
      expect(recall.reputationImpact).toBeLessThan(0);
      expect(recall.totalCost).toBeGreaterThan(100000);
    }
  });
});
