// ===================================================================
// APEX ENGINE BUILDER — EV STAGE 12: REGENERATIVE BOOST (PHASE 11)
// Bi-Directional Kinetic Energy Recovery, Brake-by-Wire & 350kW Charge
// ===================================================================

import React from "react";
import { Zap, Layers, Activity, ShieldCheck, Sliders } from "lucide-react";
import { SectionCard } from "../../SectionCard";
import { MaterialGradePicker } from "../../MaterialGradePicker";
import { StatDeltasPanel } from "../../StatDeltasPanel";
import { InstallButton } from "../../InstallButton";
import { Select, Slider } from "../../../ui/Controls";
import { REGEN_BRAKING_TYPES } from "../../../../sim/constants";
import { EngineConfig, SimResult } from "../../../../sim/types";
import {
  AssemblyComponentMeta,
  AssemblyPhase,
  MaterialGrade,
} from "../../../../sim/assemblyTypes";

interface EVRegenSectionProps {
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

export function EVRegenSection({
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
}: EVRegenSectionProps) {
  const regenOptions = (Object.keys(REGEN_BRAKING_TYPES) as (keyof typeof REGEN_BRAKING_TYPES)[]).map((k) => ({
    value: k,
    label: REGEN_BRAKING_TYPES[k].label,
  }));

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
        
        {/* CARD 1: REGEN BRAKING ARCHITECTURE */}
        <SectionCard
          title="Regenerative Braking Dynamics"
          subtitle="Kinetic energy recovery, deceleration force & blended braking"
          icon={<Zap size={16} />}
          accent="purple"
        >
          <div className="space-y-3">
            <Select
              label="Regen Braking Architecture"
              value={engineConfig.regenBrakingTech || "brake_by_wire"}
              options={regenOptions}
              onChange={(v) =>
                updateEngine({ regenBrakingTech: v as EngineConfig["regenBrakingTech"] })
              }
            />

            <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 space-y-1 mt-2">
              <span className="text-[10px] font-mono font-bold text-amber-300 uppercase tracking-wider block">
                MAX RECUPERATION POWER
              </span>
              <p className="text-[11px] font-mono text-slate-300 leading-relaxed">
                Recovers up to 350kW of kinetic energy during high-speed track deceleration, recharging the solid-state pack for corner-exit launch boost.
              </p>
            </div>
          </div>
        </SectionCard>

        {/* CARD 2: MATERIAL GRADE */}
        <SectionCard
          title="Regen Power Electronics Grade"
          subtitle="Silicon IGBT vs Silicon Carbide (SiC) Vectoring Matrix"
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
          title="Energy Harvesting & Power Delta"
          subtitle="Recuperation efficiency, torque vectoring stability & total power"
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
        componentId="turbocharger"
        componentName="Regenerative Energy Boost System"
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
