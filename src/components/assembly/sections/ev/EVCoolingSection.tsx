// ===================================================================
// APEX ENGINE BUILDER — EV STAGE 5 & 6: THERMAL COOLING SECTION (PHASE 10)
// Glycol Micro-Channel Cooling Plate & Dual-Loop Electric Chiller Radiator
// ===================================================================

import React from "react";
import { Thermometer, Layers, Activity, ShieldCheck, Sliders } from "lucide-react";
import { SectionCard } from "../../SectionCard";
import { MaterialGradePicker } from "../../MaterialGradePicker";
import { StatDeltasPanel } from "../../StatDeltasPanel";
import { InstallButton } from "../../InstallButton";
import { EngineConfig, SimResult } from "../../../../sim/types";
import {
  AssemblyComponentMeta,
  AssemblyPhase,
  MaterialGrade,
} from "../../../../sim/assemblyTypes";

interface EVCoolingSectionProps {
  engineConfig: EngineConfig;
  sim: SimResult;
  currentStage: string;
  reservoirComponentMeta?: AssemblyComponentMeta;
  coolingPlateComponentMeta?: AssemblyComponentMeta;
  selectedReservoirVariant: MaterialGrade;
  selectedPlateVariant: MaterialGrade;
  isReservoirInstalled: boolean;
  isPlateInstalled: boolean;
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
  onSelectReservoirVariant: (variant: MaterialGrade) => void;
  onSelectPlateVariant: (variant: MaterialGrade) => void;
  onInstall: () => void;
  onSkipAnimation?: () => void;
  onNext?: () => void;
  className?: string;
}

export function EVCoolingSection({
  engineConfig,
  sim,
  currentStage,
  reservoirComponentMeta,
  coolingPlateComponentMeta,
  selectedReservoirVariant,
  selectedPlateVariant,
  isReservoirInstalled,
  isPlateInstalled,
  isInstalling,
  canInstall,
  phase,
  currentTotalStats,
  updateEngine,
  onSelectReservoirVariant,
  onSelectPlateVariant,
  onInstall,
  onSkipAnimation,
  onNext,
  className = "",
}: EVCoolingSectionProps) {
  const isPlateStage = currentStage === "head_gasket" || isReservoirInstalled;
  const activeMeta = isPlateStage ? coolingPlateComponentMeta : reservoirComponentMeta;
  const activeVariant = isPlateStage ? selectedPlateVariant : selectedReservoirVariant;
  const onSelectActiveVariant = isPlateStage ? onSelectPlateVariant : onSelectReservoirVariant;
  const currentCompId = isPlateStage ? "head_gasket" : "oil_pan";
  const currentCompName = isPlateStage
    ? "Glycol Thermal Cooling Plate"
    : "Liquid Cooling Radiator & Pump Reservoir";

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
        
        {/* CARD 1: THERMAL SYSTEM CONFIG */}
        <SectionCard
          title="Dual-Loop Thermal Architecture"
          subtitle="Micro-channel serpentine plates, active chillers & coolant flow"
          icon={<Thermometer size={16} />}
          accent="purple"
        >
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-base-950/80 border border-amber-500/20 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Target Cell Window</span>
                <span className="text-amber-300 font-extrabold">25°C – 35°C Optimal</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Coolant Fluid</span>
                <span className="text-amber-300 font-extrabold">Water-Glycol Dielectric</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Chiller Capacity</span>
                <span className="text-emerald-300 font-extrabold">18 kW Heat Dissipation</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/50 border border-amber-500/20 space-y-1">
              <span className="text-[10px] font-mono font-bold text-amber-300 uppercase tracking-wider block">
                UNIFORM CELL TEMPERATURE
              </span>
              <p className="text-[11px] font-mono text-slate-300 leading-relaxed">
                Direct bottom-plate cooling guarantees cell-to-cell delta remains under 2°C even during sustained 350kW ultra-fast DC charging.
              </p>
            </div>
          </div>
        </SectionCard>

        {/* CARD 2: MATERIAL GRADE */}
        <SectionCard
          title="Plate Metallurgy & Flow"
          subtitle="Extruded Aluminum Alloy vs Micro-Channel Billet Copper"
          icon={<Layers size={16} />}
          accent="purple"
        >
          {activeMeta ? (
            <MaterialGradePicker
              variants={activeMeta.variants}
              selectedVariant={activeVariant}
              onSelectVariant={onSelectActiveVariant}
              title={`${activeMeta.name} Variant`}
            />
          ) : (
            <p className="text-xs font-mono text-slate-500">Loading material variants...</p>
          )}
        </SectionCard>

        {/* CARD 3: ENGINEERING STAT DELTAS */}
        <SectionCard
          title="Thermal Protection & Reliability"
          subtitle="Heat dissipation capacity, reliability score & system mass"
          icon={<Activity size={16} />}
          accent="emerald"
        >
          <StatDeltasPanel
            componentMeta={activeMeta}
            selectedVariant={activeVariant}
            currentTotalStats={currentTotalStats}
            adviceText={activeMeta?.tooltipAdvice}
          />
        </SectionCard>

      </div>

      {/* INSTALL ACTION TRIGGER */}
      <InstallButton
        componentId={currentCompId}
        componentName={currentCompName}
        isInstalled={isPlateStage ? isPlateInstalled : isReservoirInstalled}
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
