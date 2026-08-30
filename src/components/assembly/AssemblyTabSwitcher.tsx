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
  selectedVariants?: Record<string, any>;
  onSelectVariant?: (id: any, variant: any) => void;
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
  selectedVariants,
  onSelectVariant,
  engineConfig,
  className = "",
}: AssemblyTabSwitcherProps) {
  const [activeTab, setActiveTab] = useState<"parts" | "dashboard" | "both">("both");

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Tab Selector Pill Header */}
      <div className="flex items-center justify-between p-1.5 rounded-xl bg-base-900/80 border border-base-750 mb-3 shrink-0">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab("both")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
              activeTab === "both"
                ? "bg-amber-500 text-black shadow-[0_0_12px_rgba(34,211,238,0.4)]"
                : "text-amber-200/60 hover:text-amber-50"
            }`}
          >
            <Layers size={13} /> Split View
          </button>
          <button
            onClick={() => setActiveTab("parts")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
              activeTab === "parts"
                ? "bg-amber-500 text-black shadow-[0_0_12px_rgba(34,211,238,0.4)]"
                : "text-amber-200/60 hover:text-amber-50"
            }`}
          >
            <Wrench size={13} /> Parts Library
          </button>
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
              activeTab === "dashboard"
                ? "bg-amber-500 text-black shadow-[0_0_12px_rgba(34,211,238,0.4)]"
                : "text-amber-200/60 hover:text-amber-50"
            }`}
          >
            <Activity size={13} /> Dyno Specs
          </button>
        </div>

        <button
          onClick={onToggleExplodedView}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all border ${
            isExplodedView
              ? "bg-amber-500/15 text-amber-300 border-amber-500/40"
              : "text-amber-300/50 hover:text-amber-100/80 border-transparent"
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
              selectedVariants={selectedVariants}
              onSelectVariant={onSelectVariant}
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
