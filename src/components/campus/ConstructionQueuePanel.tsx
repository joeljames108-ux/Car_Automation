import React, { useState } from "react";
import {
  Hammer,
  ChevronUp,
  ChevronDown,
  Clock,
  HardHat,
  X,
  Factory,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { useCampusStore } from "../../state/campusStore";
import { getMaxConcurrentConstructionJobs } from "../../sim/campus/constructionQueue";

export const ConstructionQueuePanel: React.FC = () => {
  const {
    constructionJobs,
    cancelConstruction,
    units,
    factoryState,
    selectUnit,
  } = useCampusStore();

  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const corpHqLevel = units.CENTRAL_CORPORATE_HQ?.level || 1;
  const maxJobs = getMaxConcurrentConstructionJobs(corpHqLevel);
  const activeJobs = constructionJobs.filter(j => j.status === "in_progress" || j.status === "queued" || j.status.startsWith("paused"));
  const isFactoryUnderConstruction = factoryState.ownershipStatus === "under_construction";
  const totalActiveProjects = activeJobs.length + (isFactoryUnderConstruction ? 1 : 0);

  if (totalActiveProjects === 0 && !isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="absolute bottom-3 left-4 z-20 px-3.5 py-2 rounded-xl bg-[#f8f6f0]/95 backdrop-blur-md border border-[#dad4c5] hover:border-slate-400 text-slate-700 hover:text-slate-900 shadow-md flex items-center gap-2 font-mono text-xs transition-all"
        title="View Construction Queue"
      >
        <HardHat size={15} className="text-amber-600" />
        <span className="font-bold">CIVIL ENGINEERING</span>
        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-600 font-bold">
          IDLE
        </span>
        <ChevronUp size={14} className="text-slate-400" />
      </button>
    );
  }

  return (
    <div className="absolute bottom-3 left-4 z-20 w-96 max-w-[calc(100vw-32px)] bg-[#f8f6f0]/95 backdrop-blur-xl border border-[#dad4c5] rounded-2xl shadow-xl overflow-hidden text-slate-900 animate-in fade-in slide-in-from-bottom duration-200">
      {/* Header bar */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-3 bg-[#f1eee4]/90 border-b border-[#dad4c5] flex items-center justify-between cursor-pointer select-none"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800">
            <Hammer size={14} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-xs text-slate-900">CAMPUS CONSTRUCTION</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                totalActiveProjects > 0 ? "bg-amber-100 text-amber-800 border border-amber-300" : "bg-slate-200 text-slate-600"
              }`}>
                {totalActiveProjects} / {maxJobs} ACTIVE
              </span>
            </div>
          </div>
        </div>
        <button className="text-slate-500 hover:text-slate-900 p-1">
          {isExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </button>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-3 max-h-72 overflow-y-auto space-y-2.5 text-xs font-mono">
          {/* Factory Mega-Project Card */}
          {isFactoryUnderConstruction && (
            <div
              onClick={() => selectUnit("FACTORY")}
              className="p-3 rounded-xl bg-white/90 border border-amber-300 hover:border-amber-400 cursor-pointer space-y-2 shadow-xs transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Factory size={14} className="text-amber-700" />
                  <span className="font-bold text-slate-900 text-xs">Mega-Plot Factory Plant</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-300 font-bold">
                  CIVIL WORKS
                </span>
              </div>

              <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full bg-amber-600 transition-all duration-300"
                  style={{ width: `${factoryState.constructionProgressPct}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-600">
                <span>Progress: <strong className="text-slate-900">{factoryState.constructionProgressPct}%</strong></span>
                <span>{factoryState.constructionMonthsRemaining} mo left</span>
                <span>${(factoryState.constructionBudgetSpent / 1e6).toFixed(1)}M spent</span>
              </div>
            </div>
          )}

          {/* Active Standard Construction Jobs */}
          {activeJobs.map((job) => (
            <div
              key={job.jobId}
              className="p-3 rounded-xl bg-white/90 border border-[#dad4c5] hover:border-slate-400 space-y-2 shadow-xs transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">{job.unitName}</h4>
                  <span className="text-[10px] text-cyan-800">
                    Upgrading L{job.startLevel} → L{job.targetLevel}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {job.contractorTier && (
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                      job.contractorTier === "premium"
                        ? "bg-purple-100 text-purple-900 border border-purple-300"
                        : job.contractorTier === "budget"
                        ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                        : "bg-slate-200 text-slate-700"
                    }`}>
                      {job.contractorTier}
                    </span>
                  )}
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                    job.status === "in_progress"
                      ? "bg-cyan-100 text-cyan-800 border border-cyan-300"
                      : "bg-amber-100 text-amber-800 border border-amber-300"
                  }`}>
                    {job.status.replace(/_/g, " ").toUpperCase()}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      cancelConstruction(job.jobId);
                    }}
                    className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                    title="Cancel Project"
                  >
                    <X size={13} />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full bg-cyan-600 transition-all duration-300"
                  style={{ width: `${job.progressPct}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-600">
                <span>Progress: <strong className="text-slate-900">{job.progressPct}%</strong></span>
                <span>{job.totalMonthsRequired - job.monthsElapsed} mo remaining</span>
                <span className="text-amber-800 font-bold">${(job.totalCost / 1e6).toFixed(1)}M</span>
              </div>
            </div>
          ))}

          {totalActiveProjects === 0 && (
            <div className="p-4 text-center text-slate-500 space-y-1">
              <HardHat size={20} className="mx-auto text-slate-400 mb-1" />
              <p className="font-bold text-slate-700">No Active Projects</p>
              <p className="text-[10px]">Select any facility or reserved plot to commission construction.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
