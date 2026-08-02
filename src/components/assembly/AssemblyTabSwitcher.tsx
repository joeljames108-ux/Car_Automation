import { useState } from "react";
import { Wrench, Activity, Layers } from "lucide-react";
import { ComponentLibrary } from "./ComponentLibrary";
import { AssemblyProgressPanel } from "./AssemblyProgressPanel";
import type { ComponentId, AssemblyComponentMeta, AssemblyPhase } from "../../sim/assemblyTypes";
import { EngineConfig } from "../../sim/types";

interface AssemblyTabSwitcherProps {
  installedComponents: ComponentId[];
  activeComponentId: ComponentId | null;
  phase: AssemblyPhase;
  hoveredComponentId: ComponentId | null;
  canInstall: (id: ComponentId) => boolean;
  onStartInstall: (id: ComponentId) => void;
  onHoverComponent: (id: ComponentId | null) => void;
  progressPercentage: number;
  currentStats: {
    hp: number;
    torque: number;
    weight: number;
    reliability: number;
    cost: number;
  };
  isExplodedView: boolean;
  nextRecommendedComponent: AssemblyComponentMeta | null;
  isAssemblyComplete: boolean;
  onResetAssembly: () => void;
  onToggleExplodedView: () => void;
  engineConfig?: Partial<EngineConfig>;
  className?: string;
}

export function AssemblyTabSwitcher({
  installedComponents,
  activeComponentId,
  phase,
  hoveredComponentId,
  canInstall,
  onStartInstall,
  onHoverComponent,
  progressPercentage,
  currentStats,
  isExplodedView,
  nextRecommendedComponent,
  isAssemblyComplete,
  onResetAssembly,
  onToggleExplodedView,
  engineConfig,
  className = "",
}: AssemblyTabSwitcherProps) {
  const [activeTab, setActiveTab] = useState<"parts" | "dashboard" | "both">("both");

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Tab Selector Pill Header */}
      <div className="flex items-center justify-between p-1.5 mb-2 rounded-xl bg-[#0b0f19]/90 border border-slate-800/80 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab("parts")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
              activeTab === "parts"
                ? "bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 shadow-[0_0_12px_rgba(34,211,238,0.25)]"
                : "text-slate-400 hover:text-slate-200 hover:bg-base-800/60 border border-transparent"
            }`}
          >
            <Wrench size={13} /> Parts
          </button>
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
              activeTab === "dashboard"
                ? "bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 shadow-[0_0_12px_rgba(34,211,238,0.25)]"
                : "text-slate-400 hover:text-slate-200 hover:bg-base-800/60 border border-transparent"
            }`}
          >
            <Activity size={13} /> Telemetry
          </button>
        </div>

        <button
          onClick={() => setActiveTab("both")}
          className={`hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold transition-all cursor-pointer ${
            activeTab === "both"
              ? "bg-base-800 text-slate-100 border border-base-700"
              : "text-slate-500 hover:text-slate-300"
          }`}
          title="Show side-by-side stacked view"
        >
          <Layers size={12} /> Split
        </button>
      </div>

      {/* Tab Panels */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-0.5 scrollbar-thin scrollbar-thumb-base-750">
        {(activeTab === "parts" || activeTab === "both") && (
          <div className={activeTab === "both" ? "min-h-[320px]" : "h-full"}>
            <ComponentLibrary
              installedComponents={installedComponents}
              activeComponentId={activeComponentId}
              phase={phase}
              hoveredComponentId={hoveredComponentId}
              canInstall={canInstall}
              onStartInstall={onStartInstall}
              onHoverComponent={onHoverComponent}
              engineConfig={engineConfig}
            />
          </div>
        )}

        {(activeTab === "dashboard" || activeTab === "both") && (
          <div className={activeTab === "both" ? "min-h-[280px]" : "h-full"}>
            <AssemblyProgressPanel
              installedComponents={installedComponents}
              activeComponentId={activeComponentId}
              progressPercentage={progressPercentage}
              currentStats={currentStats}
              isExplodedView={isExplodedView}
              nextRecommendedComponent={nextRecommendedComponent}
              isAssemblyComplete={isAssemblyComplete}
              onStartInstall={onStartInstall}
              onResetAssembly={onResetAssembly}
              onToggleExplodedView={onToggleExplodedView}
              engineConfig={engineConfig}
            />
          </div>
        )}
      </div>
    </div>
  );
}
