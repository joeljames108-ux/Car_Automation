import React, { useMemo, useState } from "react";
import {
  Users,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  Clock,
  Layers,
  Sparkles,
  Sliders,
  GraduationCap,
  Award,
  Zap,
  ShieldAlert,
} from "lucide-react";
import { useFactoryStore } from "../../state/factoryStore";
import { useWorkforceStore } from "../../state/workforceStore";
import { useCompanyFinanceStore } from "../../state/companyFinanceStore";
import { computeFloorLaborDemand } from "../../sim/factory/factoryWorkforceEngine";
import { TRAINING_PROGRAM_COST_USD } from "../../sim/factory/factorySkillEngine";

export function WorkforceAllocatorPanel() {
  const { assemblyLines, updateAssemblyLineConfig, startLineTrainingProgram } = useFactoryStore();
  const { departments } = useWorkforceStore();
  const { cash } = useCompanyFinanceStore();

  const [trainingNotice, setTrainingNotice] = useState<string | null>(null);

  const mfgDept = departments["MANUFACTURING"];
  const totalMfgHeadcount = mfgDept ? mfgDept.totalHeadcount : 120;

  const laborReport = useMemo(() => {
    return computeFloorLaborDemand(assemblyLines);
  }, [assemblyLines]);

  const unassignedWorkers = Math.max(0, totalMfgHeadcount - laborReport.totalAssigned);

  const handleWorkerChange = (lineId: string, count: number) => {
    updateAssemblyLineConfig(lineId, {
      assignedWorkersCount: Math.max(1, count),
    });
  };

  const handleAutoDistribute = () => {
    if (assemblyLines.length === 0) return;
    const perLine = Math.floor(totalMfgHeadcount / assemblyLines.length);
    assemblyLines.forEach((line) => {
      updateAssemblyLineConfig(line.id, {
        assignedWorkersCount: Math.max(line.minWorkersRequired, perLine),
      });
    });
  };

  const handleStartTraining = (lineId: string, lineName: string) => {
    if (cash < TRAINING_PROGRAM_COST_USD) {
      setTrainingNotice(`Insufficient funds ($${cash.toLocaleString()} / $${TRAINING_PROGRAM_COST_USD.toLocaleString()}) to enroll ${lineName}.`);
      return;
    }
    const success = startLineTrainingProgram(lineId);
    if (success) {
      setTrainingNotice(`Training Academy activated for ${lineName}! 2.5× experience acceleration active for 30 days.`);
      setTimeout(() => setTrainingNotice(null), 4000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Workforce Allocation & Skill Progression</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Assign shop-floor technicians, monitor craftsman skill progression tiers, and invest in technical training academies
          </p>
        </div>

        <button
          onClick={handleAutoDistribute}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold shadow-sm transition-colors self-start sm:self-auto"
        >
          <Sliders size={14} /> Auto-Distribute Evenly
        </button>
      </div>

      {trainingNotice && (
        <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-semibold flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <GraduationCap size={16} className="text-indigo-600" />
            <span>{trainingNotice}</span>
          </div>
          <button onClick={() => setTrainingNotice(null)} className="text-indigo-400 hover:text-indigo-600 text-xs">
            ✕
          </button>
        </div>
      )}

      {/* Staffing Health KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Headcount</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {totalMfgHeadcount}{" "}
            <span className="text-xs font-normal text-slate-500">workers</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Manufacturing Department Pool</div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Assigned on Floor</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {laborReport.totalAssigned}{" "}
            <span className="text-xs font-normal text-slate-500">/ {laborReport.totalRequired} min</span>
          </div>
          <div className={`text-[11px] font-semibold mt-1 ${laborReport.staffingHealthPct >= 95 ? "text-emerald-700" : "text-amber-700"}`}>
            {laborReport.staffingHealthPct}% Health Rating
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Available Reserve</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {unassignedWorkers}{" "}
            <span className="text-xs font-normal text-slate-500">free</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Available for line staffing</div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Est. Monthly Payroll</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            ${Math.round(laborReport.monthlyPayrollUSD / 1000)}k
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Base shift wages ($4.25/hr)</div>
        </div>
      </div>

      {/* Per-Line Staffing & Skill Cards */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Assembly Line Crews & Skill Tiers</h3>
            <p className="text-xs text-slate-500">Experience accumulates on producing lines; higher skill boosts takt time and slashes defect rates</p>
          </div>
        </div>

        <div className="space-y-4">
          {assemblyLines.map((line) => {
            const minReq = line.minWorkersRequired * line.shiftsPerDay;
            const isUnderstaffed = line.assignedWorkersCount < minReq;
            const skill = line.workforceSkill;

            const cycleReductionPct = skill ? Math.round((1 - skill.effectiveCycleMultiplier) * 100 * 10) / 10 : 0;
            const defectReductionPct = skill ? Math.abs(skill.effectiveDefectModifier) : 0;

            return (
              <div
                key={line.id}
                className="p-5 rounded-xl border border-slate-200/80 bg-[#fcfbf9] space-y-4"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/60">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">{line.name}</h4>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 uppercase">
                        {line.type.replace("_", " ")}
                      </span>
                      {skill?.trainingProgramActive && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 flex items-center gap-1">
                          <GraduationCap size={12} /> Training Academy ({skill.trainingDaysRemaining}d)
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {line.shiftsPerDay} Shift{line.shiftsPerDay > 1 ? "s" : ""} • Minimum Required: {minReq} staff • Avg Experience: {skill?.averageDaysExperience ?? 0} days
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-sm font-bold text-slate-900">
                        {line.assignedWorkersCount} Workers
                      </span>
                      <div className={`text-[11px] font-semibold ${isUnderstaffed ? "text-amber-700 flex items-center gap-1 justify-end" : "text-emerald-700"}`}>
                        {isUnderstaffed && <AlertTriangle size={12} />}
                        {isUnderstaffed ? `Deficit (-${minReq - line.assignedWorkersCount})` : "Fully Staffed"}
                      </div>
                    </div>

                    {!skill?.trainingProgramActive && (
                      <button
                        onClick={() => handleStartTraining(line.id, line.name)}
                        className="px-3 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50/60 hover:bg-indigo-100 text-indigo-800 text-xs font-semibold transition-colors flex items-center gap-1.5"
                        title="Accelerate crew skill gain 2.5x for 30 days"
                      >
                        <GraduationCap size={13} />
                        Train Crew ($15k)
                      </button>
                    )}
                  </div>
                </div>

                {/* Skill Tiers Distribution Breakdown */}
                {skill && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200/70 shadow-2xs">
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>Trainees (0–90d)</span>
                        <span className="text-slate-400 font-normal">Base</span>
                      </div>
                      <div className="text-base font-bold text-slate-800 mt-0.5">
                        {skill.traineeCount} <span className="text-xs font-normal text-slate-400">staff</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-slate-200/70 shadow-2xs">
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>Journeymen</span>
                        <span className="text-emerald-600 font-semibold text-[10px]">−3% takt</span>
                      </div>
                      <div className="text-base font-bold text-slate-800 mt-0.5">
                        {skill.journeymanCount} <span className="text-xs font-normal text-slate-400">staff</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-slate-200/70 shadow-2xs">
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>Seniors (1–2 yr)</span>
                        <span className="text-indigo-600 font-semibold text-[10px]">−6% takt</span>
                      </div>
                      <div className="text-base font-bold text-slate-800 mt-0.5">
                        {skill.seniorCount} <span className="text-xs font-normal text-slate-400">staff</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-slate-200/70 shadow-2xs">
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>Masters (2+ yr)</span>
                        <span className="text-amber-600 font-semibold text-[10px]">−10% takt</span>
                      </div>
                      <div className="text-base font-bold text-slate-800 mt-0.5">
                        {skill.masterCount} <span className="text-xs font-normal text-slate-400">staff</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Skill Bonuses Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-200/60 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-emerald-900 flex items-center gap-1.5">
                      <Zap size={14} className="text-emerald-600" />
                      Skill Buffs:
                    </span>
                    <span className="text-emerald-800">
                      Takt Time Speedup: <strong className="font-bold">−{cycleReductionPct}%</strong>
                    </span>
                    <span className="text-emerald-800">
                      Defect Reduction: <strong className="font-bold">−{defectReductionPct}%</strong>
                    </span>
                  </div>

                  {isUnderstaffed && (
                    <div className="text-[11px] text-amber-800 font-semibold flex items-center gap-1">
                      <ShieldAlert size={13} />
                      Overwork turnover risk active
                    </div>
                  )}
                </div>

                {/* Staffing Slider */}
                <div className="space-y-1 pt-1">
                  <input
                    type="range"
                    min={line.minWorkersRequired}
                    max={Math.max(line.minWorkersRequired * 4, 150)}
                    value={line.assignedWorkersCount}
                    onChange={(e) => handleWorkerChange(line.id, parseInt(e.target.value) || 20)}
                    className="w-full accent-slate-900"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Min Shift Req: {minReq}</span>
                    <span>Target Max: {minReq * 2}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
