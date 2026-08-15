// ===================================================================
// APEX ENGINE BUILDER — EV STAGE 1: BATTERY TRAY & ENCLOSURE (PHASE 9)
// Structural Aluminum Casing, Ballistic Skid Plate & Cell-to-Pack Rigidity
// ===================================================================

import React from "react";
import { Battery, Layers, Activity, ShieldCheck, Sliders } from "lucide-react";
import { SectionCard } from "../../SectionCard";
import { MaterialGradePicker } from "../../MaterialGradePicker";
import { StatDeltasPanel } from "../../StatDeltasPanel";
import { InstallButton } from "../../InstallButton";
import { Select, Slider } from "../../../ui/Controls";
import { BATTERY_CHEMISTRIES } from "../../../../sim/constants";
import { EngineConfig, SimResult } from "../../../../sim/types";
import {
  AssemblyComponentMeta,
  AssemblyPhase,
  MaterialGrade,
} from "../../../../sim/assemblyTypes";

interface EVBatteryTraySectionProps {
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

export function EVBatteryTraySection({
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
}: EVBatteryTraySectionProps) {
  const chemOptions = (Object.keys(BATTERY_CHEMISTRIES) as string[]).map((b) => ({
    value: b,
    label: BATTERY_CHEMISTRIES[b as keyof typeof BATTERY_CHEMISTRIES].label,
  }));

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
        
        {/* CARD 1: BATTERY TRAY & STRUCTURAL INTEGRATION */}
        <SectionCard
          title="Structural Battery Enclosure"
          subtitle="Cell-to-pack chassis integration, ballistic skid plate & capacity"
          icon={<Battery size={16} />}
          accent="purple"
        >
          <div className="space-y-3">
            <Select
              label="Battery Chemistry Platform"
              value={engineConfig.batteryChemistry || "solid_state"}
              options={chemOptions}
              onChange={(v) =>
                updateEngine({ batteryChemistry: v as EngineConfig["batteryChemistry"] })
              }
            />

            <Slider
              label="Pack Total Capacity"
              value={engineConfig.batteryCapacity || 90}
              min={30}
              max={150}
              step={1}
              unit="kWh"
              onChange={(v: number) => updateEngine({ batteryCapacity: v })}
            />

            <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/20 space-y-1">
              <span className="text-[10px] font-mono font-bold text-purple-300 uppercase tracking-wider block">
                STRUCTURAL RIGIDITY CONTRIBUTION
              </span>
              <p className="text-[11px] font-mono text-slate-300 leading-relaxed">
                Extruded aluminum side sills and a bonded underbody titanium skid plate boost overall vehicle torsional stiffness by +35%.
              </p>
            </div>
          </div>
        </SectionCard>

        {/* CARD 2: MATERIAL GRADE */}
        <SectionCard
          title="Tray Metallurgy & Shielding"
          subtitle="6000-Series Aluminum vs Carbon-Composite Reinforced Tray"
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
          title="Pack Mass & Gravimetric Density"
          subtitle="Enclosure tare weight, volumetric capacity & crash safety"
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
        componentId="block"
        componentName="EV Battery Pack Tray"
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
