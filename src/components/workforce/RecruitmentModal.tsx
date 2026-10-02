/**
 * ═══════════════════════════════════════════════════════════════════════
 * TALENT SCOUTING & KEY PERSONNEL RECRUITMENT MODAL
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Implements Sections 2, 4, 7, 27 & 28:
 * - Scout star engineers, designers and factory superintendents
 * - Displays candidate pedigree, individual reputation and specialization
 * - Assigns permanent sequential EMP-XXXXXX ID upon hiring
 */

import React, { useState } from "react";
import {
  X, Award, Briefcase, Zap, Shield, Sparkles, Check, RefreshCw, Building2, UserPlus
} from "lucide-react";
import { useWorkforceStore } from "../../state/workforceStore";
import { generateCandidatePool, EmployeeCandidate } from "../../sim/workforce/recruitmentEngine";
import { DepartmentId, RANK_NAMES } from "../../sim/workforce/workforceTypes";

interface RecruitmentModalProps {
  onClose: () => void;
  onHired?: (employeeName: string, id: string) => void;
}

export const RecruitmentModal: React.FC<RecruitmentModalProps> = ({ onClose, onHired }) => {
  const { hireKeyCandidate, departments } = useWorkforceStore();
  const [candidates, setCandidates] = useState<EmployeeCandidate[]>(() => generateCandidatePool(1970, 4));
  const [selectedDepts, setSelectedDepts] = useState<Record<string, DepartmentId>>({});
  const [justHiredId, setJustHiredId] = useState<string | null>(null);

  const activeDepartments = Object.values(departments).filter((d) => d.totalHeadcount > 0);

  const handleRefresh = () => {
    setCandidates(generateCandidatePool(1970, 4));
    setJustHiredId(null);
  };

  const handleHire = (candidate: EmployeeCandidate) => {
    const targetDept = selectedDepts[candidate.candidateId] || candidate.recommendedDepartmentId;
    const hired = hireKeyCandidate(candidate, targetDept, 1970, 1);
    setJustHiredId(candidate.candidateId);
    if (onHired) {
      onHired(hired.name, hired.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-4xl max-h-[90vh] bg-[#fdfbf7] border border-[#dad4c5] rounded-3xl shadow-2xl flex flex-col overflow-hidden font-mono text-xs">
        
        {/* Header */}
        <div className="p-6 border-b border-[#dad4c5] flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-600 via-amber-700 to-amber-900 text-white flex items-center justify-center shadow-md">
              <UserPlus size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-amber-800 font-bold uppercase tracking-widest">
                  HEADHUNTING & SCOUTING (LEVEL 3)
                </span>
                <span className="text-[10px] text-slate-400 font-bold">PERMANENT EMP-XXXXXX IDENTITY</span>
              </div>
              <h2 className="text-base font-black text-slate-900">
                EXECUTIVE & STAR TALENT RECRUITMENT POOL
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors flex items-center gap-1.5"
              title="Scout fresh candidates"
            >
              <RefreshCw size={13} />
              Scout New Talent
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Candidate Cards Grid */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 bg-[#f7f5ef]">
          {candidates.map((cand) => {
            const isHired = justHiredId === cand.candidateId;
            const chosenDept = selectedDepts[cand.candidateId] || cand.recommendedDepartmentId;

            return (
              <div
                key={cand.candidateId}
                className={`p-5 rounded-2xl border transition-all ${
                  isHired
                    ? "bg-emerald-50 border-emerald-300"
                    : "bg-white border-[#dad4c5] hover:border-amber-700 shadow-xs"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  
                  {/* Bio & Reputation */}
                  <div className="space-y-1.5 flex-1 min-w-[280px]">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black text-slate-900">{cand.name}</h3>
                      <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 font-bold text-[10px]">
                        Rank {cand.targetRank}: {RANK_NAMES[cand.targetRank].title}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold text-[10px]">
                        {cand.individualReputation.fameCategory.replace(/_/g, " ")}
                      </span>
                    </div>

                    <p className="text-slate-600 font-sans text-xs">
                      {cand.pedigreeSummary}
                    </p>

                    <div className="flex flex-wrap gap-2 pt-1">
                      <span className="px-2 py-1 rounded-lg bg-slate-100 text-slate-800 font-bold text-[10px]">
                        Primary: {cand.primarySpecialization} ({cand.specializationScore} pts)
                      </span>
                      {cand.secondarySpecialization && (
                        <span className="px-2 py-1 rounded-lg bg-slate-50 text-slate-600 font-bold text-[10px]">
                          Secondary: {cand.secondarySpecialization}
                        </span>
                      )}
                      <span className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-bold text-[10px]">
                        Overall Skill: {cand.overallSkill} / 100
                      </span>
                    </div>
                  </div>

                  {/* Actions & Department Assignment */}
                  <div className="flex flex-col items-end gap-3 min-w-[220px]">
                    <div className="w-full">
                      <span className="text-[10px] text-slate-400 block uppercase mb-1">ASSIGN DEPARTMENT</span>
                      <select
                        disabled={isHired}
                        value={chosenDept}
                        onChange={(e) =>
                          setSelectedDepts((prev) => ({
                            ...prev,
                            [cand.candidateId]: e.target.value as DepartmentId,
                          }))
                        }
                        className="w-full py-1.5 px-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 font-bold text-xs"
                      >
                        {activeDepartments.map((d) => (
                          <option key={d.departmentId} value={d.departmentId}>
                            {d.departmentName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      disabled={isHired}
                      onClick={() => handleHire(cand)}
                      className={`w-full py-2 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                        isHired
                          ? "bg-emerald-600 text-white cursor-default"
                          : "bg-slate-900 hover:bg-black text-white shadow-md hover:shadow-lg"
                      }`}
                    >
                      {isHired ? (
                        <>
                          <Check size={14} />
                          Hired as Key Personnel!
                        </>
                      ) : (
                        <>
                          <UserPlus size={14} />
                          Sign & Issue EMP ID
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#dad4c5] bg-white flex justify-between items-center text-slate-500 text-[11px] font-sans">
          <span>
            Every key employee receives a permanent immutable <strong>EMP-XXXXXX</strong> identifier preserved across their entire career.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono font-bold transition-colors"
          >
            Close Roster
          </button>
        </div>

      </div>
    </div>
  );
};
