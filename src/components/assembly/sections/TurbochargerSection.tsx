// ===================================================================
// APEX ENGINE BUILDER — STAGE 11: TURBOCHARGER SECTION (PHASE 7)
// Compressor/Turbine Sizing, Wastegates, Intercoolers & Anti-Lag
// ===================================================================

import React from "react";
import { Wind, Layers, Activity, Sliders, Zap, Flame } from "lucide-react";
import { SectionCard } from "../SectionCard";
import { MaterialGradePicker } from "../MaterialGradePicker";
import { StatDeltasPanel } from "../StatDeltasPanel";
import { InstallButton } from "../InstallButton";
import { Select, Slider, Toggle } from "../../ui/Controls";
import {
  TURBO_HOUSINGS,
  INTERCOOLER_TYPES,
  WASTEGATE_TYPES,
  BOV_TYPES,
  BOOST_CONTROLLERS,
} from "../../../sim/constants";
import { EngineConfig, SimResult } from "../../../sim/types";
import {
  AssemblyComponentMeta,
  AssemblyPhase,
  MaterialGrade,
} from "../../../sim/assemblyTypes";

interface TurbochargerSectionProps {
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

export function TurbochargerSection({
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
}: TurbochargerSectionProps) {
  const isForced = engineConfig.intake !== "na";

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
        
        {/* CARD 1: FORCED INDUCTION & BOOST */}
        <SectionCard
          title="Boost Pressure & Turbomachinery"
          subtitle="Compressor wheel, turbine A/R, wastegate & intercooler matrix"
          icon={<Wind size={16} />}
          accent="cyan"
        >
          <div className="space-y-3">
            <Slider
              label="Peak Boost Pressure"
              value={engineConfig.boostPressure || 1.4}
              min={0}
              max={5}
              step={0.1}
              unit="bar"
              onChange={(v) => {
                updateEngine({
                  boostPressure: v,
                  intake: v > 0 && engineConfig.intake === "na" ? "turbo_single" : engineConfig.intake,
                });
              }}
            />

            <Select
              label="Turbo Housing Architecture"
              value={engineConfig.turboHousing || "twin_scroll"}
              options={Object.keys(TURBO_HOUSINGS).map((k) => ({
                value: k,
                label: TURBO_HOUSINGS[k as keyof typeof TURBO_HOUSINGS].label,
              }))}
              onChange={(v) => updateEngine({ turboHousing: v as EngineConfig["turboHousing"] })}
            />

            <Select
              label="Charge Air Intercooler"
              value={engineConfig.intercoolerType || "air_water"}
              options={Object.keys(INTERCOOLER_TYPES).map((k) => ({
                value: k,
                label: INTERCOOLER_TYPES[k as keyof typeof INTERCOOLER_TYPES].label,
              }))}
              onChange={(v) => updateEngine({ intercoolerType: v as EngineConfig["intercoolerType"] })}
            />

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
              <Slider
                label="Compressor A/R"
                value={engineConfig.compressorAR || 0.7}
                min={0.3}
                max={1.2}
                step={0.05}
                onChange={(v) => updateEngine({ compressorAR: v })}
              />
              <Slider
                label="Turbine A/R"
                value={engineConfig.turbineAR || 0.85}
                min={0.4}
                max={1.4}
                step={0.05}
                onChange={(v) => updateEngine({ turbineAR: v })}
              />
            </div>

            <div className="pt-2 border-t border-slate-800/80">
              <Toggle
                label="Motorsport Anti-Lag System (ALS)"
                value={engineConfig.antiLag ?? false}
                onChange={(v) => updateEngine({ antiLag: v })}
              />
            </div>
          </div>
        </SectionCard>

        {/* CARD 2: MATERIAL GRADE */}
        <SectionCard
          title="Turbine Metallurgy & Wheels"
          subtitle="Inconel Turbine vs Titanium-Aluminide (Gamma-Ti) Ultra-Spool"
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
          title="Boost Torque & Spool Velocity"
          subtitle="Charge air density, turbo spool lag & peak horsepower gain"
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
        componentId="turbocharger"
        componentName="Turbocharger & Wastegate System"
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
