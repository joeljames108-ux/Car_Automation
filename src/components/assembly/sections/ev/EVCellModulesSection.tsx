// ===================================================================
// APEX ENGINE BUILDER — EV STAGE 2: CELL MODULES SECTION (PHASE 9)
// 800V High-Density Cell Arrays, Series/Parallel Strings & Cathode Tech
// ===================================================================

import React from "react";
import { Battery, Layers, Activity, Zap, ShieldCheck } from "lucide-react";
import { SectionCard } from "../../SectionCard";
import { MaterialGradePicker } from "../../MaterialGradePicker";
import { StatDeltasPanel } from "../../StatDeltasPanel";
import { InstallButton } from "../../InstallButton";
import { Select, Slider } from "../../../ui/Controls";
import { EngineConfig, SimResult } from "../../../../sim/types";
import {
  AssemblyComponentMeta,
  AssemblyPhase,
  MaterialGrade,
} from "../../../../sim/assemblyTypes";

interface EVCellModulesSectionProps {
  engineConfig: EngineConfig;
  sim: SimResult;
  componentMeta?: AssemblyComponentMeta;
  selectedVariant: MaterialGrade;
  isInstalled: boolean;
  isInstalling: boolean;
  canInstall: boolean;
  phase: AssemblyPhase;
  currentTotalStats: {
    hp: number;
    torque: number;
    weight: number;
    reliability: number;
    cost: number;
  };
  updateEngine: (updates: Partial<EngineConfig>) => void;
  onSelectVariant: (variant: MaterialGrade) => void;
  onInstall: () => void;
  onSkipAnimation?: () => void;
  onNext?: () => void;
  className?: string;
}

export function EVCellModulesSection({
  engineConfig,
  sim,
  componentMeta,
  selectedVariant,
  isInstalled,
  isInstalling,
  canInstall,
  phase,
  currentTotalStats,
  updateEngine,
  onSelectVariant,
  onInstall,
  onSkipAnimation,
  onNext,
  className = "",
}: EVCellModulesSectionProps) {
  const capacity = engineConfig.batteryCapacity || 90;
  const estimatedCells = Math.round(capacity * 48);

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
        
        {/* CARD 1: CELL ARRAY CONFIG */}
        <SectionCard
          title="800V Cell String Architecture"
          subtitle="Cathode chemistry, string array voltage & energy density"
          icon={<Battery size={16} />}
          accent="purple"
        >
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-base-950/80 border border-purple-500/20 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Pack Nominal Voltage</span>
                <span className="text-purple-300 font-extrabold">800V Ultra-Fast DC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Cell Count</span>
                <span className="text-emerald-300 font-extrabold">~{estimatedCells} Cylindrical Cells</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Gravimetric Density</span>
                <span className="text-cyan-300 font-extrabold">320 Wh/kg</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/20 space-y-1">
              <span className="text-[10px] font-mono font-bold text-purple-300 uppercase tracking-wider block">
                THERMAL CELL ISOLATION
              </span>
              <p className="text-[11px] font-mono text-slate-300 leading-relaxed">
                Aerogel inter-cell insulation barriers block cascading thermal runaway and sustain peak C-rates under launch control.
              </p>
            </div>
          </div>
        </SectionCard>

        {/* CARD 2: MATERIAL GRADE */}
        <SectionCard
          title="Cell Chemistry Grade"
          subtitle="NMC 811 vs Lithium-Iron-Phosphate (LFP) & Solid-State"
          icon={<Layers size={16} />}
          accent="purple"
        >
          {componentMeta ? (
            <MaterialGradePicker
              variants={componentMeta.variants}
              selectedVariant={selectedVariant}
              onSelectVariant={onSelectVariant}
            />
          ) : (
            <p className="text-xs font-mono text-slate-500">Loading material variants...</p>
          )}
        </SectionCard>

        {/* CARD 3: ENGINEERING STAT DELTAS */}
        <SectionCard
          title="Discharge Power & Energy"
          subtitle="Peak continuous kW discharge, cell mass & reliability"
          icon={<Activity size={16} />}
          accent="emerald"
        >
          <StatDeltasPanel
            componentMeta={componentMeta}
            selectedVariant={selectedVariant}
            currentTotalStats={currentTotalStats}
            adviceText={componentMeta?.tooltipAdvice}
          />
        </SectionCard>

      </div>

      {/* INSTALL ACTION TRIGGER */}
      <InstallButton
        componentId="crankshaft"
        componentName="High-Voltage Battery Modules"
        isInstalled={isInstalled}
        isInstalling={isInstalling}
        canInstall={canInstall}
        phase={phase}
        onInstall={onInstall}
        onSkipAnimation={onSkipAnimation}
        onNext={onNext}
      />
    </div>
  );
}
