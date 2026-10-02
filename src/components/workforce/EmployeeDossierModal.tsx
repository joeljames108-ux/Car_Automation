/**
 * ═══════════════════════════════════════════════════════════════════════
 * EMPLOYEE DOSSIER MODAL — LEVEL 3 PERSONNEL INSPECTION
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Implements Section 1 ("Employee Number"), Section 3 ("Career Log"),
 * and Section 4 ("Employee Structure").
 *
 * Displays detailed dossier for Key Personnel (EMP-XXXXXX):
 * - Permanent employee ID badge
 * - Multidimensional skill radar / progress breakdown
 * - Primary and secondary specializations
 * - Complete career milestone timeline
 * - Current active project assignment and loyalty/morale metrics
 */

import React from "react";
import {
  X, User, Award, Briefcase, Calendar, Star, TrendingUp,
  Shield, CheckCircle2, Flame, Wrench, Heart, Compass
} from "lucide-react";
import { Employee, RANK_NAMES } from "../../sim/workforce/workforceTypes";
import { SPECIALIZATIONS } from "../../sim/workforce/specializationRegistry";

interface EmployeeDossierModalProps {
  employee: Employee | null;
  isOpen: boolean;
  onClose: () => void;
  onPromote?: (empId: Employee["id"]) => void;
}

export const EmployeeDossierModal: React.FC<EmployeeDossierModalProps> = ({
  employee,
  isOpen,
  onClose,
  onPromote,
}) => {
  if (!isOpen || !employee) return null;

  const rankInfo = RANK_NAMES[employee.rank];
  const primarySpecDef = SPECIALIZATIONS[employee.primarySpecialization];
  const secondarySpecDef = employee.secondarySpecialization
    ? SPECIALIZATIONS[employee.secondarySpecialization]
    : null;

  const yearsOfService = Math.floor(employee.tenureMonthsWithCompany / 12);
  const monthsRemainder = employee.tenureMonthsWithCompany % 12;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-[#fdfbf7] border border-[#dcd5c7] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] font-sans">
        
        {/* Header Ribbon */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#f4eee1] via-[#f7f2e7] to-[#ede5d5] border-b border-[#dad2c2] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 text-white flex items-center justify-center shadow-md border border-slate-700">
              <User size={24} className="text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-600/30 text-amber-900 font-mono font-black text-xs">
                  {employee.id}
                </span>
                <span className="text-[11px] font-mono text-slate-500 font-bold uppercase">
                  {employee.division} • {employee.departmentId.replace(/_/g, " ")}
                </span>
              </div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight mt-0.5">
                {employee.name}
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

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Top Quick Status Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 rounded-2xl bg-white border border-[#e5dfd2] shadow-xs">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">RANK & TITLE</span>
              <span className="font-black text-slate-900 block mt-0.5 text-sm">{rankInfo.title}</span>
              <span className="text-[10px] text-emerald-800 font-bold block mt-0.5">Rank {employee.rank} • {rankInfo.baseProductivity}x Prod</span>
            </div>

            <div className="p-3 rounded-2xl bg-white border border-[#e5dfd2] shadow-xs">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">OVERALL SKILL</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="font-black text-slate-900 text-xl">{employee.overallSkill}</span>
                <span className="text-slate-500 text-[11px]">/ 100</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1.5">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all"
                  style={{ width: `${employee.overallSkill}%` }}
                />
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white border border-[#e5dfd2] shadow-xs">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">COMPANY TENURE</span>
              <span className="font-black text-slate-900 block mt-0.5 text-sm">
                {yearsOfService > 0 ? `${yearsOfService} yrs ${monthsRemainder} mos` : `${monthsRemainder} mos`}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Joined {employee.joinYear}</span>
            </div>

            <div className="p-3 rounded-2xl bg-white border border-[#e5dfd2] shadow-xs">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">MORALE & LOYALTY</span>
              <div className="flex items-center justify-between mt-1 text-slate-700">
                <span className="flex items-center gap-1"><Heart size={12} className="text-rose-500" /> {employee.morale}%</span>
                <span className="flex items-center gap-1"><Shield size={12} className="text-sky-600" /> {employee.loyalty}%</span>
              </div>
              <span className="text-[10px] text-emerald-700 font-bold block mt-1">Retention: Exceptional</span>
            </div>
          </div>

          {/* Specializations & Active Assignment */}
          <div className="p-4 rounded-2xl bg-[#f7f5ee] border border-[#e2dccf] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#e5dfd2]">
              <span className="text-xs font-mono font-bold text-slate-700 uppercase flex items-center gap-1.5">
                <Compass size={14} className="text-amber-600" /> AUTOMOTIVE SPECIALIZATION
              </span>
              <span className="text-xs font-mono font-bold text-slate-500">
                Mastery Score: {employee.specializationScore}/100
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white border border-[#e4ded0]">
                <span className="text-[10px] text-amber-800 font-mono font-bold uppercase block">PRIMARY SPECIALIZATION</span>
                <span className="text-sm font-bold text-slate-900 block mt-0.5">
                  {primarySpecDef?.name ?? employee.primarySpecialization}
                </span>
                <p className="text-[11px] text-slate-600 leading-relaxed mt-1">
                  {primarySpecDef?.description ?? "Specialized automotive domain mastery."}
                </p>
              </div>

              {secondarySpecDef ? (
                <div className="p-3 rounded-xl bg-white border border-[#e4ded0]">
                  <span className="text-[10px] text-slate-500 font-mono font-bold uppercase block">SECONDARY SPECIALIZATION</span>
                  <span className="text-sm font-bold text-slate-900 block mt-0.5">
                    {secondarySpecDef.name}
                  </span>
                  <p className="text-[11px] text-slate-600 leading-relaxed mt-1">
                    {secondarySpecDef.description}
                  </p>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-white/60 border border-dashed border-[#dcd5c7] flex items-center justify-center text-slate-400 font-mono text-[11px]">
                  No secondary specialization (eligible for cross-training)
                </div>
              )}
            </div>

            {employee.currentAssignment && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-mono flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-emerald-800 uppercase font-bold block">CURRENT ASSIGNMENT</span>
                  <span className="text-slate-900 font-bold block text-sm mt-0.5">
                    {employee.currentAssignment.projectName}
                  </span>
                  <span className="text-slate-600 text-[11px] block">
                    Role: {employee.currentAssignment.role}
                  </span>
                </div>
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                  <Wrench size={16} />
                </div>
              </div>
            )}
          </div>

          {/* Career History & Milestones */}
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#e2dccf]">
              <span className="text-xs font-mono font-bold text-slate-800 uppercase flex items-center gap-1.5">
                <Calendar size={14} className="text-slate-600" /> PERMANENT CAREER MILESTONES
              </span>
              <span className="text-xs font-mono text-slate-500">
                {employee.careerLog.length} Milestones Logged
              </span>
            </div>

            <div className="space-y-2">
              {employee.careerLog.map((log, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-xl bg-white border border-[#e4ded0] shadow-xs text-xs font-mono"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#f0ebd9] text-amber-900 flex items-center justify-center font-bold text-[11px] shrink-0">
                    {log.year}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs uppercase">{log.event.replace(/_/g, " ")}</span>
                      <span className="text-[10px] text-slate-500">Month {log.month}</span>
                    </div>
                    <p className="text-slate-600 text-[11px] mt-0.5 font-sans">
                      {log.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-[#f8f5ee] border-t border-[#dad2c2] flex items-center justify-between gap-3">
          <div className="text-xs font-mono text-slate-500">
            Workplace Facility: <span className="font-bold text-slate-800">{employee.facilityId}</span>
          </div>

          <div className="flex items-center gap-2">
            {employee.rank < 8 && onPromote && (
              <button
                onClick={() => onPromote(employee.id)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs font-mono flex items-center gap-1.5 shadow-sm transition-all"
              >
                <TrendingUp size={14} /> Promote to Rank {employee.rank + 1}
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white border border-[#d0c9b8] hover:bg-slate-100 text-slate-700 font-bold text-xs font-mono transition-colors"
            >
              Close Dossier
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
