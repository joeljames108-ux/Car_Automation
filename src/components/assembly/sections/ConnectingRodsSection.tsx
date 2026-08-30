// ===================================================================
// APEX ENGINE BUILDER — STAGE 4: CONNECTING RODS SECTION (PHASE 5)
// H-Beam / I-Beam Geometry, Floating Wrist Pins & ARP Rod Bolts
// ===================================================================

import React from "react";
import { Sliders, Layers, Activity, Wrench, ShieldCheck } from "lucide-react";
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

interface ConnectingRodsSectionProps {
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

export function ConnectingRodsSection({
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
}: ConnectingRodsSectionProps) {
  const stroke = engineConfig.stroke || 86;
  const rodLength = engineConfig.rodLength || 140;
  const rodRatio = (rodLength / stroke).toFixed(2);

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
        
        {/* CARD 1: ROD GEOMETRY & ROD RATIO */}
        <SectionCard
          title="Connecting Rod Geometry"
          subtitle="Beam profile cross-section, wrist pin bushings & rod ratio"
          icon={<Sliders size={16} />}
          accent="cyan"
        >
          <div className="space-y-4">
            <Slider
              label="Center-to-Center Length"
              value={rodLength}
              min={100}
              max={220}
              unit="mm"
              onChange={(v) => updateEngine({ rodLength: v })}
            />

            {/* Rod Ratio Readout */}
            <div className="p-3 rounded-xl bg-base-950/80 border border-amber-500/20 flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">Rod-to-Stroke Ratio</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono font-extrabold text-amber-300">{rodRatio}:1</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-bold bg-amber-500/20 text-amber-300">
                  {parseFloat(rodRatio) > 1.65 ? "HIGH-RPM OPTIMAL" : "TORQUE BIASED"}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/50 border border-amber-500/20 space-y-1">
              <span className="text-[10px] font-mono font-bold text-amber-300 uppercase tracking-wider block">
                BEAM CROSS-SECTION
              </span>
              <p className="text-[11px] font-mono text-slate-300 leading-relaxed">
                H-Beam forged 300M alloy connecting rods resist tensile elongation and lateral buckling under 2,000+ Nm cylinder peak forces.
              </p>
            </div>
          </div>
        </SectionCard>

        {/* CARD 2: MATERIAL GRADE */}
        <SectionCard
          title="Alloy Forging & Fasteners"
          subtitle="4340 H-Beam vs Billet Titanium Spec-R"
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
          title="ARP Fasteners & Journal Specs"
          subtitle="Rod cap bolt tension, big-end bearing clearance & inertial mass"
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
        componentId="rods"
        componentName="Connecting Rods & Wrist Pins"
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
