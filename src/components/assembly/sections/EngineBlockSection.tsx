// ===================================================================
// APEX ENGINE BUILDER — STAGE 1: ENGINE BLOCK SECTION
// Architecture Layout, Bore/Stroke Dimensions, Metallurgy & Drivetrain
// ===================================================================

import React, { useMemo } from "react";
import {
  Cog,
  Zap,
  Flame,
  Layers,
  Activity,
  Gauge,
  Sparkles,
  RotateCcw,
  Sliders,
} from "lucide-react";
import { SectionCard } from "../SectionCard";
import { MaterialGradePicker } from "../MaterialGradePicker";
import { StatDeltasPanel } from "../StatDeltasPanel";
import { InstallButton } from "../InstallButton";
import { Slider } from "../../ui/Controls";
import {
  ENGINE_LAYOUTS,
} from "../../../sim/constants";
import {
  EngineConfig,
  EngineLayout,
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

const LAYOUT_META: Record<
  string,
  { icon: React.ReactNode; tag: string; angle: string }
> = {
  i3: { icon: <Cog size={12} />, tag: "Inline-3", angle: "120° Crank" },
  i4: { icon: <Cog size={12} />, tag: "Inline-4", angle: "180° Flat" },
  i6: { icon: <Cog size={12} />, tag: "Inline-6", angle: "Perfect Bal" },
  v6: { icon: <Cog size={12} />, tag: "V6", angle: "60° / 90° Bank" },
  v8: { icon: <Cog size={12} />, tag: "V8 Crossplane", angle: "90° V-Bank" },
  v10: { icon: <Cog size={12} />, tag: "V10", angle: "72° Bank" },
  v12: { icon: <Cog size={12} />, tag: "V12 Quad-Cam", angle: "60° Bank" },
  w12: { icon: <Cog size={12} />, tag: "W12", angle: "Twin-VR6 72°" },
  w16: { icon: <Cog size={12} />, tag: "W16 Quad-Turbo", angle: "Quad-Bank" },
  w18: { icon: <Cog size={12} />, tag: "W18 Hyper", angle: "Tri-Bank 40°" },
  boxer4: { icon: <Cog size={12} />, tag: "Flat-4 Boxer", angle: "180° Opposed" },
  boxer6: { icon: <Cog size={12} />, tag: "Flat-6 Boxer", angle: "180° Opposed" },
  rotary: { icon: <Flame size={12} className="text-amber-400" />, tag: "2-Rotor Wankel", angle: "Eccentric" },
};

const BORE_STROKE_PRESETS = [
  { label: "OEM Square", bore: 86, stroke: 86, rod: 140 },
  { label: "Oversquare Big-Bore", bore: 92, stroke: 80, rod: 150 },
  { label: "Stroker High-Torque", bore: 84, stroke: 96, rod: 144 },
  { label: "F1 High-Rev Spec", bore: 98, stroke: 72, rod: 155 },
];

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
  onSelectVariant,
  onInstall,
  onSkipAnimation,
  onNext,
  className = "",
}: EngineBlockSectionProps) {
  const engineLayouts = (Object.keys(ENGINE_LAYOUTS) as EngineLayout[]).filter(
    (l) => l !== "electric" && l !== "hybrid"
  );

  const bore = engineConfig.bore || 86;
  const stroke = engineConfig.stroke || 86;
  const rodLength = engineConfig.rodLength || 140;
  const cylinders = ENGINE_LAYOUTS[engineConfig.layout]?.cylinders || 8;

  // Real-time kinematic calculations
  const kinematics = useMemo(() => {
    const singleDisplacementCc = (Math.PI * Math.pow(bore / 2, 2) * stroke) / 1000;
    const totalDisplacementCc = Math.round(singleDisplacementCc * cylinders);
    const displacementLiters = (totalDisplacementCc / 1000).toFixed(1);

    const boreStrokeRatio = Math.round((bore / stroke) * 100) / 100;
    const rodStrokeRatio = Math.round((rodLength / stroke) * 100) / 100;

    let character = "Square";
    let characterColor = "text-cyan-400";
    if (boreStrokeRatio > 1.05) {
      character = "Over-Square (High-Rev)";
      characterColor = "text-cyan-300";
    } else if (boreStrokeRatio < 0.95) {
      character = "Under-Square (Torque)";
      characterColor = "text-amber-400";
    }

    // Mean Piston Speed at 8,000 RPM (m/s)
    const meanPistonSpeed = Math.round(((2 * (stroke / 1000) * 8000) / 60) * 10) / 10;

    return {
      totalDisplacementCc,
      displacementLiters,
      boreStrokeRatio,
      rodStrokeRatio,
      character,
      characterColor,
      meanPistonSpeed,
    };
  }, [bore, stroke, rodLength, cylinders]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* ── 3-CARD SECTION LAYOUT ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
        
        {/* CARD 1 (LEFT): ARCHITECTURE & DIMENSIONS */}
        <SectionCard
          title="Architecture & Bore/Stroke"
          subtitle="Cylinder arrangement, displacement geometry & kinematics"
          icon={<Cog size={18} />}
          accent="cyan"
          badge={
            <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/80 border border-cyan-500/40 px-2 py-0.5 rounded-full font-bold shadow-[0_0_10px_rgba(34,211,238,0.2)]">
              {kinematics.displacementLiters}L • {cylinders} CYL
            </span>
          }
        >
          <div className="space-y-4">
            {/* Cylinder Bank Layout Grid */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider block">
                  Cylinder Bank Layout
                </label>
                <span className="text-[10px] font-mono text-slate-500">
                  {ENGINE_LAYOUTS[engineConfig.layout]?.label}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-1.5 max-h-52 overflow-y-auto pr-1 no-scrollbar">
                {engineLayouts.map((layout) => {
                  const isSelected = engineConfig.layout === layout;
                  const meta = LAYOUT_META[layout] || {
                    icon: <Cog size={12} />,
                    tag: ENGINE_LAYOUTS[layout]?.label,
                    angle: "Standard",
                  };

                  return (
                    <button
                      key={layout}
                      type="button"
                      onClick={() => updateEngine({ layout })}
                      className={`relative py-2 px-2 text-[11px] font-mono font-bold flex flex-col items-center justify-center rounded-xl border transition-all duration-200 cursor-pointer text-center group ${
                        isSelected
                          ? "bg-gradient-to-b from-cyan-500/25 to-cyan-950/80 text-cyan-200 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.35)] scale-[1.02]"
                          : "bg-slate-950/70 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700 hover:bg-slate-900/60"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className={isSelected ? "text-cyan-300" : "text-slate-500 group-hover:text-slate-300"}>
                          {meta.icon}
                        </span>
                        <span className="truncate">{ENGINE_LAYOUTS[layout]?.label}</span>
                      </div>
                      <span className="text-[9px] text-slate-500 font-normal">
                        {meta.angle}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Live Kinematic Telemetry Bar */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-cyan-500/20 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-400 flex items-center gap-1">
                  <Activity size={12} className="text-cyan-400" /> Displacement:
                </span>
                <span className="text-cyan-300 font-extrabold">
                  {kinematics.totalDisplacementCc.toLocaleString()} cc ({kinematics.displacementLiters}L)
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono pt-1 border-t border-slate-800/80">
                <div>
                  <span className="text-slate-500 block">B/S Ratio:</span>
                  <span className={`font-bold ${kinematics.characterColor}`}>
                    {kinematics.boreStrokeRatio} ({kinematics.character})
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">R/S Ratio:</span>
                  <span className="font-bold text-slate-300">
                    {kinematics.rodStrokeRatio} ({kinematics.rodStrokeRatio >= 1.7 ? "Low Friction" : "High Torque"})
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                Geometry Presets
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {BORE_STROKE_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() =>
                      updateEngine({
                        bore: preset.bore,
                        stroke: preset.stroke,
                        rodLength: preset.rod,
                      })
                    }
                    className="py-1 px-2 text-[10px] font-mono text-slate-300 bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 hover:text-cyan-300 rounded-lg transition-all text-left flex items-center justify-between"
                  >
                    <span>{preset.label}</span>
                    <span className="text-[9px] text-slate-500">{preset.bore}x{preset.stroke}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Bore & Stroke Sliders */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <Slider
                label="Cylinder Bore"
                value={bore}
                min={60}
                max={110}
                unit="mm"
                onChange={(v) => updateEngine({ bore: v })}
              />
              <Slider
                label="Piston Stroke"
                value={stroke}
                min={60}
                max={110}
                unit="mm"
                onChange={(v) => updateEngine({ stroke: v })}
              />
              <Slider
                label="Connecting Rod Length"
                value={rodLength}
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
          icon={<Layers size={18} />}
          accent="purple"
          badge={
            <span className="text-[10px] font-mono text-purple-300 bg-purple-950/80 border border-purple-500/40 px-2 py-0.5 rounded-full font-bold shadow-[0_0_10px_rgba(192,132,252,0.2)]">
              {componentMeta?.variants.length || 4} ALLOY TIERS
            </span>
          }
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
          subtitle="Structural mass, live 2D schematic & engineering telemetry"
          icon={<Activity size={18} />}
          accent="emerald"
          badge={
            <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold shadow-[0_0_10px_rgba(52,211,153,0.2)]">
              LIVE COMPUTED
            </span>
          }
        >
          <StatDeltasPanel
            componentMeta={componentMeta}
            selectedVariant={selectedVariant}
            currentTotalStats={currentTotalStats}
            bore={bore}
            stroke={stroke}
            rodLength={rodLength}
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
