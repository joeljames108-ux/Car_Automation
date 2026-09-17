import React from "react";
import {
  CheckCircle2,
  Lock,
  AlertTriangle,
  Flame,
  Car,
  Wind,
  Sofa,
  Trophy,
  ChevronRight,
  ShieldAlert,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import {
  useGuidedEngineeringStore,
  WorkflowStage,
  WORKFLOW_STAGES_META,
  ConfigurationStatus,
} from "../../state/guidedEngineeringStore";

interface GuidedWorkflowStepperProps {
  activeStageId: string;
  onSelectStage: (stageId: string) => void;
  className?: string;
}

export const GuidedWorkflowStepper: React.FC<GuidedWorkflowStepperProps> = ({
  activeStageId,
  onSelectStage,
  className = "",
}) => {
  const {
    engineStatus,
    vehicleStatus,
    aeroStatus,
    interiorStatus,
    finalBuildStatus,
    activeWorkflowStage,
    canEnterStage,
    setActiveWorkflowStage,
    resetAllStages,
  } = useGuidedEngineeringStore();

  const stageOrder: WorkflowStage[] = ["engine", "vehicle", "aero", "interior", "final_build"];

  const getStatus = (stage: WorkflowStage): ConfigurationStatus => {
    switch (stage) {
      case "engine": return engineStatus;
      case "vehicle": return vehicleStatus;
      case "aero": return aeroStatus;
      case "interior": return interiorStatus;
      case "final_build": return finalBuildStatus;
    }
  };

  const getStageIcon = (stage: WorkflowStage, size = 15) => {
    switch (stage) {
      case "engine": return <Flame size={size} />;
      case "vehicle": return <Car size={size} />;
      case "aero": return <Wind size={size} />;
      case "interior": return <Sofa size={size} />;
      case "final_build": return <Trophy size={size} />;
    }
  };

  const handleStepClick = (stage: WorkflowStage) => {
    const gate = canEnterStage(stage);
    const meta = WORKFLOW_STAGES_META[stage];
    if (gate.allowed) {
      setActiveWorkflowStage(stage);
      onSelectStage(meta.appStageId);
    } else {
      // Even if disallowed, we switch to that appStageId so LockedStageGate can display the explanation!
      setActiveWorkflowStage(stage);
      onSelectStage(meta.appStageId);
    }
  };

  return (
    <div
      className={`w-full rounded-2xl bg-gradient-to-r from-[#0b0f19]/90 via-[#111625]/85 to-[#0b0f19]/90 border border-amber-500/25 backdrop-blur-xl p-3 shadow-[0_12px_40px_rgba(0,0,0,0.5)] ${className}`}
    >
      <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
        {/* Left: Brand Badge & Flow Tagline */}
        <div className="flex items-center gap-2.5 px-2 self-start lg:self-center">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
            <Sparkles size={16} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
                Sequential Pipeline
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono">
                BUILD FROM ZERO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
              Engine → Vehicle → Aero → Interior → Final Build
            </p>
          </div>
        </div>

        {/* Center: The 5 Steps */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto max-w-full pb-1 lg:pb-0 scrollbar-none">
          {stageOrder.map((stage, idx) => {
            const meta = WORKFLOW_STAGES_META[stage];
            const status = getStatus(stage);
            const gate = canEnterStage(stage);
            const isLocked = !gate.allowed;
            const isCurrentActive =
              activeWorkflowStage === stage || activeStageId === meta.appStageId;

            // Compute appearance based on status
            let badgeColor = "text-slate-500 border-slate-700 bg-slate-900/40";
            let statusLabel = "UNCONFIGURED";
            let statusBadge = (
              <span className="text-[9px] font-mono text-slate-500">
                LOCKED
              </span>
            );

            if (status === "configured") {
              badgeColor = "text-emerald-400 border-emerald-500/50 bg-emerald-950/40 shadow-[0_0_12px_rgba(16,185,129,0.2)]";
              statusLabel = "COMPLETE";
              statusBadge = (
                <span className="inline-flex items-center gap-0.5 text-[9px] font-mono font-bold text-emerald-400">
                  <CheckCircle2 size={10} /> COMPLETE
                </span>
              );
            } else if (status === "invalidated") {
              badgeColor = "text-amber-400 border-amber-500/60 bg-amber-950/40 animate-pulse shadow-[0_0_15px_rgba(245,158,11,0.3)]";
              statusLabel = "RECALC REQUIRED";
              statusBadge = (
                <span className="inline-flex items-center gap-0.5 text-[9px] font-mono font-bold text-amber-400">
                  <AlertTriangle size={10} /> RECALC
                </span>
              );
            } else if (status === "configuring") {
              badgeColor = "text-amber-300 border-amber-500/50 bg-amber-950/30 shadow-[0_0_12px_rgba(245,158,11,0.25)]";
              statusLabel = "CONFIGURING";
              statusBadge = (
                <span className="text-[9px] font-mono font-bold text-amber-300">
                  IN PROGRESS
                </span>
              );
            } else if (isLocked) {
              badgeColor = "text-slate-600 border-slate-800/80 bg-slate-950/40 opacity-60";
              statusBadge = (
                <span className="inline-flex items-center gap-0.5 text-[9px] font-mono text-slate-500">
                  <Lock size={9} /> LOCKED
                </span>
              );
            } else {
              // Unconfigured but unlocked
              badgeColor = "text-cyan-400 border-cyan-500/40 bg-cyan-950/20";
              statusBadge = (
                <span className="text-[9px] font-mono text-cyan-400">
                  READY
                </span>
              );
            }

            return (
              <React.Fragment key={stage}>
                <button
                  type="button"
                  onClick={() => handleStepClick(stage)}
                  title={isLocked ? gate.reason : `Go to ${meta.label} stage`}
                  className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all duration-200 text-left cursor-pointer whitespace-nowrap active:scale-[0.98] ${
                    isCurrentActive
                      ? "ring-2 ring-amber-400/80 border-amber-400 bg-gradient-to-r from-amber-500/20 via-amber-600/15 to-transparent text-slate-100 shadow-[0_0_20px_rgba(245,158,11,0.25)]"
                      : isLocked
                      ? "border-slate-800/80 bg-slate-950/50 text-slate-500 hover:border-slate-700"
                      : "border-slate-700/60 bg-slate-900/60 hover:border-amber-400/50 hover:bg-slate-800/60 text-slate-300 hover:translate-y-[-1px]"
                  }`}
                >
                  {/* Step Number Circle */}
                  <div
                    className={`w-6 h-6 rounded-lg border flex items-center justify-center font-mono font-bold text-xs transition-colors ${badgeColor}`}
                  >
                    {status === "configured" ? (
                      <CheckCircle2 size={13} className="text-emerald-400" />
                    ) : isLocked ? (
                      <Lock size={11} className="text-slate-600" />
                    ) : (
                      <span>{meta.stageNumber}</span>
                    )}
                  </div>

                  {/* Stage Label & Status Pill */}
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold font-mono tracking-tight text-slate-200 group-hover:text-white">
                        {meta.label}
                      </span>
                    </div>
                    <div>{statusBadge}</div>
                  </div>
                </button>

                {/* Arrow connector between stages */}
                {idx < stageOrder.length - 1 && (
                  <ChevronRight
                    size={14}
                    className={`shrink-0 ${
                      status === "configured" ? "text-emerald-500/70" : "text-slate-700"
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Right: Reset All to Zero button */}
        <div className="flex items-center gap-2 self-end lg:self-center">
          <button
            type="button"
            onClick={resetAllStages}
            title="Reset entire vehicle to zero state"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-700/60 bg-slate-900/60 hover:border-rose-500/50 hover:bg-rose-950/20 text-slate-400 hover:text-rose-300 transition-all text-[11px] font-mono cursor-pointer"
          >
            <RotateCcw size={12} />
            <span className="hidden sm:inline">Reset Zero</span>
          </button>
        </div>
      </div>
    </div>
  );
};
