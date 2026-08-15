// ===================================================================
// APEX ENGINE BUILDER — STAGE 12: OIL PAN SECTION (PHASE 8)
// Dry-Sump Scavenging, Oil Coolers & High-G Lubrication Protection
// ===================================================================

import React from "react";
import { Thermometer, Layers, Activity, Sliders, ShieldCheck } from "lucide-react";
import { SectionCard } from "../SectionCard";
import { MaterialGradePicker } from "../MaterialGradePicker";
import { StatDeltasPanel } from "../StatDeltasPanel";
import { InstallButton } from "../InstallButton";
import { Slider } from "../../ui/Controls";
import { EngineConfig, SimResult } from "../../../sim/types";
import {
  AssemblyComponentMeta,
  AssemblyPhase,
  MaterialGrade,
} from "../../../sim/assemblyTypes";

interface OilPanSectionProps {
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

export function OilPanSection({
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
}: OilPanSectionProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
        
        {/* CARD 1: LUBRICATION & COOLING CHANNELS */}
        <SectionCard
          title="Oil Sump & Thermal Coolers"
          subtitle="Baffled reservoir, multi-stage scavenge pumps & auxiliary cooling"
          icon={<Thermometer size={16} />}
          accent="cyan"
        >
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Slider
                label="Radiator Core"
                value={engineConfig.coolingRadiator || 0.8}
                min={0}
                max={1}
                step={0.05}
                format={(v) => `${(v * 100).toFixed(0)}%`}
                onChange={(v) => updateEngine({ coolingRadiator: v })}
              />
              <Slider
                label="Oil Cooler"
                value={engineConfig.coolingOilCooler || 0.75}
                min={0}
                max={1}
                step={0.05}
                format={(v) => `${(v * 100).toFixed(0)}%`}
                onChange={(v) => updateEngine({ coolingOilCooler: v })}
              />
              <Slider
                label="Water Pump Speed"
                value={engineConfig.coolingWaterPump || 0.8}
                min={0}
                max={1}
                step={0.05}
                format={(v) => `${(v * 100).toFixed(0)}%`}
                onChange={(v) => updateEngine({ coolingWaterPump: v })}
              />
              <Slider
                label="Cooling Fan Power"
                value={engineConfig.coolingFanSpeed || 0.7}
                min={0}
                max={1}
                step={0.05}
                format={(v) => `${(v * 100).toFixed(0)}%`}
                onChange={(v) => updateEngine({ coolingFanSpeed: v })}
              />
            </div>

            <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/20 space-y-1 mt-2">
              <span className="text-[10px] font-mono font-bold text-cyan-300 uppercase tracking-wider block">
                HIGH-G LATERAL SCAVENGING
              </span>
              <p className="text-[11px] font-mono text-slate-300 leading-relaxed">
                Trapdoor baffles and a low-profile windage tray eliminate oil aeration and prevent oil starvation under 1.8G track cornering.
              </p>
            </div>
          </div>
        </SectionCard>

        {/* CARD 2: MATERIAL GRADE */}
        <SectionCard
          title="Sump Metallurgy & Baffling"
          subtitle="Stamped Steel vs CNC Billet Aluminum Dry-Sump Pan"
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
          title="Thermal Dissipation & Weight"
          subtitle="Oil cooling capacity, reliability protection & total mass"
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
        componentId="oil_pan"
        componentName="Oil Pan & Lubrication Sump"
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
