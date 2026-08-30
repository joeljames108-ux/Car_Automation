// ===================================================================
// APEX ENGINE BUILDER — STAGE 5: HEAD GASKET SECTION (PHASE 6)
// Multi-Layer Steel (MLS), Fire Rings & Combustion Chamber Sealing
// ===================================================================

import React from "react";
import { ShieldCheck, Layers, Activity, Sliders } from "lucide-react";
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

interface HeadGasketSectionProps {
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

export function HeadGasketSection({
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
}: HeadGasketSectionProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
        
        {/* CARD 1: GASKET SPEC & SEALING */}
        <SectionCard
          title="Head Gasket & Fire Rings"
          subtitle="Multi-layer steel compression sealing, coolant & oil passages"
          icon={<ShieldCheck size={16} />}
          accent="cyan"
        >
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-base-950/80 border border-amber-500/20 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Compressed Thickness</span>
                <span className="text-amber-300 font-extrabold">0.85 mm (0.033")</span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Combustion Sealing Ring</span>
                <span className="text-emerald-300 font-extrabold">Integrated Stopper Ring</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/50 border border-amber-500/20 space-y-1">
              <span className="text-[10px] font-mono font-bold text-amber-300 uppercase tracking-wider block">
                CYLINDER PRESSURE INTEGRITY
              </span>
              <p className="text-[11px] font-mono text-slate-300 leading-relaxed">
                Multi-layer stainless spring steel embossing accommodates head lift under high boost without blowing coolant seals.
              </p>
            </div>
          </div>
        </SectionCard>

        {/* CARD 2: MATERIAL GRADE */}
        <SectionCard
          title="Gasket Layers & Coating"
          subtitle="MLS Viton-Coated vs Copper O-Ring Motorsport"
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
          title="Sealing Pressure & Reliability"
          subtitle="Combustion chamber isolation, reliability delta & mass"
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
        componentId="head_gasket"
        componentName="Cylinder Head Gasket"
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
