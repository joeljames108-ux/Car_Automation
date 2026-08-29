// ============================================================================
// MODULAR glTF VEHICLE CONSTRUCTION SYSTEM — 12-STAGE ASSEMBLY RIBBON
// ============================================================================
// Horizontal scrollable assembly ribbon across all 12 automotive construction stages:
// #0 Arch -> #1 Chassis -> #2 Powertrain -> #3 Trans -> #4 Susp -> #5 Wheels/Brakes
// -> #6 Safety Cell -> #7 Panels -> #8 Lights/Glass -> #9 Aero -> #10 Interior -> #11 Electronics
// ============================================================================

import React, { useRef } from 'react';
import {
  Car,
  CheckCircle2,
  Lock,
  ChevronLeft,
  ChevronRight,
  Shield,
  Flame,
  Settings,
  Activity,
  Disc,
  Layers,
  Zap,
  Wind,
  Armchair,
  Cpu,
} from 'lucide-react';
import { SUBSYSTEM_STAGES } from '../../exterior3d/manifests/modularComponentManifest';
import { VehicleSubsystemStage } from '../../exterior3d/types/vehicleConstructionTypes';

interface VehicleAssemblyRibbonProps {
  activeStage: VehicleSubsystemStage;
  installedStages: VehicleSubsystemStage[];
  completionPercentage: number;
  onSelectStage: (stage: VehicleSubsystemStage) => void;
  onInstallAll?: () => void;
}

const STAGE_ICONS: Record<VehicleSubsystemStage, React.ReactNode> = {
  architecture: <Layers size={14} />,
  chassis_platform: <Shield size={14} />,
  powertrain_engine: <Flame size={14} />,
  transmission: <Settings size={14} />,
  suspension: <Activity size={14} />,
  wheels_brakes: <Disc size={14} />,
  body_structure: <Lock size={14} />,
  exterior_panels: <Car size={14} />,
  lighting_glass: <Zap size={14} />,
  aerodynamics: <Wind size={14} />,
  interior_cabin: <Armchair size={14} />,
  electronics: <Cpu size={14} />,
};

export const VehicleAssemblyRibbon: React.FC<VehicleAssemblyRibbonProps> = ({
  activeStage,
  installedStages,
  completionPercentage,
  onSelectStage,
  onInstallAll,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const offset = direction === 'left' ? -260 : 260;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-white/80 dark:bg-base-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 backdrop-blur-xl shadow-xl space-y-3 font-mono">
      {/* Ribbon Header: Title + Completion Progress */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-xl bg-amber-500/10 text-amber-500 dark:text-amber-400">
            <Car size={16} />
          </span>
          <strong className="text-slate-800 dark:text-slate-200 font-bold uppercase tracking-wider">
            STEP 3: MODULAR ASSEMBLY LINE
          </strong>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-base-950 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-800 font-semibold">
            {installedStages.length} of {SUBSYSTEM_STAGES.length} Stages Installed
          </span>
        </div>

        <div className="flex items-center gap-3">
          {onInstallAll && installedStages.length < SUBSYSTEM_STAGES.length && (
            <button
              onClick={onInstallAll}
              className="px-2.5 py-1 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-400 text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Zap size={12} />
              <span>INSTALL ALL 12 STAGES</span>
            </button>
          )}

          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">
            Assembly Progress
          </span>
          <div className="w-28 h-2.5 bg-slate-200 dark:bg-base-950 rounded-full overflow-hidden border border-slate-300 dark:border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-amber-500 transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <strong className="text-amber-600 dark:text-amber-400 font-bold w-9 text-right">
            {completionPercentage}%
          </strong>
        </div>
      </div>

      {/* Horizontal Carousel */}
      <div className="relative flex items-center">
        <button
          onClick={() => scroll('left')}
          className="p-2 rounded-2xl bg-slate-100 dark:bg-base-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-amber-500 hover:border-amber-500/40 transition-all mr-2 shadow-sm"
        >
          <ChevronLeft size={16} />
        </button>

        <div
          ref={scrollRef}
          className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {SUBSYSTEM_STAGES.map((s) => {
            const isSelected = activeStage === s.stage;
            const isInstalled = installedStages.includes(s.stage);

            return (
              <button
                key={s.stage}
                onClick={() => onSelectStage(s.stage)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-200 border shadow-sm cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-[0_0_15px_rgba(6,182,212,0.45)] scale-105'
                    : isInstalled
                    ? 'bg-emerald-500/10 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:border-emerald-400'
                    : 'bg-slate-100 dark:bg-base-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-amber-500/40'
                }`}
              >
                {isInstalled ? (
                  <CheckCircle2 size={14} className={isSelected ? 'text-slate-950' : 'text-emerald-400'} />
                ) : (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${isSelected ? 'bg-slate-950 text-amber-300' : 'bg-slate-200 dark:bg-base-900 text-slate-500'}`}>
                    #{s.stageNumber}
                  </span>
                )}
                <span>{s.shortName}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => scroll('right')}
          className="p-2 rounded-2xl bg-slate-100 dark:bg-base-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-amber-500 hover:border-amber-500/40 transition-all ml-2 shadow-sm"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
