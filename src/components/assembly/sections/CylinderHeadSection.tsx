// ===================================================================
// APEX ENGINE BUILDER — STAGE 6: CYLINDER HEAD SECTION (PHASE 6)
// CNC Combustion Chambers, Port Flow & Valvetrain Architecture
// ===================================================================

import React from "react";
import { Cog, Layers, Activity, Sliders, ShieldCheck } from "lucide-react";
import { SectionCard } from "../SectionCard";
import { MaterialGradePicker } from "../MaterialGradePicker";
import { StatDeltasPanel } from "../StatDeltasPanel";
import { InstallButton } from "../InstallButton";
import { Select } from "../../ui/Controls";
import { VALVETRAIN_TYPES } from "../../../sim/constants";
import { EngineConfig, ValvetrainType, SimResult } from "../../../sim/types";
import {
  AssemblyComponentMeta,
  AssemblyPhase,
  MaterialGrade,
} from "../../../sim/assemblyTypes";

interface CylinderHeadSectionProps {
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

export function CylinderHeadSection({
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
}: CylinderHeadSectionProps) {
  const valvetrainOptions = (Object.keys(VALVETRAIN_TYPES) as ValvetrainType[]).map((v) => ({
    value: v,
    label: VALVETRAIN_TYPES[v].label,
  }));

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
        
        {/* CARD 1: VALVETRAIN & CNC PORTING */}
        <SectionCard
          title="Valvetrain Architecture"
          subtitle="Camshaft configuration, combustion chambers & porting profile"
          icon={<Cog size={16} />}
          accent="cyan"
        >
          <div className="space-y-4">
            <Select<ValvetrainType>
              label="Valvetrain Configuration"
              value={engineConfig.valvetrain || "dohc_vvl"}
              options={valvetrainOptions}
              onChange={(v) => updateEngine({ valvetrain: v })}
            />

            <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 space-y-1">
              <span className="text-[10px] font-mono font-bold text-amber-300 uppercase tracking-wider block">
                VOLUMETRIC EFFICIENCY
              </span>
              <p className="text-[11px] font-mono text-slate-300 leading-relaxed">
                5-Axis CNC porting of intake and exhaust runners eliminates boundary layer turbulence, increasing volumetric air charge flow by up to 28%.
              </p>
            </div>
          </div>
        </SectionCard>

        {/* CARD 2: MATERIAL GRADE */}
        <SectionCard
          title="Alloy Casting & CNC Billet"
          subtitle="A356-T6 Aluminum Alloy vs 6061-T6 Billet CNC Machined"
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
          title="Head Stud Specs & Power Delta"
          subtitle="ARP 12-point head stud clamping force & peak horsepower"
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
        componentId="cylinder_head"
        componentName="Cylinder Head Assembly"
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
