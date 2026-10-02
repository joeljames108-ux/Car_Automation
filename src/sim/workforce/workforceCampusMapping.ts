/**
 * 14-CAMPUS-UNIT WORKFORCE MAPPING & 1970 STARTER SEED (108 EMPLOYEES)
 * 
 * Invariants:
 * - Exactly 108 Starter Employees across the 9 Active Starter Units in 1970.
 * - UNIT_10 (Factory Complex) has 0 employees at start (Outsourced / unowned parcel).
 * - UNIT_03 (Aero), UNIT_08 (Motorsport), UNIT_09 (Commercial), UNIT_13 (Safety) have 0 employees (Locked).
 */

import { CampusUnitId, CampusUnitKey } from "../campus/campusTypes";
import { EmployeeRank } from "./workforceTypes";

export interface CampusFacilityWorkforceSeed {
  unitKey: CampusUnitKey;
  unitId: CampusUnitId;
  name: string;
  isStarterUnit: boolean;
  totalHeadcount1970: number;
  staffCapacity1970: number;
  headcountByRank: Record<EmployeeRank, number>;
  averageSkillScore: number;
  monthlyPayrollEur1970: number;
  primaryDiscipline: string;
  subDepartmentStaffing: {
    deptId: string;
    name: string;
    staffCount: number;
    specialization: string;
  }[];
}

export const INITIAL_1970_CAMPUS_WORKFORCE: Record<CampusUnitId, CampusFacilityWorkforceSeed> = {
  // ── UNIT_01: CENTRAL CORPORATE HQ (18 staff) ──
  CENTRAL_CORPORATE_HQ: {
    unitKey: "UNIT_01",
    unitId: "CENTRAL_CORPORATE_HQ",
    name: "Central Corporate HQ",
    isStarterUnit: true,
    totalHeadcount1970: 18,
    staffCapacity1970: 24,
    headcountByRank: { 1: 0, 2: 4, 3: 6, 4: 3, 5: 1, 6: 2, 7: 0, 8: 1, 9: 1 },
    averageSkillScore: 84,
    monthlyPayrollEur1970: 32400,
    primaryDiscipline: "CORPORATE_EXECUTIVE",
    subDepartmentStaffing: [
      { deptId: "corp_executive_legal", name: "Executive Suite & Legal", staffCount: 4, specialization: "STRATEGIC_GOVERNANCE" },
      { deptId: "corp_finance_treasury", name: "Corporate Finance & Capital", staffCount: 5, specialization: "FINANCIAL_CONTROL" },
      { deptId: "corp_hr_talent", name: "Human Resources & Talent", staffCount: 4, specialization: "RECRUITMENT_AND_BENEFITS" },
      { deptId: "corp_archives_data", name: "Archives, Patents & Registry", staffCount: 5, specialization: "INSTITUTIONAL_MEMORY" },
    ],
  },

  // ── UNIT_02: POWERTRAIN & EV HQ (20 staff) ──
  POWERTRAIN_EV_HQ: {
    unitKey: "UNIT_02",
    unitId: "POWERTRAIN_EV_HQ",
    name: "Powertrain & EV HQ",
    isStarterUnit: true,
    totalHeadcount1970: 20,
    staffCapacity1970: 30,
    headcountByRank: { 1: 1, 2: 5, 3: 6, 4: 4, 5: 2, 6: 2, 7: 0, 8: 0, 9: 0 },
    averageSkillScore: 78,
    monthlyPayrollEur1970: 31000,
    primaryDiscipline: "POWERTRAIN_ENGINEERING",
    subDepartmentStaffing: [
      { deptId: "pwr_ice_engineering", name: "Internal Combustion Engineering", staffCount: 8, specialization: "COMBUSTION_THERMODYNAMICS" },
      { deptId: "pwr_transmissions", name: "Transmissions & Geartrains", staffCount: 6, specialization: "GEAR_RATIO_OPTIMIZATION" },
      { deptId: "pwr_dyno_testing", name: "Analog Dyno Cells & Tuning", staffCount: 6, specialization: "DYNO_POWER_CALIBRATION" },
    ],
  },

  // ── UNIT_03: AERO HQ (0 staff - LOCKED) ──
  AERO_HQ: {
    unitKey: "UNIT_03",
    unitId: "AERO_HQ",
    name: "Aero HQ",
    isStarterUnit: false,
    totalHeadcount1970: 0,
    staffCapacity1970: 0,
    headcountByRank: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 },
    averageSkillScore: 0,
    monthlyPayrollEur1970: 0,
    primaryDiscipline: "AERODYNAMICS",
    subDepartmentStaffing: [],
  },

  // ── UNIT_04: VEHICLE DESIGN HQ (15 staff) ──
  VEHICLE_DESIGN_HQ: {
    unitKey: "UNIT_04",
    unitId: "VEHICLE_DESIGN_HQ",
    name: "Vehicle Design HQ",
    isStarterUnit: true,
    totalHeadcount1970: 15,
    staffCapacity1970: 20,
    headcountByRank: { 1: 0, 2: 3, 3: 5, 4: 4, 5: 1, 6: 1, 7: 1, 8: 0, 9: 0 },
    averageSkillScore: 82,
    monthlyPayrollEur1970: 24750,
    primaryDiscipline: "STYLING_AND_CMF",
    subDepartmentStaffing: [
      { deptId: "dsg_clay_exterior", name: "Clay Modeling & Exterior Styling", staffCount: 7, specialization: "CLAY_SCULPTING" },
      { deptId: "dsg_drafting_surfacing", name: "Technical Drafting & Surfacing", staffCount: 4, specialization: "BLUEPRINT_DRAFTING" },
      { deptId: "dsg_cmf_studio", name: "Color, Material & Finish (CMF)", staffCount: 4, specialization: "LUXURY_MATERIALS" },
    ],
  },

  // ── UNIT_05: CHASSIS & DYNAMICS HQ (12 staff) ──
  CHASSIS_DYNAMICS_HQ: {
    unitKey: "UNIT_05",
    unitId: "CHASSIS_DYNAMICS_HQ",
    name: "Chassis & Dynamics HQ",
    isStarterUnit: true,
    totalHeadcount1970: 12,
    staffCapacity1970: 18,
    headcountByRank: { 1: 1, 2: 2, 3: 4, 4: 2, 5: 1, 6: 2, 7: 0, 8: 0, 9: 0 },
    averageSkillScore: 75,
    monthlyPayrollEur1970: 18600,
    primaryDiscipline: "CHASSIS_DYNAMICS",
    subDepartmentStaffing: [
      { deptId: "chs_suspension_steering", name: "Suspension Geometry & Steering", staffCount: 6, specialization: "KINEMATICS" },
      { deptId: "chs_brakes_hydraulics", name: "Braking Systems & Hydraulics", staffCount: 6, specialization: "BRAKE_HYDRAULICS" },
    ],
  },

  // ── UNIT_06: INTERIOR HQ (10 staff) ──
  INTERIOR_HQ: {
    unitKey: "UNIT_06",
    unitId: "INTERIOR_HQ",
    name: "Interior HQ",
    isStarterUnit: true,
    totalHeadcount1970: 10,
    staffCapacity1970: 15,
    headcountByRank: { 1: 1, 2: 2, 3: 4, 4: 2, 5: 0, 6: 1, 7: 0, 8: 0, 9: 0 },
    averageSkillScore: 73,
    monthlyPayrollEur1970: 14500,
    primaryDiscipline: "CABIN_NVH_ERGONOMICS",
    subDepartmentStaffing: [
      { deptId: "int_ergonomics_hpoint", name: "Cabin Ergonomics & H-Point", staffCount: 5, specialization: "SEAT_FOAM_COMFORT" },
      { deptId: "int_upholstery_nvh", name: "Acoustic Insulation & Leather Trim", staffCount: 5, specialization: "FRENCH_SEAM_TRIM" },
    ],
  },

  // ── UNIT_07: TESTING & VALIDATION HQ (6 staff) ──
  TESTING_VALIDATION_HQ: {
    unitKey: "UNIT_07",
    unitId: "TESTING_VALIDATION_HQ",
    name: "Testing & Validation HQ",
    isStarterUnit: true,
    totalHeadcount1970: 6,
    staffCapacity1970: 10,
    headcountByRank: { 1: 1, 2: 1, 3: 2, 4: 1, 5: 0, 6: 1, 7: 0, 8: 0, 9: 0 },
    averageSkillScore: 72,
    monthlyPayrollEur1970: 9000,
    primaryDiscipline: "VEHICLE_TESTING",
    subDepartmentStaffing: [
      { deptId: "tst_skidpad_telemetry", name: "Skid Pad & Telemetry Crew", staffCount: 6, specialization: "TRACK_LOGGING" },
    ],
  },

  // ── UNIT_08: MOTORSPORT HQ (0 staff - LOCKED) ──
  MOTORSPORT_HQ: {
    unitKey: "UNIT_08",
    unitId: "MOTORSPORT_HQ",
    name: "Motorsport HQ",
    isStarterUnit: false,
    totalHeadcount1970: 0,
    staffCapacity1970: 0,
    headcountByRank: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 },
    averageSkillScore: 0,
    monthlyPayrollEur1970: 0,
    primaryDiscipline: "MOTORSPORT_RACING",
    subDepartmentStaffing: [],
  },

  // ── UNIT_09: COMMERCIAL VEHICLES HQ (0 staff - LOCKED) ──
  COMMERCIAL_VEHICLES_HQ: {
    unitKey: "UNIT_09",
    unitId: "COMMERCIAL_VEHICLES_HQ",
    name: "Commercial Vehicles HQ",
    isStarterUnit: false,
    totalHeadcount1970: 0,
    staffCapacity1970: 0,
    headcountByRank: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 },
    averageSkillScore: 0,
    monthlyPayrollEur1970: 0,
    primaryDiscipline: "FLEET_COMMERCIAL",
    subDepartmentStaffing: [],
  },

  // ── UNIT_10: FACTORY (0 staff - UNOWNED / OUTSOURCED) ──
  FACTORY: {
    unitKey: "UNIT_10",
    unitId: "FACTORY",
    name: "Production Factory",
    isStarterUnit: false,
    totalHeadcount1970: 0,
    staffCapacity1970: 0,
    headcountByRank: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 },
    averageSkillScore: 0,
    monthlyPayrollEur1970: 0,
    primaryDiscipline: "MANUFACTURING_ASSEMBLY",
    subDepartmentStaffing: [],
  },

  // ── UNIT_11: SUPPLIER & PROCUREMENT HQ (8 staff) ──
  SUPPLIER_PROCUREMENT_HQ: {
    unitKey: "UNIT_11",
    unitId: "SUPPLIER_PROCUREMENT_HQ",
    name: "Supplier & Procurement HQ",
    isStarterUnit: true,
    totalHeadcount1970: 8,
    staffCapacity1970: 12,
    headcountByRank: { 1: 1, 2: 2, 3: 3, 4: 1, 5: 0, 6: 1, 7: 0, 8: 0, 9: 0 },
    averageSkillScore: 70,
    monthlyPayrollEur1970: 11200,
    primaryDiscipline: "SUPPLY_CHAIN_PROCUREMENT",
    subDepartmentStaffing: [
      { deptId: "prc_vendor_contracts", name: "Vendor Contracts & Inbound Logistics", staffCount: 8, specialization: "PARTS_INTAKE" },
    ],
  },

  // ── UNIT_12: QUALITY & RELIABILITY HQ (6 staff) ──
  QUALITY_RELIABILITY_HQ: {
    unitKey: "UNIT_12",
    unitId: "QUALITY_RELIABILITY_HQ",
    name: "Quality & Reliability HQ",
    isStarterUnit: true,
    totalHeadcount1970: 6,
    staffCapacity1970: 10,
    headcountByRank: { 1: 1, 2: 1, 3: 2, 4: 1, 5: 0, 6: 1, 7: 0, 8: 0, 9: 0 },
    averageSkillScore: 76,
    monthlyPayrollEur1970: 9300,
    primaryDiscipline: "METROLOGY_QUALITY",
    subDepartmentStaffing: [
      { deptId: "qua_metrology_cmm", name: "Manual CMM & Tolerance Audit", staffCount: 6, specialization: "METROLOGY" },
    ],
  },

  // ── UNIT_13: SAFETY HQ (0 staff - LOCKED) ──
  SAFETY_HQ: {
    unitKey: "UNIT_13",
    unitId: "SAFETY_HQ",
    name: "Safety HQ",
    isStarterUnit: false,
    totalHeadcount1970: 0,
    staffCapacity1970: 0,
    headcountByRank: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 },
    averageSkillScore: 0,
    monthlyPayrollEur1970: 0,
    primaryDiscipline: "SAFETY_CRASHWORTHINESS",
    subDepartmentStaffing: [],
  },

  // ── UNIT_14: MARKETING & SALES HQ (13 staff) ──
  MARKETING_SALES_HQ: {
    unitKey: "UNIT_14",
    unitId: "MARKETING_SALES_HQ",
    name: "Marketing & Sales HQ",
    isStarterUnit: true,
    totalHeadcount1970: 13,
    staffCapacity1970: 18,
    headcountByRank: { 1: 1, 2: 3, 3: 5, 4: 2, 5: 0, 6: 2, 7: 0, 8: 0, 9: 0 },
    averageSkillScore: 74,
    monthlyPayrollEur1970: 18850,
    primaryDiscipline: "COMMERCIAL_MARKETING",
    subDepartmentStaffing: [
      { deptId: "mkt_dealer_liaison", name: "Dealer Sales & Showroom Liaison", staffCount: 5, specialization: "DEALER_DISTRIBUTION" },
      { deptId: "mkt_print_advertising", name: "Print Advertising & Press Relations", staffCount: 5, specialization: "PRESS_ADVERTISING" },
      { deptId: "mkt_customer_support", name: "Customer Service & Inquiries", staffCount: 3, specialization: "CUSTOMER_RELATIONS" },
    ],
  },
};

export type CampusFacilityWorkforceProfile = CampusFacilityWorkforceSeed & {
  facilityName: string;
};

export const CAMPUS_FACILITY_WORKFORCE_MAPPING: Record<string, CampusFacilityWorkforceProfile> = (() => {
  const map: Record<string, CampusFacilityWorkforceProfile> = {};
  for (const seed of Object.values(INITIAL_1970_CAMPUS_WORKFORCE)) {
    const profile: CampusFacilityWorkforceProfile = {
      ...seed,
      facilityName: seed.name,
    };
    map[seed.unitKey] = profile;
    map[seed.unitId] = profile;
  }
  return map;
})();

export function getStarting1970CampusHeadcount(): Record<string, number> {
  const result: Record<string, number> = {};
  for (const seed of Object.values(INITIAL_1970_CAMPUS_WORKFORCE)) {
    result[seed.unitKey] = seed.totalHeadcount1970;
  }
  return result;
}

export class WorkforceCampusMapping {
  /**
   * Sums total starter employees across all 14 campus units (must equal exactly 108)
   */
  public static calculateTotalStarterHeadcount(): number {
    return Object.values(INITIAL_1970_CAMPUS_WORKFORCE).reduce((sum, u) => sum + u.totalHeadcount1970, 0);
  }

  /**
   * Sums total monthly payroll across all facilities at 1970 start
   */
  public static calculateTotal1970Payroll(): number {
    return Object.values(INITIAL_1970_CAMPUS_WORKFORCE).reduce((sum, u) => sum + u.monthlyPayrollEur1970, 0);
  }

  /**
   * Get staffing details for a specific campus facility
   */
  public static getFacilityStaffing(unitId: CampusUnitId): CampusFacilityWorkforceSeed {
    return INITIAL_1970_CAMPUS_WORKFORCE[unitId];
  }
}

