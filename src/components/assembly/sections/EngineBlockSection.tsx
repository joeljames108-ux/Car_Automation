// ===================================================================
// APEX ENGINE BUILDER — STAGE 1: ENGINE BLOCK SECTION (PHASE 4)
// Architecture Layout, Bore/Stroke Dimensions, Metallurgy & Drivetrain
// ===================================================================

import React from "react";
import {
  Cog,
  Zap,
  Flame,
  Layers,
  Wrench,
  Activity,
  Sliders,
  ShieldCheck,
} from "lucide-react";
import { SectionCard } from "../SectionCard";
import { MaterialGradePicker } from "../MaterialGradePicker";
import { StatDeltasPanel } from "../StatDeltasPanel";
import { InstallButton } from "../InstallButton";
import { Slider, Select, ChoiceGrid } from "../../ui/Controls";
import {
  ENGINE_LAYOUTS,
  DRIVE_TYPES,
  ENGINE_POSITIONS,
} from "../../../sim/constants";
import {
  EngineConfig,
  EngineLayout,
  DriveType,
  EnginePosition,
  SimResult,
} from "../../../sim/types";
import {
  AssemblyComponentMeta,
  AssemblyPhase,
  MaterialGrade,
} from "../../../sim/assemblyTypes";

interface EngineBlockSectionProps {
  engineConfig: EngineConfig;
  sim: SimResult;
  componentMeta?: AssemblyComponentMeta;
  selectedVariant: MaterialGrade;
  isInstalled: boolean;
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
  updateVehicle?: (updates: any) => void;
  onSelectVariant: (variant: MaterialGrade) => void;
  onInstall: () => void;
  onSkipAnimation?: () => void;
  onNext?: () => void;
  className?: string;
}

const LAYOUT_ICONS: Record<string, React.ReactNode> = {
  i3: <Cog size={11} />,
  i4: <Cog size={11} />,
  i6: <Cog size={11} />,
  v6: <Cog size={11} />,
  v8: <Cog size={11} />,
  v10: <Cog size={11} />,
  v12: <Cog size={11} />,
  w12: <Cog size={11} />,
  w16: <Cog size={11} />,
  w18: <Cog size={11} />,
  boxer4: <Cog size={11} />,
  boxer6: <Cog size={11} />,
  rotary: <Flame size={11} />,
};

export function EngineBlockSection({
  engineConfig,
  sim,
  componentMeta,
  selectedVariant,
  isInstalled,
  isInstalling,
  phase,
  currentTotalStats,
  updateEngine,
  updateVehicle,
  onSelectVariant,
  onInstall,
  onSkipAnimation,
  onNext,
  className = "",
}: EngineBlockSectionProps) {
  const engineLayouts = (Object.keys(ENGINE_LAYOUTS) as EngineLayout[]).filter(
    (l) => l !== "electric" && l !== "hybrid"
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* ── 3-CARD SECTION LAYOUT ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
        
        {/* CARD 1 (LEFT): ARCHITECTURE & DIMENSIONS */}
        <SectionCard
          title="Architecture & Bore/Stroke"
          subtitle="Cylinder arrangement, displacement geometry & placement"
          icon={<Cog size={16} />}
          accent="cyan"
        >
          <div className="space-y-4">
            {/* Engine Layout Grid */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider block">
                Cylinder Bank Layout
              </label>
              <div className="grid grid-cols-3 gap-1.5 max-h-48 overflow-y-auto pr-1 no-scrollbar">
                {engineLayouts.map((layout) => (
                  <button
                    key={layout}
                    type="button"
                    onClick={() => updateEngine({ layout })}
                    className={`engine-choice-btn py-1.5 px-2 text-[11px] font-mono font-bold flex items-center gap-1.5 justify-center rounded-xl border transition-all ${
                      engineConfig.layout === layout
                        ? "bg-cyan-500 text-black border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)] font-extrabold scale-102"
                        : "bg-base-950/80 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700"
                    }`}
                  >
                    <span className="shrink-0">{LAYOUT_ICONS[layout] || <Cog size={11} />}</span>
                    <span className="truncate">{ENGINE_LAYOUTS[layout]?.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Bore & Stroke Sliders */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <Slider
                label="Cylinder Bore"
                value={engineConfig.bore || 86}
                min={60}
                max={110}
                unit="mm"
                onChange={(v) => updateEngine({ bore: v })}
              />
              <Slider
                label="Piston Stroke"
                value={engineConfig.stroke || 86}
                min={60}
                max={110}
                unit="mm"
                onChange={(v) => updateEngine({ stroke: v })}
              />
              <Slider
                label="Connecting Rod Length"
                value={engineConfig.rodLength || 140}
                min={100}
                max={220}
                unit="mm"
                onChange={(v) => updateEngine({ rodLength: v })}
              />
              <Slider
                label="Compression Ratio"
                value={engineConfig.compressionRatio || 10.5}
                min={8}
                max={16}
                step={0.1}
                format={(v) => `${v}:1`}
                onChange={(v) => updateEngine({ compressionRatio: v })}
              />
            </div>
          </div>
        </SectionCard>

        {/* CARD 2 (CENTER): MATERIAL GRADE SELECTION */}
        <SectionCard
          title="Block Metallurgy & Casting"
          subtitle="Crankcase material strength, density & thermal conductivity"
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

        {/* CARD 3 (RIGHT): ENGINEERING DELTAS & SUMMARY */}
        <SectionCard
          title="Block Specification & Impact"
          subtitle="Structural mass, calculated displacement & torque load"
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

      {/* ── INSTALL ACTION TRIGGER ── */}
      <InstallButton
        componentId="block"
        componentName="Engine Block Casting"
        isInstalled={isInstalled}
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
