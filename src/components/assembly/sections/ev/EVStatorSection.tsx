// ===================================================================
// APEX ENGINE BUILDER — EV STAGE 9: STATOR COILS SECTION (PHASE 10)
// Hairpin Copper Windings, Axial/Radial-Flux Stator & Motor Power kW
// ===================================================================

import React from "react";
import { Zap, Layers, Activity, ShieldCheck, Sliders } from "lucide-react";
import { SectionCard } from "../../SectionCard";
import { MaterialGradePicker } from "../../MaterialGradePicker";
import { StatDeltasPanel } from "../../StatDeltasPanel";
import { InstallButton } from "../../InstallButton";
import { Select, Slider } from "../../../ui/Controls";
import { EV_MOTOR_TYPES } from "../../../../sim/constants";
import { EngineConfig, SimResult } from "../../../../sim/types";
import {
  AssemblyComponentMeta,
  AssemblyPhase,
  MaterialGrade,
} from "../../../../sim/assemblyTypes";

interface EVStatorSectionProps {
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

export function EVStatorSection({
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
}: EVStatorSectionProps) {
  const motorOptions = (Object.keys(EV_MOTOR_TYPES) as (keyof typeof EV_MOTOR_TYPES)[]).map((m) => ({
    value: m,
    label: EV_MOTOR_TYPES[m].label,
  }));

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
        
        {/* CARD 1: STATOR WINDINGS & MOTOR OUTPUT */}
        <SectionCard
          title="Stator Coils & Motor Output"
          subtitle="Hairpin winding topology, slot-fill factor & kW rating"
          icon={<Zap size={16} />}
          accent="purple"
        >
          <div className="space-y-3">
            <Select
              label="Electric Motor Topology"
              value={engineConfig.evMotorType || "pmsm_axial"}
              options={motorOptions}
              onChange={(v) =>
                updateEngine({ evMotorType: v as EngineConfig["evMotorType"] })
              }
            />

            <Slider
              label="Continuous Motor Power"
              value={engineConfig.evMotorPower || 350}
              min={50}
              max={1500}
              step={10}
              unit="kW"
              format={(v: number) => `${v} kW (${Math.round(v * 1.341)} HP)`}
              onChange={(v: number) => updateEngine({ evMotorPower: v })}
            />

            <div className="p-3 rounded-xl bg-slate-900/50 border border-amber-500/20 space-y-1">
              <span className="text-[10px] font-mono font-bold text-amber-300 uppercase tracking-wider block">
                HAIRPIN COPPER SLOT-FILL
              </span>
              <p className="text-[11px] font-mono text-slate-300 leading-relaxed">
                Rectangular hairpin windings achieve over 70% slot-fill density, boosting thermal conduction directly out to the cooling jacket.
              </p>
            </div>
          </div>
        </SectionCard>

        {/* CARD 2: MATERIAL GRADE */}
        <SectionCard
          title="Stator Copper & Laminations"
          subtitle="High-Grade Silicon Steel vs Cobalt-Iron Low-Loss Laminations"
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
          title="Torque Density & Peak Output"
          subtitle="Instantaneous peak torque, motor efficiency & power delta"
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
        componentId="valves"
        componentName="Axial-Flux Electric Stator Coils"
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
