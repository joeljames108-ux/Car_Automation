import React from "react";
import {
  Lock,
  ArrowLeft,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Flame,
  Car,
  Wind,
  Sofa,
  Trophy,
  CheckCircle2,
  AlertCircle,
  Unlock,
  Factory,
  Activity,
  ShieldCheck,
} from "lucide-react";
import {
  WorkflowStage,
  WORKFLOW_STAGES_META,
  useGuidedEngineeringStore,
} from "../../state/guidedEngineeringStore";
import { useDeveloperModeStore } from "../../state/developerModeStore";

interface LockedStageGateProps {
  targetStage: WorkflowStage;
  reason?: string;
  requiredStage?: WorkflowStage;
  onGoToRequiredStage: (stage: WorkflowStage) => void;
  className?: string;
}

export const LockedStageGate: React.FC<LockedStageGateProps> = ({
  targetStage,
  reason,
  requiredStage,
  onGoToRequiredStage,
  className = "",
}) => {
  const meta = WORKFLOW_STAGES_META[targetStage];
  const reqMeta = requiredStage ? WORKFLOW_STAGES_META[requiredStage] : null;
  const store = useGuidedEngineeringStore();

  const getStageIcon = (stage: WorkflowStage, size = 28) => {
    switch (stage) {
      case "engine": return <Flame size={size} className="text-amber-400" />;
      case "vehicle": return <Car size={size} className="text-cyan-400" />;
      case "aero": return <Wind size={size} className="text-teal-400" />;
      case "interior": return <Sofa size={size} className="text-purple-400" />;
      case "safety": return <ShieldCheck size={size} className="text-emerald-400" />;
      case "simulation": return <Activity size={size} className="text-sky-400" />;
      case "manufacturing": return <Factory size={size} className="text-amber-500" />;
      case "final_build": return <Trophy size={size} className="text-amber-400" />;
    }
  };

  const explanation =
    reason ||
    (reqMeta
      ? `${meta.label} is locked. Complete ${reqMeta.label} configuration first.`
      : `${meta.label} is currently locked.`);

  return (
    <div
      className={`min-h-[520px] w-full flex items-center justify-center p-6 ${className}`}
    >
      <div className="relative max-w-xl w-full rounded-3xl bg-gradient-to-b from-[#0e1424]/95 via-[#0b101c]/95 to-[#060810]/98 border border-amber-500/30 backdrop-blur-2xl p-8 shadow-[0_25px_80px_rgba(0,0,0,0.85)] space-y-6 text-center overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 right-1/4 w-64 h-64 bg-gradient-to-b from-amber-500/10 via-transparent to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-gradient-to-tr from-amber-500/10 via-transparent to-transparent rounded-full blur-2xl pointer-events-none" />

        {/* Lock Icon Header */}
        <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-500/20 via-slate-900/60 to-slate-950 border border-amber-500/40 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.25)] relative">
          <Lock size={36} className="text-amber-400" />
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-400">
            {getStageIcon(targetStage, 14)}
          </div>
        </div>

        {/* Headline & Subtitle */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-mono font-bold uppercase tracking-wider">
            <ShieldAlert size={12} />
            <span>MANDATORY SEQUENTIAL GATING</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-100 tracking-tight">
            {meta.label} Is Locked
          </h2>
          <p className="text-sm font-mono text-amber-200/90 font-medium">
            {explanation}
          </p>
        </div>

        {/* Engineering Philosophy Notice */}
        <div className="rounded-2xl bg-slate-900/70 border border-slate-800/80 p-4 text-left space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-300 uppercase tracking-wide">
            <Sparkles size={14} className="text-amber-400" />
            <span>Build-From-Zero Engineering System</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            Under this rigorous automotive engineering protocol, vehicle mass, weight distribution,
            chassis kinematics, and aerodynamic balance are dynamically derived from upstream physical components.
            No placeholder defaults or fictitious specifications are generated.
          </p>
          {reqMeta && (
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Prerequisite stage:</span>
              <span className="text-amber-400 font-bold flex items-center gap-1">
                Step {reqMeta.stageNumber}: {reqMeta.label}
              </span>
            </div>
          )}
        </div>

        {/* If target is manufacturing: Display explicit 6-stage prerequisite checklist */}
        {targetStage === "manufacturing" && (
          <div className="rounded-2xl bg-slate-900/90 border border-amber-500/40 p-4 text-left space-y-3">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-amber-300 uppercase tracking-wide">
              <span>REQUIRED UPSTREAM STAGES (6 OF 6)</span>
              <span className="text-[10px] text-slate-400">All 6 must be configured</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              {[
                { id: "engine" as WorkflowStage, num: 1, label: "Engine Designer", status: store.engineStatus },
                { id: "vehicle" as WorkflowStage, num: 2, label: "Vehicle Studio", status: store.vehicleStatus },
                { id: "aero" as WorkflowStage, num: 3, label: "Aero Studio", status: store.aeroStatus },
                { id: "interior" as WorkflowStage, num: 4, label: "Interior Configurator", status: store.interiorStatus },
                { id: "safety" as WorkflowStage, num: 5, label: "Safety Center", status: store.safetyStatus },
                { id: "simulation" as WorkflowStage, num: 6, label: "Sim & Testing", status: store.simulationStatus },
              ].map((step) => {
                const isComplete = step.status === "configured" || step.status === "invalidated";
                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => onGoToRequiredStage(step.id)}
                    className={`flex items-center justify-between p-2 rounded-xl border transition-all text-left cursor-pointer ${
                      isComplete
                        ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/50"
                        : "bg-rose-950/30 border-rose-500/40 text-rose-300 hover:bg-rose-900/40"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isComplete ? (
                        <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                      ) : (
                        <AlertCircle size={14} className="text-rose-400 shrink-0" />
                      )}
                      <span className="font-bold">{step.num}. {step.label}</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      {isComplete ? "Ready" : "Pending"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {reqMeta && (
            <button
              type="button"
              onClick={() => onGoToRequiredStage(reqMeta.id)}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(245,158,11,0.4)] transition-all cursor-pointer"
            >
              <span>Go to Step {reqMeta.stageNumber}: {reqMeta.label}</span>
              <ArrowRight size={14} />
            </button>
          )}

          <button
            type="button"
            onClick={() => onGoToRequiredStage("engine")}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white font-mono text-xs tracking-wider transition-all cursor-pointer"
          >
            Review Step 1: ENGINE
          </button>

          <button
            type="button"
            onClick={() => {
              useDeveloperModeStore.getState().setDevMode(true);
              useDeveloperModeStore.getState().setOverride("ignoreWorkflowGating", true);
            }}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 hover:text-white font-mono text-xs tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.15)]"
            title="Bypass sequential workflow restriction via Developer Mode"
          >
            <Unlock size={14} />
            <span>Dev Bypass</span>
          </button>
        </div>
      </div>
    </div>
  );
};
