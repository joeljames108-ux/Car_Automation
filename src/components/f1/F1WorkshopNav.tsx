// ============================================================================
// F1 CONSTRUCTOR EXPERIENCE — WORKSHOP NAVIGATION SIDEBAR
// ============================================================================

import React from "react";
import {
  LayoutDashboard, Shield, Zap, Wind, Activity, Layers, Disc,
  Sliders, Palette, Gavel, Gauge, Cpu, CheckCircle2, AlertTriangle,
} from "lucide-react";
import { useF1ConstructorStore } from "../../sim/f1/state/f1ConstructorStore";
import { F1_WORKSHOP_STEPS, type F1WorkshopStepId } from "../../sim/f1/state/f1BuildStateMachine";

const ICON_MAP: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard size={16} />,
  Shield: <Shield size={16} />,
  Zap: <Zap size={16} />,
  Wind: <Wind size={16} />,
  Activity: <Activity size={16} />,
  Layers: <Layers size={16} />,
  Disc: <Disc size={16} />,
  Sliders: <Sliders size={16} />,
  Palette: <Palette size={16} />,
  Gavel: <Gavel size={16} />,
  Gauge: <Gauge size={16} />,
  Cpu: <Cpu size={16} />,
};

interface F1WorkshopNavProps {
  onSelectStep?: (step: F1WorkshopStepId) => void;
}

export const F1WorkshopNav: React.FC<F1WorkshopNavProps> = ({ onSelectStep }) => {
  const { activeStep, setActiveStep, completionMap } = useF1ConstructorStore();

  const handleStepClick = (stepId: F1WorkshopStepId) => {
    setActiveStep(stepId);
    if (onSelectStep) onSelectStep(stepId);
  };

  return (
    <div className="w-full lg:w-64 bg-slate-900/70 backdrop-blur-md rounded-2xl border border-slate-800 p-3 space-y-1.5 shadow-2xl flex flex-col">
      <div className="px-3 py-2 border-b border-slate-800/80 mb-1 flex items-center justify-between">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Design Departments
        </div>
        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-2 py-0.5 rounded-full">
          12 Studios
        </span>
      </div>

      <div className="space-y-1 flex-1 overflow-y-auto max-h-[70vh] custom-scrollbar">
        {F1_WORKSHOP_STEPS.map((step) => {
          const isActive = activeStep === step.id;
          const status = completionMap[step.id];

          return (
            <button
              key={step.id}
              onClick={() => handleStepClick(step.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all group ${
                isActive
                  ? "bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 shadow-md shadow-cyan-950/30"
                  : "bg-slate-950/30 border border-transparent hover:bg-slate-800/60 hover:border-slate-700/60 text-slate-300"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`p-1.5 rounded-lg transition-colors ${
                    isActive ? "bg-cyan-500/20 text-cyan-400" : "bg-slate-800/80 text-slate-400 group-hover:text-slate-200"
                  }`}
                >
                  {ICON_MAP[step.iconName] || <LayoutDashboard size={16} />}
                </div>
                <div className="truncate">
                  <div className="text-xs font-semibold truncate leading-snug">{step.shortTitle}</div>
                  <div className="text-[10px] text-slate-500 truncate">{status?.highlightKpi || step.category}</div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                {status?.isCompliant ? (
                  <CheckCircle2 size={12} className="text-ok-400" />
                ) : (
                  <AlertTriangle size={12} className="text-warn-400" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
