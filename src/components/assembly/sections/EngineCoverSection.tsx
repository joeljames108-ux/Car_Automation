// ===================================================================
// APEX ENGINE BUILDER — STAGE 15: ENGINE COVER & RAM-AIR PLENUM
// Carbon-Fiber Dress Cover, Gold Framing & Velocity Stack Windows (Photo 2)
// ===================================================================

import React from "react";
import { Sparkles, Layers, Activity, Wind, ShieldCheck } from "lucide-react";
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

interface EngineCoverSectionProps {
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

export function EngineCoverSection({
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
}: EngineCoverSectionProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
        
        {/* CARD 1: COVER AESTHETICS & RAM-AIR INDUCTION */}
        <SectionCard
          title="Aero Dress Cover & Ram-Air Intake"
          subtitle="Carbon-fiber weave, transparent ITB inspection window & ram-air scoop"
          icon={<Sparkles size={16} />}
          accent="cyan"
        >
          <div className="space-y-3">
            <Select
              label="Engine Cover Style"
              value="carbon_gold_bezel"
              options={[
                { value: "polycarbonate_oem", label: "OEM Polymer Cover (Standard Damping)" },
                { value: "carbon_gold_bezel", label: "Dry Carbon Weave + Gold Anodized Bezel (Photo 2)" },
                { value: "forged_carbon_titanium", label: "Forged Carbon-Titanium Aerocowl + Ram-Air Scoop" },
                { value: "clear_lexan_racing", label: "Full Clear Lexan Show Cover with Gold Bolts" },
              ]}
              onChange={() => {}}
            />

            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-xl bg-base-950/80 border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase">ITB Window</span>
                <span className="text-xs font-mono font-bold text-amber-300 block">6-Port Acrylic Glass</span>
              </div>
              <div className="p-2.5 rounded-xl bg-base-950/80 border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Embossed Badge</span>
                <span className="text-xs font-mono font-bold text-amber-300 block">RACING V12 EVOLUTION</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 space-y-1">
              <span className="text-[10px] font-mono font-bold text-amber-300 uppercase tracking-wider block">
                RAM-AIR INDUCTION BOOST
              </span>
              <p className="text-[11px] font-mono text-slate-300 leading-relaxed">
                Front ram-air induction scoop channels high-velocity ambient air directly over intake velocity stacks, pressurizing intake manifold at speeds above 150 km/h.
              </p>
            </div>
          </div>
        </SectionCard>

        {/* CARD 2: MATERIAL GRADE PICKER */}
        <SectionCard
          title="Engine Cover Metallurgy & Weave"
          subtitle="Polycarbonate vs Pre-Preg 3K Twill Dry Carbon-Fiber"
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
          title="Acoustic NVH & Intake Temperature"
          subtitle="Noise suppression, intake air density & quarter-turn fastener torque"
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
        componentId="engine_cover"
        componentName="Engine Dress Cover & Ram-Air Plenum"
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
