// ===================================================================
// APEX ENGINE BUILDER — STAGE 10: EXHAUST HEADERS SECTION (PHASE 7)
// Equal-Length Primaries, Collector Merges & Acoustic Harmonics
// ===================================================================

import React from "react";
import { Wind, Layers, Activity, Sliders, ToggleLeft } from "lucide-react";
import { SectionCard } from "../SectionCard";
import { MaterialGradePicker } from "../MaterialGradePicker";
import { StatDeltasPanel } from "../StatDeltasPanel";
import { InstallButton } from "../InstallButton";
import { Slider, Toggle } from "../../ui/Controls";
import { EngineConfig, SimResult } from "../../../sim/types";
import {
  AssemblyComponentMeta,
  AssemblyPhase,
  MaterialGrade,
} from "../../../sim/assemblyTypes";

interface ExhaustHeadersSectionProps {
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

export function ExhaustHeadersSection({
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
}: ExhaustHeadersSectionProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
        
        {/* CARD 1: EXHAUST GEOMETRY & SCAVENGING */}
        <SectionCard
          title="Exhaust Headers & Scavenging"
          subtitle="Primary runner length, collector merge angle & backpressure"
          icon={<Wind size={16} />}
          accent="cyan"
        >
          <div className="space-y-3">
            <Slider
              label="Primary Runner Length"
              value={engineConfig.exhaustPrimaryLength || 750}
              min={400}
              max={1400}
              unit="mm"
              onChange={(v) => updateEngine({ exhaustPrimaryLength: v })}
            />
            <Slider
              label="Collector Merge Diameter"
              value={engineConfig.exhaustCollectorDia || 65}
              min={40}
              max={100}
              unit="mm"
              onChange={(v) => updateEngine({ exhaustCollectorDia: v })}
            />

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-amber-800/30">
              <Toggle
                label="Sport Catalytic Converter"
                value={engineConfig.exhaustCat ?? true}
                onChange={(v) => updateEngine({ exhaustCat: v })}
              />
              <Toggle
                label="Active Valved Exhaust"
                value={engineConfig.exhaustValved ?? true}
                onChange={(v) => updateEngine({ exhaustValved: v })}
              />
            </div>
          </div>
        </SectionCard>

        {/* CARD 2: MATERIAL GRADE */}
        <SectionCard
          title="Header Metallurgy & Coating"
          subtitle="304 Stainless vs Inconel 625 with Ceramic Thermal Wrap"
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
          title="Scavenging Harmonics & Power"
          subtitle="Pulse reflection tuning, exhaust backpressure & acoustics"
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
        componentId="exhaust_headers"
        componentName="Exhaust Headers & Scavenging"
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
