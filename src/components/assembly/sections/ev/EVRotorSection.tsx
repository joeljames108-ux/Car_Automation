// ===================================================================
// APEX ENGINE BUILDER — EV STAGE 8: PM ROTOR SHAFT SECTION (PHASE 10)
// Neodymium Magnet Arrays, Carbon-Fiber Sleeve & High-RPM Centrifugal Balance
// ===================================================================

import React from "react";
import { Cog, Layers, Activity, ShieldCheck, Zap } from "lucide-react";
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

interface EVRotorSectionProps {
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

export function EVRotorSection({
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
}: EVRotorSectionProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
        
        {/* CARD 1: ROTOR SPEC */}
        <SectionCard
          title="Permanent Magnet Rotor Shaft"
          subtitle="Halbach magnet array, carbon retention sleeve & centrifugal stability"
          icon={<Cog size={16} />}
          accent="purple"
        >
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-base-950/80 border border-amber-500/20 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Magnet Topology</span>
                <span className="text-amber-300 font-extrabold">Halbach Neodymium N52UH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Rotor Sleeve</span>
                <span className="text-emerald-300 font-extrabold">Carbon-Fiber Overwrap</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Max Rotor Velocity</span>
                <span className="text-amber-300 font-extrabold">22,000 RPM Rated</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 space-y-1">
              <span className="text-[10px] font-mono font-bold text-amber-300 uppercase tracking-wider block">
                CENTRIFUGAL INTEGRITY
              </span>
              <p className="text-[11px] font-mono text-slate-300 leading-relaxed">
                Tensioned carbon-fiber sleeves lock magnets against extreme rotational G-forces, preventing magnet detachment at redline.
              </p>
            </div>
          </div>
        </SectionCard>

        {/* CARD 2: MATERIAL GRADE */}
        <SectionCard
          title="Rotor Metallurgy & Magnets"
          subtitle="Surface PM vs Carbon-Sleeve Interior PM HyperDrive"
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
          title="Torque Density & Rotational Mass"
          subtitle="Electromagnetic flux density, rotor inertia & horsepower"
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
        componentId="camshaft"
        componentName="Permanent Magnet Rotor Shaft"
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
