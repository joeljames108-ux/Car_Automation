/**
 * ═══════════════════════════════════════════════════════════════════════
 * APEX WORKFORCE & HUMAN CAPITAL STUDIO (MASTER WORKFORCE HUB)
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Implements the comprehensive 3-tier workforce management system:
 * - Level 1: Macro company totals and health metrics
 * - Level 2: Department-level rosters, rank composition & capacity physics
 * - Level 3: Individual Key Personnel dossiers (EMP-XXXXXX)
 * - HQ Organizational Layer: Capacity limits, coordination scores & expansion
 */

import React, { useState } from "react";
import {
  Users, Building2, UserCheck, Activity, Award, TrendingUp,
  Shield, Compass, Sparkles, ChevronRight, Plus, Wrench, Heart,
  BarChart3, GitFork, ArrowLeft, RefreshCw, UserPlus, Zap
} from "lucide-react";
import { useWorkforceStore } from "../../state/workforceStore";
import { DepartmentAggregation, Employee, EmployeeRank } from "../../sim/workforce/workforceTypes";
import { OrgChartVisualizer } from "./OrgChartVisualizer";
import { DepartmentDetailModal } from "./DepartmentDetailModal";
import { EmployeeDossierModal } from "./EmployeeDossierModal";
import { RankPyramidStudio } from "./RankPyramidStudio";
import { RecruitmentModal } from "./RecruitmentModal";
import { evaluateHQOrganization } from "../../sim/workforce/companyHqEngine";
import { evaluateInstitutionalMemory } from "../../sim/workforce/institutionalMemoryEngine";
import { CANONICAL_CHIEF_ENGINEERS } from "../../sim/workforce/chiefEngineersAndBurnoutEngine";
import { CAMPUS_FACILITY_WORKFORCE_MAPPING } from "../../sim/workforce/workforceCampusMapping";
import { FacilityWorkloadIntensity } from "../../sim/workforce/facilityWorkloadAndFatigue";

interface WorkforceHubProps {
  onBackToMenu?: () => void;
}

export const WorkforceHub: React.FC<WorkforceHubProps> = ({ onBackToMenu }) => {
  const {
    totalHeadcount,
    totalKeyPersonnel,
    companySummary,
    departments,
    keyPersonnel,
    hqState,
    hireAggregatedStaff,
    reduceAggregatedStaff,
    promoteEmployee,
    upgradeHQLevel,
    resetTo1970,
    get12KeyMetrics,
    facilityOvertimePolicies,
    setFacilityOvertimeIntensity,
    corporateArchiveLevel,
    upgradeCorporateArchiveLevel,
    getCampusWorkloadRollup,
    getCampusInstitutionalMemoryAudit,
  } = useWorkforceStore();

  const [activeTab, setActiveTab] = useState<
    "overview" | "campus_matrix" | "chief_engineers" | "rank_pyramid" | "org_chart" | "key_personnel" | "hq_campus" | "institutional_memory"
  >("overview");
  const [selectedDept, setSelectedDept] = useState<DepartmentAggregation | null>(null);
  const [selectedKeyEmployee, setSelectedKeyEmployee] = useState<Employee | null>(null);
  const [isRecruitingModalOpen, setIsRecruitingModalOpen] = useState(false);

  const metrics = get12KeyMetrics();
  const hqDiagnostic = evaluateHQOrganization(hqState, departments, totalHeadcount);

  const allKeyPersonnelList = Object.values(keyPersonnel);
  const activeDepartmentsList = Object.values(departments).filter((d) => d.totalHeadcount > 0);

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-[#f7f5ef] via-[#f2efe6] to-[#e8e4d8] text-slate-900 font-sans p-4 sm:p-6 lg:p-8 flex flex-col select-none">
      
      {/* ─────────────────────────────────────────────────────────────
          1. TOP NAVIGATION & HEADER
      ───────────────────────────────────────────────────────────── */}
      <header className="w-full py-3 px-6 mb-6 rounded-3xl bg-[#fdfbf7]/90 border border-[#dad4c5] backdrop-blur-xl flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          {onBackToMenu && (
            <button
              onClick={onBackToMenu}
              className="p-2 rounded-xl bg-white hover:bg-slate-100 border border-[#d2cbba] text-slate-700 transition-colors shadow-2xs mr-1"
              title="Return to Main Menu"
            >
              <ArrowLeft size={16} />
            </button>
          )}
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#c97c5d] via-[#b8744c] to-[#99583b] text-white flex items-center justify-center shadow-md">
            <Users size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold tracking-widest text-amber-800 uppercase">
                PEOPLE & HUMAN CAPITAL
              </span>
              <span className="text-[10px] font-mono text-slate-400 font-bold">
                12-METRIC SECTION 30 STANDARD
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-black text-slate-900 font-mono tracking-wide uppercase leading-tight">
              APEX AUTOMOTIVE WORKFORCE MANAGEMENT
            </h1>
          </div>
        </div>

        {/* Tab Controls & Scout Button */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setIsRecruitingModalOpen(true)}
            className="px-3.5 py-1.5 rounded-2xl bg-slate-900 hover:bg-black text-white font-mono font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
          >
            <UserPlus size={13} />
            <span>SCOUT TALENT</span>
          </button>

          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#ede8db] border border-[#dcd6c7] text-xs font-mono font-bold flex-wrap">
            {[
              { id: "overview", label: "OVERVIEW", icon: <BarChart3 size={13} /> },
              { id: "campus_matrix", label: "14-UNIT MATRIX", icon: <Building2 size={13} /> },
              { id: "chief_engineers", label: "CHIEFS & PERKS", icon: <Sparkles size={13} /> },
              { id: "rank_pyramid", label: "RANK PYRAMID", icon: <TrendingUp size={13} /> },
              { id: "org_chart", label: "ORG CHART", icon: <GitFork size={13} /> },
              { id: "key_personnel", label: "KEY STAFF (L3)", icon: <Award size={13} /> },
              { id: "hq_campus", label: "HQ & CAMPUS", icon: <Compass size={13} /> },
              { id: "institutional_memory", label: "VETERANS & MEMORY", icon: <Shield size={13} /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all ${
                  activeTab === tab.id
                    ? "bg-white text-slate-900 shadow-xs border border-[#dad4c5]"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab.icon}
                <span className="hidden md:inline">{tab.label}</span>
              </button>
            ))}
          </div>

        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          2. SECTION 30: THE 12 MANDATORY WORKFORCE METRICS
      ───────────────────────────────────────────────────────────── */}
      <section className="space-y-3 mb-6 font-mono text-xs">
        {/* Row 1: Core Output & Technical Capabilities */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3.5 rounded-3xl bg-[#fdfbf7] border border-[#dad4c5] shadow-xs">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">1. TOTAL EMPLOYEES</span>
            <span className="text-xl font-black text-slate-900 block mt-1">{metrics.totalEmployees.toLocaleString()}</span>
            <span className="text-[10px] text-slate-500 font-sans block mt-0.5">Across {activeDepartmentsList.length} Active Depts</span>
          </div>

          <div className="p-3.5 rounded-3xl bg-[#fdfbf7] border border-[#dad4c5] shadow-xs">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">2. AVERAGE SKILL</span>
            <span className="text-xl font-black text-slate-900 block mt-1">{metrics.averageSkill} <span className="text-xs text-slate-400 font-normal">/ 100</span></span>
            <span className="text-[10px] text-emerald-800 font-bold block mt-0.5">Weighted Competency</span>
          </div>

          <div className="p-3.5 rounded-3xl bg-[#fdfbf7] border border-[#dad4c5] shadow-xs">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">3. SPECIALIST SKILL</span>
            <span className="text-xl font-black text-purple-900 block mt-1">{metrics.specialistSkill} <span className="text-xs text-slate-400 font-normal">pts</span></span>
            <span className="text-[10px] text-purple-700 font-bold block mt-0.5">Peak Domain Mastery</span>
          </div>

          <div className="p-3.5 rounded-3xl bg-[#fdfbf7] border border-[#dad4c5] shadow-xs">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">4. EFFECTIVE CAPACITY</span>
            <span className="text-xl font-black text-slate-900 block mt-1">{(metrics.effectiveCapacityWU / 1000).toFixed(1)}k</span>
            <span className="text-[10px] text-slate-500 font-sans block mt-0.5">Work Units (WU) / Mo</span>
          </div>

          <div className="p-3.5 rounded-3xl bg-[#fdfbf7] border border-[#dad4c5] shadow-xs">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">5. MANAGEMENT CAP.</span>
            <span className="text-xl font-black text-slate-900 block mt-1">{metrics.managementCapacityScore} <span className="text-xs text-slate-400 font-normal">/ 100</span></span>
            <span className="text-[10px] text-emerald-800 font-bold block mt-0.5">{companySummary.managementSpanHealth}</span>
          </div>

          <div className="p-3.5 rounded-3xl bg-[#fdfbf7] border border-[#dad4c5] shadow-xs">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">6. HQ DESK CAPACITY</span>
            <span className="text-xl font-black text-slate-900 block mt-1">
              {metrics.hqOrganizationalCapacity.corporateDesksOccupied} <span className="text-xs text-slate-400 font-normal">/ {metrics.hqOrganizationalCapacity.maxDesks}</span>
            </span>
            <span className={`text-[10px] font-bold block mt-0.5 ${metrics.hqOrganizationalCapacity.isOvercapacity ? "text-rose-600" : "text-emerald-700"}`}>
              {metrics.hqOrganizationalCapacity.isOvercapacity ? "Overcapacity Drag!" : `${metrics.hqOrganizationalCapacity.utilizationPct}% Utilized`}
            </span>
          </div>
        </div>

        {/* Row 2: Rank Pyramids, Economics & Organizational Health */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3.5 rounded-3xl bg-[#fdfbf7] border border-[#dad4c5] shadow-xs">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">7. RANKS (JR/SPEC/LEAD)</span>
            <span className="text-base font-black text-slate-900 block mt-1">
              {metrics.employeesByRank.junior} <span className="text-xs text-slate-400">/</span> {metrics.employeesByRank.specialist} <span className="text-xs text-slate-400">/</span> {metrics.employeesByRank.principal}
            </span>
            <span className="text-[10px] text-slate-500 font-sans block mt-0.5">{metrics.employeesByRank.management} in Management</span>
          </div>

          <div className="p-3.5 rounded-3xl bg-[#fdfbf7] border border-[#dad4c5] shadow-xs">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">8. ACTIVE DEPTS</span>
            <span className="text-xl font-black text-slate-900 block mt-1">{activeDepartmentsList.length} <span className="text-xs text-slate-400 font-normal">/ 23</span></span>
            <span className="text-[10px] text-slate-500 font-sans block mt-0.5">5 Corporate Divisions</span>
          </div>

          <div className="p-3.5 rounded-3xl bg-[#fdfbf7] border border-[#dad4c5] shadow-xs">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">9. ESTIMATED PAYROLL</span>
            <span className="text-xl font-black text-slate-900 block mt-1">₹{(metrics.estimatedMonthlyPayroll / 1000).toFixed(0)}k</span>
            <span className="text-[10px] text-slate-500 font-sans block mt-0.5">Monthly Talent Run-Rate</span>
          </div>

          <div className="p-3.5 rounded-3xl bg-[#fdfbf7] border border-[#dad4c5] shadow-xs">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">10. SATISFACTION</span>
            <span className="text-xl font-black text-emerald-800 block mt-1">{metrics.employeeSatisfaction}%</span>
            <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">Company-Wide Morale</span>
          </div>

          <div className="p-3.5 rounded-3xl bg-[#fdfbf7] border border-[#dad4c5] shadow-xs">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">11. MONTHLY TURNOVER</span>
            <span className="text-xl font-black text-slate-900 block mt-1">{metrics.monthlyTurnoverRatePct}%</span>
            <span className="text-[10px] text-slate-500 font-sans block mt-0.5">Low Attrition Friction</span>
          </div>

          <div className="p-3.5 rounded-3xl bg-[#fdfbf7] border border-[#dad4c5] shadow-xs">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">12. EMPLOYER REP.</span>
            <span className="text-xl font-black text-amber-900 block mt-1">{metrics.employerReputation} <span className="text-xs text-slate-400 font-normal">/ 100</span></span>
            <span className="text-[10px] text-amber-700 font-bold block mt-0.5">Recruiting Allure</span>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. TAB 1: OVERVIEW & DEPARTMENT ROSTERS
      ───────────────────────────────────────────────────────────── */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black text-slate-900 font-mono uppercase tracking-wider">
                ACTIVE OPERATIONAL DEPARTMENTS (LEVEL 2 ROSTERS)
              </h2>
              <p className="text-xs text-slate-600 font-sans mt-0.5">
                Click any department to inspect rank pyramid ratios, workload capacity physics, and attached key staff.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-500">
              {activeDepartmentsList.length} of 23 Departments Commissioned
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeDepartmentsList.map((dept) => (
              <div
                key={dept.departmentId}
                onClick={() => setSelectedDept(dept)}
                className="p-5 rounded-3xl bg-[#fdfbf7] hover:bg-[#fffefb] border border-[#dad4c5] hover:border-[#b8744c] shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-[#eee8dc]">
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">
                      {dept.division} • {dept.facilityLocation}
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-800 border border-emerald-500/20">
                      {dept.spanHealth}
                    </span>
                  </div>

                  <h3 className="text-sm font-black text-slate-900 font-mono mt-2 group-hover:text-[#ad5b35] transition-colors">
                    {dept.departmentName}
                  </h3>

                  <div className="grid grid-cols-3 gap-2 my-3 text-xs font-mono">
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[9px] text-slate-400 block uppercase">HEADCOUNT</span>
                      <span className="font-bold text-slate-900">{dept.totalHeadcount}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[9px] text-slate-400 block uppercase">AVG SKILL</span>
                      <span className="font-bold text-slate-900">{dept.averageOverallSkill}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[9px] text-slate-400 block uppercase">UTILIZATION</span>
                      <span className={`font-bold ${dept.utilizationPercentage > 115 ? "text-rose-600" : "text-slate-900"}`}>
                        {dept.utilizationPercentage}%
                      </span>
                    </div>
                  </div>

                  {/* Capacity Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono text-slate-500">
                      <span>Demand: {dept.monthlyWorkUnitsDemand.toLocaleString()} WU</span>
                      <span>Capacity: {dept.monthlyWorkUnitsCapacity.toLocaleString()} WU</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          dept.utilizationPercentage > 115 ? "bg-rose-500" :
                          dept.utilizationPercentage > 95 ? "bg-amber-500" : "bg-emerald-600"
                        }`}
                        style={{ width: `${Math.min(100, dept.utilizationPercentage)}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-[#eee8dc] flex items-center justify-between text-xs font-mono">
                  <span className="text-[11px] text-slate-500">
                    {dept.keyPersonnelIds.length} Key Staff Dossiers
                  </span>
                  <span className="text-[#b8744c] font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Inspect Roster <ChevronRight size={13} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          4. TAB 2: RANK PYRAMID & STRATEGIC COMPOSITION STUDIO (SECTION 12)
      ───────────────────────────────────────────────────────────── */}
      {activeTab === "rank_pyramid" && (
        <RankPyramidStudio />
      )}

      {/* ─────────────────────────────────────────────────────────────
          5. TAB 3: INTERACTIVE ORG CHART VISUALIZER
      ───────────────────────────────────────────────────────────── */}
      {activeTab === "org_chart" && (
        <div className="p-6 rounded-3xl bg-[#fdfbf7] border border-[#dad4c5] shadow-xs">
          <div className="mb-4">
            <h2 className="text-sm font-black text-slate-900 font-mono uppercase tracking-wider">
              ENTERPRISE ORGANIZATIONAL HIERARCHY TREE
            </h2>
            <p className="text-xs text-slate-600 font-sans mt-0.5">
              Visualizes the central nervous system connecting Global HQ to Divisions and Operational Departments. Click any node to inspect.
            </p>
          </div>
          <OrgChartVisualizer
            hqState={hqState}
            departments={departments}
            onSelectDepartment={(dept) => setSelectedDept(dept)}
          />
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          6. TAB 4: KEY PERSONNEL DOSSIERS (LEVEL 3)
      ───────────────────────────────────────────────────────────── */}
      {activeTab === "key_personnel" && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-black text-slate-900 font-mono uppercase tracking-wider">
                INDIVIDUAL KEY PERSONNEL DOSSIERS (PERMANENT EMP-XXXXXX)
              </h2>
              <p className="text-xs text-slate-600 font-sans mt-0.5">
                Full individual identities for Directors, Principal Engineers, Chief Designers, and Star Talent.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-slate-500">
                {allKeyPersonnelList.length} Key Leaders on Roster
              </span>
              <button
                onClick={() => setIsRecruitingModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white font-mono font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
              >
                <UserPlus size={13} />
                <span>Scout New Talent</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allKeyPersonnelList.map((emp) => (
              <div
                key={emp.id}
                onClick={() => setSelectedKeyEmployee(emp)}
                className="p-5 rounded-3xl bg-[#fdfbf7] hover:bg-[#fffefb] border border-[#dad4c5] hover:border-[#b8744c] shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-[#eee8dc]">
                    <span className="text-xs font-mono font-black text-amber-900 px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-600/30">
                      {emp.id}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">
                      Rank {emp.rank} • {emp.division}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-slate-900 font-mono mt-2.5 group-hover:text-[#ad5b35] transition-colors">
                    {emp.name}
                  </h3>
                  <span className="text-xs text-slate-600 font-sans block">
                    {emp.departmentId.replace(/_/g, " ")}
                  </span>

                  <div className="grid grid-cols-3 gap-2 my-3 text-xs font-mono">
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[9px] text-slate-400 block uppercase">OVERALL</span>
                      <span className="font-bold text-slate-900 text-sm">{emp.overallSkill}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[9px] text-slate-400 block uppercase">EXPERIENCE</span>
                      <span className="font-bold text-slate-900 text-sm">{emp.experienceYears}y</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[9px] text-slate-400 block uppercase">MORALE</span>
                      <span className="font-bold text-slate-900 text-sm">{emp.morale}%</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-[#e5dfd2] text-xs font-mono">
                    <span className="text-[9px] text-slate-400 uppercase font-bold block">SPECIALIZATION</span>
                    <span className="font-bold text-slate-900 block truncate mt-0.5">
                      {emp.primarySpecialization}
                    </span>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-[#eee8dc] flex items-center justify-between text-xs font-mono">
                  <span className="text-[11px] text-slate-500">
                    Tenure: {Math.floor(emp.tenureMonthsWithCompany / 12)}y {emp.tenureMonthsWithCompany % 12}m
                  </span>
                  <span className="text-[#b8744c] font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    View Dossier <ChevronRight size={13} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          6. TAB 4: HQ CAMPUS & MANAGEMENT CAPACITY
      ───────────────────────────────────────────────────────────── */}
      {activeTab === "hq_campus" && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-[#fdfbf7] border border-[#dad4c5] shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#dad4c5]">
              <div>
                <span className="text-xs font-mono font-bold text-amber-800 uppercase block mb-1">
                  CENTRAL ORGANIZATIONAL HUB
                </span>
                <h2 className="text-xl font-black text-slate-900 font-mono">
                  {hqState.campusName}
                </h2>
                <p className="text-xs text-slate-600 font-sans mt-0.5">
                  Tier {hqState.hqLevel} Headquarters • {hqState.locationCity}, {hqState.locationCountry}
                </p>
              </div>

              {hqState.hqLevel < 5 && (
                <button
                  onClick={upgradeHQLevel}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-xs font-mono flex items-center gap-2 shadow-md transition-all"
                >
                  <Sparkles size={16} /> Upgrade HQ to Tier {hqState.hqLevel + 1}
                </button>
              )}
            </div>

            {/* HQ Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
              <div className="p-4 rounded-2xl bg-white border border-[#e4dfd4] shadow-xs">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">CORPORATE CAPACITY</span>
                <span className="text-xl font-black text-slate-900 block mt-1">
                  {hqDiagnostic.corporateStaffCount} / {hqState.maxCorporateEmployees}
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  {hqDiagnostic.corporateUtilizationPct}% Physical Desk Utilization
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#e4dfd4] shadow-xs">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">R&D COORDINATION SCORE</span>
                <span className="text-xl font-black text-emerald-800 block mt-1">{hqState.rdCoordinationScore} / 100</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">Cross-Functional Project Velocity</span>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#e4dfd4] shadow-xs">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">COMMUNICATION SPEED</span>
                <span className="text-xl font-black text-slate-900 block mt-1">{hqDiagnostic.crossFunctionalSpeedRating}</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">Efficiency: {hqState.communicationEfficiency}%</span>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#e4dfd4] shadow-xs">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">SUPPORTED DEPARTMENTS</span>
                <span className="text-xl font-black text-slate-900 block mt-1">
                  {hqDiagnostic.activeDepartmentsCount} / {hqState.maxSupportedDepartments}
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">Max Structural Breadth</span>
              </div>
            </div>

            {/* Diagnostic Logs */}
            <div className="p-4 rounded-2xl bg-white border border-[#e4ded0] space-y-2 text-xs">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">
                ORGANIZATIONAL HEALTH NOTES:
              </span>
              {hqDiagnostic.summaryNotes.map((note, idx) => (
                <p key={idx} className="text-slate-700 leading-snug flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                  {note}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          7. TAB 5: VETERANS & INSTITUTIONAL MEMORY
      ───────────────────────────────────────────────────────────── */}
      {activeTab === "institutional_memory" && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-[#fdfbf7] border border-[#dad4c5] shadow-xs space-y-4">
            <div>
              <h2 className="text-sm font-black text-slate-900 font-mono uppercase tracking-wider">
                INSTITUTIONAL MEMORY & VETERAN ROLL OF HONOR (SECTION 29)
              </h2>
              <p className="text-xs text-slate-600 font-sans mt-0.5">
                Long-serving employees accumulate institutional knowledge that reduces project failure risks and stabilizes department morale.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeDepartmentsList.map((dept) => {
                const memReport = evaluateInstitutionalMemory(dept, allKeyPersonnelList);

                return (
                  <div
                    key={dept.departmentId}
                    className="p-4 rounded-2xl bg-white border border-[#e4ded0] shadow-xs space-y-2 text-xs font-mono"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-[#eee8dc]">
                      <span className="font-bold text-slate-900">{dept.departmentName}</span>
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                        memReport.brainDrainVulnerability === "CRITICAL" ? "bg-rose-100 text-rose-800" :
                        memReport.brainDrainVulnerability === "HIGH" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                      }`}>
                        Drain Risk: {memReport.brainDrainVulnerability}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600 text-[11px]">
                      <span>Institutional Index: <b>{memReport.institutionalKnowledgeIndex}/100</b></span>
                      <span>Veterans: <b>{memReport.totalVeteransCount}</b></span>
                      <span>Risk Cut: <b className="text-emerald-700">-{memReport.failureRiskMitigationPct}%</b></span>
                    </div>

                    {memReport.veteranHonors.length > 0 && (
                      <div className="pt-2 border-t border-slate-100 space-y-1">
                        <span className="text-[10px] text-slate-400 block uppercase">NOTABLE VETERANS:</span>
                        {memReport.veteranHonors.map((vet) => (
                          <div key={vet.id} className="flex items-center justify-between text-[11px] text-slate-700">
                            <span>{vet.name} ({vet.id})</span>
                            <span className="text-slate-500 font-bold">{vet.yearsOfService} yrs service</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          7B. 14-CAMPUS-UNIT WORKFORCE & OVERTIME MATRIX
      ───────────────────────────────────────────────────────────── */}
      {activeTab === "campus_matrix" && (() => {
        const campusRollup = getCampusWorkloadRollup();
        const campusAudit = getCampusInstitutionalMemoryAudit();
        const all14UnitKeys = [
          "UNIT_01", "UNIT_02", "UNIT_03", "UNIT_04", "UNIT_05", "UNIT_06", "UNIT_07",
          "UNIT_08", "UNIT_09", "UNIT_10", "UNIT_11", "UNIT_12", "UNIT_13", "UNIT_14"
        ];

        return (
          <div className="space-y-6">
            {/* Campus Rollup Summary & Archive Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 p-5 rounded-3xl bg-[#fdfbf7] border border-[#dad4c5] shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-amber-800 uppercase tracking-wider">
                      CAMPUS WORKFORCE ROLLUP (14 UNITS)
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-500">
                      {campusRollup.totalHeadcount} TOTAL STAFF
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-1">
                    Workload, Overtime Capacity & Tolerance Error Control
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Control working hours per facility. 52h Crunch grants +25% speed but risks CAD packaging errors (+8.5%). 65h Death March grants +50% speed with severe CAD defects (+24%) and burnout resignations.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-[#ede8db] font-mono text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Capacity</span>
                    <span className="text-sm font-black text-slate-800">{(campusRollup.totalCapacityWU / 1000).toFixed(1)}k WU</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">In Crunch</span>
                    <span className={`text-sm font-black ${campusRollup.facilitiesInCrunch.length > 0 ? "text-amber-600" : "text-emerald-700"}`}>
                      {campusRollup.facilitiesInCrunch.length} Units
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Overtime Cost</span>
                    <span className="text-sm font-black text-slate-800">
                      ₹{Math.round(campusRollup.totalOvertimePayrollEur).toLocaleString()}/mo
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Resignations</span>
                    <span className={`text-sm font-black ${campusRollup.totalProjectedResignations > 0 ? "text-rose-600" : "text-slate-700"}`}>
                      {campusRollup.totalProjectedResignations} Projected
                    </span>
                  </div>
                </div>
              </div>

              {/* Corporate Archive Level */}
              <div className="p-5 rounded-3xl bg-[#fdfbf7] border border-[#dad4c5] shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-indigo-800 uppercase tracking-wider">
                      UNIT_01 CORPORATE ARCHIVES
                    </span>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                      LEVEL {corporateArchiveLevel} / 4
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mt-2">
                    Intellectual Property Retention
                  </h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Central Corporate HQ documentation mitigates Brain Drain when key engineers retire or resign.
                  </p>
                  <div className="mt-3 p-3 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex items-center justify-between font-mono text-xs">
                    <span className="text-slate-600">IP Retention Rate:</span>
                    <span className="font-bold text-indigo-900 text-sm">{campusAudit.archiveRetentionRatePct}%</span>
                  </div>
                </div>

                <button
                  onClick={upgradeCorporateArchiveLevel}
                  disabled={corporateArchiveLevel >= 4}
                  className="mt-4 w-full py-2.5 px-3 rounded-2xl bg-indigo-900 hover:bg-indigo-950 disabled:opacity-40 text-white font-mono font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <Shield size={14} />
                  <span>{corporateArchiveLevel >= 4 ? "MAX ARCHIVE ARCHITECTURE" : `UPGRADE TO LEVEL ${corporateArchiveLevel + 1}`}</span>
                </button>
              </div>
            </div>

            {/* 14 Facility Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {all14UnitKeys.map((unitKey) => {
                const report = campusRollup.facilityReports[unitKey];
                const profile = (CAMPUS_FACILITY_WORKFORCE_MAPPING as any)[unitKey];
                const currentIntensity = facilityOvertimePolicies[unitKey] || "standard_40h";
                const isInactive = !profile || profile.totalHeadcount1970 === 0;

                return (
                  <div
                    key={unitKey}
                    className={`p-4 rounded-3xl border transition-all ${
                      currentIntensity === "extreme_crunch_65h"
                        ? "bg-rose-50/50 border-rose-300 shadow-sm"
                        : currentIntensity === "crunch_52h"
                        ? "bg-amber-50/40 border-amber-300 shadow-xs"
                        : "bg-[#fdfbf7] border-[#dad4c5] shadow-xs"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-800">
                            {unitKey}
                          </span>
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {profile?.name || unitKey}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 block mt-0.5">
                          {profile?.primaryDiscipline || "AUTOMOTIVE_ENGINEERING"}
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-700">
                        {report ? report.headcount : 0} staff
                      </span>
                    </div>

                    {/* Capacity & Progress */}
                    <div className="mt-3">
                      <div className="flex justify-between text-[10px] font-mono text-slate-500 mb-1">
                        <span>Staff Load</span>
                        <span>{report ? report.utilizationPct : 0}% Utilized</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            (report?.utilizationPct || 0) > 120
                              ? "bg-rose-500"
                              : (report?.utilizationPct || 0) > 90
                              ? "bg-amber-500"
                              : "bg-emerald-600"
                          }`}
                          style={{ width: `${Math.min(100, report?.utilizationPct || 0)}%` }}
                        />
                      </div>
                    </div>

                    {/* Overtime Selector Pills */}
                    {!isInactive && (
                      <div className="mt-3 pt-3 border-t border-[#ede8db]">
                        <span className="text-[10px] font-mono font-bold text-slate-400 block mb-1.5">
                          WORKLOAD INTENSITY
                        </span>
                        <div className="grid grid-cols-3 gap-1 text-[10px] font-mono font-bold">
                          {[
                            { id: "standard_40h", label: "40h Std" },
                            { id: "crunch_52h", label: "52h Crunch" },
                            { id: "extreme_crunch_65h", label: "65h Death" },
                          ].map((pol) => (
                            <button
                              key={pol.id}
                              onClick={() => setFacilityOvertimeIntensity(unitKey, pol.id as FacilityWorkloadIntensity)}
                              className={`py-1 rounded-xl transition-all ${
                                currentIntensity === pol.id
                                  ? pol.id === "extreme_crunch_65h"
                                    ? "bg-rose-600 text-white shadow-xs"
                                    : pol.id === "crunch_52h"
                                    ? "bg-amber-600 text-white shadow-xs"
                                    : "bg-slate-900 text-white shadow-xs"
                                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                              }`}
                            >
                              {pol.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Live Metric Badges */}
                    {!isInactive && report && (
                      <div className="grid grid-cols-3 gap-1.5 mt-3 pt-2 text-[10px] font-mono">
                        <div className="p-1.5 rounded-xl bg-slate-100 text-center">
                          <span className="text-slate-400 block text-[9px]">Speed</span>
                          <span className="font-bold text-slate-800">{report.speedMultiplier}x</span>
                        </div>
                        <div className="p-1.5 rounded-xl bg-slate-100 text-center">
                          <span className="text-slate-400 block text-[9px]">CAD Err</span>
                          <span className={`font-bold ${report.cadErrorRatePenaltyPct > 0 ? "text-amber-700" : "text-emerald-700"}`}>
                            +{report.cadErrorRatePenaltyPct}%
                          </span>
                        </div>
                        <div className="p-1.5 rounded-xl bg-slate-100 text-center">
                          <span className="text-slate-400 block text-[9px]">Morale</span>
                          <span className={`font-bold ${report.monthlyMoraleDelta >= 0 ? "text-emerald-700" : "text-rose-600"}`}>
                            {report.monthlyMoraleDelta >= 0 ? `+${report.monthlyMoraleDelta}` : report.monthlyMoraleDelta}
                          </span>
                        </div>
                      </div>
                    )}

                    {isInactive && (
                      <div className="mt-3 p-3 rounded-2xl bg-slate-100 border border-slate-200 text-center font-mono text-[11px] text-slate-500">
                        {unitKey === "UNIT_10" ? "Factory Plot Unowned / Outsourced" : "Plot Reserved for Future Expansion"}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* ─────────────────────────────────────────────────────────────
          7C. NAMED CHIEF ENGINEERS & SIGNATURE PERKS
      ───────────────────────────────────────────────────────────── */}
      {activeTab === "chief_engineers" && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-[#fdfbf7] border border-[#dad4c5] shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-amber-800 uppercase tracking-wider">
                  EXECUTIVE TECHNICAL LEADERSHIP
                </span>
                <h3 className="text-lg font-black text-slate-900 font-mono mt-1">
                  THE 5 CANONICAL CHIEF ENGINEERS
                </h3>
              </div>
              <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                5 DISCIPLINES
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-2 max-w-3xl leading-relaxed">
              Chief Engineers are world-class virtuosos who bestow permanent passive bonuses across vehicle thermal efficiency, ground-effect aerodynamics, suspension kinematics, styling appeal, and unibody manufacturing defect reduction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {CANONICAL_CHIEF_ENGINEERS.map((chief) => (
              <div
                key={chief.id}
                className="p-5 rounded-3xl bg-[#fdfbf7] border border-[#dad4c5] shadow-xs flex flex-col justify-between space-y-4"
              >
                <div>
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-800 uppercase tracking-wider">
                        {chief.role.toUpperCase()}
                      </span>
                      <h4 className="text-base font-bold text-slate-900 mt-2 font-mono">
                        {chief.name}
                      </h4>
                      <span className="text-xs text-slate-500 font-sans block">
                        {chief.nationality} · {"★".repeat(chief.reputationStars)}
                      </span>
                    </div>
                    <div className="text-right font-mono">
                      <span className="text-[10px] text-slate-400 block">SALARY</span>
                      <span className="text-xs font-bold text-slate-800">
                        ₹{(chief.monthlySalaryEur / 1000).toFixed(1)}k/mo
                      </span>
                    </div>
                  </div>

                  {/* Trait Badge */}
                  <div className="mt-3 p-2.5 rounded-2xl bg-amber-50 border border-amber-200">
                    <span className="text-[10px] font-mono font-bold text-amber-900 block uppercase">
                      TRAIT: {chief.traitName}
                    </span>
                    <p className="text-[11px] text-amber-900/80 leading-relaxed mt-1">
                      {chief.description}
                    </p>
                  </div>

                  {/* Signature Perks */}
                  <div className="mt-3 space-y-1.5 font-mono text-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      SIGNATURE PERKS
                    </span>
                    {chief.perks.thermalEfficiencyBonusPct && (
                      <div className="flex justify-between p-2 rounded-xl bg-slate-100">
                        <span className="text-slate-600">Thermal Efficiency:</span>
                        <span className="font-bold text-emerald-700">+{chief.perks.thermalEfficiencyBonusPct}%</span>
                      </div>
                    )}
                    {chief.perks.aeroEfficiencyBonusPct && (
                      <div className="flex justify-between p-2 rounded-xl bg-slate-100">
                        <span className="text-slate-600">Aero Downforce & Cd:</span>
                        <span className="font-bold text-cyan-700">+{chief.perks.aeroEfficiencyBonusPct}%</span>
                      </div>
                    )}
                    {chief.perks.chassisGripBonusPct && (
                      <div className="flex justify-between p-2 rounded-xl bg-slate-100">
                        <span className="text-slate-600">Chassis Lateral Grip:</span>
                        <span className="font-bold text-indigo-700">+{chief.perks.chassisGripBonusPct}%</span>
                      </div>
                    )}
                    {chief.perks.stylingAppealBonusPts && (
                      <div className="flex justify-between p-2 rounded-xl bg-slate-100">
                        <span className="text-slate-600">Styling Appeal:</span>
                        <span className="font-bold text-purple-700">+{chief.perks.stylingAppealBonusPts} pts</span>
                      </div>
                    )}
                    {chief.perks.plantDefectReductionPct && (
                      <div className="flex justify-between p-2 rounded-xl bg-slate-100">
                        <span className="text-slate-600">Plant Defect Reduction:</span>
                        <span className="font-bold text-emerald-700">-{chief.perks.plantDefectReductionPct}%</span>
                      </div>
                    )}
                    {chief.perks.developmentSpeedBonusPct && (
                      <div className="flex justify-between p-2 rounded-xl bg-slate-100">
                        <span className="text-slate-600">Development Speed:</span>
                        <span className="font-bold text-slate-800">+{chief.perks.developmentSpeedBonusPct}%</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Morale / Burnout status */}
                <div className="pt-3 border-t border-[#ede8db] flex items-center justify-between text-[11px] font-mono">
                  <div className="flex items-center gap-1.5">
                    <Heart size={12} className="text-rose-500" />
                    <span className="text-slate-600">Morale: <b className="text-slate-800">{chief.moralePct}%</b></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Zap size={12} className="text-amber-500" />
                    <span className="text-slate-600">Burnout Risk: <b className="text-slate-800">{chief.burnoutRiskPct}%</b></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <DepartmentDetailModal
        dept={selectedDept}
        isOpen={Boolean(selectedDept)}
        onClose={() => setSelectedDept(null)}
        keyPersonnel={keyPersonnel}
        hqCoordinationScore={hqState.rdCoordinationScore}
        onSelectKeyEmployee={(emp) => {
          setSelectedKeyEmployee(emp);
        }}
        onHireStaff={(rank, count) => {
          if (selectedDept) {
            hireAggregatedStaff(selectedDept.departmentId, rank, count);
            // Refresh modal state from store
            const refreshed = useWorkforceStore.getState().departments[selectedDept.departmentId];
            setSelectedDept(refreshed);
          }
        }}
        onReduceStaff={(rank, count) => {
          if (selectedDept) {
            reduceAggregatedStaff(selectedDept.departmentId, rank, count);
            const refreshed = useWorkforceStore.getState().departments[selectedDept.departmentId];
            setSelectedDept(refreshed);
          }
        }}
      />

      <EmployeeDossierModal
        employee={selectedKeyEmployee}
        isOpen={Boolean(selectedKeyEmployee)}
        onClose={() => setSelectedKeyEmployee(null)}
        onPromote={(empId) => {
          const emp = keyPersonnel[empId];
          if (emp && emp.rank < 8) {
            promoteEmployee(empId, (emp.rank + 1) as EmployeeRank);
            setSelectedKeyEmployee(useWorkforceStore.getState().keyPersonnel[empId]);
          }
        }}
      />

      {isRecruitingModalOpen && (
        <RecruitmentModal
          onClose={() => setIsRecruitingModalOpen(false)}
          onHired={(name, id) => {
            // Toast or select hired employee
            setSelectedKeyEmployee(useWorkforceStore.getState().keyPersonnel[id as any]);
            setIsRecruitingModalOpen(false);
          }}
        />
      )}

    </div>
  );
};
