// ===================================================================
// APEX ENGINE BUILDER — STAGE 13: RADIATOR & COOLING SECTION
// Multi-Core Aluminum Heat Exchanger, Brushless Fans & Expansion Tank
// ===================================================================

import React from "react";
import { Thermometer, Layers, Activity, Wind, ShieldCheck } from "lucide-react";
import { SectionCard } from "../SectionCard";
import { MaterialGradePicker } from "../MaterialGradePicker";
import { StatDeltasPanel } from "../StatDeltasPanel";
import { InstallButton } from "../InstallButton";
import { Slider, Select, Toggle } from "../../ui/Controls";
import { EngineConfig, SimResult } from "../../../sim/types";
import {
  AssemblyComponentMeta,
  AssemblyPhase,
  MaterialGrade,
} from "../../../sim/assemblyTypes";

interface RadiatorSectionProps {
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

export function RadiatorSection({
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
}: RadiatorSectionProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
        
        {/* CARD 1: RADIATOR & COOLING DYNAMICS */}
        <SectionCard
          title="Radiator Core & Airflow Dynamics"
          subtitle="Multi-row crossflow core, brushless fan CFM & coolant chemistry"
          icon={<Thermometer size={16} />}
          accent="cyan"
        >
          <div className="space-y-3">
            <Select
              label="Coolant Fluid Chemistry"
              value="waterless_racing"
              options={[
                { value: "standard_glycol", label: "50/50 Water-Glycol Blend (108°C Boiling Pt)" },
                { value: "waterless_racing", label: "Evans Waterless Racing Coolant (180°C Boiling Pt)" },
                { value: "dielectric_chilled", label: "Ultra-Chilled Dielectric Nanofluid (-40°C ~ 220°C)" },
              ]}
              onChange={() => {}}
            />

            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-xl bg-base-950/80 border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Core Thickness</span>
                <span className="text-xs font-mono font-bold text-amber-300 block">56mm Triple-Pass</span>
              </div>
              <div className="p-2.5 rounded-xl bg-base-950/80 border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Fan Flow Rate</span>
                <span className="text-xs font-mono font-bold text-amber-300 block">3,400 CFM Dual</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/50 border border-amber-500/20 space-y-1">
              <span className="text-[10px] font-mono font-bold text-amber-300 uppercase tracking-wider block">
                HEAT SOAK SUPPRESSION
              </span>
              <p className="text-[11px] font-mono text-slate-300 leading-relaxed">
                Maintains cylinder head coolant jacket at an optimal 88°C under continuous 11,000 RPM dyno pulls, preventing hot-spot detonation.
              </p>
            </div>
          </div>
        </SectionCard>

        {/* CARD 2: MATERIAL GRADE PICKER */}
        <SectionCard
          title="Radiator Metallurgy & End-Tanks"
          subtitle="OEM Brazed Aluminum vs CNC Billet Titanium Heat Exchanger"
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
          title="Thermal Dissipation & Reliability"
          subtitle="Operating temperature stability, heat capacity & torque specs"
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
        componentId="radiator"
        componentName="Cooling Radiator & Fan Assembly"
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
