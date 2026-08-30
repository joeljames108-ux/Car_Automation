// ===================================================================
// APEX ENGINE BUILDER — EV STAGE 4: HV BUSBARS SECTION (PHASE 9)
// Solid Copper Busbars, Pyrofuse Disconnects & Low-Impedance Grid
// ===================================================================

import React from "react";
import { Zap, Layers, Activity, ShieldCheck } from "lucide-react";
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

interface EVBusbarsSectionProps {
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

export function EVBusbarsSection({
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
}: EVBusbarsSectionProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
        
        {/* CARD 1: BUSBAR GRID SPEC */}
        <SectionCard
          title="High-Voltage Busbars & Wiring"
          subtitle="Low-impedance solid copper conductors, pyrofuses & shielding"
          icon={<Zap size={16} />}
          accent="purple"
        >
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-base-950/80 border border-amber-500/20 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-amber-200/60">Current Rating</span>
                <span className="text-amber-300 font-extrabold">1,200A Continuous</span>
              </div>
              <div className="flex justify-between">
                <span className="text-amber-200/60">Contact Resistance</span>
                <span className="text-emerald-300 font-extrabold">&lt; 0.05 mΩ</span>
              </div>
              <div className="flex justify-between">
                <span className="text-amber-200/60">Safety Pyrofuse</span>
                <span className="text-amber-300 font-extrabold">2ms Instant Pyro Isolation</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 space-y-1">
              <span className="text-[10px] font-mono font-bold text-amber-300 uppercase tracking-wider block">
                I²R TRANSMISSION LOSS MINIMIZATION
              </span>
              <p className="text-[11px] font-mono text-amber-100/80 leading-relaxed">
                Oxygen-free solid copper busbars eliminate resistive heat loss during repeated 0-100 km/h hypercar launches.
              </p>
            </div>
          </div>
        </SectionCard>

        {/* CARD 2: MATERIAL GRADE */}
        <SectionCard
          title="Conductor Metallurgy"
          subtitle="Tinned Copper vs Laser-Welded Pure Silver-Plated Copper"
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
          title="Electrical Conductance & Power"
          subtitle="Transmission efficiency, thermal resistance & reliability"
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
        componentName="High-Voltage Busbars & Wiring"
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
