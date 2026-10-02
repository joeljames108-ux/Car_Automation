/**
 * ═══════════════════════════════════════════════════════════════════════
 * ORG CHART VISUALIZER — INTERACTIVE CORPORATE HIERARCHY TREE
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Implements Section 13 ("HQ should control the organizational hierarchy")
 * and Section 53 ("Workforce hierarchy view").
 *
 * Renders an interactive, aesthetic corporate organization chart:
 * - Top Node: Apex Automotive Global Headquarters & CEO
 * - Division Nodes: Technical, Operational, Commercial, Corporate, Motorsport
 * - Department Nodes: 23 Canonical Departments with live headcounts,
 *   management span health chips, and click-to-inspect modal integration.
 */

import React from "react";
import {
  Building2, Users, ChevronRight, Activity, Shield, Award,
  Sparkles, Wrench, Factory, ShoppingCart, Flag, Briefcase
} from "lucide-react";
import {
  DepartmentAggregation,
  CompanyHQState,
  DivisionType,
  DepartmentId,
} from "../../sim/workforce/workforceTypes";

interface OrgChartVisualizerProps {
  hqState: CompanyHQState;
  departments: Record<DepartmentId, DepartmentAggregation>;
  onSelectDepartment: (dept: DepartmentAggregation) => void;
}

export const OrgChartVisualizer: React.FC<OrgChartVisualizerProps> = ({
  hqState,
  departments,
  onSelectDepartment,
}) => {
  const divisions: Array<{
    type: DivisionType;
    label: string;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
    borderColor: string;
  }> = [
    {
      type: "TECHNICAL",
      label: "TECHNICAL & R&D",
      icon: <Wrench size={16} />,
      color: "text-cyan-700",
      bgColor: "bg-cyan-50",
      borderColor: "border-cyan-200",
    },
    {
      type: "OPERATIONAL",
      label: "OPERATIONS & MFG",
      icon: <Factory size={16} />,
      color: "text-amber-800",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
    },
    {
      type: "COMMERCIAL",
      label: "COMMERCIAL & SALES",
      icon: <ShoppingCart size={16} />,
      color: "text-emerald-800",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
    },
    {
      type: "CORPORATE",
      label: "CORPORATE & TREASURY",
      icon: <Briefcase size={16} />,
      color: "text-purple-800",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
    },
    {
      type: "MOTORSPORT",
      label: "WORKS RACING",
      icon: <Flag size={16} />,
      color: "text-rose-800",
      bgColor: "bg-rose-50",
      borderColor: "border-rose-200",
    },
  ];

  const getDivisionDepts = (divType: DivisionType) => {
    return Object.values(departments).filter((d) => d.division === divType && d.totalHeadcount > 0);
  };

  return (
    <div className="w-full flex flex-col items-center gap-8 font-sans py-4 select-none overflow-x-auto">
      
      {/* ── Level 1: Central Company HQ Root Node ── */}
      <div className="flex flex-col items-center relative z-10">
        <div className="px-6 py-4 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white border-2 border-amber-400/40 shadow-xl flex items-center gap-4 hover:border-amber-300 transition-all cursor-default">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-xs">
            <Building2 size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold tracking-widest text-amber-400 uppercase">
                TIER {hqState.hqLevel} GLOBAL HEADQUARTERS
              </span>
              <span className="text-[10px] font-mono text-slate-400 font-bold">
                {hqState.locationCity}
              </span>
            </div>
            <h2 className="text-base font-black tracking-wide text-white font-mono mt-0.5">
              {hqState.campusName}
            </h2>
            <div className="flex items-center gap-4 text-xs font-mono text-slate-300 mt-1">
              <span>Corp Capacity: <b>{hqState.currentCorporateStaff} / {hqState.maxCorporateEmployees}</b></span>
              <span>Coordination: <b>{hqState.rdCoordinationScore}%</b></span>
              <span>Status: <b className="text-emerald-400">Command Active</b></span>
            </div>
          </div>
        </div>

        {/* Vertical trunk connector */}
        <div className="w-0.5 h-8 bg-[#d2cbba]" />
      </div>

      {/* ── Level 2: Division Branches ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5 w-full">
        {divisions.map((div) => {
          const deptsInDiv = getDivisionDepts(div.type);
          const totalDivHeadcount = deptsInDiv.reduce((a, b) => a + b.totalHeadcount, 0);

          return (
            <div
              key={div.type}
              className="flex flex-col rounded-3xl bg-[#fdfbf7] border border-[#e0dad0] shadow-sm overflow-hidden"
            >
              {/* Division Header Banner */}
              <div className={`p-3.5 border-b ${div.borderColor} ${div.bgColor} flex items-center justify-between`}>
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`w-7 h-7 rounded-lg bg-white ${div.color} flex items-center justify-center shadow-xs shrink-0`}>
                    {div.icon}
                  </div>
                  <div className="min-w-0">
                    <h3 className={`text-xs font-black font-mono tracking-wider truncate uppercase ${div.color}`}>
                      {div.label}
                    </h3>
                    <span className="text-[10px] font-mono text-slate-600 block">
                      {totalDivHeadcount} Employees • {deptsInDiv.length} Depts
                    </span>
                  </div>
                </div>
              </div>

              {/* Department Children Nodes */}
              <div className="p-3 space-y-2.5 flex-1 bg-[#fcfaf4]">
                {deptsInDiv.length === 0 ? (
                  <div className="p-3 text-center text-xs font-mono text-slate-400 italic">
                    Dormant division in 1970
                  </div>
                ) : (
                  deptsInDiv.map((dept) => (
                    <div
                      key={dept.departmentId}
                      onClick={() => onSelectDepartment(dept)}
                      className="p-3 rounded-2xl bg-white hover:bg-[#fffcf7] border border-[#e4dfd4] hover:border-[#b8744c] shadow-2xs hover:shadow-md transition-all cursor-pointer group flex flex-col gap-1.5"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-black text-slate-900 group-hover:text-[#ad5b35] transition-colors truncate">
                          {dept.departmentName}
                        </span>
                        <ChevronRight size={14} className="text-slate-400 group-hover:text-slate-800 transition-colors shrink-0" />
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-600">
                        <span>Staff: <b className="text-slate-900">{dept.totalHeadcount}</b></span>
                        <span>Skill: <b className="text-slate-900">{dept.averageOverallSkill}</b></span>
                        <span>Span: <b className={dept.spanHealth === "OPTIMAL" ? "text-emerald-700" : "text-amber-700"}>{dept.spanRatio}:1</b></span>
                      </div>

                      {/* Mini utilization bar */}
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-0.5">
                        <div
                          className={`h-full rounded-full ${
                            dept.utilizationPercentage > 115 ? "bg-rose-500" :
                            dept.utilizationPercentage > 95 ? "bg-amber-500" : "bg-emerald-600"
                          }`}
                          style={{ width: `${Math.min(100, dept.utilizationPercentage)}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
