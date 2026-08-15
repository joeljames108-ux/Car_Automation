// ===================================================================
// APEX ENGINE BUILDER — OPTIONAL HYBRID E-MOTOR & INVERTER (PHASE 12)
// 800V Axial-Flux Motor, SiC Power Electronics & Battery Energy Storage
// ===================================================================

import React from "react";
import {
  Zap,
  Battery,
  Cpu,
  Layers,
  Activity,
  Sliders,
  SkipForward,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { SectionCard } from "../SectionCard";
import { MaterialGradePicker } from "../MaterialGradePicker";
import { StatDeltasPanel } from "../StatDeltasPanel";
import { InstallButton } from "../InstallButton";
import { Select, Slider, Toggle } from "../../ui/Controls";
import {
  HYBRID_ARCHITECTURES,
  MOTOR_PLACEMENTS,
  BATTERY_CHEMISTRIES,
  POWER_ELECTRONICS_TYPES,
  REGEN_BRAKING_TYPES,
} from "../../../sim/constants";
import { EngineConfig, SimResult } from "../../../sim/types";
import {
  AssemblyComponentMeta,
  AssemblyPhase,
  MaterialGrade,
} from "../../../sim/assemblyTypes";

interface HybridOptionalSectionProps {
  engineConfig: EngineConfig;
  sim: SimResult;
  currentStage: string;
  motorComponentMeta?: AssemblyComponentMeta;
  inverterComponentMeta?: AssemblyComponentMeta;
  selectedMotorVariant: MaterialGrade;
  selectedInverterVariant: MaterialGrade;
  isMotorInstalled: boolean;
  isInverterInstalled: boolean;
  isInstalling: boolean;
  phase: AssemblyPhase;
  currentTotalStats: {
    hp: number;
    torque: number;
    weight: number;
    reliability: number;
    cost: number;
  };
  updateEngine: (updates: Partial<EngineConfig>) => void;
  onSelectMotorVariant: (variant: MaterialGrade) => void;
  onSelectInverterVariant: (variant: MaterialGrade) => void;
  onInstall: () => void;
  onSkipAnimation?: () => void;
  onSkipHybrid: () => void;
  onNext?: () => void;
  className?: string;
}

export function HybridOptionalSection({
  engineConfig,
  sim,
  currentStage,
  motorComponentMeta,
  inverterComponentMeta,
  selectedMotorVariant,
  selectedInverterVariant,
  isMotorInstalled,
  isInverterInstalled,
  isInstalling,
  phase,
  currentTotalStats,
  updateEngine,
  onSelectMotorVariant,
  onSelectInverterVariant,
  onInstall,
  onSkipAnimation,
  onSkipHybrid,
  onNext,
  className = "",
}: HybridOptionalSectionProps) {
  const isInstallingInverter = currentStage === "inverter_ecu" || isMotorInstalled;
  const activeMeta = isInstallingInverter ? inverterComponentMeta : motorComponentMeta;
  const activeVariant = isInstallingInverter ? selectedInverterVariant : selectedMotorVariant;
  const onSelectActiveVariant = isInstallingInverter ? onSelectInverterVariant : onSelectMotorVariant;
  const currentCompId = isInstallingInverter ? "inverter_ecu" : "hybrid_motor";
  const currentCompName = isInstallingInverter
    ? "Inverter & Hybrid ECU Module"
    : "800V Axial-Flux Hybrid Motor";

  const archOptions = (Object.keys(HYBRID_ARCHITECTURES) as string[]).map((arch) => ({
    value: arch,
    label: HYBRID_ARCHITECTURES[arch as keyof typeof HYBRID_ARCHITECTURES].label,
  }));

  const placementOptions = (Object.keys(MOTOR_PLACEMENTS) as string[]).map((p) => ({
    value: p,
    label: MOTOR_PLACEMENTS[p as keyof typeof MOTOR_PLACEMENTS].label,
  }));

  return (
    <div className={`space-y-6 ${className}`}>
      {/* ── SKIP BANNER ── */}
      <div className="p-3.5 rounded-2xl bg-purple-950/30 border border-purple-500/30 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-mono text-purple-200">
          <Zap size={14} className="text-purple-400 animate-pulse" />
          <span className="font-extrabold">Optional Electrification Subsystem:</span>
          <span className="text-purple-300/80">
            {isMotorInstalled
              ? "Motor installed — now mounting Inverter & Power Electronics"
              : "Install e-motor assist or skip directly to summary."}
          </span>
        </div>

        <button
          type="button"
          onClick={onSkipHybrid}
          className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-base-900 hover:bg-base-800 text-purple-300 border border-purple-500/30 text-xs font-mono font-bold transition-all cursor-pointer"
        >
          <SkipForward size={13} />
          <span>Skip Hybrid</span>
        </button>
      </div>

      {/* ── 3-CARD SECTION LAYOUT ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
        
        {/* CARD 1: MOTOR & BATTERY ARCHITECTURE */}
        <SectionCard
          title="Hybrid Motor & Energy Storage"
          subtitle="800V Architecture, motor output kW & solid-state pack"
          icon={<Zap size={16} />}
          accent="purple"
        >
          <div className="space-y-3">
            <Select
              label="Hybrid Architecture"
              value={engineConfig.hybridArchitecture || "phev"}
              options={archOptions}
              onChange={(v) => {
                const newArch = v as EngineConfig["hybridArchitecture"];
                const caps = HYBRID_ARCHITECTURES[newArch as keyof typeof HYBRID_ARCHITECTURES];
                updateEngine({
                  hybridArchitecture: newArch,
                  batteryCapacity: caps?.minBattery || 16,
                  hybridMotorPower:
                    newArch === "none"
                      ? 0
                      : Math.max(60, Math.min(engineConfig.hybridMotorPower || 180, caps?.maxMotorPower || 500)),
                });
              }}
            />

            <Slider
              label="Electric Motor Output"
              value={engineConfig.hybridMotorPower || 180}
              min={50}
              max={500}
              step={10}
              unit=" kW"
              format={(v) => `${v} kW (${Math.round(v * 1.341)} HP)`}
              onChange={(v) => updateEngine({ hybridMotorPower: v })}
            />

            <Select
              label="Motor Drive Placement"
              value={engineConfig.motorPlacement || "integrated_crank"}
              options={placementOptions}
              onChange={(v) =>
                updateEngine({ motorPlacement: v as EngineConfig["motorPlacement"] })
              }
            />

            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <Select
                label="Battery Chemistry"
                value={engineConfig.batteryChemistry || "solid_state"}
                options={Object.keys(BATTERY_CHEMISTRIES).map((b) => ({
                  value: b,
                  label: BATTERY_CHEMISTRIES[b as keyof typeof BATTERY_CHEMISTRIES].label,
                }))}
                onChange={(v) =>
                  updateEngine({ batteryChemistry: v as EngineConfig["batteryChemistry"] })
                }
              />
              <Slider
                label="Hybrid Battery Capacity"
                value={engineConfig.batteryCapacity || 16}
                min={1}
                max={30}
                step={0.5}
                unit="kWh"
                onChange={(v) => updateEngine({ batteryCapacity: v })}
              />
            </div>
          </div>
        </SectionCard>

        {/* CARD 2: MATERIAL GRADE */}
        <SectionCard
          title="Motor & Inverter Metallurgy"
          subtitle="Axial-Flux vs Dual-Stator HyperDrive Spec"
          icon={<Layers size={16} />}
          accent="purple"
        >
          {activeMeta ? (
            <MaterialGradePicker
              variants={activeMeta.variants}
              selectedVariant={activeVariant}
              onSelectVariant={onSelectActiveVariant}
              title={`${activeMeta.name} Variant`}
            />
          ) : (
            <p className="text-xs font-mono text-slate-500">Loading material variants...</p>
          )}
        </SectionCard>

        {/* CARD 3: ENGINEERING STAT DELTAS */}
        <SectionCard
          title="Combined Hybrid Powertrain"
          subtitle="ICE + Electric combined horsepower, torque & energy recovery"
          icon={<Activity size={16} />}
          accent="emerald"
        >
          <StatDeltasPanel
            componentMeta={activeMeta}
            selectedVariant={activeVariant}
            currentTotalStats={currentTotalStats}
            adviceText={activeMeta?.tooltipAdvice}
          />
        </SectionCard>

      </div>

      {/* INSTALL ACTION TRIGGER */}
      <InstallButton
        componentId={currentCompId}
        componentName={currentCompName}
        isInstalled={isInstallingInverter ? isInverterInstalled : isMotorInstalled}
        isInstalling={isInstalling}
        canInstall={true}
        phase={phase}
        onInstall={onInstall}
        onSkipAnimation={onSkipAnimation}
        onNext={onNext}
      />
    </div>
  );
}
