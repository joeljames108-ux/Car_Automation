// ===================================================================
// APEX ENGINE BUILDER — STAGE 9: INTAKE & FUEL SECTION (PHASE 7)
// Plenum Volume, Throttle Bodies, Fuel Rail & Injection Calibration
// ===================================================================

import React from "react";
import { Zap, Layers, Activity, Sliders, Flame } from "lucide-react";
import { SectionCard } from "../SectionCard";
import { MaterialGradePicker } from "../MaterialGradePicker";
import { StatDeltasPanel } from "../StatDeltasPanel";
import { InstallButton } from "../InstallButton";
import { Select, Slider } from "../../ui/Controls";
import { INTAKE_TYPES, FUEL_SYSTEMS } from "../../../sim/constants";
import {
  EngineConfig,
  IntakeType,
  FuelSystemType,
  SimResult,
} from "../../../sim/types";
import {
  AssemblyComponentMeta,
  AssemblyPhase,
  MaterialGrade,
} from "../../../sim/assemblyTypes";

interface IntakeManifoldSectionProps {
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

export function IntakeManifoldSection({
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
}: IntakeManifoldSectionProps) {
  const intakeOptions = (Object.keys(INTAKE_TYPES) as IntakeType[]).map((i) => ({
    value: i,
    label: INTAKE_TYPES[i].label,
  }));

  const fuelOptions = (Object.keys(FUEL_SYSTEMS) as FuelSystemType[]).map((f) => ({
    value: f,
    label: FUEL_SYSTEMS[f].label,
  }));

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
        
        {/* CARD 1: INTAKE PLENUM & FUEL DELIVERY */}
        <SectionCard
          title="Intake Plenum & Fuel System"
          subtitle="Manifold runner length, throttle bodies & injection pressure"
          icon={<Zap size={16} />}
          accent="cyan"
        >
          <div className="space-y-3">
            <Select<IntakeType>
              label="Induction Architecture"
              value={engineConfig.intake || "na"}
              options={intakeOptions}
              onChange={(v) => updateEngine({ intake: v })}
            />

            <Select<FuelSystemType>
              label="Fuel Injection System"
              value={engineConfig.fuelSystem || "direct"}
              options={fuelOptions}
              onChange={(v) => updateEngine({ fuelSystem: v })}
            />

            <div className="space-y-2 pt-2 border-t border-amber-800/30">
              <Slider
                label="Air-Fuel Ratio (AFR)"
                value={engineConfig.afr || 12.5}
                min={10}
                max={16}
                step={0.1}
                onChange={(v) => updateEngine({ afr: v })}
              />
              <Slider
                label="Ignition Timing Advance"
                value={engineConfig.ignitionTiming || 28}
                min={10}
                max={40}
                unit="°BTDC"
                onChange={(v) => updateEngine({ ignitionTiming: v })}
              />
            </div>
          </div>
        </SectionCard>

        {/* CARD 2: MATERIAL GRADE */}
        <SectionCard
          title="Plenum Material & Construction"
          subtitle="Cast Aluminum Alloy vs Carbon Fiber High-Velocity Plenum"
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
          title="Airflow & Throttle Response"
          subtitle="Intake charge density, volumetric efficiency & power delta"
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
        componentId="intake_manifold"
        componentName="Intake Manifold & Fuel System"
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
