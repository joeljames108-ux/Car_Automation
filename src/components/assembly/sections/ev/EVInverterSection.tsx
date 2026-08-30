// ===================================================================
// APEX ENGINE BUILDER — EV STAGE 7: SIC INVERTER SECTION (PHASE 10)
// Silicon Carbide (SiC) MOSFETs, 800V DC/AC Conversion & 25kHz Switching
// ===================================================================

import React from "react";
import { Cpu, Layers, Activity, ShieldCheck, Zap } from "lucide-react";
import { SectionCard } from "../../SectionCard";
import { MaterialGradePicker } from "../../MaterialGradePicker";
import { StatDeltasPanel } from "../../StatDeltasPanel";
import { InstallButton } from "../../InstallButton";
import { Select } from "../../../ui/Controls";
import { POWER_ELECTRONICS_TYPES } from "../../../../sim/constants";
import { EngineConfig, SimResult } from "../../../../sim/types";
import {
  AssemblyComponentMeta,
  AssemblyPhase,
  MaterialGrade,
} from "../../../../sim/assemblyTypes";

interface EVInverterSectionProps {
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

export function EVInverterSection({
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
}: EVInverterSectionProps) {
  const peOptions = (Object.keys(POWER_ELECTRONICS_TYPES) as (keyof typeof POWER_ELECTRONICS_TYPES)[]).map((k) => ({
    value: k,
    label: POWER_ELECTRONICS_TYPES[k].label,
  }));

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
        
        {/* CARD 1: INVERTER POWER ELECTRONICS */}
        <SectionCard
          title="800V SiC Inverter Stage"
          subtitle="Silicon Carbide power stages, switching frequency & vectoring MCU"
          icon={<Cpu size={16} />}
          accent="purple"
        >
          <div className="space-y-3">
            <Select
              label="Power Electronics Semiconductor"
              value={engineConfig.powerElectronicsType || "silicon_carbide_sic"}
              options={peOptions}
              onChange={(v) =>
                updateEngine({ powerElectronicsType: v as EngineConfig["powerElectronicsType"] })
              }
            />

            <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 space-y-1">
              <span className="text-[10px] font-mono font-bold text-amber-300 uppercase tracking-wider block">
                99% INVERTER EFFICIENCY
              </span>
              <p className="text-[11px] font-mono text-amber-100/80 leading-relaxed">
                Silicon Carbide MOSFETs minimize switching losses at up to 25,000 motor RPM, delivering crisp torque response and lower heat rejection.
              </p>
            </div>
          </div>
        </SectionCard>

        {/* CARD 2: MATERIAL GRADE */}
        <SectionCard
          title="Inverter Module Grade"
          subtitle="400V IGBT vs 800V Dual SiC MOSFET & Direct-Chilled Formula ECU"
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
            <p className="text-xs font-mono text-amber-300/50">Loading material variants...</p>
          )}
        </SectionCard>

        {/* CARD 3: ENGINEERING STAT DELTAS */}
        <SectionCard
          title="3-Phase AC Output & Power"
          subtitle="Peak inverter kVA rating, motor drive current & horsepower"
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
        componentId="cylinder_head"
        componentName="800V SiC Inverter Module"
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
