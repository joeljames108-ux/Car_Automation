import React from "react";
import { Car, Gauge, Scale, Wind, DollarSign, ChevronRight, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import { SubPageLayout } from "../SubPageLayout";
import { useSimulationClockStore } from "../../../state/simulationClockStore";
import type { Stage } from "../../StageSwitcher";

interface ProjectOverviewPageProps {
  onSelectStage: (stage: Stage) => void;
}

export const ProjectOverviewPage: React.FC<ProjectOverviewPageProps> = ({ onSelectStage }) => {
  const { activeProject } = useSimulationClockStore();

  return (
    <SubPageLayout
      title="Project Command"
      category="Active Vehicle Program • Engineering Deep Dive"
      icon={<Car size={20} className="text-cyan-400" />}
      onSelectStage={onSelectStage}
    >
      <div className="w-full flex-1 flex flex-col gap-5">
        {/* Banner */}
        <div className="w-full p-4 rounded-2xl bg-gradient-to-r from-cyan-500/20 via-blue-500/10 to-slate-900 border border-cyan-500/30 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
              <Sparkles size={20} />
            </div>
            <div>
              <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold">
                {activeProject.category}
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white">{activeProject.name}</h1>
              <p className="text-xs text-slate-300 max-w-2xl mt-0.5">
                {activeProject.description}
              </p>
            </div>
          </div>
          <button
            onClick={() => onSelectStage("create_vehicle_hub")}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-lg active:scale-95 font-mono"
          >
            <span>OPEN 8-DIVISION CREATION HUB</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* 4 Core Attributes Detailed Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 shadow-lg">
            <div className="flex items-center gap-2 text-slate-400 text-xs uppercase font-semibold">
              <Gauge size={16} className="text-amber-400" />
              <span>Target Power</span>
            </div>
            <div className="text-2xl font-black text-white mt-2 font-mono">
              {activeProject.targetPowerHp} HP
            </div>
            <div className="text-[10px] font-bold text-amber-300 mt-1 uppercase font-mono">
              Status: 720° Dyno Calibrating
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 shadow-lg">
            <div className="flex items-center gap-2 text-slate-400 text-xs uppercase font-semibold">
              <Scale size={16} className="text-cyan-400" />
              <span>Weight Reduction</span>
            </div>
            <div className="text-2xl font-black text-white mt-2 font-mono">
              {activeProject.weightReductionKg} kg
            </div>
            <div className="text-[10px] font-bold text-cyan-300 mt-1 uppercase font-mono">
              Status: Carbon Monocoque Tub
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 shadow-lg">
            <div className="flex items-center gap-2 text-slate-400 text-xs uppercase font-semibold">
              <Wind size={16} className="text-teal-400" />
              <span>Drag Coefficient</span>
            </div>
            <div className="text-2xl font-black text-white mt-2 font-mono">
              {activeProject.dragCoefficient.toFixed(2)} Cd
            </div>
            <div className="text-[10px] font-bold text-teal-300 mt-1 uppercase font-mono">
              Status: CFD Streamline Optimization
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 shadow-lg">
            <div className="flex items-center gap-2 text-slate-400 text-xs uppercase font-semibold">
              <DollarSign size={16} className="text-emerald-400" />
              <span>Target Unit Cost</span>
            </div>
            <div className="text-2xl font-black text-white mt-2 font-mono">
              €{activeProject.targetUnitCostEur.toLocaleString()}
            </div>
            <div className="text-[10px] font-bold text-emerald-300 mt-1 uppercase font-mono">
              Status: Financial Review Approved
            </div>
          </div>
        </div>

        {/* Development Milestones */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 shadow-xl">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 font-mono">
            DEVELOPMENT LIFECYCLE MILESTONES
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-white/5">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-white">1. Design</span>
                <span className="text-xs font-mono text-cyan-400">{activeProject.progress.design}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-400" style={{ width: `${activeProject.progress.design}%` }} />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-white/5">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-white">2. Engineering</span>
                <span className="text-xs font-mono text-cyan-400">{activeProject.progress.engineering}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-400" style={{ width: `${activeProject.progress.engineering}%` }} />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-white/5">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-white">3. Testing</span>
                <span className="text-xs font-mono text-cyan-400">{activeProject.progress.testing}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-400" style={{ width: `${activeProject.progress.testing}%` }} />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-white/5">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-white">4. Production</span>
                <span className="text-xs font-mono text-cyan-400">{activeProject.progress.production}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-400" style={{ width: `${activeProject.progress.production}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </SubPageLayout>
  );
};
