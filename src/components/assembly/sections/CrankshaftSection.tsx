// ===================================================================
// APEX ENGINE BUILDER — STAGE 2: CRANKSHAFT SECTION (PHASE 5)
// Main Bearings, Counterweights, Journal Clearance & Harmonic Balancing
// ===================================================================

import React from "react";
import { Cog, Wrench, Layers, Activity, Sliders, ShieldCheck } from "lucide-react";
import { SectionCard } from "../SectionCard";
import { MaterialGradePicker } from "../MaterialGradePicker";
import { StatDeltasPanel } from "../StatDeltasPanel";
import { InstallButton } from "../InstallButton";
import { Select, Slider } from "../../ui/Controls";
import { CRANK_MATERIALS } from "../../../sim/constants";
import { EngineConfig, CrankMaterial, SimResult } from "../../../sim/types";
import {
  AssemblyComponentMeta,
  AssemblyPhase,
  MaterialGrade,
} from "../../../sim/assemblyTypes";

interface CrankshaftSectionProps {
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

export function CrankshaftSection({
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
}: CrankshaftSectionProps) {
  const crankOptions = (Object.keys(CRANK_MATERIALS) as CrankMaterial[]).map((c) => ({
    value: c,
    label: CRANK_MATERIALS[c].label,
  }));

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
        
        {/* CARD 1: CRANKSHAFT SPEC & BALANCE */}
        <SectionCard
          title="Crankshaft & Journals"
          subtitle="Rotational balance, counterweight profile & bearing saddles"
          icon={<Cog size={16} />}
          accent="cyan"
        >
          <div className="space-y-4">
            <Select<CrankMaterial>
              label="Crankshaft Material Spec"
              value={engineConfig.crank || "forged_steel"}
              options={crankOptions}
              onChange={(v) => updateEngine({ crank: v })}
            />

            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <Slider
                label="Rod Journal Length"
                value={engineConfig.rodLength || 140}
                min={100}
                max={220}
                unit="mm"
                onChange={(v) => updateEngine({ rodLength: v })}
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-900/50 border border-amber-500/20 space-y-1">
              <span className="text-[10px] font-mono font-bold text-amber-300 uppercase tracking-wider block">
                ROTATIONAL HARMONICS
              </span>
              <p className="text-[11px] font-mono text-slate-300 leading-relaxed">
                Full-counterweight design minimizes 2nd-order engine vibrations, preserving high-RPM main journal bearing oil film.
              </p>
            </div>
          </div>
        </SectionCard>

        {/* CARD 2: MATERIAL GRADE PICKER */}
        <SectionCard
          title="Forging Grade & Heat Treatment"
          subtitle="4340 Chromoly Steel, Nitride Treatment & Billet Hardness"
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
          title="Torque & Bearing Clearances"
          subtitle="Main cap bolt torque, journal clearance & rotational inertia"
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
        componentName="Crankshaft & Main Bearings"
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
