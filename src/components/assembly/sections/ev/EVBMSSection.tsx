// ===================================================================
// APEX ENGINE BUILDER — EV STAGE 3: BMS CONTROLLER SECTION (PHASE 9)
// Active Cell Balancing, State of Charge (SoC) & Neural Thermal Estimator
// ===================================================================

import React from "react";
import { Cpu, Layers, Activity, ShieldCheck, Zap } from "lucide-react";
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

interface EVBMSSectionProps {
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

export function EVBMSSection({
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
}: EVBMSSectionProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
        
        {/* CARD 1: BMS ARCHITECTURE */}
        <SectionCard
          title="BMS Controller & Algorithms"
          subtitle="Dual-core MCU, active inductive balancing & thermal isolation"
          icon={<Cpu size={16} />}
          accent="purple"
        >
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-base-950/80 border border-purple-500/20 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Balancing Mode</span>
                <span className="text-purple-300 font-extrabold">Active Bidirectional (2A)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">SoC Estimation Algorithm</span>
                <span className="text-cyan-300 font-extrabold">Extended Kalman Filter (EKF)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Sampling Rate</span>
                <span className="text-emerald-300 font-extrabold">100Hz Per Cell</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/20 space-y-1">
              <span className="text-[10px] font-mono font-bold text-purple-300 uppercase tracking-wider block">
                BATTERY LONGEVITY BOOST
              </span>
              <p className="text-[11px] font-mono text-slate-300 leading-relaxed">
                Active cell balancing shuttles charge between weak and strong cells, preventing localized overcharging and extending pack cycle life by 40%.
              </p>
            </div>
          </div>
        </SectionCard>

        {/* CARD 2: MATERIAL GRADE */}
        <SectionCard
          title="BMS Hardware Spec"
          subtitle="Standard Silicon BMS vs Automotive ASIL-D Dual Redundant"
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
          title="Pack Reliability & Efficiency"
          subtitle="Thermal monitoring, voltage regulation & pack protection"
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
        componentName="Battery Management System (BMS)"
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
