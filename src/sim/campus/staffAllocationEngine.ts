/**
 * AUTO TYCOON CAMPUS HQ - STAFF ALLOCATION ENGINE (PHASE 24)
 * 
 * Manages employee assignment across campus sub-departments,
 * calculating staffing saturation, skill-match efficiencies, and operating output multipliers.
 */

import { CampusUnitId } from "./campusTypes";
import { getSubDepartmentDefinition } from "./subDepartmentTree";

export type EmployeeSpecialization =
  | "executive_management"
  | "powertrain_engineering"
  | "aerodynamicist"
  | "exterior_stylist"
  | "chassis_dynamics"
  | "interior_ergonomics"
  | "test_driver_technician"
  | "motorsport_engineer"
  | "commercial_fleet_engineer"
  | "manufacturing_assembly"
  | "procurement_logistics"
  | "quality_assurance"
  | "safety_crash_technician"
  | "marketing_sales"
  | "general_technician";

export interface CampusEmployeeAssignment {
  employeeId: string;
  unitId: CampusUnitId;
  subDepartmentId: string;
  specialization: EmployeeSpecialization;
  skillLevel: number; // 1 to 10
  morale: number; // 0 to 100
}

export interface SubDepartmentStaffingState {
  unitId: CampusUnitId;
  subDepartmentId: string;
  currentStaffCount: number;
  assignedEmployees: CampusEmployeeAssignment[];
  staffingRatio: number; // currentStaff / maxStaff
  understaffed: boolean;
  overstaffed: boolean;
  skillMatchScorePct: number; // 0 to 100
  netEfficiencyMultiplier: number; // e.g. 0.5 to 1.35
}

/**
 * Mapping between Unit ID and the ideal employee specialization
 */
export const UNIT_IDEAL_SPECIALIZATIONS: Record<CampusUnitId, EmployeeSpecialization[]> = {
  CENTRAL_CORPORATE_HQ: ["executive_management", "general_technician"],
  POWERTRAIN_EV_HQ: ["powertrain_engineering", "general_technician"],
  AERO_HQ: ["aerodynamicist", "general_technician"],
  VEHICLE_DESIGN_HQ: ["exterior_stylist", "interior_ergonomics"],
  CHASSIS_DYNAMICS_HQ: ["chassis_dynamics", "test_driver_technician"],
  INTERIOR_HQ: ["interior_ergonomics", "exterior_stylist"],
  TESTING_VALIDATION_HQ: ["test_driver_technician", "quality_assurance"],
  MOTORSPORT_HQ: ["motorsport_engineer", "test_driver_technician", "powertrain_engineering"],
  COMMERCIAL_VEHICLES_HQ: ["commercial_fleet_engineer", "powertrain_engineering"],
  FACTORY: ["manufacturing_assembly", "quality_assurance", "procurement_logistics"],
  SUPPLIER_PROCUREMENT_HQ: ["procurement_logistics", "general_technician"],
  QUALITY_RELIABILITY_HQ: ["quality_assurance", "general_technician"],
  SAFETY_HQ: ["safety_crash_technician", "chassis_dynamics"],
  MARKETING_SALES_HQ: ["marketing_sales", "general_technician"],
};

/**
 * Calculate efficiency of a sub-department based on headcount and specialization match
 */
export function calculateSubDepartmentEfficiency(
  unitId: CampusUnitId,
  subDeptId: string,
  assignedStaff: CampusEmployeeAssignment[]
): SubDepartmentStaffingState {
  const def = getSubDepartmentDefinition(unitId, subDeptId);
  const count = assignedStaff.length;
  const staffMin = def?.staffMin ?? 1;
  const staffMax = def?.staffMax ?? 5;

  const staffingRatio = Math.min(1.5, count / Math.max(1, staffMax));
  const understaffed = count < staffMin;
  const overstaffed = count > staffMax;

  // Calculate skill match
  const idealSpecs = UNIT_IDEAL_SPECIALIZATIONS[unitId] || ["general_technician"];
  let totalSkillWeight = 0;

  for (const emp of assignedStaff) {
    let matchMultiplier = 0.5; // Mismatched skill base
    if (idealSpecs.includes(emp.specialization)) {
      matchMultiplier = 1.0;
    } else if (emp.specialization === "general_technician") {
      matchMultiplier = 0.8;
    }

    const employeePower = (emp.skillLevel / 5) * (emp.morale / 100) * matchMultiplier;
    totalSkillWeight += employeePower;
  }

  const averageSkillScore = count > 0 ? (totalSkillWeight / count) * 100 : 0;
  const skillMatchScorePct = Math.min(100, Math.round(averageSkillScore));

  // Determine efficiency multiplier
  let efficiency = 1.0;
  if (count === 0) {
    efficiency = 0.0;
  } else if (understaffed) {
    efficiency = 0.5 * (count / staffMin);
  } else {
    // Normal to optimal staffing
    const baseStaffEfficiency = 0.7 + 0.3 * Math.min(1, count / staffMax);
    const skillBonus = (skillMatchScorePct / 100) * 0.3;
    efficiency = baseStaffEfficiency + skillBonus;

    // Overstaffing penalty (diminishing returns & crowding)
    if (overstaffed) {
      const excess = count - staffMax;
      efficiency -= excess * 0.05;
    }
  }

  return {
    unitId,
    subDepartmentId: subDeptId,
    currentStaffCount: count,
    assignedEmployees: assignedStaff,
    staffingRatio,
    understaffed,
    overstaffed,
    skillMatchScorePct,
    netEfficiencyMultiplier: Math.max(0, Math.round(efficiency * 100) / 100),
  };
}
