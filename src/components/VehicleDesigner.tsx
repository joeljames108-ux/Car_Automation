import React, { useState, useEffect } from "react";
import {
  Car,
  Shield,
  Wrench,
  GitCompare,
} from "lucide-react";
import { useDesign } from "../state/DesignContext";
import { VEHICLE_PRESET_LIBRARY } from "../sim/vehiclePresets";
import { playHMIClickSound, playHMITabSound } from "../utils/hmiSoundSynth";
import { useVehicleAssemblyStore } from "../state/useVehicleAssemblyStore";
import { VehicleCompletionModal } from "./vehicleAssembly/VehicleCompletionModal";
import { VehicleComparisonStudio } from "./vehicleAssembly/VehicleComparisonStudio";
import { ModularLinearAssemblyStudio } from "./vehicleAssembly/ModularLinearAssemblyStudio";
import { VehicleArchitectureStudio } from "./vehicleAssembly/VehicleArchitectureStudio";

export type VehicleStudioSubTab =
  | "architecture"
  | "linear_assembly"
  | "benchmark";

interface VehicleDesignerProps {
  initialSubTab?: VehicleStudioSubTab;
  onSelectStage?: (stage: string) => void;
}

export function VehicleDesigner({ initialSubTab = "architecture", onSelectStage }: VehicleDesignerProps) {
  const { design, sim, setDesign, updateVehicle } = useDesign();
  const v = design.vehicle;

  const [activeTab, setActiveTab] = useState<VehicleStudioSubTab>(initialSubTab);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  const vehAssembly = useVehicleAssemblyStore(v);

  useEffect(() => {
    if (initialSubTab) {
      setActiveTab(initialSubTab);
    }
  }, [initialSubTab]);

  const handleTabChange = (tab: VehicleStudioSubTab) => {
    playHMITabSound();
    setActiveTab(tab);
  };

  const handleSelectPreset = (presetId: string) => {
    const item = VEHICLE_PRESET_LIBRARY.find((p) => p.id === presetId);
    if (item) {
      playHMIClickSound();
      setDesign(item.generator());
    }
  };

  const tabsConfig = [
    {
      id: "architecture" as const,
      label: "VEHICLE ARCHITECTURE",
      icon: <Shield size={14} />,
      badge: "SEDAN • HATCH • CROSS • SUV",
    },
    {
      id: "linear_assembly" as const,
      label: "UNIFIED LINEAR ASSEMBLY",
      icon: <Wrench size={14} />,
      badge: "12 STAGES • KINEMATICS",
    },
    {
      id: "benchmark" as const,
      label: "A/B BENCHMARK LAB",
      icon: <GitCompare size={14} />,
      badge: "A/B BATTLE",
    },
  ];

  return (
    <div className="space-y-4">
      {/* =========================================================================
          TOP UNIFIED VEHICLE STUDIO NAVIGATION RIBBON
          ========================================================================= */}
      <div className="panel p-4 rounded-3xl flex flex-col gap-3.5 shadow-xl transition-all">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Header Title & Subsystem Status */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/30 flex items-center justify-center">
              <Car size={22} className="text-amber-500 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm font-extrabold tracking-wider uppercase font-mono text-slate-900 dark:text-slate-100">
                  UNIFIED VEHICLE ARCHITECTURE & ENGINEERING SUITE
                </h2>
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  UNIFIED MASTER CHAIN
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-600 dark:text-slate-400 mt-0.5">
                {activeTab === "architecture" && "Modular Engineering Platform • Sedan, Hatchback, Crossover & SUV • Discrete GLB Foundation"}
                {activeTab === "linear_assembly" && "Flagship End-to-End Vehicle Engineering • 12-Stage Linear Assembly • 3D Kinematics • Packaging Diagnostics"}
                {activeTab === "benchmark" && "A/B Car Benchmark & Circuit Lap Time Battles • Multi-Car Head-to-Head Comparison"}
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-2 flex-wrap bg-base-800/40 p-1.5 rounded-2xl border border-base-700/40 font-mono text-[11px]">
            <div className="px-2.5 py-1 rounded-xl bg-base-850 border border-base-800 flex items-center">
              <span className="text-slate-500 dark:text-slate-400 mr-1.5">WEIGHT</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{Math.round(sim.weight || 1480)} kg</span>
            </div>
            <div className="px-2.5 py-1 rounded-xl bg-base-850 border border-base-800 flex items-center">
              <span className="text-slate-500 dark:text-slate-400 mr-1.5">DRAG</span>
              <span className="font-bold text-amber-600 dark:text-amber-300">Cd {sim.dragCoeff.toFixed(3)}</span>
            </div>
            <div className="px-2.5 py-1 rounded-xl bg-base-850 border border-base-800 flex items-center">
              <span className="text-slate-500 dark:text-slate-400 mr-1.5">DOWNFORCE</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-300">{sim.downforce} N</span>
            </div>
            <div className="px-2.5 py-1 rounded-xl bg-base-850 border border-base-800 flex items-center">
              <span className="text-slate-500 dark:text-slate-400 mr-1.5">0-100</span>
              <span className="font-bold text-amber-600 dark:text-amber-300">{sim.accel0_100?.toFixed(1) || "3.8"}s</span>
            </div>
          </div>
        </div>

        {/* Studio Sub-Tabs Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2 border-t border-base-800/50 select-none">
          {tabsConfig.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-amber-500/20 text-amber-700 dark:text-amber-200 border border-amber-500/50 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-base-800/40 border border-transparent"
                }`}
              >
                <span className={isActive ? "text-amber-600 dark:text-amber-300" : "text-slate-500 dark:text-slate-400"}>
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold ${
                      isActive
                        ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40"
                        : "bg-base-800/80 text-slate-500 dark:text-slate-400 border border-base-700/40"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          STAGE 0: VEHICLE ARCHITECTURE & ENGINEERING PLATFORM
          ========================================================================= */}
      {activeTab === "architecture" && (
        <div className="animate-stage-transition-enter">
          <VehicleArchitectureStudio
            onEnterDesignStudio={() => {
              if (onSelectStage) {
                onSelectStage("exterior");
              } else {
                setActiveTab("linear_assembly");
              }
            }}
          />
        </div>
      )}

      {/* =========================================================================
          FLAGSHIP: UNIFIED LINEAR ASSEMBLY & VEHICLE ENGINEERING SUITE
          ========================================================================= */}
      {activeTab === "linear_assembly" && (
        <div className="animate-stage-transition-enter">
          <ModularLinearAssemblyStudio />
        </div>
      )}

      {/* =========================================================================
          STUDIO 4: A/B VEHICLE BENCHMARK & TRACK BATTLE
          ========================================================================= */}
      {activeTab === "benchmark" && (
        <div className="space-y-4 animate-stage-transition-enter">
          <VehicleComparisonStudio />
        </div>
      )}

      {/* Assembly Completion Modal */}
      <VehicleCompletionModal
        isOpen={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
        onReset={vehAssembly.resetAssembly}
        stats={vehAssembly.currentStats}
        vehicleConfig={v}
      />
    </div>
  );
}
