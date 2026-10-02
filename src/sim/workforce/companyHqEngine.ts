/**
 * ═══════════════════════════════════════════════════════════════════════
 * COMPANY HQ ORGANIZATIONAL ENGINE
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Implements Sections 13 to 23:
 * - HQ is the central organizational coordinator of the company, NOT a factory warehouse.
 * - Controls management capacity, maximum coordinated departments, and cross-functional project speed.
 * - Models HQ Overcapacity drag: when corporate growth outpaces HQ infrastructure.
 * - Generates regional headquarters and cross-site coordination metrics.
 */

import { CompanyHQState, DepartmentAggregation } from "./workforceTypes";

export interface HQCampusTierDefinition {
  level: number;
  name: string;
  eraAvailableYear: number;
  upgradeCost: number;
  monthlyMaintenanceCost: number;
  maxCorporateEmployees: number;
  maxSupportedDepartments: number;
  managementCapacityScore: number;
  rdCoordinationScore: number;
  communicationEfficiency: number;
  administrativeProwess: number;
  employeeAmenitiesScore: number;
  description: string;
}

export const HQ_CAMPUS_TIERS: Record<number, HQCampusTierDefinition> = {
  1: {
    level: 1,
    name: "Founding Works & Engineering Pavilion (1970)",
    eraAvailableYear: 1970,
    upgradeCost: 0,
    monthlyMaintenanceCost: 15000,
    maxCorporateEmployees: 35,
    maxSupportedDepartments: 8,
    managementCapacityScore: 70,
    rdCoordinationScore: 75,
    communicationEfficiency: 82,
    administrativeProwess: 68,
    employeeAmenitiesScore: 55,
    description: "Compact red-brick drawing office and prototype workshop. Direct founder oversight with zero bureaucratic lag.",
  },
  2: {
    level: 2,
    name: "Solihull Technical Center & Dyno Research Facility (1978)",
    eraAvailableYear: 1978,
    upgradeCost: 8500000, // ₹8.5M
    monthlyMaintenanceCost: 65000,
    maxCorporateEmployees: 120,
    maxSupportedDepartments: 14,
    managementCapacityScore: 80,
    rdCoordinationScore: 84,
    communicationEfficiency: 86,
    administrativeProwess: 78,
    employeeAmenitiesScore: 70,
    description: "Modernized engineering pavilion with soundproof dyno bays, drawing rooms, and central accounting wing.",
  },
  3: {
    level: 3,
    name: "Apex European Engineering Campus (1988)",
    eraAvailableYear: 1988,
    upgradeCost: 28000000, // ₹28M
    monthlyMaintenanceCost: 220000,
    maxCorporateEmployees: 350,
    maxSupportedDepartments: 18,
    managementCapacityScore: 88,
    rdCoordinationScore: 90,
    communicationEfficiency: 90,
    administrativeProwess: 85,
    employeeAmenitiesScore: 82,
    description: "Sprawling landscaped campus featuring an acoustic styling studio, supercomputer CAE hall, and executive boardroom.",
  },
  4: {
    level: 4,
    name: "Global R&D Headquarters & Technology Park (1998)",
    eraAvailableYear: 1998,
    upgradeCost: 75000000, // ₹75M
    monthlyMaintenanceCost: 550000,
    maxCorporateEmployees: 800,
    maxSupportedDepartments: 24,
    managementCapacityScore: 94,
    rdCoordinationScore: 95,
    communicationEfficiency: 94,
    administrativeProwess: 92,
    employeeAmenitiesScore: 90,
    description: "Full-scale corporate headquarters with glass atriums, virtual-reality styling dome, and automated archival systems.",
  },
  5: {
    level: 5,
    name: "Apex Planetary Automotive Super-Campus (2010+)",
    eraAvailableYear: 2010,
    upgradeCost: 220000000, // ₹220M
    monthlyMaintenanceCost: 1400000,
    maxCorporateEmployees: 2500,
    maxSupportedDepartments: 32,
    managementCapacityScore: 98,
    rdCoordinationScore: 99,
    communicationEfficiency: 97,
    administrativeProwess: 96,
    employeeAmenitiesScore: 96,
    description: "Architectural icon of automotive engineering excellence with carbon-neutral labs, proving grounds, and regional control hubs.",
  },
};

export interface HQOrganizationalDiagnostic {
  hqState: CompanyHQState;
  corporateStaffCount: number;
  corporateUtilizationPct: number;
  isOvercapacity: boolean;
  overcapacityExcessCount: number;
  coordinationDragPenaltyPct: number; // 0% to 40% project delay
  activeDepartmentsCount: number;
  departmentCapacityDeficit: number;  // if active > maxSupported
  organizationalSpanRatio: number;    // Total Company Employees / Corporate HQ Staff
  crossFunctionalSpeedRating: "BLAZING" | "SWIFT" | "STANDARD" | "DELAYED" | "PARALYZED";
  summaryNotes: string[];
}

/**
 * Evaluate the operational coordination and capacity health of Company HQ
 */
export function evaluateHQOrganization(
  hqState: CompanyHQState,
  departments: Record<string, DepartmentAggregation>,
  totalCompanyHeadcount: number
): HQOrganizationalDiagnostic {
  // 1. Calculate corporate staff count (Corporate division departments physically at HQ)
  let corporateStaffCount = 0;
  let activeDepartmentsCount = 0;

  for (const dept of Object.values(departments)) {
    if (dept.totalHeadcount > 0) {
      activeDepartmentsCount += 1;
    }
    // Only corporate division staff and directors physically occupy corporate HQ desks
    if (dept.division === "CORPORATE") {
      corporateStaffCount += dept.totalHeadcount;
    } else {
      // Add Directors (Rank 7) and Executives (Rank 8) who maintain offices at HQ
      const directorsAndExecs = (dept.headcountByRank[7] || 0) + (dept.headcountByRank[8] || 0);
      corporateStaffCount += directorsAndExecs;
    }
  }

  const maxCorp = hqState.maxCorporateEmployees;
  const corporateUtilizationPct = maxCorp > 0 ? Math.round((corporateStaffCount / maxCorp) * 100) : 100;
  const isOvercapacity = corporateStaffCount > maxCorp;
  const overcapacityExcessCount = Math.max(0, corporateStaffCount - maxCorp);

  // 2. Coordination Drag: If corporate staff exceeds HQ physical desk/administrative capacity
  let coordinationDragPenaltyPct = 0;
  if (isOvercapacity) {
    const excessRatio = overcapacityExcessCount / maxCorp;
    coordinationDragPenaltyPct = Math.min(40, Math.round(excessRatio * 35));
  }

  // 3. Department Coordination Capacity
  const maxDepts = hqState.maxSupportedDepartments;
  const departmentCapacityDeficit = Math.max(0, activeDepartmentsCount - maxDepts);
  if (departmentCapacityDeficit > 0) {
    coordinationDragPenaltyPct = Math.min(50, coordinationDragPenaltyPct + departmentCapacityDeficit * 6);
  }

  // 4. Organizational Span Ratio (Total Company Workers per Corporate HQ Staff)
  const organizationalSpanRatio = corporateStaffCount > 0
    ? Number((totalCompanyHeadcount / corporateStaffCount).toFixed(1))
    : totalCompanyHeadcount;

  // 5. Cross-Functional Speed Rating
  let crossFunctionalSpeedRating: HQOrganizationalDiagnostic["crossFunctionalSpeedRating"] = "STANDARD";
  const netCoordination = hqState.rdCoordinationScore - coordinationDragPenaltyPct;
  if (netCoordination >= 90) crossFunctionalSpeedRating = "BLAZING";
  else if (netCoordination >= 78) crossFunctionalSpeedRating = "SWIFT";
  else if (netCoordination >= 62) crossFunctionalSpeedRating = "STANDARD";
  else if (netCoordination >= 45) crossFunctionalSpeedRating = "DELAYED";
  else crossFunctionalSpeedRating = "PARALYZED";

  const summaryNotes: string[] = [];
  if (isOvercapacity) {
    summaryNotes.push(`HQ Overcapacity Warning: ${corporateStaffCount} corporate staff vs ${maxCorp} desk capacity.`);
    summaryNotes.push(`Inter-departmental communications suffering a ${coordinationDragPenaltyPct}% latency penalty.`);
    summaryNotes.push("Upgrade HQ campus tier to restore executive coordination and project velocity.");
  } else if (corporateUtilizationPct > 85) {
    summaryNotes.push(`HQ capacity approaching limits (${corporateUtilizationPct}% utilized). Plan next campus expansion.`);
  } else {
    summaryNotes.push(`HQ operating smoothly at ${corporateUtilizationPct}% capacity with rapid communication channels.`);
  }

  if (departmentCapacityDeficit > 0) {
    summaryNotes.push(`HQ currently coordinating ${activeDepartmentsCount} departments (supported limit: ${maxDepts}). Management bandwidth strained.`);
  }

  return {
    hqState: {
      ...hqState,
      currentCorporateStaff: corporateStaffCount,
      activeDepartmentsCount,
      isOvercapacity,
      overcapacityPenaltyPct: coordinationDragPenaltyPct,
    },
    corporateStaffCount,
    corporateUtilizationPct,
    isOvercapacity,
    overcapacityExcessCount,
    coordinationDragPenaltyPct,
    activeDepartmentsCount,
    departmentCapacityDeficit,
    organizationalSpanRatio,
    crossFunctionalSpeedRating,
    summaryNotes,
  };
}
