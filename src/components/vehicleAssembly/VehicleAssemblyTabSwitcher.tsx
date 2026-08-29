import React, { useState } from "react";
import { Car, Activity } from "lucide-react";
import { VehicleComponentLibrary } from "./VehicleComponentLibrary";
import { VehicleAssemblyProgressPanel } from "./VehicleAssemblyProgressPanel";
import {
  VehicleComponentId,
  VehicleAssemblyComponentMeta,
} from "../../sim/vehicleAssemblyTypes";
import { AssemblyPhase, MaterialGrade } from "../../sim/assemblyTypes";
import { VehicleConfig } from "../../sim/types";

interface VehicleAssemblyTabSwitcherProps {
  installedComponents: VehicleComponentId[];
  activeComponentId: VehicleComponentId | null;
  phase: AssemblyPhase;
  hoveredComponentId: VehicleComponentId | null;
  progressPercentage: number;
  currentStats: {
    hp: number;
    torque: number;
    weight: number;
    reliability: number;
    cost: number;
  };
  nextRecommendedComponent: VehicleAssemblyComponentMeta | null;
  isAutoAssembling: boolean;
  canInstall: (id: VehicleComponentId) => boolean;
  onStartInstall: (id: VehicleComponentId) => void;
  onHoverComponent: (id: VehicleComponentId | null) => void;
  onResetAssembly: () => void;
  onToggleAutoAssemble: () => void;
  selectedVariants?: Record<string, MaterialGrade>;
  onSelectVariant?: (id: VehicleComponentId, variant: MaterialGrade) => void;
  vehicleConfig?: Partial<VehicleConfig>;
  className?: string;
}

export const VehicleAssemblyTabSwitcher: React.FC<VehicleAssemblyTabSwitcherProps> = ({
  installedComponents,
  activeComponentId,
  phase,
  hoveredComponentId,
  progressPercentage,
  currentStats,
  nextRecommendedComponent,
  isAutoAssembling,
  canInstall,
  onStartInstall,
  onHoverComponent,
  onResetAssembly,
  onToggleAutoAssemble,
  selectedVariants,
  onSelectVariant,
  vehicleConfig,
  className = "",
}) => {
  const [activeConsoleTab, setActiveConsoleTab] = useState<"catalog" | "dashboard">("catalog");

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Console Tab Selector Buttons */}
      <div className="flex items-center gap-2 mb-3 bg-white/90 dark:bg-base-900/90 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 backdrop-blur-xl shadow-lg shrink-0">
        <button
          onClick={() => setActiveConsoleTab("catalog")}
          className={`flex-1 py-2 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all ${
            activeConsoleTab === "catalog"
              ? "bg-amber-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.4)]"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <Car size={13} />
          <span>SUBSYSTEM CATALOG</span>
        </button>

        <button
          onClick={() => setActiveConsoleTab("dashboard")}
          className={`flex-1 py-2 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all ${
            activeConsoleTab === "dashboard"
              ? "bg-amber-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.4)]"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <Activity size={13} />
          <span>BUILD DASHBOARD</span>
        </button>
      </div>

      {/* Active Tab View */}
      <div className="flex-1 min-h-0">
        {activeConsoleTab === "catalog" ? (
          <VehicleComponentLibrary
            installedComponents={installedComponents}
            activeComponentId={activeComponentId}
            phase={phase}
            hoveredComponentId={hoveredComponentId}
            canInstall={canInstall}
            onStartInstall={onStartInstall}
            onHoverComponent={onHoverComponent}
            selectedVariants={selectedVariants}
            onSelectVariant={onSelectVariant}
            vehicleConfig={vehicleConfig}
          />
        ) : (
          <VehicleAssemblyProgressPanel
            installedComponents={installedComponents}
            activeComponentId={activeComponentId}
            progressPercentage={progressPercentage}
            currentStats={currentStats}
            nextRecommendedComponent={nextRecommendedComponent}
            isAutoAssembling={isAutoAssembling}
            onStartInstall={onStartInstall}
            onResetAssembly={onResetAssembly}
            onToggleAutoAssemble={onToggleAutoAssemble}
            vehicleConfig={vehicleConfig}
          />
        )}
      </div>
    </div>
  );
};
