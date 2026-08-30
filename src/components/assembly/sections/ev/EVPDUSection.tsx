// ===================================================================
// APEX ENGINE BUILDER — EV STAGE 11: HIGH-VOLTAGE PDU (PHASE 11)
// Solid-State Contactors, DC-DC Converter & Auxiliary Power Distribution
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

interface EVPDUSectionProps {
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

export function EVPDUSection({
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
}: EVPDUSectionProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
        
        {/* CARD 1: PDU ARCHITECTURE */}
        <SectionCard
          title="High-Voltage Power Distribution Unit"
          subtitle="Precharge circuits, solid-state contactors & 12V DC-DC converter"
          icon={<Zap size={16} />}
          accent="purple"
        >
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-base-950/80 border border-amber-500/20 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">DC-DC Output</span>
                <span className="text-amber-300 font-extrabold">3.5 kW (12V/48V Dual)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Main Contactor Type</span>
                <span className="text-emerald-300 font-extrabold">Hermetically Sealed Solid-State</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Arc Suppression</span>
                <span className="text-amber-300 font-extrabold">Ultra-Fast 1.5ms Cutoff</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/50 border border-amber-500/20 space-y-1">
              <span className="text-[10px] font-mono font-bold text-amber-300 uppercase tracking-wider block">
                AUXILIARY SYSTEM INTEGRATION
              </span>
              <p className="text-[11px] font-mono text-slate-300 leading-relaxed">
                Centralizes high-voltage power routing to dual electric motor inverters, active aero actuators and cabin thermal heat pumps.
              </p>
            </div>
          </div>
        </SectionCard>

        {/* CARD 2: MATERIAL GRADE */}
        <SectionCard
          title="PDU Hardware Specification"
          subtitle="Automotive OEM vs Aerospace Hermetic Solid-State Contactors"
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
          title="Electrical Isolation & Reliability"
          subtitle="Circuit isolation resistance, safety score & system weight"
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
        componentName="High-Voltage PDU Unit"
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
