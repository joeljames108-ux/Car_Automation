// ===================================================================
// APEX ENGINE BUILDER — STAGE 7: CAMSHAFTS SECTION (PHASE 6)
// Cam Lobe Profiles, Valve Lift, Duration & VVT Phase Phasing
// ===================================================================

import React from "react";
import { Sliders, Layers, Activity, Cog, ShieldCheck } from "lucide-react";
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

interface CamshaftSectionProps {
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

export function CamshaftSection({
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
}: CamshaftSectionProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
        
        {/* CARD 1: CAM PROFILE TUNING */}
        <SectionCard
          title="Cam Profile & Valve Lift"
          subtitle="Duration, max valve lift & variable cam timing advance"
          icon={<Sliders size={16} />}
          accent="cyan"
        >
          <div className="space-y-3">
            <Slider
              label="Cam Duration"
              value={engineConfig.camDuration || 270}
              min={240}
              max={340}
              unit="°"
              onChange={(v) => updateEngine({ camDuration: v })}
            />
            <Slider
              label="Cam Gross Lift"
              value={engineConfig.camLift || 11.5}
              min={6}
              max={16}
              step={0.5}
              unit="mm"
              onChange={(v) => updateEngine({ camLift: v })}
            />
            <Slider
              label="Cam Timing Phase"
              value={engineConfig.camTiming || 0}
              min={-10}
              max={10}
              step={0.5}
              unit="°"
              onChange={(v) => updateEngine({ camTiming: v })}
            />

            <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 space-y-1">
              <span className="text-[10px] font-mono font-bold text-amber-300 uppercase tracking-wider block">
                POWERBAND DYNAMICS
              </span>
              <p className="text-[11px] font-mono text-slate-300 leading-relaxed">
                Higher duration ({engineConfig.camDuration || 270}°) increases top-end breathing above 7,000 RPM while broad lift fills mid-range torque.
              </p>
            </div>
          </div>
        </SectionCard>

        {/* CARD 2: MATERIAL GRADE */}
        <SectionCard
          title="Camshaft Metallurgy"
          subtitle="Chilled Cast Iron vs Billet 8620 Steel with DLC Coating"
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
          title="High-RPM Airflow & Power"
          subtitle="Volumetric flow gains, valvetrain inertia & horsepower"
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
        componentName="Camshafts & Timing Gears"
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
