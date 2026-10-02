import { describe, it, expect } from "vitest";
import { CAMPUS_UNITS_REGISTRY } from "../campusRegistry";
import { CampusEngine } from "../campusEngine";
import { INITIAL_FACTORY_STATE } from "../campusRegistry";
import { CampusUnitId } from "../campusTypes";

describe("Automotive Corporate Campus Architecture (1970 Startup & 14 Units)", () => {
  it("registers exactly 14 top-level campus units (13 HQ buildings + 1 Factory)", () => {
    const unitKeys = Object.keys(CAMPUS_UNITS_REGISTRY);
    expect(unitKeys.length).toBe(14);

    const expectedUnits: { num: number; id: CampusUnitId; isFactory: boolean }[] = [
      { num: 1, id: "CENTRAL_CORPORATE_HQ", isFactory: false },
      { num: 2, id: "POWERTRAIN_EV_HQ", isFactory: false },
      { num: 3, id: "AERO_HQ", isFactory: false },
      { num: 4, id: "VEHICLE_DESIGN_HQ", isFactory: false },
      { num: 5, id: "CHASSIS_DYNAMICS_HQ", isFactory: false },
      { num: 6, id: "INTERIOR_HQ", isFactory: false },
      { num: 7, id: "TESTING_VALIDATION_HQ", isFactory: false },
      { num: 8, id: "MOTORSPORT_HQ", isFactory: false },
      { num: 9, id: "COMMERCIAL_VEHICLES_HQ", isFactory: false },
      { num: 10, id: "FACTORY", isFactory: true },
      { num: 11, id: "SUPPLIER_PROCUREMENT_HQ", isFactory: false },
      { num: 12, id: "QUALITY_RELIABILITY_HQ", isFactory: false },
      { num: 13, id: "SAFETY_HQ", isFactory: false },
      { num: 14, id: "MARKETING_SALES_HQ", isFactory: false },
    ];

    expectedUnits.forEach(({ num, id, isFactory }) => {
      const unit = CAMPUS_UNITS_REGISTRY[id];
      expect(unit).toBeDefined();
      expect(unit.unitNumber).toBe(num);
      expect(unit.isFactory).toBe(isFactory);
      expect(unit.mapCoordinates).toBeDefined();
    });
  });

  it("enforces the 1970 startup configuration: 9 active starting facilities and exactly 108 employee capacity", () => {
    const starterUnits = Object.values(CAMPUS_UNITS_REGISTRY).filter(u => u.isStarterBuilding);
    expect(starterUnits.length).toBe(9);

    const totalStarterStaffCap = starterUnits.reduce((sum, u) => sum + u.staffCapacity, 0);
    // 18 (UNIT_01) + 20 (UNIT_02) + 15 (UNIT_04) + 12 (UNIT_05) + 10 (UNIT_06) + 6 (UNIT_07) + 8 (UNIT_11) + 6 (UNIT_12) + 13 (UNIT_14) = 108
    expect(totalStarterStaffCap).toBe(108);

    const lockedPlots = Object.values(CAMPUS_UNITS_REGISTRY).filter(u => u.status === "locked" || u.status === "outsourced");
    expect(lockedPlots.length).toBe(5); // UNIT_03 (Aero), UNIT_08 (Motorsport), UNIT_09 (Commercial), UNIT_13 (Safety), UNIT_10 (Factory)
  });

  it("enforces Prototype Workshop capacity invariant: 2 vehicles max simultaneously", () => {
    const protoUnit = CAMPUS_UNITS_REGISTRY["CENTRAL_CORPORATE_HQ"];
    expect(protoUnit.prototypeCapacity).toBe(2);
    expect(protoUnit.activePrototypes?.length).toBe(2);
    expect(protoUnit.staffCapacity).toBe(18);
  });

  it("verifies Aero HQ and Motorsport HQ shared relationship note", () => {
    const aero = CAMPUS_UNITS_REGISTRY["AERO_HQ"];
    const motorsport = CAMPUS_UNITS_REGISTRY["MOTORSPORT_HQ"];

    expect(aero.sharedWithUnitId).toBe("MOTORSPORT_HQ");
    expect(motorsport.sharedWithUnitId).toBe("AERO_HQ");
  });

  it("verifies special colliders and boundary partitioning flags", () => {
    const factory = CAMPUS_UNITS_REGISTRY["FACTORY"];
    const safety = CAMPUS_UNITS_REGISTRY["SAFETY_HQ"];
    const motorsport = CAMPUS_UNITS_REGISTRY["MOTORSPORT_HQ"];

    expect(factory.isOutsourceBoundary).toBe(true);
    expect(safety.isLinearCollider).toBe(true);
    expect(motorsport.isMotorsportTrackCollider).toBe(true);

    expect(factory.zone).toBe("ZONE_A");
    expect(safety.zone).toBe("ZONE_D");
    expect(motorsport.zone).toBe("ZONE_D");
  });

  it("calculates starting campus telemetry (9 operational units, 5 locked/outsourced plots, prototype count)", () => {
    const telemetry = CampusEngine.calculateCampusTelemetry(CAMPUS_UNITS_REGISTRY, INITIAL_FACTORY_STATE);

    expect(telemetry.totalStaffCapacity).toBe(108);
    expect(telemetry.operationalUnitsCount).toBe(9);
    expect(telemetry.lockedPlotsCount).toBe(5);
    expect(telemetry.prototypeCapacityTotal).toBe(2);
    expect(telemetry.activePrototypesCount).toBeGreaterThanOrEqual(1);
  });

  it("allows constructing an unbuilt locked plot (e.g. Aero HQ wind tunnel)", () => {
    const initialCash = 10000000;
    const constructResult = CampusEngine.constructLockedPlot(CAMPUS_UNITS_REGISTRY, "AERO_HQ", initialCash);

    expect(constructResult.success).toBe(true);
    expect(constructResult.nextUnits["AERO_HQ"].status).toBe("operational");
    expect(constructResult.nextUnits["AERO_HQ"].level).toBe(1);
    expect(constructResult.nextUnits["AERO_HQ"].staffCapacity).toBe(40);
  });

  it("enforces that building upgrades require capital ($) and never auto-upgrade from year progression", () => {
    const unitId = "CENTRAL_CORPORATE_HQ";
    const initialUnit = CAMPUS_UNITS_REGISTRY[unitId];
    expect(initialUnit.level).toBe(1);

    // 1. Attempting upgrade with insufficient cash must fail
    const insufficientCash = 100;
    const failResult = CampusEngine.upgradeUnit(CAMPUS_UNITS_REGISTRY, unitId, insufficientCash);
    expect(failResult.success).toBe(false);
    expect(failResult.cost).toBe(0);
    expect(failResult.nextUnits[unitId].level).toBe(1);
    expect(failResult.message).toContain("Insufficient capital");

    // 2. Successful upgrade with sufficient cash in 1970 (no year restriction)
    const sufficientCash = initialUnit.upgradeCost + 500000;
    const successResult = CampusEngine.upgradeUnit(CAMPUS_UNITS_REGISTRY, unitId, sufficientCash);
    expect(successResult.success).toBe(true);
    expect(successResult.nextUnits[unitId].level).toBe(2);
    expect(successResult.cost).toBe(initialUnit.upgradeCost);

    // 3. Advancing calendar years through tickCampus does NOT auto-upgrade building levels
    // Simulate advancing 120 months (10 years) from 1970 to 1980 with no active construction jobs
    const tickResult = CampusEngine.tickCampus(
      CAMPUS_UNITS_REGISTRY,
      INITIAL_FACTORY_STATE,
      [], // no jobs
      120,
      1980,
      1
    );
    // All units must still remain at their exact same levels
    expect(tickResult.nextUnits[unitId].level).toBe(1);
    expect(tickResult.nextUnits["POWERTRAIN_EV_HQ"].level).toBe(1);
  });
});
