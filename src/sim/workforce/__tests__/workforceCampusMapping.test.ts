import { describe, it, expect } from "vitest";
import {
  WorkforceCampusMapping,
  INITIAL_1970_CAMPUS_WORKFORCE,
} from "../workforceCampusMapping";

describe("14-Campus-Unit Workforce Mapping & 108 Starter Employee Invariant", () => {
  it("should have exactly 108 starter employees across all 14 campus units", () => {
    const totalStaff = WorkforceCampusMapping.calculateTotalStarterHeadcount();
    expect(totalStaff).toBe(108);
  });

  it("should have exactly 9 active starter units with staff and 5 unstaffed plots (1 factory + 4 locked)", () => {
    const units = Object.values(INITIAL_1970_CAMPUS_WORKFORCE);
    const activeUnits = units.filter(u => u.totalHeadcount1970 > 0);
    const unstaffedUnits = units.filter(u => u.totalHeadcount1970 === 0);

    expect(activeUnits.length).toBe(9);
    expect(unstaffedUnits.length).toBe(5);

    // Verify UNIT_10 Factory has 0 staff (unowned / outsourced)
    expect(INITIAL_1970_CAMPUS_WORKFORCE.FACTORY.totalHeadcount1970).toBe(0);

    // Verify locked units have 0 staff
    expect(INITIAL_1970_CAMPUS_WORKFORCE.AERO_HQ.totalHeadcount1970).toBe(0);
    expect(INITIAL_1970_CAMPUS_WORKFORCE.MOTORSPORT_HQ.totalHeadcount1970).toBe(0);
    expect(INITIAL_1970_CAMPUS_WORKFORCE.COMMERCIAL_VEHICLES_HQ.totalHeadcount1970).toBe(0);
    expect(INITIAL_1970_CAMPUS_WORKFORCE.SAFETY_HQ.totalHeadcount1970).toBe(0);
  });

  it("should verify exact headcounts across core active buildings", () => {
    expect(INITIAL_1970_CAMPUS_WORKFORCE.CENTRAL_CORPORATE_HQ.totalHeadcount1970).toBe(18);
    expect(INITIAL_1970_CAMPUS_WORKFORCE.POWERTRAIN_EV_HQ.totalHeadcount1970).toBe(20);
    expect(INITIAL_1970_CAMPUS_WORKFORCE.VEHICLE_DESIGN_HQ.totalHeadcount1970).toBe(15);
    expect(INITIAL_1970_CAMPUS_WORKFORCE.CHASSIS_DYNAMICS_HQ.totalHeadcount1970).toBe(12);
    expect(INITIAL_1970_CAMPUS_WORKFORCE.INTERIOR_HQ.totalHeadcount1970).toBe(10);
    expect(INITIAL_1970_CAMPUS_WORKFORCE.TESTING_VALIDATION_HQ.totalHeadcount1970).toBe(6);
    expect(INITIAL_1970_CAMPUS_WORKFORCE.SUPPLIER_PROCUREMENT_HQ.totalHeadcount1970).toBe(8);
    expect(INITIAL_1970_CAMPUS_WORKFORCE.QUALITY_RELIABILITY_HQ.totalHeadcount1970).toBe(6);
    expect(INITIAL_1970_CAMPUS_WORKFORCE.MARKETING_SALES_HQ.totalHeadcount1970).toBe(13);
  });

  it("should verify total monthly payroll for the 108 starter employees", () => {
    const totalPayroll = WorkforceCampusMapping.calculateTotal1970Payroll();
    expect(totalPayroll).toBeGreaterThan(150000);
    expect(totalPayroll).toBeLessThan(250000);
  });
});
