// ===================================================================
// APEX ENGINE BUILDER — STAGE 3: PISTONS & RINGS SECTION (PHASE 5)
// Piston Dome Geometry, Compression Ring Pack & Skirt Coatings
// ===================================================================

import React from "react";
import { Flame, Layers, Activity, Sliders, ShieldCheck } from "lucide-react";
import { SectionCard } from "../SectionCard";
import { MaterialGradePicker } from "../MaterialGradePicker";
import { StatDeltasPanel } from "../StatDeltasPanel";
import { InstallButton } from "../InstallButton";
import { Select, Slider } from "../../ui/Controls";
import { PISTON_TYPES } from "../../../sim/constants";
import { EngineConfig, PistonType, SimResult } from "../../../sim/types";
import {
  AssemblyComponentMeta,
  AssemblyPhase,
  MaterialGrade,
} from "../../../sim/assemblyTypes";

interface PistonsSectionProps {
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

export function PistonsSection({
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
}: PistonsSectionProps) {
  const pistonOptions = (Object.keys(PISTON_TYPES) as PistonType[]).map((p) => ({
    value: p,
    label: PISTON_TYPES[p].label,
  }));

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
        
        {/* CARD 1: PISTON DOME & RINGS */}
        <SectionCard
          title="Piston Crowns & Rings"
          subtitle="Piston crown metallurgy, compression ring pack & skirt coating"
          icon={<Flame size={16} />}
          accent="cyan"
        >
          <div className="space-y-4">
            <Select<PistonType>
              label="Piston Architecture"
              value={engineConfig.pistons || "forged"}
              options={pistonOptions}
              onChange={(v) => updateEngine({ pistons: v })}
            />

            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <Slider
                label="Compression Ratio Tuning"
                value={engineConfig.compressionRatio || 10.5}
                min={8}
                max={16}
                step={0.1}
                format={(v) => `${v}:1`}
                onChange={(v) => updateEngine({ compressionRatio: v })}
              />
            </div>

            <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 space-y-1">
              <span className="text-[10px] font-mono font-bold text-amber-300 uppercase tracking-wider block">
                THERMAL BARRIER COATING
              </span>
              <p className="text-[11px] font-mono text-slate-300 leading-relaxed">
                Ceramic piston crown coatings deflect combustion heat downward into the power stroke, protecting the ring land from pre-ignition detonation.
              </p>
            </div>
          </div>
        </SectionCard>

        {/* CARD 2: MATERIAL GRADE */}
        <SectionCard
          title="Alloy Metallurgy & Coatings"
          subtitle="2618 High-Boost Forging vs 4032 Low-Expansion Alloy"
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
          title="Ring Gap Clearances & Power"
          subtitle="Top ring end gap, blow-by prevention & reciprocating mass"
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
        componentId="pistons"
        componentName="Pistons & Compression Rings"
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
