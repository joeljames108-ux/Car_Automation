/**
 * ═══════════════════════════════════════════════════════════════════════
 * WORKFORCE MASTER STORE — 3-LEVEL REPRESENTATION & HQ ARCHITECTURE
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Implements:
 * - Level 1: Total company headcount, master skill index, and organizational health
 * - Level 2: Department-level aggregates, rank pyramids, and workload vs capacity
 * - Level 3: Individual Key Personnel records (EMP-XXXXXX dossiers)
 * - HQ Organizational Layer: Capacity limits, coordination scores, overcapacity drag
 */

import { create } from "zustand";
import {
  Employee,
  EmployeeId,
  DepartmentId,
  DepartmentAggregation,
  CompanyHQState,
  CompanyWorkforceSummary,
  EmployeeRank,
  DivisionType,
  RANK_NAMES,
} from "../sim/workforce/workforceTypes";
import {
  INITIAL_1970_KEY_EMPLOYEES,
  generateInitial1970Departments,
} from "../sim/workforce/initial1970Workforce";
import {
  generateNextEmployeeId,
  syncIdCounterWithExisting,
} from "../sim/workforce/employeeIdGenerator";
import { executeMonthlyWorkforceTick, MonthlyWorkforceTickReport } from "../sim/workforce/monthlyWorkforceTick";
import { EmployeeCandidate, hireRecruitedCandidate } from "../sim/workforce/recruitmentEngine";
import {
  CampusFacilityWorkforceSeed,
  INITIAL_1970_CAMPUS_WORKFORCE,
  CAMPUS_FACILITY_WORKFORCE_MAPPING,
} from "../sim/workforce/workforceCampusMapping";
import {
  FacilityWorkloadIntensity,
  FacilityWorkloadReport,
  CampusWorkloadRollup,
  FacilityWorkloadAndFatigueEngine,
} from "../sim/workforce/facilityWorkloadAndFatigue";
import {
  CorporateArchiveLevel,
  CampusInstitutionalMemoryAudit,
  InstitutionalMemoryEngine,
} from "../sim/workforce/institutionalMemoryEngine";

export interface WorkforceState {
  // Master Level 1 Data
  totalHeadcount: number;
  totalKeyPersonnel: number;
  companySummary: CompanyWorkforceSummary;

  // Level 2 Department Aggregations
  departments: Record<DepartmentId, DepartmentAggregation>;

  // Level 3 Key Personnel Map (Record keyed by EmployeeId)
  keyPersonnel: Record<EmployeeId, Employee>;

  // Central HQ State
  hqState: CompanyHQState;

  // Actions
  hireAggregatedStaff: (deptId: DepartmentId, rank: EmployeeRank, count: number, baseSkill?: number) => void;
  reduceAggregatedStaff: (deptId: DepartmentId, rank: EmployeeRank, count: number) => void;
  addKeyEmployee: (employee: Omit<Employee, "id">) => Employee;
  updateKeyEmployee: (id: EmployeeId, patch: Partial<Employee>) => void;
  promoteEmployee: (id: EmployeeId, newRank: EmployeeRank) => void;
  transferEmployee: (id: EmployeeId, newDeptId: DepartmentId) => void;
  updateDepartmentWorkload: (deptId: DepartmentId, demandWU: number) => void;
  upgradeHQLevel: () => void;
  hireKeyCandidate: (candidate: EmployeeCandidate, departmentId: DepartmentId, currentYear?: number, currentMonth?: number) => Employee;
  tickMonthlySimulation: (year: number, month: number, isEraTransition?: boolean) => MonthlyWorkforceTickReport;
  get12KeyMetrics: () => {
    totalEmployees: number;
    employeesByDepartment: Record<string, number>;
    employeesByRank: {
      junior: number;      // Rank 1-2
      specialist: number;  // Rank 3-4
      principal: number;   // Rank 5
      management: number;  // Rank 6-9
      raw: Record<EmployeeRank, number>;
    };
    averageSkill: number;
    specialistSkill: number;
    effectiveCapacityWU: number;
    managementCapacityScore: number;
    hqOrganizationalCapacity: {
      corporateDesksOccupied: number;
      maxDesks: number;
      utilizationPct: number;
      isOvercapacity: boolean;
    };
    estimatedMonthlyPayroll: number;
    employeeSatisfaction: number;
    monthlyTurnoverRatePct: number;
    employerReputation: number;
  };

  // 14-Campus-Unit Workforce Layer (Phase 8)
  campusFacilityWorkforce: Record<string, CampusFacilityWorkforceSeed>;
  facilityOvertimePolicies: Record<string, FacilityWorkloadIntensity>;
  corporateArchiveLevel: CorporateArchiveLevel;

  setFacilityOvertimeIntensity: (facilityId: string, intensity: FacilityWorkloadIntensity) => void;
  upgradeCorporateArchiveLevel: () => void;
  getFacilityWorkloadReport: (facilityId: string) => FacilityWorkloadReport;
  getCampusWorkloadRollup: () => CampusWorkloadRollup;
  getCampusInstitutionalMemoryAudit: () => CampusInstitutionalMemoryAudit;
  reassignStaffBetweenFacilities: (fromFacilityId: string, toFacilityId: string, count: number) => void;
  recalculateAllMetrics: () => void;
  resetTo1970: () => void;
}

const INITIAL_1970_HQ: CompanyHQState = {
  hqLevel: 1, // Founding Brick Workshop
  campusName: "Apex Works & Engineering Pavilion (1970)",
  locationCity: "Coventry / Solihull",
  locationCountry: "United Kingdom",
  maxCorporateEmployees: 30,
  currentCorporateStaff: 5,
  maxSupportedDepartments: 8,
  activeDepartmentsCount: 7,
  managementCapacityScore: 78,
  rdCoordinationScore: 82,
  communicationEfficiency: 88,
  administrativeProwess: 75,
  employeeAmenitiesScore: 65,
  isOvercapacity: false,
  overcapacityPenaltyPct: 0,
};

function buildKeyPersonnelRecord(list: Employee[]): Record<EmployeeId, Employee> {
  const rec: Record<EmployeeId, Employee> = {};
  for (const emp of list) {
    rec[emp.id] = { ...emp };
  }
  return rec;
}

function computeSummary(
  depts: Record<DepartmentId, DepartmentAggregation>,
  keyCount: number
): { totalCount: number; summary: CompanyWorkforceSummary } {
  let totalCount = 0;
  let totalSkillWeighted = 0;
  let totalMoraleWeighted = 0;
  let totalEffectiveWU = 0;

  const divCounts: Record<DivisionType, number> = {
    TECHNICAL: 0,
    OPERATIONAL: 0,
    COMMERCIAL: 0,
    CORPORATE: 0,
    MOTORSPORT: 0,
  };

  let totalManagers = 0;
  let totalSubordinates = 0;

  for (const dept of Object.values(depts)) {
    const cnt = dept.totalHeadcount;
    totalCount += cnt;
    divCounts[dept.division] = (divCounts[dept.division] || 0) + cnt;
    totalSkillWeighted += cnt * dept.averageOverallSkill;
    totalMoraleWeighted += cnt * dept.averageMorale;
    totalEffectiveWU += dept.monthlyWorkUnitsCapacity;
    totalManagers += dept.managementCount;
    totalSubordinates += dept.subordinateCount;
  }

  const avgSkill = totalCount > 0 ? Math.round(totalSkillWeighted / totalCount) : 50;
  const avgMorale = totalCount > 0 ? Math.round(totalMoraleWeighted / totalCount) : 80;

  const overallSpanRatio = totalManagers > 0 ? totalSubordinates / totalManagers : 0;
  let managementSpanHealth: CompanyWorkforceSummary["managementSpanHealth"] = "BALANCED";
  if (overallSpanRatio > 25) managementSpanHealth = "HAZARDOUS";
  else if (overallSpanRatio > 16) managementSpanHealth = "STRAINED";
  else if (overallSpanRatio <= 10) managementSpanHealth = "EXCELLENT";

  return {
    totalCount,
    summary: {
      totalEmployees: totalCount,
      totalKeyPersonnel: keyCount,
      employeesByDivision: divCounts,
      averageCompanySkill: avgSkill,
      overallMorale: avgMorale,
      overallTurnoverRatePct: Number((3.5 + Math.max(0, 80 - avgMorale) * 0.15).toFixed(1)),
      managementSpanHealth,
      effectiveCompanyWorkforceUnits: totalEffectiveWU,
    },
  };
}

export const useWorkforceStore = create<WorkforceState>((set, get) => {
  const initialKeyPersonnel = buildKeyPersonnelRecord(INITIAL_1970_KEY_EMPLOYEES);
  const initialDepts = generateInitial1970Departments();
  const { totalCount, summary } = computeSummary(initialDepts, INITIAL_1970_KEY_EMPLOYEES.length);

  // Sync permanent ID counter
  syncIdCounterWithExisting(INITIAL_1970_KEY_EMPLOYEES.map((e) => e.id));

  return {
    totalHeadcount: totalCount,
    totalKeyPersonnel: INITIAL_1970_KEY_EMPLOYEES.length,
    companySummary: summary,
    departments: initialDepts,
    keyPersonnel: initialKeyPersonnel,
    hqState: { ...INITIAL_1970_HQ },

    // Campus Facility Workforce (Phase 8)
    campusFacilityWorkforce: { ...CAMPUS_FACILITY_WORKFORCE_MAPPING },
    facilityOvertimePolicies: {
      UNIT_01: "standard_40h",
      UNIT_02: "standard_40h",
      UNIT_03: "standard_40h",
      UNIT_04: "standard_40h",
      UNIT_05: "standard_40h",
      UNIT_06: "standard_40h",
      UNIT_07: "standard_40h",
      UNIT_08: "standard_40h",
      UNIT_09: "standard_40h",
      UNIT_10: "standard_40h",
      UNIT_11: "standard_40h",
      UNIT_12: "standard_40h",
      UNIT_13: "standard_40h",
      UNIT_14: "standard_40h",
    },
    corporateArchiveLevel: 1,

    hireAggregatedStaff: (deptId, rank, count, baseSkill = 60) => {
      set((state) => {
        const dept = state.departments[deptId];
        if (!dept) return state;

        const newRanks = { ...dept.headcountByRank };
        newRanks[rank] = (newRanks[rank] || 0) + count;

        const newTotal = Object.values(newRanks).reduce((a, b) => a + b, 0);
        let newManagers = 0;
        let newSubordinates = 0;
        for (const [rStr, c] of Object.entries(newRanks)) {
          if (Number(rStr) >= 6) newManagers += c;
          else newSubordinates += c;
        }

        const spanRatio = newManagers > 0 ? Number((newSubordinates / newManagers).toFixed(1)) : newSubordinates;
        let spanHealth: DepartmentAggregation["spanHealth"] = "OPTIMAL";
        if (spanRatio > 18) spanHealth = "CRITICAL_DEFICIT";
        else if (spanRatio > 12) spanHealth = "STRAINED";
        else if (spanRatio < 4) spanHealth = "HEALTHY";

        // Weighted skill adjustment
        const currentTotalSkill = dept.totalHeadcount * dept.averageOverallSkill;
        const newTotalSkill = currentTotalSkill + count * baseSkill;
        const newAvgSkill = newTotal > 0 ? Math.round(newTotalSkill / newTotal) : 50;

        // Rank productivity multiplier
        const rankProd = RANK_NAMES[rank].baseProductivity;
        const addedCapacity = Math.round(count * 180 * rankProd * (baseSkill / 100));
        const newCapacity = dept.monthlyWorkUnitsCapacity + addedCapacity;
        const newDemand = dept.monthlyWorkUnitsDemand;
        const newUtil = newCapacity > 0 ? Math.round((newDemand / newCapacity) * 100) : 100;

        const updatedDept: DepartmentAggregation = {
          ...dept,
          totalHeadcount: newTotal,
          headcountByRank: newRanks,
          averageOverallSkill: newAvgSkill,
          managementCount: newManagers,
          subordinateCount: newSubordinates,
          spanRatio,
          spanHealth,
          monthlyWorkUnitsCapacity: newCapacity,
          utilizationPercentage: newUtil,
          capacityDeficitOrSurplus: newCapacity - newDemand,
        };

        const updatedDepts = {
          ...state.departments,
          [deptId]: updatedDept,
        };

        const { totalCount: nextTotal, summary: nextSummary } = computeSummary(
          updatedDepts,
          state.totalKeyPersonnel
        );

        return {
          totalHeadcount: nextTotal,
          departments: updatedDepts,
          companySummary: nextSummary,
        };
      });
    },

    reduceAggregatedStaff: (deptId, rank, count) => {
      set((state) => {
        const dept = state.departments[deptId];
        if (!dept) return state;

        const currentInRank = dept.headcountByRank[rank] || 0;
        const toRemove = Math.min(currentInRank, Math.max(0, count));
        if (toRemove <= 0) return state;

        const newRanks = { ...dept.headcountByRank };
        newRanks[rank] = currentInRank - toRemove;

        const newTotal = Object.values(newRanks).reduce((a, b) => a + b, 0);
        let newManagers = 0;
        let newSubordinates = 0;
        for (const [rStr, c] of Object.entries(newRanks)) {
          if (Number(rStr) >= 6) newManagers += c;
          else newSubordinates += c;
        }

        const spanRatio = newManagers > 0 ? Number((newSubordinates / newManagers).toFixed(1)) : newSubordinates;
        const rankProd = RANK_NAMES[rank].baseProductivity;
        const removedCapacity = Math.round(toRemove * 180 * rankProd * (dept.averageOverallSkill / 100));
        const newCapacity = Math.max(0, dept.monthlyWorkUnitsCapacity - removedCapacity);
        const newDemand = dept.monthlyWorkUnitsDemand;
        const newUtil = newCapacity > 0 ? Math.round((newDemand / newCapacity) * 100) : 100;

        const updatedDept: DepartmentAggregation = {
          ...dept,
          totalHeadcount: newTotal,
          headcountByRank: newRanks,
          managementCount: newManagers,
          subordinateCount: newSubordinates,
          spanRatio,
          monthlyWorkUnitsCapacity: newCapacity,
          utilizationPercentage: newUtil,
          capacityDeficitOrSurplus: newCapacity - newDemand,
        };

        const updatedDepts = {
          ...state.departments,
          [deptId]: updatedDept,
        };

        const { totalCount: nextTotal, summary: nextSummary } = computeSummary(
          updatedDepts,
          state.totalKeyPersonnel
        );

        return {
          totalHeadcount: nextTotal,
          departments: updatedDepts,
          companySummary: nextSummary,
        };
      });
    },

    addKeyEmployee: (empData) => {
      const newId = generateNextEmployeeId();
      const newEmployee: Employee = {
        ...empData,
        id: newId,
        isKeyPersonnel: true,
      };

      set((state) => {
        const nextKeyMap = {
          ...state.keyPersonnel,
          [newId]: newEmployee,
        };

        // Attach to department aggregation
        const dept = state.departments[newEmployee.departmentId];
        let updatedDepts = state.departments;
        if (dept) {
          const nextKeyIds = [...dept.keyPersonnelIds, newId];
          const nextRanks = { ...dept.headcountByRank };
          nextRanks[newEmployee.rank] = (nextRanks[newEmployee.rank] || 0) + 1;
          const nextTotal = Object.values(nextRanks).reduce((a, b) => a + b, 0);

          updatedDepts = {
            ...state.departments,
            [newEmployee.departmentId]: {
              ...dept,
              totalHeadcount: nextTotal,
              headcountByRank: nextRanks,
              keyPersonnelIds: nextKeyIds,
            },
          };
        }

        const nextKeyCount = Object.keys(nextKeyMap).length;
        const { totalCount: nextTotal, summary: nextSummary } = computeSummary(
          updatedDepts,
          nextKeyCount
        );

        return {
          keyPersonnel: nextKeyMap,
          totalKeyPersonnel: nextKeyCount,
          totalHeadcount: nextTotal,
          departments: updatedDepts,
          companySummary: nextSummary,
        };
      });

      return newEmployee;
    },

    updateKeyEmployee: (id, patch) => {
      set((state) => {
        const current = state.keyPersonnel[id];
        if (!current) return state;

        return {
          keyPersonnel: {
            ...state.keyPersonnel,
            [id]: { ...current, ...patch },
          },
        };
      });
    },

    promoteEmployee: (id, newRank) => {
      set((state) => {
        const current = state.keyPersonnel[id];
        if (!current) return state;

        const oldRank = current.rank;
        if (oldRank === newRank) return state;

        const milestone = {
          year: 1970 + Math.floor(current.tenureMonthsWithCompany / 12),
          month: (current.tenureMonthsWithCompany % 12) + 1,
          event: "PROMOTED" as const,
          description: `Promoted from ${RANK_NAMES[oldRank].title} to ${RANK_NAMES[newRank].title}`,
        };

        const updatedEmp: Employee = {
          ...current,
          rank: newRank,
          careerLog: [...current.careerLog, milestone],
          productivity: Number((current.productivity * 1.08).toFixed(2)),
          morale: Math.min(100, current.morale + 8),
          loyalty: Math.min(100, current.loyalty + 5),
        };

        // Update department rank distribution
        const dept = state.departments[current.departmentId];
        let updatedDepts = state.departments;
        if (dept) {
          const nextRanks = { ...dept.headcountByRank };
          nextRanks[oldRank] = Math.max(0, (nextRanks[oldRank] || 1) - 1);
          nextRanks[newRank] = (nextRanks[newRank] || 0) + 1;

          updatedDepts = {
            ...state.departments,
            [current.departmentId]: {
              ...dept,
              headcountByRank: nextRanks,
            },
          };
        }

        return {
          keyPersonnel: {
            ...state.keyPersonnel,
            [id]: updatedEmp,
          },
          departments: updatedDepts,
        };
      });
    },

    transferEmployee: (id, newDeptId) => {
      set((state) => {
        const current = state.keyPersonnel[id];
        if (!current || current.departmentId === newDeptId) return state;

        const oldDeptId = current.departmentId;
        const oldDept = state.departments[oldDeptId];
        const newDept = state.departments[newDeptId];
        if (!oldDept || !newDept) return state;

        // Remove from old
        const oldRanks = { ...oldDept.headcountByRank };
        oldRanks[current.rank] = Math.max(0, (oldRanks[current.rank] || 1) - 1);
        const oldKeys = oldDept.keyPersonnelIds.filter((kId) => kId !== id);

        // Add to new
        const newRanks = { ...newDept.headcountByRank };
        newRanks[current.rank] = (newRanks[current.rank] || 0) + 1;
        const newKeys = [...newDept.keyPersonnelIds, id];

        const milestone = {
          year: 1970 + Math.floor(current.tenureMonthsWithCompany / 12),
          month: (current.tenureMonthsWithCompany % 12) + 1,
          event: "TRANSFERRED" as const,
          description: `Transferred from ${oldDept.departmentName} to ${newDept.departmentName}`,
        };

        const updatedEmp: Employee = {
          ...current,
          departmentId: newDeptId,
          division: newDept.division,
          careerLog: [...current.careerLog, milestone],
        };

        const updatedDepts = {
          ...state.departments,
          [oldDeptId]: {
            ...oldDept,
            totalHeadcount: Math.max(0, oldDept.totalHeadcount - 1),
            headcountByRank: oldRanks,
            keyPersonnelIds: oldKeys,
          },
          [newDeptId]: {
            ...newDept,
            totalHeadcount: newDept.totalHeadcount + 1,
            headcountByRank: newRanks,
            keyPersonnelIds: newKeys,
          },
        };

        return {
          keyPersonnel: {
            ...state.keyPersonnel,
            [id]: updatedEmp,
          },
          departments: updatedDepts,
        };
      });
    },

    updateDepartmentWorkload: (deptId, demandWU) => {
      set((state) => {
        const dept = state.departments[deptId];
        if (!dept) return state;

        const cap = dept.monthlyWorkUnitsCapacity;
        const util = cap > 0 ? Math.round((demandWU / cap) * 100) : 100;
        let burnout: DepartmentAggregation["burnoutRiskLevel"] = "NONE";
        if (util > 130) burnout = "CRITICAL";
        else if (util > 110) burnout = "ELEVATED";
        else if (util > 95) burnout = "LOW";

        return {
          departments: {
            ...state.departments,
            [deptId]: {
              ...dept,
              monthlyWorkUnitsDemand: demandWU,
              utilizationPercentage: util,
              capacityDeficitOrSurplus: cap - demandWU,
              burnoutRiskLevel: burnout,
            },
          },
        };
      });
    },

    upgradeHQLevel: () => {
      set((state) => {
        const curLevel = state.hqState.hqLevel;
        if (curLevel >= 5) return state;

        const nextLevel = curLevel + 1;
        const campusTiers = [
          "Apex Works & Engineering Pavilion (1970)",
          "Solihull Technical Center & Dyno Labs (1978)",
          "Apex European Engineering Campus (1988)",
          "Global R&D Headquarters & Innovation Center (1998)",
          "Apex Planetary Automotive Super-Campus (2010+)",
        ];

        return {
          hqState: {
            ...state.hqState,
            hqLevel: nextLevel,
            campusName: campusTiers[nextLevel - 1],
            maxCorporateEmployees: nextLevel * 60,
            maxSupportedDepartments: 8 + nextLevel * 3,
            managementCapacityScore: Math.min(100, 75 + nextLevel * 5),
            rdCoordinationScore: Math.min(100, 80 + nextLevel * 4),
            communicationEfficiency: Math.min(100, 85 + nextLevel * 3),
            administrativeProwess: Math.min(100, 70 + nextLevel * 6),
            employeeAmenitiesScore: Math.min(100, 60 + nextLevel * 8),
          },
        };
      });
    },

    hireKeyCandidate: (candidate, departmentId, currentYear = 1970, currentMonth = 1) => {
      const newEmp = hireRecruitedCandidate(candidate, departmentId, currentYear, currentMonth);

      set((state) => {
        const targetDept = state.departments[departmentId];
        const updatedRanks = { ...targetDept.headcountByRank };
        updatedRanks[newEmp.rank] = (updatedRanks[newEmp.rank] || 0) + 1;
        const newTotal = targetDept.totalHeadcount + 1;

        const updatedDept: DepartmentAggregation = {
          ...targetDept,
          totalHeadcount: newTotal,
          headcountByRank: updatedRanks,
          keyPersonnelIds: [...targetDept.keyPersonnelIds, newEmp.id],
          monthlyWorkUnitsCapacity: Math.round(newTotal * 180 * (targetDept.averageOverallSkill / 100)),
        };

        const updatedDepts = {
          ...state.departments,
          [departmentId]: updatedDept,
        };

        const updatedKey = {
          ...state.keyPersonnel,
          [newEmp.id]: newEmp,
        };

        const { totalCount, summary } = computeSummary(updatedDepts, Object.keys(updatedKey).length);

        return {
          totalHeadcount: totalCount,
          totalKeyPersonnel: Object.keys(updatedKey).length,
          departments: updatedDepts,
          keyPersonnel: updatedKey,
          companySummary: summary,
        };
      });

      return newEmp;
    },

    tickMonthlySimulation: (year, month, isEraTransition = false) => {
      let tickReport: MonthlyWorkforceTickReport;

      set((state) => {
        const { updatedKeyPersonnel, updatedDepartments, report } = executeMonthlyWorkforceTick(
          state.keyPersonnel,
          state.departments,
          year,
          month,
          isEraTransition
        );

        tickReport = report;

        const { totalCount, summary } = computeSummary(
          updatedDepartments,
          Object.keys(updatedKeyPersonnel).length
        );

        return {
          totalHeadcount: totalCount,
          departments: updatedDepartments,
          keyPersonnel: updatedKeyPersonnel,
          companySummary: summary,
        };
      });

      return tickReport!;
    },

    get12KeyMetrics: () => {
      const state = get();
      const rawRanks: Record<EmployeeRank, number> = {
        1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0,
      };

      const employeesByDept: Record<string, number> = {};
      let corporateOccupied = 0;
      let peakSpec = 0;

      for (const [depId, dept] of Object.entries(state.departments)) {
        employeesByDept[depId] = dept.totalHeadcount;
        for (let r = 1; r <= 9; r++) {
          rawRanks[r as EmployeeRank] += dept.headcountByRank[r as EmployeeRank] || 0;
        }
        if (dept.dominantSpecializations && dept.dominantSpecializations.length > 0) {
          const top = dept.dominantSpecializations[0].avgScore;
          if (top > peakSpec) peakSpec = top;
        }
        if (dept.division === "CORPORATE") {
          corporateOccupied += dept.totalHeadcount;
        } else {
          corporateOccupied += (dept.headcountByRank[7] || 0) + (dept.headcountByRank[8] || 0);
        }
      }

      // Check key personnel for peak spec
      for (const emp of Object.values(state.keyPersonnel)) {
        if (emp.specializationScore > peakSpec) peakSpec = emp.specializationScore;
      }

      const junior = rawRanks[1] + rawRanks[2];
      const specialist = rawRanks[3] + rawRanks[4];
      const principal = rawRanks[5];
      const management = rawRanks[6] + rawRanks[7] + rawRanks[8] + rawRanks[9];

      // Rank payroll bands (benchmark monthly in ₹)
      const rankSalaries: Record<EmployeeRank, number> = {
        1: 4500,
        2: 7000,
        3: 12000,
        4: 18500,
        5: 29000,
        6: 36000,
        7: 52000,
        8: 80000,
        9: 120000,
      };

      let estimatedMonthlyPayroll = 0;
      for (let r = 1; r <= 9; r++) {
        estimatedMonthlyPayroll += rawRanks[r as EmployeeRank] * rankSalaries[r as EmployeeRank];
      }

      const maxDesks = state.hqState.maxCorporateEmployees;
      const utilizationPct = maxDesks > 0 ? Math.round((corporateOccupied / maxDesks) * 100) : 100;
      const isOver = corporateOccupied > maxDesks;

      const avgMorale = state.companySummary.overallMorale ?? 85;
      const monthlyTurnoverRatePct = avgMorale > 80 ? 0.3 : avgMorale > 60 ? 0.8 : avgMorale > 40 ? 1.9 : 4.5;

      return {
        totalEmployees: state.totalHeadcount,
        employeesByDepartment: employeesByDept,
        employeesByRank: {
          junior,
          specialist,
          principal,
          management,
          raw: rawRanks,
        },
        averageSkill: state.companySummary.averageCompanySkill,
        specialistSkill: peakSpec || 85,
        effectiveCapacityWU: state.companySummary.effectiveCompanyWorkforceUnits,
        managementCapacityScore: state.hqState.managementCapacityScore,
        hqOrganizationalCapacity: {
          corporateDesksOccupied: corporateOccupied,
          maxDesks,
          utilizationPct,
          isOvercapacity: isOver,
        },
        estimatedMonthlyPayroll,
        employeeSatisfaction: avgMorale,
        monthlyTurnoverRatePct,
        employerReputation: 76,
      };
    },

    recalculateAllMetrics: () => {
      set((state) => {
        const { totalCount, summary } = computeSummary(
          state.departments,
          state.totalKeyPersonnel
        );
        return {
          totalHeadcount: totalCount,
          companySummary: summary,
        };
      });
    },

    setFacilityOvertimeIntensity: (facilityId, intensity) => {
      set((state) => ({
        facilityOvertimePolicies: {
          ...state.facilityOvertimePolicies,
          [facilityId]: intensity,
        },
      }));
    },

    upgradeCorporateArchiveLevel: () => {
      set((state) => ({
        corporateArchiveLevel: Math.min(4, state.corporateArchiveLevel + 1) as CorporateArchiveLevel,
      }));
    },

    getFacilityWorkloadReport: (facilityId) => {
      const state = get();
      const intensity = state.facilityOvertimePolicies[facilityId] || "standard_40h";
      const profile = (state.campusFacilityWorkforce as any)[facilityId] || CAMPUS_FACILITY_WORKFORCE_MAPPING[facilityId];
      const headcount = profile ? profile.totalHeadcount1970 : 0;
      const capacityWU = headcount * 180;
      const demandWU = headcount * 160;

      return FacilityWorkloadAndFatigueEngine.evaluateFacilityWorkload(
        facilityId,
        intensity,
        intensity === "standard_40h" ? 0 : 1,
        headcount,
        capacityWU,
        demandWU
      );
    },

    getCampusWorkloadRollup: () => {
      const state = get();
      const policies: any = {};
      const headcounts: Record<string, number> = {};
      const capacities: Record<string, number> = {};
      const demands: Record<string, number> = {};

      for (let i = 1; i <= 14; i++) {
        const uKey = `UNIT_${i < 10 ? "0" + i : i}`;
        const intensity = state.facilityOvertimePolicies[uKey] || "standard_40h";
        policies[uKey] = {
          facilityId: uKey,
          intensity,
          consecutiveCrunchMonths: intensity === "standard_40h" ? 0 : 1,
        };
        const prof = (state.campusFacilityWorkforce as any)[uKey] || CAMPUS_FACILITY_WORKFORCE_MAPPING[uKey];
        const count = prof ? prof.totalHeadcount1970 : 0;
        headcounts[uKey] = count;
        capacities[uKey] = count * 180;
        demands[uKey] = count * 150;
      }

      return FacilityWorkloadAndFatigueEngine.evaluateCampusWorkloadRollup(
        policies,
        headcounts,
        capacities,
        demands
      );
    },

    getCampusInstitutionalMemoryAudit: () => {
      const state = get();
      return InstitutionalMemoryEngine.auditCampusInstitutionalMemory(
        state.corporateArchiveLevel,
        {
          powertrain: { ipPoints: 420, patents: 2, docsPct: 70, veterans: 3 },
          chassis: { ipPoints: 340, patents: 1, docsPct: 65, veterans: 2 },
          styling: { ipPoints: 310, patents: 1, docsPct: 60, veterans: 2 },
          interior: { ipPoints: 260, patents: 0, docsPct: 55, veterans: 1 },
          manufacturing: { ipPoints: 220, patents: 1, docsPct: 50, veterans: 1 },
          quality: { ipPoints: 280, patents: 0, docsPct: 75, veterans: 1 },
        }
      );
    },

    reassignStaffBetweenFacilities: (fromFacilityId, toFacilityId, count) => {
      set((state) => {
        const fromProfile = (state.campusFacilityWorkforce as any)[fromFacilityId];
        const toProfile = (state.campusFacilityWorkforce as any)[toFacilityId];
        if (!fromProfile || !toProfile || fromProfile.totalHeadcount1970 < count) return state;

        const updatedFrom = { ...fromProfile, totalHeadcount1970: fromProfile.totalHeadcount1970 - count };
        const updatedTo = { ...toProfile, totalHeadcount1970: toProfile.totalHeadcount1970 + count };

        return {
          campusFacilityWorkforce: {
            ...state.campusFacilityWorkforce,
            [fromFacilityId]: updatedFrom,
            [toFacilityId]: updatedTo,
            [fromProfile.unitKey]: updatedFrom,
            [fromProfile.unitId]: updatedFrom,
            [toProfile.unitKey]: updatedTo,
            [toProfile.unitId]: updatedTo,
          },
        };
      });
    },

    resetTo1970: () => {
      const resetDepts = generateInitial1970Departments();
      const resetKey = buildKeyPersonnelRecord(INITIAL_1970_KEY_EMPLOYEES);
      const { totalCount, summary } = computeSummary(
        resetDepts,
        INITIAL_1970_KEY_EMPLOYEES.length
      );
      syncIdCounterWithExisting(INITIAL_1970_KEY_EMPLOYEES.map((e) => e.id));

      set({
        totalHeadcount: totalCount,
        totalKeyPersonnel: INITIAL_1970_KEY_EMPLOYEES.length,
        companySummary: summary,
        departments: resetDepts,
        keyPersonnel: resetKey,
        hqState: { ...INITIAL_1970_HQ },
        campusFacilityWorkforce: { ...CAMPUS_FACILITY_WORKFORCE_MAPPING },
        facilityOvertimePolicies: {
          UNIT_01: "standard_40h",
          UNIT_02: "standard_40h",
          UNIT_03: "standard_40h",
          UNIT_04: "standard_40h",
          UNIT_05: "standard_40h",
          UNIT_06: "standard_40h",
          UNIT_07: "standard_40h",
          UNIT_08: "standard_40h",
          UNIT_09: "standard_40h",
          UNIT_10: "standard_40h",
          UNIT_11: "standard_40h",
          UNIT_12: "standard_40h",
          UNIT_13: "standard_40h",
          UNIT_14: "standard_40h",
        },
        corporateArchiveLevel: 1,
      });
    },
  };
});

