/**
 * ═══════════════════════════════════════════════════════════════════════
 * DEPARTMENT DETAIL MODAL — LEVEL 2 AGGREGATION & PYRAMID INSPECTION
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Implements Section 2 ("Department Count"), Section 11 ("Workload & Capacity"),
 * and Section 12 ("Rank Composition Matters").
 *
 * Provides deep operational inspection of a department:
 * - Total headcount & rank pyramid breakdown (Ranks 1 to 9)
 * - Workload (WU demand) vs Effective Capacity meter
 * - Management span of control ratio & health
 * - Attached Level 3 Key Personnel with quick dossier access
 * - Quick staff hiring/adjustment tools
 */

import React, { useState } from "react";
import {
  X, Users, Wrench, AlertTriangle, ShieldCheck, ChevronRight,
  TrendingUp, Plus, Minus, UserCheck, Activity, Award
} from "lucide-react";
import { DepartmentAggregation, Employee, EmployeeRank, RANK_NAMES } from "../../sim/workforce/workforceTypes";
import { evaluateRankPyramid } from "../../sim/workforce/rankPyramidEvaluator";
import { calculateDepartmentEffectiveCapacity } from "../../sim/workforce/workloadEngine";

interface DepartmentDetailModalProps {
  dept: DepartmentAggregation | null;
  isOpen: boolean;
  onClose: () => void;
  keyPersonnel: Record<string, Employee>;
  hqCoordinationScore: number;
  onSelectKeyEmployee: (emp: Employee) => void;
  onHireStaff: (rank: EmployeeRank, count: number) => void;
  onReduceStaff: (rank: EmployeeRank, count: number) => void;
}

export const DepartmentDetailModal: React.FC<DepartmentDetailModalProps> = ({
  dept,
  isOpen,
  onClose,
  keyPersonnel,
  hqCoordinationScore,
  onSelectKeyEmployee,
  onHireStaff,
  onReduceStaff,
}) => {
  const [selectedRankForHire, setSelectedRankForHire] = useState<EmployeeRank>(3);
  const [hireCount, setHireCount] = useState<number>(2);

  if (!isOpen || !dept) return null;

  const pyramidAnalysis = evaluateRankPyramid(dept);
  const capacityResult = calculateDepartmentEffectiveCapacity(dept, hqCoordinationScore);

  const attachedKeyPersonnel = dept.keyPersonnelIds
    .map((id) => keyPersonnel[id])
    .filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-[#fdfbf7] border border-[#dcd5c7] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] font-sans">
        
        {/* Header Ribbon */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#f4eee1] via-[#f7f2e7] to-[#ede5d5] border-b border-[#dad2c2] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#c97c5d] to-[#99583b] text-white flex items-center justify-center shadow-md">
              <Users size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-slate-900/10 text-slate-800 font-mono font-bold text-xs uppercase">
                  {dept.division} DIVISION
                </span>
                <span className="text-[11px] font-mono text-slate-500 font-bold">
                  Site: {dept.facilityLocation}
                </span>
              </div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight mt-0.5">
                {dept.departmentName}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/80 hover:bg-white border border-[#d2cbba] flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors shadow-xs"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">

          {/* Top Quick Status Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 rounded-2xl bg-white border border-[#e5dfd2] shadow-xs">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">HEADCOUNT</span>
              <span className="font-black text-slate-900 block mt-0.5 text-xl">{dept.totalHeadcount}</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                {dept.managementCount} Mgrs • {dept.subordinateCount} Staff
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-white border border-[#e5dfd2] shadow-xs">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">AVERAGE SKILL</span>
              <span className="font-black text-slate-900 block mt-0.5 text-xl">{dept.averageOverallSkill} / 100</span>
              <span className="text-[10px] text-emerald-800 font-bold block mt-0.5">
                {pyramidAnalysis.structuralPosture.replace(/_/g, " ")}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-white border border-[#e5dfd2] shadow-xs">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">WORKLOAD & UTILIZATION</span>
              <span className="font-black text-slate-900 block mt-0.5 text-xl">{capacityResult.utilizationPercentage}%</span>
              <span className={`text-[10px] font-bold block mt-0.5 ${
                capacityResult.status === "CRITICAL_DEFICIT" ? "text-rose-600" :
                capacityResult.status === "UNDERSTAFFED" ? "text-amber-600" : "text-emerald-700"
              }`}>
                {capacityResult.status.replace(/_/g, " ")}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-white border border-[#e5dfd2] shadow-xs">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">SPAN OF CONTROL</span>
              <span className="font-black text-slate-900 block mt-0.5 text-xl">{dept.spanRatio}:1</span>
              <span className={`text-[10px] font-bold block mt-0.5 ${
                dept.spanHealth === "CRITICAL_DEFICIT" ? "text-rose-600" :
                dept.spanHealth === "STRAINED" ? "text-amber-600" : "text-emerald-700"
              }`}>
                Span: {dept.spanHealth}
              </span>
            </div>
          </div>

          {/* Workload vs Capacity Physics Bar */}
          <div className="p-4 rounded-2xl bg-[#f7f5ee] border border-[#e2dccf] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#e5dfd2]">
              <span className="text-xs font-mono font-bold text-slate-800 uppercase flex items-center gap-1.5">
                <Activity size={14} className="text-emerald-700" /> MONTHLY WORKLOAD & CAPACITY PHYSICS
              </span>
              <span className="text-xs font-mono font-bold text-slate-600">
                {dept.monthlyWorkUnitsDemand.toLocaleString()} / {capacityResult.effectiveCapacityWU.toLocaleString()} WU
              </span>
            </div>

            <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden p-0.5 border border-slate-300">
              <div
                className={`h-full rounded-full transition-all ${
                  capacityResult.utilizationPercentage > 120 ? "bg-rose-500" :
                  capacityResult.utilizationPercentage > 95 ? "bg-amber-500" : "bg-emerald-600"
                }`}
                style={{ width: `${Math.min(100, capacityResult.utilizationPercentage)}%` }}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-600">
              <span>Principal Force Multiplier: <b>{capacityResult.forceMultiplierPrincipal}x</b></span>
              <span>HQ Coordination: <b>{capacityResult.hqCoordinationMultiplier}x</b></span>
              <span>Span Drag: <b>-{(capacityResult.spanPenaltyDampener * 100).toFixed(0)}%</b></span>
              <span className={`font-bold ${capacityResult.netDeficitOrSurplusWU >= 0 ? "text-emerald-700" : "text-rose-600"}`}>
                Net: {capacityResult.netDeficitOrSurplusWU >= 0 ? "+" : ""}{capacityResult.netDeficitOrSurplusWU.toLocaleString()} WU
              </span>
            </div>

            {capacityResult.recommendations.length > 0 && (
              <div className="p-3 rounded-xl bg-white border border-[#e2ddd0] space-y-1 text-xs">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">DIAGNOSTIC ADVICE:</span>
                {capacityResult.recommendations.map((rec, idx) => (
                  <p key={idx} className="text-slate-700 leading-snug flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                    {rec}
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* Rank Distribution Pyramid */}
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#e2dccf]">
              <span className="text-xs font-mono font-bold text-slate-800 uppercase flex items-center gap-1.5">
                <TrendingUp size={14} className="text-slate-600" /> ORGANIZATIONAL RANK PYRAMID
              </span>
              <span className="text-xs font-mono text-slate-500">
                Mentorship Synergy: +{pyramidAnalysis.mentorshipBonusPct}%
              </span>
            </div>

            <div className="space-y-1.5">
              {[9, 8, 7, 6, 5, 4, 3, 2, 1].map((rk) => {
                const rankNum = rk as EmployeeRank;
                const count = dept.headcountByRank[rankNum] || 0;
                const pct = dept.totalHeadcount > 0 ? (count / dept.totalHeadcount) * 100 : 0;
                const info = RANK_NAMES[rankNum];

                return (
                  <div
                    key={rankNum}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-[#e4ded0] text-xs font-mono"
                  >
                    <span className="w-6 h-6 rounded-md bg-slate-100 border border-slate-300 flex items-center justify-center font-bold text-slate-700 text-[10px]">
                      R{rankNum}
                    </span>
                    <div className="w-44 truncate">
                      <span className="font-bold text-slate-900">{info.title}</span>
                    </div>

                    <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-600 h-full rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <span className="w-12 text-right font-black text-slate-900">{count}</span>
                    <span className="w-14 text-right text-slate-500 text-[11px]">{pct.toFixed(0)}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Level 3 Attached Key Personnel */}
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#e2dccf]">
              <span className="text-xs font-mono font-bold text-slate-800 uppercase flex items-center gap-1.5">
                <Award size={14} className="text-amber-600" /> KEY PERSONNEL DOSSIERS (LEVEL 3)
              </span>
              <span className="text-xs font-mono text-slate-500">
                {attachedKeyPersonnel.length} Key Staff
              </span>
            </div>

            {attachedKeyPersonnel.length === 0 ? (
              <div className="p-4 rounded-xl bg-white border border-dashed border-[#dcd5c7] text-center text-xs font-mono text-slate-500">
                No individual key personnel currently attached. All headcount is aggregated.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {attachedKeyPersonnel.map((keyEmp) => (
                  <div
                    key={keyEmp.id}
                    onClick={() => onSelectKeyEmployee(keyEmp)}
                    className="p-3.5 rounded-xl bg-white hover:bg-[#fffcf7] border border-[#e2ddd0] hover:border-[#b8744c] shadow-xs hover:shadow-md transition-all cursor-pointer group flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-slate-900 text-amber-300 flex items-center justify-center font-bold text-xs shrink-0">
                        R{keyEmp.rank}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-slate-900 group-hover:text-[#ad5b35] transition-colors">
                            {keyEmp.name}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">{keyEmp.id}</span>
                        </div>
                        <span className="text-[11px] text-slate-500 font-mono block">
                          Skill: {keyEmp.overallSkill} • {keyEmp.primarySpecialization}
                        </span>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-slate-400 group-hover:text-slate-800 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Staff Adjust / Hire Dock */}
          <div className="p-4 rounded-2xl bg-white border border-[#e0dad0] shadow-xs space-y-3">
            <span className="text-xs font-mono font-bold text-slate-800 uppercase block">
              QUICK HEADCOUNT MANAGEMENT & RECRUITMENT
            </span>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-slate-500">Rank:</span>
                <select
                  value={selectedRankForHire}
                  onChange={(e) => setSelectedRankForHire(Number(e.target.value) as EmployeeRank)}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 font-bold"
                >
                  {[1, 2, 3, 4, 5, 6].map((rk) => (
                    <option key={rk} value={rk}>
                      Rank {rk} — {RANK_NAMES[rk as EmployeeRank].title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-slate-500">Count:</span>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={hireCount}
                  onChange={(e) => setHireCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 px-2.5 py-1.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 font-bold text-center"
                />
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={() => onHireStaff(selectedRankForHire, hireCount)}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs font-mono flex items-center gap-1.5 shadow-xs transition-all"
                >
                  <Plus size={14} /> Hire {hireCount} Staff
                </button>
                <button
                  onClick={() => onReduceStaff(selectedRankForHire, hireCount)}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs font-mono flex items-center gap-1.5 shadow-xs transition-all"
                >
                  <Minus size={14} /> Release {hireCount} Staff
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#f8f5ee] border-t border-[#dad2c2] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white border border-[#d0c9b8] hover:bg-slate-100 text-slate-700 font-bold text-xs font-mono transition-colors"
          >
            Close Inspector
          </button>
        </div>

      </div>
    </div>
  );
};
