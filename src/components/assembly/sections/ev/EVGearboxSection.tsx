// ===================================================================
// APEX ENGINE BUILDER — EV STAGE 10: REDUCTION GEARBOX (PHASE 11)
// Helical Reduction Gears, Limited-Slip E-Differential & 1,500 Nm Torque
// ===================================================================

import React from "react";
import { Cog, Layers, Activity, ShieldCheck } from "lucide-react";
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

interface EVGearboxSectionProps {
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

export function EVGearboxSection({
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
}: EVGearboxSectionProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
        
        {/* CARD 1: GEARBOX CONFIG */}
        <SectionCard
          title="Single-Speed Reduction Gearbox"
          subtitle="Helical gear reduction ratio, torque multiplication & e-differential"
          icon={<Cog size={16} />}
          accent="purple"
        >
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-base-950/80 border border-amber-500/20 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-amber-200/60">Final Drive Reduction</span>
                <span className="text-amber-300 font-extrabold">9.34 : 1 Ratio</span>
              </div>
              <div className="flex justify-between">
                <span className="text-amber-200/60">Differential Type</span>
                <span className="text-emerald-300 font-extrabold">Active Torque-Vectoring E-Diff</span>
              </div>
              <div className="flex justify-between">
                <span className="text-amber-200/60">Max Axle Torque</span>
                <span className="text-amber-300 font-extrabold">3,800+ Nm Wheel Torque</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 space-y-1">
              <span className="text-[10px] font-mono font-bold text-amber-300 uppercase tracking-wider block">
                NVH ACOUSTIC REFINEMENT
              </span>
              <p className="text-[11px] font-mono text-amber-100/80 leading-relaxed">
                Precision ground helical gear teeth minimize high-frequency gear whine and handle instantaneous 0-RPM torque shock without deflection.
              </p>
            </div>
          </div>
        </SectionCard>

        {/* CARD 2: MATERIAL GRADE */}
        <SectionCard
          title="Gearset Metallurgy"
          subtitle="Carburized Steel vs Case-Hardened Cryogenic Treated Billet"
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
          title="Torque Multiplication & Driveline"
          subtitle="Wheel torque transfer, gear durability & transmission efficiency"
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
        componentName="Reduction Gearbox"
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
